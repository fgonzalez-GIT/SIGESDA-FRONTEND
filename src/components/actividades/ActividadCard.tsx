/**
 * Componente Card para mostrar información resumida de una actividad
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import type { Actividad } from '../../types/actividad.types';
import { formatTime, getCupoDisponible, hasCupoDisponible } from '../../types/actividad.types';
import { EstadoBadge } from './EstadoBadge';

interface ActividadCardProps {
  actividad: Actividad;
  onView?: (actividad: Actividad) => void;
  onEdit?: (actividad: Actividad) => void;
  onDelete?: (actividad: Actividad) => void;
  onDuplicate?: (actividad: Actividad) => void;
  showActions?: boolean;
}

export const ActividadCard: React.FC<ActividadCardProps> = ({
  actividad,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  showActions = true,
}) => {
  const cupoDisponible = getCupoDisponible(actividad);
  const tieneCupo = hasCupoDisponible(actividad);

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flexGrow={1}>
            <Typography variant="h6" component="h3" gutterBottom>
              {actividad.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {actividad.codigoActividad}
            </Typography>
          </Box>
          {actividad.estadosActividades && (
            <EstadoBadge estado={actividad.estadosActividades} />
          )}
        </Box>

        {actividad.descripcion && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {actividad.descripcion}
          </Typography>
        )}

        <Stack spacing={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={actividad.tiposActividades?.nombre || 'N/A'}
              size="small"
              variant="outlined"
              color="primary"
            />
            <Chip
              label={actividad.categoriasActividades?.nombre || 'N/A'}
              size="small"
              variant="outlined"
            />
          </Box>

          {actividad.horarios_actividades && actividad.horarios_actividades.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Horarios:
              </Typography>
              {actividad.horarios_actividades.slice(0, 2).map((h) => (
                <Typography key={h.id} variant="body2">
                  {h.diasSemana?.nombre}: {formatTime(h.horaInicio)} - {formatTime(h.horaFin)}
                </Typography>
              ))}
              {actividad.horarios_actividades.length > 2 && (
                <Typography variant="caption" color="primary">
                  +{actividad.horarios_actividades.length - 2} más
                </Typography>
              )}
            </Box>
          )}

          <Box display="flex" gap={2} mt={1}>
            {actividad.capacidadMaxima && (
              <Tooltip title="Cupo disponible">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <PeopleIcon fontSize="small" color={tieneCupo ? 'success' : 'error'} />
                  <Typography variant="body2">
                    {cupoDisponible} / {actividad.capacidadMaxima}
                  </Typography>
                </Box>
              </Tooltip>
            )}

            <Tooltip title="Costo">
              <Box display="flex" alignItems="center" gap={0.5}>
                <MoneyIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  ${actividad.costo.toLocaleString()}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </Stack>
      </CardContent>

      {showActions && (
        <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
          {onView && (
            <Tooltip title="Ver detalles">
              <IconButton size="small" color="primary" onClick={() => onView(actividad)}>
                <ViewIcon />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Editar">
              <IconButton size="small" color="primary" onClick={() => onEdit(actividad)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {onDuplicate && (
            <Tooltip title="Duplicar">
              <IconButton size="small" onClick={() => onDuplicate(actividad)}>
                <CopyIcon />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Eliminar">
              <IconButton size="small" color="error" onClick={() => onDelete(actividad)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default ActividadCard;
