import { getJsReportInstance, formatHelper } from './jsreportInstance.js';
import { facturaTemplateHTMLPagosCliente } from './template/reportPagosCliente.js';

export const generarReportePagosCliente = async (dataReporte) => {
  try {
    const jsreportInstance = await getJsReportInstance();

    const result = await jsreportInstance.render({
      template: {
        content: facturaTemplateHTMLPagosCliente,
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
    console.error('❌ Error al generar reporte de pagos:', err.message);
    return null;
  }
};
