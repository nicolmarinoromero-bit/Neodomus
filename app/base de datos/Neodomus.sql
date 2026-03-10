DROP DATABASE NEODOMUS;
CREATE DATABASE NEODOMUS;
USE NEODOMUS;
CREATE TABLE TIPOS_DOCUMENTO (
    ID_TIPO_DOCUMENTO INT AUTO_INCREMENT PRIMARY KEY,
    NOMBRE_TIPO VARCHAR(2)
);

INSERT INTO TIPOS_DOCUMENTO (NOMBRE_TIPO)
VALUES 
('CC'), 
('CE');

CREATE TABLE ROLES_USUARIO (
    ID_ROL INT AUTO_INCREMENT PRIMARY KEY,
    NOMBRE_ROL VARCHAR(50)
);

INSERT INTO ROLES_USUARIO (NOMBRE_ROL)
VALUES
('ADMINISTRADOR'),
('TECNICO DE INSTALADOR'),
('TECNICO DE SOPORTE'),
('Analista QA'),
('Desarrollador Backend'),
('Coordinador de Proyectos');

CREATE TABLE USUARIOS (
    ID_USUARIO INT AUTO_INCREMENT PRIMARY KEY,
    NOMBRE_USUARIO VARCHAR(100),
    APELLIDO_USUARIO VARCHAR(100),
    ID_TIPO_DOCUMENTO_U INT,
    DOCUMENTO_USUARIO VARCHAR(50) UNIQUE,
    TELEFONO_USUARIO VARCHAR(20),
    CORREO_USUARIO VARCHAR(100) UNIQUE,
    ID_ROL_U INT,
    FOREIGN KEY (ID_TIPO_DOCUMENTO_U) REFERENCES TIPOS_DOCUMENTO(ID_TIPO_DOCUMENTO),
    FOREIGN KEY (ID_ROL_U) REFERENCES ROLES_USUARIO(ID_ROL)
);

INSERT INTO USUARIOS (NOMBRE_USUARIO, APELLIDO_USUARIO, ID_TIPO_DOCUMENTO_U, DOCUMENTO_USUARIO, TELEFONO_USUARIO, CORREO_USUARIO, ID_ROL_U)
VALUES
('Carlos Andrés', 'Gómez Ríos', 1, '1023456789', '3001234567', 'carlos.gomez@example.com', 2),
('Jorge Daniel', 'Charry Pérez', 1, '1034567890', '3002345678', 'jorge.charry@example.com', 2),
('Juan Sebastián', 'Moreno Torres', 1, '1078901234', '3003456789', 'juan.moreno@example.com', 2),
('Luis Eduardo', 'Martínez Gaitán', 1, '1090123456', '3004567890', 'luis.martinez@example.com', 1),
('Andrés Mauricio', 'López Vargas', 1, '1056789012', '3005678901', 'andres.lopez@example.com', 3),
('Camila Andrea', 'Rodríguez Peña', 1, '1089012345', '3006789012', 'camila.rodriguez@example.com', 1),
('Nicol Alejandra', 'Mariño Romero', 1, '1045678901', '3007890123', 'nicol.marino@example.com', 1),
('Laura Marcela', 'Pérez Duarte', 2, '1009876543', '3008901234', 'laura.perez@example.com', 4),
('Julián Felipe', 'Carvajal Caballero', 2, '1012345678', '3009012345', 'julian.carvajal@example.com', 5),
('María Fernanda', 'Rincón Salazar', 2, '1067890123', '3010123456', 'maria.rincon@example.com', 6);

CREATE TABLE CLIENTES (
    ID_CLIENTE INT AUTO_INCREMENT PRIMARY KEY,
    NOMBRE_CLIENTE VARCHAR(100),
    APELLIDO_CLIENTE VARCHAR(100),
    ID_TIPO_DOCUMENTO_C INT,
    DOCUMENTO_CLIENTE VARCHAR(50) UNIQUE,
    TELEFONO_CLIENTE VARCHAR(20),
    CORREO_CLIENTE VARCHAR(100) UNIQUE,
    DIRECCION_CLIENTE VARCHAR(150),
    FOREIGN KEY (ID_TIPO_DOCUMENTO_C) REFERENCES TIPOS_DOCUMENTO(ID_TIPO_DOCUMENTO)
);

INSERT INTO CLIENTES (NOMBRE_CLIENTE, APELLIDO_CLIENTE, ID_TIPO_DOCUMENTO_C, DOCUMENTO_CLIENTE, DIRECCION_CLIENTE, TELEFONO_CLIENTE, CORREO_CLIENTE)
VALUES
('Laura', 'García Rojas', 1, '10123456789', 'Cra 10 #12-34', '3001234567', 'laura.garcia@gmail.com'),
('Daniela', 'Ramírez Peña', 1, '10345678901', 'Av 30 #15-09', '3023456789', 'daniela.ramirez@gmail.com'),
('Andrés', 'González Mora', 2, '10456789012', 'Mz A Casa 10', '3034567890', 'andres.gonzalez@gmail.com'),
('Mariana', 'Suárez López', 1, '10567890123', 'Cl 8B #20-45', '3045678901', 'mariana.suarez@gmail.com'),
('Natalia', 'Castro Jiménez', 1, '10789012345', 'Cl 19 #13-55', '3067890123', 'natalia.castro@gmail.com'),
('Felipe', 'Martínez Pérez', 1, '10890123456', 'Av 68 #54-23', '3078901234', 'felipe.martinez@gmail.com'),
('Camila', 'Ortiz Salazar', 2, '10901234567', 'Cl 100 #25-10', '3089012345', 'camila.ortiz@gmail.com'),
('Sebastián', 'López Romero', 1, '11012345678', 'Cra 7 #89-12', '3090123456', 'sebastian.lopez@gmail.com'),
('Sofía', 'Ramírez Ortega', 1, '11123456789', 'Cl 50 #12-34', '3101234567', 'sofia.ramirez@gmail.com'),
('Mateo', 'Gutiérrez Pardo', 2, '11234567890', 'Av 20 #45-67', '3112345678', 'mateo.gutierrez@gmail.com');

