import { getJsReportInstance, formatHelper } from './jsreportInstance.js';
import { reporteTemplateHTMLVentasProgramadas } from './template/reportVentasProgramadas.js';

export const generarReporteVentasProgramadas = async (dataReporte) => {
  try {
    const jsreportInstance = await getJsReportInstance();

    const result = await jsreportInstance.render({
      template: {
        content: reporteTemplateHTMLVentasProgramadas,
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
    console.error('❌ Error al generar reporte de ventas programadas:', err.message);
    return null;
  }
};
