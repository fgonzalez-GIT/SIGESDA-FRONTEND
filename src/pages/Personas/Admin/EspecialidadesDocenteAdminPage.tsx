import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Alert,
  Chip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import {
  CatalogoTable,
  CatalogoFormDialog,
  type CatalogoColumn,
  type CatalogoField,
} from '../../../components/personas/v2/admin';
import { useCatalogosPersonas } from '../../../hooks/usePersonas';
import personasApi from '../../../services/personasApi';
import {
  createEspecialidadDocenteSchema,
  updateEspecialidadDocenteSchema,
  type CreateEspecialidadDocenteFormData,
  type UpdateEspecialidadDocenteFormData,
} from '../../../schemas/persona.schema';
import type { EspecialidadDocente } from '../../../types/persona.types';
import { useAppDispatch } from '../../../hooks/redux';
import { showNotification } from '../../../store/slices/uiSlice';

/**
 * Página de administración de Especialidades Docentes
 * Permite crear, editar, activar/desactivar y reordenar especialidades
 */
const EspecialidadesDocenteAdminPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { catalogos, loading: catalogosLoading, refetch } = useCatalogosPersonas();

  // Estados de UI
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<EspecialidadDocente | null>(null);
  const [especialidadToDelete, setEspecialidadToDelete] = useState<EspecialidadDocente | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Definición de columnas de la tabla
  const columns: CatalogoColumn<EspecialidadDocente>[] = [
    {
      id: 'codigo',
      label: 'Código',
      width: '150px',
      render: (item) => (
        <Chip label={item.codigo} variant="outlined" size="small" />
      ),
    },
    {
      id: 'nombre',
      label: 'Nombre',
      width: '250px',
    },
    {
      id: 'descripcion',
      label: 'Descripción',
      render: (item) => item.descripcion || '-',
    },
    {
      id: 'activo',
      label: 'Estado',
      width: '100px',
      align: 'center',
    },
    {
      id: 'orden',
      label: 'Orden',
      width: '80px',
      align: 'center',
    },
  ];

  // Definición de campos del formulario
  const formFields: CatalogoField[] = [
    {
      name: 'codigo',
      label: 'Código',
      type: 'text',
      placeholder: 'DANZA, MUSICA, TEATRO, etc.',
      helperText: 'Solo letras mayúsculas y guiones bajos',
      required: true,
      readOnly: !!selectedEspecialidad, // No permitir editar código en actualización
    },
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Danza, Música, Teatro, etc.',
      required: true,
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      placeholder: 'Descripción opcional de la especialidad',
      rows: 3,
    },
    {
      name: 'orden',
      label: 'Orden',
      type: 'number',
      placeholder: '1, 2, 3...',
      helperText: 'Orden de visualización',
    },
  ];

  // Handlers
  const handleAddClick = () => {
    setSelectedEspecialidad(null);
    setFormOpen(true);
  };

  const handleEditClick = (especialidad: EspecialidadDocente) => {
    setSelectedEspecialidad(especialidad);
    setFormOpen(true);
  };

  const handleDeleteClick = (especialidad: EspecialidadDocente) => {
    setEspecialidadToDelete(especialidad);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedEspecialidad(null);
  };

  const handleFormSubmit = async (
    data: CreateEspecialidadDocenteFormData | UpdateEspecialidadDocenteFormData
  ) => {
    try {
      setSubmitting(true);

      if (selectedEspecialidad) {
        // Actualizar especialidad existente
        await personasApi.admin.updateEspecialidad(
          selectedEspecialidad.id,
          data as UpdateEspecialidadDocenteFormData
        );
        dispatch(
          showNotification({
            message: 'Especialidad actualizada exitosamente',
            severity: 'success',
          })
        );
      } else {
        // Crear nueva especialidad
        await personasApi.admin.createEspecialidad(data as CreateEspecialidadDocenteFormData);
        dispatch(
          showNotification({
            message: 'Especialidad creada exitosamente',
            severity: 'success',
          })
        );
      }

      refetch();
      setFormOpen(false);
      setSelectedEspecialidad(null);
    } catch (error: any) {
      console.error('Error al guardar especialidad:', error);

      dispatch(
        showNotification({
          message: 'No es posible realizar la acción en este momento',
          severity: 'error',
        })
      );

      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!especialidadToDelete) return;

    try {
      setSubmitting(true);
      await personasApi.admin.deleteEspecialidad(especialidadToDelete.id);

      dispatch(
        showNotification({
          message: 'Especialidad eliminada exitosamente',
          severity: 'success',
        })
      );

      setDeleteDialogOpen(false);
      setEspecialidadToDelete(null);
      refetch();
    } catch (error: any) {
      console.error('Error al eliminar especialidad:', error);

      dispatch(
        showNotification({
          message: 'No es posible realizar la acción en este momento',
          severity: 'error',
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const especialidades = catalogos?.especialidadesDocentes || [];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Administración de Especialidades Docentes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona las especialidades disponibles para docentes (Danza, Música, Teatro, etc.)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          size="large"
        >
          Nueva Especialidad
        </Button>
      </Box>

      {/* Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Las especialidades docentes se asignan a personas con tipo DOCENTE y permiten clasificar
        a los docentes según su área de enseñanza.
      </Alert>

      {/* Tabla */}
      {catalogosLoading ? (
        <Typography>Cargando...</Typography>
      ) : (
        <CatalogoTable
          items={especialidades}
          columns={columns}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          emptyMessage="No hay especialidades docentes creadas"
        />
      )}

      {/* Formulario */}
      <CatalogoFormDialog
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        title="Especialidad Docente"
        fields={formFields}
        schema={selectedEspecialidad ? updateEspecialidadDocenteSchema : createEspecialidadDocenteSchema}
        defaultValues={
          selectedEspecialidad
            ? {
                nombre: selectedEspecialidad.nombre,
                descripcion: selectedEspecialidad.descripcion || '',
                orden: selectedEspecialidad.orden,
                activo: selectedEspecialidad.activo,
              }
            : {
                codigo: '',
                nombre: '',
                descripcion: '',
              }
        }
        isEdit={!!selectedEspecialidad}
        loading={submitting}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !submitting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar la especialidad{' '}
            <strong>{especialidadToDelete?.nombre}</strong>?
            <br />
            <br />
            Esta acción no se puede deshacer y puede afectar a los docentes que tienen
            esta especialidad asignada.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EspecialidadesDocenteAdminPage;
