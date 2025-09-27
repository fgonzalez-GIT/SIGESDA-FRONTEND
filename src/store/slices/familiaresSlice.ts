import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface RelacionFamiliar {
  id: number;
  personaId: number;
  familiarId: number;
  tipoRelacion: 'padre' | 'madre' | 'hijo' | 'hija' | 'esposo' | 'esposa' | 'hermano' | 'hermana' | 'abuelo' | 'abuela' | 'nieto' | 'nieta' | 'tio' | 'tia' | 'primo' | 'prima' | 'otro';
  descripcion?: string;
  fechaCreacion: string;
  activo: boolean;
  responsableFinanciero: boolean; // Si es responsable de los pagos del familiar
  autorizadoRetiro: boolean; // Si está autorizado a retirar al familiar
  contactoEmergencia: boolean; // Si es contacto de emergencia
  porcentajeDescuento?: number; // Descuento aplicable por relación familiar
}

export interface GrupoFamiliar {
  id: number;
  nombre: string;
  descripcion?: string;
  personaReferente: number; // ID de la persona principal del grupo
  miembros: number[]; // IDs de personas en el grupo
  descuentoGrupal: number; // Porcentaje de descuento para el grupo
  fechaCreacion: string;
  activo: boolean;
  configuracion: {
    facturacionConjunta: boolean; // Si se factura todo al referente
    descuentoProgresivo: boolean; // Si el descuento aumenta por cantidad
    limiteCuotas: number; // Límite de cuotas con descuento
  };
}

export interface PersonaConFamiliares {
  id: number;
  nombre: string;
  apellido: string;
  tipo: 'socio' | 'docente' | 'estudiante';
  familiares: Array<{
    familiar: {
      id: number;
      nombre: string;
      apellido: string;
      tipo: 'socio' | 'docente' | 'estudiante';
    };
    relacion: RelacionFamiliar;
  }>;
  grupoFamiliar?: GrupoFamiliar;
}

export interface CrearRelacionRequest {
  personaId: number;
  familiarId: number;
  tipoRelacion: RelacionFamiliar['tipoRelacion'];
  descripcion?: string;
  responsableFinanciero?: boolean;
  autorizadoRetiro?: boolean;
  contactoEmergencia?: boolean;
  porcentajeDescuento?: number;
}

export interface CrearGrupoFamiliarRequest {
  nombre: string;
  descripcion?: string;
  personaReferente: number;
  miembros: number[];
  descuentoGrupal: number;
  configuracion: GrupoFamiliar['configuracion'];
}

export interface FamiliaresFilters {
  personaId?: number;
  tipoRelacion?: RelacionFamiliar['tipoRelacion'];
  responsableFinanciero?: boolean;
  contactoEmergencia?: boolean;
  grupoId?: number;
  activo?: boolean;
}

interface FamiliaresState {
  relaciones: RelacionFamiliar[];
  grupos: GrupoFamiliar[];
  personasConFamiliares: PersonaConFamiliares[];
  filteredRelaciones: RelacionFamiliar[];
  filters: FamiliaresFilters;
  loading: boolean;
  error: string | null;
  currentPersona: PersonaConFamiliares | null;
  estadisticas: {
    totalRelaciones: number;
    totalGrupos: number;
    personasConFamiliares: number;
    relacionesPorTipo: { [key: string]: number };
    descuentoPromedio: number;
  };
}

const initialState: FamiliaresState = {
  relaciones: [],
  grupos: [],
  personasConFamiliares: [],
  filteredRelaciones: [],
  filters: {},
  loading: false,
  error: null,
  currentPersona: null,
  estadisticas: {
    totalRelaciones: 0,
    totalGrupos: 0,
    personasConFamiliares: 0,
    relacionesPorTipo: {},
    descuentoPromedio: 0,
  },
};

