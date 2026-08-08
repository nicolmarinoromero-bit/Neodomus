from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Pedido(Base):
    __tablename__ = "pedidos"

    id_pedido: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_cliente_pe: Mapped[int] = mapped_column(ForeignKey("clientes.id_cliente"), nullable=True)
    fecha_peedido: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    total_pedido: Mapped[float] = mapped_column(Float, nullable=True)
    estado_pedido: Mapped[str] = mapped_column(String(50), nullable=True)

    cliente = relationship("Cliente", foreign_keys=[id_cliente_pe])
    detalles = relationship("DetallePedido", back_populates="pedido")


class DetallePedido(Base):
    __tablename__ = "detalle_pedido"

    id_detalle: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_pedido_d: Mapped[int] = mapped_column(ForeignKey("pedidos.id_pedido"), nullable=True)
    id_producto_d: Mapped[int] = mapped_column(ForeignKey("productos.id_producto"), nullable=True)
    id_servicio_d: Mapped[int] = mapped_column(Integer, nullable=True)
    id_comision_d: Mapped[int] = mapped_column(Integer, nullable=True)
    cantidad_detalle: Mapped[int] = mapped_column(Integer, nullable=True, default=1)
    precio_unitario_detalle: Mapped[float] = mapped_column(Float, nullable=True)
    subtotal_detalle: Mapped[float] = mapped_column(Float, nullable=True)

    pedido = relationship("Pedido", back_populates="detalles")
    producto = relationship("Producto", foreign_keys=[id_producto_d])