CREATE TABLE PROVEEDORES (
    ID_PROVEEDOR INT AUTO_INCREMENT PRIMARY KEY,
    NOMBRE_PROVEEDOR VARCHAR(100),
    CONTACTO_PROVEEDOR VARCHAR(100),
    TELEFONO_PROVEEDOR VARCHAR(20),
    CORREO_PROVEEDOR VARCHAR(100) UNIQUE,
    DIRECCION_PROVEEDOR VARCHAR(150)
);

INSERT INTO PROVEEDORES (NOMBRE_PROVEEDOR, CONTACTO_PROVEEDOR, TELEFONO_PROVEEDOR, CORREO_PROVEEDOR, DIRECCION_PROVEEDOR)
VALUES
('Deportes Elite S.A.', 'Carlos Ramírez', '3104567890', 'contacto@deporteselite.com', 'Cra 45 #12-34, Bogotá'),
('SportLine Distribuciones', 'María Gómez', '3159876543', 'ventas@sportline.com', 'Av. Las Américas #23-45, Medellín'),
('TodoFitness Ltda.', 'Andrés López', '3006543210', 'info@todofitness.com', 'Calle 50 #67-12, Cali'),
('Proveedora Olímpica', 'Laura Torres', '3123456789', 'ltorres@proveedoraolimpica.com', 'Carrera 9 #80-22, Barranquilla'),
('Suministros Deportivos SAS', 'Jorge Martínez', '3012233445', 'jorge@suministrosdeportivos.com', 'Calle 100 #15-40, Bogotá'),
('Equipos ProGym', 'Diana Herrera', '3209988776', 'dherrera@progym.com', 'Av. 30 de Agosto #45-67, Pereira'),
('Distribuciones RunningPro', 'Luis Castillo', '3167788990', 'ventas@runningpro.com', 'Calle 10 #25-30, Bucaramanga'),
('Balones y Redes S.A.', 'Paola Rincón', '3184455667', 'paola@balonesyredes.com', 'Cra 21 #45-10, Cartagena'),
('FitEquipos SAS', 'Andrés Peña', '3178899001', 'andres@fitequipos.com', 'Cl 45 #23-10, Manizales'),
('GymPro Distribuciones', 'Carolina Ríos', '3164455667', 'carolina@gympro.com', 'Cra 15 #30-20, Ibagué');

CREATE TABLE SUCURSALES (
    ID_SUCURSAL INT AUTO_INCREMENT PRIMARY KEY,
    NOMBRE_SUCURSAL VARCHAR(100) UNIQUE,
    DIRECCION_SUCURSAL VARCHAR(150),
    TELEFONO_SUCURSAL VARCHAR(20) UNIQUE
);

INSERT INTO SUCURSALES (NOMBRE_SUCURSAL, DIRECCION_SUCURSAL, TELEFONO_SUCURSAL)
VALUES
('Sucursal Centro Bogotá', 'Cra 7 #12-34, Bogotá', '6013456789'),
('Sucursal Norte Bogotá', 'Av. 19 #120-45, Bogotá', '6019876543'),
('Sucursal Medellín Poblado', 'Cra 43A #6-50, Medellín', '6043112233'),
('Sucursal Medellín Centro', 'Calle 50 #45-10, Medellín', '6044567890'),
('Sucursal Cali Norte', 'Av. 3N #34-67, Cali', '6023211122'),
('Sucursal Cali Sur', 'Cra 66 #13-45, Cali', '6026547890'),
('Sucursal Barranquilla Centro', 'Carrera 45 #50-22, Barranquilla', '6053556677'),
('Sucursal Bucaramanga Cabecera', 'Calle 36 #33-40, Bucaramanga', '6076123456'),
('Sucursal Cartagena Bocagrande', 'Cra 1 #8-12, Cartagena', '6056789012'),
('Sucursal Pereira Circunvalar', 'Av. Circunvalar #15-20, Pereira', '6063456789');

CREATE TABLE BODEGA_F (
    ID_BODEGA_F INT AUTO_INCREMENT PRIMARY KEY,
    NOMBRE_BODEGA_F VARCHAR(100) UNIQUE,
    UBICACION_BODEGA_F VARCHAR(150),
    CAPACIDAD_BODEGA_F INT,
    ID_SUCURSAL_F INT,
    FOREIGN KEY (ID_SUCURSAL_F) REFERENCES SUCURSALES(ID_SUCURSAL)
);

