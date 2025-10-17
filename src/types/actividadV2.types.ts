/**
 * Tipos TypeScript para API de Actividades V2.0
 * Basados en la documentación oficial del backend
 * @see /docs/API_ACTIVIDADES_V2.md
 */

// ============================================
// CATÁLOGOS
// ============================================

export interface TipoActividad {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  orden: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriaActividad {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  orden: number;
  created_at?: string;
  updated_at?: string;
}

export interface EstadoActividad {
  id: number;
  codigo: 'ACTIVA' | 'INACTIVA' | 'FINALIZADA' | 'CANCELADA';
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  orden: number;
  created_at?: string;
  updated_at?: string;
}

export interface DiaSemana {
  id: number;
  codigo: 'LUN' | 'MAR' | 'MIE' | 'JUE' | 'VIE' | 'SAB' | 'DOM';
  nombre: string;
  orden: number;
}

export interface RolDocente {
  id: number;
  codigo: 'PROFESOR' | 'AYUDANTE' | 'INVITADO' | 'COORDINADOR';
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  orden: number;
  created_at?: string;
  updated_at?: string;
}

export interface CatalogosCompletos {
  tipos: TipoActividad[];
  categorias: CategoriaActividad[];
  estados: EstadoActividad[];
  diasSemana: DiaSemana[];
  rolesDocentes: RolDocente[];
}

// ============================================
// ACTIVIDADES
// ============================================

export interface HorarioActividad {
  id: number;
  actividad_id: number;
  dia_semana_id: number;
  hora_inicio: string; // Format: "HH:MM:SS"
  hora_fin: string; // Format: "HH:MM:SS"
  activo: boolean;
  created_at: string;
  updated_at: string;
  dias_semana?: DiaSemana;
  reservas_aulas_actividades?: ReservaAulaActividad[];
}

export interface DocenteActividad {
  id: number;
  actividad_id: number;
  docente_id: string; // CUID
  rol_docente_id: number;
  fecha_asignacion: string;
  fecha_desasignacion: string | null;
  activo: boolean;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
  personas?: Persona;
  roles_docentes?: RolDocente;
}

export interface ParticipacionActividad {
  id: number;
  persona_id: string; // CUID
  actividad_id: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  precio_especial: number | null;
  activo: boolean;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
  personas?: Persona;
}

export interface ReservaAulaActividad {
  id: number;
  horario_actividad_id: number;
  aula_id: string; // CUID
  fecha_reserva: string;
  activo: boolean;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
}

export interface Persona {
  persona_id: string; // CUID
  nombre: string;
  apellido: string;
  rut?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  tipo_persona?: string;
}

export interface ActividadV2 {
  id: number;
  codigo_actividad: string;
  nombre: string;
  tipo_actividad_id: number;
  categoria_id: number;
  estado_id: number;
  descripcion: string | null;
  fecha_desde: string; // ISO 8601
  fecha_hasta: string | null; // ISO 8601
  cupo_maximo: number | null;
  costo: number;
  observaciones: string | null;
  created_at: string;
  updated_at: string;

  // Relaciones opcionales
  tipos_actividades?: TipoActividad;
  categorias_actividades?: CategoriaActividad;
  estados_actividades?: EstadoActividad;
  horarios_actividades?: HorarioActividad[];
  docentes_actividades?: DocenteActividad[];
  participaciones_actividades?: ParticipacionActividad[];
  reservas_aulas_actividades?: ReservaAulaActividad[];

  // Campo calculado
  _count_participantes?: number;
}

// ============================================
// DTOs - REQUEST/RESPONSE
// ============================================

export interface CreateActividadDTO {
  codigoActividad: string;
  nombre: string;
  tipoActividadId: number;
  categoriaId: number;
  estadoId?: number; // Default: 1 (ACTIVA)
  descripcion?: string | null;
  fechaDesde: string; // ISO 8601
  fechaHasta?: string | null; // ISO 8601
  cupoMaximo?: number | null;
  costo?: number; // Default: 0
  observaciones?: string | null;
  horarios?: CreateHorarioDTO[];
  docentes?: AsignarDocenteDTO[];
  reservasAulas?: CreateReservaAulaDTO[];
}

export interface UpdateActividadDTO {
  codigoActividad?: string;
  nombre?: string;
  tipoActividadId?: number;
  categoriaId?: number;
  estadoId?: number;
  descripcion?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  cupoMaximo?: number;
  costo?: number;
  observaciones?: string;
}

export interface CreateHorarioDTO {
  diaSemanaId: number;
  horaInicio: string; // Format: "HH:MM" or "HH:MM:SS"
  horaFin: string; // Format: "HH:MM" or "HH:MM:SS"
  activo?: boolean; // Default: true
}

export interface UpdateHorarioDTO {
  diaSemanaId?: number;
  horaInicio?: string;
  horaFin?: string;
  activo?: boolean;
}

export interface AsignarDocenteDTO {
  docenteId: string; // CUID
  rolDocenteId: number;
  observaciones?: string;
}

export interface CreateReservaAulaDTO {
  horarioActividadId: number;
  aulaId: string; // CUID
  fechaReserva: string; // ISO 8601
  observaciones?: string;
}

export interface CambiarEstadoDTO {
  nuevoEstadoId: number;
  observaciones?: string;
}

export interface DuplicarActividadDTO {
  nuevoCodigoActividad: string;
  nuevoNombre: string;
  nuevaFechaDesde: string; // ISO 8601
  nuevaFechaHasta?: string; // ISO 8601
  copiarHorarios?: boolean; // Default: true
  copiarDocentes?: boolean; // Default: false
  copiarReservasAulas?: boolean; // Default: false
}

// ============================================
// FILTROS Y QUERY PARAMS
// ============================================

export interface ActividadesQueryParams {
  // Paginación
  page?: number;
  limit?: number;

