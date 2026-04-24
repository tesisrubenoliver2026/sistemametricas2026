import express from 'express';
import {
  getEmailConfig,
  saveEmailConfig,
  testEmailConfig,
  deleteEmailConfig,
  updateEmailStatus,
  updateNotificationFlags
} from '../controllers/emailConfigController.js';
import { authMiddleware, requireRol } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ========== TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN ==========
router.use(authMiddleware);

// ========== RUTAS ACCESIBLES SOLO PARA ADMINISTRADORES ==========

// Obtener configuración de email del usuario
router.get('/', requireRol(['Administrador']), getEmailConfig);

// Crear o actualizar configuración de email
router.post('/', requireRol(['Administrador']), saveEmailConfig);

// Probar configuración (enviar email de prueba)
router.post('/test', requireRol(['Administrador']), testEmailConfig);

// Actualizar estado (activar/desactivar)
router.patch('/status', requireRol(['Administrador']), updateEmailStatus);

// Actualizar flags de notificación
router.patch('/notifications', requireRol(['Administrador']), updateNotificationFlags);

// Eliminar configuración
router.delete('/', requireRol(['Administrador']), deleteEmailConfig);

export default router;
