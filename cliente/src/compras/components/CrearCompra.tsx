'use client';

import { useState, useEffect } from 'react';
import FormCompra from './Compra/FormCompra';
import DetallesProductos from './Compra/DetallesProductos';
import TotalCompra from './Compra/TotalCompra';
import ModalSeleccionarProducto from './Modals/ModalSeleccionarProducto';
import ModalConfirmarProductos from './CompraRapida/ModalsCompraRapida/ModalConfirmarProductos';
import ModalComprobante from './CompraRapida/ModalsCompraRapida/ModalComprobante';
import { getConfiguracion, createCompra, getLotesProducto } from '../../services/compras';
import ModalSeleccionarProveedor from '../../productos/components/ModalsProductos/ModalSeleccionarProveedor';
import ModalSeleccionarLote from '../../ventas/components/ModalsVenta/ModalSeleccionarLote';
import ModalError from '../../components/ModalError';
import { FaSave, FaPlus, FaShoppingBasket, FaBoxOpen } from 'react-icons/fa';
import { usuarioTieneFacturadorActivo } from '../../services/facturador';
import FormCrearProductoInline from './Compra/FormCrearProductoInline';
interface CrearCompraProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const fechaActual = new Date();
const fechaParaguay = new Date(fechaActual.getTime() - fechaActual.getTimezoneOffset() * 60000)
  .toISOString()
  .split('T')[0];

const initialCompra = {
  idproveedor: '',
  nro_factura: '',
  fecha: fechaParaguay,
  tipo: 'contado',
  estado: 'pagado',
  descuento: 0,
  observacion: '',
  fecha_vencimiento: ''
};

