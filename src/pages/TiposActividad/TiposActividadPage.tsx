import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  FormControlLabel,
  Switch,
  Paper,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchTiposActividad,
  createTipoActividad,
  updateTipoActividad,
  deleteTipoActividad,
  setSelectedTipo,
  clearError,
  setShowInactive,
} from '../../store/slices/tiposActividadSlice';
import type { TipoActividad, CreateTipoActividadDto, UpdateTipoActividadDto } from '../../types/tipoActividad.types';
import { TipoActividadForm } from '../../components/tiposActividad/TipoActividadForm';
import { TipoActividadBadge } from '../../components/tiposActividad/TipoActividadBadge';

// Estilos extraídos fuera del componente para evitar recreación
const codigoBoxStyle = { display: 'flex', alignItems: 'center', gap: 1 };
const dataGridStyle = {
  '& .MuiDataGrid-cell': {
    padding: '8px',
  },
};

// Componentes de celda memoizados para mejor rendimiento
const CodigoCellRenderer = React.memo(({ value }: { value: string }) => (
  <Box sx={codigoBoxStyle}>
    <CategoryIcon color="action" fontSize="small" />
    <strong>{value}</strong>
  </Box>
));
CodigoCellRenderer.displayName = 'CodigoCellRenderer';

const DescripcionCellRenderer = React.memo(({ value }: { value?: string }) => (
  <>{value || '-'}</>
));
DescripcionCellRenderer.displayName = 'DescripcionCellRenderer';

const ActividadesCountCellRenderer = React.memo(({ count }: { count: number }) => (
  <Chip
    label={count}
    color={count > 0 ? 'primary' : 'default'}
    size="small"
    variant="outlined"
  />
));
ActividadesCountCellRenderer.displayName = 'ActividadesCountCellRenderer';

const EstadoCellRenderer = React.memo(({ activo }: { activo: boolean }) => (
  <Chip
    label={activo ? 'Activo' : 'Inactivo'}
    color={activo ? 'success' : 'error'}
    variant="outlined"
    size="small"
  />
));
EstadoCellRenderer.displayName = 'EstadoCellRenderer';

const TiposActividadPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tipos, loading, error, selectedTipo, showInactive } = useAppSelector(
    (state) => state.tiposActividad
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [tipoToDelete, setTipoToDelete] = useState<TipoActividad | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchTiposActividad({ includeInactive: showInactive }));
  }, [dispatch, showInactive]);

  useEffect(() => {
    if (error) {
      // El error ya se muestra en el Alert, solo lo limpiamos después de 5 segundos
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleOpenDialog = useCallback((tipo?: TipoActividad) => {
    if (tipo) {
      dispatch(setSelectedTipo(tipo));
    } else {
      dispatch(setSelectedTipo(null));
    }
    setOpenDialog(true);
  }, [dispatch]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    dispatch(setSelectedTipo(null));
  }, [dispatch]);

  const handleSubmit = useCallback(async (data: CreateTipoActividadDto | UpdateTipoActividadDto) => {
    try {
      if (selectedTipo) {
        // Actualizar
        await dispatch(updateTipoActividad({ id: selectedTipo.id, data })).unwrap();
        alert('Tipo de actividad actualizado exitosamente');
      } else {
        // Crear
        await dispatch(createTipoActividad(data as CreateTipoActividadDto)).unwrap();
        alert('Tipo de actividad creado exitosamente');
      }
      handleCloseDialog();
      dispatch(fetchTiposActividad({ includeInactive: showInactive }));
    } catch (err) {
      // El error ya está en el estado, se muestra en el formulario
      console.error('Error al guardar tipo de actividad:', err);
    }
  }, [dispatch, selectedTipo, showInactive, handleCloseDialog]);

  const handleOpenDeleteDialog = useCallback((tipo: TipoActividad) => {
    setTipoToDelete(tipo);
    setOpenDeleteDialog(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setOpenDeleteDialog(false);
    setTipoToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!tipoToDelete) return;

    try {
      await dispatch(deleteTipoActividad(tipoToDelete.id)).unwrap();
      alert('Tipo de actividad desactivado exitosamente');
      handleCloseDeleteDialog();
      dispatch(fetchTiposActividad({ includeInactive: showInactive }));
    } catch (err) {
      // El error ya está en el estado
      console.error('Error al eliminar tipo de actividad:', err);
    }
  }, [dispatch, tipoToDelete, showInactive, handleCloseDeleteDialog]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    dispatch(setShowInactive(false));
  }, [dispatch]);

  // Filtrado local memoizado
  const filteredTipos = useMemo(() => {
    return tipos.filter((tipo) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        tipo.codigo.toLowerCase().includes(searchLower) ||
        tipo.nombre.toLowerCase().includes(searchLower) ||
        (tipo.descripcion && tipo.descripcion.toLowerCase().includes(searchLower));

      return matchesSearch;
    });
  }, [tipos, searchTerm]);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'codigo',
      headerName: 'Código',
      width: 150,
      renderCell: (params) => <CodigoCellRenderer value={params.value} />,
    },
    {
      field: 'nombre',
      headerName: 'Nombre',
      width: 250,
      renderCell: (params) => <TipoActividadBadge tipo={params.row} />,
    },
    {
      field: 'descripcion',
      headerName: 'Descripción',
      width: 300,
      renderCell: (params) => <DescripcionCellRenderer value={params.value} />,
    },
    {
      field: 'orden',
      headerName: 'Orden',
      width: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: '_count',
      headerName: 'Actividades',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const count = params.row._count?.actividades || 0;
        return <ActividadesCountCellRenderer count={count} />;
      },
    },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => <EstadoCellRenderer activo={params.value} />,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleOpenDialog(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Eliminar"
          onClick={() => handleOpenDeleteDialog(params.row)}
        />,
      ],
    },
  ], [handleOpenDialog, handleOpenDeleteDialog]);

  // Estadísticas memoizadas
  const stats = useMemo(() => ({
    total: tipos.length,
    activos: tipos.filter((t) => t.activo).length,
    inactivos: tipos.filter((t) => !t.activo).length,
  }), [tipos]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tipos de Actividades
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Nuevo Tipo
        </Button>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tipos
              </Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Activos
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.activos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inactivos
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.inactivos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        Los tipos de actividad definen las categorías principales de actividades del sistema (Coro,
        Clase, Taller, etc.)
      </Alert>

      {/* Búsqueda y Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Buscar por código, nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, flexGrow: 1 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => dispatch(setShowInactive(e.target.checked))}
              />
            }
            label="Mostrar inactivos"
          />

          <Button
            variant="outlined"
            size="small"
            onClick={handleClearFilters}
            startIcon={<FilterListIcon />}
          >
            Limpiar Filtros
          </Button>

          <Box sx={{ ml: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
              {filteredTipos.length} de {stats.total} tipos de actividad
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabla */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredTipos}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={dataGridStyle}
        />
      </Box>

      {/* Dialog para crear/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTipo ? 'Editar Tipo de Actividad' : 'Nuevo Tipo de Actividad'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TipoActividadForm
              initialData={selectedTipo}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              loading={loading}
              error={error}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea desactivar el tipo de actividad{' '}
            <strong>"{tipoToDelete?.nombre}"</strong>?
            <br />
            <br />
            {tipoToDelete?._count?.actividades && tipoToDelete._count.actividades > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Este tipo tiene {tipoToDelete._count.actividades} actividad(es) asociada(s).
                Al desactivarlo, ya no estará disponible para nuevas actividades.
              </Alert>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={loading}>
            {loading ? 'Desactivando...' : 'Desactivar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TiposActividadPage;
