import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import seccionesApi from '../../services/seccionesApi';
import { Seccion, SeccionFilters } from '../../types/seccion.types';

interface SeccionesState {
  secciones: Seccion[];
  seccionActual: Seccion | null;
  loading: boolean;
  error: string | null;
  filters: SeccionFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: SeccionesState = {
  secciones: [],
  seccionActual: null,
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Cargar todas las secciones con filtros y paginación
 */
export const fetchSecciones = createAsyncThunk(
  'secciones/fetchSecciones',
  async (filters: SeccionFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await seccionesApi.getAll(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar secciones');
    }
  }
);

/**
 * Cargar una sección por ID
 */
export const fetchSeccion = createAsyncThunk(
  'secciones/fetchSeccion',
  async ({ id, detallada }: { id: string; detallada?: boolean }, { rejectWithValue }) => {
    try {
      const response = await seccionesApi.getById(id, detallada);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar sección');
    }
  }
);

/**
 * Crear nueva sección
 */
export const createSeccion = createAsyncThunk(
  'secciones/createSeccion',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await seccionesApi.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al crear sección');
    }
  }
);

/**
 * Actualizar sección existente
 */
export const updateSeccion = createAsyncThunk(
  'secciones/updateSeccion',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await seccionesApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al actualizar sección');
    }
  }
);

/**
 * Eliminar sección
 */
export const deleteSeccion = createAsyncThunk(
  'secciones/deleteSeccion',
  async (id: string, { rejectWithValue }) => {
    try {
      await seccionesApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al eliminar sección');
    }
  }
);

/**
 * Agregar horario a sección
 */
export const addHorario = createAsyncThunk(
  'secciones/addHorario',
  async ({ seccionId, data }: { seccionId: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await seccionesApi.addHorario(seccionId, data);
      return { seccionId, horario: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al agregar horario');
    }
  }
);

/**
 * Asignar docente a sección
 */
export const asignarDocente = createAsyncThunk(
  'secciones/asignarDocente',
  async ({ seccionId, docenteId }: { seccionId: string; docenteId: string }, { rejectWithValue }) => {
    try {
      const response = await seccionesApi.asignarDocente(seccionId, { docenteId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al asignar docente');
    }
  }
);

/**
 * Inscribir participante en sección
 */
export const inscribirParticipante = createAsyncThunk(
  'secciones/inscribirParticipante',
  async ({ seccionId, data }: { seccionId: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await seccionesApi.inscribirParticipante(seccionId, data);
      return { seccionId, participacion: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al inscribir participante');
    }
  }
);

// ============================================
// SLICE
// ============================================

const seccionesSlice = createSlice({
  name: 'secciones',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<SeccionFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { page: 1, limit: 10 };
    },
    setSeccionActual: (state, action: PayloadAction<Seccion | null>) => {
      state.seccionActual = action.payload;
    },
    clearSeccionActual: (state) => {
      state.seccionActual = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // ============ Fetch secciones ============
      .addCase(fetchSecciones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSecciones.fulfilled, (state, action) => {
        state.loading = false;
        state.secciones = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchSecciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============ Fetch sección ============
      .addCase(fetchSeccion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSeccion.fulfilled, (state, action) => {
        state.loading = false;
        state.seccionActual = action.payload as Seccion;
      })
      .addCase(fetchSeccion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============ Create sección ============
      .addCase(createSeccion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSeccion.fulfilled, (state, action) => {
        state.loading = false;
        state.secciones.unshift(action.payload);
      })
      .addCase(createSeccion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============ Update sección ============
      .addCase(updateSeccion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSeccion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.secciones.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.secciones[index] = action.payload;
        }
        if (state.seccionActual?.id === action.payload.id) {
          state.seccionActual = action.payload;
        }
      })
      .addCase(updateSeccion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============ Delete sección ============
      .addCase(deleteSeccion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSeccion.fulfilled, (state, action) => {
        state.loading = false;
        state.secciones = state.secciones.filter(s => s.id !== action.payload);
        if (state.seccionActual?.id === action.payload) {
          state.seccionActual = null;
        }
      })
      .addCase(deleteSeccion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============ Add horario ============
      .addCase(addHorario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addHorario.fulfilled, (state, action) => {
        state.loading = false;
        // Actualizar horarios de la sección si está cargada
        if (state.seccionActual?.id === action.payload.seccionId) {
          state.seccionActual.horarios.push(action.payload.horario);
        }
      })
      .addCase(addHorario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============ Asignar docente ============
      .addCase(asignarDocente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(asignarDocente.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.secciones.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.secciones[index] = action.payload;
        }
        if (state.seccionActual?.id === action.payload.id) {
          state.seccionActual = action.payload;
        }
      })
      .addCase(asignarDocente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ============ Inscribir participante ============
      .addCase(inscribirParticipante.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inscribirParticipante.fulfilled, (state, action) => {
        state.loading = false;
        // Incrementar contador de participaciones
        const index = state.secciones.findIndex(s => s.id === action.payload.seccionId);
        if (index !== -1) {
          state.secciones[index]._count.participaciones += 1;
        }
      })
      .addCase(inscribirParticipante.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  setFilters,
  clearFilters,
  setSeccionActual,
  clearSeccionActual,
  clearError
} = seccionesSlice.actions;

export default seccionesSlice.reducer;
