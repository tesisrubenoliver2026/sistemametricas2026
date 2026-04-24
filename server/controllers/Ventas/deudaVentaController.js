// controllers/Ventas/deudaVentaController.js
import DeudaVenta from '../../models/Venta/DeudaVenta.js';
import DetallePagoDeudaVenta from '../../models/Venta/DetallePagoDeudaVenta.js';
import Ingreso from '../../models/Movimiento/Ingreso.js';
import Facturador from '../../models/facturadorModel.js';
import Cliente from '../../models/Cliente.js';
import DetalleTransferenciaCobro from '../../models/Venta/Venta_Credito/DetalleTransferenciaCobro.js';
import { generarComprobantePagoDeuda } from '../../report/reportComprobantePagoDeuda.js';
import DetalleTarjetaVentaCobro from '../../models/Venta/Venta_Credito/DetalleTarjetaVentaCobro.js';
import { generarReporteDeudasporCliente } from '../../report/reportVentasporCliente.js';
import DetalleChequeVentaCobro from '../../models/Venta/Venta_Credito/DetalleChequeVentaCobro.js';
import { generarReportePagosCliente } from '../../report/reportPagosCliente.js';
import MovimientoCaja from '../../models/MovimientoCaja.js';
import db from '../../db.js';
import { getUserId } from '../../utils/getUserId.js';
import Funcionario from '../../models/Funcionario.js';
import { aplicarPagoACuotas } from './helpers/aplicarPagoACuotas.js';
import { aplicarPagoACuotaEspecifica } from './helpers/aplicarPagoACuotaEspecifica.js';
import revertirPagoCuotas from './helpers/revertirPagoCuotas.js';

