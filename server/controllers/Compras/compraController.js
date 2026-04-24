import Compra from '../../models/Compra/Compra.js';
import DetalleCompra from '../../models/Compra/DetalleCompra.js';
import MovimientoCaja from '../../models/MovimientoCaja.js';
import DeudaCompra from '../../models/Compra/deudaCompraModel.js';
import ProductoProveedor from '../../models/Producto/ProductoProveedor.js';
import Egreso from '../../models/Movimiento/Egreso.js';
import DetallesTransferenciaCompra from '../../models/Compra/Compras_Contado/DetallesTransferenciaCompra.js';
import DetalleTarjetaCompra from '../../models/Compra/Compras_Contado/DetalleTarjetaCompra.js';
import DetalleChequeCompra from '../../models/Compra/Compras_Contado/DetallesChequeCompra.js';
import { verificarProductosDuplicadosInterno } from '../Producto/productoController.js';
import Producto from '../../models/Producto/Producto.js';
import Facturador from '../../models/facturadorModel.js';
import { generateReportListCompra } from '../../report/reportListCompra.js';
import { getUserId } from '../../utils/getUserId.js';
import Funcionario from '../../models/Funcionario.js';
import { generateLibroCompras } from '../../report/libroCompras.js';
import LoteProducto from '../../models/LoteProducto.js';
import db from '../../db.js';

