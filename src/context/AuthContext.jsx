import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Crear el contexto
const AuthContext = createContext(null);

// Flag global para indicar que se está creando un usuario
export let isCreatingUser = false;
export const setCreatingUser = (value) => { isCreatingUser = value; };

// Provider del contexto de autenticación
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar usuario desde sesión
    const loadUser = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                setUser(null);
                return null;
            }

            // Obtener datos de la tabla usuarios
            const { data: userData } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', session.user.id)
                .single();

            const fullUser = {
                ...session.user,
                ...(userData || { rol: 'operador', activo: true })
            };

            setUser(fullUser);
            return fullUser;
        } catch (err) {
            console.error('Error cargando usuario:', err);
            return null;
        }
    }, []);

    // Solo cargar usuario UNA VEZ al iniciar
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            await loadUser();
            if (mounted) {
                setLoading(false);
            }
        };

        init();

        // Solo escuchar logout explícito
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (isCreatingUser) return; // Ignorar si estamos creando usuario

            if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, [loadUser]);

    // Login
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;

            // Obtener datos adicionales
            const { data: userData } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', data.user.id)
                .single();

            const fullUser = {
                ...data.user,
                ...(userData || { rol: 'operador', activo: true })
            };

            setUser(fullUser);
            return fullUser;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
        } catch (err) {
            console.error('Error en logout:', err);
        }
    };

    // Verificar rol
    const hasRole = (roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.rol);
        }
        return user.rol === roles;
    };

    // Verificar autenticación
    const isAuthenticated = () => {
        return !!user && user.activo !== false;
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        hasRole,
        isAuthenticated,
        refreshUser: loadUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext;
