import axios from "axios";
import Ingreso from "../../models/Movimiento/Ingreso.js";
import Egreso from "../../models/Movimiento/Egreso.js";
import MovimientoCaja from "../../models/MovimientoCaja.js";
import Funcionario from "../../models/Funcionario.js";
import Proveedor from "../../models/Proveedor.js";
import { getUserId } from "../../utils/getUserId.js";
import db from "../../db.js";

/**
 * Controlador para procesar comandos de chat/voz usando Ollama
 */

// URL de Ollama (ajusta según tu configuración)
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

/**
 * Mapa de tipos de movimiento a IDs de tipo de ingreso
 * Ajusta estos IDs según tu tabla tipo_ingreso en la BD
 */
const TIPO_INGRESO_MAP = {
  INGRESO_VENTA: 1,        // ID para ingresos por venta
  INGRESO_SERVICIO: 2,     // ID para ingresos por servicio
  INGRESO_OTROS: 3,        // ID para otros ingresos
};

/**
 * Mapa de tipos de movimiento a IDs de tipo de egreso
 * Ajusta estos IDs según tu tabla tipo_egreso en la BD
 */
const TIPO_EGRESO_MAP = {
  EGRESO_COMPRA: 1,        // ID para egresos por compra
  EGRESO_GASTO: 2,         // ID para egresos por gasto
  EGRESO_OTROS: 3,         // ID para otros egresos
};

/**
 * Obtener el ID del tipo de ingreso según el tipo de movimiento
 */
const getTipoIngresoId = (tipoMovimiento) => {
  return TIPO_INGRESO_MAP[tipoMovimiento] || TIPO_INGRESO_MAP.INGRESO_OTROS;
};

/**
 * Obtener el ID del tipo de egreso según el tipo de movimiento
 */
const getTipoEgresoId = (tipoMovimiento) => {
  return TIPO_EGRESO_MAP[tipoMovimiento] || TIPO_EGRESO_MAP.EGRESO_OTROS;
};

/**
 * Parsea un comando de chat/voz a datos estructurados de ingreso
 * Este endpoint SOLO parsea el texto, NO registra en la base de datos
 */
const parseVoiceToIncome = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        error: "El texto del comando es requerido",
      });
    }

    console.log(`📝 Procesando comando: "${text}"`);

    // Llamar a Ollama para parsear el texto
    const parsedData = await parseTextWithOllama(text);

    if (!parsedData || !parsedData.monto || parsedData.monto <= 0) {
      return res.status(400).json({
        error: "No se pudo extraer un monto válido del comando",
        parsedData,
      });
    }

    // Agregar fecha actual si no está especificada
    if (!parsedData.fecha) {
      parsedData.fecha = new Date().toISOString().split("T")[0];
    }

    console.log("✅ Datos parseados:", parsedData);

    return res.status(200).json(parsedData);
  } catch (error) {
    console.error("❌ Error en parseVoiceToIncome:", error);

    // Verificar si Ollama está disponible
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "Ollama no está disponible. Asegúrate de que esté corriendo.",
        details: "Ejecuta: ollama serve",
      });
    }

    return res.status(500).json({
      error: "Error al procesar el comando",
      details: error.message,
    });
  }
};

/**
 * Parsea Y REGISTRA un ingreso en la base de datos
 * Este endpoint completo parsea el texto y lo guarda en la BD
 */
const parseAndRegisterIncome = async (req, res) => {
  try {
    const { text } = req.body;

    // Obtener información del usuario autenticado
    const { idusuarios, idfuncionario } = getUserId(req);
    const { tipo } = req.user || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        error: "El texto del comando es requerido",
      });
    }

    if (!idusuarios && !idfuncionario) {
      return res.status(401).json({
        error: "Usuario no autenticado",
      });
    }

    console.log(`📝 Procesando y registrando comando: "${text}"`);

    // Parsear el texto con Ollama
    const parsedData = await parseTextWithOllama(text);

    if (!parsedData || !parsedData.monto || parsedData.monto <= 0) {
      return res.status(400).json({
        error: "No se pudo extraer un monto válido del comando",
        parsedData,
      });
    }

    // Obtener el ID del tipo de ingreso
    const idtipo_ingreso = getTipoIngresoId(parsedData.tipo_movimiento);

    // Obtener fecha y hora actual
    const now = new Date();
    const fecha = parsedData.fecha || now.toISOString().split("T")[0];
    const hora = now.toTimeString().split(" ")[0]; // HH:MM:SS

    // Función auxiliar para procesar el ingreso
    const procesarIngreso = (idsusuarios, idfuncionariosIds, callback) => {
      MovimientoCaja.getMovimientoAbierto(
        idsusuarios,
        idfuncionariosIds,
        (errMov, movimientoResult) => {
          if (errMov) {
            return callback({
              status: 500,
              error: "❌ Error al buscar movimiento de caja",
            });
          }

          if (!movimientoResult.length) {
            return callback({
              status: 400,
              error: "⚠️ No hay movimiento de caja abierto. Por favor, abre un movimiento primero.",
            });
          }

          const idmovimiento = movimientoResult[0].idmovimiento;

          // Preparar datos para registrar
          const ingresoData = {
            idtipo_ingreso: idtipo_ingreso,
            monto: parsedData.monto,
            concepto: parsedData.concepto || "Ingreso por chat",
            observacion: parsedData.observaciones || text,
            fecha: fecha,
            hora: hora,
            idmovimiento: idmovimiento,
            creado_por: idusuarios,
            idfuncionario: idfuncionario,
            idformapago: null, // Puedes ajustar esto según necesites
          };

          console.log("💾 Registrando ingreso:", ingresoData);

          // Crear el ingreso en la BD
          Ingreso.create(ingresoData, (err, result) => {
            if (err) {
              console.error("Error al crear ingreso:", err);
              return callback({
                status: 500,
                error: "❌ Error al registrar ingreso en la base de datos",
                details: err,
              });
            }

            // Respuesta de éxito
            callback(null, {
              ...parsedData,
              idingreso: result.insertId,
              idtipo_ingreso: idtipo_ingreso,
              idmovimiento: idmovimiento,
              fecha: fecha,
              hora: hora,
              message: "✅ Ingreso registrado exitosamente",
            });
          });
        }
      );
    };

    // Determinar si es funcionario o usuario
    if (tipo === "funcionario") {
      procesarIngreso(null, idfuncionario, (err, responseData) => {
        if (err) return res.status(err.status).json({ error: err.error, details: err.details });
        console.log("✅ Ingreso registrado:", responseData);
        return res.status(201).json(responseData);
      });
    } else {
      // Es un usuario administrador, buscar sus funcionarios relacionados
      Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
        if (err) {
          return res.status(500).json({ error: "❌ Error al buscar funcionarios" });
        }

        const funcionariosIds = funcionarios.map((f) => f.idfuncionario).join(",");

        procesarIngreso(idusuarios, funcionariosIds, (err, responseData) => {
          if (err) return res.status(err.status).json({ error: err.error, details: err.details });
          console.log("✅ Ingreso registrado:", responseData);
          return res.status(201).json(responseData);
        });
      });
    }
  } catch (error) {
    console.error("❌ Error en parseAndRegisterIncome:", error);

    return res.status(500).json({
      error: "Error al procesar y registrar el ingreso",
      details: error.message,
    });
  }
};

/**
 * Función auxiliar para parsear texto con Ollama
 */
const parseTextWithOllama = async (text) => {
  const prompt = `Eres un asistente especializado en procesar comandos de texto para registrar ingresos en un sistema de ventas.

Analiza el siguiente comando y extrae la información relevante:

Comando: "${text}"

Debes extraer:
1. **monto**: El valor numérico del ingreso (solo el número, sin símbolos ni moneda)
2. **concepto**: Breve descripción del motivo del ingreso (máximo 100 caracteres)
3. **tipo_movimiento**: Clasifica como "INGRESO_VENTA", "INGRESO_SERVICIO", o "INGRESO_OTROS"
4. **observaciones**: Cualquier detalle adicional mencionado
5. **confidence**: Tu nivel de confianza en el análisis (0-100)

Reglas importantes:
- El monto debe ser un número positivo
- El concepto debe ser claro y conciso
- Si mencionan "venta", "vendido", "vender" → tipo_movimiento: "INGRESO_VENTA"
- Si mencionan "servicio", "reparación", "técnico" → tipo_movimiento: "INGRESO_SERVICIO"
- Si no es claro → tipo_movimiento: "INGRESO_OTROS"

Ejemplos:
- "Registrar un ingreso de 150000 guaraníes por venta de equipos"
  → {"monto": 150000, "concepto": "Venta de equipos", "tipo_movimiento": "INGRESO_VENTA", "observaciones": "", "confidence": 95}

- "Ingreso de 50000 por servicio técnico de computadora"
  → {"monto": 50000, "concepto": "Servicio técnico", "tipo_movimiento": "INGRESO_SERVICIO", "observaciones": "Reparación de computadora", "confidence": 90}

- "Anotar 75000 de reparación"
  → {"monto": 75000, "concepto": "Reparación", "tipo_movimiento": "INGRESO_SERVICIO", "observaciones": "", "confidence": 85}

Responde ÚNICAMENTE con un objeto JSON válido (sin texto adicional, sin markdown, solo JSON puro):
{
  "monto": number,
  "concepto": "string",
  "tipo_movimiento": "string",
  "observaciones": "string",
  "confidence": number
}`;

  try {
    console.log("Consultando Ollama...");

    const ollamaResponse = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1, // Baja temperatura para respuestas precisas
          top_p: 0.9,
        },
      },
      {
        timeout: 30000, // 30 segundos timeout
      }
    );

    const responseText = ollamaResponse.data.response;
    console.log("Respuesta de Ollama:", responseText);

    // Buscar JSON en la respuesta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Validar que los campos requeridos existan
      if (!parsed.monto || !parsed.concepto) {
        console.log("Respuesta de Ollama incompleta, usando fallback");
        return fallbackParse(text);
      }

      return parsed;
    }

    console.log("⚠️ No se encontró JSON en la respuesta, usando fallback");
    return fallbackParse(text);
  } catch (error) {
    console.error("❌ Error al consultar Ollama:", error.message);
    console.log("⚠️ Usando parser de fallback");
    return fallbackParse(text);
  }
};

