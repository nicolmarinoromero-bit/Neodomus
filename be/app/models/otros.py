from sqlalchemy import Column, Integer, String
# PARA: Importa las clases Column, Integer y String del módulo sqlalchemy para definir columnas de base de datos.
# IMPACTO: Permite declarar los campos de la tabla usando los tipos Integer (números enteros) y String (cadenas de texto) con la sintaxis de SQLAlchemy ORM.

from ..database import Base
# PARA: Importa la clase Base desde el directorio padre (../) dentro del módulo database, que contiene la instancia de declarative_base().
# IMPACTO: Heredar de Base es necesario para que SQLAlchemy reconozca esta clase como un modelo de base de datos y pueda generar la tabla correspondiente en las migraciones de Alembic.

class TipoDocumento(Base):
# PARA: Define la clase TipoDocumento como un modelo ORM que hereda de Base, representando una tabla en la base de datos.
# IMPACTO: SQLAlchemy mapea esta clase a la tabla "tipos_documento" (definida en __tablename__), permitiendo operaciones CRUD (crear, leer, actualizar, eliminar) sobre tipos de documento.

    __tablename__ = "tipos_documento"
# PARA: Asigna explícitamente el nombre de la tabla en la base de datos como "tipos_documento".
# IMPACTO: Fija el nombre de la tabla; sin esta línea, SQLAlchemy usaría el nombre de la clase en minúsculas ("tipodocumento"), lo que podría no coincidir con la convención del proyecto o con nombres ya existentes.

    id_tipo_documento = Column(Integer, primary_key=True, autoincrement=True)
# PARA: Define una columna llamada id_tipo_documento de tipo Integer, que es clave primaria y se autoincrementa automáticamente.
# IMPACTO: Cada tipo de documento tendrá un identificador único y automático, ideal para referenciar desde otras tablas (por ejemplo, la tabla clientes puede tener un id_tipo_documento_c como clave foránea).

    nombre_tipo = Column(String(2))
# PARA: Define una columna nombre_tipo de tipo cadena con longitud máxima de 2 caracteres (posiblemente para almacenar códigos como "CC", "TI", "CE").
# IMPACTO: Almacena el código o abreviatura del tipo de documento. La longitud fija de 2 caracteres ahorra espacio y fuerza un formato consistente. Al no especificar nullable=False, este campo puede ser nulo (opcional), aunque por lógica de negocio quizás debería ser obligatorio.