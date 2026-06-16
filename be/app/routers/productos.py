from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models.producto import Producto
from app.models.categoria import Categoria
from pydantic import BaseModel

# Definir esquemas aquí (o importar desde schemas/producto.py)
class ProductoResponse(BaseModel):
    id_producto: int
    nombre_producto: str
    precio_venta_producto: float
    imagen_url: Optional[str] = None
    id_cate_pr: Optional[int] = None
    nombre_categoria: Optional[str] = None

class CategoriaResponse(BaseModel):
    id_categoria: int
    nombre_categoria: str
    descripcion: str

# 🔥 Cambiar prefix a "/productos" (sin /api/v1)
router = APIRouter(prefix="/productos", tags=["productos"])

@router.get("/", response_model=dict)
def listar_productos(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None),
    categoria: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100)
):
    query = db.query(Producto).outerjoin(Categoria, Producto.id_cate_pr == Categoria.id_categoria)
    if search:
        query = query.filter(Producto.nombre_producto.ilike(f"%{search}%"))
    if categoria:
        query = query.filter(Producto.id_cate_pr == categoria)
    total = query.count()
    productos = query.offset((page-1)*limit).limit(limit).all()
    data = []
    for p in productos:
        data.append(ProductoResponse(
            id_producto=p.id_producto,
            nombre_producto=p.nombre_producto,
            precio_venta_producto=p.precio_venta_producto,
            imagen_url=p.imagen_url,
            id_cate_pr=p.id_cate_pr,
            nombre_categoria=p.categoria.nombre_categoria if p.categoria else None
        ))
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": [d.dict() for d in data],
        "total_pages": (total + limit - 1) // limit
    }

@router.get("/categorias", response_model=List[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).all()