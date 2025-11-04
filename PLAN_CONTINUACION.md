# Plan de Continuación - SIGESDA Frontend
## Próximos Pasos Post-Migración V5

**Fecha:** 2025-11-04
**Estado Actual:** Migración V5 completada - Fases 1-3 implementadas
**Duración Estimada Total:** 3-4 días

---

## 📋 RESUMEN EJECUTIVO

Tras completar la implementación del Plan de Migración V5 (Fases 1-3), quedan pendientes:
1. **Integración del módulo de Familiares** en PersonaDetallePage
2. **Testing End-to-End** de flujos críticos
3. **Optimizaciones de Performance** y UX

**Prioridad:** Media-Alta
**Dependencias:** Ninguna (infraestructura completa)
**Riesgo:** Bajo (componentes ya existen)

---

## 🎯 FASE 6: Integración del Módulo de Familiares
**Duración:** 1 día
**Prioridad:** Alta

### Task 6.1: Crear FamiliaresTab Component

**Objetivo:** Componente reutilizable para gestionar familiares de una persona en PersonaDetallePage

**Archivo a crear:**
`src/components/personas/v2/familiares/FamiliaresTab.tsx`

**Especificación técnica:**

```typescript
import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, Stack } from '@mui/material';
import { Add as AddIcon, FamilyRestroom as FamilyIcon } from '@mui/icons-material';
import { familiaresApiReal } from '../../../../services/familiaresApi';
import { RelacionFamiliarDialog } from '../../../forms/RelacionFamiliarDialog';
import { FamiliarCard } from './FamiliarCard';
import type { RelacionFamiliar } from '../../../../store/slices/familiaresSlice';

interface FamiliaresTabProps {
  personaId: number;
  personaNombre: string;
  personaApellido: string;
}

export const FamiliaresTab: React.FC<FamiliaresTabProps> = ({
  personaId,
  personaNombre,
  personaApellido,
}) => {
  const [familiares, setFamiliares] = useState<RelacionFamiliar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const cargarFamiliares = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await familiaresApiReal.getRelacionesDePersona(personaId);
      setFamiliares(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar familiares');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFamiliares();
  }, [personaId]);

  const handleEliminar = async (relacionId: number) => {
    if (!confirm('¿Eliminar esta relación familiar?')) return;

    try {
      await familiaresApiReal.eliminarRelacion(relacionId);
      await cargarFamiliares(); // Refetch
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  const handleSuccess = () => {
    cargarFamiliares(); // Refetch tras agregar
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" display="flex" alignItems="center" gap={1}>
          <FamilyIcon />
          Familiares ({familiares.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Agregar Familiar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {familiares.length === 0 ? (
        <Alert severity="info">
          No hay familiares registrados para {personaNombre} {personaApellido}
        </Alert>
      ) : (
        <Stack spacing={2}>
          {familiares.map((relacion) => (
            <FamiliarCard
              key={relacion.id}
              relacion={relacion}
              onDelete={() => handleEliminar(relacion.id)}
            />
          ))}
        </Stack>
      )}

      <RelacionFamiliarDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        personaOrigenId={personaId}
        onSuccess={handleSuccess}
      />
    </Box>
  );
};

export default FamiliaresTab;
```

**Checklist:**
- [ ] Crear `FamiliaresTab.tsx` con integración a `familiaresApiReal`
- [ ] Implementar refetch automático tras eliminar
- [ ] Usar `RelacionFamiliarDialog` existente para agregar
- [ ] Validar que funcione con endpoint `/api/familiares/socio/:id`
- [ ] Manejo de estados: loading, error, empty

---

### Task 6.2: Crear FamiliarCard Component

**Objetivo:** Card visual para mostrar una relación familiar con badges de permisos

**Archivo a crear:**
`src/components/personas/v2/familiares/FamiliarCard.tsx`

**Especificación técnica:**

