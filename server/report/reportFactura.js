import { getJsReportInstance, formatHelper } from './jsreportInstance.js';
import {
  facturaTemplateHTML,
  facturaTemplateHTML2,
  facturaTemplateHTML3,
  facturaTemplateHTML4
} from './template/reportFacturaTemplate.js';
import db from '../db.js';

const templates = {
  "t1": facturaTemplateHTML,
  "t2": facturaTemplateHTML2,
  "t3": facturaTemplateHTML3,
  "t4": facturaTemplateHTML4,
};

// Función auxiliar para obtener el template seleccionado
const getSelectedTemplate = async (idusuarios) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT valor FROM configuracion WHERE clave = 'selectedTemplate' AND idusuarios = ? LIMIT 1`,
      [idusuarios],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0]?.valor || 't1');
      }
    );
  });
};

export const generarFacturaEmbebida = async (dataFactura) => {
  try {
    const selected = await getSelectedTemplate(dataFactura.idusuarios);
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
    console.error('❌ Error al generar factura:', err.message);
    return null;
  }
};