/**
 * Fallback parser usando regex cuando Ollama falla
 */
const fallbackParse = (text) => {
  console.log("⚠️ Usando parser de fallback");

  const result = {
    monto: 0,
    concepto: "",
    tipo_movimiento: "INGRESO_OTROS",
    observaciones: text,
    confidence: 30,
  };

  // Buscar monto (números con decimales opcionales)
  const montoMatch = text.match(
    /(\d+(?:[.,]\d+)?)\s*(?:dólares?|pesos?|guaraníes?|gs|bs|soles?|€|euros?|\$)?/i
  );
  if (montoMatch) {
    result.monto = parseFloat(montoMatch[1].replace(",", "."));
  }

  // Detectar tipo de movimiento y concepto
  if (/venta|vendido|vender/i.test(text)) {
    result.tipo_movimiento = "INGRESO_VENTA";
    result.concepto = "Venta";
  } else if (/servicio|reparación|técnico/i.test(text)) {
    result.tipo_movimiento = "INGRESO_SERVICIO";
    result.concepto = "Servicio técnico";
  } else if (/por concepto de|por|de/i.test(text)) {
    const conceptMatch = text.match(/(?:por concepto de|por|de)\s+([^0-9]+)/i);
    if (conceptMatch) {
      result.concepto = conceptMatch[1].trim().substring(0, 100);
    }
  }

  if (!result.concepto) {
    result.concepto = "Ingreso varios";
  }

  return result;
};

/**
 * Verificar si Ollama está disponible
 */
const checkOllamaHealth = async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, {
      timeout: 5000,
    });

    return res.status(200).json({
      status: "ok",
      message: "Ollama está disponible",
      models: response.data.models || [],
      currentModel: OLLAMA_MODEL,
    });
  } catch (error) {
    return res.status(503).json({
      status: "error",
      message: "Ollama no está disponible",
      details: error.message,
      solution: "Ejecuta: ollama serve",
    });
  }
};

/**
 * ========================================
 * ENDPOINTS PARA EGRESOS
 * ========================================
 */

/**
 * Parsea un comando de chat/voz a datos estructurados de egreso
 * Este endpoint SOLO parsea el texto, NO registra en la base de datos
 */
const parseVoiceToExpense = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        error: "El texto del comando es requerido",
      });
    }

    console.log(`📝 Procesando comando de egreso: "${text}"`);

    // Llamar a Ollama para parsear el texto
    const parsedData = await parseTextWithOllamaExpense(text);

    if (!parsedData || !parsedData.monto || parsedData.monto <= 0) {
      return res.status(400).json({
        error: "No se pudo extraer un monto válido del comando",
        parsedData,
      });
    }

    // Agregar fecha actual si no está especificada
    if (!parsedData.fecha) {
      parsedData.fecha = new Date().toISOString().split("T")[0];
    }

    console.log("✅ Datos parseados:", parsedData);

    return res.status(200).json(parsedData);
  } catch (error) {
    console.error("❌ Error en parseVoiceToExpense:", error);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "Ollama no está disponible. Asegúrate de que esté corriendo.",
        details: "Ejecuta: ollama serve",
      });
    }

    return res.status(500).json({
      error: "Error al procesar el comando",
      details: error.message,
    });
  }
};

/**
 * Parsea Y REGISTRA un egreso en la base de datos
 */
const parseAndRegisterExpense = async (req, res) => {
  try {
    const { text } = req.body;
    const { idusuarios, idfuncionario } = getUserId(req);
    const { tipo } = req.user || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        error: "El texto del comando es requerido",
      });
    }

    if (!idusuarios && !idfuncionario) {
      return res.status(401).json({
        error: "Usuario no autenticado",
      });
    }

    console.log(`📝 Procesando y registrando egreso: "${text}"`);

    // Parsear el texto con Ollama
    const parsedData = await parseTextWithOllamaExpense(text);

    if (!parsedData || !parsedData.monto || parsedData.monto <= 0) {
      return res.status(400).json({
        error: "No se pudo extraer un monto válido del comando",
        parsedData,
      });
    }

    // Obtener el ID del tipo de egreso
    const idtipo_egreso = getTipoEgresoId(parsedData.tipo_movimiento);

    // Obtener fecha y hora actual
    const now = new Date();
    const fecha = parsedData.fecha || now.toISOString().split("T")[0];
    const hora = now.toTimeString().split(" ")[0];

    // Función auxiliar para procesar el egreso
    const procesarEgreso = (idsusuarios, idfuncionariosIds, callback) => {
      MovimientoCaja.getMovimientoAbierto(
        idsusuarios,
        idfuncionariosIds,
        (errMov, movimientoResult) => {
          if (errMov) {
            return callback({
              status: 500,
              error: "❌ Error al buscar movimiento de caja",
            });
          }

          if (!movimientoResult.length) {
            return callback({
              status: 400,
              error: "⚠️ No hay movimiento de caja abierto. Por favor, abre un movimiento primero.",
            });
          }

          const idmovimiento = movimientoResult[0].idmovimiento;

          // Preparar datos para registrar
          const egresoData = {
            idtipo_egreso: idtipo_egreso,
            monto: parsedData.monto,
            concepto: parsedData.concepto || "Egreso por chat",
            observacion: parsedData.observaciones || text,
            fecha: fecha,
            hora: hora,
            idmovimiento: idmovimiento,
            creado_por: idusuarios,
            idfuncionario: idfuncionario,
            idformapago: null,
          };

          console.log("💾 Registrando egreso:", egresoData);

          // Crear el egreso en la BD
          Egreso.create(egresoData, (err, result) => {
            if (err) {
              console.error("Error al crear egreso:", err);
              return callback({
                status: 500,
                error: "❌ Error al registrar egreso en la base de datos",
                details: err,
              });
            }

            // Respuesta de éxito
            callback(null, {
              ...parsedData,
              idegreso: result.insertId,
              idtipo_egreso: idtipo_egreso,
              idmovimiento: idmovimiento,
              fecha: fecha,
              hora: hora,
              message: "✅ Egreso registrado exitosamente",
            });
          });
        }
      );
    };

    // Determinar si es funcionario o usuario
    if (tipo === "funcionario") {
      procesarEgreso(null, idfuncionario, (err, responseData) => {
        if (err) return res.status(err.status).json({ error: err.error, details: err.details });
        console.log("✅ Egreso registrado:", responseData);
        return res.status(201).json(responseData);
      });
    } else {
      Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
        if (err) {
          return res.status(500).json({ error: "❌ Error al buscar funcionarios" });
        }

        const funcionariosIds = funcionarios.map((f) => f.idfuncionario).join(",");

        procesarEgreso(idusuarios, funcionariosIds, (err, responseData) => {
          if (err) return res.status(err.status).json({ error: err.error, details: err.details });
          console.log("✅ Egreso registrado:", responseData);
          return res.status(201).json(responseData);
        });
      });
    }
  } catch (error) {
    console.error("❌ Error en parseAndRegisterExpense:", error);

    return res.status(500).json({
      error: "Error al procesar y registrar el egreso",
      details: error.message,
    });
  }
};

/**
 * Función auxiliar para parsear texto de EGRESOS con Ollama
 */
const parseTextWithOllamaExpense = async (text) => {
  const prompt = `Eres un asistente especializado en procesar comandos de texto para registrar egresos (gastos/salidas de dinero) en un sistema de ventas.

Analiza el siguiente comando y extrae la información relevante:

Comando: "${text}"

Debes extraer:
1. **monto**: El valor numérico del egreso (solo el número, sin símbolos ni moneda)
2. **concepto**: Breve descripción del motivo del egreso (máximo 100 caracteres)
3. **tipo_movimiento**: Clasifica como "EGRESO_COMPRA", "EGRESO_GASTO", o "EGRESO_OTROS"
4. **observaciones**: Cualquier detalle adicional mencionado
5. **confidence**: Tu nivel de confianza en el análisis (0-100)

Reglas importantes:
- El monto debe ser un número positivo
- El concepto debe ser claro y conciso
- Si mencionan "compra", "comprar", "adquisición" → tipo_movimiento: "EGRESO_COMPRA"
- Si mencionan "gasto", "pago", "pagar servicio" → tipo_movimiento: "EGRESO_GASTO"
- Si no es claro → tipo_movimiento: "EGRESO_OTROS"

Ejemplos:
- "Registrar un egreso de 50000 guaraníes por compra de insumos"
  → {"monto": 50000, "concepto": "Compra de insumos", "tipo_movimiento": "EGRESO_COMPRA", "observaciones": "", "confidence": 95}

- "Egreso de 30000 por pago de servicios"
  → {"monto": 30000, "concepto": "Pago de servicios", "tipo_movimiento": "EGRESO_GASTO", "observaciones": "", "confidence": 90}

- "Anotar 20000 de gastos varios"
  → {"monto": 20000, "concepto": "Gastos varios", "tipo_movimiento": "EGRESO_OTROS", "observaciones": "", "confidence": 85}

Responde ÚNICAMENTE con un objeto JSON válido (sin texto adicional, sin markdown, solo JSON puro):
{
  "monto": number,
  "concepto": "string",
  "tipo_movimiento": "string",
  "observaciones": "string",
  "confidence": number
}`;

  try {
    console.log("🤖 Consultando Ollama para egreso...");

    const ollamaResponse = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
        },
      },
      {
        timeout: 30000,
      }
    );

    const responseText = ollamaResponse.data.response;
    console.log("🤖 Respuesta de Ollama:", responseText);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.monto || !parsed.concepto) {
        console.log("⚠️ Respuesta de Ollama incompleta, usando fallback");
        return fallbackParseExpense(text);
      }

      return parsed;
    }

    console.log("⚠️ No se encontró JSON en la respuesta, usando fallback");
    return fallbackParseExpense(text);
  } catch (error) {
    console.error("❌ Error al consultar Ollama:", error.message);
    console.log("⚠️ Usando parser de fallback para egreso");
    return fallbackParseExpense(text);
  }
};

