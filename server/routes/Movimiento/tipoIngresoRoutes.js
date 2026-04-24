import express from 'express';
import {
  crearTipoIngreso,
  anularTipoIngreso,
  listarTiposIngresoPag
} from '../../controllers/Movimiento/tipoIngresoController.js';


import { verifyToken } from '../../middlewares/verifyToken.js';
import { requireAnyRole } from '../../middlewares/roleAccessMiddleware.js';
const router = express.Router();

// ✅ Middleware de autenticación (verifica cookie o header)
router.use(verifyToken);

// ✅ Verifica autorización - Todos los roles con acceso a Finanzas
router.use(requireAnyRole(['Administrador', 'Cajero', 'Vendedor', 'Gerente', 'Supervisor']));

router.post('/crear', crearTipoIngreso);
router.get('/listar', listarTiposIngresoPag);
router.delete('/anular/:id', anularTipoIngreso);

export default router;
