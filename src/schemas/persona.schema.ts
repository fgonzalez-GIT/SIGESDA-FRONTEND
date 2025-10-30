import { z } from 'zod';

// Versión simplificada compatible con Zod v4
// Los mensajes de error personalizados se agregan en las validaciones, no en la construcción

const dniRegex = /^\d{7,8}$/;
const cuitRegex = /^\d{11}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const telefonoRegex = /^[\d\s\-\+\(\)]+$/;

export const createContactoSchema = z.object({
  tipoContactoId: z.number().int().positive('Tipo de contacto requerido'),
  valor: z.string().min(1, 'Valor requerido').max(200).trim(),
  descripcion: z.string().max(200).optional().or(z.literal('')),
  esPrincipal: z.boolean().default(false),
  observaciones: z.string().max(200).optional().or(z.literal('')),
});

export const updateContactoSchema = z.object({
  tipoContactoId: z.number().int().positive().optional(),
  valor: z.string().min(1).max(200).trim().optional(),
  descripcion: z.string().max(200).optional().or(z.literal('')),
  esPrincipal: z.boolean().optional(),
  activo: z.boolean().optional(),
  observaciones: z.string().max(200).optional().or(z.literal('')),
});

const personaTipoBaseSchema = z.object({
  tipoPersonaCodigo: z.string().min(1).trim(),
  observaciones: z.string().max(500).optional().or(z.literal('')),
});

export const createTipoSocioSchema = personaTipoBaseSchema.extend({
  tipoPersonaCodigo: z.literal('SOCIO'),
  categoriaId: z.string().min(1),
});

export const createTipoDocenteSchema = personaTipoBaseSchema.extend({
  tipoPersonaCodigo: z.literal('DOCENTE'),
  especialidadId: z.number().int().positive('Especialidad requerida para docente'),
  honorariosPorHora: z.number()
    .min(0, 'Honorarios no pueden ser negativos')
    .max(1000000, 'Honorarios demasiado altos')
    .multipleOf(0.01, 'Debe tener máximo 2 decimales'),
});

export const createTipoProveedorSchema = personaTipoBaseSchema.extend({
  tipoPersonaCodigo: z.literal('PROVEEDOR'),
  cuit: z.string()
    .length(11, 'CUIT debe tener exactamente 11 dígitos')
    .regex(cuitRegex, 'CUIT debe contener solo números'),
  razonSocial: z.string().min(3, 'Razón social muy corta').max(200).trim(),
});

export const createTipoNoSocioSchema = personaTipoBaseSchema.extend({
  tipoPersonaCodigo: z.literal('NO_SOCIO'),
});

export const createPersonaTipoSchema = z.discriminatedUnion('tipoPersonaCodigo', [
  createTipoSocioSchema,
  createTipoDocenteSchema,
  createTipoProveedorSchema,
  createTipoNoSocioSchema,
  personaTipoBaseSchema.extend({
    tipoPersonaCodigo: z.string().min(1),
    categoriaId: z.string().optional(),
    especialidadId: z.number().optional(),
    honorariosPorHora: z.number().optional(),
    cuit: z.string().optional(),
    razonSocial: z.string().optional(),
  }),
]);

export const updatePersonaTipoSchema = z.object({
  categoriaId: z.string().min(1).optional(),
  especialidadId: z.number().int().positive().optional(),
  honorariosPorHora: z.number().min(0).max(1000000).multipleOf(0.01).optional(),
  cuit: z.string().regex(cuitRegex).length(11).optional(),
  razonSocial: z.string().min(3).max(200).trim().optional(),
  activo: z.boolean().optional(),
  observaciones: z.string().max(500).optional().or(z.literal('')),
});

export const createPersonaSchema = z.object({
  nombre: z.string().min(2).max(100).trim(),
  apellido: z.string().min(2).max(100).trim(),
  dni: z.string().regex(dniRegex).min(7).max(8),
  email: z.string().regex(emailRegex).max(200).trim().optional().or(z.literal('')),
  telefono: z.string().regex(telefonoRegex).max(50).optional().or(z.literal('')),
  direccion: z.string().max(300).trim().optional().or(z.literal('')),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  observaciones: z.string().max(1000).optional().or(z.literal('')),
  tipos: z.array(createPersonaTipoSchema).optional().default([]),
  contactos: z.array(createContactoSchema).optional().default([]),
}).refine(data => data.tipos && data.tipos.length > 0, {
  message: 'Debe asignar al menos un tipo a la persona',
  path: ['tipos'],
}).refine(data => {
  if (data.contactos && data.contactos.length > 0) {
    const contactosPrincipales = data.contactos.filter(c => c.esPrincipal);
    return contactosPrincipales.length <= 1;
  }
  return true;
}, {
  message: 'Solo puede haber un contacto principal',
  path: ['contactos'],
});

