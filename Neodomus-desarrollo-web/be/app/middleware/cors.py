import os
from fastapi.middleware.cors import CORSMiddleware

DEFAULT_ORIGINS = [
    # Web NEODOMUS (Vite)
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    # API local
    "http://localhost:8000",
    # Expo web (expo start -> w)
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:8082",
]

def setup_cors(app):
    # Los orígenes por defecto siempre se permiten (web + API local).
    # CORS_ORIGINS permite agregar orígenes adicionales (p. ej. la IP LAN
    # de un computador de desarrollo: http://192.168.x.x:8081).
    extra = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
    origins = list(dict.fromkeys(DEFAULT_ORIGINS + extra))
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
