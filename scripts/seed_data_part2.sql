-- =====================================================
-- DATOS DE PRUEBA - PARTE 2
-- Ejecutar DESPUÉS de la Parte 1
-- =====================================================

-- =====================================================
-- 4. ORDENES DE TRABAJO (20 órdenes con diferentes estados)
-- =====================================================

-- Órdenes PENDIENTES (5)
INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso)
SELECT c.id, v.id, t.id, 'Cambio de aceite y filtros, revisión general del motor', 'pendiente', NOW() - INTERVAL '2 days'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'Carlos Mendoza' AND v.placa = 'ABC-123' AND t.nombre = 'Juan Pérez'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso)
SELECT c.id, v.id, t.id, 'Revisión del sistema de frenos, cambio de pastillas', 'pendiente', NOW() - INTERVAL '1 day'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'María García' AND v.placa = 'GHI-789' AND t.nombre = 'Antonio Silva'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, descripcion, estado, fecha_ingreso)
SELECT c.id, v.id, 'Diagnóstico de falla en encendido, vehículo no arranca', 'pendiente', NOW()
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
WHERE c.nombre = 'José Rodríguez' AND v.placa = 'MNO-345'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, descripcion, estado, fecha_ingreso)
SELECT c.id, v.id, 'Revisión de aire acondicionado, no enfría correctamente', 'pendiente', NOW()
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
WHERE c.nombre = 'Ana Martínez' AND v.placa = 'PQR-678'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, descripcion, estado, fecha_ingreso)
SELECT c.id, v.id, 'Cambio de correa de distribución, mantenimiento preventivo', 'pendiente', NOW() + INTERVAL '1 day'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
WHERE c.nombre = 'Luis Hernández' AND v.placa = 'VWX-234'
LIMIT 1;

-- Órdenes EN PROCESO (6)
INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso)
SELECT c.id, v.id, t.id, 'Reparación de transmisión automática, cambio de fluidos', 'en-proceso', NOW() - INTERVAL '3 days'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'Sofía López' AND v.placa = 'YZA-567' AND t.nombre = 'Juan Pérez'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso)
SELECT c.id, v.id, t.id, 'Instalación de sistema de luces LED, cableado eléctrico', 'en-proceso', NOW() - INTERVAL '2 days'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'Pedro Díaz' AND v.placa = 'EFG-123' AND t.nombre = 'Ricardo Gómez'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso)
SELECT c.id, v.id, t.id, 'Cambio de amortiguadores delanteros y traseros', 'en-proceso', NOW() - INTERVAL '1 day'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'Laura Sánchez' AND v.placa = 'HIJ-456' AND t.nombre = 'Antonio Silva'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso)
SELECT c.id, v.id, t.id, 'Recarga de gas y limpieza de sistema de A/C', 'en-proceso', NOW() - INTERVAL '4 days'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'Miguel Torres' AND v.placa = 'KLM-789' AND t.nombre = 'Francisco Ramírez'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso)
SELECT c.id, v.id, t.id, 'Escaneo de computadora, reseteo de sensores', 'en-proceso', NOW() - INTERVAL '1 day'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'Carmen Flores' AND v.placa = 'QRS-345' AND t.nombre = 'Alejandro Ruiz'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso)
SELECT c.id, v.id, t.id, 'Alineación y balanceo, rotación de cauchos', 'en-proceso', NOW()
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'Roberto Vargas' AND v.placa = 'TUV-678' AND t.nombre = 'Antonio Silva'
LIMIT 1;

-- Órdenes COMPLETADAS (5)
INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso, fecha_entrega)
SELECT c.id, v.id, t.id, 'Cambio de batería y revisión del alternador', 'completado', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'Isabella Moreno' AND v.placa = 'ZAB-234' AND t.nombre = 'Ricardo Gómez'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso, fecha_entrega)
SELECT c.id, v.id, t.id, 'Service completo de 50,000 km', 'completado', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'Fernando Castillo' AND v.placa = 'CDE-567' AND t.nombre = 'Juan Pérez'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso, fecha_entrega)
SELECT c.id, v.id, t.id, 'Reparación de fuga de aceite del motor', 'completado', NOW() - INTERVAL '14 days', NOW() - INTERVAL '12 days'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'Gabriela Rivas' AND v.placa = 'FGH-890' AND t.nombre = 'Juan Pérez'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso, fecha_entrega)
SELECT c.id, v.id, t.id, 'Cambio de discos y pastillas de freno', 'completado', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'Andrés Jiménez' AND v.placa = 'IJK-123' AND t.nombre = 'Antonio Silva'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso, fecha_entrega)
SELECT c.id, v.id, t.id, 'Diagnóstico y reparación de luz de check engine', 'completado', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'Carlos Mendoza' AND v.placa = 'DEF-456' AND t.nombre = 'Alejandro Ruiz'
LIMIT 1;

-- Órdenes ENTREGADAS (4)
INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso, fecha_entrega)
SELECT c.id, v.id, t.id, 'Tune-up completo, cambio de bujías y cables', 'entregado', NOW() - INTERVAL '15 days', NOW() - INTERVAL '13 days'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'María García' AND v.placa = 'JKL-012' AND t.nombre = 'Juan Pérez'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso, fecha_entrega)
SELECT c.id, v.id, t.id, 'Revisión pre-compra completa del vehículo', 'entregado', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'Ana Martínez' AND v.placa = 'STU-901' AND t.nombre = 'Alejandro Ruiz'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso, fecha_entrega)
SELECT c.id, v.id, t.id, 'Reparación de sistema de dirección hidráulica', 'entregado', NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'Sofía López' AND v.placa = 'BCD-890' AND t.nombre = 'Antonio Silva'
LIMIT 1;

INSERT INTO ordenes_trabajo (cliente_id, vehiculo_id, tecnico_id, descripcion, estado, fecha_ingreso, fecha_entrega)
SELECT c.id, v.id, t.id, 'Cambio de embrague y volante', 'entregado', NOW() - INTERVAL '18 days', NOW() - INTERVAL '15 days'
FROM clientes c 
JOIN vehiculos v ON v.cliente_id = c.id 
CROSS JOIN tecnicos t
WHERE c.nombre = 'Roberto Vargas' AND v.placa = 'WXY-901' AND t.nombre = 'Juan Pérez'
LIMIT 1;
