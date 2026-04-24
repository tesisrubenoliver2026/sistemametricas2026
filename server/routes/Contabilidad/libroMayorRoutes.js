import express from 'express';
import { generateLibroMayorPDF } from '../../controllers/Contabilidad/libroMayorController.js';
import { verifyToken } from '../../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);

// Ruta para generar PDF del Libro Mayor
router.get('/pdf', generateLibroMayorPDF);

export default router;
