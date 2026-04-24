import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken.js';
import { requireRol } from '../../middlewares/authMiddleware.js';
import {
  getAllComisiones,
  getComisionesByEmpleado,
  getComisionById,
  createComision,
  updateComision,
  deleteComision
} from '../../controllers/RRHH/comisionController.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRol(['Administrador', 'Cajero']));

router.get('/', getAllComisiones);
router.get('/empleado/:idempleado', getComisionesByEmpleado);
router.get('/:id', getComisionById);
router.post('/', createComision);
router.put('/:id', updateComision);
router.delete('/:id', deleteComision);

export default router;
