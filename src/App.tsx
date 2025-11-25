import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { store } from './store';
import { theme } from './theme';
import DashboardLayout from './components/layout/DashboardLayout';
import { CatalogosProvider } from './providers/CatalogosProvider';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import PersonasPage from './pages/Personas/PersonasPage';
import PersonaDetallePage from './pages/Personas/PersonaDetallePage';
import TiposPersonaAdminPage from './pages/Personas/Admin/TiposPersonaAdminPage';
import EspecialidadesDocenteAdminPage from './pages/Personas/Admin/EspecialidadesDocenteAdminPage';
import TiposContactoAdminPage from './pages/Personas/Admin/TiposContactoAdminPage';
import AulasPage from './pages/Aulas/AulasPage';
import CuotasPage from './pages/Cuotas/CuotasPage';
import MediosPagoPage from './pages/MediosPago/MediosPagoPage';
import RecibosPage from './pages/Recibos/RecibosPage';
import ParticipacionPage from './pages/Participacion/ParticipacionPage';
import FamiliaresPage from './pages/Familiares/FamiliaresPage';
import ReservasPage from './pages/Reservas/ReservasPage';
import ReservaDetallePage from './pages/Reservas/ReservaDetallePage';
import DashboardReservasPage from './pages/Reservas/DashboardReservasPage';
import ConfiguracionPage from './pages/Configuracion/ConfiguracionPage';
import CategoriasPage from './pages/Categorias/CategoriasPage';
import TiposActividadPage from './pages/TiposActividad/TiposActividadPage';
import CategoriasActividadPage from './pages/CategoriasActividad/CategoriasActividadPage';

// Actividades
import ActividadesPage from './pages/Actividades/ActividadesPage';
import ActividadDetallePage from './pages/Actividades/ActividadDetallePage';
import ActividadDetallePageV2 from './pages/Actividades/ActividadDetallePageV2';
import ActividadFormPage from './pages/Actividades/ActividadFormPage';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CatalogosProvider>
          <Router>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Personas */}
                <Route path="/personas" element={<PersonasPage />} />
                <Route path="/personas/:id" element={<PersonaDetallePage />} />

                {/* Admin - Catálogos de Personas */}
                <Route path="/admin/personas/tipos" element={<TiposPersonaAdminPage />} />
                <Route path="/admin/personas/especialidades" element={<EspecialidadesDocenteAdminPage />} />
                <Route path="/admin/personas/tipos-contacto" element={<TiposContactoAdminPage />} />

                {/* Actividades */}
                <Route path="/actividades" element={<ActividadesPage />} />
                <Route path="/actividades/nueva" element={<ActividadFormPage />} />
                <Route path="/actividades/:id" element={<ActividadDetallePageV2 />} />
                <Route path="/actividades/:id/v1" element={<ActividadDetallePage />} />
                <Route path="/actividades/:id/editar" element={<ActividadFormPage />} />

                {/* Admin - Catálogos de Actividades */}
                <Route path="/admin/actividades/tipos" element={<TiposActividadPage />} />
                <Route path="/admin/actividades/categorias" element={<CategoriasActividadPage />} />

                <Route path="/aulas" element={<AulasPage />} />
                <Route path="/cuotas" element={<CuotasPage />} />
                <Route path="/categorias" element={<CategoriasPage />} />
                <Route path="/medios-pago" element={<MediosPagoPage />} />
                <Route path="/recibos" element={<RecibosPage />} />
                <Route path="/participacion" element={<ParticipacionPage />} />
                <Route path="/familiares" element={<FamiliaresPage />} />

                {/* Reservas */}
                <Route path="/reservas" element={<ReservasPage />} />
                <Route path="/reservas/dashboard" element={<DashboardReservasPage />} />
                <Route path="/reservas/:id" element={<ReservaDetallePage />} />

                <Route path="/configuracion" element={<ConfiguracionPage />} />

                {/* Redirects para rutas antiguas (compatibilidad hacia atrás) */}
                <Route path="/tipos-actividad" element={<Navigate to="/admin/actividades/tipos" replace />} />
                <Route path="/categorias-actividad" element={<Navigate to="/admin/actividades/categorias" replace />} />
              </Routes>
            </DashboardLayout>
          </Router>
        </CatalogosProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;