from datetime import datetime
# PARA: Importa la clase datetime para trabajar con fechas y horas.
# IMPACTO: Permite usar el tipo datetime en el campo created_at del esquema EmployeeResponse.

from typing import Optional
# PARA: Importa Optional para anotar campos que pueden ser None.
# IMPACTO: Permite definir atributos opcionales como id_tipo_documento_u, documento_usuario, etc.

from pydantic import BaseModel, ConfigDict, EmailStr
# PARA: Importa BaseModel (para definir esquemas), ConfigDict (configuración del modelo) y EmailStr (validador de correos).
# IMPACTO: BaseModel convierte la clase en validador; ConfigDict permite opciones como from_attributes; EmailStr valida automáticamente el formato de email.

class EmployeeResponse(BaseModel):
# PARA: Define el esquema de respuesta para devolver datos de un empleado (usuario con rol empleado).
# IMPACTO: Se usa en endpoints como /users/me y /users/ para serializar objetos User de la base de datos a JSON.

    id_usuario: int
# PARA: Campo obligatorio entero con el identificador único del empleado.
# IMPACTO: Permite al frontend referenciar al empleado.

    first_name: str
# PARA: Campo obligatorio con el nombre del empleado.
# IMPACTO: Se muestra en la interfaz.

    last_name: str
# PARA: Campo obligatorio con el apellido del empleado.
# IMPACTO: Similar a first_name.

    id_tipo_documento_u: Optional[int] = None
# PARA: Campo opcional entero para el tipo de documento del empleado.
# IMPACTO: Si existe en BD se incluye; si no, None.

    documento_usuario: Optional[int] = None
# PARA: Campo opcional para el número de documento del empleado.
# IMPACTO: Opcional; se devuelve None si no está en BD.

    telefono_usuario: Optional[int] = None
# PARA: Campo opcional para el teléfono del empleado.
# IMPACTO: Opcional.

    email: EmailStr
# PARA: Campo obligatorio con el correo electrónico, validado con EmailStr.
# IMPACTO: Asegura formato válido del email devuelto.

    is_active: bool
# PARA: Campo obligatorio booleano que indica si la cuenta del empleado está activa.
# IMPACTO: Permite al frontend saber si puede iniciar sesión.

    id_rol_u: Optional[int] = None
# PARA: Campo opcional con el ID del rol del empleado.
# IMPACTO: Permite conocer el rol (admin, técnico, etc.) para control de permisos en el frontend.

    created_at: datetime
# PARA: Campo obligatorio con la fecha y hora de creación del empleado.
# IMPACTO: Útil para auditoría y para mostrar fecha de registro.

    model_config = ConfigDict(from_attributes=True)
# PARA: Configura el modelo para permitir creación desde atributos de objetos ORM (SQLAlchemy).
# IMPACTO: Permite hacer `EmployeeResponse.model_validate(empleado)` directamente.

# app/schemas/user.py (añade al final)
# PARA: Comentario que indica que lo siguiente se añadió al final del archivo.
# IMPACTO: Solo documentación; no afecta la ejecución.

class UserBase(BaseModel):
# PARA: Esquema base con campos comunes para usuario (empleado).
# IMPACTO: Sirve como clase padre para UserCreate y UserOut, evitando repetir campos.

    email: EmailStr
# PARA: Email obligatorio con validación de formato.
# IMPACTO: Heredado por UserCreate y UserOut.

    first_name: str
# PARA: Nombre del usuario.
# IMPACTO: Obligatorio.

    last_name: str
# PARA: Apellido del usuario.
# IMPACTO: Obligatorio.

class UserCreate(UserBase):
# PARA: Esquema para crear un nuevo usuario (empleado). Hereda de UserBase.
# IMPACTO: Se usaría en un endpoint POST /users (si existiera) para validar los datos de creación.

    password: str
# PARA: Contraseña en texto plano (será hasheada antes de guardar).
# IMPACTO: Obligatoria; debería tener validaciones de fortaleza (aunque aquí no se incluyen).

class UserOut(UserBase):
# PARA: Esquema de respuesta para un usuario (similar a EmployeeResponse pero con menos campos).
# IMPACTO: Puede usarse en endpoints que no necesitan mostrar todos los detalles (ej. lista simple de usuarios).

    id_usuario: int
# PARA: ID del usuario.
# IMPACTO: Obligatorio en respuesta.

    is_active: bool
# PARA: Estado de actividad.
# IMPACTO: Se incluye en respuesta.

    created_at: datetime
# PARA: Fecha de creación.
# IMPACTO: Se incluye en respuesta.

    model_config = ConfigDict(from_attributes=True)
# PARA: Configuración para permitir conversión desde ORM.
# IMPACTO: Facilita la serialización.