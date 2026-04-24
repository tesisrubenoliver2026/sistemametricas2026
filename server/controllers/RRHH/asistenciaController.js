import Asistencia from '../../models/RRHH/Asistencia.js';
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

const mapAsistenciaFecha = (row) => ({
  ...row,
  fecha: formatFecha(row.fecha)
});

export const getAllAsistencias = (req, res) => {
  const { idusuarios } = getUserId(req);
  const { limit, page, offset, search, fechaInicio, fechaFin } = parseQuery(req);
  const nombre = req.query.nombre || '';
  const documento = req.query.documento || req.query.cedula || '';
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  Asistencia.findAllPaginatedFilteredGlobal(
    idusuarios,
    fechaInicio,
    fechaFin,
    limit,
    offset,
    search,
    nombre,
    documento,
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al obtener asistencias' });
      const formattedRows = rows.map(mapAsistenciaFecha);

      Asistencia.countFilteredGlobal(idusuarios, fechaInicio, fechaFin, search, nombre, documento, (countErr, total) => {
        if (countErr) return res.status(500).json({ success: false, message: 'Error al contar asistencias' });
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

export const getAsistenciasByEmpleado = (req, res) => {
  const { idusuarios } = getUserId(req);
  const idempleado = parseInt(req.params.idempleado, 10);
  const { limit, page, offset, search, fechaInicio, fechaFin } = parseQuery(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  Asistencia.findAllPaginatedFiltered(idusuarios, idempleado, fechaInicio, fechaFin, limit, offset, search, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener asistencias' });
    const formattedRows = rows.map(mapAsistenciaFecha);

    Asistencia.countFiltered(idusuarios, idempleado, fechaInicio, fechaFin, search, (countErr, total) => {
      if (countErr) return res.status(500).json({ success: false, message: 'Error al contar asistencias' });
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

export const getAsistenciaById = (req, res) => {
  const { idusuarios } = getUserId(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  Asistencia.findById(idusuarios, req.params.id, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener asistencia' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Asistencia no encontrada' });
    res.json({ success: true, data: mapAsistenciaFecha(rows[0]) });
  });
};

export const createAsistencia = (req, res) => {
  const data = req.body;
  const { idusuarios } = getUserId(req);
  if (!data.idempleado || !data.fecha) {
    return res.status(400).json({ success: false, message: 'idempleado y fecha son obligatorios' });
  }
  if (!idusuarios) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  const payload = { ...data, usuario_id: idusuarios };

  Asistencia.create(payload, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al crear asistencia' });
    res.status(201).json({ success: true, message: 'Asistencia creada correctamente', idasistencia: result.insertId });
  });
};

export const createOrUpdateAsistencia = (req, res) => {
  const data = req.body;
  const { idusuarios } = getUserId(req);
  if (!data.idempleado || !data.fecha) {
    return res.status(400).json({ success: false, message: 'idempleado y fecha son obligatorios' });
  }
  if (!idusuarios) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  const payload = { ...data, usuario_id: idusuarios };

  Asistencia.createOrUpdateByFecha(payload, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al guardar asistencia' });
    res.status(201).json({ success: true, message: 'Asistencia guardada correctamente' });
  });
};

export const updateAsistencia = (req, res) => {
  Asistencia.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al actualizar asistencia' });
    res.json({ success: true, message: 'Asistencia actualizada correctamente' });
  });
};

export const deleteAsistencia = (req, res) => {
  Asistencia.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al eliminar asistencia' });
    res.json({ success: true, message: 'Asistencia eliminada correctamente' });
  });
};
