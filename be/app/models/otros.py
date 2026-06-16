from sqlalchemy import Column, Integer, String
from ..database import Base

class TipoDocumento(Base):
    __tablename__ = "tipos_documento"
    id_tipo_documento = Column(Integer, primary_key=True, autoincrement=True)
    nombre_tipo = Column(String(2))