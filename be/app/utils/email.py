"""
Módulo: utils/email.py
Funciones para envío de correos electrónicos (verificación de registro y recuperación de contraseña).
"""
# PARA: Docstring del módulo que describe su propósito general.
# IMPACTO: Documenta el contenido del archivo para desarrolladores; no afecta la ejecución.

import smtplib
# PARA: Importa el módulo smtplib, que implementa el protocolo SMTP para enviar correos electrónicos.
# IMPACTO: Permite conectarse a un servidor SMTP y enviar mensajes de correo de forma síncrona.

from email.mime.text import MIMEText
# PARA: Importa MIMEText para crear el cuerpo del correo en formato texto (HTML o plano).
# IMPACTO: Se usa para construir el contenido del mensaje dentro de la estructura MIME.

from email.mime.multipart import MIMEMultipart
# PARA: Importa MIMEMultipart para crear mensajes con múltiples partes (ej. texto + HTML).
# IMPACTO: Permite estructurar el correo con diferentes componentes (asunto, remitente, destinatario, cuerpo).

from app.config import settings
# PARA: Importa el objeto settings con la configuración de la aplicación (host SMTP, puerto, usuario, contraseña, tiempos de expiración).
# IMPACTO: Proporciona los parámetros necesarios para conectarse al servidor de correo y los valores de expiración que se muestran en los mensajes.

async def send_email(to_email: str, subject: str, body: str) -> bool:
    """
    Envía un correo electrónico usando la configuración SMTP.
    Retorna True si se envió correctamente, False en caso de error.
    """
# PARA: Define una función asíncrona que envía un correo genérico con destinatario, asunto y cuerpo HTML.
# IMPACTO: Es la función base que todas las demás usarán. Es asíncrona para no bloquear el servidor mientras se envía el correo.

    try:
# PARA: Inicia un bloque try-except para capturar excepciones durante el envío del correo.
# IMPACTO: Evita que errores de conexión SMTP o autenticación rompan la aplicación; permite devolver False controladamente.

        msg = MIMEMultipart()
# PARA: Crea un objeto MIMEMultipart que actuará como contenedor del mensaje.
# IMPACTO: Permite añadir diferentes partes al correo (asunto, remitente, destinatario, cuerpo).

        msg['From'] = settings.SMTP_USERNAME
# PARA: Asigna el remitente del correo tomándolo de la configuración (usuario SMTP).
# IMPACTO: El destinatario verá que el correo proviene de esta dirección (normalmente la cuenta configurada en las variables de entorno).

        msg['To'] = to_email
# PARA: Asigna el destinatario del correo.
# IMPACTO: El correo se enviará a la dirección del usuario (cliente o empleado).

        msg['Subject'] = subject
# PARA: Asigna el asunto del mensaje.
# IMPACTO: El usuario verá esta línea en su bandeja de entrada.

        msg.attach(MIMEText(body, 'html'))
# PARA: Crea un objeto MIMEText con el contenido del correo (en formato HTML) y lo adjunta al mensaje.
# IMPACTO: El cuerpo del correo se mostrará como HTML, permitiendo diseños atractivos (colores, fuentes, botones).

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
# PARA: Establece una conexión con el servidor SMTP usando el host y puerto configurados (ej. smtp.gmail.com, 587).
# IMPACTO: Crea un objeto server que representa la conexión SMTP; sin ella no se puede enviar el correo.

        server.starttls()
# PARA: Inicia una sesión TLS (Transport Layer Security) para cifrar la comunicación con el servidor SMTP.
# IMPACTO: Protege las credenciales y el contenido del correo durante la transmisión. Es obligatorio en la mayoría de servidores modernos.

        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
# PARA: Autentica al usuario en el servidor SMTP usando las credenciales de configuración.
# IMPACTO: Verifica que la cuenta de correo sea legítima; sin autenticación, muchos servidores rechazarán el envío.

        server.send_message(msg)
# PARA: Envía el mensaje construido al servidor SMTP, que lo entregará al destinatario.
# IMPACTO: Es el paso final del envío. Si falla (por ejemplo, destinatario inválido), se lanzará una excepción.

        server.quit()
# PARA: Cierra la conexión con el servidor SMTP de forma ordenada.
# IMPACTO: Libera recursos y notifica al servidor que la sesión ha terminado.

        return True
# PARA: Retorna True si todas las operaciones anteriores se completaron sin excepciones.
# IMPACTO: Las funciones llamadoras pueden saber que el correo se envió correctamente.

    except Exception as e:
# PARA: Captura cualquier excepción que ocurra durante el proceso de envío.
# IMPACTO: Evita que el error detenga la ejecución; permite manejar el fallo de forma controlada.

        print(f"Error enviando email a {to_email}: {e}")
# PARA: Imprime un mensaje de error en la consola con el destinatario y la excepción.
# IMPACTO: Ayuda a depurar problemas de configuración SMTP o de red en desarrollo/producción.

        return False
