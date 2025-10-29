# Ejemplos de Código Backend - Personas V2

**Documento:** Ejemplos prácticos de implementación
**Para:** Equipo Backend
**Framework sugerido:** Express.js + Prisma/TypeORM/Sequelize

---

## 📁 Estructura de Carpetas Sugerida

```
src/
├── controllers/
│   ├── personas.controller.ts
│   ├── persona-tipos.controller.ts
│   ├── contactos.controller.ts
│   └── catalogos.controller.ts
├── services/
│   ├── personas.service.ts
│   ├── persona-tipos.service.ts
│   └── contactos.service.ts
├── models/
│   ├── Persona.ts
│   ├── PersonaTipo.ts
│   ├── Contacto.ts
│   └── catalogos/
│       ├── TipoPersona.ts
│       ├── EspecialidadDocente.ts
│       └── TipoContacto.ts
├── validators/
│   ├── persona.validator.ts
│   └── persona-tipo.validator.ts
└── routes/
    └── personas.routes.ts
```

---

## 🛣️ Rutas (Express.js)

### `src/routes/personas.routes.ts`

```typescript
import { Router } from 'express';
import {
  getPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
} from '../controllers/personas.controller';
import {
  getTiposPersona,
  asignarTipo,
  actualizarTipo,
  desasignarTipo,
} from '../controllers/persona-tipos.controller';
import {
  getContactos,
  createContacto,
  updateContacto,
  deleteContacto,
} from '../controllers/contactos.controller';
import {
  getCatalogos,
  getTiposPersonaCatalogo,
  getEspecialidades,
  getTiposContacto,
} from '../controllers/catalogos.controller';
import {
  validarDni,
  validarEmail,
} from '../controllers/validaciones.controller';

const router = Router();

// CRUD Básico Personas
router.get('/personas', getPersonas);
router.get('/personas/:id', getPersonaById);
router.post('/personas', createPersona);
router.put('/personas/:id', updatePersona);
router.delete('/personas/:id', deletePersona);

// Gestión de Tipos
router.get('/personas/:personaId/tipos', getTiposPersona);
router.post('/personas/:personaId/tipos', asignarTipo);
router.put('/personas/:personaId/tipos/:tipoId', actualizarTipo);
router.delete('/personas/:personaId/tipos/:tipoId', desasignarTipo);

// Gestión de Contactos
router.get('/personas/:personaId/contactos', getContactos);
router.post('/personas/:personaId/contactos', createContacto);
router.put('/personas/:personaId/contactos/:contactoId', updateContacto);
router.delete('/personas/:personaId/contactos/:contactoId', deleteContacto);

// Catálogos
router.get('/personas/catalogos/todos', getCatalogos);
router.get('/personas/catalogos/tipos-persona', getTiposPersonaCatalogo);
router.get('/personas/catalogos/especialidades-docente', getEspecialidades);
router.get('/personas/catalogos/tipos-contacto', getTiposContacto);

// Validaciones
router.get('/personas/validar/dni/:dni', validarDni);
router.get('/personas/validar/email/:email', validarEmail);

export default router;
```

---

## 🎮 Controladores

### `src/controllers/personas.controller.ts`

