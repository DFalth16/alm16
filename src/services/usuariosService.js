import { supabase } from '../lib/supabase';

// =====================================================
// SERVICIO DE USUARIOS (Técnicos y Admin)
// Basado en tablas: usuarios + perfiles_usuarios
// =====================================================

export const usuariosService = {
    // Obtener todos los usuarios activos
    async getAll(options = {}) {
        const { rol, search, limit = 50, offset = 0 } = options;

        let query = supabase
            .from('usuarios')
            .select(`
                *,
                perfiles_usuarios (*)
            `, { count: 'exact' })
            .eq('activo', true)
            .order('fecha_creacion', { ascending: false })
            .range(offset, offset + limit - 1);

        if (rol) {
            query = query.eq('rol', rol);
        }

        if (search) {
            // Nota: búsqueda en perfil requiere join complejo, simplificamos
            query = query.ilike('email', `%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        return { data, count };
    },

    // Obtener solo técnicos (mecánicos)
    async getTecnicos() {
        const { data, error } = await supabase
            .from('usuarios')
            .select(`
                id_usuario,
                email,
                rol,
                activo,
                perfiles_usuarios (
                    nombre_completo,
                    telefono
                )
            `)
            .eq('rol', 'mecanico')
            .eq('activo', true)
            .order('fecha_creacion', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Obtener usuario por ID
    async getById(id) {
        const { data, error } = await supabase
            .from('usuarios')
            .select(`
                *,
                perfiles_usuarios (*)
            `)
            .eq('id_usuario', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Obtener técnico con sus intervenciones activas
    async getTecnicoConIntervenciones(id) {
        const { data: usuario, error: e1 } = await supabase
            .from('usuarios')
            .select(`
                *,
                perfiles_usuarios (*),
                intervenciones_tecnicas (
                    id_intervencion,
                    descripcion_tarea,
                    estado_tarea,
                    fecha_inicio,
                    ordenes_servicio:id_orden (
                        id_orden,
                        vehiculos:id_vehiculo_placa (marca, modelo, id_vehiculo_placa)
                    )
                )
            `)
            .eq('id_usuario', id)
            .single();

        if (e1) throw e1;
        return usuario;
    },

    // Crear nuevo usuario
    async create(usuario, perfil) {
        // Crear usuario
        const { data: userData, error: e1 } = await supabase
            .from('usuarios')
            .insert([usuario])
            .select()
            .single();

        if (e1) throw e1;

        // Crear perfil
        const { data: perfilData, error: e2 } = await supabase
            .from('perfiles_usuarios')
            .insert([{
                id_usuario: userData.id_usuario,
                ...perfil
            }])
            .select()
            .single();

        if (e2) throw e2;

        return { ...userData, perfil: perfilData };
    },

    // Actualizar usuario
    async update(id, updates) {
        const { data, error } = await supabase
            .from('usuarios')
            .update(updates)
            .eq('id_usuario', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Actualizar perfil
    async updatePerfil(id, updates) {
        const { data, error } = await supabase
            .from('perfiles_usuarios')
            .update(updates)
            .eq('id_usuario', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Desactivar usuario
    async delete(id) {
        const { data, error } = await supabase
            .from('usuarios')
            .update({ activo: false })
            .eq('id_usuario', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Estadísticas de técnicos
    async getStatsTecnicos() {
        const { count: total, error: e1 } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .eq('rol', 'mecanico')
            .eq('activo', true);

        // Técnicos con intervenciones en proceso
        const { data: conTareas, error: e2 } = await supabase
            .from('intervenciones_tecnicas')
            .select('id_tecnico')
            .in('estado_tarea', ['pendiente', 'en_proceso']);

        if (e1 || e2) throw e1 || e2;

        const tecnicosOcupados = new Set(conTareas?.map(t => t.id_tecnico)).size;

        return {
            total,
            ocupados: tecnicosOcupados,
            disponibles: (total || 0) - tecnicosOcupados
        };
    }
};
