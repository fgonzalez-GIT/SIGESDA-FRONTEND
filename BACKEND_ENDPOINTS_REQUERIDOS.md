# Endpoints Backend Requeridos - Manejo de Soft Delete (Personas)

## Contexto

El frontend ha sido actualizado para manejar correctamente el escenario de soft delete cuando se intenta crear una persona con un DNI que ya existe pero está marcado como inactivo. Este documento especifica los endpoints que el backend debe implementar para soportar esta funcionalidad.

---

## 1. Verificación de Existencia de DNI

### Endpoint
```
GET /api/personas/check-dni/:dni
```

### Descripción
Verifica si existe una persona con el DNI proporcionado en la base de datos, independientemente de su estado (activo/inactivo).

### Parámetros de URL
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `dni` | string | Sí | DNI a verificar (7-8 dígitos) |

### Ejemplo de Request
```http
GET /api/personas/check-dni/12345678
```

### Responses

#### Caso 1: DNI no existe
**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "exists": false,
    "persona": null,
    "isInactive": false
  }
}
```

#### Caso 2: DNI existe y está ACTIVO
**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "exists": true,
    "isInactive": false,
    "persona": {
      "id": 123,
      "nombre": "Juan",
      "apellido": "Pérez",
      "dni": "12345678",
      "email": "juan.perez@example.com",
      "telefono": "3511234567",
      "direccion": "Calle Falsa 123",
      "fechaNacimiento": "1990-05-15T00:00:00.000Z",
      "tipo": "SOCIO",
      "estado": "activo",
      "categoria": "ACTIVO",
      "fechaIngreso": "2023-01-10T00:00:00.000Z",
      "observaciones": "Socio regular",
      "createdAt": "2023-01-10T10:30:00.000Z",
      "updatedAt": "2023-01-10T10:30:00.000Z"
    }
  }
}
```

#### Caso 3: DNI existe y está INACTIVO (caso principal)
**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "exists": true,
    "isInactive": true,
    "persona": {
      "id": 456,
      "nombre": "María",
      "apellido": "González",
      "dni": "87654321",
      "email": "maria.gonzalez@example.com",
      "telefono": "3519876543",
      "direccion": "Av. Principal 456",
      "fechaNacimiento": "1985-08-20T00:00:00.000Z",
      "tipo": "DOCENTE",
      "estado": "inactivo",
      "fechaIngreso": "2020-03-15T00:00:00.000Z",
      "fechaBaja": "2024-12-01T00:00:00.000Z",
      "motivoBaja": "Mudanza a otra ciudad",
      "observaciones": "Ex docente",
      "createdAt": "2020-03-15T09:00:00.000Z",
      "updatedAt": "2024-12-01T14:30:00.000Z"
    }
  }
}
```

#### Caso 4: Error del servidor
**Status Code:** `500 Internal Server Error`

```json
{
  "success": false,
  "error": "Error al verificar DNI",
  "message": "Descripción detallada del error"
}
```

### Notas de Implementación
- **Búsqueda sin distinción de estado**: La consulta debe buscar en **todos** los registros, sin filtrar por `estado`.
- **Seguridad**: Validar que el DNI tenga formato válido (7-8 dígitos numéricos).
- **Performance**: Considerar indexar el campo `dni` si no lo está.
- **Query SQL ejemplo**:
  ```sql
  SELECT * FROM personas WHERE dni = :dni LIMIT 1;
  ```

---

## 2. Reactivación de Persona Inactiva

### Endpoint
```
PATCH /api/personas/:id/reactivate
```

### Descripción
Reactiva una persona que estaba marcada como inactiva, actualizando simultáneamente sus datos con la información proporcionada en el body.

### Parámetros de URL
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | number | Sí | ID de la persona a reactivar |

### Request Body
```typescript
{
  "nombre": "string",          // Requerido
  "apellido": "string",        // Requerido
  "dni": "string",             // Requerido (debe coincidir con el registro)
  "email": "string | null",    // Opcional
  "telefono": "string | null", // Opcional
  "direccion": "string | null",// Opcional
  "fechaNacimiento": "string | null", // ISO 8601
  "tipo": "SOCIO | NO_SOCIO | DOCENTE | ESTUDIANTE | PROVEEDOR", // Requerido
  "estado": "activo",          // Requerido (siempre 'activo')
  "categoria": "ACTIVO | ESTUDIANTE | FAMILIAR | JUBILADO | null", // Opcional
  "observaciones": "string | null" // Opcional
}
```

### Ejemplo de Request
```http
PATCH /api/personas/456/reactivate
Content-Type: application/json

