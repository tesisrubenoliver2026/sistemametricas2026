import dotenv from "dotenv";
import path from "path";
import express from 'express';
import db from './db.js';
import cors from 'cors';
import productoRoutes from './routes/productoRoutes.js';
import categoriaRoutes from './routes/categoriaRoutes.js';
import proveedorRoutes from './routes/proveedorRoutes.js';
import configuracion from './routes/Facturacion/configuracion.js'
import detalleProductoRoutes from './routes/detalleProductoRoutes.js';
import compraRoutes from './routes/Compra/compraRoutes.js';
import cobroDeudaVentaRoutes from './routes/Venta/cobroDeudaVentaRoutes.js'
import cuotasRoutes from './routes/Venta/cuotasRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js'
import ventasProgramadasRoutes from './routes/Venta/ventasProgramadasRoutes.js';
import ventaRoutes from './routes/Venta/ventaRoutes.js';
import detalleCompraRoutes from './routes/Compra/detalleCompra.js';
import clienteRoutes from './routes/clienteRoutes.js';
import actividadesEconomicasRoutes from './routes/Facturacion/actividadesEconomicasRoutes.js';
import facturadorRoutes from './routes/Facturacion/facturadorRoutes.js'
import deudaCompraRoutes from './routes/Compra/deudaCompraRoutes.js'
import movimientoCajaRoutes from './routes/movimientoCajaRoutes.js';
import arqueoRoutes from './routes/Movimiento/arqueoRoutes.js';
import detalleActivEconRoutes from './routes/Facturacion/detalleActivEconRoutes.js';
import ingresoRoutes from './routes/Movimiento/ingresos.js';
import tipoIngresoRoutes from './routes/Movimiento/tipoIngresoRoutes.js';
import tipoEgresoRoutes from './routes/Movimiento/tipoEgresoRoutes.js';
import egresoRoutes from './routes/Movimiento/egresos.js';
import formasPagoRoutes from './routes/formasPagoRoutes.js';
import datosBancariosRoutes from './routes/DatosBancarios/datosBancariosRoutes.js';
import authRoutes from './routes/authRoutes.js';
import backupRoutes from './routes/backupRoutes.js';
import funcionarioRoutes from './routes/funcionarioRoutes.js';
import emailConfigRoutes from './routes/emailConfigRoutes.js';
import voiceRoutes from './routes/Voice/voiceRoutes.js';
import libroDiarioRoutes from './routes/Contabilidad/libroDiarioRoutes.js';
import libroMayorRoutes from './routes/Contabilidad/libroMayorRoutes.js';
import productoDetalleRoutes from './routes/Producto/productoDetalleRoutes.js';
import loteProductoRoutes from './routes/Producto/loteProductoRoutes.js';
import empleadosRoutes from './routes/RRHH/empleadosRoutes.js';
import salariosRoutes from './routes/RRHH/salariosRoutes.js';
import asistenciasRoutes from './routes/RRHH/asistenciasRoutes.js';
import horasExtrasRoutes from './routes/RRHH/horasExtrasRoutes.js';
import comisionesRoutes from './routes/RRHH/comisionesRoutes.js';
import amonestacionesRoutes from './routes/RRHH/amonestacionesRoutes.js';
import liquidacionesRoutes from './routes/RRHH/liquidacionesRoutes.js';
import detalleLiquidacionRoutes from './routes/RRHH/detalleLiquidacionRoutes.js';
import movimientosRRHHRoutes from './routes/RRHH/movimientosRRHHRoutes.js';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import procesarVentasProgramadas from './controllers/Ventas/procesarVentasProgramadas.js';
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
console.log("ENV loaded?", process.env.MAIL_HOST, process.env.MAIL_USER);
const app = express();

app.use(cookieParser());


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8081",
  "http://127.0.0.1:5173",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  'http://181.123.181.252:8081',
  "https://8ea2aedc8674.ngrok-free.app",
  "https://ubiquitous-croissant-e58062.netlify.app",
  "https://api.kjhjhkjhkj.shop",
  "file://",
  "https://sistemaprueba2026.online",   // ← AGREGAR
  "https://www.sistemaprueba2026.online" // ← AGREGAR
];

// URLs de prueba - usuarios creados desde estos orígenes serán marcados como testUser
const testOrigins = [
  "https://pruebas-cliente.netlify.app",
  "http://127.0.0.1:5174",
  "http://localhost:5174",
];

