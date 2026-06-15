from sqlalchemy import Column, Integer, String, DateTime, BigInteger
# PARA: Importa los tipos Column, Integer, String, DateTime y BigInteger de SQLAlchemy.
# IMPACTO: Permite definir columnas con tipos específicos: BigInteger para números enteros grandes (útiles para documentos de identidad largos), DateTime para marcas de tiempo.

from sqlalchemy.sql import func
# PARA: Importa la función func de sqlalchemy.sql, que proporciona acceso a funciones SQL como func.now().
# IMPACTO: Se usa para generar valores por defecto dinámicos directamente en el servidor de base de datos, como la fecha de creación.

from app.database import Base
# PARA: Importa la clase Base desde app.database, la cual es la instancia de declarative_base() de SQLAlchemy.
# IMPACTO: Heredar de Base convierte esta clase en un modelo ORM, permitiendo que SQLAlchemy cree la tabla correspondiente y la gestione en migraciones.

class PendingRegistration(Base):
# PARA: Define la clase PendingRegistration como un modelo ORM que hereda de Base, representando la tabla "pending_registrations".
# IMPACTO: SQLAlchemy mapea esta clase a una tabla real en la base de datos, permitiendo almacenar registros de usuarios que aún no han completado la verificación de correo electrónico.

    __tablename__ = "pending_registrations"
# PARA: Asigna explícitamente el nombre de la tabla en la base de datos como "pending_registrations".
# IMPACTO: Fija un nombre claro y consistente para la tabla, evitando que SQLAlchemy genere un nombre automático basado en la clase (pendingregistration).

    id = Column(Integer, primary_key=True, index=True)
# PARA: Define la columna id como entero, clave primaria y con índice.
# IMPACTO: Proporciona un identificador único y autoincremental para cada registro pendiente. El índice acelera búsquedas por este campo.

    first_name = Column(String(100), nullable=False)
# PARA: Define la columna first_name (nombre) como cadena de hasta 100 caracteres, no nula.
# IMPACTO: Almacena el nombre del usuario en proceso de registro. Es obligatorio para mantener integridad de datos.

    last_name = Column(String(100), nullable=False)
# PARA: Define la columna last_name (apellido) como cadena de hasta 100 caracteres, no nula.
# IMPACTO: Almacena el apellido del usuario. Es obligatorio.

    id_tipo_documento_c = Column(Integer, nullable=True)   # ← SIN ForeignKey
# PARA: Define la columna id_tipo_documento_c como entero, opcional. No tiene clave foránea explícita a la tabla tipos_documento.
# IMPACTO: Almacena el tipo de documento del usuario (por ejemplo, 1 para CC, 2 para TI). Al no definir ForeignKey, no hay restricción de integridad referencial a nivel de base de datos, lo que puede ser intencional para simplificar o porque se validará a nivel de aplicación. Nullable=True permite que sea opcional.

    documento_cliente = Column(BigInteger, nullable=True)
# PARA: Define la columna documento_cliente como BigInteger (entero grande), opcional.
# IMPACTO: Almacena el número de documento de identidad. Se usa BigInteger para soportar números muy largos (ej. cédulas de hasta 10-12 dígitos). Nullable=True permite que sea opcional durante el registro pendiente.

    telefono_cliente = Column(BigInteger, nullable=True)
# PARA: Define la columna telefono_cliente como BigInteger, opcional.
# IMPACTO: Almacena el número de teléfono. BigInteger evita problemas con ceros iniciales? (Nota: los números de teléfono pueden perderse si se almacenan como entero porque ceros iniciales se eliminan; podría ser String, pero aquí se eligió BigInteger). Nullable=True lo hace opcional.

    email = Column(String(100), unique=True, nullable=False, index=True)
# PARA: Define la columna email como cadena de 100 caracteres, única, no nula y con índice.
# IMPACTO: El correo electrónico es obligatorio y debe ser único entre registros pendientes. El índice acelera búsquedas por email, útil al verificar si ya existe un registro.

    address = Column(String(150), nullable=True)
# PARA: Define la columna address (dirección) como cadena de hasta 150 caracteres, opcional.
# IMPACTO: Permite registrar la dirección del usuario sin ser obligatoria.

    password_hash = Column(String(255), nullable=False)
# PARA: Define la columna password_hash como cadena de hasta 255 caracteres, no nula.
# IMPACTO: Almacena el hash de la contraseña (nunca la contraseña en texto plano). Es obligatorio para que el usuario pueda ser creado después de la verificación.

    code = Column(String(6), nullable=False)
# PARA: Define la columna code como cadena de exactamente 6 caracteres, no nula.
# IMPACTO: Almacena el código de verificación de 6 dígitos enviado al correo. Se usa para confirmar la identidad antes de completar el registro.

    expires_at = Column(DateTime, nullable=False)
# PARA: Define la columna expires_at como tipo DateTime, no nula.
# IMPACTO: Indica la fecha y hora de expiración del registro pendiente. Después de ese tiempo, el registro se considera inválido y puede ser eliminado.

    created_at = Column(DateTime, server_default=func.now())
# PARA: Define la columna created_at como tipo DateTime, con valor por defecto del lado del servidor usando func.now().
# IMPACTO: Registra automáticamente la fecha y hora de creación del registro pendiente, útil para auditoría y para calcular expiraciones basadas en tiempo de vida.