/**
 * Fallback parser para EGRESOS usando regex
 */
const fallbackParseExpense = (text) => {
  console.log("⚠️ Usando parser de fallback para egreso");

  const result = {
    monto: 0,
    concepto: "",
    tipo_movimiento: "EGRESO_OTROS",
    observaciones: text,
    confidence: 30,
  };

  // Buscar monto
  const montoMatch = text.match(
    /(\d+(?:[.,]\d+)?)\s*(?:dólares?|pesos?|guaraníes?|gs|bs|soles?|€|euros?|\$)?/i
  );
  if (montoMatch) {
    result.monto = parseFloat(montoMatch[1].replace(",", "."));
  }

  // Detectar tipo de movimiento y concepto
  if (/compra|comprar|adquisición/i.test(text)) {
    result.tipo_movimiento = "EGRESO_COMPRA";
    result.concepto = "Compra";
  } else if (/gasto|pago|pagar/i.test(text)) {
    result.tipo_movimiento = "EGRESO_GASTO";
    result.concepto = "Pago de gastos";
  } else if (/por concepto de|por|de/i.test(text)) {
    const conceptMatch = text.match(/(?:por concepto de|por|de)\s+([^0-9]+)/i);
    if (conceptMatch) {
      result.concepto = conceptMatch[1].trim().substring(0, 100);
    }
  }

  if (!result.concepto) {
    result.concepto = "Egreso varios";
  }

  return result;
};

/**
 * ========================================
 * ENDPOINTS PARA PROVEEDORES
 * ========================================
 */

// Almacenamiento temporal de conversaciones (en producción usar Redis o base de datos)
const conversaciones = new Map();

/**
 * Limpiar conversaciones antiguas (más de 30 minutos)
 */
const limpiarConversacionesAntiguas = () => {
  const ahora = Date.now();
  for (const [key, conversacion] of conversaciones.entries()) {
    if (ahora - conversacion.ultimaActividad > 30 * 60 * 1000) {
      conversaciones.delete(key);
    }
  }
};

// Limpiar cada 5 minutos
setInterval(limpiarConversacionesAntiguas, 5 * 60 * 1000);

/**
 * Chat conversacional para proveedores
 * Mantiene contexto y hace preguntas para completar información
 */
const chatProvider = async (req, res) => {
  try {
    const { text, userId } = req.body;
    const { idusuarios, idfuncionario } = getUserId(req);
    const userIdFinal = userId || idusuarios || idfuncionario;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        error: "El texto del mensaje es requerido",
      });
    }

    if (!userIdFinal) {
      return res.status(401).json({
        error: "Usuario no autenticado",
      });
    }

    console.log(`💬 Chat proveedor (Usuario ${userIdFinal}): "${text}"`);

    // Obtener o crear conversación
    let conversacion = conversaciones.get(userIdFinal);
    if (!conversacion) {
      conversacion = {
        historial: [],
        contexto: {},
        esperandoRespuesta: false,
        ultimaActividad: Date.now(),
      };
      conversaciones.set(userIdFinal, conversacion);
    }

    // Actualizar última actividad
    conversacion.ultimaActividad = Date.now();

    // Agregar mensaje al historial
    conversacion.historial.push({
      rol: "usuario",
      texto: text,
      timestamp: new Date(),
    });

    // Si estamos esperando información adicional
    if (conversacion.esperandoRespuesta && conversacion.contexto.accion) {
      return await procesarRespuestaContextual(text, conversacion, idusuarios, idfuncionario, res);
    }

    // Parsear el mensaje inicial con Ollama
    const parsedData = await parseTextWithOllamaProviderConversational(text, conversacion.historial);

    // Si no se detectó ninguna acción válida (mensaje conversacional general)
    if (!parsedData.accion || parsedData.accion === "" || parsedData.accion === "CONSULTAR") {
      const respuestaConversacional = generarRespuestaConversacional(text, parsedData);

      conversacion.historial.push({
        rol: "asistente",
        texto: respuestaConversacional,
        timestamp: new Date(),
      });

      return res.status(200).json({
        mensaje: respuestaConversacional,
        esperandoRespuesta: true,
        contexto: {},
      });
    }

    // Si es EDITAR o ELIMINAR y no tenemos ID pero tenemos nombre o RUC, buscar el proveedor
    if ((parsedData.accion === "EDITAR" || parsedData.accion === "ELIMINAR") && !parsedData.idproveedor && (parsedData.nombre || parsedData.ruc)) {
      try {
        console.log(`🔍 Buscando proveedor por nombre: "${parsedData.nombre}" o RUC: "${parsedData.ruc}"`);
        const proveedor = await buscarProveedorPorNombreORuc(parsedData.nombre, parsedData.ruc, idusuarios, idfuncionario);

        if (proveedor) {
          parsedData.idproveedor = proveedor.idproveedor;
          console.log(`✅ Proveedor encontrado: ID ${proveedor.idproveedor} - ${proveedor.nombre}`);

          // Guardar datos del proveedor para mostrarlos al usuario
          parsedData.proveedorEncontrado = {
            nombre: proveedor.nombre,
            telefono: proveedor.telefono || 'No registrado',
            ruc: proveedor.ruc || 'No registrado',
            razon: proveedor.razon || 'No registrado',
            direccion: proveedor.direccion || 'No registrado'
          };

          // IMPORTANTE: Limpiar los campos que usamos para IDENTIFICAR
          // para que no se consideren como campos a EDITAR
          parsedData.nombre = null;
          parsedData.ruc = null;
          console.log(`🧹 Campos de identificación limpiados - listo para preguntar qué editar`);
        } else {
          // No se encontró el proveedor, preguntar por más detalles
          conversacion.contexto = parsedData;
          conversacion.esperandoRespuesta = true;

          const respuesta = `No encontré un proveedor con ese nombre o RUC en tu lista. ¿Podrías verificar el nombre o darme el ID del proveedor?`;

          conversacion.historial.push({
            rol: "asistente",
            texto: respuesta,
            timestamp: new Date(),
          });

          return res.status(200).json({
            mensaje: respuesta,
            esperandoRespuesta: true,
            contexto: parsedData,
          });
        }
      } catch (error) {
        console.error("Error al buscar proveedor:", error);
      }
    }

    // Verificar si necesitamos más información
    const necesitaMasInfo = verificarInformacionIncompleta(parsedData);

    if (necesitaMasInfo.incompleto) {
      // Guardar contexto y solicitar información faltante
      conversacion.contexto = parsedData;
      conversacion.esperandoRespuesta = true;

      const respuesta = generarPreguntaAmigable(parsedData, necesitaMasInfo);

      conversacion.historial.push({
        rol: "asistente",
        texto: respuesta,
        timestamp: new Date(),
      });

      return res.status(200).json({
        mensaje: respuesta,
        esperandoRespuesta: true,
        contexto: parsedData,
        camposFaltantes: necesitaMasInfo.camposFaltantes,
      });
    }

    // Si tenemos toda la información, ejecutar la acción
    const resultado = await ejecutarAccionProveedor(parsedData, idusuarios, idfuncionario);

    const respuestaExito = generarRespuestaExito(parsedData, resultado);

    conversacion.historial.push({
      rol: "asistente",
      texto: respuestaExito,
      timestamp: new Date(),
    });

    // Limpiar contexto después de ejecutar
    conversacion.contexto = {};
    conversacion.esperandoRespuesta = false;

    return res.status(200).json({
      mensaje: respuestaExito,
      resultado: resultado,
      esperandoRespuesta: false,
    });

  } catch (error) {
    console.error("❌ Error en chatProvider:", error);

    return res.status(500).json({
      error: "Error al procesar el mensaje",
      details: error.message,
    });
  }
};

/**
 * Buscar proveedor por nombre o RUC con validación de seguridad
 * Solo devuelve proveedores que pertenecen al usuario o sus funcionarios
 */
