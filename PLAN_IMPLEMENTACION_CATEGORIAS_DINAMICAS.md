# Plan de Implementación Frontend: Categorías de Socios Dinámicas

## 1. Resumen de los Cambios Backend

### Cambios Estructurales
- **Nueva entidad**: `CategoriaSocio` como tabla independiente con gestión dinámica
- **Campos eliminados**: El enum estático `CategoriaSocio` fue reemplazado
- **Nuevas relaciones**:
  - `Persona.categoriaId` → `CategoriaSocio.id` (opcional)
  - `Cuota.categoriaId` → `CategoriaSocio.id` (obligatorio)

### Nuevos Endpoints
- **Base URL**: `/api/categorias-socios`
- CRUD completo: GET, POST, PUT, PATCH, DELETE
- Endpoints especiales: `/toggle`, `/reorder`, `/stats`, `/codigo/:codigo`

### Cambios en DTOs Existentes
- `CreatePersonaDto` / `UpdatePersonaDto`: `categoria` (enum) → `categoriaId` (string)
- `CreateCuotaDto` / `UpdateCuotaDto`: `categoria` (enum) → `categoriaId` (string, requerido)

### Campos del Nuevo Modelo
```typescript
{
  id: string
  codigo: string          // "ACTIVO", "ESTUDIANTE", etc.
  nombre: string          // "Socio Activo"
  descripcion: string?    // Opcional
  montoCuota: Decimal     // Monto base
  descuento: Decimal      // 0-100 (porcentaje)
  activa: boolean         // Estado
  orden: number           // Para ordenamiento UI
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 2. Impacto en el Frontend

### Módulos Afectados

#### 🔴 **Crítico - Requiere actualización inmediata**
1. **Types/Interfaces**
   - `src/types/` - Todas las interfaces de Persona y Cuota
   - Necesario definir nueva interfaz `CategoriaSocio`

2. **Servicios API**
   - `src/services/personasApi.ts` - Endpoints de personas
   - `src/services/cuotasApi.ts` - Endpoints de cuotas (si existe)
   - **NUEVO**: `src/services/categoriasApi.ts` - Gestión de categorías

3. **Redux Store**
   - `src/store/slices/personasSlice.ts` - State y reducers
   - `src/store/slices/cuotasSlice.ts` - State y reducers (si existe)
   - **NUEVO**: `src/store/slices/categoriasSlice.ts` - Estado de categorías

4. **Formularios**
   - `src/components/forms/PersonaFormSimple.tsx` - Campo categoría
   - Formularios de Cuotas (si existen) - Campo categoría

#### 🟡 **Importante - Actualización media prioridad**
5. **Vistas/Páginas**
   - `src/pages/Personas/PersonasPageSimple.tsx` - Visualización de categorías
   - `src/pages/Cuotas/CuotasPage.tsx` - Visualización de categorías
   - **NUEVO**: `src/pages/Categorias/CategoriasPage.tsx` - Gestión de categorías

6. **Schemas de Validación**
   - `src/schemas/` - Validaciones con Zod
   - Actualizar esquemas de Persona y Cuota

#### 🟢 **Opcional - Mejoras adicionales**
7. **Componentes UI**
   - Selector de categorías reutilizable
   - Badges para mostrar categorías
   - Componente de estadísticas de categorías

---

## 3. Plan de Acción Técnico Paso a Paso

### FASE 1: Preparación - Types e Interfaces

#### Paso 1.1: Crear interfaces de CategoriaSocio
**Archivo**: `src/types/categoria.ts` (NUEVO)

```typescript
// Definir interfaz principal
export interface CategoriaSocio {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  montoCuota: string  // Decimal como string
  descuento: string   // Decimal como string
  activa: boolean
  orden: number
  createdAt: string
  updatedAt: string
  _count?: {
    personas: number
    cuotas: number
  }
}

// DTOs para operaciones
export interface CreateCategoriaDto {
  codigo: string
  nombre: string
  descripcion?: string
  montoCuota: number
  descuento: number
  orden?: number
}

export interface UpdateCategoriaDto {
  codigo?: string
  nombre?: string
  descripcion?: string
  montoCuota?: number
  descuento?: number
  activa?: boolean
  orden?: number
}

