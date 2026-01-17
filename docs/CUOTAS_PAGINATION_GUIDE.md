# Guía de Integración: Paginación y Exportación de Cuotas

## 📋 Resumen

Se ha implementado un sistema flexible de paginación y exportación para la gestión de cuotas, permitiendo:
- **Paginación tradicional** (10-100 registros por página)
- **Ver todas las cuotas** sin límite (usando `limit=all`)
- **Exportación a CSV** de todas las cuotas filtradas

---

## 🎯 Características Implementadas

### 1. Backend (Ya Implementado)

#### Endpoints Nuevos

**GET /api/cuotas/export**
- Exporta todas las cuotas que coincidan con los filtros
- Sin paginación
- Response incluye `exportedAt` timestamp

**GET /api/cuotas?limit=all**
- Obtiene todas las cuotas con filtros aplicados
- Usa el endpoint principal con parámetro especial
- Response incluye metadata extendida

#### Nueva Metadata en Responses

```typescript
{
  success: true,
  data: Cuota[],
  meta: {
    page: number,
    limit: number,
    total: number,
    totalRecords: number,      // Alias claro del total
    totalPages: number,
    recordsInPage: number,     // Cantidad en la página actual
    hasNextPage: boolean,      // Hay más páginas
    hasPreviousPage: boolean,  // Hay páginas anteriores
    isUnlimited: boolean       // Si está usando limit=all
  }
}
```

---

### 2. Frontend (Integración Completa)

#### Archivos Modificados

1. **`src/services/cuotasService.ts`**
   - Método `exportCuotas()` - Endpoint dedicado
   - Método `getAllCuotas()` - Usa `limit=all`

2. **`src/store/slices/cuotasSlice.ts`**
   - Thunk `exportCuotas` - Para exportación
   - Thunk `fetchAllCuotas` - Para cargar todas
   - Reducers para manejar estados de carga

3. **`src/pages/Cuotas/CuotasPage.tsx`**
   - Switch "Ver todas" - Alterna entre modos
   - Botón "Exportar CSV" - Descarga archivo
   - Handler `handleToggleShowAll()` - Lógica del switch
   - Handler `handleExportToCSV()` - Lógica de exportación
   - Función `convertToCSV()` - Conversión de datos

---

## 🚀 Uso en el Frontend

### Caso 1: Paginación Normal (Default)

```tsx
// Ya implementado en CuotasPage
const [filters, setFilters] = useState({
  page: 1,
  limit: 20
});

dispatch(fetchCuotas(filters));
```

**Resultado**: Muestra 20 cuotas por página con navegación de páginas

---

### Caso 2: Ver Todas las Cuotas

```tsx
// Usuario activa el switch "Ver todas"
const handleToggleShowAll = async (checked: boolean) => {
  if (checked) {
    const { page, limit, ...filtersWithoutPagination } = filters;
    await dispatch(fetchAllCuotas(filtersWithoutPagination));
  } else {
    dispatch(fetchCuotas(filters));
  }
};
```

**Resultado**: Carga las 351 cuotas sin paginación

---

### Caso 3: Exportar a CSV

```tsx
// Usuario hace clic en "Exportar CSV"
const handleExportToCSV = async () => {
  const { page, limit, ...filtersWithoutPagination } = filters;
  const result = await dispatch(exportCuotas(filtersWithoutPagination)).unwrap();

  // Convertir a CSV y descargar
  const csvContent = convertToCSV(result.data);
  // ... crear blob y descargar archivo
};
```

**Resultado**: Descarga archivo `cuotas_export_2026-01-16.csv` con todas las cuotas

---

## 📊 UI Components

### Switch "Ver Todas"

```tsx
<FormControlLabel
  control={
    <Switch
      checked={showAll}
      onChange={handleToggleShowAll}
      disabled={loading}
    />
  }
  label={`Ver todas (${pagination.total} cuotas)`}
/>
```

**Comportamiento**:
- **OFF**: Muestra paginación normal (10-20 registros)
- **ON**: Carga todas las cuotas, oculta paginación

---

### Botón "Exportar CSV"

```tsx
<Button
  variant="outlined"
  startIcon={exporting ? <CircularProgress size={20} /> : <GetApp />}
  onClick={handleExportToCSV}
  disabled={exporting || loading || cuotas.length === 0}
>
  Exportar CSV
</Button>
```

**Estados**:
- **Normal**: Listo para exportar
- **Cargando**: Muestra spinner
- **Deshabilitado**: No hay cuotas o está cargando

---

## 🔍 Filtros Aplicados

Tanto la exportación como "ver todas" respetan los filtros activos:

```typescript
// Ejemplo de filtros
{
  mes: 1,           // Enero
  anio: 2026,
  categoriaId: 4,   // Solo categoría ACTIVO
  soloImpagas: true // Solo pendientes
}

// Al exportar o ver todas, se aplican estos filtros
dispatch(exportCuotas({ mes: 1, anio: 2026, categoriaId: 4 }));
// Resultado: Solo cuotas de Enero 2026, categoría ACTIVO
```

---

## 🎨 Experiencia de Usuario

### Flujo 1: Navegación con Paginación

1. Usuario entra a página de Cuotas
2. Ve 20 cuotas por página (default)
3. Usa botones "Anterior/Siguiente" para navegar
4. Puede cambiar a 10, 20, 50 o 100 por página

### Flujo 2: Ver Todas las Cuotas

1. Usuario activa switch "Ver todas (351 cuotas)"
2. Sistema carga todas las cuotas (puede tardar 2-3 segundos)
3. Navegación de páginas se oculta
4. Puede desplazarse por toda la lista
5. Al desactivar switch, vuelve a paginación

