# Guía de Testing Manual: Sistema de Cuotas y Recibos - SIGESDA

**Versión:** 1.0
**Fecha:** 2026-01-18
**Autor:** Sistema SIGESDA
**Audiencia:** QA Testers, Usuarios Finales, Desarrolladores (Testing Manual)

---

## Información General

### Propósito de esta Guía

Esta guía proporciona casos de prueba paso a paso para validar el funcionamiento completo del sistema de Cuotas y Recibos de SIGESDA, cubriendo desde la generación masiva de cuotas hasta el pago y cancelación de recibos.

### Alcance

- ✅ Generación masiva de cuotas
- ✅ Gestión individual de cuotas (ver detalle, recalcular, agregar ítems)
- ✅ Ajustes y exenciones
- ✅ Filtros, paginación y exportación
- ✅ Generación de recibos desde cuotas
- ✅ Pago y anulación de recibos
- ✅ Reportes y dashboard

### Documentos Relacionados

- `TESTING_GUIDE.md` - Testing de paginación y exportación
- `E2E_TESTING_GUIDE.md` - Tests automatizados con Playwright
- `GUIA_FRONTEND_CUOTAS_SISTEMA_COMPLETO.md` - Documentación técnica completa

---

## 1. PRE-REQUISITOS Y CONFIGURACIÓN

### 1.1 Verificación del Ambiente

Antes de comenzar, verificar que el sistema esté correctamente configurado:

**Backend:**
```bash
# Verificar que el backend está corriendo
curl http://localhost:8000/health
# Respuesta esperada: {"status":"ok","timestamp":"..."}
```

**Frontend:**
- URL: `http://localhost:3003`
- Estado: Debe mostrar página de login

**Base de Datos:**
- Debe estar ejecutado el seed con datos de prueba
- Verificar que existen socios, categorías y actividades

### 1.2 Datos de Prueba Necesarios

**Mínimo requerido:**
- ✅ 10+ socios activos
- ✅ 3+ categorías de socios (ACTIVO, ESTUDIANTE, JUBILADO)
- ✅ 2+ actividades registradas (opcional, para cuotas con actividades)
- ✅ Período de prueba definido: Ejemplo Enero 2026

**Verificación:**
1. Ir a Personas → Gestión de Personas
2. Verificar que hay socios con categoría asignada
3. Ir a Actividades → Verificar actividades disponibles

### 1.3 Login y Navegación Inicial

**Paso 1:** Abrir navegador en `http://localhost:3003`

**Paso 2:** Hacer login
- Usuario: `admin@sigesda.com` (o el que corresponda)
- Password: `admin123` (o el que corresponda)

**Paso 3:** Verificar acceso al módulo "Cuotas"
- En el sidebar izquierdo debe aparecer el menú "Cuotas"
- Submenu: "Gestión de Cuotas", "Reportes", etc.

**Resultado esperado:**
- ✅ Login exitoso
- ✅ Dashboard principal visible
- ✅ Sidebar con módulo "Cuotas" accesible

---

## 2. GENERACIÓN DE CUOTAS

### Test Case 2.1: Generación Masiva de Cuotas (Happy Path)

**ID:** TC-CUO-001
**Prioridad:** Alta
**Objetivo:** Generar cuotas para todos los socios de una categoría específica

**Pre-condición:**
- No existen cuotas para el período a generar (Enero 2026)
- Hay al menos 10 socios activos con categoría asignada

**Pasos:**

1. Ir a **Cuotas → Gestión de Cuotas**

2. Hacer clic en botón **"Generar Cuotas"** (botón azul en esquina superior derecha)

3. En el modal "Generación Masiva de Cuotas", llenar:
   - **Mes:** Enero
   - **Año:** 2026
   - **Categoría:** Dejar en blanco para "Todas" o seleccionar una específica
   - **Aplicar descuentos:** ✅ SÍ
   - **Aplicar recargos:** ✅ SÍ
   - **Incluir inactivos:** ❌ NO

4. Hacer clic en **"Validar"** (primer paso del wizard)

5. **Verificar resultado de validación:**
   - Mensaje: "X socios cumplen criterios"
   - Lista de socios que recibirán cuotas
   - Monto estimado total

6. Hacer clic en **"Siguiente"** (pasar al paso 2)

7. Revisar configuración y hacer clic en **"Generar"**

8. **Esperar procesamiento:**
   - Spinner de loading visible
   - Mensaje de progreso (si aplica)

9. **Verificar resultado exitoso:**
   - Mensaje de éxito: "X cuotas generadas exitosamente"
   - Modal se cierra automáticamente
   - Tabla de cuotas se actualiza

**Resultado esperado:**

- ✅ Todas las cuotas aparecen en la tabla
- ✅ Estado de cada cuota: **PENDIENTE**
- ✅ Monto total calculado correctamente según categoría
- ✅ Si hay descuentos aplicables, se reflejan en el monto
- ✅ Número de recibo generado automáticamente para cada cuota
- ✅ Fecha de generación es la actual

**Verificaciones adicionales:**

- [ ] Dashboard actualiza KPIs (Total Pendiente aumenta)
- [ ] Filtro por mes/año muestra las nuevas cuotas
- [ ] Al abrir detalle de una cuota, el desglose muestra ítems correctos

**Evidencia:** Screenshot de la tabla con cuotas generadas

---

### Test Case 2.2: Validación - Cuotas Duplicadas

**ID:** TC-CUO-002
**Prioridad:** Alta
**Objetivo:** Verificar que no se pueden generar cuotas duplicadas para el mismo período

**Pre-condición:**
- Ya existen cuotas generadas para Enero 2026

**Pasos:**

1. Ir a **Cuotas → Gestión de Cuotas**
2. Hacer clic en **"Generar Cuotas"**
3. Seleccionar **Mes: Enero, Año: 2026**
4. Hacer clic en **"Validar"**

**Resultado esperado:**

- ✅ Validación muestra warning: "Ya existen X cuotas para este período"
- ✅ Botón "Generar" deshabilitado o muestra opción "Regenerar"
- ✅ Lista de conflictos visible (socios que ya tienen cuota)

**Opciones disponibles:**
- **Regenerar:** Elimina cuotas existentes y genera nuevas (requiere confirmación)
- **Cancelar:** Cierra modal sin cambios

**Evidencia:** Screenshot del mensaje de validación

---

### Test Case 2.3: Generación con Filtro por Categoría

**ID:** TC-CUO-003
**Prioridad:** Media
**Objetivo:** Generar cuotas solo para socios de categoría ESTUDIANTE

**Pasos:**

1. Abrir modal "Generar Cuotas"
2. Seleccionar:
   - **Mes:** Febrero
   - **Año:** 2026
   - **Categoría:** ESTUDIANTE (seleccionar específicamente)
3. Validar y generar

**Resultado esperado:**

- ✅ Solo se generan cuotas para socios con categoría ESTUDIANTE
- ✅ En la tabla, todas las cuotas tienen categoría "Estudiante"
- ✅ Socios de otras categorías NO tienen cuota para Febrero 2026

**Verificación:**
- [ ] Aplicar filtro "Categoría: Estudiante" → Debe mostrar todas las cuotas generadas
- [ ] Aplicar filtro "Categoría: Activo" → NO debe mostrar cuotas de Febrero 2026

