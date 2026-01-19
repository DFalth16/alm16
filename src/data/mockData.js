// Mock Data para Sistema de Gestión de Taller y Post-Venta

// Clientes
export const clientes = [
    {
        id: 1,
        nombre: 'Carlos Alberto Mendoza García',
        email: 'carlos.mendoza@email.com',
        telefono: '+591 78901234',
        direccion: 'Av. Arce #1520, La Paz',
        fechaRegistro: '2024-01-15',
        vehiculos: [1, 2],
        totalServicios: 12
    },
    {
        id: 2,
        nombre: 'María Elena Rojas Fernández',
        email: 'maria.rojas@email.com',
        telefono: '+591 67890123',
        direccion: 'Calle Potosí #890, Santa Cruz',
        fechaRegistro: '2024-02-20',
        vehiculos: [3],
        totalServicios: 5
    },
    {
        id: 3,
        nombre: 'Roberto Quispe Mamani',
        email: 'roberto.quispe@email.com',
        telefono: '+591 71234567',
        direccion: 'Zona Sur, Calle 21 #456, La Paz',
        fechaRegistro: '2024-03-10',
        vehiculos: [4, 5],
        totalServicios: 8
    },
    {
        id: 4,
        nombre: 'Ana Lucía Vargas Soliz',
        email: 'ana.vargas@email.com',
        telefono: '+591 76543210',
        direccion: 'Av. Banzer #2300, Santa Cruz',
        fechaRegistro: '2024-04-05',
        vehiculos: [6],
        totalServicios: 3
    },
    {
        id: 5,
        nombre: 'Jorge Luis Condori Choque',
        email: 'jorge.condori@email.com',
        telefono: '+591 72345678',
        direccion: 'Calle Comercio #123, Cochabamba',
        fechaRegistro: '2024-05-12',
        vehiculos: [7],
        totalServicios: 15
    }
];

// Vehículos
export const vehiculos = [
    {
        id: 1,
        clienteId: 1,
        marca: 'Toyota',
        modelo: 'Corolla',
        anio: 2022,
        color: 'Blanco',
        placa: 'ABC-1234',
        vin: '1HGBH41JXMN109186',
        kilometraje: 45000,
        ultimoServicio: '2026-01-05'
    },
    {
        id: 2,
        clienteId: 1,
        marca: 'Honda',
        modelo: 'CR-V',
        anio: 2021,
        color: 'Gris',
        placa: 'DEF-5678',
        vin: '2HGFG3B59DH501234',
        kilometraje: 62000,
        ultimoServicio: '2025-12-20'
    },
    {
        id: 3,
        clienteId: 2,
        marca: 'Hyundai',
        modelo: 'Tucson',
        anio: 2023,
        color: 'Azul',
        placa: 'GHI-9012',
        vin: '5NPE24AF5FH123456',
        kilometraje: 18000,
        ultimoServicio: '2026-01-10'
    },
    {
        id: 4,
        clienteId: 3,
        marca: 'Nissan',
        modelo: 'Sentra',
        anio: 2020,
        color: 'Negro',
        placa: 'JKL-3456',
        vin: '1N4AL3AP5JC123456',
        kilometraje: 85000,
        ultimoServicio: '2025-11-15'
    },
    {
        id: 5,
        clienteId: 3,
        marca: 'Chevrolet',
        modelo: 'Spark',
        anio: 2019,
        color: 'Rojo',
        placa: 'MNO-7890',
        vin: 'KL8CB6SA1KC789012',
        kilometraje: 95000,
        ultimoServicio: '2026-01-08'
    },
    {
        id: 6,
        clienteId: 4,
        marca: 'Kia',
        modelo: 'Sportage',
        anio: 2024,
        color: 'Plateado',
        placa: 'PQR-1234',
        vin: '5XYP3DHC5MG123456',
        kilometraje: 5000,
        ultimoServicio: '2026-01-12'
    },
    {
        id: 7,
        clienteId: 5,
        marca: 'Suzuki',
        modelo: 'Swift',
        anio: 2021,
        color: 'Verde',
        placa: 'STU-5678',
        vin: 'JSAFJB33V00123456',
        kilometraje: 52000,
        ultimoServicio: '2025-12-28'
    }
];

