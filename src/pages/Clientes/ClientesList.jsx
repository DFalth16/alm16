import React, { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { Search, Plus, Edit2, Trash2, Eye, Phone, Mail, MapPin, Car } from 'lucide-react';
import { clientes, getVehiculosByClienteId } from '../../data/mockData';

const ClientesList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const filteredClientes = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefono.includes(searchTerm)
    );

    const handleViewDetails = (cliente) => {
        setSelectedCliente(cliente);
        setShowDetailModal(true);
    };

    return (
        <Layout title="Gestión de Clientes" subtitle="Clientes">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Clientes</h1>
                    <p className="page-subtitle">Administra la información de tus clientes</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        Nuevo Cliente
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
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabla de clientes */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Contacto</th>
                            <th>Vehículos</th>
                            <th>Servicios</th>
                            <th>Fecha Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClientes.map((cliente) => {
                            const vehiculosCliente = getVehiculosByClienteId(cliente.id);
                            return (
                                <tr key={cliente.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                            <div className="avatar" style={{
                                                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
                                            }}>
                                                {cliente.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{cliente.nombre}</div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                                    ID: {cliente.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)' }}>
                                                <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                                                {cliente.email}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)' }}>
                                                <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                                                {cliente.telefono}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 12px',
                                            backgroundColor: 'var(--primary-50)',
                                            color: 'var(--primary-700)',
                                            borderRadius: 'var(--border-radius-full)',
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: 'var(--font-weight-medium)'
                                        }}>
                                            <Car size={14} />
                                            {vehiculosCliente.length}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                                            {cliente.totalServicios}
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}> servicios</span>
                                    </td>
                                    <td>
                                        {new Date(cliente.fechaRegistro).toLocaleDateString('es', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="btn btn-ghost btn-icon btn-sm"
                                                title="Ver detalles"
                                                onClick={() => handleViewDetails(cliente)}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button className="btn btn-ghost btn-icon btn-sm" title="Editar">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn btn-ghost btn-icon btn-sm" title="Eliminar" style={{ color: 'var(--danger-500)' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
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
                <button className="pagination-btn">3</button>
                <button className="pagination-btn">→</button>
            </div>

            {/* Modal Nuevo Cliente */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nuevo Cliente</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label required">Nombre Completo</label>
                                    <input type="text" className="form-input" placeholder="Ingrese el nombre completo" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">Teléfono</label>
                                    <input type="tel" className="form-input" placeholder="+591 70000000" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label required">Email</label>
                                    <input type="email" className="form-input" placeholder="correo@ejemplo.com" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">CI/NIT</label>
                                    <input type="text" className="form-input" placeholder="Documento de identidad" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Dirección</label>
                                <textarea className="form-textarea" placeholder="Dirección completa del cliente" rows="2"></textarea>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notas Adicionales</label>
                                <textarea className="form-textarea" placeholder="Información adicional sobre el cliente" rows="2"></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary">Guardar Cliente</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalle Cliente */}
            {showDetailModal && selectedCliente && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Detalle del Cliente</h2>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                                <div className="avatar avatar-xl" style={{
                                    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
                                }}>
                                    {selectedCliente.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{selectedCliente.nombre}</h3>
                                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>Cliente desde {new Date(selectedCliente.fechaRegistro).toLocaleDateString('es', { year: 'numeric', month: 'long' })}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
                                <div>
                                    <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>Información de Contacto</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                                            <span>{selectedCliente.email}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                                            <span>{selectedCliente.telefono}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                                            <span>{selectedCliente.direccion}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>Estadísticas</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                        <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-600)' }}>
                                                {getVehiculosByClienteId(selectedCliente.id).length}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Vehículos</div>
                                        </div>
                                        <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--success-600)' }}>
                                                {selectedCliente.totalServicios}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Servicios</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 'var(--spacing-lg)' }}>
                                <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>Vehículos Registrados</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                    {getVehiculosByClienteId(selectedCliente.id).map(vehiculo => (
                                        <div key={vehiculo.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: 'var(--spacing-md)',
                                            backgroundColor: 'var(--gray-50)',
                                            borderRadius: 'var(--border-radius)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                <Car size={20} style={{ color: 'var(--primary-500)' }} />
                                                <div>
                                                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                        {vehiculo.marca} {vehiculo.modelo} ({vehiculo.anio})
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                        Placa: {vehiculo.placa} • {vehiculo.color}
                                                    </div>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                {vehiculo.kilometraje.toLocaleString()} km
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Cerrar</button>
                            <button className="btn btn-primary">
                                <Edit2 size={16} />
                                Editar Cliente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ClientesList;