---

## 3. GESTIÓN DE CUOTAS

### Test Case 3.1: Ver Detalle de Cuota (V2 con Desglose de Ítems)

**ID:** TC-CUO-004
**Prioridad:** Alta
**Objetivo:** Verificar vista detallada con desglose por categoría de ítem

**Pre-condición:**
- Existe al menos una cuota generada

**Pasos:**

1. En la tabla de cuotas, localizar una cuota
2. Hacer clic en el botón **"Ver"** (icono de ojo)
3. Esperar que el modal "Detalle de Cuota #XXXX" se abra

**Verificaciones en el modal:**

**Header:**
- [ ] Título: "Detalle de Cuota #[número]"
- [ ] Información de socio visible (nombre, categoría)
- [ ] Período: Mes/Año

**Tabs:**
- [ ] Tab "Desglose" visible y seleccionado por defecto
- [ ] Tab "Historial" visible

**Sección "Desglose V2":**

- [ ] **Cuota Base:** Muestra 1 ítem con monto de la categoría
  - Tipo: "Cuota Base Socio"
  - Monto unitario
  - Cantidad: 1
  - Tag "Auto" (azul) indica que es automático

- [ ] **Actividades:** Muestra ítems por cada actividad inscrita (si aplica)
  - Nombre de actividad
  - Monto por actividad
  - Tag "Auto"

- [ ] **Descuentos y Beneficios:** Muestra descuentos aplicados (si hay)
  - Tipo de descuento
  - Porcentaje (si aplica)
  - Monto (negativo)

- [ ] **Recargos:** Muestra recargos aplicados (si hay)
  - Tipo de recargo
  - Monto (positivo)

- [ ] **Otros Conceptos:** Ítems manuales agregados (si hay)

**Footer del Desglose:**
- [ ] **Total a Pagar:** Suma correcta de todos los ítems
  - Formato: $X,XXX.XX
  - Fondo azul destacado

**Botones de Acción:**
- [ ] Botón **"Recalcular"** visible si estado es PENDIENTE
- [ ] Botón **"Agregar Ítem"** visible
- [ ] Botón **"Cerrar"**

**Resultado esperado:**
- ✅ Modal se abre sin errores (no pantalla en blanco)
- ✅ Desglose muestra todos los ítems agrupados correctamente
- ✅ Total calculado es correcto
- ✅ Tags y etiquetas apropiadas

**Evidencia:** Screenshot del modal con desglose completo

---

### Test Case 3.2: Agregar Ítem Manual a Cuota

**ID:** TC-CUO-005
**Prioridad:** Alta
**Objetivo:** Agregar un concepto adicional a una cuota existente

**Pre-condición:**
- Cuota en estado PENDIENTE
- Modal de detalle abierto

**Pasos:**

1. Desde el modal de detalle, hacer clic en **"Agregar Ítem"**

2. En el modal "Agregar Ítem Manual", llenar:
   - **Tipo de Ítem:** Seleccionar "DESCUENTO_ANTIGUEDAD" (o cualquier otro tipo disponible)
   - **Concepto:** "Bono especial 2026" (3-200 caracteres)
   - **Monto Unitario:** 500 (> $0.01)
   - **Cantidad:** 1 (≥ 1)
   - **Observaciones (opcional):** Dejar vacío o ingresar texto

3. Hacer clic en **"Agregar Ítem"**

4. **Esperar confirmación:**
   - Mensaje de éxito: "Ítem agregado correctamente"
   - Modal "Agregar Ítem" se cierra

5. **Verificar actualización automática:**
   - Modal de detalle permanece abierto
   - Desglose se recarga automáticamente
   - Nuevo ítem aparece en la sección correspondiente

**Resultado esperado:**

- ✅ Ítem agregado aparece en desglose
- ✅ Ubicado en la categoría correcta (ej: "Descuentos" si es descuento)
- ✅ **Total a Pagar** actualizado correctamente
- ✅ Tag "Manual" (naranja) indica que fue agregado manualmente

**Validaciones del formulario:**

- [ ] **Tipo requerido:** No se puede submit sin seleccionar tipo
- [ ] **Concepto mínimo 3 caracteres:** Muestra error si < 3
- [ ] **Monto > $0.01:** Muestra error si monto es 0 o negativo
- [ ] **Cantidad ≥ 1:** Muestra error si cantidad < 1
- [ ] **Si cantidad > 1:** Se muestra cálculo de total automático (cantidad × monto)

**Evidencia:** Screenshot del nuevo ítem en el desglose

---

### Test Case 3.3: Recalcular Cuota

**ID:** TC-CUO-006
**Prioridad:** Media
**Objetivo:** Recalcular montos de una cuota aplicando ajustes, descuentos y exenciones

**Pre-condición:**
- Cuota en estado PENDIENTE
- Socio tiene ajuste o exención configurada (opcional)

**Pasos:**

1. Abrir detalle de una cuota
2. Hacer clic en botón **"Recalcular"**
3. Esperar procesamiento (spinner visible)

**Resultado esperado:**

- ✅ Mensaje de éxito: "Cuota recalculada exitosamente"
- ✅ Desglose se actualiza automáticamente
- ✅ **Total a Pagar** actualizado con nuevos montos
- ✅ Si había ajustes aplicables, aparecen nuevos ítems de ajuste
- ✅ Si había exenciones vigentes, aparecen como descuentos
- ✅ Cuota permanece en estado PENDIENTE

**Verificaciones:**

- [ ] Comparar total antes vs después (debe ser diferente si hay ajustes/exenciones)
- [ ] Verificar que ítems automáticos se regeneraron correctamente
- [ ] Ítems manuales agregados previamente se mantienen intactos

---

### Test Case 3.4: Eliminar Cuota

**ID:** TC-CUO-007
**Prioridad:** Media
**Objetivo:** Eliminar una cuota en estado PENDIENTE

**Pre-condición:**
- Cuota en estado PENDIENTE (no pagada ni con recibo generado)

**Pasos:**

1. En la tabla de cuotas, localizar una cuota con estado PENDIENTE
2. Hacer clic en el botón **"Eliminar"** (icono de papelera o menú de 3 puntos → Eliminar)
3. Confirmar en el dialog de confirmación: "¿Está seguro de eliminar esta cuota?"

**Resultado esperado:**

- ✅ Cuota desaparece de la tabla
- ✅ Mensaje de éxito: "Cuota eliminada exitosamente"
- ✅ Total de cuotas en paginación se reduce en 1
- ✅ Dashboard KPIs se actualizan (Total Pendiente disminuye)

**Restricciones:**

- [ ] **No se puede eliminar si estado es PAGADO:** Debe mostrar error
- [ ] **No se puede eliminar si tiene recibo generado:** Debe mostrar error
- [ ] Solo cuotas PENDIENTE sin recibo pueden eliminarse

**Evidencia:** Screenshot de la tabla después de eliminar

---

## 4. AJUSTES Y EXENCIONES

### Test Case 4.1: Crear Ajuste de Descuento Porcentual

**ID:** TC-ADJ-001
**Prioridad:** Alta
**Objetivo:** Crear un ajuste de descuento del 10% para un socio

