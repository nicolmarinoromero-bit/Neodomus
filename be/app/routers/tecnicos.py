from typing import List, Optional
from datetime import date, datetime
from pathlib import Path
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.tecnico import Tecnico
from app.models.cliente import Cliente
from app.models.roles_usuario import RolesUsuario
from app.models.user import User
from app.models.cita import Cita
from app.models.otros import Comision
from app.models.calificacion import Calificacion
from app.models.evidencia import Evidencia
from app.models.pedido import Pedido, DetallePedido
from app.services.especialidades import (
    ESPECIALIDADES_POR_SERVICIO,
    compatible_especialidad,
    tecnico_ocupado,
)
from app.utils.security import get_current_employee

ESTADOS_CITA = ("Pendiente", "Confirmada", "Finalizada", "Cancelada")

ESTADOS_ID = {1: "Pendiente", 2: "Confirmada", 3: "Finalizada", 4: "Cancelada"}

EVIDENCIAS_DIR = Path(__file__).resolve().parent.parent / "static" / "evidencias"

EXTENSIONES_EVIDENCIA = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

router = APIRouter(prefix="/tecnicos", tags=["Técnicos"])


class TecnicoAdminResponse(BaseModel):
    id_tecnico: int
    id_usuario: int
    first_name: str
    last_name: str
    email: str
    telefono_usuario: int | None = None
    documento_usuario: int | None = None
    certificacion_t: str | None = None
    cargo_t: str | None = None
    is_active: bool
    desactivado_hasta: datetime | None = None
    created_at: datetime | None = None
    password_reset_required: bool = False
    servicios: list[str] = []


class TecnicoUpdate(BaseModel):
    certificacion: str | None = None
    cargo: str | None = None


class EstadoCitaUpdate(BaseModel):
    estado: str | None = None
    estado_id: int | None = None


class TecnicoCitaResponse(BaseModel):
    id_cita: int
    fecha: date
    hora: str
    estado: str
    tipo_servicio: str
    cliente: str
    telefono: int | None = None
    email: str | None = None
    documento_tipo: str | None = None
    documento_numero: int | None = None
    direccion: str
    descripcion: str | None = None
    id_tecnico: int | None = None
    nombre_tecnico: str | None = None
    costo_cita: float | None = None
    id_comision_c: int | None = None
    comision_porcentaje: float | None = None
    comision_valor: float | None = None
    evidencias: list[dict] = []
    calificacion: dict | None = None


class TecnicoClienteResponse(BaseModel):
    id_cliente: int
    nombre: str
    email: str | None = None
    telefono: int | None = None
    direccion: str | None = None
    citas_count: int


class TecnicoPublicoResponse(BaseModel):
    id_tecnico: int
    first_name: str
    last_name: str
    certificacion_t: str | None = None
    cargo_t: str | None = None
    is_active: bool
    disponible: bool = True
    telefono: int | None = None
    foto_url: str | None = None
    calificacion: float | None = None


def _serializar_publico(db: Session, t: Tecnico) -> TecnicoPublicoResponse:
    u = t.usuario
    promedio = (
        db.query(func.avg(Calificacion.calificacion))
        .filter(Calificacion.id_tecnico_c == t.id_tecnico)
        .scalar()
    )
    return TecnicoPublicoResponse(
        id_tecnico=t.id_tecnico,
        first_name=u.first_name if u else "",
        last_name=u.last_name if u else "",
        certificacion_t=t.certificacion_t,
        cargo_t=t.cargo_t,
        is_active=u.is_active if u else False,
        disponible=bool(u and u.is_active),
        telefono=u.telefono_usuario if u else None,
        foto_url=u.foto_url if u else None,
        calificacion=round(float(promedio), 2) if promedio is not None else None,
    )


def _admin(
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
) -> User:
    role = db.execute(select(RolesUsuario.nombre_rol).where(RolesUsuario.id_rol == current_user.id_rol_u)).scalar_one_or_none()
    if role not in ("admin", "administrador"):
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    return current_user


