import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Grid,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { usePersona } from '../../hooks/usePersonas';
import { PersonaFormBasic } from '../../components/personas/basic/PersonaFormBasic';
import personasApiBasic from '../../services/personasApi.basic';
import { handleApiError } from '../../utils/errorHandling';
import { useAppDispatch } from '../../hooks/redux';
import { showNotification } from '../../store/slices/uiSlice';
import type { CreatePersonaBasicFormData } from '../../schemas/persona.basic.schema';

/**
 * Página de detalle básica de una persona
 * Compatible con Backend Básico (6 endpoints)
 * Sin tabs de tipos, contactos, familiares
 */
const PersonaDetallePageBasic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const personaId = id ? parseInt(id) : undefined;

  const [editFormOpen, setEditFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Cargar persona
  const { persona, loading, error, refetch } = usePersona(personaId);

  const handleBack = () => {
    navigate('/personas');
  };

  const handleEdit = () => {
    setEditFormOpen(true);
  };

  const handleEditSubmit = async (data: CreatePersonaBasicFormData) => {
    if (!personaId) return;

    try {
      await personasApiBasic.update(personaId, data);
      dispatch(
        showNotification({
          message: 'Persona actualizada exitosamente',
          severity: 'success',
        })
      );
      setEditFormOpen(false);
      refetch();
    } catch (err: any) {
      handleApiError(err);
      throw err; // Re-throw para que el formulario no se cierre
    }
  };

  const handleDelete = async () => {
    if (!personaId || !persona) return;

    const confirmacion = window.confirm(
      `¿Está seguro que desea eliminar a ${persona.nombre} ${persona.apellido}?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmacion) return;

    setDeleting(true);
    try {
      await personasApiBasic.delete(personaId);
      dispatch(
        showNotification({
          message: 'Persona eliminada exitosamente',
          severity: 'success',
        })
      );
      navigate('/personas');
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
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
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>
            Editar
          </Button>
        </Box>
      </Box>

      {/* Información de la persona */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {persona.nombre} {persona.apellido}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          {/* Datos Personales */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Datos Personales
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Nombre Completo
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {persona.nombre} {persona.apellido}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              DNI
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {persona.dni}
            </Typography>
          </Grid>

          {persona.fechaNacimiento && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Fecha de Nacimiento
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {new Date(persona.fechaNacimiento).toLocaleDateString('es-AR')}
              </Typography>
            </Grid>
          )}

          {/* Datos de Contacto */}
          {(persona.email || persona.telefono || persona.direccion) && (
            <>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="primary">
                  Datos de Contacto
                </Typography>
              </Grid>

              {persona.email && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {persona.email}
                  </Typography>
                </Grid>
              )}

              {persona.telefono && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {persona.telefono}
                  </Typography>
                </Grid>
              )}

              {persona.direccion && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Dirección
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {persona.direccion}
                  </Typography>
                </Grid>
              )}
            </>
          )}

          {/* Observaciones */}
          {persona.observaciones && (
            <>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="primary">
                  Observaciones
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body1">{persona.observaciones}</Typography>
              </Grid>
            </>
          )}

          {/* Metadatos */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom color="primary">
              Información del Sistema
            </Typography>
          </Grid>

          {persona.createdAt && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Fecha de Creación
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {new Date(persona.createdAt).toLocaleString('es-AR')}
              </Typography>
            </Grid>
          )}

          {persona.updatedAt && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Última Modificación
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {new Date(persona.updatedAt).toLocaleString('es-AR')}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Formulario de edición */}
      {persona && (
        <PersonaFormBasic
          open={editFormOpen}
          onClose={() => setEditFormOpen(false)}
          onSubmit={handleEditSubmit}
          persona={persona}
        />
      )}
    </Box>
  );
};

export default PersonaDetallePageBasic;
