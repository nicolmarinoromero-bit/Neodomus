import os
# PARA: Importa el módulo os para interactuar con el sistema operativo (no se usa directamente en este archivo, pero podría estar para futuras funcionalidades o variables de entorno).
# IMPACTO: No tiene impacto directo aquí, pero está disponible si se necesitara.

from datetime import datetime, timedelta
# PARA: Importa datetime (fecha/hora actual) y timedelta (para sumar/restar intervalos de tiempo).
# IMPACTO: Se usa para establecer fechas de expiración de tokens JWT (access y refresh).

from typing import Optional, Dict, Any, Union
# PARA: Importa tipos para anotaciones: Optional (valor opcional), Dict (diccionario), Any (cualquier tipo), Union (varios tipos posibles).
# IMPACTO: Mejora la legibilidad y el chequeo estático de tipos, documentando qué esperan las funciones.

from jose import JWTError, jwt
# PARA: Importa JWTError (excepción) y jwt (funciones para codificar/decodificar JWT) de la librería python-jose.
# IMPACTO: Permite crear y verificar tokens JWT de forma segura. JWTError captura errores de token inválido/expirado.

from passlib.context import CryptContext
# PARA: Importa CryptContext de passlib para manejar hashing de contraseñas con algoritmos como bcrypt.
# IMPACTO: Permite hashear contraseñas y verificarlas de forma segura, con soporte para múltiples algoritmos.

from fastapi import Depends, HTTPException, status
# PARA: Importa Depends (inyección de dependencias), HTTPException (errores HTTP) y status (códigos HTTP) de FastAPI.
# IMPACTO: Se usa para crear dependencias de autenticación, lanzar errores 401/403 y usar constantes de estado HTTP.

from fastapi.security import OAuth2PasswordBearer
# PARA: Importa OAuth2PasswordBearer para crear un esquema de seguridad OAuth2 con flujo de contraseña.
# IMPACTO: Define cómo se espera recibir el token (generalmente en el header Authorization: Bearer <token>) y provee la dependencia para extraerlo.

from sqlalchemy.orm import Session
# PARA: Importa Session de SQLAlchemy para tipar la sesión de base de datos.
# IMPACTO: Permite inyectar la sesión en las dependencias para consultar usuarios o clientes.

from app.database import get_db
# PARA: Importa la función get_db que provee una sesión de base de datos.
# IMPACTO: Se usa como dependencia en get_current_user para obtener la sesión y consultar la BD.

from app.models.user import User
# PARA: Importa el modelo User (empleados).
# IMPACTO: Se usa para consultar empleados por email y verificar su estado.

from app.models.cliente import Cliente
# PARA: Importa el modelo Cliente.
# IMPACTO: Se usa para consultar clientes por email y verificar su estado.

from app.config import settings          # ✅ Importación necesaria
# PARA: Importa la configuración de la aplicación (SECRET_KEY, ALGORITHM, tiempos de expiración).
# IMPACTO: Centraliza los parámetros sensibles y configurables, evitando valores fijos en el código.

# ------------------------------------------------------------
# Hashing de contraseñas
# ------------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# PARA: Crea un contexto de hash con el algoritmo bcrypt, que es seguro y lento por diseño.
# IMPACTO: Será usado por hash_password y verify_password. El parámetro deprecated="auto" permite migrar a algoritmos más nuevos en el futuro.

def hash_password(password: str) -> str:
    return pwd_context.hash(password)
# PARA: Recibe una contraseña en texto plano y retorna su hash bcrypt.
# IMPACTO: Se usa al registrar un nuevo usuario o cambiar contraseña. Nunca se almacena la contraseña en texto plano.

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
# PARA: Compara una contraseña en texto plano con un hash almacenado y retorna True si coinciden.
# IMPACTO: Se usa en login para validar credenciales. Es segura contra ataques de temporización.

# ------------------------------------------------------------
# Configuración JWT
# ------------------------------------------------------------
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS
# PARA: Asigna las variables de configuración a constantes locales para facilitar su uso.
# IMPACTO: Define la clave secreta para firmar tokens (debe ser robusta y mantenerse en secreto), el algoritmo (HS256), y los tiempos de expiración de access token (minutos) y refresh token (días).

def create_access_token(data: Dict[str, Any], user_type: str = None, rol: str = None) -> str:
    to_encode = data.copy()
    if user_type:
        to_encode["user_type"] = user_type
    if rol:
        to_encode["rol"] = rol          # ✅ Cambiado de "role" a "rol"
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
# PARA: Crea un token de acceso JWT. Recibe datos (ej. {"sub": email}), opcionalmente user_type y rol. Añade expiración y tipo "access", luego codifica y firma.
# IMPACTO: Los tokens de acceso tienen corta duración (minutos). Incluir user_type y rol permite autorización granular y evita consultar BD en cada request. El token se usa para autenticar peticiones.

