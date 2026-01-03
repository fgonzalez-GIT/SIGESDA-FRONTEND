# 📋 Plan de Migración: Tipos de Contacto - ENUM a Catálogo

**Versión:** 1.0
**Fecha:** 2025-01-06
**Backend Version:** back-etapa-7.5
**Frontend Version:** front-etapa-7.5
**Basado en:** `docs/FRONTEND_API_TIPOS_CONTACTO.md`

---

## 📊 Resumen Ejecutivo

### ¿Qué cambió en el backend?

El sistema de tipos de contacto migró de **ENUM hardcodeado** a **catálogo dinámico** en base de datos, permitiendo:

- ✅ Agregar nuevos tipos sin modificar código
- ✅ Iconos y descripciones personalizables
- ✅ Validación de formato mediante regex patterns
- ✅ Administración CRUD completa desde interfaz

### Breaking Changes Principales

| Aspecto | ANTES (ENUM) | AHORA (Catálogo) |
|---------|--------------|------------------|
| **Campo en POST/PUT** | `tipoContacto: 'EMAIL'` (string) | `tipoContactoId: 1` (number) |
| **Campo en GET** | `tipoContacto: 'EMAIL'` | `tipoContacto: { id, codigo, nombre, icono, pattern, ... }` |
| **Principal** | `esPrincipal: true` | `principal: true` |
| **Carga de tipos** | Hardcodeado en frontend | `GET /api/catalogos/tipos-contacto` |

### Estado Actual del Frontend

**✅ Ya implementado:**
- `TipoContacto` interface básica (sin `pattern`)
- `Contacto` interface con `tipoContactoId`
- Schemas Zod para crear/actualizar tipos contacto (admin)
- Schemas Zod para crear/actualizar contactos de persona
- Página admin de tipos contacto (`TiposContactoAdminPage.tsx`)
- Componentes de formularios (`AgregarContactoModal.tsx`)

**❌ Falta actualizar:**
- Campo `pattern` en `TipoContacto` interface
- Cambio de `esPrincipal` → `principal` en toda la codebase
- Carga de tipos contacto desde API (actualmente retorna array vacío)
- Validación de formato según `pattern` en formularios
- Endpoints admin para tipos contacto en `personasApi.ts`
- Max length de `observaciones` (actualmente 200, debe ser 500)

---

## 🎯 Plan de Implementación

### Fase 1: Actualizar Modelos de Datos (TypeScript)
**Archivos:** `src/types/persona.types.ts`

### Fase 2: Actualizar Schemas de Validación (Zod)
**Archivos:** `src/schemas/persona.schema.ts`

### Fase 3: Actualizar API Service
**Archivos:** `src/services/personasApi.ts`

### Fase 4: Actualizar Componentes
**Archivos:** `src/components/personas/v2/contactos/*`, `src/pages/Personas/*`

### Fase 5: Agregar Validación de Pattern
**Archivos:** `src/components/personas/v2/forms/*`

### Fase 6: Testing y Verificación
**Archivos:** Tests, validación manual

---

## ✅ Checklist Detallado de Migración

### 📦 FASE 1: Tipos TypeScript

**Archivo:** `src/types/persona.types.ts`

#### 1.1 Actualizar `TipoContacto` interface

- [ ] **Línea ~75-83**: Agregar campo `pattern: string | null`
- [ ] Verificar que existan todos los campos según la guía:
  - [ ] `id: number`
  - [ ] `codigo: string`
  - [ ] `nombre: string`
  - [ ] `descripcion?: string | null`
  - [ ] `icono?: string | null`
  - [ ] `pattern?: string | null` ← **NUEVO**
  - [ ] `activo: boolean`
  - [ ] `orden: number`
  - [ ] `createdAt?: string`
  - [ ] `updatedAt?: string`

