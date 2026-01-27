-- =====================================================
-- FIX PERMISOS - EJECUTAR EN SUPABASE SQL EDITOR
-- Este script soluciona el error 401/42501
-- =====================================================

-- OPCIÓN 1: DESHABILITAR RLS COMPLETAMENTE (Recomendado para desarrollo)
-- =====================================================

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

-- =====================================================
-- GRANT PERMISOS A ANON Y AUTHENTICATED
-- =====================================================

-- Dar permisos completos al rol anon (clave pública)
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

-- Dar permisos a secuencias
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Dar permisos al rol authenticated también
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

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- VERIFICAR CONFIGURACIÓN
-- =====================================================
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'RLS ACTIVO ❌' ELSE 'RLS DESACTIVADO ✓' END as estado_rls
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
