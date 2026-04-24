import express from 'express';
import {
  getConfiguraciones,
  setConfiguracion,
  getConfiguracionByClave,
  getValorConDefault,
  deleteConfiguracion,
  updateConfiguration
} from '../../controllers/configuracionController.js';
import { authMiddleware, requireRol } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// ========== TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN ==========
router.use(authMiddleware);

// ========== RUTAS ACCESIBLES SOLO PARA ADMINISTRADORES ==========
// El middleware requireRol ya está siendo aplicado, pero el controller también valida

// Obtener todas las configuraciones del usuario
router.get('/', requireRol(['Administrador']), getConfiguraciones);

// Crear o actualizar una configuración
router.post('/', requireRol(['Administrador']), setConfiguracion);

router.post('/update', requireRol(['Administrador']), updateConfiguration);

// Eliminar una configuración
router.delete('/:clave', requireRol(['Administrador']), deleteConfiguracion);

// ⚠️ IMPORTANTE: Las rutas más específicas deben ir ANTES de las genéricas

// Obtener configuración como string
router.get('/string/:clave', requireRol(['Administrador']), getConfiguracionByClave);

// Obtener configuración con valor por defecto (devuelve boolean)
router.get('/valor/:clave', requireRol(['Administrador']), getValorConDefault);

// Obtener configuración genérica (puede ser redundante con /string/:clave)
router.get('/:clave', requireRol(['Administrador']), getConfiguracionByClave);

export default router;
