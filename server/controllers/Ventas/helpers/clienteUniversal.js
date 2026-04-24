import db from '../../../db.js';
import { getUserId } from '../../../utils/getUserId.js';

const DEFAULT_CLIENT_KEY = 'idclientedefault';

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

const getDefaultClientId = async (idusuarios) => {
  const rows = await query(
    `SELECT valor FROM configuracion WHERE clave = ? AND idusuarios = ? LIMIT 1`,
    [DEFAULT_CLIENT_KEY, idusuarios]
  );

  const idcliente = parseInt(rows?.[0]?.valor, 10);
  return Number.isFinite(idcliente) && idcliente > 0 ? idcliente : null;
};

const saveDefaultClientId = async (idusuarios, idcliente) => {
  await query(
    `
      INSERT INTO configuracion (clave, valor, idusuarios)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE valor = VALUES(valor)
    `,
    [DEFAULT_CLIENT_KEY, String(idcliente), idusuarios]
  );
};

const findUniversalClient = async (idusuarios) => {
  return query(
    `
      SELECT *
      FROM clientes
      WHERE idusuario = ?
        AND numDocumento = ?
      LIMIT 1
    `,
    [idusuarios, `UNIVERSAL-${idusuarios}`]
  );
};

const createUniversalClient = async (idusuarios) => {
  const result = await query(
    `
      INSERT INTO clientes (
        nombre, apellido, tipo, numDocumento, telefono, direccion,
        genero, estado, descripcion, tipo_cliente, tipo_documento,
        idusuario, idfuncionario, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
    [
      'UNIVERSAL',
      'XXXXXXX',
      'universal',
      `UNIVERSAL-${idusuarios}`,
      'XXXXXXX',
      'XXXXXXX',
      null,
      'activo',
      'Cliente universal creado automáticamente por el sistema',
      'minorista',
      null,
      idusuarios,
      null
    ]
  );

  return result.insertId;
};

const restoreUniversalClient = async (idcliente) => {
  await query(
    `
      UPDATE clientes
      SET deleted_at = NULL,
          estado = 'activo',
          updated_at = NOW()
      WHERE idcliente = ?
    `,
    [idcliente]
  );
};

export const ensureClienteUniversalForUser = async (idusuarios) => {
  if (!idusuarios) {
    throw new Error('No se pudo determinar el usuario propietario');
  }

  const defaultClientId = await getDefaultClientId(idusuarios);
  if (defaultClientId) {
    const defaultClient = await query(
      `SELECT * FROM clientes WHERE idcliente = ? AND deleted_at IS NULL LIMIT 1`,
      [defaultClientId]
    );
    if (defaultClient.length > 0) {
      return defaultClient[0];
    }
  }

  const existingUniversal = await query(
    `
      SELECT *
      FROM clientes
      WHERE idusuario = ?
        AND numDocumento = ?
      LIMIT 1
    `,
    [idusuarios, `UNIVERSAL-${idusuarios}`]
  );

  if (existingUniversal.length > 0) {
    if (existingUniversal[0].deleted_at) {
      await restoreUniversalClient(existingUniversal[0].idcliente);
    }

    await saveDefaultClientId(idusuarios, existingUniversal[0].idcliente);
    const refreshed = await query(
      `SELECT * FROM clientes WHERE idcliente = ? AND deleted_at IS NULL LIMIT 1`,
      [existingUniversal[0].idcliente]
    );
    return refreshed[0] || existingUniversal[0];
  }

  try {
    const idcliente = await createUniversalClient(idusuarios);
    await saveDefaultClientId(idusuarios, idcliente);

    const created = await query(
      `SELECT * FROM clientes WHERE idcliente = ? AND deleted_at IS NULL LIMIT 1`,
      [idcliente]
    );
    return created[0];
  } catch (error) {
    if (error?.code !== 'ER_DUP_ENTRY') {
      throw error;
    }

    const universalAfterRace = await query(
      `
        SELECT *
        FROM clientes
        WHERE idusuario = ?
          AND numDocumento = ?
        LIMIT 1
      `,
      [idusuarios, `UNIVERSAL-${idusuarios}`]
    );

    if (universalAfterRace.length > 0) {
      if (universalAfterRace[0].deleted_at) {
        await restoreUniversalClient(universalAfterRace[0].idcliente);
      }

      await saveDefaultClientId(idusuarios, universalAfterRace[0].idcliente);
      const refreshed = await query(
        `SELECT * FROM clientes WHERE idcliente = ? AND deleted_at IS NULL LIMIT 1`,
        [universalAfterRace[0].idcliente]
      );
      return refreshed[0] || universalAfterRace[0];
    }

    throw error;
  }
};

const getOwnerUserIdFromRequest = async (req) => {
  const { idusuarios, idfuncionario } = getUserId(req);

  if (idusuarios) {
    return idusuarios;
  }

  if (idfuncionario) {
    const rows = await query(
      `SELECT idusuarios FROM funcionarios WHERE idfuncionario = ? LIMIT 1`,
      [idfuncionario]
    );

    return rows?.[0]?.idusuarios || null;
  }

  return null;
};

export const resolveClienteParaVenta = async (req, idclienteInput) => {
  const ownerId = await getOwnerUserIdFromRequest(req);

  if (!ownerId) {
    throw new Error('No se pudo determinar el usuario propietario');
  }

  const hasClientId =
    idclienteInput !== null &&
    idclienteInput !== undefined &&
    idclienteInput !== '' &&
    Number(idclienteInput) > 0;

  if (hasClientId) {
    const rows = await query(
      `
        SELECT *
        FROM clientes
        WHERE idcliente = ?
          AND deleted_at IS NULL
          AND idusuario = ?
        LIMIT 1
      `,
      [idclienteInput, ownerId]
    );

    if (rows.length > 0) {
      return rows[0];
    }

    throw new Error('El cliente seleccionado no existe o no pertenece al usuario autenticado');
  }

  return ensureClienteUniversalForUser(ownerId);
};
