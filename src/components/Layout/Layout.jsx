import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title, subtitle }) => {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-container">
                <Header title={title} subtitle={subtitle} />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
