import pytest
# PARA: Importa el módulo pytest, que es el framework de pruebas unitarias.
# IMPACTO: Permite usar decoradores como @pytest.mark.asyncio y afirmaciones (assert) propias de pytest. Sin esta importación, el test no se ejecutaría como prueba de pytest.

from httpx import AsyncClient
# PARA: Importa AsyncClient de httpx, un cliente HTTP asíncrono.
# IMPACTO: Permite hacer peticiones HTTP asíncronas a la aplicación FastAPI durante las pruebas. Es necesario para probar endpoints asíncronos.

from app.main import app
# PARA: Importa la instancia de la aplicación FastAPI desde app.main.
# IMPACTO: Proporciona la aplicación que se va a probar. Sin esto, no habría un servidor contra el cual hacer las peticiones.

@pytest.mark.asyncio
# PARA: Marca la función de prueba como asíncrona, indicando a pytest que debe ejecutarla dentro de un bucle de eventos asyncio.
# IMPACTO: Permite usar `await` dentro de la función. Si no se usa este marcador, pytest no ejecutaría correctamente pruebas asíncronas.

async def test_register_client():
# PARA: Define una función de prueba asíncrona llamada test_register_client.
# IMPACTO: Esta función será ejecutada por pytest como una prueba unitaria. Su nombre debe comenzar con "test_" para que pytest la reconozca.

    async with AsyncClient(app=app, base_url="http://test") as ac:
# PARA: Crea un cliente HTTP asíncrono usando la aplicación FastAPI (app) y una URL base ficticia "http://test".
# IMPACTO: El cliente se usa para hacer peticiones a la aplicación sin necesidad de levantar un servidor real. El `async with` garantiza que el cliente se cierre correctamente al salir del bloque.

        response = await ac.post("/auth/register", json={
            "nombre": "Test",
            "apellido": "User",
            "tipo_documento_id": 1,
            "documento": 123456789,
            "telefono": 3001234567,
            "email": "test@example.com",
            "direccion": "Calle Falsa 123",
            "password": "secret123"
        })
# PARA: Envía una petición POST al endpoint "/auth/register" con un cuerpo JSON que simula el registro de un cliente.
# IMPACTO: La respuesta se guarda en la variable `response`. Esta petición probará el endpoint de registro; si el endpoint espera otros campos (como `first_name`, `last_name`, etc.), el test fallará porque los datos no coinciden con el esquema real.

    assert response.status_code == 201
# PARA: Verifica que el código de estado HTTP de la respuesta sea 201 (Created).
# IMPACTO: Si el endpoint responde con cualquier otro código (ej. 400, 422, 500), la aserción falla y pytest reporta el test como fallido. Confirma que el registro se completó exitosamente.