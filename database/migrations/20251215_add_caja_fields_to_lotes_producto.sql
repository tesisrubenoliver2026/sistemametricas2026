-- Migración: Agregar campos de productos tipo CAJA a lotes_producto
-- Fecha: 2025-12-15
-- Descripción: Agrega campos cant_p_caja, cant_cajas y precio_compra_caja para productos tipo CAJA

ALTER TABLE lotes_producto
ADD COLUMN cant_p_caja INT NULL COMMENT 'Cantidad de unidades por caja (solo productos tipo CAJA)',
ADD COLUMN cant_cajas DECIMAL(10,2) NULL COMMENT 'Cantidad de cajas compradas (solo productos tipo CAJA)',
ADD COLUMN precio_compra_caja DECIMAL(10,2) NULL COMMENT 'Precio de compra por caja (solo productos tipo CAJA)';

-- Índice para búsquedas por productos tipo CAJA
CREATE INDEX idx_lotes_cant_p_caja ON lotes_producto(cant_p_caja);

-- Comentario de la tabla actualizado
ALTER TABLE lotes_producto COMMENT = 'Lotes de productos con control FIFO, incluyendo soporte para productos tipo CAJA';
