import { supabase } from '../lib/supabase';

// =====================================================
// SERVICIO DE PROPIETARIOS (Clientes)
// Basado en tabla: propietarios + direcciones
// =====================================================

export const propietariosService = {
    // Obtener todos los propietarios activos
    async getAll(options = {}) {
        const { search, limit = 50, offset = 0, orderBy = 'nombre_completo', ascending = true } = options;

        let query = supabase
            .from('propietarios')
            .select(`
                *,
                direcciones:id_direccion (
                    id_direccion,
                    calle,
                    numero,
                    ciudad,
                    departamento,
                    pais
                )
            `, { count: 'exact' })
            .eq('activo', true)
            .order(orderBy, { ascending })
            .range(offset, offset + limit - 1);

        if (search) {
            query = query.or(`nombre_completo.ilike.%${search}%,email.ilike.%${search}%,telefono_principal.ilike.%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        return { data, count };
    },

    // Obtener propietario por ID
    async getById(id) {
        const { data, error } = await supabase
            .from('propietarios')
            .select(`
                *,
                direcciones:id_direccion (*)
            `)
            .eq('id_propietario', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Obtener propietario con sus vehículos
    async getWithVehiculos(id) {
        const { data, error } = await supabase
            .from('propietarios')
            .select(`
                *,
                direcciones:id_direccion (*),
                vehiculos (*)
            `)
            .eq('id_propietario', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Crear nuevo propietario
    async create(propietario) {
        // Si tiene dirección, crearla primero
        let id_direccion = null;
        if (propietario.direccion) {
            const { data: direccionData, error: dirError } = await supabase
                .from('direcciones')
                .insert([propietario.direccion])
                .select()
                .single();

            if (dirError) throw dirError;
            id_direccion = direccionData.id_direccion;
        }

        const { direccion, ...propData } = propietario;
        const { data, error } = await supabase
            .from('propietarios')
            .insert([{ ...propData, id_direccion }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Actualizar propietario
    async update(id, updates) {
        const { data, error } = await supabase
            .from('propietarios')
            .update(updates)
            .eq('id_propietario', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Desactivar propietario (soft delete)
    async delete(id) {
        const { data, error } = await supabase
            .from('propietarios')
            .update({ activo: false })
            .eq('id_propietario', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Buscar propietarios
    async search(term) {
        const { data, error } = await supabase
            .from('propietarios')
            .select('id_propietario, nombre_completo, email, telefono_principal')
            .eq('activo', true)
            .or(`nombre_completo.ilike.%${term}%,email.ilike.%${term}%,telefono_principal.ilike.%${term}%`)
            .limit(10);

        if (error) throw error;
        return data;
    },

    // Estadísticas de propietarios
    async getStats() {
        const { count: total, error: e1 } = await supabase
            .from('propietarios')
            .select('*', { count: 'exact', head: true })
            .eq('activo', true);

        // Propietarios nuevos este mes
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const { count: nuevos, error: e2 } = await supabase
            .from('propietarios')
            .select('*', { count: 'exact', head: true })
            .eq('activo', true)
            .gte('fecha_registro', inicioMes.toISOString());

        if (e1 || e2) throw e1 || e2;
        return { total, nuevos };
    }
};
