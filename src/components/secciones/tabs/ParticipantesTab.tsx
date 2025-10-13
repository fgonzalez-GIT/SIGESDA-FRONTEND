import React, { useState, useEffect } from 'react';
import seccionesApi from '../../../services/seccionesApi';
import { useAppDispatch } from '../../../hooks/redux';
import { fetchSeccion } from '../../../store/slices/seccionesSlice';
import { showNotification } from '../../../store/slices/uiSlice';
import { Seccion, ParticipacionSeccion } from '../../../types/seccion.types';
import InscripcionModal from '../InscripcionModal';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  PersonAdd as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  People as PeopleIcon,
  CheckCircle as ActiveIcon,
  Block as InactiveIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface ParticipantesTabProps {
  seccion: Seccion;
}

// Usamos directamente ParticipacionSeccion ya que incluye la persona
type ParticipacionDetallada = ParticipacionSeccion;

export const ParticipantesTab: React.FC<ParticipantesTabProps> = ({ seccion }) => {
  const dispatch = useAppDispatch();
  const [participaciones, setParticipaciones] = useState<ParticipacionDetallada[]>([]);
  const [loading, setLoading] = useState(false);
  const [inscripcionModalOpen, setInscripcionModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [participacionSeleccionada, setParticipacionSeleccionada] = useState<ParticipacionDetallada | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activos' | 'inactivos'>('activos');
  const [precioEspecialEdit, setPrecioEspecialEdit] = useState('');

  useEffect(() => {
    loadParticipaciones();
  }, [seccion.id]);

  const loadParticipaciones = async () => {
    setLoading(true);
    try {
      const response = await seccionesApi.getParticipantes(seccion.id);
      setParticipaciones(response.data);
    } catch (error) {
      console.error('Error al cargar participaciones:', error);
      dispatch(showNotification({
        message: 'Error al cargar participaciones',
        severity: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, participacion: ParticipacionDetallada) => {
    setMenuAnchor(event.currentTarget);
    setParticipacionSeleccionada(participacion);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEditarPrecio = () => {
    if (participacionSeleccionada) {
      setPrecioEspecialEdit(participacionSeleccionada.precioEspecial?.toString() || '');
      setEditModalOpen(true);
    }
    handleMenuClose();
  };

  const handleGuardarPrecio = async () => {
    if (!participacionSeleccionada) return;

    try {
      await seccionesApi.updateParticipacion(participacionSeleccionada.id, {
        precioEspecial: precioEspecialEdit ? parseFloat(precioEspecialEdit) : undefined
      });

      dispatch(showNotification({
        message: 'Precio actualizado exitosamente',
        severity: 'success'
      }));

      setEditModalOpen(false);
      loadParticipaciones();
      dispatch(fetchSeccion({ id: seccion.id, detallada: true }));
    } catch (error: any) {
      dispatch(showNotification({
        message: error?.response?.data?.error || 'Error al actualizar precio',
        severity: 'error'
      }));
    }
  };

  const handleDarDeBaja = async () => {
    if (!participacionSeleccionada) return;

    if (!window.confirm('¿Está seguro que desea dar de baja a este participante?')) {
      handleMenuClose();
      return;
    }

    try {
      await seccionesApi.darDeBajaParticipacion(participacionSeleccionada.id);

      dispatch(showNotification({
        message: 'Participante dado de baja exitosamente',
        severity: 'success'
      }));

      loadParticipaciones();
      dispatch(fetchSeccion({ id: seccion.id, detallada: true }));
    } catch (error: any) {
      dispatch(showNotification({
        message: error?.response?.data?.error || 'Error al dar de baja',
        severity: 'error'
      }));
    }
    handleMenuClose();
  };

  const handleReactivar = async () => {
    if (!participacionSeleccionada) return;

    try {
      await seccionesApi.updateParticipacion(participacionSeleccionada.id, {
        activa: true
      });

      dispatch(showNotification({
        message: 'Participante reactivado exitosamente',
        severity: 'success'
      }));

      loadParticipaciones();
      dispatch(fetchSeccion({ id: seccion.id, detallada: true }));
    } catch (error: any) {
      dispatch(showNotification({
        message: error?.response?.data?.error || 'Error al reactivar',
        severity: 'error'
      }));
    }
    handleMenuClose();
  };

  const handleInscripcionSuccess = () => {
    loadParticipaciones();
    dispatch(fetchSeccion({ id: seccion.id, detallada: true }));
  };

  // Filtrar participaciones
  const participacionesFiltradas = participaciones.filter(p => {
    // Filtro por búsqueda
    const matchSearch = searchTerm === '' ||
      `${p.persona.nombre} ${p.persona.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.persona.email?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por estado
    const matchEstado = filterEstado === 'todos' ||
      (filterEstado === 'activos' && p.activa) ||
      (filterEstado === 'inactivos' && !p.activa);

    return matchSearch && matchEstado;
  });

  // Estadísticas
  const stats = {
    total: participaciones.length,
    activos: participaciones.filter(p => p.activa).length,
    inactivos: participaciones.filter(p => !p.activa).length,
    conPrecioEspecial: participaciones.filter(p => p.precioEspecial !== null).length
  };

  const ocupacionPorcentaje = seccion.capacidadMaxima
    ? Math.round((stats.activos / seccion.capacidadMaxima) * 100)
    : 0;

  return (
    <Box>
      {/* Estadísticas */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Participantes
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats.total}
                  </Typography>
                </Box>
                <PeopleIcon fontSize="large" color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Activos
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.activos}
                  </Typography>
                </Box>
                <ActiveIcon fontSize="large" color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Inactivos
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stats.inactivos}
                  </Typography>
                </Box>
                <InactiveIcon fontSize="large" color="error" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Ocupación
                </Typography>
                <Typography variant="h4" color={ocupacionPorcentaje >= 90 ? 'error.main' : 'info.main'}>
                  {seccion.capacidadMaxima ? `${ocupacionPorcentaje}%` : '∞'}
                </Typography>
                {seccion.capacidadMaxima && (
                  <Typography variant="caption" color="text.secondary">
                    {stats.activos} / {seccion.capacidadMaxima}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barra de acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
        <Box display="flex" gap={2} flex={1}>
          <TextField
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, maxWidth: 400 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as any)}
              label="Estado"
              startAdornment={<FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="activos">Activos</MenuItem>
              <MenuItem value="inactivos">Inactivos</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setInscripcionModalOpen(true)}
        >
          Inscribir Participante
        </Button>
      </Box>

      {/* Tabla de participantes */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : participacionesFiltradas.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {participaciones.length === 0 ? 'No hay participantes inscritos' : 'No se encontraron participantes'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {participaciones.length === 0 ? 'Inscribe el primer participante en esta sección' : 'Prueba ajustando los filtros de búsqueda'}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Participante</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Fecha Fin</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {participacionesFiltradas.map((participacion) => (
                <TableRow key={participacion.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body1">
                        {participacion.persona.nombre} {participacion.persona.apellido}
                      </Typography>
                      {participacion.persona.email && (
                        <Typography variant="caption" color="text.secondary">
                          {participacion.persona.email}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={participacion.persona.tipo} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {format(new Date(participacion.fechaInicio), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {participacion.fechaFin ? format(new Date(participacion.fechaFin), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {participacion.precioEspecial ? (
                      <Tooltip title="Precio especial">
                        <Chip
                          label={`$${parseFloat(participacion.precioEspecial).toFixed(2)}`}
                          size="small"
                          color="secondary"
                        />
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Estándar
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={participacion.activa ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={participacion.activa ? 'success' : 'default'}
                      icon={participacion.activa ? <ActiveIcon /> : <InactiveIcon />}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, participacion)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Menu de acciones */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditarPrecio}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Editar Precio Especial
        </MenuItem>
        {participacionSeleccionada?.activa ? (
          <MenuItem onClick={handleDarDeBaja}>
            <CancelIcon sx={{ mr: 1 }} fontSize="small" color="error" />
            Dar de Baja
          </MenuItem>
        ) : (
          <MenuItem onClick={handleReactivar}>
            <ActiveIcon sx={{ mr: 1 }} fontSize="small" color="success" />
            Reactivar
          </MenuItem>
        )}
      </Menu>

      {/* Modal de inscripción */}
      <InscripcionModal
        open={inscripcionModalOpen}
        onClose={() => setInscripcionModalOpen(false)}
        seccion={seccion}
        onSuccess={handleInscripcionSuccess}
      />

      {/* Modal de edición de precio */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Editar Precio Especial</DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Participante: {participacionSeleccionada?.persona.nombre} {participacionSeleccionada?.persona.apellido}
            </Typography>
            <TextField
              label="Precio Especial"
              type="number"
              value={precioEspecialEdit}
              onChange={(e) => setPrecioEspecialEdit(e.target.value)}
              fullWidth
              helperText="Dejar vacío para usar el precio estándar de la actividad"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGuardarPrecio} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParticipantesTab;
