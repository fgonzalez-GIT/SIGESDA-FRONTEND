# Plan de Testing Manual - SIGESDA Frontend
## Testing End-to-End - Fase 7

**Fecha:** 2025-11-04
**Estado:** Listo para ejecución
**Duración estimada:** 1.5 días

---

## 📋 INSTRUCCIONES GENERALES

### Requisitos Previos
- ✅ Backend corriendo en `http://localhost:8000`
- ✅ Frontend corriendo en `http://localhost:3003`
- ✅ Base de datos con datos de prueba
- ✅ Usuario admin autenticado

### Formato de Documentación de Resultados

Para cada escenario:
```
✅ PASS - Funciona correctamente
❌ FAIL - No funciona (documentar error)
⚠️  PARCIAL - Funciona con advertencias
```

---

## 🎯 FASE 7.1: Testing de Flujos de Actividades

### Escenario 1: Inscripción con cupo disponible

**SETUP:**
1. Crear/buscar actividad con:
   - `capacidadMaxima = 10`
   - `participantesActivos = 5`
   - Estado: ACTIVO

**PASOS:**
1. Ir a `/actividades/:id`
2. Hacer click en "Inscribir Participante(s)"
3. Buscar y seleccionar 3 personas
4. Verificar proyección de cupo: 5 → 8 (2 disponibles)
5. Click en "Inscribir 3 Persona(s)"

**RESULTADO ESPERADO:**
- ✅ Inscripción exitosa
- ✅ Modal se cierra
- ✅ Lista de participantes muestra 8 personas
- ✅ CupoIndicator muestra "2 cupos disponibles" (color warning)
- ✅ Redux: `cupoActual = 8`

**RESULTADO REAL:**
```
Estado: [ ]
Comentarios:


```

---

### Escenario 2: Validación de capacidad máxima

**SETUP:**
1. Actividad con `capacidadMaxima = 10`, `participantesActivos = 10`

**PASOS:**
1. Ir a `/actividades/:id`
2. Click en "Inscribir Participante(s)"
3. Intentar seleccionar 1 persona
4. Click en "Inscribir 1 Persona(s)"

**RESULTADO ESPERADO:**
- ❌ Error: "La actividad ha alcanzado su capacidad máxima"
- ❌ Error code: `CAPACIDAD_MAXIMA_ALCANZADA`
- ✅ No se permite la inscripción
- ✅ CupoIndicator muestra "Sin cupos" (color error)

**RESULTADO REAL:**
```
Estado: [ ]
Error recibido:


```

---

### Escenario 3: Validación de inscripción duplicada

**SETUP:**
1. Actividad con persona ID 5 ya inscripta

**PASOS:**
1. Ir a `/actividades/:id`
2. Click en "Inscribir Participante(s)"
3. Buscar persona ID 5 (ya inscripta)
4. Verificar si aparece en autocompletado
5. Si aparece, intentar inscribirla

**RESULTADO ESPERADO:**
- ✅ Persona ID 5 NO aparece en autocompletado (filtrada automáticamente)
- ❌ Si se intenta por API: Error "Esta persona ya está inscripta en la actividad"
- ❌ Error code: `YA_INSCRIPTO`

**RESULTADO REAL:**
```
Estado: [ ]
¿Persona filtrada correctamente?: [ ]


```

---

### Escenario 4: Actividad sin límite de cupos

**SETUP:**
1. Crear actividad con `capacidadMaxima = null`

**PASOS:**
1. Ir a `/actividades/:id`
2. Verificar CupoIndicator
3. Inscribir 10 personas
4. Verificar que todas se inscriban

**RESULTADO ESPERADO:**
- ✅ CupoIndicator muestra "Sin límite de cupos" (color info, variant outlined)
- ✅ Todas las inscripciones son exitosas
- ✅ No hay validación de capacidad

**RESULTADO REAL:**
```
Estado: [ ]
Cantidad inscripta exitosamente: [ ]


```

---

### Escenario 5: Asignar docente con rol

**SETUP:**
1. Actividad sin docentes asignados

**PASOS:**
1. Ir a `/actividades/:id`
2. Tab "Docentes"
3. Click en "Asignar Docente"
4. **Paso 1:** Buscar docente por nombre
5. Seleccionar un docente
6. Click en "Siguiente"
7. **Paso 2:** Seleccionar rol "PROFESOR"
8. Agregar observación: "Profesor titular"
9. Click en "Siguiente"
10. **Paso 3:** Verificar resumen
11. Click en "Asignar Docente"

