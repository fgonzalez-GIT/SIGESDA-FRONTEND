import React, { useState, useEffect } from 'react';
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
  FormHelperText,
  Box,
  Typography,
  IconButton,
  Stack,
  Autocomplete,
  Alert,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Close as CloseIcon } from '@mui/icons-material';
import { Actividad } from '../../store/slices/actividadesSlice';

interface ActividadFormData {
  nombre: string;
  descripcion: string;
  tipo: 'CORO' | 'CLASE_CANTO' | 'CLASE_INSTRUMENTO' | 'TALLER' | 'EVENTO' | 'coro' | 'clase' | 'taller' | 'evento' | '';
  categoria: 'infantil' | 'juvenil' | 'adulto' | 'general' | '';
  docenteId: number | null;
  aulaId: number | null;
  diaSemana: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo' | '';
  horaInicio: Date | null;
  horaFin: Date | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  cupoMaximo: string;
  estado: 'activo' | 'inactivo' | 'suspendido' | 'finalizado';
  costo: string;
  observaciones: string;
}

interface ActividadFormErrors {
  nombre?: string;
  tipo?: string;
  categoria?: string;
  diaSemana?: string;
  horaInicio?: string;
  horaFin?: string;
  fechaInicio?: string;
  cupoMaximo?: string;
  costo?: string;
  horario?: string;
}

interface DocenteOption {
  id: number;
  nombre: string;
  apellido: string;
}

interface AulaOption {
  id: number;
  nombre: string;
  capacidad: number;
}

interface ActividadFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Actividad, 'id' | 'cupoActual' | 'fechaCreacion' | 'docenteNombre' | 'aulaNombre'>) => void;
  actividad?: Actividad | null;
  loading?: boolean;
  title?: string;
  docentes?: DocenteOption[];
  aulas?: AulaOption[];
}

const initialFormData: ActividadFormData = {
  nombre: '',
  descripcion: '',
  tipo: '',
  categoria: '',
  docenteId: null,
  aulaId: null,
  diaSemana: '',
  horaInicio: null,
  horaFin: null,
  fechaInicio: null,
  fechaFin: null,
  cupoMaximo: '',
  estado: 'activo',
  costo: '',
  observaciones: '',
};

const diasSemana = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

const tiposActividad = [
  { value: 'CORO', label: 'Coro' },
  { value: 'CLASE_CANTO', label: 'Clase de Canto' },
  { value: 'CLASE_INSTRUMENTO', label: 'Clase de Instrumento' },
  { value: 'TALLER', label: 'Taller' },
  { value: 'EVENTO', label: 'Evento' },
  { value: 'coro', label: 'Coro (legacy)' },
  { value: 'clase', label: 'Clase (legacy)' },
  { value: 'taller', label: 'Taller (legacy)' },
  { value: 'evento', label: 'Evento (legacy)' },
];

const categorias = [
  { value: 'infantil', label: 'Infantil' },
  { value: 'juvenil', label: 'Juvenil' },
  { value: 'adulto', label: 'Adulto' },
  { value: 'general', label: 'General' },
];

