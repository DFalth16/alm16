import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
    Search, Plus, Shield, Eye, Calendar, Car, User,
    X, Clock, CheckCircle, AlertTriangle
} from 'lucide-react';
import { garantiasService } from '../../services/garantiasService';
import { clientesService } from '../../services/clientesService';
import { vehiculosService } from '../../services/vehiculosService';

const GarantiasList = () => {
    const [garantias, setGarantias] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [selectedGarantia, setSelectedGarantia] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        cliente_id: '',
        vehiculo_id: '',
        tipo: 'servicio',
        descripcion: '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        duracion_meses: 6,
        kilometraje_maximo: ''
    });
    const [vehiculosCliente, setVehiculosCliente] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [garantiasRes, clientesRes, vehiculosRes] = await Promise.all([
                garantiasService.getAll(),
                clientesService.getAll(),
                vehiculosService.getAll()
            ]);

            setGarantias(garantiasRes.data || []);
            setClientes(clientesRes.data || []);
            setVehiculos(vehiculosRes.data || []);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper functions
    const getClienteById = (id) => clientes.find(c => c.id === id);
    const getVehiculoById = (id) => vehiculos.find(v => v.id === id);

    // Calculate days remaining
    const getDaysRemaining = (fechaVencimiento) => {
        const hoy = new Date();
        const vencimiento = new Date(fechaVencimiento);
        const diff = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
        return diff;
    };

    // Filter warranties
    const filteredGarantias = garantias.filter(garantia => {
        const cliente = garantia.clientes || getClienteById(garantia.cliente_id);
        const vehiculo = garantia.vehiculos || getVehiculoById(garantia.vehiculo_id);

        const matchSearch =
            cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehiculo?.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            garantia.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchEstado = !filterEstado || garantia.estado === filterEstado;

        return matchSearch && matchEstado;
    });

    const getStatusBadge = (estado, diasRestantes) => {
        if (estado === 'vencida') {
            return { class: 'danger', label: 'Vencida', icon: X };
        }
        if (estado === 'reclamada') {
            return { class: 'warning', label: 'Reclamada', icon: AlertTriangle };
        }
        if (diasRestantes <= 30) {
            return { class: 'warning', label: 'Por vencer', icon: Clock };
        }
        return { class: 'success', label: 'Activa', icon: CheckCircle };
    };

    const handleViewDetails = (garantia) => {
        setSelectedGarantia(garantia);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedGarantia(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // When client changes, load their vehicles
        if (name === 'cliente_id' && value) {
            const clienteVehiculos = vehiculos.filter(v => v.cliente_id === value);
            setVehiculosCliente(clienteVehiculos);
            setFormData(prev => ({ ...prev, vehiculo_id: '' }));
        }
    };

    const handleSubmitNewGarantia = async (e) => {
        e.preventDefault();

        if (!formData.cliente_id || !formData.vehiculo_id) {
            alert('Por favor selecciona cliente y vehículo');
            return;
        }

        setSaving(true);

        try {
            // Calculate end date
            const fechaInicio = new Date(formData.fecha_inicio);
            const fechaVencimiento = new Date(fechaInicio);
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + parseInt(formData.duracion_meses));

            await garantiasService.create({
                cliente_id: formData.cliente_id,
                vehiculo_id: formData.vehiculo_id,
                tipo: formData.tipo,
                descripcion: formData.descripcion,
                fecha_inicio: formData.fecha_inicio,
                fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
                kilometraje_maximo: formData.kilometraje_maximo ? parseInt(formData.kilometraje_maximo) : null,
                estado: 'activa'
            });

            setShowNewModal(false);
            setFormData({
                cliente_id: '',
                vehiculo_id: '',
                tipo: 'servicio',
                descripcion: '',
                fecha_inicio: new Date().toISOString().split('T')[0],
                duracion_meses: 6,
                kilometraje_maximo: ''
            });
            setVehiculosCliente([]);
            await loadData();
        } catch (err) {
            console.error('Error creating warranty:', err);
            alert('Error al crear garantía: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Stats
    const activas = garantias.filter(g => g.estado === 'activa').length;
    const porVencer = garantias.filter(g => g.estado === 'activa' && getDaysRemaining(g.fecha_vencimiento) <= 30).length;
    const vencidas = garantias.filter(g => g.estado === 'vencida').length;

    if (loading) {
        return (
            <Layout title="Garantías" subtitle="Gestión de Garantías">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando garantías...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Garantías" subtitle="Gestión de Garantías">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <X size={48} style={{ color: 'var(--danger-500)' }} />
                    <p style={{ color: 'var(--danger-600)' }}>Error al cargar las garantías: {error}</p>
                    <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Garantías" subtitle="Gestión de Garantías">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Garantías</h1>
                    <p className="page-subtitle">Control de garantías de servicios</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                        <Plus size={18} />
                        Nueva Garantía
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stats-card" onClick={() => setFilterEstado('')} style={{ cursor: 'pointer' }}>
                    <div className="stats-card-icon primary">
                        <Shield size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Total</div>
                        <div className="stats-card-value">{garantias.length}</div>
                    </div>
                </div>
                <div className="stats-card" onClick={() => setFilterEstado('activa')} style={{ cursor: 'pointer' }}>
                    <div className="stats-card-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Activas</div>
                        <div className="stats-card-value">{activas}</div>
                    </div>
                </div>
                <div className="stats-card" style={{ cursor: 'pointer' }}>
                    <div className="stats-card-icon warning">
                        <Clock size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Por Vencer (30 días)</div>
                        <div className="stats-card-value">{porVencer}</div>
                    </div>
                </div>
                <div className="stats-card" onClick={() => setFilterEstado('vencida')} style={{ cursor: 'pointer' }}>
                    <div className="stats-card-icon danger">
                        <X size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Vencidas</div>
                        <div className="stats-card-value">{vencidas}</div>
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
                        placeholder="Buscar por cliente, placa o descripción..."
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
                    <option value="reclamada">Reclamadas</option>
                </select>
                {filterEstado && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setFilterEstado('')}>
                        Limpiar filtro
                    </button>
                )}
            </div>

            {/* Grid de Garantías */}
            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
                {filteredGarantias.map((garantia) => {
                    const cliente = garantia.clientes || getClienteById(garantia.cliente_id);
                    const vehiculo = garantia.vehiculos || getVehiculoById(garantia.vehiculo_id);
                    const diasRestantes = getDaysRemaining(garantia.fecha_vencimiento);
                    const status = getStatusBadge(garantia.estado, diasRestantes);

                    // Progress calculation (100% = full warranty period)
                    const fechaInicio = new Date(garantia.fecha_inicio);
                    const fechaVencimiento = new Date(garantia.fecha_vencimiento);
                    const totalDias = Math.ceil((fechaVencimiento - fechaInicio) / (1000 * 60 * 60 * 24));
                    const diasUsados = totalDias - diasRestantes;
                    const porcentajeUsado = Math.min(100, Math.max(0, (diasUsados / totalDias) * 100));

                    return (
                        <div key={garantia.id} className="card">
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                            <Shield size={18} style={{ color: 'var(--primary-500)' }} />
                                            <span style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                                {garantia.tipo || 'Servicio'}
                                            </span>
                                            <span className={`status-badge ${status.class}`}>
                                                <status.icon size={12} />
                                                {status.label}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                                            {garantia.descripcion || 'Garantía de servicio'}
                                        </p>
                                    </div>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => handleViewDetails(garantia)}
                                    >
                                        <Eye size={18} />
                                    </button>
                                </div>

                                {/* Progress bar */}
                                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                            Vigencia
                                        </span>
                                        <span style={{
                                            fontSize: 'var(--font-size-xs)',
                                            fontWeight: 'var(--font-weight-bold)',
                                            color: diasRestantes <= 30 ? 'var(--danger-600)' : 'var(--success-600)'
                                        }}>
                                            {diasRestantes > 0 ? `${diasRestantes} días restantes` : 'Vencida'}
                                        </span>
                                    </div>
                                    <div style={{
                                        height: '6px',
                                        backgroundColor: 'var(--gray-200)',
                                        borderRadius: 'var(--border-radius-full)',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${porcentajeUsado}%`,
                                            backgroundColor: porcentajeUsado >= 90 ? 'var(--danger-500)' : porcentajeUsado >= 70 ? 'var(--warning-500)' : 'var(--success-500)',
                                            borderRadius: 'var(--border-radius-full)',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-sm)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                        <User size={14} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ fontSize: 'var(--font-size-sm)' }}>
                                            {cliente?.nombre?.split(' ').slice(0, 2).join(' ') || 'Sin cliente'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                        <Car size={14} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ fontSize: 'var(--font-size-sm)' }}>
                                            {vehiculo?.marca} {vehiculo?.modelo}
                                        </span>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingTop: 'var(--spacing-sm)',
                                    marginTop: 'var(--spacing-sm)',
                                    borderTop: '1px solid var(--border-color)',
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--text-muted)'
                                }}>
                                    <span>
                                        <Calendar size={12} style={{ marginRight: '4px' }} />
                                        Desde: {new Date(garantia.fecha_inicio).toLocaleDateString('es')}
                                    </span>
                                    <span>
                                        Hasta: {new Date(garantia.fecha_vencimiento).toLocaleDateString('es')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredGarantias.length === 0 && (
                <div className="empty-state">
                    <Shield className="empty-state-icon" />
                    <h3 className="empty-state-title">No hay garantías</h3>
                    <p className="empty-state-description">
                        {searchTerm || filterEstado ? 'Intenta con otros filtros' : 'Registra tu primera garantía'}
                    </p>
                    {!searchTerm && !filterEstado && (
                        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                            <Plus size={18} />
                            Nueva Garantía
                        </button>
                    )}
                </div>
            )}

            {/* Modal Ver Garantía */}
            {showModal && selectedGarantia && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Detalle de Garantía</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <div className="modal-body">
                            {(() => {
                                const cliente = selectedGarantia.clientes || getClienteById(selectedGarantia.cliente_id);
                                const vehiculo = selectedGarantia.vehiculos || getVehiculoById(selectedGarantia.vehiculo_id);
                                const diasRestantes = getDaysRemaining(selectedGarantia.fecha_vencimiento);
                                const status = getStatusBadge(selectedGarantia.estado, diasRestantes);

                                return (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                                            <div style={{
                                                width: '64px',
                                                height: '64px',
                                                borderRadius: 'var(--border-radius-lg)',
                                                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Shield size={32} style={{ color: 'white' }} />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0 }}>{selectedGarantia.tipo || 'Garantía de Servicio'}</h3>
                                                <span className={`status-badge ${status.class}`}>
                                                    <status.icon size={12} />
                                                    {status.label}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--gray-50)',
                                                borderRadius: 'var(--border-radius)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)', color: 'var(--text-muted)' }}>
                                                    <User size={14} />
                                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Cliente</span>
                                                </div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{cliente?.nombre || 'N/A'}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{cliente?.telefono}</div>
                                            </div>

                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--gray-50)',
                                                borderRadius: 'var(--border-radius)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)', color: 'var(--text-muted)' }}>
                                                    <Car size={14} />
                                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Vehículo</span>
                                                </div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{vehiculo?.marca} {vehiculo?.modelo}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{vehiculo?.placa}</div>
                                            </div>
                                        </div>

                                        {selectedGarantia.descripcion && (
                                            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Descripción</h4>
                                                <p style={{ color: 'var(--text-secondary)' }}>{selectedGarantia.descripcion}</p>
                                            </div>
                                        )}

                                        <div style={{
                                            display: 'flex',
                                            gap: 'var(--spacing-lg)',
                                            padding: 'var(--spacing-md)',
                                            backgroundColor: diasRestantes > 30 ? 'var(--success-50)' : 'var(--warning-50)',
                                            borderRadius: 'var(--border-radius)',
                                            border: `1px solid ${diasRestantes > 30 ? 'var(--success-200)' : 'var(--warning-200)'}`
                                        }}>
                                            <div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Inicio</div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                    {new Date(selectedGarantia.fecha_inicio).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Vencimiento</div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                    {new Date(selectedGarantia.fecha_vencimiento).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Días Restantes</div>
                                                <div style={{
                                                    fontWeight: 'var(--font-weight-bold)',
                                                    fontSize: 'var(--font-size-lg)',
                                                    color: diasRestantes > 30 ? 'var(--success-600)' : 'var(--warning-600)'
                                                }}>
                                                    {diasRestantes > 0 ? diasRestantes : 0}
                                                </div>
                                            </div>
                                        </div>
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

            {/* Modal Nueva Garantía */}
            {showNewModal && (
                <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nueva Garantía</h2>
                            <button className="modal-close" onClick={() => setShowNewModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmitNewGarantia}>
                            <div className="modal-body">
                                <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label required">Cliente</label>
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

                                    <div className="form-group">
                                        <label className="form-label required">Vehículo</label>
                                        <select
                                            className="form-input"
                                            name="vehiculo_id"
                                            value={formData.vehiculo_id}
                                            onChange={handleInputChange}
                                            disabled={!formData.cliente_id}
                                            required
                                        >
                                            <option value="">
                                                {formData.cliente_id ? 'Seleccionar vehículo...' : 'Primero selecciona cliente'}
                                            </option>
                                            {vehiculosCliente.map(vehiculo => (
                                                <option key={vehiculo.id} value={vehiculo.id}>
                                                    {vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Tipo de Garantía</label>
                                        <select
                                            className="form-input"
                                            name="tipo"
                                            value={formData.tipo}
                                            onChange={handleInputChange}
                                        >
                                            <option value="servicio">Servicio General</option>
                                            <option value="repuesto">Repuesto</option>
                                            <option value="motor">Motor</option>
                                            <option value="transmision">Transmisión</option>
                                            <option value="pintura">Pintura</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Duración</label>
                                        <select
                                            className="form-input"
                                            name="duracion_meses"
                                            value={formData.duracion_meses}
                                            onChange={handleInputChange}
                                        >
                                            <option value="1">1 mes</option>
                                            <option value="3">3 meses</option>
                                            <option value="6">6 meses</option>
                                            <option value="12">12 meses</option>
                                            <option value="24">24 meses</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Fecha de Inicio</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            name="fecha_inicio"
                                            value={formData.fecha_inicio}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Kilometraje Máximo</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            name="kilometraje_maximo"
                                            value={formData.kilometraje_maximo}
                                            onChange={handleInputChange}
                                            placeholder="Sin límite si vacío"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Descripción</label>
                                    <textarea
                                        className="form-input"
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder="Describe lo que cubre la garantía..."
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowNewModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Guardando...' : 'Crear Garantía'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default GarantiasList;
