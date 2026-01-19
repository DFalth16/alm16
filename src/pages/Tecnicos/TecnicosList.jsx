import React, { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import {
    Search, Plus, Edit2, Eye, Phone, Mail, Star,
    Award, Wrench, ClipboardList, CheckCircle, XCircle
} from 'lucide-react';
import { tecnicos, ordenes } from '../../data/mockData';

const TecnicosList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDisponibilidad, setFilterDisponibilidad] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedTecnico, setSelectedTecnico] = useState(null);

    const filteredTecnicos = tecnicos.filter(tecnico => {
        const matchSearch =
            tecnico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tecnico.especialidad.toLowerCase().includes(searchTerm.toLowerCase());

        const matchDisponibilidad =
            filterDisponibilidad === '' ||
            (filterDisponibilidad === 'disponible' && tecnico.disponible) ||
            (filterDisponibilidad === 'ocupado' && !tecnico.disponible);

        return matchSearch && matchDisponibilidad;
    });

    const totalTecnicos = tecnicos.length;
    const tecnicosDisponibles = tecnicos.filter(t => t.disponible).length;
    const ordenesActivas = tecnicos.reduce((sum, t) => sum + t.ordenesActivas, 0);
    const promedioCalificacion = (tecnicos.reduce((sum, t) => sum + t.calificacion, 0) / tecnicos.length).toFixed(1);

    const handleViewDetails = (tecnico) => {
        setSelectedTecnico(tecnico);
        setShowModal(true);
    };

    const getOrdenesByTecnico = (tecnicoId) => {
        return ordenes.filter(o => o.tecnicoId === tecnicoId);
    };

    return (
        <Layout title="Gestión de Técnicos" subtitle="Técnicos">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Técnicos</h1>
                    <p className="page-subtitle">Administra el equipo de técnicos del taller</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        Nuevo Técnico
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stats-card">
                    <div className="stats-card-icon primary">
                        <Wrench size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Total Técnicos</div>
                        <div className="stats-card-value">{totalTecnicos}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Disponibles</div>
                        <div className="stats-card-value">{tecnicosDisponibles}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon warning">
                        <ClipboardList size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Órdenes Activas</div>
                        <div className="stats-card-value">{ordenesActivas}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon info">
                        <Star size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Calif. Promedio</div>
                        <div className="stats-card-value">{promedioCalificacion}</div>
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
                        placeholder="Buscar por nombre o especialidad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={filterDisponibilidad}
                    onChange={(e) => setFilterDisponibilidad(e.target.value)}
                >
                    <option value="">Todos</option>
                    <option value="disponible">Disponibles</option>
                    <option value="ocupado">Ocupados</option>
                </select>
            </div>

            {/* Grid de técnicos */}
            <div className="grid grid-cols-2">
                {filteredTecnicos.map((tecnico) => {
                    const ordenesDelTecnico = getOrdenesByTecnico(tecnico.id);

                    return (
                        <div key={tecnico.id} className="card">
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                        <div className="avatar avatar-xl" style={{
                                            background: tecnico.disponible
                                                ? 'linear-gradient(135deg, var(--success-500), var(--success-600))'
                                                : 'linear-gradient(135deg, var(--gray-400), var(--gray-500))'
                                        }}>
                                            {tecnico.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: '0 0 4px 0', fontSize: 'var(--font-size-lg)' }}>{tecnico.nombre}</h3>
                                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                {tecnico.especialidad}
                                            </p>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-sm)',
                                                marginTop: 'var(--spacing-sm)'
                                            }}>
                                                <span className={`status-badge ${tecnico.disponible ? 'completed' : 'pending'}`}>
                                                    <span className="status-badge-dot"></span>
                                                    {tecnico.disponible ? 'Disponible' : 'Ocupado'}
                                                </span>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    color: 'var(--warning-500)'
                                                }}>
                                                    <Star size={14} fill="var(--warning-500)" />
                                                    <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                                                        {tecnico.calificacion}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            onClick={() => handleViewDetails(tecnico)}
                                            title="Ver detalles"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button className="btn btn-ghost btn-icon" title="Editar">
                                            <Edit2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Contacto */}
                                <div style={{
                                    display: 'flex',
                                    gap: 'var(--spacing-lg)',
                                    marginTop: 'var(--spacing-md)',
                                    paddingTop: 'var(--spacing-md)',
                                    borderTop: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                        <Phone size={14} />
                                        {tecnico.telefono}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                        <Mail size={14} />
                                        {tecnico.email}
                                    </div>
                                </div>

                                {/* Certificaciones */}
                                <div style={{ marginTop: 'var(--spacing-md)' }}>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '6px' }}>Certificaciones:</div>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                                        {tecnico.certificaciones.map((cert, index) => (
                                            <span key={index} style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '4px 10px',
                                                backgroundColor: 'var(--primary-50)',
                                                color: 'var(--primary-700)',
                                                borderRadius: 'var(--border-radius-full)',
                                                fontSize: 'var(--font-size-xs)',
                                                fontWeight: 'var(--font-weight-medium)'
                                            }}>
                                                <Award size={12} />
                                                {cert}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Órdenes activas */}
                                <div style={{
                                    marginTop: 'var(--spacing-md)',
                                    padding: 'var(--spacing-md)',
                                    backgroundColor: 'var(--gray-50)',
                                    borderRadius: 'var(--border-radius)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                        Órdenes asignadas actualmente:
                                    </span>
                                    <span style={{
                                        fontSize: 'var(--font-size-lg)',
                                        fontWeight: 'var(--font-weight-bold)',
                                        color: tecnico.ordenesActivas > 2 ? 'var(--warning-600)' : 'var(--success-600)'
                                    }}>
                                        {tecnico.ordenesActivas}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Detalle Técnico */}
            {showModal && selectedTecnico && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Perfil del Técnico</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {/* Header del perfil */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-lg)',
                                marginBottom: 'var(--spacing-lg)',
                                padding: 'var(--spacing-lg)',
                                backgroundColor: 'var(--gray-50)',
                                borderRadius: 'var(--border-radius-lg)'
                            }}>
                                <div className="avatar avatar-xl" style={{
                                    width: '80px',
                                    height: '80px',
                                    fontSize: 'var(--font-size-2xl)',
                                    background: selectedTecnico.disponible
                                        ? 'linear-gradient(135deg, var(--success-500), var(--success-600))'
                                        : 'linear-gradient(135deg, var(--gray-400), var(--gray-500))'
                                }}>
                                    {selectedTecnico.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>{selectedTecnico.nombre}</h3>
                                    <p style={{ margin: '4px 0 var(--spacing-sm)', color: 'var(--text-secondary)' }}>
                                        {selectedTecnico.especialidad}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                        <span className={`status-badge ${selectedTecnico.disponible ? 'completed' : 'pending'}`}>
                                            <span className="status-badge-dot"></span>
                                            {selectedTecnico.disponible ? 'Disponible' : 'Ocupado'}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={16}
                                                    fill={star <= Math.round(selectedTecnico.calificacion) ? 'var(--warning-500)' : 'none'}
                                                    style={{ color: 'var(--warning-500)' }}
                                                />
                                            ))}
                                            <span style={{ marginLeft: '4px', fontWeight: 'var(--font-weight-medium)' }}>
                                                {selectedTecnico.calificacion}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                                <div>
                                    <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Información de Contacto</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                                            <span>{selectedTecnico.telefono}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                                            <span>{selectedTecnico.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Rendimiento</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                        <div style={{
                                            padding: 'var(--spacing-md)',
                                            backgroundColor: 'var(--gray-50)',
                                            borderRadius: 'var(--border-radius)',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-600)' }}>
                                                {selectedTecnico.ordenesActivas}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Órdenes Activas</div>
                                        </div>
                                        <div style={{
                                            padding: 'var(--spacing-md)',
                                            backgroundColor: 'var(--gray-50)',
                                            borderRadius: 'var(--border-radius)',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--success-600)' }}>
                                                {getOrdenesByTecnico(selectedTecnico.id).filter(o => o.estado === 'completado' || o.estado === 'entregado').length}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Completadas</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Certificaciones y Habilidades</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                                    {selectedTecnico.certificaciones.map((cert, index) => (
                                        <span key={index} style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 16px',
                                            backgroundColor: 'var(--primary-50)',
                                            color: 'var(--primary-700)',
                                            borderRadius: 'var(--border-radius)',
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: 'var(--font-weight-medium)'
                                        }}>
                                            <Award size={16} />
                                            {cert}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Órdenes recientes */}
                            <div style={{ marginTop: 'var(--spacing-lg)' }}>
                                <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Órdenes Asignadas</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                    {getOrdenesByTecnico(selectedTecnico.id).slice(0, 3).map(orden => (
                                        <div key={orden.id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            backgroundColor: 'var(--gray-50)',
                                            borderRadius: 'var(--border-radius)'
                                        }}>
                                            <div>
                                                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Orden #{orden.id}</span>
                                                <span style={{ color: 'var(--text-secondary)', marginLeft: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
                                                    {orden.tipo}
                                                </span>
                                            </div>
                                            <span className={`status-badge ${orden.estado === 'pendiente' ? 'pending' :
                                                    orden.estado === 'en-proceso' ? 'in-progress' :
                                                        orden.estado === 'completado' ? 'completed' : 'delivered'
                                                }`}>
                                                <span className="status-badge-dot"></span>
                                                {orden.estado === 'en-proceso' ? 'En Proceso' : orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                            <button className="btn btn-outline">Asignar Orden</button>
                            <button className="btn btn-primary">
                                <Edit2 size={16} />
                                Editar Perfil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default TecnicosList;
