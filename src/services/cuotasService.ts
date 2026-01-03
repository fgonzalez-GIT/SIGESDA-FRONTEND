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

// Response Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface CuotasListResponse {
  data: Cuota[];
  total: number;
  pages: number;
  currentPage: number;
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
  getCuotas: async (filters: CuotasFilters = {}): Promise<CuotasListResponse> => {
    const response = await cuotasAPI.get<ApiResponse<CuotasListResponse>>('/', { params: filters });
    return response.data.data;
  },

  // Obtener una cuota por ID
  getCuotaById: async (id: number): Promise<Cuota> => {
    const response = await cuotasAPI.get<ApiResponse<Cuota>>(`/${id}`);
    return response.data.data;
  },

  // Crear una nueva cuota manual (poco común, usualmente se generan)
  createCuota: async (cuota: CrearCuotaRequest): Promise<Cuota> => {
    const response = await cuotasAPI.post<ApiResponse<Cuota>>('/', cuota);
    return response.data.data;
  },

  // Actualizar una cuota
  updateCuota: async (id: number, cuota: Partial<Cuota>): Promise<Cuota> => {
    const response = await cuotasAPI.put<ApiResponse<Cuota>>(`/${id}`, cuota);
    return response.data.data;
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
  }
};

export default cuotasService;