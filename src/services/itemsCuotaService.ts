import axios from 'axios';
import { TipoItemCuota, CategoriaItem } from '../types/cuota.types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

const itemsAPI = axios.create({
    baseURL: `${API_BASE_URL}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

itemsAPI.interceptors.request.use((config) => {
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

export const itemsCuotaService = {
    // Catálogos
    getTiposItems: async (): Promise<TipoItemCuota[]> => {
        const response = await itemsAPI.get<ApiResponse<TipoItemCuota[]>>('/catalogos/tipos-items');
        return response.data.data;
    },

    getCategoriasItems: async (): Promise<CategoriaItem[]> => {
        const response = await itemsAPI.get<ApiResponse<CategoriaItem[]>>('/catalogos/categorias-items');
        return response.data.data;
    }
};

export default itemsCuotaService;