### Flujo 3: Exportación

1. Usuario aplica filtros (mes, año, categoría)
2. Hace clic en "Exportar CSV"
3. Botón muestra spinner durante descarga
4. Archivo CSV se descarga automáticamente
5. Snackbar confirma "X cuotas exportadas exitosamente"

---

## 🧪 Testing

### Test 1: Paginación Normal
```bash
# En la UI
1. Ir a página Cuotas
2. Verificar que se muestran 20 cuotas
3. Hacer clic en "Siguiente"
4. Verificar que cambia a página 2
```

### Test 2: Ver Todas
```bash
1. Activar switch "Ver todas"
2. Esperar carga
3. Verificar que se muestran las 351 cuotas
4. Desactivar switch
5. Verificar que vuelve a paginación normal
```

### Test 3: Exportación con Filtros
```bash
1. Seleccionar "Mes: Enero, Año: 2026"
2. Hacer clic en "Exportar CSV"
3. Verificar descarga de archivo
4. Abrir CSV y verificar que contiene 92 registros (Enero 2026)
```

---

## ⚠️ Consideraciones de Performance

### Modo "Ver Todas"

**Pros**:
- Usuario ve todo de una vez
- Fácil búsqueda visual
- Ctrl+F funciona en toda la lista

**Contras**:
- Carga inicial de 2-3 segundos para 351 registros
- Uso de memoria del browser aumenta
- Render inicial más lento

**Recomendación**: Usar filtros antes de activar "Ver todas"

---

### Exportación

**Performance**:
- Petición al backend: ~1-2 segundos para 351 registros
- Conversión a CSV: ~100ms
- Descarga: Instantánea

**Optimización**:
- Se usa el endpoint `/export` (más rápido que `?limit=all`)
- No se guardan datos en Redux (solo se descargan)
- Compresión gzip en respuesta HTTP

---

## 📝 Formato del CSV Exportado

```csv
"ID","Mes","Año","Categoría","Monto Base","Monto Actividades","Monto Total","Estado","Persona"
"383","1","2026","ACTIVO","5000","0","5000","PENDIENTE","Juan Pérez"
"382","1","2026","ESTUDIANTE","3000","500","3500","PAGADO","María González"
...
```

**Columnas incluidas**:
- ID de cuota
- Mes y Año
- Categoría del socio
- Desglose de montos
- Estado del recibo
- Nombre completo del socio

---

## 🐛 Troubleshooting

### Problema: "Ver todas" tarda mucho

**Solución**:
1. Aplicar filtros antes (mes, año, categoría)
2. Verificar conexión a internet
3. Check backend logs para errores de query

### Problema: Exportación falla

**Causas comunes**:
- Timeout del servidor (>60 segundos)
- Memoria insuficiente en el browser
- Bloqueador de pop-ups activo

**Solución**:
1. Aplicar filtros para reducir dataset
2. Intentar en incognito (sin extensiones)
3. Verificar console del browser

### Problema: CSV mal formateado

**Causas**:
- Datos con comas o comillas
- Encoding incorrecto

**Solución**:
- Ya implementado: Escapado de comillas con `"${cell}"`
- Encoding UTF-8 con BOM en el blob

---

## 🔮 Futuras Mejoras

1. **Exportación a Excel** (.xlsx)
   - Usar librería `xlsx` o `exceljs`
   - Incluir estilos y fórmulas

2. **Exportación con gráficos**
   - Agregar sheet de estadísticas
   - Incluir gráficos de MUI Charts

3. **Paginación virtual** (Virtualization)
   - Usar `react-window` o `react-virtualized`
   - Renderizar solo filas visibles
   - Soportar miles de registros sin lag

4. **Búsqueda en tiempo real**
   - Agregar campo de búsqueda
   - Filtrar lista localmente
   - Highlight de resultados

5. **Guardado de vistas**
   - Guardar combinaciones de filtros
   - Restaurar filtros al volver
   - Compartir vistas entre usuarios

---

## 📚 Referencias

- [Backend API Documentation](../SIGESDA-BACKEND/CLAUDE.md#enhanced-2026-01-16-cuotas-pagination--export-system)
- [Redux Toolkit Async Thunks](https://redux-toolkit.js.org/api/createAsyncThunk)
- [Material-UI Table Pagination](https://mui.com/material-ui/react-table/#pagination)
- [CSV Export Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Blob)

---

## 💡 Ejemplos de Código Adicionales

### Exportar con formato personalizado

```typescript
const exportCustomFormat = async () => {
  const result = await dispatch(exportCuotas(filters)).unwrap();

  // Formato personalizado
  const csvContent = result.data.map(c => ({
    'Nro Socio': c.recibo?.receptor?.numeroSocio,
    'Apellido y Nombre': `${c.recibo?.receptor?.apellido}, ${c.recibo?.receptor?.nombre}`,
    'Período': `${c.mes}/${c.anio}`,
    'Monto': `$${c.montoTotal}`,
    'Estado': c.recibo?.estado
  }));

  // Usar librería CSV o conversión manual
  downloadCSV(csvContent, 'cuotas_custom.csv');
};
```

### Cargar todas con loading indicator

```typescript
const [loadingAll, setLoadingAll] = useState(false);

const handleLoadAll = async () => {
  setLoadingAll(true);
  try {
    await dispatch(fetchAllCuotas(filters)).unwrap();
    setSnackbar({
      message: `${pagination.total} cuotas cargadas`,
      severity: 'success'
    });
  } catch (error) {
    setSnackbar({
      message: 'Error al cargar cuotas',
      severity: 'error'
    });
  } finally {
    setLoadingAll(false);
  }
};
```

---

✅ **Integración Completa**: Backend + Frontend + Documentación
