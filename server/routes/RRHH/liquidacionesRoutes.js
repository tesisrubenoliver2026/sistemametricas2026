import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken.js';
import { requireRol } from '../../middlewares/authMiddleware.js';
import {
  getAllLiquidaciones,
  getLiquidacionesByEmpleado,
  getLiquidacionById,
  preLiquidacion,
  preLiquidacionPDF,
  createLiquidacion,
  liquidacionPDFById,
  updateTotalesLiquidacion,
  updateEstadoLiquidacion,
  deleteLiquidacion
} from '../../controllers/RRHH/liquidacionController.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRol(['Administrador', 'Cajero']));

router.post('/pre-liquidacion', preLiquidacion);
router.post('/pre-liquidacion/pdf', preLiquidacionPDF);
router.get('/', getAllLiquidaciones);
router.get('/empleado/:idempleado', getLiquidacionesByEmpleado);
router.get('/:id/pdf', liquidacionPDFById);
router.get('/:id', getLiquidacionById);
router.post('/', createLiquidacion);
router.put('/:id/totales', updateTotalesLiquidacion);
router.put('/:id/estado', updateEstadoLiquidacion);
router.delete('/:id', deleteLiquidacion);

export default router;
