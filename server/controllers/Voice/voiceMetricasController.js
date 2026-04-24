import db from "../../db.js";
import Funcionario from "../../models/Funcionario.js";
import { getUserId } from "../../utils/getUserId.js";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL_METRICS =
  process.env.OLLAMA_MODEL_METRICS || process.env.OLLAMA_MODEL || "qwen2.5:3b";
const OLLAMA_VISION_MODEL =
  process.env.OLLAMA_VISION_MODEL || "llava:7b";

const isValidDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const toISODate = (date) => date.toISOString().slice(0, 10);

const getDefaultRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 6); // últimos 7 días (incluye hoy)
  return { from: toISODate(from), to: toISODate(to) };
};

const safeNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizeIdList = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) return value.map((item) => Number(item)).filter(Number.isFinite);
  if (typeof value === "number") return [value].filter(Number.isFinite);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((part) => Number(part.trim()))
      .filter(Number.isFinite);
  }
  return null;
};

const buildUserCondition = ({ idusuarios, idfuncionariosIds, usuarioAlias = "" }) => {
  const params = [];
  const ids = normalizeIdList(idfuncionariosIds);

  if (idusuarios && (!ids || ids.length === 0)) {
    return { sql: `AND ${usuarioAlias}idusuarios = ?`, params: [idusuarios] };
  }

  if ((!idusuarios || idusuarios === null) && ids && ids.length > 0) {
    return { sql: `AND ${usuarioAlias}idfuncionario IN (?)`, params: [ids] };
  }

  if (idusuarios && ids && ids.length > 0) {
    return { sql: `AND (${usuarioAlias}idusuarios = ? OR ${usuarioAlias}idfuncionario IN (?))`, params: [idusuarios, ids] };
  }

  return { sql: "", params };
};

const buildProductoUserCondition = ({ idusuarios, idfuncionariosIds }) => {
  const params = [];
  const ids = normalizeIdList(idfuncionariosIds);

  if (idusuarios && (!ids || ids.length === 0)) {
    return { sql: "AND p.idusuario = ?", params: [idusuarios] };
  }
  if ((!idusuarios || idusuarios === null) && ids && ids.length > 0) {
    return { sql: "AND p.idfuncionario IN (?)", params: [ids] };
  }
  if (idusuarios && ids && ids.length > 0) {
    return { sql: "AND (p.idusuario = ? OR p.idfuncionario IN (?))", params: [idusuarios, ids] };
  }
  return { sql: "", params };
};

const resolveUserScope = async (req) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  if (!idusuarios && !idfuncionario) {
    return { idusuarios: null, idfuncionariosIds: null };
  }

  if (tipo === "funcionario") {
    return { idusuarios: null, idfuncionariosIds: [idfuncionario] };
  }

  // Administrador: incluye sus datos + los de sus funcionarios relacionados
  const funcionarios = await new Promise((resolve, reject) => {
    Funcionario.findByUsuario(idusuarios, (err, data) => {
      if (err) return reject(err);
      resolve(data || []);
    });
  });

  const funcionariosIds = (funcionarios || [])
    .map((f) => Number(f.idfuncionario))
    .filter(Number.isFinite);

  return { idusuarios, idfuncionariosIds: funcionariosIds.length > 0 ? funcionariosIds : null };
};

