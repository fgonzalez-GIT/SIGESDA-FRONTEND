# 📘 GUÍA: Cómo Acceder a Datos de Personas V2

**Versión:** 2.0
**Fecha:** 30 de Octubre de 2025
**Estado:** ✅ Implementado

---

## 🎯 Resumen Ejecutivo

En la **versión 2 del módulo Personas**, los datos específicos de cada tipo (SOCIO, DOCENTE, PROVEEDOR) ya **NO están en campos directos** de la entidad `Persona`.

Ahora están dentro del **array `tipos[]`**, lo que permite que una persona tenga **múltiples tipos simultáneamente**.

---

## ❌ FORMA INCORRECTA (V1 - DEPRECADA)

```typescript
// ❌ INCORRECTO - Estos campos ya no existen o están en null
const numeroSocio = persona.numeroSocio;           // null
const categoria = persona.categoria;               // null
const especialidad = persona.especialidad;         // null
const honorarios = persona.honorariosPorHora;      // null
const cuit = persona.cuit;                         // null
const razonSocial = persona.razonSocial;           // null
```

---

## ✅ FORMA CORRECTA (V2 - ACTUAL)

### 1. Acceso Directo al Array `tipos[]`

```typescript
// Obtener el tipo SOCIO de una persona
const tipoSocio = persona.tipos?.find(
  t => t.tipoPersonaCodigo === 'SOCIO' && t.activo
);

// Acceder a sus datos
const numeroSocio = tipoSocio?.numeroSocio;           // 103
const categoria = tipoSocio?.categoria?.nombre;       // "Socio Vitalicio"
const categoriaId = tipoSocio?.categoriaId;           // "18"
const fechaIngreso = tipoSocio?.fechaIngreso;         // "2025-10-30"
```

### 2. Usando Helpers (RECOMENDADO)

El sistema provee **helpers** para acceder a estos datos de forma más limpia:

```typescript
import {
  getNumeroSocio,
  getCategoriaSocio,
  getEspecialidadDocente,
  getHonorariosPorHora,
  getCuitProveedor,
  getRazonSocialProveedor,
  personaTieneTipo,
  getTiposActivos,
} from '@/types/persona.types';

// Verificar si tiene un tipo
const esSocio = personaTieneTipo(persona, 'SOCIO');           // true/false
const esDocente = personaTieneTipo(persona, 'DOCENTE');       // true/false

// Obtener datos de SOCIO
const numeroSocio = getNumeroSocio(persona);                  // 103 | null
const categoria = getCategoriaSocio(persona);                 // CategoriaSocio | null

// Obtener datos de DOCENTE
const especialidad = getEspecialidadDocente(persona);         // EspecialidadDocente | null
const honorarios = getHonorariosPorHora(persona);             // 5000 | null

// Obtener datos de PROVEEDOR
const cuit = getCuitProveedor(persona);                       // "27901234564" | null
const razonSocial = getRazonSocialProveedor(persona);         // "Empresa SRL" | null

// Obtener todos los tipos activos
const tiposActivos = getTiposActivos(persona);                // PersonaTipo[]
```

---

## 📊 ESTRUCTURA DEL RESPONSE DEL BACKEND

### Response Completo

```json
{
  "success": true,
  "data": [
    {
      "id": 28,
      "nombre": "Lucía",
      "apellido": "Fernández",
      "dni": "90123456",
      "email": null,
      "telefono": null,

      // ⚠️ CAMPOS LEGACY - DEPRECADOS (siempre en null)
      "tipo": null,
      "numeroSocio": null,
      "categoria": null,
      "especialidad": null,
      "honorariosPorHora": null,
      "cuit": null,
      "razonSocial": null,

      // ✅ DATOS REALES - AQUÍ ESTÁN LOS VALORES
      "tipos": [
        {
          "id": 40,
          "personaId": 28,
          "tipoPersonaId": 3,
          "tipoPersonaCodigo": "SOCIO",
          "activo": true,
          "categoriaId": "18",
          "numeroSocio": 103,
          "fechaIngreso": "2025-10-30",
          "tipoPersona": {
            "id": 3,
            "codigo": "SOCIO",
            "nombre": "Socio"
          },
          "categoria": {
            "id": "18",
            "codigo": "VITALICIO",
            "nombre": "Socio Vitalicio"
          }
        },
        {
          "id": 41,
          "personaId": 28,
          "tipoPersonaId": 5,
          "tipoPersonaCodigo": "PROVEEDOR",
          "activo": true,
          "cuit": "27901234564",
          "razonSocial": "Lucía Fernández - Servicios Musicales",
          "tipoPersona": {
            "id": 5,
            "codigo": "PROVEEDOR",
            "nombre": "Proveedor"
          }
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 13,
    "totalPages": 1
  }
}
```