def create_refresh_token(data: Dict[str, Any], user_type: str = None, rol: str = None) -> str:
    to_encode = data.copy()
    if user_type:
        to_encode["user_type"] = user_type
    if rol:
        to_encode["rol"] = rol          # ✅ Cambiado de "role" a "rol"
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
# PARA: Similar a create_access_token pero con expiración en días y tipo "refresh".
# IMPACTO: Los refresh tokens permiten obtener nuevos access tokens sin volver a pedir credenciales. Tienen mayor duración, pero se recomienda rotarlos y almacenarlos de forma segura.

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
# PARA: Intenta decodificar un token JWT sin verificar el tipo. Retorna el payload o None si hay error.
# IMPACTO: Útil para depuración o para validaciones preliminares. No lanza excepción, sino que retorna None, permitiendo manejar errores en niveles superiores.

def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != token_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Tipo de token inválido, se esperaba {token_type}"
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )
# PARA: Verifica un token, comprobando su firma, expiración y que el campo "type" coincida con el esperado.
# IMPACTO: Se usa para proteger endpoints que requieren un tipo específico de token (access o refresh). Lanza HTTP 401 con mensajes claros, útil para depuración.

# ------------------------------------------------------------
# Dependencias para obtener usuario/cliente actual
# ------------------------------------------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)
# PARA: Crea un esquema OAuth2 que espera un token en el header Authorization: Bearer. tokenUrl es la ruta de login (no se usa directamente pero ayuda a documentación). auto_error=False evita lanzar excepción automática cuando falta el token.
# IMPACTO: La dependencia oauth2_scheme se puede inyectar en endpoints para obtener el token como string. Con auto_error=False, podemos manejar manualmente la falta de token.

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Union[User, Cliente]:
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    email = payload.get("sub")
    user_type = payload.get("user_type")
    if not email or user_type not in ("employee", "client"):
        raise HTTPException(status_code=401, detail="Payload de token inválido")
    
    if user_type == "employee":
        user = db.query(User).filter(User.email == email).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="Usuario no encontrado o inactivo")
        return user
    else:  # client
        client = db.query(Cliente).filter(Cliente.email == email).first()
        if not client or not client.is_active:
            raise HTTPException(status_code=401, detail="Cliente no encontrado o inactivo")
        return client
# PARA: Dependencia principal que obtiene el token, lo decodifica, extrae email y user_type, consulta la BD y retorna el objeto User o Cliente correspondiente (si está activo).
# IMPACTO: Es la base para get_current_employee y get_current_client. Maneja todos los casos de error (token faltante, inválido, mal formado, usuario/cliente inexistente o inactivo). Retorna el objeto ORM, permitiendo acceder directamente a sus atributos en los endpoints protegidos.

async def get_current_employee(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    user = await get_current_user(token, db)
    if not isinstance(user, User):
        raise HTTPException(status_code=403, detail="Se requiere rol de empleado")
    return user
# PARA: Dependencia que obtiene el usuario actual y verifica que sea un empleado (User, no Cliente).
# IMPACTO: Se usa en rutas que solo deben ser accesibles por empleados. Si un cliente intenta acceder, recibe HTTP 403 Forbidden.

async def get_current_client(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Cliente:
    user = await get_current_user(token, db)
    if not isinstance(user, Cliente):
        raise HTTPException(status_code=403, detail="Se requiere rol de cliente")
    return user
# PARA: Dependencia que obtiene el usuario actual y verifica que sea un cliente.
# IMPACTO: Similar a get_current_employee, pero para rutas exclusivas de clientes (ej. perfil, pedidos).

def require_roles(*allowed_roles: str):
    def decorator(func):
        async def wrapper(*args, current_user: User = Depends(get_current_employee), **kwargs):
            user_role = getattr(current_user, "nombre_rol", None)
            if not user_role or user_role not in allowed_roles:
                raise HTTPException(status_code=403, detail="Permisos insuficientes")
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator
# PARA: Decorador que restringe el acceso a empleados que tengan un rol específico (admin, tecnico, etc.). Se espera que el modelo User tenga un atributo `nombre_rol` (o se cargue mediante relación).
# IMPACTO: Permite autorización fina: por ejemplo, @require_roles("admin") solo administradores. Se aplica después de get_current_employee. Si el empleado no tiene rol o no está permitido, responde con 403. Nota: depende de que `current_user` tenga el campo `nombre_rol`; si no está cargado, fallará.