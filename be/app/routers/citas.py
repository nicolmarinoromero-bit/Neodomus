from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel

from app.database import get_db
from app.models.cliente import Cliente
from app.models.roles_usuario import RolesUsuario
from app.models.cita import Cita
from app.models.tecnico import Tecnico
from app.models.user import User
from app.schemas.cita import CitaCreate, CitaUpdate, CitaResponse
from app.services.especialidades import compatible_especialidad, tecnico_ocupado
from app.utils.security import get_current_client, get_current_employee

router = APIRouter(prefix="/citas", tags=["Citas"])

ESTADOS_EDITABLES = ("Pendiente", "Confirmada")

ESTADOS_CITA = ("Pendiente", "Confirmada", "Finalizada", "Cancelada")


class AdminCitaUpdate(BaseModel):
    estado: Optional[str] = None
    id_tecnico: Optional[int] = None
    nombre_tecnico: Optional[str] = None


class AdminCitaResponse(CitaResponse):
    cliente_nombre: Optional[str] = None
    cliente_email: Optional[str] = None


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


def _nombre_tecnico_real(db: Session, id_tecnico: int) -> str | None:
    """Devuelve el nombre real del técnico (join a usuarios) o None si no existe."""
    if id_tecnico is None:
        return None
    tecnico = db.query(Tecnico).filter(Tecnico.id_tecnico == id_tecnico).first()
    if not tecnico or not tecnico.usuario:
        return None
    u = tecnico.usuario
    return f"{u.first_name} {u.last_name}".strip()


def _validar_tecnico_cita(
    db: Session,
    id_tecnico: Optional[int],
    tipo_servicio: str,
    fecha: date,
    hora: str,
    excluir_cita_id: Optional[int] = None,
) -> None:
    """Valida que el técnico exista, tenga la especialidad del servicio y
    esté libre en la fecha y hora indicadas. Lanza HTTPException si no."""
    if id_tecnico is None:
        return
    tecnico = db.query(Tecnico).filter(Tecnico.id_tecnico == id_tecnico).first()
    if not tecnico or not tecnico.usuario or not tecnico.usuario.is_active:
        raise HTTPException(status_code=400, detail="El técnico seleccionado no existe o no está activo")
    if not compatible_especialidad(tipo_servicio, tecnico.certificacion_t):
        raise HTTPException(
            status_code=400,
            detail=f"El técnico seleccionado no tiene la especialidad requerida para el servicio de {tipo_servicio}",
        )
    if tecnico_ocupado(db, id_tecnico, fecha, hora, excluir_cita_id):
        raise HTTPException(
            status_code=400,
            detail="El técnico seleccionado no está disponible en esa fecha y hora",
        )


