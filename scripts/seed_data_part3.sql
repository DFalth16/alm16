-- =====================================================
-- DATOS DE PRUEBA - PARTE 3
-- Ejecutar DESPUÉS de las Partes 1 y 2
-- =====================================================

-- =====================================================
-- 5. GARANTIAS (8 garantías) - Incluye cliente_id
-- =====================================================
INSERT INTO garantias (vehiculo_id, cliente_id, tipo, descripcion, fecha_inicio, fecha_vencimiento, estado)
SELECT v.id, v.cliente_id, 'Motor', 'Garantía de fábrica para motor y transmisión', NOW() - INTERVAL '180 days', NOW() + INTERVAL '545 days', 'activa'
FROM vehiculos v WHERE v.placa = 'JKL-012' LIMIT 1;

INSERT INTO garantias (vehiculo_id, cliente_id, tipo, descripcion, fecha_inicio, fecha_vencimiento, estado)
SELECT v.id, v.cliente_id, 'Tren Motriz', 'Garantía extendida del concesionario', NOW() - INTERVAL '365 days', NOW() + INTERVAL '365 days', 'activa'
FROM vehiculos v WHERE v.placa = 'BCD-890' LIMIT 1;

INSERT INTO garantias (vehiculo_id, cliente_id, tipo, descripcion, fecha_inicio, fecha_vencimiento, estado)
SELECT v.id, v.cliente_id, 'Pintura', 'Garantía de pintura y carrocería', NOW() - INTERVAL '200 days', NOW() + INTERVAL '895 days', 'activa'
FROM vehiculos v WHERE v.placa = 'NOP-012' LIMIT 1;

INSERT INTO garantias (vehiculo_id, cliente_id, tipo, descripcion, fecha_inicio, fecha_vencimiento, estado)
SELECT v.id, v.cliente_id, 'Batería', 'Garantía de batería original', NOW() - INTERVAL '100 days', NOW() + INTERVAL '265 days', 'activa'
FROM vehiculos v WHERE v.placa = 'FGH-890' LIMIT 1;

INSERT INTO garantias (vehiculo_id, cliente_id, tipo, descripcion, fecha_inicio, fecha_vencimiento, estado)
SELECT v.id, v.cliente_id, 'Aire Acondicionado', 'Garantía por reparación de A/C', NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', 'activa'
FROM vehiculos v WHERE v.placa = 'KLM-789' LIMIT 1;

INSERT INTO garantias (vehiculo_id, cliente_id, tipo, descripcion, fecha_inicio, fecha_vencimiento, estado)
SELECT v.id, v.cliente_id, 'Frenos', 'Garantía de trabajo realizado en frenos', NOW() - INTERVAL '60 days', NOW() + INTERVAL '30 days', 'activa'
FROM vehiculos v WHERE v.placa = 'IJK-123' LIMIT 1;

INSERT INTO garantias (vehiculo_id, cliente_id, tipo, descripcion, fecha_inicio, fecha_vencimiento, estado)
SELECT v.id, v.cliente_id, 'Motor', 'Garantía de fábrica expirada', NOW() - INTERVAL '400 days', NOW() - INTERVAL '35 days', 'expirada'
FROM vehiculos v WHERE v.placa = 'EFG-123' LIMIT 1;

INSERT INTO garantias (vehiculo_id, cliente_id, tipo, descripcion, fecha_inicio, fecha_vencimiento, estado)
SELECT v.id, v.cliente_id, 'General', 'Garantía general del vehículo usado', NOW() - INTERVAL '500 days', NOW() - INTERVAL '135 days', 'expirada'
FROM vehiculos v WHERE v.placa = 'WXY-901' LIMIT 1;

-- =====================================================
-- 6. CITAS (12 citas para los próximos días)
-- =====================================================
-- Citas de hoy
INSERT INTO citas (cliente_id, vehiculo_id, fecha, hora_inicio, tipo_servicio, estado)
SELECT c.id, v.id, CURRENT_DATE, '09:00', 'revision', 'confirmada'
FROM clientes c JOIN vehiculos v ON v.cliente_id = c.id
WHERE c.nombre = 'Carlos Mendoza' AND v.placa = 'ABC-123' LIMIT 1;

INSERT INTO citas (cliente_id, vehiculo_id, fecha, hora_inicio, tipo_servicio, estado)
SELECT c.id, v.id, CURRENT_DATE, '11:00', 'mantenimiento', 'pendiente'
FROM clientes c JOIN vehiculos v ON v.cliente_id = c.id
WHERE c.nombre = 'Ana Martínez' AND v.placa = 'PQR-678' LIMIT 1;

