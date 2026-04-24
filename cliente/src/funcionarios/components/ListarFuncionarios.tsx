'use client';

import { useEffect, useState } from 'react';
import {  FaSearch, FaEdit, FaTrash, FaUserTie, FaToggleOn, FaToggleOff, FaInfoCircle } from 'react-icons/fa';
import { getFuncionariosPaginated, deleteFuncionario, changeStatus } from '../../services/funcionarios';
import ModalCrearFuncionario from './Modals/ModalCrearFuncionario';
import ModalEditarFuncionario from './Modals/ModalEditarFuncionario';
import ModalError from '../../components/ModalError';
import ModalSuccess from '../../components/ModalSuccess';
import ModalAdvert from '../../components/ModalAdvert';
import SelectPage from '../../components/SelectPage';
import ButtonGrid from '../../components/ButtonGrid';
import SelectPagination from '../../components/SelectPagination';
import ButtonGral from '../../components/ButtonGral';
import { renderTitle } from '../../clientes/utils/utils';
import { styleSearchDark } from '../../components/utils/stylesGral';
import CardText from '../../ventas/components/CobroDeudaVenta/components/CardText';


const ListarFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [idFuncionario, setIdFuncionario] = useState<number | string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
  const [advertMessage, setAdvertMessage] = useState('');
  const [advertAction, setAdvertAction] = useState<(() => void) | null>(null);
  const [vistaGrid, setVistaGrid] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchFuncionarios = async () => {
    setLoading(true);
    try {
      const res = await getFuncionariosPaginated({ page, limit, search });
      setFuncionarios(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error al obtener funcionarios:', error);
      setErrorMessage('Error al obtener los funcionarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setAdvertMessage('¿Estás seguro de que deseas eliminar este funcionario?');
    setAdvertAction(() => async () => {
      try {
        await deleteFuncionario(id);
        setSuccessMessage('  Funcionario eliminado exitosamente');
        fetchFuncionarios();
      } catch (error) {
        console.error('Error al eliminar funcionario:', error);
        setErrorMessage('  No se pudo eliminar el funcionario');
      }
    });
    setModalAdvertOpen(true);
  };

  const handleChangeStatus = (id: number, estado: string) => {
    const nuevoEstado = estado === 'activo' ? 'inactivo' : 'activo';
    setAdvertMessage(`¿Deseas cambiar el estado a ${nuevoEstado}?`);
    setAdvertAction(() => async () => {
      try {
        await changeStatus(id, { estado: nuevoEstado });
        setSuccessMessage(`  Estado cambiado a ${nuevoEstado}`);
        fetchFuncionarios();
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        setErrorMessage('  No se pudo cambiar el estado');
      }
    });
    setModalAdvertOpen(true);
  };

  const handleConfirmAdvert = () => {
    if (advertAction) {
      advertAction();
    }
    setModalAdvertOpen(false);
    setAdvertAction(null);
  };

  useEffect(() => {
    fetchFuncionarios();
  }, [page, limit, search]);

  const handleEdit = (id: number) => {
    setIdFuncionario(id);
    setModalEditarOpen(true);
  };

  const getEstadoBadgeColor = (estado: string) => {
    if (estado === 'activo') return 'bg-green-100 text-green-700 border-green-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8" style={{ scrollbarGutter: 'stable' }}>
      <div className="max-w-7xl mx-auto">
        {renderTitle({
          title: "Gestión de Funcionarios",
          subtitle: "Administra los funcionarios del sistema",
          icon: <FaUserTie className="text-white text-3xl sm:text-4xl" />
        })}
        {/* Search and Actions Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-5 md:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative w-full md:w-96">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o login..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className={styleSearchDark}
              />
            </div>

            <div className="flex items-center gap-4">
              <ButtonGral text='Nuevo Funcionario' onClick={() => setModalCrearOpen(true)} />
              <SelectPage limit={limit} setLimit={setLimit} setPage={setPage} />
              <ButtonGrid onClick={(isGrid) => setVistaGrid(isGrid)} vistaGrid={vistaGrid} />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && funcionarios.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <FaInfoCircle className="text-gray-400 text-5xl mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {search
                ? 'No se encontraron funcionarios con ese criterio de búsqueda'
                : 'No hay funcionarios registrados'}
            </p>
          </div>
        )}

        {!loading && funcionarios.length > 0 && (
          <div className={vistaGrid ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "grid grid-cols-1 gap-4"}>
            {funcionarios.map((funcionario) => (
              <div
                key={funcionario.idfuncionario}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500"
              >
                {/* Header con gradiente */}
                <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 text-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <FaUserTie size={20} />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="font-bold text-base truncate">{funcionario.nombre} {funcionario.apellido}</h3>
                        <p className="text-xs opacity-90 truncate">{funcionario.tipo_funcionario || 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getEstadoBadgeColor(funcionario.estado)} border-2 flex-shrink-0`}>
                      {funcionario.estado}
                    </span>
                  </div>
                </div>


                {/* Body */}
                <div className="p-4 space-y-3">
                  {/* Datos con CardText style */}
                  <div className="grid grid-cols-2 gap-2">
                    <CardText title='Login' text={funcionario.login} />
                    <CardText title='Telefono' text={funcionario.telefono} />
                  </div>

                  {/* Acciones */}
                  <div className="pt-3 border-t border-blue-100 flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleEdit(funcionario.idfuncionario)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                      title="Editar"
                    >
                      <FaEdit />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(funcionario.idfuncionario)}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => handleChangeStatus(funcionario.idfuncionario, funcionario.estado)}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                      title={funcionario.estado === 'activo' ? 'Desactivar' : 'Activar'}
                    >
                      {funcionario.estado === 'activo' ? <FaToggleOff /> : <FaToggleOn />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {!loading && funcionarios.length > 0 && (
          <div className="mt-6">
            <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />
          </div>
        )}
      </div>

      <ModalCrearFuncionario
        isOpen={modalCrearOpen}
        onClose={() => setModalCrearOpen(false)}
        onSuccess={() => {
          fetchFuncionarios();
        }}
      />

      <ModalEditarFuncionario
        isOpen={modalEditarOpen}
        onClose={() => setModalEditarOpen(false)}
        id={idFuncionario}
        onSuccess={() => {
          setModalEditarOpen(false);
          fetchFuncionarios();
        }}
      />

      <ModalError isOpen={!!errorMessage} onClose={() => setErrorMessage('')} message={errorMessage} />
      <ModalSuccess isOpen={!!successMessage} onClose={() => setSuccessMessage('')} message={successMessage} />
      <ModalAdvert
        isOpen={modalAdvertOpen}
        onClose={() => setModalAdvertOpen(false)}
        message={advertMessage}
        onConfirm={handleConfirmAdvert}
        confirmButtonText="Confirmar"
      />
    </div>
  );
};

export default ListarFuncionarios;
