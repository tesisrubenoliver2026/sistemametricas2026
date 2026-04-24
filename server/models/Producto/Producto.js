import db from '../../db.js';

const Producto = {
  findAll: (callback) => {
    db.query('SELECT * FROM productos WHERE deleted_at IS NULL', callback);
  },

  findById: (idproducto, callback) => {
    const query = `
    SELECT
      p.*,
      MAX(dc.fecha_vencimiento) AS ultima_fecha_vencimiento,

      /* Número de lote más reciente */
      (SELECT lp.numero_lote
       FROM lotes_producto lp
       WHERE lp.idproducto = p.idproducto
         AND lp.deleted_at IS NULL
       ORDER BY lp.idlote DESC
       LIMIT 1) AS lotenumreciente,

      /* Precio de compra del lote más reciente */
      (SELECT lp.precio_compra
       FROM lotes_producto lp
       WHERE lp.idproducto = p.idproducto
         AND lp.deleted_at IS NULL
       ORDER BY lp.idlote DESC
       LIMIT 1) AS lote_pr_compr_rec

    FROM productos p
    LEFT JOIN detalle_compra dc ON dc.idproducto = p.idproducto
    WHERE p.idproducto = ?
    GROUP BY p.idproducto
  `;

    db.query(query, [idproducto], callback);
  },

  findAllPaginatedFiltered: (limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
     SELECT
     p.*,
     MAX(dc.fecha_vencimiento) AS ultima_fecha_vencimiento,
      (SELECT lp.numero_lote
       FROM lotes_producto lp
       WHERE lp.idproducto = p.idproducto
         AND lp.deleted_at IS NULL
       ORDER BY lp.idlote DESC
      LIMIT 1) AS lotenumreciente,

            /* Precio de compra del lote más reciente */
      (SELECT lp.precio_compra
       FROM lotes_producto lp
       WHERE lp.idproducto = p.idproducto
         AND lp.deleted_at IS NULL
       ORDER BY lp.idlote DESC
       LIMIT 1) AS lote_pr_compr_rec


      FROM productos p
      LEFT JOIN detalle_compra dc ON dc.idproducto = p.idproducto
      WHERE p.deleted_at IS NULL
        AND (p.nombre_producto LIKE ? OR p.ubicacion LIKE ? OR p.cod_barra LIKE ?)
      GROUP BY p.idproducto
      ORDER BY p.idproducto DESC
      LIMIT ? OFFSET ?
    `;
    db.query(query, [searchTerm, searchTerm, searchTerm, limit, offset], callback);
  },

  countFiltered: (search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT COUNT(*) AS total FROM productos 
      WHERE deleted_at IS NULL 
        AND (nombre_producto LIKE ? OR ubicacion LIKE ? OR cod_barra LIKE ?)
    `;
    db.query(query, [searchTerm, searchTerm, searchTerm], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  findByBarcodeByUser: (userId, barcode, callback) => {
    const query = `
    SELECT
      p.*,
      MAX(dc.fecha_vencimiento) AS ultima_fecha_vencimiento,
      (SELECT lp.numero_lote
       FROM lotes_producto lp
       WHERE lp.idproducto = p.idproducto
         AND lp.deleted_at IS NULL
       ORDER BY lp.idlote DESC
       LIMIT 1) AS lotenumreciente,

             /* Precio de compra del lote más reciente */
      (SELECT lp.precio_compra
       FROM lotes_producto lp
       WHERE lp.idproducto = p.idproducto
         AND lp.deleted_at IS NULL
       ORDER BY lp.idlote DESC
       LIMIT 1) AS lote_pr_compr_rec


    FROM productos p
    LEFT JOIN detalle_compra dc ON dc.idproducto = p.idproducto
    WHERE p.deleted_at IS NULL
    AND (p.idusuario = ? OR p.idfuncionario = ?)
    AND p.cod_barra = ?
    GROUP BY p.idproducto
  `;
    db.query(query, [userId, userId, barcode], callback);
  },

  // Obtener productos paginados y filtrados por usuario
  findAllPaginatedFilteredByUser: (userId, limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
    SELECT
      p.*,
      MAX(dc.fecha_vencimiento) AS ultima_fecha_vencimiento,
      (SELECT lp.numero_lote
       FROM lotes_producto lp
       WHERE lp.idproducto = p.idproducto
         AND lp.deleted_at IS NULL
       ORDER BY lp.idlote DESC
       LIMIT 1) AS lotenumreciente,

             /* Precio de compra del lote más reciente */
      (SELECT lp.precio_compra
       FROM lotes_producto lp
       WHERE lp.idproducto = p.idproducto
         AND lp.deleted_at IS NULL
       ORDER BY lp.idlote DESC
       LIMIT 1) AS lote_pr_compr_rec
       
    FROM productos p
    LEFT JOIN detalle_compra dc ON dc.idproducto = p.idproducto
    WHERE p.deleted_at IS NULL
    AND (p.idusuario = ? OR p.idfuncionario = ?)
    AND (p.nombre_producto LIKE ? OR p.ubicacion LIKE ? OR p.cod_barra LIKE ?)
    GROUP BY p.idproducto
    ORDER BY p.idproducto DESC
    LIMIT ? OFFSET ?
  `;
    db.query(query, [userId, userId, searchTerm, searchTerm, searchTerm, limit, offset], callback);
  },

  // Contar productos filtrados por usuario
  countFilteredByUser: (userId, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
    SELECT COUNT(*) AS total FROM productos
    WHERE deleted_at IS NULL
    AND (idusuario = ? OR idfuncionario = ?)
    AND (nombre_producto LIKE ? OR ubicacion LIKE ? OR cod_barra LIKE ?)
  `;
    db.query(query, [userId, userId, searchTerm, searchTerm, searchTerm], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

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
        MAX(dc.fecha_vencimiento) AS ultima_fecha_vencimiento,
        (SELECT lp.numero_lote
         FROM lotes_producto lp
         WHERE lp.idproducto = p.idproducto
           AND lp.deleted_at IS NULL
         ORDER BY lp.idlote DESC
         LIMIT 1) AS lotenumreciente,

               /* Precio de compra del lote más reciente */
      (SELECT lp.precio_compra
       FROM lotes_producto lp
       WHERE lp.idproducto = p.idproducto
         AND lp.deleted_at IS NULL
       ORDER BY lp.idlote DESC
       LIMIT 1) AS lote_pr_compr_rec
       
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
        MAX(dc.fecha_vencimiento) AS ultima_fecha_vencimiento,
        (SELECT lp.numero_lote
         FROM lotes_producto lp
         WHERE lp.idproducto = p.idproducto
           AND lp.deleted_at IS NULL
         ORDER BY lp.idlote DESC
         LIMIT 1) AS lotenumreciente,

        (SELECT lp.precio_compra
        FROM lotes_producto lp
        WHERE lp.idproducto = p.idproducto
          AND lp.deleted_at IS NULL
        ORDER BY lp.idlote DESC
        LIMIT 1) AS lote_pr_compr_rec

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

  create: (data, callback) => {
    const insertQuery = `
    INSERT INTO productos (
      nombre_producto, cod_barra, precio_compra, precio_compra_caja,
      idcategoria, precio_venta, precio_venta_caja, ubicacion, iva, unidad_medida, stock,
      cant_p_caja, cant_cajas, idusuario, idfuncionario, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

    const values = [
      data.nombre_producto,
      data.cod_barra || null,
      data.precio_compra,
      // Solo asignar precio_compra_caja si unidad_medida es 'CAJA'
      data.unidad_medida && data.unidad_medida.toUpperCase() === 'CAJA' ? (data.precio_compra_caja || null) : null,
      data.idcategoria,
      data.precio_venta,
      // Solo asignar precio_venta_caja si unidad_medida es 'CAJA'
      data.unidad_medida && data.unidad_medida.toUpperCase() === 'CAJA' ? (data.precio_venta_caja || null) : null,
      data.ubicacion || null,
      data.iva,
      data.unidad_medida,
      data.stock || 0,
      // Solo asignar cant_p_caja si unidad_medida es 'CAJA'
      data.unidad_medida && data.unidad_medida.toUpperCase() === 'CAJA' ? (data.cant_p_caja || null) : null,
      // Solo asignar cant_cajas si unidad_medida es 'CAJA'
      data.unidad_medida && data.unidad_medida.toUpperCase() === 'CAJA' ? (data.cant_cajas || 0) : 0,
      data.idusuario,
      data.idfuncionario || null
    ];

    db.query(insertQuery, values, (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(err.code + ' - ' + err.sqlMessage);

          let errorMsg = 'Ya tienes un producto con estos datos.';
          if (err.message.includes('unique_codigo_usuario')) {
            errorMsg = 'Ya tienes un producto registrado con este Código de Barras.';
          } else if (err.message.includes('unique_nombre_usuario')) {
            errorMsg = 'Ya tienes un producto registrado con este Nombre.';
          }

          const error = new Error(errorMsg);
          error.code = 'PRODUCT_EXISTS';
          return callback(error);
        }

        return callback(err);
      }
      callback(null, results);
    });
  },

  findByBarcode: (barcode, callback) => {
    const query = `
      SELECT 
        p.*, 
        MAX(dc.fecha_vencimiento) AS ultima_fecha_vencimiento
      FROM productos p
      LEFT JOIN detalle_compra dc ON dc.idproducto = p.idproducto
      WHERE p.cod_barra = ? AND p.deleted_at IS NULL
      GROUP BY p.idproducto
    `;
    db.query(query, [barcode], callback);
  },

  findAllByUserForReport: (userId, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
     SELECT
      p.*,
      MAX(dc.fecha_vencimiento) AS ultima_fecha_vencimiento,
      c.categoria AS nombre_categoria
      FROM productos p
      LEFT JOIN detalle_compra dc ON dc.idproducto = p.idproducto
      LEFT JOIN categorias c ON c.idcategorias = p.idcategoria
      WHERE p.deleted_at IS NULL
        AND (p.idusuario = ? OR p.idfuncionario = ?)
        AND (p.nombre_producto LIKE ? OR p.ubicacion LIKE ? OR p.cod_barra LIKE ?)
      GROUP BY p.idproducto
      ORDER BY p.nombre_producto ASC
    `;
    db.query(query, [userId, userId, searchTerm, searchTerm, searchTerm], callback);
  },

  update: (id, data, callback) => {
    const checkQuery = `
        SELECT idproducto FROM productos 
        WHERE nombre_producto = ? AND idusuario = ? AND idproducto != ?
    `;

    const getUserQuery = `SELECT idusuario FROM productos WHERE idproducto = ?`;

    db.query(getUserQuery, [id], (err, userResult) => {
      if (err) return callback(err);

      const idusuario = userResult[0]?.idusuario;

      db.query(checkQuery, [data.nombre_producto, idusuario, id], (err, results) => {
        if (err) return callback(err);

        if (results.length > 0) {
          const error = new Error('Ya tienes un producto registrado con este Nombre.');
          error.code = 'PRODUCT_EXISTS';
          return callback(error);
        }

        // Proceder con el UPDATE incluyendo precio_venta_caja
        const updateQuery = `
                UPDATE productos SET 
                    nombre_producto = ?, 
                    cod_barra = ?, 
                    precio_venta = ?,
                    precio_venta_caja = ?,
                    idcategoria = ?, 
                    ubicacion = ?, 
                    iva = ?, 
                    estado = ?, 
                    unidad_medida = ?, 
                    updated_at = NOW()
                WHERE idproducto = ?
            `;

        const values = [
          data.nombre_producto,
          data.cod_barra,
          data.precio_venta,
          // Solo asignar precio_venta_caja si unidad_medida es 'CAJA'
          data.unidad_medida && data.unidad_medida.toUpperCase() === 'CAJA' ? (data.precio_venta_caja || null) : null,
          data.idcategoria,
          data.ubicacion,
          data.iva,
          data.estado,
          data.unidad_medida,
          id
        ];

        db.query(updateQuery, values, callback);
      });
    });
  },

  delete: (id, callback) => {
    db.query('DELETE FROM productos WHERE idproducto = ?', [id], callback);
  },

  aumentarStock: (idproducto, cantidad, callback) => {
    const query = `
    UPDATE productos 
    SET 
      stock = stock + ?,
      cant_cajas = CASE 
        WHEN cant_p_caja IS NOT NULL AND cant_p_caja > 0 
        THEN ROUND((stock + ?) / cant_p_caja, 2)
        ELSE cant_cajas
      END
    WHERE idproducto = ?
  `;
    db.query(query, [cantidad, cantidad, idproducto], callback);
  },

  updateCantPorCaja: (idproducto, cant_p_caja, callback) => {
    const query = `
      UPDATE productos 
      SET cant_p_caja = ? 
      WHERE idproducto = ?
    `;
    db.query(query, [cant_p_caja, idproducto], callback);
  },

  actualizarStockYCantPCaja: (idproducto, cantidadStock, nuevoCantPCaja, nuevoPrecioCompraCaja, nuevoPrecioCompra, callback) => {
    const query = `
    UPDATE productos 
    SET 
      stock = stock + ?,
      cant_p_caja = ?,
      precio_compra_caja = ?,
      precio_compra = ?
    WHERE idproducto = ?
  `;

    db.query(query, [cantidadStock, nuevoCantPCaja, nuevoPrecioCompraCaja, nuevoPrecioCompra, idproducto], callback);
  },

  softDelete: (id, callback) => {
    const query = `UPDATE productos SET deleted_at = NOW() WHERE idproducto = ?`;
    db.query(query, [id], callback);
  },

  restarStock: (idproducto, cantidad, callback) => {
    const query = `
    UPDATE productos 
    SET stock = stock - ?
    WHERE idproducto = ?
  `;
    db.query(query, [cantidad, idproducto], callback);
  },

  restaurarPreciosYCantidadCaja: (idproducto, precioCompraCaja, cantPCaja, precioCompra, callback) => {
    const query = `
    UPDATE productos 
    SET 
      precio_compra_caja = ?,
      cant_p_caja = ?,
      precio_compra = ?
    WHERE idproducto = ?
  `;
    db.query(query, [precioCompraCaja, cantPCaja, precioCompra, idproducto], callback);
  },

  restarStockCaja: (idproducto, cantidadStock, nuevoCantPCaja, nuevoPrecioCompraCaja, nuevoPrecioCompra, callback) => {
    const query = `
    UPDATE productos 
    SET 
      stock = stock - ?,
      cant_p_caja = ?,
      precio_compra_caja = ?,
      precio_compra = ?
    WHERE idproducto = ?
  `;

    db.query(query, [cantidadStock, nuevoCantPCaja, nuevoPrecioCompraCaja, nuevoPrecioCompra, idproducto], callback);
  },


};

export default Producto;
