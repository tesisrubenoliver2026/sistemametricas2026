export const reportPagareDineroTemplate1 = `<style>
  body {
    font-family: monospace;
    font-size: 9px;
    width: 58mm;
    margin: 0 auto;
    padding: 2px;
  }

  .header, .footer {
    text-align: center;
  }

  h2 {
    font-size: 11px;
    margin: 2px 0;
  }

  p {
    margin: 1px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 4px;
  }

  th, td {
    padding: 1px 2px;
    font-size: 8.5px;
    border-bottom: 1px dotted #000;
    word-wrap: break-word;
  }

  th {
    font-weight: bold;
    text-align: left;
  }

  .totales td {
    font-weight: bold;
  }

  .center {
    text-align: center;
  }

  .right {
    text-align: right;
  }

  .firma {
    margin-top: 14px;
    text-align: center;
  }

  .firma-linea {
    margin-top: 10px;
    border-top: 1px solid #000;
  }

  .legal {
    font-size: 8px;
    margin-top: 6px;
    text-align: justify;
  }
</style>

<div class="header">
  <h2>{{empresa.nombre_fantasia}}</h2>
  <p><strong>RUC:</strong> {{empresa.ruc}}</p>
  <p><strong>Timbrado:</strong> {{empresa.timbrado_nro}}</p>
  <p>Vig.: {{empresa.fecha_inicio_vigente}} - {{empresa.fecha_fin_vigente}}</p>
</div>

<p class="center"><strong>PAGARÉ DE CRÉDITO</strong></p>

<p><strong>Fecha:</strong> {{venta.fecha}}</p>
<p><strong>Venc.:</strong> {{venta.fecha_vencimiento}}</p>

<hr />

<p><strong>Deudor:</strong></p>
<p>{{cliente.nombre}} {{cliente.apellido}}</p>
<p>{{cliente.tipo_documento}} {{cliente.numDocumento}}</p>
<p>{{cliente.telefono}}</p>
<p>{{cliente.direccion}}</p>

<hr />

<table>
  <thead>
    <tr>
      <th>Prod</th>
      <th>Cant</th>
      <th>P.U</th>
      <th>Sub</th>
    </tr>
  </thead>
  <tbody>
    {{#each detalles}}
    <tr>
      <td>{{nombre_producto}}</td>
      <td class="center">{{cantidad}}</td>
      <td class="right">{{formatPY precio_venta}}</td>
      <td class="right">{{formatPY subtotal}}</td>
    </tr>
    {{/each}}
  </tbody>
</table>

<table class="totales">
  <tbody>
    <tr>
      <td>Total:</td>
      <td class="right">{{formatPY venta.total}}</td>
    </tr>
  </tbody>
</table>

<p class="legal">
  Reconozco deber y me obligo a pagar incondicionalmente a la orden de
  {{empresa.nombre_fantasia}} la suma de Gs. {{formatPY venta.total}},
  correspondiente a esta venta a crédito.
</p>

<p><strong>Total en letras:</strong></p>
<p>{{venta.total_letras}}</p>

<p><strong>Cuotas:</strong> {{venta.cant_cuota}} |
<strong>Día pago:</strong> {{venta.dia_fecha_pago}}</p>

<div class="firma">
  <div class="firma-linea"></div>
  <p>Firma del Deudor</p>
  <p>{{cliente.nombre}} {{cliente.apellido}}</p>
</div>

<div class="footer">
  <p>Documento generado</p>
  <p>{{empresa.fecha_emision}}</p>
</div>
`;

