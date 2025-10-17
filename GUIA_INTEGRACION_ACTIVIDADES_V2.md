# Guía de Integración Frontend - Actividades V2.0

## 📋 Índice

1. [Resumen de la Integración](#resumen-de-la-integración)
2. [Archivos Creados](#archivos-creados)
3. [Configuración Inicial](#configuración-inicial)
4. [Ejemplos de Uso](#ejemplos-de-uso)
5. [Migración desde V1](#migración-desde-v1)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Resumen de la Integración

Se ha completado la integración frontend con la API de Actividades V2.0 del backend. La implementación incluye:

✅ **Tipos TypeScript completos** basados en la documentación oficial
✅ **Servicio API** con todos los 26 endpoints documentados
✅ **Hooks personalizados** para simplificar el uso de la API
✅ **Componentes reutilizables** basados en Material-UI
✅ **Compatibilidad con Redux** (opcional)

---

## Archivos Creados

### 1. Tipos TypeScript
**Ubicación**: `src/types/actividadV2.types.ts`

Define todas las interfaces y tipos necesarios:
- Catálogos (Tipos, Categorías, Estados, Días, Roles)
- Entidades (ActividadV2, Horarios, Docentes, Participantes)
- DTOs (Create, Update, Query Params)
- Utilidades (formatters, validators)

### 2. Servicio API
**Ubicación**: `src/services/actividadesV2Api.ts`

Implementa todos los endpoints:
- CRUD de actividades
- Gestión de horarios
- Gestión de docentes
- Participantes
- Estadísticas y reportes
- Operaciones especiales (duplicar, cambiar estado)

### 3. Hooks Personalizados
**Ubicación**: `src/hooks/useActividadesV2.ts`

Hooks listos para usar:
- `useCatalogos()` - Carga catálogos
- `useActividades()` - Lista con paginación y filtros
- `useActividad()` - Obtiene una actividad
- `useActividadMutations()` - Crear, actualizar, eliminar
- `useHorariosActividad()` - Gestión de horarios
- `useDocentesActividad()` - Gestión de docentes
- `useParticipantesActividad()` - Lista de participantes
- `useEstadisticasActividad()` - Estadísticas

### 4. Componentes Reutilizables
**Ubicación**: `src/components/actividades/`

- `EstadoBadge.tsx` - Badge de estado con colores
- `HorarioSelector.tsx` - Selector de horarios
- `HorariosListaV2.tsx` - Lista de horarios
- `ActividadCardV2.tsx` - Tarjeta de actividad

---

## Configuración Inicial

### 1. Verificar Variables de Entorno

Asegúrate de que `.env` tenga configurada la URL correcta:

```env
VITE_API_URL=http://localhost:8000/api
```

### 2. Cargar Catálogos al Inicio

En tu componente raíz o layout principal:

```tsx
// App.tsx o Layout.tsx
import { useCatalogos } from './hooks/useActividadesV2';
import { createContext } from 'react';

export const CatalogosContext = createContext(null);

function App() {
  const { catalogos, loading } = useCatalogos();

  if (loading) return <div>Cargando sistema...</div>;

  return (
    <CatalogosContext.Provider value={catalogos}>
      {/* Tu aplicación */}
    </CatalogosContext.Provider>
  );
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Listar Actividades con Filtros

```tsx
import React from 'react';
import { useActividades } from '../hooks/useActividadesV2';
import { ActividadCardV2 } from '../components/actividades/ActividadCardV2';
import { Grid, CircularProgress, Box } from '@mui/material';

export const ActividadesListPage = () => {
  const { actividades, loading, pagination, fetchActividades } = useActividades({
    page: 1,
    limit: 12,
    estadoId: 1, // Solo activas
    conCupo: true, // Con cupo disponible
    incluirRelaciones: true,
    orderBy: 'nombre',
    orderDir: 'asc',
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <h1>Actividades Disponibles ({pagination.total})</h1>

      <Grid container spacing={2}>
        {actividades.map((actividad) => (
          <Grid item xs={12} sm={6} md={4} key={actividad.id}>
            <ActividadCardV2
              actividad={actividad}
              onView={(act) => console.log('Ver', act)}
              onEdit={(act) => console.log('Editar', act)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Paginación */}
      <Box mt={3} display="flex" justifyContent="center">
        <button
          disabled={pagination.page === 1}
          onClick={() => fetchActividades({ page: pagination.page - 1 })}
        >
          Anterior
        </button>
        <span>Página {pagination.page} de {pagination.pages}</span>
        <button
          disabled={pagination.page === pagination.pages}
          onClick={() => fetchActividades({ page: pagination.page + 1 })}
        >
          Siguiente
        </button>
      </Box>
    </div>
  );
};
```

### Ejemplo 2: Crear Nueva Actividad

```tsx
import React, { useState, useContext } from 'react';
import { useActividadMutations } from '../hooks/useActividadesV2';
import { CatalogosContext } from '../App';
import { HorarioSelector } from '../components/actividades/HorarioSelector';
import type { CreateActividadDTO, CreateHorarioDTO } from '../types/actividadV2.types';

export const CrearActividadPage = () => {
  const catalogos = useContext(CatalogosContext);
  const { crear, loading, error } = useActividadMutations();

  const [formData, setFormData] = useState({
    codigoActividad: '',
    nombre: '',
    tipoActividadId: 0,
    categoriaId: 0,
    descripcion: '',
    fechaDesde: '',
    fechaHasta: '',
    cupoMaximo: 0,
    costo: 0,
  });

  const [horarios, setHorarios] = useState<CreateHorarioDTO[]>([]);
  const [nuevoHorario, setNuevoHorario] = useState<Partial<CreateHorarioDTO>>({});

  const agregarHorario = () => {
    if (nuevoHorario.diaSemanaId && nuevoHorario.horaInicio && nuevoHorario.horaFin) {
      setHorarios([...horarios, nuevoHorario as CreateHorarioDTO]);
      setNuevoHorario({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data: CreateActividadDTO = {
        ...formData,
        codigoActividad: formData.codigoActividad.toUpperCase(),
        fechaDesde: new Date(formData.fechaDesde).toISOString(),
        fechaHasta: formData.fechaHasta ? new Date(formData.fechaHasta).toISOString() : undefined,
        horarios,
      };

      const nuevaActividad = await crear(data);
      console.log('Actividad creada:', nuevaActividad);
      alert('Actividad creada exitosamente');
    } catch (err) {
      console.error('Error:', err);
      alert('Error al crear actividad');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Crear Nueva Actividad</h1>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Campos básicos */}
      <div>
        <label>Código de Actividad *</label>
        <input
          type="text"
          value={formData.codigoActividad}
          onChange={(e) => setFormData({ ...formData, codigoActividad: e.target.value })}
          placeholder="CORO-ADU-2025-A"
          required
        />
      </div>

      <div>
        <label>Nombre *</label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Tipo *</label>
        <select
          value={formData.tipoActividadId}
          onChange={(e) => setFormData({ ...formData, tipoActividadId: Number(e.target.value) })}
          required
        >
          <option value={0}>Seleccione...</option>
          {catalogos?.tipos.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Categoría *</label>
        <select
          value={formData.categoriaId}
          onChange={(e) => setFormData({ ...formData, categoriaId: Number(e.target.value) })}
          required
        >
          <option value={0}>Seleccione...</option>
          {catalogos?.categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Horarios */}
      <div>
        <h3>Horarios</h3>
        {horarios.map((h, idx) => (
          <div key={idx}>
            {catalogos?.diasSemana.find((d) => d.id === h.diaSemanaId)?.nombre}: {h.horaInicio} - {h.horaFin}
          </div>
        ))}

        <HorarioSelector
          value={nuevoHorario}
          onChange={setNuevoHorario}
          diasSemana={catalogos?.diasSemana || []}
        />
        <button type="button" onClick={agregarHorario}>
          + Agregar Horario
        </button>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Actividad'}
      </button>
    </form>
  );
};
```

### Ejemplo 3: Ver Detalle de Actividad

```tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useActividad, useHorariosActividad, useDocentesActividad } from '../hooks/useActividadesV2';
import { HorariosListaV2 } from '../components/actividades/HorariosListaV2';
import { EstadoBadge } from '../components/actividades/EstadoBadge';

export const ActividadDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const { actividad, loading } = useActividad(Number(id));
  const { horarios } = useHorariosActividad(Number(id));
  const { docentes } = useDocentesActividad(Number(id));

  if (loading) return <div>Cargando...</div>;
  if (!actividad) return <div>Actividad no encontrada</div>;

  return (
    <div>
      <h1>{actividad.nombre}</h1>
      <p>Código: {actividad.codigo_actividad}</p>

      {actividad.estados_actividades && (
        <EstadoBadge estado={actividad.estados_actividades} />
      )}

      <h2>Información General</h2>
      <p>Tipo: {actividad.tipos_actividades?.nombre}</p>
      <p>Categoría: {actividad.categorias_actividades?.nombre}</p>
      <p>Costo: ${actividad.costo}</p>
      {actividad.cupo_maximo && <p>Cupo: {actividad.cupo_maximo} personas</p>}

      <h2>Horarios</h2>
      <HorariosListaV2 horarios={horarios} />

      <h2>Docentes</h2>
      <ul>
        {docentes.map((d) => (
          <li key={d.id}>
            {d.personas?.nombre} {d.personas?.apellido} - {d.roles_docentes?.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

## Migración desde V1

### Diferencias Principales

| Aspecto | V1 (Actual) | V2 (Nuevo) |
|---------|-------------|-----------|
| **IDs** | UUID/CUID mixto | SERIAL (int) para actividades |
| **Estructura** | Flat, sin catálogos | Normalizada con catálogos |
| **Horarios** | Un solo horario | Múltiples horarios (N:M) |
| **Estados** | String directo | Relación con tabla de estados |
| **Respuestas** | Formato variable | Formato consistente con `success`, `data`, `error` |

### Mapeo de Campos

```typescript
// V1 → V2
{
  tipo: 'coro'                    → tipoActividadId: 1
  categoria: 'adulto'             → categoriaId: 1
  estado: 'activo'                → estadoId: 1
  diaSemana: 'lunes'              → horarios[0].diaSemanaId: 1
  horaInicio: '10:00'             → horarios[0].horaInicio: '10:00'
  horaFin: '12:00'                → horarios[0].horaFin: '12:00'
  fechaInicio: '2025-01-01'       → fecha_desde: '2025-01-01T00:00:00.000Z'
  cupoMaximo: 30                  → cupo_maximo: 30
}
```

### Pasos para Migrar

1. **Mantén ambos sistemas funcionando** durante la transición
2. **Carga catálogos** al inicio de la aplicación
3. **Actualiza formularios** para usar los nuevos tipos
4. **Reemplaza llamadas API** progresivamente
5. **Prueba exhaustivamente** antes de deprecar V1

---

## Testing

### Test Unitario de Hooks

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useActividades } from '../hooks/useActividadesV2';

describe('useActividades', () => {
  it('debe cargar actividades correctamente', async () => {
    const { result } = renderHook(() => useActividades({ page: 1, limit: 10 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.actividades).toBeDefined();
    expect(result.current.pagination.total).toBeGreaterThanOrEqual(0);
  });
});
```

### Test de Integración

```bash
# 1. Verificar que el backend esté corriendo
curl http://localhost:8000/api/actividades/catalogos/todos

# 2. Verificar creación de actividad
curl -X POST http://localhost:8000/api/actividades \
  -H "Content-Type: application/json" \
  -d '{
    "codigoActividad": "TEST-2025",
    "nombre": "Actividad de Test",
    "tipoActividadId": 1,
    "categoriaId": 1,
    "fechaDesde": "2025-03-01T00:00:00.000Z",
    "horarios": []
  }'
```

---

## Troubleshooting

### Problema: Error de CORS

**Síntoma**: `Access-Control-Allow-Origin` error en consola

**Solución**: Verificar que el backend tenga CORS habilitado para el origen del frontend

```typescript
// Backend debe tener:
app.use(cors({
  origin: 'http://localhost:5173' // Puerto de Vite
}));
```

### Problema: Catálogos no cargan

**Síntoma**: `catalogos` es `null` en componentes

**Solución**:
1. Verificar URL de API en `.env`
2. Verificar que backend esté corriendo
3. Revisar consola del navegador para errores de red

### Problema: Tipos TypeScript incompatibles

**Síntoma**: Errores de tipo al compilar

**Solución**:
1. Asegurarse de importar desde `actividadV2.types.ts`
2. No mezclar tipos V1 con V2
3. Usar `ActividadV2` en lugar de `Actividad`

### Problema: Horarios no se guardan

**Síntoma**: Actividad se crea pero sin horarios

**Solución**:
1. Verificar formato de `horaInicio` y `horaFin` (debe ser "HH:MM" o "HH:MM:SS")
2. Verificar que `diaSemanaId` sea un número válido (1-7)
3. Revisar respuesta del backend para errores de validación

---

## Próximos Pasos

1. ✅ **Implementar página de listado** usando `useActividades`
2. ✅ **Implementar formulario de creación** usando `useActividadMutations`
3. ✅ **Implementar página de detalle** usando `useActividad`
4. ⏳ **Agregar filtros avanzados** en página de listado
5. ⏳ **Implementar duplicación de actividades**
6. ⏳ **Agregar gestión de docentes y participantes**
7. ⏳ **Implementar reportes y estadísticas**

---

## Recursos

- **Documentación Backend**: `/docs/API_ACTIVIDADES_V2.md`
- **Guía Rápida Backend**: `/docs/GUIA_RAPIDA_FRONTEND.md`
- **Tipos TypeScript**: `src/types/actividadV2.types.ts`
- **Servicio API**: `src/services/actividadesV2Api.ts`
- **Hooks**: `src/hooks/useActividadesV2.ts`

---

**Última actualización**: 2025-10-16
**Versión**: 1.0
**Autor**: Equipo de Desarrollo SIGESDA
