import Comision from '../../models/RRHH/Comision.js';
import { getUserId } from '../../utils/getUserId.js';

const parseQuery = (req) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const fechaInicio = req.query.fechaInicio || '1900-01-01';
  const fechaFin = req.query.fechaFin || '2999-12-31';
  return { limit, page, offset, search, fechaInicio, fechaFin };
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

const mapComisionFecha = (row) => ({
  ...row,
  fecha: formatFecha(row.fecha)
});

export const getAllComisiones = (req, res) => {
  const { idusuarios } = getUserId(req);
  const { limit, page, offset, search, fechaInicio, fechaFin } = parseQuery(req);
  const nombre = req.query.nombre || '';
  const documento = req.query.documento || req.query.cedula || '';
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  Comision.findAllPaginatedFilteredGlobal(
    idusuarios,
    fechaInicio,
    fechaFin,
    limit,
    offset,
    search,
    nombre,
    documento,
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al obtener comisiones' });
      const formattedRows = rows.map(mapComisionFecha);

      Comision.countFilteredGlobal(idusuarios, fechaInicio, fechaFin, search, nombre, documento, (countErr, total) => {
        if (countErr) return res.status(500).json({ success: false, message: 'Error al contar comisiones' });
        res.json({
          success: true,
          data: formattedRows,
          total,
          page,
          totalPages: Math.ceil(total / limit)
        });
      });
    }
  );
};

export const getComisionesByEmpleado = (req, res) => {
  const { idusuarios } = getUserId(req);
  const idempleado = parseInt(req.params.idempleado, 10);
  const { limit, page, offset, search, fechaInicio, fechaFin } = parseQuery(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  Comision.findAllPaginatedFiltered(idusuarios, idempleado, fechaInicio, fechaFin, limit, offset, search, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener comisiones' });
    const formattedRows = rows.map(mapComisionFecha);

    Comision.countFiltered(idusuarios, idempleado, fechaInicio, fechaFin, search, (countErr, total) => {
      if (countErr) return res.status(500).json({ success: false, message: 'Error al contar comisiones' });
      res.json({
        success: true,
        data: formattedRows,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    });
  });
};

export const getComisionById = (req, res) => {
  const { idusuarios } = getUserId(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  Comision.findById(idusuarios, req.params.id, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener comision' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Comision no encontrada' });
    res.json({ success: true, data: mapComisionFecha(rows[0]) });
  });
};

export const createComision = (req, res) => {
  const data = req.body;
  const { idusuarios } = getUserId(req);
  if (!data.idempleado || !data.fecha || !data.monto_venta || !data.porcentaje || !data.monto_comision) {
    return res.status(400).json({ success: false, message: 'idempleado, fecha, monto_venta, porcentaje y monto_comision son obligatorios' });
  }
  if (!idusuarios) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  const payload = { ...data, usuario_id: idusuarios };

  Comision.create(payload, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al crear comision' });
    res.status(201).json({ success: true, message: 'Comision creada correctamente', idcomision: result.insertId });
  });
};

export const updateComision = (req, res) => {
  Comision.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al actualizar comision' });
    res.json({ success: true, message: 'Comision actualizada correctamente' });
  });
};

export const deleteComision = (req, res) => {
  Comision.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al eliminar comision' });
    res.json({ success: true, message: 'Comision eliminada correctamente' });
  });
};
