// models/Venta/DeudaVenta.js
import db from '../../db.js';

const DeudaVenta = {
  create: (data, callback) => {
    const saldo = parseFloat(data.total_deuda) - parseFloat(data.total_pagado || 0);
    const ganancia_credito = (parseFloat(data.total_pagado || 0) - parseFloat(data.costo_empresa || 0));

    // ✅ Convertir booleano a string "true" o "false"
    const tiene_cuotas = data.tiene_cuotas ? 'true' : 'false';

    const query = `
          INSERT INTO deuda_venta (
            idventa, idcliente, total_deuda, total_pagado, saldo,
            estado, fecha_deuda, costo_empresa, ganancia_credito,
            cant_cuota, tasa_interes_anual, dia_fecha_pago, tiene_cuotas,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

    const values = [
      data.idventa,
      data.idcliente,
      data.total_deuda,
      data.total_pagado || 0,
      saldo,
      data.estado,
      data.fecha_deuda,
      data.costo_empresa,
      ganancia_credito,
      data.cant_cuota || 1,
      data.tasa_interes_anual || 0,
      data.dia_fecha_pago || 15,
      tiene_cuotas
    ];

    db.query(query, values, callback);
  },

  findByCliente: (idcliente, callback) => {
    const query = `SELECT * FROM deuda_venta WHERE idcliente = ? AND deleted_at IS NULL`;
    db.query(query, [idcliente], callback);
  },

  findByVenta: (idventa, callback) => {
    const query = `SELECT * FROM deuda_venta WHERE idventa = ? AND deleted_at IS NULL`;
    db.query(query, [idventa], callback);
  },

  registrarPago: (iddeuda, monto_pagado, callback) => {
    const obtenerQuery = 'SELECT total_pagado, total_deuda, costo_empresa, estado FROM deuda_venta WHERE iddeuda = ?';

    db.query(obtenerQuery, [iddeuda], (err, results) => {
      if (err) return callback(err);

      if (!results.length) {
        return callback(new Error('❌ Deuda no encontrada.'));
      }

      const deuda = results[0];
      const nuevoTotalPagado = parseFloat(deuda.total_pagado) + parseFloat(monto_pagado);
      const nuevoSaldo = parseFloat(deuda.total_deuda) - nuevoTotalPagado;
      const nuevaGanancia = nuevoTotalPagado - parseFloat(deuda.costo_empresa);

      // Solo cambiar estado si la deuda fue saldada completamente
      const nuevoEstado = nuevoSaldo <= 0 ? 'pagado' : deuda.estado;

      const updateQuery = `
            UPDATE deuda_venta
            SET 
              total_pagado = ?,
              saldo = ?,
              ganancia_credito = ?,
              estado = ?,
              ult_fecha_pago = NOW(),
              updated_at = NOW()
            WHERE iddeuda = ?
          `;

      db.query(updateQuery, [nuevoTotalPagado, nuevoSaldo, nuevaGanancia, nuevoEstado, iddeuda], callback);
    });
  },

  updatePagos: (iddeuda, total_pagado, callback) => {
    const query = `
      UPDATE deuda_venta
      SET total_pagado = ?, updated_at = NOW()
      WHERE iddeuda = ?
    `;
    db.query(query, [total_pagado, iddeuda], callback);
  },

  getAllByNumDocumentoAndEstado: (numDocumento, estado, callback) => {
    const conditions = ['dv.deleted_at IS NULL'];
    const params = [];

    if (numDocumento) {
      conditions.push('c.numDocumento = ?');
      params.push(numDocumento);
    }

    if (estado) {
      conditions.push('dv.estado = ?');
      params.push(estado);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
    SELECT dv.*, c.nombre AS nombre_cliente, c.numDocumento
    FROM deuda_venta dv
    LEFT JOIN clientes c ON c.idcliente = dv.idcliente
    ${whereClause}
    ORDER BY dv.fecha_deuda DESC
  `;

    db.query(query, params, callback);
  },

  getAllByNumDocumentoAndEstadoByUser: (numDocumento, estado, idusuarios, idfuncionariosIds, callback) => {
    const conditions = ['dv.deleted_at IS NULL'];
    const params = [];

    // Construir condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'v.idusuarios = ?';
      conditions.push(userCondition);
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'v.idfuncionario IN (?)';
      conditions.push(userCondition);
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = '(v.idusuarios = ? OR v.idfuncionario IN (?))';
      conditions.push(userCondition);
      params.push(idusuarios, idfuncionariosIds);
    }

    if (numDocumento) {
      conditions.push('c.numDocumento = ?');
      params.push(numDocumento);
    }

    if (estado) {
      conditions.push('dv.estado = ?');
      params.push(estado);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
    SELECT dv.*, c.nombre AS nombre_cliente, c.numDocumento
    FROM deuda_venta dv
    INNER JOIN ventas v ON dv.idventa = v.idventa
    LEFT JOIN clientes c ON c.idcliente = dv.idcliente
    ${whereClause}
    ORDER BY dv.fecha_deuda DESC
  `;

    db.query(query, params, callback);
  },

  findAllPaginatedFiltered: (limit, offset, search, estado, callback) => {
    const searchTerm = `%${search}%`;

    let estadoCondicion = '';
    const params = [searchTerm, searchTerm, searchTerm]; // nombre, estado, numDocumento

    if (estado) {
      estadoCondicion = ' AND dv.estado = ?';
      params.push(estado);
    }

    params.push(limit, offset);

    const query = `
    SELECT dv.*, c.nombre AS nombre_cliente, c.numDocumento
    FROM deuda_venta dv
    LEFT JOIN clientes c ON c.idcliente = dv.idcliente
    WHERE dv.deleted_at IS NULL
      AND (
        c.nombre LIKE ?
        OR dv.estado LIKE ?
        OR c.numDocumento LIKE ?
      )
      ${estadoCondicion}
    ORDER BY dv.fecha_deuda DESC
    LIMIT ? OFFSET ?
  `;

    db.query(query, params, callback);
  },

  // Filtrado por usuario/funcionario vía JOIN con ventas
  findAllPaginatedFilteredByUser: (limit, offset, search, estado, idusuarios, idfuncionariosIds, callback) => {
    const searchTerm = `%${search}%`;
    const params = [];

    // Construir condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND v.idusuarios = ?';
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND v.idfuncionario IN (?)';
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (v.idusuarios = ? OR v.idfuncionario IN (?))';
    }

    // Construir condición de estado
    let estadoCondicion = '';
    if (estado) {
      estadoCondicion = 'AND dv.estado = ?';
    }

    // Orden de parámetros según el SQL
    if (idusuarios && !idfuncionariosIds) {
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      params.push(idusuarios, idfuncionariosIds);
    }

    params.push(searchTerm, searchTerm, searchTerm);

    if (estado) {
      params.push(estado);
    }

    params.push(limit, offset);

    const query = `
    SELECT dv.*, c.nombre AS nombre_cliente, c.numDocumento
    FROM deuda_venta dv
    INNER JOIN ventas v ON dv.idventa = v.idventa
    LEFT JOIN clientes c ON c.idcliente = dv.idcliente
    WHERE dv.deleted_at IS NULL
      ${userCondition}
      AND (
        c.nombre LIKE ?
        OR dv.estado LIKE ?
        OR c.numDocumento LIKE ?
      )
      ${estadoCondicion}
    ORDER BY dv.fecha_deuda DESC
    LIMIT ? OFFSET ?
  `;

    db.query(query, params, callback);
  },

  countFiltered: (search, estado, callback) => {
    const searchTerm = `%${search}%`;

    let estadoCondicion = '';
    const params = [searchTerm, searchTerm, searchTerm];

    if (estado) {
      estadoCondicion = ' AND dv.estado = ?';
      params.push(estado);
    }

    const query = `
      SELECT COUNT(*) AS total
      FROM deuda_venta dv
      LEFT JOIN clientes c ON c.idcliente = dv.idcliente
      WHERE dv.deleted_at IS NULL
        AND (
          c.nombre LIKE ?
          OR dv.estado LIKE ?
          OR c.numDocumento LIKE ?
        )
        ${estadoCondicion}
    `;

    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  countFilteredByUser: (search, estado, idusuarios, idfuncionariosIds, callback) => {
    const searchTerm = `%${search}%`;
    const params = [];

    // Construir condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND v.idusuarios = ?';
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND v.idfuncionario IN (?)';
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (v.idusuarios = ? OR v.idfuncionario IN (?))';
    }

    // Construir condición de estado
    let estadoCondicion = '';
    if (estado) {
      estadoCondicion = 'AND dv.estado = ?';
    }

    // Orden de parámetros
    if (idusuarios && !idfuncionariosIds) {
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      params.push(idusuarios, idfuncionariosIds);
    }

    params.push(searchTerm, searchTerm, searchTerm);

    if (estado) {
      params.push(estado);
    }

    const query = `
      SELECT COUNT(*) AS total
      FROM deuda_venta dv
      INNER JOIN ventas v ON dv.idventa = v.idventa
      LEFT JOIN clientes c ON c.idcliente = dv.idcliente
      WHERE dv.deleted_at IS NULL
        ${userCondition}
        AND (
          c.nombre LIKE ?
          OR dv.estado LIKE ?
          OR c.numDocumento LIKE ?
        )
        ${estadoCondicion}
    `;

    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  findAllPaginatedFilteredByCliente: (limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
        SELECT
            dv.idcliente,
            c.nombre AS nombre_cliente,
            c.numDocumento,
            SUM(CAST(dv.total_deuda AS DECIMAL(10,2))) AS total_deuda,
            SUM(CAST(dv.total_pagado AS DECIMAL(10,2))) AS total_pagado,
            SUM(CAST(dv.saldo AS DECIMAL(10,2))) AS saldo,
            SUM(CAST(dv.costo_empresa AS DECIMAL(10,2))) AS costo_empresa,
            SUM(CAST(dv.ganancia_credito AS DECIMAL(10,2))) AS ganancia_credito,
            MIN(dv.fecha_deuda) AS fecha_deuda,
            MIN(dv.created_at) AS created_at
        FROM deuda_venta dv
        LEFT JOIN clientes c ON c.idcliente = dv.idcliente
        WHERE dv.deleted_at IS NULL
          AND (c.nombre LIKE ? OR dv.estado LIKE ? OR c.numDocumento LIKE ?)
        GROUP BY dv.idcliente, c.nombre , c.numDocumento
        ORDER BY fecha_deuda DESC
        LIMIT ? OFFSET ?
    `;
    db.query(query, [searchTerm, searchTerm, searchTerm, limit, offset], callback);
  },

  // Agrupado por cliente con paginación y filtro de usuario
  findAllPaginatedFilteredByClienteAndUser: (limit, offset, search, idusuarios, idfuncionariosIds, callback) => {
    const searchTerm = `%${search}%`;
    const params = [];

    // Construir condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND v.idusuarios = ?';
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND v.idfuncionario IN (?)';
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (v.idusuarios = ? OR v.idfuncionario IN (?))';
    }

    // Orden de parámetros
    if (idusuarios && !idfuncionariosIds) {
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      params.push(idusuarios, idfuncionariosIds);
    }

    params.push(searchTerm, searchTerm, searchTerm);
    params.push(limit, offset);

    const query = `
        SELECT
            dv.idcliente,
            c.nombre AS nombre_cliente,
            c.numDocumento,
            SUM(CAST(dv.total_deuda AS DECIMAL(10,2))) AS total_deuda,
            SUM(CAST(dv.total_pagado AS DECIMAL(10,2))) AS total_pagado,
            SUM(CAST(dv.saldo AS DECIMAL(10,2))) AS saldo,
            SUM(CAST(dv.costo_empresa AS DECIMAL(10,2))) AS costo_empresa,
            SUM(CAST(dv.ganancia_credito AS DECIMAL(10,2))) AS ganancia_credito,
            MIN(dv.fecha_deuda) AS fecha_deuda,
            MIN(dv.created_at) AS created_at
        FROM deuda_venta dv
        INNER JOIN ventas v ON dv.idventa = v.idventa
        LEFT JOIN clientes c ON c.idcliente = dv.idcliente
        WHERE dv.deleted_at IS NULL
          ${userCondition}
          AND (c.nombre LIKE ? OR dv.estado LIKE ? OR c.numDocumento LIKE ?)
        GROUP BY dv.idcliente, c.nombre, c.numDocumento
        ORDER BY fecha_deuda DESC
        LIMIT ? OFFSET ?
    `;
    db.query(query, params, callback);
  },

  findAllFilteredByCliente: (search = '', callback) => {
  const like = `%${search}%`;

  const sql = `
    SELECT
        dv.idcliente,
        c.nombre                            AS nombre_cliente,
        c.numDocumento,

        /* ▼ Cantidad de ítems por estado ▼ */
        COUNT(CASE WHEN dv.estado = 'pendiente' THEN 1 END) AS items_pendientes,
        COUNT(CASE WHEN dv.estado = 'pagado'    THEN 1 END) AS items_pagados,

        /* ▼ Totales monetarios – opcionales ▼ */
        SUM(CAST(dv.total_deuda  AS DECIMAL(10,2))) AS total_deuda,
        SUM(CAST(dv.total_pagado AS DECIMAL(10,2))) AS total_pagado,
        SUM(CAST(dv.saldo        AS DECIMAL(10,2))) AS saldo,

        MIN(dv.fecha_deuda)  AS fecha_deuda,
        MIN(dv.created_at)   AS created_at
    FROM  deuda_venta dv
    LEFT  JOIN clientes c ON c.idcliente = dv.idcliente
    WHERE dv.deleted_at IS NULL
      AND (
        c.nombre       LIKE ?
        OR dv.estado   LIKE ?
        OR c.numDocumento LIKE ?
      )
    GROUP BY dv.idcliente, c.nombre, c.numDocumento
    ORDER BY fecha_deuda DESC;
  `;

  db.query(sql, [like, like, like], callback);
},

  // Agrupado por cliente con filtro de usuario
  findAllFilteredByClienteAndUser: (search = '', idusuarios, idfuncionariosIds, callback) => {
    const like = `%${search}%`;
    const params = [];

    // Construir condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND v.idusuarios = ?';
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND v.idfuncionario IN (?)';
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (v.idusuarios = ? OR v.idfuncionario IN (?))';
    }

    // Orden de parámetros
    if (idusuarios && !idfuncionariosIds) {
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      params.push(idusuarios, idfuncionariosIds);
    }

    params.push(like, like, like);

    const sql = `
      SELECT
          dv.idcliente,
          c.nombre                            AS nombre_cliente,
          c.numDocumento,

          /* ▼ Cantidad de ítems por estado ▼ */
          COUNT(CASE WHEN dv.estado = 'pendiente' THEN 1 END) AS items_pendientes,
          COUNT(CASE WHEN dv.estado = 'pagado'    THEN 1 END) AS items_pagados,

          /* ▼ Totales monetarios – opcionales ▼ */
          SUM(CAST(dv.total_deuda  AS DECIMAL(10,2))) AS total_deuda,
          SUM(CAST(dv.total_pagado AS DECIMAL(10,2))) AS total_pagado,
          SUM(CAST(dv.saldo        AS DECIMAL(10,2))) AS saldo,

          MIN(dv.fecha_deuda)  AS fecha_deuda,
          MIN(dv.created_at)   AS created_at
      FROM  deuda_venta dv
      INNER JOIN ventas v ON dv.idventa = v.idventa
      LEFT  JOIN clientes c ON c.idcliente = dv.idcliente
      WHERE dv.deleted_at IS NULL
        ${userCondition}
        AND (
          c.nombre       LIKE ?
          OR dv.estado   LIKE ?
          OR c.numDocumento LIKE ?
        )
      GROUP BY dv.idcliente, c.nombre, c.numDocumento
      ORDER BY fecha_deuda DESC;
    `;

    db.query(sql, params, callback);
  },

  countFilteredByCliente: (search, callback) => {
    const searchTerm = `%${search}%`;

    const query = `
    SELECT COUNT(DISTINCT dv.idcliente) AS total
    FROM deuda_venta dv
    LEFT JOIN clientes c ON c.idcliente = dv.idcliente
    WHERE dv.deleted_at IS NULL
      AND (
        c.nombre LIKE ?
        OR dv.estado LIKE ?
        OR c.numDocumento LIKE ?
      )
  `;

    db.query(query, [searchTerm, searchTerm, searchTerm], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  countFilteredByClienteAndUser: (search, idusuarios, idfuncionariosIds, callback) => {
    const searchTerm = `%${search}%`;
    const params = [];

    // Construir condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND v.idusuarios = ?';
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND v.idfuncionario IN (?)';
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (v.idusuarios = ? OR v.idfuncionario IN (?))';
    }

    // Orden de parámetros
    if (idusuarios && !idfuncionariosIds) {
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      params.push(idusuarios, idfuncionariosIds);
    }

    params.push(searchTerm, searchTerm, searchTerm);

    const query = `
      SELECT COUNT(DISTINCT dv.idcliente) AS total
      FROM deuda_venta dv
      INNER JOIN ventas v ON dv.idventa = v.idventa
      LEFT JOIN clientes c ON c.idcliente = dv.idcliente
      WHERE dv.deleted_at IS NULL
        ${userCondition}
        AND (
          c.nombre LIKE ?
          OR dv.estado LIKE ?
          OR c.numDocumento LIKE ?
        )
    `;

    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  findById: (iddeuda, callback) => {
    const query = 'SELECT * FROM deuda_venta WHERE iddeuda = ? AND deleted_at IS NULL LIMIT 1';
    db.query(query, [iddeuda], (err, results) => {
      if (err) return callback(err, null);
      if (results.length === 0) return callback(null, null);
      return callback(null, results[0]);
    });
  },

  /**
   * Anular (soft delete) deuda por ID de venta
   */
  softDeleteByVenta: (idventa, callback) => {
    const query = `
      UPDATE deuda_venta
      SET deleted_at = NOW(), estado = 'anulado', updated_at = NOW()
      WHERE idventa = ? AND deleted_at IS NULL
    `;
    db.query(query, [idventa], callback);
  },

  /**
   * Actualizar saldo a favor del cliente
   */
  updateSaldoAFavor: (iddeuda, saldo_a_favor, callback) => {
    const query = `
      UPDATE deuda_venta
      SET saldo_a_favor = ?, updated_at = NOW()
      WHERE iddeuda = ? AND deleted_at IS NULL
    `;
    db.query(query, [saldo_a_favor, iddeuda], callback);
  },

  /**
   * Obtener deudas agrupadas por cliente con información de cuotas
   * Incluye: datos del cliente, totales de deuda, estadísticas de cuotas
   */
  findAllPaginatedWithInstallments: (limit, offset, search, idusuarios, idfuncionariosIds, order = 'DESC', callback) => {
    const searchTerm = `%${search}%`;
    const params = [];

    // Validar el parámetro order (solo ASC o DESC)
    const orderDirection = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    // Construir condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND v.idusuarios = ?';
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND v.idfuncionario IN (?)';
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (v.idusuarios = ? OR v.idfuncionario IN (?))';
    }

    // Orden de parámetros
    if (idusuarios && !idfuncionariosIds) {
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      params.push(idusuarios, idfuncionariosIds);
    }

    params.push(searchTerm, searchTerm, searchTerm);
    params.push(limit, offset);

    const query = `
      SELECT
        cliente_deudas.idcliente,
        cliente_deudas.nombre_cliente,
        cliente_deudas.apellido_cliente,
        cliente_deudas.numDocumento,
        cliente_deudas.telefono,
        cliente_deudas.direccion,
        cliente_deudas.total_creditos,
        cliente_deudas.total_deuda,
        cliente_deudas.total_pagado,
        cliente_deudas.saldo,
        cliente_deudas.creditos_pendientes,
        cliente_deudas.creditos_pagados,
        cliente_deudas.tiene_cuotas,
        cliente_deudas.tasa_interes_max,
        cliente_deudas.fecha_primera_deuda,
        cliente_deudas.fecha_ultima_actualizacion,

        -- Información de cuotas
        COALESCE(cuotas_info.total_cuotas, 0) AS total_cuotas,
        COALESCE(cuotas_info.cuotas_pendientes, 0) AS cuotas_pendientes,
        COALESCE(cuotas_info.cuotas_vencidas, 0) AS cuotas_vencidas,
        COALESCE(cuotas_info.cuotas_pagadas_parcial, 0) AS cuotas_pagadas_parcial,
        COALESCE(cuotas_info.cuotas_pagadas_total, 0) AS cuotas_pagadas_total,
        cuotas_info.proxima_cuota_fecha,
        cuotas_info.proxima_cuota_numero,
        cuotas_info.proxima_cuota_monto,
        COALESCE(cuotas_info.total_interes_punitorio, 0) AS total_interes_punitorio

      FROM (
        -- Subconsulta para datos del cliente y sus deudas (sin JOIN con cuotas)
        SELECT
          dv.idcliente,
          c.nombre AS nombre_cliente,
          c.apellido AS apellido_cliente,
          c.numDocumento,
          c.telefono,
          c.direccion,
          COUNT(DISTINCT dv.iddeuda) AS total_creditos,
          SUM(CAST(dv.total_deuda AS DECIMAL(10,2))) AS total_deuda,
          SUM(CAST(dv.total_pagado AS DECIMAL(10,2))) AS total_pagado,
          SUM(CAST(dv.saldo AS DECIMAL(10,2))) AS saldo,
          COUNT(DISTINCT CASE WHEN dv.estado = 'pendiente' THEN dv.iddeuda END) AS creditos_pendientes,
          COUNT(DISTINCT CASE WHEN dv.estado = 'pagado' THEN dv.iddeuda END) AS creditos_pagados,
          MAX(dv.tiene_cuotas) AS tiene_cuotas,
          COALESCE(MAX(dv.tasa_interes_anual), 0) AS tasa_interes_max,
          MIN(dv.fecha_deuda) AS fecha_primera_deuda,
          MAX(dv.updated_at) AS fecha_ultima_actualizacion
        FROM deuda_venta dv
        INNER JOIN ventas v ON dv.idventa = v.idventa
        LEFT JOIN clientes c ON c.idcliente = dv.idcliente
        WHERE dv.deleted_at IS NULL
          ${userCondition}
          AND (c.nombre LIKE ? OR dv.estado LIKE ? OR c.numDocumento LIKE ?)
        GROUP BY dv.idcliente, c.nombre, c.apellido, c.numDocumento, c.telefono, c.direccion
      ) AS cliente_deudas

      LEFT JOIN (
        -- Subconsulta para información de cuotas
        SELECT
          dv.idcliente,
          COUNT(DISTINCT dc.iddetalle_cuota) AS total_cuotas,
          COUNT(CASE WHEN dc.estado = 'pendiente' THEN 1 END) AS cuotas_pendientes,
          COUNT(CASE WHEN dc.estado = 'vencida' THEN 1 END) AS cuotas_vencidas,
          COUNT(CASE WHEN dc.estado = 'pagada_parcial' THEN 1 END) AS cuotas_pagadas_parcial,
          COUNT(CASE WHEN dc.estado = 'pagada_total' THEN 1 END) AS cuotas_pagadas_total,
          MIN(CASE WHEN dc.estado IN ('pendiente', 'vencida') THEN dc.fecha_vencimiento END) AS proxima_cuota_fecha,
          MIN(CASE WHEN dc.estado IN ('pendiente', 'vencida') THEN dc.numero_cuota END) AS proxima_cuota_numero,
          MIN(CASE WHEN dc.estado IN ('pendiente', 'vencida') THEN dc.monto_cuota_total END) AS proxima_cuota_monto,
          SUM(CAST(COALESCE(dc.saldo_punitorio, 0) AS DECIMAL(10,2))) AS total_interes_punitorio
        FROM deuda_venta dv
        INNER JOIN detalle_cuotas_venta dc ON dv.iddeuda = dc.iddeuda AND dc.deleted_at IS NULL
        WHERE dv.deleted_at IS NULL
        GROUP BY dv.idcliente
      ) AS cuotas_info ON cliente_deudas.idcliente = cuotas_info.idcliente

      ORDER BY cliente_deudas.saldo ${orderDirection}, cliente_deudas.fecha_primera_deuda ${orderDirection}
      LIMIT ? OFFSET ?
    `;

    db.query(query, params, callback);
  },

  /**
   * Contar clientes con deudas (con filtros de usuario) para paginación mejorada
   */
  countClientsWithInstallments: (search, idusuarios, idfuncionariosIds, callback) => {
    const searchTerm = `%${search}%`;
    const params = [];

    // Construir condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND v.idusuarios = ?';
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND v.idfuncionario IN (?)';
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (v.idusuarios = ? OR v.idfuncionario IN (?))';
    }

    // Orden de parámetros
    if (idusuarios && !idfuncionariosIds) {
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      params.push(idusuarios, idfuncionariosIds);
    }

    params.push(searchTerm, searchTerm, searchTerm);

    const query = `
      SELECT COUNT(DISTINCT dv.idcliente) AS total
      FROM deuda_venta dv
      INNER JOIN ventas v ON dv.idventa = v.idventa
      LEFT JOIN clientes c ON c.idcliente = dv.idcliente
      WHERE dv.deleted_at IS NULL
        ${userCondition}
        AND (c.nombre LIKE ? OR dv.estado LIKE ? OR c.numDocumento LIKE ?)
    `;

    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  /**
   * Contar deudas filtradas de un cliente específico por ID
   * @param {number} idcliente - ID del cliente
   * @param {string} estado - Estado de la deuda ('pendiente', 'pagado', '')
   * @param {number} idusuarios - ID del usuario
   * @param {string} idfuncionariosIds - IDs de funcionarios separados por coma
   * @param {function} callback - Callback
   */
  countFilteredByClienteId: (idcliente, estado, idusuarios, idfuncionariosIds, callback) => {
    const params = [];

    // Construir condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND v.idusuarios = ?';
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND v.idfuncionario IN (?)';
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (v.idusuarios = ? OR v.idfuncionario IN (?))';
    }

    // Construir condición de estado
    let estadoCondicion = '';
    if (estado) {
      estadoCondicion = 'AND dv.estado = ?';
    }

    // Orden de parámetros
    if (idusuarios && !idfuncionariosIds) {
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      params.push(idusuarios, idfuncionariosIds);
    }

    params.push(idcliente);

    if (estado) {
      params.push(estado);
    }

    const query = `
      SELECT COUNT(*) AS total
      FROM deuda_venta dv
      INNER JOIN ventas v ON dv.idventa = v.idventa
      WHERE dv.deleted_at IS NULL
        ${userCondition}
        AND dv.idcliente = ?
        ${estadoCondicion}
    `;

    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  /**
   * Obtener deudas paginadas filtradas de un cliente específico por ID
   * @param {number} idcliente - ID del cliente
   * @param {number} limit - Límite de resultados
   * @param {number} offset - Desplazamiento
   * @param {string} estado - Estado de la deuda ('pendiente', 'pagado', '')
   * @param {number} idusuarios - ID del usuario
   * @param {string} idfuncionariosIds - IDs de funcionarios separados por coma
   * @param {function} callback - Callback
   */
  findAllPaginatedByClienteId: (idcliente, limit, offset, estado, idusuarios, idfuncionariosIds, callback) => {
    const params = [];

    // Construir condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND v.idusuarios = ?';
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND v.idfuncionario IN (?)';
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (v.idusuarios = ? OR v.idfuncionario IN (?))';
    }

    // Construir condición de estado
    let estadoCondicion = '';
    if (estado) {
      estadoCondicion = 'AND dv.estado = ?';
    }

    // Orden de parámetros según el SQL
    if (idusuarios && !idfuncionariosIds) {
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      params.push(idusuarios, idfuncionariosIds);
    }

    params.push(idcliente);

    if (estado) {
      params.push(estado);
    }

    params.push(limit, offset);

    const query = `
      SELECT
        dv.*,
        c.nombre AS nombre_cliente,
        c.apellido,
        c.numDocumento,
        v.fecha AS fecha_venta,
        CASE
          WHEN dv.tiene_cuotas = 'true' THEN (
            SELECT COUNT(*)
            FROM detalle_cuotas_venta dcv
            WHERE dcv.iddeuda = dv.iddeuda
            AND dcv.deleted_at IS NULL
          )
          ELSE 0
        END AS total_cuotas,
        CASE
          WHEN dv.tiene_cuotas = 'true' THEN (
            SELECT COUNT(*)
            FROM detalle_cuotas_venta dcv
            WHERE dcv.iddeuda = dv.iddeuda
            AND dcv.estado IN ('pendiente', 'vencida')
            AND dcv.deleted_at IS NULL
          )
          ELSE 0
        END AS cuotas_pendientes,
        CASE
          WHEN dv.tiene_cuotas = 'true' THEN (
            SELECT MIN(dcv.fecha_vencimiento)
            FROM detalle_cuotas_venta dcv
            WHERE dcv.iddeuda = dv.iddeuda
            AND dcv.estado IN ('pendiente', 'vencida')
            AND dcv.deleted_at IS NULL
          )
          ELSE NULL
        END AS proxima_fecha_vencimiento,
        CASE
          WHEN dv.tiene_cuotas = 'true' THEN (
            SELECT dcv.monto_cuota_total
            FROM detalle_cuotas_venta dcv
            WHERE dcv.iddeuda = dv.iddeuda
            AND dcv.estado IN ('pendiente', 'vencida')
            AND dcv.deleted_at IS NULL
            ORDER BY dcv.fecha_vencimiento ASC
            LIMIT 1
          )
          ELSE NULL
        END AS monto_proxima_cuota
      FROM deuda_venta dv
      INNER JOIN ventas v ON dv.idventa = v.idventa
      LEFT JOIN clientes c ON c.idcliente = dv.idcliente
      WHERE dv.deleted_at IS NULL
        ${userCondition}
        AND dv.idcliente = ?
        ${estadoCondicion}
      ORDER BY dv.fecha_deuda DESC
      LIMIT ? OFFSET ?
    `;

    db.query(query, params, callback);
  }

};

export default DeudaVenta;
