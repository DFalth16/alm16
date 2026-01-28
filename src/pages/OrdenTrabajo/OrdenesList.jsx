import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
    Search, Plus, Eye, Clock, CheckCircle, Wrench,
    User, Car, X, Trash2
} from 'lucide-react';
import { ordenesService } from '../../services/ordenesService';
import { clientesService } from '../../services/clientesService';
import { vehiculosService } from '../../services/vehiculosService';
import { tecnicosService } from '../../services/tecnicosService';

const OrdenesList = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [selectedOrden, setSelectedOrden] = useState(null);

    // Form state - sin prioridad
    const [formData, setFormData] = useState({
        cliente_id: '',
        vehiculo_id: '',
        tecnico_id: '',
        descripcion: ''
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
    };

    // Helper functions
    const getClienteById = (id) => clientes.find(c => c.id === id);
    const getVehiculoById = (id) => vehiculos.find(v => v.id === id);
    const getTecnicoById = (id) => tecnicos.find(t => t.id === id);

    // Filter orders
    const filteredOrdenes = ordenes.filter(orden => {
        const cliente = orden.clientes || getClienteById(orden.cliente_id);
        const vehiculo = orden.vehiculos || getVehiculoById(orden.vehiculo_id);

        const matchSearch =
            orden.id?.toString().includes(searchTerm) ||
            orden.numero_orden?.toString().includes(searchTerm) ||
            cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehiculo?.placa?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchEstado = !filterEstado || orden.estado === filterEstado;

        return matchSearch && matchEstado;
    });

    const getStatusBadge = (estado) => {
        const estados = {
            'pendiente': { class: 'pending', label: 'Pendiente', icon: Clock },
            'en-proceso': { class: 'in-progress', label: 'En Proceso', icon: Wrench },
            'completado': { class: 'completed', label: 'Completado', icon: CheckCircle },
            'entregado': { class: 'delivered', label: 'Entregado', icon: CheckCircle }
        };
        return estados[estado] || { class: 'pending', label: estado, icon: Clock };
    };

    const handleViewDetails = (orden) => {
        setSelectedOrden(orden);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedOrden(null);
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

    const handleSubmitNewOrder = async (e) => {
        e.preventDefault();

        if (!formData.cliente_id || !formData.vehiculo_id) {
            alert('Por favor selecciona cliente y vehículo');
            return;
        }

        setSaving(true);

        try {
            await ordenesService.create({
                cliente_id: formData.cliente_id,
                vehiculo_id: formData.vehiculo_id,
                tecnico_id: formData.tecnico_id || null,
                descripcion: formData.descripcion,
                estado: 'pendiente',
                fecha_ingreso: new Date().toISOString()
            });

            // Si se asignó un técnico, marcarlo como no disponible
            if (formData.tecnico_id) {
                await tecnicosService.update(formData.tecnico_id, { disponible: false });
            }

            setShowNewModal(false);
            setFormData({
                cliente_id: '',
                vehiculo_id: '',
                tecnico_id: '',
                descripcion: ''
            });
            setVehiculosCliente([]);
            await loadData();
        } catch (err) {
            console.error('Error creating order:', err);
            alert('Error al crear orden: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteOrder = async (orden) => {
        if (!window.confirm(`¿Estás seguro de eliminar la orden #${orden.id.slice(0, 8)}?`)) {
            return;
        }

        try {
            // Si la orden tenía un técnico asignado y no está completada/entregada,
            // liberamos al técnico
            if (orden.tecnico_id && orden.estado !== 'completado' && orden.estado !== 'entregado') {
                await tecnicosService.update(orden.tecnico_id, { disponible: true });
            }

            await ordenesService.delete(orden.id);
            await loadData();
        } catch (err) {
            console.error('Error deleting order:', err);
            alert('Error al eliminar orden: ' + err.message);
        }
    };

    // Stats
    const stats = {
        total: ordenes.length,
        pendientes: ordenes.filter(o => o.estado === 'pendiente').length,
        enProceso: ordenes.filter(o => o.estado === 'en-proceso').length,
        completadas: ordenes.filter(o => o.estado === 'completado' || o.estado === 'entregado').length
    };

    if (loading) {
        return (
            <Layout title="Órdenes" subtitle="Órdenes de Trabajo">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando órdenes...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Órdenes" subtitle="Órdenes de Trabajo">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <X size={48} style={{ color: 'var(--danger-500)' }} />
                    <p style={{ color: 'var(--danger-600)' }}>Error al cargar las órdenes: {error}</p>
                    <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Órdenes" subtitle="Órdenes de Trabajo">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Órdenes de Trabajo</h1>
                    <p className="page-subtitle">Gestiona las órdenes de servicio</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                        <Plus size={18} />
                        Nueva Orden
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stats-card" onClick={() => setFilterEstado('')} style={{ cursor: 'pointer' }}>
                    <div className="stats-card-icon primary">
                        <Wrench size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Total</div>
                        <div className="stats-card-value">{stats.total}</div>
                    </div>
                </div>
                <div className="stats-card" onClick={() => setFilterEstado('pendiente')} style={{ cursor: 'pointer' }}>
                    <div className="stats-card-icon warning">
                        <Clock size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Pendientes</div>
                        <div className="stats-card-value">{stats.pendientes}</div>
                    </div>
                </div>
                <div className="stats-card" onClick={() => setFilterEstado('en-proceso')} style={{ cursor: 'pointer' }}>
                    <div className="stats-card-icon info">
                        <Wrench size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">En Proceso</div>
                        <div className="stats-card-value">{stats.enProceso}</div>
                    </div>
                </div>
                <div className="stats-card" onClick={() => setFilterEstado('completado')} style={{ cursor: 'pointer' }}>
                    <div className="stats-card-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Completadas</div>
                        <div className="stats-card-value">{stats.completadas}</div>
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
                        placeholder="Buscar por número, cliente o placa..."
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
                    <option value="pendiente">Pendientes</option>
                    <option value="en-proceso">En Proceso</option>
                    <option value="completado">Completadas</option>
                    <option value="entregado">Entregadas</option>
                </select>
                {filterEstado && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setFilterEstado('')}>
                        Limpiar filtro
                    </button>
                )}
            </div>

            {/* Lista de Órdenes */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Orden</th>
                            <th>Cliente</th>
                            <th>Vehículo</th>
                            <th>Técnico</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrdenes.map((orden) => {
                            const cliente = orden.clientes || getClienteById(orden.cliente_id);
                            const vehiculo = orden.vehiculos || getVehiculoById(orden.vehiculo_id);
                            const tecnico = orden.tecnicos || getTecnicoById(orden.tecnico_id);
                            const status = getStatusBadge(orden.estado);

                            return (
                                <tr key={orden.id}>
                                    <td>
                                        <span style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                            #{orden.numero_orden || orden.id}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <User size={14} style={{ color: 'var(--text-muted)' }} />
                                            {cliente?.nombre || 'Sin cliente'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <Car size={14} style={{ color: 'var(--text-muted)' }} />
                                            <div>
                                                <div>{vehiculo?.marca} {vehiculo?.modelo}</div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                                    {vehiculo?.placa}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{tecnico?.nombre || <span style={{ color: 'var(--text-muted)' }}>Sin asignar</span>}</td>
                                    <td>
                                        <span className={`status-badge ${status.class}`}>
                                            <status.icon size={12} />
                                            {status.label}
                                        </span>
                                    </td>
                                    <td>
                                        {orden.fecha_ingreso
                                            ? new Date(orden.fecha_ingreso).toLocaleDateString('es')
                                            : '-'}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={() => handleViewDetails(orden)}
                                                title="Ver detalles"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={() => handleDeleteOrder(orden)}
                                                title="Eliminar"
                                                style={{ color: 'var(--danger-500)' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredOrdenes.length === 0 && (
                <div className="empty-state">
                    <Wrench className="empty-state-icon" />
                    <h3 className="empty-state-title">No hay órdenes</h3>
                    <p className="empty-state-description">
                        {searchTerm || filterEstado ? 'Intenta con otros filtros' : 'Crea tu primera orden de trabajo'}
                    </p>
                    {!searchTerm && !filterEstado && (
                        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                            <Plus size={18} />
                            Nueva Orden
                        </button>
                    )}
                </div>
            )}

            {/* Modal Ver Orden */}
            {showModal && selectedOrden && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Orden #{selectedOrden.numero_orden || selectedOrden.id}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <div className="modal-body">
                            {(() => {
                                const cliente = selectedOrden.clientes || getClienteById(selectedOrden.cliente_id);
                                const vehiculo = selectedOrden.vehiculos || getVehiculoById(selectedOrden.vehiculo_id);
                                const tecnico = selectedOrden.tecnicos || getTecnicoById(selectedOrden.tecnico_id);
                                const status = getStatusBadge(selectedOrden.estado);

                                return (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                            <span className={`status-badge ${status.class}`} style={{ fontSize: 'var(--font-size-md)' }}>
                                                <status.icon size={14} />
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
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

                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--gray-50)',
                                                borderRadius: 'var(--border-radius)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)', color: 'var(--text-muted)' }}>
                                                    <Wrench size={14} />
                                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Técnico</span>
                                                </div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{tecnico?.nombre || 'Sin asignar'}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{tecnico?.especialidad || ''}</div>
                                            </div>
                                        </div>

                                        {selectedOrden.descripcion && (
                                            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Descripción</h4>
                                                <p style={{ color: 'var(--text-secondary)' }}>{selectedOrden.descripcion}</p>
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

            {/* Modal Nueva Orden */}
            {showNewModal && (
                <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nueva Orden de Trabajo</h2>
                            <button className="modal-close" onClick={() => setShowNewModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmitNewOrder}>
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
                                                {formData.cliente_id
                                                    ? (vehiculosCliente.length > 0 ? 'Seleccionar vehículo...' : 'Este cliente no tiene vehículos')
                                                    : 'Primero selecciona cliente'}
                                            </option>
                                            {vehiculosCliente.map(vehiculo => (
                                                <option key={vehiculo.id} value={vehiculo.id}>
                                                    {vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Técnico Asignado</label>
                                    <select
                                        className="form-input"
                                        name="tecnico_id"
                                        value={formData.tecnico_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Sin asignar</option>
                                        {tecnicos.filter(t => t.disponible !== false).map(tecnico => (
                                            <option key={tecnico.id} value={tecnico.id}>
                                                {tecnico.nombre} - {tecnico.especialidad}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Descripción del Servicio</label>
                                    <textarea
                                        className="form-input"
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleInputChange}
                                        rows={4}
                                        placeholder="Describe el trabajo a realizar..."
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowNewModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Creando...' : 'Crear Orden'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default OrdenesList;
