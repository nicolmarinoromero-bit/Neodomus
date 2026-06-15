from sqlalchemy import create_engine
# PARA: Importa la función create_engine de SQLAlchemy, que crea la conexión a la base de datos.
# IMPACTO: Permite establecer un motor (engine) que gestiona el pool de conexiones y la comunicación con la BD.

from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
# PARA: Importa DeclarativeBase (para definir modelos ORM), sessionmaker (fábrica de sesiones) y Session (tipo para anotaciones).
# IMPACTO: Proporciona las herramientas necesarias para trabajar con el ORM de SQLAlchemy: declarar tablas como clases Python, crear sesiones de trabajo y tipar correctamente.

from typing import Generator
# PARA: Importa Generator para anotar que la función get_db es un generador que produce sesiones.
# IMPACTO: Mejora la claridad del código y la verificación de tipos, indicando que la función se usará como dependencia que cede el control.

from app.config import settings
# PARA: Importa la instancia settings con la configuración de la aplicación (incluyendo DATABASE_URL).
# IMPACTO: Centraliza la URL de conexión, permitiendo cambiarla según el entorno sin modificar este archivo.

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
)
# PARA: Crea el motor de base de datos. `pool_pre_ping=True` verifica la conexión antes de usarla (evita errores por conexiones muertas). `pool_recycle=3600` recicla conexiones cada hora. `echo=False` evita logs SQL en consola.
# IMPACTO: El motor gestiona el pool de conexiones. `pool_pre_ping` es útil en entornos cloud donde los balanceadores pueden cerrar conexiones inactivas. `pool_recycle` evita errores por timeout de conexiones. `echo=False` mantiene limpia la salida en producción.

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)
# PARA: Crea una fábrica de sesiones (`SessionLocal`) configurada con `autocommit=False` (transacciones explícitas), `autoflush=False` (no envía cambios automáticamente a la BD antes de consultas) y enlazada al motor.
# IMPACTO: Cada vez que se llame a `SessionLocal()`, se obtiene una nueva sesión de base de datos. La configuración `autocommit=False` obliga a manejar transacciones con `commit()`/`rollback()`. `autoflush=False` da más control, aunque es común ponerlo en `True`; aquí se prefiere manejo explícito.

class Base(DeclarativeBase):
    pass
# PARA: Define la clase base para todos los modelos ORM. Heredar de `DeclarativeBase` es la forma moderna (SQLAlchemy 2.0) de crear la metadata común.
# IMPACTO: Todos los modelos (Cliente, User, Producto, etc.) deben heredar de `Base`. Así SQLAlchemy puede mapear las clases a tablas y generar las migraciones automáticas con Alembic.

# Esta es la función que falta
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# PARA: Función generadora que crea una sesión, la entrega (yield) y la cierra automáticamente al finalizar.
# IMPACTO: Se usa como dependencia en FastAPI (`db: Session = Depends(get_db)`). Garantiza que cada request tenga su propia sesión y que se cierre correctamente al terminar, evitando fugas de conexiones.