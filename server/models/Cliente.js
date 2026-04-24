import db from '../db.js';

const Cliente = {
  // Buscar todos los clientes (sin paginado, si necesitas)
  findAll: (callback) => {
    db.query('SELECT * FROM clientes WHERE deleted_at IS NULL', callback);
  },

  // Buscar clientes con paginado y búsqueda
  findAllPaginatedFiltered: (limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT * FROM clientes
      WHERE deleted_at IS NULL AND (
        nombre LIKE ?
        OR apellido LIKE ?
        OR numDocumento LIKE ?
        OR telefono LIKE ?
      )
      ORDER BY idcliente DESC
      LIMIT ? OFFSET ?
    `;
    db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm, limit, offset], callback);
  },

  // Contar total de registros filtrados
  countFiltered: (search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT COUNT(*) AS total FROM clientes
      WHERE deleted_at IS NULL AND (
        nombre LIKE ?
        OR apellido LIKE ?
        OR numDocumento LIKE ?
        OR telefono LIKE ?
      )
    `;
    db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  // Obtener clientes paginados y filtrados por usuario
  findAllPaginatedFilteredByUser: (userId, limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
    SELECT * FROM clientes
    WHERE deleted_at IS NULL
    AND (idusuario = ? OR idfuncionario = ?)
    AND (
      nombre LIKE ?
      OR apellido LIKE ?
      OR numDocumento LIKE ?
      OR telefono LIKE ?
    )
    ORDER BY idcliente DESC
    LIMIT ? OFFSET ?
  `;
    db.query(query, [userId, userId, searchTerm, searchTerm, searchTerm, searchTerm, limit, offset], callback);
  },

  // Contar clientes filtrados por usuario
  countFilteredByUser: (userId, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
    SELECT COUNT(*) AS total FROM clientes
    WHERE deleted_at IS NULL
    AND (idusuario = ? OR idfuncionario = ?)
    AND (
      nombre LIKE ?
      OR apellido LIKE ?
      OR numDocumento LIKE ?
      OR telefono LIKE ?
    )
  `;
    db.query(query, [userId, userId, searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  // ========== MÉTODOS V2 CON FILTRO DE FUNCIONARIOS RELACIONADOS ==========

  // Obtener clientes paginados y filtrados por usuario y funcionarios relacionados
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
      SELECT * FROM clientes
      WHERE deleted_at IS NULL
      AND (
        nombre LIKE ?
        OR apellido LIKE ?
        OR numDocumento LIKE ?
        OR telefono LIKE ?
      )
      ${userCondition}
      ORDER BY idcliente DESC
      LIMIT ? OFFSET ?
    `;
    db.query(query, params, callback);
  },

  // Contar clientes filtrados por usuario y funcionarios relacionados
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
      SELECT COUNT(*) AS total FROM clientes
      WHERE deleted_at IS NULL
      AND (
        nombre LIKE ?
        OR apellido LIKE ?
        OR numDocumento LIKE ?
        OR telefono LIKE ?
      )
      ${userCondition}
    `;
    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },


  // Buscar cliente por ID
  findById: (id, callback) => {
    db.query('SELECT * FROM clientes WHERE idcliente = ? AND deleted_at IS NULL', [id], callback);
  },

  // Buscar el cliente universal de un usuario por su documento sistemático
  findUniversalByUser: (ownerId, callback) => {
    const numDocumento = `UNIVERSAL-${ownerId}`;
    const query = `
      SELECT * FROM clientes
      WHERE deleted_at IS NULL
        AND idusuario = ?
        AND numDocumento = ?
      LIMIT 1
    `;
    db.query(query, [ownerId, numDocumento], callback);
  },

  // Buscar el cliente universal aunque esté soft-deleted
  findUniversalByUserIncludingDeleted: (ownerId, callback) => {
    const numDocumento = `UNIVERSAL-${ownerId}`;
    const query = `
      SELECT * FROM clientes
      WHERE idusuario = ?
        AND numDocumento = ?
      LIMIT 1
    `;
    db.query(query, [ownerId, numDocumento], callback);
  },

  // Restaurar un cliente soft-deleted
  restore: (idcliente, callback) => {
    const query = `
      UPDATE clientes
      SET deleted_at = NULL,
          estado = 'activo',
          updated_at = NOW()
      WHERE idcliente = ?
    `;
    db.query(query, [idcliente], callback);
  },

  // Crear cliente
  create: (data, callback) => {
    const query = `
    INSERT INTO clientes (
      nombre, apellido, tipo, numDocumento, telefono, direccion,
      genero, estado, descripcion, tipo_cliente, tipo_documento, idusuario, idfuncionario, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;
    const values = [
      data.nombre,
      data.apellido,
      data.tipo,
      data.numDocumento,
      data.telefono,
      data.direccion,
      data.genero,
      data.estado || 'activo',
      data.descripcion,
      data.tipo_cliente || 'minorista',
      data.tipo_documento || null,
      data.idusuario,
      data.idfuncionario || null
    ];
    db.query(query, values, callback);
  },

  // Actualizar cliente
  update: (id, data, callback) => {
    const query = `
      UPDATE clientes SET
        nombre = ?, apellido = ?, tipo = ?, numDocumento = ?, telefono = ?, direccion = ?, genero = ?, estado = ?, descripcion = ?, tipo_cliente = ?, tipo_documento = ?, updated_at = NOW()
      WHERE idcliente = ?
    `;
    const values = [
      data.nombre,
      data.apellido,
      data.tipo,
      data.numDocumento,
      data.telefono,
      data.direccion,
      data.genero,
      data.estado,
      data.descripcion,
      data.tipo_cliente,
      data.tipo_documento,
      id
    ];
    db.query(query, values, callback);
  },

  // Eliminar cliente (soft delete)
  delete: (id, callback) => {
    const query = `UPDATE clientes SET deleted_at = NOW(), estado = 'inactivo', updated_at = NOW() WHERE idcliente = ?`;
    db.query(query, [id], callback);
  },

  // Obtener todos los clientes de un usuario para el reporte (sin paginación)
  findAllByUserForReport: (userId, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT * FROM clientes
      WHERE (idusuario = ? OR idfuncionario = ?)
      AND (
        nombre LIKE ?
        OR apellido LIKE ?
        OR numDocumento LIKE ?
        OR telefono LIKE ?
      )
      ORDER BY idcliente DESC
    `;
    db.query(query, [userId, userId, searchTerm, searchTerm, searchTerm, searchTerm], callback);
  },

  // Obtener todos los clientes con estadísticas de ventas para el reporte
  findAllByUserForReportWithSales: (userId, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT
        c.*,
        COUNT(DISTINCT v.idventa) as total_compras,
        COALESCE(SUM(v.total), 0) as monto_total_comprado,
        MAX(v.fecha) as ultima_compra,
        MAX(v.created_at) as fecha_ultima_compra
      FROM clientes c
      LEFT JOIN ventas v ON c.idcliente = v.idcliente AND v.deleted_at IS NULL
      WHERE (c.idusuario = ? OR c.idfuncionario = ?)
      AND (
        c.nombre LIKE ?
        OR c.apellido LIKE ?
        OR c.numDocumento LIKE ?
        OR c.telefono LIKE ?
      )
      GROUP BY c.idcliente
      ORDER BY c.idcliente DESC
    `;
    db.query(query, [userId, userId, searchTerm, searchTerm, searchTerm, searchTerm], callback);
  }
};

export default Cliente;
