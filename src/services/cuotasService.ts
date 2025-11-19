import axios from 'axios';
import { Cuota, GenerarCuotasRequest, PagarCuotaRequest, CuotasFilters } from '../store/slices/cuotasSlice';

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

export const cuotasService = {
  // Obtener todas las cuotas con filtros opcionales
  getCuotas: async (filters: CuotasFilters = {}): Promise<Cuota[]> => {
    const response = await cuotasAPI.get('/', { params: filters });
    return response.data;
  },

  // Obtener una cuota por ID
  getCuotaById: async (id: number): Promise<Cuota> => {
    const response = await cuotasAPI.get(`/${id}`);
    return response.data;
  },

  // Crear una nueva cuota
  createCuota: async (cuota: Omit<Cuota, 'id'>): Promise<Cuota> => {
    const response = await cuotasAPI.post('/', cuota);
    return response.data;
  },

  // Actualizar una cuota existente
  updateCuota: async (id: number, cuota: Partial<Cuota>): Promise<Cuota> => {
    const response = await cuotasAPI.put(`/${id}`, cuota);
    return response.data;
  },

  // Eliminar una cuota
  deleteCuota: async (id: number): Promise<void> => {
    await cuotasAPI.delete(`/${id}`);
  },

  // Generar cuotas masivas
  generarCuotasMasivas: async (request: GenerarCuotasRequest): Promise<Cuota[]> => {
    const response = await cuotasAPI.post('/generar-masivas', request);
    return response.data;
  },

  // Pagar una cuota
  pagarCuota: async (request: PagarCuotaRequest): Promise<Cuota> => {
    const response = await cuotasAPI.post(`/${request.cuotaId}/pagar`, request);
    return response.data;
  },

  // Obtener estadísticas de cuotas
  getEstadisticas: async (filtros?: {
    fechaDesde?: string;
    fechaHasta?: string;
    personaTipo?: string
  }) => {
    const response = await cuotasAPI.get('/estadisticas', { params: filtros });
    return response.data;
  },

  // Obtener cuotas vencidas
  getCuotasVencidas: async (): Promise<Cuota[]> => {
    const response = await cuotasAPI.get('/vencidas');
    return response.data;
  },

  // Obtener cuotas por vencer (próximos N días)
  getCuotasPorVencer: async (dias: number = 7): Promise<Cuota[]> => {
    const response = await cuotasAPI.get('/por-vencer', { params: { dias } });
    return response.data;
  },

  // Obtener recaudación por período
  getRecaudacion: async (fechaDesde: string, fechaHasta: string) => {
    const response = await cuotasAPI.get('/recaudacion', {
      params: { fechaDesde, fechaHasta }
    });
    return response.data;
  },

  // Generar reporte de cuotas
  generarReporte: async (filtros: CuotasFilters & {
    formato: 'pdf' | 'excel';
    incluirDetalle?: boolean;
  }): Promise<Blob> => {
    const response = await cuotasAPI.get('/reporte', {
      params: filtros,
      responseType: 'blob',
    });
    return response.data;
  },

  // Enviar recordatorio de pago
  enviarRecordatorio: async (cuotaId: number, tipo: 'email' | 'sms' = 'email') => {
    const response = await cuotasAPI.post(`/${cuotaId}/recordatorio`, { tipo });
    return response.data;
  },

  // Aplicar descuento a cuota
  aplicarDescuento: async (cuotaId: number, descuento: number, motivo: string) => {
    const response = await cuotasAPI.post(`/${cuotaId}/descuento`, {
      descuento,
      motivo
    });
    return response.data;
  },

  // Aplicar recargo por vencimiento
  aplicarRecargo: async (cuotaId: number, recargo: number, motivo: string) => {
    const response = await cuotasAPI.post(`/${cuotaId}/recargo`, {
      recargo,
      motivo
    });
    return response.data;
  },

  // Cancelar cuota
  cancelarCuota: async (cuotaId: number, motivo: string) => {
    const response = await cuotasAPI.post(`/${cuotaId}/cancelar`, { motivo });
    return response.data;
  },

  // Duplicar cuotas de un mes a otro
  duplicarCuotas: async (mesOrigen: string, mesDestino: string, conceptoNuevo?: string) => {
    const response = await cuotasAPI.post('/duplicar', {
      mesOrigen,
      mesDestino,
      conceptoNuevo,
    });
    return response.data;
  },

  // Buscar cuotas por persona
  getCuotasPorPersona: async (personaId: number): Promise<Cuota[]> => {
    const response = await cuotasAPI.get(`/persona/${personaId}`);
    return response.data;
  },

  // Obtener resumen mensual
  getResumenMensual: async (año: number, mes: number) => {
    const response = await cuotasAPI.get('/resumen-mensual', {
      params: { año, mes }
    });
    return response.data;
  },
};

export default cuotasService;