import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# Importar middlewares desde la nueva carpeta
from app.middleware import setup_cors, setup_rate_limit

# Importar routers
from app.routers import (
    auth_router,
    users_router,
    clients_router,
    tecnicos_router,
    productos_router,
)

# Crear la aplicación FastAPI
app = FastAPI(
    title="Neodomus API",
    description="API para sistema de gestión de domótica",
    version="1.0.0",
)

# Configurar middlewares
setup_cors(app)
setup_rate_limit(app)

# Incluir routers con prefijo /api/v1
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(clients_router, prefix="/api/v1")
app.include_router(tecnicos_router, prefix="/api/v1")
app.include_router(productos_router, prefix="/api/v1")

# Endpoint de prueba
@app.get("/")
def root():
    return {"message": "Neodomus API funcionando"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Manejador de excepciones genéricas
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor", "message": str(exc)},
    )

# Ejecución directa (opcional)
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)