'use client';

import { useCallback, useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaSave, FaTrash } from 'react-icons/fa';
import {
  createDetalleLiquidacion,
  deleteDetalleLiquidacion,
  getDetallesByLiquidacion,
  updateDetalleLiquidacion,
  type DetalleLiquidacion,
} from '../../services/rrhh';
import ModalAdvert from '../../components/ModalAdvert';
import ModalError from '../../components/ModalError';
import ModalSuccess from '../../components/ModalSuccess';
import SelectPage from '../../components/SelectPage';
import SelectPagination from '../../components/SelectPagination';

interface GestionDetalleLiquidacionProps {
  idliquidacion: number | string;
}

const toNumber = (value: number | string | null | undefined) => Number(value ?? 0);

const initialForm = {
  concepto: '',
  tipo: 'ingreso',
  monto: '',
};

const GestionDetalleLiquidacion = ({ idliquidacion }: GestionDetalleLiquidacionProps) => {
  const [detalles, setDetalles] = useState<DetalleLiquidacion[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const fetchDetalles = useCallback(async () => {
    if (!idliquidacion) return;

    try {
      setLoading(true);
      const res = await getDetallesByLiquidacion(idliquidacion, { page, limit, search });
      setDetalles(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Error al obtener detalles de liquidacion:', error);
      setErrorMessage('  No se pudo cargar los detalles de la liquidacion');
    } finally {
      setLoading(false);
    }
  }, [idliquidacion, page, limit, search]);

  useEffect(() => {
    fetchDetalles();
  }, [fetchDetalles]);

  const resetForm = () => {
    setFormData(initialForm);
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const monto = Number(formData.monto);
    if (!formData.concepto.trim()) {
      setErrorMessage('  El concepto es obligatorio');
      return;
    }

    if (!Number.isFinite(monto) || monto <= 0) {
      setErrorMessage('  El monto debe ser mayor a 0');
      return;
    }

    try {
      if (editId) {
        await updateDetalleLiquidacion(editId, {
          concepto: formData.concepto.trim(),
          tipo: formData.tipo,
          monto,
        });
        setSuccessMessage('  Detalle actualizado correctamente');
      } else {
        await createDetalleLiquidacion({
          idliquidacion: Number(idliquidacion),
          concepto: formData.concepto.trim(),
          tipo: formData.tipo,
          monto,
        });
        setSuccessMessage('  Detalle creado correctamente');
      }

      resetForm();
      fetchDetalles();
    } catch (error) {
      console.error('Error al guardar detalle de liquidacion:', error);
      setErrorMessage('  No se pudo guardar el detalle');
    }
  };

  const handleEdit = (detalle: DetalleLiquidacion) => {
    setEditId(detalle.iddetalle);
    setFormData({
      concepto: detalle.concepto || '',
      tipo: detalle.tipo || 'ingreso',
      monto: String(detalle.monto ?? ''),
    });
  };

  const handleDelete = (id: number) => {
    setIdToDelete(id);
    setModalAdvertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!idToDelete) return;

    try {
      await deleteDetalleLiquidacion(idToDelete);
      setSuccessMessage('  Detalle eliminado correctamente');
      fetchDetalles();
    } catch (error) {
      console.error('Error al eliminar detalle:', error);
      setErrorMessage('  No se pudo eliminar el detalle');
    } finally {
      setIdToDelete(null);
      setModalAdvertOpen(false);
    }
  };

  const totalIngresos = detalles
    .filter((d) => (d.tipo || '').toLowerCase() === 'ingreso')
    .reduce((acc, d) => acc + toNumber(d.monto), 0);

  const totalDescuentos = detalles
    .filter((d) => (d.tipo || '').toLowerCase() === 'descuento')
    .reduce((acc, d) => acc + toNumber(d.monto), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Buscar por concepto, tipo o monto..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
        <SelectPage limit={limit} setLimit={setLimit} setPage={setPage} />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl border border-blue-100 dark:border-gray-700">
        <input
          type="text"
          value={formData.concepto}
          onChange={(e) => setFormData((prev) => ({ ...prev, concepto: e.target.value }))}
          placeholder="Concepto"
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2"
          required
        />
        <select
          value={formData.tipo}
          onChange={(e) => setFormData((prev) => ({ ...prev, tipo: e.target.value }))}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2"
        >
          <option value="ingreso">Ingreso</option>
          <option value="descuento">Descuento</option>
        </select>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={formData.monto}
          onChange={(e) => setFormData((prev) => ({ ...prev, monto: e.target.value }))}
          placeholder="Monto"
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2"
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 flex items-center justify-center gap-2">
            {editId ? <><FaSave /> Actualizar</> : <><FaPlus /> Agregar</>}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700">
          Total Ingresos: {totalIngresos.toFixed(2)}
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700">
          Total Descuentos: {totalDescuentos.toFixed(2)}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-blue-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 dark:bg-gray-700 text-gray-700 dark:text-gray-100">
              <tr>
                <th className="text-left px-3 py-2">Concepto</th>
                <th className="text-left px-3 py-2">Tipo</th>
                <th className="text-right px-3 py-2">Monto</th>
                <th className="text-center px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading && detalles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-gray-500 dark:text-gray-300">
                    Sin detalles cargados.
                  </td>
                </tr>
              )}
              {detalles.map((detalle) => (
                <tr key={detalle.iddetalle} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-3 py-2">{detalle.concepto}</td>
                  <td className="px-3 py-2">{detalle.tipo}</td>
                  <td className="px-3 py-2 text-right">{toNumber(detalle.monto).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(detalle)} className="px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(detalle.iddetalle)} className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />

      <ModalError isOpen={!!errorMessage} onClose={() => setErrorMessage('')} message={errorMessage} />
      <ModalSuccess isOpen={!!successMessage} onClose={() => setSuccessMessage('')} message={successMessage} />
      <ModalAdvert
        isOpen={modalAdvertOpen}
        onClose={() => setModalAdvertOpen(false)}
        message="Estas seguro de que deseas eliminar este detalle?"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default GestionDetalleLiquidacion;
