import api from '../lib/axiosConfig';

export interface ProductoReconocido {
  idproducto: number;
  nombre_producto: string;
  cod_barra: string;
  precio_venta: number;
  stock: number;
  estado: string;
  unidad_medida: string;
  nombre_categoria: string;
  similitud: number;
}

export interface ReconocimientoResponse {
  success: boolean;
  productoReconocido: string | null;
  mensaje?: string;
  productos: ProductoReconocido[];
  error?: string;
}

export const reconocerProducto = async (imageBase64: string): Promise<ReconocimientoResponse> => {
  const response = await api.post<ReconocimientoResponse>('/voice/reconocer-producto', {
    imageBase64,
  });
  return response.data;
};
