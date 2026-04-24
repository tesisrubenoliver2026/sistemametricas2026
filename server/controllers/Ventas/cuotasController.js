import DetalleCuotasVenta from '../../models/Venta/DetalleCuotasVenta.js';
import DistribucionPagoCuotas from '../../models/Venta/DistribucionPagoCuotas.js';
import DeudaVenta from '../../models/Venta/DeudaVenta.js';
import { generarPlanCuotasFrances, recalcularPlanCuotas, simularPlanCuotas } from './helpers/generarPlanCuotasFrances.js';
import { aplicarPagoACuotas, calcularInteresesPunitorios, simularAplicacionPago } from './helpers/aplicarPagoACuotas.js';
import { aplicarPagoACuotaEspecifica } from './helpers/aplicarPagoACuotaEspecifica.js';

/**
 * Generar plan de cuotas para una deuda
 */
export const generarPlanCuotasCtrl = (req, res) => {
  try {
    const {
      iddeuda,
      idventa,
      idcliente,
      monto_financiar,
      cant_cuota,
      tasa_interes_anual,
      dia_fecha_pago,
      fecha_inicio
    } = req.body;

    // Validaciones básicas
    if (!iddeuda || !idventa || !idcliente) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos',
        campos_requeridos: ['iddeuda', 'idventa', 'idcliente']
      });
    }

    if (!monto_financiar || monto_financiar <= 0) {
      return res.status(400).json({ error: 'El monto a financiar debe ser mayor a 0' });
    }

    if (!cant_cuota || cant_cuota <= 0) {
      return res.status(400).json({ error: 'La cantidad de cuotas debe ser mayor a 0' });
    }

    if (tasa_interes_anual < 0) {
      return res.status(400).json({ error: 'La tasa de interés no puede ser negativa' });
    }

    if (!dia_fecha_pago || dia_fecha_pago < 1 || dia_fecha_pago > 31) {
      return res.status(400).json({ error: 'El día de pago debe estar entre 1 y 31' });
    }

    // Verificar que la deuda existe
    DeudaVenta.findById(iddeuda, (err, deuda) => {
      if (err) {
        console.error('Error al buscar deuda:', err);
        return res.status(500).json({ error: 'Error al buscar la deuda' });
      }

      if (!deuda) {
        return res.status(404).json({ error: 'Deuda no encontrada' });
      }

      // Generar plan de cuotas
      const params = {
        iddeuda,
        idventa,
        idcliente,
        monto_financiar,
        cant_cuota,
        tasa_interes_anual,
        dia_fecha_pago,
        fecha_inicio: fecha_inicio || new Date()
      };

      generarPlanCuotasFrances(params, (err, resultado) => {
        if (err) {
          console.error('Error al generar plan de cuotas:', err);
          return res.status(500).json({
            error: 'Error al generar plan de cuotas',
            detalle: err.message
          });
        }

        // Actualizar deuda_venta con los datos del plan
        const updateQuery = `
          UPDATE deuda_venta
          SET
            cant_cuota = ?,
            tasa_interes_anual = ?,
            tasa_interes_mensual = ?,
            dia_fecha_pago = ?,
            updated_at = NOW()
          WHERE iddeuda = ?
        `;

        const updateValues = [
          cant_cuota,
          tasa_interes_anual,
          resultado.metadata.tasa_interes_mensual,
          dia_fecha_pago,
          iddeuda
        ];

        const db = require('../../db.js').default;
        db.query(updateQuery, updateValues, (err) => {
          if (err) {
            console.error('Error al actualizar deuda:', err);
            // No retornar error porque las cuotas ya se crearon
          }

          res.status(201).json({
            mensaje: 'Plan de cuotas generado exitosamente',
            cuotas: resultado.cuotas,
            resumen: resultado.metadata
          });
        });
      });
    });

  } catch (error) {
    console.error('Error en generarPlanCuotasCtrl:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: error.message
    });
  }
};

/**
 * Aplicar un pago a las cuotas pendientes
 */
