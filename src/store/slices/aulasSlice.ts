import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Aula {
  id: number;
  nombre: string;
  descripcion?: string;
  capacidad: number;
  ubicacion?: string;
  equipamiento?: string[];
  tipo: 'salon' | 'ensayo' | 'auditorio' | 'exterior';
  estado: 'disponible' | 'ocupado' | 'mantenimiento' | 'fuera_servicio';
  observaciones?: string;
  fechaCreacion: string;
}

export interface ReservaAula {
  id: number;
  aulaId: number;
  actividadId?: number;
  actividadNombre?: string;
  personaId?: number;
  personaNombre?: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  motivo: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'finalizada';
  observaciones?: string;
  fechaCreacion: string;
}

export interface DisponibilidadAula {
  aulaId: number;
  aulaNombre: string;
  fecha: string;
  horariosDisponibles: {
    horaInicio: string;
    horaFin: string;
  }[];
  horariosOcupados: {
    horaInicio: string;
    horaFin: string;
    motivo: string;
    tipo: 'actividad' | 'reserva' | 'mantenimiento';
  }[];
}

interface AulasState {
  aulas: Aula[];
  reservas: ReservaAula[];
  disponibilidad: DisponibilidadAula[];
  loading: boolean;
  error: string | null;
  selectedAula: Aula | null;
  selectedReserva: ReservaAula | null;
  filters: {
    tipo?: string;
    estado?: string;
    capacidadMin?: number;
    equipamiento?: string[];
  };
}

const initialState: AulasState = {
  aulas: [],
  reservas: [],
  disponibilidad: [],
  loading: false,
  error: null,
  selectedAula: null,
  selectedReserva: null,
  filters: {},
};

// Async thunks for Aulas
export const fetchAulas = createAsyncThunk(
  'aulas/fetchAulas',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/aulas?' + new URLSearchParams(params || {}));
      if (!response.ok) {
        throw new Error('Error al cargar aulas');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const createAula = createAsyncThunk(
  'aulas/createAula',
  async (aula: Omit<Aula, 'id' | 'fechaCreacion'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/aulas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aula),
      });
      if (!response.ok) {
        throw new Error('Error al crear aula');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const updateAula = createAsyncThunk(
  'aulas/updateAula',
  async (aula: Aula, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/aulas/${aula.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aula),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar aula');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const deleteAula = createAsyncThunk(
  'aulas/deleteAula',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/aulas/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar aula');
      }
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

// Async thunks for Reservas
export const fetchReservas = createAsyncThunk(
  'aulas/fetchReservas',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/aulas/reservas?' + new URLSearchParams(params || {}));
      if (!response.ok) {
        throw new Error('Error al cargar reservas');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const createReserva = createAsyncThunk(
  'aulas/createReserva',
  async (reserva: Omit<ReservaAula, 'id' | 'fechaCreacion'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/aulas/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reserva),
      });
      if (!response.ok) {
        throw new Error('Error al crear reserva');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const updateReserva = createAsyncThunk(
  'aulas/updateReserva',
  async (reserva: ReservaAula, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/aulas/reservas/${reserva.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reserva),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar reserva');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const deleteReserva = createAsyncThunk(
  'aulas/deleteReserva',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/aulas/reservas/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar reserva');
      }
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

// Async thunk for Disponibilidad
export const checkDisponibilidad = createAsyncThunk(
  'aulas/checkDisponibilidad',
  async (params: {
    aulaId?: number;
    fecha: string;
    horaInicio?: string;
    horaFin?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/aulas/disponibilidad?' + new URLSearchParams(params as any));
      if (!response.ok) {
        throw new Error('Error al consultar disponibilidad');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

const aulasSlice = createSlice({
  name: 'aulas',
  initialState,
  reducers: {
    setSelectedAula: (state, action: PayloadAction<Aula | null>) => {
      state.selectedAula = action.payload;
    },
    setSelectedReserva: (state, action: PayloadAction<ReservaAula | null>) => {
      state.selectedReserva = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<AulasState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch aulas
      .addCase(fetchAulas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAulas.fulfilled, (state, action) => {
        state.loading = false;
        state.aulas = action.payload;
      })
      .addCase(fetchAulas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create aula
      .addCase(createAula.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAula.fulfilled, (state, action) => {
        state.loading = false;
        state.aulas.push(action.payload);
      })
      .addCase(createAula.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update aula
      .addCase(updateAula.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAula.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.aulas.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.aulas[index] = action.payload;
        }
      })
      .addCase(updateAula.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete aula
      .addCase(deleteAula.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAula.fulfilled, (state, action) => {
        state.loading = false;
        state.aulas = state.aulas.filter(a => a.id !== action.payload);
      })
      .addCase(deleteAula.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch reservas
      .addCase(fetchReservas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservas.fulfilled, (state, action) => {
        state.loading = false;
        state.reservas = action.payload;
      })
      .addCase(fetchReservas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create reserva
      .addCase(createReserva.fulfilled, (state, action) => {
        state.reservas.push(action.payload);
      })
      // Update reserva
      .addCase(updateReserva.fulfilled, (state, action) => {
        const index = state.reservas.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reservas[index] = action.payload;
        }
      })
      // Delete reserva
      .addCase(deleteReserva.fulfilled, (state, action) => {
        state.reservas = state.reservas.filter(r => r.id !== action.payload);
      })
      // Check disponibilidad
      .addCase(checkDisponibilidad.fulfilled, (state, action) => {
        state.disponibilidad = action.payload;
      });
  },
});

export const {
  setSelectedAula,
  setSelectedReserva,
  clearError,
  setFilters,
  clearFilters
} = aulasSlice.actions;

export default aulasSlice.reducer;