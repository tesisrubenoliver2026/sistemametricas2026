import express from 'express';
import {
  createFacturador,
  getAllFacturadores,
  getFacturadorById,
  updateFacturador,
  culminarFacturador,
  deleteFacturador,
  getReporteFacturadoresData,
  generateReporteFacturadoresPDF
} from '../../controllers/facturadorController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { requireAnyRole } from '../../middlewares/roleAccessMiddleware.js';

const router = express.Router();
router.use(authMiddleware);
router.use(requireAnyRole(['Administrador', 'Cajero', 'Vendedor', 'Gerente', 'Supervisor', 'Almacenero']));
// ✅ Endpoints de reportes (deben ir antes de las rutas con parámetros)
router.get('/reporte/data', getReporteFacturadoresData);
router.get('/reporte/pdf', generateReporteFacturadoresPDF);

// ✅ Endpoints CRUD
router.post('/', createFacturador);
router.get('/', getAllFacturadores);
router.get('/:id', getFacturadorById);
router.put('/:id', updateFacturador);
router.put('/culminar/:id', culminarFacturador);
router.delete('/:id', deleteFacturador);

export default router;
