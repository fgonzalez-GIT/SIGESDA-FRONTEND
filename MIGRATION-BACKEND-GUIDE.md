# Guía de Migración Backend - Personas V2

**Fecha:** 2025-10-28
**Proyecto:** SIGESDA
**Cambio:** Unificación de Personas V1 → Personas V2 (ahora Personas)

---

## 📋 Resumen Ejecutivo

El frontend ha migrado completamente de **Personas V1** (sistema simple con un tipo único por persona) a **Personas V2** (sistema avanzado con múltiples tipos por persona). Este documento detalla todos los cambios que el backend debe implementar para mantener compatibilidad.

## 🎯 Objetivo de la Migración

- ✅ **Eliminar:** Sistema antiguo de Personas V1
- ✅ **Consolidar:** Personas V2 como único sistema
- ✅ **Beneficios:** Personas con múltiples roles simultáneos (ej: SOCIO + DOCENTE)

---

## 🔄 Cambios Estructurales en el Frontend

### Rutas Antiguas → Nuevas

| Antigua (V1) | Nueva (Unificada) |
|--------------|-------------------|
| `/personas` | `/personas` |
| `/personas-v2` | `/personas` *(consolidado)* |
| `/personas-v2/:id` | `/personas/:id` |
| `/personas-v2/admin/*` | `/personas/admin/*` |

### Redux Store

**Antes:**
```typescript
state.personas      // V1 (ELIMINADO)
state.personasV2    // V2
```

**Ahora:**
```typescript
state.personas      // Único store (antiguo V2)
```

### Tipos TypeScript

**Archivos renombrados:**
- `personaV2.types.ts` → `persona.types.ts`
- `personasV2Api.ts` → `personasApi.ts`
- `personasV2Slice.ts` → `personasSlice.ts`

**Tipos principales:**
- `PersonaV2` → `Persona`
- `PersonasV2QueryParams` → `PersonasQueryParams`
- `CreatePersonaV2DTO` → `CreatePersonaDTO`

---

## 📡 API Endpoints Esperados por el Frontend

### 1. **GET /api/personas** - Listar Personas con Paginación

#### Request Query Parameters:
```typescript
interface PersonasQueryParams {
  // Paginación
  page?: number;              // Default: 1
  limit?: number;             // Default: 20, Max: 100

  // Filtros
  search?: string;            // Búsqueda en nombre, apellido, DNI
  tiposCodigos?: string[];    // ⚠️ CAMBIO: Array de tipos ['SOCIO', 'DOCENTE']
  estado?: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  categoriaId?: string;       // CUID para filtrar socios por categoría
  especialidadId?: number;    // Filtrar docentes por especialidad

  // Opciones de inclusión
  includeTipos?: boolean;     // Incluir tipos asignados (default: true)
  includeContactos?: boolean; // Incluir contactos (default: false)
  includeRelaciones?: boolean;// Incluir relaciones completas

  // Ordenamiento
  orderBy?: 'nombre' | 'apellido' | 'dni' | 'fechaIngreso' | 'createdAt';
  orderDir?: 'asc' | 'desc';
}
```

#### ⚠️ CAMBIO CRÍTICO: `tiposCodigos` reemplaza `tipo`

**Antes (V1):**
```
GET /api/personas?tipo=DOCENTE&estado=activo
```

**Ahora (V2):**
```
GET /api/personas?tiposCodigos[]=DOCENTE&estado=ACTIVO
```

O en formato JSON query:
```
GET /api/personas?tiposCodigos=DOCENTE&estado=ACTIVO
```

#### Response Esperado:
```typescript
{
  success: true,
  data: Persona[],        // Array de personas (ver estructura abajo)
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    pages: 8
  },
  message?: string
}
```

---

### 2. **GET /api/personas/:id** - Obtener Persona por ID

#### Query Parameters:
```typescript
{
  includeTipos?: boolean;      // Default: true
  includeContactos?: boolean;  // Default: true
  includeRelaciones?: boolean; // Default: true (incluye categoria, especialidad)
}
```

#### Response Esperado:
```typescript
{
  success: true,
  data: Persona,  // Objeto completo con tipos y contactos
  message?: string
}
```

---

### 3. **POST /api/personas** - Crear Persona

