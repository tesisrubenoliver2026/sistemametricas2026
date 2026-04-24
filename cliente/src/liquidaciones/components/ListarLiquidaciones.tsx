'use client';

import { useCallback, useEffect, useState } from 'react';
import { FaFileInvoiceDollar, FaSearch, FaEdit, FaTrash, FaIdCard, FaPlus, FaListAlt, FaFilePdf } from 'react-icons/fa';
import {
  deleteLiquidacion,
  getLiquidaciones,
  getLiquidacionPDFById,
  updateEstadoLiquidacion,
  type Liquidacion,
} from '../../services/rrhh';
import ModalCrearLiquidacion from './ModalsLiquidaciones/ModalCrearLiquidacion';
import ModalEditarLiquidacion from './ModalsLiquidaciones/ModalEditarLiquidacion';
import ModalDetalleLiquidacion from './ModalsLiquidaciones/ModalDetalleLiquidacion';
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

const toNumber = (value: number | string | null | undefined) => Number(value ?? 0);

const getEstadoBadgeColor = (estado: string) => {
  const v = (estado || '').toLowerCase();
  if (v === 'anulada') return 'bg-red-100 text-red-700 border-red-300';
  if (v === 'pagada') return 'bg-emerald-100 text-emerald-700 border-emerald-300';
  if (v === 'pendiente') return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-blue-100 text-blue-700 border-blue-300';
};

const formatFecha = (fecha?: string | null) => {
  if (!fecha) return 'N/A';
  const value = String(fecha);
  const onlyDate = value.includes('T') ? value.slice(0, 10) : value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(onlyDate)) {
    const [y, m, d] = onlyDate.split('-');
    return `${d}-${m}-${y}`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(onlyDate)) return onlyDate;
  return onlyDate;
};