export const createCompra = (req, res) => {

  // 1️⃣ Verificamos que el usuario esté autenticado
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  const { compra, detalles, productosNuevos, isNewProducto = false } = req.body;

  const procesarCompra = (idsusuarios, idfuncionariosIds) => {
    MovimientoCaja.getMovimientoAbierto(idusuarios, idfuncionariosIds, (err, result) => {
      if (err) return res.status(500).json({ error: '❌ Error al buscar movimiento' });
      if (!result.length) return res.status(400).json({ error: '⚠️ No hay movimiento abierto' });

      const idmovimiento = result[0].idmovimiento;
    const totalCompra = detalles.reduce((acc, item) => {
      if (item.unidad_medida === 'CAJA') {
        const precioCaja = parseFloat(item.precio_compra_caja || 0);
        const cantidadCajas = parseFloat(item.cant_cajas || 0);
        return acc + (precioCaja * cantidadCajas);
      } else {
        const precio = parseFloat(item.precio || 0);
        const cantidad = parseFloat(item.cantidad || 0);
        return acc + (precio * cantidad);
      }
    }, 0);

    const compraConMovimiento = { ...compra, idmovimiento, total: totalCompra, idusuarios, idfuncionario };

    const productosProcesados = [];
    const erroresProductos = [];

    const procesarProductos = async () => {
      if (isNewProducto) {
        const nombresProductos = productosNuevos.map(p => p.nombre_producto);
        // Pasar idusuarios e idfuncionario para filtrar duplicados solo del mismo usuario
        const resultadoDuplicados = await verificarProductosDuplicadosInterno(nombresProductos, idusuarios, idfuncionario);

        if (resultadoDuplicados.duplicado) {
          return res.status(400).json({
            error: '❌ Existen productos duplicados.',
            productosDuplicados: resultadoDuplicados.productosDuplicados
          });
        }
      }

      for (const item of detalles) {
        if (String(item.idproducto).startsWith('temp-')) {
          const productoNuevo = productosNuevos.find(p => p.idtemp === item.idproducto);
          if (!productoNuevo) {
            erroresProductos.push({ nombre_producto: 'Producto no encontrado', error: 'No se encontró en productosNuevos' });
            continue;
          }
          console.log('Producto nuevo:', productoNuevo);
          // Validación y procesamiento de campos de cajas
          let cant_p_caja = null;
          let cant_cajas = 0;
          let precio_compra_caja = null;
          let precio_venta_caja = null;

          if (productoNuevo.unidad_medida === 'CAJA') {
            // Si es caja, validar que cant_p_caja sea válido
            if (!productoNuevo.cant_p_caja || parseFloat(productoNuevo.cant_p_caja) <= 0) {
              erroresProductos.push({
                nombre_producto: productoNuevo.nombre_producto,
                error: 'La cantidad por caja es obligatoria y debe ser mayor a 0 cuando la unidad de medida es "caja"'
              });
              continue;
            }

            cant_p_caja = parseFloat(productoNuevo.cant_p_caja);
            cant_cajas = parseInt(productoNuevo.cant_cajas) || 0;

            // Procesar precio de compra para cajas
            if (productoNuevo.precio_compra_caja) {
              // Si ingresó precio por caja, calcular precio unitario
              precio_compra_caja = parseFloat(productoNuevo.precio_compra_caja);
              const precio_unitario = precio_compra_caja / cant_p_caja;
              productoNuevo.precio_compra = precio_unitario.toFixed(2);
            } else if (productoNuevo.precio_compra) {
              // Si ingresó precio unitario, calcular precio por caja
              const precio_unitario = parseFloat(productoNuevo.precio_compra);
              precio_compra_caja = precio_unitario * cant_p_caja;
            }

            if (productoNuevo.precio_venta_caja) {
              // Si ingresó precio de venta por caja, calcular precio unitario de venta
              precio_venta_caja = parseFloat(productoNuevo.precio_venta_caja);
              const precio_venta_unitario = precio_venta_caja / cant_p_caja;
              productoNuevo.precio_venta = precio_venta_unitario.toFixed(2);
            } else if (productoNuevo.precio_venta) {
              // Si ingresó precio de venta unitario, calcular precio de venta por caja
              const precio_venta_unitario = parseFloat(productoNuevo.precio_venta);
              precio_venta_caja = precio_venta_unitario * cant_p_caja;
            }

          } else {
            // Si no es caja, asegurar que campos de caja sean null/0
            cant_p_caja = null;
            cant_cajas = 0;
            precio_compra_caja = null;
            precio_venta_caja = null;
          }

          const productoData = {
            nombre_producto: productoNuevo.nombre_producto,
            precio_compra: productoNuevo.precio_compra,
            precio_compra_caja: precio_compra_caja,
            cod_barra: productoNuevo.cod_barra || null,
            precio_venta: productoNuevo.precio_venta,
            precio_venta_caja: precio_venta_caja,
            unidad_medida: productoNuevo.unidad_medida,
            cant_p_caja: cant_p_caja,
            cant_cajas: cant_cajas,
            stock: productoNuevo.cantidad,
            iva: productoNuevo.iva,

            //stock: parseFloat(productoNuevo.cantidad) || 0,
            idproveedor: productoNuevo.idproveedor,
            idcategoria: productoNuevo.idcategoria,
            ubicacion: productoNuevo.ubicacion || null,
            idusuario: idusuarios,
            idfuncionario
          };
          console.log("Datos del producto dsfasdf: ", productoData)
          try {
            const result = await new Promise((resolve, reject) => {
              Producto.create(productoData, (err, result) => {
                if (err) return reject(err);
                resolve(result);
              });
            });

            productosProcesados.push({
              idtemp: item.idproducto,
              idproducto: result.insertId,
              nombre_producto: productoData.nombre_producto,
              unidad_medida: productoData.unidad_medida,
              iva: productoData.iva
            });

          } catch (error) {
            erroresProductos.push({ nombre_producto: productoData.nombre_producto, error: error.message || 'Error desconocido al crear producto' });
          }
        } else {
          productosProcesados.push({
            idtemp: item.idproducto,
            idproducto: item.idproducto,
            nombre_producto: item.nombre_producto,  // Aquí deberías pasar también estos datos desde el cliente
            unidad_medida: item.unidad_medida,
            iva: item.iva
          });
        }
      }

      if (erroresProductos.length > 0) {
        return res.status(400).json({
          error: '❌ Error al crear productos.',
          productosConError: erroresProductos
        });
      }

      crearCompraYDetalles(productosProcesados);
    };


    const crearCompraYDetalles = (productosProcesados) => {
      Compra.create(compraConMovimiento, (err, resultCompra) => {
        if (err) return res.status(500).json({ error: '❌ Error al registrar compra', detalle: err });

        const idcompra = resultCompra.insertId;

        // 💳 Insertar detalle de transferencia si corresponde
        if (compra.idformapago === 2 && compra.detalle_transferencia_compra) {
          const { banco_origen, numero_cuenta, tipo_cuenta, titular_cuenta, observacion } = compra.detalle_transferencia_compra;
          const datosTransferencia = {
            idcompra,
            banco_origen,
            numero_cuenta,
            tipo_cuenta,
            titular_cuenta,
            observacion: observacion || ''
          };

          DetallesTransferenciaCompra.create(datosTransferencia, (errInsert, insertResult) => {
            if (errInsert) {
              console.error('❌ Error al insertar detalle transferencia compra:', errInsert);
            } else {
              const iddetalle_transferencia_compra = insertResult.insertId;
              Compra.updateDetalleTransferenciaCompra(idcompra, iddetalle_transferencia_compra, (errUpdate) => {
                if (errUpdate) {
                  console.error('❌ Error al actualizar compra con iddetalle_transferencia_compra:', errUpdate);
                }
              });
            }
          });
        }

        // 💳 Insertar detalle de tarjeta si corresponde
        if (compra.idformapago === 4 && compra.detalle_tarjeta) {
          const { tipo_tarjeta, entidad, monto } = compra.detalle_tarjeta;
          const datosTarjeta = {
            idcompra,
            tipo_tarjeta,
            entidad,
            monto
          };

          DetalleTarjetaCompra.create(datosTarjeta, (errInsert, insertResult) => {
            if (errInsert) {
              console.error('❌ Error al insertar detalle tarjeta compra:', errInsert);
            } else {
              const iddetalle_tarjeta_compra = insertResult.insertId;
              Compra.updateDetalleTarjetaCompra(idcompra, iddetalle_tarjeta_compra, (errUpdate) => {
                if (errUpdate) {
                  console.error('❌ Error al actualizar compra con iddetalle_tarjeta_compra:', errUpdate);
                }
              });
            }
          });
        }

        // 💵 Insertar detalle de cheque si corresponde
        if (compra.idformapago === 3 && compra.detalle_cheque) {
          const { banco, nro_cheque, monto, fecha_emision, fecha_vencimiento, titular, estado } = compra.detalle_cheque;

          const datosCheque = {
            idcompra,
            banco,
            nro_cheque,
            monto,
            fecha_emision,
            fecha_vencimiento,
            titular,
            estado: "activo"
          };

          DetalleChequeCompra.create(datosCheque, (errInsert, insertResult) => {
            if (errInsert) {
              console.error('❌ Error al insertar detalle cheque compra:', errInsert);
            } else {
              const iddetalle_cheque_compra = insertResult.insertId;
              Compra.updateDetalleChequeCompra(idcompra, iddetalle_cheque_compra, (errUpdate) => {
                if (errUpdate) {
                  console.error('❌ Error al actualizar compra con iddetalle_cheque_compra:', errUpdate);
                }
              });
            }
          });
        }
        const resumenProductos = detalles
          .map((item) => {
            const prod = productosProcesados.find(p => p.idtemp === item.idproducto);
            const nombre = prod ? prod.nombre_producto : 'Producto';
            return `${nombre}x ${item.cantidad}`;
          })
          .join(', ');

        // ⚠️ Si tu columna observacion es VARCHAR(255), recorta para no exceder:
        const OBS_MAX = 255;
        const observacionFinal = `Compra ID ${idcompra}: ${resumenProductos}`
          .slice(0, OBS_MAX);
        // 👉 Registrar egreso asociado a esta compra (si es contado)
        if (compra.tipo === 'contado') {
          const egresoCompraContado = {
            idcompra,
            fecha: compra.fecha,
            hora: compra.hora || null,
            monto: compraConMovimiento.total,
            concepto: `Egreso por compra ID ${idcompra}`,
            idtipo_egreso: 1, // Ajustar según tu tabla tipo_egreso si aplica
            idformapago: 1,
            observacion: `${observacionFinal}`,
            idmovimiento: idmovimiento,
            creado_por: idusuarios,
            idfuncionario: idfuncionario
          };

          Egreso.create(egresoCompraContado, (errEgreso) => {
            if (errEgreso) console.error('❌ Error al registrar egreso por compra:', errEgreso);
            else console.log('✅ Egreso por compra registrado correctamente');
          });
        }

        // 👉 Crear deuda si la compra es a crédito
        if (compra.tipo === 'credito') {
          const deudaData = {
            idcompra,
            idproveedor: compra.idproveedor,
            total: compra.total
          };

          DeudaCompra.create(deudaData, (errDeuda) => {
            if (errDeuda) console.error('❌ Error al registrar deuda de compra:', errDeuda);
            else console.log('✅ Deuda de compra registrada');
          });
        }

        let detallesProcesados = 0;

        detalles.forEach((item) => {
          const productoEncontrado = productosProcesados.find(p => p.idtemp === item.idproducto);
          if (!productoEncontrado) {
            console.error('❌ Producto no encontrado al crear detalle.');
            return;
          }

          const idproductoFinal = productoEncontrado.idproducto;
          const fechaFinal = (!item.fecha_vencimiento || item.fecha_vencimiento.trim() === '') ? null : item.fecha_vencimiento;

          // 🆕 BUSCAR DATOS EN productosNuevos SI ES PRODUCTO TEMPORAL
          let datosProducto = item;
          if (String(item.idproducto).startsWith('temp-')) {
            const productoNuevo = productosNuevos.find(p => p.idtemp === item.idproducto);
            if (productoNuevo) {
              datosProducto = { ...item, ...productoNuevo }; // Combinar datos
            }
          }

          const sub_total = datosProducto.unidad_medida === 'CAJA'
            ? parseFloat(datosProducto.precio_compra_caja || 0) * parseFloat(datosProducto.cant_cajas || 0)
            : parseFloat(datosProducto.precio || 0) * parseFloat(datosProducto.cantidad || 0);

          // 🆕 Agregar campos de auditoría de cajas
          let cant_cajas = null;
          let cant_cajas_restante = null;
          let cant_p_caja = null;
          let cant_p_caja_restante = null;

          if (datosProducto.unidad_medida === 'CAJA') {
            cant_cajas = parseFloat(datosProducto.cant_cajas) || null;
            cant_cajas_restante = cant_cajas;
            cant_p_caja = parseInt(datosProducto.cant_p_caja) || null;
            cant_p_caja_restante = cant_p_caja;
          }

          ProductoProveedor.create(idproductoFinal, compra.idproveedor, datosProducto.precio, (errVinculo) => {
            if (errVinculo) console.error('❌ Error al vincular producto-proveedor:', errVinculo);

            // ✅ Obtener cantidad desde datosProducto (incluye datos de productosNuevos para productos temp-)
            const cantidadCompra = parseFloat(datosProducto.cantidad) || parseFloat(item.cantidad) || 0;

            // ✅ Calcular stock_restante según tipo de producto
            let stockRestante = cantidadCompra; // Por defecto para productos UNIDAD

            if (datosProducto.unidad_medida === 'CAJA' && cant_p_caja) {
              // Para productos CAJA: stock_restante = cantidad_cajas * unidades_por_caja
              stockRestante = cantidadCompra * cant_p_caja;
              console.log(`📦 Producto CAJA: ${cantidadCompra} cajas × ${cant_p_caja} unidades/caja = ${stockRestante} unidades totales`);
            }

            console.log(`📊 DEBUG stockRestante: cantidad=${cantidadCompra}, stockRestante=${stockRestante}, unidad_medida=${datosProducto.unidad_medida}`);

            const detalle = {
              idproducto: idproductoFinal,
              idcompra,
              idproveedor: compra.idproveedor,
              cantidad: cantidadCompra, // ✅ Usar cantidadCompra parseado
              precio: datosProducto.precio || item.precio,
              precio_compra_caja: datosProducto.precio_compra_caja || null,
              sub_total,
              fecha_vencimiento: fechaFinal,
              nombre_producto: productoEncontrado.nombre_producto,
              unidad_medida: productoEncontrado.unidad_medida,
              stock_restante: stockRestante, // ✅ Usar el stock calculado
              iva: productoEncontrado.iva,
              // 🆕 Campos de auditoría
              cant_cajas,
              cant_cajas_restante,
              cant_p_caja,
              cant_p_caja_restante
            };

            // ✅ VERIFICAR SI ES UN LOTE EXISTENTE (idlote existe y no es -1)
            console.log(`🔍 DEBUG - item.idlote: ${item.idlote}, tipo: ${typeof item.idlote}, item.numero_lote: ${item.numero_lote}, datosProducto.numero_lote: ${datosProducto.numero_lote}`);

            if (item.idlote && item.idlote !== -1) {
              // 📦 ACTUALIZAR LOTE EXISTENTE
              console.log(`📦 Actualizando lote existente ${item.idlote} para producto ${idproductoFinal}`);

              const stockAgregar = stockRestante;

              // Actualizar stock del lote
              LoteProducto.aumentarStock(item.idlote, stockAgregar, (errLote) => {
                if (errLote) {
                  console.error('❌ Error al actualizar stock del lote existente:', errLote);
                }

                // ✅ Si es producto CAJA, actualizar también los campos de caja en el lote
                if (datosProducto.unidad_medida === 'CAJA') {
                  const datosActualizarLote = {
                    cant_p_caja: cant_p_caja,
                    cant_cajas: cant_cajas,
                    precio_compra_caja: datosProducto.precio_compra_caja
                  };

                  LoteProducto.actualizarCamposCaja(item.idlote, datosActualizarLote, (errActualizar) => {
                    if (errActualizar) {
                      console.error('❌ Error al actualizar campos de caja del lote:', errActualizar);
                    } else {
                      console.log(`✅ Campos de caja actualizados para lote ${item.idlote}`);
                    }
                  });
                }

                // Crear un nuevo detalle_compra para esta compra
                DetalleCompra.create(detalle, (errDetalle, resultDetalle) => {
                  if (errDetalle) {
                    console.error('❌ Error al insertar detalle:', errDetalle);
                    return;
                  }

                  // Actualizar stock del producto
                  if (!String(item.idproducto).startsWith('temp-')) {
                    actualizarStockProducto(idproductoFinal, datosProducto, () => {
                      detallesProcesados++;
                      if (detallesProcesados === detalles.length) {
                        res.status(201).json({ message: '✅ Compra registrada correctamente', idcompra });
                      }
                    });
                  } else {
                    console.log(`🆕 Producto nuevo ${idproductoFinal}: no se actualiza stock (ya creado con datos correctos)`);
                    detallesProcesados++;
                    if (detallesProcesados === detalles.length) {
                      res.status(201).json({ message: '✅ Compra registrada correctamente', idcompra });
                    }
                  }
                });
              });
            } else {
              DetalleCompra.create(detalle, (errDetalle, resultDetalle) => {
                if (errDetalle) {
                  console.error('❌ Error al insertar detalle:', errDetalle);
                  return;
                }

                const iddetalleCompra = resultDetalle.insertId;

                // 🔥 CREAR LOTE DEL PRODUCTO (REQUERIDO)
                // ✅ Usar datosProducto para obtener numero_lote (incluye datos de productosNuevos para productos temp-)
                const numeroLote = datosProducto.numero_lote || item.numero_lote;

                if (!numeroLote || numeroLote.trim() === '') {
                  console.error('❌ Error: numero_lote es requerido para el producto', productoEncontrado.nombre_producto);
                  console.log('   - item.numero_lote:', item.numero_lote);
                  console.log('   - datosProducto.numero_lote:', datosProducto.numero_lote);
                  // Continuar sin crear lote (o podrías hacer return para detener)
                  procesarPostLote();
                  return;
                }

                // Buscar si ya existe un lote con el mismo número para este producto
                LoteProducto.findByProductoYNumeroLote(idproductoFinal, numeroLote, (errBuscar, loteExistente) => {
                  if (errBuscar) {
                    console.error('❌ Error al buscar lote existente:', errBuscar);
                    procesarPostLote();
                    return;
                  }

                  if (loteExistente) {
                    // ✅ LOTE EXISTENTE: Actualizar stock en lugar de rechazar
                    console.log(`📦 Lote "${numeroLote}" ya existe para producto ${idproductoFinal} (ID: ${loteExistente.idlote})`);
                    console.log(`   - Stock actual del lote: ${loteExistente.stock_actual}`);
                    console.log(`   - Cantidad a agregar: ${stockRestante}`);

                    LoteProducto.aumentarStockYCantidadInicial(loteExistente.idlote, stockRestante, (errActualizar) => {
                      if (errActualizar) {
                        console.error('❌ Error al actualizar stock del lote existente:', errActualizar);
                      } else {
                        console.log(`✅ Lote actualizado: ${numeroLote} (ID: ${loteExistente.idlote}) - stock agregado: ${stockRestante}`);
                      }

                      // ✅ Si es producto CAJA, actualizar también los campos de caja en el lote
                      if (datosProducto.unidad_medida === 'CAJA') {
                        const datosActualizarLote = {
                          cant_p_caja: cant_p_caja,
                          cant_cajas: cant_cajas,
                          precio_compra_caja: datosProducto.precio_compra_caja
                        };

                        LoteProducto.actualizarCamposCaja(loteExistente.idlote, datosActualizarLote, (errActualizarCaja) => {
                          if (errActualizarCaja) {
                            console.error('❌ Error al actualizar campos de caja del lote:', errActualizarCaja);
                          } else {
                            console.log(`✅ Campos de caja actualizados para lote ${loteExistente.idlote}`);
                          }
                        });
                      }

                      procesarPostLote();
                    });
                    return;
                  }

                  // Crear nuevo lote si no existe
                  const loteData = {
                    idproducto: idproductoFinal,
                    iddetalle_compra: iddetalleCompra,
                    numero_lote: numeroLote.trim(),
                    referencia_proveedor: datosProducto.referencia_proveedor || item.referencia_proveedor || null,
                    cantidad_inicial: stockRestante,
                    stock_actual: stockRestante,
                    fecha_vencimiento: fechaFinal,
                    precio_compra: datosProducto.precio || item.precio,
                    ubicacion_almacen: datosProducto.ubicacion_almacen || item.ubicacion_almacen || 'PRINCIPAL',
                    estado: 'disponible',
                    // ✅ Campos para productos tipo CAJA
                    cant_p_caja: cant_p_caja || null,
                    cant_cajas: cant_cajas || null,
                    precio_compra_caja: datosProducto.precio_compra_caja || null
                  };

                  console.log(`📦 DEBUG loteData (nuevo):`, JSON.stringify(loteData, null, 2));

                  LoteProducto.create(loteData, (errLote, resultLote) => {
                    if (errLote) {
                      console.error('❌ Error al crear lote:', errLote);
                    } else {
                      console.log(`✅ Lote creado: ${numeroLote} (ID: ${resultLote.insertId}) - cantidad_inicial: ${stockRestante}, stock_actual: ${stockRestante}`);
                    }

                    procesarPostLote();
                  });
                });

                // Función para continuar con el procesamiento
                function procesarPostLote() {
                  // Solo actualizar stock si NO es un producto nuevo
                  if (!String(item.idproducto).startsWith('temp-')) {
                    // Para productos existentes, necesitamos los datos del productosNuevos si aplica
                    let itemConDatos = item;

                    actualizarStockProducto(idproductoFinal, itemConDatos, () => {
                      detallesProcesados++;
                      if (detallesProcesados === detalles.length) {
                        res.status(201).json({ message: '✅ Compra registrada correctamente', idcompra });
                      }
                    });
                  } else {
                    // Para productos nuevos, solo contar como procesado
                    console.log(`🆕 Producto nuevo ${idproductoFinal}: no se actualiza stock (ya creado con datos correctos)`);
                    detallesProcesados++;
                    if (detallesProcesados === detalles.length) {
                      res.status(201).json({ message: '✅ Compra registrada correctamente', idcompra });
                    }
                  }
                }
              });
            }
          });
        });
      });
    };

    // 🆕 NUEVA FUNCIÓN PARA ACTUALIZAR STOCK SEGÚN UNIDAD DE MEDIDA
    const actualizarStockProducto = (idproducto, item, callback) => {
      if (item.unidad_medida === 'CAJA') {
        // Para productos con unidad de medida CAJA
        const cantidadStock = parseFloat(item.cant_p_caja) * parseFloat(item.cant_cajas);
        const nuevoCantPCaja = parseFloat(item.cant_p_caja);
        const nuevoPrecioCompraCaja = parseFloat(item.precio_compra_caja);
        const nuevoPrecioCompra = parseFloat(item.precio);

        console.log(`📦 Actualizando producto CAJA ${idproducto}:`);
        console.log(`   - Stock a agregar: ${cantidadStock} (${item.cant_p_caja} x ${item.cant_cajas})`);
        console.log(`   - Nuevo cant_p_caja: ${nuevoCantPCaja}`);
        console.log(`   - Nuevo precio_compra_caja: ${nuevoPrecioCompraCaja}`);

        // ✅ USAR EL MÉTODO CORRECTO DEL MODELO
        Producto.actualizarStockYCantPCaja(idproducto, cantidadStock, nuevoCantPCaja, nuevoPrecioCompraCaja, nuevoPrecioCompra, (errStock) => {
          if (errStock) console.error('❌ Error al actualizar producto CAJA:', errStock);
          else console.log(`✅ Stock, cant_p_caja y precio_compra_caja actualizados, cant_cajas calculado por trigger`);
          callback();
        });
      } else {
        // Para productos con otras unidades de medida (unidades, kg, etc.)
        const cantidadStock = parseFloat(item.cantidad);

        console.log(`📝 Actualizando producto UNIDAD ${idproducto}: stock +${cantidadStock}`);

        Producto.aumentarStock(idproducto, cantidadStock, (errStock) => {
          if (errStock) console.error('❌ Error al actualizar stock del producto:', errStock);
          else console.log(`✅ Stock actualizado correctamente para producto ${idproducto}`);
          callback();
        });
      }
    };

    procesarProductos();
    }); // Cierre del callback getMovimientoAbierto
  }; // Cierre del helper procesarCompra

  // Llamar al helper según el tipo de usuario
  if (tipo === 'funcionario') {
    procesarCompra(null, idfuncionario);
  } else {
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: '❌ Error al buscar funcionarios' });
      const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');
      procesarCompra(idusuarios, funcionariosIds);
    });
  }
};