---

## 🔍 EJEMPLOS POR ESCENARIO

### Escenario 1: Mostrar Número de Socio en una Tabla

```tsx
// ❌ INCORRECTO
<TableCell>{persona.numeroSocio}</TableCell>  // null

// ✅ CORRECTO (opción 1 - manual)
<TableCell>
  {persona.tipos?.find(t => t.tipoPersonaCodigo === 'SOCIO')?.numeroSocio || '-'}
</TableCell>

// ✅ CORRECTO (opción 2 - con helper - RECOMENDADO)
import { getNumeroSocio } from '@/types/persona.types';

<TableCell>{getNumeroSocio(persona) || '-'}</TableCell>
```

### Escenario 2: Mostrar Categoría de Socio

```tsx
// ❌ INCORRECTO
<Chip label={persona.categoria?.nombre} />  // null

// ✅ CORRECTO (opción 1 - manual)
<Chip
  label={
    persona.tipos
      ?.find(t => t.tipoPersonaCodigo === 'SOCIO')
      ?.categoria?.nombre || 'Sin categoría'
  }
/>

// ✅ CORRECTO (opción 2 - con helper - RECOMENDADO)
import { getCategoriaSocio } from '@/types/persona.types';

<Chip label={getCategoriaSocio(persona)?.nombre || 'Sin categoría'} />
```

### Escenario 3: Mostrar Tipos de una Persona

```tsx
// Mostrar todos los tipos activos
import { getTiposActivos } from '@/types/persona.types';

const TiposColumn = ({ persona }: { persona: Persona }) => {
  const tiposActivos = getTiposActivos(persona);

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {tiposActivos.map(tipo => (
        <Chip
          key={tipo.id}
          label={tipo.tipoPersona?.nombre}
          size="small"
          color={getTipoColor(tipo.tipoPersonaCodigo)}
        />
      ))}
    </Box>
  );
};
```

### Escenario 4: Filtrar Personas por Tipo

```tsx
// Obtener solo las personas que son SOCIOS
import { personaTieneTipo } from '@/types/persona.types';

const socios = personas.filter(p => personaTieneTipo(p, 'SOCIO'));

// Obtener solo las personas que son SOCIOS Y DOCENTES
const sociosDocentes = personas.filter(p =>
  personaTieneTipo(p, 'SOCIO') && personaTieneTipo(p, 'DOCENTE')
);
```

### Escenario 5: Formulario de Edición

```tsx
import { getTipoSocio, getTipoDocente } from '@/types/persona.types';

const EditPersonaForm = ({ persona }: { persona: Persona }) => {
  const tipoSocio = getTipoSocio(persona);
  const tipoDocente = getTipoDocente(persona);

  // Pre-llenar formulario con datos del tipo SOCIO
  const [categoriaId, setCategoriaId] = useState(tipoSocio?.categoriaId || '');
  const [numeroSocio, setNumeroSocio] = useState(tipoSocio?.numeroSocio || '');

  // Pre-llenar formulario con datos del tipo DOCENTE
  const [especialidadId, setEspecialidadId] = useState(
    tipoDocente?.especialidadId || ''
  );
  const [honorarios, setHonorarios] = useState(
    tipoDocente?.honorariosPorHora || 0
  );

  return (
    <form>
      {tipoSocio && (
        <>
          <TextField
            label="Número de Socio"
            value={numeroSocio}
            disabled
          />
          <Select
            label="Categoría"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            {/* opciones */}
          </Select>
        </>
      )}

      {tipoDocente && (
        <>
          <Select
            label="Especialidad"
            value={especialidadId}
            onChange={(e) => setEspecialidadId(e.target.value)}
          >
            {/* opciones */}
          </Select>
          <TextField
            label="Honorarios por Hora"
            type="number"
            value={honorarios}
            onChange={(e) => setHonorarios(Number(e.target.value))}
          />
        </>
      )}
    </form>
  );
};
```

---

## 🚀 HOOKS DISPONIBLES

### `usePersonas` - IMPORTANTE: Incluye `tipos[]` automáticamente

```typescript
import { usePersonas } from '@/hooks/usePersonas';

const { personas, loading, pagination } = usePersonas({
  page: 1,
  limit: 20,
  // ✅ Ya NO es necesario especificar includeTipos: true
  // El hook lo hace automáticamente por defecto
});

// Las personas vienen con tipos[] poblado
personas.forEach(p => {
  console.log(p.tipos); // Array con los tipos asignados
});
```

### `usePersona` - Obtener una persona con sus tipos

