import express from "express";
import {
  parseVoiceToIncome,
  parseAndRegisterIncome,
  parseVoiceToExpense,
  parseAndRegisterExpense,
  parseVoiceToProvider,
  parseAndExecuteProviderAction,
  chatProvider,
  clearProviderChat,
  checkOllamaHealth,
} from "../../controllers/Voice/voiceController.js";
import { chatCliente } from "../../controllers/Voice/voiceClienteController.js";
import { chatFacturador } from "../../controllers/Voice/voiceFacturadorController.js";
import {
  getMetricsSnapshot,
  chatMetricas,
  analizarImagen,
} from "../../controllers/Voice/voiceMetricasController.js";
import { reconocerProducto } from "../../controllers/Voice/reconocimientoProductoController.js";
import { verifyToken } from '../../middlewares/verifyToken.js';

const router = express.Router();

// Verificar salud de Ollama
router.get("/health", checkOllamaHealth);

// Parsear comando de voz/chat a ingreso (solo parsea, NO registra)
router.post("/parse-income", verifyToken, parseVoiceToIncome);

// Parsear Y REGISTRAR ingreso directamente en la BD
router.post("/register-income", verifyToken, parseAndRegisterIncome);

// ========== EGRESOS ==========
// Parsear comando de chat a egreso (solo parsea, NO registra)
router.post("/parse-expense", verifyToken, parseVoiceToExpense);

// Parsear Y REGISTRAR egreso directamente en la BD
router.post("/register-expense", verifyToken, parseAndRegisterExpense);

// ========== PROVEEDORES ==========
// Parsear comando de chat para proveedores (solo parsea, NO ejecuta)
router.post("/parse-provider", verifyToken, parseVoiceToProvider);

// Parsear Y EJECUTAR acción sobre proveedor (crear, editar o eliminar)
router.post("/execute-provider-action", verifyToken, parseAndExecuteProviderAction);

// Chat conversacional para proveedores (mantiene contexto y hace preguntas)
router.post("/chat-provider", verifyToken, chatProvider);

// Limpiar contexto de conversación
router.post("/clear-chat", verifyToken, clearProviderChat);

// ========== CLIENTES ==========
// Chat conversacional para clientes (mantiene contexto y hace preguntas)
router.post("/chat-cliente", verifyToken, chatCliente);

// ========== FACTURADORES ==========
// Chat conversacional para facturadores (mantiene contexto y hace preguntas)
router.post("/chat-facturador", verifyToken, chatFacturador);

// ========== MÉTRICAS (IA) ==========
// Snapshot de métricas (para dashboards y contexto del chat)
router.get("/metrics-snapshot", verifyToken, getMetricsSnapshot);

// Chat para explicar métricas y sugerir acciones
router.post("/chat-metricas", verifyToken, chatMetricas);

// Multimodal (imagen -> análisis con modelo vision)
router.post("/vision-analyze", verifyToken, analizarImagen);

// Reconocimiento de producto por imagen
router.post("/reconocer-producto", verifyToken, reconocerProducto);

export default router;
