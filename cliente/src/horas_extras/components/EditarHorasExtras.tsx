'use client';

import { useEffect, useState } from 'react';
import ModalSuccess from '../../components/ModalSuccess';
import ModalError from '../../components/ModalError';
import { getHoraExtraById, updateHoraExtra } from '../../services/rrhh';

interface EditarHorasExtrasProps {
  id: number | string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const initialForm = {
  fecha: '',
  cantidad_horas: '',
  tipo: '',
  aprobado_por: '',
  observacion: '',
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

const EditarHorasExtras = ({ id, onSuccess, onClose }: EditarHorasExtrasProps) => {
  const [formData, setFormData] = useState(initialForm);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    getHoraExtraById(id)
      .then((res) => {
        const raw = unwrapData<{
          fecha?: string;
          cantidad_horas?: number | string;
          tipo?: string | null;
          aprobado_por?: string | null;
          observacion?: string | null;
        }>(res.data);

        setFormData({
          fecha: parseFechaToInput(raw.fecha),
          cantidad_horas:
            raw.cantidad_horas !== undefined && raw.cantidad_horas !== null
              ? String(raw.cantidad_horas)
              : '',
          tipo: raw.tipo || '',
          aprobado_por: raw.aprobado_por || '',
          observacion: raw.observacion || '',
        });
      })
      .catch((error: unknown) => {
        console.error('Error al obtener hora extra:', error);
        setErrorMessage('  No se pudo cargar la hora extra');
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

    const cantidadHoras = Number(formData.cantidad_horas);
    if (!Number.isFinite(cantidadHoras) || cantidadHoras <= 0) {
      setErrorMessage('  La cantidad de horas debe ser mayor a 0');
      setErrorModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      await updateHoraExtra(id, {
        fecha: formData.fecha,
        cantidad_horas: cantidadHoras,
        tipo: formData.tipo.trim() || '',
        aprobado_por: formData.aprobado_por.trim() || null,
        observacion: formData.observacion.trim() || null,
      });
      setSuccessModalOpen(true);
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      console.error('Error al actualizar hora extra:', error);
      let message = 'Error al actualizar hora extra';
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
          Editar Hora Extra
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
            <label className="text-sm text-gray-700 dark:text-gray-300">Cantidad de horas</label>
            <input
              type="number"
              name="cantidad_horas"
              min="0.5"
              step="0.5"
              value={formData.cantidad_horas}
              onChange={handleChange}
              required
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Tipo</label>
            <input
              type="text"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              placeholder="Ej: Diurna, Nocturna"
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Aprobado por</label>
            <input
              type="text"
              name="aprobado_por"
              value={formData.aprobado_por}
              onChange={handleChange}
              placeholder="Nombre del aprobador"
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2"
            />
          </div>

          <textarea
            name="observacion"
            value={formData.observacion}
            onChange={handleChange}
            rows={3}
            placeholder="Observacion"
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

      <ModalSuccess isOpen={successModalOpen} onClose={handleSuccessClose} message="Hora extra actualizada con exito" />
      <ModalError isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} message={errorMessage} />
    </div>
  );
};

export default EditarHorasExtras;
