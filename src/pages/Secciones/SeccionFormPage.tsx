import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createSeccion, updateSeccion, fetchSeccion } from '../../store/slices/seccionesSlice';
import { showNotification } from '../../store/slices/uiSlice';
import {
  Box,
  Button,
  Paper,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';

const SeccionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { seccionActual, loading } = useAppSelector(state => state.secciones);

  const [actividades, setActividades] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    actividadId: searchParams.get('actividadId') || '',
    nombre: '',
    codigo: '',
    capacidadMaxima: '',
    activa: true,
    observaciones: ''
  });

  const isEditMode = Boolean(id);

  useEffect(() => {
    // Cargar actividades
    const loadActividades = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/actividades`);
        if (response.ok) {
          const result = await response.json();
          setActividades(result.data || result);
        }
      } catch (error) {
        console.error('Error al cargar actividades:', error);
      }
    };
    loadActividades();

    // Si es modo edición, cargar la sección
    if (id) {
      dispatch(fetchSeccion({ id }));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (isEditMode && seccionActual) {
      setFormData({
        actividadId: seccionActual.actividadId,
        nombre: seccionActual.nombre,
        codigo: seccionActual.codigo || '',
        capacidadMaxima: seccionActual.capacidadMaxima?.toString() || '',
        activa: seccionActual.activa,
        observaciones: seccionActual.observaciones || ''
      });
    }
  }, [isEditMode, seccionActual]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      activa: e.target.checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.actividadId || !formData.nombre) {
      dispatch(showNotification({
        message: 'Por favor complete los campos requeridos',
        severity: 'error'
      }));
      return;
    }

    try {
      const submitData: any = {
        actividadId: formData.actividadId,
        nombre: formData.nombre,
        codigo: formData.codigo || undefined,
        capacidadMaxima: formData.capacidadMaxima ? parseInt(formData.capacidadMaxima) : undefined,
        activa: formData.activa,
        observaciones: formData.observaciones || undefined
      };

      if (isEditMode && id) {
        await dispatch(updateSeccion({ id, data: submitData })).unwrap();
        dispatch(showNotification({
          message: 'Sección actualizada exitosamente',
          severity: 'success'
        }));
      } else {
        await dispatch(createSeccion(submitData)).unwrap();
        dispatch(showNotification({
          message: 'Sección creada exitosamente',
          severity: 'success'
        }));
      }
      navigate('/secciones');
    } catch (error: any) {
      dispatch(showNotification({
        message: error || 'Error al guardar la sección',
        severity: 'error'
      }));
    }
  };

  if (isEditMode && loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/secciones')}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Editar Sección' : 'Nueva Sección'}
        </Typography>
      </Box>

      {/* Formulario */}
      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <form onSubmit={handleSubmit}>
          {/* Actividad */}
          <FormControl fullWidth required margin="normal">
            <InputLabel>Actividad</InputLabel>
            <Select
              name="actividadId"
              value={formData.actividadId}
              onChange={(e) => setFormData(prev => ({ ...prev, actividadId: e.target.value }))}
              label="Actividad"
            >
              {actividades.map(act => (
                <MenuItem key={act.id} value={act.id}>
                  {act.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Nombre */}
          <TextField
            fullWidth
            required
            label="Nombre de la Sección"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            margin="normal"
            helperText="Ejemplo: Grupo A - Mañana"
          />

          {/* Código */}
          <TextField
            fullWidth
            label="Código (Opcional)"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            margin="normal"
            helperText="Código identificador de la sección"
          />

          {/* Capacidad Máxima */}
          <TextField
            fullWidth
            label="Capacidad Máxima (Opcional)"
            name="capacidadMaxima"
            type="number"
            value={formData.capacidadMaxima}
            onChange={handleChange}
            margin="normal"
            helperText="Dejar vacío para capacidad ilimitada"
            inputProps={{ min: 1 }}
          />

          {/* Observaciones */}
          <TextField
            fullWidth
            label="Observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />

          {/* Estado */}
          <Box mt={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.activa}
                  onChange={handleSwitchChange}
                  color="primary"
                />
              }
              label="Sección Activa"
            />
          </Box>

          {/* Botones */}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button
              variant="outlined"
              onClick={() => navigate('/secciones')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {isEditMode ? 'Actualizar' : 'Crear'} Sección
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Nota informativa */}
      {!isEditMode && (
        <Paper sx={{ p: 2, mt: 3, maxWidth: 800, backgroundColor: 'info.light' }}>
          <Typography variant="body2" color="info.contrastText">
            <strong>Nota:</strong> Después de crear la sección, podrás agregar horarios, asignar docentes
            y gestionar participantes desde la página de detalle.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default SeccionFormPage;
