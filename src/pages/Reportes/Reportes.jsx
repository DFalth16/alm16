import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout/Layout';
import {
    TrendingUp, Users, Car, Wrench,
    BarChart3, PieChart, Clock, Star, RefreshCw, X, CheckCircle
} from 'lucide-react';
import { ordenesService } from '../../services/ordenesService';
import { clientesService } from '../../services/clientesService';
import { vehiculosService } from '../../services/vehiculosService';
import { tecnicosService } from '../../services/tecnicosService';

const Reportes = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ordenes, setOrdenes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('month');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [ordenesRes, clientesRes, vehiculosRes, tecnicosRes] = await Promise.all([
                ordenesService.getAll(),
                clientesService.getAll(),
                vehiculosService.getAll(),
                tecnicosService.getAll()
            ]);

            setOrdenes(ordenesRes.data || []);
            setClientes(clientesRes.data || []);
            setVehiculos(vehiculosRes.data || []);
            setTecnicos(tecnicosRes.data || []);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Calculate statistics from local data
    const calculateStats = useCallback(() => {
        const hoy = new Date();
        let fechaDesde = new Date();

        switch (selectedPeriod) {
            case 'week':
                fechaDesde.setDate(hoy.getDate() - 7);
                break;
            case 'month':
                fechaDesde.setMonth(hoy.getMonth() - 1);
                break;
            case 'quarter':
                fechaDesde.setMonth(hoy.getMonth() - 3);
                break;
            case 'year':
                fechaDesde.setFullYear(hoy.getFullYear() - 1);
                break;
            default:
                fechaDesde.setMonth(hoy.getMonth() - 1);
        }

        // Filter orders by period
        const ordenesEnPeriodo = ordenes.filter(o => {
            const fecha = new Date(o.fecha_ingreso || o.created_at);
            return fecha >= fechaDesde && fecha <= hoy;
        });

        const ordenesCompletadas = ordenesEnPeriodo.filter(o =>
            o.estado === 'completado' || o.estado === 'entregado'
        );

        // Orders by status
        const ordenesActivas = ordenes.filter(o =>
            o.estado === 'pendiente' || o.estado === 'en-proceso'
        ).length;

        // Technician performance
        const tecnicoPerformance = tecnicos.map(tecnico => {
            const ordenesDelTecnico = ordenes.filter(o => o.tecnico_id === tecnico.id);
            const completadas = ordenesDelTecnico.filter(o =>
                o.estado === 'completado' || o.estado === 'entregado'
            ).length;

            return {
                ...tecnico,
                ordenesCompletadas: completadas
            };
        }).sort((a, b) => b.ordenesCompletadas - a.ordenesCompletadas);

        // Top clients by visits
        const clienteOrdenes = {};
        ordenes.forEach(orden => {
            if (orden.cliente_id) {
                if (!clienteOrdenes[orden.cliente_id]) {
                    clienteOrdenes[orden.cliente_id] = {
                        visitas: 0
                    };
                }
                clienteOrdenes[orden.cliente_id].visitas++;
            }
        });

        const topClientes = clientes
            .map(cliente => ({
                ...cliente,
                visitas: clienteOrdenes[cliente.id]?.visitas || 0
            }))
            .filter(c => c.visitas > 0)
            .sort((a, b) => b.visitas - a.visitas)
            .slice(0, 5);

        return {
            totalOrdenes: ordenesEnPeriodo.length,
            ordenesCompletadas: ordenesCompletadas.length,
            ordenesActivas,
            totalClientes: clientes.length,
            totalVehiculos: vehiculos.length,
            totalTecnicos: tecnicos.length,
            tecnicoPerformance,
            topClientes
        };
    }, [ordenes, clientes, vehiculos, tecnicos, selectedPeriod]);

    const stats = calculateStats();

    if (loading) {
        return (
            <Layout title="Reportes" subtitle="Reportes y Estadísticas">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando reportes...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Reportes" subtitle="Reportes y Estadísticas">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <X size={48} style={{ color: 'var(--danger-500)' }} />
                    <p style={{ color: 'var(--danger-600)' }}>Error al cargar reportes: {error}</p>
                    <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Reportes" subtitle="Reportes y Estadísticas">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Reportes y Estadísticas</h1>
                    <p className="page-subtitle">Análisis del rendimiento del taller</p>
                </div>
                <div className="page-actions">
                    <select
                        className="filter-select"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                        <option value="week">Última semana</option>
                        <option value="month">Último mes</option>
                        <option value="quarter">Último trimestre</option>
                        <option value="year">Último año</option>
                    </select>
                    <button className="btn btn-secondary" onClick={loadData}>
                        <RefreshCw size={18} />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* KPIs principales */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="stats-card">
                    <div className="stats-card-icon primary">
                        <Wrench size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Órdenes del Período</div>
                        <div className="stats-card-value">{stats.totalOrdenes}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Órdenes Completadas</div>
                        <div className="stats-card-value">{stats.ordenesCompletadas}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon warning">
                        <Clock size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Órdenes Activas</div>
                        <div className="stats-card-value">{stats.ordenesActivas}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon info">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Tasa de Completado</div>
                        <div className="stats-card-value">
                            {stats.totalOrdenes > 0
                                ? Math.round((stats.ordenesCompletadas / stats.totalOrdenes) * 100)
                                : 0}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="stats-card">
                    <div className="stats-card-icon primary">
                        <Users size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Total Clientes</div>
                        <div className="stats-card-value">{stats.totalClientes}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon info">
                        <Car size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Total Vehículos</div>
                        <div className="stats-card-value">{stats.totalVehiculos}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon success">
                        <Users size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Técnicos Activos</div>
                        <div className="stats-card-value">{stats.totalTecnicos}</div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-xl)' }}>
                {/* Technician Performance */}
                <div className="card">
                    <div className="card-header">
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <BarChart3 size={20} style={{ color: 'var(--primary-500)' }} />
                            Rendimiento de Técnicos
                        </h3>
                    </div>
                    <div className="card-body">
                        {stats.tecnicoPerformance.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {stats.tecnicoPerformance.slice(0, 5).map((tecnico, index) => {
                                    const maxOrdenes = Math.max(...stats.tecnicoPerformance.map(t => t.ordenesCompletadas)) || 1;
                                    const porcentaje = (tecnico.ordenesCompletadas / maxOrdenes) * 100;

                                    return (
                                        <div key={tecnico.id}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                    <span style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        backgroundColor: index === 0 ? 'var(--warning-500)' : 'var(--gray-200)',
                                                        color: index === 0 ? 'white' : 'var(--text-secondary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: 'var(--font-size-sm)',
                                                        fontWeight: 'var(--font-weight-bold)'
                                                    }}>
                                                        {index + 1}
                                                    </span>
                                                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                        {tecnico.nombre}
                                                    </span>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                                        {tecnico.ordenesCompletadas}
                                                    </span>
                                                    <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>
                                                        órdenes
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{
                                                height: '8px',
                                                backgroundColor: 'var(--gray-100)',
                                                borderRadius: 'var(--border-radius-full)',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${porcentaje}%`,
                                                    backgroundColor: index === 0 ? 'var(--success-500)' : 'var(--primary-500)',
                                                    borderRadius: 'var(--border-radius-full)',
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                                No hay datos de técnicos
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Clients */}
                <div className="card">
                    <div className="card-header">
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <Star size={20} style={{ color: 'var(--warning-500)' }} />
                            Clientes Más Frecuentes
                        </h3>
                    </div>
                    <div className="card-body">
                        {stats.topClientes.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {stats.topClientes.map((cliente, index) => (
                                    <div
                                        key={cliente.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: 'var(--spacing-sm)',
                                            backgroundColor: index === 0 ? 'var(--warning-50)' : 'var(--gray-50)',
                                            borderRadius: 'var(--border-radius)',
                                            border: index === 0 ? '1px solid var(--warning-200)' : 'none'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <div className="avatar" style={{
                                                width: '36px',
                                                height: '36px',
                                                fontSize: 'var(--font-size-sm)',
                                                background: index === 0
                                                    ? 'linear-gradient(135deg, var(--warning-500), var(--warning-600))'
                                                    : 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
                                            }}>
                                                {cliente.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                    {cliente.nombre}
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                                    {cliente.telefono || 'Sin teléfono'}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{
                                            fontWeight: 'var(--font-weight-bold)',
                                            color: 'var(--primary-600)'
                                        }}>
                                            {cliente.visitas} visitas
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                                No hay datos de clientes
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Status Distribution */}
            <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <PieChart size={20} style={{ color: 'var(--primary-500)' }} />
                        Distribución de Órdenes por Estado
                    </h3>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-4" style={{ gap: 'var(--spacing-lg)' }}>
                        {[
                            { estado: 'pendiente', label: 'Pendientes', color: 'var(--warning-500)' },
                            { estado: 'en-proceso', label: 'En Proceso', color: 'var(--info-500)' },
                            { estado: 'completado', label: 'Completadas', color: 'var(--success-500)' },
                            { estado: 'entregado', label: 'Entregadas', color: 'var(--primary-500)' }
                        ].map(item => {
                            const count = ordenes.filter(o => o.estado === item.estado).length;
                            const porcentaje = ordenes.length > 0 ? (count / ordenes.length) * 100 : 0;

                            return (
                                <div key={item.estado} style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        background: `conic-gradient(${item.color} ${porcentaje}%, var(--gray-200) ${porcentaje}%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto var(--spacing-md)'
                                    }}>
                                        <div style={{
                                            width: '70px',
                                            height: '70px',
                                            borderRadius: '50%',
                                            backgroundColor: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column'
                                        }}>
                                            <span style={{
                                                fontSize: 'var(--font-size-xl)',
                                                fontWeight: 'var(--font-weight-bold)',
                                                color: item.color
                                            }}>
                                                {count}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{item.label}</div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                        {porcentaje.toFixed(0)}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Reportes;
