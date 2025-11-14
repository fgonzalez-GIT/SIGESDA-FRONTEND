import { z } from 'zod';

/**
 * Schema Simplificado para Personas - Backend Básico
 *
 * Este schema es compatible SOLO con el backend básico que tiene 6 endpoints:
 * - GET /api/personas
 * - GET /api/personas/:id
 * - POST /api/personas
 * - PUT /api/personas/:id
 * - DELETE /api/personas/:id
 * - GET /api/tipo-persona-catalogo
 *
 * NO incluye:
 * - Sistema de múltiples tipos
 * - Gestión de contactos
 * - Validaciones complejas discriminadas
 * - Catálogos avanzados
 */

const dniRegex = /^\d{7,8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const telefonoRegex = /^[\d\s\-\+\(\)]+$/;

/**
 * Schema para crear una persona (básico)
 * Campos requeridos: nombre, apellido, dni
 * Campos opcionales: email, telefono, direccion, fechaNacimiento, observaciones
 */
export const createPersonaBasicSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres')
    .trim(),

  apellido: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede superar 100 caracteres')
    .trim(),

  dni: z.string()
    .regex(dniRegex, 'DNI debe tener 7 u 8 dígitos numéricos')
    .min(7, 'DNI debe tener al menos 7 dígitos')
    .max(8, 'DNI debe tener máximo 8 dígitos'),

  email: z.string()
    .trim()
    .transform(val => val === '' ? undefined : val)
    .pipe(
      z.string()
        .regex(emailRegex, 'Email inválido')
        .max(200, 'Email demasiado largo')
        .optional()
    ),

  telefono: z.string()
    .trim()
    .transform(val => val === '' ? undefined : val)
    .pipe(
      z.string()
        .regex(telefonoRegex, 'Teléfono contiene caracteres inválidos')
        .max(50, 'Teléfono demasiado largo')
        .optional()
    ),

  direccion: z.string()
    .trim()
    .transform(val => val === '' ? undefined : val)
    .pipe(
      z.string()
        .max(300, 'Dirección demasiado larga')
        .optional()
    ),

  fechaNacimiento: z.string()
    .trim()
    .transform(val => val === '' ? undefined : val)
    .pipe(
      z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (debe ser YYYY-MM-DD)')
        .optional()
    ),

  observaciones: z.string()
    .trim()
    .transform(val => val === '' ? undefined : val)
    .pipe(
      z.string()
        .max(1000, 'Observaciones demasiado largas')
        .optional()
    ),
});

/**
 * Schema para actualizar una persona (básico)
 * Todos los campos son opcionales
 */
export const updatePersonaBasicSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres')
    .trim()
    .optional(),

  apellido: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede superar 100 caracteres')
    .trim()
    .optional(),

  dni: z.string()
    .regex(dniRegex, 'DNI debe tener 7 u 8 dígitos numéricos')
    .min(7, 'DNI debe tener al menos 7 dígitos')
    .max(8, 'DNI debe tener máximo 8 dígitos')
    .optional(),

  email: z.string()
    .trim()
    .transform(val => val === '' ? undefined : val)
    .pipe(
      z.string()
        .regex(emailRegex, 'Email inválido')
        .max(200, 'Email demasiado largo')
        .optional()
    ),

  telefono: z.string()
    .trim()
    .transform(val => val === '' ? undefined : val)
    .pipe(
      z.string()
        .regex(telefonoRegex, 'Teléfono contiene caracteres inválidos')
        .max(50, 'Teléfono demasiado largo')
        .optional()
    ),

  direccion: z.string()
    .trim()
    .transform(val => val === '' ? undefined : val)
    .pipe(
      z.string()
        .max(300, 'Dirección demasiado larga')
        .optional()
    ),

  fechaNacimiento: z.string()
    .trim()
    .transform(val => val === '' ? undefined : val)
    .pipe(
      z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (debe ser YYYY-MM-DD)')
        .optional()
    ),

  observaciones: z.string()
    .trim()
    .transform(val => val === '' ? undefined : val)
    .pipe(
      z.string()
        .max(1000, 'Observaciones demasiado largas')
        .optional()
    ),
});

/**
 * Tipos inferidos de TypeScript desde los schemas
 */
export type CreatePersonaBasicFormData = z.infer<typeof createPersonaBasicSchema>;
export type UpdatePersonaBasicFormData = z.infer<typeof updatePersonaBasicSchema>;
