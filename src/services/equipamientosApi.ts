/**
 * API Service para Equipamientos
 *
 * Gestiona las operaciones CRUD de equipamientos disponibles para aulas.
 *
 * Endpoints esperados del backend:
 * - GET    /api/equipamientos          - Listar equipamientos
 * - GET    /api/equipamientos/:id      - Obtener equipamiento por ID
 * - POST   /api/equipamientos          - Crear equipamiento
 * - PUT    /api/equipamientos/:id      - Actualizar equipamiento
 * - DELETE /api/equipamientos/:id      - Eliminar equipamiento (soft delete)
 * - PATCH  /api/equipamientos/:id/toggle - Toggle activo/inactivo
 * - POST   /api/equipamientos/reorder  - Reordenar equipamientos
 */

import { api } from './api';
import type {
  Equipamiento,
  CreateEquipamientoDto,
  UpdateEquipamientoDto,
  EquipamientoQueryParams,
  EquipamientoApiResponse,
  EquipamientoListResponse,
  CategoriaEquipamiento,
} from '@/types/equipamiento.types';

const BASE_PATH = '/equipamientos';

/**
 * API Response wrapper genérico
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const equipamientosApi = {
  /**
   * Listar todos los equipamientos
   * GET /api/equipamientos
   *
   * @param params - Parámetros de filtrado opcionales
   * @param params.limit - Límite de registros (default: 10, max: 100). Backend NO acepta -1. Usar 100 para obtener todos.
   * @param params.page - Número de página (default: 1)
   * @param params.includeInactive - Incluir equipamientos inactivos (default: false)
   * @param params.search - Búsqueda por texto en nombre/descripción
   * @param params.categoria - Filtrar por categoría de equipamiento
   * @returns Array de equipamientos
   */
  getAll: async (params?: EquipamientoQueryParams): Promise<Equipamiento[]> => {
    try {
      const response = await api.get<ApiResponse<Equipamiento[]>>(BASE_PATH, {
        params,
      });

      // Manejar diferentes formatos de respuesta
      if (response.data.data) {
        return response.data.data;
      }
      // Si el backend devuelve directamente el array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('[equipamientosApi.getAll] Error:', error);
      throw error;
    }
  },

  /**
   * Obtener equipamiento por ID
   * GET /api/equipamientos/:id
   *
   * @param id - ID del equipamiento
   * @returns Equipamiento encontrado
   */
  getById: async (id: number): Promise<Equipamiento> => {
    try {
      const response = await api.get<ApiResponse<Equipamiento>>(
        `${BASE_PATH}/${id}`
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error(`[equipamientosApi.getById] Error fetching ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear nuevo equipamiento
   * POST /api/equipamientos
   *
   * @param data - Datos del equipamiento a crear
   * @returns Equipamiento creado
   */
  create: async (data: CreateEquipamientoDto): Promise<Equipamiento> => {
    try {
      const response = await api.post<ApiResponse<Equipamiento>>(
        BASE_PATH,
        data
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error('[equipamientosApi.create] Error:', error);
      throw error;
    }
  },

  /**
   * Actualizar equipamiento existente
   * PUT /api/equipamientos/:id
   *
   * @param id - ID del equipamiento a actualizar
   * @param data - Datos a actualizar
   * @returns Equipamiento actualizado
   */
  update: async (
    id: number,
    data: UpdateEquipamientoDto
  ): Promise<Equipamiento> => {
    try {
      const response = await api.put<ApiResponse<Equipamiento>>(
        `${BASE_PATH}/${id}`,
        data
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error(`[equipamientosApi.update] Error updating ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar equipamiento (soft delete)
   * DELETE /api/equipamientos/:id
   *
   * @param id - ID del equipamiento a eliminar
   */
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`${BASE_PATH}/${id}`);
    } catch (error) {
      console.error(`[equipamientosApi.delete] Error deleting ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Toggle estado activo/inactivo
   * PATCH /api/equipamientos/:id/toggle
   *
   * @param id - ID del equipamiento
   * @returns Equipamiento con estado actualizado
   */
  toggle: async (id: number): Promise<Equipamiento> => {
    try {
      const response = await api.patch<ApiResponse<Equipamiento>>(
        `${BASE_PATH}/${id}/toggle`
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error(`[equipamientosApi.toggle] Error toggling ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Reordenar equipamientos
   * POST /api/equipamientos/reorder
   *
   * @param ids - Array de IDs en el nuevo orden
   */
  reorder: async (ids: number[]): Promise<void> => {
    try {
      await api.post(`${BASE_PATH}/reorder`, { ids });
    } catch (error) {
      console.error('[equipamientosApi.reorder] Error:', error);
      throw error;
    }
  },

  /**
   * Obtener solo equipamientos activos
   * Wrapper de getAll con filtro activo
   *
   * @returns Array de equipamientos activos
   */
  getActive: async (): Promise<Equipamiento[]> => {
    try {
      const all = await equipamientosApi.getAll();
      return all.filter((eq) => eq.activo);
    } catch (error) {
      console.error('[equipamientosApi.getActive] Error:', error);
      throw error;
    }
  },

  /**
   * Obtener categorías de equipamiento
   * GET /api/catalogos/categorias-equipamiento
   *
   * @returns Array de categorías activas
   */
  getCategorias: async (): Promise<CategoriaEquipamiento[]> => {
    try {
      const response = await api.get<ApiResponse<CategoriaEquipamiento[]>>(
        '/catalogos/categorias-equipamiento'
      );

      // Manejar diferentes formatos de respuesta
      if (response.data.data) {
        return response.data.data;
      }
      // Si el backend devuelve directamente el array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('[equipamientosApi.getCategorias] Error:', error);
      // Retornar array vacío en caso de error
      return [];
    }
  },
};

export default equipamientosApi;
