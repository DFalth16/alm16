import React, { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import {
    BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Car,
    Wrench, Calendar, Download, Filter, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
    ordenes, clientes, vehiculos, tecnicos, historialServicios,
    getClienteById, getVehiculoById, getTecnicoById
} from '../../data/mockData';

const Reportes = () => {
    const [periodo, setPeriodo] = useState('mes');

    // Estadísticas generales
    const totalServicios = historialServicios.length;
    const ingresosTotales = historialServicios.reduce((sum, h) => sum + h.costo, 0);
    const promedioServicio = Math.round(ingresosTotales / totalServicios);
    const serviciosGarantia = historialServicios.filter(h => h.tipo.includes('Garantía')).length;

    // Servicios por tipo
    const serviciosPorTipo = historialServicios.reduce((acc, h) => {
        acc[h.tipo] = (acc[h.tipo] || 0) + 1;
        return acc;
    }, {});

    const tiposOrdenados = Object.entries(serviciosPorTipo)
        .sort(([, a], [, b]) => b - a);

    // Rendimiento de técnicos
    const rendimientoTecnicos = tecnicos.map(t => {
        const servicios = historialServicios.filter(h => h.tecnicoId === t.id);
        const ingresos = servicios.reduce((sum, s) => sum + s.costo, 0);
        return {
            ...t,
            serviciosCompletados: servicios.length,
            ingresos
        };
    }).sort((a, b) => b.serviciosCompletados - a.serviciosCompletados);

    // Clientes frecuentes
    const serviciosPorCliente = historialServicios.reduce((acc, h) => {
        acc[h.clienteId] = (acc[h.clienteId] || 0) + 1;
        return acc;
    }, {});

    const clientesFrecuentes = Object.entries(serviciosPorCliente)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([clienteId, count]) => ({
            cliente: getClienteById(parseInt(clienteId)),
            servicios: count
        }));

    // Colores para el gráfico de barras simulado
    const colores = [
        'var(--primary-500)',
        'var(--success-500)',
        'var(--warning-500)',
        'var(--info-500)',
        'var(--danger-500)'
    ];

    const maxServicios = Math.max(...tiposOrdenados.map(([, count]) => count));

    return (
        <Layout title="Reportes y Estadísticas" subtitle="Reportes">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Reportes y Estadísticas</h1>
                    <p className="page-subtitle">Análisis detallado del rendimiento del taller</p>
                </div>
                <div className="page-actions">
                    <select
                        className="filter-select"
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value)}
                    >
                        <option value="semana">Esta Semana</option>
                        <option value="mes">Este Mes</option>
                        <option value="trimestre">Este Trimestre</option>
                        <option value="anio">Este Año</option>
                    </select>
                    <button className="btn btn-outline">
                        <Download size={18} />
                        Exportar PDF
                    </button>
                </div>
            </div>

            {/* KPIs principales */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stats-card">
                    <div className="stats-card-icon success">
                        <DollarSign size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Ingresos Totales</div>
                        <div className="stats-card-value">Bs. {ingresosTotales.toLocaleString()}</div>
                        <div className="stats-card-change positive">
                            <TrendingUp size={12} />
                            +15.3% vs periodo anterior
                        </div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon primary">
                        <Wrench size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Servicios Realizados</div>
                        <div className="stats-card-value">{totalServicios}</div>
                        <div className="stats-card-change positive">
                            <TrendingUp size={12} />
                            +8% vs periodo anterior
                        </div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon info">
                        <BarChart3 size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Promedio por Servicio</div>
                        <div className="stats-card-value">Bs. {promedioServicio}</div>
                        <div className="stats-card-change negative">
                            <TrendingDown size={12} />
                            -3% vs periodo anterior
                        </div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon warning">
                        <Users size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Clientes Atendidos</div>
                        <div className="stats-card-value">{new Set(historialServicios.map(h => h.clienteId)).size}</div>
                        <div className="stats-card-change positive">
                            <TrendingUp size={12} />
                            +12% vs periodo anterior
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                {/* Servicios por Tipo */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Servicios por Tipo</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {tiposOrdenados.map(([tipo, count], index) => (
                                <div key={tipo}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                                            {tipo}
                                        </span>
                                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                            {count} servicios
                                        </span>
                                    </div>
                                    <div style={{
                                        height: '8px',
                                        backgroundColor: 'var(--gray-100)',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${(count / maxServicios) * 100}%`,
                                            height: '100%',
                                            backgroundColor: colores[index % colores.length],
                                            borderRadius: '4px',
                                            transition: 'width 0.5s ease'
                                        }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Rendimiento de Técnicos */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Rendimiento de Técnicos</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {rendimientoTecnicos.map((tecnico, index) => (
                                <div key={tecnico.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-md)',
                                    padding: 'var(--spacing-sm)',
                                    backgroundColor: index === 0 ? 'var(--success-50)' : 'transparent',
                                    borderRadius: 'var(--border-radius)'
                                }}>
                                    <span style={{
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 'var(--border-radius-full)',
                                        backgroundColor: index === 0 ? 'var(--success-500)' : 'var(--gray-200)',
                                        color: index === 0 ? 'white' : 'var(--text-secondary)',
                                        fontSize: 'var(--font-size-xs)',
                                        fontWeight: 'var(--font-weight-bold)'
                                    }}>
                                        {index + 1}
                                    </span>
                                    <div className="avatar avatar-sm" style={{
                                        background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
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
                                        <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)' }}>
                                            {tecnico.serviciosCompletados}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                            servicios
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)', color: 'var(--success-600)' }}>
                                            Bs. {tecnico.ingresos.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                            generados
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-lg)' }}>
                {/* Clientes Frecuentes */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Clientes Frecuentes</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {clientesFrecuentes.map(({ cliente, servicios }, index) => (
                                <div key={cliente?.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-md)'
                                }}>
                                    <div className="avatar avatar-sm" style={{
                                        background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
                                    }}>
                                        {cliente?.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                                            {cliente?.nombre.split(' ').slice(0, 2).join(' ')}
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '4px 10px',
                                        backgroundColor: 'var(--primary-100)',
                                        color: 'var(--primary-700)',
                                        borderRadius: 'var(--border-radius-full)',
                                        fontSize: 'var(--font-size-xs)',
                                        fontWeight: 'var(--font-weight-bold)'
                                    }}>
                                        {servicios} visitas
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Resumen de Estado de Órdenes */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Estado de Órdenes</h3>
                    </div>
                    <div className="card-body">
                        {(() => {
                            const estados = [
                                { key: 'pendiente', label: 'Pendientes', color: 'warning' },
                                { key: 'en-proceso', label: 'En Proceso', color: 'info' },
                                { key: 'completado', label: 'Completados', color: 'success' },
                                { key: 'entregado', label: 'Entregados', color: 'primary' }
                            ];

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    {estados.map(estado => {
                                        const count = ordenes.filter(o => o.estado === estado.key).length;
                                        const percent = Math.round((count / ordenes.length) * 100);

                                        return (
                                            <div key={estado.key}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>{estado.label}</span>
                                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)' }}>
                                                        {count} ({percent}%)
                                                    </span>
                                                </div>
                                                <div style={{
                                                    height: '6px',
                                                    backgroundColor: 'var(--gray-100)',
                                                    borderRadius: '3px'
                                                }}>
                                                    <div style={{
                                                        width: `${percent}%`,
                                                        height: '100%',
                                                        backgroundColor: `var(--${estado.color}-500)`,
                                                        borderRadius: '3px'
                                                    }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Métricas Rápidas */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Métricas del Período</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--spacing-sm)',
                                backgroundColor: 'var(--gray-50)',
                                borderRadius: 'var(--border-radius)'
                            }}>
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                    Tiempo promedio de servicio
                                </span>
                                <span style={{ fontWeight: 'var(--font-weight-bold)' }}>2.5 días</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--spacing-sm)',
                                backgroundColor: 'var(--gray-50)',
                                borderRadius: 'var(--border-radius)'
                            }}>
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                    Tasa de satisfacción
                                </span>
                                <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--success-600)' }}>94%</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--spacing-sm)',
                                backgroundColor: 'var(--gray-50)',
                                borderRadius: 'var(--border-radius)'
                            }}>
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                    Servicios en garantía
                                </span>
                                <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{serviciosGarantia}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--spacing-sm)',
                                backgroundColor: 'var(--gray-50)',
                                borderRadius: 'var(--border-radius)'
                            }}>
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                    Nuevos clientes
                                </span>
                                <span style={{ fontWeight: 'var(--font-weight-bold)', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success-600)' }}>
                                    <ArrowUpRight size={14} />
                                    3
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--spacing-sm)',
                                backgroundColor: 'var(--gray-50)',
                                borderRadius: 'var(--border-radius)'
                            }}>
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                    Vehículos atendidos
                                </span>
                                <span style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                    {new Set(historialServicios.map(h => h.vehiculoId)).size}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Reportes;
