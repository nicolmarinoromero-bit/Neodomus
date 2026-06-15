from fastapi import APIRouter, Depends
# PARA: Importa APIRouter para crear un grupo de rutas y Depends para la inyección de dependencias.
# IMPACTO: Permite estructurar las rutas relacionadas con técnicos de forma modular, y usar dependencias como la autenticación y los roles.

from app.utils.security import get_current_employee, require_roles
# PARA: Importa la dependencia get_current_employee (extrae y valida el empleado autenticado desde el token JWT) y el decorador require_roles (restringe acceso por roles).
# IMPACTO: get_current_employee asegura que solo usuarios empleados autenticados (no clientes) puedan acceder; require_roles aplica control de acceso basado en roles adicional.

router = APIRouter(prefix="/tecnicos", tags=["Técnicos"])
# PARA: Crea una instancia de APIRouter con el prefijo "/tecnicos" y la etiqueta "Técnicos".
# IMPACTO: Todas las rutas definidas aquí comenzarán con /tecnicos (ej. /tecnicos/dashboard) y aparecerán agrupadas en la documentación Swagger bajo la etiqueta "Técnicos".

@router.get("/dashboard")
# PARA: Define un endpoint GET en /tecnicos/dashboard que devuelve un mensaje de bienvenida.
# IMPACTO: Este endpoint está protegido por el decorador require_roles y la dependencia get_current_employee, por lo que solo ciertos empleados autorizados podrán acceder.

@require_roles("tecnico", "admin")
# PARA: Decorador que verifica que el usuario autenticado tenga al menos uno de los roles especificados ("tecnico" o "admin").
# IMPACTO: Si el empleado no tiene rol "tecnico" ni "admin", se rechaza la petición con error HTTP 403 (Forbidden). Debe aplicarse después de get_current_employee.

def tecnico_dashboard(current_user = Depends(get_current_employee)):
# PARA: Define la función del endpoint, que recibe el usuario actual mediante la dependencia get_current_employee (inyecta el objeto Employee autenticado).
# IMPACTO: Obtiene los datos del empleado desde el token y la base de datos. El parámetro `current_user` no se usa explícitamente en la respuesta, pero está disponible para lógica futura.

    return {"msg": "Bienvenido al panel de técnicos"}
# PARA: Retorna un diccionario JSON con un mensaje de bienvenida.
# IMPACTO: Confirma que el acceso fue exitoso y que el usuario tiene los permisos requeridos. Puede servir como placeholder para un dashboard real.