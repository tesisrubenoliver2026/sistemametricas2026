import DetalleCuotasVenta from '../../../models/Venta/DetalleCuotasVenta.js';
import DistribucionPagoCuotas from '../../../models/Venta/DistribucionPagoCuotas.js';

/**
 * Revierte la aplicación de un pago a las cuotas
 * (Se usa cuando se anula un pago)
 *
 * Este proceso:
 * 1. Obtiene todas las distribuciones del pago anulado
 * 2. Revierte los montos pagados en cada cuota afectada
 * 3. Recalcula los saldos de las cuotas
 * 4. Actualiza el estado de las cuotas según corresponda
 * 5. Elimina las distribuciones del pago anulado
 *
 * @param {number} idpago_deuda - ID del pago que se está anulando
 * @param {Function} callback - Callback (err, resultado)
 */
const revertirPagoCuotas = (idpago_deuda, callback) => {
  try {
    if (!idpago_deuda) {
      return callback(new Error('ID de pago no proporcionado'));
    }

    // 1. Obtener todas las distribuciones del pago a anular
    DistribucionPagoCuotas.findByPago(idpago_deuda, (err, distribuciones) => {
      if (err) {
        return callback(err);
      }

      if (!distribuciones || distribuciones.length === 0) {
        // Si no hay distribuciones, el pago no fue aplicado a cuotas
        // Esto puede pasar en créditos sin plan de cuotas
        return callback(null, {
          mensaje: 'No hay distribuciones a revertir (pago sin cuotas)',
          cuotas_afectadas: 0
        });
      }

      // 2. Agrupar distribuciones por cuota para revertir los montos
      const cuotasAfectadas = new Map();

      distribuciones.forEach(dist => {
        const iddetalle_cuota = dist.iddetalle_cuota;

        if (!cuotasAfectadas.has(iddetalle_cuota)) {
          cuotasAfectadas.set(iddetalle_cuota, {
            iddetalle_cuota,
            monto_a_capital_revertir: 0,
            monto_a_interes_revertir: 0,
            monto_a_punitorio_revertir: 0,
            monto_total_revertir: 0
          });
        }

        const cuota = cuotasAfectadas.get(iddetalle_cuota);
        cuota.monto_a_capital_revertir += parseFloat(dist.monto_a_capital || 0);
        cuota.monto_a_interes_revertir += parseFloat(dist.monto_a_interes || 0);
        cuota.monto_a_punitorio_revertir += parseFloat(dist.monto_a_punitorio || 0);
        cuota.monto_total_revertir += parseFloat(dist.monto_distribuido || 0);
      });

      // 3. Revertir cada cuota afectada
      let cuotas_procesadas = 0;
      let errores = [];
      const cuotas_array = Array.from(cuotasAfectadas.values());

      if (cuotas_array.length === 0) {
        return callback(new Error('No se encontraron cuotas para revertir'));
      }

      cuotas_array.forEach((cuota_revertir) => {
        // Obtener la cuota actual de la BD
        DetalleCuotasVenta.findById(cuota_revertir.iddetalle_cuota, (err, cuota_actual) => {
          if (err) {
            errores.push({ cuota: cuota_revertir.iddetalle_cuota, error: err.message });
            cuotas_procesadas++;

            if (cuotas_procesadas === cuotas_array.length) {
              finalizarReversion();
            }
            return;
          }

          if (!cuota_actual) {
            errores.push({ cuota: cuota_revertir.iddetalle_cuota, error: 'Cuota no encontrada' });
            cuotas_procesadas++;

            if (cuotas_procesadas === cuotas_array.length) {
              finalizarReversion();
            }
            return;
          }

          // Calcular nuevos valores revirtiendo el pago
          const nuevo_monto_pagado_capital = Math.max(0,
            (parseFloat(cuota_actual.monto_pagado_capital) || 0) - cuota_revertir.monto_a_capital_revertir
          );
          const nuevo_monto_pagado_interes = Math.max(0,
            (parseFloat(cuota_actual.monto_pagado_interes) || 0) - cuota_revertir.monto_a_interes_revertir
          );
          const nuevo_monto_pagado_punitorio = Math.max(0,
            (parseFloat(cuota_actual.monto_pagado_punitorio) || 0) - cuota_revertir.monto_a_punitorio_revertir
          );

          // Recalcular saldos
          const monto_capital = parseFloat(cuota_actual.monto_capital) || 0;
          const monto_interes_normal = parseFloat(cuota_actual.monto_interes_normal) || 0;
          const interes_punitorio_generado = parseFloat(cuota_actual.interes_punitorio_generado) || 0;

          const nuevo_saldo_capital = Math.round((monto_capital - nuevo_monto_pagado_capital) * 100) / 100;
          const nuevo_saldo_interes = Math.round((monto_interes_normal - nuevo_monto_pagado_interes) * 100) / 100;
          const nuevo_saldo_punitorio = Math.round((interes_punitorio_generado - nuevo_monto_pagado_punitorio) * 100) / 100;
          const nuevo_saldo_total = nuevo_saldo_capital + nuevo_saldo_interes + nuevo_saldo_punitorio;
          const nuevo_monto_total_pagado = nuevo_monto_pagado_capital + nuevo_monto_pagado_interes + nuevo_monto_pagado_punitorio;

          // Determinar nuevo estado
          let nuevo_estado;
          const monto_cuota_total = parseFloat(cuota_actual.monto_cuota_total) || 0;

          if (nuevo_saldo_total <= 0) {
            nuevo_estado = 'pagada_total';
          } else if (nuevo_monto_total_pagado > 0) {
            nuevo_estado = 'pagada_parcial';
          } else {
            // Si no hay pago, verificar si está vencida
            const fecha_vencimiento = new Date(cuota_actual.fecha_vencimiento);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (fecha_vencimiento < hoy) {
              nuevo_estado = 'vencida';
            } else {
              nuevo_estado = 'pendiente';
            }
          }

          // Actualizar la cuota
          const data_update = {
            monto_pagado_capital: nuevo_monto_pagado_capital,
            monto_pagado_interes: nuevo_monto_pagado_interes,
            monto_pagado_punitorio: nuevo_monto_pagado_punitorio,
            monto_total_pagado: nuevo_monto_total_pagado,
            saldo_capital: nuevo_saldo_capital,
            saldo_interes: nuevo_saldo_interes,
            saldo_punitorio: nuevo_saldo_punitorio,
            saldo_total: nuevo_saldo_total,
            interes_punitorio_generado: cuota_actual.interes_punitorio_generado,
            estado: nuevo_estado,
            fecha_ultimo_pago: cuota_actual.fecha_ultimo_pago,
            observaciones: cuota_actual.observaciones
          };

          DetalleCuotasVenta.update(cuota_revertir.iddetalle_cuota, data_update, (err) => {
            if (err) {
              errores.push({ cuota: cuota_revertir.iddetalle_cuota, error: err.message });
            }

            cuotas_procesadas++;

            if (cuotas_procesadas === cuotas_array.length) {
              finalizarReversion();
            }
          });
        });
      });

      function finalizarReversion() {
        if (errores.length > 0) {
          return callback(new Error(`Errores al revertir cuotas: ${JSON.stringify(errores)}`));
        }

        // 4. Eliminar las distribuciones del pago anulado
        DistribucionPagoCuotas.deleteByPago(idpago_deuda, (err) => {
          if (err) {
            return callback(err);
          }

          callback(null, {
            mensaje: 'Pago revertido exitosamente',
            cuotas_afectadas: cuotas_array.length,
            distribuciones_eliminadas: distribuciones.length
          });
        });
      }
    });

  } catch (error) {
    callback(error);
  }
};

export default revertirPagoCuotas;
