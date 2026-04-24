-- ========================================
-- Migración: Agregar columna idusuarios a tabla configuracion
-- Fecha: 2025-11-05
-- Propósito: Hacer que las configuraciones sean específicas por usuario (multi-tenant)
-- ========================================

-- Paso 1: Agregar la columna idusuarios (nullable inicialmente)
ALTER TABLE configuracion
ADD COLUMN idusuarios INT NULL AFTER id;

-- Paso 2: Agregar foreign key para mantener integridad referencial
ALTER TABLE configuracion
ADD CONSTRAINT fk_configuracion_usuario
FOREIGN KEY (idusuarios) REFERENCES usuarios(idusuarios) ON DELETE CASCADE;

-- Paso 3: Crear índice para mejorar performance en consultas por usuario
CREATE INDEX idx_configuracion_idusuarios ON configuracion(idusuarios);

-- Paso 4: Modificar la clave única para incluir idusuarios
-- Primero eliminamos la clave única existente si existe
ALTER TABLE configuracion DROP INDEX IF EXISTS clave;

-- Agregamos nueva clave única compuesta (clave + idusuarios)
-- Esto permite que cada usuario tenga su propia configuración con la misma clave
ALTER TABLE configuracion
ADD UNIQUE KEY uk_configuracion_clave_usuario (clave, idusuarios);

-- ========================================
-- Notas:
-- - La columna idusuarios es NULL para permitir configuraciones globales si es necesario
-- - La clave única compuesta permite que diferentes usuarios tengan la misma clave con diferentes valores
-- - ON DELETE CASCADE asegura que al eliminar un usuario, sus configuraciones también se eliminen
-- ========================================
