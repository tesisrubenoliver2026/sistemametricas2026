import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken.js';
import { requireRol } from '../../middlewares/authMiddleware.js';
import {
  getAllAsistencias,
  getAsistenciasByEmpleado,
  getAsistenciaById,
  createAsistencia,
  createOrUpdateAsistencia,
  updateAsistencia,
  deleteAsistencia
} from '../../controllers/RRHH/asistenciaController.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRol(['Administrador', 'Cajero']));

router.get('/', getAllAsistencias);
router.get('/empleado/:idempleado', getAsistenciasByEmpleado);
router.get('/:id', getAsistenciaById);
router.post('/', createAsistencia);
router.post('/upsert', createOrUpdateAsistencia);
router.put('/:id', updateAsistencia);
router.delete('/:id', deleteAsistencia);

export default router;
