import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Paper,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Room as RoomIcon,
  EventAvailable as AvailableIcon,
  EventBusy as BusyIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchAulas,
  createAula,
  updateAula,
  deleteAula,
  reactivateAula,
  setSelectedAula,
  clearError,
} from '../../store/slices/aulasSlice';
import { fetchEquipamientos } from '../../store/slices/equipamientosSlice';
import type { Aula, CreateAulaDto, AulaEquipamiento, TipoAulaCatalogo, EstadoAulaCatalogo } from '@/types/aula.types';
import { showNotification } from '../../store/slices/uiSlice';
import { AulaEquipamientoManager } from '@/components/aulas/AulaEquipamientoManager';
import { catalogosAulasApi } from '@/services/catalogosAulasApi';

const AulasPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { aulas, loading, error, selectedAula } = useAppSelector((state) => state.aulas);

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateAulaDto>>({
    nombre: '',
    tipoAulaId: undefined, // ID del tipo de aula
    capacidad: 0,
    ubicacion: '',
    equipamientos: [], // Array de equipamientos con cantidad y observaciones
    estadoAulaId: undefined, // ID del estado de aula
    observaciones: ''
  });

  // Estados para catálogos
  const [tiposAula, setTiposAula] = useState<TipoAulaCatalogo[]>([]);
  const [estadosAula, setEstadosAula] = useState<EstadoAulaCatalogo[]>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [showInactive, setShowInactive] = useState(false);

  // Estados para dialog de detalle
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [aulaToView, setAulaToView] = useState<Aula | null>(null);

  // Cargar aulas, equipamientos y catálogos al montar el componente
  useEffect(() => {
    // Cargar solo aulas activas por defecto
    if (showInactive) {
      dispatch(fetchAulas({})); // Todas las aulas
    } else {
      dispatch(fetchAulas({ activa: true })); // Solo activas
    }
    dispatch(fetchEquipamientos({ includeInactive: false, limit: 100 }));

    // Cargar catálogos de tipos y estados
    const loadCatalogos = async () => {
      setLoadingCatalogos(true);
      try {
        const { tipos, estados } = await catalogosAulasApi.getAllCatalogos();
        setTiposAula(tipos);
        setEstadosAula(estados);
      } catch (error) {
        console.error('Error al cargar catálogos de aulas:', error);
        dispatch(showNotification({
          message: 'Error al cargar catálogos',
          severity: 'warning'
        }));
      } finally {
        setLoadingCatalogos(false);
      }
    };

    loadCatalogos();
  }, [dispatch, showInactive]);

  // Mostrar errores
  useEffect(() => {
    if (error) {
      dispatch(showNotification({
        message: error,
        severity: 'error'
      }));
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleOpenDialog = (aula?: Aula) => {
    if (aula) {
      dispatch(setSelectedAula(aula));

      // ✅ Mapear equipamientos al formato de formulario (AulaEquipamiento[])
      // Prioridad: aulas_equipamientos > equipamientos > equipamientoIds
      let equipamientosFormateados: AulaEquipamiento[] = [];

      if (aula.aulas_equipamientos && aula.aulas_equipamientos.length > 0) {
        // ✅ CORRECTO: Formato del backend con cantidad y observaciones
        equipamientosFormateados = aula.aulas_equipamientos.map(ae => ({
          equipamientoId: ae.equipamientoId,
          cantidad: ae.cantidad,
          observaciones: ae.observaciones || undefined,
        }));
      } else if (aula.equipamientos && aula.equipamientos.length > 0) {
        // FALLBACK: Si vienen equipamientos expandidos (legacy)
        equipamientosFormateados = aula.equipamientos.map(eq => ({
          equipamientoId: eq.id,
          cantidad: 1, // Valor por defecto para datos legacy
          observaciones: undefined,
        }));
      } else if (aula.equipamientoIds && aula.equipamientoIds.length > 0) {
        // FALLBACK: Si vienen solo los IDs
        equipamientosFormateados = aula.equipamientoIds.map(id => ({
          equipamientoId: id,
          cantidad: 1, // Valor por defecto para datos legacy
          observaciones: undefined,
        }));
      }

      setFormData({
        nombre: aula.nombre,
        descripcion: aula.descripcion,
        capacidad: aula.capacidad,
        ubicacion: aula.ubicacion,
        equipamientos: equipamientosFormateados,
        tipoAulaId: aula.tipoAulaId || undefined,
        estadoAulaId: aula.estadoAulaId || undefined,
        observaciones: aula.observaciones,
      });
    } else {
      dispatch(setSelectedAula(null));
      setFormData({
        nombre: '',
        tipoAulaId: undefined,
        capacidad: 0,
        ubicacion: '',
        equipamientos: [],
        estadoAulaId: undefined,
        observaciones: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    dispatch(setSelectedAula(null));
    setFormData({});
  };

  const handleSave = async () => {
    try {
      if (selectedAula) {
        // Actualizar aula existente
        await dispatch(updateAula({ id: selectedAula.id, data: formData })).unwrap();
        dispatch(showNotification({
          message: 'Aula actualizada exitosamente',
          severity: 'success'
        }));
      } else {
        // Crear nueva aula
        await dispatch(createAula(formData as CreateAulaDto)).unwrap();
        dispatch(showNotification({
          message: 'Aula creada exitosamente',
          severity: 'success'
        }));
      }
      handleCloseDialog();
    } catch (error) {
      dispatch(showNotification({
        message: 'Error al guardar el aula',
        severity: 'error'
      }));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar esta aula?')) {
      try {
        await dispatch(deleteAula(id)).unwrap();
        dispatch(showNotification({
          message: 'Aula eliminada exitosamente',
          severity: 'success'
        }));
      } catch (error) {
        dispatch(showNotification({
          message: 'Error al eliminar el aula',
          severity: 'error'
        }));
      }
    }
  };

  const handleToggleEstado = async (aula: Aula) => {
    try {
      const nuevoEstado = aula.estado === 'disponible' ? 'ocupado' : 'disponible';
      await dispatch(updateAula({ id: aula.id, data: { estado: nuevoEstado } })).unwrap();
      dispatch(showNotification({
        message: `Aula marcada como ${nuevoEstado}`,
        severity: 'success'
      }));
    } catch (error) {
      dispatch(showNotification({
        message: 'Error al actualizar el estado',
        severity: 'error'
      }));
    }
  };

  const handleReactivate = async (aula: Aula) => {
    if (window.confirm(`¿Está seguro que desea reactivar el aula "${aula.nombre}"?`)) {
      try {
        await dispatch(reactivateAula(aula.id)).unwrap();
        dispatch(showNotification({
          message: `Aula "${aula.nombre}" reactivada exitosamente`,
          severity: 'success'
        }));
      } catch (error) {
        dispatch(showNotification({
          message: 'Error al reactivar el aula',
          severity: 'error'
        }));
      }
    }
  };

  // Handlers para dialog de detalle
  const handleViewClick = (aula: Aula) => {
    setAulaToView(aula);
    setDetailDialogOpen(true);
  };

  const handleDetailDialogClose = () => {
    setDetailDialogOpen(false);
    setAulaToView(null);
  };

  const handleEditFromDetail = () => {
    if (aulaToView) {
      const aulaToEdit = aulaToView;

      // Eliminar el foco de cualquier elemento activo antes de cerrar el Dialog
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // Primero cerrar el dialog de detalle completamente
      setDetailDialogOpen(false);
      setAulaToView(null);

      // Delay para asegurar que el dialog de detalle se cierre completamente y
      // MUI quite el aria-hidden del root antes de abrir el de edición
      setTimeout(() => {
        handleOpenDialog(aulaToEdit);
      }, 200);
    }
  };

  const getEstadoChipColor = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return 'success';
      case 'ocupado':
        return 'warning';
      case 'mantenimiento':
        return 'info';
      case 'fuera_servicio':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEstadoLabel = (estado: string) => {
    const estadoObj = estadosAula.find(e => e.codigo === estado);
    return estadoObj?.nombre || estado;
  };

  const getTipoLabel = (tipo: string) => {
    const tipoObj = tiposAula.find(t => t.codigo === tipo);
    return tipoObj?.nombre || tipo;
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterTipo('');
    setFilterEstado('');
    setShowInactive(false);
  };

  // Aplicar filtros a las aulas
  const filteredAulas = aulas.filter((aula) => {
    // Filtro de búsqueda (nombre, ubicación)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      aula.nombre.toLowerCase().includes(searchLower) ||
      (aula.ubicacion && aula.ubicacion.toLowerCase().includes(searchLower));

    // Filtro por tipo (comparar con código del catálogo)
    const matchesTipo = filterTipo === '' || aula.tipoAula?.codigo === filterTipo;

    // Filtro por estado (comparar con código del catálogo)
    const matchesEstado = filterEstado === '' || aula.estadoAula?.codigo === filterEstado;

    return matchesSearch && matchesTipo && matchesEstado;
  });

  const columns: GridColDef[] = [
    {
      field: 'nombre',
      headerName: 'Nombre',
      width: 250,
      renderCell: (params) => {
        const aula = params.row as Aula;
        const isInactive = aula.activa === false;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RoomIcon color={isInactive ? 'disabled' : 'primary'} />
            <span style={{ opacity: isInactive ? 0.5 : 1 }}>
              {params.value}
            </span>
            {isInactive && (
              <Chip
                label="ELIMINADA"
                color="error"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        );
      }
    },
    {
      field: 'tipoAula',
      headerName: 'Tipo',
      width: 150,
      renderCell: (params) => {
        const aula = params.row as Aula;
        // Mostrar nombre del tipo si está expandido, sino mostrar ID
        return aula.tipoAula?.nombre || `ID: ${aula.tipoAulaId}` || 'Sin tipo';
      }
    },
    { field: 'capacidad', headerName: 'Capacidad', width: 100 },
    { field: 'ubicacion', headerName: 'Ubicación', width: 180 },
    {
      field: 'equipamientos',
      headerName: 'Equipamientos',
      width: 250,
      renderCell: (params) => {
        const aula = params.row as Aula;

        // ✅ PRIORIDAD 1: aulas_equipamientos (formato correcto del backend)
        // Estructura: aula.aulas_equipamientos[].equipamiento.nombre
        let items: { id?: number; nombre: string; cantidad?: number }[] = [];

        if (aula.aulas_equipamientos && aula.aulas_equipamientos.length > 0) {
          // ✅ Formato correcto: aulas_equipamientos con equipamiento anidado
          items = aula.aulas_equipamientos.map(ae => ({
            id: ae.equipamiento.id,
            nombre: ae.equipamiento.nombre,
            cantidad: ae.cantidad
          }));
        } else if (aula.equipamientos && aula.equipamientos.length > 0) {
          // FALLBACK: Equipamientos expandidos (legacy)
          items = aula.equipamientos.map(eq => ({ id: eq.id, nombre: eq.nombre }));
        } else if (aula.equipamientoIds && aula.equipamientoIds.length > 0) {
          // Solo IDs sin expandir - mostrar count genérico
          return (
            <Chip
              label={`${aula.equipamientoIds.length} equipamiento${aula.equipamientoIds.length > 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
              color="primary"
            />
          );
        } else if (aula.equipamiento && aula.equipamiento.length > 0) {
          // LEGACY: array de strings
          items = aula.equipamiento.map((eq, idx) => ({ id: idx, nombre: eq }));
        }

        if (items.length === 0) {
          return <Chip label="Sin equipamiento" size="small" variant="outlined" color="default" />;
        }

        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {items.slice(0, 2).map((item) => (
              <Chip
                key={item.id || item.nombre}
                label={item.cantidad && item.cantidad > 1 ? `${item.nombre} (${item.cantidad})` : item.nombre}
                size="small"
                variant="outlined"
              />
            ))}
            {items.length > 2 && (
              <Chip label={`+${items.length - 2}`} size="small" />
            )}
          </Box>
        );
      }
    },
    {
      field: 'estadoAula',
      headerName: 'Estado',
      width: 150,
      renderCell: (params) => {
        const aula = params.row as Aula;
        const estadoNombre = aula.estadoAula?.nombre || 'Sin estado';
        const estadoCodigo = aula.estadoAula?.codigo || '';

        // Determinar color según código
        const getColor = (codigo: string) => {
          if (codigo.includes('DISPONIBLE')) return 'success';
          if (codigo.includes('RESERVADA')) return 'warning';
          if (codigo.includes('CERRADA')) return 'error';
          if (codigo.includes('MANTENIMIENTO')) return 'info';
          return 'default';
        };

        return (
          <Chip
            icon={estadoCodigo.includes('DISPONIBLE') ? <AvailableIcon /> : <BusyIcon />}
            label={estadoNombre}
            color={getColor(estadoCodigo) as any}
            variant="outlined"
            size="small"
          />
        );
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 150,
      getActions: (params) => {
        const aula = params.row as Aula;
        const isInactive = aula.activa === false;

        // Acciones para aulas inactivas
        if (isInactive) {
          return [
            <GridActionsCellItem
              icon={<VisibilityIcon />}
              label="Ver detalles"
              onClick={() => handleViewClick(aula)}
              showInMenu={false}
            />,
            <GridActionsCellItem
              icon={<RestoreIcon />}
              label="Reactivar"
              onClick={() => handleReactivate(aula)}
              showInMenu={false}
            />,
          ];
        }

        // Acciones para aulas activas
        return [
          <GridActionsCellItem
            icon={<VisibilityIcon />}
            label="Ver detalles"
            onClick={() => handleViewClick(aula)}
            showInMenu={false}
          />,
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Editar"
            onClick={() => handleOpenDialog(aula)}
          />,
          <GridActionsCellItem
            icon={aula.estado === 'disponible' ? <BusyIcon /> : <AvailableIcon />}
            label={aula.estado === 'disponible' ? 'Marcar ocupado' : 'Marcar disponible'}
            onClick={() => handleToggleEstado(aula)}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Eliminar"
            onClick={() => handleDelete(aula.id)}
          />
        ];
      }
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          🏢 Gestión de Aulas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Aula
        </Button>
      </Box>

      {/* Resumen rápido */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Aulas
              </Typography>
              <Typography variant="h4">
                {aulas.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Disponibles
              </Typography>
              <Typography variant="h4" color="success.main">
                {aulas.filter(a => a.estadoAula?.codigo?.includes('DISPONIBLE')).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Reservadas
              </Typography>
              <Typography variant="h4" color="warning.main">
                {aulas.filter(a => a.estadoAula?.codigo?.includes('RESERVADA')).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Capacidad Total
              </Typography>
              <Typography variant="h4">
                {aulas.reduce((sum, aula) => sum + aula.capacidad, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sección de Búsqueda y Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Buscar por nombre o ubicación..."
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

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              label="Tipo"
            >
              <MenuItem key="all" value="">Todos</MenuItem>
              {tiposAula.map((tipo) => (
                <MenuItem key={tipo.id} value={tipo.codigo}>
                  {tipo.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              label="Estado"
            >
              <MenuItem key="all" value="">Todos</MenuItem>
              {estadosAula.map((estado) => (
                <MenuItem key={estado.id} value={estado.codigo}>
                  {estado.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            onClick={handleClearFilters}
            startIcon={<FilterListIcon />}
          >
            Limpiar Filtros
          </Button>

          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                color="warning"
              />
            }
            label="Mostrar aulas eliminadas"
          />

          <Box sx={{ ml: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
              {filteredAulas.length} de {aulas.length} aulas
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabla de aulas */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredAulas}
          columns={columns}
          loading={loading}
          paginationModel={{ pageSize: 10, page: 0 }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              padding: '8px',
            },
          }}
        />
      </Box>

      {/* Dialog para crear/editar aula */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedAula ? 'Editar Aula' : 'Nueva Aula'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nombre del Aula"
                value={formData.nombre || ''}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Aula</InputLabel>
                <Select
                  value={formData.tipoAulaId || ''}
                  label="Tipo de Aula"
                  onChange={(e) => setFormData({ ...formData, tipoAulaId: e.target.value as number })}
                  disabled={loadingCatalogos}
                >
                  {loadingCatalogos ? (
                    <MenuItem key="loading" value="">Cargando...</MenuItem>
                  ) : tiposAula.length === 0 ? (
                    <MenuItem key="empty" value="">No hay tipos disponibles</MenuItem>
                  ) : (
                    tiposAula.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Capacidad"
                type="number"
                value={formData.capacidad || ''}
                onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Ubicación"
                value={formData.ubicacion || ''}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estadoAulaId || ''}
                  label="Estado"
                  onChange={(e) => setFormData({ ...formData, estadoAulaId: e.target.value as number })}
                  disabled={loadingCatalogos}
                >
                  {loadingCatalogos ? (
                    <MenuItem key="loading" value="">Cargando...</MenuItem>
                  ) : estadosAula.length === 0 ? (
                    <MenuItem key="empty" value="">No hay estados disponibles</MenuItem>
                  ) : (
                    estadosAula.map((estado) => (
                      <MenuItem key={estado.id} value={estado.id}>
                        {estado.nombre}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.descripcion || ''}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <AulaEquipamientoManager
                value={formData.equipamientos || []}
                onChange={(newEquipamientos) => setFormData({ ...formData, equipamientos: newEquipamientos })}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Observaciones"
                multiline
                rows={3}
                value={formData.observaciones || ''}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {selectedAula ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalle (Read-only) */}
      <Dialog open={detailDialogOpen} onClose={handleDetailDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalles del Aula
        </DialogTitle>
        <DialogContent>
          {aulaToView && (
            <Box sx={{ mt: 2 }}>
              {/* Información General */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                Información General
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 4 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">ID</Typography>
                  <Typography variant="body1">{aulaToView.id}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Nombre</Typography>
                  <Typography variant="body1" fontWeight={600}>{aulaToView.nombre}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Tipo</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={aulaToView.tipoAula?.nombre || 'Sin tipo'}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Estado</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={aulaToView.estadoAula?.nombre || 'Sin estado'}
                      color={
                        aulaToView.estadoAula?.codigo.includes('DISPONIBLE') ? 'success' :
                        aulaToView.estadoAula?.codigo.includes('RESERVADA') ? 'warning' :
                        aulaToView.estadoAula?.codigo.includes('CERRADA') ? 'error' :
                        aulaToView.estadoAula?.codigo.includes('MANTENIMIENTO') ? 'info' :
                        'default'
                      }
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Capacidad</Typography>
                  <Typography variant="body1">{aulaToView.capacidad} personas</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Ubicación</Typography>
                  <Typography variant="body1">{aulaToView.ubicacion || 'No especificada'}</Typography>
                </Box>
              </Box>

              {/* Descripción */}
              {aulaToView.descripcion && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary">Descripción</Typography>
                  <Typography variant="body1">{aulaToView.descripcion}</Typography>
                </Box>
              )}

              {/* Equipamientos */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                Equipamientos Asignados
              </Typography>
              {aulaToView.aulas_equipamientos && aulaToView.aulas_equipamientos.length > 0 ? (
                <Paper variant="outlined" sx={{ mb: 3 }}>
                  <Box sx={{ p: 2 }}>
                    {aulaToView.aulas_equipamientos.map((ae, index) => (
                      <Box
                        key={ae.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 1,
                          borderBottom: index < aulaToView.aulas_equipamientos!.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight={500}>
                              {ae.equipamiento.nombre}
                            </Typography>
                            {ae.cantidad > 1 && (
                              <Chip
                                label={`x${ae.cantidad}`}
                                size="small"
                                color="primary"
                                variant="filled"
                              />
                            )}
                          </Box>
                          {ae.equipamiento.descripcion && (
                            <Typography variant="caption" color="text.secondary">
                              {ae.equipamiento.descripcion}
                            </Typography>
                          )}
                          {ae.observaciones && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                              Obs: {ae.observaciones}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={ae.equipamiento.categoriaEquipamiento?.nombre || 'Sin categoría'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    ))}
                  </Box>
                </Paper>
              ) : aulaToView.equipamientos && aulaToView.equipamientos.length > 0 ? (
                // FALLBACK: Formato legacy de equipamientos
                <Paper variant="outlined" sx={{ mb: 3 }}>
                  <Box sx={{ p: 2 }}>
                    {aulaToView.equipamientos.map((eq, index) => (
                      <Box
                        key={eq.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 1,
                          borderBottom: index < aulaToView.equipamientos!.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight={500}>{eq.nombre}</Typography>
                          {eq.descripcion && (
                            <Typography variant="caption" color="text.secondary">{eq.descripcion}</Typography>
                          )}
                        </Box>
                        <Chip
                          label={eq.categoriaEquipamiento?.nombre || 'Sin categoría'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    ))}
                  </Box>
                </Paper>
              ) : aulaToView.equipamientoIds && aulaToView.equipamientoIds.length > 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  {aulaToView.equipamientoIds.length} equipamiento(s) asignado(s) (detalles no disponibles)
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                  No hay equipamientos asignados a esta aula
                </Alert>
              )}

              {/* Observaciones */}
              {aulaToView.observaciones && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary">Observaciones</Typography>
                  <Typography variant="body1">{aulaToView.observaciones}</Typography>
                </Box>
              )}

              {/* Metadata */}
              {aulaToView.fechaCreacion && (
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Creada: {new Date(aulaToView.fechaCreacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              )}
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
    </Box>
  );
};

export default AulasPage;
