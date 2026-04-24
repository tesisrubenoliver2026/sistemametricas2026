import db from '../../db.js';

const DatosBancarios = {
    findAll: (callback) => {
        const sql = `
            SELECT
                db.*,
                u.nombre as nombre_usuario,
                CONCAT(f.nombre, ' ', f.apellido) as nombre_funcionario
            FROM datos_bancarios db
            LEFT JOIN usuarios u ON db.idusuario = u.idusuarios
            LEFT JOIN funcionarios f ON db.idfuncionario = f.idfuncionario
            WHERE db.deleted_at IS NULL
        `;
        db.query(sql, callback);
    },

    findAllPaginatedFiltered: (limit, offset, search, callback) => {
        const searchTerm = `%${search}%`;
        const query = `
            SELECT
                db.*,
                u.nombre as nombre_usuario,
                CONCAT(f.nombre, ' ', f.apellido) as nombre_funcionario
            FROM datos_bancarios db
            LEFT JOIN usuarios u ON db.idusuario = u.idusuarios
            LEFT JOIN funcionarios f ON db.idfuncionario = f.idfuncionario
            WHERE db.deleted_at IS NULL AND (
                db.banco_origen LIKE ?
                OR db.numero_cuenta LIKE ?
                OR db.tipo_cuenta LIKE ?
                OR db.titular_cuenta LIKE ?
                OR db.observacion LIKE ?
                OR u.nombre LIKE ?
                OR CONCAT(f.nombre, ' ', f.apellido) LIKE ?
            )
            ORDER BY db.iddatos_bancarios DESC
            LIMIT ? OFFSET ?
        `;
        db.query(
            query,
            [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit, offset],
            callback
        );
    },

    // Contador total con filtro aplicado
    countFiltered: (search, callback) => {
        const searchTerm = `%${search}%`;
        const query = `
            SELECT COUNT(*) as total
            FROM datos_bancarios db
            LEFT JOIN usuarios u ON db.idusuario = u.idusuarios
            LEFT JOIN funcionarios f ON db.idfuncionario = f.idfuncionario
            WHERE db.deleted_at IS NULL AND (
                db.banco_origen LIKE ?
                OR db.numero_cuenta LIKE ?
                OR db.tipo_cuenta LIKE ?
                OR db.titular_cuenta LIKE ?
                OR db.observacion LIKE ?
                OR u.nombre LIKE ?
                OR CONCAT(f.nombre, ' ', f.apellido) LIKE ?
            )
        `;
        db.query(
            query,
            [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm],
            (err, results) => {
                if (err) return callback(err);
                callback(null, results[0].total);
            }
        );
    },

    findById: (id, callback) => {
        const sql = `
            SELECT
                db.*,
                u.nombre as nombre_usuario,
                CONCAT(f.nombre, ' ', f.apellido) as nombre_funcionario
            FROM datos_bancarios db
            LEFT JOIN usuarios u ON db.idusuario = u.idusuarios
            LEFT JOIN funcionarios f ON db.idfuncionario = f.idfuncionario
            WHERE db.iddatos_bancarios = ? AND db.deleted_at IS NULL
        `;
        db.query(sql, [id], callback);
    },

    create: (data, callback) => {
        const { banco_origen, numero_cuenta, tipo_cuenta, titular_cuenta, observacion, idusuario, idfuncionario } = data;
        const sql = `
            INSERT INTO datos_bancarios (
                banco_origen, 
                numero_cuenta, 
                tipo_cuenta, 
                titular_cuenta, 
                observacion, 
                idusuario, 
                idfuncionario
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(
            sql, 
            [banco_origen, numero_cuenta, tipo_cuenta, titular_cuenta, observacion, idusuario, idfuncionario], 
            callback
        );
    },

    softDelete: (id, callback) => {
        const sql = `UPDATE datos_bancarios SET deleted_at = NOW() WHERE iddatos_bancarios = ?`;
        db.query(sql, [id], callback);
    },

    update: (id, data, callback) => {
        const { banco_origen, numero_cuenta, tipo_cuenta, titular_cuenta, observacion, idusuario, idfuncionario } = data;
        const sql = `
            UPDATE datos_bancarios
            SET
                banco_origen = ?,
                numero_cuenta = ?,
                tipo_cuenta = ?,
                titular_cuenta = ?,
                observacion = ?,
                idusuario = ?,
                idfuncionario = ?,
                updated_at = NOW()
            WHERE iddatos_bancarios = ? AND deleted_at IS NULL
        `;
        db.query(
            sql,
            [banco_origen, numero_cuenta, tipo_cuenta, titular_cuenta, observacion, idusuario, idfuncionario, id],
            callback
        );
    },

    // Método para obtener datos bancarios filtrados por usuario V2 (soporta múltiples funcionarios)
    findAllPaginatedFilteredByUserV2: (idusuarios, idfuncionariosIds, limit, offset, search, callback) => {
        const searchTerm = `%${search}%`;
        let query = `
            SELECT
                db.*,
                u.nombre as nombre_usuario,
                CONCAT(f.nombre, ' ', f.apellido) as nombre_funcionario
            FROM datos_bancarios db
            LEFT JOIN usuarios u ON db.idusuario = u.idusuarios
            LEFT JOIN funcionarios f ON db.idfuncionario = f.idfuncionario
            WHERE db.deleted_at IS NULL
        `;

        const params = [];

        // Filtro por usuario y sus funcionarios
        if (idusuarios && idfuncionariosIds) {
            query += ` AND (db.idusuario = ? OR FIND_IN_SET(db.idfuncionario, ?))`;
            params.push(idusuarios, idfuncionariosIds);
        } else if (idusuarios) {
            query += ` AND db.idusuario = ?`;
            params.push(idusuarios);
        } else if (idfuncionariosIds) {
            query += ` AND FIND_IN_SET(db.idfuncionario, ?)`;
            params.push(idfuncionariosIds);
        }

        // Filtro de búsqueda
        query += ` AND (
            db.banco_origen LIKE ?
            OR db.numero_cuenta LIKE ?
            OR db.tipo_cuenta LIKE ?
            OR db.titular_cuenta LIKE ?
            OR db.observacion LIKE ?
            OR u.nombre LIKE ?
            OR CONCAT(f.nombre, ' ', f.apellido) LIKE ?
        )`;

        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);

        query += ` ORDER BY db.iddatos_bancarios DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        db.query(query, params, callback);
    },

    // Contador con filtro de usuario V2
    countFilteredByUserV2: (idusuarios, idfuncionariosIds, search, callback) => {
        const searchTerm = `%${search}%`;
        let query = `
            SELECT COUNT(*) as total
            FROM datos_bancarios db
            LEFT JOIN usuarios u ON db.idusuario = u.idusuarios
            LEFT JOIN funcionarios f ON db.idfuncionario = f.idfuncionario
            WHERE db.deleted_at IS NULL
        `;

        const params = [];

        // Filtro por usuario y sus funcionarios
        if (idusuarios && idfuncionariosIds) {
            query += ` AND (db.idusuario = ? OR FIND_IN_SET(db.idfuncionario, ?))`;
            params.push(idusuarios, idfuncionariosIds);
        } else if (idusuarios) {
            query += ` AND db.idusuario = ?`;
            params.push(idusuarios);
        } else if (idfuncionariosIds) {
            query += ` AND FIND_IN_SET(db.idfuncionario, ?)`;
            params.push(idfuncionariosIds);
        }

        // Filtro de búsqueda
        query += ` AND (
            db.banco_origen LIKE ?
            OR db.numero_cuenta LIKE ?
            OR db.tipo_cuenta LIKE ?
            OR db.titular_cuenta LIKE ?
            OR db.observacion LIKE ?
            OR u.nombre LIKE ?
            OR CONCAT(f.nombre, ' ', f.apellido) LIKE ?
        )`;

        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);

        db.query(query, params, (err, results) => {
            if (err) return callback(err);
            callback(null, results[0].total);
        });
    },
};

export default DatosBancarios;