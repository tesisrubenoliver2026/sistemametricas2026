import { getJsReportInstance, formatHelper, renderPDF } from './jsreportInstance.js';
import {
  facturaTemplateIngreso,
  facturaTemplateEgreso,
  facturaTemprateResumen,
} from './template/movimientos/reportIngreso.js';

// Re-exportar formatHelper para compatibilidad con otros módulos
export { formatHelper };

/* ───────────── EXPORTS ───────────── */
export const generarReporteIngresos = (data) =>
  renderPDF(facturaTemplateIngreso, data);

export const generarReporteEgresos = (data) =>
  renderPDF(facturaTemplateEgreso, data);

export const generarReporteResumen = (data) =>
  renderPDF(facturaTemprateResumen, data);
