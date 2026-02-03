import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import driverReducer from './slices/driverSlice';
import loadReducer from './slices/loadSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    driver: driverReducer,
    loads: loadReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;
