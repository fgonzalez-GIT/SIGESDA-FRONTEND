# 🧪 Guía de Pruebas - Integración Actividades V2

## ✅ Estado de la Integración

**Fecha**: 16 de Octubre, 2025
**Estado**: ✅ COMPLETO Y LISTO PARA PRUEBAS
**Archivos integrados**: 15

---

## 🚀 Inicio Rápido (5 minutos)

### 1. Verificar Backend

```bash
# En el proyecto backend
npm run dev

# Verificar que responde:
curl http://localhost:8000/api/actividades/catalogos/todos
```

### 2. Iniciar Frontend

```bash
# En el proyecto frontend
npm run dev
```

### 3. Acceder a la Aplicación

Navega a: `http://localhost:5173`

El enlace "Actividades" en el sidebar ahora usa la nueva implementación V2.

---

## 📋 Plan de Pruebas

### Fase 1: Verificación Inicial (10 minutos)

#### 1.1 Carga de Catálogos
- [ ] La aplicación inicia sin errores
- [ ] Se muestra "Cargando catálogos del sistema..."
- [ ] Los catálogos cargan correctamente
- [ ] No hay errores en consola del navegador

**Qué verificar:**
- Abrir DevTools (F12)
- Tab Network: Buscar `GET /api/actividades/catalogos/todos`
- Debe responder `200 OK` con JSON

#### 1.2 Navegación
- [ ] Click en "Actividades" en el sidebar
- [ ] La página de listado carga correctamente
- [ ] Se muestra el contador de actividades

---

### Fase 2: Listado de Actividades (15 minutos)

#### 2.1 Vista Inicial
- [ ] Las actividades se muestran en tarjetas
- [ ] Cada tarjeta muestra:
  - Nombre de la actividad
  - Código
  - Badge de estado (color correcto)
  - Tipo y categoría
  - Horarios (primeros 2)
  - Cupo disponible
  - Costo
  - Botones de acción

#### 2.2 Filtros
- [ ] Mostrar/ocultar filtros funciona
- [ ] Filtro por búsqueda de texto funciona
- [ ] Filtro por tipo funciona
- [ ] Filtro por categoría funciona
- [ ] Filtro por día de semana funciona
- [ ] Checkbox "Con cupo disponible" funciona
- [ ] Checkbox "Solo vigentes" funciona
- [ ] Contador de filtros activos es correcto
- [ ] Botón "Limpiar filtros" resetea todo

**Prueba combinada:**
1. Aplicar filtro de tipo "Coro"
2. Agregar filtro de categoría "Adultos"
3. Marcar "Con cupo disponible"
4. Verificar que el contador muestra "3"
5. Verificar que las actividades mostradas cumplen los criterios
6. Click en "Limpiar filtros"
7. Verificar que todo se resetea

#### 2.3 Tabs de Estado
- [ ] Tab "Todas" muestra todas las actividades
- [ ] Tab "Activas" solo muestra activas
- [ ] Tab "Inactivas" solo muestra inactivas
- [ ] Tab "Finalizadas" solo muestra finalizadas
- [ ] Cambiar de tab resetea la página a 1

#### 2.4 Paginación
- [ ] Si hay más de 12 actividades, aparece paginación
- [ ] Botón "Siguiente" funciona
- [ ] Botón "Anterior" funciona
- [ ] Botones "Primera" y "Última" funcionan
- [ ] Número de página actual es correcto

#### 2.5 Cambio de Vista
- [ ] Toggle entre vista de tarjetas y lista funciona
- [ ] La vista seleccionada se mantiene al cambiar página

---

### Fase 3: Crear Nueva Actividad (20 minutos)

#### 3.1 Acceso al Formulario
- [ ] Click en "Nueva Actividad"
- [ ] Se muestra el formulario con stepper
- [ ] Step 1 está activo

#### 3.2 Step 1: Información Básica
- [ ] Campo "Código de Actividad" funciona
- [ ] El código se convierte a mayúsculas automáticamente
- [ ] Validación de código (solo mayúsculas, números, guiones)
- [ ] Campo "Nombre" funciona
- [ ] Select "Tipo" muestra todos los tipos del catálogo
- [ ] Select "Categoría" muestra todas las categorías
- [ ] Campo "Descripción" es opcional

**Probar validación:**
1. Dejar campos vacíos y click "Siguiente"
2. Verificar que aparecen mensajes de error
3. Completar campos correctamente
4. Click "Siguiente" debe avanzar al Step 2

#### 3.3 Step 2: Detalles
- [ ] DatePicker "Fecha de Inicio" funciona
- [ ] DatePicker "Fecha de Fin" es opcional
- [ ] Campo "Cupo Máximo" acepta solo números positivos
- [ ] Campo "Costo" acepta decimales
- [ ] Select "Estado" muestra todos los estados
- [ ] Campo "Observaciones" es opcional