```typescript
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  ContactPhone as PhoneIcon,
  MonetizationOn as MoneyIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import type { RelacionFamiliar } from '../../../../store/slices/familiaresSlice';

interface FamiliarCardProps {
  relacion: RelacionFamiliar;
  onDelete: () => void;
}

export const FamiliarCard: React.FC<FamiliarCardProps> = ({ relacion, onDelete }) => {
  const familiar = relacion.personaDestino;

  // Mapear tipo de relación a color
  const getRelacionColor = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (['padre', 'madre'].includes(tipoLower)) return 'primary';
    if (['hijo', 'hija'].includes(tipoLower)) return 'success';
    if (['hermano', 'hermana'].includes(tipoLower)) return 'info';
    if (['esposo', 'esposa'].includes(tipoLower)) return 'secondary';
    return 'default';
  };

  const tienePermisos =
    relacion.autorizadoRetiro ||
    relacion.contactoEmergencia ||
    relacion.responsableFinanciero;

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            {/* Nombre del familiar */}
            <Typography variant="h6" gutterBottom>
              {familiar.apellido}, {familiar.nombre}
            </Typography>

            {/* Tipo de relación */}
            <Chip
              label={relacion.tipoRelacion.toUpperCase()}
              size="small"
              color={getRelacionColor(relacion.tipoRelacion)}
              sx={{ mb: 2 }}
            />

            {/* DNI y contacto */}
            <Box display="flex" gap={2} mb={1}>
              {familiar.dni && (
                <Typography variant="body2" color="text.secondary">
                  DNI: <strong>{familiar.dni}</strong>
                </Typography>
              )}
              {familiar.telefono && (
                <Typography variant="body2" color="text.secondary">
                  Tel: <strong>{familiar.telefono}</strong>
                </Typography>
              )}
            </Box>

            {/* Permisos y badges */}
            {tienePermisos && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {relacion.autorizadoRetiro && (
                    <Chip
                      label="Autorizado Retiro"
                      size="small"
                      color="success"
                      variant="outlined"
                      icon={<CheckIcon />}
                    />
                  )}
                  {relacion.contactoEmergencia && (
                    <Chip
                      label="Contacto Emergencia"
                      size="small"
                      color="error"
                      variant="outlined"
                      icon={<PhoneIcon />}
                    />
                  )}
                  {relacion.responsableFinanciero && (
                    <Chip
                      label="Responsable Financiero"
                      size="small"
                      color="warning"
                      variant="outlined"
                      icon={<MoneyIcon />}
                    />
                  )}
                </Stack>
              </>
            )}

            {/* Descuento */}
            {relacion.porcentajeDescuento && relacion.porcentajeDescuento > 0 && (
              <Box mt={1}>
                <Chip
                  label={`${relacion.porcentajeDescuento}% Descuento`}
                  size="small"
                  color="info"
                  variant="filled"
                />
              </Box>
            )}

            {/* Descripción */}
            {relacion.descripcion && (
              <Box mt={1.5}>
                <Typography variant="caption" color="text.secondary" display="block">
                  <InfoIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  {relacion.descripcion}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Botón eliminar */}
          <Tooltip title="Eliminar relación">
            <IconButton onClick={onDelete} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FamiliarCard;
```

**Checklist:**
- [ ] Crear `FamiliarCard.tsx` con badges de permisos
- [ ] Colores dinámicos según tipo de relación
- [ ] Mostrar DNI, teléfono, descripción
- [ ] Badges: Autorizado Retiro, Contacto Emergencia, Responsable Financiero
- [ ] Mostrar % de descuento si aplica
- [ ] Botón de eliminar con confirmación

---

### Task 6.3: Integrar FamiliaresTab en PersonaDetallePage

**Archivo a modificar:**
`src/pages/Personas/PersonaDetallePage.tsx`

**Cambios requeridos:**