```typescript
import { Request, Response } from 'express';
import { PersonasService } from '../services/personas.service';
import { PersonasQueryParams } from '../types/persona.types';

const personasService = new PersonasService();

/**
 * GET /api/personas
 * Lista personas con paginación y filtros
 */
export const getPersonas = async (req: Request, res: Response) => {
  try {
    const queryParams: PersonasQueryParams = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 20, 100),
      search: req.query.search as string,
      tiposCodigos: Array.isArray(req.query.tiposCodigos)
        ? req.query.tiposCodigos as string[]
        : req.query.tiposCodigos
        ? [req.query.tiposCodigos as string]
        : undefined,
      estado: req.query.estado as 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO',
      categoriaId: req.query.categoriaId as string,
      especialidadId: req.query.especialidadId
        ? parseInt(req.query.especialidadId as string)
        : undefined,
      includeTipos: req.query.includeTipos !== 'false',
      includeContactos: req.query.includeContactos === 'true',
      includeRelaciones: req.query.includeRelaciones === 'true',
      orderBy: req.query.orderBy as string,
      orderDir: (req.query.orderDir as 'asc' | 'desc') || 'asc',
    };

    const result = await personasService.findAll(queryParams);

    return res.status(200).json({
      success: true,
      data: result.personas,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error en getPersonas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener personas',
      error: error.message,
    });
  }
};

/**
 * GET /api/personas/:id
 * Obtiene una persona por ID
 */
export const getPersonaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const includeTipos = req.query.includeTipos !== 'false';
    const includeContactos = req.query.includeContactos !== 'false';
    const includeRelaciones = req.query.includeRelaciones !== 'false';

    const persona = await personasService.findById(
      parseInt(id),
      includeTipos,
      includeContactos,
      includeRelaciones
    );

    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada',
      });
    }

    return res.status(200).json({
      success: true,
      data: persona,
    });
  } catch (error) {
    console.error('Error en getPersonaById:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener persona',
      error: error.message,
    });
  }
};

/**
 * POST /api/personas
 * Crea una nueva persona
 */
export const createPersona = async (req: Request, res: Response) => {
  try {
    const personaData = req.body;

    // Validar DNI único
    const existeDni = await personasService.existeDni(personaData.dni);
    if (existeDni) {
      return res.status(400).json({
        success: false,
        message: 'El DNI ya está registrado',
      });
    }

    // Validar email único (si se proporciona)
    if (personaData.email) {
      const existeEmail = await personasService.existeEmail(personaData.email);
      if (existeEmail) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado',
        });
      }
    }

    const persona = await personasService.create(personaData);

    return res.status(201).json({
      success: true,
      data: persona,
      message: 'Persona creada exitosamente',
    });
  } catch (error) {
    console.error('Error en createPersona:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear persona',
      error: error.message,
    });
  }
};

/**
 * PUT /api/personas/:id
 * Actualiza una persona
 */
export const updatePersona = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validar que existe
    const persona = await personasService.findById(parseInt(id));
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada',
      });
    }

    // Validar DNI único (si cambió)
    if (updateData.dni && updateData.dni !== persona.dni) {
      const existeDni = await personasService.existeDni(updateData.dni, parseInt(id));
      if (existeDni) {
        return res.status(400).json({
          success: false,
          message: 'El DNI ya está registrado',
        });
      }
    }

    // Validar email único (si cambió)
    if (updateData.email && updateData.email !== persona.email) {
      const existeEmail = await personasService.existeEmail(updateData.email, parseInt(id));
      if (existeEmail) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado',
        });
      }
    }

    const personaActualizada = await personasService.update(parseInt(id), updateData);

    return res.status(200).json({
      success: true,
      data: personaActualizada,
      message: 'Persona actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error en updatePersona:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar persona',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/personas/:id
 * Elimina una persona (soft delete)
 */
export const deletePersona = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validar que existe
    const persona = await personasService.findById(parseInt(id));
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada',
      });
    }

    // Soft delete: cambiar estado a INACTIVO
    await personasService.delete(parseInt(id));

    return res.status(200).json({
      success: true,
      message: 'Persona eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error en deletePersona:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar persona',
      error: error.message,
    });
  }
};
```

---

## 🔧 Servicios

### `src/services/personas.service.ts`

