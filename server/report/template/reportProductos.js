export const reporteProductosTemplateHTML = ` <style>
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
    font-size: 11px;
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
    color: #e07a1e;
  }

  h3 {
    margin: 10px 0 5px 0;
    font-size: 16px;
    color: #e07a1e;
  }

  .info p, .header p {
    margin: 3px 0;
  }

  .resumen {
    display: flex;
    justify-content: space-around;
    margin: 20px 0;
    padding: 15px;
    background-color: #fff9f2;
    border-radius: 8px;
    border: 2px solid #f9c97b;
  }

  .resumen-item {
    text-align: center;
  }

  .resumen-item strong {
    display: block;
    font-size: 14px;
    color: #e07a1e;
    margin-bottom: 5px;
  }

  .resumen-item span {
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    font-size: 10px;
  }

  th, td {
    padding: 8px 5px;
    text-align: left;
    border: 1px solid #e0e0e0;
  }

  th {
    background-color: #f9c97b;
    color: #333;
    font-weight: bold;
    font-size: 11px;
  }

  tr:nth-child(even) {
    background-color: #fff9f2;
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
    font-size: 9px;
    font-weight: bold;
  }

  .badge-activo {
    background-color: #d4edda;
    color: #155724;
  }

  .badge-inactivo {
    background-color: #f8d7da;
    color: #721c24;
  }

  .badge-unidad {
    background-color: #d1ecf1;
    color: #0c5460;
  }

  .badge-caja {
    background-color: #fff3cd;
    color: #856404;
  }

  .footer {
    margin-top: 25px;
    font-style: italic;
    color: #666;
    font-size: 10px;
  }

  hr {
    border: none;
    border-top: 2px solid #f9c97b;
    margin: 15px 0;
  }

  p strong {
    color: #e07a1e;
  }

  .sin-datos {
    text-align: center;
    padding: 30px;
    color: #999;
    font-style: italic;
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

<h3 style="text-align: center;">Reporte de Inventario de Productos</h3>

<div class="resumen">
  <div class="resumen-item">
    <strong>Total Productos</strong>
    <span>{{reporte.total_productos}}</span>
  </div>
  <div class="resumen-item">
    <strong>Stock Total (Unidades)</strong>
    <span>{{reporte.total_stock_unidades}}</span>
  </div>
  <div class="resumen-item">
    <strong>Stock Total (Cajas)</strong>
    <span>{{reporte.total_stock_cajas}}</span>
  </div>
  <div class="resumen-item">
    <strong>Valor Total Inventario</strong>
    <span>{{reporte.total_valor_inventario}} Gs.</span>
  </div>
</div>

{{#if reporte.productos.length}}
<table>
  <thead>
    <tr>
      <th>Código</th>
      <th>Producto</th>
      <th>Categoría</th>
      <th>Ubicación</th>
      <th class="text-center">Unidad</th>
      <th class="text-right">Stock</th>
      <th class="text-right">Precio Compra</th>
      <th class="text-right">Precio Venta</th>
      <th class="text-right">Valor Total</th>
      <th class="text-center">IVA</th>
      <th class="text-center">Estado</th>
    </tr>
  </thead>
  <tbody>
    {{#each reporte.productos}}
      <tr>
        <td>{{cod_barra}}</td>
        <td><strong>{{nombre_producto}}</strong></td>
        <td>{{nombre_categoria}}</td>
        <td>{{ubicacion}}</td>
        <td class="text-center">
          {{#if unidad_medida}}
            {{unidad_medida}}
          {{/if}}
        </td>
        <td class="text-right">
          {{stock}}
          {{#if cant_cajas}}
            <br><small>({{cant_cajas}} cajas)</small>
          {{/if}}
        </td>
        <td class="text-right">
          {{precio_compra}} Gs.
          {{#if precio_compra_caja}}
            <br><small>Caja: {{precio_compra_caja}} Gs.</small>
          {{/if}}
        </td>
        <td class="text-right">
          {{precio_venta}} Gs.
          {{#if precio_venta_caja}}
            <br><small>Caja: {{precio_venta_caja}} Gs.</small>
          {{/if}}
        </td>
        <td class="text-right">
          <strong>{{valor_total}} Gs.</strong>
        </td>
        <td class="text-center">{{iva}}%</td>
        <td class="text-center">{{estado}}</td>
      </tr>
    {{/each}}
  </tbody>
</table>
{{else}}
<div class="sin-datos">
  <p>⚠️ No hay productos para mostrar</p>
</div>
{{/if}}

<div class="footer">
  <p>Reporte generado el {{empresa.fecha_emision}}</p>
  <p>{{reporte.titulo}}</p>
</div>
`;
