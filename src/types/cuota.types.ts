import { Persona } from './persona.types';

// Enums and Types
export type CategoriaSocio = 'ACTIVO' | 'ESTUDIANTE' | 'JUBILADO' | 'VITALICIO' | 'BENEFACTOR';

export type EstadoRecibo = 'PENDIENTE' | 'PAGADO' | 'VENCIDO' | 'ANULADO';

export type CategoriaItemCodigo = 'BASE' | 'ACTIVIDAD' | 'DESCUENTO' | 'RECARGO' | 'ADICIONAL';

export type TipoAjusteCuota =
    | 'DESCUENTO_FIJO'
    | 'DESCUENTO_PORCENTAJE'
    | 'RECARGO_FIJO'
    | 'RECARGO_PORCENTAJE'
    | 'MONTO_FIJO_TOTAL';

export type AplicaA = 'TOTAL_CUOTA' | 'BASE' | 'ACTIVIDADES' | 'ITEMS_ESPECIFICOS';

export type TipoExencion = 'TOTAL' | 'PARCIAL';

export type EstadoExencion =
    | 'PENDIENTE_APROBACION'
    | 'APROBADA'
    | 'VIGENTE'
    | 'VENCIDA'
    | 'REVOCADA'
    | 'RECHAZADA';

export type MotivoExencion =
    | 'BECA'
    | 'SOCIO_FUNDADOR'
    | 'SOCIO_HONORARIO'
    | 'SITUACION_ECONOMICA'
    | 'MERITO_ACADEMICO'
    | 'COLABORACION_INSTITUCIONAL'
    | 'EMERGENCIA_FAMILIAR'
    | 'OTRO';

// Interfaces

export interface CategoriaItem {
    codigo: CategoriaItemCodigo;
    nombre: string;
}

export interface TipoItemCuota {
    id: number;
    codigo: string;
    nombre: string;
    categoriaItemId: number;
    categoriaItem: CategoriaItem;
    activo: boolean;
}

export interface ItemCuota {
    id: number;
    cuotaId: number;
    tipoItemId: number;
    concepto: string;
    monto: number;
    cantidad: number;
    porcentaje?: number | null;
    esAutomatico: boolean;
    esEditable: boolean;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
    tipoItem: TipoItemCuota;
}

export interface MedioPago {
    id: number;
    nombre: string;
    // Add other relevant fields if needed
}

export interface Recibo {
    id: number;
    numero: string;
    tipo: 'CUOTA' | 'VENTA' | 'DONACION' | 'OTRO';
    receptorId: number;
    emisorId?: number;
    importe: number;
    concepto: string;
    fecha: string; // ISO Date
    fechaVencimiento?: string; // ISO Date
    estado: EstadoRecibo;
    observaciones?: string;
    createdAt: string; // ISO Date
    updatedAt: string; // ISO Date
    receptor: Persona;
    mediosPago: MedioPago[];
}

export interface Cuota {
    id: number;
    reciboId: number;
    mes: number;
    anio: number;
    montoBase: number | null; // V2: deprecated (usar items)
    montoActividades: number | null; // V2: deprecated (usar items)
    montoTotal: number;
    categoriaId: number;
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601

    // Relaciones opcionales (populated by backend when requested)
    recibo?: Recibo;
    items?: ItemCuota[];
    categoria?: {
        id: number;
        codigo: CategoriaSocio;
        nombre: string;
        descripcion?: string;
        activo: boolean;
    };
}

export interface AjusteCuotaSocio {
    id: number;
    personaId: number;
    tipoAjuste: TipoAjusteCuota;
    valor: number;
    concepto: string;
    motivo?: string;
    fechaInicio: string; // ISO Date
    fechaFin?: string | null; // ISO Date
    aplicaA: AplicaA;
    itemsAfectados?: number[];
    activo: boolean;
    createdAt: string; // ISO Date
    updatedAt: string; // ISO Date
}

