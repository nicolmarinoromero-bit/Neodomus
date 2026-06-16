from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.cliente import Cliente
from app.utils.security import get_current_client

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.get("/me")
def get_my_profile(current_client: Cliente = Depends(get_current_client)):
    return current_client