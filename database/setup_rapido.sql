-- =====================================================
-- SETUP RÁPIDO - SISTEMA ALM
-- Copiar TODO y ejecutar en Supabase SQL Editor
-- =====================================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- 1. CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(50),
    direccion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VEHICULOS
CREATE TABLE IF NOT EXISTS vehiculos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    anio INTEGER,
    color VARCHAR(50),
    placa VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(50),
    kilometraje INTEGER DEFAULT 0,
    ultimo_servicio DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TECNICOS
CREATE TABLE IF NOT EXISTS tecnicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(50),
    especialidad VARCHAR(100),
    certificaciones TEXT[],
    disponible BOOLEAN DEFAULT true,
    calificacion DECIMAL(3, 2) DEFAULT 5.00,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TIPOS DE SERVICIO
CREATE TABLE IF NOT EXISTS tipos_servicio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    color VARCHAR(20),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SERVICIOS CATALOGO
CREATE TABLE IF NOT EXISTS servicios_catalogo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_servicio_id UUID REFERENCES tipos_servicio(id),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) DEFAULT 0,
    duracion_horas DECIMAL(4, 2) DEFAULT 1,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDENES DE TRABAJO
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_orden SERIAL,
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
    tecnico_id UUID REFERENCES tecnicos(id),
    tipo_servicio_id UUID REFERENCES tipos_servicio(id),
    fecha_ingreso TIMESTAMPTZ DEFAULT NOW(),
    fecha_estimada DATE,
    fecha_entrega TIMESTAMPTZ,
    estado VARCHAR(50) DEFAULT 'pendiente',
    descripcion TEXT,
    observaciones TEXT,
    kilometraje_ingreso INTEGER,
    costo_estimado DECIMAL(10, 2) DEFAULT 0,
    costo_total DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDENES_SERVICIOS (detalle de órdenes)
CREATE TABLE IF NOT EXISTS ordenes_servicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    servicio_id UUID REFERENCES servicios_catalogo(id),
    nombre_servicio VARCHAR(255) NOT NULL,
    descripcion TEXT,
    cantidad INTEGER DEFAULT 1,
    precio_unitario DECIMAL(10, 2) DEFAULT 0,
    precio_total DECIMAL(10, 2) DEFAULT 0,
    completado BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDENES_HISTORIAL (timeline de ordenes)
CREATE TABLE IF NOT EXISTS ordenes_historial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50) NOT NULL,
    comentario TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CITAS
CREATE TABLE IF NOT EXISTS citas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
    tecnico_id UUID REFERENCES tecnicos(id),
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME,
    duracion_estimada_horas DECIMAL(4, 2) DEFAULT 1,
    tipo_servicio VARCHAR(100),
    descripcion TEXT,
    estado VARCHAR(50) DEFAULT 'pendiente',
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. GARANTIAS
CREATE TABLE IF NOT EXISTS garantias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    tipo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    kilometraje_maximo INTEGER,
    cobertura TEXT[],
    estado VARCHAR(50) DEFAULT 'activa',
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. RECLAMOS_GARANTIA
CREATE TABLE IF NOT EXISTS reclamos_garantia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garantia_id UUID NOT NULL REFERENCES garantias(id),
    orden_id UUID REFERENCES ordenes_trabajo(id),
    fecha_reclamo TIMESTAMPTZ DEFAULT NOW(),
    descripcion TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. HISTORIAL DE SERVICIOS
CREATE TABLE IF NOT EXISTS historial_servicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id UUID REFERENCES ordenes_trabajo(id),
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
    tecnico_id UUID REFERENCES tecnicos(id),
    fecha DATE NOT NULL,
    tipo_servicio VARCHAR(100),
    servicios_realizados TEXT[],
    kilometraje INTEGER,
    costo_total DECIMAL(10, 2) DEFAULT 0,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. CONFIGURACION
CREATE TABLE IF NOT EXISTS configuracion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DESHABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_servicio DISABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_catalogo DISABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_trabajo DISABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_servicios DISABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_historial DISABLE ROW LEVEL SECURITY;
ALTER TABLE citas DISABLE ROW LEVEL SECURITY;
ALTER TABLE garantias DISABLE ROW LEVEL SECURITY;
ALTER TABLE reclamos_garantia DISABLE ROW LEVEL SECURITY;
ALTER TABLE historial_servicios DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNCIONES PARA EL SISTEMA
-- =====================================================

