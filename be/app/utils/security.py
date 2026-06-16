import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Union

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.cliente import Cliente
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS

def create_access_token(data: Dict[str, Any], user_type: str = None, rol: str = None) -> str:
    to_encode = data.copy()
    if user_type:
        to_encode["user_type"] = user_type
    if rol:
        to_encode["rol"] = rol
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: Dict[str, Any], user_type: str = None, rol: str = None) -> str:
    to_encode = data.copy()
    if user_type:
        to_encode["user_type"] = user_type
    if rol:
        to_encode["rol"] = rol
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
    payload = decode_token(token)
    if not payload or payload.get("type") != token_type:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    return payload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Union[User, Cliente]:
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    email = payload.get("sub")
    user_type = payload.get("user_type")
    if not email or user_type not in ("employee", "client"):
        raise HTTPException(status_code=401, detail="Payload inválido")
    if user_type == "employee":
        user = db.query(User).filter(User.email == email).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="Usuario no encontrado o inactivo")
        return user
    else:
        client = db.query(Cliente).filter(Cliente.email == email).first()
        if not client or not client.is_active:
            raise HTTPException(status_code=401, detail="Cliente no encontrado o inactivo")
        return client

async def get_current_employee(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    user = await get_current_user(token, db)
    if not isinstance(user, User):
        raise HTTPException(status_code=403, detail="Se requiere rol de empleado")
    return user

async def get_current_client(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Cliente:
    user = await get_current_user(token, db)
    if not isinstance(user, Cliente):
        raise HTTPException(status_code=403, detail="Se requiere rol de cliente")
    return user

def require_roles(*allowed_roles: str):
    def decorator(func):
        async def wrapper(*args, current_user: User = Depends(get_current_employee), **kwargs):
            user_role = getattr(current_user, "nombre_rol", None)
            if not user_role or user_role not in allowed_roles:
                raise HTTPException(status_code=403, detail="Permisos insuficientes")
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator