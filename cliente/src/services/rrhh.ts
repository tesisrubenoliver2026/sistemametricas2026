import api from '../lib/axiosConfig';

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Empleado {
  idempleado: number;
  nombre: string;
  apellido: string;
  cedula: string | null;
  telefono: string | null;
  direccion: string | null;
  fecha_nacimiento: string | null;
  fecha_ingreso: string;
  tipo_remuneracion: string;
  aporta_ips: number | boolean;
  porcentaje_ips_empleado: number;
  porcentaje_ips_empleador: number;
  estado: 'activo' | 'inactivo';
}

export interface Salario {
  idsalario: number;
  idempleado: number;
  salario_base: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  motivo: string | null;
}

export interface Asistencia {
  idasistencia: number;
  idempleado: number;
  fecha: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  estado: string;
  observacion: string | null;
}

export interface HoraExtra {
  idhextra: number;
  idempleado: number;
  fecha: string;
  cantidad_horas: number | string;
  tipo: string;
  aprobado_por: string | null;
  observacion: string | null;
  created_at?: string;
  nombre?: string;
  apellido?: string;
  cedula?: string | null;
}

export interface Comision {
  idcomision: number;
  idempleado: number;
  fecha: string;
  monto_venta: number | string;
  porcentaje: number | string;
  monto_comision: number | string;
  referencia: string | null;
  created_at?: string;
  nombre?: string;
  apellido?: string;
  cedula?: string | null;
}

export interface Amonestacion {
  idamonestacion: number;
  idempleado: number;
  fecha: string;
  tipo: string;
  motivo: string | null;
}

export interface Liquidacion {
  idliquidacion: number;
  idempleado: number;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: string;
  salario_base: number | string;
  total_horas_extras: number | string;
  total_comisiones: number | string;
  total_bonos: number | string;
  total_descuentos: number | string;
  total_ips: number | string;
  total_a_cobrar: number | string;
  estado: string;
  created_at?: string;
  nombre?: string;
  apellido?: string;
  cedula?: string | null;
}

export interface DetalleLiquidacion {
  iddetalle: number;
  idliquidacion: number;
  concepto: string;
  tipo: string;
  monto: number | string;
}

export interface MovimientoRRHH {
  idmovimiento: number;
  usuario_id?: number;
  idempleado: number;
  fecha: string;
  tipo: 'bono' | 'descuento';
  concepto: string;
  monto: number | string;
  estado: 'activo' | 'anulado';
  created_at?: string;
  updated_at?: string;
  nombre?: string;
  apellido?: string;
  cedula?: string | null;
}

