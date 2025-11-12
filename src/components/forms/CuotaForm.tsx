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
  InputAdornment,
  Alert,
  Autocomplete,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useAppSelector } from '../../hooks/redux';
import { Cuota } from '../../store/slices/cuotasSlice';

interface CuotaFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (cuota: Omit<Cuota, 'id'>) => void;
  cuota?: Cuota | null;
  loading?: boolean;
}

interface FormData {
  personaId: number | null;
  monto: number;
  concepto: string;
  mesVencimiento: string;
  fechaVencimiento: Date | null;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'cancelada';
  metodoPago?: 'efectivo' | 'transferencia' | 'tarjeta_debito' | 'tarjeta_credito';
  fechaPago?: Date | null;
  observaciones: string;
  descuento: number;
  recargo: number;
}

export const CuotaForm: React.FC<CuotaFormProps> = ({
  open,
  onClose,
  onSubmit,
  cuota,
  loading = false,
}) => {
  const { personas } = useAppSelector((state) => state.personas);
  const [formData, setFormData] = useState<FormData>({
    personaId: null,
    monto: 0,
    concepto: '',
    mesVencimiento: '',
    fechaVencimiento: null,
    estado: 'pendiente',
    observaciones: '',
    descuento: 0,
    recargo: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cuota) {
      setFormData({
        personaId: cuota.personaId,
        monto: cuota.monto,
        concepto: cuota.concepto,
        mesVencimiento: cuota.mesVencimiento,
        fechaVencimiento: new Date(cuota.fechaVencimiento),
        estado: cuota.estado,
        metodoPago: cuota.metodoPago,
        fechaPago: cuota.fechaPago ? new Date(cuota.fechaPago) : null,
        observaciones: cuota.observaciones || '',
        descuento: cuota.descuento || 0,
        recargo: cuota.recargo || 0,
      });
    } else {
      setFormData({
        personaId: null,
        monto: 0,
        concepto: '',
        mesVencimiento: '',
        fechaVencimiento: null,
        estado: 'pendiente',
        observaciones: '',
        descuento: 0,
        recargo: 0,
      });
    }
    setErrors({});
  }, [cuota, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.personaId) {
      newErrors.personaId = 'Debe seleccionar una persona';
    }
    if (formData.monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    }
    if (!formData.concepto.trim()) {
      newErrors.concepto = 'El concepto es obligatorio';
    }
    if (!formData.mesVencimiento) {
      newErrors.mesVencimiento = 'El mes de vencimiento es obligatorio';
    }
    if (!formData.fechaVencimiento) {
      newErrors.fechaVencimiento = 'La fecha de vencimiento es obligatoria';
    }
    if (formData.estado === 'pagada' && !formData.metodoPago) {
      newErrors.metodoPago = 'El método de pago es obligatorio para cuotas pagadas';
    }
    if (formData.estado === 'pagada' && !formData.fechaPago) {
      newErrors.fechaPago = 'La fecha de pago es obligatoria para cuotas pagadas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const persona = personas.find(p => p.id === formData.personaId);
    if (!persona) return;

    const montoFinal = formData.monto - formData.descuento + formData.recargo;

    const socioTipo = persona.tipos?.find(t => t.tipoPersonaCodigo === 'SOCIO');
    const personaTipoValue = persona.tipos?.[0]?.tipoPersonaCodigo.toLowerCase() as 'socio' | 'docente' | 'estudiante';

    const cuotaData: Omit<Cuota, 'id'> = {
      personaId: formData.personaId!,
      personaNombre: persona.nombre,
      personaApellido: persona.apellido,
      personaTipo: personaTipoValue,
      categoriaId: socioTipo?.categoriaId || '',
      monto: formData.monto,
      concepto: formData.concepto,
      mesVencimiento: formData.mesVencimiento,
      fechaVencimiento: formData.fechaVencimiento!.toISOString().split('T')[0],
      fechaCreacion: new Date().toISOString().split('T')[0],
      estado: formData.estado,
      metodoPago: formData.metodoPago,
      fechaPago: formData.fechaPago?.toISOString().split('T')[0],
      observaciones: formData.observaciones || undefined,
      descuento: formData.descuento > 0 ? formData.descuento : undefined,
      recargo: formData.recargo > 0 ? formData.recargo : undefined,
      montoFinal,
    };

    onSubmit(cuotaData);
  };

  const handleClose = () => {
    setFormData({
      personaId: null,
      monto: 0,
      concepto: '',
      mesVencimiento: '',
      fechaVencimiento: null,
      estado: 'pendiente',
      observaciones: '',
      descuento: 0,
      recargo: 0,
    });
    setErrors({});
    onClose();
  };

  const generateMesVencimiento = (fecha: Date | null) => {
    if (!fecha) return '';
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const personasOptions = personas.map(persona => ({
    id: persona.id,
    label: `${persona.nombre} ${persona.apellido} (${persona.tipos?.map(t => t.tipoPersonaCodigo).join(', ') || 'Sin tipo'})`,
    persona
  }));

  const montoFinal = formData.monto - formData.descuento + formData.recargo;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {cuota ? 'Editar Cuota' : 'Nueva Cuota'}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {/* Selección de persona */}
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
                  label="Persona"
                  error={!!errors.personaId}
                  helperText={errors.personaId}
                  required
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body1">
                      {option.persona.nombre} {option.persona.apellido}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.persona.tipos?.map(t => t.tipoPersonaCodigo).join(', ') || 'Sin tipo'} - {option.persona.email}
                    </Typography>
                  </Box>
                </li>
              )}
              getOptionLabel={(option) => option.label}
              disabled={loading}
            />

            {/* Datos financieros */}
            <Box display="flex" gap={2}>
              <TextField
                label="Monto"
                type="number"
                value={formData.monto}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, monto: Number(e.target.value) }));
                  setErrors(prev => ({ ...prev, monto: '' }));
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                error={!!errors.monto}
                helperText={errors.monto}
                required
                disabled={loading}
                fullWidth
              />

              <TextField
                label="Descuento"
                type="number"
                value={formData.descuento}
                onChange={(e) => setFormData(prev => ({ ...prev, descuento: Number(e.target.value) }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                disabled={loading}
                fullWidth
              />

              <TextField
                label="Recargo"
                type="number"
                value={formData.recargo}
                onChange={(e) => setFormData(prev => ({ ...prev, recargo: Number(e.target.value) }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                disabled={loading}
                fullWidth
              />
            </Box>

            {/* Mostrar monto final */}
            {montoFinal !== formData.monto && (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Monto final: ${montoFinal.toLocaleString()}</strong>
                  {formData.descuento > 0 && ` (Descuento: -$${formData.descuento})`}
                  {formData.recargo > 0 && ` (Recargo: +$${formData.recargo})`}
                </Typography>
              </Alert>
            )}

            {/* Concepto */}
            <TextField
              label="Concepto"
              value={formData.concepto}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, concepto: e.target.value }));
                setErrors(prev => ({ ...prev, concepto: '' }));
              }}
              placeholder="Ej: Cuota mensual - Octubre 2025"
              error={!!errors.concepto}
              helperText={errors.concepto}
              required
              disabled={loading}
              fullWidth
              multiline
              rows={2}
            />

            {/* Fechas */}
            <Box display="flex" gap={2}>
              <TextField
                label="Mes de Vencimiento"
                type="month"
                value={formData.mesVencimiento}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, mesVencimiento: e.target.value }));
                  setErrors(prev => ({ ...prev, mesVencimiento: '' }));
                }}
                error={!!errors.mesVencimiento}
                helperText={errors.mesVencimiento}
                required
                disabled={loading}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <DatePicker
                label="Fecha de Vencimiento"
                value={formData.fechaVencimiento}
                onChange={(newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    fechaVencimiento: newValue,
                    mesVencimiento: generateMesVencimiento(newValue),
                  }));
                  setErrors(prev => ({ ...prev, fechaVencimiento: '' }));
                }}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.fechaVencimiento,
                    helperText: errors.fechaVencimiento,
                  }
                }}
              />
            </Box>

            {/* Estado y método de pago */}
            <Box display="flex" gap={2}>
              <FormControl fullWidth required>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado}
                  onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as any }))}
                  disabled={loading}
                >
                  <MenuItem value="pendiente">Pendiente</MenuItem>
                  <MenuItem value="pagada">Pagada</MenuItem>
                  <MenuItem value="vencida">Vencida</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                </Select>
              </FormControl>

              {formData.estado === 'pagada' && (
                <FormControl fullWidth required>
                  <InputLabel>Método de Pago</InputLabel>
                  <Select
                    value={formData.metodoPago || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, metodoPago: e.target.value as any }))}
                    error={!!errors.metodoPago}
                    disabled={loading}
                  >
                    <MenuItem value="efectivo">Efectivo</MenuItem>
                    <MenuItem value="transferencia">Transferencia</MenuItem>
                    <MenuItem value="tarjeta_debito">Tarjeta de Débito</MenuItem>
                    <MenuItem value="tarjeta_credito">Tarjeta de Crédito</MenuItem>
                  </Select>
                  {errors.metodoPago && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {errors.metodoPago}
                    </Typography>
                  )}
                </FormControl>
              )}
            </Box>

            {/* Fecha de pago */}
            {formData.estado === 'pagada' && (
              <DatePicker
                label="Fecha de Pago"
                value={formData.fechaPago}
                onChange={(newValue) => {
                  setFormData(prev => ({ ...prev, fechaPago: newValue }));
                  setErrors(prev => ({ ...prev, fechaPago: '' }));
                }}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.fechaPago,
                    helperText: errors.fechaPago,
                  }
                }}
              />
            )}

            {/* Observaciones */}
            <TextField
              label="Observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              disabled={loading}
              fullWidth
              multiline
              rows={3}
              placeholder="Observaciones adicionales..."
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
            disabled={loading}
          >
            {loading ? 'Guardando...' : (cuota ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CuotaForm;