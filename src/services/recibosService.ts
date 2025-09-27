import axios from 'axios';
import { Recibo, GenerarReciboRequest, PagarReciboRequest, RecibosFilters } from '../store/slices/recibosSlice';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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

export const recibosService = {
  // Obtener todos los recibos con filtros opcionales
  getRecibos: async (filters: RecibosFilters = {}): Promise<Recibo[]> => {
    const response = await recibosAPI.get('/', { params: filters });
    return response.data;
  },

  // Obtener un recibo por ID
  getReciboById: async (id: number): Promise<Recibo> => {
    const response = await recibosAPI.get(`/${id}`);
    return response.data;
  },

  // Crear un nuevo recibo
  createRecibo: async (recibo: Omit<Recibo, 'id' | 'numero' | 'fechaEmision'>): Promise<Recibo> => {
    const response = await recibosAPI.post('/', recibo);
    return response.data;
  },

  // Actualizar un recibo existente
  updateRecibo: async (id: number, recibo: Partial<Recibo>): Promise<Recibo> => {
    const response = await recibosAPI.put(`/${id}`, recibo);
    return response.data;
  },

  // Eliminar un recibo
  deleteRecibo: async (id: number): Promise<void> => {
    await recibosAPI.delete(`/${id}`);
  },

  // Generar recibo desde cuotas
  generarRecibo: async (request: GenerarReciboRequest): Promise<Recibo> => {
    const response = await recibosAPI.post('/generar', request);
    return response.data;
  },

  // Pagar un recibo
  pagarRecibo: async (request: PagarReciboRequest): Promise<Recibo> => {
    const response = await recibosAPI.post(`/${request.reciboId}/pagar`, request);
    return response.data;
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
    return response.data;
  },

  // Duplicar recibo
  duplicarRecibo: async (reciboId: number, fechaVencimiento?: string): Promise<Recibo> => {
    const response = await recibosAPI.post(`/${reciboId}/duplicar`, { fechaVencimiento });
    return response.data;
  },

  // Obtener estadísticas de recibos
  getEstadisticas: async (filtros?: {
    fechaDesde?: string;
    fechaHasta?: string;
    personaTipo?: string;
  }) => {
    const response = await recibosAPI.get('/estadisticas', { params: filtros });
    return response.data;
  },

  // Obtener recibos vencidos
  getRecibosVencidos: async (): Promise<Recibo[]> => {
    const response = await recibosAPI.get('/vencidos');
    return response.data;
  },

  // Obtener recibos por vencer (próximos N días)
  getRecibosPorVencer: async (dias: number = 7): Promise<Recibo[]> => {
    const response = await recibosAPI.get('/por-vencer', { params: { dias } });
    return response.data;
  },

  // Obtener facturación por período
  getFacturacion: async (fechaDesde: string, fechaHasta: string) => {
    const response = await recibosAPI.get('/facturacion', {
      params: { fechaDesde, fechaHasta }
    });
    return response.data;
  },

  // Obtener cobranza por período
  getCobranza: async (fechaDesde: string, fechaHasta: string) => {
    const response = await recibosAPI.get('/cobranza', {
      params: { fechaDesde, fechaHasta }
    });
    return response.data;
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
    return response.data;
  },

  // Obtener resumen mensual
  getResumenMensual: async (año: number, mes: number) => {
    const response = await recibosAPI.get('/resumen-mensual', {
      params: { año, mes }
    });
    return response.data;
  },

  // Aplicar pago parcial
  aplicarPagoParcial: async (reciboId: number, monto: number, metodoPago: string, fecha: string) => {
    const response = await recibosAPI.post(`/${reciboId}/pago-parcial`, {
      monto,
      metodoPago,
      fecha
    });
    return response.data;
  },

  // Revertir pago
  revertirPago: async (reciboId: number, motivo: string) => {
    const response = await recibosAPI.post(`/${reciboId}/revertir-pago`, { motivo });
    return response.data;
  },

  // Generar recibos masivos
  generarRecibosMasivos: async (requests: GenerarReciboRequest[]): Promise<Recibo[]> => {
    const response = await recibosAPI.post('/generar-masivos', { recibos: requests });
    return response.data;
  },

  // Enviar recordatorio de pago
  enviarRecordatorio: async (reciboId: number, tipo: 'email' | 'sms' = 'email') => {
    const response = await recibosAPI.post(`/${reciboId}/recordatorio`, { tipo });
    return response.data;
  },

  // Obtener histórico de pagos
  getHistoricoPagos: async (reciboId: number) => {
    const response = await recibosAPI.get(`/${reciboId}/historico-pagos`);
    return response.data;
  },

  // Validar datos del recibo
  validarRecibo: async (recibo: Partial<Recibo>) => {
    const response = await recibosAPI.post('/validar', recibo);
    return response.data;
  },

  // Obtener siguiente número de recibo
  getSiguienteNumero: async (): Promise<string> => {
    const response = await recibosAPI.get('/siguiente-numero');
    return response.data.numero;
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
    return response.data;
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