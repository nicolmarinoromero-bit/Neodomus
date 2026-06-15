from fastapi import APIRouter, Depends, HTTPException, Request
# PARA: Importa APIRouter para crear grupos de rutas, Depends para inyección de dependencias, HTTPException para errores HTTP, y Request para acceder a datos de la petición (como IP).
# IMPACTO: Permite estructurar las rutas de autenticación, manejar dependencias (como sesión de base de datos), lanzar errores controlados y obtener la dirección IP del cliente.

from sqlalchemy.orm import Session
# PARA: Importa el tipo Session de SQLAlchemy para tipar la sesión de base de datos.
# IMPACTO: Ayuda a la verificación de tipos y documenta que las funciones reciben una sesión de base de datos.

from pydantic import BaseModel
# PARA: Importa BaseModel de Pydantic para definir modelos de validación de datos.
# IMPACTO: Permite crear esquemas simples adicionales para validar cuerpos de solicitud (como ForgotPasswordRequest).

from typing import Optional
# PARA: Importa Optional para anotaciones de tipos (aunque no se usa directamente en este archivo, podría estar para otros modelos).
# IMPACTO: Permite indicar que un valor puede ser None, mejorando la claridad del código.

from app.database import get_db
# PARA: Importa la dependencia get_db que provee una sesión de SQLAlchemy.
# IMPACTO: Se usará en los endpoints para obtener una sesión de base de datos y gestionar transacciones.

from app.services.auth_service import (
    register_client,
    verify_client_email,
    resend_verification_code,
    login,
    refresh_access_token,
    change_password,
    request_password_reset,
    verify_password_reset_code,
    reset_password,
)
# PARA: Importa las funciones de lógica de negocio desde el servicio de autenticación.
# IMPACTO: Separa la lógica de la capa de rutas, manteniendo los endpoints delgados y reutilizables.

from app.schemas.auth import (
    ClientCreate,
    UserLogin,
    TokenResponse,
    ChangePasswordRequest,
    ResetPasswordRequest,
    VerifyCodeRequest,
)
# PARA: Importa esquemas Pydantic definidos en app/schemas/auth para validar y serializar datos.
# IMPACTO: Asegura que los datos de entrada cumplan con las reglas de negocio y que las respuestas tengan formato consistente.

from app.utils.security import get_current_user
# PARA: Importa la dependencia get_current_user que extrae y valida el usuario a partir del token JWT.
# IMPACTO: Se usa en rutas protegidas para obtener el usuario autenticado; si el token es inválido, lanza HTTP 401.

router = APIRouter(prefix="/auth", tags=["Authentication"])
# PARA: Crea una instancia de APIRouter con prefijo "/auth" y etiqueta "Authentication".
# IMPACTO: Todas las rutas definidas en este archivo comenzarán con /auth (ej. /auth/login) y aparecerán agrupadas en la documentación automática de FastAPI (Swagger).

# Modelos adicionales para simplificar
class ForgotPasswordRequest(BaseModel):
    email: str
# PARA: Define un modelo Pydantic simple para la solicitud de olvido de contraseña, que solo requiere email.
# IMPACTO: Valida que el cuerpo de la petición POST /forgot-password contenga un campo email de tipo string.

class ResetPasswordCodeRequest(BaseModel):
    token: str
    new_password: str
# PARA: Define un modelo para la solicitud de restablecimiento de contraseña usando token (en lugar de email+código).
# IMPACTO: Valida que se envíen token y nueva contraseña. Se usa en el endpoint /reset-password.

class ResendVerificationRequest(BaseModel):
    email: str
# PARA: Define un modelo para reenviar código de verificación, con el email del usuario.
# IMPACTO: Valida que se proporcione un email al solicitar reenvío de código.

# ============================================================
# Registro y verificación de email (con pendientes)
# ============================================================

@router.post("/register/client", response_model=dict)
async def register_client_endpoint(client_data: ClientCreate, db: Session = Depends(get_db)):
    """Registra un cliente de forma pendiente. Se guarda en pending_registrations hasta verificar el código."""
    result = await register_client(db, client_data)
    return result
# PARA: Define un endpoint POST en /auth/register/client que recibe datos de cliente (ClientCreate) y la sesión de BD.
# IMPACTO: Llama asincrónicamente a register_client del servicio, que guarda en pending_registrations y envía código. Devuelve un diccionario (ej. {msg: "..."}). El decorador response_model=dict indica que la respuesta es un JSON arbitrario.

