import express from 'express';
import {
  getComprasPorMes,
  createCompra,
  getCompras,
  getCompraById,
  deleteCompra,
  getResumenComprasDia,
  getComprasCajero,
  getReporteComprasData,
  generateReporteComprasPDF,
  generateLibroComprasSET
} from '../../controllers/Compras/compraController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { requireAnyRole } from '../../middlewares/roleAccessMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

// ✅ Verifica autorización - Todos los roles con acceso a Finanzas + Almacenero
router.use(requireAnyRole(['Administrador', 'Cajero', 'Vendedor', 'Gerente', 'Supervisor', 'Almacenero']));

// Rutas de reportes (deben ir antes de las rutas con parámetros)
router.get('/reporte/data', getReporteComprasData);
router.get('/reporte/pdf', generateReporteComprasPDF);
router.get('/libro-compras/pdf', generateLibroComprasSET);

router.get('/listado-por-mes', getComprasPorMes);
router.get('/listadopaginado', getComprasCajero);
router.get('/resumen-dia', getResumenComprasDia);
router.get('/', getCompras);

router.get('/:id', getCompraById);
router.post('/', createCompra);
router.delete('/:id', deleteCompra);


export default router;