const buildMetricsSnapshot = async ({ from, to, topLimit = 5, userScope }) => {
  const pool = db.promise();
  const { idusuarios, idfuncionariosIds } = userScope || {};

  const ventasUser = buildUserCondition({ idusuarios, idfuncionariosIds });
  const [ventasRows] = await pool.query(
    `
      SELECT 
        COUNT(*) AS cantidad,
        COALESCE(SUM(total), 0) AS total
      FROM ventas
      WHERE deleted_at IS NULL
        ${ventasUser.sql}
        AND fecha BETWEEN ? AND ?
    `,
    [...ventasUser.params, from, to],
  );

  const ventasDetalleUser = buildUserCondition({ idusuarios, idfuncionariosIds, usuarioAlias: "v." });
  const [ventasDetalleRows] = await pool.query(
    `
      SELECT
        COALESCE(SUM(dv.cantidad), 0) AS unidades_vendidas,
        COALESCE(SUM(COALESCE(dv.cant_cajas_vender, 0)), 0) AS cajas_vendidas,
        COALESCE(SUM(COALESCE(dv.cant_unidades_sueltas, 0)), 0) AS unidades_sueltas
      FROM detalle_venta dv
      INNER JOIN ventas v ON v.idventa = dv.idventa
      WHERE dv.deleted_at IS NULL
        AND v.deleted_at IS NULL
        ${ventasDetalleUser.sql}
        AND v.fecha BETWEEN ? AND ?
    `,
    [...ventasDetalleUser.params, from, to],
  );

  const comprasUser = buildUserCondition({ idusuarios, idfuncionariosIds });
  const [comprasRows] = await pool.query(
    `
      SELECT 
        COUNT(*) AS cantidad,
        COALESCE(SUM(total), 0) AS total
      FROM compras
      WHERE deleted_at IS NULL
        ${comprasUser.sql}
        AND fecha BETWEEN ? AND ?
    `,
    [...comprasUser.params, from, to],
  );

  const comprasDetalleUser = buildUserCondition({ idusuarios, idfuncionariosIds, usuarioAlias: "c." });
  const [comprasDetalleRows] = await pool.query(
    `
      SELECT
        COALESCE(SUM(
          CASE
            WHEN dc.unidad_medida = 'CAJA' AND dc.cant_p_caja IS NOT NULL AND dc.cant_p_caja > 0
              THEN dc.cantidad * dc.cant_p_caja
            ELSE dc.cantidad
          END
        ), 0) AS unidades_compradas,
        COALESCE(SUM(CASE WHEN dc.unidad_medida = 'CAJA' THEN dc.cantidad ELSE 0 END), 0) AS cajas_compradas,
        COALESCE(SUM(CASE WHEN dc.unidad_medida <> 'CAJA' OR dc.unidad_medida IS NULL THEN dc.cantidad ELSE 0 END), 0) AS unidades_sueltas
      FROM detalle_compra dc
      INNER JOIN compras c ON c.idcompra = dc.idcompra
      WHERE dc.deleted_at IS NULL
        AND c.deleted_at IS NULL
        ${comprasDetalleUser.sql}
        AND c.fecha BETWEEN ? AND ?
    `,
    [...comprasDetalleUser.params, from, to],
  );

  const topUser = buildUserCondition({ idusuarios, idfuncionariosIds, usuarioAlias: "v." });
  const [topProductosRows] = await pool.query(
    `
      SELECT 
        dv.idproducto,
        dv.nombre_producto,
        SUM(dv.cantidad) AS total_vendido,
        COALESCE(SUM(dv.sub_total), 0) AS total_ingresos
      FROM detalle_venta dv
      INNER JOIN ventas v ON v.idventa = dv.idventa
      WHERE dv.deleted_at IS NULL
        AND v.deleted_at IS NULL
        ${topUser.sql}
        AND v.fecha BETWEEN ? AND ?
      GROUP BY dv.idproducto, dv.nombre_producto
      ORDER BY total_vendido DESC
      LIMIT ?
    `,
    [...topUser.params, from, to, topLimit],
  );

  const productoUser = buildProductoUserCondition({ idusuarios, idfuncionariosIds });
  const [inventarioValorRows] = await pool.query(
    `
      SELECT 
        COALESCE(SUM(lp.stock_actual * lp.precio_compra), 0) AS valor_inventario
      FROM lotes_producto lp
      INNER JOIN productos p ON p.idproducto = lp.idproducto
      WHERE lp.deleted_at IS NULL
        AND p.deleted_at IS NULL
        ${productoUser.sql}
        AND lp.stock_actual > 0
    `,
    [...productoUser.params],
  );

  const [productosRows] = await pool.query(
    `
      SELECT COUNT(*) AS total_productos
      FROM productos p
      WHERE p.deleted_at IS NULL
        ${productoUser.sql}
    `,
    [...productoUser.params],
  );

  const [sinStockRows] = await pool.query(
    `
      SELECT COUNT(*) AS productos_sin_stock
      FROM productos p
      LEFT JOIN (
        SELECT idproducto, COALESCE(SUM(stock_actual), 0) AS stock_total
        FROM lotes_producto
        WHERE deleted_at IS NULL
        GROUP BY idproducto
      ) s ON s.idproducto = p.idproducto
      WHERE p.deleted_at IS NULL
        ${productoUser.sql}
        AND COALESCE(s.stock_total, 0) = 0
    `,
    [...productoUser.params],
  );

  const [lotesPorVencerRows] = await pool.query(
    `
      SELECT 
        lp.idlote,
        lp.idproducto,
        p.nombre_producto,
        lp.numero_lote,
        lp.fecha_vencimiento,
        lp.stock_actual
      FROM lotes_producto lp
      INNER JOIN productos p ON p.idproducto = lp.idproducto
      WHERE lp.deleted_at IS NULL
        AND p.deleted_at IS NULL
        ${productoUser.sql}
        AND lp.stock_actual > 0
        AND lp.fecha_vencimiento IS NOT NULL
        AND lp.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY lp.fecha_vencimiento ASC
      LIMIT 10
    `,
    [...productoUser.params],
  );

  return {
    periodo: { from, to },
    ventas: {
      cantidad: safeNumber(ventasRows?.[0]?.cantidad),
      total: safeNumber(ventasRows?.[0]?.total),
      unidades_vendidas: safeNumber(ventasDetalleRows?.[0]?.unidades_vendidas),
      cajas_vendidas: safeNumber(ventasDetalleRows?.[0]?.cajas_vendidas),
      unidades_sueltas: safeNumber(ventasDetalleRows?.[0]?.unidades_sueltas),
    },
    compras: {
      cantidad: safeNumber(comprasRows?.[0]?.cantidad),
      total: safeNumber(comprasRows?.[0]?.total),
      unidades_compradas: safeNumber(comprasDetalleRows?.[0]?.unidades_compradas),
      cajas_compradas: safeNumber(comprasDetalleRows?.[0]?.cajas_compradas),
      unidades_sueltas: safeNumber(comprasDetalleRows?.[0]?.unidades_sueltas),
    },
    topProductos: (topProductosRows || []).map((row) => ({
      idproducto: safeNumber(row.idproducto),
      nombre_producto: row.nombre_producto,
      total_vendido: safeNumber(row.total_vendido),
      total_ingresos: safeNumber(row.total_ingresos),
    })),
    inventario: {
      valor_inventario: safeNumber(inventarioValorRows?.[0]?.valor_inventario),
      total_productos: safeNumber(productosRows?.[0]?.total_productos),
      productos_sin_stock: safeNumber(sinStockRows?.[0]?.productos_sin_stock),
      lotes_por_vencer_30d: (lotesPorVencerRows || []).map((row) => ({
        idlote: safeNumber(row.idlote),
        idproducto: safeNumber(row.idproducto),
        nombre_producto: row.nombre_producto,
        numero_lote: row.numero_lote,
        fecha_vencimiento: row.fecha_vencimiento,
        stock_actual: safeNumber(row.stock_actual),
      })),
    },
  };
};