export const aplicarPagoCtrl = (req, res) => {
  try {
    const { iddeuda, idpago_deuda, monto_pagado } = req.body;

    // Validaciones
    if (!iddeuda || !idpago_deuda) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos',
        campos_requeridos: ['iddeuda', 'idpago_deuda']
      });
    }

    if (!monto_pagado || monto_pagado <= 0) {
      return res.status(400).json({ error: 'El monto pagado debe ser mayor a 0' });
    }

    // Verificar que el pago no haya sido distribuido previamente
    DistribucionPagoCuotas.verificarPagoDistribuido(idpago_deuda, (err, yaDistribuido) => {
      if (err) {
        console.error('Error al verificar pago:', err);
        return res.status(500).json({ error: 'Error al verificar el pago' });
      }

      if (yaDistribuido) {
        return res.status(400).json({
          error: 'Este pago ya fue distribuido anteriormente',
          sugerencia: 'Si necesita revertir el pago, elimínelo primero'
        });
      }

      // Aplicar el pago
      const params = { iddeuda, idpago_deuda, monto_pagado };

      aplicarPagoACuotas(params, (err, resultado) => {
        if (err) {
          console.error('Error al aplicar pago:', err);
          return res.status(500).json({
            error: 'Error al aplicar el pago',
            detalle: err.message
          });
        }

        res.status(200).json(resultado);
      });
    });

  } catch (error) {
    console.error('Error en aplicarPagoCtrl:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: error.message
    });
  }
};

/**
 * Aplicar un pago a una cuota específica (no usa FIFO)
 */
export const aplicarPagoCuotaEspecificaCtrl = (req, res) => {
  try {
    const { iddeuda, iddetalle_cuota, idpago_deuda, monto_pagado } = req.body;

    // Validaciones
    if (!iddeuda || !iddetalle_cuota || !idpago_deuda) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos',
        campos_requeridos: ['iddeuda', 'iddetalle_cuota', 'idpago_deuda']
      });
    }

    if (!monto_pagado || monto_pagado <= 0) {
      return res.status(400).json({ error: 'El monto pagado debe ser mayor a 0' });
    }

    // Verificar que el pago no haya sido distribuido previamente
    DistribucionPagoCuotas.verificarPagoDistribuido(idpago_deuda, (err, yaDistribuido) => {
      if (err) {
        console.error('Error al verificar pago:', err);
        return res.status(500).json({ error: 'Error al verificar el pago' });
      }

      if (yaDistribuido) {
        return res.status(400).json({
          error: 'Este pago ya fue distribuido anteriormente',
          sugerencia: 'Si necesita revertir el pago, elimínelo primero'
        });
      }

      // Aplicar el pago a la cuota específica
      const params = { iddeuda, iddetalle_cuota, idpago_deuda, monto_pagado };

      aplicarPagoACuotaEspecifica(params, (err, resultado) => {
        if (err) {
          console.error('Error al aplicar pago a cuota específica:', err);
          return res.status(500).json({
            error: 'Error al aplicar el pago',
            detalle: err.message
          });
        }

        res.status(200).json(resultado);
      });
    });

  } catch (error) {
    console.error('Error en aplicarPagoCuotaEspecificaCtrl:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: error.message
    });
  }
};

/**
 * Listar cuotas de una deuda
 */
export const listarCuotasCtrl = (req, res) => {
  try {
    const { iddeuda } = req.params;

    if (!iddeuda) {
      return res.status(400).json({ error: 'iddeuda es requerido' });
    }

    DetalleCuotasVenta.findByDeuda(iddeuda, (err, cuotas) => {
      if (err) {
        console.error('Error al listar cuotas:', err);
        return res.status(500).json({ error: 'Error al listar cuotas' });
      }

      // Calcular resumen
      const resumen = {
        total_cuotas: cuotas.length,
        cuotas_pendientes: cuotas.filter(c => c.estado === 'pendiente').length,
        cuotas_pagadas: cuotas.filter(c => c.estado === 'pagada_total').length,
        cuotas_vencidas: cuotas.filter(c => c.estado === 'vencida').length,
        total_a_pagar: cuotas.reduce((sum, c) => sum + parseFloat(c.saldo_total || 0), 0),
        total_pagado: cuotas.reduce((sum, c) => {
          const pagado_capital = parseFloat(c.monto_pagado_capital || 0);
          const pagado_interes = parseFloat(c.monto_pagado_interes || 0);
          const pagado_punitorio = parseFloat(c.monto_pagado_punitorio || 0);
          return sum + pagado_capital + pagado_interes + pagado_punitorio;
        }, 0)
      };

      res.status(200).json({
        cuotas,
        resumen
      });
    });

  } catch (error) {
    console.error('Error en listarCuotasCtrl:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: error.message
    });
  }
};

