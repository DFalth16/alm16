import React from 'react';
import { Search, Bell, Settings, Menu } from 'lucide-react';

const Header = ({ title, subtitle }) => {
    return (
        <header className="main-header">
            <div className="header-left">
                <button className="btn btn-ghost btn-icon mobile-menu-btn" style={{ display: 'none' }}>
                    <Menu size={20} />
                </button>
                <div>
                    <h1 className="header-title">{title || 'Dashboard'}</h1>
                    {subtitle && (
                        <nav className="header-breadcrumb">
                            <a href="/">Inicio</a>
                            <span>/</span>
                            <span>{subtitle}</span>
                        </nav>
                    )}
                </div>
            </div>

            <div className="header-right">
                <div className="header-search">
                    <Search className="header-search-icon" size={18} />
                    <input
                        type="text"
                        className="header-search-input"
                        placeholder="Buscar clientes, vehículos, órdenes..."
                    />
                </div>

                <button className="header-icon-btn" title="Notificaciones">
                    <Bell size={20} />
                    <span className="notification-dot"></span>
                </button>

                <button className="header-icon-btn" title="Configuración">
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;