INSERT INTO BODEGA_F (NOMBRE_BODEGA_F, UBICACION_BODEGA_F, CAPACIDAD_BODEGA_F, ID_SUCURSAL_F)
VALUES
('Bodega Central Bogotá', 'Cra 7 #12-34, Bogotá', 1000, 1),
('Bodega Norte Bogotá', 'Av. 19 #120-45, Bogotá', 800, 2),
('Bodega Medellín Poblado', 'Cra 43A #6-50, Medellín', 600, 3),
('Bodega Medellín Centro', 'Calle 50 #45-10, Medellín', 500, 4),
('Bodega Cali Norte', 'Av. 3N #34-67, Cali', 700, 5),
('Bodega Cali Sur', 'Cra 66 #13-45, Cali', 650, 6),
('Bodega Barranquilla Centro', 'Carrera 45 #50-22, Barranquilla', 400, 7),
('Bodega Bucaramanga Cabecera', 'Calle 36 #33-40, Bucaramanga', 550, 8),
('Bodega Cartagena Bocagrande', 'Cra 1 #8-12, Cartagena', 450, 9),
('Bodega Pereira Circunvalar', 'Av. Circunvalar #15-20, Pereira', 500, 10);

CREATE TABLE TECNICOS (
    ID_TECNICO INT AUTO_INCREMENT PRIMARY KEY,
    ID_USUARIO_T INT,
    CERTIFICACION_T VARCHAR(100),
    CARGO_T VARCHAR (50),
    FOREIGN KEY (ID_USUARIO_T) REFERENCES USUARIOS(ID_USUARIO)
);

INSERT INTO TECNICOS (ID_USUARIO_T, CERTIFICACION_T, CARGO_T)
VALUES
(1, 'Certificación en Redes y Cableado Estructurado', 'Junior'),
(2, 'Certificación en Instalación de Domótica', 'Junior'),
(3, 'Certificación en Seguridad Electrónica', 'Semi Senior'),
(4, 'Certificación en Soporte de Sistemas IoT', 'Junior'),
(5, 'Certificación en Programación de PLCs', 'Senior'),
(6, 'Certificación en Bases de Datos y Servidores', 'Senior'),
(7, 'Certificación en Automatización de Hogares', 'Semi Senior'),
(8, 'Certificación en Seguridad Informática', 'Senior'),
(9, 'Certificación en Programación Backend', 'Semi Senior'),
(10, 'Certificación en Gestión de Proyectos', 'Senior');


CREATE TABLE NOVEDADES (
    ID_NOVEDAD INT AUTO_INCREMENT PRIMARY KEY,
    ID_TECNICO_N INT,
    FECHA_REPORTE_NOVEDAD DATETIME,
    TIPO_NOVEDAD VARCHAR(100),
    DESCRIPCION_NOVEDAD TEXT,
    ESTADO_NOVEDAD VARCHAR(50),
    FOREIGN KEY (ID_TECNICO_N) REFERENCES TECNICOS (ID_TECNICO)
);

INSERT INTO NOVEDADES (ID_TECNICO_N, FECHA_REPORTE_NOVEDAD, TIPO_NOVEDAD, DESCRIPCION_NOVEDAD, ESTADO_NOVEDAD)
VALUES
(1, '2025-09-01 09:30:00', 'Falla Técnica', 'Sensor PIR no responde', 'Pendiente'),
(2, '2025-09-02 10:45:00', 'Instalación', 'Controlador central defectuoso', 'Resuelto'),
(3, '2025-09-03 11:15:00', 'Mantenimiento', 'Cámara IP con visión parcial', 'Pendiente'),
(4, '2025-09-04 12:30:00', 'Red WiFi', 'Router requiere reinicio', 'Pendiente'),
(5, '2025-09-05 13:20:00', 'Sensores', 'Sensor de puerta mal instalado', 'Resuelto'),
(6, '2025-09-06 14:10:00', 'PLC', 'Falla en programación del PLC', 'Pendiente'),
(7, '2025-09-07 15:50:00', 'Mantenimiento', 'Fuente de poder 12V fallando', 'Pendiente'),
(8, '2025-09-08 16:40:00', 'Ase<+soría', 'Cliente solicita cambios en configuración', 'Pendiente'),
(9, '2025-09-09 17:25:00', 'Cámara IP', 'Soporte de pared dañado', 'Resuelto'),
(10, '2025-09-10 18:05:00', 'Baterías', 'Batería recargable 18650 no carga', 'Pendiente');

CREATE TABLE DETALLE_RUTA (
ID_DETARUTA INT PRIMARY KEY AUTO_INCREMENT,
ID_RUTA_DR INT,
ID_TECNICO INT, 
ID_BODEGA_ET INT
);
INSERT INTO DETALLE_RUTA (ID_RUTA_DR, ID_TECNICO, ID_BODEGA_ET)
VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3),
(4, 4, 4),
(5, 5, 5),
(6, 6, 6),
(7, 7, 7),
(8, 8, 8),
(9, 9, 9),
(10, 10, 10);


CREATE TABLE RUTERO (
    ID_RUTA INT AUTO_INCREMENT PRIMARY KEY,
    ID_DETALLE_R INT,
    FECHA_RUTA DATE,
    HORA_RUTA TIME,
    DIRECCION_RUTA VARCHAR(255),
    ESTADO_RUTA VARCHAR(50) DEFAULT 'Pendiente',
    OBSERVACIONES_RUTA TEXT,
    FOREIGN KEY (ID_DETALLE_R) REFERENCES DETALLE_RUTA (ID_DETARUTA)
);

