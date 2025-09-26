import React from 'react';
import { Box, Typography } from '@mui/material';

const PersonasPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Personas
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Módulo para gestionar socios, docentes, no socios y proveedores.
      </Typography>
    </Box>
  );
};

export default PersonasPage;