export const getResumenComprasDia = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  // Validar autenticación
  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  // Función helper que ejecuta la búsqueda con los IDs apropiados
  function obtenerResumen(idsusuarios, idfuncionariosIds) {
    Compra.getResumenComprasDelDiaByUser(idsusuarios, idfuncionariosIds, (err, result) => {
      if (err) {
        console.error("❌ Error en resumen de compras:", err);
        return res.status(500).json({ error: "Error al obtener resumen de compras" });
      }

      const { totalHoy = 0, totalAyer = 0 } = result[0] || {};
      const variacion = totalAyer === 0 ? 100 : ((totalHoy - totalAyer) / totalAyer) * 100;

      res.json({
        label: "Compras del día",
        totalHoy: parseFloat(totalHoy),
        totalAyer: parseFloat(totalAyer),
        variacion: parseFloat(variacion.toFixed(2))
      });
    });
  }

  // Lógica condicional según el tipo de usuario
  if (tipo === 'funcionario') {
    // Funcionario: solo ver su propio resumen
    obtenerResumen(null, idfuncionario);
  } else {
    // Usuario administrador: ver su resumen + el de sus funcionarios
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: err });

      const funcionariosIds = funcionarios.length > 0
        ? funcionarios.map(f => f.idfuncionario).join(',')
        : null;

      obtenerResumen(idusuarios, funcionariosIds);
    });
  }
};

