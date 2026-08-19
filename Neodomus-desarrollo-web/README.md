# NeoDomus API

API para gestión de ventas, servicios técnicos, inventario y facturación.

## Ejecución

```bash
docker-compose up --build
```

La API estará en http://localhost:8000 , documentación en /docs.

Base de datos (MySQL Workbench)

- Host: localhost
- Puerto: 3307
- Usuario: neodomus
- Contraseña: neodomus123
- Base de datos: neodomus

## Base de datos y migraciones (Alembic)

La estructura de la base de datos se gestiona con **Alembic** y se versiona en
el repositorio (`be/alembic/versions/`). No se usa `scripts/init_db.sql`: el
esquema completo y los datos iniciales están en la migración inicial
`0001_baseline_esquema_inicial.py`.

### Persona que acaba de clonar el repositorio

```bash
docker-compose up --build
```

Al arrancar, el contenedor `api` ejecuta automáticamente `alembic upgrade head`
antes de iniciar FastAPI. La base de datos queda creada con el esquema completo
(incluida `producto_variantes`) y los datos iniciales.

### Persona que ya tiene una base de datos existente

```bash
docker-compose up --build
```

La migración inicial es idempotente: usa `CREATE TABLE IF NOT EXISTS` y solo
inserta datos iniciales si la tabla está vacía. Por lo tanto, al ejecutarse
sobre una base existente no modifica ni elimina nada: solo crea las tablas que
faltan (por ejemplo `producto_variantes`) y registra la versión en
`alembic_version`.

### Crear una nueva migración

Cuando se agregue una tabla, columna o relación nueva en los modelos:

```bash
# Dentro del contenedor api
docker exec -it neodomus_api uv run alembic revision --autogenerate -m "descripcion del cambio"

# Revisar el archivo generado y luego aplicarlo
docker exec -it neodomus_api uv run alembic upgrade head
```

Subir tanto el archivo de migración como los cambios de modelos al repositorio.
Las demás personas del equipo solo ejecutan `docker-compose up --build` (o
`alembic upgrade head`) para actualizar su base de datos.

### Otros comandos útiles

```bash
# Ver en qué revisión está la base de datos
docker exec -it neodomus_api uv run alembic current

# Ver el historial de migraciones
docker exec -it neodomus_api uv run alembic history

# Aplicar migraciones manualmente
docker exec -it neodomus_api uv run alembic upgrade head
```

### Verificar que la tabla producto_variantes existe

```bash
docker exec neodomus_mysql mysql -uneodomus -pneodomus123 -e "SHOW TABLES FROM neodomus LIKE 'producto_variantes';"
```

Debe devolver `producto_variantes` y además la tabla `alembic_version`.
