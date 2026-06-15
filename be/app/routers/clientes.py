from fastapi import APIRouter, Depends
# PARA: Importa APIRouter para crear un grupo de rutas y Depends para la inyección de dependencias.
# IMPACTO: Permite estructurar las rutas relacionadas con clientes de forma modular, y usar dependencias como la autenticación o la sesión de base de datos.

from sqlalchemy.orm import Session
# PARA: Importa el tipo Session de SQLAlchemy para tipar la sesión de base de datos.
# IMPACTO: Ayuda en la verificación de tipos y documenta que ciertas funciones (aunque no se usen directamente en este archivo) podrían recibir una sesión.

from app.database import get_db
# PARA: Importa la función get_db que provee una sesión de base de datos.
# IMPACTO: Se podría usar en otros endpoints de este router si se necesitara acceso a BD, aunque en el único endpoint definido no se usa.

from app.models.cliente import Cliente
# PARA: Importa el modelo Cliente para usarlo como tipo de retorno o para anotaciones.
# IMPACTO: Permite tipar el objeto `current_client` como una instancia del modelo Cliente, mejorando la documentación y el soporte del IDE.

from app.utils.security import get_current_client
# PARA: Importa la dependencia get_current_client que valida el token JWT y retorna el cliente autenticado (desde la tabla `clientes`).
# IMPACTO: Se usa para proteger rutas exclusivas de clientes (no empleados). Si el token no es válido o el usuario no es un cliente, lanza HTTP 401.

router = APIRouter(prefix="/clients", tags=["Clients"])
# PARA: Crea una instancia de APIRouter con el prefijo "/clients" y la etiqueta "Clients".
# IMPACTO: Todas las rutas definidas aquí comenzarán con /clients (ej. /clients/me) y aparecerán agrupadas bajo la etiqueta "Clients" en la documentación Swagger.

@router.get("/me")
def get_my_profile(current_client: Cliente = Depends(get_current_client)):
    return current_client
# PARA: Define un endpoint GET en /clients/me que depende de get_current_client.
# IMPACTO: El cliente debe enviar un token JWT válido (obtenido en login). La dependencia extrae el cliente de la BD y lo inyecta como `current_client`. El endpoint simplemente retorna los datos del cliente autenticado (nombre, email, etc.), útil para mostrar el perfil en el frontend.
