from fastapi import APIRouter, Depends, Query
# PARA: Importa APIRouter para crear un grupo de rutas, Depends para inyección de dependencias, y Query para definir parámetros de consulta (query parameters).
# IMPACTO: Permite estructurar rutas modulares, inyectar dependencias como la sesión de base de datos, y recibir parámetros opcionales como search, categoria, page y limit desde la URL.

from sqlalchemy.orm import Session
# PARA: Importa el tipo Session de SQLAlchemy para tipar la sesión de base de datos.
# IMPACTO: Ayuda en la verificación de tipos y documenta que las funciones reciben una sesión de BD.

from typing import Optional, List
# PARA: Importa Optional (para valores que pueden ser None) y List (para listas tipadas).
# IMPACTO: Permite anotar tipos como Optional[str] o List[CategoriaSchema], mejorando la claridad y el soporte de IDEs.

from app.database import get_db
# PARA: Importa la función get_db que provee una sesión de SQLAlchemy.
# IMPACTO: Se usa como dependencia para obtener una sesión de base de datos en cada endpoint y gestionar automáticamente el cierre de la conexión.

from app.models.producto import Producto
# PARA: Importa el modelo Producto (tabla "productos").
# IMPACTO: Permite realizar consultas a la tabla de productos usando SQLAlchemy ORM.

from app.models.categoria import Categoria
# PARA: Importa el modelo Categoria (tabla "categorias").
# IMPACTO: Permite hacer joins y consultas a la tabla de categorías, por ejemplo para obtener el nombre de la categoría de cada producto.

from app.schemas.producto import CategoriaSchema
# PARA: Importa el esquema CategoriaSchema (Pydantic) definido en app/schemas/producto.
# IMPACTO: Se usa en el endpoint /categorias para validar y serializar la respuesta como una lista de objetos con formato predefinido.

router = APIRouter(prefix="/productos", tags=["productos"])
# PARA: Crea una instancia de APIRouter con el prefijo "/productos" y la etiqueta "productos".
# IMPACTO: Todas las rutas definidas aquí comenzarán con /productos (ej. /productos/, /productos/categorias) y aparecerán agrupadas bajo la etiqueta "productos" en la documentación Swagger.

@router.get("/", response_model=dict)
def listar_productos(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None),
    categoria: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100)
):
# PARA: Define un endpoint GET en /productos/ con parámetros de consulta: search (texto opcional), categoria (ID opcional), page (mínimo 1), limit (entre 1 y 100). Depende de get_db para obtener la sesión. La respuesta es un dict (paginación + lista de productos).
# IMPACTO: Permite listar productos con filtros, paginación y búsqueda por nombre. Es la ruta principal del catálogo de productos.

    query = db.query(Producto).outerjoin(Categoria, Producto.id_cate_pr == Categoria.id_categoria)
# PARA: Construye una consulta inicial que selecciona Productos y hace un LEFT OUTER JOIN con Categoria usando la condición Producto.id_cate_pr == Categoria.id_categoria.
# IMPACTO: Asegura que se incluyan productos aunque no tengan categoría (por eso el OUTER JOIN). Esto permite mostrar el nombre de la categoría solo si existe.

    if search:
        query = query.filter(Producto.nombre_producto.ilike(f"%{search}%"))
# PARA: Si se proporciona el parámetro search, filtra los productos cuyo nombre contenga el texto (búsqueda case-insensitive con ILIKE).
# IMPACTO: Habilita la búsqueda por nombre de producto, útil para el usuario que no conoce el ID exacto.

    if categoria:
        query = query.filter(Producto.id_cate_pr == categoria)
# PARA: Si se proporciona el parámetro categoria (ID de categoría), filtra los productos que pertenecen a esa categoría.
# IMPACTO: Permite navegar por categorías, mostrando solo productos de una categoría específica.

    total = query.count()
# PARA: Cuenta la cantidad total de productos que cumplen los filtros (sin aplicar paginación).
# IMPACTO: Se usa para calcular el total de páginas y devolver información de paginación al frontend.

    productos = query.offset((page-1)*limit).limit(limit).all()
# PARA: Aplica paginación: salta (page-1)*limit registros y luego toma `limit` registros. Ejecuta la consulta y devuelve una lista de objetos Producto.
# IMPACTO: Evita cargar todos los productos de una vez, mejorando el rendimiento en catálogos grandes.

    data = []
    for p in productos:
        data.append({
            "id_producto": p.id_producto,
            "nombre_producto": p.nombre_producto,
            "precio_venta_producto": p.precio_venta_producto,
            "imagen_url": p.imagen_url,
            "id_cate_pr": p.id_cate_pr,
            "nombre_categoria": p.categoria.nombre_categoria if p.categoria else None
        })
# PARA: Itera sobre los productos obtenidos y construye una lista de diccionarios con los campos necesarios para la respuesta. Si el producto tiene categoría, incluye su nombre; si no, coloca None.
# IMPACTO: Transforma los objetos SQLAlchemy en un formato JSON sencillo. Evita devolver datos internos no deseados (como relaciones completas) y resuelve el nombre de la categoría.

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": data,
        "total_pages": (total + limit - 1) // limit
    }
# PARA: Retorna un diccionario con metadatos de paginación (total de elementos, página actual, límite por página, total de páginas) y la lista de productos en la clave "data".
# IMPACTO: El frontend puede mostrar una paginación completa y renderizar la lista de productos fácilmente.

@router.get("/categorias", response_model=List[CategoriaSchema])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).all()
# PARA: Define un endpoint GET en /productos/categorias que depende de get_db y retorna una lista de objetos CategoriaSchema.
# IMPACTO: Devuelve todas las categorías disponibles. Útil para llenar un selector de categorías en el frontend. La respuesta será validada según el esquema CategoriaSchema (que normalmente incluye id_categoria y nombre_categoria, por ejemplo).