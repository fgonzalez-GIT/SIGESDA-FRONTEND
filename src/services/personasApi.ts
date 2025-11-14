import { api, ApiResponse } from './api';
import {
  Persona,
  CreatePersonaDTO,
  UpdatePersonaDTO,
  PersonasQueryParams,
  PersonasPaginatedResponse,
  CatalogosPersonas,
  CatalogosResponse,
  TipoPersona,
  EspecialidadDocente,
  CategoriaSocio,
  TipoContacto,
  PersonaTipo,
  CreatePersonaTipoDTO,
  UpdatePersonaTipoDTO,
  Contacto,
  CreateContactoDTO,
  UpdateContactoDTO,
  ValidationResponse,
  EstadisticasTipos,
  CreateTipoPersonaDTO,
  UpdateTipoPersonaDTO,
  CreateEspecialidadDocenteDTO,
  UpdateEspecialidadDocenteDTO,
  ReorderCatalogoDTO,
} from '../types/persona.types';

/**
 * API Service para Módulo Personas V2
 * Base URL: /api/personas (v2)
 *
 * Sistema de múltiples tipos por persona con gestión dinámica de catálogos
 */
export const personasApi = {
  // ============================================================================
  // CATÁLOGOS
  // ============================================================================

  /**
   * Obtener todos los catálogos de una vez (optimizado)
   * GET /api/catalogos/personas/todos
   *
   * NOTA: Este endpoint podría no existir en el backend actual.
   * Si falla, usar los endpoints individuales:
   * - getTiposPersona()
   * - getEspecialidadesDocentes()
   * - getTiposContacto()
   * - getCategoriasSocio()
   */
  getCatalogos: async (): Promise<CatalogosResponse> => {
    const response = await api.get('/catalogos/personas/todos');
    return response.data;
  },

  /**
   * Obtener catálogo de tipos de persona
   * GET /api/tipo-persona-catalogo
   */
  getTiposPersona: async (): Promise<ApiResponse<TipoPersona[]>> => {
    const response = await api.get('/tipo-persona-catalogo');
    return response.data;
  },

  /**
   * Obtener catálogo de especialidades docentes
   * GET /api/catalogos/especialidades-docentes
   */
  getEspecialidadesDocentes: async (): Promise<ApiResponse<EspecialidadDocente[]>> => {
    const response = await api.get('/catalogos/especialidades-docentes');
    return response.data;
  },

  /**
   * Obtener catálogo de tipos de contacto
   * GET /api/catalogos/tipos-contacto
   */
  getTiposContacto: async (): Promise<ApiResponse<TipoContacto[]>> => {
    const response = await api.get('/catalogos/tipos-contacto');
    return response.data;
  },

  /**
   * Obtener catálogo de categorías de socio
   * GET /api/catalogos/categorias-socios
   */
  getCategoriasSocios: async (): Promise<ApiResponse<CategoriaSocio[]>> => {
    const response = await api.get('/catalogos/categorias-socios');
    return response.data;
  },

  // ============================================================================
  // PERSONAS - CRUD
  // ============================================================================

  /**
   * Obtener todas las personas con filtros y paginación
   * GET /api/personas
   */
  getAll: async (params?: PersonasQueryParams): Promise<PersonasPaginatedResponse> => {
    const response = await api.get('/personas', { params });
    return response.data;
  },

  /**
   * Obtener una persona por ID
   * GET /api/personas/:id
   */
  getById: async (id: number, includeRelaciones: boolean = true): Promise<ApiResponse<Persona>> => {
    const response = await api.get(`/personas/${id}`, {
      params: { includeRelaciones },
    });
    return response.data;
  },

  /**
   * Crear una nueva persona con tipos y contactos
   * POST /api/personas
   */
  create: async (persona: CreatePersonaDTO): Promise<ApiResponse<Persona>> => {
    const response = await api.post('/personas', persona);
    return response.data;
  },

  /**
   * Actualizar una persona existente
   * PUT /api/personas/:id
   */
  update: async (id: number, persona: UpdatePersonaDTO): Promise<ApiResponse<Persona>> => {
    const response = await api.put(`/personas/${id}`, persona);
    return response.data;
  },

  /**
   * Eliminar una persona (soft delete)
   * DELETE /api/personas/:id
   */
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/personas/${id}`);
    return response.data;
  },

  /**
   * Cambiar estado de una persona (ACTIVO/INACTIVO/SUSPENDIDO)
   * PATCH /api/personas/:id/estado
   */
  cambiarEstado: async (
    id: number,
    estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO'
  ): Promise<ApiResponse<Persona>> => {
    const response = await api.patch(`/personas/${id}/estado`, { estado });
    return response.data;
  },

  // ============================================================================
  // BÚSQUEDA Y FILTROS ESPECIALIZADOS
  // ============================================================================

  /**
   * Búsqueda de personas por texto
   * GET /api/personas/search?q=texto
   */
  search: async (
    query: string,
    params?: Omit<PersonasQueryParams, 'search'>
  ): Promise<PersonasPaginatedResponse> => {
    const response = await api.get('/personas/search', {
      params: { q: query, ...params }
    });
    return response.data;
  },

  /**
   * Obtener solo socios activos
   * GET /api/personas/socios
   */
  getSocios: async (params?: PersonasQueryParams): Promise<PersonasPaginatedResponse> => {
    const response = await api.get('/personas/socios', { params });
    return response.data;
  },

  /**
   * Obtener solo docentes activos
   * GET /api/personas/docentes
   */
  getDocentes: async (params?: PersonasQueryParams): Promise<PersonasPaginatedResponse> => {
    const response = await api.get('/personas/docentes', { params });
    return response.data;
  },

  /**
   * Obtener solo proveedores activos
   * GET /api/personas/proveedores
   */
  getProveedores: async (params?: PersonasQueryParams): Promise<PersonasPaginatedResponse> => {
    const response = await api.get('/personas/proveedores', { params });
    return response.data;
  },

  // ============================================================================
  // GESTIÓN DE TIPOS
  // ============================================================================

  /**
   * Obtener tipos asignados a una persona
   * GET /api/personas/:id/tipos
   */
  getTipos: async (personaId: number): Promise<ApiResponse<PersonaTipo[]>> => {
    const response = await api.get(`/personas/${personaId}/tipos`);
    return response.data;
  },

  /**
   * Asignar un nuevo tipo a una persona
   * POST /api/personas/:id/tipos
   */
  asignarTipo: async (
    personaId: number,
    tipo: CreatePersonaTipoDTO
  ): Promise<ApiResponse<PersonaTipo>> => {
    const response = await api.post(`/personas/${personaId}/tipos`, tipo);
    return response.data;
  },

  /**
   * Actualizar un tipo asignado
   * PUT /api/personas/tipos/:tipoId
   */
  actualizarTipo: async (
    tipoId: number,
    data: UpdatePersonaTipoDTO
  ): Promise<ApiResponse<PersonaTipo>> => {
    const response = await api.put(`/personas/tipos/${tipoId}`, data);
    return response.data;
  },

  /**
   * Desasignar un tipo de una persona
   * DELETE /api/personas/:personaId/tipos/:tipoId
   */
  desasignarTipo: async (personaId: number, tipoId: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/personas/${personaId}/tipos/${tipoId}`);
    return response.data;
  },

  /**
   * Activar/Desactivar un tipo asignado (toggle)
   * PATCH /api/personas/tipos/:tipoId/toggle
   */
  toggleTipo: async (tipoId: number): Promise<ApiResponse<PersonaTipo>> => {
    const response = await api.patch(`/personas/tipos/${tipoId}/toggle`);
    return response.data;
  },

  // ============================================================================
  // GESTIÓN DE CONTACTOS
  // ============================================================================

  /**
   * Obtener contactos de una persona
   * GET /api/personas/:id/contactos
   */
  getContactos: async (personaId: number): Promise<ApiResponse<Contacto[]>> => {
    const response = await api.get(`/personas/${personaId}/contactos`);
    return response.data;
  },

  /**
   * Agregar un contacto a una persona
   * POST /api/personas/:id/contactos
   */
  addContacto: async (
    personaId: number,
    contacto: CreateContactoDTO
  ): Promise<ApiResponse<Contacto>> => {
    const response = await api.post(`/personas/${personaId}/contactos`, contacto);
    return response.data;
  },

  /**
   * Actualizar un contacto
   * PUT /api/personas/contactos/:id
   */
  updateContacto: async (
    contactoId: number,
    contacto: UpdateContactoDTO
  ): Promise<ApiResponse<Contacto>> => {
    const response = await api.put(`/personas/contactos/${contactoId}`, contacto);
    return response.data;
  },

  /**
   * Eliminar un contacto
   * DELETE /api/personas/contactos/:id
   */
  deleteContacto: async (contactoId: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/personas/contactos/${contactoId}`);
    return response.data;
  },

  /**
   * Establecer contacto como principal
   * PATCH /api/personas/contactos/:id/principal
   */
  setPrincipal: async (contactoId: number): Promise<ApiResponse<Contacto>> => {
    const response = await api.patch(`/personas/contactos/${contactoId}/principal`);
    return response.data;
  },

  // ============================================================================
  // VALIDACIONES
  // ============================================================================

  /**
   * Validar si un DNI ya existe
   * GET /api/personas/validar/dni/:dni
   */
  validarDni: async (dni: string, excludeId?: number): Promise<ValidationResponse> => {
    const response = await api.get(`/personas/validar/dni/${dni}`, {
      params: { excludeId },
    });
    return response.data;
  },

  /**
   * Validar si un email ya existe
   * GET /api/personas/validar/email/:email
   */
  validarEmail: async (email: string, excludeId?: number): Promise<ValidationResponse> => {
    const response = await api.get(`/personas/validar/email/${encodeURIComponent(email)}`, {
      params: { excludeId },
    });
    return response.data;
  },

  // ============================================================================
  // ESTADÍSTICAS
  // ============================================================================

  /**
   * Obtener estadísticas de tipos de persona
   * GET /api/personas/estadisticas/tipos
   */
  getEstadisticasTipos: async (): Promise<ApiResponse<EstadisticasTipos[]>> => {
    const response = await api.get('/personas/estadisticas/tipos');
    return response.data;
  },

  // ============================================================================
  // ADMIN - GESTIÓN DE CATÁLOGOS
  // ============================================================================

  /**
   * Crear un nuevo tipo de persona (admin)
   * POST /api/admin/catalogos/tipos-persona
   */
  admin: {
    /**
     * Crear un nuevo tipo de persona
     * POST /api/admin/catalogos/tipos-persona
     */
    createTipoPersona: async (
      tipo: CreateTipoPersonaDTO
    ): Promise<ApiResponse<TipoPersona>> => {
      const response = await api.post('/admin/catalogos/tipos-persona', tipo);
      return response.data;
    },

    /**
     * Actualizar un tipo de persona
     * PUT /api/admin/catalogos/tipos-persona/:id
     */
    updateTipoPersona: async (
      id: number,
      tipo: UpdateTipoPersonaDTO
    ): Promise<ApiResponse<TipoPersona>> => {
      const response = await api.put(`/admin/catalogos/tipos-persona/${id}`, tipo);
      return response.data;
    },

    /**
     * Eliminar un tipo de persona
     * DELETE /api/admin/catalogos/tipos-persona/:id
     */
    deleteTipoPersona: async (id: number): Promise<ApiResponse<null>> => {
      const response = await api.delete(`/admin/catalogos/tipos-persona/${id}`);
      return response.data;
    },

    /**
     * Reordenar tipos de persona
     * POST /api/admin/catalogos/tipos-persona/reordenar
     */
    reorderTiposPersona: async (data: ReorderCatalogoDTO): Promise<ApiResponse<null>> => {
      const response = await api.post('/admin/catalogos/tipos-persona/reordenar', data);
      return response.data;
    },

    /**
     * Crear una nueva especialidad docente
     * POST /api/admin/catalogos/especialidades-docentes
     */
    createEspecialidad: async (
      especialidad: CreateEspecialidadDocenteDTO
    ): Promise<ApiResponse<EspecialidadDocente>> => {
      const response = await api.post(
        '/admin/catalogos/especialidades-docentes',
        especialidad
      );
      return response.data;
    },

    /**
     * Actualizar una especialidad docente
     * PUT /api/admin/catalogos/especialidades-docentes/:id
     */
    updateEspecialidad: async (
      id: number,
      especialidad: UpdateEspecialidadDocenteDTO
    ): Promise<ApiResponse<EspecialidadDocente>> => {
      const response = await api.put(
        `/admin/catalogos/especialidades-docentes/${id}`,
        especialidad
      );
      return response.data;
    },

    /**
     * Eliminar una especialidad docente
     * DELETE /api/admin/catalogos/especialidades-docentes/:id
     */
    deleteEspecialidad: async (id: number): Promise<ApiResponse<null>> => {
      const response = await api.delete(`/admin/catalogos/especialidades-docentes/${id}`);
      return response.data;
    },

    /**
     * Reordenar especialidades docentes
     * POST /api/admin/catalogos/especialidades-docentes/reordenar
     */
    reorderEspecialidades: async (data: ReorderCatalogoDTO): Promise<ApiResponse<null>> => {
      const response = await api.post(
        '/admin/catalogos/especialidades-docentes/reordenar',
        data
      );
      return response.data;
    },
  },
};

export default personasApi;
