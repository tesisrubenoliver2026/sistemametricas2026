import db from "../../db.js";
import Funcionario from "../../models/Funcionario.js";
import { getUserId } from "../../utils/getUserId.js";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_VISION_MODEL =
  process.env.OLLAMA_VISION_MODEL || "llama3.2-vision";

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

const resolveUserScope = async (req) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  if (!idusuarios && !idfuncionario) {
    return { idusuarios: null, idfuncionariosIds: null };
  }

  if (tipo === "funcionario") {
    return { idusuarios: null, idfuncionariosIds: [idfuncionario] };
  }

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

const ollamaVision = async ({ model, prompt, images }) => {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      images,
      stream: false,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Ollama error (${response.status}): ${text || response.statusText}`);
  }

  return response.json();
};

const normalizeProductName = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const searchProductosByName = async (idusuarios, idfuncionariosIds, searchTerm) => {
  const pool = db.promise();
  const params = [];
  let userCondition = "";

  if (idusuarios && !idfuncionariosIds) {
    userCondition = "AND (p.idusuario = ?)";
    params.push(idusuarios);
  } else if (idfuncionariosIds && !idusuarios) {
    userCondition = "AND (p.idfuncionario IN (?))";
    params.push(idfuncionariosIds);
  } else if (idusuarios && idfuncionariosIds) {
    userCondition = "AND (p.idusuario = ? OR p.idfuncionario IN (?))";
    params.push(idusuarios, idfuncionariosIds);
  }

  const query = `
    SELECT
      p.idproducto,
      p.nombre_producto,
      p.cod_barra,
      p.precio_venta,
      p.stock,
      p.estado,
      p.unidad_medida,
      c.categoria AS nombre_categoria
    FROM productos p
    LEFT JOIN categorias c ON c.idcategorias = p.idcategoria
    WHERE p.deleted_at IS NULL
      AND p.estado = 'activo'
      ${userCondition}
    ORDER BY p.nombre_producto ASC
    LIMIT 500
  `;

  const [rows] = await pool.query(query, params);
  return rows;
};

const calculateSimilarity = (str1, str2) => {
  const s1 = normalizeProductName(str1);
  const s2 = normalizeProductName(str2);

  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  const words1 = s1.split(" ");
  const words2 = s2.split(" ");
  const commonWords = words1.filter((w) => words2.includes(w));

  if (commonWords.length > 0) {
    const avgLength = (s1.length + s2.length) / 2;
    const similarity = (commonWords.length * 2) / (words1.length + words2.length);
    return Math.min(similarity * (commonWords[0].length / avgLength) + 0.3, 0.9);
  }

  let matches = 0;
  const minLen = Math.min(s1.length, s2.length);
  for (let i = 0; i < minLen; i++) {
    if (s1[i] === s2[i]) matches++;
  }
  return matches / Math.max(s1.length, s2.length);
};

export const reconocerProducto = async (req, res) => {
  try {
    const { imageBase64 } = req.body || {};

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({
        success: false,
        error: "imageBase64 es requerido (base64 sin prefijo data:)"
      });
    }

    const userScope = await resolveUserScope(req);
    if (!userScope.idusuarios && (!userScope.idfuncionariosIds || userScope.idfuncionariosIds.length === 0)) {
      return res.status(401).json({ success: false, error: "Usuario no autenticado" });
    }

    const prompt = `Eres un asistente de reconocimiento de productos. Analiza la imagen y responde ÚNICAMENTE con el nombre del producto visible en la imagen.

Reglas:
- Responde SOLO con el nombre del producto en español
- Ejemplo de respuesta válida: "Martillo"
- NO agregues explicaciones, descripciones ni puntuación
- Si no puedes identificar el producto, responde exactamente: "PRODUCTO_DESCONOCIDO"
- Sé específico y breve (máximo 3 palabras)`;

    const ollama = await ollamaVision({
      model: OLLAMA_VISION_MODEL,
      prompt,
      images: [imageBase64],
    });

    const nombreReconocido = (ollama?.response || "").trim();

    if (!nombreReconocido || nombreReconocido === "PRODUCTO_DESCONOCIDO") {
      return res.json({
        success: true,
        productoReconocido: null,
        mensaje: "No se pudo identificar el producto en la imagen",
        productos: [],
      });
    }

    const productosDB = await searchProductosByName(
      userScope.idusuarios,
      userScope.idfuncionariosIds,
      ""
    );

    const normalizedBusqueda = normalizeProductName(nombreReconocido);
    const productosCoincidentes = productosDB
      .map((producto) => {
        const normalizedProducto = normalizeProductName(producto.nombre_producto);
        const similitud = calculateSimilarity(normalizedBusqueda, normalizedProducto);
        return {
          ...producto,
          similitud,
        };
      })
      .filter((p) => p.similitud >= 0.3)
      .sort((a, b) => b.similitud - a.similitud)
      .slice(0, 10);

    res.json({
      success: true,
      productoReconocido: nombreReconocido,
      productos: productosCoincidentes.map((p) => ({
        idproducto: p.idproducto,
        nombre_producto: p.nombre_producto,
        cod_barra: p.cod_barra,
        precio_venta: p.precio_venta,
        stock: p.stock,
        estado: p.estado,
        unidad_medida: p.unidad_medida,
        nombre_categoria: p.nombre_categoria,
        similitud: Math.round(p.similitud * 100),
      })),
    });
  } catch (error) {
    console.error("❌ Error en reconocerProducto:", error);
    res.status(500).json({
      success: false,
      error: "Error al reconocer producto",
      details: error.message,
    });
  }
};
