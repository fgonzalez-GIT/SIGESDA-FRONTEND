import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Stack,
  Tooltip,
  Switch,
  FormControlLabel,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  BarChart as StatsIcon,
  Visibility as ViewIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  toggleCategoria,
  setSelectedCategoria,
  clearError,
} from '../../store/slices/categoriasSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { CategoriaSocio } from '../../types/categoria.types';
import CategoriaForm from '../../components/forms/CategoriaForm';

const CategoriasPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categorias, loading, error, selectedCategoria, showInactive } = useAppSelector(
    (state) => state.categorias
  );

  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<CategoriaSocio | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar categorías al montar el componente
  useEffect(() => {
    dispatch(fetchCategorias({ includeInactive }));
  }, [dispatch, includeInactive]);

  // Mostrar notificación de error si existe
  useEffect(() => {
    if (error) {
      dispatch(
        showNotification({
          message: error,
          severity: 'error',
        })
      );
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAddClick = useCallback(() => {
    dispatch(setSelectedCategoria(null));
    setFormOpen(true);
  }, [dispatch]);

  const handleEditClick = useCallback((categoria: CategoriaSocio) => {
    dispatch(setSelectedCategoria(categoria));
    setFormOpen(true);
  }, [dispatch]);

  const handleDeleteClick = useCallback((categoria: CategoriaSocio) => {
    setCategoriaToDelete(categoria);
    setDeleteDialogOpen(true);
  }, []);

  const handleToggleClick = useCallback(async (categoria: CategoriaSocio) => {
    try {
      await dispatch(toggleCategoria(categoria.id)).unwrap();
      dispatch(
        showNotification({
          message: `Categoría ${categoria.activa ? 'desactivada' : 'activada'} exitosamente`,
          severity: 'success',
        })
      );
    } catch (error: any) {
      dispatch(
        showNotification({
          message: error || 'Error al cambiar el estado de la categoría',
          severity: 'error',
        })
      );
    }
  }, [dispatch]);

  const handleFormSubmit = useCallback(async (data: any) => {
    try {
      if (selectedCategoria) {
        // Actualizar categoría existente
        await dispatch(
          updateCategoria({
            id: selectedCategoria.id,
            data,
          })
        ).unwrap();
        dispatch(
          showNotification({
            message: 'Categoría actualizada exitosamente',
            severity: 'success',
          })
        );
      } else {
        // Crear nueva categoría
        await dispatch(createCategoria(data)).unwrap();
        dispatch(
          showNotification({
            message: 'Categoría creada exitosamente',
            severity: 'success',
          })
        );
      }
      setFormOpen(false);
      // Remover recarga innecesaria - el slice ya actualiza el estado
    } catch (error: any) {
      // El error se manejará en el formulario
      throw error;
    }
  }, [dispatch, selectedCategoria]);

  const handleDeleteConfirm = useCallback(async () => {
    if (categoriaToDelete) {
      try {
        await dispatch(deleteCategoria(categoriaToDelete.id)).unwrap();
        dispatch(
          showNotification({
            message: 'Categoría eliminada exitosamente',
            severity: 'success',
          })
        );
        setDeleteDialogOpen(false);
        setCategoriaToDelete(null);
      } catch (error: any) {
        dispatch(
          showNotification({
            message: error || 'Error al eliminar la categoría',
            severity: 'error',
          })
        );
      }
    }
  }, [dispatch, categoriaToDelete]);

  const formatMonto = useCallback((monto: string) => {
    const numero = parseFloat(monto);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numero);
  }, []);

  // Función para limpiar filtros
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Filtrar y ordenar categorías memoizadas
  const categoriasFiltered = useMemo(() => {
    return categorias.filter((cat) => {
      // Filtro por estado activo/inactivo
      const matchesActive = includeInactive || cat.activa;

      // Filtro de búsqueda (nombre, descripción)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        cat.nombre.toLowerCase().includes(searchLower) ||
        (cat.descripcion && cat.descripcion.toLowerCase().includes(searchLower));

      return matchesActive && matchesSearch;
    });
  }, [categorias, includeInactive, searchTerm]);

  const categoriasOrdenadas = useMemo(() => {
    return [...categoriasFiltered].sort((a, b) => a.orden - b.orden);
  }, [categoriasFiltered]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Categorías de Socios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administre las categorías de socios, montos de cuota y descuentos.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          size="large"
        >
          Nueva Categoría
        </Button>
      </Box>

      {/* Controles */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <FormControlLabel
          control={
            <Switch
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
            />
          }
          label="Mostrar categorías inactivas"
        />
        <Typography variant="body2" color="text.secondary">
          Total: {categoriasOrdenadas.length} categoría(s)
        </Typography>
      </Box>

      {/* Sección de Búsqueda */}
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

          <Button
            variant="outlined"
            size="small"
            onClick={handleClearFilters}
            startIcon={<FilterListIcon />}
          >
            Limpiar Búsqueda
          </Button>

          <Box sx={{ ml: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
              {categoriasOrdenadas.length} de {categorias.length} categorías
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Información */}
      {categoriasOrdenadas.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {includeInactive
            ? 'No hay categorías registradas en el sistema.'
            : 'No hay categorías activas. Active el switch para ver las inactivas.'}
        </Alert>
      )}

      {/* Tabla */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Orden</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Monto Cuota</TableCell>
              <TableCell align="center">Descuento</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Uso</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Cargando categorías...
                </TableCell>
              </TableRow>
            )}
            {!loading && categoriasOrdenadas.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No hay categorías para mostrar
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              categoriasOrdenadas.map((categoria) => (
                <TableRow
                  key={categoria.id}
                  hover
                  sx={{
                    opacity: categoria.activa ? 1 : 0.6,
                    backgroundColor: categoria.activa ? 'inherit' : 'action.hover',
                  }}
                >
                  <TableCell>
                    <Chip label={categoria.orden} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {categoria.codigo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">{categoria.nombre}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {categoria.descripcion || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight="medium">
                      {formatMonto(categoria.montoCuota)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {parseFloat(categoria.descuento) > 0 ? (
                      <Chip
                        label={`${categoria.descuento}%`}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip
                      title={categoria.activa ? 'Click para desactivar' : 'Click para activar'}
                    >
                      <Chip
                        label={categoria.activa ? 'Activa' : 'Inactiva'}
                        color={categoria.activa ? 'success' : 'default'}
                        size="small"
                        variant={categoria.activa ? 'filled' : 'outlined'}
                        onClick={() => handleToggleClick(categoria)}
                        sx={{ cursor: 'pointer' }}
                        icon={categoria.activa ? <ViewIcon /> : <VisibilityOffIcon />}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    {categoria._count ? (
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Socios con esta categoría">
                          <Chip
                            label={`${categoria._count.personas} socios`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Tooltip>
                        <Tooltip title="Cuotas generadas">
                          <Chip
                            label={`${categoria._count.cuotas} cuotas`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Editar categoría">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(categoria)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={
                          categoria._count &&
                          (categoria._count.personas > 0 || categoria._count.cuotas > 0)
                            ? 'No se puede eliminar: tiene socios o cuotas asociadas'
                            : 'Eliminar categoría'
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(categoria)}
                            color="error"
                            disabled={
                              categoria._count &&
                              (categoria._count.personas > 0 || categoria._count.cuotas > 0)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulario */}
      <CategoriaForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        categoria={selectedCategoria}
        loading={loading}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar la categoría{' '}
            <strong>{categoriaToDelete?.nombre}</strong>?
            <br />
            <br />
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriasPage;
