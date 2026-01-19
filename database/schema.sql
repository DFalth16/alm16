-- =====================================================
-- SISTEMA DE GESTIÓN DE TALLER Y POST-VENTA
-- Base de Datos para Supabase (PostgreSQL)
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: clientes
-- Almacena información de los clientes del taller
-- =====================================================
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefono VARCHAR(50),
    telefono_secundario VARCHAR(50),
    direccion TEXT,
    ci_nit VARCHAR(50),
    tipo_cliente VARCHAR(50) DEFAULT 'particular', -- particular, empresa
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para clientes
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_nombre ON clientes(nombre);
CREATE INDEX idx_clientes_activo ON clientes(activo);

-- =====================================================
-- TABLA: vehiculos
-- Almacena información de los vehículos de los clientes
-- =====================================================
CREATE TABLE vehiculos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    anio INTEGER,
    color VARCHAR(50),
    placa VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(50) UNIQUE,
    numero_motor VARCHAR(100),
    tipo_combustible VARCHAR(50), -- gasolina, diesel, electrico, hibrido
    transmision VARCHAR(50), -- manual, automatico
    kilometraje INTEGER DEFAULT 0,
    ultimo_servicio DATE,
    imagen_url TEXT,
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para vehiculos
CREATE INDEX idx_vehiculos_cliente_id ON vehiculos(cliente_id);
CREATE INDEX idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX idx_vehiculos_vin ON vehiculos(vin);
CREATE INDEX idx_vehiculos_marca_modelo ON vehiculos(marca, modelo);

-- =====================================================
-- TABLA: tecnicos
-- Almacena información de los técnicos/mecánicos
-- =====================================================
CREATE TABLE tecnicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefono VARCHAR(50),
    especialidad VARCHAR(100),
    certificaciones TEXT[], -- Array de certificaciones
    fecha_contratacion DATE,
    salario DECIMAL(10, 2),
    disponible BOOLEAN DEFAULT true,
    calificacion DECIMAL(3, 2) DEFAULT 5.00, -- Promedio de calificación
    total_evaluaciones INTEGER DEFAULT 0,
    imagen_url TEXT,
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para tecnicos
CREATE INDEX idx_tecnicos_disponible ON tecnicos(disponible);
CREATE INDEX idx_tecnicos_especialidad ON tecnicos(especialidad);
CREATE INDEX idx_tecnicos_activo ON tecnicos(activo);

-- =====================================================
-- TABLA: tipos_servicio
-- Catálogo de tipos de servicio disponibles
-- =====================================================
CREATE TABLE tipos_servicio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50), -- mantenimiento, reparacion, diagnostico, garantia
    precio_base DECIMAL(10, 2) DEFAULT 0,
    duracion_estimada_horas DECIMAL(4, 2), -- Duración en horas
    color VARCHAR(20), -- Para UI (hex color)
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: servicios_catalogo
-- Catálogo de servicios específicos con precios
-- =====================================================
CREATE TABLE servicios_catalogo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_servicio_id UUID REFERENCES tipos_servicio(id),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL DEFAULT 0,
    duracion_horas DECIMAL(4, 2) DEFAULT 1,
    requiere_repuestos BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para servicios_catalogo
CREATE INDEX idx_servicios_catalogo_tipo ON servicios_catalogo(tipo_servicio_id);

-- =====================================================
-- TABLA: ordenes_trabajo
-- Órdenes de trabajo principales
-- =====================================================
CREATE TABLE ordenes_trabajo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_orden SERIAL UNIQUE, -- Número secuencial para mostrar
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
    tecnico_id UUID REFERENCES tecnicos(id),
    tipo_servicio_id UUID REFERENCES tipos_servicio(id),
    
    -- Fechas
    fecha_ingreso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_estimada_entrega DATE,
    fecha_entrega TIMESTAMP WITH TIME ZONE,
    
    -- Estado
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, en-proceso, completado, entregado, cancelado
    prioridad VARCHAR(20) DEFAULT 'normal', -- baja, normal, alta, urgente
    
    -- Detalles
    descripcion TEXT,
    diagnostico TEXT,
    observaciones TEXT,
    
    -- Kilometraje al ingreso
    kilometraje_ingreso INTEGER,
    
    -- Costos
    costo_estimado DECIMAL(10, 2) DEFAULT 0,
    costo_mano_obra DECIMAL(10, 2) DEFAULT 0,
    costo_repuestos DECIMAL(10, 2) DEFAULT 0,
    descuento DECIMAL(10, 2) DEFAULT 0,
    costo_total DECIMAL(10, 2) DEFAULT 0,
    
    -- Garantía aplicada
    garantia_aplicada BOOLEAN DEFAULT false,
    garantia_id UUID,
    
    -- Auditoría
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para ordenes_trabajo
CREATE INDEX idx_ordenes_cliente ON ordenes_trabajo(cliente_id);
CREATE INDEX idx_ordenes_vehiculo ON ordenes_trabajo(vehiculo_id);
CREATE INDEX idx_ordenes_tecnico ON ordenes_trabajo(tecnico_id);
CREATE INDEX idx_ordenes_estado ON ordenes_trabajo(estado);
CREATE INDEX idx_ordenes_fecha_ingreso ON ordenes_trabajo(fecha_ingreso);
CREATE INDEX idx_ordenes_numero ON ordenes_trabajo(numero_orden);

