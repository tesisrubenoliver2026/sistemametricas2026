import db from '../../db.js';

const Amonestacion = {
  create: (data, callback) => {
    const query = `
      INSERT INTO amonestaciones (
        idempleado, fecha, tipo, motivo, usuario_id, created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      data.idempleado,
      data.fecha,
      data.tipo,
      data.motivo || null,
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
      SELECT a.*, e.nombre, e.apellido, e.cedula
      FROM amonestaciones a
      INNER JOIN empleados e ON e.idempleado = a.idempleado
      WHERE a.usuario_id = ?
        AND a.fecha BETWEEN ? AND ?
        AND (
          a.tipo LIKE ? OR
          COALESCE(a.motivo, '') LIKE ? OR
          DATE_FORMAT(a.fecha, '%Y-%m-%d') LIKE ? OR
          COALESCE(e.nombre, '') LIKE ? OR
          COALESCE(e.apellido, '') LIKE ? OR
          COALESCE(e.cedula, '') LIKE ?
        )
        AND COALESCE(e.nombre, '') LIKE ?
        AND COALESCE(e.cedula, '') LIKE ?
      ORDER BY a.fecha DESC, a.idamonestacion DESC
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
      FROM amonestaciones a
      INNER JOIN empleados e ON e.idempleado = a.idempleado
      WHERE a.usuario_id = ?
        AND a.fecha BETWEEN ? AND ?
        AND (
          a.tipo LIKE ? OR
          COALESCE(a.motivo, '') LIKE ? OR
          DATE_FORMAT(a.fecha, '%Y-%m-%d') LIKE ? OR
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
      SELECT a.*, e.nombre, e.apellido, e.cedula
      FROM amonestaciones a
      INNER JOIN empleados e ON e.idempleado = a.idempleado
      WHERE a.usuario_id = ?
        AND a.idempleado = ?
        AND a.fecha BETWEEN ? AND ?
        AND (
          a.tipo LIKE ? OR
          COALESCE(a.motivo, '') LIKE ? OR
          DATE_FORMAT(a.fecha, '%Y-%m-%d') LIKE ?
        )
      ORDER BY a.fecha DESC, a.idamonestacion DESC
      LIMIT ? OFFSET ?
    `;
    db.query(
      query,
      [usuarioId, idempleado, fechaInicio, fechaFin, searchTerm, searchTerm, searchTerm, limit, offset],
      callback
    );
  },

  countFiltered: (usuarioId, idempleado, fechaInicio, fechaFin, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT COUNT(*) AS total
      FROM amonestaciones a
      WHERE a.usuario_id = ?
        AND a.idempleado = ?
        AND a.fecha BETWEEN ? AND ?
        AND (
          a.tipo LIKE ? OR
          COALESCE(a.motivo, '') LIKE ? OR
          DATE_FORMAT(a.fecha, '%Y-%m-%d') LIKE ?
        )
    `;
    db.query(
      query,
      [usuarioId, idempleado, fechaInicio, fechaFin, searchTerm, searchTerm, searchTerm],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0].total);
      }
    );
  },

  findById: (usuarioId, idamonestacion, callback) => {
    const query = `SELECT * FROM amonestaciones WHERE usuario_id = ? AND idamonestacion = ? LIMIT 1`;
    db.query(query, [usuarioId, idamonestacion], callback);
  },

  update: (idamonestacion, data, callback) => {
    const query = `
      UPDATE amonestaciones
      SET
        fecha = ?,
        tipo = ?,
        motivo = ?
      WHERE idamonestacion = ?
    `;
    const values = [
      data.fecha,
      data.tipo,
      data.motivo || null,
      idamonestacion
    ];
    db.query(query, values, callback);
  },

  delete: (idamonestacion, callback) => {
    const query = `DELETE FROM amonestaciones WHERE idamonestacion = ?`;
    db.query(query, [idamonestacion], callback);
  }
};

export default Amonestacion;