**RESULTADO ESPERADO:**
- ✅ Modal de 3 pasos funciona correctamente
- ✅ Búsqueda filtra docentes en tiempo real
- ✅ Rol "PROFESOR" se asigna correctamente
- ✅ Observación se guarda
- ✅ DocentesTab muestra el docente con badge "Profesor"

**RESULTADO REAL:**
```
Estado: [ ]
¿Búsqueda funciona?: [ ]
¿3 pasos completos?: [ ]


```

---

### Escenario 6: Validación de docente duplicado

**SETUP:**
1. Actividad con docente ID 3 ya asignado

**PASOS:**
1. Tab "Docentes"
2. Click en "Asignar Docente"
3. Seleccionar docente ID 3 (ya asignado)
4. Completar flujo de asignación

**RESULTADO ESPERADO:**
- ❌ Error: "Este docente ya está asignado a la actividad"
- ❌ Error code: `DOCENTE_YA_ASIGNADO`
- ✅ No se duplica el docente

**RESULTADO REAL:**
```
Estado: [ ]
Error recibido:


```

---

### Escenario 7: Múltiples docentes con roles diferentes

**SETUP:**
1. Actividad sin docentes

**PASOS:**
1. Asignar Docente A con rol "PROFESOR"
2. Asignar Docente B con rol "AYUDANTE"
3. Asignar Docente C con rol "INVITADO"

**RESULTADO ESPERADO:**
- ✅ Los 3 docentes aparecen en DocentesTab
- ✅ Cada uno tiene su badge de rol correcto:
  - PROFESOR (badge primary)
  - AYUDANTE (badge secondary)
  - INVITADO (badge default)

**RESULTADO REAL:**
```
Estado: [ ]
Cantidad visible: [ ]
Badges correctos: [ ]


```

---

## 🎯 FASE 7.2: Testing de Flujos de Personas

### Escenario 8: Asignar tipo SOCIO

**SETUP:**
1. Persona sin tipos asignados

**PASOS:**
1. Ir a `/personas-v2/:id`
2. Tab "Tipos"
3. Click en "Asignar Tipo"
4. Seleccionar tipo "SOCIO"
5. Seleccionar categoría (ej: "Titular")
6. Click en "Asignar Tipo"

**RESULTADO ESPERADO:**
- ✅ Tipo SOCIO se asigna correctamente
- ✅ TipoItem muestra:
  - Badge "SOCIO" (color primary, ícono GroupIcon)
  - Categoría seleccionada
- ✅ Refetch automático tras asignación

**RESULTADO REAL:**
```
Estado: [ ]
Badge visible: [ ]
Categoría mostrada: [ ]


```

---

### Escenario 9: Asignar tipo DOCENTE

**SETUP:**
1. Persona con tipo SOCIO ya asignado

**PASOS:**
1. Tab "Tipos"
2. Click en "Asignar Tipo"
3. Seleccionar tipo "DOCENTE"
4. Seleccionar especialidad: "Piano"
5. Ingresar honorarios: 1500
6. Click en "Asignar Tipo"

**RESULTADO ESPERADO:**
- ✅ Persona ahora tiene 2 tipos: SOCIO y DOCENTE
- ✅ TipoItem DOCENTE muestra:
  - Badge "DOCENTE" (color success, ícono WorkIcon)
  - Especialidad: "Piano"
  - Honorarios: "$1.500,00" (formateado)

**RESULTADO REAL:**
```
Estado: [ ]
Cantidad de tipos: [ ]
Honorarios formateados: [ ]


```

---

### Escenario 10: Validación de exclusión mutua SOCIO/NO_SOCIO

**SETUP:**
1. Persona con tipo SOCIO asignado

**PASOS:**
1. Tab "Tipos"
2. Click en "Asignar Tipo"
3. Seleccionar tipo "NO_SOCIO"
4. Verificar warning en modal
5. Click en "Asignar Tipo"

**RESULTADO ESPERADO:**
- ⚠️  Modal muestra warning: "Al asignar tipo NO_SOCIO, se desasignará automáticamente el tipo SOCIO (son mutuamente excluyentes)"
- ✅ Al confirmar:
  - Tipo SOCIO se desasigna
  - Tipo NO_SOCIO se asigna
  - Persona tiene solo 1 tipo: NO_SOCIO

**RESULTADO REAL:**
```
Estado: [ ]
¿Warning visible?: [ ]
¿SOCIO desasignado?: [ ]


```

