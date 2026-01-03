import axios from 'axios';
import {
    ExencionCuota,
    SolicitarExencionRequest,
    AprobarExencionRequest,
    RechazarExencionRequest,
    RevocarExencionRequest
} from '../types/cuota.types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

const exencionesAPI = axios.create({
    baseURL: `${API_BASE_URL}/exenciones-cuota`,
    headers: {
        'Content-Type': 'application/json',
    },
});

exencionesAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

export const exencionesService = {
    solicitarExencion: async (solicitud: SolicitarExencionRequest): Promise<ExencionCuota> => {
        const response = await exencionesAPI.post<ApiResponse<ExencionCuota>>('/', solicitud);
        return response.data.data;
    },

    aprobarExencion: async (id: number, datos: AprobarExencionRequest): Promise<void> => {
        await exencionesAPI.post(`/${id}/aprobar`, datos);
    },

    rechazarExencion: async (id: number, datos: RechazarExencionRequest): Promise<void> => {
        await exencionesAPI.post(`/${id}/rechazar`, datos);
    },

    revocarExencion: async (id: number, datos: RevocarExencionRequest): Promise<void> => {
        await exencionesAPI.post(`/${id}/revocar`, datos);
    },

    checkExencionActiva: async (personaId: number, fecha?: string): Promise<{ tieneExencion: boolean; porcentaje?: number; exencion?: ExencionCuota }> => {
        const fechaCheck = fecha || new Date().toISOString().split('T')[0];
        const response = await exencionesAPI.get<ApiResponse<any>>(`/check/${personaId}/${fechaCheck}`);
        return response.data.data;
    }
};

export default exencionesService;
