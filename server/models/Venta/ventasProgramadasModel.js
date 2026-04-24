// models/ventasProgramadasModel.js
import db from '../../db.js';

const VentasProgramadas = {
  // 1️⃣ Crear una venta programada
  create: (data, callback) => {
    const query = `
     INSERT INTO ventas_programadas (
        idcliente, idproducto, cantidad, fecha_inicio, dia_programado,
        estado, idusuario, idfuncionario, observacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.idcliente,
      data.idproducto,
      data.cantidad,
      data.fecha_inicio,
      data.dia_programado,
      data.estado || 'activa',
      data.idusuario || null,
      data.idfuncionario || null,
      data.observacion || ''
    ];
    db.query(query, values, callback);
  },

  // ========== V2: MÉTODOS CON FILTRADO POR USUARIO ==========

  /**
   * V2: Obtener ventas programadas activas filtradas por usuario
   */
  getActivasByUser: (idusuarios, idfuncionariosIds, callback) => {
    let userCondition = '';
    const params = [];

    if (idusuarios && !idfuncionariosIds) {
      // Solo usuario admin
      userCondition = 'AND vp.idusuario IN (SELECT idusuarios FROM usuarios WHERE idusuarios = ?)';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      // Solo funcionario
      userCondition = 'AND vp.idusuario IN (SELECT idusuarios FROM funcionarios WHERE idfuncionario IN (?))';
      params.push(idfuncionariosIds.split(','));
    } else if (idusuarios && idfuncionariosIds) {
      // Admin viendo datos propios y de sus funcionarios
      userCondition = `AND (
        vp.idusuario IN (SELECT idusuarios FROM usuarios WHERE idusuarios = ?)
        OR vp.idusuario IN (SELECT idusuarios FROM funcionarios WHERE idfuncionario IN (?))
      )`;
      params.push(idusuarios, idfuncionariosIds.split(','));
    }

    const query = `
      SELECT vp.*, u.idusuarios
      FROM ventas_programadas vp
      LEFT JOIN usuarios u ON vp.idusuario = u.idusuarios
      WHERE vp.estado = 'activa'
        AND vp.deleted_at IS NULL
        ${userCondition}
      ORDER BY vp.idprogramacion DESC
    `;

    db.query(query, params, callback);
  },

  /**
   * V2: Obtener ventas programadas paginadas filtradas por usuario
   */
  findAllPaginatedFilteredByUser: (limit, offset, search, idusuarios, idfuncionariosIds, callback) => {
    const searchTerm = `%${search}%`;
    let userCondition = '';
    const params = [searchTerm, searchTerm, searchTerm, searchTerm];

    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND vp.idusuario IN (SELECT idusuarios FROM usuarios WHERE idusuarios = ?)';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND vp.idusuario IN (SELECT idusuarios FROM funcionarios WHERE idfuncionario IN (?))';
      params.push(idfuncionariosIds.split(','));
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = `AND (
        vp.idusuario IN (SELECT idusuarios FROM usuarios WHERE idusuarios = ?)
        OR vp.idusuario IN (SELECT idusuarios FROM funcionarios WHERE idfuncionario IN (?))
      )`;
      params.push(idusuarios, idfuncionariosIds.split(','));
    }

    params.push(limit, offset);

    const query = `
      SELECT
        vp.idprogramacion,
        vp.idcliente,
        vp.idproducto,
        vp.cantidad,
        vp.fecha_inicio,
        vp.dia_programado,
        vp.estado,
        vp.observacion,
        vp.ultima_fecha_venta,
        c.nombre AS cliente_nombre,
        c.apellido AS cliente_apellido,
        p.nombre_producto
      FROM ventas_programadas vp
      JOIN clientes c ON vp.idcliente = c.idcliente
      JOIN productos p ON vp.idproducto = p.idproducto
      WHERE vp.estado != 'cancelada'
        AND vp.deleted_at IS NULL
        ${userCondition}
        AND (
          c.nombre LIKE ?
          OR c.apellido LIKE ?
          OR p.nombre_producto LIKE ?
          OR vp.observacion LIKE ?
        )
      ORDER BY c.idcliente, vp.idprogramacion DESC
      LIMIT ? OFFSET ?
    `;

    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  },

  /**
   * V2: Contar ventas programadas filtradas por usuario
   */
  countFilteredByUser: (search, idusuarios, idfuncionariosIds, callback) => {
    const searchTerm = `%${search}%`;
    let userCondition = '';
    const params = [searchTerm, searchTerm, searchTerm, searchTerm];

    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND vp.idusuario IN (SELECT idusuarios FROM usuarios WHERE idusuarios = ?)';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND vp.idusuario IN (SELECT idusuarios FROM funcionarios WHERE idfuncionario IN (?))';
      params.push(idfuncionariosIds.split(','));
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = `AND (
        vp.idusuario IN (SELECT idusuarios FROM usuarios WHERE idusuarios = ?)
        OR vp.idusuario IN (SELECT idusuarios FROM funcionarios WHERE idfuncionario IN (?))
      )`;
      params.push(idusuarios, idfuncionariosIds.split(','));
    }

    const query = `
      SELECT COUNT(*) AS total
      FROM ventas_programadas vp
      JOIN clientes c ON vp.idcliente = c.idcliente
      JOIN productos p ON vp.idproducto = p.idproducto
      WHERE vp.estado != 'cancelada'
        AND vp.deleted_at IS NULL
        ${userCondition}
        AND (
          c.nombre LIKE ?
          OR c.apellido LIKE ?
          OR p.nombre_producto LIKE ?
          OR vp.observacion LIKE ?
        )
    `;

    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  /**
   * V2: Obtener ventas programadas por cliente filtradas por usuario
   */
  getByClienteAndUser: (idcliente, idusuarios, idfuncionariosIds, callback) => {
    let userCondition = '';
    const params = [idcliente];

    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND vp.idusuario IN (SELECT idusuarios FROM usuarios WHERE idusuarios = ?)';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND vp.idusuario IN (SELECT idusuarios FROM funcionarios WHERE idfuncionario IN (?))';
      params.push(idfuncionariosIds.split(','));
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = `AND (
        vp.idusuario IN (SELECT idusuarios FROM usuarios WHERE idusuarios = ?)
        OR vp.idusuario IN (SELECT idusuarios FROM funcionarios WHERE idfuncionario IN (?))
      )`;
      params.push(idusuarios, idfuncionariosIds.split(','));
    }

    const query = `
      SELECT
        vp.*,
        c.nombre AS cliente_nombre,
        c.apellido AS cliente_apellido,
        c.numDocumento,
        p.nombre_producto,
        p.iva,
        ROUND(p.precio_venta, 2) AS precio_venta,
        ROUND((CAST(vp.cantidad AS DECIMAL(10,2)) * p.precio_venta), 2) AS subtotal,
        CASE
          WHEN p.iva = 10 THEN ROUND((CAST(vp.cantidad AS DECIMAL(10,2)) * p.precio_venta) / 11, 2)
          ELSE 0
        END AS subtotal_iva10,
        CASE
          WHEN p.iva = 5 THEN ROUND((CAST(vp.cantidad AS DECIMAL(10,2)) * p.precio_venta) / 21, 2)
          ELSE 0
        END AS subtotal_iva5
      FROM ventas_programadas vp
      JOIN clientes c ON vp.idcliente = c.idcliente
      JOIN productos p ON vp.idproducto = p.idproducto
      WHERE vp.idcliente = ?
        AND vp.deleted_at IS NULL
        ${userCondition}
      ORDER BY vp.created_at DESC
    `;

    db.query(query, params, callback);
  },

  // ========== MÉTODOS LEGACY (mantener compatibilidad) ==========

  findAllPaginatedFiltered: (limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
    SELECT 
      vp.idprogramacion,
      vp.idcliente,
      vp.idproducto,
      vp.cantidad,
      vp.fecha_inicio,
      vp.dia_programado,
      vp.estado,
      vp.observacion,
      vp.ultima_fecha_venta,
      c.nombre AS cliente_nombre,
      c.apellido AS cliente_apellido,
      p.nombre_producto
    FROM ventas_programadas vp
    JOIN clientes c ON vp.idcliente = c.idcliente
    JOIN productos p ON vp.idproducto = p.idproducto
    WHERE vp.estado != 'cancelada'
      AND vp.deleted_at IS NULL
      AND (
        c.nombre LIKE ?
        OR c.apellido LIKE ?
        OR p.nombre_producto LIKE ?
        OR vp.observacion LIKE ?
      )
    ORDER BY c.idcliente, vp.idprogramacion DESC
    LIMIT ? OFFSET ?
  `;
    db.query(
      query,
      [searchTerm, searchTerm, searchTerm, searchTerm, limit, offset],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results);
      }
    );
  },

  // Contar total de registros filtrados
  countFiltered: (search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
    SELECT COUNT(*) AS total
    FROM ventas_programadas vp
    JOIN clientes c ON vp.idcliente = c.idcliente
    JOIN productos p ON vp.idproducto = p.idproducto
    WHERE vp.estado != 'cancelada'
      AND vp.deleted_at IS NULL
      AND (
        c.nombre LIKE ?
        OR c.apellido LIKE ?
        OR p.nombre_producto LIKE ?
        OR vp.observacion LIKE ?
      )
  `;
    db.query(
      query,
      [searchTerm, searchTerm, searchTerm, searchTerm],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0].total);
      }
    );
  },

countFilteredByCajero: (search, idusuarios, idfuncionariosIds, callback) => {
  const searchTerm = `%${search}%`;

  // Construir condición dinámica basada en qué ID está presente
  let userCondition = '';
  const params = [];

  console.log('🔍 [MODEL] countFilteredByCajero - Parámetros recibidos:', {
    idusuarios,
    idfuncionariosIds,
    idusuariosType: typeof idusuarios,
    idfuncionariosIdsType: typeof idfuncionariosIds,
    idusuariosTruthy: !!idusuarios,
    idfuncionariosIdsTruthy: !!idfuncionariosIds
  });

  if (idusuarios && !idfuncionariosIds) {
    // Solo administrador (sin funcionarios relacionados)
    console.log('✅ Rama 1: Solo administrador sin funcionarios');
    userCondition = 'AND vp.idusuario = ?';
    params.push(idusuarios);
  } else if (idfuncionariosIds && !idusuarios) {
    // Solo funcionario
    console.log('✅ Rama 2: Solo funcionario');
    userCondition = 'AND vp.idfuncionario IN (?)';
    params.push(idfuncionariosIds);
  } else if (idusuarios && idfuncionariosIds) {
    // Administrador con funcionarios relacionados
    console.log('✅ Rama 3: Administrador con funcionarios');
    userCondition = 'AND (vp.idusuario = ? OR vp.idfuncionario IN (?))';
    params.push(idusuarios, idfuncionariosIds);
  } else {
    console.log('⚠️ Rama 4: Sin filtro de usuario (mostrará TODOS)');
  }

  const query = `
    SELECT COUNT(*) AS total
    FROM ventas_programadas vp
    JOIN clientes c ON vp.idcliente = c.idcliente
    JOIN productos p ON vp.idproducto = p.idproducto
    WHERE vp.estado != 'cancelada'
      AND vp.deleted_at IS NULL
      ${userCondition}
      AND (
        c.nombre LIKE ?
        OR c.apellido LIKE ?
        OR p.nombre_producto LIKE ?
        OR vp.observacion LIKE ?
      )
  `;

  console.log('📝 SQL generado:', query);
  console.log('📋 Parámetros SQL:', params);

  params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  db.query(query, params, (err, results) => {
    if (err) return callback(err);
    callback(null, results[0].total);
  });
},

findAllPaginatedFilteredByCajero: (limit, offset, search, idusuarios, idfuncionariosIds, callback) => {
  const searchTerm = `%${search}%`;

  // Construir condición dinámica basada en qué ID está presente
  let userCondition = '';
  const params = [];

  console.log('🔍 [MODEL] findAllPaginatedFilteredByCajero - Parámetros recibidos:', {
    idusuarios,
    idfuncionariosIds
  });

  if (idusuarios && !idfuncionariosIds) {
    // Solo administrador (sin funcionarios relacionados)
    console.log('✅ Rama 1: Solo administrador sin funcionarios');
    userCondition = 'AND vp.idusuario = ?';
    params.push(idusuarios);
  } else if (idfuncionariosIds && !idusuarios) {
    // Solo funcionario
    console.log('✅ Rama 2: Solo funcionario');
    userCondition = 'AND vp.idfuncionario IN (?)';
    params.push(idfuncionariosIds);
  } else if (idusuarios && idfuncionariosIds) {
    // Administrador con funcionarios relacionados
    console.log('✅ Rama 3: Administrador con funcionarios');
    userCondition = 'AND (vp.idusuario = ? OR vp.idfuncionario IN (?))';
    params.push(idusuarios, idfuncionariosIds);
  } else {
    console.log('⚠️ Rama 4: Sin filtro de usuario (mostrará TODOS)');
  }

  const query = `
    SELECT
      vp.idprogramacion,
      vp.idcliente,
      vp.idproducto,
      vp.cantidad,
      vp.fecha_inicio,
      vp.dia_programado,
      vp.estado,
      vp.observacion,
      vp.ultima_fecha_venta,
      vp.idusuario,
      vp.idfuncionario,
      c.nombre AS cliente_nombre,
      c.apellido AS cliente_apellido,
      p.nombre_producto,
      u.login AS cajero_nombre,
      f.nombre AS funcionario_nombre
    FROM ventas_programadas vp
    JOIN clientes c ON vp.idcliente = c.idcliente
    JOIN productos p ON vp.idproducto = p.idproducto
    LEFT JOIN usuarios u ON vp.idusuario = u.idusuarios
    LEFT JOIN funcionarios f ON vp.idfuncionario = f.idfuncionario
    WHERE vp.estado != 'cancelada'
      AND vp.deleted_at IS NULL
      ${userCondition}
      AND (
        c.nombre LIKE ?
        OR c.apellido LIKE ?
        OR p.nombre_producto LIKE ?
        OR vp.observacion LIKE ?
      )
    ORDER BY c.idcliente, vp.idprogramacion DESC
    LIMIT ? OFFSET ?
  `;

  params.push(searchTerm, searchTerm, searchTerm, searchTerm, limit, offset);

  console.log('🔍 Query params:', { idusuarios, idfuncionariosIds, limit, offset, searchTerm, userCondition });
  console.log('🔍 SQL Query:', query);
  console.log('🔍 Params array:', params);

  db.query(query, params, (err, results) => {
    if (err) return callback(err);
    console.log(`✅ Encontradas ${results.length} ventas programadas para idusuario=${idusuarios} o funcionarios=${idfuncionariosIds}`);
    if (results.length > 0) {
      console.log('📋 Primera venta programada:', {
        idprogramacion: results[0].idprogramacion,
        idusuario: results[0].idusuario,
        idfuncionario: results[0].idfuncionario,
        cliente: results[0].cliente_nombre
      });
    }
    callback(null, results);
  });
},
  // 2️⃣ Obtener ventas programadas por cliente
  getByCliente: (idcliente, callback) => {
    const query = `
   SELECT 
      vp.*,
      c.nombre AS cliente_nombre,
      c.apellido AS cliente_apellido,
      c.numDocumento,
      p.nombre_producto,
      p.iva,
      ROUND(p.precio_venta, 2) AS precio_venta,
      ROUND((CAST(vp.cantidad AS DECIMAL(10,2)) * p.precio_venta), 2) AS subtotal,
      CASE 
        WHEN p.iva = 10 THEN ROUND((CAST(vp.cantidad AS DECIMAL(10,2)) * p.precio_venta) / 11, 2)
        ELSE 0
      END AS subtotal_iva10,
      CASE 
        WHEN p.iva = 5 THEN ROUND((CAST(vp.cantidad AS DECIMAL(10,2)) * p.precio_venta) / 21, 2)
        ELSE 0
      END AS subtotal_iva5
    FROM ventas_programadas vp
    JOIN clientes c ON vp.idcliente = c.idcliente
    JOIN productos p ON vp.idproducto = p.idproducto
    WHERE vp.idcliente = ?
      AND vp.deleted_at IS NULL
    ORDER BY vp.created_at DESC
    `;
    db.query(query, [idcliente], callback);
  },
  // 2️⃣ Obtener todas las ventas programadas
  getAll: (callback) => {
    const query = `
      SELECT vp.*, c.nombre, c.apellido, p.nombre_producto
      FROM ventas_programadas vp
      JOIN clientes c ON vp.idcliente = c.idcliente
      JOIN productos p ON vp.idproducto = p.idproducto
      WHERE vp.estado = 'activa'
    `;
    db.query(query, callback);
  },

  softDelete: (id, callback) => {
    const query = `
    UPDATE ventas_programadas
    SET deleted_at = NOW(), estado = 'anulado', updated_at = NOW()
    WHERE idprogramacion = ?
  `;
    db.query(query, [id], callback);
  },

  // 3️⃣ Actualizar última fecha de venta
  updateUltimaFechaVenta: (idprogramacion, fechaVenta, callback) => {
    const query = `
      UPDATE ventas_programadas
      SET ultima_fecha_venta = ?
      WHERE idprogramacion = ?
    `;
    db.query(query, [fechaVenta, idprogramacion], callback);
  },
};

export default VentasProgramadas;