INSERT INTO RUTERO (ID_DETALLE_R, FECHA_RUTA, HORA_RUTA, DIRECCION_RUTA, ESTADO_RUTA, OBSERVACIONES_RUTA)
VALUES
(1, '2025-09-01', '09:00:00', 'Cra 10 #12-34', 'Pendiente', 'Revisión inicial del sistema'),
(2, '2025-09-02', '10:00:00', 'Av 30 #15-09', 'Pendiente', 'Instalación de sensores'),
(3, '2025-09-03', '11:00:00', 'Mz A Casa 10', 'Pendiente', 'Mantenimiento de cámaras'),
(4, '2025-09-04', '12:00:00', 'Cl 8B #20-45', 'Pendiente', 'Configuración de red WiFi'),
(5, '2025-09-05', '13:00:00', 'Cl 19 #13-55', 'Pendiente', 'Prueba de sensores de puerta'),
(6, '2025-09-06', '14:00:00', 'Av 68 #54-23', 'Pendiente', 'Programación de PLC'),
(7, '2025-09-07', '15:00:00', 'Cl 100 #25-10', 'Pendiente', 'Mantenimiento general'),
(8, '2025-09-08', '16:00:00', 'Cra 7 #89-12', 'Pendiente', 'Asesoría técnica en domótica'),
(9, '2025-09-09', '17:00:00', 'Carrera 9 #80-22', 'Pendiente', 'Instalación de cámaras IP'),
(10, '2025-09-10', '18:00:00', 'Av. 30 de Agosto #45-67', 'Pendiente', 'Revisión de baterías y fuentes');

CREATE TABLE PRODUCTOS (
    ID_PRODUCTO INT AUTO_INCREMENT PRIMARY KEY,
    NOMBRE_PRODUCTO VARCHAR(100),
    REFERENCIA_PRODUCTO VARCHAR(50) UNIQUE,
    ID_PROVEEDOR_PR INT,
    PRECIO_COMPRA_PRODUCTO DECIMAL(10,2),
    PRECIO_VENTA_PRODUCTO DECIMAL(10,2),
    FECHA_REGISTRO_PRODUCTO DATETIME,
    FOREIGN KEY (ID_PROVEEDOR_PR) REFERENCES PROVEEDORES(ID_PROVEEDOR)
);

INSERT INTO PRODUCTOS (NOMBRE_PRODUCTO, REFERENCIA_PRODUCTO, ID_PROVEEDOR_PR, PRECIO_COMPRA_PRODUCTO, PRECIO_VENTA_PRODUCTO, FECHA_REGISTRO_PRODUCTO)
VALUES
('Sensor de movimiento PIR', 'SMI-001', 1, 45000.00, 70000.00, '2025-07-01'),
('Controlador central domótico', 'CCD-004', 3, 90000.00, 160000.00, '2025-07-03'),
('Cinta LED RGB', 'LED-003', 1, 12000.00, 20000.00, '2025-07-02'),
('Kit de automatización básica', 'KIT-001', 5, 100000.00, 180000.00, '2025-07-04'),
('Cable UTP Cat6', 'UTP6-050', 4, 3000.00, 6000.00, '2025-07-03'),
('Sensor de puerta/ventana', 'SPD-006', 2, 25000.00, 39000.00, '2025-07-04'),
('Enchufe inteligente WiFi', 'EIW-007', 1, 34000.00, 58000.00, '2025-07-04'),
('Fuente de poder 12V 5A', 'PS12-5A', 4, 28000.00, 50000.00, '2025-07-04'),
('Cámara IP 1080p', 'CIP-003', 2, 120000.00, 170000.00, '2025-07-04'),
('Batería recargable 18650', 'BAT18650', 6, 5000.00, 10000.00, '2025-07-05');

CREATE TABLE INSUMOS (
    ID_INSUMO INT AUTO_INCREMENT PRIMARY KEY,
    NOMBRE_INSUMO VARCHAR(100) UNIQUE,
    UBICACION_INSUMO VARCHAR(150),
    CAPACIDAD_INSUMO INT,
    ID_TECNICO_INSUMO INT,
    FOREIGN KEY (ID_TECNICO_INSUMO) REFERENCES TECNICOS(ID_TECNICO)
);

INSERT INTO INSUMOS (NOMBRE_INSUMO, UBICACION_INSUMO, CAPACIDAD_INSUMO, ID_TECNICO_INSUMO)
VALUES
('Bodega Técnico 1', 'Cra 7 #12-34, Bogotá', 100, 1),
('Bodega Técnico 2', 'Av. 19 #120-45, Bogotá', 80, 2),
('Bodega Técnico 3', 'Cra 43A #6-50, Medellín', 60, 3),
('Bodega Técnico 4', 'Calle 50 #45-10, Medellín', 50, 4),
('Bodega Técnico 5', 'Av. 3N #34-67, Cali', 70, 5),
('Bodega Técnico 6', 'Cra 66 #13-45, Cali', 65, 6),
('Bodega Técnico 7', 'Carrera 45 #50-22, Barranquilla', 40, 7),
('Bodega Técnico 8', 'Calle 36 #33-40, Bucaramanga', 55, 8),
('Bodega Técnico 9', 'Cra 1 #8-12, Cartagena', 45, 9),
('Bodega Técnico 10', 'Av. Circunvalar #15-20, Pereira', 50, 10);

