from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.cliente import Cliente
from app.models.solicitud_cuenta import SolicitudCuenta
from app.schemas.cliente import ClientResponse, ClientUpdate
from app.schemas.solicitud import SolicitudCreate, SolicitudResponse
from app.utils.security import get_current_client

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.get("/me", response_model=ClientResponse)
def get_my_profile(current_client: Cliente = Depends(get_current_client)):
    return current_client

@router.get("/me/cuenta-solicitud", response_model=SolicitudResponse)
def get_mi_solicitud(
    current_client: Cliente = Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Devuelve la solicitud más reciente del cliente (inhabilitar/habilitar)"""
    solicitud = (
        db.query(SolicitudCuenta)
        .filter(SolicitudCuenta.id_cliente == current_client.id_cliente)
        .order_by(SolicitudCuenta.created_at.desc())
        .first()
    )
    if not solicitud:
        raise HTTPException(status_code=404, detail="No hay solicitudes")
    return solicitud

@router.post("/me/cuenta-solicitud", response_model=SolicitudResponse)
def crear_solicitud(
    data: SolicitudCreate,
    current_client: Cliente = Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Crea una solicitud de inhabilitación de cuenta para que el administrador la apruebe.
    La cuenta no se deshabilita automáticamente."""
    if data.tipo == "habilitar" and current_client.is_active:
        raise HTTPException(status_code=400, detail="Tu cuenta ya está activa")
    pendiente = (
        db.query(SolicitudCuenta)
        .filter(
            SolicitudCuenta.id_cliente == current_client.id_cliente,
            SolicitudCuenta.estado == "pendiente",
        )
        .first()
    )
    if pendiente:
        raise HTTPException(status_code=400, detail="Ya tienes una solicitud pendiente de revisión")
    solicitud = SolicitudCuenta(
        id_cliente=current_client.id_cliente,
        tipo=data.tipo,
        motivo=data.motivo,
        estado="pendiente",
    )
    db.add(solicitud)
    db.commit()
    db.refresh(solicitud)
    return solicitud

@router.put("/me", response_model=ClientResponse)
def update_my_profile(
    data: ClientUpdate,
    current_client: Cliente = Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Actualiza el perfil del cliente autenticado"""
    update_data = data.model_dump(exclude_unset=True)
    if "email" in update_data:
        existing = db.query(Cliente).filter(
            Cliente.email == update_data["email"], Cliente.id_cliente != current_client.id_cliente
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="El email ya está en uso")
    for field, value in update_data.items():
        setattr(current_client, field, value)
    db.commit()
    db.refresh(current_client)
    return current_client