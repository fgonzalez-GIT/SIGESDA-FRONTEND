/**
 * Types para el módulo de Equipamientos
 *
 * Equipamientos son recursos que pueden estar disponibles en aulas
 * (ej: Piano, Proyector, Pizarra, etc.)
 */

// ==================== INTERFACES PRINCIPALES ====================

/**
 * Entidad Equipamiento
 */
export interface Equipamiento {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  observaciones?: string | null;
  categoriaEquipamientoId: number;
  categoriaEquipamiento: CategoriaEquipamiento;
  activo: boolean;
  orden: number;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    aulas_equipamientos: number; // Cantidad de aulas que tienen este equipamiento
  };
}

// ==================== ENUMS Y CONSTANTES ====================

/**
 * Categoría de equipamiento (entidad del backend)
 */
export interface CategoriaEquipamiento {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  activo: boolean;
  orden: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Código de categoría (para tipos)
 */
export type CategoriaEquipamientoCodigo =
  | 'MUSICAL'
  | 'AUDIOVISUAL'
  | 'MOBILIARIO'
  | 'CLIMATIZACION'
  | 'TECNOLOGIA'
  | 'OTRO';

export const CATEGORIAS_EQUIPAMIENTO_CODIGOS: CategoriaEquipamientoCodigo[] = [
  'MUSICAL',
  'AUDIOVISUAL',
  'MOBILIARIO',
  'CLIMATIZACION',
  'TECNOLOGIA',
  'OTRO',
];

/**
 * Labels legibles para categorías (fallback si no viene del backend)
 */
export const CATEGORIA_EQUIPAMIENTO_LABELS: Record<CategoriaEquipamientoCodigo, string> = {
  MUSICAL: 'Musical',
  AUDIOVISUAL: 'Audiovisual',
  MOBILIARIO: 'Mobiliario',
  CLIMATIZACION: 'Climatización',
  TECNOLOGIA: 'Tecnología',
  OTRO: 'Otro',
};

/**
 * Colores para chips de categorías (MUI palette - fallback)
 */
export const CATEGORIA_EQUIPAMIENTO_COLORS: Record<CategoriaEquipamientoCodigo, 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' | 'default'> = {
  MUSICAL: 'secondary',
  AUDIOVISUAL: 'primary',
  MOBILIARIO: 'success',
  CLIMATIZACION: 'info',
  TECNOLOGIA: 'warning',
  OTRO: 'default',
};

// ==================== DTOs ====================

/**
 * DTO para crear equipamiento
 * Nota: El código es autogenerado por el backend
 */
export interface CreateEquipamientoDto {
  nombre: string;
  descripcion?: string;
  observaciones?: string;
  categoriaEquipamientoId: number;
  orden?: number;
}

/**
 * DTO para actualizar equipamiento
 * Nota: El código no se puede modificar una vez creado
 */
export interface UpdateEquipamientoDto {
  nombre?: string;
  descripcion?: string;
  observaciones?: string;
  categoriaEquipamientoId?: number;
  activo?: boolean;
  orden?: number;
}

// ==================== QUERY PARAMS ====================

/**
 * Parámetros para filtrar equipamientos
 */
export interface EquipamientoQueryParams {
  // Paginación
  page?: number;        // default: 1
  limit?: number;       // default: 10, max: 100 (backend NO acepta -1). Usar 100 para obtener todos.

  // Filtros
  includeInactive?: boolean;
  search?: string;
  categoria?: CategoriaEquipamiento;
}

// ==================== API RESPONSES ====================

/**
 * Response de un equipamiento
 */
export interface EquipamientoApiResponse {
  success: boolean;
  data: Equipamiento;
  message?: string;
}

/**
 * Response de lista de equipamientos
 */
export interface EquipamientoListResponse {
  success: boolean;
  data: Equipamiento[];
  total: number;
  message?: string;
}

// ==================== HELPERS ====================

/**
 * Obtiene el label legible de una categoría
 */
export const getCategoriaLabel = (categoria: CategoriaEquipamiento): string => {
  // Si categoria es un objeto (del backend), usar su nombre
  if (typeof categoria === 'object' && categoria.nombre) {
    return categoria.nombre;
  }
  // Fallback a labels hardcodeados
  return categoria.nombre || 'Sin categoría';
};

/**
 * Obtiene el color del chip de una categoría
 */
export const getCategoriaColor = (categoria: CategoriaEquipamiento): 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' | 'default' => {
  // Si categoria es un objeto y tiene color definido, usarlo
  if (typeof categoria === 'object' && categoria.color) {
    return categoria.color as any;
  }
  // Fallback a colores por código
  const codigo = (typeof categoria === 'object' ? categoria.codigo : categoria) as CategoriaEquipamientoCodigo;
  return CATEGORIA_EQUIPAMIENTO_COLORS[codigo] || 'default';
};

/**
 * Filtra equipamientos activos
 */
export const getActiveEquipamientos = (equipamientos: Equipamiento[]): Equipamiento[] => {
  return equipamientos.filter(e => e.activo);
};

/**
 * Ordena equipamientos por orden y nombre
 */
export const sortEquipamientos = (equipamientos: Equipamiento[]): Equipamiento[] => {
  return [...equipamientos].sort((a, b) => {
    if (a.orden !== b.orden) return a.orden - b.orden;
    return a.nombre.localeCompare(b.nombre);
  });
};

/**
 * Agrupa equipamientos por categoría (por código)
 */
export const groupByCategoria = (equipamientos: Equipamiento[]): Record<string, Equipamiento[]> => {
  const grouped: Record<string, Equipamiento[]> = {};

  equipamientos.forEach(eq => {
    const codigo = eq.categoriaEquipamiento?.codigo || 'SIN_CATEGORIA';
    if (!grouped[codigo]) {
      grouped[codigo] = [];
    }
    grouped[codigo].push(eq);
  });

  return grouped;
};
