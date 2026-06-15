FROM python:3.12-slim
# PARA: Define la imagen base oficial de Python 3.12 en su versión "slim" (ligera).
# IMPACTO: Reduce el tamaño final de la imagen al incluir solo lo esencial, mejora la seguridad y acelera las descargas.

WORKDIR /app
# PARA: Establece el directorio de trabajo dentro del contenedor como /app.
# IMPACTO: Todas las siguientes instrucciones (COPY, RUN, CMD) se ejecutarán en esa ruta, organizando el código y evitando rutas absolutas.

COPY requirements.txt .
# PARA: Copia el archivo requirements.txt desde el host (directorio actual) al directorio /app del contenedor.
# IMPACTO: Separa la instalación de dependencias del resto del código, permitiendo usar la caché de Docker para no reinstalar todo si solo cambia el código fuente.

RUN pip install --no-cache-dir -r requirements.txt
# PARA: Ejecuta pip para instalar todas las dependencias listadas en requirements.txt, con la opción --no-cache-dir.
# IMPACTO: Evita guardar la caché de pip dentro de la imagen, reduciendo su tamaño; además garantiza una instalación limpia y reproducible.

COPY . .
# PARA: Copia todo el contenido del contexto de construcción (código fuente, assets, etc.) al directorio /app del contenedor.
# IMPACTO: Incluye la aplicación completa en la imagen. Si no se usa un .dockerignore, puede copiar archivos innecesarios aumentando el tamaño y riesgos.

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
# PARA: Define el comando por defecto al ejecutar un contenedor basado en esta imagen: inicia Uvicorn sirviendo la aplicación FastAPI desde app.main:app.
# IMPACTO: Escucha en todas las interfaces (0.0.0.0) para ser accesible desde fuera, usa el puerto 8000 y la opción --reload (útil en desarrollo, no en producción) que reinicia el servidor al detectar cambios.