def _serializar(t: Tecnico) -> TecnicoAdminResponse:
    u = t.usuario
    return TecnicoAdminResponse(
        id_tecnico=t.id_tecnico,
        id_usuario=u.id_usuario if u else 0,
        first_name=u.first_name if u else "",
        last_name=u.last_name if u else "",
        email=u.email if u else "",
        telefono_usuario=u.telefono_usuario if u else None,
        documento_usuario=u.documento_usuario if u else None,
        certificacion_t=t.certificacion_t,
        cargo_t=t.cargo_t,
        is_active=u.is_active if u else False,
        desactivado_hasta=u.desactivado_hasta if u else None,
        created_at=u.created_at if u else None,
        password_reset_required=bool(u.password_reset_required) if u else False,
        servicios=[
            servicio
            for servicio in ESPECIALIDADES_POR_SERVICIO
            if compatible_especialidad(servicio, t.certificacion_t)
        ],
    )


@router.get("/publicos", response_model=List[TecnicoPublicoResponse])
def listar_tecnicos_publicos(
    db: Session = Depends(get_db),
    tipo_servicio: Optional[str] = None,
    fecha: Optional[date] = None,
    hora: Optional[str] = None,
):
    """Lista los técnicos reales del sistema (acceso público, solo datos básicos).

    Usado por las páginas de cliente para agendar citas con técnicos reales.

    Filtros opcionales:
    - tipo_servicio: devuelve solo técnicos cuya especialidad permite el servicio.
    - fecha + hora: marca `disponible=False` a los técnicos ocupados con una
      cita activa en ese horario.
    """
    tecnicos = db.query(Tecnico).order_by(Tecnico.id_tecnico.asc()).all()
    resultado: list[TecnicoPublicoResponse] = []
    for t in tecnicos:
        if tipo_servicio and not compatible_especialidad(tipo_servicio, t.certificacion_t):
            continue
        item = _serializar_publico(db, t)
        if fecha is not None and hora is not None:
            ocupado = tecnico_ocupado(db, t.id_tecnico, fecha, hora)
            item.disponible = item.is_active and not ocupado
        resultado.append(item)
    return resultado


