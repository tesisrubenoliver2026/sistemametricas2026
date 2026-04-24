import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const api = axios.create({
  baseURL: 'https://api.kjhjhkjhkj.shop/api',
  withCredentials: true,

//  headers: {
//    'ngrok-skip-browser-warning': 'true' // ✅ Header específico para ngrok
//  } 
});
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  async (err) => {
    const status   = err.response?.status;
    const endpoint = err.config?.url || '';

    if (status === 401 && !endpoint.includes('/auth/login')) {
      await AsyncStorage.removeItem('usuario');
      await AsyncStorage.removeItem('auth_token');
      router.replace('/login');
    }

    return Promise.reject(err);
  }
);

export default api;
