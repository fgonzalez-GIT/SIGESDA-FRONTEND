import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CategoriaSocio } from '../../types/categoria.types';

export interface Cuota {
  id: number;
  personaId: number;
  personaNombre: string;
  personaApellido: string;
  personaTipo: 'socio' | 'docente' | 'estudiante';
  categoriaId: string; // FK a CategoriaSocio (requerido por backend)
  categoria?: CategoriaSocio; // Relación populada (cuando se incluye en la query)
  monto: number;
  concepto: string;
  mesVencimiento: string; // YYYY-MM
  fechaVencimiento: string; // YYYY-MM-DD
  fechaCreacion: string;
  fechaPago?: string;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'cancelada';
  metodoPago?: 'efectivo' | 'transferencia' | 'tarjeta_debito' | 'tarjeta_credito';
  numeroRecibo?: string;
  observaciones?: string;
  descuento?: number;
  recargo?: number;
  montoFinal: number;
}

export interface GenerarCuotasRequest {
  personaIds: number[];
  concepto: string;
  monto: number;
  mesVencimiento: string;
  fechaVencimiento: string;
  aplicarDescuentos?: boolean;
}

export interface PagarCuotaRequest {
  cuotaId: number;
  metodoPago: 'efectivo' | 'transferencia' | 'tarjeta_debito' | 'tarjeta_credito';
  fechaPago: string;
  observaciones?: string;
  descuento?: number;
  recargo?: number;
}

