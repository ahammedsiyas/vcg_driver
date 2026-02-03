import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

const getErrorMessage = (error) => {
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }
  const status = error.response.status;
  const message = error.response.data?.message;

  switch (status) {
    case 400:
      return message?.includes('Missing') ? 'Please fill in all required fields.' : message || 'Invalid input.';
    case 401:
      return message?.includes('credentials') ? 'Incorrect email or password.' : 'Authentication failed.';
    case 409:
      return message?.includes('email') ? 'This email is already registered. Please login instead.' : 'Account already exists.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return message || 'Something went wrong. Please try again.';
  }
};

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, setUser } = authSlice.actions;

// Thunks
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.success) {
      const { token, user } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      dispatch(loginSuccess({ user, token }));
    }
  } catch (error) {
    const friendlyError = getErrorMessage(error);
    dispatch(loginFailure(friendlyError));
  }
};

export const register = (userData) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await api.post('/auth/register', { ...userData, role: 'driver' });
    
    if (response.data.success) {
      const { token, user } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      dispatch(loginSuccess({ user, token }));
    }
  } catch (error) {
    const friendlyError = getErrorMessage(error);
    dispatch(loginFailure(friendlyError));
  }
};

export const logoutUser = () => async (dispatch) => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
  dispatch(logout());
};

export const checkAuth = () => async (dispatch) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userStr = await AsyncStorage.getItem('user');
    
    console.log('[AUTH] Token in storage:', !!token);
    console.log('[AUTH] User in storage:', !!userStr);
    
    if (token && userStr) {
      // Verify token is still valid by calling /auth/me endpoint
      try {
        console.log('[AUTH] Validating token with backend...');
        const response = await api.get('/auth/me');
        console.log('[AUTH] Token is valid, user:', response.data?.user?.email);
        const user = response.data?.user || JSON.parse(userStr);
        dispatch(loginSuccess({ user, token }));
      } catch (error) {
        // Token is invalid or expired
        console.log('[AUTH] Token validation failed:', error.message);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        dispatch(logout());
      }
    } else {
      console.log('[AUTH] No token/user in storage, user is logged out');
    }
  } catch (error) {
    console.error('[AUTH] Check auth error:', error);
  }
};

export default authSlice.reducer;
