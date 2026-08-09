from typing import List, Optional
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.tecnico import Tecnico
from app.models.cliente import Cliente
from app.models.roles_usuario import RolesUsuario
from app.models.user import User
from app.models.cita import Cita
from app.services.especialidades import compatible_especialidad, tecnico_ocupado
from app.utils.security import get_current_employee

ESTADOS_CITA = ("Pendiente", "Confirmada", "Finalizada", "Cancelada")

ESTADOS_ID = {1: "Pendiente", 2: "Confirmada", 3: "Finalizada", 4: "Cancelada"}

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


class EstadoCitaUpdate(BaseModel):
    estado: str | None = None
    estado_id: int | None = None


class TecnicoCitaResponse(BaseModel):
    id_cita: int
    fecha: date
    hora: str
    estado: str
    tipo_servicio: str
    cliente: str
    telefono: int | None = None
    direccion: str
    descripcion: str | None = None
    id_tecnico: int | None = None
    nombre_tecnico: str | None = None


class TecnicoClienteResponse(BaseModel):
    id_cliente: int
    nombre: str
    email: str | None = None
    telefono: int | None = None
    direccion: str | None = None
    citas_count: int


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


def _ficha_tecnico_actual(db: Session, current_user: User) -> Tecnico:
    """Ficha del técnico autenticado (o error 404 si no tiene ficha)"""
    tecnico = (
        db.query(Tecnico)
        .filter(Tecnico.id_usuario_t == current_user.id_usuario)
        .first()
    )
    if not tecnico:
        raise HTTPException(
            status_code=404,
            detail="No hay ficha de técnico asociada a tu cuenta",
        )
    return tecnico


def _serializar_cita_tecnico(db: Session, cita: Cita) -> TecnicoCitaResponse:
    """Serializa una cita con el nombre y teléfono del cliente asociado"""
    cliente = (
        db.query(Cliente).filter(Cliente.id_cliente == cita.id_cliente).first()
    )
    return TecnicoCitaResponse(
        id_cita=cita.id_cita,
        fecha=cita.fecha,
        hora=cita.hora,
        estado=cita.estado,
        tipo_servicio=cita.tipo_servicio,
        cliente=f"{cliente.first_name} {cliente.last_name}".strip() if cliente else "Cliente",
        telefono=cliente.telefono_cliente if cliente else None,
        direccion=cita.direccion,
        descripcion=cita.descripcion,
        id_tecnico=cita.id_tecnico,
        nombre_tecnico=cita.nombre_tecnico,
    )


@router.get("/mis-clientes", response_model=List[TecnicoClienteResponse])
def mis_clientes_tecnico(
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """Clientes con los que el técnico autenticado tiene (o tuvo) citas,
    ordenados alfabéticamente, con el número de citas por cliente."""
    tecnico = _ficha_tecnico_actual(db, current_user)
    filas = (
        db.query(Cita.id_cliente, func.count(Cita.id_cita))
        .filter(Cita.id_tecnico == tecnico.id_tecnico)
        .group_by(Cita.id_cliente)
        .all()
    )
    if not filas:
        return []
    ids = [fila[0] for fila in filas]
    clientes = {
        c.id_cliente: c
        for c in db.query(Cliente).filter(Cliente.id_cliente.in_(ids)).all()
    }
    resultado: list[TecnicoClienteResponse] = []
    for id_cliente, cantidad in filas:
        c = clientes.get(id_cliente)
        if not c:
            continue
        resultado.append(
            TecnicoClienteResponse(
                id_cliente=c.id_cliente,
                nombre=f"{c.first_name} {c.last_name}".strip() or "Cliente",
                email=c.email,
                telefono=c.telefono_cliente,
                direccion=c.address,
                citas_count=cantidad,
            )
        )
    resultado.sort(key=lambda r: r.nombre.lower())
    return resultado


@router.get("/mis-citas", response_model=List[TecnicoCitaResponse])
def mis_citas_tecnico(
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """Citas asignadas al técnico autenticado, ordenadas por fecha y hora"""
    tecnico = _ficha_tecnico_actual(db, current_user)
    citas = (
        db.query(Cita)
        .filter(Cita.id_tecnico == tecnico.id_tecnico)
        .order_by(Cita.fecha.asc(), Cita.hora.asc())
        .all()
    )
    return [_serializar_cita_tecnico(db, cita) for cita in citas]


@router.put("/citas/{cita_id}/estado", response_model=TecnicoCitaResponse)
def actualizar_estado_cita_tecnico(
    cita_id: int,
    data: EstadoCitaUpdate,
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """El técnico actualiza el estado de una cita que le fue asignada"""
    tecnico = _ficha_tecnico_actual(db, current_user)
    cita = (
        db.query(Cita)
        .filter(Cita.id_cita == cita_id, Cita.id_tecnico == tecnico.id_tecnico)
        .first()
    )
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    if data.estado is not None:
        nuevo_estado = data.estado
    elif data.estado_id is not None:
        nuevo_estado = ESTADOS_ID.get(data.estado_id)
        if nuevo_estado is None:
            raise HTTPException(status_code=400, detail="estado_id no válido")
    else:
        raise HTTPException(status_code=400, detail="Indica un estado válido")
    if nuevo_estado not in ESTADOS_CITA:
        raise HTTPException(status_code=400, detail="Estado de cita no válido")
    cita.estado = nuevo_estado
    db.commit()
    db.refresh(cita)
    return _serializar_cita_tecnico(db, cita)

