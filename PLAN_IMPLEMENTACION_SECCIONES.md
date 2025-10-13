# 📊 Plan Técnico de Implementación Frontend - Sistema de Secciones

## 1️⃣ Análisis de Impacto en el Frontend

### 1.1 Nuevas Entidades y Modelos

Se deben crear/actualizar los siguientes tipos TypeScript:

```typescript
// Nuevas entidades principales
- Seccion
- HorarioSeccion
- ParticipacionSeccion
- ReservaAulaSeccion
- ConflictoHorario

// Entidades actualizadas
- Actividad (ahora incluye secciones[])
- Persona (ahora incluye secciones[] para alumnos y cargaHoraria para docentes)
- Aula (ahora incluye reservas[])
```

### 1.2 Componentes Afectados

**Componentes existentes a modificar:**

| Componente | Archivo | Cambios Requeridos |
|------------|---------|-------------------|
| **ActividadesPage** | `src/pages/Actividades/` | Agregar botón "Ver Secciones" |
| **PersonasPage** | `src/pages/Personas/PersonasPageSimple.tsx` | Filtro por tipo DOCENTE, mostrar secciones asignadas |
| **AulasPage** | `src/pages/Aulas/` | Mostrar reservas asociadas |
| **ParticipacionPage** | `src/pages/Participacion/ParticipacionPage.tsx` | Modificar para usar secciones en lugar de actividades directas |

**Nuevos componentes a crear:**

```
src/pages/Secciones/
  ├── SeccionesPage.tsx              // Vista principal
  ├── SeccionDetailPage.tsx          // Detalle de sección
  ├── SeccionFormPage.tsx            // Crear/Editar sección
  ├── HorarioSemanalPage.tsx         // Grilla semanal
  └── DashboardSeccionesPage.tsx     // Estadísticas

src/components/secciones/
  ├── SeccionCard.tsx
  ├── SeccionList.tsx
  ├── SeccionFilters.tsx
  ├── SeccionForm.tsx
  ├── HorarioInputs.tsx
  ├── DocenteSelector.tsx
  ├── AulaSelector.tsx
  ├── ParticipantesList.tsx
  ├── InscripcionModal.tsx
  ├── HorarioSemanalGrid.tsx
  ├── EstadisticasCard.tsx
  └── ConflictosAlert.tsx
```

### 1.3 Store/Estado Afectado

**Slices existentes a modificar:**

- ✅ **actividadesSlice.ts** - Ya modificado según git status
- ✅ **personasSlice.ts** - Ya modificado según git status

**Nuevos slices a crear:**

```typescript
src/store/slices/
  ├── seccionesSlice.ts        // Estado principal de secciones
  ├── horariosSlice.ts         // Gestión de horarios
  ├── participacionesSlice.ts  // Gestión de participaciones
  └── reservasAulasSlice.ts    // Gestión de reservas
```

### 1.4 Servicios/APIs a Crear

```typescript
src/services/api/
  ├── seccionService.ts         // 27 endpoints nuevos
  ├── horarioService.ts         // Lógica de horarios
  └── participacionService.ts   // Inscripciones
```

---

## 2️⃣ Plan de Implementación Detallado

### **FASE 1: Configuración Base (2-3 días)**

#### Tarea 1.1: Definir Tipos TypeScript Completos
**Archivo:** `src/types/seccion.types.ts`

```typescript
// ============================================
// TIPOS BASE Y ENUMS
// ============================================

export type DiaSemana =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"
  | "DOMINGO";

export type TipoPersona = "SOCIO" | "NO_SOCIO" | "DOCENTE" | "PROVEEDOR";
export type TipoActividad = "CORO" | "CLASE_CANTO" | "CLASE_INSTRUMENTO";

// ============================================
// INTERFACES DE ENTIDADES PRINCIPALES
// ============================================

export interface Seccion {
  id: string;
  actividadId: string;
  nombre: string;
  codigo?: string;
  capacidadMaxima?: number;
  activa: boolean;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  horarios: HorarioSeccion[];
  docentes: DocenteSeccion[];
  actividad: ActividadResumen;
  _count: {
    participaciones: number;
    reservasAula: number;
  };
}

export interface SeccionDetallada extends Seccion {
  participaciones: ParticipacionSeccion[];
  reservasAula: ReservaAulaSeccion[];
}

export interface HorarioSeccion {
  id: string;
  seccionId: string;
  diaSemana: DiaSemana;
  horaInicio: string; // "HH:MM"
  horaFin: string;    // "HH:MM"
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipacionSeccion {
  id: string;
  personaId: string;
  seccionId: string;
  fechaInicio: string; // ISO date
  fechaFin?: string | null;
  precioEspecial?: string; // Decimal en formato string
  activa: boolean;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  persona: PersonaResumen;
  seccion?: SeccionResumen;
}

export interface ReservaAulaSeccion {
  id: string;
  seccionId: string;
  aulaId: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  fechaVigencia: string;
  fechaFin?: string | null;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  aula: AulaResumen;
  seccion?: SeccionResumen;
}

export interface ConflictoHorario {
  tipo: "DOCENTE" | "AULA";
  mensaje: string;
  detalles: {
    seccionId: string;
    seccionNombre: string;
    actividadNombre: string;
    diaSemana: DiaSemana;
    horaInicio: string;
    horaFin: string;
    docente?: string;
    aula?: string;
  };
}

// ============================================
// INTERFACES RESUMIDAS (para relaciones)
// ============================================

export interface ActividadResumen {
  id: string;
  nombre: string;
  tipo: TipoActividad;
  precio?: string;
}

export interface PersonaResumen {
  id: string;
  tipo: TipoPersona;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
}

export interface DocenteSeccion {
  id: string;
  nombre: string;
  apellido: string;
  especialidad?: string;
}

export interface SeccionResumen {
  id: string;
  nombre: string;
  codigo?: string;
  actividad: {
    nombre: string;
    tipo: TipoActividad;
  };
}

export interface AulaResumen {
  id: string;
  nombre: string;
  capacidad?: number;
}

// ============================================
// DTOs - REQUEST (para enviar al backend)
// ============================================

export interface CreateSeccionDto {
  actividadId: string;
  nombre: string;
  codigo?: string;
  capacidadMaxima?: number;
  activa?: boolean;
  observaciones?: string;
  docenteIds?: string[];
  horarios?: CreateHorarioDto[];
}

export interface UpdateSeccionDto {
  nombre?: string;
  codigo?: string;
  capacidadMaxima?: number;
  activa?: boolean;
  observaciones?: string;
}

export interface CreateHorarioDto {
  diaSemana: DiaSemana;
  horaInicio: string; // "HH:MM"
  horaFin: string;    // "HH:MM"
  activo?: boolean;
}

export interface UpdateHorarioDto {
  diaSemana?: DiaSemana;
  horaInicio?: string;
  horaFin?: string;
  activo?: boolean;
}

export interface AsignarDocenteDto {
  docenteId: string;
}

export interface InscribirParticipanteDto {
  personaId: string;
  fechaInicio: string; // ISO date
  fechaFin?: string | null;
  precioEspecial?: number;
  activa?: boolean;
  observaciones?: string;
}

export interface UpdateParticipacionDto {
  fechaFin?: string;
  precioEspecial?: number;
  activa?: boolean;
  observaciones?: string;
}

export interface DarDeBajaParticipacionDto {
  fechaFin?: string; // ISO date (opcional, por defecto hoy)
}

export interface CreateReservaAulaDto {
  aulaId: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  fechaVigencia: string; // ISO date
  fechaFin?: string | null;
  observaciones?: string;
}

export interface UpdateReservaAulaDto {
  fechaFin?: string;
  observaciones?: string;
}

export interface VerificarConflictosDto {
  seccionId?: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  docenteId?: string;
  aulaId?: string;
}

// ============================================
// DTOs - RESPONSE (respuestas del backend)
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VerificarConflictosResponse {
  tieneConflictos: boolean;
  conflictos: ConflictoHorario[];
}

export interface EstadisticasSeccionResponse {
  seccion: string;
  actividad: string;
  participantes: {
    total: number;
    activos: number;
    socios: number;
    noSocios: number;
  };
  ocupacion: {
    porcentaje: number;
    disponibles: number;
  };
  docentes: string[];
  aulas: string[];
  horarios: Array<{
    dia: DiaSemana;
    horario: string; // "HH:MM-HH:MM"
  }>;
}

export interface SeccionHorarioSemanal {
  seccionId: string;
  actividadNombre: string;
  seccionNombre: string;
  codigo?: string;
  docentes: string[];
  aula?: string;
  horario: string; // "HH:MM-HH:MM"
  participantes: number;
  capacidad?: number;
  ocupacion: number; // porcentaje
}

export interface HorarioSemanalResponse {
  dia: DiaSemana;
  secciones: SeccionHorarioSemanal[];
}

export interface OcupacionSeccion {
  seccionId: string;
  actividad: string;
  seccion: string;
  ocupacion: number;
  participantes: number;
  capacidad?: number;
}

export interface OcupacionGlobalResponse {
  totalSecciones: number;
  ocupacionPromedio: number;
  seccionesLlenas: number;
  seccionesDisponibles: number;
  detalle: OcupacionSeccion[];
}

export interface CargaHorariaDocente {
  seccionId: string;
  actividad: string;
  seccion: string;
  horas: number;
  dia: DiaSemana;
  horario: string;
}

export interface CargaHorariaDocenteResponse {
  docenteId: string;
  docente: string;
  totalHorasSemana: number;
  secciones: CargaHorariaDocente[];
  alerta?: {
    tipo: "SOBRECARGA";
    mensaje: string;
  };
}

// ============================================
// FILTROS Y QUERY PARAMS
// ============================================

export interface SeccionFilters {
  actividadId?: string;
  activa?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ParticipantesFilters {
  activas?: boolean;
}

// ============================================
// TIPOS AUXILIARES PARA FORMULARIOS
// ============================================

export interface HorarioInput {
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
}

export interface SeccionFormData {
  actividadId: string;
  nombre: string;
  codigo: string;
  capacidadMaxima?: number;
  activa: boolean;
  observaciones: string;
  docenteIds: string[];
  horarios: HorarioInput[];
}
```

