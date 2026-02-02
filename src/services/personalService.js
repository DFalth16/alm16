import { supabase } from '../lib/supabase';
import { setCreatingUser } from '../context/AuthContext';

// =====================================================
// SERVICIO DE PERSONAL
// Gestión de técnicos y recepcionistas con auth
// =====================================================

// Ramas de mantenimiento disponibles
export const RAMAS_MANTENIMIENTO = [
    { id: 'mantenimiento-rapido', nombre: 'Mantenimiento Rápido', descripcion: 'Cambios de aceite, filtros, etc.' },
    { id: 'mecanica-general', nombre: 'Mecánica General', descripcion: 'Reparaciones mecánicas generales' },
    { id: 'electricidad', nombre: 'Electricidad y Electrónica', descripcion: 'Sistemas eléctricos y electrónicos' },
    { id: 'chapa-pintura', nombre: 'Chapa y Pintura', descripcion: 'Carrocería y acabados' },
    { id: 'neumaticos', nombre: 'Neumáticos y Alineación', descripcion: 'Llantas, balanceo, alineación' }
];

export const personalService = {
    /**
     * Obtener todo el personal (desde tabla tecnicos)
     */
    async getAll(options = {}) {
        const { rol, rama, search, incluirInactivos = false } = options;

        // Query tecnicos directly
        let query = supabase
            .from('tecnicos')
            .select('*')
            .order('created_at', { ascending: false });

        if (!incluirInactivos) {
            query = query.eq('activo', true);
        }

        // Filter by rama if specified
        if (rama) {
            query = query.eq('rama_mantenimiento', rama);
        }

        // Filter by rol (using especialidad as indicator)
        if (rol === 'recepcionista') {
            query = query.eq('especialidad', 'Recepción');
        } else if (rol === 'mecanico') {
            query = query.neq('especialidad', 'Recepción');
        }

        const { data, error } = await query;

        if (error) throw error;

        let result = data || [];

        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(t =>
                t.nombre?.toLowerCase().includes(searchLower) ||
                t.email?.toLowerCase().includes(searchLower) ||
                t.especialidad?.toLowerCase().includes(searchLower)
            );
        }

        // Map to expected format
        result = result.map(t => ({
            id: t.id,
            nombre: t.nombre,
            email: t.email,
            telefono: t.telefono,
            activo: t.activo,
            rol: t.especialidad === 'Recepción' ? 'recepcionista' : 'mecanico',
            tecnicos: t // Include full technician data
        }));

        return { data: result };
    },

    /**
     * Obtener solo técnicos por rama
     */
    async getTecnicosPorRama(rama) {
        const { data: tecnicos, error } = await supabase
            .from('tecnicos')
            .select('*')
            .eq('rama_mantenimiento', rama)
            .eq('activo', true);

        if (error) throw error;
        return tecnicos || [];
    },

    /**
     * Crear nuevo personal CON cuenta de login
     * Crea: auth.users + usuarios + tecnicos
     */
    async create(personalData) {
        const { email, password, nombre, telefono, rol, especialidad, rama_mantenimiento } = personalData;

        // ACTIVAR flag para ignorar cambios de auth durante la creación
        setCreatingUser(true);

        try {
            // IMPORTANTE: Guardar la sesión actual del admin ANTES de crear el nuevo usuario
            const { data: { session: currentSession } } = await supabase.auth.getSession();

            // 1. Crear usuario en Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nombre: nombre,
                        rol: rol === 'recepcionista' ? 'recepcionista' : 'mecanico'
                    }
                }
            });

            if (authError) {
                console.error('Error en Auth:', authError);
                // Restaurar sesión del admin si hubo error
                if (currentSession) {
                    await supabase.auth.setSession({
                        access_token: currentSession.access_token,
                        refresh_token: currentSession.refresh_token
                    });
                }
                throw authError;
            }

            if (!authData.user) {
                // Restaurar sesión del admin si no se creó el usuario
                if (currentSession) {
                    await supabase.auth.setSession({
                        access_token: currentSession.access_token,
                        refresh_token: currentSession.refresh_token
                    });
                }
                throw new Error('No se pudo crear el usuario en Auth');
            }

            // RESTAURAR la sesión del admin inmediatamente después de crear el nuevo usuario
            // Esto evita que la sesión cambie al nuevo usuario creado
            if (currentSession) {
                await supabase.auth.setSession({
                    access_token: currentSession.access_token,
                    refresh_token: currentSession.refresh_token
                });
            }

            // 2. Crear registro en tabla usuarios
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .insert([{
                    id: authData.user.id,
                    email,
                    nombre,
                    telefono,
                    rol: rol === 'recepcionista' ? 'recepcionista' : 'mecanico',
                    activo: true
                }])
                .select()
                .single();

            if (userError) {
                console.error('Error creando usuario:', userError);
                throw userError;
            }

            // 3. Crear registro en tabla tecnicos
            const { data: tecnicoData, error: tecnicoError } = await supabase
                .from('tecnicos')
                .insert([{
                    nombre,
                    email,
                    telefono,
                    especialidad: rol === 'recepcionista' ? 'Recepción' : (especialidad || 'General'),
                    rama_mantenimiento: rama_mantenimiento || 'mecanica-general',
                    disponible: true,
                    activo: true,
                    calificacion: 5.0
                }])
                .select()
                .single();

            if (tecnicoError) {
                console.error('Error creando técnico:', tecnicoError);
                throw tecnicoError;
            }

            // 4. Vincular usuario con técnico
            await supabase
                .from('usuarios')
                .update({ tecnico_id: tecnicoData.id })
                .eq('id', authData.user.id);

            return { ...userData, tecnicos: tecnicoData, rol };
        } finally {
            // SIEMPRE desactivar el flag al terminar, sin importar si hubo error o no
            setCreatingUser(false);
        }
    },

    /**
     * Actualizar datos del personal
     */
    async update(id, updates) {
        const { nombre, telefono, especialidad, rama_mantenimiento, disponible } = updates;

        // Actualizar tabla usuarios
        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .update({
                nombre,
                telefono,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (userError) throw userError;

        // Si tiene técnico asociado, actualizar también
        if (userData.tecnico_id) {
            const { error: tecnicoError } = await supabase
                .from('tecnicos')
                .update({
                    nombre,
                    telefono,
                    especialidad,
                    rama_mantenimiento,
                    disponible
                })
                .eq('id', userData.tecnico_id);

            if (tecnicoError) throw tecnicoError;
        }

        return userData;
    },

    /**
     * Dar de baja al personal (desactivar)
     */
    async deactivate(id) {
        // Desactivar en tabla tecnicos directamente
        const { data, error } = await supabase
            .from('tecnicos')
            .update({ activo: false, disponible: false })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return data;
    },

    /**
     * Reactivar personal
     */
    async reactivate(id) {
        // Get user first
        const { data: userData, error: getError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', id)
            .single();

        if (getError) throw getError;

        const { data, error } = await supabase
            .from('usuarios')
            .update({ activo: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        if (userData.tecnico_id) {
            await supabase
                .from('tecnicos')
                .update({ activo: true })
                .eq('id', userData.tecnico_id);
        }

        return data;
    },

    /**
     * Obtener personal por ID
     */
    async getById(id) {
        const { data: userData, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // If has technician, fetch that too
        if (userData.tecnico_id) {
            const { data: tecnicoData } = await supabase
                .from('tecnicos')
                .select('*')
                .eq('id', userData.tecnico_id)
                .single();

            return { ...userData, tecnicos: tecnicoData };
        }

        return userData;
    }
};