// Mock API functions
const familiaresAPI = {
  getRelaciones: async (filters: FamiliaresFilters = {}): Promise<RelacionFamiliar[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockRelaciones: RelacionFamiliar[] = [
      {
        id: 1,
        personaId: 1,
        familiarId: 2,
        tipoRelacion: 'esposa',
        descripcion: 'Cónyuge',
        fechaCreacion: '2025-01-15',
        activo: true,
        responsableFinanciero: false,
        autorizadoRetiro: true,
        contactoEmergencia: true,
        porcentajeDescuento: 10,
      },
      {
        id: 2,
        personaId: 1,
        familiarId: 3,
        tipoRelacion: 'hijo',
        descripcion: 'Hijo menor',
        fechaCreacion: '2025-01-15',
        activo: true,
        responsableFinanciero: true,
        autorizadoRetiro: true,
        contactoEmergencia: false,
        porcentajeDescuento: 15,
      },
      {
        id: 3,
        personaId: 2,
        familiarId: 1,
        tipoRelacion: 'esposo',
        descripcion: 'Cónyuge',
        fechaCreacion: '2025-01-15',
        activo: true,
        responsableFinanciero: true,
        autorizadoRetiro: true,
        contactoEmergencia: true,
      },
      {
        id: 4,
        personaId: 2,
        familiarId: 3,
        tipoRelacion: 'hijo',
        descripcion: 'Hijo',
        fechaCreacion: '2025-01-15',
        activo: true,
        responsableFinanciero: false,
        autorizadoRetiro: true,
        contactoEmergencia: false,
        porcentajeDescuento: 15,
      },
    ];

    return mockRelaciones.filter(relacion => {
      if (filters.personaId && relacion.personaId !== filters.personaId) return false;
      if (filters.tipoRelacion && relacion.tipoRelacion !== filters.tipoRelacion) return false;
      if (filters.responsableFinanciero !== undefined && relacion.responsableFinanciero !== filters.responsableFinanciero) return false;
      if (filters.contactoEmergencia !== undefined && relacion.contactoEmergencia !== filters.contactoEmergencia) return false;
      if (filters.activo !== undefined && relacion.activo !== filters.activo) return false;
      return true;
    });
  },

  getGrupos: async (): Promise<GrupoFamiliar[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
      {
        id: 1,
        nombre: 'Familia Pérez',
        descripcion: 'Grupo familiar principal',
        personaReferente: 1,
        miembros: [1, 2, 3],
        descuentoGrupal: 20,
        fechaCreacion: '2025-01-15',
        activo: true,
        configuracion: {
          facturacionConjunta: true,
          descuentoProgresivo: true,
          limiteCuotas: 0,
        },
      },
      {
        id: 2,
        nombre: 'Familia García',
        descripcion: 'Hermanos García',
        personaReferente: 4,
        miembros: [4, 5],
        descuentoGrupal: 15,
        fechaCreacion: '2025-02-01',
        activo: true,
        configuracion: {
          facturacionConjunta: false,
          descuentoProgresivo: false,
          limiteCuotas: 2,
        },
      },
    ];
  },

  getPersonasConFamiliares: async (): Promise<PersonaConFamiliares[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));

    return [
      {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        tipo: 'socio',
        familiares: [
          {
            familiar: { id: 2, nombre: 'María', apellido: 'González', tipo: 'socio' },
            relacion: {
              id: 1,
              personaId: 1,
              familiarId: 2,
              tipoRelacion: 'esposa',
              descripcion: 'Cónyuge',
              fechaCreacion: '2025-01-15',
              activo: true,
              responsableFinanciero: false,
              autorizadoRetiro: true,
              contactoEmergencia: true,
              porcentajeDescuento: 10,
            }
          },
          {
            familiar: { id: 3, nombre: 'Pedro', apellido: 'Pérez', tipo: 'estudiante' },
            relacion: {
              id: 2,
              personaId: 1,
              familiarId: 3,
              tipoRelacion: 'hijo',
              descripcion: 'Hijo menor',
              fechaCreacion: '2025-01-15',
              activo: true,
              responsableFinanciero: true,
              autorizadoRetiro: true,
              contactoEmergencia: false,
              porcentajeDescuento: 15,
            }
          }
        ],
        grupoFamiliar: {
          id: 1,
          nombre: 'Familia Pérez',
          descripcion: 'Grupo familiar principal',
          personaReferente: 1,
          miembros: [1, 2, 3],
          descuentoGrupal: 20,
          fechaCreacion: '2025-01-15',
          activo: true,
          configuracion: {
            facturacionConjunta: true,
            descuentoProgresivo: true,
            limiteCuotas: 0,
          },
        },
      },
    ];
  },

  crearRelacion: async (request: CrearRelacionRequest): Promise<RelacionFamiliar> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      id: Date.now(),
      personaId: request.personaId,
      familiarId: request.familiarId,
      tipoRelacion: request.tipoRelacion,
      descripcion: request.descripcion,
      fechaCreacion: new Date().toISOString().split('T')[0],
      activo: true,
      responsableFinanciero: request.responsableFinanciero || false,
      autorizadoRetiro: request.autorizadoRetiro || false,
      contactoEmergencia: request.contactoEmergencia || false,
      porcentajeDescuento: request.porcentajeDescuento,
    };
  },

  crearGrupoFamiliar: async (request: CrearGrupoFamiliarRequest): Promise<GrupoFamiliar> => {
    await new Promise(resolve => setTimeout(resolve, 700));

    return {
      id: Date.now(),
      nombre: request.nombre,
      descripcion: request.descripcion,
      personaReferente: request.personaReferente,
      miembros: request.miembros,
      descuentoGrupal: request.descuentoGrupal,
      fechaCreacion: new Date().toISOString().split('T')[0],
      activo: true,
      configuracion: request.configuracion,
    };
  },

  eliminarRelacion: async (id: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  actualizarRelacion: async (id: number, relacion: Partial<RelacionFamiliar>): Promise<RelacionFamiliar> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { id, ...relacion } as RelacionFamiliar;
  },
};