```typescript
import { Prisma, PrismaClient } from '@prisma/client';
import { PersonasQueryParams, CreatePersonaDTO, UpdatePersonaDTO } from '../types/persona.types';

const prisma = new PrismaClient();

export class PersonasService {
  /**
   * Buscar todas las personas con filtros y paginación
   */
  async findAll(params: PersonasQueryParams) {
    const {
      page = 1,
      limit = 20,
      search,
      tiposCodigos,
      estado,
      categoriaId,
      especialidadId,
      includeTipos = true,
      includeContactos = false,
      includeRelaciones = false,
      orderBy = 'apellido',
      orderDir = 'asc',
    } = params;

    // Construir filtros
    const where: Prisma.PersonaWhereInput = {};

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (estado) {
      where.estado = estado;
    }

    // Filtrar por tipos
    if (tiposCodigos && tiposCodigos.length > 0) {
      where.tipos = {
        some: {
          tipoPersonaCodigo: { in: tiposCodigos },
          activo: true,
        },
      };
    }

    // Filtrar por categoría (solo socios)
    if (categoriaId) {
      where.tipos = {
        some: {
          tipoPersonaCodigo: 'SOCIO',
          categoriaId: categoriaId,
          activo: true,
        },
      };
    }

    // Filtrar por especialidad (solo docentes)
    if (especialidadId) {
      where.tipos = {
        some: {
          tipoPersonaCodigo: 'DOCENTE',
          especialidadId: especialidadId,
          activo: true,
        },
      };
    }

    // Incluir relaciones
    const include: Prisma.PersonaInclude = {};

    if (includeTipos) {
      include.tipos = {
        where: { activo: true },
        include: includeRelaciones
          ? {
              tipoPersona: true,
              categoria: true,
              especialidad: true,
            }
          : undefined,
      };
    }

    if (includeContactos) {
      include.contactos = {
        where: { activo: true },
        include: includeRelaciones
          ? { tipoContacto: true }
          : undefined,
      };
    }

    // Paginación
    const skip = (page - 1) * limit;

    // Ejecutar queries
    const [personas, total] = await Promise.all([
      prisma.persona.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDir },
      }),
      prisma.persona.count({ where }),
    ]);

    // Agregar campos calculados
    const personasWithVirtuals = personas.map((persona) => ({
      ...persona,
      esSocio: persona.tipos?.some((t) => t.tipoPersonaCodigo === 'SOCIO' && t.activo) ?? false,
      esDocente: persona.tipos?.some((t) => t.tipoPersonaCodigo === 'DOCENTE' && t.activo) ?? false,
      esProveedor: persona.tipos?.some((t) => t.tipoPersonaCodigo === 'PROVEEDOR' && t.activo) ?? false,
    }));

    return {
      personas: personasWithVirtuals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Buscar persona por ID
   */
  async findById(
    id: number,
    includeTipos = true,
    includeContactos = true,
    includeRelaciones = true
  ) {
    const include: Prisma.PersonaInclude = {};

    if (includeTipos) {
      include.tipos = {
        include: includeRelaciones
          ? {
              tipoPersona: true,
              categoria: true,
              especialidad: true,
            }
          : undefined,
      };
    }

    if (includeContactos) {
      include.contactos = {
        include: includeRelaciones
          ? { tipoContacto: true }
          : undefined,
      };
    }

    const persona = await prisma.persona.findUnique({
      where: { id },
      include,
    });

    if (!persona) return null;

    // Agregar campos calculados
    return {
      ...persona,
      esSocio: persona.tipos?.some((t) => t.tipoPersonaCodigo === 'SOCIO' && t.activo) ?? false,
      esDocente: persona.tipos?.some((t) => t.tipoPersonaCodigo === 'DOCENTE' && t.activo) ?? false,
      esProveedor: persona.tipos?.some((t) => t.tipoPersonaCodigo === 'PROVEEDOR' && t.activo) ?? false,
    };
  }

  /**
   * Crear persona con tipos y contactos
   */
  async create(data: CreatePersonaDTO) {
    const { tipos, contactos, ...personaData } = data;

    // Generar número de socio si es necesario
    const tiposConNumero = await Promise.all(
      (tipos || []).map(async (tipo) => {
        if (tipo.tipoPersonaCodigo === 'SOCIO' && !tipo.numeroSocio) {
          const ultimoNumero = await this.obtenerUltimoNumeroSocio();
          return { ...tipo, numeroSocio: ultimoNumero + 1 };
        }
        return tipo;
      })
    );

    const persona = await prisma.persona.create({
      data: {
        ...personaData,
        estado: 'ACTIVO',
        tipos: tipos
          ? {
              create: tiposConNumero.map((tipo) => ({
                ...tipo,
                activo: true,
                fechaAsignacion: new Date(),
              })),
            }
          : undefined,
        contactos: contactos
          ? {
              create: contactos.map((contacto) => ({
                ...contacto,
                activo: true,
              })),
            }
          : undefined,
      },
      include: {
        tipos: {
          include: {
            tipoPersona: true,
            categoria: true,
            especialidad: true,
          },
        },
        contactos: {
          include: {
            tipoContacto: true,
          },
        },
      },
    });

    return {
      ...persona,
      esSocio: persona.tipos.some((t) => t.tipoPersonaCodigo === 'SOCIO' && t.activo),
      esDocente: persona.tipos.some((t) => t.tipoPersonaCodigo === 'DOCENTE' && t.activo),
      esProveedor: persona.tipos.some((t) => t.tipoPersonaCodigo === 'PROVEEDOR' && t.activo),
    };
  }

  /**
   * Actualizar persona
   */
  async update(id: number, data: UpdatePersonaDTO) {
    const persona = await prisma.persona.update({
      where: { id },
      data,
      include: {
        tipos: {
          include: {
            tipoPersona: true,
            categoria: true,
            especialidad: true,
          },
        },
        contactos: {
          include: {
            tipoContacto: true,
          },
        },
      },
    });

    return {
      ...persona,
      esSocio: persona.tipos.some((t) => t.tipoPersonaCodigo === 'SOCIO' && t.activo),
      esDocente: persona.tipos.some((t) => t.tipoPersonaCodigo === 'DOCENTE' && t.activo),
      esProveedor: persona.tipos.some((t) => t.tipoPersonaCodigo === 'PROVEEDOR' && t.activo),
    };
  }

  /**
   * Eliminar persona (soft delete)
   */
  async delete(id: number) {
    return prisma.persona.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });
  }

  /**
   * Verificar si existe DNI
   */
  async existeDni(dni: string, excludeId?: number): Promise<boolean> {
    const count = await prisma.persona.count({
      where: {
        dni,
        id: excludeId ? { not: excludeId } : undefined,
      },
    });
    return count > 0;
  }

  /**
   * Verificar si existe email
   */
  async existeEmail(email: string, excludeId?: number): Promise<boolean> {
    const count = await prisma.persona.count({
      where: {
        email,
        id: excludeId ? { not: excludeId } : undefined,
      },
    });
    return count > 0;
  }

  /**
   * Obtener último número de socio
   */
  async obtenerUltimoNumeroSocio(): Promise<number> {
    const ultimoTipo = await prisma.personaTipo.findFirst({
      where: { tipoPersonaCodigo: 'SOCIO' },
      orderBy: { numeroSocio: 'desc' },
    });

    return ultimoTipo?.numeroSocio || 0;
  }
}
```

