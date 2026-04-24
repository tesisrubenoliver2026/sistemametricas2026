import Empleado from '../../models/RRHH/Empleado.js';
import { getUserId } from '../../utils/getUserId.js';

const parsePagination = (req) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  return { limit, page, offset, search };
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

const mapEmpleadoFechas = (row) => ({
  ...row,
  fecha_nacimiento: formatFecha(row.fecha_nacimiento),
  fecha_ingreso: formatFecha(row.fecha_ingreso)
});

export const getEmpleados = (req, res) => {
  const { idusuarios } = getUserId(req);
  const { limit, page, offset, search } = parsePagination(req);
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  Empleado.findAllPaginatedFiltered(idusuarios, limit, offset, search, (err, empleados) => {
    if (err) {
      console.error('Error al obtener empleados:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener empleados' });
    }

    Empleado.countFiltered(idusuarios, search, (countErr, total) => {
      if (countErr) {
        console.error('Error al contar empleados:', countErr);
        return res.status(500).json({ success: false, message: 'Error al contar empleados' });
      }

      res.json({
        success: true,
        data: empleados.map(mapEmpleadoFechas),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    });
  });
};

export const getEmpleadoById = (req, res) => {
  const { idusuarios } = getUserId(req);
  const { id } = req.params;
  if (!idusuarios) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

  Empleado.findById(idusuarios, id, (err, rows) => {
    if (err) {
      console.error('Error al obtener empleado:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener empleado' });
    }

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }

    res.json({ success: true, data: mapEmpleadoFechas(rows[0]) });
  });
};

export const createEmpleado = (req, res) => {
  const data = req.body;
  const { idusuarios } = getUserId(req);

  if (!data.nombre || !data.apellido || !data.fecha_ingreso) {
    return res.status(400).json({
      success: false,
      message: 'nombre, apellido y fecha_ingreso son obligatorios'
    });
  }
  if (!idusuarios) {
    return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
  }

  const payload = { ...data, usuario_id: idusuarios };

  Empleado.create(payload, (err, result) => {
    if (err) {
      console.error('Error al crear empleado:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'La cedula ya existe' });
      }
      return res.status(500).json({ success: false, message: 'Error al crear empleado' });
    }

    res.status(201).json({
      success: true,
      message: 'Empleado creado correctamente',
      idempleado: result.insertId
    });
  });
};

export const updateEmpleado = (req, res) => {
  const { id } = req.params;
  const data = req.body;

  Empleado.update(id, data, (err) => {
    if (err) {
      console.error('Error al actualizar empleado:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'La cedula ya existe' });
      }
      return res.status(500).json({ success: false, message: 'Error al actualizar empleado' });
    }

    res.json({ success: true, message: 'Empleado actualizado correctamente' });
  });
};

export const changeEstadoEmpleado = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado || !['activo', 'inactivo'].includes(estado)) {
    return res.status(400).json({ success: false, message: 'Estado invalido' });
  }

  Empleado.changeStatus(id, estado, (err) => {
    if (err) {
      console.error('Error al cambiar estado del empleado:', err);
      return res.status(500).json({ success: false, message: 'Error al cambiar estado' });
    }

    res.json({ success: true, message: 'Estado actualizado correctamente' });
  });
};

export const deleteEmpleado = (req, res) => {
  const { id } = req.params;

  Empleado.delete(id, (err) => {
    if (err) {
      console.error('Error al eliminar empleado:', err);
      return res.status(500).json({ success: false, message: 'Error al eliminar empleado' });
    }

    res.json({ success: true, message: 'Empleado eliminado correctamente' });
  });
};