// Middleware para detectar origen de pruebas e inyectar testUser
const injectTestUserFlag = (req, res, next) => {
  const origin = req.headers.origin || '';
  const host = req.headers.host || '';

  const isTest =
    testOrigins.includes(origin) ||
    host.includes('5174');

  req.isTestUser = isTest;

  if (isTest) {
    console.log('🧪 TEST USER detectado →', origin || host);
  }

  next();
};

// Combinar orígenes permitidos (producción + pruebas)
const allAllowedOrigins = [...allowedOrigins, ...testOrigins];

app.use(cors({
  origin(origin, callback) {
    // origin === undefined cuando es request del mismo servidor o Postman
    if (!origin || allAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Rutas

app.use('/api/productos', productoRoutes);
app.use('/api/producto-detalle', productoDetalleRoutes);
app.use('/api/lotes-producto', loteProductoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/detallesproductos', detalleProductoRoutes);

// Ventas
app.use('/api/ventas', ventaRoutes);
app.use('/api/deuda-venta', cobroDeudaVentaRoutes);
app.use('/api/cuotas-venta', cuotasRoutes);
app.use('/api/actividades-economicas', actividadesEconomicasRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/usuario', injectTestUserFlag, usuarioRoutes);
app.use('/api/funcionarios', injectTestUserFlag, funcionarioRoutes);
app.use('/api/movimientos', movimientoCajaRoutes);

// Ventas Programadas
app.use('/api/ventas-programadas', ventasProgramadasRoutes);

app.use('/api/configuracion', configuracion);
app.use('/api/email-config', emailConfigRoutes);

//Facturador
app.use('/api/facturador', facturadorRoutes);
app.use('/api/detalle-activ-econ', detalleActivEconRoutes);

// Compras
app.use('/api/deuda-compra', deudaCompraRoutes);
app.use('/api/detalle-compra', detalleCompraRoutes);
app.use('/api/compras', compraRoutes);

//Ingresos
app.use('/api/ingresos', ingresoRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/tipo-ingreso', tipoIngresoRoutes);

// Egresos
app.use('/api/egresos', egresoRoutes);
app.use('/api/tipo-egreso', tipoEgresoRoutes);

// Arqueo
app.use('/api/arqueo', arqueoRoutes);
app.use('/api/auth', authRoutes);

// Formas de pago
app.use('/api', formasPagoRoutes);

// Datos Bancarios
app.use('/api/datos-bancarios', datosBancariosRoutes);

// Contabilidad - Libro Diario
app.use('/api/libro-diario', libroDiarioRoutes);

// Contabilidad - Libro Mayor
app.use('/api/libro-mayor', libroMayorRoutes);

// RRHH
app.use('/api/rrhh/empleados', empleadosRoutes);
app.use('/api/rrhh/salarios', salariosRoutes);
app.use('/api/rrhh/asistencias', asistenciasRoutes);
app.use('/api/rrhh/horas-extras', horasExtrasRoutes);
app.use('/api/rrhh/comisiones', comisionesRoutes);
app.use('/api/rrhh/amonestaciones', amonestacionesRoutes);
app.use('/api/rrhh/liquidaciones', liquidacionesRoutes);
app.use('/api/rrhh/detalle-liquidacion', detalleLiquidacionRoutes);
app.use('/api/rrhh/movimientos', movimientosRRHHRoutes);

// Ruta para realizar respaldo de BD
app.use('/api/utils', backupRoutes);

// Puerto del servidor
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST ?? 'localhost'; 
app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
});

cron.schedule('*/5 * * * *', async () => {
  try {
    // Consulta si ventas_programadas está habilitado
    const [rows] = await db.promise().query(`
      SELECT valor FROM configuracion
      WHERE clave = 'ventas_programadas'
      LIMIT 1
    `);

    if (rows.length > 0 && rows[0].valor === 'true') {
      console.log('🚀 Ejecutando proceso de ventas programadas...');
      await procesarVentasProgramadas();
      console.log('✅ Proceso de ventas programadas completado.');
    } else {
      console.log('⚠️  Sistema de ventas programadas deshabilitado.');
    }
  } catch (error) {
    console.error('❌ Error al verificar configuración de ventas programadas:', error);
  }
});
