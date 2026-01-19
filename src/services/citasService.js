import { supabase } from '../lib/supabase';

// =====================================================
// SERVICIO DE CITAS
// =====================================================

export const citasService = {
    // Obtener todas las citas
    async getAll(options = {}) {
        const {
            estado,
            clienteId,
            vehiculoId,
            tecnicoId,
            fechaDesde,
            fechaHasta,
            limit = 50,
            offset = 0
        } = options;

        let query = supabase
            .from('citas')
            .select(`
        *,
        clientes:cliente_id (id, nombre, telefono, email),
        vehiculos:vehiculo_id (id, marca, modelo, placa),
        tecnicos:tecnico_id (id, nombre, especialidad)
      `, { count: 'exact' })
            .order('fecha', { ascending: true })
            .order('hora_inicio', { ascending: true })
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
            query = query.gte('fecha', fechaDesde);
        }

        if (fechaHasta) {
            query = query.lte('fecha', fechaHasta);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        return { data, count };
    },

    // Obtener cita por ID
    async getById(id) {
        const { data, error } = await supabase
            .from('citas')
            .select(`
        *,
        clientes:cliente_id (*),
        vehiculos:vehiculo_id (*),
        tecnicos:tecnico_id (*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Obtener citas de un día específico
    async getByFecha(fecha) {
        const { data, error } = await supabase
            .from('citas')
            .select(`
        *,
        clientes:cliente_id (id, nombre, telefono),
        vehiculos:vehiculo_id (id, marca, modelo, placa),
        tecnicos:tecnico_id (id, nombre)
      `)
            .eq('fecha', fecha)
            .order('hora_inicio', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Obtener citas de hoy
    async getHoy() {
        const hoy = new Date().toISOString().split('T')[0];
        return this.getByFecha(hoy);
    },

    // Obtener citas de la semana
    async getSemana() {
        const hoy = new Date();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());

        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);

        const { data, error } = await supabase
            .from('citas')
            .select(`
        *,
        clientes:cliente_id (id, nombre, telefono),
        vehiculos:vehiculo_id (id, marca, modelo, placa)
      `)
            .gte('fecha', inicioSemana.toISOString().split('T')[0])
            .lte('fecha', finSemana.toISOString().split('T')[0])
            .order('fecha', { ascending: true })
            .order('hora_inicio', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Obtener citas del mes
    async getMes(anio, mes) {
        const inicioMes = new Date(anio, mes, 1);
        const finMes = new Date(anio, mes + 1, 0);

        const { data, error } = await supabase
            .from('citas')
            .select(`
        *,
        clientes:cliente_id (id, nombre),
        vehiculos:vehiculo_id (id, marca, modelo, placa)
      `)
            .gte('fecha', inicioMes.toISOString().split('T')[0])
            .lte('fecha', finMes.toISOString().split('T')[0])
            .order('fecha', { ascending: true })
            .order('hora_inicio', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Crear nueva cita
    async create(cita) {
        const { data, error } = await supabase
            .from('citas')
            .insert([cita])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Actualizar cita
    async update(id, updates) {
        const { data, error } = await supabase
            .from('citas')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Cambiar estado de cita
    async cambiarEstado(id, nuevoEstado) {
        const { data, error } = await supabase
            .from('citas')
            .update({ estado: nuevoEstado })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Confirmar cita
    async confirmar(id) {
        return this.cambiarEstado(id, 'confirmada');
    },

    // Cancelar cita
    async cancelar(id) {
        return this.cambiarEstado(id, 'cancelada');
    },

    // Marcar como no asistió
    async marcarNoAsistio(id) {
        return this.cambiarEstado(id, 'no_asistio');
    },

    // Eliminar cita
    async delete(id) {
        const { error } = await supabase
            .from('citas')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // Verificar disponibilidad de horario
    async verificarDisponibilidad(fecha, horaInicio, horaFin, tecnicoId = null) {
        let query = supabase
            .from('citas')
            .select('id, hora_inicio, hora_fin')
            .eq('fecha', fecha)
            .not('estado', 'in', '("cancelada","no_asistio")');

        if (tecnicoId) {
            query = query.eq('tecnico_id', tecnicoId);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Verificar conflictos de horario
        const conflicto = data.some(cita => {
            const citaInicio = cita.hora_inicio;
            const citaFin = cita.hora_fin || '23:59:59';
            return (horaInicio < citaFin && horaFin > citaInicio);
        });

        return !conflicto;
    },

    // Estadísticas de citas
    async getStats() {
        const hoy = new Date().toISOString().split('T')[0];

        // Citas de hoy
        const { count: citasHoy, error: e1 } = await supabase
            .from('citas')
            .select('*', { count: 'exact', head: true })
            .eq('fecha', hoy)
            .not('estado', 'in', '("cancelada","no_asistio")');

        // Citas pendientes
        const { count: pendientes, error: e2 } = await supabase
            .from('citas')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'pendiente')
            .gte('fecha', hoy);

        // Citas confirmadas
        const { count: confirmadas, error: e3 } = await supabase
            .from('citas')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'confirmada')
            .gte('fecha', hoy);

        if (e1 || e2 || e3) throw e1 || e2 || e3;

        return {
            hoy: citasHoy,
            pendientes,
            confirmadas
        };
    }
};
