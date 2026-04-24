import axios from "axios";
import db from "../../db.js";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:3b";

// Almacén de conversaciones por usuario (en memoria)
const conversaciones = new Map();

// Limpiar conversaciones antiguas cada 30 minutos
const limpiarConversacionesAntiguas = () => {
  const TIEMPO_EXPIRACION = 30 * 60 * 1000;
  const ahora = Date.now();

  for (const [userId, conversacion] of conversaciones.entries()) {
    if (ahora - conversacion.ultimaActividad > TIEMPO_EXPIRACION) {
      conversaciones.delete(userId);
      console.log(`🗑️ Conversación del usuario ${userId} eliminada por inactividad`);
    }
  }
};

setInterval(limpiarConversacionesAntiguas, 5 * 60 * 1000);

/**
 * Obtener ID de usuario desde request
 */
const getUserId = (req) => {
  return {
    idusuarios: req.user?.idusuarios || req.user?.id,
    idfuncionario: req.user?.idfuncionario || null,
  };
};

/**
 * Obtener todas las actividades económicas disponibles
 */
const obtenerActividadesEconomicas = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT idactividad, descripcion FROM actividades_economicas ORDER BY descripcion ASC`;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results || []);
    });
  });
};

/**
 * Crear nueva actividad económica
 */
const crearActividadEconomica = (descripcion) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO actividades_economicas (descripcion) VALUES (?)`;
    db.query(query, [descripcion], (err, result) => {
      if (err) return reject(err);
      resolve({
        idactividad: result.insertId,
        descripcion: descripcion
      });
    });
  });
};

/**
 * Buscar facturador por nombre o RUC
 */
const buscarFacturadorPorNombreORuc = (nombre, ruc, idusuarios, idfuncionario) => {
  return new Promise((resolve, reject) => {
    if (!nombre && !ruc) {
      return resolve(null);
    }

    let query = `
      SELECT * FROM facturadores
      WHERE 1=1
    `;
    const params = [];

    // Filtro de seguridad
    if (idusuarios) {
      query += ` AND (idusuarios = ? OR idusuarios IS NULL)`;
      params.push(idusuarios);
    }

    // Búsqueda por nombre o RUC
    if (nombre && ruc) {
      query += ` AND (nombre_fantasia LIKE ? OR ruc LIKE ?)`;
      params.push(`%${nombre}%`, `%${ruc}%`);
    } else if (nombre) {
      query += ` AND nombre_fantasia LIKE ?`;
      params.push(`%${nombre}%`);
    } else if (ruc) {
      query += ` AND ruc LIKE ?`;
      params.push(`%${ruc}%`);
    }

    query += ` LIMIT 1`;

    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results && results.length > 0 ? results[0] : null);
    });
  });
};

/**
 * Obtener actividades económicas de un facturador
 */
