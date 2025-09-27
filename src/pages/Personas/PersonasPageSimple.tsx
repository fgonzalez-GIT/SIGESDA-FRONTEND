import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  FamilyRestroom as FamilyIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchPersonas,
  createPersona,
  updatePersona,
  deletePersona,
  setSelectedPersona,
  clearError,
  Persona,
} from '../../store/slices/personasSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { fetchPersonasConFamiliares } from '../../store/slices/familiaresSlice';
import PersonaForm from '../../components/forms/PersonaFormSimple';
import RelacionFamiliarDialog from '../../components/forms/RelacionFamiliarDialogSimple';

const PersonasPageSimple: React.FC = () => {
  const dispatch = useAppDispatch();
  const { personas, loading, error, selectedPersona } = useAppSelector((state) => state.personas);
  const { personasConFamiliares } = useAppSelector((state) => state.familiares);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null);
  const [familiaresDialogOpen, setFamiliaresDialogOpen] = useState(false);
  const [selectedPersonaFamiliares, setSelectedPersonaFamiliares] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchPersonas());
    dispatch(fetchPersonasConFamiliares());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(showNotification({
        message: error,
        severity: 'error'
      }));
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAddClick = () => {
    dispatch(setSelectedPersona(null));
    setFormOpen(true);
  };

  const handleEditClick = (persona: Persona) => {
    dispatch(setSelectedPersona(persona));
    setFormOpen(true);
  };

  const handleViewClick = (persona: Persona) => {
    dispatch(setSelectedPersona(persona));
    setFormOpen(true);
  };

  const handleDeleteClick = (persona: Persona) => {
    setPersonaToDelete(persona);
    setDeleteDialogOpen(true);
  };

  const handleFamiliaresClick = (persona: Persona) => {
    setSelectedPersonaFamiliares(persona.id);
    setFamiliaresDialogOpen(true);
  };

  const getPersonaFamiliares = (personaId: number) => {
    return personasConFamiliares.find(p => p.id === personaId);
  };

  const handleFormSubmit = async (data: Omit<Persona, 'id' | 'fechaIngreso'>) => {
    try {
      if (selectedPersona) {
        await dispatch(updatePersona({ ...data, id: selectedPersona.id, fechaIngreso: selectedPersona.fechaIngreso })).unwrap();
        dispatch(showNotification({
          message: 'Persona actualizada exitosamente',
          severity: 'success'
        }));
      } else {
        await dispatch(createPersona({ ...data, fechaIngreso: new Date().toISOString().split('T')[0] })).unwrap();
        dispatch(showNotification({
          message: 'Persona creada exitosamente',
          severity: 'success'
        }));
      }
      setFormOpen(false);
    } catch (error) {
      dispatch(showNotification({
        message: 'Error al guardar la persona',
        severity: 'error'
      }));
    }
  };

  const handleDeleteConfirm = async () => {
    if (personaToDelete) {
      try {
        await dispatch(deletePersona(personaToDelete.id)).unwrap();
        dispatch(showNotification({
          message: 'Persona eliminada exitosamente',
          severity: 'success'
        }));
        setDeleteDialogOpen(false);
        setPersonaToDelete(null);
      } catch (error) {
        dispatch(showNotification({
          message: 'Error al eliminar la persona',
          severity: 'error'
        }));
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      socio: 'Socio',
      docente: 'Docente',
      estudiante: 'Estudiante'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Personas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Módulo para gestionar socios, docentes y estudiantes.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          size="large"
        >
          Nueva Persona
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Familiares</TableCell>
              <TableCell>Fecha Ingreso</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!loading && personas.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No hay personas registradas
                </TableCell>
              </TableRow>
            )}
            {personas.map((persona) => (
              <TableRow key={persona.id} hover>
                <TableCell>{persona.id}</TableCell>
                <TableCell>{persona.nombre}</TableCell>
                <TableCell>{persona.apellido}</TableCell>
                <TableCell>{persona.email || '-'}</TableCell>
                <TableCell>{persona.telefono || '-'}</TableCell>
                <TableCell>{getTipoLabel(persona.tipo)}</TableCell>
                <TableCell>
                  <Chip
                    label={persona.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    color={persona.estado === 'activo' ? 'primary' : 'default'}
                    size="small"
                    variant={persona.estado === 'activo' ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>
                  {(() => {
                    const personaFamiliares = getPersonaFamiliares(persona.id);
                    const cantidadFamiliares = personaFamiliares?.familiares.length || 0;
                    const tieneGrupo = !!personaFamiliares?.grupoFamiliar;

                    return (
                      <Box display="flex" alignItems="center" gap={1}>
                        {cantidadFamiliares > 0 ? (
                          <Chip
                            label={`${cantidadFamiliares} relaciones`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            icon={<FamilyIcon />}
                            onClick={() => handleFamiliaresClick(persona)}
                            sx={{ cursor: 'pointer' }}
                          />
                        ) : (
                          <Chip
                            label="Sin familiares"
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        )}
                        {tieneGrupo && (
                          <Chip
                            label="Grupo"
                            size="small"
                            color="success"
                            variant="filled"
                          />
                        )}
                      </Box>
                    );
                  })()}
                </TableCell>
                <TableCell>{formatDate(persona.fechaIngreso)}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewClick(persona)}
                      color="primary"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(persona)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleFamiliaresClick(persona)}
                      color="secondary"
                      title="Gestionar familiares"
                    >
                      <FamilyIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(persona)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <PersonaForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        persona={selectedPersona}
        loading={loading}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar a {personaToDelete?.nombre} {personaToDelete?.apellido}?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <RelacionFamiliarDialog
        open={familiaresDialogOpen}
        onClose={() => {
          setFamiliaresDialogOpen(false);
          setSelectedPersonaFamiliares(null);
        }}
        onSuccess={() => {
          setFamiliaresDialogOpen(false);
          setSelectedPersonaFamiliares(null);
          dispatch(fetchPersonasConFamiliares());
        }}
        personaSeleccionada={selectedPersonaFamiliares || undefined}
      />
    </Box>
  );
};

export default PersonasPageSimple;