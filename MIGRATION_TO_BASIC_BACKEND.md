# Migración a Backend Básico - Personas Module

## Resumen

El frontend ha sido simplificado para trabajar **exclusivamente con el Backend Básico** que implementa solo 6 endpoints para el módulo Personas:

1. `GET /api/personas` - Listar personas
2. `GET /api/personas/:id` - Obtener una persona
3. `POST /api/personas` - Crear persona
4. `PUT /api/personas/:id` - Actualizar persona
5. `DELETE /api/personas/:id` - Eliminar persona
6. `GET /api/tipo-persona-catalogo` - Obtener catálogo de tipos

## Cambios Realizados

### 1. Nuevos Archivos Creados

#### Schemas Simplificados
- **`src/schemas/persona.basic.schema.ts`**
  - Schema Zod simplificado sin discriminated unions
  - Sin validaciones de tipos múltiples
  - Sin campos específicos por tipo (categoriaId, especialidadId, etc.)
  - Solo campos básicos: nombre, apellido, dni, email, telefono, direccion, fechaNacimiento, observaciones

#### Componentes Básicos
- **`src/components/personas/basic/PersonaFormBasic.tsx`**
  - Formulario simplificado de creación/edición
  - Sin gestión de tipos
  - Sin gestión de contactos
  - Solo campos básicos de persona
  - 329 líneas

- **`src/components/personas/basic/index.ts`**
  - Barrel export para componentes básicos

#### Páginas Simplificadas
- **`src/pages/Personas/PersonaDetallePageBasic.tsx`**
  - Página de detalle sin tabs
  - Sin gestión de tipos, contactos, familiares
  - Solo visualización de datos básicos
  - 271 líneas

#### API Simplificada
- **`src/services/personasApi.basic.ts`**
  - Service layer con solo 6 métodos
  - Sin endpoints V2
  - Documentación clara de lo que NO incluye
  - 115 líneas

### 2. Archivos Modificados

#### `src/pages/Personas/PersonasPage.tsx`
**Cambios:**
- Importa `PersonaFormBasic` en lugar de `PersonaFormV2`
- Importa `personasApiBasic` en lugar de `personasApi`
- Eliminado `useCatalogosPersonas` hook
- Filtros simplificados sin `includeTipos`, `includeContactos`, `includeRelaciones`
- Navega a `/personas/:id` en lugar de `/personas-v2/:id`
- Usa tipos `CreatePersonaBasicFormData`
- Título cambiado a "Gestión de Personas" (sin "V2")
- Pasa `catalogos={null}` a PersonasFilters

#### `src/App.tsx`
**Cambios:**
- Importa `PersonaDetallePageBasic` en lugar de `PersonaDetallePage`
- Eliminadas imports de páginas admin (TiposPersonaAdminPage, EspecialidadesDocenteAdminPage, TiposContactoAdminPage)
- Rutas simplificadas:
  - `/personas` → PersonasPage
  - `/personas/:id` → PersonaDetallePageBasic
- Eliminadas rutas de administración de catálogos

### 3. Archivos NO Modificados (Mantienen funcionalidad V2)

Los siguientes archivos V2 siguen existiendo pero ya NO se utilizan en la aplicación:

- `src/components/personas/v2/PersonaFormV2.tsx` (702 líneas) - Ya no se usa
- `src/pages/Personas/PersonaDetallePage.tsx` (328 líneas) - Ya no se usa
- `src/services/personasApi.ts` (452 líneas) - Ya no se usa
- `src/schemas/persona.schema.ts` (203 líneas) - Ya no se usa
- Componentes V2: TiposFormSection, ContactosFormSection, AsignarTipoModal, etc.

**Nota:** Estos archivos pueden ser eliminados en el futuro si se confirma que no se migrará a V2.

## Funcionalidad Removida

### ❌ Sistema de Múltiples Tipos
- Ya NO se pueden asignar/desasignar tipos a personas
- Ya NO hay validación de exclusión mutua SOCIO ↔ NO_SOCIO
- Ya NO hay campos dinámicos por tipo:
  - SOCIO: categoriaId
  - DOCENTE: especialidadId, honorariosPorHora
  - PROVEEDOR: cuit, razonSocial

### ❌ Gestión de Contactos
- Ya NO se pueden agregar contactos a personas
- Ya NO hay concepto de "contacto principal"
- Solo campos básicos: email y telefono en la persona

### ❌ Validaciones Avanzadas
- Ya NO hay validación asíncrona de DNI único
- Ya NO hay validación de email único
- Solo validaciones de formato

### ❌ Búsquedas Especializadas
- Ya NO hay endpoint `/api/personas/socios`
- Ya NO hay endpoint `/api/personas/docentes`
- Ya NO hay endpoint `/api/personas/proveedores`

### ❌ Estadísticas
- Ya NO hay endpoint `/api/personas/estadisticas/tipos`

### ❌ Administración de Catálogos
- Ya NO hay páginas admin para gestionar catálogos
- Ya NO se pueden crear/editar/eliminar:
  - Tipos de Persona
  - Especialidades Docentes
  - Tipos de Contacto

## Flujo de Trabajo Actual

