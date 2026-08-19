from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from pydantic import BaseModel, ConfigDict, EmailStr

from app.database import get_db
from app.models.user import User
from app.models.roles_usuario import RolesUsuario
from app.models.tecnico import Tecnico
from app.models.cita import Cita
from app.models.cliente import Cliente
from app.schemas.user import EmployeeResponse, PerfilEmpleadoResponse, UserUpdate
from app.services.especialidades import compatible_especialidad, tecnico_ocupado
from app.utils.respaldo_usuarios import respaldar_usuarios
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
    password: Optional[str] = None
    telefono_usuario: Optional[int] = None
    documento_usuario: Optional[int] = None
    is_active: Optional[bool] = None
    desactivado_hasta: Optional[datetime] = None
    certificacion: Optional[str] = None
    cargo: Optional[str] = None
    motivo: Optional[str] = None


def _plantilla_estado(
    nombre: str, activo: bool, hasta: Optional[datetime], motivo: Optional[str] = None
) -> tuple[str, str]:
    """Asunto y cuerpo HTML para el correo de habilitación/inhabilitación de un empleado."""
    if activo:
        subject = "Tu cuenta Neodomus ha sido habilitada"
        detalle = (
            "Tu cuenta ha sido <strong>habilitada</strong>. Ya puedes iniciar sesión "
            "en el sistema y retomar tus actividades."
        )
    elif hasta:
        fecha = hasta.strftime("%d/%m/%Y %I:%M %p")
        subject = "Tu cuenta Neodomus ha sido inhabilitada"
        detalle = (
            "Tu cuenta ha sido <strong>inhabilitada</strong> hasta el "
            f"<strong>{fecha}</strong>. Podrás volver a acceder a partir de esa fecha."
        )
    else:
        subject = "Tu cuenta Neodomus ha sido inhabilitada"
        detalle = (
            "Tu cuenta ha sido <strong>inhabilitada</strong> por el administrador. "
            "Si crees que es un error, comunícate con el administrador."
        )
    body = (
        "<div style='background:#f6f4ef;padding:24px;font-family:Arial,Helvetica,sans-serif'>"
        "<div style='max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e2d6'>"
        "<div style='background:#1f1a12;padding:20px 26px;border-bottom:4px solid #d4a54b'>"
        "<h2 style='margin:0;color:#ffffff;font-size:19px'>Neodomus</h2>"
        "<p style='margin:4px 0 0;color:#d4a54b;font-size:12px;font-weight:600;letter-spacing:1px'>"
        + ("CUENTA HABILITADA" if activo else "CUENTA INHABILITADA")
        + "</p></div>"
        "<div style='padding:26px'>"
        f"<p style='margin:0 0 8px;color:#333;font-size:14px'>Hola <strong>{nombre}</strong>,</p>"
        f"<p style='margin:0 0 16px;color:#555;font-size:14px'>{detalle}</p>"
        + (
            "<p style='margin:0 0 16px;padding:12px 14px;background:#fdf3f3;border:1px solid #f1caca;border-radius:8px;color:#9a3b3b;font-size:13px'>"
            f"<strong>Motivo de la inhabilitación:</strong> {motivo}</p>"
            if motivo
            else ""
        )
        + "<p style='margin:18px 0 0;padding:12px 14px;background:#fdf6e7;border:1px solid #eed7a8;border-radius:8px;color:#7a5a14;font-size:13px'>"
        "Para cualquier inquietud, responde este correo o contacta al administrador.</p>"
        "</div>"
        "<div style='background:#f6f4ef;padding:14px 26px;border-top:1px solid #e8e2d6'>"
        "<p style='margin:0;color:#999;font-size:12px'>Neodomus — Sistema de gestión inteligente.</p>"
        "</div></div></div>"
    )
    return subject, body


async def _notificar_estado_empleado(
    usuario: User,
    activo: bool,
    hasta: Optional[datetime],
    motivo: Optional[str] = None,
) -> None:
    """Envía correo al empleado cuando el admin lo habilita o inhabilita."""
    from app.utils.email import send_email

    try:
        nombre = f"{usuario.first_name} {usuario.last_name}".strip() or "empleado"
        subject, body = _plantilla_estado(nombre, activo, hasta, motivo)
        await send_email(usuario.email, subject, body)
    except HTTPException:
        pass


def _programar_correo(correo: str, subject: str, body: str) -> None:
    """Programa el envío de un correo en segundo plano (fire-and-forget)."""
    import asyncio

    from app.utils.email import send_email

    async def _tarea():
        try:
            await send_email(correo, subject, body)
        except HTTPException:
            pass
        except Exception as e:
            print(f"Error enviando correo en segundo plano a {correo}: {e}")

    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        return
    loop.create_task(_tarea())


