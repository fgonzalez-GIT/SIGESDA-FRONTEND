import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Box,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';

export interface CatalogoField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'switch';
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  rows?: number;
}

export interface CatalogoFormDialogProps<T> {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: T) => Promise<void>;
  title: string;
  fields: CatalogoField[];
  schema: ZodSchema;
  defaultValues?: Partial<T>;
  isEdit?: boolean;
  loading?: boolean;
}

/**
 * Diálogo genérico y reutilizable para crear/editar catálogos
 * Usa React Hook Form + Zod para validación
 */
export function CatalogoFormDialog<T extends Record<string, any>>({
  open,
  onClose,
  onSubmit,
  title,
  fields,
  schema,
  defaultValues,
  isEdit = false,
  loading = false,
}: CatalogoFormDialogProps<T>) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    // Modo menos estricto para mejor performance inicial
    mode: 'onSubmit',
    // Prevenir re-validación en cada cambio
    reValidateMode: 'onSubmit',
  });

  // Reset form when defaultValues change (already memoized in parent)
  React.useEffect(() => {
    if (open) {
      reset(defaultValues as any);
    }
  }, [open, defaultValues, reset]);

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data as T);
      onClose();
    } catch (error) {
      console.error('Error en formulario:', error);
      // El error se maneja en el componente padre
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          timeout: 200,
        },
      }}
      // Deshabilitar scroll lock para evitar forced reflows
      disableScrollLock
    >
      <DialogTitle>
        {isEdit ? `Editar ${title}` : `Nuevo ${title}`}
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            {fields.map((field) => (
              <Controller
                key={field.name}
                name={field.name as any}
                control={control}
                render={({ field: formField }) => {
                  if (field.type === 'switch') {
                    return (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!formField.value}
                            onChange={(e) => formField.onChange(e.target.checked)}
                            disabled={loading || isSubmitting || field.readOnly}
                          />
                        }
                        label={field.label}
                      />
                    );
                  }

                  return (
                    <TextField
                      {...formField}
                      value={field.type === 'number' ? (formField.value ?? '') : formField.value}
                      onChange={(e) => {
                        if (field.type === 'number') {
                          const numValue = parseFloat(e.target.value);
                          formField.onChange(isNaN(numValue) ? undefined : numValue);
                        } else {
                          formField.onChange(e);
                        }
                      }}
                      label={field.label}
                      type={field.type === 'number' ? 'number' : 'text'}
                      placeholder={field.placeholder}
                      helperText={
                        errors[field.name]?.message
                          ? String(errors[field.name]?.message)
                          : field.helperText
                      }
                      error={!!errors[field.name]}
                      disabled={loading || isSubmitting || field.readOnly}
                      required={field.required}
                      multiline={field.multiline || field.type === 'textarea'}
                      rows={field.rows || (field.type === 'textarea' ? 3 : 1)}
                      fullWidth
                      autoFocus={false}
                      slotProps={{
                        input: {
                          readOnly: field.readOnly,
                        },
                      }}
                    />
                  );
                }}
              />
            ))}
          </Box>

          {Object.keys(errors).length > 0 && (
            <Box mt={2}>
              <Typography variant="caption" color="error">
                Por favor corrige los errores antes de continuar
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
