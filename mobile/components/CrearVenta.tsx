import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import FormVenta from './CrearVenta/FormVenta';
import DetallesProductos from './CrearVenta/DetallesProductos';
import TotalVenta from './CrearVenta/TotalVenta';
import BotonesAcciones from './CrearVenta/BotonesAcciones';
import ModalSeleccionarLote from './ModalsVenta/ModalSeleccionarLote';
import ModalAdvert from 'components/ModalAdvert';
import ModalSeleccionarProducto from 'app/compras/components/Modals/ModalSeleccionarProducto';
import ModalSeleccionarCliente from './ModalsVenta/ModalSeleccionarCliente';
import ModalConfirmarProductos from 'app/compras/components/CompraRapida/ModalsCompraRapida/ModalConfirmarProductos';
import ModalComprobante from 'app/compras/components/CompraRapida/ModalsCompraRapida/ModalComprobante';
import ModalError from 'components/ModalError';
import { crearVenta, obtenerConfiguracionVenta, validarVencimientoPorLote, validarVencimientoSimulado, obtenerLotesProducto } from 'services/ventas';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface CrearVentaProps {
    onSuccess?: () => void;
}

const fechaActual = new Date();
const fechaParaguay = new Date(fechaActual.getTime() - fechaActual.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];

const initialVenta = {
    idcliente: '',
    fecha: fechaParaguay,
    tipo: 'contado',
    tipo_comprobante: 'T',
    nro_factura: '',
    estado: 'pagado',
    total_descuento: 0,
    observacion: '',
    idformapago: 1,
    datos_bancarios: null,
    fecha_vencimiento: ''
};