export const pagarDeuda = (req, res) => {
    const { iddeuda, monto, observacion, idformapago, creado_por, iddetalle_cuota } = req.body;

    const { idusuarios, idfuncionario } = getUserId(req);
    const { tipo } = req.user || {};

    if (!idusuarios && !idfuncionario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const idusuario = idusuarios; // Para compatibilidad con el código existente

    if (!iddeuda || !monto || isNaN(monto)) {
        return res.status(400).json({ error: '❌ Datos inválidos para el pago.' });
    }

    // ✅ Consulta ampliada para incluir tiene_cuotas
    const saldoQuery = `SELECT saldo, total_pagado, total_deuda, tiene_cuotas FROM deuda_venta WHERE iddeuda = ?`;
    db.query(saldoQuery, [iddeuda], (errSaldo, rows) => {
        if (errSaldo) {
            console.error('❌ Error al consultar el saldo de la deuda:', errSaldo);
            return res.status(500).json({ error: '❌ Error al consultar el saldo de la deuda.' });
        }

        if (!rows.length) return res.status(404).json({ error: '❌ Deuda no encontrada.' });

        const saldoActual = parseFloat(rows[0].saldo);
        const montoRecibido = parseFloat(monto);
        const totalDeuda = parseFloat(rows[0].total_deuda);
        const totalPagadoAnterior = parseFloat(rows[0].total_pagado);
        const tiene_cuotas = rows[0].tiene_cuotas || 'false'; // ✅ NUEVO
        const montoAplicado = montoRecibido > saldoActual ? saldoActual : montoRecibido;
        const totalPagadoNuevo = totalPagadoAnterior + montoAplicado;
        const vuelto = montoRecibido > saldoActual ? montoRecibido - saldoActual : 0;
        const saldoRestante = saldoActual - montoAplicado;

        const nuevoPago = {
            iddeuda,
            total_deuda: totalDeuda,
            total_pagado: totalPagadoNuevo,
            saldo: saldoRestante,
            monto_pagado: montoAplicado,
            fecha_pago: new Date(),
            observacion: observacion || '',
            idformapago: idformapago || 'Desconocido',
            creado_por: idusuario || 'sistema'
        };

        DetallePagoDeudaVenta.create(nuevoPago, (errPago, resultPago) => {
            if (errPago) {
                console.error('❌ Error al registrar el detalle del pago:', errPago);
                return res.status(500).json({ error: '❌ Error al registrar el detalle del pago.' });
            }

            const idpago_deuda = resultPago.insertId;

            // ✅ Si tiene cuotas, aplicar el pago
            if (tiene_cuotas === 'true') {
                // Si se especifica una cuota, aplicar solo a esa cuota
                if (iddetalle_cuota) {
                    aplicarPagoACuotaEspecifica(
                        { iddeuda, iddetalle_cuota, idpago_deuda, monto_pagado: montoAplicado },
                        (errAplicar, resultadoAplicacion) => {
                            if (errAplicar) {
                                console.error('❌ Error al aplicar pago a cuota específica:', errAplicar);
                                // No retornar error, continuar con el flujo normal
                            } else {
                                console.log('✅ Pago aplicado a cuota específica:', {
                                    cuota_afectada: resultadoAplicacion.cuota_afectada,
                                    monto_aplicado: resultadoAplicacion.monto_aplicado,
                                    saldo_a_favor: resultadoAplicacion.saldo_a_favor,
                                    nuevo_estado: resultadoAplicacion.nuevo_estado_cuota
                                });
                            }
                        }
                    );
                } else {
                    // Si no se especifica cuota, usar FIFO automático
                    aplicarPagoACuotas(
                        { iddeuda, idpago_deuda, monto_pagado: montoAplicado },
                        (errAplicar, resultadoAplicacion) => {
                            if (errAplicar) {
                                console.error('❌ Error al aplicar pago a cuotas:', errAplicar);
                                // No retornar error, continuar con el flujo normal
                            } else {
                                console.log('✅ Pago distribuido en cuotas (FIFO):', {
                                    cuotas_afectadas: resultadoAplicacion.cuotas_afectadas,
                                    monto_aplicado: resultadoAplicacion.monto_aplicado,
                                    saldo_a_favor: resultadoAplicacion.saldo_a_favor
                                });
                            }
                        }
                    );
                }
            }

            DeudaVenta.registrarPago(iddeuda, montoAplicado, (errUpdate) => {
                if (errUpdate) {
                    console.error('❌ Error al actualizar la deuda:', errUpdate);
                    return res.status(500).json({ error: '❌ Error al actualizar la deuda.' });
                }

                // Helper para buscar movimiento con filtrado
                const buscarMovimientoYCrearIngreso = (idsusuarios, idfuncionariosIds) => {
                    MovimientoCaja.getMovimientoAbierto(idsusuarios, idfuncionariosIds, (errMov, movResult) => {
                        if (errMov || !movResult.length) {
                            console.error('❌ Error al obtener movimiento de caja para ingreso:', errMov);
                            return res.status(500).json({ error: '❌ Error al registrar ingreso en caja.' });
                        }

                        const idmovimiento = movResult[0].idmovimiento;
                    const nuevoIngreso = {
                        fecha: new Date(),
                        hora: null,
                        monto: montoAplicado,
                        concepto: `Cobro de deuda de venta ID ${iddeuda}`,
                        idtipo_ingreso: 2,
                        idformapago,
                        observacion: observacion || '',
                        idmovimiento,
                        creado_por: idusuario || 'sistema',
                        idpago_deuda
                    };

                    Ingreso.create(nuevoIngreso, (errIngreso, resultIngreso) => {
                        if (errIngreso) {
                            console.error('❌ Error al registrar ingreso:', errIngreso);
                            return res.status(500).json({ error: '❌ Error al registrar ingreso.' });
                        }

                        const idingreso = resultIngreso.insertId;

                        // Detalle de transferencia
                        if (idformapago === 2 && req.body.detalle_transferencia) {
                            const { banco_origen, numero_cuenta, tipo_cuenta, titular_cuenta, observacion } = req.body.detalle_transferencia;
                            const datosTransferencia = { idingreso, banco_origen, numero_cuenta, tipo_cuenta, titular_cuenta, observacion };
                            DetalleTransferenciaCobro.create(datosTransferencia, (errInsert, insertResult) => {
                                if (errInsert) console.error('❌ Error al insertar detalle transferencia cobro:', errInsert);
                                else {
                                    const iddetalle_transferencia_cobro = insertResult.insertId;
                                    DetallePagoDeudaVenta.updateTransferenciaId(idpago_deuda, iddetalle_transferencia_cobro, (errUpdate) => {
                                        if (errUpdate) console.error('❌ Error al actualizar detalle_pago_deuda_venta con iddetalle_transferencia_cobro:', errUpdate);
                                    });

                                    Ingreso.updateTransferenciaId(idingreso, iddetalle_transferencia_cobro, (errUpdate) => {
                                        if (errUpdate) console.error('❌ Error al actualizar ingreso con iddetalle_transferencia_cobro:', errUpdate);
                                    });
                                }
                            });
                        }

                        // Detalle de tarjeta
                        if (idformapago === 4 && req.body.detalle_tarjeta_venta_credito) {
                            const { tipo_tarjeta, entidad, monto, observacion } = req.body.detalle_tarjeta_venta_credito;
                            const datosTarjeta = { idingreso, tipo_tarjeta, entidad, monto, observacion };
                            DetalleTarjetaVentaCobro.create(datosTarjeta, (errInsert, insertResult) => {
                                if (errInsert) console.error('❌ Error al insertar detalle tarjeta venta cobro:', errInsert);
                                else {
                                    const iddetalle_tarjeta_venta_cobro = insertResult.insertId;

                                    DetallePagoDeudaVenta.updateTarjetasId(idpago_deuda, iddetalle_tarjeta_venta_cobro, (errUpdate) => {
                                        if (errUpdate) console.error('❌ Error al actualizar detalle_pago_deuda_venta con iddetalle_tarjeta_venta_cobro:', errUpdate);
                                    });
                                    Ingreso.updateTarjetasId(idingreso, iddetalle_tarjeta_venta_cobro, (errUpdate) => {
                                        if (errUpdate) console.error('❌ Error al actualizar ingreso con iddetalle_tarjeta_venta_cobro:', errUpdate);
                                    });
                                }
                            });
                        }

                        // Detalle de cheque
                        if (idformapago === 3 && req.body.detalle_cheque_venta_cobro) {
                            const { banco, nro_cheque, monto, fecha_emision, fecha_vencimiento, titular, estado } = req.body.detalle_cheque_venta_cobro;
                            const datosCheque = {
                                idingreso,
                                banco,
                                nro_cheque,
                                monto,
                                fecha_emision,
                                fecha_vencimiento,
                                titular,
                                estado: estado || 'pendiente'
                            };
                            DetalleChequeVentaCobro.create(datosCheque, (errInsert, insertResult) => {
                                if (errInsert) {
                                    console.error('❌ Error al insertar detalle cheque venta cobro:', errInsert);
                                } else {
                                    const iddetalle_cheque_venta_cobro = insertResult.insertId;

                                    DetallePagoDeudaVenta.updateChequeId(idpago_deuda, iddetalle_cheque_venta_cobro, (errUpdate) => {
                                        if (errUpdate) console.error('❌ Error al actualizar detalle_pago_deuda_venta con iddetalle_cheque_venta_cobro:', errUpdate);
                                    });
                                    Ingreso.updateChequeId(idingreso, iddetalle_cheque_venta_cobro, (errUpdate) => {
                                        if (errUpdate) {
                                            console.error('❌ Error al actualizar ingreso con iddetalle_cheque_venta_cobro:', errUpdate);
                                        }
                                    });
                                }
                            });
                        }
                        Facturador.findActivo((errFact, factResult) => {
                            if (errFact || !factResult.length) {
                                console.warn('⚠️ No se encontró facturador activo');
                                return res.status(200).json({
                                    message: '✅ Pago de deuda registrado correctamente.',
                                    idingreso,
                                    montoAplicado,
                                    vuelto,
                                    empresa: null,
                                    cliente: null,
                                    productos: [],
                                    saldo_restante: null,
                                    total_pagado_actual: null
                                });
                            }

                            const facturador = factResult[0];

                            const formatDate = (date) => {
                                if (!date) return '';
                                const d = new Date(date);
                                const day = String(d.getDate()).padStart(2, '0');
                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                const year = d.getFullYear();
                                return `${day}/${month}/${year}`;
                            };

                            const empresa = {
                                nombre_fantasia: facturador.nombre_fantasia,
                                ruc: facturador.ruc,
                                timbrado_nro: facturador.timbrado_nro,
                                fecha_inicio_vigente: formatDate(facturador.fecha_inicio_vigente),
                                fecha_fin_vigente: formatDate(facturador.fecha_fin_vigente),
                                fecha_emision: formatDate(new Date())
                            };

                            // 🔎 Traer datos del cliente y la venta asociada
                            const clienteQuery = `
                                SELECT c.nombre, c.apellido, c.numDocumento, c.telefono, d.idventa
                                FROM deuda_venta d
                                JOIN clientes c ON d.idcliente = c.idcliente
                                WHERE d.iddeuda = ?
                            `;

                            db.query(clienteQuery, [iddeuda], (errCliente, clienteRows) => {
                                if (errCliente) {
                                    console.error('❌ Error al obtener datos del cliente:', errCliente);
                                    return res.status(500).json({ error: '❌ Error al obtener datos del cliente.' });
                                }

                                const cliente = clienteRows[0] || null;
                                if (!cliente?.idventa) {
                                    return res.status(404).json({ error: '❌ No se encontró venta asociada a la deuda.' });
                                }

                                const idventa = cliente.idventa;

                                // 🔎 Traer productos relacionados a la venta
                                const productosQuery = `
                                    SELECT 
                                        dv.nombre_producto,
                                        dv.cantidad,
                                        dv.precio_venta,
                                        dv.sub_total,
                                        p.unidad_medida,
                                        p.cod_barra
                                    FROM detalle_venta dv
                                    JOIN productos p ON dv.idproducto = p.idproducto
                                    WHERE dv.idventa = ?
                                `;

                                db.query(productosQuery, [idventa], (errProductos, productosRows) => {
                                    if (errProductos) {
                                        console.error('❌ Error al obtener productos de la venta:', errProductos);
                                        return res.status(500).json({ error: '❌ Error al obtener productos de la venta.' });
                                    }

                                    // 🔄 Traer deuda actualizada
                                    const deudaQuery = `SELECT saldo, total_pagado, total_deuda  FROM deuda_venta WHERE iddeuda = ?`;
                                    db.query(deudaQuery, [iddeuda], (errDeuda, deudaRows) => {
                                        if (errDeuda) {
                                            console.error('❌ Error al obtener datos actualizados de la deuda:', errDeuda);
                                            return res.status(500).json({ error: '❌ Error al obtener el estado actual de la deuda.' });
                                        }

                                        const deudaActualizada = deudaRows[0] || { saldo: 0, total_pagado: 0, total_deuda: 0 };

                                        const datosComprobante = {
                                            empresa,
                                            cliente: {
                                                nombre: cliente.nombre,
                                                apellido: cliente.apellido,
                                                numDocumento: cliente.numDocumento,
                                                telefono: cliente.telefono
                                            },
                                            productos: productosRows,
                                            montoAplicado,
                                            vuelto,
                                            saldo_restante: parseFloat(deudaActualizada.saldo),
                                            total_pagado_actual: parseFloat(deudaActualizada.total_pagado),
                                            total_deuda: parseFloat(deudaActualizada.total_deuda),
                                            fecha_pago: new Date(),
                                            idingreso,
                                            iddeuda
                                        };

                                        generarComprobantePagoDeuda(datosComprobante)
                                            .then((comprobanteBase64) => {
                                                return res.status(200).json({
                                                    message: '✅ Pago de deuda registrado correctamente.',
                                                    comprobanteBase64,
                                                    ...datosComprobante
                                                });
                                            })
                                            .catch((error) => {
                                                console.error('❌ Error al generar el comprobante de pago:', error);
                                                return res.status(500).json({
                                                    error: '❌ Pago realizado, pero ocurrió un error al generar el comprobante.'
                                                });
                                            });

                                        /* return res.json({
                                             //Respuesta si no queremos enviar el comprobante en la respuesta
                                             message: '✅ Pago de deuda registrado correctamente.',
                                             idingreso,
                                             montoAplicado,
                                             vuelto,
                                             saldo_restante: parseFloat(deudaActualizada.saldo),
                                             total_pagado_actual: parseFloat(deudaActualizada.total_pagado),
                                             total_deuda: parseFloat(deudaActualizada.total_deuda),
                                             empresa,
                                             cliente: {
                                                 nombre: cliente.nombre,
                                                 apellido: cliente.apellido,
                                                 numDocumento: cliente.numDocumento,
                                                 telefono: cliente.telefono
                                             },
                                             productos: productosRows
                                         });
                                         */

                                    });
                                });
                            });
                        });
                    });
                    });
                };

                // Ejecutar según tipo de usuario
                if (tipo === 'funcionario') {
                    buscarMovimientoYCrearIngreso(null, idfuncionario);
                } else {
                    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
                        if (err) return res.status(500).json({ error: '❌ Error al buscar funcionarios relacionados' });
                        const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');
                        buscarMovimientoYCrearIngreso(idusuarios, funcionariosIds);
                    });
                }
            });
        });
    });
};

