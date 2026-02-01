import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
    Search, Plus, Eye, Edit2, UserX, UserCheck,
    Users, Wrench, Phone, Mail, X, User, CheckCircle
} from 'lucide-react';
import { personalService, RAMAS_MANTENIMIENTO } from '../../services/personalService';

const PersonalList = () => {
    const [personal, setPersonal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('tecnicos'); // tecnicos | recepcionistas
    const [showModal, setShowModal] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPersonal, setSelectedPersonal] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        telefono: '',
        especialidad: '',
        rama_mantenimiento: 'mecanica-general',
        rol: 'mecanico'
    });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const rol = activeTab === 'tecnicos' ? 'mecanico' : 'recepcionista';
            const res = await personalService.getAll({ rol });
            setPersonal(res.data || []);
        } catch (err) {
            console.error('Error loading personal:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredPersonal = personal.filter(p =>
        p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tecnicos?.especialidad?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitNew = async (e) => {
        e.preventDefault();

        if (!formData.nombre || !formData.email || !formData.password) {
            alert('Nombre, email y contraseña son requeridos');
            return;
        }

        if (formData.password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setSaving(true);

        try {
            const rol = activeTab === 'tecnicos' ? 'mecanico' : 'recepcionista';
            await personalService.create({
                ...formData,
                rol
            });

            setShowNewModal(false);
            resetForm();
            await loadData();
            alert('Personal creado exitosamente. Se envió un email de confirmación.');
        } catch (err) {
            console.error('Error creating personal:', err);
            alert('Error al crear personal: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();

        if (!formData.nombre) {
            alert('El nombre es requerido');
            return;
        }

        setSaving(true);

        try {
            await personalService.update(selectedPersonal.id, formData);
            setShowEditModal(false);
            setSelectedPersonal(null);
            resetForm();
            await loadData();
        } catch (err) {
            console.error('Error updating personal:', err);
            alert('Error al actualizar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (persona) => {
        if (!window.confirm(`¿Está seguro de dar de baja a ${persona.nombre}?`)) {
            return;
        }

        try {
            await personalService.deactivate(persona.id);
            await loadData();
        } catch (err) {
            console.error('Error deactivating:', err);
            alert('Error al dar de baja: ' + err.message);
        }
    };

    const handleViewDetails = (persona) => {
        setSelectedPersonal(persona);
        setShowModal(true);
    };

    const handleEdit = (persona) => {
        setSelectedPersonal(persona);
        setFormData({
            nombre: persona.nombre || '',
            email: persona.email || '',
            password: '',
            telefono: persona.telefono || '',
            especialidad: persona.tecnicos?.especialidad || '',
            rama_mantenimiento: persona.tecnicos?.rama_mantenimiento || 'mecanica-general',
            rol: persona.rol
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            email: '',
            password: '',
            telefono: '',
            especialidad: '',
            rama_mantenimiento: 'mecanica-general',
            rol: activeTab === 'tecnicos' ? 'mecanico' : 'recepcionista'
        });
    };

    const getRamaNombre = (ramaId) => {
        const rama = RAMAS_MANTENIMIENTO.find(r => r.id === ramaId);
        return rama?.nombre || ramaId;
    };

    // Stats
    const totalActivos = personal.filter(p => p.activo !== false).length;

    if (loading) {
        return (
            <Layout title="Personal" subtitle="Gestión de Personal">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando personal...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Personal" subtitle="Gestión de Personal">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <X size={48} style={{ color: 'var(--danger-500)' }} />
                    <p style={{ color: 'var(--danger-600)' }}>Error: {error}</p>
                    <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Personal" subtitle="Gestión de Personal">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Personal</h1>
                    <p className="page-subtitle">Gestiona técnicos y recepcionistas</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => {
                        resetForm();
                        setShowNewModal(true);
                    }}>
                        <Plus size={18} />
                        Nuevo {activeTab === 'tecnicos' ? 'Técnico' : 'Recepcionista'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
                marginBottom: 'var(--spacing-lg)',
                borderBottom: '2px solid var(--border-color)',
                paddingBottom: 'var(--spacing-sm)'
            }}>
                <button
                    onClick={() => setActiveTab('tecnicos')}
                    style={{
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        border: 'none',
                        background: activeTab === 'tecnicos' ? 'var(--primary-500)' : 'transparent',
                        color: activeTab === 'tecnicos' ? 'white' : 'var(--text-secondary)',
                        borderRadius: 'var(--border-radius)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        fontWeight: 'var(--font-weight-medium)'
                    }}
                >
                    <Wrench size={18} />
                    Técnicos / Mecánicos
                </button>
                <button
                    onClick={() => setActiveTab('recepcionistas')}
                    style={{
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        border: 'none',
                        background: activeTab === 'recepcionistas' ? 'var(--primary-500)' : 'transparent',
                        color: activeTab === 'recepcionistas' ? 'white' : 'var(--text-secondary)',
                        borderRadius: 'var(--border-radius)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        fontWeight: 'var(--font-weight-medium)'
                    }}
                >
                    <Users size={18} />
                    Recepcionistas
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stats-card">
                    <div className="stats-card-icon primary">
                        <User size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Total {activeTab === 'tecnicos' ? 'Técnicos' : 'Recepcionistas'}</div>
                        <div className="stats-card-value">{personal.length}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Activos</div>
                        <div className="stats-card-value">{totalActivos}</div>
                    </div>
                </div>
                {activeTab === 'tecnicos' && (
                    <div className="stats-card">
                        <div className="stats-card-icon info">
                            <Wrench size={24} />
                        </div>
                        <div className="stats-card-content">
                            <div className="stats-card-label">Ramas</div>
                            <div className="stats-card-value">{RAMAS_MANTENIMIENTO.length}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="filters-bar">
                <div className="search-bar" style={{ maxWidth: '400px' }}>
                    <Search className="search-bar-icon" size={18} />
                    <input
                        type="text"
                        className="search-bar-input"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid de Personal */}
            <div className="grid grid-cols-3">
                {filteredPersonal.map((persona) => (
                    <div key={persona.id} className="card">
                        <div className="card-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                    <div className="avatar avatar-lg" style={{
                                        background: persona.activo !== false
                                            ? 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
                                            : 'linear-gradient(135deg, var(--gray-400), var(--gray-500))'
                                    }}>
                                        {persona.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0 }}>{persona.nombre}</h4>
                                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                            {activeTab === 'tecnicos'
                                                ? (persona.tecnicos?.especialidad || 'General')
                                                : 'Recepcionista'}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => handleViewDetails(persona)}
                                        title="Ver detalles"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => handleEdit(persona)}
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Rama de mantenimiento (solo técnicos) */}
                            {activeTab === 'tecnicos' && persona.tecnicos?.rama_mantenimiento && (
                                <div style={{
                                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                                    backgroundColor: 'var(--primary-50)',
                                    borderRadius: 'var(--border-radius)',
                                    marginBottom: 'var(--spacing-sm)',
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--primary-700)'
                                }}>
                                    🔧 {getRamaNombre(persona.tecnicos.rama_mantenimiento)}
                                </div>
                            )}

                            {/* Contact info */}
                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                {persona.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
                                        <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ fontSize: 'var(--font-size-sm)' }}>{persona.email}</span>
                                    </div>
                                )}
                                {persona.telefono && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                        <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ fontSize: 'var(--font-size-sm)' }}>{persona.telefono}</span>
                                    </div>
                                )}
                            </div>

                            {/* Estado y acciones */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: 'var(--spacing-sm)',
                                borderTop: '1px solid var(--border-color)'
                            }}>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: 'var(--border-radius-full)',
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    backgroundColor: persona.activo !== false ? 'var(--success-100)' : 'var(--gray-100)',
                                    color: persona.activo !== false ? 'var(--success-700)' : 'var(--gray-700)'
                                }}>
                                    {persona.activo !== false ? 'Activo' : 'Inactivo'}
                                </span>
                                {persona.activo !== false && (
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => handleDeactivate(persona)}
                                        style={{ color: 'var(--danger-500)' }}
                                        title="Dar de baja"
                                    >
                                        <UserX size={16} />
                                        Dar de baja
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPersonal.length === 0 && (
                <div className="empty-state">
                    <User className="empty-state-icon" />
                    <h3 className="empty-state-title">No hay {activeTab === 'tecnicos' ? 'técnicos' : 'recepcionistas'}</h3>
                    <p className="empty-state-description">
                        {searchTerm ? 'Intenta con otros términos de búsqueda' : `Agrega tu primer ${activeTab === 'tecnicos' ? 'técnico' : 'recepcionista'}`}
                    </p>
                    {!searchTerm && (
                        <button className="btn btn-primary" onClick={() => {
                            resetForm();
                            setShowNewModal(true);
                        }}>
                            <Plus size={18} />
                            Nuevo {activeTab === 'tecnicos' ? 'Técnico' : 'Recepcionista'}
                        </button>
                    )}
                </div>
            )}

            {/* Modal Ver Detalles */}
            {showModal && selectedPersonal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Detalle del Personal</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                                <div className="avatar" style={{
                                    width: '80px',
                                    height: '80px',
                                    fontSize: 'var(--font-size-2xl)',
                                    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
                                }}>
                                    {selectedPersonal.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0 }}>{selectedPersonal.nombre}</h3>
                                    <p style={{ margin: 'var(--spacing-xs) 0 0', color: 'var(--text-secondary)' }}>
                                        {selectedPersonal.rol === 'mecanico' ? 'Técnico / Mecánico' : 'Recepcionista'}
                                    </p>
                                    {selectedPersonal.tecnicos?.rama_mantenimiento && (
                                        <span style={{
                                            display: 'inline-block',
                                            marginTop: 'var(--spacing-sm)',
                                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                                            backgroundColor: 'var(--primary-100)',
                                            borderRadius: 'var(--border-radius)',
                                            fontSize: 'var(--font-size-sm)',
                                            color: 'var(--primary-700)'
                                        }}>
                                            {getRamaNombre(selectedPersonal.tecnicos.rama_mantenimiento)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Información de Contacto</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                    {selectedPersonal.email && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                                            <span>{selectedPersonal.email}</span>
                                        </div>
                                    )}
                                    {selectedPersonal.telefono && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                                            <span>{selectedPersonal.telefono}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedPersonal.tecnicos && (
                                <div>
                                    <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Información de Técnico</h4>
                                    <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                                        <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--border-radius)' }}>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Especialidad</div>
                                            <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{selectedPersonal.tecnicos.especialidad || 'General'}</div>
                                        </div>
                                        <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--border-radius)' }}>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Rama</div>
                                            <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{getRamaNombre(selectedPersonal.tecnicos.rama_mantenimiento)}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                            <button className="btn btn-primary" onClick={() => {
                                setShowModal(false);
                                handleEdit(selectedPersonal);
                            }}>
                                <Edit2 size={16} />
                                Editar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nuevo Personal */}
            {showNewModal && (
                <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nuevo {activeTab === 'tecnicos' ? 'Técnico' : 'Recepcionista'}</h2>
                            <button className="modal-close" onClick={() => setShowNewModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmitNew}>
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
                                    <label className="form-label required">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="correo@almimports.com"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Mínimo 6 caracteres"
                                        minLength={6}
                                        required
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
                                        placeholder="+591 70000000"
                                    />
                                </div>

                                {activeTab === 'tecnicos' && (
                                    <>
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
                                            <label className="form-label required">Rama de Mantenimiento</label>
                                            <select
                                                className="form-input"
                                                name="rama_mantenimiento"
                                                value={formData.rama_mantenimiento}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                {RAMAS_MANTENIMIENTO.map(rama => (
                                                    <option key={rama.id} value={rama.id}>
                                                        {rama.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                            <small style={{ color: 'var(--text-muted)' }}>
                                                La rama determina qué órdenes verá el técnico
                                            </small>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowNewModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar Personal */}
            {showEditModal && selectedPersonal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Editar {selectedPersonal.rol === 'mecanico' ? 'Técnico' : 'Recepcionista'}</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmitEdit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label required">Nombre Completo</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        required
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
                                    />
                                </div>

                                {selectedPersonal.rol === 'mecanico' && (
                                    <>
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
                                            <label className="form-label required">Rama de Mantenimiento</label>
                                            <select
                                                className="form-input"
                                                name="rama_mantenimiento"
                                                value={formData.rama_mantenimiento}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                {RAMAS_MANTENIMIENTO.map(rama => (
                                                    <option key={rama.id} value={rama.id}>
                                                        {rama.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default PersonalList;