**Ejemplo de cambio:**
```typescript
// ANTES
export interface TipoContacto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  activo: boolean;
  orden: number;
}

// DESPUÉS
export interface TipoContacto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  icono?: string | null;
  pattern?: string | null;  // ← NUEVO
  activo: boolean;
  orden: number;
  createdAt?: string;
  updatedAt?: string;
}
```

#### 1.2 Actualizar `Contacto` interface

- [ ] **Línea ~148**: Cambiar `esPrincipal: boolean` → `principal: boolean`
- [ ] **Línea ~149**: Verificar que `activo: boolean` esté presente
- [ ] **Línea ~150**: Cambiar max length de `observaciones` (comentario)

**Ejemplo de cambio:**
```typescript
// ANTES
export interface Contacto {
  id: number;
  personaId: number;
  tipoContactoId: number;
  valor: string;
  descripcion?: string;
  esPrincipal: boolean;  // ← Cambiar
  activo: boolean;
  observaciones?: string;
  createdAt?: string;
  updatedAt?: string;
  tipoContacto?: TipoContacto;
}

// DESPUÉS
export interface Contacto {
  id: number;
  personaId: number;
  tipoContactoId: number;
  valor: string;
  descripcion?: string;
  principal: boolean;  // ← Cambiado
  activo: boolean;
  observaciones?: string;  // max 500 caracteres
  createdAt?: string;
  updatedAt?: string;
  tipoContacto?: TipoContacto;
}
```

#### 1.3 Actualizar DTOs

- [ ] **Línea ~231**: `CreateContactoDTO` - cambiar `esPrincipal` → `principal`
- [ ] **Línea ~293**: `UpdateContactoDTO` - cambiar `esPrincipal` → `principal`
- [ ] **Línea ~455-461**: `CreateTipoContactoDTO` - agregar campo `pattern`
- [ ] **Línea ~464-472**: `UpdateTipoContactoDTO` - agregar campo `pattern`

**Ejemplo:**
```typescript
// CreateContactoDTO
export interface CreateContactoDTO {
  tipoContactoId: number;
  valor: string;
  descripcion?: string;
  principal?: boolean;  // ← Cambiar de esPrincipal
  observaciones?: string;  // max 500 caracteres
}

// CreateTipoContactoDTO
export interface CreateTipoContactoDTO {
  codigo: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  pattern?: string;  // ← NUEVO
  orden?: number;
}
```

#### 1.4 Actualizar utility functions

- [ ] **Línea ~516**: `getContactoPrincipal` - cambiar `c.esPrincipal` → `c.principal`
- [ ] **Línea ~577**: `getContactoPrincipalPorTipo` - cambiar `c.esPrincipal` → `c.principal`

---

### 🔒 FASE 2: Schemas Zod

**Archivo:** `src/schemas/persona.schema.ts`

#### 2.1 Actualizar `createContactoSchema`

- [ ] **Línea ~15**: Cambiar `esPrincipal` → `principal`
- [ ] **Línea ~16**: Actualizar `observaciones` max length 200 → 500

```typescript
// ANTES
export const createContactoSchema = z.object({
  tipoContactoId: z.number().int().positive('Tipo de contacto requerido'),
  valor: z.string().min(1, 'Valor requerido').max(200).trim(),
  descripcion: z.string().max(200).optional().nullable().transform(val => val === '' || val === null ? undefined : val),
  esPrincipal: z.boolean().default(false),  // ← Cambiar
  observaciones: z.string().max(200).optional().nullable().transform(val => val === '' || val === null ? undefined : val),  // ← Cambiar max
});

// DESPUÉS
export const createContactoSchema = z.object({
  tipoContactoId: z.number().int().positive('Tipo de contacto requerido'),
  valor: z.string().min(1, 'Valor requerido').max(200).trim(),
  descripcion: z.string().max(200).optional().nullable().transform(val => val === '' || val === null ? undefined : val),
  principal: z.boolean().default(false),  // ← Cambiado
  observaciones: z.string().max(500).optional().nullable().transform(val => val === '' || val === null ? undefined : val),  // ← Cambiado
});
```

