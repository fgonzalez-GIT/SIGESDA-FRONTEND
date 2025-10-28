import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  Divider,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type {
  CreatePersonaV2DTO,
  PersonaV2,
  CatalogosPersonas,
  CreatePersonaTipoDTO,
} from '../../../types/personaV2.types';
import {
  createPersonaV2Schema,
  type CreatePersonaV2FormData,
} from '../../../schemas/personaV2.schema';

interface PersonaFormV2Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePersonaV2DTO) => Promise<void>;
  persona?: PersonaV2 | null;
  catalogos: CatalogosPersonas | null;
  loading?: boolean;
}

/**
 * Formulario para crear/editar personas con React Hook Form + Zod
 * Soporta múltiples tipos y validaciones dinámicas
 *
 * @example
 * ```tsx
 * <PersonaFormV2
 *   open={formOpen}
 *   onClose={handleClose}
 *   onSubmit={handleSubmit}
 *   catalogos={catalogos}
 *   persona={selectedPersona}
 * />
 * ```
 */
export const PersonaFormV2: React.FC<PersonaFormV2Props> = ({
  open,
  onClose,
  onSubmit,
  persona,
  catalogos,
  loading = false,
}) => {
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!persona;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePersonaV2FormData>({
    resolver: zodResolver(createPersonaV2Schema),
    defaultValues: {
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      observaciones: '',
      tipos: [],
      contactos: [],
    },
  });

  // Observar cambios en tipos para mostrar campos dinámicos
  const tiposWatch = watch('tipos');

  useEffect(() => {
    if (persona) {
      // Modo edición: cargar datos de la persona
      reset({
        nombre: persona.nombre,
        apellido: persona.apellido,
        dni: persona.dni,
        email: persona.email || '',
        telefono: persona.telefono || '',
        direccion: persona.direccion || '',
        fechaNacimiento: persona.fechaNacimiento || '',
        observaciones: persona.observaciones || '',
        tipos: persona.tipos?.map((t) => ({
          tipoPersonaCodigo: t.tipoPersonaCodigo,
          categoriaId: t.categoriaId,
          especialidadId: t.especialidadId,
          honorariosPorHora: t.honorariosPorHora,
          cuit: t.cuit,
          razonSocial: t.razonSocial,
          observaciones: t.observaciones,
        })) as any || [],
        contactos: [],
      });

      // Establecer tipos seleccionados
      const tiposCodigos = persona.tipos?.map((t) => t.tipoPersonaCodigo) || [];
      setSelectedTipos(tiposCodigos);
    } else {
      // Modo creación: resetear formulario
      reset({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        direccion: '',
        fechaNacimiento: '',
        observaciones: '',
        tipos: [],
        contactos: [],
      });
      setSelectedTipos([]);
    }
  }, [persona, reset]);

  const handleTipoToggle = (codigoTipo: string) => {
    const currentTipos = tiposWatch || [];
    const isSelected = selectedTipos.includes(codigoTipo);

    if (isSelected) {
      // Desmarcar: eliminar tipo
      const newTipos = currentTipos.filter((t: any) => t.tipoPersonaCodigo !== codigoTipo);
      setValue('tipos', newTipos);
      setSelectedTipos(selectedTipos.filter((t) => t !== codigoTipo));
    } else {
      // Marcar: agregar tipo con campos por defecto
      const newTipo: any = {
        tipoPersonaCodigo: codigoTipo,
      };

      // Inicializar campos específicos según el tipo
      if (codigoTipo === 'SOCIO') {
        newTipo.categoriaId = '';
      } else if (codigoTipo === 'DOCENTE') {
        newTipo.especialidadId = undefined;
        newTipo.honorariosPorHora = 0;
      } else if (codigoTipo === 'PROVEEDOR') {
        newTipo.cuit = '';
        newTipo.razonSocial = '';
      }

      setValue('tipos', [...currentTipos, newTipo]);
      setSelectedTipos([...selectedTipos, codigoTipo]);
    }
  };

  const handleFormSubmit = async (data: CreatePersonaV2FormData) => {
    try {
      setSubmitting(true);
      await onSubmit(data as CreatePersonaV2DTO);
      reset();
      setSelectedTipos([]);
      onClose();
    } catch (error) {
      console.error('Error en formulario:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderCamposTipo = (codigoTipo: string, index: number) => {
    const tipoUpper = codigoTipo.toUpperCase();

    switch (tipoUpper) {
      case 'SOCIO':
        return (
          <Box key={`tipo-${codigoTipo}-${index}`} sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom color="primary">
              Campos de Socio
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name={`tipos.${index}.categoriaId` as any}
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.tipos?.[index]?.categoriaId}>
                      <InputLabel>Categoría *</InputLabel>
                      <Select {...field} label="Categoría *">
                        <MenuItem value="">Seleccionar categoría</MenuItem>
                        {catalogos?.categoriasSocio
                          .filter((c) => c.activa)
                          .map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                              {cat.nombre} - ${cat.montoCuota}
                            </MenuItem>
                          ))}
                      </Select>
                      {errors.tipos?.[index]?.categoriaId && (
                        <FormHelperText>{errors.tipos[index]?.categoriaId?.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 'DOCENTE':
        return (
          <Box key={`tipo-${codigoTipo}-${index}`} sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom color="success.main">
              Campos de Docente
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`tipos.${index}.especialidadId` as any}
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.tipos?.[index]?.especialidadId}>
                      <InputLabel>Especialidad *</InputLabel>
                      <Select
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        label="Especialidad *"
                      >
                        <MenuItem value="">Seleccionar especialidad</MenuItem>
                        {catalogos?.especialidadesDocentes
                          .filter((e) => e.activo)
                          .map((esp) => (
                            <MenuItem key={esp.id} value={esp.id}>
                              {esp.nombre}
                            </MenuItem>
                          ))}
                      </Select>
                      {errors.tipos?.[index]?.especialidadId && (
                        <FormHelperText>{errors.tipos[index]?.especialidadId?.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`tipos.${index}.honorariosPorHora` as any}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Honorarios por hora *"
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      error={!!errors.tipos?.[index]?.honorariosPorHora}
                      helperText={errors.tipos?.[index]?.honorariosPorHora?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 'PROVEEDOR':
        return (
          <Box key={`tipo-${codigoTipo}-${index}`} sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom color="warning.main">
              Campos de Proveedor
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`tipos.${index}.cuit` as any}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="CUIT *"
                      placeholder="11 dígitos"
                      inputProps={{ maxLength: 11 }}
                      error={!!errors.tipos?.[index]?.cuit}
                      helperText={errors.tipos?.[index]?.cuit?.message || '11 dígitos sin guiones'}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`tipos.${index}.razonSocial` as any}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Razón Social *"
                      error={!!errors.tipos?.[index]?.razonSocial}
                      helperText={errors.tipos?.[index]?.razonSocial?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!catalogos) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon />
          {isEditing ? 'Editar Persona' : 'Nueva Persona'}
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Datos personales */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Datos Personales
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="nombre"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Nombre *"
                        size="small"
                        error={!!errors.nombre}
                        helperText={errors.nombre?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="apellido"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Apellido *"
                        size="small"
                        error={!!errors.apellido}
                        helperText={errors.apellido?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="dni"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="DNI *"
                        size="small"
                        inputProps={{ maxLength: 8 }}
                        error={!!errors.dni}
                        helperText={errors.dni?.message || '7 u 8 dígitos'}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="fechaNacimiento"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Fecha de Nacimiento"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.fechaNacimiento}
                        helperText={errors.fechaNacimiento?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Datos de contacto */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Contacto
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email"
                        type="email"
                        size="small"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="telefono"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Teléfono"
                        size="small"
                        error={!!errors.telefono}
                        helperText={errors.telefono?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="direccion"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Dirección"
                        size="small"
                        error={!!errors.direccion}
                        helperText={errors.direccion?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Tipos de persona */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Tipos de Persona *
              </Typography>
              {errors.tipos && typeof errors.tipos.message === 'string' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.tipos.message}
                </Alert>
              )}
              <FormGroup>
                {catalogos.tiposPersona
                  .filter((t) => t.activo)
                  .map((tipo) => (
                    <FormControlLabel
                      key={tipo.id}
                      control={
                        <Checkbox
                          checked={selectedTipos.includes(tipo.codigo)}
                          onChange={() => handleTipoToggle(tipo.codigo)}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <span>{tipo.nombre}</span>
                          {tipo.descripcion && (
                            <Typography variant="caption" color="text.secondary">
                              ({tipo.descripcion})
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  ))}
              </FormGroup>

              {/* Campos dinámicos según tipos seleccionados */}
              {tiposWatch?.map((tipo: any, index: number) =>
                renderCamposTipo(tipo.tipoPersonaCodigo, index)
              )}
            </Box>

            <Divider />

            {/* Observaciones */}
            <Box>
              <Controller
                name="observaciones"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Observaciones"
                    multiline
                    rows={3}
                    size="small"
                    error={!!errors.observaciones}
                    helperText={errors.observaciones?.message}
                  />
                )}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} startIcon={<CloseIcon />} disabled={submitting || loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={submitting || loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={submitting || loading}
          >
            {submitting || loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PersonaFormV2;
