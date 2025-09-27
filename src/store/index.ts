import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import personasReducer from './slices/personasSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    personas: personasReducer,
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