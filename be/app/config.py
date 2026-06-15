import os
# PARA: Importa el módulo os para interactuar con el sistema operativo (aunque no se usa directamente en este archivo, podría estar para futuras funcionalidades o para acceder a variables de entorno de forma alternativa).
# IMPACTO: No tiene impacto directo aquí, pero está disponible si se necesitara.

from typing import Optional
# PARA: Importa Optional para anotaciones de tipos (campos que pueden ser None).
# IMPACTO: Permite definir atributos opcionales en la clase Settings, mejorando la claridad y el soporte de IDEs.

from pydantic_settings import BaseSettings
# PARA: Importa BaseSettings desde pydantic_settings, que es la clase base para manejar configuraciones con carga desde archivos .env y variables de entorno.
# IMPACTO: Permite definir un modelo de configuración que automáticamente lee valores de variables de entorno y/o archivo .env, con validación de tipos y valores por defecto.

from pydantic import ConfigDict
# PARA: Importa ConfigDict para configurar el comportamiento del modelo (ej. archivo .env, codificación, sensibilidad a mayúsculas).
# IMPACTO: Permite personalizar cómo se cargan y validan las variables, como la ruta del archivo .env y si se ignoran campos extra.


class Settings(BaseSettings):
    """
    Configuración central de la aplicación.
    Las variables se cargan desde el archivo .env y las variables de entorno del sistema.
    """
# PARA: Define la clase Settings que hereda de BaseSettings. Contiene todas las variables de configuración de la aplicación.
# IMPACTO: Centraliza toda la configuración en un solo lugar, fácil de importar (`from app.config import settings`). Al heredar de BaseSettings, los valores se cargan automáticamente desde el archivo .env o variables de entorno, permitiendo sobreescribir por entorno (desarrollo, pruebas, producción).

    # --- Base de datos ---
    DATABASE_URL: str = "mysql+pymysql://neodomus:neodomus123@db:3306/neodomus?charset=utf8mb4"
# PARA: URL de conexión a la base de datos MySQL usando PyMySQL. Incluye usuario, contraseña, host, puerto, nombre de BD y charset.
# IMPACTO: Define la conexión por defecto a la BD. Se puede sobreescribir con variable de entorno DATABASE_URL. El valor por defecto es para desarrollo local con Docker (host=db). En producción, se cambiaría mediante variable de entorno.

    # --- JWT y seguridad ---
    SECRET_KEY: str = "clave_super_segura_para_desarrollo_cambiar_en_produccion"
# PARA: Clave secreta para firmar y verificar tokens JWT.
# IMPACTO: Es fundamental para la seguridad de autenticación. En desarrollo se usa un valor fijo; en producción DEBE ser cambiada por una clave fuerte y secreta (variable de entorno). Si se usa la misma en producción, los tokens podrían ser falsificados.

    ALGORITHM: str = "HS256"
# PARA: Algoritmo de cifrado para JWT (HS256 = HMAC-SHA256).
# IMPACTO: Define el algoritmo estándar usado para firmar tokens. No debería cambiarse sin modificar la lógica de autenticación.

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
# PARA: Tiempo de expiración del access token en minutos (15 por defecto).
# IMPACTO: Los tokens de acceso tienen corta duración (15 minutos), lo que mejora la seguridad (si se roban, son válidos poco tiempo). Se puede ajustar según necesidades.

    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
# PARA: Tiempo de expiración del refresh token en días (7 por defecto).
# IMPACTO: Los refresh tokens duran más, permitiendo obtener nuevos access tokens sin re-autenticar. Mayor duración que los access tokens, pero se recomienda rotarlos.

    # --- Verificación de email y recuperación de contraseña ---
    VERIFICATION_TOKEN_EXPIRE_HOURS: int = 24
