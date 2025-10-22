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
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  CardMembership as SocioIcon,
  PersonOff as NoSocioIcon,
  School as EstudianteIcon,
} from '@mui/icons-material';
import { personasApi } from '../../services/personasApi';
import { Persona } from '../../store/slices/personasSlice';

interface ParticipanteSelectProps {
  value?: number | string;
  onChange: (participanteId: number | string) => void;
  error?: string;
  required?: boolean;
  label?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  helperText?: string;
  showSearch?: boolean;
  filterTipo?: Array<Persona['tipo']>; // Opcional: filtrar por tipos específicos
}

// Mapa de iconos según el tipo de persona
const getTipoIcon = (tipo: string) => {
  const tipoUpper = tipo.toUpperCase();
  switch (tipoUpper) {
    case 'SOCIO':
      return <SocioIcon fontSize="small" color="primary" />;
    case 'NO_SOCIO':
    case 'NO SOCIO':
      return <NoSocioIcon fontSize="small" color="action" />;
    case 'ESTUDIANTE':
      return <EstudianteIcon fontSize="small" color="info" />;
    case 'DOCENTE':
      return <PersonIcon fontSize="small" color="secondary" />;
    default:
      return <PersonIcon fontSize="small" color="action" />;
  }
};

// Mapa de colores para chips
const getTipoColor = (tipo: string): "default" | "primary" | "secondary" | "info" | "success" | "warning" | "error" => {
  const tipoUpper = tipo.toUpperCase();
  switch (tipoUpper) {
    case 'SOCIO':
      return 'primary';
    case 'NO_SOCIO':
    case 'NO SOCIO':
      return 'default';
    case 'ESTUDIANTE':
      return 'info';
    case 'DOCENTE':
      return 'secondary';
    default:
      return 'default';
  }
};

// Formatear el tipo para mostrar
const formatTipo = (tipo: string): string => {
  const tipoUpper = tipo.toUpperCase();
  if (tipoUpper === 'NO_SOCIO') return 'No Socio';
  return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
};

export const ParticipanteSelect: React.FC<ParticipanteSelectProps> = ({
  value = '',
  onChange,
  error,
  required = false,
  label = 'Participante',
  disabled = false,
  fullWidth = true,
  helperText,
  showSearch = true,
  filterTipo,
}) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar personas al montar el componente
  useEffect(() => {
    const fetchPersonas = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        // Obtener todas las personas activas
        const response = await personasApi.getAll({
          estado: 'activo',
          limit: 100, // Límite máximo permitido por el backend
        });

        let personasList = response.data || [];

        // Aplicar filtro de tipo si se especificó
        if (filterTipo && filterTipo.length > 0) {
          personasList = personasList.filter((p) =>
            filterTipo.some((tipo) => p.tipo.toUpperCase() === tipo.toUpperCase())
          );
        }

        setPersonas(personasList);
      } catch (err) {
        console.error('Error al cargar personas:', err);
        setFetchError('Error al cargar la lista de participantes');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonas();
  }, [filterTipo]);

  // Filtrar personas por búsqueda
  const personasFiltradas = personas.filter((persona) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const nombreCompleto = `${persona.nombre} ${persona.apellido}`.toLowerCase();
    const dni = persona.dni?.toLowerCase() || '';
    const tipo = persona.tipo.toLowerCase();

    return nombreCompleto.includes(searchLower) || dni.includes(searchLower) || tipo.includes(searchLower);
  });

  // Ordenar personas por apellido, nombre
  const personasOrdenadas = [...personasFiltradas].sort((a, b) => {
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
          <MenuItem value="">Error al cargar participantes</MenuItem>
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
        {showSearch && personas.length > 5 && (
          <Box sx={{ px: 2, py: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
            <TextField
              size="small"
              placeholder="Buscar por nombre, DNI o tipo..."
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
            <em>Sin participante</em>
          </MenuItem>
        )}

        {/* Lista de personas */}
        {personasOrdenadas.length === 0 && !loading ? (
          <MenuItem value="" disabled>
            <em>
              {searchTerm
                ? 'No se encontraron participantes con ese criterio'
                : 'No hay participantes disponibles'}
            </em>
          </MenuItem>
        ) : (
          personasOrdenadas.map((persona) => (
            <MenuItem key={persona.id} value={persona.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {getTipoIcon(persona.tipo)}
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {persona.apellido}, {persona.nombre}
                    </Typography>
                    <Chip
                      label={formatTipo(persona.tipo)}
                      size="small"
                      color={getTipoColor(persona.tipo)}
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {persona.dni && `DNI: ${persona.dni}`}
                    {persona.numeroSocio && ` • Nº Socio: ${persona.numeroSocio}`}
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

export default ParticipanteSelect;
