# Neodomus - Guía de ejecución con Docker

Este documento explica cómo levantar el entorno completo de **Neodomus** (backend FastAPI, frontend React + Vite y base de datos MySQL) usando Docker Compose.

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.
- [Git](https://git-scm.com/) (opcional, para clonar el repositorio).
- Puerto `5173` (frontend), `8000` (backend) y `3307` (MySQL) disponibles en tu máquina.

## 1. Clonar el repositorio (si no lo tienes)

```bash
git clone <url-del-repositorio>
cd neodomus

2. Configurar variables de entorno
Crea un archivo .env en la raíz del proyecto (junto al docker-compose.yml) con el siguiente contenido mínimo:

# JWT
SECRET_KEY=tu_clave_secreta_muy_larga_y_aleatoria
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Recuperación de contraseña (expiración en minutos)
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=10

# Verificación de email (horas)
VERIFICATION_TOKEN_EXPIRE_HOURS=24

# SMTP (opcional, para envío real de correos)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu_correo@gmail.com
SMTP_PASSWORD=tu_contraseña_de_aplicacion

# Frontend
FRONTEND_URL=http://localhost:5173
FRONTEND_VERIFY_EMAIL_PATH=/verify-email
FRONTEND_RESET_PASSWORD_PATH=/reset-password

# Entorno
ENVIRONMENT=development

Nota: Para pruebas locales, puedes dejar las variables SMTP vacías; los códigos se imprimirán en los logs del backend.

3. Construir y levantar los contenedores
Desde la raíz del proyecto, ejecuta:

ejemplo:
PS C:\Users\nicol\OneDrive\Documentos\neodomus>

docker-compose build --no-cache
docker-compose up -d

Esto construirá las imágenes y levantará los tres servicios:

neodomus_mysql (base de datos MySQL)

neodomus_api (backend FastAPI)

neodomus_frontend (frontend con Vite)

4. Verificar que los contenedores estén funcionando

docker ps

resultado:

PS C:\Users\nicol\OneDrive\Documentos\neodomus> docker ps
CONTAINER ID   IMAGE               COMMAND                  CREATED          STATUS                 PORTS                                         NAMES
aa858f17c639   neodomus-frontend   "docker-entrypoint.s…"   10 minutes ago   Up 10 minutes          0.0.0.0:5173->5173/tcp, [::]:5173->5173/tcp   neodomus_frontend
d017bebb61d1   neodomus-api        "uvicorn app.main:ap…"   2 hours ago      Up 2 hours             0.0.0.0:8000->8000/tcp, [::]:8000->8000/tcp   neodomus_api
9c74079e09fe   mysql:8.0           "docker-entrypoint.s…"   2 hours ago      Up 2 hours (healthy)   0.0.0.0:3307->3306/tcp, [::]:3307->3306/tcp   neodomus_mysql

Debes ver los tres contenedores con estado Up.

5. Inicializar la base de datos (primer despliegue)
El script SQL de inicialización (scripts/init_db.sql) se ejecuta automáticamente la primera vez. Si necesitas reiniciar la base de datos desde cero, puedes ejecutar:

docker exec -i neodomus_mysql mysql -u root -proot123 neodomus < scripts/init_db.sql


6. Actualizar contraseñas de usuarios de prueba
Para poder iniciar sesión con los usuarios precargados (clientes y empleados), actualiza sus contraseñas a 123456 con el siguiente comando:

docker exec -it neodomus_api python -c "
from app.database import SessionLocal
from app.models.user import User
from app.models.cliente import Cliente
from app.utils.security import hash_password

db = SessionLocal()
for u in db.query(User).all():
    u.password_hash = hash_password('123456')
    print(f'Usuario actualizado: {u.email}')
for c in db.query(Cliente).all():
    c.password_hash = hash_password('123456')
    c.is_active = True
    print(f'Cliente actualizado: {c.email}')
db.commit()
db.close()
print('Todas las contraseñas actualizadas a 123456')
"

7. Instalar dependencias adicionales en el frontend (opcional)
Si necesitas instalar framer-motion para animaciones, primero accede al contenedor del frontend o instala localmente y reconstruye. Usando pnpm (recomendado):

docker exec -it neodomus_frontend pnpm add framer-motion

Luego reconstruye el frontend para que los cambios persistan:

docker-compose build --no-cache frontend
docker-compose up -d frontend

8. Acceder a la aplicación
Frontend: http://localhost:5173

Backend (documentación API): http://localhost:8000/docs

Base de datos (puerto externo): localhost:3307 (usuario neodomus, contraseña neodomus123)


9. Credenciales de prueba
Después de actualizar las contraseñas (paso 6), puedes usar:

Cliente: laura.garcia@gmail.com / 123456

Empleado (técnico): carlos.andres.gomez@gmail.com / 123456

Administrador: nicolmarinoromero@gmail.com / 123456



Estructura de archivos relevante
neodomus/
├── docker-compose.yml
├── .env
├── scripts/
│   └── init_db.sql
├── be/
│   ├── Dockerfile
│   └── app/...
├── fe/
│   ├── Dockerfile
│   ├── package.json
│   └── src/...
└── README.md


Notas adicionales
El backend usa hot-reload: los cambios en el código local se reflejan automáticamente gracias al volumen montado (./be:/app).

El frontend también tiene hot-reload con el volumen ./fe:/app.

Los correos de verificación y recuperación de contraseña se imprimen en los logs del backend si SMTP no está configurado.