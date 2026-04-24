'use client';

import { useEffect, useState, useCallback } from 'react';
import { FaFileInvoice, FaSearch, FaEdit, FaTimesCircle, FaListAlt, FaCheck, FaInfoCircle } from 'react-icons/fa';
import ModalsCrearFacturador from './ModalsFacturador/ModalCrearFacturador';
import ModalEditarFacturador from './ModalsFacturador/ModalEditarFacturador';
import { fetchAllFacturadores, culminarFacturador, getReportListFacturador, getReportFacturadoresPDF } from '../../services/facturador';
import ModalSuccess from '../../components/ModalSuccess';
import ModalError from '../../components/ModalError';
import ModalAdvert from '../../components/ModalAdvert';
import { ReportListFacturator } from './ReportListFacturator';
import type { ReporteFacturadoresResponse } from '../../types/reporte.types';
import ChatFacturadorModal from './ChatFacturadorModal';
import ButtonGrid from '../../components/ButtonGrid';
import SelectPage from '../../components/SelectPage';
import SelectPagination from '../../components/SelectPagination';
import CardText from '../../ventas/components/CobroDeudaVenta/components/CardText';
import ButtonGral from '../../components/ButtonGral';

interface ListarFacturadoresProps {
    onSelect?: (facturador: any) => void;
}

