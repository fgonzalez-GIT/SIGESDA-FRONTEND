import { api, ApiResponse, PaginatedResponse } from './api';
import {
  Seccion,
  SeccionDetallada,
  HorarioSeccion,
  ParticipacionSeccion,
  ReservaAulaSeccion,
  CreateSeccionDto,
  UpdateSeccionDto,
  CreateHorarioDto,
  UpdateHorarioDto,
  AsignarDocenteDto,
  InscribirParticipanteDto,
  UpdateParticipacionDto,
  DarDeBajaParticipacionDto,
  CreateReservaAulaDto,
  UpdateReservaAulaDto,
  VerificarConflictosDto,
  SeccionFilters,
  ParticipantesFilters,
  VerificarConflictosResponse,
  EstadisticasSeccionResponse,
  HorarioSemanalResponse,
  OcupacionGlobalResponse,
  CargaHorariaDocenteResponse
} from '../types/seccion.types';

/**
 * Servicio de API para gestión de Secciones
 * Implementa los 27 endpoints del backend de Secciones
 */
export const seccionesApi = {
  // ============================================
  // 1. CRUD DE SECCIONES
  // ============================================

  /**
   * GET /api/secciones
   * Listar secciones con filtros y paginación
   */
  getAll: async (params?: SeccionFilters): Promise<PaginatedResponse<Seccion>> => {
    const response = await api.get('/secciones', { params });
    return response.data;
  },

  /**
   * GET /api/secciones/:id
   * Obtener sección por ID
   * @param id - ID de la sección
   * @param detallada - Si es true, incluye participaciones y reservas
   */
  getById: async (id: string, detallada = false): Promise<ApiResponse<Seccion | SeccionDetallada>> => {
    const response = await api.get(`/secciones/${id}`, {
      params: { detallada }
    });
    return response.data;
  },

  /**
   * POST /api/secciones
   * Crear nueva sección
   */
  create: async (data: CreateSeccionDto): Promise<ApiResponse<Seccion>> => {
    const response = await api.post('/secciones', data);
    return response.data;
  },

  /**
   * PUT /api/secciones/:id
   * Actualizar sección
   */
  update: async (id: string, data: UpdateSeccionDto): Promise<ApiResponse<Seccion>> => {
    const response = await api.put(`/secciones/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /api/secciones/:id
   * Eliminar sección (solo si no tiene participantes activos)
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/secciones/${id}`);
    return response.data;
  },

  // ============================================
  // 2. GESTIÓN DE HORARIOS
  // ============================================

  /**
   * POST /api/secciones/:id/horarios
   * Agregar horario a una sección
   */
  addHorario: async (seccionId: string, data: CreateHorarioDto): Promise<ApiResponse<HorarioSeccion>> => {
    const response = await api.post(`/secciones/${seccionId}/horarios`, data);
    return response.data;
  },

  /**
   * PUT /api/secciones/horarios/:horarioId
   * Actualizar horario
   */
  updateHorario: async (horarioId: string, data: UpdateHorarioDto): Promise<ApiResponse<HorarioSeccion>> => {
    const response = await api.put(`/secciones/horarios/${horarioId}`, data);
    return response.data;
  },

  /**
   * DELETE /api/secciones/horarios/:horarioId
   * Eliminar horario
   */
  deleteHorario: async (horarioId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/secciones/horarios/${horarioId}`);
    return response.data;
  },

  // ============================================
  // 3. GESTIÓN DE DOCENTES
  // ============================================

  /**
   * POST /api/secciones/:id/docentes
   * Asignar docente a sección (con validación de conflictos)
   */
  asignarDocente: async (seccionId: string, data: AsignarDocenteDto): Promise<ApiResponse<Seccion>> => {
    const response = await api.post(`/secciones/${seccionId}/docentes`, data);
    return response.data;
  },

  /**
   * DELETE /api/secciones/:id/docentes/:docenteId
   * Remover docente de sección
   */
  removerDocente: async (seccionId: string, docenteId: string): Promise<ApiResponse<Seccion>> => {
    const response = await api.delete(`/secciones/${seccionId}/docentes/${docenteId}`);
    return response.data;
  },

  // ============================================
  // 4. GESTIÓN DE PARTICIPANTES
  // ============================================

  /**
   * POST /api/secciones/:id/participantes
   * Inscribir participante en sección
   */
  inscribirParticipante: async (
    seccionId: string,
    data: InscribirParticipanteDto
  ): Promise<ApiResponse<ParticipacionSeccion>> => {
    const response = await api.post(`/secciones/${seccionId}/participantes`, data);
    return response.data;
  },

  /**
   * GET /api/secciones/:id/participantes
   * Listar participantes de una sección
   */
  getParticipantes: async (
    seccionId: string,
    params?: ParticipantesFilters
  ): Promise<ApiResponse<ParticipacionSeccion[]>> => {
    const response = await api.get(`/secciones/${seccionId}/participantes`, { params });
    return response.data;
  },

  /**
   * PUT /api/secciones/participaciones/:participacionId
   * Actualizar participación
   */
  updateParticipacion: async (
    participacionId: string,
    data: UpdateParticipacionDto
  ): Promise<ApiResponse<ParticipacionSeccion>> => {
    const response = await api.put(`/secciones/participaciones/${participacionId}`, data);
    return response.data;
  },

  /**
   * POST /api/secciones/participaciones/:participacionId/baja
   * Dar de baja participación (soft delete)
   */
  darDeBajaParticipacion: async (
    participacionId: string,
    data?: DarDeBajaParticipacionDto
  ): Promise<ApiResponse<ParticipacionSeccion>> => {
    const response = await api.post(`/secciones/participaciones/${participacionId}/baja`, data || {});
    return response.data;
  },

  /**
   * GET /api/personas/:personaId/secciones
   * Listar secciones de una persona
   */
  getSeccionesPorPersona: async (
    personaId: string,
    activas = true
  ): Promise<ApiResponse<ParticipacionSeccion[]>> => {
    const response = await api.get(`/personas/${personaId}/secciones`, {
      params: { activas }
    });
    return response.data;
  },

  // ============================================
  // 5. RESERVAS DE AULAS
  // ============================================

  /**
   * POST /api/secciones/:id/reservas-aulas
   * Crear reserva de aula para sección
   */
  createReservaAula: async (
    seccionId: string,
    data: CreateReservaAulaDto
  ): Promise<ApiResponse<ReservaAulaSeccion>> => {
    const response = await api.post(`/secciones/${seccionId}/reservas-aulas`, data);
    return response.data;
  },

  /**
   * PUT /api/secciones/reservas-aulas/:reservaId
   * Actualizar reserva de aula
   */
  updateReservaAula: async (
    reservaId: string,
    data: UpdateReservaAulaDto
  ): Promise<ApiResponse<ReservaAulaSeccion>> => {
    const response = await api.put(`/secciones/reservas-aulas/${reservaId}`, data);
    return response.data;
  },

  /**
   * DELETE /api/secciones/reservas-aulas/:reservaId
   * Eliminar reserva de aula
   */
  deleteReservaAula: async (reservaId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/secciones/reservas-aulas/${reservaId}`);
    return response.data;
  },

  // ============================================
  // 6. VALIDACIONES Y CONFLICTOS
  // ============================================

  /**
   * POST /api/secciones/verificar-conflictos
   * Verificar conflictos de horarios (docentes y aulas)
   */
  verificarConflictos: async (
    data: VerificarConflictosDto
  ): Promise<ApiResponse<VerificarConflictosResponse>> => {
    const response = await api.post('/secciones/verificar-conflictos', data);
    return response.data;
  },

  // ============================================
  // 7. REPORTES Y ESTADÍSTICAS
  // ============================================

  /**
   * GET /api/secciones/:id/estadisticas
   * Obtener estadísticas de una sección
   */
  getEstadisticas: async (seccionId: string): Promise<ApiResponse<EstadisticasSeccionResponse>> => {
    const response = await api.get(`/secciones/${seccionId}/estadisticas`);
    return response.data;
  },

  /**
   * GET /api/secciones/horario-semanal
   * Obtener horario semanal completo (todas las secciones por día)
   */
  getHorarioSemanal: async (): Promise<ApiResponse<HorarioSemanalResponse[]>> => {
    const response = await api.get('/secciones/horario-semanal');
    return response.data;
  },

  /**
   * GET /api/secciones/ocupacion
   * Obtener ocupación global de todas las secciones
   */
  getOcupacionGlobal: async (): Promise<ApiResponse<OcupacionGlobalResponse>> => {
    const response = await api.get('/secciones/ocupacion');
    return response.data;
  },

  /**
   * GET /api/actividades/:actividadId/secciones
   * Listar secciones de una actividad específica
   */
  getSeccionesPorActividad: async (actividadId: string): Promise<ApiResponse<Seccion[]>> => {
    const response = await api.get(`/actividades/${actividadId}/secciones`);
    return response.data;
  },

  /**
   * GET /api/personas/docentes/:docenteId/carga-horaria
   * Obtener carga horaria de un docente
   */
  getCargaHorariaDocente: async (
    docenteId: string
  ): Promise<ApiResponse<CargaHorariaDocenteResponse>> => {
    const response = await api.get(`/personas/docentes/${docenteId}/carga-horaria`);
    return response.data;
  }
};

export default seccionesApi;