/**
 * Listar cuotas pendientes de un cliente
 */
export const listarCuotasPendientesClienteCtrl = (req, res) => {
  try {
    const { idcliente } = req.params;

    if (!idcliente) {
      return res.status(400).json({ error: 'idcliente es requerido' });
    }

    DetalleCuotasVenta.findPendientesByCliente(idcliente, (err, cuotas) => {
      if (err) {
        console.error('Error al listar cuotas pendientes:', err);
        return res.status(500).json({ error: 'Error al listar cuotas pendientes' });
      }

      // Agrupar por deuda
      const cuotasPorDeuda = {};
      cuotas.forEach(cuota => {
        if (!cuotasPorDeuda[cuota.iddeuda]) {
          cuotasPorDeuda[cuota.iddeuda] = {
            iddeuda: cuota.iddeuda,
            idventa: cuota.idventa,
            fecha_venta: cuota.fecha_venta,
            total_deuda: cuota.total_deuda,
            saldo_deuda: cuota.saldo_deuda,
            cuotas: []
          };
        }
        cuotasPorDeuda[cuota.iddeuda].cuotas.push(cuota);
      });

      res.status(200).json({
        deudas: Object.values(cuotasPorDeuda),
        total_deudas: Object.keys(cuotasPorDeuda).length,
        total_cuotas_pendientes: cuotas.length
      });
    });

  } catch (error) {
    console.error('Error en listarCuotasPendientesClienteCtrl:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: error.message
    });
  }
};

/**
 * Obtener historial de pagos de una deuda con distribución
 */
export const obtenerHistorialPagosCtrl = (req, res) => {
  try {
    const { iddeuda } = req.params;

    if (!iddeuda) {
      return res.status(400).json({ error: 'iddeuda es requerido' });
    }

    DistribucionPagoCuotas.getHistorialCompleto(iddeuda, (err, historial) => {
      if (err) {
        console.error('Error al obtener historial:', err);
        return res.status(500).json({ error: 'Error al obtener historial de pagos' });
      }

      // Agrupar por pago
      const pagosPorId = {};
      historial.forEach(item => {
        if (!pagosPorId[item.idpago_deuda]) {
          pagosPorId[item.idpago_deuda] = {
            idpago_deuda: item.idpago_deuda,
            fecha_pago: item.fecha_pago,
            monto_pagado: item.monto_pagado,
            observacion: item.observacion,
            idformapago: item.idformapago,
            distribuciones: []
          };
        }

        if (item.iddistribucion) {
          pagosPorId[item.idpago_deuda].distribuciones.push({
            iddistribucion: item.iddistribucion,
            iddetalle_cuota: item.iddetalle_cuota,
            numero_cuota: item.numero_cuota,
            fecha_vencimiento: item.fecha_vencimiento,
            monto_cuota_total: item.monto_cuota_total,
            monto_distribuido: item.monto_distribuido,
            monto_a_capital: item.monto_a_capital,
            monto_a_interes: item.monto_a_interes,
            monto_a_punitorio: item.monto_a_punitorio,
            orden_aplicacion: item.orden_aplicacion
          });
        }
      });

      res.status(200).json({
        pagos: Object.values(pagosPorId),
        total_pagos: Object.keys(pagosPorId).length
      });
    });

  } catch (error) {
    console.error('Error en obtenerHistorialPagosCtrl:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: error.message
    });
  }
};

/**
 * Calcular intereses punitorios para cuotas vencidas
 * (Normalmente ejecutado por cron job)
 */
export const calcularInteresesCtrl = (req, res) => {
  try {
    calcularInteresesPunitorios((err, resultado) => {
      if (err) {
        console.error('Error al calcular intereses:', err);
        return res.status(500).json({
          error: 'Error al calcular intereses punitorios',
          detalle: err.message
        });
      }

      res.status(200).json(resultado);
    });

  } catch (error) {
    console.error('Error en calcularInteresesCtrl:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: error.message
    });
  }
};

/**
 * Simular plan de cuotas (sin guardar en BD)
 */
