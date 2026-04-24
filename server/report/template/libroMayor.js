export const libroMayorTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Libro Mayor</title>
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
      padding: 10px;
    }

    .header {
      text-align: center;
      margin-bottom: 10px;
      border-bottom: 2px solid #2c3e50;
      padding-bottom: 8px;
    }

    .header h1 {
      font-size: 16px;
      color: #2c3e50;
      margin-bottom: 4px;
      font-weight: bold;
    }

    .header h2 {
      font-size: 12px;
      color: #34495e;
      margin-bottom: 5px;
    }

    .empresa-info {
      font-size: 8px;
      color: #555;
      margin-bottom: 2px;
    }

    .periodo {
      background-color: #ecf0f1;
      padding: 6px;
      border-radius: 5px;
      text-align: center;
      margin-bottom: 10px;
      font-size: 9px;
      font-weight: bold;
      color: #2c3e50;
    }

    .cuenta-container {
      margin-bottom: 15px;
    }

    .cuenta-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 10px;
      border-radius: 5px 5px 0 0;
      font-weight: bold;
      font-size: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cuenta-codigo {
      font-size: 11px;
      font-weight: bold;
    }

    .cuenta-naturaleza {
      background-color: rgba(255, 255, 255, 0.2);
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 8px;
    }

    .movimientos-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
      border: 1px solid #bdc3c7;
    }

    .movimientos-table thead {
      background-color: #34495e;
      color: white;
    }

    .movimientos-table th {
      padding: 6px;
      text-align: left;
      font-size: 8px;
      font-weight: bold;
      border: 1px solid #95a5a6;
    }

    .movimientos-table td {
      padding: 5px 6px;
      border: 1px solid #ddd;
      font-size: 8px;
    }

    .movimientos-table tbody tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .movimientos-table tbody tr:hover {
      background-color: #ecf0f1;
    }

    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    .debe-cell {
      color: #27ae60;
      font-weight: bold;
    }

    .haber-cell {
      color: #c0392b;
      font-weight: bold;
    }

    .saldo-deudor {
      color: #27ae60;
      font-weight: bold;
    }

    .saldo-acreedor {
      color: #c0392b;
      font-weight: bold;
    }

    .totales-row {
      background-color: #34495e !important;
      color: white;
      font-weight: bold;
      font-size: 9px;
    }

    .totales-row td {
      padding: 7px 6px;
      border: 1px solid #2c3e50;
    }

    .saldo-final-row {
      background-color: #9b59b6 !important;
      color: white;
      font-weight: bold;
      font-size: 9px;
    }

    .saldo-final-row td {
      padding: 7px 6px;
      border: 1px solid #8e44ad;
    }

    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 2px solid #2c3e50;
      text-align: center;
      font-size: 8px;
      color: #7f8c8d;
    }

    .resumen {
      background-color: #e8f5e9;
      padding: 8px;
      border-radius: 5px;
      margin-top: 10px;
      border: 1px solid #81c784;
      page-break-inside: avoid;
    }

    .resumen h3 {
      font-size: 10px;
      color: #2e7d32;
      margin-bottom: 6px;
      text-align: center;
    }

    .resumen-item {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      font-size: 8px;
      color: #1b5e20;
    }

    .resumen-item strong {
      font-weight: bold;
    }

    @media print {
      body {
        padding: 5px;
      }
    }
  </style>
</head>
<body>
  <!-- ENCABEZADO -->
  <div class="header">
    <h1>LIBRO MAYOR</h1>
    <h2>{{empresa.nombre}}</h2>
    <div class="empresa-info">RUC: {{empresa.ruc}}</div>
    <div class="empresa-info">{{empresa.direccion}}</div>
  </div>

  <!-- PERÍODO -->
  <div class="periodo">
    PERÍODO: Del {{periodo.inicio}} al {{periodo.fin}}
  </div>

  <!-- CUENTAS CON MOVIMIENTOS -->
  {{#each cuentas}}
  <div class="cuenta-container">
    <div class="cuenta-header">
      <div>
        <span class="cuenta-codigo">{{this.codigo}}</span> - {{this.nombre}}
      </div>
      <div class="cuenta-naturaleza">{{this.naturaleza}}</div>
    </div>

    <table class="movimientos-table">
      <thead>
        <tr>
          <th style="width: 12%;">FECHA</th>
          <th style="width: 46%;">DESCRIPCIÓN</th>
          <th style="width: 14%;" class="text-right">DEBE</th>
          <th style="width: 14%;" class="text-right">HABER</th>
          <th style="width: 14%;" class="text-right">SALDO</th>
        </tr>
      </thead>
      <tbody>
        {{#each this.movimientos}}
        <tr>
          <td>{{this.fecha}}</td>
          <td>{{this.descripcion}}</td>
          <td class="text-right debe-cell">{{#if this.debe}}{{this.debe}}{{/if}}</td>
          <td class="text-right haber-cell">{{#if this.haber}}{{this.haber}}{{/if}}</td>
          <td class="text-right">
            <span style="font-weight: bold; color: {{#if this.deudor}}#27ae60{{else}}#c0392b{{/if}};">
              {{this.saldo}} {{this.tipoSaldo}}
            </span>
          </td>
        </tr>
        {{/each}}

        <!-- TOTALES DE LA CUENTA -->
        <tr class="totales-row">
          <td colspan="2" class="text-right"><strong>TOTALES:</strong></td>
          <td class="text-right">{{this.totalDebe}}</td>
          <td class="text-right">{{this.totalHaber}}</td>
          <td></td>
        </tr>

        <!-- SALDO FINAL DE LA CUENTA -->
        <tr class="saldo-final-row">
          <td colspan="4" class="text-right"><strong>SALDO FINAL:</strong></td>
          <td class="text-right">
            {{this.saldoFinal}} {{this.tipoSaldoFinal}}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  {{/each}}

  <!-- RESUMEN -->
  <div class="resumen">
    <h3>📊 RESUMEN DEL LIBRO MAYOR</h3>
    <div class="resumen-item">
      <span><strong>Total de Cuentas con Movimientos:</strong></span>
      <span>{{totalCuentas}}</span>
    </div>
    <div class="resumen-item">
      <span><strong>Período Analizado:</strong></span>
      <span>{{periodo.inicio}} - {{periodo.fin}}</span>
    </div>
    <div class="resumen-item">
      <span><strong>Fecha de Generación:</strong></span>
      <span>{{fechaGeneracion}}</span>
    </div>
  </div>

  <!-- PIE DE PÁGINA -->
  <div class="footer">
    <p>Este documento fue generado electrónicamente y es válido sin firma ni sello.</p>
    <p>Libro Mayor - Sistema de Gestión Contable</p>
  </div>
</body>
</html>
`;
