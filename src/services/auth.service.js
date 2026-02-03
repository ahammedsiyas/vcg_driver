import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (data) => {
  const res = await api.post('/auth/login', data);
  await AsyncStorage.setItem('token', res.data.token);
  await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data.user;
};

export const register = async (data) => {
  const res = await api.post('/auth/register', { ...data, role: 'driver' });
  await AsyncStorage.setItem('token', res.data.token);
  await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data.user;
};

export const getCurrentUser = async () => {
  const res = await api.get('/auth/me');
  const user = res.data?.user || res.data?.data || res.data;
  await AsyncStorage.setItem('user', JSON.stringify(user));
  return user;
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};
