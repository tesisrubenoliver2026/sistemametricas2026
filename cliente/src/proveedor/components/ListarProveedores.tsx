'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    FaTruck,
    FaSearch,
    FaEdit,
    FaTrash,
    FaCheck
} from 'react-icons/fa';
import ModalCrearProveedor from './ModalsProveedor/ModalCrearProveedor';
import ModalEditarProveedor from './ModalsProveedor/ModalEditarProveedor';
import { deleteProveedor, getProveedoresPaginated, getReportListProvider, getReportProveedoresPDF } from '../../services/proveedor';
import ModalError from '../../components/ModalError';
import ModalSuccess from '../../components/ModalSuccess';
import ModalAdvert from '../../components/ModalAdvert';
import { ReporteProveedor } from './ReporteProveedor';
import type { ReporteProveedoresResponse } from '../../types/reporte.types';
import ChatProveedorModal from './ChatProveedorModal';
import ButtonGrid from '../../components/ButtonGrid';
import SelectPage from '../../components/SelectPage';
import SelectPagination from '../../components/SelectPagination';
import CardText from '../../ventas/components/CobroDeudaVenta/components/CardText';
import ButtonGral from '../../components/ButtonGral';

interface ListarProveedoresProps {
    onSelect?: (proveedor: any) => void;
}