export interface CuotasFilters {
  estado?: 'pendiente' | 'pagada' | 'vencida' | 'cancelada';
  personaTipo?: 'socio' | 'docente' | 'estudiante';
  mesVencimiento?: string;
  personaId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

interface CuotasState {
  cuotas: Cuota[];
  filteredCuotas: Cuota[];
  filters: CuotasFilters;
  loading: boolean;
  error: string | null;
  totalCuotas: number;
  totalRecaudado: number;
  totalPendiente: number;
  estadisticas: {
    pendientes: number;
    pagadas: number;
    vencidas: number;
    canceladas: number;
    recaudacionMensual: { [key: string]: number };
  };
}

const initialState: CuotasState = {
  cuotas: [],
  filteredCuotas: [],
  filters: {},
  loading: false,
  error: null,
  totalCuotas: 0,
  totalRecaudado: 0,
  totalPendiente: 0,
  estadisticas: {
    pendientes: 0,
    pagadas: 0,
    vencidas: 0,
    canceladas: 0,
    recaudacionMensual: {},
  },
};

// Mock API functions - reemplazar con llamadas reales
const cuotasAPI = {
  getAll: async (filters: CuotasFilters = {}): Promise<Cuota[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockCuotas: Cuota[] = [
      {
        id: 1,
        personaId: 1,
        personaNombre: 'Juan',
        personaApellido: 'Pérez',
        personaTipo: 'socio',
        categoriaId: 'clwactivo000001', // Categoría ACTIVO
        monto: 5000,
        concepto: 'Cuota mensual - Septiembre 2025',
        mesVencimiento: '2025-09',
        fechaVencimiento: '2025-09-10',
        fechaCreacion: '2025-09-01',
        estado: 'pendiente',
        montoFinal: 5000,
      },
      {
        id: 2,
        personaId: 2,
        personaNombre: 'María',
        personaApellido: 'García',
        personaTipo: 'socio',
        categoriaId: 'clwactivo000001', // Categoría ACTIVO
        monto: 5000,
        concepto: 'Cuota mensual - Septiembre 2025',
        mesVencimiento: '2025-09',
        fechaVencimiento: '2025-09-10',
        fechaCreacion: '2025-09-01',
        fechaPago: '2025-09-08',
        estado: 'pagada',
        metodoPago: 'transferencia',
        numeroRecibo: 'REC-001',
        montoFinal: 5000,
      },
      {
        id: 3,
        personaId: 3,
        personaNombre: 'Carlos',
        personaApellido: 'López',
        personaTipo: 'estudiante',
        categoriaId: 'clwestudiant001', // Categoría ESTUDIANTE
        monto: 3000,
        concepto: 'Cuota mensual - Agosto 2025',
        mesVencimiento: '2025-08',
        fechaVencimiento: '2025-08-10',
        fechaCreacion: '2025-08-01',
        estado: 'vencida',
        recargo: 500,
        montoFinal: 3500,
      },
    ];

    return mockCuotas.filter(cuota => {
      if (filters.estado && cuota.estado !== filters.estado) return false;
      if (filters.personaTipo && cuota.personaTipo !== filters.personaTipo) return false;
      if (filters.mesVencimiento && cuota.mesVencimiento !== filters.mesVencimiento) return false;
      if (filters.personaId && cuota.personaId !== filters.personaId) return false;
      return true;
    });
  },

  create: async (cuota: Omit<Cuota, 'id'>): Promise<Cuota> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ...cuota, id: Date.now() };
  },

  update: async (id: number, cuota: Partial<Cuota>): Promise<Cuota> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id, ...cuota } as Cuota;
  },

  delete: async (id: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  generarCuotas: async (request: GenerarCuotasRequest): Promise<Cuota[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return request.personaIds.map((personaId, index) => ({
      id: Date.now() + index,
      personaId,
      personaNombre: `Persona ${personaId}`,
      personaApellido: `Apellido ${personaId}`,
      personaTipo: 'socio' as const,
      categoriaId: 'clwactivo000001', // Categoría por defecto ACTIVO
      monto: request.monto,
      concepto: request.concepto,
      mesVencimiento: request.mesVencimiento,
      fechaVencimiento: request.fechaVencimiento,
      fechaCreacion: new Date().toISOString().split('T')[0],
      estado: 'pendiente' as const,
      montoFinal: request.monto,
    }));
  },

  pagarCuota: async (request: PagarCuotaRequest): Promise<Cuota> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: request.cuotaId,
      personaId: 1,
      personaNombre: 'Juan',
      personaApellido: 'Pérez',
      personaTipo: 'socio',
      categoriaId: 'clwactivo000001', // Categoría ACTIVO
      monto: 5000,
      concepto: 'Cuota mensual',
      mesVencimiento: '2025-09',
      fechaVencimiento: '2025-09-10',
      fechaCreacion: '2025-09-01',
      fechaPago: request.fechaPago,
      estado: 'pagada',
      metodoPago: request.metodoPago,
      numeroRecibo: `REC-${Date.now()}`,
      observaciones: request.observaciones,
      descuento: request.descuento,
      recargo: request.recargo,
      montoFinal: 5000 - (request.descuento || 0) + (request.recargo || 0),
    };
  },
};

// Async thunks
export const fetchCuotas = createAsyncThunk(
  'cuotas/fetchCuotas',
  async (filters: CuotasFilters = {}) => {
    const result = await cuotasAPI.getAll(filters);
    // Cuando se conecte a la API real, usar: result.data || result
    return result;
  }
);

export const createCuota = createAsyncThunk(
  'cuotas/createCuota',
  async (cuota: Omit<Cuota, 'id'>) => {
    const result = await cuotasAPI.create(cuota);
    // Cuando se conecte a la API real, usar: result.data || result
    return result;
  }
);

export const updateCuota = createAsyncThunk(
  'cuotas/updateCuota',
  async ({ id, cuota }: { id: number; cuota: Partial<Cuota> }) => {
    const result = await cuotasAPI.update(id, cuota);
    // Cuando se conecte a la API real, usar: result.data || result
    return result;
  }
);

export const deleteCuota = createAsyncThunk(
  'cuotas/deleteCuota',
  async (id: number) => {
    await cuotasAPI.delete(id);
    return id;
  }
);

export const generarCuotasMasivas = createAsyncThunk(
  'cuotas/generarCuotasMasivas',
  async (request: GenerarCuotasRequest) => {
    const result = await cuotasAPI.generarCuotas(request);
    // Cuando se conecte a la API real, usar: result.data || result
    return result;
  }
);

