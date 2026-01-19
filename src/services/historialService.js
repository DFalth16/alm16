import { supabase } from '../lib/supabase';

// =====================================================
// SERVICIO DE HISTORIAL DE SERVICIOS
// =====================================================

export const historialService = {
    // Obtener historial completo
    async getAll(options = {}) {
        const {
            clienteId,
            vehiculoId,
            tecnicoId,
            tipoServicio,
            fechaDesde,
            fechaHasta,
            limit = 50,
            offset = 0
        } = options;

        let query = supabase
            .from('historial_servicios')
            .select(`
        *,
        clientes:cliente_id (id, nombre, telefono),
        vehiculos:vehiculo_id (id, marca, modelo, placa),
        tecnicos:tecnico_id (id, nombre, especialidad),
        ordenes_trabajo:orden_id (numero_orden)
      `, { count: 'exact' })
            .order('fecha', { ascending: false })
            .range(offset, offset + limit - 1);

        if (clienteId) {
            query = query.eq('cliente_id', clienteId);
        }

        if (vehiculoId) {
            query = query.eq('vehiculo_id', vehiculoId);
        }

        if (tecnicoId) {
            query = query.eq('tecnico_id', tecnicoId);
        }

        if (tipoServicio) {
            query = query.eq('tipo_servicio', tipoServicio);
        }

        if (fechaDesde) {
            query = query.gte('fecha', fechaDesde);
        }

        if (fechaHasta) {
            query = query.lte('fecha', fechaHasta);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        return { data, count };
    },

    // Obtener historial de un vehículo
    async getByVehiculoId(vehiculoId) {
        const { data, error } = await supabase
            .from('historial_servicios')
            .select(`
        *,
        tecnicos:tecnico_id (id, nombre)
      `)
            .eq('vehiculo_id', vehiculoId)
            .order('fecha', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Obtener historial de un cliente
    async getByClienteId(clienteId) {
        const { data, error } = await supabase
            .from('historial_servicios')
            .select(`
        *,
        vehiculos:vehiculo_id (id, marca, modelo, placa),
        tecnicos:tecnico_id (id, nombre)
      `)
            .eq('cliente_id', clienteId)
            .order('fecha', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Registrar en historial (llamado automáticamente cuando se entrega una orden)
    async registrar(historial) {
        const { data, error } = await supabase
            .from('historial_servicios')
            .insert([historial])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Registrar desde orden completada
    async registrarDesdeOrden(ordenId) {
        // Obtener datos de la orden
        const { data: orden, error: e1 } = await supabase
            .from('ordenes_trabajo')
            .select(`
        *,
        ordenes_servicios (nombre_servicio)
      `)
            .eq('id', ordenId)
            .single();

        if (e1) throw e1;

        // Crear registro de historial
        const historial = {
            orden_id: ordenId,
            cliente_id: orden.cliente_id,
            vehiculo_id: orden.vehiculo_id,
            tecnico_id: orden.tecnico_id,
            fecha: new Date().toISOString().split('T')[0],
            tipo_servicio: orden.tipo_servicio_id,
            servicios_realizados: orden.ordenes_servicios.map(s => s.nombre_servicio),
            kilometraje: orden.kilometraje_ingreso,
            costo_total: orden.costo_total,
            genera_garantia: orden.garantia_aplicada,
            observaciones: orden.observaciones
        };

        const { data, error: e2 } = await supabase
            .from('historial_servicios')
            .insert([historial])
            .select()
            .single();

        if (e2) throw e2;
        return data;
    },

    // Agregar calificación del cliente
    async agregarCalificacion(historialId, calificacion, comentario = null) {
        const { data, error } = await supabase
            .from('historial_servicios')
            .update({
                calificacion_cliente: calificacion,
                comentario_cliente: comentario
            })
            .eq('id', historialId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Estadísticas del historial
    async getStats(options = {}) {
        const { fechaDesde, fechaHasta } = options;

        let query = supabase
            .from('historial_servicios')
            .select('costo_total, tipo_servicio, cliente_id, vehiculo_id');

        if (fechaDesde) {
            query = query.gte('fecha', fechaDesde);
        }

        if (fechaHasta) {
            query = query.lte('fecha', fechaHasta);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Calcular estadísticas
        const totalServicios = data.length;
        const ingresosTotales = data.reduce((sum, h) => sum + (h.costo_total || 0), 0);
        const promedioServicio = totalServicios > 0 ? ingresosTotales / totalServicios : 0;
        const clientesUnicos = new Set(data.map(h => h.cliente_id)).size;
        const vehiculosUnicos = new Set(data.map(h => h.vehiculo_id)).size;

        // Servicios por tipo
        const serviciosPorTipo = data.reduce((acc, h) => {
            const tipo = h.tipo_servicio || 'Sin tipo';
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        }, {});

        return {
            totalServicios,
            ingresosTotales,
            promedioServicio: Math.round(promedioServicio * 100) / 100,
            clientesUnicos,
            vehiculosUnicos,
            serviciosPorTipo
        };
    },

    // Obtener tipos de servicio en historial
    async getTiposServicio() {
        const { data, error } = await supabase
            .from('historial_servicios')
            .select('tipo_servicio');

        if (error) throw error;

        const tipos = [...new Set(data.map(h => h.tipo_servicio).filter(Boolean))];
        return tipos.sort();
    },

    // Exportar historial a formato para reporte
    async exportar(options = {}) {
        const { data, error } = await this.getAll({ ...options, limit: 10000 });

        if (error) throw error;

        // Formatear datos para exportación
        return data.map(h => ({
            fecha: h.fecha,
            cliente: h.clientes?.nombre,
            vehiculo: `${h.vehiculos?.marca} ${h.vehiculos?.modelo}`,
            placa: h.vehiculos?.placa,
            tipoServicio: h.tipo_servicio,
            servicios: h.servicios_realizados?.join(', '),
            kilometraje: h.kilometraje,
            costo: h.costo_total,
            tecnico: h.tecnicos?.nombre,
            calificacion: h.calificacion_cliente,
            observaciones: h.observaciones
        }));
    }
};
