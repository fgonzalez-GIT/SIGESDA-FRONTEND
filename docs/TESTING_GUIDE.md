# 🧪 Guía de Testing: Paginación y Exportación de Cuotas

## ✅ Estado de los Servidores

### Backend
- **URL**: http://localhost:8000
- **Estado**: ✅ CORRIENDO
- **API Cuotas**: http://localhost:8000/api/cuotas
- **Health Check**: `curl http://localhost:8000/health`

### Frontend
- **URL**: http://localhost:3004
- **Estado**: ✅ CORRIENDO
- **Framework**: React 18 + Vite
- **Page URL**: http://localhost:3004/cuotas

---

## 🎯 Plan de Testing

### Test Suite 1: Verificación de Backend
### Test Suite 2: Paginación Normal
### Test Suite 3: Switch "Ver Todas"
### Test Suite 4: Exportación CSV
### Test Suite 5: Filtros Combinados

---

## 📊 Test Suite 1: Verificación de Backend

### Test 1.1: Endpoint Principal con Paginación

```bash
# Test con paginación por defecto (limit=10)
curl -s "http://localhost:8000/api/cuotas" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'''
✓ Success: {d['success']}
✓ Total en BD: {d['meta']['total']}
✓ En esta página: {d['meta']['recordsInPage']}
✓ Página actual: {d['meta']['page']}
✓ Total páginas: {d['meta']['totalPages']}
✓ Tiene siguiente: {d['meta']['hasNextPage']}
✓ Tiene anterior: {d['meta']['hasPreviousPage']}
''')
"
```

**Resultado esperado**:
```
✓ Success: True
✓ Total en BD: 351
✓ En esta página: 10
✓ Página actual: 1
✓ Total páginas: 36
✓ Tiene siguiente: True
✓ Tiene anterior: False
```

---

### Test 1.2: Endpoint con limit=all

```bash
curl -s "http://localhost:8000/api/cuotas?limit=all" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'''
✓ Success: {d['success']}
✓ Total en BD: {d['meta']['total']}
✓ En respuesta: {d['meta']['recordsInPage']}
✓ Is Unlimited: {d['meta']['isUnlimited']}
✓ Primeros 3 IDs: {[c['id'] for c in d['data'][:3]]}
''')
"
```

**Resultado esperado**:
```
✓ Success: True
✓ Total en BD: 351
✓ En respuesta: 351
✓ Is Unlimited: True
✓ Primeros 3 IDs: [383, 382, 381]
```

---

### Test 1.3: Endpoint de Exportación

```bash
curl -s "http://localhost:8000/api/cuotas/export" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'''
✓ Success: {d['success']}
✓ Message: {d['message']}
✓ Total exportado: {d['meta']['total']}
✓ Exported at: {d['meta']['exportedAt']}
''')
"
```

**Resultado esperado**:
```
✓ Success: True
✓ Message: Cuotas exportadas exitosamente
✓ Total exportado: 351
✓ Exported at: 2026-01-16T...
```

---

### Test 1.4: Filtros con limit=all

```bash
curl -s "http://localhost:8000/api/cuotas?mes=1&anio=2026&limit=all" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'''
✓ Success: {d['success']}
✓ Total filtrado: {d['meta']['total']}
✓ Primera cuota: mes={d['data'][0]['mes']}, anio={d['data'][0]['anio']}
''')
"
```

**Resultado esperado**:
```
✓ Success: True
✓ Total filtrado: 92
✓ Primera cuota: mes=1, anio=2026
```

---

## 🖥️ Test Suite 2: Paginación Normal en UI

### Paso 1: Abrir la aplicación

```bash
# Abrir en tu navegador:
open http://localhost:3004/cuotas

# O si prefieres Chrome en modo desarrollo:
google-chrome --new-window http://localhost:3004/cuotas
```

### Paso 2: Verificar estado inicial