#### Request Body:
```typescript
interface CreatePersonaDTO {
  // Datos básicos (REQUERIDOS)
  nombre: string;
  apellido: string;
  dni: string;               // ÚNICO en BD

  // Datos opcionales
  email?: string;            // ÚNICO si se proporciona
  fechaNacimiento?: string;  // ISO 8601: "1990-05-15"
  telefono?: string;
  direccion?: string;

  // ⚠️ NUEVO: Array de tipos a asignar
  tipos?: CreatePersonaTipoDTO[];

  // ⚠️ NUEVO: Array de contactos adicionales
  contactos?: CreateContactoDTO[];
}

interface CreatePersonaTipoDTO {
  tipoPersonaCodigo: string;  // 'SOCIO' | 'DOCENTE' | 'ESTUDIANTE' | 'PROVEEDOR' | 'NO_SOCIO'

  // Campos específicos por tipo (opcionales según tipo)
  categoriaId?: string;       // Solo para SOCIO (CUID)
  numeroSocio?: number;       // Auto-generado para SOCIO (si no se proporciona)
  especialidadId?: number;    // Solo para DOCENTE
  honorariosPorHora?: number; // Solo para DOCENTE
  cuit?: string;              // Solo para PROVEEDOR (11 dígitos)
  razonSocial?: string;       // Solo para PROVEEDOR
}

interface CreateContactoDTO {
  tipoContactoId: number;     // FK a tipos_contacto
  valor: string;              // Número, email, username, URL
  descripcion?: string;
  esPrincipal: boolean;       // Solo uno puede ser principal por tipo
}
```