const obtenerActividadesFacturador = (idfacturador) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT ae.idactividad, ae.descripcion
      FROM detalle_actividades_economicas dae
      JOIN actividades_economicas ae ON dae.idactividad = ae.idactividad
      WHERE dae.idfacturador = ?
    `;
    db.query(query, [idfacturador], (err, results) => {
      if (err) return reject(err);
      resolve(results || []);
    });
  });
};

/**
 * Ejecutar acción sobre facturador
 */
const ejecutarAccionFacturador = async (parsedData, idusuarios, idfuncionario) => {
  const { accion } = parsedData;

  switch (accion) {
    case "CREAR":
      return await ejecutarCrearFacturador(parsedData, idusuarios, idfuncionario);

    case "EDITAR":
      return await ejecutarEditarFacturador(parsedData, idusuarios, idfuncionario);

    case "ELIMINAR":
      return await ejecutarEliminarFacturador(parsedData, idusuarios, idfuncionario);

    default:
      throw new Error(`Acción no reconocida: ${accion}`);
  }
};

/**
 * Crear un nuevo facturador con sus actividades económicas
 */
const ejecutarCrearFacturador = (parsedData, idusuarios, idfuncionario) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO facturadores (
        nombre_fantasia, titular, telefono, direccion, ciudad, ruc,
        timbrado_nro, fecha_inicio_vigente, fecha_fin_vigente,
        nro_factura_inicial_habilitada, nro_factura_final_habilitada,
        idusuarios, idfuncionario
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      parsedData.nombre_fantasia,
      parsedData.titular || null,
      parsedData.telefono || null,
      parsedData.direccion || null,
      parsedData.ciudad || null,
      parsedData.ruc,
      parsedData.timbrado_nro,
      parsedData.fecha_inicio_vigente,
      parsedData.fecha_fin_vigente,
      parsedData.nro_factura_inicial || 1,
      parsedData.nro_factura_final || 999999,
      idusuarios,
      idfuncionario
    ];

    db.query(query, values, async (err, result) => {
      if (err) return reject(err);

      const idfacturador = result.insertId;

      // Insertar actividades económicas
      if (parsedData.actividades_ids && parsedData.actividades_ids.length > 0) {
        try {
          const queryActividades = `
            INSERT INTO detalle_actividades_economicas (idfacturador, idactividad)
            VALUES ?
          `;
          const valuesActividades = parsedData.actividades_ids.map(id => [idfacturador, id]);

          await new Promise((resolveAct, rejectAct) => {
            db.query(queryActividades, [valuesActividades], (errAct) => {
              if (errAct) return rejectAct(errAct);
              resolveAct();
            });
          });
        } catch (error) {
          console.error("Error al insertar actividades:", error);
        }
      }

      resolve({
        accion: "CREAR",
        idfacturador: idfacturador,
        nombre_fantasia: parsedData.nombre_fantasia,
        mensaje: `Facturador creado exitosamente`,
      });
    });
  });
};

/**
 * Editar un facturador existente
 */
const ejecutarEditarFacturador = (parsedData, idusuarios, idfuncionario) => {
  return new Promise((resolve, reject) => {
    const campos = [];
    const valores = [];

    // Construir SET dinámicamente
    if (parsedData.nombre_fantasia) {
      campos.push("nombre_fantasia = ?");
      valores.push(parsedData.nombre_fantasia);
    }
    if (parsedData.titular) {
      campos.push("titular = ?");
      valores.push(parsedData.titular);
    }
    if (parsedData.telefono) {
      campos.push("telefono = ?");
      valores.push(parsedData.telefono);
    }
    if (parsedData.direccion) {
      campos.push("direccion = ?");
      valores.push(parsedData.direccion);
    }
    if (parsedData.ciudad) {
      campos.push("ciudad = ?");
      valores.push(parsedData.ciudad);
    }
    if (parsedData.ruc) {
      campos.push("ruc = ?");
      valores.push(parsedData.ruc);
    }
    if (parsedData.timbrado_nro) {
      campos.push("timbrado_nro = ?");
      valores.push(parsedData.timbrado_nro);
    }
    if (parsedData.fecha_inicio_vigente) {
      campos.push("fecha_inicio_vigente = ?");
      valores.push(parsedData.fecha_inicio_vigente);
    }
    if (parsedData.fecha_fin_vigente) {
      campos.push("fecha_fin_vigente = ?");
      valores.push(parsedData.fecha_fin_vigente);
    }

    if (campos.length === 0) {
      return reject(new Error("No hay campos para actualizar"));
    }

    valores.push(parsedData.idfacturador);

    let securityCondition = "";
    if (idusuarios) {
      securityCondition = ` AND (idusuarios = ? OR idusuarios IS NULL)`;
      valores.push(idusuarios);
    }

    const query = `
      UPDATE facturadores
      SET ${campos.join(", ")}
      WHERE idfacturador = ?${securityCondition}
    `;

    db.query(query, valores, (err, result) => {
      if (err) return reject(err);
      if (result.affectedRows === 0) {
        return reject(new Error("Facturador no encontrado o no tienes permisos"));
      }
      resolve({
        accion: "EDITAR",
        idfacturador: parsedData.idfacturador,
        mensaje: `Facturador actualizado exitosamente`,
      });
    });
  });
};

/**
 * Eliminar un facturador
 */
const ejecutarEliminarFacturador = (parsedData, idusuarios, idfuncionario) => {
  return new Promise((resolve, reject) => {
    let securityCondition = "";
    const params = [parsedData.idfacturador];

    if (idusuarios) {
      securityCondition = ` AND (idusuarios = ? OR idusuarios IS NULL)`;
      params.push(idusuarios);
    }

    const query = `DELETE FROM facturadores WHERE idfacturador = ?${securityCondition}`;

    db.query(query, params, (err, result) => {
      if (err) return reject(err);
      if (result.affectedRows === 0) {
        return reject(new Error("Facturador no encontrado o no tienes permisos"));
      }
      resolve({
        accion: "ELIMINAR",
        idfacturador: parsedData.idfacturador,
        mensaje: `Facturador eliminado exitosamente`,
      });
    });
  });
};

/**
 * Parsear mensaje del usuario con Ollama
 */
const parseTextWithOllamaFacturadorConversational = async (text, historial = []) => {
  const prompt = `Eres un asistente que extrae información sobre facturadores de mensajes conversacionales en español.

