import express from 'express';
import {
  listarDatosBancarios,
  obtenerDatoBancario,
  crearDatoBancario,
  eliminarDatoBancario,
  getAllDatosBancariosPaginated,
  editarDatosBancarios,
  getDatosBancariosByUser
} from '../../controllers/DatosBancarios/datosBancariosController.js';
import {requireRol} from '../../middlewares/authMiddleware.js'
import { verifyToken } from '../../middlewares/verifyToken.js';

const router = express.Router();

// ✅ Middleware de autenticación (verifica cookie o header)
router.use(verifyToken);
// ✅ 2. Verifica autorización (solo Administrador o Cajero)
router.use(requireRol(['Administrador', 'Cajero']));
// Rutas con filtrado por usuario (debe ir antes de las rutas genéricas)
router.get('/user/paginated', getDatosBancariosByUser);

// Rutas generales
router.get('/paginated', getAllDatosBancariosPaginated);
router.get('/', listarDatosBancarios);
router.get('/:id', obtenerDatoBancario);
router.post('/', crearDatoBancario);
router.delete('/:id', eliminarDatoBancario);
router.put('/:id', editarDatosBancarios);

export default router;
