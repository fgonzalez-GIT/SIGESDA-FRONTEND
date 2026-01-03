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
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Grid,
} from '@mui/material';
import {
  FamilyRestroom,
  Person,
  Percent,
  ContactPhone,
  Security,
  Save,
  Warning,
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/redux';
import { CrearRelacionRequest, RelacionFamiliar } from '../../store/slices/familiaresSlice';
import type { GeneroPersona } from '../../types/persona.types';

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
  { value: 'esposo', label: 'Esposo', inversa: 'esposo' },
  { value: 'esposa', label: 'Esposa', inversa: 'esposa' },
  { value: 'hermano', label: 'Hermano', inversa: 'hermano' },
  { value: 'hermana', label: 'Hermana', inversa: 'hermana' },
  { value: 'abuelo', label: 'Abuelo', inversa: 'nieto' },
  { value: 'abuela', label: 'Abuela', inversa: 'nieta' },
  { value: 'nieto', label: 'Nieto', inversa: 'abuelo' },
  { value: 'nieta', label: 'Nieta', inversa: 'abuela' },
  { value: 'tio', label: 'Tío', inversa: 'sobrino' },
  { value: 'tia', label: 'Tía', inversa: 'sobrina' },
  { value: 'sobrino', label: 'Sobrino', inversa: 'tio' },
  { value: 'sobrina', label: 'Sobrina', inversa: 'tia' },
  { value: 'primo', label: 'Primo', inversa: 'primo' },
  { value: 'prima', label: 'Prima', inversa: 'prima' },
  { value: 'otro', label: 'Otra relación', inversa: 'otro' },
];

/**
 * Calcula la relación inversa considerando el género del familiar y de la persona principal
 *
 * @param tipoRelacion - Tipo de relación seleccionada (ej: 'padre', 'madre', 'hijo')
 * @param generoFamiliar - Género del familiar (la persona que se está agregando)
 * @param generoPersonaPrincipal - Género de la persona principal (la persona base)
 * @returns El tipo de relación inversa correcta según el género
 *
 * @example
 * calcularRelacionInversa('madre', 'MASCULINO') // => 'hijo' (María es madre de Francisco → Francisco es hijo de María)
 * calcularRelacionInversa('hijo', null, 'FEMENINO') // => 'madre' (Francisco es hijo de María → María es madre de Francisco)
 * calcularRelacionInversa('esposo', 'FEMENINO') // => 'esposa' (Simétricas mantienen género)
 */
