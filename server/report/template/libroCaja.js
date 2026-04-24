export const libroCajaTemplate = `<style>
  @media print {
    @page {
      size: A4;
      margin: 10mm;
    }
    body {
      margin: 0;
      padding: 0;
    }
  }

  body {
    font-family: 'Arial', 'Helvetica', sans-serif;
    font-size: 9px;
    max-width: 100%;
    margin: 0 auto;
    padding: 10px;
    color: #000;
    background-color: #fff;
  }

  .header {
    text-align: center;
    margin-bottom: 15px;
  }

  .header h2 {
    margin: 3px 0;
    font-size: 16px;
    font-weight: bold;
    text-transform: uppercase;
  }

  .header p {
    margin: 2px 0;
    font-size: 10px;
  }

  .info-empresa {
    border: 1px solid #000;
    padding: 8px;
    margin-bottom: 10px;
  }

  .info-empresa p {
    margin: 2px 0;
    font-size: 9px;
  }

  .periodo {
    text-align: center;
    font-weight: bold;
    margin: 10px 0;
    font-size: 11px;
    background-color: #f0f0f0;
    padding: 5px;
    border: 1px solid #000;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 8px;
  }

  th, td {
    padding: 4px 3px;
    text-align: left;
    border: 1px solid #000;
  }

  th {
    background-color: #d0d0d0;
    font-weight: bold;
    font-size: 8px;
    text-align: center;
  }

  .text-right {
    text-align: right;
  }

  .text-center {
    text-align: center;
  }

  .saldo-inicial {
    background-color: #e8f4f8;
    font-weight: bold;
  }

  .saldo-final {
    background-color: #d4edda;
    font-weight: bold;
  }

  .ingreso {
    background-color: #f8f9fa;
  }

  .egreso {
    background-color: #fff3cd;
  }

  .totales {
    background-color: #e8e8e8;
    font-weight: bold;
  }

  .resumen-final {
    margin-top: 15px;
    border: 2px solid #000;
    padding: 10px;
  }

  .resumen-final h3 {
    margin: 0 0 10px 0;
    font-size: 12px;
    text-align: center;
  }

  .resumen-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .resumen-item {
    display: flex;
    justify-content: space-between;
    padding: 5px;
    border-bottom: 1px solid #ccc;
    font-size: 10px;
  }

  .resumen-item strong {
    font-weight: bold;
  }

  .footer {
    margin-top: 20px;
    text-align: center;
    font-size: 8px;
    color: #666;
  }

  .firmas {
    margin-top: 40px;
    display: flex;
    justify-content: space-around;
  }

  .firma {
    text-align: center;
    border-top: 1px solid #000;
    width: 200px;
    padding-top: 5px;
    font-size: 9px;
  }
</style>

<div class="header">
  <h2>LIBRO DE CAJA</h2>
  <p>Registro de Movimientos de Efectivo</p>
</div>

<div class="info-empresa">
  <p><strong>CONTRIBUYENTE:</strong> {{empresa.nombre_fantasia}}</p>
  <p><strong>RUC:</strong> {{empresa.ruc}}</p>
  <p><strong>DIRECCIÓN:</strong> {{empresa.direccion}}</p>
</div>

<div class="periodo">
  PERÍODO: Del {{reporte.fecha_inicio}} al {{reporte.fecha_fin}}
</div>

{{#if reporte.movimientos.length}}
<table>
  <thead>
    <tr>
      <th style="width: 10%;">Fecha</th>
      <th style="width: 50%;">Concepto/Detalle</th>
      <th style="width: 13%;">Ingresos</th>
      <th style="width: 13%;">Egresos</th>
      <th style="width: 14%;">Saldo</th>
    </tr>
  </thead>
  <tbody>
    <!-- Saldo inicial -->
    <tr class="saldo-inicial">
      <td class="text-center">{{reporte.fecha_inicio}}</td>
      <td><strong>SALDO INICIAL</strong></td>
      <td class="text-right">-</td>
      <td class="text-right">-</td>
      <td class="text-right"><strong>{{reporte.saldo_inicial}}</strong></td>
    </tr>

    <!-- Movimientos -->
    {{#each reporte.movimientos}}
      <tr class="{{#if es_ingreso}}ingreso{{else}}egreso{{/if}}">
        <td class="text-center">{{fecha}}</td>
        <td>{{concepto}}</td>
        <td class="text-right">{{#if es_ingreso}}{{monto}}{{else}}-{{/if}}</td>
        <td class="text-right">{{#if es_ingreso}}-{{else}}{{monto}}{{/if}}</td>
        <td class="text-right">{{saldo}}</td>
      </tr>
    {{/each}}

    <!-- Totales -->
    <tr class="totales">
      <td colspan="2" class="text-right"><strong>TOTALES:</strong></td>
      <td class="text-right"><strong>{{reporte.totales.total_ingresos}}</strong></td>
      <td class="text-right"><strong>{{reporte.totales.total_egresos}}</strong></td>
      <td class="text-right"></td>
    </tr>

    <!-- Saldo final -->
    <tr class="saldo-final">
      <td class="text-center">{{reporte.fecha_fin}}</td>
      <td><strong>SALDO FINAL</strong></td>
      <td class="text-right">-</td>
      <td class="text-right">-</td>
      <td class="text-right"><strong>{{reporte.saldo_final}}</strong></td>
    </tr>
  </tbody>
</table>

<div class="resumen-final">
  <h3>RESUMEN LIBRO DE CAJA</h3>
  <div class="resumen-grid">
    <div class="resumen-item">
      <span>Saldo Inicial:</span>
      <strong>{{reporte.saldo_inicial}} Gs.</strong>
    </div>
    <div class="resumen-item">
      <span>Total Ingresos:</span>
      <strong>{{reporte.totales.total_ingresos}} Gs.</strong>
    </div>
    <div class="resumen-item">
      <span>Total Egresos:</span>
      <strong>{{reporte.totales.total_egresos}} Gs.</strong>
    </div>
    <div class="resumen-item">
      <span><strong>Saldo Final:</strong></span>
      <strong>{{reporte.saldo_final}} Gs.</strong>
    </div>
    <div class="resumen-item">
      <span>Total Movimientos:</span>
      <strong>{{reporte.estadisticas.total_movimientos}}</strong>
    </div>
    <div class="resumen-item">
      <span>Ventas Contado:</span>
      <strong>{{reporte.estadisticas.ventas_contado}}</strong>
    </div>
    <div class="resumen-item">
      <span>Compras Contado:</span>
      <strong>{{reporte.estadisticas.compras_contado}}</strong>
    </div>
    <div class="resumen-item">
      <span>Otros Movimientos:</span>
      <strong>{{reporte.estadisticas.otros_movimientos}}</strong>
    </div>
  </div>
</div>

{{else}}
<div style="text-align: center; padding: 50px; font-size: 12px; color: #999;">
  <p>⚠️ No hay movimientos registrados para el período seleccionado</p>
</div>
{{/if}}

<div class="footer">
  <p>Libro de Caja generado el {{empresa.fecha_emision}}</p>
  <p>Este libro debe ser conservado por 5 años según la normativa tributaria vigente</p>
</div>

<div class="firmas">
  <div class="firma">
    <p>_____________________</p>
    <p><strong>Responsable de Caja</strong></p>
  </div>
  <div class="firma">
    <p>_____________________</p>
    <p><strong>Gerente/Administrador</strong></p>
  </div>
</div>
`;