**Probar validación:**
1. Fecha de inicio después de fecha de fin → Error
2. Cupo máximo negativo → Error
3. Costo negativo → Error
4. Valores válidos → Avanza al Step 3

#### 3.4 Step 3: Horarios
- [ ] Selector de día funciona
- [ ] TimePicker hora inicio funciona
- [ ] TimePicker hora fin funciona
- [ ] Botón "Agregar Horario" añade el horario
- [ ] Los horarios agregados se muestran en tarjetas
- [ ] Botón eliminar horario funciona
- [ ] Validación: debe haber al menos 1 horario

**Probar validación de horarios:**
1. Agregar horario con hora fin < hora inicio → Error
2. Agregar horario sin completar campos → Error
3. Agregar 2-3 horarios válidos → OK
4. Eliminar un horario → OK

#### 3.5 Guardar
- [ ] Click "Crear Actividad"
- [ ] Muestra "Guardando..."
- [ ] Si es exitoso:
  - Aparece mensaje de éxito
  - Redirige a página de detalle
- [ ] Si falla:
  - Muestra error descriptivo
  - Se mantiene en el formulario

**Datos de prueba:**
```
Código: TEST-CORO-2025
Nombre: Coro de Prueba
Tipo: Coro
Categoría: Adultos Mayores
Fecha Desde: [Hoy]
Cupo: 30
Costo: 0
Horarios:
  - Martes 10:00-12:00
  - Jueves 10:00-12:00
```

---

### Fase 4: Ver Detalle (15 minutos)

#### 4.1 Navegación
- [ ] Click en "Ver detalles" desde una tarjeta
- [ ] O navegar a actividad recién creada
- [ ] La página de detalle carga

#### 4.2 Información General
- [ ] Se muestra el nombre completo
- [ ] Badge de estado correcto
- [ ] Código visible
- [ ] Cards de Clasificación muestra tipo y categoría
- [ ] Card de Fechas muestra desde/hasta
- [ ] Card de Cupo muestra disponible/máximo
- [ ] Card de Costo muestra el valor
- [ ] Si hay descripción, se muestra

#### 4.3 Tab Horarios
- [ ] Click en tab "Horarios"
- [ ] Se muestran todos los horarios
- [ ] Cada horario muestra:
  - Chip con día de la semana
  - Hora inicio - Hora fin
  - Estado (activo/inactivo)
- [ ] Botón "Agregar Horario" visible

#### 4.4 Tab Docentes
- [ ] Click en tab "Docentes"
- [ ] Si hay docentes asignados, se muestran con:
  - Avatar
  - Nombre completo
  - Rol del docente
  - Observaciones (si las hay)
- [ ] Si no hay docentes, mensaje apropiado
- [ ] Botón "Asignar Docente" visible

#### 4.5 Tab Participantes
- [ ] Click en tab "Participantes"
- [ ] Si hay participantes, se muestran con:
  - Avatar
  - Nombre completo
  - Fecha de inscripción
  - Precio especial (si aplica)
- [ ] Si no hay participantes, mensaje apropiado
- [ ] Botón "Inscribir Participante" visible

#### 4.6 Acciones
- [ ] Botón "Volver" regresa al listado
- [ ] Botón "Editar" (ícono lápiz) abre formulario de edición
- [ ] Botón "Duplicar" (ícono copiar) abre diálogo de duplicación

---

### Fase 5: Editar Actividad (10 minutos)

#### 5.1 Acceso
- [ ] Desde detalle, click en ícono editar
- [ ] Se abre el formulario con datos pre-cargados
- [ ] Todos los campos tienen los valores actuales

#### 5.2 Modificación
- [ ] Cambiar nombre de la actividad
- [ ] Cambiar cupo máximo
- [ ] Modificar descripción
- [ ] Los horarios actuales se muestran
- [ ] Se pueden agregar nuevos horarios
- [ ] Click "Actualizar"

#### 5.3 Resultado
- [ ] Muestra "Guardando..."
- [ ] Si es exitoso:
  - Mensaje de éxito
  - Redirige a listado
  - Los cambios se reflejan inmediatamente

---

### Fase 6: Eliminar Actividad (5 minutos)

#### 6.1 Sin Participantes
- [ ] Desde listado, click en ícono eliminar (rojo)
- [ ] Aparece diálogo de confirmación
- [ ] Muestra el nombre de la actividad
- [ ] Click "Cancelar" → Cierra sin eliminar
- [ ] Click "Eliminar" → Procesa eliminación

#### 6.2 Con Participantes
- [ ] Intentar eliminar actividad con participantes
- [ ] El diálogo muestra alerta amarilla
- [ ] Indica número de participantes inscritos
- [ ] Permite continuar o cancelar

