from typing import List, Optional
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.tecnico import Tecnico
from app.models.roles_usuario import RolesUsuario
from app.models.user import User
from app.models.cita import Cita
from app.services.especialidades import compatible_especialidad, tecnico_ocupado
from app.utils.security import get_current_employee

router = APIRouter(prefix="/tecnicos", tags=["Técnicos"])


class TecnicoAdminResponse(BaseModel):
    id_tecnico: int
    id_usuario: int
    first_name: str
    last_name: str
    email: str
    telefono_usuario: int | None = None
    documento_usuario: int | None = None
    certificacion_t: str | None = None
    cargo_t: str | None = None
    is_active: bool
    created_at: datetime | None = None


class TecnicoUpdate(BaseModel):
    certificacion: str | None = None
    cargo: str | None = None


class TecnicoPublicoResponse(BaseModel):
    id_tecnico: int
    first_name: str
    last_name: str
    certificacion_t: str | None = None
    cargo_t: str | None = None
    is_active: bool
    disponible: bool = True


def _serializar_publico(t: Tecnico) -> TecnicoPublicoResponse:
    u = t.usuario
    return TecnicoPublicoResponse(
        id_tecnico=t.id_tecnico,
        first_name=u.first_name if u else "",
        last_name=u.last_name if u else "",
        certificacion_t=t.certificacion_t,
        cargo_t=t.cargo_t,
        is_active=u.is_active if u else False,
        disponible=bool(u and u.is_active),
    )


def _admin(
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
) -> User:
    role = db.execute(select(RolesUsuario.nombre_rol).where(RolesUsuario.id_rol == current_user.id_rol_u)).scalar_one_or_none()
    if role not in ("admin", "administrador"):
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    return current_user


def _serializar(t: Tecnico) -> TecnicoAdminResponse:
    u = t.usuario
    return TecnicoAdminResponse(
        id_tecnico=t.id_tecnico,
        id_usuario=u.id_usuario if u else 0,
        first_name=u.first_name if u else "",
        last_name=u.last_name if u else "",
        email=u.email if u else "",
        telefono_usuario=u.telefono_usuario if u else None,
        documento_usuario=u.documento_usuario if u else None,
        certificacion_t=t.certificacion_t,
        cargo_t=t.cargo_t,
        is_active=u.is_active if u else False,
        created_at=u.created_at if u else None,
    )


@router.get("/publicos", response_model=List[TecnicoPublicoResponse])
def listar_tecnicos_publicos(
    db: Session = Depends(get_db),
    tipo_servicio: Optional[str] = None,
    fecha: Optional[date] = None,
    hora: Optional[str] = None,
):
    """Lista los técnicos reales del sistema (acceso público, solo datos básicos).

    Usado por las páginas de cliente para agendar citas con técnicos reales.

    Filtros opcionales:
    - tipo_servicio: devuelve solo técnicos cuya especialidad permite el servicio.
    - fecha + hora: marca `disponible=False` a los técnicos ocupados con una
      cita activa en ese horario.
    """
    tecnicos = db.query(Tecnico).order_by(Tecnico.id_tecnico.asc()).all()
    resultado: list[TecnicoPublicoResponse] = []
    for t in tecnicos:
        if tipo_servicio and not compatible_especialidad(tipo_servicio, t.certificacion_t):
            continue
        item = _serializar_publico(t)
        if fecha is not None and hora is not None:
            ocupado = tecnico_ocupado(db, t.id_tecnico, fecha, hora)
            item.disponible = item.is_active and not ocupado
        resultado.append(item)
    return resultado


@router.get("", response_model=List[TecnicoAdminResponse])
def listar_tecnicos(
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Lista los técnicos reales registrados en el sistema (solo admin)"""
    tecnicos = db.query(Tecnico).order_by(Tecnico.id_tecnico.asc()).all()
    return [_serializar(t) for t in tecnicos]


@router.get("/unassigned", response_model=List[int])
def listar_usuarios_tecnicos_sin_ficha_admin(
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Ids de usuarios con rol técnico que aún no tienen ficha en la tabla tecnicos"""
    ficha_ids = [t.id_usuario_t for t in db.query(Tecnico).all()]
    usuarios_tecnicos = (
        db.query(User.id_usuario)
        .filter(User.id_rol_u == 2, User.is_active == True)  # noqa: E712
        .all()
    )
    return [u[0] for u in usuarios_tecnicos if u[0] not in ficha_ids]


@router.put("/{tecnico_id}", response_model=TecnicoAdminResponse)
def actualizar_tecnico(
    tecnico_id: int,
    data: TecnicoUpdate,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Actualiza la ficha técnica (especialidad y cargo) de un técnico (solo admin)"""
    tecnico = db.query(Tecnico).filter(Tecnico.id_tecnico == tecnico_id).first()
    if not tecnico:
        raise HTTPException(status_code=404, detail="Técnico no encontrado")
    if data.certificacion is not None:
        tecnico.certificacion_t = data.certificacion
    if data.cargo is not None:
        tecnico.cargo_t = data.cargo
    db.commit()
    db.refresh(tecnico)
    return _serializar(tecnico)


@router.delete("/{tecnico_id}", response_model=dict)
def eliminar_tecnico(
    tecnico_id: int,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Elimina la ficha técnica de un usuario (solo admin)"""
    tecnico = db.query(Tecnico).filter(Tecnico.id_tecnico == tecnico_id).first()
    if not tecnico:
        raise HTTPException(status_code=404, detail="Técnico no encontrado")
    db.delete(tecnico)
    db.commit()
    return {"msg": "Ficha de técnico eliminada", "id": tecnico_id}