export const ActividadForm: React.FC<ActividadFormProps> = ({
  open,
  onClose,
  onSubmit,
  actividad,
  loading = false,
  title,
  docentes = [],
  aulas = [],
}) => {
  const [formData, setFormData] = useState<ActividadFormData>(initialFormData);
  const [errors, setErrors] = useState<ActividadFormErrors>({});

  const isEditing = Boolean(actividad);
  const dialogTitle = title || (isEditing ? 'Editar Actividad' : 'Nueva Actividad');

  useEffect(() => {
    if (actividad) {
      setFormData({
        nombre: actividad.nombre || '',
        descripcion: actividad.descripcion || '',
        tipo: actividad.tipo || '',
        categoria: actividad.categoria || '',
        docenteId: actividad.docenteId || null,
        aulaId: actividad.aulaId || null,
        diaSemana: actividad.diaSemana || '',
        horaInicio: actividad.horaInicio ? new Date(`2000-01-01T${actividad.horaInicio}`) : null,
        horaFin: actividad.horaFin ? new Date(`2000-01-01T${actividad.horaFin}`) : null,
        fechaInicio: actividad.fechaInicio ? new Date(actividad.fechaInicio) : null,
        fechaFin: actividad.fechaFin ? new Date(actividad.fechaFin) : null,
        cupoMaximo: actividad.cupoMaximo?.toString() || '',
        estado: actividad.estado || 'activo',
        costo: actividad.costo?.toString() || '',
        observaciones: actividad.observaciones || '',
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [actividad, open]);

  const handleChange = (field: keyof ActividadFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target ? event.target.value : event;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof ActividadFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ActividadFormErrors = {};

    // Required fields
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'El tipo es requerido';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es requerida';
    }

    if (!formData.diaSemana) {
      newErrors.diaSemana = 'El día de la semana es requerido';
    }

    if (!formData.horaInicio) {
      newErrors.horaInicio = 'La hora de inicio es requerida';
    }

    if (!formData.horaFin) {
      newErrors.horaFin = 'La hora de fin es requerida';
    }

    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    }

    // Validate hours
    if (formData.horaInicio && formData.horaFin) {
      if (formData.horaInicio >= formData.horaFin) {
        newErrors.horario = 'La hora de fin debe ser posterior a la hora de inicio';
      }
    }

    // Validate dates
    if (formData.fechaInicio && formData.fechaFin) {
      if (formData.fechaInicio > formData.fechaFin) {
        newErrors.fechaInicio = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    // Validate numbers
    if (formData.cupoMaximo) {
      const cupo = parseInt(formData.cupoMaximo);
      if (isNaN(cupo) || cupo <= 0) {
        newErrors.cupoMaximo = 'El cupo máximo debe ser un número positivo';
      }
    }

    if (formData.costo) {
      const costo = parseFloat(formData.costo);
      if (isNaN(costo) || costo < 0) {
        newErrors.costo = 'El costo debe ser un número válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatTime = (date: Date | null): string => {
    if (!date) return '';
    return date.toTimeString().slice(0, 5); // HH:mm format
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const submitData: Omit<Actividad, 'id' | 'cupoActual' | 'fechaCreacion' | 'docenteNombre' | 'aulaNombre'> = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || undefined,
      tipo: formData.tipo as 'CORO' | 'CLASE_CANTO' | 'CLASE_INSTRUMENTO' | 'TALLER' | 'EVENTO' | 'coro' | 'clase' | 'taller' | 'evento',
      categoria: formData.categoria as 'infantil' | 'juvenil' | 'adulto' | 'general',
      docenteId: formData.docenteId || undefined,
      aulaId: formData.aulaId || undefined,
      diaSemana: formData.diaSemana as 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo',
      horaInicio: formatTime(formData.horaInicio),
      horaFin: formatTime(formData.horaFin),
      fechaInicio: formData.fechaInicio?.toISOString().split('T')[0] || '',
      fechaFin: formData.fechaFin?.toISOString().split('T')[0] || undefined,
      cupoMaximo: formData.cupoMaximo ? parseInt(formData.cupoMaximo) : undefined,
      estado: formData.estado,
      costo: formData.costo ? parseFloat(formData.costo) : undefined,
      observaciones: formData.observaciones.trim() || undefined,
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { minHeight: '600px' } }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{dialogTitle}</Typography>
            <IconButton
              onClick={handleClose}
              disabled={loading}
              edge="end"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {errors.horario && (
              <Alert severity="error">{errors.horario}</Alert>
            )}

            <Typography variant="subtitle1" color="primary">
              Información General
            </Typography>

            <TextField
              fullWidth
              label="Nombre *"
              value={formData.nombre}
              onChange={handleChange('nombre')}
              error={!!errors.nombre}
              helperText={errors.nombre}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={2}
              value={formData.descripcion}
              onChange={handleChange('descripcion')}
              disabled={loading}
            />

            <Box display="flex" gap={2}>
              <FormControl fullWidth error={!!errors.tipo} disabled={loading}>
                <InputLabel>Tipo *</InputLabel>
                <Select
                  value={formData.tipo}
                  onChange={handleChange('tipo')}
                  label="Tipo *"
                >
                  {tiposActividad.map(tipo => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.tipo && <FormHelperText>{errors.tipo}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth error={!!errors.categoria} disabled={loading}>
                <InputLabel>Categoría *</InputLabel>
                <Select
                  value={formData.categoria}
                  onChange={handleChange('categoria')}
                  label="Categoría *"
                >
                  {categorias.map(categoria => (
                    <MenuItem key={categoria.value} value={categoria.value}>
                      {categoria.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoria && <FormHelperText>{errors.categoria}</FormHelperText>}
              </FormControl>
            </Box>

            <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }}>
              Asignaciones
            </Typography>

            <Box display="flex" gap={2}>
              <Autocomplete
                fullWidth
                options={docentes}
                getOptionLabel={(option) => `${option.nombre} ${option.apellido}`}
                value={docentes.find(d => d.id === formData.docenteId) || null}
                onChange={(_, newValue) => handleChange('docenteId')(newValue?.id || null)}
                disabled={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Docente"
                    placeholder="Seleccionar docente"
                  />
                )}
              />

              <Autocomplete
                fullWidth
                options={aulas}
                getOptionLabel={(option) => `${option.nombre} (Cap: ${option.capacidad})`}
                value={aulas.find(a => a.id === formData.aulaId) || null}
                onChange={(_, newValue) => handleChange('aulaId')(newValue?.id || null)}
                disabled={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Aula"
                    placeholder="Seleccionar aula"
                  />
                )}
              />
            </Box>

            <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }}>
              Horarios y Fechas
            </Typography>

            <FormControl fullWidth error={!!errors.diaSemana} disabled={loading}>
              <InputLabel>Día de la Semana *</InputLabel>
              <Select
                value={formData.diaSemana}
                onChange={handleChange('diaSemana')}
                label="Día de la Semana *"
              >
                {diasSemana.map(dia => (
                  <MenuItem key={dia.value} value={dia.value}>
                    {dia.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.diaSemana && <FormHelperText>{errors.diaSemana}</FormHelperText>}
            </FormControl>

            <Box display="flex" gap={2}>
              <TimePicker
                label="Hora Inicio *"
                value={formData.horaInicio}
                onChange={handleChange('horaInicio')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.horaInicio,
                    helperText: errors.horaInicio,
                    disabled: loading,
                  },
                }}
              />

              <TimePicker
                label="Hora Fin *"
                value={formData.horaFin}
                onChange={handleChange('horaFin')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.horaFin,
                    helperText: errors.horaFin,
                    disabled: loading,
                  },
                }}
              />
            </Box>

            <Box display="flex" gap={2}>
              <DatePicker
                label="Fecha Inicio *"
                value={formData.fechaInicio}
                onChange={handleChange('fechaInicio')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.fechaInicio,
                    helperText: errors.fechaInicio,
                    disabled: loading,
                  },
                }}
              />

              <DatePicker
                label="Fecha Fin"
                value={formData.fechaFin}
                onChange={handleChange('fechaFin')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    disabled: loading,
                  },
                }}
              />
            </Box>

            <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }}>
              Configuración Adicional
            </Typography>

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Cupo Máximo"
                type="number"
                value={formData.cupoMaximo}
                onChange={handleChange('cupoMaximo')}
                error={!!errors.cupoMaximo}
                helperText={errors.cupoMaximo}
                disabled={loading}
                inputProps={{ min: 1 }}
              />

              <TextField
                fullWidth
                label="Costo"
                type="number"
                value={formData.costo}
                onChange={handleChange('costo')}
                error={!!errors.costo}
                helperText={errors.costo}
                disabled={loading}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: '$',
                }}
              />

              <FormControl fullWidth disabled={loading}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado}
                  onChange={handleChange('estado')}
                  label="Estado"
                >
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="inactivo">Inactivo</MenuItem>
                  <MenuItem value="suspendido">Suspendido</MenuItem>
                  <MenuItem value="finalizado">Finalizado</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label="Observaciones"
              multiline
              rows={3}
              value={formData.observaciones}
              onChange={handleChange('observaciones')}
              disabled={loading}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ActividadForm;