const buildOllamaPrompt = ({ userText, snapshot }) => {
  const snapshotCompact = {
    periodo: snapshot.periodo,
    ventas: snapshot.ventas,
    compras: snapshot.compras,
    topProductos: snapshot.topProductos,
    inventario: {
      valor_inventario: snapshot.inventario.valor_inventario,
      total_productos: snapshot.inventario.total_productos,
      productos_sin_stock: snapshot.inventario.productos_sin_stock,
      lotes_por_vencer_30d: snapshot.inventario.lotes_por_vencer_30d,
    },
  };

  return [
    "Sos un asistente para un minimarket. Tu tarea es explicar métricas y sugerir acciones.",
    "Responde en español, en formato breve y claro.",
    "Moneda: Guaraníes (Gs). No uses '$'.",
    "",
    "Reglas:",
    "- No inventes datos: usa solo el contexto proporcionado.",
    "- El contexto ya incluye totales y cantidades (ventas/compras por unidades y cajas). No pidas 'más información' a menos que el usuario solicite un detalle no presente en el JSON.",
    "- Da 3 a 5 recomendaciones accionables al final.",
    "",
    "Consulta del usuario:",
    userText,
    "",
    "Contexto de métricas (JSON):",
    JSON.stringify(snapshotCompact),
  ].join("\n");
};

