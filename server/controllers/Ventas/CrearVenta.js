// controllers/Ventas/CrearVenta.js
import Venta from '../../models/Venta/Ventas.js';
import DetalleVenta from '../../models/Venta/DetalleVenta.js';
import DetalleCompra from '../../models/Compra/DetalleCompra.js';
import LoteProducto from '../../models/LoteProducto.js';
import MovimientoCaja from '../../models/MovimientoCaja.js';
import Producto from '../../models/Producto/Producto.js';
import Facturador from '../../models/facturadorModel.js';
import DeudaVenta from '../../models/Venta/DeudaVenta.js';
import DetalleCuotasVenta from '../../models/Venta/DetalleCuotasVenta.js';
import Ingreso from '../../models/Movimiento/Ingreso.js';
import Cliente from '../../models/Cliente.js';
import DatosTransferenciaVenta from '../../models/DatosBancarios/DatosTransferenciaVenta.js';
import DetalleChequeVenta from '../../models/Venta/DetalleChequeVenta.js';
import DetalleTarjetaVenta from '../../models/Venta/DetalleTarjetaVenta.js';
import { generarFacturaEmbebida } from '../../report/reportFactura.js';
import { generarPagareEmbebido } from '../../report/reportPagare.js';
import { restarStockDirecto } from './helpers/restarStockDirecto.js';
import { ToWords } from 'to-words';
import { getUserId } from '../../utils/getUserId.js';
import Funcionario from '../../models/Funcionario.js';
import { generarPlanCuotasFrances } from './helpers/generarPlanCuotasFrances.js';
import { resolveClienteParaVenta } from './helpers/clienteUniversal.js';

const incrementarNroFactura = (nroActual) => {
  const partes = nroActual.split('-');
  const numero = parseInt(partes[2], 10) + 1;
  return `${partes[0]}-${partes[1]}-${numero.toString().padStart(7, '0')}`;
};

const talonarioAgotado = (actual, final) => {
  const numActual = parseInt(actual.split('-')[2]);
  const numFinal = parseInt(final.split('-')[2]);
  return numActual > numFinal;
};

