from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr

class EmployeeResponse(BaseModel):
    id_usuario: int
    first_name: str
    last_name: str
    id_tipo_documento_u: Optional[int] = None
    documento_usuario: Optional[int] = None
    telefono_usuario: Optional[int] = None
    email: EmailStr
    is_active: bool
    id_rol_u: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# app/schemas/user.py (añade al final)

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id_usuario: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono_usuario: Optional[int] = None