#### Ejemplo Request Body:
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678",
  "email": "juan@example.com",
  "fechaNacimiento": "1985-03-20",
  "tipos": [
    {
      "tipoPersonaCodigo": "SOCIO",
      "categoriaId": "clxyz123abc"
    },
    {
      "tipoPersonaCodigo": "DOCENTE",
      "especialidadId": 2,
      "honorariosPorHora": 5000
    }
  ],
  "contactos": [
    {
      "tipoContactoId": 1,
      "valor": "1234567890",
      "esPrincipal": true
    }
  ]
}
```

#### Response Esperado:
```typescript
{
  success: true,
  data: Persona,  // Persona creada con ID asignado
  message: "Persona creada exitosamente"
}
```

---

### 4. **PUT /api/personas/:id** - Actualizar Persona

#### Request Body:
```typescript
interface UpdatePersonaDTO {
  nombre?: string;
  apellido?: string;
  dni?: string;              // Validar unicidad
  email?: string;            // Validar unicidad
  fechaNacimiento?: string;
  telefono?: string;
  direccion?: string;
  estado?: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
}
```

**⚠️ NOTA:** Los tipos y contactos se gestionan mediante endpoints específicos (ver secciones 6 y 7).

---

### 5. **DELETE /api/personas/:id** - Eliminar Persona

#### Comportamiento Esperado:
- **Soft delete:** Cambiar estado a 'INACTIVO'
- **Validar:** No permitir si tiene relaciones activas (familiares, inscripciones)

#### Response:
```typescript
{
  success: true,
  message: "Persona eliminada exitosamente"
}
```

---

### 6. **Endpoints de Gestión de TIPOS** ⭐ NUEVO

#### 6.1. **GET /api/personas/:personaId/tipos**
Lista todos los tipos asignados a una persona.

**Response:**
```typescript
{
  success: true,
  data: PersonaTipo[]
}
```

#### 6.2. **POST /api/personas/:personaId/tipos**
Asigna un nuevo tipo a una persona.

**Request Body:**
```typescript
{
  tipoPersonaCodigo: string;
  categoriaId?: string;       // CUID para SOCIO
  numeroSocio?: number;       // Auto-generar si no se proporciona
  especialidadId?: number;    // Para DOCENTE
  honorariosPorHora?: number; // Para DOCENTE
  cuit?: string;              // Para PROVEEDOR
  razonSocial?: string;       // Para PROVEEDOR
}
```

**Validaciones:**
- ✅ No permitir duplicados (persona + tipo)
- ✅ Validar campos requeridos según tipo
- ✅ Auto-generar `numeroSocio` si es SOCIO

#### 6.3. **PUT /api/personas/:personaId/tipos/:tipoId**
Actualiza un tipo asignado.

#### 6.4. **DELETE /api/personas/:personaId/tipos/:tipoId**
Desasigna un tipo de una persona.

#### 6.5. **PATCH /api/personas/:personaId/tipos/:tipoId/toggle**
Activa/Desactiva un tipo sin eliminarlo.

---

### 7. **Endpoints de Gestión de CONTACTOS** ⭐ NUEVO

#### 7.1. **GET /api/personas/:personaId/contactos**

**Response:**
```typescript
{
  success: true,
  data: Contacto[]
}
```

#### 7.2. **POST /api/personas/:personaId/contactos**

**Request Body:**
```typescript
{
  tipoContactoId: number;
  valor: string;
  descripcion?: string;
  esPrincipal: boolean;
}
```

**Validaciones:**
- ✅ Solo un contacto puede ser principal por tipo
- ✅ Si `esPrincipal=true`, desmarcar el anterior

#### 7.3. **PUT /api/personas/:personaId/contactos/:contactoId**

#### 7.4. **DELETE /api/personas/:personaId/contactos/:contactoId**

#### 7.5. **PATCH /api/personas/:personaId/contactos/:contactoId/set-principal**
Marca un contacto como principal.

---

### 8. **Endpoints de CATÁLOGOS** ⭐ NUEVO

#### 8.1. **GET /api/personas/catalogos/todos**
Obtiene todos los catálogos en una sola petición (optimización).

**Response:**
```typescript
{
  success: true,
  data: {
    tiposPersona: TipoPersona[];
    especialidadesDocente: EspecialidadDocente[];
    tiposContacto: TipoContacto[];
    categoriasSocio: CategoriaSocio[];
  }
}
```

#### 8.2. **GET /api/personas/catalogos/tipos-persona**

**Response:**
```typescript
{
  success: true,
  data: TipoPersona[]
}
```

#### 8.3. **GET /api/personas/catalogos/especialidades-docente**

#### 8.4. **GET /api/personas/catalogos/tipos-contacto**

---

### 9. **Endpoints de VALIDACIÓN** ⭐ NUEVO

#### 9.1. **GET /api/personas/validar/dni/:dni**

**Query:** `?excludeId=123` (opcional, para ediciones)

**Response:**
```typescript
{
  success: true,
  data: {
    disponible: boolean;
    personaExistente?: {
      id: number;
      nombre: string;
      apellido: string;
    }
  }
}
```

#### 9.2. **GET /api/personas/validar/email/:email**

Mismo formato que validación de DNI.

---

### 10. **Endpoints de ADMINISTRACIÓN de Catálogos** ⭐ NUEVO

Estos endpoints permiten gestionar los catálogos desde la UI.

#### 10.1. Tipos de Persona

```
POST   /api/personas/admin/tipos-persona
PUT    /api/personas/admin/tipos-persona/:id
DELETE /api/personas/admin/tipos-persona/:id
PATCH  /api/personas/admin/tipos-persona/reorder
```

#### 10.2. Especialidades Docente

```
POST   /api/personas/admin/especialidades
PUT    /api/personas/admin/especialidades/:id
DELETE /api/personas/admin/especialidades/:id
PATCH  /api/personas/admin/especialidades/reorder
```

#### 10.3. Tipos de Contacto

```
POST   /api/personas/admin/tipos-contacto
PUT    /api/personas/admin/tipos-contacto/:id
DELETE /api/personas/admin/tipos-contacto/:id
PATCH  /api/personas/admin/tipos-contacto/reorder
```

---

## 📊 Estructura de Datos

### Modelo: `Persona`

```typescript
interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;                    // UNIQUE
  email?: string;                 // UNIQUE (nullable)
  fechaNacimiento?: string;       // ISO 8601
  telefono?: string;
  direccion?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';

  // ⚠️ NUEVO: Relaciones
  tipos?: PersonaTipo[];          // Array de tipos asignados
  contactos?: Contacto[];         // Array de contactos adicionales

  // ⚠️ NUEVO: Campos calculados (virtuales)
  esSocio?: boolean;              // true si tiene tipo SOCIO activo
  esDocente?: boolean;            // true si tiene tipo DOCENTE activo
  esProveedor?: boolean;          // true si tiene tipo PROVEEDOR activo

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

### Modelo: `PersonaTipo` (Tabla de Relación)

