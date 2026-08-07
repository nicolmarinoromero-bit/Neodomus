"""
Módulo: services/auth_service.py
Lógica de negocio para autenticación en Neodomus.
"""

import random
from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models.cliente import Cliente
from app.models.email_verification_token import EmailVerificationToken
from app.models.password_reset_token import PasswordResetToken
from app.models.pending_registration import PendingRegistration
from app.models.roles_usuario import RolesUsuario
from app.models.solicitud_cuenta import SolicitudCuenta
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    ClientCreate,
    ResetPasswordRequest,
    TokenResponse,
    UserLogin,
)
from app.utils.audit_log import (
    log_email_verified,
    log_login_failed,
    log_login_success,
    log_password_changed,
    log_password_reset_requested,
)
from app.utils.email import send_password_reset_code, send_verification_email
from app.utils.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

# ──────────────────────────────────────────────────────────────────
# 🔍 Funciones auxiliares
# ──────────────────────────────────────────────────────────────────

def _get_user_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()

def _get_client_by_email(db: Session, email: str) -> Cliente | None:
    return db.execute(select(Cliente).where(Cliente.email == email)).scalar_one_or_none()

# 🔥 _create_tokens ahora recibe "rol" (no "role")
def _create_tokens(email: str, user_type: str, rol: str = None) -> TokenResponse:
    access = create_access_token({"sub": email}, user_type=user_type, rol=rol)
    refresh = create_refresh_token({"sub": email}, user_type=user_type, rol=rol)
    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        token_type="bearer",
        user_type=user_type,
        rol=rol,
    )

# ──────────────────────────────────────────────────────────────────
# 📝 Registro y verificación de clientes (con pendientes)
# ──────────────────────────────────────────────────────────────────

async def register_client(db: Session, client_data: ClientCreate) -> dict:
    if _get_client_by_email(db, client_data.email):
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    pending = db.query(PendingRegistration).filter(PendingRegistration.email == client_data.email).first()
    if pending:
        db.delete(pending)
        db.commit()
    hashed = hash_password(client_data.password)
    code = str(random.randint(100000, 999999))
    expires = datetime.utcnow() + timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)
    new_pending = PendingRegistration(
        first_name=client_data.first_name.upper(),
        last_name=client_data.last_name.upper(),
        id_tipo_documento_c=client_data.id_tipo_documento_c,
        documento_cliente=client_data.documento_cliente,
        telefono_cliente=client_data.telefono_cliente,
        email=client_data.email,
        address=client_data.address,
        password_hash=hashed,
        code=code,
        expires_at=expires,
    )
    db.add(new_pending)
    db.commit()
    await send_verification_email(client_data.email, code)
    return {"msg": "Registro pendiente. Revisa tu correo para el código de verificación."}

def verify_client_email(db: Session, code: str) -> None:
    pending = db.query(PendingRegistration).filter(PendingRegistration.code == code).first()
    if not pending or pending.expires_at < datetime.utcnow():
        raise HTTPException(400, "Código inválido o expirado")
    new_client = Cliente(
        first_name=pending.first_name,
        last_name=pending.last_name,
        id_tipo_documento_c=pending.id_tipo_documento_c,
        documento_cliente=pending.documento_cliente,
        telefono_cliente=pending.telefono_cliente,
        email=pending.email,
        address=pending.address,
        password_hash=pending.password_hash,
        is_active=True,
    )
    db.add(new_client)
    db.delete(pending)
    db.commit()
    log_email_verified(pending.email)

async def resend_verification_code(db: Session, email: str) -> dict:
    pending = db.query(PendingRegistration).filter(PendingRegistration.email == email).first()
    if not pending:
        raise HTTPException(404, "No hay registro pendiente para este email")
    new_code = str(random.randint(100000, 999999))
    pending.code = new_code
    pending.expires_at = datetime.utcnow() + timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)
    db.commit()
    await send_verification_email(email, new_code)
    return {"msg": "Nuevo código enviado"}

