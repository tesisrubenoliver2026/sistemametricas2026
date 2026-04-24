import Liquidacion from '../../models/RRHH/Liquidacion.js';
import db from '../../db.js';
import { getUserId } from '../../utils/getUserId.js';
import { generateReportLiquidacion } from '../../report/reportLiquidacion.js';

const parsePagination = (req) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  return { limit, page, offset, search };
};

const toSqlDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const addOneDay = (sqlDate) => {
  const d = new Date(`${sqlDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

const todaySql = () => new Date().toISOString().slice(0, 10);

const runQuery = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.query(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const formatDate = (value) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}-${month}-${year}`;
};

const getEmpresaForReport = async () => {
  const rows = await runQuery(
    `SELECT nombre_fantasia, ruc
     FROM facturadores
     WHERE culminado = FALSE
     ORDER BY idfacturador DESC
     LIMIT 1`,
  );
  const fact = rows[0] || {};
  return {
    nombre_fantasia: fact.nombre_fantasia || 'Empresa',
    ruc: fact.ruc || '',
    fecha_emision: formatDate(new Date()),
  };
};

const getEmpleadoForReport = async (idempleado) => {
  const rows = await runQuery(
    `SELECT idempleado, nombre, apellido, cedula
     FROM empleados
     WHERE idempleado = ?
     LIMIT 1`,
    [idempleado],
  );
  const e = rows[0] || {};
  return {
    idempleado: e.idempleado || idempleado,
    nombre: e.nombre || 'N/A',
    apellido: e.apellido || '',
    cedula: e.cedula || 'N/A',
  };
};

const getMovimientosForReport = async (usuarioId, idempleado, fechaInicio, fechaFin) => {
  const rows = await runQuery(
    `SELECT fecha, tipo, concepto, monto
     FROM rrhh_movimientos
     WHERE usuario_id = ?
       AND idempleado = ?
       AND estado = 'activo'
       AND fecha BETWEEN ? AND ?
     ORDER BY fecha ASC, idmovimiento ASC`,
    [usuarioId, idempleado, fechaInicio, fechaFin],
  );
  return (rows || []).map((r) => ({
    ...r,
    fecha: formatDate(r.fecha),
    tipo: r.tipo === 'bono' ? 'Bono' : 'Descuento',
  }));
};

const getDetallesForReport = async (idliquidacion) => {
  const rows = await runQuery(
    `SELECT concepto, tipo, monto
     FROM detalle_liquidacion
     WHERE idliquidacion = ?
     ORDER BY iddetalle ASC`,
    [idliquidacion],
  );
  return rows || [];
};

const buildPreLiquidacion = async (usuarioId, idempleado, tipo = 'Normal') => {
  const empleadoRows = await runQuery(
    `SELECT idempleado, fecha_ingreso, aporta_ips, porcentaje_ips_empleado
     FROM empleados
     WHERE idempleado = ?
     LIMIT 1`,
    [idempleado],
  );

  if (!empleadoRows.length) {
    const err = new Error('Empleado no encontrado');
    err.statusCode = 404;
    throw err;
  }

  const empleado = empleadoRows[0];

  const lastLiquidacionRows = await runQuery(
    `SELECT fecha_fin
     FROM liquidaciones
     WHERE idempleado = ?
     ORDER BY fecha_fin DESC, idliquidacion DESC
     LIMIT 1`,
    [idempleado],
  );

  const fechaIngreso = toSqlDate(empleado.fecha_ingreso);
  const fechaInicio = lastLiquidacionRows.length && lastLiquidacionRows[0].fecha_fin
    ? addOneDay(toSqlDate(lastLiquidacionRows[0].fecha_fin))
    : fechaIngreso;
  const fechaFin = todaySql();

  const salarioRows = await runQuery(
    `SELECT salario_base
     FROM salarios
     WHERE idempleado = ?
       AND fecha_inicio <= ?
       AND (fecha_fin IS NULL OR fecha_fin >= ?)
     ORDER BY fecha_inicio DESC, idsalario DESC
     LIMIT 1`,
    [idempleado, fechaFin, fechaInicio],
  );

  const horasRows = await runQuery(
    `SELECT COALESCE(SUM(cantidad_horas), 0) AS total_horas_extras
     FROM horas_extras
     WHERE idempleado = ?
       AND fecha BETWEEN ? AND ?`,
    [idempleado, fechaInicio, fechaFin],
  );

  const comisionesRows = await runQuery(
    `SELECT COALESCE(SUM(monto_comision), 0) AS total_comisiones
     FROM comisiones
     WHERE idempleado = ?
       AND fecha BETWEEN ? AND ?`,
    [idempleado, fechaInicio, fechaFin],
  );

  const bonosRows = await runQuery(
    `SELECT COALESCE(SUM(monto), 0) AS total_bonos
     FROM rrhh_movimientos
     WHERE usuario_id = ?
       AND idempleado = ?
       AND estado = 'activo'
       AND tipo = 'bono'
       AND fecha BETWEEN ? AND ?`,
    [usuarioId, idempleado, fechaInicio, fechaFin],
  );

  const descuentosRows = await runQuery(
    `SELECT COALESCE(SUM(monto), 0) AS total_descuentos
     FROM rrhh_movimientos
     WHERE usuario_id = ?
       AND idempleado = ?
       AND estado = 'activo'
       AND tipo = 'descuento'
       AND fecha BETWEEN ? AND ?`,
    [usuarioId, idempleado, fechaInicio, fechaFin],
  );

  const salarioBase = Number(salarioRows[0]?.salario_base ?? 0);
  const totalHorasExtras = Number(horasRows[0]?.total_horas_extras ?? 0);
  const totalComisiones = Number(comisionesRows[0]?.total_comisiones ?? 0);
  const totalBonos = Number(bonosRows[0]?.total_bonos ?? 0);
  const totalDescuentos = Number(descuentosRows[0]?.total_descuentos ?? 0);
  const ipsPercent = Number(empleado.aporta_ips ? empleado.porcentaje_ips_empleado : 0);
  const totalIps = (salarioBase * ipsPercent) / 100;
  const totalACobrar =
    salarioBase +
    totalHorasExtras +
    totalComisiones +
    totalBonos -
    totalDescuentos -
    totalIps;

  return {
    idempleado,
    tipo: tipo || 'Normal',
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    salario_base: Number(salarioBase.toFixed(2)),
    total_horas_extras: Number(totalHorasExtras.toFixed(2)),
    total_comisiones: Number(totalComisiones.toFixed(2)),
    total_bonos: Number(totalBonos.toFixed(2)),
    total_descuentos: Number(totalDescuentos.toFixed(2)),
    total_ips: Number(totalIps.toFixed(2)),
    total_a_cobrar: Number(totalACobrar.toFixed(2)),
    estado: 'Pendiente',
  };
};

export const getLiquidacionesByEmpleado = (req, res) => {
  const { idusuarios } = getUserId(req);
  const idempleado = parseInt(req.params.idempleado, 10);
  const { limit, page, offset, search } = parsePagination(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  Liquidacion.findAllPaginatedFiltered(idusuarios, idempleado, limit, offset, search, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener liquidaciones' });

    Liquidacion.countFiltered(idusuarios, idempleado, search, (countErr, total) => {
      if (countErr) return res.status(500).json({ success: false, message: 'Error al contar liquidaciones' });
      res.json({
        success: true,
        data: rows,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    });
  });
};

export const getAllLiquidaciones = (req, res) => {
  const { idusuarios } = getUserId(req);
  const { limit, page, offset, search } = parsePagination(req);
  const nombre = req.query.nombre || '';
  const documento = req.query.documento || '';
  const fechaInicio = req.query.fechaInicio || '1900-01-01';
  const fechaFin = req.query.fechaFin || '9999-12-31';
  const estado = req.query.estado || 'todos';
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  Liquidacion.findAllPaginatedFilteredGlobal(
    idusuarios,
    fechaInicio,
    fechaFin,
    limit,
    offset,
    search,
    nombre,
    documento,
    estado,
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al obtener liquidaciones' });

      Liquidacion.countFilteredGlobal(
        idusuarios,
        fechaInicio,
        fechaFin,
        search,
        nombre,
        documento,
        estado,
        (countErr, total) => {
          if (countErr) return res.status(500).json({ success: false, message: 'Error al contar liquidaciones' });
          res.json({
            success: true,
            data: rows,
            total,
            page,
            totalPages: Math.ceil(total / limit),
          });
        },
      );
    },
  );
};

export const getLiquidacionById = (req, res) => {
  const { idusuarios } = getUserId(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  Liquidacion.findById(idusuarios, req.params.id, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener liquidacion' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Liquidacion no encontrada' });
    res.json({ success: true, data: rows[0] });
  });
};

