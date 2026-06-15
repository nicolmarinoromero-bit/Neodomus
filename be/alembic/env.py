import asyncio
# PARA: Importa el módulo asyncio para manejar operaciones asíncronas.
# IMPACTO: Permite ejecutar la migración online de forma asíncrona, fundamental para usar bases de datos asíncronas como asyncpg.

from logging.config import fileConfig
# PARA: Importa la función fileConfig del módulo logging.config para cargar la configuración de logging desde un archivo.
# IMPACTO: Permite que Alembic y SQLAlchemy registren eventos y errores según lo definido en alembic.ini, facilitando la depuración.

from sqlalchemy import engine_from_config
# PARA: Importa la función engine_from_config de SQLAlchemy para crear un motor de base de datos a partir de un diccionario de configuración.
# IMPACTO: Se usa en modo online para construir el motor (síncrono) que luego se adaptará a asíncrono con AsyncEngine.

from sqlalchemy.ext.asyncio import AsyncEngine
# PARA: Importa la clase AsyncEngine de SQLAlchemy para manejar motores de base de datos asíncronos.
# IMPACTO: Permite ejecutar migraciones sobre bases de datos que soportan operaciones asíncronas (PostgreSQL con asyncpg, etc.).

from alembic import context
# PARA: Importa el objeto context de Alembic, que proporciona la API para ejecutar migraciones.
# IMPACTO: Es el núcleo de Alembic; permite configurar el entorno de migración, acceder a la conexión y ejecutar las revisiones.

import sys
# PARA: Importa el módulo sys para manipular la ruta de búsqueda de módulos de Python.
# IMPACTO: Se usará para agregar directorios personalizados al path y así poder importar módulos de la aplicación.

from pathlib import Path
# PARA: Importa la clase Path para manejar rutas de archivos de forma orientada a objetos.
# IMPACTO: Facilita la construcción de rutas relativas al directorio actual de forma legible y multiplataforma.

sys.path.append(str(Path(__file__).parent.parent))
# PARA: Agrega al path de Python el directorio padre del directorio que contiene este archivo (es decir, la raíz del proyecto `be`).
# IMPACTO: Permite importar módulos como `app.config` y `app.database` desde el contexto de Alembic, resolviendo errores de importación.

from app.config import settings
# PARA: Importa el objeto settings desde el módulo app.config, que contiene la configuración de la aplicación (como DATABASE_URL).
# IMPACTO: Centraliza la configuración de la base de datos, evitando duplicar valores en alembic.ini y permitiendo usar variables de entorno.

from app.database import Base
# PARA: Importa la clase Base (declarative_base) desde app.database, que es la base de todos los modelos SQLAlchemy.
# IMPACTO: Alembic utilizará Base.metadata para detectar automáticamente los modelos y generar las migraciones correspondientes.

from app.models import *  # noqa
# PARA: Importa todos los modelos definidos en app.models para que estén registrados en Base.metadata.
# IMPACTO: Sin esta importación, Alembic no conocería las tablas definidas en la aplicación y no podría generar migraciones completas. El `# noqa` evita advertencias de estilo.

config = context.config
# PARA: Asigna a la variable `config` la configuración de Alembic obtenida del objeto context.
# IMPACTO: Permite acceder y modificar parámetros como la URL de la base de datos o la ubicación de los scripts de migración.

if config.config_file_name is not None:
    fileConfig(config.config_file_name)
# PARA: Si existe un archivo de configuración de logging (definido en alembic.ini), carga su configuración.
# IMPACTO: Habilita el registro de logs según lo especificado, útil para depurar problemas durante las migraciones.

target_metadata = Base.metadata
# PARA: Asigna la metadata de SQLAlchemy (Base.metadata) a la variable target_metadata, que Alembic espera.
# IMPACTO: Alembic comparará esta metadata con el estado actual de la base de datos para generar las migraciones automáticas.

