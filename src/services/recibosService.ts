import axios from 'axios';
import { Recibo, GenerarReciboRequest, PagarReciboRequest, RecibosFilters } from '../store/slices/recibosSlice';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

const recibosAPI = axios.create({
  baseURL: `${API_BASE_URL}/recibos`,
  headers: {
    'Content-Type': 'application/json',
  },
});

recibosAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Transforma los datos del backend al formato esperado por el frontend
 */
const transformReciboFromBackend = (backendRecibo: any): Recibo => {
  // Calcular monto pagado desde mediosPago
  const montoPagado = backendRecibo.mediosPago?.reduce(
    (sum: number, medio: any) => sum + parseFloat(medio.importe || '0'),
    0
  ) || 0;

  // Obtener el tipo de persona (primer tipo activo o primer tipo disponible)
  const tipoPersona = backendRecibo.receptor?.tipos?.find((t: any) => t.activo)?.tipoPersona?.codigo ||
                      backendRecibo.receptor?.tipos?.[0]?.tipoPersona?.codigo ||
                      'socio';

  // Normalizar estado a minúsculas para coincidir con el tipo del frontend
  const estadoNormalizado = backendRecibo.estado?.toLowerCase() || 'pendiente';

  // Transformar concepto (string) a conceptos (array)
  // Si hay un cuota.id, lo usamos como cuotaId
  const conceptos = backendRecibo.concepto ? [{
    id: backendRecibo.cuota?.id || backendRecibo.id,
    concepto: backendRecibo.concepto,
    cantidad: 1,
    precio: parseFloat(backendRecibo.importe || '0'),
    subtotal: parseFloat(backendRecibo.importe || '0'),
    cuotaId: backendRecibo.cuota?.id || undefined,
  }] : [];

  return {
    id: backendRecibo.id,
    numero: backendRecibo.numero,
    fechaEmision: backendRecibo.fecha || backendRecibo.createdAt,
    fechaVencimiento: backendRecibo.fechaVencimiento,
    personaId: backendRecibo.receptorId || backendRecibo.receptor?.id,
    personaNombre: backendRecibo.receptor?.nombre || '',
    personaApellido: backendRecibo.receptor?.apellido || '',
    personaTipo: tipoPersona.toLowerCase() as 'socio' | 'docente' | 'estudiante',
    personaEmail: backendRecibo.receptor?.email,
    personaTelefono: backendRecibo.receptor?.telefono,
    conceptos,
    subtotal: parseFloat(backendRecibo.importe || '0'),
    descuentos: 0, // El backend no devuelve este campo separado
    recargos: 0, // El backend no devuelve este campo separado
    total: parseFloat(backendRecibo.importe || '0'),
    estado: estadoNormalizado as 'pendiente' | 'pagado' | 'vencido' | 'cancelado' | 'parcial',
    metodoPago: backendRecibo.mediosPago?.[0]?.tipo?.toLowerCase() as any,
    fechaPago: backendRecibo.mediosPago?.[0]?.fecha,
    montoPagado,
    observaciones: backendRecibo.observaciones,
    cuotaIds: backendRecibo.cuota?.id ? [backendRecibo.cuota.id] : [],
    enviado: false, // El backend no devuelve este campo
    fechaEnvio: undefined,
    archivo: undefined,
  };
};