# PARA: Retorna False indicando que el envío falló.
# IMPACTO: La función llamadora puede reaccionar (ej. registrar en logs, pero no interrumpir el flujo).


# ============================================================
# 1. Verificación de registro (bienvenida a Neodomus)
# ============================================================
async def send_verification_email(to_email: str, code: str) -> bool:
    """
    Envía el código de 6 dígitos para verificar el registro de un nuevo cliente.
    Incluye un mensaje de bienvenida a Neodomus.
    """
# PARA: Define una función asíncrona específica para enviar el código de verificación de registro.
# IMPACTO: Separa la lógica de verificación de la genérica, facilitando cambios en la plantilla.

    subject = "Bienvenido a Neodomus - Verifica tu cuenta"
# PARA: Define el asunto del correo de verificación.
# IMPACTO: El usuario identifica fácilmente que es un mensaje de activación de cuenta.

    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Verificación de registro</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h1 style="color: #2c3e50; text-align: center;">¡Bienvenido a Neodomus!</h1>
            <p style="font-size: 16px; line-height: 1.5; color: #333;">Gracias por registrarte en <strong>Neodomus</strong>, tu plataforma de domótica inteligente.</p>
            <p style="font-size: 16px; line-height: 1.5; color: #333;">Para activar tu cuenta, utiliza el siguiente código de verificación:</p>
            <div style="background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
                {code}
            </div>
            <p style="font-size: 14px; color: #7f8c8d;">Este código expira en {settings.VERIFICATION_TOKEN_EXPIRE_HOURS} horas.</p>
            <p style="font-size: 14px; color: #7f8c8d;">Si no solicitaste este registro, ignora este mensaje.</p>
            <hr style="margin: 30px 0;">
            <p style="font-size: 12px; color: #95a5a6; text-align: center;">Neodomus - Innovación para tu hogar</p>
        </div>
    </body>
    </html>
    """
# PARA: Construye el cuerpo HTML del mensaje con un diseño atractivo: título, saludo, explicación, código destacado, tiempo de expiración, y aviso de seguridad.
# IMPACTO: Mejora la experiencia del usuario al recibir un correo bien formateado y profesional. El código se muestra en grande y con espaciado para facilitar su lectura. La expiración se toma de la configuración (settings.VERIFICATION_TOKEN_EXPIRE_HOURS) para mantener coherencia con la lógica de negocio.

    return await send_email(to_email, subject, body)
# PARA: Llama a la función genérica send_email con los parámetros construidos y retorna su resultado (True/False).
# IMPACTO: Reutiliza la lógica de conexión SMTP y manejo de errores. El hecho de ser asíncrono permite que el envío no bloquee el servidor mientras se conecta al servidor de correo.


# ============================================================
# 2. Recuperación de contraseña (código de restablecimiento)
# ============================================================
async def send_password_reset_code(to_email: str, code: str, user_type: str) -> bool:
    """
    Envía el código de 6 dígitos para restablecer la contraseña.
    """
# PARA: Función asíncrona para enviar el código de recuperación de contraseña.
# IMPACTO: Permite a los usuarios restablecer su contraseña de forma segura mediante un código de un solo uso.

    subject = "Neodomus - Código para restablecer tu contraseña"
# PARA: Asunto del correo de recuperación.
# IMPACTO: El usuario sabe inmediatamente que es un mensaje sobre cambio de contraseña.

    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Recuperación de contraseña</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h1 style="color: #2c3e50; text-align: center;">Restablece tu contraseña</h1>
            <p style="font-size: 16px; line-height: 1.5; color: #333;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>Neodomus</strong>.</p>
            <p style="font-size: 16px; line-height: 1.5; color: #333;">Utiliza el siguiente código de 6 dígitos:</p>
            <div style="background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
                {code}
            </div>
            <p style="font-size: 14px; color: #7f8c8d;">Este código expira en {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutos.</p>
            <p style="font-size: 14px; color: #7f8c8d;">Si no solicitaste este cambio, ignora este mensaje. Tu contraseña actual permanecerá activa.</p>
            <hr style="margin: 30px 0;">
            <p style="font-size: 12px; color: #95a5a6; text-align: center;">Neodomus - Seguridad y confianza</p>
        </div>
    </body>
    </html>
    """
# PARA: Construye un mensaje HTML similar pero adaptado a la recuperación: explica que alguien solicitó restablecer la contraseña, muestra el código de 6 dígitos, indica la expiración en minutos (según configuración) y advierte que se ignore si no fue solicitado.
# IMPACTO: Proporciona claridad y seguridad al usuario. La expiración corta (minutos) aumenta la seguridad. El diseño mantiene la identidad visual de Neodomus.

    return await send_email(to_email, subject, body)
# PARA: Envía el correo llamando a la función base y retorna el resultado.
# IMPACTO: Igual que en la verificación, centraliza la lógica de envío y manejo de errores. El parámetro `user_type` se recibe pero no se usa en el cuerpo; podría servir para personalizar el mensaje según si es cliente o empleado en una versión futura.