**Esfuerzo estimado:** 6 horas (aumentado debido a la completitud)

---

#### Tarea 1.2: Crear Servicios de API Completos
**Archivo:** `src/services/api/seccionService.ts`

```typescript
import apiClient from './client';
import {
  Seccion,
  SeccionDetallada,
  HorarioSeccion,
  ParticipacionSeccion,
  ReservaAulaSeccion,
  CreateSeccionDto,
  UpdateSeccionDto,
  CreateHorarioDto,
  UpdateHorarioDto,
  AsignarDocenteDto,
  InscribirParticipanteDto,
  UpdateParticipacionDto,
  DarDeBajaParticipacionDto,
  CreateReservaAulaDto,
  UpdateReservaAulaDto,
  VerificarConflictosDto,
  ApiResponse,
  PaginatedResponse,
  SeccionFilters,
  ParticipantesFilters,
  VerificarConflictosResponse,
  EstadisticasSeccionResponse,
  HorarioSemanalResponse,
  OcupacionGlobalResponse,
  CargaHorariaDocenteResponse
} from '@/types/seccion.types';

class SeccionService {
  // ============================================
  // 1. CRUD DE SECCIONES
  // ============================================

  /**
   * GET /api/secciones
   * Listar secciones con filtros y paginación
   */
  async listSecciones(params?: SeccionFilters): Promise<PaginatedResponse<Seccion>> {
    const response = await apiClient.get<PaginatedResponse<Seccion>>('/secciones', { params });
    return response.data;
  }

  /**
   * GET /api/secciones/:id
   * Obtener sección por ID
   * @param detallada - Si es true, incluye participaciones y reservas
   */
  async getSeccion(id: string, detallada = false): Promise<ApiResponse<Seccion | SeccionDetallada>> {
    const response = await apiClient.get<ApiResponse<Seccion | SeccionDetallada>>(
      `/secciones/${id}`,
      { params: { detallada } }
    );
    return response.data;
  }

  /**
   * POST /api/secciones
   * Crear nueva sección
   */
  async createSeccion(data: CreateSeccionDto): Promise<ApiResponse<Seccion>> {
    const response = await apiClient.post<ApiResponse<Seccion>>('/secciones', data);
    return response.data;
  }

  /**
   * PUT /api/secciones/:id
   * Actualizar sección
   */
  async updateSeccion(id: string, data: UpdateSeccionDto): Promise<ApiResponse<Seccion>> {
    const response = await apiClient.put<ApiResponse<Seccion>>(`/secciones/${id}`, data);
    return response.data;
  }

  /**
   * DELETE /api/secciones/:id
   * Eliminar sección (solo si no tiene participantes activos)
   */
  async deleteSeccion(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/secciones/${id}`);
    return response.data;
  }

  // ============================================
  // 2. GESTIÓN DE HORARIOS
  // ============================================

  /**
   * POST /api/secciones/:id/horarios
   * Agregar horario a una sección
   */
  async addHorario(seccionId: string, data: CreateHorarioDto): Promise<ApiResponse<HorarioSeccion>> {
    const response = await apiClient.post<ApiResponse<HorarioSeccion>>(
      `/secciones/${seccionId}/horarios`,
      data
    );
    return response.data;
  }

  /**
   * PUT /api/secciones/horarios/:horarioId
   * Actualizar horario
   */
  async updateHorario(horarioId: string, data: UpdateHorarioDto): Promise<ApiResponse<HorarioSeccion>> {
    const response = await apiClient.put<ApiResponse<HorarioSeccion>>(
      `/secciones/horarios/${horarioId}`,
      data
    );
    return response.data;
  }

  /**
   * DELETE /api/secciones/horarios/:horarioId
   * Eliminar horario
   */
  async deleteHorario(horarioId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/secciones/horarios/${horarioId}`
    );
    return response.data;
  }

  // ============================================
  // 3. GESTIÓN DE DOCENTES
  // ============================================

  /**
   * POST /api/secciones/:id/docentes
   * Asignar docente a sección (con validación de conflictos)
   */
  async asignarDocente(seccionId: string, data: AsignarDocenteDto): Promise<ApiResponse<Seccion>> {
    const response = await apiClient.post<ApiResponse<Seccion>>(
      `/secciones/${seccionId}/docentes`,
      data
    );
    return response.data;
  }

  /**
   * DELETE /api/secciones/:id/docentes/:docenteId
   * Remover docente de sección
   */
  async removerDocente(seccionId: string, docenteId: string): Promise<ApiResponse<Seccion>> {
    const response = await apiClient.delete<ApiResponse<Seccion>>(
      `/secciones/${seccionId}/docentes/${docenteId}`
    );
    return response.data;
  }

  // ============================================
  // 4. GESTIÓN DE PARTICIPANTES
  // ============================================

  /**
   * POST /api/secciones/:id/participantes
   * Inscribir participante en sección
   */
  async inscribirParticipante(
    seccionId: string,
    data: InscribirParticipanteDto
  ): Promise<ApiResponse<ParticipacionSeccion>> {
    const response = await apiClient.post<ApiResponse<ParticipacionSeccion>>(
      `/secciones/${seccionId}/participantes`,
      data
    );
    return response.data;
  }

  /**
   * GET /api/secciones/:id/participantes
   * Listar participantes de una sección
   */
  async getParticipantes(
    seccionId: string,
    params?: ParticipantesFilters
  ): Promise<ApiResponse<ParticipacionSeccion[]>> {
    const response = await apiClient.get<ApiResponse<ParticipacionSeccion[]>>(
      `/secciones/${seccionId}/participantes`,
      { params }
    );
    return response.data;
  }

  /**
   * PUT /api/secciones/participaciones/:participacionId
   * Actualizar participación
   */
  async updateParticipacion(
    participacionId: string,
    data: UpdateParticipacionDto
  ): Promise<ApiResponse<ParticipacionSeccion>> {
    const response = await apiClient.put<ApiResponse<ParticipacionSeccion>>(
      `/secciones/participaciones/${participacionId}`,
      data
    );
    return response.data;
  }

  /**
   * POST /api/secciones/participaciones/:participacionId/baja
   * Dar de baja participación (soft delete)
   */
  async darDeBajaParticipacion(
    participacionId: string,
    data?: DarDeBajaParticipacionDto
  ): Promise<ApiResponse<ParticipacionSeccion>> {
    const response = await apiClient.post<ApiResponse<ParticipacionSeccion>>(
      `/secciones/participaciones/${participacionId}/baja`,
      data || {}
    );
    return response.data;
  }

  /**
   * GET /api/personas/:personaId/secciones
   * Listar secciones de una persona
   */
  async getSeccionesPorPersona(
    personaId: string,
    activas = true
  ): Promise<ApiResponse<ParticipacionSeccion[]>> {
    const response = await apiClient.get<ApiResponse<ParticipacionSeccion[]>>(
      `/personas/${personaId}/secciones`,
      { params: { activas } }
    );
    return response.data;
  }

  // ============================================
  // 5. RESERVAS DE AULAS
  // ============================================

  /**
   * POST /api/secciones/:id/reservas-aulas
   * Crear reserva de aula para sección
   */
  async createReservaAula(
    seccionId: string,
    data: CreateReservaAulaDto
  ): Promise<ApiResponse<ReservaAulaSeccion>> {
    const response = await apiClient.post<ApiResponse<ReservaAulaSeccion>>(
      `/secciones/${seccionId}/reservas-aulas`,
      data
    );
    return response.data;
  }

  /**
   * PUT /api/secciones/reservas-aulas/:reservaId
   * Actualizar reserva de aula
   */
  async updateReservaAula(
    reservaId: string,
    data: UpdateReservaAulaDto
  ): Promise<ApiResponse<ReservaAulaSeccion>> {
    const response = await apiClient.put<ApiResponse<ReservaAulaSeccion>>(
      `/secciones/reservas-aulas/${reservaId}`,
      data
    );
    return response.data;
  }

  /**
   * DELETE /api/secciones/reservas-aulas/:reservaId
   * Eliminar reserva de aula
   */
  async deleteReservaAula(reservaId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/secciones/reservas-aulas/${reservaId}`
    );
    return response.data;
  }

  // ============================================
  // 6. VALIDACIONES Y CONFLICTOS
  // ============================================

  /**
   * POST /api/secciones/verificar-conflictos
   * Verificar conflictos de horarios (docentes y aulas)
   */
  async verificarConflictos(
    data: VerificarConflictosDto
  ): Promise<ApiResponse<VerificarConflictosResponse>> {
    const response = await apiClient.post<ApiResponse<VerificarConflictosResponse>>(
      '/secciones/verificar-conflictos',
      data
    );
    return response.data;
  }

  // ============================================
  // 7. REPORTES Y ESTADÍSTICAS
  // ============================================

  /**
   * GET /api/secciones/:id/estadisticas
   * Obtener estadísticas de una sección
   */
  async getEstadisticas(seccionId: string): Promise<ApiResponse<EstadisticasSeccionResponse>> {
    const response = await apiClient.get<ApiResponse<EstadisticasSeccionResponse>>(
      `/secciones/${seccionId}/estadisticas`
    );
    return response.data;
  }

  /**
   * GET /api/secciones/horario-semanal
   * Obtener horario semanal completo (todas las secciones por día)
   */
  async getHorarioSemanal(): Promise<ApiResponse<HorarioSemanalResponse[]>> {
    const response = await apiClient.get<ApiResponse<HorarioSemanalResponse[]>>(
      '/secciones/horario-semanal'
    );
    return response.data;
  }

  /**
   * GET /api/secciones/ocupacion
   * Obtener ocupación global de todas las secciones
   */
  async getOcupacionGlobal(): Promise<ApiResponse<OcupacionGlobalResponse>> {
    const response = await apiClient.get<ApiResponse<OcupacionGlobalResponse>>(
      '/secciones/ocupacion'
    );
    return response.data;
  }

  /**
   * GET /api/actividades/:actividadId/secciones
   * Listar secciones de una actividad específica
   */
  async getSeccionesPorActividad(actividadId: string): Promise<ApiResponse<Seccion[]>> {
    const response = await apiClient.get<ApiResponse<Seccion[]>>(
      `/actividades/${actividadId}/secciones`
    );
    return response.data;
  }

  /**
   * GET /api/personas/docentes/:docenteId/carga-horaria
   * Obtener carga horaria de un docente
   */
  async getCargaHorariaDocente(
    docenteId: string
  ): Promise<ApiResponse<CargaHorariaDocenteResponse>> {
    const response = await apiClient.get<ApiResponse<CargaHorariaDocenteResponse>>(
      `/personas/docentes/${docenteId}/carga-horaria`
    );
    return response.data;
  }
}

