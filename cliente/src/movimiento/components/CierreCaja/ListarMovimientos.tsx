'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaInfoCircle, FaFileAlt, FaBook, FaCalculator } from 'react-icons/fa';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BanknotesIcon as BanknotesSolid } from '@heroicons/react/24/solid';
import ModalResumenCaja from '../ModalMovimiento/CierreCaja/ModalResumenCaja';
import ModalCrearAperturaCaja from '../ModalMovimiento/AperturaCaja/ModalAperturaCaja';
import { getMovimientosCajaPaginated, getCajaAbierta, generateLibroCajaPDF } from '../../../services/movimiento';
import { generateLibroDiarioPDF, generateLibroMayorPDF } from '../../../services/contabilidad';
import { formatPY } from '../../utils/utils';
import ModalButtonFetch from './ButtonFetchReport';
import ModalError from '../../../components/ModalError';
import ModalSeleccionarFechas from '../../../components/ModalSeleccionarFechas';
import ButtonGrid from '../../../components/ButtonGrid';
import SelectPage from '../../../components/SelectPage';
import SelectPagination from '../../../components/SelectPagination';
import CardText from '../../../ventas/components/CobroDeudaVenta/components/CardText';
import SearchActionsBar from '../../../components/SearchActionsBar';
import ButtonGral from '../../../components/ButtonGral';
import { renderTitle } from '../../../clientes/utils/utils';

interface MovimientoCaja {
    idmovimiento: number;
    idusuarios: number;
    num_caja: string;
    fecha_apertura: string;
    fecha_cierre: string | null;
    monto_apertura: number;
    monto_cierre: number | null;
    credito: number | null;
    gastos: number | null;
    cobrado: number | null;
    contado: number | null;
    ingresos: number | null;
    compras: number | null;
    estado: string;
    login: string;
}

