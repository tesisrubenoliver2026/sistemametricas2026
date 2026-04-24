import db from '../../db.js';

const Comision = {
  create: (data, callback) => {
    const query = `
      INSERT INTO comisiones (
        idempleado, fecha, monto_venta, porcentaje, monto_comision, referencia, usuario_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      data.idempleado,
      data.fecha,
      data.monto_venta,
      data.porcentaje,
      data.monto_comision,
      data.referencia || null,
      data.usuario_id
    ];
    db.query(query, values, callback);
  },

  findAllPaginatedFilteredGlobal: (
    usuarioId,
    fechaInicio,
    fechaFin,
    limit,
    offset,
    search,
    nombre,
    documento,
    callback
  ) => {
    const searchTerm = `%${search}%`;
    const nombreTerm = `%${nombre}%`;
    const documentoTerm = `%${documento}%`;
    const query = `
      SELECT c.*, e.nombre, e.apellido, e.cedula
      FROM comisiones c
      INNER JOIN empleados e ON e.idempleado = c.idempleado
      WHERE c.usuario_id = ?
        AND c.fecha BETWEEN ? AND ?
        AND (
          COALESCE(c.referencia, '') LIKE ? OR
          CAST(c.monto_venta AS CHAR) LIKE ? OR
          CAST(c.porcentaje AS CHAR) LIKE ? OR
          CAST(c.monto_comision AS CHAR) LIKE ? OR
          DATE_FORMAT(c.fecha, '%Y-%m-%d') LIKE ? OR
          COALESCE(e.nombre, '') LIKE ? OR
          COALESCE(e.apellido, '') LIKE ? OR
          COALESCE(e.cedula, '') LIKE ?
        )
        AND COALESCE(e.nombre, '') LIKE ?
        AND COALESCE(e.cedula, '') LIKE ?
      ORDER BY c.fecha DESC, c.idcomision DESC
      LIMIT ? OFFSET ?
    `;
    db.query(
      query,
      [
        usuarioId,
        fechaInicio,
        fechaFin,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        nombreTerm,
        documentoTerm,
        limit,
        offset
      ],
      callback
    );
  },

  countFilteredGlobal: (usuarioId, fechaInicio, fechaFin, search, nombre, documento, callback) => {
    const searchTerm = `%${search}%`;
    const nombreTerm = `%${nombre}%`;
    const documentoTerm = `%${documento}%`;
    const query = `
      SELECT COUNT(*) AS total
      FROM comisiones c
      INNER JOIN empleados e ON e.idempleado = c.idempleado
      WHERE c.usuario_id = ?
        AND c.fecha BETWEEN ? AND ?
        AND (
          COALESCE(c.referencia, '') LIKE ? OR
          CAST(c.monto_venta AS CHAR) LIKE ? OR
          CAST(c.porcentaje AS CHAR) LIKE ? OR
          CAST(c.monto_comision AS CHAR) LIKE ? OR
          DATE_FORMAT(c.fecha, '%Y-%m-%d') LIKE ? OR
          COALESCE(e.nombre, '') LIKE ? OR
          COALESCE(e.apellido, '') LIKE ? OR
          COALESCE(e.cedula, '') LIKE ?
        )
        AND COALESCE(e.nombre, '') LIKE ?
        AND COALESCE(e.cedula, '') LIKE ?
    `;
    db.query(
      query,
      [
        usuarioId,
        fechaInicio,
        fechaFin,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        nombreTerm,
        documentoTerm
      ],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0].total);
      }
    );
  },

  findAllPaginatedFiltered: (usuarioId, idempleado, fechaInicio, fechaFin, limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT c.*, e.nombre, e.apellido, e.cedula
      FROM comisiones c
      INNER JOIN empleados e ON e.idempleado = c.idempleado
      WHERE c.usuario_id = ?
        AND c.idempleado = ?
        AND c.fecha BETWEEN ? AND ?
        AND (
          COALESCE(c.referencia, '') LIKE ? OR
          CAST(c.monto_venta AS CHAR) LIKE ? OR
          CAST(c.porcentaje AS CHAR) LIKE ? OR
          CAST(c.monto_comision AS CHAR) LIKE ? OR
          DATE_FORMAT(c.fecha, '%Y-%m-%d') LIKE ?
        )
      ORDER BY c.fecha DESC, c.idcomision DESC
      LIMIT ? OFFSET ?
    `;
    db.query(
      query,
      [usuarioId, idempleado, fechaInicio, fechaFin, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit, offset],
      callback
    );
  },

  countFiltered: (usuarioId, idempleado, fechaInicio, fechaFin, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT COUNT(*) AS total
      FROM comisiones c
      WHERE c.usuario_id = ?
        AND c.idempleado = ?
        AND c.fecha BETWEEN ? AND ?
        AND (
          COALESCE(c.referencia, '') LIKE ? OR
          CAST(c.monto_venta AS CHAR) LIKE ? OR
          CAST(c.porcentaje AS CHAR) LIKE ? OR
          CAST(c.monto_comision AS CHAR) LIKE ? OR
          DATE_FORMAT(c.fecha, '%Y-%m-%d') LIKE ?
        )
    `;
    db.query(
      query,
      [usuarioId, idempleado, fechaInicio, fechaFin, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0].total);
      }
    );
  },

  findById: (usuarioId, idcomision, callback) => {
    const query = `SELECT * FROM comisiones WHERE usuario_id = ? AND idcomision = ? LIMIT 1`;
    db.query(query, [usuarioId, idcomision], callback);
  },

  update: (idcomision, data, callback) => {
    const query = `
      UPDATE comisiones
      SET
        fecha = ?,
        monto_venta = ?,
        porcentaje = ?,
        monto_comision = ?,
        referencia = ?
      WHERE idcomision = ?
    `;
    const values = [
      data.fecha,
      data.monto_venta,
      data.porcentaje,
      data.monto_comision,
      data.referencia || null,
      idcomision
    ];
    db.query(query, values, callback);
  },

  delete: (idcomision, callback) => {
    const query = `DELETE FROM comisiones WHERE idcomision = ?`;
    db.query(query, [idcomision], callback);
  }
};

export default Comision;