#### 2.2 Actualizar `updateContactoSchema`

- [ ] **Línea ~23**: Cambiar `esPrincipal` → `principal`
- [ ] **Línea ~25**: Actualizar `observaciones` max length 200 → 500

```typescript
// DESPUÉS
export const updateContactoSchema = z.object({
  tipoContactoId: z.number().int().positive().optional(),
  valor: z.string().min(1).max(200).trim().optional(),
  descripcion: z.string().max(200).optional().nullable(),
  principal: z.boolean().optional(),  // ← Cambiado
  activo: z.boolean().optional(),
  observaciones: z.string().max(500).optional().nullable(),  // ← Cambiado
});
```

#### 2.3 Actualizar `createTipoContactoSchema`

- [ ] **Línea ~194**: Agregar campo `pattern` con validación

```typescript
// ANTES
export const createTipoContactoSchema = z.object({
  codigo: z.string().min(2).max(50).regex(/^[A-Z_]+$/).transform(val => val.toUpperCase()),
  nombre: z.string().min(3).max(100).trim(),
  descripcion: z.string().max(300).optional().nullable(),
  icono: z.string().max(50).optional().nullable(),
  orden: z.number().int().positive().optional(),
});

// DESPUÉS
export const createTipoContactoSchema = z.object({
  codigo: z.string().min(2).max(50).regex(/^[A-Z_]+$/).transform(val => val.toUpperCase()),
  nombre: z.string().min(3).max(100).trim(),
  descripcion: z.string().max(500).optional().nullable(),  // ← Cambiar max 300 → 500
  icono: z.string().max(50).optional().nullable(),
  pattern: z.string().max(500).optional().nullable(),  // ← NUEVO
  orden: z.number().int().nonnegative().optional(),  // ← Cambiar positive → nonnegative (permitir 0)
});
```

#### 2.4 Actualizar `updateTipoContactoSchema`

- [ ] **Línea ~201**: Agregar campo `pattern`

```typescript
// DESPUÉS
export const updateTipoContactoSchema = z.object({
  nombre: z.string().min(3).max(100).trim().optional(),
  descripcion: z.string().max(500).optional().nullable(),  // ← Cambiar max 300 → 500
  icono: z.string().max(50).optional().nullable(),
  pattern: z.string().max(500).optional().nullable(),  // ← NUEVO
  activo: z.boolean().optional(),
  orden: z.number().int().nonnegative().optional(),  // ← Cambiar positive → nonnegative
});
```

#### 2.5 Actualizar validaciones de persona

- [ ] **Línea ~135**: Cambiar `c.esPrincipal` → `c.principal` en validación de contactos principales

```typescript
// Línea ~134-141
.refine(data => {
  if (data.contactos && data.contactos.length > 0) {
    const contactosPrincipales = data.contactos.filter(c => c.principal);  // ← Cambiar
    return contactosPrincipales.length <= 1;
  }
  return true;
}, {
  message: 'Solo puede haber un contacto principal',
  path: ['contactos'],
});
```

---

### 🔌 FASE 3: API Service

**Archivo:** `src/services/personasApi.ts`

#### 3.1 Actualizar `getCatalogos()`

- [ ] **Línea ~52-89**: Activar carga de tipos contacto

```typescript
// ANTES (línea 69)
tiposContacto: [], // No existe endpoint en backend

// DESPUÉS
const [tiposRes, especialidadesRes, categoriasRes, razonesRes, tiposContactoRes] = await Promise.allSettled([
  api.get('/catalogos/tipos-persona'),
  api.get('/catalogos/especialidades-docentes'),
  api.get('/categorias-socios'),
  api.get('/catalogos/razones-sociales'),
  api.get('/catalogos/tipos-contacto'),  // ← NUEVO
]);

// ...

const catalogos: CatalogosPersonas = {
  tiposPersona: tiposRes.status === 'fulfilled' ? tiposRes.value.data.data : [],
  especialidadesDocentes: especialidadesRes.status === 'fulfilled' ? especialidadesRes.value.data.data : [],
  categoriasSocio: categoriasRes.status === 'fulfilled' ? categoriasRes.value.data.data : [],
  razonesSociales: razonesRes.status === 'fulfilled' ? razonesRes.value.data.data : [],
  tiposContacto: tiposContactoRes.status === 'fulfilled' ? tiposContactoRes.value.data.data : [],  // ← NUEVO
};
```

