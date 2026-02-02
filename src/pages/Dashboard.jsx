import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import {
    Users, Car, ClipboardList, Calendar, TrendingUp,
    AlertCircle, CheckCircle, Clock, ArrowRight, Wrench, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ordenesService } from '../services/ordenesService';
import { citasService } from '../services/citasService';
import { clientesService } from '../services/clientesService';
import { vehiculosService } from '../services/vehiculosService';
import { garantiasService } from '../services/garantiasService';
import { tecnicosService } from '../services/tecnicosService';

const Dashboard = () => {
    // Estados para los datos
    const [ordenes, setOrdenes] = useState([]);
    const [citas, setCitas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [garantias, setGarantias] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar todos los datos al montar el componente
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar todos los datos en paralelo
            const [
                ordenesRes,
                citasRes,
                clientesRes,
                vehiculosRes,
                garantiasRes,
                tecnicosRes
            ] = await Promise.all([
                ordenesService.getAll(),
                citasService.getAll(),
                clientesService.getAll(),
                vehiculosService.getAll(),
                garantiasService.getAll(),
                tecnicosService.getAll()
            ]);

            setOrdenes(ordenesRes.data || []);
            setCitas(citasRes.data || []);
            setClientes(clientesRes.data || []);
            setVehiculos(vehiculosRes.data || []);
            setGarantias(garantiasRes.data || []);
            setTecnicos(tecnicosRes.data || []);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Funciones helper para obtener datos relacionados
    const getClienteById = (id) => clientes.find(c => c.id === id);
    const getVehiculoById = (id) => vehiculos.find(v => v.id === id);
    const getTecnicoById = (id) => tecnicos.find(t => t.id === id);

    // Calcular estadísticas
    const ordenesActivas = ordenes.filter(o => o.estado === 'en-proceso' || o.estado === 'pendiente');
    const hoy = new Date().toISOString().split('T')[0];
    const citasHoy = citas.filter(c => c.fecha === hoy);
    const garantiasActivas = garantias.filter(g => g.estado === 'activa');

    const stats = [
        {
            title: 'Clientes',
            value: clientes.length,
            icon: Users,
            color: 'primary',
            change: '+5%',
            link: '/clientes'
        },
        {
            title: 'Vehículos',
            value: vehiculos.length,
            icon: Car,
            color: 'success',
            change: '+3%',
            link: '/vehiculos'
        },
        {
            title: 'Órdenes Activas',
            value: ordenesActivas.length,
            icon: ClipboardList,
            color: 'warning',
            change: `${ordenes.filter(o => o.estado === 'pendiente').length} pendientes`,
            link: '/ordenes'
        },
        {
            title: 'Citas Hoy',
            value: citasHoy.length,
            icon: Calendar,
            color: 'info',
            change: 'Programadas',
            link: '/citas'
        }
    ];

    const getStatusBadge = (estado) => {
        const estados = {
            'pendiente': { class: 'pending', label: 'Pendiente' },
            'en-proceso': { class: 'in-progress', label: 'En Proceso' },
            'completado': { class: 'completed', label: 'Completado' },
            'entregado': { class: 'delivered', label: 'Entregado' },
            'confirmada': { class: 'completed', label: 'Confirmada' }
        };
        return estados[estado] || { class: 'pending', label: estado };
    };

    if (loading) {
        return (
            <Layout title="Dashboard" subtitle="Panel de Control">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando datos del dashboard...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Dashboard" subtitle="Panel de Control">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <AlertCircle size={48} style={{ color: 'var(--danger-500)' }} />
                    <p style={{ color: 'var(--danger-600)' }}>Error al cargar los datos: {error}</p>
                    <button className="btn btn-primary" onClick={loadAllData}>Reintentar</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Panel" subtitle="Panel de Control">
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
                            <div className="stats-card-change positive">
                                <TrendingUp size={12} />
                                {stat.change}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
                {/* Órdenes Activas */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <ClipboardList size={20} style={{ marginRight: '8px', color: 'var(--primary-500)' }} />
                            Órdenes Activas
                        </h3>
                        <Link to="/ordenes" className="btn btn-ghost btn-sm">
                            Ver todas <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="card-body">
                        {ordenesActivas.length === 0 ? (
                            <div className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>
                                <CheckCircle size={32} style={{ color: 'var(--success-500)' }} />
                                <p style={{ margin: 'var(--spacing-sm) 0 0', color: 'var(--text-secondary)' }}>
                                    No hay órdenes activas
                                </p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Orden</th>
                                            <th>Cliente</th>
                                            <th>Vehículo</th>
                                            <th>Estado</th>
                                            <th>Técnico</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ordenesActivas.slice(0, 5).map((orden) => {
                                            // Datos pueden venir del join o necesitar lookup
                                            const cliente = orden.clientes || getClienteById(orden.cliente_id);
                                            const vehiculo = orden.vehiculos || getVehiculoById(orden.vehiculo_id);
                                            const tecnico = orden.tecnicos || getTecnicoById(orden.tecnico_id);
                                            const status = getStatusBadge(orden.estado);

                                            return (
                                                <tr key={orden.id}>
                                                    <td>
                                                        <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                            #{orden.id}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                            <div className="avatar avatar-sm" style={{
                                                                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
                                                            }}>
                                                                {cliente?.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                                                            </div>
                                                            <span>{cliente?.nombre?.split(' ').slice(0, 2).join(' ') || 'Sin cliente'}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                                {vehiculo?.marca} {vehiculo?.modelo}
                                                            </div>
                                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                                                {vehiculo?.placa}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${status.class}`}>
                                                            <span className="status-badge-dot"></span>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: 'var(--font-size-sm)' }}>
                                                            {tecnico?.nombre?.split(' ').slice(0, 2).join(' ') || 'Sin asignar'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Citas del Día */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Calendar size={20} style={{ marginRight: '8px', color: 'var(--info-500)' }} />
                            Citas de Hoy
                        </h3>
                        <Link to="/citas" className="btn btn-ghost btn-sm">
                            Ver agenda <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="card-body">
                        {citasHoy.length === 0 ? (
                            <div className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>
                                <Calendar size={32} style={{ color: 'var(--gray-400)' }} />
                                <p style={{ margin: 'var(--spacing-sm) 0 0', color: 'var(--text-secondary)' }}>
                                    No hay citas programadas para hoy
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {citasHoy.slice(0, 4).map((cita) => {
                                    const cliente = cita.clientes || getClienteById(cita.cliente_id);
                                    const vehiculo = cita.vehiculos || getVehiculoById(cita.vehiculo_id);
                                    const status = getStatusBadge(cita.estado);

                                    return (
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                    <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{cita.hora}</span>
                                                    <span className={`status-badge ${status.class}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                    {cliente?.nombre?.split(' ').slice(0, 2).join(' ') || 'Sin cliente'} - {vehiculo?.marca} {vehiculo?.modelo}
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                                    {cita.tipo || cita.servicio}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Segunda fila */}
            <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
                {/* Garantías Activas */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Shield size={20} style={{ marginRight: '8px', color: 'var(--success-500)' }} />
                            Garantías Activas
                        </h3>
                    </div>
                    <div className="card-body">
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
                            <div style={{
                                fontSize: 'var(--font-size-3xl)',
                                fontWeight: 'var(--font-weight-bold)',
                                color: 'var(--success-600)'
                            }}>
                                {garantiasActivas.length}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                Garantías vigentes
                            </div>
                        </div>
                        <Link to="/garantias" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                            Ver garantías
                        </Link>
                    </div>
                </div>

                {/* Técnicos Disponibles */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Wrench size={20} style={{ marginRight: '8px', color: 'var(--warning-500)' }} />
                            Técnicos
                        </h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            {tecnicos.slice(0, 3).map((tecnico) => (
                                <div key={tecnico.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)',
                                    padding: 'var(--spacing-sm)',
                                    borderRadius: 'var(--border-radius)'
                                }}>
                                    <div className="avatar avatar-sm" style={{
                                        background: tecnico.disponible
                                            ? 'linear-gradient(135deg, var(--success-500), var(--success-600))'
                                            : 'linear-gradient(135deg, var(--gray-400), var(--gray-500))'
                                    }}>
                                        {tecnico.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                                            {tecnico.nombre}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                            {tecnico.especialidad}
                                        </div>
                                    </div>
                                    <span className={`status-badge ${tecnico.disponible ? 'completed' : 'pending'}`} style={{ fontSize: '10px' }}>
                                        {tecnico.disponible ? 'Disponible' : 'Ocupado'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <Link to="/tecnicos" className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: 'var(--spacing-md)' }}>
                            Ver todos
                        </Link>
                    </div>
                </div>

                {/* Resumen Rápido */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <TrendingUp size={20} style={{ marginRight: '8px', color: 'var(--primary-500)' }} />
                            Resumen
                        </h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                    Órdenes completadas
                                </span>
                                <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--success-600)' }}>
                                    {ordenes.filter(o => o.estado === 'completado' || o.estado === 'entregado').length}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                    Técnicos disponibles
                                </span>
                                <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-600)' }}>
                                    {tecnicos.filter(t => t.disponible).length}/{tecnicos.length}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                    Garantías por vencer
                                </span>
                                <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--warning-600)' }}>
                                    {garantias.filter(g => {
                                        if (g.estado !== 'activa') return false;
                                        const dias = Math.ceil((new Date(g.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24));
                                        return dias <= 30;
                                    }).length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
