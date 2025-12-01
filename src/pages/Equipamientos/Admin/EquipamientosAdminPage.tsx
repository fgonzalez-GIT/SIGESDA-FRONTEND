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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
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
} from '@/store/slices/equipamientosSlice';
import {
  createEquipamientoSchema,
  updateEquipamientoSchema,
  type CreateEquipamientoFormData,
  type UpdateEquipamientoFormData,
} from '@/schemas/equipamiento.schema';
import type { Equipamiento, CategoriaEquipamiento } from '@/types/equipamiento.types';
import {
  getCategoriaLabel,
  getCategoriaColor,
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

  // Estado para categorías
  const [categorias, setCategorias] = useState<CategoriaEquipamiento[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  // Cargar equipamientos y categorías al montar
  useEffect(() => {
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

    loadCategorias();
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
          orden: selectedItem.orden,
        }
      : {
          nombre: '',
          descripcion: '',
          observaciones: '',
          categoriaEquipamientoId: '' as any,
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
        orden: selectedItem.orden,
      });
    } else {
      reset({
        nombre: '',
        descripcion: '',
        observaciones: '',
        categoriaEquipamientoId: '' as any,
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

      // Eliminar el foco de cualquier elemento activo antes de cerrar el Dialog
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // Primero cerrar el dialog de detalle completamente
      setDetailDialogOpen(false);
      setItemToView(null);

      // Delay para asegurar que el dialog de detalle se cierre completamente y
      // MUI quite el aria-hidden del root antes de abrir el de edición
      setTimeout(() => {
        setSelectedItem(itemToEdit);
        setFormOpen(true);
      }, 200);
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

  // Ordenar items
  const itemsOrdenados = [...items].sort((a, b) => {
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
                Estado
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
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : itemsOrdenados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No hay equipamientos creados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              itemsOrdenados.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>{item.descripcion || '-'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getCategoriaLabel(item.categoriaEquipamiento)}
                      color={getCategoriaColor(item.categoriaEquipamiento)}
                      size="small"
                    />
                  </TableCell>
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulario Dialog */}
      <Dialog open={formOpen} onClose={handleFormClose} maxWidth="sm" fullWidth>
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
      <Dialog open={detailDialogOpen} onClose={handleDetailDialogClose} maxWidth="md" fullWidth>
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
                  <Typography variant="body1">
                    <Chip label={itemToView.codigo} variant="outlined" size="small" />
                  </Typography>
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
                  <Typography variant="body1">
                    <Chip
                      label={getCategoriaLabel(itemToView.categoriaEquipamiento)}
                      color={getCategoriaColor(itemToView.categoriaEquipamiento)}
                      size="small"
                    />
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Estado
                  </Typography>
                  <Typography variant="body1">
                    <Chip
                      label={itemToView.activo ? 'Activo' : 'Inactivo'}
                      color={itemToView.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </Typography>
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
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
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
