export const reportListFacturador = `<style>
  @media print {
    @page {
      size: A4 landscape;
      margin: 15mm;
    }
    body {
      margin: 0;
      padding: 0;
    }
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 10px;
    max-width: 100%;
    margin: 0 auto;
    padding: 15px;
    color: #333;
    background-color: #fffef9;
  }

  .header, .footer {
    text-align: center;
  }

  .logo {
    width: 80px;
    margin-bottom: 8px;
  }

  h2 {
    margin: 5px 0;
    font-size: 20px;
    color: #2563eb;
  }

  h3 {
    margin: 10px 0 5px 0;
    font-size: 16px;
    color: #2563eb;
  }

  .info p, .header p {
    margin: 3px 0;
  }

  .resumen {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    margin: 20px 0;
    padding: 15px;
    background-color: #eff6ff;
    border-radius: 8px;
    border: 2px solid #93c5fd;
  }

  .resumen-item {
    text-align: center;
    margin: 5px;
    min-width: 120px;
  }

  .resumen-item strong {
    display: block;
    font-size: 11px;
    color: #2563eb;
    margin-bottom: 5px;
  }

  .resumen-item span {
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    font-size: 9px;
  }

  th, td {
    padding: 6px 4px;
    text-align: left;
    border: 1px solid #e0e0e0;
  }

  th {
    background-color: #93c5fd;
    color: #1e3a8a;
    font-weight: bold;
    font-size: 10px;
  }

  tr:nth-child(even) {
    background-color: #eff6ff;
  }

  .text-right {
    text-align: right;
  }

  .text-center {
    text-align: center;
  }

  .badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 8px;
    font-weight: bold;
  }

  .badge-Activo {
    background-color: #d1fae5;
    color: #065f46;
  }

  .badge-Culminado {
    background-color: #fee2e2;
    color: #991b1b;
  }

  .footer {
    margin-top: 25px;
    font-style: italic;
    color: #666;
    font-size: 10px;
  }

  hr {
    border: none;
    border-top: 2px solid #93c5fd;
    margin: 15px 0;
  }

  p strong {
    color: #2563eb;
  }

  .sin-datos {
    text-align: center;
    padding: 30px;
    color: #999;
    font-style: italic;
  }

  .seccion-estadisticas {
    margin: 20px 0;
  }

  .seccion-estadisticas h4 {
    margin: 10px 0;
    font-size: 13px;
    color: #2563eb;
    border-bottom: 2px solid #93c5fd;
    padding-bottom: 5px;
  }

  .estadisticas-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin: 15px 0;
  }

  .estadistica-item {
    background-color: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px;
    text-align: center;
  }

  .estadistica-item .label {
    font-size: 9px;
    color: #64748b;
    margin-bottom: 5px;
  }

  .estadistica-item .valor {
    font-size: 14px;
    font-weight: bold;
    color: #1e293b;
  }

  .highlight {
    background-color: #fef3c7;
    padding: 2px 4px;
    border-radius: 3px;
  }
</style>

<div class="header">
  <h2>{{empresa.nombre_fantasia}}</h2>
  <p><strong>RUC:</strong> {{empresa.ruc}}</p>
  <p><strong>Timbrado:</strong> {{empresa.timbrado_nro}}</p>
  <p><strong>Inicio Vigencia:</strong> {{empresa.fecha_inicio_vigente}}</p>
  <p><strong>Fin Vigencia:</strong> {{empresa.fecha_fin_vigente}}</p>
  <p><strong>Fecha de Emisión:</strong> {{empresa.fecha_emision}}</p>
</div>

<hr />

<h3 style="text-align: center;">{{reporte.titulo}}</h3>

<div class="resumen">
  <div class="resumen-item">
    <strong>Total Facturadores</strong>
    <span>{{reporte.total_facturadores}}</span>
  </div>
  <div class="resumen-item">
    <strong>Facturadores Activos</strong>
    <span>{{reporte.facturadores_activos}}</span>
  </div>
  <div class="resumen-item">
    <strong>Facturadores Culminados</strong>
    <span>{{reporte.facturadores_culminados}}</span>
  </div>
  <div class="resumen-item">
    <strong>Total Ventas</strong>
    <span>{{reporte.total_ventas_general}}</span>
  </div>
  <div class="resumen-item">
    <strong>Monto Facturado</strong>
    <span>{{reporte.monto_total_facturado}} Gs.</span>
  </div>
  <div class="resumen-item">
    <strong>Ganancia Total</strong>
    <span>{{reporte.ganancia_total}} Gs.</span>
  </div>
</div>

<div class="seccion-estadisticas">
  <h4>Estadísticas de Facturas</h4>
  <div class="estadisticas-grid">
    <div class="estadistica-item">
      <div class="label">Facturas Utilizadas</div>
      <div class="valor">{{reporte.facturas_utilizadas_total}}</div>
    </div>
    <div class="estadistica-item">
      <div class="label">Facturas Disponibles</div>
      <div class="valor">{{reporte.facturas_disponibles_total}}</div>
    </div>
    <div class="estadistica-item">
      <div class="label">Ventas Pagadas</div>
      <div class="valor">{{reporte.ventas_pagadas_total}}</div>
    </div>
    <div class="estadistica-item">
      <div class="label">Ventas Pendientes</div>
      <div class="valor">{{reporte.ventas_pendientes_total}}</div>
    </div>
  </div>
</div>

<div class="seccion-estadisticas">
  <h4>Estado de Pagos</h4>
  <div class="estadisticas-grid">
    <div class="estadistica-item">
      <div class="label">Monto Pagado</div>
      <div class="valor">{{reporte.monto_pagado_total}} Gs.</div>
    </div>
    <div class="estadistica-item">
      <div class="label">Monto Pendiente</div>
      <div class="valor">{{reporte.monto_pendiente_total}} Gs.</div>
    </div>
  </div>
</div>

{{#if reporte.facturadores.length}}
<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Nombre Fantasía</th>
      <th>RUC</th>
      <th>Timbrado</th>
      <th class="text-center">Estado</th>
      <th class="text-right">Fact. Usadas</th>
      <th class="text-right">Fact. Disp.</th>
      <th class="text-right">% Uso</th>
      <th class="text-right">Total Ventas</th>
      <th class="text-right">Monto Facturado</th>
      <th class="text-right">Ganancia</th>
      <th>Última Venta</th>
    </tr>
  </thead>
  <tbody>
    {{#each reporte.facturadores}}
      <tr>
        <td>{{idfacturador}}</td>
        <td><strong>{{nombre_fantasia}}</strong></td>
        <td>{{ruc}}</td>
        <td>{{timbrado_nro}}</td>
        <td class="text-center">
          <span class="badge badge-{{culminado}}">{{culminado}}</span>
        </td>
        <td class="text-right">{{facturas_utilizadas}}</td>
        <td class="text-right">{{facturas_disponibles}}</td>
        <td class="text-right"><span class="highlight">{{porcentaje_uso}}%</span></td>
        <td class="text-right">{{total_ventas}}</td>
        <td class="text-right"><strong>{{monto_total_facturado}} Gs.</strong></td>
        <td class="text-right"><strong>{{ganancia_total}} Gs.</strong></td>
        <td>{{ultima_venta}}</td>
      </tr>
    {{/each}}
  </tbody>
</table>
{{else}}
<div class="sin-datos">
  <p>⚠️ No hay facturadores para mostrar</p>
</div>
{{/if}}

<div class="footer">
  <p>Reporte generado el {{empresa.fecha_emision}}</p>
  <p>{{reporte.titulo}}</p>
</div>
`;
