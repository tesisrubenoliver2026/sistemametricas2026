import nodemailer from 'nodemailer';
import EmailConfiguracion from '../models/EmailConfiguracion.js';

/**
 * Crear transporter de nodemailer usando la configuración del usuario
 */
async function createTransporter(idusuarios) {
  return new Promise((resolve, reject) => {
    EmailConfiguracion.getByUserWithPassword(idusuarios, (err, config) => {
      if (err) {
        console.error(`❌ Error al obtener configuración de email del usuario ${idusuarios}:`, err);
        return reject(err);
      }

      if (!config) {
        console.warn(`⚠️ Usuario ${idusuarios} no tiene configuración de email`);
        return reject(new Error('No hay configuración de email para este usuario'));
      }

      if (!config.email_enabled) {
        console.warn(`⚠️ Usuario ${idusuarios} tiene las notificaciones deshabilitadas`);
        return reject(new Error('Notificaciones por email deshabilitadas'));
      }

      try {
        let transporterConfig;

        // Configuración según el servicio
        if (config.smtp_service === 'gmail') {
          transporterConfig = {
            service: 'gmail',
            auth: {
              user: config.smtp_user,
              pass: config.smtp_password
            }
          };
        } else if (config.smtp_service === 'outlook') {
          transporterConfig = {
            service: 'outlook',
            auth: {
              user: config.smtp_user,
              pass: config.smtp_password
            }
          };
        } else {
          // SMTP personalizado
          transporterConfig = {
            host: config.smtp_host,
            port: config.smtp_port,
            secure: config.smtp_secure, // true para SSL, false para TLS
            auth: {
              user: config.smtp_user,
              pass: config.smtp_password
            }
          };
        }

        const transporter = nodemailer.createTransport(transporterConfig);

        console.log(`✅ Transporter creado para usuario ${idusuarios} (${config.smtp_service})`);
        resolve({ transporter, config });

      } catch (error) {
        console.error(`❌ Error al crear transporter para usuario ${idusuarios}:`, error);
        reject(error);
      }
    });
  });
}

/**
 * Enviar email de venta programada
 */
export async function sendVentaProgramadaEmail(idusuarios, emailData) {
  const {
    idprogramacion,
    ventaId,
    total,
    cliente,
    fecha,
    detalles
  } = emailData;

  try {
    // Crear transporter con la configuración del usuario
    const { transporter, config } = await createTransporter(idusuarios);

    // Verificar si el usuario tiene habilitadas las notificaciones de ventas programadas
    if (!config.notify_ventas_programadas) {
      console.log(`ℹ️ Usuario ${idusuarios} tiene deshabilitadas las notificaciones de ventas programadas`);
      return { success: false, message: 'Notificaciones de ventas programadas deshabilitadas' };
    }

    const subject = `Venta programada generada (#${ventaId})`;

    const filas = detalles.map(d => `
      <tr>
        <td>${d.nombre_producto}</td>
        <td style="text-align:center">${Number(d.cantidad).toFixed(2)}</td>
        <td style="text-align:right">${Number(d.precio_venta).toLocaleString("es-PY")}</td>
      </tr>
    `).join("");

    const html = `
      <div style="font-family:Arial, sans-serif; font-size:14px; color:#333;">
        <h2 style="margin:0 0 12px 0;">Venta programada generada</h2>

        <p><b>ID Programación:</b> ${idprogramacion}</p>

        <p>
          <b>Cliente:</b> ${cliente?.nombre} |
          <b>Doc:</b> ${cliente?.documento} |
          <b>ID:</b> ${cliente?.id}
        </p>

        <p><b>Fecha:</b> ${fecha}</p>
        <p><b>Total:</b> ${Number(total).toLocaleString("es-PY")}</p>

        <h3 style="margin:16px 0 8px 0;">Detalles</h3>
        <table width="100%" cellspacing="0" cellpadding="6" style="border-collapse:collapse;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th align="left">Producto</th>
              <th>Cant.</th>
              <th align="right">Precio</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
    `;

    const mailOptions = {
      from: config.smtp_user,
      to: config.notify_to,
      cc: config.notify_cc || undefined,
      bcc: config.notify_bcc || undefined,
      subject: subject,
      html: html,
      text: html.replace(/<[^>]+>/g, "")
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email de venta programada enviado a ${config.notify_to} (Usuario: ${idusuarios})`);
    console.log(`   Response: ${info.response}`);

    return { success: true, messageId: info.messageId, response: info.response };

  } catch (error) {
    console.error(`❌ Error al enviar email de venta programada (Usuario: ${idusuarios}):`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar email de prueba
 */
export async function sendTestEmail(idusuarios) {
  try {
    const { transporter, config } = await createTransporter(idusuarios);

    const subject = 'Prueba de configuración de email';
    const html = `
      <div style="font-family:Arial, sans-serif; font-size:14px; color:#333;">
        <h2 style="color:#4CAF50;">¡Configuración exitosa!</h2>
        <p>Este es un correo de prueba para verificar que tu configuración de email está funcionando correctamente.</p>
        <p><b>Servicio:</b> ${config.smtp_service}</p>
        <p><b>Usuario SMTP:</b> ${config.smtp_user}</p>
        <p><b>Fecha:</b> ${new Date().toLocaleString('es-PY')}</p>
        <hr style="border:none; border-top:1px solid #ddd; margin:20px 0;">
        <p style="color:#666; font-size:12px;">
          Si recibiste este correo, significa que tu configuración de notificaciones está funcionando correctamente.
        </p>
      </div>
    `;

    const mailOptions = {
      from: config.smtp_user,
      to: config.notify_to,
      subject: subject,
      html: html,
      text: html.replace(/<[^>]+>/g, "")
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email de prueba enviado a ${config.notify_to} (Usuario: ${idusuarios})`);
    return { success: true, messageId: info.messageId, to: config.notify_to };

  } catch (error) {
    console.error(`❌ Error al enviar email de prueba (Usuario: ${idusuarios}):`, error);
    throw error;
  }
}

/**
 * Verificar si un usuario tiene configuración de email válida
 */
export async function hasValidEmailConfig(idusuarios) {
  return new Promise((resolve) => {
    EmailConfiguracion.getByUser(idusuarios, (err, config) => {
      if (err || !config || !config.email_enabled) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

export default {
  createTransporter,
  sendVentaProgramadaEmail,
  sendTestEmail,
  hasValidEmailConfig
};
