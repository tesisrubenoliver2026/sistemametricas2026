import express from 'express';
import {
  getAllProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  getProveedoresByUser,
  getReporteProveedoresData,
  generateReporteProveedoresPDF
} from '../controllers/proveedorController.js';
import { requireRol } from '../middlewares/authMiddleware.js';
import { verifyToken } from '../middlewares/verifyToken.js';
const router = express.Router();

router.use(verifyToken);
router.use(requireRol(['Administrador', 'Cajero']));
router.get('/listadopaginado', getProveedoresByUser);

// GET datos para reporte de proveedores (sin PDF)
router.get('/reporte/data', getReporteProveedoresData);

// GET generar PDF del reporte de proveedores
router.get('/reporte/pdf', generateReporteProveedoresPDF);

router.get('/', getProveedoresByUser);
router.get('/:id', getProveedorById);
router.post('/', createProveedor);
router.put('/:id', updateProveedor);
router.delete('/:id', deleteProveedor);

export default router;
