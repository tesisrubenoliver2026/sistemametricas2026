import EmailConfiguracion from '../models/EmailConfiguracion.js';
import { getUserId } from '../utils/getUserId.js';
import { sendTestEmail } from '../services/emailService.js';

/**
 * Obtener configuración de email del usuario autenticado
 */
export const getEmailConfig = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  // Solo usuarios administradores pueden configurar emails
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para configurar emails'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  EmailConfiguracion.getByUser(idusuarios, (err, config) => {
    if (err) {
      console.error('❌ Error al obtener configuración de email:', err);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener configuración de email'
      });
    }

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'No hay configuración de email registrada',
        hasConfig: false
      });
    }

    res.json({
      success: true,
      config: config,
      hasConfig: true
    });
  });
};

/**
 * Crear o actualizar configuración de email
 */
export const saveEmailConfig = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  // Solo usuarios administradores pueden configurar emails
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para configurar emails'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const {
    smtp_service,
    smtp_host,
    smtp_port,
    smtp_secure,
    smtp_user,
    smtp_password,
    notify_to,
    notify_cc,
    notify_bcc,
    email_enabled,
    notify_ventas_programadas,
    notify_ventas_credito,
    notify_stock_bajo,
    estado
  } = req.body;

  // Validar campos obligatorios
  if (!smtp_user || !smtp_password || !notify_to) {
    return res.status(400).json({
      success: false,
      error: 'Campos obligatorios faltantes: smtp_user, smtp_password y notify_to son requeridos'
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(smtp_user) || !emailRegex.test(notify_to)) {
    return res.status(400).json({
      success: false,
      error: 'Formato de email inválido'
    });
  }

  const emailConfig = {
    smtp_service: smtp_service || 'gmail',
    smtp_host: smtp_host || 'smtp.gmail.com',
    smtp_port: smtp_port || 587,
    smtp_secure: smtp_secure || false,
    smtp_user,
    smtp_password,
    notify_to,
    notify_cc: notify_cc || null,
    notify_bcc: notify_bcc || null,
    email_enabled: email_enabled !== undefined ? email_enabled : true,
    notify_ventas_programadas: notify_ventas_programadas !== undefined ? notify_ventas_programadas : true,
    notify_ventas_credito: notify_ventas_credito !== undefined ? notify_ventas_credito : false,
    notify_stock_bajo: notify_stock_bajo !== undefined ? notify_stock_bajo : false,
    estado: estado || 'activa'
  };

  EmailConfiguracion.createOrUpdate(emailConfig, idusuarios, (err, result) => {
    if (err) {
      console.error('❌ Error al guardar configuración de email:', err);
      return res.status(500).json({
        success: false,
        error: 'Error al guardar configuración de email'
      });
    }

    console.log(`✅ Configuración de email guardada para usuario ${idusuarios}`);

    res.status(201).json({
      success: true,
      message: 'Configuración de email guardada exitosamente',
      id: result.insertId || result.id
    });
  });
};

/**
 * Probar configuración de email (enviar email de prueba)
 */
export const testEmailConfig = async (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  // Solo usuarios administradores
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para probar configuración de emails'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  try {
    console.log(`🧪 Probando configuración de email para usuario ${idusuarios}...`);

    const result = await sendTestEmail(idusuarios);

    res.json({
      success: true,
      message: `Email de prueba enviado exitosamente a ${result.to}`,
      messageId: result.messageId,
      to: result.to
    });

  } catch (error) {
    console.error('❌ Error al probar configuración de email:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Error al enviar email de prueba',
      details: 'Verifica que tu usuario y contraseña sean correctos, y que hayas habilitado el acceso para aplicaciones menos seguras o generado una contraseña de aplicación'
    });
  }
};

/**
 * Eliminar configuración de email
 */
export const deleteEmailConfig = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  // Solo usuarios administradores
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para eliminar configuración de emails'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  EmailConfiguracion.delete(idusuarios, (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar configuración de email:', err);
      return res.status(500).json({
        success: false,
        error: 'Error al eliminar configuración de email'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró configuración de email para eliminar'
      });
    }

    console.log(`✅ Configuración de email eliminada para usuario ${idusuarios}`);

    res.json({
      success: true,
      message: 'Configuración de email eliminada exitosamente'
    });
  });
};

/**
 * Actualizar estado (activar/desactivar notificaciones)
 */
export const updateEmailStatus = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};
  const { estado } = req.body;

  // Solo usuarios administradores
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para modificar estado de emails'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (!estado || !['activa', 'inactiva'].includes(estado)) {
    return res.status(400).json({
      success: false,
      error: 'Estado inválido. Debe ser "activa" o "inactiva"'
    });
  }

  EmailConfiguracion.updateStatus(idusuarios, estado, (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar estado de email:', err);
      return res.status(500).json({
        success: false,
        error: 'Error al actualizar estado'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró configuración de email'
      });
    }

    console.log(`✅ Estado de email actualizado a "${estado}" para usuario ${idusuarios}`);

    res.json({
      success: true,
      message: `Configuración ${estado === 'activa' ? 'activada' : 'desactivada'} exitosamente`
    });
  });
};

/**
 * Actualizar flags de notificación
 */
export const updateNotificationFlags = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  // Solo usuarios administradores
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para modificar notificaciones'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const {
    email_enabled,
    notify_ventas_programadas,
    notify_ventas_credito,
    notify_stock_bajo
  } = req.body;

  const flags = {};

  if (email_enabled !== undefined) flags.email_enabled = email_enabled;
  if (notify_ventas_programadas !== undefined) flags.notify_ventas_programadas = notify_ventas_programadas;
  if (notify_ventas_credito !== undefined) flags.notify_ventas_credito = notify_ventas_credito;
  if (notify_stock_bajo !== undefined) flags.notify_stock_bajo = notify_stock_bajo;

  if (Object.keys(flags).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No se proporcionaron flags para actualizar'
    });
  }

  EmailConfiguracion.updateNotificationFlags(idusuarios, flags, (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar flags de notificación:', err);
      return res.status(500).json({
        success: false,
        error: 'Error al actualizar configuración'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró configuración de email'
      });
    }

    console.log(`✅ Flags de notificación actualizados para usuario ${idusuarios}:`, flags);

    res.json({
      success: true,
      message: 'Configuración de notificaciones actualizada exitosamente',
      flags: flags
    });
  });
};
