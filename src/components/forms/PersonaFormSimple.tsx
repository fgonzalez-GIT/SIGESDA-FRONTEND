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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Close as CloseIcon } from '@mui/icons-material';
import { Persona } from '../../store/slices/personasSlice';

interface PersonaFormData {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: Date | null;
  tipo: 'SOCIO' | 'NO_SOCIO' | 'DOCENTE' | 'PROVEEDOR' | '';
  estado: 'activo' | 'inactivo';
  observaciones: string;
}

interface PersonaFormErrors {
  nombre?: string;
  apellido?: string;
  dni?: string;
  email?: string;
  telefono?: string;
  tipo?: string;
  fechaNacimiento?: string;
}

interface PersonaFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Persona, 'id' | 'fechaIngreso'>) => void;
  persona?: Persona | null;
  loading?: boolean;
  title?: string;
}

const initialFormData: PersonaFormData = {
  nombre: '',
  apellido: '',
  dni: '',
  email: '',
  telefono: '',
  direccion: '',
  fechaNacimiento: null,
  tipo: '',
  estado: 'activo',
  observaciones: '',
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phone === '' || phoneRegex.test(phone);
};

export const PersonaFormSimple: React.FC<PersonaFormProps> = ({
  open,
  onClose,
  onSubmit,
  persona,
  loading = false,
  title,
}) => {
  const [formData, setFormData] = useState<PersonaFormData>(initialFormData);
  const [errors, setErrors] = useState<PersonaFormErrors>({});

  const isEditing = Boolean(persona);
  const dialogTitle = title || (isEditing ? 'Editar Persona' : 'Nueva Persona');

  useEffect(() => {
    if (persona) {
      setFormData({
        nombre: persona.nombre || '',
        apellido: persona.apellido || '',
        dni: persona.dni || '',
        email: persona.email || '',
        telefono: persona.telefono || '',
        direccion: persona.direccion || '',
        fechaNacimiento: persona.fechaNacimiento ? new Date(persona.fechaNacimiento) : null,
        tipo: persona.tipo || '',
        estado: persona.estado || 'activo',
        observaciones: persona.observaciones || '',
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [persona, open]);

  const handleChange = (field: keyof PersonaFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target ? event.target.value : event;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof PersonaFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: PersonaFormErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es requerido';
    } else if (formData.dni.trim().length < 7 || formData.dni.trim().length > 8) {
      newErrors.dni = 'El DNI debe tener entre 7 y 8 caracteres';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'El tipo es requerido';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (formData.telefono && !validatePhone(formData.telefono)) {
      newErrors.telefono = 'El formato del teléfono no es válido';
    }

    if (formData.fechaNacimiento && formData.fechaNacimiento > new Date()) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento no puede ser futura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const submitData: Omit<Persona, 'id' | 'fechaIngreso'> = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      dni: formData.dni.trim(),
      email: formData.email.trim() || undefined,
      telefono: formData.telefono.trim() || undefined,
      direccion: formData.direccion.trim() || undefined,
      fechaNacimiento: formData.fechaNacimiento?.toISOString() || undefined,
      tipo: formData.tipo as Persona['tipo'],
      estado: formData.estado,
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
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { minHeight: '500px' } }}
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
            <Typography variant="subtitle1" color="primary">
              Información Personal
            </Typography>

            <Box display="flex" gap={2}>
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
                label="Apellido *"
                value={formData.apellido}
                onChange={handleChange('apellido')}
                error={!!errors.apellido}
                helperText={errors.apellido}
                disabled={loading}
              />
            </Box>

            <TextField
              fullWidth
              label="DNI *"
              value={formData.dni}
              onChange={handleChange('dni')}
              error={!!errors.dni}
              helperText={errors.dni}
              disabled={loading}
              inputProps={{ maxLength: 8 }}
            />

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.telefono}
                onChange={handleChange('telefono')}
                error={!!errors.telefono}
                helperText={errors.telefono}
                disabled={loading}
              />
            </Box>

            <TextField
              fullWidth
              label="Dirección"
              value={formData.direccion}
              onChange={handleChange('direccion')}
              disabled={loading}
            />

            <DatePicker
              label="Fecha de Nacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange('fechaNacimiento')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.fechaNacimiento,
                  helperText: errors.fechaNacimiento,
                  disabled: loading,
                },
              }}
              maxDate={new Date()}
            />

            <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }}>
              Información del Sistema
            </Typography>

            <Box display="flex" gap={2}>
              <FormControl fullWidth error={!!errors.tipo} disabled={loading}>
                <InputLabel>Tipo *</InputLabel>
                <Select
                  value={formData.tipo}
                  onChange={handleChange('tipo')}
                  label="Tipo *"
                >
                  <MenuItem value="SOCIO">Socio</MenuItem>
                  <MenuItem value="NO_SOCIO">No Socio</MenuItem>
                  <MenuItem value="DOCENTE">Docente</MenuItem>
                  <MenuItem value="PROVEEDOR">Proveedor</MenuItem>
                </Select>
                {errors.tipo && <FormHelperText>{errors.tipo}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth disabled={loading}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado}
                  onChange={handleChange('estado')}
                  label="Estado"
                >
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="inactivo">Inactivo</MenuItem>
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

export default PersonaFormSimple;