// Órdenes de Trabajo
export const ordenes = [
    {
        id: 1001,
        clienteId: 1,
        vehiculoId: 1,
        tecnicoId: 1,
        fechaIngreso: '2026-01-18',
        fechaEstimada: '2026-01-19',
        fechaEntrega: null,
        estado: 'en-proceso',
        tipo: 'Mantenimiento Preventivo',
        servicios: ['Cambio de aceite', 'Filtro de aire', 'Revisión de frenos'],
        descripcion: 'Mantenimiento de los 45,000 km',
        costoEstimado: 850,
        costoFinal: null,
        observaciones: 'Cliente solicita revisión adicional de suspensión'
    },
    {
        id: 1002,
        clienteId: 2,
        vehiculoId: 3,
        tecnicoId: 2,
        fechaIngreso: '2026-01-17',
        fechaEstimada: '2026-01-18',
        fechaEntrega: null,
        estado: 'pendiente',
        tipo: 'Reparación',
        servicios: ['Diagnóstico electrónico', 'Reparación de sensor'],
        descripcion: 'Luz de check engine encendida',
        costoEstimado: 1200,
        costoFinal: null,
        observaciones: ''
    },
    {
        id: 1003,
        clienteId: 3,
        vehiculoId: 4,
        tecnicoId: 3,
        fechaIngreso: '2026-01-16',
        fechaEstimada: '2026-01-17',
        fechaEntrega: '2026-01-17',
        estado: 'completado',
        tipo: 'Mantenimiento Correctivo',
        servicios: ['Cambio de pastillas de freno', 'Cambio de discos'],
        descripcion: 'Ruido al frenar',
        costoEstimado: 1500,
        costoFinal: 1450,
        observaciones: 'Trabajo completado sin novedades'
    },
    {
        id: 1004,
        clienteId: 4,
        vehiculoId: 6,
        tecnicoId: 1,
        fechaIngreso: '2026-01-15',
        fechaEstimada: '2026-01-15',
        fechaEntrega: '2026-01-15',
        estado: 'entregado',
        tipo: 'Revisión de Garantía',
        servicios: ['Revisión de 5,000 km'],
        descripcion: 'Primera revisión de garantía del vehículo nuevo',
        costoEstimado: 0,
        costoFinal: 0,
        observaciones: 'Cubierto por garantía de fábrica'
    },
    {
        id: 1005,
        clienteId: 5,
        vehiculoId: 7,
        tecnicoId: 2,
        fechaIngreso: '2026-01-18',
        fechaEstimada: '2026-01-20',
        fechaEntrega: null,
        estado: 'en-proceso',
        tipo: 'Reparación Mayor',
        servicios: ['Cambio de embrague', 'Revisión de caja de cambios'],
        descripcion: 'Dificultad para cambiar marchas',
        costoEstimado: 3500,
        costoFinal: null,
        observaciones: 'Requiere repuestos importados'
    }
];

// Técnicos
export const tecnicos = [
    {
        id: 1,
        nombre: 'Miguel Ángel Flores',
        especialidad: 'Mecánica General',
        telefono: '+591 70123456',
        email: 'miguel.flores@taller.com',
        disponible: true,
        certificaciones: ['Toyota Certified', 'ASE Master Technician'],
        ordenesActivas: 2,
        calificacion: 4.8
    },
    {
        id: 2,
        nombre: 'Pedro Ramírez Chávez',
        especialidad: 'Electrónica Automotriz',
        telefono: '+591 71234567',
        email: 'pedro.ramirez@taller.com',
        disponible: true,
        certificaciones: ['Bosch Certified', 'Electronic Diagnostics'],
        ordenesActivas: 2,
        calificacion: 4.9
    },
    {
        id: 3,
        nombre: 'Luis Fernando Torres',
        especialidad: 'Frenos y Suspensión',
        telefono: '+591 72345678',
        email: 'luis.torres@taller.com',
        disponible: false,
        certificaciones: ['Brembo Specialist', 'Monroe Training'],
        ordenesActivas: 1,
        calificacion: 4.7
    },
    {
        id: 4,
        nombre: 'José Antonio Medina',
        especialidad: 'Motor y Transmisión',
        telefono: '+591 73456789',
        email: 'jose.medina@taller.com',
        disponible: true,
        certificaciones: ['Honda Expert', 'Transmission Specialist'],
        ordenesActivas: 0,
        calificacion: 4.6
    }
];