# PARA: Tiempo de expiración del código de verificación de email en horas (24 horas por defecto).
# IMPACTO: El usuario tiene 24 horas para usar el código que recibió en su correo después de registrarse. Pasado ese tiempo, debe solicitar un nuevo código.

    # NUEVA variable en MINUTOS para el código de recuperación
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 10   # 10 minutos por defecto
# PARA: Tiempo de expiración del código de restablecimiento de contraseña en minutos (10 minutos por defecto).
# IMPACTO: El código para restablecer contraseña es muy sensible; expira rápidamente (10 minutos) por razones de seguridad. Se puede ajustar.

    # Opcional: se mantiene por compatibilidad, pero ya no se usa
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 1
# PARA: Variable obsoleta mantenida por compatibilidad (antiguamente se usaban horas).
# IMPACTO: No se usa en la lógica actual, pero está presente para evitar errores si algún otro módulo antiguo la referencia. Puede eliminarse en el futuro.

    # --- SMTP (Gmail) ---
    SMTP_HOST: str = "smtp.gmail.com"
# PARA: Host del servidor SMTP para enviar correos (por defecto, el de Gmail).
# IMPACTO: Se usa para conectarse al servidor de correo. Puede cambiarse a otros proveedores (SendGrid, Mailgun, etc.) modificando la variable.

    SMTP_PORT: int = 587
# PARA: Puerto del servidor SMTP (587 es el puerto estándar para TLS).
# IMPACTO: Define el puerto para la conexión segura. El 587 es común con STARTTLS.

    SMTP_USERNAME: str = ""
# PARA: Nombre de usuario (email) para autenticarse en el servidor SMTP.
# IMPACTO: En desarrollo debe estar vacío; en producción se debe establecer mediante variable de entorno. Sin credenciales válidas, no se enviarán correos.

    SMTP_PASSWORD: str = ""
# PARA: Contraseña del usuario SMTP (o contraseña de aplicación si es Gmail).
# IMPACTO: Sensible; debe configurarse mediante variable de entorno. Nunca debe ir en el código fuente.

    # --- Frontend URLs ---
    FRONTEND_URL: str = "http://localhost:5173"
# PARA: URL base del frontend (por defecto, la de Vite en desarrollo).
# IMPACTO: Se usa para construir enlaces en los correos electrónicos (por ejemplo, para verificar email o restablecer contraseña). En producción debe apuntar al dominio real.

    FRONTEND_VERIFY_EMAIL_PATH: str = "/verify-email"
# PARA: Ruta relativa en el frontend para la verificación de email.
# IMPACTO: Se combina con FRONTEND_URL para crear el enlace completo que el usuario debe visitar para verificar su cuenta.

    FRONTEND_RESET_PASSWORD_PATH: str = "/reset-password"
# PARA: Ruta relativa en el frontend para el restablecimiento de contraseña.
# IMPACTO: Similar a la anterior, para construir el enlace donde el usuario ingresará el código y la nueva contraseña.

    # --- Entorno ---
    ENVIRONMENT: str = "development"  # development, staging, production
# PARA: Entorno actual de ejecución (desarrollo, staging, producción).
# IMPACTO: Permite ajustar comportamientos según el entorno (por ejemplo, logs más detallados en desarrollo, mayor seguridad en producción).

    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
# PARA: Configura el comportamiento del modelo BaseSettings. Especifica el archivo .env (en el directorio raíz), codificación UTF-8, que los nombres de variables sean sensibles a mayúsculas (ej. DATABASE_URL) y que ignore variables extra no declaradas.
# IMPACTO: Las variables de entorno pueden definirse en un archivo .env para desarrollo local, pero también se pueden pasar directamente. La opción `extra="ignore"` evita errores si hay variables no definidas en la clase.


# Instancia única para importar en otros módulos
settings = Settings()
# PARA: Crea una única instancia de Settings que se importará en otros módulos.
# IMPACTO: Garantiza que toda la aplicación use la misma configuración (singleton). Se importa con `from app.config import settings`. Al instanciar, se cargan automáticamente los valores desde .env y variables de entorno.