import axios from "axios";
import db from "../../db.js";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:3b";

// Almacén de conversaciones por usuario (en memoria)
const conversaciones = new Map();

// Limpiar conversaciones antiguas cada 30 minutos
const limpiarConversacionesAntiguas = () => {
  const TIEMPO_EXPIRACION = 30 * 60 * 1000; // 30 minutos
  const ahora = Date.now();

  for (const [userId, conversacion] of conversaciones.entries()) {
    if (ahora - conversacion.ultimaActividad > TIEMPO_EXPIRACION) {
      conversaciones.delete(userId);
      console.log(`🗑️ Conversación del usuario ${userId} eliminada por inactividad`);
    }
  }
};

// Limpiar cada 5 minutos
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
 * Buscar cliente por nombre o número de documento
 * Con filtro de seguridad: solo clientes del usuario o sus funcionarios
 */
const buscarClientePorNombreODocumento = (nombre, numDocumento, idusuarios, idfuncionario) => {
  return new Promise((resolve, reject) => {
    // Si no hay nombre NI documento, no buscar (retornar null)
    if (!nombre && !numDocumento) {
      return resolve(null);
    }

    let query = `
      SELECT * FROM clientes
      WHERE deleted_at IS NULL
    `;
    const params = [];

    // Filtro de seguridad: solo clientes del usuario o sus funcionarios
    if (idusuarios) {
      query += ` AND (idusuario = ? OR idfuncionario IN (
        SELECT idfuncionario FROM funcionarios WHERE idusuarios = ?
      ))`;
      params.push(idusuarios, idusuarios);
    }

    // Buscar por nombre, apellido o número de documento
    if (nombre && numDocumento) {
      query += ` AND (CONCAT(nombre, ' ', apellido) LIKE ? OR numDocumento LIKE ?)`;
      params.push(`%${nombre}%`, `%${numDocumento}%`);
    } else if (nombre) {
      query += ` AND CONCAT(nombre, ' ', apellido) LIKE ?`;
      params.push(`%${nombre}%`);
    } else if (numDocumento) {
      query += ` AND numDocumento LIKE ?`;
      params.push(`%${numDocumento}%`);
    }

    query += ` LIMIT 1`;

    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results && results.length > 0 ? results[0] : null);
    });
  });
};

/**
 * Ejecutar acción sobre cliente (CREAR, EDITAR, ELIMINAR)
 */
const ejecutarAccionCliente = async (parsedData, idusuarios, idfuncionario) => {
  const { accion } = parsedData;

  switch (accion) {
    case "CREAR":
      return await ejecutarCrearCliente(parsedData, idusuarios, idfuncionario);

    case "EDITAR":
      return await ejecutarEditarCliente(parsedData, idusuarios, idfuncionario);

    case "ELIMINAR":
      return await ejecutarEliminarCliente(parsedData, idusuarios, idfuncionario);

    default:
      throw new Error(`Acción no reconocida: ${accion}`);
  }
};

/**
 * Crear un nuevo cliente
 */
const ejecutarCrearCliente = (parsedData, idusuarios, idfuncionario) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO clientes (
        nombre, apellido, tipo, numDocumento, telefono, direccion,
        genero, estado, descripcion, tipo_cliente, tipo_documento,
        idusuario, idfuncionario, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    // Separar nombre completo en nombre y apellido si viene junto
    let nombre = parsedData.nombre || "";
    let apellido = parsedData.apellido || "";

    if (nombre && !apellido && nombre.includes(" ")) {
      const partes = nombre.split(" ");
      nombre = partes[0];
      apellido = partes.slice(1).join(" ");
    }

    const values = [
      nombre,
      apellido,
      parsedData.tipo || "persona",
      parsedData.numDocumento || null,
      parsedData.telefono || null,
      parsedData.direccion || null,
      parsedData.genero || null,
      parsedData.estado || "activo",
      parsedData.descripcion || null,
      parsedData.tipo_cliente || "minorista",
      parsedData.tipo_documento || null,
      idusuarios,
      idfuncionario,
    ];

    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve({
        accion: "CREAR",
        idcliente: result.insertId,
        nombre: `${nombre} ${apellido}`.trim(),
        mensaje: `Cliente creado exitosamente`,
      });
    });
  });
};

