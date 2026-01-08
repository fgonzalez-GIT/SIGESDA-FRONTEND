import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stepper,
    Step,
    StepLabel,
    Typography,
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    FormControlLabel,
    Switch,
    Alert,
    CircularProgress,
    Paper,
    Divider,
    Chip,
    FormHelperText
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../../store';
import { generarCuotasMasivas, validarGeneracion, clearValidacion } from '../../store/slices/cuotasSlice';
import { fetchCategorias } from '../../store/slices/categoriasSlice';
import { GenerarCuotasRequest } from '../../types/cuota.types';
import { FEATURES } from '../../config/features';
import { generarCuotasV2Schema, type GenerarCuotasV2FormData } from '../../schemas';

interface GeneracionMasivaModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const steps = ['Configuración', 'Validación', 'Generación'];

const GeneracionMasivaModal: React.FC<GeneracionMasivaModalProps> = ({ open, onClose, onSuccess }) => {
    const dispatch = useAppDispatch();
    const { categorias } = useAppSelector(state => state.categorias);
    const { validacionGeneracion, loading, error, operationLoading } = useAppSelector(state => state.cuotas);

    const [activeStep, setActiveStep] = useState(0);
    const [resultData, setResultData] = useState<any>(null);

    // React Hook Form con Zod
    const { control, handleSubmit, watch, reset, formState: { errors, isValid } } = useForm<GenerarCuotasV2FormData>({
        resolver: zodResolver(generarCuotasV2Schema),
        mode: 'onChange',
        defaultValues: {
            mes: new Date().getMonth() + 1,
            anio: new Date().getFullYear(),
            categoriaIds: [],
            aplicarDescuentos: true,
            aplicarMotorReglas: true,
            incluirInactivos: false,
            soloNuevas: true,
            observaciones: ''
        }
    });

    // Watch form values for validation step
    const formValues = watch();

    useEffect(() => {
        if (open) {
            dispatch(fetchCategorias({}));
            dispatch(clearValidacion());
            setActiveStep(0);
            setResultData(null);
            reset(); // Reset form on open
        }
    }, [open, dispatch, reset]);

    const handleNext = async () => {
        if (activeStep === 0) {
            // Ir a validación
            dispatch(validarGeneracion({
                mes: formValues.mes,
                anio: formValues.anio,
                categoriaIds: formValues.categoriaIds && formValues.categoriaIds.length > 0 ? formValues.categoriaIds : undefined
            }));
            setActiveStep(1);
        } else if (activeStep === 1) {
            // Ejecutar generación usando los valores validados del formulario
            const result = await dispatch(generarCuotasMasivas(formValues as any)).unwrap();
            setResultData(result);
            setActiveStep(2);
            if (onSuccess) onSuccess();
        } else {
            onClose();
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0: // Configuración
                return (
                    <Box sx={{ mt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="mes"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.mes}>
                                            <InputLabel>Mes</InputLabel>
                                            <Select {...field} label="Mes">
                                                {[...Array(12)].map((_, i) => (
                                                    <MenuItem key={i + 1} value={i + 1}>
                                                        {new Date(0, i).toLocaleString('es-ES', { month: 'long' }).toUpperCase()}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.mes && <FormHelperText>{errors.mes.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="anio"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Año"
                                            type="number"
                                            error={!!errors.anio}
                                            helperText={errors.anio?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="categoriaIds"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.categoriaIds}>
                                            <InputLabel>Categorías (Opcional - Vacío para todas)</InputLabel>
                                            <Select
                                                {...field}
                                                multiple
                                                label="Categorías (Opcional - Vacío para todas)"
                                                value={field.value || []}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {(selected as number[]).map((value) => (
                                                            <Chip key={value} label={categorias.find(c => c.id === value)?.nombre} />
                                                        ))}
                                                    </Box>
                                                )}
                                            >
                                                {categorias.map((cat) => (
                                                    <MenuItem key={cat.id} value={cat.id}>
                                                        {cat.nombre}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.categoriaIds && <FormHelperText>{errors.categoriaIds.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                            {FEATURES.MOTOR_DESCUENTOS && (
                                <Grid size={{ xs: 12 }}>
                                    <Controller
                                        name="aplicarDescuentos"
                                        control={control}
                                        render={({ field }) => (
                                            <Box>
                                                <FormControlLabel
                                                    control={<Switch checked={field.value} onChange={field.onChange} />}
                                                    label="Aplicar Motor de Descuentos Automáticamente"
                                                />
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    Si se desactiva, se generarán las cuotas base + actividades sin calcular descuentos.
                                                </Typography>
                                            </Box>
                                        )}
                                    />
                                </Grid>
                            )}
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="observaciones"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            multiline
                                            rows={2}
                                            label="Observaciones"
                                            error={!!errors.observaciones}
                                            helperText={errors.observaciones?.message}
                                            value={field.value || ''}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );
            case 1: // Validación
                if (loading) {
                    return (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    );
                }
                if (!validacionGeneracion) return <Typography>No se pudo validar.</Typography>;

                return (
                    <Box sx={{ mt: 2 }}>
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: validacionGeneracion.puedeGenerar ? 'success.light' : 'warning.light' }}>
                            <Typography variant="h6" gutterBottom>
                                {validacionGeneracion.puedeGenerar ? 'Listo para Generar' : 'Atención'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Socios a generar:</strong> {validacionGeneracion.sociosPorGenerar}
                            </Typography>
                            {validacionGeneracion.cuotasExistentes > 0 && (
                                <Typography variant="body2" color="warning.dark">
                                    Ya existen {validacionGeneracion.cuotasExistentes} cuotas generadas para este período (serán omitidas).
                                </Typography>
                            )}
                        </Paper>

                        {validacionGeneracion.warnings && validacionGeneracion.warnings.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="warning.main">Advertencias:</Typography>
                                {validacionGeneracion.warnings.map((w, i) => (
                                    <Alert severity="warning" key={i} sx={{ mb: 1 }}>{w}</Alert>
                                ))}
                            </Box>
                        )}

                        <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                            Se generarán las cuotas para {validacionGeneracion.sociosPorGenerar} socios.
                            {formValues.aplicarDescuentos && ' Se aplicarán las reglas de descuento configuradas.'}
                        </Typography>
                    </Box>
                );
            case 2: // Resultado
                if (operationLoading) {
                    return (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                            <CircularProgress sx={{ mb: 2 }} />
                            <Typography>Generando cuotas masivamente, por favor espere...</Typography>
                        </Box>
                    );
                }
                if (error) {
                    return (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6" color="error">Error en la generación</Typography>
                            <Typography>{error}</Typography>
                        </Box>
                    );
                }
                return (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>¡Generación Completa!</Typography>
                        <Typography variant="body1">
                            Se han generado <strong>{resultData?.generated}</strong> cuotas exitosamente.
                        </Typography>

                        {FEATURES.MOTOR_DESCUENTOS && resultData?.resumenDescuentos && (
                            <Paper variant="outlined" sx={{ mt: 3, p: 2, textAlign: 'left' }}>
                                <Typography variant="subtitle2" gutterBottom>Resumen de Descuentos:</Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption">Socios beneficiados</Typography>
                                        <Typography variant="h6">{resultData.resumenDescuentos.totalSociosConDescuento}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption">Total descontado</Typography>
                                        <Typography variant="h6">${resultData.resumenDescuentos.montoTotalDescuentos}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        )}
                    </Box>
                );
            default:
                return 'Paso desconocido';
        }
    };

    return (
        <Dialog open={open} onClose={activeStep === 2 ? onClose : undefined} maxWidth="md" fullWidth>
            <DialogTitle>Generación Masiva de Cuotas</DialogTitle>
            <DialogContent>
                <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 2 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <Divider />
                {renderStepContent(activeStep)}
            </DialogContent>
            <DialogActions>
                {activeStep === 0 && (
                    <Button onClick={onClose}>Cancelar</Button>
                )}
                {activeStep === 1 && (
                    <Button onClick={handleBack}>Atrás</Button>
                )}
                {activeStep === 0 && (
                    <Button variant="contained" onClick={handleNext} disabled={!isValid}>
                        Validar
                    </Button>
                )}
                {activeStep === 1 && (
                    <Button variant="contained" onClick={handleNext} disabled={!validacionGeneracion?.puedeGenerar || loading}>
                        Generar Cuotas
                    </Button>
                )}
                {activeStep === 2 && !operationLoading && (
                    <Button variant="contained" onClick={onClose} color="primary">
                        Finalizar
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default GeneracionMasivaModal;
