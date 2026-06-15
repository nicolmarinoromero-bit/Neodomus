from sqlalchemy import Column, Integer, String
# PARA: Importa las clases Column, Integer y String del módulo sqlalchemy para definir columnas de la base de datos.
# IMPACTO: Permite declarar los tipos de datos y propiedades de cada campo de la tabla utilizando la sintaxis de SQLAlchemy ORM.

from app.database import Base
# PARA: Importa la clase Base desde app.database, que es la instancia de declarative_base() creada en la aplicación.
# IMPACTO: Heredar de Base es obligatorio para que SQLAlchemy reconozca la clase como un modelo de base de datos y pueda generar el esquema y las migraciones automáticas.

class Categoria(Base):
# PARA: Define la clase Categoria como un modelo ORM que hereda de Base, representando una tabla en la base de datos.
# IMPACTO: SQLAlchemy asignará esta clase a una tabla real, permitiendo realizar operaciones CRUD (crear, leer, actualizar, eliminar) sobre registros de categorías.

    __tablename__ = "categorias"
# PARA: Asigna explícitamente el nombre de la tabla en la base de datos como "categorias".
# IMPACTO: Sin esta línea, SQLAlchemy generaría un nombre automático (normalmente el nombre de la clase en minúsculas). Al definirlo, se asegura el nombre deseado y se evitan errores si el nombre por defecto no es el esperado.

    id_categoria = Column(Integer, primary_key=True, index=True)
# PARA: Define una columna llamada id_categoria de tipo Integer que es clave primaria y tiene un índice automático.
# IMPACTO: Cada categoría tendrá un identificador único, no nulo y autoincrementable (por defecto en Integer con primary_key). El índice (index=True) mejora la velocidad de búsqueda por este campo.

    nombre_categoria = Column(String(50), nullable=False)
# PARA: Define una columna nombre_categoria de tipo cadena con longitud máxima 50 caracteres, que no puede ser nula.
# IMPACTO: Obliga a que cada categoría tenga un nombre (no se permiten registros sin nombre). La longitud fija ayuda a optimizar el almacenamiento y la validación en la base de datos.

    descripcion = Column(String(200))
# PARA: Define una columna descripcion de tipo cadena con longitud máxima 200 caracteres, que puede ser nula (no se especifica nullable, por defecto es True).
# IMPACTO: Permite que las categorías tengan una descripción opcional. Al no definir nullable=False, el campo puede quedar vacío (NULL) en la base de datos sin generar error.