---

### Escenario 11: Asignar tipo PROVEEDOR con validación de CUIT

**SETUP:**
1. Persona sin tipos

**PASOS:**
1. Tab "Tipos"
2. Click en "Asignar Tipo"
3. Seleccionar tipo "PROVEEDOR"
4. Ingresar CUIT con guiones: "20-12345678-9"
5. Ingresar razón social: "Empresa Test SA"
6. Click en "Asignar Tipo"

**RESULTADO ESPERADO:**
- ✅ Backend recibe CUIT sin guiones: "20123456789"
- ✅ TipoItem muestra:
  - Razón Social: "Empresa Test SA"
  - CUIT: "20123456789"

**RESULTADO REAL:**
```
Estado: [ ]
CUIT limpio enviado al backend: [ ]


```

---

### Escenario 12: Validación de campos obligatorios

**SETUP:**
1. AsignarTipoModal abierto

**PASOS:**
1. Seleccionar tipo "SOCIO"
2. NO seleccionar categoría
3. Click en "Asignar Tipo"

**RESULTADO ESPERADO:**
- ❌ Error debajo del selector de categoría: "La categoría es obligatoria para tipo SOCIO"
- ✅ Botón "Asignar Tipo" debe estar deshabilitado o mostrar error
- ✅ No se permite submit

**RESULTADO REAL:**
```
Estado: [ ]
Error visible: [ ]


```

---

### Escenario 13: Toggle activo/inactivo de un tipo

**SETUP:**
1. Persona con tipo DOCENTE asignado y activo

**PASOS:**
1. Tab "Tipos"
2. En TipoItem DOCENTE, click en botón toggle (ToggleOnIcon)
3. Confirmar acción

**RESULTADO ESPERADO:**
- ✅ Tipo cambia a inactivo
- ✅ TipoItem muestra:
  - Badge "INACTIVO"
  - Opacidad reducida
  - Botón toggle ahora es ToggleOffIcon
- ✅ Refetch automático

**RESULTADO REAL:**
```
Estado: [ ]
Cambio visual: [ ]


```

---

### Escenario 14: Eliminar un tipo

**SETUP:**
1. Persona con tipo PROVEEDOR asignado

**PASOS:**
1. Tab "Tipos"
2. En TipoItem PROVEEDOR, click en botón eliminar (DeleteIcon)
3. Confirmar eliminación

**RESULTADO ESPERADO:**
- ⚠️  Confirmación: "¿Estás seguro de desasignar este tipo?"
- ✅ Tras confirmar:
  - Tipo se elimina
  - TipoItem desaparece de la lista
  - Contador actualiza: "Tipos Asignados (N-1)"
  - Refetch automático

**RESULTADO REAL:**
```
Estado: [ ]
Confirmación mostrada: [ ]


```

---

## 🎯 FASE 7.3: Testing de Flujos de Familiares

### Escenario 15: Agregar familiar con relación PADRE

**SETUP:**
1. Persona A (hijo) en `/personas-v2/:id`

**PASOS:**
1. Tab "Familiares"
2. Click en "Agregar Familiar"
3. Seleccionar persona B como familiar
4. Seleccionar relación "PADRE"
5. Marcar permisos:
   - ☑️ Autorizado Retiro
   - ☑️ Responsable Financiero
6. Agregar descripción: "Padre biológico"
7. Click en guardar

**RESULTADO ESPERADO:**
- ✅ Relación se crea exitosamente
- ✅ FamiliarCard muestra:
  - Nombre: B (apellido, nombre)
  - Badge "PADRE" (color primary)
  - Badge "Autorizado Retiro" (color success)
  - Badge "Responsable Financiero" (color warning)
  - Descripción visible
- ✅ Backend crea relación inversa automática (B tiene HIJO → A)

**RESULTADO REAL:**
```
Estado: [ ]
Badges visibles: [ ]


```

---

### Escenario 16: Validación de auto-referencia

**SETUP:**
1. Persona A en `/personas-v2/:id`

**PASOS:**
1. Tab "Familiares"
2. Click en "Agregar Familiar"
3. Buscar y seleccionar persona A (la misma)
4. Seleccionar cualquier relación
5. Intentar guardar

**RESULTADO ESPERADO:**
- ❌ Error: "Una persona no puede agregarse a sí misma como familiar"
- ❌ Error code: `AUTO_REFERENCIA`
- ✅ No se permite crear la relación

