# Checklist de Testing - Sistema de Categorías Dinámicas

## Fecha: 2025-10-12
## Estado: ⏳ PENDIENTE

---

## Pre-requisitos

- [ ] Backend corriendo en el puerto configurado
- [ ] Frontend corriendo en modo desarrollo
- [ ] Base de datos con migración de categorías ejecutada
- [ ] Las 4 categorías base deben existir:
  - ACTIVO
  - ESTUDIANTE
  - FAMILIAR
  - JUBILADO

---

## 1. TESTING DE VISUALIZACIÓN

### 1.1 Navegación
- [ ] El menú lateral muestra el ítem "Categorías" con icono Category
- [ ] El ítem "Categorías" está posicionado entre "Cuotas" y "Medios de Pago"
- [ ] Al hacer click en "Categorías" navega a `/categorias`
- [ ] El ítem se marca como seleccionado cuando estás en la ruta

### 1.2 Página de Categorías (GET)
- [ ] La página carga sin errores
- [ ] Se muestra el título "Gestión de Categorías de Socios"
- [ ] Se muestra el botón "Nueva Categoría"
- [ ] Se muestra el switch "Mostrar categorías inactivas"
- [ ] La tabla se renderiza correctamente
- [ ] Las 4 categorías base aparecen en la tabla
- [ ] Las columnas son: Orden, Código, Nombre, Descripción, Monto Cuota, Descuento, Estado, Uso, Acciones
- [ ] Los montos se muestran en formato ARS ($X,XXX)
- [ ] Los descuentos se muestran en formato porcentaje
- [ ] El chip de estado muestra "Activa" en verde para categorías activas
- [ ] Los contadores de uso muestran correctamente cantidad de socios y cuotas

---

## 2. TESTING DE CREACIÓN (POST)

### 2.1 Abrir Formulario
- [ ] Al hacer click en "Nueva Categoría" se abre el dialog
- [ ] El título es "Nueva Categoría"
- [ ] Todos los campos están vacíos excepto "Descuento" (default: 0)
- [ ] El botón es "Crear"

### 2.2 Validaciones de Código
- [ ] Campo requerido: muestra error si está vacío
- [ ] Mínimo 2 caracteres: muestra error con "A"
- [ ] Máximo 20 caracteres: muestra error con 21+ caracteres
- [ ] Solo mayúsculas: convierte automáticamente "abc" → "ABC"
- [ ] Solo mayúsculas y guión bajo: rechaza números y símbolos
- [ ] Acepta: "VIP", "PREMIUM", "VIP_GOLD"
- [ ] Rechaza: "vip", "123", "VIP-GOLD"

### 2.3 Validaciones de Nombre
- [ ] Campo requerido: muestra error si está vacío
- [ ] Mínimo 3 caracteres: muestra error con "AB"
- [ ] Máximo 50 caracteres: muestra error con 51+ caracteres
- [ ] Acepta letras, números, espacios

### 2.4 Validaciones de Descripción
- [ ] Campo opcional: no muestra error si está vacío
- [ ] Máximo 200 caracteres: muestra error con 201+ caracteres

### 2.5 Validaciones de Monto de Cuota
- [ ] Campo requerido: muestra error si está vacío
- [ ] Mínimo 0: muestra error con números negativos
- [ ] Máximo 1,000,000: muestra error con 1,000,001+
- [ ] Acepta decimales: 100.50
- [ ] Muestra símbolo $ al inicio

### 2.6 Validaciones de Descuento
- [ ] Campo opcional: acepta 0
- [ ] Mínimo 0: muestra error con números negativos
- [ ] Máximo 100: muestra error con 101+
- [ ] Acepta decimales: 12.5
- [ ] Muestra símbolo % al final

### 2.7 Validaciones de Orden
- [ ] Campo opcional: no muestra error si está vacío
- [ ] Solo números positivos: muestra error con 0 o negativos
- [ ] Solo enteros: no acepta decimales

### 2.8 Crear Categoría Válida
- [ ] Completar todos los campos requeridos correctamente
- [ ] Hacer click en "Crear"
- [ ] Se muestra notificación de éxito: "Categoría creada exitosamente"
- [ ] El dialog se cierra
- [ ] La tabla se recarga automáticamente
- [ ] La nueva categoría aparece en la tabla
- [ ] La nueva categoría tiene estado "Activa"

