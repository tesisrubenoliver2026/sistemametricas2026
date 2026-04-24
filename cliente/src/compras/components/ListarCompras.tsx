'use client';

import { useEffect, useState } from 'react';
import { FaShoppingCart, FaEye, FaTrash, FaInfoCircle } from 'react-icons/fa';
import ModalDetalleCompra from "./Modals/ModalDetalleCompra";
import ModalCrearCompra from './Modals/ModalCrearCompra';
import ModalError from '../../components/ModalError';
import ModalSuccess from '../../components/ModalSuccess';
import ModalAdvert from '../../components/ModalAdvert';
import { deleteCompra, fetchComprasPaginate, getComprasMonth, getReportListCompra, getReportComprasPDF, generateLibroComprasPDF } from '../../services/compras';
import ModalSeleccionarFechas from '../../components/ModalSeleccionarFechas';
import { ReporteCompras } from './ReporteCompras';
import type { ReporteComprasResponse } from '../../types/reporte.types';
import ButtonGrid from '../../components/ButtonGrid';
import SelectPage from '../../components/SelectPage';
import SelectPagination from '../../components/SelectPagination';
import CardText from '../../ventas/components/CobroDeudaVenta/components/CardText';
import ButtonGral from '../../components/ButtonGral';
import SearchActionsBar from '../../components/SearchActionsBar';
import { renderTitle } from '../../clientes/utils/utils';

