import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
    Search, RefreshCw, Clock, Wrench, CheckCircle, Truck,
    User, Car, X, AlertCircle, Eye, Stethoscope
} from 'lucide-react';
import { ordenesService } from '../../services/ordenesService';
import { clientesService } from '../../services/clientesService';
import { vehiculosService } from '../../services/vehiculosService';
import { tecnicosService } from '../../services/tecnicosService';
import { useAuth } from '../../context/AuthContext';

const SeguimientoServicios = () => {
    const { user } = useAuth();
    const [ordenes, setOrdenes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedOrden, setSelectedOrden] = useState(null);
    const [updating, setUpdating] = useState(false);

    // Check if user is receptionist (read-only mode)
    const isReadOnly = user?.rol === 'recepcionista';

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

            // Cargar todas las órdenes (incluyendo entregadas)
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

    const estados = [
        { value: 'pendiente', label: 'Pendiente', icon: Clock, class: 'pending', color: 'var(--warning-500)' },
        { value: 'diagnosticando', label: 'Diagnosticando', icon: Stethoscope, class: 'diagnosing', color: 'var(--purple-500, #8b5cf6)' },
        { value: 'en-proceso', label: 'En Proceso', icon: Wrench, class: 'in-progress', color: 'var(--info-500)' },
        { value: 'completado', label: 'Completado', icon: CheckCircle, class: 'completed', color: 'var(--success-500)' },
        { value: 'entregado', label: 'Entregado', icon: Truck, class: 'delivered', color: 'var(--primary-500)' }
    ];

    const getEstadoInfo = (estado) => {
        return estados.find(e => e.value === estado) || estados[0];
    };

    // Filter orders
    const filteredOrdenes = ordenes.filter(orden => {
        const cliente = orden.clientes || getClienteById(orden.cliente_id);
        const vehiculo = orden.vehiculos || getVehiculoById(orden.vehiculo_id);

        const matchSearch =
            orden.numero_orden?.toString().includes(searchTerm) ||
            orden.id?.toString().includes(searchTerm) ||
            cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehiculo?.placa?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchEstado = !filterEstado || orden.estado === filterEstado;

        return matchSearch && matchEstado;
    });

    // Group by status
    const ordenesPorEstado = {
        pendiente: filteredOrdenes.filter(o => o.estado === 'pendiente'),
        diagnosticando: filteredOrdenes.filter(o => o.estado === 'diagnosticando'),
        'en-proceso': filteredOrdenes.filter(o => o.estado === 'en-proceso'),
        completado: filteredOrdenes.filter(o => o.estado === 'completado'),
        entregado: filteredOrdenes.filter(o => o.estado === 'entregado')
    };

    const handleViewDetails = (orden) => {
        setSelectedOrden(orden);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedOrden(null);
    };

    const handleChangeStatus = async (ordenId, nuevoEstado) => {
        setUpdating(true);
        try {
            await ordenesService.cambiarEstado(ordenId, nuevoEstado);
            await loadData();

            // Update selected orden if modal is open
            if (selectedOrden && selectedOrden.id === ordenId) {
                setSelectedOrden(prev => ({ ...prev, estado: nuevoEstado }));
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Error al actualizar estado: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    // Calculate progress percentage
    const getProgress = (estado) => {
        switch (estado) {
            case 'pendiente': return 20;
            case 'diagnosticando': return 40;
            case 'en-proceso': return 60;
            case 'completado': return 80;
            case 'entregado': return 100;
            default: return 0;
        }
    };

    // Stats
    const stats = {
        pendientes: ordenes.filter(o => o.estado === 'pendiente').length,
        diagnosticando: ordenes.filter(o => o.estado === 'diagnosticando').length,
        enProceso: ordenes.filter(o => o.estado === 'en-proceso').length,
        completadas: ordenes.filter(o => o.estado === 'completado').length,
        entregadas: ordenes.filter(o => o.estado === 'entregado').length
    };

    if (loading) {
        return (
            <Layout title="Seguimiento" subtitle="Seguimiento de Servicios">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando servicios...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Seguimiento" subtitle="Seguimiento de Servicios">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <X size={48} style={{ color: 'var(--danger-500)' }} />
                    <p style={{ color: 'var(--danger-600)' }}>Error al cargar: {error}</p>
                    <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Seguimiento" subtitle="Seguimiento de Servicios">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Seguimiento de Servicios</h1>
                    <p className="page-subtitle">Control del estado de las órdenes activas</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-secondary" onClick={loadData} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* Stats - Compactas */}
            <div style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
                marginBottom: 'var(--spacing-md)',
                flexWrap: 'wrap'
            }}>
                <div
                    onClick={() => setFilterEstado('pendiente')}
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        padding: '8px 12px',
                        backgroundColor: 'var(--warning-50)',
                        borderRadius: 'var(--border-radius)',
                        border: filterEstado === 'pendiente' ? '2px solid var(--warning-500)' : '1px solid var(--warning-200)'
                    }}
                >
                    <Clock size={16} style={{ color: 'var(--warning-500)' }} />
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Pendientes: <strong>{stats.pendientes}</strong>
                    </span>
                </div>
                <div
                    onClick={() => setFilterEstado('diagnosticando')}
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        padding: '8px 12px',
                        backgroundColor: 'var(--purple-50, #faf5ff)',
                        borderRadius: 'var(--border-radius)',
                        border: filterEstado === 'diagnosticando' ? '2px solid var(--purple-500, #8b5cf6)' : '1px solid var(--purple-200, #e9d5ff)'
                    }}
                >
                    <Stethoscope size={16} style={{ color: 'var(--purple-500, #8b5cf6)' }} />
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Diagnosticando: <strong>{stats.diagnosticando}</strong>
                    </span>
                </div>
                <div
                    onClick={() => setFilterEstado('en-proceso')}
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        padding: '8px 12px',
                        backgroundColor: 'var(--info-50)',
                        borderRadius: 'var(--border-radius)',
                        border: filterEstado === 'en-proceso' ? '2px solid var(--info-500)' : '1px solid var(--info-200)'
                    }}
                >
                    <Wrench size={16} style={{ color: 'var(--info-500)' }} />
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        En Proceso: <strong>{stats.enProceso}</strong>
                    </span>
                </div>
                <div
                    onClick={() => setFilterEstado('completado')}
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        padding: '8px 12px',
                        backgroundColor: 'var(--success-50)',
                        borderRadius: 'var(--border-radius)',
                        border: filterEstado === 'completado' ? '2px solid var(--success-500)' : '1px solid var(--success-200)'
                    }}
                >
                    <CheckCircle size={16} style={{ color: 'var(--success-500)' }} />
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Completados: <strong>{stats.completadas}</strong>
                    </span>
                </div>
                <div
                    onClick={() => setFilterEstado('entregado')}
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        padding: '8px 12px',
                        backgroundColor: 'var(--primary-50)',
                        borderRadius: 'var(--border-radius)',
                        border: filterEstado === 'entregado' ? '2px solid var(--primary-500)' : '1px solid var(--primary-200)'
                    }}
                >
                    <Truck size={16} style={{ color: 'var(--primary-500)' }} />
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        Entregados: <strong>{stats.entregadas}</strong>
                    </span>
                </div>
                {filterEstado && (
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setFilterEstado('')}
                        style={{ padding: '8px 12px' }}
                    >
                        Limpiar filtro
                    </button>
                )}
            </div>

            {/* Filtros */}
            <div className="filters-bar">
                <div className="search-bar" style={{ maxWidth: '400px' }}>
                    <Search className="search-bar-icon" size={18} />
                    <input
                        type="text"
                        className="search-bar-input"
                        placeholder="Buscar por orden, cliente o placa..."
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
                    <option value="diagnosticando">Diagnosticando</option>
                    <option value="en-proceso">En Proceso</option>
                    <option value="completado">Completados</option>
                    <option value="entregado">Entregados</option>
                </select>
                {filterEstado && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setFilterEstado('')}>
                        Limpiar filtro
                    </button>
                )}
            </div>

            {/* Kanban-style view - 5 columnas */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px'
            }}>
                {['pendiente', 'diagnosticando', 'en-proceso', 'completado', 'entregado'].map(estadoKey => {
                    const estadoInfo = getEstadoInfo(estadoKey);
                    const ordenesEnEstado = ordenesPorEstado[estadoKey] || [];

                    return (
                        <div key={estadoKey} style={{
                            backgroundColor: 'var(--gray-50)',
                            borderRadius: 'var(--border-radius-lg)',
                            padding: '12px'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                marginBottom: 'var(--spacing-md)',
                                paddingBottom: 'var(--spacing-sm)',
                                borderBottom: `2px solid ${estadoInfo.color}`
                            }}>
                                <estadoInfo.icon size={18} style={{ color: estadoInfo.color }} />
                                <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{estadoInfo.label}</span>
                                <span style={{
                                    marginLeft: 'auto',
                                    backgroundColor: estadoInfo.color,
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--border-radius-full)',
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 'var(--font-weight-bold)'
                                }}>
                                    {ordenesEnEstado.length}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {ordenesEnEstado.length > 0 ? (
                                    ordenesEnEstado.map(orden => {
                                        const cliente = orden.clientes || getClienteById(orden.cliente_id);
                                        const vehiculo = orden.vehiculos || getVehiculoById(orden.vehiculo_id);

                                        return (
                                            <div
                                                key={orden.id}
                                                className="card"
                                                style={{ margin: 0, cursor: 'pointer' }}
                                                onClick={() => handleViewDetails(orden)}
                                            >
                                                <div className="card-body" style={{ padding: 'var(--spacing-sm)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
                                                        <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-600)' }}>
                                                            #{orden.numero_orden || orden.id}
                                                        </span>
                                                        {orden.prioridad === 'alta' && (
                                                            <AlertCircle size={14} style={{ color: 'var(--danger-500)' }} />
                                                        )}
                                                    </div>

                                                    <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>
                                                            <User size={12} />
                                                            {cliente?.nombre?.split(' ').slice(0, 2).join(' ') || 'Sin cliente'}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--text-muted)' }}>
                                                            <Car size={12} />
                                                            {vehiculo?.marca} {vehiculo?.modelo}
                                                        </div>
                                                    </div>

                                                    {/* Progress bar */}
                                                    <div style={{
                                                        height: '4px',
                                                        backgroundColor: 'var(--gray-200)',
                                                        borderRadius: 'var(--border-radius-full)',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            height: '100%',
                                                            width: `${getProgress(orden.estado)}%`,
                                                            backgroundColor: estadoInfo.color,
                                                            transition: 'width 0.3s ease'
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: 'var(--spacing-lg)',
                                        color: 'var(--text-muted)',
                                        fontSize: 'var(--font-size-sm)'
                                    }}>
                                        No hay órdenes
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal de Detalles */}
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
                                const estadoActual = getEstadoInfo(selectedOrden.estado);

                                return (
                                    <>
                                        {/* Progress Timeline */}
                                        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Estado del Servicio</h4>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                position: 'relative',
                                                padding: '0 var(--spacing-lg)'
                                            }}>
                                                {/* Progress line */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '24px',
                                                    left: '60px',
                                                    right: '60px',
                                                    height: '4px',
                                                    backgroundColor: 'var(--gray-200)',
                                                    zIndex: 0
                                                }}>
                                                    <div style={{
                                                        width: `${getProgress(selectedOrden.estado)}%`,
                                                        height: '100%',
                                                        backgroundColor: estadoActual.color,
                                                        transition: 'width 0.3s ease'
                                                    }} />
                                                </div>

                                                {estados.map((estado, index) => {
                                                    const isActive = estados.findIndex(e => e.value === selectedOrden.estado) >= index;
                                                    const isCurrent = selectedOrden.estado === estado.value;

                                                    return (
                                                        <div key={estado.value} style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            zIndex: 1
                                                        }}>
                                                            <div style={{
                                                                width: '48px',
                                                                height: '48px',
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                backgroundColor: isActive ? estado.color : 'var(--gray-200)',
                                                                color: isActive ? 'white' : 'var(--gray-400)',
                                                                boxShadow: isCurrent ? `0 0 0 4px ${estado.color}33` : 'none',
                                                                transition: 'all 0.3s ease'
                                                            }}>
                                                                <estado.icon size={24} />
                                                            </div>
                                                            <span style={{
                                                                marginTop: 'var(--spacing-xs)',
                                                                fontSize: 'var(--font-size-sm)',
                                                                fontWeight: isCurrent ? 'var(--font-weight-bold)' : 'normal',
                                                                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
                                                            }}>
                                                                {estado.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Quick Actions - Only for non-receptionists */}
                                        {!isReadOnly ? (
                                            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                                <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Cambiar Estado</h4>
                                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                                                    {estados.map(estado => (
                                                        <button
                                                            key={estado.value}
                                                            className={`btn ${selectedOrden.estado === estado.value ? 'btn-primary' : 'btn-secondary'}`}
                                                            onClick={() => handleChangeStatus(selectedOrden.id, estado.value)}
                                                            disabled={updating || selectedOrden.estado === estado.value}
                                                            style={{
                                                                opacity: selectedOrden.estado === estado.value ? 1 : 0.8
                                                            }}
                                                        >
                                                            <estado.icon size={16} />
                                                            {estado.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{
                                                marginBottom: 'var(--spacing-lg)',
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--info-50)',
                                                borderRadius: 'var(--border-radius)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-sm)'
                                            }}>
                                                <Eye size={18} style={{ color: 'var(--info-600)' }} />
                                                <span style={{ color: 'var(--info-700)' }}>
                                                    Modo solo lectura - Solo puedes ver el estado de las órdenes
                                                </span>
                                            </div>
                                        )}

                                        {/* Order Info */}
                                        <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--gray-50)',
                                                borderRadius: 'var(--border-radius)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)', color: 'var(--text-muted)' }}>
                                                    <User size={14} />
                                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Cliente</span>
                                                </div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{cliente?.nombre || 'N/A'}</div>
                                                {cliente?.telefono && (
                                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{cliente.telefono}</div>
                                                )}
                                            </div>

                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--gray-50)',
                                                borderRadius: 'var(--border-radius)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)', color: 'var(--text-muted)' }}>
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)', color: 'var(--text-muted)' }}>
                                                    <wrench size={14} />
                                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Técnico</span>
                                                </div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{tecnico?.nombre || 'Sin asignar'}</div>
                                                {tecnico?.especialidad && (
                                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{tecnico.especialidad}</div>
                                                )}
                                            </div>
                                        </div>

                                        {selectedOrden.descripcion && (
                                            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Descripción</h4>
                                                <p style={{
                                                    padding: 'var(--spacing-md)',
                                                    backgroundColor: 'var(--gray-50)',
                                                    borderRadius: 'var(--border-radius)',
                                                    color: 'var(--text-secondary)'
                                                }}>
                                                    {selectedOrden.descripcion}
                                                </p>
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

export default SeguimientoServicios;
