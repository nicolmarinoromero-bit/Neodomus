from fastapi import APIRouter, Depends
from app.utils.security import get_current_employee, require_roles

router = APIRouter(prefix="/tecnicos", tags=["Técnicos"])

@router.get("/dashboard")
@require_roles("tecnico", "admin")
def tecnico_dashboard(current_user = Depends(get_current_employee)):
    return {"msg": "Bienvenido al panel de técnicos"}