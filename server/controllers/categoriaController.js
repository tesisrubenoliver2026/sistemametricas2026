import Categoria from '../models/Producto/Categoria.js';
import Funcionario from '../models/Funcionario.js';
import { getUserId } from '../utils/getUserId.js';

// Listar categorías con filtro por usuario
export const getAllCategorias = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  const { idusuarios, idfuncionario } = getUserId(req);

  console.log('📋 getAllCategorias - Usuario:', { idusuarios, idfuncionario });

  // Si es funcionario, solo ve sus registros
  if (idfuncionario && !idusuarios) {
    return Categoria.countFilteredByUser(null, idfuncionario, search, (err, total) => {
      if (err) return res.status(500).json({ error: err });

      Categoria.findAllPaginatedFilteredByUser(null, idfuncionario, limit, offset, search, (err, data) => {
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

    return Categoria.countFilteredByUser(idusuarios, funcionariosIds, search, (err, total) => {
      if (err) return res.status(500).json({ error: err });

      Categoria.findAllPaginatedFilteredByUser(idusuarios, funcionariosIds, limit, offset, search, (err, data) => {
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

export const getCategoriaById = (req, res) => {
  const id = req.params.id;
  Categoria.findById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]);
  });
};

export const createCategoria = (req, res) => {
  const { categoria, estado } = req.body;

  if (!categoria || categoria.trim() === '') {
    return res.status(400).json({
      error: 'El campo "categoría" es obligatorio. Verifique e intente nuevamente.',
    });
  }

  const { idusuarios, idfuncionario } = getUserId(req);

  console.log('📝 createCategoria - Guardando con:', { idusuarios, idfuncionario });

  Categoria.create({
    categoria,
    estado,
    idusuario: idusuarios || null,
    idfuncionario: idfuncionario || null
  }, (err, result) => {
    if (err) return res.status(500).json({ error: err });

    res.status(201).json({
      message: '✅ Categoría creada con éxito',
      id: result.insertId,
    });
  });
};

export const updateCategoria = (req, res) => {
  const id = req.params.id;
  Categoria.update(id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Categoría actualizada' });
  });
};

export const deleteCategoria = (req, res) => {
  const id = req.params.id;
  Categoria.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Categoría eliminada (soft delete)' });
  });
};
