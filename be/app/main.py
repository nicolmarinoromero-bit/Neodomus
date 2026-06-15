import os
# PARA: Importa el módulo os para interactuar con el sistema operativo (obtener variables de entorno como PORT).
# IMPACTO: Permite leer el puerto de escucha desde la variable de entorno PORT, facilitando despliegues en diferentes entornos (Render, Heroku, etc.).

from fastapi import FastAPI, Request
# PARA: Importa FastAPI (clase principal para crear la app) y Request (para acceder a datos de la petición en manejadores de excepciones).
# IMPACTO: FastAPI es el framework; Request se usa en el manejador genérico de excepciones para obtener contexto.

from fastapi.middleware.cors import CORSMiddleware
# PARA: Importa el middleware CORS para permitir peticiones desde dominios distintos (cross-origin).
# IMPACTO: Permite que el frontend (por ejemplo, React en localhost:5173) pueda llamar a la API sin bloques de seguridad del navegador.

from fastapi.responses import JSONResponse
# PARA: Importa JSONResponse para devolver respuestas JSON personalizadas (por ejemplo, en el manejador de excepciones genérico).
# IMPACTO: Permite controlar el formato y código de estado de las respuestas de error.

from slowapi import Limiter, _rate_limit_exceeded_handler
# PARA: Importa Limiter (clase para limitar tasa de peticiones) y el manejador por defecto cuando se excede el límite.
# IMPACTO: Proporciona la herramienta de rate limiting. _rate_limit_exceeded_handler retorna automáticamente HTTP 429 (Too Many Requests).

from slowapi.util import get_remote_address
# PARA: Importa la función que extrae la dirección IP del cliente para identificar cada usuario en el rate limiting.
# IMPACTO: Se usa como clave (key_func) para contar peticiones por IP.

from slowapi.errors import RateLimitExceeded
# PARA: Importa la excepción que se lanza cuando un cliente excede su cuota de peticiones.
# IMPACTO: Permite registrar un manejador específico para este tipo de error.

# Importa los routers desde el paquete routers
from app.routers import (
    auth_router,
    users_router,
    clients_router,
    tecnicos_router,
    productos_router,      # ← Asegúrate de que exista este archivo en routers/
    # otros routers que tengas: pedidos, carrito, etc.
)
# PARA: Importa los objetos APIRouter definidos en los archivos del directorio routers.
# IMPACTO: Permite agrupar endpoints por módulo (autenticación, usuarios, clientes, técnicos, productos) y luego incluirlos en la app principal.

# Configuración de rate limiting (opcional)
limiter = Limiter(key_func=get_remote_address)
# PARA: Crea una instancia del limitador de tasa usando la IP remota como identificador.
# IMPACTO: Asigna el limitador a la aplicación; puede usarse después en endpoints con `@limiter.limit("5/minute")`. Sin el manejador, las respuestas 429 no serían personalizadas.

# Crear la aplicación FastAPI
app = FastAPI(
    title="Neodomus API",
    description="API para sistema de gestión de domótica",
    version="1.0.0",
)
# PARA: Instancia la aplicación FastAPI con metadatos (título, descripción, versión) que aparecen en la documentación automática (/docs).
# IMPACTO: Define el punto de entrada de la API. Los metadatos mejoran la documentación generada automáticamente (Swagger UI).

# Asignar el manejador de rate limit
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
# PARA: Guarda el limitador en el estado de la app y registra un manejador de excepciones para RateLimitExceeded.
# IMPACTO: Cuando un cliente excede su límite de peticiones, FastAPI devuelve automáticamente una respuesta 429 con el mensaje apropiado.

# Configurar CORS (para permitir peticiones desde el frontend)
# Ajusta los orígenes según tu entorno
origins = [
    "http://localhost:5173",      # Frontend en desarrollo (Vite)
    "http://127.0.0.1:5173",
    "http://localhost:8000",      # Backend mismo origen
    # Agrega otras URLs si es necesario (producción)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # o ["*"] para pruebas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# PARA: Agrega el middleware CORS con la lista de orígenes permitidos. `allow_credentials=True` permite enviar cookies/tokens de autenticación. `allow_methods` y `allow_headers` con "*" permiten cualquier método y cabecera.
# IMPACTO: El frontend (React/Vue) podrá hacer peticiones a la API desde su propio dominio. Sin CORS, el navegador bloquearía las solicitudes.

# Incluir los routers con el prefijo /api/v1
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(clients_router, prefix="/api/v1")
app.include_router(tecnicos_router, prefix="/api/v1")
app.include_router(productos_router, prefix="/api/v1")   # ← Rutas de productos
# PARA: Cada router se monta en la app con el prefijo `/api/v1`. Así, las rutas definidas en auth_router (ej. `/auth/login`) quedarán como `/api/v1/auth/login`.
# IMPACTO: Organiza los endpoints bajo una versión común (`/api/v1`), facilitando futuros cambios de API sin romper compatibilidad. Todos los módulos quedan integrados.

# Endpoint de prueba para verificar que la API está viva
@app.get("/")
def root():
    return {"message": "Neodomus API funcionando"}
# PARA: Define un endpoint GET en la raíz (`/`) que retorna un mensaje simple.
# IMPACTO: Útil para verificar rápidamente que el servidor está funcionando (health check básico).

@app.get("/health")
def health_check():
    return {"status": "ok"}
# PARA: Endpoint GET `/health` que retorna `{"status": "ok"}`.
# IMPACTO: Health check más específico para sistemas de monitorización (load balancers, Docker health checks). No depende de la base de datos ni de otros servicios.

# Manejador de excepciones genéricas (opcional)
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor", "message": str(exc)},
    )
# PARA: Captura cualquier excepción no manejada y devuelve un JSON con código 500 y el mensaje de error.
# IMPACTO: Evita que el cliente reciba respuestas HTML o traces de errores internos. Mejora la seguridad y la experiencia de desarrollo (al mostrar el mensaje de error). En producción conviene desactivar el `message` detallado.

# Solo si ejecutas este archivo directamente (con uvicorn)
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
# PARA: Permite ejecutar la aplicación directamente con `python main.py`. Lee el puerto desde la variable de entorno PORT (o usa 8000 por defecto) y lanza el servidor uvicorn.
# IMPACTO: Facilita el desarrollo local sin necesidad de escribir el comando `uvicorn` cada vez. En producción normalmente se ejecuta con `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.<aqq<<<            