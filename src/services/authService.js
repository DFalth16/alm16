import { supabase } from '../lib/supabase';

// =====================================================
// SERVICIO DE AUTENTICACIÓN
// Maneja login, logout y gestión de sesiones
// =====================================================

export const authService = {
    /**
     * Iniciar sesión con email y contraseña
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Object} Usuario con datos completos incluyendo rol
     */
    async login(email, password) {
        try {
            // Autenticar con Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;

            // Obtener datos adicionales del usuario desde la tabla usuarios
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (userError) {
                // Si no existe en la tabla usuarios, crear registro básico
                const { data: newUser, error: createError } = await supabase
                    .from('usuarios')
                    .insert([{
                        id: authData.user.id,
                        email: authData.user.email,
                        rol: 'operador', // Rol por defecto
                        activo: true
                    }])
                    .select()
                    .single();

                if (createError) throw createError;

                return {
                    ...authData.user,
                    ...newUser,
                    session: authData.session
                };
            }

            // Actualizar último acceso
            await supabase
                .from('usuarios')
                .update({ ultimo_acceso: new Date().toISOString() })
                .eq('id', authData.user.id);

            return {
                ...authData.user,
                ...userData,
                session: authData.session
            };
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },

    /**
     * Cerrar sesión
     */
    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Error en logout:', error);
            throw error;
        }
    },

    /**
     * Obtener usuario actual con datos completos
     * @returns {Object|null} Usuario actual o null si no hay sesión
     */
    async getCurrentUser() {
        try {
            console.log('authService: Obteniendo usuario actual...');

            // Agregar timeout de 5 segundos
            const getUserPromise = supabase.auth.getUser();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout obteniendo usuario')), 5000)
            );

            const { data: { user }, error: sessionError } = await Promise.race([
                getUserPromise,
                timeoutPromise
            ]);

            console.log('authService: Respuesta de getUser:', { user, sessionError });

            if (sessionError || !user) {
                console.log('authService: No hay sesión o hubo error');
                return null;
            }

            console.log('authService: Consultando tabla usuarios para ID:', user.id);

            // Obtener datos adicionales de la tabla usuarios con timeout
            const getUserDataPromise = supabase
                .from('usuarios')
                .select('*')
                .eq('id', user.id)
                .single();

            const { data: userData, error: userError } = await Promise.race([
                getUserDataPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout consultando usuarios')), 5000))
            ]);

            console.log('authService: Respuesta de tabla usuarios:', { userData, userError });

            if (userError) {
                console.error('authService: Error obteniendo datos de usuario:', userError);
                return {
                    ...user,
                    rol: 'operador',
                    activo: true
                };
            }

            const finalUser = {
                ...user,
                ...userData
            };
            console.log('authService: Usuario final:', finalUser);
            return finalUser;
        } catch (error) {
            console.error('authService: Error obteniendo usuario actual:', error);
            return null;
        }
    },

    /**
     * Verificar si hay una sesión activa
     * @returns {boolean} true si hay sesión activa
     */
    async checkSession() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return !!session;
        } catch (error) {
            console.error('Error verificando sesión:', error);
            return false;
        }
    },

    /**
     * Obtener la sesión actual
     * @returns {Object|null} Sesión actual o null
     */
    async getSession() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return session;
        } catch (error) {
            console.error('Error obteniendo sesión:', error);
            return null;
        }
    },

    /**
     * Escuchar cambios en el estado de autenticación
     * @param {Function} callback - Función a ejecutar cuando cambie el estado
     * @returns {Object} Subscription object para cancelar suscripción
     */
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    }
};
