import express from 'express';
import {
  getMovimientos,
  getMovimientoById,
  crearMovimiento,
  cerrarMovimiento,
  cerrarCaja,
  getResumenCaja,
  getMovimientosPaginated,
  hayCajaAbierta,
  generateLibroCajaPDF
} from '../controllers/movimientoCajaController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();
router.use(verifyToken);

// Ruta de reporte (debe ir antes de rutas con parámetros)
router.get('/libro-caja/pdf', generateLibroCajaPDF);

router.get('/abierta', hayCajaAbierta);
router.get('/paginado', getMovimientosPaginated);
router.get('/resumen/:id', getResumenCaja);
router.get('/', getMovimientos);
router.get('/:id', getMovimientoById);
router.post('/', crearMovimiento);
router.put('/cerrar/:id', cerrarMovimiento);
router.put('/cerrarCaja/:id', cerrarCaja);


export default router;