---

## 🗄️ Modelo Prisma

### `prisma/schema.prisma`

```prisma
model Persona {
  id               Int       @id @default(autoincrement())
  nombre           String    @db.VarChar(100)
  apellido         String    @db.VarChar(100)
  dni              String    @unique @db.VarChar(20)
  email            String?   @unique @db.VarChar(255)
  fechaNacimiento  DateTime? @map("fecha_nacimiento") @db.Date
  telefono         String?   @db.VarChar(50)
  direccion        String?   @db.Text
  estado           EstadoPersona @default(ACTIVO)
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  // Relaciones
  tipos            PersonaTipo[]
  contactos        Contacto[]

  @@index([dni])
  @@index([email])
  @@index([estado])
  @@index([apellido, nombre])
  @@map("personas")
}

enum EstadoPersona {
  ACTIVO
  INACTIVO
  SUSPENDIDO
}

model PersonaTipo {
  id                  Int       @id @default(autoincrement())
  personaId           Int       @map("persona_id")
  tipoPersonaCodigo   String    @map("tipo_persona_codigo") @db.VarChar(50)

  // Campos SOCIO
  categoriaId         String?   @map("categoria_id") @db.VarChar(50)
  numeroSocio         Int?      @unique @map("numero_socio")

  // Campos DOCENTE
  especialidadId      Int?      @map("especialidad_id")
  honorariosPorHora   Decimal?  @map("honorarios_por_hora") @db.Decimal(10, 2)

  // Campos PROVEEDOR
  cuit                String?   @db.VarChar(11)
  razonSocial         String?   @map("razon_social") @db.VarChar(255)

  fechaAsignacion     DateTime  @default(now()) @map("fecha_asignacion")
  activo              Boolean   @default(true)
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // Relaciones
  persona             Persona          @relation(fields: [personaId], references: [id], onDelete: Cascade)
  tipoPersona         TipoPersona      @relation(fields: [tipoPersonaCodigo], references: [codigo])
  categoria           CategoriaSocio?  @relation(fields: [categoriaId], references: [id])
  especialidad        EspecialidadDocente? @relation(fields: [especialidadId], references: [id])

  @@unique([personaId, tipoPersonaCodigo])
  @@index([personaId])
  @@index([tipoPersonaCodigo])
  @@index([activo])
  @@map("persona_tipos")
}

model Contacto {
  id             Int       @id @default(autoincrement())
  personaId      Int       @map("persona_id")
  tipoContactoId Int       @map("tipo_contacto_id")
  valor          String    @db.VarChar(255)
  descripcion    String?   @db.Text
  esPrincipal    Boolean   @default(false) @map("es_principal")
  activo         Boolean   @default(true)
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // Relaciones
  persona        Persona      @relation(fields: [personaId], references: [id], onDelete: Cascade)
  tipoContacto   TipoContacto @relation(fields: [tipoContactoId], references: [id])

  @@index([personaId])
  @@index([tipoContactoId])
  @@index([personaId, tipoContactoId, esPrincipal])
  @@map("contactos")
}

model TipoPersona {
  id                   Int       @id @default(autoincrement())
  codigo               String    @unique @db.VarChar(50)
  nombre               String    @db.VarChar(100)
  descripcion          String?   @db.Text
  activo               Boolean   @default(true)
  orden                Int       @default(0)
  requiresCategoria    Boolean   @default(false) @map("requires_categoria")
  requiresEspecialidad Boolean   @default(false) @map("requires_especialidad")
  requiresCuit         Boolean   @default(false) @map("requires_cuit")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  // Relaciones
  personaTipos         PersonaTipo[]

  @@index([codigo])
  @@index([activo])
  @@index([orden])
  @@map("tipos_persona")
}

model EspecialidadDocente {
  id           Int       @id @default(autoincrement())
  codigo       String    @unique @db.VarChar(50)
  nombre       String    @db.VarChar(100)
  descripcion  String?   @db.Text
  activo       Boolean   @default(true)
  orden        Int       @default(0)
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  // Relaciones
  personaTipos PersonaTipo[]

  @@index([codigo])
  @@index([activo])
  @@map("especialidades_docente")
}

model TipoContacto {
  id        Int       @id @default(autoincrement())
  codigo    String    @unique @db.VarChar(50)
  nombre    String    @db.VarChar(100)
  icono     String?   @db.VarChar(50)
  activo    Boolean   @default(true)
  orden     Int       @default(0)
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  // Relaciones
  contactos Contacto[]

  @@index([codigo])
  @@index([activo])
  @@map("tipos_contacto")
}
```

---

## 📝 Notas Finales

1. **ORM:** Los ejemplos usan Prisma, pero pueden adaptarse a TypeORM, Sequelize, etc.
2. **Validación:** Agregar librería como `express-validator` o `joi`
3. **Autenticación:** Implementar middleware de autenticación según sistema usado
4. **Logging:** Usar `winston` o similar para logs estructurados
5. **Testing:** Agregar tests con Jest + Supertest

---

**Versión:** 1.0
**Framework:** Express.js + Prisma
**Lenguaje:** TypeScript
