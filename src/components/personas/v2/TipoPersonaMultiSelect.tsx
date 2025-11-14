import React from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  PersonOutline as PersonOutlineIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { TipoPersona } from '@/types/persona.types';

interface TipoPersonaMultiSelectProps {
  value: string[]; // Array de códigos de tipos seleccionados
  onChange: (newValue: string[]) => void;
  tiposPersona: TipoPersona[];
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
}

// Mapeo de iconos por código de tipo
const tipoIcons: Record<string, React.ReactElement> = {
  SOCIO: <PersonIcon fontSize="small" />,
  DOCENTE: <SchoolIcon fontSize="small" />,
  PROVEEDOR: <BusinessIcon fontSize="small" />,
  NO_SOCIO: <PersonOutlineIcon fontSize="small" />,
};

// Mapeo de campos requeridos por tipo
const camposRequeridos: Record<string, string[]> = {
  SOCIO: ['Categoría'],
  DOCENTE: ['Especialidad', 'Honorarios por hora'],
  PROVEEDOR: ['CUIT', 'Razón Social'],
  NO_SOCIO: [],
};

export const TipoPersonaMultiSelect: React.FC<TipoPersonaMultiSelectProps> = ({
  value,
  onChange,
  tiposPersona,
  disabled = false,
  error = false,
  helperText,
  label = 'Tipos de Persona',
}) => {
  // Filtrar solo tipos activos
  const tiposActivos = tiposPersona.filter((tipo) => tipo.activo);

  // Obtener objetos completos de los tipos seleccionados
  const tiposSeleccionados = tiposActivos.filter((tipo) =>
    value.includes(tipo.codigo)
  );

  const handleChange = (_event: any, newValue: TipoPersona[]) => {
    const newCodigos = newValue.map((tipo) => tipo.codigo);

    // Validar exclusión mutua SOCIO ↔ NO_SOCIO
    if (
      newCodigos.includes('SOCIO') &&
      newCodigos.includes('NO_SOCIO')
    ) {
      // Si se intenta seleccionar ambos, determinar cuál se agregó último
      const ultimoCodigo = newCodigos[newCodigos.length - 1];

      if (ultimoCodigo === 'SOCIO') {
        // Se agregó SOCIO, remover NO_SOCIO
        onChange(newCodigos.filter((c) => c !== 'NO_SOCIO'));
      } else {
        // Se agregó NO_SOCIO, remover SOCIO
        onChange(newCodigos.filter((c) => c !== 'SOCIO'));
      }
    } else {
      onChange(newCodigos);
    }
  };

  // Función para renderizar la descripción con campos requeridos
  const renderDescripcion = (tipo: TipoPersona) => {
    const campos = camposRequeridos[tipo.codigo] || [];

    return (
      <Box>
        {tipo.descripcion && (
          <Typography variant="body2" color="text.secondary">
            {tipo.descripcion}
          </Typography>
        )}
        {campos.length > 0 && (
          <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <InfoIcon sx={{ fontSize: 14, color: 'primary.main' }} />
            <Typography variant="caption" color="primary">
              Requiere: {campos.join(', ')}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Autocomplete
      multiple
      id="tipo-persona-select"
      options={tiposActivos}
      value={tiposSeleccionados}
      onChange={handleChange}
      disabled={disabled}
      getOptionLabel={(option) => option.nombre}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Seleccione uno o más tipos"
          error={error}
          helperText={helperText}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...restProps } = props as any;
        return (
          <Box
            component="li"
            key={key}
            {...restProps}
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              {tipoIcons[option.codigo]}
              <Typography variant="body1">{option.nombre}</Typography>
            </Box>
            {renderDescripcion(option)}
          </Box>
        );
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...restProps } = getTagProps({ index }) as any;
          const campos = camposRequeridos[option.codigo] || [];

          return (
            <Tooltip
              key={key}
              title={
                campos.length > 0
                  ? `Requiere: ${campos.join(', ')}`
                  : option.descripcion || ''
              }
            >
              <Chip
                label={option.nombre}
                icon={tipoIcons[option.codigo]}
                {...restProps}
                color={campos.length > 0 ? 'primary' : 'default'}
                variant={campos.length > 0 ? 'filled' : 'outlined'}
              />
            </Tooltip>
          );
        })
      }
      sx={{
        minWidth: 300,
      }}
      disableCloseOnSelect
      limitTags={3}
    />
  );
};
