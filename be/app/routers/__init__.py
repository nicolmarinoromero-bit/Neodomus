from .auth import router as auth_router
from .users import router as users_router
from .clientes import router as clients_router
from .tecnicos import router as tecnicos_router
from .productos import router as productos_router   # ← asegurar esta línea
from .citas import router as citas_router
from .solicitudes import router as solicitudes_router