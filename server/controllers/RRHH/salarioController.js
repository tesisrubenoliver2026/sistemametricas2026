import Salario from '../../models/RRHH/Salario.js';
import { getUserId } from '../../utils/getUserId.js';

const parsePagination = (req) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  return { limit, page, offset, search };
};

export const getAllSalarios = (req, res) => {
  const { idusuarios } = getUserId(req);
  const { limit, page, offset, search } = parsePagination(req);
  const nombre = req.query.nombre || '';
  const documento = req.query.documento || req.query.cedula || '';
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  Salario.findAllPaginatedFilteredGlobal(idusuarios, limit, offset, search, nombre, documento, (err, rows) => {
    if (err) {
      console.error('Error al obtener salarios:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener salarios' });
    }

    Salario.countFilteredGlobal(idusuarios, search, nombre, documento, (countErr, total) => {
      if (countErr) {
        console.error('Error al contar salarios:', countErr);
        return res.status(500).json({ success: false, message: 'Error al contar salarios' });
      }

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

export const getSalariosByEmpleado = (req, res) => {
  const { idusuarios } = getUserId(req);
  const idempleado = parseInt(req.params.idempleado, 10);
  const { limit, page, offset, search } = parsePagination(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  Salario.findAllPaginatedFiltered(idusuarios, idempleado, limit, offset, search, (err, rows) => {
    if (err) {
      console.error('Error al obtener salarios:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener salarios' });
    }

    Salario.countFiltered(idusuarios, idempleado, search, (countErr, total) => {
      if (countErr) {
        console.error('Error al contar salarios:', countErr);
        return res.status(500).json({ success: false, message: 'Error al contar salarios' });
      }

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

export const getSalarioById = (req, res) => {
  const { idusuarios } = getUserId(req);
  const { id } = req.params;
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  Salario.findById(idusuarios, id, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener salario' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Salario no encontrado' });
    res.json({ success: true, data: rows[0] });
  });
};

export const getSalarioVigenteByEmpleado = (req, res) => {
  const { idusuarios } = getUserId(req);
  const idempleado = parseInt(req.params.idempleado, 10);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  Salario.getVigenteByEmpleado(idusuarios, idempleado, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al obtener salario vigente' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'No hay salario vigente' });
    res.json({ success: true, data: rows[0] });
  });
};

export const createSalario = (req, res) => {
  const data = req.body;
  const { idusuarios } = getUserId(req);
  if (!data.idempleado || !data.salario_base || !data.fecha_inicio) {
    return res.status(400).json({ success: false, message: 'idempleado, salario_base y fecha_inicio son obligatorios' });
  }
  if (!idusuarios) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  const payload = { ...data, usuario_id: idusuarios };

  Salario.create(payload, (err, result) => {
    if (err) {
      console.error('Error al crear salario:', err);
      return res.status(500).json({ success: false, message: 'Error al crear salario' });
    }
    res.status(201).json({ success: true, message: 'Salario creado correctamente', idsalario: result.insertId });
  });
};

export const closeSalarioVigente = (req, res) => {
  const { idempleado } = req.params;
  const { fecha_fin } = req.body;
  if (!fecha_fin) return res.status(400).json({ success: false, message: 'fecha_fin es obligatoria' });

  Salario.closeVigente(idempleado, fecha_fin, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al cerrar salario vigente' });
    res.json({ success: true, message: 'Salario vigente cerrado correctamente' });
  });
};

export const updateSalario = (req, res) => {
  const { id } = req.params;
  Salario.update(id, req.body, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al actualizar salario' });
    res.json({ success: true, message: 'Salario actualizado correctamente' });
  });
};

export const deleteSalario = (req, res) => {
  const { id } = req.params;
  Salario.delete(id, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al eliminar salario' });
    res.json({ success: true, message: 'Salario eliminado correctamente' });
  });
};
