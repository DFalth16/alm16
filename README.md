# 🔧 Sistema de Gestión de Taller y Post-Venta

Sistema completo para la gestión de talleres automotrices, incluyendo clientes, vehículos, órdenes de trabajo, citas, garantías y reportes.

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta en [Supabase](https://supabase.com)

## 🚀 Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [app.supabase.com](https://app.supabase.com)
2. Clic en "New Project"
3. Ingresa los datos del proyecto:
   - **Name**: TallerPro (o el nombre que prefieras)
   - **Database Password**: Una contraseña segura (guárdala)
   - **Region**: Selecciona la más cercana
4. Clic en "Create new project"
5. Espera a que se configure (2-3 minutos)

### 2. Ejecutar el Schema de Base de Datos

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Clic en "New Query"
3. Copia TODO el contenido del archivo `database/schema.sql`
4. Pégalo en el editor
5. Clic en **Run** (o Ctrl+Enter)
6. Espera a que se ejecute completamente

> ⚠️ **IMPORTANTE**: Ejecuta todo el script de una vez. Si hay errores, verifica que no haya tablas existentes con los mismos nombres.

### 3. Obtener las Credenciales

1. Ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL**: `https://xxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI...`

### 4. Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` con tus credenciales:
   ```env
   REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

### 5. Instalar Dependencias e Iniciar

```bash
npm install
npm start
```

## 📊 Estructura de la Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `clientes` | Información de clientes del taller |
| `vehiculos` | Vehículos asociados a cada cliente |
| `tecnicos` | Equipo de técnicos/mecánicos |
| `ordenes_trabajo` | Órdenes de trabajo principales |
| `ordenes_servicios` | Servicios detallados de cada orden |
| `ordenes_historial` | Historial de cambios de estado |
| `citas` | Programación de citas |
| `garantias` | Registro de garantías |
| `reclamos_garantia` | Reclamos sobre garantías |
| `historial_servicios` | Historial consolidado de servicios |
| `usuarios` | Usuarios del sistema (integrado con Auth) |
| `tipos_servicio` | Catálogo de tipos de servicio |
| `servicios_catalogo` | Catálogo de servicios específicos |
| `configuracion` | Configuración general del sistema |
| `notificaciones` | Sistema de notificaciones |

### Diagrama de Relaciones

```
clientes ─────────┬───────── vehiculos
     │            │              │
     │            │              │
     └────────────┴──────────────┼─── ordenes_trabajo
                                 │           │
                                 │           ├─── ordenes_servicios
                                 │           └─── ordenes_historial
                                 │
                                 ├────── garantias
                                 │           └─── reclamos_garantia
                                 │
                                 ├────── citas
                                 │
                                 └────── historial_servicios

tecnicos ──────────── ordenes_trabajo
         └─────────── citas
```

## 🛠️ Servicios Disponibles

Los servicios se encuentran en `src/services/` y proporcionan todas las funciones CRUD para cada entidad:

### clientesService
- `getAll(options)` - Listar clientes con filtros
- `getById(id)` - Obtener cliente por ID
- `getWithVehiculos(id)` - Cliente con sus vehículos
- `create(cliente)` - Crear cliente
- `update(id, updates)` - Actualizar cliente
- `delete(id)` - Desactivar cliente (soft delete)
- `search(term)` - Buscar clientes
- `getStats()` - Estadísticas de clientes

### vehiculosService
- `getAll(options)` - Listar vehículos
- `getById(id)` - Obtener vehículo por ID
- `getByClienteId(clienteId)` - Vehículos de un cliente
- `create(vehiculo)` - Crear vehículo
- `update(id, updates)` - Actualizar vehículo
- `updateKilometraje(id, km)` - Actualizar kilometraje
- `getMarcas()` - Obtener marcas únicas
- `searchByPlaca(placa)` - Buscar por placa

### ordenesService
- `getAll(options)` - Listar órdenes con filtros
- `getById(id)` - Obtener orden completa
- `getActivas()` - Órdenes activas
- `create(orden)` - Crear orden
- `update(id, updates)` - Actualizar orden
- `cambiarEstado(id, estado)` - Cambiar estado
- `asignarTecnico(ordenId, tecnicoId)` - Asignar técnico
- `agregarServicio(ordenId, servicio)` - Agregar servicio
- `getServicios(ordenId)` - Servicios de una orden
- `completarServicio(servicioId)` - Marcar servicio completado
- `getHistorial(ordenId)` - Historial de cambios
- `getStats()` - Estadísticas

### tecnicosService
- `getAll(options)` - Listar técnicos
- `getById(id)` - Obtener técnico
- `getDisponibles()` - Técnicos disponibles
- `create(tecnico)` - Crear técnico
- `update(id, updates)` - Actualizar técnico
- `setDisponibilidad(id, disponible)` - Cambiar disponibilidad
- `getOrdenesAsignadas(tecnicoId)` - Órdenes del técnico
- `getEstadisticas(tecnicoId)` - Estadísticas del técnico
- `actualizarCalificacion(id, calificacion)` - Actualizar rating

### citasService
- `getAll(options)` - Listar citas
- `getById(id)` - Obtener cita
- `getByFecha(fecha)` - Citas de un día
- `getHoy()` - Citas de hoy
- `getSemana()` - Citas de la semana
- `getMes(anio, mes)` - Citas del mes
- `create(cita)` - Crear cita
- `update(id, updates)` - Actualizar cita
- `confirmar(id)` - Confirmar cita
- `cancelar(id)` - Cancelar cita
- `verificarDisponibilidad(fecha, inicio, fin)` - Verificar horario

### garantiasService
- `getAll(options)` - Listar garantías
- `getById(id)` - Obtener garantía
- `getActivas()` - Garantías activas
- `getProximasVencer(dias)` - Próximas a vencer
- `getByVehiculoId(vehiculoId)` - Garantías de un vehículo
- `verificarGarantia(vehiculoId, km)` - Verificar cobertura
- `create(garantia)` - Crear garantía
- `update(id, updates)` - Actualizar garantía
- `registrarReclamo(reclamo)` - Registrar reclamo
- `getReclamos(garantiaId)` - Reclamos de una garantía

### historialService
- `getAll(options)` - Historial completo
- `getByVehiculoId(vehiculoId)` - Historial de vehículo
- `getByClienteId(clienteId)` - Historial de cliente
- `registrar(historial)` - Registrar entrada
- `registrarDesdeOrden(ordenId)` - Registrar desde orden
- `agregarCalificacion(id, calificacion)` - Agregar rating
- `getStats(options)` - Estadísticas
- `exportar(options)` - Exportar datos

### reportesService
- `getDashboardStats()` - Estadísticas del dashboard
- `getReporteIngresos(desde, hasta)` - Reporte de ingresos
- `getReporteTecnicos(desde, hasta)` - Rendimiento de técnicos
- `getClientesFrecuentes(limit)` - Clientes frecuentes
- `getServiciosMasSolicitados(desde, hasta)` - Top servicios
- `getReporteGarantias()` - Reporte de garantías
- `getResumenGeneral(desde, hasta)` - Resumen completo

## 📁 Estructura de Archivos

```
src/
├── components/
│   └── Layout/
│       ├── Header.jsx
│       ├── Layout.jsx
│       └── Sidebar.jsx
├── data/
│   └── mockData.js
├── lib/
│   └── supabase.js
├── pages/
│   ├── Citas/
│   │   └── Agenda.jsx
│   ├── Clientes/
│   │   └── ClientesList.jsx
│   ├── Garantias/
│   │   └── GarantiasList.jsx
│   ├── Historial/
│   │   └── HistorialServicios.jsx
│   ├── OrdenTrabajo/
│   │   └── OrdenesList.jsx
│   ├── Reportes/
│   │   └── Reportes.jsx
│   ├── Seguimiento/
│   │   └── SeguimientoServicios.jsx
│   ├── Tecnicos/
│   │   └── TecnicosList.jsx
│   ├── Vehiculos/
│   │   └── VehiculosList.jsx
│   └── Dashboard.jsx
├── services/
│   ├── index.js
│   ├── citasService.js
│   ├── clientesService.js
│   ├── garantiasService.js
│   ├── historialService.js
│   ├── ordenesService.js
│   ├── reportesService.js
│   ├── tecnicosService.js
│   └── vehiculosService.js
├── styles/
│   ├── components.css
│   ├── layout.css
│   └── variables.css
├── App.css
├── App.js
├── index.css
└── index.js

database/
└── schema.sql
```

## 🔐 Seguridad (RLS)

El schema incluye políticas de Row Level Security (RLS) que:

- Permiten lectura a todos los usuarios autenticados
- Permiten inserción/actualización a usuarios autenticados
- Restringen las notificaciones solo al usuario propietario
- Protegen los perfiles de usuario

## 🔧 Funciones Automáticas

La base de datos incluye triggers automáticos para:

- **`update_updated_at_column`**: Actualiza automáticamente el campo `updated_at`
- **`registrar_cambio_estado_orden`**: Registra cambios de estado en el historial
- **`actualizar_ultimo_servicio_vehiculo`**: Actualiza el último servicio del vehículo al entregar una orden
- **`verificar_garantias_vencidas`**: Marca garantías vencidas automáticamente

## 📊 Vistas Útiles

El schema incluye vistas predefinidas:

- `vista_ordenes_completa`: Órdenes con toda la información relacionada
- `vista_garantias_activas`: Garantías activas con días restantes
- `vista_citas_hoy`: Citas programadas para hoy
- `vista_estadisticas_tecnicos`: Estadísticas de rendimiento de técnicos

## 💡 Uso de los Servicios

Ejemplo de uso en un componente React:

```javascript
import { useState, useEffect } from 'react';
import { clientesService, vehiculosService } from '../services';

function MiComponente() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const { data } = await clientesService.getAll({ limit: 20 });
        setClientes(data);
      } catch (error) {
        console.error('Error cargando clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarClientes();
  }, []);

  const crearCliente = async (nuevoCliente) => {
    try {
      const cliente = await clientesService.create(nuevoCliente);
      setClientes([...clientes, cliente]);
    } catch (error) {
      console.error('Error creando cliente:', error);
    }
  };

  // ... resto del componente
}
```

## 📝 Notas Importantes

1. **Datos de Prueba**: Actualmente la app usa datos mock en `src/data/mockData.js`. Para usar Supabase, debes modificar los componentes para usar los servicios.

2. **Autenticación**: El sistema está preparado para usar Supabase Auth. Debes implementar el flujo de login/registro.

3. **Imágenes**: Para subir imágenes (vehículos, técnicos), configura Supabase Storage.

4. **Notificaciones**: El sistema de notificaciones está estructurado pero necesita implementación del frontend.

## 🤝 Soporte

Si tienes preguntas o problemas, revisa la [documentación de Supabase](https://supabase.com/docs) o abre un issue.
