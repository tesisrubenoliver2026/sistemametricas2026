import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken.js';
import { requireRol } from '../../middlewares/authMiddleware.js';
import {
  getAllHorasExtras,
  getHorasExtrasByEmpleado,
  getHoraExtraById,
  createHoraExtra,
  updateHoraExtra,
  deleteHoraExtra
} from '../../controllers/RRHH/horaExtraController.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRol(['Administrador', 'Cajero']));

router.get('/', getAllHorasExtras);
router.get('/empleado/:idempleado', getHorasExtrasByEmpleado);
router.get('/:id', getHoraExtraById);
router.post('/', createHoraExtra);
router.put('/:id', updateHoraExtra);
router.delete('/:id', deleteHoraExtra);

export default router;
