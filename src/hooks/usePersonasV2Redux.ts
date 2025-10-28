import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  fetchCatalogosPersonasV2,
  fetchPersonasV2,
  fetchPersonaV2ById,
  createPersonaV2,
  updatePersonaV2,
  deletePersonaV2,
  setFilters,
  resetFilters,
  setSelectedPersona,
  clearError,
} from '../store/slices/personasV2Slice';
import type {
  PersonasV2QueryParams,
  CreatePersonaV2DTO,
  UpdatePersonaV2DTO,
} from '../types/personaV2.types';

/**
 * Hook para gestionar Personas V2 usando Redux
 * Alternativa al hook usePersonasV2 que usa estado local
 *
 * Ventajas de usar Redux:
 * - Estado global compartido entre componentes
 * - Cache automático de datos
 * - Mejor para aplicaciones grandes con múltiples vistas de personas
 *
 * @example
 * ```tsx
 * const { personas, loading, pagination, filters, updateFilters } = usePersonasV2WithRedux();
 * ```
 */
export const usePersonasV2WithRedux = () => {
  const dispatch = useAppDispatch();
  const {
    personas,
    loading,
    error,
    pagination,
    filters,
    selectedPersona,
    selectedPersonaLoading,
  } = useAppSelector((state) => state.personasV2);

  // Cargar personas automáticamente cuando cambian los filtros
  useEffect(() => {
    dispatch(fetchPersonasV2(filters));
  }, [dispatch, JSON.stringify(filters)]);

  const updateFilters = (newFilters: PersonasV2QueryParams) => {
    dispatch(setFilters(newFilters));
  };

  const resetAllFilters = () => {
    dispatch(resetFilters());
  };

  const selectPersona = (id: number) => {
    dispatch(fetchPersonaV2ById(id));
  };

  const createPersona = async (data: CreatePersonaV2DTO) => {
    const result = await dispatch(createPersonaV2(data));
    if (createPersonaV2.fulfilled.match(result)) {
      return result.payload;
    }
    throw new Error(result.payload as string);
  };

  const updatePersona = async (id: number, data: UpdatePersonaV2DTO) => {
    const result = await dispatch(updatePersonaV2({ id, data }));
    if (updatePersonaV2.fulfilled.match(result)) {
      return result.payload;
    }
    throw new Error(result.payload as string);
  };

  const deletePersona = async (id: number) => {
    const result = await dispatch(deletePersonaV2(id));
    if (deletePersonaV2.fulfilled.match(result)) {
      return result.payload;
    }
    throw new Error(result.payload as string);
  };

  const refetch = () => {
    dispatch(fetchPersonasV2(filters));
  };

  const clearErrors = () => {
    dispatch(clearError());
  };

  return {
    // Estado
    personas,
    loading,
    error,
    pagination,
    filters,
    selectedPersona,
    selectedPersonaLoading,

    // Acciones
    updateFilters,
    resetFilters: resetAllFilters,
    selectPersona,
    createPersona,
    updatePersona,
    deletePersona,
    refetch,
    clearErrors,
  };
};

/**
 * Hook para gestionar catálogos de Personas V2 usando Redux
 *
 * @example
 * ```tsx
 * const { catalogos, loading, error } = useCatalogosPersonasV2WithRedux();
 * ```
 */
export const useCatalogosPersonasV2WithRedux = () => {
  const dispatch = useAppDispatch();
  const { catalogos, catalogosLoading, catalogosError } = useAppSelector(
    (state) => state.personasV2
  );

  // Cargar catálogos automáticamente al montar el componente
  useEffect(() => {
    if (!catalogos) {
      dispatch(fetchCatalogosPersonasV2());
    }
  }, [dispatch, catalogos]);

  const refetch = () => {
    dispatch(fetchCatalogosPersonasV2());
  };

  return {
    catalogos,
    loading: catalogosLoading,
    error: catalogosError,
    refetch,
  };
};

/**
 * Hook para gestionar una persona específica usando Redux
 *
 * @example
 * ```tsx
 * const { persona, loading, error, loadPersona } = usePersonaV2WithRedux(123);
 * ```
 */
export const usePersonaV2WithRedux = (personaId?: number) => {
  const dispatch = useAppDispatch();
  const { selectedPersona, selectedPersonaLoading, error } = useAppSelector(
    (state) => state.personasV2
  );

  useEffect(() => {
    if (personaId) {
      dispatch(fetchPersonaV2ById(personaId));
    }
  }, [dispatch, personaId]);

  const loadPersona = (id: number) => {
    dispatch(fetchPersonaV2ById(id));
  };

  const clearSelection = () => {
    dispatch(setSelectedPersona(null));
  };

  return {
    persona: selectedPersona,
    loading: selectedPersonaLoading,
    error,
    loadPersona,
    clearSelection,
  };
};
