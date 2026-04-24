import db from '../../db.js';

const Egreso = {
  create: (data, callback) => {
    const query = `
      INSERT INTO egresos (
        idcompra, fecha, hora, monto, concepto, idtipo_egreso, observacion,
        idmovimiento, idformapago, creado_por, idfuncionario, idpago_deuda_compra, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      data.idcompra || null,
      data.fecha,
      data.hora,
      data.monto,
      data.concepto,
      data.idtipo_egreso,
      data.observacion || '',
      data.idmovimiento,
      data.idformapago,
      data.creado_por || 'sistema',
      data.idfuncionario || null,
      data.idpago_deuda_compra || null,
    ];
    db.query(query, values, callback);
  },

  updateTransferenciaId: (idegreso, iddetalle_transferencia_pago, callback) => {
    const sql = `
      UPDATE egresos 
      SET iddetalle_transferencia_pago = ?
      WHERE idegreso = ?
    `;
    db.query(sql, [iddetalle_transferencia_pago, idegreso], callback);
  },

  updateTarjetaId: (idegreso, iddetalle_tarjeta_compra_pago, callback) => {
    const sql = `
      UPDATE egresos 
      SET iddetalle_tarjeta_compra_pago = ?
      WHERE idegreso = ?
    `;
    db.query(sql, [iddetalle_tarjeta_compra_pago, idegreso], callback);
  },

  updateChequeId: (idegreso, iddetalle_cheque_compra_pago, callback) => {
    const sql = `UPDATE egresos SET iddetalle_cheque_compra_pago = ? WHERE idegreso = ?`;
    db.query(sql, [iddetalle_cheque_compra_pago, idegreso], callback);
  },

  findByMovimiento: (idmovimiento, callback) => {
    const sql = `
    SELECT 
      i.idegreso,
      DATE_FORMAT(i.fecha, '%d-%m-%Y') AS fecha,
      i.hora,
      i.monto,
      i.concepto,
      i.idtipo_egreso,
      ti.descripcion  AS tipo_egreso,
      i.idformapago,
      fp.descripcion  AS forma_pago,
      i.observacion,
      i.idcompra,
      i.idpago_deuda_compra,
      i.creado_por,
      CONCAT(u.nombre, ' ', u.apellido) AS creador

    FROM egresos i
    LEFT JOIN tipo_egreso ti  ON i.idtipo_egreso  = ti.idtipo_egreso
    LEFT JOIN formas_pago  fp   ON i.idformapago     = fp.idformapago
    LEFT JOIN usuarios u ON i.creado_por = u.idusuarios
    WHERE i.deleted_at IS NULL
      AND i.idmovimiento = ?
    ORDER BY i.created_at DESC
  `;
    db.query(sql, [idmovimiento], callback);
  },

  getAll: (callback) => {
    const query = `
      SELECT e.*, t.descripcion AS tipo_egreso
      FROM egresos e
      JOIN tipo_egreso t ON e.idtipo_egreso = t.idtipo_egreso
      WHERE e.deleted_at IS NULL
      ORDER BY e.created_at DESC
    `;
    db.query(query, callback);
  },


  findAllPaginatedFiltered: (limit, offset, search, filtros, cb) => {
    const params = [];
    const buildFechaWhere = (f, params) => {
      const c = [];
      if (f.fechaDesde) { c.push('DATE(e.fecha) >= ?'); params.push(f.fechaDesde); }
      if (f.fechaHasta) { c.push('DATE(e.fecha) <= ?'); params.push(f.fechaHasta); }
      return c.length ? ' AND ' + c.join(' AND ') : '';
    };
    const term = `%${search}%`;

    const sql = `
    SELECT
      e.*,
      t.descripcion AS tipo_egreso,
      (e.idcompra IS NOT NULL OR e.idpago_deuda_compra IS NOT NULL) AS relacionado
    FROM egresos e
    JOIN tipo_egreso t ON e.idtipo_egreso = t.idtipo_egreso
    WHERE e.deleted_at IS NULL
      AND (e.concepto LIKE ? OR t.descripcion LIKE ?)
      ${buildFechaWhere(filtros, params)}
    ORDER BY e.fecha DESC
    LIMIT ? OFFSET ?
  `;

    params.unshift(term, term);      // primero los LIKE
    params.push(limit, offset);      // luego paginación
    db.query(sql, params, cb);
  },

  countFiltered: (search, filtros, cb) => {
    const params = [];
    const buildFechaWhere = (f, params) => {
      const c = [];
      if (f.fechaDesde) { c.push('DATE(e.fecha) >= ?'); params.push(f.fechaDesde); }
      if (f.fechaHasta) { c.push('DATE(e.fecha) <= ?'); params.push(f.fechaHasta); }
      return c.length ? ' AND ' + c.join(' AND ') : '';
    };
    const term = `%${search}%`;

    const sql = `
    SELECT COUNT(*) AS total
    FROM egresos e
    JOIN tipo_egreso t ON e.idtipo_egreso = t.idtipo_egreso
    WHERE e.deleted_at IS NULL
      AND (e.concepto LIKE ? OR t.descripcion LIKE ?)
      ${buildFechaWhere(filtros, params)}
  `;

    params.unshift(term, term);
    db.query(sql, params, (err, rows) =>
      err ? cb(err) : cb(null, rows[0].total)
    );
  },

  // Versión filtrada por usuario (creado_por o idfuncionariosIds)
  findAllPaginatedFilteredByUser: (limit, offset, search, filtros, creado_por, idfuncionariosIds, cb) => {
    const params = [];

    // Construir condición de usuario
    let userCondition = '';
    if (creado_por && !idfuncionariosIds) {
      userCondition = 'AND e.creado_por = ?';
    } else if (idfuncionariosIds && !creado_por) {
      userCondition = 'AND e.idfuncionario IN (?)';
    } else if (creado_por && idfuncionariosIds) {
      userCondition = 'AND (e.creado_por = ? OR e.idfuncionario IN (?))';
    }

    const buildFechaWhere = (f) => {
      const c = [];
      if (f.fechaDesde) c.push('DATE(e.fecha) >= ?');
      if (f.fechaHasta) c.push('DATE(e.fecha) <= ?');
      return c.length ? ' AND ' + c.join(' AND ') : '';
    };
    const term = `%${search}%`;

    const sql = `
    SELECT
      e.*,
      t.descripcion AS tipo_egreso,
      (e.idcompra IS NOT NULL OR e.idpago_deuda_compra IS NOT NULL) AS relacionado
    FROM egresos e
    JOIN tipo_egreso t ON e.idtipo_egreso = t.idtipo_egreso
    WHERE e.deleted_at IS NULL
      ${userCondition}
      AND (e.concepto LIKE ? OR t.descripcion LIKE ?)
      ${buildFechaWhere(filtros)}
    ORDER BY e.fecha DESC
    LIMIT ? OFFSET ?
  `;

    // Orden correcto de parámetros según el SQL
    if (creado_por && !idfuncionariosIds) {
      params.push(creado_por);
    } else if (idfuncionariosIds && !creado_por) {
      params.push(idfuncionariosIds);
    } else if (creado_por && idfuncionariosIds) {
      params.push(creado_por, idfuncionariosIds);
    }

    params.push(term, term);

    if (filtros.fechaDesde) params.push(filtros.fechaDesde);
    if (filtros.fechaHasta) params.push(filtros.fechaHasta);

    params.push(limit, offset);

    db.query(sql, params, cb);
  },

  countFilteredByUser: (search, filtros, creado_por, idfuncionariosIds, cb) => {
    const params = [];

    // Construir condición de usuario
    let userCondition = '';
    if (creado_por && !idfuncionariosIds) {
      userCondition = 'AND e.creado_por = ?';
    } else if (idfuncionariosIds && !creado_por) {
      userCondition = 'AND e.idfuncionario IN (?)';
    } else if (creado_por && idfuncionariosIds) {
      userCondition = 'AND (e.creado_por = ? OR e.idfuncionario IN (?))';
    }

    const buildFechaWhere = (f) => {
      const c = [];
      if (f.fechaDesde) c.push('DATE(e.fecha) >= ?');
      if (f.fechaHasta) c.push('DATE(e.fecha) <= ?');
      return c.length ? ' AND ' + c.join(' AND ') : '';
    };
    const term = `%${search}%`;

    const sql = `
    SELECT COUNT(*) AS total
    FROM egresos e
    JOIN tipo_egreso t ON e.idtipo_egreso = t.idtipo_egreso
    WHERE e.deleted_at IS NULL
      ${userCondition}
      AND (e.concepto LIKE ? OR t.descripcion LIKE ?)
      ${buildFechaWhere(filtros)}
  `;

    // Orden correcto de parámetros según el SQL
    if (creado_por && !idfuncionariosIds) {
      params.push(creado_por);
    } else if (idfuncionariosIds && !creado_por) {
      params.push(idfuncionariosIds);
    } else if (creado_por && idfuncionariosIds) {
      params.push(creado_por, idfuncionariosIds);
    }

    params.push(term, term);

    if (filtros.fechaDesde) params.push(filtros.fechaDesde);
    if (filtros.fechaHasta) params.push(filtros.fechaHasta);

    db.query(sql, params, (err, rows) =>
      err ? cb(err) : cb(null, rows[0].total)
    );
  },


  checkIfEgresoRelacionado: (idegreso, callback) => {
    const query = `
    SELECT idegreso, idcompra, idpago_deuda_compra
    FROM egresos
    WHERE idegreso = ? AND deleted_at IS NULL
    LIMIT 1
  `;
    db.query(query, [idegreso], (err, results) => {
      if (err) return callback(err);
      if (!results.length) return callback(null, null);

      const egreso = results[0];
      const relacionado = egreso.idcompra != null || egreso.idpago_deuda_compra != null;
      callback(null, relacionado);
    });
  },

  softDeleteByPagoDeudaCompraId: (idpago, callback) => {
    const query = `
      UPDATE egresos
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE idpago_deuda_compra = ?
    `;
    db.query(query, [idpago], callback);
  },

  softDeleteByCompraId: (idcompra, callback) => {
    const query = `
      UPDATE egresos
      SET deleted_at = NOW()
      WHERE idcompra = ? AND deleted_at IS NULL
    `;
    db.query(query, [idcompra], callback);
  },


  softDelete: (idegreso, callback) => {
    const query = `
      UPDATE egresos
      SET deleted_at = NOW()
      WHERE idegreso = ?
    `;
    db.query(query, [idegreso], callback);
  },

  // Obtener total de egresos por usuario
  getTotalByUser: (creado_por, idfuncionariosIds, callback) => {
    let userCondition = '';
    const params = [];

    if (creado_por && !idfuncionariosIds) {
      userCondition = 'AND e.creado_por = ?';
      params.push(creado_por);
    } else if (idfuncionariosIds && !creado_por) {
      userCondition = 'AND e.idfuncionario IN (?)';
      params.push(idfuncionariosIds);
    } else if (creado_por && idfuncionariosIds) {
      userCondition = 'AND (e.creado_por = ? OR e.idfuncionario IN (?))';
      params.push(creado_por, idfuncionariosIds);
    }

    const sql = `
      SELECT
        COUNT(*) AS total_registros,
        COALESCE(SUM(e.monto), 0) AS total_monto
      FROM egresos e
      WHERE e.deleted_at IS NULL
        ${userCondition}
    `;

    db.query(sql, params, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0]);
    });
  },
};

export default Egreso;
