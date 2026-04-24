import db from '../../db.js';

const HoraExtra = {
  create: (data, callback) => {
    const query = `
      INSERT INTO horas_extras (
        idempleado, fecha, cantidad_horas, tipo, aprobado_por, observacion, usuario_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      data.idempleado,
      data.fecha,
      data.cantidad_horas,
      data.tipo,
      data.aprobado_por || null,
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
      SELECT h.*, e.nombre, e.apellido, e.cedula
      FROM horas_extras h
      INNER JOIN empleados e ON e.idempleado = h.idempleado
      WHERE h.usuario_id = ?
        AND h.fecha BETWEEN ? AND ?
        AND (
          h.tipo LIKE ? OR
          COALESCE(h.aprobado_por, '') LIKE ? OR
          COALESCE(h.observacion, '') LIKE ? OR
          CAST(h.cantidad_horas AS CHAR) LIKE ? OR
          DATE_FORMAT(h.fecha, '%Y-%m-%d') LIKE ? OR
          COALESCE(e.nombre, '') LIKE ? OR
          COALESCE(e.apellido, '') LIKE ? OR
          COALESCE(e.cedula, '') LIKE ?
        )
        AND COALESCE(e.nombre, '') LIKE ?
        AND COALESCE(e.cedula, '') LIKE ?
      ORDER BY h.fecha DESC, h.idhextra DESC
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
      FROM horas_extras h
      INNER JOIN empleados e ON e.idempleado = h.idempleado
      WHERE h.usuario_id = ?
        AND h.fecha BETWEEN ? AND ?
        AND (
          h.tipo LIKE ? OR
          COALESCE(h.aprobado_por, '') LIKE ? OR
          COALESCE(h.observacion, '') LIKE ? OR
          CAST(h.cantidad_horas AS CHAR) LIKE ? OR
          DATE_FORMAT(h.fecha, '%Y-%m-%d') LIKE ? OR
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
      SELECT h.*, e.nombre, e.apellido, e.cedula
      FROM horas_extras h
      INNER JOIN empleados e ON e.idempleado = h.idempleado
      WHERE h.usuario_id = ?
        AND h.idempleado = ?
        AND h.fecha BETWEEN ? AND ?
        AND (
          h.tipo LIKE ? OR
          COALESCE(h.aprobado_por, '') LIKE ? OR
          COALESCE(h.observacion, '') LIKE ? OR
          CAST(h.cantidad_horas AS CHAR) LIKE ? OR
          DATE_FORMAT(h.fecha, '%Y-%m-%d') LIKE ?
        )
      ORDER BY h.fecha DESC, h.idhextra DESC
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
      FROM horas_extras h
      WHERE h.usuario_id = ?
        AND h.idempleado = ?
        AND h.fecha BETWEEN ? AND ?
        AND (
          h.tipo LIKE ? OR
          COALESCE(h.aprobado_por, '') LIKE ? OR
          COALESCE(h.observacion, '') LIKE ? OR
          CAST(h.cantidad_horas AS CHAR) LIKE ? OR
          DATE_FORMAT(h.fecha, '%Y-%m-%d') LIKE ?
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

  findById: (usuarioId, idhextra, callback) => {
    const query = `SELECT * FROM horas_extras WHERE usuario_id = ? AND idhextra = ? LIMIT 1`;
    db.query(query, [usuarioId, idhextra], callback);
  },

  update: (idhextra, data, callback) => {
    const query = `
      UPDATE horas_extras
      SET
        fecha = ?,
        cantidad_horas = ?,
        tipo = ?,
        aprobado_por = ?,
        observacion = ?
      WHERE idhextra = ?
    `;
    const values = [
      data.fecha,
      data.cantidad_horas,
      data.tipo,
      data.aprobado_por || null,
      data.observacion || null,
      idhextra
    ];
    db.query(query, values, callback);
  },

  delete: (idhextra, callback) => {
    const query = `DELETE FROM horas_extras WHERE idhextra = ?`;
    db.query(query, [idhextra], callback);
  }
};

export default HoraExtra;
