/**
 * Página de Formulario de Actividad V2
 * Permite crear y editar actividades con validación completa
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

import { useActividad, useActividadMutations } from '../../hooks/useActividades';
import { useCatalogosContext } from '../../providers/CatalogosProvider';
import { HorarioSelector } from '../../components/actividades/HorarioSelector';
import type { CreateActividadDTO, CreateHorarioDTO } from '../../types/actividad.types';

interface FormErrors {
  nombre?: string;
  tipoActividadId?: string;
  categoriaId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  cupoMaximo?: string;
  costo?: string;
  horarios?: string;
  general?: string;
}

export const ActividadFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Hooks
  const { catalogos, loading: catalogosLoading } = useCatalogosContext();
  const { actividad, loading: actividadLoading } = useActividad(isEditing ? Number(id) : null);
  const { crear, actualizar, loading: mutationLoading, error: mutationError } = useActividadMutations();

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    tipoActividadId: 0,
    categoriaId: 0,
    estadoId: 1,
    descripcion: '',
    fechaDesde: null as Date | null,
    fechaHasta: null as Date | null,
    cupoMaximo: '',
    costo: '',
    observaciones: '',
  });

  const [horarios, setHorarios] = useState<CreateHorarioDTO[]>([]);
  const [nuevoHorario, setNuevoHorario] = useState<Partial<CreateHorarioDTO>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Información Básica', 'Detalles', 'Horarios'];

  // Cargar datos en modo edición
  useEffect(() => {
    if (isEditing && actividad) {
      setFormData({
        nombre: actividad.nombre,
        tipoActividadId: actividad.tipoActividadId,
        categoriaId: actividad.categoriaId,
        estadoId: actividad.estadoId,
        descripcion: actividad.descripcion || '',
        fechaDesde: actividad.fechaDesde ? new Date(actividad.fechaDesde) : null,
        fechaHasta: actividad.fechaHasta ? new Date(actividad.fechaHasta) : null,
        cupoMaximo: actividad.capacidadMaxima?.toString() || '',
        costo: actividad.costo.toString(),
        observaciones: actividad.observaciones || '',
      });

      if (actividad.horarios_actividades) {
        setHorarios(
          actividad.horarios_actividades.map((h) => ({
            diaSemanaId: h.diaSemanaId,
            horaInicio: h.horaInicio.slice(0, 5),
            horaFin: h.horaFin.slice(0, 5),
            activo: h.activo,
          }))
        );
      }
    }
  }, [isEditing, actividad]);

  // Handlers
  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value = (event.target as HTMLInputElement).value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDateChange = (field: 'fechaDesde' | 'fechaHasta') => (date: Date | null) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAgregarHorario = () => {
    // Validar horario
    if (!nuevoHorario.diaSemanaId) {
      setErrors((prev) => ({ ...prev, horarios: 'Seleccione un día' }));
      return;
    }

    // Validar que el día exista en el catálogo y tenga orden válido (1-7)
    const diaSeleccionado = catalogos?.diasSemana?.find(d => d.id === nuevoHorario.diaSemanaId);
    if (!diaSeleccionado || diaSeleccionado.orden < 1 || diaSeleccionado.orden > 7) {
      setErrors((prev) => ({ ...prev, horarios: 'El día seleccionado no es válido' }));
      return;
    }

    if (!nuevoHorario.horaInicio || !nuevoHorario.horaFin) {
      setErrors((prev) => ({ ...prev, horarios: 'Complete las horas' }));
      return;
    }

    // Validar que hora fin sea mayor que hora inicio
    if (nuevoHorario.horaInicio >= nuevoHorario.horaFin) {
      setErrors((prev) => ({ ...prev, horarios: 'La hora de fin debe ser posterior a la hora de inicio' }));
      return;
    }

    setHorarios([...horarios, nuevoHorario as CreateHorarioDTO]);
    setNuevoHorario({});
    setErrors((prev) => ({ ...prev, horarios: undefined }));
  };

  const handleEliminarHorario = (index: number) => {
    setHorarios(horarios.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 0) {
      // Paso 1: Información Básica
      if (!formData.nombre.trim()) {
        newErrors.nombre = 'El nombre es requerido';
      }

      if (!formData.tipoActividadId || formData.tipoActividadId === 0) {
        newErrors.tipoActividadId = 'Seleccione un tipo';
      }

      if (!formData.categoriaId || formData.categoriaId === 0) {
        newErrors.categoriaId = 'Seleccione una categoría';
      }
    }

    if (step === 1) {
      // Paso 2: Detalles
      if (!formData.fechaDesde) {
        newErrors.fechaDesde = 'La fecha de inicio es requerida';
      }

      if (formData.fechaDesde && formData.fechaHasta && formData.fechaDesde > formData.fechaHasta) {
        newErrors.fechaHasta = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }

      if (formData.cupoMaximo && (isNaN(Number(formData.cupoMaximo)) || Number(formData.cupoMaximo) <= 0)) {
        newErrors.cupoMaximo = 'El cupo debe ser un número positivo';
      }

      if (formData.costo && (isNaN(Number(formData.costo)) || Number(formData.costo) < 0)) {
        newErrors.costo = 'El costo debe ser un número válido';
      }
    }

    if (step === 2) {
      // Paso 3: Horarios
      if (horarios.length === 0) {
        newErrors.horarios = 'Debe agregar al menos un horario';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    // Validar todos los pasos
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      setErrors((prev) => ({ ...prev, general: 'Por favor corrija los errores en el formulario' }));
      return;
    }

    // Validar que todos los días de semana existan en el catálogo y tengan orden válido (1-7)
    const horariosInvalidos = horarios.filter(h => {
      const dia = catalogos?.diasSemana?.find(d => d.id === h.diaSemanaId);
      return !dia || dia.orden < 1 || dia.orden > 7;
    });
    if (horariosInvalidos.length > 0) {
      setErrors((prev) => ({
        ...prev,
        general: 'Algunos horarios tienen días de semana inválidos. Por favor elimínelos y agréguelos nuevamente.'
      }));
      return;
    }

    try {
      const data: CreateActividadDTO = {
        nombre: formData.nombre.trim(),
        tipoActividadId: formData.tipoActividadId,
        categoriaId: formData.categoriaId,
        estadoId: formData.estadoId,
        descripcion: formData.descripcion.trim() || null,
        fechaDesde: formData.fechaDesde!.toISOString(),
        fechaHasta: formData.fechaHasta?.toISOString() || null,
        cupoMaximo: formData.cupoMaximo ? parseInt(formData.cupoMaximo) : null,
        costo: formData.costo ? parseFloat(formData.costo) : 0,
        observaciones: formData.observaciones.trim() || null,
        horarios: horarios.map(h => ({
          diaSemanaId: h.diaSemanaId,
          horaInicio: h.horaInicio,
          horaFin: h.horaFin,
          activo: h.activo !== undefined ? h.activo : true
        })),
      };

      // Log para debugging (remover en producción)
      console.log('📤 Enviando datos a la API:', JSON.stringify(data, null, 2));

      if (isEditing) {
        await actualizar(Number(id), data);
        alert('Actividad actualizada exitosamente');
      } else {
        const nueva = await crear(data);
        alert('Actividad creada exitosamente');
        navigate(`/actividades/${nueva.id}`);
        return;
      }

      navigate('/actividades');
    } catch (err: any) {
      console.error('Error al guardar:', err);

      // Extraer mensaje de error del backend
      let errorMessage = 'Error al guardar la actividad';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
    }
  };

  const handleCancel = () => {
    navigate('/actividades');
  };

  // Loading states
  if (catalogosLoading || (isEditing && actividadLoading)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <Button startIcon={<BackIcon />} onClick={handleCancel} sx={{ mr: 2 }}>
            Cancelar
          </Button>
          <Typography variant="h4" component="h1">
            {isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Error general */}
        {(errors.general || mutationError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general || mutationError}
          </Alert>
        )}

        {/* Formulario */}
        <Paper sx={{ p: 3 }}>
          {/* Paso 1: Información Básica */}
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  Información Básica
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Nombre de la Actividad *"
                  value={formData.nombre}
                  onChange={handleChange('nombre')}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!errors.tipoActividadId}>
                  <InputLabel>Tipo de Actividad *</InputLabel>
                  <Select
                    value={formData.tipoActividadId}
                    onChange={(e) => setFormData({ ...formData, tipoActividadId: Number(e.target.value) })}
                    label="Tipo de Actividad *"
                  >
                    <MenuItem value={0}>Seleccione un tipo...</MenuItem>
                    {catalogos?.tiposActividades?.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.tipoActividadId && <FormHelperText>{errors.tipoActividadId}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!errors.categoriaId}>
                  <InputLabel>Categoría *</InputLabel>
                  <Select
                    value={formData.categoriaId}
                    onChange={(e) => setFormData({ ...formData, categoriaId: Number(e.target.value) })}
                    label="Categoría *"
                  >
                    <MenuItem value={0}>Seleccione una categoría...</MenuItem>
                    {catalogos?.categoriasActividades?.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.categoriaId && <FormHelperText>{errors.categoriaId}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Descripción"
                  multiline
                  rows={3}
                  value={formData.descripcion}
                  onChange={handleChange('descripcion')}
                  helperText="Descripción breve de la actividad"
                />
              </Grid>
            </Grid>
          )}

          {/* Paso 2: Detalles */}
          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  Detalles de la Actividad
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Fecha de Inicio *"
                  value={formData.fechaDesde}
                  onChange={handleDateChange('fechaDesde')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.fechaDesde,
                      helperText: errors.fechaDesde,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Fecha de Fin (Opcional)"
                  value={formData.fechaHasta}
                  onChange={handleDateChange('fechaHasta')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.fechaHasta,
                      helperText: errors.fechaHasta,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Cupo Máximo (Opcional)"
                  type="number"
                  value={formData.cupoMaximo}
                  onChange={handleChange('cupoMaximo')}
                  error={!!errors.cupoMaximo}
                  helperText={errors.cupoMaximo || 'Dejar vacío para sin límite'}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Costo"
                  type="number"
                  value={formData.costo}
                  onChange={handleChange('costo')}
                  error={!!errors.costo}
                  helperText={errors.costo || '0 para actividad gratuita'}
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={formData.estadoId}
                    onChange={(e) => setFormData({ ...formData, estadoId: Number(e.target.value) })}
                    label="Estado"
                  >
                    {catalogos?.estadosActividades?.map((estado) => (
                      <MenuItem key={estado.id} value={estado.id}>
                        {estado.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Observaciones"
                  multiline
                  rows={3}
                  value={formData.observaciones}
                  onChange={handleChange('observaciones')}
                />
              </Grid>
            </Grid>
          )}

          {/* Paso 3: Horarios */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Horarios de la Actividad
              </Typography>

              {/* Horarios agregados */}
              {horarios.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Horarios configurados ({horarios.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {horarios.map((horario, index) => {
                      const dia = catalogos?.diasSemana.find((d) => d.id === horario.diaSemanaId);
                      return (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                  <Chip label={dia?.nombre} size="small" color="primary" sx={{ mb: 1 }} />
                                  <Typography variant="body1">
                                    {horario.horaInicio} - {horario.horaFin}
                                  </Typography>
                                </Box>
                                <IconButton size="small" color="error" onClick={() => handleEliminarHorario(index)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Agregar nuevo horario */}
              <Card variant="outlined">
                <CardHeader title="Agregar Horario" />
                <CardContent>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid size={{ xs: 12 }}>
                      <HorarioSelector
                        value={nuevoHorario}
                        onChange={setNuevoHorario}
                        diasSemana={catalogos?.diasSemana || []}
                        error={errors.horarios ? { diaSemanaId: errors.horarios } : undefined}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Button
                        startIcon={<AddIcon />}
                        variant="outlined"
                        onClick={handleAgregarHorario}
                        fullWidth
                      >
                        Agregar Horario
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {errors.horarios && horarios.length === 0 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.horarios}
                </Alert>
              )}
            </Box>
          )}

          {/* Botones de navegación */}
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Atrás
            </Button>
            <Box display="flex" gap={2}>
              <Button variant="outlined" onClick={handleCancel}>
                Cancelar
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>
                  Siguiente
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={mutationLoading}
                >
                  {mutationLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Actividad'}
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default ActividadFormPage;