CREATE TABLE INVENTARIO_F (
    ID_INVENTARIO_F INT AUTO_INCREMENT PRIMARY KEY,
    ID_PRODUCTO_IF INT,
    ID_BODEGA_IF INT,
    CANTIDAD_IF INT,
    FECHA_REGISTRO_IF DATETIME,
    FOREIGN KEY (ID_PRODUCTO_IF) REFERENCES PRODUCTOS(ID_PRODUCTO),
    FOREIGN KEY (ID_BODEGA_IF) REFERENCES BODEGA_F(ID_BODEGA_F)
);

INSERT INTO INVENTARIO_F (ID_PRODUCTO_IF, ID_BODEGA_IF, CANTIDAD_IF, FECHA_REGISTRO_IF)
VALUES
(1, 1, 50, '2025-07-01'),
(2, 2, 20, '2025-07-02'),
(3, 3, 100, '2025-07-03'),
(4, 4, 15, '2025-07-04'),
(5, 5, 300, '2025-07-05'),
(6, 6, 75, '2025-07-06'),
(7, 7, 40, '2025-07-07'),
(8, 8, 60, '2025-07-08'),
(9, 9, 25, '2025-07-09'),
(10, 10, 120, '2025-07-10');

CREATE TABLE BODEGA_ET (
    ID_INSUMO_ET INT AUTO_INCREMENT PRIMARY KEY,
    ID_PRODUCTO_ET INT,
    ID_INSUMOS_ET INT,
    CANTIDAD_ET INT,
    FECHA_REGISTRO_ET DATETIME,
    FOREIGN KEY (ID_PRODUCTO_ET) REFERENCES PRODUCTOS(ID_PRODUCTO)
);

INSERT INTO BODEGA_ET (ID_PRODUCTO_ET, ID_INSUMOS_ET, CANTIDAD_ET, FECHA_REGISTRO_ET)
VALUES
(1, 1, 10, '2025-07-01'),
(2, 2, 5, '2025-07-02'),
(3, 3, 30, '2025-07-03'),
(4, 4, 2, '2025-07-04'),
(5, 5, 100, '2025-07-05'),
(6, 6, 15, '2025-07-06'),
(7, 7, 8, '2025-07-07'),
(8, 8, 20, '2025-07-08'),
(9, 9, 4, '2025-07-09'),
(10, 10, 50, '2025-07-10');

CREATE TABLE TIPOS_SERVICIOS (
ID_TIPO_SER INT PRIMARY KEY AUTO_INCREMENT,
DESCRIPCION_TIPO VARCHAR (150)
);
INSERT INTO TIPOS_SERVICIOS (DESCRIPCION_TIPO)
VALUES
('Instalación'),
('Mantenimiento'),
('Configuración'),
('Soporte'),
('Programación'),
('Asesoría');

CREATE TABLE SERVICIOS (
    ID_SERVICIO INT AUTO_INCREMENT PRIMARY KEY,
    ID_TIPO_SER INT,
    PRECIO_SERVICIO DECIMAL(10,2),
    TOTAL_SERVICIO DECIMAL (10, 2),
    ID_TECNICO_S INT,
    FOREIGN KEY (ID_TIPO_SER) REFERENCES TIPOS_SERVICIOS (ID_TIPO_SER),
	FOREIGN KEY (ID_TECNICO_S) REFERENCES TECNICOS (ID_TECNICO)
);
INSERT INTO SERVICIOS (ID_TIPO_SER, PRECIO_SERVICIO, TOTAL_SERVICIO, ID_TECNICO_S)
VALUES
(1, 150000.00, 150000.00, 1),  
(2, 80000.00, 80000.00, 2),    
(3, 60000.00, 60000.00, 3),    
(4, 70000.00, 70000.00, 4),  
(1, 50000.00, 50000.00, 5),    
(5, 120000.00, 120000.00, 6),  
(2, 90000.00, 90000.00, 7),    
(6, 100000.00, 100000.00, 8),  
(1, 85000.00, 85000.00, 9),    
(2, 40000.00, 40000.00, 10);  

INSERT INTO SERVICIOS (ID_TIPO_SER, PRECIO_SERVICIO, TOTAL_SERVICIO, ID_TECNICO_S)
VALUES
(1, 150000.00, 150000.00, 1),
(2, 80000.00, 80000.00, 2),
(3, 60000.00, 60000.00, 3),
(4, 70000.00, 70000.00, 4),
(1, 50000.00, 50000.00, 5),
(5, 120000.00, 120000.00, 6),
(2, 90000.00, 90000.00, 7),
(6, 100000.00, 100000.00, 8),
(1, 85000.00, 85000.00, 9),
(2, 40000.00, 40000.00, 10);

CREATE TABLE PEDIDOS (
    ID_PEDIDO INT AUTO_INCREMENT PRIMARY KEY,
    ID_CLIENTE_PE INT,
    FECHA_PEEDIDO DATETIME,
    TOTAL_PEDIDO DECIMAL(10,2),
    ESTADO_PEDIDO VARCHAR (50),
    FOREIGN KEY (ID_CLIENTE_PE) REFERENCES CLIENTES(ID_CLIENTE)
);