{
  "nombre": "María",
  "apellido": "González",
  "dni": "87654321",
  "email": "maria.gonzalez.nueva@example.com",
  "telefono": "3519876543",
  "direccion": "Nueva Dirección 789",
  "fechaNacimiento": "1985-08-20T00:00:00.000Z",
  "tipo": "DOCENTE",
  "estado": "activo",
  "observaciones": "Reingreso como docente"
}
```

### Responses

#### Caso 1: Reactivación exitosa
**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 456,
    "nombre": "María",
    "apellido": "González",
    "dni": "87654321",
    "email": "maria.gonzalez.nueva@example.com",
    "telefono": "3519876543",
    "direccion": "Nueva Dirección 789",
    "fechaNacimiento": "1985-08-20T00:00:00.000Z",
    "tipo": "DOCENTE",
    "estado": "activo",
    "fechaIngreso": "2020-03-15T00:00:00.000Z",
    "fechaBaja": null,
    "motivoBaja": null,
    "observaciones": "Reingreso como docente",
    "createdAt": "2020-03-15T09:00:00.000Z",
    "updatedAt": "2025-01-15T11:45:00.000Z"
  },
  "message": "Persona reactivada exitosamente"
}
```

#### Caso 2: Persona no encontrada
**Status Code:** `404 Not Found`

```json
{
  "success": false,
  "error": "Persona no encontrada",
  "message": "No existe una persona con el ID proporcionado"
}
```

#### Caso 3: Persona ya está activa
**Status Code:** `400 Bad Request`

```json
{
  "success": false,
  "error": "Persona ya está activa",
  "message": "La persona con ID 456 ya tiene estado activo"
}
```

#### Caso 4: Validación fallida
**Status Code:** `400 Bad Request`

```json
{
  "success": false,
  "error": "Validación fallida",
  "message": "El campo 'nombre' es requerido",
  "validationErrors": {
    "nombre": ["El nombre es requerido"],
    "tipo": ["El tipo debe ser uno de: SOCIO, NO_SOCIO, DOCENTE, ESTUDIANTE, PROVEEDOR"]
  }
}
```

#### Caso 5: Error del servidor
**Status Code:** `500 Internal Server Error`

```json
{
  "success": false,
  "error": "Error al reactivar persona",
  "message": "Descripción detallada del error"
}
```

### Lógica de Negocio

#### 1. Validaciones
- Verificar que la persona con `id` exista en la base de datos
- Verificar que la persona esté actualmente en estado `inactivo`
- Validar todos los campos requeridos según el modelo Persona
- Validar formato de email (si se proporciona)
- Validar formato de DNI (7-8 dígitos)
- Si `tipo === 'SOCIO'`, validar que `categoria` esté presente

#### 2. Operaciones a Realizar
1. Actualizar el registro con los nuevos datos proporcionados
2. Establecer `estado = 'activo'`
3. Limpiar campos de baja:
   - `fechaBaja = null`
   - `motivoBaja = null`
4. **IMPORTANTE**: Si el tipo cambió a `SOCIO` y no tenía `fechaIngreso`, establecer fecha actual
5. Actualizar `updatedAt` con timestamp actual
6. Retornar el registro actualizado completo

#### 3. Query SQL de Ejemplo
```sql
UPDATE personas
SET
  nombre = :nombre,
  apellido = :apellido,
  email = :email,
  telefono = :telefono,
  direccion = :direccion,
  fechaNacimiento = :fechaNacimiento,
  tipo = :tipo,
  estado = 'activo',
  categoria = :categoria,
  observaciones = :observaciones,
  fechaBaja = NULL,
  motivoBaja = NULL,
  updatedAt = NOW()
WHERE id = :id AND estado = 'inactivo'
RETURNING *;
```