```typescript
// 1. Importar el nuevo componente
import { FamiliaresTab } from '../../components/personas/v2/familiares/FamiliaresTab';

// 2. Actualizar el TabPanel de Familiares (líneas 298-308)
{/* Tab Panel: Familiares */}
<TabPanel value={tabValue} index={3}>
  <Box p={2}>
    <FamiliaresTab
      personaId={persona.id}
      personaNombre={persona.nombre}
      personaApellido={persona.apellido}
    />
  </Box>
</TabPanel>
```

**Checklist:**
- [ ] Importar `FamiliaresTab`
- [ ] Reemplazar el Alert de "en desarrollo" por el componente
- [ ] Pasar props: `personaId`, `personaNombre`, `personaApellido`
- [ ] Verificar que funcione la navegación entre tabs
- [ ] Testing: crear, listar, eliminar familiares

---

## 🧪 FASE 7: Testing End-to-End
**Duración:** 1.5 días
**Prioridad:** Alta

### Task 7.1: Testing de Flujos de Actividades

**Objetivo:** Validar flujos completos con el backend

#### 7.1.1 Testing de Cupos y Validaciones

**Escenario 1: Inscripción con cupo disponible**
```
GIVEN una actividad con capacidadMaxima=10, participantesActivos=5
WHEN inscribo a 3 personas
THEN:
  - La inscripción debe ser exitosa
  - cupoActual debe incrementar a 8
  - cuposDisponibles debe mostrar 2
  - CupoIndicator debe estar en color warning (<=5)
```

**Escenario 2: Validación de capacidad máxima**
```
GIVEN una actividad con capacidadMaxima=10, participantesActivos=10
WHEN intento inscribir a 1 persona
THEN:
  - Debe mostrar error: "La actividad ha alcanzado su capacidad máxima"
  - Error code: CAPACIDAD_MAXIMA_ALCANZADA
  - No debe permitir la inscripción
```

**Escenario 3: Validación de inscripción duplicada**
```
GIVEN una actividad donde persona ID 5 ya está inscripta
WHEN intento inscribir nuevamente a persona ID 5
THEN:
  - Debe mostrar error: "Esta persona ya está inscripta en la actividad"
  - Error code: YA_INSCRIPTO
```

**Escenario 4: Actividad sin límite de cupos**
```
GIVEN una actividad con capacidadMaxima=null
WHEN inscribo a N personas
THEN:
  - Todas las inscripciones deben ser exitosas
  - CupoIndicator debe mostrar "Sin límite de cupos" (color info)
```

**Checklist:**
- [ ] Crear actividad de prueba con capacidadMaxima=10
- [ ] Inscribir 5 personas y verificar cupos
- [ ] Inscribir hasta llenar y validar error CAPACIDAD_MAXIMA_ALCANZADA
- [ ] Intentar inscripción duplicada y validar error YA_INSCRIPTO
- [ ] Crear actividad sin límite (null) y validar comportamiento
- [ ] Verificar que Redux actualice cupoActual correctamente

#### 7.1.2 Testing de Gestión de Docentes

**Escenario 1: Asignar docente con rol**
```
GIVEN una actividad sin docentes asignados
WHEN asigno un docente con rol "PROFESOR"
THEN:
  - La asignación debe ser exitosa
  - DocentesTab debe mostrar 1 docente
  - Badge debe mostrar rol "Profesor"
```

**Escenario 2: Validación de docente duplicado**
```
GIVEN una actividad con docente ID 3 asignado
WHEN intento asignar nuevamente docente ID 3
THEN:
  - Debe mostrar error: "Este docente ya está asignado a la actividad"
  - Error code: DOCENTE_YA_ASIGNADO
```

**Escenario 3: Múltiples docentes con roles diferentes**
```
GIVEN una actividad sin docentes
WHEN asigno:
  - Docente A con rol PROFESOR
  - Docente B con rol AYUDANTE
  - Docente C con rol INVITADO
THEN:
  - Los 3 deben aparecer en DocentesTab
  - Cada uno con su badge de rol correcto
```

