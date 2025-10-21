/**
 * Hooks personalizados para gestión de Actividades
 * Basados en la documentación y guía rápida del backend
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  Actividad,
  ActividadesQueryParams,
  PaginatedResponse,
  CatalogosCompletos,
  CreateActividadDTO,
  UpdateActividadDTO,
  HorarioActividad,
  DocenteActividad,
  ParticipacionActividad,
  EstadisticasActividad,
} from '../types/actividad.types';
import {
  actividadesApi,
  listarActividades,
  obtenerActividadPorId,
  crearActividad,
  actualizarActividad,
  eliminarActividad,
} from '../services/actividadesApi';

// ============================================
// HOOK: useCatalogos
// ============================================

interface UseCatalogosResult {
  catalogos: CatalogosCompletos | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar los catálogos necesarios para crear/editar actividades
 * Se debe llamar una sola vez al inicio de la aplicación
 *
 * @example
 * ```tsx
 * const { catalogos, loading } = useCatalogos();
 *
 * if (loading) return <div>Cargando catálogos...</div>;
 *
 * console.log(catalogos.tipos); // Array de tipos
 * console.log(catalogos.categorias); // Array de categorías
 * ```
 */
export const useCatalogos = (): UseCatalogosResult => {
  const [catalogos, setCatalogos] = useState<CatalogosCompletos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalogos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await actividadesApi.obtenerTodosCatalogos();
      setCatalogos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar catálogos');
      console.error('Error cargando catálogos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalogos();
  }, [fetchCatalogos]);

  return { catalogos, loading, error, refetch: fetchCatalogos };
};

// ============================================
// HOOK: useActividades
// ============================================

