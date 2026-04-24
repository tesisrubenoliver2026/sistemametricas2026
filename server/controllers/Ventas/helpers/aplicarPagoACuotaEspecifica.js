import DetalleCuotasVenta from '../../../models/Venta/DetalleCuotasVenta.js';
import DistribucionPagoCuotas from '../../../models/Venta/DistribucionPagoCuotas.js';
import DeudaVenta from '../../../models/Venta/DeudaVenta.js';

/**
 * Aplica un pago a UNA cuota específica (no usa FIFO)
 *
 * Orden de aplicación dentro de la cuota:
 * 1. Interés punitorio (mora)
 * 2. Interés normal (del crédito)
 * 3. Capital
 *
 * @param {Object} params - Parámetros del pago
 * @param {number} params.iddeuda - ID de la deuda
 * @param {number} params.iddetalle_cuota - ID de la cuota específica a pagar
 * @param {number} params.idpago_deuda - ID del pago registrado
 * @param {number} params.monto_pagado - Monto total del pago
 * @param {Function} callback - Callback (err, resultado)
 */
const aplicarPagoACuotaEspecifica = (params, callback) => {
  try {
    const { iddeuda, iddetalle_cuota, idpago_deuda, monto_pagado } = params;

    // Validaciones
    if (!iddeuda || !iddetalle_cuota || !idpago_deuda) {
      return callback(new Error('Faltan parámetros requeridos: iddeuda, iddetalle_cuota, idpago_deuda'));
    }

    if (!monto_pagado || monto_pagado <= 0) {
      return callback(new Error('El monto pagado debe ser mayor a 0'));
    }

    // Obtener la cuota específica
    DetalleCuotasVenta.findById(iddetalle_cuota, (err, cuota) => {
      if (err) {
        return callback(err);
      }

      if (!cuota) {
        return callback(new Error('Cuota no encontrada'));
      }

      // Verificar que la cuota pertenece a la deuda
      if (cuota.iddeuda !== parseInt(iddeuda)) {
        return callback(new Error('La cuota no pertenece a esta deuda'));
      }

      // Verificar que la cuota está pendiente o parcialmente pagada
      if (cuota.estado === 'pagada_total' || cuota.estado === 'cancelada') {
        return callback(new Error('La cuota ya está pagada completamente'));
      }

      // Calcular saldos actuales de la cuota
      const saldo_punitorio = parseFloat(cuota.saldo_punitorio) || 0;
      const monto_interes_normal = parseFloat(cuota.monto_interes_normal) || 0;
      const monto_pagado_interes = parseFloat(cuota.monto_pagado_interes) || 0;
      const monto_capital = parseFloat(cuota.monto_capital) || 0;
      const monto_pagado_capital = parseFloat(cuota.monto_pagado_capital) || 0;

      const saldo_interes = parseFloat(cuota.saldo_interes) || (monto_interes_normal - monto_pagado_interes);
      const saldo_capital = parseFloat(cuota.saldo_capital) || (monto_capital - monto_pagado_capital);
      const saldo_total_cuota = saldo_punitorio + saldo_interes + saldo_capital;

      if (saldo_total_cuota <= 0) {
        return callback(new Error('La cuota no tiene saldo pendiente'));
      }

      // Determinar cuánto se puede aplicar a esta cuota
      const monto_a_aplicar = Math.min(monto_pagado, saldo_total_cuota);

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

      // Calcular saldo a favor si el pago excede el saldo de la cuota
      const saldo_a_favor = Math.max(0, monto_pagado - monto_a_aplicar);

      // Crear distribución
      const distribucion = {
        idpago_deuda,
        iddetalle_cuota: cuota.iddetalle_cuota,
        iddeuda,
        monto_distribuido: monto_a_aplicar,
        monto_a_capital,
        monto_a_interes,
        monto_a_punitorio,
        orden_aplicacion: 1
      };

      // Guardar distribución en la base de datos
      DistribucionPagoCuotas.create(distribucion, (err) => {
        if (err) {
          return callback(err);
        }

        // Actualizar la cuota
        const nuevo_monto_pagado_capital = (parseFloat(cuota.monto_pagado_capital) || 0) + monto_a_capital;
        const nuevo_monto_pagado_interes = (parseFloat(cuota.monto_pagado_interes) || 0) + monto_a_interes;
        const nuevo_monto_pagado_punitorio = (parseFloat(cuota.monto_pagado_punitorio) || 0) + monto_a_punitorio;
        const nuevo_monto_total_pagado = nuevo_monto_pagado_capital + nuevo_monto_pagado_interes + nuevo_monto_pagado_punitorio;

        const cuota_data = {
          iddetalle_cuota: cuota.iddetalle_cuota,
          monto_pagado_capital: nuevo_monto_pagado_capital,
          monto_pagado_interes: nuevo_monto_pagado_interes,
          monto_pagado_punitorio: nuevo_monto_pagado_punitorio,
          monto_total_pagado: nuevo_monto_total_pagado,
          saldo_capital: nuevo_saldo_capital,
          saldo_interes: nuevo_saldo_interes,
          saldo_punitorio: nuevo_saldo_punitorio,
          saldo_total: nuevo_saldo_total,
          interes_punitorio_generado: cuota.interes_punitorio_generado || 0,
          estado: nuevo_estado,
          fecha_ultimo_pago: new Date(),
          observaciones: cuota.observaciones
        };

        DetalleCuotasVenta.update(cuota.iddetalle_cuota, cuota_data, (err) => {
          if (err) {
            return callback(err);
          }

          // Si hay saldo a favor, actualizar en deuda_venta
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

          function finalizarProceso() {
            // Retornar resultado
            callback(null, {
              mensaje: 'Pago aplicado exitosamente a la cuota específica',
              cuota_afectada: cuota.numero_cuota,
              monto_pagado,
              monto_aplicado: monto_a_aplicar,
              saldo_a_favor: Math.round(saldo_a_favor * 100) / 100,
              distribucion: {
                monto_a_capital,
                monto_a_interes,
                monto_a_punitorio
              },
              nuevo_estado_cuota: nuevo_estado,
              nuevo_saldo_cuota: nuevo_saldo_total
            });
          }
        });
      });
    });

  } catch (error) {
    callback(error);
  }
};

export { aplicarPagoACuotaEspecifica };
export default aplicarPagoACuotaEspecifica;