```typescript
interface PersonaTipo {
  id: number;
  personaId: number;              // FK a personas
  tipoPersonaCodigo: string;      // 'SOCIO' | 'DOCENTE' | 'PROVEEDOR' | etc.

  // Campos específicos (opcionales según tipo)
  categoriaId?: string;           // CUID - Solo SOCIO
  numeroSocio?: number;           // Auto-generado - Solo SOCIO
  especialidadId?: number;        // FK - Solo DOCENTE
  honorariosPorHora?: number;     // Decimal - Solo DOCENTE
  cuit?: string;                  // 11 dígitos - Solo PROVEEDOR
  razonSocial?: string;           // Solo PROVEEDOR

  fechaAsignacion: string;        // ISO 8601
  activo: boolean;                // Permite desactivar sin eliminar

  // Relaciones opcionales (cuando se incluyen)
  tipoPersona?: TipoPersona;
  categoria?: CategoriaSocio;
  especialidad?: EspecialidadDocente;

  createdAt: string;
  updatedAt: string;
}
```

**⚠️ IMPORTANTE:** Una persona puede tener MÚLTIPLES tipos simultáneamente.

**Ejemplo:**
```json
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678",
  "tipos": [
    {
      "id": 10,
      "tipoPersonaCodigo": "SOCIO",
      "categoriaId": "clxyz123",
      "numeroSocio": 456,
      "activo": true
    },
    {
      "id": 11,
      "tipoPersonaCodigo": "DOCENTE",
      "especialidadId": 2,
      "honorariosPorHora": 5000,
      "activo": true
    }
  ],
  "esSocio": true,
  "esDocente": true
}
```

### Modelo: `Contacto`

```typescript
interface Contacto {
  id: number;
  personaId: number;              // FK a personas
  tipoContactoId: number;         // FK a tipos_contacto
  valor: string;                  // Número, email, username, URL
  descripcion?: string;           // Ej: "WhatsApp personal"
  esPrincipal: boolean;           // Solo uno por tipo
  activo: boolean;

  // Relación opcional
  tipoContacto?: TipoContacto;

  createdAt: string;
  updatedAt: string;
}
```

### Modelo: `TipoPersona` (Catálogo)

```typescript
interface TipoPersona {
  id: number;
  codigo: string;                 // UNIQUE: 'SOCIO', 'DOCENTE', etc.
  nombre: string;                 // Display: 'Socio', 'Docente'
  descripcion?: string;
  activo: boolean;
  orden: number;                  // Para ordenamiento en UI

  // Flags de campos requeridos
  requiresCategoria?: boolean;    // true para SOCIO
  requiresEspecialidad?: boolean; // true para DOCENTE
  requiresCuit?: boolean;         // true para PROVEEDOR

  createdAt: string;
  updatedAt: string;
}
```

### Modelo: `EspecialidadDocente` (Catálogo)

```typescript
interface EspecialidadDocente {
  id: number;
  codigo: string;                 // UNIQUE: 'DANZA', 'MUSICA'
  nombre: string;                 // 'Danza', 'Música'
  descripcion?: string;
  activo: boolean;
  orden: number;

  createdAt: string;
  updatedAt: string;
}
```

### Modelo: `TipoContacto` (Catálogo)

```typescript
interface TipoContacto {
  id: number;
  codigo: string;                 // UNIQUE: 'WHATSAPP', 'INSTAGRAM'
  nombre: string;                 // 'WhatsApp', 'Instagram'
  icono?: string;                 // Nombre del icono MUI
  activo: boolean;
  orden: number;

  createdAt: string;
  updatedAt: string;
}
```

---

## 🗄️ Esquema de Base de Datos

### Tabla: `personas`

```sql
CREATE TABLE personas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  fecha_nacimiento DATE,
  telefono VARCHAR(50),
  direccion TEXT,
  estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'SUSPENDIDO')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_dni (dni),
  INDEX idx_email (email),
  INDEX idx_estado (estado),
  INDEX idx_apellido_nombre (apellido, nombre)
);
```

### Tabla: `persona_tipos` (Relación N:N)

