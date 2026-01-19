import React from 'react';
import { NavLink } from 'react-router-dom';
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
    Settings,
    LogOut
} from 'lucide-react';

const Sidebar = () => {
    const menuItems = [
        {
            section: 'Principal',
            items: [
                { path: '/', icon: LayoutDashboard, label: 'Dashboard', badge: null },
            ]
        },
        {
            section: 'Gestión',
            items: [
                { path: '/clientes', icon: Users, label: 'Clientes', badge: null },
                { path: '/vehiculos', icon: Car, label: 'Vehículos', badge: null },
                { path: '/ordenes', icon: ClipboardList, label: 'Órdenes de Trabajo', badge: 3 },
                { path: '/seguimiento', icon: Activity, label: 'Seguimiento', badge: null },
            ]
        },
        {
            section: 'Post-Venta',
            items: [
                { path: '/historial', icon: History, label: 'Historial de Servicios', badge: null },
                { path: '/garantias', icon: Shield, label: 'Garantías', badge: 2 },
                { path: '/citas', icon: Calendar, label: 'Agenda / Citas', badge: null },
            ]
        },
        {
            section: 'Recursos',
            items: [
                { path: '/tecnicos', icon: Wrench, label: 'Técnicos', badge: null },
                { path: '/reportes', icon: BarChart3, label: 'Reportes', badge: null },
            ]
        }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <Wrench size={20} />
                    </div>
                    <div>
                        <span className="sidebar-logo-text">TallerPro</span>
                        <span className="sidebar-logo-subtitle">Sistema de Gestión</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((section, index) => (
                    <div key={index} className="nav-section">
                        <div className="nav-section-title">{section.section}</div>
                        {section.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                end={item.path === '/'}
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
                    <div className="sidebar-user-avatar">AD</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">Admin Usuario</div>
                        <div className="sidebar-user-role">Administrador</div>
                    </div>
                    <button className="btn btn-ghost btn-icon btn-sm" title="Cerrar sesión">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
