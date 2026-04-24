import Funcionario from '../models/Funcionario.js';
import bcrypt from 'bcryptjs';
import { getUserId } from '../utils/getUserId.js';

// Obtener funcionarios con paginación y búsqueda
export const getFuncionarios = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  // Solo usuarios administradores pueden ver funcionarios
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para ver otros funcionarios'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  Funcionario.countFilteredByUser(idusuarios, search, (err, total) => {
    if (err) {
      console.error('❌ Error al contar funcionarios:', err);
      return res.status(500).json({ error: 'Error al contar funcionarios' });
    }

    Funcionario.findAllPaginatedFilteredByUser(idusuarios, limit, offset, search, (err, funcionarios) => {
      if (err) {
        console.error('❌ Error al obtener funcionarios:', err);
        return res.status(500).json({ error: 'Error al obtener funcionarios' });
      }

      const totalPages = Math.ceil(total / limit);
      res.json({
        data: funcionarios,
        totalItems: total,
        totalPages,
        currentPage: page
      });
    });
  });
};

// Obtener todos los funcionarios (sin paginación) - para selects
export const getAllFuncionarios = (req, res) => {
  Funcionario.findAll((err, funcionarios) => {
    if (err) {
      console.error('❌ Error al obtener funcionarios:', err);
      return res.status(500).json({ error: 'Error al obtener funcionarios' });
    }
    res.json(funcionarios);
  });
};

// Obtener funcionario por ID
export const getFuncionarioById = (req, res) => {
  const id = req.params.id;

  Funcionario.findById(id, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener funcionario:', err);
      return res.status(500).json({ error: 'Error al obtener funcionario' });
    }

    if (!results.length) {
      return res.status(404).json({ error: 'Funcionario no encontrado' });
    }

    res.json(results[0]);
  });
};

// Crear funcionario
export const createFuncionario = async (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  // Solo usuarios administradores pueden crear funcionarios
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no pueden crear otros funcionarios'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const { nombre, apellido, telefono, tipo_funcionario, login, password, estado, testUser } = req.body;

  // Validaciones
  if (!nombre || !apellido || !tipo_funcionario || !login || !password) {
    return res.status(400).json({
      error: 'Los campos nombre, apellido, tipo_funcionario, login y password son obligatorios'
    });
  }

  // Verificar si el login ya existe
  Funcionario.findByLogin(login, async (err, existing) => {
    if (err) {
      console.error('❌ Error al verificar login:', err);
      return res.status(500).json({ error: 'Error al verificar login' });
    }

    if (existing.length > 0) {
      return res.status(400).json({ error: 'El login ya está en uso' });
    }

    try {
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      const data = {
        idusuarios, // Usar el ID del token en lugar de req.body
        nombre,
        apellido,
        telefono,
        tipo_funcionario,
        login,
        password: hashedPassword,
        estado: estado || 'activo',
        testUser: testUser || false
      };

      Funcionario.create(data, (err, result) => {
        if (err) {
          console.error('❌ Error al crear funcionario:', err);
          return res.status(500).json({ error: 'Error al crear funcionario' });
        }

        res.status(201).json({
          message: '✅ Funcionario creado exitosamente',
          idfuncionario: result.insertId
        });
      });
    } catch (error) {
      console.error('❌ Error al hashear contraseña:', error);
      res.status(500).json({ error: 'Error al procesar la contraseña' });
    }
  });
};

// Actualizar funcionario
export const updateFuncionario = (req, res) => {
  const id = req.params.id;
  const { nombre, apellido, telefono, tipo_funcionario, login, estado } = req.body;

  // Validaciones
  if (!nombre || !apellido || !tipo_funcionario || !login) {
    return res.status(400).json({
      error: 'Los campos nombre, apellido, tipo_funcionario y login son obligatorios'
    });
  }

  // Verificar si el funcionario existe
  Funcionario.findById(id, (err, results) => {
    if (err) {
      console.error('❌ Error al buscar funcionario:', err);
      return res.status(500).json({ error: 'Error al buscar funcionario' });
    }

    if (!results.length) {
      return res.status(404).json({ error: 'Funcionario no encontrado' });
    }

    const funcionarioActual = results[0];

    // Si el login cambió, verificar que no esté en uso
    if (login !== funcionarioActual.login) {
      Funcionario.findByLogin(login, (err, existing) => {
        if (err) {
          console.error('❌ Error al verificar login:', err);
          return res.status(500).json({ error: 'Error al verificar login' });
        }

        if (existing.length > 0) {
          return res.status(400).json({ error: 'El login ya está en uso' });
        }

        // Proceder con la actualización
        actualizarFuncionario();
      });
    } else {
      // Si el login no cambió, actualizar directamente
      actualizarFuncionario();
    }

    function actualizarFuncionario() {
      const data = {
        nombre,
        apellido,
        telefono,
        tipo_funcionario,
        login,
        estado: estado || 'activo'
      };

      Funcionario.update(id, data, (err) => {
        if (err) {
          console.error('❌ Error al actualizar funcionario:', err);
          return res.status(500).json({ error: 'Error al actualizar funcionario' });
        }

        res.json({ message: '✅ Funcionario actualizado exitosamente' });
      });
    }
  });
};

// Actualizar contraseña
export const updatePassword = async (req, res) => {
  const id = req.params.id;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'La contraseña es obligatoria' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    Funcionario.updatePassword(id, hashedPassword, (err) => {
      if (err) {
        console.error('❌ Error al actualizar contraseña:', err);
        return res.status(500).json({ error: 'Error al actualizar contraseña' });
      }

      res.json({ message: '✅ Contraseña actualizada exitosamente' });
    });
  } catch (error) {
    console.error('❌ Error al hashear contraseña:', error);
    res.status(500).json({ error: 'Error al procesar la contraseña' });
  }
};

// Eliminar funcionario (soft delete)
export const deleteFuncionario = (req, res) => {
  const id = req.params.id;

  Funcionario.findById(id, (err, results) => {
    if (err) {
      console.error('❌ Error al buscar funcionario:', err);
      return res.status(500).json({ error: 'Error al buscar funcionario' });
    }

    if (!results.length) {
      return res.status(404).json({ error: 'Funcionario no encontrado' });
    }

    Funcionario.softDelete(id, (err) => {
      if (err) {
        console.error('❌ Error al eliminar funcionario:', err);
        return res.status(500).json({ error: 'Error al eliminar funcionario' });
      }

      res.json({ message: '✅ Funcionario eliminado exitosamente' });
    });
  });
};

// Cambiar estado del funcionario
export const changeStatus = (req, res) => {
  const id = req.params.id;
  const { estado } = req.body;

  if (!estado || !['activo', 'inactivo'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido. Debe ser "activo" o "inactivo"' });
  }

  Funcionario.changeStatus(id, estado, (err) => {
    if (err) {
      console.error('❌ Error al cambiar estado:', err);
      return res.status(500).json({ error: 'Error al cambiar estado' });
    }

    res.json({ message: `✅ Estado actualizado a "${estado}" exitosamente` });
  });
};

// Obtener funcionarios por usuario
export const getFuncionariosByUsuario = (req, res) => {
  const idusuarios = req.params.idusuarios || req.user?.idusuario;

  if (!idusuarios) {
    return res.status(400).json({ error: 'ID de usuario no proporcionado' });
  }

  Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
    if (err) {
      console.error('❌ Error al obtener funcionarios:', err);
      return res.status(500).json({ error: 'Error al obtener funcionarios' });
    }

    res.json(funcionarios);
  });
};
