import db from '../../db.js';

const DetalleCuotasVenta = {
  // Crear una nueva cuota
  create: (data, callback) => {
    const query = `
      INSERT INTO detalle_cuotas_venta
      (iddeuda, idventa, idcliente, numero_cuota, fecha_vencimiento,
       monto_cuota_total, monto_capital, monto_interes_normal,
       saldo_capital, saldo_interes, saldo_total, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.iddeuda,
      data.idventa,
      data.idcliente,
      data.numero_cuota,
      data.fecha_vencimiento,
      data.monto_cuota_total,
      data.monto_capital,
      data.monto_interes_normal,
      data.saldo_capital,
      data.saldo_interes,
      data.saldo_total,
      data.estado || 'pendiente'
    ];

    db.query(query, values, callback);
  },

  // Crear múltiples cuotas (plan completo)
  createBulk: (cuotas, callback) => {
    if (!cuotas || cuotas.length === 0) {
      return callback(new Error('No hay cuotas para crear'));
    }

    const query = `
      INSERT INTO detalle_cuotas_venta
      (iddeuda, idventa, idcliente, numero_cuota, fecha_vencimiento,
       monto_cuota_total, monto_capital, monto_interes_normal,
       saldo_capital, saldo_interes, saldo_total, estado)
      VALUES ?
    `;

    const values = cuotas.map(c => [
      c.iddeuda,
      c.idventa,
      c.idcliente,
      c.numero_cuota,
      c.fecha_vencimiento,
      c.monto_cuota_total,
      c.monto_capital,
      c.monto_interes_normal,
      c.saldo_capital,
      c.saldo_interes,
      c.saldo_total,
      c.estado || 'pendiente'
    ]);

    db.query(query, [values], callback);
  },

  // Obtener todas las cuotas de una deuda
  findByDeuda: (iddeuda, callback) => {
    const query = `
      SELECT
        dc.*,
        dv.total_deuda,
        dv.saldo as saldo_deuda,
        c.nombre as nombre_cliente,
        c.apellido as apellido_cliente,
        v.total as total_venta,
        v.fecha as fecha_venta
      FROM detalle_cuotas_venta dc
      INNER JOIN deuda_venta dv ON dc.iddeuda = dv.iddeuda
      INNER JOIN ventas v ON dc.idventa = v.idventa
      INNER JOIN clientes c ON dc.idcliente = c.idcliente
      WHERE dc.iddeuda = ?
        AND dc.deleted_at IS NULL
      ORDER BY dc.numero_cuota ASC
    `;

    db.query(query, [iddeuda], callback);
  },

  // Obtener una cuota específica
  findById: (iddetalle_cuota, callback) => {
    const query = `
      SELECT
        dc.*,
        dv.total_deuda,
        dv.saldo as saldo_deuda,
        c.nombre as nombre_cliente,
        c.apellido as apellido_cliente
      FROM detalle_cuotas_venta dc
      INNER JOIN deuda_venta dv ON dc.iddeuda = dv.iddeuda
      INNER JOIN clientes c ON dc.idcliente = c.idcliente
      WHERE dc.iddetalle_cuota = ?
        AND dc.deleted_at IS NULL
    `;

    db.query(query, [iddetalle_cuota], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },

  // Obtener cuotas por cliente
  findByCliente: (idcliente, callback) => {
    const query = `
      SELECT
        dc.*,
        dv.total_deuda,
        dv.saldo as saldo_deuda,
        v.idventa,
        v.fecha_venta,
        v.total_venta
      FROM detalle_cuotas_venta dc
      INNER JOIN deuda_venta dv ON dc.iddeuda = dv.iddeuda
      INNER JOIN ventas v ON dc.idventa = v.idventa
      WHERE dc.idcliente = ?
        AND dc.deleted_at IS NULL
      ORDER BY dc.fecha_vencimiento ASC, dc.numero_cuota ASC
    `;

    db.query(query, [idcliente], callback);
  },

  // Obtener cuotas pendientes de un cliente
  findPendientesByCliente: (idcliente, callback) => {
    const query = `
      SELECT
        dc.*,
        dv.total_deuda,
        dv.saldo as saldo_deuda,
        dv.tasa_interes_punitorio_diario,
        dv.periodo_gracia_dias,
        v.idventa,
        v.fecha_venta,
        DATEDIFF(CURDATE(), dc.fecha_vencimiento) as dias_vencidos
      FROM detalle_cuotas_venta dc
      INNER JOIN deuda_venta dv ON dc.iddeuda = dv.iddeuda
      INNER JOIN ventas v ON dc.idventa = v.idventa
      WHERE dc.idcliente = ?
        AND dc.estado IN ('pendiente', 'pagada_parcial', 'vencida')
        AND dc.deleted_at IS NULL
      ORDER BY dc.fecha_vencimiento ASC, dc.numero_cuota ASC
    `;

    db.query(query, [idcliente], callback);
  },

  // Obtener cuotas vencidas (para cálculo de intereses punitorios)
  findVencidas: (callback) => {
    const query = `
      SELECT
        dc.*,
        dv.tasa_interes_punitorio_diario,
        dv.periodo_gracia_dias,
        dv.limite_legal_punitorio,
        DATEDIFF(CURDATE(), dc.fecha_vencimiento) as dias_vencidos
      FROM detalle_cuotas_venta dc
      INNER JOIN deuda_venta dv ON dc.iddeuda = dv.iddeuda
      WHERE dc.estado IN ('pendiente', 'pagada_parcial', 'vencida')
        AND dc.fecha_vencimiento < CURDATE()
        AND dc.deleted_at IS NULL
        AND dv.deleted_at IS NULL
      ORDER BY dc.fecha_vencimiento ASC
    `;

    db.query(query, callback);
  },

  // Actualizar una cuota (aplicar pago)
  update: (iddetalle_cuota, data, callback) => {
    const query = `
      UPDATE detalle_cuotas_venta
      SET
        monto_pagado_capital = ?,
        monto_pagado_interes = ?,
        monto_pagado_punitorio = ?,
        monto_total_pagado = ?,
        saldo_capital = ?,
        saldo_interes = ?,
        saldo_punitorio = ?,
        saldo_total = ?,
        interes_punitorio_generado = ?,
        estado = ?,
        fecha_ultimo_pago = ?,
        observaciones = ?
      WHERE iddetalle_cuota = ?
        AND deleted_at IS NULL
    `;

    const values = [
      data.monto_pagado_capital,
      data.monto_pagado_interes,
      data.monto_pagado_punitorio || 0,
      data.monto_total_pagado || 0,
      data.saldo_capital,
      data.saldo_interes,
      data.saldo_punitorio || 0,
      data.saldo_total,
      data.interes_punitorio_generado || 0,
      data.estado,
      data.fecha_ultimo_pago || new Date(),
      data.observaciones || null,
      iddetalle_cuota
    ];

    db.query(query, values, callback);
  },

  // Actualizar intereses punitorios de una cuota
  updateInteresesPunitorios: (iddetalle_cuota, interes_generado, dias_atraso, callback) => {
    const query = `
      UPDATE detalle_cuotas_venta
      SET
        interes_punitorio_generado = ?,
        saldo_punitorio = saldo_punitorio + ?,
        saldo_total = saldo_total + ?,
        dias_atraso = ?,
        estado = CASE
          WHEN estado = 'pendiente' THEN 'vencida'
          ELSE estado
        END
      WHERE iddetalle_cuota = ?
        AND deleted_at IS NULL
    `;

    const values = [
      interes_generado,
      interes_generado,
      interes_generado,
      dias_atraso,
      iddetalle_cuota
    ];

    db.query(query, values, callback);
  },

  // Cambiar estado de una cuota
  updateEstado: (iddetalle_cuota, estado, callback) => {
    const query = `
      UPDATE detalle_cuotas_venta
      SET estado = ?
      WHERE iddetalle_cuota = ?
        AND deleted_at IS NULL
    `;

    db.query(query, [estado, iddetalle_cuota], callback);
  },

  // Soft delete
  softDelete: (iddetalle_cuota, callback) => {
    const query = `
      UPDATE detalle_cuotas_venta
      SET deleted_at = NOW()
      WHERE iddetalle_cuota = ?
    `;

    db.query(query, [iddetalle_cuota], callback);
  },

  // Eliminar todas las cuotas de una deuda (soft delete)
  softDeleteByDeuda: (iddeuda, callback) => {
    const query = `
      UPDATE detalle_cuotas_venta
      SET deleted_at = NOW()
      WHERE iddeuda = ?
    `;

    db.query(query, [iddeuda], callback);
  },

  // Obtener la última fecha de vencimiento de las cuotas de una deuda
  getUltimaFechaVencimiento: (iddeuda, callback) => {
    const query = `
      SELECT MAX(fecha_vencimiento) as ultima_fecha_vencimiento
      FROM detalle_cuotas_venta
      WHERE iddeuda = ?
        AND deleted_at IS NULL
    `;

    db.query(query, [iddeuda], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]?.ultima_fecha_vencimiento || null);
    });
  }
};

export default DetalleCuotasVenta;
