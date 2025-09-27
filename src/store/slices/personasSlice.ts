import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  tipo: 'socio' | 'docente' | 'estudiante';
  estado: 'activo' | 'inactivo';
  fechaIngreso: string;
  observaciones?: string;
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
      const response = await fetch('/api/personas');
      if (!response.ok) {
        throw new Error('Error al cargar personas');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const createPersona = createAsyncThunk(
  'personas/createPersona',
  async (persona: Omit<Persona, 'id'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(persona),
      });
      if (!response.ok) {
        throw new Error('Error al crear persona');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const updatePersona = createAsyncThunk(
  'personas/updatePersona',
  async (persona: Persona, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/personas/${persona.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(persona),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar persona');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const deletePersona = createAsyncThunk(
  'personas/deletePersona',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/personas/${id}`, {
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
      });
  },
});

export const { setSelectedPersona, clearError } = personasSlice.actions;
export default personasSlice.reducer;