def _notificar_cliente_cambio_tecnico(
    cliente: Cliente,
    cita: Cita,
    tecnico_anterior: str | None,
    nuevo_tecnico: str,
) -> None:
    """Envía correo al cliente informando que el técnico de su cita cambió."""
    nombre_cliente = f"{cliente.first_name} {cliente.last_name}".strip() or "cliente"
    subject = "Neodomus: el técnico de tu cita cambió"
    detalle_cambio = (
        f"La cita de <strong>{cita.tipo_servicio}</strong> que tenías para el "
        f"<strong>{cita.fecha.strftime('%d/%m/%Y')}</strong> a las <strong>{cita.hora}</strong>"
    )
    if tecnico_anterior and tecnico_anterior.strip():
        detalle_cambio += f" era con <strong>{tecnico_anterior}</strong>"
    detalle_cambio += (
        f" y ahora será atendida por <strong>{nuevo_tecnico}</strong>. "
        "La fecha, hora y los demás datos de tu cita se mantienen igual."
    )
    body = (
        "<div style='background:#f6f4ef;padding:24px;font-family:Arial,Helvetica,sans-serif'>"
        "<div style='max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e2d6'>"
        "<div style='background:#1f1a12;padding:20px 26px;border-bottom:4px solid #d4a54b'>"
        "<h2 style='margin:0;color:#ffffff;font-size:19px'>Neodomus</h2>"
        "<p style='margin:4px 0 0;color:#d4a54b;font-size:12px;font-weight:600;letter-spacing:1px'>CAMBIO DE TÉCNICO</p></div>"
        "<div style='padding:26px'>"
        f"<p style='margin:0 0 8px;color:#333;font-size:14px'>Hola <strong>{nombre_cliente}</strong>,</p>"
        f"<p style='margin:0 0 16px;color:#555;font-size:14px'>{detalle_cambio}</p>"
        "<table style='border-collapse:collapse;width:100%;font-family:Arial,Helvetica,sans-serif'>"
        f"<tr><td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#666'>Servicio</td>"
        f"<td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#333;font-weight:700'>{cita.tipo_servicio}</td></tr>"
        f"<tr><td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#666'>Fecha</td>"
        f"<td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#333;font-weight:700'>{cita.fecha.strftime('%d/%m/%Y')}</td></tr>"
        f"<tr><td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#666'>Hora</td>"
        f"<td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#333;font-weight:700'>{cita.hora}</td></tr>"
        f"<tr><td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#666'>Nuevo técnico</td>"
        f"<td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#1f6f43;font-weight:700'>{nuevo_tecnico}</td></tr>"
        "</table>"
        "<p style='margin:18px 0 0;padding:12px 14px;background:#fdf6e7;border:1px solid #eed7a8;border-radius:8px;color:#7a5a14;font-size:13px'>"
        "Si tienes alguna inquietud, responde este correo o contacta al equipo de Neodomus.</p>"
        "</div>"
        "<div style='background:#f6f4ef;padding:14px 26px;border-top:1px solid #e8e2d6'>"
        "<p style='margin:0;color:#999;font-size:12px'>Neodomus — Sistema de gestión inteligente.</p>"
        "</div></div></div>"
    )
    _programar_correo(cliente.email, subject, body)


