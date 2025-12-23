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
    Chip
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { generarCuotasMasivas, validarGeneracion, clearValidacion } from '../../store/slices/cuotasSlice';
import { fetchCategorias } from '../../store/slices/categoriasSlice';
import { GenerarCuotasRequest } from '../../types/cuota.types';

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
    const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
    const [anio, setAnio] = useState<number>(new Date().getFullYear());
    const [selectedCategorias, setSelectedCategorias] = useState<number[]>([]);
    const [aplicarDescuentos, setAplicarDescuentos] = useState(true);
    const [incluirInactivos, setIncluirInactivos] = useState(false);
    const [observaciones, setObservaciones] = useState('');
    const [resultData, setResultData] = useState<any>(null);

    useEffect(() => {
        if (open) {
            dispatch(fetchCategorias({}));
            dispatch(clearValidacion());
            setActiveStep(0);
            setResultData(null);
        }
    }, [open, dispatch]);

    const handleNext = async () => {
        if (activeStep === 0) {
            // Ir a validación
            dispatch(validarGeneracion({
                mes,
                anio,
                categoriaIds: selectedCategorias.length > 0 ? selectedCategorias : undefined
            }));
            setActiveStep(1);
        } else if (activeStep === 1) {
            // Ejecutar generación
            const request: GenerarCuotasRequest = {
                mes,
                anio,
                categoriaIds: selectedCategorias.length > 0 ? selectedCategorias : undefined,
                aplicarDescuentos,
                incluirInactivos,
                observaciones
            };
            const result = await dispatch(generarCuotasMasivas(request)).unwrap();
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

    const isStep1Valid = () => {
        return mes > 0 && anio > 2000;
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0: // Configuración
                return (
                    <Box sx={{ mt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Mes</InputLabel>
                                    <Select value={mes} label="Mes" onChange={(e) => setMes(Number(e.target.value))}>
                                        {[...Array(12)].map((_, i) => (
                                            <MenuItem key={i + 1} value={i + 1}>
                                                {new Date(0, i).toLocaleString('es-ES', { month: 'long' }).toUpperCase()}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Año"
                                    type="number"
                                    value={anio}
                                    onChange={(e) => setAnio(Number(e.target.value))}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Categorías (Opcional - Vacío para todas)</InputLabel>
                                    <Select
                                        multiple
                                        value={selectedCategorias}
                                        label="Categorías (Opcional - Vacío para todas)"
                                        onChange={(e) => setSelectedCategorias(e.target.value as number[])}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
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
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <FormControlLabel
                                    control={<Switch checked={aplicarDescuentos} onChange={(e) => setAplicarDescuentos(e.target.checked)} />}
                                    label="Aplicar Motor de Descuentos Automáticamente"
                                />
                                <Typography variant="caption" display="block" color="text.secondary">
                                    Si se desactiva, se generarán las cuotas base + actividades sin calcular descuentos.
                                </Typography>
                            </Grid>
                            {/* 
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch checked={incluirInactivos} onChange={(e) => setIncluirInactivos(e.target.checked)} />}
                                    label="Incluir Socios Inactivos (No recomendado)"
                                />
                            </Grid>
                            */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Observaciones"
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
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
                            {aplicarDescuentos && ' Se aplicarán las reglas de descuento configuradas.'}
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

                        {resultData?.resumenDescuentos && (
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
                    <Button variant="contained" onClick={handleNext} disabled={!isStep1Valid()}>
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
