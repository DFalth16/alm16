import React, { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import {
    Plus, ChevronLeft, ChevronRight, Clock, User, Car,
    Calendar as CalendarIcon, CheckCircle, AlertCircle, X
} from 'lucide-react';
import { citas, getClienteById, getVehiculoById } from '../../data/mockData';

const Agenda = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 18)); // Enero 2026
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState('month'); // month, week

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];

        // Días del mes anterior
        const prevMonth = new Date(year, month, 0);
        const prevMonthDays = prevMonth.getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            days.push({
                day: prevMonthDays - i,
                isCurrentMonth: false,
                date: new Date(year, month - 1, prevMonthDays - i)
            });
        }

        // Días del mes actual
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(year, month, i)
            });
        }

        // Días del próximo mes
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(year, month + 1, i)
            });
        }

        return days;
    };

    const getCitasForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return citas.filter(c => c.fecha === dateStr);
    };

    const isToday = (date) => {
        const today = new Date(2026, 0, 18); // Simular hoy
        return date.toDateString() === today.toDateString();
    };

    const navigateMonth = (direction) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    const days = getDaysInMonth(currentDate);

    const citasHoy = getCitasForDate(new Date(2026, 0, 18));
    const citasPendientes = citas.filter(c => c.estado === 'pendiente').length;
    const citasConfirmadas = citas.filter(c => c.estado === 'confirmada').length;

    return (
        <Layout title="Agenda de Citas" subtitle="Citas">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Agenda de Citas</h1>
                    <p className="page-subtitle">Gestiona las citas y programación del taller</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        Nueva Cita
                    </button>
                </div>
            </div>

            {/* Stats rápidos */}
            <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stats-card">
                    <div className="stats-card-icon primary">
                        <CalendarIcon size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Citas Hoy</div>
                        <div className="stats-card-value">{citasHoy.length}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Confirmadas</div>
                        <div className="stats-card-value">{citasConfirmadas}</div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-card-icon warning">
                        <AlertCircle size={24} />
                    </div>
                    <div className="stats-card-content">
                        <div className="stats-card-label">Pendientes</div>
                        <div className="stats-card-value">{citasPendientes}</div>
                    </div>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 350px', gap: 'var(--spacing-lg)' }}>
                {/* Calendario */}
                <div className="card">
                    <div className="card-header" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <button className="btn btn-ghost btn-icon" onClick={() => navigateMonth(-1)}>
                                <ChevronLeft size={20} />
                            </button>
                            <h3 className="card-title" style={{ minWidth: '180px', textAlign: 'center' }}>
                                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => navigateMonth(1)}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                            <button
                                className={`btn btn-sm ${viewMode === 'month' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setViewMode('month')}
                            >
                                Mes
                            </button>
                            <button
                                className={`btn btn-sm ${viewMode === 'week' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setViewMode('week')}
                            >
                                Semana
                            </button>
                        </div>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {/* Header días de la semana */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            borderBottom: '1px solid var(--border-color)'
                        }}>
                            {daysOfWeek.map(day => (
                                <div key={day} style={{
                                    padding: 'var(--spacing-sm)',
                                    textAlign: 'center',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--text-secondary)',
                                    backgroundColor: 'var(--gray-50)'
                                }}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Grid de días */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)'
                        }}>
                            {days.map((dayInfo, index) => {
                                const citasDelDia = getCitasForDate(dayInfo.date);
                                const hasEvents = citasDelDia.length > 0;

                                return (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedDate(dayInfo.date)}
                                        style={{
                                            minHeight: '100px',
                                            padding: 'var(--spacing-xs)',
                                            borderRight: (index + 1) % 7 !== 0 ? '1px solid var(--border-color)' : 'none',
                                            borderBottom: index < 35 ? '1px solid var(--border-color)' : 'none',
                                            backgroundColor: isToday(dayInfo.date) ? 'var(--primary-50)' :
                                                selectedDate?.toDateString() === dayInfo.date.toDateString() ? 'var(--gray-50)' :
                                                    'transparent',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 'var(--spacing-xs)'
                                        }}>
                                            <span style={{
                                                fontSize: 'var(--font-size-sm)',
                                                fontWeight: isToday(dayInfo.date) ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
                                                color: !dayInfo.isCurrentMonth ? 'var(--text-muted)' :
                                                    isToday(dayInfo.date) ? 'var(--primary-600)' : 'var(--text-primary)',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 'var(--border-radius-full)',
                                                backgroundColor: isToday(dayInfo.date) ? 'var(--primary-500)' : 'transparent',
                                                ...(isToday(dayInfo.date) && { color: 'white' })
                                            }}>
                                                {dayInfo.day}
                                            </span>
                                            {hasEvents && (
                                                <span style={{
                                                    fontSize: 'var(--font-size-xs)',
                                                    backgroundColor: 'var(--primary-100)',
                                                    color: 'var(--primary-600)',
                                                    padding: '2px 6px',
                                                    borderRadius: 'var(--border-radius-full)'
                                                }}>
                                                    {citasDelDia.length}
                                                </span>
                                            )}
                                        </div>
                                        {citasDelDia.slice(0, 2).map((cita, idx) => {
                                            const cliente = getClienteById(cita.clienteId);
                                            return (
                                                <div key={idx} style={{
                                                    fontSize: 'var(--font-size-xs)',
                                                    padding: '2px 4px',
                                                    marginBottom: '2px',
                                                    backgroundColor: cita.estado === 'confirmada' ? 'var(--success-100)' : 'var(--warning-100)',
                                                    color: cita.estado === 'confirmada' ? 'var(--success-700)' : 'var(--warning-700)',
                                                    borderRadius: 'var(--border-radius-sm)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {cita.hora} - {cliente?.nombre.split(' ')[0]}
                                                </div>
                                            );
                                        })}
                                        {citasDelDia.length > 2 && (
                                            <div style={{
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--text-muted)',
                                                textAlign: 'center'
                                            }}>
                                                +{citasDelDia.length - 2} más
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar de citas del día */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            {selectedDate
                                ? selectedDate.toLocaleDateString('es', { weekday: 'long', month: 'long', day: 'numeric' })
                                : 'Citas de Hoy'
                            }
                        </h3>
                    </div>
                    <div className="card-body">
                        {(() => {
                            const citasMostrar = selectedDate
                                ? getCitasForDate(selectedDate)
                                : citas.filter(c => c.fecha === '2026-01-20' || c.fecha === '2026-01-18');

                            if (citasMostrar.length === 0) {
                                return (
                                    <div className="empty-state" style={{ padding: 'var(--spacing-lg) 0' }}>
                                        <CalendarIcon style={{ width: '48px', height: '48px', color: 'var(--gray-300)', marginBottom: 'var(--spacing-md)' }} />
                                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No hay citas programadas</p>
                                    </div>
                                );
                            }

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    {citasMostrar.map(cita => {
                                        const cliente = getClienteById(cita.clienteId);
                                        const vehiculo = getVehiculoById(cita.vehiculoId);

                                        return (
                                            <div key={cita.id} style={{
                                                padding: 'var(--spacing-md)',
                                                borderRadius: 'var(--border-radius)',
                                                border: '1px solid var(--border-color)',
                                                borderLeft: `4px solid ${cita.estado === 'confirmada' ? 'var(--success-500)' : 'var(--warning-500)'}`
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: 'var(--spacing-sm)'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 'var(--spacing-sm)'
                                                    }}>
                                                        <Clock size={14} style={{ color: 'var(--primary-500)' }} />
                                                        <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{cita.hora}</span>
                                                    </div>
                                                    <span className={`status-badge ${cita.estado === 'confirmada' ? 'completed' : 'pending'}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                                                        {cita.estado === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                                                    </span>
                                                </div>

                                                <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                                                    <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                                                        {cita.tipo}
                                                    </div>
                                                    <p style={{
                                                        margin: '4px 0 0',
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--text-secondary)'
                                                    }}>
                                                        {cita.descripcion}
                                                    </p>
                                                </div>

                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--text-secondary)'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <User size={12} />
                                                        {cliente?.nombre.split(' ').slice(0, 2).join(' ')}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Car size={12} />
                                                        {vehiculo?.marca} {vehiculo?.modelo} • {vehiculo?.placa}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Clock size={12} />
                                                        Duración estimada: {cita.duracionEstimada}h
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Modal Nueva Cita */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nueva Cita</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label required">Cliente</label>
                                    <select className="form-select">
                                        <option value="">Seleccione un cliente</option>
                                        {citas.map(c => {
                                            const cliente = getClienteById(c.clienteId);
                                            return <option key={c.clienteId} value={c.clienteId}>{cliente?.nombre}</option>;
                                        })}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">Vehículo</label>
                                    <select className="form-select">
                                        <option value="">Seleccione un vehículo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label required">Fecha</label>
                                    <input type="date" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">Hora</label>
                                    <input type="time" className="form-input" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label required">Tipo de Servicio</label>
                                    <select className="form-select">
                                        <option value="">Seleccione tipo</option>
                                        <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
                                        <option value="Mantenimiento Correctivo">Mantenimiento Correctivo</option>
                                        <option value="Diagnóstico">Diagnóstico</option>
                                        <option value="Revisión General">Revisión General</option>
                                        <option value="Revisión de Garantía">Revisión de Garantía</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Duración Estimada (horas)</label>
                                    <input type="number" className="form-input" placeholder="2" min="1" max="8" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Descripción</label>
                                <textarea className="form-textarea" placeholder="Describa el motivo de la cita..." rows="3"></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary">Programar Cita</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Agenda;
