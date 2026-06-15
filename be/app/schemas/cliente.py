from typing import Optional
# PARA: Importa Optional para anotar campos que pueden ser None.
# IMPACTO: Permite definir atributos opcionales en el esquema, mejorando la claridad y la verificación de tipos.

from pydantic import BaseModel, ConfigDict, EmailStr
# PARA: Importa BaseModel (para definir esquemas), ConfigDict (configuración del modelo) y EmailStr (validador de correos electrónicos).
# IMPACTO: BaseModel convierte la clase en un validador de datos; ConfigDict permite opciones como from_attributes; EmailStr valida automáticamente el formato de email.

class ClientResponse(BaseModel):
# PARA: Define el esquema de respuesta para devolver datos de un cliente (por ejemplo, después de login o consulta de perfil).
# IMPACTO: Este esquema se usa en endpoints como /clients/me o en respuestas de autenticación. Define qué campos del cliente se exponen y en qué formato.

    id_cliente: int
# PARA: Campo obligatorio de tipo entero que representa el identificador único del cliente.
# IMPACTO: Se incluye siempre en la respuesta. Proviene de la base de datos y permite al frontend referenciar al cliente.

    first_name: str
# PARA: Campo obligatorio con el nombre del cliente.
# IMPACTO: Se devuelve como string; útil para mostrar en la interfaz.

    last_name: str
# PARA: Campo obligatorio con el apellido del cliente.
# IMPACTO: Similar a first_name.

    id_tipo_documento_c: Optional[int] = None
# PARA: Campo opcional (puede ser None) de tipo entero, que representa el tipo de documento del cliente.
# IMPACTO: Si existe en la base de datos, se incluye; si no, el valor será None. Permite flexibilidad.

    documento_cliente: Optional[int] = None
# PARA: Campo opcional para el número de documento del cliente.
# IMPACTO: Opcional, mismo comportamiento.

    telefono_cliente: Optional[int] = None
# PARA: Campo opcional para el teléfono del cliente.
# IMPACTO: Opcional; si no está en BD, se devuelve None.

    email: EmailStr
# PARA: Campo obligatorio con el correo electrónico, validado con EmailStr.
# IMPACTO: Asegura que el email devuelto tenga formato válido; útil para mostrarlo en el frontend.

    address: Optional[str] = None
# PARA: Campo opcional para la dirección del cliente.
# IMPACTO: Se incluye solo si existe en la base de datos.

    is_active: bool
# PARA: Campo obligatorio booleano que indica si la cuenta del cliente está activa.
# IMPACTO: Permite al frontend saber si el cliente puede iniciar sesión o necesita verificación.

    model_config = ConfigDict(from_attributes=True)
# PARA: Configura el modelo Pydantic para que pueda ser creado directamente desde instancias de modelos SQLAlchemy (ORM).
# IMPACTO: Permite hacer `ClientResponse.model_validate(cliente)` donde `cliente` es un objeto del modelo `Cliente`. Esto convierte automáticamente los atributos del ORM al esquema de respuesta, simplificando el código en los endpoints.