"""Router: notificaciones de plataforma por usuario.

Las notificaciones se crean en el backend (servicio de notificaciones) en
los eventos de asignación de citas y entregas, junto con el correo. Este
router las consulta y marca como leídas para cualquier rol autenticado.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.notificacion import Notificacion
from app.models.user import User
from app.utils.security import get_current_user

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])


def _serializar(n: Notificacion) -> dict:
    return {
        "id_notificacion": n.id_notificacion,
        "tipo": n.tipo,
        "titulo": n.titulo,
        "mensaje": n.mensaje,
        "leida": bool(n.leida),
        "fecha_creacion": n.fecha_creacion.isoformat() if n.fecha_creacion else None,
    }


@router.get("/mias")
def mis_notificaciones(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Notificaciones del usuario autenticado, más recientes primero."""
    items = (
        db.query(Notificacion)
        .filter(Notificacion.id_usuario == current_user.id_usuario)
        .order_by(Notificacion.fecha_creacion.desc(), Notificacion.id_notificacion.desc())
        .limit(100)
        .all()
    )
    return [_serializar(n) for n in items]


@router.get("/no-leidas")
def notificaciones_no_leidas(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cantidad de notificaciones sin leer del usuario."""
    total = (
        db.query(Notificacion)
        .filter(
            Notificacion.id_usuario == current_user.id_usuario,
            Notificacion.leida == False,  # noqa: E712
        )
        .count()
    )
    return {"no_leidas": total}


@router.patch("/{notificacion_id}/leida")
def marcar_leida(
    notificacion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marca como leída una notificación propia."""
    notif = (
        db.query(Notificacion)
        .filter(
            Notificacion.id_notificacion == notificacion_id,
            Notificacion.id_usuario == current_user.id_usuario,
        )
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    notif.leida = True
    db.commit()
    return {"msg": "Notificación marcada como leída"}


@router.patch("/leer-todas")
def marcar_todas_leidas(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marca como leídas todas las notificaciones del usuario."""
    actualizadas = (
        db.query(Notificacion)
        .filter(
            Notificacion.id_usuario == current_user.id_usuario,
            Notificacion.leida == False,  # noqa: E712
        )
        .update({Notificacion.leida: True}, synchronize_session=False)
    )
    db.commit()
    return {"msg": "Notificaciones marcadas como leídas", "actualizadas": actualizadas}