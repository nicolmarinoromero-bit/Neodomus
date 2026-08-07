from datetime import datetime, date
from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Cita(Base):
    __tablename__ = "citas"

    id_cita: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_cliente: Mapped[int] = mapped_column(
        ForeignKey("clientes.id_cliente", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    id_tecnico: Mapped[int] = mapped_column(Integer, nullable=True)
    nombre_tecnico: Mapped[str] = mapped_column(String(150), nullable=True)
    tipo_servicio: Mapped[str] = mapped_column(String(30), nullable=False)
    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    hora: Mapped[str] = mapped_column(String(10), nullable=False)
    direccion: Mapped[str] = mapped_column(String(200), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=True)
    estado: Mapped[str] = mapped_column(String(20), nullable=False, default="Pendiente")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
