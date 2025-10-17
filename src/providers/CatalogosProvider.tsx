/**
 * Provider de Catálogos para Actividades V2
 * Carga los catálogos una vez al inicio y los hace disponibles globalmente
 */

import React, { createContext, useContext } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useCatalogos } from '../hooks/useActividadesV2';
import type { CatalogosCompletos } from '../types/actividadV2.types';

interface CatalogosContextType {
  catalogos: CatalogosCompletos | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CatalogosContext = createContext<CatalogosContextType | null>(null);

interface CatalogosProviderProps {
  children: React.ReactNode;
}

/**
 * Provider que carga los catálogos al inicio de la aplicación
 * y los hace disponibles para todos los componentes
 */
export const CatalogosProvider: React.FC<CatalogosProviderProps> = ({ children }) => {
  const { catalogos, loading, error, refetch } = useCatalogos();

  // Mostrar loading mientras carga
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Box>Cargando catálogos del sistema...</Box>
      </Box>
    );
  }

  // Mostrar error si falla la carga
  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={3}
      >
        <Alert
          severity="error"
          action={
            <button onClick={() => refetch()}>
              Reintentar
            </button>
          }
        >
          Error al cargar catálogos: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <CatalogosContext.Provider value={{ catalogos, loading, error, refetch }}>
      {children}
    </CatalogosContext.Provider>
  );
};

/**
 * Hook para usar los catálogos en cualquier componente
 *
 * @example
 * ```tsx
 * const { catalogos } = useCatalogosContext();
 *
 * return (
 *   <select>
 *     {catalogos?.tipos.map(tipo => (
 *       <option key={tipo.id} value={tipo.id}>
 *         {tipo.nombre}
 *       </option>
 *     ))}
 *   </select>
 * );
 * ```
 */
export const useCatalogosContext = (): CatalogosContextType => {
  const context = useContext(CatalogosContext);

  if (!context) {
    throw new Error('useCatalogosContext debe ser usado dentro de un CatalogosProvider');
  }

  return context;
};

export default CatalogosProvider;
