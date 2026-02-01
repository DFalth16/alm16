import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import {
    Calendar, Users, Car, ClipboardList, Clock,
    CheckCircle, AlertCircle, Phone, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { citasService } from '../services/citasService';
import { clientesService } from '../services/clientesService';
import { vehiculosService } from '../services/vehiculosService';
import { ordenesService } from '../services/ordenesService';

const DashboardRecepcionista = () => {
    const { user } = useAuth();
    const [citas, setCitas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [citasRes, clientesRes, vehiculosRes, ordenesRes] = await Promise.all([
                citasService.getAll(),
                clientesService.getAll(),
                vehiculosService.getAll(),
                ordenesService.getAll()
            ]);

            setCitas(citasRes.data || []);
            setClientes(clientesRes.data || []);
            setVehiculos(vehiculosRes.data || []);
            setOrdenes(ordenesRes.data || []);
        } catch (err) {
            console.error('Error cargando datos:', err);
        } finally {
            setLoading(false);
        }
    };

    const hoy = new Date().toISOString().split('T')[0];
    const citasHoy = citas.filter(c => c.fecha === hoy);
    const clientesRecientes = clientes.slice(0, 5);
    const ordenesActivas = ordenes.filter(o => o.estado === 'pendiente' || o.estado === 'en-proceso');

    const stats = [
        {
            title: 'Citas Hoy',
            value: citasHoy.length,
            icon: Calendar,
            color: 'primary',
            link: '/citas'
        },
        {
            title: 'Clientes',
            value: clientes.length,
            icon: Users,
            color: 'success',
            link: '/clientes'
        },
        {
            title: 'Vehículos',
            value: vehiculos.length,
            icon: Car,
            color: 'info',
            link: '/vehiculos'
        },
        {
            title: 'Órdenes Activas',
            value: ordenesActivas.length,
            icon: ClipboardList,
            color: 'warning',
            link: '/ordenes'
        }
    ];

    if (loading) {
        return (
            <Layout title="Dashboard Recepcionista" subtitle={`Bienvenido/a ${user?.nombre || user?.email}`}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <div className="loading-spinner"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Dashboard Recepcionista" subtitle={`Bienvenido/a ${user?.nombre || user?.email}`}>
            {/* Stats Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-lg)' }}>
                {stats.map((stat, index) => (
                    <Link to={stat.link} key={index} className="stats-card" style={{ textDecoration: 'none' }}>
                        <div className={`stats-card-icon ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stats-card-content">
                            <div className="stats-card-label">{stat.title}</div>
                            <div className="stats-card-value">{stat.value}</div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
                {/* Citas del Día */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Calendar size={20} style={{ marginRight: '8px', color: 'var(--primary-500)' }} />
                            Citas de Hoy
                        </h3>
                        <Link to="/citas" className="btn btn-ghost btn-sm">
                            Ver todas <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="card-body">
                        {citasHoy.length === 0 ? (
                            <div className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>
                                <Calendar size={32} style={{ color: 'var(--gray-400)' }} />
                                <p>No hay citas para hoy</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {citasHoy.slice(0, 4).map((cita) => (
                                    <div key={cita.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-md)',
                                        padding: 'var(--spacing-md)',
                                        backgroundColor: 'var(--gray-50)',
                                        borderRadius: 'var(--border-radius)',
                                        borderLeft: `4px solid ${cita.estado === 'confirmada' ? 'var(--success-500)' : 'var(--warning-500)'}`
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '48px',
                                            height: '48px',
                                            backgroundColor: 'var(--primary-100)',
                                            borderRadius: 'var(--border-radius)',
                                            color: 'var(--primary-600)',
                                            fontWeight: 'var(--font-weight-bold)'
                                        }}>
                                            <Clock size={20} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                                {cita.hora_inicio || 'Sin hora'}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                {cita.tipo_servicio || 'Servicio general'}
                                            </div>
                                        </div>
                                        {cita.estado === 'confirmada' ? (
                                            <CheckCircle size={20} style={{ color: 'var(--success-500)' }} />
                                        ) : (
                                            <AlertCircle size={20} style={{ color: 'var(--warning-500)' }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Clientes Recientes */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Users size={20} style={{ marginRight: '8px', color: 'var(--success-500)' }} />
                            Clientes Recientes
                        </h3>
                        <Link to="/clientes" className="btn btn-ghost btn-sm">
                            Ver todos <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            {clientesRecientes.map((cliente) => (
                                <div key={cliente.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-md)',
                                    padding: 'var(--spacing-sm)',
                                    borderRadius: 'var(--border-radius)',
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer'
                                }}>
                                    <div className="avatar avatar-sm" style={{
                                        background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
                                    }}>
                                        {cliente.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                                            {cliente.nombre}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Phone size={12} />
                                            {cliente.telefono || 'Sin teléfono'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
                <div className="card-header">
                    <h3 className="card-title">Acciones Rápidas</h3>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-4" style={{ gap: 'var(--spacing-md)' }}>
                        <Link to="/citas" className="btn btn-outline">
                            <Calendar size={18} />
                            Nueva Cita
                        </Link>
                        <Link to="/clientes" className="btn btn-outline">
                            <Users size={18} />
                            Nuevo Cliente
                        </Link>
                        <Link to="/vehiculos" className="btn btn-outline">
                            <Car size={18} />
                            Nuevo Vehículo
                        </Link>
                        <Link to="/ordenes" className="btn btn-outline">
                            <ClipboardList size={18} />
                            Nueva Orden
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DashboardRecepcionista;
