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
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  LocalAtm as CashIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';

interface MedioPago {
  id: number;
  nombre: string;
  tipo: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Cheque' | 'Otro';
  descripcion?: string;
  activo: boolean;
  requiereReferencia: boolean;
  comision?: number;
  observaciones?: string;
}

const MediosPagoPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [mediosPago, setMediosPago] = useState<MedioPago[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMedio, setSelectedMedio] = useState<MedioPago | null>(null);
  const [formData, setFormData] = useState<Partial<MedioPago>>({
    nombre: '',
    tipo: 'Efectivo',
    descripcion: '',
    activo: true,
    requiereReferencia: false,
    comision: 0,
    observaciones: ''
  });

  const tiposMedioPago = ['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque', 'Otro'] as const;

  useEffect(() => {
    // Datos de ejemplo - en producción vendría de la API
    setMediosPago([
      {
        id: 1,
        nombre: 'Efectivo',
        tipo: 'Efectivo',
        descripcion: 'Pago en efectivo',
        activo: true,
        requiereReferencia: false
      },
      {
        id: 2,
        nombre: 'Transferencia Bancaria',
        tipo: 'Transferencia',
        descripcion: 'Transferencia a cuenta bancaria',
        activo: true,
        requiereReferencia: true,
        observaciones: 'Cuenta: 1234567890 - Banco Nacional'
      },
      {
        id: 3,
        nombre: 'Tarjeta de Débito',
        tipo: 'Tarjeta',
        descripcion: 'Pago con tarjeta de débito',
        activo: true,
        requiereReferencia: true,
        comision: 2.5
      },
      {
        id: 4,
        nombre: 'Tarjeta de Crédito',
        tipo: 'Tarjeta',
        descripcion: 'Pago con tarjeta de crédito',
        activo: true,
        requiereReferencia: true,
        comision: 3.5
      },
      {
        id: 5,
        nombre: 'Cheque',
        tipo: 'Cheque',
        descripcion: 'Pago con cheque',
        activo: false,
        requiereReferencia: true,
        observaciones: 'Temporalmente deshabilitado'
      }
    ]);
  }, []);

  const handleOpenDialog = (medio?: MedioPago) => {
    if (medio) {
      setSelectedMedio(medio);
      setFormData(medio);
    } else {
      setSelectedMedio(null);
      setFormData({
        nombre: '',
        tipo: 'Efectivo',
        descripcion: '',
        activo: true,
        requiereReferencia: false,
        comision: 0,
        observaciones: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMedio(null);
    setFormData({});
  };

  const handleSave = () => {
    if (selectedMedio) {
      // Actualizar medio existente
      setMediosPago(prev => prev.map(medio =>
        medio.id === selectedMedio.id ? { ...formData as MedioPago } : medio
      ));
    } else {
      // Crear nuevo medio
      const newMedio: MedioPago = {
        ...formData as MedioPago,
        id: Date.now()
      };
      setMediosPago(prev => [...prev, newMedio]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    setMediosPago(prev => prev.filter(medio => medio.id !== id));
  };

  const handleToggleActivo = (id: number) => {
    setMediosPago(prev => prev.map(medio =>
      medio.id === id ? { ...medio, activo: !medio.activo } : medio
    ));
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Efectivo':
        return <CashIcon color="success" />;
      case 'Transferencia':
        return <BankIcon color="primary" />;
      case 'Tarjeta':
        return <CardIcon color="info" />;
      default:
        return <PaymentIcon color="action" />;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'nombre',
      headerName: 'Nombre',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getTipoIcon(params.row.tipo)}
          {params.value}
        </Box>
      )
    },
    {
      field: 'tipo',
      headerName: 'Tipo',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} variant="outlined" size="small" />
      )
    },
    { field: 'descripcion', headerName: 'Descripción', width: 250 },
    {
      field: 'requiereReferencia',
      headerName: 'Requiere Ref.',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Sí' : 'No'}
          color={params.value ? 'info' : 'default'}
          variant="outlined"
          size="small"
        />
      )
    },
    {
      field: 'comision',
      headerName: 'Comisión (%)',
      width: 100,
      renderCell: (params) => params.value ? `${params.value}%` : '-'
    },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          color={params.value ? 'success' : 'error'}
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          💳 Medios de Pago
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Medio de Pago
        </Button>
      </Box>

      {/* Resumen rápido */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Medios
              </Typography>
              <Typography variant="h4">
                {mediosPago.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Activos
              </Typography>
              <Typography variant="h4" color="success.main">
                {mediosPago.filter(m => m.activo).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Con Comisión
              </Typography>
              <Typography variant="h4" color="warning.main">
                {mediosPago.filter(m => m.comision && m.comision > 0).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Requieren Ref.
              </Typography>
              <Typography variant="h4" color="info.main">
                {mediosPago.filter(m => m.requiereReferencia).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 3 }}>
        Los medios de pago configurados aquí estarán disponibles al registrar pagos de cuotas y recibos.
      </Alert>

      {/* Tabla de medios de pago */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={mediosPago}
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

      {/* Dialog para crear/editar medio de pago */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedMedio ? 'Editar Medio de Pago' : 'Nuevo Medio de Pago'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.nombre || ''}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.tipo || 'Efectivo'}
                  label="Tipo"
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as MedioPago['tipo'] })}
                >
                  {tiposMedioPago.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTipoIcon(tipo)}
                        {tipo}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.descripcion || ''}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Comisión (%)"
                type="number"
                value={formData.comision || ''}
                onChange={(e) => setFormData({ ...formData, comision: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.activo || false}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    />
                  }
                  label="Medio de pago activo"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.requiereReferencia || false}
                      onChange={(e) => setFormData({ ...formData, requiereReferencia: e.target.checked })}
                    />
                  }
                  label="Requiere número de referencia"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Observaciones"
                value={formData.observaciones || ''}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                multiline
                rows={3}
                placeholder="Información adicional, número de cuenta, etc."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedMedio ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediosPagoPage;