import db from '../../db.js';
import DetallePagoDeudaCompra from '../../models/Compra/DetallePagoDeudaCompra.js';
import Egreso from '../../models/Movimiento/Egreso.js';
import MovimientoCaja from '../../models/MovimientoCaja.js';
import DetalleTarjetaCompraPago from '../../models/Compra/Compras_Credito/DetalleTarjetaCompraCobro.js';
import DetalleChequeCompraPago from '../../models/Compra/Compras_Credito/DetalleChequeCompraCobro.js';
import DetalleTransferenciaCompraPago from '../../models/Compra/Compras_Credito/DetalleTransferenciaCompraCobro.js';
import DeudaCompra from '../../models/Compra/deudaCompraModel.js';
import { getUserId } from '../../utils/getUserId.js';
import Funcionario from '../../models/Funcionario.js';

export const pagarDeudaCompra = (req, res) => {
    const { iddeuda, monto, observacion, idformapago, creado_por } = req.body;

    const { idusuarios, idfuncionario } = getUserId(req);
    const { tipo } = req.user || {};

    if (!idusuarios && !idfuncionario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const idusuario = idusuarios; // Para compatibilidad con el código existente

    if (!iddeuda || !monto || isNaN(monto)) {
        return res.status(400).json({ error: '❌ Datos inválidos para el pago.' });
    }

    const queryDeuda = `
    SELECT dc.*, p.nombre AS nombre_proveedor 
    FROM deuda_compra dc 
    JOIN proveedor p ON p.idproveedor = dc.idproveedor 
    WHERE dc.iddeuda_compra = ? AND dc.deleted_at IS NULL
  `;
    db.query(queryDeuda, [iddeuda], (err, results) => {
        if (err) return res.status(500).json({ error: '❌ Error al consultar deuda.' });
        if (!results.length) return res.status(404).json({ error: '❌ Deuda no encontrada.' });

        const deuda = results[0];
        const saldoActual = parseFloat(deuda.saldo);
        const montoRecibido = parseFloat(monto);

        const montoAplicado = montoRecibido > saldoActual ? saldoActual : montoRecibido;
        const vuelto = montoRecibido > saldoActual ? montoRecibido - saldoActual : 0;

        const nuevoPago = {
            iddeuda_compra: iddeuda,
            monto_pagado: montoAplicado,
            fecha_pago: new Date(),
            observacion: observacion || '',
            idformapago: idformapago || 'Desconocido',
            creado_por: creado_por || 'sistema'
        };

        DetallePagoDeudaCompra.create(nuevoPago, (errPago, resultPago) => {
            if (errPago) {
                console.error('❌ Error al registrar el detalle del pago:', errPago);
                return res.status(500).json({ error: '❌ Error al registrar el pago.' });
            }

            const idpago_deuda_compra = resultPago.insertId;

            // Helper para buscar movimiento con filtrado
            const buscarMovimientoYCrearEgreso = (idsusuarios, idfuncionariosIds) => {
                MovimientoCaja.getMovimientoAbierto(idusuarios, idfuncionariosIds, (errMov, movResult) => {
                    if (errMov || !movResult.length) {
                        console.error('❌ Error al obtener movimiento para egreso:', errMov);
                    } else {
                        const idmovimiento = movResult[0].idmovimiento;

                    const nuevoEgreso = {
                        idcompra: deuda.idcompra,
                        fecha: new Date(),
                        hora: null,
                        monto: montoAplicado,
                        concepto: `Egreso por pago de deuda de compra ID ${iddeuda}`,
                        idtipo_egreso: 2, // Ajustar según tabla tipo_egreso
                        observacion: observacion || '',
                        idmovimiento,
                        creado_por: idusuario || 'sistema',
                        idpago_deuda_compra
                    };

                    Egreso.create(nuevoEgreso, (errEgreso, resultEgreso) => {
                        if (errEgreso) {
                            console.error('❌ Error al registrar egreso de pago de deuda:', errEgreso);
                        } else {
                            const idegreso = resultEgreso.insertId;

                            // 💳 Detalle de transferencia
                            if (idformapago === 2 && req.body.detalle_transferencia_pago) {
                                const { banco_origen, numero_cuenta, tipo_cuenta, titular_cuenta, observacion } = req.body.detalle_transferencia_pago;
                                const datosTransferencia = { idegreso, banco_origen, numero_cuenta, tipo_cuenta, titular_cuenta, observacion };
                                DetalleTransferenciaCompraPago.create(datosTransferencia, (errInsert, insertResult) => {
                                    if (errInsert) {
                                        console.error('❌ Error al insertar detalle transferencia pago:', errInsert);
                                    } else {
                                        const iddetalle_transferencia_pago = insertResult.insertId;
                                        Egreso.updateTransferenciaId(idegreso, iddetalle_transferencia_pago, (errUpdate) => {
                                            if (errUpdate) {
                                                console.error('❌ Error al actualizar egreso con iddetalle_transferencia_pago:', errUpdate);
                                            }
                                        });
                                    }
                                });
                            }

                            // 💳 Detalle de tarjeta
                            if (idformapago === 4 && req.body.detalle_tarjeta_compra_pago) {
                                const { tipo_tarjeta, entidad, monto, observacion } = req.body.detalle_tarjeta_compra_pago;
                                const datosTarjeta = { idegreso, tipo_tarjeta, entidad, monto, observacion };
                                DetalleTarjetaCompraPago.create(datosTarjeta, (errInsert, insertResult) => {
                                    if (errInsert) {
                                        console.error('❌ Error al insertar detalle tarjeta pago:', errInsert);
                                    } else {
                                        const iddetalle_tarjeta_compra_pago = insertResult.insertId;
                                        Egreso.updateTarjetaId(idegreso, iddetalle_tarjeta_compra_pago, (errUpdate) => {
                                            if (errUpdate) {
                                                console.error('❌ Error al actualizar egreso con iddetalle_tarjeta_compra_pago:', errUpdate);
                                            }
                                        });
                                    }
                                });
                            }

                            // 💵 Detalle de cheque
                            if (idformapago === 3 && req.body.detalle_cheque_compra_pago) {
                                const {
                                    banco,
                                    nro_cheque,
                                    monto,
                                    fecha_emision,
                                    fecha_vencimiento,
                                    titular,
                                    estado
                                } = req.body.detalle_cheque_compra_pago;

                                const datosCheque = {
                                    idegreso,
                                    banco,
                                    nro_cheque,
                                    monto,
                                    fecha_emision,
                                    fecha_vencimiento,
                                    titular,
                                    estado: estado || 'pendiente'
                                };

                                DetalleChequeCompraPago.create(datosCheque, (errInsert, insertResult) => {
                                    if (errInsert) {
                                        console.error('❌ Error al insertar detalle cheque compra pago:', errInsert);
                                    } else {
                                        const iddetalle_cheque_compra_pago = insertResult.insertId;
                                        Egreso.updateChequeId(idegreso, iddetalle_cheque_compra_pago, (errUpdate) => {
                                            if (errUpdate) {
                                                console.error('❌ Error al actualizar egreso con iddetalle_cheque_compra_pago:', errUpdate);
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                    }
                });
            };

            // Ejecutar según tipo de usuario
            if (tipo === 'funcionario') {
                buscarMovimientoYCrearEgreso(null, idfuncionario);
            } else {
                Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
                    if (err) return res.status(500).json({ error: '❌ Error al buscar funcionarios relacionados' });
                    const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');
                    buscarMovimientoYCrearEgreso(idusuarios, funcionariosIds);
                });
            }

            // 📝 Actualizar deuda
            const nuevoSaldo = saldoActual - montoAplicado;
            const estadoNuevo = nuevoSaldo <= 0 ? 'pagado' : 'pendiente';

            const updateDeuda = `
        UPDATE deuda_compra
        SET total_pagado = total_pagado + ?,
            saldo = saldo - ?,
            estado = ?,
            updated_at = NOW()
        WHERE iddeuda_compra = ?
      `;

            db.query(updateDeuda, [montoAplicado, montoAplicado, estadoNuevo, iddeuda], (errUpdate) => {
                if (errUpdate) {
                    console.error('❌ Error al actualizar la deuda:', errUpdate);
                    return res.status(500).json({ error: '❌ Error al actualizar la deuda.' });
                }

                const detalleCompraQuery = `
          SELECT dc.idproducto, p.nombre_producto, dc.cantidad, dc.precio, dc.sub_total
          FROM detalle_compra dc
          JOIN productos p ON p.idproducto = dc.idproducto
          WHERE dc.idcompra = ?
        `;
                db.query(detalleCompraQuery, [deuda.idcompra], (errDetalles, detallesCompra) => {
                    if (errDetalles) {
                        return res.status(500).json({ error: '❌ Error al obtener detalles de la compra.' });
                    }

                    return res.status(200).json({
                        message: '✅ Pago registrado correctamente.',
                        comprobante: {
                            proveedor: deuda.nombre_proveedor,
                            fecha_pago: nuevoPago.fecha_pago,
                            monto_pagado: montoAplicado.toFixed(2),
                            vuelto: vuelto.toFixed(2),
                            saldo: nuevoSaldo.toFixed(2),
                            tipoPago: nuevoSaldo !== 0 ? 'Pago Parcial' : 'Pago Total',
                            detallesCompra
                        }
                    });
                });
            });
        });
    });
};

export const getPagosDeudaCompraDetalle = (req, res) => {
    const iddeuda_compra = req.params.iddeuda;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    DetallePagoDeudaCompra.countByDeudaFiltered(iddeuda_compra, search, (errCount, total) => {
        if (errCount) return res.status(500).json({ error: errCount });

        DetallePagoDeudaCompra.findByDeudaPaginated(iddeuda_compra, limit, offset, search, (err, data) => {
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
};

export const anularPagoDeudaCompra = (req, res) => {
    const { idpago_deuda } = req.params;

    if (!idpago_deuda) {
        return res.status(400).json({ error: '❌ ID de pago no proporcionado.' });
    }

    const pagoQuery = `SELECT * FROM detalle_pago_deuda_compra WHERE idpago_deuda_compra = ? AND deleted_at IS NULL`;
    db.query(pagoQuery, [idpago_deuda], (err, results) => {
        if (err) return res.status(500).json({ error: '❌ Error al buscar el pago.' });
        if (results.length === 0) return res.status(404).json({ error: '❌ Pago no encontrado o ya anulado.' });

        const pago = results[0];
        const montoAnulado = parseFloat(pago.monto_pagado);
        const iddeuda_compra = pago.iddeuda_compra;

        DetallePagoDeudaCompra.anularPago(idpago_deuda, (errAnular) => {
            if (errAnular) return res.status(500).json({ error: '❌ Error al anular el pago.' });

            const updateDeudaQuery = `
                UPDATE deuda_compra
                SET
                  total_pagado = total_pagado - ?,
                  saldo = saldo + ?,
                  estado = 'pendiente',
                  updated_at = NOW()
                WHERE iddeuda_compra = ?
            `;

            db.query(updateDeudaQuery, [montoAnulado, montoAnulado, iddeuda_compra], (errUpdate) => {
                if (errUpdate) {
                    return res.status(500).json({ error: '❌ Error al actualizar la deuda.' });
                }

                Egreso.softDeleteByPagoDeudaCompraId(idpago_deuda, (errEgreso) => {
                    if (errEgreso) {
                        console.warn('⚠️ Error al anular egreso relacionado:', errEgreso);
                        // Podés continuar igual
                    }

                    // 💳 Obtener idegreso y anular detalles asociados
                    const egresoQuery = `
                        SELECT idegreso
                        FROM egresos
                        WHERE idpago_deuda_compra = ?
                    `;
                    db.query(egresoQuery, [idpago_deuda], (errEgresoSelect, egresos) => {
                        if (errEgresoSelect) {
                            console.error('⚠️ Error al buscar egreso:', errEgresoSelect);
                            return res.status(500).json({ error: '❌ Error al buscar egreso.' });
                        }

                        if (!egresos.length) {
                            console.warn('⚠️ No se encontró egreso para anular la transferencia, tarjeta o cheque.');
                            return res.status(200).json({
                                message: '✅ Pago anulado y deuda actualizada (sin egreso relacionado a transferencia, tarjeta o cheque).'
                            });
                        }

                        const idegreso = egresos[0].idegreso;

                        // Anular detalle de transferencia si existe
                        DetalleTransferenciaCompraPago.softDeleteByEgresoId(idegreso, (errTransferencia) => {
                            if (errTransferencia) {
                                console.warn('⚠️ Error al anular detalle de transferencia pago:', errTransferencia);
                            }

                            // Anular detalle de tarjeta si existe
                            DetalleTarjetaCompraPago.softDeleteByEgresoId(idegreso, (errTarjeta) => {
                                if (errTarjeta) {
                                    console.warn('⚠️ Error al anular detalle de tarjeta pago:', errTarjeta);
                                }

                                // Anular detalle de cheque si existe
                                DetalleChequeCompraPago.softDeleteByEgresoId(idegreso, (errCheque) => {
                                    if (errCheque) {
                                        console.warn('⚠️ Error al anular detalle de cheque pago:', errCheque);
                                    }

                                    return res.status(200).json({
                                        message: '✅ Pago anulado, deuda actualizada y registros relacionados eliminados correctamente.'
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};


export const listarDeudasCompra = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const { idusuarios, idfuncionario } = getUserId(req);
    const { tipo } = req.user || {};

    if (!idusuarios && !idfuncionario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    console.log('🔍 Filtrando deudas de compra para:', { tipo, idusuarios, idfuncionario });

    // Si es un funcionario, solo ve sus propias deudas de compra
    if (tipo === 'funcionario') {
        return DeudaCompra.countFilteredByUser(search, null, idfuncionario, (err, total) => {
            if (err) return res.status(500).json({ error: err });

            DeudaCompra.findAllPaginatedFilteredByUser(limit, offset, search, null, idfuncionario, (err, data) => {
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

        return DeudaCompra.countFilteredByUser(search, idusuarios, funcionariosIds, (err, total) => {
            if (err) return res.status(500).json({ error: err });

            console.log('📊 Total deudas de compra encontradas:', total);

            DeudaCompra.findAllPaginatedFilteredByUser(limit, offset, search, idusuarios, funcionariosIds, (err, data) => {
                if (err) return res.status(500).json({ error: err });

                console.log('📦 Deudas de compra obtenidas:', data.length);

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
