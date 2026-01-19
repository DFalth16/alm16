import React, { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { Search, Plus, Edit2, Trash2, Eye, Car, User, Calendar, Gauge } from 'lucide-react';
import { vehiculos, getClienteById } from '../../data/mockData';

const VehiculosList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMarca, setFilterMarca] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedVehiculo, setSelectedVehiculo] = useState(null);

    const marcas = [...new Set(vehiculos.map(v => v.marca))];

    const filteredVehiculos = vehiculos.filter(vehiculo => {
        const matchSearch =
            vehiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehiculo.placa.toLowerCase().includes(searchTerm.toLowerCase());
        const matchMarca = !filterMarca || vehiculo.marca === filterMarca;
        return matchSearch && matchMarca;
    });

    const handleViewDetails = (vehiculo) => {
        setSelectedVehiculo(vehiculo);
        setShowDetailModal(true);
    };

    return (
        <Layout title="Gestión de Vehículos" subtitle="Vehículos">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Vehículos</h1>
                    <p className="page-subtitle">Registro de vehículos de los clientes</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        Nuevo Vehículo
                    </button>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="filters-bar">
                <div className="search-bar" style={{ maxWidth: '400px' }}>
                    <Search className="search-bar-icon" size={18} />
                    <input
                        type="text"
                        className="search-bar-input"
                        placeholder="Buscar por marca, modelo o placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={filterMarca}
                    onChange={(e) => setFilterMarca(e.target.value)}
                >
                    <option value="">Todas las marcas</option>
                    {marcas.map(marca => (
                        <option key={marca} value={marca}>{marca}</option>
                    ))}
                </select>
            </div>

            {/* Grid de vehículos */}
            <div className="grid grid-cols-3">
                {filteredVehiculos.map((vehiculo) => {
                    const cliente = getClienteById(vehiculo.clienteId);
                    return (
                        <div key={vehiculo.id} className="card card-clickable" onClick={() => handleViewDetails(vehiculo)}>
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: 'var(--border-radius)',
                                        background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <Car size={24} />
                                    </div>
                                    <span style={{
                                        padding: '4px 10px',
                                        backgroundColor: 'var(--gray-100)',
                                        borderRadius: 'var(--border-radius)',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        color: 'var(--text-primary)'
                                    }}>
                                        {vehiculo.placa}
                                    </span>
                                </div>

                                <h3 style={{
                                    margin: '0 0 4px 0',
                                    fontSize: 'var(--font-size-lg)',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    color: 'var(--text-primary)'
                                }}>
                                    {vehiculo.marca} {vehiculo.modelo}
                                </h3>
                                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                    {vehiculo.anio} • {vehiculo.color}
                                </p>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)',
                                    marginTop: 'var(--spacing-md)',
                                    paddingTop: 'var(--spacing-md)',
                                    borderTop: '1px solid var(--border-color)'
                                }}>
                                    <div className="avatar avatar-sm" style={{
                                        background: 'linear-gradient(135deg, var(--success-500), var(--success-600))'
                                    }}>
                                        {cliente?.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                        {cliente?.nombre.split(' ').slice(0, 2).join(' ')}
                                    </span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: 'var(--spacing-md)',
                                    fontSize: 'var(--font-size-sm)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                                        <Gauge size={14} />
                                        {vehiculo.kilometraje.toLocaleString()} km
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                                        <Calendar size={14} />
                                        {new Date(vehiculo.ultimoServicio).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Nuevo Vehículo */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nuevo Vehículo</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label required">Cliente</label>
                                <select className="form-select">
                                    <option value="">Seleccione un cliente</option>
                                    {[...new Set(vehiculos.map(v => v.clienteId))].map(clienteId => {
                                        const cliente = getClienteById(clienteId);
                                        return (
                                            <option key={clienteId} value={clienteId}>{cliente?.nombre}</option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label required">Marca</label>
                                    <input type="text" className="form-input" placeholder="Ej: Toyota" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">Modelo</label>
                                    <input type="text" className="form-input" placeholder="Ej: Corolla" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label required">Año</label>
                                    <input type="number" className="form-input" placeholder="2024" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">Color</label>
                                    <input type="text" className="form-input" placeholder="Ej: Blanco" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label required">Placa</label>
                                    <input type="text" className="form-input" placeholder="ABC-1234" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">VIN</label>
                                    <input type="text" className="form-input" placeholder="Número de identificación" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Kilometraje Actual</label>
                                <input type="number" className="form-input" placeholder="0" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary">Guardar Vehículo</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalle Vehículo */}
            {showDetailModal && selectedVehiculo && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Detalle del Vehículo</h2>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-lg)',
                                marginBottom: 'var(--spacing-lg)',
                                padding: 'var(--spacing-lg)',
                                backgroundColor: 'var(--gray-50)',
                                borderRadius: 'var(--border-radius-lg)'
                            }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: 'var(--border-radius-lg)',
                                    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <Car size={32} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>
                                        {selectedVehiculo.marca} {selectedVehiculo.modelo}
                                    </h3>
                                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                                        {selectedVehiculo.anio} • {selectedVehiculo.color}
                                    </p>
                                </div>
                                <div style={{
                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderRadius: 'var(--border-radius)',
                                    fontWeight: 'var(--font-weight-bold)',
                                    fontSize: 'var(--font-size-lg)'
                                }}>
                                    {selectedVehiculo.placa}
                                </div>
                            </div>

                            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
                                <div>
                                    <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Información del Vehículo</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--border-color)' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>VIN</span>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 'var(--font-weight-medium)' }}>{selectedVehiculo.vin}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--border-color)' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Kilometraje</span>
                                            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{selectedVehiculo.kilometraje.toLocaleString()} km</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) 0' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Último Servicio</span>
                                            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                {new Date(selectedVehiculo.ultimoServicio).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Propietario</h4>
                                    {(() => {
                                        const cliente = getClienteById(selectedVehiculo.clienteId);
                                        return (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-md)',
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--gray-50)',
                                                borderRadius: 'var(--border-radius)'
                                            }}>
                                                <div className="avatar" style={{
                                                    background: 'linear-gradient(135deg, var(--success-500), var(--success-600))'
                                                }}>
                                                    {cliente?.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{cliente?.nombre}</div>
                                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{cliente?.telefono}</div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Cerrar</button>
                            <button className="btn btn-outline">Ver Historial</button>
                            <button className="btn btn-primary">
                                <Edit2 size={16} />
                                Editar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default VehiculosList;