export const getCompras = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  // Filtro por tipo de compra: 'inventario_inicial', 'normal', 'todas' (por defecto)
  const tipoCompra = req.query.tipoCompra || 'todas';
  const fecha_inicio = req.query.fecha_inicio || null;
  const fecha_fin = req.query.fecha_fin || null;

  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  // Objeto de filtros para pasar al modelo
  const filtros = { tipoCompra, fecha_inicio, fecha_fin };

  // Si es un funcionario, solo ve sus propios registros
  if (tipo === 'funcionario') {
    return Compra.countFilteredByCajero(search, null, idfuncionario, filtros, (err, total) => {
      if (err) return res.status(500).json({ error: err });

      Compra.findAllPaginatedFilteredByCajero(limit, offset, search, null, idfuncionario, filtros, (err, compras) => {
        if (err) return res.status(500).json({ error: err });

        const ids = compras.map((c) => c.idcompra);
        if (ids.length === 0) {
          return res.json({ data: [], totalItems: 0, totalPages: 0, currentPage: page });
        }

        DetalleCompra.findByCompraMultiple(ids, (err, detalles) => {
          if (err) return res.status(500).json({ error: err });

          const detallesMap = {};
          detalles.forEach((detalle) => {
            if (!detallesMap[detalle.idcompra]) {
              detallesMap[detalle.idcompra] = [];
            }
            detallesMap[detalle.idcompra].push(detalle);
          });

          const comprasConDetalles = compras.map((compra) => ({
            ...compra,
            detalles: detallesMap[compra.idcompra] || []
          }));

          const totalPages = Math.ceil(total / limit);
          res.json({
            data: comprasConDetalles,
            totalItems: total,
            totalPages,
            currentPage: page
          });
        });
      });
    });
  }

  // Si es un usuario administrador, buscar sus funcionarios relacionados
  Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
    if (err) return res.status(500).json({ error: err });

    const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');

    return Compra.countFilteredByCajero(search, idusuarios, funcionariosIds, filtros, (err, total) => {
      if (err) return res.status(500).json({ error: err });

      Compra.findAllPaginatedFilteredByCajero(limit, offset, search, idusuarios, funcionariosIds, filtros, (err, compras) => {
        if (err) return res.status(500).json({ error: err });

        const ids = compras.map((c) => c.idcompra);
        if (ids.length === 0) {
          return res.json({ data: [], totalItems: 0, totalPages: 0, currentPage: page });
        }

        DetalleCompra.findByCompraMultiple(ids, (err, detalles) => {
          if (err) return res.status(500).json({ error: err });

          const detallesMap = {};
          detalles.forEach((detalle) => {
            if (!detallesMap[detalle.idcompra]) {
              detallesMap[detalle.idcompra] = [];
            }
            detallesMap[detalle.idcompra].push(detalle);
          });

          const comprasConDetalles = compras.map((compra) => ({
            ...compra,
            detalles: detallesMap[compra.idcompra] || []
          }));

          const totalPages = Math.ceil(total / limit);
          res.json({
            data: comprasConDetalles,
            totalItems: total,
            totalPages,
            currentPage: page
          });
        });
      });
    });
  });
};

