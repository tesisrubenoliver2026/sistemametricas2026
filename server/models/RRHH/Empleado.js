import db from '../../db.js';

const Empleado = {
  create: (data, callback) => {
    const query = `
      INSERT INTO empleados (
        nombre, apellido, cedula, telefono, direccion, fecha_nacimiento,
        fecha_ingreso, tipo_remuneracion, aporta_ips, porcentaje_ips_empleado,
        porcentaje_ips_empleador, estado, usuario_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      data.nombre,
      data.apellido,
      data.cedula || null,
      data.telefono || null,
      data.direccion || null,
      data.fecha_nacimiento || null,
      data.fecha_ingreso,
      data.tipo_remuneracion || 'Fijo',
      data.aporta_ips ?? true,
      data.porcentaje_ips_empleado ?? 9.0,
      data.porcentaje_ips_empleador ?? 16.5,
      data.estado || 'activo',
      data.usuario_id
    ];

    db.query(query, values, callback);
  },

  findAllPaginatedFiltered: (usuarioId, limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT *
      FROM empleados
      WHERE
        usuario_id = ?
        AND (
          nombre LIKE ? OR
          apellido LIKE ? OR
          cedula LIKE ? OR
          telefono LIKE ? OR
          estado LIKE ?
        )
      ORDER BY idempleado DESC
      LIMIT ? OFFSET ?
    `;
    db.query(
      query,
      [usuarioId, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit, offset],
      callback
    );
  },

  countFiltered: (usuarioId, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT COUNT(*) AS total
      FROM empleados
      WHERE
        usuario_id = ?
        AND (
          nombre LIKE ? OR
          apellido LIKE ? OR
          cedula LIKE ? OR
          telefono LIKE ? OR
          estado LIKE ?
        )
    `;
    db.query(
      query,
      [usuarioId, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0].total);
      }
    );
  },

  findById: (usuarioId, idempleado, callback) => {
    const query = `SELECT * FROM empleados WHERE usuario_id = ? AND idempleado = ? LIMIT 1`;
    db.query(query, [usuarioId, idempleado], callback);
  },

  findByCedula: (cedula, callback) => {
    const query = `SELECT * FROM empleados WHERE cedula = ? LIMIT 1`;
    db.query(query, [cedula], callback);
  },

  update: (idempleado, data, callback) => {
    const query = `
      UPDATE empleados
      SET
        nombre = ?,
        apellido = ?,
        cedula = ?,
        telefono = ?,
        direccion = ?,
        fecha_nacimiento = ?,
        fecha_ingreso = ?,
        tipo_remuneracion = ?,
        aporta_ips = ?,
        porcentaje_ips_empleado = ?,
        porcentaje_ips_empleador = ?,
        estado = ?,
        updated_at = NOW()
      WHERE idempleado = ?
    `;

    const values = [
      data.nombre,
      data.apellido,
      data.cedula || null,
      data.telefono || null,
      data.direccion || null,
      data.fecha_nacimiento || null,
      data.fecha_ingreso,
      data.tipo_remuneracion || 'Fijo',
      data.aporta_ips ?? true,
      data.porcentaje_ips_empleado ?? 9.0,
      data.porcentaje_ips_empleador ?? 16.5,
      data.estado || 'activo',
      idempleado
    ];

    db.query(query, values, callback);
  },

  changeStatus: (idempleado, estado, callback) => {
    const query = `
      UPDATE empleados
      SET estado = ?, updated_at = NOW()
      WHERE idempleado = ?
    `;
    db.query(query, [estado, idempleado], callback);
  },

  delete: (idempleado, callback) => {
    const query = `DELETE FROM empleados WHERE idempleado = ?`;
    db.query(query, [idempleado], callback);
  }
};

export default Empleado;
