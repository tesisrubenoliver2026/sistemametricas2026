import { renderPDF } from './jsreportInstance.js';
import { reportLiquidacion } from './template/reportLiquidacion.js';

export const generateReportLiquidacion = async (dataReport) => {
  try {
    return await renderPDF(reportLiquidacion, dataReport);
  } catch (err) {
    console.error('❌ Error al generar PDF de liquidacion:', err?.message || err);
    return null;
  }
};

