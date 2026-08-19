from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cita import Cita
from app.models.cliente import Cliente
from app.models.otros import Comision
from app.models.pago import Pago
from app.models.pedido import DetallePedido, Pedido
from app.models.producto import Producto
from app.models.roles_usuario import RolesUsuario
from app.models.solicitud_cuenta import SolicitudCuenta
from app.models.tecnico import Tecnico
from app.models.user import User
from app.services.reportes_service import (
    generar_citas_excel,
    generar_citas_pdf,
    generar_ventas_excel,
    generar_ventas_pdf,
)
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


# ── Helpers de fecha ──────────────────────────────────────────────

_PERIODOS = {"dia", "semana", "mes", "anio"}


def _resolver_rango(
    periodo: str,
    fecha_inicio: Optional[date],
    fecha_fin: Optional[date],
) -> tuple[date, date]:
    """Devuelve (inicio, fin) según el periodo si el usuario no los definió."""
    hoy = date.today()
    if fecha_inicio and fecha_fin:
        return fecha_inicio, fecha_fin
    if periodo == "dia":
        return hoy, hoy
    if periodo == "semana":
        inicio = hoy - timedelta(days=hoy.weekday())
        fin = inicio + timedelta(days=6)
        return inicio, fin
    if periodo == "mes":
        inicio = hoy.replace(day=1)
        if hoy.month == 12:
            fin = hoy.replace(day=31)
        else:
            fin = hoy.replace(month=hoy.month + 1, day=1) - timedelta(days=1)
        return inicio, fin
    # anio
    return hoy.replace(month=1, day=1), hoy.replace(month=12, day=31)


def _group_expr(periodo: str, columna):
    """Expresión SQL de agrupación según el periodo."""
    if periodo == "dia":
        return func.date(columna)
    if periodo == "semana":
        return func.yearweek(columna)
    if periodo == "mes":
        return func.date_format(columna, "%Y-%m")
    return func.year(columna)


def _group_label(periodo: str) -> str:
    """Nombre legible del campo de agrupación."""
    return {"dia": "dia", "semana": "semana", "mes": "mes", "anio": "anio"}[periodo]


def _tecnico_ids(db: Session, id_tecnico: int) -> list[int]:
    """Devuelve los IDs de técnico que coinciden (id_tecnico directo)."""
    return [id_tecnico]


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


# ── Reporte de ventas ─────────────────────────────────────────────


