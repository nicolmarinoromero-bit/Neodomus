"""
Módulo: services/auth_service.py
Lógica de negocio para autenticación en Neodomus.
Incluye registro con verificación por código (pending_registrations).
"""
# PARA: Documentar el propósito general del módulo.
# IMPACTO: Ayuda a los desarrolladores a entender rápidamente qué hace este archivo. Es usado por herramientas de documentación automática.

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
# PARA: Importar todas las dependencias necesarias (librerías estándar, FastAPI, SQLAlchemy, modelos, esquemas, utilidades de seguridad, email y auditoría).
# IMPACTO: Permite que el servicio pueda generar números aleatorios, manejar fechas, lanzar errores HTTP, consultar la BD, usar la configuración, crear tokens JWT, hashear contraseñas, enviar correos y registrar eventos de seguridad. Sin estas importaciones, el módulo no funciona.

# ──────────────────────────────────────────────────────────────────
# 🔍 Funciones auxiliares
# ──────────────────────────────────────────────────────────────────

def _get_user_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()

def _get_client_by_email(db: Session, email: str) -> Cliente | None:
    return db.execute(select(Cliente).where(Cliente.email == email)).scalar_one_or_none()

def _create_tokens(email: str, user_type: str, rol: str = None) -> TokenResponse:
    """Crea access y refresh tokens, incluyendo el campo 'rol' en el payload y en la respuesta."""
    access = create_access_token({"sub": email}, user_type=user_type, rol=rol)
    refresh = create_refresh_token({"sub": email}, user_type=user_type, rol=rol)
    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        token_type="bearer",
        user_type=user_type,
        rol=rol,
    )
# PARA: Tres funciones auxiliares privadas: buscar un empleado por email, buscar un cliente por email, y generar tokens JWT empaquetados en TokenResponse.
# IMPACTO: Evitan código duplicado. Centralizan las consultas más comunes y la creación de tokens. Gracias a `_create_tokens`, se incluye el rol en el token y en la respuesta, lo que permite control de permisos en el frontend. Si las búsquedas fallan, retornan None, permitiendo manejar errores en niveles superiores.

# ──────────────────────────────────────────────────────────────────
# 📝 Registro y verificación de clientes (con código de 6 dígitos)
# Se guarda en pending_registrations hasta verificar
# ──────────────────────────────────────────────────────────────────

async def register_client(db: Session, client_data: ClientCreate) -> dict:
    """
    Registra un cliente de forma pendiente.
    No crea el cliente en la tabla 'clientes' hasta que se verifique el código.
    """
    existing_client = _get_client_by_email(db, client_data.email)
    if existing_client:
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
# PARA: Registrar un cliente en tabla temporal (`pending_registrations`) con un código de 6 dígitos y expiración. No se crea el cliente definitivo hasta verificar el código.
# IMPACTO: Implementa verificación por email en dos pasos, previniendo cuentas falsas. El email debe ser verificado antes de poder iniciar sesión. Si ya existía un pendiente anterior, se elimina para evitar duplicados. El código se envía por correo de forma asíncrona. La expiración fuerza al usuario a completar el registro en un tiempo limitado (configurable).

def verify_client_email(db: Session, code: str) -> None:
    """
    Verifica el código de registro. Si es válido y no expirado,
    crea el cliente definitivo en la tabla 'clientes' y elimina el pendiente.
    """
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
# PARA: Validar el código de verificación y, si es correcto, crear el cliente real en `clientes` y eliminar el registro pendiente.
# IMPACTO: Convierte un registro temporal en un cliente activo. La operación es atómica (creación y borrado en una transacción). Se registra en auditoría que el email fue verificado. Sin esta función, el registro pendiente nunca se materializaría.

async def resend_verification_code(db: Session, email: str) -> dict:
    """
    Reenvía un nuevo código de verificación para un registro pendiente.
    """
    pending = db.query(PendingRegistration).filter(PendingRegistration.email == email).first()
    if not pending:
        raise HTTPException(404, "No hay registro pendiente para este email")
    new_code = str(random.randint(100000, 999999))
    pending.code = new_code
    pending.expires_at = datetime.utcnow() + timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)
    db.commit()
    await send_verification_email(email, new_code)
    return {"msg": "Nuevo código enviado"}
