from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel

from app.database import get_db
from app.models.cliente import Cliente
from app.models.roles_usuario import RolesUsuario
from app.models.cita import Cita
from app.models.tarifa_servicio import TarifaServicio
from app.models.tecnico import Tecnico
from app.models.otros import Comision
from app.models.user import User
from app.schemas.cita import (
    CitaCreate,
    CitaUpdate,
    CitaResponse,
    CrearCitaResponse,
)
from app.services.especialidades import (
    compatible_especialidad,
    tecnico_ocupado,
    slot_tomado,
    horas_laborales,
    _dia_es_laboral,
)
from app.services import pagos_service
from app.services.notificaciones import notificar_cita_asignada_tecnico
from app.models.calificacion import Calificacion
from app.utils.security import get_current_client, get_current_employee

router = APIRouter(prefix="/citas", tags=["Citas"])

ESTADOS_EDITABLES = ("Pendiente", "Confirmada")

ESTADOS_CITA = ("Pendiente", "Confirmada", "Finalizada", "Cancelada")


class AdminCitaUpdate(BaseModel):
    estado: Optional[str] = None
    id_tecnico: Optional[int] = None
    nombre_tecnico: Optional[str] = None
    id_comision_c: Optional[int] = None
    comision_porcentaje: Optional[float] = None
    comision_valor: Optional[float] = None


class AdminCitaResponse(CitaResponse):
    cliente_nombre: Optional[str] = None
    cliente_email: Optional[str] = None
    id_comision_c: Optional[int] = None
    comision_porcentaje: Optional[float] = None
    comision_valor: Optional[float] = None


class ClienteCitaResponse(CitaResponse):
    """Cita visto por el cliente: incluye datos de contacto del técnico."""
    tecnico_telefono: Optional[int] = None
    tecnico_email: Optional[str] = None
    tecnico_foto_url: Optional[str] = None
    calificada: Optional[bool] = None


def _admin(
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
) -> User:
    role = db.execute(
        select(RolesUsuario.nombre_rol).where(RolesUsuario.id_rol == current_user.id_rol_u)
    ).scalar_one_or_none()
    if role not in ("admin", "administrador"):
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    return current_user


def _nombre_tecnico_real(db: Session, id_tecnico: int) -> str | None:
    """Devuelve el nombre real del técnico (join a usuarios) o None si no existe."""
    if id_tecnico is None:
        return None
    tecnico = db.query(Tecnico).filter(Tecnico.id_tecnico == id_tecnico).first()
    if not tecnico or not tecnico.usuario:
        return None
    u = tecnico.usuario
    return f"{u.first_name} {u.last_name}".strip()


def _datos_tecnico(db: Session, id_tecnico: int) -> tuple[int | None, str | None, str | None]:
    """Devuelve (teléfono, email, foto) del técnico, o (None, None, None) si no existe."""
    if id_tecnico is None:
        return None, None, None
    tecnico = db.query(Tecnico).filter(Tecnico.id_tecnico == id_tecnico).first()
    if not tecnico or not tecnico.usuario:
        return None, None, None
    u = tecnico.usuario
    return u.telefono_usuario, u.email, u.foto_url


def _info_comision(db: Session, cita: Cita) -> tuple[Optional[int], Optional[float], Optional[float]]:
    """Devuelve (id_comision, porcentaje, valor) de la comisión ligada a la cita."""
    if cita.id_comision_c is None:
        return None, None, None
    com = db.query(Comision).filter(Comision.id_comision == cita.id_comision_c).first()
    if not com:
        return None, None, None
    return (
        com.id_comision,
        float(com.porcentaje_comision) if com.porcentaje_comision is not None else None,
        float(com.valor_comision) if com.valor_comision is not None else None,
    )


