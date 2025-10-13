import { z } from 'zod';

// ============================================
// SCHEMA PARA HORARIOS
// ============================================

export const horarioSchema = z.object({
  diaSemana: z.enum(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'], {
    message: 'Día de semana inválido'
  }),
  horaInicio: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  horaFin: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  activo: z.boolean().default(true)
}).refine(data => {
  // Validar que la hora de fin sea mayor a la hora de inicio
  const [hh1, mm1] = data.horaInicio.split(':').map(Number);
  const [hh2, mm2] = data.horaFin.split(':').map(Number);
  const inicio = hh1 * 60 + mm1;
  const fin = hh2 * 60 + mm2;
  return fin > inicio;
}, {
  message: 'La hora de fin debe ser mayor a la hora de inicio',
  path: ['horaFin']
});

// ============================================
// SCHEMA PARA CREAR SECCIÓN
// ============================================

export const createSeccionSchema = z.object({
  actividadId: z.string().min(1, 'Actividad es requerida'),
  nombre: z.string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres'),
  codigo: z.string()
    .max(50, 'Código no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  capacidadMaxima: z.number()
    .int('Capacidad debe ser un número entero')
    .positive('Capacidad debe ser un número positivo')
    .optional(),
  activa: z.boolean().default(true),
  observaciones: z.string()
    .max(500, 'Observaciones no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  docenteIds: z.array(z.string()).optional(),
  horarios: z.array(horarioSchema).optional()
});

// ============================================
// SCHEMA PARA ACTUALIZAR SECCIÓN
// ============================================

export const updateSeccionSchema = z.object({
  nombre: z.string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres')
    .optional(),
  codigo: z.string()
    .max(50, 'Código no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  capacidadMaxima: z.number()
    .int('Capacidad debe ser un número entero')
    .positive('Capacidad debe ser un número positivo')
    .optional(),
  activa: z.boolean().optional(),
  observaciones: z.string()
    .max(500, 'Observaciones no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal(''))
});

// ============================================
// SCHEMA PARA INSCRIPCIÓN
// ============================================

export const inscripcionSchema = z.object({
  personaId: z.string().min(1, 'Persona es requerida'),
  fechaInicio: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Fecha de inicio inválida'
  }),
  fechaFin: z.string()
    .refine(val => val === '' || !isNaN(Date.parse(val)), {
      message: 'Fecha de fin inválida'
    })
    .optional()
    .or(z.literal('')),
  precioEspecial: z.number()
    .positive('Precio debe ser positivo')
    .optional(),
  observaciones: z.string()
    .max(500, 'Observaciones no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  activa: z.boolean().default(true)
}).refine(data => {
  // Validar que si hay fecha fin, sea mayor a fecha inicio
  if (data.fechaFin && data.fechaFin !== '') {
    return new Date(data.fechaFin) > new Date(data.fechaInicio);
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fechaFin']
});

// ============================================
// SCHEMA PARA RESERVA DE AULA
// ============================================

export const reservaAulaSchema = z.object({
  aulaId: z.string().min(1, 'Aula es requerida'),
  diaSemana: z.enum(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'], {
    message: 'Día de semana inválido'
  }),
  horaInicio: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  horaFin: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  fechaVigencia: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Fecha de vigencia inválida'
  }),
  fechaFin: z.string()
    .refine(val => val === '' || !isNaN(Date.parse(val)), {
      message: 'Fecha de fin inválida'
    })
    .optional()
    .or(z.literal('')),
  observaciones: z.string()
    .max(500, 'Observaciones no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal(''))
}).refine(data => {
  // Validar que la hora de fin sea mayor a la hora de inicio
  const [hh1, mm1] = data.horaInicio.split(':').map(Number);
  const [hh2, mm2] = data.horaFin.split(':').map(Number);
  return (hh2 * 60 + mm2) > (hh1 * 60 + mm1);
}, {
  message: 'La hora de fin debe ser mayor a la hora de inicio',
  path: ['horaFin']
}).refine(data => {
  // Validar que si hay fecha fin, sea mayor a fecha vigencia
  if (data.fechaFin && data.fechaFin !== '') {
    return new Date(data.fechaFin) > new Date(data.fechaVigencia);
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de vigencia',
  path: ['fechaFin']
});

// ============================================
// SCHEMA PARA ASIGNAR DOCENTE
// ============================================

export const asignarDocenteSchema = z.object({
  docenteId: z.string().min(1, 'Docente es requerido')
});

// ============================================
// EXPORTAR TIPOS INFERIDOS
// ============================================

export type CreateSeccionFormData = z.infer<typeof createSeccionSchema>;
export type UpdateSeccionFormData = z.infer<typeof updateSeccionSchema>;
export type InscripcionFormData = z.infer<typeof inscripcionSchema>;
export type ReservaAulaFormData = z.infer<typeof reservaAulaSchema>;
export type HorarioFormData = z.infer<typeof horarioSchema>;
export type AsignarDocenteFormData = z.infer<typeof asignarDocenteSchema>;
