// models/Compra/DeudaCompra.js
import db from '../../db.js';

const DeudaCompra = {
  create: (data, callback) => {
    const query = `
      INSERT INTO deuda_compra (
        idcompra,
        idproveedor,
        total_deuda,
        total_pagado,
        saldo,
        estado,
        fecha_deuda,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, 0, ?, 'pendiente', NOW(), NOW(), NOW())
    `;
    const values = [
      data.idcompra,
      data.idproveedor,
      data.total,
      data.total, // saldo inicial igual al total
    ];
    db.query(query, values, callback);
  },

  findAllPaginatedFiltered: (limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT dc.*, p.nombre
      FROM deuda_compra dc
      LEFT JOIN proveedor p ON p.idproveedor = dc.idproveedor
      WHERE dc.deleted_at IS NULL
        AND (p.nombre LIKE ? OR dc.estado LIKE ?)
      ORDER BY dc.fecha_deuda DESC
      LIMIT ? OFFSET ?
    `;
    db.query(query, [searchTerm, searchTerm, limit, offset], callback);
  },

  countFiltered: (search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT COUNT(*) AS total
      FROM deuda_compra dc
      LEFT JOIN proveedor p ON p.idproveedor = dc.idproveedor
      WHERE dc.deleted_at IS NULL
        AND (p.nombre LIKE ? OR dc.estado LIKE ?)
    `;
    db.query(query, [searchTerm, searchTerm], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  // Filtrado por usuario/funcionario vía JOIN con compras
  findAllPaginatedFilteredByUser: (limit, offset, search, idusuarios, idfuncionariosIds, callback) => {
    const searchTerm = `%${search}%`;
    const params = [];

    // Construir condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND c.idusuarios = ?';
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND c.idfuncionario IN (?)';
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (c.idusuarios = ? OR c.idfuncionario IN (?))';
    }

    // Orden de parámetros según el SQL
    if (idusuarios && !idfuncionariosIds) {
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      params.push(idusuarios, idfuncionariosIds);
    }

    params.push(searchTerm, searchTerm);
    params.push(limit, offset);

    const query = `
      SELECT dc.*, p.nombre
      FROM deuda_compra dc
      INNER JOIN compras c ON dc.idcompra = c.idcompra
      LEFT JOIN proveedor p ON p.idproveedor = dc.idproveedor
      WHERE dc.deleted_at IS NULL
        ${userCondition}
        AND (p.nombre LIKE ? OR dc.estado LIKE ?)
      ORDER BY dc.fecha_deuda DESC
      LIMIT ? OFFSET ?
    `;

    db.query(query, params, callback);
  },

  countFilteredByUser: (search, idusuarios, idfuncionariosIds, callback) => {
    const searchTerm = `%${search}%`;
    const params = [];

    // Construir condición de usuario
    let userCondition = '';
    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND c.idusuarios = ?';
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND c.idfuncionario IN (?)';
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (c.idusuarios = ? OR c.idfuncionario IN (?))';
    }

    // Orden de parámetros
    if (idusuarios && !idfuncionariosIds) {
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      params.push(idusuarios, idfuncionariosIds);
    }

    params.push(searchTerm, searchTerm);

    const query = `
      SELECT COUNT(*) AS total
      FROM deuda_compra dc
      INNER JOIN compras c ON dc.idcompra = c.idcompra
      LEFT JOIN proveedor p ON p.idproveedor = dc.idproveedor
      WHERE dc.deleted_at IS NULL
        ${userCondition}
        AND (p.nombre LIKE ? OR dc.estado LIKE ?)
    `;

    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  }
};

export default DeudaCompra;
