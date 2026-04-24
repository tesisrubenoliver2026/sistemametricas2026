export const libroDiarioTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Libro Diario</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', sans-serif;
      font-size: 9px;
      color: #333;
      line-height: 1.3;
    }

    .header {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #2c3e50;
    }

    .header h1 {
      font-size: 18px;
      color: #2c3e50;
      margin-bottom: 5px;
      font-weight: bold;
    }

    .header h2 {
      font-size: 14px;
      color: #34495e;
      margin-bottom: 8px;
    }

    .empresa-info {
      font-size: 9px;
      color: #555;
      margin-bottom: 3px;
    }

    .periodo {
      background: #ecf0f1;
      padding: 8px;
      margin-bottom: 15px;
      border-radius: 4px;
      text-align: center;
      font-weight: bold;
      font-size: 10px;
    }

    .asiento {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }

    .asiento-header {
      background: #3498db;
      color: white;
      padding: 6px 10px;
      margin-bottom: 5px;
      border-radius: 3px;
      font-weight: bold;
      font-size: 9px;
    }

    .asiento-glosa {
      font-style: italic;
      margin-left: 10px;
      font-size: 8px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }

    th {
      background: #34495e;
      color: white;
      padding: 6px 8px;
      text-align: left;
      font-size: 8px;
      font-weight: bold;
      border: 1px solid #2c3e50;
    }

    td {
      padding: 5px 8px;
      border: 1px solid #ddd;
      font-size: 8px;
    }

    .detalle-table {
      background: white;
    }

    .detalle-table tr:nth-child(even) {
      background: #f8f9fa;
    }

    .detalle-table tr:hover {
      background: #e8f4f8;
    }

    .col-codigo {
      width: 10%;
    }

    .col-cuenta {
      width: 25%;
    }

    .col-descripcion {
      width: 35%;
    }

    .col-debe {
      width: 15%;
      text-align: right;
    }

    .col-haber {
      width: 15%;
      text-align: right;
    }

    .debe-cell {
      font-weight: bold;
      color: #27ae60;
    }

    .haber-cell {
      font-weight: bold;
      color: #e74c3c;
    }

    .totales-asiento {
      background: #ecf0f1;
      font-weight: bold;
      border-top: 2px solid #34495e;
    }

    .totales-generales {
      margin-top: 20px;
      padding: 12px;
      background: #2c3e50;
      color: white;
      border-radius: 5px;
      page-break-inside: avoid;
    }

    .totales-generales h3 {
      font-size: 12px;
      margin-bottom: 10px;
      text-align: center;
      border-bottom: 1px solid white;
      padding-bottom: 5px;
    }

    .totales-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 10px;
    }

    .total-item {
      background: rgba(255, 255, 255, 0.1);
      padding: 8px;
      border-radius: 3px;
      text-align: center;
    }

    .total-label {
      font-size: 8px;
      color: #ecf0f1;
      margin-bottom: 3px;
    }

    .total-value {
      font-size: 11px;
      font-weight: bold;
      color: #fff;
    }

    .firma {
      margin-top: 40px;
      text-align: center;
      page-break-inside: avoid;
    }

    .firma-linea {
      border-top: 1px solid #333;
      width: 250px;
      margin: 0 auto 5px;
      margin-top: 60px;
    }

    .firma-texto {
      font-size: 9px;
      color: #555;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #7f8c8d;
      font-style: italic;
      font-size: 11px;
    }

    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <!-- ENCABEZADO -->
  <div class="header">
    <h1>LIBRO DIARIO</h1>
    <h2>{{empresa.nombre}}</h2>
    <div class="empresa-info">RUC: {{empresa.ruc}}</div>
    <div class="empresa-info">{{empresa.direccion}}</div>
    <div class="empresa-info">Tel: {{empresa.telefono}}</div>
  </div>

  <!-- PERÍODO -->
  <div class="periodo">
    PERÍODO: Del {{periodo.fecha_inicio}} al {{periodo.fecha_fin}}
  </div>

  <!-- ASIENTOS CONTABLES -->
  {{#if asientos.length}}
    {{#each asientos}}
    <div class="asiento">
      <!-- Cabecera del Asiento -->
      <div class="asiento-header">
        ASIENTO Nº {{numero_asiento}} - {{fecha}} - {{tipo_asiento}}
        <span class="asiento-glosa">{{glosa}}</span>
      </div>

      <!-- Detalle del Asiento -->
      <table class="detalle-table">
        <thead>
          <tr>
            <th class="col-codigo">Código</th>
            <th class="col-cuenta">Cuenta</th>
            <th class="col-descripcion">Descripción</th>
            <th class="col-debe">Debe (Gs.)</th>
            <th class="col-haber">Haber (Gs.)</th>
          </tr>
        </thead>
        <tbody>
          {{#each detalles}}
          <tr>
            <td class="col-codigo">{{codigo_cuenta}}</td>
            <td class="col-cuenta">{{nombre_cuenta}}</td>
            <td class="col-descripcion">{{descripcion}}</td>
            <td class="col-debe debe-cell">{{debe}}</td>
            <td class="col-haber haber-cell">{{haber}}</td>
          </tr>
          {{/each}}

          <!-- Totales del Asiento -->
          <tr class="totales-asiento">
            <td colspan="3" style="text-align: right; padding-right: 10px;">
              <strong>TOTALES DEL ASIENTO:</strong>
            </td>
            <td class="col-debe debe-cell">{{total_debe}}</td>
            <td class="col-haber haber-cell">{{total_haber}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    {{/each}}
  {{else}}
    <div class="no-data">
      No hay asientos contables para el período seleccionado
    </div>
  {{/if}}

  <!-- TOTALES GENERALES -->
  {{#if asientos.length}}
  <div class="totales-generales">
    <h3>RESUMEN GENERAL DEL LIBRO DIARIO</h3>
    <div class="totales-grid">
      <div class="total-item">
        <div class="total-label">Total Asientos</div>
        <div class="total-value">{{resumen.total_asientos}}</div>
      </div>
      <div class="total-item">
        <div class="total-label">Total Movimientos</div>
        <div class="total-value">{{resumen.total_movimientos}}</div>
      </div>
      <div class="total-item">
        <div class="total-label">Total DEBE</div>
        <div class="total-value">Gs. {{totales.debe}}</div>
      </div>
      <div class="total-item">
        <div class="total-label">Total HABER</div>
        <div class="total-value">Gs. {{totales.haber}}</div>
      </div>
    </div>
  </div>
  {{/if}}

  <!-- FIRMAS -->
  <div class="firma">
    <div class="firma-linea"></div>
    <div class="firma-texto">Firma Autorizada</div>
  </div>
</body>
</html>
`;
