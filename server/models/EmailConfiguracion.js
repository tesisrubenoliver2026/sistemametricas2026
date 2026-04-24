import db from '../db.js';
import crypto from 'crypto';

// Clave de encriptación (debe estar en .env en producción)
const ENCRYPTION_KEY = process.env.EMAIL_ENCRYPTION_KEY || 'default_32_byte_encryption_key!!'; // 32 caracteres
const IV_LENGTH = 16;

/**
 * Encriptar texto usando AES-256-GCM
 */
function encrypt(text) {
  if (!text) return null;

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Formato: iv:authTag:encrypted
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('❌ Error al encriptar:', error);
    throw new Error('Error en encriptación');
  }
}

/**
 * Desencriptar texto usando AES-256-GCM
 */
function decrypt(text) {
  if (!text) return null;

  try {
    const parts = text.split(':');
    if (parts.length !== 3) {
      throw new Error('Formato de texto encriptado inválido');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('❌ Error al desencriptar:', error);
    throw new Error('Error en desencriptación');
  }
}

const EmailConfiguracion = {

  /**
   * Crear o actualizar configuración de email para un usuario
   */
  createOrUpdate: (data, idusuarios, callback) => {
    // Encriptar la contraseña antes de guardar
    const encryptedPassword = encrypt(data.smtp_password);

    const query = `
      INSERT INTO email_configuracion (
        idusuarios, smtp_service, smtp_host, smtp_port, smtp_secure,
        smtp_user, smtp_password, notify_to, notify_cc, notify_bcc,
        email_enabled, notify_ventas_programadas, notify_ventas_credito,
        notify_stock_bajo, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        smtp_service = VALUES(smtp_service),
        smtp_host = VALUES(smtp_host),
        smtp_port = VALUES(smtp_port),
        smtp_secure = VALUES(smtp_secure),
        smtp_user = VALUES(smtp_user),
        smtp_password = VALUES(smtp_password),
        notify_to = VALUES(notify_to),
        notify_cc = VALUES(notify_cc),
        notify_bcc = VALUES(notify_bcc),
        email_enabled = VALUES(email_enabled),
        notify_ventas_programadas = VALUES(notify_ventas_programadas),
        notify_ventas_credito = VALUES(notify_ventas_credito),
        notify_stock_bajo = VALUES(notify_stock_bajo),
        estado = VALUES(estado),
        updated_at = CURRENT_TIMESTAMP
    `;

    const values = [
      idusuarios,
      data.smtp_service || 'gmail',
      data.smtp_host || 'smtp.gmail.com',
      data.smtp_port || 587,
      data.smtp_secure || false,
      data.smtp_user,
      encryptedPassword,
      data.notify_to,
      data.notify_cc || null,
      data.notify_bcc || null,
      data.email_enabled !== undefined ? data.email_enabled : true,
      data.notify_ventas_programadas !== undefined ? data.notify_ventas_programadas : true,
      data.notify_ventas_credito !== undefined ? data.notify_ventas_credito : false,
      data.notify_stock_bajo !== undefined ? data.notify_stock_bajo : false,
      data.estado || 'activa'
    ];

    db.query(query, values, callback);
  },

  /**
   * Obtener configuración de email de un usuario (sin contraseña)
   */
  getByUser: (idusuarios, callback) => {
    const query = `
      SELECT
        id, idusuarios, smtp_service, smtp_host, smtp_port, smtp_secure,
        smtp_user, notify_to, notify_cc, notify_bcc,
        email_enabled, notify_ventas_programadas, notify_ventas_credito,
        notify_stock_bajo, estado, created_at, updated_at
      FROM email_configuracion
      WHERE idusuarios = ? AND deleted_at IS NULL
      LIMIT 1
    `;

    db.query(query, [idusuarios], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0] || null);
    });
  },

  /**
   * Obtener configuración completa (incluyendo contraseña desencriptada)
   * USAR SOLO INTERNAMENTE PARA ENVÍO DE EMAILS
   */
  getByUserWithPassword: (idusuarios, callback) => {
    const query = `
      SELECT *
      FROM email_configuracion
      WHERE idusuarios = ? AND deleted_at IS NULL AND estado = 'activa'
      LIMIT 1
    `;

    db.query(query, [idusuarios], (err, results) => {
      if (err) return callback(err);

      if (!results || results.length === 0) {
        return callback(null, null);
      }

      const config = results[0];

      // Desencriptar la contraseña
      try {
        config.smtp_password = decrypt(config.smtp_password);
        callback(null, config);
      } catch (decryptError) {
        console.error('❌ Error al desencriptar contraseña:', decryptError);
        callback(new Error('Error al desencriptar credenciales'));
      }
    });
  },

  /**
   * Verificar si un usuario tiene configuración de email
   */
  exists: (idusuarios, callback) => {
    const query = `
      SELECT COUNT(*) as count
      FROM email_configuracion
      WHERE idusuarios = ? AND deleted_at IS NULL
    `;

    db.query(query, [idusuarios], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].count > 0);
    });
  },

  /**
   * Eliminar configuración (soft delete)
   */
  delete: (idusuarios, callback) => {
    const query = `
      UPDATE email_configuracion
      SET deleted_at = NOW(), estado = 'inactiva'
      WHERE idusuarios = ?
    `;

    db.query(query, [idusuarios], callback);
  },

  /**
   * Actualizar estado (activar/desactivar)
   */
  updateStatus: (idusuarios, estado, callback) => {
    const query = `
      UPDATE email_configuracion
      SET estado = ?, updated_at = NOW()
      WHERE idusuarios = ? AND deleted_at IS NULL
    `;

    db.query(query, [estado, idusuarios], callback);
  },

  /**
   * Actualizar flags de notificación
   */
  updateNotificationFlags: (idusuarios, flags, callback) => {
    const updates = [];
    const values = [];

    if (flags.email_enabled !== undefined) {
      updates.push('email_enabled = ?');
      values.push(flags.email_enabled);
    }
    if (flags.notify_ventas_programadas !== undefined) {
      updates.push('notify_ventas_programadas = ?');
      values.push(flags.notify_ventas_programadas);
    }
    if (flags.notify_ventas_credito !== undefined) {
      updates.push('notify_ventas_credito = ?');
      values.push(flags.notify_ventas_credito);
    }
    if (flags.notify_stock_bajo !== undefined) {
      updates.push('notify_stock_bajo = ?');
      values.push(flags.notify_stock_bajo);
    }

    if (updates.length === 0) {
      return callback(new Error('No hay flags para actualizar'));
    }

    updates.push('updated_at = NOW()');
    values.push(idusuarios);

    const query = `
      UPDATE email_configuracion
      SET ${updates.join(', ')}
      WHERE idusuarios = ? AND deleted_at IS NULL
    `;

    db.query(query, values, callback);
  }
};

export default EmailConfiguracion;
export { encrypt, decrypt };
