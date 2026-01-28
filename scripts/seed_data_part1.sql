-- =====================================================
-- DATOS DE PRUEBA PARA EL SISTEMA DE TALLER
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CLIENTES (15 clientes)
-- =====================================================
INSERT INTO clientes (nombre, telefono, email, direccion) VALUES
('Carlos Mendoza', '0414-555-1234', 'carlos.mendoza@email.com', 'Av. Libertador, Edificio Torre Sol, Piso 5'),
('María García', '0424-555-2345', 'maria.garcia@email.com', 'Calle 10, Urbanización Los Palos Grandes'),
('José Rodríguez', '0416-555-3456', 'jose.rodriguez@email.com', 'Carrera 15, Sector El Cafetal'),
('Ana Martínez', '0412-555-4567', 'ana.martinez@email.com', 'Av. Principal de La Trinidad'),
('Luis Hernández', '0426-555-5678', 'luis.hernandez@email.com', 'Calle Miranda, Centro Comercial Concresa'),
('Sofía López', '0414-555-6789', 'sofia.lopez@email.com', 'Urbanización Caurimare, Casa 45'),
('Pedro Díaz', '0424-555-7890', 'pedro.diaz@email.com', 'Av. Urdaneta, Edificio Galipán'),
('Laura Sánchez', '0416-555-8901', 'laura.sanchez@email.com', 'Calle El Bosque, Quinta Los Robles'),
('Miguel Torres', '0412-555-9012', 'miguel.torres@email.com', 'Sector Chuao, Residencias Vista Mar'),
('Carmen Flores', '0426-555-0123', 'carmen.flores@email.com', 'Av. Francisco de Miranda, Torre Delta'),
('Roberto Vargas', '0414-555-1357', 'roberto.vargas@email.com', 'Urbanización Santa Mónica'),
('Isabella Moreno', '0424-555-2468', 'isabella.moreno@email.com', 'Calle Orinoco, Edificio Orión'),
('Fernando Castillo', '0416-555-3579', 'fernando.castillo@email.com', 'Sector Las Mercedes'),
('Gabriela Rivas', '0412-555-4680', 'gabriela.rivas@email.com', 'Av. Baralt, Centro Histórico'),
('Andrés Jiménez', '0426-555-5791', 'andres.jimenez@email.com', 'Urbanización El Marqués');

-- =====================================================
-- 2. TECNICOS (6 técnicos)
-- =====================================================
INSERT INTO tecnicos (nombre, especialidad, telefono, disponible) VALUES
('Juan Pérez', 'Motor y Transmisión', '0414-777-1111', true),
('Ricardo Gómez', 'Electricidad Automotriz', '0424-777-2222', true),
('Antonio Silva', 'Frenos y Suspensión', '0416-777-3333', true),
('Francisco Ramírez', 'Aire Acondicionado', '0412-777-4444', true),
('Alejandro Ruiz', 'Diagnóstico Computarizado', '0426-777-5555', true),
('Eduardo Blanco', 'Mecánica General', '0414-777-6666', false);

-- =====================================================
-- 3. VEHICULOS (25 vehículos - vinculados a clientes)
-- Nota: Ejecutar después de insertar clientes
-- =====================================================
INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Toyota', 'Corolla', 2022, 'ABC-123', 'Blanco', 'JTDKN3DU5A0123456', 25000
FROM clientes WHERE nombre = 'Carlos Mendoza';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Honda', 'Civic', 2021, 'DEF-456', 'Gris', 'JHMFA3F23AS789012', 35000
FROM clientes WHERE nombre = 'Carlos Mendoza';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Ford', 'Focus', 2020, 'GHI-789', 'Azul', 'WF0XXXGCDX4567890', 42000
FROM clientes WHERE nombre = 'María García';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Chevrolet', 'Cruze', 2023, 'JKL-012', 'Rojo', '1G1ZT53848F123456', 12000
FROM clientes WHERE nombre = 'María García';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Hyundai', 'Elantra', 2021, 'MNO-345', 'Negro', 'KMHD35LHXKU789012', 38000
FROM clientes WHERE nombre = 'José Rodríguez';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Kia', 'Sportage', 2022, 'PQR-678', 'Plata', 'KNDPB3A26E7345678', 28000
FROM clientes WHERE nombre = 'Ana Martínez';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Mazda', '3', 2020, 'STU-901', 'Gris Oscuro', '3MZBM1U72GM901234', 55000
FROM clientes WHERE nombre = 'Ana Martínez';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Volkswagen', 'Jetta', 2021, 'VWX-234', 'Blanco', '3VW4T7AT5EM567890', 32000
FROM clientes WHERE nombre = 'Luis Hernández';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Nissan', 'Sentra', 2022, 'YZA-567', 'Rojo', '3N1AB7APXEY123456', 22000
FROM clientes WHERE nombre = 'Sofía López';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Toyota', 'Camry', 2023, 'BCD-890', 'Negro', '4T1G11AK4NU789012', 8000
FROM clientes WHERE nombre = 'Sofía López';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Honda', 'Accord', 2020, 'EFG-123', 'Azul', '1HGCV1F35KA345678', 48000
FROM clientes WHERE nombre = 'Pedro Díaz';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Ford', 'Escape', 2021, 'HIJ-456', 'Verde', '1FMCU9G65MUA90123', 36000
FROM clientes WHERE nombre = 'Laura Sánchez';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Chevrolet', 'Equinox', 2022, 'KLM-789', 'Blanco', '2GNFLEEK7N6567890', 19000
FROM clientes WHERE nombre = 'Miguel Torres';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Hyundai', 'Tucson', 2023, 'NOP-012', 'Gris', 'KM8J3CA48NU123456', 5000
FROM clientes WHERE nombre = 'Miguel Torres';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Kia', 'Seltos', 2021, 'QRS-345', 'Naranja', 'KNDEU2AA6M7789012', 29000
FROM clientes WHERE nombre = 'Carmen Flores';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Mazda', 'CX-5', 2022, 'TUV-678', 'Rojo', 'JM3KFBDM8N0345678', 24000
FROM clientes WHERE nombre = 'Roberto Vargas';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Volkswagen', 'Tiguan', 2020, 'WXY-901', 'Negro', '3VV3B7AX5LM901234', 52000
FROM clientes WHERE nombre = 'Roberto Vargas';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Nissan', 'Kicks', 2022, 'ZAB-234', 'Blanco Perla', '3N1CP5DV8NL567890', 18000
FROM clientes WHERE nombre = 'Isabella Moreno';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Toyota', 'RAV4', 2021, 'CDE-567', 'Plata', '2T3P1RFV9MW123456', 33000
FROM clientes WHERE nombre = 'Fernando Castillo';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Honda', 'CR-V', 2023, 'FGH-890', 'Azul Oscuro', '5J6RW1H81NL789012', 7000
FROM clientes WHERE nombre = 'Gabriela Rivas';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Ford', 'Bronco Sport', 2022, 'IJK-123', 'Verde Oliva', '3FMCR9C61NR345678', 21000
FROM clientes WHERE nombre = 'Andrés Jiménez';

INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, color, vin, kilometraje)
SELECT id, 'Chevrolet', 'Tracker', 2023, 'LMN-456', 'Gris Metalico', '9BG144MT5PB901234', 9000
FROM clientes WHERE nombre = 'Andrés Jiménez';