export const createLiquidacion = (req, res) => {
  const idempleado = Number(req.body?.idempleado);
  const tipo = req.body?.tipo || 'Normal';
  const { idusuarios } = getUserId(req);

  if (!idempleado) {
    return res.status(400).json({ success: false, message: 'idempleado es obligatorio' });
  }
  if (!idusuarios) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  buildPreLiquidacion(idusuarios, idempleado, tipo)
    .then((data) => {
      const payload = { ...data, usuario_id: idusuarios };
      Liquidacion.create(payload, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Error al crear liquidacion' });
        return res.status(201).json({
          success: true,
          message: 'Liquidacion creada correctamente',
          idliquidacion: result.insertId,
          data,
        });
      });
    })
    .catch((error) => {
      console.error('Error al construir liquidacion:', error);
      const status = error.statusCode || 500;
      const message = status === 404 ? error.message : 'Error al crear liquidacion';
      res.status(status).json({ success: false, message });
    });
};

export const preLiquidacion = (req, res) => {
  const idempleado = Number(req.body?.idempleado);
  const tipo = req.body?.tipo || 'Normal';
  const { idusuarios } = getUserId(req);

  if (!idempleado) {
    return res.status(400).json({ success: false, message: 'idempleado es obligatorio' });
  }
  if (!idusuarios) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  buildPreLiquidacion(idusuarios, idempleado, tipo)
    .then((data) => {
      res.json({
        success: true,
        message: 'Pre liquidacion generada correctamente',
        data,
      });
    })
    .catch((error) => {
      console.error('Error al generar pre liquidacion:', error);
      const status = error.statusCode || 500;
      const message = status === 404 ? error.message : 'Error al generar pre liquidacion';
      res.status(status).json({ success: false, message });
    });
};

