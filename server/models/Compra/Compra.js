// ✅ MODELO ACTUALIZADO - models/Compra.js
import db from '../../db.js';

const Compra = {
  create: (data, callback) => {
    const query = `
      INSERT INTO compras (
        idusuarios, idfuncionario, idproveedor, idmovimiento, total,
        fecha, nro_factura, tipo, estado, descuento, observacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.idusuarios,
      data.idfuncionario || null,
      data.idproveedor,
      data.idmovimiento,
      data.total,
      data.fecha,
      data.nro_factura,
      data.tipo,
      data.estado,
      data.descuento,
      data.observacion || null
    ];
    db.query(query, values, callback);
  },

  updateDetalleTransferenciaCompra: (idcompra, iddetalle_transferencia_compra, callback) => {
    const sql = `UPDATE compras SET iddetalle_transferencia_compra = ? WHERE idcompra = ?`;
    db.query(sql, [iddetalle_transferencia_compra, idcompra], callback);
  },

  updateDetalleTarjetaCompra: (idcompra, iddetalle_tarjeta_compra, callback) => {
    const sql = `UPDATE compras SET iddetalle_tarjeta_compra = ? WHERE idcompra = ?`;
    db.query(sql, [iddetalle_tarjeta_compra, idcompra], callback);
  },

  findAll: (callback) => {
    db.query(`
      SELECT * FROM compras 
      WHERE deleted_at IS NULL
      ORDER BY idcompra DESC
    `, callback);
  },

  findAllPaginatedFiltered: (limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
    SELECT 
      compras.*, 
      proveedor.nombre
    FROM compras 
    INNER JOIN proveedor ON compras.idproveedor = proveedor.idproveedor 
    WHERE compras.deleted_at IS NULL 
      AND (proveedor.nombre LIKE ? OR compras.nro_factura LIKE ?)
    ORDER BY compras.idcompra DESC 
    LIMIT ? OFFSET ?
  `;
    db.query(query, [searchTerm, searchTerm, limit, offset], callback);
  },

  findAllPaginatedFilteredByCajero: (limit, offset, search, idusuarios, idfuncionariosIds, filtros = {}, callback) => {
    const searchTerm = `%${search}%`;

    // Construir condición dinámica basada en qué ID está presente
    let userCondition = '';
    const params = [];

    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND compras.idusuarios = ?';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND compras.idfuncionario IN (?)';
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (compras.idusuarios = ? OR compras.idfuncionario IN (?))';
      params.push(idusuarios, idfuncionariosIds);
    }

    // Filtro por tipo de compra (inventario_inicial, normal, todas)
    let tipoCompraCondition = '';
    if (filtros.tipoCompra === 'inventario_inicial') {
      tipoCompraCondition = "AND compras.observacion = 'Inventario inicial'";
    } else if (filtros.tipoCompra === 'normal') {
      tipoCompraCondition = "AND (compras.observacion IS NULL OR compras.observacion != 'Inventario inicial')";
    }

    // Filtro por rango de fechas
    let fechaCondition = '';
    if (filtros.fecha_inicio && filtros.fecha_fin) {
      fechaCondition = 'AND DATE(compras.fecha) BETWEEN ? AND ?';
      params.push(filtros.fecha_inicio, filtros.fecha_fin);
    }

    const query = `
    SELECT
      compras.*,
      proveedor.nombre,
      COALESCE(u.login, f.login) AS cajero_nombre
    FROM compras
    INNER JOIN proveedor ON compras.idproveedor = proveedor.idproveedor
    LEFT JOIN usuarios u ON compras.idusuarios = u.idusuarios
    LEFT JOIN funcionarios f ON compras.idfuncionario = f.idfuncionario
    WHERE compras.deleted_at IS NULL
      ${userCondition}
      ${tipoCompraCondition}
      ${fechaCondition}
      AND (proveedor.nombre LIKE ? OR compras.nro_factura LIKE ?)
    ORDER BY compras.fecha DESC
    LIMIT ? OFFSET ?
  `;

    params.push(searchTerm, searchTerm, limit, offset);
    db.query(query, params, callback);
  },

  getComprasPorMes: (year, callback) => {
  const query = `
    SELECT
      MONTH(fecha) AS mes,
      SUM(total) AS total,
      SUM(descuento) AS total_descuentos,
      COUNT(*) AS cantidad_compras
    FROM compras
    WHERE YEAR(fecha) = ? AND deleted_at IS NULL
    GROUP BY mes
    ORDER BY mes
  `;
  db.query(query, [year], callback);
},

  countFilteredByCajero: (search, idusuarios, idfuncionariosIds, filtros = {}, callback) => {
    const searchTerm = `%${search}%`;

    // Construir condición dinámica basada en qué ID está presente
    let userCondition = '';
    const params = [];

    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND compras.idusuarios = ?';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND compras.idfuncionario IN (?)';
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (compras.idusuarios = ? OR compras.idfuncionario IN (?))';
      params.push(idusuarios, idfuncionariosIds);
    }

    // Filtro por tipo de compra (inventario_inicial, normal, todas)
    let tipoCompraCondition = '';
    if (filtros.tipoCompra === 'inventario_inicial') {
      tipoCompraCondition = "AND compras.observacion = 'Inventario inicial'";
    } else if (filtros.tipoCompra === 'normal') {
      tipoCompraCondition = "AND (compras.observacion IS NULL OR compras.observacion != 'Inventario inicial')";
    }

    // Filtro por rango de fechas
    let fechaCondition = '';
    if (filtros.fecha_inicio && filtros.fecha_fin) {
      fechaCondition = 'AND DATE(compras.fecha) BETWEEN ? AND ?';
      params.push(filtros.fecha_inicio, filtros.fecha_fin);
    }

    const query = `
    SELECT COUNT(*) AS total
    FROM compras
    INNER JOIN proveedor ON compras.idproveedor = proveedor.idproveedor
    WHERE compras.deleted_at IS NULL
      ${userCondition}
      ${tipoCompraCondition}
      ${fechaCondition}
      AND (proveedor.nombre LIKE ? OR compras.nro_factura LIKE ?)
  `;

    params.push(searchTerm, searchTerm);
    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  countFiltered: (search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
    SELECT COUNT(*) AS total 
    FROM compras 
    INNER JOIN proveedor ON compras.idproveedor = proveedor.idproveedor 
    WHERE compras.deleted_at IS NULL 
      AND (proveedor.nombre LIKE ? OR compras.nro_factura LIKE ?)
  `;
    db.query(query, [searchTerm, searchTerm], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  getResumenComprasDelDia: (callback) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const format = (d) => d.toISOString().slice(0, 10);

    const hoy = format(today);
    const ayer = format(yesterday);

    const query = `
    SELECT
      SUM(CASE WHEN DATE(fecha) = ? THEN total ELSE 0 END) AS totalHoy,
      SUM(CASE WHEN DATE(fecha) = ? THEN total ELSE 0 END) AS totalAyer
    FROM compras
    WHERE deleted_at IS NULL
  `;

    db.query(query, [hoy, ayer], callback);
  },

  findById: (id, callback) => {
    db.query(`SELECT * FROM compras WHERE idcompra = ? AND deleted_at IS NULL`, [id], callback);
  },

  ejecutarAnulacionCompleta: (idcompra, callback) => {
    const query = `CALL anular_compra_credito(?)`;
    db.query(query, [idcompra], callback);
  },

  softDelete: (id, callback) => {
    const query = `
      UPDATE compras
      SET deleted_at = NOW(), estado = 'anulado', updated_at = NOW()
      WHERE idcompra = ?
    `;
    db.query(query, [id], callback);
  },

  // Obtener todas las compras con estadísticas para el reporte
  findAllForReportWithStats: (userId, search, fechaInicio, fechaFin, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT
        c.*,
        p.nombre as proveedor_nombre,
        p.ruc as proveedor_ruc,
        u.login as cajero_nombre,
        COUNT(DISTINCT dc.iddetalle) as total_productos,
        COALESCE(SUM(dc.cantidad), 0) as cantidad_total_productos,
        COALESCE(c.descuento, 0) as descuento_aplicado
      FROM compras c
      INNER JOIN proveedor p ON c.idproveedor = p.idproveedor
      LEFT JOIN usuarios u ON c.idusuarios = u.idusuarios
      LEFT JOIN detalle_compra dc ON c.idcompra = dc.idcompra AND dc.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
        AND c.idusuarios = ?
        AND c.fecha BETWEEN ? AND ?
        AND (
          p.nombre LIKE ?
          OR c.nro_factura LIKE ?
          OR u.login LIKE ?
        )
      GROUP BY c.idcompra
      ORDER BY c.fecha DESC, c.idcompra DESC
    `;
    db.query(query, [userId, fechaInicio, fechaFin, searchTerm, searchTerm, searchTerm], callback);
  },

  // ========== MÉTODOS V2 CON FILTRO POR USUARIO PARA ESTADÍSTICAS ==========

  getResumenComprasDelDiaByUser: (idusuarios, idfuncionariosIds, callback) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const format = (d) => d.toISOString().slice(0, 10);

    const hoy = format(today);
    const ayer = format(yesterday);

    // Construir condición dinámica basada en qué ID está presente
    let userCondition = '';
    const params = [hoy, ayer];

    if (idusuarios && !idfuncionariosIds) {
      // Solo administrador (sin funcionarios relacionados)
      userCondition = 'AND c.idusuarios = ?';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      // Solo funcionario
      userCondition = 'AND c.idfuncionario IN (?)';
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      // Administrador con funcionarios relacionados
      userCondition = 'AND (c.idusuarios = ? OR c.idfuncionario IN (?))';
      params.push(idusuarios, idfuncionariosIds);
    }

    const query = `
      SELECT
        SUM(CASE WHEN DATE(c.fecha) = ? THEN c.total ELSE 0 END) AS totalHoy,
        SUM(CASE WHEN DATE(c.fecha) = ? THEN c.total ELSE 0 END) AS totalAyer
      FROM compras c
      WHERE c.deleted_at IS NULL
        ${userCondition}
    `;

    db.query(query, params, callback);
  },

  getComprasPorMesByUser: (year, idusuarios, idfuncionariosIds, callback) => {
    // Construir condición dinámica basada en qué ID está presente
    let userCondition = '';
    const params = [year];

    if (idusuarios && !idfuncionariosIds) {
      // Solo administrador (sin funcionarios relacionados)
      userCondition = 'AND c.idusuarios = ?';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      // Solo funcionario
      userCondition = 'AND c.idfuncionario IN (?)';
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      // Administrador con funcionarios relacionados
      userCondition = 'AND (c.idusuarios = ? OR c.idfuncionario IN (?))';
      params.push(idusuarios, idfuncionariosIds);
    }

    const query = `
      SELECT
        MONTH(c.fecha) AS mes,
        SUM(c.total) AS total,
        SUM(c.descuento) AS total_descuentos,
        COUNT(*) AS cantidad_compras
      FROM compras c
      WHERE YEAR(c.fecha) = ? AND c.deleted_at IS NULL
        ${userCondition}
      GROUP BY mes
      ORDER BY mes
    `;
    db.query(query, params, callback);
  }

};

export default Compra;
