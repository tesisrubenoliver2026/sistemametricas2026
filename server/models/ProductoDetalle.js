// models/ProductoDetalle.js
import db from '../db.js';

const ProductoDetalle = {
  /**
   * Crear un nuevo detalle de producto
   */
  create: (data, callback) => {
    const sql = `
      INSERT INTO producto_detalle (idproducto, atributo, valor, cantidad)
      VALUES (?, ?, ?, ?)
    `;
    db.query(
      sql,
      [data.idproducto, data.atributo, data.valor, data.cantidad || 1],
      callback
    );
  },

  /**
   * Obtener todos los detalles de un producto
   */
  findByProducto: (idproducto, callback) => {
    const sql = `
      SELECT
        iddetalle,
        idproducto,
        atributo,
        valor,
        cantidad,
        created_at,
        updated_at
      FROM producto_detalle
      WHERE idproducto = ? AND deleted_at IS NULL
      ORDER BY atributo, valor
    `;
    db.query(sql, [idproducto], callback);
  },

  /**
   * Actualizar un detalle
   */
  update: (iddetalle, data, callback) => {
    const sql = `
      UPDATE producto_detalle
      SET atributo = ?, valor = ?, cantidad = ?
      WHERE iddetalle = ? AND deleted_at IS NULL
    `;
    db.query(
      sql,
      [data.atributo, data.valor, data.cantidad, iddetalle],
      callback
    );
  },

  /**
   * Eliminar (soft delete) un detalle
   */
  delete: (iddetalle, callback) => {
    const sql = `
      UPDATE producto_detalle
      SET deleted_at = NOW()
      WHERE iddetalle = ?
    `;
    db.query(sql, [iddetalle], callback);
  },

  /**
   * Eliminar todos los detalles de un producto
   */
  deleteByProducto: (idproducto, callback) => {
    const sql = `
      UPDATE producto_detalle
      SET deleted_at = NOW()
      WHERE idproducto = ? AND deleted_at IS NULL
    `;
    db.query(sql, [idproducto], callback);
  },

  /**
   * Guardar múltiples detalles (reemplaza los existentes)
   */
  replaceAll: (idproducto, detalles, callback) => {
    // Primero eliminar todos los detalles existentes
    ProductoDetalle.deleteByProducto(idproducto, (err) => {
      if (err) return callback(err);

      // Si no hay detalles nuevos, terminar
      if (!detalles || detalles.length === 0) {
        return callback(null, { message: 'Detalles eliminados' });
      }

      // Insertar los nuevos detalles
      let insertados = 0;
      let errores = [];

      detalles.forEach((detalle) => {
        ProductoDetalle.create(
          {
            idproducto,
            atributo: detalle.atributo,
            valor: detalle.valor,
            cantidad: detalle.cantidad || 1
          },
          (errInsert) => {
            if (errInsert) {
              errores.push(errInsert);
            }
            insertados++;

            if (insertados === detalles.length) {
              if (errores.length > 0) {
                return callback(errores[0]);
              }
              callback(null, { message: 'Detalles guardados correctamente' });
            }
          }
        );
      });
    });
  }
};

export default ProductoDetalle;