export interface ExencionCuota {
    id: number;
    personaId: number;
    tipoExencion: TipoExencion;
    motivoExencion: MotivoExencion;
    porcentaje: number;
    fechaInicio: string; // ISO Date
    fechaFin?: string; // ISO Date
    estado: EstadoExencion;
    justificacion: string;
    documentacionAdjunta?: string;
    observaciones?: string;
    aprobadoPor?: string;
    rechazadoPor?: string;
    createdAt: string; // ISO Date
    updatedAt: string; // ISO Date
}

// Reporting DTOs based on the guide

export interface DashboardMetric {
    totalCuotas: number;
    totalRecaudado: number;
    totalPendiente: number;
    tasaCobro: number;
    promedioMonto: number;
    totalDescuentos: number;
}

export interface DashboardData {
    periodo: {
        mes: number;
        anio: number;
        nombreMes: string;
    };
    metricas: DashboardMetric;
    distribucion: {
        porCategoria: Record<CategoriaSocio, { cantidad: number; monto: number }>;
        porEstado: Record<EstadoRecibo, { cantidad: number; monto: number }>;
    };
    tendencias: {
        variacionMesAnterior: number;
        proyeccionRecaudacion: number;
    };
}

// API Request/Response DTOs

export interface CrearCuotaRequest {
    reciboId: number;
    categoriaId: number;
    mes: number;
    anio: number;
    montoBase?: number | null; // V2: deprecated (calculado desde items)
    montoActividades?: number | null; // V2: deprecated (calculado desde items)
    montoTotal: number;
}

export interface GenerarCuotasRequest {
    mes: number;
    anio: number;
    categoriaIds?: number[];
    aplicarDescuentos: boolean;
    incluirInactivos: boolean;
    observaciones?: string;
}

export interface GeneracionCuotasResponse {
    generated: number;
    errors: any[];
    cuotas: any[]; // Define specific type if needed
    resumenDescuentos: {
        totalSociosConDescuento: number;
        montoTotalDescuentos: number;
        reglasAplicadas: Record<string, number>;
    };
}

export interface ValidacionGeneracionResponse {
    puedeGenerar: boolean;
    sociosPorGenerar: number;
    cuotasExistentes: number;
    warnings: string[];
    sociosSinCategoria: number;
    sociosInactivos: number;
}

export interface RecalcularCuotaRequest {
    aplicarAjustes: boolean;
    aplicarExenciones: boolean;
    aplicarDescuentos: boolean;
}

export interface CambioValor {
    antes: number;
    despues: number;
    diferencia: number;
}

export interface RecalculoResponse {
    cuotaOriginal: Cuota;
    cuotaRecalculada: Cuota;
    cambios: {
        montoBase: CambioValor;
        montoActividades: CambioValor;
        montoTotal: CambioValor;
        ajustesAplicados: any[];
        exencionesAplicadas: any[];
    };
}

export interface CrearAjusteRequest {
    personaId: number;
    tipoAjuste: TipoAjusteCuota;
    valor: number;
    concepto: string;
    motivo?: string | null;
    fechaInicio: string;
    fechaFin?: string | null;
    aplicaA: AplicaA;
    itemsAfectados?: number[];
    activo: boolean;
}

export interface SolicitarExencionRequest {
    personaId: number;
    tipoExencion: TipoExencion;
    motivoExencion: MotivoExencion;
    porcentaje: number;
    fechaInicio: string;
    fechaFin: string;
    justificacion: string;
    documentacionAdjunta?: string;
    observaciones?: string;
}

export interface AprobarExencionRequest {
    aprobadoPor: string;
    observacionesAprobacion?: string;
}

export interface RechazarExencionRequest {
    rechazadoPor: string;
    motivoRechazo: string;
}

export interface RevocarExencionRequest {
    motivoRevocacion: string;
    usuario: string;
}