export const reportPagareDineroTemplate2 = `
<style>
  @media print {
    @page {
      size: A4 portrait;
      margin: 20mm;
    }

    body {
      margin: 0;
      padding: 0;
    }
  }

  body {
    font-family: Arial, sans-serif;
    font-size: 12px;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    color: #333;
  }

  .header, .footer {
    text-align: center;
  }

  h2 {
    margin: 5px 0;
    font-size: 18px;
  }

  .info p {
    margin: 2px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
  }

  th, td {
    padding: 8px;
    text-align: left;
    border: 1px solid #ccc;
    font-size: 12px;
  }

  th {
    background-color: #f0f0f0;
    font-weight: bold;
  }

  .totales th, .totales td {
    text-align: right;
  }

  .totales {
    margin-top: 20px;
  }

  .legal {
    margin-top: 20px;
    font-size: 11px;
    text-align: justify;
  }

  .firma {
    margin-top: 50px;
    text-align: center;
  }

  .firma hr {
    width: 260px;
    margin: 8px auto;
  }

  .footer {
    margin-top: 30px;
    font-style: italic;
  }
</style>

<!-- ================= ENCABEZADO ================= -->
<div class="header">
  <h2>{{empresa.nombre_fantasia}}</h2>
  <p><strong>RUC:</strong> {{empresa.ruc}}</p>
  <p><strong>Timbrado:</strong> {{empresa.timbrado_nro}}</p>
  <p><strong>Inicio Vigencia:</strong> {{empresa.fecha_inicio_vigente}}</p>
  <p><strong>Fin Vigencia:</strong> {{empresa.fecha_fin_vigente}}</p>
</div>

<hr />

<h2 style="text-align:center;">PAGARÉ DE CRÉDITO</h2>

<!-- ================= INFO GENERAL ================= -->
<div class="info">
  <p><strong>Fecha de Emisión:</strong> {{venta.fecha}}</p>
  <p><strong>Fecha de Vencimiento:</strong> {{venta.fecha_vencimiento}}</p>
  <p><strong>Cantidad de Cuotas:</strong> {{venta.cant_cuota}}</p>
  <p><strong>Día de Pago:</strong> {{venta.dia_fecha_pago}}</p>
</div>

<!-- ================= DATOS CLIENTE ================= -->
<div class="info">
  <p><strong>Cliente:</strong> {{cliente.nombre}} {{cliente.apellido}}</p>
  <p><strong>Documento:</strong> {{cliente.tipo_documento}} Nº {{cliente.numDocumento}}</p>
  <p><strong>Teléfono:</strong> {{cliente.telefono}}</p>
  <p><strong>Dirección:</strong> {{cliente.direccion}}</p>
</div>

<!-- ================= DETALLE ================= -->
<table>
  <thead>
    <tr>
      <th>Producto</th>
      <th>Cantidad</th>
      <th>Precio Unitario</th>
      <th>Subtotal</th>
    </tr>
  </thead>
  <tbody>
    {{#each detalles}}
    <tr>
      <td>{{nombre_producto}}</td>
      <td>{{cantidad}}</td>
      <td>{{formatPY precio_venta}} Gs.</td>
      <td>{{formatPY subtotal}} Gs.</td>
    </tr>
    {{/each}}
  </tbody>
</table>

<!-- ================= TOTALES ================= -->
<table class="totales">
  <thead>
    <tr>
      <th>Total General</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>{{formatPY venta.total}} Gs.</td>
    </tr>
  </tbody>
</table>

<p style="margin-top: 15px;">
  <strong>Total en letras:</strong> {{venta.total_letras}}
</p>

<!-- ================= TEXTO LEGAL ================= -->
<div class="legal">
  Por el presente PAGARÉ reconozco deber y me obligo a pagar
  incondicionalmente a la orden de <strong>{{empresa.nombre_fantasia}}</strong>,
  la suma de <strong>Gs. {{formatPY venta.total}}</strong>
  ({{venta.total_letras}}), correspondiente a la venta a crédito
  detallada precedentemente.  
  En caso de incumplimiento, el deudor se somete a las leyes y
  tribunales de la República del Paraguay.
</div>

<!-- ================= FIRMA ================= -->
<div class="firma">
  <hr />
  <strong>Firma del Deudor</strong><br />
  {{cliente.nombre}} {{cliente.apellido}}<br />
  {{cliente.tipo_documento}} Nº {{cliente.numDocumento}}
</div>

<!-- ================= FOOTER ================= -->
<div class="footer">
  <p>Documento generado el {{empresa.fecha_emision}}</p>
</div>
`;

