import { api, ApiResponse, PaginatedResponse } from './api';
import { Persona } from '../store/slices/personasSlice';

export interface PersonasFilters {
  tipo?: 'socio' | 'docente' | 'estudiante';
  estado?: 'activo' | 'inactivo';
  search?: string;
}

export interface PersonasQueryParams extends PersonasFilters {
  page?: number;
  limit?: number;
  sortBy?: keyof Persona;
  sortOrder?: 'asc' | 'desc';
}

export const personasApi = {
  getAll: async (params?: PersonasQueryParams): Promise<PaginatedResponse<Persona>> => {
    const response = await api.get('/personas', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Persona>> => {
    const response = await api.get(`/personas/${id}`);
    return response.data;
  },

  create: async (persona: Omit<Persona, 'id'>): Promise<ApiResponse<Persona>> => {
    const response = await api.post('/personas', persona);
    return response.data;
  },

  update: async (id: number, persona: Partial<Persona>): Promise<ApiResponse<Persona>> => {
    const response = await api.put(`/personas/${id}`, persona);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/personas/${id}`);
    return response.data;
  },

  bulkDelete: async (ids: number[]): Promise<ApiResponse<null>> => {
    const response = await api.delete('/personas/bulk', { data: { ids } });
    return response.data;
  },

  search: async (query: string): Promise<ApiResponse<Persona[]>> => {
    const response = await api.get('/personas/search', {
      params: { q: query }
    });
    return response.data;
  },

  getByTipo: async (tipo: 'socio' | 'docente' | 'estudiante'): Promise<ApiResponse<Persona[]>> => {
    const response = await api.get(`/personas/tipo/${tipo}`);
    return response.data;
  },

  updateEstado: async (id: number, estado: 'activo' | 'inactivo'): Promise<ApiResponse<Persona>> => {
    const response = await api.patch(`/personas/${id}/estado`, { estado });
    return response.data;
  },

  validateEmail: async (email: string, excludeId?: number): Promise<ApiResponse<boolean>> => {
    const response = await api.post('/personas/validate-email', { email, excludeId });
    return response.data;
  },

  export: async (format: 'csv' | 'excel', filters?: PersonasFilters): Promise<Blob> => {
    const response = await api.get('/personas/export', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default personasApi;