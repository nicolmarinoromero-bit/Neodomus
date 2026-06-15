import re
# PARA: Importa el módulo de expresiones regulares (regex) para validar patrones en cadenas.
# IMPACTO: Permite realizar validaciones complejas como verificar la presencia de mayúsculas, números o caracteres especiales en la contraseña.

from typing import Literal, Optional
# PARA: Importa Literal (para valores fijos como "employee" o "client") y Optional (para campos que pueden ser None).
# IMPACTO: Mejora las anotaciones de tipo y la autodocumentación; Literal restringe valores posibles, Optional permite valores nulos.

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
# PARA: Importa las clases y decoradores principales de Pydantic: BaseModel (para definir esquemas), ConfigDict (configuración del modelo), EmailStr (validación de email), Field (metadatos de campo), field_validator (validadores personalizados).
# IMPACTO: BaseModel convierte las clases en modelos de validación de datos. EmailStr valida automáticamente el formato de correo. Field permite agregar restricciones como max_length. field_validator permite escribir validaciones personalizadas.

def _validate_password_strength(v: str) -> str:
# PARA: Define una función auxiliar (privada) que valida la fortaleza de una contraseña.
# IMPACTO: Se reutiliza en varios esquemas (ClientCreate, ChangePasswordRequest, ResetPasswordRequest) para evitar duplicar la lógica.

    if len(v) < 8:
        raise ValueError("Debe tener al menos 8 caracteres")
    if not re.search(r"[A-Z]", v):
        raise ValueError("Debe contener una mayúscula")
    if not re.search(r"[a-z]", v):
        raise ValueError("Debe contener una minúscula")
    if not re.search(r"\d", v):
        raise ValueError("Debe contener un número")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
        raise ValueError("Debe contener al menos un carácter especial (!@#$%^&* etc.)")
    return v
# PARA: Estas líneas verifican que la contraseña tenga al menos 8 caracteres, una mayúscula, una minúscula, un dígito y un carácter especial.
# IMPACTO: Garantiza que las contraseñas sean robustas, reduciendo riesgos de seguridad. Si falla alguna condición, lanza un ValueError que Pydantic convierte automáticamente en un error de validación 422.

class ClientCreate(BaseModel):
# PARA: Define el esquema para crear un nuevo cliente (registro inicial antes de verificación).
# IMPACTO: Valida los datos enviados al endpoint /auth/register/client. Asegura que el formato sea correcto antes de llegar a la lógica de negocio.

    first_name: str = Field(..., max_length=100)
# PARA: Campo obligatorio (... indica requerido) de tipo string, con longitud máxima de 100 caracteres.
# IMPACTO: Valida que el nombre no esté vacío y no exceda 100 caracteres; ayuda a prevenir errores de base de datos.

    last_name: str = Field(..., max_length=100)
# PARA: Campo obligatorio para el apellido, también con máximo 100 caracteres.
# IMPACTO: Similar a first_name.

    email: EmailStr
# PARA: Campo email que debe cumplir el formato de correo electrónico estándar (usando EmailStr de Pydantic).
# IMPACTO: Valida automáticamente que el email sea válido (contenga @, dominio, etc.) sin necesidad de regex manual.

    password: str
# PARA: Campo de contraseña como string plano.
# IMPACTO: Se validará mediante el field_validator para verificar su fortaleza. Nota: No se debe almacenar directamente, sino hashear.

    id_tipo_documento_c: Optional[int] = None
# PARA: Campo opcional para el tipo de documento (entero). Por defecto None.
# IMPACTO: Permite que el usuario no envíe este campo; si se envía, debe ser entero.

    documento_cliente: Optional[int] = None
# PARA: Campo opcional para el número de documento del cliente.
# IMPACTO: Puede ser nulo; si se proporciona, debe ser entero.

    telefono_cliente: Optional[int] = None
# PARA: Campo opcional para el teléfono.
# IMPACTO: Igual que documento_cliente.

    address: Optional[str] = None
# PARA: Campo opcional para la dirección.
# IMPACTO: Puede ser nulo; si se envía, debe ser string.

    @field_validator("password")
    def validate_password(cls, v: str) -> str:
        return _validate_password_strength(v)
# PARA: Aplica el validador de fortaleza de contraseña al campo "password".
# IMPACTO: Cada vez que se crea un ClientCreate, la contraseña se valida; si es débil, se devuelve error 422 con los requisitos.

    @field_validator("first_name", "last_name")
    def validate_names(cls, v: str) -> str:
        v = v.strip().upper()
        if len(v) < 2:
            raise ValueError("Mínimo 2 caracteres")
        return v
# PARA: Valida los campos first_name y last_name: elimina espacios al inicio/final, convierte a mayúsculas y verifica longitud mínima de 2 caracteres.
# IMPACTO: Estandariza el formato de nombres (mayúsculas) y asegura que no estén vacíos ni sean muy cortos.

class UserLogin(BaseModel):
# PARA: Esquema para el inicio de sesión (login).
# IMPACTO: Valida los datos enviados a /auth/login.

    email: EmailStr
# PARA: Email obligatorio con formato válido.
# IMPACTO: Asegura que el campo email tenga formato de correo.

    password: str
