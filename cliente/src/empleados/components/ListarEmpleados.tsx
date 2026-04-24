'use client';

import { useCallback, useEffect, useState } from 'react';
import { FaUsers, FaSearch, FaEdit, FaTrash, FaCheck, FaUserCheck } from 'react-icons/fa';
import { deleteEmpleado, getEmpleados, type Empleado } from '../../services/rrhh';
import ModalCrearEmpleado from './ModalsEmpleados/ModalCrearEmpleado';
import ModalEditarEmpleado from './ModalsEmpleados/ModalEditarEmpleado';
import ModalError from '../../components/ModalError';
import ModalSuccess from '../../components/ModalSuccess';
import ModalAdvert from '../../components/ModalAdvert';
import ButtonGrid from '../../components/ButtonGrid';
import SelectPage from '../../components/SelectPage';
import SelectPagination from '../../components/SelectPagination';
import CardText from '../../ventas/components/CobroDeudaVenta/components/CardText';
import ButtonGral from '../../components/ButtonGral';
import {
  styleCardSmall,
  styleSearchDark,
  styleTxtCards,
  styleTxtLabelBold,
} from '../../components/utils/stylesGral';

interface ListarEmpleadosProps {
  onSelect?: (empleado: Empleado) => void;
}

const ListarEmpleados = ({ onSelect }: ListarEmpleadosProps) => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [vistaGrid, setVistaGrid] = useState(true);
  const [loading, setLoading] = useState(false);

  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [idEmpleado, setIdEmpleado] = useState<number | string>('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | string>('');
  const isSelectionMode = Boolean(onSelect);

  const fetchEmpleados = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEmpleados({ page, limit, search });
      setEmpleados(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      setErrorMessage('  No se pudo cargar la lista de empleados');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  const handleEdit = (id: number | string) => {
    setIdEmpleado(id);
    setModalEditarOpen(true);
  };

  const handleDelete = (id: number | string) => {
    setIdToDelete(id);
    setModalAdvertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!idToDelete) return;

    try {
      await deleteEmpleado(idToDelete);
      setSuccessMessage('  Empleado eliminado exitosamente');
      fetchEmpleados();
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      setErrorMessage('  No se pudo eliminar el empleado');
    } finally {
      setModalAdvertOpen(false);
      setIdToDelete('');
    }
  };

  const getEstadoBadgeColor = (estado?: string) => {
    if ((estado || '').toLowerCase() === 'activo') {
      return 'bg-green-100 text-green-700 border-green-300';
    }

    return 'bg-red-100 text-red-700 border-red-300';
  };

  return (
    <div
      className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8"
      style={{ scrollbarGutter: 'stable' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 md:gap-5">
            <div className="bg-white/20 backdrop-blur-sm p-3 sm:p-4 md:p-5 rounded-2xl shrink-0">
              <FaUsers className="text-white text-2xl sm:text-3xl md:text-4xl" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-1">
                Gestión de Empleados
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-blue-100">
                {isSelectionMode ? 'Selecciona un empleado' : 'Administra tu nómina de empleados'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-5 md:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative w-full">
              <FaSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido, cédula o teléfono..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className={styleSearchDark}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <SelectPage limit={limit} setLimit={setLimit} setPage={setPage} />
                <ButtonGrid onClick={(isGrid) => setVistaGrid(isGrid)} vistaGrid={vistaGrid} />
              </div>

              {!isSelectionMode && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <ButtonGral text="Nuevo Empleado" onClick={() => setModalCrearOpen(true)} />
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && empleados.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-500 dark:text-gray-300 shadow">
            No se encontraron empleados.
          </div>
        )}

        {!loading && empleados.length > 0 && (
          <div className={vistaGrid ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4' : 'grid grid-cols-1 gap-3'}>
            {empleados.map((empleado) => (
              <div
                key={empleado.idempleado}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500"
              >
                <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 text-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <FaUserCheck size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base truncate">
                          {empleado.nombre} {empleado.apellido}
                        </h3>
                        <p className="text-xs opacity-90">{empleado.tipo_remuneracion || 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getEstadoBadgeColor(empleado.estado)}`}>
                      {empleado.estado}
                    </span>
                  </div>
                </div>

                <div className="p-3 sm:p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <CardText title="Cédula" text={empleado.cedula || 'N/A'} containerClass={styleCardSmall} titleClass={styleTxtCards} textClass={styleTxtLabelBold} />
                    <CardText title="Teléfono" text={empleado.telefono || 'N/A'} containerClass={styleCardSmall} titleClass={styleTxtCards} textClass={styleTxtLabelBold} />
                    <CardText title="Ingreso" text={empleado.fecha_ingreso || 'N/A'} containerClass={styleCardSmall} titleClass={styleTxtCards} textClass={styleTxtLabelBold} />
                    <CardText title="IPS" text={empleado.aporta_ips ? 'Sí' : 'No'} containerClass={styleCardSmall} titleClass={styleTxtCards} textClass={styleTxtLabelBold} />
                  </div>

                  <div className="pt-3 border-t border-blue-100 dark:border-gray-600">
                    {onSelect ? (
                      <button
                        onClick={() => onSelect(empleado)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold text-sm"
                      >
                        <FaCheck /> Seleccionar
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(empleado.idempleado)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                        >
                          <FaEdit /> Editar
                        </button>
                        <button
                          onClick={() => handleDelete(empleado.idempleado)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                        >
                          <FaTrash /> Borrar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />
      </div>

      {!isSelectionMode && (
        <>
          <ModalCrearEmpleado
            isOpen={modalCrearOpen}
            onClose={() => setModalCrearOpen(false)}
            onSuccess={fetchEmpleados}
          />
          <ModalEditarEmpleado
            isOpen={modalEditarOpen}
            onClose={() => setModalEditarOpen(false)}
            id={idEmpleado}
            onSuccess={fetchEmpleados}
          />
          <ModalError isOpen={!!errorMessage} onClose={() => setErrorMessage('')} message={errorMessage} />
          <ModalSuccess isOpen={!!successMessage} onClose={() => setSuccessMessage('')} message={successMessage} />
          <ModalAdvert
            isOpen={modalAdvertOpen}
            onClose={() => setModalAdvertOpen(false)}
            message="¿Estás seguro de que deseas eliminar este empleado?"
            onConfirm={handleConfirmDelete}
          />
        </>
      )}
    </div>
  );
};

export default ListarEmpleados;

