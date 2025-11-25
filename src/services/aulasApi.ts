import { api, ApiResponse } from './api';

/**
 * Aulas API Service
 *
 * Endpoints para gestionar aulas del conservatorio.
 * Base URL: /api/aulas
 *
 * Características:
 * - IDs numéricos (no UUIDs)
 * - Campo equipamiento: backend espera string, frontend usa array
 * - Estados: disponible, ocupado, mantenimiento, fuera_servicio
 */

export interface Aula {
  id: number;
  nombre: string;
  descripcion?: string;
  capacidad: number;
  ubicacion?: string;
  equipamiento?: string[]; // Frontend usa array, backend espera string separado por comas
  tipo: 'salon' | 'ensayo' | 'auditorio' | 'exterior';
  estado: 'disponible' | 'ocupado' | 'mantenimiento' | 'fuera_servicio';
  observaciones?: string;
  fechaCreacion: string;
  activa?: boolean; // Para compatibilidad con backend
}

export interface CreateAulaDto {
  nombre: string; // REQUIRED
  descripcion?: string;
  capacidad: number; // REQUIRED
  ubicacion?: string;
  equipamiento?: string[];
  tipo: 'salon' | 'ensayo' | 'auditorio' | 'exterior'; // REQUIRED
  estado?: 'disponible' | 'ocupado' | 'mantenimiento' | 'fuera_servicio'; // default disponible
  observaciones?: string;
}

export interface UpdateAulaDto {
  nombre?: string;
  descripcion?: string;
  capacidad?: number;
  ubicacion?: string;
  equipamiento?: string[];
  tipo?: 'salon' | 'ensayo' | 'auditorio' | 'exterior';
  estado?: 'disponible' | 'ocupado' | 'mantenimiento' | 'fuera_servicio';
  observaciones?: string;
}

export interface AulasQueryParams {
  tipo?: string;
  estado?: string;
  capacidadMin?: number;
  capacidadMax?: number;
  equipamiento?: string;
  page?: number;
  limit?: number;
}

const BASE_PATH = '/aulas';

/**
 * Helper: Adapta equipamiento del backend (string) al frontend (array)
 */
const normalizeAula = (aula: any): Aula => {
  return {
    ...aula,
    equipamiento:
      typeof aula.equipamiento === 'string'
        ? aula.equipamiento
            .split(',')
            .map((item: string) => item.trim())
            .filter(Boolean)
        : aula.equipamiento || [],
  };
};

/**
 * Helper: Adapta equipamiento del frontend (array) al backend (string)
 */
const serializeAula = (aula: CreateAulaDto | UpdateAulaDto): any => {
  return {
    ...aula,
    equipamiento: Array.isArray(aula.equipamiento)
      ? aula.equipamiento.join(', ')
      : aula.equipamiento,
  };
};

const aulasApi = {
  /**
   * Listar Aulas
   * GET /api/aulas
   */
  getAll: async (params?: AulasQueryParams): Promise<Aula[]> => {
    const response = await api.get<ApiResponse<Aula[]>>(BASE_PATH, { params });
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data.map(normalizeAula) : [];
  },

  /**
   * Obtener Aula por ID
   * GET /api/aulas/:id
   */
  getById: async (id: number): Promise<Aula> => {
    const response = await api.get<ApiResponse<Aula>>(`${BASE_PATH}/${id}`);
    return normalizeAula(response.data.data);
  },

  /**
   * Crear Aula
   * POST /api/aulas
   */
  create: async (data: CreateAulaDto): Promise<Aula> => {
    const aulaToSend = serializeAula(data);
    const response = await api.post<ApiResponse<Aula>>(BASE_PATH, aulaToSend);
    return normalizeAula(response.data.data);
  },

  /**
   * Actualizar Aula
   * PUT /api/aulas/:id
   */
  update: async (id: number, data: UpdateAulaDto): Promise<Aula> => {
    const aulaToSend = serializeAula(data);
    const response = await api.put<ApiResponse<Aula>>(`${BASE_PATH}/${id}`, aulaToSend);
    return normalizeAula(response.data.data);
  },

  /**
   * Eliminar Aula
   * DELETE /api/aulas/:id
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Obtener Aulas Activas
   * GET /api/aulas?activa=true
   */
  getActivas: async (): Promise<Aula[]> => {
    const response = await api.get<ApiResponse<Aula[]>>(BASE_PATH, {
      params: { activa: true },
    });
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data.map(normalizeAula) : [];
  },
};

export default aulasApi;