const ListarMovimientoCaja = () => {
    const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isOpenApertura, setIsOpenApertura] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIdMovimiento, setSelectedIdMovimiento] = useState<number>(0);
    const [limit, setLimit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [aperturaDesde, setAperturaDesde] = useState<string>('');
    const [aperturaHasta, setAperturaHasta] = useState<string>('');
    const [cierreDesde, setCierreDesde] = useState<string>('');
    const [cierreHasta, setCierreHasta] = useState<string>('');
    const [idMovimiento, setIdMovimiento] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [vistaGrid, setVistaGrid] = useState(true);
    const [loading, setLoading] = useState(false);

    // Estados para modales de selección de fechas
    const [modalLibroCajaOpen, setModalLibroCajaOpen] = useState(false);
    const [modalLibroDiarioOpen, setModalLibroDiarioOpen] = useState(false);
    const [modalLibroMayorOpen, setModalLibroMayorOpen] = useState(false);


    const fetchMovimientos = async () => {
        try {
            setLoading(true);
            const res = await getMovimientosCajaPaginated({
                page,
                limit,
                search,
                aperturaDesde,
                aperturaHasta,
                cierreDesde,
                cierreHasta,
            });
            setMovimientos(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error('Error al obtener movimientos:', err);
            setErrorMessage('Error al obtener movimientos de caja.');
            setErrorModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovimientos();
    }, [page, limit, search, aperturaDesde, aperturaHasta, cierreDesde, cierreHasta]);

    const handleOpenModal = (idmovimiento: number) => {
        setSelectedIdMovimiento(idmovimiento);
        setIsOpen(true);
    };

    const handleOpenApertura = async () => {
        try {
            const res = await getCajaAbierta();
            if (res.data.abierta === false) {
                setIsOpenApertura(true);
            } else {
                // Mostrar mensaje de error indicando que ya hay una caja abierta
                const numCaja = res.data.num_caja || '';
                setErrorMessage(`Ya existe una caja abierta${numCaja ? ` (Caja #${numCaja})` : ''}. Por favor, cierre la caja actual antes de abrir una nueva.`);
                setErrorModalOpen(true);
            }
        } catch (error) {
            console.error('Error al verificar caja abierta:', error);
            setErrorMessage('Error al verificar el estado de la caja.');
            setErrorModalOpen(true);
        }
    };

    // Generar Libro de Caja con fechas seleccionadas
    const handleGenerarLibroCaja = async (fechaInicio: string, fechaFin: string) => {
        try {
            const res = await generateLibroCajaPDF({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
            const base64PDF = res.data.reportePDFBase64;
            const link = document.createElement("a");
            link.href = `data:application/pdf;base64,${base64PDF}`;
            link.download = `Libro-Caja-SET-${fechaInicio}_${fechaFin}.pdf`;
            link.click();
        } catch (error) {
            console.error("  Error al generar Libro de Caja:", error);
            setErrorMessage("  Error al generar el Libro de Caja");
            setErrorModalOpen(true);
        }
    };

    // Generar Libro Diario con fechas seleccionadas
    const handleGenerarLibroDiario = async (fechaInicio: string, fechaFin: string) => {
        try {
            const res = await generateLibroDiarioPDF({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
            const base64PDF = res.data.reportePDFBase64;
            const link = document.createElement("a");
            link.href = `data:application/pdf;base64,${base64PDF}`;
            link.download = `Libro-Diario-${fechaInicio}_${fechaFin}.pdf`;
            link.click();
        } catch (error) {
            console.error("  Error al generar Libro Diario:", error);
            setErrorMessage("  Error al generar el Libro Diario");
            setErrorModalOpen(true);
        }
    };

    // Generar Libro Mayor con fechas seleccionadas
    const handleGenerarLibroMayor = async (fechaInicio: string, fechaFin: string) => {
        try {
            const res = await generateLibroMayorPDF({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
            const base64PDF = res.data.reportePDFBase64;
            const link = document.createElement("a");
            link.href = `data:application/pdf;base64,${base64PDF}`;
            link.download = `Libro-Mayor-${fechaInicio}_${fechaFin}.pdf`;
            link.click();
        } catch (error) {
            console.error("  Error al generar Libro Mayor:", error);
            setErrorMessage("  Error al generar el Libro Mayor");
            setErrorModalOpen(true);
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-PY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8" style={{ scrollbarGutter: 'stable' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header simplificado */}
                {renderTitle({ title: "Movimientos de Caja", subtitle: "Administra los movimientos de caja", icon: <FaCalculator className="text-white text-3xl sm:text-4xl" /> })}
                {/* Search and Actions Bar */}
                <SearchActionsBar
                    searchValue={search}
                    onSearchChange={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    searchPlaceholder="Buscar por número de caja, estado, usuario..."
                    extraContent={
                        <>
                            {/* Filtros de fecha */}
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex flex-wrap gap-4 flex-1">
                                    {[
                                        { label: 'Apertura desde', value: aperturaDesde, setter: setAperturaDesde, icon: CalendarIcon },
                                        { label: 'Apertura hasta', value: aperturaHasta, setter: setAperturaHasta, icon: CalendarIcon },
                                        { label: 'Cierre desde', value: cierreDesde, setter: setCierreDesde, icon: CalendarIcon },
                                        { label: 'Cierre hasta', value: cierreHasta, setter: setCierreHasta, icon: CalendarIcon },
                                    ].map(({ label, value, setter, icon: Icon }) => (
                                        <div key={label} className="flex-1 min-w-[150px]">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                                            <div className="relative">
                                                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={value}
                                                    onChange={(e) => {
                                                        setter(e.target.value);
                                                        setPage(1);
                                                    }}
                                                    className="w-full pl-10 pr-8 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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

                                <div className="flex items-center gap-4">
                                    <SelectPage limit={limit} setLimit={setLimit} setPage={setPage} />
                                    <ButtonGrid onClick={(isGrid) => setVistaGrid(isGrid)} vistaGrid={vistaGrid} />
                                </div>
                            </div>

                            {/* Botones de reportes */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                <ButtonGral text='Libro de Caja SET' icon={<FaBook />} onClick={() => setModalLibroCajaOpen(true)} />
                                <ButtonGral text='Libro Diario' icon={<FaFileAlt />} onClick={() => setModalLibroDiarioOpen(true)} />
                                <ButtonGral text='Libro Mayor' icon={<FaCalculator />} onClick={() => setModalLibroMayorOpen(true)} />
                            </div>
                        </>
                    }
                >
                    <ButtonGral text='Abrir Caja' icon={<FaPlus />} onClick={handleOpenApertura} />
                </SearchActionsBar>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && movimientos.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <FaInfoCircle className="text-gray-400 dark:text-gray-500 text-5xl mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {search || aperturaDesde || cierreDesde
                                ? 'No se encontraron movimientos con ese criterio de búsqueda'
                                : 'No hay movimientos de caja registrados'}
                        </p>
                        <button
                            onClick={handleOpenApertura}
                            className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-700 dark:to-gray-800 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all font-semibold"
                        >
                            <FaPlus />
                            Abrir Nueva Caja
                        </button>
                    </div>
                )}

                {/* Vista condicional: Grid o Lista */}
                {!loading && movimientos.length > 0 && (
                    <div className={vistaGrid ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "grid grid-cols-1 gap-4"}>
                        {movimientos.map((mov) => (
                            <div
                                key={mov.idmovimiento}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-blue-100 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500"
                            >
                                {/* Header con gradiente */}
                                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 text-white">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                                            <div className="bg-white/20 dark:bg-gray-600/30 p-2 rounded-lg flex-shrink-0">
                                                <BanknotesSolid className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <h3 className="font-bold text-base truncate block">Caja #{mov.num_caja}</h3>
                                                <p className="text-xs opacity-90 dark:text-gray-300 truncate">{mov.login}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold border-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600">
                                                {mov.estado.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Body con CardText */}
                                <div className="p-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <CardText
                                            title="Apertura"
                                            text={formatDateTime(mov.fecha_apertura)}
                                        />
                                        <CardText
                                            title="Cierre"
                                            text={mov.fecha_cierre ? formatDateTime(mov.fecha_cierre) : '--'}
                                        />
                                        <CardText
                                            title="Monto Apertura"
                                            text={formatPY(mov.monto_apertura)}
                                        />
                                        <CardText
                                            title="Monto Cierre"
                                            text={mov.monto_cierre ? formatPY(mov.monto_cierre) : '--'}
                                        />
                                        <CardText
                                            title="Cobrado"
                                            text={formatPY(mov.cobrado)}
                                        />
                                        <CardText
                                            title="Contado"
                                            text={formatPY(mov.contado)}
                                        />
                                        <CardText
                                            title="Gastos"
                                            text={formatPY(mov.gastos)}
                                        />
                                        <CardText
                                            title="Compras"
                                            text={formatPY(mov.compras)}
                                        />
                                        <CardText
                                            title="Crédito"
                                            text={formatPY(mov.credito)}
                                        />
                                        <CardText
                                            title="Ingresos"
                                            text={formatPY(mov.ingresos)}
                                        />
                                    </div>

                                    {/* Acciones */}
                                    <div className="pt-3 border-t border-blue-100 dark:border-gray-700">
                                        <div className="flex gap-2">
                                            {/* Botón Resumen */}
                                            <button
                                                onClick={() => handleOpenModal(mov.idmovimiento)}
                                                className="
                                                    flex-1 flex items-center justify-center gap-2 text-sm font-semibold
                                                    py-2 rounded-lg shadow-md hover:shadow-lg transition-all
                                                    bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                                                    text-white
                                                    dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500
                                                "
                                            >
                                                <FaCalculator />
                                                Resumen
                                            </button>

                                            {/* Botón Reportes */}
                                            <button
                                                onClick={() => setIdMovimiento(mov.idmovimiento)}
                                                className="
                                                    flex-1 flex items-center justify-center gap-2 text-sm font-semibold
                                                    py-2 rounded-lg shadow-md hover:shadow-lg transition-all
                                                    bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                                                    text-white
                                                    dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500
                                                "
                                            >
                                                <FaFileAlt />
                                                Reportes
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginación */}
                {!loading && movimientos.length > 0 && (
                    <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />
                )}
            </div>

            {/* Modales */}
            <ModalButtonFetch
                isOpen={idMovimiento !== 0}
                onClose={() => setIdMovimiento(0)}
                idMovimiento={idMovimiento}
            />
            <ModalError
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                message={errorMessage}
            />
            <ModalResumenCaja
                isOpen={isOpen}
                idmovimiento={selectedIdMovimiento}
                onClose={() => setIsOpen(false)}
                onSuccess={fetchMovimientos}
            />
            <ModalCrearAperturaCaja
                isOpen={isOpenApertura}
                onClose={() => setIsOpenApertura(false)}
                onSuccess={fetchMovimientos}
            />

            {/* Modales de selección de fechas para reportes */}
            <ModalSeleccionarFechas
                isOpen={modalLibroCajaOpen}
                onClose={() => setModalLibroCajaOpen(false)}
                onGenerar={handleGenerarLibroCaja}
                titulo="Libro de Caja SET"
                descripcion="Selecciona el rango de fechas para generar el Libro de Caja"
            />

            <ModalSeleccionarFechas
                isOpen={modalLibroDiarioOpen}
                onClose={() => setModalLibroDiarioOpen(false)}
                onGenerar={handleGenerarLibroDiario}
                titulo="Libro Diario"
                descripcion="Selecciona el rango de fechas para generar el Libro Diario"
            />

            <ModalSeleccionarFechas
                isOpen={modalLibroMayorOpen}
                onClose={() => setModalLibroMayorOpen(false)}
                onGenerar={handleGenerarLibroMayor}
                titulo="Libro Mayor"
                descripcion="Selecciona el rango de fechas para generar el Libro Mayor"
            />
        </div>
    );
};

export default ListarMovimientoCaja;