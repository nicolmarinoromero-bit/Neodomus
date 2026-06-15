from sqlalchemy import String
# PARA: Importa el tipo String de SQLAlchemy para definir columnas de texto.
# IMPACTO: Permite usar cadenas de longitud variable como tipo de dato para la columna nombre_rol.

from sqlalchemy.orm import Mapped, mapped_column
# PARA: Importa Mapped (para anotaciones de tipo modernas) y mapped_column (para definir columnas con tipado fuerte) desde sqlalchemy.orm.
# IMPACTO: Habilita la sintaxis de SQLAlchemy 2.0 con anotaciones de tipo, lo que mejora la verificación estática con mypy/Pyright y proporciona mejor autocompletado en IDEs.

from app.database import Base
# PARA: Importa la clase Base desde app.database, que es la instancia de declarative_base().
# IMPACTO: Heredar de Base convierte esta clase en un modelo ORM, permitiendo que SQLAlchemy cree la tabla correspondiente y la gestione en migraciones.

class RolesUsuario(Base):
# PARA: Define la clase RolesUsuario como un modelo ORM que hereda de Base, representando la tabla "roles_usuario".
# IMPACTO: SQLAlchemy mapea esta clase a una tabla real en la base de datos, permitiendo operaciones CRUD sobre los roles de usuario (por ejemplo, "admin", "cliente", "empleado").

    __tablename__ = "roles_usuario"
# PARA: Asigna explícitamente el nombre de la tabla en la base de datos como "roles_usuario".
# IMPACTO: Fija un nombre claro y consistente para la tabla, evitando que SQLAlchemy genere un nombre automático (por defecto "roles_usuario" pero podría pluralizarse de forma diferente según convenciones).

    id_rol: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
# PARA: Define la columna id_rol como entero, clave primaria y autoincremental usando anotaciones Mapped y mapped_column.
# IMPACTO: Cada rol tendrá un identificador único y automático, útil para referenciar desde otras tablas (por ejemplo, una tabla "usuarios" podría tener un campo id_rol como clave foránea).

    nombre_rol: Mapped[str] = mapped_column(String(50), nullable=False)
# PARA: Define la columna nombre_rol como cadena de hasta 50 caracteres, no nula.
# IMPACTO: Almacena el nombre del rol (ej. "Administrador", "Cliente", "Vendedor"). El límite de 50 caracteres evita nombres excesivamente largos; nullable=False obliga a que todo rol tenga un nombre definido.