def _reasignar_citas_tecnico_inhabilitado(db: Session, usuario: User) -> dict | None:
    """Reasigna las citas pendientes/confirmadas de un técnico inhabilitado a
    otro técnico activo con la especialidad compatible. Devuelve un resumen o
    None si el usuario no es técnico."""
    ficha = db.query(Tecnico).filter(Tecnico.id_usuario_t == usuario.id_usuario).first()
    if not ficha:
        return None
    hoy = date.today()
    citas = (
        db.query(Cita)
        .filter(
            Cita.id_tecnico == ficha.id_tecnico,
            Cita.estado.in_(("Pendiente", "Confirmada")),
            Cita.fecha >= hoy,
        )
        .order_by(Cita.fecha.asc(), Cita.hora.asc())
        .all()
    )
    resumen = {
        "total": len(citas),
        "reasignadas": [],
        "sin_reasignar": [],
        "tecnico": ficha,
    }
    if not citas:
        return resumen
    candidatos = (
        db.query(Tecnico)
        .join(User, User.id_usuario == Tecnico.id_usuario_t)
        .filter(
            User.is_active == True,  # noqa: E712
            Tecnico.id_tecnico != ficha.id_tecnico,
        )
        .order_by(Tecnico.id_tecnico.asc())
        .all()
    )
    clientes = {c.id_cliente: c for c in db.query(Cliente).all()}
    reservados: set[tuple] = set()
    for cita in citas:
        elegido = None
        for t in candidatos:
            if not compatible_especialidad(cita.tipo_servicio, t.certificacion_t):
                continue
            if (cita.fecha, cita.hora, t.id_tecnico) in reservados:
                continue
            if tecnico_ocupado(db, t.id_tecnico, cita.fecha, cita.hora, cita.id_cita):
                continue
            elegido = t
            break
        cliente = clientes.get(cita.id_cliente)
        nombre_cliente = (
            f"{cliente.first_name} {cliente.last_name}".strip()
            if cliente
            else "cliente"
        )
        item = {
            "cita_id": cita.id_cita,
            "fecha": cita.fecha,
            "hora": cita.hora,
            "servicio": cita.tipo_servicio,
            "cliente": nombre_cliente,
        }
        if elegido:
            nuevo_nombre = (
                f"{elegido.usuario.first_name} {elegido.usuario.last_name}".strip()
                if elegido.usuario
                else None
            )
            tecnico_anterior = cita.nombre_tecnico
            cita.id_tecnico = elegido.id_tecnico
            if nuevo_nombre:
                cita.nombre_tecnico = nuevo_nombre
            reservados.add((cita.fecha, cita.hora, elegido.id_tecnico))
            if cliente and cliente.email:
                _notificar_cliente_cambio_tecnico(
                    cliente,
                    cita,
                    tecnico_anterior,
                    nuevo_nombre or f"Técnico #{elegido.id_tecnico}",
                )
            resumen["reasignadas"].append(
                {**item, "nuevo_tecnico": nuevo_nombre or f"Técnico #{elegido.id_tecnico}"}
            )
        else:
            resumen["sin_reasignar"].append(item)
    db.commit()
    return resumen


