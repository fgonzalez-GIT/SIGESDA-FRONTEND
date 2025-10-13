/**
 * Constantes para el módulo de Secciones
 */

/**
 * Días de la semana con sus etiquetas en español
 */
export const DIAS_SEMANA = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' }
] as const;

/**
 * Colores para indicadores de ocupación
 */
export const OCUPACION_COLORS = {
  DISPONIBLE: 'success', // 0-50%
  PARCIAL: 'warning',    // 51-80%
  CASI_LLENA: 'orange',  // 81-99%
  LLENA: 'error'         // 100%
} as const;

/**
 * Umbrales de ocupación en porcentaje
 */
export const OCUPACION_THRESHOLDS = {
  DISPONIBLE: 50,
  PARCIAL: 80,
  CASI_LLENA: 99,
  LLENA: 100
} as const;

/**
 * Estados de participación
 */
export const ESTADO_PARTICIPACION = {
  ACTIVA: 'activa',
  INACTIVA: 'inactiva',
  BAJA: 'baja'
} as const;

/**
 * Pasos del wizard de creación de sección
 */
export const SECCION_WIZARD_STEPS = [
  'Datos Básicos',
  'Horarios',
  'Docentes',
  'Aulas (Opcional)'
] as const;