export const createVenta = (req, res) => {
  console.log("Entra al controller")
  const { venta, detalles, sistema_venta_por_lote, tipoDescuento } = req.body;

  // ✅ Aplicar descuento total si corresponde
  let ventaConDescuento = { ...venta };
  let detallesConDescuento = [...detalles];
  ventaConDescuento.idcliente =
    ventaConDescuento.idcliente ??
    ventaConDescuento.clienteId ??
    ventaConDescuento.clienteid ??
    null;

  if (tipoDescuento === 'descuento_total' && venta.total_descuento) {
    const totalOriginal = parseFloat(venta.total);
    const descuento = parseFloat(venta.total_descuento);
    const totalConDescuento = totalOriginal - descuento;

    // Validar que el total no sea negativo
    if (totalConDescuento < 0) {
      return res.status(400).json({
        error: `⚠️ El descuento (${descuento}) no puede ser mayor al total (${totalOriginal})`
      });
    }

    ventaConDescuento.total = totalConDescuento;

    // ✅ NUEVO: Distribuir el descuento proporcionalmente entre productos
    detallesConDescuento = detalles.map(item => {
      const cantidad = parseFloat(item.cantidad);
      const precioVenta = parseFloat(item.precio_venta);
      const subtotalOriginal = precioVenta * cantidad;

      // Calcular proporción de este producto respecto al total
      const proporcion = subtotalOriginal / totalOriginal;
      const descuentoProporcional = descuento * proporcion;

      return {
        ...item,
        descuento_calculado: descuentoProporcional,
        subtotal_con_descuento: subtotalOriginal - descuentoProporcional
      };
    });

    console.log(`📊 Descuento total distribuido proporcionalmente: ${totalOriginal} - ${descuento} = ${totalConDescuento}`);

  } else if (tipoDescuento === 'descuento_producto' && venta.total_descuento) {
    const totalOriginal = parseFloat(venta.total);
    const descuento = parseFloat(venta.total_descuento);
    const totalConDescuento = totalOriginal - descuento;

    // Validar que el total no sea negativo
    if (totalConDescuento < 0) {
      return res.status(400).json({
        error: `⚠️ El descuento (${descuento}) no puede ser mayor al total (${totalOriginal})`
      });
    }

    ventaConDescuento.total = totalConDescuento;

    // ✅ Para descuento_producto, usar los descuentos que ya vienen en el payload
    detallesConDescuento = detalles.map(item => ({
      ...item,
      descuento_calculado: parseFloat(item.descuento || 0)
    }));

    console.log(`📊 Descuento por producto aplicado: ${totalOriginal} - ${descuento} = ${totalConDescuento}`);
  }

  // Obtener usuario/funcionario autenticado
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  // Helper para buscar movimiento abierto
  const buscarMovimiento = (idsusuarios, idfuncionariosIds) => {
    MovimientoCaja.getMovimientoAbierto(idusuarios, idfuncionariosIds, (errMov, movimientoResult) => {
      if (errMov) return res.status(500).json({ error: '❌ Error al buscar movimiento de caja' });
      if (!movimientoResult.length) return res.status(400).json({ error: '⚠️ No hay movimiento abierto' });

      const idmovimiento = movimientoResult[0].idmovimiento;

    Venta.getLastTicket((errTicket, ultimoTicketResult) => {
      if (errTicket) return res.status(500).json({ error: '❌ Error al obtener último ticket' });

      const nuevoTicket = (ultimoTicketResult || 0) + 1;

      Facturador.findActivo((errFactAlt, factAltResult) => {
        if (errFactAlt || !factAltResult.length) {
          return res.status(400).json({ error: '⚠️ No hay facturador activo disponible' });
        }

        const facturador = factAltResult[0];
        const nroDisponible = facturador.nro_factura_disponible || facturador.nro_factura_inicial_habilitada;

        resolveClienteParaVenta(req, ventaConDescuento.idcliente)
          .then((clienteData) => {
            ventaConDescuento.idcliente = clienteData.idcliente;
            ventaConDescuento.nombre_cliente = `${clienteData.nombre} ${clienteData.apellido}`.trim();
            ventaConDescuento.documento_cliente = clienteData.numDocumento;

            console.log("Cliente encontrado:", clienteData);
          if (ventaConDescuento.tipo_comprobante === 'F') {
            if (talonarioAgotado(nroDisponible, facturador.nro_factura_final_habilitada)) {
              return res.status(400).json({ error: '⚠️ Se ha alcanzado el límite del talonario.' });
            }

            const nroFacturaGenerado = nroDisponible;
            const siguienteNro = incrementarNroFactura(nroFacturaGenerado);
            const nuevasUtilizadas = (facturador.facturas_utilizadas || 0) + 1;

            Facturador.actualizarNumeroFactura(facturador.idfacturador, siguienteNro, nuevasUtilizadas, (errUpdate) => {
              if (errUpdate) return res.status(500).json({ error: '❌ Error al actualizar número de factura' });
              continuarProceso(facturador, nroFacturaGenerado, nuevoTicket);
            });
          } else {
            continuarProceso(facturador, null, nuevoTicket);
          }

          async function continuarProceso(facturador, nroFactura, nroTicket) {
            const toWords = new ToWords({
              localeCode: 'es-ES',
              converterOptions: {
                currency: true,
                ignoreDecimal: false,
                ignoreZeroCurrency: false,
                doNotAddOnly: false,
                currencyOptions: {
                  name: 'guaraní',
                  plural: 'guaraníes',
                  symbol: '₲',
                  fractionalUnit: {
                    name: 'céntimo',
                    plural: 'céntimos',
                    symbol: '',
                  },
                },
              },
            });

            const { idusuarios, idfuncionario } = getUserId(req);
            if (!idusuarios && !idfuncionario) {
              return res.status(401).json({ error: 'Usuario no autenticado' });
            }

            // ✅ Calcular IVA antes de crear la venta
            let totalIVA5 = 0;
            let totalIVA10 = 0;

            detallesConDescuento.forEach(item => {
              const cantidad = parseFloat(item.cantidad);
              const precioVenta = parseFloat(item.precio_venta);
              const iva = parseFloat(item.iva);
              const subtotal = cantidad * precioVenta;

              if (iva === 5) {
                totalIVA5 += subtotal / 21; // IVA 5%
              } else if (iva === 10) {
                totalIVA10 += subtotal / 11; // IVA 10%
              }
            });

            const totalIVA = totalIVA5 + totalIVA10;

            const ventaConDatos = {
              ...ventaConDescuento, // ✅ Usar la venta con descuento aplicado
              idmovimiento,
              idusuarios,
              idfuncionario,
              nro_factura: ventaConDescuento.tipo_comprobante === 'F' ? nroFactura : '',
              nro_ticket: nroTicket,
              tipo_comprobante: ventaConDescuento.tipo_comprobante === 'F' ? 'Factura' : 'Ticket',
              idfacturador: facturador.idfacturador,
              idformapago: ventaConDescuento.idformapago || null,
              nombre_fantasia_facturador: facturador.nombre_fantasia,
              ruc_facturador: facturador.ruc,
              timbrado_nro_facturador: facturador.timbrado_nro,
              fecha_inicio_vigente_facturador: facturador.fecha_inicio_vigente,
              fecha_fin_vigente_facturador: facturador.fecha_fin_vigente,
              totalletras: toWords.convert(ventaConDescuento.total || 0), // ✅ Usar total con descuento
              estado: 'activo',
              // ✅ Agregar campos de IVA calculados
              iva5: totalIVA5,
              iva10: totalIVA10,
              totaliva: totalIVA,
              // ✅ Agregar campos de descuento para guardar en BD
              tipo_descuento: tipoDescuento || 'sin_descuento',
              total_descuento: ventaConDescuento.total_descuento || 0,
              total_original: venta.total, // Guardar el total original
            };

            try {
              if (sistema_venta_por_lote) {
                for (const item of detallesConDescuento) {
                  if (!item.idlote) {
                    return res.status(400).json({
                      error: `❌ Debe seleccionar un lote para el producto ${item.nombre_producto}`
                    });
                  }

                  // Si idlote es -1, significa que es un lote nuevo y lo saltamos en la validación
                  // El lote se creará más adelante cuando se procese el detalle
                  if (item.idlote === -1) {
                    if (!item.numero_lote) {
                      return res.status(400).json({
                        error: `❌ Debe proporcionar un número de lote para ${item.nombre_producto}`
                      });
                    }
                    continue; // No validamos stock para lotes nuevos
                  }

                  // Verificar stock suficiente en el lote existente
                  const loteInfo = await new Promise((resolve, reject) => {
                    LoteProducto.findById(item.idlote, (err, results) => {
                      if (err) return reject(err);
                      if (!results || results.length === 0) {
                        return reject(new Error(`Lote ${item.idlote} no encontrado`));
                      }
                      resolve(results[0]);
                    });
                  });

                  if (loteInfo.stock_actual < item.cantidad) {
                    return res.status(400).json({
                      error: `❌ Stock insuficiente para el lote ${loteInfo.numero_lote}. Disponible: ${loteInfo.stock_actual}, Requerido: ${item.cantidad}`
                    });
                  }
                }
              }

              Venta.create(ventaConDatos, async (errVenta, ventaResult) => {
                if (errVenta) {
                  console.error('❌ Error al crear venta:', errVenta);
                  console.error('📋 Datos de la venta:', JSON.stringify(ventaConDatos, null, 2));
                  return res.status(500).json({ error: '❌ Error al crear venta', details: errVenta.message });
                }

                const idventa = ventaResult.insertId;

                if (ventaConDescuento.idformapago === 2 && ventaConDescuento.datos_bancarios) {
                  const datosTransferencia = {
                    idventa,
                    banco_origen: ventaConDescuento.datos_bancarios.banco_origen,
                    numero_cuenta: ventaConDescuento.datos_bancarios.numero_cuenta,
                    tipo_cuenta: ventaConDescuento.datos_bancarios.tipo_cuenta,
                    titular_cuenta: ventaConDescuento.datos_bancarios.titular_cuenta,
                    observacion: ventaConDescuento.datos_bancarios.observacion || '',
                  };

                  const iddato_transferencia_venta = await new Promise((resolve, reject) => {
                    DatosTransferenciaVenta.create(datosTransferencia, (err, result) => {
                      if (err) return reject(err);
                      resolve(result.insertId);
                    });
                  });

                  await new Promise((resolve, reject) => {
                    Venta.updateDatoTransferencia(idventa, iddato_transferencia_venta, (err) => {
                      if (err) return reject(err);
                      resolve();
                    });
                  });
                }

                if (ventaConDescuento.idformapago === 3 && ventaConDescuento.detalle_cheque) {
                  console.log('📌 detalle_cheque recibido:', ventaConDescuento.detalle_cheque);
                  const detalle_cheque_venta = {
                    idventa,
                    banco: ventaConDescuento.detalle_cheque.banco,
                    nro_cheque: ventaConDescuento.detalle_cheque.nro_cheque,
                    monto: ventaConDescuento.detalle_cheque.monto,
                    fecha_emision: ventaConDescuento.detalle_cheque.fecha_emision,
                    fecha_vencimiento: ventaConDescuento.detalle_cheque.fecha_vencimiento || '',
                    titular: ventaConDescuento.detalle_cheque.titular
                  };

                  const iddetalle_cheque_venta = await new Promise((resolve, reject) => {
                    DetalleChequeVenta.create(detalle_cheque_venta, (err, result) => {
                      if (err) return reject(err);
                      resolve(result.insertId);
                    });
                  });

                  await new Promise((resolve, reject) => {
                    Venta.updateDetalleCheque(idventa, iddetalle_cheque_venta, (err) => {
                      if (err) return reject(err);
                      resolve();
                    });
                  });
                }

                if (ventaConDescuento.idformapago === 4 && ventaConDescuento.detalle_tarjeta) {
                  const datosTarjeta = {
                    idventa,
                    tipo_tarjeta: ventaConDescuento.detalle_tarjeta.tipo_tarjeta,
                    entidad: ventaConDescuento.detalle_tarjeta.entidad || '',
                    monto: ventaConDescuento.detalle_tarjeta.monto,
                  };

                  const iddetalle_tarjeta_venta = await new Promise((resolve, reject) => {
                    DetalleTarjetaVenta.create(datosTarjeta, (err, result) => {
                      if (err) return reject(err);
                      resolve(result.insertId);
                    });
                  });

                  await new Promise((resolve, reject) => {
                    Venta.updateDetalleCheque(idventa, iddetalle_tarjeta_venta, (err) => {
                      if (err) return reject(err);
                      resolve();
                    });
                  });
                }

                try {
                  for (const item of detallesConDescuento) {
                    const cantidad = parseFloat(item.cantidad);

                    // ✅ Calcular subtotal según tipo de producto
                    let subtotalItem = 0;
                    if (item.unidad_medida === 'CAJA') {
                      const cajasVender = parseFloat(item.cant_cajas_vender || 0);
                      const unidadesSueltas = parseFloat(item.cant_unidades_sueltas || 0);
                      const precioVentaCaja = parseFloat(item.precio_venta_caja || 0);
                      const precioVentaUnitario = parseFloat(item.precio_venta || 0);

                      subtotalItem = (cajasVender * precioVentaCaja) + (unidadesSueltas * precioVentaUnitario);
                    } else {
                      subtotalItem = parseFloat(item.precio_venta || 0) * cantidad;
                    }

                    if (sistema_venta_por_lote && item.idlote) {
                      let idloteReal = item.idlote;
                      let precioCompraLote = 0;
                      let numeroLote = item.numero_lote || '';

                      // Si idlote es -1, crear un nuevo lote temporal para la venta
                      if (item.idlote === -1) {
                        // NOTA: Para lotes nuevos creados desde ventas, no creamos el lote en lotes_producto
                        // porque no hay detalle_compra asociado. Simplemente guardamos idlote como NULL
                        // y el numero_lote en un campo adicional del detalle de venta
                        idloteReal = null;
                        // Para lotes nuevos, usar precio_compra del payload (no hay registro en BD)
                        precioCompraLote = parseFloat(item.precio_compra) || 0;
                      } else {
                        // ✅ NUEVO: Obtener precio_compra del lote desde la BD
                        const loteInfo = await new Promise((resolve, reject) => {
                          LoteProducto.findById(item.idlote, (err, results) => {
                            if (err) return reject(err);
                            resolve(results && results.length > 0 ? results[0] : null);
                          });
                        });

                        if (loteInfo) {
                          precioCompraLote = parseFloat(loteInfo.precio_compra) || 0;
                          numeroLote = loteInfo.numero_lote || '';
                          console.log(`💰 Lote ${numeroLote} (ID: ${item.idlote}): precio_compra del lote = ${precioCompraLote}`);
                        }
                      }

                      // ✅ Calcular ganancia con precio_compra del lote
                      const costoLote = precioCompraLote * cantidad;
                      const descuentoItem = parseFloat(item.descuento_calculado || 0);
                      const gananciaLote = ventaConDescuento.tipo.toLowerCase() === 'credito'
                        ? 0
                        : subtotalItem - costoLote - descuentoItem;

                      console.log(`📊 Detalle ganancia lote ${numeroLote}: subtotal=${subtotalItem}, costo=${costoLote}, descuento=${descuentoItem}, ganancia=${gananciaLote}`);

                      const detalle = {
                        idventa,
                        idproducto: item.idproducto,
                        nombre_producto: item.nombre_producto,
                        cantidad,
                        precio_venta: item.precio_venta,
                        precio_compra: precioCompraLote, // ✅ CAMBIO: Usar precio_compra del lote
                        descuento: descuentoItem,
                        ganancia: gananciaLote, // ✅ CAMBIO: Usar ganancia calculada con precio del lote
                        sub_total: tipoDescuento === 'descuento_total'
                          ? item.subtotal_con_descuento
                          : subtotalItem - descuentoItem,
                        idlote: idloteReal,
                        numero_lote: numeroLote, // ✅ NUEVO: Guardar número de lote
                        // ✅ NUEVOS CAMPOS para productos CAJA
                        unidad_medida: item.unidad_medida,
                        precio_venta_caja: item.precio_venta_caja || null,
                        cant_p_caja: item.cant_p_caja || null,
                        cant_cajas_vender: item.cant_cajas_vender || null,
                        cant_unidades_sueltas: item.cant_unidades_sueltas || null,
                      };

                      await new Promise((resolve) => {
                        DetalleVenta.create(detalle, () => resolve());
                      });

                      // ✅ NUEVO: Restar stock del lote solo si es un lote existente (no es nuevo)
                      if (item.idlote !== -1) {
                        await new Promise((resolve, reject) => {
                          LoteProducto.restarStock(item.idlote, item.cantidad, (err) => {
                            if (err) return reject(err);
                            resolve();
                          });
                        });
                      }

                      await new Promise((resolve) => {
                        Producto.restarStock(item.idproducto, item.cantidad, () => resolve());
                      });

                    } else if (!sistema_venta_por_lote) {
                      const resultado = await restarStockDirecto(item.idproducto, cantidad);
                      const totalDescontado = resultado.reduce((acc, r) => acc + r.descontado, 0);

                      if (totalDescontado < cantidad) {
                        return res.status(400).json({ error: `Stock insuficiente para ${item.nombre_producto}` });
                      }

                      for (const afectado of resultado) {
                        const proporcionLote = afectado.descontado / cantidad;
                        let descuentoProporcional = 0;
                        let subtotalConDescuento = 0;

                        // ✅ NUEVO: Usar precio_compra del lote (de la BD), NO del payload
                        const precioCompraLote = parseFloat(afectado.precio_compra) || 0;

                        console.log(`💰 Lote ${afectado.numero_lote}: precio_compra del lote = ${precioCompraLote}, cantidad = ${afectado.descontado}`);

                        // ✅ Calcular subtotal proporcional para productos CAJA
                        let subtotalLote = 0;
                        if (item.unidad_medida === 'CAJA') {
                          const cajasVender = parseFloat(item.cant_cajas_vender || 0);
                          const unidadesSueltas = parseFloat(item.cant_unidades_sueltas || 0);
                          const precioVentaCaja = parseFloat(item.precio_venta_caja || 0);
                          const precioVentaUnitario = parseFloat(item.precio_venta || 0);

                          const subtotalTotal = (cajasVender * precioVentaCaja) + (unidadesSueltas * precioVentaUnitario);
                          subtotalLote = subtotalTotal * proporcionLote;
                        } else {
                          subtotalLote = parseFloat(item.precio_venta || 0) * afectado.descontado;
                        }

                        if (tipoDescuento === 'descuento_total') {
                          descuentoProporcional = (item.descuento_calculado || 0) * proporcionLote;
                          subtotalConDescuento = subtotalLote - descuentoProporcional;
                        } else if (tipoDescuento === 'descuento_producto') {
                          descuentoProporcional = parseFloat(item.descuento || 0) * proporcionLote;
                          subtotalConDescuento = subtotalLote - descuentoProporcional;
                        } else {
                          subtotalConDescuento = subtotalLote;
                        }

                        // ✅ Calcular costo y ganancia usando precio_compra del lote
                        const costoLote = precioCompraLote * afectado.descontado;
                        const gananciaLote = ventaConDescuento.tipo.toLowerCase() === 'credito'
                          ? 0
                          : subtotalLote - costoLote - descuentoProporcional;

                        console.log(`📊 Detalle ganancia lote ${afectado.numero_lote}: subtotal=${subtotalLote}, costo=${costoLote}, descuento=${descuentoProporcional}, ganancia=${gananciaLote}`);

                        const detalle = {
                          idventa,
                          idproducto: item.idproducto,
                          nombre_producto: item.nombre_producto,
                          cantidad: afectado.descontado,
                          precio_venta: item.precio_venta,
                          precio_compra: precioCompraLote, // ✅ CAMBIO: Usar precio_compra del lote
                          descuento: descuentoProporcional,
                          ganancia: gananciaLote, // ✅ CAMBIO: Usar ganancia calculada con precio del lote
                          sub_total: subtotalConDescuento,
                          iddetalle_compra: afectado.iddetalle_compra,
                          idlote: afectado.idlote,
                          numero_lote: afectado.numero_lote, // ✅ NUEVO: Guardar número de lote para referencia
                          // ✅ NUEVOS CAMPOS para productos CAJA
                          unidad_medida: item.unidad_medida,
                          precio_venta_caja: item.precio_venta_caja || null,
                          cant_p_caja: item.cant_p_caja || null,
                          // Proporcional al lote
                          cant_cajas_vender: item.cant_cajas_vender ? (item.cant_cajas_vender * proporcionLote) : null,
                          cant_unidades_sueltas: item.cant_unidades_sueltas ? (item.cant_unidades_sueltas * proporcionLote) : null,
                        };

                        await new Promise((resolve, reject) => {
                          DetalleVenta.create(detalle, (err) => {
                            if (err) return reject(err);
                            resolve();
                          });
                        });
                      }
                    }
                  }

                  // Luego de procesar todos los detalles:
                  if (ventaConDescuento.tipo.toLowerCase() === 'credito') {
                    DetalleVenta.findByVentaId(idventa, (errDetalles, detallesVenta) => {
                      if (errDetalles) return console.error('❌ Error al obtener detalles para deuda:', errDetalles);

                      const costoEmpresa = detallesVenta.reduce((acc, det) => {
                        return acc + parseFloat(det.precio_compra || 0) * parseFloat(det.cantidad || 0);
                      }, 0);

                      // ✅ Extraer datos de cuotas del payload (si existen)
                      const cant_cuota = ventaConDescuento.cant_cuota || 1;
                      const tasa_interes_anual = ventaConDescuento.tasa_interes_anual || 0;
                      const dia_fecha_pago = ventaConDescuento.dia_fecha_pago || 15;
                      const tiene_cuotas = (cant_cuota > 1 && tasa_interes_anual >= 0) ? 'true' : 'false';

                      const nuevaDeuda = {
                        idventa,
                        idcliente: ventaConDescuento.idcliente,
                        total_deuda: ventaConDescuento.total, // ✅ Usar total con descuento
                        total_pagado: 0,
                        saldo: ventaConDescuento.total, // ✅ Usar total con descuento
                        estado: 'pendiente',
                        fecha_deuda: ventaConDescuento.fecha,
                        fecha_pago: null,
                        costo_empresa: costoEmpresa,
                        ganancia_credito: 0,
                        // ✅ NUEVOS CAMPOS DE CUOTAS
                        cant_cuota,
                        tasa_interes_anual,
                        dia_fecha_pago,
                        tiene_cuotas
                      };

                      DeudaVenta.create(nuevaDeuda, (errDeuda, deudaResult) => {
                        if (errDeuda) return console.error('❌ Error al crear deuda_venta:', errDeuda);

                        const iddeuda = deudaResult.insertId;

                        // ✅ Si tiene cuotas, generar plan automáticamente
                        if (tiene_cuotas === 'true') {
                          const params = {
                            iddeuda,
                            idventa,
                            idcliente: ventaConDescuento.idcliente,
                            monto_financiar: ventaConDescuento.total,
                            cant_cuota,
                            tasa_interes_anual,
                            dia_fecha_pago, // Día del mes elegido por el cliente
                            fecha_inicio: new Date()
                          };

                          generarPlanCuotasFrances(params, (errCuotas, resultado) => {
                            if (errCuotas) {
                              console.error('❌ Error al generar plan de cuotas:', errCuotas);
                            } else {
                              console.log('✅ Plan de cuotas generado:', {
                                cuotas: resultado.metadata.cant_cuota,
                                cuota_fija: resultado.metadata.cuota_fija,
                                total_a_pagar: resultado.metadata.total_a_pagar,
                                total_intereses: resultado.metadata.total_intereses
                              });
                            }
                          });
                        }

                        console.log('✅ Deuda de venta registrada correctamente');
                      });
                    });
                  }

                  const OBS_MAX = 255;

                  const resumenProductos = detallesConDescuento
                    .map(item => `${parseFloat(item.cantidad)}x ${item.nombre_producto}`)
                    .join(', ');

                  // ✅ Incluir información del descuento en la observación
                  let observacionBase = `Venta contado ID ${idventa}: ${resumenProductos}`;
                  if (tipoDescuento === 'descuento_total' && venta.total_descuento) {
                    observacionBase += ` (Desc. Total: ${venta.total_descuento})`;
                  } else if (tipoDescuento === 'descuento_producto' && venta.total_descuento) {
                    observacionBase += ` (Desc. Productos: ${venta.total_descuento})`;
                  }

                  const observacionFinal = observacionBase.slice(0, OBS_MAX);

                  if (ventaConDescuento.tipo.toLowerCase() === 'contado') {
                    const ingresoVentaContado = {
                      idventa: idventa,
                      fecha: ventaConDescuento.fecha,
                      hora: ventaConDescuento.hora || null,
                      monto: ventaConDescuento.total, // ✅ Usar total con descuento
                      concepto: `Ingreso por venta contado ID ${idventa}`,
                      idtipo_ingreso: 1,
                      idformapago: ventaConDescuento.idformapago,
                      observacion: observacionFinal,
                      idmovimiento: idmovimiento,
                      creado_por: idfuncionario || idusuarios,
                    };

                    Ingreso.create(ingresoVentaContado, (errIngreso) => {
                      console.log(ingresoVentaContado)
                      if (errIngreso) console.error('❌ Error al registrar ingreso de contado:', errIngreso);
                      else console.log('✅ Ingreso por venta contado registrado.');
                    });
                  }

                  // Obtener totales IVA y generar factura PDF
                  DetalleVenta.findByVentaId(idventa, (errDetallesVenta, detallesDesdeDB) => {
                    if (errDetallesVenta) {
                      console.error('❌ Error al obtener detalles con IVA:', errDetallesVenta);
                      return res.status(500).json({ error: '❌ Error al obtener detalles de venta' });
                    }

                    Venta.getTotalesIVA(idventa, async (errTotales, totalesIVA) => {
                      if (errTotales) {
                        console.error('❌ Error al obtener IVA:', errTotales);
                        return res.status(500).json({ error: '❌ Error al obtener totales de IVA' });
                      }

                      const formatDate = (date) => {
                        if (!date) return '';
                        // Si ya es string ISO "YYYY-MM-DD", parsear sin crear Date para evitar desfase UTC
                        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                          const [year, month, day] = date.split('-');
                          return `${day}-${month}-${year}`;
                        }
                        const d = new Date(date);
                        const day = String(d.getUTCDate()).padStart(2, '0');
                        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
                        const year = d.getUTCFullYear();
                        return `${day}-${month}-${year}`;
                      };

                      const datosFactura = {
                        nombre_fantasia: facturador.nombre_fantasia,
                        ruc: facturador.ruc,
                        timbrado_nro: facturador.timbrado_nro,
                        fecha_inicio_vigente: formatDate(facturador.fecha_inicio_vigente),
                        fecha_fin_vigente: formatDate(facturador.fecha_fin_vigente),
                        nro_factura: ventaConDatos.nro_factura,
                        nro_ticket: ventaConDatos.nro_ticket,
                        fecha: ventaConDescuento.fecha,
                        cliente: ventaConDescuento.nombre_cliente,
                        nro_documento: ventaConDescuento.documento_cliente,
                        total: ventaConDescuento.total, // ✅ Usar total con descuento
                        totalletras: ventaConDatos.totalletras,
                        subtotal_exento: ventaConDescuento.subtotal_exento || 0,
                        subtotal_iva5: totalesIVA.iva5 || 0,
                        subtotal_iva10: totalesIVA.iva10 || 0,
                        total_iva: totalesIVA.totaliva || 0,
                        logo_base64: ventaConDescuento.logo_base64 || '',
                        idusuarios,
                        tipo_venta: ventaConDescuento.tipo
                          ? ventaConDescuento.tipo.charAt(0).toUpperCase() + ventaConDescuento.tipo.slice(1).toLowerCase()
                          : '',
                        // ✅ Agregar datos del descuento para la factura
                        total_descuento: venta.total_descuento || 0,
                        tipo_descuento: tipoDescuento || null,
                        total_original: venta.total,
                        detalles: detallesDesdeDB.map((item) => ({
                          nombre_producto: item.nombre_producto,
                          cantidad: item.cantidad,
                          precio_venta: item.precio_venta,
                          sub_total: item.sub_total,
                          iva5: item.iva5 || 0,
                          iva10: item.iva10 || 0,
                        })),
                      };

                      const facturaPDFBase64 = await generarFacturaEmbebida(datosFactura);

                      // 📝 Generar pagaré solo si es venta a crédito
                      let pagarePDFBase64 = null;
                      if (ventaConDescuento.tipo.toLowerCase() === 'credito') {
                        // Obtener datos del cliente desde la BD directamente
                        Cliente.findById(ventaConDescuento.idcliente, async (errCliente, clienteResults) => {
                          if (!errCliente && clienteResults && clienteResults.length > 0) {
                            const clienteData = clienteResults[0];

                            // Buscar la deuda recién creada para obtener el iddeuda
                            DeudaVenta.findByVenta(idventa, (errDeuda, deudaData) => {
                              if (errDeuda || !deudaData || deudaData.length === 0) {
                                console.error('❌ No se encontró deuda para la venta:', idventa);
                                return res.status(201).json({
                                  message: '✅ Venta registrada correctamente',
                                  idventa,
                                  nro_factura: ventaConDatos.nro_factura,
                                  nro_ticket: ventaConDatos.nro_ticket,
                                  total_original: venta.total,
                                  total_descuento: venta.total_descuento || 0,
                                  total_final: ventaConDescuento.total,
                                  tipo_descuento: tipoDescuento,
                                  facturaPDFBase64,
                                });
                              }

                              const iddeuda = deudaData[0].iddeuda;

                              // Obtener la última fecha de vencimiento de las cuotas
                              DetalleCuotasVenta.getUltimaFechaVencimiento(iddeuda, async (errFecha, ultimaFechaVencimiento) => {
                                // Si hay error o no hay fecha, usar fecha_vencimiento de la venta (o fecha actual + 30 días como fallback)
                                let fechaVencimientoPagare = ventaConDescuento.fecha_vencimiento;

                                if (ultimaFechaVencimiento) {
                                  fechaVencimientoPagare = ultimaFechaVencimiento;
                                } else if (!fechaVencimientoPagare) {
                                  // Fallback: fecha actual + 30 días
                                  const fechaFallback = new Date();
                                  fechaFallback.setDate(fechaFallback.getDate() + 30);
                                  fechaVencimientoPagare = fechaFallback;
                                }

                                const datosPagare = {
                                  idusuarios,
                                  empresa: {
                                    nombre_fantasia: facturador.nombre_fantasia,
                                    ruc: facturador.ruc,
                                    timbrado_nro: facturador.timbrado_nro,
                                    fecha_inicio_vigente: formatDate(facturador.fecha_inicio_vigente),
                                    fecha_fin_vigente: formatDate(facturador.fecha_fin_vigente),
                                    fecha_emision: formatDate(new Date()),
                                  },
                                  cliente: {
                                    nombre: clienteData.nombre,
                                    apellido: clienteData.apellido,
                                    tipo_documento: clienteData.tipo_documento || 'CI',
                                    numDocumento: clienteData.numDocumento,
                                    telefono: clienteData.telefono || '',
                                    direccion: clienteData.direccion || '',
                                    tipo_doc: clienteData.tipo_documento || 'CI',
                                  },
                                  venta: {
                                    fecha: formatDate(ventaConDescuento.fecha),
                                    fecha_vencimiento: formatDate(fechaVencimientoPagare),
                                    total: ventaConDescuento.total,
                                    total_letras: ventaConDatos.totalletras,
                                    cant_cuota: ventaConDescuento.cant_cuota || 1,
                                    dia_fecha_pago: ventaConDescuento.dia_fecha_pago || '--',
                                  },
                                  pagare: {
                                    numero: ventaConDatos.nro_ticket || ventaConDatos.nro_factura,
                                    fecha_emision: formatDate(ventaConDescuento.fecha),
                                    fecha_vencimiento: formatDate(fechaVencimientoPagare),
                                  },
                                  detalles: detallesDesdeDB.map((item) => ({
                                    nombre_producto: item.nombre_producto,
                                    cantidad: item.cantidad,
                                    precio_venta: item.precio_venta,
                                    subtotal: item.sub_total,
                                    sub_total: item.sub_total,
                                  })),
                                };

                                pagarePDFBase64 = await generarPagareEmbebido(datosPagare);

                                return res.status(201).json({
                                  message: '✅ Venta registrada correctamente',
                                  idventa,
                                  nro_factura: ventaConDatos.nro_factura,
                                  nro_ticket: ventaConDatos.nro_ticket,
                                  total_original: venta.total,
                                  total_descuento: venta.total_descuento || 0,
                                  total_final: ventaConDescuento.total,
                                  tipo_descuento: tipoDescuento,
                                  facturaPDFBase64,
                                  pagarePDFBase64,
                                });
                              });
                            });
                          } else {
                            // Si no se encuentra el cliente, retornar sin pagaré
                            return res.status(201).json({
                              message: '✅ Venta registrada correctamente',
                              idventa,
                              nro_factura: ventaConDatos.nro_factura,
                              nro_ticket: ventaConDatos.nro_ticket,
                              total_original: venta.total,
                              total_descuento: venta.total_descuento || 0,
                              total_final: ventaConDescuento.total,
                              tipo_descuento: tipoDescuento,
                              facturaPDFBase64,
                            });
                          }
                        });
                      } else {
                        // Venta de contado, solo retornar factura
                        return res.status(201).json({
                          message: '✅ Venta registrada correctamente',
                          idventa,
                          nro_factura: ventaConDatos.nro_factura,
                          nro_ticket: ventaConDatos.nro_ticket,
                          total_original: venta.total,
                          total_descuento: venta.total_descuento || 0,
                          total_final: ventaConDescuento.total,
                          tipo_descuento: tipoDescuento,
                          facturaPDFBase64,
                        });
                      }
                    });
                  });
                } catch (error) {
                  console.error('❌ Error procesando detalles:', error);
                  return res.status(500).json({ error: '❌ Error procesando detalles de venta' });
                }
              });

            } catch (error) {
              console.error('❌ Error al validar stock:', error);
              return res.status(500).json({ error: '❌ Error al validar stock por lote' });
            }
          }
          })
          .catch((errCliente) => {
            console.error('❌ Error al resolver cliente para la venta:', errCliente);
            return res.status(400).json({ error: errCliente.message || '⚠️ No se pudo resolver el cliente' });
          });
      });
    });
    }); // Cierre del callback getMovimientoAbierto
  }; // Cierre del helper buscarMovimiento

  // Llamar al helper según el tipo de usuario
  if (tipo === 'funcionario') {
    // Funcionario: buscar solo su movimiento
    buscarMovimiento(null, idfuncionario);
  } else {
    // Usuario administrador: buscar funcionarios relacionados
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: '❌ Error al buscar funcionarios' });
      const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');
      buscarMovimiento(idusuarios, funcionariosIds);
    });
  }
};
