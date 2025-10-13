import React from 'react';
import { Seccion } from '../../../types/seccion.types';
import {
  Box,
  Typography,
  Divider,
  Chip
} from '@mui/material';
import { format } from 'date-fns';

interface InfoGeneralTabProps {
  seccion: Seccion;
}

export const InfoGeneralTab: React.FC<InfoGeneralTabProps> = ({ seccion }) => {
  const ocupacionPorcentaje = seccion.capacidadMaxima
    ? Math.round((seccion._count.participaciones / seccion.capacidadMaxima) * 100)
    : 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Información General
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box mb={3}>
        <Typography variant="caption" color="text.secondary" display="block">
          Actividad
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {seccion.actividad.nombre}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Tipo: {seccion.actividad.tipo}
        </Typography>
      </Box>

      {seccion.codigo && (
        <Box mb={3}>
          <Typography variant="caption" color="text.secondary" display="block">
            Código
          </Typography>
          <Typography variant="body1">
            {seccion.codigo}
          </Typography>
        </Box>
      )}

      <Box mb={3}>
        <Typography variant="caption" color="text.secondary" display="block">
          Capacidad
        </Typography>
        <Typography variant="body1">
          {seccion._count.participaciones} / {seccion.capacidadMaxima || '∞'}
        </Typography>
        <Typography variant="caption" color={ocupacionPorcentaje >= 90 ? 'error' : 'text.secondary'}>
          {ocupacionPorcentaje}% de ocupación
        </Typography>
      </Box>

      <Box mb={3}>
        <Typography variant="caption" color="text.secondary" display="block">
          Estado
        </Typography>
        <Chip
          label={seccion.activa ? 'Activa' : 'Inactiva'}
          color={seccion.activa ? 'success' : 'default'}
          size="small"
        />
      </Box>

      {seccion.observaciones && (
        <Box mb={3}>
          <Typography variant="caption" color="text.secondary" display="block">
            Observaciones
          </Typography>
          <Typography variant="body2">
            {seccion.observaciones}
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Box mb={3}>
        <Typography variant="caption" color="text.secondary" display="block">
          Fecha de Creación
        </Typography>
        <Typography variant="body2">
          {format(new Date(seccion.createdAt), 'dd/MM/yyyy HH:mm')}
        </Typography>
      </Box>

      <Box mb={3}>
        <Typography variant="caption" color="text.secondary" display="block">
          Última Actualización
        </Typography>
        <Typography variant="body2">
          {format(new Date(seccion.updatedAt), 'dd/MM/yyyy HH:mm')}
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoGeneralTab;
