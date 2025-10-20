import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tabs,
  Tab,
  Tooltip,
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
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchActividades,
  createActividad,
  updateActividad,
  deleteActividad,
  duplicateActividad,
  setSelectedActividad,
  clearError,
  Actividad,
} from '../../store/slices/actividadesSlice';
import { showNotification } from '../../store/slices/uiSlice';
import ActividadForm from '../../components/forms/ActividadForm';

const ActividadesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { actividades, loading, error, selectedActividad } = useAppSelector((state) => state.actividades);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actividadToDelete, setActividadToDelete] = useState<Actividad | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [filterCategoria, setFilterCategoria] = useState<string>('');

  // Mock data for now - in real app this would come from API
  const mockDocentes = [
    { id: 1, nombre: 'María', apellido: 'García' },
    { id: 2, nombre: 'Juan', apellido: 'Pérez' },
    { id: 3, nombre: 'Ana', apellido: 'López' },
  ];

  const mockAulas = [
    { id: 1, nombre: 'Aula 1', capacidad: 20 },
    { id: 2, nombre: 'Aula 2', capacidad: 15 },
    { id: 3, nombre: 'Sala de Ensayo', capacidad: 30 },
  ];

  useEffect(() => {
    dispatch(fetchActividades({}));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(showNotification({
        message: error,
        severity: 'error'
      }));
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAddClick = () => {
    dispatch(setSelectedActividad(null));
    setFormOpen(true);
  };

  const handleEditClick = (actividad: Actividad) => {
    dispatch(setSelectedActividad(actividad));
    setFormOpen(true);
  };

  const handleViewClick = (actividad: Actividad) => {
    dispatch(setSelectedActividad(actividad));
    setFormOpen(true);
  };

  const handleDeleteClick = (actividad: Actividad) => {
    setActividadToDelete(actividad);
    setDeleteDialogOpen(true);
  };

  const handleDuplicateClick = async (actividad: Actividad) => {
    try {
      await dispatch(duplicateActividad(actividad.id)).unwrap();
      dispatch(showNotification({
        message: 'Actividad duplicada exitosamente',
        severity: 'success'
      }));
    } catch (error) {
      dispatch(showNotification({
        message: 'Error al duplicar la actividad',
        severity: 'error'
      }));
    }
  };

  const handleFormSubmit = async (data: Omit<Actividad, 'id' | 'cupoActual' | 'fechaCreacion' | 'docenteNombre' | 'aulaNombre'>) => {
    try {
      if (selectedActividad) {
        await dispatch(updateActividad({
          ...data,
          id: selectedActividad.id,
          cupoActual: selectedActividad.cupoActual,
          fechaCreacion: selectedActividad.fechaCreacion
        })).unwrap();
        dispatch(showNotification({
          message: 'Actividad actualizada exitosamente',
          severity: 'success'
        }));
      } else {
        await dispatch(createActividad(data)).unwrap();
        dispatch(showNotification({
          message: 'Actividad creada exitosamente',
          severity: 'success'
        }));
      }
      setFormOpen(false);
    } catch (error) {
      dispatch(showNotification({
        message: 'Error al guardar la actividad',
        severity: 'error'
      }));
    }
  };

  const handleDeleteConfirm = async () => {
    if (actividadToDelete) {
      try {
        await dispatch(deleteActividad(actividadToDelete.id)).unwrap();
        dispatch(showNotification({
          message: 'Actividad eliminada exitosamente',
          severity: 'success'
        }));
        setDeleteDialogOpen(false);
        setActividadToDelete(null);
      } catch (error) {
        dispatch(showNotification({
          message: 'Error al eliminar la actividad',
          severity: 'error'
        }));
      }
    }
  };

  const formatTime = (time?: string | null) => {
    if (!time) return '-';
    return time.slice(0, 5); // HH:mm format
  };


  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'CORO': 'Coro',
      'CLASE_CANTO': 'Clase de Canto',
      'CLASE_INSTRUMENTO': 'Clase de Instrumento',
      'TALLER': 'Taller',
      'EVENTO': 'Evento',
      'coro': 'Coro',
      'clase': 'Clase',
      'taller': 'Taller',
      'evento': 'Evento'
    };
    return labels[tipo] || tipo;
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels = {
      infantil: 'Infantil',
      juvenil: 'Juvenil',
      adulto: 'Adulto',
      general: 'General'
    };
    return labels[categoria as keyof typeof labels] || categoria;
  };

  const getDiaLabel = (dia: string) => {
    const labels = {
      lunes: 'Lunes',
      martes: 'Martes',
      miercoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes',
      sabado: 'Sábado',
      domingo: 'Domingo'
    };
    return labels[dia as keyof typeof labels] || dia;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'primary';
      case 'inactivo': return 'default';
      case 'suspendido': return 'warning';
      case 'finalizado': return 'default';
      default: return 'default';
    }
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterEstado('');
    setFilterCategoria('');
  };

  const filteredActividades = actividades.filter((actividad) => {
    const tipoUpper = actividad.tipo.toUpperCase();

    // Filtro por tabs (tipo de actividad)
    let matchesTab = false;
    switch (tabValue) {
      case 0: // Todas
        matchesTab = true;
        break;
      case 1: // Coros
        matchesTab = tipoUpper === 'CORO';
        break;
      case 2: // Clases
        matchesTab = tipoUpper === 'CLASE' || tipoUpper === 'CLASE_CANTO' || tipoUpper === 'CLASE_INSTRUMENTO';
        break;
      case 3: // Talleres
        matchesTab = tipoUpper === 'TALLER';
        break;
      case 4: // Eventos
        matchesTab = tipoUpper === 'EVENTO';
        break;
      default:
        matchesTab = true;
    }

    // Filtro de búsqueda (nombre, descripción, docente)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      actividad.nombre.toLowerCase().includes(searchLower) ||
      (actividad.descripcion && actividad.descripcion.toLowerCase().includes(searchLower)) ||
      (actividad.docenteNombre && actividad.docenteNombre.toLowerCase().includes(searchLower));

    // Filtro por estado
    const matchesEstado = filterEstado === '' || actividad.estado === filterEstado;

    // Filtro por categoría
    const matchesCategoria = filterCategoria === '' || actividad.categoria === filterCategoria;

    return matchesTab && matchesSearch && matchesEstado && matchesCategoria;
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Actividades
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Módulo para gestionar coros, clases, talleres y eventos.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          size="large"
        >
          Nueva Actividad
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label="Todas" />
          <Tab label="Coros" />
          <Tab label="Clases" />
          <Tab label="Talleres" />
          <Tab label="Eventos" />
        </Tabs>
      </Paper>

      {/* Sección de Búsqueda y Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Buscar por nombre, descripción o docente..."
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
            <InputLabel>Estado</InputLabel>
            <Select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
              <MenuItem value="suspendido">Suspendido</MenuItem>
              <MenuItem value="finalizado">Finalizado</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              label="Categoría"
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="infantil">Infantil</MenuItem>
              <MenuItem value="juvenil">Juvenil</MenuItem>
              <MenuItem value="adulto">Adulto</MenuItem>
              <MenuItem value="general">General</MenuItem>
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
              {filteredActividades.length} de {actividades.length} actividades
            </Typography>
          </Box>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {/* ID column removed - only used internally for key prop */}
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Día</TableCell>
              <TableCell>Horario</TableCell>
              <TableCell>Docente</TableCell>
              <TableCell>Cupo</TableCell>
              <TableCell>Secciones</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredActividades.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No hay actividades registradas
                </TableCell>
              </TableRow>
            )}
            {filteredActividades.map((actividad) => (
              <TableRow key={actividad.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {actividad.nombre}
                    </Typography>
                    {actividad.descripcion && (
                      <Typography variant="caption" color="text.secondary">
                        {actividad.descripcion}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{getTipoLabel(actividad.tipo)}</TableCell>
                <TableCell>{getCategoriaLabel(actividad.categoria)}</TableCell>
                <TableCell>{getDiaLabel(actividad.diaSemana)}</TableCell>
                <TableCell>
                  {formatTime(actividad.horaInicio)} - {formatTime(actividad.horaFin)}
                </TableCell>
                <TableCell>{actividad.docenteNombre || '-'}</TableCell>
                <TableCell>
                  {actividad.cupoActual}
                  {actividad.cupoMaximo && ` / ${actividad.cupoMaximo}`}
                </TableCell>
                <TableCell>
                  <Tooltip title="Crear sección para esta actividad">
                    <Button
                      size="small"
                      startIcon={<SchoolIcon />}
                      onClick={() => navigate(`/secciones/new?actividadId=${actividad.id}`)}
                      variant="outlined"
                      sx={{ minWidth: 'auto' }}
                    >
                      Nueva
                    </Button>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip
                    label={actividad.estado}
                    color={getEstadoColor(actividad.estado) as any}
                    size="small"
                    variant={actividad.estado === 'activo' ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewClick(actividad)}
                      color="primary"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(actividad)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDuplicateClick(actividad)}
                      color="default"
                    >
                      <CopyIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(actividad)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ActividadForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        actividad={selectedActividad}
        loading={loading}
        docentes={mockDocentes}
        aulas={mockAulas}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar la actividad "{actividadToDelete?.nombre}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActividadesPage;