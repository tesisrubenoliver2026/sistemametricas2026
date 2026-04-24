import { getJsReportInstance, formatHelper } from './jsreportInstance.js';
import { reporteProductosTemplateHTML } from './template/reportProductos.js';
import db from '../db.js';

const templates = {
  "t1": reporteProductosTemplateHTML
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

export const generarReporteProductos = async (dataFactura) => {
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
    console.error('❌ Error al generar reporte de productos:', err.message);
    return null;
  }
};
