from collections.abc import Generator
from typing import Union
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.cliente import Cliente
from app.models.user import User
from app.utils.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

def get_current_employee(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    user = get_current_user(token, db)
    if not isinstance(user, User):
        raise HTTPException(403, "Solo empleados")
    return user

def get_current_client(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Cliente:
    user = get_current_user(token, db)
    if not isinstance(user, Cliente):
        raise HTTPException(403, "Solo clientes")
    return user

def require_role(required_role: str):
    def role_check(current_user: User = Depends(get_current_employee)):
        if getattr(current_user, "role", None) != required_role:
            raise HTTPException(403, f"Se requiere rol '{required_role}'")
        return current_user
    return role_check