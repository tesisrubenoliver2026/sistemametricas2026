import express from 'express';
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getUsuariosPaginated,
  getMiCargo,
  registerUsuario
} from '../controllers/usuarioController.js';

import { authMiddleware, requireRol } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ========== RUTA PÚBLICA (SIN AUTENTICACIÓN) ==========
// Endpoint de registro para nuevos usuarios (sistema online)
router.post('/register', registerUsuario);

// ========== RUTAS PROTEGIDAS (CON AUTENTICACIÓN) ==========
// Solo usuarios autenticados pueden acceder a las rutas siguientes
router.use(authMiddleware);

// Rutas accesibles solo para Administrador
router.get('/', requireRol(['Administrador']), getUsuarios);
router.get('/paginar', requireRol(['Administrador']), getUsuariosPaginated);
router.post('/', requireRol(['Administrador']), createUsuario);

// Ruta accesible para todos los usuarios autenticados (administradores y funcionarios)
router.get('/mi-cargo', getMiCargo);

// Rutas accesibles para Administrador y Auditor
router.get('/:id', requireRol(['Administrador', 'Auditor']), getUsuarioById);

// Modificar solo Administrador
router.put('/:id', requireRol(['Administrador']), updateUsuario);
router.delete('/:id', requireRol(['Administrador']), deleteUsuario);


export default router;