const ListarProveedores = ({ onSelect }: ListarProveedoresProps) => {
    const [modalEditarProveedorOpen, setModalEditarProveedorOpen] = useState(false);
    const [idProvider, setIdProvider] = useState<number | string>("");
    const [modalCrearProveedorOpen, setModalCrearProveedorOpen] = useState(false);
    const [proveedores, setProveedores] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
    const [advertMessage, setAdvertMessage] = useState("");
    const [advertAction, setAdvertAction] = useState<(() => void) | null>(null);
    const [datosReporte, setDatosReporte] = useState<ReporteProveedoresResponse | null>(null);
    const [mostrarReporte, setMostrarReporte] = useState(false);
    const [chatProveedorVisible, setChatProveedorVisible] = useState(false);
    const [vistaGrid, setVistaGrid] = useState(true); // true = grid, false = lista

    // Estilos para CardText
    const styleCardSmall = "bg-blue-50 dark:bg-gray-700 rounded-lg p-3 border border-blue-200 dark:border-gray-600";
    const styleTxtCards = "text-xs text-blue-600 dark:text-blue-400 font-medium mb-1";
    const styleTxtLabelBold = "text-xs font-bold text-blue-700 dark:text-blue-400 truncate";

    const fetchProveedores = async () => {
        try {
            const res = await getProveedoresPaginated({ page, limit, search });
            setProveedores(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error al obtener proveedores:', error);
        }
    };

    const handleDelete = (id: number) => {
        setAdvertMessage('¿Estás seguro de que deseas eliminar este proveedor?');
        setAdvertAction(() => async () => {
            try {
                await deleteProveedor(id);
                setSuccessMessage('   Proveedor eliminado exitosamente');
                fetchProveedores();
            } catch (error) {
                console.error('Error al eliminar proveedor:', error);
                setErrorMessage('  No se pudo eliminar el proveedor');
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
        fetchProveedores();
    }, [page, limit, search]);

    const handleEdit = (id: number) => {
        setIdProvider(id);
        setModalEditarProveedorOpen(true);
    };

    const handleCloseChatModal = useCallback(() => {
        setChatProveedorVisible(false);
    }, []);

    const handleProveedorActuado = useCallback(() => {
        console.log('   Proveedor actuado');
        fetchProveedores();
    }, [page, limit, search]);

    const handleGenerateReporteList = async () => {
        try {
            const res = await getReportListProvider(search);
            console.log("📊 Respuesta del servidor:", res.data);

            const proveedores = res.data.data || res.data;
            const estadisticas = res.data.estadisticas || {};

            const totalProveedores = estadisticas.total_proveedores || proveedores.length;
            const proveedoresActivos = estadisticas.proveedores_activos || proveedores.filter((p: any) => p.estado === 'activo').length;
            const proveedoresInactivos = estadisticas.proveedores_inactivos || proveedores.filter((p: any) => p.estado === 'inactivo').length;

            const reporteTransformado: ReporteProveedoresResponse = {
                message: '   Reporte de proveedores generado correctamente',
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
                        titulo: 'Reporte de Proveedores',
                        total_proveedores: totalProveedores,
                        proveedores_activos: proveedoresActivos,
                        proveedores_inactivos: proveedoresInactivos,
                        total_compras_general: estadisticas.total_compras_general || 0,
                        monto_total_comprado: estadisticas.monto_total_comprado || '0',
                        proveedores: proveedores
                    }
                }
            };

            setDatosReporte(reporteTransformado);
            setMostrarReporte(true);
        } catch (error) {
            console.error("  Error al generar reporte de proveedores:", error);
            setErrorMessage("  Error al generar el reporte");
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const res = await getReportProveedoresPDF(search);
            const base64PDF = res.data.reportePDFBase64;
            const link = document.createElement("a");
            link.href = `data:application/pdf;base64,${base64PDF}`;
            link.download = `Reporte-Proveedores-${new Date().toLocaleDateString()}.pdf`;
            link.click();
        } catch (error) {
            console.error("  Error al generar PDF de proveedores:", error);
            setErrorMessage("  Error al generar el PDF");
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4" style={{ scrollbarGutter: 'stable' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header con gradiente */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 text-white">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 md:gap-5">
                        <div className="bg-white/20 backdrop-blur-sm p-3 sm:p-4 md:p-5 rounded-2xl flex items-center justify-center shrink-0">
                            <FaTruck className="text-white text-2xl sm:text-3xl md:text-4xl" />
                        </div>

                        <div className="text-center sm:text-left">
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-1">
                                Gestión de Proveedores
                            </h1>
                            <p className="text-xs sm:text-sm md:text-base text-blue-100">
                                Administra tu red de proveedores
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controles superiores */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-5 md:mb-6">
                    <div className="flex flex-col gap-3 sm:gap-4">

                        {/* Buscador */}
                        <div className="relative w-full">
                            <FaSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, teléfono, RUC o razón social..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-sm sm:text-base dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                            />
                        </div>

                        {/* Filtro y botones */}
                        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between">

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <SelectPage limit={limit} setLimit={setLimit} setPage={setPage} />
                                <ButtonGrid onClick={(isGrid) => setVistaGrid(isGrid)} vistaGrid={vistaGrid} />
                            </div>

                            {/* Botones de acción */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <ButtonGral text='Nuevo Proveedor' onClick={() => setModalCrearProveedorOpen(true)} />
                                <ButtonGral text='Chat IA' onClick={() => setChatProveedorVisible(true)} />
                                <ButtonGral text='Reporte PDF' onClick={handleGenerateReporteList} />

                            </div>
                        </div>
                    </div>
                </div>


                {/* Vista condicional: Grid o Lista */}
                <div className={vistaGrid ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "grid grid-cols-1 gap-4"}>
                    {proveedores.map((proveedor) => (
                        <div
                            key={proveedor.idproveedor}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600"
                        >
                            {/* Header con gradiente */}
                            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 text-white">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="bg-white/20 p-2 rounded-lg">
                                            <FaTruck size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-base truncate">{proveedor.nombre}</h3>
                                            {proveedor.razon && <p className="text-xs opacity-90 truncate">{proveedor.razon}</p>}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-4 space-y-3">
                                {/* Datos con CardText */}
                                <div className="grid grid-cols-2 gap-2">
                                    <CardText
                                        title="RUC"
                                        text={proveedor.ruc || 'N/A'}
                                        containerClass={styleCardSmall}
                                        titleClass={styleTxtCards}
                                        textClass={styleTxtLabelBold}
                                    />
                                    <CardText
                                        title="Teléfono"
                                        text={proveedor.telefono || 'N/A'}
                                        containerClass={styleCardSmall}
                                        titleClass={styleTxtCards}
                                        textClass={styleTxtLabelBold}
                                    />
                                    {proveedor.correo && (
                                        <CardText
                                            title="Email"
                                            text={proveedor.correo}
                                            containerClass={styleCardSmall}
                                            titleClass={styleTxtCards}
                                            textClass={styleTxtLabelBold}
                                        />
                                    )}
                                    {proveedor.direccion && (
                                        <CardText
                                            title="Dirección"
                                            text={proveedor.direccion}
                                            containerClass={styleCardSmall}
                                            titleClass={styleTxtCards}
                                            textClass={styleTxtLabelBold}
                                        />
                                    )}
                                </div>

                                {/* Acciones */}
                                <div className="pt-3 border-t border-blue-100 dark:border-gray-700">
                                    {onSelect ? (
                                        <button
                                            onClick={() => onSelect(proveedor)}
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-sm"
                                        >
                                            <FaCheck />
                                            Seleccionar
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(proveedor.idproveedor)}
                                                className="w-auto p-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                                                title="Editar"
                                            >
                                                <FaEdit />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(proveedor.idproveedor)}
                                                className="w-auto p-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                                                title="Eliminar"
                                            >
                                                <FaTrash />
                                                Borrar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />
            </div>

            {/* Modales */}
            <ModalCrearProveedor
                isOpen={modalCrearProveedorOpen}
                onClose={() => setModalCrearProveedorOpen(false)}
                onSuccess={fetchProveedores}
            />
            <ModalEditarProveedor
                isOpen={modalEditarProveedorOpen}
                onClose={() => setModalEditarProveedorOpen(false)}
                id={idProvider}
                onSuccess={fetchProveedores}
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

            {/* Modal de Reporte de Proveedores */}
            {mostrarReporte && datosReporte && datosReporte.datosReporte && datosReporte.datosReporte.reporte && (
                <ReporteProveedor
                    reporte={datosReporte.datosReporte.reporte}
                    onClose={() => setMostrarReporte(false)}
                    onDownloadPDF={handleDownloadPDF}
                />
            )}

            {/* Modal de Chat IA para Proveedores */}
            <ChatProveedorModal
                visible={chatProveedorVisible}
                onClose={handleCloseChatModal}
                onProveedorActuado={handleProveedorActuado}
            />
        </div>
    );
};

export default ListarProveedores;
