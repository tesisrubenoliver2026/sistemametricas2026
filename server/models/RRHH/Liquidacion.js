import db from '../../db.js';

const Liquidacion = {
  create: (data, callback) => {
    const query = `
      INSERT INTO liquidaciones (
        idempleado, fecha_inicio, fecha_fin, tipo, salario_base,
        total_horas_extras, total_comisiones, total_bonos, total_descuentos,
        total_ips, total_a_cobrar, estado, usuario_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      data.idempleado,
      data.fecha_inicio,
      data.fecha_fin,
      data.tipo || 'Normal',
      data.salario_base ?? 0,
      data.total_horas_extras ?? 0,
      data.total_comisiones ?? 0,
      data.total_bonos ?? 0,
      data.total_descuentos ?? 0,
      data.total_ips ?? 0,
      data.total_a_cobrar ?? 0,
      data.estado || 'Pendiente',
      data.usuario_id
    ];
    db.query(query, values, callback);
  },

  findAllPaginatedFiltered: (usuarioId, idempleado, limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT l.*, e.nombre, e.apellido, e.cedula
      FROM liquidaciones l
      INNER JOIN empleados e ON e.idempleado = l.idempleado
      WHERE l.usuario_id = ?
        AND l.idempleado = ?
        AND (
          l.tipo LIKE ? OR
          l.estado LIKE ? OR
          CAST(l.total_a_cobrar AS CHAR) LIKE ? OR
          DATE_FORMAT(l.fecha_inicio, '%Y-%m-%d') LIKE ? OR
          DATE_FORMAT(l.fecha_fin, '%Y-%m-%d') LIKE ?
        )
      ORDER BY l.fecha_fin DESC, l.idliquidacion DESC
      LIMIT ? OFFSET ?
    `;
    db.query(
      query,
      [usuarioId, idempleado, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit, offset],
      callback
    );
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
    estado,
    callback,
  ) => {
    const searchTerm = `%${search}%`;
    const nombreTerm = `%${nombre}%`;
    const documentoTerm = `%${documento}%`;
    const estadoValue = estado && estado !== 'todos' ? estado : null;
    const query = `
      SELECT l.*, e.nombre, e.apellido, e.cedula
      FROM liquidaciones l
      INNER JOIN empleados e ON e.idempleado = l.idempleado
      WHERE l.usuario_id = ?
        AND DATE(l.fecha_fin) BETWEEN ? AND ?
        AND (? IS NULL OR l.estado = ?)
        AND (
          l.tipo LIKE ? OR
          l.estado LIKE ? OR
          CAST(l.total_a_cobrar AS CHAR) LIKE ? OR
          DATE_FORMAT(l.fecha_inicio, '%Y-%m-%d') LIKE ? OR
          DATE_FORMAT(l.fecha_fin, '%Y-%m-%d') LIKE ? OR
          COALESCE(e.nombre, '') LIKE ? OR
          COALESCE(e.apellido, '') LIKE ? OR
          COALESCE(e.cedula, '') LIKE ?
        )
        AND COALESCE(e.nombre, '') LIKE ?
        AND COALESCE(e.cedula, '') LIKE ?
      ORDER BY l.fecha_fin DESC, l.idliquidacion DESC
      LIMIT ? OFFSET ?
    `;
    db.query(
      query,
      [
        usuarioId,
        fechaInicio,
        fechaFin,
        estadoValue,
        estadoValue,
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
        offset,
      ],
      callback,
    );
  },

  countFilteredGlobal: (usuarioId, fechaInicio, fechaFin, search, nombre, documento, estado, callback) => {
    const searchTerm = `%${search}%`;
    const nombreTerm = `%${nombre}%`;
    const documentoTerm = `%${documento}%`;
    const estadoValue = estado && estado !== 'todos' ? estado : null;
    const query = `
      SELECT COUNT(*) AS total
      FROM liquidaciones l
      INNER JOIN empleados e ON e.idempleado = l.idempleado
      WHERE l.usuario_id = ?
        AND DATE(l.fecha_fin) BETWEEN ? AND ?
        AND (? IS NULL OR l.estado = ?)
        AND (
          l.tipo LIKE ? OR
          l.estado LIKE ? OR
          CAST(l.total_a_cobrar AS CHAR) LIKE ? OR
          DATE_FORMAT(l.fecha_inicio, '%Y-%m-%d') LIKE ? OR
          DATE_FORMAT(l.fecha_fin, '%Y-%m-%d') LIKE ? OR
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
        estadoValue,
        estadoValue,
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
      ],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0].total);
      },
    );
  },

  countFiltered: (usuarioId, idempleado, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT COUNT(*) AS total
      FROM liquidaciones l
      WHERE l.usuario_id = ?
        AND l.idempleado = ?
        AND (
          l.tipo LIKE ? OR
          l.estado LIKE ? OR
          CAST(l.total_a_cobrar AS CHAR) LIKE ? OR
          DATE_FORMAT(l.fecha_inicio, '%Y-%m-%d') LIKE ? OR
          DATE_FORMAT(l.fecha_fin, '%Y-%m-%d') LIKE ?
        )
    `;
    db.query(
      query,
      [usuarioId, idempleado, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0].total);
      }
    );
  },

  findById: (usuarioId, idliquidacion, callback) => {
    const query = `
      SELECT
        l.*,
        e.nombre,
        e.apellido,
        e.cedula
      FROM liquidaciones l
      INNER JOIN empleados e ON e.idempleado = l.idempleado
      WHERE l.usuario_id = ?
        AND l.idliquidacion = ?
      LIMIT 1
    `;
    db.query(query, [usuarioId, idliquidacion], callback);
  },

  updateTotales: (idliquidacion, data, callback) => {
    const query = `
      UPDATE liquidaciones
      SET
        salario_base = ?,
        total_horas_extras = ?,
        total_comisiones = ?,
        total_bonos = ?,
        total_descuentos = ?,
        total_ips = ?,
        total_a_cobrar = ?
      WHERE idliquidacion = ?
    `;
    const values = [
      data.salario_base ?? 0,
      data.total_horas_extras ?? 0,
      data.total_comisiones ?? 0,
      data.total_bonos ?? 0,
      data.total_descuentos ?? 0,
      data.total_ips ?? 0,
      data.total_a_cobrar ?? 0,
      idliquidacion
    ];
    db.query(query, values, callback);
  },

  updateEstado: (idliquidacion, estado, callback) => {
    const query = `
      UPDATE liquidaciones
      SET estado = ?
      WHERE idliquidacion = ?
    `;
    db.query(query, [estado, idliquidacion], callback);
  },

  delete: (idliquidacion, callback) => {
    const query = `DELETE FROM liquidaciones WHERE idliquidacion = ?`;
    db.query(query, [idliquidacion], callback);
  }
};

export default Liquidacion;
