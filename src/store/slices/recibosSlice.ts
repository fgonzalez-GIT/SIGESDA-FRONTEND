import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { recibosService } from '../../services/recibosService';

export interface Recibo {
  id: number;
  numero: string;
  fechaEmision: string;
  fechaVencimiento: string;
  personaId: number;
  personaNombre: string;
  personaApellido: string;
  personaTipo: 'socio' | 'docente' | 'estudiante';
  personaEmail?: string;
  personaTelefono?: string;
  conceptos: ReciboConcepto[];
  subtotal: number;
  descuentos: number;
  recargos: number;
  total: number;
  estado: 'pendiente' | 'pagado' | 'vencido' | 'cancelado' | 'parcial';
  metodoPago?: 'efectivo' | 'transferencia' | 'tarjeta_debito' | 'tarjeta_credito' | 'cheque';
  fechaPago?: string;
  montoPagado: number;
  observaciones?: string;
  cuotaIds: number[]; // Cuotas asociadas a este recibo
  enviado: boolean;
  fechaEnvio?: string;
  archivo?: string; // URL del archivo PDF generado
}

export interface ReciboConcepto {
  id: number;
  concepto: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  cuotaId?: number;
}

export interface GenerarReciboRequest {
  personaId: number;
  cuotaIds: number[];
  fechaVencimiento: string;
  observaciones?: string;
  aplicarDescuentos?: boolean;
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
}

export interface PagarReciboRequest {
  reciboId: number;
  metodoPago: 'efectivo' | 'transferencia' | 'tarjeta_debito' | 'tarjeta_credito' | 'cheque';
  montoPago: number;
  fechaPago: string;
  observaciones?: string;
}

export interface RecibosFilters {
  estado?: 'pendiente' | 'pagado' | 'vencido' | 'cancelado' | 'parcial';
  personaTipo?: 'socio' | 'docente' | 'estudiante';
  personaId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  metodoPago?: string;
  numeroRecibo?: string;
  enviado?: boolean;
}

interface RecibosState {
  recibos: Recibo[];
  filteredRecibos: Recibo[];
  filters: RecibosFilters;
  loading: boolean;
  error: string | null;
  totalRecibos: number;
  totalFacturado: number;
  totalCobrado: number;
  totalPendiente: number;
  estadisticas: {
    pendientes: number;
    pagados: number;
    vencidos: number;
    cancelados: number;
    parciales: number;
    facturacionMensual: { [key: string]: number };
    cobranzaMensual: { [key: string]: number };
  };
  currentRecibo: Recibo | null;
  generatingPdf: boolean;
}

const initialState: RecibosState = {
  recibos: [],
  filteredRecibos: [],
  filters: {},
  loading: false,
  error: null,
  totalRecibos: 0,
  totalFacturado: 0,
  totalCobrado: 0,
  totalPendiente: 0,
  estadisticas: {
    pendientes: 0,
    pagados: 0,
    vencidos: 0,
    cancelados: 0,
    parciales: 0,
    facturacionMensual: {},
    cobranzaMensual: {},
  },
  currentRecibo: null,
  generatingPdf: false,
};

// Async thunks
export const fetchRecibos = createAsyncThunk(
  'recibos/fetchRecibos',
  async (filters: RecibosFilters = {}) => {
    const response = await recibosService.getRecibos(filters);
    return response;
  }
);

export const fetchReciboById = createAsyncThunk(
  'recibos/fetchReciboById',
  async (id: number) => {
    const response = await recibosService.getReciboById(id);
    return response;
  }
);

export const createRecibo = createAsyncThunk(
  'recibos/createRecibo',
  async (recibo: Omit<Recibo, 'id' | 'numero' | 'fechaEmision'>) => {
    const response = await recibosService.createRecibo(recibo);
    return response;
  }
);

export const updateRecibo = createAsyncThunk(
  'recibos/updateRecibo',
  async ({ id, recibo }: { id: number; recibo: Partial<Recibo> }) => {
    const response = await recibosService.updateRecibo(id, recibo);
    return response;
  }
);

export const deleteRecibo = createAsyncThunk(
  'recibos/deleteRecibo',
  async (id: number) => {
    await recibosService.deleteRecibo(id);
    return id;
  }
);