#### 3.2 Agregar endpoint `getTiposContacto()`

- [ ] **Después de línea ~100**: Agregar método para obtener tipos contacto

```typescript
/**
 * Obtener catálogo de tipos de contacto
 * GET /api/catalogos/tipos-contacto
 */
getTiposContacto: async (params?: {
  soloActivos?: boolean;
  ordenarPor?: 'orden' | 'nombre' | 'codigo';
}): Promise<ApiResponse<TipoContacto[]>> => {
  const response = await api.get('/catalogos/tipos-contacto', { params });
  return response.data;
},

/**
 * Obtener tipo de contacto por ID
 * GET /api/catalogos/tipos-contacto/:id
 */
getTipoContactoById: async (id: number): Promise<ApiResponse<TipoContacto>> => {
  const response = await api.get(`/catalogos/tipos-contacto/${id}`);
  return response.data;
},
```

#### 3.3 Actualizar endpoints de contactos (esPrincipal → principal)

- [ ] Buscar todos los lugares donde se use `esPrincipal` y cambiar a `principal`
- [ ] Verificar DTOs en requests/responses

#### 3.4 Agregar endpoints admin de tipos contacto

- [ ] **Dentro de `admin` object (~línea 444)**: Agregar métodos CRUD para tipos contacto

```typescript
admin: {
  // ... (métodos existentes de tiposPersona, especialidades)

  /**
   * Crear un nuevo tipo de contacto (admin)
   * POST /api/catalogos/tipos-contacto
   */
  createTipoContacto: async (
    tipo: CreateTipoContactoDTO
  ): Promise<ApiResponse<TipoContacto>> => {
    const response = await api.post('/catalogos/tipos-contacto', tipo);
    return response.data;
  },

  /**
   * Actualizar un tipo de contacto (admin)
   * PUT /api/catalogos/tipos-contacto/:id
   */
  updateTipoContacto: async (
    id: number,
    tipo: UpdateTipoContactoDTO
  ): Promise<ApiResponse<TipoContacto>> => {
    const response = await api.put(`/catalogos/tipos-contacto/${id}`, tipo);
    return response.data;
  },

  /**
   * Eliminar un tipo de contacto (admin)
   * DELETE /api/catalogos/tipos-contacto/:id
   */
  deleteTipoContacto: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/catalogos/tipos-contacto/${id}`);
    return response.data;
  },

  /**
   * Desactivar tipo de contacto
   * POST /api/catalogos/tipos-contacto/:id/desactivar
   */
  desactivarTipoContacto: async (id: number): Promise<ApiResponse<TipoContacto>> => {
    const response = await api.post(`/catalogos/tipos-contacto/${id}/desactivar`);
    return response.data;
  },

  /**
   * Activar tipo de contacto
   * POST /api/catalogos/tipos-contacto/:id/activar
   */
  activarTipoContacto: async (id: number): Promise<ApiResponse<TipoContacto>> => {
    const response = await api.post(`/catalogos/tipos-contacto/${id}/activar`);
    return response.data;
  },

  /**
   * Reordenar tipos de contacto
   * POST /api/catalogos/tipos-contacto/reordenar
   */
  reorderTiposContacto: async (data: ReorderCatalogoDTO): Promise<ApiResponse<null>> => {
    const response = await api.post('/catalogos/tipos-contacto/reordenar', data);
    return response.data;
  },
}
```

#### 3.5 Agregar endpoint de estadísticas

- [ ] **Después de métodos admin**: Agregar método de estadísticas

```typescript
/**
 * Obtener estadísticas de uso de tipos de contacto
 * GET /api/catalogos/tipos-contacto/estadisticas/uso
 */