def _serializar_cita_cliente(db: Session, cita: Cita) -> ClienteCitaResponse:
    telefono, email, foto = _datos_tecnico(db, cita.id_tecnico)
    calificada = (
        db.query(Calificacion)
        .filter(
            Calificacion.id_cita_c == cita.id_cita,
            Calificacion.id_cliente_c == cita.id_cliente,
        )
        .first()
        is not None
    )
    return ClienteCitaResponse(
        id_cita=cita.id_cita,
        id_cliente=cita.id_cliente,
        id_tecnico=cita.id_tecnico,
        nombre_tecnico=cita.nombre_tecnico,
        tecnico_telefono=telefono,
        tecnico_email=email,
        tecnico_foto_url=foto,
        tipo_servicio=cita.tipo_servicio,
        fecha=cita.fecha,
        hora=cita.hora,
        direccion=cita.direccion,
        descripcion=cita.descripcion,
        estado=cita.estado,
        costo_cita=float(cita.costo_cita) if cita.costo_cita is not None else None,
        metodo_pago=cita.metodo_pago,
        estado_pago=cita.estado_pago,
        numero_transaccion=cita.numero_transaccion,
        created_at=cita.created_at,
        calificada=calificada,
    )


def _validar_tecnico_cita(
    db: Session,
    id_tecnico: Optional[int],
    tipo_servicio: str,
    fecha: date,
    hora: str,
    excluir_cita_id: Optional[int] = None,
) -> None:
    """Valida que el técnico exista, tenga la especialidad del servicio y
    esté libre en la fecha y hora indicadas. Lanza HTTPException si no."""
    if id_tecnico is None:
        return
    tecnico = db.query(Tecnico).filter(Tecnico.id_tecnico == id_tecnico).first()
    if not tecnico or not tecnico.usuario or not tecnico.usuario.is_active:
        raise HTTPException(status_code=400, detail="El técnico seleccionado no existe o no está activo")
    if not compatible_especialidad(tipo_servicio, tecnico.certificacion_t):
        raise HTTPException(
            status_code=400,
            detail=f"El técnico seleccionado no tiene la especialidad requerida para el servicio de {tipo_servicio}",
        )
    if tecnico_ocupado(db, id_tecnico, fecha, hora, excluir_cita_id):
        raise HTTPException(
            status_code=400,
            detail="El técnico seleccionado no está disponible en esa fecha y hora",
        )


