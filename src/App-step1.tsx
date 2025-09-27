import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Typography, CssBaseline, Button, Stack } from '@mui/material';
import { store } from './store';
import { theme } from './theme';
import PersonasPageSimple from './pages/Personas/PersonasPageSimple';
import CuotasPage from './pages/Cuotas/CuotasPage';

// Componente simple de Dashboard
const SimpleDashboard = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>
      📊 Dashboard Principal
    </Typography>
    <Typography variant="body1">
      Sistema de Gestión de Socios y Actividades funcionando correctamente.
    </Typography>
  </Box>
);

// Componente de navegación
const Navigation = () => {
  const location = useLocation();

  return (
    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
      <Button
        component={Link}
        to="/dashboard"
        variant={location.pathname === '/dashboard' || location.pathname === '/' ? 'contained' : 'outlined'}
        size="small"
        sx={{ color: 'white', borderColor: 'white' }}
      >
        📊 Dashboard
      </Button>
      <Button
        component={Link}
        to="/personas"
        variant={location.pathname === '/personas' ? 'contained' : 'outlined'}
        size="small"
        sx={{ color: 'white', borderColor: 'white' }}
      >
        👥 Personas
      </Button>
      <Button
        component={Link}
        to="/cuotas"
        variant={location.pathname === '/cuotas' ? 'contained' : 'outlined'}
        size="small"
        sx={{ color: 'white', borderColor: 'white' }}
      >
        💰 Cuotas
      </Button>
    </Stack>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Header simple */}
            <Box sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              p: 2,
              boxShadow: 1
            }}>
              <Typography variant="h6">
                🏢 SIGESDA - Sistema de Gestión
              </Typography>
              <Navigation />
            </Box>

            {/* Contenido principal */}
            <Box sx={{ flexGrow: 1, p: 3 }}>
              <Routes>
                <Route path="/" element={<SimpleDashboard />} />
                <Route path="/dashboard" element={<SimpleDashboard />} />
                <Route path="/personas" element={<PersonasPageSimple />} />
                <Route path="/cuotas" element={<CuotasPage />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;