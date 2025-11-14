import { api, ApiResponse } from './api';
import {
  Persona,
  PersonasQueryParams,
  PersonasPaginatedResponse,
  TipoPersona,
} from '../types/persona.types';

/**
 * API Service para Módulo Personas - Versión Básica
 *
 * Compatible SOLO con Backend Básico (6 endpoints):
 * 1. GET /api/personas - Listar personas
 * 2. GET /api/personas/:id - Obtener una persona
 * 3. POST /api/personas - Crear persona
 * 4. PUT /api/personas/:id - Actualizar persona
 * 5. DELETE /api/personas/:id - Eliminar persona
 * 6. GET /api/tipo-persona-catalogo - Obtener catálogo de tipos
 *
 * NO incluye endpoints V2 como:
 * - Gestión de tipos asignados
 * - Gestión de contactos
 * - Búsquedas especializadas
 * - Validaciones
 * - Estadísticas
 * - Administración de catálogos
 */
export const personasApiBasic = {
  // ============================================================================
  // CATÁLOGOS
  // ============================================================================

  /**
   * Obtener catálogo de tipos de persona
   * GET /api/tipo-persona-catalogo
   */
  getTiposPersona: async (): Promise<ApiResponse<TipoPersona[]>> => {
    const response = await api.get('/tipo-persona-catalogo');
    return response.data;
  },

  // ============================================================================
  // PERSONAS - CRUD BÁSICO
  // ============================================================================

  /**
   * Obtener todas las personas con filtros y paginación
   * GET /api/personas
   *
   * @param params - Parámetros de consulta (page, limit, search, etc.)
   * @returns Respuesta paginada con lista de personas
   */
  getAll: async (params?: PersonasQueryParams): Promise<PersonasPaginatedResponse> => {
    const response = await api.get('/personas', { params });
    return response.data;
  },

  /**
   * Obtener una persona por ID
   * GET /api/personas/:id
   *
   * @param id - ID de la persona
   * @param includeRelaciones - Incluir relaciones (si el backend lo soporta)
   * @returns Datos de la persona
   */
  getById: async (id: number, includeRelaciones: boolean = false): Promise<ApiResponse<Persona>> => {
    const response = await api.get(`/personas/${id}`, {
      params: { includeRelaciones },
    });
    return response.data;
  },

  /**
   * Crear una nueva persona
   * POST /api/personas
   *
   * @param persona - Datos de la persona a crear
   * @returns Persona creada
   */
  create: async (persona: Partial<Persona>): Promise<ApiResponse<Persona>> => {
    // Limpiar campos undefined antes de enviar
    const cleanedPersona = Object.fromEntries(
      Object.entries(persona).filter(([_, value]) => value !== undefined)
    );
    const response = await api.post('/personas', cleanedPersona);
    return response.data;
  },

  /**
   * Actualizar una persona existente
   * PUT /api/personas/:id
   *
   * @param id - ID de la persona
   * @param persona - Datos a actualizar
   * @returns Persona actualizada
   */
  update: async (id: number, persona: Partial<Persona>): Promise<ApiResponse<Persona>> => {
    // Limpiar campos undefined antes de enviar
    const cleanedPersona = Object.fromEntries(
      Object.entries(persona).filter(([_, value]) => value !== undefined)
    );
    const response = await api.put(`/personas/${id}`, cleanedPersona);
    return response.data;
  },

  /**
   * Eliminar una persona (soft delete)
   * DELETE /api/personas/:id
   *
   * @param id - ID de la persona
   * @returns Confirmación de eliminación
   */
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/personas/${id}`);
    return response.data;
  },
};

export default personasApiBasic;