// Para respuestas de estadísticas
export interface CategoriaStats {
  categoria: CategoriaSocio
  stats: {
    totalPersonas: number
    totalCuotas: number
    totalRecaudado: string
  }
}
```

#### Paso 1.2: Actualizar interfaces de Persona
**Archivo**: `src/types/persona.ts` (o similar)

```typescript
// ANTES
interface Persona {
  // ...
  categoria: 'ACTIVO' | 'ESTUDIANTE' | 'FAMILIAR' | 'JUBILADO'
}

// DESPUÉS
interface Persona {
  // ...
  categoriaId?: string  // FK a CategoriaSocio
  categoria?: CategoriaSocio  // Populated object
}
```

#### Paso 1.3: Actualizar interfaces de Cuota
**Archivo**: `src/types/cuota.ts` (o similar)

```typescript
// ANTES
interface Cuota {
  // ...
  categoria: 'ACTIVO' | 'ESTUDIANTE' | 'FAMILIAR' | 'JUBILADO'
}

// DESPUÉS
interface Cuota {
  // ...
  categoriaId: string  // Ahora es obligatorio
  categoria?: CategoriaSocio  // Populated object
}
```

---

### FASE 2: Servicios API

#### Paso 2.1: Crear servicio de categorías
**Archivo**: `src/services/categoriasApi.ts` (NUEVO)

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { CategoriaSocio, CreateCategoriaDto, UpdateCategoriaDto, CategoriaStats } from '../types/categoria'

export const categoriasApi = createApi({
  reducerPath: 'categoriasApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api' }),
  tagTypes: ['Categoria'],
  endpoints: (builder) => ({
    // Listar categorías
    getCategorias: builder.query<{
      data: CategoriaSocio[]
      total: number
    }, { includeInactive?: boolean; search?: string } | void>({
      query: (params) => ({
        url: '/categorias-socios',
        params
      }),
      providesTags: ['Categoria']
    }),

    // Obtener por ID
    getCategoriaById: builder.query<CategoriaSocio, string>({
      query: (id) => `/categorias-socios/${id}`,
      providesTags: ['Categoria']
    }),

    // Obtener por código
    getCategoriaByCodigo: builder.query<CategoriaSocio, string>({
      query: (codigo) => `/categorias-socios/codigo/${codigo}`,
      providesTags: ['Categoria']
    }),

    // Crear categoría
    createCategoria: builder.mutation<CategoriaSocio, CreateCategoriaDto>({
      query: (body) => ({
        url: '/categorias-socios',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Categoria']
    }),

    // Actualizar categoría
    updateCategoria: builder.mutation<CategoriaSocio, { id: string; data: UpdateCategoriaDto }>({
      query: ({ id, data }) => ({
        url: `/categorias-socios/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Categoria']
    }),

    // Toggle activa
    toggleCategoria: builder.mutation<CategoriaSocio, string>({
      query: (id) => ({
        url: `/categorias-socios/${id}/toggle`,
        method: 'PATCH'
      }),
      invalidatesTags: ['Categoria']
    }),

    // Reordenar
    reorderCategorias: builder.mutation<void, string[]>({
      query: (categoriaIds) => ({
        url: '/categorias-socios/reorder',
        method: 'POST',
        body: { categoriaIds }
      }),
      invalidatesTags: ['Categoria']
    }),

    // Estadísticas
    getCategoriaStats: builder.query<CategoriaStats, string>({
      query: (id) => `/categorias-socios/${id}/stats`
    }),

    // Eliminar
    deleteCategoria: builder.mutation<void, string>({
      query: (id) => ({
        url: `/categorias-socios/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Categoria']
    })
  })
})

export const {
  useGetCategoriasQuery,
  useGetCategoriaByIdQuery,
  useGetCategoriaByCodigoQuery,
  useCreateCategoriaMutation,
  useUpdateCategoriaMutation,
  useToggleCategoriaMutation,
  useReorderCategoriasMutation,
  useGetCategoriaStatsQuery,
  useDeleteCategoriaMutation
} = categoriasApi
```

#### Paso 2.2: Actualizar servicio de personas
**Archivo**: `src/services/personasApi.ts`

**Cambios necesarios**:
1. Actualizar tipos de request/response para usar `categoriaId` en lugar de `categoria`
2. Agregar `include` para popular la relación `categoria` en las queries
3. Actualizar interfaces de los DTOs

```typescript
// Ejemplo de cambio en endpoint
getPersonas: builder.query<Persona[], void>({
  query: () => ({
    url: '/personas',
    params: {
      include: 'categoria'  // Popular la relación
    }
  }),
  providesTags: ['Persona']
})
```

#### Paso 2.3: Actualizar servicio de cuotas
**Archivo**: Similar a personas, actualizar para usar `categoriaId`

---

### FASE 3: Redux Store

#### Paso 3.1: Integrar API de categorías en el store
**Archivo**: `src/store/index.ts`

```typescript
import { categoriasApi } from '../services/categoriasApi'

export const store = configureStore({
  reducer: {
    // ... otros reducers
    [categoriasApi.reducerPath]: categoriasApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      // ... otros middlewares
      categoriasApi.middleware
    )
})
```

#### Paso 3.2: Crear slice de categorías (opcional)
**Archivo**: `src/store/slices/categoriasSlice.ts` (NUEVO)

Si necesitas estado local adicional (ej: categoría seleccionada, filtros, etc.):

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { CategoriaSocio } from '../../types/categoria'

interface CategoriasState {
  selectedCategoria: CategoriaSocio | null
  showInactive: boolean
}

const initialState: CategoriasState = {
  selectedCategoria: null,
  showInactive: false
}

const categoriasSlice = createSlice({
  name: 'categorias',
  initialState,
  reducers: {
    setSelectedCategoria: (state, action: PayloadAction<CategoriaSocio | null>) => {
      state.selectedCategoria = action.payload
    },
    toggleShowInactive: (state) => {
      state.showInactive = !state.showInactive
    }
  }
})

export const { setSelectedCategoria, toggleShowInactive } = categoriasSlice.actions
export default categoriasSlice.reducer
```

#### Paso 3.3: Actualizar slices existentes
**Archivos**: `personasSlice.ts`, `cuotasSlice.ts`

- Actualizar tipos para reflejar `categoriaId` en lugar de `categoria`
- Revisar reducers que manipulen el campo categoría

---

### FASE 4: Schemas de Validación

#### Paso 4.1: Crear schema de categoría
**Archivo**: `src/schemas/categoriaSchema.ts` (NUEVO)

```typescript
import { z } from 'zod'

export const createCategoriaSchema = z.object({
  codigo: z
    .string()
    .min(2, 'Código debe tener al menos 2 caracteres')
    .max(20, 'Código debe tener máximo 20 caracteres')
    .regex(/^[A-Z_]+$/, 'Código debe contener solo mayúsculas y guiones bajos')
    .transform(val => val.toUpperCase()),

  nombre: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(50, 'Nombre debe tener máximo 50 caracteres'),

  descripcion: z
    .string()
    .max(200, 'Descripción debe tener máximo 200 caracteres')
    .optional(),

  montoCuota: z
    .number()
    .min(0, 'Monto debe ser positivo')
    .max(1000000, 'Monto excede el máximo permitido'),

  descuento: z
    .number()
    .min(0, 'Descuento debe ser entre 0 y 100')
    .max(100, 'Descuento debe ser entre 0 y 100'),

  orden: z
    .number()
    .int()
    .positive()
    .optional()
})

export const updateCategoriaSchema = createCategoriaSchema.partial()

export type CreateCategoriaFormData = z.infer<typeof createCategoriaSchema>
export type UpdateCategoriaFormData = z.infer<typeof updateCategoriaSchema>
```

#### Paso 4.2: Actualizar schema de persona
**Archivo**: `src/schemas/personaSchema.ts`

```typescript
// ANTES
categoria: z.enum(['ACTIVO', 'ESTUDIANTE', 'FAMILIAR', 'JUBILADO'])

// DESPUÉS
categoriaId: z.string().cuid().optional()
```

#### Paso 4.3: Actualizar schema de cuota
**Archivo**: `src/schemas/cuotaSchema.ts`

```typescript
// ANTES
categoria: z.enum(['ACTIVO', 'ESTUDIANTE', 'FAMILIAR', 'JUBILADO'])

// DESPUÉS
categoriaId: z.string().cuid({ message: 'Debe seleccionar una categoría' })
```

---

### FASE 5: Componentes Reutilizables

#### Paso 5.1: Crear selector de categorías
**Archivo**: `src/components/selects/CategoriaSelect.tsx` (NUEVO)

```typescript
import React from 'react'
import { useGetCategoriasQuery } from '../../services/categoriasApi'

interface CategoriaSelectProps {
  value?: string
  onChange: (categoriaId: string) => void
  error?: string
  includeInactive?: boolean
  required?: boolean
  label?: string
}

export const CategoriaSelect: React.FC<CategoriaSelectProps> = ({
  value,
  onChange,
  error,
  includeInactive = false,
  required = false,
  label = 'Categoría'
}) => {
  const { data, isLoading } = useGetCategoriasQuery({ includeInactive })

  return (
    <div>
      <label>
        {label} {required && '*'}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
      >
        <option value="">Seleccione una categoría</option>
        {data?.data.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nombre} - ${cat.montoCuota}
          </option>
        ))}
      </select>
      {error && <span className="error">{error}</span>}
    </div>
  )
}
```

#### Paso 5.2: Crear badge de categoría
**Archivo**: `src/components/badges/CategoriaBadge.tsx` (NUEVO)

```typescript
import React from 'react'
import type { CategoriaSocio } from '../../types/categoria'

interface CategoriaBadgeProps {
  categoria: CategoriaSocio
  showMonto?: boolean
}

export const CategoriaBadge: React.FC<CategoriaBadgeProps> = ({
  categoria,
  showMonto = false
}) => {
  return (
    <span className={`badge badge-${categoria.codigo.toLowerCase()}`}>
      {categoria.nombre}
      {showMonto && ` - $${categoria.montoCuota}`}
    </span>
  )
}
```

---

### FASE 6: Formularios

#### Paso 6.1: Actualizar PersonaFormSimple
**Archivo**: `src/components/forms/PersonaFormSimple.tsx`

**Cambios necesarios**:
1. Reemplazar campo de enum por selector dinámico
2. Usar `CategoriaSelect` component
3. Actualizar validación

```typescript
// ANTES
<select name="categoria" {...register('categoria')}>
  <option value="ACTIVO">Socio Activo</option>
  <option value="ESTUDIANTE">Estudiante</option>
  <option value="FAMILIAR">Familiar</option>
  <option value="JUBILADO">Jubilado</option>
</select>

// DESPUÉS
<CategoriaSelect
  value={watch('categoriaId')}
  onChange={(id) => setValue('categoriaId', id)}
  error={errors.categoriaId?.message}
/>
```

#### Paso 6.2: Crear CategoriaForm
**Archivo**: `src/components/forms/CategoriaForm.tsx` (NUEVO)

```typescript
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCategoriaSchema, type CreateCategoriaFormData } from '../../schemas/categoriaSchema'
import { useCreateCategoriaMutation, useUpdateCategoriaMutation } from '../../services/categoriasApi'