**Pre-condición:**
- Socio existe y está activo

**Pasos:**

1. Ir a **Cuotas → Gestión de Ajustes** (o abrir desde modal de ajustes en detalle de cuota)
2. Hacer clic en **"Nuevo Ajuste"**
3. Llenar formulario:
   - **Socio:** Seleccionar un socio (autocompletado por nombre/DNI)
   - **Tipo:** DESCUENTO_PORCENTAJE
   - **Valor:** 10 (%)
   - **Concepto:** "Descuento especial por convenio 2026"
   - **Aplica a:** TOTAL_CUOTA
   - **Fecha inicio:** 01/01/2026
   - **Fecha fin:** 31/12/2026 (opcional, puede dejarse vacío para indefinido)
   - **Activo:** ✅ SÍ
4. Hacer clic en **"Guardar"**

**Resultado esperado:**

- ✅ Ajuste creado con éxito
- ✅ Mensaje: "Ajuste creado correctamente"
- ✅ Ajuste aparece en lista de ajustes del socio
- ✅ Estado: ACTIVO

**Validaciones:**

- [ ] Porcentaje entre 0-100%
- [ ] Fecha inicio <= Fecha fin (si fecha fin está definida)
- [ ] Concepto requerido (min 3 caracteres)

**Prueba de aplicación:**

1. Generar cuotas para el socio en el período del ajuste
2. Abrir detalle de la cuota generada
3. **Verificar:** Debe aparecer un ítem de descuento del 10% del total

---

### Test Case 4.2: Crear Exención de Cuota

**ID:** TC-EXE-001
**Prioridad:** Alta
**Objetivo:** Crear una exención del 50% por situación económica

**Pre-condición:**
- Socio existe y está activo

**Pasos:**

1. Ir a **Cuotas → Gestión de Exenciones**
2. Hacer clic en **"Nueva Exención"**
3. Llenar formulario:
   - **Socio:** Seleccionar socio
   - **Tipo:** PARCIAL
   - **Motivo:** SITUACION_ECONOMICA
   - **Porcentaje:** 50 (%)
   - **Fecha inicio:** 01/02/2026
   - **Fecha fin:** 30/06/2026 (máximo 2 años desde inicio)
   - **Justificación:** "Socio atraviesa dificultades económicas temporales. Solicita reducción del 50% por 6 meses."
   - **Documento Respaldo:** (opcional) URL o referencia a documento
4. Hacer clic en **"Solicitar"** o **"Guardar"**

**Resultado esperado:**

- ✅ Exención creada con estado **PENDIENTE_APROBACION**
- ✅ Mensaje: "Exención solicitada. Requiere aprobación."
- ✅ Exención aparece en lista con chip amarillo "Pendiente Aprobación"

**Validaciones:**

- [ ] Porcentaje entre 1-100%
- [ ] Si tipo es **TOTAL**, porcentaje se fuerza automáticamente a 100%
- [ ] Fecha fin <= Fecha inicio + 2 años (restricción de 2 años máximo)
- [ ] Justificación requerida (min 10 caracteres)

**Flujo de Aprobación (si implementado):**

1. Usuario con rol Admin/Tesorero accede a exenciones pendientes
2. Revisa justificación
3. Aprueba o rechaza exención
4. Si se aprueba, estado cambia a **VIGENTE**

**Prueba de aplicación:**

1. Aprobar la exención (cambiar estado a VIGENTE)
2. Generar cuotas para el socio en el período de la exención
3. Abrir detalle de la cuota generada
4. **Verificar:** Debe aparecer un ítem de exención del 50% del total

---

## 5. FILTROS Y PAGINACIÓN

### Test Case 5.1: Filtrar por Mes y Año

**ID:** TC-FIL-001
**Prioridad:** Alta
**Objetivo:** Filtrar cuotas por período específico

**Pasos:**

1. Ir a **Cuotas → Gestión de Cuotas**
2. En los selectores de filtro:
   - **Mes:** Seleccionar "Enero"
   - **Año:** Seleccionar "2026"
3. Hacer clic en botón **"Refrescar"** o **"Aplicar"** (según implementación)

**Resultado esperado:**

- ✅ Tabla muestra solo cuotas de Enero 2026
- ✅ Total en paginación actualizado (ej: "Mostrando 1-20 de 92")
- ✅ Dashboard KPIs se actualizan para reflejar solo Enero 2026
- ✅ URL actualizada con parámetros: `?mes=1&anio=2026`

**Verificaciones:**

- [ ] Al cambiar a "Febrero", se muestran cuotas de Febrero
- [ ] Botón "Limpiar Filtros" restaura vista de todas las cuotas

---

### Test Case 5.2: Filtrar Solo Impagas

**ID:** TC-FIL-002
**Prioridad:** Alta
**Objetivo:** Mostrar solo cuotas pendientes de pago

**Pasos:**

1. En filtros, activar checkbox **"Solo Impagas"** o similar
2. Aplicar filtro

**Resultado esperado:**

- ✅ Solo se muestran cuotas con estado **PENDIENTE** o **VENCIDO**
- ✅ NO aparecen cuotas con estado **PAGADO** o **ANULADO**
- ✅ Total en paginación refleja solo cuotas impagas

**Verificaciones:**

- [ ] Todas las cuotas visibles tienen estado diferente de PAGADO
- [ ] Dashboard muestra solo datos de cuotas impagas

---

### Test Case 5.3: Switch "Ver Todas"

**ID:** TC-PAG-001
**Prioridad:** Media
**Objetivo:** Cargar todas las cuotas sin paginación

**Pre-condición:**
- Existen más de 20 cuotas (más de una página)

**Pasos:**

1. Localizar el switch **"Ver todas (XXX cuotas)"** (usualmente arriba de la tabla)
2. Activar el switch (hacer clic)

**Resultado esperado:**

- ✅ Spinner de loading visible (2-5 segundos según cantidad)
- ✅ Controles de paginación se ocultan
- ✅ Tabla muestra TODAS las cuotas con scroll vertical
- ✅ Mensaje actualizado: "Mostrando 351 de 351 cuotas"

**Desactivar switch:**

3. Hacer clic nuevamente en el switch

**Resultado al desactivar:**

- ✅ Vuelve a paginación normal (20 cuotas por página)
- ✅ Controles de paginación reaparecen
- ✅ Mensaje: "Mostrando 1-20 de 351"

**Verificaciones:**

- [ ] Con switch activado, scroll permite ver todas las cuotas
- [ ] Performance aceptable incluso con 300+ cuotas
- [ ] Filtros siguen funcionando con "Ver todas" activado

---

### Test Case 5.4: Cambiar Filas por Página

**ID:** TC-PAG-002
**Prioridad:** Media
**Objetivo:** Ajustar número de registros por página

**Pasos:**

1. En el selector "Rows per page" o "Filas por página"
2. Cambiar de **20** a **50**

**Resultado esperado:**

- ✅ Tabla recarga mostrando 50 cuotas
- ✅ Total de páginas se recalcula (ej: 351/50 = 8 páginas)
- ✅ Mensaje actualizado: "Mostrando 1-50 de 351"
- ✅ Preferencia se guarda (al recargar página, mantiene 50)

**Opciones típicas:**
- 10, 20, 50, 100 filas por página

