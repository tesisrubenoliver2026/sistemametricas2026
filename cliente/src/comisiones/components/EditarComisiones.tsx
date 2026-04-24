'use client';

import { useEffect, useState } from 'react';
import ModalSuccess from '../../components/ModalSuccess';
import ModalError from '../../components/ModalError';
import { getComisionById, updateComision } from '../../services/rrhh';

interface EditarComisionesProps {
  id: number | string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const initialForm = {
  fecha: '',
  monto_venta: '',
  porcentaje: '',
  referencia: '',
};

const unwrapData = <T,>(payload: unknown): T => {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const parseFechaToInput = (fecha?: string) => {
  if (!fecha) return '';
  const value = String(fecha).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const ddmmyyyy = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;

  return '';
};

const EditarComisiones = ({ id, onSuccess, onClose }: EditarComisionesProps) => {
  const [formData, setFormData] = useState(initialForm);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    getComisionById(id)
      .then((res) => {
        const raw = unwrapData<{
          fecha?: string;
          monto_venta?: number | string;
          porcentaje?: number | string;
          referencia?: string | null;
        }>(res.data);

        setFormData({
          fecha: parseFechaToInput(raw.fecha),
          monto_venta:
            raw.monto_venta !== undefined && raw.monto_venta !== null
              ? String(raw.monto_venta)
              : '',
          porcentaje:
            raw.porcentaje !== undefined && raw.porcentaje !== null
              ? String(raw.porcentaje)
              : '',
          referencia: raw.referencia || '',
        });
      })
      .catch((error: unknown) => {
        console.error('Error al obtener comision:', error);
        setErrorMessage('  No se pudo cargar la comision');
        setErrorModalOpen(true);
      });
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const montoVenta = Number(formData.monto_venta);
    const porcentaje = Number(formData.porcentaje);
    const montoComision = (montoVenta * porcentaje) / 100;

    if (!Number.isFinite(montoVenta) || montoVenta <= 0) {
      setErrorMessage('  El monto de venta debe ser mayor a 0');
      setErrorModalOpen(true);
      return;
    }

    if (!Number.isFinite(porcentaje) || porcentaje <= 0) {
      setErrorMessage('  El porcentaje debe ser mayor a 0');
      setErrorModalOpen(true);
      return;
    }

    if (!Number.isFinite(montoComision) || montoComision <= 0) {
      setErrorMessage('  El monto de comision calculado es invalido');
      setErrorModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      await updateComision(id, {
        fecha: formData.fecha,
        monto_venta: montoVenta,
        porcentaje,
        monto_comision: Number(montoComision.toFixed(2)),
        referencia: formData.referencia.trim() || null,
      });
      setSuccessModalOpen(true);
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      console.error('Error al actualizar comision:', error);
      let message = 'Error al actualizar comision';
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object'
      ) {
        const response = (error as { response?: { data?: { error?: string } } }).response;
        if (response?.data?.error) message = response.data.error;
      }
      setErrorMessage('  ' + message);
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    if (onClose) onClose();
  };

  return (
    <div className="flex items-center justify-center px-4 border border-blue-300 dark:border-gray-600 rounded-lg shadow-lg">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full">
        <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8">
          Editar Comision
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Fecha</label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Monto venta</label>
            <input
              type="number"
              name="monto_venta"
              min="1"
              step="0.01"
              value={formData.monto_venta}
              onChange={handleChange}
              required
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Porcentaje</label>
            <input
              type="number"
              name="porcentaje"
              min="0.01"
              step="0.01"
              value={formData.porcentaje}
              onChange={handleChange}
              required
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2"
            />
          </div>

          <textarea
            name="referencia"
            value={formData.referencia}
            onChange={handleChange}
            rows={3}
            placeholder="Referencia"
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2 md:col-span-2 resize-none"
          />

          <div className="md:col-span-2 flex gap-3 mt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

      <ModalSuccess isOpen={successModalOpen} onClose={handleSuccessClose} message="Comision actualizada con exito" />
      <ModalError isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} message={errorMessage} />
    </div>
  );
};

export default EditarComisiones;
