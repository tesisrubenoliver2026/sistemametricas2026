export const reportListProvider = `<style>
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

<h3 style="text-align: center;">Reporte de Proveedores</h3>

<div class="resumen">
  <div class="resumen-item">
    <strong>Total Proveedores</strong>
    <span>{{reporte.total_proveedores}}</span>
  </div>
  <div class="resumen-item">
    <strong>Proveedores Activos</strong>
    <span>{{reporte.proveedores_activos}}</span>
  </div>
  <div class="resumen-item">
    <strong>Proveedores Inactivos</strong>
    <span>{{reporte.proveedores_inactivos}}</span>
  </div>
  <div class="resumen-item">
    <strong>Total Compras</strong>
    <span>{{reporte.total_compras_general}}</span>
  </div>
  <div class="resumen-item">
    <strong>Monto Total Comprado</strong>
    <span>{{reporte.monto_total_comprado}} Gs.</span>
  </div>
</div>

{{#if reporte.proveedores.length}}
<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Nombre</th>
      <th>RUC</th>
      <th>Razón Social</th>
      <th>Teléfono</th>
      <th>Dirección</th>
      <th class="text-center">Estado</th>
      <th class="text-right">Total Compras</th>
      <th class="text-right">Monto Total</th>
      <th>Última Compra</th>
    </tr>
  </thead>
  <tbody>
    {{#each reporte.proveedores}}
      <tr>
        <td>{{idproveedor}}</td>
        <td><strong>{{nombre}}</strong></td>
        <td>{{ruc}}</td>
        <td>{{razon}}</td>
        <td>{{telefono}}</td>
        <td>{{direccion}}</td>
        <td class="text-center">
          <span class="badge badge-{{estado}}">{{estado}}</span>
        </td>
        <td class="text-right">{{total_compras}}</td>
        <td class="text-right"><strong>{{monto_total_comprado}} Gs.</strong></td>
        <td>{{ultima_compra}}</td>
      </tr>
    {{/each}}
  </tbody>
</table>
{{else}}
<div class="sin-datos">
  <p> No hay proveedores para mostrar</p>
</div>
{{/if}}

<div class="footer">
  <p>Reporte generado el {{empresa.fecha_emision}}</p>
  <p>{{reporte.titulo}}</p>
</div>
`;
