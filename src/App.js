import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Importar estilos
import './styles/variables.css';
import './styles/layout.css';
import './styles/components.css';
import './App.css';

// Importar páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardRecepcionista from './pages/DashboardRecepcionista';
import DashboardMecanico from './pages/DashboardMecanico';
import ClientesList from './pages/Clientes/ClientesList';
import VehiculosList from './pages/Vehiculos/VehiculosList';
import OrdenesList from './pages/OrdenTrabajo/OrdenesList';
import SeguimientoServicios from './pages/Seguimiento/SeguimientoServicios';
import HistorialServicios from './pages/Historial/HistorialServicios';
import GarantiasList from './pages/Garantias/GarantiasList';
import Agenda from './pages/Citas/Agenda';
import TecnicosList from './pages/Tecnicos/TecnicosList';
import PersonalList from './pages/Personal/PersonalList';
import Reportes from './pages/Reportes/Reportes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública - Login */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard - Administrador */}
          <Route
            path="/"
            element={
              <PrivateRoute allowedRoles={['administrador', 'admin']}>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Dashboard - Recepcionista */}
          <Route
            path="/recepcionista"
            element={
              <PrivateRoute allowedRoles={['recepcionista']}>
                <DashboardRecepcionista />
              </PrivateRoute>
            }
          />

          {/* Dashboard - Mecánico */}
          <Route
            path="/mecanico"
            element={
              <PrivateRoute allowedRoles={['mecanico', 'operador']}>
                <DashboardMecanico />
              </PrivateRoute>
            }
          />

          {/* Gestión - Accesible para admin y recepcionista */}
          <Route
            path="/clientes"
            element={
              <PrivateRoute allowedRoles={['administrador', 'admin', 'recepcionista']}>
                <ClientesList />
              </PrivateRoute>
            }
          />
          <Route
            path="/vehiculos"
            element={
              <PrivateRoute allowedRoles={['administrador', 'admin', 'recepcionista']}>
                <VehiculosList />
              </PrivateRoute>
            }
          />
          <Route
            path="/ordenes"
            element={
              <PrivateRoute>
                <OrdenesList />
              </PrivateRoute>
            }
          />
          <Route
            path="/seguimiento"
            element={
              <PrivateRoute>
                <SeguimientoServicios />
              </PrivateRoute>
            }
          />

          {/* Post-Venta */}
          <Route
            path="/historial"
            element={
              <PrivateRoute>
                <HistorialServicios />
              </PrivateRoute>
            }
          />
          <Route
            path="/garantias"
            element={
              <PrivateRoute allowedRoles={['administrador', 'admin', 'recepcionista']}>
                <GarantiasList />
              </PrivateRoute>
            }
          />
          <Route
            path="/citas"
            element={
              <PrivateRoute allowedRoles={['administrador', 'admin', 'recepcionista']}>
                <Agenda />
              </PrivateRoute>
            }
          />

          {/* Recursos - Solo admin */}
          <Route
            path="/tecnicos"
            element={
              <PrivateRoute allowedRoles={['administrador', 'admin']}>
                <TecnicosList />
              </PrivateRoute>
            }
          />
          <Route
            path="/personal"
            element={
              <PrivateRoute allowedRoles={['administrador', 'admin']}>
                <PersonalList />
              </PrivateRoute>
            }
          />
          <Route
            path="/reportes"
            element={
              <PrivateRoute allowedRoles={['administrador', 'admin']}>
                <Reportes />
              </PrivateRoute>
            }
          />

          {/* Ruta por defecto - redirige a login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