interface CategoriaFormProps {
  categoria?: CategoriaSocio
  onSuccess?: () => void
  onCancel?: () => void
}

export const CategoriaForm: React.FC<CategoriaFormProps> = ({
  categoria,
  onSuccess,
  onCancel
}) => {
  const isEditing = !!categoria
  const [createCategoria, { isLoading: isCreating }] = useCreateCategoriaMutation()
  const [updateCategoria, { isLoading: isUpdating }] = useUpdateCategoriaMutation()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateCategoriaFormData>({
    resolver: zodResolver(createCategoriaSchema),
    defaultValues: categoria ? {
      codigo: categoria.codigo,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      montoCuota: parseFloat(categoria.montoCuota),
      descuento: parseFloat(categoria.descuento),
      orden: categoria.orden
    } : undefined
  })

  const onSubmit = async (data: CreateCategoriaFormData) => {
    try {
      if (isEditing) {
        await updateCategoria({ id: categoria.id, data }).unwrap()
      } else {
        await createCategoria(data).unwrap()
      }
      onSuccess?.()
    } catch (error) {
      console.error('Error al guardar categoría:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Código *</label>
        <input
          type="text"
          {...register('codigo')}
          disabled={isEditing}
        />
        {errors.codigo && <span>{errors.codigo.message}</span>}
      </div>

      <div>
        <label>Nombre *</label>
        <input type="text" {...register('nombre')} />
        {errors.nombre && <span>{errors.nombre.message}</span>}
      </div>

      <div>
        <label>Descripción</label>
        <textarea {...register('descripcion')} />
        {errors.descripcion && <span>{errors.descripcion.message}</span>}
      </div>

      <div>
        <label>Monto de Cuota *</label>
        <input
          type="number"
          step="0.01"
          {...register('montoCuota', { valueAsNumber: true })}
        />
        {errors.montoCuota && <span>{errors.montoCuota.message}</span>}
      </div>

      <div>
        <label>Descuento (%)</label>
        <input
          type="number"
          step="0.01"
          {...register('descuento', { valueAsNumber: true })}
        />
        {errors.descuento && <span>{errors.descuento.message}</span>}
      </div>

      <div>
        <label>Orden</label>
        <input
          type="number"
          {...register('orden', { valueAsNumber: true })}
        />
        {errors.orden && <span>{errors.orden.message}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isCreating || isUpdating}>
          {isEditing ? 'Actualizar' : 'Crear'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
```

#### Paso 6.3: Actualizar formularios de Cuotas
**Similar a PersonaFormSimple**, actualizar para usar `categoriaId`

---

### FASE 7: Vistas/Páginas

#### Paso 7.1: Crear página de gestión de categorías
**Archivo**: `src/pages/Categorias/CategoriasPage.tsx` (NUEVO)

```typescript
import React, { useState } from 'react'
import {
  useGetCategoriasQuery,
  useDeleteCategoriaMutation,
  useToggleCategoriaMutation
} from '../../services/categoriasApi'
import { CategoriaForm } from '../../components/forms/CategoriaForm'
import { CategoriaBadge } from '../../components/badges/CategoriaBadge'
import type { CategoriaSocio } from '../../types/categoria'

export const CategoriasPage: React.FC = () => {
  const [showInactive, setShowInactive] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<CategoriaSocio | null>(null)

  const { data, isLoading, refetch } = useGetCategoriasQuery({ includeInactive: showInactive })
  const [deleteCategoria] = useDeleteCategoriaMutation()
  const [toggleCategoria] = useToggleCategoriaMutation()

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar esta categoría?')) {
      try {
        await deleteCategoria(id).unwrap()
      } catch (error: any) {
        alert(error?.data?.message || 'Error al eliminar categoría')
      }
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await toggleCategoria(id).unwrap()
    } catch (error) {
      alert('Error al cambiar estado de categoría')
    }
  }

  const handleEdit = (categoria: CategoriaSocio) => {
    setEditingCategoria(categoria)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingCategoria(null)
    refetch()
  }

  if (isLoading) return <div>Cargando...</div>

  return (
    <div className="categorias-page">
      <header>
        <h1>Gestión de Categorías de Socios</h1>
        <div className="actions">
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Nueva Categoría'}
          </button>
          <label>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Mostrar inactivas
          </label>
        </div>
      </header>

      {showForm && (
        <div className="form-container">
          <CategoriaForm
            categoria={editingCategoria || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false)
              setEditingCategoria(null)
            }}
          />
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Monto Cuota</th>
            <th>Descuento</th>
            <th>Estado</th>
            <th>Uso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.codigo}</td>
              <td>
                <CategoriaBadge categoria={cat} />
              </td>
              <td>${cat.montoCuota}</td>
              <td>{cat.descuento}%</td>
              <td>
                <span className={`status ${cat.activa ? 'active' : 'inactive'}`}>
                  {cat.activa ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td>
                {cat._count ? `${cat._count.personas} socios` : '-'}
              </td>
              <td>
                <button onClick={() => handleEdit(cat)}>Editar</button>
                <button onClick={() => handleToggle(cat.id)}>
                  {cat.activa ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => handleDelete(cat.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

#### Paso 7.2: Agregar ruta de categorías
**Archivo**: `src/App.tsx`

```typescript
import { CategoriasPage } from './pages/Categorias/CategoriasPage'

// En el router
<Route path="/categorias" element={<CategoriasPage />} />
```

#### Paso 7.3: Agregar enlace en Sidebar
**Archivo**: `src/components/layout/Sidebar.tsx`

```typescript
<NavLink to="/categorias">
  <Icon name="category" />
  Categorías
</NavLink>
```

#### Paso 7.4: Actualizar PersonasPageSimple
**Archivo**: `src/pages/Personas/PersonasPageSimple.tsx`

**Cambios necesarios**:
1. Mostrar nombre de categoría en lugar de código
2. Usar `CategoriaBadge` component
3. Actualizar columnas de tabla

```typescript
// En la columna de categoría
<td>
  {persona.categoria ? (
    <CategoriaBadge categoria={persona.categoria} />
  ) : (
    <span>Sin categoría</span>
  )}
</td>
```

#### Paso 7.5: Actualizar CuotasPage
**Similar a PersonasPage**, actualizar visualización de categorías

---

### FASE 8: Actualización de Constantes

#### Paso 8.1: Eliminar enum estático
**Archivo**: `src/constants/categorias.ts` (si existe)

- Eliminar o marcar como deprecated el enum estático
- Documentar que ahora se obtienen dinámicamente

---

## 4. Recomendaciones de Pruebas

### Pruebas Funcionales

#### Test 1: CRUD de Categorías
- [ ] **Crear** una nueva categoría "HONORARIO"
- [ ] **Validar** que aparece en el listado
- [ ] **Editar** el monto de cuota
- [ ] **Verificar** que se actualiza correctamente
- [ ] **Desactivar** la categoría
- [ ] **Confirmar** que no aparece en selectores (con includeInactive=false)
- [ ] **Reactivar** la categoría
- [ ] **Intentar eliminar** categoría con socios asociados
- [ ] **Verificar** mensaje de error apropiado
- [ ] **Eliminar** categoría sin dependencias

#### Test 2: Integración con Personas
- [ ] **Crear** una persona sin categoría
- [ ] **Verificar** que categoriaId es null/undefined
- [ ] **Editar** persona para asignarle una categoría
- [ ] **Confirmar** que se guarda correctamente
- [ ] **Listar** personas y verificar que se muestra el nombre de categoría
- [ ] **Filtrar** personas por categoría (si existe esta funcionalidad)
- [ ] **Cambiar** categoría de una persona existente
- [ ] **Verificar** que el cambio se refleja en cuotas futuras

#### Test 3: Integración con Cuotas
- [ ] **Crear** una cuota seleccionando categoría
- [ ] **Verificar** que el monto base coincide con la categoría
- [ ] **Calcular** descuento según categoría
- [ ] **Confirmar** monto final correcto
- [ ] **Listar** cuotas agrupadas por categoría
- [ ] **Verificar** estadísticas de recaudación por categoría

#### Test 4: Validaciones Frontend
- [ ] **Intentar** crear categoría con código duplicado
- [ ] **Verificar** mensaje de error
- [ ] **Intentar** crear categoría con monto negativo
- [ ] **Intentar** crear categoría con descuento > 100
- [ ] **Intentar** crear categoría con código con minúsculas
- [ ] **Verificar** que se convierte a mayúsculas automáticamente

#### Test 5: Orden y Estado
- [ ] **Reordenar** categorías mediante drag & drop (si se implementa)
- [ ] **Verificar** que el orden se mantiene tras recargar
- [ ] **Desactivar** categoría usada en personas
- [ ] **Confirmar** que las personas existentes mantienen la relación
- [ ] **Verificar** que no aparece en nuevos formularios

### Casos de Borde

#### Test 6: Compatibilidad con Datos Migrados
- [ ] **Verificar** que socios existentes tienen `categoriaId` correcto
- [ ] **Confirmar** que las 4 categorías base existen:
  - ACTIVO (clwactivo000001)
  - ESTUDIANTE (clwestudiant001)
  - FAMILIAR (clwfamiliar0001)
  - JUBILADO (clwjubilado0001)
- [ ] **Listar** personas creadas antes de la migración
- [ ] **Verificar** que tienen categoría asignada correctamente

#### Test 7: Performance
- [ ] **Medir** tiempo de carga del selector de categorías
- [ ] **Verificar** que usa caché (RTK Query)
- [ ] **Confirmar** que no hace requests redundantes
- [ ] **Listar** 100+ personas con categorías
- [ ] **Verificar** que no hay problemas de rendimiento

### Pruebas de Regresión

#### Test 8: Funcionalidades Existentes
- [ ] **Crear** persona como se hacía antes (sin errores)
- [ ] **Editar** persona existente
- [ ] **Eliminar** persona
- [ ] **Crear** cuota
- [ ] **Listar** cuotas
- [ ] **Verificar** que todas las vistas principales funcionan

---

## 5. Checklist de Finalización

### ✅ Criterios de Aceptación

#### Backend Integration
- [ ] Todos los endpoints de `/api/categorias-socios` responden correctamente
- [ ] Las respuestas incluyen relaciones populadas cuando es necesario
- [ ] Los errores del backend se manejan apropiadamente en el frontend

#### Types & Interfaces
- [ ] Interfaz `CategoriaSocio` definida y exportada
- [ ] Interfaces de `Persona` y `Cuota` actualizadas
- [ ] DTOs de creación/actualización definidos
- [ ] No hay errores de TypeScript en toda la aplicación

#### API Services
- [ ] `categoriasApi.ts` implementado con todos los endpoints
- [ ] `personasApi.ts` actualizado para usar `categoriaId`
- [ ] `cuotasApi.ts` actualizado (si existe)
- [ ] RTK Query configurado correctamente
- [ ] Invalidación de cache funciona correctamente

#### Redux Store
- [ ] API de categorías integrada en el store
- [ ] Middleware configurado
- [ ] Slice de categorías creado (si es necesario)
- [ ] Slices de personas/cuotas actualizados

#### Validation Schemas
- [ ] Schema de categoría con Zod implementado
- [ ] Schema de persona actualizado
- [ ] Schema de cuota actualizado
- [ ] Validaciones coinciden con las del backend

#### UI Components
- [ ] `CategoriaSelect` component creado y funcional
- [ ] `CategoriaBadge` component creado y funcional
- [ ] Componentes existentes actualizados para usar categorías dinámicas
- [ ] Estilos aplicados correctamente

#### Forms
- [ ] `CategoriaForm` implementado (crear/editar)
- [ ] `PersonaFormSimple` actualizado
- [ ] Formularios de cuotas actualizados
- [ ] Validaciones funcionan correctamente
- [ ] Mensajes de error claros

#### Pages/Views
- [ ] `CategoriasPage` implementada con CRUD completo
- [ ] Tabla de categorías muestra toda la información relevante
- [ ] Acciones (editar, eliminar, toggle) funcionan
- [ ] `PersonasPageSimple` actualizada para mostrar categorías
- [ ] `CuotasPage` actualizada (si existe)
- [ ] Ruta de categorías agregada al router
- [ ] Enlace en Sidebar agregado

#### Data Display
- [ ] Nombres de categoría se muestran en lugar de códigos
- [ ] Badges con estilos diferenciados por categoría
- [ ] Montos de cuota visibles donde corresponda
- [ ] Estado activo/inactivo visible

#### Functionality
- [ ] Crear categoría funciona end-to-end
- [ ] Editar categoría funciona end-to-end
- [ ] Eliminar categoría funciona (con validación de dependencias)
- [ ] Activar/desactivar categoría funciona
- [ ] Reordenar categorías funciona (si se implementa)
- [ ] Asignar categoría a persona funciona
- [ ] Crear cuota con categoría funciona

#### Error Handling
- [ ] Errores de API se muestran al usuario
- [ ] Validaciones previenen envío de datos inválidos
- [ ] Intentos de eliminar categoría con dependencias muestran mensaje claro
- [ ] Códigos duplicados se detectan y muestran error
- [ ] Loading states implementados

#### Testing
- [ ] Todos los tests del checklist de pruebas pasan
- [ ] No hay errores en consola
- [ ] No hay warnings de React
- [ ] No hay memory leaks

#### Documentation
- [ ] Código comentado en secciones críticas
- [ ] README actualizado (si corresponde)
- [ ] Tipos exportados correctamente

#### Performance
- [ ] No hay re-renders innecesarios
- [ ] Queries optimizadas con RTK Query
- [ ] Cache de categorías funciona correctamente
- [ ] Selectores rinden bien con muchas opciones

#### User Experience
- [ ] Interfaz intuitiva para gestión de categorías
- [ ] Feedback visual al crear/editar/eliminar
- [ ] Confirmaciones para acciones destructivas
- [ ] Loading indicators apropiados
- [ ] Mensajes de éxito/error claros

#### Compatibility
- [ ] Datos migrados se visualizan correctamente
- [ ] No hay breaking changes en funcionalidades existentes
- [ ] Backward compatibility con datos legacy

---

## 6. Estimación de Esfuerzo

### Por Fase
- **FASE 1** (Types): ~2 horas
- **FASE 2** (API Services): ~4 horas
- **FASE 3** (Redux): ~2 horas
- **FASE 4** (Schemas): ~2 horas
- **FASE 5** (Components): ~3 horas
- **FASE 6** (Forms): ~4 horas
- **FASE 7** (Pages): ~6 horas
- **FASE 8** (Constants): ~1 hora

**Testing & QA**: ~8 horas

**TOTAL ESTIMADO**: ~32 horas (4 días de trabajo)

---

## 7. Orden de Implementación Recomendado

### Sprint 1 (Día 1-2): Fundamentos
1. FASE 1: Types e interfaces
2. FASE 4: Schemas de validación
3. FASE 2: API Services básicos
4. FASE 3: Redux Store
5. **Milestone**: Endpoints conectados, types definidos

### Sprint 2 (Día 2-3): UI Básica
6. FASE 5: Componentes reutilizables
7. FASE 6: Formulario de categorías
8. FASE 7 (Parcial): Página de categorías (solo listado)
9. **Milestone**: CRUD de categorías funcional

### Sprint 3 (Día 3-4): Integración
10. FASE 6 (Continuar): Actualizar formularios de personas/cuotas
11. FASE 7 (Continuar): Actualizar vistas existentes
12. FASE 8: Limpieza de constantes legacy
13. **Milestone**: Integración completa

### Sprint 4 (Día 4): Testing & Polish
14. Testing exhaustivo según checklist
15. Corrección de bugs
16. Mejoras de UX
17. **Milestone**: Producción ready

---

## 8. Dependencias y Riesgos

### Dependencias Críticas
- ✅ Backend ya implementado y funcional
- ✅ Migración de base de datos completada
- ⚠️ Zod ya instalado (verificar versión compatible)
- ⚠️ React Hook Form en uso (verificar configuración)
- ⚠️ RTK Query configurado (verificar middleware)

### Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Datos legacy sin migrar correctamente | Baja | Alto | Verificar datos antes de empezar |
| Breaking changes en componentes existentes | Media | Alto | Testing de regresión exhaustivo |
| Performance con muchas categorías | Baja | Medio | Implementar paginación si es necesario |
| Código duplicado no actualizado | Media | Medio | Búsqueda global de referencias a enum legacy |
| Inconsistencia en tipos string vs number | Media | Bajo | Parseo explícito en servicios |

---

## 9. Notas Adicionales

### Mejoras Opcionales (Post-MVP)
- [ ] Drag & drop para reordenar categorías
- [ ] Búsqueda/filtrado avanzado de categorías
- [ ] Gráficos de distribución de socios por categoría
- [ ] Exportación de estadísticas
- [ ] Historial de cambios en categorías
- [ ] Bulk actions (activar/desactivar múltiples)
- [ ] Preview de impacto antes de cambiar monto de cuota

### Consideraciones de Diseño
- Usar colores consistentes para badges de categorías
- Iconos para cada tipo de categoría
- Tooltips explicativos en formularios
- Animaciones suaves en transiciones
- Responsive design para móviles

### Documentación Necesaria
- Guía de usuario para administradores
- Documentación técnica de la API
- Ejemplos de uso de componentes
- Changelog de la migración

---

**FIN DEL PLAN DE IMPLEMENTACIÓN**
