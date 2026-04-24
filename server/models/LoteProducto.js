// models/LoteProducto.js
import db from '../db.js';

const LoteProducto = {
  /**
   * Crear un nuevo lote de producto
   */
  create: (data, callback) => {
    const query = `
      INSERT INTO lotes_producto (
        idproducto,
        iddetalle_compra,
        numero_lote,
        referencia_proveedor,
        cantidad_inicial,
        stock_actual,
        fecha_vencimiento,
        precio_compra,
        ubicacion_almacen,
        estado,
        cant_p_caja,
        cant_cajas,
        precio_compra_caja
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.idproducto,
      data.iddetalle_compra,
      data.numero_lote,
      data.referencia_proveedor || null,
      data.cantidad_inicial,
      data.stock_actual || data.cantidad_inicial,
      data.fecha_vencimiento || null,
      data.precio_compra,
      data.ubicacion_almacen || 'PRINCIPAL',
      data.estado || 'disponible',
      data.cant_p_caja || null,
      data.cant_cajas || null,
      data.precio_compra_caja || null
    ];

    db.query(query, values, callback);
  },

  /**
   * Buscar lote por ID
   */
  findById: (idlote, callback) => {
    const query = `
      SELECT
        l.*,
        p.nombre_producto,
        p.cod_barra,
        dc.idcompra,
        c.fecha as fecha_compra,
        c.nro_factura as factura_compra,
        pr.nombre as nombre_proveedor
      FROM lotes_producto l
      JOIN productos p ON l.idproducto = p.idproducto
      JOIN detalle_compra dc ON l.iddetalle_compra = dc.iddetalle
      JOIN compras c ON dc.idcompra = c.idcompra
      LEFT JOIN proveedor pr ON dc.idproveedor = pr.idproveedor
      WHERE l.idlote = ?
        AND l.deleted_at IS NULL
    `;
    db.query(query, [idlote], callback);
  },

  /**
   * Obtener lotes disponibles de un producto (FIFO por vencimiento)
   */
  findDisponiblesByProducto: (idproducto, callback) => {
    const query = `
      SELECT
        l.idlote,
        l.numero_lote,
        l.stock_actual,
        l.fecha_vencimiento,
        l.precio_compra,
        l.ubicacion_almacen,
        l.estado,
        l.iddetalle_compra,
        DATEDIFF(l.fecha_vencimiento, CURDATE()) as dias_hasta_vencimiento,
        dc.idcompra,
        c.nro_factura as factura_compra
      FROM lotes_producto l
      LEFT JOIN detalle_compra dc ON l.iddetalle_compra = dc.iddetalle AND dc.deleted_at IS NULL
      LEFT JOIN compras c ON dc.idcompra = c.idcompra AND c.deleted_at IS NULL
      WHERE l.idproducto = ?
        AND l.stock_actual > 0
        AND l.estado IN ('disponible', 'parcial', 'agotado')
        AND l.deleted_at IS NULL
        AND (l.fecha_vencimiento IS NULL OR l.fecha_vencimiento >= CURDATE())
      ORDER BY l.fecha_vencimiento ASC, l.idlote ASC
    `;
    db.query(query, [idproducto], callback);
  },

  /**
   * Restar stock de un lote (usado en ventas)
   */
  restarStock: (idlote, cantidad, callback) => {
    const cantidadFloat = parseFloat(cantidad);

    // Primero verificar stock suficiente
    const queryVerificar = `SELECT stock_actual FROM lotes_producto WHERE idlote = ?`;

    db.query(queryVerificar, [idlote], (err, results) => {
      if (err) return callback(err);
      if (!results.length) return callback(new Error('Lote no encontrado'));

      const stockActual = parseFloat(results[0].stock_actual);
      if (stockActual < cantidadFloat) {
        return callback(new Error(`Stock insuficiente. Disponible: ${stockActual}, Requerido: ${cantidadFloat}`));
      }

      // Restar stock y actualizar estado
      const queryUpdate = `
        UPDATE lotes_producto
        SET
          stock_actual = stock_actual - ?,
          estado = CASE
            WHEN (stock_actual - ?) = 0 THEN 'agotado'
            WHEN (stock_actual - ?) < cantidad_inicial THEN 'parcial'
            ELSE 'disponible'
          END,
          updated_at = NOW()
        WHERE idlote = ?
          AND stock_actual >= ?
      `;

      db.query(queryUpdate, [cantidadFloat, cantidadFloat, cantidadFloat, idlote, cantidadFloat], callback);
    });
  },

  /**
   * Aumentar stock de un lote (usado en devoluciones)
   */
  aumentarStockDevolucion: (idlote, cantidad, callback) => {
    const cantidadFloat = parseFloat(cantidad);

    const query = `
      UPDATE lotes_producto
      SET
        stock_actual = stock_actual + ?,
        estado = CASE
          WHEN (stock_actual + ?) >= cantidad_inicial THEN 'disponible'
          WHEN (stock_actual + ?) > 0 THEN 'parcial'
          ELSE estado
        END,
        updated_at = NOW()
      WHERE idlote = ?
    `;

    db.query(query, [cantidadFloat, cantidadFloat, cantidadFloat, idlote], callback);
  },

  /**
   * Buscar lote por número de lote
   */
  findByNumeroLote: (numero_lote, callback) => {
    const query = `
      SELECT
        l.*,
        p.nombre_producto,
        p.codigo
      FROM lotes_producto l
      JOIN productos p ON l.idproducto = p.idproducto
      WHERE l.numero_lote = ?
        AND l.deleted_at IS NULL
    `;
    db.query(query, [numero_lote], callback);
  },

  /**
   * Obtener todos los lotes de un producto
   */
  findAllByProducto: (idproducto, callback) => {
    const query = `
      SELECT
        l.idlote,
        l.idproducto,
        l.numero_lote,
        l.cantidad_inicial,
        l.stock_actual,
        l.fecha_vencimiento,
        l.fecha_ingreso,
        l.precio_compra,
        l.precio_compra_caja,
        l.cant_p_caja AS lote_cant_p_caja,
        l.cant_cajas,
        l.ubicacion_almacen,
        l.estado,
        DATEDIFF(l.fecha_vencimiento, CURDATE()) as dias_hasta_vencimiento,
        dc.idcompra,
        c.nro_factura as factura_compra,
        c.fecha as fecha_compra,
        p.precio_venta,
        p.precio_venta_caja,
        p.cant_p_caja,
        p.unidad_medida,
        p.nombre_producto,
        p.iva
      FROM lotes_producto l
      JOIN detalle_compra dc ON l.iddetalle_compra = dc.iddetalle
      JOIN compras c ON dc.idcompra = c.idcompra
      JOIN productos p ON l.idproducto = p.idproducto
      WHERE l.idproducto = ?
        AND l.deleted_at IS NULL
      ORDER BY l.fecha_vencimiento ASC, l.fecha_ingreso ASC
    `;
    db.query(query, [idproducto], callback);
  },

  /**
   * Lotes próximos a vencer (dentro de X días)
   */
  findProximosVencer: (dias = 30, callback) => {
    const query = `
      SELECT
        l.idlote,
        l.numero_lote,
        l.stock_actual,
        l.fecha_vencimiento,
        l.ubicacion_almacen,
        DATEDIFF(l.fecha_vencimiento, CURDATE()) as dias_restantes,
        p.nombre_producto,
        p.codigo,
        (l.stock_actual * l.precio_compra) as valor_inventario
      FROM lotes_producto l
      JOIN productos p ON l.idproducto = p.idproducto
      WHERE l.fecha_vencimiento IS NOT NULL
        AND l.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
        AND l.stock_actual > 0
        AND l.estado IN ('disponible', 'parcial')
        AND l.deleted_at IS NULL
      ORDER BY l.fecha_vencimiento ASC
    `;
    db.query(query, [dias], callback);
  },

  /**
   * Marcar lotes vencidos
   */
  marcarVencidos: (callback) => {
    const query = `
      UPDATE lotes_producto
      SET
        estado = 'vencido',
        updated_at = NOW()
      WHERE fecha_vencimiento < CURDATE()
        AND estado != 'vencido'
        AND stock_actual > 0
        AND deleted_at IS NULL
    `;
    db.query(query, callback);
  },

  /**
   * Verificar si existe un lote con el mismo número para el mismo producto
   * @param {number} idproducto - ID del producto
   * @param {string} numero_lote - Número de lote a verificar
   * @param {Function} callback - Callback con (error, existe: boolean)
   */
  existeNumeroLoteParaProducto: (idproducto, numero_lote, callback) => {
    const query = `
      SELECT COUNT(*) as count
      FROM lotes_producto
      WHERE idproducto = ?
        AND numero_lote = ?
        AND deleted_at IS NULL
    `;
    db.query(query, [idproducto, numero_lote], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].count > 0);
    });
  },

  /**
   * Buscar un lote por producto y número de lote
   * @param {number} idproducto - ID del producto
   * @param {string} numero_lote - Número de lote a buscar
   * @param {Function} callback - Callback con (error, lote)
   */
  findByProductoYNumeroLote: (idproducto, numero_lote, callback) => {
    const query = `
      SELECT *
      FROM lotes_producto
      WHERE idproducto = ?
        AND numero_lote = ?
        AND deleted_at IS NULL
      LIMIT 1
    `;
    db.query(query, [idproducto, numero_lote], (err, results) => {
      if (err) return callback(err);
      callback(null, results.length > 0 ? results[0] : null);
    });
  },

  /**
   * Aumentar stock y cantidad_inicial de un lote existente (usado en compras adicionales al mismo lote)
   * @param {number} idlote - ID del lote
   * @param {number} cantidad - Cantidad a agregar
   * @param {Function} callback - Callback con (error, result)
   */
  aumentarStockYCantidadInicial: (idlote, cantidad, callback) => {
    const cantidadFloat = parseFloat(cantidad);

    const query = `
      UPDATE lotes_producto
      SET
        cantidad_inicial = cantidad_inicial + ?,
        stock_actual = stock_actual + ?,
        estado = CASE
          WHEN (stock_actual + ?) > 0 THEN 'disponible'
          ELSE estado
        END,
        updated_at = NOW()
      WHERE idlote = ?
    `;

    db.query(query, [cantidadFloat, cantidadFloat, cantidadFloat, idlote], callback);
  },

  /**
   * @deprecated Usar existeNumeroLoteParaProducto en su lugar
   * Verificar si existe un lote con el mismo número (global - ya no se usa)
   */
  existeNumeroLote: (numero_lote, callback) => {
    const query = `
      SELECT COUNT(*) as count
      FROM lotes_producto
      WHERE numero_lote = ?
        AND deleted_at IS NULL
    `;
    db.query(query, [numero_lote], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].count > 0);
    });
  },

  /**
   * Obtener stock total de un producto sumando todos sus lotes
   */
  getStockTotalProducto: (idproducto, callback) => {
    const query = `
      SELECT
        COALESCE(SUM(stock_actual), 0) as stock_total
      FROM lotes_producto
      WHERE idproducto = ?
        AND estado IN ('disponible', 'parcial')
        AND deleted_at IS NULL
    `;
    db.query(query, [idproducto], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].stock_total);
    });
  },

  /**
   * Soft delete de un lote
   */
  softDelete: (idlote, callback) => {
    const query = `
      UPDATE lotes_producto
      SET deleted_at = NOW()
      WHERE idlote = ?
    `;
    db.query(query, [idlote], callback);
  },

  /**
   * Actualizar ubicación de un lote
   */
  updateUbicacion: (idlote, ubicacion, callback) => {
    const query = `
      UPDATE lotes_producto
      SET
        ubicacion_almacen = ?,
        updated_at = NOW()
      WHERE idlote = ?
    `;
    db.query(query, [ubicacion, idlote], callback);
  },

  /**
   * Bloquear/Desbloquear lote
   */
  cambiarEstado: (idlote, nuevoEstado, callback) => {
    const query = `
      UPDATE lotes_producto
      SET
        estado = ?,
        updated_at = NOW()
      WHERE idlote = ?
    `;
    db.query(query, [nuevoEstado, idlote], callback);
  },

  /**
   * Aumentar stock de un lote existente (usado en compras)
   * Nota: ajusta el estado para evitar lotes con stock > 0 en estado "agotado".
   */
  aumentarStock: (idlote, cantidad, callback) => {
    const cantidadFloat = parseFloat(cantidad);

    const query = `
      UPDATE lotes_producto
      SET
        stock_actual = stock_actual + ?,
        cantidad_inicial = cantidad_inicial + ?,
        estado = CASE
          WHEN (stock_actual + ?) <= 0 THEN 'agotado'
          WHEN (stock_actual + ?) < (cantidad_inicial + ?) THEN 'parcial'
          ELSE 'disponible'
        END,
        updated_at = NOW()
      WHERE idlote = ?
        AND deleted_at IS NULL
    `;
    db.query(
      query,
      [
        cantidadFloat,
        cantidadFloat,
        cantidadFloat,
        cantidadFloat,
        cantidadFloat,
        idlote
      ],
      callback
    );
  },

  /**
   * Actualizar campos específicos de productos tipo CAJA en un lote
   */
  actualizarCamposCaja: (idlote, datos, callback) => {
    const { cant_p_caja, cant_cajas, precio_compra_caja } = datos;

    const query = `
      UPDATE lotes_producto
      SET
        cant_p_caja = ?,
        cant_cajas = COALESCE(cant_cajas, 0) + ?,
        precio_compra_caja = ?,
        updated_at = NOW()
      WHERE idlote = ?
        AND deleted_at IS NULL
    `;
    db.query(query, [cant_p_caja, cant_cajas, precio_compra_caja, idlote], callback);
  }
};

export default LoteProducto;
