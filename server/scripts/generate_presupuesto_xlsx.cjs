const fs = require("node:fs");
const path = require("node:path");

const ExcelJS = require("exceljs");

const outputPath = path.join(__dirname, "..", "report", "presupuesto_proyecto.xlsx");

const rows = [
  [
    "Categoria",
    "Recurso",
    "Cantidad",
    "Tiempo",
    "Costo_Unitario_Gs",
    "Total_Gs",
    "Observacion",
  ],
  [
    "Recursos Humanos",
    "Desarrollador Full-Stack (Node.js/Express + React/Vite TSX)",
    1,
    "520 hs",
    35000,
    18200000,
    "Backend + frontend web",
  ],
  [
    "Recursos Humanos",
    "DBA / Modelado MySQL",
    1,
    "120 hs",
    40000,
    4800000,
    "Diseño, índices, consultas, respaldo",
  ],
  [
    "Recursos Humanos",
    "Implementación IA (Ollama + métricas)",
    1,
    "140 hs",
    45000,
    6300000,
    "Prompts, endpoints, validación",
  ],
  [
    "Recursos Humanos",
    "QA / Pruebas funcionales",
    1,
    "80 hs",
    30000,
    2400000,
    "Casos de prueba, verificación",
  ],
  [
    "Recursos Tecnológicos",
    "Notebook Acer Nitro 5 (i7-8750H, 24GB RAM, GTX 1050 4GB)",
    1,
    "-",
    0,
    0,
    "Equipo propio (sin costo imputado)",
  ],
  [
    "Recursos Tecnológicos",
    "Smartphone Android para pruebas (Expo)",
    1,
    "-",
    2000000,
    2000000,
    "Dispositivo de pruebas",
  ],
  [
    "Recursos Tecnológicos",
    "Hosting frontend (Netlify)",
    1,
    "12 meses",
    0,
    0,
    "Plan gratuito (si aplica)",
  ],
  [
    "Recursos Tecnológicos",
    "Dominio y DNS (Cloudflare)",
    1,
    "12 meses",
    0,
    0,
    "Cloudflare Tunnel/DNS (si aplica)",
  ],
  [
    "Recursos Tecnológicos",
    "Servidor/VPS para backend + MySQL",
    1,
    "12 meses",
    250000,
    3000000,
    "Estimación mensual",
  ],
  [
    "Recursos Tecnológicos",
    "Almacenamiento/Backups (snapshots)",
    1,
    "12 meses",
    80000,
    960000,
    "Estimación mensual",
  ],
  [
    "Recursos Tecnológicos",
    "Impresora térmica (tickets)",
    1,
    "-",
    450000,
    450000,
    "Opcional según operación",
  ],
  [
    "Recursos Tecnológicos",
    "Licencias/Herramientas (IDE, utilidades)",
    1,
    "12 meses",
    0,
    0,
    "Software libre/gratuito (si aplica)",
  ],
  [
    "Recursos Tecnológicos",
    "Infraestructura IA local (Ollama)",
    1,
    "-",
    0,
    0,
    "Ejecución en equipo local (sin costo imputado)",
  ],
];

function gsNumberFormat() {
  // ExcelJS uses Excel-like formats; keep as integer with thousands separators.
  return '#,##0" Gs."';
}

async function main() {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Codex CLI";
  workbook.created = new Date();

  const ws = workbook.addWorksheet("Presupuesto", {
    views: [{ state: "frozen", ySplit: 3 }],
    properties: { defaultRowHeight: 18 },
  });

  // Title
  ws.mergeCells("A1:G1");
  ws.getCell("A1").value = "Presupuesto del Proyecto";
  ws.getCell("A1").font = { bold: true, size: 14 };
  ws.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 24;

  // Spacer row 2
  ws.getRow(2).height = 6;

  // Header row 3
  const header = rows[0];
  ws.addRow(header);
  const headerRow = ws.getRow(3);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E79" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FF9E9E9E" } },
      left: { style: "thin", color: { argb: "FF9E9E9E" } },
      bottom: { style: "thin", color: { argb: "FF9E9E9E" } },
      right: { style: "thin", color: { argb: "FF9E9E9E" } },
    };
  });

  // Data rows start at row 4
  for (const dataRow of rows.slice(1)) {
    ws.addRow(dataRow);
  }

  const firstDataRow = 4;
  const lastDataRow = ws.rowCount;

  for (let r = firstDataRow; r <= lastDataRow; r += 1) {
    const row = ws.getRow(r);
    row.height = 36;
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FF9E9E9E" } },
        left: { style: "thin", color: { argb: "FF9E9E9E" } },
        bottom: { style: "thin", color: { argb: "FF9E9E9E" } },
        right: { style: "thin", color: { argb: "FF9E9E9E" } },
      };

      if (colNumber === 3) {
        cell.alignment = { horizontal: "center", vertical: "top" };
      } else if (colNumber === 5 || colNumber === 6) {
        cell.alignment = { horizontal: "right", vertical: "top" };
        cell.numFmt = gsNumberFormat();
      } else {
        const wrap = colNumber === 2 || colNumber === 7 || colNumber === 1;
        cell.alignment = {
          horizontal: "left",
          vertical: "top",
          wrapText: wrap,
        };
      }
    });
  }

  // Total row (blank row + total)
  ws.addRow([]);
  const totalRowIndex = ws.rowCount + 1;
  ws.addRow(["TOTAL", "", "", "", "", null, ""]);
  ws.mergeCells(`A${totalRowIndex}:E${totalRowIndex}`);
  const labelCell = ws.getCell(`A${totalRowIndex}`);
  labelCell.font = { bold: true };
  labelCell.alignment = { horizontal: "left", vertical: "middle" };

  const sumCell = ws.getCell(`F${totalRowIndex}`);
  sumCell.value = { formula: `SUM(F${firstDataRow}:F${lastDataRow})` };
  sumCell.font = { bold: true };
  sumCell.alignment = { horizontal: "right", vertical: "middle" };
  sumCell.numFmt = gsNumberFormat();

  for (let c = 1; c <= 7; c += 1) {
    const cell = ws.getCell(totalRowIndex, c);
    cell.border = {
      top: { style: "thin", color: { argb: "FF9E9E9E" } },
      left: { style: "thin", color: { argb: "FF9E9E9E" } },
      bottom: { style: "thin", color: { argb: "FF9E9E9E" } },
      right: { style: "thin", color: { argb: "FF9E9E9E" } },
    };
  }

  // Column widths
  ws.getColumn(1).width = 26; // Categoria
  ws.getColumn(2).width = 52; // Recurso
  ws.getColumn(3).width = 10; // Cantidad
  ws.getColumn(4).width = 12; // Tiempo
  ws.getColumn(5).width = 18; // Costo unit.
  ws.getColumn(6).width = 16; // Total
  ws.getColumn(7).width = 34; // Observacion

  await workbook.xlsx.writeFile(outputPath);
  // eslint-disable-next-line no-console
  console.log(outputPath);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