# ──────────────────────────────────────────────────────────────────
# 📨 Solicitud de habilitación de cuenta (cuenta inhabilitada)
# ──────────────────────────────────────────────────────────────────

def solicitar_habilitacion(db: Session, email: str, password: str) -> dict:
    """Verifica las credenciales del cliente y crea una solicitud de
    habilitación para que el administrador la apruebe. La cuenta NO
    se habilita automáticamente."""
    client = _get_client_by_email(db, email)
    if not client or not verify_password(password, client.password_hash):
        raise HTTPException(401, "Credenciales inválidas")
    if client.is_active:
        raise HTTPException(400, "Tu cuenta ya está activa")
    pendiente = (
        db.query(SolicitudCuenta)
        .filter(
            SolicitudCuenta.id_cliente == client.id_cliente,
            SolicitudCuenta.estado == "pendiente",
        )
        .first()
    )
    if pendiente:
        raise HTTPException(400, "Ya tienes una solicitud pendiente de revisión")
    solicitud = SolicitudCuenta(id_cliente=client.id_cliente, tipo="habilitar", estado="pendiente")
    db.add(solicitud)
    db.commit()
    return {"msg": "Solicitud de habilitación enviada al administrador"}

# ──────────────────────────────────────────────────────────────────
# 🔐 Login unificado (con rol)
# ──────────────────────────────────────────────────────────────────

def login(db: Session, login_data: UserLogin) -> TokenResponse:
    email = login_data.email
    password = login_data.password
    user_type = login_data.user_type

    if user_type == "employee":
        user = _get_user_by_email(db, email)
        if not user or not verify_password(password, user.password_hash):
            log_login_failed(email, "invalid_credentials", "employee")
            raise HTTPException(401, "Credenciales inválidas")
        if not user.is_active:
            log_login_failed(email, "account_inactive", "employee")
            raise HTTPException(403, "Cuenta desactivada")
        role_name = None
        if user.id_rol_u:
            rol = db.execute(select(RolesUsuario.nombre_rol).where(RolesUsuario.id_rol == user.id_rol_u)).scalar_one_or_none()
            role_name = rol
        if not role_name:
            role_name = "empleado"
        log_login_success(email, "employee")
        return _create_tokens(email, "employee", rol=role_name)

    if user_type == "client":
        client = _get_client_by_email(db, email)
        if not client or not verify_password(password, client.password_hash):
            log_login_failed(email, "invalid_credentials", "client")
            raise HTTPException(401, "Credenciales inválidas")
        if not client.is_active:
            log_login_failed(email, "account_inactive", "client")
            raise HTTPException(403, "Tu cuenta está inhabilitada")
        log_login_success(email, "client")
        return _create_tokens(email, "client", rol="cliente")

    # Login sin especificar user_type (prueba primero cliente, luego empleado)
    client = _get_client_by_email(db, email)
    if client and verify_password(password, client.password_hash):
        if not client.is_active:
            log_login_failed(email, "account_inactive", "client")
            raise HTTPException(403, "Tu cuenta está inhabilitada")
        log_login_success(email, "client")
        return _create_tokens(email, "client", rol="cliente")

    user = _get_user_by_email(db, email)
    if user and verify_password(password, user.password_hash):
        if not user.is_active:
            log_login_failed(email, "account_inactive", "employee")
            raise HTTPException(403, "Cuenta desactivada")
        role_name = None
        if user.id_rol_u:
            rol = db.execute(select(RolesUsuario.nombre_rol).where(RolesUsuario.id_rol == user.id_rol_u)).scalar_one_or_none()
            role_name = rol
        if not role_name:
            role_name = "empleado"
        log_login_success(email, "employee")
        return _create_tokens(email, "employee", rol=role_name)

    log_login_failed(email, "invalid_credentials")
    raise HTTPException(401, "Credenciales inválidas")

