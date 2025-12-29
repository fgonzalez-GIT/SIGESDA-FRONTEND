# Fix: Actualización de Especialidad de Docente

**Fecha:** 2025-12-29
**Archivo afectado:** `src/components/personas/v2/PersonaFormV2.tsx`
**Línea modificada:** 177

---

## 🔴 Problema Identificado

Al intentar editar la **Especialidad** de una Persona con tipo **DOCENTE** desde el formulario de edición, la especialidad **NO se actualizaba** en la base de datos.

### Causa Raíz

El formulario `PersonaFormV2.tsx` **NO estaba incluyendo el campo `tipoPersonaId`** cuando cargaba los datos de una persona existente para editar (líneas 165-192).

Esto causaba que en `PersonasPage.tsx` (línea 119-120), el código no pudiera encontrar el registro correspondiente en la tabla `persona_tipo`:

```typescript
// ❌ CÓDIGO ANTES DEL FIX
const personaTipo = selectedPersona.tipos?.find(
  t => t.tipoPersonaId === tipoFormData.tipoPersonaId
  // ← tipoFormData.tipoPersonaId era undefined
);

if (personaTipo && personaTipo.id) {
  // Esta condición NUNCA se cumplía porque personaTipo era undefined
  await personasApi.actualizarTipo(selectedPersona.id, personaTipo.id, updateData);
}
```

Como resultado:
- ✅ Los campos demográficos (nombre, apellido, dni, etc.) **SÍ se actualizaban**
- ❌ Los campos específicos de tipo (especialidadId, categoriaId, etc.) **NO se actualizaban**

---

## ✅ Solución Implementada

### Cambio Realizado

**Archivo:** `src/components/personas/v2/PersonaFormV2.tsx`
**Línea:** 177

```typescript
// ❌ ANTES (líneas 175-178)
const tipo: any = {
  tipoPersonaCodigo: codigo,
};

// ✅ DESPUÉS (líneas 175-178)
const tipo: any = {
  tipoPersonaCodigo: codigo,
  tipoPersonaId: pt.tipoPersonaId, // ← FIX: Agregar tipoPersonaId
};
```

### Flujo Completo Corregido

1. **Cargar datos en formulario** (PersonaFormV2.tsx línea 165-193)
   ```typescript
   const tiposExistentes = persona.tipos?.map((pt) => {
     const tipo: any = {
       tipoPersonaCodigo: pt.tipoPersona.codigo,
       tipoPersonaId: pt.tipoPersonaId, // ← Ahora incluye el ID
     };

     if (pt.tipoPersona.codigo === 'DOCENTE') {
       tipo.especialidadId = pt.especialidadId;
       tipo.honorariosPorHora = pt.honorariosPorHora;
     }

     return tipo;
   });
   ```

2. **Enviar datos actualizados** (PersonasPage.tsx línea 105-205)
   ```typescript
   const handleFormSubmit = async (data: CreatePersonaDTO) => {
     // Separar datos
     const { contactos, tipos, ...personaData } = data;

     // Actualizar datos básicos
     await personasApi.update(selectedPersona.id, personaData);

     // Actualizar tipos específicos
     if (tipos && tipos.length > 0) {
       const updatePromises = tipos.map(async (tipoFormData) => {
         // Ahora SÍ encuentra el tipo porque tiene tipoPersonaId
         const personaTipo = selectedPersona.tipos?.find(
           t => t.tipoPersonaId === tipoFormData.tipoPersonaId
         );

         if (personaTipo && personaTipo.id) {
           const updateData: any = {};
           if (tipoFormData.especialidadId !== undefined) {
             updateData.especialidadId = tipoFormData.especialidadId;
           }

           // ✅ Ahora SÍ llama al endpoint correcto
           await personasApi.actualizarTipo(
             selectedPersona.id,
             personaTipo.id,
             updateData
           );
         }
       });

       await Promise.all(updatePromises);
     }
   };
   ```

3. **Llamada API correcta** (personasApi.ts línea 282-289)
   ```typescript
   actualizarTipo: async (
     personaId: number,
     tipoId: number,
     data: UpdatePersonaTipoDTO
   ): Promise<ApiResponse<PersonaTipo>> => {
     // ✅ Endpoint correcto: PUT /api/personas/:personaId/tipos/:tipoId
     const response = await api.put(
       `/personas/${personaId}/tipos/${tipoId}`,
       data
     );
     return response.data;
   }
   ```

---

## 🧪 Cómo Probar la Corrección

### Paso 1: Iniciar el frontend

```bash
cd /home/francisco/PROYECTOS/SIGESDA/SIGESDA-FRONTEND
npm run dev
```

### Paso 2: Editar una persona con tipo DOCENTE

