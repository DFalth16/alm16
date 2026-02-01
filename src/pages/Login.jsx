import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Wrench } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login, loading } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(''); // Limpiar error al escribir
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (!formData.email || !formData.password) {
            setError('Por favor ingresa email y contraseña');
            return;
        }

        try {
            const userData = await login(formData.email, formData.password);

            // Redirigir según el rol
            const dashboardRoutes = {
                'administrador': '/',
                'admin': '/',
                'recepcionista': '/recepcionista',
                'mecanico': '/mecanico',
                'operador': '/mecanico'
            };

            const destination = dashboardRoutes[userData.rol] || '/';
            navigate(destination, { replace: true });
        } catch (err) {
            console.error('Error en login:', err);
            setError(err.message || 'Email o contraseña incorrectos');
        }
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="login-blob login-blob-1"></div>
                <div className="login-blob login-blob-2"></div>
                <div className="login-blob login-blob-3"></div>
            </div>

            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">
                        <Wrench size={32} />
                    </div>
                    <h1>ALM IMPORTS</h1>
                    <p>Sistema de Gestión</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">
                            <Mail size={16} />
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="usuario@almimports.com"
                            disabled={loading}
                            autoComplete="email"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            <Lock size={16} />
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="loading-spinner-small"></div>
                                Iniciando sesión...
                            </>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