---

## 🐛 Casos de Error a Probar

### 1. Backend No Disponible
**Cómo probar:**
1. Detener el backend
2. Iniciar frontend
3. **Esperado**: Mensaje de error al cargar catálogos con botón "Reintentar"

### 2. Error de Red en Listado
**Cómo probar:**
1. Con backend corriendo, cargar listado
2. Detener backend
3. Aplicar filtros
4. **Esperado**: Alert rojo con mensaje de error

### 3. Código Duplicado
**Cómo probar:**
1. Crear actividad con código "TEST-001"
2. Intentar crear otra con mismo código
3. **Esperado**: Error 400 con mensaje "Código ya existe"

### 4. Horarios en Conflicto
**Cómo probar:**
1. Agregar horario: Lunes 10:00-12:00
2. Intentar agregar: Lunes 11:00-13:00 (se superpone)
3. **Esperado**: Error de validación (si backend lo valida)

---

## 📊 Checklist Final

### Funcionalidad
- [ ] Listado de actividades funciona
- [ ] Filtros funcionan correctamente
- [ ] Paginación funciona
- [ ] Crear actividad funciona
- [ ] Editar actividad funciona
- [ ] Eliminar actividad funciona
- [ ] Ver detalle funciona
- [ ] Navegación entre vistas funciona

### UI/UX
- [ ] Loading states visibles
- [ ] Mensajes de error claros
- [ ] Confirmaciones antes de eliminar
- [ ] Breadcrumbs/navegación clara
- [ ] Responsive (probar en móvil)
- [ ] Sin errores en consola

### Performance
- [ ] Carga inicial rápida (<3 segundos)
- [ ] Cambios de página fluidos
- [ ] Filtros responden rápido
- [ ] Sin memory leaks (DevTools → Memory)

### Integración
- [ ] API responde correctamente
- [ ] Datos se persisten correctamente
- [ ] Relaciones (horarios, docentes) funcionan
- [ ] Eliminaciones en cascada (si aplica)

---

## 🎯 Escenarios de Usuario

### Escenario 1: Usuario Nuevo
**Objetivo**: Crear primera actividad del sistema

1. Acceder al sistema
2. Click en "Actividades" (sidebar)
3. Página vacía o con pocas actividades
4. Click "Nueva Actividad"
5. Completar formulario paso a paso
6. Guardar y verificar que aparece en el listado

### Escenario 2: Gestión Diaria
**Objetivo**: Ver y actualizar actividades

1. Acceder a listado de actividades
2. Aplicar filtro: "Solo activas con cupo"
3. Revisar actividades
4. Click en una actividad para ver detalle
5. Verificar horarios y participantes
6. Editar cupo máximo
7. Guardar cambios

### Escenario 3: Planificación Semestral
**Objetivo**: Crear múltiples actividades similares

1. Crear actividad base
2. Ver detalle de la actividad creada
3. Click "Duplicar"
4. Modificar código y fechas
5. Guardar actividad duplicada
6. Repetir para todas las actividades necesarias

---

## 📝 Reporte de Bugs

Si encuentras un bug durante las pruebas, documenta:

1. **Descripción**: ¿Qué pasó?
2. **Pasos para reproducir**: Detallados
3. **Comportamiento esperado**: ¿Qué debería pasar?
4. **Comportamiento actual**: ¿Qué pasa realmente?
5. **Ambiente**:
   - Navegador y versión
   - Sistema operativo
   - URL de la página
6. **Screenshots/Logs**: Si es posible
7. **Severidad**:
   - 🔴 Crítico: Impide uso de funcionalidad principal
   - 🟡 Mayor: Afecta funcionalidad pero tiene workaround
   - 🟢 Menor: Problema cosmético o edge case

---

## ✅ Criterios de Aceptación

La integración se considera exitosa cuando:

- ✅ Todas las pruebas de las Fases 1-6 pasan
- ✅ No hay errores en consola del navegador
- ✅ No hay warnings de React
- ✅ La aplicación es responsiva
- ✅ Los tiempos de carga son aceptables
- ✅ Los datos se persisten correctamente
- ✅ Los errores se manejan apropiadamente

---

## 🎊 Siguiente Nivel

Una vez que las pruebas básicas pasen:

1. **Pruebas de Carga**: Crear 100+ actividades y verificar performance
2. **Pruebas de Concurrencia**: Múltiples usuarios simultáneos
3. **Pruebas de Accesibilidad**: Keyboard navigation, screen readers
4. **Pruebas de Seguridad**: Validaciones, sanitización de inputs
5. **Pruebas Cross-Browser**: Chrome, Firefox, Safari, Edge

---

**Preparado por**: Equipo de Desarrollo SIGESDA
**Fecha**: 16 de Octubre, 2025
**Versión**: 1.0