def run_migrations_offline():
# PARA: Define la función que ejecuta las migraciones en "modo offline" (sin conexión real a la base de datos).
# IMPACTO: En este modo, Alembic genera sentencias SQL sin ejecutarlas, útil para entornos donde no se puede conectar directamente o para revisar el SQL generado.

    url = settings.DATABASE_URL
    # PARA: Obtiene la URL de la base de datos desde la configuración de la aplicación.
    # IMPACTO: Alembic utilizará esta URL para saber a qué base de datos apuntar, aunque en modo offline no conecta realmente.

    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    # PARA: Configura el contexto de Alembic con la URL, la metadata y la opción literal_binds (que usa valores literales en lugar de bindparams).
    # IMPACTO: Prepara el entorno para ejecutar migraciones offline; literal_binds facilita la generación de SQL legible pero puede ser inseguro si hay datos sensibles.

    with context.begin_transaction():
        context.run_migrations()
    # PARA: Inicia una transacción ficticia y ejecuta las migraciones (generando SQL sin aplicarlo).
    # IMPACTO: Las migraciones se procesan, pero no se aplican a ninguna base de datos; la salida suele ser el SQL generado.

def do_run_migrations(connection):
# PARA: Función auxiliar que recibe una conexión síncrona y ejecuta las migraciones sobre ella.
# IMPACTO: Se usa internamente en modo online para pasar la conexión real a Alembic.

    context.configure(connection=connection, target_metadata=target_metadata)
    # PARA: Configura el contexto de Alembic con una conexión activa y la metadata de los modelos.
    # IMPACTO: Alembic ahora operará sobre la conexión real, aplicando los cambios directamente a la base de datos.

    with context.begin_transaction():
        context.run_migrations()
    # PARA: Inicia una transacción real y ejecuta las migraciones, aplicando los cambios a la base de datos.
    # IMPACTO: Si todo es correcto, la base de datos se actualiza; si hay error, la transacción se revierte automáticamente.

async def run_migrations_online():
# PARA: Define la función asíncrona que ejecuta las migraciones en modo online, usando un motor asíncrono.
# IMPACTO: Permite usar conectores asíncronos (como asyncpg) para bases de datos que lo soportan, mejorando el rendimiento en entornos async.

    connectable = AsyncEngine(engine_from_config(
        {"sqlalchemy.url": settings.DATABASE_URL},
        prefix="sqlalchemy.",
        poolclass=None,
    ))
    # PARA: Crea un motor síncrono mediante engine_from_config con la URL de la base de datos, luego lo envuelve en AsyncEngine.
    # IMPACTO: Obtiene un motor asíncrono configurado con los mismos parámetros que usa la aplicación, manteniendo coherencia. poolclass=None evita el pool de conexiones para simplificar.

    async with connectable.connect() as connection:
        # PARA: Obtiene una conexión asíncrona del motor, usando un context manager.
        # IMPACTO: La conexión se cierra automáticamente al salir del bloque.

        await connection.run_sync(do_run_migrations)
        # PARA: Ejecuta la función síncrona do_run_migrations dentro del contexto de la conexión asíncrona.
        # IMPACTO: Alembic (que es síncrono) puede trabajar sobre la conexión asíncrona gracias a run_sync, evitando conflictos.

    await connectable.dispose()
    # PARA: Libera los recursos del motor asíncrono (cierra conexiones pendientes).
    # IMPACTO: Previene fugas de conexiones y garantiza que el script termine limpiamente.

if context.is_offline_mode():
    # PARA: Verifica si Alembic se está ejecutando en modo offline (por ejemplo, con la variable de entorno o flag correspondiente).
    # IMPACTO: Decide qué función ejecutar: offline para generar SQL, online para aplicar cambios directamente.

    run_migrations_offline()
    # PARA: Ejecuta el flujo de migraciones offline.
    # IMPACTO: Se genera el SQL de las migraciones sin modificar la base de datos.

else:
    asyncio.run(run_migrations_online())
    # PARA: Ejecuta la función asíncrona run_migrations_online usando asyncio.run().
    # IMPACTO: Inicia el bucle de eventos asíncrono y aplica las migraciones a la base de datos real de forma asíncrona.