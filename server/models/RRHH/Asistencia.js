import db from '../../db.js';

const Asistencia = {
  create: (data, callback) => {
    const query = `
      INSERT INTO asistencias (
        idempleado, fecha, hora_entrada, hora_salida, estado, observacion, usuario_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      data.idempleado,
      data.fecha,
      data.hora_entrada || null,
      data.hora_salida || null,
      data.estado || 'Presente',
      data.observacion || null,
      data.usuario_id
    ];
    db.query(query, values, callback);
  },

  createOrUpdateByFecha: (data, callback) => {
    const query = `
      INSERT INTO asistencias (
        idempleado, fecha, hora_entrada, hora_salida, estado, observacion, usuario_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        hora_entrada = VALUES(hora_entrada),
        hora_salida = VALUES(hora_salida),
        estado = VALUES(estado),
        observacion = VALUES(observacion),
        usuario_id = VALUES(usuario_id)
    `;
    const values = [
      data.idempleado,
      data.fecha,
      data.hora_entrada || null,
      data.hora_salida || null,
      data.estado || 'Presente',
      data.observacion || null,
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
      FROM asistencias a
      INNER JOIN empleados e ON e.idempleado = a.idempleado
      WHERE a.usuario_id = ?
        AND a.fecha BETWEEN ? AND ?
        AND (
          a.estado LIKE ? OR
          COALESCE(a.observacion, '') LIKE ? OR
          DATE_FORMAT(a.fecha, '%Y-%m-%d') LIKE ? OR
          COALESCE(a.hora_entrada, '') LIKE ? OR
          COALESCE(a.hora_salida, '') LIKE ? OR
          COALESCE(e.nombre, '') LIKE ? OR
          COALESCE(e.apellido, '') LIKE ? OR
          COALESCE(e.cedula, '') LIKE ?
        )
        AND COALESCE(e.nombre, '') LIKE ?
        AND COALESCE(e.cedula, '') LIKE ?
      ORDER BY a.fecha DESC, a.idasistencia DESC
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
      FROM asistencias a
      INNER JOIN empleados e ON e.idempleado = a.idempleado
      WHERE a.usuario_id = ?
        AND a.fecha BETWEEN ? AND ?
        AND (
          a.estado LIKE ? OR
          COALESCE(a.observacion, '') LIKE ? OR
          DATE_FORMAT(a.fecha, '%Y-%m-%d') LIKE ? OR
          COALESCE(a.hora_entrada, '') LIKE ? OR
          COALESCE(a.hora_salida, '') LIKE ? OR
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
      SELECT a.*, e.nombre, e.apellido, e.cedula
      FROM asistencias a
      INNER JOIN empleados e ON e.idempleado = a.idempleado
      WHERE a.usuario_id = ?
        AND a.idempleado = ?
        AND a.fecha BETWEEN ? AND ?
        AND (
          a.estado LIKE ? OR
          COALESCE(a.observacion, '') LIKE ? OR
          DATE_FORMAT(a.fecha, '%Y-%m-%d') LIKE ? OR
          COALESCE(a.hora_entrada, '') LIKE ? OR
          COALESCE(a.hora_salida, '') LIKE ?
        )
      ORDER BY a.fecha DESC, a.idasistencia DESC
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
      FROM asistencias a
      WHERE a.usuario_id = ?
        AND a.idempleado = ?
        AND a.fecha BETWEEN ? AND ?
        AND (
          a.estado LIKE ? OR
          COALESCE(a.observacion, '') LIKE ? OR
          DATE_FORMAT(a.fecha, '%Y-%m-%d') LIKE ? OR
          COALESCE(a.hora_entrada, '') LIKE ? OR
          COALESCE(a.hora_salida, '') LIKE ?
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

  findById: (usuarioId, idasistencia, callback) => {
    const query = `SELECT * FROM asistencias WHERE usuario_id = ? AND idasistencia = ? LIMIT 1`;
    db.query(query, [usuarioId, idasistencia], callback);
  },

  update: (idasistencia, data, callback) => {
    const query = `
      UPDATE asistencias
      SET
        hora_entrada = ?,
        hora_salida = ?,
        estado = ?,
        observacion = ?
      WHERE idasistencia = ?
    `;
    const values = [
      data.hora_entrada || null,
      data.hora_salida || null,
      data.estado || 'Presente',
      data.observacion || null,
      idasistencia
    ];
    db.query(query, values, callback);
  },

  delete: (idasistencia, callback) => {
    const query = `DELETE FROM asistencias WHERE idasistencia = ?`;
    db.query(query, [idasistencia], callback);
  }
};

export default Asistencia;
