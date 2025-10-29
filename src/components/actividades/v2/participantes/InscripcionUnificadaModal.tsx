import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Send as SendIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { RolBadge } from '../RolBadge';
import { ProyeccionCupo } from './ProyeccionCupo';
import { personasApi } from '../../../../services/personasApi';
import { inscribirMultiplesPersonas } from '../../../../services/participacionApi';
import type { Persona } from '../../../../types/persona.types';

interface InscripcionUnificadaModalProps {
  open: boolean;
  onClose: () => void;
  actividadId: number;
  actividadNombre: string;
  costoActividad: number;
  cupoMaximo: number | null;
  cupoActual: number;
  fechaInicioActividad?: string;
  participantesExistentes: number[];
  onSuccess: () => void;
}

/**
 * Modal unificado de inscripción de participantes
 * Permite inscribir 1 o múltiples personas mediante autocompletado
 * Sigue el patrón de búsqueda → selección → tabla → inscripción
 */
export const InscripcionUnificadaModal: React.FC<InscripcionUnificadaModalProps> = ({
  open,
  onClose,
  actividadId,
  actividadNombre,
  costoActividad,
  cupoMaximo,
  cupoActual,
  fechaInicioActividad,
  participantesExistentes,
  onSuccess
}) => {
  // Estados principales
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<Persona[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [inscribiendo, setInscribiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cargar personas disponibles al abrir el modal
  useEffect(() => {
    if (open) {
      cargarPersonas();
      setSelectedPeople([]);
      setSearchTerm('');
      setSuccessMessage(null);
      setError(null);
    }
  }, [open]);

  const cargarPersonas = async () => {
    setLoading(true);
    setError(null);
    try {
      // En V2, la respuesta tiene estructura { success, data, pagination }
      const response = await personasApi.getAll({ limit: 100, estado: 'ACTIVO' });
      setPersonas(response.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar personas');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar personas disponibles (no inscritas y no seleccionadas)
  const filteredPeople = useMemo(() => {
    // Requiere mínimo 2 caracteres para activar el autocompletado
    if (searchTerm.trim().length < 2) return [];

    const selectedIds = new Set(selectedPeople.map(p => p.id));
    const existenteIds = new Set(participantesExistentes);

    return personas
      .filter(persona => {
        // Excluir ya inscritos y ya seleccionados
        if (existenteIds.has(persona.id) || selectedIds.has(persona.id)) {
          return false;
        }

        // Búsqueda por nombre, apellido, email, DNI
        const searchLower = searchTerm.toLowerCase();
        const nombreCompleto = `${persona.nombre} ${persona.apellido}`.toLowerCase();
        const apellidoNombre = `${persona.apellido} ${persona.nombre}`.toLowerCase();
        const email = persona.email?.toLowerCase() || '';
        const dni = persona.dni?.toString() || '';

        return (
          nombreCompleto.includes(searchLower) ||
          apellidoNombre.includes(searchLower) ||
          email.includes(searchLower) ||
          dni.includes(searchLower)
        );
      })
      .slice(0, 8); // Limitar a 8 resultados
  }, [searchTerm, personas, selectedPeople, participantesExistentes]);

  // Agregar persona a la lista de seleccionados
  const addPerson = (person: Persona) => {
    setSelectedPeople(prev => [...prev, person]);
    setSearchTerm('');
    setHighlightedIndex(0);
    setError(null);

    // Mantener el foco en el input para búsquedas consecutivas
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  // Remover persona de la lista de seleccionados
  const removePerson = (id: number) => {
    setSelectedPeople(prev => prev.filter(p => p.id !== id));
  };

  // Navegación con teclado en el autocompletado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredPeople.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredPeople.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredPeople.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredPeople[highlightedIndex]) {
          addPerson(filteredPeople[highlightedIndex]);
        }
        break;
      case 'Escape':
        setSearchTerm('');
        setHighlightedIndex(0);
        break;
    }
  };

  // Validar cupo disponible
  const validarCupo = (): boolean => {
    if (cupoMaximo === null) return true; // Sin límite
    const cupoProyectado = cupoActual + selectedPeople.length;
    return cupoProyectado <= cupoMaximo;
  };

  // Manejar inscripción
  const handleSubmit = async () => {
    if (selectedPeople.length === 0) {
      setError('Debes seleccionar al menos una persona para inscribir');
      return;
    }

    if (!validarCupo()) {
      setError('No hay cupo suficiente para inscribir a todas las personas seleccionadas');
      return;
    }

    setInscribiendo(true);
    setError(null);

    try {
      const response = await inscribirMultiplesPersonas({
        actividadId: actividadId,
        personas: selectedPeople.map(persona => ({
          personaId: persona.id,
          fechaInicio: fechaInicioActividad || new Date().toISOString()
        }))
      });

      console.log('Respuesta de inscripción:', response);

      // Verificar si hubo errores en la respuesta
      const { totalCreadas, totalErrores, errores } = response.data;

      if (totalErrores > 0 && totalCreadas === 0) {
        // Todas las inscripciones fallaron
        const errorDetails = errores.map(e => `- Persona ID ${e.personaId}: ${e.error}`).join('\n');
        setError(`${response.message}\n\nDetalles de los errores:\n${errorDetails}`);
        return;
      }

      if (totalErrores > 0) {
        // Algunas inscripciones fallaron
        const errorDetails = errores.map(e => `- Persona ID ${e.personaId}: ${e.error}`).join('\n');
        setSuccessMessage(`${totalCreadas} persona(s) inscrita(s) exitosamente. ${totalErrores} error(es).`);
        setError(`Algunos participantes no pudieron ser inscritos:\n${errorDetails}`);
      } else {
        // Todo exitoso
        setSuccessMessage(`¡${totalCreadas} persona(s) inscrita(s) exitosamente!`);
      }

      setSelectedPeople([]);

      // Cerrar modal y refrescar después de 1.5s
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al inscribir participantes');
    } finally {
      setInscribiendo(false);
    }
  };

  // Helper: obtener el primer tipo de una persona V2
  const getPrimerTipo = (persona: Persona): string => {
    return persona.tipos?.[0]?.tipoPersonaCodigo || 'NO_SOCIO';
  };

  // Determinar color del avatar según el tipo de persona
  const getAvatarColor = (tipo?: string) => {
    const tipoUpper = tipo?.toUpperCase() || '';
    if (tipoUpper === 'DOCENTE') return 'error.main';
    if (tipoUpper === 'SOCIO') return 'primary.main';
    if (tipoUpper === 'ESTUDIANTE') return 'success.main';
    return 'grey.500';
  };

  return (
    <Dialog
      open={open}
      onClose={inscribiendo ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" />
          <Typography variant="h6" component="span">
            Inscribir Participante(s)
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Utiliza el campo de autocompletado para buscar y añadir participantes a la lista de inscripción
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Alerta de error */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            <Box sx={{ whiteSpace: 'pre-wrap' }}>{error}</Box>
          </Alert>
        )}

        {/* Alerta de éxito */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Campo de búsqueda con autocompletado */}
        <Box sx={{ mb: 3, position: 'relative' }}>
          <TextField
            inputRef={searchInputRef}
            fullWidth
            placeholder="Buscar y Añadir Persona (Mín. 2 letras para activar el autocompletado)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            disabled={loading || inscribiendo}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />

          {/* Dropdown de autocompletado */}
          <Collapse in={filteredPeople.length > 0 && searchTerm.length >= 2}>
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                mt: 0.5,
                maxHeight: 300,
                overflow: 'auto'
              }}
            >
              <List disablePadding>
                {filteredPeople.map((persona, index) => (
                  <ListItem
                    key={persona.id}
                    disablePadding
                    sx={{
                      bgcolor: index === highlightedIndex ? 'primary.main' : 'transparent',
                      color: index === highlightedIndex ? 'white' : 'inherit',
                      transition: 'all 0.2s'
                    }}
                  >
                    <ListItemButton onClick={() => addPerson(persona)}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getAvatarColor(getPrimerTipo(persona)) }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ color: index === highlightedIndex ? 'white' : 'inherit' }}
                            >
                              {persona.apellido}, {persona.nombre}
                            </Typography>
                            <RolBadge tipo={getPrimerTipo(persona)} size="small" />
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            sx={{ color: index === highlightedIndex ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}
                          >
                            {persona.email || 'Sin email'}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Collapse>
        </Box>

        {/* Proyección de cupo */}
        {cupoMaximo !== null && (
          <Box sx={{ mb: 3 }}>
            <ProyeccionCupo
              cupoMaximo={cupoMaximo}
              cupoActual={cupoActual}
              personasSeleccionadas={selectedPeople.length}
            />
          </Box>
        )}

        {/* Tabla de personas seleccionadas */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            ROSTER DE INSCRITOS ({selectedPeople.length})
          </Typography>

          {selectedPeople.length === 0 ? (
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'grey.300'
              }}
            >
              <InfoIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                La lista de inscripción está vacía
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Usa el campo de búsqueda para añadir participantes
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell><strong>NOMBRE</strong></TableCell>
                    <TableCell><strong>ROL</strong></TableCell>
                    <TableCell><strong>EMAIL</strong></TableCell>
                    <TableCell align="center"><strong>ACCIÓN</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedPeople.map((persona) => (
                    <TableRow key={persona.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {persona.apellido}, {persona.nombre}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <RolBadge tipo={getPrimerTipo(persona)} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {persona.email || 'Sin email'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removePerson(persona.id)}
                          disabled={inscribiendo}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={inscribiendo}
          color="inherit"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selectedPeople.length === 0 || inscribiendo || !validarCupo()}
          variant="contained"
          startIcon={inscribiendo ? <CircularProgress size={20} /> : <SendIcon />}
        >
          {inscribiendo ? 'Inscribiendo...' : `Inscribir ${selectedPeople.length} Persona(s)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InscripcionUnificadaModal;
