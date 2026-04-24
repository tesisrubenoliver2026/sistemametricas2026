import { getJsReportInstance, formatHelper } from './jsreportInstance.js';
import { reporteTemplateHTMLPagosCliente } from './template/reportVentasporCliente.js';

export const generarReporteDeudasporCliente = async (dataReporte) => {
  try {
    const jsreportInstance = await getJsReportInstance();

    const result = await jsreportInstance.render({
      template: {
        content: reporteTemplateHTMLPagosCliente,
        engine: 'handlebars',
        recipe: 'chrome-pdf',
        helpers: formatHelper,
        chrome: {
          printBackground: true,
          marginTop: '0cm',
          marginBottom: '0cm',
        },
      },
      data: dataReporte,
    });

    return result.content.toString('base64');
  } catch (err) {
    console.error('❌ Error al generar reporte de deudas por cliente:', err.message);
    return null;
  }
};
