'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  FaBoxOpen,
  FaSearch,
  FaEdit,
  FaTrash,
  FaFileAlt,
  FaBox,
  FaCheck,
  FaCamera
} from 'react-icons/fa';
import ModalEditarProducto from './ModalsProductos/ModalEditarProducto';
import ModalAdvert from '../../components/ModalAdvert';
import ModalsCrearCompraRapida from '../../compras/components/Modals/ModalsCrearCompraRapida';
import { getProductosPaginated, deleteProducto } from '../../services/productos';
import { getReportProducts } from '../../services/productos';
import ModalError from '../../components/ModalError';
import ModalSuccess from '../../components/ModalSuccess';
import { InventarioProducto } from './InventarioProducto';
import type { ReporteResponse } from '../../types/reporte.types';
import DetallesProducto from './DetallesProducto';
import { calcularStockDisponibleProducto } from '../../ventas/utils/stockCalculations';
import ButtonGrid from '../../components/ButtonGrid';
import SelectPage from '../../components/SelectPage';
import SelectPagination from '../../components/SelectPagination';
import CardText from '../../ventas/components/CobroDeudaVenta/components/CardText';
import ButtonGral from '../../components/ButtonGral';
import { ReconocimientoProducto } from './ReconocimientoProducto';
import type { ProductoReconocido } from '../../services/reconocimiento';

interface ListarProductosProps {
  onSelect?: (producto: any) => void;
  isBuy?: boolean;
  setCantidadProducto?: (cantidad: number) => void;
  cantidadProducto?: number;
  setCantidadMaximo?: (cantidad: number) => void;
  configVentaPorLote?: boolean;
  detalles?: any[];
  stockVerify?: boolean;
}