const ListarLiquidaciones = () => {
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([]);
  const [search, setSearch] = useState('');
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estado, setEstado] = useState<'todos' | 'Pendiente' | 'Pagada' | 'Anulada'>('todos');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [vistaGrid, setVistaGrid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pendientesTotal, setPendientesTotal] = useState<number | null>(null);

  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [idLiquidacion, setIdLiquidacion] = useState<number | string>('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | string>('');

  const fetchLiquidaciones = useCallback(async () => {
    const params: {
      page: number;
      limit: number;
      search?: string;
      nombre?: string;
      documento?: string;
      fechaInicio?: string;
      fechaFin?: string;
      estado?: 'todos' | 'Pendiente' | 'Pagada' | 'Anulada';
    } = {
      page,
      limit,
    };

    if (search.trim()) params.search = search.trim();
    if (nombre.trim()) params.nombre = nombre.trim();
    if (documento.trim()) params.documento = documento.trim();
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    if (estado && estado !== 'todos') params.estado = estado;

    try {
      setLoading(true);
      const res = await getLiquidaciones(params);
      setLiquidaciones(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);

      // Auditoria simple: total de pendientes con los mismos filtros (excepto estado)
      const pendientesParams = { ...params, page: 1, limit: 1, estado: 'Pendiente' as const };
      const pendientesRes = await getLiquidaciones(pendientesParams);
      setPendientesTotal(pendientesRes.data.total ?? null);
    } catch (error) {
      console.error('Error al obtener liquidaciones:', error);
      setErrorMessage('  No se pudo cargar la lista de liquidaciones');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, nombre, documento, fechaInicio, fechaFin, estado]);

  useEffect(() => {
    fetchLiquidaciones();
  }, [fetchLiquidaciones]);

  const handleEdit = (id: number | string) => {
    setIdLiquidacion(id);
    setModalEditarOpen(true);
  };

  const handleDetalle = (id: number | string) => {
    setIdLiquidacion(id);
    setModalDetalleOpen(true);
  };

  const handleCambiarEstado = async (id: number | string, nuevoEstado: 'Pendiente' | 'Pagada' | 'Anulada') => {
    try {
      await updateEstadoLiquidacion(id, nuevoEstado);
      setSuccessMessage(`  Estado actualizado a "${nuevoEstado}"`);
      fetchLiquidaciones();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setErrorMessage('  No se pudo actualizar el estado de la liquidacion');
    }
  };

  const handleDownloadPDF = async (id: number | string) => {
    try {
      const res = await getLiquidacionPDFById(id);
      const base64PDF = res.data.reportePDFBase64;
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${base64PDF}`;
      link.download = `Liquidacion-${id}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error al generar PDF de liquidacion:', error);
      setErrorMessage('  No se pudo generar el PDF de la liquidacion');
    }
  };

  const handleDelete = (id: number | string) => {
    setIdToDelete(id);
    setModalAdvertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!idToDelete) return;

    try {
      await deleteLiquidacion(idToDelete);
      setSuccessMessage('  Liquidacion eliminada exitosamente');
      fetchLiquidaciones();
    } catch (error) {
      console.error('Error al eliminar liquidacion:', error);
      setErrorMessage('  No se pudo eliminar la liquidacion');
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
              <FaFileInvoiceDollar className="text-white text-2xl sm:text-3xl md:text-4xl" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-1">
                Gestion de Liquidaciones
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-blue-100">
                Administra liquidaciones de empleados
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-5 md:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative w-full">
                <FaSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                <input
                  type="text"
                  placeholder="Buscar por tipo, estado, total, fechas..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={estado}
                onChange={(e) => {
                  setEstado(e.target.value as any);
                  setPage(1);
                }}
                className={styleSearchDark}
              >
                <option value="todos">Estado (todos)</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Pagada">Pagada</option>
                <option value="Anulada">Anulada</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                  const toISO = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                  setFechaInicio(toISO(firstDay));
                  setFechaFin(toISO(now));
                  setEstado('Pendiente');
                  setPage(1);
                }}
                className="rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-4 py-2 border border-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700"
              >
                Pendientes del mes
              </button>

              <div className="rounded-xl border border-blue-200 dark:border-gray-600 bg-blue-50 dark:bg-gray-700 px-4 py-2 text-blue-800 dark:text-blue-200 font-semibold text-sm flex items-center justify-between gap-2">
                <span>Pendientes</span>
                <span>{pendientesTotal ?? '-'}</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <SelectPage limit={limit} setLimit={setLimit} setPage={setPage} />
                <ButtonGrid onClick={(isGrid) => setVistaGrid(isGrid)} vistaGrid={vistaGrid} />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <ButtonGral text="Nueva Liquidacion" onClick={() => setModalCrearOpen(true)} icon={<FaPlus />} />
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && liquidaciones.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-500 dark:text-gray-300 shadow">
            No se encontraron liquidaciones.
          </div>
        )}

        {!loading && liquidaciones.length > 0 && (
          <div className={vistaGrid ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4' : 'grid grid-cols-1 gap-3'}>
            {liquidaciones.map((liquidacion) => (
              <div
                key={liquidacion.idliquidacion}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500"
              >
                <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 text-white">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm sm:text-base truncate">
                      {liquidacion.nombre || 'Empleado'} {liquidacion.apellido || ''}
                    </h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getEstadoBadgeColor(liquidacion.estado)}`}>
                      {liquidacion.estado}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-blue-100 truncate">
                    Doc: {liquidacion.cedula || 'N/A'}
                  </p>
                </div>

                <div className="p-3 sm:p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <CardText title="Periodo" text={`${formatFecha(liquidacion.fecha_inicio)} al ${formatFecha(liquidacion.fecha_fin)}`} containerClass={styleCardSmall} titleClass={styleTxtCards} textClass={styleTxtLabelBold} />
                    <CardText title="Tipo" text={liquidacion.tipo || 'N/A'} containerClass={styleCardSmall} titleClass={styleTxtCards} textClass={styleTxtLabelBold} />
                    <CardText title="Salario" text={toNumber(liquidacion.salario_base).toFixed(2)} containerClass={styleCardSmall} titleClass={styleTxtCards} textClass={styleTxtLabelBold} />
                    <CardText title="Total a cobrar" text={toNumber(liquidacion.total_a_cobrar).toFixed(2)} containerClass={styleCardSmall} titleClass={styleTxtCards} textClass={styleTxtLabelBold} />
                  </div>

                  <div className="pt-3 border-t border-blue-100 dark:border-gray-600">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => handleEdit(liquidacion.idliquidacion)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                      >
                        <FaEdit /> Ver
                      </button>
                      <button
                        onClick={() => {
                          if ((liquidacion.estado || '').toLowerCase() !== 'pendiente') {
                            setErrorMessage('  Solo se puede editar el detalle cuando el estado es Pendiente');
                            return;
                          }
                          handleDetalle(liquidacion.idliquidacion);
                        }}
                        className={`px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold ${
                          (liquidacion.estado || '').toLowerCase() === 'pendiente'
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <FaListAlt /> Detalle
                      </button>
                      <select
                        value={liquidacion.estado || 'Pendiente'}
                        onChange={(e) => handleCambiarEstado(liquidacion.idliquidacion, e.target.value as any)}
                        className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pagada">Pagada</option>
                        <option value="Anulada">Anulada</option>
                      </select>
                      <button
                        onClick={() => handleDownloadPDF(liquidacion.idliquidacion)}
                        className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                      >
                        <FaFilePdf /> PDF
                      </button>
                      <button
                        onClick={() => handleDelete(liquidacion.idliquidacion)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold"
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

      <ModalCrearLiquidacion
        isOpen={modalCrearOpen}
        onClose={() => setModalCrearOpen(false)}
        onSuccess={fetchLiquidaciones}
        idEmpleadoInicial={null}
      />
      <ModalEditarLiquidacion id={idLiquidacion} isOpen={modalEditarOpen} onClose={() => setModalEditarOpen(false)} />
      <ModalDetalleLiquidacion idliquidacion={idLiquidacion} isOpen={modalDetalleOpen} onClose={() => setModalDetalleOpen(false)} />
      <ModalError isOpen={!!errorMessage} onClose={() => setErrorMessage('')} message={errorMessage} />
      <ModalSuccess isOpen={!!successMessage} onClose={() => setSuccessMessage('')} message={successMessage} />
      <ModalAdvert
        isOpen={modalAdvertOpen}
        onClose={() => setModalAdvertOpen(false)}
        message="Estas seguro de que deseas eliminar esta liquidacion?"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ListarLiquidaciones;
