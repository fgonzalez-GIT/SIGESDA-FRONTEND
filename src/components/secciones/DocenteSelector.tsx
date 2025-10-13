import React, { useEffect, useState } from 'react';
import seccionesApi from '../../services/seccionesApi';
import { PersonaResumen, HorarioInput, ConflictoHorario } from '../../types/seccion.types';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  OutlinedInput,
  Typography
} from '@mui/material';
import {
  Person as PersonIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

interface DocenteSelectorProps {
  selectedDocentes: string[];
  horarios: HorarioInput[];
  onChange: (docenteIds: string[]) => void;
  onConflictDetected?: (conflictos: ConflictoHorario[]) => void;
  readonly?: boolean;
}

export const DocenteSelector: React.FC<DocenteSelectorProps> = ({
  selectedDocentes,
  horarios,
  onChange,
  onConflictDetected,
  readonly = false
}) => {
  const [docentes, setDocentes] = useState<PersonaResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [conflictos, setConflictos] = useState<ConflictoHorario[]>([]);
  const [cargaHoraria, setCargaHoraria] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadDocentes();
  }, []);

  useEffect(() => {
    // Verificar conflictos cuando cambien docentes u horarios
    if (selectedDocentes.length > 0 && horarios.length > 0) {
      verificarConflictos();
    } else {
      setConflictos([]);
    }
  }, [selectedDocentes, horarios]);

  const loadDocentes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/personas?tipo=DOCENTE`);
      if (response.ok) {
        const result = await response.json();
        setDocentes(result.data || result);
      }
    } catch (error) {
      console.error('Error al cargar docentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const verificarConflictos = async () => {
    const conflictosEncontrados: ConflictoHorario[] = [];

    for (const docenteId of selectedDocentes) {
      for (const horario of horarios) {
        try {
          const response = await seccionesApi.verificarConflictos({
            diaSemana: horario.diaSemana,
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin,
            docenteId
          });

          if (response.data.tieneConflictos) {
            conflictosEncontrados.push(...response.data.conflictos);
          }
        } catch (error) {
          console.error('Error verificando conflictos:', error);
        }
      }
    }

    setConflictos(conflictosEncontrados);
    if (onConflictDetected) {
      onConflictDetected(conflictosEncontrados);
    }
  };

  const handleDocenteChange = (event: any) => {
    const value = event.target.value;
    onChange(typeof value === 'string' ? value.split(',') : value);
  };

  const verCargaHoraria = async (docenteId: string) => {
    try {
      const response = await seccionesApi.getCargaHorariaDocente(docenteId);
      setCargaHoraria(response.data);
      setDialogOpen(true);
    } catch (error) {
      console.error('Error al obtener carga horaria:', error);
    }
  };

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel>Docentes</InputLabel>
        <Select
          multiple
          value={selectedDocentes}
          onChange={handleDocenteChange}
          input={<OutlinedInput label="Docentes" />}
          disabled={readonly || loading}
          renderValue={(selected) => (
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {selected.map((id) => {
                const docente = docentes.find(d => d.id === id);
                return (
                  <Chip
                    key={id}
                    label={docente ? `${docente.nombre} ${docente.apellido}` : id}
                    icon={<PersonIcon />}
                  />
                );
              })}
            </Box>
          )}
        >
          {loading ? (
            <MenuItem disabled>
              <CircularProgress size={20} sx={{ mr: 1 }} /> Cargando...
            </MenuItem>
          ) : docentes.length === 0 ? (
            <MenuItem disabled>
              No hay docentes disponibles
            </MenuItem>
          ) : (
            docentes.map(docente => (
              <MenuItem key={docente.id} value={docente.id}>
                {docente.nombre} {docente.apellido}
                {docente.email && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({docente.email})
                  </Typography>
                )}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      {/* Botones de Carga Horaria */}
      {selectedDocentes.length > 0 && !readonly && (
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          {selectedDocentes.map(id => {
            const docente = docentes.find(d => d.id === id);
            return (
              <Button
                key={id}
                size="small"
                variant="outlined"
                startIcon={<ScheduleIcon />}
                onClick={() => verCargaHoraria(id)}
              >
                Ver carga de {docente?.nombre}
              </Button>
            );
          })}
        </Box>
      )}

      {/* Alerta de Conflictos */}
      {conflictos.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }} icon={<WarningIcon />}>
          <AlertTitle>Conflictos de Horario Detectados</AlertTitle>
          <List dense>
            {conflictos.map((conflicto, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={conflicto.mensaje}
                  secondary={`${conflicto.detalles.diaSemana} ${conflicto.detalles.horaInicio}-${conflicto.detalles.horaFin} - ${conflicto.detalles.seccionNombre}`}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* Dialog de Carga Horaria */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Carga Horaria del Docente</DialogTitle>
        <DialogContent>
          {cargaHoraria && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {cargaHoraria.docente}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Total: {cargaHoraria.totalHorasSemana} horas semanales
              </Typography>

              {cargaHoraria.alerta && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {cargaHoraria.alerta.mensaje}
                </Alert>
              )}

              <List>
                {cargaHoraria.secciones.map((seccion: any, index: number) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={`${seccion.actividad} - ${seccion.seccion}`}
                      secondary={`${seccion.dia} ${seccion.horario} (${seccion.horas}h)`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocenteSelector;