-- =====================================================
-- TABLA: ordenes_servicios
-- Servicios incluidos en cada orden de trabajo (detalle)
-- =====================================================
CREATE TABLE ordenes_servicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    servicio_id UUID REFERENCES servicios_catalogo(id),
    nombre_servicio VARCHAR(255) NOT NULL, -- Se guarda el nombre por si cambia en catálogo
    descripcion TEXT,
    cantidad INTEGER DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0,
    precio_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    completado BOOLEAN DEFAULT false,
    fecha_completado TIMESTAMP WITH TIME ZONE,
    tecnico_id UUID REFERENCES tecnicos(id),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para ordenes_servicios
CREATE INDEX idx_ordenes_servicios_orden ON ordenes_servicios(orden_id);

-- =====================================================
-- TABLA: ordenes_historial
-- Historial de cambios de estado de las órdenes
-- =====================================================
CREATE TABLE ordenes_historial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50) NOT NULL,
    comentario TEXT,
    usuario_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para ordenes_historial
CREATE INDEX idx_ordenes_historial_orden ON ordenes_historial(orden_id);
CREATE INDEX idx_ordenes_historial_fecha ON ordenes_historial(created_at);

-- =====================================================
-- TABLA: citas
-- Citas programadas para servicios
-- =====================================================
CREATE TABLE citas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
    tecnico_id UUID REFERENCES tecnicos(id),
    
    -- Fecha y hora
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME,
    duracion_estimada_horas DECIMAL(4, 2) DEFAULT 1,
    
    -- Detalles
    tipo_servicio VARCHAR(100),
    descripcion TEXT,
    
    -- Estado
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, confirmada, en_progreso, completada, cancelada, no_asistio
    
    -- Recordatorios
    recordatorio_enviado BOOLEAN DEFAULT false,
    fecha_recordatorio TIMESTAMP WITH TIME ZONE,
    
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para citas
CREATE INDEX idx_citas_cliente ON citas(cliente_id);
CREATE INDEX idx_citas_vehiculo ON citas(vehiculo_id);
CREATE INDEX idx_citas_fecha ON citas(fecha);
CREATE INDEX idx_citas_estado ON citas(estado);
CREATE INDEX idx_citas_tecnico ON citas(tecnico_id);

-- =====================================================
-- TABLA: garantias
-- Registro de garantías de vehículos y servicios
-- =====================================================
CREATE TABLE garantias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    orden_origen_id UUID REFERENCES ordenes_trabajo(id), -- Orden que generó la garantía
    
    -- Tipo de garantía
    tipo VARCHAR(100) NOT NULL, -- fabrica, extendida, servicio, repuesto
    descripcion TEXT,
    
    -- Vigencia
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    kilometraje_maximo INTEGER, -- NULL si no aplica
    
    -- Cobertura
    cobertura TEXT[], -- Array de elementos cubiertos
    
    -- Estado
    estado VARCHAR(50) DEFAULT 'activa', -- activa, vencida, reclamada, cancelada
    
    -- Documento
    documento_url TEXT,
    numero_poliza VARCHAR(100),
    
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para garantias
CREATE INDEX idx_garantias_vehiculo ON garantias(vehiculo_id);
CREATE INDEX idx_garantias_cliente ON garantias(cliente_id);
CREATE INDEX idx_garantias_estado ON garantias(estado);
CREATE INDEX idx_garantias_vencimiento ON garantias(fecha_vencimiento);