export const reportPagareDineroTemplate3 =   `
<style>
  @media print {
    @page {
      size: A4 portrait;
      margin: 20mm;
    }

    body {
      margin: 0;
      padding: 0;
    }
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 12px;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    color: #333;
    background-color: #fffef9;
  }

  .header, .footer {
    text-align: center;
  }

  h2 {
    margin: 5px 0;
    font-size: 20px;
    color: #e07a1e;
  }

  .info p {
    margin: 3px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    border-radius: 6px;
    overflow: hidden;
  }

  th, td {
    padding: 10px;
    text-align: left;
    border: 1px solid #e0e0e0;
    font-size: 12px;
  }

  th {
    background-color: #f9c97b;
    color: #333;
    font-weight: bold;
  }

  tr:nth-child(even) {
    background-color: #fff9f2;
  }

  .totales th, .totales td {
    text-align: right;
  }

  .totales {
    margin-top: 25px;
  }

  .legal {
    margin-top: 25px;
    font-size: 11px;
    text-align: justify;
  }

  .firma {
    margin-top: 55px;
    text-align: center;
  }

  .firma hr {
    width: 280px;
    margin: 10px auto;
    border: none;
    border-top: 1px solid #333;
  }

  .footer {
    margin-top: 35px;
    font-style: italic;
    color: #666;
  }

  hr {
    border: none;
    border-top: 2px solid #f9c97b;
    margin: 20px 0;
  }

  p strong {
    color: #e07a1e;
  }
</style>

<!-- ================= ENCABEZADO ================= -->
<div class="header">
  <h2>{{empresa.nombre_fantasia}}</h2>
  <p><strong>RUC:</strong> {{empresa.ruc}}</p>
  <p><strong>Timbrado:</strong> {{empresa.timbrado_nro}}</p>
  <p><strong>Inicio Vigencia:</strong> {{empresa.fecha_inicio_vigente}}</p>
  <p><strong>Fin Vigencia:</strong> {{empresa.fecha_fin_vigente}}</p>
</div>

<hr />

<h2 style="text-align:center;">PAGARÉ DE CRÉDITO</h2>

<!-- ================= INFO PAGARÉ ================= -->
<div class="info">
  <p><strong>Fecha de Emisión:</strong> {{venta.fecha}}</p>
  <p><strong>Fecha de Vencimiento:</strong> {{venta.fecha_vencimiento}}</p>
  <p><strong>Cantidad de Cuotas:</strong> {{venta.cant_cuota}}</p>
  <p><strong>Día de Pago:</strong> {{venta.dia_fecha_pago}}</p>
</div>

<!-- ================= DATOS DEL DEUDOR ================= -->
<div class="info">
  <p><strong>Deudor:</strong> {{cliente.nombre}} {{cliente.apellido}}</p>
  <p><strong>Documento:</strong> {{cliente.tipo_documento}} Nº {{cliente.numDocumento}}</p>
  <p><strong>Teléfono:</strong> {{cliente.telefono}}</p>
  <p><strong>Dirección:</strong> {{cliente.direccion}}</p>
</div>

<!-- ================= DETALLE ================= -->
<table>
  <thead>
    <tr>
      <th>Concepto</th>
      <th>Cantidad</th>
      <th>Precio Unitario</th>
      <th>Subtotal</th>
    </tr>
  </thead>
  <tbody>
    {{#each detalles}}
    <tr>
      <td>{{nombre_producto}}</td>
      <td>{{cantidad}}</td>
      <td>{{formatPY precio_venta}} Gs.</td>
      <td>{{formatPY subtotal}} Gs.</td>
    </tr>
    {{/each}}
  </tbody>
</table>

<!-- ================= TOTAL ================= -->
<table class="totales">
  <thead>
    <tr>
      <th>Total General</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>{{formatPY venta.total}} Gs.</td>
    </tr>
  </tbody>
</table>

<p style="margin-top: 18px;">
  <strong>Total en letras:</strong> {{venta.total_letras}}
</p>

<!-- ================= TEXTO LEGAL ================= -->
<div class="legal">
  Por el presente PAGARÉ reconozco deber y me obligo a pagar
  incondicionalmente a la orden de <strong>{{empresa.nombre_fantasia}}</strong>,
  la suma de <strong>Gs. {{formatPY venta.total}}</strong>
  ({{venta.total_letras}}), correspondiente a la operación
  de venta a crédito detallada precedentemente.
  En caso de mora, el deudor se somete expresamente a las leyes
  y tribunales de la República del Paraguay.
</div>

<!-- ================= FIRMA ================= -->
<div class="firma">
  <hr />
  <strong>Firma del Deudor</strong><br />
  {{cliente.nombre}} {{cliente.apellido}}<br />
  {{cliente.tipo_documento}} Nº {{cliente.numDocumento}}
</div>

<!-- ================= FOOTER ================= -->
<div class="footer">
  <p>Documento generado el {{empresa.fecha_emision}}</p>
</div>
`;