INSERT INTO PEDIDOS (ID_CLIENTE_PE, FECHA_PEEDIDO, TOTAL_PEDIDO, ESTADO_PEDIDO)
VALUES
(1, '2025-08-01 09:30:00', 150000.00, 'ACTIVO'),
(2, '2025-08-02 11:00:00', 80000.00, 'ACTIVO'),
(3, '2025-08-03 11:30:00', 60000.00, 'ACTIVO'),
(4, '2025-08-04 14:30:00', 70000.00, 'ACTIVO'),
(5, '2025-08-05 16:00:00', 50000.00, 'ACTIVO'),
(6, '2025-08-06 08:30:00', 120000.00, 'ACTIVO'),
(7, '2025-08-07 10:00:00', 90000.00, 'ACTIVO'),
(8, '2025-08-08 10:30:00', 100000.00, 'ACTIVO'),
(9, '2025-08-09 13:30:00', 85000.00,'ACTIVO'),
(10, '2025-08-10 16:30:00', 40000.00, 'ACTIVO');

CREATE TABLE COMISIONES (
    ID_COMISION INT AUTO_INCREMENT PRIMARY KEY,
    PORCENTAJE_COMISION DECIMAL(5,2),
    VALOR_COMISION DECIMAL(10,2)
);

INSERT INTO COMISIONES (PORCENTAJE_COMISION, VALOR_COMISION)
VALUES
(5.00, 3500.00),
(5.00, 8000.00),
(5.00, 1000.00),
(5.00, 9000.00),
(5.00, 300.00),
(5.00, 1950.00),
(5.00, 2900.00),
(5.00, 2500.00),
(5.00, 8500.00),
(5.00, 500.00);

CREATE TABLE DETALLE_PEDIDO (
    ID_DETALLE INT AUTO_INCREMENT PRIMARY KEY,
    ID_PEDIDO_D INT,
    ID_PRODUCTO_D INT,
    ID_SERVICIO_D INT,
    ID_COMISION_D INT,
    CANTIDAD_DETALLE INT,
    PRECIO_UNITARIO_DETALLE DECIMAL(10,2),
    SUBTOTAL_DETALLE DECIMAL(10,2),
    FOREIGN KEY (ID_PEDIDO_D) REFERENCES PEDIDOS (ID_PEDIDO),
    FOREIGN KEY (ID_PRODUCTO_D) REFERENCES PRODUCTOS(ID_PRODUCTO),
    FOREIGN KEY (ID_SERVICIO_D) REFERENCES SERVICIOS(ID_SERVICIO),
    FOREIGN KEY (ID_COMISION_D) REFERENCES COMISIONES (ID_COMISION)
);
INSERT INTO DETALLE_PEDIDO 
(ID_PEDIDO_D, ID_PRODUCTO_D, ID_SERVICIO_D, ID_COMISION_D, CANTIDAD_DETALLE, PRECIO_UNITARIO_DETALLE, SUBTOTAL_DETALLE)
VALUES
(1, 1, 1, 1, 1, 70000.00, 70000.00),
(2, 2, 2, 2, 1, 160000.00, 160000.00),
(3, 3, 3, 3, 1, 20000.00, 20000.00),
(4, 4, 4, 4, 1, 180000.00, 180000.00),
(5, 5, 5, 5, 1, 6000.00, 6000.00),
(6, 6, 6, 6, 1, 39000.00, 39000.00),
(7, 7, 7, 7, 1, 58000.00, 58000.00),
(8, 8, 8, 8, 1, 50000.00, 50000.00),
(9, 9, 9, 9, 1, 170000.00, 170000.00),
(10, 10, 10, 10, 1, 10000.00, 10000.00);

-- Obtener el total general de ventas.
-- suma el subtotal de todos los registros en la tabla de detalle 
-- de pedidos para obtener el ingreso total bruto.
SELECT 
    SUM(SUBTOTAL_DETALLE) AS TotalGeneralVentas
FROM DETALLE_PEDIDO;

-- Obtener el promedio general de ventas.
-- Calcular el valor promedio de los subtotales de los detalles de los pedidos 
SELECT 
    AVG(SUBTOTAL_DETALLE) AS PromedioGeneralVentas
FROM DETALLE_PEDIDO;

-- Mostrar los productos cuyo total vendido sea superior al promedio general.
-- necesitamos agrupar las ventas por producto y sumar sus subtotales. Luego, 
-- con HAVING, filtramos aquellos grupos (productos) cuyo total de ventas sea 
-- mayor que el promedio general de ventas que calculamos en el punto 2.
SELECT 
    p.NOMBRE_PRODUCTO,
    SUM(dp.SUBTOTAL_DETALLE) AS TotalVendidoPorProducto
FROM DETALLE_PEDIDO dp
INNER JOIN PRODUCTOS p ON dp.ID_PRODUCTO_D = p.ID_PRODUCTO
GROUP BY p.NOMBRE_PRODUCTO
HAVING SUM(dp.SUBTOTAL_DETALLE) > (SELECT AVG(SUBTOTAL_DETALLE) FROM DETALLE_PEDIDO);

-- Agrupar por proveedor para determinar cual genera mas ingresos 
SELECT 
    pr.NOMBRE_PROVEEDOR,
    COUNT(dp.ID_DETALLE) AS VolumenDeVentas, 
    SUM(dp.SUBTOTAL_DETALLE) AS TotalIngresos
FROM DETALLE_PEDIDO dp
INNER JOIN PRODUCTOS p ON dp.ID_PRODUCTO_D = p.ID_PRODUCTO
INNER JOIN PROVEEDORES pr ON p.ID_PROVEEDOR_PR = pr.ID_PROVEEDOR
GROUP BY pr.NOMBRE_PROVEEDOR
ORDER BY VolumenDeVentas ASC, TotalIngresos ASC
LIMIT 1; 

