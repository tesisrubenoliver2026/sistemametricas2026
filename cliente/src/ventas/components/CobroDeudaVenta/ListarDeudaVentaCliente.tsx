'use client';

import { useEffect, useState } from 'react';
import { FaMoneyBill, FaInfoCircle } from 'react-icons/fa';
import { CurrencyDollarIcon as CurrencyDollarSolid } from '@heroicons/react/24/solid';
import ModalComprobantePago from '../ModalsVenta/ModalComprobantePago';
import ModalListarDetallesPagosDeuda from '../ModalsVenta/ModalListarDetallesPagosDeuda';
import ModalListarClienteDVenta from '../ModalsVenta/ModalListarClienteDVentas';
import ModalDetallesCreditosCliente from '../ModalsVenta/ModalDetallesCreditosCliente';
import InfoDeudaCliente from './InfoDeudaCliente';
import { listarDeudasVentaCompletoPorCliente, listarDeudasClienteConCuotasDetalle } from '../../../services/ventas';
import ButtonGrid from '../../../components/ButtonGrid';
import SelectPage from '../../../components/SelectPage';
import SelectPagination from '../../../components/SelectPagination';
import ModalCuotasVencidas from './components/ModalCuotasVencidas';
import ButtonGral from '../../../components/ButtonGral';
import SearchActionsBar from '../../../components/SearchActionsBar';

const ListarDeudasVentaCliente = () => {
  const [vistaGrid, setVistaGrid] = useState(true);
  const [comprobante, _setComprobante] = useState<any>();
  const [showComprobante, setShowComprobante] = useState(false);
  const [deudas, setDeudas] = useState<any[]>([]);
  const [nombreCliente, setNombreCliente] = useState<string | null>(null);
  const [estadoCliente, setEstadoCliente] = useState<string | null>(null);
  const [disableSearch, setDisableSearch] = useState(false);
  const [showModalDetailPay, setShowModalDetailPay] = useState(false);

  // Estado para el nuevo modal de detalles de créditos
  const [showModalDetallesCreditos, setShowModalDetallesCreditos] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<{
    idcliente: number;
    nombreCompleto: string;
    numDocumento: string;
  } | null>(null);

  // Estado para el modal de cuotas vencidas
  const [showModalCuotasVencidas, setShowModalCuotasVencidas] = useState(false);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');

  const fetchDeudas = async () => {
    try {
      // Usar el nuevo endpoint con detalles de cuotas
      const res = await listarDeudasClienteConCuotasDetalle({ page, limit, search, order });
      setDeudas(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error al obtener deudas:', error);
    }
  };

  const fetchDeudasComplete = async () => {
    try {
      if (!clienteSeleccionado?.numDocumento) {
        console.error('No hay cliente seleccionado');
        return;
      }

      const response = await listarDeudasVentaCompletoPorCliente({
        numDocumento: clienteSeleccionado.numDocumento,
        estado: estadoCliente ?? '',
      });

      if (response.data.reportePDFBase64) {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${response.data.reportePDFBase64}`;
        link.download = `DeudaCliente_${clienteSeleccionado.numDocumento}.pdf`;
        link.click();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDeudas();
  }, [page, limit, search, order]);

  const handleDataforModal = (deuda: any) => {
    // Usar el nuevo modal que filtra por idcliente (más preciso y sin bugs)
    setClienteSeleccionado({
      idcliente: deuda.idcliente,
      nombreCompleto: deuda.nombre_cliente,
      numDocumento: deuda.numDocumento,
    });
    setShowModalDetallesCreditos(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 dark:from-gray-700 dark:to-gray-800  via-indigo-600 dark:via-gray-900 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl">
                <FaMoneyBill className="text-white text-4xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Deudas por Clientes</h1>
                <p className="text-green-100">Control y gestión de saldos pendientes</p>
              </div>
            </div>
            <ButtonGral text='Cuotas Vencidas' onClick={() => setShowModalCuotasVencidas(true)} />
          </div>
        </div>
        {/* CONTROLES */}
        <SearchActionsBar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Buscar por cliente o documento..."
        >
          <ButtonGral text={order === "DESC" ? "Mayor Primero" : "Menor Primero"} onClick={() => {
            setOrder(order === "DESC" ? "ASC" : "DESC");
            setPage(1);
          }} />
          <SelectPage limit={limit} setLimit={setLimit} setPage={setPage} />
          <ButtonGrid onClick={(isGrid) => setVistaGrid(isGrid)} vistaGrid={vistaGrid} />
        </SearchActionsBar>
        {/* CONTENIDO */}
        <div
          className={vistaGrid ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "grid grid-cols-1 gap-4"}>

          {deudas.map((deuda: any) => (
            <div
              key={deuda.iddeuda}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500"
            >
              <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 text-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <CurrencyDollarSolid className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h3 className="font-bold text-base truncate block">{deuda.nombre_cliente}</h3>
                      <p className="text-xs opacity-90 truncate block">{deuda.numDocumento}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <InfoDeudaCliente deuda={deuda} />
                <button
                  onClick={() => handleDataforModal(deuda)}
                  className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 mt-4 transition-all"
                >
                  <FaInfoCircle /> Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
        <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />
      </div>
      {/* MODALES */}
      {showComprobante && comprobante && (
        <ModalComprobantePago
          onClose={() => setShowComprobante(false)}
          comprobante={comprobante}
        />
      )}

      <ModalListarDetallesPagosDeuda
        iddeuda={0}
        isOpen={showModalDetailPay}
        onClose={() => setShowModalDetailPay(false)}
        onSuccess={() => fetchDeudas()}
      />

      <ModalListarClienteDVenta
        key={nombreCliente ?? 'empty'}
        disableSearch={disableSearch}
        isOpen={!!nombreCliente}
        generateReport={fetchDeudasComplete}
        setEstadoCliente={setEstadoCliente}
        onClose={() => {
          setNombreCliente(null);
          setDisableSearch(false);
        }}
        nombreCliente={nombreCliente || ''}
      />
      {/* Nuevo modal de detalles de créditos (sin bugs de búsqueda por nombre) */}
      {clienteSeleccionado && (
        <ModalDetallesCreditosCliente
          isOpen={showModalDetallesCreditos}
          onClose={() => {
            setShowModalDetallesCreditos(false);
            setClienteSeleccionado(null);
            fetchDeudas(); // Refrescar datos al cerrar
          }}
          idcliente={clienteSeleccionado.idcliente}
          nombreCompleto={clienteSeleccionado.nombreCompleto}
          numDocumento={clienteSeleccionado.numDocumento}
        />
      )}

      {/* Modal de Cuotas Vencidas */}
      <ModalCuotasVencidas
        isOpen={showModalCuotasVencidas}
        onClose={() => setShowModalCuotasVencidas(false)}
      />
    </div>
  );
};

export default ListarDeudasVentaCliente;