const ListarProductos = ({
  onSelect,
  isBuy,
  setCantidadProducto,
  cantidadProducto,
  setCantidadMaximo,
  configVentaPorLote = false,
  detalles = [],
  stockVerify = false,
}: ListarProductosProps) => {
  const [productos, setProductos] = useState<any[]>([]);
  const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
  const [advertMessage, setAdvertMessage] = useState("");
  const [advertAction, setAdvertAction] = useState<(() => void) | null>(null);
  const [isInputTouched, setIsInputTouched] = useState(false);
  const [modalEditarProductoOpen, setModalEditarProductoOpen] = useState(false);
  const [idProducto, setIdProducto] = useState<number | string>('');
  const [modalCrearCompraRapidaOpen, setModalCrearCompraRapidaOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [datosReporte, setDatosReporte] = useState<ReporteResponse | null>(null);
  const [mostrarInventario, setMostrarInventario] = useState(false);
  const [modalDetallesOpen, setModalDetallesOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [vistaGrid, setVistaGrid] = useState(true); // true = grid, false = lista
  const [reconocimientoOpen, setReconocimientoOpen] = useState(false);

  // Estilos para CardText (con dark mode)
  const styleCardSmall = "bg-blue-50 dark:bg-gray-700 rounded-lg p-3 border border-blue-200 dark:border-gray-600";
  const styleTxtCards = "text-xs text-blue-600 dark:text-blue-300 font-medium mb-1";
  const styleTxtLabelBold = "text-xs font-bold text-blue-700 dark:text-gray-100 truncate";

  const handleGenerateReporte = async () => {
    try {
      const res = await getReportProducts();
      setDatosReporte(res.data);
      setMostrarInventario(true);
    } catch (error) {
      console.error("  Error al generar reporte del cliente:", error);
      setErrorMessage("  Error al generar el reporte");
    }
  };

  const handleDownloadPDF = () => {
    if (datosReporte?.reportePDFBase64) {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${datosReporte.reportePDFBase64}`;
      link.download = `Reporte-Inventario-${new Date().toLocaleDateString()}.pdf`;
      link.click();
    }
  };

  const fetchProductos = async () => {
    try {
      const res = await getProductosPaginated({ page, limit, search });
      setProductos(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  const handleDelete = (id: number) => {
    setAdvertMessage('¿Estás seguro de que deseas eliminar este producto?');
    setAdvertAction(() => async () => {
      try {
        await deleteProducto(id);
        setSuccessMessage('  Producto eliminado exitosamente');
        fetchProductos();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        setErrorMessage('  No se pudo eliminar el producto');
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
    setAdvertMessage("");
  };

  const handleEdit = (id: number) => {
    setIdProducto(id);
    setModalEditarProductoOpen(true);
  };

  const handleDetalles = (producto: any) => {
    setProductoSeleccionado(producto);
    setModalDetallesOpen(true);
  };

  const handleProductoReconocido = (producto: ProductoReconocido) => {
    setSearch(producto.nombre_producto);
    setSuccessMessage(`Producto "${producto.nombre_producto}" encontrado con ${producto.similitud}% de coincidencia`);
  };

  // Calcular stock disponible para cada producto (stock total - lo que está en el carrito)
  const productosConStockDisponible = useMemo(() => {
    return productos.map((prod) => {
      // Si no hay detalles o es modo compra, usar stock completo
      if (!detalles || detalles.length === 0 || isBuy || configVentaPorLote) {
        return { ...prod, stockDisponible: prod.stock };
      }

      // Calcular stock disponible descontando lo que ya está en el carrito
      const stockDisponible = calcularStockDisponibleProducto(
        {
          idproducto: prod.idproducto,
          stock: prod.stock,
          unidad_medida: prod.unidad_medida,
          cant_cajas: prod.cant_cajas,
          cant_p_caja: prod.cant_p_caja,
        },
        detalles
      );

      return { ...prod, stockDisponible };
    });
  }, [productos, detalles, isBuy, configVentaPorLote]);

  const renderCantidadInput = (prod: any) => {
    const isDecimal = prod.unidad_medida === 'KG' || prod.unidad_medida === 'L';
    const min = isDecimal ? 0.1 : 1;
    const step = isDecimal ? 0.1 : 1;
    const stockDisponible = prod.stockDisponible ?? prod.stock;

    return (
      <input
        type="number"
        disabled={configVentaPorLote}
        min={min}
        step={step}
        defaultValue={min}
        onBlur={(e) => {
          let valor = isDecimal ? parseFloat(e.target.value) : parseInt(e.target.value);
          if (isNaN(valor) || valor < min) valor = min;
          // Solo validar stock si no es compra
          if (!isBuy && valor > stockDisponible) {
            setErrorMessage(`La cantidad no puede superar el stock disponible (${stockDisponible})`);
            valor = stockDisponible;
          }
          e.target.value = valor.toString();
          setCantidadProducto?.(valor);
          if (!isBuy) {
            setCantidadMaximo?.(stockDisponible);
          }
          setIsInputTouched(true);
        }}
        className="w-20 border border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    );
  };

  const handleSeleccionar = (prod: any) => {
    const stockDisponible = prod.stockDisponible ?? prod.stock;

    // Validar stock disponible
    if (stockVerify && !isBuy && stockDisponible <= 0) {
      setErrorMessage(`  No hay stock disponible. Ya agregaste todo el stock disponible (${prod.stock}) al carrito.`);
      return;
    }

    const isDecimal = prod.unidad_medida === 'KG' || prod.unidad_medida === 'L';
    const defaultCantidad = isDecimal ? 0.1 : 1;
    const cantidadFinal = isInputTouched ? cantidadProducto ?? defaultCantidad : defaultCantidad;

    // Validar que la cantidad no exceda el stock disponible (solo para ventas, no para compras)
    if (!isBuy && cantidadFinal > stockDisponible) {
      setErrorMessage(`  Stock insuficiente. Disponible: ${stockDisponible}, intentas agregar: ${cantidadFinal}`);
      return;
    }

    setCantidadMaximo?.(stockDisponible);
    onSelect?.({ ...prod, cantidad: cantidadFinal, cantidadMaximo: stockDisponible });
  };

  useEffect(() => {
    fetchProductos();
  }, [page, limit, search]);

  const getStockBadgeColor = (stock: number) => {
    if (stock <= 0) return 'bg-red-100 text-red-700 border-red-300';
    if (stock <= 10) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  return (
    <div className="truncate bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4" style={{ scrollbarGutter: 'stable' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 mb-6 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 sm:p-4 rounded-2xl">
              <FaBoxOpen className="text-white text-3xl sm:text-4xl" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">Gestión de Productos</h1>
              <p className="text-sm sm:text-base text-blue-100">Administra tu inventario de forma eficiente</p>
            </div>
          </div>
        </div>

        {/* Controles superiores */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Buscador */}
            <div className="relative w-full">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* Filtro y botones */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Filtro de items por página y toggle vista */}
              <div className="flex items-center gap-3">
                <SelectPage limit={limit} setLimit={setLimit} setPage={setPage} />
                <ButtonGrid onClick={(isGrid) => setVistaGrid(isGrid)} vistaGrid={vistaGrid} />
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row sm:gap-3">
                <ButtonGral text='Nuevo Producto' onClick={() => setModalCrearCompraRapidaOpen(true)} />
                <ButtonGral text='Reporte PDF' onClick={()=> handleGenerateReporte()} />
                <button
                  onClick={() => setReconocimientoOpen(true)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all font-semibold text-sm"
                  title="Buscar producto por imagen"
                >
                  <FaCamera />
                  <span className="hidden sm:inline">Reconocer</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vista condicional: Grid o Lista */}
        <div className={vistaGrid ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "grid grid-cols-1 gap-4"}>
          {productosConStockDisponible.map((prod) => (
            <div
              key={prod.idproducto}
              className="border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2"
            >
              {/* Header con gradiente */}
              <div className={`p-4 text-white bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-white/20 p-2 rounded-lg">
                      {prod.unidad_medida === 'CAJA' ? <FaBox size={20} /> : <FaBoxOpen size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base truncate">{prod.nombre_producto}</h3>
                      <p className="text-xs opacity-90">{prod.unidad_medida}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStockBadgeColor(prod.stock)} border-2`}>
                    {!isBuy && !configVentaPorLote && detalles && detalles.length > 0 && prod.stockDisponible !== prod.stock
                      ? `Disp: ${prod.stockDisponible}`
                      : `Stock: ${prod.stock}`
                    }
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                {/* Código de barra */}
                <CardText
                  title="Código de Barra"
                  text={prod.cod_barra || 'N/A'}
                  containerClass={styleCardSmall}
                  titleClass={styleTxtCards}
                  textClass={styleTxtLabelBold}
                />

                {/* Precios */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-2">
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">P. Compra</p>
                    <p className="font-bold text-blue-900 dark:text-gray-100 text-sm">
                      ₲ {prod.lote_pr_compr_rec ? parseFloat(prod.lote_pr_compr_rec).toLocaleString("es-PY") : '0'}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-2">
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">P. Venta</p>
                    <p className="font-bold text-blue-900 dark:text-gray-100 text-sm">
                      ₲ {prod.precio_venta ? parseFloat(prod.precio_venta).toLocaleString("es-PY") : '0'}
                    </p>
                  </div>
                </div>

                {/* Ubicación e IVA */}
                <div className="grid grid-cols-2 gap-2">
                  <CardText
                    title="Ubicación"
                    text={prod.ubicacion}
                    containerClass={styleCardSmall}
                    titleClass={styleTxtCards}
                    textClass={styleTxtLabelBold}
                  />
                  <CardText
                    title="IVA"
                    text={`${prod.iva}%`}
                    containerClass={styleCardSmall}
                    titleClass={styleTxtCards}
                    textClass={styleTxtLabelBold}
                  />
                </div>

                {/* Info de CAJA */}
                {prod.unidad_medida === 'CAJA' && (
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-orange-200 dark:border-gray-600">
                    <div className="bg-orange-50 dark:bg-gray-700 rounded-lg p-2">
                      <p className="text-xs text-orange-700 dark:text-orange-300">Cajas</p>
                      <p className="font-bold text-orange-900 dark:text-gray-100">{prod.cant_cajas || 'N/A'}</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-gray-700 rounded-lg p-2">
                      <p className="text-xs text-orange-700 dark:text-orange-300">P. Caja</p>
                      <p className="font-bold text-orange-900 dark:text-gray-100 text-xs truncate">
                        {prod.precio_compra_caja ? `₲ ${parseFloat(prod.precio_compra_caja).toLocaleString("es-PY")}` : "N/A"}
                      </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-gray-700 rounded-lg p-2">
                      <p className="text-xs text-orange-700 dark:text-orange-300">Unid/Caja</p>
                      <p className="font-bold text-orange-900 dark:text-gray-100">{prod.cant_p_caja ?? "N/A"}</p>
                    </div>
                  </div>
                )}

                {/* Stock disponible vs total */}
                {!isBuy && !configVentaPorLote && detalles && detalles.length > 0 && prod.stockDisponible !== prod.stock && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-2">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">Stock total: <span className="font-bold">{prod.stock}</span></p>
                  </div>
                )}

                {/* Acciones */}
                <div className="pt-3 border-t border-blue-100 dark:border-gray-600">
                  {onSelect ? (
                    <div className="space-y-2">
                      {setCantidadProducto && (
                        <div className="flex justify-center">
                          {renderCantidadInput(prod)}
                        </div>
                      )}
                      <button
                        onClick={() => handleSeleccionar(prod)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-sm"
                      >
                        <FaCheck />
                        Seleccionar
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(prod.idproducto)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                        title="Editar"
                      >
                        <FaEdit />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDetalles(prod)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                        title="Detalles"
                      >
                        <FaFileAlt />
                        Detalles
                      </button>
                      <button
                        onClick={() => handleDelete(prod.idproducto)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación mejorada */}
        <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />
      </div>

      {/* Modales */}
      <ModalsCrearCompraRapida isOpen={modalCrearCompraRapidaOpen} onClose={() => setModalCrearCompraRapidaOpen(false)} onSuccess={fetchProductos} />
      <ModalEditarProducto isOpen={modalEditarProductoOpen} onClose={() => setModalEditarProductoOpen(false)} onSuccess={fetchProductos} id={idProducto} />
      <ModalError isOpen={!!errorMessage} onClose={() => setErrorMessage("")} message={errorMessage} />
      <ModalSuccess isOpen={!!successMessage} onClose={() => setSuccessMessage("")} message={successMessage} />
      <ModalAdvert
        isOpen={modalAdvertOpen}
        onClose={() => setModalAdvertOpen(false)}
        message={advertMessage}
        onConfirm={handleConfirmAdvert}
        confirmButtonText="Confirmar"
      />

      {/* Modal de Inventario */}
      {mostrarInventario && datosReporte && (
        <InventarioProducto
          reporte={datosReporte.datosReporte.reporte}
          onClose={() => setMostrarInventario(false)}
          onDownloadPDF={handleDownloadPDF}
        />
      )}

      {/* Modal Detalles Producto */}
      {modalDetallesOpen && productoSeleccionado && (
        <DetallesProducto
          idproducto={productoSeleccionado.idproducto}
          nombre_producto={productoSeleccionado.nombre_producto}
          onClose={() => {
            setModalDetallesOpen(false);
            setProductoSeleccionado(null);
          }}
          onSuccess={() => {
            fetchProductos();
          }}
        />
      )}

      {/* Modal de Reconocimiento de Producto */}
      <ReconocimientoProducto
        isOpen={reconocimientoOpen}
        onClose={() => setReconocimientoOpen(false)}
        onProductoSeleccionado={handleProductoReconocido}
      />
    </div>
  );
};

export default ListarProductos;
