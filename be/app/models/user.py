from datetime import datetime
# PARA: Importa la clase datetime del módulo datetime para manejar fechas y horas.
# IMPACTO: Permite usar tipos datetime en columnas como created_at, facilitando el registro de marcas de tiempo.

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
# PARA: Importa los tipos Boolean, DateTime, ForeignKey, Integer, String y la función func de SQLAlchemy.
# IMPACTO: Permite definir columnas con tipos específicos: Boolean para valores verdadero/falso, DateTime para fechas, ForeignKey para claves foráneas, Integer para números, String para texto. func.now() se usa para valores por defecto dinámicos.

from sqlalchemy.orm import Mapped, mapped_column
# PARA: Importa Mapped (anotaciones modernas) y mapped_column (definición de columnas con tipado fuerte).
# IMPACTO: Habilita la sintaxis de SQLAlchemy 2.0 con anotaciones de tipo, mejorando la verificación estática (mypy, Pyright) y el autocompletado en IDEs.

from app.database import Base
# PARA: Importa la clase Base desde app.database, que es la instancia de declarative_base().
# IMPACTO: Heredar de Base convierte esta clase en un modelo ORM, permitiendo que SQLAlchemy cree la tabla correspondiente y la gestione en migraciones.

class User(Base):
# PARA: Define la clase User como un modelo ORM que hereda de Base, representando la tabla "usuarios".
# IMPACTO: SQLAlchemy mapea esta clase a una tabla real en la base de datos, permitiendo operaciones CRUD sobre usuarios del sistema (empleados o administradores).

    __tablename__ = "usuarios"
# PARA: Asigna explícitamente el nombre de la tabla en la base de datos como "usuarios".
# IMPACTO: Fija un nombre claro para la tabla, evitando que SQLAlchemy genere un nombre automático basado en la clase ("user").

    id_usuario: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
# PARA: Define la columna id_usuario como entero, clave primaria y autoincremental.
# IMPACTO: Cada usuario tendrá un identificador único y automático, esencial para referenciarlo desde otras tablas.

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
# PARA: Define la columna first_name (nombre) como cadena de hasta 100 caracteres, no nula.
# IMPACTO: Almacena el nombre del usuario. Es obligatorio.

    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
# PARA: Define la columna last_name (apellido) como cadena de hasta 100 caracteres, no nula.
# IMPACTO: Almacena el apellido del usuario. Es obligatorio.

    id_tipo_documento_u: Mapped[int] = mapped_column(Integer, nullable=True)
# PARA: Define la columna id_tipo_documento_u como entero, opcional (posiblemente clave foránea a una tabla de tipos de documento, aunque aquí no se define ForeignKey explícitamente).
# IMPACTO: Permite almacenar el tipo de documento (ej. CC, TI) sin una restricción de integridad referencial a nivel de base de datos. Nullable=True lo hace opcional.

    documento_usuario: Mapped[int] = mapped_column(Integer, unique=True, nullable=True)
# PARA: Define la columna documento_usuario como entero, único y opcional.
# IMPACTO: Almacena el número de documento de identidad. La unicidad evita duplicados; nullable=True permite que sea opcional.

    telefono_usuario: Mapped[int] = mapped_column(Integer, nullable=True)
# PARA: Define la columna telefono_usuario como entero, opcional.
# IMPACTO: Almacena el número de teléfono. Es opcional; al ser Integer, puede perder ceros iniciales si los hubiera.

    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
# PARA: Define la columna email como cadena de 100 caracteres, única, indexada y no nula.
# IMPACTO: El correo electrónico es obligatorio y único, usado para autenticación. El índice acelera búsquedas por email.

    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
# PARA: Define la columna password_hash como cadena de 255 caracteres, no nula.
# IMPACTO: Almacena el hash de la contraseña del usuario. Es obligatorio para la autenticación.

    id_rol_u: Mapped[int] = mapped_column(Integer, ForeignKey("roles_usuario.id_rol"), nullable=True)
# PARA: Define la columna id_rol_u como entero, clave foránea que referencia la columna id_rol de la tabla "roles_usuario". Es opcional.
# IMPACTO: Relaciona al usuario con un rol (por ejemplo, "admin", "empleado"). La clave foránea garantiza integridad referencial: solo se pueden asignar roles existentes. Nullable=True permite que un usuario no tenga rol asignado.

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
# PARA: Define la columna is_active como booleana, con valor por defecto True y no nula.
# IMPACTO: Permite habilitar o deshabilitar cuentas de usuario sin eliminarlas. Por defecto, el usuario está activo.

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
# PARA: Define la columna created_at como tipo DateTime, con valor por defecto del lado del servidor usando func.now().
# IMPACTO: Registra automáticamente la fecha y hora de creación del usuario, útil para auditoría y estadísticas.