export const recibosService = {
  // Obtener todos los recibos con filtros opcionales
  getRecibos: async (filters: RecibosFilters = {}): Promise<Recibo[]> => {
    const response = await recibosAPI.get('/', { params: filters });
    const backendRecibos = response.data.data || [];
    return backendRecibos.map(transformReciboFromBackend);
  },

  // Obtener un recibo por ID
  getReciboById: async (id: number): Promise<Recibo> => {
    const response = await recibosAPI.get(`/${id}`);
    return transformReciboFromBackend(response.data.data);
  },

  // Crear un nuevo recibo
  createRecibo: async (recibo: Omit<Recibo, 'id' | 'numero' | 'fechaEmision'>): Promise<Recibo> => {
    const response = await recibosAPI.post('/', recibo);
    return transformReciboFromBackend(response.data.data);
  },

  // Actualizar un recibo existente
  updateRecibo: async (id: number, recibo: Partial<Recibo>): Promise<Recibo> => {
    const response = await recibosAPI.put(`/${id}`, recibo);
    return transformReciboFromBackend(response.data.data);
  },

  // Eliminar un recibo
  deleteRecibo: async (id: number): Promise<void> => {
    await recibosAPI.delete(`/${id}`);
  },

  // Generar recibo desde cuotas
  generarRecibo: async (request: GenerarReciboRequest): Promise<Recibo> => {
    const response = await recibosAPI.post('/generar', request);
    return transformReciboFromBackend(response.data.data);
  },

  // Pagar un recibo
  pagarRecibo: async (request: PagarReciboRequest): Promise<Recibo> => {
    const response = await recibosAPI.post(`/${request.reciboId}/pagar`, request);
    return transformReciboFromBackend(response.data.data);
  },

  // Generar PDF del recibo
  generarPdf: async (reciboId: number): Promise<string> => {
    const response = await recibosAPI.post(`/${reciboId}/pdf`, {}, {
      responseType: 'blob'
    });

    // Crear URL para descargar el PDF
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    return url;
  },

  // Descargar PDF del recibo
  descargarPdf: async (reciboId: number, filename?: string): Promise<void> => {
    const response = await recibosAPI.get(`/${reciboId}/pdf`, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `recibo-${reciboId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Enviar recibo por email
  enviarRecibo: async (reciboId: number, email?: string): Promise<void> => {
    await recibosAPI.post(`/${reciboId}/enviar`, { email });
  },

  // Anular recibo
  anularRecibo: async (reciboId: number, motivo: string): Promise<Recibo> => {
    const response = await recibosAPI.post(`/${reciboId}/anular`, { motivo });
    return transformReciboFromBackend(response.data.data);
  },

  // Duplicar recibo
  duplicarRecibo: async (reciboId: number, fechaVencimiento?: string): Promise<Recibo> => {
    const response = await recibosAPI.post(`/${reciboId}/duplicar`, { fechaVencimiento });
    return transformReciboFromBackend(response.data.data);
  },

  // Obtener estadísticas de recibos
  getEstadisticas: async (filtros?: {
    fechaDesde?: string;
    fechaHasta?: string;
    personaTipo?: string;
  }) => {
    const response = await recibosAPI.get('/stats/resumen', { params: filtros });
    return response.data.data;
  },

  // Obtener recibos vencidos
  getRecibosVencidos: async (): Promise<Recibo[]> => {
    const response = await recibosAPI.get('/vencidos/listado');
    const backendRecibos = response.data.data || [];
    return backendRecibos.map(transformReciboFromBackend);
  },

  // Obtener recibos por vencer (próximos N días)
  getRecibosPorVencer: async (dias: number = 7): Promise<Recibo[]> => {
    const response = await recibosAPI.get('/por-vencer', { params: { dias } });
    const backendRecibos = response.data.data || [];
    return backendRecibos.map(transformReciboFromBackend);
  },

  // Obtener facturación por período
  getFacturacion: async (fechaDesde: string, fechaHasta: string) => {
    const response = await recibosAPI.get('/facturacion', {
      params: { fechaDesde, fechaHasta }
    });
    return response.data.data;
  },

  // Obtener cobranza por período
  getCobranza: async (fechaDesde: string, fechaHasta: string) => {
    const response = await recibosAPI.get('/cobranza', {
      params: { fechaDesde, fechaHasta }
    });
    return response.data.data;
  },

  // Generar reporte de recibos
  generarReporte: async (filtros: RecibosFilters & {
    formato: 'pdf' | 'excel';
    incluirDetalle?: boolean;
    agruparPor?: 'persona' | 'mes' | 'estado';
  }): Promise<Blob> => {
    const response = await recibosAPI.get('/reporte', {
      params: filtros,
      responseType: 'blob',
    });
    return response.data;
  },

  // Obtener recibos por persona
  getRecibosPorPersona: async (personaId: number): Promise<Recibo[]> => {
    const response = await recibosAPI.get(`/persona/${personaId}`);
    const backendRecibos = response.data.data || [];
    return backendRecibos.map(transformReciboFromBackend);
  },

  // Obtener resumen mensual
  getResumenMensual: async (año: number, mes: number) => {
    const response = await recibosAPI.get('/resumen-mensual', {
      params: { año, mes }
    });
    return response.data.data;
  },

  // Aplicar pago parcial
  aplicarPagoParcial: async (reciboId: number, monto: number, metodoPago: string, fecha: string) => {
    const response = await recibosAPI.post(`/${reciboId}/pago-parcial`, {
      monto,
      metodoPago,
      fecha
    });
    return transformReciboFromBackend(response.data.data);
  },

  // Revertir pago
  revertirPago: async (reciboId: number, motivo: string) => {
    const response = await recibosAPI.post(`/${reciboId}/revertir-pago`, { motivo });
    return transformReciboFromBackend(response.data.data);
  },

  // Generar recibos masivos
  generarRecibosMasivos: async (requests: GenerarReciboRequest[]): Promise<Recibo[]> => {
    const response = await recibosAPI.post('/generar-masivos', { recibos: requests });
    const backendRecibos = response.data.data || [];
    return backendRecibos.map(transformReciboFromBackend);
  },

  // Enviar recordatorio de pago
  enviarRecordatorio: async (reciboId: number, tipo: 'email' | 'sms' = 'email') => {
    const response = await recibosAPI.post(`/${reciboId}/recordatorio`, { tipo });
    return response.data.data;
  },

  // Obtener histórico de pagos
  getHistoricoPagos: async (reciboId: number) => {
    const response = await recibosAPI.get(`/${reciboId}/historico-pagos`);
    return response.data.data;
  },

  // Validar datos del recibo
  validarRecibo: async (recibo: Partial<Recibo>) => {
    const response = await recibosAPI.post('/validar', recibo);
    return response.data.data;
  },

  // Obtener siguiente número de recibo
  getSiguienteNumero: async (): Promise<string> => {
    const response = await recibosAPI.get('/siguiente-numero');
    return response.data.data?.numero || response.data.numero;
  },

  // Importar recibos desde archivo
  importarRecibos: async (archivo: File): Promise<{
    exitosos: number;
    errores: Array<{ linea: number; error: string }>;
  }> => {
    const formData = new FormData();
    formData.append('archivo', archivo);

    const response = await recibosAPI.post('/importar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Exportar recibos a archivo
  exportarRecibos: async (filtros: RecibosFilters, formato: 'csv' | 'excel'): Promise<Blob> => {
    const response = await recibosAPI.get('/exportar', {
      params: { ...filtros, formato },
      responseType: 'blob',
    });
    return response.data;
  },
};

export default recibosService;