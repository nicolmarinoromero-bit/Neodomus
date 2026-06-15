from collections.abc import Generator
# PARA: Importa Generator desde collections.abc para anotar que la función get_db es un generador.
# IMPACTO: Permite tipar correctamente la función que produce sesiones de base de datos.

from typing import Union
# PARA: Importa Union para anotar que get_current_user puede retornar un objeto User o Cliente.
# IMPACTO: Mejora la claridad del código y la verificación de tipos.

from fastapi import Depends, HTTPException, status
# PARA: Importa Depends (inyección de dependencias), HTTPException (errores HTTP) y status (códigos HTTP).
# IMPACTO: Se usa para crear dependencias y lanzar errores con códigos adecuados.

from fastapi.security import OAuth2PasswordBearer
# PARA: Importa OAuth2PasswordBearer para crear el esquema de autenticación OAuth2.
# IMPACTO: Define cómo se extrae el token JWT del header Authorization: Bearer.

from sqlalchemy import select
# PARA: Importa la función select de SQLAlchemy para construir consultas de forma explícita.
# IMPACTO: Permite consultas más legibles y tipadas en comparación con db.query().

from sqlalchemy.orm import Session
# PARA: Importa el tipo Session para tipar la sesión de base de datos.
# IMPACTO: Ayuda a la verificación de tipos y documentación.

from app.database import SessionLocal
# PARA: Importa SessionLocal (fábrica de sesiones) desde app.database.
# IMPACTO: Permite crear sesiones de base de datos locales. Depende de la configuración de database.py.

from app.models.cliente import Cliente
# PARA: Importa el modelo Cliente.
# IMPACTO: Se usa para consultar clientes por email.

from app.models.user import User
# PARA: Importa el modelo User (empleados).
# IMPACTO: Se usa para consultar empleados por email.

from app.utils.security import decode_token
# PARA: Importa la función decode_token desde utils.security.
# IMPACTO: Permite decodificar y validar tokens JWT sin lanzar excepciones (retorna None si es inválido).

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
# PARA: Crea el esquema OAuth2 con la URL de login (usada para documentación). No valida el token automáticamente.
# IMPACTO: Se usa como dependencia para obtener el token de la request. Si no hay token, lanza HTTP 401 automáticamente (por defecto, a diferencia del otro archivo que tenía auto_error=False).

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# PARA: Función generadora que crea una sesión, la entrega y la cierra al finalizar.
# IMPACTO: Dependencia de FastAPI para inyectar sesiones de BD en endpoints. Garantiza que cada request tenga su propia sesión y que se cierre correctamente.

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Union[User, Cliente]:
    credentials_exception = HTTPException(401, "Credenciales inválidas", headers={"WWW-Authenticate": "Bearer"})
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise credentials_exception
    email = payload.get("sub")
    user_type = payload.get("user_type")
    role_from_token = payload.get("role")
    if not email or user_type not in ("employee", "client"):
        raise credentials_exception
    if user_type == "employee":
        user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if not user or not user.is_active:
            raise credentials_exception
        setattr(user, "role", role_from_token)
        return user
    else:
        client = db.execute(select(Cliente).where(Cliente.email == email)).scalar_one_or_none()
        if not client or not client.is_active:
            raise credentials_exception
        return client
# PARA: Dependencia principal que valida el token, extrae email y tipo, consulta en BD y retorna el objeto User o Cliente correspondiente. Si el usuario es empleado, además asigna dinámicamente un atributo `role` con el valor obtenido del token (campo "role" en payload).
# IMPACTO: Se usa como base para get_current_employee y get_current_client. A diferencia de la versión anterior, lanza excepción automática si falta token (por OAuth2PasswordBearer). Además, asigna el rol desde el token en lugar de consultarlo de la BD. Esto puede ser más rápido pero menos seguro si el rol cambia y el token no se refresca. La excepción es genérica "Credenciales inválidas" por seguridad.

def get_current_employee(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    user = get_current_user(token, db)
    if not isinstance(user, User):
        raise HTTPException(403, "Solo empleados")
    return user
# PARA: Dependencia que obtiene el usuario actual y verifica que sea un empleado (User).
# IMPACTO: Se usa en rutas exclusivas para empleados. Si el token pertenece a un cliente, retorna HTTP 403 Forbidden.

def get_current_client(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Cliente:
    user = get_current_user(token, db)
    if not isinstance(user, Cliente):
        raise HTTPException(403, "Solo clientes")
    return user
# PARA: Dependencia que obtiene el usuario actual y verifica que sea un cliente.
# IMPACTO: Similar a get_current_employee, pero para rutas de clientes.

def require_role(required_role: str):
    def role_check(current_user: User = Depends(get_current_employee)):
        if getattr(current_user, "role", None) != required_role:
            raise HTTPException(403, f"Se requiere rol '{required_role}'")
        return current_user
    return role_check
# PARA: Decorador/dependencia que verifica que el empleado autenticado tenga un rol específico (admin, técnico, etc.). El rol se obtiene del atributo `role` que fue asignado desde el token en get_current_user.
# IMPACTO: Permite autorización granular. Se usa como `require_role("admin")` en endpoints. Nota: depende de que el payload del token incluya el campo "role" (no "rol" como en otros archivos). Si no está presente, fallará.