# Plan de Implementación - Actualizaciones Funcionales Frontend SIGESDA

**Fecha:** 2025-11-04
**Responsable:** Equipo Frontend
**Estado:** 🟡 En Planificación
**Prioridad:** 🔴 Alta

---

## 📋 Índice

1. [Análisis Funcional y de Impacto](#1-análisis-funcional-y-de-impacto)
2. [Diseño Técnico Frontend](#2-diseño-técnico-frontend)
3. [Plan de Implementación por Fases](#3-plan-de-implementación-por-fases)
4. [Consideraciones de Compatibilidad y Mantenimiento](#4-consideraciones-de-compatibilidad-y-mantenimiento)
5. [Resumen de Entregables](#5-resumen-de-entregables)
6. [Cronograma Estimado](#6-cronograma-estimado)
7. [Criterios de Aceptación](#7-criterios-de-aceptación)

---

## 1. Análisis Funcional y de Impacto

### 1.1 Pantallas y Componentes Afectados

#### **A. Módulo Actividades**

| Componente | Ubicación | Impacto | Severidad |
|------------|-----------|---------|-----------|
| `ActivityCard.tsx` | `src/components/actividades/` | Mostrar cupos disponibles, estado de capacidad | **Alta** |
| `ActivityList.tsx` | `src/components/actividades/` | Renderizar nuevos campos de capacidad | **Alta** |
| `ActividadDetallePageV2.tsx` | `src/pages/actividades/` | Integrar gestión de docentes y cupos | **Alta** |
| `InscripcionModal.tsx` | `src/components/actividades/` | Validación de cupos antes de inscripción | **Alta** |
| `actividadesSlice.ts` | `src/store/` | Actualizar estado con nuevos campos | **Media** |

**Nuevos componentes a crear:**
- `CupoIndicator.tsx` - Indicador visual de disponibilidad
- `DocenteSelector.tsx` - Modal de asignación de docentes
- `DocentesList.tsx` - Lista de docentes asignados

#### **B. Módulo Personas**

| Componente | Ubicación | Impacto | Severidad |
|------------|-----------|---------|-----------|
| `PersonaForm.tsx` | `src/components/personas/` | Validación de tipos mutuamente excluyentes | **Alta** |
| `TipoBadge.tsx` | `src/components/personas/` | Mejorar visualización de tipos | **Media** |
| `PersonaDetallePage.tsx` | `src/pages/personas/` | Integrar gestión de tipos | **Media** |
| `personasSlice.ts` | `src/store/` | Manejar cambios de tipo | **Media** |

**Nuevos componentes a crear:**
- `TipoConflictModal.tsx` - Modal explicativo de conflictos
- `TipoSelector.tsx` - Selector con validación en tiempo real

#### **C. Módulo Familiares**

| Componente | Ubicación | Impacto | Severidad |
|------------|-----------|---------|-----------|
| `FamiliaView.tsx` | `src/components/personas/` | Eliminar lógica de relaciones inversas manuales | **Alta** |
| `FamiliarCard.tsx` | Nuevo | Visualización de relaciones bidireccionales | **Alta** |
| `AgregarFamiliarModal.tsx` | Nuevo | Creación de relaciones con catálogo | **Alta** |
| `familiaresSlice.ts` | `src/store/` | Simplificar estado (backend maneja bidireccionalidad) | **Media** |

### 1.2 Flujos de Usuario Afectados

```
┌─────────────────────────────────────────────────────────────┐
│ FLOW 1: Inscripción con Validación de Cupos                │
├─────────────────────────────────────────────────────────────┤
│ 1. Usuario visualiza actividad → muestra cuposDisponibles  │
│ 2. Clic en "Inscribir"                                      │
│ 3. Validación frontend: cuposDisponibles > 0               │
│ 4. Modal de confirmación                                    │
│ 5. POST /api/actividades/{id}/participantes                 │
│ 6. Manejo de errores:                                       │
│    - 400 "capacidad máxima" → Toast + deshabilitar botón   │
│    - 409 "ya inscripto" → Toast informativo                │
│ 7. Actualizar estado local (decrementar cupos)             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FLOW 2: Gestión de Relaciones Familiares Bidireccionales   │
├─────────────────────────────────────────────────────────────┤
│ 1. Usuario en detalle de persona                            │
│ 2. Tab "Familiares" → GET /api/personas/{id}/familiares    │
│ 3. Clic "Agregar Familiar"                                  │
│ 4. Modal con:                                                │
│    - Selector de persona (autocomplete)                     │
│    - Dropdown catálogo parentescos                          │
│    - Validación: no permitir agregar a sí mismo            │
│ 5. POST /api/familiares (backend crea ambas direcciones)   │
│ 6. Refetch automático → árbol familiar actualizado         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FLOW 3: Cambio de Tipo Persona (NO_SOCIO → SOCIO)          │
├─────────────────────────────────────────────────────────────┤
│ 1. Usuario en edición de persona                            │
│ 2. Checkboxes de tipos con validación en tiempo real       │
│ 3. Intenta activar SOCIO (ya tiene NO_SOCIO activo)        │
│ 4. Modal TipoConflictModal:                                 │
│    "SOCIO y NO_SOCIO son mutuamente excluyentes"           │
│    [Cancelar] [Cambiar a SOCIO]                            │
│ 5. Si confirma:                                              │
│    - DELETE /api/personas/{id}/tipos/NO_SOCIO              │
│    - POST /api/personas/{id}/tipos/SOCIO                   │
│ 6. Actualizar badges en UI                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Diseño Técnico Frontend

### 2.1 Nuevos Endpoints y Estructuras de Datos

#### **A. Actividades - Cupos y Docentes**

```typescript
// src/types/actividad.types.ts

/** Respuesta extendida de actividad con métricas de capacidad */
export interface ActividadConCapacidad extends Actividad {
  capacidadMaxima: number | null;
  participantesActivos: number;
  cuposDisponibles: number; // calculado: capacidadMaxima - participantesActivos
  tieneCapacidadLimitada: boolean; // true si capacidadMaxima !== null
}

/** Catálogo de roles de docente */
export interface RolDocente {
  id: number;
  nombre: string; // "Titular", "Suplente", "Ayudante"
  descripcion?: string;
}

/** Asignación de docente a actividad */
export interface DocenteActividad {
  id: number;
  actividadId: number;
  personaId: number;
  rolDocenteId: number;
  persona: {
    id: number;
    nombre: string;
    apellido: string;
    email?: string;
  };
  rolDocente: RolDocente;
  fechaAsignacion: string;
}
```

**Nuevos servicios API:**

```typescript
// src/services/actividadesApi.ts

/** Obtener docentes asignados a una actividad */
export const getActividadDocentes = async (
  actividadId: number
): Promise<ApiResponse<DocenteActividad[]>> => {
  const response = await api.get(`/actividades/${actividadId}/docentes`);
  return response.data;
};

/** Asignar docente a actividad */
export const asignarDocente = async (
  actividadId: number,
  data: { personaId: number; rolDocenteId: number }
): Promise<ApiResponse<DocenteActividad>> => {
  const response = await api.post(`/actividades/${actividadId}/docentes`, data);
  return response.data;
};

/** Remover docente de actividad */
export const removerDocente = async (
  actividadId: number,
  docenteActividadId: number
): Promise<ApiResponse<void>> => {
  const response = await api.delete(
    `/actividades/${actividadId}/docentes/${docenteActividadId}`
  );
  return response.data;
};

/** Inscribir participante con validación de cupos */
export const inscribirParticipante = async (
  actividadId: number,
  personaId: number
): Promise<ApiResponse<{ cuposDisponibles: number }>> => {
  const response = await api.post(`/actividades/${actividadId}/participantes`, {
    personaId,
  });
  return response.data;
};
```

#### **B. Personas - Tipos Mutuamente Excluyentes**

```typescript
// src/types/persona.types.ts

/** Reglas de exclusión de tipos */
export const TIPOS_EXCLUYENTES: Record<string, string[]> = {
  SOCIO: ['NO_SOCIO'],
  NO_SOCIO: ['SOCIO'],
};

/** Validador de tipos */
export const validarTiposPersona = (
  tiposActuales: string[],
  nuevoTipo: string
): { valido: boolean; conflicto?: string } => {
  const excluyentes = TIPOS_EXCLUYENTES[nuevoTipo] || [];
  const conflicto = tiposActuales.find((t) => excluyentes.includes(t));

  return conflicto
    ? { valido: false, conflicto }
    : { valido: true };
};
```

**Servicios API actualizados:**

```typescript
// src/services/personasApi.ts

/** Obtener tipos asignados a una persona */
export const getPersonaTipos = async (
  personaId: number
): Promise<ApiResponse<TipoPersona[]>> => {
  const response = await api.get(`/personas/${personaId}/tipos`);
  return response.data;
};

/** Asignar tipo a persona (con validación backend) */
export const asignarTipoPersona = async (
  personaId: number,
  tipoPersonaId: number,
  datosTipo?: Record<string, any>
): Promise<ApiResponse<void>> => {
  const response = await api.post(`/personas/${personaId}/tipos`, {
    tipoPersonaId,
    ...datosTipo,
  });
  return response.data;
};

/** Remover tipo de persona */
export const removerTipoPersona = async (
  personaId: number,
  tipoPersonaId: number
): Promise<ApiResponse<void>> => {
  const response = await api.delete(
    `/personas/${personaId}/tipos/${tipoPersonaId}`
  );
  return response.data;
};
```

#### **C. Familiares - Relaciones Bidireccionales**

```typescript
// src/types/familiar.types.ts

/** Relación familiar bidireccional (backend gestiona inversa automáticamente) */
export interface RelacionFamiliar {
  id: number;
  personaOrigenId: number;
  personaDestinoId: number;
  tipoParentescoId: number;
  personaDestino: {
    id: number;
    nombre: string;
    apellido: string;
    email?: string;
  };
  tipoParentesco: {
    id: number;
    nombre: string; // "Padre", "Hijo", "Cónyuge", etc.
    esReciprocable: boolean;
  };
  permisoRetiro: boolean;
  permisoDatos: boolean;
  fechaCreacion: string;
}

/** Catálogo de tipos de parentesco agrupados */
export interface TipoParentesco {
  id: number;
  nombre: string;
  grupo: 'ASCENDENTE' | 'DESCENDENTE' | 'COLATERAL' | 'OTRO';
  esReciprocable: boolean;
  parentescoInverso?: {
    id: number;
    nombre: string;
  };
}
```

**Servicios API:**

```typescript
// src/services/familiaresApi.ts

/** Obtener familiares de una persona (incluye relaciones inversas del backend) */
export const getFamiliares = async (
  personaId: number
): Promise<ApiResponse<RelacionFamiliar[]>> => {
  const response = await api.get(`/personas/${personaId}/familiares`);
  return response.data;
};

/** Crear relación familiar (backend crea automáticamente la inversa) */
export const crearRelacionFamiliar = async (data: {
  personaOrigenId: number;
  personaDestinoId: number;
  tipoParentescoId: number;
  permisoRetiro?: boolean;
  permisoDatos?: boolean;
}): Promise<ApiResponse<RelacionFamiliar>> => {
  const response = await api.post('/familiares', data);
  return response.data;
};

/** Eliminar relación (backend elimina ambas direcciones) */
export const eliminarRelacionFamiliar = async (
  relacionId: number
): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/familiares/${relacionId}`);
  return response.data;
};
```

### 2.2 Catálogos Nuevos

```typescript
// src/providers/CatalogosProvider.tsx

interface CatalogosContextType {
  // Existentes
  tipos: TipoPersona[];
  categorias: Categoria[];
  estados: Estado[];
  // ... otros existentes

  // NUEVOS
  rolesDocentes: RolDocente[];
  tiposParentesco: TipoParentesco[];

  // Funciones de carga
  refetchCatalogos: () => Promise<void>;
}

// Actualizar hook de carga
const fetchCatalogos = async () => {
  try {
    const [
      tiposRes,
      categoriasRes,
      // ... otros existentes
      rolesDocentesRes,
      tiposParentescoRes,
    ] = await Promise.all([
      api.get('/catalogos/personas/tipos'),
      api.get('/catalogos/personas/categorias'),
      // ... otros existentes
      api.get('/catalogos/roles-docentes'),
      api.get('/catalogos/tipos-parentesco'),
    ]);

    setCatalogos({
      tipos: tiposRes.data.data || [],
      categorias: categoriasRes.data.data || [],
      // ... otros
      rolesDocentes: rolesDocentesRes.data.data || [],
      tiposParentesco: tiposParentescoRes.data.data || [],
    });
  } catch (error) {
    console.error('Error cargando catálogos:', error);
    // Fallback con valores por defecto
    setCatalogos((prev) => ({
      ...prev,
      rolesDocentes: ROLES_DOCENTES_FALLBACK,
      tiposParentesco: TIPOS_PARENTESCO_FALLBACK,
    }));
  }
};
```

**Valores de fallback:**

```typescript
// src/constants/catalogos.fallback.ts

export const ROLES_DOCENTES_FALLBACK: RolDocente[] = [
  { id: 1, nombre: 'Titular', descripcion: 'Docente titular de la actividad' },
  { id: 2, nombre: 'Suplente', descripcion: 'Docente suplente' },
  { id: 3, nombre: 'Ayudante', descripcion: 'Docente ayudante' },
];

export const TIPOS_PARENTESCO_FALLBACK: TipoParentesco[] = [
  { id: 1, nombre: 'Padre', grupo: 'ASCENDENTE', esReciprocable: true },
  { id: 2, nombre: 'Madre', grupo: 'ASCENDENTE', esReciprocable: true },
  { id: 3, nombre: 'Hijo', grupo: 'DESCENDENTE', esReciprocable: true },
  { id: 4, nombre: 'Hija', grupo: 'DESCENDENTE', esReciprocable: true },
  { id: 5, nombre: 'Cónyuge', grupo: 'OTRO', esReciprocable: true },
];
```

### 2.3 Manejo de Estado Redux

```typescript
// src/store/actividadesSlice.ts

interface ActividadesState {
  actividades: ActividadConCapacidad[];
  actividadActual: ActividadConCapacidad | null;
  docentesAsignados: DocenteActividad[]; // NUEVO
  loading: boolean;
  error: string | null;
}

const actividadesSlice = createSlice({
  name: 'actividades',
  initialState,
  reducers: {
    // Actualizar cupos tras inscripción
    decrementarCupos: (state, action: PayloadAction<number>) => {
      const actividad = state.actividades.find((a) => a.id === action.payload);
      if (actividad && actividad.cuposDisponibles > 0) {
        actividad.cuposDisponibles -= 1;
        actividad.participantesActivos += 1;
      }
    },

    // Gestión de docentes
    setDocentesAsignados: (state, action: PayloadAction<DocenteActividad[]>) => {
      state.docentesAsignados = action.payload;
    },

    agregarDocente: (state, action: PayloadAction<DocenteActividad>) => {
      state.docentesAsignados.push(action.payload);
    },

    removerDocenteLocal: (state, action: PayloadAction<number>) => {
      state.docentesAsignados = state.docentesAsignados.filter(
        (d) => d.id !== action.payload
      );
    },
  },
});
```

```typescript
// src/store/personasSlice.ts

interface PersonasState {
  personas: Persona[];
  personaActual: Persona | null;
  tiposAsignados: TipoPersona[]; // NUEVO
  loading: boolean;
  error: string | null;
}

const personasSlice = createSlice({
  name: 'personas',
  initialState,
  reducers: {
    setTiposAsignados: (state, action: PayloadAction<TipoPersona[]>) => {
      state.tiposAsignados = action.payload;
    },

    agregarTipo: (state, action: PayloadAction<TipoPersona>) => {
      state.tiposAsignados.push(action.payload);
    },

    removerTipo: (state, action: PayloadAction<number>) => {
      state.tiposAsignados = state.tiposAsignados.filter(
        (t) => t.id !== action.payload
      );
    },
  },
});
```

### 2.4 Validaciones y Manejo de Errores

```typescript
// src/utils/errorHandling.ts

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

/** Mapeo de códigos de error a mensajes amigables */
const ERROR_MESSAGES: Record<string, string> = {
  'CAPACIDAD_MAXIMA_ALCANZADA': 'La actividad ha alcanzado su capacidad máxima',
  'YA_INSCRIPTO': 'Esta persona ya está inscripta en la actividad',
  'TIPOS_EXCLUYENTES': 'Los tipos SOCIO y NO_SOCIO son mutuamente excluyentes',
  'DOCENTE_YA_ASIGNADO': 'Este docente ya está asignado a la actividad',
  'AUTO_REFERENCIA': 'Una persona no puede agregarse a sí misma como familiar',
};

export const handleApiError = (error: any, toast: any) => {
  const apiError: ApiError = error.response?.data;

  if (!apiError) {
    toast.error('Error inesperado. Por favor intente nuevamente.');
    return;
  }

  const mensaje = apiError.code
    ? ERROR_MESSAGES[apiError.code] || apiError.error
    : apiError.error;

  toast.error(mensaje);
};

/** Hook para manejo estandarizado de errores */
export const useApiErrorHandler = () => {
  const toast = useToast();

  return {
    handleError: (error: any) => handleApiError(error, toast),

    withErrorHandling: async <T,>(
      apiCall: () => Promise<T>,
      successMessage?: string
    ): Promise<T | null> => {
      try {
        const result = await apiCall();
        if (successMessage) toast.success(successMessage);
        return result;
      } catch (error) {
        handleApiError(error, toast);
        return null;
      }
    },
  };
};
```

---

## 3. Plan de Implementación por Fases

### **FASE 1: Infraestructura y Servicios Base** (Prioridad: Alta)
**Duración estimada: 2-3 días**

#### Task 1.1: Actualizar Servicios API

**Archivos a modificar/crear:**
- `src/services/actividadesApi.ts`
- `src/services/personasApi.ts`
- `src/services/familiaresApi.ts`
- `src/services/catalogosApi.ts` (nuevo)

**Commits esperados:**
```bash
feat(api): agregar endpoints de cupos y docentes en actividades
feat(api): agregar endpoints de tipos de persona
feat(api): agregar endpoints de relaciones familiares bidireccionales
feat(api): agregar servicio de catálogos (roles docentes, parentescos)
```

**Checklist:**
- [ ] Crear interfaces TypeScript para nuevas respuestas API
- [ ] Implementar servicios de actividades (cupos, docentes, participantes)
- [ ] Implementar servicios de personas (tipos)
- [ ] Implementar servicios de familiares (bidireccionales)
- [ ] Crear servicio de catálogos centralizado
- [ ] Agregar tests unitarios para servicios (opcional según proyecto)

#### Task 1.2: Actualizar CatalogosProvider

**Archivos a modificar:**
- `src/providers/CatalogosProvider.tsx`
- `src/constants/catalogos.fallback.ts` (nuevo)
- `src/types/catalogos.types.ts`

**Commits esperados:**
```bash
feat(catalogos): agregar rolesDocentes y tiposParentesco al provider
feat(catalogos): implementar fallbacks para catálogos nuevos
```

**Checklist:**
- [ ] Agregar `rolesDocentes` y `tiposParentesco` al contexto
- [ ] Implementar carga paralela con `Promise.all`
- [ ] Crear valores de fallback
- [ ] Manejar errores de endpoints inexistentes (404) con try/catch individual
- [ ] Actualizar hook `useCatalogosContext` con nuevos tipos

#### Task 1.3: Actualizar Redux Slices

**Archivos a modificar:**
- `src/store/actividadesSlice.ts`
- `src/store/personasSlice.ts`
- `src/store/familiaresSlice.ts` (modificar/simplificar)

**Commits esperados:**
```bash
feat(store): agregar gestión de docentes en actividadesSlice
feat(store): agregar gestión de tipos en personasSlice
refactor(store): simplificar familiaresSlice (eliminar lógica de relaciones inversas)
```

**Checklist:**
- [ ] Agregar campos `capacidadMaxima`, `participantesActivos`, `cuposDisponibles` a estado de actividades
- [ ] Crear reducers para decrementar cupos tras inscripción
- [ ] Agregar gestión de docentes asignados
- [ ] Agregar gestión de tipos asignados en personasSlice
- [ ] Eliminar lógica de creación manual de relaciones inversas en familiaresSlice

#### Task 1.4: Implementar Manejo de Errores Unificado

**Archivos a crear:**
- `src/utils/errorHandling.ts`
- `src/constants/errorMessages.ts`

**Commits esperados:**
```bash
feat(errors): implementar manejo unificado de errores API
feat(errors): agregar hook useApiErrorHandler
```

**Checklist:**
- [ ] Crear interfaz `ApiError`
- [ ] Implementar mapeo de códigos de error a mensajes
- [ ] Crear hook `useApiErrorHandler`
- [ ] Crear función `handleApiError` centralizada
- [ ] Documentar códigos de error conocidos

---

### **FASE 2: Componentes de Actividades** (Prioridad: Alta)
**Duración estimada: 3-4 días**

#### Task 2.1: Crear CupoIndicator

**Archivo:** `src/components/actividades/CupoIndicator.tsx`

```typescript
import { Box, Chip, LinearProgress, Typography } from '@mui/material';

interface CupoIndicatorProps {
  capacidadMaxima: number | null;
  participantesActivos: number;
  cuposDisponibles: number;
  variant?: 'compact' | 'detailed';
}

export const CupoIndicator: React.FC<CupoIndicatorProps> = ({
  capacidadMaxima,
  participantesActivos,
  cuposDisponibles,
  variant = 'compact',
}) => {
  // Sin límite de capacidad
  if (capacidadMaxima === null) {
    return (
      <Chip
        label="Sin límite de cupos"
        color="info"
        size="small"
        variant="outlined"
      />
    );
  }

  const porcentaje = (participantesActivos / capacidadMaxima) * 100;
  const color =
    cuposDisponibles === 0
      ? 'error'
      : cuposDisponibles <= 5
      ? 'warning'
      : 'success';

  if (variant === 'compact') {
    return (
      <Chip
        label={`${cuposDisponibles} cupos disponibles`}
        color={color}
        size="small"
      />
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body2">
          {participantesActivos} / {capacidadMaxima} inscriptos
        </Typography>
        <Typography variant="body2" color={`${color}.main`} fontWeight="bold">
          {cuposDisponibles} disponibles
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={porcentaje}
        color={color}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
};
```

**Checklist:**
- [ ] Crear componente con variantes compact/detailed
- [ ] Implementar lógica de colores dinámicos (success/warning/error)
- [ ] Manejar caso de capacidad ilimitada (`null`)
- [ ] Agregar tests de snapshot

#### Task 2.2: Actualizar ActivityCard y ActivityList

**Archivos a modificar:**
- `src/components/actividades/ActivityCard.tsx`
- `src/components/actividades/ActivityList.tsx`

**Commits esperados:**
```bash
feat(actividades): integrar CupoIndicator en ActivityCard
fix(actividades): agregar valores por defecto para campos nuevos
```

**Checklist:**
- [ ] Agregar `CupoIndicator` a `ActivityCard`
- [ ] Deshabilitar botón "Inscribir" cuando `cuposDisponibles === 0`
- [ ] Agregar valores por defecto para evitar errores con `null`
- [ ] Actualizar `ActivityList` para renderizar nuevos campos
- [ ] Actualizar consulta de actividades para incluir campos nuevos

---

### **FASE 3: Componentes de Personas** (Prioridad: Media)
**Duración estimada: 2-3 días**

#### Task 3.1: Crear TipoConflictModal

**Archivo:** `src/components/personas/TipoConflictModal.tsx`

```typescript
interface Props {
  open: boolean;
  onClose: () => void;
  tipoActual: string;
  tipoNuevo: string;
  onConfirm: () => void;
}

export const TipoConflictModal: React.FC<Props> = ({
  open,
  onClose,
  tipoActual,
  tipoNuevo,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Tipos Mutuamente Excluyentes</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Los tipos <strong>{tipoActual}</strong> y <strong>{tipoNuevo}</strong>{' '}
          no pueden coexistir en la misma persona.
        </Alert>

        <Typography>
          Para asignar el tipo <strong>{tipoNuevo}</strong>, se debe remover
          primero el tipo <strong>{tipoActual}</strong>.
        </Typography>

        <Typography variant="body2" color="text.secondary" mt={2}>
          ¿Desea proceder con el cambio?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onConfirm} variant="contained" color="warning">
          Cambiar a {tipoNuevo}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

**Checklist:**
- [ ] Crear modal de conflicto de tipos
- [ ] Implementar validación en tiempo real en `PersonaForm`
- [ ] Deshabilitar chips de tipos excluyentes
- [ ] Implementar flujo de cambio (DELETE + POST)
- [ ] Actualizar estado local tras cambio exitoso

---

### **FASE 4: Componentes de Familiares** (Prioridad: Media)
**Duración estimada: 3-4 días**

#### Task 4.1: Crear FamiliarCard

**Archivo:** `src/components/personas/FamiliarCard.tsx`

```typescript
export const FamiliarCard: React.FC<{ relacion: RelacionFamiliar; onDelete: () => void }> = ({
  relacion,
  onDelete,
}) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box>
            <Typography variant="h6">
              {relacion.personaDestino.nombre} {relacion.personaDestino.apellido}
            </Typography>

            <Chip
              label={relacion.tipoParentesco.nombre}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mt: 1 }}
            />

            <Box mt={2} display="flex" gap={1}>
              {relacion.permisoRetiro && (
                <Chip
                  label="Permiso de Retiro"
                  size="small"
                  color="success"
                  icon={<CheckCircleIcon />}
                />
              )}
              {relacion.permisoDatos && (
                <Chip
                  label="Permiso de Datos"
                  size="small"
                  color="info"
                  icon={<InfoIcon />}
                />
              )}
            </Box>
          </Box>

          <IconButton onClick={onDelete} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};
```

**Checklist:**
- [ ] Crear `FamiliarCard` con badges de permisos
- [ ] Crear `AgregarFamiliarModal` con catálogo agrupado
- [ ] Actualizar `FamiliaView` eliminando lógica manual de relaciones inversas
- [ ] Implementar refetch tras DELETE
- [ ] Validar auto-referencia

---

### **FASE 5: Integración y Testing** (Prioridad: Media)
**Duración estimada: 2 días**

#### Task 5.1: Integrar Componentes en Páginas

**Archivos a modificar:**
- `src/pages/actividades/ActividadDetallePageV2.tsx`
- `src/pages/personas/PersonaDetallePage.tsx`

**Commits esperados:**
```bash
feat(pages): integrar DocentesList en detalle de actividad
feat(pages): integrar TipoSelector y FamiliaView en detalle de persona
```

**Checklist:**
- [ ] Agregar `DocentesList` como nuevo tab en `ActividadDetallePageV2`
- [ ] Agregar `FamiliaView` como tab en `PersonaDetallePage`
- [ ] Integrar `TipoSelector` en formulario de edición
- [ ] Verificar rutas y navegación

#### Task 5.2: Resolver Problemas Conocidos

**Checklist:**
- [ ] Agregar fallback local en `usePersonas.ts`
- [ ] Agregar valores por defecto (0) en `ActivityList` para campos nuevos
- [ ] Forzar `refetchFamiliares()` tras DELETE en `FamiliaView`
- [ ] Aplicar validación local + backend en `PersonaForm`

---

## 4. Consideraciones de Compatibilidad y Mantenimiento

### 4.1 Buenas Prácticas de Escalabilidad

#### **A. Componentización Reutilizable**

```
src/components/common/
  ├── ConfirmDialog.tsx        // Ya existe
  ├── ErrorBoundary.tsx         // NUEVO: manejo de errores global
  └── LoadingOverlay.tsx        // NUEVO: indicador de carga

src/components/ui/
  ├── Badge.tsx                 // Badges genéricos
  ├── Chip.tsx                  // Wrapper de MUI Chip con presets
  └── ProgressIndicator.tsx     // Indicadores de progreso genéricos
```

#### **B. Hooks Personalizados**

```typescript
// src/hooks/useApiMutation.ts
export const useApiMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: any) => void;
    successMessage?: string;
  }
) => {
  const [loading, setLoading] = useState(false);
  const { handleError } = useApiErrorHandler();

  const mutate = async (variables: TVariables) => {
    setLoading(true);
    try {
      const response = await mutationFn(variables);
      options?.onSuccess?.(response.data);
      if (options?.successMessage) toast.success(options.successMessage);
      return response.data;
    } catch (error) {
      handleError(error);
      options?.onError?.(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading };
};
```

### 4.2 Manejo de Errores Estandarizado

#### **A. Logging y Monitoreo**

```typescript
// src/utils/logger.ts
export const logger = {
  error: (message: string, error: any, context?: Record<string, any>) => {
    console.error(`[ERROR] ${message}`, { error, context });
    // TODO: Integrar con servicio de monitoreo (Sentry, LogRocket, etc.)
  },

  warn: (message: string, context?: Record<string, any>) => {
    console.warn(`[WARN] ${message}`, context);
  },

  info: (message: string, context?: Record<string, any>) => {
    console.info(`[INFO] ${message}`, context);
  },
};
```

### 4.3 Coherencia Visual

```typescript
// src/theme/tokens.ts
export const DESIGN_TOKENS = {
  colors: {
    tipo: {
      SOCIO: 'primary',
      NO_SOCIO: 'default',
      DOCENTE: 'secondary',
      PROVEEDOR: 'warning',
    },
    cupos: {
      disponibles: 'success',
      pocos: 'warning',
      agotados: 'error',
    },
  },
  spacing: {
    cardGap: 2,
    sectionMargin: 3,
  },
  typography: {
    cardTitle: 'h6',
    sectionTitle: 'h5',
  },
};
```

---

## 5. Resumen de Entregables

### Commits Esperados (Organización por Feature)

```bash
# FASE 1
git commit -m "feat(api): agregar endpoints de cupos y docentes en actividades"
git commit -m "feat(api): agregar endpoints de tipos de persona"
git commit -m "feat(api): agregar endpoints de relaciones familiares bidireccionales"
git commit -m "feat(catalogos): agregar rolesDocentes y tiposParentesco al provider"
git commit -m "feat(store): agregar gestión de docentes y cupos en actividadesSlice"
git commit -m "feat(store): agregar gestión de tipos en personasSlice"
git commit -m "refactor(store): simplificar familiaresSlice"
git commit -m "feat(errors): implementar manejo unificado de errores API"

# FASE 2
git commit -m "feat(actividades): crear componente CupoIndicator"
git commit -m "feat(actividades): integrar CupoIndicator en ActivityCard y ActivityList"
git commit -m "feat(actividades): mejorar modal de inscripción con validación de cupos"
git commit -m "feat(actividades): crear DocenteSelector y DocentesList"
git commit -m "feat(pages): integrar DocentesList en ActividadDetallePageV2"

# FASE 3
git commit -m "feat(personas): crear TipoConflictModal"
git commit -m "feat(personas): implementar validación de tipos excluyentes en PersonaForm"
git commit -m "feat(personas): mejorar TipoBadge con iconos y colores"

# FASE 4
git commit -m "feat(familiares): crear FamiliarCard con badges de permisos"
git commit -m "feat(familiares): crear AgregarFamiliarModal con catálogo agrupado"
git commit -m "refactor(familiares): actualizar FamiliaView eliminando lógica manual"

# FASE 5
git commit -m "fix(personas): agregar fallback local en usePersonas"
git commit -m "fix(actividades): agregar valores por defecto para campos nuevos"
git commit -m "fix(familiares): forzar refetch tras DELETE"
git commit -m "docs: actualizar CHANGELOG_UI.md con nuevas funcionalidades"
```

### Archivos Creados (24)

```
src/components/actividades/CupoIndicator.tsx
src/components/actividades/DocenteSelector.tsx
src/components/actividades/DocentesList.tsx
src/components/personas/TipoConflictModal.tsx
src/components/personas/TipoSelector.tsx
src/components/personas/FamiliarCard.tsx
src/components/personas/AgregarFamiliarModal.tsx
src/components/common/ErrorBoundary.tsx
src/components/common/LoadingOverlay.tsx
src/services/catalogosApi.ts
src/utils/errorHandling.ts
src/utils/logger.ts
src/constants/errorMessages.ts
src/constants/catalogos.fallback.ts
src/hooks/useApiMutation.ts
src/theme/tokens.ts
CHANGELOG_UI.md
```

### Archivos Modificados (15)

```
src/services/actividadesApi.ts
src/services/personasApi.ts
src/services/familiaresApi.ts
src/providers/CatalogosProvider.tsx
src/store/actividadesSlice.ts
src/store/personasSlice.ts
src/store/familiaresSlice.ts
src/components/actividades/ActivityCard.tsx
src/components/actividades/ActivityList.tsx
src/components/actividades/InscripcionModal.tsx
src/components/personas/PersonaForm.tsx
src/components/personas/TipoBadge.tsx
src/components/personas/FamiliaView.tsx
src/pages/actividades/ActividadDetallePageV2.tsx
src/pages/personas/PersonaDetallePage.tsx
```

---

## 6. Cronograma Estimado

| Fase | Duración | Inicio | Fin |
|------|----------|--------|-----|
| FASE 1: Infraestructura | 2-3 días | Día 1 | Día 3 |
| FASE 2: Actividades | 3-4 días | Día 4 | Día 7 |
| FASE 3: Personas | 2-3 días | Día 8 | Día 10 |
| FASE 4: Familiares | 3-4 días | Día 11 | Día 14 |
| FASE 5: Integración | 2 días | Día 15 | Día 16 |
| **TOTAL** | **12-16 días** | | |

---

## 7. Criterios de Aceptación

### Funcionales
- [ ] Sistema de cupos funcional con validación frontend y backend
- [ ] Asignación de docentes con roles operativa
- [ ] Validación de tipos excluyentes implementada con UX clara
- [ ] Relaciones familiares bidireccionales funcionando sin lógica manual
- [ ] Todos los catálogos nuevos cargados con fallbacks

### Técnicos
- [ ] Código pasa linter sin errores
- [ ] Manejo de errores estandarizado en todos los flujos
- [ ] Redux actualizado correctamente tras mutaciones
- [ ] Componentes reutilizables documentados
- [ ] Tests unitarios para validaciones críticas

### UX/UI
- [ ] Coherencia visual con Material-UI v7
- [ ] Mensajes de error claros y accionables
- [ ] Indicadores de carga en operaciones asíncronas
- [ ] Componentes responsivos
- [ ] Confirmaciones para acciones destructivas

---

**Última Actualización:** 2025-11-04
**Versión del Plan:** 2.0
**Estado:** 🟡 En Planificación
