import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { store } from './store';
import { theme } from './theme';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages que funcionan
import Dashboard from './pages/Dashboard/Dashboard';
import PersonasPage from './pages/Personas/PersonasPageSimple';

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
              <Route path="/actividades" element={<div style={{padding: '20px'}}><h2>🎵 Módulo Actividades</h2><p>En desarrollo...</p></div>} />
              <Route path="/aulas" element={<div style={{padding: '20px'}}><h2>🏢 Módulo Aulas</h2><p>En desarrollo...</p></div>} />
              <Route path="/cuotas" element={<div style={{padding: '20px'}}><h2>💰 Módulo Cuotas</h2><p>Funcional en el demo: <a href="/demo.html">Ver Demo</a></p></div>} />
              <Route path="/medios-pago" element={<div style={{padding: '20px'}}><h2>💳 Módulo Medios de Pago</h2><p>En desarrollo...</p></div>} />
              <Route path="/recibos" element={<div style={{padding: '20px'}}><h2>📄 Módulo Recibos</h2><p>Funcional en el demo: <a href="/demo.html">Ver Demo</a></p></div>} />
              <Route path="/configuracion" element={<div style={{padding: '20px'}}><h2>⚙️ Módulo Configuración</h2><p>En desarrollo...</p></div>} />
              <Route path="/participacion" element={<div style={{padding: '20px'}}><h2>👥 Módulo Participación</h2><p>En desarrollo...</p></div>} />
              <Route path="/familiares" element={<div style={{padding: '20px'}}><h2>👨‍👩‍👧‍👦 Módulo Familiares</h2><p>Módulo completo implementado - Corrección de errores en progreso</p></div>} />
              <Route path="/reservas" element={<div style={{padding: '20px'}}><h2>📅 Módulo Reservas</h2><p>En desarrollo...</p></div>} />
            </Routes>
          </DashboardLayout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;