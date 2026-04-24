import DetalleCuotasVenta from '../../../models/Venta/DetalleCuotasVenta.js';
import DistribucionPagoCuotas from '../../../models/Venta/DistribucionPagoCuotas.js';
import DeudaVenta from '../../../models/Venta/DeudaVenta.js';

/**
 * Aplica un pago a las cuotas pendientes usando método FIFO
 * (First In First Out - se pagan primero las cuotas más antiguas)
 *
 * Orden de aplicación dentro de cada cuota:
 * 1. Interés punitorio (mora)
 * 2. Interés normal (del crédito)
 * 3. Capital
 *
 * @param {Object} params - Parámetros del pago
 * @param {number} params.iddeuda - ID de la deuda
 * @param {number} params.idpago_deuda - ID del pago registrado
 * @param {number} params.monto_pagado - Monto total del pago
 * @param {Function} callback - Callback (err, resultado)
 */
const aplicarPagoACuotas = (params, callback) => {
  try {
    const { iddeuda, idpago_deuda, monto_pagado } = params;

    // Validaciones
    if (!iddeuda || !idpago_deuda) {
      return callback(new Error('Faltan parámetros requeridos: iddeuda, idpago_deuda'));
    }

    if (!monto_pagado || monto_pagado <= 0) {
      return callback(new Error('El monto pagado debe ser mayor a 0'));
    }

    // Obtener cuotas pendientes ordenadas por fecha de vencimiento (FIFO)
    DetalleCuotasVenta.findByDeuda(iddeuda, (err, cuotas) => {
      if (err) {
        return callback(err);
      }

      if (!cuotas || cuotas.length === 0) {
        return callback(new Error('No se encontraron cuotas para esta deuda'));
      }

      // Filtrar solo cuotas pendientes o parcialmente pagadas
      const cuotas_pendientes = cuotas.filter(c =>
        c.estado === 'pendiente' ||
        c.estado === 'pagada_parcial' ||
        c.estado === 'vencida'
      );

      if (cuotas_pendientes.length === 0) {
        return callback(new Error('No hay cuotas pendientes para aplicar el pago'));
      }

      // Ordenar por fecha de vencimiento (las más antiguas primero)
      cuotas_pendientes.sort((a, b) => {
        const fechaA = new Date(a.fecha_vencimiento);
        const fechaB = new Date(b.fecha_vencimiento);
        return fechaA - fechaB;
      });

      // Aplicar el pago a las cuotas
      let monto_restante = monto_pagado;
      const distribuciones = [];
      const cuotas_actualizadas = [];
      let orden_aplicacion = 1;

      for (const cuota of cuotas_pendientes) {
        if (monto_restante <= 0) break;

        // Calcular saldos actuales de la cuota
        const saldo_punitorio = parseFloat(cuota.saldo_punitorio) || 0;
        const monto_interes_normal = parseFloat(cuota.monto_interes_normal) || 0;
        const monto_pagado_interes = parseFloat(cuota.monto_pagado_interes) || 0;
        const monto_capital = parseFloat(cuota.monto_capital) || 0;
        const monto_pagado_capital = parseFloat(cuota.monto_pagado_capital) || 0;

        const saldo_interes = parseFloat(cuota.saldo_interes) || (monto_interes_normal - monto_pagado_interes);
        const saldo_capital = parseFloat(cuota.saldo_capital) || (monto_capital - monto_pagado_capital);
        const saldo_total_cuota = saldo_punitorio + saldo_interes + saldo_capital;

        if (saldo_total_cuota <= 0) continue; // Cuota ya pagada completamente

        // Determinar cuánto se puede aplicar a esta cuota
        const monto_a_aplicar = Math.min(monto_restante, saldo_total_cuota);

        // Distribuir el monto según el orden de prioridad
        let monto_temp = monto_a_aplicar;
        let monto_a_punitorio = 0;
        let monto_a_interes = 0;
        let monto_a_capital = 0;

        // 1. Primero al interés punitorio (mora)
        if (saldo_punitorio > 0 && monto_temp > 0) {
          monto_a_punitorio = Math.min(monto_temp, saldo_punitorio);
          monto_temp -= monto_a_punitorio;
        }

        // 2. Luego al interés normal
        if (saldo_interes > 0 && monto_temp > 0) {
          monto_a_interes = Math.min(monto_temp, saldo_interes);
          monto_temp -= monto_a_interes;
        }

        // 3. Finalmente al capital
        if (saldo_capital > 0 && monto_temp > 0) {
          monto_a_capital = Math.min(monto_temp, saldo_capital);
          monto_temp -= monto_a_capital;
        }

        // Actualizar saldos de la cuota
        const nuevo_saldo_punitorio = Math.round((saldo_punitorio - monto_a_punitorio) * 100) / 100;
        const nuevo_saldo_interes = Math.round((saldo_interes - monto_a_interes) * 100) / 100;
        const nuevo_saldo_capital = Math.round((saldo_capital - monto_a_capital) * 100) / 100;
        const nuevo_saldo_total = nuevo_saldo_punitorio + nuevo_saldo_interes + nuevo_saldo_capital;

        // Determinar nuevo estado de la cuota
        let nuevo_estado;
        if (nuevo_saldo_total <= 0) {
          nuevo_estado = 'pagada_total';
        } else if (nuevo_saldo_total < saldo_total_cuota) {
          nuevo_estado = 'pagada_parcial';
        } else {
          nuevo_estado = cuota.estado;
        }

        // Guardar distribución
        distribuciones.push({
          idpago_deuda,
          iddetalle_cuota: cuota.iddetalle_cuota,
          iddeuda,
          monto_distribuido: monto_a_aplicar,
          monto_a_capital,
          monto_a_interes,
          monto_a_punitorio,
          orden_aplicacion
        });

        // Guardar actualización de cuota
        cuotas_actualizadas.push({
          iddetalle_cuota: cuota.iddetalle_cuota,
          monto_pagado_capital: (cuota.monto_pagado_capital || 0) + monto_a_capital,
          monto_pagado_interes: (cuota.monto_pagado_interes || 0) + monto_a_interes,
          monto_pagado_punitorio: (cuota.monto_pagado_punitorio || 0) + monto_a_punitorio,
          saldo_capital: nuevo_saldo_capital,
          saldo_interes: nuevo_saldo_interes,
          saldo_punitorio: nuevo_saldo_punitorio,
          saldo_total: nuevo_saldo_total,
          interes_punitorio_generado: cuota.interes_punitorio_generado || 0,
          estado: nuevo_estado,
          fecha_ultimo_pago: new Date(),
          observaciones: cuota.observaciones
        });

        monto_restante -= monto_a_aplicar;
        orden_aplicacion++;
      }

      // Verificar si quedó saldo a favor
      let saldo_a_favor = 0;
      if (monto_restante > 0) {
        saldo_a_favor = Math.round(monto_restante * 100) / 100;
      }

      // Guardar distribuciones en la base de datos
      if (distribuciones.length === 0) {
        return callback(new Error('No se pudo aplicar el pago a ninguna cuota'));
      }

      DistribucionPagoCuotas.createBulk(distribuciones, (err) => {
        if (err) {
          return callback(err);
        }

        // Actualizar cuotas afectadas
        let cuotas_procesadas = 0;
        let errores = [];

        cuotas_actualizadas.forEach((cuota_data, index) => {
          DetalleCuotasVenta.update(cuota_data.iddetalle_cuota, cuota_data, (err) => {
            if (err) {
              errores.push({ cuota: cuota_data.iddetalle_cuota, error: err.message });
            }

            cuotas_procesadas++;

            // Cuando todas las cuotas estén procesadas
            if (cuotas_procesadas === cuotas_actualizadas.length) {
              if (errores.length > 0) {
                return callback(new Error(`Errores al actualizar cuotas: ${JSON.stringify(errores)}`));
              }

              // Actualizar saldo_a_favor en deuda_venta si corresponde
              if (saldo_a_favor > 0) {
                DeudaVenta.findById(iddeuda, (err, deuda) => {
                  if (err) {
                    return callback(err);
                  }

                  const nuevo_saldo_favor = (deuda.saldo_a_favor || 0) + saldo_a_favor;

                  DeudaVenta.updateSaldoAFavor(iddeuda, nuevo_saldo_favor, (err) => {
                    if (err) {
                      return callback(err);
                    }

                    finalizarProceso();
                  });
                });
              } else {
                finalizarProceso();
              }
            }
          });
        });

        function finalizarProceso() {
          // Retornar resultado
          callback(null, {
            mensaje: 'Pago aplicado exitosamente',
            monto_pagado,
            monto_aplicado: monto_pagado - saldo_a_favor,
            saldo_a_favor,
            cuotas_afectadas: distribuciones.length,
            distribuciones,
            resumen: {
              total_a_capital: distribuciones.reduce((sum, d) => sum + d.monto_a_capital, 0),
              total_a_interes: distribuciones.reduce((sum, d) => sum + d.monto_a_interes, 0),
              total_a_punitorio: distribuciones.reduce((sum, d) => sum + d.monto_a_punitorio, 0)
            }
          });
        }
      });
    });

  } catch (error) {
    callback(error);
  }
};

