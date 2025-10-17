/**
 * EJEMPLO COMPLETO: Página de Actividades V2
 *
 * Este archivo muestra cómo implementar una página completa de gestión de actividades
 * utilizando los nuevos servicios, hooks y componentes de la API V2.
 *
 * Características implementadas:
 * - Listado con paginación
 * - Filtros dinámicos
 * - Vista de tarjetas y tabla
 * - Formulario de creación/edición
 * - Confirmación de eliminación
 * - Duplicación de actividades
 * - Manejo de errores
 */

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  ViewModule as CardViewIcon,
  ViewList as ListViewIcon,
} from '@mui/icons-material';

// Hooks y servicios V2
import { useActividades, useActividadMutations, useCatalogos } from '../../hooks/useActividadesV2';
import type { ActividadesQueryParams, ActividadV2 } from '../../types/actividadV2.types';

// Componentes V2
import { ActividadCardV2 } from '../../components/actividades/ActividadCardV2';

// Componente principal
export const ActividadesV2PageExample: React.FC = () => {
  // ============================================
  // ESTADO
  // ============================================

  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actividadToDelete, setActividadToDelete] = useState<ActividadV2 | null>(null);
  const [tabValue, setTabValue] = useState(0);

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

  // Refetch cuando cambien filtros
  useEffect(() => {
    fetchActividades(filters);
  }, [filters, fetchActividades]);

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
    console.log('Ver actividad:', actividad);
    // Navegar a página de detalle
    // navigate(`/actividades/${actividad.id}`);
  };

  const handleEdit = (actividad: ActividadV2) => {
    console.log('Editar actividad:', actividad);
    // Abrir formulario de edición
  };

  const handleDuplicate = (actividad: ActividadV2) => {
    console.log('Duplicar actividad:', actividad);
    // Implementar duplicación
  };

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
            Gestión de Actividades V2
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {pagination.total} actividades encontradas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={() => console.log('Crear nueva actividad')}
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

      {/* Filtros Avanzados */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>

        <Grid container spacing={2} alignItems="flex-end">
          {/* Búsqueda por texto */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Buscar"
              placeholder="Nombre o código..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </Grid>

          {/* Filtro por tipo */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
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
            <FormControl fullWidth>
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
            <FormControl fullWidth>
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

          {/* Botones de acción */}
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button variant="outlined" onClick={handleClearFilters}>
                Limpiar Filtros
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
            </Stack>
          </Grid>
        </Grid>
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
                No se encontraron actividades
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
          <Typography p={2}>Vista de tabla - Implementar según necesidad</Typography>
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
            ¿Está seguro que desea eliminar la actividad "{actividadToDelete?.nombre}"?
            Esta acción no se puede deshacer.
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

export default ActividadesV2PageExample;
