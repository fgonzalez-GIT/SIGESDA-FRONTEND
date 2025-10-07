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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Room as RoomIcon,
  EventAvailable as AvailableIcon,
  EventBusy as BusyIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';

interface Aula {
  id: number;
  nombre: string;
  tipo: string;
  capacidad: number;
  ubicacion: string;
  equipamiento: string[];
  disponible: boolean;
  observaciones?: string;
}

const AulasPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
  const [formData, setFormData] = useState<Partial<Aula>>({
    nombre: '',
    tipo: '',
    capacidad: 0,
    ubicacion: '',
    equipamiento: [],
    disponible: true,
    observaciones: ''
  });

  const tiposAula = ['Aula de Coro', 'Aula de Instrumentos', 'Aula de Teoría', 'Salón de Actos', 'Estudio de Grabación'];
  const equipamientoDisponible = ['Piano', 'Proyector', 'Sistema de Audio', 'Micrófono', 'Pizarra', 'Atriles', 'Sillas', 'Mesas'];

  useEffect(() => {
    // Datos de ejemplo - en producción vendría de la API
    setAulas([
      {
        id: 1,
        nombre: 'Aula Principal',
        tipo: 'Aula de Coro',
        capacidad: 50,
        ubicacion: 'Planta Baja - A101',
        equipamiento: ['Piano', 'Sistema de Audio', 'Atriles'],
        disponible: true,
        observaciones: 'Aula principal para ensayos del coro'
      },
      {
        id: 2,
        nombre: 'Estudio 1',
        tipo: 'Estudio de Grabación',
        capacidad: 10,
        ubicacion: 'Primer Piso - B205',
        equipamiento: ['Sistema de Audio', 'Micrófono', 'Piano'],
        disponible: true
      },
      {
        id: 3,
        nombre: 'Aula de Teoría',
        tipo: 'Aula de Teoría',
        capacidad: 25,
        ubicacion: 'Primer Piso - B103',
        equipamiento: ['Proyector', 'Pizarra', 'Sillas', 'Mesas'],
        disponible: false,
        observaciones: 'En mantenimiento hasta fin de mes'
      }
    ]);
  }, []);

  const handleOpenDialog = (aula?: Aula) => {
    if (aula) {
      setSelectedAula(aula);
      setFormData(aula);
    } else {
      setSelectedAula(null);
      setFormData({
        nombre: '',
        tipo: '',
        capacidad: 0,
        ubicacion: '',
        equipamiento: [],
        disponible: true,
        observaciones: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAula(null);
    setFormData({});
  };

  const handleSave = () => {
    if (selectedAula) {
      // Actualizar aula existente
      setAulas(prev => prev.map(aula =>
        aula.id === selectedAula.id ? { ...formData as Aula } : aula
      ));
    } else {
      // Crear nueva aula
      const newAula: Aula = {
        ...formData as Aula,
        id: Date.now()
      };
      setAulas(prev => [...prev, newAula]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    setAulas(prev => prev.filter(aula => aula.id !== id));
  };

  const handleToggleDisponibilidad = (id: number) => {
    setAulas(prev => prev.map(aula =>
      aula.id === id ? { ...aula, disponible: !aula.disponible } : aula
    ));
  };

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
    { field: 'tipo', headerName: 'Tipo', width: 150 },
    { field: 'capacidad', headerName: 'Capacidad', width: 100 },
    { field: 'ubicacion', headerName: 'Ubicación', width: 180 },
    {
      field: 'equipamiento',
      headerName: 'Equipamiento',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.value.slice(0, 2).map((equipo: string, index: number) => (
            <Chip key={index} label={equipo} size="small" variant="outlined" />
          ))}
          {params.value.length > 2 && (
            <Chip label={`+${params.value.length - 2}`} size="small" />
          )}
        </Box>
      )
    },
    {
      field: 'disponible',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <AvailableIcon /> : <BusyIcon />}
          label={params.value ? 'Disponible' : 'No disponible'}
          color={params.value ? 'success' : 'error'}
          variant="outlined"
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
          icon={params.row.disponible ? <BusyIcon /> : <AvailableIcon />}
          label={params.row.disponible ? 'Deshabilitar' : 'Habilitar'}
          onClick={() => handleToggleDisponibilidad(params.row.id)}
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
                {aulas.filter(a => a.disponible).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                No Disponibles
              </Typography>
              <Typography variant="h4" color="error.main">
                {aulas.filter(a => !a.disponible).length}
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

      {/* Tabla de aulas */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={aulas}
          columns={columns}
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
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Aula</InputLabel>
                <Select
                  value={formData.tipo || ''}
                  label="Tipo de Aula"
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                >
                  {tiposAula.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
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
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.disponible || false}
                    onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                  />
                }
                label="Aula disponible"
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
          <Button onClick={handleSave} variant="contained">
            {selectedAula ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AulasPage;