-- Función: Obtener técnico disponible con menos carga
CREATE OR REPLACE FUNCTION obtener_tecnico_disponible()
RETURNS UUID AS $$
DECLARE
    tecnico_id_result UUID;
BEGIN
    SELECT t.id INTO tecnico_id_result
    FROM tecnicos t
    LEFT JOIN (
        SELECT tecnico_id, COUNT(*) as ordenes_activas
        FROM ordenes_trabajo
        WHERE estado IN ('pendiente', 'en-proceso')
        GROUP BY tecnico_id
    ) o ON t.id = o.tecnico_id
    WHERE t.activo = true AND t.disponible = true
    ORDER BY COALESCE(o.ordenes_activas, 0) ASC, t.calificacion DESC
    LIMIT 1;
    
    RETURN tecnico_id_result;
END;
$$ LANGUAGE plpgsql;

-- Función: Obtener historial por placa
CREATE OR REPLACE FUNCTION obtener_historial_por_placa(placa_input VARCHAR)
RETURNS TABLE (
    id UUID,
    fecha DATE,
    tipo_servicio VARCHAR,
    servicios_realizados TEXT[],
    kilometraje INTEGER,
    costo_total DECIMAL,
    observaciones TEXT,
    tecnico_nombre VARCHAR,
    vehiculo_marca VARCHAR,
    vehiculo_modelo VARCHAR,
    vehiculo_placa VARCHAR,
    cliente_nombre VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.fecha,
        h.tipo_servicio,
        h.servicios_realizados,
        h.kilometraje,
        h.costo_total,
        h.observaciones,
        t.nombre AS tecnico_nombre,
        v.marca AS vehiculo_marca,
        v.modelo AS vehiculo_modelo,
        v.placa AS vehiculo_placa,
        c.nombre AS cliente_nombre
    FROM historial_servicios h
    INNER JOIN vehiculos v ON h.vehiculo_id = v.id
    INNER JOIN clientes c ON h.cliente_id = c.id
    LEFT JOIN tecnicos t ON h.tecnico_id = t.id
    WHERE UPPER(v.placa) = UPPER(placa_input)
    ORDER BY h.fecha DESC;
END;
$$ LANGUAGE plpgsql;

-- Función: Calcular próximos mantenimientos
CREATE OR REPLACE FUNCTION calcular_proximos_mantenimientos(
    intervalo_km INTEGER DEFAULT 10000,
    intervalo_meses INTEGER DEFAULT 6
)
RETURNS TABLE (
    vehiculo_id UUID,
    cliente_id UUID,
    cliente_nombre VARCHAR,
    cliente_telefono VARCHAR,
    vehiculo_marca VARCHAR,
    vehiculo_modelo VARCHAR,
    vehiculo_placa VARCHAR,
    kilometraje_actual INTEGER,
    ultimo_servicio DATE,
    dias_desde_ultimo_servicio INTEGER,
    km_desde_ultimo_servicio INTEGER,
    necesita_por_km BOOLEAN,
    necesita_por_tiempo BOOLEAN,
    urgencia VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    WITH ultimo_servicio_vehiculo AS (
        SELECT 
            v.id AS vid,
            v.cliente_id AS cid,
            v.marca,
            v.modelo,
            v.placa,
            v.kilometraje AS km_actual,
            COALESCE(v.ultimo_servicio, v.created_at::date) AS ultimo_srv,
            COALESCE(
                (SELECT MAX(h.kilometraje) FROM historial_servicios h WHERE h.vehiculo_id = v.id),
                0
            ) AS km_ultimo_srv
        FROM vehiculos v
        WHERE v.activo = true
    )
    SELECT 
        us.vid,
        us.cid,
        c.nombre,
        c.telefono,
        us.marca,
        us.modelo,
        us.placa,
        us.km_actual,
        us.ultimo_srv,
        (CURRENT_DATE - us.ultimo_srv)::INTEGER,
        (us.km_actual - us.km_ultimo_srv)::INTEGER,
        (us.km_actual - us.km_ultimo_srv) >= intervalo_km,
        (CURRENT_DATE - us.ultimo_srv) >= (intervalo_meses * 30),
        CASE 
            WHEN (us.km_actual - us.km_ultimo_srv) >= intervalo_km * 1.5 
                 OR (CURRENT_DATE - us.ultimo_srv) >= (intervalo_meses * 45) THEN 'critico'
            WHEN (us.km_actual - us.km_ultimo_srv) >= intervalo_km 
                 OR (CURRENT_DATE - us.ultimo_srv) >= (intervalo_meses * 30) THEN 'urgente'
            WHEN (us.km_actual - us.km_ultimo_srv) >= intervalo_km * 0.8 
                 OR (CURRENT_DATE - us.ultimo_srv) >= (intervalo_meses * 24) THEN 'proximo'
            ELSE 'ok'
        END
    FROM ultimo_servicio_vehiculo us
    INNER JOIN clientes c ON us.cid = c.id
    WHERE c.activo = true
    AND (
        (us.km_actual - us.km_ultimo_srv) >= intervalo_km * 0.8
        OR (CURRENT_DATE - us.ultimo_srv) >= (intervalo_meses * 24)
    )
    ORDER BY 
        CASE 
            WHEN (us.km_actual - us.km_ultimo_srv) >= intervalo_km * 1.5 THEN 1
            WHEN (us.km_actual - us.km_ultimo_srv) >= intervalo_km THEN 2
            ELSE 3
        END,
        (CURRENT_DATE - us.ultimo_srv) DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Insertar tipos de servicio
INSERT INTO tipos_servicio (nombre, color) VALUES 
    ('Mantenimiento Preventivo', '#3b82f6'),
    ('Mantenimiento Correctivo', '#f59e0b'),
    ('Reparación', '#ef4444'),
    ('Reparación Mayor', '#dc2626'),
    ('Diagnóstico', '#8b5cf6'),
    ('Revisión de Garantía', '#10b981'),
    ('Revisión General', '#6366f1')
ON CONFLICT DO NOTHING;

-- Insertar técnicos de ejemplo
INSERT INTO tecnicos (nombre, email, telefono, especialidad, certificaciones, disponible, calificacion) VALUES 
    ('Miguel Ángel Flores', 'miguel.flores@taller.com', '+591 70123456', 'Mecánica General', ARRAY['Toyota Certified', 'ASE Master Technician'], true, 4.8),
    ('Pedro Ramírez Chávez', 'pedro.ramirez@taller.com', '+591 71234567', 'Electrónica Automotriz', ARRAY['Bosch Certified', 'Electronic Diagnostics'], true, 4.9),
    ('Luis Fernando Torres', 'luis.torres@taller.com', '+591 72345678', 'Frenos y Suspensión', ARRAY['Brembo Specialist', 'Monroe Training'], false, 4.7),
    ('José Antonio Medina', 'jose.medina@taller.com', '+591 73456789', 'Motor y Transmisión', ARRAY['Honda Expert', 'Transmission Specialist'], true, 4.6)
ON CONFLICT DO NOTHING;

-- Insertar clientes de ejemplo
INSERT INTO clientes (nombre, email, telefono, direccion) VALUES 
    ('Carlos Alberto Mendoza García', 'carlos.mendoza@email.com', '+591 78901234', 'Av. Arce #1520, La Paz'),
    ('María Elena Rojas Fernández', 'maria.rojas@email.com', '+591 67890123', 'Calle Potosí #890, Santa Cruz'),
    ('Roberto Quispe Mamani', 'roberto.quispe@email.com', '+591 71234567', 'Zona Sur, Calle 21 #456, La Paz'),
    ('Ana Lucía Vargas Soliz', 'ana.vargas@email.com', '+591 76543210', 'Av. Banzer #2300, Santa Cruz'),
    ('Jorge Luis Condori Choque', 'jorge.condori@email.com', '+591 72345678', 'Calle Comercio #123, Cochabamba')
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT 'SETUP COMPLETADO' as mensaje, 
       (SELECT COUNT(*) FROM clientes) as clientes,
       (SELECT COUNT(*) FROM tecnicos) as tecnicos,
       (SELECT COUNT(*) FROM tipos_servicio) as tipos_servicio;
