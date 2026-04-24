// routes/Producto/loteProductoRoutes.js
import express from 'express';
import { getLotesByProducto } from '../../controllers/Producto/loteProductoController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware de autenticación
router.use(authMiddleware);

// ✅ Obtener lotes de un producto (para ventas)
router.get('/producto/:idproducto', getLotesByProducto);

export default router;
