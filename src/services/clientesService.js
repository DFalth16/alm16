import { supabase } from '../lib/supabase';

// =====================================================
// SERVICIO DE CLIENTES
// =====================================================

export const clientesService = {
    // Obtener todos los clientes activos
    async getAll(options = {}) {
        const { search, limit = 50, offset = 0, orderBy = 'nombre', ascending = true } = options;

        let query = supabase
            .from('clientes')
            .select('*', { count: 'exact' })
            .eq('activo', true)
            .order(orderBy, { ascending })
            .range(offset, offset + limit - 1);

        if (search) {
            query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,telefono.ilike.%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        return { data, count };
    },

    // Obtener cliente por ID
    async getById(id) {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Obtener cliente con sus vehículos
    async getWithVehiculos(id) {
        const { data, error } = await supabase
            .from('clientes')
            .select(`
        *,
        vehiculos (*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Crear nuevo cliente
    async create(cliente) {
        const { data, error } = await supabase
            .from('clientes')
            .insert([cliente])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Actualizar cliente
    async update(id, updates) {
        const { data, error } = await supabase
            .from('clientes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Desactivar cliente (soft delete)
    async delete(id) {
        const { data, error } = await supabase
            .from('clientes')
            .update({ activo: false })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Buscar clientes
    async search(term) {
        const { data, error } = await supabase
            .from('clientes')
            .select('id, nombre, email, telefono')
            .eq('activo', true)
            .or(`nombre.ilike.%${term}%,email.ilike.%${term}%,telefono.ilike.%${term}%`)
            .limit(10);

        if (error) throw error;
        return data;
    },

    // Estadísticas de clientes
    async getStats() {
        const { count: total, error: e1 } = await supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true })
            .eq('activo', true);

        // Clientes nuevos este mes
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const { count: nuevos, error: e2 } = await supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true })
            .eq('activo', true)
            .gte('created_at', inicioMes.toISOString());

        if (e1 || e2) throw e1 || e2;
        return { total, nuevos };
    }
};
