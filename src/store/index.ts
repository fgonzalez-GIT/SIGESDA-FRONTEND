import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import personasReducer from './slices/personasSlice';
import actividadesReducer from './slices/actividadesSlice';
import aulasReducer from './slices/aulasSlice';
import cuotasReducer from './slices/cuotasSlice';
import recibosReducer from './slices/recibosSlice';
import familiaresReducer from './slices/familiaresSlice';
import seccionesReducer from './slices/seccionesSlice';
import categoriasReducer from './slices/categoriasSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    personas: personasReducer,
    actividades: actividadesReducer,
    aulas: aulasReducer,
    cuotas: cuotasReducer,
    recibos: recibosReducer,
    familiares: familiaresReducer,
    secciones: seccionesReducer,
    categorias: categoriasReducer,
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