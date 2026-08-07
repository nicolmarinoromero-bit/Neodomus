from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.cliente import Cliente
from app.models.cita import Cita
from app.schemas.cita import CitaCreate, CitaUpdate, CitaResponse
from app.utils.security import get_current_client

router = APIRouter(prefix="/citas", tags=["Citas"])

ESTADOS_EDITABLES = ("Pendiente", "Confirmada")


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
    cita = Cita(id_cliente=client.id_cliente, **data.model_dump(), estado="Pendiente")
    db.add(cita)
    db.commit()
    db.refresh(cita)
    return cita


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