export const getComprasPorMes = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  // Validar autenticación
  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const year = parseInt(req.query.year) || new Date().getFullYear();

  // Función helper que ejecuta la búsqueda con los IDs apropiados
  function obtenerComprasPorMes(idsusuarios, idfuncionariosIds) {
    Compra.getComprasPorMesByUser(year, idsusuarios, idfuncionariosIds, (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error al obtener compras por mes" });
      }

      // Inicializar todos los meses con 0
      const comprasMensuales = Array(12).fill(0);

      results.forEach((row) => {
        comprasMensuales[row.mes - 1] = parseFloat(row.total);
      });

      const respuesta = {
        year,
        data: comprasMensuales
      };
      res.json(respuesta);
    });
  }

  // Lógica condicional según el tipo de usuario
  if (tipo === 'funcionario') {
    // Funcionario: solo ver sus propias compras
    obtenerComprasPorMes(null, idfuncionario);
  } else {
    // Usuario administrador: ver sus compras + las de sus funcionarios
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: err });

      const funcionariosIds = funcionarios.length > 0
        ? funcionarios.map(f => f.idfuncionario).join(',')
        : null;

      obtenerComprasPorMes(idusuarios, funcionariosIds);
    });
  }
};

export const getComprasCajero = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  const { idusuarios, idfuncionario } = getUserId(req);

  Compra.countFilteredByCajero(search, idusuarios, idfuncionario, (err, total) => {
    if (err) return res.status(500).json({ error: err });

    Compra.findAllPaginatedFilteredByCajero(limit, offset, search, idusuarios, idfuncionario, (err, compras) => {
      if (err) return res.status(500).json({ error: err });

      const ids = compras.map((c) => c.idcompra);
      if (ids.length === 0) {
        return res.json({ data: [], totalItems: 0, totalPages: 0, currentPage: page });
      }

      DetalleCompra.findByCompraMultiple(ids, (err, detalles) => {
        if (err) return res.status(500).json({ error: err });

        const detallesMap = {};
        detalles.forEach((detalle) => {
          if (!detallesMap[detalle.idcompra]) {
            detallesMap[detalle.idcompra] = [];
          }
          detallesMap[detalle.idcompra].push(detalle);
        });

        const comprasConDetalles = compras.map((compra) => ({
          ...compra,
          detalles: detallesMap[compra.idcompra] || []
        }));

        const totalPages = Math.ceil(total / limit);
        res.json({
          data: comprasConDetalles,
          totalItems: total,
          totalPages,
          currentPage: page
        });
      });
    });
  });
};

export const getCompraById = (req, res) => {
  const id = req.params.id;

  Compra.findById(id, (err, compra) => {
    if (err) return res.status(500).json({ error: err });

    DetalleCompra.findByCompra(id, (err, detalles) => {
      if (err) return res.status(500).json({ error: err });

      res.json({
        compra: compra[0],
        detalles
      });
    });
  });
};

const restarStockProducto = (idproducto, detalle, idcompraActual, callback) => {
  if (detalle.unidad_medida === 'CAJA') {
    // 📦 Para productos CAJA
    const cantPCaja = parseFloat(detalle.cant_p_caja || 0);
    const cantCajas = parseFloat(detalle.cant_cajas || 0);

    let cantidadARestar;

    if (cantPCaja > 0 && cantCajas > 0) {
      cantidadARestar = cantPCaja * cantCajas;
      console.log(`📦 Restando stock producto CAJA ${idproducto}:`);
      console.log(`   - Cajas: ${cantCajas}`);
      console.log(`   - Unidades por caja: ${cantPCaja}`);
      console.log(`   - Total a restar: ${cantidadARestar} unidades`);
    } else {
      cantidadARestar = parseFloat(detalle.cantidad || 0);
      console.log(`⚠️ Usando cantidad directa para CAJA ${idproducto}: ${cantidadARestar}`);
    }

    // 1️⃣ Primero restar el stock
    Producto.restarStock(idproducto, cantidadARestar, (errStock) => {
      if (errStock) {
        return callback(errStock);
      }

      console.log(`✅ Stock restado. Buscando detalle de compra anterior...`);

      // 2️⃣ Buscar el detalle de compra anterior (no anulado) para restaurar precios
      DetalleCompra.findUltimoDetalleAnterior(idproducto, idcompraActual, (errDetalle, resultados) => {
        if (errDetalle) {
          console.error(`❌ Error al buscar detalle anterior:`, errDetalle);
          return callback(errDetalle);
        }

        if (resultados && resultados.length > 0) {
          const detalleAnterior = resultados[0];

          console.log(`🔄 Restaurando valores del detalle anterior (compra ${detalleAnterior.idcompra}):`);
          console.log(`   - precio_compra_caja: ${detalleAnterior.precio_compra_caja}`);
          console.log(`   - cant_p_caja: ${detalleAnterior.cant_p_caja}`);
          console.log(`   - precio_compra: ${detalleAnterior.precio}`);

          // 3️⃣ Restaurar los valores del detalle anterior
          Producto.restaurarPreciosYCantidadCaja(
            idproducto,
            detalleAnterior.precio_compra_caja,
            detalleAnterior.cant_p_caja,
            detalleAnterior.precio,
            (errRestore) => {
              if (errRestore) {
                console.error(`❌ Error al restaurar precios:`, errRestore);
                return callback(errRestore);
              }
              console.log(`✅ Precios y cant_p_caja restaurados correctamente`);
              callback(null);
            }
          );
        } else {
          console.log(`⚠️ No se encontró detalle anterior. Los valores actuales se mantienen.`);
          // No hay compra anterior, simplemente continuar
          callback(null);
        }
      });
    });

  } else {
    // 📝 Para productos normales: solo restar cantidad
    const cantidadARestar = parseFloat(detalle.cantidad || 0);

    console.log(`📝 Restando stock producto UNIDAD ${idproducto}: ${cantidadARestar}`);

    Producto.restarStock(idproducto, cantidadARestar, callback);
  }
};