const buscarProveedorPorNombreORuc = (nombre, ruc, idusuarios, idfuncionario) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT * FROM proveedor
      WHERE deleted_at IS NULL
    `;
    const params = [];

    // Filtro de seguridad: solo proveedores del usuario o sus funcionarios
    if (idusuarios) {
      query += ` AND (idusuario = ? OR idfuncionario IN (
        SELECT idfuncionario FROM funcionarios WHERE idusuarios = ?
      ))`;
      params.push(idusuarios, idusuarios);
    } else if (idfuncionario) {
      query += ` AND idfuncionario = ?`;
      params.push(idfuncionario);
    }

    // Búsqueda por nombre o RUC
    if (nombre && ruc) {
      query += ` AND (nombre LIKE ? OR ruc LIKE ?)`;
      params.push(`%${nombre}%`, `%${ruc}%`);
    } else if (nombre) {
      query += ` AND nombre LIKE ?`;
      params.push(`%${nombre}%`);
    } else if (ruc) {
      query += ` AND ruc LIKE ?`;
      params.push(`%${ruc}%`);
    } else {
      return resolve(null);
    }

    query += ` LIMIT 1`;

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error al buscar proveedor:", err);
        return reject(err);
      }

      if (results && results.length > 0) {
        resolve(results[0]);
      } else {
        resolve(null);
      }
    });
  });
};

/**
 * Procesar respuesta cuando estamos esperando información adicional
 */
const procesarRespuestaContextual = async (text, conversacion, idusuarios, idfuncionario, res) => {
  const contexto = conversacion.contexto;

  // Detectar si el usuario quiere cambiar de acción o cancelar y empezar de nuevo
  const cambioAccionMatch = text.match(/(?:cancelar?|cancela|olvida|dejalo|déjalo|ya no|no quiero).*?(?:quiero|necesito|voy a)\s+(crear|editar|eliminar|agregar|modificar|borrar)/i);
  const nuevaAccionMatch = text.match(/(?:mejor|ahora|en vez|prefiero)\s+(?:quiero|necesito|voy a)\s+(crear|editar|eliminar|agregar|modificar|borrar)/i);

  // También detectar si el usuario simplemente inicia una nueva acción diferente
  const accionDirectaMatch = text.match(/^(?:quiero|necesito|voy a|puedes?)\s+(crear|editar|eliminar|agregar|modificar|borrar)\s+(?:un|el)?\s*proveedor/i);

  // Determinar si es un cambio de acción
  let esNuevaAccion = false;
  if (accionDirectaMatch) {
    const palabraAccion = accionDirectaMatch[1].toLowerCase();
    let nuevaAccion = "";

    if (palabraAccion === "crear" || palabraAccion === "agregar") {
      nuevaAccion = "CREAR";
    } else if (palabraAccion === "editar" || palabraAccion === "modificar") {
      nuevaAccion = "EDITAR";
    } else if (palabraAccion === "eliminar" || palabraAccion === "borrar") {
      nuevaAccion = "ELIMINAR";
    }

    // Si la nueva acción es diferente de la actual, es un cambio
    if (nuevaAccion && nuevaAccion !== contexto.accion) {
      esNuevaAccion = true;
      console.log(`🔄 Cambio de acción detectado: ${contexto.accion} → ${nuevaAccion}`);
    }
  }

  if (cambioAccionMatch || nuevaAccionMatch || esNuevaAccion) {
    console.log("🔄 Usuario quiere cambiar de acción, reiniciando contexto...");

    // Limpiar contexto
    conversacion.contexto = {};
    conversacion.esperandoRespuesta = false;

    // Re-procesar el mensaje como nueva solicitud
    const parsedData = await parseTextWithOllamaProviderConversational(text, conversacion.historial);

    // Si no se detectó acción, intentar extraer de las palabras clave
    if (!parsedData.accion || parsedData.accion === "") {
      const match = cambioAccionMatch || nuevaAccionMatch;
      const palabra = match[1].toLowerCase();

      if (palabra === "crear" || palabra === "agregar") {
        parsedData.accion = "CREAR";
      } else if (palabra === "editar" || palabra === "modificar") {
        parsedData.accion = "EDITAR";
      } else if (palabra === "eliminar" || palabra === "borrar") {
        parsedData.accion = "ELIMINAR";
      }
    }

    // Guardar nuevo contexto
    conversacion.contexto = parsedData;
    conversacion.esperandoRespuesta = true;

    // Verificar información incompleta
    const necesitaMasInfo = verificarInformacionIncompleta(parsedData);

    if (necesitaMasInfo.incompleto) {
      const respuesta = generarPreguntaAmigable(parsedData, necesitaMasInfo);

      conversacion.historial.push({
        rol: "asistente",
        texto: respuesta,
        timestamp: new Date(),
      });

      return res.status(200).json({
        mensaje: respuesta,
        esperandoRespuesta: true,
        contexto: parsedData,
        camposFaltantes: necesitaMasInfo.camposFaltantes,
      });
    }

    // Si tiene toda la info, ejecutar
    const resultado = await ejecutarAccionProveedor(parsedData, idusuarios, idfuncionario);
    const respuestaExito = generarRespuestaExito(parsedData, resultado);

    conversacion.historial.push({
      rol: "asistente",
      texto: respuestaExito,
      timestamp: new Date(),
    });

    conversacion.contexto = {};
    conversacion.esperandoRespuesta = false;

    return res.status(200).json({
      mensaje: respuestaExito,
      resultado: resultado,
      esperandoRespuesta: false,
    });
  }

  // Intentar extraer información del mensaje
  const infoAdicional = await extraerInformacionAdicional(text, contexto);

  console.log("📥 Información extraída del mensaje:", infoAdicional);
  console.log("📦 Contexto ANTES de combinar:", JSON.stringify(contexto, null, 2));

  // Filtrar valores null/undefined/false antes de combinar (no queremos sobrescribir con nulls o false)
  // Para campos booleanos (confirmado, cancelado), solo incluir si son true
  const infoFiltrada = Object.fromEntries(
    Object.entries(infoAdicional).filter(([key, value]) => {
      // Para booleanos de confirmación/cancelación, solo incluir si son true
      if (key === 'confirmado' || key === 'cancelado') {
        return value === true;
      }
      // Para otros campos, filtrar null/undefined
      return value !== null && value !== undefined;
    })
  );

  // Combinar con el contexto existente
  Object.assign(contexto, infoFiltrada);

  console.log("📦 Contexto DESPUÉS de combinar:", JSON.stringify(contexto, null, 2));

  // Verificar si el usuario canceló la operación
  if (contexto.cancelado) {
    const respuesta = "Entendido, operación cancelada. ¿Hay algo más en lo que pueda ayudarte?";

    conversacion.historial.push({
      rol: "asistente",
      texto: respuesta,
      timestamp: new Date(),
    });

    // Limpiar contexto
    conversacion.contexto = {};
    conversacion.esperandoRespuesta = false;

    return res.status(200).json({
      mensaje: respuesta,
      esperandoRespuesta: false,
    });
  }

  // Si es EDITAR o ELIMINAR y no tenemos ID, intentar buscar el proveedor primero
  if ((contexto.accion === "EDITAR" || contexto.accion === "ELIMINAR") && !contexto.idproveedor) {
    // Detectar si el usuario menciona un RUC actual para buscar
    // Patrón: "tengo el ruc X y quiero actualizar a Y"
    let rucParaBuscar = contexto.ruc; // Por defecto usar el extraído
    const rucActualMatch = text.match(/(?:tengo|tiene|con|su)(?:\s+el)?\s+ruc\s+(\d{6,8}-?\d)/i);
    if (rucActualMatch) {
      rucParaBuscar = rucActualMatch[1];
      console.log(`📍 RUC ACTUAL detectado para búsqueda: ${rucParaBuscar}`);
    }

    if (contexto.nombre || rucParaBuscar) {
      try {
        const proveedor = await buscarProveedorPorNombreORuc(contexto.nombre, rucParaBuscar, idusuarios, idfuncionario);

        if (proveedor) {
          contexto.idproveedor = proveedor.idproveedor;
          console.log(`✅ Proveedor encontrado: ID ${proveedor.idproveedor} - ${proveedor.nombre}`);

          // Guardar datos del proveedor para mostrarlos al usuario
          contexto.proveedorEncontrado = {
            nombre: proveedor.nombre,
            telefono: proveedor.telefono || 'No registrado',
            ruc: proveedor.ruc || 'No registrado',
            razon: proveedor.razon || 'No registrado',
            direccion: proveedor.direccion || 'No registrado'
          };

          // IMPORTANTE: Limpiar los campos que usamos para IDENTIFICAR
          // para que no se consideren como campos a EDITAR
          contexto.nombre = null;
          contexto.ruc = null;
          console.log(`🧹 Campos de identificación limpiados - listo para preguntar qué editar`);
        } else {
          const respuesta = `No encontré un proveedor con ese nombre o RUC en tu lista. ¿Podrías verificar el nombre o darme el ID del proveedor?`;

          conversacion.historial.push({
            rol: "asistente",
            texto: respuesta,
            timestamp: new Date(),
          });

          return res.status(200).json({
            mensaje: respuesta,
            esperandoRespuesta: true,
            contexto: contexto,
          });
        }
      } catch (error) {
        console.error("Error al buscar proveedor:", error);
      }
    }
  }

  // Verificar nuevamente si está completo
  const necesitaMasInfo = verificarInformacionIncompleta(contexto);

  console.log("🔍 Verificación de información:", {
    incompleto: necesitaMasInfo.incompleto,
    camposFaltantes: necesitaMasInfo.camposFaltantes,
    idproveedor: contexto.idproveedor,
    confirmado: contexto.confirmado
  });

  if (necesitaMasInfo.incompleto) {
    // Todavía falta información
    const respuesta = generarPreguntaAmigable(contexto, necesitaMasInfo);

    conversacion.historial.push({
      rol: "asistente",
      texto: respuesta,
      timestamp: new Date(),
    });

    return res.status(200).json({
      mensaje: respuesta,
      esperandoRespuesta: true,
      contexto: contexto,
      camposFaltantes: necesitaMasInfo.camposFaltantes,
    });
  }

  // Ya tenemos toda la información, ejecutar la acción
  const resultado = await ejecutarAccionProveedor(contexto, idusuarios, idfuncionario);

  const respuestaExito = generarRespuestaExito(contexto, resultado);

  conversacion.historial.push({
    rol: "asistente",
    texto: respuestaExito,
    timestamp: new Date(),
  });

  // Limpiar contexto
  conversacion.contexto = {};
  conversacion.esperandoRespuesta = false;

  return res.status(200).json({
    mensaje: respuestaExito,
    resultado: resultado,
    esperandoRespuesta: false,
  });
};

/**
 * Extraer información adicional del mensaje del usuario
 */
const extraerInformacionAdicional = async (text, contextoActual) => {
  const prompt = `Eres un asistente que extrae información sobre proveedores de mensajes de usuarios.

