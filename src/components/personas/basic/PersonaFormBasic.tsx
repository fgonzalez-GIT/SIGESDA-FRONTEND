import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createPersonaBasicSchema,
  updatePersonaBasicSchema,
  type CreatePersonaBasicFormData,
} from '../../../schemas/persona.basic.schema';
import type { Persona } from '../../../types/persona.types';

interface PersonaFormBasicProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePersonaBasicFormData) => Promise<void>;
  persona?: Persona | null;
  loading?: boolean;
}

/**
 * Formulario Básico de Persona
 *
 * Compatible con Backend Básico (6 endpoints)
 * Sin gestión de tipos ni contactos
 *
 * @example
 * ```tsx
 * <PersonaFormBasic
 *   open={isOpen}
 *   onClose={handleClose}
 *   onSubmit={handleSubmit}
 *   persona={selectedPersona} // null para crear, persona para editar
 * />
 * ```
 */
export const PersonaFormBasic: React.FC<PersonaFormBasicProps> = ({
  open,
  onClose,
  onSubmit,
  persona,
  loading = false,
}) => {
  const isEditing = !!persona;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePersonaBasicFormData>({
    resolver: zodResolver(isEditing ? updatePersonaBasicSchema : createPersonaBasicSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      observaciones: '',
    },
  });

  // Cargar datos si estamos editando
  useEffect(() => {
    if (persona && open) {
      reset({
        nombre: persona.nombre || '',
        apellido: persona.apellido || '',
        dni: persona.dni || '',
        email: persona.email || '',
        telefono: persona.telefono || '',
        direccion: persona.direccion || '',
        fechaNacimiento: persona.fechaNacimiento
          ? new Date(persona.fechaNacimiento).toISOString().split('T')[0]
          : '',
        observaciones: persona.observaciones || '',
      });
    } else if (!open) {
      reset({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        direccion: '',
        fechaNacimiento: '',
        observaciones: '',
      });
    }
  }, [persona, open, reset]);

  const handleFormSubmit = async (data: CreatePersonaBasicFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isSubmitting}
    >
      <DialogTitle>
        {isEditing ? 'Editar Persona' : 'Nueva Persona'}
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Formulario básico de persona. Los campos marcados con * son obligatorios.
            </Alert>

            {/* Datos Personales */}
            <Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
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
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
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
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
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
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
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
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                          },
                        }}
                        error={!!errors.fechaNacimiento}
                        helperText={errors.fechaNacimiento?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Datos de Contacto */}
            <Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
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
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
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
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
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
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

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
                    rows={4}
                    size="small"
                    error={!!errors.observaciones}
                    helperText={errors.observaciones?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || loading}
          >
            {isSubmitting
              ? isEditing
                ? 'Guardando...'
                : 'Creando...'
              : isEditing
              ? 'Guardar Cambios'
              : 'Crear Persona'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PersonaFormBasic;
