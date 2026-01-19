import { supabase } from '../lib/supabase';

// =====================================================
// SERVICIO DE GARANTÍAS
// =====================================================

export const garantiasService = {
    // Obtener todas las garantías
    async getAll(options = {}) {
        const { estado, clienteId, vehiculoId, tipo, limit = 50, offset = 0 } = options;

        let query = supabase
            .from('garantias')
            .select(`
        *,
        clientes:cliente_id (id, nombre, telefono, email),
        vehiculos:vehiculo_id (id, marca, modelo, placa, anio, kilometraje)
      `, { count: 'exact' })
            .order('fecha_vencimiento', { ascending: true })
            .range(offset, offset + limit - 1);

        if (estado) {
            query = query.eq('estado', estado);
        }

        if (clienteId) {
            query = query.eq('cliente_id', clienteId);
        }

        if (vehiculoId) {
            query = query.eq('vehiculo_id', vehiculoId);
        }

        if (tipo) {
            query = query.eq('tipo', tipo);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        return { data, count };
    },

    // Obtener garantía por ID
    async getById(id) {
        const { data, error } = await supabase
            .from('garantias')
            .select(`
        *,
        clientes:cliente_id (*),
        vehiculos:vehiculo_id (*),
        orden_origen:orden_origen_id (*),
        reclamos_garantia (*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Obtener garantías activas
    async getActivas() {
        const { data, error } = await supabase
            .from('garantias')
            .select(`
        *,
        clientes:cliente_id (id, nombre, telefono),
        vehiculos:vehiculo_id (id, marca, modelo, placa, kilometraje)
      `)
            .eq('estado', 'activa')
            .order('fecha_vencimiento', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Obtener garantías próximas a vencer (próximos 90 días)
    async getProximasVencer(dias = 90) {
        const hoy = new Date();
        const fechaLimite = new Date(hoy);
        fechaLimite.setDate(hoy.getDate() + dias);

        const { data, error } = await supabase
            .from('garantias')
            .select(`
        *,
        clientes:cliente_id (id, nombre, telefono),
        vehiculos:vehiculo_id (id, marca, modelo, placa)
      `)
            .eq('estado', 'activa')
            .gte('fecha_vencimiento', hoy.toISOString().split('T')[0])
            .lte('fecha_vencimiento', fechaLimite.toISOString().split('T')[0])
            .order('fecha_vencimiento', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Obtener garantías de un vehículo
    async getByVehiculoId(vehiculoId) {
        const { data, error } = await supabase
            .from('garantias')
            .select('*')
            .eq('vehiculo_id', vehiculoId)
            .order('fecha_vencimiento', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Verificar si un vehículo tiene garantía activa
    async verificarGarantia(vehiculoId, kilometrajeActual = null) {
        const hoy = new Date().toISOString().split('T')[0];

        let query = supabase
            .from('garantias')
            .select('*')
            .eq('vehiculo_id', vehiculoId)
            .eq('estado', 'activa')
            .gte('fecha_vencimiento', hoy);

        const { data, error } = await query;

        if (error) throw error;

        // Filtrar por kilometraje si se proporciona
        if (kilometrajeActual !== null) {
            return data.filter(g =>
                g.kilometraje_maximo === null || g.kilometraje_maximo >= kilometrajeActual
            );
        }

        return data;
    },

    // Crear nueva garantía
    async create(garantia) {
        const { data, error } = await supabase
            .from('garantias')
            .insert([garantia])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Actualizar garantía
    async update(id, updates) {
        const { data, error } = await supabase
            .from('garantias')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Cambiar estado de garantía
    async cambiarEstado(id, nuevoEstado) {
        const { data, error } = await supabase
            .from('garantias')
            .update({ estado: nuevoEstado })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Actualizar garantías vencidas
    async actualizarVencidas() {
        const hoy = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('garantias')
            .update({ estado: 'vencida' })
            .eq('estado', 'activa')
            .lt('fecha_vencimiento', hoy)
            .select();

        if (error) throw error;
        return data;
    },

    // Registrar reclamo de garantía
    async registrarReclamo(reclamo) {
        const { data, error } = await supabase
            .from('reclamos_garantia')
            .insert([reclamo])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Obtener reclamos de una garantía
    async getReclamos(garantiaId) {
        const { data, error } = await supabase
            .from('reclamos_garantia')
            .select(`
        *,
        ordenes_trabajo:orden_id (numero_orden, descripcion, estado)
      `)
            .eq('garantia_id', garantiaId)
            .order('fecha_reclamo', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Actualizar estado de reclamo
    async actualizarReclamo(reclamoId, updates) {
        const { data, error } = await supabase
            .from('reclamos_garantia')
            .update(updates)
            .eq('id', reclamoId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Estadísticas de garantías
    async getStats() {
        const hoy = new Date().toISOString().split('T')[0];
        const en90Dias = new Date();
        en90Dias.setDate(en90Dias.getDate() + 90);

        // Activas
        const { count: activas, error: e1 } = await supabase
            .from('garantias')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'activa');

        // Próximas a vencer
        const { count: proximasVencer, error: e2 } = await supabase
            .from('garantias')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'activa')
            .gte('fecha_vencimiento', hoy)
            .lte('fecha_vencimiento', en90Dias.toISOString().split('T')[0]);

        // Vencidas
        const { count: vencidas, error: e3 } = await supabase
            .from('garantias')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'vencida');

        if (e1 || e2 || e3) throw e1 || e2 || e3;

        return {
            activas,
            proximasVencer,
            vencidas
        };
    },

    // Obtener tipos de garantía únicos
    async getTipos() {
        const { data, error } = await supabase
            .from('garantias')
            .select('tipo');

        if (error) throw error;

        const tipos = [...new Set(data.map(g => g.tipo).filter(Boolean))];
        return tipos.sort();
    }
};