**Verificaciones:**

- [ ] Cambiar a 10 → Muestra 10 cuotas
- [ ] Cambiar a 100 → Muestra 100 cuotas
- [ ] Navegación entre páginas funciona correctamente

---

## 6. EXPORTACIÓN

### Test Case 6.1: Exportar CSV sin Filtros

**ID:** TC-EXP-001
**Prioridad:** Alta
**Objetivo:** Exportar todas las cuotas del sistema a CSV

**Pre-condición:**
- Existen cuotas en el sistema (351 en este ejemplo)

**Pasos:**

1. Ir a **Cuotas → Gestión de Cuotas**
2. **NO aplicar filtros** (o limpiar filtros existentes)
3. Hacer clic en botón **"Exportar CSV"**

**Resultado esperado:**

- ✅ Spinner de loading en el botón (2-5 segundos)
- ✅ Descarga automática de archivo CSV
- ✅ Nombre de archivo: `cuotas_export_2026-01-18.csv` (con fecha actual)
- ✅ Mensaje de éxito: "351 cuotas exportadas exitosamente"

**Verificaciones del archivo CSV:**

**Estructura:**
- [ ] **Header (fila 1):** ID, Mes, Año, Categoría, Monto Base, Monto Actividades, Monto Total, Estado, Persona
- [ ] **Datos (351 filas):** Total 352 líneas (1 header + 351 datos)

**Contenido:**
- [ ] Datos correctamente formateados
- [ ] Sin comas escapadas incorrectamente
- [ ] Encoding UTF-8 (acentos y ñ se ven correctamente)
- [ ] Abre correctamente en Excel, LibreOffice o Google Sheets

**Ejemplo de contenido:**
```csv
ID,Mes,Año,Categoría,Monto Base,Monto Actividades,Monto Total,Estado,Persona
383,1,2026,ESTUDIANTE,5000,0,5000,PENDIENTE,"Cristina Sánchez"
382,1,2026,ACTIVO,8000,0,8000,PENDIENTE,"Lucía Vargas"
```

**Evidencia:** Screenshot del archivo CSV abierto en Excel/LibreOffice

---

### Test Case 6.2: Exportar CSV con Filtros

**ID:** TC-EXP-002
**Prioridad:** Alta
**Objetivo:** Exportar solo cuotas que coincidan con filtros aplicados

**Pasos:**

1. Aplicar filtros:
   - **Mes:** Enero
   - **Año:** 2026
   - **Categoría:** ACTIVO
2. Verificar que la tabla muestra solo cuotas filtradas (ej: 52 cuotas)
3. Hacer clic en **"Exportar CSV"**

**Resultado esperado:**

- ✅ Descarga archivo CSV con **SOLO las 52 cuotas filtradas**
- ✅ Mensaje: "52 cuotas exportadas exitosamente"
- ✅ Nombre de archivo: `cuotas_export_2026-01-18.csv`

**Verificaciones:**

- [ ] Archivo CSV tiene 52 filas de datos (+ 1 header = 53 total)
- [ ] Todas las cuotas en CSV son de Enero 2026 y categoría ACTIVO
- [ ] No incluye cuotas de otras categorías ni otros meses

**Prueba adicional:**

1. Activar filtro **"Solo Impagas"**
2. Exportar
3. **Verificar:** CSV solo contiene cuotas con estado PENDIENTE o VENCIDO

---

## 7. GENERACIÓN DE RECIBOS

### Test Case 7.1: Generar Recibo desde Cuota Individual

**ID:** TC-REC-001
**Prioridad:** Alta
**Objetivo:** Convertir una cuota PENDIENTE en recibo

**Pre-condición:**
- Cuota en estado PENDIENTE sin recibo generado

**Pasos:**

1. Ir a **Recibos → Gestión de Recibos**
2. Hacer clic en botón **"Generar Recibo"**
3. En el modal "Generar Recibo":
   - **Persona:** Seleccionar socio (autocompletado por nombre/DNI)
   - **Cuotas disponibles:** Se listan cuotas PENDIENTE del socio
   - **Seleccionar cuota:** Marcar checkbox de 1 cuota
   - **Fecha vencimiento:** Seleccionar fecha (ej: 31/01/2026)
   - **Observaciones:** (opcional) "Pagar antes del vencimiento"
4. Hacer clic en **"Generar Recibo"**

**Resultado esperado:**

- ✅ Recibo creado con éxito
- ✅ Mensaje: "Recibo #XXXX generado exitosamente"
- ✅ Modal se cierra
- ✅ Tabla de recibos se actualiza, mostrando el nuevo recibo
- ✅ Recibo aparece con estado **PENDIENTE**

**Verificaciones:**

- [ ] **Número de recibo:** Generado automáticamente (ej: 2026-00042)
- [ ] **Total del recibo** = Total de la cuota seleccionada
- [ ] **Concepto:** Incluye desglose de la cuota (Cuota Base + Actividades, etc.)
- [ ] **Persona:** Correctamente asignada
- [ ] **Fecha emisión:** Fecha actual
- [ ] **Fecha vencimiento:** La seleccionada en el formulario

**Verificación en Cuotas:**

1. Ir a **Cuotas → Gestión de Cuotas**
2. Buscar la cuota original
3. **Verificar:** Ahora muestra "Recibo: #XXXX" vinculado

---

### Test Case 7.2: Generar Recibo con Múltiples Cuotas

**ID:** TC-REC-002
**Prioridad:** Media
**Objetivo:** Generar un recibo que incluya 2 o más cuotas de un mismo socio

**Pre-condición:**
- Socio tiene 2+ cuotas en estado PENDIENTE (ej: Enero y Febrero)

**Pasos:**

1. Abrir modal "Generar Recibo"
2. Seleccionar persona con múltiples cuotas pendientes
3. En lista de cuotas disponibles, marcar checkbox de **2 cuotas**
4. Fecha vencimiento: 15/02/2026
5. Generar

**Resultado esperado:**

- ✅ Recibo creado con total = **Suma de ambas cuotas**
- ✅ **Concepto del recibo:** Lista ambas cuotas
  - Ejemplo: "Cuota Enero 2026 - $5000 + Cuota Febrero 2026 - $5000"
- ✅ Total: $10,000

**Verificaciones:**

- [ ] Ambas cuotas ahora tienen el mismo recibo vinculado
- [ ] En detalle de recibo (si implementado), se listan ambas cuotas

---

## 8. PAGO DE RECIBOS

### Test Case 8.1: Registrar Pago Completo

**ID:** TC-PAG-003
**Prioridad:** Alta
**Objetivo:** Marcar un recibo como PAGADO

**Pre-condición:**
- Recibo en estado PENDIENTE

**Pasos:**

1. En tabla de recibos, localizar un recibo con estado PENDIENTE
2. Hacer clic en icono **"Registrar pago"** (icono de check verde o menú → Pagar)

**NOTA:** En la implementación actual, el pago se registra automáticamente con datos hardcoded. En una implementación completa, debería abrir un modal.

**Si hay modal de pago (implementación futura):**
3. Llenar datos de pago:
   - **Método de pago:** Seleccionar (Efectivo / Transferencia / Tarjeta de Crédito / Tarjeta de Débito)
   - **Monto pagado:** Pre-llenado con total del recibo (editable)
   - **Fecha de pago:** Pre-llenado con fecha actual (editable)
   - **Comprobante:** (opcional) Número de comprobante