// Async thunks
export const fetchRelaciones = createAsyncThunk(
  'familiares/fetchRelaciones',
  async (filters: FamiliaresFilters = {}) => {
    return await familiaresAPI.getRelaciones(filters);
  }
);

export const fetchGrupos = createAsyncThunk(
  'familiares/fetchGrupos',
  async () => {
    return await familiaresAPI.getGrupos();
  }
);

export const fetchPersonasConFamiliares = createAsyncThunk(
  'familiares/fetchPersonasConFamiliares',
  async () => {
    return await familiaresAPI.getPersonasConFamiliares();
  }
);

export const crearRelacion = createAsyncThunk(
  'familiares/crearRelacion',
  async (request: CrearRelacionRequest) => {
    return await familiaresAPI.crearRelacion(request);
  }
);

export const crearGrupoFamiliar = createAsyncThunk(
  'familiares/crearGrupoFamiliar',
  async (request: CrearGrupoFamiliarRequest) => {
    return await familiaresAPI.crearGrupoFamiliar(request);
  }
);

export const eliminarRelacion = createAsyncThunk(
  'familiares/eliminarRelacion',
  async (id: number) => {
    await familiaresAPI.eliminarRelacion(id);
    return id;
  }
);

export const actualizarRelacion = createAsyncThunk(
  'familiares/actualizarRelacion',
  async ({ id, relacion }: { id: number; relacion: Partial<RelacionFamiliar> }) => {
    return await familiaresAPI.actualizarRelacion(id, relacion);
  }
);

const familiaresSlice = createSlice({
  name: 'familiares',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<FamiliaresFilters>) => {
      state.filters = action.payload;
      state.filteredRelaciones = state.relaciones.filter(relacion => {
        const filters = action.payload;
        if (filters.personaId && relacion.personaId !== filters.personaId) return false;
        if (filters.tipoRelacion && relacion.tipoRelacion !== filters.tipoRelacion) return false;
        if (filters.responsableFinanciero !== undefined && relacion.responsableFinanciero !== filters.responsableFinanciero) return false;
        if (filters.contactoEmergencia !== undefined && relacion.contactoEmergencia !== filters.contactoEmergencia) return false;
        if (filters.activo !== undefined && relacion.activo !== filters.activo) return false;
        return true;
      });
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredRelaciones = state.relaciones;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPersona: (state, action: PayloadAction<PersonaConFamiliares | null>) => {
      state.currentPersona = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch relaciones
      .addCase(fetchRelaciones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRelaciones.fulfilled, (state, action) => {
        state.loading = false;
        state.relaciones = action.payload;
        state.filteredRelaciones = action.payload;

        // Calcular estadísticas
        state.estadisticas = {
          totalRelaciones: action.payload.length,
          totalGrupos: state.grupos.length,
          personasConFamiliares: [...new Set(action.payload.map(r => r.personaId))].length,
          relacionesPorTipo: action.payload.reduce((acc, r) => {
            acc[r.tipoRelacion] = (acc[r.tipoRelacion] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number }),
          descuentoPromedio: action.payload
            .filter(r => r.porcentajeDescuento)
            .reduce((sum, r) => sum + (r.porcentajeDescuento || 0), 0) /
            action.payload.filter(r => r.porcentajeDescuento).length || 0,
        };
      })
      .addCase(fetchRelaciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar relaciones familiares';
      })

      // Fetch grupos
      .addCase(fetchGrupos.fulfilled, (state, action) => {
        state.grupos = action.payload;
        state.estadisticas.totalGrupos = action.payload.length;
      })

      // Fetch personas con familiares
      .addCase(fetchPersonasConFamiliares.fulfilled, (state, action) => {
        state.personasConFamiliares = action.payload;
      })

      // Crear relación
      .addCase(crearRelacion.fulfilled, (state, action) => {
        state.relaciones.push(action.payload);
        state.filteredRelaciones.push(action.payload);
      })

      // Crear grupo familiar
      .addCase(crearGrupoFamiliar.fulfilled, (state, action) => {
        state.grupos.push(action.payload);
      })

      // Eliminar relación
      .addCase(eliminarRelacion.fulfilled, (state, action) => {
        state.relaciones = state.relaciones.filter(r => r.id !== action.payload);
        state.filteredRelaciones = state.filteredRelaciones.filter(r => r.id !== action.payload);
      })

      // Actualizar relación
      .addCase(actualizarRelacion.fulfilled, (state, action) => {
        const index = state.relaciones.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.relaciones[index] = action.payload;
          const filteredIndex = state.filteredRelaciones.findIndex(r => r.id === action.payload.id);
          if (filteredIndex !== -1) {
            state.filteredRelaciones[filteredIndex] = action.payload;
          }
        }
      });
  },
});

export const { setFilters, clearFilters, clearError, setCurrentPersona } = familiaresSlice.actions;
export default familiaresSlice.reducer;