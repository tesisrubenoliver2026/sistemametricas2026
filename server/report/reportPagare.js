import { getJsReportInstance, formatHelper } from './jsreportInstance.js';
import {
  reportPagareDineroTemplate1,
  reportPagareDineroTemplate2,
  reportPagareDineroTemplate3,
  reportPagareDineroTemplate4
} from './template/reportPagareDinero.js';
import db from '../db.js';

const templates = {
  "t1": reportPagareDineroTemplate1,
  "t2": reportPagareDineroTemplate2,
  "t3": reportPagareDineroTemplate3,
  "t4": reportPagareDineroTemplate4,
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

export const generarPagareEmbebido = async (dataPagare) => {
  try {
    const selected = await getSelectedTemplate(dataPagare.idusuarios);
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
      data: dataPagare,
    });

    return result.content.toString('base64');
  } catch (err) {
    console.error('❌ Error al generar pagaré:', err.message);
    return null;
  }
};
