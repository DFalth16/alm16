-- =====================================================
-- FUNCIONES ADICIONALES PARA SISTEMA ALM
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. FUNCIÓN: Obtener técnico disponible con menos carga
-- Retorna el ID del técnico activo y disponible con menos órdenes activas
-- =====================================================
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

-- =====================================================
-- 2. FUNCIÓN: Obtener historial por placa de vehículo
-- Retorna todo el historial de servicios de un vehículo por su placa
-- =====================================================
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

-- =====================================================
-- 3. FUNCIÓN: Calcular vehículos que necesitan mantenimiento
-- Basado en kilometraje (cada 10,000 km) o tiempo (cada 6 meses)
-- =====================================================
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
            v.id AS vehiculo_id,
            v.cliente_id,
            v.marca,
            v.modelo,
            v.placa,
            v.kilometraje AS km_actual,
            COALESCE(v.ultimo_servicio, v.created_at::date) AS ultimo_servicio,
            COALESCE(
                (SELECT MAX(h.kilometraje) FROM historial_servicios h WHERE h.vehiculo_id = v.id),
                0
            ) AS km_ultimo_servicio
        FROM vehiculos v
        WHERE v.activo = true
    )
    SELECT 
        us.vehiculo_id,
        us.cliente_id,
        c.nombre AS cliente_nombre,
        c.telefono AS cliente_telefono,
        us.marca AS vehiculo_marca,
        us.modelo AS vehiculo_modelo,
        us.placa AS vehiculo_placa,
        us.km_actual AS kilometraje_actual,
        us.ultimo_servicio,
        (CURRENT_DATE - us.ultimo_servicio)::INTEGER AS dias_desde_ultimo_servicio,
        (us.km_actual - us.km_ultimo_servicio)::INTEGER AS km_desde_ultimo_servicio,
        (us.km_actual - us.km_ultimo_servicio) >= intervalo_km AS necesita_por_km,
        (CURRENT_DATE - us.ultimo_servicio) >= (intervalo_meses * 30) AS necesita_por_tiempo,
        CASE 
            WHEN (us.km_actual - us.km_ultimo_servicio) >= intervalo_km * 1.5 
                 OR (CURRENT_DATE - us.ultimo_servicio) >= (intervalo_meses * 45) THEN 'critico'
            WHEN (us.km_actual - us.km_ultimo_servicio) >= intervalo_km 
                 OR (CURRENT_DATE - us.ultimo_servicio) >= (intervalo_meses * 30) THEN 'urgente'
            WHEN (us.km_actual - us.km_ultimo_servicio) >= intervalo_km * 0.8 
                 OR (CURRENT_DATE - us.ultimo_servicio) >= (intervalo_meses * 24) THEN 'proximo'
            ELSE 'ok'
        END AS urgencia
    FROM ultimo_servicio_vehiculo us
    INNER JOIN clientes c ON us.cliente_id = c.id
    WHERE c.activo = true
    AND (
        (us.km_actual - us.km_ultimo_servicio) >= intervalo_km * 0.8
        OR (CURRENT_DATE - us.ultimo_servicio) >= (intervalo_meses * 24)
    )
    ORDER BY 
        CASE 
            WHEN (us.km_actual - us.km_ultimo_servicio) >= intervalo_km * 1.5 THEN 1
            WHEN (us.km_actual - us.km_ultimo_servicio) >= intervalo_km THEN 2
            ELSE 3
        END,
        (CURRENT_DATE - us.ultimo_servicio) DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. FUNCIÓN: Verificar garantías activas de un vehículo