Contexto actual de la conversación:
${JSON.stringify(contextoActual, null, 2)}

Nuevo mensaje del usuario: "${text}"

**REGLA CRÍTICA:**
${!contextoActual.idproveedor
  ? '- El contexto NO tiene "idproveedor" todavía, así que el usuario está IDENTIFICANDO al proveedor.\n- Si menciona un nombre o RUC, extráelo como "nombre" o "ruc" para BUSCAR al proveedor.\n- Si solo dice un nombre como "Juan Pérez", extrae {"nombre": "Juan Pérez"} para identificar.'
  : '- Ya se encontró el proveedor (tiene idproveedor).\n- SOLO extrae campos si el usuario dice claramente "cambiar/actualizar/editar CAMPO a VALOR".\n- Si solo dice un nombre sin palabras clave, NO extraer nada.'}

**Ejemplos según el contexto:**

SIN idproveedor (IDENTIFICAR):
- "Juan Pérez" → {"nombre": "Juan Pérez"}
- "el proveedor se llama ABC" → {"nombre": "ABC"}
- "80012345-9" → {"ruc": "80012345-9"}

CON idproveedor (EDITAR):
- "cambiar teléfono a 0981234567" → {"telefono": "0981234567"}
- "actualizar nombre a XYZ SA" → {"nombre": "XYZ SA"}
- "Juan Pérez" → {} (ignorar, ya tenemos el proveedor)

**Confirmación:**
- Si dice "sí", "si", "yes", "confirmar", "confirmo", "adelante", "ok" → {"confirmado": true}
- Ejemplos:
  - "sí" → {"confirmado": true}
  - "si" → {"confirmado": true}
  - "confirmo" → {"confirmado": true}

**Cancelación:**
- Si dice "no", "cancelar", "olvídalo" → {"cancelado": true}
- NUNCA marcar cancelado solo porque no entiendes el mensaje

**IMPORTANTE:** Solo incluye propiedades cuando estés SEGURO del valor. Si no estás seguro, NO incluyas la propiedad en el JSON.

