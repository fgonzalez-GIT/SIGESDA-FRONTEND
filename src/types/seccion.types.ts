// ============================================
// TIPOS BASE Y ENUMS
// ============================================

export type DiaSemana =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"
  | "DOMINGO";

export type TipoPersona = "SOCIO" | "NO_SOCIO" | "DOCENTE" | "PROVEEDOR";
export type TipoActividad = "CORO" | "CLASE_CANTO" | "CLASE_INSTRUMENTO";

// ============================================
// INTERFACES DE ENTIDADES PRINCIPALES
// ============================================

export interface Seccion {
  id: string;
  actividadId: string;
  nombre: string;
  codigo?: string;
  capacidadMaxima?: number;
  activa: boolean;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  horarios: HorarioSeccion[];
  docentes: DocenteSeccion[];
  actividad: ActividadResumen;
  _count: {
    participaciones: number;
    reservasAula: number;
  };
}

export interface SeccionDetallada extends Seccion {
  participaciones: ParticipacionSeccion[];
  reservasAula: ReservaAulaSeccion[];
}

export interface HorarioSeccion {
  id: string;
  seccionId: string;
  diaSemana: DiaSemana;
  horaInicio: string; // "HH:MM"
  horaFin: string;    // "HH:MM"
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipacionSeccion {
  id: string;
  personaId: string;
  seccionId: string;
  fechaInicio: string; // ISO date
  fechaFin?: string | null;
  precioEspecial?: string; // Decimal en formato string
  activa: boolean;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  persona: PersonaResumen;
  seccion?: SeccionResumen;
}

export interface ReservaAulaSeccion {
  id: string;
  seccionId: string;
  aulaId: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  fechaVigencia: string;
  fechaFin?: string | null;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  aula: AulaResumen;
  seccion?: SeccionResumen;
}

export interface ConflictoHorario {
  tipo: "DOCENTE" | "AULA";
  mensaje: string;
  detalles: {
    seccionId: string;
    seccionNombre: string;
    actividadNombre: string;
    diaSemana: DiaSemana;
    horaInicio: string;
    horaFin: string;
    docente?: string;
    aula?: string;
  };
}

// ============================================
// INTERFACES RESUMIDAS (para relaciones)
// ============================================

export interface ActividadResumen {
  id: string;
  nombre: string;
  tipo: TipoActividad;
  precio?: string;
}

export interface PersonaResumen {
  id: string;
  tipo: TipoPersona;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
}

export interface DocenteSeccion {
  id: string;
  nombre: string;
  apellido: string;
  especialidad?: string;
}

export interface SeccionResumen {
  id: string;
  nombre: string;
  codigo?: string;
  actividad: {
    nombre: string;
    tipo: TipoActividad;
  };
}

export interface AulaResumen {
  id: string;
  nombre: string;
  capacidad?: number;
}

// ============================================
// DTOs - REQUEST (para enviar al backend)
// ============================================

export interface CreateSeccionDto {
  actividadId: string;
  nombre: string;
  codigo?: string;
  capacidadMaxima?: number;
  activa?: boolean;
  observaciones?: string;
  docenteIds?: string[];
  horarios?: CreateHorarioDto[];
}

export interface UpdateSeccionDto {
  nombre?: string;
  codigo?: string;
  capacidadMaxima?: number;
  activa?: boolean;
  observaciones?: string;
}

export interface CreateHorarioDto {
  diaSemana: DiaSemana;
  horaInicio: string; // "HH:MM"
  horaFin: string;    // "HH:MM"
  activo?: boolean;
}

export interface UpdateHorarioDto {
  diaSemana?: DiaSemana;
  horaInicio?: string;
  horaFin?: string;
  activo?: boolean;
}

export interface AsignarDocenteDto {
  docenteId: string;
}

export interface InscribirParticipanteDto {
  personaId: string;
  fechaInicio: string; // ISO date
  fechaFin?: string | null;
  precioEspecial?: number;
  activa?: boolean;
  observaciones?: string;
}

export interface UpdateParticipacionDto {
  fechaFin?: string;
  precioEspecial?: number;
  activa?: boolean;
  observaciones?: string;
}

export interface DarDeBajaParticipacionDto {
  fechaFin?: string; // ISO date (opcional, por defecto hoy)
}

export interface CreateReservaAulaDto {
  aulaId: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  fechaVigencia: string; // ISO date
  fechaFin?: string | null;
  observaciones?: string;
}

export interface UpdateReservaAulaDto {
  fechaFin?: string;
  observaciones?: string;
}

export interface VerificarConflictosDto {
  seccionId?: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  docenteId?: string;
  aulaId?: string;
}

// ============================================
// DTOs - RESPONSE (respuestas del backend)
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VerificarConflictosResponse {
  tieneConflictos: boolean;
  conflictos: ConflictoHorario[];
}

export interface EstadisticasSeccionResponse {
  seccion: string;
  actividad: string;
  participantes: {
    total: number;
    activos: number;
    socios: number;
    noSocios: number;
  };
  ocupacion: {
    porcentaje: number;
    disponibles: number;
  };
  docentes: string[];
  aulas: string[];
  horarios: Array<{
    dia: DiaSemana;
    horario: string; // "HH:MM-HH:MM"
  }>;
}

export interface SeccionHorarioSemanal {
  seccionId: string;
  actividadNombre: string;
  seccionNombre: string;
  codigo?: string;
  docentes: string[];
  aula?: string;
  horario: string; // "HH:MM-HH:MM"
  participantes: number;
  capacidad?: number;
  ocupacion: number; // porcentaje
}

export interface HorarioSemanalResponse {
  dia: DiaSemana;
  secciones: SeccionHorarioSemanal[];
}

export interface OcupacionSeccion {
  seccionId: string;
  actividad: string;
  seccion: string;
  ocupacion: number;
  participantes: number;
  capacidad?: number;
}

export interface OcupacionGlobalResponse {
  totalSecciones: number;
  ocupacionPromedio: number;
  seccionesLlenas: number;
  seccionesDisponibles: number;
  detalle: OcupacionSeccion[];
}

export interface CargaHorariaDocente {
  seccionId: string;
  actividad: string;
  seccion: string;
  horas: number;
  dia: DiaSemana;
  horario: string;
}

export interface CargaHorariaDocenteResponse {
  docenteId: string;
  docente: string;
  totalHorasSemana: number;
  secciones: CargaHorariaDocente[];
  alerta?: {
    tipo: "SOBRECARGA";
    mensaje: string;
  };
}

// ============================================
// FILTROS Y QUERY PARAMS
// ============================================

export interface SeccionFilters {
  actividadId?: string;
  activa?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ParticipantesFilters {
  activas?: boolean;
}

// ============================================
// TIPOS AUXILIARES PARA FORMULARIOS
// ============================================

export interface HorarioInput {
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
}

export interface SeccionFormData {
  actividadId: string;
  nombre: string;
  codigo: string;
  capacidadMaxima?: number;
  activa: boolean;
  observaciones: string;
  docenteIds: string[];
  horarios: HorarioInput[];
}
