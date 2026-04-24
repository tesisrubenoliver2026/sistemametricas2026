import jsreport from 'jsreport';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Chrome - usa el Chromium de puppeteer, con fallback al sistema
const getChromePath = () => {
  const possiblePaths = [
    // Primero intentar con el Chromium de puppeteer (más compatible)
    path.join(process.env.USERPROFILE || '', '.cache', 'puppeteer', 'chrome', 'win64-136.0.7103.49', 'chrome-win64', 'chrome.exe'),
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_PATH,
  ].filter(Boolean);

  for (const chromePath of possiblePaths) {
    try {
      if (fs.existsSync(chromePath)) {
        console.log(`✅ Chrome encontrado en: ${chromePath}`);
        return chromePath;
      }
    } catch {
      // Continuar buscando
    }
  }

  console.log('⚠️ Chrome no encontrado, usando puppeteer por defecto');
  return null;
};

// Instancia única de jsreport
let jsreportInstance = null;
let initPromise = null;

/**
 * Obtiene la instancia única de jsreport (singleton pattern)
 * @returns {Promise<jsreport>} Instancia inicializada de jsreport
 */
export const getJsReportInstance = async () => {
  if (jsreportInstance) {
    return jsreportInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    console.log('📄 Inicializando instancia única de jsreport...');

    const chromePath = getChromePath();

    const chromeConfig = {
      launchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      }
    };

    // Si encontramos Chrome del sistema, usarlo
    if (chromePath) {
      chromeConfig.launchOptions.executablePath = chromePath;
    }

    jsreportInstance = jsreport({
      extensions: {
        express: { enabled: false },
        'chrome-pdf': chromeConfig
      },
      allowLocalFilesAccess: true,
      tempDirectory: path.join(__dirname, '../temp'),
    });

    await jsreportInstance.init();
    console.log('✅ jsreport inicializado correctamente');

    return jsreportInstance;
  })();

  return initPromise;
};

/**
 * Helper para formateo de números en Paraguay
 */
export const formatHelper = `
function formatPY (value) {
  var n = Number(value);
  return isNaN(n) ? value : n.toLocaleString('es-PY');
}
`;

/**
 * Función genérica para renderizar PDFs
 * @param {string} templateHtml - Template HTML
 * @param {object} data - Datos para el template
 * @param {object} options - Opciones adicionales de chrome
 * @returns {Promise<string>} PDF en base64
 */
export const renderPDF = async (templateHtml, data, options = {}) => {
  const instance = await getJsReportInstance();

  const chromeOptions = {
    printBackground: true,
    marginTop: '0cm',
    marginBottom: '0cm',
    ...options,
  };

  const result = await instance.render({
    template: {
      content: templateHtml,
      engine: 'handlebars',
      recipe: 'chrome-pdf',
      helpers: formatHelper,
      chrome: chromeOptions,
    },
    data,
  });

  return result.content.toString('base64');
};

export default getJsReportInstance;