const ollamaGenerate = async ({ model, prompt, images }) => {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      temperature: 0.2,
      ...(images ? { images } : {}),
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Ollama error (${response.status}): ${text || response.statusText}`);
  }

  return response.json();
};

export const getMetricsSnapshot = async (req, res) => {
  try {
    const userScope = await resolveUserScope(req);
    if (!userScope.idusuarios && (!userScope.idfuncionariosIds || userScope.idfuncionariosIds.length === 0)) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const fallback = getDefaultRange();
    const from = isValidDate(req.query.from) ? req.query.from : fallback.from;
    const to = isValidDate(req.query.to) ? req.query.to : fallback.to;
    const topLimit = req.query.top ? Math.min(20, Math.max(1, Number(req.query.top))) : 5;

    const snapshot = await buildMetricsSnapshot({ from, to, topLimit, userScope });
    res.json(snapshot);
  } catch (error) {
    console.error("❌ Error en getMetricsSnapshot:", error);
    res.status(500).json({ error: "Error al generar métricas", details: error.message });
  }
};

export const chatMetricas = async (req, res) => {
  try {
    const { text, from, to } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "El texto del mensaje es requerido" });
    }

    const userScope = await resolveUserScope(req);
    if (!userScope.idusuarios && (!userScope.idfuncionariosIds || userScope.idfuncionariosIds.length === 0)) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const fallback = getDefaultRange();
    const fromFinal = isValidDate(from) ? from : fallback.from;
    const toFinal = isValidDate(to) ? to : fallback.to;

    const snapshot = await buildMetricsSnapshot({ from: fromFinal, to: toFinal, topLimit: 5, userScope });
    const prompt = buildOllamaPrompt({ userText: text, snapshot });

    const ollama = await ollamaGenerate({ model: OLLAMA_MODEL_METRICS, prompt });
    const mensaje = (ollama?.response || "").trim() || "No pude generar una respuesta. Intentá de nuevo.";

    res.json({ mensaje, snapshot });
  } catch (error) {
    console.error("❌ Error en chatMetricas:", error);
    res.status(500).json({ error: "Error al procesar chat de métricas", details: error.message });
  }
};

// Endpoint básico para multimodal (imagen -> análisis)
export const analizarImagen = async (req, res) => {
  try {
    const { prompt, imageBase64 } = req.body || {};

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({ error: "imageBase64 es requerido (base64 sin prefijo data:)" });
    }

    const promptFinal =
      typeof prompt === "string" && prompt.trim().length > 0
        ? prompt.trim()
        : "Describe la imagen y extrae información útil para inventario/operaciones (si aplica).";

    const ollama = await ollamaGenerate({
      model: OLLAMA_VISION_MODEL,
      prompt: promptFinal,
      images: [imageBase64],
    });

    const mensaje = (ollama?.response || "").trim() || "No pude analizar la imagen.";
    res.json({ mensaje });
  } catch (error) {
    console.error("❌ Error en analizarImagen:", error);
    res.status(500).json({ error: "Error al analizar imagen", details: error.message });
  }
};