### 2.9 Errores de Backend
- [ ] Intentar crear categoría con código duplicado
- [ ] Debe mostrar error del backend
- [ ] El dialog NO se cierra
- [ ] Los datos del formulario se mantienen

---

## 3. TESTING DE EDICIÓN (PUT)

### 3.1 Abrir Formulario de Edición
- [ ] Hacer click en el icono de edición (lápiz) de una categoría
- [ ] El dialog se abre con título "Editar Categoría"
- [ ] Todos los campos se cargan con los datos actuales
- [ ] El campo "Código" está deshabilitado (gris)
- [ ] El botón es "Actualizar"

### 3.2 Validaciones en Edición
- [ ] Todas las validaciones de creación aplican
- [ ] El código NO puede modificarse (campo disabled)

### 3.3 Actualizar Categoría
- [ ] Modificar el nombre
- [ ] Modificar la descripción
- [ ] Modificar el monto
- [ ] Modificar el descuento
- [ ] Modificar el orden
- [ ] Hacer click en "Actualizar"
- [ ] Se muestra notificación: "Categoría actualizada exitosamente"
- [ ] El dialog se cierra
- [ ] La tabla se recarga
- [ ] Los cambios se reflejan en la tabla

### 3.4 Cancelar Edición
- [ ] Abrir formulario de edición
- [ ] Modificar varios campos
- [ ] Hacer click en "Cancelar"
- [ ] El dialog se cierra sin guardar
- [ ] Los datos en la tabla no cambian

---

## 4. TESTING DE ACTIVACIÓN/DESACTIVACIÓN (PATCH Toggle)

### 4.1 Desactivar Categoría
- [ ] Hacer click en el chip "Activa" de una categoría sin socios
- [ ] Se muestra notificación: "Categoría desactivada exitosamente"
- [ ] El chip cambia a "Inactiva" (gris, outlined)
- [ ] El icono cambia a VisibilityOff
- [ ] La fila se vuelve semi-transparente (opacity 0.6)
- [ ] La categoría desaparece de la tabla si el switch "Mostrar inactivas" está OFF

### 4.2 Activar Categoría
- [ ] Activar el switch "Mostrar categorías inactivas"
- [ ] Hacer click en el chip "Inactiva" de una categoría
- [ ] Se muestra notificación: "Categoría activada exitosamente"
- [ ] El chip cambia a "Activa" (verde, filled)
- [ ] El icono cambia a Visibility
- [ ] La fila vuelve a opacidad normal
- [ ] La categoría permanece visible

### 4.3 Toggle con Asociaciones
- [ ] Desactivar una categoría que tiene socios asignados
- [ ] Debe funcionar (soft delete, no hard delete)
- [ ] Los socios mantienen la categoría asignada
- [ ] La categoría desactivada NO aparece en CategoriaSelect por defecto

---

## 5. TESTING DE ELIMINACIÓN (DELETE)

### 5.1 Categoría Sin Asociaciones
- [ ] Identificar una categoría sin socios ni cuotas (contadores en 0)
- [ ] El botón de eliminar está habilitado
- [ ] Hacer click en el icono de eliminar (basura)
- [ ] Se abre dialog de confirmación
- [ ] El título es "Confirmar Eliminación"
- [ ] El mensaje muestra el nombre de la categoría
- [ ] Hacer click en "Cancelar" → dialog se cierra, nada cambia
- [ ] Hacer click en "Eliminar" → se elimina
- [ ] Se muestra notificación: "Categoría eliminada exitosamente"
- [ ] La categoría desaparece de la tabla

### 5.2 Categoría Con Socios
- [ ] Identificar una categoría con socios asignados (contador > 0)
- [ ] El botón de eliminar está DESHABILITADO (gris)
- [ ] El tooltip dice: "No se puede eliminar: tiene socios o cuotas asociadas"
- [ ] No es posible hacer click

### 5.3 Categoría Con Cuotas
- [ ] Identificar una categoría con cuotas generadas (contador > 0)
- [ ] El botón de eliminar está DESHABILITADO (gris)
- [ ] El tooltip dice: "No se puede eliminar: tiene socios o cuotas asociadas"
- [ ] No es posible hacer click

---

## 6. TESTING DE FILTROS

### 6.1 Switch "Mostrar Inactivas"
- [ ] Por defecto está OFF
- [ ] Solo se muestran categorías activas
- [ ] Activar el switch
- [ ] Se muestran también las categorías inactivas
- [ ] Las inactivas se ven con opacidad reducida
- [ ] El contador "Total: X categoría(s)" se actualiza correctamente

