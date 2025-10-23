import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
  Alert,
  Divider,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  School as SchoolIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { actividadesApi } from '../../../../services/actividadesApi';
import type { DocenteDisponible, RolDocente } from '../../../../types/actividad.types';

interface AsignarDocenteModalV2Props {
  open: boolean;
  onClose: () => void;
  actividadId: number;
  actividadNombre: string;
  onSuccess: () => void;
}

const steps = ['Seleccionar Docente', 'Asignar Rol', 'Confirmar'];

/**
 * Modal de asignación de docente con flujo de 3 pasos
 * Paso 1: Buscar y seleccionar docente
 * Paso 2: Seleccionar rol del docente
 * Paso 3: Confirmar asignación
 */
export const AsignarDocenteModalV2: React.FC<AsignarDocenteModalV2Props> = ({
  open,
  onClose,
  actividadId,
  actividadNombre,
  onSuccess
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos
  const [docentes, setDocentes] = useState<DocenteDisponible[]>([]);
  const [roles, setRoles] = useState<RolDocente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Selección
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<DocenteDisponible | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    if (open) {
      cargarDatos();
    }
  }, [open]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docentesData, rolesData] = await Promise.all([
        actividadesApi.obtenerDocentesDisponibles(),
        actividadesApi.obtenerRolesDocentes()
      ]);
      setDocentes(docentesData);
      setRoles(rolesData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleClose = () => {
    // Reset
    setActiveStep(0);
    setDocenteSeleccionado(null);
    setRolSeleccionado(null);
    setObservaciones('');
    setSearchTerm('');
    setError(null);
    onClose();
  };

  const handleAsignar = async () => {
    if (!docenteSeleccionado || !rolSeleccionado) return;

    setLoading(true);
    setError(null);

    try {
      await actividadesApi.asignarDocente(actividadId, {
        docenteId: parseInt(docenteSeleccionado.persona_id),
        rolDocenteId: rolSeleccionado,
        observaciones: observaciones || undefined
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error al asignar docente');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar docentes por búsqueda
  const docentesFiltrados = docentes.filter((docente) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      docente.nombre.toLowerCase().includes(searchLower) ||
      docente.apellido.toLowerCase().includes(searchLower) ||
      docente.email?.toLowerCase().includes(searchLower)
    );
  });

  // Obtener rol seleccionado
  const rolSeleccionadoObj = roles.find((r) => r.id === rolSeleccionado);

  // PASO 1: Seleccionar Docente
  const renderPaso1 = () => (
    <Box>
      <TextField
        fullWidth
        placeholder="Buscar por nombre, apellido o email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
        sx={{ mb: 2 }}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : docentesFiltrados.length === 0 ? (
        <Alert severity="info">
          No se encontraron docentes disponibles
          {searchTerm && ' con esos criterios de búsqueda'}
        </Alert>
      ) : (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {docentesFiltrados.map((docente) => (
            <ListItem
              key={docente.persona_id}
              disablePadding
              sx={{
                border: '1px solid',
                borderColor:
                  docenteSeleccionado?.persona_id === docente.persona_id
                    ? 'primary.main'
                    : 'divider',
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemButton
                selected={docenteSeleccionado?.persona_id === docente.persona_id}
                onClick={() => setDocenteSeleccionado(docente)}
                sx={{
                  '&:hover': {
                    borderColor: 'primary.main'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <SchoolIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${docente.apellido}, ${docente.nombre}`}
                  secondary={
                    <>
                      {docente.email && (
                        <Typography variant="caption" display="block">
                          Email: {docente.email}
                        </Typography>
                      )}
                      {docente.telefono && (
                        <Typography variant="caption" display="block">
                          Tel: {docente.telefono}
                        </Typography>
                      )}
                    </>
                  }
                />
                {docenteSeleccionado?.persona_id === docente.persona_id && (
                  <CheckCircleIcon color="primary" />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );

  // PASO 2: Seleccionar Rol
  const renderPaso2 = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Docente seleccionado:{' '}
        <strong>
          {docenteSeleccionado?.apellido}, {docenteSeleccionado?.nombre}
        </strong>
      </Alert>

      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
        Selecciona el rol del docente:
      </Typography>

      <RadioGroup
        value={rolSeleccionado}
        onChange={(e) => setRolSeleccionado(parseInt(e.target.value))}
      >
        {roles.map((rol) => (
          <FormControlLabel
            key={rol.id}
            value={rol.id}
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {rol.nombre}
                </Typography>
                {rol.descripcion && (
                  <Typography variant="caption" color="text.secondary">
                    {rol.descripcion}
                  </Typography>
                )}
              </Box>
            }
            sx={{
              border: '1px solid',
              borderColor: rolSeleccionado === rol.id ? 'primary.main' : 'divider',
              borderRadius: 1,
              mb: 1,
              p: 1.5,
              ml: 0,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          />
        ))}
      </RadioGroup>

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Observaciones (opcional)"
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        placeholder="Agrega notas o comentarios sobre esta asignación..."
        sx={{ mt: 2 }}
      />
    </Box>
  );

  // PASO 3: Confirmar
  const renderPaso3 = () => (
    <Box>
      <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
        Revisa los datos antes de confirmar la asignación
      </Alert>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Actividad
        </Typography>
        <Typography variant="body1" fontWeight={500}>
          {actividadNombre}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Docente
        </Typography>
        <Typography variant="body1" fontWeight={500}>
          {docenteSeleccionado?.apellido}, {docenteSeleccionado?.nombre}
        </Typography>
        {docenteSeleccionado?.email && (
          <Typography variant="caption" display="block" color="text.secondary">
            {docenteSeleccionado.email}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Rol
        </Typography>
        <Typography variant="body1" fontWeight={500}>
          {rolSeleccionadoObj?.nombre}
        </Typography>
        {rolSeleccionadoObj?.descripcion && (
          <Typography variant="caption" display="block" color="text.secondary">
            {rolSeleccionadoObj.descripcion}
          </Typography>
        )}
      </Box>

      {observaciones && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Observaciones
            </Typography>
            <Typography variant="body2">{observaciones}</Typography>
          </Box>
        </>
      )}
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderPaso1();
      case 1:
        return renderPaso2();
      case 2:
        return renderPaso3();
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return docenteSeleccionado !== null;
      case 1:
        return rolSeleccionado !== null;
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Asignar Docente a Actividad</DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ pt: 2, pb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {getStepContent(activeStep)}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Box sx={{ flex: 1 }} />
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Anterior
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepValid() || loading}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleAsignar}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Asignando...' : 'Asignar Docente'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AsignarDocenteModalV2;
