import { supabase } from '../lib/supabase';

// =====================================================
// SERVICIO DE ALERTAS Y POST-VENTA
// =====================================================

export const alertasService = {
    // Obtener vehículos que necesitan mantenimiento próximo
    async getProximosMantenimientos(intervaloKm = 10000, intervaloMeses = 6) {
        const { data, error } = await supabase.rpc('calcular_proximos_mantenimientos', {
            intervalo_km: intervaloKm,
            intervalo_meses: intervaloMeses
        });

        if (error) {
            console.error('Error al obtener próximos mantenimientos:', error);
            // Fallback: cálculo manual
            return this.calcularMantenimientosManual();
        }

        return data || [];
    },

    // Cálculo manual de mantenimientos (fallback si no existe la función RPC)
    async calcularMantenimientosManual() {
        const seisMesesAtras = new Date();
        seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

        const { data: vehiculos, error } = await supabase
            .from('vehiculos')
            .select(`
                *,
                clientes:cliente_id (id, nombre, telefono, email)
            `)
            .eq('activo', true)
            .or(`ultimo_servicio.lt.${seisMesesAtras.toISOString().split('T')[0]},ultimo_servicio.is.null`);

        if (error) throw error;

        // Calcular urgencia
        return vehiculos.map(v => {
            const diasDesdeServicio = v.ultimo_servicio
                ? Math.floor((new Date() - new Date(v.ultimo_servicio)) / (1000 * 60 * 60 * 24))
                : 999;

            let urgencia = 'ok';
            if (diasDesdeServicio > 270) urgencia = 'critico';
            else if (diasDesdeServicio > 180) urgencia = 'urgente';
            else if (diasDesdeServicio > 144) urgencia = 'proximo';

            return {
                vehiculo_id: v.id,
                cliente_id: v.cliente_id,
                cliente_nombre: v.clientes?.nombre,
                cliente_telefono: v.clientes?.telefono,
                vehiculo_marca: v.marca,
                vehiculo_modelo: v.modelo,
                vehiculo_placa: v.placa,
                kilometraje_actual: v.kilometraje,
                ultimo_servicio: v.ultimo_servicio,
                dias_desde_ultimo_servicio: diasDesdeServicio,
                urgencia
            };
        }).filter(v => v.urgencia !== 'ok');
    },

    // Obtener garantías próximas a vencer
    async getGarantiasProximasVencer(dias = 90) {
        const hoy = new Date().toISOString().split('T')[0];
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + dias);

        const { data, error } = await supabase
            .from('garantias')
            .select(`
                *,
                clientes:cliente_id (id, nombre, telefono),
                vehiculos:vehiculo_id (id, marca, modelo, placa)
            `)
            .eq('estado', 'activa')
            .gte('fecha_vencimiento', hoy)
            .lte('fecha_vencimiento', fechaLimite.toISOString().split('T')[0])
            .order('fecha_vencimiento', { ascending: true });

        if (error) throw error;

        return data.map(g => ({
            ...g,
            dias_restantes: Math.floor((new Date(g.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24)),
            urgencia: (() => {
                const dias = Math.floor((new Date(g.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24));
                if (dias <= 15) return 'critico';
                if (dias <= 30) return 'urgente';
                return 'proximo';
            })()
        }));
    },

    // Obtener citas próximas (próximos 7 días)
    async getCitasProximas(dias = 7) {
        const hoy = new Date().toISOString().split('T')[0];
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + dias);

        const { data, error } = await supabase
            .from('citas')
            .select(`
                *,
                clientes:cliente_id (id, nombre, telefono),
                vehiculos:vehiculo_id (id, marca, modelo, placa),
                tecnicos:tecnico_id (id, nombre)
            `)
            .gte('fecha', hoy)
            .lte('fecha', fechaLimite.toISOString().split('T')[0])
            .not('estado', 'in', '("cancelada","no_asistio")')
            .order('fecha', { ascending: true })
            .order('hora_inicio', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Obtener resumen de alertas para dashboard
    async getResumenAlertas() {
        const [mantenimientos, garantias, citas] = await Promise.all([
            this.getProximosMantenimientos().catch(() => []),
            this.getGarantiasProximasVencer().catch(() => []),
            this.getCitasProximas().catch(() => [])
        ]);

        const mantenimientosCriticos = mantenimientos.filter(m => m.urgencia === 'critico').length;
        const mantenimientosUrgentes = mantenimientos.filter(m => m.urgencia === 'urgente').length;
        const garantiasCriticas = garantias.filter(g => g.urgencia === 'critico').length;
        const garantiasUrgentes = garantias.filter(g => g.urgencia === 'urgente').length;

        return {
            mantenimientos: {
                total: mantenimientos.length,
                criticos: mantenimientosCriticos,
                urgentes: mantenimientosUrgentes,
                items: mantenimientos.slice(0, 5)
            },
            garantias: {
                total: garantias.length,
                criticas: garantiasCriticas,
                urgentes: garantiasUrgentes,
                items: garantias.slice(0, 5)
            },
            citas: {
                total: citas.length,
                hoy: citas.filter(c => c.fecha === new Date().toISOString().split('T')[0]).length,
                items: citas.slice(0, 5)
            },
            totalAlertas: mantenimientosCriticos + mantenimientosUrgentes + garantiasCriticas + garantiasUrgentes
        };
    },

    // Enviar recordatorio de mantenimiento (placeholder para integración futura)
    async enviarRecordatorio(vehiculoId, tipo = 'mantenimiento') {
        // TODO: Integrar con servicio de emails/SMS
        console.log(`Recordatorio de ${tipo} enviado para vehículo ${vehiculoId}`);
        return { success: true, message: 'Recordatorio programado' };
    }
};
