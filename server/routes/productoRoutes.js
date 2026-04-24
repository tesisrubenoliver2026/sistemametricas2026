import express from 'express';
import {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  getProductosByUser,
  getReporteProductos
} from '../controllers/Producto/productoController.js';

import { registrarProductoInventarioInicial } from '../controllers/Producto/registrarProductoInventarioInicial.js';
import {requireRol} from '../middlewares/authMiddleware.js'
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

// ✅ Middleware de autenticación (verifica cookie o header)
router.use(verifyToken);
// ✅ 2. Verifica autorización (solo Administrador o Cajero)
router.use(requireRol(['Administrador', 'Cajero']));
router.get('/listadopaginado', getProductosByUser);
router.get('/reporteproductopdf', getReporteProductos)
router.get('/', getAllProductos);
router.post('/inventario-inicial', registrarProductoInventarioInicial);
router.get('/:id', getProductoById);
router.post('/', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);

export default router;