```sql
CREATE TABLE persona_tipos (
  id SERIAL PRIMARY KEY,
  persona_id INTEGER NOT NULL,
  tipo_persona_codigo VARCHAR(50) NOT NULL,

  -- Campos específicos SOCIO
  categoria_id VARCHAR(50),           -- CUID
  numero_socio INTEGER UNIQUE,        -- Auto-incrementado

  -- Campos específicos DOCENTE
  especialidad_id INTEGER,
  honorarios_por_hora DECIMAL(10, 2),

  -- Campos específicos PROVEEDOR
  cuit VARCHAR(11),                   -- 11 dígitos sin guiones
  razon_social VARCHAR(255),

  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE,
  FOREIGN KEY (tipo_persona_codigo) REFERENCES tipos_persona(codigo),
  FOREIGN KEY (categoria_id) REFERENCES categorias_socio(id),
  FOREIGN KEY (especialidad_id) REFERENCES especialidades_docente(id),

  UNIQUE (persona_id, tipo_persona_codigo),
  INDEX idx_persona (persona_id),
  INDEX idx_tipo (tipo_persona_codigo),
  INDEX idx_activo (activo)
);
```

### Tabla: `contactos`

```sql
CREATE TABLE contactos (
  id SERIAL PRIMARY KEY,
  persona_id INTEGER NOT NULL,
  tipo_contacto_id INTEGER NOT NULL,
  valor VARCHAR(255) NOT NULL,
  descripcion TEXT,
  es_principal BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE,
  FOREIGN KEY (tipo_contacto_id) REFERENCES tipos_contacto(id),

  INDEX idx_persona (persona_id),
  INDEX idx_tipo_contacto (tipo_contacto_id),
  INDEX idx_principal (persona_id, tipo_contacto_id, es_principal)
);
```

### Tabla: `tipos_persona` (Catálogo)

```sql
CREATE TABLE tipos_persona (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  orden INTEGER DEFAULT 0,
  requires_categoria BOOLEAN DEFAULT FALSE,
  requires_especialidad BOOLEAN DEFAULT FALSE,
  requires_cuit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_codigo (codigo),
  INDEX idx_activo (activo),
  INDEX idx_orden (orden)
);

-- Datos iniciales
INSERT INTO tipos_persona (codigo, nombre, requires_categoria) VALUES
  ('SOCIO', 'Socio', TRUE),
  ('DOCENTE', 'Docente', FALSE),
  ('ESTUDIANTE', 'Estudiante', FALSE),
  ('PROVEEDOR', 'Proveedor', FALSE),
  ('NO_SOCIO', 'No Socio', FALSE);
```

### Tabla: `especialidades_docente` (Catálogo)

```sql
CREATE TABLE especialidades_docente (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_codigo (codigo),
  INDEX idx_activo (activo)
);

-- Datos iniciales
INSERT INTO especialidades_docente (codigo, nombre) VALUES
  ('DANZA', 'Danza'),
  ('MUSICA', 'Música'),
  ('TEATRO', 'Teatro'),
  ('CANTO', 'Canto');
```

### Tabla: `tipos_contacto` (Catálogo)

```sql
CREATE TABLE tipos_contacto (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  icono VARCHAR(50),
  activo BOOLEAN DEFAULT TRUE,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_codigo (codigo),
  INDEX idx_activo (activo)
);

-- Datos iniciales
INSERT INTO tipos_contacto (codigo, nombre, icono) VALUES
  ('WHATSAPP', 'WhatsApp', 'WhatsApp'),
  ('TELEGRAM', 'Telegram', 'Telegram'),
  ('INSTAGRAM', 'Instagram', 'Instagram'),
  ('FACEBOOK', 'Facebook', 'Facebook'),
  ('EMAIL_ALTERNATIVO', 'Email Alternativo', 'Email');
```

---

## 🔧 Validaciones Requeridas

### 1. Validación de Persona

- ✅ `dni`: ÚNICO, requerido, formato numérico
- ✅ `email`: ÚNICO (si se proporciona)
- ✅ `nombre` y `apellido`: Requeridos, min 2 caracteres
- ✅ `estado`: Debe ser 'ACTIVO', 'INACTIVO' o 'SUSPENDIDO'

### 2. Validación de PersonaTipo

**Para SOCIO:**
- ✅ `categoriaId`: REQUERIDO (CUID válido)
- ✅ `numeroSocio`: Auto-generar si no se proporciona (secuencial)
- ✅ No permitir duplicados para misma persona

**Para DOCENTE:**
- ✅ `especialidadId`: REQUERIDO
- ✅ `honorariosPorHora`: Opcional, pero si se proporciona debe ser > 0

**Para PROVEEDOR:**
- ✅ `cuit`: REQUERIDO, 11 dígitos
- ✅ `razonSocial`: REQUERIDO

### 3. Validación de Contacto

