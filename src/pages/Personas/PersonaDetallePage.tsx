import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  ContactPhone as ContactIcon,
  FamilyRestroom as FamilyIcon,
} from '@mui/icons-material';
import { PersonaHeader, ContactosTab } from '../../components/personas/v2';
import { usePersona, useCatalogosPersonas } from '../../hooks/usePersonas';
import { TipoItem } from '../../components/personas/v2/tipos';

interface TabPanelProps {
  children?: React.Node;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`persona-tabpanel-${index}`}
      aria-labelledby={`persona-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Página de detalle de una persona
 * Incluye tabs para: Datos Generales, Tipos, Contactos, Familiares
 */
const PersonaDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const personaId = id ? parseInt(id) : undefined;

  const [tabValue, setTabValue] = useState(0);

  // Cargar persona y catálogos
  const { persona, loading, error } = usePersona(personaId);
  const { catalogos, loading: catalogosLoading } = useCatalogosPersonas();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/personas-v2');
  };

  const handleEdit = () => {
    // TODO: Abrir formulario de edición
    console.log('Editar persona', personaId);
  };

  if (loading || catalogosLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Volver al listado
        </Button>
      </Box>
    );
  }

  if (!persona) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se encontró la persona
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Volver al listado
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={handleBack}
          sx={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          Personas
        </Link>
        <Typography color="text.primary">
          {persona.nombre} {persona.apellido}
        </Typography>
      </Breadcrumbs>

      {/* Header con botones */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Volver
        </Button>
        <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>
          Editar Persona
        </Button>
      </Box>

      {/* Header de la persona */}
      <Box mb={3}>
        <PersonaHeader persona={persona} showContactInfo showDates />
      </Box>

      {/* Tabs */}
      <Paper>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PersonIcon />} label="Datos Generales" iconPosition="start" />
          <Tab icon={<CategoryIcon />} label="Tipos" iconPosition="start" />
          <Tab icon={<ContactIcon />} label="Contactos" iconPosition="start" />
          <Tab icon={<FamilyIcon />} label="Familiares" iconPosition="start" />
        </Tabs>

        {/* Tab Panel: Datos Generales */}
        <TabPanel value={tabValue} index={0}>
          <Box p={2}>
            <Typography variant="h6" gutterBottom>
              Información Personal
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Nombre Completo
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {persona.nombre} {persona.apellido}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  DNI
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {persona.dni}
                </Typography>
              </Box>
              {persona.fechaNacimiento && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de Nacimiento
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {new Date(persona.fechaNacimiento).toLocaleDateString('es-AR')}
                  </Typography>
                </Box>
              )}
              {persona.observaciones && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Observaciones
                  </Typography>
                  <Typography variant="body1">{persona.observaciones}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </TabPanel>

        {/* Tab Panel: Tipos */}
        <TabPanel value={tabValue} index={1}>
          <Box p={2}>
            <Typography variant="h6" gutterBottom>
              Tipos Asignados
            </Typography>
            {persona.tipos && persona.tipos.length > 0 ? (
              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                {persona.tipos.map((tipo) => (
                  <TipoItem key={tipo.id} tipo={tipo} showActions={false} compact />
                ))}
              </Box>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                No hay tipos asignados a esta persona
              </Alert>
            )}
          </Box>
        </TabPanel>

        {/* Tab Panel: Contactos */}
        <TabPanel value={tabValue} index={2}>
          <Box p={2}>
            <ContactosTab personaId={persona.id} catalogos={catalogos} />
          </Box>
        </TabPanel>

        {/* Tab Panel: Familiares */}
        <TabPanel value={tabValue} index={3}>
          <Box p={2}>
            <Typography variant="h6" gutterBottom>
              Familiares
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              Integración con módulo de familiares en desarrollo
            </Alert>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PersonaDetallePage;