@router.post("/verify-email")
def verify_email_endpoint(code: str, db: Session = Depends(get_db)):
    """
    Verifica el código de registro.
    Si es correcto, crea el cliente en la tabla 'clientes' y elimina el registro pendiente.
    """
    verify_client_email(db, code)
    return {"msg": "Email verificado correctamente. Ya puedes iniciar sesión."}
# PARA: Endpoint POST /auth/verify-email que recibe un código como query parameter (code) y la sesión de BD.
# IMPACTO: Llama a verify_client_email (función síncrona) que valida el código. Si es correcto, crea el cliente y elimina el pendiente. Retorna mensaje de éxito.

@router.post("/resend-verification")
async def resend_verification_endpoint(req: ResendVerificationRequest, db: Session = Depends(get_db)):
    """Reenvía un nuevo código de verificación para un registro pendiente."""
    return await resend_verification_code(db, req.email)
# PARA: Endpoint POST /auth/resend-verification que recibe un objeto ResendVerificationRequest con email.
# IMPACTO: Llama asincrónicamente a resend_verification_code, que genera un nuevo código, lo guarda en pending_registrations y lo reenvía por email. Devuelve el resultado.

# ============================================================
# Login y autenticación
# ============================================================

@router.post("/login", response_model=TokenResponse)
def login_endpoint(login_data: UserLogin, db: Session = Depends(get_db)):
    return login(db, login_data)
# PARA: Endpoint POST /auth/login que recibe credenciales (email y password) validadas por UserLogin.
# IMPACTO: Llama a login (síncrono) que autentica al usuario (cliente o empleado) y retorna un TokenResponse con access_token, refresh_token y tipo.

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    return refresh_access_token(db, refresh_token)
# PARA: Endpoint POST /auth/refresh que recibe un refresh_token como string en el cuerpo (no especifica query, se espera body). 
# IMPACTO: Llama a refresh_access_token para generar un nuevo access token a partir del refresh token válido. Retorna TokenResponse.

@router.post("/change-password")
def change_password_endpoint(
    req: ChangePasswordRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    ip = request.client.host if request else None
    change_password(db, current_user, req, ip)
    return {"msg": "Contraseña actualizada correctamente"}
# PARA: Endpoint POST /auth/change-password protegido por dependencia get_current_user. Recibe ChangePasswordRequest (con current_password y new_password).
# IMPACTO: Obtiene el usuario autenticado, extrae su IP del request, y llama a change_password para validar la contraseña actual y cambiarla. Retorna mensaje de éxito.

# ============================================================
# Recuperación de contraseña
# ============================================================

@router.post("/forgot-password")
async def forgot_password(
    req: ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    await request_password_reset(db, req.email, request.client.host)
    return {"msg": "Si el email está registrado, recibirás un código de recuperación"}
# PARA: Endpoint POST /auth/forgot-password que recibe email y obtiene la IP del request.
# IMPACTO: Llama asincrónicamente a request_password_reset, que busca el usuario (cliente o empleado), genera un token/código, lo guarda en password_reset_tokens y envía email con código. No revela si el email existe por seguridad.

@router.post("/verify-code")
def verify_code(req: VerifyCodeRequest, db: Session = Depends(get_db)):
    """
    Valida el código de recuperación de contraseña (sin cambiarla aún).
    """
    verify_password_reset_code(db, req.email, req.code)
    return {"valid": True, "message": "Código válido. Ahora puedes restablecer tu contraseña."}
# PARA: Endpoint POST /auth/verify-code que recibe VerifyCodeRequest (email y code).
# IMPACTO: Llama a verify_password_reset_code, que verifica si el código es válido y no ha expirado. Retorna indicación de validez (no cambia la contraseña).

@router.post("/reset-password")
def reset_password_endpoint(
    req: ResetPasswordCodeRequest,
    db: Session = Depends(get_db)
):
    reset_req = ResetPasswordRequest(token=req.token, new_password=req.new_password)
    reset_password(db, reset_req)
    return {"msg": "Contraseña actualizada correctamente"}
# PARA: Endpoint POST /auth/reset-password que recibe un token (código) y nueva contraseña.
# IMPACTO: Construye un objeto ResetPasswordRequest (aunque el esquema espera token, no email+code) y llama a reset_password, que valida el token, marca como usado y actualiza la contraseña del usuario correspondiente. Retorna mensaje de éxito.
