import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import personasReducer from './slices/personasSlice';
import actividadesReducer from './slices/actividadesSlice';
import aulasReducer from './slices/aulasSlice';
import cuotasReducer from './slices/cuotasSlice';
import recibosReducer from './slices/recibosSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    personas: personasReducer,
    actividades: actividadesReducer,
    aulas: aulasReducer,
    cuotas: cuotasReducer,
    recibos: recibosReducer,
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