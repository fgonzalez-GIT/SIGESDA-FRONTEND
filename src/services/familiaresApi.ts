/**
 * API Service para Familiares - Conectado con Backend Real
 *
 * Mapea los campos entre frontend y backend:
 * Frontend -> Backend
 * - personaId -> socioId
 * - responsableFinanciero -> permisoResponsableFinanciero
 * - contactoEmergencia -> permisoContactoEmergencia
 * - autorizadoRetiro -> permisoAutorizadoRetiro
 * - porcentajeDescuento -> descuento
 * - tipoRelacion (minúsculas) -> parentesco (mayúsculas)
 */

import { RelacionFamiliar, CrearRelacionRequest } from '../store/slices/familiaresSlice';

// Usar la variable de entorno que apunta al proxy de Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Mapeo de tipos de relación: frontend (minúsculas) -> backend (mayúsculas)
const tipoRelacionMap: Record<string, string> = {
  'padre': 'PADRE',
  'madre': 'MADRE',
  'hijo': 'HIJO',
  'hija': 'HIJA',
  'esposo': 'CONYUGE',
  'esposa': 'CONYUGE',
  'hermano': 'HERMANO',
  'hermana': 'HERMANA',
  'abuelo': 'ABUELO',
  'abuela': 'ABUELA',
  'nieto': 'NIETO',
  'nieta': 'NIETA',
  'tio': 'TIO',
  'tia': 'TIA',
  'primo': 'PRIMO',
  'prima': 'PRIMA',
  'otro': 'OTRO',
};

// Mapeo inverso: backend -> frontend
const parentescoToTipoRelacion: Record<string, RelacionFamiliar['tipoRelacion']> = {
  'PADRE': 'padre',
  'MADRE': 'madre',
  'HIJO': 'hijo',
  'HIJA': 'hija',
  'CONYUGE': 'esposo', // o 'esposa' según el contexto
  'HERMANO': 'hermano',
  'HERMANA': 'hermana',
  'ABUELO': 'abuelo',
  'ABUELA': 'abuela',
  'NIETO': 'nieto',
  'NIETA': 'nieta',
  'TIO': 'tio',
  'TIA': 'tia',
  'PRIMO': 'primo',
  'PRIMA': 'prima',
  'OTRO': 'otro',
};

// Mapear request de frontend a backend
const mapRequestToBackend = (request: CrearRelacionRequest) => {
  return {
    socioId: request.personaId,
    familiarId: request.familiarId,
    parentesco: tipoRelacionMap[request.tipoRelacion] || 'OTRO',
    descripcion: request.descripcion || '',
    permisoResponsableFinanciero: request.responsableFinanciero || false,
    permisoContactoEmergencia: request.contactoEmergencia || false,
    permisoAutorizadoRetiro: request.autorizadoRetiro || false,
    descuento: request.porcentajeDescuento || 0,
    activo: true,
    grupoFamiliarId: null,
  };
};

// Mapear respuesta de backend a frontend
const mapRelacionFromBackend = (backendRelacion: any): any => {
  return {
    id: backendRelacion.id,
    personaId: backendRelacion.socioId,
    familiarId: backendRelacion.familiarId,
    tipoRelacion: parentescoToTipoRelacion[backendRelacion.parentesco] || 'otro',
    descripcion: backendRelacion.descripcion,
    fechaCreacion: backendRelacion.createdAt,
    activo: backendRelacion.activo,
    responsableFinanciero: backendRelacion.permisoResponsableFinanciero,
    autorizadoRetiro: backendRelacion.permisoAutorizadoRetiro,
    contactoEmergencia: backendRelacion.permisoContactoEmergencia,
    porcentajeDescuento: parseFloat(backendRelacion.descuento) || 0,
    // Datos del familiar si están disponibles
    familiar: backendRelacion.familiar ? {
      id: backendRelacion.familiar.id,
      nombre: backendRelacion.familiar.nombre,
      apellido: backendRelacion.familiar.apellido,
      tipo: 'socio', // Por ahora todos son socios según el backend
    } : undefined,
  };
};

export const familiaresApiReal = {
  // Obtener familiares de un socio
  getRelacionesDePersona: async (personaId: number): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/familiares/socio/${personaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // El backend retorna: { success: true, data: [...], meta: {...} }
      if (result.success && Array.isArray(result.data)) {
        return result.data.map(mapRelacionFromBackend);
      }

      return [];
    } catch (error) {
      console.error('Error fetching relaciones de persona:', error);
      throw error;
    }
  },

  // Crear nueva relación
  crearRelacion: async (request: CrearRelacionRequest): Promise<any> => {
    try {
      const backendRequest = mapRequestToBackend(request);

      const response = await fetch(`${API_BASE_URL}/familiares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error response:', errorData);
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Backend success response:', result);

      // El backend retorna: { success: true, message: "...", data: {...} }
      if (result.success && result.data) {
        return mapRelacionFromBackend(result.data);
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Error creating relacion:', error);
      console.error('Request was:', mapRequestToBackend(request));
      throw error;
    }
  },

  // Actualizar relación
  actualizarRelacion: async (id: number, relacion: Partial<RelacionFamiliar>): Promise<any> => {
    try {
      const backendUpdate: any = {};

      // Mapear solo los campos que están presentes
      if (relacion.tipoRelacion) {
        backendUpdate.parentesco = tipoRelacionMap[relacion.tipoRelacion];
      }
      if (relacion.descripcion !== undefined) {
        backendUpdate.descripcion = relacion.descripcion;
      }
      if (relacion.responsableFinanciero !== undefined) {
        backendUpdate.permisoResponsableFinanciero = relacion.responsableFinanciero;
      }
      if (relacion.contactoEmergencia !== undefined) {
        backendUpdate.permisoContactoEmergencia = relacion.contactoEmergencia;
      }
      if (relacion.autorizadoRetiro !== undefined) {
        backendUpdate.permisoAutorizadoRetiro = relacion.autorizadoRetiro;
      }
      if (relacion.porcentajeDescuento !== undefined) {
        backendUpdate.descuento = relacion.porcentajeDescuento;
      }

      const response = await fetch(`${API_BASE_URL}/familiares/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendUpdate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return mapRelacionFromBackend(result.data);
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Error updating relacion:', error);
      throw error;
    }
  },

  // Eliminar relación
  eliminarRelacion: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/familiares/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Eliminación exitosa
    } catch (error) {
      console.error('Error deleting relacion:', error);
      throw error;
    }
  },

  // Obtener todas las personas con familiares (para compatibilidad)
  getPersonasConFamiliares: async (): Promise<any[]> => {
    // Por ahora retornar array vacío ya que este endpoint no está implementado en el backend
    // Se puede implementar más adelante si es necesario
    return [];
  },
};

export default familiaresApiReal;