- ✅ Solo un contacto puede tener `esPrincipal=true` por `tipoContactoId`
- ✅ Al marcar como principal, desmarcar el anterior
- ✅ `valor`: Requerido, validar formato según tipo

---

## 🔄 Lógica de Negocio

### Auto-generación de Número de Socio

```sql
-- Ejemplo en SQL
SELECT COALESCE(MAX(numero_socio), 0) + 1
FROM persona_tipos
WHERE tipo_persona_codigo = 'SOCIO';
```

### Campos Virtuales/Calculados

El frontend espera estos campos en el objeto `Persona`:

```typescript
{
  esSocio: boolean,    // true si tiene tipo SOCIO activo
  esDocente: boolean,  // true si tiene tipo DOCENTE activo
  esProveedor: boolean // true si tiene tipo PROVEEDOR activo
}
```

**Implementación sugerida:**
```sql
SELECT
  p.*,
  EXISTS(
    SELECT 1 FROM persona_tipos pt
    WHERE pt.persona_id = p.id
      AND pt.tipo_persona_codigo = 'SOCIO'
      AND pt.activo = TRUE
  ) as es_socio,
  EXISTS(
    SELECT 1 FROM persona_tipos pt
    WHERE pt.persona_id = p.id
      AND pt.tipo_persona_codigo = 'DOCENTE'
      AND pt.activo = TRUE
  ) as es_docente,
  EXISTS(
    SELECT 1 FROM persona_tipos pt
    WHERE pt.persona_id = p.id
      AND pt.tipo_persona_codigo = 'PROVEEDOR'
      AND pt.activo = TRUE
  ) as es_proveedor
FROM personas p;
```

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Crear Socio con Contacto

**Request:**
```http
POST /api/personas
Content-Type: application/json

{
  "nombre": "María",
  "apellido": "González",
  "dni": "98765432",
  "email": "maria@example.com",
  "tipos": [
    {
      "tipoPersonaCodigo": "SOCIO",
      "categoriaId": "clxyz456def"
    }
  ],
  "contactos": [
    {
      "tipoContactoId": 1,
      "valor": "1155667788",
      "descripcion": "WhatsApp personal",
      "esPrincipal": true
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "nombre": "María",
    "apellido": "González",
    "dni": "98765432",
    "email": "maria@example.com",
    "estado": "ACTIVO",
    "tipos": [
      {
        "id": 100,
        "tipoPersonaCodigo": "SOCIO",
        "categoriaId": "clxyz456def",
        "numeroSocio": 457,
        "activo": true,
        "tipoPersona": {
          "codigo": "SOCIO",
          "nombre": "Socio"
        }
      }
    ],
    "contactos": [
      {
        "id": 200,
        "tipoContactoId": 1,
        "valor": "1155667788",
        "descripcion": "WhatsApp personal",
        "esPrincipal": true,
        "tipoContacto": {
          "nombre": "WhatsApp",
          "icono": "WhatsApp"
        }
      }
    ],
    "esSocio": true,
    "esDocente": false,
    "createdAt": "2025-10-28T10:30:00Z",
    "updatedAt": "2025-10-28T10:30:00Z"
  },
  "message": "Persona creada exitosamente"
}
```

### Ejemplo 2: Asignar tipo DOCENTE a persona existente

**Request:**
```http
POST /api/personas/42/tipos
Content-Type: application/json

{
  "tipoPersonaCodigo": "DOCENTE",
  "especialidadId": 2,
  "honorariosPorHora": 5500
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "personaId": 42,
    "tipoPersonaCodigo": "DOCENTE",
    "especialidadId": 2,
    "honorariosPorHora": 5500,
    "activo": true,
    "especialidad": {
      "id": 2,
      "nombre": "Música"
    }
  },
  "message": "Tipo asignado exitosamente"
}
```

### Ejemplo 3: Listar personas con filtros

