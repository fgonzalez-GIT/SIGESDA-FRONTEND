/**
 * Types para el módulo de Aulas
 *
 * Aulas del conservatorio con capacidad, equipamiento y estados de disponibilidad.
 */

export type TipoAula = 'salon' | 'ensayo' | 'auditorio' | 'exterior';

export type EstadoAula = 'disponible' | 'ocupado' | 'mantenimiento' | 'fuera_servicio';

export interface Aula {
  id: number;
  nombre: string;
  descripcion?: string;
  capacidad: number;
  ubicacion?: string;
  equipamiento?: string[]; // Frontend usa array, backend espera string separado por comas
  tipo: TipoAula;
  estado: EstadoAula;
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
  tipo: TipoAula; // REQUIRED
  estado?: EstadoAula; // default disponible
  observaciones?: string;
}

export interface UpdateAulaDto {
  nombre?: string;
  descripcion?: string;
  capacidad?: number;
  ubicacion?: string;
  equipamiento?: string[];
  tipo?: TipoAula;
  estado?: EstadoAula;
  observaciones?: string;
}

export interface AulasQueryParams {
  tipo?: string;
  estado?: string;
  capacidadMin?: number;
  capacidadMax?: number;
  equipamiento?: string;
  activa?: boolean;
  page?: number;
  limit?: number;
}

// ==================== UI HELPERS ====================

export const TIPOS_AULA: { value: TipoAula; label: string }[] = [
  { value: 'salon', label: 'Salón' },
  { value: 'ensayo', label: 'Sala de Ensayo' },
  { value: 'auditorio', label: 'Auditorio' },
  { value: 'exterior', label: 'Exterior' },
];

export const ESTADOS_AULA: { value: EstadoAula; label: string; color: string }[] = [
  { value: 'disponible', label: 'Disponible', color: 'success' },
  { value: 'ocupado', label: 'Ocupado', color: 'warning' },
  { value: 'mantenimiento', label: 'En Mantenimiento', color: 'info' },
  { value: 'fuera_servicio', label: 'Fuera de Servicio', color: 'error' },
];

export const EQUIPAMIENTO_DISPONIBLE = [
  'Piano',
  'Proyector',
  'Sistema de Audio',
  'Micrófono',
  'Pizarra',
  'Atriles',
  'Sillas',
  'Mesas',
  'Aire Acondicionado',
  'Calefacción',
];

/**
 * Obtiene el label de un tipo de aula
 */
export function getTipoAulaLabel(tipo: TipoAula): string {
  return TIPOS_AULA.find((t) => t.value === tipo)?.label || tipo;
}

/**
 * Obtiene el label de un estado de aula
 */
export function getEstadoAulaLabel(estado: EstadoAula): string {
  return ESTADOS_AULA.find((e) => e.value === estado)?.label || estado;
}

/**
 * Obtiene el color de chip para un estado de aula
 */
export function getEstadoAulaColor(
  estado: EstadoAula
): 'success' | 'warning' | 'info' | 'error' | 'default' {
  const estadoObj = ESTADOS_AULA.find((e) => e.value === estado);
  return (estadoObj?.color as any) || 'default';
}