export const getComprobantePagoDeuda = (req, res) => {
    const { idpago_deuda } = req.params;
    if (!idpago_deuda) return res.status(400).json({ error: 'Falta idpago_deuda' });



    DetallePagoDeudaVenta.getPagoById(idpago_deuda, (errPago, pago) => {
        if (errPago) return res.status(500).json({ error: errPago });
        if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
        if (!pago.idventa) return res.status(400).json({ error: 'No existe venta asociada a la deuda.' });

        const formatDDMMYYYY = (value) => {
            if (!value) return "";
            const d = value instanceof Date ? value : new Date(value);
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        };

        const fechaPagoFormat = formatDDMMYYYY(pago.fecha_pago)
        Facturador.findActivo((errFact, factResult) => {
            if (errFact) return res.status(500).json({ error: 'Error obteniendo datos de empresa' });

            const fact = factResult?.[0] || {};
            const empresa = {
                nombre_fantasia: fact.nombre_fantasia,
                ruc: fact.ruc,
                timbrado_nro: fact.timbrado_nro,
                fecha_inicio_vigente: formatDDMMYYYY(fact.fecha_inicio_vigente),
                fecha_fin_vigente: formatDDMMYYYY(fact.fecha_fin_vigente),
                fecha_emision: fechaPagoFormat, // setéala si querés
            };

            const cliente = {
                nombre: pago.nombre,
                apellido: pago.apellido,
                numDocumento: pago.numDocumento,
                telefono: pago.telefono,
            };

            DetallePagoDeudaVenta.getTotalPagadoActual(pago.iddeuda, (errTot, total_pagado_actual) => {
                if (errTot) return res.status(500).json({ error: errTot });

                const total_deuda = parseFloat(pago.total_deuda);
                const montoAplicado = parseFloat(pago.monto_pagado);
                const saldo_restante = parseFloat(pago.saldo);
                const vuelto = 0;

                const productosQuery = `
          SELECT 
            dv.nombre_producto,
            dv.cantidad,
            dv.precio_venta,
            dv.sub_total,
            p.unidad_medida,
            p.cod_barra
          FROM detalle_venta dv
          LEFT JOIN productos p ON dv.idproducto = p.idproducto
          WHERE dv.idventa = ?
        `;

                db.query(productosQuery, [pago.idventa], (errProd, productosRows) => {
                    if (errProd) return res.status(500).json({ error: 'Error al obtener productos de la venta.' });
                    if (!productosRows.length) return res.status(404).json({ error: 'No se encontraron productos para la venta.' });

                    const datosComprobante = {
                        empresa,
                        cliente,
                        productos: productosRows,
                        montoAplicado,
                        vuelto,
                        saldo_restante,
                        total_pagado_actual: parseFloat(total_pagado_actual || 0),
                        total_deuda,
                        fecha_pago: fechaPagoFormat,
                        iddeuda: pago.iddeuda,
                        idpago_deuda
                    };

                    generarComprobantePagoDeuda(datosComprobante)
                        .then((comprobanteBase64) => {
                            res.status(200).json({
                                message: '✅ Pago de deuda registrado correctamente.',
                                comprobanteBase64,
                                ...datosComprobante
                            });
                        })
                        .catch((error) => {
                            console.error('❌ Error al generar el comprobante de pago:', error);
                            res.status(500).json({
                                error: '❌ Pago realizado, pero ocurrió un error al generar el comprobante.'
                            });
                        });
                });
            });
        });
    });
};