**Request:**
```http
GET /api/personas?tiposCodigos[]=SOCIO&tiposCodigos[]=DOCENTE&estado=ACTIVO&page=1&limit=20&includeTipos=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "nombre": "María",
      "apellido": "González",
      "dni": "98765432",
      "tipos": [
        {
          "tipoPersonaCodigo": "SOCIO",
          "numeroSocio": 457
        },
        {
          "tipoPersonaCodigo": "DOCENTE",
          "especialidadId": 2
        }
      ],
      "esSocio": true,
      "esDocente": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

## ⚠️ Cambios Críticos que Requieren Atención

### 1. ❗ Filtro por Tipo

**ANTES:**
```
?tipo=DOCENTE
```

**AHORA:**
```
?tiposCodigos[]=DOCENTE
o
?tiposCodigos=DOCENTE
```

El frontend envía **array** de códigos, incluso si es un solo valor.

### 2. ❗ Estado de Persona

**ANTES:**
```typescript
estado: 'activo' | 'inactivo'  // lowercase
```

**AHORA:**
```typescript
estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO'  // UPPERCASE
```

### 3. ❗ Categoría de Socio

**ANTES:**
```typescript
categoriaId: number | null
```

**AHORA:**
```typescript
categoriaId: string  // CUID (ej: "clxyz123abc")
```

### 4. ❗ Estructura de Respuesta

**ANTES (inconsistente):**
```json
// A veces:
{ "data": [...] }
// A veces:
[...]
```

**AHORA (siempre):**
```json
{
  "success": true,
  "data": [...],
  "pagination": {...},  // Solo en listas
  "message": "..."      // Opcional
}
```

---

## 🧪 Testing Recomendado

### Tests Unitarios

1. ✅ Validación de DNI único
2. ✅ Validación de email único
3. ✅ Auto-generación de número de socio
4. ✅ Creación con múltiples tipos
5. ✅ Validación de campos requeridos por tipo
6. ✅ Solo un contacto principal por tipo
7. ✅ Filtrado por múltiples tipos

### Tests de Integración

1. ✅ Crear persona → Asignar tipo → Agregar contacto
2. ✅ Listar con filtros y paginación
3. ✅ Actualizar persona sin afectar tipos
4. ✅ Eliminar tipo sin eliminar persona
5. ✅ Validación de DNI duplicado

---

## 📦 Endpoints Legacy (Eliminar)

**⚠️ DEPRECADOS - Eliminar después de migración:**

```
GET  /api/personas/check-dni/:dni     → Usar /api/personas/validar/dni/:dni
POST /api/personas (con tipo único)   → Usar nueva estructura con tipos[]
GET  /api/personas?tipo=X             → Usar tiposCodigos[]
```

---

## 🚀 Plan de Implementación Sugerido

### Fase 1: Estructura de Datos (Semana 1)
- [ ] Crear tablas nuevas (`persona_tipos`, `contactos`, catálogos)
- [ ] Migrar datos existentes de V1 a V2
- [ ] Agregar índices y constraints

### Fase 2: API CRUD Básico (Semana 2)
- [ ] Implementar GET /api/personas con paginación y filtros
- [ ] Implementar POST /api/personas con tipos[] y contactos[]
- [ ] Implementar PUT /api/personas/:id
- [ ] Implementar DELETE /api/personas/:id

### Fase 3: API de Tipos y Contactos (Semana 3)
- [ ] Endpoints de gestión de tipos (/personas/:id/tipos/*)
- [ ] Endpoints de gestión de contactos (/personas/:id/contactos/*)
- [ ] Validaciones y auto-generación de número de socio

### Fase 4: API de Catálogos (Semana 4)
- [ ] GET /api/personas/catalogos/*
- [ ] Endpoints de administración (/admin/*)

### Fase 5: Testing y Optimización (Semana 5)
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Optimización de queries
- [ ] Documentación de API (Swagger/OpenAPI)

---

## 📞 Contacto

Para dudas o consultas sobre la implementación:
- **Frontend Lead:** [Tu nombre]
- **Documentación:** Este archivo + código fuente en `/src/types/persona.types.ts`
- **Repositorio:** SIGESDA-FRONTEND

---

## 📚 Recursos Adicionales

### Archivos de Referencia del Frontend:

1. **Tipos TypeScript:**
   - `/src/types/persona.types.ts` - Todos los tipos e interfaces

2. **API Client:**
   - `/src/services/personasApi.ts` - Implementación del cliente API

3. **Validaciones:**
   - `/src/schemas/persona.schema.ts` - Schemas de validación Zod

4. **Componentes:**
   - `/src/components/personas/v2/` - Componentes de UI

5. **Ejemplos de Uso:**
   - `/src/pages/Personas/PersonasPage.tsx` - Lista de personas
   - `/src/pages/Personas/PersonaDetallePage.tsx` - Detalle de persona

---

**Última actualización:** 2025-10-28
**Versión del documento:** 1.0
