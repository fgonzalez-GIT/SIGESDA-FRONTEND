import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Box,
    Fab,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Chip,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Block as BlockIcon
} from '@mui/icons-material';
import { useAppDispatch } from '../../store';
import { ajustesCuotaService } from '../../services/ajustesCuotaService';
import { AjusteCuotaSocio, TipoAjusteCuota, AplicaA } from '../../types/cuota.types';

interface GestionAjustesModalProps {
    open: boolean;
    onClose: () => void;
    personaId: number | null;
    nombrePersona?: string;
}

const GestionAjustesModal: React.FC<GestionAjustesModalProps> = ({ open, onClose, personaId, nombrePersona }) => {
    const dispatch = useAppDispatch();
    const [ajustes, setAjustes] = useState<AjusteCuotaSocio[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [newItem, setNewItem] = useState<{
        tipoAjuste: TipoAjusteCuota;
        valor: number;
        concepto: string;
        motivo: string;
        fechaInicio: string;
        aplicaA: AplicaA;
    }>({
        tipoAjuste: 'DESCUENTO_PORCENTAJE',
        valor: 0,
        concepto: '',
        motivo: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        aplicaA: 'TOTAL_CUOTA'
    });

    useEffect(() => {
        if (open && personaId) {
            loadAjustes();
        }
    }, [open, personaId]);

    const loadAjustes = async () => {
        if (!personaId) return;
        setLoading(true);
        try {
            const data = await ajustesCuotaService.getAjustesPorPersona(personaId, false); // Get all (active and inactive)
            setAjustes(data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar ajustes');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!personaId) return;
        try {
            await ajustesCuotaService.createAjuste({
                personaId,
                ...newItem,
                activo: true
            });
            setIsEditing(false);
            loadAjustes();
            // Reset form
            setNewItem({
                tipoAjuste: 'DESCUENTO_PORCENTAJE',
                valor: 0,
                concepto: '',
                motivo: '',
                fechaInicio: new Date().toISOString().split('T')[0],
                aplicaA: 'TOTAL_CUOTA'
            });
        } catch (err) {
            console.error(err);
            setError('Error al crear ajuste');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Eliminar este ajuste?')) {
            try {
                await ajustesCuotaService.deleteAjuste(id);
                loadAjustes();
            } catch (err) {
                console.error(err);
                setError('Error al eliminar ajuste');
            }
        }
    };

    const getTipoLabel = (tipo: string) => {
        switch (tipo) {
            case 'DESCUENTO_PORCENTAJE': return 'Desc. %';
            case 'DESCUENTO_FIJO': return 'Desc. Fijo';
            case 'RECARGO_PORCENTAJE': return 'Recargo %';
            case 'RECARGO_FIJO': return 'Recargo Fijo';
            default: return tipo;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Ajustes de Cuota
                {nombrePersona && <Typography variant="subtitle2" color="text.secondary">Socio: {nombrePersona}</Typography>}
            </DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {!isEditing ? (
                    <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">Ajustes Activos</Typography>
                            <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => setIsEditing(true)}>
                                Nuevo Ajuste
                            </Button>
                        </Box>
                        <List>
                            {ajustes.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" align="center">No hay ajustes registrados.</Typography>
                            ) : (
                                ajustes.map((ajuste) => (
                                    <ListItem key={ajuste.id} divider>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {ajuste.concepto}
                                                    {!ajuste.activo && <Chip size="small" label="Inactivo" />}
                                                </Box>
                                            }
                                            secondary={`${getTipoLabel(ajuste.tipoAjuste)}: ${ajuste.valor} - ${ajuste.aplicaA}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(ajuste.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Box>
                ) : (
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Concepto"
                                value={newItem.concepto}
                                onChange={e => setNewItem({ ...newItem, concepto: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    value={newItem.tipoAjuste}
                                    label="Tipo"
                                    onChange={e => setNewItem({ ...newItem, tipoAjuste: e.target.value as any })}
                                >
                                    <MenuItem value="DESCUENTO_PORCENTAJE">Descuento %</MenuItem>
                                    <MenuItem value="DESCUENTO_FIJO">Descuento Fijo</MenuItem>
                                    <MenuItem value="RECARGO_PORCENTAJE">Recargo %</MenuItem>
                                    <MenuItem value="RECARGO_FIJO">Recargo Fijo</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                fullWidth
                                label="Valor"
                                type="number"
                                value={newItem.valor}
                                onChange={e => setNewItem({ ...newItem, valor: Number(e.target.value) })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                fullWidth
                                label="Fecha Inicio"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={newItem.fechaInicio}
                                onChange={e => setNewItem({ ...newItem, fechaInicio: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Aplica A</InputLabel>
                                <Select
                                    value={newItem.aplicaA}
                                    label="Aplica A"
                                    onChange={e => setNewItem({ ...newItem, aplicaA: e.target.value as any })}
                                >
                                    <MenuItem value="TOTAL_CUOTA">Total Cuota</MenuItem>
                                    <MenuItem value="BASE">Solo Base</MenuItem>
                                    <MenuItem value="ACTIVIDADES">Solo Actividades</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Motivo (Interno)"
                                value={newItem.motivo}
                                onChange={e => setNewItem({ ...newItem, motivo: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => isEditing ? setIsEditing(false) : onClose()}>
                    {isEditing ? 'Cancelar' : 'Cerrar'}
                </Button>
                {isEditing && (
                    <Button variant="contained" onClick={handleCreate} disabled={!newItem.concepto || !newItem.valor}>
                        Guardar
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default GestionAjustesModal;
