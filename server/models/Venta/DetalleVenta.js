// src/models/Venta/DetalleVenta.js
import db from '../../db.js';

const DetalleVenta = {
  create: (data, callback) => {
    const query = `
      INSERT INTO detalle_venta (
        idventa,
        idproducto,
        nombre_producto,
        cantidad,
        precio_venta,
        precio_compra,
        ganancia,
        sub_total,
        iddetalle_compra,
        descuento,
        unidad_medida,
        precio_venta_caja,
        cant_p_caja,
        cant_cajas_vender,
        cant_unidades_sueltas,
        idlote,
        numero_lote
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.idventa,
      data.idproducto,
      data.nombre_producto,
      data.cantidad,
      data.precio_venta,
      data.precio_compra,
      data.ganancia,
      data.sub_total,
      data.iddetalle_compra || null,
      data.descuento || 0,
      data.unidad_medida || null,
      data.precio_venta_caja || null,
      data.cant_p_caja || null,
      data.cant_cajas_vender || null,
      data.cant_unidades_sueltas || null,
      data.idlote || null,
      data.numero_lote || null
    ];

    db.query(query, values, callback);
  },

  findByVentaMultiple: (ids, callback) => {
    const query = `
      SELECT
        iddetalle, idproducto, idventa,
        cantidad, precio_compra, precio_venta, sub_total,
        nombre_producto, iva5, iva10, iddetalle_compra, ganancia, descuento,
        unidad_medida, precio_venta_caja, cant_p_caja, cant_cajas_vender, cant_unidades_sueltas,
        idlote
      FROM detalle_venta
      WHERE idventa IN (?)
    `;
    db.query(query, [ids], callback);
  },

  getProductosMasVendidos: (limit = 10, callback) => {
    const query = `
    SELECT 
      dv.idproducto,
      dv.nombre_producto,
      SUM(dv.cantidad) AS total_vendido,
      SUM(dv.descuento) AS total_descuentos,
      SUM(dv.cant_cajas_vender) AS total_cajas_vendidas,
      SUM(dv.cant_unidades_sueltas) AS total_unidades_sueltas,
      p.precio_venta,
      cat.categoria AS categoria,
      p.ubicacion AS imagen
    FROM detalle_venta dv
    JOIN productos p ON dv.idproducto = p.idproducto
    LEFT JOIN categorias cat ON p.idcategoria = cat.idcategorias
    WHERE dv.deleted_at IS NULL
    GROUP BY dv.idproducto, dv.nombre_producto, p.precio_venta, cat.categoria, p.ubicacion
    ORDER BY total_vendido DESC
    LIMIT ?
  `;
    db.query(query, [limit], callback);
  },

  findByVentaId: (idventa, callback) => {
    const query = `
      SELECT
        dv.iddetalle,
        dv.idventa,
        dv.idproducto,
        dv.cantidad,
        dv.precio_venta,
        dv.precio_compra,
        dv.ganancia,
        dv.descuento,
        dv.iva5,
        dv.iva10,
        dv.iddetalle_compra,
        dv.sub_total,
        dv.unidad_medida,
        dv.precio_venta_caja,
        dv.cant_p_caja,
        dv.cant_cajas_vender,
        dv.cant_unidades_sueltas,
        dv.idlote,
        p.nombre_producto AS nombre_producto,
        l.numero_lote,
        l.fecha_vencimiento as fecha_vencimiento_lote
      FROM detalle_venta dv
      LEFT JOIN productos p ON dv.idproducto = p.idproducto
      LEFT JOIN lotes_producto l ON dv.idlote = l.idlote
      WHERE dv.idventa = ?
        AND dv.deleted_at IS NULL
    `;
    db.query(query, [idventa], callback);
  },

  findByVenta: (idventa, callback) => {
    const query = `
      SELECT
        idproducto, cantidad, descuento,
        unidad_medida, cant_cajas_vender, cant_unidades_sueltas
      FROM detalle_venta
      WHERE idventa = ?
    `;
    db.query(query, [idventa], callback);
  },

  // ========== MÉTODOS V2 CON FILTRO POR USUARIO ==========

  getProductosMasVendidosByUser: (limit = 10, idusuarios, idfuncionariosIds, callback) => {
    // Construir condición dinámica basada en qué ID está presente
    let userCondition = '';
    const params = [];

    if (idusuarios && !idfuncionariosIds) {
      // Solo administrador (sin funcionarios relacionados)
      userCondition = 'AND v.idusuarios = ?';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      // Solo funcionario
      userCondition = 'AND v.idfuncionario IN (?)';
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      // Administrador con funcionarios relacionados
      userCondition = 'AND (v.idusuarios = ? OR v.idfuncionario IN (?))';
      params.push(idusuarios, idfuncionariosIds);
    }

    const query = `
      SELECT
        dv.idproducto,
        dv.nombre_producto,
        SUM(dv.cantidad) AS total_vendido,
        SUM(dv.descuento) AS total_descuentos,
        SUM(dv.cant_cajas_vender) AS total_cajas_vendidas,
        SUM(dv.cant_unidades_sueltas) AS total_unidades_sueltas,
        p.precio_venta,
        cat.categoria AS categoria,
        p.ubicacion AS imagen
      FROM detalle_venta dv
      JOIN ventas v ON dv.idventa = v.idventa
      JOIN productos p ON dv.idproducto = p.idproducto
      LEFT JOIN categorias cat ON p.idcategoria = cat.idcategorias
      WHERE dv.deleted_at IS NULL
        AND v.deleted_at IS NULL
        ${userCondition}
      GROUP BY dv.idproducto, dv.nombre_producto, p.precio_venta, cat.categoria, p.ubicacion
      ORDER BY total_vendido DESC
      LIMIT ?
    `;

    params.push(limit);
    db.query(query, params, callback);
  },

  /**
   * Anular (soft delete) detalles de venta por ID de venta
   */
  softDeleteByVenta: (idventa, callback) => {
    const query = `
      UPDATE detalle_venta
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE idventa = ? AND deleted_at IS NULL
    `;
    db.query(query, [idventa], callback);
  }

};

export default DetalleVenta;