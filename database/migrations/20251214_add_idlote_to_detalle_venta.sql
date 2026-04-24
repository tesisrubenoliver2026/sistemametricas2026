-- =====================================================
-- MIGRATION: Agregar campo idlote a detalle_venta
-- Date: 2025-12-14
-- Description: Relaciona detalle_venta con lotes_producto para trazabilidad
-- =====================================================

-- Agregar columna idlote a detalle_venta
ALTER TABLE detalle_venta
  ADD COLUMN idlote INT NULL COMMENT 'Lote del cual se descontó el stock',
  ADD CONSTRAINT fk_detalle_venta_lote
    FOREIGN KEY (idlote) REFERENCES lotes_producto(idlote)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Crear índice para mejorar consultas
CREATE INDEX idx_idlote ON detalle_venta(idlote);

-- =====================================================
-- Nota: Este campo es NULL para ventas antiguas
-- Las nuevas ventas DEBEN tener idlote obligatorio
-- =====================================================