-- =====================================================
-- TABLA: reclamos_garantia
-- Reclamos realizados sobre garantías
-- =====================================================
CREATE TABLE reclamos_garantia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garantia_id UUID NOT NULL REFERENCES garantias(id),
    orden_id UUID REFERENCES ordenes_trabajo(id),
    
    fecha_reclamo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    descripcion TEXT NOT NULL,
    diagnostico TEXT,
    
    -- Estado del reclamo
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, aprobado, rechazado, en_proceso, completado
    
    -- Resolución
    fecha_resolucion TIMESTAMP WITH TIME ZONE,
    resolucion TEXT,
    costo_cubierto DECIMAL(10, 2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para reclamos
CREATE INDEX idx_reclamos_garantia ON reclamos_garantia(garantia_id);
CREATE INDEX idx_reclamos_estado ON reclamos_garantia(estado);

-- =====================================================
-- TABLA: historial_servicios
-- Historial completo de servicios realizados (vista consolidada)
-- =====================================================
CREATE TABLE historial_servicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id UUID REFERENCES ordenes_trabajo(id),
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
    tecnico_id UUID REFERENCES tecnicos(id),
    
    fecha DATE NOT NULL,
    tipo_servicio VARCHAR(100),
    servicios_realizados TEXT[], -- Array de servicios
    
    kilometraje INTEGER,
    costo_total DECIMAL(10, 2) DEFAULT 0,
    
    -- Garantía generada
    genera_garantia BOOLEAN DEFAULT false,
    garantia_id UUID REFERENCES garantias(id),
    
    observaciones TEXT,
    calificacion_cliente INTEGER CHECK (calificacion_cliente >= 1 AND calificacion_cliente <= 5),
    comentario_cliente TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para historial
CREATE INDEX idx_historial_cliente ON historial_servicios(cliente_id);
CREATE INDEX idx_historial_vehiculo ON historial_servicios(vehiculo_id);
CREATE INDEX idx_historial_fecha ON historial_servicios(fecha);
CREATE INDEX idx_historial_tecnico ON historial_servicios(tecnico_id);

-- =====================================================
-- TABLA: usuarios
-- Usuarios del sistema (para autenticación con Supabase Auth)
-- =====================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(255),
    rol VARCHAR(50) DEFAULT 'operador', -- admin, gerente, operador, tecnico
    tecnico_id UUID REFERENCES tecnicos(id), -- Si el usuario es un técnico
    telefono VARCHAR(50),
    avatar_url TEXT,
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para usuarios
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- =====================================================
-- TABLA: configuracion
-- Configuración general del sistema
-- =====================================================
CREATE TABLE configuracion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    descripcion TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: notificaciones
-- Sistema de notificaciones internas
-- =====================================================
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- orden, cita, garantia, sistema
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT,
    referencia_tipo VARCHAR(50), -- orden, cita, garantia, cliente
    referencia_id UUID,
    leida BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para notificaciones
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehiculos_updated_at BEFORE UPDATE ON vehiculos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tecnicos_updated_at BEFORE UPDATE ON tecnicos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordenes_updated_at BEFORE UPDATE ON ordenes_trabajo
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_citas_updated_at BEFORE UPDATE ON citas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garantias_updated_at BEFORE UPDATE ON garantias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Función para calcular costo total de orden
-- =====================================================
CREATE OR REPLACE FUNCTION calcular_costo_total_orden(orden_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    costo DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(SUM(precio_total), 0) INTO costo
    FROM ordenes_servicios
    WHERE orden_id = orden_uuid;
    
    RETURN costo;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Función para registrar cambio de estado de orden
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_cambio_estado_orden()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO ordenes_historial (orden_id, estado_anterior, estado_nuevo)
        VALUES (NEW.id, OLD.estado, NEW.estado);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cambio_estado_orden
    AFTER UPDATE ON ordenes_trabajo
    FOR EACH ROW EXECUTE FUNCTION registrar_cambio_estado_orden();

-- =====================================================
-- Función para actualizar último servicio del vehículo
-- =====================================================
CREATE OR REPLACE FUNCTION actualizar_ultimo_servicio_vehiculo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'entregado' AND OLD.estado != 'entregado' THEN
        UPDATE vehiculos 
        SET ultimo_servicio = CURRENT_DATE,
            kilometraje = COALESCE(NEW.kilometraje_ingreso, kilometraje)
        WHERE id = NEW.vehiculo_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_vehiculo_servicio
    AFTER UPDATE ON ordenes_trabajo
    FOR EACH ROW EXECUTE FUNCTION actualizar_ultimo_servicio_vehiculo();

-- =====================================================
-- Función para verificar garantías vencidas
-- =====================================================
CREATE OR REPLACE FUNCTION verificar_garantias_vencidas()
RETURNS void AS $$
BEGIN
    UPDATE garantias
    SET estado = 'vencida'
    WHERE estado = 'activa'
    AND fecha_vencimiento < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLÍTICAS DE SEGURIDAD RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE garantias ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios autenticados (lectura)
CREATE POLICY "Usuarios autenticados pueden leer clientes"
    ON clientes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden leer vehiculos"
    ON vehiculos FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden leer tecnicos"
    ON tecnicos FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden leer ordenes"
    ON ordenes_trabajo FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden leer servicios de ordenes"
    ON ordenes_servicios FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden leer citas"
    ON citas FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden leer garantias"
    ON garantias FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden leer historial"
    ON historial_servicios FOR SELECT
    TO authenticated
    USING (true);

-- Políticas de inserción/actualización (todos los usuarios autenticados)
CREATE POLICY "Usuarios autenticados pueden insertar clientes"
    ON clientes FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar clientes"
    ON clientes FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar vehiculos"
    ON vehiculos FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar vehiculos"
    ON vehiculos FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar ordenes"
    ON ordenes_trabajo FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar ordenes"
    ON ordenes_trabajo FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar servicios"
    ON ordenes_servicios FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar servicios"
    ON ordenes_servicios FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar citas"
    ON citas FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar citas"
    ON citas FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar garantias"
    ON garantias FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar garantias"
    ON garantias FOR UPDATE
    TO authenticated
    USING (true);

-- Políticas para notificaciones (solo propias)
CREATE POLICY "Usuarios pueden ver sus notificaciones"
    ON notificaciones FOR SELECT
    TO authenticated
    USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar sus notificaciones"
    ON notificaciones FOR UPDATE
    TO authenticated
    USING (usuario_id = auth.uid());

-- Política para usuarios
CREATE POLICY "Usuarios pueden ver su propio perfil"
    ON usuarios FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar su perfil"
    ON usuarios FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de órdenes con información completa
CREATE OR REPLACE VIEW vista_ordenes_completa AS
SELECT 
    o.id,
    o.numero_orden,
    o.estado,
    o.prioridad,
    o.descripcion,
    o.fecha_ingreso,
    o.fecha_estimada_entrega,
    o.fecha_entrega,
    o.costo_estimado,
    o.costo_total,
    c.id AS cliente_id,
    c.nombre AS cliente_nombre,
    c.telefono AS cliente_telefono,
    v.id AS vehiculo_id,
    v.marca,
    v.modelo,
    v.placa,
    v.anio,
    t.id AS tecnico_id,
    t.nombre AS tecnico_nombre,
    t.especialidad AS tecnico_especialidad,
    ts.nombre AS tipo_servicio
FROM ordenes_trabajo o
JOIN clientes c ON o.cliente_id = c.id
JOIN vehiculos v ON o.vehiculo_id = v.id
LEFT JOIN tecnicos t ON o.tecnico_id = t.id
LEFT JOIN tipos_servicio ts ON o.tipo_servicio_id = ts.id;

-- Vista de garantías activas con días restantes
CREATE OR REPLACE VIEW vista_garantias_activas AS
SELECT 
    g.*,
    c.nombre AS cliente_nombre,
    c.telefono AS cliente_telefono,
    v.marca,
    v.modelo,
    v.placa,
    v.kilometraje AS kilometraje_actual,
    (g.fecha_vencimiento - CURRENT_DATE) AS dias_restantes,
    CASE 
        WHEN (g.fecha_vencimiento - CURRENT_DATE) <= 30 THEN 'critico'
        WHEN (g.fecha_vencimiento - CURRENT_DATE) <= 90 THEN 'proximo'
        ELSE 'vigente'
    END AS urgencia
FROM garantias g
JOIN clientes c ON g.cliente_id = c.id
JOIN vehiculos v ON g.vehiculo_id = v.id
WHERE g.estado = 'activa';

-- Vista de citas del día
CREATE OR REPLACE VIEW vista_citas_hoy AS
SELECT 
    ci.*,
    c.nombre AS cliente_nombre,
    c.telefono AS cliente_telefono,
    v.marca,
    v.modelo,
    v.placa,
    t.nombre AS tecnico_nombre
FROM citas ci
JOIN clientes c ON ci.cliente_id = c.id
JOIN vehiculos v ON ci.vehiculo_id = v.id
LEFT JOIN tecnicos t ON ci.tecnico_id = t.id
WHERE ci.fecha = CURRENT_DATE
ORDER BY ci.hora_inicio;

-- Vista de estadísticas de técnicos
CREATE OR REPLACE VIEW vista_estadisticas_tecnicos AS
SELECT 
    t.id,
    t.nombre,
    t.especialidad,
    t.disponible,
    t.calificacion,
    COUNT(CASE WHEN o.estado IN ('pendiente', 'en-proceso') THEN 1 END) AS ordenes_activas,
    COUNT(CASE WHEN o.estado = 'completado' OR o.estado = 'entregado' THEN 1 END) AS ordenes_completadas,
    COALESCE(SUM(CASE WHEN o.estado = 'completado' OR o.estado = 'entregado' THEN o.costo_total ELSE 0 END), 0) AS ingresos_generados
FROM tecnicos t
LEFT JOIN ordenes_trabajo o ON t.id = o.tecnico_id
WHERE t.activo = true
GROUP BY t.id, t.nombre, t.especialidad, t.disponible, t.calificacion;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Tipos de servicio
INSERT INTO tipos_servicio (nombre, descripcion, categoria, precio_base, duracion_estimada_horas, color) VALUES
('Mantenimiento Preventivo', 'Servicios de mantenimiento programado', 'mantenimiento', 200, 2, '#3b82f6'),
('Mantenimiento Correctivo', 'Reparaciones de fallas detectadas', 'reparacion', 300, 3, '#f59e0b'),
('Reparación', 'Reparaciones generales', 'reparacion', 400, 4, '#ef4444'),
('Reparación Mayor', 'Reparaciones de motor, transmisión, etc.', 'reparacion', 1000, 8, '#dc2626'),
('Diagnóstico', 'Diagnóstico electrónico y mecánico', 'diagnostico', 150, 1, '#8b5cf6'),
('Revisión de Garantía', 'Revisiones cubiertas por garantía', 'garantia', 0, 2, '#10b981'),
('Revisión General', 'Inspección completa del vehículo', 'diagnostico', 180, 1.5, '#6366f1');

-- Servicios del catálogo
INSERT INTO servicios_catalogo (tipo_servicio_id, nombre, descripcion, precio, duracion_horas) 
SELECT 
    ts.id,
    s.nombre,
    s.descripcion,
    s.precio,
    s.duracion
FROM tipos_servicio ts
CROSS JOIN (VALUES
    ('Cambio de aceite', 'Cambio de aceite de motor con filtro', 120, 0.5),
    ('Filtro de aire', 'Reemplazo de filtro de aire', 80, 0.25),
    ('Filtro de combustible', 'Reemplazo de filtro de combustible', 100, 0.5),
    ('Filtro de habitáculo', 'Reemplazo de filtro de aire acondicionado', 70, 0.25),
    ('Cambio de pastillas de freno', 'Reemplazo de pastillas delanteras o traseras', 350, 1),
    ('Cambio de discos de freno', 'Reemplazo de discos de freno', 500, 1.5),
    ('Alineación y balanceo', 'Servicio completo de alineación y balanceo', 180, 1),
    ('Diagnóstico electrónico', 'Escaneo de códigos de error con equipo especializado', 150, 1),
    ('Revisión de frenos', 'Inspección completa del sistema de frenos', 100, 0.5),
    ('Cambio de embrague', 'Reemplazo completo del kit de embrague', 2500, 6),
    ('Revisión de suspensión', 'Inspección de amortiguadores y componentes', 120, 0.5),
    ('Cambio de amortiguadores', 'Reemplazo de amortiguadores delanteros o traseros', 800, 2),
    ('Revisión multipunto', 'Inspección de seguridad de 25 puntos', 200, 1),
    ('Cambio de bujías', 'Reemplazo de bujías de encendido', 150, 0.5),
    ('Cambio de batería', 'Instalación de batería nueva', 400, 0.25)
) AS s(nombre, descripcion, precio, duracion)
WHERE ts.categoria = 'mantenimiento'
LIMIT 15;

-- Configuración inicial
INSERT INTO configuracion (clave, valor, tipo, descripcion) VALUES
('nombre_taller', 'TallerPro', 'string', 'Nombre del taller'),
('direccion', 'Av. Principal #123', 'string', 'Dirección del taller'),
('telefono', '+591 70000000', 'string', 'Teléfono principal'),
('email', 'contacto@tallerpro.com', 'string', 'Email de contacto'),
('moneda', 'BOB', 'string', 'Código de moneda'),
('simbolo_moneda', 'Bs.', 'string', 'Símbolo de moneda'),
('iva', '13', 'number', 'Porcentaje de IVA'),
('dias_aviso_garantia', '30', 'number', 'Días antes para avisar vencimiento de garantía'),
('hora_apertura', '08:00', 'string', 'Hora de apertura'),
('hora_cierre', '18:00', 'string', 'Hora de cierre');