**Checklist:**
- [ ] Asignar docente con rol PROFESOR y verificar
- [ ] Asignar segundo docente con rol AYUDANTE
- [ ] Intentar asignar docente duplicado y validar error
- [ ] Verificar que AsignarDocenteModalV2 muestre 3 pasos correctamente
- [ ] Verificar búsqueda de docentes en paso 1
- [ ] Verificar selector de roles en paso 2
- [ ] Verificar confirmación en paso 3
- [ ] Eliminar docente y verificar refetch

---

### Task 7.2: Testing de Flujos de Personas

**Objetivo:** Validar sistema multi-tipo y sus validaciones

#### 7.2.1 Testing de Asignación de Tipos

**Escenario 1: Asignar tipo SOCIO**
```
GIVEN una persona sin tipos asignados
WHEN asigno tipo SOCIO con categoriaId=2
THEN:
  - Tipo SOCIO debe aparecer en PersonaDetallePage
  - Badge debe mostrar color primary con ícono GroupIcon
  - TipoItem debe mostrar categoría seleccionada
```

**Escenario 2: Asignar tipo DOCENTE**
```
GIVEN una persona con tipo SOCIO asignado
WHEN asigno tipo DOCENTE con:
  - especialidadId=1 ("Piano")
  - honorariosPorHora=1500
THEN:
  - Persona debe tener 2 tipos: SOCIO y DOCENTE
  - TipoItem DOCENTE debe mostrar especialidad y honorarios formateados
```

**Escenario 3: Validación de exclusión mutua SOCIO/NO_SOCIO**
```
GIVEN una persona con tipo SOCIO asignado
WHEN intento asignar tipo NO_SOCIO
THEN:
  - Modal debe mostrar warning de exclusión mutua
  - Al confirmar, debe desasignar SOCIO y asignar NO_SOCIO
  - Error code: TIPOS_EXCLUYENTES (si backend rechaza)
```

**Escenario 4: Asignar tipo PROVEEDOR con validación de CUIT**
```
GIVEN una persona sin tipos
WHEN asigno tipo PROVEEDOR con:
  - cuit="20-12345678-9" (formato con guiones)
  - razonSocial="Empresa Test SA"
THEN:
  - Backend debe recibir CUIT sin guiones: "20123456789"
  - TipoItem debe mostrar razón social y CUIT
```

**Escenario 5: Validación de campos obligatorios**
```
GIVEN AsignarTipoModal abierto
WHEN selecciono tipo SOCIO pero no elijo categoría
AND hago click en "Asignar Tipo"
THEN:
  - Debe mostrar error: "La categoría es obligatoria para tipo SOCIO"
  - No debe permitir submit
```

**Checklist:**
- [ ] Crear persona nueva de prueba
- [ ] Asignar tipo SOCIO y verificar badge + categoría
- [ ] Asignar tipo DOCENTE y verificar especialidad + honorarios
- [ ] Asignar tipo PROVEEDOR y verificar CUIT + razón social
- [ ] Verificar que CUIT con guiones se limpie correctamente
- [ ] Intentar asignar NO_SOCIO a persona con SOCIO (validar exclusión)
- [ ] Verificar validaciones de campos obligatorios en modal
- [ ] Toggle activo/inactivo de un tipo
- [ ] Eliminar un tipo y verificar refetch
- [ ] Verificar que persona con múltiples tipos muestre todos los badges

#### 7.2.2 Testing de Observaciones y Fechas

**Escenario 1: Observaciones en tipos**
```
GIVEN asigno tipo DOCENTE
WHEN agrego observación: "Profesor titular de coro"
THEN:
  - TipoItem debe mostrar la observación en itálica
  - Debe aparecer debajo de los campos específicos
```

**Escenario 2: Fechas de asignación**
```
GIVEN un tipo asignado hace 2 días
WHEN visualizo TipoItem en modo card (no compact)
THEN:
  - Debe mostrar "Asignado: DD/MM/YYYY"
  - Si se modificó, debe mostrar "Modificado: DD/MM/YYYY"
```

