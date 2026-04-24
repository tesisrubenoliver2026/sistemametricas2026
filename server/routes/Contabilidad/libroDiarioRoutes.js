import express from 'express';
import { generateLibroDiarioPDF } from '../../controllers/Contabilidad/libroDiarioController.js';
import { verifyToken } from '../../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);

// Ruta para generar PDF del Libro Diario
router.get('/pdf', generateLibroDiarioPDF);

export default router;
