import DetalleCompra from '../../models/Compra/DetalleCompra.js';

export const simularDetallesVenta = async (req, res) => {
  const { productos } = req.body;

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'Se requiere una lista de productos con cantidad' });
  }

  try {
    const detallesTotales = [];

    for (const item of productos) {
      const { idproducto, cantidad } = item;

      // Obtener lotes disponibles
      const lotes = await new Promise((resolve, reject) => {
        DetalleCompra.findByProducto(idproducto, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      let cantidadRestante = parseFloat(cantidad);
      const usados = [];

      for (const lote of lotes) {
        if (cantidadRestante <= 0) break;

        const disponible = parseFloat(lote.stock_restante);
        const aUsar = Math.min(cantidadRestante, disponible);

        if (aUsar > 0) {
          usados.push({
            iddetalle: lote.iddetalle,
            idproducto: lote.idproducto,
            cantidad: aUsar,
            fecha_vencimiento: lote.fecha_vencimiento,
            precio_compra: lote.precio_compra,
            precio_venta: lote.precio_venta, // ✅ Agregar
            unidad_medida: lote.unidad_medida,
            nombre_producto: lote.nombre_producto,
            iva: lote.iva,
            // ✅ NUEVOS CAMPOS para productos CAJA
            precio_venta_caja: lote.precio_venta_caja || null,
            cant_p_caja: lote.cant_p_caja || null,
            precio_compra_caja: lote.precio_compra_caja || null,
          });
          cantidadRestante -= aUsar;
        }
      }

      if (cantidadRestante > 0) {
        return res.status(400).json({
          error: `Stock insuficiente para el producto ${item.idproducto}`,
          producto: item.idproducto
        });
      }

      detallesTotales.push(...usados);
    }

    return res.status(200).json({ detalles: detallesTotales });
  } catch (error) {
    console.error('❌ Error al simular detalles de venta:', error);
    return res.status(500).json({ error: 'Error interno al simular detalles' });
  }
};