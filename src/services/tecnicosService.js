import { supabase } from '../lib/supabase';

// =====================================================
// SERVICIO DE TÉCNICOS
// =====================================================

export const tecnicosService = {
    // Obtener todos los técnicos
    async getAll(options = {}) {
        const { disponible, especialidad, activo = true } = options;

        let query = supabase
            .from('tecnicos')
            .select('*', { count: 'exact' })
            .eq('activo', activo)
            .order('nombre', { ascending: true });

        if (disponible !== undefined) {
            query = query.eq('disponible', disponible);
        }

        if (especialidad) {
            query = query.eq('especialidad', especialidad);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        return { data, count };
    },

    // Obtener técnico por ID
    async getById(id) {
        const { data, error } = await supabase
            .from('tecnicos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Obtener técnicos disponibles
    async getDisponibles() {
        const { data, error } = await supabase
            .from('tecnicos')
            .select('id, nombre, especialidad, calificacion')
            .eq('activo', true)
            .eq('disponible', true)
            .order('calificacion', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Crear nuevo técnico
    async create(tecnico) {
        const { data, error } = await supabase
            .from('tecnicos')
            .insert([tecnico])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Actualizar técnico
    async update(id, updates) {
        const { data, error } = await supabase
            .from('tecnicos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Cambiar disponibilidad
    async setDisponibilidad(id, disponible) {
        const { data, error } = await supabase
            .from('tecnicos')
            .update({ disponible })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Desactivar técnico
    async delete(id) {
        const { data, error } = await supabase
            .from('tecnicos')
            .update({ activo: false })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Obtener órdenes asignadas a un técnico
    async getOrdenesAsignadas(tecnicoId) {
        const { data, error } = await supabase
            .from('ordenes_trabajo')
            .select(`
        *,
        clientes:cliente_id (nombre),
        vehiculos:vehiculo_id (marca, modelo, placa)
      `)
            .eq('tecnico_id', tecnicoId)
            .in('estado', ['pendiente', 'en-proceso'])
            .order('prioridad', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Obtener estadísticas de un técnico
    async getEstadisticas(tecnicoId) {
        // Órdenes activas
        const { count: ordenesActivas, error: e1 } = await supabase
            .from('ordenes_trabajo')
            .select('*', { count: 'exact', head: true })
            .eq('tecnico_id', tecnicoId)
            .in('estado', ['pendiente', 'en-proceso']);

        // Órdenes completadas
        const { count: ordenesCompletadas, error: e2 } = await supabase
            .from('ordenes_trabajo')
            .select('*', { count: 'exact', head: true })
            .eq('tecnico_id', tecnicoId)
            .in('estado', ['completado', 'entregado']);

        // Ingresos generados
        const { data: ingresos, error: e3 } = await supabase
            .from('ordenes_trabajo')
            .select('costo_total')
            .eq('tecnico_id', tecnicoId)
            .in('estado', ['completado', 'entregado']);

        if (e1 || e2 || e3) throw e1 || e2 || e3;

        const totalIngresos = ingresos.reduce((sum, o) => sum + (o.costo_total || 0), 0);

        return {
            ordenesActivas,
            ordenesCompletadas,
            ingresos: totalIngresos
        };
    },

    // Actualizar calificación
    async actualizarCalificacion(tecnicoId, nuevaCalificacion) {
        const { data: tecnico, error: e1 } = await supabase
            .from('tecnicos')
            .select('calificacion, total_evaluaciones')
            .eq('id', tecnicoId)
            .single();

        if (e1) throw e1;

        const totalEvaluaciones = (tecnico.total_evaluaciones || 0) + 1;
        const calificacionActual = tecnico.calificacion || 5;
        const nuevaCalificacionPromedio =
            ((calificacionActual * (totalEvaluaciones - 1)) + nuevaCalificacion) / totalEvaluaciones;

        const { data, error: e2 } = await supabase
            .from('tecnicos')
            .update({
                calificacion: Math.round(nuevaCalificacionPromedio * 100) / 100,
                total_evaluaciones: totalEvaluaciones
            })
            .eq('id', tecnicoId)
            .select()
            .single();

        if (e2) throw e2;
        return data;
    },

    // Obtener especialidades únicas
    async getEspecialidades() {
        const { data, error } = await supabase
            .from('tecnicos')
            .select('especialidad')
            .eq('activo', true);

        if (error) throw error;

        const especialidades = [...new Set(data.map(t => t.especialidad).filter(Boolean))];
        return especialidades.sort();
    }
};
