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
  TablePagination,
  Switch,
  FormControlLabel,
  CircularProgress
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
  Description,
  Visibility,
  Search,
  Clear
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchCuotas,
  deleteCuota,
  setFilters,
  clearFilters,
  fetchDashboard,
  fetchCuotaById,
  setSelectedCuota,
  exportCuotas,
  fetchAllCuotas
} from '../../store/slices/cuotasSlice';
import { CategoriaSocio, EstadoRecibo } from '../../types/cuota.types';
import GeneracionMasivaModal from '../../components/Cuotas/GeneracionMasivaModal';
import DetalleCuotaModal from '../../components/Cuotas/DetalleCuotaModal';
import { PersonaAutocompleteFilter } from '../../components/common/PersonaAutocompleteFilter';

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
  const [showAll, setShowAll] = useState(false); // Modo "Ver Todas"
  const [exporting, setExporting] = useState(false);
  const [soloSocios, setSoloSocios] = useState(true); // Filtrar solo SOCIOS por defecto
  const [tempPersonaId, setTempPersonaId] = useState<number | null>(null); // Selección temporal de persona

  // Initial load
  useEffect(() => {
    dispatch(fetchCuotas(filters));

    // Default current month for dashboard
    const now = new Date();
    dispatch(fetchDashboard({ mes: now.getMonth() + 1, anio: now.getFullYear() }));
  }, [dispatch]); // Only on mount

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    dispatch(setFilters(newFilters));
    dispatch(fetchCuotas(newFilters)); // Fetch with new filters
  };

  // Handler para cambio de persona (no dispara búsqueda automática)
  const handlePersonaChange = (personaId: number | null) => {
    setTempPersonaId(personaId);
  };

  // Handler para buscar por persona
  const handleBuscarPorPersona = () => {
    handleFilterChange('personaId', tempPersonaId);
  };

  // Handler para limpiar selección de persona
  const handleLimpiarPersona = () => {
    setTempPersonaId(null);
    handleFilterChange('personaId', null);
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

  // Handler para alternar entre ver todas y paginadas
  const handleToggleShowAll = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setShowAll(checked);

    if (checked) {
      // Cargar todas las cuotas con los filtros actuales (sin page/limit)
      const { page, limit, ...filtersWithoutPagination } = filters;
      await dispatch(fetchAllCuotas(filtersWithoutPagination));
    } else {
      // Volver a paginación normal
      dispatch(fetchCuotas(filters));
    }
  };

  // Handler para exportar a CSV
  const handleExportToCSV = async () => {
    try {
      setExporting(true);
      const { page, limit, ...filtersWithoutPagination } = filters;
      const result = await dispatch(exportCuotas(filtersWithoutPagination)).unwrap();

      // Convertir a CSV
      const csvContent = convertToCSV(result.data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `cuotas_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbar({
        open: true,
        message: `${result.total} cuotas exportadas exitosamente`,
        severity: 'success'
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || 'Error al exportar cuotas',
        severity: 'error'
      });
    } finally {
      setExporting(false);
    }
  };

  // Función auxiliar para convertir datos a CSV
  const convertToCSV = (data: any[]) => {
    if (!data || data.length === 0) return '';

    const headers = ['ID', 'Mes', 'Año', 'Categoría', 'Monto Base', 'Monto Actividades', 'Monto Total', 'Estado', 'Persona'];
    const rows = data.map(cuota => [
      cuota.id,
      cuota.mes,
      cuota.anio,
      cuota.categoria || cuota.recibo?.receptor?.categoria || '-',
      cuota.montoBase,
      cuota.montoActividades,
      cuota.montoTotal,
      cuota.recibo?.estado || '-',
      cuota.recibo?.receptor ? `${cuota.recibo.receptor.nombre} ${cuota.recibo.receptor.apellido}` : '-'
    ]);

    const csvRows = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ];

    return csvRows.join('\n');
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
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={showAll}
                onChange={handleToggleShowAll}
                disabled={loading}
                color="primary"
              />
            }
            label={`Ver todas (${pagination.total} cuotas)`}
          />
          <Button
            variant="outlined"
            startIcon={exporting ? <CircularProgress size={20} /> : <GetApp />}
            onClick={handleExportToCSV}
            disabled={exporting || loading || cuotas.length === 0}
          >
            Exportar CSV
          </Button>
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
        <Stack spacing={2}>
          {/* Primera fila: filtros básicos (automáticos) */}
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
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
          </Stack>

          {/* Segunda fila: Selector de persona + botones */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <PersonaAutocompleteFilter
              value={tempPersonaId}
              onChange={handlePersonaChange}
              label="Socio"
              placeholder="Buscar por apellido, nombre o DNI..."
              soloSocios={soloSocios}
              size="small"
              sx={{ minWidth: 250, flexGrow: 1 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={!soloSocios}
                  onChange={(e) => {
                    setSoloSocios(!e.target.checked);
                    // Limpiar selección temporal y filtro al cambiar el tipo
                    setTempPersonaId(null);
                    handleFilterChange('personaId', null);
                  }}
                  size="small"
                />
              }
              label={
                <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                  Todas las personas
                </Typography>
              }
            />

            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleBuscarPorPersona}
              disabled={!tempPersonaId || tempPersonaId === filters.personaId}
              size="small"
            >
              Buscar
            </Button>

            <Tooltip title="Limpiar selección de persona">
              <span>
                <IconButton
                  onClick={handleLimpiarPersona}
                  disabled={!tempPersonaId && !filters.personaId}
                  size="small"
                  color="error"
                >
                  <Clear />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          {/* Tercera fila: botones generales */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => dispatch(fetchCuotas(filters))}
            >
              Refrescar
            </Button>

            <Button
              variant="text"
              onClick={() => {
                setTempPersonaId(null);
                dispatch(clearFilters());
                setSoloSocios(true);
              }}
            >
              Limpiar Filtros
            </Button>
          </Stack>
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
                    <Tooltip title="Ver Detalle">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDetalle(cuota.id)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
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