export const reportPagareDineroTemplate4 = `<style>
  @media print {
    @page {
      size: A4 portrait;
      margin: 20mm;
    }
    body {
      margin: 0;
      padding: 0;
    }
  }

  body {
    font-family: 'Arial', sans-serif;
    font-size: 12px;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #ffffff;
    color: #2c3e50;
  }

  .header, .footer {
    text-align: center;
  }

  h2 {
    font-size: 22px;
    margin: 0;
    color: #c0392b;
    text-transform: uppercase;
  }

  hr {
    border: none;
    border-top: 3px double #c0392b;
    margin: 20px 0;
  }

  strong {
    color: #c0392b;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    margin: 6px 0;
    font-size: 12px;
  }

  .info-row div {
    flex: 1;
  }

  .texto {
    margin-top: 15px;
    text-align: justify;
    line-height: 1.6;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  th, td {
    padding: 10px 8px;
    border: 1px solid #ccc;
    font-size: 12px;
  }

  th {
    background-color: #f2f2f2;
    color: #c0392b;
    text-transform: uppercase;
  }

  .firmas {
    margin-top: 50px;
    display: flex;
    justify-content: space-between;
    text-align: center;
  }

  .firma {
    width: 45%;
  }

  .firma-linea {
    border-top: 1px solid #000;
    margin-top: 60px;
    padding-top: 5px;
  }

  .footer {
    margin-top: 40px;
    font-style: italic;
    font-size: 11px;
    color: #7f8c8d;
  }
</style>

<div class="header">
  <h2>PAGARÉ A LA ORDEN</h2>
  <p><strong>{{empresa.nombre_fantasia}}</strong></p>
  <p><strong>RUC:</strong> {{empresa.ruc}}</p>
</div>

<hr />

<div class="info-row">
  <div><strong>N° Pagaré:</strong> {{pagare.numero}}</div>
  <div><strong>Fecha Emisión:</strong> {{pagare.fecha_emision}}</div>
  <div><strong>Vencimiento:</strong> {{pagare.fecha_vencimiento}}</div>
</div>

<div class="info-row">
  <div><strong>Cliente:</strong> {{cliente.nombre}} {{cliente.apellido}}</div>
  <div><strong>Documento:</strong> {{cliente.tipo_doc}} {{cliente.numDocumento}}</div>
</div>

<div class="info-row">
  <div><strong>Domicilio:</strong> {{cliente.direccion}}</div>
  <div><strong>Teléfono:</strong> {{cliente.telefono}}</div>
</div>

<div class="texto">
  <p>
    Yo, <strong>{{cliente.nombre}} {{cliente.apellido}}</strong>, reconozco deber y me obligo a pagar
    incondicionalmente a la orden de <strong>{{empresa.nombre_fantasia}}</strong>,
    la suma de <strong>{{formatPY venta.total}} Gs.</strong>
    ({{venta.total_letras}}),
    correspondiente a la compra de los productos detallados más abajo,
    en la modalidad de <strong>VENTA A CRÉDITO</strong>.
  </p>

  <p>
    El pago se realizará en <strong>{{venta.cant_cuota}}</strong> cuota(s),
    con vencimiento el día <strong>{{venta.dia_fecha_pago}}</strong> de cada mes,
    sin interés adicional salvo mora.
  </p>
</div>

<table>
  <thead>
    <tr>
      <th>Producto</th>
      <th>Cantidad</th>
      <th>Precio Unit.</th>
      <th>Subtotal</th>
    </tr>
  </thead>
  <tbody>
    {{#each detalles}}
    <tr>
      <td>{{nombre_producto}}</td>
      <td>{{cantidad}}</td>
      <td>{{formatPY precio_venta}} Gs.</td>
      <td>{{formatPY sub_total}} Gs.</td>
    </tr>
    {{/each}}
  </tbody>
</table>

<div class="texto">
  <p>
    En caso de incumplimiento, el deudor acepta expresamente la ejecución del presente pagaré,
    conforme a las leyes de la República del Paraguay.
  </p>
</div>

<div class="firmas">
  <div class="firma">
    <div class="firma-linea"></div>
    <p>Firma del Deudor</p>
    <p>{{cliente.nombre}} {{cliente.apellido}}</p>
  </div>

  <div class="firma">
    <div class="firma-linea"></div>
    <p>Firma del Acreedor</p>
    <p>{{empresa.nombre_fantasia}}</p>
  </div>
</div>

<div class="footer">
  <p>Documento válido como pagaré comercial.</p>
</div>`;

