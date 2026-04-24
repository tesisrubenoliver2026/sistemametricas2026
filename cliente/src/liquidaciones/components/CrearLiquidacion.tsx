'use client';

import { useState } from 'react';
import ModalSuccess from '../../components/ModalSuccess';
import ModalError from '../../components/ModalError';
import { createLiquidacion, preLiquidacion, preLiquidacionPDF, type Empleado, type Liquidacion } from '../../services/rrhh';
import ModalListarEmpleado from '../../empleados/components/ModalsEmpleados/ModalListarEmpleado';

interface CrearLiquidacionProps {
  onSuccess?: () => void;
  onClose?: () => void;
  idEmpleadoInicial?: number | string | null;
}

const initialForm = {
  tipo: 'Normal',
};

const toNumber = (value: number | string | null | undefined) => Number(value ?? 0);

const formatFecha = (fecha?: string) => {
  if (!fecha) return 'N/A';
  const value = String(fecha);
  const onlyDate = value.includes('T') ? value.slice(0, 10) : value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(onlyDate)) {
    const [y, m, d] = onlyDate.split('-');
    return `${d}-${m}-${y}`;
  }
  return onlyDate;
};

const CrearLiquidacion = ({ onSuccess, onClose, idEmpleadoInicial }: CrearLiquidacionProps) => {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(
    idEmpleadoInicial ? ({ idempleado: Number(idEmpleadoInicial) } as Empleado) : null,
  );
  const [modalListarEmpleadoOpen, setModalListarEmpleadoOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [preview, setPreview] = useState<Liquidacion | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateEmpleado = () => {
    if (!empleadoSeleccionado?.idempleado) {
      setErrorMessage('  Debes seleccionar un empleado');
      setErrorModalOpen(true);
      return false;
    }
    return true;
  };

  const handlePreLiquidacion = async () => {
    if (!validateEmpleado()) return;

    setLoadingPreview(true);
    try {
      const res = await preLiquidacion({
        idempleado: Number(empleadoSeleccionado?.idempleado),
        tipo: formData.tipo,
      });
      setPreview(res.data.data || null);
    } catch (error: unknown) {
      console.error(error);
      let message = 'Error al generar pre liquidacion';
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object'
      ) {
        const response = (error as { response?: { data?: { message?: string; error?: string } } }).response;
        if (response?.data?.message) message = response.data.message;
        if (response?.data?.error) message = response.data.error;
      }
      setErrorMessage('  ' + message);
      setErrorModalOpen(true);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmpleado()) return;

    setLoadingGenerate(true);
    try {
      await createLiquidacion({
        idempleado: Number(empleadoSeleccionado?.idempleado),
        tipo: formData.tipo,
      });

      setSuccessModalOpen(true);
      setFormData(initialForm);
      setPreview(null);
      setEmpleadoSeleccionado(null);
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      console.error(error);
      let message = 'Error al generar liquidacion';
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object'
      ) {
        const response = (error as { response?: { data?: { message?: string; error?: string } } }).response;
        if (response?.data?.message) message = response.data.message;
        if (response?.data?.error) message = response.data.error;
      }
      setErrorMessage('  ' + message);
      setErrorModalOpen(true);
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handlePreLiquidacionPDF = async () => {
    if (!validateEmpleado()) return;

    setLoadingPDF(true);
    try {
      const res = await preLiquidacionPDF({
        idempleado: Number(empleadoSeleccionado?.idempleado),
        tipo: formData.tipo,
      });

      const base64 = res.data.reportePDFBase64;
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${base64}`;
      const hoy = new Date().toISOString().slice(0, 10);
      link.download = `PreLiquidacion-Empleado${empleadoSeleccionado?.idempleado}-${hoy}.pdf`;
      link.click();
    } catch (error: any) {
      console.error(error);
      const message = error?.response?.data?.message || 'Error al generar PDF de pre liquidacion';
      setErrorMessage('  ' + message);
      setErrorModalOpen(true);
    } finally {
      setLoadingPDF(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    if (onClose) onClose();
  };

  return (
    <div className="flex items-center justify-center px-4 border border-blue-300 dark:border-gray-600 rounded-lg shadow-lg">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full">
        <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8">Generar Liquidacion</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">Empleado</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={
                  empleadoSeleccionado?.nombre
                    ? `${empleadoSeleccionado.nombre} ${empleadoSeleccionado.apellido} - ${empleadoSeleccionado.cedula || 'sin documento'}`
                    : empleadoSeleccionado?.idempleado
                      ? `ID empleado: ${empleadoSeleccionado.idempleado}`
                      : 'Sin empleado seleccionado'
                }
                className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2"
              />
              <button
                type="button"
                onClick={() => setModalListarEmpleadoOpen(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Seleccionar
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 dark:text-gray-300">Tipo</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange} className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2">
              <option value="Normal">Normal</option>
              <option value="Aguinaldo">Aguinaldo</option>
              <option value="Vacaciones">Vacaciones</option>
              <option value="Final">Final</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handlePreLiquidacion}
              disabled={loadingPreview || loadingGenerate}
              className="w-full py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold disabled:opacity-50"
            >
              {loadingPreview ? 'Calculando...' : 'Pre liquidacion'}
            </button>
          </div>

          {preview && (
            <div className="md:col-span-2 bg-blue-50 dark:bg-gray-700 rounded-xl p-4 border border-blue-200 dark:border-gray-600 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p><span className="font-semibold">Desde:</span> {formatFecha(preview.fecha_inicio)}</p>
                <p><span className="font-semibold">Hasta:</span> {formatFecha(preview.fecha_fin)}</p>
                <p><span className="font-semibold">Salario base:</span> {toNumber(preview.salario_base).toFixed(2)}</p>
                <p><span className="font-semibold">Horas extras:</span> {toNumber(preview.total_horas_extras).toFixed(2)}</p>
                <p><span className="font-semibold">Comisiones:</span> {toNumber(preview.total_comisiones).toFixed(2)}</p>
                <p><span className="font-semibold">Bonos:</span> {toNumber(preview.total_bonos).toFixed(2)}</p>
                <p><span className="font-semibold">Descuentos:</span> {toNumber(preview.total_descuentos).toFixed(2)}</p>
                <p><span className="font-semibold">IPS:</span> {toNumber(preview.total_ips).toFixed(2)}</p>
              </div>
              <div className="text-base font-bold text-blue-700 dark:text-blue-200">
                Total a cobrar: {toNumber(preview.total_a_cobrar).toFixed(2)}
              </div>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handlePreLiquidacionPDF}
                  disabled={loadingPDF || loadingPreview || loadingGenerate}
                  className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
                >
                  {loadingPDF ? 'Generando PDF...' : 'Descargar PDF (Pre liquidacion)'}
                </button>
              </div>
            </div>
          )}

          <div className="md:col-span-2 flex gap-3 mt-2">
            {onClose && (
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700">
                Cancelar
              </button>
            )}

            <button type="submit" disabled={loadingGenerate || loadingPreview} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50">
              {loadingGenerate ? 'Generando...' : 'Generar liquidacion'}
            </button>
          </div>
        </form>
      </div>

      <ModalSuccess isOpen={successModalOpen} onClose={handleSuccessClose} message="Liquidacion generada con exito" />
      <ModalError isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} message={errorMessage} />

      <ModalListarEmpleado
        isOpen={modalListarEmpleadoOpen}
        onClose={() => setModalListarEmpleadoOpen(false)}
        onSelect={(empleado) => setEmpleadoSeleccionado(empleado)}
      />
    </div>
  );
};

export default CrearLiquidacion;