const CrearVenta = ({ onSuccess }: CrearVentaProps) => {
    const [showProductoModal, setShowProductoModal] = useState(false);
    const [advertModalOpen, setAdvertModalOpen] = useState(false);
    const [advertMessage, setAdvertMessage] = useState('');
    const [tipoDescuento, setTipoDescuento] = useState<'sin_descuento' | 'descuento_producto' | 'descuento_total'>('sin_descuento')
    const [montoDescuentoTotal, setMontoDescuentoTotal] = useState("")
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [showLoteModal, setShowLoteModal] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorProductos, setErrorProductos] = useState<any[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [cantidadProducto, setCantidadProducto] = useState(1);
    const [cantidadMaximo, setCantidadMaximo] = useState(0);
    const [configVentaPorLote, setConfigVentaPorLote] = useState<boolean>(false);
    const [configventaFechaVencimiento, setConfigVentaFechaVencimiento] = useState<boolean>(false);
    const [lotesProducto, setLotesProducto] = useState<any[]>([]);
    const [venta, setVenta] = useState(initialVenta);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<any | null>(null);
    const [detalles, setDetalles] = useState<any[]>([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchConfiguraciones = async () => {
            try {
                const config = await obtenerConfiguracionVenta();
                setConfigVentaPorLote(config.sistema_venta_por_lote);
                setConfigVentaFechaVencimiento(config.venta_fecha_vencimiento);
            } catch (error) {
                console.error('❌ Error al cargar configuraciones', error);
            }
        };

        fetchConfiguraciones();
    }, []);

    const [comprobanteData, setComprobanteData] = useState({
        nro_factura: '',
        fecha: '',
        cantidadProductos: 0,
    });
    const [comprobanteProductos, setComprobanteProductos] = useState<any[]>([]);

    useEffect(() => {
        const nuevoTotal = detalles.reduce(
            (acc, d) => acc + parseFloat(d.precio_venta || 0) * parseFloat(d.cantidad || 0), 0
        );
        const descuentoTotal = detalles.reduce(
            (acc, d) => acc + parseFloat(d.descuento || 0), 0
        );
        setMontoDescuentoTotal(descuentoTotal.toString());
        setTotal(nuevoTotal);
    }, [detalles]);

    const handleSharePdf = async (base64Pdf: string, nro_factura: string) => {
        try {
            const filename = `Venta-${nro_factura || 'S-N'}-${Date.now()}.pdf`;
            const fileUri = FileSystem.documentDirectory + filename;

            await FileSystem.writeAsStringAsync(fileUri, base64Pdf, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Compartir Comprobante de Venta',
                });
            } else {
                Alert.alert('No disponible', 'La función de compartir no está disponible en este dispositivo.');
            }
        } catch (error) {
            console.error('Error al compartir PDF:', error);
            Alert.alert('Error', 'No se pudo compartir el comprobante PDF.');
        }
    };

    const handleSubmit = async () => {
        if (venta.idformapago === 2 && !venta.datos_bancarios) {
            setAdvertMessage('⚠️ Debes seleccionar los datos bancarios para realizar la venta con transferencia.');
            setAdvertModalOpen(true);
            return;
        }

        if (!venta.idcliente) {
            setErrorMessage('Debes seleccionar un cliente.');
            setErrorProductos([]);
            setErrorModalOpen(true);
            return;
        }

        if (!venta.fecha) {
            setErrorMessage('La fecha de la venta es obligatoria.');
            setErrorProductos([]);
            setErrorModalOpen(true);
            return;
        }

        if (!venta.tipo) {
            setErrorMessage('Debes seleccionar el tipo de pago.');
            setErrorProductos([]);
            setErrorModalOpen(true);
            return;
        }

        if (!venta.tipo_comprobante) {
            setErrorMessage('Debes seleccionar el tipo de comprobante.');
            setErrorProductos([]);
            setErrorModalOpen(true);
            return;
        }

        const detallesFinales = detalles.map((d) => ({
            idproducto: d.idproducto,
            iddetalle: d.iddetalle_lote,
            cantidad: d.cantidad,
            descuento: d.descuento,
            precio_venta: d.precio_venta,
            precio_compra: d.precio_compra,
            fecha_vencimiento: d.fecha_vencimiento || '',
            nombre_producto: d.nombre_producto,
            unidad_medida: d.unidad_medida,
            iva: d.iva,
            precio_venta_caja: d.precio_venta_caja || null,
            cant_p_caja: d.cant_p_caja || null,
            cant_cajas_vender: d.cant_cajas_vender || null,
            cant_unidades_sueltas: d.cant_unidades_sueltas || null,
        }));

        const payload = {
            venta: { ...venta, total, total_descuento: Number(montoDescuentoTotal) || 0 },
            detalles: detallesFinales,
            sistema_venta_por_lote: configVentaPorLote,
            tipoDescuento
        };

        try {
            if (configVentaPorLote && configventaFechaVencimiento) {
                const res = await validarVencimientoPorLote(detallesFinales);
                if (res.data?.error) {
                    const productosConError = res.data.productos_vencidos.map((prod: any) => ({
                        nombre_producto: prod.nombre_producto,
                        error: `Producto vencido - Fecha: ${new Date(prod.fecha_vencimiento).toLocaleDateString()}`,
                    }));

                    setErrorMessage("Hay productos vencidos en los lotes seleccionados.");
                    setErrorProductos(productosConError);
                    setErrorModalOpen(true);
                    return;
                }
            } else if (!configVentaPorLote && configventaFechaVencimiento) {
                const res = await validarVencimientoSimulado(
                    detalles.map((d) => ({
                        idproducto: d.idproducto,
                        cantidad: d.cantidad,
                    }))
                );

                if (res.data?.error) {
                    const productosConError = res.data.productos_vencidos.map((prod: any) => ({
                        nombre_producto: prod.nombre_producto,
                        error: `Producto vencido - Solo se pueden vender ${prod.cantidadDisponible} (vencen: ${new Date(prod.vencidos[0].fecha_vencimiento).toLocaleDateString()})`,
                    }));

                    setErrorMessage("Algunos productos tienen lotes vencidos y no se puede procesar la venta completa.");
                    setErrorProductos(productosConError);
                    console.log("Productos con error", productosConError)
                    setErrorModalOpen(true);
                    return;
                }
            }
            
            const response = await crearVenta(payload);
            onSuccess && onSuccess();

            if (response.data?.facturaPDFBase64) {
                await handleSharePdf(response.data.facturaPDFBase64, response.data?.nro_factura);
            }

            setComprobanteData({
                nro_factura: response.data?.nro_factura || '',
                fecha: venta.fecha,
                cantidadProductos: detalles.length,
            });

            setComprobanteProductos(detalles.map((d) => ({
                ...d,
                precio_venta: d.precio_venta,
            })));

            setSuccessModalOpen(true);
            setMontoDescuentoTotal("");
            setVenta(initialVenta);
            setClienteSeleccionado(null);
            setDetalles([]);

        } catch (error: any) {
            console.error("❌ Error al registrar venta:", error);
            setErrorMessage('❌ Error al registrar la venta');
            setErrorProductos([]);
            setErrorModalOpen(true);
        }
    };

    const handleFormSubmit = () => {
        setConfirmModalOpen(true);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <View className="flex-1">
                <ScrollView 
                    className="flex-1 p-4"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <Text className="text-3xl font-bold text-blue-800 mb-3">🛒 Nueva Venta</Text>

                    <View className="flex-col">
                        <FormVenta
                            setMontoDescuentoTotal={setMontoDescuentoTotal}
                            montoDescuentoTotal={montoDescuentoTotal}
                            setTipoDescuento={setTipoDescuento}
                            tipoDescuento={tipoDescuento}
                            venta={venta}
                            setVenta={setVenta}
                            clienteSeleccionado={clienteSeleccionado}
                            openClienteModal={() => setShowClienteModal(true)}
                        />

                        <BotonesAcciones
                            onCrearProducto={() => setShowProductoModal(true)}
                            onSeleccionarProducto={() => setShowProductoModal(true)}
                        />

                        <DetallesProductos
                            detalles={detalles}
                            setDetalles={setDetalles}
                        />

                        <TotalVenta total={total} descuento_total={Number(montoDescuentoTotal) || 0} />

                        <TouchableOpacity 
                            onPress={handleFormSubmit}
                            className="bg-green-600 active:bg-green-700 px-6 py-4 rounded-xl shadow-lg mt-4"
                        >
                            <Text className="text-white font-bold text-base text-center">
                                💾 Registrar Venta
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            {/* Modales */}
            <ModalSeleccionarProducto
                isBuy={false}
                isOpen={showProductoModal}
                detalles={detalles}
                configVentaPorLote={configVentaPorLote}
                cantidadProducto={cantidadProducto}
                stockVerify={true}
                setCantidadMaximo={setCantidadMaximo}
                setCantidadProducto={setCantidadProducto}
                onClose={() => setShowProductoModal(false)}
                onSelect={async (producto) => {
                    if (configVentaPorLote) {
                        try {
                            const res = await obtenerLotesProducto(producto.idproducto);
                            const lotes = res.data;
                            setLotesProducto(lotes);
                            setShowLoteModal(true);
                            setShowProductoModal(false);
                        } catch (error) {
                            console.error('❌ Error al obtener lotes del producto:', error);
                        }
                    } else {
                        const fechaVencimientoFormateada = producto.ultima_fecha_vencimiento
                            ? new Date(producto.ultima_fecha_vencimiento).toISOString().split('T')[0]
                            : '';

                        setDetalles(prev => {
                            const idxExistente = prev.findIndex(d => d.idproducto === producto.idproducto);

                            if (idxExistente !== -1) {
                                const updated = [...prev];

                                // ✅ Para productos CAJA, sumar cajas en lugar de cantidad directa
                                if (producto.unidad_medida === 'CAJA') {
                                    const cajasActuales = parseFloat(updated[idxExistente].cant_cajas_vender || '0');
                                    updated[idxExistente].cant_cajas_vender = cajasActuales + 1;

                                    // Recalcular cantidad total
                                    const cajasVender = parseFloat(updated[idxExistente].cant_cajas_vender || '0');
                                    const unidadesSueltas = parseFloat(updated[idxExistente].cant_unidades_sueltas || '0');
                                    const cantPorCaja = parseFloat(updated[idxExistente].cant_p_caja || '0');
                                    updated[idxExistente].cantidad = (cajasVender * cantPorCaja) + unidadesSueltas;
                                } else {
                                    updated[idxExistente].cantidad = (
                                        parseFloat(updated[idxExistente].cantidad || '0') +
                                        parseFloat(producto.cantidad || '0')
                                    ).toString();
                                }

                                return updated;
                            } else {
                                // ✅ Nuevo producto: inicializar campos según tipo
                                const nuevoDetalle: any = {
                                    idproducto: producto.idproducto,
                                    nombre_producto: producto.nombre_producto,
                                    cantidadMaximo: producto.cantidadMaximo || cantidadMaximo,
                                    precio_venta: producto.precio_venta || '',
                                    precio_compra: producto.precio_compra || '',
                                    fecha_vencimiento: fechaVencimientoFormateada,
                                    unidad_medida: producto.unidad_medida || '',
                                    iva: producto.iva || '',
                                    descuento: 0,
                                };

                                // ✅ Si es producto tipo CAJA, agregar campos específicos
                                if (producto.unidad_medida === 'CAJA') {
                                    nuevoDetalle.cant_cajas_vender = 0;
                                    nuevoDetalle.cant_unidades_sueltas = 0;
                                    nuevoDetalle.cant_p_caja = producto.cant_p_caja || 0;
                                    nuevoDetalle.precio_venta_caja = producto.precio_venta_caja || 0;
                                    nuevoDetalle.cantidad = 0; // Se calculará cuando ingrese cajas/unidades
                                } else {
                                    nuevoDetalle.cantidad = producto.cantidad || 1;
                                }

                                return [...prev, nuevoDetalle];
                            }
                        });

                        setShowProductoModal(false);
                    }
                }}
            />

            <ModalSeleccionarCliente
                isOpen={showClienteModal}
                onClose={() => setShowClienteModal(false)}
                onSelect={(cliente: any) => {
                    setClienteSeleccionado(cliente);
                    setVenta(prev => ({ ...prev, idcliente: cliente.idcliente }));
                    setShowClienteModal(false);
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

            <ModalAdvert
                isOpen={advertModalOpen}
                onClose={() => setAdvertModalOpen(false)}
                message={advertMessage}
            />

            <ModalComprobante
                isVenta={true}
                montoTotalDescuento={montoDescuentoTotal}
                tipoDescuento={tipoDescuento}
                isOpen={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                datos={comprobanteData}
                productos={comprobanteProductos}
            />

            <ModalError
                isOpen={errorModalOpen}
                onClose={() => {
                    setErrorModalOpen(false);
                    setErrorProductos([]);
                }}
                message={errorMessage}
                showTable={errorProductos.length > 0}
                productos={errorProductos}
            />

            <ModalSeleccionarLote
                setCantidadMaximo={setCantidadMaximo}
                isOpen={showLoteModal}
                onClose={() => setShowLoteModal(false)}
                lotes={lotesProducto}
                onSelect={(loteSeleccionado) => {
                    const yaExiste = detalles.some(
                        (detalle) => detalle.iddetalle_lote === loteSeleccionado.iddetalle
                    );

                    if (yaExiste) {
                        const detallesActualizados = detalles.map((detalle) => {
                            if (detalle.iddetalle_lote === loteSeleccionado.iddetalle) {
                                return {
                                    ...detalle,
                                    cantidad: detalle.cantidad + 1,
                                };
                            }
                            return detalle;
                        });
                        setDetalles(detallesActualizados);
                    } else {
                        const nuevoDetalle: any = {
                            idproducto: loteSeleccionado.idproducto,
                            nombre_producto: loteSeleccionado.nombre_producto,
                            precio_venta: loteSeleccionado.precio_venta,
                            cantidadMaximo: loteSeleccionado.stock_restante,
                            precio_compra: loteSeleccionado.precio_compra,
                            fecha_vencimiento: loteSeleccionado.fecha_vencimiento,
                            unidad_medida: loteSeleccionado.unidad_medida,
                            iva: loteSeleccionado.iva,
                            iddetalle_lote: loteSeleccionado.iddetalle,
                            descuento: 0,
                        };

                        // ✅ Si es CAJA, inicializar campos específicos
                        if (loteSeleccionado.unidad_medida === 'CAJA') {
                            nuevoDetalle.cant_p_caja = loteSeleccionado.cant_p_caja || 0;
                            nuevoDetalle.precio_venta_caja = loteSeleccionado.precio_venta_caja || 0;
                            nuevoDetalle.cantidad = 0;
                        } else {
                            nuevoDetalle.cantidad = loteSeleccionado.unidad_medida === "KG" ? 0.1
                                : loteSeleccionado.unidad_medida === "L" ? 0.1
                                    : 1;
                        }

                        setDetalles((prev) => [...prev, nuevoDetalle]);
                    }

                    setShowLoteModal(false);
                }}
            />
        </KeyboardAvoidingView>
    );
};

export default CrearVenta;