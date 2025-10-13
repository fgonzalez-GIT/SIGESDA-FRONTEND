import React, { useState } from 'react';
import seccionesApi from '../../../services/seccionesApi';
import { useAppDispatch } from '../../../hooks/redux';
import { fetchSeccion } from '../../../store/slices/seccionesSlice';
import { showNotification } from '../../../store/slices/uiSlice';
import { CreateHorarioDto, HorarioSeccion } from '../../../types/seccion.types';
import HorarioInputs from '../HorarioInputs';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface HorariosTabProps {
  seccionId: string;
  horarios: HorarioSeccion[];
}

export const HorariosTab: React.FC<HorariosTabProps> = ({ seccionId, horarios }) => {
  const dispatch = useAppDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nuevosHorarios, setNuevosHorarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (nuevosHorarios.length === 0) {
      dispatch(showNotification({
        message: 'Debe agregar al menos un horario',
        severity: 'warning'
      }));
      return;
    }

    setLoading(true);
    try {
      // Enviar cada horario al backend
      for (const horario of nuevosHorarios) {
        await seccionesApi.addHorario(seccionId, horario);
      }

      dispatch(showNotification({
        message: 'Horarios agregados exitosamente',
        severity: 'success'
      }));

      // Recargar la sección
      dispatch(fetchSeccion({ id: seccionId, detallada: true }));
      setDialogOpen(false);
      setNuevosHorarios([]);
    } catch (error: any) {
      dispatch(showNotification({
        message: error?.response?.data?.error || 'Error al agregar horarios',
        severity: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (horarioId: string) => {
    if (!window.confirm('¿Está seguro que desea eliminar este horario?')) {
      return;
    }

    try {
      await seccionesApi.deleteHorario(horarioId);
      dispatch(showNotification({
        message: 'Horario eliminado exitosamente',
        severity: 'success'
      }));
      dispatch(fetchSeccion({ id: seccionId, detallada: true }));
    } catch (error: any) {
      dispatch(showNotification({
        message: error?.response?.data?.error || 'Error al eliminar horario',
        severity: 'error'
      }));
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Horarios Configurados</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Agregar Horario
        </Button>
      </Box>

      {horarios.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No hay horarios configurados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Agregue horarios para esta sección
          </Typography>
        </Box>
      ) : (
        <List>
          {horarios.map(horario => (
            <React.Fragment key={horario.id}>
              <ListItem
                secondaryAction={
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleDelete(horario.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight="medium">
                        {horario.diaSemana}
                      </Typography>
                      <Chip
                        label={horario.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={horario.activo ? 'success' : 'default'}
                      />
                    </Box>
                  }
                  secondary={`${horario.horaInicio} - ${horario.horaFin}`}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Dialog para agregar horarios */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Agregar Horarios</DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <HorarioInputs horarios={nuevosHorarios} onChange={setNuevosHorarios} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleAdd}
            variant="contained"
            disabled={nuevosHorarios.length === 0 || loading}
          >
            {loading ? 'Guardando...' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HorariosTab;