# ──────────────────────────────────────────────────────────────────
# 🔄 Refresco de token
# ──────────────────────────────────────────────────────────────────

def refresh_access_token(db: Session, refresh_token: str) -> TokenResponse:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(401, "Refresh token inválido")
    email = payload.get("sub")
    user_type = payload.get("user_type")
    if not email or user_type not in ("employee", "client"):
        raise HTTPException(401, "Token malformado")
    if user_type == "employee":
        user = _get_user_by_email(db, email)
        if not user or not user.is_active:
            raise HTTPException(401, "Usuario no válido")
        rol = payload.get("rol")
        return _create_tokens(email, "employee", rol=rol)
    else:
        client = _get_client_by_email(db, email)
        if not client or not client.is_active:
            raise HTTPException(401, "Cliente no válido")
        return _create_tokens(email, "client", rol="cliente")

# ──────────────────────────────────────────────────────────────────
# 🔒 Cambio de contraseña
# ──────────────────────────────────────────────────────────────────

def change_password(db: Session, current_user: User | Cliente, req: ChangePasswordRequest, ip: str = None) -> None:
    if isinstance(current_user, User):
        stored_hash = current_user.password_hash
        email = current_user.email
        user_type = "employee"
        user_id = current_user.id_usuario
    else:
        stored_hash = current_user.password_hash
        email = current_user.email
        user_type = "client"
        user_id = current_user.id_cliente
    if not verify_password(req.current_password, stored_hash):
        raise HTTPException(400, "Contraseña actual incorrecta")
    new_hash = hash_password(req.new_password)
    if isinstance(current_user, User):
        current_user.password_hash = new_hash
    else:
        current_user.password_hash = new_hash
    db.commit()
    log_password_changed(str(user_id), user_type, ip)

# ──────────────────────────────────────────────────────────────────
# 📧 Recuperación de contraseña (código de 6 dígitos)
# ──────────────────────────────────────────────────────────────────

async def request_password_reset(db: Session, email: str, ip: str = None) -> None:
    client = _get_client_by_email(db, email)
    user_type = None
    if client:
        user_type = "client"
    else:
        user = _get_user_by_email(db, email)
        if user:
            user_type = "employee"
    if not user_type:
        log_password_reset_requested(ip=ip)
        return
    code = str(random.randint(100000, 999999))
    expires = datetime.utcnow() + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
    token_record = PasswordResetToken(
        email=email,
        user_type=user_type,
        code=code,
        token=None,
        expires_at=expires,
    )
    db.add(token_record)
    db.commit()
    log_password_reset_requested(email=email, user_type=user_type, ip=ip)
    await send_password_reset_code(email, code, user_type)

def verify_password_reset_code(db: Session, email: str, code: str) -> None:
    token_rec = db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.email == email,
            PasswordResetToken.code == code,
            PasswordResetToken.used == False,
            PasswordResetToken.expires_at > datetime.utcnow()
        )
    ).scalar_one_or_none()
    if not token_rec:
        raise HTTPException(400, "Código inválido o expirado")

def reset_password(db: Session, req: ResetPasswordRequest) -> None:
    code = req.token
    token_rec = db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.code == code,
            PasswordResetToken.used == False,
            PasswordResetToken.expires_at > datetime.utcnow()
        )
    ).scalar_one_or_none()
    if not token_rec:
        raise HTTPException(400, "Código inválido o expirado")
    email = token_rec.email
    user_type = token_rec.user_type
    if user_type == "client":
        entity = _get_client_by_email(db, email)
        if not entity:
            raise HTTPException(400, "Cliente no encontrado")
        entity.password_hash = hash_password(req.new_password)
    else:
        entity = _get_user_by_email(db, email)
        if not entity:
            raise HTTPException(400, "Usuario no encontrado")
        entity.password_hash = hash_password(req.new_password)
    token_rec.used = True
    db.commit()