---

## 3. Mejora en el Endpoint de Creación (Opcional pero Recomendado)

### Endpoint Existente
```
POST /api/personas
```

### Mejora Sugerida: Respuesta 409 más descriptiva

Cuando se intente crear una persona con DNI duplicado, mejorar la respuesta para indicar si es un conflicto con registro activo o inactivo.

#### Response Actual (mantener compatibilidad)
**Status Code:** `409 Conflict`

```json
{
  "success": false,
  "error": "DNI duplicado",
  "message": "Ya existe una persona con el DNI 12345678"
}
```

#### Response Mejorada (opcional)
**Status Code:** `409 Conflict`

```json
{
  "success": false,
  "error": "DNI_DUPLICADO",
  "message": "Ya existe una persona con el DNI 12345678",
  "details": {
    "dni": "12345678",
    "existingPersonId": 123,
    "existingPersonState": "activo",
    "canReactivate": false
  }
}
```

O en caso de persona inactiva:

```json
{
  "success": false,
  "error": "DNI_DUPLICADO",
  "message": "Ya existe una persona inactiva con el DNI 87654321",
  "details": {
    "dni": "87654321",
    "existingPersonId": 456,
    "existingPersonState": "inactivo",
    "canReactivate": true
  }
}
```

---

## 4. Testing del Backend

### Test Cases Requeridos

#### Endpoint: GET /personas/check-dni/:dni

| # | Escenario | DNI | Estado Esperado | Response |
|---|-----------|-----|-----------------|----------|
| 1 | DNI no existe | 99999999 | 200 OK | `exists: false` |
| 2 | DNI existe activo | 12345678 | 200 OK | `exists: true, isInactive: false` |
| 3 | DNI existe inactivo | 87654321 | 200 OK | `exists: true, isInactive: true` |
| 4 | DNI con formato inválido | ABC123 | 400 Bad Request | Error de validación |
| 5 | DNI vacío | - | 400 Bad Request | Error de validación |

#### Endpoint: PATCH /personas/:id/reactivate

| # | Escenario | Pre-condición | Payload | Status Esperado | Resultado |
|---|-----------|---------------|---------|-----------------|-----------|
| 1 | Reactivación exitosa | Persona inactiva existe | Datos válidos | 200 OK | Persona reactivada con datos actualizados |
| 2 | Persona no existe | ID no existe en DB | Datos válidos | 404 Not Found | Error |
| 3 | Persona ya activa | Persona con estado activo | Datos válidos | 400 Bad Request | Error indicando que ya está activa |
| 4 | Datos inválidos | Persona inactiva existe | Nombre vacío | 400 Bad Request | Errores de validación |
| 5 | DNI no coincide | Persona inactiva existe | DNI diferente al registro | 400 Bad Request | Error de validación |
| 6 | Tipo SOCIO sin categoría | Persona inactiva existe | tipo: SOCIO, categoria: null | 400 Bad Request | Error de validación |

---

## 5. Modelo de Datos Esperado

### Interfaz TypeScript (Referencia)

