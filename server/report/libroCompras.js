import { getJsReportInstance, formatHelper } from './jsreportInstance.js';
import { libroComprasTemplate } from './template/libroCompras.js';

/**
 * Generar Libro de Compras formato SET
 * @param {Object} dataReport - Datos del reporte (empresa, compras, totales)
 * @returns {Promise<string>} - PDF en base64
 */
export const generateLibroCompras = async (dataReport) => {
  try {
    const jsreportInstance = await getJsReportInstance();

    const result = await jsreportInstance.render({
      template: {
        content: libroComprasTemplate,
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
    console.error('❌ Error al generar Libro de Compras:', err.message);
    throw err;
  }
};
