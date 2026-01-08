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

interface DetalleCuotaModalProps {
    open: boolean;
    onClose: () => void;
    cuota: Cuota | null;
}

const DetalleCuotaModal: React.FC<DetalleCuotaModalProps> = ({ open, onClose, cuota }) => {
    const dispatch = useAppDispatch();
    const { itemsCuota, desgloseCuota, loading } = useAppSelector(state => state.cuotas);
    const [openAgregarItem, setOpenAgregarItem] = useState(false);

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

    const renderItemsTable = (items: ItemCuota[], title: string) => (
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>{title}</Typography>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell>Concepto</TableCell>
                            <TableCell align="right">Monto</TableCell>
                            <TableCell align="center">Info</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">Sin items</TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.concepto}</TableCell>
                                    <TableCell align="right">
                                        <Typography color={item.monto < 0 ? 'success.main' : 'text.primary'}>
                                            ${Math.abs(item.monto).toFixed(2)} {item.monto < 0 && '(Desc.)'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box>
                                            {item.esAutomatico && <Chip size="small" label="Auto" color="primary" variant="outlined" sx={{ mr: 0.5 }} />}
                                            {item.porcentaje && <Chip size="small" label={`${item.porcentaje}%`} color="info" variant="outlined" />}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Detalle de Cuota #{cuota.recibo.numero}
                <Typography variant="subtitle2" color="text.secondary">
                    {cuota.anio}-{cuota.mes.toString().padStart(2, '0')} | {cuota.categoria}
                </Typography>
            </DialogTitle>
            <DialogContent dividers>
                {FEATURES.CUOTAS_V2 ? (
                    // Vista V2 con desglose detallado de ítems
                    loading || !desgloseCuota ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                    ) : (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                {desgloseCuota.desglose['BASE'] && renderItemsTable(desgloseCuota.desglose['BASE'].items, 'Cuota Base')}
                                {desgloseCuota.desglose['ACTIVIDAD'] && renderItemsTable(desgloseCuota.desglose['ACTIVIDAD'].items, 'Actividades')}
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                {desgloseCuota.desglose['DESCUENTO'] && renderItemsTable(desgloseCuota.desglose['DESCUENTO'].items, 'Descuentos y Beneficios')}
                                {desgloseCuota.desglose['RECARGO'] && renderItemsTable(desgloseCuota.desglose['RECARGO'].items, 'Recargos')}
                                {desgloseCuota.desglose['OTRO'] && renderItemsTable(desgloseCuota.desglose['OTRO'].items, 'Otros Conceptos')}

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
                            </Grid>
                        </Grid>
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
                                <Typography variant="body1">{cuota.categoria}</Typography>
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
                            disabled={cuota.recibo.estado === 'PAGADO'}
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