Responde ÚNICAMENTE con un objeto JSON (sin markdown, sin texto adicional):
{
  "nombre": "string" (nombre del proveedor para buscar O nuevo nombre para actualizar),
  "telefono": "string" (nuevo teléfono para actualizar),
  "direccion": "string" (nueva dirección para actualizar),
  "ruc": "string" (RUC para buscar O nuevo RUC para actualizar),
  "razon_social": "string" (nueva razón social para actualizar),
  "idproveedor": number (si menciona un ID numérico),
  "confirmado": boolean (SOLO true si dice "sí"/"si"/"yes"/"confirmar", NO incluir si no confirma),
  "cancelado": boolean (SOLO true si dice "no"/"cancelar", NO incluir si no cancela)
}`;

  try {
    const ollamaResponse = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
        },
      },
      {
        timeout: 30000,
      }
    );

    const responseText = ollamaResponse.data.response;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    let info = {};
    if (jsonMatch) {
      info = JSON.parse(jsonMatch[0]);
    }

    // SIEMPRE verificar confirmación y cancelación con regex (tiene prioridad sobre Ollama)
    // Confirmación (para ELIMINAR)
    if (/^(sí|si|yes|confirmar|confirmo|adelante|ok|está bien)$/i.test(text.trim())) {
      info.confirmado = true;
      console.log("✅ Confirmación detectada por REGEX (prioridad)");
    }

    // Cancelación
    if (/^(no|cancel|cancelar|olvida|dejalo|déjalo)$/i.test(text.trim())) {
      info.cancelado = true;
      console.log("✅ Cancelación detectada por REGEX (prioridad)");
    }

    return info;
  } catch (error) {
    console.error("Error al extraer información adicional:", error.message);

    // Fallback completo: extraer con regex mejorados
    const info = {};

    // Detectar patrones de edición: "editar/cambiar CAMPO a VALOR"
    // RUC - Detectar patrón "actualizar/editar/cambiar a NUEVO_VALOR"
    const rucUpdateMatch = text.match(/(?:actualizar|editar|cambiar)(?:\s+(?:su|el|a))?\s+(?:ruc)?\s*(?:a)?\s+(\d{6,8}-?\d)/i);
    if (rucUpdateMatch) {
      info.ruc = rucUpdateMatch[1];
      console.log("✅ RUC NUEVO extraído (patrón actualizar):", info.ruc);
    } else {
      // Segundo patrón: "ruc a 88822341-8"
      const rucEditMatch = text.match(/(?:ruc|RUC)(?:\s+a)\s+(\d{6,8}-?\d)/i);
      if (rucEditMatch) {
        info.ruc = rucEditMatch[1];
        console.log("✅ RUC NUEVO extraído (patrón 'ruc a'):", info.ruc);
      } else {
        // Fallback simple: cualquier número con formato de RUC (solo si no estamos en contexto de edición con dos RUCs)
        const allRucs = text.match(/\d{6,8}-?\d/g);
        if (allRucs && allRucs.length === 1) {
          // Si solo hay un RUC, úsalo
          info.ruc = allRucs[0];
          console.log("✅ RUC extraído (único encontrado):", info.ruc);
        } else if (allRucs && allRucs.length > 1) {
          // Si hay múltiples RUCs, usar el último (probablemente el nuevo valor)
          info.ruc = allRucs[allRucs.length - 1];
          console.log("✅ RUC NUEVO extraído (último de múltiples):", info.ruc);
        }
      }
    }

    // Teléfono
    const telEditMatch = text.match(/(?:teléfono|telefono|tel|celular)(?:\s+a)?\s+(09\d{8}|\d{6,10})/i);
    if (telEditMatch) {
      info.telefono = telEditMatch[1];
      console.log("✅ Teléfono extraído:", info.telefono);
    }

    // Dirección
    const dirEditMatch = text.match(/(?:dirección|direccion)(?:\s+a)?\s+(.+?)(?:\.|$)/i);
    if (dirEditMatch) {
      info.direccion = dirEditMatch[1].trim();
      console.log("✅ Dirección extraída:", info.direccion);
    }

    // NOMBRE - Dos escenarios:
    // 1. Si NO tenemos idproveedor, extraer nombre como IDENTIFICADOR
    // 2. Si YA tenemos idproveedor, extraer solo con palabras clave de edición

    if (!contextoActual.idproveedor) {
      // Estamos buscando identificador - extraer cualquier nombre mencionado
      // Patrón: "el proveedor se llama X", "Juan Pérez", "es el nombre X"
      const nombreIdentMatch = text.match(/(?:se\s+llama|es\s+el\s+nombre|el\s+nombre\s+es|proveedor)\s+([A-Za-záéíóúñÑ\s]{3,50})/i);
      if (nombreIdentMatch) {
        info.nombre = nombreIdentMatch[1].trim();
        console.log("✅ Nombre extraído como IDENTIFICADOR:", info.nombre);
      } else {
        // Si el texto completo parece ser solo un nombre (2-4 palabras con letras)
        const soloNombreMatch = text.match(/^([A-Za-záéíóúñÑ\s]{3,50})$/);
        if (soloNombreMatch) {
          info.nombre = soloNombreMatch[1].trim();
          console.log("✅ Nombre extraído (texto simple):", info.nombre);
        }
      }
    } else {
      // YA tenemos proveedor identificado - solo extraer si es para EDITAR
      // Patrón: "cambiar nombre a X", "actualizar nombre a X"
      const nombreEditMatch = text.match(/(?:cambiar|actualizar|editar|modificar)\s+(?:el\s+)?nombre\s+a\s+([A-Za-záéíóúñÑ\s]+?)(?:\.|$)/i);
      if (nombreEditMatch) {
        info.nombre = nombreEditMatch[1].trim();
        console.log("✅ Nombre NUEVO extraído para editar:", info.nombre);
      }
    }

    // ID
    const idMatch = text.match(/(?:id|número)\s*(\d+)/i);
    if (idMatch) {
      info.idproveedor = parseInt(idMatch[1]);
      console.log("✅ ID extraído:", info.idproveedor);
    }

    // Confirmación (para ELIMINAR)
    if (/^(sí|si|yes|confirmar|confirmo|adelante|ok|está bien)$/i.test(text.trim())) {
      info.confirmado = true;
      console.log("✅ Confirmación detectada");
    }

    // Cancelación
    if (/no|cancel|olvida|dejalo|déjalo/i.test(text)) {
      info.cancelado = true;
    }

    console.log("📦 Info extraída (fallback):", info);
    return info;
  }
};

/**
 * Verificar si falta información según la acción
 */
const verificarInformacionIncompleta = (parsedData) => {
  const camposFaltantes = [];

  switch (parsedData.accion) {
    case "CREAR":
      if (!parsedData.nombre) camposFaltantes.push("nombre");
      if (!parsedData.ruc) camposFaltantes.push("ruc");
      break;

    case "EDITAR":
      // Para editar necesitamos alguna forma de identificar al proveedor
      if (!parsedData.idproveedor && !parsedData.ruc && !parsedData.nombre) {
        camposFaltantes.push("identificador");
      }

      // Si ya tenemos ID (ya se buscó el proveedor), verificar que haya algo para editar
      if (parsedData.idproveedor) {
        // Lista de campos editables (INCLUYE ruc, nombre, etc.)
        const camposEditables = ["nombre", "telefono", "direccion", "ruc", "razon_social"];
        const tieneAlgunCampoParaEditar = camposEditables.some(campo => {
          // Verificar si el campo existe y es diferente (es un valor nuevo para editar)
          return parsedData[campo] !== undefined && parsedData[campo] !== null && parsedData[campo] !== '';
        });

        if (!tieneAlgunCampoParaEditar) {
          camposFaltantes.push("campo_a_editar");
        }
      }
      // Si NO tiene ID todavía, esperar a que se busque el proveedor primero
      // La búsqueda se hace en procesarRespuestaContextual
      break;

    case "ELIMINAR":
      // Necesitamos el ID del proveedor
      if (!parsedData.idproveedor) {
        camposFaltantes.push("idproveedor");
      } else if (!parsedData.confirmado) {
        // Si ya tenemos el ID pero no la confirmación, pedirla
        camposFaltantes.push("confirmacion");
      }
      break;
  }

  return {
    incompleto: camposFaltantes.length > 0,
    camposFaltantes,
  };
};

/**
 * Generar pregunta amigable según información faltante
 */
const generarPreguntaAmigable = (parsedData, necesitaMasInfo) => {
  const { accion } = parsedData;
  const { camposFaltantes } = necesitaMasInfo;

  const respuestas = {
    CREAR: {
      nombre: "¡Claro que sí! ¿Cómo se llama el proveedor que quieres agregar?",
      ruc: `Perfecto, voy a agregar al proveedor ${parsedData.nombre || ""}. ¿Me podrías dar su número de RUC para completar el registro?`,
      ambos: "¡Con gusto! Para crear el proveedor necesito que me des su nombre y RUC. ¿Me los proporcionas?",
    },
    EDITAR: {
      identificador: `Claro, puedo ayudarte a editar un proveedor. ¿Me das el ID, RUC o nombre del proveedor para encontrarlo más rápido?`,
      campo_a_editar: parsedData.proveedorEncontrado
        ? `Perfecto, encontré al proveedor:\n\n📋 **Datos actuales:**\n- Nombre: ${parsedData.proveedorEncontrado.nombre}\n- Teléfono: ${parsedData.proveedorEncontrado.telefono}\n- RUC: ${parsedData.proveedorEncontrado.ruc}\n- Razón Social: ${parsedData.proveedorEncontrado.razon}\n- Dirección: ${parsedData.proveedorEncontrado.direccion}\n\n¿Qué información quieres actualizar? Por ejemplo: "cambiar el teléfono a 0981234567"`
        : `Perfecto, encontré al proveedor. ¿Qué información quieres actualizar? Puedo cambiar el nombre, teléfono, dirección o RUC.`,
    },
    ELIMINAR: {
      idproveedor: "Entendido, voy a eliminar un proveedor. ¿Me das el nombre o RUC del proveedor para encontrarlo?",
      confirmacion: parsedData.proveedorEncontrado
        ? `⚠️ **Confirmación necesaria**\n\nEstás a punto de eliminar al proveedor:\n\n📋 **Datos:**\n- Nombre: ${parsedData.proveedorEncontrado.nombre}\n- RUC: ${parsedData.proveedorEncontrado.ruc}\n- Razón Social: ${parsedData.proveedorEncontrado.razon}\n\n¿Estás seguro de que deseas eliminar este proveedor? Responde "sí" para confirmar o "no" para cancelar.`
        : `⚠️ Necesito tu confirmación para eliminar este proveedor. ¿Estás seguro? Responde "sí" para confirmar o "no" para cancelar.`,
    },
  };

  // Respuestas personalizadas
  if (accion === "CREAR") {
    if (camposFaltantes.includes("nombre") && camposFaltantes.includes("ruc")) {
      return respuestas.CREAR.ambos;
    }
    if (camposFaltantes.includes("nombre")) {
      return respuestas.CREAR.nombre;
    }
    if (camposFaltantes.includes("ruc")) {
      return respuestas.CREAR.ruc;
    }
  }

  if (accion === "EDITAR") {
    if (camposFaltantes.includes("identificador")) {
      return respuestas.EDITAR.identificador;
    }
    if (camposFaltantes.includes("campo_a_editar")) {
      return respuestas.EDITAR.campo_a_editar;
    }
  }

  if (accion === "ELIMINAR") {
    if (camposFaltantes.includes("idproveedor")) {
      return respuestas.ELIMINAR.idproveedor;
    }
    if (camposFaltantes.includes("confirmacion")) {
      return respuestas.ELIMINAR.confirmacion;
    }
  }

  return "¿Podrías darme más detalles para ayudarte mejor?";
};

/**
 * Generar respuesta conversacional para mensajes que no son acciones
 */
const generarRespuestaConversacional = (text, parsedData) => {
  const mensajeMinusculas = text.toLowerCase();

  // Saludos
  if (/^(hola|hi|hello|buenos días|buenas tardes|buenas noches|hey)/i.test(mensajeMinusculas)) {
    const respuestas = [
      "¡Hola! 👋 Estoy aquí para ayudarte con la gestión de proveedores. Puedo ayudarte a crear, editar o eliminar proveedores. ¿Qué necesitas hacer?",
      "¡Hola! ¿En qué puedo ayudarte con tus proveedores hoy?",
      "¡Hola! Estoy listo para ayudarte. ¿Quieres crear, editar o eliminar un proveedor?",
    ];
    return respuestas[Math.floor(Math.random() * respuestas.length)];
  }

  // Solicitudes de ayuda
  if (/ayuda|help|que puedes hacer|qué puedes hacer|como funciona/i.test(mensajeMinusculas)) {
    return `¡Claro! Puedo ayudarte con:\n\n✨ **Crear proveedores** - Di algo como "crear un nuevo proveedor" o "registrar proveedor ABC"\n\n✏️ **Editar proveedores** - Por ejemplo "editar proveedor Juan Pérez" o "cambiar el teléfono del proveedor 5"\n\n🗑️ **Eliminar proveedores** - Como "eliminar proveedor con ID 10" o "dar de baja proveedor XYZ"\n\n¿Qué te gustaría hacer?`;
  }

  // Agradecimientos
  if (/gracias|thanks|thank you|genial|perfecto|excelente/i.test(mensajeMinusculas)) {
    const respuestas = [
      "¡De nada! ¿Hay algo más en lo que pueda ayudarte?",
      "¡Con gusto! Si necesitas algo más, aquí estoy.",
      "¡Encantado de ayudar! ¿Necesitas algo más?",
    ];
    return respuestas[Math.floor(Math.random() * respuestas.length)];
  }

  // Consultas o preguntas generales
  if (/consultar|buscar|ver|listar|mostrar/i.test(mensajeMinusculas)) {
    return "Para consultar proveedores, te recomiendo usar la lista principal de proveedores en la aplicación. Aquí puedo ayudarte a crear, editar o eliminar proveedores. ¿Qué acción necesitas realizar?";
  }

  // Respuesta por defecto
  return "Entiendo que quieres ayuda con proveedores. Puedo ayudarte a **crear**, **editar** o **eliminar** proveedores. ¿Cuál de estas acciones necesitas realizar?";
};

/**
 * Generar respuesta de éxito amigable
 */
const generarRespuestaExito = (parsedData, resultado) => {
  const { accion } = parsedData;

  const respuestas = {
    CREAR: [
      `¡Listo! He creado el proveedor "${parsedData.nombre}" exitosamente. Ya está disponible en el sistema. 🎉`,
      `¡Perfecto! El proveedor "${parsedData.nombre}" ha sido agregado correctamente.`,
      `¡Excelente! Ya registré al proveedor "${parsedData.nombre}". ¿Necesitas algo más?`,
    ],
    EDITAR: [
      `¡Actualizado! Los datos del proveedor han sido modificados correctamente.`,
      `¡Listo! He actualizado la información del proveedor como solicitaste.`,
      `¡Perfecto! Los cambios han sido guardados exitosamente.`,
    ],
    ELIMINAR: [
      `¡Hecho! El proveedor ha sido eliminado del sistema.`,
      `¡Listo! He dado de baja al proveedor correctamente.`,
      `¡Perfecto! El proveedor ha sido eliminado.`,
    ],
  };

  const opcionesRespuesta = respuestas[accion] || ["¡Listo! La operación se completó exitosamente."];
  const respuestaAleatoria = opcionesRespuesta[Math.floor(Math.random() * opcionesRespuesta.length)];

  return respuestaAleatoria;
};

/**
 * Ejecutar acción sobre proveedor (wrapper unificado)
 */
const ejecutarAccionProveedor = (parsedData, idusuarios, idfuncionario) => {
  return new Promise((resolve, reject) => {
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          if (code >= 200 && code < 300) {
            resolve(data);
          } else {
            reject(new Error(data.error || "Error al ejecutar acción"));
          }
        },
      }),
    };

    switch (parsedData.accion) {
      case "CREAR":
        ejecutarCrearProveedor(parsedData, idusuarios, idfuncionario, "", mockRes);
        break;
      case "EDITAR":
        ejecutarEditarProveedor(parsedData, idusuarios, idfuncionario, mockRes);
        break;
      case "ELIMINAR":
        ejecutarEliminarProveedor(parsedData, mockRes);
        break;
      default:
        reject(new Error("Acción no reconocida"));
    }
  });
};

/**
 * Parsear texto con contexto conversacional
 */
const parseTextWithOllamaProviderConversational = async (text, historial) => {
  const historialTexto = historial
    .slice(-5) // Últimos 5 mensajes
    .map(msg => `${msg.rol === 'usuario' ? 'Usuario' : 'Asistente'}: ${msg.texto}`)
    .join('\n');

  const prompt = `Eres un asistente conversacional que ayuda a gestionar proveedores en un sistema de ventas.

