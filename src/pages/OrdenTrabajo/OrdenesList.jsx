import React, { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import {
    Search, Plus, Edit2, Eye, Filter, Clock, User, Car,
    CheckCircle, AlertCircle, Wrench, DollarSign
} from 'lucide-react';
import { ordenes, getClienteById, getVehiculoById, getTecnicoById } from '../../data/mockData';

const OrdenesList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedOrden, setSelectedOrden] = useState(null);

    const estados = [
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'en-proceso', label: 'En Proceso' },
        { value: 'completado', label: 'Completado' },
        { value: 'entregado', label: 'Entregado' }
    ];

    const filteredOrdenes = ordenes.filter(orden => {
        const cliente = getClienteById(orden.clienteId);
        const vehiculo = getVehiculoById(orden.vehiculoId);
        const matchSearch =
            orden.id.toString().includes(searchTerm) ||
            cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase());
        const matchEstado = !filterEstado || orden.estado === filterEstado;
        return matchSearch && matchEstado;
    });

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

    const getStatusIcon = (estado) => {
        switch (estado) {
            case 'pendiente': return <AlertCircle size={16} style={{ color: 'var(--warning-500)' }} />;
            case 'en-proceso': return <Clock size={16} style={{ color: 'var(--info-500)' }} />;
            case 'completado': return <CheckCircle size={16} style={{ color: 'var(--success-500)' }} />;
            case 'entregado': return <CheckCircle size={16} style={{ color: 'var(--primary-500)' }} />;
            default: return null;
        }
    };

    const handleViewDetails = (orden) => {
        setSelectedOrden(orden);
        setShowModal(true);
    };

    return (
        <Layout title="Órdenes de Trabajo" subtitle="Órdenes">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Órdenes de Trabajo</h1>
                    <p className="page-subtitle">Gestiona todas las órdenes de servicio del taller</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        Nueva Orden
                    </button>
                </div>
            </div>

            {/* Stats rápidos */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-lg)' }}>
                {estados.map(estado => {
                    const count = ordenes.filter(o => o.estado === estado.value).length;
                    return (
                        <div
                            key={estado.value}
                            className="card card-clickable"
                            style={{
                                cursor: 'pointer',
                                borderLeft: `3px solid ${estado.value === 'pendiente' ? 'var(--warning-500)' :
                                        estado.value === 'en-proceso' ? 'var(--info-500)' :
                                            estado.value === 'completado' ? 'var(--success-500)' :
                                                'var(--primary-500)'
                                    }`
                            }}
                            onClick={() => setFilterEstado(filterEstado === estado.value ? '' : estado.value)}
                        >
                            <div className="card-body" style={{ padding: 'var(--spacing-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>{count}</div>
                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{estado.label}</div>
                                    </div>
                                    {getStatusIcon(estado.value)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filtros y búsqueda */}
            <div className="filters-bar">
                <div className="search-bar" style={{ maxWidth: '400px' }}>
                    <Search className="search-bar-icon" size={18} />
                    <input
                        type="text"
                        className="search-bar-input"
                        placeholder="Buscar por # orden, cliente o placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                >
                    <option value="">Todos los estados</option>
                    {estados.map(estado => (
                        <option key={estado.value} value={estado.value}>{estado.label}</option>
                    ))}
                </select>
            </div>

            {/* Lista de órdenes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {filteredOrdenes.map((orden) => {
                    const cliente = getClienteById(orden.clienteId);
                    const vehiculo = getVehiculoById(orden.vehiculoId);
                    const tecnico = getTecnicoById(orden.tecnicoId);

                    return (
                        <div key={orden.id} className="card">
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                                    {/* Info principal */}
                                    <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: 'var(--border-radius)',
                                            backgroundColor: orden.estado === 'pendiente' ? 'var(--warning-100)' :
                                                orden.estado === 'en-proceso' ? 'var(--info-100)' :
                                                    orden.estado === 'completado' ? 'var(--success-100)' :
                                                        'var(--primary-100)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: orden.estado === 'pendiente' ? 'var(--warning-600)' :
                                                orden.estado === 'en-proceso' ? 'var(--info-600)' :
                                                    orden.estado === 'completado' ? 'var(--success-600)' :
                                                        'var(--primary-600)'
                                        }}>
                                            <Wrench size={24} />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '4px' }}>
                                                <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                                                    Orden #{orden.id}
                                                </span>
                                                {getStatusBadge(orden.estado)}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                {orden.tipo} • {orden.descripcion}
                                            </div>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-sm)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)' }}>
                                                    <User size={14} style={{ color: 'var(--text-muted)' }} />
                                                    {cliente?.nombre.split(' ').slice(0, 2).join(' ')}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)' }}>
                                                    <Car size={14} style={{ color: 'var(--text-muted)' }} />
                                                    {vehiculo?.marca} {vehiculo?.modelo} ({vehiculo?.placa})
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info adicional */}
                                    <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'flex-start' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '2px' }}>Técnico</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div className="avatar avatar-sm" style={{
                                                    background: 'linear-gradient(135deg, var(--success-500), var(--success-600))'
                                                }}>
                                                    {tecnico?.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                                                    {tecnico?.nombre.split(' ')[0]}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '2px' }}>Fecha Est.</div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                                                {new Date(orden.fechaEstimada).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '2px' }}>Costo</div>
                                            <div style={{
                                                fontSize: 'var(--font-size-sm)',
                                                fontWeight: 'var(--font-weight-bold)',
                                                color: 'var(--success-600)'
                                            }}>
                                                Bs. {orden.costoFinal || orden.costoEstimado}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => handleViewDetails(orden)}
                                            >
                                                <Eye size={14} />
                                                Ver Detalle
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Servicios */}
                                <div style={{
                                    marginTop: 'var(--spacing-md)',
                                    paddingTop: 'var(--spacing-md)',
                                    borderTop: '1px solid var(--border-color)',
                                    display: 'flex',
                                    gap: 'var(--spacing-sm)',
                                    flexWrap: 'wrap'
                                }}>
                                    {orden.servicios.map((servicio, index) => (
                                        <span key={index} style={{
                                            padding: '4px 10px',
                                            backgroundColor: 'var(--gray-100)',
                                            borderRadius: 'var(--border-radius-full)',
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {servicio}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Detalle Orden */}
            {showModal && selectedOrden && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Orden de Trabajo #{selectedOrden.id}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                <div>
                                    <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>{selectedOrden.tipo}</span>
                                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{selectedOrden.descripcion}</p>
                                </div>
                                {getStatusBadge(selectedOrden.estado)}
                            </div>

                            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                                <div className="card">
                                    <div className="card-header">
                                        <h4 className="card-title">Cliente y Vehículo</h4>
                                    </div>
                                    <div className="card-body">
                                        {(() => {
                                            const cliente = getClienteById(selectedOrden.clienteId);
                                            const vehiculo = getVehiculoById(selectedOrden.vehiculoId);
                                            return (
                                                <>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                                                        <User size={18} style={{ color: 'var(--primary-500)' }} />
                                                        <div>
                                                            <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{cliente?.nombre}</div>
                                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{cliente?.telefono}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                        <Car size={18} style={{ color: 'var(--primary-500)' }} />
                                                        <div>
                                                            <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{vehiculo?.marca} {vehiculo?.modelo}</div>
                                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                                Placa: {vehiculo?.placa} • {vehiculo?.kilometraje.toLocaleString()} km
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h4 className="card-title">Fechas y Costos</h4>
                                    </div>
                                    <div className="card-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                            <div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Fecha Ingreso</div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                    {new Date(selectedOrden.fechaIngreso).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Fecha Estimada</div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                    {new Date(selectedOrden.fechaEstimada).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Costo Estimado</div>
                                                <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                                                    Bs. {selectedOrden.costoEstimado}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Costo Final</div>
                                                <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--success-600)' }}>
                                                    {selectedOrden.costoFinal ? `Bs. ${selectedOrden.costoFinal}` : 'Pendiente'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h4 className="card-title">Servicios Realizados</h4>
                                </div>
                                <div className="card-body">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                        {selectedOrden.servicios.map((servicio, index) => (
                                            <div key={index} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-md)',
                                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                                backgroundColor: 'var(--gray-50)',
                                                borderRadius: 'var(--border-radius)'
                                            }}>
                                                <CheckCircle size={16} style={{ color: 'var(--success-500)' }} />
                                                <span>{servicio}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {selectedOrden.observaciones && (
                                <div className="card" style={{ marginTop: 'var(--spacing-md)' }}>
                                    <div className="card-header">
                                        <h4 className="card-title">Observaciones</h4>
                                    </div>
                                    <div className="card-body">
                                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{selectedOrden.observaciones}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                            <button className="btn btn-outline">Imprimir</button>
                            <button className="btn btn-primary">
                                <Edit2 size={16} />
                                Editar Orden
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default OrdenesList;
