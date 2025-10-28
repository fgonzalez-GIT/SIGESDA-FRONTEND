import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import personasV2Api from '../../services/personasV2Api';
import type {
  PersonaV2,
  PersonasV2QueryParams,
  CatalogosPersonas,
  CreatePersonaV2DTO,
  UpdatePersonaV2DTO,
} from '../../types/personaV2.types';

/**
 * Estado del slice de Personas V2
 */
interface PersonasV2State {
  // Lista de personas
  personas: PersonaV2[];
  loading: boolean;
  error: string | null;

  // Paginación
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  // Filtros actuales
  filters: PersonasV2QueryParams;

  // Persona seleccionada (para detalle/edición)
  selectedPersona: PersonaV2 | null;
  selectedPersonaLoading: boolean;

  // Catálogos
  catalogos: CatalogosPersonas | null;
  catalogosLoading: boolean;
  catalogosError: string | null;
}

const initialState: PersonasV2State = {
  personas: [],
  loading: false,
  error: null,

  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },

  filters: {
    page: 1,
    limit: 20,
    includeTipos: true,
    includeContactos: false,
    includeRelaciones: true,
  },

  selectedPersona: null,
  selectedPersonaLoading: false,

  catalogos: null,
  catalogosLoading: false,
  catalogosError: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Cargar catálogos de Personas V2
 */
export const fetchCatalogosPersonasV2 = createAsyncThunk(
  'personasV2/fetchCatalogos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await personasV2Api.getCatalogos();
      return response.data;
    } catch (error: any) {
      // Si el endpoint no existe, retornar catálogos vacíos
      console.warn('⚠️ Endpoint de catálogos no disponible, usando valores por defecto');
      return {
        tiposPersona: [],
        categoriasSocio: [],
        especialidadesDocentes: [],
        tiposContacto: [],
      };
    }
  }
);

/**
 * Cargar lista de personas con filtros
 */
export const fetchPersonasV2 = createAsyncThunk(
  'personasV2/fetchPersonas',
  async (params: PersonasV2QueryParams | undefined, { rejectWithValue }) => {
    try {
      const response = await personasV2Api.getAll(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al cargar personas'
      );
    }
  }
);

/**
 * Cargar una persona por ID
 */
export const fetchPersonaV2ById = createAsyncThunk(
  'personasV2/fetchPersonaById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await personasV2Api.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al cargar persona'
      );
    }
  }
);

/**
 * Crear nueva persona
 */
export const createPersonaV2 = createAsyncThunk(
  'personasV2/createPersona',
  async (data: CreatePersonaV2DTO, { rejectWithValue }) => {
    try {
      const response = await personasV2Api.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al crear persona'
      );
    }
  }
);

/**
 * Actualizar persona existente
 */
export const updatePersonaV2 = createAsyncThunk(
  'personasV2/updatePersona',
  async ({ id, data }: { id: number; data: UpdatePersonaV2DTO }, { rejectWithValue }) => {
    try {
      const response = await personasV2Api.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al actualizar persona'
      );
    }
  }
);

/**
 * Eliminar persona
 */
export const deletePersonaV2 = createAsyncThunk(
  'personasV2/deletePersona',
  async (id: number, { rejectWithValue }) => {
    try {
      await personasV2Api.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Error al eliminar persona'
      );
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const personasV2Slice = createSlice({
  name: 'personasV2',
  initialState,
  reducers: {
    // Actualizar filtros
    setFilters: (state, action: PayloadAction<PersonasV2QueryParams>) => {
      state.filters = action.payload;
    },

    // Resetear filtros
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Seleccionar persona
    setSelectedPersona: (state, action: PayloadAction<PersonaV2 | null>) => {
      state.selectedPersona = action.payload;
    },

    // Limpiar errores
    clearError: (state) => {
      state.error = null;
    },

    // Limpiar estado
    clearState: (state) => {
      state.personas = [];
      state.selectedPersona = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Catálogos
    builder.addCase(fetchCatalogosPersonasV2.pending, (state) => {
      state.catalogosLoading = true;
      state.catalogosError = null;
    });
    builder.addCase(fetchCatalogosPersonasV2.fulfilled, (state, action) => {
      state.catalogosLoading = false;
      state.catalogos = action.payload;
    });
    builder.addCase(fetchCatalogosPersonasV2.rejected, (state, action) => {
      state.catalogosLoading = false;
      state.catalogosError = action.payload as string;
    });

    // Fetch Personas
    builder.addCase(fetchPersonasV2.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPersonasV2.fulfilled, (state, action) => {
      state.loading = false;
      state.personas = action.payload.data;
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    });
    builder.addCase(fetchPersonasV2.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Persona By ID
    builder.addCase(fetchPersonaV2ById.pending, (state) => {
      state.selectedPersonaLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPersonaV2ById.fulfilled, (state, action) => {
      state.selectedPersonaLoading = false;
      state.selectedPersona = action.payload;
    });
    builder.addCase(fetchPersonaV2ById.rejected, (state, action) => {
      state.selectedPersonaLoading = false;
      state.error = action.payload as string;
    });

    // Create Persona
    builder.addCase(createPersonaV2.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createPersonaV2.fulfilled, (state, action) => {
      state.loading = false;
      state.personas.unshift(action.payload);
      state.pagination.total += 1;
    });
    builder.addCase(createPersonaV2.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Persona
    builder.addCase(updatePersonaV2.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updatePersonaV2.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.personas.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.personas[index] = action.payload;
      }
      if (state.selectedPersona?.id === action.payload.id) {
        state.selectedPersona = action.payload;
      }
    });
    builder.addCase(updatePersonaV2.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Persona
    builder.addCase(deletePersonaV2.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deletePersonaV2.fulfilled, (state, action) => {
      state.loading = false;
      state.personas = state.personas.filter((p) => p.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      if (state.selectedPersona?.id === action.payload) {
        state.selectedPersona = null;
      }
    });
    builder.addCase(deletePersonaV2.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const {
  setFilters,
  resetFilters,
  setSelectedPersona,
  clearError,
  clearState,
} = personasV2Slice.actions;

export default personasV2Slice.reducer;
