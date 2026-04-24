import { getJsReportInstance, formatHelper } from './jsreportInstance.js';
import { libroMayorTemplate } from './template/libroMayor.js';

export const generateLibroMayor = async (dataReport) => {
  try {
    const jsreportInstance = await getJsReportInstance();

    const result = await jsreportInstance.render({
      template: {
        content: libroMayorTemplate,
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
    console.error('❌ Error al generar Libro Mayor:', err.message);
    throw err;
  }
};