getEstadisticasTiposContacto: async (): Promise<ApiResponse<any[]>> => {
  const response = await api.get('/catalogos/tipos-contacto/estadisticas/uso');
  return response.data;
},
```

---

### 🎨 FASE 4: Componentes

#### 4.1 AgregarContactoModal.tsx

**Archivo:** `src/components/personas/v2/contactos/AgregarContactoModal.tsx`

- [ ] **Línea ~83**: Cambiar `esPrincipal: false` → `principal: false`
- [ ] **Línea ~96**: Cambiar `esPrincipal: contacto.esPrincipal` → `principal: contacto.principal`
- [ ] **Línea ~104**: Cambiar `esPrincipal: false` → `principal: false`
- [ ] **Línea ~279**: Cambiar nombre del campo de `esPrincipal` → `principal`
- [ ] **Línea ~289**: Actualizar helper text para mencionar "un contacto principal por tipo" (no por persona)

```typescript
// ANTES (líneas 79-84)
defaultValues: {
  tipoContactoId: 0,
  valor: '',
  descripcion: '',
  esPrincipal: false,  // ← Cambiar
},

// DESPUÉS
defaultValues: {
  tipoContactoId: 0,
  valor: '',
  descripcion: '',
  principal: false,  // ← Cambiado
},
```

```typescript
// ANTES (línea 289)
<FormHelperText>
  Solo puede haber un contacto principal por persona
</FormHelperText>

// DESPUÉS
<FormHelperText>
  Solo puede haber un contacto principal por tipo de contacto
</FormHelperText>
```

#### 4.2 ContactoItem.tsx

**Archivo:** `src/components/personas/v2/contactos/ContactoItem.tsx`

- [ ] Buscar referencias a `contacto.esPrincipal` y cambiar a `contacto.principal`
- [ ] Actualizar tooltips/labels según corresponda

#### 4.3 ContactoBadge.tsx

**Archivo:** `src/components/personas/v2/contactos/ContactoBadge.tsx`

- [ ] Buscar referencias a `contacto.esPrincipal` y cambiar a `contacto.principal`

#### 4.4 ContactosTab.tsx

**Archivo:** `src/components/personas/v2/contactos/ContactosTab.tsx`

- [ ] Buscar referencias a `esPrincipal` y cambiar a `principal`
- [ ] Verificar lógica de actualización de contacto principal

#### 4.5 ContactosFormSection.tsx

**Archivo:** `src/components/personas/v2/forms/ContactosFormSection.tsx`

- [ ] Buscar referencias a `esPrincipal` y cambiar a `principal`
- [ ] Verificar validaciones de contacto principal

#### 4.6 TiposContactoAdminPage.tsx

**Archivo:** `src/pages/Personas/Admin/TiposContactoAdminPage.tsx`

- [ ] **Revisar columnas de tabla**: Agregar columna para `pattern` si no existe
- [ ] **Revisar campos de formulario**: Agregar campo `pattern` en el form dialog
- [ ] **Actualizar llamadas a API**: Usar nuevos métodos admin (`createTipoContacto`, etc.)
- [ ] **Agregar estadísticas**: Mostrar uso de cada tipo de contacto (opcional)

---

### 🔍 FASE 5: Validación de Pattern

#### 5.1 Crear función de validación de pattern

**Archivo:** `src/utils/contacto.utils.ts` (CREAR SI NO EXISTE)

- [ ] Crear archivo de utilidades para contactos
- [ ] Agregar función `validatePattern`

```typescript
/**
 * Validar formato de valor según pattern del tipo de contacto
 */
export const validatePattern = (valor: string, pattern: string | null | undefined): boolean => {
  if (!pattern || pattern.trim() === '') {
    return true; // Sin pattern, siempre válido
  }

  try {
    const regex = new RegExp(pattern);
    return regex.test(valor);
  } catch (error) {
    console.error('Pattern inválido:', pattern, error);
    return true; // Si el pattern es inválido, permitir el valor
  }
};

