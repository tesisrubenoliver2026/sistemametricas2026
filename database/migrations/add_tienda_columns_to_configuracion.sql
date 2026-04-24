-- ========================================
-- Migración: Agregar columnas tienda y hash_tienda a tabla configuracion
-- Fecha: 2025-12-23
-- Propósito: Identificación única de tienda para integración con sistemas externos
-- ========================================

-- Paso 1: Agregar columna tienda (nombre de la tienda)
ALTER TABLE configuracion
ADD COLUMN tienda VARCHAR(255) NULL AFTER valor;

-- Paso 2: Agregar columna hash_tienda (identificador único encriptado)
ALTER TABLE configuracion
ADD COLUMN hash_tienda VARCHAR(255) NULL AFTER tienda;

-- Paso 3: Crear índice único para hash_tienda
-- Esto asegura que cada tienda tenga un hash único
CREATE UNIQUE INDEX idx_configuracion_hash_tienda ON configuracion(hash_tienda);

-- Paso 4: Crear índice para tienda (para búsquedas rápidas)
CREATE INDEX idx_configuracion_tienda ON configuracion(tienda);

-- ========================================
-- Estructura final de la tabla configuracion:
-- id | idusuarios | clave | valor | tienda | hash_tienda
-- ========================================

-- Notas:
-- - tienda: Nombre o identificador de la tienda (ej. "Tienda Central", "Sucursal Norte")
-- - hash_tienda: Hash único generado para identificación externa (ej. SHA256, UUID)
-- - Ambas columnas son NULL para mantener compatibilidad con registros existentes
-- - El hash_tienda debe ser único en toda la tabla
-- ========================================