export const preLiquidacionPDF = async (req, res) => {
  const idempleado = Number(req.body?.idempleado);
  const tipo = req.body?.tipo || 'Normal';
  const { idusuarios } = getUserId(req);

  if (!idempleado) {
    return res.status(400).json({ success: false, message: 'idempleado es obligatorio' });
  }
  if (!idusuarios) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  try {
    const liquidacion = await buildPreLiquidacion(idusuarios, idempleado, tipo);
    const empresa = await getEmpresaForReport();
    const empleado = await getEmpleadoForReport(idempleado);
    const movimientos = await getMovimientosForReport(
      idusuarios,
      idempleado,
      liquidacion.fecha_inicio,
      liquidacion.fecha_fin,
    );

    const datosReporte = {
      empresa,
      reporte: { titulo: 'Pre liquidacion' },
      empleado,
      liquidacion: {
        ...liquidacion,
        fecha_inicio: formatDate(liquidacion.fecha_inicio),
        fecha_fin: formatDate(liquidacion.fecha_fin),
      },
      detalles: [],
      movimientos,
    };

    const reportePDFBase64 = await generateReportLiquidacion(datosReporte);
    if (!reportePDFBase64) {
      return res.status(500).json({ success: false, message: 'Error al generar PDF de pre liquidacion' });
    }

    return res.json({
      success: true,
      message: 'Pre liquidacion PDF generada correctamente',
      reportePDFBase64,
      datosReporte,
    });
  } catch (error) {
    console.error('Error al generar PDF de pre liquidacion:', error);
    const status = error.statusCode || 500;
    const message = status === 404 ? error.message : 'Error al generar PDF de pre liquidacion';
    return res.status(status).json({ success: false, message });
  }
};

