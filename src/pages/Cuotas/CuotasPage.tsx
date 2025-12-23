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
  MenuItem as MenuItemMui,
  ListItemIcon,
  ListItemText,
  TablePagination
} from '@mui/material';
import {
  Add,
  FilterList,
  Edit,
  Delete,
  MoreVert,
  TrendingUp,
  AttachMoney,
  Warning,
  CheckCircle,
  Schedule,
  Refresh,
  GetApp,
  Description
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchCuotas,
  deleteCuota,
  setFilters,
  clearFilters,
  fetchDashboard,
  fetchCuotaById,
  setSelectedCuota
} from '../../store/slices/cuotasSlice';
import { CategoriaSocio, EstadoRecibo } from '../../types/cuota.types';
import GeneracionMasivaModal from '../../components/Cuotas/GeneracionMasivaModal';
import DetalleCuotaModal from '../../components/Cuotas/DetalleCuotaModal';

const CuotasPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    cuotas,
    loading,
    error,
    filters,
    pagination,
    dashboardData,
    selectedCuota
  } = useAppSelector((state) => state.cuotas);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedCuotaId, setSelectedCuotaId] = useState<number | null>(null);
  const [openGenerarModal, setOpenGenerarModal] = useState(false);
  const [openDetalleModal, setOpenDetalleModal] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

  // Initial load
  useEffect(() => {
    dispatch(fetchCuotas(filters));

    // Default current month for dashboard
    const now = new Date();
    dispatch(fetchDashboard({ mes: now.getMonth() + 1, anio: now.getFullYear() }));
  }, [dispatch, filters.page, filters.limit, filters.soloImpagas]); // Reload when these change

  const handleFilterChange = (key: string, value: any) => {
    dispatch(setFilters({ ...filters, [key]: value }));
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    dispatch(setFilters({ ...filters, page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ ...filters, limit: parseInt(event.target.value, 10), page: 1 }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar esta cuota?')) {
      try {
        await dispatch(deleteCuota(id)).unwrap();
        setSnackbar({ open: true, message: 'Cuota eliminada', severity: 'success' });
      } catch (err: any) {
        setSnackbar({ open: true, message: err, severity: 'error' });
      }
    }
  };

  const handleOpenDetalle = async (id: number) => {
    setSelectedCuotaId(id);
    try {
      // Fetch full cuota details (needed for modal)
      await dispatch(fetchCuotaById(id)).unwrap();
      setOpenDetalleModal(true);
    } catch (error) {
      console.error("Error fetching cuota details:", error);
      setSnackbar({ open: true, message: 'Error al cargar detalles de la cuota', severity: 'error' });
    }
  };

  const getEstadoColor = (estado: EstadoRecibo) => {
    switch (estado) {
      case 'PAGADO': return 'success';
      case 'PENDIENTE': return 'warning';
      case 'VENCIDO': return 'error';
      case 'ANULADO': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Cuotas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administración de cuotas, generación masiva y seguimiento de cobranzas.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenGenerarModal(true)}>
            Generar Cuotas
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      {dashboardData && dashboardData.metricas && (
        <Box display="flex" gap={2} mb={3}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h5">${(dashboardData.metricas.totalRecaudado || 0).toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">Recaudado ({dashboardData.periodo?.nombreMes || '-'})</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h5">${(dashboardData.metricas.totalPendiente || 0).toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">Pendiente</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h5">{(dashboardData.metricas.tasaCobro || 0).toFixed(1)}%</Typography>
                  <Typography variant="body2" color="text.secondary">Tasa de Cobro</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Mes</InputLabel>
            <Select
              value={filters.mes || ''}
              label="Mes"
              onChange={(e) => handleFilterChange('mes', e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {[...Array(12)].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('es', { month: 'long' })}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Año</InputLabel>
            <Select
              value={filters.anio || ''}
              label="Año"
              onChange={(e) => handleFilterChange('anio', e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value={2025}>2025</MenuItem>
              <MenuItem value={2024}>2024</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={filters.categoria || ''}
              label="Categoría"
              onChange={(e) => handleFilterChange('categoria', e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="ACTIVO">Activo</MenuItem>
              <MenuItem value="ESTUDIANTE">Estudiante</MenuItem>
              <MenuItem value="JUBILADO">Jubilado</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => dispatch(fetchCuotas(filters))}
          >
            Refrescar
          </Button>

          <Button
            variant="text"
            onClick={() => dispatch(clearFilters())}
          >
            Limpiar Filtros
          </Button>
        </Stack>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Recibo #</TableCell>
              <TableCell>Socio</TableCell>
              <TableCell>Período</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Monto Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Cargando...</TableCell>
              </TableRow>
            ) : !cuotas || cuotas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No hay cuotas registradas</TableCell>
              </TableRow>
            ) : (
              (cuotas || []).map((cuota) => (
                <TableRow key={cuota.id} hover>
                  <TableCell>{cuota.recibo?.numero || '-'}</TableCell>
                  <TableCell>
                    {cuota.recibo?.receptor?.nombre} {cuota.recibo?.receptor?.apellido}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {cuota.recibo?.receptor?.dni}
                    </Typography>
                  </TableCell>
                  <TableCell>{cuota.mes}/{cuota.anio}</TableCell>
                  <TableCell>
                    <Chip label={cuota.categoria} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>${cuota.montoTotal?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={cuota.recibo?.estado}
                      color={getEstadoColor(cuota.recibo?.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={(e) => {
                      setMenuAnchor(e.currentTarget);
                      setSelectedCuotaId(cuota.id);
                    }}>
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.currentPage - 1} // MUI is 0-indexed
          onPageChange={handlePageChange}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItemMui onClick={() => {
          if (selectedCuotaId) {
            handleOpenDetalle(selectedCuotaId);
            setMenuAnchor(null);
          }
        }}>
          <ListItemIcon><Description fontSize="small" /></ListItemIcon>
          <ListItemText>Ver Detalle</ListItemText>
        </MenuItemMui>
        <MenuItemMui onClick={() => {
          if (selectedCuotaId) handleDelete(selectedCuotaId);
          setMenuAnchor(null);
        }}>
          <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItemMui>
      </Menu>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
        message={snackbar?.message}
      >
        <Alert severity={snackbar?.severity} onClose={() => setSnackbar(null)}>
          {snackbar?.message}
        </Alert>
      </Snackbar>

      <GeneracionMasivaModal
        open={openGenerarModal}
        onClose={() => setOpenGenerarModal(false)}
        onSuccess={() => {
          dispatch(fetchCuotas(filters));
          dispatch(fetchDashboard({ mes: new Date().getMonth() + 1, anio: new Date().getFullYear() }));
        }}
      />

      <DetalleCuotaModal
        open={openDetalleModal}
        onClose={() => setOpenDetalleModal(false)}
        cuota={selectedCuota}
      />
    </Box>
  );
};

export default CuotasPage;