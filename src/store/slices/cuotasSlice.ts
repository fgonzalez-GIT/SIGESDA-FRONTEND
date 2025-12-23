import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import cuotasService from '../../services/cuotasService';
import { Cuota, DashboardData, GenerarCuotasRequest, ItemCuota, RecalcularCuotaRequest, RecalculoResponse } from '../../types/cuota.types';

// State definition
export interface CuotasFilters {
  mes?: number;
  anio?: number;
  categoria?: string;
  page?: number;
  limit?: number;
  soloImpagas?: boolean;
  soloVencidas?: boolean;
  ordenarPor?: string;
  orden?: 'asc' | 'desc';
  personaId?: number; // Para filtrar por socio
}



interface CuotasState {
  cuotas: Cuota[];
  selectedCuota: Cuota | null;
  itemsCuota: ItemCuota[];
  desgloseCuota: any | null;
  dashboardData: DashboardData | null;
  filters: CuotasFilters;
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
  loading: boolean;
  error: string | null;
  operationLoading: boolean; // For create/update/delete operations
}

const initialState: CuotasState = {
  cuotas: [],
  selectedCuota: null,
  itemsCuota: [],
  desgloseCuota: null,
  dashboardData: null,
  filters: {
    page: 1,
    limit: 20,
    soloImpagas: false
  },
  pagination: {
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 20
  },
  loading: false,
  error: null,
  operationLoading: false
};

// Async Thunks

export const fetchCuotas = createAsyncThunk(
  'cuotas/fetchCuotas',
  async (filters: CuotasFilters, { rejectWithValue }) => {
    try {
      const response = await cuotasService.getCuotas(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar cuotas');
    }
  }
);

export const fetchCuotaById = createAsyncThunk(
  'cuotas/fetchCuotaById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await cuotasService.getCuotaById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar la cuota');
    }
  }
);

export const fetchItemsCuota = createAsyncThunk(
  'cuotas/fetchItems',
  async (cuotaId: number, { rejectWithValue }) => {
    try {
      return await cuotasService.getItemsCuota(cuotaId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar items');
    }
  }
);

export const fetchDesgloseCuota = createAsyncThunk(
  'cuotas/fetchDesglose',
  async (cuotaId: number, { rejectWithValue }) => {
    try {
      return await cuotasService.getDesgloseItems(cuotaId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar desglose');
    }
  }
);

export const generarCuotasMasivas = createAsyncThunk(
  'cuotas/generarMasivas',
  async (request: GenerarCuotasRequest, { rejectWithValue }) => {
    try {
      return await cuotasService.generarCuotasV2(request);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al generar cuotas');
    }
  }
);

export const recalcularCuota = createAsyncThunk(
  'cuotas/recalcular',
  async ({ id, options }: { id: number; options: RecalcularCuotaRequest }, { rejectWithValue }) => {
    try {
      return await cuotasService.recalcularCuota(id, options);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al recalcular cuota');
    }
  }
);

export const fetchDashboard = createAsyncThunk(
  'cuotas/fetchDashboard',
  async ({ mes, anio }: { mes: number; anio: number }, { rejectWithValue }) => {
    try {
      return await cuotasService.getDashboard(mes, anio);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar dashboard');
    }
  }
);

export const deleteCuota = createAsyncThunk(
  'cuotas/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await cuotasService.deleteCuota(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al eliminar cuota');
    }
  }
);

// Slice
const cuotasSlice = createSlice({
  name: 'cuotas',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<CuotasFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset page when filters change (except paging itself)
      if (action.payload.page === undefined) {
        state.filters.page = 1;
      }
    },
    clearFilters: (state) => {
      state.filters = { page: 1, limit: 20 };
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCuota: (state, action: PayloadAction<Cuota | null>) => {
      state.selectedCuota = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cuotas
      .addCase(fetchCuotas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCuotas.fulfilled, (state, action) => {
        state.loading = false;
        state.cuotas = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          pages: action.payload.pages,
          currentPage: action.payload.currentPage,
          limit: state.filters.limit || 20
        };
      })
      .addCase(fetchCuotas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Cuota By ID
      .addCase(fetchCuotaById.fulfilled, (state, action) => {
        state.selectedCuota = action.payload;
      })
      .addCase(fetchItemsCuota.fulfilled, (state, action) => {
        state.itemsCuota = action.payload;
      })
      .addCase(fetchDesgloseCuota.fulfilled, (state, action) => {
        state.desgloseCuota = action.payload;
      })

      // Generar Masivas
      .addCase(generarCuotasMasivas.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(generarCuotasMasivas.fulfilled, (state, action) => {
        state.operationLoading = false;
        // Optionally refresh list or add new ones if feasible
      })
      .addCase(generarCuotasMasivas.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })

      // Recalcular
      .addCase(recalcularCuota.fulfilled, (state, action) => {
        // Update the cuota in the list
        const index = state.cuotas.findIndex(c => c.id === action.payload.cuotaRecalculada.id);
        if (index !== -1) {
          state.cuotas[index] = action.payload.cuotaRecalculada;
        }
        if (state.selectedCuota?.id === action.payload.cuotaRecalculada.id) {
          state.selectedCuota = action.payload.cuotaRecalculada;
        }
      })

      // Dashboard
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboardData = action.payload;
      })

      // Delete
      .addCase(deleteCuota.fulfilled, (state, action) => {
        state.cuotas = state.cuotas.filter(c => c.id !== action.payload);
      });
  },
});

export const { setFilters, clearFilters, clearError, setSelectedCuota } = cuotasSlice.actions;
export default cuotasSlice.reducer;