INSERT INTO citas (cliente_id, vehiculo_id, fecha, hora_inicio, tipo_servicio, estado)
SELECT c.id, v.id, CURRENT_DATE, '14:30', 'diagnostico', 'pendiente'
FROM clientes c JOIN vehiculos v ON v.cliente_id = c.id
WHERE c.nombre = 'Miguel Torres' AND v.placa = 'NOP-012' LIMIT 1;

-- Citas de mañana
INSERT INTO citas (cliente_id, vehiculo_id, fecha, hora_inicio, tipo_servicio, estado)
SELECT c.id, v.id, CURRENT_DATE + INTERVAL '1 day', '08:30', 'revision', 'pendiente'
FROM clientes c JOIN vehiculos v ON v.cliente_id = c.id
WHERE c.nombre = 'Sofía López' AND v.placa = 'YZA-567' LIMIT 1;

INSERT INTO citas (cliente_id, vehiculo_id, fecha, hora_inicio, tipo_servicio, estado)
SELECT c.id, v.id, CURRENT_DATE + INTERVAL '1 day', '10:00', 'reparacion', 'confirmada'
FROM clientes c JOIN vehiculos v ON v.cliente_id = c.id
WHERE c.nombre = 'Pedro Díaz' AND v.placa = 'EFG-123' LIMIT 1;

INSERT INTO citas (cliente_id, vehiculo_id, fecha, hora_inicio, tipo_servicio, estado)
SELECT c.id, v.id, CURRENT_DATE + INTERVAL '1 day', '15:00', 'mantenimiento', 'pendiente'
FROM clientes c JOIN vehiculos v ON v.cliente_id = c.id
WHERE c.nombre = 'Laura Sánchez' AND v.placa = 'HIJ-456' LIMIT 1;

-- Citas en 2 días
INSERT INTO citas (cliente_id, vehiculo_id, fecha, hora_inicio, tipo_servicio, estado)
SELECT c.id, v.id, CURRENT_DATE + INTERVAL '2 days', '09:00', 'diagnostico', 'pendiente'
FROM clientes c JOIN vehiculos v ON v.cliente_id = c.id
WHERE c.nombre = 'Carmen Flores' AND v.placa = 'QRS-345' LIMIT 1;

INSERT INTO citas (cliente_id, vehiculo_id, fecha, hora_inicio, tipo_servicio, estado)
SELECT c.id, v.id, CURRENT_DATE + INTERVAL '2 days', '11:30', 'revision', 'pendiente'
FROM clientes c JOIN vehiculos v ON v.cliente_id = c.id
WHERE c.nombre = 'Roberto Vargas' AND v.placa = 'TUV-678' LIMIT 1;

-- Citas en 3 días
INSERT INTO citas (cliente_id, vehiculo_id, fecha, hora_inicio, tipo_servicio, estado)
SELECT c.id, v.id, CURRENT_DATE + INTERVAL '3 days', '08:00', 'mantenimiento', 'pendiente'
FROM clientes c JOIN vehiculos v ON v.cliente_id = c.id
WHERE c.nombre = 'Isabella Moreno' AND v.placa = 'ZAB-234' LIMIT 1;

INSERT INTO citas (cliente_id, vehiculo_id, fecha, hora_inicio, tipo_servicio, estado)
SELECT c.id, v.id, CURRENT_DATE + INTERVAL '3 days', '14:00', 'reparacion', 'confirmada'
FROM clientes c JOIN vehiculos v ON v.cliente_id = c.id
WHERE c.nombre = 'Fernando Castillo' AND v.placa = 'CDE-567' LIMIT 1;

-- Citas próxima semana
INSERT INTO citas (cliente_id, vehiculo_id, fecha, hora_inicio, tipo_servicio, estado)
SELECT c.id, v.id, CURRENT_DATE + INTERVAL '5 days', '10:00', 'revision', 'pendiente'
FROM clientes c JOIN vehiculos v ON v.cliente_id = c.id
WHERE c.nombre = 'Gabriela Rivas' AND v.placa = 'FGH-890' LIMIT 1;

INSERT INTO citas (cliente_id, vehiculo_id, fecha, hora_inicio, tipo_servicio, estado)
SELECT c.id, v.id, CURRENT_DATE + INTERVAL '7 days', '09:30', 'diagnostico', 'pendiente'
FROM clientes c JOIN vehiculos v ON v.cliente_id = c.id
WHERE c.nombre = 'Andrés Jiménez' AND v.placa = 'LMN-456' LIMIT 1;

-- =====================================================
-- ¡LISTO! 
-- =====================================================
