from datetime import datetime
# PARA: Importa la clase datetime del módulo datetime para manejar fechas y horas.
# IMPACTO: Permite usar tipos datetime en las columnas de la base de datos, como created_at, y operar con marcas de tiempo.

from typing import TYPE_CHECKING, List
# PARA: Importa TYPE_CHECKING (para evitar importaciones circulares en tiempo de ejecución) y List (para anotaciones de tipos).
# IMPACTO: TYPE_CHECKING permite importar tipos condicionalmente solo durante el chequeo de tipos, mejorando el rendimiento y evitando dependencias circulares. List se usa para anotar relaciones uno a muchos.

from sqlalchemy import Boolean, DateTime, Integer, String, func
# PARA: Importa los tipos Boolean, DateTime, Integer, String y la función func de SQLAlchemy.
# IMPACTO: Define los tipos de columna para la tabla. func proporciona funciones SQL como func.now() para valores por defecto dinámicos.

from sqlalchemy.orm import Mapped, mapped_column, relationship
# PARA: Importa Mapped (para anotaciones de tipo modernas), mapped_column (para definir columnas con tipado) y relationship (para definir relaciones entre modelos).
# IMPACTO: Permite usar la sintaxis de SQLAlchemy 2.0 con anotaciones de tipo Mapped, que ofrece mejor soporte de IDEs y chequeo estático.

from app.database import Base
# PARA: Importa la clase Base desde app.database, la cual es la instancia de declarative_base().
# IMPACTO: Heredar de Base es obligatorio para que SQLAlchemy reconozca la clase como un modelo de base de datos y pueda crear la tabla y las migraciones.

if TYPE_CHECKING:
    from app.models.email_verification_token import EmailVerificationToken
# PARA: Solo durante el chequeo de tipos (no en tiempo de ejecución), importa el modelo EmailVerificationToken para evitar referencias circulares.
# IMPACTO: Permite que las anotaciones de tipo en la relación usen "EmailVerificationToken" sin causar errores de importación circular; en tiempo de ejecución no se importa, ahorrando recursos.

class Cliente(Base):
# PARA: Define la clase Cliente como un modelo ORM que hereda de Base, representando la tabla "clientes".
# IMPACTO: SQLAlchemy mapea esta clase a una tabla en la base de datos, permitiendo operaciones CRUD sobre los clientes del sistema.

    __tablename__ = "clientes"
# PARA: Asigna explícitamente el nombre de la tabla en la base de datos como "clientes".
# IMPACTO: Sin esta línea, SQLAlchemy generaría un nombre automático basado en el nombre de la clase (Cliente -> cliente). Al definirlo, se asegura el nombre deseado y se evitan confusiones con plurales o convenciones.

    id_cliente: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
# PARA: Define la columna id_cliente como entero, clave primaria y autoincremental.
# IMPACTO: Cada cliente tendrá un identificador único y automático; es obligatorio para identificar registros de forma eficiente.

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
# PARA: Define la columna first_name (nombre) como cadena de hasta 100 caracteres, no nula.
# IMPACTO: Todos los clientes deben tener un nombre; el límite de 100 caracteres optimiza el almacenamiento y evita abusos.

    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
# PARA: Define la columna last_name (apellido) como cadena de hasta 100 caracteres, no nula.
# IMPACTO: Obliga a registrar el apellido del cliente, manteniendo la integridad de los datos personales.

    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
# PARA: Define la columna email como cadena de 100 caracteres, única, indexada y no nula.
# IMPACTO: Asegura que no haya dos clientes con el mismo correo (unique); el índice acelera búsquedas por email, que es común en autenticación.

    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
# PARA: Define la columna password_hash para almacenar el hash de la contraseña (no la contraseña en texto plano).
# IMPACTO: Mejora la seguridad al guardar solo el hash; la longitud 255 es suficiente para algoritmos como bcrypt o PBKDF2.

    id_tipo_documento_c: Mapped[int] = mapped_column(Integer, nullable=True)
# PARA: Define la columna id_tipo_documento_c (posiblemente clave foránea a un tipo de documento) como entero, opcional.
# IMPACTO: Permite que el cliente no tenga un tipo de documento definido (nullable=True); podría usarse para relación con otra tabla de tipos de documento.

    documento_cliente: Mapped[int] = mapped_column(Integer, unique=True, nullable=True)
# PARA: Define la columna documento_cliente como entero, único y opcional.
# IMPACTO: El número de documento puede ser nulo (no obligatorio) pero si se proporciona, debe ser único para evitar duplicados.

    telefono_cliente: Mapped[int] = mapped_column(Integer, nullable=True)
# PARA: Define la columna telefono_cliente como entero, opcional.
# IMPACTO: El teléfono no es obligatorio; al ser Integer, puede almacenar números sin formato, pero podría tener limitación si el número comienza con cero.

    address: Mapped[str] = mapped_column(String(150), nullable=True)
# PARA: Define la columna address (dirección) como cadena de hasta 150 caracteres, opcional.
# IMPACTO: La dirección no es obligatoria; permite registrar información de contacto adicional sin forzar su ingreso.

    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
# PARA: Define la columna is_active como booleana, con valor por defecto False y no nula.
# IMPACTO: Permite desactivar cuentas (por ejemplo, por falta de verificación) sin eliminar el registro. Por defecto el usuario no está activo hasta que verifique su email o sea habilitado.

    verification_token: Mapped[str] = mapped_column(String(100), unique=True, nullable=True)
# PARA: Define la columna verification_token como cadena de hasta 100 caracteres, única y opcional.
# IMPACTO: Almacena un token temporal para verificar el email del cliente. La unicidad evita colisiones y el nullable=True permite que el token sea removido después de la verificación.

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
# PARA: Define la columna created_at como tipo DateTime, con valor por defecto del lado del servidor usando func.now() (fecha/hora actual).
# IMPACTO: Automáticamente se asigna la fecha y hora de creación al insertar un registro; el uso de server_default asegura consistencia incluso si la aplicación tiene diferentes zonas horarias.

    # Solo se mantiene la relación con EmailVerificationToken si se usa
    email_verification_tokens: Mapped[List["EmailVerificationToken"]] = relationship(
        "EmailVerificationToken",
        back_populates="cliente",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
# PARA: Define una relación uno a muchos con el modelo EmailVerificationToken. Un cliente puede tener múltiples tokens de verificación.
# IMPACTO: Permite acceder a los tokens de un cliente a través de cliente.email_verification_tokens. Con lazy="selectin" se carga la relación en una consulta eficiente (evita N+1). Con cascade="all, delete-orphan" significa que si se elimina un cliente, también se eliminan todos sus tokens; si se elimina un token de la lista, se borra de la base de datos.