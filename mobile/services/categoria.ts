import api from '../lib/axiosConfig';

export const getCategoriasPaginated = (params: {
  page: number;
  limit: number;
  search?: string;
}) => {
  return api.get('/categorias', { params });
};

export const deleteCategoria = (id: number) => {
  return api.delete(`/categorias/${id}`);
};

export const getCategoriaById = (id: number | string) => {
  return api.get(`/categorias/${id}`);
};

export const updateCategoria = (id: number | string, data: any) => {
  return api.put(`/categorias/${id}`, data);
};

export const createCategoria = (data: any) => {
  return api.post('/categorias', data);
};

export const getAllCategorias = () => {
  return api.get('/categorias/all');
};