-- Mostrar la venta más alta y la más baja.
-- Usando MAX y MIN sobre la columna SUBTOTAL_DETALLE podemos obtener estos valores. 
-- Consulta para la venta mas alta 
SELECT 
    'Venta Más Alta' AS Tipo,
    ID_PEDIDO_D,
    SUBTOTAL_DETALLE AS ValorVenta
FROM DETALLE_PEDIDO
WHERE SUBTOTAL_DETALLE = (SELECT MAX(SUBTOTAL_DETALLE) FROM DETALLE_PEDIDO)
UNION ALL

-- Consulta para la venta mas baja
SELECT 
    'Venta Más Baja' AS Tipo,
    ID_PEDIDO_D,
    SUBTOTAL_DETALLE AS ValorVenta
FROM DETALLE_PEDIDO
WHERE SUBTOTAL_DETALLE = (SELECT MIN(SUBTOTAL_DETALLE) FROM DETALLE_PEDIDO);









-- Procedimientos alamacenados 

-- PROCEDIMIENTOS SIN PARÁMETROS (10)


-- 1. listar_tipos_documento
-- Muestra todos los registros de la tabla TIPOS_DOCUMENTO.
DELIMITER //

CREATE PROCEDURE listar_tipos_documento()
BEGIN
    SELECT * FROM TIPOS_DOCUMENTO;
END //
DELIMITER ;

CALL listar_tipos_documento();

-- 2.listar_roles()
-- Lista todos los roles de usuario de la tabla ROLES_USUARIO.
DELIMITER //
CREATE PROCEDURE listar_roles()
BEGIN
    SELECT * FROM ROLES_USUARIO;
END //
DELIMITER ; 
CALL listar_roles();

-- 3. listar_usuarios()
-- Muestra todos los campos de la tabla USUARIOS.
DELIMITER //
CREATE PROCEDURE listar_usuarios()
BEGIN
    SELECT * FROM USUARIOS;
END //

DELIMITER ;
CALL listar_usuarios();

-- 4. listar_clientes()
-- Muestra todos los campos de la tabla CLIENTES
DELIMITER //
CREATE PROCEDURE listar_clientes()
BEGIN
    SELECT * FROM CLIENTES;
END //
DELIMITER ;
CALL listar_clientes();

-- 5. listar_proveedores()
-- Muestra todos los proveedores.
DELIMITER //
CREATE PROCEDURE listar_proveedores()
BEGIN
    SELECT * FROM PROVEEDORES;
END //
DELIMITER ;
CALL listar_proveedores();

-- 6. listar_sucursales()
-- Lista todas las sucursales.
DELIMITER //
CREATE PROCEDURE listar_sucursales()
BEGIN
    SELECT * FROM SUCURSALES;
END //
DELIMITER ;
CALL listar_sucursales();

-- 7. listar_bodegas
-- Muestra todas las bodegas (de la tabla BODEGA_F) 
-- junto con el nombre de la sucursal a la que pertenecen.
DELIMITER //
CREATE PROCEDURE listar_bodegas()
BEGIN
    SELECT b.*, s.NOMBRE_SUCURSAL
    FROM BODEGA_F b
    JOIN SUCURSALES s ON b.ID_SUCURSAL_F = s.ID_SUCURSAL;
END //
DELIMITER ;
CALL listar_bodegas();

-- 8. listar_tecnicos()
-- Lista todos los técnicos con sus datos personales (nombre, apellido, documento) 
-- obtenidos de la tabla USUARIOS.
DELIMITER //
CREATE PROCEDURE listar_tecnicos()
BEGIN
    SELECT t.*, u.NOMBRE_USUARIO, u.APELLIDO_USUARIO, u.DOCUMENTO_USUARIO
    FROM TECNICOS t
    JOIN USUARIOS u ON t.ID_USUARIO_T = u.ID_USUARIO;
END //
DELIMITER ;
CALL listar_tecnicos();

-- 9. listar_novedades_pendientes()
-- Muestra únicamente las novedades que están en estado "Pendiente", 
-- incluyendo el nombre del técnico que las reportó.
DELIMITER //
CREATE PROCEDURE listar_novedades_pendientes()
BEGIN
    SELECT n.*, t.ID_USUARIO_T, u.NOMBRE_USUARIO, u.APELLIDO_USUARIO
    FROM NOVEDADES n
    JOIN TECNICOS t ON n.ID_TECNICO_N = t.ID_TECNICO
    JOIN USUARIOS u ON t.ID_USUARIO_T = u.ID_USUARIO
    WHERE n.ESTADO_NOVEDAD = 'Pendiente';
END //
DELIMITER ;
CALL listar_novedades_pendientes();

-- 10. sp_resumen_inventario() 
-- Muestra un resumen de la cantidad total de cada producto en todas las bodegas.
DELIMITER //
CREATE PROCEDURE resumen_inventario()
BEGIN
    SELECT p.ID_PRODUCTO, p.NOMBRE_PRODUCTO, p.REFERENCIA_PRODUCTO,
           (SELECT IFNULL(SUM(i.CANTIDAD_IF), 0) 
            FROM INVENTARIO_F i 
            WHERE i.ID_PRODUCTO_IF = p.ID_PRODUCTO) AS TOTAL_EN_BODEGAS
    FROM PRODUCTOS p; 
END //

DELIMITER ;
CALL resumen_inventario();

-- PROCEDIMIENTOS CON UN PARÁMETRO (5)

