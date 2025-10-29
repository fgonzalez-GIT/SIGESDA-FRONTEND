import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Autocomplete,
  Fade,
  Zoom,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Add,
  FamilyRestroom,
  People,
  AccountTree,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  Timeline,
  Groups,
  LocalOffer,
  TableChart,
  ViewModule,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchRelaciones,
  fetchPersonasConFamiliares,
  fetchGrupos,
  fetchAllRelaciones,
  fetchEstadisticasParentesco,
  eliminarRelacion,
  actualizarRelacion,
  setFilters,
  clearFilters,
  type FamiliaresFilters,
  type PersonaConFamiliares,
  type RelacionFamiliar,
  type GrupoFamiliar,
} from '../../store/slices/familiaresSlice';
import { fetchPersonas } from '../../store/slices/personasSlice';
import RelacionFamiliarDialog from '../../components/forms/RelacionFamiliarDialogSimple';
import FamiliaresTable from '../../components/familiares/FamiliaresTable';
import FamiliarFilters, { type FiltrosRelaciones } from '../../components/familiares/FamiliarFilters';
import FamiliaresStats from '../../components/familiares/FamiliaresStats';
import { ConfirmDeleteDialog } from '../../components/common/ConfirmDeleteDialog';

interface PersonaNode {
  id: number;
  nombre: string;
  apellido: string;
  tipo: string;
  level: number;
  x: number;
  y: number;
  relations: Array<{
    targetId: number;
    tipo: string;
    color: string;
  }>;
}

const FamiliaresPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    relaciones,
    personasConFamiliares,
    grupos,
    filters,
    loading,
    error,
    estadisticas
  } = useAppSelector((state) => state.familiares);
  const { personas } = useAppSelector((state) => state.personas);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaConFamiliares | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'tree' | 'groups'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPersona, setMenuPersona] = useState<PersonaConFamiliares | null>(null);

  // FASE 2: Nuevos estados para tabla
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtrosTabla, setFiltrosTabla] = useState<FiltrosRelaciones>({ soloActivos: true });
  const [relacionToEdit, setRelacionToEdit] = useState<RelacionFamiliar | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [relacionToDelete, setRelacionToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchPersonas({}));

    if (viewMode === 'table') {
      // FASE 2: Cargar relaciones completas con paginación
      dispatch(fetchAllRelaciones({
        page: page + 1, // Backend usa páginas desde 1
        limit: rowsPerPage,
        soloActivos: filtrosTabla.soloActivos,
        socioId: filtrosTabla.personaId,
        parentesco: filtrosTabla.tipoRelacion,
      }));
      dispatch(fetchEstadisticasParentesco());
    } else {
      // Modo cards/tree/groups: usar funciones originales
      dispatch(fetchRelaciones({}));
      dispatch(fetchPersonasConFamiliares());
      dispatch(fetchGrupos());
    }
  }, [dispatch, viewMode, page, rowsPerPage, filtrosTabla]);

  const handleFilterChange = (key: keyof FamiliaresFilters, value: any) => {
    dispatch(setFilters({ ...filters, [key]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchTerm('');
  };

  const handlePersonaSelect = (persona: PersonaConFamiliares) => {
    setSelectedPersona(persona);
    setViewMode('tree');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, persona: PersonaConFamiliares) => {
    setAnchorEl(event.currentTarget);
    setMenuPersona(persona);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuPersona(null);
  };

  // FASE 2: Handlers para tabla
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFiltrosChange = (nuevosFiltros: FiltrosRelaciones) => {
    setFiltrosTabla(nuevosFiltros);
    setPage(0); // Reset a primera página cuando cambian filtros
  };

  const handleClearFiltros = () => {
    setFiltrosTabla({ soloActivos: true });
    setPage(0);
  };

  const handleEditRelacion = (relacion: any) => {
    setRelacionToEdit(relacion);
    setDialogOpen(true);
  };

  const handleDeleteRelacion = (id: number) => {
    setRelacionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!relacionToDelete) return;

    setDeleting(true);
    try {
      await dispatch(eliminarRelacion(relacionToDelete)).unwrap();

      // Recargar datos
      if (viewMode === 'table') {
        await dispatch(fetchAllRelaciones({
          page: page + 1,
          limit: rowsPerPage,
          soloActivos: filtrosTabla.soloActivos,
          socioId: filtrosTabla.personaId,
          parentesco: filtrosTabla.tipoRelacion,
        }));
      }
    } catch (error) {
      console.error('Error al eliminar relación:', error);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setRelacionToDelete(null);
    }
  };

  const handleDialogSuccess = () => {
    setDialogOpen(false);
    setRelacionToEdit(null);

    // Recargar datos según modo
    if (viewMode === 'table') {
      dispatch(fetchAllRelaciones({
        page: page + 1,
        limit: rowsPerPage,
        soloActivos: filtrosTabla.soloActivos,
        socioId: filtrosTabla.personaId,
        parentesco: filtrosTabla.tipoRelacion,
      }));
    } else {
      dispatch(fetchRelaciones({}));
      dispatch(fetchPersonasConFamiliares());
    }
  };

  // Calcular estadísticas para el componente Stats
  const calcularEstadisticas = () => {
    const totalActivas = relaciones.filter(r => r.activo).length;
    const conPermisoRF = relaciones.filter(r => r.responsableFinanciero).length;
    const conPermisoCE = relaciones.filter(r => r.contactoEmergencia).length;
    const conPermisoAR = relaciones.filter(r => r.autorizadoRetiro).length;
    const conDescuento = relaciones.filter(r => r.porcentajeDescuento && r.porcentajeDescuento > 0).length;

    const descuentos = relaciones
      .filter(r => r.porcentajeDescuento && r.porcentajeDescuento > 0)
      .map(r => r.porcentajeDescuento || 0);

    const descuentoPromedio = descuentos.length > 0
      ? descuentos.reduce((sum, d) => sum + d, 0) / descuentos.length
      : 0;

    return {
      totalRelaciones: relaciones.length,
      totalActivas,
      conPermisoRF,
      conPermisoCE,
      conPermisoAR,
      conDescuento,
      descuentoPromedio,
    };
  };

  const buildFamilyTree = (persona: PersonaConFamiliares): PersonaNode[] => {
    const nodes: PersonaNode[] = [];
    const visited = new Set<number>();
    const levels = new Map<number, number>();

    const addNode = (p: PersonaConFamiliares, level: number, x: number) => {
      if (visited.has(p.id)) return;

      visited.add(p.id);
      levels.set(p.id, level);

      const relations = p.familiares.map(f => ({
        targetId: f.familiar.id,
        tipo: f.relacion.tipoRelacion,
        color: getRelationColor(f.relacion.tipoRelacion),
      }));

      nodes.push({
        id: p.id,
        nombre: p.nombre,
        apellido: p.apellido,
        tipo: p.tipo,
        level,
        x,
        y: level * 120 + 50,
        relations,
      });

      // Agregar familiares en niveles apropiados
      p.familiares.forEach((familiar, index) => {
        const familiarPersona = personasConFamiliares.find(pc => pc.id === familiar.familiar.id);
        if (familiarPersona && !visited.has(familiarPersona.id)) {
          const relationLevel = getRelationLevel(familiar.relacion.tipoRelacion, level);
          addNode(familiarPersona, relationLevel, x + (index - p.familiares.length / 2) * 200);
        }
      });
    };

    addNode(persona, 2, 400);
    return nodes;
  };

  const getRelationLevel = (tipoRelacion: string, currentLevel: number): number => {
    const upRelations = ['padre', 'madre', 'abuelo', 'abuela'];
    const downRelations = ['hijo', 'hija', 'nieto', 'nieta'];
    const sameRelations = ['esposo', 'esposa', 'hermano', 'hermana'];

    if (upRelations.includes(tipoRelacion)) return currentLevel - 1;
    if (downRelations.includes(tipoRelacion)) return currentLevel + 1;
    if (sameRelations.includes(tipoRelacion)) return currentLevel;
    return currentLevel;
  };

  const getRelationColor = (tipoRelacion: string): string => {
    const colors: { [key: string]: string } = {
      'padre': '#1976d2',
      'madre': '#d32f2f',
      'hijo': '#2e7d32',
      'hija': '#7b1fa2',
      'esposo': '#ed6c02',
      'esposa': '#ed6c02',
      'hermano': '#0288d1',
      'hermana': '#0288d1',
      'abuelo': '#5d4037',
      'abuela': '#5d4037',
      'tio': '#455a64',
      'tia': '#455a64',
      'primo': '#795548',
      'prima': '#795548',
    };
    return colors[tipoRelacion] || '#616161';
  };

  const getPersonTypeColor = (tipo: string): string => {
    switch (tipo) {
      case 'socio': return 'primary';
      case 'docente': return 'secondary';
      case 'estudiante': return 'success';
      default: return 'default';
    }
  };

  const filteredPersonas = personasConFamiliares.filter(persona => {
    const searchMatch = searchTerm === '' ||
      persona.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.apellido.toLowerCase().includes(searchTerm.toLowerCase());

    const hasRelations = filters.personaId ?
      persona.familiares.some(f => f.familiar.id === filters.personaId) : true;

    return searchMatch && hasRelations;
  });

  const renderPersonCard = (persona: PersonaConFamiliares) => (
    <Zoom in={true} key={persona.id}>
      <Card
        sx={{
          minHeight: 300,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          }
        }}
        onClick={() => handlePersonaSelect(persona)}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: getRelationColor('padre') }}>
                {persona.nombre[0]}{persona.apellido[0]}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {persona.nombre} {persona.apellido}
                </Typography>
                <Chip
                  label={persona.tipo}
                  color={getPersonTypeColor(persona.tipo) as any}
                  size="small"
                />
              </Box>
            </Box>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, persona);
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Relaciones Familiares ({persona.familiares.length})
          </Typography>

          <Stack spacing={1} sx={{ maxHeight: 120, overflow: 'auto' }}>
            {persona.familiares.slice(0, 3).map((familiar) => (
              <Box
                key={familiar.familiar.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  p: 1,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: `2px solid ${getRelationColor(familiar.relacion.tipoRelacion)}20`
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {familiar.familiar.nombre} {familiar.familiar.apellido}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {familiar.relacion.tipoRelacion}
                  </Typography>
                </Box>
                <Box display="flex" gap={0.5}>
                  {familiar.relacion.responsableFinanciero && (
                    <Chip label="RF" size="small" color="warning" />
                  )}
                  {familiar.relacion.contactoEmergencia && (
                    <Chip label="CE" size="small" color="error" />
                  )}
                  {familiar.relacion.autorizadoRetiro && (
                    <Chip label="AR" size="small" color="info" />
                  )}
                </Box>
              </Box>
            ))}
            {persona.familiares.length > 3 && (
              <Typography variant="caption" color="text.secondary" textAlign="center">
                +{persona.familiares.length - 3} relaciones más
              </Typography>
            )}
          </Stack>

          {persona.grupoFamiliar && (
            <Box mt={2}>
              <Divider sx={{ mb: 1 }} />
              <Box display="flex" alignItems="center" gap={1}>
                <Groups fontSize="small" color="primary" />
                <Typography variant="body2" color="primary">
                  {persona.grupoFamiliar.nombre}
                </Typography>
                <Chip
                  label={`${persona.grupoFamiliar.descuentoGrupal}% desc.`}
                  size="small"
                  color="success"
                  icon={<LocalOffer />}
                />
              </Box>
            </Box>
          )}
        </CardContent>

        <CardActions>
          <Button
            size="small"
            startIcon={<AccountTree />}
            onClick={(e) => {
              e.stopPropagation();
              handlePersonaSelect(persona);
            }}
          >
            Ver Árbol
          </Button>
          <Button
            size="small"
            startIcon={<Add />}
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
          >
            Agregar Relación
          </Button>
        </CardActions>
      </Card>
    </Zoom>
  );

  const renderFamilyTree = () => {
    if (!selectedPersona) return null;

    const nodes = buildFamilyTree(selectedPersona);
    const svgWidth = 800;
    const svgHeight = 600;

    return (
      <Card sx={{ p: 2 }}>
        <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Árbol Genealógico: {selectedPersona.nombre} {selectedPersona.apellido}
          </Typography>
          <Button
            onClick={() => setSelectedPersona(null)}
            variant="outlined"
            size="small"
          >
            Volver a Lista
          </Button>
        </Box>

        <Box
          sx={{
            width: '100%',
            height: svgHeight,
            overflow: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            position: 'relative'
          }}
        >
          <svg width={svgWidth} height={svgHeight} style={{ minWidth: svgWidth }}>
            {/* Líneas de conexión */}
            {nodes.map(node =>
              node.relations.map(relation => {
                const targetNode = nodes.find(n => n.id === relation.targetId);
                if (!targetNode) return null;

                return (
                  <line
                    key={`${node.id}-${relation.targetId}`}
                    x1={node.x}
                    y1={node.y + 30}
                    x2={targetNode.x}
                    y2={targetNode.y + 30}
                    stroke={relation.color}
                    strokeWidth="2"
                    opacity="0.7"
                  />
                );
              })
            )}

            {/* Nodos de personas */}
            {nodes.map(node => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y + 30}
                  r="25"
                  fill={getRelationColor('padre')}
                  opacity="0.8"
                />
                <text
                  x={node.x}
                  y={node.y + 35}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                >
                  {node.nombre[0]}{node.apellido[0]}
                </text>
                <text
                  x={node.x}
                  y={node.y + 75}
                  textAnchor="middle"
                  fontSize="12"
                  fill="black"
                >
                  {node.nombre}
                </text>
                <text
                  x={node.x}
                  y={node.y + 90}
                  textAnchor="middle"
                  fontSize="10"
                  fill="gray"
                >
                  {node.tipo}
                </text>
              </g>
            ))}
          </svg>
        </Box>
      </Card>
    );
  };

  const renderGroupsView = () => (
    <Stack spacing={3}>
      {grupos.map(grupo => (
        <Card key={grupo.id}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {grupo.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {grupo.descripcion}
                </Typography>
              </Box>
              <Chip
                label={`${grupo.descuentoGrupal}% descuento`}
                color="success"
                icon={<LocalOffer />}
              />
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Miembros ({grupo.miembros.length})
            </Typography>

            <Box display="flex" gap={2} flexWrap="wrap">
              {grupo.miembros.map(miembroId => {
                const miembro = personasConFamiliares.find(p => p.id === miembroId);
                if (!miembro) return null;

                const esReferente = miembro.id === grupo.personaReferente;

                return (
                  <Box
                    key={miembro.id}
                    minWidth={250}
                    flex={1}
                    display="flex"
                    alignItems="center"
                    gap={2}
                    sx={{
                      p: 1.5,
                      bgcolor: esReferente ? 'primary.50' : 'grey.50',
                      borderRadius: 1,
                      border: esReferente ? '2px solid' : '1px solid',
                      borderColor: esReferente ? 'primary.main' : 'divider'
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: esReferente ? 'primary.main' : 'grey.400',
                        width: 32,
                        height: 32
                      }}
                    >
                      {miembro.nombre[0]}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={esReferente ? 'bold' : 'normal'}>
                        {miembro.nombre} {miembro.apellido}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {miembro.tipo} {esReferente && '(Referente)'}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Configuración
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Chip
                  label={grupo.configuracion.facturacionConjunta ? "Facturación conjunta" : "Facturación individual"}
                  size="small"
                  color={grupo.configuracion.facturacionConjunta ? "primary" : "default"}
                />
                <Chip
                  label={grupo.configuracion.descuentoProgresivo ? "Descuento progresivo" : "Descuento fijo"}
                  size="small"
                  color={grupo.configuracion.descuentoProgresivo ? "secondary" : "default"}
                />
                {grupo.configuracion.limiteCuotas > 0 && (
                  <Chip
                    label={`Límite: ${grupo.configuracion.limiteCuotas} cuotas`}
                    size="small"
                    color="warning"
                  />
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Familiares
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra las relaciones familiares y grupos familiares del sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Nueva Relación
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* FASE 2: Estadísticas (solo en modo tabla) */}
      {viewMode === 'table' && (
        <FamiliaresStats estadisticas={calcularEstadisticas()} />
      )}

      {/* FASE 2: Filtros avanzados (solo en modo tabla) */}
      {viewMode === 'table' && (
        <FamiliarFilters
          filtros={filtrosTabla}
          personas={personas}
          onFiltrosChange={handleFiltrosChange}
          onClearFiltros={handleClearFiltros}
        />
      )}

      {/* Controles de vista y filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" gap={2} alignItems="center">
              <Typography variant="body2" color="text.secondary" mr={1}>
                Modo de vista:
              </Typography>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="table">
                  <TableChart sx={{ mr: 0.5 }} fontSize="small" />
                  Tabla
                </ToggleButton>
                <ToggleButton value="cards">
                  <ViewModule sx={{ mr: 0.5 }} fontSize="small" />
                  Tarjetas
                </ToggleButton>
                <ToggleButton value="tree">
                  <AccountTree sx={{ mr: 0.5 }} fontSize="small" />
                  Árbol
                </ToggleButton>
                <ToggleButton value="groups">
                  <Groups sx={{ mr: 0.5 }} fontSize="small" />
                  Grupos
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box display="flex" gap={2} alignItems="center">
              <TextField
                placeholder="Buscar persona..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }}
                sx={{ minWidth: 250 }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                size="small"
              >
                Filtros
              </Button>
            </Box>
          </Box>

          <Fade in={showFilters}>
            <Box sx={{ display: showFilters ? 'block' : 'none' }}>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" gap={2} flexWrap="wrap">
                <Box minWidth={250} flex={1}>
                  <Autocomplete
                    options={personas}
                    getOptionLabel={(option) => `${option.nombre} ${option.apellido}`}
                    value={personas.find(p => p.id === filters.personaId) || null}
                    onChange={(_, value) => handleFilterChange('personaId', value?.id)}
                    renderInput={(params) => (
                      <TextField {...params} label="Filtrar por persona" size="small" />
                    )}
                  />
                </Box>
                <Box minWidth={200} flex={1}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de relación</InputLabel>
                    <Select
                      value={filters.tipoRelacion || ''}
                      onChange={(e: SelectChangeEvent) =>
                        handleFilterChange('tipoRelacion', e.target.value || undefined)
                      }
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="padre">Padre</MenuItem>
                      <MenuItem value="madre">Madre</MenuItem>
                      <MenuItem value="hijo">Hijo</MenuItem>
                      <MenuItem value="hija">Hija</MenuItem>
                      <MenuItem value="esposo">Esposo</MenuItem>
                      <MenuItem value="esposa">Esposa</MenuItem>
                      <MenuItem value="hermano">Hermano</MenuItem>
                      <MenuItem value="hermana">Hermana</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box minWidth={120}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearFilters}
                    fullWidth
                  >
                    Limpiar
                  </Button>
                </Box>
              </Box>
            </Box>
          </Fade>
        </CardContent>
      </Card>

      {/* Contenido principal */}
      {viewMode === 'table' ? (
        // FASE 2: Nueva vista de tabla bidireccional
        <FamiliaresTable
          relaciones={relaciones}
          personas={personas}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRelaciones={estadisticas.totalRelaciones}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEditRelacion}
          onDelete={handleDeleteRelacion}
        />
      ) : viewMode === 'groups' ? (
        renderGroupsView()
      ) : selectedPersona && viewMode === 'tree' ? (
        renderFamilyTree()
      ) : (
        <Box display="flex" gap={3} flexWrap="wrap">
          {filteredPersonas.map(persona => (
            <Box key={persona.id} minWidth={350} flex={1} maxWidth={450}>
              {renderPersonCard(persona)}
            </Box>
          ))}
        </Box>
      )}

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (menuPersona) handlePersonaSelect(menuPersona);
          handleMenuClose();
        }}>
          <AccountTree sx={{ mr: 1 }} />
          Ver Árbol Genealógico
        </MenuItem>
        <MenuItem onClick={() => {
          setDialogOpen(true);
          handleMenuClose();
        }}>
          <Add sx={{ mr: 1 }} />
          Agregar Relación
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} />
          Editar Relaciones
        </MenuItem>
      </Menu>

      {/* Dialog de relación familiar */}
      <RelacionFamiliarDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setRelacionToEdit(null);
        }}
        onSuccess={handleDialogSuccess}
        relacionToEdit={relacionToEdit}
      />

      {/* FASE 2: Diálogo de confirmación de eliminación */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setRelacionToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Relación Familiar"
        message="¿Está seguro que desea eliminar esta relación familiar?"
        itemName="la relación"
        loading={deleting}
      />
    </Box>
  );
};

export default FamiliaresPage;