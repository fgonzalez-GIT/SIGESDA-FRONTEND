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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Print,
  Download,
  Send,
  Payment,
  Cancel,
  MoreVert,
  Receipt,
  AttachMoney,
  Schedule,
  CheckCircle,
  Warning,
  Email,
  Visibility,
  Edit,
  Delete,
  Refresh,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchRecibos,
  setFilters,
  clearFilters,
  generarRecibo,
  pagarRecibo,
  generarPdfRecibo,
  enviarRecibo,
  anularRecibo,
  setCurrentRecibo,
  Recibo,
  RecibosFilters,
} from '../../store/slices/recibosSlice';
import GenerarReciboDialog from '../../components/forms/GenerarReciboDialog';

const RecibosPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    filteredRecibos,
    loading,
    error,
    filters,
    estadisticas,
    totalFacturado,
    totalCobrado,
    totalPendiente,
    generatingPdf,
  } = useAppSelector((state) => state.recibos);

  const [generarReciboOpen, setGenerarReciboOpen] = useState(false);
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
  const [menuReciboId, setMenuReciboId] = useState<number | null>(null);
  const [anularDialog, setAnularDialog] = useState<{
    open: boolean;
    reciboId: number | null;
    motivo: string;
  }>({
    open: false,
    reciboId: null,
    motivo: '',
  });

  useEffect(() => {
    dispatch(fetchRecibos());
  }, [dispatch]);

  const handleFilterChange = (newFilters: Partial<RecibosFilters>) => {
    dispatch(setFilters({ ...filters, ...newFilters }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchTerm('');
  };

  const handleGenerarRecibo = async (request: any) => {
    try {
      await dispatch(generarRecibo(request)).unwrap();
      setGenerarReciboOpen(false);
      setSnackbar({
        open: true,
        message: 'Recibo generado exitosamente',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al generar el recibo',
        severity: 'error',
      });
    }
  };

  const handlePagarRecibo = async (reciboId: number) => {
    try {
      await dispatch(pagarRecibo({
        reciboId,
        metodoPago: 'efectivo',
        montoPago: 0, // Se debería obtener del recibo
        fechaPago: new Date().toISOString().split('T')[0],
      })).unwrap();
      setSnackbar({
        open: true,
        message: 'Pago registrado exitosamente',
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

  const handleDescargarPdf = async (reciboId: number) => {
    try {
      await dispatch(generarPdfRecibo(reciboId)).unwrap();
      setSnackbar({
        open: true,
        message: 'PDF generado exitosamente',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al generar el PDF',
        severity: 'error',
      });
    }
  };

  const handleEnviarRecibo = async (reciboId: number) => {
    try {
      await dispatch(enviarRecibo({ reciboId })).unwrap();
      setSnackbar({
        open: true,
        message: 'Recibo enviado exitosamente',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al enviar el recibo',
        severity: 'error',
      });
    }
  };

  const handleAnularRecibo = async () => {
    if (!anularDialog.reciboId || !anularDialog.motivo.trim()) return;

    try {
      await dispatch(anularRecibo({
        reciboId: anularDialog.reciboId,
        motivo: anularDialog.motivo,
      })).unwrap();
      setAnularDialog({ open: false, reciboId: null, motivo: '' });
      setSnackbar({
        open: true,
        message: 'Recibo anulado exitosamente',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al anular el recibo',
        severity: 'error',
      });
    }
  };

  const getEstadoColor = (estado: Recibo['estado']) => {
    const colorMap = {
      pendiente: 'warning',
      pagado: 'success',
      vencido: 'error',
      cancelado: 'default',
      parcial: 'info',
    };
    return colorMap[estado] as any;
  };

  const getEstadoIcon = (estado: Recibo['estado']) => {
    const iconMap = {
      pendiente: <Schedule fontSize="small" />,
      pagado: <CheckCircle fontSize="small" />,
      vencido: <Warning fontSize="small" />,
      cancelado: <Cancel fontSize="small" />,
      parcial: <AttachMoney fontSize="small" />,
    };
    return iconMap[estado];
  };

  const filteredData = filteredRecibos.filter(recibo =>
    searchTerm === '' ||
    recibo.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recibo.personaNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recibo.personaApellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recibo.conceptos.some(c => c.concepto.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, reciboId: number) => {
    setMenuAnchor(event.currentTarget);
    setMenuReciboId(reciboId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuReciboId(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Gestión de Recibos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administra la facturación y cobranza del sistema
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => console.log('Exportar recibos')}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setGenerarReciboOpen(true)}
            >
              Generar Recibo
            </Button>
          </Stack>
        </Box>

        {/* Estadísticas */}
        <Box display="flex" gap={2} mb={3}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Receipt color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h5">
                    ${totalFacturado.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Facturado
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
                  <Typography variant="h5" color="success.main">
                    ${totalCobrado.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Cobrado
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
                <Warning color="error" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h5" color="error.main">
                    {estadisticas.vencidos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Recibos Vencidos
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
              placeholder="Buscar por número, persona o concepto..."
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
                <MenuItem value="pagado">Pagado</MenuItem>
                <MenuItem value="vencido">Vencido</MenuItem>
                <MenuItem value="parcial">Pago Parcial</MenuItem>
                <MenuItem value="cancelado">Cancelado</MenuItem>
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

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Enviado</InputLabel>
              <Select
                value={filters.enviado === undefined ? '' : filters.enviado ? 'si' : 'no'}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange({
                    enviado: value === '' ? undefined : value === 'si'
                  });
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="si">Enviados</MenuItem>
                <MenuItem value="no">No enviados</MenuItem>
              </Select>
            </FormControl>

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
              onClick={() => dispatch(fetchRecibos())}
              startIcon={<Refresh />}
            >
              Actualizar
            </Button>
          </Box>
        </Paper>

        {/* Tabla de recibos */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Persona</TableCell>
                <TableCell>Conceptos</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Vencimiento</TableCell>
                <TableCell>Enviado</TableCell>
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
                    No se encontraron recibos
                  </TableCell>
                </TableRow>
              )}
              {filteredData.map((recibo) => (
                <TableRow key={recibo.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {recibo.numero}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(recibo.fechaEmision).toLocaleDateString('es-AR')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {recibo.personaNombre} {recibo.personaApellido}
                      </Typography>
                      <Chip
                        label={recibo.personaTipo}
                        size="small"
                        color={
                          recibo.personaTipo === 'socio' ? 'primary' :
                          recibo.personaTipo === 'docente' ? 'secondary' : 'default'
                        }
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {recibo.conceptos.slice(0, 2).map((concepto, index) => (
                        <Typography key={index} variant="body2">
                          • {concepto.concepto}
                        </Typography>
                      ))}
                      {recibo.conceptos.length > 2 && (
                        <Typography variant="caption" color="text.secondary">
                          y {recibo.conceptos.length - 2} más...
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      ${recibo.total.toLocaleString()}
                    </Typography>
                    {recibo.montoPagado > 0 && recibo.estado !== 'pagado' && (
                      <Typography variant="caption" color="text.secondary">
                        Pagado: ${recibo.montoPagado.toLocaleString()}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getEstadoIcon(recibo.estado)}
                      label={recibo.estado}
                      color={getEstadoColor(recibo.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(recibo.fechaVencimiento).toLocaleDateString('es-AR')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={recibo.enviado ? 'Sí' : 'No'}
                      size="small"
                      color={recibo.enviado ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end">
                      {recibo.estado === 'pendiente' && (
                        <Tooltip title="Registrar pago">
                          <IconButton
                            size="small"
                            onClick={() => handlePagarRecibo(recibo.id)}
                            color="success"
                          >
                            <Payment />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Descargar PDF">
                        <IconButton
                          size="small"
                          onClick={() => handleDescargarPdf(recibo.id)}
                          color="primary"
                          disabled={generatingPdf}
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, recibo.id)}
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
            if (menuReciboId) handleEnviarRecibo(menuReciboId);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Email fontSize="small" />
            </ListItemIcon>
            <ListItemText>Enviar por Email</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            console.log('Ver detalles', menuReciboId);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Visibility fontSize="small" />
            </ListItemIcon>
            <ListItemText>Ver Detalles</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            console.log('Duplicar recibo', menuReciboId);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Receipt fontSize="small" />
            </ListItemIcon>
            <ListItemText>Duplicar</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            if (menuReciboId) {
              setAnularDialog({ open: true, reciboId: menuReciboId, motivo: '' });
            }
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Cancel fontSize="small" />
            </ListItemIcon>
            <ListItemText>Anular</ListItemText>
          </MenuItem>
        </Menu>

        {/* Diálogo para generar recibo */}
        <GenerarReciboDialog
          open={generarReciboOpen}
          onClose={() => setGenerarReciboOpen(false)}
          onSubmit={handleGenerarRecibo}
          loading={loading}
        />

        {/* Diálogo para anular recibo */}
        <Dialog
          open={anularDialog.open}
          onClose={() => setAnularDialog({ open: false, reciboId: null, motivo: '' })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Anular Recibo</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Motivo de anulación"
              fullWidth
              multiline
              rows={4}
              value={anularDialog.motivo}
              onChange={(e) => setAnularDialog(prev => ({ ...prev, motivo: e.target.value }))}
              placeholder="Ingrese el motivo por el cual se anula este recibo..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAnularDialog({ open: false, reciboId: null, motivo: '' })}>
              Cancelar
            </Button>
            <Button
              onClick={handleAnularRecibo}
              color="error"
              disabled={!anularDialog.motivo.trim()}
            >
              Anular Recibo
            </Button>
          </DialogActions>
        </Dialog>

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

export default RecibosPage;