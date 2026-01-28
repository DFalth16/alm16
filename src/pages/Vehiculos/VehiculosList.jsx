import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
    Search, Plus, Car, User, Eye, X, Filter
} from 'lucide-react';
import { vehiculosService } from '../../services/vehiculosService';
import { clientesService } from '../../services/clientesService';

const VehiculosList = () => {
    const [vehiculos, setVehiculos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMarca, setFilterMarca] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [selectedVehiculo, setSelectedVehiculo] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        cliente_id: '',
        marca: '',
        modelo: '',
        anio: new Date().getFullYear(),
        placa: '',
        color: '',
        vin: '',
        kilometraje: 0
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [vehiculosRes, clientesRes] = await Promise.all([
                vehiculosService.getAll(),
                clientesService.getAll()
            ]);

            setVehiculos(vehiculosRes.data || []);
            setClientes(clientesRes.data || []);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Get unique brands for filter
    const marcasUnicas = [...new Set(vehiculos.map(v => v.marca).filter(Boolean))].sort();

    // Filter vehicles
    const filteredVehiculos = vehiculos.filter(vehiculo => {
        const matchSearch =
            vehiculo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehiculo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehiculo.placa?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchMarca = !filterMarca || vehiculo.marca === filterMarca;

        return matchSearch && matchMarca;
    });

    const getClienteById = (id) => clientes.find(c => c.id === id);

    const handleViewDetails = (vehiculo) => {
        setSelectedVehiculo(vehiculo);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedVehiculo(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitNewVehicle = async (e) => {
        e.preventDefault();

        if (!formData.cliente_id) {
            alert('Por favor selecciona un cliente');
            return;
        }

        setSaving(true);

        try {
            await vehiculosService.create({
                cliente_id: formData.cliente_id,
                marca: formData.marca,
                modelo: formData.modelo,
                anio: parseInt(formData.anio) || new Date().getFullYear(),
                placa: formData.placa.toUpperCase(),
                color: formData.color || null,
                vin: formData.vin || null,
                kilometraje: parseInt(formData.kilometraje) || 0
            });

            setShowNewModal(false);
            setFormData({
                cliente_id: '',
                marca: '',
                modelo: '',
                anio: new Date().getFullYear(),
                placa: '',
                color: '',
                vin: '',
                kilometraje: 0
            });
            await loadData();
        } catch (err) {
            console.error('Error creating vehicle:', err);
            alert('Error al crear vehículo: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Vehículos" subtitle="Gestión de Vehículos">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando vehículos...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Vehículos" subtitle="Gestión de Vehículos">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <X size={48} style={{ color: 'var(--danger-500)' }} />
                    <p style={{ color: 'var(--danger-600)' }}>Error al cargar los vehículos: {error}</p>
                    <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Vehículos" subtitle="Gestión de Vehículos">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Vehículos</h1>
                    <p className="page-subtitle">Gestiona los vehículos de tus clientes</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                        <Plus size={18} />
                        Nuevo Vehículo
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stats-card">
                    <div className="stats-card-icon primary">
                        <Car size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Total Vehículos</div>
                        <div className="stats-card-value">{vehiculos.length}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon success">
                        <Filter size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Marcas</div>
                        <div className="stats-card-value">{marcasUnicas.length}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon info">
                        <User size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Clientes</div>
                        <div className="stats-card-value">{clientes.length}</div>
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
                    {marcasUnicas.map(marca => (
                        <option key={marca} value={marca}>{marca}</option>
                    ))}
                </select>
                {filterMarca && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setFilterMarca('')}>
                        Limpiar filtro
                    </button>
                )}
            </div>

            {/* Grid de Vehículos */}
            <div className="grid grid-cols-3">
                {filteredVehiculos.map((vehiculo) => {
                    const cliente = vehiculo.clientes || getClienteById(vehiculo.cliente_id);

                    return (
                        <div key={vehiculo.id} className="card">
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: 'var(--border-radius)',
                                            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Car size={24} style={{ color: 'white' }} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0 }}>{vehiculo.marca} {vehiculo.modelo}</h4>
                                            <span style={{
                                                fontSize: 'var(--font-size-sm)',
                                                color: 'var(--primary-600)',
                                                fontWeight: 'var(--font-weight-medium)'
                                            }}>
                                                {vehiculo.placa}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => handleViewDetails(vehiculo)}
                                    >
                                        <Eye size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                                    <div style={{ fontSize: 'var(--font-size-sm)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Año: </span>
                                        <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{vehiculo.anio}</span>
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-sm)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Color: </span>
                                        <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{vehiculo.color || '-'}</span>
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', gridColumn: 'span 2' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Km: </span>
                                        <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                            {vehiculo.kilometraje?.toLocaleString() || 0}
                                        </span>
                                    </div>
                                </div>

                                {cliente && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-sm)',
                                        paddingTop: 'var(--spacing-sm)',
                                        borderTop: '1px solid var(--border-color)'
                                    }}>
                                        <User size={14} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                            {cliente.nombre}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredVehiculos.length === 0 && (
                <div className="empty-state">
                    <Car className="empty-state-icon" />
                    <h3 className="empty-state-title">No se encontraron vehículos</h3>
                    <p className="empty-state-description">
                        {searchTerm || filterMarca ? 'Intenta con otros filtros' : 'Comienza agregando tu primer vehículo'}
                    </p>
                    {!searchTerm && !filterMarca && (
                        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                            <Plus size={18} />
                            Nuevo Vehículo
                        </button>
                    )}
                </div>
            )}

            {/* Modal Ver Vehículo */}
            {showModal && selectedVehiculo && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Detalle del Vehículo</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <div className="modal-body">
                            {(() => {
                                const cliente = selectedVehiculo.clientes || getClienteById(selectedVehiculo.cliente_id);

                                return (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                                            <div style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: 'var(--border-radius-lg)',
                                                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Car size={40} style={{ color: 'white' }} />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0 }}>{selectedVehiculo.marca} {selectedVehiculo.modelo}</h3>
                                                <span style={{
                                                    fontSize: 'var(--font-size-lg)',
                                                    color: 'var(--primary-600)',
                                                    fontWeight: 'var(--font-weight-bold)'
                                                }}>
                                                    {selectedVehiculo.placa}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--gray-50)',
                                                borderRadius: 'var(--border-radius)'
                                            }}>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '4px' }}>Año</div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{selectedVehiculo.anio}</div>
                                            </div>
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--gray-50)',
                                                borderRadius: 'var(--border-radius)'
                                            }}>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '4px' }}>Color</div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{selectedVehiculo.color || 'No especificado'}</div>
                                            </div>
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--gray-50)',
                                                borderRadius: 'var(--border-radius)'
                                            }}>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '4px' }}>Kilometraje</div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{selectedVehiculo.kilometraje?.toLocaleString() || 0} km</div>
                                            </div>
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--gray-50)',
                                                borderRadius: 'var(--border-radius)'
                                            }}>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '4px' }}>VIN</div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                                                    {selectedVehiculo.vin || 'No registrado'}
                                                </div>
                                            </div>
                                        </div>

                                        {cliente && (
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--primary-50)',
                                                borderRadius: 'var(--border-radius)',
                                                border: '1px solid var(--primary-200)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--primary-700)', marginBottom: 'var(--spacing-xs)' }}>
                                                    <User size={16} />
                                                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Propietario</span>
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                                                    {cliente.nombre}
                                                </div>
                                                {cliente.telefono && (
                                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                        {cliente.telefono}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={handleCloseModal}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nuevo Vehículo */}
            {showNewModal && (
                <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nuevo Vehículo</h2>
                            <button className="modal-close" onClick={() => setShowNewModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmitNewVehicle}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label required">Propietario</label>
                                    <select
                                        className="form-input"
                                        name="cliente_id"
                                        value={formData.cliente_id}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Seleccionar cliente...</option>
                                        {clientes.map(cliente => (
                                            <option key={cliente.id} value={cliente.id}>
                                                {cliente.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label required">Marca</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="marca"
                                            value={formData.marca}
                                            onChange={handleInputChange}
                                            placeholder="Ej: Toyota"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Modelo</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="modelo"
                                            value={formData.modelo}
                                            onChange={handleInputChange}
                                            placeholder="Ej: Corolla"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label required">Año</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            name="anio"
                                            value={formData.anio}
                                            onChange={handleInputChange}
                                            min="1900"
                                            max={new Date().getFullYear() + 1}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Placa</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="placa"
                                            value={formData.placa}
                                            onChange={handleInputChange}
                                            placeholder="ABC-1234"
                                            style={{ textTransform: 'uppercase' }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Color</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleInputChange}
                                            placeholder="Ej: Blanco"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Kilometraje</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            name="kilometraje"
                                            value={formData.kilometraje}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">VIN (Número de Serie)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="vin"
                                        value={formData.vin}
                                        onChange={handleInputChange}
                                        placeholder="Número de identificación del vehículo"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowNewModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Guardando...' : 'Guardar Vehículo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default VehiculosList;