export const deleteCompra = (req, res) => {
  const idcompra = parseInt(req.params.id, 10);

  // 1️⃣ Obtenemos la compra para saber su tipo
  Compra.findById(idcompra, (errFind, resultsCompra) => {
    if (errFind) return res.status(500).json({ error: '❌ Error al obtener la compra' });
    if (!resultsCompra.length) return res.status(404).json({ error: '❌ No se encontró la compra' });

    const compra = resultsCompra[0];

    // 2️⃣ Si es crédito, llamamos al SP
    if (compra.tipo === 'credito') {
      Compra.ejecutarAnulacionCompleta(idcompra, (errSP) => {
        if (errSP) return res.status(500).json({ error: errSP });
        return res.json({ message: '✅ Compra a crédito anulada correctamente' });
      });
    } else {
      // 3️⃣ Si es contado, lógica manual
      DetalleCompra.findByCompraId(idcompra, (err, detalles) => {
        if (err) return res.status(500).json({ error: '❌ Error al obtener detalles de la compra' });
        if (!detalles.length) return res.status(404).json({ error: '❌ No se encontraron detalles para esta compra' });

        console.log('📋 Detalles de compra a anular:', detalles.length);

        let actualizados = 0;
        let erroresStock = [];

        detalles.forEach((detalle) => {
          console.log(`\n🔄 Procesando producto ${detalle.idproducto}:`, {
            nombre: detalle.nombre_producto,
            unidad: detalle.unidad_medida,
            cantidad: detalle.cantidad,
            cant_cajas: detalle.cant_cajas,
            cant_p_caja: detalle.cant_p_caja,
            precio_compra_caja: detalle.precio_compra_caja
          });

          // ✅ CAMBIO IMPORTANTE: Pasar idcompra para buscar el anterior
          restarStockProducto(detalle.idproducto, detalle, idcompra, (errProd) => {
            if (errProd) {
              console.error(`❌ Error al restar stock del producto ${detalle.idproducto}:`, errProd);
              erroresStock.push({
                idproducto: detalle.idproducto,
                nombre: detalle.nombre_producto,
                error: errProd.message || errProd
              });
            }

            // Restar el stock del lote si tiene iddetalle
            if (detalle.iddetalle) {
              DetalleCompra.restarStockLote(detalle.iddetalle, detalle.cantidad, (errLote) => {
                if (errLote) {
                  console.error(`❌ Error al restar stock del lote ${detalle.iddetalle}:`, errLote);
                }
                actualizados++;
                if (actualizados === detalles.length) finalizarAnulacionContado();
              });
            } else {
              actualizados++;
              if (actualizados === detalles.length) finalizarAnulacionContado();
            }
          });
        });

        function finalizarAnulacionContado() {
          if (erroresStock.length > 0) {
            console.error('⚠️ Errores al actualizar stock:', erroresStock);
            return res.status(500).json({
              error: '❌ Error al actualizar stock de algunos productos',
              detalles: erroresStock
            });
          }

          console.log('✅ Stock y precios actualizados correctamente para todos los productos');

          // Soft-delete en la tabla compras
          Compra.softDelete(idcompra, (errDelete) => {
            if (errDelete) return res.status(500).json({ error: 'Error al anular la compra' });

            // Soft-delete en detalle_compra
            DetalleCompra.softDeleteByCompraId(idcompra, (errDetalleCompra) => {
              if (errDetalleCompra) {
                console.error('Error al anular detalle_compra:', errDetalleCompra);
              }

              // Soft-delete en egresos asociados
              Egreso.softDeleteByCompraId(idcompra, (errEgreso) => {
                if (errEgreso) {
                  console.warn('Error al anular egreso relacionado:', errEgreso);
                }

                let errores = [];

                // Detalle transferencia compra
                DetallesTransferenciaCompra.softDeleteByCompraId(idcompra, (errTransf) => {
                  if (errTransf) {
                    console.error('Error al anular detalle de transferencia compra:', errTransf);
                    errores.push('transferencia');
                  }

                  // Detalle tarjeta compra
                  DetalleTarjetaCompra.softDeleteByCompraId(idcompra, (errTarj) => {
                    if (errTarj) {
                      console.error('Error al anular detalle de tarjeta compra:', errTarj);
                      errores.push('tarjeta');
                    }

                    // Detalle cheque compra
                    DetalleChequeCompra.softDeleteByCompraId(idcompra, (errCheq) => {
                      if (errCheq) {
                        console.error('Error al anular detalle de cheque compra:', errCheq);
                        errores.push('cheque');
                      }

                      // Respuesta final
                      if (errores.length > 0) {
                        return res.status(200).json({
                          message: '✅ Compra anulada y stock/precios restaurados, pero hubo errores en asociados',
                          errores
                        });
                      }

                      return res.json({
                        message: '✅ Compra anulada, stock y precios restaurados correctamente'
                      });
                    });
                  });
                });
              });
            });
          });
        }
      });
    }
  });
};

// ✅ Obtener datos para el reporte de compras (sin generar PDF)
export const getReporteComprasData = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const userId = idfuncionario || idusuarios;
  const search = req.query.search || '';
  const fechaInicio = req.query.fecha_inicio || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const fechaFin = req.query.fecha_fin || new Date().toISOString().split('T')[0];
  const tipoFiltro = req.query.tipo || ''; // 'contado', 'credito' o '' (todos)

  // Validar usuario autenticado
  if (!userId) {
    return res.status(401).json({
      error: 'Usuario no autenticado'
    });
  }

  // Obtener compras del usuario con estadísticas
  Compra.findAllForReportWithStats(userId, search, fechaInicio, fechaFin, (err, compras) => {
    if (err) {
      console.error('❌ Error al obtener compras:', err);
      return res.status(500).json({
        error: 'Error interno al obtener compras'
      });
    }

    if (!compras.length) {
      return res.status(404).json({
        error: '⚠️ No se encontraron compras para generar el reporte'
      });
    }

    // Filtrar por tipo si se especificó
    let comprasFiltradas = compras;
    if (tipoFiltro && tipoFiltro.trim() !== '') {
      comprasFiltradas = compras.filter(compra =>
        compra.tipo.toLowerCase() === tipoFiltro.toLowerCase()
      );

      if (!comprasFiltradas.length) {
        return res.status(404).json({
          error: `⚠️ No se encontraron compras del tipo "${tipoFiltro}"`
        });
      }
    }

    // Función helper para formatear fechas
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Función helper para formatear números con puntos de miles
    const formatNumber = (num) => {
      if (!num && num !== 0) return '0';
      return new Intl.NumberFormat('es-PY').format(Math.round(num));
    };

    // Calcular estadísticas generales
    let totalCompras = comprasFiltradas.length;
    let comprasContado = 0;
    let comprasCredito = 0;
    let montoTotalCompras = 0;
    let montoTotalDescuentos = 0;
    let cantidadTotalProductos = 0;

    comprasFiltradas.forEach((compra) => {
      // Contar por tipo
      if (compra.tipo === 'contado') {
        comprasContado++;
      } else {
        comprasCredito++;
      }

      // Sumar montos
      montoTotalCompras += parseFloat(compra.total) || 0;
      montoTotalDescuentos += parseFloat(compra.descuento_aplicado) || 0;
      cantidadTotalProductos += parseInt(compra.cantidad_total_productos) || 0;
    });

    // Formatear compras con todos los datos necesarios
    const comprasFormateadas = comprasFiltradas.map((compra) => {
      return {
        idcompra: compra.idcompra,
        nro_factura: compra.nro_factura || 'Sin factura',
        fecha: formatDate(compra.fecha),
        proveedor_nombre: compra.proveedor_nombre,
        proveedor_ruc: compra.proveedor_ruc,
        cajero_nombre: compra.cajero_nombre || 'Sistema',
        tipo: compra.tipo.charAt(0).toUpperCase() + compra.tipo.slice(1),
        estado: compra.estado,
        total: formatNumber(parseFloat(compra.total) || 0),
        total_raw: parseFloat(compra.total) || 0,
        descuento: formatNumber(parseFloat(compra.descuento_aplicado) || 0),
        descuento_raw: parseFloat(compra.descuento_aplicado) || 0,
        total_productos: parseInt(compra.total_productos) || 0,
        cantidad_total_productos: parseInt(compra.cantidad_total_productos) || 0,
        observacion: compra.observacion || '',
        created_at: formatDate(compra.created_at)
      };
    });

    res.status(200).json({
      success: true,
      data: comprasFormateadas,
      filtros: {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        tipo: tipoFiltro || 'Todos'
      },
      estadisticas: {
        total_compras: totalCompras,
        compras_contado: comprasContado,
        compras_credito: comprasCredito,
        monto_total_compras: formatNumber(montoTotalCompras),
        monto_total_compras_raw: montoTotalCompras,
        monto_total_descuentos: formatNumber(montoTotalDescuentos),
        monto_total_descuentos_raw: montoTotalDescuentos,
        cantidad_total_productos: cantidadTotalProductos
      }
    });
  });
};

