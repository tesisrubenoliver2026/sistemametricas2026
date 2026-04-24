export const reportListCompra = `<style>
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
    color: #16a34a;
  }

  h3 {
    margin: 10px 0 5px 0;
    font-size: 16px;
    color: #16a34a;
  }

  .info p, .header p {
    margin: 3px 0;
  }

  .filtros {
    text-align: center;
    margin: 10px 0;
    padding: 10px;
    background-color: #f0fdf4;
    border-radius: 6px;
    border: 1px solid #86efac;
  }

  .filtros p {
    margin: 3px 0;
    font-size: 11px;
  }

  .resumen {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    margin: 20px 0;
    padding: 15px;
    background-color: #f0fdf4;
    border-radius: 8px;
    border: 2px solid #86efac;
  }

  .resumen-item {
    text-align: center;
    margin: 5px;
    min-width: 110px;
  }

  .resumen-item strong {
    display: block;
    font-size: 11px;
    color: #16a34a;
    margin-bottom: 5px;
  }

  .resumen-item span {
    font-size: 15px;
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
    background-color: #86efac;
    color: #14532d;
    font-weight: bold;
    font-size: 10px;
  }

  tr:nth-child(even) {
    background-color: #f0fdf4;
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

  .badge-Contado {
    background-color: #d1fae5;
    color: #065f46;
  }

  .badge-Credito {
    background-color: #fef3c7;
    color: #92400e;
  }

  .badge-activo {
    background-color: #d1fae5;
    color: #065f46;
  }

  .badge-anulado {
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
    border-top: 2px solid #86efac;
    margin: 15px 0;
  }

  p strong {
    color: #16a34a;
  }

  .sin-datos {
    text-align: center;
    padding: 30px;
    color: #999;
    font-style: italic;
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

<div class="filtros">
  <p><strong>Período:</strong> Del {{reporte.fecha_inicio}} al {{reporte.fecha_fin}}</p>
</div>

<div class="resumen">
  <div class="resumen-item">
    <strong>Total Compras</strong>
    <span>{{reporte.total_compras}}</span>
  </div>
  <div class="resumen-item">
    <strong>Compras Contado</strong>
    <span>{{reporte.compras_contado}}</span>
  </div>
  <div class="resumen-item">
    <strong>Compras Crédito</strong>
    <span>{{reporte.compras_credito}}</span>
  </div>
  <div class="resumen-item">
    <strong>Monto Total</strong>
    <span>{{reporte.monto_total_compras}} Gs.</span>
  </div>
  <div class="resumen-item">
    <strong>Total Descuentos</strong>
    <span>{{reporte.monto_total_descuentos}} Gs.</span>
  </div>
  <div class="resumen-item">
    <strong>Productos Comprados</strong>
    <span>{{reporte.cantidad_total_productos}}</span>
  </div>
</div>

{{#if reporte.compras.length}}
<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Fecha</th>
      <th>Nro. Factura</th>
      <th>Proveedor</th>
      <th>RUC</th>
      <th>Cajero</th>
      <th class="text-center">Tipo</th>
      <th class="text-center">Estado</th>
      <th class="text-right">Productos</th>
      <th class="text-right">Cantidad</th>
      <th class="text-right">Descuento</th>
      <th class="text-right">Total</th>
    </tr>
  </thead>
  <tbody>
    {{#each reporte.compras}}
      <tr>
        <td>{{idcompra}}</td>
        <td>{{fecha}}</td>
        <td>{{nro_factura}}</td>
        <td><strong>{{proveedor_nombre}}</strong></td>
        <td>{{proveedor_ruc}}</td>
        <td>{{cajero_nombre}}</td>
        <td class="text-center">
          <span class="badge badge-{{tipo}}">{{tipo}}</span>
        </td>
        <td class="text-center">
          <span class="badge badge-{{estado}}">{{estado}}</span>
        </td>
        <td class="text-right">{{total_productos}}</td>
        <td class="text-right">{{cantidad_total_productos}}</td>
        <td class="text-right">{{descuento}} Gs.</td>
        <td class="text-right"><strong>{{total}} Gs.</strong></td>
      </tr>
    {{/each}}
  </tbody>
</table>
{{else}}
<div class="sin-datos">
  <p>⚠️ No hay compras para mostrar</p>
</div>
{{/if}}

<div class="footer">
  <p>Reporte generado el {{empresa.fecha_emision}}</p>
  <p>{{reporte.titulo}}</p>
</div>
`;
