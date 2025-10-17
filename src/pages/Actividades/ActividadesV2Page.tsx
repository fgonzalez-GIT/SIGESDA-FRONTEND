/**
 * Página de Gestión de Actividades V2
 * Integración completa con API de Actividades V2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
  Alert,
  Pagination,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Checkbox,
  FormControlLabel,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewModule as CardViewIcon,
  ViewList as ListViewIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

// Hooks y servicios V2
import { useActividades, useActividadMutations, useCatalogos } from '../../hooks/useActividadesV2';
import type { ActividadesQueryParams, ActividadV2 } from '../../types/actividadV2.types';

// Componentes V2
import { ActividadCardV2 } from '../../components/actividades/ActividadCardV2';

export const ActividadesV2Page: React.FC = () => {
  // ============================================
  // ESTADO
  // ============================================

  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actividadToDelete, setActividadToDelete] = useState<ActividadV2 | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filtros
  const [filters, setFilters] = useState<ActividadesQueryParams>({
    page: 1,
    limit: 12,
    incluirRelaciones: true,
    orderBy: 'nombre',
    orderDir: 'asc',
  });

  // ============================================
  // HOOKS
  // ============================================

  const { catalogos, loading: catalogosLoading } = useCatalogos();
  const { actividades, pagination, loading, error, fetchActividades, refetch } = useActividades(filters);
  const { eliminar, loading: mutationLoading } = useActividadMutations();

  // ============================================
  // EFECTOS
  // ============================================

  // Actualizar filtros al cambiar de tab
  useEffect(() => {
    let estadoId: number | undefined;
    switch (tabValue) {
      case 1: estadoId = 1; break; // Activas
      case 2: estadoId = 2; break; // Inactivas
      case 3: estadoId = 4; break; // Finalizadas
      default: estadoId = undefined;
    }

    setFilters(prev => ({ ...prev, estadoId, page: 1 }));
  }, [tabValue]);

  // ============================================
  // HANDLERS
  // ============================================

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (key: keyof ActividadesQueryParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      incluirRelaciones: true,
      orderBy: 'nombre',
      orderDir: 'asc',
    });
    setTabValue(0);
  };

  const handleDeleteClick = (actividad: ActividadV2) => {
    setActividadToDelete(actividad);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!actividadToDelete) return;

    try {
      await eliminar(actividadToDelete.id);
      alert('Actividad eliminada exitosamente');
      setDeleteDialogOpen(false);
      setActividadToDelete(null);
      refetch();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleView = (actividad: ActividadV2) => {
    navigate(`/actividades/${actividad.id}`);
  };

  const handleEdit = (actividad: ActividadV2) => {
    navigate(`/actividades/${actividad.id}/editar`);
  };

  const handleDuplicate = (actividad: ActividadV2) => {
    navigate(`/actividades/${actividad.id}/duplicar`);
  };

  const handleCreateNew = () => {
    navigate('/actividades/nueva');
  };

  // Contar filtros activos
  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof ActividadesQueryParams];
    return value !== undefined &&
           key !== 'page' &&
           key !== 'limit' &&
           key !== 'incluirRelaciones' &&
           key !== 'orderBy' &&
           key !== 'orderDir';
  }).length;

  // ============================================
  // RENDERIZADO
  // ============================================

  if (catalogosLoading) {
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
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Actividades
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {pagination.total} {pagination.total === 1 ? 'actividad encontrada' : 'actividades encontradas'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={handleCreateNew}
        >
          Nueva Actividad
        </Button>
      </Box>

      {/* Tabs de Estado */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="fullWidth">
          <Tab label="Todas" />
          <Tab label="Activas" />
          <Tab label="Inactivas" />
          <Tab label="Finalizadas" />
        </Tabs>
      </Paper>

      {/* Barra de Filtros y Vista */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={showFilters ? 2 : 0}>
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            endIcon={activeFiltersCount > 0 && (
              <Chip label={activeFiltersCount} size="small" color="primary" />
            )}
          >
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="card">
              <CardViewIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ListViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Filtros Avanzados */}
        {showFilters && (
          <Box>
            <Grid container spacing={2} alignItems="flex-end">
              {/* Búsqueda por texto */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Buscar"
                  placeholder="Nombre o código..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  size="small"
                />
              </Grid>

              {/* Filtro por tipo */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filters.tipoActividadId || ''}
                    onChange={(e) => handleFilterChange('tipoActividadId', e.target.value || undefined)}
                    label="Tipo"
                  >
                    <MenuItem value="">Todos los tipos</MenuItem>
                    {catalogos?.tipos.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Filtro por categoría */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={filters.categoriaId || ''}
                    onChange={(e) => handleFilterChange('categoriaId', e.target.value || undefined)}
                    label="Categoría"
                  >
                    <MenuItem value="">Todas las categorías</MenuItem>
                    {catalogos?.categorias.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Filtro por día */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Día de Semana</InputLabel>
                  <Select
                    value={filters.diaSemanaId || ''}
                    onChange={(e) => handleFilterChange('diaSemanaId', e.target.value || undefined)}
                    label="Día de Semana"
                  >
                    <MenuItem value="">Todos los días</MenuItem>
                    {catalogos?.diasSemana.map((dia) => (
                      <MenuItem key={dia.id} value={dia.id}>
                        {dia.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Checkboxes */}
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.conCupo || false}
                        onChange={(e) => handleFilterChange('conCupo', e.target.checked || undefined)}
                      />
                    }
                    label="Solo con cupo disponible"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.vigentes || false}
                        onChange={(e) => handleFilterChange('vigentes', e.target.checked || undefined)}
                      />
                    }
                    label="Solo vigentes"
                  />
                </Stack>
              </Grid>

              {/* Botón limpiar filtros */}
              {activeFiltersCount > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Button variant="outlined" onClick={handleClearFilters}>
                    Limpiar Filtros ({activeFiltersCount})
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Mensajes de Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => refetch()}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Lista de Actividades - Vista Tarjetas */}
      {!loading && viewMode === 'card' && (
        <>
          {actividades.length === 0 ? (
            <Paper sx={{ p: 4 }}>
              <Typography align="center" color="text.secondary">
                No se encontraron actividades con los filtros seleccionados
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {actividades.map((actividad) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={actividad.id}>
                  <ActividadCardV2
                    actividad={actividad}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onDuplicate={handleDuplicate}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Lista de Actividades - Vista Lista/Tabla */}
      {!loading && viewMode === 'list' && (
        <Paper>
          <Box p={2}>
            <Typography color="text.secondary">
              Vista de tabla - Próximamente
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Paginación */}
      {!loading && pagination.pages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Dialog de Confirmación de Eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar la actividad <strong>"{actividadToDelete?.nombre}"</strong>?
            <br />
            Esta acción no se puede deshacer.
            {actividadToDelete?._count_participantes && actividadToDelete._count_participantes > 0 && (
              <>
                <br /><br />
                <Alert severity="warning">
                  Esta actividad tiene {actividadToDelete._count_participantes} participante(s) inscrito(s).
                </Alert>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={mutationLoading}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={mutationLoading}>
            {mutationLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActividadesV2Page;