# PARA: Contraseña en texto plano (se validará contra el hash almacenado en la lógica de negocio).
# IMPACTO: No se valida fortaleza aquí porque es una credencial existente.

    user_type: Optional[Literal["employee", "client"]] = None
# PARA: Campo opcional que puede ser exactamente "employee" o "client". Por defecto None.
# IMPACTO: Permite al backend decidir en qué tabla buscar (clientes o usuarios empleados). Si no se envía, podría intentar ambas.

class ChangePasswordRequest(BaseModel):
# PARA: Esquema para solicitar cambio de contraseña (usuario autenticado).
# IMPACTO: Usado en /auth/change-password.

    current_password: str
# PARA: Contraseña actual requerida para verificar identidad.
# IMPACTO: La lógica de negocio la comparará con el hash almacenado.

    new_password: str
# PARA: Nueva contraseña a establecer.
# IMPACTO: Se valida con el campo validator.

    @field_validator("new_password")
    def validate_new(cls, v: str) -> str:
        return _validate_password_strength(v)
# PARA: Aplica la misma validación de fortaleza a la nueva contraseña.
# IMPACTO: Asegura que la nueva contraseña sea segura.

class ForgotPasswordRequest(BaseModel):
# PARA: Esquema para solicitar restablecimiento de contraseña (olvidé mi contraseña).
# IMPACTO: Usado en /auth/forgot-password, solo requiere email.

    email: EmailStr
# PARA: Email del usuario que solicita recuperación.
# IMPACTO: Valida formato de email; la lógica de negocio verifica si existe sin revelar información.

class ResetPasswordRequest(BaseModel):
# PARA: Esquema para restablecer la contraseña usando un token de 6 dígitos.
# IMPACTO: Usado en /auth/reset-password.

    token: str = Field(min_length=6, max_length=6)
# PARA: Token (código) de 6 caracteres, requerido.
# IMPACTO: Fuerza que el token tenga exactamente 6 dígitos; útil para códigos numéricos.

    new_password: str
# PARA: Nueva contraseña.
# IMPACTO: Se valida con el field_validator.

    @field_validator("new_password")
    def validate_new(cls, v: str) -> str:
        return _validate_password_strength(v)
# PARA: Misma validación de fortaleza para la nueva contraseña.
# IMPACTO: Garantiza la seguridad de la nueva credencial.

class RefreshTokenRequest(BaseModel):
# PARA: Esquema para refrescar el token de acceso usando refresh_token.
# IMPACTO: Usado en /auth/refresh (aunque en el router se recibe un string directamente, este esquema podría usarse si se espera un objeto).

    refresh_token: str
# PARA: El refresh token JWT.
# IMPACTO: La lógica de negocio lo validará y generará un nuevo access token.

class VerifyEmailRequest(BaseModel):
# PARA: Esquema para verificar email mediante código.
# IMPACTO: Podría usarse en endpoints de verificación.

    code: str = Field(min_length=6, max_length=6)
# PARA: Código de verificación de exactamente 6 caracteres.
# IMPACTO: Asegura que el código tenga formato correcto.

class VerifyCodeRequest(BaseModel):
# PARA: Esquema para verificar código de recuperación de contraseña (antes de restablecer).
# IMPACTO: Usado en /auth/verify-code.

    email: EmailStr
# PARA: Email del usuario.
# IMPACTO: Asocia el código a un email específico.

    code: str = Field(min_length=6, max_length=6)
# PARA: Código de 6 dígitos.
# IMPACTO: Valida longitud del código.

class TokenResponse(BaseModel):
# PARA: Esquema de respuesta para login y refresh, con el formato de tokens JWT.
# IMPACTO: Define la estructura que devuelven los endpoints de autenticación.

    access_token: str
# PARA: Token de acceso (corto plazo).
# IMPACTO: El cliente debe incluirlo en el header Authorization: Bearer.

    refresh_token: str
# PARA: Token de refresco (mayor duración).
# IMPACTO: Permite obtener nuevos access tokens sin reautenticar.

    token_type: str = "bearer"
# PARA: Tipo de token, por defecto "bearer".
# IMPACTO: Indica el esquema de autenticación (estándar OAuth2).

    user_type: Literal["employee", "client"]
# PARA: Tipo de usuario: "employee" o "client".
# IMPACTO: El frontend puede usar esta información para redirigir a paneles diferentes.

    rol: Optional[str] = None
# PARA: Rol del usuario (solo relevante para empleados, ej. "admin", "tecnico").
# IMPACTO: Permite control de permisos en el frontend; opcional porque los clientes no tienen rol.

    model_config = ConfigDict(from_attributes=True)
# PARA: Configura el modelo Pydantic para permitir creación desde objetos ORM (SQLAlchemy) usando from_attributes=True (en lugar de orm_mode en v1).
# IMPACTO: Facilita la conversión de instancias de modelos de base de datos a respuestas JSON, por ejemplo `TokenResponse.model_validate(user)`.

class MessageResponse(BaseModel):
# PARA: Esquema simple para respuestas de mensaje (éxito o error genérico).
# IMPACTO: Estandariza respuestas que solo necesitan un campo "message".

    message: str
# PARA: Texto del mensaje.
# IMPACTO: Permite devolver información legible al cliente.