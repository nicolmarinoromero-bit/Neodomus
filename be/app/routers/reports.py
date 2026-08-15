from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cita import Cita
from app.models.cliente import Cliente
from app.models.pedido import DetallePedido, Pedido
from app.models.producto import Producto
from app.models.roles_usuario import RolesUsuario
from app.models.solicitud_cuenta import SolicitudCuenta
from app.models.tecnico import Tecnico
from app.models.user import User
from app.utils.security import get_current_employee

router = APIRouter(prefix="/reports", tags=["Reportes"])


def _admin(
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
) -> User:
    role = db.execute(select(RolesUsuario.nombre_rol).where(RolesUsuario.id_rol == current_user.id_rol_u)).scalar_one_or_none()
    if role not in ("admin", "administrador"):
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    return current_user


@router.get("/resumen")
def resumen_admin(
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Resumen de métricas reales del sistema (solo admin)"""

    # ── Ventas y pedidos ────────────────────────────────
    pedidos_data = db.query(
        func.date_format(Pedido.fecha_peedido, "%Y-%m").label("mes"),
        func.count(Pedido.id_pedido).label("cantidad"),
        func.coalesce(func.sum(Pedido.total_pedido), 0).label("ventas"),
    ).filter(Pedido.fecha_peedido.isnot(None)).group_by("mes").order_by("mes").all()

    ventas_total = db.query(func.coalesce(func.sum(Pedido.total_pedido), 0)).scalar() or 0
    pedidos_total = db.query(func.count(Pedido.id_pedido)).scalar() or 0

    # ── Productos más vendidos ──────────────────────────
    top = (
        db.query(
            Producto.nombre_producto,
            func.coalesce(func.sum(DetallePedido.cantidad_detalle), 0).label("cantidad"),
            func.coalesce(func.sum(DetallePedido.subtotal_detalle), 0).label("total"),
        )
        .join(Pedido, Pedido.id_pedido == DetallePedido.id_pedido_d)
        .join(Producto, Producto.id_producto == DetallePedido.id_producto_d)
        .group_by(Producto.id_producto)
        .order_by(func.sum(DetallePedido.cantidad_detalle).desc())
        .limit(6)
        .all()
    )

    # ── Clientes ────────────────────────────────────────
    clientes_total = db.query(func.count(Cliente.id_cliente)).scalar() or 0

    # ── Citas ───────────────────────────────────────────
    citas_total = db.query(func.count(Cita.id_cita)).scalar() or 0
    citas_por_estado = {
        e: (db.query(func.count(Cita.id_cita)).filter(Cita.estado == e).scalar() or 0)
        for e in ("Pendiente", "Confirmada", "Finalizada", "Cancelada")
    }
    citas_por_mes = db.query(
        func.date_format(Cita.fecha, "%Y-%m").label("mes"),
        func.count(Cita.id_cita).label("cantidad"),
    ).group_by(func.date_format(Cita.fecha, "%Y-%m")).order_by("mes").all()

    # ── Técnicos ────────────────────────────────────────
    tecnicos_total = db.query(func.count(Tecnico.id_tecnico)).scalar() or 0
    tecnicos_activos = (
        db.query(func.count(User.id_usuario))
        .filter(User.id_rol_u == 2, User.is_active == True)  # noqa: E712
        .scalar() or 0
    )

    # ── Productos ───────────────────────────────────────
    productos_total = db.query(func.count(Producto.id_producto)).scalar() or 0
    productos_activos = (
        db.query(func.count(Producto.id_producto))
        .filter(Producto.estado_producto == "activo")
        .scalar() or 0
    )

    # ── Solicitudes pendientes ──────────────────────────
    solicitudes_pendientes = (
        db.query(func.count(SolicitudCuenta.id))
        .filter(SolicitudCuenta.estado == "pendiente")
        .scalar() or 0
    )

    pedidos_por_mes = [
        {"mes": m, "cantidad": int(c), "ventas": float(v)}
        for m, c, v in pedidos_data
    ]

    return {
        "ventas_total": float(ventas_total),
        "pedidos_total": int(pedidos_total),
        "pedidos_por_mes": pedidos_por_mes,
        "productos_mas_vendidos": [
            {"nombre_producto": n, "cantidad": int(c), "total": float(t)}
            for n, c, t in top
        ],
        "clientes_total": int(clientes_total),
        "citas_total": int(citas_total),
        "citas_por_estado": citas_por_estado,
        "citas_por_mes": [
            {"mes": m, "cantidad": int(c)} for m, c in citas_por_mes
        ],
        "tecnicos_total": int(tecnicos_total),
        "tecnicos_activos": int(tecnicos_activos),
        "productos_total": int(productos_total),
        "productos_activos": int(productos_activos),
        "solicitudes_pendientes": int(solicitudes_pendientes),
    }

