import db from '../db.js';

const Facturador = {
  create: (data, callback) => {
    const query = `
      INSERT INTO facturadores
      (nombre_fantasia, titular, telefono, direccion, ciudad, ruc, timbrado_nro, fecha_inicio_vigente, fecha_fin_vigente, nro_factura_inicial_habilitada, nro_factura_final_habilitada, idusuarios, idfuncionario)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.nombre_fantasia,
      data.titular,
      data.telefono,
      data.direccion,
      data.ciudad,
      data.ruc,
      data.timbrado_nro,
      data.fecha_inicio_vigente,
      data.fecha_fin_vigente,
      data.nro_factura_inicial_habilitada,
      data.nro_factura_final_habilitada,
      data.idusuarios || null,
      data.idfuncionario || null
    ];
    db.query(query, values, callback);
  },

  findAllPaginatedFiltered: (limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT * FROM facturadores 
      WHERE 
        nombre_fantasia LIKE ? 
        OR titular LIKE ? 
        OR telefono LIKE ? 
        OR ruc LIKE ?
      ORDER BY idfacturador DESC
      LIMIT ? OFFSET ?
    `;
    db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm, limit, offset], callback);
  },

  countFiltered: (search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT COUNT(*) as total FROM facturadores
      WHERE
        nombre_fantasia LIKE ?
        OR titular LIKE ?
        OR telefono LIKE ?
        OR ruc LIKE ?
    `;
    db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  // Versiones filtradas por usuario/funcionario
  findAllPaginatedFilteredByUser: (limit, offset, search, idusuarios, idfuncionariosIds, callback) => {
    const searchTerm = `%${search}%`;
    const params = [];

    // Primero agregar parámetros de búsqueda
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);

    // Condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND (idusuarios = ? OR idusuarios IS NULL)';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND (idfuncionario IN (?) OR idfuncionario IS NULL)';
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND ((idusuarios = ? OR idfuncionario IN (?)) OR (idusuarios IS NULL AND idfuncionario IS NULL))';
      params.push(idusuarios, idfuncionariosIds);
    }

    const query = `
      SELECT * FROM facturadores
      WHERE (
        nombre_fantasia LIKE ?
        OR titular LIKE ?
        OR telefono LIKE ?
        OR ruc LIKE ?
      )
      ${userCondition}
      ORDER BY idfacturador DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);
    db.query(query, params, callback);
  },

  countFilteredByUser: (search, idusuarios, idfuncionariosIds, callback) => {
    const searchTerm = `%${search}%`;
    const params = [];

    // Primero agregar parámetros de búsqueda
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);

    // Condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND (idusuarios = ? OR idusuarios IS NULL)';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND (idfuncionario IN (?) OR idfuncionario IS NULL)';
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND ((idusuarios = ? OR idfuncionario IN (?)) OR (idusuarios IS NULL AND idfuncionario IS NULL))';
      params.push(idusuarios, idfuncionariosIds);
    }

    const query = `
      SELECT COUNT(*) as total FROM facturadores
      WHERE (
        nombre_fantasia LIKE ?
        OR titular LIKE ?
        OR telefono LIKE ?
        OR ruc LIKE ?
      )
      ${userCondition}
    `;

    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  findById: (id, callback) => {
    const query = 'SELECT * FROM facturadores WHERE idfacturador = ?';
    db.query(query, [id], callback);
  },

  update: (id, data, callback) => {
    const query = `
      UPDATE facturadores SET 
        nombre_fantasia = ?, titular = ?, telefono = ?, direccion = ?, ciudad = ?, 
        ruc = ?, timbrado_nro = ?, fecha_inicio_vigente = ?, fecha_fin_vigente = ?, 
        nro_factura_inicial_habilitada = ?, nro_factura_final_habilitada = ?, updated_at = NOW()
      WHERE idfacturador = ?
    `;
    const values = [
      data.nombre_fantasia,
      data.titular,
      data.telefono,
      data.direccion,
      data.ciudad,
      data.ruc,
      data.timbrado_nro,
      data.fecha_inicio_vigente,
      data.fecha_fin_vigente,
      data.nro_factura_inicial_habilitada,
      data.nro_factura_final_habilitada,
      id
    ];
    db.query(query, values, callback);
  },

  delete: (id, callback) => {
    const query = 'DELETE FROM facturadores WHERE idfacturador = ?';
    db.query(query, [id], callback);
  },

  deleteActividadesByFacturadorId: (idfacturador, callback) => {
    const query = 'DELETE FROM detalle_actividades_economicas WHERE idfacturador = ?';
    db.query(query, [idfacturador], callback);
  },
  
  addActividades: (idfacturador, actividades, callback) => {
    if (actividades.length === 0) return callback(null); // Si no hay actividades, no hacer nada.
  
    const values = actividades.map(idactividad => [idfacturador, idactividad]);
    const query = 'INSERT INTO detalle_actividades_economicas (idfacturador, idactividad) VALUES ?';
    db.query(query, [values], callback);
  },
  
  findActivo: (callback) => {
    const query = `
      SELECT * FROM facturadores
      WHERE culminado = FALSE
      ORDER BY idfacturador DESC
      LIMIT 1
    `;
    db.query(query, callback);
  },

  culminar: (id, callback) => {
    const query = 'UPDATE facturadores SET culminado = TRUE WHERE idfacturador = ?';
    db.query(query, [id], callback);
  },

  actualizarFacturaDisponible(idfacturador, nuevoNro, nuevasUtilizadas, callback) {
    const sql = `
      UPDATE facturadores
      SET nro_factura_disponible = ?, facturas_utilizadas = ?
      WHERE idfacturador = ?
    `;
    db.query(sql, [nuevoNro, nuevasUtilizadas, idfacturador], callback);
  },
  
  actualizarNumeroFactura(idfacturador, nuevoNro, nuevasUtilizadas, callback) {
    const sql = `
      UPDATE facturadores
      SET nro_factura_disponible = ?, facturas_utilizadas = ?
      WHERE idfacturador = ?
    `;
    db.query(sql, [nuevoNro, nuevasUtilizadas, idfacturador], callback);
  },

  // Obtener todos los facturadores con estadísticas de ventas para el reporte
  findAllForReportWithSales: (search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT
        f.*,
        COUNT(DISTINCT v.idventa) as total_ventas,
        COALESCE(SUM(v.total), 0) as monto_total_facturado,
        COALESCE(SUM(v.total_ganancia), 0) as ganancia_total,
        MAX(v.fecha) as ultima_venta,
        MIN(v.fecha) as primera_venta,
        COUNT(DISTINCT CASE WHEN v.estado_pago = 'pagado' THEN v.idventa END) as ventas_pagadas,
        COUNT(DISTINCT CASE WHEN v.estado_pago = 'pendiente' THEN v.idventa END) as ventas_pendientes,
        COALESCE(SUM(CASE WHEN v.estado_pago = 'pagado' THEN v.total ELSE 0 END), 0) as monto_pagado,
        COALESCE(SUM(CASE WHEN v.estado_pago = 'pendiente' THEN v.total ELSE 0 END), 0) as monto_pendiente,
        (CAST(SUBSTRING_INDEX(f.nro_factura_final_habilitada, '-', -1) AS UNSIGNED) -
         CAST(SUBSTRING_INDEX(f.nro_factura_inicial_habilitada, '-', -1) AS UNSIGNED) + 1) as total_facturas_habilitadas,
        COALESCE(f.facturas_utilizadas, 0) as facturas_utilizadas,
        (CAST(SUBSTRING_INDEX(f.nro_factura_final_habilitada, '-', -1) AS UNSIGNED) -
         CAST(SUBSTRING_INDEX(COALESCE(f.nro_factura_disponible, f.nro_factura_inicial_habilitada), '-', -1) AS UNSIGNED) + 1) as facturas_disponibles
      FROM facturadores f
      LEFT JOIN ventas v ON f.idfacturador = v.idfacturador AND v.deleted_at IS NULL
      WHERE (
        f.nombre_fantasia LIKE ?
        OR f.titular LIKE ?
        OR f.ruc LIKE ?
        OR f.timbrado_nro LIKE ?
      )
      GROUP BY f.idfacturador
      ORDER BY f.idfacturador DESC
    `;
    db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm], callback);
  }
};


export default Facturador;