# PARA: Reenviar un nuevo código de verificación a un email que tiene un registro pendiente (por si el anterior expiró o no llegó).
# IMPACTO: Mejora la experiencia de usuario: permite solicitar un nuevo código sin tener que volver a registrar todos los datos. También renueva la expiración.

# ──────────────────────────────────────────────────────────────────
# 🔐 Login unificado
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
            raise HTTPException(403, "Cuenta no verificada o desactivada")
        log_login_success(email, "client")
        return _create_tokens(email, "client", rol="cliente")

    # Login sin especificar user_type (prueba primero cliente, luego empleado)
    client = _get_client_by_email(db, email)
    if client and verify_password(password, client.password_hash):
        if not client.is_active:
            log_login_failed(email, "account_inactive", "client")
            raise HTTPException(403, "Cuenta no verificada o desactivada")
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
# PARA: Autenticar tanto a empleados como a clientes usando email y contraseña. Permite especificar `user_type` (employee/client) o dejar que lo detecte automáticamente.
# IMPACTO: Centraliza toda la lógica de login. Valida credenciales, estado activo de la cuenta y registra intentos fallidos/exitosos en auditoría. Devuelve tokens JWT con el rol correspondiente (para empleados, el nombre del rol; para clientes, "cliente"). Si el login falla, no revela si el email existe (respuesta genérica "Credenciales inválidas") por seguridad.

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
# PARA: Recibir un refresh token válido y generar un nuevo par de tokens (access + refresh).
# IMPACTO: Permite mantener la sesión del usuario sin pedir credenciales nuevamente. Verifica que el token exista, sea de tipo "refresh", que el usuario/cliente siga activo, y luego emite nuevos tokens. Mejora la seguridad al tener access tokens de corta duración y refresh tokens de larga duración.

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
# PARA: Cambiar la contraseña de un usuario autenticado (ya sea empleado o cliente). Requiere la contraseña actual y valida su fortaleza (la validación ya ocurre en el schema).
# IMPACTO: Protege el cambio de contraseña exigiendo la actual, evitando cambios no autorizados. Funciona tanto para empleados como para clientes gracias al uso de `isinstance`. Registra en auditoría quién cambió la contraseña y desde qué IP. Una vez cambiada, se debe usar la nueva para futuros logins.

# ──────────────────────────────────────────────────────────────────
# 📧 Recuperación de contraseña (con código de 6 dígitos y expiración en minutos)
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
# PARA: Iniciar el proceso de "olvidé mi contraseña". Genera un código de 6 dígitos, lo guarda en `password_reset_tokens` con expiración (minutos) y envía el código por email.
# IMPACTO: No revela si el email existe (por seguridad, siempre devuelve un mensaje genérico). Si el email no está registrado, solo se loguea la IP. Si existe, se genera un código y se envía. El código es de corta duración (minutos) y debe ser verificado antes de restablecer la contraseña. El campo `token` se deja como None porque aquí solo se usa el código.

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
# PARA: Verificar que el código de recuperación sea válido (existe, no usado, no expirado) para un email dado.
# IMPACTO: Es un paso previo al restablecimiento real. Permite al frontend saber si el código es correcto antes de pedir la nueva contraseña. Lanza error si es inválido.

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
# PARA: Restablecer la contraseña usando un código válido. Busca el token por código (no requiere email porque el código es único), verifica que no esté usado y no expirado, actualiza la contraseña del usuario (cliente o empleado) y marca el token como usado.
# IMPACTO: Finaliza el flujo de recuperación. El código solo puede usarse una vez. La nueva contraseña se hashea antes de guardar. Si el código es inválido o expirado, se rechaza. Después de este proceso, el usuario puede iniciar sesión con la nueva contraseña.