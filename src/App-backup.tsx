import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { store } from './store';
import { theme } from './theme';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages simples para pruebas
import Dashboard from './pages/Dashboard/Dashboard';
import PersonasPage from './pages/Personas/PersonasPageSimple';
import CuotasPage from './pages/Cuotas/CuotasPage';
import RecibosPage from './pages/Recibos/RecibosPage';

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
              <Route path="/cuotas" element={<CuotasPage />} />
              <Route path="/recibos" element={<RecibosPage />} />
              <Route path="/actividades" element={<div>Módulo Actividades - En desarrollo</div>} />
              <Route path="/aulas" element={<div>Módulo Aulas - En desarrollo</div>} />
              <Route path="/medios-pago" element={<div>Módulo Medios de Pago - En desarrollo</div>} />
              <Route path="/configuracion" element={<div>Módulo Configuración - En desarrollo</div>} />
              <Route path="/participacion" element={<div>Módulo Participación - En desarrollo</div>} />
              <Route path="/familiares" element={<div>Módulo Familiares - En desarrollo temporal</div>} />
              <Route path="/reservas" element={<div>Módulo Reservas - En desarrollo</div>} />
            </Routes>
          </DashboardLayout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;