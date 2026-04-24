import Amonestacion from '../../models/RRHH/Amonestacion.js';
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

const TIPOS_AMONESTACION = new Set(['Verbal', 'Escrita', 'Suspension']);

const normalizeTipoAmonestacion = (tipo) => {
  const tipoValue = (tipo || '').toString().trim().toLowerCase();
  const map = {
    verbal: 'Verbal',
    escrita: 'Escrita',
    suspension: 'Suspension',
    'suspensión': 'Suspension'
  };
  return map[tipoValue] || tipo;
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

const mapAmonestacionFecha = (row) => ({
  ...row,
  fecha: formatFecha(row.fecha)
});

export const getAllAmonestaciones = (req, res) => {
  const { idusuarios } = getUserId(req);
  const { limit, page, offset, search, fechaInicio, fechaFin } = parseQuery(req);
  const nombre = req.query.nombre || '';
  const documento = req.query.documento || req.query.cedula || '';
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  Amonestacion.findAllPaginatedFilteredGlobal(
    idusuarios,
    fechaInicio,
    fechaFin,
    limit,
    offset,
    search,
    nombre,
    documento,
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: 'Error al obtener amonestaciones' });
      const formattedRows = rows.map(mapAmonestacionFecha);

      Amonestacion.countFilteredGlobal(idusuarios, fechaInicio, fechaFin, search, nombre, documento, (countErr, total) => {
        if (countErr) return res.status(500).json({ success: false, message: 'Error al contar amonestaciones' });
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

export const getAmonestacionesByEmpleado = (req, res) => {
  const { idusuarios } = getUserId(req);
  const idempleado = parseInt(req.params.idempleado, 10);
  const { limit, page, offset, search, fechaInicio, fechaFin } = parseQuery(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  Amonestacion.findAllPaginatedFiltered(idusuarios, idempleado, fechaInicio, fechaFin, limit, offset, search, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener amonestaciones' });
    const formattedRows = rows.map(mapAmonestacionFecha);

    Amonestacion.countFiltered(idusuarios, idempleado, fechaInicio, fechaFin, search, (countErr, total) => {
      if (countErr) return res.status(500).json({ success: false, message: 'Error al contar amonestaciones' });
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

export const getAmonestacionById = (req, res) => {
  const { idusuarios } = getUserId(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  Amonestacion.findById(idusuarios, req.params.id, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener amonestacion' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Amonestacion no encontrada' });
    res.json({ success: true, data: mapAmonestacionFecha(rows[0]) });
  });
};

export const createAmonestacion = (req, res) => {
  const data = req.body;
  const { idusuarios } = getUserId(req);
  if (!data.idempleado || !data.fecha || !data.tipo) {
    return res.status(400).json({ success: false, message: 'idempleado, fecha y tipo son obligatorios' });
  }
  if (!idusuarios) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }
  const tipoNormalizado = normalizeTipoAmonestacion(data.tipo);
  if (!TIPOS_AMONESTACION.has(tipoNormalizado)) {
    return res.status(400).json({
      success: false,
      message: 'tipo invalido. Valores permitidos: Verbal, Escrita, Suspension'
    });
  }
  const payload = { ...data, tipo: tipoNormalizado, usuario_id: idusuarios };

  Amonestacion.create(payload, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al crear amonestacion' });
    res.status(201).json({ success: true, message: 'Amonestacion creada correctamente', idamonestacion: result.insertId });
  });
};

export const updateAmonestacion = (req, res) => {
  const data = req.body;
  const tipoNormalizado = normalizeTipoAmonestacion(data.tipo);
  if (!TIPOS_AMONESTACION.has(tipoNormalizado)) {
    return res.status(400).json({
      success: false,
      message: 'tipo invalido. Valores permitidos: Verbal, Escrita, Suspension'
    });
  }
  const payload = { ...data, tipo: tipoNormalizado };

  Amonestacion.update(req.params.id, payload, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al actualizar amonestacion' });
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Amonestacion no encontrada' });
    }
    res.json({ success: true, message: 'Amonestacion actualizada correctamente' });
  });
};

export const deleteAmonestacion = (req, res) => {
  Amonestacion.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al eliminar amonestacion' });
    res.json({ success: true, message: 'Amonestacion eliminada correctamente' });
  });
};
