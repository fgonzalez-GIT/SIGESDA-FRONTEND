import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Unused - Secciones navigation removed
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
  // Tooltip, // Unused - Secciones module removed
  // CircularProgress, // Unused - Secciones module removed
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  FamilyRestroom as FamilyIcon,
  // School as SchoolIcon, // Unused - Secciones module removed
} from '@mui/icons-material';
// import seccionesApi from '../../services/seccionesApi'; // REMOVED: Secciones module deleted
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
import ReactivatePersonaDialog from '../../components/dialogs/ReactivatePersonaDialog';
import { CategoriaBadge } from '../../components/categorias/CategoriaBadge';

const PersonasPageSimple: React.FC = () => {
  const dispatch = useAppDispatch();
  // const navigate = useNavigate(); // Unused - Secciones navigation removed
  const { personas, loading, error, selectedPersona } = useAppSelector((state) => state.personas);
  const { personasConFamiliares } = useAppSelector((state) => state.familiares);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null);
  const [familiaresDialogOpen, setFamiliaresDialogOpen] = useState(false);
  const [selectedPersonaFamiliares, setSelectedPersonaFamiliares] = useState<string | number | null>(null);
  // const [participacionesPorPersona, setParticipacionesPorPersona] = useState<{ [key: string | number]: number }>({}); // Unused - Secciones removed
  // const participacionesLoadedRef = useRef<Set<string | number>>(new Set()); // Unused - Secciones removed
  // const isLoadingParticipacionesRef = useRef(false); // Unused - Secciones removed
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [personaToReactivate, setPersonaToReactivate] = useState<Persona | null>(null);
  const [pendingFormData, setPendingFormData] = useState<Omit<Persona, 'id' | 'fechaIngreso'> | null>(null);

  useEffect(() => {
    dispatch(fetchPersonas());
    dispatch(fetchPersonasConFamiliares());
  }, [dispatch]);

  // COMMENTED OUT: Secciones module was removed
  // Cargar participaciones en secciones para cada persona
  // useEffect(() => {
  //   const loadParticipaciones = async () => {
  //     // Evitar llamadas duplicadas si ya se están cargando
  //     if (isLoadingParticipacionesRef.current) return;

  //     // Filtrar solo personas que no han sido cargadas
  //     const personasToLoad = personas.filter(p => !participacionesLoadedRef.current.has(p.id));

  //     if (personasToLoad.length === 0) return;

  //     isLoadingParticipacionesRef.current = true;

  //     const participaciones: { [key: string | number]: number } = { ...participacionesPorPersona };

  //     for (const persona of personasToLoad) {
  //       try {
  //         const response = await seccionesApi.getSeccionesPorPersona(persona.id.toString(), true);
  //         participaciones[persona.id] = response.data.length;
  //         participacionesLoadedRef.current.add(persona.id);
  //       } catch (error) {
  //         participaciones[persona.id] = 0;
  //         participacionesLoadedRef.current.add(persona.id);
  //       }
  //     }

  //     setParticipacionesPorPersona(participaciones);
  //     isLoadingParticipacionesRef.current = false;
  //   };

  //   if (personas.length > 0) {
  //     loadParticipaciones();
  //   }
  // }, [personas]); // ✅ Removida dependencia circular

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

  const getPersonaFamiliares = (personaId: string | number) => {
    return personasConFamiliares.find(p => p.id === personaId);
  };

  const handleDniCheck = async (dni: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/personas/check-dni/${dni}`
      );

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;

        if (data.exists && data.isInactive && data.persona) {
          // Persona existe y está inactiva
          setPersonaToReactivate(data.persona);
          setReactivateDialogOpen(true);
        }
      }
    } catch (error) {
      console.error('Error checking DNI:', error);
    }
  };

  const handleFormSubmit = async (data: Omit<Persona, 'id' | 'fechaIngreso'>) => {
    try {
      if (selectedPersona) {
        await dispatch(updatePersona({ ...data, id: selectedPersona.id, fechaIngreso: selectedPersona.fechaIngreso })).unwrap();
        dispatch(showNotification({
          message: 'Persona actualizada exitosamente',
          severity: 'success'
        }));
        // Recargar personas para asegurar sincronización con backend
        dispatch(fetchPersonas());
      } else {
        // Verificar si hay persona a reactivar
        if (personaToReactivate) {
          setPendingFormData(data);
          setReactivateDialogOpen(true);
          return; // Esperar confirmación
        }

        // Solo agregar fechaIngreso para tipo SOCIO
        const personaData = data.tipo === 'SOCIO'
          ? { ...data, fechaIngreso: new Date().toISOString() }
          : data;

        await dispatch(createPersona(personaData)).unwrap();
        dispatch(showNotification({
          message: 'Persona creada exitosamente',
          severity: 'success'
        }));
        // Recargar personas para asegurar sincronización con backend
        dispatch(fetchPersonas());
      }
      setFormOpen(false);
    } catch (error: any) {
      // Detectar error DNI_DUPLICADO específicamente
      if (error.message === 'DNI_DUPLICADO') {
        dispatch(showNotification({
          message: 'Ya existe una persona con este DNI. Por favor, verifique los datos.',
          severity: 'warning'
        }));
      } else {
        dispatch(showNotification({
          message: 'Error al guardar la persona',
          severity: 'error'
        }));
      }
    }
  };

  const handleReactivateConfirm = async () => {
    if (personaToReactivate && pendingFormData) {
      try {
        // Limpiar campos undefined/null antes de enviar
        const cleanData = Object.fromEntries(
          Object.entries(pendingFormData).filter(([_, value]) => value !== undefined && value !== null && value !== '')
        );

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/personas/${personaToReactivate.id}/reactivate`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...cleanData,
              estado: 'activo'
            })
          }
        );

        if (!response.ok) {
          throw new Error('Error al reactivar persona');
        }

        dispatch(showNotification({
          message: 'Persona reactivada y actualizada exitosamente',
          severity: 'success'
        }));

        setReactivateDialogOpen(false);
        setPersonaToReactivate(null);
        setPendingFormData(null);
        setFormOpen(false);
        dispatch(fetchPersonas());
        dispatch(fetchPersonasConFamiliares());
      } catch (error) {
        dispatch(showNotification({
          message: 'Error al reactivar la persona',
          severity: 'error'
        }));
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (personaToDelete) {
      try {
        await dispatch(deletePersona(typeof personaToDelete.id === 'string' ? parseInt(personaToDelete.id) : personaToDelete.id)).unwrap();
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
              <TableCell>Categoría</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Familiares</TableCell>
              {/* <TableCell>Secciones</TableCell> */}
              <TableCell>Fecha Ingreso</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!loading && personas.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} align="center">
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
                  {persona.tipo === 'SOCIO' || persona.tipo === 'socio' ? (
                    <CategoriaBadge categoria={persona.categoria} size="small" />
                  ) : (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                  )}
                </TableCell>
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
                {/* COMMENTED OUT: Secciones module removed */}
                {/* <TableCell>
                  {participacionesPorPersona[persona.id] !== undefined ? (
                    participacionesPorPersona[persona.id] > 0 ? (
                      <Tooltip title="Ver secciones de esta persona">
                        <Chip
                          label={`${participacionesPorPersona[persona.id]} ${participacionesPorPersona[persona.id] === 1 ? 'sección' : 'secciones'}`}
                          size="small"
                          color="success"
                          variant="outlined"
                          icon={<SchoolIcon />}
                          onClick={() => navigate(`/participacion?personaId=${persona.id}`)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Tooltip>
                    ) : (
                      <Chip
                        label="Sin secciones"
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    )
                  ) : (
                    <CircularProgress size={20} />
                  )}
                </TableCell> */}
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
        onDniCheck={handleDniCheck}
        persona={selectedPersona}
        loading={loading}
      />

      <ReactivatePersonaDialog
        open={reactivateDialogOpen}
        persona={personaToReactivate}
        onConfirm={handleReactivateConfirm}
        onCancel={() => {
          setReactivateDialogOpen(false);
          setPersonaToReactivate(null);
          setPendingFormData(null);
        }}
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
        personaSeleccionada={
          selectedPersonaFamiliares
            ? (typeof selectedPersonaFamiliares === 'string'
                ? parseInt(selectedPersonaFamiliares)
                : selectedPersonaFamiliares)
            : undefined
        }
      />
    </Box>
  );
};

export default PersonasPageSimple;