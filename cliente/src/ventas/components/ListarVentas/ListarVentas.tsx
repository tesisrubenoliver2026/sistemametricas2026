"use client";

import { useEffect, useState } from "react";
import { FaShoppingBag, FaEye, FaTrash, FaInfoCircle } from 'react-icons/fa';
import ModalCrearVenta from "../ModalsVenta/ModalCrearVenta";
import ModalDetalleVenta from "../ModalsVenta/ModalDetalleVenta";
import ModalError from "../../../components/ModalError";
import ModalSuccess from "../../../components/ModalSuccess";
import ModalAdvert from "../../../components/ModalAdvert";
import { deleteVenta, getVentasPaginated, getReporteVentasData, generateReporteVentasPDF, generateLibroVentasPDF } from '../../../services/ventas';
import { getCargoUsuario } from "../../../services/usuarios";
import ModalSeleccionarFechas from "../../../components/ModalSeleccionarFechas";
import { ReportListVentas } from '../ReportListVentas';
import type { ReporteVentasResponse } from '../../../types/reporte.types';
import ButtonGrid from "../../../components/ButtonGrid";
import SelectPage from "../../../components/SelectPage";
import SelectPagination from "../../../components/SelectPagination";
import CardText from "../CobroDeudaVenta/components/CardText";
import ButtonGral from "../../../components/ButtonGral";
import SearchActionsBar from "../../../components/SearchActionsBar";

