'use client';

import { useEffect, useState } from 'react';
import ModalSuccess from '../../components/ModalSuccess';
import ModalError from '../../components/ModalError';
import { getMovimientoRRHHById, updateMovimientoRRHH } from '../../services/rrhh';

interface EditarMovimientoRRHHProps {
  id: number | string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const initialForm = {
  fecha: '',
  tipo: 'bono' as 'bono' | 'descuento',
  concepto: '',
  monto: '',
  estado: 'activo' as 'activo' | 'anulado',
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

const EditarMovimientoRRHH = ({ id, onSuccess, onClose }: EditarMovimientoRRHHProps) => {
  const [formData, setFormData] = useState(initialForm);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    getMovimientoRRHHById(id)
      .then((res) => {
        const raw = unwrapData<{
          fecha?: string;
          tipo?: 'bono' | 'descuento';
          concepto?: string;
          monto?: number | string;
          estado?: 'activo' | 'anulado';
        }>(res.data);

        setFormData({
          fecha: parseFechaToInput(raw.fecha),
          tipo: raw.tipo || 'bono',
          concepto: raw.concepto || '',
          monto: raw.monto !== undefined && raw.monto !== null ? String(raw.monto) : '',
          estado: raw.estado || 'activo',
        });
      })
      .catch((error) => {
        console.error('Error al obtener movimiento RRHH:', error);
        setErrorMessage('  No se pudo cargar el movimiento');
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

    if (!formData.fecha) {
      setErrorMessage('  La fecha es obligatoria');
      setErrorModalOpen(true);
      return;
    }
    if (!formData.concepto.trim()) {
      setErrorMessage('  El concepto es obligatorio');
      setErrorModalOpen(true);
      return;
    }
    const monto = Number(formData.monto);
    if (!Number.isFinite(monto) || monto <= 0) {
      setErrorMessage('  El monto debe ser mayor a 0');
      setErrorModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      await updateMovimientoRRHH(id, {
        fecha: formData.fecha,
        tipo: formData.tipo,
        concepto: formData.concepto.trim(),
        monto,
        estado: formData.estado,
      });

      setSuccessModalOpen(true);
      onSuccess && onSuccess();
    } catch (error: any) {
      console.error('Error al actualizar movimiento:', error);
      const message = error?.response?.data?.message || 'Error al actualizar movimiento';
      setErrorMessage('  ' + message);
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    onClose && onClose();
  };

  return (
    <div className="flex items-center justify-center px-4 border border-blue-300 dark:border-gray-600 rounded-lg shadow-lg">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full">
        <h2 className="text-2xl font-bold text-center text-blue-700 dark:text-blue-400 mb-6">
          Editar Movimiento RRHH
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
            <label className="text-sm text-gray-700 dark:text-gray-300">Tipo</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2"
            >
              <option value="bono">Bono</option>
              <option value="descuento">Descuento</option>
            </select>
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Concepto</label>
            <input
              type="text"
              name="concepto"
              value={formData.concepto}
              onChange={handleChange}
              required
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Monto</label>
            <input
              type="number"
              name="monto"
              min="0.01"
              step="0.01"
              value={formData.monto}
              onChange={handleChange}
              required
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2"
            >
              <option value="activo">Activo</option>
              <option value="anulado">Anulado</option>
            </select>
          </div>

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

      <ModalSuccess isOpen={successModalOpen} onClose={handleSuccessClose} message="Movimiento actualizado con exito" />
      <ModalError isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} message={errorMessage} />
    </div>
  );
};

export default EditarMovimientoRRHH;