**Checklist:**
- [ ] Asignar tipo con observaciones y verificar display
- [ ] Verificar formato de fechas (DD/MM/YYYY)
- [ ] Verificar que se muestre fecha de modificación si aplica

---

### Task 7.3: Testing de Flujos de Familiares

**Objetivo:** Validar creación, listado y eliminación de relaciones

#### 7.3.1 Testing de Relaciones Familiares

**Escenario 1: Agregar familiar con relación PADRE**
```
GIVEN persona A (hijo) en PersonaDetallePage
WHEN agrego familiar B con relación "PADRE"
AND marco permisos:
  - Autorizado Retiro: true
  - Responsable Financiero: true
THEN:
  - FamiliarCard debe mostrar B como PADRE de A
  - Badges: "Autorizado Retiro" y "Responsable Financiero"
  - Backend crea relación inversa automática (B tiene HIJO → A)
```

**Escenario 2: Validación de auto-referencia**
```
GIVEN persona A en PersonaDetallePage
WHEN intento agregar a A como familiar de A
THEN:
  - Debe mostrar error: "Una persona no puede agregarse a sí misma como familiar"
  - Error code: AUTO_REFERENCIA
```

**Escenario 3: Validación de relación duplicada**
```
GIVEN persona A tiene a B como familiar (relación: MADRE)
WHEN intento agregar nuevamente a B como familiar de A
THEN:
  - Debe mostrar error: "Esta relación familiar ya existe"
  - Error code: RELACION_YA_EXISTE
```

**Escenario 4: Descuento familiar**
```
GIVEN persona A (socio) agrega familiar B (hijo)
WHEN asigno descuento: 20%
THEN:
  - FamiliarCard debe mostrar chip "20% Descuento" (color info)
  - Campo porcentajeDescuento debe guardarse correctamente
```

**Escenario 5: Eliminar relación familiar**
```
GIVEN persona A tiene familiar B
WHEN elimino la relación desde FamiliarCard
THEN:
  - Debe pedir confirmación
  - Tras confirmar, debe eliminar la relación
  - Lista debe actualizarse (refetch)
  - Backend debe eliminar ambas direcciones de la relación
```

**Checklist:**
- [ ] Crear 2 personas de prueba (A y B)
- [ ] Agregar B como PADRE de A con permisos de retiro
- [ ] Verificar que FamiliarCard muestre correctamente
- [ ] Verificar que badge "Autorizado Retiro" aparezca
- [ ] Intentar agregar A como familiar de A (validar auto-referencia)
- [ ] Intentar agregar B nuevamente (validar duplicado)
- [ ] Agregar familiar C con descuento 15%
- [ ] Verificar que chip de descuento aparezca
- [ ] Eliminar familiar B y verificar refetch
- [ ] Verificar que backend eliminó relación inversa

---

## ⚡ FASE 8: Optimizaciones de Performance
**Duración:** 1 día
**Prioridad:** Media

### Task 8.1: Debounce en Búsquedas

**Objetivo:** Reducir llamadas API durante búsquedas en tiempo real

**Archivos a modificar:**

1. **InscripcionUnificadaModal.tsx** (línea 317)
```typescript
// Antes
onChange={(e) => {
  setSearchTerm(e.target.value);
  setHighlightedIndex(0);
}}

// Después
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const debouncedSearch = useMemo(
  () => debounce((value: string) => {
    setSearchTerm(value);
    setHighlightedIndex(0);
  }, 300),
  []
);

onChange={(e) => debouncedSearch(e.target.value)}
```

2. **AsignarDocenteModalV2.tsx** (línea 158)
```typescript
// Aplicar mismo patrón de debounce
const debouncedSearch = useMemo(
  () => debounce((value: string) => setSearchTerm(value), 300),
  []
);
```

**Instalación de dependencia:**
```bash
npm install lodash
npm install --save-dev @types/lodash
```

