import { createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  profile: null,
  loading: false,
  error: null
};

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { setLoading, setProfile, setError } = driverSlice.actions;

// Thunks
export const fetchDriverProfile = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.get('/drivers/me');
    
    if (response.data.success) {
      dispatch(setProfile(response.data.data));
    }
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to fetch profile'));
  }
};

export const updateDriverProfile = (data) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.put('/drivers/me', data);
    
    if (response.data.success) {
      dispatch(setProfile(response.data.data));
    }
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to update profile'));
  }
};

export const updateLocation = (location) => async (dispatch) => {
  try {
    await api.put('/drivers/location', location);
  } catch (error) {
    console.error('Failed to update location:', error);
  }
};

export default driverSlice.reducer;
