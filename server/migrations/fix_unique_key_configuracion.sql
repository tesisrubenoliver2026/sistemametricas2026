-- Eliminar la clave única en la columna 'clave' (si existe)
-- Esta clave impedía tener la misma configuración para múltiples usuarios

-- Primero, intentar eliminar cualquier índice único en 'clave'
ALTER TABLE configuracion DROP INDEX clave;

-- Ahora crear/recrear la clave única compuesta correcta (clave + idusuarios)
-- Si ya existe, primero la eliminamos y la recreamos
ALTER TABLE configuracion DROP INDEX IF EXISTS uk_clave_idusuarios;

ALTER TABLE configuracion
ADD UNIQUE KEY uk_clave_idusuarios (clave, idusuarios);

-- Verificar que todo quedó correcto
SHOW KEYS FROM configuracion WHERE Key_name != 'PRIMARY';
