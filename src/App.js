import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importar estilos
import './styles/variables.css';
import './styles/layout.css';
import './styles/components.css';
import './App.css';

// Importar páginas
import Dashboard from './pages/Dashboard';
import ClientesList from './pages/Clientes/ClientesList';
import VehiculosList from './pages/Vehiculos/VehiculosList';
import OrdenesList from './pages/OrdenTrabajo/OrdenesList';
import SeguimientoServicios from './pages/Seguimiento/SeguimientoServicios';
import HistorialServicios from './pages/Historial/HistorialServicios';
import GarantiasList from './pages/Garantias/GarantiasList';
import Agenda from './pages/Citas/Agenda';
import TecnicosList from './pages/Tecnicos/TecnicosList';
import Reportes from './pages/Reportes/Reportes';

function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Gestión */}
        <Route path="/clientes" element={<ClientesList />} />
        <Route path="/vehiculos" element={<VehiculosList />} />
        <Route path="/ordenes" element={<OrdenesList />} />
        <Route path="/seguimiento" element={<SeguimientoServicios />} />

        {/* Post-Venta */}
        <Route path="/historial" element={<HistorialServicios />} />
        <Route path="/garantias" element={<GarantiasList />} />
        <Route path="/citas" element={<Agenda />} />

        {/* Recursos */}
        <Route path="/tecnicos" element={<TecnicosList />} />
        <Route path="/reportes" element={<Reportes />} />
      </Routes>
    </Router>
  );
}

export default App;