4. Confirmar pago

**Resultado esperado:**

- ✅ Estado del recibo cambia a **PAGADO**
- ✅ Chip/badge verde con texto "Pagado"
- ✅ Icono de pago desaparece (ya no se puede pagar de nuevo)
- ✅ **Fecha de pago:** Se registra
- ✅ **Método de pago:** Se registra

**Verificaciones:**

- [ ] No se puede pagar dos veces el mismo recibo
- [ ] Cuotas vinculadas también cambian a estado PAGADO (si implementado)
- [ ] Dashboard KPIs se actualizan:
  - Total Cobrado aumenta
  - Total Pendiente disminuye

**Evidencia:** Screenshot del recibo con estado PAGADO

---

### Test Case 8.2: Aplicar Pago Parcial

**ID:** TC-PAG-004
**Prioridad:** Media
**Objetivo:** Registrar un pago menor al total del recibo

**Pre-condición:**
- Recibo PENDIENTE con total de $10,000

**Pasos:**

1. Registrar pago con:
   - **Monto pagado:** $3,000 (< total de $10,000)
   - **Método:** Efectivo
2. Confirmar

**Resultado esperado:**

- ✅ Estado cambia a **PARCIAL**
- ✅ Chip/badge amarillo con texto "Parcial"
- ✅ Monto pagado: $3,000
- ✅ Saldo pendiente: $7,000 (calculado automáticamente)
- ✅ Recibo sigue visible en filtro "Pendientes"
- ✅ Icono de pago permanece visible (se puede pagar el saldo restante)

**Verificaciones:**

- [ ] Al hacer un segundo pago de $7,000, estado cambia a PAGADO
- [ ] Historial de pagos muestra ambos pagos (si implementado)

---

## 9. ANULACIÓN Y DUPLICACIÓN

### Test Case 9.1: Anular Recibo

**ID:** TC-REC-003
**Prioridad:** Alta
**Objetivo:** Anular un recibo con motivo justificado

**Pre-condición:**
- Recibo en estado PENDIENTE o PAGADO

**Pasos:**

1. En tabla de recibos, menú de 3 puntos → **"Anular"**
2. En el dialog de anulación:
   - **Motivo:** Ingresar "Error en facturación - Socio ya pagó en otro recibo"
   - **Confirmar:** Checkbox "Estoy seguro de anular este recibo"
3. Hacer clic en **"Confirmar Anulación"**

**Resultado esperado:**

- ✅ Estado cambia a **ANULADO** o **CANCELADO**
- ✅ Mensaje: "Recibo anulado exitosamente"
- ✅ Recibo aparece tachado o con chip gris "Anulado"
- ✅ No se puede modificar ni pagar
- ✅ Motivo de anulación se guarda y es visible en detalle

**Restricciones:**

- [ ] Requiere motivo obligatorio (mínimo 10 caracteres)
- [ ] Confirmación obligatoria para evitar anulaciones accidentales
- [ ] Si recibo estaba PAGADO, puede requerir permiso especial o reversión de pago

**Verificaciones:**

- [ ] Dashboard KPIs se actualizan (si recibo estaba PENDIENTE, Total Pendiente disminuye)
- [ ] Cuotas vinculadas vuelven a estado PENDIENTE (disponibles para nuevo recibo)

---

### Test Case 9.2: Duplicar Recibo

**ID:** TC-REC-004
**Prioridad:** Baja
**Objetivo:** Crear una copia de un recibo existente

**Pre-condición:**
- Recibo en cualquier estado

**Pasos:**

1. Menú de 3 puntos → **"Duplicar"**

**ESTADO ACTUAL DE IMPLEMENTACIÓN:**
- Solo muestra `console.log("Duplicar recibo")` (no implementado)

**ESPERADO (implementación futura):**

2. Modal "Duplicar Recibo" se abre
3. Confirmar datos:
   - Nueva fecha de vencimiento
   - Mantener conceptos y montos
4. Confirmar duplicación

**Resultado esperado:**

- ✅ Nuevo recibo creado con mismo contenido
- ✅ Número de recibo diferente (nuevo número)
- ✅ Estado: PENDIENTE
- ✅ Fecha emisión: Actual
- ✅ Cuotas vinculadas: Las mismas (si aplica)

---

## 10. DESCARGAS Y ENVÍOS

### Test Case 10.1: Descargar PDF de Recibo

**ID:** TC-REC-005
**Prioridad:** Alta
**Objetivo:** Generar y descargar PDF imprimible de un recibo

**Pre-condición:**
- Recibo generado (cualquier estado)

**Pasos:**

1. En tabla de recibos, hacer clic en icono **"Descargar PDF"** (icono de download)
2. Esperar procesamiento (1-3 segundos)

**Resultado esperado:**

- ✅ Descarga automática de archivo `recibo-XXXX.pdf` (XXXX = número de recibo)
- ✅ Mensaje de éxito: "PDF generado exitosamente"

**Verificaciones del PDF:**

**Contenido:**
- [ ] **Header:** Logo SIGESDA (si aplica)
- [ ] **Título:** "Recibo de Pago" o similar
- [ ] **Número de recibo:** Claramente visible
- [ ] **Fecha de emisión:** DD/MM/YYYY
- [ ] **Fecha de vencimiento:** DD/MM/YYYY
- [ ] **Datos del socio:**
  - Nombre completo
  - DNI
  - Categoría
- [ ] **Conceptos detallados:**
  - Lista de ítems (Cuota Base, Actividades, etc.)
  - Montos individuales
- [ ] **Total a pagar:** Destacado, formato $X,XXX.XX
- [ ] **Estado:** PENDIENTE / PAGADO / PARCIAL / ANULADO
- [ ] **Información de pago (si aplica):**
  - Métodos de pago aceptados
  - Datos bancarios para transferencias
- [ ] **Footer:** Datos de contacto SIGESDA

**Formato:**
- [ ] Archivo PDF válido (abre en Adobe Reader, navegadores)
- [ ] Tamaño A4
- [ ] Diseño profesional y legible

**Evidencia:** Screenshot del PDF generado

---

### Test Case 10.2: Enviar Recibo por Email

**ID:** TC-REC-006
**Prioridad:** Media
**Objetivo:** Enviar recibo por correo electrónico al socio

**Pre-condición:**
- Recibo generado
- Socio tiene email registrado

**Pasos:**

1. Menú de 3 puntos → **"Enviar por Email"**
2. (Si hay modal) Confirmar dirección de email del socio
3. Hacer clic en **"Enviar"**

**Resultado esperado:**

- ✅ Mensaje de éxito: "Recibo enviado por email a [email]"
- ✅ Campo "Enviado" cambia a **Sí** en la tabla
- ✅ Fecha de envío se registra

**Verificaciones del email enviado:**

**Asunto:**
- "Recibo de Pago #XXXX - SIGESDA"

**Cuerpo:**
- Saludo personalizado: "Estimado/a [Nombre del Socio],"
- Información del recibo
- Instrucciones de pago
- Datos de contacto

**Adjunto:**
- Archivo PDF del recibo

