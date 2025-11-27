import { z } from 'zod';

/**
 * Schemas Zod para validación de Equipamientos
 *
 * Compatible con Zod v4.
 */

// ==================== SCHEMAS DE EQUIPAMIENTO ====================

/**
 * Schema para crear un equipamiento
 * Nota: El código es autogenerado por el backend
 */
export const createEquipamientoSchema = z.object({
  nombre: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres')
    .trim(),

  descripcion: z
    .string()
    .max(500, 'Descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  observaciones: z
    .string()
    .max(1000, 'Observaciones no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  categoriaEquipamientoId: z
    .number({
      required_error: 'Debe seleccionar una categoría',
      invalid_type_error: 'Categoría inválida',
    })
    .int('Categoría debe ser un ID válido')
    .positive('Debe seleccionar una categoría'),

  orden: z
    .number()
    .int('Orden debe ser un número entero')
    .min(0, 'Orden no puede ser negativo')
    .optional()
    .default(0),
});

/**
 * Schema para actualizar un equipamiento
 * Nota: El código no se puede modificar una vez creado
 */
export const updateEquipamientoSchema = z.object({
  nombre: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres')
    .trim()
    .optional(),

  descripcion: z
    .string()
    .max(500, 'Descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  observaciones: z
    .string()
    .max(1000, 'Observaciones no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  categoriaEquipamientoId: z
    .number({
      invalid_type_error: 'Categoría inválida',
    })
    .int('Categoría debe ser un ID válido')
    .positive('Debe seleccionar una categoría')
    .optional(),

  activo: z.boolean().optional(),

  orden: z
    .number()
    .int('Orden debe ser un número entero')
    .min(0, 'Orden no puede ser negativo')
    .optional(),
});

// ==================== SCHEMA DE QUERY PARAMS ====================

/**
 * Schema para parámetros de búsqueda
 */
export const equipamientoQuerySchema = z.object({
  includeInactive: z.boolean().optional(),
  search: z.string().optional(),
  categoriaId: z.number().optional(),
});

// ==================== TIPOS INFERIDOS ====================

export type CreateEquipamientoFormData = z.infer<typeof createEquipamientoSchema>;
export type UpdateEquipamientoFormData = z.infer<typeof updateEquipamientoSchema>;
export type EquipamientoQueryFormData = z.infer<typeof equipamientoQuerySchema>;