/**
 * Obtener mensaje de error de formato según el tipo
 */
export const getPatternErrorMessage = (tipoNombre: string): string => {
  return `El formato del valor no es válido para ${tipoNombre}`;
};
```

#### 5.2 Integrar validación en AgregarContactoModal

**Archivo:** `src/components/personas/v2/contactos/AgregarContactoModal.tsx`

- [ ] Importar `validatePattern` y `getPatternErrorMessage`
- [ ] Agregar validación en tiempo real (onChange o onBlur)
- [ ] Mostrar mensaje de error si el formato es inválido
- [ ] Deshabilitar botón de submit si hay error de formato

```typescript
import { validatePattern, getPatternErrorMessage } from '@/utils/contacto.utils';

// Dentro del componente
const [patternError, setPatternError] = useState<string | null>(null);

const valorWatch = watch('valor');

// Validar pattern cuando cambia el valor o el tipo
useEffect(() => {
  if (!tipoContactoIdWatch || !valorWatch) {
    setPatternError(null);
    return;
  }

  const tipo = catalogos?.tiposContacto.find(t => t.id === tipoContactoIdWatch);
  if (!tipo) {
    setPatternError(null);
    return;
  }

  if (!validatePattern(valorWatch, tipo.pattern)) {
    setPatternError(getPatternErrorMessage(tipo.nombre));
  } else {
    setPatternError(null);
  }
}, [tipoContactoIdWatch, valorWatch, catalogos]);

// En el TextField de valor
<TextField
  {...field}
  fullWidth
  label="Valor *"
  placeholder={getPlaceholderByTipo(tipoContactoIdWatch)}
  error={!!errors.valor || !!patternError}
  helperText={
    errors.valor?.message ||
    patternError ||
    getHelperTextByTipo(tipoContactoIdWatch)
  }
/>

// En el botón de submit
<Button
  type="submit"
  variant="contained"
  disabled={loading || !!patternError}  // ← Agregar validación
