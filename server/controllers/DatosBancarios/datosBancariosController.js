import DatosBancarios from '../../models/DatosBancarios/DatosBancarios.js';
import Funcionario from '../../models/Funcionario.js';
import { getUserId } from '../../utils/getUserId.js';

export const getAllDatosBancariosPaginated = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  const { idusuarios, idfuncionario } = getUserId(req);

  console.log('📋 getAllDatosBancariosPaginated - Usuario:', { idusuarios, idfuncionario });

  // Si es funcionario, solo ve sus registros
  if (idfuncionario && !idusuarios) {
    return DatosBancarios.countFilteredByUserV2(null, idfuncionario, search, (err, total) => {
      if (err) return res.status(500).json({ error: err });

      DatosBancarios.findAllPaginatedFilteredByUserV2(null, idfuncionario, limit, offset, search, (err, data) => {
        if (err) return res.status(500).json({ error: err });

        const totalPages = Math.ceil(total / limit);
        res.json({
          data,
          totalItems: total,
          totalPages,
          currentPage: page,
        });
      });
    });
  }

  // Si es usuario, buscar sus funcionarios
  Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
    if (err) {
      console.error('❌ Error al buscar funcionarios:', err);
      return res.status(500).json({ error: 'Error al buscar funcionarios' });
    }

    const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');
    console.log('👥 Funcionarios relacionados:', funcionariosIds || 'ninguno');

    return DatosBancarios.countFilteredByUserV2(idusuarios, funcionariosIds, search, (err, total) => {
      if (err) return res.status(500).json({ error: err });

      DatosBancarios.findAllPaginatedFilteredByUserV2(idusuarios, funcionariosIds, limit, offset, search, (err, data) => {
        if (err) return res.status(500).json({ error: err });

        const totalPages = Math.ceil(total / limit);
        res.json({
          data,
          totalItems: total,
          totalPages,
          currentPage: page,
        });
      });
    });
  });
};

export const getDatosBancariosByUser = (req, res) => {
  // Validar usuario autenticado
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  // Función helper que ejecuta la búsqueda con los IDs apropiados
  function buscarDatosBancarios(idsusuarios, idfuncionariosIds) {
    DatosBancarios.findAllPaginatedFilteredByUserV2(idsusuarios, idfuncionariosIds, limit, offset, search, (err, datosBancarios) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener datos bancarios'
        });
      }

      DatosBancarios.countFilteredByUserV2(idsusuarios, idfuncionariosIds, search, (err, total) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: 'Error al contar datos bancarios'
          });
        }

        res.json({
          success: true,
          data: datosBancarios,
          total,
          page,
          totalPages: Math.ceil(total / limit)
        });
      });
    });
  }

  // Lógica condicional según el tipo de usuario
  if (tipo === 'funcionario') {
    // Funcionario: ver sus propios datos bancarios + los de su usuario administrador
    buscarDatosBancarios(idusuarios, idfuncionario);
  } else {
    // Usuario administrador: ver sus datos bancarios + los de sus funcionarios
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: err });

      const funcionariosIds = funcionarios.length > 0
        ? funcionarios.map(f => f.idfuncionario).join(',')
        : null;

      buscarDatosBancarios(idusuarios, funcionariosIds);
    });
  }
};

export const editarDatosBancarios = (req, res) => {
  const { id } = req.params;
  const data = req.body;

  DatosBancarios.update(id, data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar dato bancario', detalle: err });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Dato bancario no encontrado o ya eliminado' });
    }

    res.json({ mensaje: 'Dato bancario actualizado correctamente' });
  });
};

export const listarDatosBancarios = (req, res) => {
  DatosBancarios.findAll((err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener datos bancarios', detalle: err });
    res.json(results);
  });
};

export const obtenerDatoBancario = (req, res) => {
  const { id } = req.params;
  DatosBancarios.findById(id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al buscar el dato bancario', detalle: err });
    if (results.length === 0) return res.status(404).json({ error: 'Dato bancario no encontrado' });
    res.json(results[0]);
  });
};

export const crearDatoBancario = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);

  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({
      success: false,
      error: 'Usuario no autenticado'
    });
  }

  const data = { ...req.body, idusuario: idusuarios, idfuncionario };

  DatosBancarios.create(data, (err, result) => {
    if (err) {
      console.error('Error al crear dato bancario:', err);
      return res.status(500).json({
        success: false,
        error: 'Error al crear dato bancario',
        detalle: err
      });
    }
    res.status(201).json({
      success: true,
      mensaje: 'Dato bancario creado exitosamente',
      id: result.insertId
    });
  });
};

export const eliminarDatoBancario = (req, res) => {
  const { id } = req.params;
  DatosBancarios.softDelete(id, (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar', detalle: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Dato no encontrado o ya eliminado' });
    res.json({ mensaje: 'Dato bancario eliminado correctamente (soft delete)' });
  });
};
