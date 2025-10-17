import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Alert,
  Autocomplete,
  FormControlLabel,
  Switch,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  MusicNote as ActivityIcon,
  DateRange as DateIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  School as SchoolIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
// import seccionesApi from '../../services/seccionesApi'; // REMOVED: Secciones module deleted

interface Participacion {
  id: number;
  personaId: number;
  personaNombre: string;
  actividadId: number;
  actividadNombre: string;
  seccionId?: number;
  seccionNombre?: string;
  fechaInscripcion: Date;
  fechaBaja?: Date;
  estado: 'Activo' | 'Inactivo' | 'Suspendido';
  observaciones?: string;
}

interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  tipo: string;
}

interface Actividad {
  id: number;
  nombre: string;
  tipo: string;
}

const ParticipacionPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const personaIdParam = searchParams.get('personaId');

  const [participaciones, setParticipaciones] = useState<Participacion[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [seccionesPorPersona, setSeccionesPorPersona] = useState<{ [key: number]: any[] }>({});
  const [loadingSecciones, setLoadingSecciones] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedParticipacion, setSelectedParticipacion] = useState<Participacion | null>(null);
  const [formData, setFormData] = useState<Partial<Participacion>>({
    personaId: personaIdParam ? parseInt(personaIdParam) : 0,
    actividadId: 0,
    fechaInscripcion: new Date(),
    estado: 'Activo',
    observaciones: ''
  });

  const estadosParticipacion = ['Activo', 'Inactivo', 'Suspendido'] as const;

  useEffect(() => {
    // Datos de ejemplo - en producción vendrían de la API
    setPersonas([
      { id: 1, nombre: 'María', apellido: 'González', tipo: 'Socio' },
      { id: 2, nombre: 'Carlos', apellido: 'Rodríguez', tipo: 'Socio' },
      { id: 3, nombre: 'Ana', apellido: 'López', tipo: 'Docente' },
      { id: 4, nombre: 'Pedro', apellido: 'Martínez', tipo: 'Socio' },
      { id: 5, nombre: 'Laura', apellido: 'Fernández', tipo: 'Socio' }
    ]);

    setActividades([
      { id: 1, nombre: 'Coro Principal', tipo: 'Coro' },
      { id: 2, nombre: 'Coro Infantil', tipo: 'Coro' },
      { id: 3, nombre: 'Clases de Piano', tipo: 'Clase' },
      { id: 4, nombre: 'Clases de Guitarra', tipo: 'Clase' },
      { id: 5, nombre: 'Teoría Musical', tipo: 'Clase' }
    ]);

    setParticipaciones([
      {
        id: 1,
        personaId: 1,
        personaNombre: 'María González',
        actividadId: 1,
        actividadNombre: 'Coro Principal',
        fechaInscripcion: new Date('2024-01-15'),
        estado: 'Activo'
      },
      {
        id: 2,
        personaId: 2,
        personaNombre: 'Carlos Rodríguez',
        actividadId: 3,
        actividadNombre: 'Clases de Piano',
        fechaInscripcion: new Date('2024-02-01'),
        estado: 'Activo'
      },
      {
        id: 3,
        personaId: 4,
        personaNombre: 'Pedro Martínez',
        actividadId: 2,
        actividadNombre: 'Coro Infantil',
        fechaInscripcion: new Date('2024-01-20'),
        fechaBaja: new Date('2024-06-15'),
        estado: 'Inactivo',
        observaciones: 'Se mudó de ciudad'
      },
      {
        id: 4,
        personaId: 5,
        personaNombre: 'Laura Fernández',
        actividadId: 4,
        actividadNombre: 'Clases de Guitarra',
        fechaInscripcion: new Date('2024-03-10'),
        estado: 'Suspendido',
        observaciones: 'Problemas de pago'
      }
    ]);
  }, []);

  // Cargar secciones para cada persona
  // NOTA: Deshabilitado porque esta página usa datos mock con IDs numéricos
  // que no existen en el backend (que usa IDs tipo string/cuid)
  // La funcionalidad de secciones está disponible en PersonasPageSimple con datos reales
  useEffect(() => {
    // Comentado para evitar errores 400 con datos mock
    // En producción, esta funcionalidad debería integrarse con datos reales de la API
    /*
    const loadSeccionesPorPersona = async () => {
      setLoadingSecciones(true);
      const secciones: { [key: number]: any[] } = {};

      // Obtener IDs únicos de personas
      const personasIds = Array.from(new Set(participaciones.map(p => p.personaId)));

      for (const personaId of personasIds) {
        try {
          const response = await seccionesApi.getSeccionesPorPersona(personaId.toString(), true);
          secciones[personaId] = response.data;
        } catch (error) {
          console.error(`Error al cargar secciones para persona ${personaId}:`, error);
          secciones[personaId] = [];
        }
      }

      setSeccionesPorPersona(secciones);
      setLoadingSecciones(false);
    };

    if (participaciones.length > 0) {
      loadSeccionesPorPersona();
    }
    */
    setLoadingSecciones(false);
  }, [participaciones]);

  const handleOpenDialog = (participacion?: Participacion) => {
    if (participacion) {
      setSelectedParticipacion(participacion);
      setFormData(participacion);
    } else {
      setSelectedParticipacion(null);
      setFormData({
        personaId: 0,
        actividadId: 0,
        fechaInscripcion: new Date(),
        estado: 'Activo',
        observaciones: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedParticipacion(null);
    setFormData({});
  };

  const handleSave = () => {
    const persona = personas.find(p => p.id === formData.personaId);
    const actividad = actividades.find(a => a.id === formData.actividadId);

    if (!persona || !actividad) {
      alert('Debe seleccionar una persona y una actividad');
      return;
    }

    const participacionData = {
      ...formData as Participacion,
      personaNombre: `${persona.nombre} ${persona.apellido}`,
      actividadNombre: actividad.nombre
    };

    if (selectedParticipacion) {
      // Actualizar participación existente
      setParticipaciones(prev => prev.map(part =>
        part.id === selectedParticipacion.id ? participacionData : part
      ));
    } else {
      // Crear nueva participación
      const newParticipacion: Participacion = {
        ...participacionData,
        id: Date.now()
      };
      setParticipaciones(prev => [...prev, newParticipacion]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    setParticipaciones(prev => prev.filter(part => part.id !== id));
  };

  const handleCambiarEstado = (id: number, nuevoEstado: Participacion['estado']) => {
    setParticipaciones(prev => prev.map(part =>
      part.id === id ? { ...part, estado: nuevoEstado } : part
    ));
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'success';
      case 'Inactivo':
        return 'error';
      case 'Suspendido':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'personaNombre',
      headerName: 'Persona',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" />
          {params.value}
        </Box>
      )
    },
    {
      field: 'actividadNombre',
      headerName: 'Actividad',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ActivityIcon color="secondary" />
          {params.value}
        </Box>
      )
    },
    {
      field: 'secciones',
      headerName: 'Secciones',
      width: 150,
      renderCell: (params) => {
        const personaId = params.row.personaId;
        const secciones = seccionesPorPersona[personaId] || [];

        if (loadingSecciones && !seccionesPorPersona[personaId]) {
          return <CircularProgress size={20} />;
        }

        if (secciones.length === 0) {
          return (
            <Chip
              label="Sin secciones"
              size="small"
              color="default"
              variant="outlined"
            />
          );
        }

        return (
          <Tooltip title={secciones.map(s => s.nombre).join(', ')}>
            <Chip
              label={`${secciones.length} ${secciones.length === 1 ? 'sección' : 'secciones'}`}
              size="small"
              color="success"
              variant="outlined"
              icon={<SchoolIcon />}
              onClick={() => {
                // Si hay solo una sección, navegar directamente
                if (secciones.length === 1) {
                  navigate(`/secciones/${secciones[0].id}`);
                } else {
                  // Si hay múltiples, ir a la lista filtrada
                  navigate(`/secciones?personaId=${personaId}`);
                }
              }}
              sx={{ cursor: 'pointer' }}
            />
          </Tooltip>
        );
      }
    },
    {
      field: 'fechaInscripcion',
      headerName: 'Fecha Inscripción',
      width: 130,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'fechaBaja',
      headerName: 'Fecha Baja',
      width: 110,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : '-'
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={params.value === 'Activo' ? <ActiveIcon /> : <InactiveIcon />}
          label={params.value}
          color={getEstadoColor(params.value) as any}
          variant="outlined"
          size="small"
        />
      )
    },
    {
      field: 'observaciones',
      headerName: 'Observaciones',
      width: 150,
      renderCell: (params) => params.value || '-'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleOpenDialog(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Eliminar"
          onClick={() => handleDelete(params.row.id)}
        />
      ]
    }
  ];

  // Filtrar participaciones si hay personaId en URL
  const filteredParticipaciones = personaIdParam
    ? participaciones.filter(p => p.personaId === parseInt(personaIdParam))
    : participaciones;

  // Obtener nombre de la persona si hay filtro
  const personaFiltrada = personaIdParam
    ? personas.find(p => p.id === parseInt(personaIdParam))
    : null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🎭 Participación en Actividades
          </Typography>
          {personaFiltrada && (
            <Chip
              label={`Filtrando por: ${personaFiltrada.nombre} ${personaFiltrada.apellido}`}
              onDelete={() => navigate('/participacion')}
              color="primary"
              sx={{ mt: 1 }}
            />
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Participación
        </Button>
      </Box>

      {/* Resumen rápido */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Participaciones
              </Typography>
              <Typography variant="h4">
                {filteredParticipaciones.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Activas
              </Typography>
              <Typography variant="h4" color="success.main">
                {filteredParticipaciones.filter(p => p.estado === 'Activo').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Suspendidas
              </Typography>
              <Typography variant="h4" color="warning.main">
                {filteredParticipaciones.filter(p => p.estado === 'Suspendido').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inactivas
              </Typography>
              <Typography variant="h4" color="error.main">
                {filteredParticipaciones.filter(p => p.estado === 'Inactivo').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 3 }}>
        Gestiona las inscripciones de personas en las diferentes actividades del conservatorio.
      </Alert>

      {/* Tabla de participaciones */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredParticipaciones}
          columns={columns}
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

      {/* Dialog para crear/editar participación */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedParticipacion ? 'Editar Participación' : 'Nueva Participación'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={personas}
                getOptionLabel={(option) => `${option.nombre} ${option.apellido} (${option.tipo})`}
                value={personas.find(p => p.id === formData.personaId) || null}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, personaId: newValue?.id || 0 });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Persona" required />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      <PersonIcon sx={{ mr: 1 }} />
                      {option.nombre} {option.apellido} ({option.tipo})
                    </Box>
                  );
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={actividades}
                getOptionLabel={(option) => `${option.nombre} (${option.tipo})`}
                value={actividades.find(a => a.id === formData.actividadId) || null}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, actividadId: newValue?.id || 0 });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Actividad" required />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      <ActivityIcon sx={{ mr: 1 }} />
                      {option.nombre} ({option.tipo})
                    </Box>
                  );
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Fecha de Inscripción"
                value={formData.fechaInscripcion || new Date()}
                onChange={(newValue) => {
                  setFormData({ ...formData, fechaInscripcion: newValue || new Date() });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado || 'Activo'}
                  label="Estado"
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as Participacion['estado'] })}
                >
                  {estadosParticipacion.map((estado) => (
                    <MenuItem key={estado} value={estado}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {estado === 'Activo' ? <ActiveIcon color="success" /> : <InactiveIcon color="error" />}
                        {estado}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {formData.estado === 'Inactivo' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Fecha de Baja"
                  value={formData.fechaBaja || null}
                  onChange={(newValue) => {
                    setFormData({ ...formData, fechaBaja: newValue || undefined });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Observaciones"
                value={formData.observaciones || ''}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                multiline
                rows={3}
                placeholder="Motivo de baja, suspensión, o cualquier observación relevante"
              />
            </Grid>
          </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedParticipacion ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParticipacionPage;