from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Producto(Base):
    __tablename__ = "productos"
    id_producto = Column(Integer, primary_key=True, index=True)
    nombre_producto = Column(String(100))
    referencia_producto = Column(String(50), unique=True)
    id_proveedor_pr = Column(Integer, ForeignKey("proveedores.id_proveedor"))
    precio_compra_producto = Column(Float)
    precio_venta_producto = Column(Float)
    fecha_registro_producto = Column(DateTime)
    imagen_url = Column(String(255), nullable=True)
    id_cate_pr = Column(Integer, ForeignKey("categorias.id_categoria"))
    categoria = relationship("Categoria", foreign_keys=[id_cate_pr])