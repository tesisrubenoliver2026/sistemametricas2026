import db from '../../db.js';

const Salario = {
  create: (data, callback) => {
    const query = `
      INSERT INTO salarios (
        idempleado, salario_base, fecha_inicio, fecha_fin, motivo, usuario_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      data.idempleado,
      data.salario_base,
      data.fecha_inicio,
      data.fecha_fin || null,
      data.motivo || null,
      data.usuario_id
    ];
    db.query(query, values, callback);
  },

  findAllPaginatedFilteredGlobal: (usuarioId, limit, offset, search, nombre, documento, callback) => {
    const searchTerm = `%${search}%`;
    const nombreTerm = `%${nombre}%`;
    const documentoTerm = `%${documento}%`;
    const query = `
      SELECT s.*, e.nombre, e.apellido, e.cedula
      FROM salarios s
      INNER JOIN empleados e ON e.idempleado = s.idempleado
      WHERE s.usuario_id = ?
        AND (
        COALESCE(s.motivo, '') LIKE ? OR
        CAST(s.salario_base AS CHAR) LIKE ? OR
        DATE_FORMAT(s.fecha_inicio, '%Y-%m-%d') LIKE ? OR
        DATE_FORMAT(COALESCE(s.fecha_fin, '9999-12-31'), '%Y-%m-%d') LIKE ? OR
        COALESCE(e.nombre, '') LIKE ? OR
        COALESCE(e.apellido, '') LIKE ? OR
        COALESCE(e.cedula, '') LIKE ?
      )
        AND COALESCE(e.nombre, '') LIKE ?
        AND COALESCE(e.cedula, '') LIKE ?
      ORDER BY s.fecha_inicio DESC, s.idsalario DESC
      LIMIT ? OFFSET ?
    `;
    db.query(
      query,
      [
        usuarioId,
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

  countFilteredGlobal: (usuarioId, search, nombre, documento, callback) => {
    const searchTerm = `%${search}%`;
    const nombreTerm = `%${nombre}%`;
    const documentoTerm = `%${documento}%`;
    const query = `
      SELECT COUNT(*) AS total
      FROM salarios s
      INNER JOIN empleados e ON e.idempleado = s.idempleado
      WHERE s.usuario_id = ?
        AND (
        COALESCE(s.motivo, '') LIKE ? OR
        CAST(s.salario_base AS CHAR) LIKE ? OR
        DATE_FORMAT(s.fecha_inicio, '%Y-%m-%d') LIKE ? OR
        DATE_FORMAT(COALESCE(s.fecha_fin, '9999-12-31'), '%Y-%m-%d') LIKE ? OR
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

  findAllPaginatedFiltered: (usuarioId, idempleado, limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT s.*, e.nombre, e.apellido, e.cedula
      FROM salarios s
      INNER JOIN empleados e ON e.idempleado = s.idempleado
      WHERE s.usuario_id = ?
        AND s.idempleado = ?
        AND (
          COALESCE(s.motivo, '') LIKE ? OR
          CAST(s.salario_base AS CHAR) LIKE ? OR
          DATE_FORMAT(s.fecha_inicio, '%Y-%m-%d') LIKE ? OR
          DATE_FORMAT(COALESCE(s.fecha_fin, '9999-12-31'), '%Y-%m-%d') LIKE ?
        )
      ORDER BY s.fecha_inicio DESC, s.idsalario DESC
      LIMIT ? OFFSET ?
    `;
    db.query(
      query,
      [usuarioId, idempleado, searchTerm, searchTerm, searchTerm, searchTerm, limit, offset],
      callback
    );
  },

  countFiltered: (usuarioId, idempleado, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT COUNT(*) AS total
      FROM salarios s
      WHERE s.usuario_id = ?
        AND s.idempleado = ?
        AND (
          COALESCE(s.motivo, '') LIKE ? OR
          CAST(s.salario_base AS CHAR) LIKE ? OR
          DATE_FORMAT(s.fecha_inicio, '%Y-%m-%d') LIKE ? OR
          DATE_FORMAT(COALESCE(s.fecha_fin, '9999-12-31'), '%Y-%m-%d') LIKE ?
        )
    `;
    db.query(
      query,
      [usuarioId, idempleado, searchTerm, searchTerm, searchTerm, searchTerm],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0].total);
      }
    );
  },

  getVigenteByEmpleado: (usuarioId, idempleado, callback) => {
    const query = `
      SELECT *
      FROM salarios
      WHERE usuario_id = ? AND idempleado = ? AND fecha_fin IS NULL
      ORDER BY fecha_inicio DESC, idsalario DESC
      LIMIT 1
    `;
    db.query(query, [usuarioId, idempleado], callback);
  },

  closeVigente: (idempleado, fecha_fin, callback) => {
    const query = `
      UPDATE salarios
      SET fecha_fin = ?
      WHERE idempleado = ? AND fecha_fin IS NULL
    `;
    db.query(query, [fecha_fin, idempleado], callback);
  },

  findById: (usuarioId, idsalario, callback) => {
    const query = `SELECT * FROM salarios WHERE usuario_id = ? AND idsalario = ? LIMIT 1`;
    db.query(query, [usuarioId, idsalario], callback);
  },

  update: (idsalario, data, callback) => {
    const query = `
      UPDATE salarios
      SET
        salario_base = ?,
        fecha_inicio = ?,
        fecha_fin = ?,
        motivo = ?
      WHERE idsalario = ?
    `;
    const values = [
      data.salario_base,
      data.fecha_inicio,
      data.fecha_fin || null,
      data.motivo || null,
      idsalario
    ];
    db.query(query, values, callback);
  },

  delete: (idsalario, callback) => {
    const query = `DELETE FROM salarios WHERE idsalario = ?`;
    db.query(query, [idsalario], callback);
  }
};

export default Salario;