Historial de la conversación:
${historialTexto}

Último mensaje del usuario: "${text}"

Analiza la intención del usuario y extrae la información disponible. Si el usuario pregunta o expresa una intención pero no da todos los datos, identifica qué acción quiere realizar.

**ACCIONES POSIBLES:**
- "CREAR": Registrar nuevo proveedor
- "EDITAR": Modificar proveedor existente
- "ELIMINAR": Eliminar proveedor
- "CONSULTAR": Buscar o preguntar sobre proveedores

**CAMPOS A EXTRAER (solo los que mencione):**
- nombre, telefono, direccion, ruc, razon_social, idproveedor, estado

**EJEMPLOS DE CREAR (palabras clave: crear, agregar, nuevo, registrar):**
- "necesito crear un proveedor" → {"accion": "CREAR", "confidence": 95}
- "quiero agregar un proveedor" → {"accion": "CREAR", "confidence": 95}
- "crear proveedor ABC con RUC 123456-7" → {"accion": "CREAR", "nombre": "ABC", "ruc": "123456-7", "confidence": 95}
- "registrar nuevo proveedor llamado XYZ" → {"accion": "CREAR", "nombre": "XYZ", "confidence": 95}

**EJEMPLOS DE EDITAR (palabras clave: editar, modificar, actualizar, cambiar):**
- "puedes editarme un proveedor llamado Juan Pérez?" → {"accion": "EDITAR", "nombre": "Juan Pérez", "confidence": 85}
- "modificar proveedor ABC" → {"accion": "EDITAR", "nombre": "ABC", "confidence": 85}
- "actualizar datos de proveedor" → {"accion": "EDITAR", "confidence": 80}

**EJEMPLOS DE ELIMINAR (palabras clave: eliminar, borrar, dar de baja):**
- "eliminar proveedor ABC" → {"accion": "ELIMINAR", "nombre": "ABC", "confidence": 85}
- "dar de baja al proveedor con RUC 123456-7" → {"accion": "ELIMINAR", "ruc": "123456-7", "confidence": 85}

Responde ÚNICAMENTE con JSON (sin markdown):
{
  "accion": "string",
  "idproveedor": number (opcional),
  "nombre": "string" (opcional),
  "telefono": "string" (opcional),
  "direccion": "string" (opcional),
  "ruc": "string" (opcional),
  "razon_social": "string" (opcional),
  "confidence": number
}`;

  try {
    const ollamaResponse = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.2,
          top_p: 0.9,
        },
      },
      {
        timeout: 30000,
      }
    );

    const responseText = ollamaResponse.data.response;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.accion) {
        return fallbackParseProvider(text);
      }
      return parsed;
    }

    return fallbackParseProvider(text);
  } catch (error) {
    console.error("Error en parseTextWithOllamaProviderConversational:", error.message);
    return fallbackParseProvider(text);
  }
};

/**
 * Parsea un comando de chat para operaciones con proveedores
 * Detecta si es crear, editar o eliminar
 */
const parseVoiceToProvider = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        error: "El texto del comando es requerido",
      });
    }

    console.log(`📝 Procesando comando de proveedor: "${text}"`);

    // Llamar a Ollama para parsear el texto
    const parsedData = await parseTextWithOllamaProvider(text);

    if (!parsedData || !parsedData.accion) {
      return res.status(400).json({
        error: "No se pudo determinar la acción a realizar",
        parsedData,
      });
    }

    console.log("✅ Datos parseados:", parsedData);

    return res.status(200).json(parsedData);
  } catch (error) {
    console.error("❌ Error en parseVoiceToProvider:", error);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "Ollama no está disponible. Asegúrate de que esté corriendo.",
        details: "Ejecuta: ollama serve",
      });
    }

    return res.status(500).json({
      error: "Error al procesar el comando",
      details: error.message,
    });
  }
};

/**
 * Parsea Y EJECUTA operaciones sobre proveedores (crear, editar, eliminar)
 */
const parseAndExecuteProviderAction = async (req, res) => {
  try {
    const { text } = req.body;
    const { idusuarios, idfuncionario } = getUserId(req);

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        error: "El texto del comando es requerido",
      });
    }

    if (!idusuarios && !idfuncionario) {
      return res.status(401).json({
        error: "Usuario no autenticado",
      });
    }

    console.log(`📝 Procesando y ejecutando acción de proveedor: "${text}"`);

    // Parsear el texto con Ollama
    const parsedData = await parseTextWithOllamaProvider(text);

    if (!parsedData || !parsedData.accion) {
      return res.status(400).json({
        error: "No se pudo determinar la acción a realizar",
        parsedData,
      });
    }

    // Ejecutar la acción correspondiente
    switch (parsedData.accion) {
      case "CREAR":
        return await ejecutarCrearProveedor(parsedData, idusuarios, idfuncionario, text, res);

      case "EDITAR":
        return await ejecutarEditarProveedor(parsedData, idusuarios, idfuncionario, res);

      case "ELIMINAR":
        return await ejecutarEliminarProveedor(parsedData, res);

      default:
        return res.status(400).json({
          error: "Acción no reconocida",
          accion: parsedData.accion,
        });
    }
  } catch (error) {
    console.error("❌ Error en parseAndExecuteProviderAction:", error);

    return res.status(500).json({
      error: "Error al procesar y ejecutar la acción sobre el proveedor",
      details: error.message,
    });
  }
};

/**
 * Función auxiliar para CREAR un proveedor
 */
const ejecutarCrearProveedor = (parsedData, idusuarios, idfuncionario, text, res) => {
  return new Promise((resolve, reject) => {
    // Validar campos requeridos
    if (!parsedData.nombre || !parsedData.ruc) {
      return res.status(400).json({
        error: "Se requiere al menos nombre y RUC para crear un proveedor",
        parsedData,
      });
    }

    const proveedorData = {
      nombre: parsedData.nombre,
      telefono: parsedData.telefono || "",
      direccion: parsedData.direccion || "",
      ruc: parsedData.ruc,
      razon: parsedData.razon_social || parsedData.nombre,
      estado: "activo",
      idusuario: idusuarios,
      idfuncionario: idfuncionario || null,
    };

    console.log("💾 Creando proveedor:", proveedorData);

    Proveedor.create(proveedorData, (err, result) => {
      if (err) {
        console.error("Error al crear proveedor:", err);

        if (err.code === "ER_DUP_ENTRY") {
          let errorMsg = "Ya existe un proveedor con estos datos.";
          if (err.message.includes("unique_nombre_usuario")) {
            errorMsg = "Ya existe un proveedor registrado con este nombre.";
          } else if (err.message.includes("unique_ruc_usuario")) {
            errorMsg = "Ya existe un proveedor registrado con este RUC.";
          }

          return res.status(400).json({
            error: errorMsg,
            details: err,
          });
        }

        return res.status(500).json({
          error: "❌ Error al crear el proveedor en la base de datos",
          details: err,
        });
      }

      return res.status(201).json({
        ...parsedData,
        idproveedor: result.insertId,
        message: "✅ Proveedor creado exitosamente",
        proveedor: proveedorData,
      });
    });
  });
};

/**
 * Función auxiliar para EDITAR un proveedor
 */
const ejecutarEditarProveedor = (parsedData, idusuarios, idfuncionario, res) => {
  return new Promise((resolve, reject) => {
    // Validar que tenga ID
    if (!parsedData.idproveedor) {
      return res.status(400).json({
        error: "Se requiere el ID del proveedor para editar",
        hint: "El sistema debe buscar primero el proveedor por nombre o RUC",
        parsedData,
      });
    }

    // Primero buscar el proveedor con validación de seguridad
    const buscarProveedor = (callback) => {
      let query = `SELECT * FROM proveedor WHERE idproveedor = ? AND deleted_at IS NULL`;
      const params = [parsedData.idproveedor];

      // Validación de seguridad: solo proveedores del usuario o sus funcionarios
      if (idusuarios) {
        query += ` AND (idusuario = ? OR idfuncionario IN (
          SELECT idfuncionario FROM funcionarios WHERE idusuarios = ?
        ))`;
        params.push(idusuarios, idusuarios);
      } else if (idfuncionario) {
        query += ` AND idfuncionario = ?`;
        params.push(idfuncionario);
      }

      db.query(query, params, callback);
    };

    buscarProveedor((err, results) => {
      if (err) {
        return res.status(500).json({
          error: "❌ Error al buscar el proveedor",
          details: err,
        });
      }

      if (!results || results.length === 0) {
        return res.status(403).json({
          error: "⚠️ Proveedor no encontrado o no tienes permiso para editarlo",
        });
      }

      const proveedorActual = results[0];

      // Preparar datos actualizados (mantener valores actuales si no se especifican nuevos)
      const datosActualizados = {
        nombre: parsedData.nombre || proveedorActual.nombre,
        telefono: parsedData.telefono || proveedorActual.telefono,
        direccion: parsedData.direccion || proveedorActual.direccion,
        ruc: parsedData.ruc || proveedorActual.ruc,
        razon: parsedData.razon_social || proveedorActual.razon,
        estado: parsedData.estado || proveedorActual.estado,
      };

      console.log("💾 Actualizando proveedor:", datosActualizados);

      Proveedor.update(parsedData.idproveedor, datosActualizados, (err) => {
        if (err) {
          console.error("Error al actualizar proveedor:", err);
          return res.status(500).json({
            error: "❌ Error al actualizar el proveedor",
            details: err,
          });
        }

        return res.status(200).json({
          ...parsedData,
          message: "✅ Proveedor actualizado exitosamente",
          proveedor_anterior: proveedorActual,
          proveedor_actualizado: datosActualizados,
        });
      });
    });
  });
};

/**
 * Función auxiliar para ELIMINAR un proveedor (soft delete)
 */
const ejecutarEliminarProveedor = (parsedData, res) => {
  return new Promise((resolve, reject) => {
    // Validar que tenga ID
    if (!parsedData.idproveedor) {
      return res.status(400).json({
        error: "Se requiere el ID del proveedor para eliminarlo",
        hint: "Puedes usar: 'eliminar proveedor ID 5'",
        parsedData,
      });
    }

    // Primero verificar que existe
    Proveedor.findById(parsedData.idproveedor, (err, results) => {
      if (err) {
        return res.status(500).json({
          error: "❌ Error al buscar el proveedor",
          details: err,
        });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({
          error: "⚠️ Proveedor no encontrado",
        });
      }

      const proveedor = results[0];

      console.log("🗑️ Eliminando proveedor:", proveedor);

      // Realizar soft delete
      Proveedor.delete(parsedData.idproveedor, (err) => {
        if (err) {
          console.error("Error al eliminar proveedor:", err);
          return res.status(500).json({
            error: "❌ Error al eliminar el proveedor",
            details: err,
          });
        }

        return res.status(200).json({
          ...parsedData,
          message: "✅ Proveedor eliminado exitosamente (soft delete)",
          proveedor_eliminado: proveedor,
        });
      });
    });
  });
};

/**
 * Función auxiliar para parsear texto de PROVEEDORES con Ollama
 */
const parseTextWithOllamaProvider = async (text) => {
  const prompt = `Eres un asistente especializado en procesar comandos de texto para gestionar proveedores en un sistema de ventas.

