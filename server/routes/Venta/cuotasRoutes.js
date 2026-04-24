import express from 'express';
import {
  generarPlanCuotasCtrl,
  aplicarPagoCtrl,
  aplicarPagoCuotaEspecificaCtrl,
  listarCuotasCtrl,
  listarCuotasPendientesClienteCtrl,
  obtenerHistorialPagosCtrl,
  calcularInteresesCtrl,
  simularPlanCtrl,
  simularPagoCtrl,
  recalcularPlanCtrl,
  obtenerDetalleCuotaCtrl
} from '../../controllers/Ventas/cuotasController.js';
import { verifyToken } from '../../middlewares/verifyToken.js';

const router = express.Router();

// ✅ Middleware de autenticación
router.use(verifyToken);

// ============================================
// RUTAS DE PLAN DE CUOTAS
// ============================================

// Generar plan de cuotas para una deuda
router.post('/generar-plan', generarPlanCuotasCtrl);

// Simular plan de cuotas (sin guardar en BD)
router.post('/simular-plan', simularPlanCtrl);

// Recalcular plan de cuotas (refinanciamiento)
router.put('/recalcular-plan/:iddeuda', recalcularPlanCtrl);

// ============================================
// RUTAS DE APLICACIÓN DE PAGOS
// ============================================

// Aplicar un pago a las cuotas pendientes (FIFO automático)
router.post('/aplicar-pago', aplicarPagoCtrl);

// Aplicar un pago a una cuota específica (sin FIFO)
router.post('/aplicar-pago-cuota-especifica', aplicarPagoCuotaEspecificaCtrl);

// Simular aplicación de pago (sin guardar en BD)
router.post('/simular-pago', simularPagoCtrl);

// ============================================
// RUTAS DE CONSULTA
// ============================================

// Listar cuotas de una deuda específica
router.get('/listar/:iddeuda', listarCuotasCtrl);

// Listar cuotas pendientes de un cliente
router.get('/listar-pendientes-cliente/:idcliente', listarCuotasPendientesClienteCtrl);

// Obtener detalle de una cuota específica
router.get('/detalle-cuota/:iddetalle_cuota', obtenerDetalleCuotaCtrl);

// Obtener historial de pagos de una deuda con distribución
router.get('/historial-pagos/:iddeuda', obtenerHistorialPagosCtrl);

// ============================================
// RUTAS DE CÁLCULO DE INTERESES
// ============================================

// Calcular intereses punitorios para cuotas vencidas
// (Normalmente ejecutado por cron job, pero también disponible manualmente)
router.post('/calcular-intereses', calcularInteresesCtrl);

export default router;
