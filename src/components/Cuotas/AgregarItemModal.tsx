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
    Grid,
    InputAdornment,
    Alert,
    CircularProgress,
    Box
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { itemsCuotaService } from '../../services/itemsCuotaService';
import { cuotasService } from '../../services/cuotasService';
import { TipoItemCuota } from '../../types/cuota.types';

// Schema de validación para agregar ítem manual
const agregarItemSchema = z.object({
    tipoItemCodigo: z.string().min(1, 'Debe seleccionar un tipo de ítem'),
    concepto: z.string().min(3, 'El concepto debe tener al menos 3 caracteres').max(200, 'El concepto no puede exceder 200 caracteres'),
    monto: z.number().min(0.01, 'El monto debe ser mayor a 0'),
    cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
    observaciones: z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').optional(),
});

type AgregarItemFormData = z.infer<typeof agregarItemSchema>;

interface AgregarItemModalProps {
    open: boolean;
    onClose: () => void;
    cuotaId: number;
    onSuccess: () => void;
}

export const AgregarItemModal: React.FC<AgregarItemModalProps> = ({
    open,
    onClose,
    cuotaId,
    onSuccess
}) => {
    const [tiposItems, setTiposItems] = useState<TipoItemCuota[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingTipos, setLoadingTipos] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<AgregarItemFormData>({
        resolver: zodResolver(agregarItemSchema),
        defaultValues: {
            tipoItemCodigo: '',
            concepto: '',
            monto: 0,
            cantidad: 1,
            observaciones: ''
        }
    });

    const watchMonto = watch('monto', 0);
    const watchCantidad = watch('cantidad', 1);
    const montoTotal = watchMonto * watchCantidad;

    useEffect(() => {
        if (open) {
            loadTiposItems();
            reset(); // Reset form when modal opens
        }
    }, [open, reset]);

    const loadTiposItems = async () => {
        setLoadingTipos(true);
        try {
            const response = await itemsCuotaService.getTiposItems();
            setTiposItems(response);
            setError(null);
        } catch (err: any) {
            console.error('Error al cargar tipos de items:', err);
            setError('Error al cargar los tipos de ítems disponibles');
        } finally {
            setLoadingTipos(false);
        }
    };

    const onFormSubmit = async (data: AgregarItemFormData) => {
        try {
            setLoading(true);
            setError(null);

            await cuotasService.addItemManual(cuotaId, {
                tipoItemCodigo: data.tipoItemCodigo,
                concepto: data.concepto,
                monto: data.monto,
                cantidad: data.cantidad,
                observaciones: data.observaciones || null
            });

            reset();
            onSuccess();
        } catch (err: any) {
            console.error('Error al agregar ítem:', err);
            setError(err?.response?.data?.error || 'Error al agregar el ítem manual');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        reset();
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Agregar Ítem Manual</DialogTitle>

            <form onSubmit={handleSubmit(onFormSubmit)}>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {loadingTipos ? (
                        <Box display="flex" justifyContent="center" py={3}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {/* Tipo de Ítem */}
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="tipoItemCodigo"
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl fullWidth required error={!!error}>
                                            <InputLabel>Tipo de Ítem</InputLabel>
                                            <Select {...field} label="Tipo de Ítem" disabled={loading}>
                                                {tiposItems.map((tipo) => (
                                                    <MenuItem key={tipo.codigo} value={tipo.codigo}>
                                                        {tipo.nombre}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {error && (
                                                <Alert severity="error" sx={{ mt: 1 }}>
                                                    {error.message}
                                                </Alert>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            {/* Concepto */}
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="concepto"
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Concepto"
                                            placeholder="Ej: Cargo adicional por material didáctico"
                                            required
                                            disabled={loading}
                                            multiline
                                            rows={2}
                                            error={!!error}
                                            helperText={error?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Monto y Cantidad */}
                            <Grid size={{ xs: 6 }}>
                                <Controller
                                    name="monto"
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            type="number"
                                            label="Monto Unitario"
                                            required
                                            disabled={loading}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                            }}
                                            error={!!error}
                                            helperText={error?.message}
                                            inputProps={{
                                                min: 0.01,
                                                step: 0.01
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 6 }}>
                                <Controller
                                    name="cantidad"
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            type="number"
                                            label="Cantidad"
                                            required
                                            disabled={loading}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            error={!!error}
                                            helperText={error?.message}
                                            inputProps={{
                                                min: 1,
                                                step: 1
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Mostrar total si cantidad > 1 */}
                            {watchCantidad > 1 && (
                                <Grid size={{ xs: 12 }}>
                                    <Alert severity="info">
                                        <strong>Monto Total: ${montoTotal.toFixed(2)}</strong>
                                        {' '}(${watchMonto.toFixed(2)} × {watchCantidad})
                                    </Alert>
                                </Grid>
                            )}

                            {/* Observaciones */}
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="observaciones"
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Observaciones (opcional)"
                                            placeholder="Notas adicionales sobre este ítem..."
                                            disabled={loading}
                                            multiline
                                            rows={3}
                                            error={!!error}
                                            helperText={error?.message}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || loadingTipos}
                    >
                        {loading ? 'Agregando...' : 'Agregar Ítem'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AgregarItemModal;
