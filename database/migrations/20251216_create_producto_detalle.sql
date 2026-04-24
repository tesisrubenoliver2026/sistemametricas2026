-- Migración: Crear tabla producto_detalle
-- Fecha: 2025-12-16
-- Descripción: Tabla simple para almacenar detalles/atributos de productos (color, sabor, tamaño, etc.)

-- Crear tabla producto_detalle
CREATE TABLE IF NOT EXISTS producto_detalle (
  iddetalle INT AUTO_INCREMENT PRIMARY KEY,
  idproducto INT NOT NULL,
  atributo VARCHAR(50) NOT NULL COMMENT 'Tipo de atributo: color, sabor, tamaño, etc.',
  valor VARCHAR(100) NOT NULL COMMENT 'Valor del atributo: rojo, frutilla, grande, etc.',
  cantidad INT NOT NULL DEFAULT 1 COMMENT 'Cantidad de este detalle en el producto',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',

  FOREIGN KEY (idproducto) REFERENCES productos(idproducto) ON DELETE CASCADE,

  INDEX idx_producto (idproducto),
  INDEX idx_atributo (atributo),
  INDEX idx_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Detalles/atributos de productos (colores, sabores, tamaños, etc.)';

-- Ejemplo de datos:
-- Producto: "Caja Detergente Mixto"
-- Detalles:
--   - atributo: 'color', valor: 'Rojo', cantidad: 4
--   - atributo: 'color', valor: 'Azul', cantidad: 3
--   - atributo: 'color', valor: 'Verde', cantidad: 5
