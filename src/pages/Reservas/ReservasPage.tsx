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
  Alert,
  Autocomplete,
  Paper,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EventAvailable as ReservaIcon,
  Room as AulaIcon,
  Person as PersonIcon,
  Schedule as TimeIcon,
  Warning as ConflictIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';

interface Reserva {
  id: number;
  aulaId: number;
  aulaNombre: string;
  personaId: number;
  personaNombre: string;
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
  motivo: string;
  estado: 'Confirmada' | 'Pendiente' | 'Cancelada';
  observaciones?: string;
}

interface Aula {
  id: number;
  nombre: string;
  tipo: string;
  capacidad: number;
  disponible: boolean;
}

interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  tipo: string;
}

const ReservasPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');

  const [formData, setFormData] = useState<Partial<Reserva>>({
    aulaId: 0,
    personaId: 0,
    fechaHoraInicio: new Date(),
    fechaHoraFin: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2 horas
    motivo: '',
    estado: 'Pendiente',
    observaciones: ''
  });
  const [conflictos, setConflictos] = useState<string[]>([]);

  const estadosReserva = ['Confirmada', 'Pendiente', 'Cancelada'] as const;

  useEffect(() => {
    // Datos de ejemplo - en producción vendrían de la API
    setAulas([
      { id: 1, nombre: 'Aula Principal', tipo: 'Aula de Coro', capacidad: 50, disponible: true },
      { id: 2, nombre: 'Estudio 1', tipo: 'Estudio de Grabación', capacidad: 10, disponible: true },
      { id: 3, nombre: 'Aula de Teoría', tipo: 'Aula de Teoría', capacidad: 25, disponible: true },
      { id: 4, nombre: 'Salón de Actos', tipo: 'Salón de Actos', capacidad: 100, disponible: true }
    ]);

    setPersonas([
      { id: 1, nombre: 'María', apellido: 'González', tipo: 'Docente' },
      { id: 2, nombre: 'Carlos', apellido: 'Rodríguez', tipo: 'Docente' },
      { id: 3, nombre: 'Ana', apellido: 'López', tipo: 'Administrador' },
      { id: 4, nombre: 'Pedro', apellido: 'Martínez', tipo: 'Socio' }
    ]);

    const now = new Date();
    setReservas([
      {
        id: 1,
        aulaId: 1,
        aulaNombre: 'Aula Principal',
        personaId: 1,
        personaNombre: 'María González',
        fechaHoraInicio: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Mañana
        fechaHoraFin: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 horas
        motivo: 'Ensayo Coro Principal',
        estado: 'Confirmada'
      },
      {
        id: 2,
        aulaId: 2,
        aulaNombre: 'Estudio 1',
        personaId: 2,
        personaNombre: 'Carlos Rodríguez',
        fechaHoraInicio: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Pasado mañana
        fechaHoraFin: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3 horas
        motivo: 'Grabación de CD',
        estado: 'Pendiente',
        observaciones: 'Requiere equipamiento especial'
      },
      {
        id: 3,
        aulaId: 1,
        aulaNombre: 'Aula Principal',
        personaId: 3,
        personaNombre: 'Ana López',
        fechaHoraInicio: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Ayer
        fechaHoraFin: new Date(now.getTime() - 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4 horas
        motivo: 'Evento especial',
        estado: 'Cancelada',
        observaciones: 'Cancelado por lluvia'
      }
    ]);
  }, []);

  const verificarConflictos = (aulaId: number, inicio: Date, fin: Date, reservaActualId?: number) => {
    const conflictosEncontrados: string[] = [];

    reservas.forEach(reserva => {
      if (reserva.id === reservaActualId) return; // Excluir la reserva actual en edición
      if (reserva.aulaId !== aulaId) return; // Solo verificar la misma aula
      if (reserva.estado === 'Cancelada') return; // No considerar canceladas

      const reservaInicio = new Date(reserva.fechaHoraInicio);
      const reservaFin = new Date(reserva.fechaHoraFin);

      // Verificar solapamiento
      if (
        (inicio >= reservaInicio && inicio < reservaFin) ||
        (fin > reservaInicio && fin <= reservaFin) ||
        (inicio <= reservaInicio && fin >= reservaFin)
      ) {
        conflictosEncontrados.push(
          `Conflicto con reserva de ${reserva.personaNombre} (${reservaInicio.toLocaleString()} - ${reservaFin.toLocaleString()})`
        );
      }
    });

    return conflictosEncontrados;
  };

  const handleOpenDialog = (reserva?: Reserva) => {
    if (reserva) {
      setSelectedReserva(reserva);
      setFormData(reserva);
    } else {
      setSelectedReserva(null);
      const now = new Date();
      setFormData({
        aulaId: 0,
        personaId: 0,
        fechaHoraInicio: now,
        fechaHoraFin: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        motivo: '',
        estado: 'Pendiente',
        observaciones: ''
      });
    }
    setConflictos([]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReserva(null);
    setFormData({});
    setConflictos([]);
  };

  const handleSave = () => {
    const aula = aulas.find(a => a.id === formData.aulaId);
    const persona = personas.find(p => p.id === formData.personaId);

    if (!aula || !persona || !formData.fechaHoraInicio || !formData.fechaHoraFin) {
      alert('Todos los campos obligatorios deben estar completos');
      return;
    }

    // Verificar conflictos antes de guardar
    const conflictosEncontrados = verificarConflictos(
      formData.aulaId!,
      formData.fechaHoraInicio,
      formData.fechaHoraFin,
      selectedReserva?.id
    );

    if (conflictosEncontrados.length > 0) {
      setConflictos(conflictosEncontrados);
      return;
    }

    const reservaData = {
      ...formData as Reserva,
      aulaNombre: aula.nombre,
      personaNombre: `${persona.nombre} ${persona.apellido}`
    };

    if (selectedReserva) {
      // Actualizar reserva existente
      setReservas(prev => prev.map(res =>
        res.id === selectedReserva.id ? reservaData : res
      ));
    } else {
      // Crear nueva reserva
      const newReserva: Reserva = {
        ...reservaData,
        id: Date.now()
      };
      setReservas(prev => [...prev, newReserva]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    setReservas(prev => prev.filter(res => res.id !== id));
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Confirmada':
        return 'success';
      case 'Pendiente':
        return 'warning';
      case 'Cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatFechaHora = (fecha: Date) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterEstado('');
  };

  // Aplicar filtros a las reservas
  const filteredReservas = reservas.filter((reserva) => {
    // Filtro de búsqueda (aula, persona, motivo)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      reserva.aulaNombre.toLowerCase().includes(searchLower) ||
      reserva.personaNombre.toLowerCase().includes(searchLower) ||
      reserva.motivo.toLowerCase().includes(searchLower);

    // Filtro por estado
    const matchesEstado = filterEstado === '' || reserva.estado === filterEstado;

    return matchesSearch && matchesEstado;
  });

  const columns: GridColDef[] = [
    {
      field: 'aulaNombre',
      headerName: 'Aula',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AulaIcon color="primary" />
          {params.value}
        </Box>
      )
    },
    {
      field: 'personaNombre',
      headerName: 'Solicitante',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="secondary" />
          {params.value}
        </Box>
      )
    },
    {
      field: 'fechaHoraInicio',
      headerName: 'Inicio',
      width: 150,
      renderCell: (params) => formatFechaHora(params.value)
    },
    {
      field: 'fechaHoraFin',
      headerName: 'Fin',
      width: 150,
      renderCell: (params) => formatFechaHora(params.value)
    },
    { field: 'motivo', headerName: 'Motivo', width: 200 },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getEstadoColor(params.value) as any}
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
          icon={<DeleteIcon />}
          label="Eliminar"
          onClick={() => handleDelete(params.row.id)}
        />
      ]
    }
  ];

  // Verificar conflictos cuando cambien los datos del formulario
  useEffect(() => {
    if (formData.aulaId && formData.fechaHoraInicio && formData.fechaHoraFin) {
      const conflictosEncontrados = verificarConflictos(
        formData.aulaId,
        formData.fechaHoraInicio,
        formData.fechaHoraFin,
        selectedReserva?.id
      );
      setConflictos(conflictosEncontrados);
    }
  }, [formData.aulaId, formData.fechaHoraInicio, formData.fechaHoraFin]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          📅 Reservas de Aulas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Reserva
        </Button>
      </Box>

      {/* Resumen rápido */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Reservas
              </Typography>
              <Typography variant="h4">
                {reservas.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Confirmadas
              </Typography>
              <Typography variant="h4" color="success.main">
                {reservas.filter(r => r.estado === 'Confirmada').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pendientes
              </Typography>
              <Typography variant="h4" color="warning.main">
                {reservas.filter(r => r.estado === 'Pendiente').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Hoy
              </Typography>
              <Typography variant="h4" color="info.main">
                {reservas.filter(r => {
                  const hoy = new Date();
                  const fechaReserva = new Date(r.fechaHoraInicio);
                  return fechaReserva.toDateString() === hoy.toDateString();
                }).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 3 }}>
        Gestiona las reservas de aulas del conservatorio. El sistema detecta automáticamente conflictos de horarios.
      </Alert>

      {/* Sección de Búsqueda y Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Buscar por aula, persona o motivo..."
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
              <MenuItem value="Confirmada">Confirmada</MenuItem>
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="Cancelada">Cancelada</MenuItem>
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
              {filteredReservas.length} de {reservas.length} reservas
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabla de reservas */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredReservas}
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

      {/* Dialog para crear/editar reserva */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedReserva ? 'Editar Reserva' : 'Nueva Reserva'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={aulas.filter(a => a.disponible)}
                getOptionLabel={(option) => `${option.nombre} (${option.tipo}) - Cap: ${option.capacidad}`}
                value={aulas.find(a => a.id === formData.aulaId) || null}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, aulaId: newValue?.id || 0 });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Aula" required />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      <AulaIcon sx={{ mr: 1 }} />
                      {option.nombre} ({option.tipo}) - Capacidad: {option.capacidad}
                    </Box>
                  );
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={personas}
                getOptionLabel={(option) => `${option.nombre} ${option.apellido} (${option.tipo})`}
                value={personas.find(p => p.id === formData.personaId) || null}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, personaId: newValue?.id || 0 });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Solicitante" required />
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
              <DateTimePicker
                label="Fecha y Hora de Inicio"
                value={formData.fechaHoraInicio || new Date()}
                onChange={(newValue) => {
                  setFormData({ ...formData, fechaHoraInicio: newValue || new Date() });
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
              <DateTimePicker
                label="Fecha y Hora de Fin"
                value={formData.fechaHoraFin || new Date()}
                onChange={(newValue) => {
                  setFormData({ ...formData, fechaHoraFin: newValue || new Date() });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                fullWidth
                label="Motivo de la Reserva"
                value={formData.motivo || ''}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth required>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado || 'Pendiente'}
                  label="Estado"
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as Reserva['estado'] })}
                >
                  {estadosReserva.map((estado) => (
                    <MenuItem key={estado} value={estado}>
                      {estado}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Observaciones"
                value={formData.observaciones || ''}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                multiline
                rows={3}
                placeholder="Observaciones adicionales, equipamiento especial, etc."
              />
            </Grid>

            {/* Mostrar conflictos */}
            {conflictos.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="error" icon={<ConflictIcon />}>
                  <Typography variant="subtitle2" gutterBottom>
                    ⚠️ Conflictos de horario detectados:
                  </Typography>
                  {conflictos.map((conflicto, index) => (
                    <Typography key={index} variant="body2">
                      • {conflicto}
                    </Typography>
                  ))}
                </Alert>
              </Grid>
            )}
          </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={conflictos.length > 0}
          >
            {selectedReserva ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReservasPage;