import { supabase } from '../lib/supabase';

// =====================================================
// SERVICIO DE REPORTES Y ESTADÍSTICAS
// =====================================================

export const reportesService = {
    // Dashboard - Estadísticas generales
    async getDashboardStats() {
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

        // Órdenes activas
        const { count: ordenesActivas } = await supabase
            .from('ordenes_trabajo')
            .select('*', { count: 'exact', head: true })
            .in('estado', ['pendiente', 'en-proceso']);

        // Clientes totales
        const { count: totalClientes } = await supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true })
            .eq('activo', true);

        // Vehículos totales
        const { count: totalVehiculos } = await supabase
            .from('vehiculos')
            .select('*', { count: 'exact', head: true })
            .eq('activo', true);

        // Citas próximas (7 días)
        const en7Dias = new Date(hoy);
        en7Dias.setDate(hoy.getDate() + 7);

        const { count: citasProximas } = await supabase
            .from('citas')
            .select('*', { count: 'exact', head: true })
            .gte('fecha', hoy.toISOString().split('T')[0])
            .lte('fecha', en7Dias.toISOString().split('T')[0])
            .neq('estado', 'cancelada');

        // Ingresos del mes
        const { data: ordenesCompletadas } = await supabase
            .from('ordenes_trabajo')
            .select('costo_total')
            .in('estado', ['completado', 'entregado'])
            .gte('fecha_entrega', inicioMes.toISOString())
            .lte('fecha_entrega', finMes.toISOString());

        const ingresosMes = ordenesCompletadas?.reduce((sum, o) => sum + (o.costo_total || 0), 0) || 0;

        // Garantías activas
        const { count: garantiasActivas } = await supabase
            .from('garantias')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'activa');

        return {
            ordenesActivas: ordenesActivas || 0,
            totalClientes: totalClientes || 0,
            totalVehiculos: totalVehiculos || 0,
            citasProximas: citasProximas || 0,
            ingresosMes,
            garantiasActivas: garantiasActivas || 0
        };
    },

    // Reporte de ingresos por período
    async getReporteIngresos(fechaDesde, fechaHasta) {
        const { data, error } = await supabase
            .from('ordenes_trabajo')
            .select(`
        fecha_entrega,
        costo_total,
        costo_mano_obra,
        costo_repuestos,
        tipos_servicio:tipo_servicio_id (nombre)
      `)
            .in('estado', ['completado', 'entregado'])
            .gte('fecha_entrega', fechaDesde)
            .lte('fecha_entrega', fechaHasta)
            .order('fecha_entrega', { ascending: true });

        if (error) throw error;

        // Agrupar por día
        const ingresosPorDia = data.reduce((acc, orden) => {
            const fecha = orden.fecha_entrega?.split('T')[0];
            if (fecha) {
                if (!acc[fecha]) {
                    acc[fecha] = { total: 0, manoObra: 0, repuestos: 0, cantidad: 0 };
                }
                acc[fecha].total += orden.costo_total || 0;
                acc[fecha].manoObra += orden.costo_mano_obra || 0;
                acc[fecha].repuestos += orden.costo_repuestos || 0;
                acc[fecha].cantidad += 1;
            }
            return acc;
        }, {});

        // Ingresos por tipo de servicio
        const ingresosPorTipo = data.reduce((acc, orden) => {
            const tipo = orden.tipos_servicio?.nombre || 'Sin tipo';
            if (!acc[tipo]) {
                acc[tipo] = { total: 0, cantidad: 0 };
            }
            acc[tipo].total += orden.costo_total || 0;
            acc[tipo].cantidad += 1;
            return acc;
        }, {});

        const totalIngresos = data.reduce((sum, o) => sum + (o.costo_total || 0), 0);
        const totalOrdenes = data.length;

        return {
            ingresosPorDia,
            ingresosPorTipo,
            totalIngresos,
            totalOrdenes,
            promedioOrden: totalOrdenes > 0 ? totalIngresos / totalOrdenes : 0
        };
    },

    // Reporte de rendimiento de técnicos
    async getReporteTecnicos(fechaDesde, fechaHasta) {
        const { data: tecnicos, error: e1 } = await supabase
            .from('tecnicos')
            .select('id, nombre, especialidad, calificacion')
            .eq('activo', true);

        if (e1) throw e1;

        const reporteTecnicos = await Promise.all(tecnicos.map(async (tecnico) => {
            // Órdenes completadas
            const { data: ordenes, error: e2 } = await supabase
                .from('ordenes_trabajo')
                .select('costo_total, fecha_ingreso, fecha_entrega')
                .eq('tecnico_id', tecnico.id)
                .in('estado', ['completado', 'entregado'])
                .gte('fecha_entrega', fechaDesde)
                .lte('fecha_entrega', fechaHasta);

            if (e2) throw e2;

            const ordenesCompletadas = ordenes?.length || 0;
            const ingresos = ordenes?.reduce((sum, o) => sum + (o.costo_total || 0), 0) || 0;

            // Calcular tiempo promedio de servicio
            let tiempoPromedioHoras = 0;
            if (ordenes && ordenes.length > 0) {
                const tiempos = ordenes
                    .filter(o => o.fecha_ingreso && o.fecha_entrega)
                    .map(o => {
                        const inicio = new Date(o.fecha_ingreso);
                        const fin = new Date(o.fecha_entrega);
                        return (fin - inicio) / (1000 * 60 * 60); // Horas
                    });

                if (tiempos.length > 0) {
                    tiempoPromedioHoras = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
                }
            }

            return {
                ...tecnico,
                ordenesCompletadas,
                ingresos,
                tiempoPromedioHoras: Math.round(tiempoPromedioHoras * 10) / 10
            };
        }));

        return reporteTecnicos.sort((a, b) => b.ordenesCompletadas - a.ordenesCompletadas);
    },

    // Reporte de clientes frecuentes
    async getClientesFrecuentes(limit = 10) {
        const { data, error } = await supabase
            .from('historial_servicios')
            .select(`
        cliente_id,
        costo_total,
        clientes:cliente_id (id, nombre, telefono, email)
      `);

        if (error) throw error;

        // Agrupar por cliente
        const clientesAgrupados = data.reduce((acc, h) => {
            const clienteId = h.cliente_id;
            if (!acc[clienteId]) {
                acc[clienteId] = {
                    cliente: h.clientes,
                    visitas: 0,
                    gastoTotal: 0
                };
            }
            acc[clienteId].visitas += 1;
            acc[clienteId].gastoTotal += h.costo_total || 0;
            return acc;
        }, {});

        const clientesOrdenados = Object.values(clientesAgrupados)
            .sort((a, b) => b.visitas - a.visitas)
            .slice(0, limit);

        return clientesOrdenados;
    },

    // Reporte de servicios más solicitados
    async getServiciosMasSolicitados(fechaDesde, fechaHasta) {
        const { data, error } = await supabase
            .from('ordenes_servicios')
            .select(`
        nombre_servicio,
        precio_total,
        ordenes_trabajo!inner (fecha_ingreso, estado)
      `)
            .in('ordenes_trabajo.estado', ['completado', 'entregado'])
            .gte('ordenes_trabajo.fecha_ingreso', fechaDesde)
            .lte('ordenes_trabajo.fecha_ingreso', fechaHasta);

        if (error) throw error;

        // Agrupar por servicio
        const serviciosAgrupados = data.reduce((acc, s) => {
            const nombre = s.nombre_servicio;
            if (!acc[nombre]) {
                acc[nombre] = { cantidad: 0, ingresos: 0 };
            }
            acc[nombre].cantidad += 1;
            acc[nombre].ingresos += s.precio_total || 0;
            return acc;
        }, {});

        const serviciosOrdenados = Object.entries(serviciosAgrupados)
            .map(([nombre, datos]) => ({ nombre, ...datos }))
            .sort((a, b) => b.cantidad - a.cantidad);

        return serviciosOrdenados;
    },

    // Reporte de garantías
    async getReporteGarantias() {
        const hoy = new Date().toISOString().split('T')[0];
        const en30Dias = new Date();
        en30Dias.setDate(en30Dias.getDate() + 30);
        const en90Dias = new Date();
        en90Dias.setDate(en90Dias.getDate() + 90);

        // Por estado
        const estados = ['activa', 'vencida', 'reclamada'];
        const garantiasPorEstado = {};

        for (const estado of estados) {
            const { count } = await supabase
                .from('garantias')
                .select('*', { count: 'exact', head: true })
                .eq('estado', estado);

            garantiasPorEstado[estado] = count || 0;
        }

        // Próximas a vencer (30 días)
        const { count: proximas30 } = await supabase
            .from('garantias')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'activa')
            .gte('fecha_vencimiento', hoy)
            .lte('fecha_vencimiento', en30Dias.toISOString().split('T')[0]);

        // Próximas a vencer (90 días)
        const { count: proximas90 } = await supabase
            .from('garantias')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'activa')
            .gte('fecha_vencimiento', hoy)
            .lte('fecha_vencimiento', en90Dias.toISOString().split('T')[0]);

        // Reclamos pendientes
        const { count: reclamosPendientes } = await supabase
            .from('reclamos_garantia')
            .select('*', { count: 'exact', head: true })
            .in('estado', ['pendiente', 'en_proceso']);

        return {
            garantiasPorEstado,
            proximasVencer30: proximas30 || 0,
            proximasVencer90: proximas90 || 0,
            reclamosPendientes: reclamosPendientes || 0
        };
    },

    // Resumen general para reportes
    async getResumenGeneral(fechaDesde, fechaHasta) {
        const [ingresos, tecnicos, clientesFrecuentes, servicios, garantias] = await Promise.all([
            this.getReporteIngresos(fechaDesde, fechaHasta),
            this.getReporteTecnicos(fechaDesde, fechaHasta),
            this.getClientesFrecuentes(5),
            this.getServiciosMasSolicitados(fechaDesde, fechaHasta),
            this.getReporteGarantias()
        ]);

        return {
            ingresos,
            tecnicos,
            clientesFrecuentes,
            serviciosMasSolicitados: servicios.slice(0, 10),
            garantias
        };
    }
};
