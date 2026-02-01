import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * @param {Object} props
 * @param {React.Component} props.children - Componente a renderizar si está autenticado
 * @param {string|Array<string>} props.allowedRoles - Rol(es) permitido(s) para acceder
 * @param {string} props.redirectTo - Ruta a la que redirigir si no tiene acceso (default: /login)
 */
const PrivateRoute = ({ children, allowedRoles = null, redirectTo = '/login' }) => {
    const { user, loading, isAuthenticated, hasRole } = useAuth();

    // Mostrar loading mientras se verifica la sesión
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div className="loading-spinner"></div>
                <p style={{ color: 'var(--text-secondary)' }}>Verificando sesión...</p>
            </div>
        );
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated()) {
        return <Navigate to={redirectTo} replace />;
    }

    // Si se especificaron roles y el usuario no tiene el rol requerido
    if (allowedRoles && !hasRole(allowedRoles)) {
        // Redirigir al dashboard según su rol
        const dashboardRoutes = {
            'administrador': '/',
            'admin': '/',
            'recepcionista': '/recepcionista',
            'mecanico': '/mecanico',
            'operador': '/mecanico'
        };

        const userDashboard = dashboardRoutes[user.rol] || '/';
        return <Navigate to={userDashboard} replace />;
    }

    // Si todo está bien, renderizar el componente hijo
    return children;
};

export default PrivateRoute;
