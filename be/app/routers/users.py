from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from app.database import get_db
from app.models.user import User
from app.models.roles_usuario import RolesUsuario
from app.models.tecnico import Tecnico
from app.schemas.user import EmployeeResponse, UserUpdate
from app.utils.security import get_current_employee, require_roles, hash_password

router = APIRouter(prefix="/users", tags=["Users"])


class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    telefono_usuario: Optional[int] = None
    documento_usuario: Optional[int] = None
    id_rol: int = 2
    certificacion: Optional[str] = None
    cargo: Optional[str] = None


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono_usuario: Optional[int] = None
    documento_usuario: Optional[int] = None
    is_active: Optional[bool] = None
    certificacion: Optional[str] = None
    cargo: Optional[str] = None


def _admin(
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
) -> User:
    role = db.execute(select(RolesUsuario.nombre_rol).where(RolesUsuario.id_rol == current_user.id_rol_u)).scalar_one_or_none()
    if role not in ("admin", "administrador"):
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    return current_user


@router.get("/me", response_model=EmployeeResponse)
def get_me(current_user: User = Depends(get_current_employee)):
    return current_user


@router.put("/me", response_model=EmployeeResponse)
def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """Actualiza el perfil del empleado autenticado. El cambio de correo no
    invalida la sesión (los tokens referencian al id_usuario, no al email).
    El rol nunca se modifica desde aquí."""
    update_data = data.model_dump(exclude_unset=True)
    if "email" in update_data:
        email = update_data["email"].lower().strip()
        if email != current_user.email:
            existe = db.query(User).filter(
                User.email == email, User.id_usuario != current_user.id_usuario
            ).first()
            if existe:
                raise HTTPException(status_code=400, detail="El correo ya está registrado")
        update_data["email"] = email
    for campo in ("first_name", "last_name"):
        if campo in update_data and not (update_data[campo] or "").strip():
            raise HTTPException(status_code=400, detail="El nombre y los apellidos no pueden estar vacíos")
        if campo in update_data:
            update_data[campo] = update_data[campo].strip()
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/roles", response_model=List[dict])
def get_roles(_admin_user: User = Depends(_admin), db: Session = Depends(get_db)):
    roles = db.query(RolesUsuario).order_by(RolesUsuario.id_rol.asc()).all()
    return [{"id": r.id_rol, "nombre": r.nombre_rol} for r in roles]


@router.get("/", response_model=List[EmployeeResponse])
@require_roles("admin")
def get_users(
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    return db.query(User).order_by(User.id_usuario.asc()).offset(skip).limit(limit).all()


@router.post("", response_model=dict)
def crear_empleado(
    data: EmployeeCreate,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Registra un nuevo empleado (solo admin). Si el rol es técnico, crea su ficha técnica."""
    email = data.email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")
    rol = db.query(RolesUsuario).filter(RolesUsuario.id_rol == data.id_rol).first()
    if not rol:
        raise HTTPException(status_code=400, detail="El rol seleccionado no es válido")
    if data.documento_usuario:
        existente = db.query(User).filter(User.documento_usuario == data.documento_usuario).first()
        if existente:
            raise HTTPException(status_code=400, detail="El documento ya está registrado")
    usuario = User(
        first_name=data.first_name.strip(),
        last_name=data.last_name.strip(),
        email=email,
        password_hash=hash_password(data.password),
        telefono_usuario=data.telefono_usuario,
        documento_usuario=data.documento_usuario,
        id_rol_u=data.id_rol,
        is_active=True,
    )
    db.add(usuario)
    db.flush()
    if rol.nombre_rol == "tecnico":
        db.add(
            Tecnico(
                id_usuario_t=usuario.id_usuario,
                certificacion=data.certificacion,
                cargo=data.cargo,
            )
        )
    db.commit()
    return {"msg": "Usuario registrado correctamente", "id": usuario.id_usuario, "email": email}


@router.put("/{user_id}", response_model=dict)
def editar_empleado(
    user_id: int,
    data: EmployeeUpdate,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    usuario = db.query(User).filter(User.id_usuario == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    upd = data.model_dump(exclude_unset=True)
    if "email" in upd:
        email = upd["email"].lower().strip()
        existe = db.query(User).filter(User.email == email, User.id_usuario != user_id).first()
        if existe:
            raise HTTPException(status_code=400, detail="El correo ya está registrado")
        upd["email"] = email
    if "documento_usuario" in upd and upd.get("documento_usuario") is not None:
        existe_doc = db.query(User).filter(
            User.documento_usuario == upd["documento_usuario"], User.id_usuario != user_id
        ).first()
        if existe_doc:
            raise HTTPException(status_code=400, detail="El documento ya está registrado")
    certificacion = upd.pop("certificacion", None)
    cargo = upd.pop("cargo", None)
    for campo, valor in upd.items():
        setattr(usuario, campo, valor)
    if certificacion is not None or cargo is not None:
        ficha = db.query(Tecnico).filter(Tecnico.id_usuario_t == user_id).first()
        if not ficha:
            db.add(Tecnico(id_usuario_t=user_id, certificacion=certificacion or "", cargo=cargo or ""))
        else:
            if certificacion is not None:
                ficha.certificacion_t = certificacion
            if cargo is not None:
                ficha.cargo_t = cargo
    db.commit()
    return {"msg": "Usuario actualizado correctamente", "id": user_id}


@router.delete("/{user_id}", response_model=dict)
def desactivar_empleado(
    user_id: int,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    usuario = db.query(User).filter(User.id_usuario == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if usuario.id_usuario == _admin_user.id_usuario:
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propia cuenta")
    usuario.is_active = False
    db.commit()
    return {"msg": "Usuario desactivado", "id": user_id}



