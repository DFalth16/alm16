import React, { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { Search, Filter, Download, Calendar, Car, User, Wrench, DollarSign, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { historialServicios, getClienteById, getVehiculoById, getTecnicoById } from '../../data/mockData';

const HistorialServicios = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    const tipos = [...new Set(historialServicios.map(h => h.tipo))];

    const filteredHistorial = historialServicios.filter(item => {
        const cliente = getClienteById(item.clienteId);
        const vehiculo = getVehiculoById(item.vehiculoId);

        const matchSearch =
            cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehiculo?.marca.toLowerCase().includes(searchTerm.toLowerCase());

        const matchTipo = !filterTipo || item.tipo === filterTipo;

        return matchSearch && matchTipo;
    });

    const totalIngresos = filteredHistorial.reduce((sum, item) => sum + item.costo, 0);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <Layout title="Historial de Servicios" subtitle="Historial">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Historial de Servicios</h1>
                    <p className="page-subtitle">Consulta el historial completo de servicios realizados</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-outline">
                        <Download size={18} />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stats-card">
                    <div className="stats-card-icon primary">
                        <FileText size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Total Servicios</div>
                        <div className="stats-card-value">{filteredHistorial.length}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon success">
                        <DollarSign size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Ingresos Totales</div>
                        <div className="stats-card-value">Bs. {totalIngresos.toLocaleString()}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon warning">
                        <Car size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Vehículos Atendidos</div>
                        <div className="stats-card-value">{new Set(filteredHistorial.map(h => h.vehiculoId)).size}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon info">
                        <User size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Clientes Atendidos</div>
                        <div className="stats-card-value">{new Set(filteredHistorial.map(h => h.clienteId)).size}</div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="filters-bar">
                <div className="search-bar" style={{ maxWidth: '350px' }}>
                    <Search className="search-bar-icon" size={18} />
                    <input
                        type="text"
                        className="search-bar-input"
                        placeholder="Buscar por cliente, vehículo o placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                >
                    <option value="">Todos los tipos</option>
                    {tipos.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="date"
                        className="form-input"
                        style={{ width: 'auto' }}
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    />
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                    <input
                        type="date"
                        className="form-input"
                        style={{ width: 'auto' }}
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    />
                </div>
            </div>

            {/* Lista de historial */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}></th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Vehículo</th>
                            <th>Tipo de Servicio</th>
                            <th>Técnico</th>
                            <th>Kilometraje</th>
                            <th>Costo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHistorial.map((item) => {
                            const cliente = getClienteById(item.clienteId);
                            const vehiculo = getVehiculoById(item.vehiculoId);
                            const tecnico = getTecnicoById(item.tecnicoId);
                            const isExpanded = expandedId === item.id;

                            return (
                                <React.Fragment key={item.id}>
                                    <tr
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => toggleExpand(item.id)}
                                    >
                                        <td>
                                            <button className="btn btn-ghost btn-icon btn-sm">
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                {new Date(item.fecha).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                                {new Date(item.fecha).getFullYear()}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                <div className="avatar avatar-sm" style={{
                                                    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
                                                }}>
                                                    {cliente?.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <span>{cliente?.nombre.split(' ').slice(0, 2).join(' ')}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                {vehiculo?.marca} {vehiculo?.modelo}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                                {vehiculo?.placa}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                backgroundColor: item.tipo.includes('Preventivo') ? 'var(--primary-50)' :
                                                    item.tipo.includes('Correctivo') ? 'var(--warning-50)' :
                                                        item.tipo.includes('Garantía') ? 'var(--success-50)' :
                                                            'var(--gray-100)',
                                                color: item.tipo.includes('Preventivo') ? 'var(--primary-700)' :
                                                    item.tipo.includes('Correctivo') ? 'var(--warning-700)' :
                                                        item.tipo.includes('Garantía') ? 'var(--success-700)' :
                                                            'var(--gray-700)',
                                                borderRadius: 'var(--border-radius-full)',
                                                fontSize: 'var(--font-size-xs)',
                                                fontWeight: 'var(--font-weight-medium)'
                                            }}>
                                                {item.tipo}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: 'var(--font-size-sm)' }}>
                                                {tecnico?.nombre.split(' ').slice(0, 2).join(' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }}>
                                                {item.kilometraje.toLocaleString()} km
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                fontWeight: 'var(--font-weight-bold)',
                                                color: item.costo > 0 ? 'var(--success-600)' : 'var(--text-secondary)'
                                            }}>
                                                {item.costo > 0 ? `Bs. ${item.costo}` : 'Sin costo'}
                                            </span>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan="8" style={{ backgroundColor: 'var(--gray-50)', padding: 'var(--spacing-lg)' }}>
                                                <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
                                                    <div>
                                                        <h4 style={{ marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                                                            Servicios Realizados
                                                        </h4>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                                                            {item.servicios.map((servicio, index) => (
                                                                <div key={index} style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 'var(--spacing-sm)',
                                                                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                                                                    backgroundColor: 'var(--bg-secondary)',
                                                                    borderRadius: 'var(--border-radius)'
                                                                }}>
                                                                    <Wrench size={14} style={{ color: 'var(--primary-500)' }} />
                                                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>{servicio}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 style={{ marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                                                            Observaciones
                                                        </h4>
                                                        <p style={{
                                                            margin: 0,
                                                            fontSize: 'var(--font-size-sm)',
                                                            color: 'var(--text-secondary)',
                                                            padding: 'var(--spacing-md)',
                                                            backgroundColor: 'var(--bg-secondary)',
                                                            borderRadius: 'var(--border-radius)',
                                                            borderLeft: '3px solid var(--primary-500)'
                                                        }}>
                                                            {item.observaciones || 'Sin observaciones adicionales.'}
                                                        </p>
                                                        {item.ordenId && (
                                                            <div style={{ marginTop: 'var(--spacing-md)' }}>
                                                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                                                    Orden de trabajo: <strong>#{item.ordenId}</strong>
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div className="pagination">
                <button className="pagination-btn" disabled>←</button>
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn">2</button>
                <button className="pagination-btn">→</button>
            </div>
        </Layout>
    );
};

export default HistorialServicios;