**Categorías de acciones:**

**CREAR (palabras clave: crear, agregar, nuevo, registrar):**
- "necesito crear un facturador" → {"accion": "CREAR", "confidence": 95}
- "registrar nuevo facturador" → {"accion": "CREAR", "confidence": 95}

**EDITAR (palabras clave: editar, modificar, actualizar, cambiar):**
- "editar facturador ABC" → {"accion": "EDITAR", "nombre_fantasia": "ABC", "confidence": 85}
- "actualizar el teléfono del facturador" → {"accion": "EDITAR", "confidence": 85}

**ELIMINAR (palabras clave: eliminar, borrar, dar de baja):**
- "eliminar facturador XYZ" → {"accion": "ELIMINAR", "nombre_fantasia": "XYZ", "confidence": 85}

**CONSULTAR (palabras clave: hola, ayuda, qué puedes hacer):**
- "hola" → {"accion": "CONSULTAR", "confidence": 95}

Mensaje del usuario: "${text}"

Historial: ${JSON.stringify(historial.slice(-3))}

Responde ÚNICAMENTE con un objeto JSON:
{
  "accion": "CREAR" | "EDITAR" | "ELIMINAR" | "CONSULTAR",
  "nombre_fantasia": "string",
  "titular": "string",
  "ruc": "string",
  "telefono": "string",
  "direccion": "string",
  "ciudad": "string",
  "timbrado_nro": "string",
  "fecha_inicio_vigente": "YYYY-MM-DD",
  "fecha_fin_vigente": "YYYY-MM-DD",
  "idfacturador": number,
  "confidence": number (0-100)
}`;

  try {
    const response = await axios.post(
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

    const responseText = response.data.response;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      parsed.confidence = parsed.confidence || 50;
      return parsed;
    }

    return { accion: "", confidence: 0 };
  } catch (error) {
    console.error("Error en Ollama:", error.message);
    return { accion: "", confidence: 0 };
  }
};

/**
 * Verificar si falta información según la acción
 */
const verificarInformacionIncompleta = (parsedData) => {
  const camposFaltantes = [];

  switch (parsedData.accion) {
    case "CREAR":
      if (!parsedData.nombre_fantasia) camposFaltantes.push("nombre_fantasia");
      if (!parsedData.ruc) camposFaltantes.push("ruc");
      if (!parsedData.timbrado_nro) camposFaltantes.push("timbrado_nro");
      if (!parsedData.fecha_inicio_vigente) camposFaltantes.push("fecha_inicio_vigente");
      if (!parsedData.fecha_fin_vigente) camposFaltantes.push("fecha_fin_vigente");

      // Verificar actividades económicas
      if (!parsedData.esperando_actividades && !parsedData.actividades_confirmadas) {
        camposFaltantes.push("actividades_economicas");
      }
      break;

    case "EDITAR":
      if (!parsedData.idfacturador && !parsedData.ruc && !parsedData.nombre_fantasia) {
        camposFaltantes.push("identificador");
      }

      if (parsedData.idfacturador) {
        const camposEditables = ["nombre_fantasia", "titular", "telefono", "direccion", "ciudad", "ruc", "timbrado_nro", "fecha_inicio_vigente", "fecha_fin_vigente"];
        const tieneAlgunCampoParaEditar = camposEditables.some(campo => {
          return parsedData[campo] !== undefined && parsedData[campo] !== null && parsedData[campo] !== '';
        });

        if (!tieneAlgunCampoParaEditar) {
          camposFaltantes.push("campo_a_editar");
        }
      }
      break;

    case "ELIMINAR":
      if (!parsedData.idfacturador) {
        camposFaltantes.push("idfacturador");
      } else if (!parsedData.confirmado) {
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
const generarPreguntaAmigable = async (parsedData, necesitaMasInfo) => {
  const { accion } = parsedData;
  const { camposFaltantes } = necesitaMasInfo;

  // Para CREAR - manejo especial de actividades económicas
  if (accion === "CREAR" && camposFaltantes.includes("actividades_economicas")) {
    try {
      const actividades = await obtenerActividadesEconomicas();

      let mensaje = `📋 **Actividades Económicas Disponibles:**\n\n`;

      if (actividades.length > 0) {
        actividades.forEach((act, index) => {
          mensaje += `${index + 1}. ${act.descripcion} (ID: ${act.idactividad})\n`;
        });

        mensaje += `\n💡 **¿Cómo proceder?**\n`;
        mensaje += `• Para seleccionar actividades existentes, responde con los números o IDs separados por comas. Ejemplo: "1, 3, 5" o "IDs: 10, 15"\n`;
        mensaje += `• Para crear una nueva actividad, di: "crear nueva actividad: [descripción]"\n`;
        mensaje += `• Puedes hacer ambas cosas: "Usar las actividades 1 y 2, y crear nueva: Servicios IT"`;
      } else {
        mensaje += `No hay actividades económicas registradas aún.\n\n`;
        mensaje += `💡 Para crear una nueva actividad, di: "crear actividad: [descripción]"\n`;
        mensaje += `Ejemplo: "crear actividad: Venta de productos alimenticios"`;
      }

      return mensaje;
    } catch (error) {
      console.error("Error al obtener actividades:", error);
      return "¿Qué actividad económica deseas asignar al facturador?";
    }
  }

  const respuestas = {
    CREAR: {
      nombre_fantasia: "¡Perfecto! ¿Cuál es el nombre de fantasía del facturador?",
      ruc: `Excelente. Ahora necesito el RUC del facturador ${parsedData.nombre_fantasia || ""}.`,
      timbrado_nro: "¿Cuál es el número de timbrado?",
      fecha_inicio_vigente: "¿Cuál es la fecha de inicio de vigencia del timbrado? (formato: YYYY-MM-DD o DD/MM/YYYY)",
      fecha_fin_vigente: "¿Y la fecha de fin de vigencia del timbrado?",
    },
    EDITAR: {
      identificador: `Para editar un facturador necesito que me des el nombre de fantasía, RUC o ID.`,
      campo_a_editar: parsedData.facturadorEncontrado
        ? `Perfecto, encontré al facturador:\n\n📋 **Datos actuales:**\n- Nombre: ${parsedData.facturadorEncontrado.nombre_fantasia}\n- RUC: ${parsedData.facturadorEncontrado.ruc}\n- Timbrado: ${parsedData.facturadorEncontrado.timbrado_nro}\n- Vigencia: ${parsedData.facturadorEncontrado.fecha_inicio_vigente} - ${parsedData.facturadorEncontrado.fecha_fin_vigente}\n\n¿Qué información quieres actualizar?`
        : `Perfecto, encontré al facturador. ¿Qué información quieres actualizar?`,
    },
    ELIMINAR: {
      idfacturador: "¿Cuál es el nombre de fantasía o RUC del facturador que deseas eliminar?",
      confirmacion: parsedData.facturadorEncontrado
        ? `⚠️ **Confirmación necesaria**\n\nEstás a punto de eliminar al facturador:\n\n📋 **Datos:**\n- Nombre: ${parsedData.facturadorEncontrado.nombre_fantasia}\n- RUC: ${parsedData.facturadorEncontrado.ruc}\n- Timbrado: ${parsedData.facturadorEncontrado.timbrado_nro}\n\n¿Estás seguro? Responde "sí" para confirmar o "no" para cancelar.`
        : `⚠️ ¿Estás seguro de eliminar este facturador? Responde "sí" para confirmar.`,
    },
  };

  if (accion === "CREAR") {
    const primerFaltante = camposFaltantes[0];
    return respuestas.CREAR[primerFaltante] || "¿Podrías darme más información?";
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
    if (camposFaltantes.includes("idfacturador")) {
      return respuestas.ELIMINAR.idfacturador;
    }
    if (camposFaltantes.includes("confirmacion")) {
      return respuestas.ELIMINAR.confirmacion;
    }
  }

  return "¿Podrías darme más detalles?";
};

/**
 * Generar respuesta conversacional
 */
const generarRespuestaConversacional = (text, parsedData) => {
  const mensajeMinusculas = text.toLowerCase();

  if (/^(hola|hi|hello|buenos días|buenas tardes|hey)/i.test(mensajeMinusculas)) {
    return "¡Hola! 👋 Estoy aquí para ayudarte con la gestión de facturadores. Puedo ayudarte a crear, editar o eliminar facturadores. ¿Qué necesitas hacer?";
  }

  if (/ayuda|help|que puedes hacer|qué puedes hacer/i.test(mensajeMinusculas)) {
    return `¡Claro! Puedo ayudarte con:\n\n✨ **Crear facturadores** - Di "crear un nuevo facturador"\n\n✏️ **Editar facturadores** - Por ejemplo "editar facturador ABC"\n\n🗑️ **Eliminar facturadores** - Como "eliminar facturador XYZ"\n\n¿Qué te gustaría hacer?`;
  }

  return "No entendí muy bien. ¿Podrías reformular? Puedo ayudarte a crear, editar o eliminar facturadores.";
};

/**
 * Generar respuesta de éxito
 */
const generarRespuestaExito = (parsedData, resultado) => {
  const { accion } = parsedData;

  switch (accion) {
    case "CREAR":
      return `✅ ¡Facturador creado exitosamente!\n\n📋 **Detalles:**\n- ID: ${resultado.idfacturador}\n- Nombre: ${resultado.nombre_fantasia}`;

    case "EDITAR":
      return `✅ ¡Facturador actualizado exitosamente!`;

    case "ELIMINAR":
      return `✅ Facturador eliminado exitosamente.`;

    default:
      return "✅ Operación completada.";
  }
};

/**
 * Extraer información adicional del mensaje
 */
const extraerInformacionAdicional = async (text, contextoActual) => {
  const info = {};

  // Confirmación
  if (/^(sí|si|yes|confirmar|confirmo|adelante|ok)$/i.test(text.trim())) {
    info.confirmado = true;
    console.log("✅ Confirmación detectada");
  }

  // Cancelación
  if (/^(no|cancel|cancelar|olvida|dejalo)$/i.test(text.trim())) {
    info.cancelado = true;
    console.log("✅ Cancelación detectada");
  }

  // Detección de actividades económicas
  if (contextoActual.accion === "CREAR") {
    // Crear nueva actividad
    const crearActMatch = text.match(/crear\s+(?:nueva\s+)?actividad:?\s+(.+)/i);
    if (crearActMatch) {
      info.nueva_actividad = crearActMatch[1].trim();
      console.log("✅ Nueva actividad detectada:", info.nueva_actividad);
    }

    // Seleccionar actividades por número o ID
    const numerosMatch = text.match(/(\d+(?:\s*,\s*\d+)*)/);
    if (numerosMatch) {
      const numeros = numerosMatch[1].split(/\s*,\s*/).map(n => parseInt(n.trim()));
      info.actividades_seleccionadas = numeros;
      console.log("✅ Actividades seleccionadas:", numeros);
    }

    // IDs específicos
    const idsMatch = text.match(/ids?:?\s*(\d+(?:\s*,\s*\d+)*)/i);
    if (idsMatch) {
      const ids = idsMatch[1].split(/\s*,\s*/).map(n => parseInt(n.trim()));
      info.actividades_ids = ids;
      console.log("✅ IDs de actividades:", ids);
    }
  }

  // Nombre de fantasía
  if (!contextoActual.idfacturador) {
    const nombreMatch = text.match(/(?:nombre|fantasia|se\s+llama)\s+(?:es\s+)?(.+?)(?:\.|$)/i);
    if (nombreMatch) {
      info.nombre_fantasia = nombreMatch[1].trim();
    }
  }

  // RUC
  const rucMatch = text.match(/ruc\s*:?\s*(\d{6,10}-?\d?)/i);
  if (rucMatch) {
    info.ruc = rucMatch[1];
  }

  // Timbrado
  const timbradoMatch = text.match(/timbrado\s*:?\s*(\d+)/i);
  if (timbradoMatch) {
    info.timbrado_nro = timbradoMatch[1];
  }

  // Fechas
  const fechaInicioMatch = text.match(/(?:inicio|desde)\s+(?:vigencia\s+)?(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/i);
  if (fechaInicioMatch) {
    info.fecha_inicio_vigente = convertirFecha(fechaInicioMatch[1]);
  }

  const fechaFinMatch = text.match(/(?:fin|hasta|vence)\s+(?:vigencia\s+)?(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/i);
  if (fechaFinMatch) {
    info.fecha_fin_vigente = convertirFecha(fechaFinMatch[1]);
  }

  return info;
};

/**
 * Convertir fecha de DD/MM/YYYY a YYYY-MM-DD
 */
const convertirFecha = (fecha) => {
  if (fecha.includes('/')) {
    const [dia, mes, año] = fecha.split('/');
    return `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
  return fecha;
};