**Checklist:**
- [ ] Instalar lodash y tipos
- [ ] Implementar debounce en InscripcionUnificadaModal
- [ ] Implementar debounce en AsignarDocenteModalV2
- [ ] Verificar que búsqueda espera 300ms antes de filtrar
- [ ] Cleanup del debounce en useEffect

---

### Task 8.2: Cache de Catálogos en LocalStorage

**Objetivo:** Reducir llamadas API para catálogos que cambian poco

**Archivo a crear:**
`src/utils/catalogCache.ts`

```typescript
interface CachedData<T> {
  data: T;
  timestamp: number;
  version: string;
}

const CACHE_DURATION = 1000 * 60 * 30; // 30 minutos
const CACHE_VERSION = '1.0'; // Incrementar cuando cambie estructura

export const catalogCache = {
  set: <T>(key: string, data: T): void => {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(`catalog_${key}`, JSON.stringify(cached));
  },

  get: <T>(key: string): T | null => {
    const item = localStorage.getItem(`catalog_${key}`);
    if (!item) return null;

    try {
      const cached: CachedData<T> = JSON.parse(item);

      // Verificar versión
      if (cached.version !== CACHE_VERSION) {
        catalogCache.remove(key);
        return null;
      }

      // Verificar expiración
      const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
      if (isExpired) {
        catalogCache.remove(key);
        return null;
      }

      return cached.data;
    } catch {
      catalogCache.remove(key);
      return null;
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(`catalog_${key}`);
  },

  clear: (): void => {
    Object.keys(localStorage)
      .filter(key => key.startsWith('catalog_'))
      .forEach(key => localStorage.removeItem(key));
  },
};
```

**Integración en CatalogosProvider:**

```typescript
// src/providers/CatalogosProvider.tsx

const loadCatalogos = async () => {
  setLoading(true);
  setError(null);

  try {
    // Intentar cargar desde cache primero
    const cached = catalogCache.get<CatalogosData>('all');
    if (cached) {
      setCatalogos(cached);
      setLoading(false);
      return;
    }

    // Si no hay cache, cargar desde API
    const response = await catalogosApi.getCatalogos();
    const data = response.data;

    // Filtrar diasSemana (IDs 1-7)
    const filtered = {
      ...data,
      diasSemana: data.diasSemana.filter((d) => d.id <= 7),
    };

    setCatalogos(filtered);

    // Guardar en cache
    catalogCache.set('all', filtered);
  } catch (err: any) {
    setError(err.message || 'Error al cargar catálogos');
  } finally {
    setLoading(false);
  }
};
```

**Checklist:**
- [ ] Crear `catalogCache.ts` con set/get/remove/clear
- [ ] Implementar expiración de 30 minutos
- [ ] Implementar versionado de cache
- [ ] Integrar en CatalogosProvider
- [ ] Agregar botón "Limpiar Cache" en Settings (opcional)
- [ ] Testing: verificar que cache funcione
- [ ] Testing: verificar expiración tras 30 min

---

### Task 8.3: Lazy Loading de Tabs

**Objetivo:** Cargar datos de tabs solo cuando se activan

**Archivo a modificar:**
`src/pages/Personas/PersonaDetallePage.tsx`

**Implementación:**

```typescript
// Estado para controlar qué tabs han sido visitados
const [visitedTabs, setVisitedTabs] = useState<Set<number>>(new Set([0])); // Tab 0 siempre visitado

const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
  setTabValue(newValue);
  setVisitedTabs(prev => new Set(prev).add(newValue)); // Marcar tab como visitado
};

// En cada TabPanel, solo renderizar si fue visitado
<TabPanel value={tabValue} index={1}>
  {visitedTabs.has(1) ? (
    <Box p={2}>
      {/* Contenido de Tipos */}
    </Box>
  ) : null}
</TabPanel>

<TabPanel value={tabValue} index={2}>
  {visitedTabs.has(2) ? (
    <Box p={2}>
      <ContactosTab personaId={persona.id} catalogos={catalogos} />
    </Box>
  ) : null}
</TabPanel>

<TabPanel value={tabValue} index={3}>
  {visitedTabs.has(3) ? (
    <Box p={2}>
      <FamiliaresTab
        personaId={persona.id}
        personaNombre={persona.nombre}
        personaApellido={persona.apellido}
      />
    </Box>
  ) : null}
</TabPanel>
```

