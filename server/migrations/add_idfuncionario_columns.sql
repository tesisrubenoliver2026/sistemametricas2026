-- Migración: Agregar columna idfuncionario a las tablas que usan idusuarios
-- Fecha: 2025-11-02
-- Descripción: Permite que tanto usuarios administrativos como funcionarios puedan realizar operaciones

-- Tabla: clientes
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS idfuncionario INT NULL AFTER idusuario,
ADD CONSTRAINT fk_clientes_funcionario FOREIGN KEY (idfuncionario) REFERENCES funcionarios(idfuncionario) ON DELETE SET NULL;

-- Tabla: compras
ALTER TABLE compras
ADD COLUMN IF NOT EXISTS idfuncionario INT NULL AFTER idusuarios,
ADD CONSTRAINT fk_compras_funcionario FOREIGN KEY (idfuncionario) REFERENCES funcionarios(idfuncionario) ON DELETE SET NULL;

-- Tabla: detalle_pago_deuda_compra
ALTER TABLE detalle_pago_deuda_compra
ADD COLUMN IF NOT EXISTS idfuncionario INT NULL AFTER creado_por;

-- Tabla: detalle_pago_deuda_venta
ALTER TABLE detalle_pago_deuda_venta
ADD COLUMN IF NOT EXISTS idfuncionario INT NULL AFTER creado_por;

-- Tabla: egresos
ALTER TABLE egresos
ADD COLUMN IF NOT EXISTS idfuncionario INT NULL AFTER creado_por;

-- Tabla: ingresos
ALTER TABLE ingresos
ADD COLUMN IF NOT EXISTS idfuncionario INT NULL AFTER creado_por;

-- Tabla: libro_diario
ALTER TABLE libro_diario
ADD COLUMN IF NOT EXISTS idfuncionario INT NULL AFTER creado_por;

-- Tabla: movimiento_caja
ALTER TABLE movimiento_caja
ADD COLUMN IF NOT EXISTS idfuncionario INT NULL AFTER idusuarios,
ADD CONSTRAINT fk_movimiento_caja_funcionario FOREIGN KEY (idfuncionario) REFERENCES funcionarios(idfuncionario) ON DELETE SET NULL;

-- Tabla: productos
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS idfuncionario INT NULL AFTER idusuario,
ADD CONSTRAINT fk_productos_funcionario FOREIGN KEY (idfuncionario) REFERENCES funcionarios(idfuncionario) ON DELETE SET NULL;

-- Tabla: proveedor
ALTER TABLE proveedor
ADD COLUMN IF NOT EXISTS idfuncionario INT NULL AFTER idusuario,
ADD CONSTRAINT fk_proveedor_funcionario FOREIGN KEY (idfuncionario) REFERENCES funcionarios(idfuncionario) ON DELETE SET NULL;

-- Tabla: tipo_egreso
ALTER TABLE tipo_egreso
ADD COLUMN IF NOT EXISTS idfuncionario INT NULL AFTER idusuario,
ADD CONSTRAINT fk_tipo_egreso_funcionario FOREIGN KEY (idfuncionario) REFERENCES funcionarios(idfuncionario) ON DELETE SET NULL;

-- Tabla: tipo_ingreso
ALTER TABLE tipo_ingreso
ADD COLUMN IF NOT EXISTS idfuncionario INT NULL AFTER idusuario,
ADD CONSTRAINT fk_tipo_ingreso_funcionario FOREIGN KEY (idfuncionario) REFERENCES funcionarios(idfuncionario) ON DELETE SET NULL;

-- Tabla: ventas
ALTER TABLE ventas
ADD COLUMN IF NOT EXISTS idfuncionario INT NULL AFTER idusuarios,
ADD CONSTRAINT fk_ventas_funcionario FOREIGN KEY (idfuncionario) REFERENCES funcionarios(idfuncionario) ON DELETE SET NULL;

-- Tabla: ventas_programadas
ALTER TABLE ventas_programadas
ADD COLUMN IF NOT EXISTS idfuncionario INT NULL AFTER idusuario,
ADD CONSTRAINT fk_ventas_programadas_funcionario FOREIGN KEY (idfuncionario) REFERENCES funcionarios(idfuncionario) ON DELETE SET NULL;

-- Verificación
SELECT
    'clientes' AS tabla,
    COUNT(*) AS registros_con_funcionario
FROM clientes WHERE idfuncionario IS NOT NULL
UNION ALL
SELECT 'compras', COUNT(*) FROM compras WHERE idfuncionario IS NOT NULL
UNION ALL
SELECT 'productos', COUNT(*) FROM productos WHERE idfuncionario IS NOT NULL
UNION ALL
SELECT 'ventas', COUNT(*) FROM ventas WHERE idfuncionario IS NOT NULL;