export const getPagosDeudaDetalle = (req, res) => {
    const iddeuda = req.params.iddeuda;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const search = req.query.search || '';
    let fecha_inicio = req.query.fecha_inicio || '1900-01-01';
    let fecha_fin = req.query.fecha_fin || '2100-01-01';

    if (new Date(fecha_inicio) > new Date(fecha_fin)) {
        [fecha_inicio, fecha_fin] = [fecha_fin, fecha_inicio];
    }
    const fechaFinCompleta = `${fecha_fin} 23:59:59`;

    // 1) Traer cliente
    DetallePagoDeudaVenta.getClienteByDeuda(iddeuda, (errCli, cliente) => {
        if (errCli) return res.status(500).json({ error: errCli });

        // 2) Traer facturador activo (empresa)
        Facturador.findActivo((errFact, factRows) => {
            if (errFact || !factRows?.length) {
                return res.status(400).json({ error: '⚠️ No hay facturador activo disponible' });
            }
            const f = factRows[0];
            const empresa = {
                nombre_fantasia: f.nombre_fantasia,
                ruc: f.ruc,
                timbrado_nro: f.timbrado_nro,
                fecha_inicio_vigente: f.fecha_inicio_vigente,
                fecha_fin_vigente: f.fecha_fin_vigente,
            };

            // 3) Conteo
            DetallePagoDeudaVenta.countByDeudaFiltered(
                iddeuda,
                search,
                fecha_inicio,
                fechaFinCompleta,
                (errCount, total) => {
                    if (errCount) return res.status(500).json({ error: errCount });

                    // 4) Datos paginados
                    DetallePagoDeudaVenta.findByDeudaPaginated(
                        iddeuda,
                        limit,
                        offset,
                        search,
                        fecha_inicio,
                        fechaFinCompleta,
                        (err, data) => {
                            if (err) return res.status(500).json({ error: err });

                            const totalPages = Math.ceil(total / limit);

                            res.json({
                                empresa,   // 👈 objeto plano de empresa/facturador
                                cliente,   // 👈 objeto plano de cliente
                                data,      // pagos
                                totalItems: total,
                                totalPages,
                                currentPage: page,
                            });
                        }
                    );
                }
            );
        });
    });
};



export const getAllPagosDeudaDetalle = (req, res) => {
    const iddeuda = req.params.iddeuda;
    const search = req.query.search || '';
    let fecha_inicio = req.query.fecha_inicio || '1900-01-01';
    let fecha_fin = req.query.fecha_fin || '2100-01-01';

    // Validar fechas
    if (new Date(fecha_inicio) > new Date(fecha_fin)) {
        const temp = fecha_inicio;
        fecha_inicio = fecha_fin;
        fecha_fin = temp;
    }

    const fechaFinCompleta = `${fecha_fin} 23:59:59`;

    // Paso 1: buscar los pagos por deuda
    DetallePagoDeudaVenta.getAllByDeudaFiltered(
        iddeuda,
        search,
        fecha_inicio,
        fechaFinCompleta,
        (err, pagos) => {
            if (err) return res.status(500).json({ error: err });

            // Paso 2: buscar deuda_venta para obtener idcliente
            DeudaVenta.findById(iddeuda, (errDeuda, deudaData) => {
                if (errDeuda || !deudaData) {
                    return res.status(404).json({ error: '⚠️ No se encontró la deuda asociada.' });
                }

                const idcliente = deudaData.idcliente;

                // Paso 3: buscar datos del cliente
                Cliente.findById(idcliente, (errCliente, clienteData) => {
                    if (errCliente || !clienteData) {
                        return res.status(404).json({ error: '⚠️ No se encontró el cliente asociado.' });
                    }

                    const data = Array.isArray(clienteData) ? clienteData[0] : clienteData;
                    const cliente = {
                        nombre: data.nombre,
                        apellido: data.apellido,
                        numDocumento: data.numDocumento,
                        telefono: data.telefono
                    };

                    // Paso 4: buscar facturador
                    Facturador.findActivo((errFact, factResult) => {
                        if (errFact || !factResult.length) {
                            return res.status(400).json({ error: '⚠️ No se encontró facturador activo' });
                        }

                        const facturador = factResult[0];

                        const formatDate = (date) => {
                            if (!date) return '';
                            const d = new Date(date);
                            const day = String(d.getDate()).padStart(2, '0');
                            const month = String(d.getMonth() + 1).padStart(2, '0');
                            const year = d.getFullYear();
                            return `${day}/${month}/${year}`;
                        };

                        const empresas = {
                            nombre_fantasia: facturador.nombre_fantasia,
                            ruc: facturador.ruc,
                            timbrado_nro: facturador.timbrado_nro,
                            fecha_inicio_vigente: formatDate(facturador.fecha_inicio_vigente),
                            fecha_fin_vigente: formatDate(facturador.fecha_fin_vigente),
                            fecha_emision: formatDate(new Date())
                        };

                        // 👉 Formatear los pagos para el reporte
                        const detalle_pagos = pagos.map(p => {
                            const detalles = [];

                            if (p.idformapago === 1) {
                                detalles.push({ label: 'Forma de Pago', value: 'Efectivo' });
                            } else if (p.idformapago === 2) {
                                detalles.push({ label: 'Forma de Pago', value: 'Transferencia Bancaria' });
                                detalles.push({ label: 'Banco Origen', value: p.transferencia_banco_origen || '-' });
                                detalles.push({ label: 'Número de Cuenta', value: p.transferencia_numero_cuenta || '-' });
                                detalles.push({ label: 'Tipo de Cuenta', value: p.transferencia_tipo_cuenta || '-' });
                                detalles.push({ label: 'Titular de la Cuenta', value: p.transferencia_titular_cuenta || '-' });
                                detalles.push({ label: 'Observación', value: p.transferencia_observacion || '-' });
                            } else if (p.idformapago === 3) {
                                detalles.push({ label: 'Forma de Pago', value: 'Cheque' });
                                detalles.push({ label: 'Banco', value: p.cheque_banco || '-' });
                                detalles.push({ label: 'N° Cheque', value: p.cheque_nro_cheque || '-' });
                                detalles.push({ label: 'Fecha Emisión', value: p.cheque_fecha_emision || '-' });
                                detalles.push({ label: 'Fecha Vencimiento', value: p.cheque_fecha_vencimiento || '-' });
                                detalles.push({ label: 'Titular', value: p.cheque_titular || '-' });
                                detalles.push({ label: 'Estado', value: p.cheque_estado || '-' });
                            } else if (p.idformapago === 4) {
                                detalles.push({ label: 'Forma de Pago', value: 'Tarjeta C/D' });
                                detalles.push({ label: 'Tipo de Tarjeta', value: p.tarjeta_tipo_tarjeta || '-' });
                                detalles.push({ label: 'Entidad', value: p.tarjeta_entidad || '-' });
                                detalles.push({ label: 'Monto', value: p.tarjeta_monto || '-' });
                                detalles.push({ label: 'Observación', value: p.tarjeta_observacion || '-' });
                            } else {
                                detalles.push({ label: 'Forma de Pago', value: 'No especificado' });
                            }

                            return {
                                fecha_pago: formatDate(p.fecha_pago),
                                monto_pagado: p.monto_pagado,
                                observacion: p.observacion,
                                detalles
                            };
                        });
                        // 🚀 Generar reporte con helper
                        const datosReporte = {
                            detalle_pagos,
                            cliente,
                            empresas,
                        };


                        generarReportePagosCliente(datosReporte)
                            .then((comprobanteBase64) => {
                                return res.status(200).json({
                                    message: '✅ Pago de deuda registrado correctamente.',
                                    comprobanteBase64,
                                    ...datosReporte
                                });
                            })
                            .catch((error) => {
                                console.error('❌ Error al generar el comprobante de pago:', error);
                                return res.status(500).json({
                                    error: '❌ Pago realizado, pero ocurrió un error al generar el comprobante.'
                                });
                            });

                    });
                });
            });
        }
    );
};


