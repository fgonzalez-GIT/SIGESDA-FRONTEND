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
  Alert,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { showNotification } from '@/store/slices/uiSlice';
import {
  fetchEquipamientos,
  createEquipamiento,
  updateEquipamiento,
  deleteEquipamiento,
  reactivateEquipamiento,
} from '@/store/slices/equipamientosSlice';
import {
  createEquipamientoSchema,
  updateEquipamientoSchema,
  type CreateEquipamientoFormData,
  type UpdateEquipamientoFormData,
} from '@/schemas/equipamiento.schema';
import type { Equipamiento, CategoriaEquipamiento, EstadoEquipamiento } from '@/types/equipamiento.types';
import {
  getCategoriaLabel,
  getCategoriaColor,
  getEstadoLabel,
  getEstadoColor,
} from '@/types/equipamiento.types';
import { equipamientosApi } from '@/services/equipamientosApi';

/**
 * Página de administración de Equipamientos
 * Permite crear, editar y eliminar equipamientos disponibles para aulas
 */
const EquipamientosAdminPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.equipamientos);

  // Estados de UI
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Equipamiento | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Equipamiento | null>(null);
  const [itemToView, setItemToView] = useState<Equipamiento | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  // NUEVO: Estados para filtros
  const [filtroEstadoId, setFiltroEstadoId] = useState<number | ''>('');
  const [filtroSoloConStock, setFiltroSoloConStock] = useState(false);

  // Estado para categorías
  const [categorias, setCategorias] = useState<CategoriaEquipamiento[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  // NUEVO: Estado para estados de equipamiento
  const [estados, setEstados] = useState<EstadoEquipamiento[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);

  // Cargar equipamientos, categorías y estados al montar
  useEffect(() => {
    // Cargar todos los equipamientos (activos e inactivos)
    // El filtrado se hace en el frontend según showInactive
    dispatch(fetchEquipamientos({ includeInactive: true, limit: 100 }));

    // Cargar categorías desde API
    const loadCategorias = async () => {
      setLoadingCategorias(true);
      try {
        const cats = await equipamientosApi.getCategorias();
        setCategorias(cats);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setLoadingCategorias(false);
      }
    };

    // NUEVO: Cargar estados desde API
    const loadEstados = async () => {
      setLoadingEstados(true);
      try {
        const ests = await equipamientosApi.getEstados();
        setEstados(ests);
      } catch (error) {
        console.error('Error al cargar estados:', error);
      } finally {
        setLoadingEstados(false);
      }
    };

    loadCategorias();
    loadEstados();
  }, [dispatch]);

  // Form hook
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateEquipamientoFormData | UpdateEquipamientoFormData>({
    resolver: zodResolver(selectedItem ? updateEquipamientoSchema : createEquipamientoSchema),
    defaultValues: selectedItem
      ? {
          nombre: selectedItem.nombre,
          descripcion: selectedItem.descripcion || '',
          observaciones: selectedItem.observaciones || '',
          categoriaEquipamientoId: selectedItem.categoriaEquipamiento?.id,
          estadoEquipamientoId: selectedItem.estadoEquipamientoId, // NUEVO
          cantidad: selectedItem.cantidad || 1, // NUEVO
          orden: selectedItem.orden,
        }
      : {
          nombre: '',
          descripcion: '',
          observaciones: '',
          categoriaEquipamientoId: '' as any,
          estadoEquipamientoId: '' as any, // NUEVO
          cantidad: 1, // NUEVO: Default 1
          orden: 0,
        },
  });

  // Resetear form cuando cambia selectedItem
  useEffect(() => {
    if (selectedItem) {
      reset({
        nombre: selectedItem.nombre,
        descripcion: selectedItem.descripcion || '',
        observaciones: selectedItem.observaciones || '',
        categoriaEquipamientoId: selectedItem.categoriaEquipamiento?.id,
        estadoEquipamientoId: selectedItem.estadoEquipamientoId, // NUEVO
        cantidad: selectedItem.cantidad || 1, // NUEVO
        orden: selectedItem.orden,
      });
    } else {
      reset({
        nombre: '',
        descripcion: '',
        observaciones: '',
        categoriaEquipamientoId: '' as any,
        estadoEquipamientoId: '' as any, // NUEVO
        cantidad: 1, // NUEVO
        orden: 0,
      });
    }
  }, [selectedItem, reset]);

  // Handlers
  const handleAddClick = () => {
    setSelectedItem(null);
    setFormOpen(true);
  };

  const handleEditClick = (item: Equipamiento) => {
    setSelectedItem(item);
    setFormOpen(true);
  };

  const handleDeleteClick = (item: Equipamiento) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleViewClick = (item: Equipamiento) => {
    setItemToView(item);
    setDetailDialogOpen(true);
  };

  const handleDetailDialogClose = () => {
    setDetailDialogOpen(false);
    setItemToView(null);
  };

  const handleEditFromDetail = () => {
    if (itemToView) {
      const itemToEdit = itemToView;

      // Guardar referencia al botón enfocado antes de cerrar
      const activeElement = document.activeElement;

      // Mover el foco a un elemento seguro (body) antes de cerrar el dialog
      if (activeElement instanceof HTMLElement && activeElement.blur) {
        activeElement.blur();
      }

      // Enfocar temporalmente en body para liberar el foco del dialog
      if (document.body) {
        document.body.focus();
      }

      // Primero cerrar el dialog de detalle completamente
      setDetailDialogOpen(false);
      setItemToView(null);

      // Delay para asegurar que el dialog de detalle se cierre completamente y
      // MUI quite el aria-hidden del root antes de abrir el de edición
      setTimeout(() => {
        setSelectedItem(itemToEdit);
        setFormOpen(true);
      }, 300);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedItem(null);
    reset();
  };

  const handleFormSubmit = async (data: CreateEquipamientoFormData | UpdateEquipamientoFormData) => {
    try {
      if (selectedItem) {
        // Actualizar existente
        await dispatch(
          updateEquipamiento({
            id: selectedItem.id,
            data: data as UpdateEquipamientoFormData,
          })
        ).unwrap();

        dispatch(
          showNotification({
            message: 'Equipamiento actualizado exitosamente',
            severity: 'success',
          })
        );
      } else {
        // Crear nuevo
        await dispatch(createEquipamiento(data as CreateEquipamientoFormData)).unwrap();

        dispatch(
          showNotification({
            message: 'Equipamiento creado exitosamente',
            severity: 'success',
          })
        );
      }

      handleFormClose();
    } catch (error: any) {
      console.error('Error al guardar equipamiento:', error);

      dispatch(
        showNotification({
          message: error || 'Error al guardar equipamiento',
          severity: 'error',
        })
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await dispatch(deleteEquipamiento(itemToDelete.id)).unwrap();

      dispatch(
        showNotification({
          message: 'Equipamiento eliminado exitosamente',
          severity: 'success',
        })
      );

      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error('Error al eliminar equipamiento:', error);

      dispatch(
        showNotification({
          message: error || 'Error al eliminar equipamiento',
          severity: 'error',
        })
      );
    }
  };

  const handleReactivate = async (item: Equipamiento) => {
    if (window.confirm(`¿Está seguro que desea reactivar el equipamiento "${item.nombre}"?`)) {
      try {
        await dispatch(reactivateEquipamiento(item.id)).unwrap();

        dispatch(
          showNotification({
            message: `Equipamiento "${item.nombre}" reactivado exitosamente`,
            severity: 'success',
          })
        );
      } catch (error: any) {
        console.error('Error al reactivar equipamiento:', error);

        dispatch(
          showNotification({
            message: error || 'Error al reactivar equipamiento',
            severity: 'error',
          })
        );
      }
    }
  };

  // Filtrar según múltiples criterios
  const itemsFiltrados = items.filter((item) => {
    // Filtro por activo/inactivo
    if (!showInactive && !item.activo) return false;

    // NUEVO: Filtro por estado de equipamiento
    if (filtroEstadoId && item.estadoEquipamientoId !== filtroEstadoId) return false;

    // NUEVO: Filtro por stock (solo con cantidad > 0)
    if (filtroSoloConStock && (!item.cantidad || item.cantidad <= 0)) return false;

    return true;
  });

  // Ordenar items filtrados
  const itemsOrdenados = [...itemsFiltrados].sort((a, b) => {
    if (a.orden !== b.orden) return a.orden - b.orden;
    return a.nombre.localeCompare(b.nombre);
  });

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Administración de Equipamientos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona los equipamientos disponibles para asignar a las aulas
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            size="large"
            disabled={loading}
          >
            Nuevo Equipamiento
          </Button>
        </Box>
      </Box>

      {/* NUEVO: Barra de filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
            Filtros:
          </Typography>

          {/* Filtro por Estado */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Estado del Equipamiento</InputLabel>
            <Select
              value={filtroEstadoId}
              onChange={(e) => setFiltroEstadoId(e.target.value as number | '')}
              label="Estado del Equipamiento"
              disabled={loadingEstados}
            >
              <MenuItem value="">
                <em>Todos los estados</em>
              </MenuItem>
              {estados.map((est) => (
                <MenuItem key={est.id} value={est.id}>
                  {est.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Filtro Solo con Stock */}
          <FormControlLabel
            control={
              <Switch
                checked={filtroSoloConStock}
                onChange={(e) => setFiltroSoloConStock(e.target.checked)}
                color="primary"
              />
            }
            label="Solo con stock"
          />

          {/* Mostrar Inactivos */}
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                color="warning"
              />
            }
            label="Mostrar eliminados"
          />

          {/* Botón para limpiar filtros */}
          {(filtroEstadoId || filtroSoloConStock) && (
            <Button
              size="small"
              onClick={() => {
                setFiltroEstadoId('');
                setFiltroSoloConStock(false);
              }}
              sx={{ ml: 'auto' }}
            >
              Limpiar filtros
            </Button>
          )}
        </Box>
      </Paper>

      {/* Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Los equipamientos son recursos que pueden estar disponibles en las aulas (ej: Piano,
        Proyector, Pizarra). Una vez creados, podrán ser asignados a las aulas desde el módulo de
        Gestión de Aulas.
      </Alert>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabla */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="200px">Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell width="150px" align="center">
                Categoría
              </TableCell>
              <TableCell width="100px" align="center">
                Estado Equip.
              </TableCell>
              <TableCell width="80px" align="center">
                Cantidad
              </TableCell>
              <TableCell width="100px" align="center">
                Activo
              </TableCell>
              <TableCell width="80px" align="center">
                Orden
              </TableCell>
              <TableCell width="120px" align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : itemsOrdenados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No hay equipamientos creados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              itemsOrdenados.map((item) => {
                const isInactive = !item.activo;

                return (
                  <TableRow key={item.id} hover sx={{ opacity: isInactive ? 0.6 : 1 }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ opacity: isInactive ? 0.7 : 1 }}>{item.nombre}</span>
                        {isInactive && (
                          <Chip
                            label="ELIMINADO"
                            color="error"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ opacity: isInactive ? 0.7 : 1 }}>
                      {item.descripcion || '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getCategoriaLabel(item.categoriaEquipamiento)}
                        color={getCategoriaColor(item.categoriaEquipamiento)}
                        size="small"
                      />
                    </TableCell>
                    {/* NUEVO: Columna de Estado del Equipamiento */}
                    <TableCell align="center">
                      {item.estadoEquipamiento ? (
                        <Chip
                          label={getEstadoLabel(item.estadoEquipamiento)}
                          color={getEstadoColor(item.estadoEquipamiento)}
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    {/* NUEVO: Columna de Cantidad */}
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="medium">
                        {item.cantidad || 0}
                      </Typography>
                    </TableCell>
                    {/* Columna de Activo (soft delete) */}
                    <TableCell align="center">
                      <Chip
                        label={item.activo ? 'Activo' : 'Inactivo'}
                        color={item.activo ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">{item.orden}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => handleViewClick(item)} color="info">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {isInactive ? (
                        <Tooltip title="Reactivar">
                          <IconButton size="small" onClick={() => handleReactivate(item)} color="success">
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleEditClick(item)} color="primary">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton size="small" onClick={() => handleDeleteClick(item)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulario Dialog */}
      <Dialog
        open={formOpen}
        onClose={handleFormClose}
        maxWidth="sm"
        fullWidth
        disableEnforceFocus
        disableRestoreFocus
      >
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogTitle>
            {selectedItem ? 'Editar Equipamiento' : 'Nuevo Equipamiento'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre"
                    placeholder="Piano, Proyector, etc."
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                    required
                    fullWidth
                  />
                )}
              />

              <Controller
                name="descripcion"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descripción"
                    placeholder="Descripción opcional del equipamiento"
                    error={!!errors.descripcion}
                    helperText={errors.descripcion?.message}
                    multiline
                    rows={3}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="observaciones"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Observaciones"
                    placeholder="Observaciones internas (opcional)"
                    error={!!errors.observaciones}
                    helperText={errors.observaciones?.message}
                    multiline
                    rows={4}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="categoriaEquipamientoId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.categoriaEquipamientoId} required>
                    <InputLabel>Categoría</InputLabel>
                    <Select {...field} label="Categoría" disabled={loadingCategorias}>
                      {loadingCategorias ? (
                        <MenuItem value="">Cargando...</MenuItem>
                      ) : categorias.length === 0 ? (
                        <MenuItem value="">No hay categorías disponibles</MenuItem>
                      ) : (
                        categorias.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.categoriaEquipamientoId && (
                      <FormHelperText>{errors.categoriaEquipamientoId.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              {/* NUEVO: Campo de estado de equipamiento */}
              <Controller
                name="estadoEquipamientoId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.estadoEquipamientoId}>
                    <InputLabel>Estado</InputLabel>
                    <Select {...field} label="Estado" disabled={loadingEstados}>
                      <MenuItem value="">
                        <em>Sin estado</em>
                      </MenuItem>
                      {loadingEstados ? (
                        <MenuItem value="" disabled>Cargando...</MenuItem>
                      ) : estados.length === 0 ? (
                        <MenuItem value="" disabled>No hay estados disponibles</MenuItem>
                      ) : (
                        estados.map((est) => (
                          <MenuItem key={est.id} value={est.id}>
                            {est.nombre}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.estadoEquipamientoId && (
                      <FormHelperText>{errors.estadoEquipamientoId.message}</FormHelperText>
                    )}
                    <FormHelperText>
                      Estado del equipamiento (Nuevo, Usado, etc.)
                    </FormHelperText>
                  </FormControl>
                )}
              />

              {/* NUEVO: Campo de cantidad */}
              <Controller
                name="cantidad"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <TextField
                    {...field}
                    value={value ?? 1}
                    onChange={(e) => onChange(parseInt(e.target.value) || 1)}
                    label="Cantidad"
                    type="number"
                    placeholder="1"
                    error={!!errors.cantidad}
                    helperText={errors.cantidad?.message || 'Stock total del equipamiento (mínimo: 1)'}
                    inputProps={{ min: 1 }}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="orden"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <TextField
                    {...field}
                    value={value ?? 0}
                    onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                    label="Orden"
                    type="number"
                    placeholder="0"
                    error={!!errors.orden}
                    helperText={errors.orden?.message || 'Orden de visualización (0 = primero)'}
                    fullWidth
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleFormClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : selectedItem ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Detalle Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleDetailDialogClose}
        maxWidth="md"
        fullWidth
        disableEnforceFocus
      >
        <DialogTitle>Detalles del Equipamiento</DialogTitle>
        <DialogContent>
          {itemToView && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    ID
                  </Typography>
                  <Typography variant="body1">{itemToView.id}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Código
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={itemToView.codigo} variant="outlined" size="small" />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Nombre
                  </Typography>
                  <Typography variant="body1">{itemToView.nombre}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Categoría
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={getCategoriaLabel(itemToView.categoriaEquipamiento)}
                      color={getCategoriaColor(itemToView.categoriaEquipamiento)}
                      size="small"
                    />
                  </Box>
                </Box>

                {/* NUEVO: Estado del Equipamiento */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Estado del Equipamiento
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {itemToView.estadoEquipamiento ? (
                      <Chip
                        label={getEstadoLabel(itemToView.estadoEquipamiento)}
                        color={getEstadoColor(itemToView.estadoEquipamiento)}
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin estado
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* NUEVO: Cantidad */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Cantidad/Stock
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {itemToView.cantidad || 0} unidades
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Activo
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={itemToView.activo ? 'Activo' : 'Inactivo'}
                      color={itemToView.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Orden
                  </Typography>
                  <Typography variant="body1">{itemToView.orden}</Typography>
                </Box>

                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="caption" color="text.secondary">
                    Descripción
                  </Typography>
                  <Typography variant="body1">{itemToView.descripcion || '-'}</Typography>
                </Box>

                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="caption" color="text.secondary">
                    Observaciones
                  </Typography>
                  <Typography variant="body1">{itemToView.observaciones || '-'}</Typography>
                </Box>

                {itemToView.createdAt && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Creado
                    </Typography>
                    <Typography variant="body2">
                      {new Date(itemToView.createdAt).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                )}

                {itemToView.updatedAt && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Última modificación
                    </Typography>
                    <Typography variant="body2">
                      {new Date(itemToView.updatedAt).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                )}

                {itemToView._count?.aulas_equipamientos !== undefined && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="caption" color="text.secondary">
                      Aulas asignadas
                    </Typography>
                    <Typography variant="body1">
                      {itemToView._count.aulas_equipamientos === 0
                        ? 'No asignado a ninguna aula'
                        : `Asignado a ${itemToView._count.aulas_equipamientos} aula${itemToView._count.aulas_equipamientos > 1 ? 's' : ''}`}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailDialogClose}>Cerrar</Button>
          <Button onClick={handleEditFromDetail} variant="contained" startIcon={<EditIcon />}>
            Editar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        disableEnforceFocus
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar el equipamiento <strong>{itemToDelete?.nombre}</strong>?
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

export default EquipamientosAdminPage;