### Crear Persona
1. Click en "Nueva Persona"
2. Llenar formulario básico:
   - Nombre *
   - Apellido *
   - DNI * (7-8 dígitos)
   - Email (opcional)
   - Teléfono (opcional)
   - Dirección (opcional)
   - Fecha de Nacimiento (opcional)
   - Observaciones (opcional)
3. Click en "Crear Persona"
4. Backend recibe POST a `/api/personas`

### Ver Detalle de Persona
1. Click en "Ver" en la tabla
2. Navega a `/personas/:id`
3. Muestra datos básicos agrupados en secciones:
   - Datos Personales
   - Datos de Contacto
   - Observaciones
   - Información del Sistema (createdAt, updatedAt)

### Editar Persona
1. Desde la página de detalle, click en "Editar"
2. Se abre modal con formulario prellenado
3. Modificar campos deseados
4. Click en "Guardar Cambios"
5. Backend recibe PUT a `/api/personas/:id`

### Eliminar Persona
1. Click en "Eliminar" (desde tabla o página de detalle)
2. Confirmar eliminación
3. Backend recibe DELETE a `/api/personas/:id`

## Testing

Para probar las funcionalidades:

```bash
# Iniciar backend (debe estar en puerto 8000)
cd ../SIGESDA-BACKEND
npm run dev

# Iniciar frontend (puerto 3003)
cd ../SIGESDA-FRONTEND
npm run dev
```

### Test Suite Manual

#### 1. Listar Personas (GET /api/personas)
- [ ] Abrir http://localhost:3003/personas
- [ ] Verificar que se carga la lista
- [ ] Verificar paginación funciona
- [ ] Verificar filtros básicos funcionan

#### 2. Crear Persona (POST /api/personas)
- [ ] Click "Nueva Persona"
- [ ] Llenar solo campos obligatorios (nombre, apellido, dni)
- [ ] Verificar validaciones de formato
- [ ] Crear persona
- [ ] Verificar mensaje de éxito
- [ ] Verificar aparece en la lista

#### 3. Ver Detalle (GET /api/personas/:id)
- [ ] Click "Ver" en cualquier persona
- [ ] Verificar se muestra toda la información
- [ ] Verificar no hay errores 404 en consola

#### 4. Editar Persona (PUT /api/personas/:id)
- [ ] Desde detalle, click "Editar"
- [ ] Modificar algún campo
- [ ] Guardar cambios
- [ ] Verificar mensaje de éxito
- [ ] Verificar cambios reflejados

#### 5. Eliminar Persona (DELETE /api/personas/:id)
- [ ] Click "Eliminar"
- [ ] Confirmar eliminación
- [ ] Verificar mensaje de éxito
- [ ] Verificar persona ya no aparece en lista

#### 6. Catálogo Tipos (GET /api/tipo-persona-catalogo)
- [ ] Abrir consola del navegador
- [ ] Verificar no hay errores relacionados a catálogos
- [ ] Si el endpoint existe, debería cargar sin errores

## Problemas Conocidos

### TypeScript Errors No Relacionados
El proyecto tiene errores de TypeScript en otros módulos no relacionados a Personas:
- MUI Grid deprecated props en otros componentes
- Errores en módulos de Recibos, Reservas, Categorías
- Estos NO afectan la funcionalidad del módulo Personas básico

### Dependencias Residuales
- Los hooks `usePersonas.ts` aún incluyen hooks V2 como:
  - `usePersonaTipos`
  - `usePersonaContactos`
  - `useEstadisticasTipos`
- Estos ya NO se usan pero quedan por si se necesita retrocompatibilidad

## Rollback Plan

Si necesitas volver a la versión V2:

1. En `src/App.tsx`:
   ```tsx
   import PersonaDetallePage from './pages/Personas/PersonaDetallePage';
   // ...
   <Route path="/personas/:id" element={<PersonaDetallePage />} />
   ```

2. En `src/pages/Personas/PersonasPage.tsx`:
   ```tsx
   import { PersonaFormV2 } from '../../components/personas/v2';
   import personasApi from '../../services/personasApi';
   // ... resto de cambios
   ```

3. Restaurar rutas admin en App.tsx

## Próximos Pasos Sugeridos

1. **Verificar con Backend Team:**
   - Confirmar que solo tienen 6 endpoints implementados
   - Verificar estructura exacta de DTOs esperados
   - Confirmar si hay planes de migrar a V2

2. **Limpieza de Código (Opcional):**
   - Eliminar archivos V2 si no se usarán
   - Eliminar hooks V2 no utilizados
   - Limpiar imports obsoletos

3. **Testing Exhaustivo:**
   - Ejecutar suite de tests manual
   - Verificar todas las operaciones CRUD
   - Confirmar respuestas del backend

4. **Documentar Backend:**
   - Actualizar GUIA_FRONTEND_PERSONA.md en backend
   - Agregar schemas de DTOs esperados
   - Documentar códigos de error posibles

## Contacto

Para dudas sobre esta migración, revisar:
- Este archivo: `MIGRATION_TO_BASIC_BACKEND.md`
- Schema básico: `src/schemas/persona.basic.schema.ts`
- API básica: `src/services/personasApi.basic.ts`
- Formulario básico: `src/components/personas/basic/PersonaFormBasic.tsx`
