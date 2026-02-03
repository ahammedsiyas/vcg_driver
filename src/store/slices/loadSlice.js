import { createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  loads: [],
  currentLoad: null,
  loading: false,
  error: null
};

const loadSlice = createSlice({
  name: 'loads',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setLoads: (state, action) => {
      state.loads = action.payload;
      state.loading = false;
    },
    setCurrentLoad: (state, action) => {
      state.currentLoad = action.payload;
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { setLoading, setLoads, setCurrentLoad, setError } = loadSlice.actions;

// Thunks
export const fetchLoads = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.get('/trips/driver/assigned');
    dispatch(setLoads(response.data || []));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to fetch trips'));
  }
};

export const fetchLoadById = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.get(`/trips/booking/${id}`);
    dispatch(setCurrentLoad(response.data));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to fetch trip'));
  }
};

export const updateLoadStatus = (id, status) => async (dispatch) => {
  try {
    await api.put(`/trips/${id}/status`, { status });
    dispatch(fetchLoadById(id));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to update trip status'));
  }
};

export default loadSlice.reducer;