**Qué ver**:
- [ ] Título: "Gestión de Cuotas"
- [ ] Botones en la parte superior: "Ver todas", "Exportar CSV", "Generar Cuotas"
- [ ] Tabla con cuotas (20 por defecto)
- [ ] Paginación en la parte inferior
- [ ] Filtros: Mes, Año, Categoría

**Screenshot esperado**:
```
┌─────────────────────────────────────────────────────────────┐
│ Gestión de Cuotas                                          │
│                                                             │
│ [☐ Ver todas (351 cuotas)] [Exportar CSV] [Generar Cuotas]│
├─────────────────────────────────────────────────────────────┤
│ Filtros: [Mes ▼] [Año ▼] [Categoría ▼]                     │
├─────────────────────────────────────────────────────────────┤
│ ID  │ Mes │ Año  │ Categoría │ Monto   │ Estado           │
├─────┼─────┼──────┼───────────┼─────────┼──────────────────┤
│ 383 │  1  │ 2026 │ ACTIVO    │ $5,000  │ PENDIENTE       │
│ 382 │  1  │ 2026 │ ESTUDIANTE│ $3,500  │ PAGADO          │
│ ... │ ... │ ...  │ ...       │ ...     │ ...             │
├─────────────────────────────────────────────────────────────┤
│                      ← 1-20 de 351 →                        │
└─────────────────────────────────────────────────────────────┘
```

### Paso 3: Probar navegación de páginas

**Acciones**:
1. Hacer clic en botón "Siguiente" (→)
2. Verificar que cambia a página 2
3. Verificar que muestra registros 21-40
4. Hacer clic en "Anterior" (←)
5. Verificar que vuelve a página 1

**Resultado esperado**:
- ✅ Navegación fluida
- ✅ Datos cambian al cambiar página
- ✅ Indicador de página actualizado

### Paso 4: Cambiar filas por página

**Acciones**:
1. En el dropdown "Filas por página", seleccionar "50"
2. Verificar que ahora muestra 50 cuotas
3. Verificar que el total de páginas cambió (351 / 50 = 8 páginas)

**Resultado esperado**:
- ✅ Muestra 50 registros
- ✅ Total de páginas: 8
- ✅ Indicador: "1-50 de 351"

---

## 🔄 Test Suite 3: Switch "Ver Todas"

### Paso 1: Activar switch "Ver todas"

**Acciones**:
1. Localizar el switch en la parte superior: "☐ Ver todas (351 cuotas)"
2. Hacer clic en el switch para activarlo
3. Esperar 2-3 segundos (loading)

**Qué observar durante la carga**:
- ✅ Loading spinner visible
- ✅ Botones deshabilitados
- ✅ Tabla con skeleton loader (opcional)

### Paso 2: Verificar resultado

**Después de cargar**:
- [ ] Switch activado: "☑ Ver todas (351 cuotas)"
- [ ] Controles de paginación OCULTOS (no hay páginas)
- [ ] Todas las 351 cuotas visibles en la tabla
- [ ] Scroll vertical habilitado
- [ ] Mensaje en la parte inferior: "Mostrando 351 de 351 cuotas"

**Screenshot esperado**:
```
┌─────────────────────────────────────────────────────────────┐
│ [☑ Ver todas (351 cuotas)] [Exportar CSV] [Generar Cuotas]│
├─────────────────────────────────────────────────────────────┤
│ ID  │ Mes │ Año  │ Categoría │ Monto   │ Estado           │
├─────┼─────┼──────┼───────────┼─────────┼──────────────────┤
│ 383 │  1  │ 2026 │ ACTIVO    │ $5,000  │ PENDIENTE       │
│ 382 │  1  │ 2026 │ ESTUDIANTE│ $3,500  │ PAGADO          │
│ 381 │  2  │ 2026 │ FAMILIAR  │ $3,000  │ PENDIENTE       │
│ ... (348 más registros) ...                                │
├─────────────────────────────────────────────────────────────┤
│              Mostrando 351 de 351 cuotas                    │
└─────────────────────────────────────────────────────────────┘
```

### Paso 3: Buscar con Ctrl+F