// ✅ Generar PDF del reporte de compras
export const generateReporteComprasPDF = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const userId = idfuncionario || idusuarios;
  const search = req.query.search || '';
  const fechaInicio = req.query.fecha_inicio || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const fechaFin = req.query.fecha_fin || new Date().toISOString().split('T')[0];
  const tipoFiltro = req.query.tipo || ''; // 'contado', 'credito' o '' (todos)

  // Validar usuario autenticado
  if (!userId) {
    return res.status(401).json({
      error: 'Usuario no autenticado'
    });
  }

  // Obtener compras del usuario con estadísticas
  Compra.findAllForReportWithStats(userId, search, fechaInicio, fechaFin, (err, compras) => {
    if (err) {
      console.error('❌ Error al obtener compras:', err);
      return res.status(500).json({
        error: 'Error interno al obtener compras'
      });
    }

    if (!compras.length) {
      return res.status(404).json({
        error: '⚠️ No se encontraron compras para generar el reporte'
      });
    }

    // Filtrar por tipo si se especificó
    let comprasFiltradas = compras;
    if (tipoFiltro && tipoFiltro.trim() !== '') {
      comprasFiltradas = compras.filter(compra =>
        compra.tipo.toLowerCase() === tipoFiltro.toLowerCase()
      );

      if (!comprasFiltradas.length) {
        return res.status(404).json({
          error: `⚠️ No se encontraron compras del tipo "${tipoFiltro}"`
        });
      }
    }

    // Obtener datos del facturador activo para el encabezado
    Facturador.findActivo((errFact, factResult) => {
      if (errFact || !factResult.length) {
        return res.status(400).json({
          error: '⚠️ No se encontró facturador activo'
        });
      }

      const facturador = factResult[0];

      // Función helper para formatear fechas
      const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Función helper para formatear números con puntos de miles
      const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('es-PY').format(Math.round(num));
      };

      const fecha_emision = formatDate(new Date());

      // Calcular estadísticas generales
      let totalCompras = comprasFiltradas.length;
      let comprasContado = 0;
      let comprasCredito = 0;
      let montoTotalCompras = 0;
      let montoTotalDescuentos = 0;
      let cantidadTotalProductos = 0;

      comprasFiltradas.forEach((compra) => {
        // Contar por tipo
        if (compra.tipo === 'contado') {
          comprasContado++;
        } else {
          comprasCredito++;
        }

        // Sumar montos
        montoTotalCompras += parseFloat(compra.total) || 0;
        montoTotalDescuentos += parseFloat(compra.descuento_aplicado) || 0;
        cantidadTotalProductos += parseInt(compra.cantidad_total_productos) || 0;
      });

      // Formatear compras con todos los datos necesarios
      const comprasFormateadas = comprasFiltradas.map((compra) => {
        return {
          idcompra: compra.idcompra,
          nro_factura: compra.nro_factura || 'Sin factura',
          fecha: formatDate(compra.fecha),
          proveedor_nombre: compra.proveedor_nombre,
          proveedor_ruc: compra.proveedor_ruc,
          cajero_nombre: compra.cajero_nombre || 'Sistema',
          tipo: compra.tipo.charAt(0).toUpperCase() + compra.tipo.slice(1),
          estado: compra.estado,
          total: formatNumber(parseFloat(compra.total) || 0),
          total_raw: parseFloat(compra.total) || 0,
          descuento: formatNumber(parseFloat(compra.descuento_aplicado) || 0),
          descuento_raw: parseFloat(compra.descuento_aplicado) || 0,
          total_productos: parseInt(compra.total_productos) || 0,
          cantidad_total_productos: parseInt(compra.cantidad_total_productos) || 0,
          observacion: compra.observacion || '',
          created_at: formatDate(compra.created_at)
        };
      });

      // Determinar el título según el filtro
      let tituloReporte = 'Reporte de Compras';
      if (tipoFiltro && tipoFiltro.trim() !== '') {
        const tipoCapitalizado = tipoFiltro.charAt(0).toUpperCase() + tipoFiltro.slice(1).toLowerCase();
        tituloReporte = `Reporte de Compras - ${tipoCapitalizado}`;
      }

      // Estructura de datos para el reporte
      const datosReporte = {
        empresa: {
          nombre_fantasia: facturador.nombre_fantasia,
          ruc: facturador.ruc,
          timbrado_nro: facturador.timbrado_nro,
          fecha_inicio_vigente: formatDate(facturador.fecha_inicio_vigente),
          fecha_fin_vigente: formatDate(facturador.fecha_fin_vigente),
          fecha_emision
        },
        reporte: {
          titulo: tituloReporte,
          fecha_inicio: formatDate(fechaInicio),
          fecha_fin: formatDate(fechaFin),
          total_compras: totalCompras,
          compras_contado: comprasContado,
          compras_credito: comprasCredito,
          monto_total_compras: formatNumber(montoTotalCompras),
          monto_total_descuentos: formatNumber(montoTotalDescuentos),
          cantidad_total_productos: cantidadTotalProductos,
          compras: comprasFormateadas
        }
      };

      console.log(`📊 Generando reporte de compras (Filtro: ${tipoFiltro || 'Todos'})`);

      // Generar el PDF
      generateReportListCompra(datosReporte)
        .then((reportePDFBase64) => {
          res.status(200).json({
            message: '✅ Reporte de compras generado correctamente',
            reportePDFBase64,
            datosReporte
          });
        })
        .catch((error) => {
          console.error('❌ Error al generar el reporte PDF:', error);
          res.status(500).json({
            error: '❌ Error al generar el reporte PDF',
            details: error.message
          });
        });
    });
  });
};

/**
 * 📚 Generar Libro de Compras formato SET
 * GET /api/compras/libro-compras/pdf?fecha_inicio=2025-01-01&fecha_fin=2025-12-31
 */