export const seccionService = new SeccionService();
```

**Esfuerzo estimado:** 10 horas (aumentado para implementación completa)

---

#### Tarea 1.3: Configurar Cliente Axios
**Archivo:** `src/services/api/client.ts`

```typescript
import axios from 'axios';
import { toast } from 'react-toastify'; // o tu librería de notificaciones

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de request (agregar token si existe)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response (manejo de errores global)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Toast de error automático (opcional, puede desactivarse por endpoint)
    if (error.config?.showErrorToast !== false) {
      const message = error.response?.data?.error || 'Error en la solicitud';
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

**Esfuerzo estimado:** 2 horas

---

#### Tarea 1.4: Configurar Redux Slice
**Archivo:** `src/store/slices/seccionesSlice.ts`

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { seccionService } from '@/services/api/seccionService';
import { Seccion, SeccionFilters } from '@/types/seccion.types';

interface SeccionesState {
  secciones: Seccion[];
  seccionActual: Seccion | null;
  loading: boolean;
  error: string | null;
  filters: SeccionFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: SeccionesState = {
  secciones: [],
  seccionActual: null,
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};

// Thunks asíncronos
export const fetchSecciones = createAsyncThunk(
  'secciones/fetchSecciones',
  async (filters?: SeccionFilters, { rejectWithValue }) => {
    try {
      const response = await seccionService.listSecciones(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar secciones');
    }
  }
);

export const fetchSeccion = createAsyncThunk(
  'secciones/fetchSeccion',
  async ({ id, detallada }: { id: string; detallada?: boolean }, { rejectWithValue }) => {
    try {
      const response = await seccionService.getSeccion(id, detallada);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar sección');
    }
  }
);

export const createSeccion = createAsyncThunk(
  'secciones/createSeccion',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await seccionService.createSeccion(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al crear sección');
    }
  }
);

export const updateSeccion = createAsyncThunk(
  'secciones/updateSeccion',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await seccionService.updateSeccion(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al actualizar sección');
    }
  }
);

export const deleteSeccion = createAsyncThunk(
  'secciones/deleteSeccion',
  async (id: string, { rejectWithValue }) => {
    try {
      await seccionService.deleteSeccion(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al eliminar sección');
    }
  }
);

// Slice
const seccionesSlice = createSlice({
  name: 'secciones',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<SeccionFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSeccionActual: (state) => {
      state.seccionActual = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch secciones
      .addCase(fetchSecciones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSecciones.fulfilled, (state, action) => {
        state.loading = false;
        state.secciones = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchSecciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch sección
      .addCase(fetchSeccion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSeccion.fulfilled, (state, action) => {
        state.loading = false;
        state.seccionActual = action.payload as Seccion;
      })
      .addCase(fetchSeccion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create sección
      .addCase(createSeccion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSeccion.fulfilled, (state, action) => {
        state.loading = false;
        state.secciones.unshift(action.payload);
      })
      .addCase(createSeccion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update sección
      .addCase(updateSeccion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSeccion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.secciones.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.secciones[index] = action.payload;
        }
        if (state.seccionActual?.id === action.payload.id) {
          state.seccionActual = action.payload;
        }
      })
      .addCase(updateSeccion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete sección
      .addCase(deleteSeccion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSeccion.fulfilled, (state, action) => {
        state.loading = false;
        state.secciones = state.secciones.filter(s => s.id !== action.payload);
        if (state.seccionActual?.id === action.payload) {
          state.seccionActual = null;
        }
      })
      .addCase(deleteSeccion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, clearSeccionActual, clearError } = seccionesSlice.actions;
export default seccionesSlice.reducer;
```

**Esfuerzo estimado:** 8 horas

---

#### Tarea 1.5: Crear Constantes y Utilidades
**Archivo:** `src/constants/secciones.constants.ts`

```typescript
export const DIAS_SEMANA = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' }
] as const;

export const OCUPACION_COLORS = {
  DISPONIBLE: 'success', // 0-50%
  PARCIAL: 'warning',    // 51-80%
  CASI_LLENA: 'orange',  // 81-99%
  LLENA: 'error'         // 100%
};

export const OCUPACION_THRESHOLDS = {
  DISPONIBLE: 50,
  PARCIAL: 80,
  CASI_LLENA: 99,
  LLENA: 100
};
```

**Archivo:** `src/utils/horarios.utils.ts`

```typescript
export const parseHorario = (hora: string): number => {
  const [hh, mm] = hora.split(':').map(Number);
  return hh * 60 + mm;
};

export const validarHorario = (inicio: string, fin: string): boolean => {
  return parseHorario(fin) > parseHorario(inicio);
};

export const detectarSolapamiento = (
  h1: { inicio: string; fin: string },
  h2: { inicio: string; fin: string }
): boolean => {
  const h1Start = parseHorario(h1.inicio);
  const h1End = parseHorario(h1.fin);
  const h2Start = parseHorario(h2.inicio);
  const h2End = parseHorario(h2.fin);

  return h1Start < h2End && h1End > h2Start;
};

export const calcularDuracionHoras = (inicio: string, fin: string): number => {
  const minutos = parseHorario(fin) - parseHorario(inicio);
  return minutos / 60;
};

export const formatearHorario = (inicio: string, fin: string): string => {
  return `${inicio}-${fin}`;
};
```

**Esfuerzo estimado:** 3 horas

---

#### Tarea 1.6: Crear Schemas de Validación con Zod
**Archivo:** `src/schemas/seccion.schema.ts`

```typescript
import { z } from 'zod';

// Schema para horarios
export const horarioSchema = z.object({
  diaSemana: z.enum(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']),
  horaInicio: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  horaFin: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  activo: z.boolean().default(true)
}).refine(data => {
  const [hh1, mm1] = data.horaInicio.split(':').map(Number);
  const [hh2, mm2] = data.horaFin.split(':').map(Number);
  const inicio = hh1 * 60 + mm1;
  const fin = hh2 * 60 + mm2;
  return fin > inicio;
}, {
  message: 'La hora de fin debe ser mayor a la hora de inicio',
  path: ['horaFin']
});

// Schema para crear sección
export const createSeccionSchema = z.object({
  actividadId: z.string().min(1, 'Actividad es requerida'),
  nombre: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(100),
  codigo: z.string().max(50).optional(),
  capacidadMaxima: z.number().int().positive('Capacidad debe ser un número positivo').optional(),
  activa: z.boolean().default(true),
  observaciones: z.string().max(500).optional(),
  docenteIds: z.array(z.string()).optional(),
  horarios: z.array(horarioSchema).optional()
});

// Schema para actualizar sección
export const updateSeccionSchema = z.object({
  nombre: z.string().min(3).max(100).optional(),
  codigo: z.string().max(50).optional(),
  capacidadMaxima: z.number().int().positive().optional(),
  activa: z.boolean().optional(),
  observaciones: z.string().max(500).optional()
});

// Schema para inscripción
export const inscripcionSchema = z.object({
  personaId: z.string().min(1, 'Persona es requerida'),
  fechaInicio: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Fecha de inicio inválida'
  }),
  fechaFin: z.string().refine(val => val === '' || !isNaN(Date.parse(val)), {
    message: 'Fecha de fin inválida'
  }).optional(),
  precioEspecial: z.number().positive('Precio debe ser positivo').optional(),
  observaciones: z.string().max(500).optional(),
  activa: z.boolean().default(true)
});

// Schema para reserva de aula
export const reservaAulaSchema = z.object({
  aulaId: z.string().min(1, 'Aula es requerida'),
  diaSemana: z.enum(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']),
  horaInicio: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  horaFin: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  fechaVigencia: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Fecha de vigencia inválida'
  }),
  fechaFin: z.string().refine(val => val === '' || !isNaN(Date.parse(val)), {
    message: 'Fecha de fin inválida'
  }).optional(),
  observaciones: z.string().max(500).optional()
}).refine(data => {
  const [hh1, mm1] = data.horaInicio.split(':').map(Number);
  const [hh2, mm2] = data.horaFin.split(':').map(Number);
  return (hh2 * 60 + mm2) > (hh1 * 60 + mm1);
}, {
  message: 'La hora de fin debe ser mayor a la hora de inicio',
  path: ['horaFin']
});

// Exportar tipos inferidos
export type CreateSeccionFormData = z.infer<typeof createSeccionSchema>;
export type UpdateSeccionFormData = z.infer<typeof updateSeccionSchema>;
export type InscripcionFormData = z.infer<typeof inscripcionSchema>;
export type ReservaAulaFormData = z.infer<typeof reservaAulaSchema>;
```

**Esfuerzo estimado:** 4 horas

---

### **RESUMEN FASE 1**

| Tarea | Archivo | Esfuerzo |
|-------|---------|----------|
| 1.1 Tipos TypeScript | `src/types/seccion.types.ts` | 6h |
| 1.2 Servicios API | `src/services/api/seccionService.ts` | 10h |
| 1.3 Cliente Axios | `src/services/api/client.ts` | 2h |
| 1.4 Redux Slice | `src/store/slices/seccionesSlice.ts` | 8h |
| 1.5 Constantes y Utils | `src/constants/`, `src/utils/` | 3h |
| 1.6 Schemas Zod | `src/schemas/seccion.schema.ts` | 4h |
| **TOTAL FASE 1** | - | **33 horas** |

---

### **FASE 2: Vistas Principales (5-6 días)**

#### Tarea 2.1: Página de Lista de Secciones
**Archivo:** `src/pages/Secciones/SeccionesPage.tsx`

**Endpoints utilizados:**
- `GET /api/secciones` → `listSecciones()`
- `GET /api/actividades` → Para filtros

**Funcionalidades:**
- ✅ Listar secciones con paginación
- ✅ Filtros: actividad, estado, búsqueda
- ✅ Indicador visual de ocupación
- ✅ Navegación a detalle

```typescript
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSecciones, setFilters } from '@/store/slices/seccionesSlice';
import { SeccionFilters } from '@/types/seccion.types';
import { SeccionCard } from '@/components/secciones/SeccionCard';
import { SeccionFilters as FilterComponent } from '@/components/secciones/SeccionFilters';
import { Box, Button, Grid, Pagination, CircularProgress } from '@mui/material';

export const SeccionesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { secciones, loading, pagination, filters } = useAppSelector(
    state => state.secciones
  );

  useEffect(() => {
    dispatch(fetchSecciones(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (newFilters: Partial<SeccionFilters>) => {
    dispatch(setFilters({ ...filters, ...newFilters, page: 1 }));
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    dispatch(setFilters({ ...filters, page }));
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <h1>Gestión de Secciones</h1>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/secciones/horario-semanal')}
          >
            📅 Horario Semanal
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/secciones/new')}
          >
            + Nueva Sección
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <FilterComponent
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Lista de Secciones */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {secciones.map(seccion => (
              <Grid item xs={12} md={6} lg={4} key={seccion.id}>
                <SeccionCard
                  seccion={seccion}
                  onClick={() => navigate(`/secciones/${seccion.id}`)}
                />
              </Grid>
            ))}
          </Grid>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
```

**Esfuerzo estimado:** 8 horas

---

#### Tarea 2.2: Componente SeccionCard
**Archivo:** `src/components/secciones/SeccionCard.tsx`

```typescript
import React, { useMemo } from 'react';
import { Seccion } from '@/types/seccion.types';
import { OCUPACION_THRESHOLDS } from '@/constants/secciones.constants';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  AccessTime as ClockIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from '@mui/icons-material';

interface SeccionCardProps {
  seccion: Seccion;
  onClick?: () => void;
}

export const SeccionCard: React.FC<SeccionCardProps> = ({ seccion, onClick }) => {
  const ocupacionPorcentaje = useMemo(() => {
    if (!seccion.capacidadMaxima) return 0;
    return Math.round((seccion._count.participaciones / seccion.capacidadMaxima) * 100);
  }, [seccion._count.participaciones, seccion.capacidadMaxima]);

  const ocupacionColor = useMemo(() => {
    if (ocupacionPorcentaje >= OCUPACION_THRESHOLDS.LLENA) return 'error';
    if (ocupacionPorcentaje >= OCUPACION_THRESHOLDS.CASI_LLENA) return 'warning';
    if (ocupacionPorcentaje >= OCUPACION_THRESHOLDS.PARCIAL) return 'info';
    return 'success';
  }, [ocupacionPorcentaje]);

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        height: '100%',
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {seccion.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {seccion.actividad.nombre}
            </Typography>
            {seccion.codigo && (
              <Typography variant="caption" color="text.secondary">
                Código: {seccion.codigo}
              </Typography>
            )}
          </Box>
          <Chip
            icon={seccion.activa ? <ActiveIcon /> : <InactiveIcon />}
            label={seccion.activa ? 'Activa' : 'Inactiva'}
            color={seccion.activa ? 'success' : 'default'}
            size="small"
          />
        </Box>

        {/* Ocupación */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2">
              Ocupación
            </Typography>
            <Typography variant="body2" fontWeight="bold" color={`${ocupacionColor}.main`}>
              {seccion._count.participaciones} / {seccion.capacidadMaxima || '∞'}
            </Typography>
          </Box>
          <Tooltip title={`${ocupacionPorcentaje}% ocupado`}>
            <LinearProgress
              variant="determinate"
              value={ocupacionPorcentaje}
              color={ocupacionColor}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Tooltip>
        </Box>

        {/* Docentes */}
        {seccion.docentes.length > 0 && (
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Docentes:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {seccion.docentes.map(doc => (
                <Chip
                  key={doc.id}
                  icon={<PersonIcon />}
                  label={`${doc.nombre} ${doc.apellido}`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Horarios */}
        {seccion.horarios.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Horarios:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {seccion.horarios.map(h => (
                <Chip
                  key={h.id}
                  icon={<ClockIcon />}
                  label={`${h.diaSemana.substring(0, 3)} ${h.horaInicio}-${h.horaFin}`}
                  size="small"
                  color={h.activo ? 'default' : 'error'}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
```

**Esfuerzo estimado:** 4 horas

---

#### Tarea 2.3: Componente de Filtros
**Archivo:** `src/components/secciones/SeccionFilters.tsx`

**Endpoints utilizados:**
- `GET /api/actividades` → Para selector de actividades

```typescript
import React, { useEffect, useState } from 'react';
import { SeccionFilters as FilterType } from '@/types/seccion.types';
import { actividadesService } from '@/services/api/actividadesService';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Paper
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface SeccionFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: Partial<FilterType>) => void;
}

export const SeccionFilters: React.FC<SeccionFiltersProps> = ({
  filters,
  onFilterChange
}) => {
  const [actividades, setActividades] = useState<any[]>([]);

  useEffect(() => {
    // Cargar actividades para el filtro
    actividadesService.list().then(response => {
      setActividades(response.data);
    });
  }, []);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box display="flex" gap={2} flexWrap="wrap">
        {/* Búsqueda */}
        <TextField
          label="Buscar"
          placeholder="Nombre o código..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ minWidth: 250, flex: 1 }}
        />

        {/* Filtro por Actividad */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Actividad</InputLabel>
          <Select
            value={filters.actividadId || ''}
            onChange={(e) => onFilterChange({ actividadId: e.target.value || undefined })}
            label="Actividad"
          >
            <MenuItem value="">Todas</MenuItem>
            {actividades.map(act => (
              <MenuItem key={act.id} value={act.id}>
                {act.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Filtro por Estado */}
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={filters.activa === undefined ? '' : String(filters.activa)}
            onChange={(e) => {
              const value = e.target.value;
              onFilterChange({
                activa: value === '' ? undefined : value === 'true'
              });
            }}
            label="Estado"
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="true">Activas</MenuItem>
            <MenuItem value="false">Inactivas</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};
```

**Esfuerzo estimado:** 3 horas

---

#### Tarea 2.4: Página de Detalle de Sección
**Archivo:** `src/pages/Secciones/SeccionDetailPage.tsx`

**Endpoints utilizados:**
- `GET /api/secciones/:id?detallada=true` → `getSeccion(id, true)`
- `PUT /api/secciones/:id` → `updateSeccion()`
- `DELETE /api/secciones/:id` → `deleteSeccion()`

```typescript
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSeccion, deleteSeccion } from '@/store/slices/seccionesSlice';
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { EstadisticasCard } from '@/components/secciones/EstadisticasCard';
import { HorariosTab } from '@/components/secciones/tabs/HorariosTab';
import { DocentesTab } from '@/components/secciones/tabs/DocentesTab';
import { ParticipantesTab } from '@/components/secciones/tabs/ParticipantesTab';
import { AulasTab } from '@/components/secciones/tabs/AulasTab';
import { InfoGeneralTab } from '@/components/secciones/tabs/InfoGeneralTab';

export const SeccionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { seccionActual: seccion, loading } = useAppSelector(state => state.secciones);

  const [tab, setTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchSeccion({ id, detallada: true }));
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (id) {
      await dispatch(deleteSeccion(id));
      navigate('/secciones');
    }
  };

  if (loading || !seccion) {
    return <div>Cargando...</div>;
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/secciones')}
          >
            Volver
          </Button>
          <h1>{seccion.nombre}</h1>
          <Chip
            label={seccion.activa ? 'Activa' : 'Inactiva'}
            color={seccion.activa ? 'success' : 'default'}
          />
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/secciones/${id}/edit`)}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Eliminar
          </Button>
        </Box>
      </Box>

      {/* Contenido */}
      <Grid container spacing={3}>
        {/* Estadísticas */}
        <Grid item xs={12} md={4}>
          <EstadisticasCard seccionId={seccion.id} />
        </Grid>

        {/* Tabs */}
        <Grid item xs={12} md={8}>
          <Paper>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Info General" />
              <Tab label="Horarios" />
              <Tab label="Docentes" />
              <Tab label="Participantes" />
              <Tab label="Aulas" />
            </Tabs>

            <Box p={3}>
              {tab === 0 && <InfoGeneralTab seccion={seccion} />}
              {tab === 1 && <HorariosTab seccionId={seccion.id} />}
              {tab === 2 && <DocentesTab seccionId={seccion.id} />}
              {tab === 3 && <ParticipantesTab seccionId={seccion.id} />}
              {tab === 4 && <AulasTab seccionId={seccion.id} />}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog de Confirmación de Eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar la sección "{seccion.nombre}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
```

**Esfuerzo estimado:** 10 horas

---

#### Tarea 2.5: Formulario de Creación de Sección (Stepper)
**Archivo:** `src/pages/Secciones/SeccionFormPage.tsx`

**Endpoints utilizados:**
- `GET /api/actividades` → Selector de actividad
- `GET /api/personas?tipo=DOCENTE` → Selector de docentes
- `GET /api/aulas?activa=true` → Selector de aulas
- `POST /api/secciones/verificar-conflictos` → Validación
- `POST /api/secciones` → Crear sección

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSeccionSchema } from '@/schemas/seccion.schema';
import { seccionService } from '@/services/api/seccionService';
import { CreateSeccionDto, HorarioInput } from '@/types/seccion.types';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  TextField,
  FormControlLabel,
  Switch
} from '@mui/material';
import { ActividadSelect } from '@/components/common/ActividadSelect';
import { HorarioInputs } from '@/components/secciones/HorarioInputs';
import { DocenteSelector } from '@/components/secciones/DocenteSelector';
import { AulaSelector } from '@/components/secciones/AulaSelector';
import { toast } from 'react-toastify';

const steps = ['Datos Básicos', 'Horarios', 'Docentes', 'Aulas (Opcional)'];

export const SeccionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [conflictos, setConflictos] = useState<any[]>([]);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateSeccionDto>({
    resolver: zodResolver(createSeccionSchema),
    defaultValues: {
      actividadId: '',
      nombre: '',
      codigo: '',
      capacidadMaxima: undefined,
      activa: true,
      observaciones: '',
      docenteIds: [],
      horarios: []
    }
  });

  const formData = watch();

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const onSubmit = async (data: CreateSeccionDto) => {
    try {
      const response = await seccionService.createSeccion(data);
      toast.success('Sección creada exitosamente');
      navigate(`/secciones/${response.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear sección');
    }
  };

  return (
    <Box>
      <h1>Nueva Sección</h1>

      <Paper sx={{ p: 3 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Paso 1: Datos Básicos */}
          {activeStep === 0 && (
            <Box>
              <Controller
                name="actividadId"
                control={control}
                render={({ field }) => (
                  <ActividadSelect
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.actividadId}
                    helperText={errors.actividadId?.message}
                  />
                )}
              />

              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre de la sección"
                    fullWidth
                    required
                    margin="normal"
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                  />
                )}
              />

              <Controller
                name="codigo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Código"
                    fullWidth
                    margin="normal"
                    error={!!errors.codigo}
                    helperText={errors.codigo?.message}
                  />
                )}
              />

              <Controller
                name="capacidadMaxima"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Capacidad Máxima"
                    type="number"
                    fullWidth
                    margin="normal"
                    error={!!errors.capacidadMaxima}
                    helperText={errors.capacidadMaxima?.message}
                  />
                )}
              />

              <Controller
                name="activa"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Sección Activa"
                  />
                )}
              />

              <Controller
                name="observaciones"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Observaciones"
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                  />
                )}
              />
            </Box>
          )}

          {/* Paso 2: Horarios */}
          {activeStep === 1 && (
            <Controller
              name="horarios"
              control={control}
              render={({ field }) => (
                <HorarioInputs
                  horarios={field.value || []}
                  onChange={field.onChange}
                />
              )}
            />
          )}

          {/* Paso 3: Docentes */}
          {activeStep === 2 && (
            <Controller
              name="docenteIds"
              control={control}
              render={({ field }) => (
                <DocenteSelector
                  selectedDocentes={field.value || []}
                  horarios={formData.horarios || []}
                  onChange={field.onChange}
                  onConflictDetected={setConflictos}
                />
              )}
            />
          )}

          {/* Paso 4: Aulas (Opcional) */}
          {activeStep === 3 && (
            <Box>
              <p>Las aulas se pueden asignar después de crear la sección</p>
              <AulaSelector
                horarios={formData.horarios || []}
              />
            </Box>
          )}

          {/* Botones de Navegación */}
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Atrás
            </Button>
            <Box display="flex" gap={2}>
              <Button onClick={() => navigate('/secciones')}>
                Cancelar
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>
                  Siguiente
                </Button>
              ) : (
                <Button variant="contained" type="submit">
                  Crear Sección
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
```

**Esfuerzo estimado:** 14 horas

---

### **RESUMEN FASE 2**

| Tarea | Archivo | Esfuerzo |
|-------|---------|----------|
| 2.1 Página Lista | `SeccionesPage.tsx` | 8h |
| 2.2 SeccionCard | `SeccionCard.tsx` | 4h |
| 2.3 Filtros | `SeccionFilters.tsx` | 3h |
| 2.4 Detalle | `SeccionDetailPage.tsx` | 10h |
| 2.5 Formulario | `SeccionFormPage.tsx` | 14h |
| **TOTAL FASE 2** | - | **39 horas** |

---

## 📋 Tabla Completa de Endpoints con Request/Response

| # | Método | Endpoint | Request DTO | Response DTO | Uso |
|---|--------|----------|-------------|--------------|-----|
| 1 | GET | `/api/secciones` | `SeccionFilters` (query) | `PaginatedResponse<Seccion>` | Listar secciones |
| 2 | GET | `/api/secciones/:id` | `{ detallada?: boolean }` (query) | `ApiResponse<Seccion \| SeccionDetallada>` | Ver detalle |
| 3 | POST | `/api/secciones` | `CreateSeccionDto` | `ApiResponse<Seccion>` | Crear sección |
| 4 | PUT | `/api/secciones/:id` | `UpdateSeccionDto` | `ApiResponse<Seccion>` | Actualizar |
| 5 | DELETE | `/api/secciones/:id` | - | `ApiResponse<void>` | Eliminar |
| 6 | POST | `/api/secciones/:id/horarios` | `CreateHorarioDto` | `ApiResponse<HorarioSeccion>` | Agregar horario |
| 7 | PUT | `/api/secciones/horarios/:id` | `UpdateHorarioDto` | `ApiResponse<HorarioSeccion>` | Actualizar horario |
| 8 | DELETE | `/api/secciones/horarios/:id` | - | `ApiResponse<void>` | Eliminar horario |
| 9 | POST | `/api/secciones/:id/docentes` | `AsignarDocenteDto` | `ApiResponse<Seccion>` | Asignar docente |
| 10 | DELETE | `/api/secciones/:id/docentes/:docenteId` | - | `ApiResponse<Seccion>` | Remover docente |
| 11 | POST | `/api/secciones/:id/participantes` | `InscribirParticipanteDto` | `ApiResponse<ParticipacionSeccion>` | Inscribir |
| 12 | GET | `/api/secciones/:id/participantes` | `ParticipantesFilters` | `ApiResponse<ParticipacionSeccion[]>` | Listar participantes |
| 13 | PUT | `/api/secciones/participaciones/:id` | `UpdateParticipacionDto` | `ApiResponse<ParticipacionSeccion>` | Actualizar participación |
| 14 | POST | `/api/secciones/participaciones/:id/baja` | `DarDeBajaParticipacionDto` | `ApiResponse<ParticipacionSeccion>` | Dar de baja |
| 15 | GET | `/api/personas/:id/secciones` | `{ activas?: boolean }` | `ApiResponse<ParticipacionSeccion[]>` | Secciones de persona |
| 16 | POST | `/api/secciones/:id/reservas-aulas` | `CreateReservaAulaDto` | `ApiResponse<ReservaAulaSeccion>` | Reservar aula |
| 17 | PUT | `/api/secciones/reservas-aulas/:id` | `UpdateReservaAulaDto` | `ApiResponse<ReservaAulaSeccion>` | Actualizar reserva |
| 18 | DELETE | `/api/secciones/reservas-aulas/:id` | - | `ApiResponse<void>` | Eliminar reserva |
| 19 | POST | `/api/secciones/verificar-conflictos` | `VerificarConflictosDto` | `ApiResponse<VerificarConflictosResponse>` | Validar conflictos |
| 20 | GET | `/api/secciones/:id/estadisticas` | - | `ApiResponse<EstadisticasSeccionResponse>` | Estadísticas |
| 21 | GET | `/api/secciones/horario-semanal` | - | `ApiResponse<HorarioSemanalResponse[]>` | Grilla semanal |
| 22 | GET | `/api/secciones/ocupacion` | - | `ApiResponse<OcupacionGlobalResponse>` | Ocupación global |
| 23 | GET | `/api/actividades/:id/secciones` | - | `ApiResponse<Seccion[]>` | Secciones por actividad |
| 24 | GET | `/api/personas/docentes/:id/carga-horaria` | - | `ApiResponse<CargaHorariaDocenteResponse>` | Carga horaria docente |
| 25 | GET | `/api/personas?tipo=DOCENTE` | - | `ApiResponse<Persona[]>` | Listar docentes |
| 26 | GET | `/api/aulas?activa=true` | - | `ApiResponse<Aula[]>` | Listar aulas |
| 27 | GET | `/api/actividades/:id` | - | `ApiResponse<Actividad>` | Actividad con secciones |

---

## 🔄 Flujos Completos con DTOs

### Flujo 1: Crear Sección Completa

```typescript
// 1. Obtener actividades
const actividades = await actividadesService.list();

// 2. Obtener docentes
const docentes = await personasService.list({ tipo: 'DOCENTE' });

// 3. Obtener aulas
const aulas = await aulasService.list({ activa: true });

// 4. Verificar conflictos
const conflictosRequest: VerificarConflictosDto = {
  diaSemana: 'LUNES',
  horaInicio: '09:00',
  horaFin: '10:30',
  docenteId: 'doc_123',
  aulaId: 'aul_456'
};
const conflictos = await seccionService.verificarConflictos(conflictosRequest);

// 5. Crear sección
const createRequest: CreateSeccionDto = {
  actividadId: 'act_789',
  nombre: 'Grupo A - Mañana',
  codigo: 'PIANO-MA-A',
  capacidadMaxima: 8,
  activa: true,
  docenteIds: ['doc_123'],
  horarios: [
    { diaSemana: 'LUNES', horaInicio: '09:00', horaFin: '10:30', activo: true }
  ]
};
const seccion = await seccionService.createSeccion(createRequest);

// 6. Asignar aula
const reservaRequest: CreateReservaAulaDto = {
  aulaId: 'aul_456',
  diaSemana: 'LUNES',
  horaInicio: '09:00',
  horaFin: '10:30',
  fechaVigencia: new Date().toISOString()
};
await seccionService.createReservaAula(seccion.data.id, reservaRequest);
```

### Flujo 2: Inscribir Alumno

```typescript
// 1. Obtener secciones de actividad
const secciones = await seccionService.getSeccionesPorActividad('act_789');

// 2. Ver estadísticas de sección
const stats = await seccionService.getEstadisticas('sec_123');

// 3. Inscribir participante
const inscripcionRequest: InscribirParticipanteDto = {
  personaId: 'per_456',
  fechaInicio: new Date().toISOString(),
  precioEspecial: 4500,
  activa: true
};
const participacion = await seccionService.inscribirParticipante('sec_123', inscripcionRequest);
```

---

## 📊 Resumen Ejecutivo Actualizado

### Impacto Total
- **27 nuevos endpoints** a integrar (todos con DTOs tipados)
- **16 componentes nuevos** a crear
- **4 componentes existentes** a modificar
- **4 Redux slices** nuevos/actualizados
- **25+ interfaces TypeScript** para DTOs
- **Estimación actualizada: 4-5 semanas** con equipo de 2 desarrolladores

### Beneficios del Plan Refinado
✅ **Tipado completo** - Todos los requests y responses con TypeScript
✅ **Validación con Zod** - Formularios validados antes de enviar
✅ **Documentación inline** - JSDoc en todos los métodos del servicio
✅ **Manejo de errores** - Interceptors de Axios configurados
✅ **Tabla de referencia** - 27 endpoints documentados con DTOs

---

---

## **FASE 3: Gestión de Horarios y Docentes (3-4 días)**

#### Tarea 3.1: Componente de Inputs de Horarios
**Archivo:** `src/components/secciones/HorarioInputs.tsx`

**Funcionalidades:**
- ✅ Agregar/Eliminar horarios dinámicamente
- ✅ Validación de formato de horas
- ✅ Validación de solapamientos
- ✅ Selector de día de semana
- ✅ Toggle activo/inactivo

```typescript
import React, { useState } from 'react';
import { HorarioInput, DiaSemana } from '@/types/seccion.types';
import { DIAS_SEMANA } from '@/constants/secciones.constants';
import { validarHorario, detectarSolapamiento } from '@/utils/horarios.utils';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Paper,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AccessTime as ClockIcon
} from '@mui/icons-material';

interface HorarioInputsProps {
  horarios: HorarioInput[];
  onChange: (horarios: HorarioInput[]) => void;
}

export const HorarioInputs: React.FC<HorarioInputsProps> = ({ horarios, onChange }) => {
  const [errors, setErrors] = useState<Record<number, string>>({});

  const handleAdd = () => {
    const nuevoHorario: HorarioInput = {
      diaSemana: 'LUNES',
      horaInicio: '09:00',
      horaFin: '10:00',
      activo: true
    };
    onChange([...horarios, nuevoHorario]);
  };

  const handleRemove = (index: number) => {
    onChange(horarios.filter((_, i) => i !== index));
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const handleChange = (index: number, field: keyof HorarioInput, value: any) => {
    const updated = [...horarios];
    updated[index] = { ...updated[index], [field]: value };

    // Validar horario
    const newErrors = { ...errors };
    if (field === 'horaInicio' || field === 'horaFin') {
      const horario = updated[index];
      if (!validarHorario(horario.horaInicio, horario.horaFin)) {
        newErrors[index] = 'La hora de fin debe ser mayor a la hora de inicio';
      } else {
        delete newErrors[index];

        // Validar solapamientos en el mismo día
        const solapamientos = updated.filter((h, i) =>
          i !== index &&
          h.diaSemana === horario.diaSemana &&
          detectarSolapamiento(
            { inicio: h.horaInicio, fin: h.horaFin },
            { inicio: horario.horaInicio, fin: horario.horaFin }
          )
        );

        if (solapamientos.length > 0) {
          newErrors[index] = `Se solapa con otro horario del ${horario.diaSemana}`;
        }
      }
    }

    setErrors(newErrors);
    onChange(updated);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Horarios</Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Agregar Horario
        </Button>
      </Box>

      {horarios.length === 0 && (
        <Alert severity="info">
          No hay horarios configurados. Agregue al menos uno.
        </Alert>
      )}

      {horarios.map((horario, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2 }}>
          <Box display="flex" gap={2} alignItems="start">
            {/* Día de Semana */}
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Día</InputLabel>
              <Select
                value={horario.diaSemana}
                onChange={(e) => handleChange(index, 'diaSemana', e.target.value as DiaSemana)}
                label="Día"
              >
                {DIAS_SEMANA.map(dia => (
                  <MenuItem key={dia.value} value={dia.value}>
                    {dia.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Hora Inicio */}
            <TextField
              label="Hora Inicio"
              type="time"
              value={horario.horaInicio}
              onChange={(e) => handleChange(index, 'horaInicio', e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!errors[index]}
              sx={{ width: 150 }}
            />

            {/* Hora Fin */}
            <TextField
              label="Hora Fin"
              type="time"
              value={horario.horaFin}
              onChange={(e) => handleChange(index, 'horaFin', e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!errors[index]}
              helperText={errors[index]}
              sx={{ width: 150 }}
            />

            {/* Switch Activo */}
            <FormControlLabel
              control={
                <Switch
                  checked={horario.activo}
                  onChange={(e) => handleChange(index, 'activo', e.target.checked)}
                />
              }
              label="Activo"
            />

            {/* Botón Eliminar */}
            <IconButton
              color="error"
              onClick={() => handleRemove(index)}
              sx={{ ml: 'auto' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};
```

**Esfuerzo estimado:** 6 horas

---

#### Tarea 3.2: Componente Selector de Docentes con Validación de Conflictos
**Archivo:** `src/components/secciones/DocenteSelector.tsx`

**Endpoints utilizados:**
- `GET /api/personas?tipo=DOCENTE` → Listar docentes
- `POST /api/secciones/verificar-conflictos` → Verificar conflictos
- `GET /api/personas/docentes/:id/carga-horaria` → Ver carga del docente

```typescript
import React, { useEffect, useState } from 'react';
import { personasService } from '@/services/api/personasService';
import { seccionService } from '@/services/api/seccionService';
import { PersonaResumen, HorarioInput, ConflictoHorario } from '@/types/seccion.types';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  OutlinedInput
} from '@mui/material';
import {
  Person as PersonIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

interface DocenteSelectorProps {
  selectedDocentes: string[];
  horarios: HorarioInput[];
  onChange: (docenteIds: string[]) => void;
  onConflictDetected?: (conflictos: ConflictoHorario[]) => void;
}

export const DocenteSelector: React.FC<DocenteSelectorProps> = ({
  selectedDocentes,
  horarios,
  onChange,
  onConflictDetected
}) => {
  const [docentes, setDocentes] = useState<PersonaResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [conflictos, setConflictos] = useState<ConflictoHorario[]>([]);
  const [cargaHoraria, setCargaHoraria] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadDocentes();
  }, []);

  useEffect(() => {
    // Verificar conflictos cuando cambien docentes u horarios
    if (selectedDocentes.length > 0 && horarios.length > 0) {
      verificarConflictos();
    } else {
      setConflictos([]);
    }
  }, [selectedDocentes, horarios]);

  const loadDocentes = async () => {
    setLoading(true);
    try {
      const response = await personasService.list({ tipo: 'DOCENTE' });
      setDocentes(response.data);
    } catch (error) {
      console.error('Error al cargar docentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const verificarConflictos = async () => {
    const conflictosEncontrados: ConflictoHorario[] = [];

    for (const docenteId of selectedDocentes) {
      for (const horario of horarios) {
        try {
          const response = await seccionService.verificarConflictos({
            diaSemana: horario.diaSemana,
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin,
            docenteId
          });

          if (response.data.tieneConflictos) {
            conflictosEncontrados.push(...response.data.conflictos);
          }
        } catch (error) {
          console.error('Error verificando conflictos:', error);
        }
      }
    }

    setConflictos(conflictosEncontrados);
    if (onConflictDetected) {
      onConflictDetected(conflictosEncontrados);
    }
  };

  const handleDocenteChange = (event: any) => {
    const value = event.target.value;
    onChange(typeof value === 'string' ? value.split(',') : value);
  };

  const verCargaHoraria = async (docenteId: string) => {
    try {
      const response = await seccionService.getCargaHorariaDocente(docenteId);
      setCargaHoraria(response.data);
      setDialogOpen(true);
    } catch (error) {
      console.error('Error al obtener carga horaria:', error);
    }
  };

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel>Docentes</InputLabel>
        <Select
          multiple
          value={selectedDocentes}
          onChange={handleDocenteChange}
          input={<OutlinedInput label="Docentes" />}
          renderValue={(selected) => (
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {selected.map((id) => {
                const docente = docentes.find(d => d.id === id);
                return (
                  <Chip
                    key={id}
                    label={`${docente?.nombre} ${docente?.apellido}`}
                    icon={<PersonIcon />}
                  />
                );
              })}
            </Box>
          )}
        >
          {loading ? (
            <MenuItem disabled>
              <CircularProgress size={20} /> Cargando...
            </MenuItem>
          ) : (
            docentes.map(docente => (
              <MenuItem key={docente.id} value={docente.id}>
                {docente.nombre} {docente.apellido}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      {/* Botones de Carga Horaria */}
      {selectedDocentes.length > 0 && (
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          {selectedDocentes.map(id => {
            const docente = docentes.find(d => d.id === id);
            return (
              <Button
                key={id}
                size="small"
                variant="outlined"
                startIcon={<ScheduleIcon />}
                onClick={() => verCargaHoraria(id)}
              >
                Ver carga de {docente?.nombre}
              </Button>
            );
          })}
        </Box>
      )}

      {/* Alerta de Conflictos */}
      {conflictos.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }} icon={<WarningIcon />}>
          <AlertTitle>Conflictos de Horario Detectados</AlertTitle>
          <List dense>
            {conflictos.map((conflicto, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={conflicto.mensaje}
                  secondary={`${conflicto.detalles.diaSemana} ${conflicto.detalles.horaInicio}-${conflicto.detalles.horaFin} - ${conflicto.detalles.seccionNombre}`}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* Dialog de Carga Horaria */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Carga Horaria del Docente</DialogTitle>
        <DialogContent>
          {cargaHoraria && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {cargaHoraria.docente}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Total: {cargaHoraria.totalHorasSemana} horas semanales
              </Typography>

              {cargaHoraria.alerta && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {cargaHoraria.alerta.mensaje}
                </Alert>
              )}

              <List>
                {cargaHoraria.secciones.map((seccion: any, index: number) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={`${seccion.actividad} - ${seccion.seccion}`}
                      secondary={`${seccion.dia} ${seccion.horario} (${seccion.horas}h)`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
```

**Esfuerzo estimado:** 8 horas

---

#### Tarea 3.3: Tabs de Horarios y Docentes en Detalle
**Archivo:** `src/components/secciones/tabs/HorariosTab.tsx`

**Endpoints utilizados:**
- `POST /api/secciones/:id/horarios` → Agregar horario
- `PUT /api/secciones/horarios/:horarioId` → Actualizar horario
- `DELETE /api/secciones/horarios/:horarioId` → Eliminar horario

```typescript
import React, { useState } from 'react';
import { seccionService } from '@/services/api/seccionService';
import { useAppDispatch } from '@/store/hooks';
import { fetchSeccion } from '@/store/slices/seccionesSlice';
import { CreateHorarioDto, HorarioSeccion } from '@/types/seccion.types';
import { HorarioInputs } from '@/components/secciones/HorarioInputs';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface HorariosTabProps {
  seccionId: string;
}

export const HorariosTab: React.FC<HorariosTabProps> = ({ seccionId }) => {
  const dispatch = useAppDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [horarios, setHorarios] = useState<any[]>([]);

  const handleAdd = async () => {
    // Los horarios se manejan en el componente HorarioInputs
    // Al confirmar, se envían al backend
    try {
      for (const horario of horarios) {
        await seccionService.addHorario(seccionId, horario);
      }
      toast.success('Horarios agregados exitosamente');
      dispatch(fetchSeccion({ id: seccionId, detallada: true }));
      setDialogOpen(false);
      setHorarios([]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al agregar horarios');
    }
  };

  const handleDelete = async (horarioId: string) => {
    try {
      await seccionService.deleteHorario(horarioId);
      toast.success('Horario eliminado');
      dispatch(fetchSeccion({ id: seccionId, detallada: true }));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar horario');
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setDialogOpen(true)}
        sx={{ mb: 2 }}
      >
        Agregar Horario
      </Button>

      {/* Lista de horarios existentes */}
      <List>
        {/* Aquí se renderizarían los horarios de la sección */}
      </List>

      {/* Dialog para agregar horarios */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Agregar Horarios</DialogTitle>
        <DialogContent>
          <HorarioInputs horarios={horarios} onChange={setHorarios} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleAdd} variant="contained" disabled={horarios.length === 0}>
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
```

**Esfuerzo estimado:** 5 horas

---

### **RESUMEN FASE 3**

| Tarea | Archivo | Esfuerzo |
|-------|---------|----------|
| 3.1 HorarioInputs | `HorarioInputs.tsx` | 6h |
| 3.2 DocenteSelector | `DocenteSelector.tsx` | 8h |
| 3.3 Tabs Horarios/Docentes | `HorariosTab.tsx`, `DocentesTab.tsx` | 5h |
| **TOTAL FASE 3** | - | **19 horas** |

---

## **FASE 4: Gestión de Participantes (4-5 días)**

#### Tarea 4.1: Modal de Inscripción de Participantes
**Archivo:** `src/components/secciones/InscripcionModal.tsx`

**Endpoints utilizados:**
- `GET /api/personas` → Listar personas (con filtro)
- `POST /api/secciones/:id/participantes` → Inscribir participante
- `GET /api/secciones/:id/estadisticas` → Verificar cupos disponibles

```typescript
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inscripcionSchema } from '@/schemas/seccion.schema';
import { seccionService } from '@/services/api/seccionService';
import { personasService } from '@/services/api/personasService';
import { InscribirParticipanteDto } from '@/types/seccion.types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Box,
  Autocomplete
} from '@mui/material';
import { toast } from 'react-toastify';

interface InscripcionModalProps {
  open: boolean;
  seccionId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const InscripcionModal: React.FC<InscripcionModalProps> = ({
  open,
  seccionId,
  onClose,
  onSuccess
}) => {
  const [personas, setPersonas] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<InscribirParticipanteDto>({
    resolver: zodResolver(inscripcionSchema),
    defaultValues: {
      personaId: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      activa: true
    }
  });

  useEffect(() => {
    if (open) {
      loadPersonas();
      loadEstadisticas();
    }
  }, [open, seccionId]);

  const loadPersonas = async () => {
    try {
      const response = await personasService.list();
      setPersonas(response.data);
    } catch (error) {
      console.error('Error al cargar personas:', error);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const response = await seccionService.getEstadisticas(seccionId);
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const onSubmit = async (data: InscribirParticipanteDto) => {
    setLoading(true);
    try {
      await seccionService.inscribirParticipante(seccionId, data);
      toast.success('Participante inscrito exitosamente');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al inscribir participante');
    } finally {
      setLoading(false);
    }
  };

  const sinCupos = estadisticas &&
    estadisticas.ocupacion.disponibles <= 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Inscribir Participante</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {/* Alerta de capacidad */}
          {estadisticas && (
            <Alert severity={sinCupos ? 'error' : 'info'} sx={{ mb: 2 }}>
              {sinCupos
                ? 'No hay cupos disponibles en esta sección'
                : `Cupos disponibles: ${estadisticas.ocupacion.disponibles}`
              }
            </Alert>
          )}

          {/* Selector de Persona */}
          <Controller
            name="personaId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={personas}
                getOptionLabel={(option) => `${option.nombre} ${option.apellido} (${option.tipo})`}
                onChange={(_, value) => field.onChange(value?.id || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Persona"
                    required
                    error={!!errors.personaId}
                    helperText={errors.personaId?.message}
                    margin="normal"
                  />
                )}
              />
            )}
          />

          {/* Fecha Inicio */}
          <Controller
            name="fechaInicio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Fecha de Inicio"
                type="date"
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
                error={!!errors.fechaInicio}
                helperText={errors.fechaInicio?.message}
              />
            )}
          />

          {/* Fecha Fin (Opcional) */}
          <Controller
            name="fechaFin"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Fecha de Fin (Opcional)"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                error={!!errors.fechaFin}
                helperText={errors.fechaFin?.message}
              />
            )}
          />

          {/* Precio Especial */}
          <Controller
            name="precioEspecial"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Precio Especial (Opcional)"
                type="number"
                fullWidth
                margin="normal"
                error={!!errors.precioEspecial}
                helperText={errors.precioEspecial?.message}
              />
            )}
          />

          {/* Observaciones */}
          <Controller
            name="observaciones"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Observaciones"
                multiline
                rows={3}
                fullWidth
                margin="normal"
              />
            )}
          />

          {/* Estado Activo */}
          <Controller
            name="activa"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label="Participación Activa"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || sinCupos}
          >
            Inscribir
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
```

**Esfuerzo estimado:** 7 horas

---

#### Tarea 4.2: Tab de Participantes con Gestión
**Archivo:** `src/components/secciones/tabs/ParticipantesTab.tsx`

**Endpoints utilizados:**
- `GET /api/secciones/:id/participantes` → Listar participantes
- `PUT /api/secciones/participaciones/:id` → Actualizar participación
- `POST /api/secciones/participaciones/:id/baja` → Dar de baja

```typescript
import React, { useEffect, useState } from 'react';
import { seccionService } from '@/services/api/seccionService';
import { ParticipacionSeccion } from '@/types/seccion.types';
import { InscripcionModal } from '@/components/secciones/InscripcionModal';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Switch
} from '@mui/material';
import {
  PersonAdd as AddIcon,
  Edit as EditIcon,
  PersonOff as BajaIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

interface ParticipantesTabProps {
  seccionId: string;
}

export const ParticipantesTab: React.FC<ParticipantesTabProps> = ({ seccionId }) => {
  const [participantes, setParticipantes] = useState<ParticipacionSeccion[]>([]);
  const [loading, setLoading] = useState(false);
  const [inscripcionOpen, setInscripcionOpen] = useState(false);
  const [bajaDialog, setBajaDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  });

  useEffect(() => {
    loadParticipantes();
  }, [seccionId]);

  const loadParticipantes = async () => {
    setLoading(true);
    try {
      const response = await seccionService.getParticipantes(seccionId);
      setParticipantes(response.data);
    } catch (error) {
      console.error('Error al cargar participantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDarDeBaja = async () => {
    if (!bajaDialog.id) return;

    try {
      await seccionService.darDeBajaParticipacion(bajaDialog.id);
      toast.success('Participante dado de baja');
      loadParticipantes();
      setBajaDialog({ open: false, id: null });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al dar de baja');
    }
  };

  const handleToggleActiva = async (id: string, activa: boolean) => {
    try {
      await seccionService.updateParticipacion(id, { activa });
      toast.success(`Participación ${activa ? 'activada' : 'desactivada'}`);
      loadParticipantes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <h3>Participantes ({participantes.length})</h3>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setInscripcionOpen(true)}
        >
          Inscribir Participante
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Fecha Inicio</TableCell>
            <TableCell>Fecha Fin</TableCell>
            <TableCell>Precio Especial</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {participantes.map(p => (
            <TableRow key={p.id}>
              <TableCell>
                {p.persona.nombre} {p.persona.apellido}
              </TableCell>
              <TableCell>
                <Chip label={p.persona.tipo} size="small" />
              </TableCell>
              <TableCell>
                {format(new Date(p.fechaInicio), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>
                {p.fechaFin ? format(new Date(p.fechaFin), 'dd/MM/yyyy') : '-'}
              </TableCell>
              <TableCell>
                {p.precioEspecial || '-'}
              </TableCell>
              <TableCell>
                <Switch
                  checked={p.activa}
                  onChange={(e) => handleToggleActiva(p.id, e.target.checked)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setBajaDialog({ open: true, id: p.id })}
                  disabled={!p.activa}
                >
                  <BajaIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal de Inscripción */}
      <InscripcionModal
        open={inscripcionOpen}
        seccionId={seccionId}
        onClose={() => setInscripcionOpen(false)}
        onSuccess={loadParticipantes}
      />

      {/* Dialog de Confirmación de Baja */}
      <Dialog open={bajaDialog.open} onClose={() => setBajaDialog({ open: false, id: null })}>
        <DialogTitle>Confirmar Baja</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea dar de baja este participante?
            Esto establecerá la fecha de fin como hoy.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBajaDialog({ open: false, id: null })}>
            Cancelar
          </Button>
          <Button onClick={handleDarDeBaja} color="error" variant="contained">
            Dar de Baja
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
```

**Esfuerzo estimado:** 8 horas

---

### **RESUMEN FASE 4**

| Tarea | Archivo | Esfuerzo |
|-------|---------|----------|
| 4.1 InscripcionModal | `InscripcionModal.tsx` | 7h |
| 4.2 ParticipantesTab | `ParticipantesTab.tsx` | 8h |
| **TOTAL FASE 4** | - | **15 horas** |

---

## **FASE 5: Reportes y Visualizaciones (5-6 días)**

#### Tarea 5.1: Página de Horario Semanal (Grilla)
**Archivo:** `src/pages/Secciones/HorarioSemanalPage.tsx`

**Endpoints utilizados:**
- `GET /api/secciones/horario-semanal` → Obtener grilla semanal completa

```typescript
import React, { useEffect, useState } from 'react';
import { seccionService } from '@/services/api/seccionService';
import { HorarioSemanalResponse, DiaSemana } from '@/types/seccion.types';
import { DIAS_SEMANA } from '@/constants/secciones.constants';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Typography,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const HorarioSemanalPage: React.FC = () => {
  const navigate = useNavigate();
  const [horarios, setHorarios] = useState<HorarioSemanalResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHorarioSemanal();
  }, []);

  const loadHorarioSemanal = async () => {
    setLoading(true);
    try {
      const response = await seccionService.getHorarioSemanal();
      setHorarios(response.data);
    } catch (error) {
      console.error('Error al cargar horario semanal:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Horario Semanal de Secciones
      </Typography>

      <Paper sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Horario</TableCell>
              {DIAS_SEMANA.map(dia => (
                <TableCell key={dia.value} align="center">
                  {dia.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Aquí se renderizaría una grilla con los horarios */}
            {/* Agrupados por franjas horarias */}
            {horarios.map(horario => (
              <TableRow key={horario.dia}>
                <TableCell>{horario.dia}</TableCell>
                <TableCell>
                  {horario.secciones.map(seccion => (
                    <Tooltip
                      key={seccion.seccionId}
                      title={`${seccion.docentes.join(', ')} - ${seccion.aula || 'Sin aula'}`}
                    >
                      <Chip
                        label={`${seccion.actividadNombre} - ${seccion.seccionNombre}`}
                        size="small"
                        onClick={() => navigate(`/secciones/${seccion.seccionId}`)}
                        sx={{ m: 0.5, cursor: 'pointer' }}
                        color={seccion.ocupacion >= 90 ? 'error' : 'default'}
                      />
                    </Tooltip>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
```

**Esfuerzo estimado:** 12 horas

---

#### Tarea 5.2: Dashboard de Estadísticas
**Archivo:** `src/pages/Secciones/DashboardSeccionesPage.tsx`

**Endpoints utilizados:**
- `GET /api/secciones/ocupacion` → Ocupación global
- `GET /api/secciones` → Listar todas las secciones

```typescript
import React, { useEffect, useState } from 'react';
import { seccionService } from '@/services/api/seccionService';
import { OcupacionGlobalResponse } from '@/types/seccion.types';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const DashboardSeccionesPage: React.FC = () => {
  const [ocupacion, setOcupacion] = useState<OcupacionGlobalResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEstadisticas();
  }, []);

  const loadEstadisticas = async () => {
    setLoading(true);
    try {
      const response = await seccionService.getOcupacionGlobal();
      setOcupacion(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !ocupacion) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const pieData = [
    { name: 'Secciones Llenas', value: ocupacion.seccionesLlenas },
    { name: 'Secciones Disponibles', value: ocupacion.seccionesDisponibles }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard de Secciones
      </Typography>

      <Grid container spacing={3}>
        {/* Card Total Secciones */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              {ocupacion.totalSecciones}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Secciones
            </Typography>
          </Paper>
        </Grid>

        {/* Card Ocupación Promedio */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">
              {ocupacion.ocupacionPromedio.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ocupación Promedio
            </Typography>
          </Paper>
        </Grid>

        {/* Card Secciones Llenas */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="error.main">
              {ocupacion.seccionesLlenas}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Secciones Llenas
            </Typography>
          </Paper>
        </Grid>

        {/* Card Disponibles */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="info.main">
              {ocupacion.seccionesDisponibles}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Con Disponibilidad
            </Typography>
          </Paper>
        </Grid>

        {/* Gráfico de Torta */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribución de Ocupación
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Tabla de Ocupación por Sección */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Secciones por Ocupación
            </Typography>
            {ocupacion.detalle.slice(0, 5).map(seccion => (
              <Box key={seccion.seccionId} mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">
                    {seccion.actividad} - {seccion.seccion}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {seccion.ocupacion}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={seccion.ocupacion}
                  color={seccion.ocupacion >= 90 ? 'error' : 'primary'}
                />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
```

**Esfuerzo estimado:** 10 horas

---

### **RESUMEN FASE 5**

| Tarea | Archivo | Esfuerzo |
|-------|---------|----------|
| 5.1 HorarioSemanalPage | `HorarioSemanalPage.tsx` | 12h |
| 5.2 DashboardSecciones | `DashboardSeccionesPage.tsx` | 10h |
| **TOTAL FASE 5** | - | **22 horas** |

---

## **FASE 6: Modificar Componentes Existentes (2-3 días)**

#### Tarea 6.1: Actualizar ActividadesPage
**Archivo:** `src/pages/Actividades/ActividadesPage.tsx`

**Cambios:**
- Agregar botón "Ver Secciones" en cada actividad
- Mostrar contador de secciones activas

**Esfuerzo estimado:** 3 horas

---

#### Tarea 6.2: Actualizar PersonasPageSimple
**Archivo:** `src/pages/Personas/PersonasPageSimple.tsx`

**Cambios:**
- Agregar filtro por tipo DOCENTE
- Mostrar secciones asignadas (para docentes)
- Mostrar inscripciones (para alumnos)

**Endpoint utilizado:**
- `GET /api/personas/:id/secciones` → Ver secciones de una persona

**Esfuerzo estimado:** 4 horas

---

#### Tarea 6.3: Actualizar ParticipacionPage
**Archivo:** `src/pages/Participacion/ParticipacionPage.tsx`

**Cambios:**
- Modificar para usar secciones en lugar de actividades directas
- Agregar columna "Sección"
- Filtro por sección

**Esfuerzo estimado:** 4 horas

---

### **RESUMEN FASE 6**

| Tarea | Archivo | Esfuerzo |
|-------|---------|----------|
| 6.1 ActividadesPage | `ActividadesPage.tsx` | 3h |
| 6.2 PersonasPageSimple | `PersonasPageSimple.tsx` | 4h |
| 6.3 ParticipacionPage | `ParticipacionPage.tsx` | 4h |
| **TOTAL FASE 6** | - | **11 horas** |

---

## **FASE 7: Testing y Refinamiento (3-4 días)**

#### Tarea 7.1: Tests Unitarios

**Archivos a testear:**
- `horarios.utils.ts` → Validaciones de horarios
- `seccionService.ts` → Llamadas a la API
- `seccionesSlice.ts` → Redux thunks

**Esfuerzo estimado:** 8 horas

---

#### Tarea 7.2: Tests de Integración

**Flujos a testear:**
- Crear sección completa (con horarios, docentes, aulas)
- Inscribir participante
- Verificar conflictos de horarios

**Esfuerzo estimado:** 6 horas

---

#### Tarea 7.3: Testing Manual y Ajustes

- Navegación completa
- Validaciones de formularios
- Manejo de errores
- Optimizaciones de performance

**Esfuerzo estimado:** 10 horas

---

### **RESUMEN FASE 7**

| Tarea | Descripción | Esfuerzo |
|-------|-------------|----------|
| 7.1 Tests Unitarios | Utils, Service, Redux | 8h |
| 7.2 Tests Integración | Flujos completos | 6h |
| 7.3 Testing Manual | Navegación, validaciones | 10h |
| **TOTAL FASE 7** | - | **24 horas** |

---

## 📊 **RESUMEN EJECUTIVO FINAL**

### Estimación Total por Fase

| Fase | Nombre | Esfuerzo | Días |
|------|--------|----------|------|
| 1 | Configuración Base | 33h | 4-5 días |
| 2 | Vistas Principales | 39h | 5-6 días |
| 3 | Horarios y Docentes | 19h | 3-4 días |
| 4 | Gestión de Participantes | 15h | 2-3 días |
| 5 | Reportes y Visualizaciones | 22h | 3-4 días |
| 6 | Componentes Existentes | 11h | 2-3 días |
| 7 | Testing y Refinamiento | 24h | 3-4 días |
| **TOTAL** | - | **163 horas** | **22-29 días** |

### Equipo Recomendado

**Opción 1: 2 Desarrolladores**
- Desarrollador A: Fases 1, 3, 5, 7
- Desarrollador B: Fases 2, 4, 6
- **Duración estimada:** 4-5 semanas

**Opción 2: 1 Desarrollador**
- Todas las fases secuencialmente
- **Duración estimada:** 6-7 semanas

### Hitos Clave

✅ **Semana 1-2:** Configuración base y vistas principales
✅ **Semana 3:** Gestión de horarios y participantes
✅ **Semana 4:** Reportes y modificaciones de componentes existentes
✅ **Semana 5:** Testing y refinamiento

### Entregables

1. ✅ **27 endpoints integrados** con DTOs tipados
2. ✅ **16 componentes nuevos** funcionales
3. ✅ **4 componentes actualizados**
4. ✅ **4 Redux slices** completos
5. ✅ **Tests unitarios** para lógica crítica
6. ✅ **Documentación inline** (JSDoc)

---

**Fecha de elaboración:** 2025-10-10
**Versión del plan:** 3.0 (COMPLETO)
**Estado:** ✅ Listo para desarrollo (Fases 1-7 detalladas con DTOs completos)
