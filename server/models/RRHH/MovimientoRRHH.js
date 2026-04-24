import db from '../../db.js';

const MovimientoRRHH = {
  create: (data, callback) => {
    const query = `
      INSERT INTO rrhh_movimientos (
        usuario_id, idempleado, fecha, tipo, concepto, monto, estado, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      data.usuario_id,
      data.idempleado,
      data.fecha,
      data.tipo,
      data.concepto,
      data.monto,
      data.estado || 'activo',
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
    tipo,
    estado,
    callback,
  ) => {
    const searchTerm = `%${search}%`;
    const nombreTerm = `%${nombre}%`;
    const documentoTerm = `%${documento}%`;
    const tipoValue = tipo && tipo !== 'todos' ? tipo : null;
    const estadoValue = estado && estado !== 'todos' ? estado : null;

    const query = `
      SELECT m.*, e.nombre, e.apellido, e.cedula
      FROM rrhh_movimientos m
      INNER JOIN empleados e ON e.idempleado = m.idempleado
      WHERE m.usuario_id = ?
        AND m.fecha BETWEEN ? AND ?
        AND (? IS NULL OR m.tipo = ?)
        AND (? IS NULL OR m.estado = ?)
        AND (
          COALESCE(m.concepto, '') LIKE ? OR
          CAST(m.monto AS CHAR) LIKE ? OR
          m.tipo LIKE ? OR
          m.estado LIKE ? OR
          DATE_FORMAT(m.fecha, '%Y-%m-%d') LIKE ? OR
          COALESCE(e.nombre, '') LIKE ? OR
          COALESCE(e.apellido, '') LIKE ? OR
          COALESCE(e.cedula, '') LIKE ?
        )
        AND COALESCE(e.nombre, '') LIKE ?
        AND COALESCE(e.cedula, '') LIKE ?
      ORDER BY m.fecha DESC, m.idmovimiento DESC
      LIMIT ? OFFSET ?
    `;

    db.query(
      query,
      [
        usuarioId,
        fechaInicio,
        fechaFin,
        tipoValue,
        tipoValue,
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

  countFilteredGlobal: (
    usuarioId,
    fechaInicio,
    fechaFin,
    search,
    nombre,
    documento,
    tipo,
    estado,
    callback,
  ) => {
    const searchTerm = `%${search}%`;
    const nombreTerm = `%${nombre}%`;
    const documentoTerm = `%${documento}%`;
    const tipoValue = tipo && tipo !== 'todos' ? tipo : null;
    const estadoValue = estado && estado !== 'todos' ? estado : null;

    const query = `
      SELECT COUNT(*) AS total
      FROM rrhh_movimientos m
      INNER JOIN empleados e ON e.idempleado = m.idempleado
      WHERE m.usuario_id = ?
        AND m.fecha BETWEEN ? AND ?
        AND (? IS NULL OR m.tipo = ?)
        AND (? IS NULL OR m.estado = ?)
        AND (
          COALESCE(m.concepto, '') LIKE ? OR
          CAST(m.monto AS CHAR) LIKE ? OR
          m.tipo LIKE ? OR
          m.estado LIKE ? OR
          DATE_FORMAT(m.fecha, '%Y-%m-%d') LIKE ? OR
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
        tipoValue,
        tipoValue,
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

  findAllPaginatedFiltered: (
    usuarioId,
    idempleado,
    fechaInicio,
    fechaFin,
    limit,
    offset,
    search,
    tipo,
    estado,
    callback,
  ) => {
    const searchTerm = `%${search}%`;
    const tipoValue = tipo && tipo !== 'todos' ? tipo : null;
    const estadoValue = estado && estado !== 'todos' ? estado : null;
    const query = `
      SELECT m.*, e.nombre, e.apellido, e.cedula
      FROM rrhh_movimientos m
      INNER JOIN empleados e ON e.idempleado = m.idempleado
      WHERE m.usuario_id = ?
        AND m.idempleado = ?
        AND m.fecha BETWEEN ? AND ?
        AND (? IS NULL OR m.tipo = ?)
        AND (? IS NULL OR m.estado = ?)
        AND (
          COALESCE(m.concepto, '') LIKE ? OR
          CAST(m.monto AS CHAR) LIKE ? OR
          m.tipo LIKE ? OR
          m.estado LIKE ? OR
          DATE_FORMAT(m.fecha, '%Y-%m-%d') LIKE ?
        )
      ORDER BY m.fecha DESC, m.idmovimiento DESC
      LIMIT ? OFFSET ?
    `;
    db.query(
      query,
      [
        usuarioId,
        idempleado,
        fechaInicio,
        fechaFin,
        tipoValue,
        tipoValue,
        estadoValue,
        estadoValue,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        limit,
        offset,
      ],
      callback,
    );
  },

  countFiltered: (
    usuarioId,
    idempleado,
    fechaInicio,
    fechaFin,
    search,
    tipo,
    estado,
    callback,
  ) => {
    const searchTerm = `%${search}%`;
    const tipoValue = tipo && tipo !== 'todos' ? tipo : null;
    const estadoValue = estado && estado !== 'todos' ? estado : null;
    const query = `
      SELECT COUNT(*) AS total
      FROM rrhh_movimientos m
      WHERE m.usuario_id = ?
        AND m.idempleado = ?
        AND m.fecha BETWEEN ? AND ?
        AND (? IS NULL OR m.tipo = ?)
        AND (? IS NULL OR m.estado = ?)
        AND (
          COALESCE(m.concepto, '') LIKE ? OR
          CAST(m.monto AS CHAR) LIKE ? OR
          m.tipo LIKE ? OR
          m.estado LIKE ? OR
          DATE_FORMAT(m.fecha, '%Y-%m-%d') LIKE ?
        )
    `;
    db.query(
      query,
      [
        usuarioId,
        idempleado,
        fechaInicio,
        fechaFin,
        tipoValue,
        tipoValue,
        estadoValue,
        estadoValue,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
      ],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0].total);
      },
    );
  },

  findById: (usuarioId, idmovimiento, callback) => {
    const query = `
      SELECT m.*, e.nombre, e.apellido, e.cedula
      FROM rrhh_movimientos m
      INNER JOIN empleados e ON e.idempleado = m.idempleado
      WHERE m.usuario_id = ?
        AND m.idmovimiento = ?
      LIMIT 1
    `;
    db.query(query, [usuarioId, idmovimiento], callback);
  },

  update: (usuarioId, idmovimiento, data, callback) => {
    const query = `
      UPDATE rrhh_movimientos
      SET
        fecha = ?,
        tipo = ?,
        concepto = ?,
        monto = ?,
        estado = ?
      WHERE usuario_id = ?
        AND idmovimiento = ?
    `;
    const values = [
      data.fecha,
      data.tipo,
      data.concepto,
      data.monto,
      data.estado || 'activo',
      usuarioId,
      idmovimiento,
    ];
    db.query(query, values, callback);
  },

  anular: (usuarioId, idmovimiento, callback) => {
    const query = `
      UPDATE rrhh_movimientos
      SET estado = 'anulado'
      WHERE usuario_id = ?
        AND idmovimiento = ?
    `;
    db.query(query, [usuarioId, idmovimiento], callback);
  },
};

export default MovimientoRRHH;

