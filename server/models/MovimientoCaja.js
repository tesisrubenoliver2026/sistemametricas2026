import db from '../db.js';

const MovimientoCaja = {
  findAll: (callback) => {
    db.query(`
      SELECT m.*, u.login 
      FROM movimiento_caja m
      JOIN usuarios u ON m.idusuarios = u.idusuarios
    `, callback);
  },

  findById: (id, callback) => {
    db.query('SELECT * FROM movimiento_caja WHERE idmovimiento = ?', [id], callback);
  },

  getById: (id, callback) => {
    db.query(
      'SELECT * FROM movimiento_caja WHERE idmovimiento = ? LIMIT 1',
      [id],
      (err, rows) => {
        if (err) return callback(err);
        callback(null, rows[0] || null);   // ← devuelve solo un objeto o null
      }
    );
  },

  create: (data, callback) => {
    const query = `
      INSERT INTO movimiento_caja (
        idusuarios, idfuncionario, num_caja, fecha_apertura, monto_apertura, estado
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.idusuarios || null,
      data.idfuncionario || null,
      data.num_caja,
      data.fecha_apertura,
      data.monto_apertura,
      data.estado || 'abierto'
    ];
    db.query(query, values, callback);
  },

  findAllPaginatedFiltered: (limit, offset, search, filtros, cb) => {
    const searchTerm = `%${search}%`;
    const conds = [];
    const params = [searchTerm, searchTerm, searchTerm, searchTerm];

    if (filtros.aperturaDesde) { conds.push('m.fecha_apertura >= ?'); params.push(filtros.aperturaDesde); }
    if (filtros.aperturaHasta) { conds.push('m.fecha_apertura <= ?'); params.push(filtros.aperturaHasta); }
    if (filtros.cierreDesde) { conds.push('m.fecha_cierre >= ?'); params.push(filtros.cierreDesde); }
    if (filtros.cierreHasta) { conds.push('m.fecha_cierre <= ?'); params.push(filtros.cierreHasta); }

    const whereFecha = conds.length ? 'AND ' + conds.join(' AND ') : '';

    const sql = `
    SELECT m.*, u.login
    FROM movimiento_caja m
    JOIN usuarios u ON m.idusuarios = u.idusuarios
    WHERE (
      m.num_caja LIKE ?
      OR m.fecha_apertura LIKE ?
      OR m.estado LIKE ?
      OR u.login LIKE ?
    )
    ${whereFecha}
    ORDER BY m.idmovimiento DESC
    LIMIT ? OFFSET ?
  `;

    params.push(limit, offset);
    db.query(sql, params, cb);
  },
  countFiltered: (search, filtros, cb) => {
    const searchTerm = `%${search}%`;

    const conds = [];
    const params = [searchTerm, searchTerm, searchTerm, searchTerm];

    if (filtros.aperturaDesde) {
      conds.push('m.fecha_apertura >= ?');
      params.push(filtros.aperturaDesde);
    }
    if (filtros.aperturaHasta) {
      conds.push('m.fecha_apertura <= ?');
      params.push(filtros.aperturaHasta);
    }
    if (filtros.cierreDesde) {
      conds.push('m.fecha_cierre >= ?');
      params.push(filtros.cierreDesde);
    }
    if (filtros.cierreHasta) {
      conds.push('m.fecha_cierre <= ?');
      params.push(filtros.cierreHasta);
    }

    const whereFecha = conds.length ? 'AND ' + conds.join(' AND ') : '';

    const sql = `
    SELECT COUNT(*) AS total
    FROM movimiento_caja m
    JOIN usuarios u ON m.idusuarios = u.idusuarios
    WHERE (
      m.num_caja LIKE ?
      OR m.fecha_apertura LIKE ?
      OR m.estado LIKE ?
      OR u.login LIKE ?
    )
    ${whereFecha}
  `;

    db.query(sql, params, (err, rows) =>
      err ? cb(err) : cb(null, rows[0].total)
    );
  },

  // Versiones filtradas por usuario/funcionario
  findAllPaginatedFilteredByUser: (limit, offset, search, filtros, idusuarios, idfuncionariosIds, cb) => {
    const searchTerm = `%${search}%`;
    const conds = [];
    const params = [];

    // Primero agregar parámetros de búsqueda (van primero en el SQL)
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);

    // Condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND m.idusuarios = ?';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND m.idfuncionario IN (?)';
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (m.idusuarios = ? OR m.idfuncionario IN (?))';
      params.push(idusuarios, idfuncionariosIds);
    }

    console.log('🔍 findAllPaginatedFilteredByUser - Debug:', {
      idusuarios,
      idfuncionariosIds,
      userCondition,
      paramsAfterUser: [...params]
    });

    // Filtros de fecha
    if (filtros.aperturaDesde) { conds.push('m.fecha_apertura >= ?'); params.push(filtros.aperturaDesde); }
    if (filtros.aperturaHasta) { conds.push('m.fecha_apertura <= ?'); params.push(filtros.aperturaHasta); }
    if (filtros.cierreDesde) { conds.push('m.fecha_cierre >= ?'); params.push(filtros.cierreDesde); }
    if (filtros.cierreHasta) { conds.push('m.fecha_cierre <= ?'); params.push(filtros.cierreHasta); }

    const whereFecha = conds.length ? 'AND ' + conds.join(' AND ') : '';

    const sql = `
    SELECT m.*,
           COALESCE(u.login, f.login) as login
    FROM movimiento_caja m
    LEFT JOIN usuarios u ON m.idusuarios = u.idusuarios
    LEFT JOIN funcionarios f ON m.idfuncionario = f.idfuncionario
    WHERE (
      m.num_caja LIKE ?
      OR m.fecha_apertura LIKE ?
      OR m.estado LIKE ?
      OR COALESCE(u.login, f.login) LIKE ?
    )
    ${userCondition}
    ${whereFecha}
    ORDER BY m.idmovimiento DESC
    LIMIT ? OFFSET ?
  `;

    params.push(limit, offset);
    db.query(sql, params, cb);
  },

  countFilteredByUser: (search, filtros, idusuarios, idfuncionariosIds, cb) => {
    const searchTerm = `%${search}%`;
    const conds = [];
    const params = [];

    // Primero agregar parámetros de búsqueda (van primero en el SQL)
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);

    // Condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND m.idusuarios = ?';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND m.idfuncionario IN (?)';
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (m.idusuarios = ? OR m.idfuncionario IN (?))';
      params.push(idusuarios, idfuncionariosIds);
    }

    // Filtros de fecha
    if (filtros.aperturaDesde) { conds.push('m.fecha_apertura >= ?'); params.push(filtros.aperturaDesde); }
    if (filtros.aperturaHasta) { conds.push('m.fecha_apertura <= ?'); params.push(filtros.aperturaHasta); }
    if (filtros.cierreDesde) { conds.push('m.fecha_cierre >= ?'); params.push(filtros.cierreDesde); }
    if (filtros.cierreHasta) { conds.push('m.fecha_cierre <= ?'); params.push(filtros.cierreHasta); }

    const whereFecha = conds.length ? 'AND ' + conds.join(' AND ') : '';

    const sql = `
    SELECT COUNT(*) AS total
    FROM movimiento_caja m
    LEFT JOIN usuarios u ON m.idusuarios = u.idusuarios
    LEFT JOIN funcionarios f ON m.idfuncionario = f.idfuncionario
    WHERE (
      m.num_caja LIKE ?
      OR m.fecha_apertura LIKE ?
      OR m.estado LIKE ?
      OR COALESCE(u.login, f.login) LIKE ?
    )
    ${userCondition}
    ${whereFecha}
  `;

    db.query(sql, params, (err, rows) =>
      err ? cb(err) : cb(null, rows[0].total)
    );
  },

  cerrarCaja: (id, data, callback) => {
    const query = `
      UPDATE movimiento_caja SET
        fecha_cierre = ?, monto_cierre = ?, credito = ?, gastos = ?, cobrado = ?,
        contado = ?, ingresos = ?, compras = ?, estado = ?
      WHERE idmovimiento = ?
    `;
    const values = [
      data.fecha_cierre, data.monto_cierre, data.credito, data.gastos,
      data.cobrado, data.contado, data.ingresos, data.compras,
      data.estado, id
    ];
    db.query(query, values, callback);
  },
  getEstadoById: (id, callback) => {
    db.query('SELECT estado FROM movimiento_caja WHERE idmovimiento = ?', [id], callback);
  },

  // Obtener movimiento abierto filtrado por usuario/funcionario
  getMovimientoAbierto: (idusuarios, idfuncionario, callback) => {
    let userCondition = '';
    const params = [];

    if (idusuarios && !idfuncionario) {
      // Solo usuario (sin funcionarios relacionados por ahora)
      userCondition = 'AND idusuarios = ?';
      params.push(idusuarios);
    } else if (idfuncionario && !idusuarios) {
      // Solo funcionario
      userCondition = 'AND idfuncionario = ?';
      params.push(idfuncionario);
    } else if (idusuarios && idfuncionario) {
      // Administrador con funcionarios - buscar movimientos del admin o de sus funcionarios
      userCondition = 'AND (idusuarios = ? OR idfuncionario IN (?))';
      params.push(idusuarios, idfuncionario);
    }

    const query = `
      SELECT * FROM movimiento_caja
      WHERE estado = 'abierto'
      ${userCondition}
      LIMIT 1
    `;

    db.query(query, params, callback);
  },

  // Versión legacy sin filtros (para compatibilidad)
  getMovimientoAbiertoSinFiltro: (callback) => {
    const query = `SELECT * FROM movimiento_caja WHERE estado = 'abierto' LIMIT 1`;
    db.query(query, callback);
  }
};

export default MovimientoCaja;