export const simularPlanCtrl = (req, res) => {
  try {
    const {
      monto_financiar,
      cant_cuota,
      tasa_interes_anual,
      dia_fecha_pago,
      fecha_inicio
    } = req.body;

    if (!monto_financiar || !cant_cuota || tasa_interes_anual === undefined) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos',
        campos_requeridos: ['monto_financiar', 'cant_cuota', 'tasa_interes_anual']
      });
    }

    const params = {
      monto_financiar,
      cant_cuota,
      tasa_interes_anual,
      dia_fecha_pago: dia_fecha_pago || 1,
      fecha_inicio: fecha_inicio || new Date()
    };

    simularPlanCuotas(params, (err, simulacion) => {
      if (err) {
        console.error('Error al simular plan:', err);
        return res.status(500).json({
          error: 'Error al simular plan de cuotas',
          detalle: err.message
        });
      }

      res.status(200).json(simulacion);
    });

  } catch (error) {
    console.error('Error en simularPlanCtrl:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: error.message
    });
  }
};

/**
 * Simular aplicación de pago (sin guardar en BD)
 */
export const simularPagoCtrl = (req, res) => {
  try {
    const { iddeuda, monto_pago } = req.body;

    if (!iddeuda || !monto_pago) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos',
        campos_requeridos: ['iddeuda', 'monto_pago']
      });
    }

    simularAplicacionPago({ iddeuda, monto_pago }, (err, simulacion) => {
      if (err) {
        console.error('Error al simular pago:', err);
        return res.status(500).json({
          error: 'Error al simular aplicación de pago',
          detalle: err.message
        });
      }

      res.status(200).json(simulacion);
    });

  } catch (error) {
    console.error('Error en simularPagoCtrl:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: error.message
    });
  }
};

/**
 * Recalcular plan de cuotas (refinanciamiento)
 */
export const recalcularPlanCtrl = (req, res) => {
  try {
    const { iddeuda } = req.params;
    const {
      idventa,
      idcliente,
      monto_financiar,
      cant_cuota,
      tasa_interes_anual,
      dia_fecha_pago,
      fecha_inicio
    } = req.body;

    if (!iddeuda) {
      return res.status(400).json({ error: 'iddeuda es requerido' });
    }

    if (!monto_financiar || !cant_cuota || tasa_interes_anual === undefined) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos para recalcular',
        campos_requeridos: ['monto_financiar', 'cant_cuota', 'tasa_interes_anual']
      });
    }

    const nuevos_params = {
      idventa,
      idcliente,
      monto_financiar,
      cant_cuota,
      tasa_interes_anual,
      dia_fecha_pago: dia_fecha_pago || 1,
      fecha_inicio: fecha_inicio || new Date()
    };

    recalcularPlanCuotas(iddeuda, nuevos_params, (err, resultado) => {
      if (err) {
        console.error('Error al recalcular plan:', err);
        return res.status(500).json({
          error: 'Error al recalcular plan de cuotas',
          detalle: err.message
        });
      }

      res.status(200).json({
        mensaje: 'Plan de cuotas recalculado exitosamente',
        cuotas: resultado.cuotas,
        resumen: resultado.metadata
      });
    });

  } catch (error) {
    console.error('Error en recalcularPlanCtrl:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: error.message
    });
  }
};

/**
 * Obtener detalle de una cuota específica
 */
export const obtenerDetalleCuotaCtrl = (req, res) => {
  try {
    const { iddetalle_cuota } = req.params;

    if (!iddetalle_cuota) {
      return res.status(400).json({ error: 'iddetalle_cuota es requerido' });
    }

    DetalleCuotasVenta.findById(iddetalle_cuota, (err, cuota) => {
      if (err) {
        console.error('Error al obtener detalle de cuota:', err);
        return res.status(500).json({ error: 'Error al obtener detalle de cuota' });
      }

      if (!cuota) {
        return res.status(404).json({ error: 'Cuota no encontrada' });
      }

      // Obtener distribuciones de pago de esta cuota
      DistribucionPagoCuotas.findByCuota(iddetalle_cuota, (err, distribuciones) => {
        if (err) {
          console.error('Error al obtener distribuciones:', err);
          // No retornar error, solo no incluir distribuciones
          return res.status(200).json({ cuota });
        }

        res.status(200).json({
          cuota,
          distribuciones,
          total_pagos_aplicados: distribuciones.length
        });
      });
    });

  } catch (error) {
    console.error('Error en obtenerDetalleCuotaCtrl:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: error.message
    });
  }
};
