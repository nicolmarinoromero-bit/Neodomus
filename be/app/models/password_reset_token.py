from datetime import datetime
# PARA: Importa la clase datetime del módulo datetime para trabajar con fechas y horas.
# IMPACTO: Permite usar tipos datetime en columnas como expires_at y created_at, facilitando la lógica de expiración de tokens.

from sqlalchemy import Column, Integer, String, Boolean, DateTime
# PARA: Importa los tipos Column, Integer, String, Boolean y DateTime de SQLAlchemy.
# IMPACTO: Permite definir columnas de la tabla con tipos específicos: Integer para números, String para texto, Boolean para verdadero/falso, DateTime para marcas de tiempo.

from sqlalchemy.sql import func
# PARA: Importa la función func de sqlalchemy.sql, que proporciona acceso a funciones SQL (por ejemplo, func.now()).
# IMPACTO: Se usa para generar valores por defecto dinámicos como la fecha y hora actual directamente desde el servidor de base de datos.

from app.database import Base
# PARA: Importa la clase Base desde app.database, la cual es la instancia de declarative_base() de SQLAlchemy.
# IMPACTO: Heredar de Base convierte esta clase en un modelo ORM, permitiendo que SQLAlchemy cree la tabla correspondiente y la gestione en migraciones.

class PasswordResetToken(Base):
# PARA: Define la clase PasswordResetToken como un modelo ORM que hereda de Base, representando la tabla "password_reset_tokens".
# IMPACTO: SQLAlchemy mapea esta clase a una tabla real en la base de datos, permitiendo almacenar tokens para restablecimiento de contraseñas de empleados o clientes.

    __tablename__ = "password_reset_tokens"
# PARA: Asigna explícitamente el nombre de la tabla en la base de datos como "password_reset_tokens".
# IMPACTO: Asegura un nombre consistente con la convención del proyecto, evitando que SQLAlchemy genere automáticamente un nombre basado en la clase (password_reset_token).

    id = Column(Integer, primary_key=True, index=True)
# PARA: Define la columna id como entero, clave primaria y con índice.
# IMPACTO: Proporciona un identificador único y autoincremental para cada token. El índice acelera búsquedas por este campo.

    email = Column(String(255), nullable=False, index=True)
# PARA: Define la columna email como cadena de hasta 255 caracteres, no nula y con índice.
# IMPACTO: Almacena el correo del usuario que solicita el restablecimiento. El índice mejora la velocidad de búsqueda por email, común cuando se valida un token.

    user_type = Column(String(20), nullable=False)  # 'employee' o 'client'
# PARA: Define la columna user_type como cadena de hasta 20 caracteres, no nula, que indica si el token pertenece a un 'employee' o 'client'.
# IMPACTO: Permite diferenciar entre tipos de usuarios en el sistema, evitando conflictos si existen dos tablas diferentes (empleados y clientes) con el mismo email.

    token = Column(String(500), nullable=True, unique=True, index=True)
# PARA: Define la columna token como cadena de hasta 500 caracteres, opcional, única y con índice.
# IMPACTO: Almacena un token largo (generalmente un hash o UUID) para restablecimiento. Nullable=True permite tokens solo basados en código. La unicidad evita colisiones; el índice acelera validaciones.

    code = Column(String(10), nullable=False)
# PARA: Define la columna code como cadena de hasta 10 caracteres, no nula.
# IMPACTO: Almacena un código numérico o alfanumérico (por ejemplo, de 6 dígitos) para restablecimiento, como alternativa más corta al token largo.

    expires_at = Column(DateTime, nullable=False)
# PARA: Define la columna expires_at como tipo DateTime, no nula, que indica cuándo expira el token/código.
# IMPACTO: Implementa la lógica de expiración temporal; los intentos después de esta fecha deben ser rechazados por seguridad.

    used = Column(Boolean, default=False)
# PARA: Define la columna used como booleana, con valor por defecto False.
# IMPACTO: Marca si el token ya fue utilizado para restablecer la contraseña. Impide la reutilización del mismo token o código.

    ip_used = Column(String(45), nullable=True)
# PARA: Define la columna ip_used como cadena de hasta 45 caracteres (suficiente para IPv4 e IPv6 con notación estándar), opcional.
# IMPACTO: Registra la dirección IP desde la cual se usó el token, útil para auditoría de seguridad y detección de abusos.

    created_at = Column(DateTime, server_default=func.now())
# PARA: Define la columna created_at como tipo DateTime, con valor por defecto del lado del servidor usando func.now().
# IMPACTO: Asigna automáticamente la fecha y hora de creación del registro, útil para auditoría y para calcular la expiración basada en tiempo de vida.