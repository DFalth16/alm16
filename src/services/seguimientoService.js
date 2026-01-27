import { supabase } from '../lib/supabase';

// =====================================================
// SERVICIO DE SEGUIMIENTO POSTVENTA
// Basado en tabla: seguimiento_postventa
// =====================================================

export const seguimientoService = {
    // Obtener todos los seguimientos
    async getAll(options = {}) {
        const { limit = 50, offset = 0 } = options;

        const { data, error, count } = await supabase
            .from('seguimiento_postventa')
            .select(`
                *,
                ordenes_servicio:id_orden (
                    id_orden,
                    motivo_ingreso,
                    kilometraje_actual,
                    vehiculos:id_vehiculo_placa (
                        id_vehiculo_placa, marca, modelo,
                        propietarios:id_propietario (
                            nombre_completo, telefono_principal, email
                        )
                    )
                )
            `, { count: 'exact' })
            .order('fecha_salida', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { data, count };
    },

    // Obtener seguimiento por ID
    async getById(id) {
        const { data, error } = await supabase
            .from('seguimiento_postventa')
            .select(`
                *,
                ordenes_servicio:id_orden (
                    *,
                    vehiculos:id_vehiculo_placa (
                        *,
                        propietarios:id_propietario (*)
                    )
                )
            `)
            .eq('id_seguimiento', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Obtener seguimientos con próximo mantenimiento cercano
    async getProximosMantenimientos(dias = 30) {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + dias);

        const { data, error } = await supabase
            .from('seguimiento_postventa')
            .select(`
                *,
                ordenes_servicio:id_orden (
                    vehiculos:id_vehiculo_placa (
                        id_vehiculo_placa, marca, modelo,
                        propietarios:id_propietario (
                            nombre_completo, telefono_principal
                        )
                    )
                )
            `)
            .lte('fecha_proximo_mantenimiento', fechaLimite.toISOString().split('T')[0])
            .gte('fecha_proximo_mantenimiento', new Date().toISOString().split('T')[0])
            .order('fecha_proximo_mantenimiento', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Crear seguimiento
    async create(seguimiento) {
        const { data, error } = await supabase
            .from('seguimiento_postventa')
            .insert([seguimiento])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Actualizar seguimiento
    async update(id, updates) {
        const { data, error } = await supabase
            .from('seguimiento_postventa')
            .update(updates)
            .eq('id_seguimiento', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
