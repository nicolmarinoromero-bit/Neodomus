from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.cliente import Cliente
from app.schemas.cliente import ClientResponse, ClientUpdate
from app.utils.security import get_current_client

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.get("/me", response_model=ClientResponse)
def get_my_profile(current_client: Cliente = Depends(get_current_client)):
    return current_client

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