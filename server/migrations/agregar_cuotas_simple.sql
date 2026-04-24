-- ============================================
-- SISTEMA DE CUOTAS SIMPLIFICADO
-- ============================================
-- Agregar solo las columnas esenciales a deuda_venta
-- El usuario solo ingresa: cant_cuota y tasa_interes_anual
-- El sistema calcula todo automáticamente

USE sistema_ale_2;

-- Agregar columnas a deuda_venta
ALTER TABLE deuda_venta
ADD COLUMN cant_cuota INT DEFAULT 1
  COMMENT 'Cantidad de cuotas (1 = pago único, >1 = plan de cuotas)',
ADD COLUMN tasa_interes_anual DECIMAL(5,2) DEFAULT 0.00
  COMMENT 'Tasa de interés anual en % (ej: 36.00 para 36%)',
ADD COLUMN dia_fecha_pago INT DEFAULT 15
  COMMENT 'Día del mes para vencimiento de cuotas (1-31)',
ADD COLUMN tiene_cuotas VARCHAR(50) DEFAULT 'false'
  COMMENT 'true si tiene plan de cuotas generado, false si es crédito simple';

-- Índices para mejorar performance
CREATE INDEX idx_deuda_tiene_cuotas ON deuda_venta(tiene_cuotas);

-- Verificar columnas creadas
DESCRIBE deuda_venta;

-- Mostrar mensaje de éxito
SELECT '✅ Columnas agregadas exitosamente a deuda_venta' AS resultado;
