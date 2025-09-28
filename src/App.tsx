import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { store } from './store';
import { theme } from './theme';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import PersonasPage from './pages/Personas/PersonasPageSimple';
import ActividadesPage from './pages/Actividades/ActividadesPage';
import AulasPage from './pages/Aulas/AulasPage';
import CuotasPage from './pages/Cuotas/CuotasPage';
import MediosPagoPage from './pages/MediosPago/MediosPagoPage';
import RecibosPage from './pages/Recibos/RecibosPage';
import ParticipacionPage from './pages/Participacion/ParticipacionPage';
import FamiliaresPage from './pages/Familiares/FamiliaresPage';
import ReservasPage from './pages/Reservas/ReservasPage';
import ConfiguracionPage from './pages/Configuracion/ConfiguracionPage';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/personas" element={<PersonasPage />} />
              <Route path="/actividades" element={<ActividadesPage />} />
              <Route path="/aulas" element={<AulasPage />} />
              <Route path="/cuotas" element={<CuotasPage />} />
              <Route path="/medios-pago" element={<MediosPagoPage />} />
              <Route path="/recibos" element={<RecibosPage />} />
              <Route path="/participacion" element={<ParticipacionPage />} />
              <Route path="/familiares" element={<FamiliaresPage />} />
              <Route path="/reservas" element={<ReservasPage />} />
              <Route path="/configuracion" element={<ConfiguracionPage />} />
            </Routes>
          </DashboardLayout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;