### 6.2 Ordenamiento
- [ ] Las categorías se muestran ordenadas por el campo "orden" (ascendente)
- [ ] El chip de "Orden" muestra el número correcto
- [ ] Si dos categorías tienen el mismo orden, se ordenan por ID

---

## 7. TESTING DE INTEGRACIÓN CON PERSONAS

### 7.1 Selector en Formulario de Persona
- [ ] Ir a la página "Personas"
- [ ] Hacer click en "Nueva Persona"
- [ ] Seleccionar tipo "SOCIO"
- [ ] Aparece el campo "Categoría de Socio *"
- [ ] Es un select (dropdown)
- [ ] Lista todas las categorías activas
- [ ] Cada opción muestra: Nombre | $Monto | Descripción
- [ ] Las categorías están ordenadas por orden
- [ ] No aparecen categorías inactivas

### 7.2 Crear Persona con Categoría
- [ ] Completar formulario de persona tipo SOCIO
- [ ] Seleccionar una categoría
- [ ] Guardar
- [ ] La persona se crea correctamente
- [ ] En la tabla de personas, la nueva persona muestra un badge de categoría

### 7.3 Badge en Tabla de Personas
- [ ] Ir a la tabla de personas
- [ ] Identificar una persona tipo SOCIO
- [ ] En la columna "Categoría" aparece un chip/badge
- [ ] El badge muestra el nombre de la categoría
- [ ] El badge tiene color distintivo según el código
- [ ] ACTIVO: azul (primary)
- [ ] ESTUDIANTE: celeste (info)
- [ ] FAMILIAR: púrpura (secondary)
- [ ] JUBILADO: verde (success)
- [ ] Otros: gris (default)
- [ ] Al hacer hover muestra tooltip con:
  - Código
  - Monto de cuota
  - Descuento (si tiene)

### 7.4 Personas No Socios
- [ ] Identificar persona tipo DOCENTE o ESTUDIANTE
- [ ] En la columna "Categoría" aparece un guión "-"
- [ ] No se muestra badge

### 7.5 Editar Categoría de Persona
- [ ] Editar una persona tipo SOCIO
- [ ] Cambiar la categoría seleccionada
- [ ] Guardar
- [ ] El badge en la tabla se actualiza correctamente

---

## 8. TESTING DE ESTADOS Y ERRORES

### 8.1 Estados de Carga
- [ ] Al cargar la página de categorías se muestra "Cargando categorías..."
- [ ] Durante la creación el botón muestra "Guardando..."
- [ ] Durante la actualización el botón muestra "Guardando..."
- [ ] Los campos se deshabilitan durante operaciones

### 8.2 Mensajes de Error
- [ ] Error de red: se muestra notificación roja
- [ ] Error de validación backend: se muestra en el formulario
- [ ] Error genérico: se muestra mensaje descriptivo

### 8.3 Sin Datos
- [ ] Si no hay categorías activas y el switch está OFF
- [ ] Se muestra Alert: "No hay categorías activas. Active el switch para ver las inactivas."
- [ ] Si no hay categorías en absoluto
- [ ] Se muestra Alert: "No hay categorías registradas en el sistema."

---

## 9. TESTING DE DATOS

### 9.1 Formato de Montos
- [ ] Los montos se muestran en formato: $10.000 (sin decimales)
- [ ] Separador de miles: punto (.)
- [ ] Símbolo de moneda: $ (peso argentino)

### 9.2 Formato de Descuentos
- [ ] Los descuentos se muestran en formato: 15%
- [ ] Si es 0%: se muestra guión "-"
- [ ] Si es mayor a 0: se muestra chip verde outlined

### 9.3 Formato de Fechas
- [ ] createdAt y updatedAt no se muestran en la tabla principal
- [ ] Si se implementa detalle, deben mostrarse en formato local

---

## 10. TESTING DE RESPONSIVIDAD

### 10.1 Desktop (1920x1080)
- [ ] La tabla se ve completa sin scroll horizontal
- [ ] Todos los elementos son legibles
- [ ] Los botones tienen tamaño adecuado

### 10.2 Tablet (768px)
- [ ] La tabla es scrolleable horizontalmente si es necesario
- [ ] El dialog ocupa la mayoría del ancho
- [ ] Los elementos son clickeables fácilmente

### 10.3 Mobile (375px)
- [ ] El dialog es fullwidth
- [ ] Los campos del formulario ocupan todo el ancho
- [ ] Los botones son fáciles de tocar

