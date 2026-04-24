import db from '../../db.js';

const DetalleLiquidacion = {
  create: (data, callback) => {
    const query = `
      INSERT INTO detalle_liquidacion (
        idliquidacion, concepto, tipo, monto
      ) VALUES (?, ?, ?, ?)
    `;
    const values = [
      data.idliquidacion,
      data.concepto,
      data.tipo,
      data.monto
    ];
    db.query(query, values, callback);
  },

  findAllPaginatedFiltered: (idliquidacion, limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT *
      FROM detalle_liquidacion
      WHERE idliquidacion = ?
        AND (
          concepto LIKE ? OR
          tipo LIKE ? OR
          CAST(monto AS CHAR) LIKE ?
        )
      ORDER BY iddetalle ASC
      LIMIT ? OFFSET ?
    `;
    db.query(query, [idliquidacion, searchTerm, searchTerm, searchTerm, limit, offset], callback);
  },

  countFiltered: (idliquidacion, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT COUNT(*) AS total
      FROM detalle_liquidacion
      WHERE idliquidacion = ?
        AND (
          concepto LIKE ? OR
          tipo LIKE ? OR
          CAST(monto AS CHAR) LIKE ?
        )
    `;
    db.query(query, [idliquidacion, searchTerm, searchTerm, searchTerm], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  findById: (iddetalle, callback) => {
    const query = `
      SELECT *
      FROM detalle_liquidacion
      WHERE iddetalle = ?
      LIMIT 1
    `;
    db.query(query, [iddetalle], callback);
  },

  update: (iddetalle, data, callback) => {
    const query = `
      UPDATE detalle_liquidacion
      SET
        concepto = ?,
        tipo = ?,
        monto = ?
      WHERE iddetalle = ?
    `;
    const values = [
      data.concepto,
      data.tipo,
      data.monto,
      iddetalle
    ];
    db.query(query, values, callback);
  },

  deleteByLiquidacion: (idliquidacion, callback) => {
    const query = `DELETE FROM detalle_liquidacion WHERE idliquidacion = ?`;
    db.query(query, [idliquidacion], callback);
  },

  delete: (iddetalle, callback) => {
    const query = `DELETE FROM detalle_liquidacion WHERE iddetalle = ?`;
    db.query(query, [iddetalle], callback);
  }
};

export default DetalleLiquidacion;
