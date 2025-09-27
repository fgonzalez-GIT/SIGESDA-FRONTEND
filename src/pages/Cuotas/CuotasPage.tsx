import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
  Snackbar,
  Stack,
  Card,
  CardContent,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Edit,
  Delete,
  Payment,
  Receipt,
  Send,
  MoreVert,
  TrendingUp,
  AttachMoney,
  Warning,
  CheckCircle,
  Schedule,
  Cancel,
  GetApp,
  Refresh,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchCuotas,
  deleteCuota,
  setFilters,
  clearFilters,
  generarCuotasMasivas,
  pagarCuota,
  Cuota,
  CuotasFilters,
} from '../../store/slices/cuotasSlice';
import CuotaForm from '../../components/forms/CuotaForm';
import GenerarCuotasMasivasDialog from '../../components/forms/GenerarCuotasMasivasDialog';

const CuotasPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    filteredCuotas,
    loading,
    error,
    filters,
    estadisticas,
    totalRecaudado,
    totalPendiente,
  } = useAppSelector((state) => state.cuotas);

  const [cuotaFormOpen, setCuotaFormOpen] = useState(false);
  const [generarMasivasOpen, setGenerarMasivasOpen] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState<Cuota | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuCuotaId, setMenuCuotaId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchCuotas());
  }, [dispatch]);

  const handleFilterChange = (newFilters: Partial<CuotasFilters>) => {
    dispatch(setFilters({ ...filters, ...newFilters }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchTerm('');
  };

  const handleDeleteCuota = async (id: number) => {
    try {
      await dispatch(deleteCuota(id)).unwrap();
      setSnackbar({
        open: true,
        message: 'Cuota eliminada exitosamente',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al eliminar la cuota',
        severity: 'error',
      });
    }
  };

  const handlePagarCuota = async (cuotaId: number) => {
    try {
      await dispatch(pagarCuota({
        cuotaId,
        metodoPago: 'efectivo',
        fechaPago: new Date().toISOString().split('T')[0],
      })).unwrap();
      setSnackbar({
        open: true,
        message: 'Cuota marcada como pagada',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al procesar el pago',
        severity: 'error',
      });
    }
  };

  const getEstadoColor = (estado: Cuota['estado']) => {
    const colorMap = {
      pendiente: 'warning',
      pagada: 'success',
      vencida: 'error',
      cancelada: 'default',
    };
    return colorMap[estado] as any;
  };

  const getEstadoIcon = (estado: Cuota['estado']) => {
    const iconMap = {
      pendiente: <Schedule fontSize="small" />,
      pagada: <CheckCircle fontSize="small" />,
      vencida: <Warning fontSize="small" />,
      cancelada: <Cancel fontSize="small" />,
    };
    return iconMap[estado];
  };

  const filteredData = filteredCuotas.filter(cuota =>
    searchTerm === '' ||
    cuota.personaNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cuota.personaApellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cuota.concepto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, cuotaId: number) => {
    setMenuAnchor(event.currentTarget);
    setMenuCuotaId(cuotaId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuCuotaId(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Gestión de Cuotas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administra las cuotas mensuales y recaudación del sistema
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={() => console.log('Exportar')}
            >
              Exportar
            </Button>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={setGenerarMasivasOpen.bind(null, true)}
            >
              Generar Masivas
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={setCuotaFormOpen.bind(null, true)}
            >
              Nueva Cuota
            </Button>
          </Stack>
        </Box>

        {/* Estadísticas */}
        <Box display="flex" gap={2} mb={3}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h5" color="success.main">
                    ${totalRecaudado.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Recaudado
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h5" color="warning.main">
                    ${totalPendiente.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Pendiente
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h5">
                    {estadisticas.pagadas}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cuotas Pagadas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Warning color="error" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h5" color="error.main">
                    {estadisticas.vencidas}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cuotas Vencidas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Buscar por persona o concepto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.estado || ''}
                onChange={(e) => handleFilterChange({ estado: e.target.value as any })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="pagada">Pagada</MenuItem>
                <MenuItem value="vencida">Vencida</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Tipo Persona</InputLabel>
              <Select
                value={filters.personaTipo || ''}
                onChange={(e) => handleFilterChange({ personaTipo: e.target.value as any })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="socio">Socio</MenuItem>
                <MenuItem value="docente">Docente</MenuItem>
                <MenuItem value="estudiante">Estudiante</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="month"
              label="Mes"
              value={filters.mesVencimiento || ''}
              onChange={(e) => handleFilterChange({ mesVencimiento: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />

            <Button
              variant="outlined"
              size="small"
              onClick={handleClearFilters}
              startIcon={<FilterList />}
            >
              Limpiar
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={() => dispatch(fetchCuotas())}
              startIcon={<Refresh />}
            >
              Actualizar
            </Button>
          </Box>
        </Paper>

        {/* Tabla de cuotas */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Persona</TableCell>
                <TableCell>Concepto</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Vencimiento</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Pago</TableCell>
                <TableCell>Método Pago</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Cargando...
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No se encontraron cuotas
                  </TableCell>
                </TableRow>
              )}
              {filteredData.map((cuota) => (
                <TableRow key={cuota.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {cuota.personaNombre} {cuota.personaApellido}
                      </Typography>
                      <Chip
                        label={cuota.personaTipo}
                        size="small"
                        color={
                          cuota.personaTipo === 'socio' ? 'primary' :
                          cuota.personaTipo === 'docente' ? 'secondary' : 'default'
                        }
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {cuota.concepto}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        ${cuota.montoFinal.toLocaleString()}
                      </Typography>
                      {cuota.montoFinal !== cuota.monto && (
                        <Typography variant="caption" color="text.secondary">
                          Base: ${cuota.monto.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(cuota.fechaVencimiento).toLocaleDateString('es-AR')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getEstadoIcon(cuota.estado)}
                      label={cuota.estado}
                      color={getEstadoColor(cuota.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {cuota.fechaPago ? (
                      <Typography variant="body2">
                        {new Date(cuota.fechaPago).toLocaleDateString('es-AR')}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {cuota.metodoPago ? (
                      <Chip
                        label={cuota.metodoPago.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end">
                      {cuota.estado === 'pendiente' && (
                        <Tooltip title="Marcar como pagada">
                          <IconButton
                            size="small"
                            onClick={() => handlePagarCuota(cuota.id)}
                            color="success"
                          >
                            <Payment />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedCuota(cuota);
                            setCuotaFormOpen(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, cuota.id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Menú contextual */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            console.log('Generar recibo', menuCuotaId);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Receipt fontSize="small" />
            </ListItemIcon>
            <ListItemText>Generar Recibo</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            console.log('Enviar recordatorio', menuCuotaId);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Send fontSize="small" />
            </ListItemIcon>
            <ListItemText>Enviar Recordatorio</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            if (menuCuotaId) handleDeleteCuota(menuCuotaId);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Eliminar</ListItemText>
          </MenuItem>
        </Menu>

        {/* Diálogos */}
        <CuotaForm
          open={cuotaFormOpen}
          onClose={() => {
            setCuotaFormOpen(false);
            setSelectedCuota(null);
          }}
          cuota={selectedCuota}
          onSubmit={async (cuotaData) => {
            try {
              // Aquí iría la lógica de crear/actualizar
              console.log('Cuota enviada:', cuotaData);
              setCuotaFormOpen(false);
              setSelectedCuota(null);
              dispatch(fetchCuotas());
              setSnackbar({
                open: true,
                message: selectedCuota ? 'Cuota actualizada exitosamente' : 'Cuota creada exitosamente',
                severity: 'success',
              });
            } catch (error) {
              setSnackbar({
                open: true,
                message: 'Error al guardar la cuota',
                severity: 'error',
              });
            }
          }}
        />

        <GenerarCuotasMasivasDialog
          open={generarMasivasOpen}
          onClose={() => setGenerarMasivasOpen(false)}
          onSubmit={async (request) => {
            try {
              await dispatch(generarCuotasMasivas(request)).unwrap();
              setGenerarMasivasOpen(false);
              setSnackbar({
                open: true,
                message: `${request.personaIds.length} cuotas generadas exitosamente`,
                severity: 'success',
              });
            } catch (error) {
              setSnackbar({
                open: true,
                message: 'Error al generar las cuotas',
                severity: 'error',
              });
            }
          }}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Error global */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default CuotasPage;