// Citas
export const citas = [
    {
        id: 1,
        clienteId: 1,
        vehiculoId: 2,
        fecha: '2026-01-20',
        hora: '09:00',
        tipo: 'Mantenimiento Preventivo',
        descripcion: 'Mantenimiento de los 65,000 km',
        estado: 'confirmada',
        duracionEstimada: 3
    },
    {
        id: 2,
        clienteId: 2,
        vehiculoId: 3,
        fecha: '2026-01-20',
        hora: '11:00',
        tipo: 'Revisión General',
        descripcion: 'Ruido extraño en el motor',
        estado: 'pendiente',
        duracionEstimada: 2
    },
    {
        id: 3,
        clienteId: 3,
        vehiculoId: 5,
        fecha: '2026-01-21',
        hora: '10:00',
        tipo: 'Cambio de Aceite',
        descripcion: 'Cambio de aceite y filtros',
        estado: 'confirmada',
        duracionEstimada: 1
    },
    {
        id: 4,
        clienteId: 5,
        vehiculoId: 7,
        fecha: '2026-01-22',
        hora: '14:00',
        tipo: 'Diagnóstico',
        descripcion: 'Luz de check engine',
        estado: 'confirmada',
        duracionEstimada: 2
    },
    {
        id: 5,
        clienteId: 4,
        vehiculoId: 6,
        fecha: '2026-01-25',
        hora: '09:00',
        tipo: 'Revisión de Garantía',
        descripcion: 'Segunda revisión de garantía',
        estado: 'confirmada',
        duracionEstimada: 2
    }
];

// Garantías
export const garantias = [
    {
        id: 1,
        vehiculoId: 6,
        clienteId: 4,
        tipo: 'Garantía de Fábrica',
        descripcion: 'Garantía completa del fabricante',
        fechaInicio: '2024-06-15',
        fechaVencimiento: '2027-06-15',
        kilometrajeMaximo: 100000,
        estado: 'activa',
        cobertura: ['Motor', 'Transmisión', 'Suspensión', 'Sistema eléctrico']
    },
    {
        id: 2,
        vehiculoId: 1,
        clienteId: 1,
        tipo: 'Garantía Extendida',
        descripcion: 'Garantía extendida por 2 años adicionales',
        fechaInicio: '2025-01-20',
        fechaVencimiento: '2027-01-20',
        kilometrajeMaximo: 120000,
        estado: 'activa',
        cobertura: ['Motor', 'Transmisión']
    },
    {
        id: 3,
        vehiculoId: 3,
        clienteId: 2,
        tipo: 'Garantía de Fábrica',
        descripcion: 'Garantía completa del fabricante',
        fechaInicio: '2023-08-10',
        fechaVencimiento: '2026-08-10',
        kilometrajeMaximo: 60000,
        estado: 'activa',
        cobertura: ['Motor', 'Transmisión', 'Suspensión', 'Sistema eléctrico', 'Aire acondicionado']
    },
    {
        id: 4,
        vehiculoId: 4,
        clienteId: 3,
        tipo: 'Garantía de Repuestos',
        descripcion: 'Garantía de pastillas y discos de freno',
        fechaInicio: '2026-01-17',
        fechaVencimiento: '2027-01-17',
        kilometrajeMaximo: null,
        estado: 'activa',
        cobertura: ['Pastillas de freno', 'Discos de freno']
    },
    {
        id: 5,
        vehiculoId: 2,
        clienteId: 1,
        tipo: 'Garantía de Fábrica',
        descripcion: 'Garantía original del vehículo',
        fechaInicio: '2021-03-15',
        fechaVencimiento: '2024-03-15',
        kilometrajeMaximo: 60000,
        estado: 'vencida',
        cobertura: ['Motor', 'Transmisión', 'Suspensión']
    }
];

// Historial de Servicios
export const historialServicios = [
    {
        id: 1,
        ordenId: 1003,
        vehiculoId: 4,
        clienteId: 3,
        tecnicoId: 3,
        fecha: '2026-01-17',
        tipo: 'Mantenimiento Correctivo',
        servicios: ['Cambio de pastillas de freno', 'Cambio de discos'],
        costo: 1450,
        kilometraje: 85000,
        observaciones: 'Trabajo completado satisfactoriamente'
    },
    {
        id: 2,
        ordenId: 1004,
        vehiculoId: 6,
        clienteId: 4,
        tecnicoId: 1,
        fecha: '2026-01-15',
        tipo: 'Revisión de Garantía',
        servicios: ['Revisión de 5,000 km', 'Cambio de aceite', 'Revisión multipunto'],
        costo: 0,
        kilometraje: 5000,
        observaciones: 'Cubierto por garantía'
    },
    {
        id: 3,
        ordenId: null,
        vehiculoId: 1,
        clienteId: 1,
        tecnicoId: 2,
        fecha: '2026-01-05',
        tipo: 'Mantenimiento Preventivo',
        servicios: ['Cambio de aceite', 'Revisión de frenos', 'Alineación y balanceo'],
        costo: 750,
        kilometraje: 42000,
        observaciones: 'Cliente satisfecho con el servicio'
    },
    {
        id: 4,
        ordenId: null,
        vehiculoId: 7,
        clienteId: 5,
        tecnicoId: 1,
        fecha: '2025-12-28',
        tipo: 'Diagnóstico',
        servicios: ['Diagnóstico electrónico', 'Escaneo de códigos de error'],
        costo: 150,
        kilometraje: 51500,
        observaciones: 'Se detectó problema en el embrague, programada reparación'
    },
    {
        id: 5,
        ordenId: null,
        vehiculoId: 2,
        clienteId: 1,
        tecnicoId: 3,
        fecha: '2025-12-20',
        tipo: 'Mantenimiento Preventivo',
        servicios: ['Cambio de aceite', 'Filtro de aire', 'Filtro de combustible'],
        costo: 650,
        kilometraje: 60000,
        observaciones: 'Mantenimiento de los 60,000 km completado'
    }
];