/**
 * Editar un cliente existente
 */
const ejecutarEditarCliente = (parsedData, idusuarios, idfuncionario) => {
  return new Promise((resolve, reject) => {
    const campos = [];
    const valores = [];

    // Construir SET dinámicamente
    if (parsedData.nombre) {
      // Si el nombre incluye espacio, separar en nombre y apellido
      if (parsedData.nombre.includes(" ")) {
        const partes = parsedData.nombre.split(" ");
        campos.push("nombre = ?", "apellido = ?");
        valores.push(partes[0], partes.slice(1).join(" "));
      } else {
        campos.push("nombre = ?");
        valores.push(parsedData.nombre);
      }
    }
    if (parsedData.apellido) {
      campos.push("apellido = ?");
      valores.push(parsedData.apellido);
    }
    if (parsedData.telefono) {
      campos.push("telefono = ?");
      valores.push(parsedData.telefono);
    }
    if (parsedData.direccion) {
      campos.push("direccion = ?");
      valores.push(parsedData.direccion);
    }
    if (parsedData.numDocumento) {
      campos.push("numDocumento = ?");
      valores.push(parsedData.numDocumento);
    }
    if (parsedData.tipo) {
      campos.push("tipo = ?");
      valores.push(parsedData.tipo);
    }
    if (parsedData.genero) {
      campos.push("genero = ?");
      valores.push(parsedData.genero);
    }
    if (parsedData.estado) {
      campos.push("estado = ?");
      valores.push(parsedData.estado);
    }
    if (parsedData.tipo_cliente) {
      campos.push("tipo_cliente = ?");
      valores.push(parsedData.tipo_cliente);
    }

    if (campos.length === 0) {
      return reject(new Error("No hay campos para actualizar"));
    }

    // Agregar updated_at
    campos.push("updated_at = NOW()");

    // Agregar ID y filtros de seguridad
    valores.push(parsedData.idcliente);

    let securityCondition = "";
    if (idusuarios) {
      securityCondition = ` AND (idusuario = ? OR idfuncionario IN (
        SELECT idfuncionario FROM funcionarios WHERE idusuarios = ?
      ))`;
      valores.push(idusuarios, idusuarios);
    }

    const query = `
      UPDATE clientes
      SET ${campos.join(", ")}
      WHERE idcliente = ? AND deleted_at IS NULL${securityCondition}
    `;

    db.query(query, valores, (err, result) => {
      if (err) return reject(err);
      if (result.affectedRows === 0) {
        return reject(new Error("Cliente no encontrado o no tienes permisos para editarlo"));
      }
      resolve({
        accion: "EDITAR",
        idcliente: parsedData.idcliente,
        mensaje: `Cliente actualizado exitosamente`,
      });
    });
  });
};

/**
 * Eliminar un cliente (soft delete)
 */
const ejecutarEliminarCliente = (parsedData, idusuarios, idfuncionario) => {
  return new Promise((resolve, reject) => {
    let securityCondition = "";
    const params = [parsedData.idcliente];

    if (idusuarios) {
      securityCondition = ` AND (idusuario = ? OR idfuncionario IN (
        SELECT idfuncionario FROM funcionarios WHERE idusuarios = ?
      ))`;
      params.push(idusuarios, idusuarios);
    }

    const query = `
      UPDATE clientes
      SET deleted_at = NOW()
      WHERE idcliente = ? AND deleted_at IS NULL${securityCondition}
    `;

    db.query(query, params, (err, result) => {
      if (err) return reject(err);
      if (result.affectedRows === 0) {
        return reject(new Error("Cliente no encontrado o no tienes permisos para eliminarlo"));
      }
      resolve({
        accion: "ELIMINAR",
        idcliente: parsedData.idcliente,
        mensaje: `Cliente eliminado exitosamente`,
      });
    });
  });
};

