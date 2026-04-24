// routes/Producto/productoDetalleRoutes.js
import express from 'express';
import {
  getDetalles,
  guardarDetalles,
  eliminarDetalle
} from '../../controllers/Producto/productoDetalleController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware de autenticación
router.use(authMiddleware);

// ✅ Obtener detalles de un producto
router.get('/:idproducto', getDetalles);

// ✅ Guardar detalles de un producto (reemplaza los existentes)
router.post('/', guardarDetalles);

// ✅ Eliminar un detalle específico
router.delete('/:iddetalle', eliminarDetalle);

export default router;