const ListarCompras = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [compras, setCompras] = useState<any[]>([]);
    const [modalCrearCompraOpen, setModalCrearCompraOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCompra, setSelectedCompra] = useState<any | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [datosReporte, setDatosReporte] = useState<ReporteComprasResponse | null>(null);
    const [mostrarReporte, setMostrarReporte] = useState(false);
    const [modalLibroComprasOpen, setModalLibroComprasOpen] = useState(false);
    const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
    const [advertMessage, setAdvertMessage] = useState("");
    const [advertAction, setAdvertAction] = useState<(() => void) | null>(null);
    const [vistaGrid, setVistaGrid] = useState(true);
    const [loading, setLoading] = useState(false);
    // Filtro por tipo de compra: 'todas' | 'inventario_inicial' | 'normal'
    const [tipoCompra, setTipoCompra] = useState<'todas' | 'inventario_inicial' | 'normal'>('todas');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    // Estilos para CardText
    const styleCardSmall = "bg-blue-50 dark:bg-gray-700 rounded-lg p-3 border border-blue-200 dark:border-gray-600";
    const styleTxtCards = "text-xs text-blue-600 dark:text-blue-400 font-medium mb-1";
    const styleTxtLabelBold = "text-xs font-bold text-blue-700 dark:text-gray-200 truncate";

    const fetchCompras = async () => {
        try {
            setLoading(true);
            const res = await fetchComprasPaginate(page, limit, search, tipoCompra, fechaInicio || undefined, fechaFin || undefined);
            setCompras(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error al obtener compras:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompras2 = async () => {
        try {
            const res = await getComprasMonth(2025);
            console.log(res)
        } catch (error) {
            console.error('Error al obtener compras:', error);
        }
    };

    const handleDelete = (id: number) => {
        setAdvertMessage('¿Estás seguro de que deseas anular esta compra?');
        setAdvertAction(() => async () => {
            try {
                await deleteCompra(id);
                setSuccessMessage('  Compra anulada exitosamente');
                fetchCompras();
            } catch (error) {
                console.error('Error al anular compra:', error);
                setErrorMessage('  No se pudo anular la compra');
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
        fetchCompras();
        fetchCompras2();
    }, [page, limit, search, tipoCompra, fechaInicio, fechaFin]);

    const handleGenerateReporteList = async () => {
        try {
            const res = await getReportListCompra(search, fechaInicio, fechaFin, '');
            console.log("📊 Respuesta del servidor:", res.data);

            // Transformar la respuesta al formato esperado
            const compras = res.data.data || res.data;
            const filtros = res.data.filtros || {};
            const estadisticas = res.data.estadisticas || {};

            // Calcular estadísticas
            const totalCompras = estadisticas.total_compras || compras.length;
            const comprasContado = estadisticas.compras_contado || compras.filter((c: any) => c.tipo.toLowerCase() === 'contado').length;
            const comprasCredito = estadisticas.compras_credito || compras.filter((c: any) => c.tipo.toLowerCase() === 'credito').length;

            // Crear estructura de datos esperada
            const reporteTransformado: ReporteComprasResponse = {
                message: '  Reporte de compras generado correctamente',
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
                        titulo: 'Reporte de Compras',
                        fecha_inicio: filtros.fecha_inicio,
                        fecha_fin: filtros.fecha_fin,
                        total_compras: totalCompras,
                        compras_contado: comprasContado,
                        compras_credito: comprasCredito,
                        monto_total_compras: estadisticas.monto_total_compras || '0',
                        monto_total_descuentos: estadisticas.monto_total_descuentos || '0',
                        cantidad_total_productos: estadisticas.cantidad_total_productos || 0,
                        compras: compras
                    }
                }
            };

            setDatosReporte(reporteTransformado);
            setMostrarReporte(true);
        } catch (error) {
            console.error("  Error al generar reporte de compras:", error);
            setErrorMessage("  Error al generar el reporte");
        }
    };

    const handleDownloadPDF = async (tipoFiltro: string) => {
        try {
            const res = await getReportComprasPDF(search, fechaInicio, fechaFin, tipoFiltro);
            const base64PDF = res.data.reportePDFBase64;
            const link = document.createElement("a");
            link.href = `data:application/pdf;base64,${base64PDF}`;
            link.download = `Reporte-Compras-${new Date().toLocaleDateString()}.pdf`;
            link.click();
        } catch (error) {
            console.error("  Error al generar PDF de compras:", error);
            setErrorMessage("  Error al generar el PDF");
        }
    };

    const handleDownloadLibroCompras = async (fechaInicio: string, fechaFin: string) => {
        try {
            console.log('📚 Descargando Libro de Compras SET...');
            const res = await generateLibroComprasPDF({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
            const base64PDF = res.data.reportePDFBase64;
            const link = document.createElement("a");
            link.href = `data:application/pdf;base64,${base64PDF}`;
            link.download = `Libro-Compras-SET-${fechaInicio}-${fechaFin}.pdf`;
            link.click();
            console.log('  Libro de Compras descargado exitosamente');
        } catch (error) {
            console.error("  Error al generar Libro de Compras:", error);
            setErrorMessage("  Error al generar el Libro de Compras");
        }
    };

    return (
        <div className="truncate bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4" style={{ scrollbarGutter: 'stable' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header con gradiente */}

                {renderTitle({
                    title: "Gestión de Compras",
                    subtitle: "Administra las compras del sistema",
                    icon: <FaShoppingCart className="text-white text-3xl sm:text-4xl" />
                })}

                {/* Search and Actions Bar */}
                <SearchActionsBar
                    searchValue={search}
                    onSearchChange={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    searchPlaceholder="Buscar por proveedor o factura..."
                >
                    {/* Filtro por tipo de compra */}
                    <select
                        value={tipoCompra}
                        onChange={(e) => {
                            setTipoCompra(e.target.value as 'todas' | 'inventario_inicial' | 'normal');
                            setPage(1);
                        }}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="todas">Todas las compras</option>
                        <option value="inventario_inicial">Inventario Inicial</option>
                        <option value="normal">Compras Normales</option>
                    </select>
                    {/* Filtro por rango de fechas */}
                    <div className="flex items-center gap-1">
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => { setFechaInicio(e.target.value); setPage(1); }}
                            className="px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            title="Fecha desde"
                        />
                        <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => { setFechaFin(e.target.value); setPage(1); }}
                            className="px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            title="Fecha hasta"
                        />
                        {(fechaInicio || fechaFin) && (
                            <button
                                onClick={() => { setFechaInicio(''); setFechaFin(''); setPage(1); }}
                                className="px-2 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                title="Limpiar fechas"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <ButtonGral text='Nueva Compra' onClick={() => setModalCrearCompraOpen(true)} />
                    <ButtonGral text='Reporte' onClick={handleGenerateReporteList} />
                    <ButtonGral text='Libro Compra' onClick={() => setModalLibroComprasOpen(true)} />
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
                {!loading && compras.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <FaInfoCircle className="text-gray-400 dark:text-gray-500 text-5xl mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {search ? 'No se encontraron compras con ese criterio de búsqueda' : 'No hay compras registradas'}
                        </p>
                    </div>
                )}

                {/* Vista condicional: Grid o Lista */}
                {!loading && compras.length > 0 && (
                    <div className={vistaGrid ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "grid grid-cols-1 gap-4"}>
                        {compras.map((compra: any) => {
                            const totalProductos = compra.detalles?.length || 0;
                            const cantidadTotal = compra.detalles?.reduce((sum: number, d: any) => sum + parseFloat(d.cantidad || 0), 0) || 0;
                            const esCompraVacia = parseFloat(compra.total || 0) === 0;
                            const esInventarioInicial = compra.observacion?.toLowerCase() === 'inventario inicial';

                            return (
                                <div
                                    key={compra.idcompra}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500"
                                >
                                    {/* Header con gradiente */}
                                    <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 text-white">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="bg-white/20 p-2 rounded-lg">
                                                    <FaShoppingCart size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0 overflow-hidden">
                                                    <h3 className="font-bold text-base truncate block">{compra.nombre}</h3>
                                                    <p className="text-xs opacity-90 font-mono truncate block">{compra.nro_factura}</p>
                                                </div>
                                            </div>
                                            {esInventarioInicial && (
                                                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-yellow-100 text-yellow-700 border-2 border-yellow-300 flex-shrink-0">
                                                    Inv. Inicial
                                                </span>
                                            )}
                                        </div>
                                    </div>



                                    {/* Body */}
                                    <div className="p-3 sm:p-4 space-y-3">
                                        {/* Badges de tipo y estado */}
                                        <div className="flex gap-2">
                                            <span className="uppercase px-2.5 py-1 rounded-lg text-xs font-bold border-2 'bg-blue-100 text-blue-700 border-blue-300">
                                                {compra.tipo === 'contado' ? 'Contado' : 'Crédito'}
                                            </span>
                                            <span className="uppercase px-2.5 py-1 rounded-lg text-xs font-bold border-2 'bg-blue-100 text-blue-700 border-blue-300">
                                                {compra.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                                            </span>
                                        </div>

                                        {/* Info Grid con CardText */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <CardText
                                                title="Productos"
                                                text={`${totalProductos} item${totalProductos !== 1 ? 's' : ''}`}
                                                containerClass={styleCardSmall}
                                                titleClass={styleTxtCards}
                                                textClass={styleTxtLabelBold}
                                            />
                                            <CardText
                                                title="Cantidad"
                                                text={cantidadTotal.toFixed(2)}
                                                containerClass={styleCardSmall}
                                                titleClass={styleTxtCards}
                                                textClass={styleTxtLabelBold}
                                            />
                                            <CardText
                                                title="Cajero"
                                                text={compra.cajero_nombre || 'N/A'}
                                                containerClass={styleCardSmall}
                                                titleClass={styleTxtCards}
                                                textClass={styleTxtLabelBold}
                                            />
                                            <CardText
                                                title="Fecha"
                                                text={new Date(compra.fecha).toLocaleDateString('es-PY')}
                                                containerClass={styleCardSmall}
                                                titleClass={styleTxtCards}
                                                textClass={styleTxtLabelBold}
                                            />
                                            <CardText
                                                title="Total"
                                                text={`₲ ${parseInt(compra.total).toLocaleString("es-PY")}`}
                                                containerClass={`${styleCardSmall} ${esCompraVacia ? 'opacity-50' : ''}`}
                                                titleClass={styleTxtCards}
                                                textClass={styleTxtLabelBold}
                                            />
                                            {esCompraVacia && (
                                                <div className={styleCardSmall}>
                                                    <span className="text-xs text-gray-400">Sin movimiento</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Acciones */}
                                        <div className="pt-3 border-t border-blue-100">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCompra(compra);
                                                        setShowModal(true);
                                                    }}
                                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
                                                    title="Ver detalles"
                                                >
                                                    <FaEye />
                                                    Ver Detalle
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(compra.idcompra)}
                                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
                                                    title="Anular compra"
                                                >
                                                    <FaTrash />
                                                    Anular
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Paginación */}
                {!loading && compras.length > 0 && (
                    <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />
                )}
            </div>

            {/* Modales */}
            <ModalDetalleCompra
                isOpen={showModal}
                compra={selectedCompra}
                onClose={() => {
                    setShowModal(false);
                    setSelectedCompra(null);
                }}
            />
            <ModalCrearCompra
                isOpen={modalCrearCompraOpen}
                onClose={() => setModalCrearCompraOpen(false)}
                onSuccess={() => {
                    fetchCompras();
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

            {/* Modal de Reporte de Compras */}
            {mostrarReporte && datosReporte && datosReporte.datosReporte && datosReporte.datosReporte.reporte && (
                <ReporteCompras
                    reporte={datosReporte.datosReporte.reporte}
                    onClose={() => setMostrarReporte(false)}
                    onDownloadPDF={handleDownloadPDF}
                />
            )}

            <ModalSeleccionarFechas
                isOpen={modalLibroComprasOpen}
                onClose={() => setModalLibroComprasOpen(false)}
                onGenerar={handleDownloadLibroCompras}
                titulo="Libro de Compras"
                descripcion="Selecciona el período para generar el Libro de Compras"
            />
        </div>
    );
};

export default ListarCompras;
