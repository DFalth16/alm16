import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Car,
    ClipboardList,
    Activity,
    History,
    Shield,
    Calendar,
    Wrench,
    BarChart3,
    LogOut
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
        }
    };

    // Definir permisos por rol
    const rolePermissions = {
        'administrador': ['Panel', 'clientes', 'vehiculos', 'ordenes', 'seguimiento', 'historial', 'garantias', 'citas', 'tecnicos', 'reportes'],
        'admin': ['Panel', 'clientes', 'vehiculos', 'ordenes', 'seguimiento', 'historial', 'garantias', 'citas', 'tecnicos', 'reportes'],
        'recepcionista': ['clientes', 'vehiculos', 'ordenes', 'seguimiento', 'historial', 'garantias', 'citas'],
        'mecanico': ['ordenes', 'seguimiento', 'historial'],
        'operador': ['ordenes', 'seguimiento', 'historial']
    };

    const userPermissions = rolePermissions[user?.rol] || [];

    // Función para verificar si el usuario tiene permiso
    const hasPermission = (permission) => {
        return userPermissions.includes(permission);
    };

    // Obtener ruta del dashboard según el rol
    const getDashboardPath = () => {
        switch (user?.rol) {
            case 'administrador':
            case 'admin':
                return '/';
            case 'recepcionista':
                return '/recepcionista';
            case 'mecanico':
            case 'operador':
                return '/mecanico';
            default:
                return '/';
        }
    };

    const menuItems = [
        {
            section: 'Principal',
            items: [
                { path: getDashboardPath(), icon: LayoutDashboard, label: 'Panel', badge: null, permission: 'Panel' },
            ]
        },
        {
            section: 'Gestión',
            items: [
                { path: '/clientes', icon: Users, label: 'Clientes', badge: null, permission: 'clientes' },
                { path: '/vehiculos', icon: Car, label: 'Vehículos', badge: null, permission: 'vehiculos' },
                { path: '/ordenes', icon: ClipboardList, label: 'Órdenes de Trabajo', badge: null, permission: 'ordenes' },
                { path: '/seguimiento', icon: Activity, label: 'Seguimiento', badge: null, permission: 'seguimiento' },
            ]
        },
        {
            section: 'Post-Venta',
            items: [
                { path: '/historial', icon: History, label: 'Historial de Servicios', badge: null, permission: 'historial' },
                { path: '/garantias', icon: Shield, label: 'Garantías', badge: null, permission: 'garantias' },
                { path: '/citas', icon: Calendar, label: 'Agenda / Citas', badge: null, permission: 'citas' },
            ]
        },
        {
            section: 'Recursos',
            items: [
                { path: '/personal', icon: Wrench, label: 'Personal', badge: null, permission: 'tecnicos' },
                { path: '/reportes', icon: BarChart3, label: 'Reportes', badge: null, permission: 'reportes' },
            ]
        }
    ];

    // Filtrar secciones según permisos
    const filteredMenuItems = menuItems
        .map(section => ({
            ...section,
            items: section.items.filter(item => hasPermission(item.permission))
        }))
        .filter(section => section.items.length > 0);

    // Obtener iniciales del usuario
    const getUserInitials = () => {
        if (user?.nombre) {
            return user.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        }
        if (user?.email) {
            return user.email.substring(0, 2).toUpperCase();
        }
        return 'US';
    };

    // Obtener nombre para mostrar del rol
    const getRoleName = () => {
        const roles = {
            'administrador': 'Administrador',
            'admin': 'Administrador',
            'recepcionista': 'Recepcionista',
            'mecanico': 'Mecánico',
            'operador': 'Operador'
        };
        return roles[user?.rol] || user?.rol || 'Usuario';
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <Wrench size={20} />
                    </div>
                    <div>
                        <span className="sidebar-logo-text">ALM IMPORTS</span>
                        <span className="sidebar-logo-subtitle">Sistema de Gestión</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {filteredMenuItems.map((section, index) => (
                    <div key={index} className="nav-section">
                        <div className="nav-section-title">{section.section}</div>
                        {section.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                end={item.path === '/' || item.path === '/recepcionista' || item.path === '/mecanico'}
                            >
                                <item.icon className="nav-item-icon" size={20} />
                                <span className="nav-item-text">{item.label}</span>
                                {item.badge && (
                                    <span className="nav-item-badge">{item.badge}</span>
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">{getUserInitials()}</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">
                            {user?.nombre || user?.email?.split('@')[0] || 'Usuario'}
                        </div>
                        <div className="sidebar-user-role">{getRoleName()}</div>
                    </div>
                    <button
                        className="btn btn-ghost btn-icon btn-sm"
                        title="Cerrar sesión"
                        onClick={handleLogout}
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
