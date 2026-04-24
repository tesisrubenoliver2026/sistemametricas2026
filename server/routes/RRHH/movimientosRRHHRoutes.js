import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken.js';
import { requireRol } from '../../middlewares/authMiddleware.js';
import {
  getAllMovimientosRRHH,
  getMovimientosRRHHByEmpleado,
  getMovimientoRRHHById,
  createMovimientoRRHH,
  updateMovimientoRRHH,
  deleteMovimientoRRHH,
} from '../../controllers/RRHH/movimientoRRHHController.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRol(['Administrador', 'Cajero']));

router.get('/', getAllMovimientosRRHH);
router.get('/empleado/:idempleado', getMovimientosRRHHByEmpleado);
router.get('/:id', getMovimientoRRHHById);
router.post('/', createMovimientoRRHH);
router.put('/:id', updateMovimientoRRHH);
router.delete('/:id', deleteMovimientoRRHH);

export default router;

