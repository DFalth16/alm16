import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import {
    Wrench, Clock, CheckCircle, Play,
    AlertCircle, FileText, Save, Package, Users, Eye, ClipboardList, Stethoscope
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ordenesService } from '../services/ordenesService';
import { supabase } from '../lib/supabase';
import { RAMAS_MANTENIMIENTO } from '../services/personalService';

const DashboardMecanico = () => {
    const { user } = useAuth();
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tecnicoData, setTecnicoData] = useState(null);
    const [tecnicosRama, setTecnicosRama] = useState([]);
    const [selectedOrden, setSelectedOrden] = useState(null);
    const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);
    const [seguimientoNota, setSeguimientoNota] = useState('');
    const [repuestosUsados, setRepuestosUsados] = useState('');
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('mis-tareas'); // mis-tareas | compañeros

    useEffect(() => {
        loadTecnicoData();
    }, [user]);

    useEffect(() => {
        if (tecnicoData?.rama_mantenimiento) {
            loadOrdenesPorRama();
            loadTecnicosDeRama();
        }
    }, [tecnicoData]);

    const loadTecnicoData = async () => {
        if (!user?.id) return;

        try {
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', user.id)
                .single();

            if (userError) {
                console.error('Error cargando usuario:', userError);
                setLoading(false);
                return;
            }

            if (userData?.tecnico_id) {
                const { data: tecnico, error: tecError } = await supabase
                    .from('tecnicos')
                    .select('*')
                    .eq('id', userData.tecnico_id)
                    .single();

                if (!tecError && tecnico) {
                    setTecnicoData({ ...userData, ...tecnico, tecnico_id: tecnico.id });
                    return;
                }
            }

            // Buscar por email
            const { data: tecnicoByEmail } = await supabase
                .from('tecnicos')
                .select('*')
                .eq('email', user.email)
                .single();

            if (tecnicoByEmail) {
                setTecnicoData({ ...userData, ...tecnicoByEmail, tecnico_id: tecnicoByEmail.id });
                await supabase.from('usuarios').update({ tecnico_id: tecnicoByEmail.id }).eq('id', user.id);
            } else {
                setTecnicoData(userData);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadTecnicosDeRama = async () => {
        if (!tecnicoData?.rama_mantenimiento) return;

        const { data } = await supabase
            .from('tecnicos')
            .select('id, nombre, email, especialidad')
            .eq('rama_mantenimiento', tecnicoData.rama_mantenimiento)
            .eq('activo', true);

        if (data) setTecnicosRama(data);
    };

    const loadOrdenesPorRama = async () => {
        if (!tecnicoData?.rama_mantenimiento) return;

        try {
            setLoading(true);
            const res = await ordenesService.getAll();
            const todasOrdenes = res.data || [];

            const { data: tecnicosDeRama } = await supabase
                .from('tecnicos')
                .select('id')
                .eq('rama_mantenimiento', tecnicoData.rama_mantenimiento);

            const tecnicoIdsDeRama = tecnicosDeRama?.map(t => t.id) || [];
            const ordenesDeRama = todasOrdenes.filter(o => tecnicoIdsDeRama.includes(o.tecnico_id));

            setOrdenes(ordenesDeRama);
        } catch (err) {
            console.error('Error cargando órdenes:', err);
        } finally {
            setLoading(false);
        }
    };

    const esMiOrden = (orden) => orden.tecnico_id === tecnicoData?.tecnico_id;

    const misOrdenesPendientes = ordenes.filter(o => esMiOrden(o) && o.estado === 'pendiente');
    const misOrdenesDiagnosticando = ordenes.filter(o => esMiOrden(o) && o.estado === 'diagnosticando');
    const misOrdenesEnProceso = ordenes.filter(o => esMiOrden(o) && o.estado === 'en-proceso');
    const misOrdenesCompletadas = ordenes.filter(o => esMiOrden(o) && (o.estado === 'completado' || o.estado === 'entregado'));
    const ordenesCompaneros = ordenes.filter(o => !esMiOrden(o));

    const getRamaNombre = (ramaId) => {
        const rama = RAMAS_MANTENIMIENTO.find(r => r.id === ramaId);
        return rama?.nombre || ramaId || 'General';
    };

    const getTecnicoNombre = (tecnicoId) => {
        const tec = tecnicosRama.find(t => t.id === tecnicoId);
        return tec?.nombre || 'Sin asignar';
    };

    const handleIniciarDiagnostico = async (orden) => {
        if (!esMiOrden(orden)) return;
        try {
            await ordenesService.update(orden.id, { estado: 'diagnosticando' });
            await loadOrdenesPorRama();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleIniciarTrabajo = async (orden) => {
        if (!esMiOrden(orden)) return;
        try {
            await ordenesService.update(orden.id, { estado: 'en-proceso' });
            await loadOrdenesPorRama();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleCompletarTrabajo = async (orden) => {
        if (!esMiOrden(orden)) return;
        try {
            await ordenesService.update(orden.id, { estado: 'completado' });
            await loadOrdenesPorRama();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleAbrirSeguimiento = (orden) => {
        if (!esMiOrden(orden)) {
            alert('Solo puedes agregar seguimiento a tus propias tareas');
            return;
        }
        setSelectedOrden(orden);
        setSeguimientoNota('');
        setRepuestosUsados('');
        setShowSeguimientoModal(true);
    };

    const handleGuardarSeguimiento = async (e) => {
        e.preventDefault();
        if (!seguimientoNota.trim()) {
            alert('Escribe qué estás haciendo');
            return;
        }

        setSaving(true);
        try {
            const fecha = new Date().toLocaleDateString('es-ES');
            const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const observacionesAnteriores = selectedOrden.observaciones || '';

            const nuevaNota = `══════════════════════════════════════
📅 ${fecha} - ${hora}
👤 Técnico: ${tecnicoData?.nombre || user?.nombre}
📝 Trabajo realizado:
${seguimientoNota}
${repuestosUsados ? `\n🔧 Repuestos usados:\n${repuestosUsados}` : ''}
══════════════════════════════════════

${observacionesAnteriores}`;

            await ordenesService.update(selectedOrden.id, {
                observaciones: nuevaNota,
                estado: 'en-proceso'
            });

            setShowSeguimientoModal(false);
            setSelectedOrden(null);
            await loadOrdenesPorRama();
            alert('Seguimiento guardado correctamente');
        } catch (err) {
            alert('Error al guardar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Mi Panel de Trabajo" subtitle="Cargando...">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '16px' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando tus tareas...</p>
                </div>
            </Layout>
        );
    }

    if (!tecnicoData?.rama_mantenimiento) {
        return (
            <Layout title="Mi Panel de Trabajo" subtitle={user?.nombre || user?.email}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
                    <AlertCircle size={64} style={{ color: 'var(--warning-500)' }} />
                    <h2>No estás asignado a ninguna rama</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
                        Contacta al administrador para que te asigne a una rama de mantenimiento.
                    </p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Mi Panel de Trabajo" subtitle={getRamaNombre(tecnicoData.rama_mantenimiento)}>
            {/* Encabezado con info del técnico */}
            <div style={{
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                borderRadius: 'var(--border-radius-lg)',
                padding: '24px',
                marginBottom: '24px',
                color: 'white'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '24px' }}>¡Hola, {tecnicoData.nombre}!</h2>
                        <p style={{ margin: '8px 0 0', opacity: 0.9 }}>
                            🔧 {getRamaNombre(tecnicoData.rama_mantenimiento)} | {tecnicoData.especialidad || 'General'}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{misOrdenesPendientes.length + misOrdenesDiagnosticando.length + misOrdenesEnProceso.length}</div>
                        <div style={{ opacity: 0.9 }}>Tareas activas</div>
                    </div>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-5" style={{ marginBottom: '24px', gap: '16px' }}>
                <div className="stats-card">
                    <div className="stats-card-icon warning">
                        <Clock size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Pendientes</div>
                        <div className="stats-card-value">{misOrdenesPendientes.length}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon" style={{ backgroundColor: 'var(--purple-100, #f3e8ff)' }}>
                        <Stethoscope size={24} style={{ color: 'var(--purple-500, #8b5cf6)' }} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Diagnosticando</div>
                        <div className="stats-card-value">{misOrdenesDiagnosticando.length}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon info">
                        <Play size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">En Proceso</div>
                        <div className="stats-card-value">{misOrdenesEnProceso.length}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Completadas</div>
                        <div className="stats-card-value">{misOrdenesCompletadas.length}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon primary">
                        <Users size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Compañeros</div>
                        <div className="stats-card-value">{tecnicosRama.length}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
                <button
                    onClick={() => setActiveTab('mis-tareas')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        background: activeTab === 'mis-tareas' ? 'var(--primary-500)' : 'transparent',
                        color: activeTab === 'mis-tareas' ? 'white' : 'var(--text-secondary)',
                        borderRadius: 'var(--border-radius)',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Wrench size={18} />
                    Mis Tareas ({misOrdenesPendientes.length + misOrdenesDiagnosticando.length + misOrdenesEnProceso.length})
                </button>
                <button
                    onClick={() => setActiveTab('compañeros')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        background: activeTab === 'compañeros' ? 'var(--primary-500)' : 'transparent',
                        color: activeTab === 'compañeros' ? 'white' : 'var(--text-secondary)',
                        borderRadius: 'var(--border-radius)',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Eye size={18} />
                    Tareas de Compañeros ({ordenesCompaneros.length})
                </button>
            </div>

            {/* Contenido según tab */}
            {activeTab === 'mis-tareas' ? (
                <>
                    {/* Tareas en Proceso */}
                    {misOrdenesEnProceso.length > 0 && (
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div className="card-header" style={{ background: 'var(--info-50)' }}>
                                <h3 className="card-title" style={{ color: 'var(--info-700)' }}>
                                    <Play size={20} style={{ marginRight: '8px' }} />
                                    En Proceso - Registra tu avance
                                </h3>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                {misOrdenesEnProceso.map((orden) => (
                                    <div key={orden.id} style={{
                                        padding: '20px',
                                        borderBottom: '1px solid var(--border-color)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--primary-600)' }}>
                                                    #{orden.numero_orden || orden.id?.substring(0, 8)}
                                                </span>
                                                <span style={{ padding: '4px 12px', background: 'var(--info-100)', color: 'var(--info-700)', borderRadius: '20px', fontSize: '12px' }}>
                                                    En Proceso
                                                </span>
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                🚗 {orden.vehiculos?.marca} {orden.vehiculos?.modelo} - {orden.vehiculos?.placa}
                                            </div>
                                            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                                                {orden.descripcion || 'Sin descripción'}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleAbrirSeguimiento(orden)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                            >
                                                <ClipboardList size={18} />
                                                Hoja de Seguimiento
                                            </button>
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleCompletarTrabajo(orden)}
                                            >
                                                <CheckCircle size={18} />
                                                Completar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tareas Diagnosticando */}
                    {misOrdenesDiagnosticando.length > 0 && (
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div className="card-header" style={{ background: 'var(--purple-50, #faf5ff)' }}>
                                <h3 className="card-title" style={{ color: 'var(--purple-700, #7c3aed)' }}>
                                    <Stethoscope size={20} style={{ marginRight: '8px' }} />
                                    En Diagnóstico - Evaluando vehículo
                                </h3>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                {misOrdenesDiagnosticando.map((orden) => (
                                    <div key={orden.id} style={{
                                        padding: '20px',
                                        borderBottom: '1px solid var(--border-color)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--primary-600)' }}>
                                                    #{orden.numero_orden || orden.id?.substring(0, 8)}
                                                </span>
                                                <span style={{ padding: '4px 12px', background: 'var(--purple-100, #f3e8ff)', color: 'var(--purple-700, #7c3aed)', borderRadius: '20px', fontSize: '12px' }}>
                                                    Diagnosticando
                                                </span>
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                🚗 {orden.vehiculos?.marca} {orden.vehiculos?.modelo} - {orden.vehiculos?.placa}
                                            </div>
                                            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                                                {orden.descripcion || 'Sin descripción'}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleAbrirSeguimiento(orden)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                            >
                                                <ClipboardList size={18} />
                                                Hoja de Seguimiento
                                            </button>
                                            <button
                                                className="btn btn-info"
                                                onClick={() => handleIniciarTrabajo(orden)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                            >
                                                <Play size={18} />
                                                Iniciar Reparación
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tareas Pendientes */}
                    <div className="card">
                        <div className="card-header" style={{ background: 'var(--warning-50)' }}>
                            <h3 className="card-title" style={{ color: 'var(--warning-700)' }}>
                                <Clock size={20} style={{ marginRight: '8px' }} />
                                Tareas Pendientes por Iniciar
                            </h3>
                        </div>
                        <div className="card-body">
                            {misOrdenesPendientes.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    <CheckCircle size={48} style={{ marginBottom: '16px', color: 'var(--success-400)' }} />
                                    <p>¡No tienes tareas pendientes!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                    {misOrdenesPendientes.map((orden) => (
                                        <div key={orden.id} style={{
                                            padding: '20px',
                                            background: 'var(--gray-50)',
                                            borderRadius: 'var(--border-radius)',
                                            borderLeft: '4px solid var(--warning-500)'
                                        }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary-600)' }}>
                                                #{orden.numero_orden || orden.id?.substring(0, 8)}
                                            </div>
                                            <div style={{ marginBottom: '8px' }}>
                                                🚗 {orden.vehiculos?.marca} {orden.vehiculos?.modelo}
                                            </div>
                                            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                                {orden.descripcion?.substring(0, 100) || 'Sin descripción'}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => handleIniciarDiagnostico(orden)}
                                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                >
                                                    <Stethoscope size={16} />
                                                    Diagnosticar
                                                </button>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleIniciarTrabajo(orden)}
                                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                >
                                                    <Play size={16} />
                                                    Iniciar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                /* Tareas de Compañeros */
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Eye size={20} style={{ marginRight: '8px', color: 'var(--gray-500)' }} />
                            Tareas de Compañeros (Solo Lectura)
                        </h3>
                    </div>
                    <div className="card-body">
                        {ordenesCompaneros.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                <Users size={48} style={{ marginBottom: '16px' }} />
                                <p>No hay tareas de otros técnicos en tu rama</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                {ordenesCompaneros.map((orden) => (
                                    <div key={orden.id} style={{
                                        padding: '16px',
                                        background: 'var(--gray-50)',
                                        borderRadius: 'var(--border-radius)',
                                        opacity: 0.85
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 'bold' }}>#{orden.numero_orden || orden.id?.substring(0, 8)}</span>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                background: orden.estado === 'pendiente' ? 'var(--warning-100)' : orden.estado === 'en-proceso' ? 'var(--info-100)' : 'var(--success-100)',
                                                color: orden.estado === 'pendiente' ? 'var(--warning-700)' : orden.estado === 'en-proceso' ? 'var(--info-700)' : 'var(--success-700)'
                                            }}>
                                                {orden.estado}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                                            {orden.vehiculos?.marca} {orden.vehiculos?.modelo}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: 'var(--primary-600)',
                                            padding: '4px 8px',
                                            background: 'var(--primary-50)',
                                            borderRadius: '4px',
                                            display: 'inline-block'
                                        }}>
                                            👤 {getTecnicoNombre(orden.tecnico_id)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Hoja de Seguimiento */}
            {showSeguimientoModal && selectedOrden && (
                <div className="modal-overlay" onClick={() => setShowSeguimientoModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header" style={{ background: 'var(--primary-50)' }}>
                            <h2 className="modal-title">
                                📋 Hoja de Seguimiento
                            </h2>
                            <button className="modal-close" onClick={() => setShowSeguimientoModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleGuardarSeguimiento}>
                            <div className="modal-body">
                                {/* Info de la orden */}
                                <div style={{
                                    padding: '16px',
                                    background: 'var(--gray-50)',
                                    borderRadius: 'var(--border-radius)',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '18px' }}>
                                        Orden #{selectedOrden.numero_orden || selectedOrden.id?.substring(0, 8)}
                                    </div>
                                    <div>🚗 {selectedOrden.vehiculos?.marca} {selectedOrden.vehiculos?.modelo} - {selectedOrden.vehiculos?.placa}</div>
                                </div>

                                {/* Campo: Qué estás haciendo */}
                                <div className="form-group">
                                    <label className="form-label" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                        <FileText size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                        ¿Qué trabajo estás realizando? *
                                    </label>
                                    <textarea
                                        className="form-input"
                                        rows={5}
                                        value={seguimientoNota}
                                        onChange={(e) => setSeguimientoNota(e.target.value)}
                                        placeholder="Describe detalladamente el trabajo que estás realizando...&#10;&#10;Ejemplo:&#10;- Revisé el sistema de frenos&#10;- Cambié las pastillas delanteras&#10;- Purgué el líquido de frenos"
                                        required
                                        style={{ fontSize: '15px' }}
                                    />
                                </div>

                                {/* Campo: Repuestos usados */}
                                <div className="form-group">
                                    <label className="form-label" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                        <Package size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                        Repuestos utilizados
                                    </label>
                                    <textarea
                                        className="form-input"
                                        rows={3}
                                        value={repuestosUsados}
                                        onChange={(e) => setRepuestosUsados(e.target.value)}
                                        placeholder="Lista los repuestos que usaste...&#10;&#10;Ejemplo:&#10;- 1 juego pastillas de freno Bosch&#10;- 1 litro líquido de frenos DOT4"
                                        style={{ fontSize: '15px' }}
                                    />
                                </div>

                                {/* Historial de notas anteriores */}
                                {selectedOrden.observaciones && (
                                    <div style={{ marginTop: '20px' }}>
                                        <label className="form-label" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                                            📝 Notas anteriores:
                                        </label>
                                        <div style={{
                                            padding: '12px',
                                            background: 'var(--gray-100)',
                                            borderRadius: 'var(--border-radius)',
                                            maxHeight: '200px',
                                            overflow: 'auto',
                                            whiteSpace: 'pre-wrap',
                                            fontSize: '13px',
                                            fontFamily: 'monospace'
                                        }}>
                                            {selectedOrden.observaciones}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowSeguimientoModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: '150px' }}>
                                    <Save size={18} style={{ marginRight: '8px' }} />
                                    {saving ? 'Guardando...' : 'Guardar Seguimiento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default DashboardMecanico;
