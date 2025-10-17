/**
 * Servicio API para Actividades V2.0
 * Basado en la documentación oficial del backend
 * @see /docs/API_ACTIVIDADES_V2.md
 */

import { api } from './api';
import type {
  ActividadV2,
  ActividadesQueryParams,
  ApiResponseV2,
  PaginatedResponseV2,
  CatalogosCompletos,
  CreateActividadDTO,
  UpdateActividadDTO,
  CreateHorarioDTO,
  UpdateHorarioDTO,
  AsignarDocenteDTO,
  CambiarEstadoDTO,
  DuplicarActividadDTO,
  HorarioActividad,
  DocenteActividad,
  ParticipacionActividad,
  EstadisticasActividad,
  ResumenPorTipo,
  HorarioSemanal,
  DocenteDisponible,
  TipoActividad,
  CategoriaActividad,
  EstadoActividad,
  DiaSemana,
  RolDocente,
} from '../types/actividadV2.types';

const BASE_URL = '/actividades';

// ============================================
// CATÁLOGOS
// ============================================

/**
 * Obtiene todos los catálogos en una sola petición (optimizado)
 */
export const obtenerTodosCatalogos = async (): Promise<CatalogosCompletos> => {
  const response = await api.get<ApiResponseV2<CatalogosCompletos>>(`${BASE_URL}/catalogos/todos`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al obtener catálogos');
  }
  return response.data.data;
};

/**
 * Obtiene los tipos de actividades
 */
export const obtenerTiposActividades = async (): Promise<TipoActividad[]> => {
  const response = await api.get<ApiResponseV2<TipoActividad[]>>(`${BASE_URL}/catalogos/tipos`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al obtener tipos');
  }
  return response.data.data;
};

/**
 * Obtiene las categorías de actividades
 */
export const obtenerCategoriasActividades = async (): Promise<CategoriaActividad[]> => {
  const response = await api.get<ApiResponseV2<CategoriaActividad[]>>(`${BASE_URL}/catalogos/categorias`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al obtener categorías');
  }
  return response.data.data;
};

/**
 * Obtiene los estados de actividades
 */
export const obtenerEstadosActividades = async (): Promise<EstadoActividad[]> => {
  const response = await api.get<ApiResponseV2<EstadoActividad[]>>(`${BASE_URL}/catalogos/estados`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al obtener estados');
  }
  return response.data.data;
};

/**
 * Obtiene los días de la semana
 */
export const obtenerDiasSemana = async (): Promise<DiaSemana[]> => {
  const response = await api.get<ApiResponseV2<DiaSemana[]>>(`${BASE_URL}/catalogos/dias-semana`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al obtener días de semana');
  }
  return response.data.data;
};

/**
 * Obtiene los roles de docentes
 */
export const obtenerRolesDocentes = async (): Promise<RolDocente[]> => {
  const response = await api.get<ApiResponseV2<RolDocente[]>>(`${BASE_URL}/catalogos/roles-docentes`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al obtener roles de docentes');
  }
  return response.data.data;
};

// ============================================
// CRUD DE ACTIVIDADES
// ============================================

/**
 * Crea una nueva actividad con horarios, docentes y reservas opcionales
 */
export const crearActividad = async (data: CreateActividadDTO): Promise<ActividadV2> => {
  const response = await api.post<ApiResponseV2<ActividadV2>>(BASE_URL, data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al crear actividad');
  }
  return response.data.data;
};

/**
 * Lista actividades con filtros y paginación
 */
export const listarActividades = async (
  params?: ActividadesQueryParams
): Promise<PaginatedResponseV2<ActividadV2>> => {
  const response = await api.get<ApiResponseV2<PaginatedResponseV2<ActividadV2>>>(BASE_URL, { params });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al listar actividades');
  }
  return response.data.data;
};

/**
 * Obtiene una actividad por ID
 */
