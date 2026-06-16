from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr

class ClientResponse(BaseModel):
    id_cliente: int
    first_name: str
    last_name: str
    id_tipo_documento_c: Optional[int] = None
    documento_cliente: Optional[int] = None
    telefono_cliente: Optional[int] = None
    email: EmailStr
    address: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)