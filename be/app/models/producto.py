from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
# PARA: Importa los tipos Column, Integer, String, Float, DateTime y ForeignKey de SQLAlchemy.
# IMPACTO: Permite definir columnas con tipos numéricos (Integer, Float), texto (String), fechas (DateTime) y establecer claves foráneas (ForeignKey) para relaciones entre tablas.

from sqlalchemy.orm import relationship
# PARA: Importa la función relationship de sqlalchemy.orm para definir relaciones entre modelos ORM.
# IMPACTO: Permite acceder a objetos relacionados (por ejemplo, obtener la categoría de un producto) de forma intuitiva, sin escribir JOINs manualmente.

from app.database import Base
# PARA: Importa la clase Base desde app.database, que es la instancia de declarative_base().
# IMPACTO: Heredar de Base convierte esta clase en un modelo ORM, permitiendo que SQLAlchemy cree la tabla "productos" y la gestione en migraciones.

class Producto(Base):
# PARA: Define la clase Producto como un modelo ORM que hereda de Base, representando la tabla "productos".
# IMPACTO: SQLAlchemy mapea esta clase a una tabla real en la base de datos, permitiendo operaciones CRUD sobre los productos del sistema.

    __tablename__ = "productos"
# PARA: Asigna explícitamente el nombre de la tabla en la base de datos como "productos".
# IMPACTO: Fija un nombre claro y consistente para la tabla, evitando que SQLAlchemy genere un nombre automático (por defecto "producto" en singular).

    id_producto = Column(Integer, primary_key=True, index=True)
# PARA: Define la columna id_producto como entero, clave primaria y con índice.
# IMPACTO: Proporciona un identificador único y autoincremental para cada producto. El índice acelera búsquedas por este campo.

    nombre_producto = Column(String(100))
# PARA: Define la columna nombre_producto como cadena de hasta 100 caracteres, sin restricción de nulidad (por defecto nullable=True).
# IMPACTO: Almacena el nombre del producto. Al ser opcional, podría haber productos sin nombre, lo cual podría ser indeseable desde el punto de vista de negocio.

    referencia_producto = Column(String(50), unique=True)
# PARA: Define la columna referencia_producto como cadena de hasta 50 caracteres, con restricción de unicidad.
# IMPACTO: Cada producto debe tener una referencia única (código interno, SKU). La unicidad evita duplicados, útil para inventario y búsquedas.

    id_proveedor_pr = Column(Integer, ForeignKey("proveedores.id_proveedor"))
# PARA: Define la columna id_proveedor_pr como entero, clave foránea que referencia la columna id_proveedor de la tabla "proveedores".
# IMPACTO: Relaciona cada producto con un proveedor. La clave foránea asegura integridad referencial: no se puede asignar un proveedor que no exista. Si se elimina un proveedor, el comportamiento depende de ondelete (no especificado, por defecto RESTRICT).

    precio_compra_producto = Column(Float)
# PARA: Define la columna precio_compra_producto como número flotante (decimal).
# IMPACTO: Almacena el costo de compra del producto. Al ser Float, puede haber pequeñas imprecisiones; para dinero es mejor usar Numeric, pero aquí se eligió Float por simplicidad. Nullable por defecto.

    precio_venta_producto = Column(Float)
# PARA: Define la columna precio_venta_producto como número flotante.
# IMPACTO: Almacena el precio de venta al público. Al igual que precio_compra, podría ser opcional, pero normalmente debería ser obligatorio.

    fecha_registro_producto = Column(DateTime)
# PARA: Define la columna fecha_registro_producto como tipo DateTime.
# IMPACTO: Registra cuándo se añadió el producto al sistema. No tiene valor por defecto, por lo que debería asignarse desde la aplicación. Podría usarse para auditoría.

    imagen_url = Column(String(255), nullable=True)
# PARA: Define la columna imagen_url como cadena de hasta 255 caracteres, opcional (nullable=True).
# IMPACTO: Almacena la URL de la imagen del producto. Al ser opcional, no todos los productos necesitan tener una imagen asociada.

    id_cate_pr = Column(Integer, ForeignKey("categorias.id_categoria"))
# PARA: Define la columna id_cate_pr como entero, clave foránea que referencia la columna id_categoria de la tabla "categorias".
# IMPACTO: Relaciona el producto con una categoría (por ejemplo, electrónicos, ropa, etc.). La clave foránea garantiza integridad referencial: solo se pueden asignar categorías existentes.

    categoria = relationship("Categoria", foreign_keys=[id_cate_pr])
# PARA: Define una relación ORM con el modelo Categoria, usando la clave foránea id_cate_pr para unir ambas tablas.
# IMPACTO: Permite acceder a la categoría de un producto directamente como `producto.categoria` (por ejemplo, `producto.categoria.nombre_categoria`). También permite carga perezosa (lazy loading) o eager loading según configuración. Al no especificar back_populates, la relación es unidireccional (solo desde Producto a Categoria).