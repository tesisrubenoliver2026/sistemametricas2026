import HoraExtra from '../../models/RRHH/HoraExtra.js';
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

const mapHoraExtraFecha = (row) => ({
  ...row,
  fecha: formatFecha(row.fecha)
});

export const getAllHorasExtras = (req, res) => {
  const { idusuarios } = getUserId(req);
  const { limit, page, offset, search, fechaInicio, fechaFin } = parseQuery(req);
  const nombre = req.query.nombre || '';
  const documento = req.query.documento || req.query.cedula || '';
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  HoraExtra.findAllPaginatedFilteredGlobal(
    idusuarios,
    fechaInicio,
    fechaFin,
    limit,
    offset,
    search,
    nombre,
    documento,
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al obtener horas extras' });
      const formattedRows = rows.map(mapHoraExtraFecha);

      HoraExtra.countFilteredGlobal(idusuarios, fechaInicio, fechaFin, search, nombre, documento, (countErr, total) => {
        if (countErr) return res.status(500).json({ success: false, message: 'Error al contar horas extras' });
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

export const getHorasExtrasByEmpleado = (req, res) => {
  const { idusuarios } = getUserId(req);
  const idempleado = parseInt(req.params.idempleado, 10);
  const { limit, page, offset, search, fechaInicio, fechaFin } = parseQuery(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  HoraExtra.findAllPaginatedFiltered(idusuarios, idempleado, fechaInicio, fechaFin, limit, offset, search, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener horas extras' });
    const formattedRows = rows.map(mapHoraExtraFecha);

    HoraExtra.countFiltered(idusuarios, idempleado, fechaInicio, fechaFin, search, (countErr, total) => {
      if (countErr) return res.status(500).json({ success: false, message: 'Error al contar horas extras' });
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

export const getHoraExtraById = (req, res) => {
  const { idusuarios } = getUserId(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  HoraExtra.findById(idusuarios, req.params.id, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener hora extra' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Hora extra no encontrada' });
    res.json({ success: true, data: mapHoraExtraFecha(rows[0]) });
  });
};

export const createHoraExtra = (req, res) => {
  const data = req.body;
  const { idusuarios } = getUserId(req);
  const aprobadoPor =
    req.user?.login ||
    (req.user?.idfuncionario ? `funcionario:${req.user.idfuncionario}` : null) ||
    (req.user?.idusuarios ? `usuario:${req.user.idusuarios}` : null) ||
    (req.user?.idusuario ? `usuario:${req.user.idusuario}` : null);

  if (!data.idempleado || !data.fecha || !data.cantidad_horas || !data.tipo) {
    return res.status(400).json({ success: false, message: 'idempleado, fecha, cantidad_horas y tipo son obligatorios' });
  }
  if (!aprobadoPor || !idusuarios) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  const payload = {
    ...data,
    aprobado_por: aprobadoPor,
    usuario_id: idusuarios
  };

  HoraExtra.create(payload, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al crear hora extra' });
    res.status(201).json({ success: true, message: 'Hora extra creada correctamente', idhextra: result.insertId });
  });
};

export const updateHoraExtra = (req, res) => {
  HoraExtra.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al actualizar hora extra' });
    res.json({ success: true, message: 'Hora extra actualizada correctamente' });
  });
};

export const deleteHoraExtra = (req, res) => {
  HoraExtra.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al eliminar hora extra' });
    res.json({ success: true, message: 'Hora extra eliminada correctamente' });
  });
};