export const generarRecibo = createAsyncThunk(
  'recibos/generarRecibo',
  async (request: GenerarReciboRequest) => {
    const response = await recibosService.generarRecibo(request);
    return response;
  }
);

export const pagarRecibo = createAsyncThunk(
  'recibos/pagarRecibo',
  async (request: PagarReciboRequest) => {
    const response = await recibosService.pagarRecibo(request);
    return response;
  }
);

export const generarPdfRecibo = createAsyncThunk(
  'recibos/generarPdfRecibo',
  async (reciboId: number) => {
    const response = await recibosService.generarPdf(reciboId);
    return response;
  }
);

export const enviarRecibo = createAsyncThunk(
  'recibos/enviarRecibo',
  async ({ reciboId, email }: { reciboId: number; email?: string }) => {
    await recibosService.enviarRecibo(reciboId, email);
    return reciboId;
  }
);

export const anularRecibo = createAsyncThunk(
  'recibos/anularRecibo',
  async ({ reciboId, motivo }: { reciboId: number; motivo: string }) => {
    const response = await recibosService.anularRecibo(reciboId, motivo);
    return response;
  }
);

export const fetchEstadisticas = createAsyncThunk(
  'recibos/fetchEstadisticas',
  async (filtros?: { fechaDesde?: string; fechaHasta?: string; personaTipo?: string }) => {
    const response = await recibosService.getEstadisticas(filtros);
    return response;
  }
);

export const fetchVencidos = createAsyncThunk(
  'recibos/fetchVencidos',
  async () => {
    const response = await recibosService.getRecibosVencidos();
    return response;
  }
);

