import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import type { HorarioActividad } from '../../../../types/actividad.types';

interface HorarioItemProps {
  horario: HorarioActividad & {
    dias_semana?: {
      id: number;
      codigo: string;
      nombre: string;
      orden: number;
    };
  };
  onEdit: (horario: HorarioActividad) => void;
  onDelete: (horario: HorarioActividad) => void;
}

/**
 * Item individual de horario con acciones de editar y eliminar
 * Muestra día de la semana, hora inicio y hora fin
 * Optimizado con React.memo para evitar re-renders innecesarios
 */
export const HorarioItem: React.FC<HorarioItemProps> = React.memo(({
  horario,
  onEdit,
  onDelete
}) => {
  const formatHora = (hora: string) => {
    return hora.substring(0, 5); // HH:MM
  };

  const diaNombre = horario.dias_semana?.nombre || 'Sin día';
  const diaCodigo = horario.dias_semana?.codigo || '';

  return (
    <ListItem
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        bgcolor: 'background.paper',
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}
    >
      <Box sx={{ mr: 2 }}>
        <ScheduleIcon color="primary" />
      </Box>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={diaCodigo}
              size="small"
              color="primary"
              sx={{ fontWeight: 600, minWidth: 50 }}
            />
            <Typography variant="body1" fontWeight={500}>
              {diaNombre}
            </Typography>
          </Box>
        }
        secondary={
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {formatHora(horario.hora_inicio)} - {formatHora(horario.hora_fin)} hs
          </Typography>
        }
      />

      <ListItemSecondaryAction>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar horario">
            <IconButton
              edge="end"
              size="small"
              onClick={() => onEdit(horario)}
              sx={{ color: 'primary.main' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar horario">
            <IconButton
              edge="end"
              size="small"
              onClick={() => onDelete(horario)}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </ListItemSecondaryAction>
    </ListItem>
  );
});

HorarioItem.displayName = 'HorarioItem';

export default HorarioItem;