// Estadísticas del Dashboard
export const estadisticas = {
    ordenesActivas: 3,
    ordenesHoy: 2,
    citasHoy: 2,
    citasSemana: 5,
    clientesNuevos: 8,
    garantiasActivas: 4,
    ingresosMes: 15750,
    serviciosCompletados: 45
};

// Tipos de Servicios
export const tiposServicios = [
    { id: 1, nombre: 'Mantenimiento Preventivo', color: '#3b82f6' },
    { id: 2, nombre: 'Mantenimiento Correctivo', color: '#f59e0b' },
    { id: 3, nombre: 'Reparación', color: '#ef4444' },
    { id: 4, nombre: 'Reparación Mayor', color: '#dc2626' },
    { id: 5, nombre: 'Diagnóstico', color: '#8b5cf6' },
    { id: 6, nombre: 'Revisión de Garantía', color: '#10b981' },
    { id: 7, nombre: 'Revisión General', color: '#6366f1' }
];

// Servicios Disponibles
export const serviciosDisponibles = [
    { id: 1, nombre: 'Cambio de aceite', precio: 120, duracion: 0.5 },
    { id: 2, nombre: 'Filtro de aire', precio: 80, duracion: 0.25 },
    { id: 3, nombre: 'Filtro de combustible', precio: 100, duracion: 0.5 },
    { id: 4, nombre: 'Filtro de habitáculo', precio: 70, duracion: 0.25 },
    { id: 5, nombre: 'Cambio de pastillas de freno', precio: 350, duracion: 1 },
    { id: 6, nombre: 'Cambio de discos de freno', precio: 500, duracion: 1.5 },
    { id: 7, nombre: 'Alineación y balanceo', precio: 180, duracion: 1 },
    { id: 8, nombre: 'Diagnóstico electrónico', precio: 150, duracion: 1 },
    { id: 9, nombre: 'Revisión de frenos', precio: 100, duracion: 0.5 },
    { id: 10, nombre: 'Cambio de embrague', precio: 2500, duracion: 6 },
    { id: 11, nombre: 'Revisión de suspensión', precio: 120, duracion: 0.5 },
    { id: 12, nombre: 'Cambio de amortiguadores', precio: 800, duracion: 2 },
    { id: 13, nombre: 'Revisión multipunto', precio: 200, duracion: 1 },
    { id: 14, nombre: 'Cambio de bujías', precio: 150, duracion: 0.5 },
    { id: 15, nombre: 'Cambio de batería', precio: 400, duracion: 0.25 }
];

// Helpers para obtener datos relacionados
export const getClienteById = (id) => clientes.find(c => c.id === id);
export const getVehiculoById = (id) => vehiculos.find(v => v.id === id);
export const getTecnicoById = (id) => tecnicos.find(t => t.id === id);
export const getVehiculosByClienteId = (clienteId) => vehiculos.filter(v => v.clienteId === clienteId);
export const getOrdenesByClienteId = (clienteId) => ordenes.filter(o => o.clienteId === clienteId);
export const getOrdenesByVehiculoId = (vehiculoId) => ordenes.filter(o => o.vehiculoId === vehiculoId);
export const getCitasByClienteId = (clienteId) => citas.filter(c => c.clienteId === clienteId);
export const getGarantiasByVehiculoId = (vehiculoId) => garantias.filter(g => g.vehiculoId === vehiculoId);
export const getHistorialByVehiculoId = (vehiculoId) => historialServicios.filter(h => h.vehiculoId === vehiculoId);
