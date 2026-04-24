import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken.js';
import { requireRol } from '../../middlewares/authMiddleware.js';
import {
  getAllSalarios,
  getSalariosByEmpleado,
  getSalarioById,
  getSalarioVigenteByEmpleado,
  createSalario,
  closeSalarioVigente,
  updateSalario,
  deleteSalario
} from '../../controllers/RRHH/salarioController.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRol(['Administrador', 'Cajero']));

router.get('/', getAllSalarios);
router.get('/empleado/:idempleado', getSalariosByEmpleado);
router.get('/empleado/:idempleado/vigente', getSalarioVigenteByEmpleado);
router.get('/:id', getSalarioById);
router.post('/', createSalario);
router.put('/empleado/:idempleado/cerrar-vigente', closeSalarioVigente);
router.put('/:id', updateSalario);
router.delete('/:id', deleteSalario);

export default router;
