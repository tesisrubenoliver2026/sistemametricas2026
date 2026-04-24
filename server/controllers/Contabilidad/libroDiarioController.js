import db from '../../db.js';
import { generateLibroDiario } from '../../report/libroDiario.js';

/**
 * Generar Libro Diario en PDF
 * Genera asientos contables automáticamente desde ventas, compras, ingresos y egresos
 */
export const generateLibroDiarioPDF = async (req, res) => {
  try {
    const { idusuarios, idfuncionario } = req.user;
    const { fecha_inicio, fecha_fin } = req.query;

    // Fechas por defecto: año actual
    const currentYear = new Date().getFullYear();
    const fechaInicio = fecha_inicio || `${currentYear}-01-01`;
    const fechaFin = fecha_fin || `${currentYear}-12-31`;

    console.log(`📚 Generando Libro Diario - Usuario: ${idusuarios}, Período: ${fechaInicio} a ${fechaFin}`);

    // 1. Obtener datos de la empresa desde facturadores
    const queryEmpresa = `
      SELECT nombre_fantasia, titular, ruc, direccion, telefono
      FROM facturadores
      WHERE idusuarios = ? OR idfuncionario = ?
      LIMIT 1
    `;

    const [empresa] = await db.promise().query(queryEmpresa, [idusuarios, idfuncionario]);

    if (!empresa || empresa.length === 0) {
      return res.status(404).json({ error: '❌ No se encontró información de la empresa' });
    }

    const empresaData = empresa[0];

    // 2. Generar asientos contables desde las operaciones
    const asientos = await generarAsientosAutomaticos(fechaInicio, fechaFin, idusuarios, idfuncionario);

    // 3. Calcular totales
    let totalDebe = 0;
    let totalHaber = 0;

    asientos.forEach(asiento => {
      asiento.detalles.forEach(detalle => {
        totalDebe += parseFloat(detalle.debe) || 0;
        totalHaber += parseFloat(detalle.haber) || 0;
      });
    });

    // 4. Formatear fechas para el PDF (evitar problema de timezone)
    const formatFechaString = (fecha) => {
      if (!fecha) return 'N/A';

      // Si es un string YYYY-MM-DD
      if (typeof fecha === 'string') {
        const [year, month, day] = fecha.split('-');
        return `${day}/${month}/${year}`;
      }

      // Si es un objeto Date
      if (fecha instanceof Date) {
        const day = String(fecha.getDate()).padStart(2, '0');
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const year = fecha.getFullYear();
        return `${day}/${month}/${year}`;
      }

      return 'N/A';
    };

    // 5. Preparar datos para el PDF
    const dataReport = {
      empresa: {
        nombre: empresaData.nombre_fantasia || empresaData.titular,
        ruc: empresaData.ruc,
        direccion: empresaData.direccion,
        telefono: empresaData.telefono,
      },
      periodo: {
        fecha_inicio: formatFechaString(fechaInicio),
        fecha_fin: formatFechaString(fechaFin),
      },
      asientos: asientos.map(asiento => ({
        ...asiento,
        fecha: formatFechaString(asiento.fecha),
        total_debe: asiento.total_debe.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
        total_haber: asiento.total_haber.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
        detalles: asiento.detalles.map(detalle => ({
          ...detalle,
          debe: detalle.debe > 0 ? detalle.debe.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '',
          haber: detalle.haber > 0 ? detalle.haber.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '',
        }))
      })),
      totales: {
        debe: totalDebe.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
        haber: totalHaber.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      },
      resumen: {
        total_asientos: asientos.length,
        total_movimientos: asientos.reduce((acc, a) => acc + a.detalles.length, 0),
      }
    };

    // 6. Generar PDF
    const reportePDFBase64 = await generateLibroDiario(dataReport);

    res.json({ reportePDFBase64 });

  } catch (error) {
    console.error('❌ Error al generar Libro Diario:', error);
    res.status(500).json({ error: '❌ Error al generar el Libro Diario' });
  }
};

/**
 * Generar asientos contables automáticamente desde ventas, compras, ingresos y egresos
 */
