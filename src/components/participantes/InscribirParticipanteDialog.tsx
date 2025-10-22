import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { ParticipanteSelect } from './ParticipanteSelect';
import { crearParticipacion } from '../../services/participacionApi';
import type { CreateParticipacionDTO } from '../../services/participacionApi';

interface InscribirParticipanteDialogProps {
  open: boolean;
  onClose: () => void;
  actividadId: number;
  actividadNombre?: string;
  costoActividad: number | string; // Puede venir como string desde la API
  cupoMaximo: number | null;
  cupoActual: number;
  fechaInicioActividad?: string;
  onSuccess?: () => void;
  participantesExistentes?: Array<{ persona_id: number }>;
}

export const InscribirParticipanteDialog: React.FC<InscribirParticipanteDialogProps> = ({
  open,
  onClose,
  actividadId,
  actividadNombre,
  costoActividad,
  cupoMaximo,
  cupoActual,
  fechaInicioActividad,
  onSuccess,
  participantesExistentes = [],
}) => {
  const [participanteId, setParticipanteId] = useState<number | string>('');
  const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
  const [precioEspecial, setPrecioEspecial] = useState<string>('');
  const [aplicarDescuento, setAplicarDescuento] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Errores de validación por campo
  const [participanteError, setParticipanteError] = useState<string>('');
  const [fechaError, setFechaError] = useState<string>('');

  // Convertir costoActividad a número por si viene como string
  const costoNumerico = typeof costoActividad === 'number' ? costoActividad : parseFloat(String(costoActividad)) || 0;

  // Calcular cupo disponible
  const cuposDisponibles = cupoMaximo ? cupoMaximo - cupoActual : null;
  const porcentajeOcupacion = cupoMaximo ? (cupoActual / cupoMaximo) * 100 : 0;
  const cupoLleno = cupoMaximo ? cupoActual >= cupoMaximo : false;
  const cupoAlto = porcentajeOcupacion >= 80;

  // Reset form cuando se cierra
  const handleClose = () => {
    setParticipanteId('');
    setFechaInicio(new Date());
    setPrecioEspecial('');
    setAplicarDescuento(false);
    setObservaciones('');
    setError(null);
    setParticipanteError('');
    setFechaError('');
    onClose();
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    setParticipanteError('');
    setFechaError('');
    setError(null);

    if (!participanteId) {
      setParticipanteError('Debe seleccionar un participante');
      return false;
    }

    if (!fechaInicio) {
      setFechaError('Debe seleccionar una fecha de inicio');
      return false;
    }

    // Validar que no esté duplicado
    const yaInscrito = participantesExistentes.some(
      (p) => Number(p.persona_id) === Number(participanteId)
    );

    if (yaInscrito) {
      setParticipanteError('Esta persona ya está inscrita en la actividad');
      return false;
    }

    // Validar cupo
    if (cupoLleno) {
      setError('No hay cupos disponibles para esta actividad');
      return false;
    }

    // Validar fecha de inicio de actividad si existe
    if (fechaInicioActividad) {
      const fechaActividad = new Date(fechaInicioActividad);
      if (fechaInicio < fechaActividad) {
        setFechaError('La fecha de inscripción no puede ser anterior a la fecha de inicio de la actividad');
        return false;
      }
    }

    return true;
  };

  // Inscribir participante
  const handleInscribir = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    setError(null);

    try {
      const data: CreateParticipacionDTO = {
        persona_id: Number(participanteId), // Convertir a número
        actividad_id: actividadId,
        fecha_inicio: format(fechaInicio!, 'yyyy-MM-dd'),
        precio_especial: precioEspecial ? parseFloat(precioEspecial) : undefined,
        observaciones: observaciones.trim() || undefined,
      };

      await crearParticipacion(data);

      // Éxito
      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (err: any) {
      console.error('Error al inscribir participante:', err);
      setError(err.message || 'Error al inscribir el participante a la actividad');
    } finally {
      setLoading(false);
    }
  };

  // Calcular precio con descuento (ejemplo: 10%)
  const calcularPrecioConDescuento = () => {
    const descuento = 0.1; // 10%
    const precioConDescuento = costoNumerico * (1 - descuento);
    setPrecioEspecial(precioConDescuento.toFixed(2));
    setAplicarDescuento(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAddIcon />
              <Typography variant="h6">Inscribir Participante</Typography>
            </Box>
            <IconButton onClick={handleClose} size="small" disabled={loading}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {/* Información de la actividad */}
          {actividadNombre && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Actividad:</strong> {actividadNombre}
              </Typography>
              <Typography variant="body2">
                <strong>Costo:</strong> ${costoNumerico.toFixed(2)}
              </Typography>
            </Alert>
          )}

          {/* Información de cupos */}
          {cupoMaximo && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Cupos: {cupoActual} / {cupoMaximo}
                  {cuposDisponibles !== null && ` (${cuposDisponibles} disponibles)`}
                </Typography>
                <Chip
                  label={`${porcentajeOcupacion.toFixed(0)}%`}
                  size="small"
                  color={cupoLleno ? 'error' : cupoAlto ? 'warning' : 'success'}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={porcentajeOcupacion}
                color={cupoLleno ? 'error' : cupoAlto ? 'warning' : 'success'}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}

          {/* Advertencia de cupo */}
          {cupoLleno && (
            <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 2 }}>
              No hay cupos disponibles. La actividad ha alcanzado su capacidad máxima.
            </Alert>
          )}

          {cupoAlto && !cupoLleno && (
            <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
              Quedan pocos cupos disponibles ({cuposDisponibles}).
            </Alert>
          )}

          {/* Error general */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Formulario */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Seleccionar participante */}
            <ParticipanteSelect
              value={participanteId}
              onChange={(id) => {
                setParticipanteId(id);
                setParticipanteError('');
                setError(null);
              }}
              error={participanteError}
              required
              label="Participante"
              fullWidth
              helperText="Seleccione la persona a inscribir en la actividad"
            />

            {/* Fecha de inicio */}
            <DatePicker
              label="Fecha de Inicio *"
              value={fechaInicio}
              onChange={(newValue) => {
                setFechaInicio(newValue);
                setFechaError('');
              }}
              disabled={loading}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!fechaError,
                  helperText: fechaError || 'Fecha en que el participante comienza la actividad',
                },
              }}
            />

            {/* Precio especial */}
            <Box>
              <TextField
                label="Precio Especial"
                type="number"
                value={precioEspecial}
                onChange={(e) => setPrecioEspecial(e.target.value)}
                fullWidth
                disabled={loading}
                placeholder={`${costoNumerico.toFixed(2)}`}
                helperText={`Dejar vacío para usar el precio normal ($${costoNumerico.toFixed(2)})`}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
              <Button
                size="small"
                onClick={calcularPrecioConDescuento}
                disabled={loading || aplicarDescuento}
                sx={{ mt: 1 }}
              >
                Aplicar 10% de descuento
              </Button>
            </Box>

            {/* Observaciones */}
            <TextField
              label="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              fullWidth
              multiline
              rows={3}
              disabled={loading}
              placeholder="Información adicional sobre la inscripción..."
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleInscribir}
            variant="contained"
            disabled={loading || cupoLleno}
            startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
          >
            {loading ? 'Inscribiendo...' : 'Inscribir'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default InscribirParticipanteDialog;
