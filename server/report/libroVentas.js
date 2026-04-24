import { getJsReportInstance, formatHelper } from './jsreportInstance.js';
import { libroVentasTemplate } from './template/libroVentas.js';

/**
 * Generar Libro de Ventas formato SET
 * @param {Object} dataReport - Datos del reporte (empresa, ventas, totales)
 * @returns {Promise<string>} - PDF en base64
 */
export const generateLibroVentas = async (dataReport) => {
  try {
    const jsreportInstance = await getJsReportInstance();

    const result = await jsreportInstance.render({
      template: {
        content: libroVentasTemplate,
        engine: 'handlebars',
        recipe: 'chrome-pdf',
        helpers: formatHelper,
        chrome: {
          printBackground: true,
          marginTop: '0cm',
          marginBottom: '0cm',
          landscape: true,
        },
      },
      data: dataReport,
    });

    return result.content.toString('base64');
  } catch (err) {
    console.error('❌ Error al generar Libro de Ventas:', err.message);
    throw err;
  }
};