const CrearCompra = ({ onSuccess }: CrearCompraProps) => {
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [compra, setCompra] = useState(initialCompra);
  const [lotesProducto, setLotesProducto] = useState<any[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [showLoteModal, setShowLoteModal] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<any | null>(null);
  const [detalles, setDetalles] = useState<any[]>([]);
  const [configCompraPorLote, setConfigCompraPorLote] = useState(false);
  const [total, setTotal] = useState(0);
  const [showCrearProducto, setShowCrearProducto] = useState(false);

  const [comprobanteData, setComprobanteData] = useState({
    nro_factura: '',
    fecha: '',
    cantidadProductos: 0,
  });
  const [comprobanteProductos, setComprobanteProductos] = useState<any[]>([]);
  useEffect(() => { console.log(comprobanteProductos) }, [comprobanteProductos])
  useEffect(() => { console.log("Test", detalles) }, [detalles])
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await getConfiguracion();
        const configArray = res.data;

        const configCompraLote = configArray.find((c: any) => c.clave === 'sistema_venta_por_lote');
        const isCompraPorLote = configCompraLote?.valor === 'true';

        setConfigCompraPorLote(isCompraPorLote);
      } catch (error) {
        console.error('  Error al obtener configuración de compra:', error);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const nuevoTotal = detalles.reduce((acc, d) => {
      const precio = d.unidad_medida === 'CAJA' ? parseFloat(d.precio_compra_caja || '0') : parseFloat(d.precio || '0');
      const cantidad = parseFloat(d.cantidad || '0');
      return acc + (precio * cantidad);
    }, 0);
    setTotal(nuevoTotal);
  }, [detalles]);;

  const handleSubmit = async () => {
    try {
      const tieneFacturadorActivo = await usuarioTieneFacturadorActivo();
      if (!tieneFacturadorActivo) {
        setErrorMessage('No tenes un facturador activo para tu usuario. No se puede registrar la compra.');
        setErrorModalOpen(true);
        return;
      }
    } catch (error) {
      console.error('Error al validar facturador activo:', error);
      setErrorMessage('No se pudo validar el facturador activo del usuario.');
      setErrorModalOpen(true);
      return;
    }

    if (!compra.idproveedor) {
      setErrorMessage('Debes seleccionar un proveedor.');
      setErrorModalOpen(true);
      return;
    }
    if (!compra.nro_factura.trim()) {
      setErrorMessage('El número de factura es obligatorio.');
      setErrorModalOpen(true);
      return;
    }
    if (!compra.fecha) {
      setErrorMessage('La fecha de la compra es obligatoria.');
      setErrorModalOpen(true);
      return;
    }
    if (!compra.tipo) {
      setErrorMessage('Debes seleccionar el tipo de pago.');
      setErrorModalOpen(true);
      return;
    }

    // Validar que todos los productos tengan número de lote
    const productosSinLote = detalles.filter(d => !d.numero_lote || d.numero_lote.trim() === '');
    if (productosSinLote.length > 0) {
      const nombresProductos = productosSinLote.map(p => p.nombre_producto).join(', ');
      setErrorMessage(`Los siguientes productos requieren un número de lote: ${nombresProductos}`);
      setErrorModalOpen(true);
      return;
    }

    const productosNuevos = detalles
      .filter((d) => String(d.idproducto).startsWith('temp-'))
      .map((d) => ({
        idtemp: d.idproducto,
        nombre_producto: d.nombre_producto,
        precio_compra: d.precio_compra || d.precio,
        precio_compra_caja: d.precio_compra_caja || null,
        precio_venta: d.precio_venta || '',
        precio_venta_caja: d.precio_venta_caja || null,
        unidad_medida: d.unidad_medida || '',
        iva: d.iva || '',
        idcategoria: d.idcategoria,
        idproveedor: compra.idproveedor,
        cantidad: d.cantidad,
        cant_p_caja: d.cant_p_caja || null,
        cant_cajas: d.cant_cajas || null,
        numero_lote: d.numero_lote || '',
        referencia_proveedor: d.referencia_proveedor || '',
        cod_barra: d.cod_barra || null,
        ubicacion: d.ubicacion_almacen || 'PRINCIPAL'
      }));
      
    const detallesFinales = detalles.map((d) => ({
      idproducto: d.idproducto,
      iddetalle: d.iddetalle || null,
      idlote: d.idlote, //   CRÍTICO: Incluir idlote para actualizar lotes existentes
      cantidad: d.cantidad,
      precio: d.precio,
      precio_venta_caja: d.precio_venta_caja || null,
      precio_compra_caja: d.precio_compra_caja || null,
      cant_p_caja: d.cant_p_caja || null,
      cant_cajas: d.cantidad,
      fecha_vencimiento: d.fecha_vencimiento || '',
      nombre_producto: d.nombre_producto,
      unidad_medida: d.unidad_medida,
      iva: d.iva,
      numero_lote: d.numero_lote || '',
      referencia_proveedor: d.referencia_proveedor || '',
      ubicacion_almacen: d.ubicacion_almacen || 'PRINCIPAL'
    }));
    const payload = { compra: { ...compra, total }, detalles: detallesFinales, productosNuevos };

    try {
      await createCompra(payload);
      onSuccess && onSuccess();
      setComprobanteData({
        nro_factura: compra.nro_factura,
        fecha: compra.fecha,
        cantidadProductos: detalles.length,
      });
      setComprobanteProductos(
        detalles.map(({ precio, ...rest }) => ({
          ...rest,
          precio_compra: precio,
        }))
      );

      setSuccessModalOpen(true);
      setCompra(initialCompra);
      setProveedorSeleccionado(null);
      setDetalles([]);
    } catch (error) {
      setErrorModalOpen(true)
      setErrorMessage('  Error al registrar la compra');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 overflow-auto">
      <form onSubmit={(e) => {
        e.preventDefault();
        setConfirmModalOpen(true);
      }} className='flex flex-row gap-5'>
        <div className="min-w-max">
          <TotalCompra total={total} />
          <div className='p-2 flex flex-row gap-3'>

            <div className="space-y-2 border border-blue-400/20 rounded-md min-w-[420px]">
              <div className="bg-gradient-to-r 
                from-blue-600 to-blue-700 
                dark:from-slate-800 dark:to-slate-700
                rounded-t-md p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 dark:bg-white/10 p-2 rounded-lg">
                    <FaShoppingBasket className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white uppercase">
                      Nueva Compra
                    </h1>
                    <p className="text-sm text-blue-100 dark:text-slate-300">
                      Registrá una nueva compra de productos
                    </p>
                  </div>
                </div>
              </div>
              
              <FormCompra
                compra={compra}
                setCompra={setCompra}
                proveedorSeleccionado={proveedorSeleccionado}
                openProveedorModal={() => setShowProveedorModal(true)}
              />

              <div className="flex justify-center items-center gap-3 p-4 pt-0 flex-wrap">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow flex items-center gap-2">
                  <FaSave size={16} />
                  Registrar compra
                </button>
                <button onClick={() => setShowProductoModal(true)} type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2">
                  <FaPlus size={16} />
                  Seleccionar producto
                </button>
                <button
                  onClick={() => setShowCrearProducto(prev => !prev)}
                  type="button"
                  className={`px-4 py-2 rounded-lg shadow flex items-center gap-2 transition-colors ${showCrearProducto ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700'} text-white`}
                >
                  <FaBoxOpen size={16} />
                  {showCrearProducto ? 'Ocultar form' : 'Crear producto'}
                </button>
              </div>
            </div>

            <div className="flex flex-col w-[540px] min-w-[540px] gap-4">
              {showCrearProducto && (
                <FormCrearProductoInline
                  onAgregar={(detalle) => {
                    setDetalles(prev => [...prev, detalle]);
                    setShowCrearProducto(false);
                  }}
                  onCancelar={() => setShowCrearProducto(false)}
                />
              )}
              <DetallesProductos
                detalles={detalles}
                setDetalles={setDetalles}
              />
            </div>



          </div>
        </div>
      </form>
      <ModalSeleccionarProducto
        isBuy={true}
        isOpen={showProductoModal}
        setCantidadProducto={setCantidadProducto}
        onClose={() => setShowProductoModal(false)}
        onSelect={async (producto) => {
          if (configCompraPorLote) {
            try {
              // Guardar información del producto seleccionado
              setProductoSeleccionado({
                idproducto: producto.idproducto,
                nombre_producto: producto.nombre_producto,
                precio_venta: producto.precio_venta,
                precio_compra: producto.precio_compra,
                unidad_medida: producto.unidad_medida,
                iva: producto.iva,
                precio_venta_caja: producto.precio_venta_caja,
                cant_p_caja: producto.cant_p_caja,
              });
              const res = await getLotesProducto(producto.idproducto);
              const lotes = res.data.lotes || [];
              setLotesProducto(lotes);
              setShowLoteModal(true);
              setShowProductoModal(false);
              console.log('🧾 Lotes disponibles:', lotes);
            } catch (error) {
              console.error('  Error al obtener lotes del producto:', error);
            }
          } else {
            const fechaVencimientoFormateada = producto.ultima_fecha_vencimiento
              ? new Date(producto.ultima_fecha_vencimiento).toISOString().split('T')[0]
              : '';

            setDetalles(prev => {
              console.log("Detalles antes de agregar:", prev);
              const idxExistente = prev.findIndex(d => d.idproducto === producto.idproducto);
              if (idxExistente !== -1) {
                const updated = [...prev];
                updated[idxExistente] = {
                  ...updated[idxExistente],
                  cantidad: (parseFloat(updated[idxExistente].cantidad || '0') + cantidadProducto).toString(),
                };
                return updated;
              } else {
                return [
                  ...prev,
                  {
                    idproducto: producto.idproducto,
                    nombre_producto: producto.nombre_producto,
                    cantidad: cantidadProducto,
                    precio_venta: producto.precio_venta || '',
                    precio_venta_caja: producto.precio_venta_caja || null,
                    precio: producto.precio_compra || '',
                    lote_pr_compr_rec: producto.lote_pr_compr_rec || '',
                    precio_compra_caja: producto.precio_compra_caja,
                    cant_p_caja: producto.cant_p_caja,
                    cant_cajas: cantidadProducto,
                    fecha_vencimiento: fechaVencimientoFormateada,
                    unidad_medida: producto.unidad_medida || '',
                    iva: producto.iva || '',
                    numero_lote: producto.lotenumreciente || '',
                    referencia_proveedor: '',
                    ubicacion_almacen: 'PRINCIPAL'
                  }
                ];
              }
            });

            setShowProductoModal(false);
          }
        }}
      />

      <ModalSeleccionarProveedor
        isOpen={showProveedorModal}
        onClose={() => setShowProveedorModal(false)}
        onSelect={(proveedor: any) => {
          setProveedorSeleccionado(proveedor);
          setCompra(prev => ({ ...prev, idproveedor: proveedor.idproveedor }));
          setShowProveedorModal(false);
        }}
      />
      <ModalConfirmarProductos
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => {
          setConfirmModalOpen(false);
          handleSubmit();
        }}
        productos={detalles}
      />
      <ModalSeleccionarLote
        isOpen={showLoteModal}
        onClose={() => setShowLoteModal(false)}
        lotes={lotesProducto}
        productoInfo={productoSeleccionado}
        onSelect={(loteSeleccionado) => {
          const fechaFormateada = loteSeleccionado.fecha_vencimiento
            ? new Date(loteSeleccionado.fecha_vencimiento).toISOString().split('T')[0]
            : '';

          const yaExiste = detalles.some(
            (detalle) => detalle.idlote === loteSeleccionado.idlote && loteSeleccionado.idlote !== -1
          );

          if (yaExiste) {
            const detallesActualizados = detalles.map((detalle) => {
              if (detalle.idlote === loteSeleccionado.idlote) {
                return {
                  ...detalle,
                  cantidad: detalle.cantidad + 1,
                };
              }
              return detalle;
            });

            setDetalles(detallesActualizados);
          } else {
            setDetalles((prev) => [
              ...prev,
              {
                idproducto: loteSeleccionado.idproducto,
                nombre_producto: loteSeleccionado.nombre_producto,
                cantidad: 1,
                precio: loteSeleccionado.precio_compra || '',
                precio_venta: loteSeleccionado.precio_venta || '',
                precio_venta_caja: loteSeleccionado.precio_venta_caja || null,
                precio_compra_caja: loteSeleccionado.precio_compra_caja || null,
                cant_p_caja: loteSeleccionado.cant_p_caja || null,
                fecha_vencimiento: fechaFormateada,
                unidad_medida: loteSeleccionado.unidad_medida,
                iva: loteSeleccionado.iva,
                idlote: loteSeleccionado.idlote,
                numero_lote: loteSeleccionado.numero_lote,
                referencia_proveedor: loteSeleccionado.referencia_proveedor || '',
                ubicacion_almacen: loteSeleccionado.ubicacion_almacen || 'PRINCIPAL',
              },
            ]);
          }

          setShowLoteModal(false);
        }}
      />
      <ModalComprobante
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        datos={comprobanteData}
        productos={comprobanteProductos}
      />
      <ModalError
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        message={errorMessage}
      />
    </div>
  );
};

export default CrearCompra;