export interface PreLiquidacionRequest {
  idempleado: number;
  tipo?: string;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface SalariosListParams extends ListParams {
  nombre?: string;
  documento?: string;
}

export interface ListParamsWithDate extends ListParams {
  fechaInicio?: string;
  fechaFin?: string;
}

export interface AsistenciasListParams extends ListParamsWithDate {
  nombre?: string;
  documento?: string;
}

export interface AmonestacionesListParams extends ListParamsWithDate {
  nombre?: string;
  documento?: string;
}

export interface HorasExtrasListParams extends ListParamsWithDate {
  nombre?: string;
  documento?: string;
}

export interface ComisionesListParams extends ListParamsWithDate {
  nombre?: string;
  documento?: string;
}

export interface LiquidacionesListParams extends ListParamsWithDate {
  nombre?: string;
  documento?: string;
  estado?: 'todos' | 'Pendiente' | 'Pagada' | 'Anulada';
}

export interface MovimientosRRHHListParams extends ListParamsWithDate {
  nombre?: string;
  documento?: string;
  tipo?: 'todos' | 'bono' | 'descuento';
  estado?: 'todos' | 'activo' | 'anulado';
}

export const getEmpleados = (params?: ListParams) =>
  api.get<PaginatedResponse<Empleado>>('/rrhh/empleados', { params });

export const getEmpleadosId = (id: string) =>
  api.get<Empleado>(`/rrhh/empleados/${id}`);

export const createEmpleado = (data: Partial<Empleado>) =>
  api.post('/rrhh/empleados', data);

export const updateEmpleado = (id: number | string, data: Partial<Empleado>) =>
  api.put(`/rrhh/empleados/${id}`, data);
export const changeEstadoEmpleado = (
  id: number | string,
  estado: 'activo' | 'inactivo',
) => api.put(`/rrhh/empleados/${id}/estado`, { estado });
export const deleteEmpleado = (id: number | string) =>
  api.delete(`/rrhh/empleados/${id}`);

export const getSalariosByEmpleado = (
  idempleado: number | string,
  params?: ListParams,
) =>
  api.get<PaginatedResponse<Salario>>(`/rrhh/salarios/empleado/${idempleado}`, {
    params,
  });

export const getSalarios = (params?: SalariosListParams) =>
  api.get<PaginatedResponse<Salario>>('/rrhh/salarios', { params });

export const getSalarioById = (id: number | string) =>
  api.get<Salario>(`/rrhh/salarios/${id}`);
  
export const createSalario = (data: Partial<Salario>) =>
  api.post('/rrhh/salarios', data);

export const updateSalario = (id: number | string, data: Partial<Salario>) =>
  api.put(`/rrhh/salarios/${id}`, data);

export const closeSalarioVigente = (
  idempleado: number | string,
  fecha_fin: string,
) =>
  api.put(`/rrhh/salarios/empleado/${idempleado}/cerrar-vigente`, { fecha_fin });
  
export const deleteSalario = (id: number | string) =>
  api.delete(`/rrhh/salarios/${id}`);

export const getAsistenciasByEmpleado = (
  idempleado: number | string,
  params?: ListParamsWithDate,
) =>
  api.get<PaginatedResponse<Asistencia>>(
    `/rrhh/asistencias/empleado/${idempleado}`,
    { params },
  );

export const getAsistencias = (params?: AsistenciasListParams) =>
  api.get<PaginatedResponse<Asistencia>>('/rrhh/asistencias', { params });

export const getAsistenciaById = (id: number | string) =>
  api.get<Asistencia>(`/rrhh/asistencias/${id}`);

export const createAsistencia = (data: Partial<Asistencia>) =>
  api.post('/rrhh/asistencias', data);

export const upsertAsistencia = (data: Partial<Asistencia>) =>
  api.post('/rrhh/asistencias/upsert', data);

export const updateAsistencia = (
  id: number | string,
  data: Partial<Asistencia>,
) => api.put(`/rrhh/asistencias/${id}`, data);

export const deleteAsistencia = (id: number | string) =>
  api.delete(`/rrhh/asistencias/${id}`);

export const getHorasExtrasByEmpleado = (
  idempleado: number | string,
  params?: ListParamsWithDate,
) =>
  api.get<PaginatedResponse<HoraExtra>>(
    `/rrhh/horas-extras/empleado/${idempleado}`,
    { params },
  );

export const getHorasExtras = (params?: HorasExtrasListParams) =>
  api.get<PaginatedResponse<HoraExtra>>('/rrhh/horas-extras', { params });

export const getHoraExtraById = (id: number | string) =>
  api.get<HoraExtra>(`/rrhh/horas-extras/${id}`);

export const createHoraExtra = (data: Partial<HoraExtra>) =>
  api.post('/rrhh/horas-extras', data);

export const updateHoraExtra = (
  id: number | string,
  data: Partial<HoraExtra>,
) => api.put(`/rrhh/horas-extras/${id}`, data);

export const deleteHoraExtra = (id: number | string) =>
  api.delete(`/rrhh/horas-extras/${id}`);

export const getComisionesByEmpleado = (
  idempleado: number | string,
  params?: ListParamsWithDate,
) =>
  api.get<PaginatedResponse<Comision>>(`/rrhh/comisiones/empleado/${idempleado}`, {
    params,
  });

export const getComisiones = (params?: ComisionesListParams) =>
  api.get<PaginatedResponse<Comision>>('/rrhh/comisiones', { params });

export const getComisionById = (id: number | string) =>
  api.get<Comision>(`/rrhh/comisiones/${id}`);

export const createComision = (data: Partial<Comision>) =>
  api.post('/rrhh/comisiones', data);
export const updateComision = (id: number | string, data: Partial<Comision>) =>
  api.put(`/rrhh/comisiones/${id}`, data);
export const deleteComision = (id: number | string) =>
  api.delete(`/rrhh/comisiones/${id}`);

export const getAmonestacionesByEmpleado = (
  idempleado: number | string,
  params?: ListParamsWithDate,
) =>
  api.get<PaginatedResponse<Amonestacion>>(
    `/rrhh/amonestaciones/empleado/${idempleado}`,
    { params },
  );

export const getAllAmonestaciones = (params?: AmonestacionesListParams) =>
  api.get<PaginatedResponse<Amonestacion>>('/rrhh/amonestaciones/', { params });

export const getAmonestacionById = (id: number | string) =>
  api.get<Amonestacion>(`/rrhh/amonestaciones/${id}`);
export const createAmonestacion = (data: Partial<Amonestacion>) =>
  api.post('/rrhh/amonestaciones', data);
export const updateAmonestacion = (
  id: number | string,
  data: Partial<Amonestacion>,
) => api.put(`/rrhh/amonestaciones/${id}`, data);
export const deleteAmonestacion = (id: number | string) =>
  api.delete(`/rrhh/amonestaciones/${id}`);

export const getLiquidacionesByEmpleado = (
  idempleado: number | string,
  params?: ListParams,
) =>
  api.get<PaginatedResponse<Liquidacion>>(
    `/rrhh/liquidaciones/empleado/${idempleado}`,
    { params },
  );
export const getLiquidaciones = (params?: LiquidacionesListParams) =>
  api.get<PaginatedResponse<Liquidacion>>('/rrhh/liquidaciones', { params });
export const getLiquidacionById = (id: number | string) =>
  api.get<Liquidacion>(`/rrhh/liquidaciones/${id}`);
export const preLiquidacion = (data: PreLiquidacionRequest) =>
  api.post<{ success: boolean; message: string; data: Liquidacion }>(
    '/rrhh/liquidaciones/pre-liquidacion',
    data,
  );
export const preLiquidacionPDF = (data: PreLiquidacionRequest) =>
  api.post<{ success: boolean; message: string; reportePDFBase64: string }>(
    '/rrhh/liquidaciones/pre-liquidacion/pdf',
    data,
  );
export const createLiquidacion = (data: Partial<Liquidacion>) =>
  api.post('/rrhh/liquidaciones', data);
export const getLiquidacionPDFById = (id: number | string) =>
  api.get<{ success: boolean; message: string; reportePDFBase64: string }>(
    `/rrhh/liquidaciones/${id}/pdf`,
  );
export const updateTotalesLiquidacion = (
  id: number | string,
  data: Partial<Liquidacion>,
) => api.put(`/rrhh/liquidaciones/${id}/totales`, data);
export const updateEstadoLiquidacion = (id: number | string, estado: string) =>
  api.put(`/rrhh/liquidaciones/${id}/estado`, { estado });
export const deleteLiquidacion = (id: number | string) =>
  api.delete(`/rrhh/liquidaciones/${id}`);

export const getDetallesByLiquidacion = (
  idliquidacion: number | string,
  params?: ListParams,
) =>
  api.get<PaginatedResponse<DetalleLiquidacion>>(
    `/rrhh/detalle-liquidacion/liquidacion/${idliquidacion}`,
    { params },
  );
export const createDetalleLiquidacion = (data: Partial<DetalleLiquidacion>) =>
  api.post('/rrhh/detalle-liquidacion', data);
export const updateDetalleLiquidacion = (
  id: number | string,
  data: Partial<DetalleLiquidacion>,
) => api.put(`/rrhh/detalle-liquidacion/${id}`, data);
export const deleteDetalleLiquidacion = (id: number | string) =>
  api.delete(`/rrhh/detalle-liquidacion/${id}`);
export const deleteDetallesByLiquidacion = (idliquidacion: number | string) =>
  api.delete(`/rrhh/detalle-liquidacion/liquidacion/${idliquidacion}`);

export const getMovimientosRRHH = (params?: MovimientosRRHHListParams) =>
  api.get<PaginatedResponse<MovimientoRRHH>>('/rrhh/movimientos', { params });

export const getMovimientosRRHHByEmpleado = (
  idempleado: number | string,
  params?: MovimientosRRHHListParams,
) =>
  api.get<PaginatedResponse<MovimientoRRHH>>(`/rrhh/movimientos/empleado/${idempleado}`, { params });

export const getMovimientoRRHHById = (id: number | string) =>
  api.get<MovimientoRRHH>(`/rrhh/movimientos/${id}`);

export const createMovimientoRRHH = (data: Partial<MovimientoRRHH>) =>
  api.post('/rrhh/movimientos', data);

export const updateMovimientoRRHH = (id: number | string, data: Partial<MovimientoRRHH>) =>
  api.put(`/rrhh/movimientos/${id}`, data);

export const deleteMovimientoRRHH = (id: number | string) =>
  api.delete(`/rrhh/movimientos/${id}`);
