import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout/Layout';
import {
    Calendar, Plus, ChevronLeft, ChevronRight, Clock,
    User, Car, Phone, CheckCircle, X
} from 'lucide-react';
import { citasService } from '../../services/citasService';
import { clientesService } from '../../services/clientesService';
import { vehiculosService } from '../../services/vehiculosService';

const Agenda = () => {
    const [citas, setCitas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showNewModal, setShowNewModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        cliente_id: '',
        vehiculo_id: '',
        fecha: '',
        hora: '',
        tipo: 'revision'
    });
    const [vehiculosCliente, setVehiculosCliente] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [citasRes, clientesRes, vehiculosRes] = await Promise.all([
                citasService.getAll(),
                clientesService.getAll(),
                vehiculosService.getAll()
            ]);

            setCitas(citasRes.data || []);
            setClientes(clientesRes.data || []);
            setVehiculos(vehiculosRes.data || []);
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

    // Calendar logic
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];

        // Días vacíos al inicio
        for (let i = 0; i < startingDay; i++) {
            days.push({ day: null, date: null });
        }

        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            days.push({
                day,
                date: dateStr,
                isToday: dateStr === new Date().toISOString().split('T')[0]
            });
        }

        return days;
    }, [year, month]);

    const getCitasForDate = (dateStr) => {
        if (!dateStr) return [];
        return citas.filter(c => c.fecha === dateStr);
    };

    const getCitasCountForDate = (dateStr) => getCitasForDate(dateStr).length;

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDayClick = (dateStr) => {
        if (dateStr) {
            setSelectedDate(dateStr);
        }
    };

    const getStatusBadge = (estado) => {
        const estados = {
            'pendiente': { class: 'pending', label: 'Pendiente' },
            'confirmada': { class: 'completed', label: 'Confirmada' },
            'cancelada': { class: 'cancelled', label: 'Cancelada' },
            'completada': { class: 'delivered', label: 'Completada' }
        };
        return estados[estado] || { class: 'pending', label: estado };
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // When client changes, load their vehicles
        if (name === 'cliente_id' && value) {
            const clienteVehiculos = vehiculos.filter(v => v.cliente_id === value);
            setVehiculosCliente(clienteVehiculos);
            setFormData(prev => ({ ...prev, vehiculo_id: '' }));
        }
    };

    const handleSubmitNewCita = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Only use fields that exist in Supabase schema
            const citaData = {
                cliente_id: formData.cliente_id,
                vehiculo_id: formData.vehiculo_id,
                fecha: formData.fecha,
                estado: 'pendiente'
            };

            // Add optional fields if they have values
            if (formData.hora) {
                citaData.hora_inicio = formData.hora;
            }
            if (formData.tipo) {
                citaData.tipo_servicio = formData.tipo;
            }

            await citasService.create(citaData);

            setShowNewModal(false);
            setFormData({
                cliente_id: '',
                vehiculo_id: '',
                fecha: '',
                hora: '',
                tipo: 'revision'
            });
            setVehiculosCliente([]);
            await loadData();
        } catch (err) {
            console.error('Error creating appointment:', err);
            alert('Error al crear cita: ' + (err.message || 'Error desconocido'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Agenda" subtitle="Citas y Programación">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando agenda...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Agenda" subtitle="Citas y Programación">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                }}>
                    <X size={48} style={{ color: 'var(--danger-500)' }} />
                    <p style={{ color: 'var(--danger-600)' }}>Error al cargar la agenda: {error}</p>
                    <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Agenda" subtitle="Citas y Programación">
            <div className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Agenda</h1>
                    <p className="page-subtitle">Gestiona las citas del taller</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                        <Plus size={18} />
                        Nueva Cita
                    </button>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)' }}>
                {/* Calendario */}
                <div className="card">
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <button className="btn btn-ghost btn-icon" onClick={prevMonth}>
                                <ChevronLeft size={20} />
                            </button>
                            <h3 style={{ margin: 0, minWidth: '180px', textAlign: 'center' }}>
                                {monthNames[month]} {year}
                            </h3>
                            <button className="btn btn-ghost btn-icon" onClick={nextMonth}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <button className="btn btn-outline btn-sm" onClick={() => setCurrentDate(new Date())}>
                            Hoy
                        </button>
                    </div>
                    <div className="card-body">
                        {/* Calendar header */}
                        <div className="calendar-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '1px',
                            marginBottom: 'var(--spacing-sm)'
                        }}>
                            {dayNames.map(day => (
                                <div key={day} style={{
                                    padding: 'var(--spacing-sm)',
                                    textAlign: 'center',
                                    fontWeight: 'var(--font-weight-bold)',
                                    color: 'var(--text-secondary)',
                                    fontSize: 'var(--font-size-sm)'
                                }}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar days */}
                        <div className="calendar-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '4px'
                        }}>
                            {daysInMonth.map((dayInfo, index) => {
                                const citasCount = dayInfo.date ? getCitasCountForDate(dayInfo.date) : 0;
                                const isSelected = selectedDate === dayInfo.date;

                                return (
                                    <div
                                        key={index}
                                        onClick={() => handleDayClick(dayInfo.date)}
                                        style={{
                                            padding: 'var(--spacing-sm)',
                                            minHeight: '70px',
                                            borderRadius: 'var(--border-radius)',
                                            backgroundColor: dayInfo.day ? (
                                                isSelected ? 'var(--primary-100)' :
                                                    dayInfo.isToday ? 'var(--primary-50)' : 'var(--gray-50)'
                                            ) : 'transparent',
                                            cursor: dayInfo.day ? 'pointer' : 'default',
                                            border: isSelected ? '2px solid var(--primary-500)' : '1px solid transparent',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {dayInfo.day && (
                                            <>
                                                <div style={{
                                                    fontWeight: dayInfo.isToday ? 'var(--font-weight-bold)' : 'normal',
                                                    color: dayInfo.isToday ? 'var(--primary-600)' : 'var(--text-primary)',
                                                    marginBottom: 'var(--spacing-xs)'
                                                }}>
                                                    {dayInfo.day}
                                                </div>
                                                {citasCount > 0 && (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '2px 6px',
                                                        backgroundColor: 'var(--primary-500)',
                                                        color: 'white',
                                                        borderRadius: 'var(--border-radius)',
                                                        fontSize: 'var(--font-size-xs)',
                                                        width: 'fit-content'
                                                    }}>
                                                        <Calendar size={10} />
                                                        {citasCount}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Panel de Citas del Día */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Clock size={18} style={{ marginRight: '8px' }} />
                            {selectedDate
                                ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
                                : 'Selecciona un día'}
                        </h3>
                    </div>
                    <div className="card-body">
                        {selectedDate ? (
                            getCitasForDate(selectedDate).length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    {getCitasForDate(selectedDate).map(cita => {
                                        const cliente = cita.clientes || getClienteById(cita.cliente_id);
                                        const vehiculo = cita.vehiculos || getVehiculoById(cita.vehiculo_id);
                                        const status = getStatusBadge(cita.estado);

                                        return (
                                            <div key={cita.id} style={{
                                                padding: 'var(--spacing-md)',
                                                backgroundColor: 'var(--gray-50)',
                                                borderRadius: 'var(--border-radius)',
                                                borderLeft: `4px solid ${cita.estado === 'confirmada' ? 'var(--success-500)' : 'var(--warning-500)'}`
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                                                    <span style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>
                                                        {cita.hora_inicio || cita.hora}
                                                    </span>
                                                    <span className={`status-badge ${status.class}`}>
                                                        {status.label}
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
                                                        <User size={14} style={{ color: 'var(--text-muted)' }} />
                                                        <span>{cliente?.nombre || 'Sin cliente'}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
                                                        <Car size={14} style={{ color: 'var(--text-muted)' }} />
                                                        <span>{vehiculo?.marca} {vehiculo?.modelo} ({vehiculo?.placa})</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
                                                        <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                                                        <span>{cliente?.telefono}</span>
                                                    </div>
                                                </div>

                                                {(cita.observaciones || cita.notas) && (
                                                    <div style={{
                                                        marginTop: 'var(--spacing-sm)',
                                                        padding: 'var(--spacing-sm)',
                                                        backgroundColor: 'var(--bg-primary)',
                                                        borderRadius: 'var(--border-radius)',
                                                        fontSize: 'var(--font-size-sm)',
                                                        color: 'var(--text-secondary)'
                                                    }}>
                                                        {cita.observaciones || cita.notas}
                                                    </div>
                                                )}

                                                <div style={{ marginTop: 'var(--spacing-sm)', display: 'flex', gap: 'var(--spacing-sm)' }}>
                                                    {cita.estado === 'pendiente' && (
                                                        <button className="btn btn-success btn-sm" onClick={async () => {
                                                            await citasService.confirmar(cita.id);
                                                            loadData();
                                                        }}>
                                                            <CheckCircle size={14} />
                                                            Confirmar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>
                                    <Calendar size={32} style={{ color: 'var(--gray-400)' }} />
                                    <p style={{ margin: 'var(--spacing-sm) 0 0', color: 'var(--text-secondary)' }}>
                                        No hay citas programadas
                                    </p>
                                    <button className="btn btn-primary btn-sm" style={{ marginTop: 'var(--spacing-md)' }} onClick={() => {
                                        setFormData(prev => ({ ...prev, fecha: selectedDate }));
                                        setShowNewModal(true);
                                    }}>
                                        <Plus size={14} />
                                        Programar cita
                                    </button>
                                </div>
                            )
                        ) : (
                            <div className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>
                                <Calendar size={32} style={{ color: 'var(--gray-400)' }} />
                                <p style={{ margin: 'var(--spacing-sm) 0 0', color: 'var(--text-secondary)' }}>
                                    Selecciona un día para ver las citas
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Nueva Cita */}
            {showNewModal && (
                <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nueva Cita</h2>
                            <button className="modal-close" onClick={() => setShowNewModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmitNewCita}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label required">Cliente</label>
                                    <select
                                        className="form-select"
                                        name="cliente_id"
                                        value={formData.cliente_id}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Seleccione un cliente</option>
                                        {clientes.map(cliente => (
                                            <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Vehículo</label>
                                    <select
                                        className="form-select"
                                        name="vehiculo_id"
                                        value={formData.vehiculo_id}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!formData.cliente_id}
                                    >
                                        <option value="">{formData.cliente_id ? 'Seleccione un vehículo' : 'Primero seleccione un cliente'}</option>
                                        {vehiculosCliente.map(vehiculo => (
                                            <option key={vehiculo.id} value={vehiculo.id}>
                                                {vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label required">Fecha</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            name="fecha"
                                            value={formData.fecha}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label required">Hora</label>
                                        <input
                                            type="time"
                                            className="form-input"
                                            name="hora"
                                            value={formData.hora}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tipo de Servicio</label>
                                    <select
                                        className="form-select"
                                        name="tipo"
                                        value={formData.tipo}
                                        onChange={handleInputChange}
                                    >
                                        <option value="revision">Revisión General</option>
                                        <option value="mantenimiento">Mantenimiento</option>
                                        <option value="reparacion">Reparación</option>
                                        <option value="diagnostico">Diagnóstico</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowNewModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Guardando...' : 'Programar Cita'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Agenda;
