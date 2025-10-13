import React, { useState } from 'react';
import seccionesApi from '../../../services/seccionesApi';
import { useAppDispatch } from '../../../hooks/redux';
import { fetchSeccion } from '../../../store/slices/seccionesSlice';
import { showNotification } from '../../../store/slices/uiSlice';
import { DocenteSeccion } from '../../../types/seccion.types';
import DocenteSelector from '../DocenteSelector';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  PersonAdd as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material';

interface DocentesTabProps {
  seccionId: string;
  docentes: DocenteSeccion[];
  horarios: any[];
}

export const DocentesTab: React.FC<DocentesTabProps> = ({ seccionId, docentes, horarios }) => {
  const dispatch = useAppDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDocentes, setSelectedDocentes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (selectedDocentes.length === 0) {
      dispatch(showNotification({
        message: 'Debe seleccionar al menos un docente',
        severity: 'warning'
      }));
      return;
    }

    setLoading(true);
    try {
      // Asignar cada docente
      for (const docenteId of selectedDocentes) {
        await seccionesApi.asignarDocente(seccionId, { docenteId });
      }

      dispatch(showNotification({
        message: 'Docentes asignados exitosamente',
        severity: 'success'
      }));

      // Recargar la sección
      dispatch(fetchSeccion({ id: seccionId, detallada: true }));
      setDialogOpen(false);
      setSelectedDocentes([]);
    } catch (error: any) {
      dispatch(showNotification({
        message: error?.response?.data?.error || 'Error al asignar docentes',
        severity: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (docenteId: string) => {
    if (!window.confirm('¿Está seguro que desea remover este docente?')) {
      return;
    }

    try {
      await seccionesApi.removerDocente(seccionId, docenteId);
      dispatch(showNotification({
        message: 'Docente removido exitosamente',
        severity: 'success'
      }));
      dispatch(fetchSeccion({ id: seccionId, detallada: true }));
    } catch (error: any) {
      dispatch(showNotification({
        message: error?.response?.data?.error || 'Error al remover docente',
        severity: 'error'
      }));
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Docentes Asignados</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Asignar Docente
        </Button>
      </Box>

      {docentes.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No hay docentes asignados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Asigne docentes a esta sección
          </Typography>
        </Box>
      ) : (
        <List>
          {docentes.map(docente => (
            <React.Fragment key={docente.id}>
              <ListItem
                secondaryAction={
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleRemove(docente.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${docente.nombre} ${docente.apellido}`}
                  secondary={docente.especialidad || 'Sin especialidad'}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Dialog para asignar docentes */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Asignar Docentes</DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <DocenteSelector
              selectedDocentes={selectedDocentes}
              horarios={horarios}
              onChange={setSelectedDocentes}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleAdd}
            variant="contained"
            disabled={selectedDocentes.length === 0 || loading}
          >
            {loading ? 'Asignando...' : 'Asignar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocentesTab;
