  // ========== MÉTODOS V2 CON FILTRO DE FUNCIONARIOS RELACIONADOS ==========

  // Buscar por código de barras con filtro de usuario y funcionarios relacionados
  findByBarcodeByUserV2: (idusuarios, idfuncionariosIds, barcode, callback) => {
    const params = [];
    let userCondition = '';

    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND p.idusuario = ?';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND p.idfuncionario IN (?)';
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (p.idusuario = ? OR p.idfuncionario IN (?))';
      params.push(idusuarios, idfuncionariosIds);
    }

    params.push(barcode);

    const query = `
      SELECT
        p.*,
        MAX(dc.fecha_vencimiento) AS ultima_fecha_vencimiento
      FROM productos p
      LEFT JOIN detalle_compra dc ON dc.idproducto = p.idproducto
      WHERE p.deleted_at IS NULL
      ${userCondition}
      AND p.cod_barra = ?
      GROUP BY p.idproducto
    `;
    db.query(query, params, callback);
  },

  // Obtener productos paginados y filtrados por usuario y funcionarios relacionados
  findAllPaginatedFilteredByUserV2: (idusuarios, idfuncionariosIds, limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const params = [];

    // Primero agregar parámetros de búsqueda (van primero en el SQL)
    params.push(searchTerm, searchTerm, searchTerm);

    // Condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND (p.idusuario = ?)';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND (p.idfuncionario IN (?))';
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (p.idusuario = ? OR p.idfuncionario IN (?))';
      params.push(idusuarios, idfuncionariosIds);
    }

    params.push(limit, offset);

    const query = `
      SELECT
        p.*,
        MAX(dc.fecha_vencimiento) AS ultima_fecha_vencimiento
      FROM productos p
      LEFT JOIN detalle_compra dc ON dc.idproducto = p.idproducto
      WHERE p.deleted_at IS NULL
      AND (p.nombre_producto LIKE ? OR p.ubicacion LIKE ? OR p.cod_barra LIKE ?)
      ${userCondition}
      GROUP BY p.idproducto
      ORDER BY p.idproducto DESC
      LIMIT ? OFFSET ?
    `;
    db.query(query, params, callback);
  },

  // Contar productos filtrados por usuario y funcionarios relacionados
  countFilteredByUserV2: (idusuarios, idfuncionariosIds, search, callback) => {
    const searchTerm = `%${search}%`;
    const params = [];

    // Primero agregar parámetros de búsqueda
    params.push(searchTerm, searchTerm, searchTerm);

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
      SELECT COUNT(*) AS total FROM productos
      WHERE deleted_at IS NULL
      AND (nombre_producto LIKE ? OR ubicacion LIKE ? OR cod_barra LIKE ?)
      ${userCondition}
    `;
    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },
