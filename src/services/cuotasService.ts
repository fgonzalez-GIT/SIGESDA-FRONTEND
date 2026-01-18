import axios from 'axios';
import {
  Cuota,
  ItemCuota,
  DashboardData,
  CategoriaSocio,
  CrearCuotaRequest,
  GenerarCuotasRequest,
  GeneracionCuotasResponse,
  ValidacionGeneracionResponse,
  RecalcularCuotaRequest,
  RecalculoResponse
} from '../types/cuota.types';
import { CuotasFilters } from '../store/slices/cuotasSlice';
import { PaginatedResponse } from './api';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

const cuotasAPI = axios.create({
  baseURL: `${API_BASE_URL}/cuotas`,
  headers: {
    'Content-Type': 'application/json',
  },
});

cuotasAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Transforma una cuota del backend al formato legacy que espera GenerarReciboDialog
 * Añade campos obsoletos (personaId, estado, montoFinal, concepto, fechaVencimiento)
 */
const transformCuotaToLegacy = (cuota: any): any => {
  // Intentar obtener personaId de diferentes fuentes
  let personaId = null;

  // 1. De cuota.recibo.receptorId (si recibo está incluido)
  if (cuota.recibo?.receptorId) {
    personaId = cuota.recibo.receptorId;
  }
  // 2. Directamente de cuota.personaId (si existe en el modelo)
  else if (cuota.personaId) {
    personaId = cuota.personaId;
  }
  // 3. De cuota.receptor.id (otra posible estructura)
  else if (cuota.receptor?.id) {
    personaId = cuota.receptor.id;
  }

  // Log para debug (solo en desarrollo)
  if (import.meta.env.DEV && !personaId) {
    console.warn('[Cuotas] No se pudo obtener personaId para cuota:', cuota.id, cuota);
  }

  return {
    ...cuota,
    // Campos legacy para compatibilidad con GenerarReciboDialog
    personaId,
    estado: cuota.recibo?.estado?.toLowerCase() || cuota.estado?.toLowerCase() || 'pendiente',
    montoFinal: cuota.montoTotal,
    concepto: cuota.recibo?.concepto || cuota.concepto || `Cuota ${cuota.mes}/${cuota.anio}`,
    fechaVencimiento: cuota.recibo?.fechaVencimiento || cuota.fechaVencimiento || cuota.recibo?.fecha,
  };
};

// Response Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface DesgloseItemsResponse {
  desglose: Record<string, { items: ItemCuota[]; subtotal: number }>;
  totales: {
    base: number;
    actividades: number;
    descuentos: number;
    recargos: number;
    total: number;
  };
}

