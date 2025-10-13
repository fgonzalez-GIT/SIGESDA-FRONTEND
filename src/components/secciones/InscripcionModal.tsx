import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/redux';
import { showNotification } from '../../store/slices/uiSlice';
import seccionesApi from '../../services/seccionesApi';
import { Seccion, InscribirParticipanteDto } from '../../types/seccion.types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  AlertTitle,
  Typography,
  Chip,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

interface InscripcionModalProps {
  open: boolean;
  onClose: () => void;
  seccion: Seccion;
  onSuccess: () => void;
}

interface Persona {
  id: string;
  nombre: string;
  apellido: string;
  email?: string;
  tipo: string;
}

interface FormData {
  personaId: string;
  fechaInicio: string;
  fechaFin: string;
  precioEspecial: string;
  observaciones: string;
  activa: boolean;
}

export const InscripcionModal: React.FC<InscripcionModalProps> = ({
  open,
  onClose,
  seccion,
  onSuccess
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [capacidadLlena, setCapacidadLlena] = useState(false);
  const [yaInscrito, setYaInscrito] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    personaId: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    precioEspecial: '',
    observaciones: '',
    activa: true
  });

  useEffect(() => {
    if (open) {
      loadPersonas();
      checkCapacidad();
    }
  }, [open]);

  useEffect(() => {
    if (formData.personaId) {
      checkInscripcionExistente();
    } else {
      setYaInscrito(false);
    }
  }, [formData.personaId]);

  const loadPersonas = async () => {
    setLoadingPersonas(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/personas`);
      if (response.ok) {
        const result = await response.json();
        setPersonas(result.data || result);
      }
    } catch (error) {
      console.error('Error al cargar personas:', error);
      dispatch(showNotification({
        message: 'Error al cargar personas',
        severity: 'error'
      }));
    } finally {
      setLoadingPersonas(false);
    }
  };

  const checkCapacidad = () => {
    if (seccion.capacidadMaxima) {
      const ocupacionActual = seccion._count.participaciones;
      setCapacidadLlena(ocupacionActual >= seccion.capacidadMaxima);
    } else {
      setCapacidadLlena(false);
    }
  };

  const checkInscripcionExistente = async () => {
    try {
      const response = await seccionesApi.getParticipantes(seccion.id);
      const participaciones = response.data;
      const existe = participaciones.some(
        (p: any) => p.personaId === formData.personaId && p.activa
      );
      setYaInscrito(existe);
    } catch (error) {
      console.error('Error al verificar inscripción:', error);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.personaId) {
      dispatch(showNotification({
        message: 'Debe seleccionar una persona',
        severity: 'warning'
      }));
      return;
    }

    if (capacidadLlena) {
      dispatch(showNotification({
        message: 'La sección ha alcanzado su capacidad máxima',
        severity: 'warning'
      }));
      return;
    }

    if (yaInscrito) {
      dispatch(showNotification({
        message: 'Esta persona ya está inscrita en la sección',
        severity: 'warning'
      }));
      return;
    }

    if (formData.fechaFin && formData.fechaFin <= formData.fechaInicio) {
      dispatch(showNotification({
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        severity: 'warning'
      }));
      return;
    }

    setLoading(true);
    try {
      const data: InscribirParticipanteDto = {
        personaId: formData.personaId,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin || undefined,
        precioEspecial: formData.precioEspecial ? parseFloat(formData.precioEspecial) : undefined,
        observaciones: formData.observaciones || undefined,
        activa: formData.activa
      };

      await seccionesApi.inscribirParticipante(seccion.id, data);

      dispatch(showNotification({
        message: 'Participante inscrito exitosamente',
        severity: 'success'
      }));

      onSuccess();
      handleClose();
    } catch (error: any) {
      dispatch(showNotification({
        message: error?.response?.data?.error || 'Error al inscribir participante',
        severity: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      personaId: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
      precioEspecial: '',
      observaciones: '',
      activa: true
    });
    setYaInscrito(false);
    onClose();
  };

  const ocupacionPorcentaje = seccion.capacidadMaxima
    ? Math.round((seccion._count.participaciones / seccion.capacidadMaxima) * 100)
    : 0;

  const personaSeleccionada = personas.find(p => p.id === formData.personaId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon />
          <Typography variant="h6">Inscribir Participante</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {seccion.actividad.nombre} - {seccion.nombre}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Alerta de capacidad */}
        {seccion.capacidadMaxima && (
          <Alert
            severity={capacidadLlena ? 'error' : ocupacionPorcentaje >= 90 ? 'warning' : 'info'}
            sx={{ mb: 3 }}
          >
            <AlertTitle>Capacidad de la Sección</AlertTitle>
            {seccion._count.participaciones} / {seccion.capacidadMaxima} participantes ({ocupacionPorcentaje}%)
            {capacidadLlena && ' - Capacidad máxima alcanzada'}
          </Alert>
        )}

        {/* Alerta de ya inscrito */}
        {yaInscrito && (
          <Alert severity="error" sx={{ mb: 3 }} icon={<WarningIcon />}>
            <AlertTitle>Inscripción Duplicada</AlertTitle>
            Esta persona ya está inscrita activamente en esta sección.
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={3}>
          {/* Selector de Persona */}
          <FormControl fullWidth required>
            <InputLabel>Persona</InputLabel>
            <Select
              value={formData.personaId}
              onChange={(e) => handleChange('personaId', e.target.value)}
              label="Persona"
              disabled={loadingPersonas || capacidadLlena}
            >
              {loadingPersonas ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Cargando...
                </MenuItem>
              ) : personas.length === 0 ? (
                <MenuItem disabled>
                  No hay personas disponibles
                </MenuItem>
              ) : (
                personas.map(persona => (
                  <MenuItem key={persona.id} value={persona.id}>
                    <Box display="flex" justifyContent="space-between" width="100%">
                      <Typography>
                        {persona.nombre} {persona.apellido}
                      </Typography>
                      <Chip
                        label={persona.tipo}
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Información de persona seleccionada */}
          {personaSeleccionada && (
            <Box p={2} bgcolor="action.hover" borderRadius={1}>
              <Typography variant="caption" color="text.secondary">
                Persona seleccionada
              </Typography>
              <Typography variant="body1">
                {personaSeleccionada.nombre} {personaSeleccionada.apellido}
              </Typography>
              {personaSeleccionada.email && (
                <Typography variant="body2" color="text.secondary">
                  {personaSeleccionada.email}
                </Typography>
              )}
            </Box>
          )}

          {/* Fechas */}
          <Box display="flex" gap={2}>
            <TextField
              label="Fecha de Inicio"
              type="date"
              value={formData.fechaInicio}
              onChange={(e) => handleChange('fechaInicio', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Fecha de Fin"
              type="date"
              value={formData.fechaFin}
              onChange={(e) => handleChange('fechaFin', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              helperText="Opcional - Dejar vacío si no tiene fecha de fin"
            />
          </Box>

          {/* Precio Especial */}
          <TextField
            label="Precio Especial"
            type="number"
            value={formData.precioEspecial}
            onChange={(e) => handleChange('precioEspecial', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MoneyIcon />
                </InputAdornment>
              ),
            }}
            helperText="Opcional - Dejar vacío para usar el precio estándar de la actividad"
            fullWidth
          />

          {/* Observaciones */}
          <TextField
            label="Observaciones"
            value={formData.observaciones}
            onChange={(e) => handleChange('observaciones', e.target.value)}
            multiline
            rows={3}
            fullWidth
            inputProps={{ maxLength: 500 }}
            helperText={`${formData.observaciones.length}/500 caracteres`}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            loading ||
            !formData.personaId ||
            capacidadLlena ||
            yaInscrito
          }
          startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
        >
          {loading ? 'Inscribiendo...' : 'Inscribir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InscripcionModal;