```typescript
interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  fechaNacimiento?: string | null; // ISO 8601
  tipo: 'SOCIO' | 'NO_SOCIO' | 'DOCENTE' | 'ESTUDIANTE' | 'PROVEEDOR';
  estado: 'activo' | 'inactivo';
  fechaIngreso?: string | null; // ISO 8601
  numeroSocio?: number | null;
  categoria?: 'ACTIVO' | 'ESTUDIANTE' | 'FAMILIAR' | 'JUBILADO' | null;
  fechaBaja?: string | null; // ISO 8601
  motivoBaja?: string | null;
  especialidad?: string | null;
  honorariosPorHora?: string | null;
  cuit?: string | null;
  razonSocial?: string | null;
  observaciones?: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

---

## 6. Consideraciones de Seguridad

1. **Validación de Entrada**: Sanitizar todos los inputs para prevenir inyección SQL
2. **Rate Limiting**: Considerar limitar consultas al endpoint `check-dni` para prevenir enumeración de DNIs
3. **Autorización**: Verificar que el usuario tenga permisos para consultar y reactivar personas
4. **Logging**: Registrar todas las reactivaciones para auditoría
5. **Transacciones**: Usar transacciones para la reactivación para asegurar atomicidad

---

## 7. Ejemplo de Implementación (Node.js + Express + TypeScript)

### GET /personas/check-dni/:dni

```typescript
router.get('/personas/check-dni/:dni', async (req, res) => {
  try {
    const { dni } = req.params;

    // Validar formato de DNI
    if (!/^\d{7,8}$/.test(dni)) {
      return res.status(400).json({
        success: false,
        error: 'DNI inválido',
        message: 'El DNI debe contener entre 7 y 8 dígitos numéricos'
      });
    }

    // Buscar persona con ese DNI (sin filtrar por estado)
    const persona = await Persona.findOne({
      where: { dni }
    });

    if (!persona) {
      return res.json({
        success: true,
        data: {
          exists: false,
          persona: null,
          isInactive: false
        }
      });
    }

    return res.json({
      success: true,
      data: {
        exists: true,
        isInactive: persona.estado === 'inactivo',
        persona: persona.toJSON()
      }
    });

  } catch (error) {
    console.error('Error al verificar DNI:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al verificar DNI',
      message: error.message
    });
  }
});
```

### PATCH /personas/:id/reactivate

```typescript
router.patch('/personas/:id/reactivate', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const personaData = req.body;

    // Buscar persona
    const persona = await Persona.findByPk(id, { transaction });

    if (!persona) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Persona no encontrada',
        message: `No existe una persona con el ID ${id}`
      });
    }

    // Verificar que esté inactiva
    if (persona.estado === 'activo') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Persona ya está activa',
        message: `La persona con ID ${id} ya tiene estado activo`
      });
    }

    // Validar datos requeridos
    if (!personaData.nombre || !personaData.apellido || !personaData.dni || !personaData.tipo) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        message: 'Faltan campos requeridos'
      });
    }

    // Validar que el DNI coincida
    if (personaData.dni !== persona.dni) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        message: 'El DNI no coincide con el registro'
      });
    }

    // Actualizar datos
    await persona.update({
      ...personaData,
      estado: 'activo',
      fechaBaja: null,
      motivoBaja: null,
      updatedAt: new Date()
    }, { transaction });

    await transaction.commit();

    return res.json({
      success: true,
      data: persona.toJSON(),
      message: 'Persona reactivada exitosamente'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al reactivar persona:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al reactivar persona',
      message: error.message
    });
  }
});
```

---

## 8. Cronograma Sugerido

| Tarea | Estimación | Prioridad |
|-------|------------|-----------|
| Implementar GET /check-dni/:dni | 2 horas | Alta |
| Implementar PATCH /:id/reactivate | 3 horas | Alta |
| Tests unitarios | 2 horas | Alta |
| Tests de integración | 2 horas | Media |
| Documentación API | 1 hora | Media |
| Code review y ajustes | 1 hora | Alta |
| **TOTAL** | **11 horas** | |

---

## 9. Checklist de Implementación

- [ ] Endpoint GET /check-dni/:dni implementado
- [ ] Endpoint PATCH /:id/reactivate implementado
- [ ] Validaciones de entrada implementadas
- [ ] Manejo de errores robusto
- [ ] Tests unitarios escritos y pasando
- [ ] Tests de integración escritos y pasando
- [ ] Logging de auditoría implementado
- [ ] Documentación de API actualizada
- [ ] Code review completado
- [ ] Deploy a staging para testing con frontend
- [ ] Validación end-to-end con equipo frontend

---

## 10. Contacto y Soporte

Si tienen dudas sobre la implementación de estos endpoints o necesitan clarificaciones, pueden contactar al equipo de frontend:

- **Desarrollador Frontend**: [Nombre]
- **Canal de Slack**: #equipo-frontend
- **Documentación adicional**: Ver archivo `PLAN_IMPLEMENTACION_SECCIONES.md` en el repositorio

---

**Fecha de creación**: 2025-01-15
**Versión**: 1.0
**Autor**: Equipo Frontend - SIGESDA
