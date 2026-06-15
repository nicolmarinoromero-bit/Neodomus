from fastapi import APIRouter, Depends, HTTPException
# PARA: Importa APIRouter para crear un grupo de rutas, Depends para inyección de dependencias, y HTTPException para lanzar errores HTTP controlados.
# IMPACTO: Permite estructurar las rutas de usuarios, manejar dependencias (sesión de BD, autenticación) y devolver respuestas de error como 404 o 403.

from sqlalchemy.orm import Session
# PARA: Importa el tipo Session de SQLAlchemy para tipar la sesión de base de datos.
# IMPACTO: Ayuda en la verificación de tipos y documenta que ciertas funciones usan la sesión de BD.

from typing import List
# PARA: Importa List para anotaciones de tipos de listas.
# IMPACTO: Permite tipar respuestas que son listas de EmployeeResponse, mejorando la claridad y el soporte del IDE.

from app.database import get_db
# PARA: Importa la función get_db que provee una sesión de SQLAlchemy.
# IMPACTO: Se usa como dependencia para obtener una sesión de base de datos y gestionar automáticamente el cierre de la conexión.

from app.models.user import User
# PARA: Importa el modelo User (tabla "usuarios") que representa a los empleados.
# IMPACTO: Permite realizar consultas a la tabla de usuarios/empleados usando SQLAlchemy ORM.

from app.schemas.user import EmployeeResponse  # ← importa el schema existente
# PARA: Importa el esquema Pydantic EmployeeResponse definido en app/schemas/user para serializar respuestas de empleados.
# IMPACTO: Define la estructura y validación de los datos de empleados que se devuelven al cliente (oculta campos sensibles como password_hash).

from app.utils.security import get_current_employee, require_roles
# PARA: Importa la dependencia get_current_employee (extrae el empleado autenticado desde token JWT) y el decorador require_roles (restringe por roles).
# IMPACTO: get_current_employee asegura que solo usuarios empleados autenticados puedan acceder; require_roles aplica control de acceso basado en roles.

router = APIRouter(prefix="/users", tags=["Users"])
# PARA: Crea una instancia de APIRouter con el prefijo "/users" y la etiqueta "Users".
# IMPACTO: Todas las rutas definidas aquí comenzarán con /users (ej. /users/me, /users/) y aparecerán agrupadas en la documentación Swagger bajo la etiqueta "Users".

@router.get("/me", response_model=EmployeeResponse)
def get_me(current_user: User = Depends(get_current_employee)):
    """Obtiene el perfil del empleado autenticado"""
    return current_user
# PARA: Define un endpoint GET en /users/me que depende de get_current_employee (inyecta el empleado autenticado). La respuesta sigue el esquema EmployeeResponse.
# IMPACTO: El empleado debe enviar un token JWT válido. El endpoint retorna los datos del empleado actual (nombre, email, rol, etc.), útil para mostrar el perfil en el panel de control.

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
# PARA: Endpoint GET en /users/ que lista empleados paginados. Depende de get_db (sesión BD) y tiene parámetros de paginación skip y limit. Requiere rol "admin" mediante el decorador. La respuesta es una lista de EmployeeResponse.
# IMPACTO: Solo administradores pueden listar todos los empleados. Se aplica offset y limit para paginación eficiente. Retorna los datos básicos de cada empleado (sin campos sensibles).