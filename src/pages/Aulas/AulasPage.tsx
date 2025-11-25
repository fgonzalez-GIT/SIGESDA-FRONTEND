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
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchAulas,
  createAula,
  updateAula,
  deleteAula,
  setSelectedAula,
  clearError,
} from '../../store/slices/aulasSlice';
import type { Aula, CreateAulaDto, TIPOS_AULA, ESTADOS_AULA } from '@/types/aula.types';
import { showNotification } from '../../store/slices/uiSlice';

const AulasPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { aulas, loading, error, selectedAula } = useAppSelector((state) => state.aulas);

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<Aula>>({
    nombre: '',
    tipo: 'salon',
    capacidad: 0,
    ubicacion: '',
    equipamiento: [],
    estado: 'disponible',
    observaciones: ''
  });

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterEstado, setFilterEstado] = useState<string>('');

  const tiposAula = [
    { value: 'salon', label: 'Salón' },
    { value: 'ensayo', label: 'Sala de Ensayo' },
    { value: 'auditorio', label: 'Auditorio' },
    { value: 'exterior', label: 'Exterior' }
  ];

  const estadosAula = [
    { value: 'disponible', label: 'Disponible' },
    { value: 'ocupado', label: 'Ocupado' },
    { value: 'mantenimiento', label: 'En Mantenimiento' },
    { value: 'fuera_servicio', label: 'Fuera de Servicio' }
  ];

  const equipamientoDisponible = ['Piano', 'Proyector', 'Sistema de Audio', 'Micrófono', 'Pizarra', 'Atriles', 'Sillas', 'Mesas'];

  // Cargar aulas al montar el componente
  useEffect(() => {
    dispatch(fetchAulas({}));
  }, [dispatch]);

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
      setFormData(aula);
    } else {
      dispatch(setSelectedAula(null));
      setFormData({
        nombre: '',
        tipo: 'salon',
        capacidad: 0,
        ubicacion: '',
        equipamiento: [],
        estado: 'disponible',
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
      await dispatch(updateAula({ ...aula, estado: nuevoEstado })).unwrap();
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
    const estadoObj = estadosAula.find(e => e.value === estado);
    return estadoObj?.label || estado;
  };

  const getTipoLabel = (tipo: string) => {
    const tipoObj = tiposAula.find(t => t.value === tipo);
    return tipoObj?.label || tipo;
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterTipo('');
    setFilterEstado('');
  };

  // Aplicar filtros a las aulas
  const filteredAulas = aulas.filter((aula) => {
    // Filtro de búsqueda (nombre, ubicación)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      aula.nombre.toLowerCase().includes(searchLower) ||
      (aula.ubicacion && aula.ubicacion.toLowerCase().includes(searchLower));

    // Filtro por tipo
    const matchesTipo = filterTipo === '' || aula.tipo === filterTipo;

    // Filtro por estado
    const matchesEstado = filterEstado === '' || aula.estado === filterEstado;

    return matchesSearch && matchesTipo && matchesEstado;
  });

  const columns: GridColDef[] = [
    {
      field: 'nombre',
      headerName: 'Nombre',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RoomIcon color="primary" />
          {params.value}
        </Box>
      )
    },
    {
      field: 'tipo',
      headerName: 'Tipo',
      width: 150,
      valueFormatter: (value) => getTipoLabel(value)
    },
    { field: 'capacidad', headerName: 'Capacidad', width: 100 },
    { field: 'ubicacion', headerName: 'Ubicación', width: 180 },
    {
      field: 'equipamiento',
      headerName: 'Equipamiento',
      width: 200,
      renderCell: (params) => {
        // Asegurar que params.value sea un array
        const equipamiento = Array.isArray(params.value) ? params.value : [];

        if (equipamiento.length === 0) {
          return <Chip label="Sin equipamiento" size="small" variant="outlined" color="default" />;
        }

        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {equipamiento.slice(0, 2).map((equipo: string, index: number) => (
              <Chip key={index} label={equipo} size="small" variant="outlined" />
            ))}
            {equipamiento.length > 2 && (
              <Chip label={`+${equipamiento.length - 2}`} size="small" />
            )}
          </Box>
        );
      }
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 150,
      renderCell: (params) => (
        <Chip
          icon={params.value === 'disponible' ? <AvailableIcon /> : <BusyIcon />}
          label={getEstadoLabel(params.value)}
          color={getEstadoChipColor(params.value) as any}
          variant="outlined"
          size="small"
        />
      )
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
          icon={params.row.estado === 'disponible' ? <BusyIcon /> : <AvailableIcon />}
          label={params.row.estado === 'disponible' ? 'Marcar ocupado' : 'Marcar disponible'}
          onClick={() => handleToggleEstado(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Eliminar"
          onClick={() => handleDelete(params.row.id)}
        />
      ]
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
                {aulas.filter(a => a.estado === 'disponible').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Ocupadas
              </Typography>
              <Typography variant="h4" color="warning.main">
                {aulas.filter(a => a.estado === 'ocupado').length}
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
              <MenuItem value="">Todos</MenuItem>
              {tiposAula.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
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
              <MenuItem value="">Todos</MenuItem>
              {estadosAula.map((estado) => (
                <MenuItem key={estado.value} value={estado.value}>
                  {estado.label}
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
                  value={formData.tipo || 'salon'}
                  label="Tipo de Aula"
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as Aula['tipo'] })}
                >
                  {tiposAula.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
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
                  value={formData.estado || 'disponible'}
                  label="Estado"
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as Aula['estado'] })}
                >
                  {estadosAula.map((estado) => (
                    <MenuItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </MenuItem>
                  ))}
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
              <FormControl fullWidth>
                <InputLabel>Equipamiento</InputLabel>
                <Select
                  multiple
                  value={formData.equipamiento || []}
                  label="Equipamiento"
                  onChange={(e) => setFormData({ ...formData, equipamiento: e.target.value as string[] })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {equipamientoDisponible.map((equipo) => (
                    <MenuItem key={equipo} value={equipo}>
                      {equipo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
    </Box>
  );
};

export default AulasPage;
