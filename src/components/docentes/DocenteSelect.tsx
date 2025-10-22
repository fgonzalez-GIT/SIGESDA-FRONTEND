import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Box,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material';
import { personasApi } from '../../services/personasApi';
import { Persona } from '../../store/slices/personasSlice';

interface DocenteSelectProps {
  value?: number | string;
  onChange: (docenteId: number | string) => void;
  error?: string;
  required?: boolean;
  label?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  helperText?: string;
  showSearch?: boolean;
}

export const DocenteSelect: React.FC<DocenteSelectProps> = ({
  value = '',
  onChange,
  error,
  required = false,
  label = 'Docente',
  disabled = false,
  fullWidth = true,
  helperText,
  showSearch = true,
}) => {
  const [docentes, setDocentes] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar docentes al montar el componente
  useEffect(() => {
    const fetchDocentes = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        // Filtrar personas por tipo DOCENTE (debe ser en MAYÚSCULAS)
        const response = await personasApi.getAll({
          tipo: 'DOCENTE' as any, // Backend espera MAYÚSCULAS
          estado: 'activo',
          limit: 100, // Límite máximo permitido por el backend
        });

        setDocentes(response.data || []);
      } catch (err) {
        console.error('Error al cargar docentes:', err);
        setFetchError('Error al cargar la lista de docentes');
      } finally {
        setLoading(false);
      }
    };

    fetchDocentes();
  }, []);

  // Filtrar docentes por búsqueda
  const docentesFiltrados = docentes.filter((docente) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const nombreCompleto = `${docente.nombre} ${docente.apellido}`.toLowerCase();
    const dni = docente.dni?.toLowerCase() || '';

    return nombreCompleto.includes(searchLower) || dni.includes(searchLower);
  });

  // Ordenar docentes por apellido, nombre
  const docentesOrdenados = [...docentesFiltrados].sort((a, b) => {
    const apellidoCompare = a.apellido.localeCompare(b.apellido);
    if (apellidoCompare !== 0) return apellidoCompare;
    return a.nombre.localeCompare(b.nombre);
  });

  const handleChange = (event: any) => {
    onChange(event.target.value);
  };

  // Mostrar error de fetch si existe
  if (fetchError) {
    return (
      <FormControl fullWidth={fullWidth} error>
        <InputLabel>{label} {required && '*'}</InputLabel>
        <Select disabled value="">
          <MenuItem value="">Error al cargar docentes</MenuItem>
        </Select>
        <FormHelperText>
          {fetchError}. Por favor, recargue la página.
        </FormHelperText>
      </FormControl>
    );
  }

  return (
    <FormControl
      fullWidth={fullWidth}
      error={!!error}
      disabled={disabled || loading}
    >
      <InputLabel>{label} {required && '*'}</InputLabel>
      <Select
        value={value}
        onChange={handleChange}
        label={`${label} ${required ? '*' : ''}`}
        endAdornment={
          loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : null
        }
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 400,
            },
          },
        }}
      >
        {/* Campo de búsqueda dentro del menú */}
        {showSearch && docentes.length > 5 && (
          <Box sx={{ px: 2, py: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
            <TextField
              size="small"
              placeholder="Buscar por nombre o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}

        {/* Opción vacía si no es requerido */}
        {!required && (
          <MenuItem value="">
            <em>Sin docente</em>
          </MenuItem>
        )}

        {/* Lista de docentes */}
        {docentesOrdenados.length === 0 && !loading ? (
          <MenuItem value="" disabled>
            <em>
              {searchTerm
                ? 'No se encontraron docentes con ese criterio'
                : 'No hay docentes disponibles'}
            </em>
          </MenuItem>
        ) : (
          docentesOrdenados.map((docente) => (
            <MenuItem key={docente.id} value={docente.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <PersonIcon fontSize="small" color="action" />
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Typography variant="body2">
                    {docente.apellido}, {docente.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {docente.dni && `DNI: ${docente.dni}`}
                    {docente.especialidad && ` • ${docente.especialidad}`}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
      </Select>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default DocenteSelect;