interface UseActividadesResult {
  actividades: Actividad[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  error: string | null;
  fetchActividades: (params?: ActividadesQueryParams) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook para listar actividades con filtros y paginación
 *
 * @example
 * ```tsx
 * const { actividades, pagination, loading, fetchActividades } = useActividades({
 *   page: 1,
 *   limit: 10,
 *   estadoId: 1, // Solo activas
 *   conCupo: true,
 *   incluirRelaciones: true
 * });
 *
 * // Cambiar página
 * fetchActividades({ page: 2 });
 * ```
 */
export const useActividades = (initialParams?: ActividadesQueryParams): UseActividadesResult => {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState<ActividadesQueryParams | undefined>(initialParams);

  const fetchActividades = useCallback(async (params?: ActividadesQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const mergedParams = { ...currentParams, ...params };
      setCurrentParams(mergedParams);

      const data = await listarActividades(mergedParams);
      setActividades(data.data);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        pages: data.pages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar actividades');
      console.error('Error cargando actividades:', err);
    } finally {
      setLoading(false);
    }
  }, [currentParams]);

  const refetch = useCallback(() => fetchActividades(currentParams), [fetchActividades, currentParams]);

  useEffect(() => {
    fetchActividades(initialParams);
  }, []); // Solo al montar

  return {
    actividades,
    pagination,
    loading,
    error,
    fetchActividades,
    refetch,
  };
};

// ============================================
// HOOK: useActividad
// ============================================

interface UseActividadResult {
  actividad: Actividad | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener una actividad específica por ID
 *
 * @example
 * ```tsx
 * const { actividad, loading } = useActividad(1);
 *
 * if (loading) return <div>Cargando...</div>;
 * if (!actividad) return <div>No encontrada</div>;
 *
 * return <div>{actividad.nombre}</div>;
 * ```
 */
export const useActividad = (actividadId: number | null): UseActividadResult => {
  const [actividad, setActividad] = useState<Actividad | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActividad = useCallback(async () => {
    if (!actividadId) {
      setActividad(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await obtenerActividadPorId(actividadId);
      setActividad(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar actividad');
      console.error('Error cargando actividad:', err);
    } finally {
      setLoading(false);
    }
  }, [actividadId]);

  useEffect(() => {
    fetchActividad();
  }, [fetchActividad]);

  return { actividad, loading, error, refetch: fetchActividad };
};

// ============================================
// HOOK: useActividadMutations
// ============================================

interface UseActividadMutationsResult {
  crear: (data: CreateActividadDTO) => Promise<Actividad>;
  actualizar: (id: number, data: UpdateActividadDTO) => Promise<Actividad>;
  eliminar: (id: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para operaciones de creación, actualización y eliminación de actividades
 *
 * @example
 * ```tsx
 * const { crear, actualizar, eliminar, loading } = useActividadMutations();
 *
 * const handleCrear = async () => {
 *   try {
 *     const nueva = await crear({
 *       codigoActividad: 'CORO-2025',
 *       nombre: 'Coro de Adultos',
 *       tipoActividadId: 1,
 *       categoriaId: 1,
 *       fechaDesde: '2025-03-01T00:00:00.000Z',
 *       horarios: [...]
 *     });
 *     console.log('Actividad creada:', nueva);
 *   } catch (error) {
 *     console.error('Error:', error);
 *   }
 * };
 * ```
 */
export const useActividadMutations = (): UseActividadMutationsResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = useCallback(async (data: CreateActividadDTO): Promise<Actividad> => {
    try {
      setLoading(true);
      setError(null);
      const actividad = await crearActividad(data);
      return actividad;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear actividad';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizar = useCallback(async (id: number, data: UpdateActividadDTO): Promise<Actividad> => {
    try {
      setLoading(true);
      setError(null);
      const actividad = await actualizarActividad(id, data);
      return actividad;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar actividad';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminar = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await eliminarActividad(id);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar actividad';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { crear, actualizar, eliminar, loading, error };
};

// ============================================
// HOOK: useHorariosActividad
// ============================================

interface UseHorariosActividadResult {
  horarios: HorarioActividad[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener los horarios de una actividad específica
 */
export const useHorariosActividad = (actividadId: number | null): UseHorariosActividadResult => {
  const [horarios, setHorarios] = useState<HorarioActividad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHorarios = useCallback(async () => {
    if (!actividadId) {
      setHorarios([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await actividadesApi.obtenerHorariosActividad(actividadId);
      setHorarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar horarios');
      console.error('Error cargando horarios:', err);
    } finally {
      setLoading(false);
    }
  }, [actividadId]);

  useEffect(() => {
    fetchHorarios();
  }, [fetchHorarios]);

  return { horarios, loading, error, refetch: fetchHorarios };
};

// ============================================
// HOOK: useDocentesActividad
// ============================================

interface UseDocentesActividadResult {
  docentes: DocenteActividad[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener los docentes asignados a una actividad
 */
export const useDocentesActividad = (actividadId: number | null): UseDocentesActividadResult => {
  const [docentes, setDocentes] = useState<DocenteActividad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocentes = useCallback(async () => {
    if (!actividadId) {
      setDocentes([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await actividadesApi.obtenerDocentesActividad(actividadId);
      setDocentes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar docentes');
      console.error('Error cargando docentes:', err);
    } finally {
      setLoading(false);
    }
  }, [actividadId]);

  useEffect(() => {
    fetchDocentes();
  }, [fetchDocentes]);

  return { docentes, loading, error, refetch: fetchDocentes };
};

// ============================================
// HOOK: useParticipantesActividad
// ============================================

interface UseParticipantesActividadResult {
  participantes: ParticipacionActividad[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener los participantes de una actividad
 */
export const useParticipantesActividad = (actividadId: number | null): UseParticipantesActividadResult => {
  const [participantes, setParticipantes] = useState<ParticipacionActividad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipantes = useCallback(async () => {
    if (!actividadId) {
      setParticipantes([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await actividadesApi.obtenerParticipantes(actividadId);
      setParticipantes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar participantes');
      console.error('Error cargando participantes:', err);
    } finally {
      setLoading(false);
    }
  }, [actividadId]);

  useEffect(() => {
    fetchParticipantes();
  }, [fetchParticipantes]);

  return { participantes, loading, error, refetch: fetchParticipantes };
};

// ============================================
// HOOK: useEstadisticasActividad
// ============================================

interface UseEstadisticasActividadResult {
  estadisticas: EstadisticasActividad | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener estadísticas de una actividad
 */
export const useEstadisticasActividad = (actividadId: number | null): UseEstadisticasActividadResult => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasActividad | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstadisticas = useCallback(async () => {
    if (!actividadId) {
      setEstadisticas(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await actividadesApi.obtenerEstadisticasActividad(actividadId);
      setEstadisticas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
      console.error('Error cargando estadísticas:', err);
    } finally {
      setLoading(false);
    }
  }, [actividadId]);

  useEffect(() => {
    fetchEstadisticas();
  }, [fetchEstadisticas]);

  return { estadisticas, loading, error, refetch: fetchEstadisticas };
};
