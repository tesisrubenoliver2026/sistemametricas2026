import { getJsReportInstance, formatHelper } from './jsreportInstance.js';
import { libroDiarioTemplate } from './template/libroDiario.js';

export const generateLibroDiario = async (dataReport) => {
  try {
    const jsreportInstance = await getJsReportInstance();

    const result = await jsreportInstance.render({
      template: {
        content: libroDiarioTemplate,
        engine: 'handlebars',
        recipe: 'chrome-pdf',
        helpers: formatHelper,
        chrome: {
          printBackground: true,
          marginTop: '0.5cm',
          marginBottom: '0.5cm',
          marginLeft: '1cm',
          marginRight: '1cm',
          landscape: false,
        },
      },
      data: dataReport,
    });

    return result.content.toString('base64');
  } catch (err) {
    console.error('❌ Error al generar Libro Diario:', err.message);
    throw err;
  }
};
