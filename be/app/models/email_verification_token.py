from datetime import datetime
# PARA: Importa la clase datetime del módulo datetime para trabajar con fechas y horas.
# IMPACTO: Permite usar tipos datetime en columnas como expires_at y created_at, y comparar fechas en la lógica de expiración.

from typing import TYPE_CHECKING
# PARA: Importa TYPE_CHECKING para evitar importaciones circulares durante el chequeo de tipos.
# IMPACTO: Permite usar anotaciones de tipo con modelos que podrían generar dependencias circulares (como Cliente) sin que ocurran errores en tiempo de ejecución.

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
# PARA: Importa tipos Boolean, DateTime, ForeignKey, String y la función func de SQLAlchemy.
# IMPACTO: Define el tipo de las columnas; ForeignKey establece relaciones con otras tablas; func.now() genera valores por defecto dinámicos.

from sqlalchemy.orm import Mapped, mapped_column, relationship
# PARA: Importa Mapped (anotaciones modernas), mapped_column (definición de columnas) y relationship (relación entre modelos).
# IMPACTO: Permite usar la sintaxis de SQLAlchemy 2.0 con tipado fuerte, mejorando la integración con IDEs y el chequeo estático.

from app.database import Base
# PARA: Importa la clase Base desde app.database, que es la instancia de declarative_base().
# IMPACTO: Heredar de Base convierte esta clase en un modelo ORM, lo que permite crear la tabla correspondiente en la base de datos y usarla en migraciones.

if TYPE_CHECKING:
    from .cliente import Cliente
# PARA: Solo durante el chequeo de tipos (no en tiempo de ejecución), importa el modelo Cliente.
# IMPACTO: Permite que la anotación de tipo en la relación `cliente: Mapped["Cliente"]` sea válida sin crear una importación circular en tiempo de ejecución. Mejora la mantenibilidad.

class EmailVerificationToken(Base):
# PARA: Define la clase EmailVerificationToken como un modelo ORM que hereda de Base, representando la tabla "email_verification_tokens".
# IMPACTO: SQLAlchemy mapea esta clase a una tabla real en la base de datos, permitiendo almacenar tokens de verificación de correo electrónico.

    __tablename__ = "email_verification_tokens"
# PARA: Asigna explícitamente el nombre de la tabla en la base de datos como "email_verification_tokens".
# IMPACTO: Fija el nombre de la tabla para que sea claro y consistente con la convención del proyecto, evitando que SQLAlchemy genere un nombre automático (por defecto, el nombre de la clase en minúsculas).

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
# PARA: Define la columna id como entero, clave primaria y autoincremental.
# IMPACTO: Cada token tendrá un identificador único y automático, útil para operaciones internas y para referenciar registros de forma eficiente.

    email_cliente: Mapped[str] = mapped_column(String(100), ForeignKey("clientes.email", ondelete="CASCADE"), nullable=False, unique=True)
# PARA: Define la columna email_cliente como cadena de 100 caracteres, clave foránea que referencia la columna "email" de la tabla "clientes". Al eliminar un cliente, se eliminan en cascada sus tokens. Es única y no nula.
# IMPACTO: Asegura que cada token esté vinculado a un cliente existente a través de su email. La unicidad implica que solo puede haber un token activo por email (si se mantiene solo uno). La cascada elimina automáticamente tokens huérfanos al borrar un cliente.

    code: Mapped[str] = mapped_column(String(6), unique=True, index=True, nullable=False)
# PARA: Define la columna code como cadena de exactamente 6 caracteres (código numérico o alfanumérico), único, indexado y no nulo.
# IMPACTO: Almacena el código de verificación de 6 dígitos. La unicidad evita colisiones; el índice acelera búsquedas por código (útil al validar). El tamaño fijo optimiza almacenamiento.

    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
# PARA: Define la columna expires_at como tipo DateTime, no nula, que indica cuándo expira el token.
# IMPACTO: Permite implementar lógica de expiración (por ejemplo, tokens válidos solo por 15 minutos). Si no se controla, los tokens podrían usarse indefinidamente.

    used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
# PARA: Define la columna used como booleana, con valor por defecto False y no nula.
# IMPACTO: Indica si el token ya fue utilizado para verificar el correo. Esto permite invalidar el token después de su uso, impidiendo reutilizaciones maliciosas.

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
# PARA: Define la columna created_at como tipo DateTime, con valor por defecto del lado del servidor usando func.now().
# IMPACTO: Registra automáticamente la fecha y hora de creación del token, útil para auditoría y para calcular la expiración si se combina con un tiempo de vida fijo.

    cliente: Mapped["Cliente"] = relationship("Cliente", back_populates="email_verification_tokens")
# PARA: Define una relación muchos a uno (inversa a la relación uno a muchos definida en Cliente). Cada token pertenece a un cliente.
# IMPACTO: Permite acceder al cliente asociado desde un token mediante `token.cliente`. El `back_populates` conecta ambas relaciones bidireccionalmente, manteniendo la sincronización entre objetos en memoria.