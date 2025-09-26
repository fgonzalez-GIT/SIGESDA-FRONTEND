import React from 'react';
import { Box, Typography } from '@mui/material';

const ActividadesPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Actividades
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Módulo para gestionar coros, clases de canto y clases de instrumentos.
      </Typography>
    </Box>
  );
};

export default ActividadesPage;