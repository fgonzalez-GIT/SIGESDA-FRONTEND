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
  createTipoContactoSchema,
  updateTipoContactoSchema,
  type CreateTipoContactoFormData,
  type UpdateTipoContactoFormData,
} from '../../../schemas/persona.schema';
import type { TipoContacto } from '../../../types/persona.types';
import { useAppDispatch } from '../../../hooks/redux';
import { showNotification } from '../../../store/slices/uiSlice';

/**
 * Página de administración de Tipos de Contacto
 * Permite crear, editar, activar/desactivar y reordenar tipos de contacto
 */
const TiposContactoAdminPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { catalogos, loading: catalogosLoading, refetch } = useCatalogosPersonas();

  // Estados de UI
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoContacto | null>(null);
  const [tipoToDelete, setTipoToDelete] = useState<TipoContacto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Definición de columnas de la tabla
  const columns: CatalogoColumn<TipoContacto>[] = [
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
      width: '200px',
    },
    {
      id: 'descripcion',
      label: 'Descripción',
      render: (item) => item.descripcion || '-',
    },
    {
      id: 'icono',
      label: 'Icono',
      width: '120px',
      render: (item) => item.icono || '-',
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
      placeholder: 'WHATSAPP, INSTAGRAM, EMAIL, etc.',
      helperText: 'Solo letras mayúsculas y guiones bajos',
      required: true,
      readOnly: !!selectedTipo, // No permitir editar código en actualización
    },
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      placeholder: 'WhatsApp, Instagram, Email, etc.',
      required: true,
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      placeholder: 'Descripción opcional del tipo de contacto',
      rows: 2,
    },
    {
      name: 'icono',
      label: 'Icono MUI',
      type: 'text',
      placeholder: 'WhatsApp, Instagram, Email, Phone, etc.',
      helperText: 'Nombre del icono de Material-UI (opcional)',
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
    setSelectedTipo(null);
    setFormOpen(true);
  };

  const handleEditClick = (tipo: TipoContacto) => {
    setSelectedTipo(tipo);
    setFormOpen(true);
  };

  const handleDeleteClick = (tipo: TipoContacto) => {
    setTipoToDelete(tipo);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedTipo(null);
  };

  const handleFormSubmit = async (
    data: CreateTipoContactoFormData | UpdateTipoContactoFormData
  ) => {
    try {
      setSubmitting(true);

      if (selectedTipo) {
        // Actualizar tipo existente
        await personasApi.updateTipoContacto(
          selectedTipo.id,
          data as UpdateTipoContactoFormData
        );
        dispatch(
          showNotification({
            message: 'Tipo de contacto actualizado exitosamente',
            severity: 'success',
          })
        );
      } else {
        // Crear nuevo tipo
        await personasApi.createTipoContacto(data as CreateTipoContactoFormData);
        dispatch(
          showNotification({
            message: 'Tipo de contacto creado exitosamente',
            severity: 'success',
          })
        );
      }

      refetch();
      setFormOpen(false);
      setSelectedTipo(null);
    } catch (error: any) {
      console.error('Error al guardar tipo de contacto:', error);

      let errorMessage = 'Error al guardar el tipo de contacto';
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

      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!tipoToDelete) return;

    try {
      setSubmitting(true);
      await personasApi.deleteTipoContacto(tipoToDelete.id);

      dispatch(
        showNotification({
          message: 'Tipo de contacto eliminado exitosamente',
          severity: 'success',
        })
      );

      setDeleteDialogOpen(false);
      setTipoToDelete(null);
      refetch();
    } catch (error: any) {
      console.error('Error al eliminar tipo de contacto:', error);

      let errorMessage = 'Error al eliminar el tipo de contacto';
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
      setSubmitting(false);
    }
  };

  const tiposContacto = catalogos?.tiposContacto || [];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Administración de Tipos de Contacto
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona los tipos de contacto disponibles (WhatsApp, Email, Instagram, etc.)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          size="large"
        >
          Nuevo Tipo
        </Button>
      </Box>

      {/* Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Los tipos de contacto permiten clasificar y organizar los diferentes medios de comunicación
        de las personas. Puedes asignar iconos de Material-UI para una mejor visualización.
      </Alert>

      {/* Tabla */}
      {catalogosLoading ? (
        <Typography>Cargando...</Typography>
      ) : (
        <CatalogoTable
          items={tiposContacto}
          columns={columns}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          emptyMessage="No hay tipos de contacto creados"
        />
      )}

      {/* Formulario */}
      <CatalogoFormDialog
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        title="Tipo de Contacto"
        fields={formFields}
        schema={selectedTipo ? updateTipoContactoSchema : createTipoContactoSchema}
        defaultValues={
          selectedTipo
            ? {
                nombre: selectedTipo.nombre,
                descripcion: selectedTipo.descripcion || '',
                icono: selectedTipo.icono || '',
                orden: selectedTipo.orden,
                activo: selectedTipo.activo,
              }
            : {
                codigo: '',
                nombre: '',
                descripcion: '',
                icono: '',
              }
        }
        isEdit={!!selectedTipo}
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
            ¿Está seguro que desea eliminar el tipo de contacto{' '}
            <strong>{tipoToDelete?.nombre}</strong>?
            <br />
            <br />
            Esta acción no se puede deshacer y puede afectar a los contactos existentes
            de este tipo.
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

export default TiposContactoAdminPage;
