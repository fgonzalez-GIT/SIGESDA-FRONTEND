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
// import ActividadesPage from './pages/Actividades/ActividadesPage'; // DEPRECADO - Reemplazado por ActividadesV2
import AulasPage from './pages/Aulas/AulasPage';
import CuotasPage from './pages/Cuotas/CuotasPage';
import MediosPagoPage from './pages/MediosPago/MediosPagoPage';
import RecibosPage from './pages/Recibos/RecibosPage';
import ParticipacionPage from './pages/Participacion/ParticipacionPage';
import FamiliaresPage from './pages/Familiares/FamiliaresPage';
import ReservasPage from './pages/Reservas/ReservasPage';
import ConfiguracionPage from './pages/Configuracion/ConfiguracionPage';
import CategoriasPage from './pages/Categorias/CategoriasPage';

// Actividades V2
import ActividadesV2Page from './pages/Actividades/ActividadesV2Page';
import ActividadDetalleV2Page from './pages/Actividades/ActividadDetalleV2Page';
import ActividadFormV2Page from './pages/Actividades/ActividadFormV2Page';

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
                <Route path="/personas" element={<PersonasPage />} />

                {/* Actividades V2 */}
                <Route path="/actividades" element={<ActividadesV2Page />} />
                <Route path="/actividades/nueva" element={<ActividadFormV2Page />} />
                <Route path="/actividades/:id" element={<ActividadDetalleV2Page />} />
                <Route path="/actividades/:id/editar" element={<ActividadFormV2Page />} />

                <Route path="/aulas" element={<AulasPage />} />
                <Route path="/cuotas" element={<CuotasPage />} />
                <Route path="/categorias" element={<CategoriasPage />} />
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