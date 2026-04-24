import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken.js';
import { requireRol } from '../../middlewares/authMiddleware.js';
import {
  getAllAmonestaciones,
  getAmonestacionesByEmpleado,
  getAmonestacionById,
  createAmonestacion,
  updateAmonestacion,
  deleteAmonestacion
} from '../../controllers/RRHH/amonestacionController.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRol(['Administrador', 'Cajero']));

router.get('/', getAllAmonestaciones);
router.get('/empleado/:idempleado', getAmonestacionesByEmpleado);
router.get('/:id', getAmonestacionById);
router.post('/', createAmonestacion);
router.put('/:id', updateAmonestacion);
router.delete('/:id', deleteAmonestacion);

export default router;