/**
 * Parsear mensaje del usuario con Ollama (conversacional)
 */
const parseTextWithOllamaClienteConversational = async (text, historial = []) => {
  const prompt = `Eres un asistente que extrae información sobre clientes de mensajes conversacionales en español.

IMPORTANTE: Solo extrae información si el usuario menciona explícitamente la acción y los datos.

**Categorías de acciones con palabras clave:**

**EJEMPLOS DE CREAR (palabras clave: crear, agregar, nuevo, registrar):**
- "necesito crear un cliente" → {"accion": "CREAR", "confidence": 95}
- "quiero agregar un cliente" → {"accion": "CREAR", "confidence": 95}
- "registrar nuevo cliente Juan Pérez" → {"accion": "CREAR", "nombre": "Juan Pérez", "confidence": 95}

**EJEMPLOS DE EDITAR (palabras clave: editar, modificar, actualizar, cambiar):**
- "puedes editarme un cliente llamado Juan Pérez?" → {"accion": "EDITAR", "nombre": "Juan Pérez", "confidence": 85}
- "actualizar el teléfono del cliente 5" → {"accion": "EDITAR", "idcliente": 5, "confidence": 85}

**EJEMPLOS DE ELIMINAR (palabras clave: eliminar, borrar, dar de baja):**
- "eliminar cliente ABC" → {"accion": "ELIMINAR", "nombre": "ABC", "confidence": 85}
- "borrar cliente con documento 12345678" → {"accion": "ELIMINAR", "numDocumento": "12345678", "confidence": 85}

**EJEMPLOS DE CONSULTAR (palabras clave: hola, ayuda, qué puedes hacer):**
- "hola" → {"accion": "CONSULTAR", "confidence": 95}
- "ayuda" → {"accion": "CONSULTAR", "confidence": 95}

Mensaje del usuario: "${text}"

Historial reciente: ${JSON.stringify(historial.slice(-3))}

Responde ÚNICAMENTE con un objeto JSON (sin markdown, sin texto adicional):
{
  "accion": "CREAR" | "EDITAR" | "ELIMINAR" | "CONSULTAR",
  "nombre": "string" (nombre completo del cliente),
  "apellido": "string" (apellido),
  "numDocumento": "string" (número de documento),
  "telefono": "string" (teléfono),
  "direccion": "string" (dirección),
  "tipo": "persona" | "empresa",
  "genero": "masculino" | "femenino" | "otro",
  "estado": "activo" | "inactivo",
  "tipo_cliente": "minorista" | "mayorista",
  "idcliente": number,
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
    console.log("🤖 Respuesta de Ollama:", responseText);

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
      if (!parsedData.nombre) camposFaltantes.push("nombre");
      if (!parsedData.numDocumento) camposFaltantes.push("numDocumento");
      break;

    case "EDITAR":
      // Para editar necesitamos alguna forma de identificar al cliente
      if (!parsedData.idcliente && !parsedData.numDocumento && !parsedData.nombre) {
        camposFaltantes.push("identificador");
      }

      // Si ya tenemos ID (ya se buscó el cliente), verificar que haya algo para editar
      if (parsedData.idcliente) {
        const camposEditables = ["nombre", "apellido", "telefono", "direccion", "numDocumento", "tipo", "genero", "estado", "tipo_cliente"];
        const tieneAlgunCampoParaEditar = camposEditables.some(campo => {
          return parsedData[campo] !== undefined && parsedData[campo] !== null && parsedData[campo] !== '';
        });

        if (!tieneAlgunCampoParaEditar) {
          camposFaltantes.push("campo_a_editar");
        }
      }
      break;

    case "ELIMINAR":
      if (!parsedData.idcliente) {
        camposFaltantes.push("idcliente");
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
const generarPreguntaAmigable = (parsedData, necesitaMasInfo) => {
  const { accion } = parsedData;
  const { camposFaltantes } = necesitaMasInfo;

  const respuestas = {
    CREAR: {
      nombre: "¡Claro que sí! ¿Cómo se llama el cliente que quieres agregar?",
      numDocumento: `Perfecto, voy a agregar al cliente ${parsedData.nombre || ""}. ¿Me podrías dar su número de documento?`,
      ambos: "¡Con gusto! Para crear el cliente necesito que me des su nombre completo y número de documento. ¿Me los proporcionas?",
    },
    EDITAR: {
      identificador: `Claro, puedo ayudarte a editar un cliente. ¿Me das el nombre completo, número de documento o ID del cliente para encontrarlo?`,
      campo_a_editar: parsedData.clienteEncontrado
        ? `Perfecto, encontré al cliente:\n\n📋 **Datos actuales:**\n- Nombre: ${parsedData.clienteEncontrado.nombre}\n- Documento: ${parsedData.clienteEncontrado.numDocumento}\n- Teléfono: ${parsedData.clienteEncontrado.telefono}\n- Dirección: ${parsedData.clienteEncontrado.direccion}\n\n¿Qué información quieres actualizar? Por ejemplo: "cambiar el teléfono a 0981234567"`
        : `Perfecto, encontré al cliente. ¿Qué información quieres actualizar?`,
    },
    ELIMINAR: {
      idcliente: "Entendido, voy a eliminar un cliente. ¿Me das el nombre completo o número de documento del cliente para encontrarlo?",
      confirmacion: parsedData.clienteEncontrado
        ? `⚠️ **Confirmación necesaria**\n\nEstás a punto de eliminar al cliente:\n\n📋 **Datos:**\n- Nombre: ${parsedData.clienteEncontrado.nombre}\n- Documento: ${parsedData.clienteEncontrado.numDocumento}\n- Teléfono: ${parsedData.clienteEncontrado.telefono}\n\n¿Estás seguro de que deseas eliminar este cliente? Responde "sí" para confirmar o "no" para cancelar.`
        : `⚠️ Necesito tu confirmación para eliminar este cliente. ¿Estás seguro? Responde "sí" para confirmar o "no" para cancelar.`,
    },
  };

  // Respuestas personalizadas
  if (accion === "CREAR") {
    if (camposFaltantes.includes("nombre") && camposFaltantes.includes("numDocumento")) {
      return respuestas.CREAR.ambos;
    }
    if (camposFaltantes.includes("nombre")) {
      return respuestas.CREAR.nombre;
    }
    if (camposFaltantes.includes("numDocumento")) {
      return respuestas.CREAR.numDocumento;
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
    if (camposFaltantes.includes("idcliente")) {
      return respuestas.ELIMINAR.idcliente;
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
      "¡Hola! 👋 Estoy aquí para ayudarte con la gestión de clientes. Puedo ayudarte a crear, editar o eliminar clientes. ¿Qué necesitas hacer?",
      "¡Hola! ¿En qué puedo ayudarte con tus clientes hoy?",
      "¡Hola! Estoy listo para ayudarte. ¿Quieres crear, editar o eliminar un cliente?",
    ];
    return respuestas[Math.floor(Math.random() * respuestas.length)];
  }

  // Solicitudes de ayuda
  if (/ayuda|help|que puedes hacer|qué puedes hacer|como funciona/i.test(mensajeMinusculas)) {
    return `¡Claro! Puedo ayudarte con:\n\n✨ **Crear clientes** - Di algo como "crear un nuevo cliente" o "registrar cliente Juan Pérez"\n\n✏️ **Editar clientes** - Por ejemplo "editar cliente María López" o "cambiar el teléfono del cliente 5"\n\n🗑️ **Eliminar clientes** - Como "eliminar cliente con ID 10" o "dar de baja cliente XYZ"\n\n¿Qué te gustaría hacer?`;
  }

  return "No entendí muy bien lo que necesitas. ¿Podrías reformular tu mensaje? Recuerda que puedo ayudarte a crear, editar o eliminar clientes.";
};

/**
 * Generar respuesta de éxito
 */
const generarRespuestaExito = (parsedData, resultado) => {
  const { accion } = parsedData;

  switch (accion) {
    case "CREAR":
      return `✅ ¡Cliente creado exitosamente!\n\n📋 **Detalles:**\n- ID: ${resultado.idcliente}\n- Nombre: ${resultado.nombre}`;

    case "EDITAR":
      return `✅ ¡Cliente actualizado exitosamente!`;

    case "ELIMINAR":
      return `✅ Cliente eliminado exitosamente.`;

    default:
      return "✅ Operación completada.";
  }
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
  const accionDirectaMatch = text.match(/^(?:quiero|necesito|voy a|puedes?)\s+(crear|editar|eliminar|agregar|modificar|borrar)\s+(?:un|el)?\s*cliente/i);

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

    if (nuevaAccion && nuevaAccion !== contexto.accion) {
      esNuevaAccion = true;
      console.log(`🔄 Cambio de acción detectado: ${contexto.accion} → ${nuevaAccion}`);
    }
  }

  if (cambioAccionMatch || nuevaAccionMatch || esNuevaAccion) {
    console.log("🔄 Usuario quiere cambiar de acción, reiniciando contexto...");

    conversacion.contexto = {};
    conversacion.esperandoRespuesta = false;

    const parsedData = await parseTextWithOllamaClienteConversational(text, conversacion.historial);

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

    conversacion.contexto = parsedData;
    conversacion.esperandoRespuesta = true;

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

    const resultado = await ejecutarAccionCliente(parsedData, idusuarios, idfuncionario);
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

  // Filtrar valores null/undefined/false antes de combinar
  const infoFiltrada = Object.fromEntries(
    Object.entries(infoAdicional).filter(([key, value]) => {
      if (key === 'confirmado' || key === 'cancelado') {
        return value === true;
      }
      return value !== null && value !== undefined;
    })
  );

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

    conversacion.contexto = {};
    conversacion.esperandoRespuesta = false;

    return res.status(200).json({
      mensaje: respuesta,
      esperandoRespuesta: false,
    });
  }

  // Si es EDITAR o ELIMINAR y no tenemos ID, intentar buscar el cliente primero
  if ((contexto.accion === "EDITAR" || contexto.accion === "ELIMINAR") && !contexto.idcliente) {
    let nombreBuscar = contexto.nombre;
    let numDocumentoBuscar = contexto.numDocumento;

    // Detectar si el usuario menciona un documento actual para buscar
    const docActualMatch = text.match(/(?:tengo|tiene|con|su)(?:\s+el)?\s+(?:documento|doc|ci)\s+(\d+)/i);
    if (docActualMatch) {
      numDocumentoBuscar = docActualMatch[1];
      console.log(`📍 Documento ACTUAL detectado para búsqueda: ${numDocumentoBuscar}`);
    }

    if (nombreBuscar || numDocumentoBuscar) {
      try {
        const cliente = await buscarClientePorNombreODocumento(nombreBuscar, numDocumentoBuscar, idusuarios, idfuncionario);

        if (cliente) {
          contexto.idcliente = cliente.idcliente;
          console.log(`✅ Cliente encontrado: ID ${cliente.idcliente} - ${cliente.nombre} ${cliente.apellido}`);

          contexto.clienteEncontrado = {
            nombre: `${cliente.nombre} ${cliente.apellido}`.trim(),
            numDocumento: cliente.numDocumento || 'No registrado',
            telefono: cliente.telefono || 'No registrado',
            direccion: cliente.direccion || 'No registrado',
          };

          contexto.nombre = null;
          contexto.numDocumento = null;
          console.log(`🧹 Campos de identificación limpiados`);
        } else {
          const respuesta = `No encontré un cliente con ese nombre o documento en tu lista. ¿Podrías verificar los datos o darme el ID del cliente?`;

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
        console.error("Error al buscar cliente:", error);
      }
    }
  }

  // Verificar nuevamente si está completo
  const necesitaMasInfo = verificarInformacionIncompleta(contexto);

  console.log("🔍 Verificación de información:", {
    incompleto: necesitaMasInfo.incompleto,
    camposFaltantes: necesitaMasInfo.camposFaltantes,
    idcliente: contexto.idcliente,
    confirmado: contexto.confirmado
  });

  if (necesitaMasInfo.incompleto) {
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
  const resultado = await ejecutarAccionCliente(contexto, idusuarios, idfuncionario);

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
 * Extraer información adicional del mensaje del usuario
 */
const extraerInformacionAdicional = async (text, contextoActual) => {
  const prompt = `Eres un asistente que extrae información sobre clientes de mensajes de usuarios.

Contexto actual de la conversación:
${JSON.stringify(contextoActual, null, 2)}

Nuevo mensaje del usuario: "${text}"

**REGLA CRÍTICA:**
${!contextoActual.idcliente
    ? '- El contexto NO tiene "idcliente" todavía, así que el usuario está IDENTIFICANDO al cliente.\n- Si menciona un nombre o documento, extráelo para BUSCAR al cliente.'
    : '- Ya se encontró el cliente (tiene idcliente).\n- SOLO extrae campos si el usuario dice claramente "cambiar/actualizar/editar CAMPO a VALOR".'}

**Confirmación:**
- Si dice "sí", "si", "yes", "confirmar", "confirmo", "adelante", "ok" → {"confirmado": true}
- Ejemplos:
  - "sí" → {"confirmado": true}
  - "si" → {"confirmado": true}
  - "confirmo" → {"confirmado": true}

**Cancelación:**
- Si dice "no", "cancelar", "olvídalo" → {"cancelado": true}

**IMPORTANTE:** Solo incluye propiedades cuando estés SEGURO del valor. Si no estás seguro, NO incluyas la propiedad en el JSON.

Responde ÚNICAMENTE con un objeto JSON (sin markdown, sin texto adicional):
{
  "nombre": "string" (nombre completo),
  "apellido": "string",
  "numDocumento": "string",
  "telefono": "string",
  "direccion": "string",
  "tipo": "persona" | "empresa",
  "genero": "masculino" | "femenino" | "otro",
  "estado": "activo" | "inactivo",
  "tipo_cliente": "minorista" | "mayorista",
  "idcliente": number,
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
    if (/^(sí|si|yes|confirmar|confirmo|adelante|ok|está bien)$/i.test(text.trim())) {
      info.confirmado = true;
      console.log("✅ Confirmación detectada por REGEX (prioridad)");
    }

    if (/^(no|cancel|cancelar|olvida|dejalo|déjalo)$/i.test(text.trim())) {
      info.cancelado = true;
      console.log("✅ Cancelación detectada por REGEX (prioridad)");
    }

    return info;
  } catch (error) {
    console.error("Error al extraer información adicional:", error.message);

    // Fallback: extraer con regex
    const info = {};

    // Nombre completo
    if (!contextoActual.idcliente) {
      const nombreMatch = text.match(/(?:se\s+llama|es\s+el\s+nombre|el\s+nombre\s+es|cliente)\s+([A-Za-záéíóúñÑ\s]{3,50})/i);
      if (nombreMatch) {
        info.nombre = nombreMatch[1].trim();
        console.log("✅ Nombre extraído:", info.nombre);
      } else {
        const soloNombreMatch = text.match(/^([A-Za-záéíóúñÑ\s]{3,50})$/);
        if (soloNombreMatch) {
          info.nombre = soloNombreMatch[1].trim();
          console.log("✅ Nombre extraído (texto simple):", info.nombre);
        }
      }
    } else {
      const nombreEditMatch = text.match(/(?:cambiar|actualizar|editar|modificar)\s+(?:el\s+)?nombre\s+a\s+([A-Za-záéíóúñÑ\s]+?)(?:\.|$)/i);
      if (nombreEditMatch) {
        info.nombre = nombreEditMatch[1].trim();
        console.log("✅ Nombre NUEVO extraído:", info.nombre);
      }
    }

    // Número de documento
    const docMatch = text.match(/(?:documento|doc|ci|ruc)(?:\s+a)?\s+(\d+)/i);
    if (docMatch) {
      info.numDocumento = docMatch[1];
      console.log("✅ Documento extraído:", info.numDocumento);
    }

    // Teléfono
    const telMatch = text.match(/(?:teléfono|telefono|tel|celular)(?:\s+a)?\s+(09\d{8}|\d{6,10})/i);
    if (telMatch) {
      info.telefono = telMatch[1];
      console.log("✅ Teléfono extraído:", info.telefono);
    }

    // Dirección
    const dirMatch = text.match(/(?:dirección|direccion)(?:\s+a)?\s+(.+?)(?:\.|$)/i);
    if (dirMatch) {
      info.direccion = dirMatch[1].trim();
      console.log("✅ Dirección extraída:", info.direccion);
    }

    // Confirmación
    if (/^(sí|si|yes|confirmar|confirmo|adelante|ok|está bien)$/i.test(text.trim())) {
      info.confirmado = true;
      console.log("✅ Confirmación detectada");
    }

    // Cancelación
    if (/^(no|cancel|cancelar|olvida|dejalo|déjalo)$/i.test(text.trim())) {
      info.cancelado = true;
      console.log("✅ Cancelación detectada");
    }

    console.log("📦 Info extraída (fallback):", info);
    return info;
  }
};