**Acciones**:
1. Presionar `Ctrl+F` (o `Cmd+F` en Mac)
2. Buscar "ACTIVO"
3. Verificar que el navegador encuentra todas las ocurrencias en la tabla

**Resultado esperado**:
- ✅ Buscar funciona en toda la lista (no solo en página actual)
- ✅ Múltiples coincidencias encontradas
- ✅ Navegación entre coincidencias funciona

### Paso 4: Desactivar switch

**Acciones**:
1. Hacer clic nuevamente en el switch para desactivarlo
2. Verificar que vuelve a paginación normal

**Resultado esperado**:
- ✅ Vuelve a mostrar 20 cuotas por página
- ✅ Controles de paginación reaparecen
- ✅ Se mantiene en página 1

---

## 📥 Test Suite 4: Exportación CSV

### Paso 1: Exportar sin filtros

**Acciones**:
1. Asegurarse de que NO hay filtros aplicados
2. Hacer clic en botón "Exportar CSV"
3. Observar loading spinner en el botón
4. Esperar descarga automática

**Resultado esperado**:
- ✅ Archivo descargado: `cuotas_export_2026-01-16.csv`
- ✅ Snackbar de éxito: "351 cuotas exportadas exitosamente"
- ✅ Archivo contiene 351 registros + 1 header
- ✅ Botón vuelve a estado normal

### Paso 2: Verificar contenido del CSV

**Abrir el archivo CSV en Excel/LibreOffice**:

```csv
"ID","Mes","Año","Categoría","Monto Base","Monto Actividades","Monto Total","Estado","Persona"
"383","1","2026","ACTIVO","5000","0","5000","PENDIENTE","Juan Pérez"
"382","1","2026","ESTUDIANTE","3000","500","3500","PAGADO","María González"
...
```

**Verificar**:
- [ ] Header con 9 columnas
- [ ] 351 filas de datos (+ 1 header = 352 total)
- [ ] Datos correctamente formateados
- [ ] No hay comillas escapadas incorrectamente
- [ ] Nombres completos de personas presentes

### Paso 3: Exportar con filtros

**Acciones**:
1. Aplicar filtros:
   - Mes: Enero
   - Año: 2026
2. Hacer clic en "Exportar CSV"
3. Verificar descarga

**Resultado esperado**:
- ✅ Archivo descargado con nombre similar
- ✅ Snackbar: "92 cuotas exportadas exitosamente"
- ✅ Archivo contiene solo 92 registros (Enero 2026)
- ✅ Todas las cuotas son del mes 1 y año 2026

### Paso 4: Abrir CSV en diferentes aplicaciones

**Excel**:
```bash
# En Windows
start cuotas_export_2026-01-16.csv

# En Mac
open cuotas_export_2026-01-16.csv
```

**Google Sheets**:
1. Ir a https://sheets.google.com
2. Archivo → Importar → Subir
3. Seleccionar el CSV descargado

**Verificar**:
- [ ] Se importa correctamente
- [ ] Columnas alineadas
- [ ] Acentos y ñ se ven correctamente (UTF-8)
- [ ] Números formateados como números

---

## 🔍 Test Suite 5: Filtros Combinados

### Test 5.1: Filtro por Mes + Ver Todas

**Acciones**:
1. Seleccionar "Mes: Enero"
2. Activar switch "Ver todas"
3. Verificar cantidad mostrada

**Resultado esperado**:
- ✅ Muestra 92 cuotas (solo Enero)
- ✅ Switch indica: "Ver todas (92 cuotas)"
- ✅ Todas visibles sin paginación

### Test 5.2: Filtro por Categoría + Exportar

**Acciones**:
1. Seleccionar "Categoría: ACTIVO"
2. Hacer clic en "Exportar CSV"
3. Verificar archivo

**Resultado esperado**:
- ✅ Solo cuotas de categoría ACTIVO
- ✅ Snackbar con cantidad correcta
- ✅ CSV contiene solo esa categoría