export const listarDeudas = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const estado = req.query.estado || '';

    const { idusuarios, idfuncionario } = getUserId(req);
    const { tipo } = req.user || {};

    if (!idusuarios && !idfuncionario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    console.log('🔍 Filtrando deudas de venta para:', { tipo, idusuarios, idfuncionario });

    // Si es un funcionario, solo ve sus propias deudas de venta
    if (tipo === 'funcionario') {
        return DeudaVenta.countFilteredByUser(search, estado, null, idfuncionario, (err, total) => {
            if (err) return res.status(500).json({ error: err });

            DeudaVenta.findAllPaginatedFilteredByUser(limit, offset, search, estado, null, idfuncionario, (err, data) => {
                if (err) return res.status(500).json({ error: err });

                const totalPages = Math.ceil(total / limit);
                res.json({
                    data,
                    totalItems: total,
                    totalPages,
                    currentPage: page,
                });
            });
        });
    }

    // Si es un usuario administrador, buscar sus funcionarios relacionados
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
        if (err) return res.status(500).json({ error: err });

        const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');

        console.log('👥 Funcionarios relacionados:', funcionariosIds || 'ninguno');

        return DeudaVenta.countFilteredByUser(search, estado, idusuarios, funcionariosIds, (err, total) => {
            if (err) return res.status(500).json({ error: err });

            console.log('📊 Total deudas de venta encontradas:', total);

            DeudaVenta.findAllPaginatedFilteredByUser(limit, offset, search, estado, idusuarios, funcionariosIds, (err, data) => {
                if (err) return res.status(500).json({ error: err });

                console.log('📦 Deudas de venta obtenidas:', data.length);

                const totalPages = Math.ceil(total / limit);
                res.json({
                    data,
                    totalItems: total,
                    totalPages,
                    currentPage: page,
                });
            });
        });
    });
};

export const listarDeudasCompleto = (req, res) => {
    const numDocumento = req.query.numDocumento || '';
    const estado = req.query.estado || '';

    const { idusuarios, idfuncionario } = getUserId(req);
    const { tipo } = req.user || {};

    if (!idusuarios && !idfuncionario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!numDocumento) {
        return res.status(400).json({ error: 'El campo numDocumento es requerido.' });
    }

    console.log('🔍 Filtrando deudas completas por numDocumento para:', { tipo, idusuarios, idfuncionario });

    // Helper para procesar el reporte
    const procesarReporte = (idsusuarios, idfuncionariosIds) => {
        DeudaVenta.getAllByNumDocumentoAndEstadoByUser(numDocumento, estado, idsusuarios, idfuncionariosIds, (err, data) => {
            if (err) return res.status(500).json({ error: err });

            if (!data || data.length === 0) {
                return res.status(404).json({ error: 'No se encontraron deudas para el cliente.' });
            }

            Facturador.findActivo((errFact, factResult) => {
                if (errFact || !factResult.length) {
                    return res.status(400).json({ error: '⚠️ No se encontró facturador activo' });
                }

                const facturador = factResult[0];

                const formatDate = (date) => {
                    if (!date) return '';
                    const d = new Date(date);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    return `${day}/${month}/${year}`;
                };

                const fecha_emision = formatDate(new Date());
                const fecha_generada = new Date().toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit", year: "numeric" });

                const cliente = {
                    nombre_cliente: data[0].nombre_cliente,
                    numDocumento: data[0].numDocumento
                };

                const deudas = data.map((d) => {
                    const { nombre_cliente, numDocumento, ...rest } = d;
                    return {
                        ...rest,
                        fecha_deuda: formatDate(d.fecha_deuda),
                        ult_fecha_pago: d.ult_fecha_pago ? formatDate(d.ult_fecha_pago) : "--",
                        created_at: formatDate(d.created_at)
                    };
                });

                const empresa = {
                    nombre_fantasia: facturador.nombre_fantasia,
                    ruc: facturador.ruc,
                    timbrado_nro: facturador.timbrado_nro,
                    fecha_inicio_vigente: formatDate(facturador.fecha_inicio_vigente),
                    fecha_fin_vigente: formatDate(facturador.fecha_fin_vigente),
                    fecha_emision
                };

                const datosReporte = {
                    fecha_generada,
                    empresa,
                    cliente,
                    deudas,
                    debe_total: deudas.reduce((sum, d) => sum + parseFloat(d.total_deuda), 0).toFixed(2),
                    saldo_total: deudas.reduce((sum, d) => sum + parseFloat(d.saldo), 0).toFixed(2),
                    pagado_total: deudas.reduce((sum, d) => sum + parseFloat(d.total_pagado), 0).toFixed(2)
                };

                console.log('📄 Datos del reporte de deudas:', datosReporte);

                generarReporteDeudasporCliente(datosReporte)
                    .then((reportePDFBase64) => {
                        res.status(200).json({
                            message: '✅ Reporte generado correctamente',
                            reportePDFBase64,
                            datosReporte
                        });
                    })
                    .catch((error) => {
                        console.error('❌ Error al generar el reporte PDF:', error);
                        res.status(500).json({ error: '❌ Error al generar el reporte PDF' });
                    });
            });
        });
    };

    // Ejecutar según tipo de usuario
    if (tipo === 'funcionario') {
        procesarReporte(null, idfuncionario);
    } else {
        Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
            if (err) return res.status(500).json({ error: err });
            const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');
            procesarReporte(idusuarios, funcionariosIds);
        });
    }
};

