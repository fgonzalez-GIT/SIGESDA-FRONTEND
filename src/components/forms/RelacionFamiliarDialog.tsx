import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Autocomplete,
  Chip,
  Grid,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Family,
  Person,
  Percent,
  ContactPhone,
  Security,
  Save,
  Warning,
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/redux';
import { CrearRelacionRequest, RelacionFamiliar } from '../../store/slices/familiaresSlice';

interface RelacionFamiliarDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (request: CrearRelacionRequest) => void;
  onSuccess?: () => void;
  relacion?: RelacionFamiliar | null;
  personaSeleccionada?: number;
  loading?: boolean;
}

interface FormData {
  personaId: number | null;
  familiarId: number | null;
  tipoRelacion: RelacionFamiliar['tipoRelacion'] | '';
  descripcion: string;
  responsableFinanciero: boolean;
  autorizadoRetiro: boolean;
  contactoEmergencia: boolean;
  porcentajeDescuento: number;
  crearRelacionInversa: boolean;
  tipoRelacionInversa: RelacionFamiliar['tipoRelacion'] | '';
}

const tiposRelacion = [
  { value: 'padre', label: 'Padre', inversa: 'hijo' },
  { value: 'madre', label: 'Madre', inversa: 'hija' },
  { value: 'hijo', label: 'Hijo', inversa: 'padre' },
  { value: 'hija', label: 'Hija', inversa: 'madre' },
  { value: 'esposo', label: 'Esposo', inversa: 'esposa' },
  { value: 'esposa', label: 'Esposa', inversa: 'esposo' },
  { value: 'hermano', label: 'Hermano', inversa: 'hermana' },
  { value: 'hermana', label: 'Hermana', inversa: 'hermano' },
  { value: 'abuelo', label: 'Abuelo', inversa: 'nieto' },
  { value: 'abuela', label: 'Abuela', inversa: 'nieta' },
  { value: 'nieto', label: 'Nieto', inversa: 'abuelo' },
  { value: 'nieta', label: 'Nieta', inversa: 'abuela' },
  { value: 'tio', label: 'Tío', inversa: 'primo' },
  { value: 'tia', label: 'Tía', inversa: 'prima' },
  { value: 'primo', label: 'Primo', inversa: 'primo' },
  { value: 'prima', label: 'Prima', inversa: 'prima' },
  { value: 'otro', label: 'Otra relación', inversa: 'otro' },
];

