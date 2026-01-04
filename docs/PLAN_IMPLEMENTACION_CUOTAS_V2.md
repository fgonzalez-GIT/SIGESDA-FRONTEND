# Plan de Implementación: Sistema de Generación de Cuotas de Socios V2
## ARQUITECTURA BASADA EN ÍTEMS CONFIGURABLES

**Proyecto**: SIGESDA Backend
**Fecha de elaboración**: 2025-12-12
**Versión del documento**: 1.0
**Autor**: Equipo de Desarrollo SIGESDA

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Contexto y Justificación](#contexto-y-justificación)
3. [Objetivos del Plan](#objetivos-del-plan)
4. [Arquitectura Propuesta](#arquitectura-propuesta)
5. [Plan de Implementación por Fases](#plan-de-implementación-por-fases)
6. [Cronograma y Recursos](#cronograma-y-recursos)
7. [Gestión de Riesgos](#gestión-de-riesgos)
8. [Criterios de Aceptación](#criterios-de-aceptación)
9. [Anexos](#anexos)

---

## Resumen Ejecutivo

### Alcance del Proyecto

Este plan describe la implementación de un **Sistema de Generación de Cuotas de Socios completamente rediseñado** basado en una arquitectura de **ítems configurables**, que reemplaza el modelo actual de campos fijos (`montoBase`, `montoActividades`) por un sistema flexible que permite:

- **Gestión dinámica de ítems de cuota** (base, actividades, descuentos, recargos, bonificaciones)
- **Motor de reglas de descuentos configurables** (acumulativos, exclusivos, mixtos)
- **Cuota familiar con responsable financiero**
- **Herramientas de simulación y ajuste manual** (pre/post generación)
- **Optimización de performance** (generación masiva en batch)

### Duración Total Estimada

**30-40 días laborables** (~6-8 semanas)

### Fases del Plan

| Fase | Nombre | Duración | Prioridad |
|------|--------|----------|-----------|
| **Fase 0** | Preparación y Análisis | 1-2 días | 🔴 CRÍTICA |
| **Fase 1** | Fixes Críticos (Bloqueantes) | 2-3 días | 🔴 CRÍTICA |
| **Fase 2** | Diseño del Sistema de Ítems | 3-4 días | 🔴 ALTA |
| **Fase 3** | Motor de Reglas de Descuentos | 4-5 días | 🟡 ALTA |
| **Fase 4** | Funcionalidades Pendientes | 5-6 días | 🟡 ALTA |
| **Fase 5** | Herramientas de Ajuste y Simulación | 4-5 días | 🟢 MEDIA |
| **Fase 6** | Optimización de Performance | 3-4 días | 🟢 MEDIA |
| **Fase 7** | Tests y Calidad de Código | 4-5 días | 🟢 MEDIA-ALTA |
| **Fase 8** | Features Adicionales y Mejoras | 5-6 días | 🔵 BAJA (Opcional) |

### Hitos Principales

- **Milestone 1** (Fin Semana 1): Sistema estable con Architecture V2
- **Milestone 2** (Fin Semana 3): Sistema de ítems configurables operativo
- **Milestone 3** (Fin Semana 5): Motor de descuentos y cuota familiar funcionando
- **Milestone 4** (Fin Semana 7): Sistema completo con tests y optimizaciones
- **Milestone 5** (Semana 8+): Features avanzadas (opcional)

---

## Contexto y Justificación

### Estado Actual del Sistema

#### ✅ Lo que Funciona

- **CRUD básico de cuotas**: Endpoints implementados y funcionales
- **Generación masiva**: Genera cuotas para todos los socios de un período
- **Descuentos por categoría**: ESTUDIANTE (40%), JUBILADO (25%) - hardcoded
- **Validaciones básicas**: Recibo CUOTA, período válido, no modificar pagadas
- **Numeración automática**: Secuencial para recibos

#### ❌ Problemas Críticos Detectados

1. **BUG CRÍTICO: Repository usa Architecture V1**
   - **Archivo**: `src/repositories/cuota.repository.ts:603`
   - **Problema**: Query usa campo legacy `personas.tipo = 'SOCIO'`
   - **Impacto**: Generación masiva NO funciona con Architecture V2
   - **Prioridad**: 🔴 BLOQUEANTE

2. **Constraint único problemático**
   - **Schema**: `@@unique([categoriaId, mes, anio])` en tabla `cuotas`
   - **Problema**: Permite solo 1 cuota por categoría/período
   - **Impacto**: Puede bloquear múltiples socios de misma categoría

3. **Race condition en numeración de recibos**
   - **Problema**: Generaciones concurrentes pueden obtener mismo número
   - **Impacto**: Falla por violación de constraint único

#### ⚠️ Funcionalidades Incompletas

1. **Cálculo de actividades**: Método retorna siempre `0` (STUB)
2. **Descuentos familiares**: No implementados (tabla `familiares.descuento` existe pero no se usa)
3. **Descuentos hardcoded**: Porcentajes en código en lugar de configuración
4. **Sin tests automatizados**: Solo tests manuales en `.http`

### Justificación del Rediseño

#### Necesidades del Negocio

1. **Flexibilidad de ítems**: Usuarios necesitan agregar conceptos dinámicamente (descuentos especiales, recargos, bonificaciones)
2. **Configuración de descuentos**: Cada organización tiene reglas diferentes (acumulativos vs exclusivos)
3. **Cuota familiar**: Modelo complejo con responsable financiero que paga por todo el grupo
4. **Ajustes manuales**: Necesidad de corregir cuotas post-generación o simular antes de confirmar

#### Beneficios Esperados

- ✅ **Flexibilidad total**: Admin puede crear nuevos tipos de ítems sin modificar código
- ✅ **Transparencia**: Desglose detallado de cada concepto en la cuota
- ✅ **Auditoría completa**: Historial de modificaciones manuales
- ✅ **Performance**: 20x más rápido en generación masiva (batch inserts)
- ✅ **Mantenibilidad**: Lógica de descuentos centralizada y configurable

---

## Objetivos del Plan

### Objetivos Generales

1. **Migrar** el sistema de cuotas de modelo fijo a arquitectura de ítems configurables
2. **Implementar** motor de reglas de descuentos flexibles y configurables
3. **Completar** funcionalidades pendientes (actividades, cuota familiar)
4. **Optimizar** performance de generación masiva (batch inserts)
5. **Asegurar** calidad con suite completa de tests automatizados

### Objetivos Específicos por Fase

#### Fase 1: Fixes Críticos
- Migrar queries a Architecture V2
- Resolver race condition en numeración
- Validar constraint único de tabla cuotas

#### Fase 2: Sistema de Ítems
- Crear schema de `tipos_items_cuota` e `items_cuota`
- Migrar datos legacy a nuevo modelo
- Implementar CRUD de ítems

#### Fase 3: Motor de Descuentos
- Diseñar schema de reglas de descuentos
- Implementar 4 modos de aplicación (acumulativo, exclusivo, máximo, personalizado)
- Eliminar descuentos hardcoded

#### Fase 4: Funcionalidades Pendientes
- Implementar cálculo real de actividades
- Implementar cuota familiar con responsable financiero
- Agregar prorrateo configurable

#### Fase 5: Ajuste y Simulación
- Modo dry-run (simulación pre-generación)
- Edición de ítems post-generación
- Anulación y regeneración transaccional

#### Fase 6: Optimización
- Batch inserts (20x más rápido)
- Caché de configuraciones
- Resolver race conditions

#### Fase 7: Calidad
- Tests unitarios (80%+ cobertura)
- Tests de integración
- Tests E2E
- Documentación Swagger

#### Fase 8: Features Adicionales (Opcional)
- Notificaciones por email
- Recargos por mora automáticos
- Dashboard avanzado
- Reportes Excel/PDF

---

## Arquitectura Propuesta

### Modelo de Datos - Schema Prisma

#### Nuevos Modelos

##### 1. Catálogo de Tipos de Ítems

```prisma
model TipoItemCuota {
  id              Int       @id @default(autoincrement())
  codigo          String    @unique  // CUOTA_BASE, CUOTA_FAMILIAR, ACTIVIDAD, etc.
  nombre          String
  descripcion     String?
  categoria       CategoriaItem  // BASE, ACTIVIDAD, DESCUENTO, RECARGO, OTRO
  esCalculado     Boolean   @default(true)   // true=automático, false=manual
  formula         String?   // JSON con lógica de cálculo
  activo          Boolean   @default(true)
  orden           Int       @default(0)
  configurable    Boolean   @default(true)   // ¿Usuario puede editarlo?

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  itemsCuota      ItemCuota[]

  @@map("tipos_items_cuota")
}

enum CategoriaItem {
  BASE          // Cuota socio base, cuota familiar
  ACTIVIDAD     // Costo de actividades
  DESCUENTO     // Descuentos (categoría, familiar, múltiple actividad)
  RECARGO       // Recargos (mora, otros)
  BONIFICACION  // Bonificaciones especiales
  OTRO          // Otros conceptos
}
```

##### 2. Ítems de Cuota (Instancias)

```prisma
model ItemCuota {
  id              Int       @id @default(autoincrement())
  cuotaId         Int
  tipoItemId      Int
  concepto        String    // Descripción del ítem
  monto           Decimal   @db.Decimal(10, 2)
  cantidad        Decimal   @default(1) @db.Decimal(8, 2)  // Para ítems con qty
  porcentaje      Decimal?  @db.Decimal(5, 2)  // Para descuentos/recargos %
  esAutomatico    Boolean   @default(true)     // true=calculado, false=manual
  esEditable      Boolean   @default(false)    // ¿Se puede editar post-generación?
  observaciones   String?
  metadata        Json?     // Datos adicionales (actividadId, familiarId, etc.)

  cuota           Cuota     @relation(fields: [cuotaId], references: [id], onDelete: Cascade)
  tipoItem        TipoItemCuota @relation(fields: [tipoItemId], references: [id])

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  @@index([cuotaId])
  @@index([tipoItemId])
  @@map("items_cuota")
}
```

##### 3. Reglas de Descuentos

```prisma
model ReglaDescuento {
  id              Int       @id @default(autoincrement())
  codigo          String    @unique
  nombre          String
  descripcion     String?
  prioridad       Int       @default(0)      // Orden de aplicación
  modoAplicacion  ModoAplicacionDescuento   // ACUMULATIVO, EXCLUSIVO, etc.
  maxDescuento    Decimal?  @db.Decimal(5, 2)  // % máximo permitido
  condiciones     Json      // Condiciones para aplicar
  formula         Json      // Fórmula de cálculo
  activa          Boolean   @default(true)

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  @@map("reglas_descuentos")
}

enum ModoAplicacionDescuento {
  ACUMULATIVO    // Suma todos los descuentos aplicables
  EXCLUSIVO      // Solo aplica el mayor descuento
  MAXIMO         // Aplica descuentos hasta llegar a un máximo total
  PERSONALIZADO  // Usa lógica custom definida en formula
}
```

##### 4. Configuración de Descuentos

```prisma
model ConfiguracionDescuentos {
  id                      Int       @id @default(autoincrement())
  limiteDescuentoTotal    Decimal   @default(80) @db.Decimal(5, 2)  // % máximo
  aplicarDescuentosAActividades Boolean @default(true)
  prioridadReglas         Json      // Array de IDs de reglas en orden
  activa                  Boolean   @default(true)

  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")

  @@map("configuracion_descuentos")
}
```

##### 5. Grupos Familiares

```prisma
model GrupoFamiliar {
  id                      Int       @id @default(autoincrement())
  nombre                  String
  responsableFinancieroId Int       // Persona que paga la cuota familiar
  montoCuotaFamiliar      Decimal   @db.Decimal(10, 2)
  activo                  Boolean   @default(true)

  responsable             Persona   @relation("ResponsableFinanciero")
  miembros                Familiar[] @relation("MiembrosGrupo")

  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")

  @@index([responsableFinancieroId])
  @@index([activo])
  @@map("grupos_familiares")
}
```

##### 6. Auditoría de Ítems

```prisma
model AuditoriaItemCuota {
  id              Int       @id @default(autoincrement())
  itemCuotaId     Int
  accion          AccionAuditoria  // CREAR, MODIFICAR, ELIMINAR
  usuarioId       Int?
  valorAnterior   Json?
  valorNuevo      Json?
  observaciones   String?

  createdAt       DateTime  @default(now()) @map("created_at")

  @@map("auditoria_items_cuota")
}

enum AccionAuditoria {
  CREAR
  MODIFICAR
  ELIMINAR
}
```

#### Modificaciones a Modelos Existentes

##### Modelo Cuota (Modificado)

```prisma
model Cuota {
  id                    Int       @id @default(autoincrement())
  reciboId              Int       @unique
  mes                   Int
  anio                  Int
  categoriaId           Int

  // ⚠️ DEPRECAR estos campos (mantener temporalmente para migración)
  montoBase             Decimal?  @db.Decimal(8, 2)
  montoActividades      Decimal?  @db.Decimal(8, 2)

  // ✅ NUEVO: Monto total calculado desde ítems
  montoTotal            Decimal   @db.Decimal(8, 2)

  // ✅ NUEVO: Relación con ítems
  items                 ItemCuota[]

  categoria             CategoriaSocio @relation(...)
  recibo                Recibo         @relation(...)

  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  @@unique([categoriaId, mes, anio])  // ⚠️ REVISAR en Fase 1
  @@index([categoriaId])
  @@map("cuotas")
}
```

### Tipos de Ítems Predefinidos

Los siguientes tipos de ítems se crearán en el seed inicial:

| Código | Nombre | Categoría | Es Calculado | Configurable |
|--------|--------|-----------|--------------|--------------|
| `CUOTA_BASE_SOCIO` | Cuota Base Socio | BASE | ✅ Sí | ✅ Sí |
| `CUOTA_FAMILIAR` | Cuota Familiar | BASE | ✅ Sí | ✅ Sí |
| `ACTIVIDAD_INDIVIDUAL` | Actividad Individual | ACTIVIDAD | ✅ Sí | ✅ Sí |
| `DESCUENTO_CATEGORIA` | Descuento por Categoría | DESCUENTO | ✅ Sí | ✅ Sí |
| `DESCUENTO_FAMILIAR` | Descuento Familiar | DESCUENTO | ✅ Sí | ✅ Sí |
| `DESCUENTO_MULTIPLES_ACT` | Descuento Múltiples Actividades | DESCUENTO | ✅ Sí | ✅ Sí |
| `RECARGO_MORA` | Recargo por Mora | RECARGO | ✅ Sí | ✅ Sí |
| `BONIFICACION_ESPECIAL` | Bonificación Especial | BONIFICACION | ❌ No | ✅ Sí |
| `OTRO_CONCEPTO` | Otro Concepto | OTRO | ❌ No | ✅ Sí |

### Flujo de Generación de Cuotas (Nuevo)

```
┌─────────────────────────────────────────────────────────────────┐
│                    GENERACIÓN DE CUOTAS V2                      │
└─────────────────────────────────────────────────────────────────┘

1. ENTRADA: { mes, anio, categoriaIds?, dryRun? }
           ↓
2. OBTENER SOCIOS ELEGIBLES (Architecture V2)
   - Consultar personas con tipo SOCIO activo
   - Filtrar por categorías (si aplica)
   - Excluir socios que ya tienen cuota del período
           ↓
3. CALCULAR ÍTEMS POR SOCIO (en paralelo)
   ┌──────────────────────────────────────────┐
   │ 3.1. Calcular Cuota Base                 │
   │      - Obtener de categorias_socios      │
   │      - O de configuración personalizada  │
   │                                          │
   │ 3.2. Calcular Cuota Familiar             │
   │      - Si es responsable financiero      │
   │      - Monto fijo del grupo              │
   │                                          │
   │ 3.3. Calcular Actividades                │
   │      - Participaciones activas           │
   │      - Precio especial o costo normal    │
   │                                          │
   │ 3.4. Aplicar Descuentos (Motor Reglas)   │
   │      - Descuento categoría               │
   │      - Descuento familiar                │
   │      - Descuento múltiples actividades   │
   │      - Aplicar según modo configurado    │
   │                                          │
   │ 3.5. Aplicar Recargos/Bonificaciones     │
   │      - Recargos automáticos              │
   │      - Bonificaciones especiales         │
   └──────────────────────────────────────────┘
           ↓
4. VALIDAR ÍTEMS
   - Límite de descuento total no excedido
   - Montos dentro de rangos válidos
   - Lógica de negocio consistente
           ↓
5. SI dryRun = true → RETORNAR SIMULACIÓN
   SI dryRun = false → CONTINUAR
           ↓
6. GENERAR EN BATCH (Transacción única)
   ┌──────────────────────────────────────────┐
   │ 6.1. Crear Recibos (batch)               │
   │      - Números secuenciales seguros      │
   │                                          │
   │ 6.2. Crear Cuotas (batch)                │
   │      - Vincular a recibos                │
   │                                          │
   │ 6.3. Crear Ítems de Cuotas (batch)       │
   │      - Todos los ítems calculados        │
   └──────────────────────────────────────────┘
           ↓
7. SALIDA: { generadas, errores, cuotas[] }
```

---

## Plan de Implementación por Fases

---

## FASE 0: Preparación y Análisis

**Duración**: 1-2 días
**Prioridad**: 🔴 CRÍTICA
**Responsable**: DevOps + Tech Lead

### Objetivos

- Crear backups de seguridad
- Documentar estado actual
- Preparar entorno de testing
- Establecer línea base para métricas

### Tareas Detalladas

#### 0.1. Backup y Versionamiento

**Tareas**:
- [ ] Crear backup completo de base de datos PostgreSQL
- [ ] Exportar schema actual con `pg_dump`
- [ ] Crear branch de desarrollo: `feature/cuotas-items-system`
- [ ] Documentar versión actual de dependencias (`package.json`)

**Comandos**:
```bash
# Backup de base de datos
pg_dump -h localhost -U postgres -d sigesda > backup_sigesda_$(date +%Y%m%d).sql

# Crear branch de desarrollo
git checkout -b feature/cuotas-items-system

# Tag de versión actual
git tag -a v1.0-pre-items-refactor -m "Estado antes de refactor de ítems"
```

#### 0.2. Dataset de Prueba

**Tareas**:
- [ ] Crear script de seed con 50+ socios de prueba
- [ ] Incluir socios de todas las categorías (ACTIVO, ESTUDIANTE, FAMILIAR, JUBILADO)
- [ ] Crear grupos familiares de prueba (3+ grupos con 2-5 integrantes)
- [ ] Crear participaciones en actividades (15+ socios con actividades)
- [ ] Crear relaciones familiares con descuentos

**Archivo**: `prisma/seed-test-cuotas.ts`

```typescript
async function seedTestCuotas() {
  // 50 socios: 25 ACTIVO, 15 ESTUDIANTE, 7 FAMILIAR, 3 JUBILADO
  // 3 grupos familiares
  // 20 participaciones en actividades
  // 10 relaciones familiares con descuento
}
```

#### 0.3. Documentación del Estado Actual

**Tareas**:
- [ ] Documentar queries SQL actuales más comunes
- [ ] Listar todas las configuraciones en `configuracion_sistema`
- [ ] Registrar métricas de performance actuales (tiempo generación 100 cuotas)
- [ ] Crear matriz de trazabilidad de features

**Archivo**: `docs/ESTADO_ACTUAL_CUOTAS.md`

#### 0.4. Configuración de Entorno de Testing

**Tareas**:
- [ ] Instalar Jest y Supertest: `npm install -D jest @types/jest ts-jest supertest @types/supertest`
- [ ] Configurar Jest: `jest.config.js`
- [ ] Crear base de datos de testing: `sigesda_test`
- [ ] Configurar `.env.test` con conexión a DB de test

**Archivo**: `jest.config.js`
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Entregables

- ✅ Backup de base de datos (archivo `.sql`)
- ✅ Branch `feature/cuotas-items-system` activo
- ✅ Dataset de prueba con 50+ socios
- ✅ Documento `ESTADO_ACTUAL_CUOTAS.md`
- ✅ Entorno de testing configurado

### Criterios de Aceptación

- ✅ Backup restaurable y validado
- ✅ Branch creado y pusheado a repositorio
- ✅ Seed de prueba ejecutable con `npm run db:seed:test`
- ✅ Tests de ejemplo pasan: `npm test`

---

## FASE 1: Fixes Críticos (Bloqueantes)

**Duración**: 2-3 días
**Prioridad**: 🔴 CRÍTICA
**Responsable**: Backend Developer Senior

### Objetivos

- Corregir bugs que rompen funcionalidad actual
- Asegurar compatibilidad con Architecture V2
- Estabilizar sistema existente antes de refactor mayor
- Resolver race conditions

### Tareas Detalladas

#### 1.1. Migrar `getCuotasPorGenerar()` a Architecture V2

**Archivo**: `src/repositories/cuota.repository.ts`
**Líneas a modificar**: 600-650

**Problema actual**:
```typescript
// ❌ LÍNEA 603: Usa campo legacy
const wherePersona: any = {
  tipo: 'SOCIO',        // Campo deprecado
  fechaBaja: null
};
```

**Solución**:
```typescript
// ✅ Architecture V2
async getCuotasPorGenerar(
  mes: number,
  anio: number,
  categorias?: number[]
): Promise<PersonaConCategoria[]> {

  // Construir filtro de categorías
  const whereCategoria = categorias && categorias.length > 0
    ? { id: { in: categorias } }
    : {};

  // Obtener socios activos usando Architecture V2
  const sociosActivos = await this.prisma.persona.findMany({
    where: {
      activo: true,
      tipos: {
        some: {
          activo: true,
          tipoPersona: {
            codigo: 'SOCIO'
          },
          categoria: whereCategoria
        }
      }
    },
    include: {
      tipos: {
        where: {
          activo: true,
          tipoPersona: { codigo: 'SOCIO' }
        },
        include: {
          categoria: true,
          tipoPersona: true
        }
      }
    }
  });

  // Filtrar socios que ya tienen cuota en este período
  const cuotasExistentes = await this.prisma.cuota.findMany({
    where: { mes, anio },
    include: {
      recibo: {
        select: { receptorId: true }
      }
    }
  });

  const sociosConCuota = new Set(
    cuotasExistentes.map(c => c.recibo.receptorId)
  );

  // Retornar socios sin cuota
  return sociosActivos
    .filter(socio => !sociosConCuota.has(socio.id))
    .map(socio => ({
      id: socio.id,
      nombre: socio.nombre,
      apellido: socio.apellido,
      dni: socio.dni,
      email: socio.email,
      categoria: socio.tipos[0].categoria,  // Primera categoría SOCIO activa
      categoriaId: socio.tipos[0].categoriaId
    }));
}
```

**Tests a crear**:
```typescript
// tests/unit/repositories/cuota.repository.test.ts
describe('CuotaRepository.getCuotasPorGenerar', () => {
  it('debe obtener socios con Architecture V2', async () => {
    // Crear socio V2 (sin campo tipo, solo en persona_tipo)
    const socioV2 = await crearSocioV2({ categoria: 'ACTIVO' });

    const socios = await cuotaRepository.getCuotasPorGenerar(3, 2025);

    expect(socios).toContainEqual(
      expect.objectContaining({ id: socioV2.id })
    );
  });

  it('debe excluir socios con tipo inactivo', async () => {
    const socio = await crearSocioV2({ categoria: 'ACTIVO' });
    await desactivarTipoSocio(socio.id);

    const socios = await cuotaRepository.getCuotasPorGenerar(3, 2025);

    expect(socios).not.toContainEqual(
      expect.objectContaining({ id: socio.id })
    );
  });

  it('debe excluir socios que ya tienen cuota del período', async () => {
    const socio = await crearSocioV2({ categoria: 'ACTIVO' });
    await crearCuota({ socioId: socio.id, mes: 3, anio: 2025 });

    const socios = await cuotaRepository.getCuotasPorGenerar(3, 2025);

    expect(socios).not.toContainEqual(
      expect.objectContaining({ id: socio.id })
    );
  });
});
```

#### 1.2. Revisar Constraint Único de Tabla Cuotas

**Análisis requerido**:
- Verificar si el constraint `@@unique([categoriaId, mes, anio])` causa problemas
- Si múltiples socios de la misma categoría generan cuotas, este constraint NO debería existir
- El constraint único debería ser solo `reciboId` (ya existe)

**Investigación**:
```sql
-- Query para verificar si hay múltiples cuotas por categoría/período
SELECT
  c.categoriaId,
  cs.nombre as categoria,
  c.mes,
  c.anio,
  COUNT(*) as cantidad_cuotas
FROM cuotas c
JOIN categorias_socios cs ON c.categoriaId = cs.id
GROUP BY c.categoriaId, cs.nombre, c.mes, c.anio
HAVING COUNT(*) > 1;
```

**Decisión**:
- Si la query anterior retorna filas → El constraint está MAL, debemos eliminarlo
- Si no retorna filas → El constraint puede estar bien, pero verificar si es necesario

**Migration (si es necesario eliminar)**:
```sql
-- prisma/migrations/XXX_remove_unique_constraint_cuotas/migration.sql
ALTER TABLE cuotas DROP CONSTRAINT IF EXISTS cuotas_categoriaId_mes_anio_key;
```

**Schema actualizado**:
```prisma
model Cuota {
  // ...

  // ❌ ELIMINAR:
  // @@unique([categoriaId, mes, anio])

  // ✅ MANTENER solo:
  @@unique([reciboId])
  @@index([categoriaId])
  @@index([mes, anio])
}
```

#### 1.3. Resolver Race Condition en Numeración de Recibos

**Problema**: Si 2 threads ejecutan `getNextNumero()` simultáneamente, pueden obtener el mismo número.

**Solución elegida**: Secuencia de PostgreSQL (más segura y eficiente)

**Migration**:
```sql
-- prisma/migrations/XXX_add_recibos_sequence/migration.sql

-- 1. Crear secuencia
CREATE SEQUENCE recibos_numero_seq START 1;

-- 2. Sincronizar secuencia con números existentes
SELECT setval('recibos_numero_seq',
  COALESCE((SELECT MAX(numero::INTEGER) FROM recibos WHERE numero ~ '^[0-9]+$'), 0)
);

-- 3. Crear función para generar próximo número
CREATE OR REPLACE FUNCTION next_recibo_numero()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  next_num := nextval('recibos_numero_seq');
  RETURN lpad(next_num::text, 8, '0');
END;
$$ LANGUAGE plpgsql;

-- 4. Agregar default a columna numero
ALTER TABLE recibos ALTER COLUMN numero SET DEFAULT next_recibo_numero();
```

**Schema actualizado**:
```prisma
model Recibo {
  numero String @default(dbgenerated("next_recibo_numero()")) @unique
  // ... resto de campos
}
```

**Repository actualizado**:
```typescript
// src/repositories/recibo.repository.ts

// ❌ ELIMINAR método getNextNumero() (ya no es necesario)

// ✅ Crear recibo sin especificar número (usa default de DB)
async create(data: CreateReciboDto) {
  return await this.prisma.recibo.create({
    data: {
      // numero: NO especificar (se genera automáticamente)
      tipo: data.tipo,
      importe: data.importe,
      // ... resto de campos
    }
  });
}
```

**Tests de concurrencia**:
```typescript
// tests/integration/recibo-numeracion.test.ts
describe('Numeración de recibos - Concurrencia', () => {
  it('debe generar números únicos en operaciones concurrentes', async () => {
    // Crear 100 recibos simultáneamente
    const promises = Array.from({ length: 100 }, (_, i) =>
      reciboRepository.create({
        tipo: 'CUOTA',
        importe: 5000,
        concepto: `Recibo ${i}`,
        receptorId: socioId
      })
    );

    const recibos = await Promise.all(promises);
    const numeros = recibos.map(r => r.numero);

    // Verificar que todos los números son únicos
    const numerosUnicos = new Set(numeros);
    expect(numerosUnicos.size).toBe(100);

    // Verificar que son consecutivos
    const numerosOrdenados = numeros.map(n => parseInt(n)).sort((a, b) => a - b);
    for (let i = 1; i < numerosOrdenados.length; i++) {
      expect(numerosOrdenados[i]).toBe(numerosOrdenados[i-1] + 1);
    }
  });
});
```

#### 1.4. Tests de Regresión

**Suite de tests para validar que no rompimos nada**:

```typescript
// tests/integration/cuotas-regression.test.ts
describe('Tests de Regresión - Cuotas', () => {

  it('debe generar cuotas para 50 socios sin errores', async () => {
    const resultado = await cuotaService.generarCuotas({
      mes: 3,
      anio: 2025
    });

    expect(resultado.generated).toBeGreaterThanOrEqual(50);
    expect(resultado.errors).toHaveLength(0);
  });

  it('debe calcular montos correctamente para ESTUDIANTE', async () => {
    const socioEstudiante = await crearSocioV2({ categoria: 'ESTUDIANTE' });

    const resultado = await cuotaService.generarCuotas({
      mes: 3,
      anio: 2025,
      categorias: [categoriasMap.ESTUDIANTE]
    });

    const cuota = resultado.cuotas.find(c => c.recibo.receptorId === socioEstudiante.id);

    // ESTUDIANTE tiene 40% descuento
    // Si cuota base es 10000, con descuento debe ser 6000
    expect(cuota.montoTotal).toBe(6000);
  });

  it('debe marcar recibos como VENCIDO automáticamente', async () => {
    // Crear cuota con fecha de vencimiento pasada
    const cuota = await crearCuota({
      mes: 1,
      anio: 2025,
      fechaVencimiento: new Date('2025-02-01')
    });

    // Ejecutar proceso de vencimiento
    await reciboService.processVencidos();

    // Verificar que el recibo está VENCIDO
    const recibo = await reciboRepository.findById(cuota.reciboId);
    expect(recibo.estado).toBe('VENCIDO');
  });
});
```

### Entregables

- ✅ Código migrado a Architecture V2 en `cuota.repository.ts`
- ✅ Migration de secuencia de recibos aplicada
- ✅ Migration de constraint único (si aplica)
- ✅ Suite de tests de regresión (5+ tests)
- ✅ Tests de concurrencia para numeración

### Criterios de Aceptación

- ✅ Generación masiva funciona con socios Architecture V2
- ✅ No hay race conditions en numeración (test de 100 recibos concurrentes pasa)
- ✅ Tests de regresión pasan al 100%
- ✅ No se rompe funcionalidad existente

### Riesgos y Mitigación

**Riesgo**: Migration de secuencia puede fallar si hay números de recibo no numéricos
**Mitigación**: Validar datos antes de migration, limpiar registros inválidos

**Riesgo**: Cambio de constraint puede afectar lógica de validación
**Mitigación**: Revisar todos los lugares donde se valida unicidad de cuotas

---

## FASE 2: Diseño del Sistema de Ítems de Cuota

**Duración**: 3-4 días
**Prioridad**: 🔴 ALTA
**Responsable**: Backend Developer + Database Specialist

### Objetivos

- Diseñar arquitectura flexible basada en ítems
- Crear schema de base de datos para ítems configurables
- Migrar datos legacy a nuevo modelo
- Establecer base para sistema de descuentos y recargos

### Tareas Detalladas

#### 2.1. Crear Schema Prisma Completo

**Archivo**: `prisma/schema.prisma`

**Modelos a agregar**: (Ya detallados en sección Arquitectura Propuesta)
- `TipoItemCuota`
- `ItemCuota`
- `CategoriaItem` (enum)

**Modificar modelo existente**:
- `Cuota` → Agregar relación `items ItemCuota[]`
- `Cuota` → Marcar `montoBase` y `montoActividades` como `@deprecated`

#### 2.2. Crear Migration Completa

**Archivo**: `prisma/migrations/XXX_add_items_cuota_system/migration.sql`

**Pasos de la migration**:

```sql
-- PASO 1: Crear ENUM CategoriaItem
CREATE TYPE "CategoriaItem" AS ENUM ('BASE', 'ACTIVIDAD', 'DESCUENTO', 'RECARGO', 'BONIFICACION', 'OTRO');

-- PASO 2: Crear tabla tipos_items_cuota
CREATE TABLE "tipos_items_cuota" (
  "id" SERIAL PRIMARY KEY,
  "codigo" TEXT UNIQUE NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "categoria" "CategoriaItem" NOT NULL,
  "es_calculado" BOOLEAN NOT NULL DEFAULT true,
  "formula" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "orden" INTEGER NOT NULL DEFAULT 0,
  "configurable" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

-- PASO 3: Crear tabla items_cuota
CREATE TABLE "items_cuota" (
  "id" SERIAL PRIMARY KEY,
  "cuota_id" INTEGER NOT NULL,
  "tipo_item_id" INTEGER NOT NULL,
  "concepto" TEXT NOT NULL,
  "monto" DECIMAL(10,2) NOT NULL,
  "cantidad" DECIMAL(8,2) NOT NULL DEFAULT 1,
  "porcentaje" DECIMAL(5,2),
  "es_automatico" BOOLEAN NOT NULL DEFAULT true,
  "es_editable" BOOLEAN NOT NULL DEFAULT false,
  "observaciones" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "items_cuota_cuota_id_fkey" FOREIGN KEY ("cuota_id")
    REFERENCES "cuotas"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "items_cuota_tipo_item_id_fkey" FOREIGN KEY ("tipo_item_id")
    REFERENCES "tipos_items_cuota"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- PASO 4: Crear índices
CREATE INDEX "items_cuota_cuota_id_idx" ON "items_cuota"("cuota_id");
CREATE INDEX "items_cuota_tipo_item_id_idx" ON "items_cuota"("tipo_item_id");
CREATE INDEX "tipos_items_cuota_codigo_idx" ON "tipos_items_cuota"("codigo");
CREATE INDEX "tipos_items_cuota_categoria_idx" ON "tipos_items_cuota"("categoria");

-- PASO 5: Marcar campos legacy como nullable
ALTER TABLE "cuotas" ALTER COLUMN "monto_base" DROP NOT NULL;
ALTER TABLE "cuotas" ALTER COLUMN "monto_actividades" DROP NOT NULL;
```

#### 2.3. Seed de Tipos de Ítems Predefinidos

**Archivo**: `prisma/seed-tipos-items.ts`

```typescript
import { PrismaClient, CategoriaItem } from '@prisma/client';

const prisma = new PrismaClient();

const tiposItemsDefault = [
  {
    codigo: 'CUOTA_BASE_SOCIO',
    nombre: 'Cuota Base Socio',
    descripcion: 'Cuota mensual base según categoría de socio',
    categoria: CategoriaItem.BASE,
    esCalculado: true,
    formula: JSON.stringify({
      type: 'categoria_monto',
      source: 'categorias_socios.montoCuota'
    }),
    activo: true,
    orden: 1,
    configurable: true
  },
  {
    codigo: 'CUOTA_FAMILIAR',
    nombre: 'Cuota Familiar',
    descripcion: 'Cuota mensual del grupo familiar (solo responsable)',
    categoria: CategoriaItem.BASE,
    esCalculado: true,
    formula: JSON.stringify({
      type: 'grupo_familiar',
      source: 'grupos_familiares.montoCuotaFamiliar'
    }),
    activo: true,
    orden: 2,
    configurable: true
  },
  {
    codigo: 'ACTIVIDAD_INDIVIDUAL',
    nombre: 'Actividad Individual',
    descripcion: 'Costo de actividad individual (instrumento, taller, etc.)',
    categoria: CategoriaItem.ACTIVIDAD,
    esCalculado: true,
    formula: JSON.stringify({
      type: 'participacion',
      source: 'participacion_actividades.precioEspecial ?? actividades.costo'
    }),
    activo: true,
    orden: 10,
    configurable: true
  },
  {
    codigo: 'DESCUENTO_CATEGORIA',
    nombre: 'Descuento por Categoría',
    descripcion: 'Descuento aplicado según categoría de socio (ESTUDIANTE, JUBILADO, etc.)',
    categoria: CategoriaItem.DESCUENTO,
    esCalculado: true,
    formula: JSON.stringify({
      type: 'porcentaje_categoria',
      source: 'categorias_socios.descuento'
    }),
    activo: true,
    orden: 20,
    configurable: true
  },
  {
    codigo: 'DESCUENTO_FAMILIAR',
    nombre: 'Descuento Familiar',
    descripcion: 'Descuento por relación familiar activa',
    categoria: CategoriaItem.DESCUENTO,
    esCalculado: true,
    formula: JSON.stringify({
      type: 'maximo_descuento',
      source: 'familiares.descuento'
    }),
    activo: true,
    orden: 21,
    configurable: true
  },
  {
    codigo: 'DESCUENTO_MULTIPLES_ACTIVIDADES',
    nombre: 'Descuento Múltiples Actividades',
    descripcion: 'Descuento por participar en 2 o más actividades',
    categoria: CategoriaItem.DESCUENTO,
    esCalculado: true,
    formula: JSON.stringify({
      type: 'escalado',
      rules: [
        { condition: 'actividades >= 2', descuento: 10 },
        { condition: 'actividades >= 3', descuento: 20 }
      ]
    }),
    activo: true,
    orden: 22,
    configurable: true
  },
  {
    codigo: 'RECARGO_MORA',
    nombre: 'Recargo por Mora',
    descripcion: 'Recargo por pago fuera de término',
    categoria: CategoriaItem.RECARGO,
    esCalculado: true,
    formula: JSON.stringify({
      type: 'porcentaje_fijo',
      porcentaje: 10,
      aplicaSi: 'estado = VENCIDO'
    }),
    activo: false,  // Desactivado por default
    orden: 30,
    configurable: true
  },
  {
    codigo: 'BONIFICACION_ESPECIAL',
    nombre: 'Bonificación Especial',
    descripcion: 'Bonificación aplicada manualmente por administración',
    categoria: CategoriaItem.BONIFICACION,
    esCalculado: false,  // Manual
    formula: null,
    activo: true,
    orden: 40,
    configurable: true
  },
  {
    codigo: 'OTRO_CONCEPTO',
    nombre: 'Otro Concepto',
    descripcion: 'Concepto adicional definido manualmente',
    categoria: CategoriaItem.OTRO,
    esCalculado: false,  // Manual
    formula: null,
    activo: true,
    orden: 50,
    configurable: true
  }
];

async function seedTiposItems() {
  console.log('🌱 Seeding tipos de ítems de cuota...');

  for (const tipo of tiposItemsDefault) {
    await prisma.tipoItemCuota.upsert({
      where: { codigo: tipo.codigo },
      update: tipo,
      create: tipo
    });
    console.log(`✅ Tipo creado/actualizado: ${tipo.codigo}`);
  }

  console.log('✅ Seed de tipos de ítems completado');
}

seedTiposItems()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Ejecutar seed**:
```bash
npx ts-node prisma/seed-tipos-items.ts
```

#### 2.4. Migrar Datos Legacy a Ítems

**Script de migración de datos**:

**Archivo**: `scripts/migrate-cuotas-to-items.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCuotasToItems() {
  console.log('🔄 Iniciando migración de cuotas legacy a sistema de ítems...');

  // 1. Obtener todos los tipos de ítems
  const tipoBase = await prisma.tipoItemCuota.findUnique({
    where: { codigo: 'CUOTA_BASE_SOCIO' }
  });

  const tipoActividad = await prisma.tipoItemCuota.findUnique({
    where: { codigo: 'ACTIVIDAD_INDIVIDUAL' }
  });

  if (!tipoBase || !tipoActividad) {
    throw new Error('Tipos de ítems no encontrados. Ejecutar seed primero.');
  }

  // 2. Obtener todas las cuotas con campos legacy
  const cuotasLegacy = await prisma.cuota.findMany({
    where: {
      OR: [
        { montoBase: { not: null } },
        { montoActividades: { not: null } }
      ]
    }
  });

  console.log(`📊 Cuotas a migrar: ${cuotasLegacy.length}`);

  // 3. Migrar cada cuota
  for (const cuota of cuotasLegacy) {
    const itemsToCreate: any[] = [];

    // 3.1. Migrar montoBase → ItemCuota (CUOTA_BASE_SOCIO)
    if (cuota.montoBase && cuota.montoBase > 0) {
      itemsToCreate.push({
        cuotaId: cuota.id,
        tipoItemId: tipoBase.id,
        concepto: 'Cuota Base Socio',
        monto: cuota.montoBase,
        cantidad: 1,
        esAutomatico: true,
        esEditable: false
      });
    }

    // 3.2. Migrar montoActividades → ItemCuota (ACTIVIDAD_INDIVIDUAL)
    if (cuota.montoActividades && cuota.montoActividades > 0) {
      itemsToCreate.push({
        cuotaId: cuota.id,
        tipoItemId: tipoActividad.id,
        concepto: 'Actividades',
        monto: cuota.montoActividades,
        cantidad: 1,
        esAutomatico: true,
        esEditable: false,
        observaciones: 'Migrado de campo legacy montoActividades'
      });
    }

    // 3.3. Crear ítems
    if (itemsToCreate.length > 0) {
      await prisma.itemCuota.createMany({
        data: itemsToCreate
      });
    }
  }

  console.log('✅ Migración completada');

  // 4. Validar integridad
  const validacion = await validarMigracion();
  console.log('📋 Validación:', validacion);
}

async function validarMigracion() {
  const cuotasConItems = await prisma.cuota.findMany({
    include: {
      items: true
    }
  });

  let errores = 0;

  for (const cuota of cuotasConItems) {
    const totalItems = cuota.items.reduce((sum, item) => sum + Number(item.monto), 0);
    const totalOriginal = Number(cuota.montoTotal);

    if (Math.abs(totalItems - totalOriginal) > 0.01) {
      console.error(`❌ Cuota ${cuota.id}: Monto total no coincide (original: ${totalOriginal}, ítems: ${totalItems})`);
      errores++;
    }
  }

  return {
    cuotasValidadas: cuotasConItems.length,
    errores,
    exito: errores === 0
  };
}

migrateCuotasToItems()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Ejecutar migración**:
```bash
npx ts-node scripts/migrate-cuotas-to-items.ts
```

#### 2.5. Implementar Repositorios de Ítems

##### Repository: TipoItemCuota

**Archivo**: `src/repositories/tipo-item-cuota.repository.ts`

```typescript
import { PrismaClient, TipoItemCuota, CategoriaItem } from '@prisma/client';

export class TipoItemCuotaRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<TipoItemCuota[]> {
    return await this.prisma.tipoItemCuota.findMany({
      orderBy: { orden: 'asc' }
    });
  }

  async findActivos(): Promise<TipoItemCuota[]> {
    return await this.prisma.tipoItemCuota.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    });
  }

  async findByCategoria(categoria: CategoriaItem): Promise<TipoItemCuota[]> {
    return await this.prisma.tipoItemCuota.findMany({
      where: {
        categoria,
        activo: true
      },
      orderBy: { orden: 'asc' }
    });
  }

  async findByCodigo(codigo: string): Promise<TipoItemCuota | null> {
    return await this.prisma.tipoItemCuota.findUnique({
      where: { codigo }
    });
  }

  async create(data: CreateTipoItemDto): Promise<TipoItemCuota> {
    return await this.prisma.tipoItemCuota.create({
      data
    });
  }

  async update(id: number, data: UpdateTipoItemDto): Promise<TipoItemCuota> {
    return await this.prisma.tipoItemCuota.update({
      where: { id },
      data
    });
  }

  async delete(id: number): Promise<void> {
    // Soft delete
    await this.prisma.tipoItemCuota.update({
      where: { id },
      data: { activo: false }
    });
  }
}
```

##### Repository: ItemCuota

**Archivo**: `src/repositories/item-cuota.repository.ts`

```typescript
import { PrismaClient, ItemCuota } from '@prisma/client';

export class ItemCuotaRepository {
  constructor(private prisma: PrismaClient) {}

  async findByCuota(cuotaId: number): Promise<ItemCuota[]> {
    return await this.prisma.itemCuota.findMany({
      where: { cuotaId },
      include: {
        tipoItem: true
      },
      orderBy: { id: 'asc' }
    });
  }

  async createMany(cuotaId: number, items: CreateItemCuotaDto[]): Promise<number> {
    const itemsData = items.map(item => ({
      cuotaId,
      tipoItemId: item.tipoItemId,
      concepto: item.concepto,
      monto: item.monto,
      cantidad: item.cantidad || 1,
      porcentaje: item.porcentaje,
      esAutomatico: item.esAutomatico ?? true,
      esEditable: item.esEditable ?? false,
      observaciones: item.observaciones,
      metadata: item.metadata
    }));

    const result = await this.prisma.itemCuota.createMany({
      data: itemsData
    });

    return result.count;
  }

  async update(itemId: number, data: UpdateItemCuotaDto): Promise<ItemCuota> {
    // Validar que el ítem sea editable
    const item = await this.prisma.itemCuota.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      throw new Error('Item no encontrado');
    }

    if (!item.esEditable) {
      throw new Error('Este ítem no puede ser modificado');
    }

    return await this.prisma.itemCuota.update({
      where: { id: itemId },
      data
    });
  }

  async delete(itemId: number): Promise<void> {
    await this.prisma.itemCuota.delete({
      where: { id: itemId }
    });
  }

  async deleteByTipo(cuotaId: number, tipoItemCodigo: string): Promise<void> {
    await this.prisma.itemCuota.deleteMany({
      where: {
        cuotaId,
        tipoItem: {
          codigo: tipoItemCodigo
        }
      }
    });
  }

  async calculateTotal(cuotaId: number): Promise<number> {
    const items = await this.findByCuota(cuotaId);
    return items.reduce((sum, item) => sum + Number(item.monto), 0);
  }
}
```

#### 2.6. Tests de Repositorios

```typescript
// tests/unit/repositories/tipo-item-cuota.repository.test.ts
describe('TipoItemCuotaRepository', () => {
  it('debe obtener todos los tipos activos', async () => {
    const tipos = await tipoItemRepository.findActivos();
    expect(tipos.length).toBeGreaterThan(0);
    expect(tipos.every(t => t.activo)).toBe(true);
  });

  it('debe filtrar por categoría', async () => {
    const descuentos = await tipoItemRepository.findByCategoria('DESCUENTO');
    expect(descuentos.every(t => t.categoria === 'DESCUENTO')).toBe(true);
  });
});

// tests/unit/repositories/item-cuota.repository.test.ts
describe('ItemCuotaRepository', () => {
  it('debe crear múltiples ítems en batch', async () => {
    const cuota = await crearCuota();

    const items = [
      { tipoItemId: 1, concepto: 'Base', monto: 5000 },
      { tipoItemId: 2, concepto: 'Actividad', monto: 1500 }
    ];

    const count = await itemCuotaRepository.createMany(cuota.id, items);
    expect(count).toBe(2);
  });

  it('debe calcular total correctamente', async () => {
    const cuota = await crearCuotaConItems([
      { monto: 5000 },
      { monto: 1500 },
      { monto: -1000 }  // Descuento
    ]);

    const total = await itemCuotaRepository.calculateTotal(cuota.id);
    expect(total).toBe(5500);
  });

  it('no debe permitir editar ítem no editable', async () => {
    const item = await crearItem({ esEditable: false });

    await expect(
      itemCuotaRepository.update(item.id, { monto: 6000 })
    ).rejects.toThrow('Este ítem no puede ser modificado');
  });
});
```

### Entregables

- ✅ Schema Prisma actualizado con modelos de ítems
- ✅ Migration aplicada y validada
- ✅ Seed de tipos de ítems ejecutado
- ✅ Datos legacy migrados a ítems
- ✅ Repositorios implementados y testeados
- ✅ Validación de integridad de datos (100% de cuotas migradas correctamente)

### Criterios de Aceptación

- ✅ Tablas `tipos_items_cuota` e `items_cuota` creadas
- ✅ 9 tipos de ítems predefinidos creados
- ✅ 100% de cuotas legacy migradas sin errores
- ✅ `calculateTotal()` retorna mismo valor que `cuota.montoTotal`
- ✅ Tests unitarios de repositorios pasan

### Riesgos y Mitigación

**Riesgo**: Migración de datos puede fallar si hay inconsistencias
**Mitigación**: Script de validación completo antes y después de migración

**Riesgo**: Performance de cálculo de totales puede degradarse
**Mitigación**: Índices en `items_cuota.cuota_id`, mantener campo `montoTotal` en tabla `cuotas`

---

## FASE 3: Motor de Reglas de Descuentos Flexibles

**Duración**: 4-5 días
**Prioridad**: 🟡 ALTA
**Responsable**: Backend Developer Senior

### Objetivos

- Implementar sistema configurable de aplicación de descuentos
- Soportar reglas acumulativas, exclusivas y mixtas
- Permitir configuración dinámica por usuario admin
- Eliminar descuentos hardcoded del código

### Tareas Detalladas

#### 3.1. Crear Schema de Reglas de Descuentos

**Archivo**: `prisma/schema.prisma`

*Ya detallado en sección Arquitectura Propuesta*

**Migration**:
```sql
-- prisma/migrations/XXX_add_reglas_descuentos/migration.sql

CREATE TYPE "ModoAplicacionDescuento" AS ENUM (
  'ACUMULATIVO',
  'EXCLUSIVO',
  'MAXIMO',
  'PERSONALIZADO'
);

CREATE TABLE "reglas_descuentos" (
  "id" SERIAL PRIMARY KEY,
  "codigo" TEXT UNIQUE NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "prioridad" INTEGER NOT NULL DEFAULT 0,
  "modo_aplicacion" "ModoAplicacionDescuento" NOT NULL,
  "max_descuento" DECIMAL(5,2),
  "condiciones" JSONB NOT NULL,
  "formula" JSONB NOT NULL,
  "activa" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "configuracion_descuentos" (
  "id" SERIAL PRIMARY KEY,
  "limite_descuento_total" DECIMAL(5,2) NOT NULL DEFAULT 80,
  "aplicar_descuentos_a_actividades" BOOLEAN NOT NULL DEFAULT true,
  "prioridad_reglas" JSONB NOT NULL,
  "activa" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "reglas_descuentos_prioridad_idx" ON "reglas_descuentos"("prioridad");
CREATE INDEX "reglas_descuentos_activa_idx" ON "reglas_descuentos"("activa");
```

#### 3.2. Seed de Reglas de Descuentos Predefinidas

**Archivo**: `prisma/seed-reglas-descuentos.ts`

```typescript
import { PrismaClient, ModoAplicacionDescuento } from '@prisma/client';

const prisma = new PrismaClient();

const reglasDefault = [
  {
    codigo: 'DESC_CATEGORIA',
    nombre: 'Descuento por Categoría',
    descripcion: 'Aplica descuento según categoría de socio (ESTUDIANTE, JUBILADO)',
    prioridad: 10,
    modoAplicacion: ModoAplicacionDescuento.ACUMULATIVO,
    condiciones: {
      type: 'categoria',
      categorias: ['ESTUDIANTE', 'JUBILADO', 'FAMILIAR']
    },
    formula: {
      type: 'porcentaje_desde_categoria',
      campo: 'descuento'  // Lee categorias_socios.descuento
    },
    activa: true
  },
  {
    codigo: 'DESC_FAMILIAR',
    nombre: 'Descuento Familiar',
    descripcion: 'Aplica descuento por relación familiar activa',
    prioridad: 20,
    modoAplicacion: ModoAplicacionDescuento.EXCLUSIVO,  // Solo el máximo
    condiciones: {
      type: 'relacion_familiar',
      activa: true
    },
    formula: {
      type: 'maximo_descuento',
      fuente: 'familiares.descuento'
    },
    activa: true
  },
  {
    codigo: 'DESC_MULTIPLES_ACTIVIDADES',
    nombre: 'Descuento Múltiples Actividades',
    descripcion: 'Descuento escalonado según cantidad de actividades',
    prioridad: 30,
    modoAplicacion: ModoAplicacionDescuento.PERSONALIZADO,
    condiciones: {
      type: 'cantidad_actividades',
      minimo: 2
    },
    formula: {
      type: 'escalado',
      reglas: [
        { condicion: 'actividades >= 2 && actividades < 3', descuento: 10 },
        { condicion: 'actividades >= 3', descuento: 20 }
      ]
    },
    activa: true
  }
];

const configDefault = {
  limiteDescuentoTotal: 80,  // Máximo 80% de descuento total
  aplicarDescuentosAActividades: true,
  prioridadReglas: [1, 2, 3],  // IDs en orden de aplicación
  activa: true
};

async function seedReglasDescuentos() {
  console.log('🌱 Seeding reglas de descuentos...');

  for (const regla of reglasDefault) {
    await prisma.reglaDescuento.upsert({
      where: { codigo: regla.codigo },
      update: regla,
      create: regla
    });
    console.log(`✅ Regla creada: ${regla.codigo}`);
  }

  await prisma.configuracionDescuentos.upsert({
    where: { id: 1 },
    update: configDefault,
    create: configDefault
  });

  console.log('✅ Seed de reglas completado');
}

seedReglasDescuentos()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

#### 3.3. Implementar Motor de Descuentos

**Archivo**: `src/services/motor-descuentos.service.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { ReglaDescuento, ModoAplicacionDescuento } from '@prisma/client';

interface DescuentoCalculado {
  codigo: string;
  nombre: string;
  porcentaje: number;
  monto: number;
  aplicado: boolean;
  metadata?: any;
}

interface ParamsCalculo {
  socioId: number;
  categoriaId: number;
  categoriaCodigo: string;
  montoBase: number;
  montosActividades: number[];
  mes: number;
  anio: number;
}

export class MotorDescuentosService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Calcular descuentos según reglas configuradas
   */
  async calcularDescuentos(params: ParamsCalculo): Promise<DescuentoCalculado[]> {
    // 1. Obtener configuración global
    const config = await this.prisma.configuracionDescuentos.findFirst({
      where: { activa: true }
    });

    if (!config) {
      return [];  // Sin configuración, sin descuentos
    }

    // 2. Obtener reglas aplicables
    const reglasAplicables = await this.obtenerReglasAplicables(
      params.socioId,
      params.categoriaCodigo
    );

    if (reglasAplicables.length === 0) {
      return [];
    }

    // 3. Calcular descuentos por cada regla
    const descuentos: DescuentoCalculado[] = [];

    for (const regla of reglasAplicables) {
      const descuento = await this.calcularDescuentoPorRegla(regla, params);
      if (descuento && descuento.porcentaje > 0) {
        descuentos.push(descuento);
      }
    }

    // 4. Aplicar modo de aplicación
    const descuentosAplicados = this.aplicarModoAplicacion(
      descuentos,
      config
    );

    // 5. Validar límite total
    const totalDescuento = descuentosAplicados.reduce(
      (sum, d) => sum + d.porcentaje,
      0
    );

    if (totalDescuento > config.limiteDescuentoTotal) {
      throw new Error(
        `Descuento total (${totalDescuento}%) excede el límite permitido (${config.limiteDescuentoTotal}%)`
      );
    }

    return descuentosAplicados;
  }

  /**
   * Obtener reglas aplicables al socio
   */
  private async obtenerReglasAplicables(
    socioId: number,
    categoriaCodigo: string
  ): Promise<ReglaDescuento[]> {
    const reglas = await this.prisma.reglaDescuento.findMany({
      where: { activa: true },
      orderBy: { prioridad: 'asc' }
    });

    // Filtrar reglas según condiciones
    const reglasAplicables: ReglaDescuento[] = [];

    for (const regla of reglas) {
      const cumpleCondiciones = await this.evaluarCondiciones(
        regla.condiciones as any,
        socioId,
        categoriaCodigo
      );

      if (cumpleCondiciones) {
        reglasAplicables.push(regla);
      }
    }

    return reglasAplicables;
  }

  /**
   * Evaluar si el socio cumple las condiciones de la regla
   */
  private async evaluarCondiciones(
    condiciones: any,
    socioId: number,
    categoriaCodigo: string
  ): Promise<boolean> {
    switch (condiciones.type) {
      case 'categoria':
        return condiciones.categorias.includes(categoriaCodigo);

      case 'relacion_familiar':
        const familiares = await this.prisma.familiar.findMany({
          where: {
            OR: [
              { socioId, activo: true },
              { familiarId: socioId, activo: true }
            ],
            descuento: { gt: 0 }
          }
        });
        return familiares.length > 0;

      case 'cantidad_actividades':
        const participaciones = await this.prisma.participacion_actividades.count({
          where: {
            personaId: socioId,
            activa: true
          }
        });
        return participaciones >= condiciones.minimo;

      default:
        return false;
    }
  }

  /**
   * Calcular descuento según fórmula de la regla
   */
  private async calcularDescuentoPorRegla(
    regla: ReglaDescuento,
    params: ParamsCalculo
  ): Promise<DescuentoCalculado | null> {
    const formula = regla.formula as any;
    let porcentaje = 0;
    let metadata = {};

    switch (formula.type) {
      case 'porcentaje_desde_categoria':
        // Lee porcentaje de categorias_socios.descuento
        const categoria = await this.prisma.categoriaSocio.findUnique({
          where: { id: params.categoriaId }
        });
        porcentaje = Number(categoria?.descuento || 0);
        break;

      case 'maximo_descuento':
        // Obtiene el máximo descuento familiar
        const familiares = await this.prisma.familiar.findMany({
          where: {
            OR: [
              { socioId: params.socioId, activo: true },
              { familiarId: params.socioId, activo: true }
            ]
          }
        });
        porcentaje = Math.max(...familiares.map(f => Number(f.descuento)), 0);
        metadata = { familiaresConDescuento: familiares.length };
        break;

      case 'escalado':
        // Descuento escalonado según cantidad de actividades
        const cantActividades = params.montosActividades.length;
        for (const rule of formula.reglas) {
          // Evaluar condición simple (puede mejorarse con parser)
          if (eval(rule.condicion.replace('actividades', cantActividades.toString()))) {
            porcentaje = rule.descuento;
            break;
          }
        }
        metadata = { cantidadActividades: cantActividades };
        break;

      default:
        return null;
    }

    if (porcentaje <= 0) {
      return null;
    }

    // Calcular monto del descuento
    const montoBase = params.montoBase;
    const montoActividades = params.montosActividades.reduce((sum, m) => sum + m, 0);
    const montoTotal = montoBase + montoActividades;

    const monto = montoTotal * (porcentaje / 100);

    return {
      codigo: regla.codigo,
      nombre: regla.nombre,
      porcentaje,
      monto,
      aplicado: false,  // Se marca después según modo
      metadata
    };
  }

  /**
   * Aplicar modo de aplicación de descuentos
   */
  private aplicarModoAplicacion(
    descuentos: DescuentoCalculado[],
    config: any
  ): DescuentoCalculado[] {
    if (descuentos.length === 0) return [];

    // Determinar modo predominante (puede ser más sofisticado)
    const modoGlobal = 'ACUMULATIVO';  // Por defecto

    switch (modoGlobal) {
      case 'ACUMULATIVO':
        return this.aplicarModoAcumulativo(descuentos);

      case 'EXCLUSIVO':
        return this.aplicarModoExclusivo(descuentos);

      case 'MAXIMO':
        return this.aplicarModoMaximo(descuentos, config.limiteDescuentoTotal);

      default:
        return this.aplicarModoAcumulativo(descuentos);
    }
  }

  /**
   * Modo ACUMULATIVO: Suma todos los descuentos
   */
  private aplicarModoAcumulativo(descuentos: DescuentoCalculado[]): DescuentoCalculado[] {
    return descuentos.map(d => ({ ...d, aplicado: true }));
  }

  /**
   * Modo EXCLUSIVO: Solo el mayor descuento
   */
  private aplicarModoExclusivo(descuentos: DescuentoCalculado[]): DescuentoCalculado[] {
    const mayorDescuento = descuentos.reduce((max, d) =>
      d.porcentaje > max.porcentaje ? d : max
    );

    return descuentos.map(d => ({
      ...d,
      aplicado: d.codigo === mayorDescuento.codigo
    }));
  }

  /**
   * Modo MAXIMO: Aplica descuentos hasta llegar al máximo
   */
  private aplicarModoMaximo(
    descuentos: DescuentoCalculado[],
    maximo: number
  ): DescuentoCalculado[] {
    // Ordenar por porcentaje descendente
    const ordenados = [...descuentos].sort((a, b) => b.porcentaje - a.porcentaje);

    let acumulado = 0;
    return ordenados.map(d => {
      if (acumulado + d.porcentaje <= maximo) {
        acumulado += d.porcentaje;
        return { ...d, aplicado: true };
      } else {
        return { ...d, aplicado: false };
      }
    });
  }
}
```

#### 3.4. Integrar Motor con Servicio de Cuotas

**Archivo**: `src/services/cuota.service.ts`

**Modificar método `calcularDescuentos()`**:

```typescript
// ❌ ELIMINAR método actual con descuentos hardcoded (líneas 444-484)

// ✅ REEMPLAZAR con:
private async calcularDescuentos(
  categoriaId: number,
  categoriaCodigo: string,
  montoBase: number,
  montosActividades: number[],
  socioId: number,
  mes: number,
  anio: number
): Promise<DescuentoCalculado[]> {

  // Usar motor de descuentos
  const descuentos = await this.motorDescuentos.calcularDescuentos({
    socioId,
    categoriaId,
    categoriaCodigo,
    montoBase,
    montosActividades,
    mes,
    anio
  });

  // Filtrar solo descuentos aplicados
  return descuentos.filter(d => d.aplicado);
}
```

#### 3.5. Crear Endpoints de Configuración

**Archivo**: `src/controllers/configuracion-descuentos.controller.ts`

```typescript
import { Request, Response } from 'express';
import { MotorDescuentosService } from '@/services/motor-descuentos.service';
import { ReglaDescuentoRepository } from '@/repositories/regla-descuento.repository';

export class ConfiguracionDescuentosController {
  constructor(
    private motorDescuentos: MotorDescuentosService,
    private reglaRepository: ReglaDescuentoRepository
  ) {}

  // GET /api/configuracion/descuentos
  async getConfiguracion(req: Request, res: Response) {
    const config = await this.prisma.configuracionDescuentos.findFirst({
      where: { activa: true }
    });

    res.json({ success: true, data: config });
  }

  // PUT /api/configuracion/descuentos
  async updateConfiguracion(req: Request, res: Response) {
    const config = await this.prisma.configuracionDescuentos.update({
      where: { id: 1 },
      data: req.body
    });

    res.json({ success: true, data: config });
  }

  // GET /api/reglas-descuentos
  async listarReglas(req: Request, res: Response) {
    const reglas = await this.reglaRepository.findAll();
    res.json({ success: true, data: reglas });
  }

  // POST /api/reglas-descuentos
  async crearRegla(req: Request, res: Response) {
    const regla = await this.reglaRepository.create(req.body);
    res.status(201).json({ success: true, data: regla });
  }

  // PUT /api/reglas-descuentos/:id
  async actualizarRegla(req: Request, res: Response) {
    const { id } = req.params;
    const regla = await this.reglaRepository.update(parseInt(id), req.body);
    res.json({ success: true, data: regla });
  }

  // DELETE /api/reglas-descuentos/:id
  async eliminarRegla(req: Request, res: Response) {
    const { id } = req.params;
    await this.reglaRepository.delete(parseInt(id));
    res.json({ success: true, message: 'Regla eliminada' });
  }

  // PUT /api/reglas-descuentos/prioridad
  async reordenarPrioridad(req: Request, res: Response) {
    const { orden } = req.body;  // Array de IDs en orden

    for (let i = 0; i < orden.length; i++) {
      await this.reglaRepository.update(orden[i], { prioridad: i + 1 });
    }

    res.json({ success: true, message: 'Prioridad actualizada' });
  }
}
```

**Rutas**: `src/routes/configuracion.routes.ts`

```typescript
router.get('/descuentos', configuracionDescuentosController.getConfiguracion);
router.put('/descuentos', configuracionDescuentosController.updateConfiguracion);

router.get('/reglas-descuentos', configuracionDescuentosController.listarReglas);
router.post('/reglas-descuentos', configuracionDescuentosController.crearRegla);
router.put('/reglas-descuentos/:id', configuracionDescuentosController.actualizarRegla);
router.delete('/reglas-descuentos/:id', configuracionDescuentosController.eliminarRegla);
router.put('/reglas-descuentos/prioridad', configuracionDescuentosController.reordenarPrioridad);
```

#### 3.6. Tests del Motor de Descuentos

```typescript
// tests/unit/services/motor-descuentos.service.test.ts
describe('MotorDescuentosService', () => {
  describe('Modo ACUMULATIVO', () => {
    it('debe sumar todos los descuentos aplicables', async () => {
      // Socio ESTUDIANTE con descuento familiar
      const descuentos = await motorDescuentos.calcularDescuentos({
        socioId: socioEstudiante.id,
        categoriaId: 2,
        categoriaCodigo: 'ESTUDIANTE',
        montoBase: 10000,
        montosActividades: [1500],
        mes: 3,
        anio: 2025
      });

      // Debe tener 2 descuentos
      expect(descuentos).toHaveLength(2);
      expect(descuentos.find(d => d.codigo === 'DESC_CATEGORIA')).toBeDefined();
      expect(descuentos.find(d => d.codigo === 'DESC_FAMILIAR')).toBeDefined();

      // Total: 40% (categoría) + 20% (familiar) = 60%
      const totalPorcentaje = descuentos.reduce((sum, d) => sum + d.porcentaje, 0);
      expect(totalPorcentaje).toBe(60);
    });
  });

  describe('Modo EXCLUSIVO', () => {
    it('debe aplicar solo el mayor descuento', async () => {
      // Configurar modo exclusivo
      await configurarModoExclusivo();

      const descuentos = await motorDescuentos.calcularDescuentos({...});

      const aplicados = descuentos.filter(d => d.aplicado);
      expect(aplicados).toHaveLength(1);

      // Debe ser el de mayor porcentaje (ESTUDIANTE 40%)
      expect(aplicados[0].codigo).toBe('DESC_CATEGORIA');
      expect(aplicados[0].porcentaje).toBe(40);
    });
  });

  describe('Modo MAXIMO', () => {
    it('debe aplicar descuentos hasta el límite', async () => {
      await configurarModoMaximo({ limite: 50 });

      const descuentos = await motorDescuentos.calcularDescuentos({...});

      const totalAplicado = descuentos
        .filter(d => d.aplicado)
        .reduce((sum, d) => sum + d.porcentaje, 0);

      expect(totalAplicado).toBeLessThanOrEqual(50);
    });
  });

  describe('Descuento por múltiples actividades', () => {
    it('debe aplicar 10% con 2 actividades', async () => {
      const socio = await crearSocioConActividades(2);

      const descuentos = await motorDescuentos.calcularDescuentos({
        ...params,
        montosActividades: [1500, 2000]
      });

      const descMultiples = descuentos.find(d => d.codigo === 'DESC_MULTIPLES_ACTIVIDADES');
      expect(descMultiples?.porcentaje).toBe(10);
    });

    it('debe aplicar 20% con 3+ actividades', async () => {
      const socio = await crearSocioConActividades(3);

      const descuentos = await motorDescuentos.calcularDescuentos({
        ...params,
        montosActividades: [1500, 2000, 1000]
      });

      const descMultiples = descuentos.find(d => d.codigo === 'DESC_MULTIPLES_ACTIVIDADES');
      expect(descMultiples?.porcentaje).toBe(20);
    });
  });

  describe('Validación de límite', () => {
    it('debe lanzar error si se excede límite total', async () => {
      await configurarLimiteDescuento(50);

      // Configurar socio con descuentos que suman 60%
      await expect(
        motorDescuentos.calcularDescuentos({...})
      ).rejects.toThrow('Descuento total (60%) excede el límite permitido (50%)');
    });
  });
});
```

### Entregables

- ✅ Schema de reglas de descuentos creado
- ✅ Motor de descuentos implementado con 4 modos
- ✅ Descuentos hardcoded eliminados completamente
- ✅ Endpoints de configuración funcionales
- ✅ Tests unitarios del motor (10+ tests)
- ✅ Documentación de reglas y fórmulas

### Criterios de Aceptación

- ✅ Motor aplica descuentos según modo configurado
- ✅ Admin puede crear/editar reglas desde UI
- ✅ Descuentos se calculan correctamente (ESTUDIANTE 40%, etc.)
- ✅ Límite de descuento total se respeta
- ✅ Tests de todos los modos pasan

### Riesgos y Mitigación

**Riesgo**: Complejidad de evaluación de fórmulas puede causar errores
**Mitigación**: Parser simple y seguro, validación exhaustiva de fórmulas al crear reglas

**Riesgo**: Performance degradada por múltiples queries
**Mitigación**: Caché de reglas activas, optimización de queries con includes

---

*[Continúa con Fases 4-8 en formato similar...]*

---

## Cronograma y Recursos

### Cronograma Detallado (Gantt Simplificado)

```
Semana 1
├── Lun-Mar: Fase 0 (Preparación)
└── Mié-Vie: Fase 1 (Fixes Críticos)

Semana 2
├── Lun-Jue: Fase 2 (Sistema de Ítems)
└── Vie: Buffer / Tests

Semana 3-4
├── Fase 3 (Motor de Descuentos): 4-5 días
└── Fase 4 (Funcionalidades Pendientes): 5-6 días

Semana 5-6
├── Fase 5 (Ajuste y Simulación): 4-5 días
├── Fase 6 (Optimización): 3-4 días
└── Buffer: 2 días

Semana 7
└── Fase 7 (Tests y Calidad): 4-5 días

Semana 8+ (Opcional)
└── Fase 8 (Features Adicionales): 5-6 días
```

### Recursos Necesarios

#### Equipo Técnico

- **1 Backend Developer Senior** (Full-time, 6-8 semanas)
  - Responsabilidades: Fases 1, 3, 5, 6
  - Skills: Node.js, TypeScript, Prisma, PostgreSQL

- **1 Backend Developer Mid** (Full-time, 6-8 semanas)
  - Responsabilidades: Fases 2, 4, 7
  - Skills: Node.js, TypeScript, Testing (Jest)

- **1 Database Specialist** (Part-time, 2 semanas)
  - Responsabilidades: Fase 2 (Migrations, validación de datos)
  - Skills: PostgreSQL, Prisma, Data Migration

- **1 QA Engineer** (Part-time, Semanas 5-7)
  - Responsabilidades: Fase 7 (Tests E2E, validación)
  - Skills: Jest, Supertest, API Testing

#### Infraestructura

- **Entorno de desarrollo**: Servidor local con PostgreSQL 16+
- **Entorno de testing**: DB separada `sigesda_test`
- **Entorno de staging** (opcional): Para pruebas pre-producción
- **Backups automáticos**: Daily backups durante implementación

### Hitos y Checkpoints

| Semana | Hito | Entregable | Revisión |
|--------|------|-----------|----------|
| 1 | Milestone 1: Sistema estable V2 | Fixes críticos aplicados | Code Review |
| 3 | Milestone 2: Ítems operativos | Sistema de ítems funcionando | Demo interna |
| 5 | Milestone 3: Motor descuentos | Descuentos configurables | UAT |
| 7 | Milestone 4: Sistema completo | Tests > 80% cobertura | Release Candidate |
| 8+ | Milestone 5: Features extra | Notificaciones, dashboard | Deploy opcional |

---

## Gestión de Riesgos

### Matriz de Riesgos

| Riesgo | Probabilidad | Impacto | Severidad | Mitigación |
|--------|--------------|---------|-----------|------------|
| **Migración de datos falla** | Media | Alto | 🔴 Alta | Backups + validación exhaustiva + rollback plan |
| **Race conditions en producción** | Baja | Alto | 🟡 Media | Tests de concurrencia + secuencia PostgreSQL |
| **Performance degradada** | Media | Medio | 🟡 Media | Batch inserts + índices + caché |
| **Motor de descuentos complejo** | Alta | Medio | 🟡 Media | Implementación incremental + tests extensivos |
| **Datos legacy inconsistentes** | Media | Medio | 🟡 Media | Script de limpieza pre-migración |
| **Cambios de scope** | Alta | Bajo | 🟢 Baja | Fases opcionales claramente definidas |

### Plan de Rollback

#### Por Fase

**Fase 1-2 (Críticas)**:
- Restaurar backup de base de datos
- Revertir migrations con scripts de rollback
- Volver a branch `main`

**Fase 3-4**:
- Desactivar motor de descuentos (flag de feature)
- Revertir a cálculo hardcoded temporal
- Mantener datos de configuración para futura reactivación

**Fase 5-8 (Opcionales)**:
- Desactivar features individualmente
- No afectan funcionalidad core

#### Scripts de Rollback

Cada migration debe tener su rollback:
```sql
-- migrations/XXX_add_items_cuota_system/rollback.sql
DROP TABLE IF EXISTS items_cuota CASCADE;
DROP TABLE IF EXISTS tipos_items_cuota CASCADE;
DROP TYPE IF EXISTS "CategoriaItem";

ALTER TABLE cuotas ALTER COLUMN monto_base SET NOT NULL;
ALTER TABLE cuotas ALTER COLUMN monto_actividades SET NOT NULL;
```

---

## Criterios de Aceptación

### Criterios Generales del Proyecto

- ✅ **Funcionalidad**: 100% de features del plan implementadas
- ✅ **Performance**: Generación de 500 cuotas < 10 segundos
- ✅ **Calidad**: Cobertura de tests > 80%
- ✅ **Estabilidad**: 0 bugs críticos en testing
- ✅ **Documentación**: API documentada con Swagger
- ✅ **Migración**: 100% de datos legacy migrados sin pérdida

### Criterios por Fase

#### Fase 1: Fixes Críticos
- ✅ Generación masiva funciona con Architecture V2
- ✅ No hay race conditions (test 100 recibos concurrentes)
- ✅ Tests de regresión pasan al 100%

#### Fase 2: Sistema de Ítems
- ✅ 9 tipos de ítems creados y funcionales
- ✅ 100% de cuotas migradas correctamente
- ✅ CRUD de ítems funciona sin errores

#### Fase 3: Motor de Descuentos
- ✅ 4 modos de aplicación implementados
- ✅ Descuentos hardcoded eliminados
- ✅ Admin puede configurar reglas desde UI

#### Fase 4: Funcionalidades Pendientes
- ✅ Cálculo de actividades retorna valores reales
- ✅ Cuota familiar se cobra solo al responsable
- ✅ Prorrateo funciona cuando está activado

#### Fase 5: Ajuste y Simulación
- ✅ Simulación retorna preview exacto
- ✅ Edición post-generación funciona correctamente
- ✅ Anulación/regeneración es transaccional

#### Fase 6: Optimización
- ✅ Generación masiva > 20x más rápida
- ✅ Queries reducidas en 80%+
- ✅ Caché invalida correctamente

#### Fase 7: Tests y Calidad
- ✅ Cobertura > 80% (unitarios)
- ✅ 15+ tests de integración
- ✅ Tests E2E simulan workflows reales
- ✅ Swagger accesible en `/api-docs`

#### Fase 8: Features Adicionales (Opcional)
- ✅ Notificaciones se envían correctamente
- ✅ Recargos por mora automáticos
- ✅ Dashboard con métricas en tiempo real

### Validación Final

Antes de marcar el proyecto como completo:

1. **Demo completa** con stakeholders
2. **UAT** (User Acceptance Testing) con usuarios reales
3. **Performance test** con 1000+ socios
4. **Security review** de endpoints y permisos
5. **Documentation review** de código y API
6. **Sign-off** de Product Owner

---

## Anexos

### Anexo A: Glosario de Términos

- **Ítem de Cuota**: Concepto individual que compone una cuota (base, actividad, descuento, etc.)
- **Motor de Descuentos**: Sistema que calcula y aplica descuentos según reglas configurables
- **Modo de Aplicación**: Estrategia para combinar múltiples descuentos (acumulativo, exclusivo, máximo)
- **Cuota Familiar**: Cuota mensual fija pagada por el responsable financiero de un grupo familiar
- **Dry-Run**: Simulación de generación de cuotas sin persistir datos
- **Batch Insert**: Inserción masiva de registros en una sola transacción
- **Race Condition**: Condición de carrera donde operaciones concurrentes causan resultados impredecibles
- **Architecture V2**: Modelo de datos con tabla `persona_tipo` (many-to-many)

### Anexo B: Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Iniciar servidor de desarrollo
npm run build                  # Compilar TypeScript
npm start                      # Iniciar servidor de producción

# Base de datos
npm run db:generate            # Generar Prisma Client
npm run db:migrate             # Ejecutar migrations
npm run db:seed                # Ejecutar seeds
npm run db:studio              # Abrir Prisma Studio
npx ts-node prisma/seed-tipos-items.ts  # Seed de tipos de ítems

# Testing
npm test                       # Ejecutar todos los tests
npm run test:unit              # Solo tests unitarios
npm run test:integration       # Solo tests de integración
npm run test:e2e               # Solo tests E2E
npm run test:coverage          # Tests con reporte de cobertura

# Migrations
npx prisma migrate dev --name nombre_migration   # Crear nueva migration
npx prisma migrate reset       # Resetear DB (desarrollo)
npx ts-node scripts/migrate-cuotas-to-items.ts  # Migrar datos legacy

# Backups
pg_dump -h localhost -U postgres -d sigesda > backup.sql
psql -h localhost -U postgres -d sigesda < backup.sql
```

### Anexo C: Estructura de Directorios

```
SIGESDA-BACKEND/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   │   ├── XXX_add_items_cuota_system/
│   │   ├── XXX_add_reglas_descuentos/
│   │   └── XXX_add_recibos_sequence/
│   ├── seed-tipos-items.ts
│   └── seed-reglas-descuentos.ts
├── src/
│   ├── controllers/
│   │   ├── cuota.controller.ts
│   │   ├── item-cuota.controller.ts
│   │   ├── configuracion-descuentos.controller.ts
│   │   └── grupo-familiar.controller.ts
│   ├── services/
│   │   ├── cuota.service.ts
│   │   ├── motor-descuentos.service.ts
│   │   ├── grupo-familiar.service.ts
│   │   └── item-cuota.service.ts
│   ├── repositories/
│   │   ├── cuota.repository.ts
│   │   ├── tipo-item-cuota.repository.ts
│   │   ├── item-cuota.repository.ts
│   │   ├── regla-descuento.repository.ts
│   │   └── grupo-familiar.repository.ts
│   ├── dto/
│   │   ├── cuota.dto.ts
│   │   ├── item-cuota.dto.ts
│   │   └── regla-descuento.dto.ts
│   └── utils/
│       └── cached-config.service.ts
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── utils/
│   ├── integration/
│   │   ├── cuota-generacion-masiva.test.ts
│   │   ├── motor-descuentos-integration.test.ts
│   │   └── grupo-familiar-integration.test.ts
│   └── e2e/
│       └── cuotas-workflow.test.ts
├── scripts/
│   ├── migrate-cuotas-to-items.ts
│   └── validate-cuotas-migration.ts
├── docs/
│   ├── ESTADO_ACTUAL_CUOTAS.md
│   ├── API_DOCUMENTATION.md
│   └── GENERO_IMPLEMENTATION.md
├── PLAN_IMPLEMENTACION_CUOTAS_V2.md  (este documento)
├── CLAUDE.md
└── package.json
```

### Anexo D: Referencias y Documentación

#### Documentación Externa

- **Prisma ORM**: https://www.prisma.io/docs
- **Jest Testing**: https://jestjs.io/docs/getting-started
- **Supertest**: https://github.com/visionmedia/supertest
- **TypeScript**: https://www.typescriptlang.org/docs
- **Express.js**: https://expressjs.com/en/guide/routing.html

#### Documentación Interna

- `CLAUDE.md`: Guía del proyecto SIGESDA
- `PLAN_SECCIONES_ACTIVIDADES.md`: Plan de secciones (referencia)
- `GENERO_IMPLEMENTATION.md`: Implementación de género en personas

#### Contactos

- **Tech Lead**: [Nombre]
- **Product Owner**: [Nombre]
- **DBA**: [Nombre]
- **QA Lead**: [Nombre]

---

## Conclusión

Este plan de implementación proporciona una ruta clara y estructurada para transformar el sistema de generación de cuotas de SIGESDA de un modelo rígido a una arquitectura flexible basada en ítems configurables.

### Beneficios Clave del Nuevo Sistema

1. **Flexibilidad**: Admin puede crear nuevos conceptos de cuota sin modificar código
2. **Transparencia**: Desglose completo y auditable de cada concepto
3. **Configurabilidad**: Reglas de descuentos adaptables a cada organización
4. **Performance**: 20x más rápido en generación masiva
5. **Mantenibilidad**: Código limpio, testeado y documentado

### Recomendaciones para el Éxito

1. **Ejecutar Fases 0-4** como prioridad (MVP funcional)
2. **No saltar Fase 0**: Backups y preparación son críticos
3. **Tests exhaustivos** antes de cada merge a main
4. **Code reviews** obligatorios para todas las fases
5. **Comunicación constante** con stakeholders

### Próximos Pasos

1. ✅ **Revisar y aprobar** este plan
2. ✅ **Asignar recursos** al proyecto
3. ✅ **Crear branch** `feature/cuotas-items-system`
4. ✅ **Ejecutar Fase 0** (preparación)
5. ✅ **Kick-off** de Fase 1

---

**Documento elaborado por**: Claude Code (Anthropic)
**Fecha**: 2025-12-12
**Versión**: 1.0
**Estado**: Pendiente de aprobación

---