**RESULTADO REAL:**
```
Estado: [ ]
Error recibido:


```

---

### Escenario 17: Validación de relación duplicada

**SETUP:**
1. Persona A tiene a B como familiar (relación: MADRE)

**PASOS:**
1. Tab "Familiares"
2. Click en "Agregar Familiar"
3. Buscar y seleccionar persona B (ya es familiar)
4. Seleccionar relación "MADRE"
5. Intentar guardar

**RESULTADO ESPERADO:**
- ❌ Error: "Esta relación familiar ya existe"
- ❌ Error code: `RELACION_YA_EXISTE`
- ✅ No se duplica la relación

**RESULTADO REAL:**
```
Estado: [ ]
Error recibido:


```

---

### Escenario 18: Descuento familiar

**SETUP:**
1. Persona A (socio) sin familiares

**PASOS:**
1. Tab "Familiares"
2. Agregar familiar B (hijo)
3. Relación: "HIJO"
4. Ingresar descuento: 20%
5. Guardar

**RESULTADO ESPERADO:**
- ✅ FamiliarCard muestra:
  - Badge "20% Descuento" (color info, ícono MoneyIcon)
- ✅ Campo `porcentajeDescuento = 20` guardado correctamente

**RESULTADO REAL:**
```
Estado: [ ]
Badge de descuento visible: [ ]


```

---

### Escenario 19: Eliminar relación familiar

**SETUP:**
1. Persona A tiene familiar B (relación: HERMANO)

**PASOS:**
1. Tab "Familiares"
2. En FamiliarCard de B, click en botón eliminar
3. Confirmar eliminación

**RESULTADO ESPERADO:**
- ⚠️  Confirmación: "¿Está seguro de eliminar esta relación familiar?\n\nEsta acción no se puede deshacer."
- ✅ Tras confirmar:
  - Relación se elimina
  - FamiliarCard desaparece
  - Lista se actualiza (refetch)
  - Backend elimina ambas direcciones de la relación

**RESULTADO REAL:**
```
Estado: [ ]
Confirmación mostrada: [ ]
Relación inversa eliminada: [ ]


```

---

### Escenario 20: Tab Familiares vacío

**SETUP:**
1. Persona sin familiares

**PASOS:**
1. Ir a `/personas-v2/:id`
2. Tab "Familiares"
3. Observar estado vacío

**RESULTADO ESPERADO:**
- ✅ Muestra estado vacío con:
  - Ícono FamilyIcon grande (gris)
  - Texto: "No hay familiares registrados"
  - Subtexto: "{Nombre} {Apellido} no tiene familiares asociados..."
  - Borde punteado (dashed)
- ✅ Botón "Agregar Familiar" visible y funcional

**RESULTADO REAL:**
```
Estado: [ ]
UI de estado vacío correcta: [ ]


```

---

## 📊 RESUMEN DE RESULTADOS

### Actividades
- Total escenarios: 7
- ✅ PASS: [ ]
- ❌ FAIL: [ ]
- ⚠️  PARCIAL: [ ]

### Personas
- Total escenarios: 7
- ✅ PASS: [ ]
- ❌ FAIL: [ ]
- ⚠️  PARCIAL: [ ]

### Familiares
- Total escenarios: 6
- ✅ PASS: [ ]
- ❌ FAIL: [ ]
- ⚠️  PARCIAL: [ ]

### TOTAL GENERAL
- Total escenarios: 20
- ✅ PASS: [ ] (___%)
- ❌ FAIL: [ ] (___%)
- ⚠️  PARCIAL: [ ] (___%)

---

## 🐛 BUGS ENCONTRADOS

### Bug #1
**Título:**
**Severidad:** [ ] Critical [ ] High [ ] Medium [ ] Low
**Escenario:**
**Descripción:**
**Pasos para reproducir:**
**Comportamiento esperado:**
**Comportamiento actual:**

---

## ✅ CRITERIOS DE ACEPTACIÓN

Para considerar el testing COMPLETO:
- [ ] Al menos 80% de escenarios en PASS
- [ ] Todos los errores críticos documentados
- [ ] Validaciones de códigos de error funcionando
- [ ] Refetch automático funciona en todos los casos
- [ ] Confirmaciones antes de eliminar funcionan
- [ ] Badges y colores correctos en todos los componentes

---

## 📝 NOTAS ADICIONALES

**Tester:**
**Fecha de ejecución:**
**Versión del código:**
**Comentarios generales:**


---

**Última actualización:** 2025-11-04
