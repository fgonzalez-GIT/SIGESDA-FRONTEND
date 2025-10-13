import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchSeccion, deleteSeccion } from '../../store/slices/seccionesSlice';
import { showNotification } from '../../store/slices/uiSlice';
import InfoGeneralTab from '../../components/secciones/tabs/InfoGeneralTab';
import HorariosTab from '../../components/secciones/tabs/HorariosTab';
import DocentesTab from '../../components/secciones/tabs/DocentesTab';
import ParticipantesTab from '../../components/secciones/tabs/ParticipantesTab';
import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Tabs,
  Tab
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
  AccessTime as ClockIcon,
  Person as PersonIcon,
  People as PeopleIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`seccion-tabpanel-${index}`}
      aria-labelledby={`seccion-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `seccion-tab-${index}`,
    'aria-controls': `seccion-tabpanel-${index}`,
  };
}

const SeccionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { seccionActual: seccion, loading } = useAppSelector(state => state.secciones);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchSeccion({ id, detallada: true }));
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (id) {
      try {
        await dispatch(deleteSeccion(id)).unwrap();
        dispatch(showNotification({
          message: 'Sección eliminada exitosamente',
          severity: 'success'
        }));
        navigate('/secciones');
      } catch (error) {
        dispatch(showNotification({
          message: 'Error al eliminar la sección',
          severity: 'error'
        }));
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading || !seccion) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/secciones')}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            {seccion.nombre}
          </Typography>
          <Chip
            label={seccion.activa ? 'Activa' : 'Inactiva'}
            color={seccion.activa ? 'success' : 'default'}
          />
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/secciones/${id}/edit`)}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Eliminar
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="sección tabs">
            <Tab icon={<InfoIcon />} label="Información General" {...a11yProps(0)} />
            <Tab icon={<ClockIcon />} label="Horarios" {...a11yProps(1)} />
            <Tab icon={<PersonIcon />} label="Docentes" {...a11yProps(2)} />
            <Tab icon={<PeopleIcon />} label="Participantes" {...a11yProps(3)} />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <InfoGeneralTab seccion={seccion} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <HorariosTab seccionId={seccion.id} horarios={seccion.horarios} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <DocentesTab
              seccionId={seccion.id}
              docentes={seccion.docentes}
              horarios={seccion.horarios}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <ParticipantesTab seccion={seccion} />
          </TabPanel>
        </Box>
      </Paper>

      {/* Dialog de Confirmación de Eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar la sección "{seccion.nombre}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeccionDetailPage;