export const listarDeudasAgrupadasPorCliente = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const { idusuarios, idfuncionario } = getUserId(req);
    const { tipo } = req.user || {};

    if (!idusuarios && !idfuncionario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    console.log('🔍 Filtrando deudas agrupadas por cliente (paginado) para:', { tipo, idusuarios, idfuncionario });

    // Si es un funcionario, solo ve sus propias deudas de venta agrupadas
    if (tipo === 'funcionario') {
        return DeudaVenta.countFilteredByClienteAndUser(search, null, idfuncionario, (err, total) => {
            if (err) return res.status(500).json({ error: err });

            DeudaVenta.findAllPaginatedFilteredByClienteAndUser(limit, offset, search, null, idfuncionario, (err, data) => {
                if (err) return res.status(500).json({ error: err });

                const totalPages = Math.ceil(total / limit);
                res.json({
                    data,
                    totalItems: total,
                    totalPages,
                    currentPage: page,
                });
            });
        });
    }

    // Si es un usuario administrador, buscar sus funcionarios relacionados
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
        if (err) return res.status(500).json({ error: err });

        const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');

        console.log('👥 Funcionarios relacionados:', funcionariosIds || 'ninguno');

        return DeudaVenta.countFilteredByClienteAndUser(search, idusuarios, funcionariosIds, (err, total) => {
            if (err) return res.status(500).json({ error: err });

            console.log('📊 Total clientes con deudas encontrados:', total);

            DeudaVenta.findAllPaginatedFilteredByClienteAndUser(limit, offset, search, idusuarios, funcionariosIds, (err, data) => {
                if (err) return res.status(500).json({ error: err });

                console.log('📦 Clientes con deudas obtenidos:', data.length);

                const totalPages = Math.ceil(total / limit);
                res.json({
                    data,
                    totalItems: total,
                    totalPages,
                    currentPage: page,
                });
            });
        });
    });
};

export const listarDeudasAgrupadasPorClienteSinPaginar = (req, res) => {
    const search = req.query.search || '';

    const { idusuarios, idfuncionario } = getUserId(req);
    const { tipo } = req.user || {};

    if (!idusuarios && !idfuncionario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    console.log('🔍 Filtrando deudas agrupadas por cliente para:', { tipo, idusuarios, idfuncionario });

    // Si es un funcionario, solo ve sus propias deudas de venta agrupadas
    if (tipo === 'funcionario') {
        return DeudaVenta.findAllFilteredByClienteAndUser(search, null, idfuncionario, (err, data) => {
            if (err) return res.status(500).json({ error: err });

            const totals = data.reduce(
                (acc, row) => {
                    acc.itemsPendientes += row.items_pendientes;
                    acc.totalDeuda += Number(row.total_deuda);
                    acc.saldo += Number(row.saldo);
                    return acc;
                },
                { itemsPendientes: 0, totalDeuda: 0, saldo: 0 }
            );

            res.json({
                data,
                totalItems: data.length,
                totals
            });
        });
    }

    // Si es un usuario administrador, buscar sus funcionarios relacionados
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
        if (err) return res.status(500).json({ error: err });

        const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');

        console.log('👥 Funcionarios relacionados:', funcionariosIds || 'ninguno');

        return DeudaVenta.findAllFilteredByClienteAndUser(search, idusuarios, funcionariosIds, (err, data) => {
            if (err) return res.status(500).json({ error: err });

            const totals = data.reduce(
                (acc, row) => {
                    acc.itemsPendientes += row.items_pendientes;
                    acc.totalDeuda += Number(row.total_deuda);
                    acc.saldo += Number(row.saldo);
                    return acc;
                },
                { itemsPendientes: 0, totalDeuda: 0, saldo: 0 }
            );

            res.json({
                data,
                totalItems: data.length,
                totals
            });
        });
    });
};

/**
 * Listar deudas agrupadas por cliente con información detallada de cuotas
 * Versión mejorada con estadísticas de cuotas, próximos vencimientos, intereses, etc.
 */
export const listarDeudasClienteConCuotasDetalle = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const order = req.query.order || 'DESC'; // ASC o DESC

    const { idusuarios, idfuncionario } = getUserId(req);
    const { tipo } = req.user || {};

    if (!idusuarios && !idfuncionario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    console.log('🔍 Listando deudas con detalles de cuotas para:', { tipo, idusuarios, idfuncionario, order });

    // Si es un funcionario, solo ve sus propias deudas
    if (tipo === 'funcionario') {
        return DeudaVenta.countClientsWithInstallments(search, null, idfuncionario, (err, total) => {
            if (err) {
                console.error('❌ Error al contar clientes:', err);
                return res.status(500).json({ error: err });
            }

            DeudaVenta.findAllPaginatedWithInstallments(limit, offset, search, null, idfuncionario, order, (err, data) => {
                if (err) {
                    console.error('❌ Error al listar deudas:', err);
                    return res.status(500).json({ error: err });
                }

                const totalPages = Math.ceil(total / limit);
                res.json({
                    data,
                    totalItems: total,
                    totalPages,
                    currentPage: page,
                });
            });
        });
    }

    // Si es un usuario administrador, buscar sus funcionarios relacionados
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
        if (err) {
            console.error('❌ Error al buscar funcionarios:', err);
            return res.status(500).json({ error: err });
        }

        const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');

        console.log('👥 Funcionarios relacionados:', funcionariosIds || 'ninguno');

        return DeudaVenta.countClientsWithInstallments(search, idusuarios, funcionariosIds, (err, total) => {
            if (err) {
                console.error('❌ Error al contar clientes:', err);
                return res.status(500).json({ error: err });
            }

            console.log('📊 Total clientes con deudas encontrados:', total);

            DeudaVenta.findAllPaginatedWithInstallments(limit, offset, search, idusuarios, funcionariosIds, order, (err, data) => {
                if (err) {
                    console.error('❌ Error al listar deudas:', err);
                    return res.status(500).json({ error: err });
                }

                console.log('📦 Clientes con deudas obtenidos:', data.length);

                const totalPages = Math.ceil(total / limit);
                res.json({
                    data,
                    totalItems: total,
                    totalPages,
                    currentPage: page,
                });
            });
        });
    });
};

