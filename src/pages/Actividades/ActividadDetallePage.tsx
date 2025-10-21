/**
 * Página de Detalle de Actividad V2
 * Muestra información completa de una actividad con sus relaciones
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Chip,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material';

import {
  useActividad,
  useHorariosActividad,
  useDocentesActividad,
  useParticipantesActividad,
  useEstadisticasActividad,
} from '../../hooks/useActividades';
import { formatTime, formatDate } from '../../types/actividad.types';
import { EstadoBadge } from '../../components/actividades/EstadoBadge';
import { HorariosListaV2 } from '../../components/actividades/HorariosListaV2';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ActividadDetalleV2Page: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [addHorarioDialog, setAddHorarioDialog] = useState(false);

  // Hooks
  const { actividad, loading, error, refetch } = useActividad(Number(id));
  const { horarios, loading: horariosLoading } = useHorariosActividad(Number(id));
  const { docentes, loading: docentesLoading } = useDocentesActividad(Number(id));
  const { participantes, loading: participantesLoading } = useParticipantesActividad(Number(id));
  const { estadisticas, loading: estadisticasLoading } = useEstadisticasActividad(Number(id));

  // Handlers
  const handleBack = () => {
    navigate('/actividades');
  };

  const handleEdit = () => {
    navigate(`/actividades/${id}/editar`);
  };

  const handleDuplicate = () => {
    navigate(`/actividades/${id}/duplicar`);
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Reintentar
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  // Not found
  if (!actividad) {
    return (
      <Box>
        <Alert severity="warning">
          Actividad no encontrada
        </Alert>
        <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
            Volver
          </Button>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h4" component="h1">
              {actividad.nombre}
            </Typography>
            {actividad.estados_actividades && (
              <EstadoBadge estado={actividad.estados_actividades} size="medium" />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Código: {actividad.codigo_actividad}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <IconButton color="primary" onClick={handleEdit}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={handleDuplicate}>
            <CopyIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Información General */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Tipo y Categoría */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Clasificación
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Tipo
                  </Typography>
                  <Typography variant="body1">
                    {actividad.tipos_actividades?.nombre || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Categoría
                  </Typography>
                  <Typography variant="body1">
                    {actividad.categorias_actividades?.nombre || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Fechas */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CalendarIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Fechas
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Desde
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(actividad.fecha_desde)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Hasta
                  </Typography>
                  <Typography variant="body1">
                    {actividad.fecha_hasta ? formatDate(actividad.fecha_hasta) : 'Sin fecha de fin'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Cupo y Costo */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PeopleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Cupo
              </Typography>
              {actividad.cupo_maximo ? (
                <Box>
                  <Typography variant="h4" color="primary">
                    {estadisticas?.cupoDisponible || 0} / {actividad.cupo_maximo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Cupo disponible
                  </Typography>
                  {estadisticas && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {estadisticas.porcentajeOcupacion.toFixed(0)}% ocupado
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Sin límite de cupo
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Costo */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <MoneyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Costo
              </Typography>
              <Typography variant="h4" color="primary">
                ${actividad.costo.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {actividad.costo === 0 ? 'Actividad gratuita' : 'Por participante'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Descripción */}
        {actividad.descripcion && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Descripción
                </Typography>
                <Typography variant="body1">
                  {actividad.descripcion}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Tabs de Detalles */}
      <Paper>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <ScheduleIcon />
                Horarios
                {horarios.length > 0 && <Chip label={horarios.length} size="small" />}
              </Box>
            }
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <SchoolIcon />
                Docentes
                {docentes.length > 0 && <Chip label={docentes.length} size="small" />}
              </Box>
            }
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <PersonIcon />
                Participantes
                {participantes.length > 0 && <Chip label={participantes.length} size="small" />}
              </Box>
            }
          />
        </Tabs>

        {/* Tab Panel: Horarios */}
        <TabPanel value={tabValue} index={0}>
          {horariosLoading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Horarios de la Actividad</Typography>
                <Button startIcon={<AddIcon />} variant="outlined" size="small">
                  Agregar Horario
                </Button>
              </Box>
              <HorariosListaV2 horarios={horarios} showActions />
            </Box>
          )}
        </TabPanel>

        {/* Tab Panel: Docentes */}
        <TabPanel value={tabValue} index={1}>
          {docentesLoading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Docentes Asignados</Typography>
                <Button startIcon={<AddIcon />} variant="outlined" size="small">
                  Asignar Docente
                </Button>
              </Box>
              {docentes.length === 0 ? (
                <Typography color="text.secondary">
                  No hay docentes asignados
                </Typography>
              ) : (
                <List>
                  {docentes.filter(d => d.activo).map((docente) => (
                    <ListItem key={docente.id} divider>
                      <ListItemAvatar>
                        <Avatar>
                          <SchoolIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${docente.personas?.nombre} ${docente.personas?.apellido}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {docente.roles_docentes?.nombre}
                            </Typography>
                            {docente.observaciones && ` — ${docente.observaciones}`}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </TabPanel>

        {/* Tab Panel: Participantes */}
        <TabPanel value={tabValue} index={2}>
          {participantesLoading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Participantes Inscritos</Typography>
                <Button startIcon={<AddIcon />} variant="outlined" size="small">
                  Inscribir Participante
                </Button>
              </Box>
              {participantes.length === 0 ? (
                <Typography color="text.secondary">
                  No hay participantes inscritos
                </Typography>
              ) : (
                <List>
                  {participantes.filter(p => p.activo).map((participante) => (
                    <ListItem key={participante.id} divider>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${participante.personas?.nombre} ${participante.personas?.apellido}`}
                        secondary={
                          <>
                            Inscrito: {formatDate(participante.fecha_inicio)}
                            {participante.precio_especial && ` — Precio especial: $${participante.precio_especial}`}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Observaciones */}
      {actividad.observaciones && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Observaciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {actividad.observaciones}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ActividadDetalleV2Page;