@router.get("", response_model=List[TecnicoAdminResponse])
def listar_tecnicos(
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Lista los técnicos reales registrados en el sistema (solo admin)"""
    tecnicos = db.query(Tecnico).order_by(Tecnico.id_tecnico.asc()).all()
    return [_serializar(t) for t in tecnicos]


@router.get("/unassigned", response_model=List[int])
def listar_usuarios_tecnicos_sin_ficha_admin(
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Ids de usuarios con rol técnico que aún no tienen ficha en la tabla tecnicos"""
    ficha_ids = [t.id_usuario_t for t in db.query(Tecnico).all()]
    usuarios_tecnicos = (
        db.query(User.id_usuario)
        .filter(User.id_rol_u == 2, User.is_active == True)  # noqa: E712
        .all()
    )
    return [u[0] for u in usuarios_tecnicos if u[0] not in ficha_ids]


@router.put("/{tecnico_id}", response_model=TecnicoAdminResponse)
def actualizar_tecnico(
    tecnico_id: int,
    data: TecnicoUpdate,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Actualiza la ficha técnica (especialidad y cargo) de un técnico (solo admin)"""
    tecnico = db.query(Tecnico).filter(Tecnico.id_tecnico == tecnico_id).first()
    if not tecnico:
        raise HTTPException(status_code=404, detail="Técnico no encontrado")
    if data.certificacion is not None:
        tecnico.certificacion_t = data.certificacion
    if data.cargo is not None:
        tecnico.cargo_t = data.cargo
    db.commit()
    db.refresh(tecnico)
    return _serializar(tecnico)


@router.delete("/{tecnico_id}", response_model=dict)
def eliminar_tecnico(
    tecnico_id: int,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Elimina la ficha técnica de un usuario (solo admin)"""
    tecnico = db.query(Tecnico).filter(Tecnico.id_tecnico == tecnico_id).first()
    if not tecnico:
        raise HTTPException(status_code=404, detail="Técnico no encontrado")
    db.delete(tecnico)
    db.commit()
    return {"msg": "Ficha de técnico eliminada", "id": tecnico_id}


def _ficha_tecnico_actual(db: Session, current_user: User) -> Tecnico:
    """Ficha del técnico autenticado (o error 404 si no tiene ficha)"""
    tecnico = (
        db.query(Tecnico)
        .filter(Tecnico.id_usuario_t == current_user.id_usuario)
        .first()
    )
    if not tecnico:
        raise HTTPException(
            status_code=404,
            detail="No hay ficha de técnico asociada a tu cuenta",
        )
    return tecnico


def _serializar_cita_tecnico(db: Session, cita: Cita) -> TecnicoCitaResponse:
    """Serializa una cita con los datos del cliente asociado (contacto y documento)"""
    cliente = (
        db.query(Cliente).filter(Cliente.id_cliente == cita.id_cliente).first()
    )
    documento_tipo = None
    if cliente and cliente.id_tipo_documento_c:
        from app.models.otros import TipoDocumento

        td = (
            db.query(TipoDocumento)
            .filter(TipoDocumento.id_tipo_documento == cliente.id_tipo_documento_c)
            .first()
        )
        documento_tipo = td.nombre_tipo if td else None
    id_comision = None
    com_porcentaje = None
    com_valor = None
    if cita.id_comision_c is not None:
        com = (
            db.query(Comision)
            .filter(Comision.id_comision == cita.id_comision_c)
            .first()
        )
        if com:
            id_comision = com.id_comision
            com_porcentaje = (
                float(com.porcentaje_comision)
                if com.porcentaje_comision is not None
                else None
            )
            com_valor = (
                float(com.valor_comision) if com.valor_comision is not None else None
            )
    return TecnicoCitaResponse(
        id_cita=cita.id_cita,
        fecha=cita.fecha,
        hora=cita.hora,
        estado=cita.estado,
        tipo_servicio=cita.tipo_servicio,
        cliente=f"{cliente.first_name} {cliente.last_name}".strip() if cliente else "Cliente",
        telefono=cliente.telefono_cliente if cliente else None,
        email=cliente.email if cliente else None,
        documento_tipo=documento_tipo,
        documento_numero=cliente.documento_cliente if cliente else None,
        direccion=cita.direccion,
        descripcion=cita.descripcion,
        id_tecnico=cita.id_tecnico,
        nombre_tecnico=cita.nombre_tecnico,
        costo_cita=float(cita.costo_cita) if cita.costo_cita is not None else None,
        id_comision_c=id_comision,
        comision_porcentaje=com_porcentaje,
        comision_valor=com_valor,
        evidencias=_serializar_evidencias(db, cita.id_cita),
        calificacion=_calificacion_cita(db, cita),
    )


def _serializar_evidencias(db: Session, id_cita: int) -> list[dict]:
    """Evidencias subidas para la cita, más recientes primero."""
    filas = (
        db.query(Evidencia)
        .filter(Evidencia.id_cita == id_cita)
        .order_by(Evidencia.id_evidencia.desc())
        .all()
    )
    return [
        {
            "id_evidencia": e.id_evidencia,
            "url": f"/evidencias/{e.url_archivo}",
            "descripcion": e.descripcion,
            "fecha_subida": e.fecha_subida.isoformat() if e.fecha_subida else None,
        }
        for e in filas
    ]


def _calificacion_cita(db: Session, cita: Cita) -> dict | None:
    """Calificación recibida por el técnico para esta cita (si existe)."""
    cal = (
        db.query(Calificacion)
        .filter(Calificacion.id_cita_c == cita.id_cita)
        .first()
    )
    if not cal:
        return None
    return {
        "calificacion": cal.calificacion,
        "comentario": cal.comentario,
        "fecha": cal.created_at.isoformat() if cal.created_at else None,
    }


@router.get("/mis-clientes", response_model=List[TecnicoClienteResponse])
def mis_clientes_tecnico(
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """Clientes con los que el técnico autenticado tiene (o tuvo) citas,
    ordenados alfabéticamente, con el número de citas por cliente."""
    tecnico = _ficha_tecnico_actual(db, current_user)
    filas = (
        db.query(Cita.id_cliente, func.count(Cita.id_cita))
        .filter(Cita.id_tecnico == tecnico.id_tecnico)
        .group_by(Cita.id_cliente)
        .all()
    )
    if not filas:
        return []
    ids = [fila[0] for fila in filas]
    clientes = {
        c.id_cliente: c
        for c in db.query(Cliente).filter(Cliente.id_cliente.in_(ids)).all()
    }
    resultado: list[TecnicoClienteResponse] = []
    for id_cliente, cantidad in filas:
        c = clientes.get(id_cliente)
        if not c:
            continue
        resultado.append(
            TecnicoClienteResponse(
                id_cliente=c.id_cliente,
                nombre=f"{c.first_name} {c.last_name}".strip() or "Cliente",
                email=c.email,
                telefono=c.telefono_cliente,
                direccion=c.address,
                citas_count=cantidad,
            )
        )
    resultado.sort(key=lambda r: r.nombre.lower())
    return resultado


@router.get("/mis-citas", response_model=List[TecnicoCitaResponse])
def mis_citas_tecnico(
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """Citas asignadas al técnico autenticado, ordenadas por fecha y hora"""
    tecnico = _ficha_tecnico_actual(db, current_user)
    citas = (
        db.query(Cita)
        .filter(Cita.id_tecnico == tecnico.id_tecnico)
        .order_by(Cita.fecha.asc(), Cita.hora.asc())
        .all()
    )
    return [_serializar_cita_tecnico(db, cita) for cita in citas]


@router.put("/citas/{cita_id}/estado", response_model=TecnicoCitaResponse)
def actualizar_estado_cita_tecnico(
    cita_id: int,
    data: EstadoCitaUpdate,
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """El técnico actualiza el estado de una cita que le fue asignada"""
    tecnico = _ficha_tecnico_actual(db, current_user)
    cita = (
        db.query(Cita)
        .filter(Cita.id_cita == cita_id, Cita.id_tecnico == tecnico.id_tecnico)
        .first()
    )
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    if data.estado is not None:
        nuevo_estado = data.estado
    elif data.estado_id is not None:
        nuevo_estado = ESTADOS_ID.get(data.estado_id)
        if nuevo_estado is None:
            raise HTTPException(status_code=400, detail="estado_id no válido")
    else:
        raise HTTPException(status_code=400, detail="Indica un estado válido")
    if nuevo_estado not in ESTADOS_CITA:
        raise HTTPException(status_code=400, detail="Estado de cita no válido")
    # El técnico debe dejar evidencia del trabajo realizado para finalizar.
    if nuevo_estado == "Finalizada":
        tiene_evidencia = (
            db.query(Evidencia)
            .filter(Evidencia.id_cita == cita.id_cita)
            .first()
            is not None
        )
        if not tiene_evidencia:
            raise HTTPException(
                status_code=400,
                detail="Debes subir al menos una evidencia del trabajo realizado antes de finalizar la cita",
            )
    cita.estado = nuevo_estado
    db.commit()
    db.refresh(cita)

    # El técnico es quien notifica al cliente que la cita finalizó o que no
    # se pudo completar.
    if nuevo_estado in ("Finalizada", "Cancelada"):
        from app.models.cliente import Cliente
        from app.services.notificaciones import (
            notificar_cita_finalizada_cliente,
            notificar_cita_cancelada_cliente,
        )

        cliente = (
            db.query(Cliente).filter(Cliente.id_cliente == cita.id_cliente).first()
        )
        if cliente and cliente.email:
            nombre_cliente = f"{cliente.first_name} {cliente.last_name}".strip() or "Cliente"
            datos = {
                "servicio": cita.tipo_servicio,
                "fecha": cita.fecha.strftime("%d/%m/%Y"),
                "tecnico": cita.nombre_tecnico or "técnico",
            }
            if nuevo_estado == "Finalizada":
                notificar_cita_finalizada_cliente(cliente.email, nombre_cliente, datos)
            else:
                notificar_cita_cancelada_cliente(cliente.email, nombre_cliente, datos)

    return _serializar_cita_tecnico(db, cita)


def _cita_asignada_a_mi(db: Session, tecnico: Tecnico, cita_id: int) -> Cita:
    cita = (
        db.query(Cita)
        .filter(Cita.id_cita == cita_id, Cita.id_tecnico == tecnico.id_tecnico)
        .first()
    )
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return cita


@router.post("/citas/{cita_id}/evidencias")
async def subir_evidencia_cita(
    cita_id: int,
    request: Request,
    file: UploadFile = File(...),
    descripcion: str = Form(""),
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """El técnico sube una evidencia (foto) del trabajo realizado en una
    cita asignada. Devuelve la lista actualizada de evidencias."""
    tecnico = _ficha_tecnico_actual(db, current_user)
    cita = _cita_asignada_a_mi(db, tecnico, cita_id)
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Selecciona un archivo de imagen")
    ext = Path(file.filename or "").suffix.lower()
    if ext not in EXTENSIONES_EVIDENCIA:
        raise HTTPException(status_code=400, detail="Formato no permitido (usa JPG, PNG, WEBP o GIF)")
    contenido = await file.read()
    if not contenido:
        raise HTTPException(status_code=400, detail="El archivo está vacío")
    if len(contenido) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="La imagen supera los 5 MB")
    try:
        import io

        from PIL import Image

        Image.open(io.BytesIO(contenido)).verify()
    except Exception:
        raise HTTPException(status_code=400, detail="El archivo no es una imagen válida")
    EVIDENCIAS_DIR.mkdir(parents=True, exist_ok=True)
    nombre = f"{uuid.uuid4().hex}{ext}"
    (EVIDENCIAS_DIR / nombre).write_bytes(contenido)
    db.add(
        Evidencia(
            id_cita=cita.id_cita,
            id_tecnico=tecnico.id_tecnico,
            url_archivo=nombre,
            descripcion=(descripcion or "").strip()[:255] or None,
        )
    )
    db.commit()
    return {"msg": "Evidencia subida correctamente", "evidencias": _serializar_evidencias(db, cita.id_cita)}


@router.delete("/citas/{cita_id}/evidencias/{evidencia_id}")
def eliminar_evidencia_cita(
    cita_id: int,
    evidencia_id: int,
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """El técnico elimina una evidencia propia de la cita."""
    tecnico = _ficha_tecnico_actual(db, current_user)
    _cita_asignada_a_mi(db, tecnico, cita_id)
    evidencia = (
        db.query(Evidencia)
        .filter(
            Evidencia.id_evidencia == evidencia_id,
            Evidencia.id_cita == cita_id,
            Evidencia.id_tecnico == tecnico.id_tecnico,
        )
        .first()
    )
    if not evidencia:
        raise HTTPException(status_code=404, detail="Evidencia no encontrada")
    try:
        (EVIDENCIAS_DIR / evidencia.url_archivo).unlink(missing_ok=True)
    except OSError:
        pass
    db.delete(evidencia)
    db.commit()
    return {"msg": "Evidencia eliminada", "evidencias": _serializar_evidencias(db, cita_id)}


class EntregaTecnicoResponse(BaseModel):
    id_pedido: int
    cliente: str
    telefono: int | None = None
    email: str | None = None
    direccion: str | None = None
    fecha_entrega: date | None = None
    hora_entrega: str | None = None
    estado_entrega: str | None = None
    productos: list[dict] = []


def _serializar_entrega_tecnico(db: Session, pedido: Pedido) -> EntregaTecnicoResponse:
    from app.models.cliente import Cliente

    cliente = (
        db.query(Cliente).filter(Cliente.id_cliente == pedido.id_cliente_pe).first()
    )
    detalles = (
        db.query(DetallePedido)
        .filter(
            DetallePedido.id_pedido_d == pedido.id_pedido,
            DetallePedido.id_producto_d.isnot(None),
        )
        .all()
    )
    return EntregaTecnicoResponse(
        id_pedido=pedido.id_pedido,
        cliente=f"{cliente.first_name} {cliente.last_name}".strip() if cliente else "Cliente",
        telefono=cliente.telefono_cliente if cliente else None,
        email=cliente.email if cliente else None,
        direccion=(cliente.address or "").strip() if cliente else None,
        fecha_entrega=pedido.fecha_entrega,
        hora_entrega=pedido.hora_entrega,
        estado_entrega=pedido.estado_entrega,
        productos=[
            {
                "descripcion": d.descripcion_detalle or f"Producto #{d.id_producto_d}",
                "cantidad": d.cantidad_detalle or 1,
                "subtotal": d.subtotal_detalle or 0,
            }
            for d in detalles
        ],
    )


@router.get("/mis-entregas", response_model=List[EntregaTecnicoResponse])
def mis_entregas_tecnico(
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """Pedidos de entrega asignados al técnico autenticado, con productos y
    datos completos del cliente (dirección, teléfono, correo)."""
    tecnico = _ficha_tecnico_actual(db, current_user)
    pedidos = (
        db.query(Pedido)
        .filter(Pedido.id_tecnico_entrega == tecnico.id_tecnico)
        .order_by(Pedido.fecha_entrega.asc(), Pedido.hora_entrega.asc())
        .all()
    )
    return [_serializar_entrega_tecnico(db, p) for p in pedidos]


class EstadoEntregaUpdate(BaseModel):
    estado: str


@router.put("/entregas/{pedido_id}/estado", response_model=EntregaTecnicoResponse)
def actualizar_estado_entrega_tecnico(
    pedido_id: int,
    data: EstadoEntregaUpdate,
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    """El técnico marca una entrega como 'En camino' (notifica al cliente con
    anticipación y sus datos de identificación) o 'Entregado'."""
    tecnico = _ficha_tecnico_actual(db, current_user)
    pedido = (
        db.query(Pedido)
        .filter(
            Pedido.id_pedido == pedido_id,
            Pedido.id_tecnico_entrega == tecnico.id_tecnico,
        )
        .first()
    )
    if not pedido:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")
    estado = data.estado.strip()
    if estado not in ("En camino", "Entregado"):
        raise HTTPException(status_code=400, detail="Estado no válido (En camino / Entregado)")
    pedido.estado_entrega = estado
    db.commit()
    db.refresh(pedido)

    if estado == "En camino":
        from app.models.cliente import Cliente
        from app.services.notificaciones import notificar_aviso_entrega_cliente

        cliente = (
            db.query(Cliente).filter(Cliente.id_cliente == pedido.id_cliente_pe).first()
        )
        if cliente and cliente.email:
            nombre_cliente = f"{cliente.first_name} {cliente.last_name}".strip() or "Cliente"
            notificar_aviso_entrega_cliente(
                cliente.email,
                nombre_cliente,
                {
                    "pedido": pedido.id_pedido,
                    "fecha": pedido.fecha_entrega.strftime("%d/%m/%Y") if pedido.fecha_entrega else "-",
                    "hora": pedido.hora_entrega or "-",
                    "tecnico": pedido.nombre_tecnico_entrega or "técnico",
                    "telefono_tecnico": tecnico.usuario.telefono_usuario if tecnico.usuario else None,
                },
            )

    return _serializar_entrega_tecnico(db, pedido)

