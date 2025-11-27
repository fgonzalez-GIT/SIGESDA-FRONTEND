import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchAulasActivas } from '@/store/slices/aulasSlice';
import personasApi from '@/services/personasApi';
import actividadesApi from '@/services/actividadesApi';
import reservasApi from '@/services/reservasApi';
import type {
  CreateReservaDto,
  UpdateReservaDto,
  Reserva,
  ConflictosAllResponse,
} from '@/types/reserva.types';
import type { Aula } from '@/types/aula.types';
import type { Persona } from '@/types/persona.types';
import type { Actividad } from '@/types/actividad.types';
import { createReservaSchema } from '@/schemas/reserva.schema';
import { combineDateAndTime, toDateInputFormat, toTimeInputFormat } from '@/utils/dateHelpers';
import ConflictosAlert from './ConflictosAlert';

interface ReservaFormProps {
  reserva?: Reserva | null;
  onSubmit: (data: CreateReservaDto | UpdateReservaDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Formulario para crear/editar reservas de aulas
 *
 * Features:
 * - Validación con Zod
 * - Detección automática de conflictos
 * - Autocomplete para aulas, docentes y actividades
 * - Validación de fechas/horarios
 */
const ReservaForm: React.FC<ReservaFormProps> = ({
  reserva,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const dispatch = useAppDispatch();
  const { aulas } = useAppSelector((state) => state.aulas);

  const [docentes, setDocentes] = useState<Persona[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [conflictos, setConflictos] = useState<ConflictosAllResponse | null>(null);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  const isEditMode = Boolean(reserva);

  // Valores iniciales del formulario
  const getDefaultValues = () => {
    if (reserva) {
      const fechaInicio = new Date(reserva.fechaInicio);
      const fechaFin = new Date(reserva.fechaFin);

      return {
        aulaId: reserva.aulaId,
        docenteId: reserva.docenteId,
        actividadId: reserva.actividadId || 0,
        fechaDate: toDateInputFormat(fechaInicio),
        horaInicio: toTimeInputFormat(fechaInicio),
        horaFin: toTimeInputFormat(fechaFin),
        observaciones: reserva.observaciones || '',
      };
    }

    // Valores por defecto para nueva reserva
    const now = new Date();
    now.setMinutes(0, 0, 0); // Redondear a la hora exacta
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 horas

    return {
      aulaId: 0,
      docenteId: 0,
      actividadId: 0,
      fechaDate: toDateInputFormat(now),
      horaInicio: toTimeInputFormat(now),
      horaFin: toTimeInputFormat(endTime),
      observaciones: '',
    };
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(createReservaSchema),
    defaultValues: getDefaultValues(),
  });

  // Watch para detectar conflictos automáticamente
  const aulaId = watch('aulaId');
  const fechaDate = watch('fechaDate');
  const horaInicio = watch('horaInicio');
  const horaFin = watch('horaFin');

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);

        // Cargar aulas activas
        await dispatch(fetchAulasActivas()).unwrap();

        // Cargar docentes activos
        const docentesData = await personasApi.getDocentes({ activo: true });
        setDocentes(docentesData);

        // Cargar actividades activas
        const actividadesData = await actividadesApi.getAll({ activo: true });
        setActividades(actividadesData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [dispatch]);

  // Detectar conflictos cuando cambian aula, fecha u horario
  useEffect(() => {
    const checkConflicts = async () => {
      // Validar que tenemos todos los datos necesarios
      if (!aulaId || aulaId === 0 || !fechaDate || !horaInicio || !horaFin) {
        setConflictos(null);
        return;
      }

      try {
        setCheckingConflicts(true);

        const fechaInicio = combineDateAndTime(fechaDate, horaInicio);
        const fechaFin = combineDateAndTime(fechaDate, horaFin);

        const result = await reservasApi.checkConflictos({
          aulaId,
          fechaInicio,
          fechaFin,
          excludeReservaId: reserva?.id,
        });

        setConflictos(result);
      } catch (error) {
        console.error('Error al verificar conflictos:', error);
        setConflictos(null);
      } finally {
        setCheckingConflicts(false);
      }
    };

    // Debounce de 500ms para evitar múltiples llamadas
    const timeoutId = setTimeout(checkConflicts, 500);
    return () => clearTimeout(timeoutId);
  }, [aulaId, fechaDate, horaInicio, horaFin, reserva?.id]);

  // Manejar submit
  const handleFormSubmit = async (data: any) => {
    // Convertir a formato esperado por el backend
    const fechaInicio = combineDateAndTime(data.fechaDate, data.horaInicio);
    const fechaFin = combineDateAndTime(data.fechaDate, data.horaFin);

    const payload: CreateReservaDto = {
      aulaId: data.aulaId,
      docenteId: data.docenteId,
      actividadId: data.actividadId === 0 ? null : data.actividadId,
      fechaInicio,
      fechaFin,
      observaciones: data.observaciones || undefined,
    };

    await onSubmit(payload);
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      {/* Alert de conflictos */}
      {conflictos?.hasConflicts && (
        <ConflictosAlert conflictos={conflictos} onClose={() => setConflictos(null)} />
      )}

      {checkingConflicts && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Verificando conflictos de horario...
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Aula */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="aulaId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={aulas}
                getOptionLabel={(option) => option.nombre}
                value={aulas.find((a) => a.id === field.value) || null}
                onChange={(_, newValue) => field.onChange(newValue?.id || 0)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Aula *"
                    error={Boolean(errors.aulaId)}
                    helperText={errors.aulaId?.message as string}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            )}
          />
        </Grid>

        {/* Docente */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="docenteId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={docentes}
                getOptionLabel={(option) =>
                  `${option.nombre} ${option.apellido}${
                    option.personaTipos?.find((pt) => pt.tipoPersona?.codigo === 'DOCENTE')
                      ?.especialidadDocente?.nombre
                      ? ` - ${
                          option.personaTipos.find((pt) => pt.tipoPersona?.codigo === 'DOCENTE')
                            ?.especialidadDocente?.nombre
                        }`
                      : ''
                  }`
                }
                value={docentes.find((d) => d.id === field.value) || null}
                onChange={(_, newValue) => field.onChange(newValue?.id || 0)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Docente *"
                    error={Boolean(errors.docenteId)}
                    helperText={errors.docenteId?.message as string}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            )}
          />
        </Grid>

        {/* Actividad (opcional) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="actividadId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={actividades}
                getOptionLabel={(option) => option.nombre}
                value={actividades.find((a) => a.id === field.value) || null}
                onChange={(_, newValue) => field.onChange(newValue?.id || 0)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Actividad (opcional)"
                    error={Boolean(errors.actividadId)}
                    helperText={errors.actividadId?.message as string}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            )}
          />
        </Grid>

        {/* Fecha */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="fechaDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                label="Fecha"
                fullWidth
                error={Boolean(errors.fechaDate)}
                helperText={errors.fechaDate?.message as string}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>

        {/* Hora inicio */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="horaInicio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="time"
                label="Hora Inicio"
                fullWidth
                error={Boolean(errors.horaInicio)}
                helperText={errors.horaInicio?.message as string}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>

        {/* Hora fin */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="horaFin"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="time"
                label="Hora Fin"
                fullWidth
                error={Boolean(errors.horaFin)}
                helperText={errors.horaFin?.message as string}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>

        {/* Observaciones */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="observaciones"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Observaciones"
                multiline
                rows={3}
                fullWidth
                error={Boolean(errors.observaciones)}
                helperText={errors.observaciones?.message as string || 'Máximo 500 caracteres'}
                inputProps={{ maxLength: 500 }}
              />
            )}
          />
        </Grid>

        {/* Botones */}
        <Grid size={{ xs: 12 }}>
          <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading || conflictos?.hasConflicts || checkingConflicts}
            >
              {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear Reserva'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReservaForm;