export const pagarCuota = createAsyncThunk(
  'cuotas/pagarCuota',
  async (request: PagarCuotaRequest) => {
    const result = await cuotasAPI.pagarCuota(request);
    // Cuando se conecte a la API real, usar: result.data || result
    return result;
  }
);

const cuotasSlice = createSlice({
  name: 'cuotas',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<CuotasFilters>) => {
      state.filters = action.payload;
      state.filteredCuotas = state.cuotas.filter(cuota => {
        const filters = action.payload;
        if (filters.estado && cuota.estado !== filters.estado) return false;
        if (filters.personaTipo && cuota.personaTipo !== filters.personaTipo) return false;
        if (filters.mesVencimiento && cuota.mesVencimiento !== filters.mesVencimiento) return false;
        if (filters.personaId && cuota.personaId !== filters.personaId) return false;
        return true;
      });
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredCuotas = state.cuotas;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cuotas
      .addCase(fetchCuotas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCuotas.fulfilled, (state, action) => {
        state.loading = false;
        state.cuotas = action.payload;
        state.filteredCuotas = action.payload;

        // Calcular estadísticas
        state.totalCuotas = action.payload.length;
        state.totalRecaudado = action.payload
          .filter(c => c.estado === 'pagada')
          .reduce((sum, c) => sum + c.montoFinal, 0);
        state.totalPendiente = action.payload
          .filter(c => c.estado === 'pendiente' || c.estado === 'vencida')
          .reduce((sum, c) => sum + c.montoFinal, 0);

        state.estadisticas = {
          pendientes: action.payload.filter(c => c.estado === 'pendiente').length,
          pagadas: action.payload.filter(c => c.estado === 'pagada').length,
          vencidas: action.payload.filter(c => c.estado === 'vencida').length,
          canceladas: action.payload.filter(c => c.estado === 'cancelada').length,
          recaudacionMensual: action.payload
            .filter(c => c.estado === 'pagada')
            .reduce((acc, c) => {
              const mes = c.mesVencimiento;
              acc[mes] = (acc[mes] || 0) + c.montoFinal;
              return acc;
            }, {} as { [key: string]: number }),
        };
      })
      .addCase(fetchCuotas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar cuotas';
      })

      // Create cuota
      .addCase(createCuota.fulfilled, (state, action) => {
        state.cuotas.push(action.payload);
        state.filteredCuotas.push(action.payload);
      })

      // Update cuota
      .addCase(updateCuota.fulfilled, (state, action) => {
        const index = state.cuotas.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.cuotas[index] = action.payload;
          const filteredIndex = state.filteredCuotas.findIndex(c => c.id === action.payload.id);
          if (filteredIndex !== -1) {
            state.filteredCuotas[filteredIndex] = action.payload;
          }
        }
      })

      // Delete cuota
      .addCase(deleteCuota.fulfilled, (state, action) => {
        state.cuotas = state.cuotas.filter(c => c.id !== action.payload);
        state.filteredCuotas = state.filteredCuotas.filter(c => c.id !== action.payload);
      })

      // Generar cuotas masivas
      .addCase(generarCuotasMasivas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generarCuotasMasivas.fulfilled, (state, action) => {
        state.loading = false;
        state.cuotas.push(...action.payload);
        state.filteredCuotas.push(...action.payload);
      })
      .addCase(generarCuotasMasivas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al generar cuotas';
      })

      // Pagar cuota
      .addCase(pagarCuota.fulfilled, (state, action) => {
        const index = state.cuotas.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.cuotas[index] = action.payload;
          const filteredIndex = state.filteredCuotas.findIndex(c => c.id === action.payload.id);
          if (filteredIndex !== -1) {
            state.filteredCuotas[filteredIndex] = action.payload;
          }
        }
      });
  },
});

export const { setFilters, clearFilters, clearError } = cuotasSlice.actions;
export default cuotasSlice.reducer;