>
  {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Agregar'}
</Button>
```

#### 5.3 Actualizar placeholders y helper texts

**Archivo:** `src/components/personas/v2/contactos/AgregarContactoModal.tsx`

- [ ] Actualizar `getHelperTextByTipo` para usar descripción del catálogo si existe
- [ ] Mostrar pattern en el helper text (opcional)

```typescript
const getHelperTextByTipo = (tipoId: number): string => {
  const tipo = catalogos?.tiposContacto.find((t) => t.id === tipoId);
  if (!tipo) return '';

  // Priorizar descripción del catálogo
  if (tipo.descripcion) {
    return tipo.descripcion;
  }

  // Fallback a descripciones hardcodeadas
  const codigo = tipo.codigo.toUpperCase();
  switch (codigo) {
    case 'WHATSAPP':
      return 'Número con código de país (ej: +54 9 11 1234-5678)';
    // ... resto de casos
    default:
      return '';
  }
};
```

---

### 🧪 FASE 6: Testing y Verificación

#### 6.1 Testing Manual

- [ ] **Crear tipo de contacto** desde página admin
  - [ ] Verificar que se cree correctamente
  - [ ] Verificar que aparezca en el selector de tipos
  - [ ] Probar con y sin `pattern`
- [ ] **Editar tipo de contacto**
  - [ ] Modificar nombre, descripción, icono
  - [ ] Agregar/modificar/eliminar pattern
  - [ ] Verificar que los cambios se reflejen en formularios
- [ ] **Desactivar tipo de contacto**
  - [ ] Verificar que no aparezca en selector (solo activos)
  - [ ] Verificar que contactos existentes mantengan referencia
- [ ] **Crear contacto de persona**
  - [ ] Seleccionar tipo con pattern
  - [ ] Intentar ingresar valor inválido → debe mostrar error
  - [ ] Ingresar valor válido → debe guardar correctamente
  - [ ] Verificar campo `principal` (no `esPrincipal`)
- [ ] **Editar contacto**
  - [ ] Cambiar tipo de contacto
  - [ ] Cambiar valor
  - [ ] Cambiar estado de principal
  - [ ] Verificar validación de pattern al cambiar tipo
- [ ] **Validación de principal**
  - [ ] Crear 2 contactos del mismo tipo
  - [ ] Marcar uno como principal
  - [ ] Marcar el otro como principal → el primero debe desmarcarse automáticamente
- [ ] **Eliminar contacto**
  - [ ] Soft delete (debe marcar `activo: false`)
  - [ ] Verificar que no aparezca en lista de contactos activos

#### 6.2 Testing de Integración API

- [ ] **GET /api/catalogos/tipos-contacto**
  - [ ] Verificar que retorne array de tipos
  - [ ] Verificar estructura de cada tipo (incluido `pattern`)
  - [ ] Probar filtros: `soloActivos`, `ordenarPor`
- [ ] **GET /api/catalogos/tipos-contacto/:id**
  - [ ] Obtener tipo específico
  - [ ] Verificar 404 si no existe
- [ ] **POST /api/catalogos/tipos-contacto**
  - [ ] Crear tipo con todos los campos
  - [ ] Verificar validación de `codigo` único
  - [ ] Verificar validación de `pattern` (regex válido)
- [ ] **PUT /api/catalogos/tipos-contacto/:id**
  - [ ] Actualizar campos
  - [ ] Verificar que no se pueda cambiar `codigo` a uno existente
- [ ] **DELETE /api/catalogos/tipos-contacto/:id**
  - [ ] Intentar eliminar tipo con contactos → debe fallar (409)
  - [ ] Eliminar tipo sin contactos → debe funcionar
- [ ] **POST /api/catalogos/tipos-contacto/:id/desactivar**
  - [ ] Desactivar tipo con contactos → debe funcionar
  - [ ] Verificar que contactos existentes mantengan referencia
- [ ] **GET /api/catalogos/tipos-contacto/estadisticas/uso**
  - [ ] Obtener estadísticas de uso
  - [ ] Verificar formato de respuesta

#### 6.3 Testing de Componentes

- [ ] **AgregarContactoModal**
  - [ ] Renderiza correctamente en modo creación
  - [ ] Renderiza correctamente en modo edición
  - [ ] Muestra tipos de contacto activos del catálogo
  - [ ] Valida pattern en tiempo real
  - [ ] Muestra mensajes de error apropiados
  - [ ] Campo `principal` funciona correctamente
- [ ] **ContactoItem**
  - [ ] Muestra icono del tipo de contacto
  - [ ] Muestra badge "Principal" si corresponde
  - [ ] Acciones de editar/eliminar funcionan
- [ ] **ContactosTab**
  - [ ] Lista contactos activos de la persona
  - [ ] Botón agregar abre modal
  - [ ] Actualiza lista después de crear/editar/eliminar
- [ ] **TiposContactoAdminPage**
  - [ ] Tabla muestra todos los tipos (incluido `pattern`)
  - [ ] Formulario incluye campo `pattern`
  - [ ] Crear/editar/desactivar funcionan correctamente
  - [ ] Muestra estadísticas de uso (opcional)

#### 6.4 Verificación de Compatibilidad

- [ ] **Migración de datos existentes**
  - [ ] Verificar que contactos antiguos tengan `tipoContactoId` válido
  - [ ] Verificar que campo `principal` esté correcto (no `esPrincipal`)
- [ ] **Logs de consola**
  - [ ] No deben haber errores 404 para `/catalogos/tipos-contacto`
  - [ ] No deben haber warnings de campos deprecated
- [ ] **TypeScript**
  - [ ] No deben haber errores de tipos
  - [ ] Autocomplete funciona correctamente

---

## 📝 Notas Importantes

### Reglas de Negocio a Recordar

1. **Contacto Principal por Tipo**
   - Solo puede haber UN contacto principal **por tipo de contacto**
   - Al marcar uno como principal, los demás del mismo tipo se desmarcan automáticamente
   - Esta lógica la maneja el backend

2. **Validación de Pattern**
   - El pattern es opcional
   - Si existe, el valor debe cumplir el regex
   - Validación en frontend (UX) y backend (seguridad)

3. **Soft Delete**
   - DELETE de contacto es soft delete (marca `activo: false`)
   - Hard delete solo con endpoint `/permanente` (admin)

4. **Tipos de Contacto**
   - No se pueden eliminar tipos con contactos asociados
   - Se deben desactivar en su lugar
   - Tipos inactivos no aparecen en selectores pero mantienen referencia en contactos existentes

### Endpoints Críticos

**Catálogo:**
- `GET /api/catalogos/tipos-contacto` - Listar tipos (filtrable)
- `GET /api/catalogos/tipos-contacto/:id` - Obtener tipo específico

**CRUD Tipos (Admin):**
- `POST /api/catalogos/tipos-contacto` - Crear tipo
- `PUT /api/catalogos/tipos-contacto/:id` - Actualizar tipo
- `DELETE /api/catalogos/tipos-contacto/:id` - Eliminar tipo (hard)
- `POST /api/catalogos/tipos-contacto/:id/desactivar` - Desactivar (soft)
- `POST /api/catalogos/tipos-contacto/:id/activar` - Reactivar

**Contactos de Persona:**
- `GET /api/personas/:personaId/contactos` - Listar contactos
- `POST /api/personas/:personaId/contactos` - Crear contacto
- `PUT /api/personas/:personaId/contactos/:id` - Actualizar contacto
- `DELETE /api/personas/:personaId/contactos/:id` - Eliminar contacto (soft)

**Estadísticas:**
- `GET /api/catalogos/tipos-contacto/estadisticas/uso` - Estadísticas de uso

---

## 🚀 Orden de Implementación Recomendado

1. **Día 1: Modelos y Schemas**
   - Actualizar `persona.types.ts`
   - Actualizar `persona.schema.ts`
   - Correr TypeScript para verificar errores

2. **Día 2: API Service**
   - Actualizar `personasApi.ts`
   - Probar endpoints con Postman/Thunder Client
   - Verificar respuestas

3. **Día 3: Componentes Básicos**
   - Actualizar `AgregarContactoModal`
   - Actualizar componentes de contactos
   - Testing manual básico

4. **Día 4: Validación de Pattern**
   - Crear utilidades de validación
   - Integrar en formularios
   - Testing de validaciones

5. **Día 5: Admin Page y Testing Final**
   - Actualizar `TiposContactoAdminPage`
   - Testing completo
   - Verificación de integración

---

## 📚 Referencias

- **Guía del Backend:** `docs/FRONTEND_API_TIPOS_CONTACTO.md`
- **Documentación MUI:** https://mui.com/material-ui/
- **Zod Docs:** https://zod.dev/
- **React Hook Form:** https://react-hook-form.com/

---

## ✅ Sign-off Final

### Pre-Deployment Checklist

- [ ] Todos los tests unitarios pasan
- [ ] Testing manual completado sin errores
- [ ] No hay errores de TypeScript
- [ ] No hay warnings en consola del navegador
- [ ] Documentación actualizada (CLAUDE.md si es necesario)
- [ ] Code review aprobado
- [ ] Backend está en version back-etapa-7.5 o superior

### Post-Deployment Verification

- [ ] Verificar en producción que se cargan los tipos de contacto
- [ ] Crear un tipo de contacto de prueba
- [ ] Crear un contacto de persona con validación de pattern
- [ ] Verificar que contactos antiguos funcionan correctamente
- [ ] Monitorear logs por errores relacionados a tipos contacto

---

**Última actualización:** 2025-01-06
**Autor:** Claude Code
**Estado:** En revisión
