import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CategoriaSocio } from '../../types/categoria.types';

export interface Persona {
  id: string | number;
  nombre: string;
  apellido: string;
  dni?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string | null;
  tipo: 'SOCIO' | 'DOCENTE' | 'ESTUDIANTE' | 'socio' | 'docente' | 'estudiante';
  estado?: 'activo' | 'inactivo';
  fechaIngreso?: string | null;
  numeroSocio?: number | null;
  categoriaId?: string | null; // FK a CategoriaSocio
  categoria?: CategoriaSocio | null; // Relación populada (cuando se incluye en la query)
  fechaBaja?: string | null;
  motivoBaja?: string | null;
  especialidad?: string | null;
  honorariosPorHora?: string | null;
  cuit?: string | null;
  razonSocial?: string | null;
  observaciones?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PersonasState {
  personas: Persona[];
  loading: boolean;
  error: string | null;
  selectedPersona: Persona | null;
}

const initialState: PersonasState = {
  personas: [],
  loading: false,
  error: null,
  selectedPersona: null,
};

export const fetchPersonas = createAsyncThunk(
  'personas/fetchPersonas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/personas`);
      if (!response.ok) {
        throw new Error('Error al cargar personas');
      }
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const checkDniExists = createAsyncThunk(
  'personas/checkDniExists',
  async (dni: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/personas/check-dni/${dni}`);
      if (!response.ok) {
        throw new Error('Error al verificar DNI');
      }
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const createPersona = createAsyncThunk(
  'personas/createPersona',
  async (persona: Omit<Persona, 'id'>, { rejectWithValue }) => {
    try {
      // Limpiar campos undefined/null antes de enviar
      const cleanPersona = Object.fromEntries(
        Object.entries(persona).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );

      const response = await fetch(`${import.meta.env.VITE_API_URL}/personas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanPersona),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Detectar error 409 específicamente
        if (response.status === 409) {
          throw new Error('DNI_DUPLICADO');
        }

        const errorMessage = errorData.error || errorData.message || 'Error al crear persona';
        console.error('Error creating persona:', errorData);
        throw new Error(errorMessage);
      }
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const updatePersona = createAsyncThunk(
  'personas/updatePersona',
  async (persona: Persona, { rejectWithValue }) => {
    try {
      // Convertir campos vacíos a null explícitamente para permitir borrado
      // Solo eliminamos undefined (campos no incluidos)
      const cleanPersona = Object.fromEntries(
        Object.entries(persona)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, value === '' ? null : value])
      );

      const response = await fetch(`${import.meta.env.VITE_API_URL}/personas/${persona.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanPersona),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar persona');
      }
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const deletePersona = createAsyncThunk(
  'personas/deletePersona',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/personas/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar persona');
      }
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const reactivatePersona = createAsyncThunk(
  'personas/reactivatePersona',
  async ({ id, data }: { id: number | string; data: Partial<Persona> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/personas/${id}/reactivate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, estado: 'activo' }),
      });
      if (!response.ok) {
        throw new Error('Error al reactivar persona');
      }
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

const personasSlice = createSlice({
  name: 'personas',
  initialState,
  reducers: {
    setSelectedPersona: (state, action: PayloadAction<Persona | null>) => {
      state.selectedPersona = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch personas
      .addCase(fetchPersonas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersonas.fulfilled, (state, action) => {
        state.loading = false;
        state.personas = action.payload;
      })
      .addCase(fetchPersonas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create persona
      .addCase(createPersona.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPersona.fulfilled, (state, action) => {
        state.loading = false;
        state.personas.push(action.payload);
      })
      .addCase(createPersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update persona
      .addCase(updatePersona.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePersona.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.personas.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.personas[index] = action.payload;
        }
      })
      .addCase(updatePersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete persona
      .addCase(deletePersona.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePersona.fulfilled, (state, action) => {
        state.loading = false;
        state.personas = state.personas.filter(p => p.id !== action.payload);
      })
      .addCase(deletePersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reactivate persona
      .addCase(reactivatePersona.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reactivatePersona.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.personas.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.personas[index] = action.payload;
        } else {
          state.personas.push(action.payload);
        }
      })
      .addCase(reactivatePersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedPersona, clearError } = personasSlice.actions;
export default personasSlice.reducer;