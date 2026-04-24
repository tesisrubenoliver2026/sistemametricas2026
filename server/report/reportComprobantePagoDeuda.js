import { getJsReportInstance, formatHelper } from './jsreportInstance.js';
import {
  facturaTemplateHTML,
  facturaTemplateHTML2,
  facturaTemplateHTML3,
  facturaTemplateHTML4
} from './template/reportcomprobantePagoDeuda.js';
import db from '../db.js';

const templates = {
  "t1": facturaTemplateHTML,
  "t2": facturaTemplateHTML2,
  "t3": facturaTemplateHTML3,
  "t4": facturaTemplateHTML4,
};

// Función auxiliar para obtener el template seleccionado
const getSelectedTemplate = async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT valor FROM configuracion WHERE clave = 'selectedTemplate' LIMIT 1`,
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0]?.valor || 't1');
      }
    );
  });
};

export const generarComprobantePagoDeuda = async (dataFactura) => {
  try {
    const selected = await getSelectedTemplate();
    const templateHTML = templates[selected] || templates["t1"];
    const jsreportInstance = await getJsReportInstance();

    const result = await jsreportInstance.render({
      template: {
        content: templateHTML,
        engine: 'handlebars',
        recipe: 'chrome-pdf',
        helpers: formatHelper,
        chrome: {
          printBackground: true,
          marginTop: '0cm',
          marginBottom: '0cm',
        },
      },
      data: dataFactura,
    });

    return result.content.toString('base64');
  } catch (err) {
    console.error('❌ Error al generar comprobante de pago:', err.message);
    return null;
  }
};