1. Navegar a la página de Personas
2. Buscar una persona que tenga el tipo **DOCENTE** (ej: Brisa Vento, ID 24)
3. Hacer clic en el botón **Editar** (ícono de lápiz)
4. En el formulario de edición, cambiar la **Especialidad** del docente
5. Hacer clic en **Guardar**

### Paso 3: Verificar que se actualizó

#### Opción A: Desde el frontend
1. Recargar la página
2. Editar nuevamente la misma persona
3. Verificar que la especialidad muestra el valor actualizado

#### Opción B: Desde el backend (API directa)
```bash
curl -s http://localhost:8000/api/personas/24 | grep -o '"especialidad":{[^}]*}'
```

Debería mostrar:
```json
"especialidad":{
  "id": 7,
  "codigo": "VIOLIN",
  "nombre": "Violín",
  ...
}
```

### Paso 4: Verificar en DevTools (Network)

Abrir DevTools → Network → Filtrar por "personas/24/tipos"

Deberías ver una petición:
```
PUT http://localhost:8000/api/personas/24/tipos/27
```

Con payload:
```json
{
  "especialidadId": 7
}
```

Y response 200:
```json
{
  "success": true,
  "message": "Tipo de persona actualizado exitosamente",
  "data": {
    "id": 27,
    "especialidadId": 7,
    ...
  }
}
```

---

## 📊 Comparación: Antes vs Después

### ❌ Antes del Fix

**Request enviada:**
```http
PUT /api/personas/24
Content-Type: application/json

{
  "nombre": "Brisa",
  "apellido": "Vento",
  "dni": "33000111",
  "genero": "FEMENINO"
}
```

**Resultado:**
- ✅ Datos demográficos actualizados
- ❌ Especialidad NO actualizada (quedaba con el valor anterior)

---

### ✅ Después del Fix

**Requests enviadas (2 requests):**

1. Actualizar datos demográficos:
   ```http
   PUT /api/personas/24
   Content-Type: application/json

   {
     "nombre": "Brisa",
     "apellido": "Vento",
     "dni": "33000111",
     "genero": "FEMENINO"
   }
   ```

2. Actualizar especialidad (nuevo):
   ```http
   PUT /api/personas/24/tipos/27
   Content-Type: application/json

   {
     "especialidadId": 7
   }
   ```

**Resultado:**
- ✅ Datos demográficos actualizados
- ✅ Especialidad actualizada correctamente

---

## 🔍 Debugging

Si la actualización sigue sin funcionar, verificar:

### 1. Verificar que tipoPersonaId se carga en el formulario

Abrir DevTools → Console → Al editar una persona, ejecutar:

```javascript
// En el componente PersonaFormV2
console.log('Tipos cargados:', tiposExistentes);
```

Debería mostrar:
```javascript
[
  {
    tipoPersonaCodigo: "DOCENTE",
    tipoPersonaId: 5,        // ← Este campo DEBE existir
    especialidadId: 6,
    honorariosPorHora: 0
  },
  {
    tipoPersonaCodigo: "NO_SOCIO",
    tipoPersonaId: 6         // ← Este campo DEBE existir
  }
]
```

### 2. Verificar que se llama al endpoint correcto

Abrir DevTools → Network → Filtrar por "tipos"

Al guardar, deberías ver:
- ✅ `PUT /api/personas/24` (actualizar datos básicos)
- ✅ `PUT /api/personas/24/tipos/27` (actualizar tipo DOCENTE)
- ✅ `PUT /api/personas/24/tipos/26` (actualizar tipo NO_SOCIO, si cambió)

### 3. Verificar respuesta del backend

Si ves errores 404 o 500, revisar:
- Logs del backend: `npm run dev` (en terminal del backend)
- Verificar que las rutas estén montadas en `src/routes/index.ts`

---

## 📋 Checklist de Verificación

- [x] Archivo `PersonaFormV2.tsx` modificado (línea 177)
- [x] Cambio agregado: `tipoPersonaId: pt.tipoPersonaId`
- [ ] Frontend reiniciado (`npm run dev`)
- [ ] Backend corriendo (`npm run dev`)
- [ ] Probar actualización de especialidad
- [ ] Verificar en DevTools que se llama al endpoint correcto
- [ ] Verificar en base de datos que se actualizó

---

## 🎯 Resumen

**Archivo modificado:** `src/components/personas/v2/PersonaFormV2.tsx`
**Línea:** 177
**Cambio:** Agregar `tipoPersonaId: pt.tipoPersonaId` al objeto tipo
**Impacto:** Ahora se pueden actualizar campos específicos de tipos (especialidad, categoría, etc.)
**Breaking changes:** Ninguno
**Requiere migración:** No

El fix es **mínimo, no invasivo y retrocompatible**.
