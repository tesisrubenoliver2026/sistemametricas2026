'use client';

import { useState, useEffect } from 'react';
import FormVenta from './CrearVenta/FormVenta';
import DetallesProductos from './CrearVenta/DetallesProductos';
import TotalVenta from './CrearVenta/TotalVenta';
import ModalSimuladorCuotas from './ModalsVenta/ModalSimuladorCuotas';
import ModalSeleccionarLote from './ModalsVenta/ModalSeleccionarLote';
import ModalAdvert from '../../components/ModalAdvert';
import ModalSeleccionarProducto from '../../compras/components/Modals/ModalSeleccionarProducto';
import ModalSeleccionarCliente from './ModalsVenta/ModalSeleccionarCliente';
import ModalConfirmarProductos from '../../compras/components/CompraRapida/ModalsCompraRapida/ModalConfirmarProductos';
import ModalComprobante from '../../compras/components/CompraRapida/ModalsCompraRapida/ModalComprobante';
import ModalError from '../../components/ModalError';
import ModalVisualizarPDFs from './ModalsVenta/ModalVisualizarPDFs';
import { FaSave, FaPlus, FaShoppingCart } from 'react-icons/fa';
import { crearVenta, obtenerConfiguracionVenta, validarVencimientoPorLote, validarVencimientoSimulado, obtenerLotesProducto } from '../../services/ventas';
import { usuarioTieneFacturadorActivo } from '../../services/facturador';

interface CrearVentaProps {
    onSuccess?: () => void;
}

const fechaActual = new Date();
const fechaParaguay = [
    fechaActual.getFullYear(),
    String(fechaActual.getMonth() + 1).padStart(2, '0'),
    String(fechaActual.getDate()).padStart(2, '0'),
].join('-');

const initialVenta = {
    idcliente: null,
    fecha: fechaParaguay,
    tipo: 'contado',
    tipo_comprobante: 'T',
    nro_factura: '',
    estado: 'pagado',
    total_descuento: 0,
    observacion: '',
    idformapago: 1,
    datos_bancarios: null,
    fecha_vencimiento: '',
    //   Campos de cuotas (solo para ventas a crédito)
    cant_cuota: 1,
    tasa_interes_anual: 0,
    dia_fecha_pago: 15
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
    const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
    const [venta, setVenta] = useState(initialVenta);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<any | null>(null);
    const [detalles, setDetalles] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [showSimuladorCuotas, setShowSimuladorCuotas] = useState(false);

    // Estados para el modal de visualización de PDFs
    const [showPDFsModal, setShowPDFsModal] = useState(false);
    const [facturaPDFBase64, setFacturaPDFBase64] = useState<string | null>(null);
    const [pagarePDFBase64, setPagarePDFBase64] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfiguraciones = async () => {
            try {
                const config = await obtenerConfiguracionVenta();
                setConfigVentaPorLote(config.sistema_venta_por_lote);
                setConfigVentaFechaVencimiento(config.venta_fecha_vencimiento);
            } catch (error) {
                console.error('  Error al cargar configuraciones', error);
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
        setMontoDescuentoTotal(descuentoTotal);
        setTotal(nuevoTotal);
    }, [detalles]);

    const handleSubmit = async () => {
        try {
            const tieneFacturadorActivo = await usuarioTieneFacturadorActivo();
            if (!tieneFacturadorActivo) {
                setErrorMessage('No tenes un facturador activo para tu usuario. No se puede registrar la venta.');
                setErrorProductos([]);
                setErrorModalOpen(true);
                return;
            }
        } catch (error) {
            console.error('Error al validar facturador activo:', error);
            setErrorMessage('No se pudo validar el facturador activo del usuario.');
            setErrorProductos([]);
            setErrorModalOpen(true);
            return;
        }

        if (venta.idformapago === 2 && !venta.datos_bancarios) {
            setAdvertMessage('⚠️ Debes seleccionar los datos bancarios para realizar la venta con transferencia.');
            setAdvertModalOpen(true);
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
            idlote: d.idlote,
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
            //   Incluir detalle del producto (atributos)
            detalle_producto: d.detalle_producto || null,
            iddetalle: d.detalle_producto?.iddetalle || null,
        }));

        const idcliente = venta.idcliente ? Number(venta.idcliente) : null;

        const payload = {
            venta: { ...venta, idcliente, total, total_descuento: Number(montoDescuentoTotal) || 0 },
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

            // Guardar PDFs en el estado y abrir modal
            if (response.data?.facturaPDFBase64 || response.data?.pagarePDFBase64) {
                setFacturaPDFBase64(response.data.facturaPDFBase64 || null);
                setPagarePDFBase64(response.data.pagarePDFBase64 || null);
                setShowPDFsModal(true);
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
            const errorMessage = error.response.data.error || 'Error al registrar la venta';
            setErrorMessage(errorMessage);
            setErrorProductos([]);
            setErrorModalOpen(true);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md overflow-auto">
            <form onSubmit={(e) => {
                e.preventDefault();
                setConfirmModalOpen(true);
            }} className='flex flex-row gap-5'>
                <div>
                    <TotalVenta total={total} descuento_total={Number(montoDescuentoTotal) || 0} />
                    <div className='p-2 flex flex-row gap-3'>         
                        <div className="space-y-2 border border-blue-400/20 rounded-md">
                            <div className="dark:bg-gray-600 bg-blue-500 rounded-t-md p-4">
                                <div className="flex items-center gap-3">
                                    <div className="dark:bg-gray-600 bg-white/20 p-2 rounded-lg">
                                        <FaShoppingCart className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-white uppercase">Nueva Venta</h1>
                                        <p className="text-sm text-blue-100">Registrá una nueva venta al sistema</p>
                                    </div>
                                </div>
                            </div>
                            <FormVenta
                                setMontoDescuentoTotal={setMontoDescuentoTotal}
                                montoDescuentoTotal={montoDescuentoTotal}
                                setTipoDescuento={setTipoDescuento}
                                tipoDescuento={tipoDescuento}
                                venta={venta}
                                setVenta={setVenta}
                                clienteSeleccionado={clienteSeleccionado}
                                openClienteModal={() => setShowClienteModal(true)}
                                openSimuladorCuotas={() => setShowSimuladorCuotas(true)}
                                totalVenta={total - (Number(montoDescuentoTotal) || 0)}
                            />
                            <div className="flex justify-center items-center gap-3 p-4 pt-0">
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow flex items-center gap-2">
                                    <FaSave size={16} />
                                    Registrar venta
                                </button>
                                <button onClick={() => setShowProductoModal(true)} type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2">
                                    <FaPlus size={16} />
                                    Seleccionar producto
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col w-[520px]">
                            <DetallesProductos
                                tipoDescuento={tipoDescuento}
                                setCantidadProducto={setCantidadProducto}
                                detalles={detalles}
                                setDetalles={setDetalles}
                            />
                        </div>
                        

                    </div>
                </div>

            </form>

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
                            // Guardar información del producto seleccionado
                            setProductoSeleccionado({
                                idproducto: producto.idproducto,
                                nombre_producto: producto.nombre_producto,
                                precio_venta: producto.precio_venta,
                                precio_compra: producto.lote_pr_compr_rec,
                                unidad_medida: producto.unidad_medida,
                                iva: producto.iva,
                                precio_venta_caja: producto.precio_venta_caja,
                                cant_p_caja: producto.cant_p_caja,
                            });
                            const res = await obtenerLotesProducto(producto.idproducto);
                            const lotes = res.data.lotes || [];
                            setLotesProducto(lotes);
                            setShowLoteModal(true);
                            setShowProductoModal(false)
                        } catch (error) {
                            console.error('  Error al obtener lotes del producto:', error);
                        }
                    } else {
                        const fechaVencimientoFormateada = producto.ultima_fecha_vencimiento
                            ? new Date(producto.ultima_fecha_vencimiento).toISOString().split('T')[0]
                            : '';

                        setDetalles(prev => {
                            const idxExistente = prev.findIndex(d => d.idproducto === producto.idproducto);

                            if (idxExistente !== -1) {
                                const updated = [...prev];

                                //   Para productos CAJA, sumar cajas en lugar de cantidad directa
                                if (producto.unidad_medida === 'CAJA') {
                                    const cajasActuales = parseFloat(updated[idxExistente].cant_cajas_vender || '0');
                                    const cantidadAAgregar = cantidadProducto || 1;
                                    updated[idxExistente].cant_cajas_vender = cajasActuales + cantidadAAgregar;

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
                                //   Nuevo producto: inicializar campos según tipo
                                const nuevoDetalle: any = {
                                    idproducto: producto.idproducto,
                                    nombre_producto: producto.nombre_producto,
                                    cantidadMaximo: producto.cantidadMaximo || cantidadMaximo,
                                    precio_venta: producto.precio_venta || '',
                                    precio_compra: producto.lote_pr_compr_rec || '',
                                    fecha_vencimiento: fechaVencimientoFormateada,
                                    unidad_medida: producto.unidad_medida || '',
                                    iva: producto.iva || '',
                                    descuento: 0,
                                    // Usar lotenumreciente del producto como numero_lote
                                    numero_lote: producto.lotenumreciente || null,
                                };

                                //   Si es producto tipo CAJA, agregar campos específicos
                                if (producto.unidad_medida === 'CAJA') {
                                    // Usar la cantidad ingresada por el usuario (cantidadProducto) o 1 por defecto
                                    const cajasIniciales = cantidadProducto || 1;
                                    nuevoDetalle.cant_cajas_vender = cajasIniciales;
                                    nuevoDetalle.cant_unidades_sueltas = 0;
                                    nuevoDetalle.cant_p_caja = producto.cant_p_caja || 0;
                                    nuevoDetalle.precio_venta_caja = producto.precio_venta_caja || 0;
                                    // Calcular la cantidad total de unidades
                                    const cantPorCaja = parseFloat(producto.cant_p_caja || '0');
                                    nuevoDetalle.cantidad = cajasIniciales * cantPorCaja;
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

            <ModalSimuladorCuotas
                isOpen={showSimuladorCuotas}
                onClose={() => setShowSimuladorCuotas(false)}
                monto_financiar={total - (Number(montoDescuentoTotal) || 0)}
                cant_cuota={venta.cant_cuota}
                tasa_interes_anual={venta.tasa_interes_anual}
                dia_fecha_pago={venta.dia_fecha_pago}
            />

            <ModalSeleccionarLote
                setCantidadMaximo={setCantidadMaximo}
                isOpen={showLoteModal}
                onClose={() => setShowLoteModal(false)}
                lotes={lotesProducto}
                detalles={detalles}
                productoInfo={productoSeleccionado}
                onSelect={(loteSeleccionado) => {
                    const yaExiste = detalles.some(
                        (detalle) => detalle.idlote === loteSeleccionado.idlote
                    );

                    if (yaExiste) {
                        const detallesActualizados = detalles.map((detalle) => {
                            if (detalle.idlote === loteSeleccionado.idlote) {
                                //   Si es CAJA, incrementar cajas y recalcular cantidad total
                                if (detalle.unidad_medida === 'CAJA') {
                                    const cajasActuales = parseFloat(detalle.cant_cajas_vender || '0');
                                    const cantidadAAgregar = cantidadProducto || 1;
                                    const nuevasCajas = cajasActuales + cantidadAAgregar;
                                    const unidadesSueltas = parseFloat(detalle.cant_unidades_sueltas || '0');
                                    const cantPorCaja = parseFloat(detalle.cant_p_caja || '0');

                                    return {
                                        ...detalle,
                                        cant_cajas_vender: nuevasCajas,
                                        cantidad: (nuevasCajas * cantPorCaja) + unidadesSueltas,
                                    };
                                } else {
                                    return {
                                        ...detalle,
                                        cantidad: detalle.cantidad + (cantidadProducto || 1),
                                    };
                                }
                            }
                            return detalle;
                        });
                        setDetalles(detallesActualizados);
                    } else {
                        const nuevoDetalle: any = {
                            idproducto: loteSeleccionado.idproducto,
                            nombre_producto: loteSeleccionado.nombre_producto,
                            precio_venta: loteSeleccionado.precio_venta,
                            cantidadMaximo: loteSeleccionado.stock_actual,
                            precio_compra: loteSeleccionado.precio_compra,
                            fecha_vencimiento: loteSeleccionado.fecha_vencimiento,
                            unidad_medida: loteSeleccionado.unidad_medida,
                            iva: loteSeleccionado.iva,
                            idlote: loteSeleccionado.idlote,
                            numero_lote: loteSeleccionado.numero_lote,
                            descuento: 0,
                        };

                        //   Si es CAJA, inicializar campos específicos
                        if (loteSeleccionado.unidad_medida === 'CAJA') {
                            // Usar la cantidad ingresada por el usuario (cantidadProducto) para inicializar cajas
                            const cajasIniciales = cantidadProducto || 1;
                            nuevoDetalle.cant_cajas_vender = cajasIniciales;
                            nuevoDetalle.cant_unidades_sueltas = 0;
                            nuevoDetalle.cant_p_caja = loteSeleccionado.cant_p_caja || 0;
                            nuevoDetalle.precio_venta_caja = loteSeleccionado.precio_venta_caja || 0;
                            // Calcular la cantidad total de unidades
                            const cantPorCaja = Number(loteSeleccionado.cant_p_caja) || 0;
                            nuevoDetalle.cantidad = cajasIniciales * cantPorCaja;
                        } else {
                            nuevoDetalle.cantidad = loteSeleccionado.unidad_medida === "KG" ? 0.1
                                : loteSeleccionado.unidad_medida === "L" ? 0.1
                                    : (cantidadProducto || 1);
                        }

                        setDetalles((prev) => [...prev, nuevoDetalle]);
                    }

                    setShowLoteModal(false);
                }}
            />

            <ModalVisualizarPDFs
                isOpen={showPDFsModal}
                onClose={() => {
                    setShowPDFsModal(false);
                    setFacturaPDFBase64(null);
                    setPagarePDFBase64(null);
                }}
                facturaPDF={facturaPDFBase64}
                pagarePDF={pagarePDFBase64}
            />
        </div >
    );
};

export default CrearVenta;