**Verificación:**
- [ ] Email llega a la bandeja de entrada del socio (verificar con email de prueba)
- [ ] PDF adjunto es correcto y abre sin problemas
- [ ] Links/botones en email funcionan (si aplica)

---

## 11. DASHBOARD Y REPORTES

### Test Case 11.1: Verificar KPIs de Cuotas

**ID:** TC-REP-001
**Prioridad:** Alta
**Objetivo:** Validar cálculo correcto de indicadores clave de cuotas

**Pasos:**

1. Ir a **Cuotas → Gestión de Cuotas**
2. Observar las cards de KPIs en la parte superior

**Verificaciones:**

**Total Recaudado (Mes actual):**
- [ ] Muestra suma de cuotas con estado PAGADO del mes/año seleccionado
- [ ] Formato: $X,XXX.XX
- [ ] Color verde (positivo)

**Total Pendiente:**
- [ ] Muestra suma de cuotas con estado PENDIENTE o VENCIDO
- [ ] Formato: $X,XXX.XX
- [ ] Color naranja (advertencia)

**Tasa de Cobro (%):**
- [ ] Cálculo: (Total Recaudado / Total Facturado) × 100
- [ ] Formato: X.XX%
- [ ] Color verde si > 80%, amarillo si 50-80%, rojo si < 50%

**Prueba de actualización:**

3. Cambiar filtro de mes/año
4. **Verificar:** KPIs se actualizan automáticamente con datos del nuevo período

**Evidencia:** Screenshot de los KPIs con valores correctos

---

### Test Case 11.2: Verificar KPIs de Recibos

**ID:** TC-REP-002
**Prioridad:** Alta
**Objetivo:** Validar indicadores clave de recibos

**Pasos:**

1. Ir a **Recibos → Gestión de Recibos**
2. Observar las cards de KPIs

**Verificaciones:**

**Total Facturado:**
- [ ] Suma de todos los recibos (PENDIENTE + PAGADO + PARCIAL)
- [ ] NO incluye ANULADO

**Total Cobrado:**
- [ ] Suma de recibos con estado PAGADO
- [ ] Suma de montos pagados de recibos PARCIAL

**Total Pendiente:**
- [ ] Total Facturado - Total Cobrado
- [ ] Suma de recibos PENDIENTE + saldos de PARCIAL

**Recibos Vencidos:**
- [ ] Cantidad de recibos con fecha vencimiento < fecha actual
- [ ] Solo cuenta PENDIENTE y PARCIAL (no PAGADO ni ANULADO)

**Prueba de cálculo:**

3. Sumar manualmente:
   - Recibos PAGADO → Comparar con Total Cobrado
   - Recibos PENDIENTE → Comparar con Total Pendiente
4. **Verificar:** Coinciden con los KPIs

---

## 12. CASOS DE USO ESPECIALES

### Caso de Uso 12.1: Corrección de Cuota Generada Incorrectamente

**Escenario:**
Se generaron cuotas para Enero 2026, pero se descubre que el monto de la categoría ESTUDIANTE estaba mal configurado ($5000 en lugar de $4000).

**Opciones de Corrección:**

**Opción A: Eliminar y Regenerar**

**Pasos:**
1. Ir a Cuotas, filtrar: Mes=Enero, Año=2026, Categoría=ESTUDIANTE
2. Seleccionar todas las cuotas de estudiantes
3. Eliminar en lote (si implementado) o una por una
4. Corregir el monto de la categoría ESTUDIANTE en catálogo
5. Regenerar cuotas para Enero 2026, solo categoría ESTUDIANTE

**Ventajas:** Cuotas quedan correctas desde el inicio
**Desventajas:** Si ya hay recibos generados, no se pueden eliminar

---

**Opción B: Recalcular Individual**

**Pasos:**
1. Corregir monto de categoría ESTUDIANTE en catálogo
2. Para cada cuota de estudiante:
   - Abrir detalle
   - Hacer clic en "Recalcular"
3. Verificar nuevo monto

**Ventajas:** No elimina cuotas, mantiene historial
**Desventajas:** Tedioso si hay muchas cuotas

---

**Opción C: Agregar Ítem Manual de Ajuste**

**Pasos:**
1. Para cada cuota de estudiante:
   - Abrir detalle
   - Agregar ítem manual:
     - Tipo: AJUSTE_MANUAL
     - Concepto: "Corrección monto categoría"
     - Monto: -1000 (negativo para descuento)
2. Total queda en $4000

**Ventajas:** Deja evidencia de corrección
**Desventajas:** Aumenta complejidad del desglose

**Recomendación:** Usar **Opción A** si no hay recibos generados, **Opción B** si ya hay recibos.

---

### Caso de Uso 12.2: Socio con Exención - Verificar Descuento Automático

**Escenario:**
Socio Juan Pérez tiene exención del 50% aprobada desde 01/02/2026 hasta 30/06/2026 por situación económica.

**Objetivo:**
Verificar que la exención se aplica automáticamente al generar cuotas.

**Pasos:**

1. **Crear exención:**
   - Ir a Gestión de Exenciones
   - Crear exención para Juan Pérez (50%, PARCIAL, SITUACION_ECONOMICA)
   - Aprobar exención (estado VIGENTE)

2. **Generar cuotas:**
   - Generar cuotas para Febrero 2026 (período dentro de la exención)

3. **Verificar aplicación:**
   - Buscar cuota de Juan Pérez para Febrero 2026
   - Abrir detalle
   - **Verificar en desglose:**
     - Cuota Base: $8000 (ejemplo)
     - Exención 50%: -$4000
     - **Total a Pagar: $4000** (50% del monto original)

4. **Verificar cuotas fuera del período:**
   - Generar cuotas para Enero 2026 (antes de la exención)
   - Cuota de Juan Pérez debe tener monto completo ($8000)
   - NO debe aplicarse descuento

**Resultado esperado:**

- ✅ Exenciones se aplican solo en el período definido
- ✅ Aparece como ítem de descuento en desglose
- ✅ Tipo de ítem: EXENCION
- ✅ Concepto incluye motivo de exención

---

### Caso de Uso 12.3: Exportar Reporte de Recaudación Mensual

**Escenario:**
Necesito un reporte de todo lo recaudado en Enero 2026 para presentar en asamblea.

**Pasos:**

1. Ir a **Cuotas → Gestión de Cuotas**
2. Aplicar filtros:
   - **Mes:** Enero
   - **Año:** 2026
   - **Estado:** PAGADO (solo impagas desactivado o filtro específico si existe)
3. Hacer clic en **"Exportar CSV"**

**Resultado esperado:**

- ✅ Archivo CSV con solo cuotas pagadas de Enero 2026
- ✅ Suma total de columna "Monto Total" = Total Recaudado del dashboard

**Análisis del CSV:**

4. Abrir CSV en Excel/Google Sheets
5. Crear tabla dinámica (pivot table):
   - Filas: Categoría
   - Valores: Suma de Monto Total
6. **Obtener:**
   - Total recaudado por categoría
   - Cantidad de cuotas pagadas por categoría

**Ejemplo de reporte:**

