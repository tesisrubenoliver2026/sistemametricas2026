import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken.js';
import { requireRol } from '../../middlewares/authMiddleware.js';
import {
  getDetallesByLiquidacion,
  getDetalleLiquidacionById,
  createDetalleLiquidacion,
  updateDetalleLiquidacion,
  deleteDetalleLiquidacion,
  deleteDetallesByLiquidacion
} from '../../controllers/RRHH/detalleLiquidacionController.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRol(['Administrador', 'Cajero']));

router.get('/liquidacion/:idliquidacion', getDetallesByLiquidacion);
router.get('/:id', getDetalleLiquidacionById);
router.post('/', createDetalleLiquidacion);
router.put('/:id', updateDetalleLiquidacion);
router.delete('/:id', deleteDetalleLiquidacion);
router.delete('/liquidacion/:idliquidacion', deleteDetallesByLiquidacion);

export default router;