### Test 5.3: Múltiples Filtros

**Acciones**:
1. Aplicar:
   - Mes: Febrero
   - Año: 2026
   - Categoría: ESTUDIANTE
2. Activar "Ver todas"
3. Exportar CSV

**Resultado esperado**:
- ✅ Conjunto filtrado de cuotas
- ✅ Todos los filtros aplicados correctamente
- ✅ Exportación refleja los filtros

---

## ⚡ Test Suite 6: Performance

### Test 6.1: Tiempo de carga "Ver Todas"

**Medir**:
1. Abrir DevTools (F12)
2. Ir a tab Network
3. Activar "Ver todas"
4. Observar request `/api/cuotas?limit=all`

**Resultados esperados**:
- Request time: ~1-2 segundos para 351 registros
- Response size: ~200-300 KB (comprimido con gzip)
- Time to Interactive: < 3 segundos

### Test 6.2: Scroll Performance

**Acciones**:
1. Con "Ver todas" activado (351 cuotas)
2. Hacer scroll rápido hacia abajo
3. Observar fluidez

**Resultado esperado**:
- ✅ Scroll fluido (60 FPS)
- ✅ Sin lag visible
- ✅ Todas las filas se renderizan correctamente

---

## 🐛 Debugging

### Si "Ver Todas" no carga

**Check 1: Console de DevTools**
```javascript
// Abrir Console (F12)
// Buscar errores en rojo

// Verificar state de Redux:
console.log(store.getState().cuotas)
```

**Check 2: Network Tab**
```
1. Abrir Network tab (F12)
2. Activar "Ver todas"
3. Buscar request a: /api/cuotas?limit=all
4. Verificar:
   - Status: 200 OK
   - Response tiene 351 items
   - Time: < 3 segundos
```

### Si Exportación falla

**Check 1: Verificar endpoint en backend**
```bash
curl -i "http://localhost:8000/api/cuotas/export"
# Debe retornar 200 OK
```

**Check 2: Verificar CORS**
```bash
curl -i -H "Origin: http://localhost:3004" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS "http://localhost:8000/api/cuotas/export"
```

### Si CSV tiene formato incorrecto

**Check 1: Encoding**
- Verificar que el archivo se descargó con UTF-8
- Abrir con editor de texto (VS Code, Sublime)
- Buscar caracteres extraños

**Check 2: Re-descargar**
- Limpiar caché del navegador
- Intentar de nuevo

---

## 📋 Checklist Final

### Backend
- [x] Server running en http://localhost:8000
- [x] GET /api/cuotas funciona
- [x] GET /api/cuotas?limit=all funciona
- [x] GET /api/cuotas/export funciona
- [x] Filtros funcionan correctamente

### Frontend
- [x] Server running en http://localhost:3004
- [ ] Página de cuotas carga correctamente
- [ ] Paginación normal funciona
- [ ] Switch "Ver todas" funciona
- [ ] Botón "Exportar CSV" funciona
- [ ] CSV se descarga correctamente
- [ ] Filtros se aplican correctamente

### Integración
- [ ] Frontend se conecta al backend
- [ ] No hay errores CORS
- [ ] Metadata de paginación se muestra correctamente
- [ ] Loading states funcionan
- [ ] Error handling funciona

---

## 🎉 Resultado Esperado

Si todos los tests pasan, deberías ver:

1. **Paginación normal**: Navegación fluida entre páginas
2. **Ver todas**: Carga de 351 cuotas en ~2 segundos
3. **Exportación**: Descarga de CSV con todas las cuotas
4. **Filtros**: Aplicación correcta en todos los modos
5. **Performance**: Experiencia fluida y rápida

---

## 📞 Soporte

Si encuentras algún problema:

1. **Revisar logs del backend**: `/tmp/server.log`
2. **Revisar logs del frontend**: `/tmp/frontend.log`
3. **Revisar console del navegador**: F12 → Console
4. **Verificar network requests**: F12 → Network

---

✅ **Happy Testing!** 🚀