  // Filtros
  tipoActividadId?: number;
  categoriaId?: number;
  estadoId?: number;
  diaSemanaId?: number; // 1-7
  docenteId?: string; // CUID
  aulaId?: string; // CUID
  conCupo?: boolean;
  vigentes?: boolean;
  costoDesde?: number;
  costoHasta?: number;
  search?: string;

  // Opciones
  incluirRelaciones?: boolean; // Default: true
  orderBy?: 'nombre' | 'codigo' | 'fechaDesde' | 'costo' | 'cupoMaximo' | 'created_at';
  orderDir?: 'asc' | 'desc';
}

// ============================================
// RESPUESTAS DE API
// ============================================

export interface ApiResponseV2<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponseV2<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ActividadesListResponse extends ApiResponseV2<PaginatedResponseV2<ActividadV2>> {}

export interface ActividadResponse extends ApiResponseV2<ActividadV2> {}

export interface CatalogosResponse extends ApiResponseV2<CatalogosCompletos> {}

// ============================================
// ESTADÍSTICAS Y REPORTES
// ============================================

export interface EstadisticasActividad {
  actividadId: number;
  nombreActividad: string;
  totalParticipantes: number;
  totalHorarios: number;
  totalDocentes: number;
  totalReservasAulas: number;
  cupoMaximo: number | null;
  cupoDisponible: number | null;
  porcentajeOcupacion: number;
  costo: number;
  estado: string;
  vigente: boolean;
  fechaDesde: string;
  fechaHasta: string | null;
}

export interface ResumenPorTipo {
  tipo: TipoActividad;
  totalActividades: number;
  actividades: Array<{
    id: number;
    codigo: string;
    nombre: string;
    cupoMaximo: number | null;
    costo: number;
  }>;
}

export interface HorarioSemanalActividad {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  horarios: Array<{
    horaInicio: string;
    horaFin: string;
    aula?: string;
  }>;
  docentes: Array<{
    nombre: string;
    rol: string;
  }>;
}

export interface HorarioSemanal {
  dia: DiaSemana;
  actividades: HorarioSemanalActividad[];
}

export interface HorarioSemanalResponse extends ApiResponseV2<{
  horarioSemanal: HorarioSemanal[];
  generadoEn: string;
}> {}

// ============================================
// DOCENTES DISPONIBLES
// ============================================

export interface DocenteDisponible {
  persona_id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  tipo_persona: string;
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Formatea una hora de formato "HH:MM:SS" a "HH:MM"
 */
export const formatTime = (time: string | null | undefined): string => {
  if (!time) return '';
  return time.slice(0, 5);
};

/**
 * Convierte una fecha ISO 8601 a formato "YYYY-MM-DD"
 */
export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '';
  return date.split('T')[0];
};

/**
 * Verifica si una actividad está vigente según sus fechas
 */
export const isActividadVigente = (actividad: ActividadV2): boolean => {
  const now = new Date();
  const desde = new Date(actividad.fecha_desde);
  const hasta = actividad.fecha_hasta ? new Date(actividad.fecha_hasta) : null;

  return desde <= now && (!hasta || hasta >= now);
};

/**
 * Calcula el cupo disponible de una actividad
 */
export const getCupoDisponible = (actividad: ActividadV2): number | null => {
  if (!actividad.cupo_maximo) return null;
  const participantes = actividad._count_participantes || 0;
  return Math.max(0, actividad.cupo_maximo - participantes);
};

/**
 * Verifica si una actividad tiene cupo disponible
 */
export const hasCupoDisponible = (actividad: ActividadV2): boolean => {
  const cupoDisponible = getCupoDisponible(actividad);
  return cupoDisponible === null || cupoDisponible > 0;
};