```typescript
import { usePersona } from '@/hooks/usePersonas';

const { persona, loading } = usePersona(personaId);

// La persona viene con tipos[] y contactos[]
if (persona) {
  console.log(persona.tipos);     // PersonaTipo[]
  console.log(persona.contactos); // Contacto[]
}
```

---

## 📋 CHECKLIST DE MIGRACIÓN

Si tienes código legacy que accede a campos deprecados:

- [ ] Reemplazar `persona.numeroSocio` → `getNumeroSocio(persona)`
- [ ] Reemplazar `persona.categoria` → `getCategoriaSocio(persona)`
- [ ] Reemplazar `persona.especialidad` → `getEspecialidadDocente(persona)`
- [ ] Reemplazar `persona.honorariosPorHora` → `getHonorariosPorHora(persona)`
- [ ] Reemplazar `persona.cuit` → `getCuitProveedor(persona)`
- [ ] Reemplazar `persona.razonSocial` → `getRazonSocialProveedor(persona)`
- [ ] Importar helpers desde `@/types/persona.types`
- [ ] Verificar que `usePersonas()` carga datos correctamente (debería por defecto)

---

## 🛠️ HELPERS DISPONIBLES

### Verificación de Tipos

```typescript
personaTieneTipo(persona: Persona, codigoTipo: string): boolean
getTiposActivos(persona: Persona): PersonaTipo[]
getCodigosTiposActivos(persona: Persona): string[]
```

### Acceso a Tipos Específicos

```typescript
getTipoSocio(persona: Persona): PersonaTipo | null
getTipoDocente(persona: Persona): PersonaTipo | null
getTipoProveedor(persona: Persona): PersonaTipo | null
```

### Datos de SOCIO

```typescript
getNumeroSocio(persona: Persona): number | null
getCategoriaSocio(persona: Persona): CategoriaSocio | null
```

### Datos de DOCENTE

```typescript
getEspecialidadDocente(persona: Persona): EspecialidadDocente | null
getHonorariosPorHora(persona: Persona): number | null
```

### Datos de PROVEEDOR

```typescript
getCuitProveedor(persona: Persona): string | null
getRazonSocialProveedor(persona: Persona): string | null
```

### Contactos

```typescript
getContactoPrincipalPorTipo(persona: Persona, tipoContacto: string): Contacto | null
getEmailPrincipal(persona: Persona): string | null
getTelefonoPrincipal(persona: Persona): string | null
getCelularPrincipal(persona: Persona): string | null
getWhatsAppPrincipal(persona: Persona): string | null
```

### Utilidades

```typescript
getNombreCompleto(persona: Persona | CreatePersonaDTO): string
isValidCuit(cuit: string): boolean
isValidDni(dni: string): boolean
```

---

## ⚠️ ERRORES COMUNES

### Error 1: Los datos vienen en `null`

**Problema:**
```typescript
console.log(persona.numeroSocio); // null ❌
```

**Causa:** Accediendo a campos legacy/deprecados.

**Solución:**
```typescript
import { getNumeroSocio } from '@/types/persona.types';
console.log(getNumeroSocio(persona)); // 103 ✅
```

### Error 2: El array `tipos[]` está vacío

**Problema:**
```typescript
console.log(persona.tipos); // [] ❌
```

**Causa:** No se está enviando `includeTipos: true` en el request.

**Solución:** El hook `usePersonas` ya lo hace por defecto. Si usas el servicio directamente:

```typescript
const response = await personasApi.getAll({
  page: 1,
  limit: 20,
  includeTipos: true,  // ✅ CRÍTICO
});
```

### Error 3: TypeScript marca error en `persona.numeroSocio`

**Problema:**
```typescript
// Property 'numeroSocio' does not exist on type 'Persona'
const num = persona.numeroSocio; // ❌
```

**Causa:** Los campos legacy fueron removidos de los tipos TypeScript.

**Solución:** Usar helpers:
```typescript
import { getNumeroSocio } from '@/types/persona.types';
const num = getNumeroSocio(persona); // ✅
```

---

## 📞 SOPORTE

Si tienes dudas sobre cómo acceder a algún dato específico:

1. Revisa esta guía
2. Revisa los helpers en `src/types/persona.types.ts`
3. Revisa los tests en `src/types/__tests__/persona.types.test.ts`

---

## 📝 CHANGELOG

### Versión 2.0 (30 Oct 2025)
- ✅ Hook `usePersonas` ahora incluye `tipos[]` por defecto
- ✅ Agregados 10+ helpers para acceso a datos
- ✅ Documentación completa de migración
- ✅ Tests unitarios de helpers (29 tests passing)

---

**¿Necesitas ayuda?** Consulta los ejemplos en esta guía o los tests unitarios.
