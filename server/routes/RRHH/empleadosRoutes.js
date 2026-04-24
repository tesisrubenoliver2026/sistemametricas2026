import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken.js';
import { requireRol } from '../../middlewares/authMiddleware.js';
import {
  getEmpleados,
  getEmpleadoById,
  createEmpleado,
  updateEmpleado,
  changeEstadoEmpleado,
  deleteEmpleado
} from '../../controllers/RRHH/empleadoController.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRol(['Administrador', 'Cajero']));

router.get('/', getEmpleados);
router.get('/:id', getEmpleadoById);
router.post('/', createEmpleado);
router.put('/:id', updateEmpleado);
router.put('/:id/estado', changeEstadoEmpleado);
router.delete('/:id', deleteEmpleado);

export default router;