| Categoría | Cuotas Pagadas | Total Recaudado |
|-----------|----------------|-----------------|
| ACTIVO    | 15             | $120,000        |
| ESTUDIANTE| 8              | $40,000         |
| JUBILADO  | 3              | $9,000          |
| **TOTAL** | **26**         | **$169,000**    |

---

## 13. VERIFICACIONES FINALES

### Checklist de Regresión (Ejecutar después de cada deploy)

**Módulo Cuotas:**

- [ ] **TC-CUO-001:** Generar cuotas masivas funciona
- [ ] **TC-CUO-004:** Ver detalle con desglose funciona (sin pantalla en blanco)
- [ ] **TC-CUO-005:** Agregar ítem manual funciona
- [ ] **TC-CUO-006:** Recalcular funciona
- [ ] **TC-CUO-007:** Eliminar cuota funciona
- [ ] **TC-EXP-001:** Exportar CSV funciona (archivo tiene datos)
- [ ] **TC-PAG-001:** Switch "Ver todas" funciona
- [ ] **TC-FIL-001:** Filtros funcionan correctamente

**Módulo Recibos:**

- [ ] **TC-REC-001:** Generar recibo funciona
- [ ] **TC-PAG-003:** Pagar recibo funciona
- [ ] **TC-REC-005:** Descargar PDF funciona
- [ ] **TC-REC-006:** Enviar por email funciona
- [ ] **TC-REC-003:** Anular recibo funciona
- [ ] Filtros funcionan
- [ ] KPIs se calculan correctamente

**Módulo Ajustes y Exenciones:**

- [ ] **TC-ADJ-001:** Crear ajuste funciona
- [ ] **TC-EXE-001:** Crear exención funciona
- [ ] Ajustes se aplican en generación de cuotas
- [ ] Exenciones se aplican en generación de cuotas

**Integración:**

- [ ] Dashboard KPIs de Cuotas actualiza correctamente
- [ ] Dashboard KPIs de Recibos actualiza correctamente
- [ ] Navegación entre módulos funciona sin errores
- [ ] No hay errores en consola del navegador

---

## 14. TROUBLESHOOTING

### Problema: Cuotas no se generan

**Síntomas:**
- Botón "Generar" clickeado pero no pasa nada
- Mensaje de error: "Error al generar cuotas"
- Validación muestra 0 socios cumplen criterios

**Causas posibles:**

1. **Backend no disponible**
   - Verificar: `curl http://localhost:8000/health`
   - Solución: Iniciar backend

2. **No hay socios con categoría asignada**
   - Verificar: Ir a Personas, filtrar por categoría
   - Solución: Asignar categorías a socios

3. **Ya existen cuotas para ese período**
   - Verificar: Validación muestra lista de conflictos
   - Solución: Elegir otro mes/año o regenerar

4. **Error de permisos**
   - Verificar: Usuario tiene rol adecuado
   - Solución: Login con usuario admin

5. **Timeout del servidor (> 60 segundos)**
   - Verificar: Network tab en DevTools, ver si request se quedó colgado
   - Solución: Reducir cantidad de socios (filtrar por categoría), reiniciar backend

**Debugging:**

```bash
# Verificar logs del backend
tail -f backend.log

# Verificar request en frontend (Console del navegador)
# Buscar error 500, 400, 404
```

---

### Problema: Exportación CSV falla

**Síntomas:**
- Spinner de loading infinito
- Error: "Error al exportar cuotas"
- Descarga archivo vacío

**Causas posibles:**

1. **Timeout del servidor (> 60 segundos)**
   - Causa: Demasiadas cuotas (> 10,000)
   - Solución: Aplicar filtros para reducir dataset (ej: solo un mes)

2. **Error en conversión CSV**
   - Causa: Datos con caracteres especiales mal escapados
   - Solución: Verificar console del navegador (F12), buscar error en `convertToCSV()`

3. **Extensión del navegador bloqueando descarga**
   - Solución: Intentar en navegador incógnito (sin extensiones)

4. **Backend devuelve error 500**
   - Verificar: Network tab → Ver respuesta del endpoint `/api/cuotas/export`
   - Solución: Revisar logs del backend, corregir error

**Debugging:**

```javascript
// En console del navegador (F12), ejecutar:
localStorage.setItem('DEBUG', 'true');
// Recargar página y probar exportación, se mostrarán más logs
```

---

### Problema: Recibo no se puede pagar

**Síntomas:**
- Botón "Pagar" deshabilitado
- Error: "No se puede pagar este recibo"

**Causas posibles:**

1. **Recibo ya está pagado**
   - Verificar: Estado del recibo en la tabla
   - Solución: No requiere acción

2. **Recibo está anulado**
   - Verificar: Estado ANULADO/CANCELADO
   - Solución: No se puede pagar recibos anulados, generar nuevo recibo

3. **Usuario sin permisos**
   - Verificar: Rol del usuario
   - Solución: Login con usuario con permisos de tesorería

**Debugging:**

```bash
# Verificar estado del recibo en backend
curl http://localhost:8000/api/recibos/:id
# Verificar campo "estado"
```

---

### Problema: Detalle de cuota muestra pantalla en blanco

**Síntomas:**
- Al hacer clic en "Ver", la pantalla queda completamente blanca
- Console muestra error: "Cannot read properties of undefined"

**Causa:**
- Error en transformación de desglose de ítems
- Estructura de respuesta del backend no coincide con la esperada

**Solución:**

1. **Verificar console del navegador (F12):**
   - Buscar error rojo con stack trace
   - Identificar línea problemática

2. **Verificar respuesta del backend:**
   ```bash
   curl http://localhost:8000/api/cuotas/:id/items/desglose
   ```
   - Debe devolver: `{ success: true, data: { items: [...], resumen: {...} } }`

3. **Si el problema persiste:**
   - Limpiar cache del navegador (Ctrl+Shift+Delete)
   - Reiniciar servidor de desarrollo frontend
   - Verificar que `cuotasService.getDesgloseItems()` tiene la transformación correcta

**Ya corregido en sesión anterior:** Este problema fue solucionado agregando transformación de datos en `cuotasService.ts:164-214`.

---

## 15. GLOSARIO

**Cuota:** Cargo mensual a un socio por su membresía y actividades. Una cuota puede incluir múltiples conceptos (base, actividades, descuentos, recargos).

**Recibo:** Documento que agrupa una o más cuotas para cobro. Un recibo tiene número único, fecha de emisión, fecha de vencimiento y puede ser pagado, anulado o duplicado.

**Ítem de Cuota:** Línea individual dentro de una cuota (ej: cuota base, actividad de guitarra, descuento por antigüedad). Cada ítem tiene tipo, monto, cantidad y puede ser automático o manual.

**Ajuste:** Descuento o recargo permanente o temporal aplicado a un socio. Los ajustes pueden ser porcentuales (10%) o de monto fijo ($500). Se aplican automáticamente al generar cuotas.

**Exención:** Reducción de cuota por motivos especiales (situación económica, jubilación, etc.). Las exenciones requieren aprobación, tienen fecha de inicio y fin (máximo 2 años), y pueden ser PARCIAL (X%) o TOTAL (100%).

**Estado PENDIENTE:** Cuota o recibo generado pero no pagado. Puede ser modificado, recalculado o eliminado.