/**
 * Procesar respuesta contextual
 */
const procesarRespuestaContextual = async (text, conversacion, idusuarios, idfuncionario, res) => {
  const contexto = conversacion.contexto;

  // Detectar cambio de acción
  const cambioAccionMatch = text.match(/(?:cancelar?|ya no|no quiero).*?(?:quiero|necesito)\s+(crear|editar|eliminar)/i);
  const accionDirectaMatch = text.match(/^(?:quiero|necesito)\s+(crear|editar|eliminar)\s+(?:un|el)?\s*facturador/i);

  if (cambioAccionMatch || accionDirectaMatch) {
    console.log("🔄 Cambio de acción detectado, reiniciando...");

    conversacion.contexto = {};
    conversacion.esperandoRespuesta = false;

    const parsedData = await parseTextWithOllamaFacturadorConversational(text, conversacion.historial);
    conversacion.contexto = parsedData;
    conversacion.esperandoRespuesta = true;

    const necesitaMasInfo = verificarInformacionIncompleta(parsedData);

    if (necesitaMasInfo.incompleto) {
      const respuesta = await generarPreguntaAmigable(parsedData, necesitaMasInfo);

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
  }

  // Extraer información adicional
  const infoAdicional = await extraerInformacionAdicional(text, contexto);

  // Filtrar valores null/undefined
  const infoFiltrada = Object.fromEntries(
    Object.entries(infoAdicional).filter(([key, value]) => {
      if (key === 'confirmado' || key === 'cancelado') {
        return value === true;
      }
      return value !== null && value !== undefined;
    })
  );

  Object.assign(contexto, infoFiltrada);

  // Verificar cancelación
  if (contexto.cancelado) {
    const respuesta = "Entendido, operación cancelada. ¿Hay algo más en lo que pueda ayudarte?";

    conversacion.historial.push({
      rol: "asistente",
      texto: respuesta,
      timestamp: new Date(),
    });

    conversacion.contexto = {};
    conversacion.esperandoRespuesta = false;

    return res.status(200).json({
      mensaje: respuesta,
      esperandoRespuesta: false,
    });
  }

  // Manejo especial para actividades económicas en CREAR
  if (contexto.accion === "CREAR" && (infoFiltrada.nueva_actividad || infoFiltrada.actividades_seleccionadas || infoFiltrada.actividades_ids)) {
    try {
      // Crear nueva actividad si se solicitó
      if (infoFiltrada.nueva_actividad) {
        const nuevaAct = await crearActividadEconomica(infoFiltrada.nueva_actividad);
        contexto.actividades_ids = contexto.actividades_ids || [];
        contexto.actividades_ids.push(nuevaAct.idactividad);
        console.log(`✅ Nueva actividad creada: ${nuevaAct.descripcion} (ID: ${nuevaAct.idactividad})`);
      }

      // Convertir números de selección a IDs
      if (infoFiltrada.actividades_seleccionadas) {
        const actividades = await obtenerActividadesEconomicas();
        const idsSeleccionados = infoFiltrada.actividades_seleccionadas.map(num => {
          const act = actividades[num - 1];
          return act ? act.idactividad : null;
        }).filter(id => id !== null);

        contexto.actividades_ids = contexto.actividades_ids || [];
        contexto.actividades_ids.push(...idsSeleccionados);
      }

      // Marcar actividades como confirmadas
      if (contexto.actividades_ids && contexto.actividades_ids.length > 0) {
        contexto.actividades_confirmadas = true;
        delete contexto.esperando_actividades;
      }
    } catch (error) {
      console.error("Error al procesar actividades:", error);
    }
  }

  // Buscar facturador si es EDITAR o ELIMINAR
  if ((contexto.accion === "EDITAR" || contexto.accion === "ELIMINAR") && !contexto.idfacturador) {
    if (contexto.nombre_fantasia || contexto.ruc) {
      try {
        const facturador = await buscarFacturadorPorNombreORuc(contexto.nombre_fantasia, contexto.ruc, idusuarios, idfuncionario);

        if (facturador) {
          contexto.idfacturador = facturador.idfacturador;
          contexto.facturadorEncontrado = {
            nombre_fantasia: facturador.nombre_fantasia,
            ruc: facturador.ruc,
            timbrado_nro: facturador.timbrado_nro,
            fecha_inicio_vigente: facturador.fecha_inicio_vigente,
            fecha_fin_vigente: facturador.fecha_fin_vigente,
          };
          contexto.nombre_fantasia = null;
          contexto.ruc = null;
        } else {
          const respuesta = `No encontré un facturador con ese nombre o RUC. ¿Podrías verificar los datos?`;

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
        console.error("Error al buscar facturador:", error);
      }
    }
  }

  // Verificar si está completo
  const necesitaMasInfo = verificarInformacionIncompleta(contexto);

  if (necesitaMasInfo.incompleto) {
    const respuesta = await generarPreguntaAmigable(contexto, necesitaMasInfo);

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

  // Ejecutar la acción
  const resultado = await ejecutarAccionFacturador(contexto, idusuarios, idfuncionario);
  const respuestaExito = generarRespuestaExito(contexto, resultado);

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
};

/**
 * Chat conversacional para facturadores
 */
const chatFacturador = async (req, res) => {
  try {
    const { mensaje, historial } = req.body;
    const { idusuarios, idfuncionario } = getUserId(req);
    const userIdFinal = idusuarios || idfuncionario;

    if (!mensaje || typeof mensaje !== "string") {
      return res.status(400).json({
        error: "El texto del mensaje es requerido",
      });
    }

    if (!userIdFinal) {
      return res.status(401).json({
        error: "Usuario no autenticado",
      });
    }

    console.log(`💬 Chat facturador (Usuario ${userIdFinal}): "${mensaje}"`);

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

    conversacion.ultimaActividad = Date.now();

    conversacion.historial.push({
      rol: "usuario",
      texto: mensaje,
      timestamp: new Date(),
    });

    // Si estamos esperando respuesta
    if (conversacion.esperandoRespuesta && conversacion.contexto.accion) {
      return await procesarRespuestaContextual(mensaje, conversacion, idusuarios, idfuncionario, res);
    }

    // Parsear mensaje inicial
    const parsedData = await parseTextWithOllamaFacturadorConversational(mensaje, conversacion.historial);

    if (!parsedData.accion || parsedData.accion === "" || parsedData.accion === "CONSULTAR") {
      const respuestaConversacional = generarRespuestaConversacional(mensaje, parsedData);

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

    // Buscar facturador si es EDITAR o ELIMINAR
    if ((parsedData.accion === "EDITAR" || parsedData.accion === "ELIMINAR") && !parsedData.idfacturador && (parsedData.nombre_fantasia || parsedData.ruc)) {
      try {
        const facturador = await buscarFacturadorPorNombreORuc(parsedData.nombre_fantasia, parsedData.ruc, idusuarios, idfuncionario);

        if (facturador) {
          parsedData.idfacturador = facturador.idfacturador;
          parsedData.facturadorEncontrado = {
            nombre_fantasia: facturador.nombre_fantasia,
            ruc: facturador.ruc,
            timbrado_nro: facturador.timbrado_nro,
            fecha_inicio_vigente: facturador.fecha_inicio_vigente,
            fecha_fin_vigente: facturador.fecha_fin_vigente,
          };
          parsedData.nombre_fantasia = null;
          parsedData.ruc = null;
        } else {
          conversacion.contexto = parsedData;
          conversacion.esperandoRespuesta = true;

          const respuesta = `No encontré un facturador con ese nombre o RUC. ¿Podrías verificar los datos?`;

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
        console.error("Error al buscar facturador:", error);
      }
    }

    // Verificar información incompleta
    const necesitaMasInfo = verificarInformacionIncompleta(parsedData);

    if (necesitaMasInfo.incompleto) {
      conversacion.contexto = parsedData;
      conversacion.esperandoRespuesta = true;

      const respuesta = await generarPreguntaAmigable(parsedData, necesitaMasInfo);

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

    // Ejecutar acción
    const resultado = await ejecutarAccionFacturador(parsedData, idusuarios, idfuncionario);
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

  } catch (error) {
    console.error("❌ Error en chatFacturador:", error);
    return res.status(500).json({
      error: "Error al procesar el mensaje",
      detalles: error.message,
    });
  }
};

export { chatFacturador };
