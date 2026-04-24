import db from '../db.js';

const Configuracion = {
  // ========== MÉTODOS ORIGINALES (SIN FILTRO) - DEPRECADOS ==========
  // Mantener temporalmente para compatibilidad, pero no usar en nuevas implementaciones

  getValor: (clave, callback) => {
    const sql = `SELECT valor FROM configuracion WHERE clave = ? LIMIT 1`;
    db.query(sql, [clave], (err, results) => {
      if (err) return callback(err);
      const valor = results[0]?.valor ?? null;
      callback(null, valor);
    });
  },

  crearOActualizar: (clave, valor, callback) => {
    const sql = `
      INSERT INTO configuracion (clave, valor)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE valor = ?
    `;
    db.query(sql, [clave, valor, valor], callback);
  },

  getAll: (callback) => {
    const sql = `SELECT * FROM configuracion`;
    db.query(sql, callback);
  },

  getValorConDefault: (clave, defaultValue = false, callback) => {
    const sql = `SELECT valor FROM configuracion WHERE clave = ? LIMIT 1`;
    db.query(sql, [clave], (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(null, defaultValue);
      const valor = results[0].valor === 'true';
      callback(null, valor);
    });
  },

  // ========== MÉTODOS V2 CON FILTRO POR USUARIO ==========

  /**
   * Obtener valor de configuración específica de un usuario
   */
  getValorByUser: (clave, idusuarios, callback) => {
    const sql = `
      SELECT valor
      FROM configuracion
      WHERE clave = ? AND idusuarios = ?
      LIMIT 1
    `;
    db.query(sql, [clave, idusuarios], (err, results) => {
      if (err) return callback(err);
      const valor = results[0]?.valor ?? null;
      callback(null, valor);
    });
  },

  /**
   * Obtener valor de configuración con valor por defecto
   */
  getValorConDefaultByUser: (clave, idusuarios, defaultValue = false, callback) => {
    const sql = `
      SELECT valor
      FROM configuracion
      WHERE clave = ? AND idusuarios = ?
      LIMIT 1
    `;
    db.query(sql, [clave, idusuarios], (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(null, defaultValue);

      // Si es booleano, convertir
      if (typeof defaultValue === 'boolean') {
        const valor = results[0].valor === 'true';
        return callback(null, valor);
      }

      // Devolver como string
      callback(null, results[0].valor);
    });
  },

  /**
   * Buscar una configuración específica de un usuario
   */
  findByClaveAndUser: (clave, idusuarios, callback) => {
    const sql = `
      SELECT id, clave, valor, idusuarios
      FROM configuracion
      WHERE clave = ? AND idusuarios = ?
      LIMIT 1
    `;
    db.query(sql, [clave, idusuarios], callback);
  },

  /**
   * Crear o actualizar configuración para un usuario específico
   */
  crearOActualizarByUser: (clave, valor, idusuarios, callback) => {
    Configuracion.findByClaveAndUser(clave, idusuarios, (err, results) => {
      if (err) return callback(err);

      if (results.length > 0) {
        const sqlUpdate = `
          UPDATE configuracion
          SET valor = ?
          WHERE clave = ? AND idusuarios = ?
        `;
        return db.query(sqlUpdate, [valor, clave, idusuarios], callback);
      }

      const sqlInsert = `
        INSERT INTO configuracion (clave, valor, idusuarios)
        VALUES (?, ?, ?)
      `;

      db.query(sqlInsert, [clave, valor, idusuarios], callback);
    });
  },

  updateConfiguration: (clave, valor, idusuarios, callback) => {
    const sql = `
      UPDATE configuracion
      SET valor = ?
      WHERE clave = ? AND idusuarios = ?
    `;

    db.query(sql, [valor, clave, idusuarios], callback);
  },

  /**
   * Obtener todas las configuraciones de un usuario
   */
  getAllByUser: (idusuarios, callback) => {
    const sql = `
      SELECT
        id,
        clave,
        valor,
        idusuarios
      FROM configuracion
      WHERE idusuarios = ?
      ORDER BY clave ASC
    `;
    db.query(sql, [idusuarios], callback);
  },

  /**
   * Eliminar una configuración específica de un usuario
   */
  deleteByUser: (clave, idusuarios, callback) => {
    const sql = `
      DELETE FROM configuracion
      WHERE clave = ? AND idusuarios = ?
    `;
    db.query(sql, [clave, idusuarios], callback);
  },

  /**
   * Verificar si existe una configuración para un usuario
   */
  existsByUser: (clave, idusuarios, callback) => {
    const sql = `
      SELECT COUNT(*) as count
      FROM configuracion
      WHERE clave = ? AND idusuarios = ?
    `;
    db.query(sql, [clave, idusuarios], (err, results) => {
      if (err) return callback(err);
      const exists = results[0].count > 0;
      callback(null, exists);
    });
  }

};

export default Configuracion;
