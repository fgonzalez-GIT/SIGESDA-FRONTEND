import React, { useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  MusicNote as MusicNoteIcon,
  Videocam as VideocamIcon,
  Chair as ChairIcon,
  Thermostat as ThermostatIcon,
  Computer as ComputerIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchEquipamientos } from '@/store/slices/equipamientosSlice';
import type { Equipamiento, CategoriaEquipamientoCodigo } from '@/types/equipamiento.types';
import { getCategoriaLabel, getCategoriaColor } from '@/types/equipamiento.types';

interface EquipamientoSelectProps {
  value: number[]; // Array de IDs de equipamientos seleccionados
  onChange: (newValue: number[]) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  multiple?: boolean; // true = multi-select, false = single select
  groupByCategory?: boolean; // Agrupar por categoría
  showOnlyActive?: boolean; // Mostrar solo activos
}

// Mapeo de iconos por código de categoría
const categoriaIcons: Record<string, React.ReactElement> = {
  TEC_AUDIO: <ComputerIcon fontSize="small" />,
  DIDACT: <CategoryIcon fontSize="small" />,
  INST_MUS: <MusicNoteIcon fontSize="small" />,
  MOB: <ChairIcon fontSize="small" />,
  INFRAEST: <CategoryIcon fontSize="small" />,
  // Fallbacks para códigos legacy
  MUSICAL: <MusicNoteIcon fontSize="small" />,
  AUDIOVISUAL: <VideocamIcon fontSize="small" />,
  MOBILIARIO: <ChairIcon fontSize="small" />,
  CLIMATIZACION: <ThermostatIcon fontSize="small" />,
  TECNOLOGIA: <ComputerIcon fontSize="small" />,
  OTRO: <CategoryIcon fontSize="small" />,
};

export const EquipamientoSelect: React.FC<EquipamientoSelectProps> = ({
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
  label = 'Equipamientos',
  multiple = true,
  groupByCategory = false,
  showOnlyActive = true,
}) => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.equipamientos);

  // Cargar equipamientos al montar
  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchEquipamientos({ includeInactive: !showOnlyActive }));
    }
  }, [dispatch, items.length, showOnlyActive]);

  // Filtrar equipamientos
  const equipamientosFiltrados = showOnlyActive
    ? items.filter((eq) => eq.activo)
    : items;

  // Ordenar por orden y nombre
  const equipamientosOrdenados = [...equipamientosFiltrados].sort((a, b) => {
    if (a.orden !== b.orden) return a.orden - b.orden;
    return a.nombre.localeCompare(b.nombre);
  });

  // Obtener objetos completos de los equipamientos seleccionados
  const equipamientosSeleccionados = equipamientosOrdenados.filter((eq) =>
    value.includes(eq.id)
  );

  const handleChange = (_event: any, newValue: Equipamiento | Equipamiento[] | null) => {
    if (multiple) {
      const newIds = (newValue as Equipamiento[]).map((eq) => eq.id);
      onChange(newIds);
    } else {
      const newId = newValue ? (newValue as Equipamiento).id : null;
      onChange(newId ? [newId] : []);
    }
  };

  // Agrupar por categoría si está habilitado
  const getGroupBy = groupByCategory
    ? (option: Equipamiento) => getCategoriaLabel(option.categoriaEquipamiento)
    : undefined;

  if (loading && items.length === 0) {
    return (
      <TextField
        fullWidth
        label={label}
        disabled
        InputProps={{
          endAdornment: <CircularProgress size={20} />,
        }}
        helperText="Cargando equipamientos..."
      />
    );
  }

  return (
    <Autocomplete
      multiple={multiple}
      id="equipamiento-select"
      options={equipamientosOrdenados}
      value={multiple ? equipamientosSeleccionados : (equipamientosSeleccionados[0] || null)}
      onChange={handleChange}
      disabled={disabled}
      loading={loading}
      getOptionLabel={(option) => (option as Equipamiento).nombre}
      isOptionEqualToValue={(option, value) => (option as Equipamiento).id === (value as Equipamiento).id}
      groupBy={getGroupBy}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={multiple ? 'Seleccione equipamientos' : 'Seleccione un equipamiento'}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...restProps } = props as any;
        const eq = option as Equipamiento;
        return (
          <Box
            component="li"
            key={key}
            {...restProps}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
          >
            {categoriaIcons[eq.categoriaEquipamiento?.codigo] || categoriaIcons['OTRO']}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1">
                {eq.nombre}
                {!eq.activo && ' (Inactivo)'}
              </Typography>
              {eq.descripcion && (
                <Typography variant="caption" color="text.secondary">
                  {eq.descripcion}
                </Typography>
              )}
            </Box>
            <Chip
              label={getCategoriaLabel(eq.categoriaEquipamiento)}
              size="small"
              color={getCategoriaColor(eq.categoriaEquipamiento)}
              variant="outlined"
              sx={{ ml: 'auto' }}
            />
          </Box>
        );
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...restProps } = getTagProps({ index }) as any;
          const eq = option as Equipamiento;
          return (
            <Chip
              key={key}
              label={eq.nombre}
              icon={categoriaIcons[eq.categoriaEquipamiento?.codigo] || categoriaIcons['OTRO']}
              {...restProps}
              color={getCategoriaColor(eq.categoriaEquipamiento)}
              variant="filled"
              size="small"
            />
          );
        })
      }
      sx={{
        minWidth: 300,
      }}
      disableCloseOnSelect={multiple}
      limitTags={3}
      noOptionsText="No hay equipamientos disponibles"
    />
  );
};

export default EquipamientoSelect;