const recibosSlice = createSlice({
  name: 'recibos',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<RecibosFilters>) => {
      state.filters = action.payload;
      state.filteredRecibos = state.recibos.filter(recibo => {
        const filters = action.payload;
        if (filters.estado && recibo.estado !== filters.estado) return false;
        if (filters.personaTipo && recibo.personaTipo !== filters.personaTipo) return false;
        if (filters.personaId && recibo.personaId !== filters.personaId) return false;
        if (filters.numeroRecibo && !recibo.numero.toLowerCase().includes(filters.numeroRecibo.toLowerCase())) return false;
        if (filters.enviado !== undefined && recibo.enviado !== filters.enviado) return false;
        return true;
      });
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredRecibos = state.recibos;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRecibo: (state, action: PayloadAction<Recibo | null>) => {
      state.currentRecibo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch recibos
      .addCase(fetchRecibos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecibos.fulfilled, (state, action) => {
        state.loading = false;
        state.recibos = action.payload;
        state.filteredRecibos = action.payload;

        // Calcular estadísticas
        state.totalRecibos = action.payload.length;
        state.totalFacturado = action.payload.reduce((sum, r) => sum + r.total, 0);
        state.totalCobrado = action.payload
          .filter(r => r.estado === 'pagado')
          .reduce((sum, r) => sum + r.montoPagado, 0);
        state.totalPendiente = action.payload
          .filter(r => r.estado === 'pendiente' || r.estado === 'vencido' || r.estado === 'parcial')
          .reduce((sum, r) => sum + (r.total - r.montoPagado), 0);

        state.estadisticas = {
          pendientes: action.payload.filter(r => r.estado === 'pendiente').length,
          pagados: action.payload.filter(r => r.estado === 'pagado').length,
          vencidos: action.payload.filter(r => r.estado === 'vencido').length,
          cancelados: action.payload.filter(r => r.estado === 'cancelado').length,
          parciales: action.payload.filter(r => r.estado === 'parcial').length,
          facturacionMensual: action.payload
            .filter(r => r.fechaEmision && typeof r.fechaEmision === 'string')
            .reduce((acc, r) => {
              const mes = r.fechaEmision.substring(0, 7);
              acc[mes] = (acc[mes] || 0) + r.total;
              return acc;
            }, {} as { [key: string]: number }),
          cobranzaMensual: action.payload
            .filter(r => r.estado === 'pagado' && r.fechaPago && typeof r.fechaPago === 'string')
            .reduce((acc, r) => {
              const mes = r.fechaPago!.substring(0, 7);
              acc[mes] = (acc[mes] || 0) + r.montoPagado;
              return acc;
            }, {} as { [key: string]: number }),
        };
      })
      .addCase(fetchRecibos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar recibos';
      })

      // Fetch recibo by ID
      .addCase(fetchReciboById.fulfilled, (state, action) => {
        state.currentRecibo = action.payload;
      })

      // Create recibo
      .addCase(createRecibo.fulfilled, (state, action) => {
        state.recibos.push(action.payload);
        state.filteredRecibos.push(action.payload);
      })

      // Update recibo
      .addCase(updateRecibo.fulfilled, (state, action) => {
        const index = state.recibos.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.recibos[index] = action.payload;
          const filteredIndex = state.filteredRecibos.findIndex(r => r.id === action.payload.id);
          if (filteredIndex !== -1) {
            state.filteredRecibos[filteredIndex] = action.payload;
          }
        }
      })

      // Delete recibo
      .addCase(deleteRecibo.fulfilled, (state, action) => {
        state.recibos = state.recibos.filter(r => r.id !== action.payload);
        state.filteredRecibos = state.filteredRecibos.filter(r => r.id !== action.payload);
      })

      // Generar recibo
      .addCase(generarRecibo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generarRecibo.fulfilled, (state, action) => {
        state.loading = false;
        state.recibos.push(action.payload);
        state.filteredRecibos.push(action.payload);
      })
      .addCase(generarRecibo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al generar recibo';
      })

      // Pagar recibo
      .addCase(pagarRecibo.fulfilled, (state, action) => {
        const index = state.recibos.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.recibos[index] = action.payload;
          const filteredIndex = state.filteredRecibos.findIndex(r => r.id === action.payload.id);
          if (filteredIndex !== -1) {
            state.filteredRecibos[filteredIndex] = action.payload;
          }
        }
      })

      // Generar PDF
      .addCase(generarPdfRecibo.pending, (state) => {
        state.generatingPdf = true;
      })
      .addCase(generarPdfRecibo.fulfilled, (state, action) => {
        state.generatingPdf = false;
        // Actualizar el recibo con la URL del PDF
        if (state.currentRecibo) {
          state.currentRecibo.archivo = action.payload;
        }
      })
      .addCase(generarPdfRecibo.rejected, (state) => {
        state.generatingPdf = false;
      })

      // Enviar recibo
      .addCase(enviarRecibo.fulfilled, (state, action) => {
        const reciboId = action.payload;
        const index = state.recibos.findIndex(r => r.id === reciboId);
        if (index !== -1) {
          state.recibos[index].enviado = true;
          state.recibos[index].fechaEnvio = new Date().toISOString().split('T')[0];
        }
        const filteredIndex = state.filteredRecibos.findIndex(r => r.id === reciboId);
        if (filteredIndex !== -1) {
          state.filteredRecibos[filteredIndex].enviado = true;
          state.filteredRecibos[filteredIndex].fechaEnvio = new Date().toISOString().split('T')[0];
        }
      })

      // Anular recibo
      .addCase(anularRecibo.fulfilled, (state, action) => {
        const index = state.recibos.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.recibos[index] = action.payload;
          const filteredIndex = state.filteredRecibos.findIndex(r => r.id === action.payload.id);
          if (filteredIndex !== -1) {
            state.filteredRecibos[filteredIndex] = action.payload;
          }
        }
      })

      // Fetch estadísticas
      .addCase(fetchEstadisticas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEstadisticas.fulfilled, (state, action) => {
        state.loading = false;
        // Las estadísticas se pueden actualizar según la estructura de la respuesta
        if (action.payload) {
          state.estadisticas = {
            ...state.estadisticas,
            ...action.payload,
          };
        }
      })
      .addCase(fetchEstadisticas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar estadísticas';
      })

      // Fetch vencidos
      .addCase(fetchVencidos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVencidos.fulfilled, (state, action) => {
        state.loading = false;
        // Actualizar recibos vencidos en el estado
        // Puedes decidir si reemplazar todos los recibos o solo agregar los vencidos
        state.filteredRecibos = action.payload;
      })
      .addCase(fetchVencidos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar recibos vencidos';
      });
  },
});

export const { setFilters, clearFilters, clearError, setCurrentRecibo } = recibosSlice.actions;
export default recibosSlice.reducer;