---

## 11. TESTING DE ACCESIBILIDAD

- [ ] Todos los botones tienen tooltips descriptivos
- [ ] Los campos de formulario tienen labels
- [ ] Los errores se asocian correctamente con los campos
- [ ] Los colores tienen suficiente contraste
- [ ] Los elementos interactivos tienen cursor pointer
- [ ] Los elementos deshabilitados tienen cursor not-allowed

---

## 12. TESTING DE EDGE CASES

### 12.1 Datos Extremos
- [ ] Crear categoría con descripción de 200 caracteres
- [ ] Crear categoría con código de 20 caracteres
- [ ] Crear categoría con nombre de 50 caracteres
- [ ] Crear categoría con monto de 1,000,000
- [ ] Crear categoría con descuento de 100%

### 12.2 Datos Especiales
- [ ] Nombre con acentos: "Categoría Especial"
- [ ] Nombre con ñ: "Año Nuevo"
- [ ] Código con múltiples guiones: "VIP_GOLD_PLUS"
- [ ] Monto con decimales: 1234.56

### 12.3 Concurrencia
- [ ] Dos usuarios editando la misma categoría
- [ ] Verificar que los cambios del último se reflejan
- [ ] Verificar que no hay errores de sincronización

---

## 13. TESTING DE MIGRACIÓN

### 13.1 Datos Migrados
- [ ] Verificar que existen exactamente 4 categorías base
- [ ] ACTIVO:
  - Código: ACTIVO
  - Monto > 0
  - Estado: Activa
  - Orden: 1
- [ ] ESTUDIANTE:
  - Código: ESTUDIANTE
  - Monto > 0
  - Estado: Activa
  - Orden: 2
- [ ] FAMILIAR:
  - Código: FAMILIAR
  - Monto > 0
  - Estado: Activa
  - Orden: 3
- [ ] JUBILADO:
  - Código: JUBILADO
  - Monto > 0
  - Estado: Activa
  - Orden: 4

### 13.2 Personas Migradas
- [ ] Personas que tenían categoria "ACTIVO" ahora tienen categoriaId correcto
- [ ] Personas que tenían categoria "ESTUDIANTE" ahora tienen categoriaId correcto
- [ ] Personas que tenían categoria "FAMILIAR" ahora tienen categoriaId correcto
- [ ] Personas que tenían categoria "JUBILADO" ahora tienen categoriaId correcto
- [ ] Todas muestran el badge correcto en la tabla

### 13.3 Cuotas Migradas
- [ ] Cuotas que tenían categoria "ACTIVO" ahora tienen categoriaId correcto
- [ ] Cuotas que tenían categoria "ESTUDIANTE" ahora tienen categoriaId correcto
- [ ] Cuotas que tenían categoria "FAMILIAR" ahora tienen categoriaId correcto
- [ ] Cuotas que tenían categoria "JUBILADO" ahora tienen categoriaId correcto

---

## 14. TESTING DE PERFORMANCE

- [ ] La carga inicial de categorías toma < 1 segundo
- [ ] La creación de categoría responde en < 2 segundos
- [ ] La actualización de categoría responde en < 2 segundos
- [ ] El toggle de estado responde en < 1 segundo
- [ ] La tabla con 50+ categorías se renderiza sin lag

---

## 15. TESTING DE REGRESIÓN

- [ ] La página de Personas sigue funcionando correctamente
- [ ] La creación de personas DOCENTE/ESTUDIANTE no cambió
- [ ] La página de Cuotas sigue funcionando correctamente
- [ ] La página de Actividades no se vio afectada
- [ ] El resto de las páginas no tienen errores de consola

---

## RESUMEN DE RESULTADOS

### Total de Tests: ~150

- ✅ Completados: ___
- ❌ Fallidos: ___
- ⏭️ Omitidos: ___
- ⏳ Pendientes: ___

### Errores Críticos Encontrados
1. ...
2. ...
3. ...

### Errores Menores Encontrados
1. ...
2. ...
3. ...

### Mejoras Sugeridas
1. ...
2. ...
3. ...

---

## APROBACIÓN FINAL

- [ ] Todos los tests críticos pasan
- [ ] No hay errores de consola
- [ ] No hay warnings de TypeScript
- [ ] El sistema está listo para producción

---

**Testeado por**: ___________________
**Fecha**: ___________________
**Firma**: ___________________