export const anularPagoDeuda = (req, res) => {
    const { idpago_deuda } = req.params;

    if (!idpago_deuda) {
        return res.status(400).json({ error: '❌ ID de pago no proporcionado.' });
    }

    // 1. Obtener datos del pago que se va a anular
    const pagoQuery = `SELECT * FROM detalle_pago_deuda_venta WHERE idpago_deuda = ? AND deleted_at IS NULL`;
    db.query(pagoQuery, [idpago_deuda], (err, results) => {
        if (err) return res.status(500).json({ error: '❌ Error al buscar el pago.' });
        if (results.length === 0) return res.status(404).json({ error: '❌ Pago no encontrado o ya anulado.' });

        const pago = results[0];
        const montoAnulado = parseFloat(pago.monto_pagado);
        const iddeuda = pago.iddeuda;

        // 2. PRIMERO: Revertir la aplicación del pago a las cuotas
        revertirPagoCuotas(idpago_deuda, (errRevertir, resultadoReversion) => {
            if (errRevertir) {
                console.warn('⚠️ Error al revertir cuotas:', errRevertir.message);
                // Continuamos aunque falle la reversión de cuotas (puede ser un crédito sin cuotas)
            } else {
                console.log('✅ Reversión de cuotas exitosa:', resultadoReversion);
            }

            // 3. Anular el pago (soft delete)
            DetallePagoDeudaVenta.anularPago(idpago_deuda, (errAnular) => {
                if (errAnular) return res.status(500).json({ error: '❌ Error al anular el pago.' });

                // 4. Actualizar deuda
                const updateDeudaQuery = `
            UPDATE deuda_venta
            SET
              total_pagado = total_pagado - ?,
              saldo = saldo + ?,
              ganancia_credito = total_pagado - costo_empresa,
              estado = 'pendiente',
              updated_at = NOW()
            WHERE iddeuda = ?
          `;
                db.query(updateDeudaQuery, [montoAnulado, montoAnulado, iddeuda], (errUpdate) => {
                    if (errUpdate) return res.status(500).json({ error: '❌ Error al actualizar la deuda.' });

                    // 5. Buscar el ingreso relacionado
                    const ingresoQuery = `SELECT idingreso FROM ingresos WHERE idpago_deuda = ? AND deleted_at IS NULL`;
                    db.query(ingresoQuery, [idpago_deuda], (errIngresoSelect, ingresoResult) => {
                        if (errIngresoSelect) {
                            console.warn('⚠️ Error al buscar ingreso relacionado:', errIngresoSelect);
                            return res.status(200).json({ message: '✅ Pago anulado, pero no se pudo encontrar ingreso para eliminar transferencias, tarjetas o cheques.' });
                        }

                        const idingreso = ingresoResult[0]?.idingreso;

                        // 6. Soft delete del ingreso
                        Ingreso.softDeleteByPagoDeudaId(idpago_deuda, (errIngreso) => {
                            if (errIngreso) {
                                console.warn('⚠️ Error al anular ingreso relacionado:', errIngreso);
                            }

                            if (idingreso) {
                                // 7. Soft delete del detalle de transferencia
                                DetalleTransferenciaCobro.softDeleteByIngresoId(idingreso, (errDeleteTransfer) => {
                                    if (errDeleteTransfer) {
                                        console.warn('⚠️ Error al anular detalle de transferencia:', errDeleteTransfer);
                                    }

                                    // 8. Soft delete del detalle de tarjeta
                                    DetalleTarjetaVentaCobro.softDeleteByIngresoId(idingreso, (errDeleteTarjeta) => {
                                        if (errDeleteTarjeta) {
                                            console.warn('⚠️ Error al anular detalle de tarjeta:', errDeleteTarjeta);
                                        }

                                        // 9. Soft delete del detalle de cheque
                                        DetalleChequeVentaCobro.softDeleteByIngresoId(idingreso, (errDeleteCheque) => {
                                            if (errDeleteCheque) {
                                                console.warn('⚠️ Error al anular detalle de cheque:', errDeleteCheque);
                                            }

                                            return res.status(200).json({
                                                message: '✅ Pago anulado y registros actualizados correctamente.',
                                                cuotas_afectadas: resultadoReversion?.cuotas_afectadas || 0
                                            });
                                        });
                                    });
                                });
                            } else {
                                return res.status(200).json({
                                    message: '✅ Pago anulado y registros actualizados correctamente (sin detalle de transferencia, tarjeta ni cheque).',
                                    cuotas_afectadas: resultadoReversion?.cuotas_afectadas || 0
                                });
                            }
                        });
                    });
                });
            });
        });
    });
};

/**
 * Listar clientes con cuotas vencidas
 * Incluye información sobre días de atraso por cliente
 */
