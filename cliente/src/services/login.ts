import api from '../lib/axiosConfig';

//   Login de usuario
export const loginUsuario = (login: string, password: string) => {
  return api.post('/auth/login', { login, password });
};