**Estado PAGADO:** Cuota o recibo cobrado completamente. No puede ser modificado. Registra fecha de pago y método de pago.

**Estado VENCIDO:** Cuota o recibo con fecha de vencimiento pasada y sin pago. Sigue siendo PENDIENTE pero con advertencia de vencido.

**Estado PARCIAL:** Recibo que fue pagado parcialmente (monto pagado < total del recibo). Tiene saldo pendiente y puede recibir pagos adicionales.

**Estado ANULADO:** Cuota o recibo cancelado, no cobrable. Requiere motivo de anulación. No se incluye en reportes de recaudación.

**Desglose V2:** Vista detallada de una cuota que agrupa los ítems por categoría (Cuota Base, Actividades, Descuentos, Recargos, Otros). Facilita visualizar la composición del monto total.

**KPI (Key Performance Indicator):** Indicador clave de rendimiento. En el contexto de cuotas: Total Recaudado, Total Pendiente, Tasa de Cobro, etc.

**Generación Masiva:** Proceso de crear cuotas automáticamente para todos los socios que cumplen criterios (categoría, estado activo, etc.) en un período específico (mes/año).

**CSV (Comma-Separated Values):** Formato de archivo de texto donde los valores están separados por comas. Usado para exportar datos que pueden abrirse en Excel, Google Sheets, etc.

---

## ANEXOS

### Anexo A: Usuarios de Prueba

| Usuario | Rol | Password | Permisos |
|---------|-----|----------|----------|
| admin@sigesda.com | Administrador | admin123 | Todos los módulos, CRUD completo |
| tesorero@sigesda.com | Tesorero | test123 | Cuotas, Recibos (crear, pagar, anular) |
| tester@sigesda.com | Tester | test123 | Solo lectura |

### Anexo B: Socios de Prueba (Post-Seed)

| ID | Nombre Completo | DNI | Categoría | Cuota Base | Actividades | Email |
|----|-----------------|-----|-----------|------------|-------------|-------|
| 1 | Juan Pérez | 12345678 | ACTIVO | $8000 | Guitarra | juan@example.com |
| 2 | María González | 23456789 | ESTUDIANTE | $5000 | Piano, Violín | maria@example.com |
| 3 | Carlos López | 34567890 | JUBILADO | $3000 | Canto | carlos@example.com |
| 4 | Ana Martínez | 45678901 | ACTIVO | $8000 | - | ana@example.com |
| 5 | Luis Rodríguez | 56789012 | ESTUDIANTE | $5000 | Batería | luis@example.com |

### Anexo C: Categorías de Socios (Configuración Base)

| ID | Código | Nombre | Monto Cuota | Descuento | Activa |
|----|--------|--------|-------------|-----------|--------|
| 1 | FAMILIAR | Familiar | $6000 | 15% | ✅ |
| 2 | ESTUDIANTE | Estudiante | $5000 | 20% | ✅ |
| 3 | GENERAL | General | $7000 | 0% | ✅ |
| 4 | ACTIVO | Activo | $8000 | 0% | ✅ |
| 5 | JUBILADO | Jubilado | $3000 | 50% | ✅ |

### Anexo D: Tipos de Ítem de Cuota

| Código | Nombre | Categoría | Es Automático | Es Editable |
|--------|--------|-----------|---------------|-------------|
| CUOTA_BASE_SOCIO | Cuota Base Socio | BASE | ✅ | ❌ |
| ACTIVIDAD | Actividad | ACTIVIDAD | ✅ | ❌ |
| DESCUENTO_CATEGORIA | Descuento por Categoría | DESCUENTO | ✅ | ❌ |
| DESCUENTO_ANTIGUEDAD | Descuento por Antigüedad | DESCUENTO | ❌ | ✅ |
| EXENCION | Exención | DESCUENTO | ✅ | ❌ |
| RECARGO_MORA | Recargo por Mora | RECARGO | ❌ | ✅ |
| AJUSTE_MANUAL | Ajuste Manual | OTRO | ❌ | ✅ |

### Anexo E: Endpoints de API (Referencia Rápida)

**Cuotas:**
```
GET    /api/cuotas                     - Listar cuotas (paginado)
POST   /api/cuotas/generar-v2          - Generar cuotas masivamente
GET    /api/cuotas/:id                 - Detalle de cuota
POST   /api/cuotas/:id/recalcular      - Recalcular cuota
DELETE /api/cuotas/:id                 - Eliminar cuota
GET    /api/cuotas/:id/items/desglose  - Desglose de ítems
POST   /api/cuotas/:id/items           - Agregar ítem manual
GET    /api/cuotas/export              - Exportar CSV
```

**Recibos:**
```
GET    /api/recibos                    - Listar recibos (paginado)
POST   /api/recibos/generar            - Generar recibo desde cuota(s)
POST   /api/recibos/:id/pagar          - Registrar pago
POST   /api/recibos/:id/pdf            - Generar PDF
POST   /api/recibos/:id/enviar         - Enviar por email
POST   /api/recibos/:id/anular         - Anular recibo
```

**Ajustes:**
```
GET    /api/ajustes                    - Listar ajustes
POST   /api/ajustes                    - Crear ajuste
PUT    /api/ajustes/:id                - Actualizar ajuste
DELETE /api/ajustes/:id                - Eliminar ajuste
```

**Exenciones:**
```
GET    /api/exenciones                 - Listar exenciones
POST   /api/exenciones                 - Crear exención
PUT    /api/exenciones/:id             - Actualizar exención
DELETE /api/exenciones/:id             - Eliminar exención
PATCH  /api/exenciones/:id/aprobar     - Aprobar exención
PATCH  /api/exenciones/:id/rechazar    - Rechazar exención
```

### Anexo F: Estados de Cuotas y Recibos

**Estados de Cuota/Recibo:**

| Estado | Código | Descripción | Acciones Permitidas |
|--------|--------|-------------|---------------------|
| Pendiente | PENDIENTE | Generado pero no pagado | Ver, Editar, Recalcular, Eliminar, Pagar |
| Pagado | PAGADO | Cobrado completamente | Ver, Generar PDF, Anular (con permisos) |
| Vencido | VENCIDO | Fecha vencimiento pasada | Ver, Pagar, Generar PDF, Enviar recordatorio |
| Parcial | PARCIAL | Pagado parcialmente | Ver, Pagar saldo, Generar PDF |
| Anulado | ANULADO | Cancelado | Ver (solo lectura) |

**Transiciones de Estado:**

```
PENDIENTE → PAGADO (al registrar pago completo)
PENDIENTE → PARCIAL (al registrar pago parcial)
PENDIENTE → VENCIDO (automático si fecha vencimiento < hoy)
PENDIENTE → ANULADO (al anular manualmente)
PAGADO → ANULADO (al anular con permisos especiales)
PARCIAL → PAGADO (al completar el pago)
VENCIDO → PAGADO (al pagar cuota vencida)
```

---

**Fin de la Guía de Testing Manual de Cuotas y Recibos**

**Versión:** 1.0
**Fecha de creación:** 2026-01-18
**Última actualización:** 2026-01-18
**Mantenido por:** Equipo SIGESDA

---

## Control de Versiones

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0 | 2026-01-18 | Creación inicial de la guía | Sistema SIGESDA |
