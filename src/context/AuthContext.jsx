import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

// Crear el contexto
const AuthContext = createContext(null);

// Provider del contexto de autenticación
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Verificar sesión al montar el componente
    useEffect(() => {
        console.log('AuthContext: Inicializando...');
        checkUserSession();

        // Escuchar cambios en el estado de autenticación
        const { data: authListener } = authService.onAuthStateChange(async (event, session) => {
            console.log('AuthContext: Cambio de estado de auth:', event);
            if (event === 'SIGNED_IN' && session) {
                await loadUserData();
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    // Verificar si hay una sesión activa
    const checkUserSession = async () => {
        try {
            console.log('AuthContext: Verificando sesión...');
            setLoading(true);
            const currentUser = await authService.getCurrentUser();
            console.log('AuthContext: Usuario obtenido:', currentUser);
            setUser(currentUser);
        } catch (err) {
            console.error('AuthContext: Error verificando sesión:', err);
            setError(err.message);
            setUser(null);
        } finally {
            setLoading(false);
            console.log('AuthContext: Verificación completada');
        }
    };

    // Cargar datos del usuario
    const loadUserData = async () => {
        try {
            setLoading(true);
            console.log('AuthContext: Cargando datos de usuario...');
            const currentUser = await authService.getCurrentUser();
            console.log('AuthContext: Datos cargados:', currentUser);
            setUser(currentUser);
        } catch (err) {
            console.error('AuthContext: Error cargando datos de usuario:', err);
            setError(err.message);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Función de login
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            const userData = await authService.login(email, password);
            setUser(userData);
            return userData;
        } catch (err) {
            console.error('Error en login:', err);
            setError(err.message || 'Error al iniciar sesión');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Función de logout
    const logout = async () => {
        try {
            setLoading(true);
            await authService.logout();
            setUser(null);
            setError(null);
        } catch (err) {
            console.error('Error en logout:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Verificar si el usuario tiene un rol específico
    const hasRole = (roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.rol);
        }
        return user.rol === roles;
    };

    // Verificar si el usuario está autenticado
    const isAuthenticated = () => {
        return !!user && user.activo;
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        hasRole,
        isAuthenticated,
        checkUserSession
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext;