-- 11. obtener_usuario_por_id
-- Busca y devuelve todos los datos del usuario 
-- cuyo ID coincida con el parámetro de entrada.
DELIMITER //
CREATE PROCEDURE obtener_usuario_por_id(IN p_id_usuario INT)
BEGIN
    SELECT * FROM USUARIOS WHERE ID_USUARIO = p_id_usuario;
END //
DELIMITER ;

CALL obtener_usuario_por_id(9);

-- 12. obtener_cliente_por_documento-
-- Retorna todos los campos del cliente que tenga el número de documento indicado.
DELIMITER //
CREATE PROCEDURE obtener_cliente_por_documento(IN p_documento VARCHAR(50))
BEGIN
    SELECT * FROM CLIENTES WHERE DOCUMENTO_CLIENTE = p_documento;
END //
DELIMITER ;
CALL obtener_cliente_por_documento('10123456789');

-- 13. obtener_productos_por_proveedor
-- Lista todos los productos que pertenecen a un proveedor específico.
DELIMITER //
CREATE PROCEDURE obtener_productos_por_proveedor(IN p_id_proveedor INT)
BEGIN
    SELECT * FROM PRODUCTOS WHERE ID_PROVEEDOR_PR = p_id_proveedor;
END //
DELIMITER ;
CALL obtener_productos_por_proveedor(1);

-- 14. obtener_rutas_por_estado
-- Muestra las rutas que tienen el estado indicado (por ejemplo, 'Pendiente', 'Completada').
DELIMITER //
CREATE PROCEDURE obtener_rutas_por_estado(IN p_estado VARCHAR(50))
BEGIN
    SELECT * FROM RUTERO WHERE ESTADO_RUTA = p_estado;
END //
DELIMITER ;
CALL obtener_rutas_por_estado('Pendiente');

-- 15. obtener_servicios_por_tecnico
-- Retorna todos los servicios realizados por un técnico en particular.
DELIMITER //
CREATE PROCEDURE obtener_servicios_por_tecnico(IN p_id_tecnico INT)
BEGIN
    SELECT * FROM SERVICIOS WHERE ID_TECNICO_S = p_id_tecnico;
END //
DELIMITER ;
CALL obtener_servicios_por_tecnico(5);

--  PROCEDIMIENTOS CON DOS PARÁMETROS (5)

-- 16. obtener_pedidos_por_cliente_y_estado
-- Obtiene los pedidos de un cliente específico que además tengan un estado concreto 
-- (ej. 'ACTIVO').
DELIMITER //
CREATE PROCEDURE obtener_pedidos_por_cliente_y_estado(
    IN p_id_cliente INT,
    IN p_estado VARCHAR(50)
)
BEGIN
    SELECT * FROM PEDIDOS
    WHERE ID_CLIENTE_PE = p_id_cliente AND ESTADO_PEDIDO = p_estado;
END //
DELIMITER ;
CALL obtener_pedidos_por_cliente_y_estado(1, 'ACTIVO');

-- 17. obtener_inventario_por_producto_y_bodega
-- Muestra el registro de inventario (cantidad, fecha) 
-- de un producto en una bodega determinada.
DELIMITER //
CREATE PROCEDURE obtener_inventario_por_producto_y_bodega(
    IN p_id_producto INT,
    IN p_id_bodega INT
)
BEGIN
    SELECT * FROM INVENTARIO_F
    WHERE ID_PRODUCTO_IF = p_id_producto AND ID_BODEGA_IF = p_id_bodega;
END //
DELIMITER ;
CALL obtener_inventario_por_producto_y_bodega(1, 1);

-- 18. obtener_novedades_por_tecnico_y_estado
-- Lista las novedades reportadas por un técnico y que se encuentren 
-- en un estado dado (ej. 'Pendiente').
DELIMITER //
CREATE PROCEDURE obtener_novedades_por_tecnico_y_estado(
    IN p_id_tecnico INT,
    IN p_estado VARCHAR(50)
)
BEGIN
    SELECT * FROM NOVEDADES
    WHERE ID_TECNICO_N = p_id_tecnico AND ESTADO_NOVEDAD = p_estado;
END //
DELIMITER ;
CALL obtener_novedades_por_tecnico_y_estado(1, 'Pendiente');

-- 19. obtener_productos_por_rango_precio
-- Retorna los productos cuyo precio de venta está dentro de un rango 
-- (incluyendo los límites).
DELIMITER //
CREATE PROCEDURE obtener_productos_por_rango_precio(
    IN p_precio_min DECIMAL(10,2),
    IN p_precio_max DECIMAL(10,2)
)
BEGIN
    SELECT * FROM PRODUCTOS
    WHERE PRECIO_VENTA_PRODUCTO BETWEEN p_precio_min AND p_precio_max;
END //
DELIMITER ;
CALL obtener_productos_por_rango_precio(50000, 100000);

-- 20. actualizar_precio_venta_producto
-- Actualiza el precio de venta de un producto específico.
DELIMITER //
CREATE PROCEDURE actualizar_precio_venta_producto(
    IN p_id_producto INT,
    IN p_nuevo_precio DECIMAL(10,2)
)
BEGIN
    UPDATE PRODUCTOS
    SET PRECIO_VENTA_PRODUCTO = p_nuevo_precio
    WHERE ID_PRODUCTO = p_id_producto;

    SELECT * FROM PRODUCTOS WHERE ID_PRODUCTO =1;
END //
DELIMITER ;
CALL actualizar_precio_venta_producto(1, 75000);