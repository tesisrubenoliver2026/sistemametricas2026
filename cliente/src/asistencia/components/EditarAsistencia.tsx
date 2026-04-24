'use client';

import { useEffect, useState } from 'react';
import ModalSuccess from '../../components/ModalSuccess';
import ModalError from '../../components/ModalError';
import { getAsistenciaById, updateAsistencia } from '../../services/rrhh';

interface EditarAsistenciaProps {
  id: number | string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const initialForm = {
  fecha: '',
  hora_entrada: '',
  hora_salida: '',
  estado: 'presente',
  observacion: '',
};

const unwrapData = <T,>(payload: unknown): T => {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const EditarAsistencia = ({ id, onSuccess, onClose }: EditarAsistenciaProps) => {
  const [formData, setFormData] = useState(initialForm);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    getAsistenciaById(id)
      .then((res) => {
        const raw = unwrapData<{
          fecha?: string;
          hora_entrada?: string | null;
          hora_salida?: string | null;
          estado?: string;
          observacion?: string | null;
        }>(res.data);

        setFormData({
          fecha: raw.fecha ? String(raw.fecha).slice(0, 10) : '',
          hora_entrada: raw.hora_entrada || '',
          hora_salida: raw.hora_salida || '',
          estado: raw.estado || 'presente',
          observacion: raw.observacion || '',
        });
      })
      .catch((error: unknown) => {
        console.error('Error al obtener asistencia:', error);
        setErrorMessage('  No se pudo cargar la asistencia');
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
    setLoading(true);

    try {
      await updateAsistencia(id, {
        fecha: formData.fecha,
        hora_entrada: formData.hora_entrada || null,
        hora_salida: formData.hora_salida || null,
        estado: formData.estado,
        observacion: formData.observacion || null,
      });
      setSuccessModalOpen(true);
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      console.error('Error al actualizar asistencia:', error);
      let message = 'Error al actualizar asistencia';
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
          Editar Asistencia
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
            <label className="text-sm text-gray-700 dark:text-gray-300">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2"
            >
              <option value="presente">Presente</option>
              <option value="ausente">Ausente</option>
              <option value="tardanza">Tardanza</option>
              <option value="permiso">Permiso</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Hora entrada</label>
            <input
              type="time"
              name="hora_entrada"
              value={formData.hora_entrada}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Hora salida</label>
            <input
              type="time"
              name="hora_salida"
              value={formData.hora_salida}
              onChange={handleChange}
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

      <ModalSuccess isOpen={successModalOpen} onClose={handleSuccessClose} message="Asistencia actualizada con exito" />
      <ModalError isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} message={errorMessage} />
    </div>
  );
};

export default EditarAsistencia;
