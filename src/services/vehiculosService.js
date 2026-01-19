import { supabase } from '../lib/supabase';

// =====================================================
// SERVICIO DE VEHÍCULOS
// =====================================================

export const vehiculosService = {
    // Obtener todos los vehículos
    async getAll(options = {}) {
        const { search, clienteId, marca, limit = 50, offset = 0 } = options;

        let query = supabase
            .from('vehiculos')
            .select(`
        *,
        clientes:cliente_id (id, nombre, telefono, email)
      `, { count: 'exact' })
            .eq('activo', true)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (search) {
            query = query.or(`marca.ilike.%${search}%,modelo.ilike.%${search}%,placa.ilike.%${search}%`);
        }

        if (clienteId) {
            query = query.eq('cliente_id', clienteId);
        }

        if (marca) {
            query = query.eq('marca', marca);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        return { data, count };
    },

    // Obtener vehículo por ID
    async getById(id) {
        const { data, error } = await supabase
            .from('vehiculos')
            .select(`
        *,
        clientes:cliente_id (*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Obtener vehículos de un cliente
    async getByClienteId(clienteId) {
        const { data, error } = await supabase
            .from('vehiculos')
            .select('*')
            .eq('cliente_id', clienteId)
            .eq('activo', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Crear nuevo vehículo
    async create(vehiculo) {
        const { data, error } = await supabase
            .from('vehiculos')
            .insert([vehiculo])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Actualizar vehículo
    async update(id, updates) {
        const { data, error } = await supabase
            .from('vehiculos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Actualizar kilometraje
    async updateKilometraje(id, kilometraje) {
        const { data, error } = await supabase
            .from('vehiculos')
            .update({ kilometraje, ultimo_servicio: new Date().toISOString().split('T')[0] })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Desactivar vehículo
    async delete(id) {
        const { data, error } = await supabase
            .from('vehiculos')
            .update({ activo: false })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Obtener marcas únicas
    async getMarcas() {
        const { data, error } = await supabase
            .from('vehiculos')
            .select('marca')
            .eq('activo', true);

        if (error) throw error;

        const marcasUnicas = [...new Set(data.map(v => v.marca))].sort();
        return marcasUnicas;
    },

    // Buscar vehículos por placa
    async searchByPlaca(placa) {
        const { data, error } = await supabase
            .from('vehiculos')
            .select(`
        id, marca, modelo, anio, placa,
        clientes:cliente_id (id, nombre)
      `)
            .eq('activo', true)
            .ilike('placa', `%${placa}%`)
            .limit(10);

        if (error) throw error;
        return data;
    },

    // Estadísticas
    async getStats() {
        const { count, error } = await supabase
            .from('vehiculos')
            .select('*', { count: 'exact', head: true })
            .eq('activo', true);

        if (error) throw error;
        return { total: count };
    }
};