async function generarAsientosAutomaticos(fechaInicio, fechaFin, idusuarios, idfuncionario) {
  const asientos = [];
  let numeroAsiento = 1;

  // Condición dinámica de usuario
  let userCondition = '';
  const params = [fechaInicio, fechaFin];

  if (idusuarios && !idfuncionario) {
    userCondition = 'AND v.idusuarios = ?';
    params.push(idusuarios);
  } else if (idfuncionario && !idusuarios) {
    userCondition = 'AND v.idfuncionario = ?';
    params.push(idfuncionario);
  } else if (idusuarios && idfuncionario) {
    userCondition = 'AND (v.idusuarios = ? OR v.idfuncionario = ?)';
    params.push(idusuarios, idfuncionario);
  }

  // ===== 1. ASIENTOS DE VENTAS =====
  const queryVentas = `
    SELECT
      v.idventa,
      v.fecha,
      v.nro_factura,
      v.tipo,
      v.total,
      v.iva10,
      v.iva5,
      COALESCE(c.nombre, 'CLIENTE GENÉRICO') as cliente
    FROM ventas v
    LEFT JOIN clientes c ON v.idcliente = c.idcliente
    WHERE v.fecha BETWEEN ? AND ?
      AND v.deleted_at IS NULL
      ${userCondition}
    ORDER BY v.fecha ASC, v.idventa ASC
  `;

  const [ventas] = await db.promise().query(queryVentas, params);

  for (const venta of ventas) {
    const total = parseFloat(venta.total) || 0;
    const iva10 = parseFloat(venta.iva10) || 0;
    const iva5 = parseFloat(venta.iva5) || 0;
    const totalIVA = iva10 + iva5;

    // Calcular base gravada (total - IVA)
    const baseGravada10 = iva10 > 0 ? (iva10 / 0.10) : 0;
    const baseGravada5 = iva5 > 0 ? (iva5 / 0.05) : 0;
    const ventaExenta = total - baseGravada10 - iva10 - baseGravada5 - iva5;

    const detalles = [];

    // DEBE: Caja o Clientes (según tipo de venta)
    if (venta.tipo === 'CONTADO' || venta.tipo === 'contado') {
      detalles.push({
        codigo_cuenta: '1.1.01',
        nombre_cuenta: 'CAJA',
        descripcion: `Venta contado Fact. ${venta.nro_factura}`,
        debe: total,
        haber: 0,
      });
    } else {
      detalles.push({
        codigo_cuenta: '1.1.03',
        nombre_cuenta: 'CLIENTES',
        descripcion: `Venta crédito Fact. ${venta.nro_factura} - ${venta.cliente}`,
        debe: total,
        haber: 0,
      });
    }

    // HABER: Ventas según tasa de IVA
    if (baseGravada10 > 0) {
      detalles.push({
        codigo_cuenta: '4.1.02',
        nombre_cuenta: 'VENTAS GRAVADAS 10%',
        descripcion: `Base gravada 10% Fact. ${venta.nro_factura}`,
        debe: 0,
        haber: baseGravada10,
      });
    }

    if (baseGravada5 > 0) {
      detalles.push({
        codigo_cuenta: '4.1.03',
        nombre_cuenta: 'VENTAS GRAVADAS 5%',
        descripcion: `Base gravada 5% Fact. ${venta.nro_factura}`,
        debe: 0,
        haber: baseGravada5,
      });
    }

    if (ventaExenta > 0) {
      detalles.push({
        codigo_cuenta: '4.1.04',
        nombre_cuenta: 'VENTAS EXENTAS',
        descripcion: `Venta exenta Fact. ${venta.nro_factura}`,
        debe: 0,
        haber: ventaExenta,
      });
    }

    // HABER: IVA Débito Fiscal
    if (totalIVA > 0) {
      detalles.push({
        codigo_cuenta: '2.1.03',
        nombre_cuenta: 'IVA DÉBITO FISCAL',
        descripcion: `IVA venta Fact. ${venta.nro_factura}`,
        debe: 0,
        haber: totalIVA,
      });
    }

    asientos.push({
      numero_asiento: numeroAsiento++,
      fecha: venta.fecha,
      glosa: `Venta Fact. ${venta.nro_factura} - ${venta.cliente}`,
      tipo_asiento: 'VENTA',
      origen_id: venta.idventa,
      origen_tipo: 'ventas',
      total_debe: total,
      total_haber: total,
      detalles,
    });
  }

  // ===== 2. ASIENTOS DE COMPRAS =====
  const paramsCompras = [fechaInicio, fechaFin];
  let userConditionCompras = '';

  if (idusuarios && !idfuncionario) {
    userConditionCompras = 'AND c.idusuarios = ?';
    paramsCompras.push(idusuarios);
  } else if (idfuncionario && !idusuarios) {
    userConditionCompras = 'AND c.idfuncionario = ?';
    paramsCompras.push(idfuncionario);
  } else if (idusuarios && idfuncionario) {
    userConditionCompras = 'AND (c.idusuarios = ? OR c.idfuncionario = ?)';
    paramsCompras.push(idusuarios, idfuncionario);
  }

  const queryCompras = `
    SELECT
      c.idcompra,
      c.fecha,
      c.nro_factura,
      c.tipo,
      c.total,
      COALESCE(p.nombre, 'PROVEEDOR GENÉRICO') as proveedor,
      SUM(CASE WHEN dc.iva = 10 THEN dc.sub_total ELSE 0 END) as compra_10,
      SUM(CASE WHEN dc.iva = 5 THEN dc.sub_total ELSE 0 END) as compra_5,
      SUM(CASE WHEN dc.iva = 0 THEN dc.sub_total ELSE 0 END) as compra_exenta
    FROM compras c
    LEFT JOIN proveedor p ON c.idproveedor = p.idproveedor
    INNER JOIN detalle_compra dc ON c.idcompra = dc.idcompra
    WHERE c.fecha BETWEEN ? AND ?
      AND c.deleted_at IS NULL
      ${userConditionCompras}
    GROUP BY c.idcompra
    HAVING SUM(dc.sub_total) > 0
    ORDER BY c.fecha ASC, c.idcompra ASC
  `;

  const [compras] = await db.promise().query(queryCompras, paramsCompras);

  for (const compra of compras) {
    const total = parseFloat(compra.total) || 0;
    const compra10 = parseFloat(compra.compra_10) || 0;
    const compra5 = parseFloat(compra.compra_5) || 0;
    const compraExenta = parseFloat(compra.compra_exenta) || 0;

    // Calcular base gravada e IVA
    const baseGravada10 = compra10 / 1.10;
    const iva10 = baseGravada10 * 0.10;
    const baseGravada5 = compra5 / 1.05;
    const iva5 = baseGravada5 * 0.05;
    const totalIVA = iva10 + iva5;

    const detalles = [];

    // DEBE: Compras
    const totalCompras = baseGravada10 + baseGravada5 + compraExenta;
    detalles.push({
      codigo_cuenta: '5.1.02',
      nombre_cuenta: 'COMPRAS',
      descripcion: `Compra Fact. ${compra.nro_factura} - ${compra.proveedor}`,
      debe: totalCompras,
      haber: 0,
    });

    // DEBE: IVA Crédito Fiscal
    if (totalIVA > 0) {
      detalles.push({
        codigo_cuenta: '1.1.05',
        nombre_cuenta: 'IVA CRÉDITO FISCAL',
        descripcion: `IVA compra Fact. ${compra.nro_factura}`,
        debe: totalIVA,
        haber: 0,
      });
    }

    // HABER: Caja o Proveedores
    if (compra.tipo === 'CONTADO' || compra.tipo === 'contado') {
      detalles.push({
        codigo_cuenta: '1.1.01',
        nombre_cuenta: 'CAJA',
        descripcion: `Pago compra contado Fact. ${compra.nro_factura}`,
        debe: 0,
        haber: total,
      });
    } else {
      detalles.push({
        codigo_cuenta: '2.1.01',
        nombre_cuenta: 'PROVEEDORES',
        descripcion: `Compra crédito Fact. ${compra.nro_factura} - ${compra.proveedor}`,
        debe: 0,
        haber: total,
      });
    }

    asientos.push({
      numero_asiento: numeroAsiento++,
      fecha: compra.fecha,
      glosa: `Compra Fact. ${compra.nro_factura} - ${compra.proveedor}`,
      tipo_asiento: 'COMPRA',
      origen_id: compra.idcompra,
      origen_tipo: 'compras',
      total_debe: total,
      total_haber: total,
      detalles,
    });
  }

  // ===== 3. ASIENTOS DE INGRESOS MANUALES =====
  const paramsIngresos = [fechaInicio, fechaFin];
  let userConditionIngresos = '';

  if (idusuarios && !idfuncionario) {
    userConditionIngresos = 'AND i.creado_por = ?';
    paramsIngresos.push(idusuarios);
  } else if (idfuncionario && !idusuarios) {
    userConditionIngresos = 'AND i.idfuncionario = ?';
    paramsIngresos.push(idfuncionario);
  } else if (idusuarios && idfuncionario) {
    userConditionIngresos = 'AND (i.creado_por = ? OR i.idfuncionario = ?)';
    paramsIngresos.push(idusuarios, idfuncionario);
  }

  // Excluir ingresos automáticos de ventas (idventa IS NOT NULL)
  // Solo registrar ingresos manuales (venta de productos no registrados, servicios, etc.)
  const queryIngresos = `
    SELECT
      i.idingreso,
      i.fecha,
      i.concepto,
      i.monto,
      COALESCE(ti.descripcion, 'INGRESO') as tipo
    FROM ingresos i
    LEFT JOIN tipo_ingreso ti ON i.idtipo_ingreso = ti.idtipo_ingreso
    WHERE i.fecha BETWEEN ? AND ?
      AND i.deleted_at IS NULL
      AND i.idventa IS NULL
      ${userConditionIngresos}
    ORDER BY i.fecha ASC, i.idingreso ASC
  `;

  const [ingresos] = await db.promise().query(queryIngresos, paramsIngresos);

  for (const ingreso of ingresos) {
    const monto = parseFloat(ingreso.monto) || 0;

    asientos.push({
      numero_asiento: numeroAsiento++,
      fecha: ingreso.fecha,
      glosa: `${ingreso.tipo} - ${ingreso.concepto}`,
      tipo_asiento: 'INGRESO',
      origen_id: ingreso.idingreso,
      origen_tipo: 'ingresos',
      total_debe: monto,
      total_haber: monto,
      detalles: [
        {
          codigo_cuenta: '1.1.01',
          nombre_cuenta: 'CAJA',
          descripcion: ingreso.concepto,
          debe: monto,
          haber: 0,
        },
        {
          codigo_cuenta: '4.2.01',
          nombre_cuenta: 'OTROS INGRESOS',
          descripcion: ingreso.concepto,
          debe: 0,
          haber: monto,
        },
      ],
    });
  }

  // ===== 4. ASIENTOS DE EGRESOS VARIOS =====
  const paramsEgresos = [fechaInicio, fechaFin];
  let userConditionEgresos = '';

  if (idusuarios && !idfuncionario) {
    userConditionEgresos = 'AND e.creado_por = ?';
    paramsEgresos.push(idusuarios);
  } else if (idfuncionario && !idusuarios) {
    userConditionEgresos = 'AND e.idfuncionario = ?';
    paramsEgresos.push(idfuncionario);
  } else if (idusuarios && idfuncionario) {
    userConditionEgresos = 'AND (e.creado_por = ? OR e.idfuncionario = ?)';
    paramsEgresos.push(idusuarios, idfuncionario);
  }

  const queryEgresos = `
    SELECT
      e.idegreso,
      e.fecha,
      e.concepto,
      e.monto,
      COALESCE(te.descripcion, 'EGRESO') as tipo
    FROM egresos e
    LEFT JOIN tipo_egreso te ON e.idtipo_egreso = te.idtipo_egreso
    WHERE e.fecha BETWEEN ? AND ?
      AND e.deleted_at IS NULL
      ${userConditionEgresos}
    ORDER BY e.fecha ASC, e.idegreso ASC
  `;

  const [egresos] = await db.promise().query(queryEgresos, paramsEgresos);

  for (const egreso of egresos) {
    const monto = parseFloat(egreso.monto) || 0;

    asientos.push({
      numero_asiento: numeroAsiento++,
      fecha: egreso.fecha,
      glosa: `${egreso.tipo} - ${egreso.concepto}`,
      tipo_asiento: 'EGRESO',
      origen_id: egreso.idegreso,
      origen_tipo: 'egresos',
      total_debe: monto,
      total_haber: monto,
      detalles: [
        {
          codigo_cuenta: '5.2.01',
          nombre_cuenta: 'GASTOS VARIOS',
          descripcion: egreso.concepto,
          debe: monto,
          haber: 0,
        },
        {
          codigo_cuenta: '1.1.01',
          nombre_cuenta: 'CAJA',
          descripcion: egreso.concepto,
          debe: 0,
          haber: monto,
        },
      ],
    });
  }

  // Ordenar todos los asientos por fecha
  asientos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  // Renumerar asientos después de ordenar
  asientos.forEach((asiento, index) => {
    asiento.numero_asiento = index + 1;
  });

  return asientos;
}