export const RelacionFamiliarDialog: React.FC<RelacionFamiliarDialogProps> = ({
  open,
  onClose,
  onSubmit,
  onSuccess,
  relacion,
  personaSeleccionada,
  loading = false,
}) => {
  const { personas } = useAppSelector((state) => state.personas);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    personaId: null,
    familiarId: null,
    tipoRelacion: '',
    descripcion: '',
    responsableFinanciero: false,
    autorizadoRetiro: false,
    contactoEmergencia: false,
    porcentajeDescuento: 0,
    crearRelacionInversa: true,
    tipoRelacionInversa: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (relacion) {
        setFormData({
          personaId: relacion.personaId,
          familiarId: relacion.familiarId,
          tipoRelacion: relacion.tipoRelacion,
          descripcion: relacion.descripcion || '',
          responsableFinanciero: relacion.responsableFinanciero,
          autorizadoRetiro: relacion.autorizadoRetiro,
          contactoEmergencia: relacion.contactoEmergencia,
          porcentajeDescuento: relacion.porcentajeDescuento || 0,
          crearRelacionInversa: false,
          tipoRelacionInversa: '',
        });
      } else {
        setFormData({
          personaId: personaSeleccionada || null,
          familiarId: null,
          tipoRelacion: '',
          descripcion: '',
          responsableFinanciero: false,
          autorizadoRetiro: false,
          contactoEmergencia: false,
          porcentajeDescuento: 0,
          crearRelacionInversa: true,
          tipoRelacionInversa: '',
        });
      }
      setActiveStep(0);
      setErrors({});
    }
  }, [open, relacion, personaSeleccionada]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.personaId) {
        newErrors.personaId = 'Debe seleccionar la persona principal';
      }
      if (!formData.familiarId) {
        newErrors.familiarId = 'Debe seleccionar el familiar';
      }
      if (formData.personaId === formData.familiarId) {
        newErrors.familiarId = 'Una persona no puede ser familiar de sí misma';
      }
      if (!formData.tipoRelacion) {
        newErrors.tipoRelacion = 'Debe seleccionar el tipo de relación';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    if (!validateStep(0)) return;

    const request: CrearRelacionRequest = {
      personaId: formData.personaId!,
      familiarId: formData.familiarId!,
      tipoRelacion: formData.tipoRelacion as RelacionFamiliar['tipoRelacion'],
      descripcion: formData.descripcion || undefined,
      responsableFinanciero: formData.responsableFinanciero,
      autorizadoRetiro: formData.autorizadoRetiro,
      contactoEmergencia: formData.contactoEmergencia,
      porcentajeDescuento: formData.porcentajeDescuento > 0 ? formData.porcentajeDescuento : undefined,
    };

    onSubmit(request);
  };

  const handleClose = () => {
    setFormData({
      personaId: null,
      familiarId: null,
      tipoRelacion: '',
      descripcion: '',
      responsableFinanciero: false,
      autorizadoRetiro: false,
      contactoEmergencia: false,
      porcentajeDescuento: 0,
      crearRelacionInversa: true,
      tipoRelacionInversa: '',
    });
    setActiveStep(0);
    setErrors({});
    onClose();
  };

  const handleTipoRelacionChange = (tipoRelacion: string) => {
    setFormData(prev => ({ ...prev, tipoRelacion: tipoRelacion as RelacionFamiliar['tipoRelacion'] }));

    // Auto-completar relación inversa
    const tipoInfo = tiposRelacion.find(t => t.value === tipoRelacion);
    if (tipoInfo && formData.crearRelacionInversa) {
      setFormData(prev => ({
        ...prev,
        tipoRelacionInversa: tipoInfo.inversa as RelacionFamiliar['tipoRelacion']
      }));
    }

    setErrors(prev => ({ ...prev, tipoRelacion: '' }));
  };

  const personasOptions = personas.map(persona => ({
    id: persona.id,
    label: `${persona.nombre} ${persona.apellido} (${persona.tipo})`,
    persona
  }));

  // Filtrar familiares (excluir la persona principal)
  const familiaresOptions = personas
    .filter(persona => persona.id !== formData.personaId)
    .map(persona => ({
      id: persona.id,
      label: `${persona.nombre} ${persona.apellido} (${persona.tipo})`,
      persona
    }));

  const personaPrincipal = personas.find(p => p.id === formData.personaId);
  const familiarSeleccionado = personas.find(p => p.id === formData.familiarId);

  const steps = [
    'Seleccionar Personas',
    'Configurar Permisos',
    'Revisar y Confirmar'
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { height: '80vh' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Family color="primary" />
          <Typography variant="h6">
            {relacion ? 'Editar Relación Familiar' : 'Nueva Relación Familiar'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Paso 1: Seleccionar Personas */}
          <Step>
            <StepLabel>Seleccionar Personas y Relación</StepLabel>
            <StepContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                {/* Persona Principal */}
                <Autocomplete
                  options={personasOptions}
                  value={personasOptions.find(p => p.id === formData.personaId) || null}
                  onChange={(_, newValue) => {
                    setFormData(prev => ({ ...prev, personaId: newValue?.id || null }));
                    setErrors(prev => ({ ...prev, personaId: '' }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Persona Principal"
                      error={!!errors.personaId}
                      helperText={errors.personaId}
                      required
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <Person color="primary" sx={{ mr: 1 }} />,
                      }}
                    />
                  )}
                  disabled={loading || !!personaPreseleccionada}
                />

                {/* Familiar */}
                <Autocomplete
                  options={familiaresOptions}
                  value={familiaresOptions.find(p => p.id === formData.familiarId) || null}
                  onChange={(_, newValue) => {
                    setFormData(prev => ({ ...prev, familiarId: newValue?.id || null }));
                    setErrors(prev => ({ ...prev, familiarId: '' }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Familiar"
                      error={!!errors.familiarId}
                      helperText={errors.familiarId}
                      required
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <Family color="secondary" sx={{ mr: 1 }} />,
                      }}
                    />
                  )}
                  disabled={loading}
                />

                {/* Tipo de Relación */}
                <FormControl fullWidth required error={!!errors.tipoRelacion}>
                  <InputLabel>Tipo de Relación</InputLabel>
                  <Select
                    value={formData.tipoRelacion}
                    onChange={(e) => handleTipoRelacionChange(e.target.value)}
                    disabled={loading}
                  >
                    {tiposRelacion.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.tipoRelacion && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {errors.tipoRelacion}
                    </Typography>
                  )}
                </FormControl>

                {/* Descripción */}
                <TextField
                  label="Descripción (opcional)"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  disabled={loading}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Descripción adicional de la relación..."
                />

                {/* Relación Inversa */}
                {!relacion && (
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.crearRelacionInversa}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            crearRelacionInversa: e.target.checked
                          }))}
                          disabled={loading}
                        />
                      }
                      label="Crear relación inversa automáticamente"
                    />
                    {formData.crearRelacionInversa && formData.tipoRelacionInversa && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        Se creará automáticamente la relación inversa:
                        <strong> {familiarSeleccionado?.nombre} es {formData.tipoRelacionInversa} de {personaPrincipal?.nombre}</strong>
                      </Alert>
                    )}
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!formData.personaId || !formData.familiarId || !formData.tipoRelacion}
                >
                  Siguiente
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Paso 2: Configurar Permisos */}
          <Step>
            <StepLabel>Configurar Permisos y Descuentos</StepLabel>
            <StepContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                <Typography variant="h6" color="primary">
                  Permisos y Responsabilidades
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.responsableFinanciero}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            responsableFinanciero: e.target.checked
                          }))}
                          disabled={loading}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            Responsable Financiero
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Puede pagar cuotas del familiar
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.autorizadoRetiro}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            autorizadoRetiro: e.target.checked
                          }))}
                          disabled={loading}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            Autorizado para Retiro
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Puede retirar al familiar de actividades
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.contactoEmergencia}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            contactoEmergencia: e.target.checked
                          }))}
                          disabled={loading}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            Contacto de Emergencia
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Contactar en caso de emergencia
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" color="primary">
                  Descuentos Familiares
                </Typography>

                <TextField
                  label="Porcentaje de Descuento"
                  type="number"
                  value={formData.porcentajeDescuento}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    porcentajeDescuento: Math.max(0, Math.min(100, Number(e.target.value)))
                  }))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    startAdornment: <Percent color="success" sx={{ mr: 1 }} />,
                  }}
                  disabled={loading}
                  fullWidth
                  helperText="Porcentaje de descuento aplicable a las cuotas del familiar (0-100%)"
                />

                {formData.porcentajeDescuento > 0 && (
                  <Alert severity="success">
                    Se aplicará un <strong>{formData.porcentajeDescuento}%</strong> de descuento
                    a las cuotas cuando ambas personas tengan cuotas pendientes.
                  </Alert>
                )}
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handleBack}>
                  Anterior
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Siguiente
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Paso 3: Revisar y Confirmar */}
          <Step>
            <StepLabel>Revisar y Confirmar</StepLabel>
            <StepContent>
              <Box sx={{ pt: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Resumen de la Relación Familiar
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'primary.main', borderRadius: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary">
                        Persona Principal
                      </Typography>
                      <Typography variant="body1">
                        {personaPrincipal?.nombre} {personaPrincipal?.apellido}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {personaPrincipal?.tipo}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'secondary.main', borderRadius: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="secondary">
                        Familiar
                      </Typography>
                      <Typography variant="body1">
                        {familiarSeleccionado?.nombre} {familiarSeleccionado?.apellido}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {familiarSeleccionado?.tipo}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Detalles de la Relación
                  </Typography>
                  <Typography variant="body1">
                    <strong>Tipo de relación:</strong> {tiposRelacion.find(t => t.value === formData.tipoRelacion)?.label}
                  </Typography>
                  {formData.descripcion && (
                    <Typography variant="body1">
                      <strong>Descripción:</strong> {formData.descripcion}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Permisos Configurados
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {formData.responsableFinanciero && (
                      <Chip label="Responsable Financiero" color="primary" size="small" />
                    )}
                    {formData.autorizadoRetiro && (
                      <Chip label="Autorizado Retiro" color="secondary" size="small" />
                    )}
                    {formData.contactoEmergencia && (
                      <Chip label="Contacto Emergencia" color="error" size="small" />
                    )}
                    {formData.porcentajeDescuento > 0 && (
                      <Chip
                        label={`Descuento ${formData.porcentajeDescuento}%`}
                        color="success"
                        size="small"
                      />
                    )}
                  </Box>
                  {!formData.responsableFinanciero && !formData.autorizadoRetiro &&
                   !formData.contactoEmergencia && formData.porcentajeDescuento === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      No se han configurado permisos especiales
                    </Typography>
                  )}
                </Box>

                {formData.crearRelacionInversa && !relacion && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Relación inversa:</strong> También se creará automáticamente la relación
                      "{formData.tipoRelacionInversa}" desde {familiarSeleccionado?.nombre} hacia {personaPrincipal?.nombre}.
                    </Typography>
                  </Alert>
                )}
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handleBack}>
                  Anterior
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={<Save />}
                >
                  {loading ? 'Guardando...' : (relacion ? 'Actualizar Relación' : 'Crear Relación')}
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RelacionFamiliarDialog;