@router.get("/all-admin", response_model=List[AdminCitaResponse])
def listar_citas_admin(
    current_admin: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Lista todas las citas/instalaciones del sistema (solo admin)"""
    citas = (
        db.query(Cita)
        .order_by(Cita.fecha.desc(), Cita.hora.desc())
        .all()
    )
    clientes = {c.id_cliente: c for c in db.query(Cliente).all()}
    respuesta = []
    for cita in citas:
        data = AdminCitaResponse(
            id_cita=cita.id_cita,
            id_cliente=cita.id_cliente,
            id_tecnico=cita.id_tecnico,
            nombre_tecnico=cita.nombre_tecnico,
            tipo_servicio=cita.tipo_servicio,
            fecha=cita.fecha,
            hora=cita.hora,
            direccion=cita.direccion,
            descripcion=cita.descripcion,
            estado=cita.estado,
            created_at=cita.created_at,
            cliente_nombre=None,
            cliente_email=None,
        )
        cliente = clientes.get(cita.id_cliente)
        if cliente:
            data.cliente_nombre = f"{cliente.first_name} {cliente.last_name}".strip()
            data.cliente_email = cliente.email
        respuesta.append(data)
    return respuesta


def _get_own_cita(cita_id: int, client: Cliente, db: Session) -> Cita:
    cita = (
        db.query(Cita)
        .filter(Cita.id_cita == cita_id, Cita.id_cliente == client.id_cliente)
        .first()
    )
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return cita


@router.post("", response_model=CitaResponse)
def crear_cita(
    data: CitaCreate,
    client: Cliente = Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Registra una nueva cita para el cliente autenticado"""
    if data.fecha < datetime.now().date():
        raise HTTPException(status_code=400, detail="La fecha de la cita no puede ser anterior a hoy")
    # El técnico debe ser uno real: se ignora el nombre enviado por el cliente
    # y se valida especialidad + disponibilidad en la BD.
    nombre_tecnico = None
    if data.id_tecnico is not None:
        _validar_tecnico_cita(
            db,
            data.id_tecnico,
            data.tipo_servicio,
            data.fecha,
            data.hora,
        )
        nombre_tecnico = _nombre_tecnico_real(db, data.id_tecnico)
    cita = Cita(
        id_cliente=client.id_cliente,
        **data.model_dump(exclude={"id_tecnico", "nombre_tecnico"}),
        id_tecnico=data.id_tecnico,
        nombre_tecnico=nombre_tecnico,
        estado="Pendiente",
    )
    db.add(cita)
    db.commit()
    db.refresh(cita)
    return cita


@router.put("/admin/{cita_id}", response_model=AdminCitaResponse)
def gestionar_cita_admin(
    cita_id: int,
    data: AdminCitaUpdate,
    current_admin: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Actualiza estado y técnico asignado de una cita (solo admin)"""
    cita = db.query(Cita).filter(Cita.id_cita == cita_id).first()
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    if data.estado is not None:
        if data.estado not in ESTADOS_CITA:
            raise HTTPException(status_code=400, detail="Estado de cita no válido")
        cita.estado = data.estado
    # Al asignar un técnico se valida que exista, sea compatible con el
    # servicio y esté libre en la fecha/hora (sin contar esta misma cita).
    if "id_tecnico" in data.model_fields_set:
        if data.id_tecnico is None:
            cita.id_tecnico = None
            cita.nombre_tecnico = None
        else:
            _validar_tecnico_cita(
                db,
                data.id_tecnico,
                cita.tipo_servicio,
                cita.fecha,
                cita.hora,
                excluir_cita_id=cita.id_cita,
            )
            cita.id_tecnico = data.id_tecnico
            cita.nombre_tecnico = _nombre_tecnico_real(db, data.id_tecnico)
    elif data.nombre_tecnico is not None:
        cita.nombre_tecnico = data.nombre_tecnico
    db.commit()
    db.refresh(cita)
    cliente = db.query(Cliente).filter(Cliente.id_cliente == cita.id_cliente).first()
    return AdminCitaResponse(
        id_cita=cita.id_cita,
        id_cliente=cita.id_cliente,
        id_tecnico=cita.id_tecnico,
        nombre_tecnico=cita.nombre_tecnico,
        tipo_servicio=cita.tipo_servicio,
        fecha=cita.fecha,
        hora=cita.hora,
        direccion=cita.direccion,
        descripcion=cita.descripcion,
        estado=cita.estado,
        created_at=cita.created_at,
        cliente_nombre=f"{cliente.first_name} {cliente.last_name}".strip() if cliente else None,
        cliente_email=cliente.email if cliente else None,
    )


@router.get("/mis-citas", response_model=List[CitaResponse])
def mis_citas(
    client: Cliente = Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Lista las citas del cliente autenticado, ordenadas por fecha y hora"""
    return (
        db.query(Cita)
        .filter(Cita.id_cliente == client.id_cliente)
        .order_by(Cita.fecha.asc(), Cita.hora.asc())
        .all()
    )


@router.put("/{cita_id}", response_model=CitaResponse)
def editar_cita(
    cita_id: int,
    data: CitaUpdate,
    client: Cliente = Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Actualiza los datos de una cita propia aún modificable"""
    cita = _get_own_cita(cita_id, client, db)
    if cita.estado not in ESTADOS_EDITABLES:
        raise HTTPException(status_code=400, detail="No se puede modificar una cita finalizada o cancelada")
    update_data = data.model_dump(exclude_unset=True)
    if "fecha" in update_data and update_data["fecha"] < datetime.now().date():
        raise HTTPException(status_code=400, detail="La fecha de la cita no puede ser anterior a hoy")
    if cita.id_tecnico is not None:
        _validar_tecnico_cita(
            db,
            cita.id_tecnico,
            update_data.get("tipo_servicio", cita.tipo_servicio),
            update_data.get("fecha", cita.fecha),
            update_data.get("hora", cita.hora),
            excluir_cita_id=cita.id_cita,
        )
    for field, value in update_data.items():
        setattr(cita, field, value)
    # Cualquier modificación regresa la cita a estado Pendiente
    if cita.estado != "Pendiente":
        cita.estado = "Pendiente"
    db.commit()
    db.refresh(cita)
    return cita


@router.delete("/{cita_id}", response_model=CitaResponse)
def cancelar_cita(
    cita_id: int,
    client: Cliente = Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Cancela una cita propia (pasa a estado Cancelada)"""
    cita = _get_own_cita(cita_id, client, db)
    if cita.estado == "Finalizada":
        raise HTTPException(status_code=400, detail="No se puede cancelar una cita ya finalizada")
    cita.estado = "Cancelada"
    db.commit()
    db.refresh(cita)
    return cita
