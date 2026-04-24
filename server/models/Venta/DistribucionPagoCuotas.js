import db from '../../db.js';

const DistribucionPagoCuotas = {
  // Crear una distribución de pago
  create: (data, callback) => {
    const query = `
      INSERT INTO distribucion_pago_cuotas
      (idpago_deuda, iddetalle_cuota, iddeuda, monto_distribuido,
       monto_a_capital, monto_a_interes, monto_a_punitorio, orden_aplicacion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.idpago_deuda,
      data.iddetalle_cuota,
      data.iddeuda,
      data.monto_distribuido,
      data.monto_a_capital || 0,
      data.monto_a_interes || 0,
      data.monto_a_punitorio || 0,
      data.orden_aplicacion || 1
    ];

    db.query(query, values, callback);
  },

  // Crear múltiples distribuciones (aplicación completa de un pago)
  createBulk: (distribuciones, callback) => {
    if (!distribuciones || distribuciones.length === 0) {
      return callback(new Error('No hay distribuciones para crear'));
    }

    const query = `
      INSERT INTO distribucion_pago_cuotas
      (idpago_deuda, iddetalle_cuota, iddeuda, monto_distribuido,
       monto_a_capital, monto_a_interes, monto_a_punitorio, orden_aplicacion)
      VALUES ?
    `;

    const values = distribuciones.map(d => [
      d.idpago_deuda,
      d.iddetalle_cuota,
      d.iddeuda,
      d.monto_distribuido,
      d.monto_a_capital || 0,
      d.monto_a_interes || 0,
      d.monto_a_punitorio || 0,
      d.orden_aplicacion || 1
    ]);

    db.query(query, [values], callback);
  },

  // Obtener todas las distribuciones de un pago
  findByPago: (idpago_deuda, callback) => {
    const query = `
      SELECT
        dp.*,
        dc.numero_cuota,
        dc.fecha_vencimiento,
        dc.monto_cuota_total,
        dc.estado as estado_cuota,
        dv.total_deuda,
        dv.saldo as saldo_deuda
      FROM distribucion_pago_cuotas dp
      INNER JOIN detalle_cuotas_venta dc ON dp.iddetalle_cuota = dc.iddetalle_cuota
      INNER JOIN deuda_venta dv ON dp.iddeuda = dv.iddeuda
      WHERE dp.idpago_deuda = ?
      ORDER BY dp.orden_aplicacion ASC
    `;

    db.query(query, [idpago_deuda], callback);
  },

  // Obtener todas las distribuciones de una cuota específica
  findByCuota: (iddetalle_cuota, callback) => {
    const query = `
      SELECT
        dp.*,
        ppd.fecha_pago,
        ppd.monto_pagado,
        ppd.idformapago,
        ppd.observacion
      FROM distribucion_pago_cuotas dp
      INNER JOIN detalle_pago_deuda_venta ppd ON dp.idpago_deuda = ppd.idpago_deuda
      WHERE dp.iddetalle_cuota = ?
      ORDER BY ppd.fecha_pago DESC, dp.orden_aplicacion ASC
    `;

    db.query(query, [iddetalle_cuota], callback);
  },

  // Obtener todas las distribuciones de una deuda
  findByDeuda: (iddeuda, callback) => {
    const query = `
      SELECT
        dp.*,
        dc.numero_cuota,
        dc.fecha_vencimiento,
        ppd.fecha_pago,
        ppd.monto_pagado
      FROM distribucion_pago_cuotas dp
      INNER JOIN detalle_cuotas_venta dc ON dp.iddetalle_cuota = dc.iddetalle_cuota
      INNER JOIN detalle_pago_deuda_venta ppd ON dp.idpago_deuda = ppd.idpago_deuda
      WHERE dp.iddeuda = ?
      ORDER BY ppd.fecha_pago DESC, dp.orden_aplicacion ASC
    `;

    db.query(query, [iddeuda], callback);
  },

  // Obtener resumen de distribución por cuota
  getResumenByCuota: (iddetalle_cuota, callback) => {
    const query = `
      SELECT
        iddetalle_cuota,
        COUNT(*) as cantidad_pagos,
        SUM(monto_distribuido) as total_distribuido,
        SUM(monto_a_capital) as total_a_capital,
        SUM(monto_a_interes) as total_a_interes,
        SUM(monto_a_punitorio) as total_a_punitorio,
        MIN(created_at) as primer_pago,
        MAX(created_at) as ultimo_pago
      FROM distribucion_pago_cuotas
      WHERE iddetalle_cuota = ?
      GROUP BY iddetalle_cuota
    `;

    db.query(query, [iddetalle_cuota], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0] || null);
    });
  },

  // Obtener resumen de distribución por deuda
  getResumenByDeuda: (iddeuda, callback) => {
    const query = `
      SELECT
        dp.iddeuda,
        COUNT(DISTINCT dp.idpago_deuda) as cantidad_pagos,
        COUNT(DISTINCT dp.iddetalle_cuota) as cuotas_afectadas,
        SUM(dp.monto_distribuido) as total_distribuido,
        SUM(dp.monto_a_capital) as total_a_capital,
        SUM(dp.monto_a_interes) as total_a_interes,
        SUM(dp.monto_a_punitorio) as total_a_punitorio,
        MIN(dp.created_at) as primer_pago,
        MAX(dp.created_at) as ultimo_pago
      FROM distribucion_pago_cuotas dp
      WHERE dp.iddeuda = ?
      GROUP BY dp.iddeuda
    `;

    db.query(query, [iddeuda], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0] || null);
    });
  },

  // Obtener historial completo de pagos con distribución
  getHistorialCompleto: (iddeuda, callback) => {
    const query = `
      SELECT
        ppd.idpago_deuda,
        ppd.fecha_pago,
        ppd.monto_pagado,
        ppd.observacion,
        ppd.idformapago,
        dp.iddistribucion,
        dp.iddetalle_cuota,
        dp.monto_distribuido,
        dp.monto_a_capital,
        dp.monto_a_interes,
        dp.monto_a_punitorio,
        dp.orden_aplicacion,
        dc.numero_cuota,
        dc.fecha_vencimiento,
        dc.monto_cuota_total
      FROM detalle_pago_deuda_venta ppd
      LEFT JOIN distribucion_pago_cuotas dp ON ppd.idpago_deuda = dp.idpago_deuda
      LEFT JOIN detalle_cuotas_venta dc ON dp.iddetalle_cuota = dc.iddetalle_cuota
      WHERE ppd.iddeuda = ?
        AND ppd.deleted_at IS NULL
      ORDER BY ppd.fecha_pago DESC, dp.orden_aplicacion ASC
    `;

    db.query(query, [iddeuda], callback);
  },

  // Obtener última distribución de un pago
  findUltimaByPago: (idpago_deuda, callback) => {
    const query = `
      SELECT *
      FROM distribucion_pago_cuotas
      WHERE idpago_deuda = ?
      ORDER BY orden_aplicacion DESC
      LIMIT 1
    `;

    db.query(query, [idpago_deuda], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0] || null);
    });
  },

  // Verificar si un pago ya fue distribuido
  verificarPagoDistribuido: (idpago_deuda, callback) => {
    const query = `
      SELECT COUNT(*) as cantidad
      FROM distribucion_pago_cuotas
      WHERE idpago_deuda = ?
    `;

    db.query(query, [idpago_deuda], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].cantidad > 0);
    });
  },

  // Eliminar distribuciones de un pago (en caso de reversa)
  deleteByPago: (idpago_deuda, callback) => {
    const query = `
      DELETE FROM distribucion_pago_cuotas
      WHERE idpago_deuda = ?
    `;

    db.query(query, [idpago_deuda], callback);
  },

  // Obtener distribuciones por rango de fechas
  findByRangoFechas: (fecha_inicio, fecha_fin, callback) => {
    const query = `
      SELECT
        dp.*,
        dc.numero_cuota,
        ppd.fecha_pago,
        ppd.monto_pagado,
        dv.idventa,
        c.nombre_cliente,
        c.apellido_cliente
      FROM distribucion_pago_cuotas dp
      INNER JOIN detalle_pago_deuda_venta ppd ON dp.idpago_deuda = ppd.idpago_deuda
      INNER JOIN detalle_cuotas_venta dc ON dp.iddetalle_cuota = dc.iddetalle_cuota
      INNER JOIN deuda_venta dv ON dp.iddeuda = dv.iddeuda
      INNER JOIN clientes c ON dv.idcliente = c.idcliente
      WHERE ppd.fecha_pago BETWEEN ? AND ?
        AND ppd.deleted_at IS NULL
      ORDER BY ppd.fecha_pago DESC
    `;

    db.query(query, [fecha_inicio, fecha_fin], callback);
  }
};

export default DistribucionPagoCuotas;
