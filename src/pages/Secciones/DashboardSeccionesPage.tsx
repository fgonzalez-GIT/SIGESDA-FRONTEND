import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import seccionesApi from '../../services/seccionesApi';
import { OcupacionGlobalResponse } from '../../types/seccion.types';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  TrendingUp as TrendingIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  EventAvailable as EventIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  MeetingRoom as RoomIcon
} from '@mui/icons-material';

const DashboardSeccionesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ocupacion, setOcupacion] = useState<OcupacionGlobalResponse | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await seccionesApi.getOcupacionGlobal();
      setOcupacion(response.data);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !ocupacion) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const ocupacionPorcentaje = ocupacion.ocupacionPromedio;

  // Secciones por estado de ocupación
  const seccionesLlenas = ocupacion.detalle.filter(s => s.ocupacion >= 100);
  const seccionesCasiLlenas = ocupacion.detalle.filter(s => s.ocupacion >= 80 && s.ocupacion < 100);
  const seccionesDisponibles = ocupacion.detalle.filter(s => s.ocupacion < 80);

  // Top secciones con más participantes
  const topSecciones = [...ocupacion.detalle]
    .sort((a, b) => b.participantes - a.participantes)
    .slice(0, 5);

  // Calcular totales
  const totalParticipantes = ocupacion.detalle.reduce((acc, s) => acc + s.participantes, 0);
  const totalCapacidad = ocupacion.detalle.reduce((acc, s) => acc + (s.capacidad || 0), 0);

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
          <Box>
            <Typography variant="h4" component="h1">
              Dashboard de Secciones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estadísticas y ocupación global del sistema
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Estadísticas Principales */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Secciones
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {ocupacion.totalSecciones}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    secciones activas
                  </Typography>
                </Box>
                <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Participantes Activos
                  </Typography>
                  <Typography variant="h3" color="success.main">
                    {totalParticipantes}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    de {totalCapacidad || '∞'}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 60, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Ocupación Global
                  </Typography>
                  <Typography
                    variant="h3"
                    color={ocupacionPorcentaje >= 80 ? 'error.main' : 'info.main'}
                  >
                    {ocupacionPorcentaje}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={ocupacionPorcentaje}
                    color={ocupacionPorcentaje >= 80 ? 'error' : 'info'}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <TrendingIcon sx={{ fontSize: 60, color: 'info.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Horarios Activos
                  </Typography>
                  <Typography variant="h3" color="secondary.main">
                    {ocupacion.detalle.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    slots semanales
                  </Typography>
                </Box>
                <EventIcon sx={{ fontSize: 60, color: 'secondary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertas y Estado de Secciones */}
      <Grid container spacing={3} mb={3}>
        {seccionesLlenas.length > 0 && (
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <WarningIcon />
                  <Typography variant="h6">
                    Secciones Llenas
                  </Typography>
                </Box>
                <Typography variant="h3" mb={1}>
                  {seccionesLlenas.length}
                </Typography>
                <Typography variant="body2">
                  Secciones que alcanzaron su capacidad máxima
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {seccionesCasiLlenas.length > 0 && (
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <InfoIcon />
                  <Typography variant="h6">
                    Casi Llenas
                  </Typography>
                </Box>
                <Typography variant="h3" mb={1}>
                  {seccionesCasiLlenas.length}
                </Typography>
                <Typography variant="body2">
                  Secciones con más del 80% de ocupación
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CheckIcon />
                <Typography variant="h6">
                  Con Disponibilidad
                </Typography>
              </Box>
              <Typography variant="h3" mb={1}>
                {seccionesDisponibles.length}
              </Typography>
              <Typography variant="body2">
                Secciones con cupos disponibles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top 5 Secciones */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top 5 Secciones con Más Participantes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {topSecciones.map((seccion, index) => {
                const ocupacionSeccion = seccion.ocupacion;

                return (
                  <ListItem
                    key={seccion.seccionId}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      borderRadius: 1,
                      mb: 1
                    }}
                    onClick={() => navigate(`/secciones/${seccion.seccionId}`)}
                  >
                    <ListItemIcon>
                      <Chip
                        label={`#${index + 1}`}
                        color="primary"
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="medium" component="span">
                            {seccion.seccion}
                          </Typography>
                          {ocupacionSeccion >= 100 && (
                            <Chip label="LLENA" size="small" color="error" />
                          )}
                          {ocupacionSeccion >= 80 && ocupacionSeccion < 100 && (
                            <Chip label="CASI LLENA" size="small" color="warning" />
                          )}
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {seccion.actividad}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <Chip
                              label={`${seccion.participantes} participantes`}
                              size="small"
                              color="success"
                            />
                            {seccion.capacidad && (
                              <>
                                <LinearProgress
                                  variant="determinate"
                                  value={ocupacionSeccion}
                                  sx={{ flex: 1, maxWidth: 100 }}
                                  color={ocupacionSeccion >= 80 ? 'error' : 'primary'}
                                />
                                <Typography variant="caption" component="span">
                                  {ocupacionSeccion}%
                                </Typography>
                              </>
                            )}
                          </Box>
                        </React.Fragment>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Secciones que Requieren Atención */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Secciones que Requieren Atención
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {seccionesLlenas.length === 0 && seccionesCasiLlenas.length === 0 ? (
              <Alert severity="success" icon={<CheckIcon />}>
                <Typography variant="body2">
                  Todas las secciones tienen disponibilidad adecuada
                </Typography>
              </Alert>
            ) : (
              <List>
                {[...seccionesLlenas, ...seccionesCasiLlenas]
                  .slice(0, 5)
                  .map((seccion) => {
                    const ocupacionSeccion = seccion.ocupacion;
                    const esLlena = ocupacionSeccion >= 100;

                    return (
                      <ListItem
                        key={seccion.seccionId}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          borderRadius: 1,
                          mb: 1
                        }}
                        onClick={() => navigate(`/secciones/${seccion.seccionId}`)}
                      >
                        <ListItemIcon>
                          {esLlena ? (
                            <WarningIcon color="error" />
                          ) : (
                            <InfoIcon color="warning" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body1" fontWeight="medium" component="span">
                                {seccion.seccion}
                              </Typography>
                              <Chip
                                label={esLlena ? 'LLENA' : 'CASI LLENA'}
                                size="small"
                                color={esLlena ? 'error' : 'warning'}
                              />
                            </Box>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {seccion.actividad}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                <Typography variant="caption" color="text.secondary" component="span">
                                  {seccion.participantes} / {seccion.capacidad || '∞'}
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={ocupacionSeccion}
                                  sx={{ flex: 1 }}
                                  color={esLlena ? 'error' : 'warning'}
                                />
                                <Typography variant="caption" fontWeight="bold" component="span">
                                  {ocupacionSeccion}%
                                </Typography>
                              </Box>
                            </React.Fragment>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                      </ListItem>
                    );
                  })}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardSeccionesPage;