export const liquidacionPDFById = (req, res) => {
  const { idusuarios } = getUserId(req);
  const id = req.params.id;
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  Liquidacion.findById(idusuarios, id, async (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener liquidacion' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Liquidacion no encontrada' });

    try {
      const l = rows[0];
      const empresa = await getEmpresaForReport();
      const detalles = await getDetallesForReport(l.idliquidacion);
      const movimientos = await getMovimientosForReport(
        idusuarios,
        l.idempleado,
        toSqlDate(l.fecha_inicio),
        toSqlDate(l.fecha_fin),
      );

      const datosReporte = {
        empresa,
        reporte: { titulo: 'Liquidacion' },
        empleado: {
          idempleado: l.idempleado,
          nombre: l.nombre || 'N/A',
          apellido: l.apellido || '',
          cedula: l.cedula || 'N/A',
        },
        liquidacion: {
          ...l,
          fecha_inicio: formatDate(l.fecha_inicio),
          fecha_fin: formatDate(l.fecha_fin),
        },
        detalles,
        movimientos,
      };

      const reportePDFBase64 = await generateReportLiquidacion(datosReporte);
      if (!reportePDFBase64) {
        return res.status(500).json({ success: false, message: 'Error al generar PDF de liquidacion' });
      }

      return res.json({
        success: true,
        message: 'Liquidacion PDF generada correctamente',
        reportePDFBase64,
        datosReporte,
      });
    } catch (pdfError) {
      console.error('Error al generar PDF de liquidacion:', pdfError);
      return res.status(500).json({ success: false, message: 'Error al generar PDF de liquidacion' });
    }
  });
};

export const updateTotalesLiquidacion = (req, res) => {
  Liquidacion.updateTotales(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al actualizar totales de liquidacion' });
    res.json({ success: true, message: 'Totales de liquidacion actualizados correctamente' });
  });
};

export const updateEstadoLiquidacion = (req, res) => {
  const rawEstado = req.body?.estado;
  if (!rawEstado) return res.status(400).json({ success: false, message: 'estado es obligatorio' });

  const allowed = ['Pendiente', 'Pagada', 'Anulada'];
  const normalized =
    typeof rawEstado === 'string'
      ? rawEstado.trim().toLowerCase()
      : String(rawEstado).trim().toLowerCase();

  const mapped =
    normalized === 'pendiente'
      ? 'Pendiente'
      : normalized === 'pagada' || normalized === 'pagado'
        ? 'Pagada'
        : normalized === 'anulada' || normalized === 'anulado'
          ? 'Anulada'
          : null;

  if (!mapped || !allowed.includes(mapped)) {
    return res.status(400).json({
      success: false,
      message: `estado invalido. Valores permitidos: ${allowed.join(', ')}`,
    });
  }

  Liquidacion.updateEstado(req.params.id, mapped, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al actualizar estado de liquidacion' });
    res.json({ success: true, message: 'Estado de liquidacion actualizado correctamente' });
  });
};

export const deleteLiquidacion = (req, res) => {
  Liquidacion.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al eliminar liquidacion' });
    res.json({ success: true, message: 'Liquidacion eliminada correctamente' });
  });
};