export const generateLibroComprasSET = async (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);

  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({ error: '❌ Usuario no autenticado' });
  }

  // Obtener fechas del query params o usar año actual
  const currentYear = new Date().getFullYear();
  const fechaInicio = req.query.fecha_inicio || `${currentYear}-01-01`;
  const fechaFin = req.query.fecha_fin || `${currentYear}-12-31`;

  console.log(`📚 Generando Libro de Compras SET - Usuario: ${idusuarios || idfuncionario}, Período: ${fechaInicio} a ${fechaFin}`);

  const queryEmpresa = `
    SELECT
      f.nombre_fantasia, f.ruc, f.titular, f.timbrado_nro,
      f.fecha_inicio_vigente, f.fecha_fin_vigente,
      f.direccion, f.ciudad,
      GROUP_CONCAT(ae.descripcion SEPARATOR ', ') as actividad_economica
    FROM facturadores f
    LEFT JOIN detalle_actividades_economicas dae ON f.idfacturador = dae.idfacturador
    LEFT JOIN actividades_economicas ae ON dae.idactividad = ae.idactividad
    WHERE f.idusuarios = ? AND f.culminado = 0
    GROUP BY f.idfacturador
    LIMIT 1
  `;

  db.query(queryEmpresa, [idusuarios], (errEmpresa, empresa) => {
    if (errEmpresa) {
      console.error('❌ Error al obtener datos de empresa:', errEmpresa);
      return res.status(500).json({ error: '❌ Error al obtener datos de empresa' });
    }

    if (!empresa || empresa.length === 0) {
      return res.status(404).json({ error: '⚠️ No se encontró facturador activo para este usuario' });
    }

    const empresaData = empresa[0];

    // Query para obtener compras del período
    // Construir condición dinámica basada en qué ID está presente
    let userCondition = '';
    const params = [fechaInicio, fechaFin];

    if (idusuarios && !idfuncionario) {
      userCondition = 'AND c.idusuarios = ?';
      params.push(idusuarios);
    } else if (idfuncionario && !idusuarios) {
      userCondition = 'AND c.idfuncionario = ?';
      params.push(idfuncionario);
    } else if (idusuarios && idfuncionario) {
      userCondition = 'AND (c.idusuarios = ? OR c.idfuncionario = ?)';
      params.push(idusuarios, idfuncionario);
    }

    const queryCompras = `
      SELECT
        c.idcompra,
        DATE_FORMAT(c.fecha, '%d/%m/%Y') as fecha,
        c.nro_factura,
        c.tipo as condicion,
        c.total,
        p.nombre as proveedor_nombre,
        p.ruc as proveedor_ruc,
        dc.cantidad,
        dc.precio,
        dc.precio_compra_caja,
        dc.cant_cajas,
        dc.unidad_medida,
        prod.iva
      FROM compras c
      INNER JOIN proveedor p ON c.idproveedor = p.idproveedor
      LEFT JOIN detalle_compra dc ON c.idcompra = dc.idcompra AND dc.deleted_at IS NULL
      LEFT JOIN productos prod ON dc.idproducto = prod.idproducto
      WHERE c.deleted_at IS NULL
        AND c.estado != 'anulado'
        AND c.fecha BETWEEN ? AND ?
        ${userCondition}
      ORDER BY c.fecha ASC, c.idcompra ASC
    `;

    db.query(queryCompras, params, (errCompras, comprasResult) => {
      if (errCompras) {
        console.error('❌ Error al obtener compras:', errCompras);
        return res.status(500).json({ error: '❌ Error al obtener compras' });
      }

      // Procesar compras y agrupar por factura
      const comprasMap = new Map();

      comprasResult.forEach(row => {
        if (!comprasMap.has(row.idcompra)) {
          comprasMap.set(row.idcompra, {
            idcompra: row.idcompra,
            fecha: row.fecha,
            nro_factura: row.nro_factura || 'S/N',
            proveedor_ruc: row.proveedor_ruc || 'S/RUC',
            proveedor_nombre: row.proveedor_nombre,
            condicion: row.condicion === 'credito' ? 'CRÉDITO' : 'CONTADO',
            total: parseFloat(row.total) || 0,
            subtotalGravado10: 0,
            subtotalGravado5: 0,
            subtotalExento: 0
          });
        }

        const compra = comprasMap.get(row.idcompra);

        // Calcular subtotal del detalle
        let subtotal = 0;
        if (row.unidad_medida === 'CAJA') {
          subtotal = (parseFloat(row.precio_compra_caja) || 0) * (parseFloat(row.cant_cajas) || 0);
        } else {
          subtotal = (parseFloat(row.precio) || 0) * (parseFloat(row.cantidad) || 0);
        }

        // Clasificar según IVA
        const iva = parseFloat(row.iva) || 0;
        if (iva === 10) {
          compra.subtotalGravado10 += subtotal;
        } else if (iva === 5) {
          compra.subtotalGravado5 += subtotal;
        } else {
          compra.subtotalExento += subtotal;
        }
      });

      // Convertir a array y calcular IVA, filtrando compras con total 0
      const comprasArray = Array.from(comprasMap.values())
        .filter(compra => parseFloat(compra.total) > 0) // Excluir compras sin total
        .map(compra => {
          // Base gravada = subtotal / (1 + tasa_iva)
          const baseGravada10 = compra.subtotalGravado10 / 1.10;
          const baseGravada5 = compra.subtotalGravado5 / 1.05;
          const iva10 = baseGravada10 * 0.10;
          const iva5 = baseGravada5 * 0.05;

          return {
            fecha: compra.fecha,
            nro_factura: compra.nro_factura,
            proveedor_ruc: compra.proveedor_ruc,
            proveedor_nombre: compra.proveedor_nombre,
            condicion: compra.condicion,
            gravada_10: baseGravada10.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
            gravada_5: baseGravada5.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
            exenta: compra.subtotalExento.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
            iva_10: iva10.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
            iva_5: iva5.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
            total: parseFloat(compra.total || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
          };
        });

      // Calcular totales
      let totalGravada10 = 0;
      let totalGravada5 = 0;
      let totalExenta = 0;
      let totalIva10 = 0;
      let totalIva5 = 0;
      let totalGeneral = 0;

      comprasArray.forEach(compra => {
        totalGravada10 += parseFloat(compra.gravada_10.replace(/\./g, '')) || 0;
        totalGravada5 += parseFloat(compra.gravada_5.replace(/\./g, '')) || 0;
        totalExenta += parseFloat(compra.exenta.replace(/\./g, '')) || 0;
        totalIva10 += parseFloat(compra.iva_10.replace(/\./g, '')) || 0;
        totalIva5 += parseFloat(compra.iva_5.replace(/\./g, '')) || 0;
        totalGeneral += parseFloat(compra.total.replace(/\./g, '')) || 0;
      });

      // Estadísticas
      const comprasContado = comprasArray.filter(c => c.condicion === 'CONTADO').length;
      const comprasCredito = comprasArray.filter(c => c.condicion === 'CRÉDITO').length;

      // Formatear fechas de vigencia
      const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-PY');
      };

      // Formatear fechas del período (evita problema de zona horaria)
      const formatFechaString = (fechaStr) => {
        if (!fechaStr) return 'N/A';
        const [year, month, day] = fechaStr.split('-');
        return `${day}/${month}/${year}`;
      };

      // Preparar datos para el template
      const dataReport = {
        empresa: {
          nombre_fantasia: empresaData.nombre_fantasia || 'N/A',
          ruc: empresaData.ruc || 'N/A',
          actividad_economica: empresaData.actividad_economica || 'N/A',
          direccion: `${empresaData.direccion || 'N/A'}, ${empresaData.ciudad || ''}`.trim(),
          timbrado_nro: empresaData.timbrado_nro || 'N/A',
          fecha_inicio_vigente: formatFecha(empresaData.fecha_inicio_vigente),
          fecha_fin_vigente: formatFecha(empresaData.fecha_fin_vigente),
          fecha_emision: new Date().toLocaleDateString('es-PY')
        },
        reporte: {
          fecha_inicio: formatFechaString(fechaInicio),
          fecha_fin: formatFechaString(fechaFin),
          compras: comprasArray,
          totales: {
            gravada_10: totalGravada10.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
            gravada_5: totalGravada5.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
            exenta: totalExenta.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
            iva_10: totalIva10.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
            iva_5: totalIva5.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
            total_iva: (totalIva10 + totalIva5).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
            total: totalGeneral.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
          },
          estadisticas: {
            total_facturas: comprasArray.length,
            compras_contado: comprasContado,
            compras_credito: comprasCredito
          }
        }
      };

      console.log(`✅ Generando PDF con ${comprasArray.length} compras`);

      // Generar PDF
      generateLibroCompras(dataReport)
        .then(pdfBase64 => {
          res.json({
            success: true,
            message: '✅ Libro de Compras generado exitosamente',
            reportePDFBase64: pdfBase64,
            estadisticas: dataReport.reporte.estadisticas
          });
        })
        .catch(error => {
          console.error('❌ Error al generar PDF:', error);
          res.status(500).json({
            error: '❌ Error al generar el Libro de Compras PDF',
            details: error.message
          });
        });
    });
  });
};