-- =====================================================
CREATE OR REPLACE FUNCTION verificar_garantias_vehiculo(vehiculo_uuid UUID)
RETURNS TABLE (
    garantia_id UUID,
    tipo VARCHAR,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_vencimiento DATE,
    dias_restantes INTEGER,
    kilometraje_maximo INTEGER,
    cobertura TEXT[],
    estado VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id AS garantia_id,
        g.tipo,
        g.descripcion,
        g.fecha_inicio,
        g.fecha_vencimiento,
        (g.fecha_vencimiento - CURRENT_DATE)::INTEGER AS dias_restantes,
        g.kilometraje_maximo,
        g.cobertura,
        g.estado
    FROM garantias g
    WHERE g.vehiculo_id = vehiculo_uuid
    ORDER BY g.fecha_vencimiento ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. FUNCIÓN: Contar órdenes activas por técnico
-- Útil para el dashboard y asignación
-- =====================================================
CREATE OR REPLACE FUNCTION contar_ordenes_activas_tecnico(tecnico_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total INTEGER;
BEGIN
    SELECT COUNT(*) INTO total
    FROM ordenes_trabajo
    WHERE tecnico_id = tecnico_uuid
    AND estado IN ('pendiente', 'en-proceso');
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TRIGGER: Auto-registrar en historial al entregar orden
-- =====================================================
CREATE OR REPLACE FUNCTION auto_registrar_historial()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo ejecutar cuando el estado cambia a 'entregado'
    IF NEW.estado = 'entregado' AND OLD.estado != 'entregado' THEN
        INSERT INTO historial_servicios (
            orden_id,
            cliente_id,
            vehiculo_id,
            tecnico_id,
            fecha,
            tipo_servicio,
            kilometraje,
            costo_total,
            observaciones
        ) VALUES (
            NEW.id,
            NEW.cliente_id,
            NEW.vehiculo_id,
            NEW.tecnico_id,
            CURRENT_DATE,
            (SELECT nombre FROM tipos_servicio WHERE id = NEW.tipo_servicio_id),
            NEW.kilometraje_ingreso,
            NEW.costo_total,
            NEW.observaciones
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger si no existe
DROP TRIGGER IF EXISTS trigger_auto_registrar_historial ON ordenes_trabajo;
CREATE TRIGGER trigger_auto_registrar_historial
    AFTER UPDATE ON ordenes_trabajo
    FOR EACH ROW
    EXECUTE FUNCTION auto_registrar_historial();

-- =====================================================
-- 7. POLÍTICAS RLS ADICIONALES
-- =====================================================

-- Política para tecnicos (INSERT)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tecnicos' AND policyname = 'Usuarios autenticados pueden insertar tecnicos'
    ) THEN
        CREATE POLICY "Usuarios autenticados pueden insertar tecnicos"
            ON tecnicos FOR INSERT
            TO authenticated
            WITH CHECK (true);
    END IF;
END $$;

-- Política para tecnicos (UPDATE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tecnicos' AND policyname = 'Usuarios autenticados pueden actualizar tecnicos'
    ) THEN
        CREATE POLICY "Usuarios autenticados pueden actualizar tecnicos"
            ON tecnicos FOR UPDATE
            TO authenticated
            USING (true);
    END IF;
END $$;

-- Política para tecnicos (DELETE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tecnicos' AND policyname = 'Usuarios autenticados pueden eliminar tecnicos'
    ) THEN
        CREATE POLICY "Usuarios autenticados pueden eliminar tecnicos"
            ON tecnicos FOR DELETE
            TO authenticated
            USING (true);
    END IF;
END $$;

-- =====================================================
-- 8. VISTA: Estadísticas de técnicos con carga de trabajo
-- =====================================================
CREATE OR REPLACE VIEW vista_tecnicos_carga AS
SELECT 
    t.id,
    t.nombre,
    t.email,
    t.telefono,
    t.especialidad,
    t.certificaciones,
    t.disponible,
    t.calificacion,
    t.activo,
    COALESCE(ordenes_activas.total, 0) AS ordenes_activas,
    COALESCE(ordenes_completadas.total, 0) AS ordenes_completadas_mes
FROM tecnicos t
LEFT JOIN (
    SELECT tecnico_id, COUNT(*) AS total
    FROM ordenes_trabajo
    WHERE estado IN ('pendiente', 'en-proceso')
    GROUP BY tecnico_id
) ordenes_activas ON t.id = ordenes_activas.tecnico_id
LEFT JOIN (
    SELECT tecnico_id, COUNT(*) AS total
    FROM ordenes_trabajo
    WHERE estado IN ('completado', 'entregado')
    AND fecha_entrega >= date_trunc('month', CURRENT_DATE)
    GROUP BY tecnico_id
) ordenes_completadas ON t.id = ordenes_completadas.tecnico_id
WHERE t.activo = true;

-- =====================================================
-- COMENTARIO FINAL
-- =====================================================
-- Para ejecutar estas funciones en Supabase:
-- 1. Ir a SQL Editor en el dashboard de Supabase
-- 2. Pegar todo este contenido
-- 3. Ejecutar (Run)
-- 
-- Las funciones pueden llamarse desde JS así:
-- const { data } = await supabase.rpc('obtener_tecnico_disponible')
-- const { data } = await supabase.rpc('obtener_historial_por_placa', { placa_input: 'ABC-1234' })
-- const { data } = await supabase.rpc('calcular_proximos_mantenimientos')
