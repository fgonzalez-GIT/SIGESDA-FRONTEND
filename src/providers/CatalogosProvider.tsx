/**
 * Provider de Catálogos para Actividades V2 + Reservas
 * Carga los catálogos una vez al inicio y los hace disponibles globalmente
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useCatalogos } from '../hooks/useActividades';
import estadosReservasApi from '../services/estadosReservasApi';
import type { TipoActividad, CategoriaActividad, EstadoActividad, DiaSemana, RolDocente } from '../types/actividad.types';
import type { EstadoReserva } from '../types/reserva.types';

interface Catalogos {
  tiposActividades: TipoActividad[];
  categoriasActividades: CategoriaActividad[];
  estadosActividades: EstadoActividad[];
  diasSemana: DiaSemana[];
  rolesDocentes: RolDocente[];
  estadosReservas: EstadoReserva[]; // NUEVO
}

interface CatalogosContextType {
  catalogos: Catalogos | null;
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
  const { catalogos, loading: loadingActividades, error: errorActividades, refetch: refetchActividades } = useCatalogos();
  const [estadosReservas, setEstadosReservas] = useState<EstadoReserva[]>([]);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [errorReservas, setErrorReservas] = useState<string | null>(null);

  // Cargar estados de reservas al montar
  useEffect(() => {
    const loadEstadosReservas = async () => {
      try {
        setLoadingReservas(true);
        const estados = await estadosReservasApi.getAll({
          activo: true,
          orderBy: 'orden',
          orderDir: 'asc'
        });
        setEstadosReservas(estados);
        setErrorReservas(null);
        console.log('✅ Estados de reservas cargados:', estados.length);
      } catch (err: any) {
        console.error('❌ Error al cargar estados de reservas:', err);
        setErrorReservas(err.response?.data?.message || 'Error al cargar estados de reservas');
      } finally {
        setLoadingReservas(false);
      }
    };

    loadEstadosReservas();
  }, []);

  // Función para recargar ambos catálogos
  const refetch = async () => {
    await refetchActividades();
    setLoadingReservas(true);
    try {
      const estados = await estadosReservasApi.getAll({
        activo: true,
        orderBy: 'orden',
        orderDir: 'asc'
      });
      setEstadosReservas(estados);
      setErrorReservas(null);
    } catch (err: any) {
      setErrorReservas(err.response?.data?.message || 'Error al cargar estados de reservas');
    } finally {
      setLoadingReservas(false);
    }
  };

  // Combinar loading y error
  const loading = loadingActividades || loadingReservas;
  const error = errorActividades || errorReservas;

  // Tomar solo 7 días de semana (eliminar duplicados si existen) + agregar estados de reservas
  const catalogosFiltrados = React.useMemo(() => {
    if (!catalogos) return null;

    // Si hay exactamente 7 días, usarlos tal cual
    // Si hay más (duplicados), tomar solo los primeros 7 únicos por nombre
    const diasUnicos = catalogos.diasSemana.reduce((acc, dia) => {
      if (!acc.find(d => d.nombre === dia.nombre) && acc.length < 7) {
        acc.push(dia);
      }
      return acc;
    }, [] as typeof catalogos.diasSemana);

    // Debug: verificar los días cargados
    console.log('🔍 Días de semana originales:', catalogos.diasSemana.map(d => ({ id: d.id, nombre: d.nombre })));
    console.log('✅ Días de semana usados:', diasUnicos.map(d => ({ id: d.id, nombre: d.nombre })));

    return {
      ...catalogos,
      diasSemana: diasUnicos,
      estadosReservas, // AGREGAR estados de reservas
    };
  }, [catalogos, estadosReservas]);

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
    <CatalogosContext.Provider value={{ catalogos: catalogosFiltrados, loading, error, refetch }}>
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