const calcularRelacionInversa = (
  tipoRelacion: string,
  generoFamiliar?: GeneroPersona | null,
  generoPersonaPrincipal?: GeneroPersona | null
): RelacionFamiliar['tipoRelacion'] => {
  // Si no hay género, usar lógica por defecto (fallback al mapeo hardcoded)
  if (!generoFamiliar) {
    const tipoInfo = tiposRelacion.find(t => t.value === tipoRelacion);
    return (tipoInfo?.inversa || 'otro') as RelacionFamiliar['tipoRelacion'];
  }

  const esMasculino = generoFamiliar === 'MASCULINO';
  const esFemenino = generoFamiliar === 'FEMENINO';

  // Relaciones asimétricas que dependen del género del familiar
  switch (tipoRelacion) {
    // PADRE/MADRE → HIJO/HIJA (depende del género del familiar)
    case 'padre':
    case 'madre':
      return esMasculino ? 'hijo' : esFemenino ? 'hija' : 'hijo';

    // ABUELO/ABUELA → NIETO/NIETA (depende del género del familiar)
    case 'abuelo':
    case 'abuela':
      return esMasculino ? 'nieto' : esFemenino ? 'nieta' : 'nieto';

    // TÍO/TÍA → SOBRINO/SOBRINA (depende del género del familiar)
    case 'tio':
    case 'tia':
      return esMasculino ? 'sobrino' : esFemenino ? 'sobrina' : 'sobrino';

    // HIJO/HIJA → PADRE/MADRE (depende del género de la PERSONA PRINCIPAL)
    case 'hijo':
    case 'hija':
      // El familiar es hijo/a, entonces la persona principal es padre/madre
      const esMasculinoPersonaPrincipal = generoPersonaPrincipal === 'MASCULINO';
      const esFemeninoPersonaPrincipal = generoPersonaPrincipal === 'FEMENINO';
      return esMasculinoPersonaPrincipal ? 'padre' : esFemeninoPersonaPrincipal ? 'madre' : 'padre';

    // NIETO/NIETA → ABUELO/ABUELA (depende del género de la PERSONA PRINCIPAL)
    case 'nieto':
    case 'nieta':
      // El familiar es nieto/a, entonces la persona principal es abuelo/abuela
      const esMasculinoPrincipal = generoPersonaPrincipal === 'MASCULINO';
      const esFemeninoPrincipal = generoPersonaPrincipal === 'FEMENINO';
      return esMasculinoPrincipal ? 'abuelo' : esFemeninoPrincipal ? 'abuela' : 'abuelo';

    // SOBRINO/SOBRINA → TÍO/TÍA (depende del género de la PERSONA PRINCIPAL)
    case 'sobrino':
    case 'sobrina':
      // El familiar es sobrino/a, entonces la persona principal es tío/tía
      const esMasculinoPpal = generoPersonaPrincipal === 'MASCULINO';
      const esFemeninoPpal = generoPersonaPrincipal === 'FEMENINO';
      return esMasculinoPpal ? 'tio' : esFemeninoPpal ? 'tia' : 'tio';

    // Relaciones simétricas que mantienen el género
    case 'esposo':
      return 'esposo';
    case 'esposa':
      return 'esposa';
    case 'hermano':
      return 'hermano';
    case 'hermana':
      return 'hermana';
    case 'primo':
      return 'primo';
    case 'prima':
      return 'prima';

    // Fallback
    default:
      const tipoInfo = tiposRelacion.find(t => t.value === tipoRelacion);
      return (tipoInfo?.inversa || 'otro') as RelacionFamiliar['tipoRelacion'];
  }
};

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

    if (onSubmit) {
      onSubmit(request);
    } else if (onSuccess) {
      // Fallback: si solo hay onSuccess, llamarlo directamente
      onSuccess();
    }
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

    // Auto-completar relación inversa usando género del familiar y de la persona principal
    if (formData.crearRelacionInversa) {
      const familiarSeleccionado = personas.find(p => p.id === formData.familiarId);
      const personaPrincipal = personas.find(p => p.id === formData.personaId);
      const relacionInversa = calcularRelacionInversa(
        tipoRelacion,
        familiarSeleccionado?.genero,
        personaPrincipal?.genero
      );

      setFormData(prev => ({
        ...prev,
        tipoRelacionInversa: relacionInversa
      }));
    }

    setErrors(prev => ({ ...prev, tipoRelacion: '' }));
  };

  const personasOptions = personas.map(persona => ({
    id: persona.id,
    label: `${persona.nombre} ${persona.apellido} (${persona.tipos?.map(t => t.tipoPersonaCodigo).join(', ') || 'Sin tipo'})`,
    persona
  }));

  // Filtrar familiares (excluir la persona principal)
  const familiaresOptions = personas
    .filter(persona => persona.id !== formData.personaId)
    .map(persona => ({
      id: persona.id,
      label: `${persona.nombre} ${persona.apellido} (${persona.tipos?.map(t => t.tipoPersonaCodigo).join(', ') || 'Sin tipo'})`,
      persona
    }));

  const personaPrincipal = personas.find(p => p.id === formData.personaId);
  const familiarSeleccionado = personas.find(p => p.id === formData.familiarId);

  // Recalcular relación inversa cuando cambia el familiar seleccionado (porque cambia su género)
  useEffect(() => {
    if (formData.tipoRelacion && formData.crearRelacionInversa && formData.familiarId) {
      const relacionInversa = calcularRelacionInversa(
        formData.tipoRelacion,
        familiarSeleccionado?.genero,
        personaPrincipal?.genero
      );
      setFormData(prev => ({
        ...prev,
        tipoRelacionInversa: relacionInversa
      }));
    }
  }, [formData.familiarId]); // Solo depende de familiarId, no de todo formData para evitar loop

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
          <FamilyRestroom color="primary" />
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
                      helperText={errors.personaId || "Persona que tomamos como base para asignarle un familiar"}
                      required
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <Person color="primary" sx={{ mr: 1 }} />,
                      }}
                    />
                  )}
                  disabled={loading || !!personaSeleccionada}
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
                      helperText={errors.familiarId || "Persona que se vincula a Persona Principal con un parentesco"}
                      required
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <FamilyRestroom color="secondary" sx={{ mr: 1 }} />,
                      }}
                    />
                  )}
                  disabled={loading}
                />

                {/* Tipo de Relación */}
                <FormControl fullWidth required error={!!errors.tipoRelacion}>
                  <InputLabel>Tipo de Relación (el género debe coincidir con el Familiar)</InputLabel>
                  <Select
                    value={formData.tipoRelacion}
                    onChange={(e) => handleTipoRelacionChange(e.target.value)}
                    disabled={loading}
                    label="Tipo de Relación (el género debe coincidir con el Familiar)"
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
                  {!errors.tipoRelacion && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 2 }}>
                      Indica el parentesco que el Familiar tiene con la Persona Principal
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
                      label="Crear relación inversa automáticamente (se respetará el género del Familiar)"
                    />
                    {formData.crearRelacionInversa && formData.tipoRelacionInversa && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        Se creará automáticamente la relación inversa (respetando el género del Familiar):
                        <strong> {personaPrincipal?.nombre} es {formData.tipoRelacionInversa} de {familiarSeleccionado?.nombre}</strong>
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
                        {personaPrincipal?.tipos?.map(t => t.tipoPersonaCodigo).join(', ') || 'Sin tipo'}
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
                        {familiarSeleccionado?.tipos?.map(t => t.tipoPersonaCodigo).join(', ') || 'Sin tipo'}
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
                      <strong>Relación inversa:</strong> También se creará automáticamente:{' '}
                      <strong>{personaPrincipal?.nombre} es {formData.tipoRelacionInversa} de {familiarSeleccionado?.nombre}</strong>
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