**Beneficios:**
- FamiliaresTab no carga datos hasta que usuario hace click en el tab
- ContactosTab no carga hasta ser visitado
- Reduce llamadas API iniciales en 66% (3 tabs → 1 tab)

**Checklist:**
- [ ] Implementar estado `visitedTabs` con Set
- [ ] Modificar `handleTabChange` para marcar tabs visitados
- [ ] Aplicar lazy loading en tabs 1, 2, 3
- [ ] Verificar que tab 0 (Datos Generales) siempre cargue
- [ ] Testing: verificar que tabs cargan solo al visitarse
- [ ] Verificar que no hay re-renders innecesarios

---

## 📊 ENTREGABLES FINALES

### Documentación
- [ ] Actualizar README.md con nuevas funcionalidades
- [ ] Documentar códigos de error en CLAUDE.md
- [ ] Agregar ejemplos de uso de nuevos componentes

### Código
- [ ] 2 nuevos componentes: FamiliaresTab, FamiliarCard
- [ ] 1 utility: catalogCache.ts
- [ ] Modificaciones en PersonaDetallePage
- [ ] Optimizaciones: debounce, cache, lazy loading

### Testing
- [ ] 15+ escenarios de testing documentados
- [ ] Casos de error validados
- [ ] Flujos E2E verificados

---

## 🎯 CRITERIOS DE ACEPTACIÓN

### Funcionales
✅ Usuario puede agregar/eliminar familiares desde PersonaDetallePage
✅ Validaciones de auto-referencia y duplicados funcionan
✅ Badges de permisos y descuentos se muestran correctamente
✅ Cupos se validan y actualizan en tiempo real
✅ Tipos de persona se asignan con validaciones específicas
✅ Docentes se asignan con roles correctos

### Técnicos
✅ Búsquedas con debounce (300ms)
✅ Catálogos se cachean 30 minutos
✅ Tabs cargan lazy (solo al visitarse)
✅ Manejo de errores unificado
✅ Redux actualizado correctamente
✅ No memory leaks en componentes

### UX/Performance
✅ Tiempo de carga inicial < 2s
✅ Búsquedas fluidas sin lag
✅ Feedback visual en todas las acciones
✅ Confirmaciones antes de eliminar
✅ Mensajes de error amigables

---

## 📈 MÉTRICAS DE ÉXITO

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| Tiempo de carga inicial | < 2s | Lighthouse Performance Score |
| Llamadas API reducidas | -50% | Network tab (catálogos cacheados) |
| Búsquedas sin lag | Debounce 300ms | User testing |
| Cobertura de errores | 100% códigos mapeados | errorHandling.ts |
| Componentes reutilizables | 8+ nuevos | Arquitectura modular |

---

## 🚀 COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev

# Build + verificar errores
npm run build

# Lint
npm run lint

# Limpiar cache de node_modules
rm -rf node_modules package-lock.json && npm install

# Ver tamaño del bundle
npm run build -- --analyze
```

---

## 📞 SOPORTE Y REFERENCIAS

- **CLAUDE.md**: Arquitectura y patrones del proyecto
- **PLAN_MIGRACION_V5.md**: Plan original implementado (Fases 1-3)
- **Backend API Docs**: (ubicación según tu proyecto)
- **MUI v7 Docs**: https://mui.com/material-ui/

---

**Última actualización:** 2025-11-04
**Estado:** ✅ Listo para implementación
**Próxima revisión:** Tras completar Fase 6