/**
 * Calcula intereses punitorios para cuotas vencidas
 * Se ejecuta diariamente por cron job
 *
 * @param {Function} callback - Callback (err, resultado)
 */
const calcularInteresesPunitorios = (callback) => {
  try {
    // Obtener todas las cuotas vencidas
    DetalleCuotasVenta.findVencidas((err, cuotas_vencidas) => {
      if (err) {
        return callback(err);
      }

      if (!cuotas_vencidas || cuotas_vencidas.length === 0) {
        return callback(null, {
          mensaje: 'No hay cuotas vencidas para calcular intereses',
          cuotas_procesadas: 0
        });
      }

      let cuotas_procesadas = 0;
      let errores = [];
      let total_interes_generado = 0;

      cuotas_vencidas.forEach((cuota) => {
        const dias_vencidos = cuota.dias_vencidos || 0;
        const periodo_gracia = cuota.periodo_gracia_dias || 0;

        // Solo calcular si ya pasó el período de gracia
        if (dias_vencidos <= periodo_gracia) {
          cuotas_procesadas++;
          if (cuotas_procesadas === cuotas_vencidas.length) {
            finalizarCalculo();
          }
          return;
        }

        const dias_mora = dias_vencidos - periodo_gracia;
        const saldo_pendiente = cuota.saldo_total || 0;
        const tasa_punitorio_diario = (cuota.tasa_interes_punitorio_diario || 0) / 100;

        // Calcular interés punitorio: Saldo * Tasa_diaria * Días_mora
        let interes_punitorio = saldo_pendiente * tasa_punitorio_diario * dias_mora;
        interes_punitorio = Math.round(interes_punitorio * 100) / 100;

        // Verificar límite legal si existe
        if (cuota.limite_legal_punitorio && cuota.limite_legal_punitorio > 0) {
          const interes_acumulado = (cuota.interes_punitorio_generado || 0) + interes_punitorio;
          if (interes_acumulado > cuota.limite_legal_punitorio) {
            interes_punitorio = cuota.limite_legal_punitorio - (cuota.interes_punitorio_generado || 0);
            interes_punitorio = Math.max(0, interes_punitorio);
          }
        }

        if (interes_punitorio > 0) {
          total_interes_generado += interes_punitorio;

          DetalleCuotasVenta.updateInteresesPunitorios(
            cuota.iddetalle_cuota,
            interes_punitorio,
            dias_mora,
            (err) => {
              if (err) {
                errores.push({ cuota: cuota.iddetalle_cuota, error: err.message });
              }

              cuotas_procesadas++;
              if (cuotas_procesadas === cuotas_vencidas.length) {
                finalizarCalculo();
              }
            }
          );
        } else {
          cuotas_procesadas++;
          if (cuotas_procesadas === cuotas_vencidas.length) {
            finalizarCalculo();
          }
        }
      });

      function finalizarCalculo() {
        if (errores.length > 0) {
          return callback(new Error(`Errores al calcular intereses: ${JSON.stringify(errores)}`));
        }

        callback(null, {
          mensaje: 'Intereses punitorios calculados exitosamente',
          cuotas_procesadas: cuotas_vencidas.length,
          total_interes_generado: Math.round(total_interes_generado * 100) / 100
        });
      }
    });

  } catch (error) {
    callback(error);
  }
};

/**
 * Simula la aplicación de un pago sin guardar en BD
 * (Útil para mostrar al cliente cómo se distribuirá el pago)
 *
 * @param {Object} params - Parámetros del pago
 * @param {Function} callback - Callback (err, simulacion)
 */
const simularAplicacionPago = (params, callback) => {
  try {
    const { iddeuda, monto_pago } = params;

    if (!iddeuda || !monto_pago || monto_pago <= 0) {
      return callback(new Error('Parámetros inválidos'));
    }

    DetalleCuotasVenta.findByDeuda(iddeuda, (err, cuotas) => {
      if (err) {
        return callback(err);
      }

      const cuotas_pendientes = cuotas.filter(c =>
        c.estado === 'pendiente' || c.estado === 'pagada_parcial' || c.estado === 'vencida'
      ).sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));

      let monto_restante = monto_pago;
      const simulacion = [];

      for (const cuota of cuotas_pendientes) {
        if (monto_restante <= 0) break;

        const saldo_total = cuota.saldo_total || 0;
        if (saldo_total <= 0) continue;

        const monto_aplicar = Math.min(monto_restante, saldo_total);

        simulacion.push({
          numero_cuota: cuota.numero_cuota,
          fecha_vencimiento: cuota.fecha_vencimiento,
          saldo_antes: saldo_total,
          monto_aplicado: monto_aplicar,
          saldo_despues: saldo_total - monto_aplicar,
          quedara_pagada: (saldo_total - monto_aplicar) <= 0
        });

        monto_restante -= monto_aplicar;
      }

      callback(null, {
        monto_pago,
        monto_aplicado: monto_pago - monto_restante,
        saldo_a_favor: monto_restante,
        cuotas_afectadas: simulacion,
        resumen: {
          total_cuotas_pendientes: cuotas_pendientes.length,
          cuotas_que_se_pagaran_completas: simulacion.filter(s => s.quedara_pagada).length
        }
      });
    });

  } catch (error) {
    callback(error);
  }
};

export { aplicarPagoACuotas, calcularInteresesPunitorios, simularAplicacionPago };
export default aplicarPagoACuotas;
