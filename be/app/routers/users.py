from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.schemas.user import EmployeeResponse  # ← importa el schema existente
from app.utils.security import get_current_employee, require_roles

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=EmployeeResponse)
def get_me(current_user: User = Depends(get_current_employee)):
    """Obtiene el perfil del empleado autenticado"""
    return current_user

@router.get("/", response_model=List[EmployeeResponse])
@require_roles("admin")
def get_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Lista todos los empleados (solo admin)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users