export const listarClientesConCuotasVencidas = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const diasAtraso = req.query.diasAtraso || ''; // Nuevo filtro

    const { idusuarios, idfuncionario } = getUserId(req);
    const { tipo } = req.user || {};

    if (!idusuarios && !idfuncionario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    console.log('🔍 Listando clientes con cuotas vencidas para:', { tipo, idusuarios, idfuncionario, diasAtraso });

    // Helper para procesar la consulta
    const procesarConsulta = (idsusuarios, idfuncionariosIds) => {
        const userFilter = tipo === 'funcionario'
            ? `AND v.idfuncionario = ${idfuncionario}`
            : idsusuarios
                ? `AND (v.idusuarios = ${idsusuarios} ${idfuncionariosIds ? `OR v.idfuncionario IN (${idfuncionariosIds})` : ''})`
                : '';

        // Construir filtro de días de atraso
        let diasAtrasoFilter = '';
        if (diasAtraso) {
            if (diasAtraso === '10') {
                diasAtrasoFilter = 'HAVING dias_atraso_maximo <= 10';
            } else if (diasAtraso === '20') {
                diasAtrasoFilter = 'HAVING dias_atraso_maximo > 10 AND dias_atraso_maximo <= 20';
            } else if (diasAtraso === '30') {
                diasAtrasoFilter = 'HAVING dias_atraso_maximo > 20 AND dias_atraso_maximo <= 30';
            } else if (diasAtraso === '50') {
                diasAtrasoFilter = 'HAVING dias_atraso_maximo > 30 AND dias_atraso_maximo <= 50';
            } else if (diasAtraso === '90') {
                diasAtrasoFilter = 'HAVING dias_atraso_maximo > 50 AND dias_atraso_maximo <= 90';
            } else if (diasAtraso === '>90') {
                diasAtrasoFilter = 'HAVING dias_atraso_maximo > 90';
            }
        }

        // Query para contar total de clientes con cuotas vencidas
        const countQuery = `
            SELECT COUNT(*) as total
            FROM (
                SELECT c.idcliente,
                       DATEDIFF(CURDATE(), MIN(dcv.fecha_vencimiento)) as dias_atraso_maximo
                FROM clientes c
                INNER JOIN deuda_venta dv ON c.idcliente = dv.idcliente
                INNER JOIN ventas v ON dv.idventa = v.idventa
                INNER JOIN detalle_cuotas_venta dcv ON dv.iddeuda = dcv.iddeuda
                WHERE dcv.estado IN ('pendiente', 'parcial')
                    AND dcv.fecha_vencimiento < CURDATE()
                    AND dv.deleted_at IS NULL
                    AND dcv.deleted_at IS NULL
                    ${userFilter}
                    AND (
                        c.nombre LIKE ? OR
                        c.apellido LIKE ? OR
                        c.numDocumento LIKE ?
                    )
                GROUP BY c.idcliente
                ${diasAtrasoFilter}
            ) as subquery
        `;

        const searchPattern = `%${search}%`;

        db.query(countQuery, [searchPattern, searchPattern, searchPattern], (errCount, countResult) => {
            if (errCount) {
                console.error('❌ Error al contar clientes con cuotas vencidas:', errCount);
                return res.status(500).json({ error: 'Error al contar clientes con cuotas vencidas' });
            }

            const total = countResult[0].total;

            // Query para obtener clientes con información de cuotas vencidas
            const dataQuery = `
                SELECT
                    c.idcliente,
                    c.nombre,
                    c.apellido,
                    c.numDocumento,
                    c.telefono,
                    COUNT(DISTINCT dv.iddeuda) as total_creditos,
                    COUNT(DISTINCT dcv.iddetalle_cuota) as total_cuotas_vencidas,
                    SUM(dcv.saldo_total) as total_deuda_vencida,
                    MIN(dcv.fecha_vencimiento) as fecha_vencimiento_mas_antigua,
                    DATEDIFF(CURDATE(), MIN(dcv.fecha_vencimiento)) as dias_atraso_maximo
                FROM clientes c
                INNER JOIN deuda_venta dv ON c.idcliente = dv.idcliente
                INNER JOIN ventas v ON dv.idventa = v.idventa
                INNER JOIN detalle_cuotas_venta dcv ON dv.iddeuda = dcv.iddeuda
                WHERE dcv.estado IN ('pendiente', 'parcial')
                    AND dcv.fecha_vencimiento < CURDATE()
                    AND dv.deleted_at IS NULL
                    AND dcv.deleted_at IS NULL
                    ${userFilter}
                    AND (
                        c.nombre LIKE ? OR
                        c.apellido LIKE ? OR
                        c.numDocumento LIKE ?
                    )
                GROUP BY c.idcliente, c.nombre, c.apellido, c.numDocumento, c.telefono
                ${diasAtrasoFilter}
                ORDER BY dias_atraso_maximo DESC
                LIMIT ? OFFSET ?
            `;

            db.query(dataQuery, [searchPattern, searchPattern, searchPattern, limit, offset], (errData, data) => {
                if (errData) {
                    console.error('❌ Error al listar clientes con cuotas vencidas:', errData);
                    return res.status(500).json({ error: 'Error al listar clientes con cuotas vencidas' });
                }

                const totalPages = Math.ceil(total / limit);

                res.json({
                    data,
                    totalItems: total,
                    totalPages,
                    currentPage: page,
                });
            });
        });
    };

    // Ejecutar según tipo de usuario
    if (tipo === 'funcionario') {
        procesarConsulta(null, idfuncionario);
    } else {
        Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
            if (err) {
                console.error('❌ Error al buscar funcionarios:', err);
                return res.status(500).json({ error: err });
            }
            const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');
            console.log('👥 Funcionarios relacionados:', funcionariosIds || 'ninguno');
            procesarConsulta(idusuarios, funcionariosIds);
        });
    }
};

/**
 * Listar deudas de un cliente específico por ID
 * Permite filtrar por estado y paginar resultados
 */
export const listarDeudasPorCliente = (req, res) => {
    const { idcliente } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const estado = req.query.estado || '';

    const { idusuarios, idfuncionario } = getUserId(req);
    const { tipo } = req.user || {};

    if (!idusuarios && !idfuncionario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!idcliente) {
        return res.status(400).json({ error: 'El ID del cliente es requerido' });
    }

    console.log('🔍 Listando deudas del cliente:', { idcliente, estado, tipo });

    // Helper para procesar la consulta
    const procesarConsulta = (idsusuarios, idfuncionariosIds) => {
        // Primero contar el total para la paginación
        DeudaVenta.countFilteredByClienteId(idcliente, estado, idsusuarios, idfuncionariosIds, (err, total) => {
            if (err) {
                console.error('❌ Error al contar deudas del cliente:', err);
                return res.status(500).json({ error: err });
            }

            console.log('📊 Total deudas del cliente encontradas:', total);

            // Luego obtener los datos paginados
            DeudaVenta.findAllPaginatedByClienteId(
                idcliente,
                limit,
                offset,
                estado,
                idsusuarios,
                idfuncionariosIds,
                (err, data) => {
                    if (err) {
                        console.error('❌ Error al listar deudas del cliente:', err);
                        return res.status(500).json({ error: err });
                    }

                    console.log('📦 Deudas del cliente obtenidas:', data.length);

                    const totalPages = Math.ceil(total / limit);
                    res.json({
                        data,
                        totalItems: total,
                        totalPages,
                        currentPage: page,
                    });
                }
            );
        });
    };

    // Ejecutar según tipo de usuario
    if (tipo === 'funcionario') {
        procesarConsulta(null, idfuncionario);
    } else {
        Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
            if (err) {
                console.error('❌ Error al buscar funcionarios:', err);
                return res.status(500).json({ error: err });
            }
            const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');
            console.log('👥 Funcionarios relacionados:', funcionariosIds || 'ninguno');
            procesarConsulta(idusuarios, funcionariosIds);
        });
    }
};