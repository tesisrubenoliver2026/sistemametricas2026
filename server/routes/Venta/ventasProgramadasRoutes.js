// routes/VentasProgramadas/ventasProgramadasRoutes.js

import express from 'express';
import {
  createVentaProgramada,
  getVentasProgramadasPaginated,
  anularVentaProgramada,
  getVentasProgramadasPorCliente,
  getVentasProgramadasPaginatedCajero
} from '../../controllers/Ventas/ventasProgramadasController.js';

import { verifyToken } from '../../middlewares/verifyToken.js';
import { requireAnyRole } from '../../middlewares/roleAccessMiddleware.js';
const router = express.Router();

// ✅ Middleware de autenticación (verifica cookie o header)
router.use(verifyToken);

// ✅ Verifica autorización - Todos los roles con acceso a Finanzas
router.use(requireAnyRole(['Administrador', 'Cajero', 'Vendedor', 'Gerente', 'Supervisor']));

// ✅ Middleware de roles para todas las rutas de ventas programadas
//router.use(requireRol(['Administrador', 'Cajero']));

// ✅ Crear venta programada
router.post('/', createVentaProgramada);

// ✅ Listar ventas programadas con paginación y búsqueda (filtrado por usuario)
router.get('/', getVentasProgramadasPaginated);

// 📝 NOTA: /listadopaginado es un alias de / para compatibilidad con frontend antiguo
router.get('/listadopaginado', getVentasProgramadasPaginatedCajero);

router.put('/anular/:id', anularVentaProgramada);

router.get('/cliente/:idcliente', getVentasProgramadasPorCliente);

export default router;
