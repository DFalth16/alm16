import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
    Search, Plus, Eye, Wrench, Star, Phone, Mail,
    CheckCircle, X, User, Clock, Edit2, Trash2
} from 'lucide-react';
import { tecnicosService } from '../../services/tecnicosService';
import { ordenesService } from '../../services/ordenesService';
import { validateEmail, validatePhone, validateName } from '../../utils/validations';

const TecnicosList = () => {
    const [tecnicos, setTecnicos] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingTecnico, setEditingTecnico] = useState(null);
    const [selectedTecnico, setSelectedTecnico] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        especialidad: '',
        telefono: '',
        email: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [tecnicosRes, ordenesRes] = await Promise.all([
                tecnicosService.getAll(),
                ordenesService.getAll()
            ]);

            setTecnicos(tecnicosRes.data || []);
            setOrdenes(ordenesRes.data || []);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Calculate performance stats for each technician
    const getTecnicoStats = (tecnicoId) => {
        const ordenesDelTecnico = ordenes.filter(o => o.tecnico_id === tecnicoId);
        const completadas = ordenesDelTecnico.filter(o => o.estado === 'completado' || o.estado === 'entregado').length;
        const activas = ordenesDelTecnico.filter(o => o.estado === 'pendiente' || o.estado === 'en-proceso').length;
        const ingresos = ordenesDelTecnico.reduce((sum, o) => sum + (o.costo_total || 0), 0);

        return { completadas, activas, ingresos };
    };

    const filteredTecnicos = tecnicos.filter(tecnico =>
        tecnico.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tecnico.especialidad?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewDetails = (tecnico) => {
        setSelectedTecnico(tecnico);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedTecnico(null);
    };

    const handleToggleDisponibilidad = async (tecnico) => {
        try {
            await tecnicosService.setDisponibilidad(tecnico.id, !tecnico.disponible);
            await loadData();
        } catch (err) {
            console.error('Error updating availability:', err);
            alert('Error al actualizar disponibilidad: ' + err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetFormData = () => {
        setFormData({ nombre: '', especialidad: '', telefono: '', email: '' });
    };

    // Abrir modal para nuevo técnico
    const handleOpenNewModal = () => {
        setIsEditing(false);
        setEditingTecnico(null);
        resetFormData();
        setFormErrors({});
        setShowFormModal(true);
    };

    // Abrir modal para editar técnico
    const handleEditTecnico = (tecnico) => {
        setIsEditing(true);
        setEditingTecnico(tecnico);
        setFormData({
            nombre: tecnico.nombre || '',
            especialidad: tecnico.especialidad || '',
            telefono: tecnico.telefono || '',
            email: tecnico.email || ''
        });
        setFormErrors({});
        setShowFormModal(true);
        setShowModal(false);
    };

    // Validar formulario
    const validateFormData = () => {
        const errors = {};

        const nameResult = validateName(formData.nombre, 'nombre');
        if (!nameResult.valid) errors.nombre = nameResult.message;

        const emailResult = validateEmail(formData.email);
        if (!emailResult.valid) errors.email = emailResult.message;

        const phoneResult = validatePhone(formData.telefono);
        if (!phoneResult.valid) errors.telefono = phoneResult.message;

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Guardar técnico (crear o editar)
    const handleSubmitForm = async (e) => {
        e.preventDefault();

        if (!validateFormData()) {
            return;
        }

        setSaving(true);

        try {
            const tecnicoData = {
                nombre: formData.nombre,
                especialidad: formData.especialidad || 'General',
                telefono: formData.telefono || null,
                email: formData.email || null
            };

            if (isEditing && editingTecnico) {
                await tecnicosService.update(editingTecnico.id, tecnicoData);
            } else {
                await tecnicosService.create({
                    ...tecnicoData,
                    disponible: true,
                    calificacion: 5.0
                });
            }

            setShowFormModal(false);
            resetFormData();
            setIsEditing(false);
            setEditingTecnico(null);
            await loadData();
        } catch (err) {
            console.error('Error saving technician:', err);
            alert('Error al guardar técnico: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Eliminar técnico
    const handleDeleteTecnico = async (tecnico) => {
        if (!window.confirm(`¿Estás seguro de eliminar al técnico "${tecnico.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
            return;
        }

        try {
            await tecnicosService.delete(tecnico.id);
            setShowModal(false);
            setSelectedTecnico(null);
            await loadData();
        } catch (err) {
            console.error('Error deleting technician:', err);
            alert('Error al eliminar técnico: ' + err.message);
        }
    };

    // Render stars
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating || 0);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={14}
                    fill={i < fullStars ? 'var(--warning-500)' : 'transparent'}
                    stroke={i < fullStars ? 'var(--warning-500)' : 'var(--gray-300)'}
                />
            );
        }
        return stars;
    };

    // Stats
    const disponibles = tecnicos.filter(t => t.disponible !== false).length;

    if (loading) {
        return (
            <Layout title="Técnicos" subtitle="Gestión de Técnicos">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando técnicos...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Técnicos" subtitle="Gestión de Técnicos">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <X size={48} style={{ color: 'var(--danger-500)' }} />
                    <p style={{ color: 'var(--danger-600)' }}>Error al cargar los técnicos: {error}</p>
                    <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Técnicos" subtitle="Gestión de Técnicos">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Técnicos</h1>
                    <p className="page-subtitle">Gestiona tu equipo de técnicos</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={handleOpenNewModal}>
                        <Plus size={18} />
                        Nuevo Técnico
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
                        <div className="stats-card-label">Total Técnicos</div>
                        <div className="stats-card-value">{tecnicos.length}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Disponibles</div>
                        <div className="stats-card-value">{disponibles}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon warning">
                        <Star size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Calificación Promedio</div>
                        <div className="stats-card-value">
                            {tecnicos.length > 0
                                ? (tecnicos.reduce((sum, t) => sum + (t.calificacion || 5), 0) / tecnicos.length).toFixed(1)
                                : '5.0'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
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
            </div>

            {/* Grid de Técnicos */}
            <div className="grid grid-cols-3">
                {filteredTecnicos.map((tecnico) => {
                    const stats = getTecnicoStats(tecnico.id);

                    return (
                        <div key={tecnico.id} className="card">
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                        <div className="avatar avatar-lg" style={{
                                            background: tecnico.disponible !== false
                                                ? 'linear-gradient(135deg, var(--success-500), var(--success-600))'
                                                : 'linear-gradient(135deg, var(--gray-400), var(--gray-500))'
                                        }}>
                                            {tecnico.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0 }}>{tecnico.nombre}</h4>
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                {tecnico.especialidad || 'General'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            onClick={() => handleEditTecnico(tecnico)}
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            onClick={() => handleViewDetails(tecnico)}
                                            title="Ver detalles"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            onClick={() => handleDeleteTecnico(tecnico)}
                                            title="Eliminar"
                                            style={{ color: 'var(--danger-500)' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)' }}>
                                    {renderStars(tecnico.calificacion)}
                                    <span style={{ marginLeft: 'var(--spacing-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                                        {(tecnico.calificacion || 5).toFixed(1)}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                        <CheckCircle size={14} style={{ color: 'var(--success-500)' }} />
                                        <span style={{ fontSize: 'var(--font-size-sm)' }}>{stats.completadas} completadas</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                        <Clock size={14} style={{ color: 'var(--warning-500)' }} />
                                        <span style={{ fontSize: 'var(--font-size-sm)' }}>{stats.activas} activas</span>
                                    </div>
                                </div>

                                {/* Disponibilidad */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: 'var(--spacing-sm)',
                                    borderTop: '1px solid var(--border-color)'
                                }}>
                                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                        Estado
                                    </span>
                                    <button
                                        onClick={() => handleToggleDisponibilidad(tecnico)}
                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: 'var(--border-radius-full)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: 'var(--font-weight-medium)',
                                            backgroundColor: tecnico.disponible !== false ? 'var(--success-100)' : 'var(--gray-100)',
                                            color: tecnico.disponible !== false ? 'var(--success-700)' : 'var(--gray-700)'
                                        }}
                                    >
                                        {tecnico.disponible !== false ? 'Disponible' : 'No disponible'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredTecnicos.length === 0 && (
                <div className="empty-state">
                    <User className="empty-state-icon" />
                    <h3 className="empty-state-title">No hay técnicos</h3>
                    <p className="empty-state-description">
                        {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Agrega tu primer técnico'}
                    </p>
                    {!searchTerm && (
                        <button className="btn btn-primary" onClick={handleOpenNewModal}>
                            <Plus size={18} />
                            Nuevo Técnico
                        </button>
                    )}
                </div>
            )}

            {/* Modal Ver Técnico */}
            {showModal && selectedTecnico && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Detalle del Técnico</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <div className="modal-body">
                            {(() => {
                                const stats = getTecnicoStats(selectedTecnico.id);

                                return (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                                            <div className="avatar" style={{
                                                width: '80px',
                                                height: '80px',
                                                fontSize: 'var(--font-size-2xl)',
                                                background: selectedTecnico.disponible !== false
                                                    ? 'linear-gradient(135deg, var(--success-500), var(--success-600))'
                                                    : 'linear-gradient(135deg, var(--gray-400), var(--gray-500))'
                                            }}>
                                                {selectedTecnico.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0 }}>{selectedTecnico.nombre}</h3>
                                                <p style={{ margin: 'var(--spacing-xs) 0 0', color: 'var(--text-secondary)' }}>
                                                    {selectedTecnico.especialidad || 'General'}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-sm)' }}>
                                                    {renderStars(selectedTecnico.calificacion)}
                                                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                        {(selectedTecnico.calificacion || 5).toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Información de Contacto</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                                {selectedTecnico.telefono && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                        <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                                                        <span>{selectedTecnico.telefono}</span>
                                                    </div>
                                                )}
                                                {selectedTecnico.email && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                        <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                                                        <span>{selectedTecnico.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Performance Stats */}
                                        <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-md)' }}>
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--success-50)',
                                                borderRadius: 'var(--border-radius)',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--success-600)' }}>
                                                    {stats.completadas}
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                    Completadas
                                                </div>
                                            </div>
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--warning-50)',
                                                borderRadius: 'var(--border-radius)',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--warning-600)' }}>
                                                    {stats.activas}
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                    En Proceso
                                                </div>
                                            </div>
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--primary-50)',
                                                borderRadius: 'var(--border-radius)',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-600)' }}>
                                                    Bs. {stats.ingresos.toLocaleString()}
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                    Generados
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-danger"
                                onClick={() => handleDeleteTecnico(selectedTecnico)}
                                style={{ marginRight: 'auto' }}
                            >
                                <Trash2 size={16} />
                                Eliminar
                            </button>
                            <button className="btn btn-secondary" onClick={handleCloseModal}>Cerrar</button>
                            <button className="btn btn-primary" onClick={() => handleEditTecnico(selectedTecnico)}>
                                <Edit2 size={16} />
                                Editar Técnico
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nuevo/Editar Técnico */}
            {showFormModal && (
                <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{isEditing ? 'Editar Técnico' : 'Nuevo Técnico'}</h2>
                            <button className="modal-close" onClick={() => setShowFormModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmitForm}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label required">Nombre Completo</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Carlos Méndez"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Especialidad</label>
                                    <select
                                        className="form-input"
                                        name="especialidad"
                                        value={formData.especialidad}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">General</option>
                                        <option value="Motor">Motor</option>
                                        <option value="Transmisión">Transmisión</option>
                                        <option value="Eléctrico">Eléctrico</option>
                                        <option value="Frenos">Frenos</option>
                                        <option value="Suspensión">Suspensión</option>
                                        <option value="Aire Acondicionado">Aire Acondicionado</option>
                                        <option value="Pintura">Pintura</option>
                                        <option value="Enderezado">Enderezado</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Teléfono</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        placeholder="+591 70000000"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar Técnico')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default TecnicosList;
