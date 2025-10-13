import React, { useState } from 'react';
import { HorarioInput, DiaSemana } from '../../types/seccion.types';
import { DIAS_SEMANA } from '../../constants/secciones.constants';
import { validarHorario, detectarSolapamiento } from '../../utils/horarios.utils';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Paper,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AccessTime as ClockIcon
} from '@mui/icons-material';

interface HorarioInputsProps {
  horarios: HorarioInput[];
  onChange: (horarios: HorarioInput[]) => void;
  readonly?: boolean;
}

export const HorarioInputs: React.FC<HorarioInputsProps> = ({
  horarios,
  onChange,
  readonly = false
}) => {
  const [errors, setErrors] = useState<Record<number, string>>({});

  const handleAdd = () => {
    const nuevoHorario: HorarioInput = {
      diaSemana: 'LUNES',
      horaInicio: '09:00',
      horaFin: '10:00',
      activo: true
    };
    onChange([...horarios, nuevoHorario]);
  };

  const handleRemove = (index: number) => {
    onChange(horarios.filter((_, i) => i !== index));
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const handleChange = (index: number, field: keyof HorarioInput, value: any) => {
    const updated = [...horarios];
    updated[index] = { ...updated[index], [field]: value };

    // Validar horario
    const newErrors = { ...errors };
    if (field === 'horaInicio' || field === 'horaFin') {
      const horario = updated[index];
      if (!validarHorario(horario.horaInicio, horario.horaFin)) {
        newErrors[index] = 'La hora de fin debe ser mayor a la hora de inicio';
      } else {
        delete newErrors[index];

        // Validar solapamientos en el mismo día
        const solapamientos = updated.filter((h, i) =>
          i !== index &&
          h.diaSemana === horario.diaSemana &&
          detectarSolapamiento(
            { inicio: h.horaInicio, fin: h.horaFin },
            { inicio: horario.horaInicio, fin: horario.horaFin }
          )
        );

        if (solapamientos.length > 0) {
          newErrors[index] = `Se solapa con otro horario del ${horario.diaSemana}`;
        }
      }
    }

    setErrors(newErrors);
    onChange(updated);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Horarios</Typography>
        {!readonly && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Agregar Horario
          </Button>
        )}
      </Box>

      {horarios.length === 0 && (
        <Alert severity="info">
          No hay horarios configurados. Agregue al menos uno.
        </Alert>
      )}

      {horarios.map((horario, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: errors[index] ? '#fff5f5' : 'background.paper' }}>
          <Box display="flex" gap={2} alignItems="start" flexWrap="wrap">
            {/* Día de Semana */}
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Día</InputLabel>
              <Select
                value={horario.diaSemana}
                onChange={(e) => handleChange(index, 'diaSemana', e.target.value as DiaSemana)}
                label="Día"
                disabled={readonly}
              >
                {DIAS_SEMANA.map(dia => (
                  <MenuItem key={dia.value} value={dia.value}>
                    {dia.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Hora Inicio */}
            <TextField
              label="Hora Inicio"
              type="time"
              value={horario.horaInicio}
              onChange={(e) => handleChange(index, 'horaInicio', e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!errors[index]}
              disabled={readonly}
              sx={{ width: 150 }}
            />

            {/* Hora Fin */}
            <TextField
              label="Hora Fin"
              type="time"
              value={horario.horaFin}
              onChange={(e) => handleChange(index, 'horaFin', e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!errors[index]}
              disabled={readonly}
              sx={{ width: 150 }}
            />

            {/* Switch Activo */}
            <FormControlLabel
              control={
                <Switch
                  checked={horario.activo}
                  onChange={(e) => handleChange(index, 'activo', e.target.checked)}
                  disabled={readonly}
                />
              }
              label="Activo"
            />

            {/* Botón Eliminar */}
            {!readonly && (
              <IconButton
                color="error"
                onClick={() => handleRemove(index)}
                sx={{ ml: 'auto' }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          {/* Mensaje de Error */}
          {errors[index] && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {errors[index]}
            </Alert>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default HorarioInputs;