def _alertar_admin_tecnico_inhabilitado(
    db: Session,
    usuario: User,
    motivo: Optional[str],
    resumen: dict,
) -> None:
    """Envía correo a los administradores cuando un técnico es inhabilitado,
    con el detalle de las citas reasignadas o pendientes de reasignación."""
    from app.config import settings

    admins = (
        db.query(User)
        .join(RolesUsuario, RolesUsuario.id_rol == User.id_rol_u)
        .filter(RolesUsuario.nombre_rol.in_(["admin", "administrador"]), User.is_active == True)  # noqa: E712
        .all()
    )
    destinatarios = [a.email for a in admins if a.email] or [settings.SMTP_USERNAME]

    nombre = f"{usuario.first_name} {usuario.last_name}".strip() or "técnico"
    ficha = resumen.get("tecnico")
    cargo = ficha.cargo_t if ficha else None
    reasignadas = resumen["reasignadas"]
    sin_reasignar = resumen["sin_reasignar"]

    filas_reasignadas = "".join(
        "<tr>"
        f"<td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#333'>{r['fecha'].strftime('%d/%m/%Y')}</td>"
        f"<td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#333'>{r['hora']}</td>"
        f"<td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#666'>{r['servicio']}</td>"
        f"<td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#333'>{r['cliente']}</td>"
        f"<td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#1f6f43;font-weight:700'>{r['nuevo_tecnico']}</td>"
        "</tr>"
        for r in reasignadas
    )
    filas_sin = "".join(
        "<tr>"
        f"<td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#333'>{r['fecha'].strftime('%d/%m/%Y')}</td>"
        f"<td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#333'>{r['hora']}</td>"
        f"<td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#666'>{r['servicio']}</td>"
        f"<td style='padding:10px 12px;border:1px solid #eee;font-size:13px;color:#333'>{r['cliente']}</td>"
        "</tr>"
        for r in sin_reasignar
    )

    if resumen["total"] == 0:
        detalle_citas = (
            "<p style='margin:18px 0 0;padding:12px 14px;background:#faf7f0;border:1px solid #e8e2d6;border-radius:8px;color:#7a6a4a;font-size:13px'>"
            "El técnico no tenía citas pendientes ni confirmadas que reasignar.</p>"
        )
    else:
        seccion_reasignadas = (
            "<p style='margin:18px 0 4px;color:#333;font-size:14px'><strong>Citas reasignadas</strong></p>"
            "<table style='border-collapse:collapse;width:100%;font-family:Arial,Helvetica,sans-serif'>"
            "<thead><tr style='background:#1f1a12'>"
            "<th style='padding:10px 12px;border:1px solid #1f1a12;color:#ffffff;font-size:12px;text-transform:uppercase;text-align:left'>Fecha</th>"
            "<th style='padding:10px 12px;border:1px solid #1f1a12;color:#ffffff;font-size:12px;text-transform:uppercase;text-align:left'>Hora</th>"
            "<th style='padding:10px 12px;border:1px solid #1f1a12;color:#ffffff;font-size:12px;text-transform:uppercase;text-align:left'>Servicio</th>"
            "<th style='padding:10px 12px;border:1px solid #1f1a12;color:#ffffff;font-size:12px;text-transform:uppercase;text-align:left'>Cliente</th>"
            "<th style='padding:10px 12px;border:1px solid #1f1a12;color:#ffd98a;font-size:12px;text-transform:uppercase;text-align:left'>Nuevo técnico</th>"
            "</tr></thead><tbody>"
            f"{filas_reasignadas}"
            "</tbody></table>"
        ) if reasignadas else (
            "<p style='margin:18px 0 4px;color:#333;font-size:14px'><strong>Citas reasignadas</strong></p>"
            "<p style='margin:0 0 8px;color:#666;font-size:13px'>Ninguna cita pudo reasignarse automáticamente.</p>"
        )
        seccion_sin = (
            "<p style='margin:18px 0 4px;color:#333;font-size:14px'><strong>Citas sin reasignar (requieren asignación manual)</strong></p>"
            "<table style='border-collapse:collapse;width:100%;font-family:Arial,Helvetica,sans-serif'>"
            "<thead><tr style='background:#3d1212'>"
            "<th style='padding:10px 12px;border:1px solid #3d1212;color:#ffffff;font-size:12px;text-transform:uppercase;text-align:left'>Fecha</th>"
            "<th style='padding:10px 12px;border:1px solid #3d1212;color:#ffffff;font-size:12px;text-transform:uppercase;text-align:left'>Hora</th>"
            "<th style='padding:10px 12px;border:1px solid #3d1212;color:#ffffff;font-size:12px;text-transform:uppercase;text-align:left'>Servicio</th>"
            "<th style='padding:10px 12px;border:1px solid #3d1212;color:#ffffff;font-size:12px;text-transform:uppercase;text-align:left'>Cliente</th>"
            "</tr></thead><tbody>"
            f"{filas_sin}"
            "</tbody></table>"
        ) if sin_reasignar else ""
        detalle_citas = seccion_reasignadas + seccion_sin

    motivo_html = (
        f"<p style='margin:0 0 16px;padding:12px 14px;background:#fdf3f3;border:1px solid #f1caca;border-radius:8px;color:#9a3b3b;font-size:13px'>"
        f"<strong>Motivo de la inhabilitación:</strong> {motivo}</p>"
        if motivo
        else ""
    )
    subject = f"Técnico inhabilitado: {nombre}"
    body = (
        "<div style='background:#f6f4ef;padding:24px;font-family:Arial,Helvetica,sans-serif'>"
        "<div style='max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e2d6'>"
        "<div style='background:#3d1212;padding:20px 26px;border-bottom:4px solid #e05c5c'>"
        "<h2 style='margin:0;color:#ffffff;font-size:19px'>Neodomus</h2>"
        "<p style='margin:4px 0 0;color:#ff9b9b;font-size:12px;font-weight:600;letter-spacing:1px'>TÉCNICO INHABILITADO</p></div>"
        "<div style='padding:26px'>"
        "<p style='margin:0 0 8px;color:#333;font-size:14px'>Hola,</p>"
        f"<p style='margin:0 0 18px;color:#555;font-size:14px'>El técnico <strong>{nombre}</strong> ({usuario.email}) fue <strong>inhabilitado</strong>."
        + (f" Cargo: <strong>{cargo}</strong>." if cargo else "")
        + "</p>"
        f"{motivo_html}"
        f"{detalle_citas}"
        "<p style='margin:18px 0 0;padding:12px 14px;background:#fdf6e7;border:1px solid #eed7a8;border-radius:8px;color:#7a5a14;font-size:13px'>"
        "Revisa las citas pendientes en el panel de administración y confirma las asignaciones.</p>"
        "</div>"
        "<div style='background:#f6f4ef;padding:14px 26px;border-top:1px solid #e8e2d6'>"
        "<p style='margin:0;color:#999;font-size:12px'>Neodomus — Sistema de gestión inteligente.</p>"
        "</div></div></div>"
    )
    for correo in destinatarios:
        _programar_correo(correo, subject, body)


