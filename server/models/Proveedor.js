import db from '../db.js';

const Proveedor = {
  findAll: (callback) => {
    db.query('SELECT * FROM proveedor WHERE deleted_at IS NULL', callback);
  },

  findAllPaginatedFiltered: (limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT * FROM proveedor 
     WHERE deleted_at IS NULL AND (
      nombre LIKE ? 
      OR telefono LIKE ? 
      OR ruc LIKE ? 
      OR razon LIKE ?
      )
      ORDER BY idproveedor DESC
      LIMIT ? OFFSET ?
    `;
    db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm, limit, offset], callback);
  },

  countFiltered: (search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT COUNT(*) as total FROM proveedor 
      WHERE deleted_at IS NULL AND (
      nombre LIKE ? 
      OR telefono LIKE ? 
      OR ruc LIKE ? 
      OR razon LIKE ?
      )
    `;
    db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  findAllPaginatedFilteredByUser: (userId, limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
    SELECT * FROM proveedor
    WHERE deleted_at IS NULL
    AND (idusuario = ? OR idfuncionario = ?)
    AND (
      nombre LIKE ?
      OR telefono LIKE ?
      OR ruc LIKE ?
      OR razon LIKE ?
    )
    ORDER BY idproveedor DESC
    LIMIT ? OFFSET ?
  `;
    db.query(query, [userId, userId, searchTerm, searchTerm, searchTerm, searchTerm, limit, offset], callback);
  },

  countFilteredByUser: (userId, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
    SELECT COUNT(*) as total FROM proveedor
    WHERE deleted_at IS NULL
    AND (idusuario = ? OR idfuncionario = ?)
    AND (
      nombre LIKE ?
      OR telefono LIKE ?
      OR ruc LIKE ?
      OR razon LIKE ?
    )
  `;
    db.query(query, [userId, userId, searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  // ========== MÉTODOS V2 CON FILTRO DE FUNCIONARIOS RELACIONADOS ==========

  // Obtener proveedores paginados y filtrados por usuario y funcionarios relacionados
  findAllPaginatedFilteredByUserV2: (idusuarios, idfuncionariosIds, limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const params = [];

    // Primero agregar parámetros de búsqueda
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);

    // Condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND (idusuario = ?)';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND (idfuncionario IN (?))';
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (idusuario = ? OR idfuncionario IN (?))';
      params.push(idusuarios, idfuncionariosIds);
    }

    params.push(limit, offset);

    const query = `
      SELECT * FROM proveedor
      WHERE deleted_at IS NULL
      AND (
        nombre LIKE ?
        OR telefono LIKE ?
        OR ruc LIKE ?
        OR razon LIKE ?
      )
      ${userCondition}
      ORDER BY idproveedor DESC
      LIMIT ? OFFSET ?
    `;
    db.query(query, params, callback);
  },

  // Contar proveedores filtrados por usuario y funcionarios relacionados
  countFilteredByUserV2: (idusuarios, idfuncionariosIds, search, callback) => {
    const searchTerm = `%${search}%`;
    const params = [];

    // Primero agregar parámetros de búsqueda
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);

    // Condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND (idusuario = ?)';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND (idfuncionario IN (?))';
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (idusuario = ? OR idfuncionario IN (?))';
      params.push(idusuarios, idfuncionariosIds);
    }

    const query = `
      SELECT COUNT(*) as total FROM proveedor
      WHERE deleted_at IS NULL
      AND (
        nombre LIKE ?
        OR telefono LIKE ?
        OR ruc LIKE ?
        OR razon LIKE ?
      )
      ${userCondition}
    `;
    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },


  findById: (id, callback) => {
    db.query('SELECT * FROM proveedor WHERE idproveedor = ? AND deleted_at IS NULL', [id], callback);
  },

  create: (data, callback) => {
    const query = `
    INSERT INTO proveedor (
      nombre, telefono, direccion, ruc, razon, estado,
      idusuario, idfuncionario, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;
    const values = [
      data.nombre,
      data.telefono,
      data.direccion,
      data.ruc,
      data.razon,
      data.estado || 'activo',
      data.idusuario,
      data.idfuncionario || null
    ];
    db.query(query, values, callback);
  },

  update: (id, data, callback) => {
    const query = `
      UPDATE proveedor SET
        nombre = ?, telefono = ?, direccion = ?, ruc = ?, razon = ?, estado = ?, updated_at = NOW()
      WHERE idproveedor = ?
    `;
    const values = [
      data.nombre,
      data.telefono,
      data.direccion,
      data.ruc,
      data.razon,
      data.estado,
      id
    ];
    db.query(query, values, callback);
  },

  delete: (id, callback) => {
    const query = `UPDATE proveedor SET deleted_at = NOW(), estado = 'inactivo', updated_at = NOW() WHERE idproveedor = ?`;
    db.query(query, [id], callback);
  },

  // Obtener todos los proveedores de un usuario para el reporte (sin paginación)
  findAllByUserForReport: (userId, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT * FROM proveedor
      WHERE (idusuario = ? OR idfuncionario = ?)
      AND (
        nombre LIKE ?
        OR telefono LIKE ?
        OR ruc LIKE ?
        OR razon LIKE ?
      )
      ORDER BY idproveedor DESC
    `;
    db.query(query, [userId, userId, searchTerm, searchTerm, searchTerm, searchTerm], callback);
  },

  // Obtener todos los proveedores con estadísticas de compras para el reporte
  findAllByUserForReportWithPurchases: (userId, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT
        p.*,
        COUNT(DISTINCT c.idcompra) as total_compras,
        COALESCE(SUM(c.total), 0) as monto_total_comprado,
        MAX(c.fecha) as ultima_compra,
        MAX(c.created_at) as fecha_ultima_compra
      FROM proveedor p
      LEFT JOIN compras c ON p.idproveedor = c.idproveedor AND c.deleted_at IS NULL
      WHERE (p.idusuario = ? OR p.idfuncionario = ?)
      AND (
        p.nombre LIKE ?
        OR p.telefono LIKE ?
        OR p.ruc LIKE ?
        OR p.razon LIKE ?
      )
      GROUP BY p.idproveedor
      ORDER BY p.idproveedor DESC
    `;
    db.query(query, [userId, userId, searchTerm, searchTerm, searchTerm, searchTerm], callback);
  }
};

export default Proveedor;
