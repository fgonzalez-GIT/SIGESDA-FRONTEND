import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Alert,
    Typography,
    Box,
    Paper,
    Chip
} from '@mui/material';
import { useAppDispatch } from '../../store';
import { exencionesService } from '../../services/exencionesService';
import { ExencionCuota, TipoExencion, MotivoExencion } from '../../types/cuota.types';

interface GestionExencionesModalProps {
    open: boolean;
    onClose: () => void;
    personaId: number | null;
    nombrePersona?: string;
}

const GestionExencionesModal: React.FC<GestionExencionesModalProps> = ({ open, onClose, personaId, nombrePersona }) => {
    const [exencionActiva, setExencionActiva] = useState<ExencionCuota | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form for new request
    const [isCreating, setIsCreating] = useState(false);
    const [newRequest, setNewRequest] = useState<{
        tipoExencion: TipoExencion;
        motivoExencion: MotivoExencion;
        porcentaje: number;
        fechaInicio: string;
        fechaFin: string;
        justificacion: string;
    }>({
        tipoExencion: 'TOTAL',
        motivoExencion: 'SITUACION_ECONOMICA',
        porcentaje: 100,
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        justificacion: ''
    });

    useEffect(() => {
        if (open && personaId) {
            checkStatus();
        }
    }, [open, personaId]);

    const checkStatus = async () => {
        if (!personaId) return;
        setLoading(true);
        try {
            const result = await exencionesService.checkExencionActiva(personaId);
            if (result.tieneExencion && result.exencion) {
                setExencionActiva(result.exencion);
                setIsCreating(false);
            } else {
                setExencionActiva(null);
            }
        } catch (err) {
            console.error(err);
            setError('Error al verificar estado de exenciones');
        } finally {
            setLoading(false);
        }
    };

    const handleSolicitar = async () => {
        if (!personaId) return;
        try {
            await exencionesService.solicitarExencion({
                personaId,
                ...newRequest
            });
            await checkStatus();
        } catch (err) {
            console.error(err);
            setError('Error al solicitar exención');
        }
    };

    const handleRevocar = async () => {
        if (!exencionActiva) return;
        if (window.confirm('¿Revocar exención vigente?')) {
            try {
                await exencionesService.revocarExencion(exencionActiva.id, {
                    motivoRevocacion: 'Solicitado por administrador',
                    usuario: 'Current User' // Should come from auth context
                });
                checkStatus();
            } catch (err) {
                console.error(err);
                setError('Error al revocar exención');
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Gestión de Exenciones
                {nombrePersona && <Typography variant="subtitle2" color="text.secondary">Socio: {nombrePersona}</Typography>}
            </DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {exencionActiva ? (
                    <Box component={Paper} variant="outlined" sx={{ p: 2, bgcolor: 'info.lighter' }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            Exención Vigente
                            <Chip size="small" label={exencionActiva.estado} color="success" sx={{ ml: 1 }} />
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Tipo:</Typography>
                                <Typography variant="body1">{exencionActiva.tipoExencion} ({exencionActiva.porcentaje}%)</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Motivo:</Typography>
                                <Typography variant="body1">{exencionActiva.motivoExencion.replace('_', ' ')}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Vigencia:</Typography>
                                <Typography variant="body1">{new Date(exencionActiva.fechaInicio).toLocaleDateString()} - {exencionActiva.fechaFin ? new Date(exencionActiva.fechaFin).toLocaleDateString() : 'Indefinido'}</Typography>
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 2 }}>
                            <Button variant="outlined" color="error" onClick={handleRevocar}>
                                Revocar Exención
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box>
                        {!isCreating ? (
                            <Box textAlign="center" py={3}>
                                <Typography gutterBottom>El socio no posee exenciones activas.</Typography>
                                <Button variant="contained" onClick={() => setIsCreating(true)}>
                                    Solicitar Nueva Exención
                                </Button>
                            </Box>
                        ) : (
                            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                <Grid size={{ xs: 12 }}>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        La exención se creará en estado PENDIENTE y requerirá aprobación.
                                    </Alert>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tipo</InputLabel>
                                        <Select
                                            value={newRequest.tipoExencion}
                                            label="Tipo"
                                            onChange={e => setNewRequest({ ...newRequest, tipoExencion: e.target.value as any })}
                                        >
                                            <MenuItem value="TOTAL">Total (100%)</MenuItem>
                                            <MenuItem value="PARCIAL">Parcial</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Porcentaje"
                                        type="number"
                                        disabled={newRequest.tipoExencion === 'TOTAL'}
                                        value={newRequest.tipoExencion === 'TOTAL' ? 100 : newRequest.porcentaje}
                                        onChange={e => setNewRequest({ ...newRequest, porcentaje: Number(e.target.value) })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Motivo</InputLabel>
                                        <Select
                                            value={newRequest.motivoExencion}
                                            label="Motivo"
                                            onChange={e => setNewRequest({ ...newRequest, motivoExencion: e.target.value as any })}
                                        >
                                            <MenuItem value="SITUACION_ECONOMICA">Situación Económica</MenuItem>
                                            <MenuItem value="BECA">Beca</MenuItem>
                                            <MenuItem value="SOCIO_FUNDADOR">Socio Fundador</MenuItem>
                                            <MenuItem value="MERITO_ACADEMICO">Mérito Académico</MenuItem>
                                            <MenuItem value="OTRO">Otro</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Fecha Inicio"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        value={newRequest.fechaInicio}
                                        onChange={e => setNewRequest({ ...newRequest, fechaInicio: e.target.value })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Fecha Fin"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        value={newRequest.fechaFin}
                                        onChange={e => setNewRequest({ ...newRequest, fechaFin: e.target.value })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Justificación"
                                        value={newRequest.justificacion}
                                        onChange={e => setNewRequest({ ...newRequest, justificacion: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cerrar</Button>
                {isCreating && (
                    <Button variant="contained" onClick={handleSolicitar} disabled={!newRequest.justificacion}>
                        Solicitar
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default GestionExencionesModal;
