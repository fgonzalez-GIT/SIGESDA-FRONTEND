import React, { useMemo } from 'react';
import { Seccion } from '../../types/seccion.types';
import { OCUPACION_THRESHOLDS } from '../../constants/secciones.constants';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  AccessTime as ClockIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from '@mui/icons-material';

interface SeccionCardProps {
  seccion: Seccion;
  onClick?: () => void;
}

export const SeccionCard: React.FC<SeccionCardProps> = ({ seccion, onClick }) => {
  const ocupacionPorcentaje = useMemo(() => {
    if (!seccion.capacidadMaxima) return 0;
    return Math.round((seccion._count.participaciones / seccion.capacidadMaxima) * 100);
  }, [seccion._count.participaciones, seccion.capacidadMaxima]);

  const ocupacionColor = useMemo(() => {
    if (ocupacionPorcentaje >= OCUPACION_THRESHOLDS.LLENA) return 'error';
    if (ocupacionPorcentaje >= OCUPACION_THRESHOLDS.CASI_LLENA) return 'warning';
    if (ocupacionPorcentaje >= OCUPACION_THRESHOLDS.PARCIAL) return 'info';
    return 'success';
  }, [ocupacionPorcentaje]);

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        height: '100%',
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {seccion.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {seccion.actividad.nombre}
            </Typography>
            {seccion.codigo && (
              <Typography variant="caption" color="text.secondary">
                Código: {seccion.codigo}
              </Typography>
            )}
          </Box>
          <Chip
            icon={seccion.activa ? <ActiveIcon /> : <InactiveIcon />}
            label={seccion.activa ? 'Activa' : 'Inactiva'}
            color={seccion.activa ? 'success' : 'default'}
            size="small"
          />
        </Box>

        {/* Ocupación */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2">
              Ocupación
            </Typography>
            <Typography variant="body2" fontWeight="bold" color={`${ocupacionColor}.main`}>
              {seccion._count.participaciones} / {seccion.capacidadMaxima || '∞'}
            </Typography>
          </Box>
          <Tooltip title={`${ocupacionPorcentaje}% ocupado`}>
            <LinearProgress
              variant="determinate"
              value={ocupacionPorcentaje}
              color={ocupacionColor}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Tooltip>
        </Box>

        {/* Docentes */}
        {seccion.docentes.length > 0 && (
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Docentes:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {seccion.docentes.map(doc => (
                <Chip
                  key={doc.id}
                  icon={<PersonIcon />}
                  label={`${doc.nombre} ${doc.apellido}`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Horarios */}
        {seccion.horarios.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Horarios:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {seccion.horarios.map(h => (
                <Chip
                  key={h.id}
                  icon={<ClockIcon />}
                  label={`${h.diaSemana.substring(0, 3)} ${h.horaInicio}-${h.horaFin}`}
                  size="small"
                  color={h.activo ? 'default' : 'error'}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SeccionCard;
