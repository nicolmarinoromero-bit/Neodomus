# NeoDomus API

API para gestión de ventas, servicios técnicos, inventario y facturación.

## Ejecución

```bash
docker-compose up --build

La API estará en http://localhost:8000 , documentación en /docs.

Base de datos (MySQL Workbench)
Host: localhost

Puerto: 3306

Usuario: neodomus

Contraseña: neodomus123


### `scripts/init_db.sql`

```sql
USE neodomus;

INSERT IGNORE INTO tipos_documento (nombre_tipo) VALUES ('cc'), ('ce');
INSERT IGNORE INTO roles_usuario (nombre_rol) VALUES ('administrador'), ('tecnico');
INSERT IGNORE INTO tipos_servicios (descripcion_tipo) VALUES 
('instalación'), ('mantenimiento'), ('configuración'), ('soporte'), ('programación'), ('asesoría');
INSERT IGNORE INTO estados_cita (nombre_estado) VALUES ('pendiente'), ('confirmada'), ('completada'), ('cancelada');
INSERT IGNORE INTO condiciones_pago (descripcion, dias_credito) VALUES ('contado',0), ('15 días',15), ('30 días',30);
INSERT IGNORE INTO tipos_comprobante (nombre, prefijo) VALUES ('factura','FAC'), ('nota crédito','NC');

-- Insertar un administrador por defecto (contraseña: admin123)
INSERT IGNORE INTO usuarios (nombre_usuario, apellido_usuario, id_tipo_documento_u, documento_usuario, telefono_usuario, correo_usuario, contraseña_usuario, id_rol_u, activo)
VALUES ('Admin', 'Sistema', 1, 111111111, 300000000, 'admin@neodomus.com', '$2b$12$KIXpzCv6VxPqCQzO4QH3eO8yYjZqXVNZYbGcYX7tZQ0cZ6sJZy3MG', 1, 1);