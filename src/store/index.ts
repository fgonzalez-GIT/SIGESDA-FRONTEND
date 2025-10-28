import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import personasReducer from './slices/personasSlice';
import personasV2Reducer from './slices/personasV2Slice';
import actividadesReducer from './slices/actividadesSlice';
import aulasReducer from './slices/aulasSlice';
import cuotasReducer from './slices/cuotasSlice';
import recibosReducer from './slices/recibosSlice';
import familiaresReducer from './slices/familiaresSlice';
import categoriasReducer from './slices/categoriasSlice';
import tiposActividadReducer from './slices/tiposActividadSlice';
import categoriasActividadReducer from './slices/categoriasActividadSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    personas: personasReducer,
    personasV2: personasV2Reducer,
    actividades: actividadesReducer,
    aulas: aulasReducer,
    cuotas: cuotasReducer,
    recibos: recibosReducer,
    familiares: familiaresReducer,
    categorias: categoriasReducer,
    tiposActividad: tiposActividadReducer,
    categoriasActividad: categoriasActividadReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;