@router.get("/all-admin", response_model=List[AdminCitaResponse])
def listar_citas_admin(
    current_admin: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Lista todas las citas/instalaciones del sistema (solo admin)"""
    citas = (
        db.query(Cita)
        .order_by(Cita.fecha.desc(), Cita.hora.desc())
        .all()
    )
    clientes = {c.id_cliente: c for c in db.query(Cliente).all()}
    respuesta = []
    for cita in citas:
        data = AdminCitaResponse(
            id_cita=cita.id_cita,
            id_cliente=cita.id_cliente,
            id_tecnico=cita.id_tecnico,
            nombre_tecnico=cita.nombre_tecnico,
            tipo_servicio=cita.tipo_servicio,
            fecha=cita.fecha,
            hora=cita.hora,
            direccion=cita.direccion,
            descripcion=cita.descripcion,
            estado=cita.estado,
            created_at=cita.created_at,
            cliente_nombre=None,
            cliente_email=None,
        )
        cliente = clientes.get(cita.id_cliente)
        if cliente:
            data.cliente_nombre = f"{cliente.first_name} {cliente.last_name}".strip()
            data.cliente_email = cliente.email
        id_comision, com_porcentaje, com_valor = _info_comision(db, cita)
        data.id_comision_c = id_comision
        data.comision_porcentaje = com_porcentaje
        data.comision_valor = com_valor
        respuesta.append(data)
    return respuesta


def _validar_franja_cita(fecha: date, hora: str, excluir_cita_id: Optional[int] = None) -> None:
    """Valida que la cita sea en día laboral, hora en franjas de 1 hora
    (08:00-18:00) y que la franja no esté reservada por otro cliente."""
    if not _dia_es_laboral(fecha):
        raise HTTPException(
            status_code=400,
            detail="Las citas solo se pueden agendar de lunes a viernes.",
        )
    if hora not in horas_laborales(fecha):
        raise HTTPException(
            status_code=400,
            detail="La hora debe ser una franja de 1 hora entre 08:00 y 18:00 (por ejemplo 09:00).",
        )


def _bloqueo_por_calificacion(db: Session, id_cliente: int) -> None:
    """La calificación del técnico es obligatoria: si el cliente tiene una
    cita Finalizada sin calificar, no puede agendar otra cita."""
    finalizada_sin_calificar = (
        db.query(Cita)
        .outerjoin(
            Calificacion,
            (Calificacion.id_cita_c == Cita.id_cita)
            & (Calificacion.id_cliente_c == Cita.id_cliente),
        )
        .filter(
            Cita.id_cliente == id_cliente,
            Cita.estado == "Finalizada",
            Calificacion.id_calificacion.is_(None),
        )
        .first()
    )
    if finalizada_sin_calificar is not None:
        raise HTTPException(
            status_code=400,
            detail="Debes calificar al técnico de tu última cita finalizada antes de agendar una nueva cita.",
        )


def _es_cliente_con_cita(db: Session, cita_id: int, id_cliente: int) -> bool:
    return (
        db.query(Cita)
        .filter(Cita.id_cita == cita_id, Cita.id_cliente == id_cliente)
        .first()
        is not None
    )


def _get_own_cita(cita_id: int, client: Cliente, db: Session) -> Cita:
    cita = (
        db.query(Cita)
        .filter(Cita.id_cita == cita_id, Cita.id_cliente == client.id_cliente)
        .first()
    )
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return cita


@router.post("", response_model=CrearCitaResponse)
def crear_cita(
    data: CitaCreate,
    client: Cliente = Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Registra una nueva cita para el cliente autenticado.

    El costo se toma de la tarifa fija del servicio y se paga al agendar
    con el simulador académico local."""
    if data.fecha < datetime.now().date():
        raise HTTPException(status_code=400, detail="La fecha de la cita no puede ser anterior a hoy")
    _validar_franja_cita(data.fecha, data.hora)
    _bloqueo_por_calificacion(db, client.id_cliente)
    if slot_tomado(db, data.fecha, data.hora):
        raise HTTPException(
            status_code=400,
            detail="Esa fecha y hora ya fue reservada por otro cliente. Elige otra franja.",
        )
    tarifa = (
        db.query(TarifaServicio)
        .filter(TarifaServicio.tipo_servicio == data.tipo_servicio.lower().strip())
        .first()
    )
    if not tarifa:
        raise HTTPException(
            status_code=400,
            detail="No hay una tarifa configurada para este servicio. Contacta al administrador.",
        )
    if not data.metodo_pago:
        raise HTTPException(status_code=400, detail="Debes seleccionar un método de pago")
    # El técnico debe ser uno real: se ignora el nombre enviado por el cliente
    # y se valida especialidad + disponibilidad en la BD.
    nombre_tecnico = None
    if data.id_tecnico is not None:
        _validar_tecnico_cita(
            db,
            data.id_tecnico,
            data.tipo_servicio,
            data.fecha,
            data.hora,
        )
        nombre_tecnico = _nombre_tecnico_real(db, data.id_tecnico)
    cita = Cita(
        id_cliente=client.id_cliente,
        **data.model_dump(
            exclude={
                "id_tecnico",
                "nombre_tecnico",
                "metodo_pago",
                "datos_pago",
                "costo_cita",
                "estado_pago",
                "numero_transaccion",
            }
        ),
        id_tecnico=data.id_tecnico,
        nombre_tecnico=nombre_tecnico,
        estado="Pendiente",
        costo_cita=tarifa.costo,
    )
    db.add(cita)
    db.commit()
    db.refresh(cita)

    try:
        resultado_pago = pagos_service.procesar_pago(
            data.metodo_pago,
            data.datos_pago or {},
            monto=float(tarifa.costo),
            reference=f"CITA-{cita.id_cita}",
            customer_email=client.email,
        )
    except HTTPException:
        # El pago falló: la cita no debe quedar reservando la franja.
        cita.estado = "Cancelada"
        db.commit()
        raise
    cita.metodo_pago = data.metodo_pago
    cita.estado_pago = resultado_pago.get("estado")
    cita.numero_transaccion = resultado_pago.get("numero_transaccion")
    db.commit()
    db.refresh(cita)

    # Notificar por correo al técnico que recibió la cita.
    if cita.id_tecnico is not None:
        from app.models.tecnico import Tecnico

        tecnico_obj = (
            db.query(Tecnico).filter(Tecnico.id_tecnico == cita.id_tecnico).first()
        )
        if tecnico_obj and tecnico_obj.usuario and tecnico_obj.usuario.email:
            nombre_cliente = f"{client.first_name} {client.last_name}".strip() or "Cliente"
            notificar_cita_asignada_tecnico(
                db,
                tecnico_obj.usuario.id_usuario,
                tecnico_obj.usuario.email,
                cita.nombre_tecnico or "técnico",
                {
                    "cliente": nombre_cliente,
                    "servicio": cita.tipo_servicio,
                    "fecha": cita.fecha.strftime("%d/%m/%Y"),
                    "hora": cita.hora,
                    "direccion": cita.direccion,
                    "telefono": client.telefono_cliente,
                    "descripcion": cita.descripcion,
                },
            )

    return CrearCitaResponse(
        **CitaResponse.model_validate(cita).model_dump(),
        redirect_url=resultado_pago.get("redirect_url"),
    )


@router.get("/horas-disponibles")
def horas_disponibles_cita(
    fecha: date,
    db: Session = Depends(get_db),
):
    """Franjas horarias de 1 hora libres (no reservadas por otra cita) para
    la fecha indicada. Vacío si la fecha es fin de semana o fue reservada
    por completo."""
    if not _dia_es_laboral(fecha) or fecha < date.today():
        return []
    return [h for h in horas_laborales(fecha) if not slot_tomado(db, fecha, h)]


@router.put("/admin/{cita_id}", response_model=AdminCitaResponse)
def gestionar_cita_admin(
    cita_id: int,
    data: AdminCitaUpdate,
    current_admin: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Actualiza estado y técnico asignado de una cita (solo admin)"""
    cita = db.query(Cita).filter(Cita.id_cita == cita_id).first()
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    if data.estado is not None:
        if data.estado not in ESTADOS_CITA:
            raise HTTPException(status_code=400, detail="Estado de cita no válido")
        cita.estado = data.estado
    # Al asignar un técnico se valida que exista, sea compatible con el
    # servicio y esté libre en la fecha/hora (sin contar esta misma cita).
    if "id_tecnico" in data.model_fields_set:
        if data.id_tecnico is None:
            cita.id_tecnico = None
            cita.nombre_tecnico = None
        else:
            _validar_tecnico_cita(
                db,
                data.id_tecnico,
                cita.tipo_servicio,
                cita.fecha,
                cita.hora,
                excluir_cita_id=cita.id_cita,
            )
            cita.id_tecnico = data.id_tecnico
            cita.nombre_tecnico = _nombre_tecnico_real(db, data.id_tecnico)
    elif data.nombre_tecnico is not None:
        cita.nombre_tecnico = data.nombre_tecnico
    # Comisión por el servicio: comision_porcentaje crea una comisión con ese
    # % sobre el costo de la cita; comision_valor la crea con un monto fijo.
    if data.comision_porcentaje is not None or data.comision_valor is not None:
        if data.comision_porcentaje is not None:
            if data.comision_porcentaje <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="El porcentaje de la comisión debe ser mayor a cero",
                )
            if cita.costo_cita is None:
                raise HTTPException(
                    status_code=400,
                    detail="La cita no tiene costo para calcular la comisión por porcentaje",
                )
            pct = Decimal(str(data.comision_porcentaje)).quantize(Decimal("0.01"))
            valor = (cita.costo_cita * pct / Decimal("100")).quantize(Decimal("0.01"))
        else:
            if data.comision_valor <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="El valor de la comisión debe ser mayor a cero",
                )
            valor = Decimal(str(data.comision_valor)).quantize(Decimal("0.01"))
            pct = (
                (valor / cita.costo_cita * Decimal("100")).quantize(Decimal("0.01"))
                if cita.costo_cita
                else None
            )
        comision = Comision(porcentaje_comision=pct, valor_comision=valor)
        db.add(comision)
        db.flush()
        cita.id_comision_c = comision.id_comision
    elif "id_comision_c" in data.model_fields_set:
        if data.id_comision_c is None:
            cita.id_comision_c = None
        elif not db.query(Comision).filter(Comision.id_comision == data.id_comision_c).first():
            raise HTTPException(status_code=400, detail="La comisión indicada no existe")
        else:
            cita.id_comision_c = data.id_comision_c
    db.commit()
    db.refresh(cita)
    cliente = db.query(Cliente).filter(Cliente.id_cliente == cita.id_cliente).first()
    id_comision, com_porcentaje, com_valor = _info_comision(db, cita)
    return AdminCitaResponse(
        id_cita=cita.id_cita,
        id_cliente=cita.id_cliente,
        id_tecnico=cita.id_tecnico,
        nombre_tecnico=cita.nombre_tecnico,
        tipo_servicio=cita.tipo_servicio,
        fecha=cita.fecha,
        hora=cita.hora,
        direccion=cita.direccion,
        descripcion=cita.descripcion,
        estado=cita.estado,
        costo_cita=float(cita.costo_cita) if cita.costo_cita is not None else None,
        metodo_pago=cita.metodo_pago,
        estado_pago=cita.estado_pago,
        numero_transaccion=cita.numero_transaccion,
        created_at=cita.created_at,
        cliente_nombre=f"{cliente.first_name} {cliente.last_name}".strip() if cliente else None,
        cliente_email=cliente.email if cliente else None,
        id_comision_c=id_comision,
        comision_porcentaje=com_porcentaje,
        comision_valor=com_valor,
    )


@router.get("/mis-citas", response_model=List[ClienteCitaResponse])
def mis_citas(
    client: Cliente = Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Lista las citas del cliente autenticado, ordenadas por fecha y hora"""
    citas = (
        db.query(Cita)
        .filter(Cita.id_cliente == client.id_cliente)
        .order_by(Cita.fecha.asc(), Cita.hora.asc())
        .all()
    )
    return [_serializar_cita_cliente(db, cita) for cita in citas]


@router.put("/{cita_id}", response_model=CitaResponse)
def editar_cita(
    cita_id: int,
    data: CitaUpdate,
    client: Cliente = Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Actualiza los datos de una cita propia aún modificable"""
    cita = _get_own_cita(cita_id, client, db)
    if cita.estado not in ESTADOS_EDITABLES:
        raise HTTPException(status_code=400, detail="No se puede modificar una cita finalizada o cancelada")
    update_data = data.model_dump(exclude_unset=True)
    if "fecha" in update_data and update_data["fecha"] < datetime.now().date():
        raise HTTPException(status_code=400, detail="La fecha de la cita no puede ser anterior a hoy")
    nueva_fecha = update_data.get("fecha", cita.fecha)
    nueva_hora = update_data.get("hora", cita.hora)
    _validar_franja_cita(nueva_fecha, nueva_hora)
    if slot_tomado(db, nueva_fecha, nueva_hora, excluir_cita_id=cita.id_cita):
        raise HTTPException(
            status_code=400,
            detail="Esa fecha y hora ya fue reservada por otro cliente. Elige otra franja.",
        )
    if cita.id_tecnico is not None:
        _validar_tecnico_cita(
            db,
            cita.id_tecnico,
            update_data.get("tipo_servicio", cita.tipo_servicio),
            update_data.get("fecha", cita.fecha),
            update_data.get("hora", cita.hora),
            excluir_cita_id=cita.id_cita,
        )
    for field, value in update_data.items():
        setattr(cita, field, value)
    # Cualquier modificación regresa la cita a estado Pendiente
    if cita.estado != "Pendiente":
        cita.estado = "Pendiente"
    db.commit()
    db.refresh(cita)
    return cita


@router.delete("/{cita_id}", response_model=CitaResponse)
def cancelar_cita(
    cita_id: int,
    client: Cliente = Depends(get_current_client),
    db: Session = Depends(get_db),
):
    """Cancela una cita propia (pasa a estado Cancelada)"""
    cita = _get_own_cita(cita_id, client, db)
    if cita.estado == "Finalizada":
        raise HTTPException(status_code=400, detail="No se puede cancelar una cita ya finalizada")
    cita.estado = "Cancelada"
    db.commit()
    db.refresh(cita)
    return cita
