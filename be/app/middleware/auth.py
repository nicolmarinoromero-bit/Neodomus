from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Aquí puedes validar tokens, logs, etc.
        response = await call_next(request)
        return response

def setup_auth_middleware(app):
    app.add_middleware(AuthMiddleware)