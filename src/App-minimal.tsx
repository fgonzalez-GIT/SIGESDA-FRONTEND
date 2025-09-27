import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { store } from './store';
import { theme } from './theme';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <Box sx={{ p: 3 }}>
            <Typography variant="h1">
              🎉 SIGESDA - Sistema Funcionando
            </Typography>
            <Routes>
              <Route path="/" element={
                <div>
                  <h2>Dashboard Principal</h2>
                  <p>Aplicación React funcionando correctamente!</p>
                </div>
              } />
              <Route path="/dashboard" element={
                <div>
                  <h2>Dashboard</h2>
                  <p>Módulo Dashboard funcionando</p>
                </div>
              } />
            </Routes>
          </Box>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;