export const cuotasService = {
  // Obtener todas las cuotas con filtros
  getCuotas: async (filters: CuotasFilters = {}): Promise<PaginatedResponse<Cuota>> => {
    // El backend siempre incluye la relación 'recibo' por defecto (no requiere parámetro)
    const response = await cuotasAPI.get<PaginatedResponse<Cuota>>('/', { params: filters });

    // Debug logging (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log('[cuotasService.getCuotas] Raw backend response:', response.data);
      console.log('[cuotasService.getCuotas] Cuotas array length:', response.data.data?.length || 0);
      console.log('[cuotasService.getCuotas] Meta:', response.data.meta);
      if (response.data.data?.length > 0) {
        console.log('[cuotasService.getCuotas] Primera cuota (raw):', response.data.data[0]);
        const transformed = transformCuotaToLegacy(response.data.data[0]);
        console.log('[cuotasService.getCuotas] Primera cuota (transformed):', transformed);
        console.log('[cuotasService.getCuotas] personaId extraído:', transformed.personaId);
      }
    }

    // Transformar cuotas al formato legacy para compatibilidad con GenerarReciboDialog
    return {
      ...response.data,
      data: response.data.data?.map(transformCuotaToLegacy) || [],
    };
  },

  // Obtener una cuota por ID
  getCuotaById: async (id: number): Promise<Cuota> => {
    const response = await cuotasAPI.get<ApiResponse<Cuota>>(`/${id}`);
    return transformCuotaToLegacy(response.data.data);
  },

  // Crear una nueva cuota manual (poco común, usualmente se generan)
  createCuota: async (cuota: CrearCuotaRequest): Promise<Cuota> => {
    const response = await cuotasAPI.post<ApiResponse<Cuota>>('/', cuota);
    return transformCuotaToLegacy(response.data.data);
  },

  // Actualizar una cuota
  updateCuota: async (id: number, cuota: Partial<Cuota>): Promise<Cuota> => {
    const response = await cuotasAPI.put<ApiResponse<Cuota>>(`/${id}`, cuota);
    return transformCuotaToLegacy(response.data.data);
  },

  // Eliminar una cuota
  deleteCuota: async (id: number): Promise<void> => {
    await cuotasAPI.delete(`/${id}`);
  },

  // --- Generación Masiva (V2) ---
  generarCuotasV2: async (request: GenerarCuotasRequest): Promise<GeneracionCuotasResponse> => {
    const response = await cuotasAPI.post<ApiResponse<GeneracionCuotasResponse>>('/generar-v2', request);
    return response.data.data;
  },

  // Validar Generación
  validarGeneracion: async (mes: number, anio: number, categoriaIds?: number[]): Promise<ValidacionGeneracionResponse> => {
    const response = await cuotasAPI.get<ApiResponse<ValidacionGeneracionResponse>>(`/validar/${mes}/${anio}/generacion`, {
      params: { categoriaIds: categoriaIds?.join(',') }
    });
    return response.data.data;
  },

  // Períodos disponibles
  getPeriodosDisponibles: async (): Promise<any> => {
    const response = await cuotasAPI.get<ApiResponse<any>>('/periodos/disponibles');
    return response.data.data;
  },

  // --- Items de Cuota ---
  getItemsCuota: async (cuotaId: number): Promise<ItemCuota[]> => {
    const response = await cuotasAPI.get<ApiResponse<{ items: ItemCuota[] }>>(`/${cuotaId}/items`);
    return response.data.data.items;
  },

  getDesgloseItems: async (cuotaId: number): Promise<DesgloseItemsResponse> => {
    const response = await cuotasAPI.get<ApiResponse<DesgloseItemsResponse>>(`/${cuotaId}/items/desglose`);
    return response.data.data;
  },

  // --- Recálculo ---
  recalcularCuota: async (cuotaId: number, options: RecalcularCuotaRequest): Promise<RecalculoResponse> => {
    const response = await cuotasAPI.post<ApiResponse<RecalculoResponse>>(`/${cuotaId}/recalcular`, options);
    return response.data.data;
  },

  previewRecalculo: async (request: any) => {
    const response = await cuotasAPI.post<ApiResponse<any>>('/preview-recalculo', request);
    return response.data.data;
  },

  regenerarCuotas: async (request: any) => {
    const response = await cuotasAPI.post<ApiResponse<any>>('/regenerar', request);
    return response.data.data;
  },

  compararCuota: async (cuotaId: number) => {
    const response = await cuotasAPI.get<ApiResponse<any>>(`/${cuotaId}/comparar`);
    return response.data.data;
  },

  // --- Reportes ---
  getDashboard: async (mes: number, anio: number): Promise<DashboardData> => {
    const response = await cuotasAPI.get<ApiResponse<DashboardData>>(`/reportes/dashboard`, {
      params: { mes, anio }
    });
    return response.data.data;
  },

  // --- OLD METHODS (Adapt or Remove if deprecated) ---
  pagarCuota: async (request: any): Promise<Cuota> => {
    // NOTE: Payment logic might have moved to Recibos or remain here as proxy
    // Assuming endpoint /api/cuotas/:id/pagar exists or similar
    const response = await cuotasAPI.post<ApiResponse<Cuota>>(`/${request.cuotaId}/pagar`, request);
    return response.data.data;
  },

  // Buscar cuotas por persona
  getCuotasPorPersona: async (personaId: number, limit: number = 20): Promise<Cuota[]> => {
    const response = await cuotasAPI.get<ApiResponse<{ data: Cuota[] } | Cuota[]>>(`/socio/${personaId}`, {
      params: { limit }
    });
    // Handle potential pagination wrapper or direct array
    const data = response.data.data;
    return Array.isArray(data) ? data : (data as any)?.data || [];
  },

  getCuotasPorRecibo: async (reciboId: number): Promise<Cuota> => {
    const response = await cuotasAPI.get<ApiResponse<Cuota>>(`/recibo/${reciboId}`);
    return response.data.data;
  },

  addItemManual: async (cuotaId: number, item: any): Promise<any> => {
    const response = await cuotasAPI.post<ApiResponse<any>>(`/${cuotaId}/items`, item);
    return response.data.data;
  },

  // --- NUEVO: Exportación de Cuotas ---

  /**
   * Exporta todas las cuotas que coincidan con los filtros sin paginación
   * Usa el endpoint dedicado /api/cuotas/export
   * @param filters - Filtros a aplicar (sin page/limit)
   * @returns Todas las cuotas que coincidan con los filtros
   */
  exportCuotas: async (filters: Omit<CuotasFilters, 'page' | 'limit'> = {}): Promise<{ data: Cuota[]; total: number; exportedAt: string }> => {
    // El backend devuelve: { success, data: Cuota[], meta: { total, exportedAt } }
    const response = await cuotasAPI.get<{ success: boolean; data: Cuota[]; meta: { total: number; exportedAt: string } }>('/export', {
      params: filters
    });

    // Extraer datos y metadata correctamente
    const cuotasArray = response.data.data;  // Array de cuotas
    const meta = response.data.meta;  // Metadata con total y fecha

    return {
      data: cuotasArray?.map(transformCuotaToLegacy) || [],
      total: meta?.total || 0,
      exportedAt: meta?.exportedAt || new Date().toISOString()
    };
  },

  /**
   * Obtiene todas las cuotas (sin límite) con los filtros aplicados
   * Usa el parámetro limit=all en el endpoint principal
   * @param filters - Filtros a aplicar (limit se fuerza a 'all')
   * @returns Todas las cuotas que coincidan con los filtros
   */
  getAllCuotas: async (filters: Omit<CuotasFilters, 'page' | 'limit'> = {}): Promise<PaginatedResponse<Cuota>> => {
    const response = await cuotasAPI.get<PaginatedResponse<Cuota>>('/', {
      params: { ...filters, limit: 'all', page: 1 }
    });

    // Transformar cuotas al formato legacy
    return {
      ...response.data,
      data: response.data.data?.map(transformCuotaToLegacy) || [],
    };
  }
};

export default cuotasService;