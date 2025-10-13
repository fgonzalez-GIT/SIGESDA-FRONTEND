import React, { useEffect, useState } from 'react';
import { SeccionFilters as FilterType } from '../../types/seccion.types';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Paper
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface SeccionFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: Partial<FilterType>) => void;
}

export const SeccionFilters: React.FC<SeccionFiltersProps> = ({
  filters,
  onFilterChange
}) => {
  const [actividades, setActividades] = useState<any[]>([]);

  useEffect(() => {
    // Cargar actividades para el filtro
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
  }, []);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box display="flex" gap={2} flexWrap="wrap">
        {/* Búsqueda */}
        <TextField
          label="Buscar"
          placeholder="Nombre o código..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ minWidth: 250, flex: 1 }}
        />

        {/* Filtro por Actividad */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Actividad</InputLabel>
          <Select
            value={filters.actividadId || ''}
            onChange={(e) => onFilterChange({ actividadId: e.target.value || undefined })}
            label="Actividad"
          >
            <MenuItem value="">Todas</MenuItem>
            {actividades.map(act => (
              <MenuItem key={act.id} value={act.id}>
                {act.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Filtro por Estado */}
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={filters.activa === undefined ? '' : String(filters.activa)}
            onChange={(e) => {
              const value = e.target.value;
              onFilterChange({
                activa: value === '' ? undefined : value === 'true'
              });
            }}
            label="Estado"
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="true">Activas</MenuItem>
            <MenuItem value="false">Inactivas</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default SeccionFilters;
