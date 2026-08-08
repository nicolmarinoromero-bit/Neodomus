from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from app.database import get_db
from app.models.producto import Producto
from app.models.producto_variante import ProductoVariante
from app.models.categoria import Categoria
from app.models.proveedor import Proveedor
from app.models.roles_usuario import RolesUsuario
from app.models.user import User
from app.utils.security import get_current_employee

# Umbral de stock bajo (configurable). Productos con stock >= STOCK_MINIMO
# se consideran "disponible"; entre 1 y STOCK_MINIMO-1 "bajo"; 0 => "agotado".
STOCK_MINIMO = 5


def _estado_stock(stock: int) -> str:
    if stock <= 0:
        return "agotado"
    if stock < STOCK_MINIMO:
        return "bajo"
    return "disponible"


# ── Esquemas ─────────────────────────────────────────────
class VarianteResponse(BaseModel):
    id: int
    nombre: str
    hex: Optional[str] = None
    imagen_url: Optional[str] = None
    stock: int = 0


class ProductoResponse(BaseModel):
    id_producto: int
    nombre_producto: str
    referencia_producto: Optional[str] = None
    precio_compra_producto: Optional[float] = None
    precio_venta_producto: float
    fecha_registro_producto: Optional[datetime] = None
    imagen_url: Optional[str] = None
    id_cate_pr: Optional[int] = None
    nombre_categoria: Optional[str] = None
    id_proveedor_pr: Optional[int] = None
    nombre_proveedor: Optional[str] = None
    descripcion_producto: Optional[str] = None
    colores_producto: Optional[str] = None
    estado_producto: str = "activo"
    stock_producto: int = 0
    stock_estado: str = "disponible"
    stock_minimo: int = STOCK_MINIMO
    variantes: List[VarianteResponse] = []


class ProductoCreate(BaseModel):
    nombre_producto: str
    referencia_producto: Optional[str] = None
    id_proveedor_pr: Optional[int] = None
    precio_compra_producto: Optional[float] = None
    precio_venta_producto: float
    imagen_url: Optional[str] = None
    id_cate_pr: Optional[int] = None
    descripcion_producto: Optional[str] = None
    colores_producto: Optional[str] = None
    estado_producto: Optional[str] = "activo"
    stock_producto: int = 0


class CategoriaResponse(BaseModel):
    id_categoria: int
    nombre_categoria: str
    descripcion: Optional[str] = None


class VarianteCreate(BaseModel):
    nombre: str
    hex: Optional[str] = None
    imagen_url: Optional[str] = None
    stock: int = 0


class ProveedorResponse(BaseModel):
    id_proveedor: int
    nombre_proveedor: str
    contacto_proveedor: Optional[str] = None
    telefono_proveedor: Optional[str] = None
    correo_proveedor: Optional[str] = None
    direccion_proveedor: Optional[str] = None


def _admin(
    current_user: User = Depends(get_current_employee),
    db: Session = Depends(get_db),
) -> User:
    role = db.execute(select(RolesUsuario.nombre_rol).where(RolesUsuario.id_rol == current_user.id_rol_u)).scalar_one_or_none()
    if role not in ("admin", "administrador"):
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    return current_user


def _serializar_variante(v: ProductoVariante) -> VarianteResponse:
    return VarianteResponse(
        id=v.id,
        nombre=v.nombre,
        hex=v.hex,
        imagen_url=v.imagen_url,
        stock=v.stock or 0,
    )


def _serializar(p: Producto) -> ProductoResponse:
    return ProductoResponse(
        id_producto=p.id_producto,
        nombre_producto=p.nombre_producto,
        referencia_producto=p.referencia_producto,
        precio_compra_producto=p.precio_compra_producto,
        precio_venta_producto=p.precio_venta_producto,
        fecha_registro_producto=p.fecha_registro_producto,
        imagen_url=p.imagen_url,
        id_cate_pr=p.id_cate_pr,
        nombre_categoria=p.categoria.nombre_categoria if p.categoria else None,
        id_proveedor_pr=p.id_proveedor_pr,
        nombre_proveedor=p.proveedor.nombre_proveedor if p.proveedor else None,
        descripcion_producto=p.descripcion_producto,
        colores_producto=p.colores_producto,
        estado_producto=p.estado_producto or "activo",
        stock_producto=p.stock_producto or 0,
        stock_estado=_estado_stock(p.stock_producto or 0),
        stock_minimo=STOCK_MINIMO,
        variantes=[_serializar_variante(v) for v in p.variantes],
    )


router = APIRouter(prefix="/productos", tags=["productos"])


@router.get("/", response_model=dict)
def listar_productos(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None),
    categoria: Optional[int] = Query(None),
    estado: Optional[str] = Query("activo"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
):
    query = db.query(Producto).outerjoin(Categoria, Producto.id_cate_pr == Categoria.id_categoria)
    if estado == "activo":
        query = query.filter(Producto.estado_producto == "activo")
    elif estado == "inactivo":
        query = query.filter(Producto.estado_producto == "inactivo")
    if search:
        query = query.filter(Producto.nombre_producto.ilike(f"%{search}%"))
    if categoria:
        query = query.filter(Producto.id_cate_pr == categoria)
    total = query.count()
    productos = query.order_by(Producto.id_producto.desc()).offset((page - 1) * limit).limit(limit).all()
    data = [_serializar(p).dict() for p in productos]
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": data,
        "total_pages": (total + limit - 1) // limit,
    }