export const updatePersonaSchema = z.object({
  nombre: z.string().min(2).max(100).trim().optional(),
  apellido: z.string().min(2).max(100).trim().optional(),
  dni: z.string().regex(dniRegex).min(7).max(8).optional(),
  email: z.string().regex(emailRegex).max(200).trim().optional().or(z.literal('')),
  telefono: z.string().regex(telefonoRegex).max(50).optional().or(z.literal('')),
  direccion: z.string().max(300).trim().optional().or(z.literal('')),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']).optional(),
  observaciones: z.string().max(1000).optional().or(z.literal('')),
});

export const createTipoPersonaSchema = z.object({
  codigo: z.string().min(2).max(50).regex(/^[A-Z_]+$/).transform(val => val.toUpperCase()),
  nombre: z.string().min(3).max(100).trim(),
  descripcion: z.string().max(300).optional().or(z.literal('')),
  requiresCategoria: z.boolean().default(false),
  requiresEspecialidad: z.boolean().default(false),
  requiresCuit: z.boolean().default(false),
  orden: z.number().int().positive().optional(),
});

export const updateTipoPersonaSchema = z.object({
  nombre: z.string().min(3).max(100).trim().optional(),
  descripcion: z.string().max(300).optional().or(z.literal('')),
  requiresCategoria: z.boolean().optional(),
  requiresEspecialidad: z.boolean().optional(),
  requiresCuit: z.boolean().optional(),
  activo: z.boolean().optional(),
  orden: z.number().int().positive().optional(),
});

export const createEspecialidadDocenteSchema = z.object({
  codigo: z.string().min(2).max(50).regex(/^[A-Z_]+$/).transform(val => val.toUpperCase()),
  nombre: z.string().min(3).max(100).trim(),
  descripcion: z.string().max(300).optional().or(z.literal('')),
  orden: z.number().int().positive().optional(),
});

export const updateEspecialidadDocenteSchema = z.object({
  nombre: z.string().min(3).max(100).trim().optional(),
  descripcion: z.string().max(300).optional().or(z.literal('')),
  activo: z.boolean().optional(),
  orden: z.number().int().positive().optional(),
});

export const createTipoContactoSchema = z.object({
  codigo: z.string().min(2).max(50).regex(/^[A-Z_]+$/).transform(val => val.toUpperCase()),
  nombre: z.string().min(3).max(100).trim(),
  descripcion: z.string().max(300).optional().or(z.literal('')),
  icono: z.string().max(50).optional().or(z.literal('')),
  orden: z.number().int().positive().optional(),
});

export const updateTipoContactoSchema = z.object({
  nombre: z.string().min(3).max(100).trim().optional(),
  descripcion: z.string().max(300).optional().or(z.literal('')),
  icono: z.string().max(50).optional().or(z.literal('')),
  activo: z.boolean().optional(),
  orden: z.number().int().positive().optional(),
});

export const reorderCatalogoSchema = z.object({
  items: z.array(z.object({
    id: z.number().int().positive(),
    orden: z.number().int().positive(),
  })).min(1),
});

export type CreateContactoFormData = z.infer<typeof createContactoSchema>;
export type UpdateContactoFormData = z.infer<typeof updateContactoSchema>;
export type CreatePersonaTipoFormData = z.infer<typeof createPersonaTipoSchema>;
export type UpdatePersonaTipoFormData = z.infer<typeof updatePersonaTipoSchema>;
export type CreatePersonaFormData = z.infer<typeof createPersonaSchema>;
export type UpdatePersonaFormData = z.infer<typeof updatePersonaSchema>;
export type CreateTipoPersonaFormData = z.infer<typeof createTipoPersonaSchema>;
export type UpdateTipoPersonaFormData = z.infer<typeof updateTipoPersonaSchema>;
export type CreateEspecialidadDocenteFormData = z.infer<typeof createEspecialidadDocenteSchema>;
export type UpdateEspecialidadDocenteFormData = z.infer<typeof updateEspecialidadDocenteSchema>;
export type CreateTipoContactoFormData = z.infer<typeof createTipoContactoSchema>;
export type UpdateTipoContactoFormData = z.infer<typeof updateTipoContactoSchema>;
export type ReorderCatalogoFormData = z.infer<typeof reorderCatalogoSchema>;
