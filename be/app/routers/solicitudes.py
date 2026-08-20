from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.cliente import Cliente
from app.models.roles_usuario import RolesUsuario
from app.models.solicitud_cuenta import SolicitudCuenta
from app.models.user import User
from app.schemas.solicitud import AdminSolicitudResponse
from app.utils.security import get_current_employee

router = APIRouter(prefix="/admin/account-requests", tags=["Solicitudes de cuenta"])

TIPOS_ACTIVACION = {"inhabilitar": False, "habilitar": True}


def _admin(
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
) -> User:
    role = db.execute(
        select(RolesUsuario.nombre_rol).where(RolesUsuario.id_rol == current_user.id_rol_u)
    ).scalar_one_or_none()
    if role not in ("admin", "administrador"):
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    return current_user


def _to_response(solicitud: SolicitudCuenta, cliente: Cliente) -> AdminSolicitudResponse:
    return AdminSolicitudResponse(
        id=solicitud.id,
        id_cliente=solicitud.id_cliente,
        tipo=solicitud.tipo,
        estado=solicitud.estado,
        motivo=solicitud.motivo,
        created_at=solicitud.created_at,
        resuelta_at=solicitud.resuelta_at,
        cliente_nombre=f"{cliente.first_name} {cliente.last_name}".strip(),
        cliente_email=cliente.email,
    )


@router.get("", response_model=List[AdminSolicitudResponse])
def listar_solicitudes(
    current_admin: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Lista todas las solicitudes de inhabilitación/habilitación (solo admin)"""
    solicitudes = (
        db.query(SolicitudCuenta)
        .join(Cliente, Cliente.id_cliente == SolicitudCuenta.id_cliente)
        .order_by(SolicitudCuenta.created_at.desc())
        .all()
    )
    clientes = {c.id_cliente: c for c in db.query(Cliente).all()}
    return [_to_response(s, clientes[s.id_cliente]) for s in solicitudes if s.id_cliente in clientes]


def _resolver(solicitud_id: int, db: Session, aprobar: bool, admin: User) -> AdminSolicitudResponse:
    solicitud = db.query(SolicitudCuenta).filter(SolicitudCuenta.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    if solicitud.estado != "pendiente":
        raise HTTPException(status_code=400, detail="La solicitud ya fue resuelta")
    cliente = db.query(Cliente).get(solicitud.id_cliente)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    solicitud.estado = "aprobada" if aprobar else "rechazada"
    solicitud.resuelta_por = admin.id_usuario
    solicitud.resuelta_at = datetime.utcnow()
    if aprobar and solicitud.tipo in TIPOS_ACTIVACION:
        cliente.is_active = TIPOS_ACTIVACION[solicitud.tipo]

    db.commit()
    db.refresh(solicitud)
    return _to_response(solicitud, cliente)


@router.put("/{solicitud_id}/aprobar", response_model=AdminSolicitudResponse)
def aprobar_solicitud(
    solicitud_id: int,
    admin: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Aprueba la solicitud: inhabilita o habilita la cuenta según el tipo"""
    return _resolver(solicitud_id, db, aprobar=True, admin=admin)


@router.put("/{solicitud_id}/rechazar", response_model=AdminSolicitudResponse)
def rechazar_solicitud(
    solicitud_id: int,
    admin: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Rechaza la solicitud de inhabilitación/habilitación"""
    return _resolver(solicitud_id, db, aprobar=False, admin=admin)