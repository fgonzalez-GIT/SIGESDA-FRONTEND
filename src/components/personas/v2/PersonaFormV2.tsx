import React, { useEffect, useState, useCallback } from 'react';
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
  CreatePersonaDTO,
  Persona,
  CatalogosPersonas,
  CreatePersonaTipoDTO,
} from '../../../types/persona.types';
import {
  createPersonaSchema,
  type CreatePersonaFormData,
} from '../../../schemas/persona.schema';
import { personasApi } from '../../../services/personasApi';
import { debounce } from '../../../utils/debounce';
import { ContactosFormSection } from './forms/ContactosFormSection';
import { TipoPersonaMultiSelect } from './TipoPersonaMultiSelect';

interface PersonaFormV2Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePersonaDTO) => Promise<void>;
  persona?: Persona | null;
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
  const [selectedTipos, setSelectedTipos] = useState<string[]>(['NO_SOCIO']);
  const [submitting, setSubmitting] = useState(false);
  const [dniValidating, setDniValidating] = useState(false);
  const [dniError, setDniError] = useState<string | null>(null);

  const isEditing = !!persona;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePersonaFormData>({
    resolver: zodResolver(createPersonaSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      observaciones: '',
      tipos: [{ tipoPersonaCodigo: 'NO_SOCIO' }],
      contactos: [],
    },
  });

  // Observar cambios en tipos para mostrar campos dinámicos
  const tiposWatch = watch('tipos');

  // ============================================================================
  // VALIDACIÓN ASÍNCRONA DE DNI
  // ============================================================================
  const validateDniAsync = useCallback(
    debounce(async (dni: string) => {
      if (!dni || dni.length < 7 || dni.length > 8) {
        setDniError(null);
        setDniValidating(false);
        return;
      }

      setDniValidating(true);
      setDniError(null);

      try {
        const response = await personasApi.validarDni(dni, persona?.id);

        if (!response.success || !response.data) {
          setDniError(null);
        } else if (response.data.exists && response.data.personaId !== persona?.id) {
          setDniError(
            `El DNI ${dni} ya está registrado${
              response.data.personaNombre ? ` para ${response.data.personaNombre}` : ''
            }`
          );
        } else {
          setDniError(null);
        }
      } catch (error) {
        console.error('Error validando DNI:', error);
        setDniError(null);
      } finally {
        setDniValidating(false);
      }
    }, 500),
    [persona?.id]
  );

  useEffect(() => {
    if (persona) {
      // Modo edición: cargar datos básicos Y tipos existentes
      const tiposExistentes = persona.tipos?.map((pt) => {
        const tipo: any = {
          tipoPersonaCodigo: pt.tipoPersona.codigo,
        };

        // Cargar campos específicos según el tipo
        const codigoUpper = pt.tipoPersona.codigo.toUpperCase();
        if (codigoUpper === 'SOCIO' && pt.categoriaId) {
          tipo.categoriaId = pt.categoriaId;
        } else if (codigoUpper === 'DOCENTE') {
          tipo.especialidadId = pt.especialidadId;
          tipo.honorariosPorHora = pt.honorariosPorHora || 0;
        } else if (codigoUpper === 'PROVEEDOR') {
          tipo.cuit = pt.cuit || '';
          tipo.razonSocialId = pt.razonSocialId || 0;
        }

        return tipo;
      }) || [];

      reset({
        nombre: persona.nombre,
        apellido: persona.apellido,
        dni: persona.dni,
        email: persona.email || '',
        telefono: persona.telefono || '',
        direccion: persona.direccion || '',
        fechaNacimiento: persona.fechaNacimiento || '',
        observaciones: persona.observaciones || '',
        tipos: tiposExistentes,
        contactos: [],
      });

      // Actualizar tipos seleccionados
      setSelectedTipos(tiposExistentes.map((t: any) => t.tipoPersonaCodigo));
    } else {
      // Modo creación: resetear formulario con NO_SOCIO predeterminado
      reset({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        direccion: '',
        fechaNacimiento: '',
        observaciones: '',
        tipos: [{ tipoPersonaCodigo: 'NO_SOCIO' }],
        contactos: [],
      });
      setSelectedTipos(['NO_SOCIO']);
    }
  }, [persona, reset]);

  const handleTipoToggle = (codigoTipo: string) => {
    const currentTipos = tiposWatch || [];
    const isSelected = selectedTipos.includes(codigoTipo);
    const codigoUpper = codigoTipo.toUpperCase();

    if (isSelected) {
      // Desmarcar: eliminar tipo
      const newTipos = currentTipos.filter((t: any) => t.tipoPersonaCodigo !== codigoTipo);
      setValue('tipos', newTipos);
      setSelectedTipos(selectedTipos.filter((t) => t !== codigoTipo));
    } else {
      // Aplicar exclusión mutua SOCIO ↔ NO_SOCIO
      let tiposToAdd = currentTipos;
      let selectedToKeep = [...selectedTipos];

      if (codigoUpper === 'SOCIO') {
        // Si se marca SOCIO, eliminar NO_SOCIO
        tiposToAdd = currentTipos.filter((t: any) => t.tipoPersonaCodigo?.toUpperCase() !== 'NO_SOCIO');
        selectedToKeep = selectedToKeep.filter((t) => t.toUpperCase() !== 'NO_SOCIO');
      } else if (codigoUpper === 'NO_SOCIO') {
        // Si se marca NO_SOCIO, eliminar SOCIO
        tiposToAdd = currentTipos.filter((t: any) => t.tipoPersonaCodigo?.toUpperCase() !== 'SOCIO');
        selectedToKeep = selectedToKeep.filter((t) => t.toUpperCase() !== 'SOCIO');
      }

      // Marcar: agregar tipo con campos por defecto
      const newTipo: any = {
        tipoPersonaCodigo: codigoTipo,
      };

      // Inicializar campos específicos según el tipo
      if (codigoUpper === 'SOCIO') {
        // Buscar "General" como categoría predeterminada
        const generalCat = catalogos?.categoriasSocio?.find(c => c.codigo === 'GENERAL');
        newTipo.categoriaId = generalCat?.id || 0;
      } else if (codigoUpper === 'DOCENTE') {
        // Buscar "General" como especialidad predeterminada
        const generalEsp = catalogos?.especialidadesDocentes?.find(e => e.codigo === 'GENERAL');
        newTipo.especialidadId = generalEsp?.id || 0;
        newTipo.honorariosPorHora = 0;
      } else if (codigoUpper === 'PROVEEDOR') {
        newTipo.cuit = '';
        newTipo.razonSocialId = 0;
      }
      // NO_SOCIO no requiere campos adicionales

      setValue('tipos', [...tiposToAdd, newTipo]);
      setSelectedTipos([...selectedToKeep, codigoTipo]);
    }
  };

  // Nuevo handler para TipoPersonaMultiSelect
  const handleTiposChange = (newCodigos: string[]) => {
    const currentTipos = tiposWatch || [];

    // Determinar qué tipos agregar y cuáles eliminar
    const tiposToAdd = newCodigos.filter(codigo => !selectedTipos.includes(codigo));
    const tiposToRemove = selectedTipos.filter(codigo => !newCodigos.includes(codigo));

    let updatedTipos = [...currentTipos];

    // Eliminar tipos desmarcados
    tiposToRemove.forEach(codigo => {
      updatedTipos = updatedTipos.filter((t: any) => t.tipoPersonaCodigo !== codigo);
    });

    // Agregar nuevos tipos con campos por defecto
    tiposToAdd.forEach(codigo => {
      const codigoUpper = codigo.toUpperCase();
      const newTipo: any = {
        tipoPersonaCodigo: codigo,
      };

      // Inicializar campos específicos según el tipo
      if (codigoUpper === 'SOCIO') {
        // Buscar "General" como categoría predeterminada
        const generalCat = catalogos?.categoriasSocio?.find(c => c.codigo === 'GENERAL');
        newTipo.categoriaId = generalCat?.id || 0;
      } else if (codigoUpper === 'DOCENTE') {
        // Buscar "General" como especialidad predeterminada
        const generalEsp = catalogos?.especialidadesDocentes?.find(e => e.codigo === 'GENERAL');
        newTipo.especialidadId = generalEsp?.id || 0;
        newTipo.honorariosPorHora = 0;
      } else if (codigoUpper === 'PROVEEDOR') {
        newTipo.cuit = '';
        newTipo.razonSocialId = 0;
      }
      // NO_SOCIO no requiere campos adicionales

      updatedTipos.push(newTipo);
    });

    setValue('tipos', updatedTipos);
    setSelectedTipos(newCodigos);
  };

  const handleFormSubmit = async (data: CreatePersonaFormData) => {
    // Validar que no haya error de DNI
    if (dniError) {
      return;
    }

    try {
      setSubmitting(true);

      // Transformar datos antes de enviar
      const dataToSend: any = {
        ...data,
        // Limpiar fechaNacimiento si está vacío (evitar error de validación datetime)
        fechaNacimiento: data.fechaNacimiento || undefined,
        tipos: data.tipos?.map((tipo: any) => {
          if (tipo.tipoPersonaCodigo === 'PROVEEDOR' && tipo.cuit) {
            return {
              ...tipo,
              cuit: tipo.cuit.replace(/-/g, ''), // Remover guiones del CUIT
            };
          }
          return tipo;
        }),
      };

      await onSubmit(dataToSend as CreatePersonaDTO);
      reset();
      setSelectedTipos(['NO_SOCIO']);
      setDniError(null);
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
                          .sort((a, b) => a.orden - b.orden)
                          .map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                              {cat.nombre}{cat.montoCuota && Number(cat.montoCuota) > 0 ? ` - $${cat.montoCuota}` : ''}
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
              <Grid item xs={12}>
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
                          .sort((a, b) => a.orden - b.orden)
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
              <Grid item xs={12}>
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
                      placeholder="XX-XXXXXXXX-X"
                      inputProps={{ maxLength: 13 }}
                      error={!!errors.tipos?.[index]?.cuit}
                      helperText={errors.tipos?.[index]?.cuit?.message || 'Formato: XX-XXXXXXXX-X'}
                      onChange={(e) => {
                        // Formato CUIT: XX-XXXXXXXX-X (solo números y guiones)
                        let value = e.target.value.replace(/[^0-9-]/g, '');

                        // Eliminar guiones para trabajar solo con números
                        const onlyNumbers = value.replace(/-/g, '');

                        // Formatear con guiones en posiciones correctas
                        if (onlyNumbers.length <= 2) {
                          value = onlyNumbers;
                        } else if (onlyNumbers.length <= 10) {
                          value = `${onlyNumbers.slice(0, 2)}-${onlyNumbers.slice(2)}`;
                        } else {
                          value = `${onlyNumbers.slice(0, 2)}-${onlyNumbers.slice(2, 10)}-${onlyNumbers.slice(10, 11)}`;
                        }

                        // Actualizar campo CUIT
                        field.onChange(value);

                        // Extraer DNI (dígitos centrales) y actualizar campo DNI
                        if (onlyNumbers.length >= 10) {
                          const dniFromCuit = onlyNumbers.slice(2, 10);
                          setValue('dni', dniFromCuit);
                          // Disparar validación de DNI
                          if (dniFromCuit.length >= 7 && dniFromCuit.length <= 8) {
                            setDniError(null);
                            validateDniAsync(dniFromCuit);
                          }
                        }
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name={`tipos.${index}.razonSocialId` as any}
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      size="small"
                      error={!!errors.tipos?.[index]?.razonSocialId}
                    >
                      <InputLabel>Razón Social *</InputLabel>
                      <Select
                        {...field}
                        label="Razón Social *"
                      >
                        <MenuItem value={0}>Seleccionar razón social</MenuItem>
                        {catalogos?.razonesSociales
                          ?.filter((r) => r.activo)
                          .sort((a, b) => a.orden - b.orden)
                          .map((razon) => (
                            <MenuItem key={razon.id} value={razon.id}>
                              {razon.nombre}
                            </MenuItem>
                          ))}
                      </Select>
                      {errors.tipos?.[index]?.razonSocialId && (
                        <FormHelperText>
                          {errors.tipos?.[index]?.razonSocialId?.message}
                        </FormHelperText>
                      )}
                    </FormControl>
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
            {/* Tipos de persona - Disponible en ambos modos */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Tipos de Persona *
              </Typography>
              {errors.tipos && typeof errors.tipos.message === 'string' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.tipos.message}
                </Alert>
              )}

              <TipoPersonaMultiSelect
                value={selectedTipos}
                onChange={handleTiposChange}
                tiposPersona={catalogos.tiposPersona}
                error={!!errors.tipos}
                helperText={errors.tipos && typeof errors.tipos.message === 'string' ? errors.tipos.message : undefined}
              />

              {/* Campos dinámicos según tipos seleccionados */}
              {tiposWatch?.map((tipo: any, index: number) =>
                renderCamposTipo(tipo.tipoPersonaCodigo, index)
              )}
            </Box>

            <Divider />

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
                        error={!!errors.dni || !!dniError}
                        helperText={
                          errors.dni?.message ||
                          dniError ||
                          '7 u 8 dígitos'
                        }
                        onChange={(e) => {
                          field.onChange(e);
                          setDniError(null);
                          if (e.target.value.length >= 7 && e.target.value.length <= 8) {
                            validateDniAsync(e.target.value);
                          }
                        }}
                        onBlur={(e) => {
                          field.onBlur();
                          if (e.target.value.length >= 7 && e.target.value.length <= 8) {
                            validateDniAsync(e.target.value);
                          }
                        }}
                        InputProps={{
                          endAdornment: dniValidating ? (
                            <CircularProgress size={20} />
                          ) : null,
                        }}
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


            {/* Contactos - Solo en modo creación */}
            {!isEditing && (
              <>
                <ContactosFormSection
                  control={control}
                  errors={errors}
                  catalogos={catalogos}
                />
                <Divider />
              </>
            )}

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
            disabled={submitting || loading || !!dniError || dniValidating}
          >
            {submitting || loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PersonaFormV2;
