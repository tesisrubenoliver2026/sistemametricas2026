export const reportLiquidacion = `
<style>
  @media print {
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    body { margin: 0; padding: 0; }
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 11px;
    color: #111827;
    background: #ffffff;
  }

  .wrap { max-width: 900px; margin: 0 auto; }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 10px;
    margin-bottom: 12px;
  }

  .title {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.2px;
    margin: 0;
    color: #1d4ed8;
  }

  .sub { margin: 3px 0 0; color: #6b7280; font-size: 10px; }

  .badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid #93c5fd;
    background: #eff6ff;
    color: #1d4ed8;
    font-weight: 700;
    font-size: 10px;
    white-space: nowrap;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }

  .card {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px;
    background: #fafafa;
  }

  .label { color: #6b7280; font-size: 10px; margin: 0 0 4px; }
  .value { margin: 0; font-weight: 700; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }

  th, td {
    border: 1px solid #e5e7eb;
    padding: 7px 8px;
    text-align: left;
    vertical-align: top;
  }

  th {
    background: #f3f4f6;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: #374151;
  }

  .right { text-align: right; }

  .totals {
    margin-top: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px;
  }

  .totalsRow {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding: 4px 0;
    border-bottom: 1px dashed #e5e7eb;
  }

  .totalsRow:last-child { border-bottom: 0; }
  .totalsRow .k { color: #6b7280; font-size: 10px; }
  .totalsRow .v { font-weight: 800; }

  .footer {
    margin-top: 14px;
    padding-top: 10px;
    border-top: 1px solid #e5e7eb;
    color: #6b7280;
    font-size: 10px;
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }
</style>

<div class="wrap">
  <div class="header">
    <div>
      <h1 class="title">{{reporte.titulo}}</h1>
      <p class="sub">
        {{#if empresa.nombre_fantasia}}{{empresa.nombre_fantasia}}{{/if}}
        {{#if empresa.ruc}} · RUC: {{empresa.ruc}}{{/if}}
      </p>
      <p class="sub">Emision: {{empresa.fecha_emision}}</p>
    </div>
    <div class="badge">Estado: {{liquidacion.estado}}</div>
  </div>

  <div class="grid">
    <div class="card">
      <p class="label">Empleado</p>
      <p class="value">{{empleado.nombre}} {{empleado.apellido}}</p>
      <p class="sub">Documento: {{empleado.cedula}}</p>
      <p class="sub">ID Empleado: {{empleado.idempleado}}</p>
    </div>
    <div class="card">
      <p class="label">Periodo</p>
      <p class="value">{{liquidacion.fecha_inicio}} a {{liquidacion.fecha_fin}}</p>
      <p class="sub">Tipo: {{liquidacion.tipo}}</p>
      {{#if liquidacion.idliquidacion}}
        <p class="sub">Liquidacion #: {{liquidacion.idliquidacion}}</p>
      {{/if}}
    </div>
  </div>

  <div class="totals">
    <div class="totalsRow"><div class="k">Salario base</div><div class="v right">{{formatPY liquidacion.salario_base}}</div></div>
    <div class="totalsRow"><div class="k">Horas extras</div><div class="v right">{{formatPY liquidacion.total_horas_extras}}</div></div>
    <div class="totalsRow"><div class="k">Comisiones</div><div class="v right">{{formatPY liquidacion.total_comisiones}}</div></div>
    <div class="totalsRow"><div class="k">Bonos</div><div class="v right">{{formatPY liquidacion.total_bonos}}</div></div>
    <div class="totalsRow"><div class="k">Descuentos</div><div class="v right">{{formatPY liquidacion.total_descuentos}}</div></div>
    <div class="totalsRow"><div class="k">IPS</div><div class="v right">{{formatPY liquidacion.total_ips}}</div></div>
    <div class="totalsRow"><div class="k">Total a cobrar</div><div class="v right">{{formatPY liquidacion.total_a_cobrar}}</div></div>
  </div>

  {{#if detalles.length}}
    <h3 style="margin: 14px 0 6px; color:#111827;">Detalle de liquidacion</h3>
    <table>
      <thead>
        <tr>
          <th style="width: 55%;">Concepto</th>
          <th style="width: 20%;">Tipo</th>
          <th class="right" style="width: 25%;">Monto</th>
        </tr>
      </thead>
      <tbody>
        {{#each detalles}}
          <tr>
            <td>{{concepto}}</td>
            <td>{{tipo}}</td>
            <td class="right">{{formatPY monto}}</td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  {{/if}}

  {{#if movimientos.length}}
    <h3 style="margin: 14px 0 6px; color:#111827;">Movimientos RRHH (bonos/descuentos)</h3>
    <table>
      <thead>
        <tr>
          <th style="width: 18%;">Fecha</th>
          <th style="width: 18%;">Tipo</th>
          <th style="width: 44%;">Concepto</th>
          <th class="right" style="width: 20%;">Monto</th>
        </tr>
      </thead>
      <tbody>
        {{#each movimientos}}
          <tr>
            <td>{{fecha}}</td>
            <td>{{tipo}}</td>
            <td>{{concepto}}</td>
            <td class="right">{{formatPY monto}}</td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  {{/if}}

  <div class="footer">
    <div>Documento generado por el sistema</div>
    <div>{{reporte.titulo}}</div>
  </div>
</div>
`;

