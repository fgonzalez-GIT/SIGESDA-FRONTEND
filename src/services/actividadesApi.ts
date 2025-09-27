import { api, ApiResponse, PaginatedResponse } from './api';
import { Actividad } from '../store/slices/actividadesSlice';

export interface ActividadesFilters {
  tipo?: 'coro' | 'clase' | 'taller' | 'evento';
  categoria?: 'infantil' | 'juvenil' | 'adulto' | 'general';
  estado?: 'activo' | 'inactivo' | 'suspendido' | 'finalizado';
  docenteId?: number;
  aulaId?: number;
  diaSemana?: string;
  search?: string;
}

export interface ActividadesQueryParams extends ActividadesFilters {
  page?: number;
  limit?: number;
  sortBy?: keyof Actividad;
  sortOrder?: 'asc' | 'desc';
}

export interface HorarioConflicto {
  actividadId: number;
  actividadNombre: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  tipo: 'aula' | 'docente';
}

export const actividadesApi = {
  getAll: async (params?: ActividadesQueryParams): Promise<PaginatedResponse<Actividad>> => {
    const response = await api.get('/actividades', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Actividad>> => {
    const response = await api.get(`/actividades/${id}`);
    return response.data;
  },

  create: async (actividad: Omit<Actividad, 'id' | 'cupoActual' | 'fechaCreacion'>): Promise<ApiResponse<Actividad>> => {
    const response = await api.post('/actividades', actividad);
    return response.data;
  },

  update: async (id: number, actividad: Partial<Actividad>): Promise<ApiResponse<Actividad>> => {
    const response = await api.put(`/actividades/${id}`, actividad);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/actividades/${id}`);
    return response.data;
  },

  duplicate: async (id: number): Promise<ApiResponse<Actividad>> => {
    const response = await api.post(`/actividades/${id}/duplicate`);
    return response.data;
  },

  bulkDelete: async (ids: number[]): Promise<ApiResponse<null>> => {
    const response = await api.delete('/actividades/bulk', { data: { ids } });
    return response.data;
  },

  search: async (query: string): Promise<ApiResponse<Actividad[]>> => {
    const response = await api.get('/actividades/search', {
      params: { q: query }
    });
    return response.data;
  },

  getByTipo: async (tipo: 'coro' | 'clase' | 'taller' | 'evento'): Promise<ApiResponse<Actividad[]>> => {
    const response = await api.get(`/actividades/tipo/${tipo}`);
    return response.data;
  },

  getByDocente: async (docenteId: number): Promise<ApiResponse<Actividad[]>> => {
    const response = await api.get(`/actividades/docente/${docenteId}`);
    return response.data;
  },

  getByAula: async (aulaId: number): Promise<ApiResponse<Actividad[]>> => {
    const response = await api.get(`/actividades/aula/${aulaId}`);
    return response.data;
  },

  updateEstado: async (id: number, estado: 'activo' | 'inactivo' | 'suspendido' | 'finalizado'): Promise<ApiResponse<Actividad>> => {
    const response = await api.patch(`/actividades/${id}/estado`, { estado });
    return response.data;
  },

  checkHorarioConflictos: async (actividad: {
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
    docenteId?: number;
    aulaId?: number;
    excludeId?: number;
  }): Promise<ApiResponse<HorarioConflicto[]>> => {
    const response = await api.post('/actividades/check-conflictos', actividad);
    return response.data;
  },

  getHorarioSemanal: async (filters?: {
    docenteId?: number;
    aulaId?: number;
    categoria?: string;
  }): Promise<ApiResponse<{
    [diaSemana: string]: Actividad[];
  }>> => {
    const response = await api.get('/actividades/horario-semanal', { params: filters });
    return response.data;
  },

  getEstadisticas: async (): Promise<ApiResponse<{
    totalActividades: number;
    actividadesPorTipo: { [tipo: string]: number };
    actividadesPorCategoria: { [categoria: string]: number };
    actividadesPorEstado: { [estado: string]: number };
    ocupacionPromedio: number;
    actividadesConCupoCompleto: number;
  }>> => {
    const response = await api.get('/actividades/estadisticas');
    return response.data;
  },

  inscribirPersona: async (actividadId: number, personaId: number, observaciones?: string): Promise<ApiResponse<null>> => {
    const response = await api.post(`/actividades/${actividadId}/inscripciones`, {
      personaId,
      observaciones
    });
    return response.data;
  },

  desinscribirPersona: async (actividadId: number, personaId: number, motivo?: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/actividades/${actividadId}/inscripciones/${personaId}`, {
      data: { motivo }
    });
    return response.data;
  },

  getInscripciones: async (actividadId: number): Promise<ApiResponse<{
    personaId: number;
    personaNombre: string;
    personaApellido: string;
    fechaInscripcion: string;
    observaciones?: string;
  }[]>> => {
    const response = await api.get(`/actividades/${actividadId}/inscripciones`);
    return response.data;
  },

  export: async (format: 'csv' | 'excel', filters?: ActividadesFilters): Promise<Blob> => {
    const response = await api.get('/actividades/export', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  },

  exportHorario: async (format: 'pdf' | 'excel', filters?: {
    docenteId?: number;
    aulaId?: number;
    categoria?: string;
  }): Promise<Blob> => {
    const response = await api.get('/actividades/export-horario', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default actividadesApi;