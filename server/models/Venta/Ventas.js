// src/models/Venta/Venta.js
import db from '../../db.js';

const Venta = {
  create: (data, callback) => {
    const query = `
      INSERT INTO ventas (
        idusuarios, idfuncionario, idcliente, idformapago, total, fecha, hora, nro_factura, nro_ticket,
        tipo, estado, idmovimiento, total_descuento, tipo_descuento, total_original, saldo, tipo_comprobante,
        iva5, iva10, totaliva, totalletras, estado_pago,
        idfacturador, nombre_fantasia_facturador, ruc_facturador,
        timbrado_nro_facturador, fecha_inicio_vigente_facturador,
        fecha_fin_vigente_facturador,
        nombre_cliente, documento_cliente,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const values = [
      data.idusuarios || null,
      data.idfuncionario || null,
      data.idcliente,
      data.idformapago,
      data.total,
      data.fecha,
      data.hora || null,
      data.nro_factura,
      data.nro_ticket || null,
      data.tipo,
      data.estado,
      data.idmovimiento,
      data.total_descuento || 0,
      data.tipo_descuento || null,
      data.total_original || data.total,
      data.saldo || 0,
      data.tipo_comprobante,
      data.iva5 || 0,
      data.iva10 || 0,
      data.totaliva || 0,
      data.totalletras || '',
      data.estado_pago || null,

      // Facturador
      data.idfacturador,
      data.nombre_fantasia_facturador,
      data.ruc_facturador,
      data.timbrado_nro_facturador,
      data.fecha_inicio_vigente_facturador,
      data.fecha_fin_vigente_facturador,

      // ✅ NUEVOS CAMPOS
      data.nombre_cliente || null,
      data.documento_cliente || null,
    ];

    db.query(query, values, callback);
  },

  updateDatoTransferencia: (idventa, iddato_transferencia_venta, callback) => {
    const sql = `UPDATE ventas SET iddato_transferencia_venta = ? WHERE idventa = ?`;
    db.query(sql, [iddato_transferencia_venta, idventa], callback);
  },

  updateDetalleCheque: (idventa, iddetalle_cheque_venta, callback) => {
    const sql = `UPDATE ventas SET iddetalle_cheque_venta = ? WHERE idventa = ?`;
    db.query(sql, [iddetalle_cheque_venta, idventa], callback);
  },

  updateDetalleTarjeta: (idventa, iddetalle_tarjeta_venta, callback) => {
    const sql = `UPDATE ventas SET iddetalle_tarjeta_venta = ? WHERE idventa = ?`;
    db.query(sql, [iddetalle_tarjeta_venta, idventa], callback);
  },

  findAll: (callback) => {
    const query = `
      SELECT *, 
        CASE 
          WHEN total_descuento > 0 THEN 'Con descuento'
          ELSE 'Sin descuento'
        END as estado_descuento
      FROM ventas 
      WHERE deleted_at IS NULL 
      ORDER BY idventa DESC
    `;
    db.query(query, callback);
  },

  findById: (id, callback) => {
    db.query('SELECT * FROM ventas WHERE idventa = ? AND deleted_at IS NULL', [id], callback);
  },

  softDelete: (id, callback) => {
    const query = `
      UPDATE ventas 
      SET deleted_at = NOW(), estado = 'anulado', updated_at = NOW() 
      WHERE idventa = ?
    `;
    db.query(query, [id], callback);
  },

  ejecutarAnulacionCompleta: (idventa, callback) => {
    const query = `CALL anularVentaCredito(?)`;
    db.query(query, [idventa], callback);
  },

  getLastTicket: (callback) => {
    const query = 'SELECT MAX(nro_ticket) AS ultimo_ticket FROM ventas WHERE deleted_at IS NULL';
    db.query(query, (err, results) => {
      if (err) return callback(err);
      const ultimoTicket = results[0].ultimo_ticket || 0;
      callback(null, ultimoTicket);
    });
  },

  findUltimaVenta: (callback) => {
    const query = `SELECT * FROM ventas ORDER BY idventa DESC LIMIT 1`;
    db.query(query, callback);
  },

  findAllPaginatedFiltered: (limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
    SELECT 
      v.*, 
      COALESCE(v.nombre_cliente, CONCAT(c.nombre, ' ', c.apellido)) AS nombre_cliente,
      COALESCE(v.documento_cliente, c.numDocumento) AS documento_cliente,
      CASE 
        WHEN v.total_descuento > 0 THEN 'Con descuento'
        ELSE 'Sin descuento'
      END as estado_descuento
    FROM ventas v
    LEFT JOIN clientes c ON v.idcliente = c.idcliente
    WHERE v.deleted_at IS NULL
      AND (
        COALESCE(v.nombre_cliente, c.nombre) LIKE ? OR
        COALESCE(v.documento_cliente, c.numDocumento) LIKE ? OR
        v.nro_factura LIKE ? OR
        v.fecha LIKE ?
      )
    ORDER BY v.idventa DESC
    LIMIT ? OFFSET ?
  `;
    db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm, limit, offset], callback);
  },

  findAllPaginatedFilteredByCajero: (limit, offset, search, idusuarios, idfuncionariosIds, fecha_inicio, fecha_fin, callback) => {
    const searchTerm = `%${search}%`;

    let userCondition = '';
    const params = [];

    let funcionariosArray = [];
    if (idfuncionariosIds && idfuncionariosIds !== '') {
      funcionariosArray = typeof idfuncionariosIds === 'string'
        ? idfuncionariosIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        : [idfuncionariosIds];
    }

    if (idusuarios && funcionariosArray.length === 0) {
      userCondition = 'AND v.idusuarios = ?';
      params.push(idusuarios);
    } else if (funcionariosArray.length > 0 && !idusuarios) {
      const placeholders = funcionariosArray.map(() => '?').join(',');
      userCondition = `AND v.idfuncionario IN (${placeholders})`;
      params.push(...funcionariosArray);
    } else if (idusuarios && funcionariosArray.length > 0) {
      const placeholders = funcionariosArray.map(() => '?').join(',');
      userCondition = `AND (v.idusuarios = ? OR v.idfuncionario IN (${placeholders}))`;
      params.push(idusuarios, ...funcionariosArray);
    }

    let fechaCondition = '';
    if (fecha_inicio && fecha_fin) {
      fechaCondition = 'AND DATE(v.fecha) BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    } else if (fecha_inicio) {
      fechaCondition = 'AND DATE(v.fecha) >= ?';
      params.push(fecha_inicio);
    } else if (fecha_fin) {
      fechaCondition = 'AND DATE(v.fecha) <= ?';
      params.push(fecha_fin);
    }

    const query = `
      SELECT
        v.*,
        COALESCE(v.nombre_cliente, CONCAT(c.nombre, ' ', c.apellido)) AS nombre_cliente,
        COALESCE(v.documento_cliente, c.numDocumento) AS documento_cliente,
        COALESCE(u.login, f.login) AS cajero_nombre,
        CASE
          WHEN v.total_descuento > 0 THEN 'Con descuento'
          ELSE 'Sin descuento'
        END as estado_descuento
      FROM ventas v
      LEFT JOIN clientes c ON v.idcliente = c.idcliente
      LEFT JOIN usuarios u ON v.idusuarios = u.idusuarios
      LEFT JOIN funcionarios f ON v.idfuncionario = f.idfuncionario
      WHERE v.deleted_at IS NULL
        ${userCondition}
        ${fechaCondition}
        AND (
          COALESCE(v.nombre_cliente, c.nombre) LIKE ? OR
          COALESCE(v.documento_cliente, c.numDocumento) LIKE ? OR
          v.nro_factura LIKE ? OR
          v.fecha LIKE ?
        )
      ORDER BY v.idventa DESC
      LIMIT ? OFFSET ?
    `;

    params.push(searchTerm, searchTerm, searchTerm, searchTerm, limit, offset);
    db.query(query, params, callback);
  },

  countFilteredByCajero: (search, idusuarios, idfuncionariosIds, fecha_inicio, fecha_fin, callback) => {
    const searchTerm = `%${search}%`;

    let userCondition = '';
    const params = [];

    let funcionariosArray = [];
    if (idfuncionariosIds && idfuncionariosIds !== '') {
      funcionariosArray = typeof idfuncionariosIds === 'string'
        ? idfuncionariosIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        : [idfuncionariosIds];
    }

    if (idusuarios && funcionariosArray.length === 0) {
      userCondition = 'AND v.idusuarios = ?';
      params.push(idusuarios);
    } else if (funcionariosArray.length > 0 && !idusuarios) {
      const placeholders = funcionariosArray.map(() => '?').join(',');
      userCondition = `AND v.idfuncionario IN (${placeholders})`;
      params.push(...funcionariosArray);
    } else if (idusuarios && funcionariosArray.length > 0) {
      const placeholders = funcionariosArray.map(() => '?').join(',');
      userCondition = `AND (v.idusuarios = ? OR v.idfuncionario IN (${placeholders}))`;
      params.push(idusuarios, ...funcionariosArray);
    }

    let fechaCondition = '';
    if (fecha_inicio && fecha_fin) {
      fechaCondition = 'AND DATE(v.fecha) BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    } else if (fecha_inicio) {
      fechaCondition = 'AND DATE(v.fecha) >= ?';
      params.push(fecha_inicio);
    } else if (fecha_fin) {
      fechaCondition = 'AND DATE(v.fecha) <= ?';
      params.push(fecha_fin);
    }

    const query = `
      SELECT COUNT(*) AS total
      FROM ventas v
      LEFT JOIN clientes c ON v.idcliente = c.idcliente
      WHERE v.deleted_at IS NULL
        ${userCondition}
        ${fechaCondition}
        AND (
          COALESCE(v.nombre_cliente, c.nombre) LIKE ? OR
          COALESCE(v.documento_cliente, c.numDocumento) LIKE ? OR
          v.nro_factura LIKE ? OR
          v.fecha LIKE ?
        )
    `;

    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  getTotalesIVA: (idventa, callback) => {
    const sql = `SELECT iva5, iva10, totaliva FROM ventas WHERE idventa = ?`;
    db.query(sql, [idventa], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },

  getResumenVentasDelDia: (callback) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const format = (d) => d.toISOString().slice(0, 10);

    const hoy = format(today);
    const ayer = format(yesterday);

    const query = `
    SELECT
      SUM(CASE WHEN DATE(fecha) = ? THEN total ELSE 0 END) AS totalHoy,
      SUM(CASE WHEN DATE(fecha) = ? THEN total ELSE 0 END) AS totalAyer,
      SUM(CASE WHEN DATE(fecha) = ? THEN total_descuento ELSE 0 END) AS descuentosHoy,
      SUM(CASE WHEN DATE(fecha) = ? THEN total_descuento ELSE 0 END) AS descuentosAyer
    FROM ventas
    WHERE deleted_at IS NULL
  `;

    db.query(query, [hoy, ayer, hoy, ayer], callback);
  },

  getVentasPorMes: (year, callback) => {
    const query = `
    SELECT 
      MONTH(fecha) AS mes,
      SUM(total) AS total,
      SUM(total_descuento) AS total_descuentos,
      SUM(total_original) AS total_sin_descuentos
    FROM ventas
    WHERE YEAR(fecha) = ? AND deleted_at IS NULL
    GROUP BY mes
    ORDER BY mes
  `;
    db.query(query, [year], callback);
  },

  getProgresoMetaMensual: (year, month, callback) => {
    const query = `
    SELECT
      SUM(CASE WHEN DATE(fecha) = CURDATE() THEN total ELSE 0 END) AS hoy,
      SUM(CASE WHEN YEAR(fecha) = ? AND MONTH(fecha) = ? THEN total ELSE 0 END) AS acumulado,
      SUM(CASE WHEN YEAR(fecha) = ? AND MONTH(fecha) = ? THEN total_descuento ELSE 0 END) AS descuentos_mes
    FROM ventas
    WHERE deleted_at IS NULL
  `;
    db.query(query, [year, month, year, month], callback);
  },

  getEstadisticasAnuales: (year, callback) => {
    const query = `
    SELECT 
      MONTH(v.fecha) AS mes,
      SUM(v.total) AS total_ventas,
      SUM(v.total_descuento) AS total_descuentos,
      SUM(dv.ganancia) AS total_ganancias
    FROM ventas v
    JOIN detalle_venta dv ON dv.idventa = v.idventa
    WHERE YEAR(v.fecha) = ? AND v.deleted_at IS NULL AND dv.deleted_at IS NULL
    GROUP BY mes
    ORDER BY mes
  `;
    db.query(query, [year], callback);
  },

  getGananciasPorPeriodo: (tipo, fecha_inicio, fecha_fin, limit, callback) => {
    let groupBy, dateFormat;

    switch (tipo) {
      case 'dia':
        groupBy = 'DATE(v.fecha)';
        dateFormat = 'DATE(v.fecha) as fecha';
        break;
      case 'mes':
        groupBy = 'DATE_FORMAT(v.fecha, "%Y-%m")';
        dateFormat = 'DATE_FORMAT(v.fecha, "%Y-%m") as periodo';
        break;
      case 'año':
        groupBy = 'YEAR(v.fecha)';
        dateFormat = 'YEAR(v.fecha) as periodo';
        break;
      default:
        return callback('Tipo no válido');
    }

    let query = `
    SELECT 
      ${dateFormat},
      COUNT(*) as total_ventas,
      SUM(v.total_ganancia) as ganancia_total,
      AVG(v.total_ganancia) as ganancia_promedio,
      SUM(v.total) as ventas_total,
      SUM(v.totaliva) as iva_total
    FROM ventas v
    WHERE v.deleted_at IS NULL
      AND v.estado = 'activo'
  `;

    const params = [];

    if (fecha_inicio) {
      query += ' AND v.fecha >= ?';
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ' AND v.fecha <= ?';
      params.push(fecha_fin);
    }

    query += ` GROUP BY ${groupBy}`;
    query += ` ORDER BY ${tipo === 'dia' ? 'fecha' : 'periodo'} DESC`;

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    db.query(query, params, (err, results) => {
      if (err) return callback(err);

      const formattedResults = results.map(row => ({
        periodo: row.fecha || row.periodo,
        total_ventas: parseInt(row.total_ventas),
        ganancia_total: parseFloat(row.ganancia_total) || 0,
        ganancia_promedio: parseFloat(row.ganancia_promedio) || 0,
        ventas_total: parseFloat(row.ventas_total) || 0,
        iva_total: parseFloat(row.iva_total) || 0
      }));

      callback(null, formattedResults);
    });
  },

  countFiltered: (search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
    SELECT COUNT(*) AS total
    FROM ventas v
    LEFT JOIN clientes c ON v.idcliente = c.idcliente
    WHERE v.deleted_at IS NULL
      AND (
        COALESCE(v.nombre_cliente, c.nombre) LIKE ? OR
        COALESCE(v.documento_cliente, c.numDocumento) LIKE ? OR
        v.nro_factura LIKE ? OR
        v.fecha LIKE ?
      )
  `;
    db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  // Obtener todas las ventas con estadísticas para el reporte
  findAllForReportWithStats: (userId, search, fechaInicio, fechaFin, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT
        v.*,
        COALESCE(v.nombre_cliente, CONCAT(c.nombre, ' ', c.apellido)) as cliente_nombre,
        COALESCE(v.documento_cliente, c.numDocumento) as cliente_documento,
        u.login as cajero_nombre,
        COUNT(DISTINCT dv.iddetalle) as total_productos,
        COALESCE(SUM(dv.cantidad), 0) as cantidad_total_productos,
        COALESCE(v.total_descuento, 0) as descuento_aplicado,
        COALESCE(SUM(dv.ganancia), 0) as ganancia_total
      FROM ventas v
      LEFT JOIN clientes c ON v.idcliente = c.idcliente
      LEFT JOIN usuarios u ON v.idusuarios = u.idusuarios
      LEFT JOIN detalle_venta dv ON v.idventa = dv.idventa AND dv.deleted_at IS NULL
      WHERE v.deleted_at IS NULL
        AND v.idusuarios = ?
        AND v.fecha BETWEEN ? AND ?
        AND (
          COALESCE(v.nombre_cliente, c.nombre) LIKE ?
          OR COALESCE(v.documento_cliente, c.numDocumento) LIKE ?
          OR v.nro_factura LIKE ?
          OR u.login LIKE ?
        )
      GROUP BY v.idventa
      ORDER BY v.fecha DESC, v.idventa DESC
    `;
    db.query(query, [userId, fechaInicio, fechaFin, searchTerm, searchTerm, searchTerm, searchTerm], callback);
  },

  // ========== MÉTODOS V2 CON FILTRO POR USUARIO PARA ESTADÍSTICAS ==========

  getResumenVentasDelDiaByUser: (idusuarios, idfuncionariosIds, callback) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const format = (d) => d.toISOString().slice(0, 10);

    const hoy = format(today);
    const ayer = format(yesterday);

    // Construir condición dinámica basada en qué ID está presente
    let userCondition = '';
    const params = [hoy, ayer, hoy, ayer];

    // Convertir string de IDs a array si es necesario
    let funcionariosArray = [];
    if (idfuncionariosIds) {
      funcionariosArray = typeof idfuncionariosIds === 'string'
        ? idfuncionariosIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        : [idfuncionariosIds];
    }

    if (idusuarios && funcionariosArray.length === 0) {
      // Solo administrador (sin funcionarios relacionados)
      userCondition = 'AND v.idusuarios = ?';
      params.push(idusuarios);
    } else if (funcionariosArray.length > 0 && !idusuarios) {
      // Solo funcionario
      const placeholders = funcionariosArray.map(() => '?').join(',');
      userCondition = `AND v.idfuncionario IN (${placeholders})`;
      params.push(...funcionariosArray);
    } else if (idusuarios && funcionariosArray.length > 0) {
      // Administrador con funcionarios relacionados
      const placeholders = funcionariosArray.map(() => '?').join(',');
      userCondition = `AND (v.idusuarios = ? OR v.idfuncionario IN (${placeholders}))`;
      params.push(idusuarios, ...funcionariosArray);
    }

    const query = `
      SELECT
        SUM(CASE WHEN DATE(v.fecha) = ? THEN v.total ELSE 0 END) AS totalHoy,
        SUM(CASE WHEN DATE(v.fecha) = ? THEN v.total ELSE 0 END) AS totalAyer,
        SUM(CASE WHEN DATE(v.fecha) = ? THEN v.total_descuento ELSE 0 END) AS descuentosHoy,
        SUM(CASE WHEN DATE(v.fecha) = ? THEN v.total_descuento ELSE 0 END) AS descuentosAyer
      FROM ventas v
      WHERE v.deleted_at IS NULL
        ${userCondition}
    `;

    db.query(query, params, callback);
  },

  getVentasPorMesByUser: (year, idusuarios, idfuncionariosIds, callback) => {
    // Construir condición dinámica basada en qué ID está presente
    let userCondition = '';
    const params = [year];

    // Convertir string de IDs a array si es necesario
    let funcionariosArray = [];
    if (idfuncionariosIds) {
      funcionariosArray = typeof idfuncionariosIds === 'string'
        ? idfuncionariosIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        : [idfuncionariosIds];
    }

    if (idusuarios && funcionariosArray.length === 0) {
      // Solo administrador (sin funcionarios relacionados)
      userCondition = 'AND v.idusuarios = ?';
      params.push(idusuarios);
    } else if (funcionariosArray.length > 0 && !idusuarios) {
      // Solo funcionario
      const placeholders = funcionariosArray.map(() => '?').join(',');
      userCondition = `AND v.idfuncionario IN (${placeholders})`;
      params.push(...funcionariosArray);
    } else if (idusuarios && funcionariosArray.length > 0) {
      // Administrador con funcionarios relacionados
      const placeholders = funcionariosArray.map(() => '?').join(',');
      userCondition = `AND (v.idusuarios = ? OR v.idfuncionario IN (${placeholders}))`;
      params.push(idusuarios, ...funcionariosArray);
    }

    const query = `
      SELECT
        MONTH(v.fecha) AS mes,
        SUM(v.total) AS total,
        SUM(v.total_descuento) AS total_descuentos,
        SUM(v.total_original) AS total_sin_descuentos
      FROM ventas v
      WHERE YEAR(v.fecha) = ? AND v.deleted_at IS NULL
        ${userCondition}
      GROUP BY mes
      ORDER BY mes
    `;
    db.query(query, params, callback);
  },

  getProgresoMetaMensualByUser: (year, month, idusuarios, idfuncionariosIds, callback) => {
    // Construir condición dinámica basada en qué ID está presente
    let userCondition = '';
    const params = [year, month, year, month];

    // Convertir string de IDs a array si es necesario
    let funcionariosArray = [];
    if (idfuncionariosIds) {
      funcionariosArray = typeof idfuncionariosIds === 'string'
        ? idfuncionariosIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        : [idfuncionariosIds];
    }

    if (idusuarios && funcionariosArray.length === 0) {
      // Solo administrador (sin funcionarios relacionados)
      userCondition = 'AND v.idusuarios = ?';
      params.push(idusuarios);
    } else if (funcionariosArray.length > 0 && !idusuarios) {
      // Solo funcionario
      const placeholders = funcionariosArray.map(() => '?').join(',');
      userCondition = `AND v.idfuncionario IN (${placeholders})`;
      params.push(...funcionariosArray);
    } else if (idusuarios && funcionariosArray.length > 0) {
      // Administrador con funcionarios relacionados
      const placeholders = funcionariosArray.map(() => '?').join(',');
      userCondition = `AND (v.idusuarios = ? OR v.idfuncionario IN (${placeholders}))`;
      params.push(idusuarios, ...funcionariosArray);
    }

    const query = `
      SELECT
        SUM(CASE WHEN DATE(v.fecha) = CURDATE() THEN v.total ELSE 0 END) AS hoy,
        SUM(CASE WHEN YEAR(v.fecha) = ? AND MONTH(v.fecha) = ? THEN v.total ELSE 0 END) AS acumulado,
        SUM(CASE WHEN YEAR(v.fecha) = ? AND MONTH(v.fecha) = ? THEN v.total_descuento ELSE 0 END) AS descuentos_mes
      FROM ventas v
      WHERE v.deleted_at IS NULL
        ${userCondition}
    `;
    db.query(query, params, callback);
  },

  getEstadisticasAnualesByUser: (year, idusuarios, idfuncionariosIds, callback) => {
    // Construir condición dinámica basada en qué ID está presente
    let userCondition = '';
    const params = [year];

    // Convertir string de IDs a array si es necesario
    let funcionariosArray = [];
    if (idfuncionariosIds) {
      funcionariosArray = typeof idfuncionariosIds === 'string'
        ? idfuncionariosIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        : [idfuncionariosIds];
    }

    if (idusuarios && funcionariosArray.length === 0) {
      // Solo administrador (sin funcionarios relacionados)
      userCondition = 'AND v.idusuarios = ?';
      params.push(idusuarios);
    } else if (funcionariosArray.length > 0 && !idusuarios) {
      // Solo funcionario
      const placeholders = funcionariosArray.map(() => '?').join(',');
      userCondition = `AND v.idfuncionario IN (${placeholders})`;
      params.push(...funcionariosArray);
    } else if (idusuarios && funcionariosArray.length > 0) {
      // Administrador con funcionarios relacionados
      const placeholders = funcionariosArray.map(() => '?').join(',');
      userCondition = `AND (v.idusuarios = ? OR v.idfuncionario IN (${placeholders}))`;
      params.push(idusuarios, ...funcionariosArray);
    }

    const query = `
      SELECT
        MONTH(v.fecha) AS mes,
        SUM(v.total) AS total_ventas,
        SUM(v.total_descuento) AS total_descuentos,
        SUM(dv.ganancia) AS total_ganancias
      FROM ventas v
      JOIN detalle_venta dv ON dv.idventa = v.idventa
      WHERE YEAR(v.fecha) = ? AND v.deleted_at IS NULL AND dv.deleted_at IS NULL
        ${userCondition}
      GROUP BY mes
      ORDER BY mes
    `;
    db.query(query, params, callback);
  },

  getGananciasPorPeriodoByUser: (tipo, fecha_inicio, fecha_fin, limit, idusuarios, idfuncionariosIds, callback) => {
    let groupBy, dateFormat;

    switch (tipo) {
      case 'dia':
        groupBy = 'DATE(v.fecha)';
        dateFormat = 'DATE(v.fecha) as fecha';
        break;
      case 'mes':
        groupBy = 'DATE_FORMAT(v.fecha, "%Y-%m")';
        dateFormat = 'DATE_FORMAT(v.fecha, "%Y-%m") as periodo';
        break;
      case 'año':
        groupBy = 'YEAR(v.fecha)';
        dateFormat = 'YEAR(v.fecha) as periodo';
        break;
      default:
        return callback('Tipo no válido');
    }

    const params = [];

    // Convertir string de IDs a array si es necesario
    let funcionariosArray = [];
    if (idfuncionariosIds) {
      funcionariosArray = typeof idfuncionariosIds === 'string'
        ? idfuncionariosIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        : [idfuncionariosIds];
    }

    // Construir condición dinámica basada en qué ID está presente
    let userCondition = '';

    if (idusuarios && funcionariosArray.length === 0) {
      // Solo administrador (sin funcionarios relacionados)
      userCondition = 'AND v.idusuarios = ?';
      params.push(idusuarios);
    } else if (funcionariosArray.length > 0 && !idusuarios) {
      // Solo funcionario
      const placeholders = funcionariosArray.map(() => '?').join(',');
      userCondition = `AND v.idfuncionario IN (${placeholders})`;
      params.push(...funcionariosArray);
    } else if (idusuarios && funcionariosArray.length > 0) {
      // Administrador con funcionarios relacionados
      const placeholders = funcionariosArray.map(() => '?').join(',');
      userCondition = `AND (v.idusuarios = ? OR v.idfuncionario IN (${placeholders}))`;
      params.push(idusuarios, ...funcionariosArray);
    }

    let query = `
      SELECT
        ${dateFormat},
        COUNT(*) as total_ventas,
        SUM(v.total_ganancia) as ganancia_total,
        AVG(v.total_ganancia) as ganancia_promedio,
        SUM(v.total) as ventas_total,
        SUM(v.totaliva) as iva_total
      FROM ventas v
      WHERE v.deleted_at IS NULL
        AND v.estado = 'activo'
        ${userCondition}
    `;

    if (fecha_inicio) {
      query += ' AND v.fecha >= ?';
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ' AND v.fecha <= ?';
      params.push(fecha_fin);
    }

    query += ` GROUP BY ${groupBy}`;
    query += ` ORDER BY ${tipo === 'dia' ? 'fecha' : 'periodo'} DESC`;

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    db.query(query, params, (err, results) => {
      if (err) return callback(err);

      const formattedResults = results.map(row => ({
        periodo: row.fecha || row.periodo,
        total_ventas: parseInt(row.total_ventas),
        ganancia_total: parseFloat(row.ganancia_total) || 0,
        ganancia_promedio: parseFloat(row.ganancia_promedio) || 0,
        ventas_total: parseFloat(row.ventas_total) || 0,
        iva_total: parseFloat(row.iva_total) || 0
      }));

      callback(null, formattedResults);
    });
  }

};

export default Venta;