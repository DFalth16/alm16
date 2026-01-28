import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
    Search, History, Calendar, Car, User, Eye, X,
    Wrench, CheckCircle
} from 'lucide-react';
import { ordenesService } from '../../services/ordenesService';
import { clientesService } from '../../services/clientesService';
import { vehiculosService } from '../../services/vehiculosService';
import { tecnicosService } from '../../services/tecnicosService';

const HistorialServicios = () => {
    const [historial, setHistorial] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPeriod, setFilterPeriod] = useState('all');
    const [filterCliente, setFilterCliente] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

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

            // Filter completed/delivered orders for history
            const ordenesCompletas = (ordenesRes.data || []).filter(o =>
                o.estado === 'completado' || o.estado === 'entregado'
            );

            setHistorial(ordenesCompletas);
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

    // Filter by period
    const filterByPeriod = (item) => {
        if (filterPeriod === 'all') return true;

        const fecha = new Date(item.fecha_entrega || item.updated_at || item.fecha_ingreso);
        const hoy = new Date();

        switch (filterPeriod) {
            case 'week':
                const weekAgo = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
                return fecha >= weekAgo;
            case 'month':
                const monthAgo = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
                return fecha >= monthAgo;
            case 'quarter':
                const quarterAgo = new Date(hoy.getFullYear(), hoy.getMonth() - 3, hoy.getDate());
                return fecha >= quarterAgo;
            case 'year':
                const yearAgo = new Date(hoy.getFullYear() - 1, hoy.getMonth(), hoy.getDate());
                return fecha >= yearAgo;
            default:
                return true;
        }
    };

    // Apply all filters
    const filteredHistorial = historial.filter(item => {
        const cliente = item.clientes || getClienteById(item.cliente_id);
        const vehiculo = item.vehiculos || getVehiculoById(item.vehiculo_id);

        const matchSearch =
            item.numero_orden?.toString().includes(searchTerm) ||
            item.id?.toString().includes(searchTerm) ||
            cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehiculo?.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehiculo?.marca?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchPeriod = filterByPeriod(item);
        const matchCliente = !filterCliente || item.cliente_id === filterCliente;

        return matchSearch && matchPeriod && matchCliente;
    });

    // Stats without costs
    const totalServicios = filteredHistorial.length;

    const handleViewDetails = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedItem(null);
    };

    if (loading) {
        return (
            <Layout title="Historial" subtitle="Historial de Servicios">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando historial...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Historial" subtitle="Historial de Servicios">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <X size={48} style={{ color: 'var(--danger-500)' }} />
                    <p style={{ color: 'var(--danger-600)' }}>Error al cargar el historial: {error}</p>
                    <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Historial" subtitle="Historial de Servicios">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Historial de Servicios</h1>
                    <p className="page-subtitle">Registro de todos los servicios completados</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2" style={{ marginBottom: 'var(--spacing-lg)', maxWidth: '600px' }}>
                <div className="stats-card">
                    <div className="stats-card-icon primary">
                        <History size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Total Servicios Completados</div>
                        <div className="stats-card-value">{totalServicios}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Vehículos Atendidos</div>
                        <div className="stats-card-value">
                            {new Set(filteredHistorial.map(h => h.vehiculo_id)).size}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="filters-bar">
                <div className="search-bar" style={{ maxWidth: '300px' }}>
                    <Search className="search-bar-icon" size={18} />
                    <input
                        type="text"
                        className="search-bar-input"
                        placeholder="Buscar por orden, cliente, placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="filter-select"
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                >
                    <option value="all">Todo el historial</option>
                    <option value="week">Última semana</option>
                    <option value="month">Último mes</option>
                    <option value="quarter">Último trimestre</option>
                    <option value="year">Último año</option>
                </select>

                <select
                    className="filter-select"
                    value={filterCliente}
                    onChange={(e) => setFilterCliente(e.target.value)}
                >
                    <option value="">Todos los clientes</option>
                    {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre}
                        </option>
                    ))}
                </select>

                {(filterPeriod !== 'all' || filterCliente) && (
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                            setFilterPeriod('all');
                            setFilterCliente('');
                        }}
                    >
                        Limpiar filtros
                    </button>
                )}
            </div>

            {/* Tabla de Historial */}
            {filteredHistorial.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Orden</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Vehículo</th>
                                <th>Técnico</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistorial.map((item) => {
                                const cliente = item.clientes || getClienteById(item.cliente_id);
                                const vehiculo = item.vehiculos || getVehiculoById(item.vehiculo_id);
                                const tecnico = item.tecnicos || getTecnicoById(item.tecnico_id);

                                return (
                                    <tr key={item.id}>
                                        <td>
                                            <span style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                                #{item.numero_orden || item.id}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                                <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                                                {item.fecha_entrega
                                                    ? new Date(item.fecha_entrega).toLocaleDateString('es')
                                                    : new Date(item.updated_at || item.fecha_ingreso).toLocaleDateString('es')}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                <User size={14} style={{ color: 'var(--text-muted)' }} />
                                                {cliente?.nombre || 'Sin cliente'}
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                    {vehiculo?.marca} {vehiculo?.modelo}
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                                    {vehiculo?.placa}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{tecnico?.nombre || <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                                        <td>
                                            <span className={`status-badge ${item.estado === 'entregado' ? 'delivered' : 'completed'}`}>
                                                <CheckCircle size={12} />
                                                {item.estado === 'entregado' ? 'Entregado' : 'Completado'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={() => handleViewDetails(item)}
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <History className="empty-state-icon" />
                    <h3 className="empty-state-title">No hay registros</h3>
                    <p className="empty-state-description">
                        {searchTerm || filterPeriod !== 'all' || filterCliente
                            ? 'No se encontraron servicios con los filtros aplicados'
                            : 'Aún no hay servicios completados en el historial'}
                    </p>
                </div>
            )}

            {/* Modal Ver Detalles */}
            {showModal && selectedItem && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                Orden #{selectedItem.numero_orden || selectedItem.id}
                            </h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <div className="modal-body">
                            {(() => {
                                const cliente = selectedItem.clientes || getClienteById(selectedItem.cliente_id);
                                const vehiculo = selectedItem.vehiculos || getVehiculoById(selectedItem.vehiculo_id);
                                const tecnico = selectedItem.tecnicos || getTecnicoById(selectedItem.tecnico_id);

                                return (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                            <span className={`status-badge ${selectedItem.estado === 'entregado' ? 'delivered' : 'completed'}`}>
                                                <CheckCircle size={14} />
                                                {selectedItem.estado === 'entregado' ? 'Entregado' : 'Completado'}
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
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{tecnico?.nombre || 'No asignado'}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{tecnico?.especialidad || ''}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--gray-50)',
                                                borderRadius: 'var(--border-radius)'
                                            }}>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                                                    Fecha de Ingreso
                                                </div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                    {selectedItem.fecha_ingreso
                                                        ? new Date(selectedItem.fecha_ingreso).toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                                        : 'N/A'}
                                                </div>
                                            </div>
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--success-50)',
                                                borderRadius: 'var(--border-radius)',
                                                border: '1px solid var(--success-200)'
                                            }}>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--success-700)', marginBottom: 'var(--spacing-xs)' }}>
                                                    Fecha de Entrega
                                                </div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--success-700)' }}>
                                                    {selectedItem.fecha_entrega
                                                        ? new Date(selectedItem.fecha_entrega).toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                                        : 'N/A'}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedItem.descripcion && (
                                            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Descripción del Servicio</h4>
                                                <p style={{ color: 'var(--text-secondary)' }}>{selectedItem.descripcion}</p>
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
        </Layout>
    );
};

export default HistorialServicios;