Analiza el siguiente comando y extrae la información relevante:

Comando: "${text}"

Debes identificar la ACCIÓN y extraer los datos correspondientes:

**ACCIONES POSIBLES:**
1. **CREAR**: Registrar un nuevo proveedor
2. **EDITAR**: Modificar datos de un proveedor existente
3. **ELIMINAR**: Eliminar un proveedor (soft delete)

**CAMPOS A EXTRAER:**
1. **accion**: "CREAR", "EDITAR", o "ELIMINAR"
2. **idproveedor**: ID numérico del proveedor (solo para EDITAR y ELIMINAR)
3. **nombre**: Nombre del proveedor
4. **telefono**: Número de teléfono
5. **direccion**: Dirección física
6. **ruc**: RUC/CI del proveedor
7. **razon_social**: Razón social del proveedor
8. **estado**: "activo" o "inactivo" (opcional, default: activo)
9. **confidence**: Tu nivel de confianza en el análisis (0-100)

**REGLAS IMPORTANTES:**
- Para CREAR: requiere al menos nombre y RUC
- Para EDITAR: requiere ID del proveedor + campos a modificar
- Para ELIMINAR: requiere solo ID del proveedor
- Si mencionan "crear", "agregar", "nuevo", "registrar" → accion: "CREAR"
- Si mencionan "editar", "modificar", "actualizar", "cambiar" → accion: "EDITAR"
- Si mencionan "eliminar", "borrar", "quitar", "dar de baja" → accion: "ELIMINAR"

**EJEMPLOS:**

1. "Crear proveedor llamado Distribuidora ABC con RUC 80012345-6, teléfono 0981234567"
   → {
     "accion": "CREAR",
     "nombre": "Distribuidora ABC",
     "ruc": "80012345-6",
     "telefono": "0981234567",
     "direccion": "",
     "razon_social": "Distribuidora ABC",
     "estado": "activo",
     "confidence": 95
   }

2. "Agregar proveedor TechSupply, RUC 1234567-8, dirección Av. España 1234"
   → {
     "accion": "CREAR",
     "nombre": "TechSupply",
     "ruc": "1234567-8",
     "telefono": "",
     "direccion": "Av. España 1234",
     "razon_social": "TechSupply",
     "estado": "activo",
     "confidence": 90
   }

3. "Editar proveedor ID 5, cambiar teléfono a 0987654321"
   → {
     "accion": "EDITAR",
     "idproveedor": 5,
     "telefono": "0987654321",
     "confidence": 95
   }

4. "Modificar proveedor 3, actualizar dirección a Asunción centro"
   → {
     "accion": "EDITAR",
     "idproveedor": 3,
     "direccion": "Asunción centro",
     "confidence": 90
   }

5. "Eliminar proveedor ID 7"
   → {
     "accion": "ELIMINAR",
     "idproveedor": 7,
     "confidence": 95
   }

6. "Borrar proveedor número 2"
   → {
     "accion": "ELIMINAR",
     "idproveedor": 2,
     "confidence": 90
   }

Responde ÚNICAMENTE con un objeto JSON válido (sin texto adicional, sin markdown, solo JSON puro):
{
  "accion": "string",
  "idproveedor": number (opcional),
  "nombre": "string" (opcional),
  "telefono": "string" (opcional),
  "direccion": "string" (opcional),
  "ruc": "string" (opcional),
  "razon_social": "string" (opcional),
  "estado": "string" (opcional),
  "confidence": number
}`;

  try {
    console.log("🤖 Consultando Ollama para proveedor...");

    const ollamaResponse = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
        },
      },
      {
        timeout: 30000,
      }
    );

    const responseText = ollamaResponse.data.response;
    console.log("🤖 Respuesta de Ollama:", responseText);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.accion) {
        console.log("⚠️ Respuesta de Ollama incompleta, usando fallback");
        return fallbackParseProvider(text);
      }

      return parsed;
    }

    console.log("⚠️ No se encontró JSON en la respuesta, usando fallback");
    return fallbackParseProvider(text);
  } catch (error) {
    console.error("❌ Error al consultar Ollama:", error.message);
    console.log("⚠️ Usando parser de fallback para proveedor");
    return fallbackParseProvider(text);
  }
};

/**
 * Fallback parser para PROVEEDORES usando regex
 */
const fallbackParseProvider = (text) => {
  console.log("⚠️ Usando parser de fallback para proveedor");

  const result = {
    accion: "",
    confidence: 30,
  };

  // Detectar acción
  if (/crear|agregar|nuevo|registrar/i.test(text)) {
    result.accion = "CREAR";

    // Extraer RUC
    const rucMatch = text.match(/ruc[:\s]+([0-9\-]+)/i);
    if (rucMatch) {
      result.ruc = rucMatch[1];
    }

    // Extraer nombre (después de palabras clave)
    const nombreMatch = text.match(/(?:proveedor|llamado|nombre)[:\s]+([a-zA-Z0-9\s]+?)(?:\s+con|\s+ruc|,|$)/i);
    if (nombreMatch) {
      result.nombre = nombreMatch[1].trim();
      result.razon_social = result.nombre;
    }

    // Extraer teléfono
    const telefonoMatch = text.match(/tel[eé]fono[:\s]+([0-9\-\s]+)/i);
    if (telefonoMatch) {
      result.telefono = telefonoMatch[1].trim();
    }

    // Extraer dirección
    const direccionMatch = text.match(/direcci[oó]n[:\s]+([^,]+)/i);
    if (direccionMatch) {
      result.direccion = direccionMatch[1].trim();
    }

    result.estado = "activo";

  } else if (/editar|modificar|actualizar|cambiar/i.test(text)) {
    result.accion = "EDITAR";

    // Extraer ID
    const idMatch = text.match(/(?:id|n[uú]mero|proveedor)[:\s]+([0-9]+)/i);
    if (idMatch) {
      result.idproveedor = parseInt(idMatch[1]);
    }

    // Extraer teléfono si se menciona
    const telefonoMatch = text.match(/tel[eé]fono[:\s]+([0-9\-\s]+)/i);
    if (telefonoMatch) {
      result.telefono = telefonoMatch[1].trim();
    }

    // Extraer dirección si se menciona
    const direccionMatch = text.match(/direcci[oó]n[:\s]+([^,]+)/i);
    if (direccionMatch) {
      result.direccion = direccionMatch[1].trim();
    }

  } else if (/eliminar|borrar|quitar|dar de baja/i.test(text)) {
    result.accion = "ELIMINAR";

    // Extraer ID
    const idMatch = text.match(/(?:id|n[uú]mero|proveedor)[:\s]+([0-9]+)/i);
    if (idMatch) {
      result.idproveedor = parseInt(idMatch[1]);
    }
  }

  return result;
};

/**
 * Limpiar contexto de conversación para un usuario
 */
const clearProviderChat = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const userId = idusuarios || idfuncionario;

  if (!userId) {
    return res.status(401).json({
      error: "Usuario no autenticado",
    });
  }

  conversaciones.delete(userId);

  return res.status(200).json({
    message: "✅ Contexto de conversación limpiado",
  });
};

export {
  parseVoiceToIncome,
  parseAndRegisterIncome,
  parseVoiceToExpense,
  parseAndRegisterExpense,
  parseVoiceToProvider,
  parseAndExecuteProviderAction,
  chatProvider,
  clearProviderChat,
  checkOllamaHealth
};
