import express from 'express';
import {
  getFuncionarios,
  getAllFuncionarios,
  getFuncionarioById,
  createFuncionario,
  updateFuncionario,
  updatePassword,
  deleteFuncionario,
  changeStatus,
  getFuncionariosByUsuario
} from '../controllers/funcionarioController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { requireRol } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas públicas (ninguna para funcionarios)

// Rutas protegidas - requieren autenticación
router.use(verifyToken);

// Obtener todos los funcionarios sin paginación (para selects)
router.get('/all', getAllFuncionarios);

// Obtener funcionarios por usuario
router.get('/usuario/:idusuarios', getFuncionariosByUsuario);

// Obtener funcionarios con paginación y búsqueda
router.get('/', getFuncionarios);

// Obtener funcionario por ID
router.get('/:id', getFuncionarioById);

// Crear funcionario - requiere rol Administrador
router.post('/', requireRol(['Administrador']), createFuncionario);

// Actualizar funcionario - requiere rol Administrador
router.put('/:id', requireRol(['Administrador']), updateFuncionario);

// Actualizar contraseña - requiere rol Administrador
router.put('/:id/password', requireRol(['Administrador']), updatePassword);

// Cambiar estado - requiere rol Administrador
router.put('/:id/status', requireRol(['Administrador']), changeStatus);

// Eliminar funcionario (soft delete) - requiere rol Administrador
router.delete('/:id', requireRol(['Administrador']), deleteFuncionario);

export default router;
