-- =====================================================
-- SOLUCIÓN COMPLETA PARA PERMISOS - EJECUTAR TODO JUNTO
-- =====================================================

-- 1. Deshabilitar RLS en todas las tablas
ALTER TABLE IF EXISTS clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehiculos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tecnicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ordenes_trabajo DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ordenes_servicios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ordenes_historial DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS citas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS garantias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reclamos_garantia DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS historial_servicios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tipos_servicio DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS servicios_catalogo DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS configuracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notificaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS usuarios DISABLE ROW LEVEL SECURITY;

-- 2. Otorgar permisos completos al rol anon
GRANT ALL ON clientes TO anon;
GRANT ALL ON vehiculos TO anon;
GRANT ALL ON tecnicos TO anon;
GRANT ALL ON ordenes_trabajo TO anon;
GRANT ALL ON ordenes_servicios TO anon;
GRANT ALL ON ordenes_historial TO anon;
GRANT ALL ON citas TO anon;
GRANT ALL ON garantias TO anon;
GRANT ALL ON reclamos_garantia TO anon;
GRANT ALL ON historial_servicios TO anon;
GRANT ALL ON tipos_servicio TO anon;
GRANT ALL ON servicios_catalogo TO anon;
GRANT ALL ON configuracion TO anon;

-- 3. Otorgar permisos a authenticated también
GRANT ALL ON clientes TO authenticated;
GRANT ALL ON vehiculos TO authenticated;
GRANT ALL ON tecnicos TO authenticated;
GRANT ALL ON ordenes_trabajo TO authenticated;
GRANT ALL ON ordenes_servicios TO authenticated;
GRANT ALL ON ordenes_historial TO authenticated;
GRANT ALL ON citas TO authenticated;
GRANT ALL ON garantias TO authenticated;
GRANT ALL ON reclamos_garantia TO authenticated;
GRANT ALL ON historial_servicios TO authenticated;
GRANT ALL ON tipos_servicio TO authenticated;
GRANT ALL ON servicios_catalogo TO authenticated;
GRANT ALL ON configuracion TO authenticated;

-- 4. Otorgar acceso a secuencias (para INSERT con SERIAL)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. Verificar que funcionó
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
