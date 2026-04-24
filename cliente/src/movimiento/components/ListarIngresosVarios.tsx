'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { FaTrash, FaInfoCircle, FaMoneyBillWave } from 'react-icons/fa';
import ModalCrearIngresosVarios from './ModalMovimiento/ModalCrearIngresosVarios';
import ChatIngresoModal from './ChatIngresoModal';
import ModalAdvert from '../../components/ModalAdvert';
import ModalError from '../../components/ModalError';
import ModalSuccess from '../../components/ModalSuccess';
import {
  getIngresosPaginated,
  deleteIngreso
} from '../../services/ingreso';
import { formatPY } from '../utils/utils';
import type { ParsedIncome } from '../../types/chat';
import ButtonGrid from '../../components/ButtonGrid';
import SelectPage from '../../components/SelectPage';
import SelectPagination from '../../components/SelectPagination';
import CardText from '../../ventas/components/CobroDeudaVenta/components/CardText';
import ButtonGral from '../../components/ButtonGral';
import SearchActionsBar from '../../components/SearchActionsBar';
import { renderTitle } from '../../clientes/utils/utils';

interface Ingreso {
  idingreso: number;
  monto: number;
  concepto: string;
  fecha: string;
  tipo_ingreso: string;
}

const ListarIngresosVarios = () => {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [isOpenCrear, setIsOpenCrear] = useState(false);
  const [isOpenChatIA, setIsOpenChatIA] = useState(false);
  const [showAdvert, setShowAdvert] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [ingresoAAnular, setIngresoAAnular] = useState<number | null>(null);
  const [vistaGrid, setVistaGrid] = useState(true);
  const [loading, setLoading] = useState(false);


  const fetchIngresos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getIngresosPaginated({
        page,
        limit,
        search,
        fechaDesde,
        fechaHasta
      });
      setIngresos(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error al obtener ingresos:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, fechaDesde, fechaHasta]);

  useEffect(() => {
    fetchIngresos();
  }, [fetchIngresos]);

  const handleAnularIngreso = (id: number) => {
    setIngresoAAnular(id);
    setShowAdvert(true);
  };

  const confirmarAnulacion = async () => {
    if (!ingresoAAnular) return;
    try {
      await deleteIngreso(ingresoAAnular);
      setSuccessModalOpen(true);
      fetchIngresos();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error al anular ingreso';
      setErrorMessage(msg);
      setShowErrorModal(true);
    } finally {
      setShowAdvert(false);
      setIngresoAAnular(null);
    }
  };

  const handleIngresoRegistradoIA = (ingreso: ParsedIncome) => {
    console.log('  Ingreso registrado por IA:', ingreso);
    setSuccessModalOpen(true);
    fetchIngresos();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PY');
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8" style={{ scrollbarGutter: 'stable' }}>
      <div className="max-w-7xl mx-auto">
        {renderTitle({ title: "Ingresos Varios", subtitle: "Administra los ingresos adicionales", icon: <FaMoneyBillWave className="text-white text-3xl sm:text-4xl" /> })}

        <SearchActionsBar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Buscar por tipo de ingreso o descripción..."
          extraContent={
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'Fecha desde', value: fechaDesde, setter: setFechaDesde },
                { label: 'Fecha hasta', value: fechaHasta, setter: setFechaHasta },
              ].map(({ label, value, setter }) => (
                <div key={label} className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={value}
                      onChange={(e) => {
                        setter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-10 pr-8 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm"
                    />
                    {value && (
                      <button
                        onClick={() => {
                          setter('');
                          setPage(1);
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <ButtonGral text='Chat IA' onClick={() => setIsOpenChatIA(true)} />
          <ButtonGral text='Nuevo Ingreso' onClick={() => setIsOpenCrear(true)} />
          <SelectPage limit={limit} setLimit={setLimit} setPage={setPage} />
          <ButtonGrid onClick={(isGrid) => setVistaGrid(isGrid)} vistaGrid={vistaGrid} />
        </SearchActionsBar>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && ingresos.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <FaInfoCircle className="text-gray-400 text-5xl mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {search || fechaDesde || fechaHasta
                ? 'No se encontraron ingresos con ese criterio de búsqueda'
                : 'No hay ingresos registrados'}
            </p>
          </div>
        )}

        {/* Vista condicional: Grid o Lista */}
        {!loading && ingresos.length > 0 && (
          <div className={vistaGrid ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "grid grid-cols-1 gap-4"}>
            {ingresos.map((ing, idx) => (
              <div
                key={ing.idingreso}
                className="dark:bg-gray-800 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-blue-100 hover:border-blue-300"
              >
                {/* Header con gradiente */}
                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 text-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                      <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                        <FaMoneyBillWave className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="font-bold text-base truncate">{ing.tipo_ingreso}</h3>
                        <p className="text-xs opacity-90 truncate">#{(page - 1) * limit + idx + 1}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  {/* Datos con CardText */}
                  <div className="grid grid-cols-2 gap-2">
                    <CardText
                      title="Tipo de Ingreso"
                      text={ing.tipo_ingreso}
                    />
                    <CardText
                      title="Monto"
                      text={formatPY(ing.monto)}
                    />
                    <CardText
                      title="Fecha"
                      text={formatDate(ing.fecha)}
                    />
                    <CardText
                      title="Concepto"
                      text={ing.concepto}
                    />
                  </div>

                  {/* Acciones */}
                  <div className="pt-3 border-t border-blue-100">
                    <button
                      onClick={() => handleAnularIngreso(ing.idingreso)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                    >
                      <FaTrash />
                      Anular
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {!loading && ingresos.length > 0 && (
          <div className="mt-6">
            <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />
          </div>
        )}
      </div>

      {/* Modales */}
      <ModalAdvert
        isOpen={showAdvert}
        onClose={() => setShowAdvert(false)}
        onConfirm={confirmarAnulacion}
        message="¿Estás seguro de anular este ingreso? Esta acción no se puede deshacer."
        confirmButtonText="Sí, anular"
      />
      <ModalSuccess
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message="Procesado con éxito"
      />
      <ModalError
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
      <ModalCrearIngresosVarios
        isOpen={isOpenCrear}
        onClose={() => setIsOpenCrear(false)}
        onSuccess={fetchIngresos}
      />
      <ChatIngresoModal
        isOpen={isOpenChatIA}
        onClose={() => setIsOpenChatIA(false)}
        onIngresoRegistrado={handleIngresoRegistradoIA}
      />
    </div>
  );
};

export default ListarIngresosVarios;