@router.get("/ventas")
def reporte_ventas(
    periodo: str = Query("mes", regex="^(dia|semana|mes|anio)$"),
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    id_tecnico: Optional[int] = None,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Reporte de ventas (pedidos + ingresos por citas) filtrado por periodo."""
    inicio, fin = _resolver_rango(periodo, fecha_inicio, fecha_fin)
    grupo = _group_expr(periodo, Pedido.fecha_peedido)

    # ── Pedidos (ventas de productos) ────────────────────
    q_pedidos = (
        db.query(
            grupo.label("g"),
            func.count(Pedido.id_pedido).label("cantidad"),
            func.coalesce(func.sum(Pedido.total_pedido), 0).label("ventas"),
        )
        .filter(
            Pedido.fecha_peedido.isnot(None),
            func.date(Pedido.fecha_peedido) >= inicio,
            func.date(Pedido.fecha_peedido) <= fin,
        )
    )
    if id_tecnico is not None:
        q_pedidos = q_pedidos.filter(Pedido.id_tecnico_entrega == id_tecnico)

    filas_pedidos = q_pedidos.group_by("g").order_by("g").all()
    pedidos_por_grupo = {str(r.g): {"pedidos": int(r.cantidad), "ventas_pedidos": float(r.ventas)} for r in filas_pedidos}

    # ── Citas (ingresos por servicios) ───────────────────
    q_citas = (
        db.query(
            _group_expr(periodo, Cita.fecha).label("g"),
            func.count(Cita.id_cita).label("cantidad"),
            func.coalesce(func.sum(Cita.costo_cita), 0).label("ingresos"),
        )
        .filter(
            Cita.fecha >= inicio,
            Cita.fecha <= fin,
            Cita.estado_pago == "aprobado",
        )
    )
    if id_tecnico is not None:
        q_citas = q_citas.filter(Cita.id_tecnico == id_tecnico)

    filas_citas = q_citas.group_by("g").order_by("g").all()
    citas_por_grupo = {str(r.g): {"ingresos_citas": float(r.ingresos)} for r in filas_citas}

    # ── Unir periodos ────────────────────────────────────
    todos_los_grupos = sorted(set(list(pedidos_por_grupo.keys()) + list(citas_por_grupo.keys())))
    ventas_por_periodo = []
    total_pedidos_count = 0
    total_ventas_pedidos = 0.0
    total_ingresos_citas = 0.0

    for g in todos_los_grupos:
        p = pedidos_por_grupo.get(g, {"pedidos": 0, "ventas_pedidos": 0.0})
        c = citas_por_grupo.get(g, {"ingresos_citas": 0.0})
        subtotal = p["ventas_pedidos"] + c["ingresos_citas"]
        total_pedidos_count += p["pedidos"]
        total_ventas_pedidos += p["ventas_pedidos"]
        total_ingresos_citas += c["ingresos_citas"]
        ventas_por_periodo.append({
            "periodo": g,
            "pedidos": p["pedidos"],
            "ventas_pedidos": p["ventas_pedidos"],
            "ingresos_citas": c["ingresos_citas"],
            "total": subtotal,
        })

    return {
        "periodo": periodo,
        "fecha_inicio": str(inicio),
        "fecha_fin": str(fin),
        "id_tecnico_filtro": id_tecnico,
        "resumen": {
            "total_pedidos": total_pedidos_count,
            "total_ventas_pedidos": total_ventas_pedidos,
            "total_ingresos_citas": total_ingresos_citas,
            "total_ingresos": total_ventas_pedidos + total_ingresos_citas,
        },
        "ventas_por_periodo": ventas_por_periodo,
    }


# ── Reporte de citas ──────────────────────────────────────────────


@router.get("/citas")
def reporte_citas(
    periodo: str = Query("mes", regex="^(dia|semana|mes|anio)$"),
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    id_tecnico: Optional[int] = None,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Reporte de citas por periodo y estado, con filtro opcional por técnico."""
    inicio, fin = _resolver_rango(periodo, fecha_inicio, fecha_fin)
    grupo = _group_expr(periodo, Cita.fecha)

    q = db.query(grupo.label("g"), Cita.estado).filter(
        Cita.fecha >= inicio,
        Cita.fecha <= fin,
    )
    if id_tecnico is not None:
        q = q.filter(Cita.id_tecnico == id_tecnico)

    filas = q.group_by("g", Cita.estado).order_by("g").all()

    # ── Agrupar por periodo ──────────────────────────────
    datos: dict[str, dict] = {}
    for r in filas:
        g = str(r.g)
        if g not in datos:
            datos[g] = {"total": 0, "Pendiente": 0, "Confirmada": 0, "Finalizada": 0, "Cancelada": 0}
        datos[g][r.estado] = datos[g].get(r.estado, 0) + 1
        datos[g]["total"] += 1

    citas_por_periodo = []
    total_general = 0
    totales_estado: dict[str, int] = {"Pendiente": 0, "Confirmada": 0, "Finalizada": 0, "Cancelada": 0}

    for g in sorted(datos.keys()):
        d = datos[g]
        total_general += d["total"]
        for e in totales_estado:
            totales_estado[e] += d.get(e, 0)
        citas_por_periodo.append({
            "periodo": g,
            "total": d["total"],
            "Pendiente": d.get("Pendiente", 0),
            "Confirmada": d.get("Confirmada", 0),
            "Finalizada": d.get("Finalizada", 0),
            "Cancelada": d.get("Cancelada", 0),
        })

    # ── Ingresos por citas finalizadas con pago aprobado ──
    q_ing = db.query(func.coalesce(func.sum(Cita.costo_cita), 0)).filter(
        Cita.fecha >= inicio,
        Cita.fecha <= fin,
        Cita.estado == "Finalizada",
        Cita.estado_pago == "aprobado",
    )
    if id_tecnico is not None:
        q_ing = q_ing.filter(Cita.id_tecnico == id_tecnico)
    ingresos_total = float(q_ing.scalar() or 0)

    return {
        "periodo": periodo,
        "fecha_inicio": str(inicio),
        "fecha_fin": str(fin),
        "id_tecnico_filtro": id_tecnico,
        "resumen": {
            "total_citas": total_general,
            "por_estado": totales_estado,
            "ingresos_total": ingresos_total,
        },
        "citas_por_periodo": citas_por_periodo,
    }


# ── Reporte por técnico ───────────────────────────────────────────


@router.get("/tecnico")
def reporte_tecnico(
    id_tecnico: int = Query(...),
    periodo: str = Query("mes", regex="^(dia|semana|mes|anio)$"),
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Reporte detallado de un técnico: citas, ingresos y comisiones."""
    tecnico = db.query(Tecnico).filter(Tecnico.id_tecnico == id_tecnico).first()
    if not tecnico:
        raise HTTPException(status_code=404, detail="Técnico no encontrado")

    user = db.query(User).filter(User.id_usuario == tecnico.id_usuario_t).first()
    nombre = f"{user.first_name} {user.last_name}".strip() if user else "Técnico"

    inicio, fin = _resolver_rango(periodo, fecha_inicio, fecha_fin)
    grupo = _group_expr(periodo, Cita.fecha)

    # ── Citas del técnico ────────────────────────────────
    filas = (
        db.query(grupo.label("g"), Cita.estado)
        .filter(Cita.id_tecnico == id_tecnico, Cita.fecha >= inicio, Cita.fecha <= fin)
        .group_by("g", Cita.estado)
        .order_by("g")
        .all()
    )

    datos: dict[str, dict] = {}
    for r in filas:
        g = str(r.g)
        if g not in datos:
            datos[g] = {"total": 0, "Pendiente": 0, "Confirmada": 0, "Finalizada": 0, "Cancelada": 0}
        datos[g][r.estado] = datos[g].get(r.estado, 0) + 1
        datos[g]["total"] += 1

    totales_estado: dict[str, int] = {"Pendiente": 0, "Confirmada": 0, "Finalizada": 0, "Cancelada": 0}
    total_citas = 0
    detalles_por_periodo = []

    for g in sorted(datos.keys()):
        d = datos[g]
        total_citas += d["total"]
        for e in totales_estado:
            totales_estado[e] += d.get(e, 0)
        detalles_por_periodo.append({
            "periodo": g,
            "total": d["total"],
            "Pendiente": d.get("Pendiente", 0),
            "Confirmada": d.get("Confirmada", 0),
            "Finalizada": d.get("Finalizada", 0),
            "Cancelada": d.get("Cancelada", 0),
        })

    # ── Ingresos por citas aprobadas ─────────────────────
    ingresos = float(
        db.query(func.coalesce(func.sum(Cita.costo_cita), 0))
        .filter(
            Cita.id_tecnico == id_tecnico,
            Cita.fecha >= inicio,
            Cita.fecha <= fin,
            Cita.estado_pago == "aprobado",
        )
        .scalar() or 0
    )

    # ── Comisiones ganadas ───────────────────────────────
    comisiones = float(
        db.query(func.coalesce(func.sum(Comision.valor_comision), 0))
        .join(Cita, Cita.id_comision_c == Comision.id_comision)
        .filter(
            Cita.id_tecnico == id_tecnico,
            Cita.fecha >= inicio,
            Cita.fecha <= fin,
        )
        .scalar() or 0
    )

    return {
        "tecnico": {
            "id_tecnico": id_tecnico,
            "nombre": nombre,
            "certificacion": tecnico.certificacion_t,
            "cargo": tecnico.cargo_t,
        },
        "periodo": periodo,
        "fecha_inicio": str(inicio),
        "fecha_fin": str(fin),
        "resumen": {
            "total_citas": total_citas,
            "por_estado": totales_estado,
            "ingresos_generados": ingresos,
            "comisiones_ganadas": comisiones,
        },
        "detalles_por_periodo": detalles_por_periodo,
    }


# ── Lista de técnicos con métricas ────────────────────────────────


@router.get("/tecnicos")
def lista_tecnicos_reporte(
    q: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Lista de técnicos con sus métricas agregadas (citas, ingresos, comisiones).
    Permite buscar por nombre con el parámetro q."""
    query = (
        db.query(Tecnico)
        .join(User, User.id_usuario == Tecnico.id_usuario_t)
    )
    if q:
        like = f"%{q}%"
        query = query.filter(
            (User.first_name.ilike(like)) | (User.last_name.ilike(like))
        )
    tecnicos = query.offset(skip).limit(limit).all()

    resultado = []
    for t in tecnicos:
        user = t.usuario
        nombre = f"{user.first_name} {user.last_name}".strip() if user else "Técnico"

        total_citas = db.query(func.count(Cita.id_cita)).filter(
            Cita.id_tecnico == t.id_tecnico
        ).scalar() or 0

        citas_finalizadas = db.query(func.count(Cita.id_cita)).filter(
            Cita.id_tecnico == t.id_tecnico, Cita.estado == "Finalizada"
        ).scalar() or 0

        ingresos = float(
            db.query(func.coalesce(func.sum(Cita.costo_cita), 0))
            .filter(
                Cita.id_tecnico == t.id_tecnico,
                Cita.estado_pago == "aprobado",
            )
            .scalar() or 0
        )

        comisiones = float(
            db.query(func.coalesce(func.sum(Comision.valor_comision), 0))
            .join(Cita, Cita.id_comision_c == Comision.id_comision)
            .filter(Cita.id_tecnico == t.id_tecnico)
            .scalar() or 0
        )

        promedio = float(
            db.query(func.avg(Cita.costo_cita))
            .filter(
                Cita.id_tecnico == t.id_tecnico,
                Cita.costo_cita.isnot(None),
            )
            .scalar() or 0
        )

        resultado.append({
            "id_tecnico": t.id_tecnico,
            "nombre": nombre,
            "certificacion": t.certificacion_t,
            "cargo": t.cargo_t,
            "activo": user.is_active if user else False,
            "total_citas": int(total_citas),
            "citas_finalizadas": int(citas_finalizadas),
            "ingresos_generados": ingresos,
            "comisiones_ganadas": comisiones,
            "promedio_costo_cita": round(promedio, 2),
        })

    return resultado


# ── Helpers para datos de descarga ───────────────────────────────


def _resolver_nombre_tecnico(db: Session, id_tecnico: int | None) -> str | None:
    if id_tecnico is None:
        return None
    t = db.query(Tecnico).filter(Tecnico.id_tecnico == id_tecnico).first()
    if not t:
        return None
    user = db.query(User).filter(User.id_usuario == t.id_usuario_t).first()
    if user:
        return f"{user.first_name} {user.last_name}".strip()
    return None


def _datos_ventas(db, id_tecnico, inicio, fin, periodo):
    grupo = _group_expr(periodo, Pedido.fecha_peedido)
    q_ped = (
        db.query(
            grupo.label("g"),
            func.count(Pedido.id_pedido).label("cantidad"),
            func.coalesce(func.sum(Pedido.total_pedido), 0).label("ventas"),
        )
        .filter(
            Pedido.fecha_peedido.isnot(None),
            func.date(Pedido.fecha_peedido) >= inicio,
            func.date(Pedido.fecha_peedido) <= fin,
        )
    )
    if id_tecnico is not None:
        q_ped = q_ped.filter(Pedido.id_tecnico_entrega == id_tecnico)
    pedidos_por_grupo = {
        str(r.g): {"pedidos": int(r.cantidad), "ventas_pedidos": float(r.ventas)}
        for r in q_ped.group_by("g").order_by("g").all()
    }

    q_cit = (
        db.query(
            _group_expr(periodo, Cita.fecha).label("g"),
            func.coalesce(func.sum(Cita.costo_cita), 0).label("ingresos"),
        )
        .filter(Cita.fecha >= inicio, Cita.fecha <= fin, Cita.estado_pago == "aprobado")
    )
    if id_tecnico is not None:
        q_cit = q_cit.filter(Cita.id_tecnico == id_tecnico)
    citas_por_grupo = {
        str(r.g): {"ingresos_citas": float(r.ingresos)}
        for r in q_cit.group_by("g").order_by("g").all()
    }

    todos = sorted(set(list(pedidos_por_grupo.keys()) + list(citas_por_grupo.keys())))
    total_p = 0
    total_vp = 0.0
    total_ic = 0.0
    detalle = []
    for g in todos:
        p = pedidos_por_grupo.get(g, {"pedidos": 0, "ventas_pedidos": 0.0})
        c = citas_por_grupo.get(g, {"ingresos_citas": 0.0})
        sub = p["ventas_pedidos"] + c["ingresos_citas"]
        total_p += p["pedidos"]
        total_vp += p["ventas_pedidos"]
        total_ic += c["ingresos_citas"]
        detalle.append({
            "periodo": g, "pedidos": p["pedidos"],
            "ventas_pedidos": p["ventas_pedidos"],
            "ingresos_citas": c["ingresos_citas"], "total": sub,
        })

    resumen = {
        "total_pedidos": total_p,
        "total_ventas_pedidos": total_vp,
        "total_ingresos_citas": total_ic,
        "total_ingresos": total_vp + total_ic,
    }
    return resumen, detalle


def _datos_citas(db, id_tecnico, inicio, fin, periodo):
    grupo = _group_expr(periodo, Cita.fecha)
    q = db.query(grupo.label("g"), Cita.estado).filter(
        Cita.fecha >= inicio, Cita.fecha <= fin,
    )
    if id_tecnico is not None:
        q = q.filter(Cita.id_tecnico == id_tecnico)

    datos: dict[str, dict] = {}
    for r in q.group_by("g", Cita.estado).order_by("g").all():
        g = str(r.g)
        if g not in datos:
            datos[g] = {"total": 0, "Pendiente": 0, "Confirmada": 0, "Finalizada": 0, "Cancelada": 0}
        datos[g][r.estado] = datos[g].get(r.estado, 0) + 1
        datos[g]["total"] += 1

    totales = {"Pendiente": 0, "Confirmada": 0, "Finalizada": 0, "Cancelada": 0}
    total_gen = 0
    detalle = []
    for g in sorted(datos.keys()):
        d = datos[g]
        total_gen += d["total"]
        for e in totales:
            totales[e] += d.get(e, 0)
        detalle.append({
            "periodo": g, "total": d["total"],
            "Pendiente": d.get("Pendiente", 0), "Confirmada": d.get("Confirmada", 0),
            "Finalizada": d.get("Finalizada", 0), "Cancelada": d.get("Cancelada", 0),
        })

    q_ing = db.query(func.coalesce(func.sum(Cita.costo_cita), 0)).filter(
        Cita.fecha >= inicio, Cita.fecha <= fin,
        Cita.estado == "Finalizada", Cita.estado_pago == "aprobado",
    )
    if id_tecnico is not None:
        q_ing = q_ing.filter(Cita.id_tecnico == id_tecnico)
    ingresos = float(q_ing.scalar() or 0)

    resumen = {
        "total_citas": total_gen,
        "por_estado": totales,
        "ingresos_total": ingresos,
    }
    return resumen, detalle


# ── Descargas: Reporte de Ventas ─────────────────────────────────


@router.get("/ventas/pdf")
def ventas_pdf(
    periodo: str = Query("mes", regex="^(dia|semana|mes|anio)$"),
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    id_tecnico: Optional[int] = None,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Descargar reporte de ventas en PDF."""
    inicio, fin = _resolver_rango(periodo, fecha_inicio, fecha_fin)
    resumen, detalle = _datos_ventas(db, id_tecnico, inicio, fin, periodo)
    nombre_tec = _resolver_nombre_tecnico(db, id_tecnico)
    buf = generar_ventas_pdf(resumen, detalle, periodo, inicio, fin, nombre_tec)
    fecha_str = datetime.now().strftime("%Y%m%d_%H%M")
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="reporte_ventas_{periodo}_{fecha_str}.pdf"'},
    )


@router.get("/ventas/excel")
def ventas_excel(
    periodo: str = Query("mes", regex="^(dia|semana|mes|anio)$"),
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    id_tecnico: Optional[int] = None,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Descargar reporte de ventas en Excel."""
    inicio, fin = _resolver_rango(periodo, fecha_inicio, fecha_fin)
    resumen, detalle = _datos_ventas(db, id_tecnico, inicio, fin, periodo)
    nombre_tec = _resolver_nombre_tecnico(db, id_tecnico)
    buf = generar_ventas_excel(resumen, detalle, periodo, inicio, fin, nombre_tec)
    fecha_str = datetime.now().strftime("%Y%m%d_%H%M")
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="reporte_ventas_{periodo}_{fecha_str}.xlsx"'},
    )


# ── Descargas: Reporte de Citas ──────────────────────────────────


@router.get("/citas/pdf")
def citas_pdf(
    periodo: str = Query("mes", regex="^(dia|semana|mes|anio)$"),
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    id_tecnico: Optional[int] = None,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Descargar reporte de citas en PDF."""
    inicio, fin = _resolver_rango(periodo, fecha_inicio, fecha_fin)
    resumen, detalle = _datos_citas(db, id_tecnico, inicio, fin, periodo)
    nombre_tec = _resolver_nombre_tecnico(db, id_tecnico)
    buf = generar_citas_pdf(resumen, detalle, periodo, inicio, fin, nombre_tec)
    fecha_str = datetime.now().strftime("%Y%m%d_%H%M")
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="reporte_citas_{periodo}_{fecha_str}.pdf"'},
    )


@router.get("/citas/excel")
def citas_excel(
    periodo: str = Query("mes", regex="^(dia|semana|mes|anio)$"),
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    id_tecnico: Optional[int] = None,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Descargar reporte de citas en Excel."""
    inicio, fin = _resolver_rango(periodo, fecha_inicio, fecha_fin)
    resumen, detalle = _datos_citas(db, id_tecnico, inicio, fin, periodo)
    nombre_tec = _resolver_nombre_tecnico(db, id_tecnico)
    buf = generar_citas_excel(resumen, detalle, periodo, inicio, fin, nombre_tec)
    fecha_str = datetime.now().strftime("%Y%m%d_%H%M")
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="reporte_citas_{periodo}_{fecha_str}.xlsx"'},
    )

