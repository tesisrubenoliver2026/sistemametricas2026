// controllers/Producto/productoDetalleController.js
import ProductoDetalle from '../../models/ProductoDetalle.js';

/**
 * Obtener detalles de un producto
 */
export const getDetalles = (req, res) => {
  const { idproducto } = req.params;

  ProductoDetalle.findByProducto(idproducto, (err, detalles) => {
    if (err) {
      console.error('❌ Error al obtener detalles:', err);
      return res.status(500).json({ error: '❌ Error al obtener detalles del producto' });
    }

    res.json({ detalles });
  });
};

/**
 * Guardar detalles de un producto (reemplaza los existentes)
 */
export const guardarDetalles = (req, res) => {
  const { idproducto, detalles } = req.body;

  if (!idproducto) {
    return res.status(400).json({ error: '❌ idproducto es requerido' });
  }

  if (!Array.isArray(detalles)) {
    return res.status(400).json({ error: '❌ detalles debe ser un array' });
  }

  // Validar que cada detalle tenga los campos requeridos
  for (const detalle of detalles) {
    if (!detalle.atributo || !detalle.valor) {
      return res.status(400).json({
        error: '❌ Cada detalle debe tener atributo y valor'
      });
    }
    if (!detalle.cantidad || detalle.cantidad <= 0) {
      return res.status(400).json({
        error: '❌ Cada detalle debe tener una cantidad válida (mayor a 0)'
      });
    }
  }

  ProductoDetalle.replaceAll(idproducto, detalles, (err, result) => {
    if (err) {
      console.error('❌ Error al guardar detalles:', err);
      return res.status(500).json({ error: '❌ Error al guardar detalles' });
    }

    res.json({
      message: '✅ Detalles guardados correctamente',
      detalles
    });
  });
};

/**
 * Eliminar un detalle específico
 */
export const eliminarDetalle = (req, res) => {
  const { iddetalle } = req.params;

  ProductoDetalle.delete(iddetalle, (err) => {
    if (err) {
      console.error('❌ Error al eliminar detalle:', err);
      return res.status(500).json({ error: '❌ Error al eliminar detalle' });
    }

    res.json({ message: '✅ Detalle eliminado correctamente' });
  });
};
