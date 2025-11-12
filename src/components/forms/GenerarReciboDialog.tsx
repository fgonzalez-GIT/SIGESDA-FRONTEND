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
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Delete, Add, Person, Receipt } from '@mui/icons-material';
import { useAppSelector } from '../../hooks/redux';
import { GenerarReciboRequest } from '../../store/slices/recibosSlice';

interface GenerarReciboDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (request: GenerarReciboRequest) => void;
  loading?: boolean;
  personaPreseleccionada?: number;
  cuotasPreseleccionadas?: number[];
}

interface FormData {
  personaId: number | null;
  cuotaIds: number[];
  fechaVencimiento: Date | null;
  observaciones: string;
  aplicarDescuentos: boolean;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  tipoDescuento: 'porcentaje' | 'monto';
}

export const GenerarReciboDialog: React.FC<GenerarReciboDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  personaPreseleccionada,
  cuotasPreseleccionadas = [],
}) => {
  const { personas } = useAppSelector((state) => state.personas);
  const { cuotas } = useAppSelector((state) => state.cuotas);

  const [formData, setFormData] = useState<FormData>({
    personaId: null,
    cuotaIds: [],
    fechaVencimiento: null,
    observaciones: '',
    aplicarDescuentos: false,
    descuentoPorcentaje: 0,
    descuentoMonto: 0,
    tipoDescuento: 'porcentaje',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtrar cuotas pendientes de la persona seleccionada
  const cuotasDisponibles = cuotas.filter(cuota =>
    formData.personaId &&
    cuota.personaId === formData.personaId &&
    (cuota.estado === 'pendiente' || cuota.estado === 'vencida')
  );

  const cuotasSeleccionadas = cuotas.filter(cuota =>
    formData.cuotaIds.includes(cuota.id)
  );

  useEffect(() => {
    if (open) {
      const currentDate = new Date();
      const defaultVencimiento = new Date(currentDate);
      defaultVencimiento.setDate(currentDate.getDate() + 10);

      setFormData({
        personaId: personaPreseleccionada || null,
        cuotaIds: cuotasPreseleccionadas,
        fechaVencimiento: defaultVencimiento,
        observaciones: '',
        aplicarDescuentos: false,
        descuentoPorcentaje: 0,
        descuentoMonto: 0,
        tipoDescuento: 'porcentaje',
      });
      setErrors({});
    }
  }, [open, personaPreseleccionada, cuotasPreseleccionadas]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.personaId) {
      newErrors.personaId = 'Debe seleccionar una persona';
    }
    if (formData.cuotaIds.length === 0) {
      newErrors.cuotaIds = 'Debe seleccionar al menos una cuota';
    }
    if (!formData.fechaVencimiento) {
      newErrors.fechaVencimiento = 'La fecha de vencimiento es obligatoria';
    }
    if (formData.aplicarDescuentos) {
      if (formData.tipoDescuento === 'porcentaje' && (formData.descuentoPorcentaje <= 0 || formData.descuentoPorcentaje > 100)) {
        newErrors.descuentoPorcentaje = 'El porcentaje debe ser entre 1 y 100';
      }
      if (formData.tipoDescuento === 'monto' && formData.descuentoMonto <= 0) {
        newErrors.descuentoMonto = 'El monto del descuento debe ser mayor a 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const request: GenerarReciboRequest = {
      personaId: formData.personaId!,
      cuotaIds: formData.cuotaIds,
      fechaVencimiento: formData.fechaVencimiento!.toISOString().split('T')[0],
      observaciones: formData.observaciones || undefined,
      aplicarDescuentos: formData.aplicarDescuentos,
      descuentoPorcentaje: formData.aplicarDescuentos && formData.tipoDescuento === 'porcentaje'
        ? formData.descuentoPorcentaje
        : undefined,
      descuentoMonto: formData.aplicarDescuentos && formData.tipoDescuento === 'monto'
        ? formData.descuentoMonto
        : undefined,
    };

    onSubmit(request);
  };

  const handleClose = () => {
    setFormData({
      personaId: null,
      cuotaIds: [],
      fechaVencimiento: null,
      observaciones: '',
      aplicarDescuentos: false,
      descuentoPorcentaje: 0,
      descuentoMonto: 0,
      tipoDescuento: 'porcentaje',
    });
    setErrors({});
    onClose();
  };

  const handleToggleCuota = (cuotaId: number) => {
    setFormData(prev => ({
      ...prev,
      cuotaIds: prev.cuotaIds.includes(cuotaId)
        ? prev.cuotaIds.filter(id => id !== cuotaId)
        : [...prev.cuotaIds, cuotaId],
    }));
    setErrors(prev => ({ ...prev, cuotaIds: '' }));
  };

  const handleSelectAllCuotas = () => {
    setFormData(prev => ({
      ...prev,
      cuotaIds: cuotasDisponibles.map(c => c.id),
    }));
    setErrors(prev => ({ ...prev, cuotaIds: '' }));
  };

  const handleDeselectAllCuotas = () => {
    setFormData(prev => ({
      ...prev,
      cuotaIds: [],
    }));
  };

  const personasOptions = personas.map(persona => ({
    id: persona.id,
    label: `${persona.nombre} ${persona.apellido} (${persona.tipos?.map(t => t.tipoPersonaCodigo).join(', ') || 'Sin tipo'})`,
    persona
  }));

  const subtotal = cuotasSeleccionadas.reduce((sum, cuota) => sum + cuota.montoFinal, 0);
  const descuentoCalculado = formData.aplicarDescuentos
    ? (formData.tipoDescuento === 'porcentaje'
        ? subtotal * (formData.descuentoPorcentaje / 100)
        : formData.descuentoMonto)
    : 0;
  const total = subtotal - descuentoCalculado;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Receipt color="primary" />
            <Typography variant="h6">
              Generar Recibo
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <Box sx={{ display: 'flex', gap: 3, height: '100%' }}>
            {/* Panel izquierdo - Configuración */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" gutterBottom>
                Datos del Recibo
              </Typography>

              {/* Selección de persona */}
              <Autocomplete
                options={personasOptions}
                value={personasOptions.find(p => p.id === formData.personaId) || null}
                onChange={(_, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    personaId: newValue?.id || null,
                    cuotaIds: [], // Limpiar cuotas al cambiar persona
                  }));
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

              {/* Fecha de vencimiento */}
              <DatePicker
                label="Fecha de Vencimiento"
                value={formData.fechaVencimiento}
                onChange={(newValue) => {
                  setFormData(prev => ({ ...prev, fechaVencimiento: newValue }));
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

              {/* Descuentos */}
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.aplicarDescuentos}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        aplicarDescuentos: e.target.checked
                      }))}
                      disabled={loading}
                    />
                  }
                  label="Aplicar descuento"
                />

                {formData.aplicarDescuentos && (
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo de descuento</InputLabel>
                      <Select
                        value={formData.tipoDescuento}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          tipoDescuento: e.target.value as 'porcentaje' | 'monto'
                        }))}
                        disabled={loading}
                      >
                        <MenuItem value="porcentaje">Porcentaje</MenuItem>
                        <MenuItem value="monto">Monto fijo</MenuItem>
                      </Select>
                    </FormControl>

                    {formData.tipoDescuento === 'porcentaje' ? (
                      <TextField
                        label="Descuento (%)"
                        type="number"
                        value={formData.descuentoPorcentaje}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          descuentoPorcentaje: Number(e.target.value)
                        }))}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        error={!!errors.descuentoPorcentaje}
                        helperText={errors.descuentoPorcentaje}
                        disabled={loading}
                        fullWidth
                      />
                    ) : (
                      <TextField
                        label="Descuento"
                        type="number"
                        value={formData.descuentoMonto}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          descuentoMonto: Number(e.target.value)
                        }))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        error={!!errors.descuentoMonto}
                        helperText={errors.descuentoMonto}
                        disabled={loading}
                        fullWidth
                      />
                    )}
                  </Box>
                )}
              </Box>

              {/* Observaciones */}
              <TextField
                label="Observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                disabled={loading}
                fullWidth
                multiline
                rows={3}
                placeholder="Observaciones adicionales para el recibo..."
              />

              {/* Resumen */}
              <Box sx={{ mt: 'auto' }}>
                <Alert severity="info">
                  <Typography variant="subtitle2" gutterBottom>
                    Resumen del Recibo
                  </Typography>
                  <Typography variant="body2">
                    • <strong>{cuotasSeleccionadas.length}</strong> cuotas seleccionadas
                  </Typography>
                  <Typography variant="body2">
                    • Subtotal: <strong>${subtotal.toLocaleString()}</strong>
                  </Typography>
                  {descuentoCalculado > 0 && (
                    <Typography variant="body2">
                      • Descuento: <strong>-${descuentoCalculado.toLocaleString()}</strong>
                    </Typography>
                  )}
                  <Typography variant="body2">
                    • <strong>Total: ${total.toLocaleString()}</strong>
                  </Typography>
                  <Typography variant="body2">
                    • Vence: <strong>{formData.fechaVencimiento?.toLocaleDateString('es-AR')}</strong>
                  </Typography>
                </Alert>
              </Box>
            </Box>

            {/* Panel derecho - Selección de cuotas */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Cuotas a Incluir
                </Typography>
                {cuotasDisponibles.length > 0 && (
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      onClick={handleSelectAllCuotas}
                      disabled={loading}
                    >
                      Todas
                    </Button>
                    <Button
                      size="small"
                      onClick={handleDeselectAllCuotas}
                      disabled={loading}
                    >
                      Ninguna
                    </Button>
                  </Box>
                )}
              </Box>

              {errors.cuotaIds && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.cuotaIds}
                </Alert>
              )}

              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {!formData.personaId ? (
                  <Box p={3} textAlign="center">
                    <Person color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography color="text.secondary">
                      Seleccione una persona para ver sus cuotas pendientes
                    </Typography>
                  </Box>
                ) : cuotasDisponibles.length === 0 ? (
                  <Box p={3} textAlign="center">
                    <Receipt color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography color="text.secondary">
                      Esta persona no tiene cuotas pendientes
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">Sel.</TableCell>
                          <TableCell>Concepto</TableCell>
                          <TableCell>Vencimiento</TableCell>
                          <TableCell align="right">Monto</TableCell>
                          <TableCell>Estado</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cuotasDisponibles.map((cuota) => (
                          <TableRow
                            key={cuota.id}
                            hover
                            onClick={() => handleToggleCuota(cuota.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={formData.cuotaIds.includes(cuota.id)}
                                onChange={() => handleToggleCuota(cuota.id)}
                                disabled={loading}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {cuota.concepto}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(cuota.fechaVencimiento).toLocaleDateString('es-AR')}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                ${cuota.montoFinal.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={cuota.estado}
                                size="small"
                                color={cuota.estado === 'vencida' ? 'error' : 'warning'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {formData.cuotaIds.length} de {cuotasDisponibles.length} cuotas seleccionadas
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || cuotasSeleccionadas.length === 0}
            startIcon={<Receipt />}
          >
            {loading ? 'Generando...' : `Generar Recibo ($${total.toLocaleString()})`}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default GenerarReciboDialog;