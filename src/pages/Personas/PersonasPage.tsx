import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Pagination,
  Stack,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import {
  PersonasTable,
  PersonasFilters,
  PersonaFormV2,
  LoadingSkeleton,
} from '../../components/personas/v2';
import { usePersonas, useCatalogosPersonas } from '../../hooks/usePersonas';
import personasApi from '../../services/personasApi';
import type {
  Persona,
  PersonasQueryParams,
  CreatePersonaDTO,
} from '../../types/persona.types';
import { useAppDispatch } from '../../hooks/redux';
import { showNotification } from '../../store/slices/uiSlice';

/**
 * Página principal del Módulo Personas V2
 * Lista de personas con filtros, paginación y CRUD completo
 */
const PersonasPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Estado de catálogos
  const { catalogos, loading: catalogosLoading } = useCatalogosPersonas();

  // Estado de filtros
  const [filters, setFilters] = useState<PersonasQueryParams>({
    page: 1,
    limit: 20,
    includeTipos: true,
    includeContactos: false,
    includeRelaciones: true,
  });

  // Estado de personas
  const { personas, pagination, loading, fetchPersonas, refetch } = usePersonas(filters);

  // Estados de UI
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Recargar personas cuando cambian los filtros
  useEffect(() => {
    fetchPersonas(filters);
  }, [filters]);

  // Handlers de filtros
  const handleFilterChange = (newFilters: PersonasQueryParams) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      includeTipos: true,
      includeContactos: false,
      includeRelaciones: true,
    });
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setFilters({ ...filters, page });
  };

  // Handlers de acciones
  const handleAddClick = () => {
    setSelectedPersona(null);
    setFormOpen(true);
  };

  const handleViewClick = (persona: Persona) => {
    navigate(`/personas-v2/${persona.id}`);
  };

  const handleEditClick = (persona: Persona) => {
    setSelectedPersona(persona);
    setFormOpen(true);
  };

  const handleDeleteClick = (persona: Persona) => {
    setPersonaToDelete(persona);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedPersona(null);
  };

  const handleFormSubmit = async (data: CreatePersonaDTO) => {
    try {
      if (selectedPersona) {
        // Actualizar persona existente
        await personasApi.update(selectedPersona.id, data);
        dispatch(
          showNotification({
            message: 'Persona actualizada exitosamente',
            severity: 'success',
          })
        );
      } else {
        // Crear nueva persona
        await personasApi.create(data);
        dispatch(
          showNotification({
            message: 'Persona creada exitosamente',
            severity: 'success',
          })
        );
      }

      setFormOpen(false);
      setSelectedPersona(null);
      refetch();
    } catch (error: any) {
      console.error('Error al guardar persona:', error);

      let errorMessage = 'Error al guardar la persona';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch(
        showNotification({
          message: errorMessage,
          severity: 'error',
        })
      );

      // Re-throw para que el formulario no se cierre
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!personaToDelete) return;

    try {
      setDeleting(true);
      await personasApi.delete(personaToDelete.id);

      dispatch(
        showNotification({
          message: 'Persona eliminada exitosamente',
          severity: 'success',
        })
      );

      setDeleteDialogOpen(false);
      setPersonaToDelete(null);
      refetch();
    } catch (error: any) {
      console.error('Error al eliminar persona:', error);

      let errorMessage = 'Error al eliminar la persona';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      dispatch(
        showNotification({
          message: errorMessage,
          severity: 'error',
        })
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Personas V2
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sistema de múltiples tipos por persona con gestión dinámica
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          size="large"
          disabled={catalogosLoading}
        >
          Nueva Persona
        </Button>
      </Box>

      {/* Filtros */}
      <PersonasFilters
        filters={filters}
        catalogos={catalogos}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        resultCount={personas.length}
        totalCount={pagination?.total || 0}
      />

      {/* Tabla */}
      {loading && !personas.length ? (
        <LoadingSkeleton rows={10} variant="table" />
      ) : (
        <>
          <PersonasTable
            personas={personas}
            onView={handleViewClick}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            expandable
          />

          {/* Paginación */}
          {pagination && pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Stack spacing={2}>
                <Pagination
                  count={pagination.pages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Página {pagination.page} de {pagination.pages} ({pagination.total} personas)
                </Typography>
              </Stack>
            </Box>
          )}
        </>
      )}

      {/* Formulario */}
      <PersonaFormV2
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        persona={selectedPersona}
        catalogos={catalogos}
        loading={loading}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar a{' '}
            <strong>
              {personaToDelete?.nombre} {personaToDelete?.apellido}
            </strong>
            ?
            <br />
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PersonasPage;
