"""
Servicio: especialidad y disponibilidad de técnicos para citas.

Centraliza las reglas:
  1) Compatibilidad entre tipo de servicio y especialidad del técnico.
  2) Ocupación del técnico según citas ya registradas (fecha + hora).
"""
import unicodedata
from datetime import date
from typing import Iterable, Optional

from sqlalchemy.orm import Session

from app.models.cita import Cita

# Estados que bloquean la agenda del técnico
ESTADOS_OCUPAN = ("Pendiente", "Confirmada")

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


def tecnico_ocupado(
    db: Session,
    id_tecnico: Optional[int],
    fecha: date,
    hora: str,
    excluir_cita_id: Optional[int] = None,
) -> bool:
    """True si el técnico ya tiene una cita activa (Pendiente/Confirmada)
    en la misma fecha y hora (sin contar `excluir_cita_id`)."""
    if id_tecnico is None:
        return False
    query = db.query(Cita).filter(
        Cita.id_tecnico == id_tecnico,
        Cita.fecha == fecha,
        Cita.hora == hora,
        Cita.estado.in_(ESTADOS_OCUPAN),
    )
    if excluir_cita_id is not None:
        query = query.filter(Cita.id_cita != excluir_cita_id)
    return query.first() is not None