/**
 * Chat conversacional para clientes
 */
const chatCliente = async (req, res) => {
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

    console.log(`💬 Chat cliente (Usuario ${userIdFinal}): "${text}"`);

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

    conversacion.ultimaActividad = Date.now();

    conversacion.historial.push({
      rol: "usuario",
      texto: text,
      timestamp: new Date(),
    });

    // Si estamos esperando información adicional
    if (conversacion.esperandoRespuesta && conversacion.contexto.accion) {
      return await procesarRespuestaContextual(text, conversacion, idusuarios, idfuncionario, res);
    }

    // Parsear el mensaje inicial
    const parsedData = await parseTextWithOllamaClienteConversational(text, conversacion.historial);

    // Si no se detectó ninguna acción válida
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

    // Si es EDITAR o ELIMINAR y no tenemos ID pero tenemos nombre o documento, buscar el cliente
    if ((parsedData.accion === "EDITAR" || parsedData.accion === "ELIMINAR") && !parsedData.idcliente && (parsedData.nombre || parsedData.numDocumento)) {
      try {
        console.log(`🔍 Buscando cliente por nombre: "${parsedData.nombre}" o documento: "${parsedData.numDocumento}"`);
        const cliente = await buscarClientePorNombreODocumento(parsedData.nombre, parsedData.numDocumento, idusuarios, idfuncionario);

        if (cliente) {
          parsedData.idcliente = cliente.idcliente;
          console.log(`✅ Cliente encontrado: ID ${cliente.idcliente} - ${cliente.nombre} ${cliente.apellido}`);

          parsedData.clienteEncontrado = {
            nombre: `${cliente.nombre} ${cliente.apellido}`.trim(),
            numDocumento: cliente.numDocumento || 'No registrado',
            telefono: cliente.telefono || 'No registrado',
            direccion: cliente.direccion || 'No registrado',
          };

          parsedData.nombre = null;
          parsedData.numDocumento = null;
          console.log(`🧹 Campos de identificación limpiados`);
        } else {
          conversacion.contexto = parsedData;
          conversacion.esperandoRespuesta = true;

          const respuesta = `No encontré un cliente con ese nombre o documento en tu lista. ¿Podrías verificar los datos o darme el ID del cliente?`;

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
        console.error("Error al buscar cliente:", error);
      }
    }

    // Verificar si necesitamos más información
    const necesitaMasInfo = verificarInformacionIncompleta(parsedData);

    if (necesitaMasInfo.incompleto) {
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
    const resultado = await ejecutarAccionCliente(parsedData, idusuarios, idfuncionario);

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
    console.error("❌ Error en chatCliente:", error);
    return res.status(500).json({
      error: "Error al procesar el mensaje",
      detalles: error.message,
    });
  }
};

export { chatCliente };