@router.get("/categorias", response_model=List[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).order_by(Categoria.id_categoria.asc()).all()


@router.get("/proveedores", response_model=List[ProveedorResponse])
def listar_proveedores(_admin_user: User = Depends(_admin), db: Session = Depends(get_db)):
    return db.query(Proveedor).order_by(Proveedor.nombre_proveedor.asc()).all()


@router.get("/{producto_id}", response_model=ProductoResponse)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    p = db.query(Producto).filter(Producto.id_producto == producto_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return _serializar(p)


@router.get("/{producto_id}/variantes", response_model=List[VarianteResponse])
def listar_variantes(producto_id: int, db: Session = Depends(get_db)):
    """Lista las variantes de color de un producto (público)."""
    p = db.query(Producto).filter(Producto.id_producto == producto_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return [_serializar_variante(v) for v in p.variantes]


@router.post("/{producto_id}/variantes", response_model=VarianteResponse)
def crear_variante(
    producto_id: int,
    data: VarianteCreate,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Agrega una variante de color a un producto (solo administrador)."""
    p = db.query(Producto).filter(Producto.id_producto == producto_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    nombre = data.nombre.strip()
    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre de la variante es obligatorio")
    variante = ProductoVariante(
        id_producto=producto_id,
        nombre=nombre,
        hex=(data.hex or "").strip() or None,
        imagen_url=(data.imagen_url or "").strip() or None,
        stock=data.stock or 0,
    )
    db.add(variante)
    db.commit()
    db.refresh(variante)
    return _serializar_variante(variante)


@router.put("/{producto_id}/variantes/{variante_id}", response_model=VarianteResponse)
def editar_variante(
    producto_id: int,
    variante_id: int,
    data: VarianteCreate,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Actualiza una variante de color (solo administrador)."""
    variante = (
        db.query(ProductoVariante)
        .filter(
            ProductoVariante.id == variante_id,
            ProductoVariante.id_producto == producto_id,
        )
        .first()
    )
    if not variante:
        raise HTTPException(status_code=404, detail="Variante no encontrada")
    variante.nombre = data.nombre.strip()
    variante.hex = (data.hex or "").strip() or None
    variante.imagen_url = (data.imagen_url or "").strip() or None
    variante.stock = data.stock or 0
    db.commit()
    db.refresh(variante)
    return _serializar_variante(variante)


@router.delete("/{producto_id}/variantes/{variante_id}", response_model=dict)
def eliminar_variante(
    producto_id: int,
    variante_id: int,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Elimina una variante de color (solo administrador)."""
    variante = (
        db.query(ProductoVariante)
        .filter(
            ProductoVariante.id == variante_id,
            ProductoVariante.id_producto == producto_id,
        )
        .first()
    )
    if not variante:
        raise HTTPException(status_code=404, detail="Variante no encontrada")
    db.delete(variante)
    db.commit()
    return {"msg": "Variante eliminada correctamente"}


@router.post("", response_model=ProductoResponse)
def crear_producto(
    data: ProductoCreate,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Crea un producto nuevo (solo administrador)"""
    nombre = data.nombre_producto.strip()
    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre del producto es obligatorio")
    referencia = (data.referencia_producto or "").strip() or _generar_referencia(nombre)
    existe_ref = db.query(Producto).filter(Producto.referencia_producto == referencia).first()
    if existe_ref:
        raise HTTPException(status_code=400, detail="La referencia ya está en uso")
    producto = Producto(
        nombre_producto=nombre,
        referencia_producto=referencia,
        id_proveedor_pr=data.id_proveedor_pr,
        precio_compra_producto=data.precio_compra_producto,
        precio_venta_producto=data.precio_venta_producto,
        fecha_registro_producto=datetime.now(),
        imagen_url=data.imagen_url,
        id_cate_pr=data.id_cate_pr,
        descripcion_producto=data.descripcion_producto,
        colores_producto=data.colores_producto,
        estado_producto=data.estado_producto or "activo",
        stock_producto=data.stock_producto or 0,
    )
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return _serializar(producto)


@router.put("/{producto_id}", response_model=ProductoResponse)
def editar_producto(
    producto_id: int,
    data: ProductoCreate,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Actualiza un producto (solo administrador)"""
    producto = db.query(Producto).filter(Producto.id_producto == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    campos = {
        "nombre_producto": data.nombre_producto.strip(),
        "id_proveedor_pr": data.id_proveedor_pr,
        "precio_compra_producto": data.precio_compra_producto,
        "precio_venta_producto": data.precio_venta_producto,
        "imagen_url": data.imagen_url,
        "id_cate_pr": data.id_cate_pr,
        "descripcion_producto": data.descripcion_producto,
        "colores_producto": data.colores_producto,
        "estado_producto": data.estado_producto or "activo",
        "stock_producto": data.stock_producto or 0,
    }
    for campo, valor in campos.items():
        setattr(producto, campo, valor)
    db.commit()
    db.refresh(producto)
    return _serializar(producto)


@router.delete("/{producto_id}", response_model=dict)
def eliminar_producto(
    producto_id: int,
    _admin_user: User = Depends(_admin),
    db: Session = Depends(get_db),
):
    """Elimina un producto (solo administrador). Si tiene historial de pedidos, lo desactiva."""
    producto = db.query(Producto).filter(Producto.id_producto == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    try:
        db.delete(producto)
        db.commit()
        return {"msg": "Producto eliminado correctamente", "eliminado": True}
    except IntegrityError:
        db.rollback()
        producto.estado_producto = "inactivo"
        db.commit()
        return {"msg": "Producto desactivado (tiene historial asociado)", "eliminado": False}


def _generar_referencia(nombre: str) -> str:
    import time

    base = "".join(c for c in nombre.lower() if c.isalnum() or c in " -_")[:20].strip().replace(" ", "-")
    return f"ref-{base or 'producto'}-{int(time.time() * 1000) % 100000}"

