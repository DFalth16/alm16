import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
    Search, Plus, Edit2, Eye, Mail, Phone, MapPin, Car,
    User, X, CheckCircle
} from 'lucide-react';
import { clientesService } from '../../services/clientesService';
import { vehiculosService } from '../../services/vehiculosService';

const ClientesList = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [clienteVehiculos, setClienteVehiculos] = useState([]);
    const [loadingVehiculos, setLoadingVehiculos] = useState(false);

    // Form state for new client
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        direccion: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await clientesService.getAll();
            setClientes(result.data || []);
        } catch (err) {
            console.error('Error loading clients:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredClientes = clientes.filter(cliente =>
        cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefono?.includes(searchTerm)
    );

    const handleViewDetails = async (cliente) => {
        setSelectedCliente(cliente);
        setShowModal(true);
        setLoadingVehiculos(true);

        try {
            const vehiculos = await vehiculosService.getByClienteId(cliente.id);
            setClienteVehiculos(vehiculos || []);
        } catch (err) {
            console.error('Error loading vehicles:', err);
            setClienteVehiculos([]);
        } finally {
            setLoadingVehiculos(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCliente(null);
        setClienteVehiculos([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitNewClient = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await clientesService.create({
                nombre: formData.nombre,
                email: formData.email || null,
                telefono: formData.telefono || null,
                direccion: formData.direccion || null
            });

            setShowNewModal(false);
            setFormData({ nombre: '', email: '', telefono: '', direccion: '' });
            await loadData();
        } catch (err) {
            console.error('Error creating client:', err);
            alert('Error al crear cliente: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Clientes" subtitle="Gestión de Clientes">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando clientes...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Clientes" subtitle="Gestión de Clientes">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <X size={48} style={{ color: 'var(--danger-500)' }} />
                    <p style={{ color: 'var(--danger-600)' }}>Error al cargar los clientes: {error}</p>
                    <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Clientes" subtitle="Gestión de Clientes">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Clientes</h1>
                    <p className="page-subtitle">Gestiona tu cartera de clientes</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                        <Plus size={18} />
                        Nuevo Cliente
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stats-card">
                    <div className="stats-card-icon primary">
                        <User size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Total Clientes</div>
                        <div className="stats-card-value">{clientes.length}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Clientes Activos</div>
                        <div className="stats-card-value">{clientes.length}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon info">
                        <Mail size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Con Email</div>
                        <div className="stats-card-value">{clientes.filter(c => c.email).length}</div>
                    </div>
                </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="filters-bar">
                <div className="search-bar" style={{ maxWidth: '400px' }}>
                    <Search className="search-bar-icon" size={18} />
                    <input
                        type="text"
                        className="search-bar-input"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    {filteredClientes.length} cliente{filteredClientes.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Grid de Clientes */}
            <div className="grid grid-cols-3">
                {filteredClientes.map((cliente) => (
                    <div key={cliente.id} className="card">
                        <div className="card-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                    <div className="avatar avatar-lg" style={{
                                        background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
                                    }}>
                                        {cliente.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0 }}>{cliente.nombre}</h4>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => handleViewDetails(cliente)}
                                        title="Ver detalles"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                                {cliente.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                        <Mail size={14} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{cliente.email}</span>
                                    </div>
                                )}
                                {cliente.telefono && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                        <Phone size={14} />
                                        <span>{cliente.telefono}</span>
                                    </div>
                                )}
                                {cliente.direccion && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                        <MapPin size={14} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cliente.direccion}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredClientes.length === 0 && (
                <div className="empty-state">
                    <User className="empty-state-icon" />
                    <h3 className="empty-state-title">No se encontraron clientes</h3>
                    <p className="empty-state-description">
                        {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer cliente'}
                    </p>
                    {!searchTerm && (
                        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                            <Plus size={18} />
                            Nuevo Cliente
                        </button>
                    )}
                </div>
            )}

            {/* Modal Ver Cliente */}
            {showModal && selectedCliente && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Detalle del Cliente</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                                <div className="avatar avatar-xl" style={{
                                    width: '80px',
                                    height: '80px',
                                    fontSize: 'var(--font-size-2xl)',
                                    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
                                }}>
                                    {selectedCliente.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0 }}>{selectedCliente.nombre}</h3>
                                    <p style={{ margin: 'var(--spacing-xs) 0 0', color: 'var(--text-secondary)' }}>
                                        Cliente desde {new Date(selectedCliente.created_at).toLocaleDateString('es')}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                                <div>
                                    <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Información de Contacto</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                        {selectedCliente.email && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                                                <span>{selectedCliente.email}</span>
                                            </div>
                                        )}
                                        {selectedCliente.telefono && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                                                <span>{selectedCliente.telefono}</span>
                                            </div>
                                        )}
                                        {selectedCliente.direccion && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                                                <span>{selectedCliente.direccion}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Vehículos del Cliente */}
                            <div>
                                <h4 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    <Car size={18} />
                                    Vehículos
                                </h4>
                                {loadingVehiculos ? (
                                    <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                                        <div className="loading-spinner"></div>
                                    </div>
                                ) : clienteVehiculos.length > 0 ? (
                                    <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                                        {clienteVehiculos.map(vehiculo => (
                                            <div key={vehiculo.id} style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--gray-50)',
                                                borderRadius: 'var(--border-radius)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-md)'
                                            }}>
                                                <Car size={24} style={{ color: 'var(--primary-500)' }} />
                                                <div>
                                                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                        {vehiculo.marca} {vehiculo.modelo}
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                                        {vehiculo.placa} • {vehiculo.anio}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                                        No tiene vehículos registrados
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={handleCloseModal}>Cerrar</button>
                            <button className="btn btn-primary">
                                <Edit2 size={16} />
                                Editar Cliente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nuevo Cliente */}
            {showNewModal && (
                <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nuevo Cliente</h2>
                            <button className="modal-close" onClick={() => setShowNewModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmitNewClient}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label required">Nombre Completo</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Juan Pérez"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="ejemplo@correo.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Teléfono</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        placeholder="Ej: +591 70000000"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Dirección</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleInputChange}
                                        placeholder="Dirección del cliente"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowNewModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Guardando...' : 'Guardar Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ClientesList;
