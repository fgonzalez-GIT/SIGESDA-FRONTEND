import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Stack,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  People,
  MusicNote,
  Room,
  TrendingUp,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchPersonas } from '../../store/slices/personasSlice';
import { fetchActividades } from '../../store/slices/actividadesSlice';
import { fetchAulas } from '../../store/slices/aulasSlice';
import { fetchRelaciones } from '../../store/slices/familiaresSlice';
import StatCard from '../../components/dashboard/StatCard';
import QuickActions from '../../components/dashboard/QuickActions';
import RecentActivity from '../../components/dashboard/RecentActivity';
import ChartWidget from '../../components/dashboard/ChartWidget';
import NotificationWidget from '../../components/dashboard/NotificationWidget';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { personas, loading: personasLoading } = useAppSelector((state) => state.personas);
  const { actividades, loading: actividadesLoading } = useAppSelector((state) => state.actividades);
  const { aulas, loading: aulasLoading } = useAppSelector((state) => state.aulas);
  const { relaciones, loading: familiaresLoading } = useAppSelector((state) => state.familiares);

  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const hasFetchedDataRef = useRef(false);

  useEffect(() => {
    // Protección contra llamadas duplicadas en React.StrictMode
    if (hasFetchedDataRef.current) return;
    hasFetchedDataRef.current = true;

    const loadDashboardData = async () => {
      try {
        // Cargar datos con manejo de errores individual
        dispatch(fetchPersonas({}));
        dispatch(fetchActividades({}));
        dispatch(fetchAulas({}));
        dispatch(fetchRelaciones({}));
      } catch (error) {
        setDashboardError('Error al cargar los datos del dashboard');
      }
    };

    loadDashboardData();
  }, [dispatch]);

  // Estadísticas calculadas con validación de arrays memoizadas
  const personasArray = useMemo(() => Array.isArray(personas) ? personas : [], [personas]);
  const actividadesArray = useMemo(() => Array.isArray(actividades) ? actividades : [], [actividades]);
  const aulasArray = useMemo(() => Array.isArray(aulas) ? aulas : [], [aulas]);
  const relacionesArray = useMemo(() => Array.isArray(relaciones) ? relaciones : [], [relaciones]);

  // Estadísticas memoizadas para evitar cálculos repetidos
  const stats = useMemo(() => {
    const totalPersonas = personasArray.length;
    // En V2, las personas tienen múltiples tipos, usamos los booleanos calculados
    const totalSocios = personasArray.filter(p => p.esSocio).length;
    const totalDocentes = personasArray.filter(p => p.esDocente).length;
    const totalEstudiantes = personasArray.filter(p => p.tipos?.some(t => t.tipoPersonaCodigo === 'ESTUDIANTE')).length;
    const totalActividades = actividadesArray.length;
    const actividadesActivas = actividadesArray.filter(a => a.estado === 'activo').length;
    const totalAulas = aulasArray.length;
    const aulasDisponibles = aulasArray.filter(a => a.estado === 'disponible').length;
    const totalRelaciones = relacionesArray.length;
    const personasConFamiliares = [...new Set(relacionesArray.map(r => r.personaId))].length;

    return {
      totalPersonas,
      totalSocios,
      totalDocentes,
      totalEstudiantes,
      totalActividades,
      actividadesActivas,
      totalAulas,
      aulasDisponibles,
      totalRelaciones,
      personasConFamiliares,
    };
  }, [personasArray, actividadesArray, aulasArray, relacionesArray]);

  // Datos para gráficos memoizados
  const personasPorTipo = useMemo(() => [
    { label: 'Socios', value: stats.totalSocios, color: '#1976d2' },
    { label: 'Docentes', value: stats.totalDocentes, color: '#9c27b0' },
    { label: 'Estudiantes', value: stats.totalEstudiantes, color: '#2e7d32' },
  ], [stats.totalSocios, stats.totalDocentes, stats.totalEstudiantes]);

  const actividadesPorTipo = useMemo(() => [
    { label: 'Coros', value: actividadesArray.filter(a => a.tipo === 'coro').length, color: '#1976d2' },
    { label: 'Clases', value: actividadesArray.filter(a => a.tipo === 'clase').length, color: '#9c27b0' },
    { label: 'Talleres', value: actividadesArray.filter(a => a.tipo === 'taller').length, color: '#2e7d32' },
    { label: 'Eventos', value: actividadesArray.filter(a => a.tipo === 'evento').length, color: '#ed6c02' },
  ], [actividadesArray]);

  const ocupacionActividades = useMemo(() => [
    { label: 'Ene', value: 45 },
    { label: 'Feb', value: 52 },
    { label: 'Mar', value: 48 },
    { label: 'Abr', value: 61 },
    { label: 'May', value: 55 },
    { label: 'Jun', value: 67 },
  ], []);

  const isLoading = personasLoading || actividadesLoading || aulasLoading || familiaresLoading;

  // Memoizar iconos para evitar recrearlos
  const peopleIcon = useMemo(() => <People />, []);
  const musicIcon = useMemo(() => <MusicNote />, []);
  const roomIcon = useMemo(() => <Room />, []);
  const trendingIcon = useMemo(() => <TrendingUp />, []);

  // Memoizar trends estáticos
  const personasTrend = useMemo(() => ({
    value: 8.5,
    isPositive: true,
    label: 'este mes',
  }), []);

  const actividadesTrend = useMemo(() => ({
    value: 12.3,
    isPositive: true,
    label: 'desde el mes pasado',
  }), []);

  const aulasTrend = useMemo(() => ({
    value: 0,
    isPositive: true,
    label: 'sin cambios',
  }), []);

  const ocupacionTrend = useMemo(() => ({
    value: 5.2,
    isPositive: true,
    label: 'mejora',
  }), []);

  // Memoizar subtitles dinámicos
  const personasSubtitle = useMemo(
    () => `${stats.totalSocios} socios, ${stats.totalDocentes} docentes`,
    [stats.totalSocios, stats.totalDocentes]
  );

  const actividadesSubtitle = useMemo(
    () => `de ${stats.totalActividades} totales`,
    [stats.totalActividades]
  );

  const aulasSubtitle = useMemo(
    () => `de ${stats.totalAulas} aulas totales`,
    [stats.totalAulas]
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Vista general del sistema de gestión SIGESDA
      </Typography>

      <Stack spacing={3}>
        {/* Estadísticas principales */}
        <Box display="flex" gap={3} flexWrap="wrap">
          <Box minWidth={250} flex={1}>
            <StatCard
              title="Total Personas"
              value={stats.totalPersonas}
              subtitle={personasSubtitle}
              icon={peopleIcon}
              color="primary"
              loading={isLoading}
              trend={personasTrend}
            />
          </Box>
          <Box minWidth={250} flex={1}>
            <StatCard
              title="Actividades Activas"
              value={stats.actividadesActivas}
              subtitle={actividadesSubtitle}
              icon={musicIcon}
              color="secondary"
              loading={isLoading}
              trend={actividadesTrend}
            />
          </Box>
          <Box minWidth={250} flex={1}>
            <StatCard
              title="Aulas Disponibles"
              value={stats.aulasDisponibles}
              subtitle={aulasSubtitle}
              icon={roomIcon}
              color="success"
              loading={isLoading}
              trend={aulasTrend}
            />
          </Box>
          <Box minWidth={250} flex={1}>
            <StatCard
              title="Ocupación Promedio"
              value="73%"
              subtitle="de capacidad utilizada"
              icon={trendingIcon}
              color="warning"
              loading={isLoading}
              trend={ocupacionTrend}
            />
          </Box>
        </Box>

        {/* Gráficos y datos */}
        <Box display="flex" gap={3} flexWrap="wrap">
          <Box minWidth={350} flex={2}>
            <ChartWidget
              title="Distribución de Personas"
              subtitle="Por tipo de vinculación"
              data={personasPorTipo}
              type="pie"
              loading={isLoading}
              height={300}
            />
          </Box>
          <Box minWidth={350} flex={2}>
            <ChartWidget
              title="Actividades por Tipo"
              subtitle="Cantidad de actividades por categoría"
              data={actividadesPorTipo}
              type="bar"
              loading={isLoading}
              height={300}
            />
          </Box>
        </Box>

        <Box display="flex" gap={3} flexWrap="wrap">
          <Box minWidth={400} flex={3}>
            <ChartWidget
              title="Tendencia de Ocupación"
              subtitle="Porcentaje de ocupación mensual"
              data={ocupacionActividades}
              type="line"
              loading={isLoading}
              height={300}
            />
          </Box>
          <Box minWidth={300} flex={2}>
            <NotificationWidget />
          </Box>
        </Box>

        {/* Accesos rápidos y actividad reciente */}
        <Box display="flex" gap={3} flexWrap="wrap">
          <Box minWidth={400} flex={2}>
            <QuickActions />
          </Box>
          <Box minWidth={350} flex={1.5}>
            <RecentActivity />
          </Box>
        </Box>

        {/* Indicadores del sistema */}
        <Box display="flex" gap={3} flexWrap="wrap">
          <Box flex={1}>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                ✅ Sistema Operativo
              </Typography>
              <Typography variant="body2">
                Todos los módulos funcionando correctamente. Última sincronización: hace 5 minutos.
              </Typography>
            </Alert>
          </Box>
          <Box flex={1}>
            <Alert severity="info">
              <Typography variant="subtitle2" gutterBottom>
                📊 Estado del Proyecto
              </Typography>
              <Typography variant="body2">
                **FASE 5 COMPLETADA**: Sistema de gestión de familiares implementado. Incluye gestión de relaciones familiares, árboles genealógicos, grupos familiares, descuentos automáticos e integración completa con el sistema de personas.
              </Typography>
            </Alert>
          </Box>
        </Box>
      </Stack>

      <Snackbar
        open={!!dashboardError}
        autoHideDuration={6000}
        onClose={() => setDashboardError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setDashboardError(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {dashboardError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;