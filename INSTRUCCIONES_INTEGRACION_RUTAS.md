# Instrucciones de Integración de Rutas - Actividades V2

## 📋 Archivos Creados

Todas las vistas de Actividades V2 están listas en:
- `src/pages/Actividades/ActividadesV2Page.tsx` - Listado principal
- `src/pages/Actividades/ActividadDetalleV2Page.tsx` - Vista de detalle
- `src/pages/Actividades/ActividadFormV2Page.tsx` - Formulario crear/editar

## 🔗 Configuración de Rutas

### Opción 1: Actualizar el archivo de rutas existente

Si ya tienes un archivo de rutas (probablemente en `src/App.tsx` o similar), agrega estas rutas:

```tsx
import { Routes, Route } from 'react-router-dom';
import ActividadesV2Page from './pages/Actividades/ActividadesV2Page';
import ActividadDetalleV2Page from './pages/Actividades/ActividadDetalleV2Page';
import ActividadFormV2Page from './pages/Actividades/ActividadFormV2Page';

// Dentro de tu componente de rutas:
<Routes>
  {/* Otras rutas existentes */}

  {/* Rutas de Actividades V2 */}
  <Route path="/actividades" element={<ActividadesV2Page />} />
  <Route path="/actividades/:id" element={<ActividadDetalleV2Page />} />
  <Route path="/actividades/nueva" element={<ActividadFormV2Page />} />
  <Route path="/actividades/:id/editar" element={<ActividadFormV2Page />} />
</Routes>
```

### Opción 2: Crear archivo de rutas dedicado

Crea `src/routes/actividadesRoutes.tsx`:

```tsx
import { Route } from 'react-router-dom';
import ActividadesV2Page from '../pages/Actividades/ActividadesV2Page';
import ActividadDetalleV2Page from '../pages/Actividades/ActividadDetalleV2Page';
import ActividadFormV2Page from '../pages/Actividades/ActividadFormV2Page';

export const actividadesRoutes = (
  <>
    <Route path="/actividades" element={<ActividadesV2Page />} />
    <Route path="/actividades/:id" element={<ActividadDetalleV2Page />} />
    <Route path="/actividades/nueva" element={<ActividadFormV2Page />} />
    <Route path="/actividades/:id/editar" element={<ActividadFormV2Page />} />
  </>
);
```

Luego importa en tu App.tsx:

```tsx
import { actividadesRoutes } from './routes/actividadesRoutes';

// En tu componente:
<Routes>
  {actividadesRoutes}
  {/* otras rutas */}
</Routes>
```

## 🎨 Configuración del Layout

### 1. Asegúrate de tener el Provider de Catálogos

En tu `App.tsx` o componente principal:

```tsx
import React, { createContext } from 'react';
import { useCatalogos } from './hooks/useActividadesV2';
import { CatalogosCompletos } from './types/actividadV2.types';

export const CatalogosContext = createContext<CatalogosCompletos | null>(null);

function App() {
  const { catalogos, loading } = useCatalogos();

  if (loading) {
    return <div>Cargando sistema...</div>;
  }

  return (
    <CatalogosContext.Provider value={catalogos}>
      <Router>
        <Routes>
          {/* tus rutas aquí */}
        </Routes>
      </Router>
    </CatalogosContext.Provider>
  );
}
```

### 2. Actualiza el menú de navegación

Agrega un enlace a Actividades en tu menú lateral o navbar:

```tsx
import { Link } from 'react-router-dom';
import { Event as EventIcon } from '@mui/icons-material';

<Link to="/actividades">
  <EventIcon /> Actividades
</Link>
```

## ⚙️ Variables de Entorno

Asegúrate de tener configurado en tu `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

## 🧪 Pruebas de Integración

### 1. Prueba la navegación básica:

```bash
# Asegúrate de que el backend esté corriendo
# Luego inicia el frontend
npm run dev
```

Navega a: `http://localhost:5173/actividades`

### 2. Verifica que los catálogos carguen:

Abre la consola del navegador y verifica que no haya errores 404 al cargar:
- GET `/api/actividades/catalogos/todos`

### 3. Prueba el flujo completo:

1. ✅ Ver listado de actividades
2. ✅ Aplicar filtros
3. ✅ Ver detalle de una actividad
4. ✅ Crear nueva actividad
5. ✅ Editar actividad existente
6. ✅ Eliminar actividad

## 🐛 Solución de Problemas

### Error: "Cannot read property 'tipos' of null"

**Causa**: Los catálogos no se cargaron correctamente.

**Solución**:
1. Verifica que el backend esté corriendo
2. Verifica la URL en `.env`
3. Revisa la consola para errores de CORS

### Error: "404 Not Found" en rutas

**Causa**: Las rutas no están configuradas correctamente.

**Solución**:
1. Verifica que las rutas estén dentro de `<Routes>`
2. Asegúrate de usar `exact` si es necesario
3. Verifica el orden de las rutas (más específicas primero)

### Error: "Unexpected token <" en JSON

**Causa**: El backend está devolviendo HTML en lugar de JSON (probablemente un error 404).

**Solución**:
1. Verifica que el endpoint exista en el backend
2. Revisa la URL base en la configuración de axios
3. Verifica que el backend esté corriendo en el puerto correcto

## 📝 Checklist de Integración

- [ ] Catálogos se cargan al inicio de la aplicación
- [ ] Rutas configuradas en el router
- [ ] Menú de navegación actualizado con link a Actividades
- [ ] Variables de entorno configuradas
- [ ] Backend corriendo y accesible
- [ ] Prueba de navegación completa realizada
- [ ] Sin errores en consola del navegador
- [ ] Sin errores de TypeScript en compilación

## 🎯 Próximos Pasos Opcionales

1. **Agregar breadcrumbs** para mejor navegación
2. **Implementar búsqueda avanzada** con autocompletado
3. **Agregar exportación** a PDF/Excel
4. **Implementar vista de calendario** para horarios
5. **Agregar notificaciones** con toast/snackbar
6. **Implementar permisos** por rol de usuario

## 📞 Soporte

Si encuentras problemas durante la integración:

1. Revisa esta guía completa
2. Consulta `GUIA_INTEGRACION_ACTIVIDADES_V2.md`
3. Revisa los ejemplos en `ActividadesV2Page.example.tsx`
4. Verifica la documentación del backend en `/docs/API_ACTIVIDADES_V2.md`

---

**Última actualización**: 2025-10-16
**Versión**: 1.0
