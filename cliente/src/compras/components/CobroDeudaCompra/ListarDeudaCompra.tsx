'use client';

import { useEffect, useState } from 'react';
import { FaEye, FaMoneyBillWave, FaInfoCircle, FaShoppingBag } from 'react-icons/fa';
import { CurrencyDollarIcon as CurrencyDollarSolid } from '@heroicons/react/24/solid';
import { type ComprobantePago } from '../../../ventas/components/interface';
import ModalCobroDeuda from '../Modals/ModalCobroDeudaCompra';
import ModalComprobantePago from '../../../ventas/components/ModalsVenta/ModalComprobantePago';
import ModalListarDetallesPagosDeuda from '../Modals/ModalListarDetallesPagosDeuda';
import { fetchDeudasCompra } from '../../../services/compras';
import ButtonGrid from '../../../components/ButtonGrid';
import SelectPage from '../../../components/SelectPage';
import SelectPagination from '../../../components/SelectPagination';
import CardText from '../../../ventas/components/CobroDeudaVenta/components/CardText';
import SearchActionsBar from '../../../components/SearchActionsBar';
import ButtonGral from '../../../components/ButtonGral';
import { renderTitle } from '../../../clientes/utils/utils';

const ListarDeudasCompra = () => {
    const [comprobante, setComprobante] = useState<ComprobantePago>();
    const [showComprobante, setShowComprobante] = useState(false);
    const [deudas, setDeudas] = useState<any[]>([]);
    const [montoMaximo, setMontoMaximo] = useState(0);
    const [idDeudaDetalle, setIdDeudaDetalle] = useState(0);
    const [showModalDetailPay, setShowModalDetailPay] = useState(false);
    const [showModalCobroDeuda, setShowModalCobroDeuda] = useState(false);
    const [iddeudaSeleccionada, setIddeudaSeleccionada] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [vistaGrid, setVistaGrid] = useState(true);
    const [loading, setLoading] = useState(false);


    const fetchDeudas = async () => {
        try {
            setLoading(true);
            const res = await fetchDeudasCompra(page, limit, search);
            setDeudas(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error al obtener deudas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeudas();
    }, [page, limit, search]);

    const handleCobrar = (deuda: any) => {
        setIddeudaSeleccionada(deuda.iddeuda_compra);
        setMontoMaximo(deuda.total_deuda - deuda.total_pagado);
        setShowModalCobroDeuda(true);
    };

    const showPayDetails = (idDeudaDetalle: number) => {
        setIdDeudaDetalle(idDeudaDetalle);
        setShowModalDetailPay(true);
    };

    const formatCurrency = (amount: number) => {
        return `₲ ${parseInt(amount.toString()).toLocaleString('es-PY')}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PY');
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8" style={{ scrollbarGutter: 'stable' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header con gradiente azul */}
                {renderTitle ({title:"Deudas por Compra", subtitle:"Administra las deudas con proveedores", icon: <FaShoppingBag className="text-white text-3xl sm:text-4xl" />})}
                {/* Search and Actions Bar */}
                <SearchActionsBar
                    searchValue={search}
                    onSearchChange={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    searchPlaceholder="Buscar por proveedor o estado..."
                >
                    <ButtonGral text='Ver Reporte' onClick={() => setShowModalDetailPay(true)} />
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
                {!loading && deudas.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <FaInfoCircle className="text-gray-400 text-5xl mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {search ? 'No se encontraron deudas con ese criterio de búsqueda' : 'No hay deudas registradas'}
                        </p>
                    </div>
                )}

                {/* Vista condicional: Grid o Lista */}
                {!loading && deudas.length > 0 && (
                    <div className={vistaGrid ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "grid grid-cols-1 gap-4"}>
                        {deudas.map((deuda) => (
                            <div
                                key={deuda.iddeuda_compra}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-blue-100 hover:border-blue-300 dark:border-gray-700"
                            >
                                {/* Header con gradiente */}
                                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white dark:from-gray-700 dark:to-gray-800">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                                            <div className="bg-white/20 p-2 rounded-lg flex-shrink-0 dark:bg-gray-600/30">
                                                <CurrencyDollarSolid className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <h3 className="font-bold text-base truncate block">{deuda.nombre}</h3>
                                                <p className="text-xs opacity-90 truncate">#{deuda.iddeuda_compra}</p>
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold border-2 bg-blue-100 text-blue-700 border-blue-300 dark:border-blue-400">
                                            {deuda.estado.toUpperCase()}
                                        </span>
                                    </div>
                                </div>



                                {/* Body con CardText */}
                                <div className="p-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <CardText
                                            title="Total Deuda"
                                            text={formatCurrency(deuda.total_deuda)}
                                        />
                                        <CardText
                                            title="Total Pagado"
                                            text={formatCurrency(deuda.total_pagado)}
                                        />
                                        <CardText
                                            title="Saldo"
                                            text={formatCurrency(deuda.saldo)}
                                        />
                                        <CardText
                                            title="Fecha"
                                            text={formatDate(deuda.fecha_deuda)}
                                        />
                                    </div>

                                    {/* Acciones */}
                                    <div className="pt-3 border-t border-blue-100">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleCobrar(deuda)}
                                                className="dark:bg-gray-600 dark:hover:bg-gray-700 flex-1 bg-blue-600 text-white py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
                                                title="Pagar deuda"
                                            >
                                                <FaMoneyBillWave />
                                                Pagar
                                            </button>
                                            <button
                                                onClick={() => showPayDetails(deuda.iddeuda_compra)}
                                                className="dark:bg-gray-600 dark:hover:bg-gray-700 flex-1 bg-blue-600 flex-1 text-white py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg"
                                                title="Ver pagos"
                                            >
                                                <FaEye />
                                                Ver Pagos
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginación */}
                {!loading && deudas.length > 0 && (
                    <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />
                )}
            </div>

            {/* Modales */}
            {showModalCobroDeuda && iddeudaSeleccionada && (
                <ModalCobroDeuda
                    montoMaximo={montoMaximo}
                    isOpen={showModalCobroDeuda}
                    setComprobante={setComprobante}
                    setShowComprobante={setShowComprobante}
                    onClose={() => setShowModalCobroDeuda(false)}
                    idDeuda={iddeudaSeleccionada}
                    onSuccess={() => {
                        fetchDeudas();
                        setShowModalCobroDeuda(false);
                    }}
                />
            )}
            {showComprobante && comprobante && (
                <ModalComprobantePago
                    onClose={() => setShowComprobante(false)}
                    comprobante={comprobante}
                    isProviderPay={true}
                />
            )}
            <ModalListarDetallesPagosDeuda
                iddeuda={idDeudaDetalle}
                isOpen={showModalDetailPay}
                onClose={() => setShowModalDetailPay(false)}
                onSuccess={() => {
                    fetchDeudas();
                }}
            />
        </div>
    );
};

export default ListarDeudasCompra;