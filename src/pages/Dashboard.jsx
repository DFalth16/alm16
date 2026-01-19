import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import {
    ClipboardList,
    Users,
    Car,
    Calendar,
    Shield,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Wrench
} from 'lucide-react';
import { ordenes, citas, clientes, vehiculos, garantias, tecnicos, getClienteById, getVehiculoById, getTecnicoById } from '../data/mockData';

const Dashboard = () => {
    const ordenesActivas = ordenes.filter(o => o.estado === 'en-proceso' || o.estado === 'pendiente');
    const citasHoy = citas.filter(c => c.fecha === '2026-01-20' || c.fecha === '2026-01-18');
    const garantiasActivas = garantias.filter(g => g.estado === 'activa');

    const stats = [
        {
            label: 'Órdenes Activas',
            value: ordenesActivas.length,
            icon: ClipboardList,
            color: 'primary',
            change: '+12%',
            changeType: 'positive'
        },
        {
            label: 'Clientes Registrados',
            value: clientes.length,
            icon: Users,
            color: 'success',
            change: '+8%',
            changeType: 'positive'
        },
        {
            label: 'Vehículos en Sistema',
            value: vehiculos.length,
            icon: Car,
            color: 'info',
            change: '+5%',
            changeType: 'positive'
        },
        {
            label: 'Citas Próximas',
            value: citas.length,
            icon: Calendar,
            color: 'warning',
            change: '-3%',
            changeType: 'negative'
        }
    ];

    const getStatusBadge = (estado) => {
        const statusMap = {
            'pendiente': 'pending',
            'en-proceso': 'in-progress',
            'completado': 'completed',
            'entregado': 'delivered',
            'cancelado': 'cancelled'
        };
        const statusLabels = {
            'pendiente': 'Pendiente',
            'en-proceso': 'En Proceso',
            'completado': 'Completado',
            'entregado': 'Entregado',
            'cancelado': 'Cancelado'
        };
        return (
            <span className={`status-badge ${statusMap[estado]}`}>
                <span className="status-badge-dot"></span>
                {statusLabels[estado]}
            </span>
        );
    };

    return (
        <Layout title="Dashboard" subtitle="Panel de Control">
            {/* Stats Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-lg)' }}>
                {stats.map((stat, index) => (
                    <div key={index} className="stats-card">
                        <div className={`stats-card-icon ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stats-card-content">
                            <div className="stats-card-label">{stat.label}</div>
                            <div className="stats-card-value">{stat.value}</div>
                            <div className={`stats-card-change ${stat.changeType}`}>
                                {stat.changeType === 'positive' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {stat.change} vs mes anterior
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2">
                {/* Órdenes Activas */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <ClipboardList size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Órdenes de Trabajo Activas
                        </h3>
                        <Link to="/ordenes" className="btn btn-ghost btn-sm">
                            Ver todas <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Orden #</th>
                                        <th>Cliente</th>
                                        <th>Vehículo</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ordenesActivas.map((orden) => {
                                        const cliente = getClienteById(orden.clienteId);
                                        const vehiculo = getVehiculoById(orden.vehiculoId);
                                        return (
                                            <tr key={orden.id}>
                                                <td><strong>#{orden.id}</strong></td>
                                                <td>{cliente?.nombre.split(' ').slice(0, 2).join(' ')}</td>
                                                <td>{vehiculo?.marca} {vehiculo?.modelo}</td>
                                                <td>{getStatusBadge(orden.estado)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Citas Próximas */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Calendar size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Citas Próximas
                        </h3>
                        <Link to="/citas" className="btn btn-ghost btn-sm">
                            Ver agenda <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {citas.slice(0, 4).map((cita) => {
                                const cliente = getClienteById(cita.clienteId);
                                const vehiculo = getVehiculoById(cita.vehiculoId);
                                return (
                                    <div key={cita.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-md)',
                                        padding: 'var(--spacing-md)',
                                        backgroundColor: 'var(--gray-50)',
                                        borderRadius: 'var(--border-radius)',
                                        borderLeft: '3px solid var(--primary-500)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: 'var(--spacing-sm)',
                                            backgroundColor: 'var(--bg-secondary)',
                                            borderRadius: 'var(--border-radius)',
                                            minWidth: '60px'
                                        }}>
                                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                                {new Date(cita.fecha).toLocaleDateString('es', { month: 'short' })}
                                            </span>
                                            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                                                {new Date(cita.fecha).getDate()}
                                            </span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>
                                                {cliente?.nombre.split(' ').slice(0, 2).join(' ')}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                {vehiculo?.marca} {vehiculo?.modelo} • {cita.tipo}
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            color: 'var(--text-secondary)',
                                            fontSize: 'var(--font-size-sm)'
                                        }}>
                                            <Clock size={14} />
                                            {cita.hora}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Segunda fila */}
            <div className="grid grid-cols-2" style={{ marginTop: 'var(--spacing-lg)' }}>
                {/* Garantías por Vencer */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Shield size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Garantías Activas
                        </h3>
                        <Link to="/garantias" className="btn btn-ghost btn-sm">
                            Ver todas <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            {garantiasActivas.slice(0, 4).map((garantia) => {
                                const vehiculo = getVehiculoById(garantia.vehiculoId);
                                const cliente = getClienteById(garantia.clienteId);
                                const diasRestantes = Math.ceil((new Date(garantia.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24));
                                const esUrgente = diasRestantes <= 90;

                                return (
                                    <div key={garantia.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 'var(--spacing-sm) var(--spacing-md)',
                                        backgroundColor: esUrgente ? 'var(--warning-50)' : 'var(--gray-50)',
                                        borderRadius: 'var(--border-radius)'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                                                {vehiculo?.marca} {vehiculo?.modelo} - {vehiculo?.placa}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                                {cliente?.nombre.split(' ').slice(0, 2).join(' ')} • {garantia.tipo}
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: 'var(--font-size-xs)',
                                            color: esUrgente ? 'var(--warning-600)' : 'var(--text-secondary)'
                                        }}>
                                            {esUrgente ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                                            {diasRestantes} días
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Técnicos Disponibles */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Wrench size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Equipo de Técnicos
                        </h3>
                        <Link to="/tecnicos" className="btn btn-ghost btn-sm">
                            Ver todos <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {tecnicos.map((tecnico) => (
                                <div key={tecnico.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-md)'
                                }}>
                                    <div className="avatar" style={{
                                        background: tecnico.disponible
                                            ? 'linear-gradient(135deg, var(--success-500), var(--success-600))'
                                            : 'linear-gradient(135deg, var(--gray-400), var(--gray-500))'
                                    }}>
                                        {tecnico.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                                            {tecnico.nombre}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                            {tecnico.especialidad}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={`status-badge ${tecnico.disponible ? 'completed' : 'pending'}`}>
                                            <span className="status-badge-dot"></span>
                                            {tecnico.disponible ? 'Disponible' : 'Ocupado'}
                                        </span>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            {tecnico.ordenesActivas} órdenes activas
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
