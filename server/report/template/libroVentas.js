export const libroVentasTemplate = `<style>
  @media print {
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    body {
      margin: 0;
      padding: 0;
    }
  }

  body {
    font-family: 'Arial', 'Helvetica', sans-serif;
    font-size: 8px;
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
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
  }

  .header p {
    margin: 2px 0;
    font-size: 9px;
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
    font-size: 10px;
    background-color: #f0f0f0;
    padding: 5px;
    border: 1px solid #000;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 7px;
  }

  th, td {
    padding: 3px 2px;
    text-align: left;
    border: 1px solid #000;
  }

  th {
    background-color: #d0d0d0;
    font-weight: bold;
    font-size: 7px;
    text-align: center;
  }

  .text-right {
    text-align: right;
  }

  .text-center {
    text-align: center;
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
    font-size: 11px;
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
    font-size: 9px;
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
    font-size: 8px;
  }
</style>

<div class="header">
  <h2>LIBRO DE VENTAS</h2>
  <p>Según Resolución General N° 38/2014 - SET</p>
</div>

<div class="info-empresa">
  <p><strong>CONTRIBUYENTE:</strong> {{empresa.nombre_fantasia}}</p>
  <p><strong>RUC:</strong> {{empresa.ruc}}</p>
  <p><strong>ACTIVIDAD ECONÓMICA:</strong> {{empresa.actividad_economica}}</p>
  <p><strong>DIRECCIÓN:</strong> {{empresa.direccion}}</p>
  <p><strong>TIMBRADO N°:</strong> {{empresa.timbrado_nro}}</p>
  <p><strong>VIGENCIA:</strong> Del {{empresa.fecha_inicio_vigente}} al {{empresa.fecha_fin_vigente}}</p>
</div>

<div class="periodo">
  PERÍODO: Del {{reporte.fecha_inicio}} al {{reporte.fecha_fin}}
</div>

{{#if reporte.ventas.length}}
<table>
  <thead>
    <tr>
      <th rowspan="2">Fecha</th>
      <th rowspan="2">N° Factura</th>
      <th rowspan="2">Timbrado</th>
      <th rowspan="2">RUC/CI Cliente</th>
      <th rowspan="2">Nombre o Razón Social</th>
      <th rowspan="2">Condición</th>
      <th colspan="3">Ventas Gravadas</th>
      <th colspan="2">IVA</th>
      <th rowspan="2">Total Factura</th>
    </tr>
    <tr>
      <th>Gravadas 10%</th>
      <th>Gravadas 5%</th>
      <th>Exentas</th>
      <th>IVA 10%</th>
      <th>IVA 5%</th>
    </tr>
  </thead>
  <tbody>
    {{#each reporte.ventas}}
      <tr>
        <td class="text-center">{{fecha}}</td>
        <td class="text-center">{{nro_factura}}</td>
        <td class="text-center">{{timbrado}}</td>
        <td class="text-center">{{cliente_documento}}</td>
        <td>{{cliente_nombre}}</td>
        <td class="text-center">{{condicion}}</td>
        <td class="text-right">{{gravada_10}}</td>
        <td class="text-right">{{gravada_5}}</td>
        <td class="text-right">{{exenta}}</td>
        <td class="text-right">{{iva_10}}</td>
        <td class="text-right">{{iva_5}}</td>
        <td class="text-right"><strong>{{total}}</strong></td>
      </tr>
    {{/each}}

    <!-- Fila de totales -->
    <tr class="totales">
      <td colspan="6" class="text-right">TOTALES:</td>
      <td class="text-right">{{reporte.totales.gravada_10}}</td>
      <td class="text-right">{{reporte.totales.gravada_5}}</td>
      <td class="text-right">{{reporte.totales.exenta}}</td>
      <td class="text-right">{{reporte.totales.iva_10}}</td>
      <td class="text-right">{{reporte.totales.iva_5}}</td>
      <td class="text-right"><strong>{{reporte.totales.total}}</strong></td>
    </tr>
  </tbody>
</table>

<div class="resumen-final">
  <h3>RESUMEN LIBRO DE VENTAS</h3>
  <div class="resumen-grid">
    <div class="resumen-item">
      <span>Total Facturas Emitidas:</span>
      <strong>{{reporte.estadisticas.total_facturas}}</strong>
    </div>
    <div class="resumen-item">
      <span>Ventas Contado:</span>
      <strong>{{reporte.estadisticas.ventas_contado}}</strong>
    </div>
    <div class="resumen-item">
      <span>Ventas Crédito:</span>
      <strong>{{reporte.estadisticas.ventas_credito}}</strong>
    </div>
    <div class="resumen-item">
      <span>Ventas Gravadas 10%:</span>
      <strong>{{reporte.totales.gravada_10}} Gs.</strong>
    </div>
    <div class="resumen-item">
      <span>Ventas Gravadas 5%:</span>
      <strong>{{reporte.totales.gravada_5}} Gs.</strong>
    </div>
    <div class="resumen-item">
      <span>Ventas Exentas:</span>
      <strong>{{reporte.totales.exenta}} Gs.</strong>
    </div>
    <div class="resumen-item">
      <span>IVA 10%:</span>
      <strong>{{reporte.totales.iva_10}} Gs.</strong>
    </div>
    <div class="resumen-item">
      <span>IVA 5%:</span>
      <strong>{{reporte.totales.iva_5}} Gs.</strong>
    </div>
    <div class="resumen-item">
      <span><strong>TOTAL IVA:</strong></span>
      <strong>{{reporte.totales.total_iva}} Gs.</strong>
    </div>
    <div class="resumen-item">
      <span><strong>TOTAL GENERAL:</strong></span>
      <strong>{{reporte.totales.total}} Gs.</strong>
    </div>
  </div>
</div>

{{else}}
<div style="text-align: center; padding: 50px; font-size: 12px; color: #999;">
  <p>⚠️ No hay ventas registradas para el período seleccionado</p>
</div>
{{/if}}

<div class="footer">
  <p>Libro de Ventas generado el {{empresa.fecha_emision}}</p>
  <p>Este libro debe ser conservado por 5 años según la normativa tributaria vigente</p>
</div>

<div class="firmas">
  <div class="firma">
    <p>_____________________</p>
    <p><strong>Responsable Contable</strong></p>
  </div>
  <div class="firma">
    <p>_____________________</p>
    <p><strong>Representante Legal</strong></p>
  </div>
</div>
`;
