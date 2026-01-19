import React from 'react';
import Layout from '../../components/Layout/Layout';
import { Clock, User, Car, CheckCircle, AlertCircle, Activity, Wrench, Phone, ArrowRight } from 'lucide-react';
import { ordenes, getClienteById, getVehiculoById, getTecnicoById } from '../../data/mockData';

const SeguimientoServicios = () => {
    const ordenesActivas = ordenes.filter(o => o.estado === 'en-proceso' || o.estado === 'pendiente');

    const getProgressPercent = (estado) => {
        switch (estado) {
            case 'pendiente': return 15;
            case 'en-proceso': return 60;
            case 'completado': return 100;
            case 'entregado': return 100;
            default: return 0;
        }
    };

    const getProgressColor = (estado) => {
        switch (estado) {
            case 'pendiente': return 'var(--warning-500)';
            case 'en-proceso': return 'var(--info-500)';
            case 'completado': return 'var(--success-500)';
            case 'entregado': return 'var(--primary-500)';
            default: return 'var(--gray-400)';
        }
    };

    const timelineSteps = [
        { id: 1, label: 'Recepción', icon: Car },
        { id: 2, label: 'Diagnóstico', icon: Activity },
        { id: 3, label: 'En Trabajo', icon: Wrench },
        { id: 4, label: 'Completado', icon: CheckCircle }
    ];

    const getActiveStep = (estado) => {
        switch (estado) {
            case 'pendiente': return 1;
            case 'en-proceso': return 3;
            case 'completado': return 4;
            case 'entregado': return 4;
            default: return 0;
        }
    };

    return (
        <Layout title="Seguimiento de Servicios" subtitle="Seguimiento">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Seguimiento de Servicios</h1>
                    <p className="page-subtitle">Monitorea el progreso de los servicios activos en tiempo real</p>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stats-card">
                    <div className="stats-card-icon warning">
                        <AlertCircle size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Pendientes</div>
                        <div className="stats-card-value">
                            {ordenes.filter(o => o.estado === 'pendiente').length}
                        </div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon info">
                        <Wrench size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">En Proceso</div>
                        <div className="stats-card-value">
                            {ordenes.filter(o => o.estado === 'en-proceso').length}
                        </div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Completados Hoy</div>
                        <div className="stats-card-value">
                            {ordenes.filter(o => o.estado === 'completado').length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de servicios activos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                {ordenesActivas.map((orden) => {
                    const cliente = getClienteById(orden.clienteId);
                    const vehiculo = getVehiculoById(orden.vehiculoId);
                    const tecnico = getTecnicoById(orden.tecnicoId);
                    const activeStep = getActiveStep(orden.estado);
                    const progress = getProgressPercent(orden.estado);

                    return (
                        <div key={orden.id} className="card">
                            <div className="card-body">
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-lg)' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '4px' }}>
                                            <span style={{
                                                fontSize: 'var(--font-size-xl)',
                                                fontWeight: 'var(--font-weight-bold)',
                                                color: 'var(--text-primary)'
                                            }}>
                                                Orden #{orden.id}
                                            </span>
                                            <span className={`status-badge ${orden.estado === 'pendiente' ? 'pending' : 'in-progress'}`}>
                                                <span className="status-badge-dot"></span>
                                                {orden.estado === 'pendiente' ? 'Pendiente' : 'En Proceso'}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                                            {orden.tipo} - {orden.descripcion}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Entrega estimada</div>
                                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-600)' }}>
                                            {new Date(orden.fechaEstimada).toLocaleDateString('es', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline de progreso */}
                                <div style={{
                                    marginBottom: 'var(--spacing-lg)',
                                    padding: 'var(--spacing-lg)',
                                    backgroundColor: 'var(--gray-50)',
                                    borderRadius: 'var(--border-radius-lg)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        position: 'relative',
                                        marginBottom: 'var(--spacing-md)'
                                    }}>
                                        {/* Línea de progreso de fondo */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '20px',
                                            left: '40px',
                                            right: '40px',
                                            height: '4px',
                                            backgroundColor: 'var(--gray-200)',
                                            borderRadius: '2px'
                                        }}>
                                            <div style={{
                                                width: `${(activeStep - 1) / (timelineSteps.length - 1) * 100}%`,
                                                height: '100%',
                                                backgroundColor: getProgressColor(orden.estado),
                                                borderRadius: '2px',
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>

                                        {timelineSteps.map((step, index) => {
                                            const isActive = index + 1 <= activeStep;
                                            const isCurrent = index + 1 === activeStep;
                                            return (
                                                <div key={step.id} style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    position: 'relative',
                                                    zIndex: 1
                                                }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: 'var(--border-radius-full)',
                                                        backgroundColor: isActive ? getProgressColor(orden.estado) : 'var(--gray-200)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: isActive ? 'white' : 'var(--gray-400)',
                                                        boxShadow: isCurrent ? `0 0 0 4px ${getProgressColor(orden.estado)}40` : 'none',
                                                        transition: 'all 0.3s ease'
                                                    }}>
                                                        <step.icon size={20} />
                                                    </div>
                                                    <span style={{
                                                        marginTop: 'var(--spacing-sm)',
                                                        fontSize: 'var(--font-size-sm)',
                                                        fontWeight: isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                                                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
                                                    }}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Barra de progreso */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-md)',
                                        marginTop: 'var(--spacing-lg)'
                                    }}>
                                        <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--gray-200)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${progress}%`,
                                                height: '100%',
                                                backgroundColor: getProgressColor(orden.estado),
                                                borderRadius: '4px',
                                                transition: 'width 0.5s ease'
                                            }}></div>
                                        </div>
                                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: getProgressColor(orden.estado) }}>
                                            {progress}%
                                        </span>
                                    </div>
                                </div>

                                {/* Info del cliente, vehículo y técnico */}
                                <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-md)' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-md)',
                                        padding: 'var(--spacing-md)',
                                        backgroundColor: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--border-radius)'
                                    }}>
                                        <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))' }}>
                                            {cliente?.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Cliente</div>
                                            <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                                                {cliente?.nombre.split(' ').slice(0, 2).join(' ')}
                                            </div>
                                        </div>
                                        <a href={`tel:${cliente?.telefono}`} className="btn btn-ghost btn-icon btn-sm" style={{ marginLeft: 'auto' }}>
                                            <Phone size={16} />
                                        </a>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-md)',
                                        padding: 'var(--spacing-md)',
                                        backgroundColor: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--border-radius)'
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: 'var(--border-radius)',
                                            backgroundColor: 'var(--gray-100)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--gray-600)'
                                        }}>
                                            <Car size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Vehículo</div>
                                            <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                                                {vehiculo?.marca} {vehiculo?.modelo}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                                {vehiculo?.placa}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-md)',
                                        padding: 'var(--spacing-md)',
                                        backgroundColor: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--border-radius)'
                                    }}>
                                        <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--success-500), var(--success-600))' }}>
                                            {tecnico?.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Técnico Asignado</div>
                                            <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                                                {tecnico?.nombre.split(' ').slice(0, 2).join(' ')}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                                {tecnico?.especialidad}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Servicios */}
                                <div style={{
                                    marginTop: 'var(--spacing-md)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: 'var(--spacing-md)',
                                    borderTop: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                                        {orden.servicios.map((servicio, index) => (
                                            <span key={index} style={{
                                                padding: '4px 10px',
                                                backgroundColor: 'var(--primary-50)',
                                                color: 'var(--primary-700)',
                                                borderRadius: 'var(--border-radius-full)',
                                                fontSize: 'var(--font-size-xs)',
                                                fontWeight: 'var(--font-weight-medium)'
                                            }}>
                                                {servicio}
                                            </span>
                                        ))}
                                    </div>
                                    <button className="btn btn-primary btn-sm">
                                        Ver Detalle
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {ordenesActivas.length === 0 && (
                <div className="empty-state">
                    <CheckCircle className="empty-state-icon" />
                    <h3 className="empty-state-title">Sin servicios activos</h3>
                    <p className="empty-state-description">No hay órdenes de trabajo en proceso actualmente.</p>
                </div>
            )}
        </Layout>
    );
};

export default SeguimientoServicios;
