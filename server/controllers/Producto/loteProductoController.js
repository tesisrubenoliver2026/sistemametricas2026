// controllers/Producto/loteProductoController.js
import LoteProducto from '../../models/LoteProducto.js';

/**
 * Obtener lotes de un producto con stock disponible
 * Para usar en el selector de lotes en ventas
 */
export const getLotesByProducto = (req, res) => {
  const { idproducto } = req.params;

  if (!idproducto) {
    return res.status(400).json({ error: '❌ idproducto es requerido' });
  }

  LoteProducto.findAllByProducto(idproducto, (err, lotes) => {
    if (err) {
      console.error('❌ Error al obtener lotes del producto:', err);
      return res.status(500).json({ error: '❌ Error al obtener lotes del producto' });
    }

    // Filtrar solo lotes con stock disponible para ventas (disponible o parcial)
    const lotesDisponibles = lotes.filter(lote =>
      lote.stock_actual > 0 && (lote.estado === 'disponible' || lote.estado === 'parcial')
    );

    res.json({ lotes: lotesDisponibles });
  });
};