def _gestionar_inhabilitacion_tecnico(
    db: Session,
    usuario: User,
    motivo: Optional[str] = None,
) -> None:
    """Al inhabilitar un técnico: reasigna sus citas pendientes/confirmadas a
    otro técnico disponible y alerta a los administradores por correo."""
    resumen = _reasignar_citas_tecnico_inhabilitado(db, usuario)
    if resumen is None:
        return
    _alertar_admin_tecnico_inhabilitado(db, usuario, motivo, resumen)


def _admin(
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
) -> User:
    role = db.execute(select(RolesUsuario.nombre_rol).where(RolesUsuario.id_rol == current_user.id_rol_u)).scalar_one_or_none()
    if role not in ("admin", "administrador"):
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    return current_user


def _perfil_empleado(usuario: User, db: Session) -> dict:
    """Serializa al empleado junto con su ficha técnica (si existe)."""
    data = EmployeeResponse.model_validate(usuario).model_dump()
    ficha = db.query(Tecnico).filter(Tecnico.id_usuario_t == usuario.id_usuario).first()
    data["certificacion_t"] = ficha.certificacion_t if ficha else None
    data["cargo_t"] = ficha.cargo_t if ficha else None
    return data


@router.get("/me", response_model=PerfilEmpleadoResponse)
def get_me(
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    return _perfil_empleado(current_user, db)


@router.put("/me", response_model=PerfilEmpleadoResponse)
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
    certificacion_t = update_data.pop("certificacion_t", None)
    cargo_t = update_data.pop("cargo_t", None)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    if certificacion_t is not None or cargo_t is not None:
        ficha = db.query(Tecnico).filter(Tecnico.id_usuario_t == current_user.id_usuario).first()
        if not ficha:
            db.add(
                Tecnico(
                    id_usuario_t=current_user.id_usuario,
                    certificacion_t=certificacion_t or "",
                    cargo_t=cargo_t or "",
                )
            )
        else:
            if certificacion_t is not None:
                ficha.certificacion_t = certificacion_t
            if cargo_t is not None:
                ficha.cargo_t = cargo_t
    db.commit()
    db.refresh(current_user)
    return _perfil_empleado(current_user, db)


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
        password_reset_required=True,
    )
    db.add(usuario)
    db.flush()
    if rol.nombre_rol == "tecnico":
        db.add(
            Tecnico(
                id_usuario_t=usuario.id_usuario,
                certificacion_t=data.certificacion,
                cargo_t=data.cargo,
            )
        )
    db.commit()
    respaldar_usuarios()
    if rol.nombre_rol == "tecnico":
        from app.services.notificaciones import notificar_bienvenida_tecnico

        nombre = f"{data.first_name.strip()} {data.last_name.strip()}".strip()
        notificar_bienvenida_tecnico(email, nombre, email, data.password)
    return {"msg": "Usuario registrado correctamente", "id": usuario.id_usuario, "email": email}


@router.put("/{user_id}", response_model=dict)
async def editar_empleado(
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
    motivo = upd.pop("motivo", None)
    nueva_password = upd.pop("password", None)
    if nueva_password:
        if len(nueva_password) < 6:
            raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")
        usuario.password_hash = hash_password(nueva_password)
        usuario.password_reset_required = True
    cambio_estado = False
    activo = usuario.is_active
    desactivado_hasta = usuario.desactivado_hasta
    if "is_active" in upd and bool(upd["is_active"]) != usuario.is_active:
        cambio_estado = True
        activo = bool(upd["is_active"])
        if "desactivado_hasta" in upd:
            desactivado_hasta = upd["desactivado_hasta"]
        if activo:
            upd["desactivado_hasta"] = None
    for campo, valor in upd.items():
        setattr(usuario, campo, valor)
    if certificacion is not None or cargo is not None:
        ficha = db.query(Tecnico).filter(Tecnico.id_usuario_t == user_id).first()
        if not ficha:
            db.add(
                Tecnico(
                    id_usuario_t=user_id,
                    certificacion_t=certificacion or "",
                    cargo_t=cargo or "",
                )
            )
        else:
            if certificacion is not None:
                ficha.certificacion_t = certificacion
            if cargo is not None:
                ficha.cargo_t = cargo
    db.commit()
    if cambio_estado:
        await _notificar_estado_empleado(usuario, activo, desactivado_hasta, motivo)
        if not activo:
            _gestionar_inhabilitacion_tecnico(db, usuario, motivo)
    return {"msg": "Usuario actualizado correctamente", "id": user_id}


@router.delete("/{user_id}", response_model=dict)
async def desactivar_empleado(
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
    await _notificar_estado_empleado(usuario, False, usuario.desactivado_hasta)
    _gestionar_inhabilitacion_tecnico(db, usuario)
    return {"msg": "Usuario desactivado", "id": user_id}



