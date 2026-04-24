'use client';

import { useCallback, useEffect, useState } from 'react';
import { FaBusinessTime, FaEdit, FaTrash, FaIdCard, FaPlus } from 'react-icons/fa';
import { deleteHoraExtra, getHorasExtras, type HoraExtra } from '../../services/rrhh';
import ModalCrearHorasExtras from './ModalsHorasExtras/ModalCrearHorasExtras';
import ModalEditarHorasExtras from './ModalsHorasExtras/ModalEditarHorasExtras';
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

const ListarHorasExtras = () => {
  const [horasExtras, setHorasExtras] = useState<HoraExtra[]>([]);
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [vistaGrid, setVistaGrid] = useState(true);
  const [loading, setLoading] = useState(false);

  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [idHoraExtra, setIdHoraExtra] = useState<number | string>('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | string>('');

  const fetchHorasExtras = useCallback(async () => {
    const params: {
      page: number;
      limit: number;
      nombre?: string;
      documento?: string;
      fechaInicio?: string;
      fechaFin?: string;
    } = {
      page,
      limit,
    };

    if (nombre.trim()) params.nombre = nombre.trim();
    if (documento.trim()) params.documento = documento.trim();
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    try {
      setLoading(true);
      const res = await getHorasExtras(params);
      setHorasExtras(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Error al obtener horas extras:', error);
      setErrorMessage('  No se pudo cargar la lista de horas extras');
    } finally {
      setLoading(false);
    }
  }, [page, limit, nombre, documento, fechaInicio, fechaFin]);

  useEffect(() => {
    fetchHorasExtras();
  }, [fetchHorasExtras]);

  const handleEdit = (id: number | string) => {
    setIdHoraExtra(id);
    setModalEditarOpen(true);
  };

  const handleDelete = (id: number | string) => {
    setIdToDelete(id);
    setModalAdvertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!idToDelete) return;

    try {
      await deleteHoraExtra(idToDelete);
      setSuccessMessage('  Hora extra eliminada exitosamente');
      fetchHorasExtras();
    } catch (error) {
      console.error('Error al eliminar hora extra:', error);
      setErrorMessage('  No se pudo eliminar la hora extra');
    } finally {
      setModalAdvertOpen(false);
      setIdToDelete('');
    }
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
              <FaBusinessTime className="text-white text-2xl sm:text-3xl md:text-4xl" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-1">
                Gestion de Horas Extras
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-blue-100">
                Administra las horas extras por empleado
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-5 md:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Filtrar por nombre..."
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    setPage(1);
                  }}
                  className={styleSearchDark}
                />
              </div>

              <div className="flex items-center gap-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 dark:bg-gray-700">
                <FaIdCard className="text-gray-500 dark:text-gray-300" />
                <input
                  type="text"
                  placeholder="Filtrar por nro. documento..."
                  value={documento}
                  onChange={(e) => {
                    setDocumento(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => {
                  setFechaInicio(e.target.value);
                  setPage(1);
                }}
                className={styleSearchDark}
              />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => {
                  setFechaFin(e.target.value);
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

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <ButtonGral text="Nueva Hora Extra" onClick={() => setModalCrearOpen(true)} icon={<FaPlus />} />
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && horasExtras.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-500 dark:text-gray-300 shadow">
            No se encontraron horas extras.
          </div>
        )}

        {!loading && horasExtras.length > 0 && (
          <div className={vistaGrid ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4' : 'grid grid-cols-1 gap-3'}>
            {horasExtras.map((horaExtra) => (
              <div
                key={horaExtra.idhextra}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500"
              >
                <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 text-white">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm sm:text-base truncate">
                      {horaExtra.nombre || 'Empleado'} {horaExtra.apellido || ''}
                    </h3>
                    <span className="px-2 py-1 rounded-lg text-xs font-bold border bg-blue-100 text-blue-700 border-blue-300">
                      {horaExtra.cantidad_horas ?? 'N/A'} hs
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-blue-100 truncate">
                    Doc: {horaExtra.cedula || 'N/A'} | Fecha: {horaExtra.fecha || 'N/A'}
                  </p>
                </div>

                <div className="p-3 sm:p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <CardText title="Empleado" text={`${horaExtra.nombre || 'N/A'} ${horaExtra.apellido || ''}`.trim()} containerClass={styleCardSmall} titleClass={styleTxtCards} textClass={styleTxtLabelBold} />
                    <CardText title="Documento" text={horaExtra.cedula || 'N/A'} containerClass={styleCardSmall} titleClass={styleTxtCards} textClass={styleTxtLabelBold} />
                    <CardText title="Cantidad" text={`${horaExtra.cantidad_horas ?? 'N/A'} hs`} containerClass={styleCardSmall} titleClass={styleTxtCards} textClass={styleTxtLabelBold} />
                    <CardText title="Tipo" text={horaExtra.tipo || 'N/A'} containerClass={styleCardSmall} titleClass={styleTxtCards} textClass={styleTxtLabelBold} />
                    <CardText title="Aprobado por" text={horaExtra.aprobado_por || 'N/A'} containerClass={styleCardSmall} titleClass={styleTxtCards} textClass={styleTxtLabelBold} />
                    <CardText title="Observacion" text={horaExtra.observacion || 'Sin observacion'} containerClass={styleCardSmall} titleClass={styleTxtCards} textClass={styleTxtLabelBold} />
                  </div>

                  <div className="pt-3 border-t border-blue-100 dark:border-gray-600">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(horaExtra.idhextra)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(horaExtra.idhextra)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                      >
                        <FaTrash /> Borrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />
      </div>

      <ModalCrearHorasExtras isOpen={modalCrearOpen} onClose={() => setModalCrearOpen(false)} onSuccess={fetchHorasExtras} />
      <ModalEditarHorasExtras id={idHoraExtra} isOpen={modalEditarOpen} onClose={() => setModalEditarOpen(false)} onSuccess={fetchHorasExtras} />
      <ModalError isOpen={!!errorMessage} onClose={() => setErrorMessage('')} message={errorMessage} />
      <ModalSuccess isOpen={!!successMessage} onClose={() => setSuccessMessage('')} message={successMessage} />
      <ModalAdvert
        isOpen={modalAdvertOpen}
        onClose={() => setModalAdvertOpen(false)}
        message="Estas seguro de que deseas eliminar esta hora extra?"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ListarHorasExtras;
