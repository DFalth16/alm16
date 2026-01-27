import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Shield, Calendar, Car, Phone, Loader2, ChevronRight } from 'lucide-react';
import { alertasService } from '../services/alertasService';

const AlertasMantenimiento = ({ onClickAlerta = () => { } }) => {
    const [alertas, setAlertas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('mantenimientos');

    useEffect(() => {
        cargarAlertas();
    }, []);

    const cargarAlertas = async () => {
        try {
            setLoading(true);
            const resumen = await alertasService.getResumenAlertas();
            setAlertas(resumen);
        } catch (err) {
            console.error('Error al cargar alertas:', err);
            setError('Error al cargar las alertas');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="card">
                <div className="card-body" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xl)' }}>
                    <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary-500)' }} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card">
                <div className="card-body" style={{ color: 'var(--error-500)', textAlign: 'center' }}>
                    {error}
                </div>
            </div>
        );
    }

    if (!alertas) return null;

    const { mantenimientos, garantias, citas, totalAlertas } = alertas;

    const getUrgenciaBadge = (urgencia) => {
        const estilos = {
            'critico': { bg: 'var(--error-100)', color: 'var(--error-700)', label: 'Crítico' },
            'urgente': { bg: 'var(--warning-100)', color: 'var(--warning-700)', label: 'Urgente' },
            'proximo': { bg: 'var(--info-100)', color: 'var(--info-700)', label: 'Próximo' }
        };
        const estilo = estilos[urgencia] || estilos['proximo'];
        return (
            <span style={{
                padding: '2px 8px',
                backgroundColor: estilo.bg,
                color: estilo.color,
                borderRadius: 'var(--border-radius)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)'
            }}>
                {estilo.label}
            </span>
        );
    };

    return (
        <div className="card">
            <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <AlertTriangle size={18} style={{ color: 'var(--warning-500)' }} />
                        Alertas Post-Venta
                    </h3>
                    {totalAlertas > 0 && (
                        <span style={{
                            padding: '4px 12px',
                            backgroundColor: 'var(--error-100)',
                            color: 'var(--error-700)',
                            borderRadius: 'var(--border-radius-full)',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-bold)'
                        }}>
                            {totalAlertas} alertas
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <button
                    onClick={() => setActiveTab('mantenimientos')}
                    style={{
                        flex: 1,
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        border: 'none',
                        background: activeTab === 'mantenimientos' ? 'var(--primary-50)' : 'transparent',
                        borderBottom: activeTab === 'mantenimientos' ? '2px solid var(--primary-500)' : '2px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--spacing-xs)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: activeTab === 'mantenimientos' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)'
                    }}
                >
                    <Clock size={14} />
                    Mantenimientos ({mantenimientos.total})
                </button>
                <button
                    onClick={() => setActiveTab('garantias')}
                    style={{
                        flex: 1,
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        border: 'none',
                        background: activeTab === 'garantias' ? 'var(--primary-50)' : 'transparent',
                        borderBottom: activeTab === 'garantias' ? '2px solid var(--primary-500)' : '2px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--spacing-xs)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: activeTab === 'garantias' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)'
                    }}
                >
                    <Shield size={14} />
                    Garantías ({garantias.total})
                </button>
                <button
                    onClick={() => setActiveTab('citas')}
                    style={{
                        flex: 1,
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        border: 'none',
                        background: activeTab === 'citas' ? 'var(--primary-50)' : 'transparent',
                        borderBottom: activeTab === 'citas' ? '2px solid var(--primary-500)' : '2px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--spacing-xs)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: activeTab === 'citas' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)'
                    }}
                >
                    <Calendar size={14} />
                    Citas Hoy ({citas.hoy})
                </button>
            </div>

            <div className="card-body" style={{ padding: 'var(--spacing-md)', maxHeight: '300px', overflowY: 'auto' }}>
                {/* Mantenimientos */}
                {activeTab === 'mantenimientos' && (
                    <>
                        {mantenimientos.items.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                                <Clock size={32} style={{ color: 'var(--gray-300)', marginBottom: 'var(--spacing-sm)' }} />
                                <p>No hay vehículos que requieran mantenimiento</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {mantenimientos.items.map((item, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            backgroundColor: 'var(--gray-50)',
                                            borderRadius: 'var(--border-radius)',
                                            borderLeft: `3px solid ${item.urgencia === 'critico' ? 'var(--error-500)' :
                                                item.urgencia === 'urgente' ? 'var(--warning-500)' : 'var(--info-500)'
                                                }`,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => onClickAlerta(item)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '4px' }}>
                                                    <Car size={14} style={{ color: 'var(--text-muted)' }} />
                                                    <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                                                        {item.vehiculo_marca} {item.vehiculo_modelo}
                                                    </span>
                                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                                        ({item.vehiculo_placa})
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                                    {item.cliente_nombre} • {item.dias_desde_ultimo_servicio} días desde último servicio
                                                </div>
                                            </div>
                                            {getUrgenciaBadge(item.urgencia)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Garantías */}
                {activeTab === 'garantias' && (
                    <>
                        {garantias.items.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                                <Shield size={32} style={{ color: 'var(--gray-300)', marginBottom: 'var(--spacing-sm)' }} />
                                <p>No hay garantías próximas a vencer</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {garantias.items.map((item, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            backgroundColor: 'var(--gray-50)',
                                            borderRadius: 'var(--border-radius)',
                                            borderLeft: `3px solid ${item.urgencia === 'critico' ? 'var(--error-500)' :
                                                item.urgencia === 'urgente' ? 'var(--warning-500)' : 'var(--info-500)'
                                                }`,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => onClickAlerta(item)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>
                                                    Garantía de {item.tipo}
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                                    {item.vehiculos?.placa} • Vence en {item.dias_restantes} días
                                                </div>
                                            </div>
                                            {getUrgenciaBadge(item.urgencia)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Citas */}
                {activeTab === 'citas' && (
                    <>
                        {citas.items.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                                <Calendar size={32} style={{ color: 'var(--gray-300)', marginBottom: 'var(--spacing-sm)' }} />
                                <p>No hay citas próximas</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {citas.items.map((item, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            backgroundColor: 'var(--gray-50)',
                                            borderRadius: 'var(--border-radius)',
                                            borderLeft: '3px solid var(--primary-500)',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => onClickAlerta(item)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '4px' }}>
                                                    <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                                                    <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                                                        {item.hora_inicio} - {item.hora_fin}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                                    {item.clientes?.nombre} • {item.motivo}
                                                </div>
                                            </div>
                                            <span style={{
                                                padding: '2px 8px',
                                                backgroundColor: item.estado === 'confirmada' ? 'var(--success-100)' : 'var(--warning-100)',
                                                color: item.estado === 'confirmada' ? 'var(--success-700)' : 'var(--warning-700)',
                                                borderRadius: 'var(--border-radius)',
                                                fontSize: 'var(--font-size-xs)'
                                            }}>
                                                {item.estado === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AlertasMantenimiento;
