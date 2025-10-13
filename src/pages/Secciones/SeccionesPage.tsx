import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchSecciones, setFilters } from '../../store/slices/seccionesSlice';
import { SeccionFilters as FilterType } from '../../types/seccion.types';
import SeccionCard from '../../components/secciones/SeccionCard';
import SeccionFilters from '../../components/secciones/SeccionFilters';
import { Box, Button, Grid, Pagination, CircularProgress, Typography } from '@mui/material';
import { Add as AddIcon, CalendarMonth as CalendarIcon, Dashboard as DashboardIcon } from '@mui/icons-material';

const SeccionesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { secciones, loading, pagination, filters } = useAppSelector(
    state => state.secciones
  );

  useEffect(() => {
    dispatch(fetchSecciones(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (newFilters: Partial<FilterType>) => {
    dispatch(setFilters({ ...filters, ...newFilters, page: 1 }));
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    dispatch(setFilters({ ...filters, page }));
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Secciones
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra las secciones, horarios, docentes y participantes
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/secciones/dashboard')}
          >
            Dashboard
          </Button>
          <Button
            variant="outlined"
            startIcon={<CalendarIcon />}
            onClick={() => navigate('/secciones/horario-semanal')}
          >
            Horario Semanal
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/secciones/new')}
            size="large"
          >
            Nueva Sección
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <SeccionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Lista de Secciones */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : secciones.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No se encontraron secciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Prueba ajustando los filtros o crea una nueva sección
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {secciones.map(seccion => (
              <Grid item xs={12} md={6} lg={4} key={seccion.id}>
                <SeccionCard
                  seccion={seccion}
                  onClick={() => navigate(`/secciones/${seccion.id}`)}
                />
              </Grid>
            ))}
          </Grid>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default SeccionesPage;