export const obtenerActividadPorId = async (id: number): Promise<ActividadV2> => {
  const response = await api.get<ApiResponseV2<ActividadV2>>(`${BASE_URL}/${id}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al obtener actividad');
  }
  return response.data.data;
};

/**
 * Obtiene una actividad por código
 */
export const obtenerActividadPorCodigo = async (codigo: string): Promise<ActividadV2> => {
  const response = await api.get<ApiResponseV2<ActividadV2>>(`${BASE_URL}/codigo/${codigo}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al obtener actividad');
  }
  return response.data.data;
};

/**
 * Actualiza una actividad existente (campos opcionales)
 */
export const actualizarActividad = async (
  id: number,
  data: UpdateActividadDTO
): Promise<ActividadV2> => {
  const response = await api.patch<ApiResponseV2<ActividadV2>>(`${BASE_URL}/${id}`, data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al actualizar actividad');
  }
  return response.data.data;
};

/**
 * Elimina una actividad
 * No se puede eliminar si tiene participantes activos
 */
export const eliminarActividad = async (id: number): Promise<void> => {
  const response = await api.delete<ApiResponseV2<void>>(`${BASE_URL}/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Error al eliminar actividad');
  }
};

// ============================================
// GESTIÓN DE HORARIOS
// ============================================

/**
 * Obtiene los horarios de una actividad
 */
export const obtenerHorariosActividad = async (actividadId: number): Promise<HorarioActividad[]> => {
  const response = await api.get<ApiResponseV2<HorarioActividad[]>>(`${BASE_URL}/${actividadId}/horarios`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al obtener horarios');
  }
  return response.data.data;
};

/**
 * Agrega un horario a una actividad
 */
export const agregarHorario = async (
  actividadId: number,
  data: CreateHorarioDTO
): Promise<HorarioActividad> => {
  const response = await api.post<ApiResponseV2<HorarioActividad>>(
    `${BASE_URL}/${actividadId}/horarios`,
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al agregar horario');
  }
  return response.data.data;
};

/**
 * Actualiza un horario existente
 */
export const actualizarHorario = async (
  horarioId: number,
  data: UpdateHorarioDTO
): Promise<HorarioActividad> => {
  const response = await api.patch<ApiResponseV2<HorarioActividad>>(
    `${BASE_URL}/horarios/${horarioId}`,
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al actualizar horario');
  }
  return response.data.data;
};

/**
 * Elimina un horario
 */
export const eliminarHorario = async (horarioId: number): Promise<void> => {
  const response = await api.delete<ApiResponseV2<void>>(`${BASE_URL}/horarios/${horarioId}`);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Error al eliminar horario');
  }
};

// ============================================
// GESTIÓN DE DOCENTES
// ============================================

/**
 * Obtiene los docentes asignados a una actividad
 */
export const obtenerDocentesActividad = async (actividadId: number): Promise<DocenteActividad[]> => {
  const response = await api.get<ApiResponseV2<DocenteActividad[]>>(`${BASE_URL}/${actividadId}/docentes`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al obtener docentes');
  }
  return response.data.data;
};

/**
 * Asigna un docente a una actividad
 */
export const asignarDocente = async (
  actividadId: number,
  data: AsignarDocenteDTO
): Promise<DocenteActividad> => {
  const response = await api.post<ApiResponseV2<DocenteActividad>>(
    `${BASE_URL}/${actividadId}/docentes`,
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al asignar docente');
  }
  return response.data.data;
};

/**
 * Desasigna un docente de una actividad (soft delete)
 */
export const desasignarDocente = async (
  actividadId: number,
  docenteId: string,
  rolDocenteId: number
): Promise<DocenteActividad> => {
  const response = await api.delete<ApiResponseV2<DocenteActividad>>(
    `${BASE_URL}/${actividadId}/docentes/${docenteId}/rol/${rolDocenteId}`
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al desasignar docente');
  }
  return response.data.data;
};

/**
 * Obtiene docentes disponibles para asignar
 */
export const obtenerDocentesDisponibles = async (): Promise<DocenteDisponible[]> => {
  const response = await api.get<ApiResponseV2<DocenteDisponible[]>>(`${BASE_URL}/docentes/disponibles`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al obtener docentes disponibles');
  }
  return response.data.data;
};

// ============================================
// PARTICIPANTES
// ============================================

/**
 * Obtiene los participantes de una actividad
 */
export const obtenerParticipantes = async (actividadId: number): Promise<ParticipacionActividad[]> => {
  const response = await api.get<ApiResponseV2<ParticipacionActividad[]>>(
    `${BASE_URL}/${actividadId}/participantes`
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al obtener participantes');
  }
  return response.data.data;
};

// ============================================
// ESTADÍSTICAS
// ============================================

/**
 * Obtiene estadísticas de una actividad específica
 */
export const obtenerEstadisticasActividad = async (actividadId: number): Promise<EstadisticasActividad> => {
  const response = await api.get<ApiResponseV2<EstadisticasActividad>>(
    `${BASE_URL}/${actividadId}/estadisticas`
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al obtener estadísticas');
  }
  return response.data.data;
};

// ============================================
// REPORTES
// ============================================

/**
 * Obtiene resumen de actividades agrupadas por tipo
 */
export const obtenerResumenPorTipo = async (): Promise<ResumenPorTipo[]> => {
  const response = await api.get<ApiResponseV2<ResumenPorTipo[]>>(`${BASE_URL}/reportes/por-tipo`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al obtener resumen');
  }
  return response.data.data;
};

/**
 * Genera horario semanal completo con todas las actividades
 */
export const obtenerHorarioSemanal = async (): Promise<{
  horarioSemanal: HorarioSemanal[];
  generadoEn: string;
}> => {
  const response = await api.get<ApiResponseV2<{
    horarioSemanal: HorarioSemanal[];
    generadoEn: string;
  }>>(`${BASE_URL}/reportes/horario-semanal`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al obtener horario semanal');
  }
  return response.data.data;
};

// ============================================
// OPERACIONES ESPECIALES
// ============================================

/**
 * Cambia el estado de una actividad
 */
export const cambiarEstadoActividad = async (
  actividadId: number,
  data: CambiarEstadoDTO
): Promise<ActividadV2> => {
  const response = await api.patch<ApiResponseV2<ActividadV2>>(
    `${BASE_URL}/${actividadId}/estado`,
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al cambiar estado');
  }
  return response.data.data;
};

/**
 * Duplica una actividad existente con nuevo código y fechas
 */
export const duplicarActividad = async (
  actividadId: number,
  data: DuplicarActividadDTO
): Promise<ActividadV2> => {
  const response = await api.post<ApiResponseV2<ActividadV2>>(
    `${BASE_URL}/${actividadId}/duplicar`,
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Error al duplicar actividad');
  }
  return response.data.data;
};

// ============================================
// EXPORTAR TODO
// ============================================

export const actividadesV2Api = {
  // Catálogos
  obtenerTodosCatalogos,
  obtenerTiposActividades,
  obtenerCategoriasActividades,
  obtenerEstadosActividades,
  obtenerDiasSemana,
  obtenerRolesDocentes,

  // CRUD Actividades
  crearActividad,
  listarActividades,
  obtenerActividadPorId,
  obtenerActividadPorCodigo,
  actualizarActividad,
  eliminarActividad,

  // Horarios
  obtenerHorariosActividad,
  agregarHorario,
  actualizarHorario,
  eliminarHorario,

  // Docentes
  obtenerDocentesActividad,
  asignarDocente,
  desasignarDocente,
  obtenerDocentesDisponibles,

  // Participantes
  obtenerParticipantes,

  // Estadísticas
  obtenerEstadisticasActividad,

  // Reportes
  obtenerResumenPorTipo,
  obtenerHorarioSemanal,

  // Operaciones especiales
  cambiarEstadoActividad,
  duplicarActividad,
};

export default actividadesV2Api;
