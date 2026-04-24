// controllers/Ventas/helpers/restarStockDirecto.js
import LoteProducto from '../../../models/LoteProducto.js';
import Producto from '../../../models/Producto/Producto.js';

export const restarStockDirecto = async (idproducto, cantidadSolicitada) => {
  return new Promise((resolve, reject) => {
    // Primero verificar el stock del producto
    Producto.findById(idproducto, (errProd, productos) => {
      if (errProd) return reject(`❌ Error al obtener producto: ${errProd}`);
      if (!productos || !productos.length) {
        return reject(`❌ Producto ${idproducto} no encontrado`);
      }

      const producto = productos[0];
      console.log(`🔍 Producto ${idproducto} encontrado: Stock=${producto.stock}, Unidad=${producto.unidad_medida}`);

      // ✅ CAMBIO: Usar lotes_producto en lugar de detalle_compra
      LoteProducto.findDisponiblesByProducto(idproducto, async (err, lotes) => {
        if (err) return reject(`❌ Error al obtener lotes: ${err}`);

        console.log(`📦 Lotes disponibles para producto ${idproducto}:`, lotes.length);

        if (lotes.length === 0) {
          // DEBUG: Buscar todos los lotes del producto sin filtros para ver por qué no aparecen
          LoteProducto.findAllByProducto(idproducto, (errDebug, todosLotes) => {
            if (!errDebug && todosLotes) {
              console.log(`🔍 DEBUG - Todos los lotes del producto ${idproducto}:`, todosLotes.map(l => ({
                idlote: l.idlote,
                numero_lote: l.numero_lote,
                stock_actual: l.stock_actual,
                estado: l.estado,
                deleted_at: l.deleted_at,
                fecha_vencimiento: l.fecha_vencimiento
              })));
            }
          });

          console.error(`❌ No hay lotes disponibles para este producto. El producto existe con stock ${producto.stock} pero no tiene lotes disponibles.`);
          console.error(`💡 Solución: Este producto necesita ser comprado primero para generar lotes.`);
          return reject(`❌ No hay lotes disponibles para producto ${idproducto}`);
        }

        console.log(`📊 Stock disponible por lote (FIFO):`, lotes.map(l => ({
          idlote: l.idlote,
          numero_lote: l.numero_lote,
          stock: l.stock_actual,
          precio_compra: l.precio_compra,
          vencimiento: l.fecha_vencimiento
        })));

        let cantidadRestante = parseFloat(cantidadSolicitada);
        const resultados = [];

      for (const lote of lotes) {
        if (cantidadRestante <= 0) break;

        const stockDisponible = parseFloat(lote.stock_actual);
        const aDescontar = Math.min(cantidadRestante, stockDisponible);
        // ✅ Obtener precio_compra directamente del lote
        const precioCompraLote = parseFloat(lote.precio_compra) || 0;

        console.log(`🔄 Lote ${lote.numero_lote} (ID: ${lote.idlote}): Disponible=${stockDisponible}, A descontar=${aDescontar}, Precio compra=${precioCompraLote}`);

        try {
          // ✅ CAMBIO: Usar LoteProducto.restarStock en lugar de DetalleCompra
          await new Promise((res, rej) =>
            LoteProducto.restarStock(lote.idlote, aDescontar, (e) => {
              if (e) {
                console.error(`❌ Error al restar stock del lote ${lote.idlote}:`, e);
                return rej(e);
              }
              res();
            })
          );

          // ✅ También actualizar stock del producto
          await new Promise((res) =>
            Producto.restarStock(idproducto, aDescontar, (e) => res())
          );

          resultados.push({
            idlote: lote.idlote,
            numero_lote: lote.numero_lote,
            iddetalle_compra: lote.iddetalle_compra,
            descontado: aDescontar,
            // ✅ NUEVO: Incluir precio_compra del lote para cálculo de ganancia
            precio_compra: precioCompraLote,
          });

          cantidadRestante -= aDescontar;
        } catch (error) {
          console.error(`❌ Error en lote ${lote.idlote}`, error);
        }
      }

      if (cantidadRestante > 0) {
        console.warn(`⚠️ Stock insuficiente para producto ${idproducto}. Faltante: ${cantidadRestante} de ${cantidadSolicitada}`);
      }

        console.log(`✅ Resultado final: ${resultados.length} lotes procesados, total descontado: ${resultados.reduce((acc, r) => acc + r.descontado, 0)}`);
        resolve(resultados);
      });
    });
  });
};
