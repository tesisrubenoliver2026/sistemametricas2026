import db from '../../db.js';
import { generateLibroMayor } from '../../report/libroMayor.js';

/**
 * Formatea una fecha a DD/MM/YYYY
 */
const formatFechaString = (fecha) => {
  if (!fecha) return 'N/A';

  // Si es string, parseamos
  if (typeof fecha === 'string') {
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  }

  // Si es objeto Date, formateamos directamente
  if (fecha instanceof Date) {
    const day = String(fecha.getDate()).padStart(2, '0');
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const year = fecha.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return 'N/A';
};

/**
 * Formatea un número con separador de miles
 */
const formatearMoneda = (valor) => {
  if (valor === null || valor === undefined || isNaN(valor)) return '0';
  if (valor === 0) return '0';
  return Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Genera asientos contables automáticamente desde ventas, compras, ingresos y egresos
 */
const generarAsientosAutomaticos = async (fechaInicio, fechaFin, idusuarios = null) => {
  const asientos = [];
  let numeroAsiento = 1;

  // Filtro por usuario si aplica
  const userCondition = idusuarios ? `AND v.idusuarios = ${idusuarios}` : '';
  const userConditionCompras = idusuarios ? `AND c.idusuarios = ${idusuarios}` : '';
  const userConditionIngresos = idusuarios ? `AND i.creado_por = ${idusuarios}` : '';
  const userConditionEgresos = idusuarios ? `AND e.creado_por = ${idusuarios}` : '';

  // ===== 1. VENTAS =====
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

  const [ventas] = await db.promise().query(queryVentas, [fechaInicio, fechaFin]);

  for (const venta of ventas) {
    const iva10 = parseFloat(venta.iva10) || 0;
    const iva5 = parseFloat(venta.iva5) || 0;
    const totalIva = iva10 + iva5;
    const baseGravada10 = iva10 > 0 ? iva10 / 0.10 : 0;
    const baseGravada5 = iva5 > 0 ? iva5 / 0.05 : 0;
    const ventaExenta = venta.total - baseGravada10 - baseGravada5 - totalIva;

    const detalles = [];

    // DEBE: Caja o Clientes
    if (venta.tipo === 'CONTADO' || venta.tipo === 'contado') {
      detalles.push({
        codigo_cuenta: '1.1.01',
        nombre_cuenta: 'CAJA',
        debe: venta.total,
        haber: 0,
      });
    } else {
      detalles.push({
        codigo_cuenta: '1.1.03',
        nombre_cuenta: 'CLIENTES',
        debe: venta.total,
        haber: 0,
      });
    }

    // HABER: Ventas por tipo de IVA
    if (baseGravada10 > 0) {
      detalles.push({
        codigo_cuenta: '4.1.02',
        nombre_cuenta: 'VENTAS GRAVADAS 10%',
        debe: 0,
        haber: baseGravada10,
      });
    }

    if (baseGravada5 > 0) {
      detalles.push({
        codigo_cuenta: '4.1.03',
        nombre_cuenta: 'VENTAS GRAVADAS 5%',
        debe: 0,
        haber: baseGravada5,
      });
    }

    if (ventaExenta > 0) {
      detalles.push({
        codigo_cuenta: '4.1.04',
        nombre_cuenta: 'VENTAS EXENTAS',
        debe: 0,
        haber: ventaExenta,
      });
    }

    // HABER: IVA Débito Fiscal
    if (totalIva > 0) {
      detalles.push({
        codigo_cuenta: '2.1.03',
        nombre_cuenta: 'IVA DÉBITO FISCAL',
        debe: 0,
        haber: totalIva,
      });
    }

    asientos.push({
      numero_asiento: numeroAsiento++,
      fecha: venta.fecha,
      tipo_operacion: 'VENTA',
      descripcion: `Venta ${venta.nro_factura || 'S/N'} - ${venta.cliente}`,
      origen: 'ventas',
      origen_id: venta.idventa,
      detalles,
    });
  }

  // ===== 2. COMPRAS =====
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

  const [compras] = await db.promise().query(queryCompras, [fechaInicio, fechaFin]);

  for (const compra of compras) {
    const compra10 = parseFloat(compra.compra_10) || 0;
    const compra5 = parseFloat(compra.compra_5) || 0;
    const compraExenta = parseFloat(compra.compra_exenta) || 0;
    const iva10 = compra10 * 0.10;
    const iva5 = compra5 * 0.05;
    const totalIva = iva10 + iva5;

    const detalles = [];

    // DEBE: Compras
    if (compra10 > 0) {
      detalles.push({
        codigo_cuenta: '5.1.02',
        nombre_cuenta: 'COMPRAS GRAVADAS 10%',
        debe: compra10,
        haber: 0,
      });
    }

    if (compra5 > 0) {
      detalles.push({
        codigo_cuenta: '5.1.03',
        nombre_cuenta: 'COMPRAS GRAVADAS 5%',
        debe: compra5,
        haber: 0,
      });
    }

    if (compraExenta > 0) {
      detalles.push({
        codigo_cuenta: '5.1.04',
        nombre_cuenta: 'COMPRAS EXENTAS',
        debe: compraExenta,
        haber: 0,
      });
    }

    // DEBE: IVA Crédito Fiscal
    if (totalIva > 0) {
      detalles.push({
        codigo_cuenta: '1.1.06',
        nombre_cuenta: 'IVA CRÉDITO FISCAL',
        debe: totalIva,
        haber: 0,
      });
    }

    // HABER: Caja o Proveedores
    if (compra.tipo === 'CONTADO' || compra.tipo === 'contado') {
      detalles.push({
        codigo_cuenta: '1.1.01',
        nombre_cuenta: 'CAJA',
        debe: 0,
        haber: compra.total,
      });
    } else {
      detalles.push({
        codigo_cuenta: '2.1.01',
        nombre_cuenta: 'PROVEEDORES',
        debe: 0,
        haber: compra.total,
      });
    }

    asientos.push({
      numero_asiento: numeroAsiento++,
      fecha: compra.fecha,
      tipo_operacion: 'COMPRA',
      descripcion: `Compra ${compra.nro_factura || 'S/N'} - ${compra.proveedor}`,
      origen: 'compras',
      origen_id: compra.idcompra,
      detalles,
    });
  }

  // ===== 3. INGRESOS =====
  // Excluir ingresos automáticos de ventas (idventa IS NOT NULL)
  // Solo registrar ingresos manuales (venta de productos no registrados, servicios, etc.)
  const queryIngresos = `
    SELECT
      i.idingreso,
      i.fecha,
      i.monto,
      i.concepto,
      COALESCE(ti.descripcion, 'INGRESO') as tipo_ingreso
    FROM ingresos i
    LEFT JOIN tipo_ingreso ti ON i.idtipo_ingreso = ti.idtipo_ingreso
    WHERE i.fecha BETWEEN ? AND ?
      AND i.deleted_at IS NULL
      AND i.idventa IS NULL
      ${userConditionIngresos}
    ORDER BY i.fecha ASC, i.idingreso ASC
  `;

  const [ingresos] = await db.promise().query(queryIngresos, [fechaInicio, fechaFin]);

  for (const ingreso of ingresos) {
    asientos.push({
      numero_asiento: numeroAsiento++,
      fecha: ingreso.fecha,
      tipo_operacion: 'INGRESO',
      descripcion: `${ingreso.tipo_ingreso} - ${ingreso.concepto || 'Sin concepto'}`,
      origen: 'ingresos',
      origen_id: ingreso.idingreso,
      detalles: [
        {
          codigo_cuenta: '1.1.01',
          nombre_cuenta: 'CAJA',
          debe: ingreso.monto,
          haber: 0,
        },
        {
          codigo_cuenta: '4.2.01',
          nombre_cuenta: 'OTROS INGRESOS',
          debe: 0,
          haber: ingreso.monto,
        },
      ],
    });
  }

  // ===== 4. EGRESOS =====
  const queryEgresos = `
    SELECT
      e.idegreso,
      e.fecha,
      e.monto,
      e.concepto,
      COALESCE(te.descripcion, 'EGRESO') as tipo_egreso
    FROM egresos e
    LEFT JOIN tipo_egreso te ON e.idtipo_egreso = te.idtipo_egreso
    WHERE e.fecha BETWEEN ? AND ?
      AND e.deleted_at IS NULL
      ${userConditionEgresos}
    ORDER BY e.fecha ASC, e.idegreso ASC
  `;

  const [egresos] = await db.promise().query(queryEgresos, [fechaInicio, fechaFin]);

  for (const egreso of egresos) {
    asientos.push({
      numero_asiento: numeroAsiento++,
      fecha: egreso.fecha,
      tipo_operacion: 'EGRESO',
      descripcion: `${egreso.tipo_egreso} - ${egreso.concepto || 'Sin concepto'}`,
      origen: 'egresos',
      origen_id: egreso.idegreso,
      detalles: [
        {
          codigo_cuenta: '5.2.01',
          nombre_cuenta: 'GASTOS VARIOS',
          debe: egreso.monto,
          haber: 0,
        },
        {
          codigo_cuenta: '1.1.01',
          nombre_cuenta: 'CAJA',
          debe: 0,
          haber: egreso.monto,
        },
      ],
    });
  }

  return asientos;
};

/**
 * Genera el Libro Mayor agrupando asientos por cuenta
 */
export const generateLibroMayorPDF = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const idusuarios = req.user?.idusuarios || null;

    // Fechas por defecto: año actual
    const fechaInicio = fecha_inicio || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const fechaFin = fecha_fin || new Date().toISOString().split('T')[0];

    console.log(`📊 Generando Libro Mayor - Usuario: ${idusuarios || 'TODOS'}, Período: ${fechaInicio} a ${fechaFin}`);

    // Obtener datos de la empresa
    const queryEmpresa = `
      SELECT nombre_fantasia, titular, ruc, direccion
      FROM facturadores
      WHERE deleted_at IS NULL
      LIMIT 1
    `;
    const [empresaResult] = await db.promise().query(queryEmpresa);
    const empresaData = empresaResult[0] || {};

    // Generar asientos contables
    const asientos = await generarAsientosAutomaticos(fechaInicio, fechaFin, idusuarios);

    // Agrupar asientos por cuenta
    const cuentasMap = new Map();

    for (const asiento of asientos) {
      for (const detalle of asiento.detalles) {
        const codigoCuenta = detalle.codigo_cuenta;

        if (!cuentasMap.has(codigoCuenta)) {
          cuentasMap.set(codigoCuenta, {
            codigo: codigoCuenta,
            nombre: detalle.nombre_cuenta,
            movimientos: [],
            totalDebe: 0,
            totalHaber: 0,
          });
        }

        const cuenta = cuentasMap.get(codigoCuenta);

        cuenta.movimientos.push({
          fecha: asiento.fecha,
          descripcion: asiento.descripcion,
          debe: detalle.debe,
          haber: detalle.haber,
        });

        // Asegurar que sean números al acumular
        cuenta.totalDebe += parseFloat(detalle.debe) || 0;
        cuenta.totalHaber += parseFloat(detalle.haber) || 0;
      }
    }

    // Convertir Map a Array y calcular saldos
    const cuentas = Array.from(cuentasMap.values()).map(cuenta => {
      const saldo = cuenta.totalDebe - cuenta.totalHaber;

      // Determinar naturaleza de la cuenta según el código
      let naturaleza = 'DEUDORA'; // Por defecto
      if (cuenta.codigo.startsWith('2.') || cuenta.codigo.startsWith('3.') || cuenta.codigo.startsWith('4.')) {
        naturaleza = 'ACREEDORA';
      }

      // Formatear movimientos con saldo acumulado
      let saldoAcumulado = 0;
      const movimientosConSaldo = cuenta.movimientos.map(mov => {
        // Calcular saldo ANTES de formatear
        const debeNum = parseFloat(mov.debe) || 0;
        const haberNum = parseFloat(mov.haber) || 0;
        saldoAcumulado += debeNum - haberNum;
        const esDeudor = saldoAcumulado >= 0;

        return {
          fecha: formatFechaString(mov.fecha),
          descripcion: mov.descripcion,
          debe: formatearMoneda(debeNum),
          haber: formatearMoneda(haberNum),
          saldo: formatearMoneda(Math.abs(saldoAcumulado)),
          tipoSaldo: esDeudor ? 'DEUDOR' : 'ACREEDOR',
          deudor: esDeudor,
        };
      });

      return {
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        naturaleza,
        movimientos: movimientosConSaldo,
        totalDebe: formatearMoneda(cuenta.totalDebe),
        totalHaber: formatearMoneda(cuenta.totalHaber),
        saldoFinal: formatearMoneda(Math.abs(saldo)),
        tipoSaldoFinal: saldo >= 0 ? 'DEUDOR' : 'ACREEDOR',
      };
    });

    // Ordenar cuentas por código
    cuentas.sort((a, b) => a.codigo.localeCompare(b.codigo));

    // Preparar datos para el reporte
    const dataReport = {
      empresa: {
        nombre: empresaData.nombre_fantasia || empresaData.titular || 'EMPRESA SIN NOMBRE',
        ruc: empresaData.ruc || 'SIN RUC',
        direccion: empresaData.direccion || 'SIN DIRECCIÓN',
      },
      periodo: {
        inicio: formatFechaString(fechaInicio),
        fin: formatFechaString(fechaFin),
      },
      cuentas,
      totalCuentas: cuentas.length,
      fechaGeneracion: formatFechaString(new Date()),
    };

    // Generar PDF
    const reportePDFBase64 = await generateLibroMayor(dataReport);

    console.log('✅ Libro Mayor generado exitosamente');

    return res.status(200).json({
      mensaje: 'Libro Mayor generado exitosamente',
      reportePDFBase64,
    });

  } catch (error) {
    console.error('❌ Error al generar Libro Mayor:', error.message);
    return res.status(500).json({
      mensaje: 'Error al generar el Libro Mayor',
      error: error.message,
    });
  }
};
