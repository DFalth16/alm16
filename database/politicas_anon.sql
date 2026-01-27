-- =====================================================
-- POLÍTICAS RLS PARA USUARIOS ANÓNIMOS
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Esto permite que la aplicación funcione sin autenticación
-- En producción, deberías implementar autenticación y usar las políticas de authenticated

-- CLIENTES
CREATE POLICY "Anon puede leer clientes" ON clientes FOR SELECT TO anon USING (true);
CREATE POLICY "Anon puede insertar clientes" ON clientes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon puede actualizar clientes" ON clientes FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon puede eliminar clientes" ON clientes FOR DELETE TO anon USING (true);

-- VEHICULOS
CREATE POLICY "Anon puede leer vehiculos" ON vehiculos FOR SELECT TO anon USING (true);
CREATE POLICY "Anon puede insertar vehiculos" ON vehiculos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon puede actualizar vehiculos" ON vehiculos FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon puede eliminar vehiculos" ON vehiculos FOR DELETE TO anon USING (true);

-- TECNICOS
CREATE POLICY "Anon puede leer tecnicos" ON tecnicos FOR SELECT TO anon USING (true);
CREATE POLICY "Anon puede insertar tecnicos" ON tecnicos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon puede actualizar tecnicos" ON tecnicos FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon puede eliminar tecnicos" ON tecnicos FOR DELETE TO anon USING (true);

-- TIPOS_SERVICIO
CREATE POLICY "Anon puede leer tipos_servicio" ON tipos_servicio FOR SELECT TO anon USING (true);
CREATE POLICY "Anon puede insertar tipos_servicio" ON tipos_servicio FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon puede actualizar tipos_servicio" ON tipos_servicio FOR UPDATE TO anon USING (true);

-- ORDENES_TRABAJO
CREATE POLICY "Anon puede leer ordenes_trabajo" ON ordenes_trabajo FOR SELECT TO anon USING (true);
CREATE POLICY "Anon puede insertar ordenes_trabajo" ON ordenes_trabajo FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon puede actualizar ordenes_trabajo" ON ordenes_trabajo FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon puede eliminar ordenes_trabajo" ON ordenes_trabajo FOR DELETE TO anon USING (true);

-- ORDENES_SERVICIOS
CREATE POLICY "Anon puede leer ordenes_servicios" ON ordenes_servicios FOR SELECT TO anon USING (true);
CREATE POLICY "Anon puede insertar ordenes_servicios" ON ordenes_servicios FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon puede actualizar ordenes_servicios" ON ordenes_servicios FOR UPDATE TO anon USING (true);

-- ORDENES_HISTORIAL
CREATE POLICY "Anon puede leer ordenes_historial" ON ordenes_historial FOR SELECT TO anon USING (true);

-- CITAS
CREATE POLICY "Anon puede leer citas" ON citas FOR SELECT TO anon USING (true);
CREATE POLICY "Anon puede insertar citas" ON citas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon puede actualizar citas" ON citas FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon puede eliminar citas" ON citas FOR DELETE TO anon USING (true);

-- GARANTIAS
CREATE POLICY "Anon puede leer garantias" ON garantias FOR SELECT TO anon USING (true);
CREATE POLICY "Anon puede insertar garantias" ON garantias FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon puede actualizar garantias" ON garantias FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon puede eliminar garantias" ON garantias FOR DELETE TO anon USING (true);

-- HISTORIAL_SERVICIOS
CREATE POLICY "Anon puede leer historial_servicios" ON historial_servicios FOR SELECT TO anon USING (true);
CREATE POLICY "Anon puede insertar historial_servicios" ON historial_servicios FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon puede actualizar historial_servicios" ON historial_servicios FOR UPDATE TO anon USING (true);

-- SERVICIOS_CATALOGO
CREATE POLICY "Anon puede leer servicios_catalogo" ON servicios_catalogo FOR SELECT TO anon USING (true);

-- CONFIGURACION  
CREATE POLICY "Anon puede leer configuracion" ON configuracion FOR SELECT TO anon USING (true);
