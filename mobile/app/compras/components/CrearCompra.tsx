import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import FormCompra from './Compra/FormCompra';
import DetallesProductos from './Compra/DetallesProductos';
import TotalCompra from './Compra/TotalCompra';
import BotonesAcciones from './Compra/BotonesAcciones';
import ModalSeleccionarProducto from './Modals/ModalSeleccionarProducto';
import ModalConfirmarProductos from './CompraRapida/ModalsCompraRapida/ModalConfirmarProductos';
import ModalComprobante from './CompraRapida/ModalsCompraRapida/ModalComprobante';
import { getConfiguracion, createCompra, getLotesProducto } from '../../../services/compras';
import ModalSeleccionarProveedor from 'app/producto/components/ModalsProductos/ModalSeleccionarProveedor';
import ModalSeleccionarLote from 'components/ModalsVenta/ModalSeleccionarLote';
import ModalError from '../../../components/ModalError';

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

const CrearCompra = ({ onSuccess, onClose }: CrearCompraProps) => {
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [compra, setCompra] = useState(initialCompra);
  const [lotesProducto, setLotesProducto] = useState<any[]>([]);
  const [showLoteModal, setShowLoteModal] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<any | null>(null);
  const [detalles, setDetalles] = useState<any[]>([]);
  const [configCompraPorLote, setConfigCompraPorLote] = useState(false);
  const [total, setTotal] = useState(0);

  const [comprobanteData, setComprobanteData] = useState({
    nro_factura: '',
    fecha: '',
    cantidadProductos: 0,
  });
  const [comprobanteProductos, setComprobanteProductos] = useState<any[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await getConfiguracion();
        const configArray = res.data;

        const configCompraLote = configArray.find((c: any) => c.clave === 'sistema_venta_por_lote');
        const isCompraPorLote = configCompraLote?.valor === 'true';

        setConfigCompraPorLote(isCompraPorLote);
      } catch (error) {
        console.error('❌ Error al obtener configuración de compra:', error);
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
  }, [detalles]);

  const handleSubmit = async () => {
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
      }));

    const detallesFinales = detalles.map((d) => ({
      idproducto: d.idproducto,
      iddetalle: d.iddetalle || null,
      cantidad: d.cantidad,
      precio: d.precio,
      precio_venta_caja: d.precio_venta_caja || null,
      precio_compra_caja: d.precio_compra_caja || null,
      cant_p_caja: d.cant_p_caja || null,
      cant_cajas: d.cantidad,
      fecha_vencimiento: d.fecha_vencimiento || '',
      nombre_producto: d.nombre_producto,
      unidad_medida: d.unidad_medida,
      iva: d.iva
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
      setErrorModalOpen(true);
      setErrorMessage('❌ Error al registrar la compra');
    }
  };

  return (
    <View className="h-[90%]">
      <ScrollView className="" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-6">
          <Text className="text-3xl font-bold text-blue-800 mb-4">Nueva Compra</Text>

          <FormCompra
            compra={compra}
            setCompra={setCompra}
            proveedorSeleccionado={proveedorSeleccionado}
            openProveedorModal={() => setShowProveedorModal(true)}
          />

          <BotonesAcciones
            onCrearProducto={() => setShowProductoModal(true)}
            onSeleccionarProducto={() => setShowProductoModal(true)}
          />

          <DetallesProductos
            detalles={detalles}
            setDetalles={setDetalles}
          />

          <TotalCompra total={total} />

          <View className="items-end mt-4">
            <TouchableOpacity
              onPress={() => setConfirmModalOpen(true)}
              className="bg-green-600 px-6 py-3 rounded-lg shadow-md"
            >
              <Text className="text-white font-semibold">Registrar compra</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modales */}
      <ModalSeleccionarProducto
        isBuy={true}
        isOpen={showProductoModal}
        setCantidadProducto={setCantidadProducto}
        onClose={() => setShowProductoModal(false)}
        onSelect={async (producto) => {
          if (configCompraPorLote) {
            try {
              const res = await getLotesProducto(producto.idproducto);
              const lotes = res.data;
              setLotesProducto(lotes);
              setShowLoteModal(true);
              setShowProductoModal(false);
              console.log('🧾 Lotes disponibles:', lotes);
            } catch (error) {
              console.error('Error al obtener lotes del producto:', error);
            }
          } else {
            const fechaVencimientoFormateada = producto.ultima_fecha_vencimiento
              ? new Date(producto.ultima_fecha_vencimiento).toISOString().split('T')[0]
              : '';

            setDetalles(prev => {
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
                    precio_compra_caja: producto.precio_compra_caja,
                    cant_p_caja: producto.cant_p_caja,
                    cant_cajas: cantidadProducto,
                    fecha_vencimiento: fechaVencimientoFormateada,
                    unidad_medida: producto.unidad_medida || '',
                    iva: producto.iva || '',
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
        onSelect={(loteSeleccionado) => {
          const fechaFormateada = loteSeleccionado.fecha_vencimiento
            ? new Date(loteSeleccionado.fecha_vencimiento).toISOString().split('T')[0]
            : '';

          const yaExiste = detalles.some(
            (detalle) => detalle.iddetalle === loteSeleccionado.iddetalle
          );

          if (yaExiste) {
            const detallesActualizados = detalles.map((detalle) => {
              if (detalle.iddetalle === loteSeleccionado.iddetalle) {
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
                fecha_vencimiento: fechaFormateada,
                unidad_medida: loteSeleccionado.unidad_medida,
                iva: loteSeleccionado.iva,
                iddetalle: loteSeleccionado.iddetalle,
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
    </View>
  );
};

export default CrearCompra;
