import React, { useState, useEffect } from 'react';
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
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchCategoriasActividad,
  createCategoriaActividad,
  updateCategoriaActividad,
  deleteCategoriaActividad,
  setSelectedCategoria,
  clearError,
  setShowInactive,
} from '../../store/slices/categoriasActividadSlice';
import type { CategoriaActividad, CreateCategoriaActividadDto, UpdateCategoriaActividadDto } from '../../types/categoriaActividad.types';
import { CategoriaActividadForm } from '../../components/categoriasActividad/CategoriaActividadForm';
import { CategoriaActividadBadge } from '../../components/categoriasActividad/CategoriaActividadBadge';

const CategoriasActividadPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categorias, loading, error, selectedCategoria, showInactive } = useAppSelector(
    (state) => state.categoriasActividad
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<CategoriaActividad | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCategoriasActividad({ includeInactive: showInactive }));
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

  const handleOpenDialog = (categoria?: CategoriaActividad) => {
    if (categoria) {
      dispatch(setSelectedCategoria(categoria));
    } else {
      dispatch(setSelectedCategoria(null));
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    dispatch(setSelectedCategoria(null));
  };

  const handleSubmit = async (data: CreateCategoriaActividadDto | UpdateCategoriaActividadDto) => {
    try {
      if (selectedCategoria) {
        // Actualizar
        await dispatch(updateCategoriaActividad({ id: selectedCategoria.id, data })).unwrap();
        alert('Categoría de actividad actualizada exitosamente');
      } else {
        // Crear
        await dispatch(createCategoriaActividad(data as CreateCategoriaActividadDto)).unwrap();
        alert('Categoría de actividad creada exitosamente');
      }
      handleCloseDialog();
      dispatch(fetchCategoriasActividad({ includeInactive: showInactive }));
    } catch (err) {
      // El error ya está en el estado, se muestra en el formulario
      console.error('Error al guardar categoría de actividad:', err);
    }
  };

  const handleOpenDeleteDialog = (categoria: CategoriaActividad) => {
    setCategoriaToDelete(categoria);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCategoriaToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!categoriaToDelete) return;

    try {
      await dispatch(deleteCategoriaActividad(categoriaToDelete.id)).unwrap();
      alert('Categoría de actividad desactivada exitosamente');
      handleCloseDeleteDialog();
      dispatch(fetchCategoriasActividad({ includeInactive: showInactive }));
    } catch (err) {
      // El error ya está en el estado
      console.error('Error al eliminar categoría de actividad:', err);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    dispatch(setShowInactive(false));
  };

  // Filtrado local
  const filteredCategorias = categorias.filter((categoria) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      categoria.nombre.toLowerCase().includes(searchLower) ||
      (categoria.descripcion && categoria.descripcion.toLowerCase().includes(searchLower));

    return matchesSearch;
  });

  const columns: GridColDef[] = [
    {
      field: 'nombre',
      headerName: 'Nombre',
      width: 300,
      renderCell: (params) => <CategoriaActividadBadge categoria={params.row} />,
    },
    {
      field: 'descripcion',
      headerName: 'Descripción',
      width: 300,
      renderCell: (params) => params.value || '-',
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
        return (
          <Chip
            label={count}
            color={count > 0 ? 'primary' : 'default'}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          color={params.value ? 'success' : 'error'}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleOpenDialog(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Eliminar"
          onClick={() => handleOpenDeleteDialog(params.row)}
        />,
      ],
    },
  ];

  const totalCategorias = categorias.length;
  const activasCategorias = categorias.filter((c) => c.activo).length;
  const inactivasCategorias = categorias.filter((c) => !c.activo).length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Categorías de Actividades
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Nueva Categoría
        </Button>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Categorías
              </Typography>
              <Typography variant="h4">{totalCategorias}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Activas
              </Typography>
              <Typography variant="h4" color="success.main">
                {activasCategorias}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inactivas
              </Typography>
              <Typography variant="h4" color="error.main">
                {inactivasCategorias}
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
        Las categorías de actividad clasifican las actividades según el público objetivo (Infantil,
        Juvenil, Adulto, etc.)
      </Alert>

      {/* Búsqueda y Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Buscar por nombre o descripción..."
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
            label="Mostrar inactivas"
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
              {filteredCategorias.length} de {totalCategorias} categorías de actividad
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabla */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredCategorias}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              padding: '8px',
            },
          }}
        />
      </Box>

      {/* Dialog para crear/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCategoria ? 'Editar Categoría de Actividad' : 'Nueva Categoría de Actividad'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <CategoriaActividadForm
              initialData={selectedCategoria}
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
            ¿Está seguro que desea desactivar la categoría de actividad{' '}
            <strong>"{categoriaToDelete?.nombre}"</strong>?
            <br />
            <br />
            {categoriaToDelete?._count?.actividades && categoriaToDelete._count.actividades > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Esta categoría tiene {categoriaToDelete._count.actividades} actividad(es) asociada(s).
                Al desactivarla, ya no estará disponible para nuevas actividades.
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

export default CategoriasActividadPage;