const ListarFacturadores = ({ onSelect }: ListarFacturadoresProps) => {
    const [facturadores, setFacturadores] = useState<any[]>([]);
    const [modalCrearFacturadorOpen, setModalCrearFacturadorOpen] = useState(false);
    const [modalEditarFacturadorOpen, setModalEditarFacturadorOpen] = useState(false);
    const [idFacturador, setIdFacturador] = useState<number | string>('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
    const [advertMessage, setAdvertMessage] = useState("");
    const [advertAction, setAdvertAction] = useState<(() => void) | null>(null);
    const [datosReporte, setDatosReporte] = useState<ReporteFacturadoresResponse | null>(null);
    const [mostrarReporte, setMostrarReporte] = useState(false);
    const [chatFacturadorVisible, setChatFacturadorVisible] = useState(false);
    const [vistaGrid, setVistaGrid] = useState(true); // true = grid, false = lista
    const [loading, setLoading] = useState(false);

    // Estilos para CardText (con dark mode)
    const styleCardSmall = "bg-blue-50 dark:bg-gray-700 rounded-lg p-3 border border-blue-200 dark:border-gray-600";
    const styleTxtCards = "text-xs text-blue-600 dark:text-blue-300 font-medium mb-1";
    const styleTxtLabelBold = "text-xs font-bold text-blue-700 dark:text-gray-100 truncate";

    const fetchFacturadores = async () => {
        setLoading(true);
        try {
            const res = await fetchAllFacturadores(page, limit, search);
            setFacturadores(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error al obtener facturadores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        setIdFacturador(id);
        setModalEditarFacturadorOpen(true);
    };

    const handleCloseChatModal = useCallback(() => {
        setChatFacturadorVisible(false);
    }, []);

    const handleFacturadorActuado = useCallback(() => {
        console.log('  Facturador actuado');
        fetchFacturadores();
    }, [page, limit, search]);

    useEffect(() => {
        fetchFacturadores();
    }, [page, limit, search]);

    const handleCulminar = (id: number) => {
        setAdvertMessage('¿Estás seguro de que deseas culminar este facturador?');
        setAdvertAction(() => async () => {
            try {
                await culminarFacturador(id);
                setSuccessMessage('  Facturador culminado correctamente');
                fetchFacturadores();
            } catch (error) {
                console.error('Error al culminar facturador:', error);
                setErrorMessage('  No se pudo culminar el facturador');
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
            const res = await getReportListFacturador(search, '');
            console.log("📊 Respuesta del servidor:", res.data);

            // Transformar la respuesta al formato esperado
            const facturadores = res.data.data || res.data;
            const estadisticas = res.data.estadisticas || {};

            // Calcular estadísticas
            const totalFacturadores = estadisticas.total_facturadores || facturadores.length;
            const facturadoresActivos = estadisticas.facturadores_activos || facturadores.filter((f: any) => f.culminado === 'Activo').length;
            const facturadoresCulminados = estadisticas.facturadores_culminados || facturadores.filter((f: any) => f.culminado === 'Culminado').length;

            // Crear estructura de datos esperada
            const reporteTransformado: ReporteFacturadoresResponse = {
                message: '  Reporte de facturadores generado correctamente',
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
                        titulo: 'Reporte de Facturadores',
                        total_facturadores: totalFacturadores,
                        facturadores_activos: facturadoresActivos,
                        facturadores_culminados: facturadoresCulminados,
                        total_ventas_general: estadisticas.total_ventas_general || 0,
                        monto_total_facturado: estadisticas.monto_total_facturado || '0',
                        ganancia_total: estadisticas.ganancia_total || '0',
                        facturas_utilizadas_total: estadisticas.facturas_utilizadas_total || 0,
                        facturas_disponibles_total: estadisticas.facturas_disponibles_total || 0,
                        ventas_pagadas_total: estadisticas.ventas_pagadas_total || 0,
                        ventas_pendientes_total: estadisticas.ventas_pendientes_total || 0,
                        monto_pagado_total: estadisticas.monto_pagado_total || '0',
                        monto_pendiente_total: estadisticas.monto_pendiente_total || '0',
                        facturadores: facturadores
                    }
                }
            };

            setDatosReporte(reporteTransformado);
            setMostrarReporte(true);
        } catch (error) {
            console.error("  Error al generar reporte de facturadores:", error);
            setErrorMessage("  Error al generar el reporte");
        }
    };

    const handleDownloadPDF = async (estadoFiltro: string) => {
        try {
            const res = await getReportFacturadoresPDF(search, estadoFiltro);
            const base64PDF = res.data.reportePDFBase64;
            const link = document.createElement("a");
            link.href = `data:application/pdf;base64,${base64PDF}`;
            link.download = `Reporte-Facturadores-${new Date().toLocaleDateString()}.pdf`;
            link.click();
        } catch (error) {
            console.error("  Error al generar PDF de facturadores:", error);
            setErrorMessage("  Error al generar el PDF");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8" style={{ scrollbarGutter: 'stable' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header con gradiente */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 mb-6 text-white">
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                        <div className="bg-white/20 backdrop-blur-sm p-3 sm:p-4 rounded-2xl">
                            <FaFileInvoice className="text-white text-3xl sm:text-4xl" />
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
                                Datos de Facturación Legal
                            </h1>
                            <p className="text-sm sm:text-base text-blue-100">Gestiona tus facturadores y timbrados</p>
                        </div>
                    </div>
                </div>

                {/* Search and Actions Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Search Input */}
                        <div className="relative w-full lg:w-96">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, titular o RUC..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border-2 border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <ButtonGral text='Chat IA' onClick={() => setChatFacturadorVisible(true)} />
                            <ButtonGral text='Reporte PDF' onClick={handleGenerateReporteList} />
                            <ButtonGral text='Nuevo Facturador' onClick={() => setModalCrearFacturadorOpen(true)} />
                        </div>
                    </div>

                    {/* Results per page selector y toggle vista */}
                    <div className="flex items-center justify-between gap-2 mt-4">
                        <SelectPage limit={limit} setLimit={setLimit} setPage={setPage} />
                        <ButtonGrid onClick={(isGrid) => setVistaGrid(isGrid)} vistaGrid={vistaGrid} />
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && facturadores.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <FaInfoCircle className="text-gray-400 dark:text-gray-500 text-5xl mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {search
                                ? 'No se encontraron facturadores con ese criterio de búsqueda'
                                : 'No hay facturadores registrados'}
                        </p>
                    </div>
                )}

                {/* Vista condicional: Grid o Lista */}
                {!loading && facturadores.length > 0 && (
                <div className={vistaGrid ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "grid grid-cols-1 gap-4"}>
                    {facturadores.map((fact: any) => (
                        <div
                            key={fact.idfacturador}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500"
                        >
                            {/* Header con gradiente */}
                            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 text-white">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="bg-white/20 p-2 rounded-lg">
                                            <FaFileInvoice size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-base truncate">{fact.nombre_fantasia}</h3>
                                            <p className="text-xs opacity-90 truncate">{fact.titular}</p>
                                        </div>
                                    </div>
                                    {fact.culminado === 0 ? (
                                        <span className="px-2 py-1 rounded-lg text-xs font-bold bg-green-500 border-2 border-green-400">
                                            ACTIVO
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 rounded-lg text-xs font-bold bg-red-500 border-2 border-red-400">
                                            CULMINADO
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-4 space-y-3">
                                {/* Datos con CardText */}
                                <div className="grid grid-cols-1 gap-2">
                                    <CardText
                                        title="RUC"
                                        text={fact.ruc || 'N/A'}
                                        containerClass={styleCardSmall}
                                        titleClass={styleTxtCards}
                                        textClass={styleTxtLabelBold}
                                    />
                                </div>

                                {/* Actividades Económicas */}
                                <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-3 border border-blue-200 dark:border-gray-600">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaListAlt className="text-blue-600 dark:text-blue-400" size={14} />
                                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Actividades Económicas</p>
                                    </div>
                                    {fact.actividades_economicas && fact.actividades_economicas.length > 0 ? (
                                        <div className="space-y-1">
                                            {fact.actividades_economicas.map((actividad: any, actIdx: number) => (
                                                <div key={actIdx} className="flex items-start gap-1.5">
                                                    <span className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">•</span>
                                                    <p className="text-xs text-blue-900 dark:text-gray-100 leading-relaxed">
                                                        {actividad.descripcion}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">Sin actividades</p>
                                    )}
                                </div>

                                {/* Acciones */}
                                <div className="pt-3 border-t border-blue-100 dark:border-gray-600">
                                    {onSelect ? (
                                        <button
                                            onClick={() => onSelect(fact)}
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-sm"
                                        >
                                            <FaCheck />
                                            Seleccionar
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(fact.idfacturador)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                                            >
                                                <FaEdit />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleCulminar(fact.idfacturador)}
                                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                                            >
                                                <FaTimesCircle />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                )}

                {/* Pagination */}
                {!loading && facturadores.length > 0 && (
                    <div className="mt-6">
                        <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />
                    </div>
                )}
            </div>

            {/* Modales */}
            <ModalsCrearFacturador
                isOpen={modalCrearFacturadorOpen}
                onClose={() => setModalCrearFacturadorOpen(false)}
                onSuccess={fetchFacturadores}
            />
            <ModalEditarFacturador
                isOpen={modalEditarFacturadorOpen}
                onClose={() => setModalEditarFacturadorOpen(false)}
                id={idFacturador}
                onSuccess={fetchFacturadores}
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

            {/* Modal de Chat IA para Facturadores */}
            <ChatFacturadorModal
                visible={chatFacturadorVisible}
                onClose={handleCloseChatModal}
                onFacturadorActuado={handleFacturadorActuado}
            />

            {/* Modal de Reporte de Facturadores */}
            {mostrarReporte && datosReporte && datosReporte.datosReporte && datosReporte.datosReporte.reporte && (
                <ReportListFacturator
                    reporte={datosReporte.datosReporte.reporte}
                    onClose={() => setMostrarReporte(false)}
                    onDownloadPDF={handleDownloadPDF}
                />
            )}
        </div>
    );
};

export default ListarFacturadores;
