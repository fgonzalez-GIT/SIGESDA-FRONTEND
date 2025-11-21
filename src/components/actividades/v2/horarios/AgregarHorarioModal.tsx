import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
  Divider
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { actividadesApi } from '../../../../services/actividadesApi';
import { useCatalogos } from '../../../../hooks/useActividades';
import type { CreateHorarioDTO, HorarioActividad } from '../../../../types/actividad.types';

interface AgregarHorarioModalProps {
  open: boolean;
  onClose: () => void;
  actividadId: number;
  actividadNombre: string;
  horarioEditar?: HorarioActividad | null;
  onSuccess: () => void;
}

/**
 * Modal para agregar o editar horarios de actividad
 * Permite seleccionar día de la semana, hora inicio y hora fin
 * Valida que la hora fin sea posterior a la hora inicio
 */
export const AgregarHorarioModal: React.FC<AgregarHorarioModalProps> = ({
  open,
  onClose,
  actividadId,
  actividadNombre,
  horarioEditar,
  onSuccess
}) => {
  const { catalogos } = useCatalogos();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const diasSemana = catalogos?.diasSemana || [];

  // Estados del formulario
  const [diaSemanaId, setDiaSemanaId] = useState<number>(0);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  // Resetear o cargar datos al abrir
  useEffect(() => {
    if (open) {
      if (horarioEditar) {
        // Modo edición
        setDiaSemanaId(horarioEditar.diaSemanaId);
        setHoraInicio(horarioEditar.horaInicio.substring(0, 5)); // HH:MM
        setHoraFin(horarioEditar.horaFin.substring(0, 5)); // HH:MM
      } else {
        // Modo creación
        setDiaSemanaId(0);
        setHoraInicio('');
        setHoraFin('');
      }
      setError(null);
    }
  }, [open, horarioEditar]);

  const handleClose = () => {
    setDiaSemanaId(0);
    setHoraInicio('');
    setHoraFin('');
    setError(null);
    onClose();
  };

  const validarFormulario = (): boolean => {
    if (diaSemanaId === 0) {
      setError('Debes seleccionar un día de la semana');
      return false;
    }

    if (!horaInicio || !horaFin) {
      setError('Debes ingresar hora de inicio y hora de fin');
      return false;
    }

    // Validar que hora fin sea posterior a hora inicio
    if (horaFin <= horaInicio) {
      setError('La hora de fin debe ser posterior a la hora de inicio');
      return false;
    }

    return true;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    setError(null);

    try {
      const data: CreateHorarioDTO = {
        diaSemanaId: diaSemanaId,
        horaInicio: `${horaInicio}:00`,
        horaFin: `${horaFin}:00`,
        activo: true
      };

      if (horarioEditar) {
        // Actualizar horario existente
        await actividadesApi.actualizarHorario(horarioEditar.id, data);
      } else {
        // Crear nuevo horario
        await actividadesApi.agregarHorario(actividadId, data);
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      setError(error.message || 'Error al guardar horario');
    } finally {
      setLoading(false);
    }
  };

  // Obtener el día seleccionado para mostrarlo
  const diaSeleccionado = diasSemana.find(d => d.id === diaSemanaId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon />
          {horarioEditar ? 'Editar Horario' : 'Agregar Horario'}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {actividadNombre}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          {/* Selector de día de la semana */}
          <TextField
            select
            fullWidth
            label="Día de la Semana"
            value={diaSemanaId}
            onChange={(e) => setDiaSemanaId(Number(e.target.value))}
            required
            helperText="Selecciona el día en que se desarrolla la actividad"
          >
            <MenuItem value={0} disabled>
              Seleccionar día...
            </MenuItem>
            {diasSemana.map((dia) => (
              <MenuItem key={dia.id} value={dia.id}>
                {dia.nombre}
              </MenuItem>
            ))}
          </TextField>

          <Divider />

          {/* Horarios */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              type="time"
              label="Hora de Inicio"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              required
              InputLabelProps={{
                shrink: true
              }}
              helperText="Hora de inicio"
            />
            <TextField
              type="time"
              label="Hora de Fin"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              required
              InputLabelProps={{
                shrink: true
              }}
              helperText="Hora de finalización"
            />
          </Box>

          {/* Preview del horario */}
          {diaSeleccionado && horaInicio && horaFin && (
            <Alert severity="info" icon={<ScheduleIcon />}>
              <Typography variant="body2" fontWeight={500}>
                Vista previa: {diaSeleccionado.nombre}s de {horaInicio} a {horaFin} hs
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleGuardar}
          disabled={loading || diaSemanaId === 0 || !horaInicio || !horaFin}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
        >
          {loading ? 'Guardando...' : horarioEditar ? 'Actualizar' : 'Agregar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgregarHorarioModal;
