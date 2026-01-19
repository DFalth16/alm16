import React, { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { Search, Plus, Shield, AlertTriangle, CheckCircle, Clock, Car, User, Calendar, Edit2, Eye } from 'lucide-react';
import { garantias, getClienteById, getVehiculoById } from '../../data/mockData';

const GarantiasList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedGarantia, setSelectedGarantia] = useState(null);

    const filteredGarantias = garantias.filter(garantia => {
        const vehiculo = getVehiculoById(garantia.vehiculoId);
        const cliente = getClienteById(garantia.clienteId);

        const matchSearch =
            vehiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            garantia.tipo.toLowerCase().includes(searchTerm.toLowerCase());

        const matchEstado = !filterEstado || garantia.estado === filterEstado;

        return matchSearch && matchEstado;
    });

    const garantiasActivas = garantias.filter(g => g.estado === 'activa').length;
    const garantiasVencidas = garantias.filter(g => g.estado === 'vencida').length;
    const garantiasPorVencer = garantias.filter(g => {
        if (g.estado !== 'activa') return false;
        const diasRestantes = Math.ceil((new Date(g.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24));
        return diasRestantes <= 90;
    }).length;

    const getDiasRestantes = (fechaVencimiento) => {
        return Math.ceil((new Date(fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24));
    };

    const getEstadoVisual = (garantia) => {
        if (garantia.estado === 'vencida') {
            return { color: 'danger', label: 'Vencida', icon: AlertTriangle };
        }
        const diasRestantes = getDiasRestantes(garantia.fechaVencimiento);
        if (diasRestantes <= 30) {
            return { color: 'danger', label: 'Por vencer', icon: AlertTriangle };
        }
        if (diasRestantes <= 90) {
            return { color: 'warning', label: 'Próxima', icon: Clock };
        }
        return { color: 'success', label: 'Activa', icon: CheckCircle };
    };

    const handleViewDetails = (garantia) => {
        setSelectedGarantia(garantia);
        setShowModal(true);
    };

    return (
        <Layout title="Gestión de Garantías" subtitle="Garantías">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Garantías</h1>
                    <p className="page-subtitle">Administra las garantías de vehículos y servicios</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        Nueva Garantía
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stats-card">
                    <div className="stats-card-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Garantías Activas</div>
                        <div className="stats-card-value">{garantiasActivas}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon warning">
                        <Clock size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Próximas a Vencer (90 días)</div>
                        <div className="stats-card-value">{garantiasPorVencer}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon danger">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Garantías Vencidas</div>
                        <div className="stats-card-value">{garantiasVencidas}</div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="filters-bar">
                <div className="search-bar" style={{ maxWidth: '400px' }}>
                    <Search className="search-bar-icon" size={18} />
                    <input
                        type="text"
                        className="search-bar-input"
                        placeholder="Buscar por cliente, vehículo o tipo..."
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
                    <option value="activa">Activas</option>
                    <option value="vencida">Vencidas</option>
                </select>
            </div>

            {/* Lista de garantías */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {filteredGarantias.map((garantia) => {
                    const vehiculo = getVehiculoById(garantia.vehiculoId);
                    const cliente = getClienteById(garantia.clienteId);
                    const estado = getEstadoVisual(garantia);
                    const diasRestantes = getDiasRestantes(garantia.fechaVencimiento);
                    const EstadoIcon = estado.icon;

                    return (
                        <div key={garantia.id} className="card">
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    {/* Info principal */}
                                    <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: 'var(--border-radius)',
                                            backgroundColor: `var(--${estado.color}-100)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: `var(--${estado.color}-600)`
                                        }}>
                                            <Shield size={28} />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '4px' }}>
                                                <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                                                    {garantia.tipo}
                                                </span>
                                                <span className={`status-badge ${estado.color === 'success' ? 'completed' : estado.color === 'warning' ? 'pending' : 'cancelled'}`}>
                                                    <span className="status-badge-dot"></span>
                                                    {estado.label}
                                                </span>
                                            </div>
                                            <p style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                {garantia.descripcion}
                                            </p>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
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

                                    {/* Fechas y acciones */}
                                    <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'flex-start' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Inicio</div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                                                {new Date(garantia.fechaInicio).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Vencimiento</div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                                                {new Date(garantia.fechaVencimiento).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                        <div style={{
                                            textAlign: 'center',
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            backgroundColor: `var(--${estado.color}-50)`,
                                            borderRadius: 'var(--border-radius)',
                                            minWidth: '80px'
                                        }}>
                                            <div style={{
                                                fontSize: 'var(--font-size-xl)',
                                                fontWeight: 'var(--font-weight-bold)',
                                                color: `var(--${estado.color}-600)`
                                            }}>
                                                {garantia.estado === 'vencida' ? '0' : diasRestantes}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: `var(--${estado.color}-600)` }}>
                                                días
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => handleViewDetails(garantia)}
                                            >
                                                <Eye size={14} />
                                                Ver Detalle
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Cobertura */}
                                <div style={{
                                    marginTop: 'var(--spacing-md)',
                                    paddingTop: 'var(--spacing-md)',
                                    borderTop: '1px solid var(--border-color)'
                                }}>
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginRight: 'var(--spacing-sm)' }}>
                                        Cobertura:
                                    </span>
                                    {garantia.cobertura.map((item, index) => (
                                        <span key={index} style={{
                                            display: 'inline-block',
                                            padding: '2px 8px',
                                            margin: '2px',
                                            backgroundColor: 'var(--gray-100)',
                                            borderRadius: 'var(--border-radius-full)',
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {item}
                                        </span>
                                    ))}
                                    {garantia.kilometrajeMaximo && (
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '2px 8px',
                                            margin: '2px',
                                            backgroundColor: 'var(--primary-50)',
                                            borderRadius: 'var(--border-radius-full)',
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--primary-700)'
                                        }}>
                                            Hasta {garantia.kilometrajeMaximo.toLocaleString()} km
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Detalle */}
            {showModal && selectedGarantia && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Detalle de Garantía</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {(() => {
                                const vehiculo = getVehiculoById(selectedGarantia.vehiculoId);
                                const cliente = getClienteById(selectedGarantia.clienteId);
                                const estado = getEstadoVisual(selectedGarantia);
                                const diasRestantes = getDiasRestantes(selectedGarantia.fechaVencimiento);

                                return (
                                    <>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-lg)',
                                            marginBottom: 'var(--spacing-lg)',
                                            padding: 'var(--spacing-lg)',
                                            backgroundColor: `var(--${estado.color}-50)`,
                                            borderRadius: 'var(--border-radius-lg)'
                                        }}>
                                            <div style={{
                                                width: '64px',
                                                height: '64px',
                                                borderRadius: 'var(--border-radius-lg)',
                                                backgroundColor: `var(--${estado.color}-100)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: `var(--${estado.color}-600)`
                                            }}>
                                                <Shield size={32} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ margin: 0 }}>{selectedGarantia.tipo}</h3>
                                                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{selectedGarantia.descripcion}</p>
                                            </div>
                                            <div style={{
                                                textAlign: 'center',
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--bg-secondary)',
                                                borderRadius: 'var(--border-radius)'
                                            }}>
                                                <div style={{
                                                    fontSize: 'var(--font-size-2xl)',
                                                    fontWeight: 'var(--font-weight-bold)',
                                                    color: `var(--${estado.color}-600)`
                                                }}>
                                                    {selectedGarantia.estado === 'vencida' ? '0' : diasRestantes}
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                    días restantes
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                                            <div>
                                                <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Vehículo</h4>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--spacing-md)',
                                                    padding: 'var(--spacing-md)',
                                                    backgroundColor: 'var(--gray-50)',
                                                    borderRadius: 'var(--border-radius)'
                                                }}>
                                                    <Car size={24} style={{ color: 'var(--primary-500)' }} />
                                                    <div>
                                                        <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                            {vehiculo?.marca} {vehiculo?.modelo} ({vehiculo?.anio})
                                                        </div>
                                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                            Placa: {vehiculo?.placa} • VIN: {vehiculo?.vin}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Cliente</h4>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--spacing-md)',
                                                    padding: 'var(--spacing-md)',
                                                    backgroundColor: 'var(--gray-50)',
                                                    borderRadius: 'var(--border-radius)'
                                                }}>
                                                    <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))' }}>
                                                        {cliente?.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{cliente?.nombre}</div>
                                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{cliente?.telefono}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Elementos Cubiertos</h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                                                {selectedGarantia.cobertura.map((item, index) => (
                                                    <span key={index} style={{
                                                        padding: '8px 16px',
                                                        backgroundColor: 'var(--success-50)',
                                                        color: 'var(--success-700)',
                                                        borderRadius: 'var(--border-radius)',
                                                        fontSize: 'var(--font-size-sm)',
                                                        fontWeight: 'var(--font-weight-medium)'
                                                    }}>
                                                        <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 'var(--spacing-lg)' }}>
                                            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Vigencia</h4>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                                                <div style={{ flex: 1, padding: 'var(--spacing-md)', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--border-radius)' }}>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Fecha de Inicio</div>
                                                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                        {new Date(selectedGarantia.fechaInicio).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1, padding: 'var(--spacing-md)', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--border-radius)' }}>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Fecha de Vencimiento</div>
                                                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                        {new Date(selectedGarantia.fechaVencimiento).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </div>
                                                </div>
                                                {selectedGarantia.kilometrajeMaximo && (
                                                    <div style={{ flex: 1, padding: 'var(--spacing-md)', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--border-radius)' }}>
                                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Kilometraje Máximo</div>
                                                        <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                            {selectedGarantia.kilometrajeMaximo.toLocaleString()} km
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                            <button className="btn btn-outline">Registrar Reclamo</button>
                            <button className="btn btn-primary">
                                <Edit2 size={16} />
                                Editar Garantía
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default GarantiasList;
