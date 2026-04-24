'use client';

import { useEffect, useState } from 'react';
import { FaSearch, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import ModalAdvert from '../../../components/ModalAdvert';
import ModalSuccess from '../../../components/ModalSuccess';
import ModalError from '../../../components/ModalError';
import { fetchDetallesPago, anularPagoDeudaCompra } from '../../../services/compras';
import { formatPY } from '../../../movimiento/utils/utils';
import CardText from '../../../ventas/components/CobroDeudaVenta/components/CardText';
import SelectPagination from '../../../components/SelectPagination';

interface Props {
  iddeuda: number;
  onSuccess?: () => void;
}

const ListarDetallesPagosDeuda: React.FC<Props> = ({ iddeuda, onSuccess }) => {
  const [detalles, setDetalles] = useState<any[]>([]);
  const [showAdvert, setShowAdvert] = useState(false);
  const [successModalOpen,setSuccessModalOpen] = useState(false)
  const [idPagoAAnular, setIdPagoAAnular] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const fetchDetalles = async () => {
    setLoading(true);
    try {
      const response = await fetchDetallesPago(iddeuda, page, search);
      setDetalles(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error al cargar detalles de pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnular = (idpago: number) => {
    setIdPagoAAnular(idpago);
    setShowAdvert(true);
  };

  const confirmarAnulacion = async () => {
    if (idPagoAAnular === null) return;

    try {
      await anularPagoDeudaCompra(idPagoAAnular);
      setSuccessModalOpen(true)
      fetchDetalles();
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Error al anular el pago:', error);
      setErrorMessage('  Error al anular el pago.');
    } finally {
      setShowAdvert(false);
      setIdPagoAAnular(null);
    }
  };

  useEffect(() => {
    fetchDetalles();
  }, [page, search]);

 return (
    <div className="mt-6 bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 border border-blue-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <CreditCardIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold text-blue-800 dark:text-white">Historial de Pagos</h2>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por observación, método o autor..."
          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && detalles.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <FaInfoCircle className="text-gray-400 dark:text-gray-500 text-5xl mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {search ? 'No se encontraron pagos con ese criterio de búsqueda' : 'No hay registros de pagos'}
          </p>
        </div>
      )}

      {/* Cards Grid */}
      {!loading && detalles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {detalles.map((item, idx) => (
            <div
              key={item.idpago_deuda_compra}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-blue-100 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500"
            >
              {/* Header con gradiente */}
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 text-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-white/20 dark:bg-gray-600/30 p-2 rounded-lg flex-shrink-0">
                      <CreditCardIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base">Pago #{(page - 1) * 5 + idx + 1}</h3>
                      <p className="text-xs opacity-90 dark:text-gray-300">{new Date(item.fecha_pago).toLocaleDateString('es-PY')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body con CardText */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <CardText
                    title="Monto"
                    text={formatPY(item.monto_pagado)}
                  />
                  <CardText
                    title="Método"
                    text={item.metodo_pago}
                  />
                  <CardText
                    title="Fecha y Hora"
                    text={new Date(item.fecha_pago).toLocaleString('es-PY')}
                  />
                  <CardText
                    title="Observación"
                    text={item.observacion || 'N/A'}
                  />
                </div>

                {/* Acciones */}
                <div className="pt-3 border-t border-blue-100 dark:border-gray-600">
                  <button
                    onClick={() => handleAnular(item.idpago_deuda_compra)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-700 dark:to-gray-800 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
                  >
                    <FaTrash />
                    Anular Pago
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {!loading && detalles.length > 0 && (
        <div className="mt-6">
          <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />
        </div>
      )}
      <ModalAdvert
        isOpen={showAdvert}
        onClose={() => setShowAdvert(false)}
        onConfirm={confirmarAnulacion}
        message="¿Estás seguro de que deseas anular este pago? Esta acción actualizará la deuda."
        confirmButtonText="Sí, Anular"
     
      />
      <ModalSuccess
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message="Anulación procesada con éxito"
      />
      <ModalError isOpen={!!errorMessage} onClose={()=>setErrorMessage("")} message={errorMessage}/>

    </div>
  );
};

export default ListarDetallesPagosDeuda;