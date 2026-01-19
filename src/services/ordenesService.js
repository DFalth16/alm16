import { supabase } from '../lib/supabase';

// =====================================================
// SERVICIO DE ÓRDENES DE TRABAJO
// =====================================================

export const ordenesService = {
    // Obtener todas las órdenes
    async getAll(options = {}) {
        const { estado, clienteId, vehiculoId, tecnicoId, fechaDesde, fechaHasta, limit = 50, offset = 0 } = options;

        let query = supabase
            .from('ordenes_trabajo')
            .select(`
        *,
        clientes:cliente_id (id, nombre, telefono, email),
        vehiculos:vehiculo_id (id, marca, modelo, placa, anio),
        tecnicos:tecnico_id (id, nombre, especialidad),
        tipos_servicio:tipo_servicio_id (id, nombre, color)
      `, { count: 'exact' })
            .order('fecha_ingreso', { ascending: false })
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

        if (tecnicoId) {
            query = query.eq('tecnico_id', tecnicoId);
        }

        if (fechaDesde) {
            query = query.gte('fecha_ingreso', fechaDesde);
        }

        if (fechaHasta) {
            query = query.lte('fecha_ingreso', fechaHasta);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        return { data, count };
    },

    // Obtener orden por ID con todos los detalles
    async getById(id) {
        const { data, error } = await supabase
            .from('ordenes_trabajo')
            .select(`
        *,
        clientes:cliente_id (*),
        vehiculos:vehiculo_id (*),
        tecnicos:tecnico_id (*),
        tipos_servicio:tipo_servicio_id (*),
        ordenes_servicios (*),
        ordenes_historial (*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Obtener órdenes activas (pendientes o en proceso)
    async getActivas() {
        const { data, error } = await supabase
            .from('ordenes_trabajo')
            .select(`
        *,
        clientes:cliente_id (id, nombre, telefono),
        vehiculos:vehiculo_id (id, marca, modelo, placa),
        tecnicos:tecnico_id (id, nombre)
      `)
            .in('estado', ['pendiente', 'en-proceso'])
            .order('prioridad', { ascending: false })
            .order('fecha_ingreso', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Crear nueva orden
    async create(orden) {
        const { data, error } = await supabase
            .from('ordenes_trabajo')
            .insert([orden])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Actualizar orden
    async update(id, updates) {
        const { data, error } = await supabase
            .from('ordenes_trabajo')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Cambiar estado de orden
    async cambiarEstado(id, nuevoEstado, comentario = null) {
        const updates = { estado: nuevoEstado };

        if (nuevoEstado === 'entregado') {
            updates.fecha_entrega = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('ordenes_trabajo')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Asignar técnico
    async asignarTecnico(ordenId, tecnicoId) {
        const { data, error } = await supabase
            .from('ordenes_trabajo')
            .update({ tecnico_id: tecnicoId })
            .eq('id', ordenId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Agregar servicio a la orden
    async agregarServicio(ordenId, servicio) {
        const { data, error } = await supabase
            .from('ordenes_servicios')
            .insert([{
                orden_id: ordenId,
                ...servicio
            }])
            .select()
            .single();

        if (error) throw error;

        // Recalcular costo total
        await this.recalcularCostoTotal(ordenId);

        return data;
    },

    // Obtener servicios de una orden
    async getServicios(ordenId) {
        const { data, error } = await supabase
            .from('ordenes_servicios')
            .select('*')
            .eq('orden_id', ordenId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Marcar servicio como completado
    async completarServicio(servicioId) {
        const { data, error } = await supabase
            .from('ordenes_servicios')
            .update({
                completado: true,
                fecha_completado: new Date().toISOString()
            })
            .eq('id', servicioId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Eliminar servicio de la orden
    async eliminarServicio(servicioId, ordenId) {
        const { error } = await supabase
            .from('ordenes_servicios')
            .delete()
            .eq('id', servicioId);

        if (error) throw error;

        // Recalcular costo total
        await this.recalcularCostoTotal(ordenId);

        return true;
    },

    // Recalcular costo total de la orden
    async recalcularCostoTotal(ordenId) {
        const { data: servicios, error: e1 } = await supabase
            .from('ordenes_servicios')
            .select('precio_total')
            .eq('orden_id', ordenId);

        if (e1) throw e1;

        const costoTotal = servicios.reduce((sum, s) => sum + (s.precio_total || 0), 0);

        const { error: e2 } = await supabase
            .from('ordenes_trabajo')
            .update({ costo_total: costoTotal })
            .eq('id', ordenId);

        if (e2) throw e2;

        return costoTotal;
    },

    // Obtener historial de una orden
    async getHistorial(ordenId) {
        const { data, error } = await supabase
            .from('ordenes_historial')
            .select('*')
            .eq('orden_id', ordenId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Estadísticas de órdenes
    async getStats() {
        const estados = ['pendiente', 'en-proceso', 'completado', 'entregado'];
        const stats = {};

        for (const estado of estados) {
            const { count, error } = await supabase
                .from('ordenes_trabajo')
                .select('*', { count: 'exact', head: true })
                .eq('estado', estado);

            if (error) throw error;
            stats[estado] = count;
        }

        // Total
        const { count: total, error: e1 } = await supabase
            .from('ordenes_trabajo')
            .select('*', { count: 'exact', head: true });

        if (e1) throw e1;
        stats.total = total;

        // Ingresos del mes
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const { data: ordenesCompletadas, error: e2 } = await supabase
            .from('ordenes_trabajo')
            .select('costo_total')
            .in('estado', ['completado', 'entregado'])
            .gte('fecha_entrega', inicioMes.toISOString());

        if (e2) throw e2;

        stats.ingresosMes = ordenesCompletadas.reduce((sum, o) => sum + (o.costo_total || 0), 0);

        return stats;
    },

    // Buscar órdenes
    async search(term) {
        // Buscar por número de orden
        const numeroOrden = parseInt(term);

        let query = supabase
            .from('ordenes_trabajo')
            .select(`
        id, numero_orden, estado, descripcion,
        clientes:cliente_id (nombre),
        vehiculos:vehiculo_id (marca, modelo, placa)
      `)
            .limit(10);

        if (!isNaN(numeroOrden)) {
            query = query.eq('numero_orden', numeroOrden);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }
};