const ListarVentas = () => {
  const [ventas, setVentas] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [modalCrearVentaOpen, setModalCrearVentaOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<any | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [datosReporte, setDatosReporte] = useState<ReporteVentasResponse | null>(null);
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [modalLibroVentasOpen, setModalLibroVentasOpen] = useState(false);
  const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
  const [advertMessage, setAdvertMessage] = useState("");
  const [advertAction, setAdvertAction] = useState<(() => void) | null>(null);
  const [vistaGrid, setVistaGrid] = useState(true);
  const [loading, setLoading] = useState(false);

  const [fecha_inicio, setFechaInicio] = useState<string>('');
  const [fecha_fin, setFechaFin] = useState<string>('');
  const [modalFechasReporteOpen, setModalFechasReporteOpen] = useState(false);

  const [cargo, setCargo] = useState("");
  const fetchCargo = async () => {
    const { data } = await getCargoUsuario();
    setCargo(data.acceso)
  };
  useEffect(() => {
    fetchCargo()
  }, [])
  const isAdmin = cargo === "Administrador"


  const fetchVentas = async () => {
    try {
      setLoading(true);
      const res = await getVentasPaginated({ page, limit, search, fecha_inicio, fecha_fin });
      setVentas(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Error al obtener ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentas();
  }, [page, limit, search, fecha_inicio, fecha_fin]);

  const handleDelete = (id: number) => {
    setAdvertMessage('¿Estás seguro de que deseas anular esta venta?');
    setAdvertAction(() => async () => {
      try {
        await deleteVenta(id);
        setSuccessMessage('  Venta anulada exitosamente');
        fetchVentas();
      } catch (error) {
        console.error('Error al anular venta:', error);
        setErrorMessage('  No se pudo anular la venta');
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

  const handleGenerateReporteList = async () => {
    try {
      const fechaInicio = fecha_inicio || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const fechaFin = fecha_fin || new Date().toISOString().split('T')[0];

      const res = await getReporteVentasData({ search, fecha_inicio: fechaInicio, fecha_fin: fechaFin, tipo: '' });

      const ventas = res.data.data || res.data;
      const filtros = res.data.filtros || {};
      const estadisticas = res.data.estadisticas || {};

      const totalVentas = estadisticas.total_ventas || ventas.length;
      const ventasContado = estadisticas.ventas_contado || ventas.filter((v: any) => v.tipo.toLowerCase() === 'contado').length;
      const ventasCredito = estadisticas.ventas_credito || ventas.filter((v: any) => v.tipo.toLowerCase() === 'credito').length;

      const reporteTransformado: ReporteVentasResponse = {
        message: '  Reporte de ventas generado correctamente',
        datosReporte: {
          empresa: {
            nombre_fantasia: '',
            ruc: '',
            timbrado_nro: '',
            fecha_inicio_vigente: '',
            fecha_fin_vigente: '',
            fecha_emision: new Date().toLocaleDateString('es-PY')
          },
          reporte: {
            titulo: 'Reporte de Ventas',
            fecha_inicio: filtros.fecha_inicio,
            fecha_fin: filtros.fecha_fin,
            total_ventas: totalVentas,
            ventas_contado: ventasContado,
            ventas_credito: ventasCredito,
            monto_total_ventas: estadisticas.monto_total_ventas || '0',
            monto_total_descuentos: estadisticas.monto_total_descuentos || '0',
            ganancia_total: estadisticas.ganancia_total || '0',
            cantidad_total_productos: estadisticas.cantidad_total_productos || 0,
            ventas: ventas
          }
        }
      };

      setDatosReporte(reporteTransformado);
      setMostrarReporte(true);
    } catch (error) {
      console.error("  Error al generar reporte de ventas:", error);
      setErrorMessage("  Error al generar el reporte");
    }
  };

  const handleGenerarReporteConFechas = (fechaInicio: string, fechaFin: string) => {
    setFechaInicio(fechaInicio);
    setFechaFin(fechaFin);
    setModalFechasReporteOpen(false);
    setTimeout(() => {
      handleGenerateReporteList();
    }, 100);
  };

  const handleDownloadPDF = async (tipoFiltro: string) => {
    try {
      // Calcular fechas por defecto (año actual)
      const fechaInicio = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const fechaFin = new Date().toISOString().split('T')[0];

      const res = await generateReporteVentasPDF({ search, fecha_inicio: fechaInicio, fecha_fin: fechaFin, tipo: tipoFiltro });
      const base64PDF = res.data.pdf;
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${base64PDF}`;
      link.download = `Reporte-Ventas-${new Date().toLocaleDateString()}.pdf`;
      link.click();
    } catch (error) {
      console.error("  Error al generar PDF de ventas:", error);
      setErrorMessage("  Error al generar el PDF");
    }
  };

  const handleDownloadLibroVentas = async (fechaInicio: string, fechaFin: string) => {
    try {
      console.log('📚 Descargando Libro de Ventas SET...');
      const res = await generateLibroVentasPDF({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
      const base64PDF = res.data.reportePDFBase64;
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${base64PDF}`;
      link.download = `Libro-Ventas-SET-${fechaInicio}-${fechaFin}.pdf`;
      link.click();
      console.log('  Libro de Ventas descargado exitosamente');
    } catch (error) {
      console.error("  Error al generar Libro de Ventas:", error);
      setErrorMessage("  Error al generar el Libro de Ventas");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8" style={{ scrollbarGutter: 'stable' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 mb-6 md:mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 sm:p-4 rounded-2xl">
                <FaShoppingBag className="text-white text-3xl sm:text-4xl" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
                  Gestión de Ventas
                </h1>
                <p className="text-sm sm:text-base text-blue-100">Administra las ventas del sistema</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <SearchActionsBar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Buscar por cliente o documento..."
        >
          <ButtonGral text="Nueva Venta" onClick={() => setModalCrearVentaOpen(true)} />
          <ButtonGral text="Reporte" onClick={() => setModalFechasReporteOpen(true)} />
          <ButtonGral text="Libro Venta" onClick={() => setModalLibroVentasOpen(true)} />
          <SelectPage limit={limit} setLimit={setLimit} setPage={setPage} />
          <ButtonGrid onClick={(isGrid) => setVistaGrid(isGrid)} vistaGrid={vistaGrid} />
        </SearchActionsBar>

        {/* Filtro de fechas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Desde:</label>
              <input
                type="date"
                value={fecha_inicio}
                onChange={(e) => {
                  setFechaInicio(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hasta:</label>
              <input
                type="date"
                value={fecha_fin}
                onChange={(e) => {
                  setFechaFin(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {(fecha_inicio || fecha_fin) && (
              <button
                onClick={() => {
                  setFechaInicio('');
                  setFechaFin('');
                  setPage(1);
                }}
                className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && ventas.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <FaInfoCircle className="text-gray-400 dark:text-gray-500 text-5xl mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {search ? 'No se encontraron ventas con ese criterio de búsqueda' : 'No hay ventas registradas'}
            </p>
          </div>
        )}

        {/* Vista condicional: Grid o Lista */}
        {!loading && ventas.length > 0 && (
          <div className={vistaGrid ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "grid grid-cols-1 gap-4"}>
            {ventas.map((venta: any) => (
              <div
                key={venta.idventa}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500"
              >
                {/* Header con gradiente */}
                <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 text-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <FaShoppingBag size={20} />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="font-bold text-base truncate block">{venta.nombre_cliente}</h3>
                        <p className="text-xs opacity-90 truncate block">{venta.documento_cliente}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  {/* Badges de tipo y estado */}
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold border-2 'bg-blue-100 text-blue-700 border-blue-300">
                      {venta.tipo.toUpperCase()}
                    </span>
                  </div>

                  {/* Info Grid con CardText */}
                  <div className="grid grid-cols-2 gap-3">
                    <CardText
                      title="Fecha"
                      text={new Date(venta.fecha).toLocaleDateString('es-PY')}
                    />
                    <CardText
                      title="Total Venta"
                      text={`₲ ${parseInt(venta.total).toLocaleString("es-PY")}`}
                    />
                    {isAdmin && (
                      <CardText
                        title="Ganancia"
                        text={`₲ ${parseInt(venta.total_ganancia).toLocaleString("es-PY")}`}
                      />
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="pt-3 border-t border-blue-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedVenta(venta);
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
                        title="Ver detalles"
                      >
                        <FaEye />
                        Ver Detalle
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(venta.idventa)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
                          title="Anular venta"
                        >
                          <FaTrash />
                          Anular
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {!loading && ventas.length > 0 && (
          <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />
        )}
      </div>
      {/* Modales */}
      <ModalCrearVenta
        isOpen={modalCrearVentaOpen}
        onClose={() => setModalCrearVentaOpen(false)}
        onSuccess={() => {
          fetchVentas();
        }}
      />

      <ModalDetalleVenta
        isOpen={!!selectedVenta}
        venta={selectedVenta}
        onClose={() => {
          setSelectedVenta(null);
        }}
      />

      <ModalError isOpen={!!errorMessage} onClose={() => setErrorMessage("")} message={errorMessage} />
      <ModalSuccess isOpen={!!successMessage} onClose={() => setSuccessMessage("")} message={successMessage} />
      <ModalAdvert
        isOpen={modalAdvertOpen}
        onClose={() => setModalAdvertOpen(false)}
        message={advertMessage}
        onConfirm={handleConfirmAdvert}
        confirmButtonText="Confirmar"
      />

      {mostrarReporte && datosReporte && (
        <ReportListVentas
          reporte={datosReporte.datosReporte.reporte}
          onClose={() => setMostrarReporte(false)}
          onDownloadPDF={handleDownloadPDF}
        />
      )}

      <ModalSeleccionarFechas
        isOpen={modalLibroVentasOpen}
        onClose={() => setModalLibroVentasOpen(false)}
        onGenerar={handleDownloadLibroVentas}
        titulo="Libro de Ventas"
        descripcion="Selecciona el período para generar el Libro de Ventas"
      />

      <ModalSeleccionarFechas
        isOpen={modalFechasReporteOpen}
        onClose={() => setModalFechasReporteOpen(false)}
        onGenerar={handleGenerarReporteConFechas}
        titulo="Reporte de Ventas"
        descripcion="Selecciona el período para generar el reporte"
      />

    </div>
  );
};

export default ListarVentas;
