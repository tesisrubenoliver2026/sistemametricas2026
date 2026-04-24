import MovimientoRRHH from '../../models/RRHH/MovimientoRRHH.js';
import { getUserId } from '../../utils/getUserId.js';

const parseQuery = (req) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const fechaInicio = req.query.fechaInicio || '1900-01-01';
  const fechaFin = req.query.fechaFin || '2999-12-31';
  const tipo = req.query.tipo || 'todos';
  const estado = req.query.estado || 'todos';
  return { limit, page, offset, search, fechaInicio, fechaFin, tipo, estado };
};

const formatFecha = (value) => {
  if (!value) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
};

const mapMovimiento = (row) => ({
  ...row,
  fecha: formatFecha(row.fecha),
});

export const getAllMovimientosRRHH = (req, res) => {
  const { idusuarios } = getUserId(req);
  const { limit, page, offset, search, fechaInicio, fechaFin, tipo, estado } = parseQuery(req);
  const nombre = req.query.nombre || '';
  const documento = req.query.documento || req.query.cedula || '';
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  MovimientoRRHH.findAllPaginatedFilteredGlobal(
    idusuarios,
    fechaInicio,
    fechaFin,
    limit,
    offset,
    search,
    nombre,
    documento,
    tipo,
    estado,
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al obtener movimientos RRHH' });
      const formattedRows = rows.map(mapMovimiento);

      MovimientoRRHH.countFilteredGlobal(
        idusuarios,
        fechaInicio,
        fechaFin,
        search,
        nombre,
        documento,
        tipo,
        estado,
        (countErr, total) => {
          if (countErr) return res.status(500).json({ success: false, message: 'Error al contar movimientos RRHH' });
          res.json({
            success: true,
            data: formattedRows,
            total,
            page,
            totalPages: Math.ceil(total / limit),
          });
        },
      );
    },
  );
};

export const getMovimientosRRHHByEmpleado = (req, res) => {
  const { idusuarios } = getUserId(req);
  const idempleado = parseInt(req.params.idempleado, 10);
  const { limit, page, offset, search, fechaInicio, fechaFin, tipo, estado } = parseQuery(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  MovimientoRRHH.findAllPaginatedFiltered(
    idusuarios,
    idempleado,
    fechaInicio,
    fechaFin,
    limit,
    offset,
    search,
    tipo,
    estado,
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al obtener movimientos RRHH' });
      const formattedRows = rows.map(mapMovimiento);

      MovimientoRRHH.countFiltered(
        idusuarios,
        idempleado,
        fechaInicio,
        fechaFin,
        search,
        tipo,
        estado,
        (countErr, total) => {
          if (countErr) return res.status(500).json({ success: false, message: 'Error al contar movimientos RRHH' });
          res.json({
            success: true,
            data: formattedRows,
            total,
            page,
            totalPages: Math.ceil(total / limit),
          });
        },
      );
    },
  );
};

export const getMovimientoRRHHById = (req, res) => {
  const { idusuarios } = getUserId(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  MovimientoRRHH.findById(idusuarios, req.params.id, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener movimiento RRHH' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Movimiento RRHH no encontrado' });
    res.json({ success: true, data: mapMovimiento(rows[0]) });
  });
};

export const createMovimientoRRHH = (req, res) => {
  const data = req.body;
  const { idusuarios } = getUserId(req);

  if (!data.idempleado || !data.fecha || !data.tipo || !data.concepto || data.monto === undefined || data.monto === null) {
    return res.status(400).json({
      success: false,
      message: 'idempleado, fecha, tipo, concepto y monto son obligatorios',
    });
  }
  if (data.tipo !== 'bono' && data.tipo !== 'descuento') {
    return res.status(400).json({ success: false, message: 'tipo debe ser bono o descuento' });
  }
  if (!idusuarios) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  const payload = { ...data, usuario_id: idusuarios };

  MovimientoRRHH.create(payload, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al crear movimiento RRHH' });
    res.status(201).json({
      success: true,
      message: 'Movimiento RRHH creado correctamente',
      idmovimiento: result.insertId,
    });
  });
};

export const updateMovimientoRRHH = (req, res) => {
  const { idusuarios } = getUserId(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  const data = req.body || {};
  if (data.tipo && data.tipo !== 'bono' && data.tipo !== 'descuento') {
    return res.status(400).json({ success: false, message: 'tipo debe ser bono o descuento' });
  }
  MovimientoRRHH.update(idusuarios, req.params.id, data, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al actualizar movimiento RRHH' });
    res.json({ success: true, message: 'Movimiento RRHH actualizado correctamente' });
  });
};

export const deleteMovimientoRRHH = (req, res) => {
  const { idusuarios } = getUserId(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  MovimientoRRHH.anular(idusuarios, req.params.id, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al anular movimiento RRHH' });
    res.json({ success: true, message: 'Movimiento RRHH anulado correctamente' });
  });
};

