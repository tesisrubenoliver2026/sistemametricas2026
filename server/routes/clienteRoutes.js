import express from 'express';
import {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  getClientesByUser,
  getReporteClientesData,
  generateReporteClientesPDF
} from '../controllers/clienteController.js';
import {requireRol} from '../middlewares/authMiddleware.js'
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

// ✅ Middleware de autenticación (verifica cookie o header)
router.use(verifyToken);
// ✅ 2. Verifica autorización (solo Administrador o Cajero)
router.use(requireRol(['Administrador', 'Cajero']));
// GET listado de clientes con paginado y búsqueda
router.get('/', getClientesByUser);

router.get('/listadopaginado', getClientesByUser);

// GET datos para reporte de clientes (sin PDF)
router.get('/reporte/data', getReporteClientesData);

// GET generar PDF del reporte de clientes con filtro
router.get('/reporte/pdf', generateReporteClientesPDF);

// GET un cliente específico
router.get('/:id', getClienteById);

// POST crear cliente
router.post('/', createCliente);

// PUT actualizar cliente
router.put('/:id', updateCliente);

// DELETE eliminar cliente (soft delete)
router.delete('/:id', deleteCliente);

export default router;
