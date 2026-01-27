import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchDesgloseCuota, fetchItemsCuota, recalcularCuota, deleteCuota } from '../../store/slices/cuotasSlice';
import { Cuota, ItemCuota } from '../../types/cuota.types';
import { FEATURES } from '../../config/features';
import AgregarItemModal from './AgregarItemModal';
import BloqueAccordeonCuota from './BloqueAccordeonCuota';

interface DetalleCuotaModalProps {
    open: boolean;
    onClose: () => void;
    cuota: Cuota | null;
}

const DetalleCuotaModal: React.FC<DetalleCuotaModalProps> = ({ open, onClose, cuota }) => {
    const dispatch = useAppDispatch();
    const { itemsCuota, desgloseCuota, loading } = useAppSelector(state => state.cuotas);
    const [openAgregarItem, setOpenAgregarItem] = useState(false);
    const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

    const handleAccordionChange = (panel: string) => (
        event: React.SyntheticEvent,
        isExpanded: boolean
    ) => {
        setExpandedAccordion(isExpanded ? panel : false);
    };

    useEffect(() => {
        if (open && cuota) {
            if (FEATURES.CUOTAS_V2) {
                dispatch(fetchDesgloseCuota(cuota.id));
                dispatch(fetchItemsCuota(cuota.id));
            }
        }
    }, [open, cuota, dispatch]);

    const handleRecalcular = async () => {
        if (cuota) {
            // Recalcular con todas las opciones activas
            await dispatch(recalcularCuota({
                id: cuota.id,
                options: { aplicarAjustes: true, aplicarDescuentos: true, aplicarExenciones: true }
            }));
            // Refresh
            dispatch(fetchDesgloseCuota(cuota.id));
        }
    };

    const handleAgregarItem = () => {
        setOpenAgregarItem(true);
    };

    const handleCloseAgregarItem = () => {
        setOpenAgregarItem(false);
    };

    const handleItemAgregado = () => {
        setOpenAgregarItem(false);
        // Refresh desglose después de agregar ítem
        if (cuota) {
            dispatch(fetchDesgloseCuota(cuota.id));
            dispatch(fetchItemsCuota(cuota.id));
        }
    };

    if (!cuota) return null;

    // Debug: Verificar datos del socio (TEMPORAL - remover después de testing)
    if (open && cuota) {
        console.log('🔍 Debug DetalleCuotaModal:', {
            cuotaId: cuota.id,
            reciboNumero: cuota.recibo?.numero,
            receptor: cuota.recibo?.receptor,
            receptorNombre: cuota.recibo?.receptor?.nombre,
            receptorApellido: cuota.recibo?.receptor?.apellido
        });
    }

    // Renderiza una sección de la tabla con su título y subtotal
    const renderTableSection = (items: ItemCuota[], title: string, showDivider: boolean = true) => {
        if (!items || items.length === 0) return null;

        const subtotal = items.reduce((acc, item) => acc + (item.monto * item.cantidad), 0);

        return (
            <React.Fragment>
                {showDivider && <TableRow><TableCell colSpan={5} sx={{ p: 0 }}><Divider /></TableCell></TableRow>}
                <TableRow>
                    <TableCell colSpan={5} sx={{ bgcolor: 'grey.50', py: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">{title}</Typography>
                    </TableCell>
                </TableRow>
                {items.map((item) => {
                    const montoTotal = item.monto * item.cantidad;
                    const esPositivo = montoTotal >= 0;
                    return (
                        <TableRow key={item.id}>
                            <TableCell>{item.concepto}</TableCell>
                            <TableCell align="right">
                                {esPositivo ? (
                                    <Typography color="success.dark" fontWeight="medium">
                                        ${Math.abs(montoTotal).toFixed(2)}
                                    </Typography>
                                ) : (
                                    <Typography color="text.disabled">-</Typography>
                                )}
                            </TableCell>
                            <TableCell align="right">
                                {!esPositivo ? (
                                    <Typography color="error.main" fontWeight="medium">
                                        ${Math.abs(montoTotal).toFixed(2)}
                                    </Typography>
                                ) : (
                                    <Typography color="text.disabled">-</Typography>
                                )}
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="body2">{item.cantidad}</Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                                    {item.esAutomatico ? (
                                        <Chip size="small" label="Auto" color="primary" variant="outlined" />
                                    ) : (
                                        <Chip size="small" label="Manual" color="secondary" variant="outlined" />
                                    )}
                                    {item.porcentaje && <Chip size="small" label={`${item.porcentaje}%`} color="info" variant="outlined" />}
                                </Box>
                            </TableCell>
                        </TableRow>
                    );
                })}
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell colSpan={4}>
                        <Typography variant="body2" fontWeight="bold">Subtotal {title}</Typography>
                    </TableCell>
                    <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold" color={subtotal >= 0 ? 'success.dark' : 'error.main'}>
                            ${Math.abs(subtotal).toFixed(2)}
                        </Typography>
                    </TableCell>
                </TableRow>
            </React.Fragment>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Detalle de Cuota #{cuota.recibo.numero}
                <Typography variant="subtitle2" color="text.secondary">
                    {cuota.recibo?.receptor?.nombre} {cuota.recibo?.receptor?.apellido}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                    {cuota.anio}-{cuota.mes.toString().padStart(2, '0')} | {cuota.categoria?.nombre || 'Sin categoría'}
                </Typography>
            </DialogTitle>
            <DialogContent dividers>
                {FEATURES.CUOTAS_V2 ? (
                    // Vista V2 con desglose detallado de ítems
                    loading || !desgloseCuota ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                    ) : (
                        <Box>
                            {/* Acordeones con 3 bloques */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                {/* BLOQUE 1: Monto Base */}
                                <BloqueAccordeonCuota
                                    panel="base"
                                    title="MONTO BASE"
                                    tipoBloque="BASE"
                                    items={desgloseCuota.desglose['BASE']?.items || []}
                                    expanded={expandedAccordion === 'base'}
                                    onChange={handleAccordionChange('base')}
                                />

                                {/* BLOQUE 2: Actividades */}
                                <BloqueAccordeonCuota
                                    panel="actividad"
                                    title="ACTIVIDADES"
                                    tipoBloque="ACTIVIDAD"
                                    items={desgloseCuota.desglose['ACTIVIDAD']?.items || []}
                                    expanded={expandedAccordion === 'actividad'}
                                    onChange={handleAccordionChange('actividad')}
                                />

                                {/* BLOQUE 3: Descuentos y Beneficios (agrupa DESCUENTO + RECARGO + OTRO) */}
                                <BloqueAccordeonCuota
                                    panel="descuentos"
                                    title="DESCUENTOS Y BENEFICIOS"
                                    tipoBloque="DESCUENTOS"
                                    items={[
                                        ...(desgloseCuota.desglose['DESCUENTO']?.items || []),
                                        ...(desgloseCuota.desglose['RECARGO']?.items || []),
                                        ...(desgloseCuota.desglose['OTRO']?.items || [])
                                    ]}
                                    expanded={expandedAccordion === 'descuentos'}
                                    onChange={handleAccordionChange('descuentos')}
                                />
                            </Box>

                            {/* Total final */}
                            <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', mt: 2 }}>
                                <Grid container alignItems="center">
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="h6">TOTAL A PAGAR</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }} textAlign="right">
                                        <Typography variant="h4" fontWeight="bold">
                                            ${desgloseCuota.totales.total.toFixed(2)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Box>
                    )
                ) : (
                    // Vista V1 simplificada (sin desglose de ítems)
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" color="text.secondary">Información Básica</Typography>
                                <Divider sx={{ my: 1 }} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Socio:</Typography>
                                <Typography variant="body1">{cuota.recibo.receptor?.nombre} {cuota.recibo.receptor?.apellido}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Período:</Typography>
                                <Typography variant="body1">{cuota.mes}/{cuota.anio}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Categoría:</Typography>
                                <Typography variant="body1">{cuota.categoria?.nombre || 'Sin categoría'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Estado:</Typography>
                                <Chip label={cuota.recibo.estado} color={cuota.recibo.estado === 'PAGADO' ? 'success' : 'warning'} size="small" />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 2 }} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Monto Base:</Typography>
                                <Typography variant="h6">${cuota.montoBase?.toFixed(2) || '0.00'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Actividades:</Typography>
                                <Typography variant="h6">${cuota.montoActividades?.toFixed(2) || '0.00'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', mt: 1 }}>
                                    <Grid container alignItems="center">
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="h6">TOTAL A PAGAR</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }} textAlign="right">
                                            <Typography variant="h4" fontWeight="bold">
                                                ${cuota.montoTotal?.toFixed(2) || '0.00'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cerrar</Button>
                {FEATURES.RECALCULO_CUOTAS && cuota.recibo.estado !== 'PAGADO' && (
                    <>
                        <Button onClick={handleRecalcular} color="warning">Recalcular</Button>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleAgregarItem}
                        >
                            Agregar Ítem Manual
                        </Button>
                    </>
                )}
            </DialogActions>

            {/* Modal para agregar ítem manual */}
            <AgregarItemModal
                open={openAgregarItem}
                onClose={handleCloseAgregarItem}
                cuotaId={cuota.id}
                onSuccess={handleItemAgregado}
            />
        </Dialog>
    );
};

export default DetalleCuotaModal;
