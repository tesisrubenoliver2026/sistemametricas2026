import db from '../../db.js';
const DetalleCompra = {
  create: (data, callback) => {
    const query = `
    INSERT INTO detalle_compra (
      idproducto, idcompra, idproveedor,
      cantidad, precio, precio_compra_caja, sub_total, fecha_vencimiento,
      nombre_producto, unidad_medida, iva, stock_restante,
      cant_cajas, cant_cajas_restante, cant_p_caja, cant_p_caja_restante,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
    const values = [
      data.idproducto,
      data.idcompra,
      data.idproveedor,
      data.cantidad,
      data.precio,
      data.precio_compra_caja || null,
      data.sub_total,
      data.fecha_vencimiento || null,
      data.nombre_producto,
      data.unidad_medida,
      data.iva,
      data.stock_restante || data.cantidad,
      data.cant_cajas || null,
      data.cant_cajas_restante || data.cant_cajas || null,
      data.cant_p_caja || null,
      data.cant_p_caja_restante || data.cant_p_caja || null
    ];
    db.query(query, values, callback);
  },

  softDeleteByCompraId: (idcompra, callback) => {
    const query = `
    UPDATE detalle_compra 
    SET deleted_at = NOW() 
    WHERE idcompra = ?
  `;
    db.query(query, [idcompra], callback);
  },

  createInventarioInicial: (data, callback) => {
    const query = `
      INSERT INTO detalle_compra (
        idproducto, idcompra, idproveedor,
        cantidad, precio, fecha_vencimiento,
        nombre_producto, unidad_medida, iva, stock_restante,
        created_at
      ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      data.idproducto,
      data.idproveedor,
      data.cantidad,
      data.precio,
      data.fecha_vencimiento || null,
      data.nombre_producto,
      data.unidad_medida,
      data.iva,
      data.stock_restante || data.cantidad
    ];
    db.query(query, values, callback);
  },

  findByCompra: (idcompra, callback) => {
    const query = `
      SELECT
        iddetalle, idproducto, idcompra, idproveedor,
        cantidad, precio, sub_total, fecha_vencimiento,
        nombre_producto, unidad_medida, iva, stock_restante
      FROM detalle_compra
      WHERE idcompra = ?
    `;
    db.query(query, [idcompra], callback);
  },

  findByCompraMultiple: (ids, callback) => {
    const query = `
      SELECT
        iddetalle, idproducto, idcompra, idproveedor,
        cantidad, precio, sub_total, fecha_vencimiento,
        nombre_producto, unidad_medida, iva, stock_restante
      FROM detalle_compra
      WHERE idcompra IN (?)
    `;
    db.query(query, [ids], callback);
  },

  findById: (iddetalle, callback) => {
    const query = `
    SELECT
      iddetalle, idproducto, cantidad, precio, sub_total,
      fecha_vencimiento, nombre_producto, unidad_medida,
      iva, stock_restante
    FROM detalle_compra
    WHERE iddetalle = ?
  `;
    db.query(query, [iddetalle], callback);
  },

  verificarStockSuficiente: (iddetalle, cantidad, callback) => {
    const query = `SELECT stock_restante FROM detalle_compra WHERE iddetalle = ?`;
    db.query(query, [iddetalle], (err, results) => {
      if (err) return callback(err);
      if (!results.length || results[0].stock_restante < cantidad) {
        return callback(null, false); // No hay suficiente stock
      }
      callback(null, true);
    });
  },

  restarStockLote: (iddetalle, cantidad, callback) => {
    const cantidadFloat = parseFloat(cantidad);
    const query = `
    UPDATE detalle_compra
    SET
      stock_restante = stock_restante - ?,
      cant_cajas_restante = CASE
        WHEN cant_p_caja IS NOT NULL AND cant_p_caja > 0
        THEN FLOOR((stock_restante - ?) / cant_p_caja)
        ELSE cant_cajas_restante
      END,
      cant_p_caja_restante = CASE
        WHEN cant_p_caja IS NOT NULL AND cant_p_caja > 0
        THEN MOD(CAST(stock_restante - ? AS SIGNED), cant_p_caja)
        ELSE cant_p_caja_restante
      END
    WHERE iddetalle = ? AND stock_restante >= ?
  `;
    db.query(query, [cantidadFloat, cantidadFloat, cantidadFloat, iddetalle, cantidadFloat], callback);
  },

  aumentarStockLote: (iddetalle, cantidad, callback) => {
    const cantidadFloat = parseFloat(cantidad);
    const query = `
    UPDATE detalle_compra
    SET 
      stock_restante = stock_restante + ?,
      cantidad = cantidad + ?,
      cant_cajas_restante = CASE 
        WHEN cant_p_caja IS NOT NULL AND cant_p_caja > 0 
        THEN ROUND((stock_restante + ?) / cant_p_caja, 2)
        ELSE cant_cajas_restante
      END,
      cant_p_caja_restante = CASE
        WHEN cant_p_caja IS NOT NULL AND cant_p_caja > 0
        THEN MOD(CAST(stock_restante + ? AS SIGNED), cant_p_caja)
        ELSE cant_p_caja_restante
      END,
      cant_cajas = CASE
        WHEN cant_p_caja IS NOT NULL AND cant_p_caja > 0
        THEN ROUND((cantidad + ?) / cant_p_caja, 2)
        ELSE cant_cajas
      END
    WHERE iddetalle = ?
  `;
    db.query(query, [cantidadFloat, cantidadFloat, cantidadFloat, cantidadFloat, cantidadFloat, iddetalle], callback);
  },


  findByCompraId: (idcompra, callback) => {
    const query = `
    SELECT
      dc.iddetalle,
      dc.idcompra,
      dc.idproducto,
      dc.idproveedor,
      dc.cantidad,
      dc.precio,
      dc.precio_compra_caja,
      dc.sub_total,
      dc.fecha_vencimiento,
      dc.nombre_producto,
      dc.unidad_medida,
      dc.iva,
      dc.stock_restante,
      dc.cant_cajas,
      dc.cant_cajas_restante,
      dc.cant_p_caja,
      dc.cant_p_caja_restante,
      p.nombre_producto AS producto
    FROM detalle_compra dc
    LEFT JOIN productos p
      ON dc.idproducto = p.idproducto
    WHERE dc.idcompra = ?
      AND dc.deleted_at IS NULL
  `;
    db.query(query, [idcompra], callback);
  },

  findUltimoDetalleAnterior: (idproducto, idcompraActual, callback) => {
    const query = `
    SELECT 
      dc.precio_compra_caja,
      dc.cant_p_caja,
      dc.precio,
      dc.idcompra,
      c.fecha
    FROM detalle_compra dc
    INNER JOIN compras c ON dc.idcompra = c.idcompra
    WHERE dc.idproducto = ?
      AND dc.idcompra != ?
      AND dc.deleted_at IS NULL
      AND c.deleted_at IS NULL
      AND dc.unidad_medida = 'CAJA'
    ORDER BY c.fecha DESC, dc.iddetalle DESC
    LIMIT 1
  `;
    db.query(query, [idproducto, idcompraActual], callback);
  },

  findByProducto: (idproducto, callback) => {
    const query = `
      SELECT
        dc.iddetalle,
        dc.idproducto,
        dc.cantidad,
        dc.stock_restante,
        dc.precio AS precio_compra,
        dc.sub_total,
        dc.fecha_vencimiento,
        dc.nombre_producto,
        dc.unidad_medida,
        dc.iva,
        p.precio_venta
      FROM detalle_compra dc
      JOIN productos p ON dc.idproducto = p.idproducto
      WHERE dc.idproducto = ? AND dc.stock_restante > 0
      ORDER BY dc.fecha_vencimiento ASC
    `;
    db.query(query, [idproducto], callback);
  }


};

export default DetalleCompra;
