import db from '../../db.js';

const Categoria = {
  findAll: (callback) => {
    db.query('SELECT * FROM categorias WHERE deleted_at IS NULL', callback);
  },

  // ✅ Paginación + búsqueda filtrado por usuario
  findAllPaginatedFilteredByUser: (idusuarios, idfuncionariosIds, limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    let userCondition = '';
    const params = [];

    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND c.idusuario = ?';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND c.idfuncionario IN (?)';
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (c.idusuario = ? OR c.idfuncionario IN (?))';
      params.push(idusuarios, idfuncionariosIds);
    }

    const query = `
      SELECT * FROM categorias c
      WHERE c.deleted_at IS NULL
        AND c.categoria LIKE ?
        ${userCondition}
      ORDER BY c.idcategorias DESC
      LIMIT ? OFFSET ?
    `;
    db.query(query, [searchTerm, ...params, limit, offset], callback);
  },

  // ✅ Contar resultados filtrados por usuario
  countFilteredByUser: (idusuarios, idfuncionariosIds, search, callback) => {
    const searchTerm = `%${search}%`;
    let userCondition = '';
    const params = [];

    if (idusuarios && !idfuncionariosIds) {
      userCondition = 'AND c.idusuario = ?';
      params.push(idusuarios);
    } else if (idfuncionariosIds && !idusuarios) {
      userCondition = 'AND c.idfuncionario IN (?)';
      params.push(idfuncionariosIds);
    } else if (idusuarios && idfuncionariosIds) {
      userCondition = 'AND (c.idusuario = ? OR c.idfuncionario IN (?))';
      params.push(idusuarios, idfuncionariosIds);
    }

    const query = `
      SELECT COUNT(*) as total FROM categorias c
      WHERE c.deleted_at IS NULL
        AND c.categoria LIKE ?
        ${userCondition}
    `;
    db.query(query, [searchTerm, ...params], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  // ✅ Paginación + búsqueda (sin filtro de usuario)
  findAllPaginatedFiltered: (limit, offset, search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT * FROM categorias
      WHERE deleted_at IS NULL AND (
        categoria LIKE ?
      )
      ORDER BY idcategorias DESC
      LIMIT ? OFFSET ?
    `;
    db.query(query, [searchTerm, limit, offset], callback);
  },

  // ✅ Contar resultados filtrados (sin filtro de usuario)
  countFiltered: (search, callback) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT COUNT(*) as total FROM categorias
      WHERE deleted_at IS NULL AND (
        categoria LIKE ?
      )
    `;
    db.query(query, [searchTerm], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    });
  },

  findById: (id, callback) => {
    db.query('SELECT * FROM categorias WHERE idcategorias = ? AND deleted_at IS NULL', [id], callback);
  },

  create: (data, callback) => {
    const query = `
      INSERT INTO categorias (categoria, estado, idusuario, idfuncionario, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    db.query(query, [
      data.categoria,
      data.estado || 'activo',
      data.idusuario || null,
      data.idfuncionario || null
    ], callback);
  },

  update: (id, data, callback) => {
    const query = `
      UPDATE categorias SET
        categoria = ?, estado = ?, updated_at = NOW()
      WHERE idcategorias = ?
    `;
    db.query(query, [data.categoria, data.estado, id], callback);
  },

  delete: (id, callback) => {
    const query = `
      UPDATE categorias SET deleted_at = NOW() WHERE idcategorias = ?
    `;
    db.query(query, [id], callback);
  }
};

export default Categoria;
