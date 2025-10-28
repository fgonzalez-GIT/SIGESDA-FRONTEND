import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { store } from './store';
import { theme } from './theme';
import DashboardLayout from './components/layout/DashboardLayout';
import { CatalogosProvider } from './providers/CatalogosProvider';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import PersonasPage from './pages/Personas/PersonasPageSimple';
import PersonasPageV2 from './pages/Personas/PersonasPageV2';
import PersonaDetallePageV2 from './pages/Personas/PersonaDetallePageV2';
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
                <Route path="/personas-v2" element={<PersonasPageV2 />} />
                <Route path="/personas-v2/:id" element={<PersonaDetallePageV2 />} />

                {/* Administración de Catálogos Personas */}
                <Route path="/personas-v2/admin/tipos-persona" element={<TiposPersonaAdminPage />} />
                <Route path="/personas-v2/admin/especialidades" element={<EspecialidadesDocenteAdminPage />} />
                <Route path="/personas-v2/admin/tipos-contacto" element={<TiposContactoAdminPage />} />

                {/* Actividades */}
                <Route path="/actividades" element={<ActividadesPage />} />
                <Route path="/actividades/nueva" element={<ActividadFormPage />} />
                <Route path="/actividades/:id" element={<ActividadDetallePageV2 />} />
                <Route path="/actividades/:id/v1" element={<ActividadDetallePage />} />
                <Route path="/actividades/:id/editar" element={<ActividadFormPage />} />

                <Route path="/aulas" element={<AulasPage />} />
                <Route path="/cuotas" element={<CuotasPage />} />
                <Route path="/categorias" element={<CategoriasPage />} />
                <Route path="/tipos-actividad" element={<TiposActividadPage />} />
                <Route path="/categorias-actividad" element={<CategoriasActividadPage />} />
                <Route path="/medios-pago" element={<MediosPagoPage />} />
                <Route path="/recibos" element={<RecibosPage />} />
                <Route path="/participacion" element={<ParticipacionPage />} />
                <Route path="/familiares" element={<FamiliaresPage />} />
                <Route path="/reservas" element={<ReservasPage />} />
                <Route path="/configuracion" element={<ConfiguracionPage />} />
              </Routes>
            </DashboardLayout>
          </Router>
        </CatalogosProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;