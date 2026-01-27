-- =====================================================
-- DESHABILITAR RLS PARA DESARROLLO
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Deshabilitar RLS en todas las tablas
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_trabajo DISABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_servicios DISABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_historial DISABLE ROW LEVEL SECURITY;
ALTER TABLE citas DISABLE ROW LEVEL SECURITY;
ALTER TABLE garantias DISABLE ROW LEVEL SECURITY;
ALTER TABLE reclamos_garantia DISABLE ROW LEVEL SECURITY;
ALTER TABLE historial_servicios DISABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_servicio DISABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_catalogo DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS esté deshabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
