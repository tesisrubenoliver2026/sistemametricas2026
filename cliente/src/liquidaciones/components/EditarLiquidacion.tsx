'use client';

import { useEffect, useMemo, useState } from 'react';
import ModalError from '../../components/ModalError';
import { getLiquidacionById } from '../../services/rrhh';

interface EditarLiquidacionProps {
  id: number | string;
  onClose?: () => void;
}

const initialForm = {
  salario_base: '',
  total_horas_extras: '',
  total_comisiones: '',
  total_bonos: '',
  total_descuentos: '',
  total_ips: '',
  estado: 'Pendiente',
};

const toNumber = (value: string) => Number(value || 0);

const unwrapData = <T,>(payload: unknown): T => {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const EditarLiquidacion = ({ id, onClose }: EditarLiquidacionProps) => {
  const [formData, setFormData] = useState(initialForm);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const totalACobrar = useMemo(() => {
    return (
      toNumber(formData.salario_base) +
      toNumber(formData.total_horas_extras) +
      toNumber(formData.total_comisiones) +
      toNumber(formData.total_bonos) -
      toNumber(formData.total_descuentos) -
      toNumber(formData.total_ips)
    );
  }, [formData]);

  useEffect(() => {
    if (!id) return;

    getLiquidacionById(id)
      .then((res) => {
        const raw = unwrapData<{
          salario_base?: number | string;
          total_horas_extras?: number | string;
          total_comisiones?: number | string;
          total_bonos?: number | string;
          total_descuentos?: number | string;
          total_ips?: number | string;
          estado?: string;
        }>(res.data);

        setFormData({
          salario_base: String(raw.salario_base ?? ''),
          total_horas_extras: String(raw.total_horas_extras ?? ''),
          total_comisiones: String(raw.total_comisiones ?? ''),
          total_bonos: String(raw.total_bonos ?? ''),
          total_descuentos: String(raw.total_descuentos ?? ''),
          total_ips: String(raw.total_ips ?? ''),
          estado: raw.estado || 'Pendiente',
        });
      })
      .catch((error: unknown) => {
        console.error('Error al obtener liquidacion:', error);
        setErrorMessage('  No se pudo cargar la liquidacion');
        setErrorModalOpen(true);
      });
  }, [id]);

  return (
    <div className="flex items-center justify-center px-4 border border-blue-300 dark:border-gray-600 rounded-lg shadow-lg">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full">
        <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8">Editar Liquidacion</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Salario base</label>
            <input type="text" value={toNumber(formData.salario_base).toFixed(2)} readOnly className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700/70" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Total horas extras</label>
            <input type="text" value={toNumber(formData.total_horas_extras).toFixed(2)} readOnly className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700/70" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Total comisiones</label>
            <input type="text" value={toNumber(formData.total_comisiones).toFixed(2)} readOnly className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700/70" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Total bonos</label>
            <input type="text" value={toNumber(formData.total_bonos).toFixed(2)} readOnly className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700/70" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Total descuentos</label>
            <input type="text" value={toNumber(formData.total_descuentos).toFixed(2)} readOnly className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700/70" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Total IPS</label>
            <input type="text" value={toNumber(formData.total_ips).toFixed(2)} readOnly className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700/70" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Estado</label>
            <input type="text" value={formData.estado || 'N/A'} readOnly className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700/70" />
          </div>
          <div className="md:col-span-2 flex items-end">
            <div className="w-full bg-blue-50 dark:bg-gray-700 rounded-lg px-4 py-2 text-blue-700 dark:text-blue-200 font-semibold">
              Total a cobrar: {Number.isFinite(totalACobrar) ? totalACobrar.toFixed(2) : '0.00'}
            </div>
          </div>

          <div className="md:col-span-3 flex gap-3 mt-2">
            {onClose && (
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700">
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>

      <ModalError isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} message={errorMessage} />
    </div>
  );
};

export default EditarLiquidacion;
