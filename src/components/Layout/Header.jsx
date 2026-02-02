import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ title, subtitle }) => {
    return (
        <header className="main-header">
            <div className="header-left">
                <button className="btn btn-ghost btn-icon mobile-menu-btn" style={{ display: 'none' }}>
                    <Menu size={20} />
                </button>
                <div>
                    <h1 className="header-title">{title || 'Panel'}</h1>
                    {subtitle && (
                        <nav className="header-breadcrumb">
                            <a href="/">Inicio</a>
                            <span>/</span>
                            <span>{subtitle}</span>
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
