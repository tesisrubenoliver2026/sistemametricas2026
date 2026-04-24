-- ========================================
-- Migración: Corregir tipo de columna tienda a BOOLEAN
-- Fecha: 2025-12-23
-- Propósito: Cambiar tienda de VARCHAR a BOOLEAN (TINYINT(1))
-- ========================================

-- Paso 1: Eliminar índice de tienda si existe
DROP INDEX IF EXISTS idx_configuracion_tienda ON configuracion;

-- Paso 2: Modificar columna tienda a BOOLEAN (TINYINT(1))
ALTER TABLE configuracion
MODIFY COLUMN tienda TINYINT(1) NULL DEFAULT NULL COMMENT 'Indica si esta configuración es para una tienda (1=Sí, 0=No)';

-- ========================================
-- Estructura final de la tabla configuracion:
-- id | idusuarios | clave | valor | tienda (BOOLEAN) | hash_tienda
-- ========================================

-- Notas:
-- - tienda: BOOLEAN que indica si la configuración pertenece a una tienda
--   * NULL = configuración sin especificar
--   * 0 (false) = NO es de tienda
--   * 1 (true) = SÍ es de tienda
-- - hash_tienda: Hash único generado para identificación externa (se mantiene como VARCHAR)
-- - El hash_tienda sigue siendo único en toda la tabla
-- ========================================
