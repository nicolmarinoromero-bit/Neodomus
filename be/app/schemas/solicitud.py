from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict


class SolicitudCreate(BaseModel):
    tipo: Literal["inhabilitar", "habilitar"]
    motivo: Optional[str] = None


class SolicitudResponse(BaseModel):
    id: int
    id_cliente: int
    tipo: str
    estado: str
    motivo: Optional[str] = None
    created_at: Optional[datetime] = None
    resuelta_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AdminSolicitudResponse(BaseModel):
    id: int
    id_cliente: int
    tipo: str
    estado: str
    motivo: Optional[str] = None
    created_at: Optional[datetime] = None
    resuelta_at: Optional[datetime] = None
    cliente_nombre: str
    cliente_email: str

    model_config = ConfigDict(from_attributes=True)