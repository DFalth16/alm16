import { supabase } from '../lib/supabase';

// =====================================================
// SERVICIO DE COMPONENTES (Repuestos)
// Basado en tabla: componentes
// =====================================================

export const componentesService = {
    // Obtener todos los componentes
    async getAll(options = {}) {
        const { search, limit = 50, offset = 0 } = options;

        let query = supabase
            .from('componentes')
            .select('*', { count: 'exact' })
            .order('nombre_componente', { ascending: true })
            .range(offset, offset + limit - 1);

        if (search) {
            query = query.or(`nombre_componente.ilike.%${search}%,codigo_componente.ilike.%${search}%,marca.ilike.%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        return { data, count };
    },

    // Obtener componente por ID
    async getById(id) {
        const { data, error } = await supabase
            .from('componentes')
            .select('*')
            .eq('id_componente', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Buscar componentes
    async search(term) {
        const { data, error } = await supabase
            .from('componentes')
            .select('id_componente, codigo_componente, nombre_componente, marca, precio_unitario, stock_actual')
            .or(`nombre_componente.ilike.%${term}%,codigo_componente.ilike.%${term}%`)
            .limit(10);

        if (error) throw error;
        return data;
    },

    // Crear componente
    async create(componente) {
        const { data, error } = await supabase
            .from('componentes')
            .insert([componente])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Actualizar componente
    async update(id, updates) {
        const { data, error } = await supabase
            .from('componentes')
            .update(updates)
            .eq('id_componente', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Actualizar stock
    async updateStock(id, cantidad) {
        const { data: componente, error: e1 } = await supabase
            .from('componentes')
            .select('stock_actual')
            .eq('id_componente', id)
            .single();

        if (e1) throw e1;

        const nuevoStock = (componente.stock_actual || 0) + cantidad;

        const { data, error: e2 } = await supabase
            .from('componentes')
            .update({ stock_actual: nuevoStock })
            .eq('id_componente', id)
            .select()
            .single();

        if (e2) throw e2;
        return data;
    },

    // Eliminar componente
    async delete(id) {
        const { error } = await supabase
            .from('componentes')
            .delete()
            .eq('id_componente', id);

        if (error) throw error;
        return true;
    },

    // Componentes con stock bajo
    async getStockBajo(minimo = 5) {
        const { data, error } = await supabase
            .from('componentes')
            .select('*')
            .lte('stock_actual', minimo)
            .order('stock_actual', { ascending: true });

        if (error) throw error;
        return data;
    }
};
