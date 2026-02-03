import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SERVER_CONFIG from '../config/api.config';

// Resolve base URL with a manual override first (useful for physical devices),
// then fall back to emulator-friendly defaults.
const resolvedHost = SERVER_CONFIG?.ACTIVE || ( __DEV__ ? 'http://10.0.2.2:5000' : 'http://3.80.95.96:5000');
const API_BASE_URL = `${resolvedHost.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log detailed error information for debugging
    console.log('[API Error]', {
      message: error.message,
      code: error.code,
      baseURL: API_BASE_URL,
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
