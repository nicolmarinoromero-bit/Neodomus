"""
Servicio: especialidad y disponibilidad de técnicos para citas.

Centraliza las reglas:
  1) Compatibilidad entre tipo de servicio y especialidad del técnico.
  2) Ocupación del técnico por día (una cita o entrega activa bloquea TODO
     el día, para que el técnico no atienda a otros clientes ese día).
  3) Exclusividad de franja horaria: una fecha + hora solo puede ser
     reservada por un cliente a la vez.
"""
import unicodedata
from datetime import date
from typing import Iterable, Optional

from sqlalchemy.orm import Session

from app.models.cita import Cita

# Estados que bloquean la agenda del técnico
ESTADOS_OCUPAN = ("Pendiente", "Confirmada")

# Estados de entrega que bloquean el día del técnico
ESTADOS_ENTREGA_OCUPAN = ("Asignada", "En camino")

# Franja laboral: citas en incrementos de 1 hora, lunes a viernes
HORA_INICIO = 8
HORA_FIN = 18
DIAS_LABORALES = (0, 1, 2, 3, 4)  # Monday..Friday

# Palabras clave (normalizadas, sin tildes, minúsculas) que identifican la
# especialidad compatible con cada tipo de servicio.
ESPECIALIDADES_POR_SERVICIO: dict[str, tuple[str, ...]] = {
    "instalacion": (
        "instalacion", "domotica", "automatizacion", "cableado",
        "redes", "electrico", "electrica", "electronica", "hogar", "iot",
    ),
    "mantenimiento": (
        "mantenimiento", "preventivo", "soporte", "servidores",
        "bases de datos", "sistemas", "iot", "redes",
    ),
    "reparacion": (
        "reparacion", "diagnostico", "programacion", "plc", "backend",
        "informatica", "seguridad", "sistemas", "electronica",
    ),
    "revision": (
        "revision", "diagnostico", "supervision", "control",
        "seguridad", "sistemas",
    ),
    "soporte": (
        "soporte", "asistencia", "ayuda", "configuracion",
        "sistemas", "software", "informatica", "redes", "mesa",
    ),
}


def _normalizar(texto: Optional[str]) -> str:
    """Minúsculas y sin tildes para comparaciones robustas."""
    if texto is None:
        return ""
    s = texto.lower()
    s = "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))
    return s


def compatible_especialidad(tipo_servicio: Optional[str], certificacion: Optional[str]) -> bool:
    """True si el técnico (por su certificación) puede atender el servicio."""
    servicio = _normalizar(tipo_servicio)
    palabras = ESPECIALIDADES_POR_SERVICIO.get(servicio)
    if palabras is None:
        # Servicio desconocido: no restringir
        return True
    cert = _normalizar(certificacion)
    return any(p in cert for p in palabras)


def _dia_es_laboral(fecha: date) -> bool:
    """True solo de lunes a viernes."""
    return fecha.weekday() in DIAS_LABORALES


def horas_laborales(fecha: date) -> list[str]:
    """Franjas horarias de 1 hora de la jornada (08:00-18:00)."""
    return [f"{h:02d}:00" for h in range(HORA_INICIO, HORA_FIN)]


def slot_tomado(db: Session, fecha: date, hora: str, excluir_cita_id: Optional[int] = None) -> bool:
    """True si ya existe una cita activa en esa fecha y hora (sin contar
    `excluir_cita_id`). Una franja solo puede ser reservada por un cliente."""
    query = db.query(Cita).filter(
        Cita.fecha == fecha,
        Cita.hora == hora,
        Cita.estado.in_(ESTADOS_OCUPAN),
    )
    if excluir_cita_id is not None:
        query = query.filter(Cita.id_cita != excluir_cita_id)
    return query.first() is not None


def tecnico_ocupado(
    db: Session,
    id_tecnico: Optional[int],
    fecha: date,
    hora: str | None = None,
    excluir_cita_id: Optional[int] = None,
) -> bool:
    """True si el técnico ya tiene una cita activa (Pendiente/Confirmada)
    o una entrega asignada ese DÍA (no solo a la misma hora): el día del
    técnico queda ocupado para otros clientes. `hora` se conserva solo por
    compatibilidad (no se usa en la comparación)."""
    if id_tecnico is None:
        return False
    query = db.query(Cita).filter(
        Cita.id_tecnico == id_tecnico,
        Cita.fecha == fecha,
        Cita.estado.in_(ESTADOS_OCUPAN),
    )
    if excluir_cita_id is not None:
        query = query.filter(Cita.id_cita != excluir_cita_id)
    if query.first() is not None:
        return True
    from app.models.pedido import Pedido

    entrega = db.query(Pedido).filter(
        Pedido.id_tecnico_entrega == id_tecnico,
        Pedido.fecha_entrega == fecha,
        Pedido.estado_entrega.in_(ESTADOS_ENTREGA_OCUPAN),
    ).first()
    return entrega is not None