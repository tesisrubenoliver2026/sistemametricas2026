import { getJsReportInstance, formatHelper } from './jsreportInstance.js';
import { libroCajaTemplate } from './template/libroCaja.js';

/**
 * Generar Libro de Caja
 * @param {Object} dataReport - Datos del reporte (empresa, movimientos, totales)
 * @returns {Promise<string>} - PDF en base64
 */
export const generateLibroCaja = async (dataReport) => {
  try {
    const jsreportInstance = await getJsReportInstance();

    const result = await jsreportInstance.render({
      template: {
        content: libroCajaTemplate,
        engine: 'handlebars',
        recipe: 'chrome-pdf',
        helpers: formatHelper,
        chrome: {
          printBackground: true,
          marginTop: '0.5cm',
          marginBottom: '0.5cm',
          marginLeft: '1cm',
          marginRight: '1cm',
        },
      },
      data: dataReport,
    });

    return result.content.toString('base64');
  } catch (err) {
    console.error('❌ Error al generar Libro de Caja:', err.message);
    throw err;
  }
};
