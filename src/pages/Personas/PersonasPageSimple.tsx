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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  // CircularProgress, // Unused - Secciones module removed
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  FamilyRestroom as FamilyIcon,
  FamilyRestroomOutlined as FamilyIconOutlined,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  ContentCopy as ContentCopyIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  SchoolOutlined as StudentIcon,
  WorkOutline as WorkIcon,
  Business as BusinessIcon,
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

  // Debug: log personas state whenever it changes (disabled to reduce console noise)
  // useEffect(() => {
  //   console.log('[Component] Personas state updated:', personas);
  // }, [personas]);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null);
  const [familiaresDialogOpen, setFamiliaresDialogOpen] = useState(false);
  const [selectedPersonaFamiliares, setSelectedPersonaFamiliares] = useState<number | null>(null);
  // const [participacionesPorPersona, setParticipacionesPorPersona] = useState<{ [key: string | number]: number }>({}); // Unused - Secciones removed
  // const participacionesLoadedRef = useRef<Set<string | number>>(new Set()); // Unused - Secciones removed
  // const isLoadingParticipacionesRef = useRef(false); // Unused - Secciones removed
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [personaToReactivate, setPersonaToReactivate] = useState<Persona | null>(null);
  const [pendingFormData, setPendingFormData] = useState<Omit<Persona, 'id' | 'fechaIngreso'> | null>(null);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [filterCategoria, setFilterCategoria] = useState<string>('');

  // Estado para controlar filas expandidas (contacto)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

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

  const getPersonaFamiliares = (personaId: number) => {
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
        // No necesitamos fetchPersonas() - el reducer ya actualiza el estado
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
        // No necesitamos fetchPersonas() - el reducer ya actualiza el estado
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
        await dispatch(deletePersona(personaToDelete.id)).unwrap();

        dispatch(showNotification({
          message: 'Persona eliminada exitosamente',
          severity: 'success'
        }));
        setDeleteDialogOpen(false);
        setPersonaToDelete(null);

        // Refrescar familiares para actualizar las relaciones
        dispatch(fetchPersonasConFamiliares());
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

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      socio: 'Socio',
      docente: 'Docente',
      estudiante: 'Estudiante'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  // Función para obtener ícono según tipo de persona
  const getTipoIcon = (tipo: string) => {
    const tipoUpper = tipo.toUpperCase();
    switch (tipoUpper) {
      case 'SOCIO':
        return <GroupIcon fontSize="small" color="primary" />;
      case 'NO_SOCIO':
        return <PersonIcon fontSize="small" color="action" />;
      case 'ESTUDIANTE':
        return <StudentIcon fontSize="small" color="secondary" />;
      case 'DOCENTE':
        return <WorkIcon fontSize="small" color="success" />;
      case 'PROVEEDOR':
        return <BusinessIcon fontSize="small" color="warning" />;
      default:
        return <PersonIcon fontSize="small" color="disabled" />;
    }
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterTipo('');
    setFilterEstado('');
    setFilterCategoria('');
  };

  // Función para expandir/colapsar filas de contacto
  const toggleRowExpansion = (personaId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(personaId)) {
        newSet.delete(personaId);
      } else {
        newSet.add(personaId);
      }
      return newSet;
    });
  };

  // Función para copiar al portapapeles
  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      dispatch(showNotification({
        message: `${label} copiado al portapapeles`,
        severity: 'success'
      }));
    }).catch(() => {
      dispatch(showNotification({
        message: 'Error al copiar al portapapeles',
        severity: 'error'
      }));
    });
  };

  // Aplicar filtros a las personas
  const filteredPersonas = personas.filter((persona) => {
    // Filtro de búsqueda (nombre, apellido, DNI, email)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      persona.nombre.toLowerCase().includes(searchLower) ||
      persona.apellido.toLowerCase().includes(searchLower) ||
      (persona.dni && persona.dni.toLowerCase().includes(searchLower)) ||
      (persona.email && persona.email.toLowerCase().includes(searchLower));

    // Filtro por tipo
    const matchesTipo = filterTipo === '' || persona.tipo.toUpperCase() === filterTipo.toUpperCase();

    // Filtro por estado
    const matchesEstado = filterEstado === '' || persona.estado === filterEstado;

    // Filtro por categoría (solo para socios)
    const matchesCategoria = filterCategoria === '' ||
      (persona.categoriaId && persona.categoriaId.toString() === filterCategoria);

    return matchesSearch && matchesTipo && matchesEstado && matchesCategoria;
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de PersonasER
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

      {/* Sección de Búsqueda y Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Buscar por nombre, apellido, DNI o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, flexGrow: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              label="Tipo"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="SOCIO">Socio</MenuItem>
              <MenuItem value="NO_SOCIO">No Socio</MenuItem>
              <MenuItem value="ESTUDIANTE">Estudiante</MenuItem>
              <MenuItem value="DOCENTE">Docente</MenuItem>
              <MenuItem value="PROVEEDOR">Proveedor</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            onClick={handleClearFilters}
            startIcon={<FilterListIcon />}
          >
            Limpiar Filtros
          </Button>

          <Box sx={{ ml: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
              {filteredPersonas.length} de {personas.length} personas
            </Typography>
          </Box>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {/* ID column removed - only used internally for key prop */}
              <TableCell sx={{ width: 40 }}></TableCell>
              <TableCell sx={{ minWidth: 120, whiteSpace: 'nowrap' }}>Nombre</TableCell>
              <TableCell sx={{ minWidth: 120, whiteSpace: 'nowrap' }}>Apellido</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell sx={{ width: 70 }} align="center">Clasif.</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell sx={{ width: 60 }} align="center">Fam.</TableCell>
              {/* <TableCell>Secciones</TableCell> */}
              <TableCell sx={{ width: 100 }}>Ingreso</TableCell>
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
            {!loading && filteredPersonas.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  {personas.length === 0 ? 'No hay personas registradas' : 'No se encontraron personas con los filtros aplicados'}
                </TableCell>
              </TableRow>
            )}
            {filteredPersonas.map((persona) => {
              const isExpanded = expandedRows.has(persona.id);
              const hasEmail = !!persona.email;
              const hasPhone = !!persona.telefono;
              const isSocio = persona.tipo === 'SOCIO' || persona.tipo === 'socio';
              const hasCategoria = isSocio && persona.categoria;

              return (
                <React.Fragment key={persona.id}>
                  <TableRow hover>
                    {/* Botón para expandir/colapsar */}
                    <TableCell sx={{ padding: '4px' }}>
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(persona.id)}
                        disabled={!hasEmail && !hasPhone}
                      >
                        {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
                      <Tooltip title={persona.nombre.length > 15 ? persona.nombre : ''} placement="top">
                        <span>{persona.nombre}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
                      <Tooltip title={persona.apellido.length > 15 ? persona.apellido : ''} placement="top">
                        <span>{persona.apellido}</span>
                      </Tooltip>
                    </TableCell>
                    {/* Columna de Contacto con íconos */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {hasEmail ? (
                          <EmailIcon fontSize="small" color="primary" />
                        ) : (
                          <EmailIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                        )}
                        {hasPhone ? (
                          <PhoneIcon fontSize="small" color="primary" />
                        ) : (
                          <PhoneIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                        )}
                        {!hasEmail && !hasPhone && (
                          <Typography variant="body2" color="text.secondary">
                            Sin datos
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    {/* Columna de Clasificación (Tipo + Categoría) */}
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                        {getTipoIcon(persona.tipo)}
                        {hasCategoria && (
                          <CategoryIcon fontSize="small" color="primary" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={persona.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        color={persona.estado === 'activo' ? 'primary' : 'default'}
                        size="small"
                        variant={persona.estado === 'activo' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {(() => {
                        const personaFamiliares = getPersonaFamiliares(persona.id);
                        const cantidadFamiliares = personaFamiliares?.familiares.length || 0;
                        const tieneGrupo = !!personaFamiliares?.grupoFamiliar;
                        const hasFamiliares = cantidadFamiliares > 0;

                        return (
                          <IconButton
                            size="small"
                            onClick={() => handleFamiliaresClick(persona)}
                            color={hasFamiliares ? 'primary' : 'default'}
                            title={hasFamiliares
                              ? `${cantidadFamiliares} familiar${cantidadFamiliares > 1 ? 'es' : ''}${tieneGrupo ? ' (con grupo familiar)' : ''}`
                              : 'Sin familiares - Click para agregar'
                            }
                          >
                            {hasFamiliares ? (
                              <FamilyIcon />
                            ) : (
                              <FamilyIconOutlined sx={{ color: 'text.disabled' }} />
                            )}
                          </IconButton>
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
                    <TableCell>
                      <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                        {formatDateShort(persona.fechaIngreso)}
                      </Typography>
                    </TableCell>
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

                  {/* Fila expandible con detalles */}
                  {isExpanded && (hasEmail || hasPhone) && (
                    <TableRow>
                      <TableCell colSpan={10} sx={{ backgroundColor: 'action.hover', py: 2 }}>
                        <Box sx={{ pl: 4 }}>
                          <Stack direction="row" spacing={4} divider={<Box sx={{ width: 1, bgcolor: 'divider' }} />}>
                            {/* Sección de Contacto */}
                            {(hasEmail || hasPhone) && (
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <EmailIcon fontSize="small" />
                                  Información de Contacto
                                </Typography>
                                <Stack spacing={1.5} sx={{ mt: 1 }}>
                                  {hasEmail && (
                                    <Box display="flex" alignItems="center" gap={2}>
                                      <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 100 }}>
                                        <EmailIcon fontSize="small" color="primary" />
                                        <Typography variant="body2" fontWeight={500}>Email:</Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ flex: 1 }}>
                                        {persona.email}
                                      </Typography>
                                      <Box display="flex" gap={1}>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleCopyToClipboard(persona.email!, 'Email')}
                                          title="Copiar email"
                                        >
                                          <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          component="a"
                                          href={`mailto:${persona.email}`}
                                          title="Enviar email"
                                          color="primary"
                                        >
                                          <EmailIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  )}
                                  {hasPhone && (
                                    <Box display="flex" alignItems="center" gap={2}>
                                      <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 100 }}>
                                        <PhoneIcon fontSize="small" color="primary" />
                                        <Typography variant="body2" fontWeight={500}>Teléfono:</Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ flex: 1 }}>
                                        {persona.telefono}
                                      </Typography>
                                      <Box display="flex" gap={1}>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleCopyToClipboard(persona.telefono!, 'Teléfono')}
                                          title="Copiar teléfono"
                                        >
                                          <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          component="a"
                                          href={`tel:${persona.telefono}`}
                                          title="Llamar"
                                          color="primary"
                                        >
                                          <PhoneIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  )}
                                </Stack>
                              </Box>
                            )}

                            {/* Sección de Clasificación */}
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CategoryIcon fontSize="small" />
                                Clasificación
                              </Typography>
                              <Stack spacing={1.5} sx={{ mt: 1 }}>
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 100 }}>
                                    {getTipoIcon(persona.tipo)}
                                    <Typography variant="body2" fontWeight={500}>Tipo:</Typography>
                                  </Box>
                                  <Chip
                                    label={getTipoLabel(persona.tipo)}
                                    size="small"
                                    color={isSocio ? 'primary' : 'default'}
                                    variant="outlined"
                                  />
                                </Box>
                                {isSocio && (
                                  <Box display="flex" alignItems="center" gap={2}>
                                    <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 100 }}>
                                      <CategoryIcon fontSize="small" color="primary" />
                                      <Typography variant="body2" fontWeight={500}>Categoría:</Typography>
                                    </Box>
                                    {hasCategoria ? (
                                      <CategoriaBadge categoria={persona.categoria} size="small" />
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">Sin categoría</Typography>
                                    )}
                                  </Box>
                                )}
                              </Stack>
                            </Box>

                            {/* Sección de Familiares */}
                            <Box sx={{ flex: 1 }}>
                              {(() => {
                                const personaFamiliares = getPersonaFamiliares(persona.id);
                                const cantidadFamiliares = personaFamiliares?.familiares.length || 0;
                                const tieneGrupo = !!personaFamiliares?.grupoFamiliar;

                                return (
                                  <>
                                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <FamilyIcon fontSize="small" />
                                      Familiares
                                    </Typography>
                                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                                      <Box display="flex" alignItems="center" gap={2}>
                                        <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 100 }}>
                                          <FamilyIcon fontSize="small" color="primary" />
                                          <Typography variant="body2" fontWeight={500}>Relaciones:</Typography>
                                        </Box>
                                        <Chip
                                          label={cantidadFamiliares > 0 ? `${cantidadFamiliares} familiar${cantidadFamiliares > 1 ? 'es' : ''}` : 'Sin familiares'}
                                          size="small"
                                          color={cantidadFamiliares > 0 ? 'primary' : 'default'}
                                          variant="outlined"
                                        />
                                      </Box>
                                      {tieneGrupo && (
                                        <Box display="flex" alignItems="center" gap={2}>
                                          <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 100 }}>
                                            <GroupIcon fontSize="small" color="success" />
                                            <Typography variant="body2" fontWeight={500}>Grupo:</Typography>
                                          </Box>
                                          <Chip
                                            label="Grupo Familiar"
                                            size="small"
                                            color="success"
                                            variant="filled"
                                          />
                                        </Box>
                                      )}
                                      <Box display="flex" alignItems="center" gap={2}>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          startIcon={<FamilyIcon />}
                                          onClick={() => handleFamiliaresClick(persona)}
                                          fullWidth
                                        >
                                          {cantidadFamiliares > 0 ? 'Ver Familiares' : 'Agregar Familiares'}
                                        </Button>
                                      </Box>
                                    </Stack>
                                  </>
                                );
                              })()}
                            </Box>
                          </Stack>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
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
        disableEscapeKeyDown={loading}
        disableRestoreFocus
        keepMounted={false}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar a {personaToDelete?.nombre} {personaToDelete?.apellido}?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={loading}
            autoFocus
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
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
        personaSeleccionada={selectedPersonaFamiliares ?? undefined}
      />
    </Box>
  );
};

export default PersonasPageSimple;