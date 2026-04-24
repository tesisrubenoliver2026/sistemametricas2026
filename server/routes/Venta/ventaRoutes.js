import express from 'express';
import {
  createVenta,
  getVentas,
  getVentaById,
  deleteVenta,
  comprobanteVenta,
  getResumenVentasDia,
  getVentasPorMes,
  getProgresoMetaMensual,
  getEstadisticasVentas,
  getProductosMasVendidos,
  getVentasCajero,
  getGanancias,
  getReporteVentasData,
  generateReporteVentasPDF,
  generateLibroVentasSET
} from '../../controllers/Ventas/ventaController.js';
import { verificarFechaVenciLote } from '../../controllers/Ventas/Validaciones/verificarFechaVenciLote.js';
import { verificarFechaSimulada } from '../../controllers/Ventas/Validaciones/verificarFechaSimulada.js';
import { verificarFechaVencimiento } from '../../controllers/Ventas/verificarFechaVencimiento.js';
import { simularDetallesVenta } from '../../controllers/Ventas/simularDetallesVenta.js';

import { verifyToken } from '../../middlewares/verifyToken.js';
import { requireAnyRole } from '../../middlewares/roleAccessMiddleware.js';
const router = express.Router();

// ✅ Middleware de autenticación (verifica cookie o header)
router.use(verifyToken);

// ✅ Verifica autorización - Todos los roles con acceso a Finanzas
router.use(requireAnyRole(['Administrador', 'Cajero', 'Vendedor', 'Gerente', 'Supervisor']));

// Rutas de reportes (deben ir antes de las rutas con parámetros)
router.get('/reporte/data', getReporteVentasData);
router.get('/reporte/pdf', generateReporteVentasPDF);
router.get('/libro-ventas/pdf', generateLibroVentasSET);

// Todas estas rutas ya están protegidas por rol:
router.post('/', createVenta);
router.get('/listadopaginado', getVentasCajero);   
router.get('/ganancias', getGanancias);
router.get('/estadisticas-anuales', getEstadisticasVentas);
router.get('/productos-mas-vendidos', getProductosMasVendidos);
router.get('/progreso-meta-mensual', getProgresoMetaMensual);
router.get('/resumen-ventas-dia', getResumenVentasDia);
router.get('/ventas-mensuales', getVentasPorMes);
router.get('/', getVentas);
router.get('/:id', getVentaById);
router.delete('/:id', deleteVenta);
router.post('/verificar-fecha-vencimiento-simulador', verificarFechaSimulada);
router.post('/verificar-fecha-vencimiento-lote', verificarFechaVenciLote);
router.post('/verificar-fecha-vencimiento', verificarFechaVencimiento);
router.get('/comprobante/:id', comprobanteVenta);
router.post('/preparar-detalles', simularDetallesVenta);


export default router;
