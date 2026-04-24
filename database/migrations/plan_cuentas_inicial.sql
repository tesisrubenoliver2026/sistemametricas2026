-- =============================================
-- PLAN DE CUENTAS BÁSICO PARA PARAGUAY
-- Script de inserción de cuentas contables iniciales
-- =============================================

-- Desactivar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- 1. ACTIVO (Nivel 1)
INSERT INTO plan_cuentas (idcuenta, codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
(1, '1', 'ACTIVO', 'ACTIVO', 'DEUDORA', 1, NULL, FALSE);

-- 1.1 ACTIVO CORRIENTE (Nivel 2)
INSERT INTO plan_cuentas (idcuenta, codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
(2, '1.1', 'ACTIVO CORRIENTE', 'ACTIVO', 'DEUDORA', 2, 1, FALSE);

-- Cuentas de Activo Corriente (Nivel 3)
INSERT INTO plan_cuentas (codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
('1.1.01', 'CAJA', 'ACTIVO', 'DEUDORA', 3, 2, TRUE),
('1.1.02', 'BANCOS', 'ACTIVO', 'DEUDORA', 3, 2, TRUE),
('1.1.03', 'CLIENTES', 'ACTIVO', 'DEUDORA', 3, 2, TRUE),
('1.1.04', 'DOCUMENTOS A COBRAR', 'ACTIVO', 'DEUDORA', 3, 2, TRUE),
('1.1.05', 'IVA CRÉDITO FISCAL', 'ACTIVO', 'DEUDORA', 3, 2, TRUE),
('1.1.06', 'ANTICIPOS A PROVEEDORES', 'ACTIVO', 'DEUDORA', 3, 2, TRUE),
('1.1.07', 'OTROS ACTIVOS CORRIENTES', 'ACTIVO', 'DEUDORA', 3, 2, TRUE);

-- 1.2 ACTIVO NO CORRIENTE (Nivel 2)
INSERT INTO plan_cuentas (idcuenta, codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
(10, '1.2', 'ACTIVO NO CORRIENTE', 'ACTIVO', 'DEUDORA', 2, 1, FALSE);

-- Cuentas de Activo No Corriente (Nivel 3)
INSERT INTO plan_cuentas (codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
('1.2.01', 'INVENTARIOS', 'ACTIVO', 'DEUDORA', 3, 10, TRUE),
('1.2.02', 'MERCADERÍAS', 'ACTIVO', 'DEUDORA', 3, 10, TRUE),
('1.2.03', 'PRODUCTOS TERMINADOS', 'ACTIVO', 'DEUDORA', 3, 10, TRUE),
('1.2.04', 'MUEBLES Y ÚTILES', 'ACTIVO', 'DEUDORA', 3, 10, TRUE),
('1.2.05', 'EQUIPOS DE COMPUTACIÓN', 'ACTIVO', 'DEUDORA', 3, 10, TRUE),
('1.2.06', 'VEHÍCULOS', 'ACTIVO', 'DEUDORA', 3, 10, TRUE),
('1.2.07', 'DEPRECIACIÓN ACUMULADA', 'ACTIVO', 'ACREEDORA', 3, 10, TRUE);

-- =============================================
-- 2. PASIVO
-- =============================================

-- 2. PASIVO (Nivel 1)
INSERT INTO plan_cuentas (idcuenta, codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
(18, '2', 'PASIVO', 'PASIVO', 'ACREEDORA', 1, NULL, FALSE);

-- 2.1 PASIVO CORRIENTE (Nivel 2)
INSERT INTO plan_cuentas (idcuenta, codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
(19, '2.1', 'PASIVO CORRIENTE', 'PASIVO', 'ACREEDORA', 2, 18, FALSE);

-- Cuentas de Pasivo Corriente (Nivel 3)
INSERT INTO plan_cuentas (codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
('2.1.01', 'PROVEEDORES', 'PASIVO', 'ACREEDORA', 3, 19, TRUE),
('2.1.02', 'DOCUMENTOS A PAGAR', 'PASIVO', 'ACREEDORA', 3, 19, TRUE),
('2.1.03', 'IVA DÉBITO FISCAL', 'PASIVO', 'ACREEDORA', 3, 19, TRUE),
('2.1.04', 'SUELDOS Y JORNALES A PAGAR', 'PASIVO', 'ACREEDORA', 3, 19, TRUE),
('2.1.05', 'CARGAS SOCIALES A PAGAR', 'PASIVO', 'ACREEDORA', 3, 19, TRUE),
('2.1.06', 'RETENCIONES A PAGAR', 'PASIVO', 'ACREEDORA', 3, 19, TRUE),
('2.1.07', 'PRÉSTAMOS A CORTO PLAZO', 'PASIVO', 'ACREEDORA', 3, 19, TRUE),
('2.1.08', 'OTROS PASIVOS CORRIENTES', 'PASIVO', 'ACREEDORA', 3, 19, TRUE);

-- 2.2 PASIVO NO CORRIENTE (Nivel 2)
INSERT INTO plan_cuentas (idcuenta, codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
(28, '2.2', 'PASIVO NO CORRIENTE', 'PASIVO', 'ACREEDORA', 2, 18, FALSE);

-- Cuentas de Pasivo No Corriente (Nivel 3)
INSERT INTO plan_cuentas (codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
('2.2.01', 'PRÉSTAMOS A LARGO PLAZO', 'PASIVO', 'ACREEDORA', 3, 28, TRUE),
('2.2.02', 'HIPOTECAS POR PAGAR', 'PASIVO', 'ACREEDORA', 3, 28, TRUE);

-- =============================================
-- 3. PATRIMONIO
-- =============================================

-- 3. PATRIMONIO (Nivel 1)
INSERT INTO plan_cuentas (idcuenta, codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
(31, '3', 'PATRIMONIO NETO', 'PATRIMONIO', 'ACREEDORA', 1, NULL, FALSE);

-- Cuentas de Patrimonio (Nivel 2)
INSERT INTO plan_cuentas (codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
('3.1', 'CAPITAL', 'PATRIMONIO', 'ACREEDORA', 2, 31, TRUE),
('3.2', 'RESERVAS', 'PATRIMONIO', 'ACREEDORA', 2, 31, TRUE),
('3.3', 'RESULTADOS ACUMULADOS', 'PATRIMONIO', 'ACREEDORA', 2, 31, TRUE),
('3.4', 'RESULTADO DEL EJERCICIO', 'PATRIMONIO', 'ACREEDORA', 2, 31, TRUE);

-- =============================================
-- 4. INGRESOS
-- =============================================

-- 4. INGRESOS (Nivel 1)
INSERT INTO plan_cuentas (idcuenta, codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
(36, '4', 'INGRESOS', 'INGRESO', 'ACREEDORA', 1, NULL, FALSE);

-- 4.1 INGRESOS OPERACIONALES (Nivel 2)
INSERT INTO plan_cuentas (idcuenta, codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
(37, '4.1', 'INGRESOS OPERACIONALES', 'INGRESO', 'ACREEDORA', 2, 36, FALSE);

-- Cuentas de Ingresos Operacionales (Nivel 3)
INSERT INTO plan_cuentas (codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
('4.1.01', 'VENTAS', 'INGRESO', 'ACREEDORA', 3, 37, TRUE),
('4.1.02', 'VENTAS GRAVADAS 10%', 'INGRESO', 'ACREEDORA', 3, 37, TRUE),
('4.1.03', 'VENTAS GRAVADAS 5%', 'INGRESO', 'ACREEDORA', 3, 37, TRUE),
('4.1.04', 'VENTAS EXENTAS', 'INGRESO', 'ACREEDORA', 3, 37, TRUE),
('4.1.05', 'SERVICIOS PRESTADOS', 'INGRESO', 'ACREEDORA', 3, 37, TRUE);

-- 4.2 OTROS INGRESOS (Nivel 2)
INSERT INTO plan_cuentas (idcuenta, codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
(43, '4.2', 'OTROS INGRESOS', 'INGRESO', 'ACREEDORA', 2, 36, FALSE);

-- Cuentas de Otros Ingresos (Nivel 3)
INSERT INTO plan_cuentas (codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
('4.2.01', 'INTERESES GANADOS', 'INGRESO', 'ACREEDORA', 3, 43, TRUE),
('4.2.02', 'DESCUENTOS OBTENIDOS', 'INGRESO', 'ACREEDORA', 3, 43, TRUE),
('4.2.03', 'DIFERENCIAS DE CAMBIO POSITIVAS', 'INGRESO', 'ACREEDORA', 3, 43, TRUE),
('4.2.04', 'INGRESOS VARIOS', 'INGRESO', 'ACREEDORA', 3, 43, TRUE);

-- =============================================
-- 5. EGRESOS (COSTOS Y GASTOS)
-- =============================================

-- 5. EGRESOS (Nivel 1)
INSERT INTO plan_cuentas (idcuenta, codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
(48, '5', 'EGRESOS', 'EGRESO', 'DEUDORA', 1, NULL, FALSE);

-- 5.1 COSTO DE VENTAS (Nivel 2)
INSERT INTO plan_cuentas (idcuenta, codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
(49, '5.1', 'COSTO DE VENTAS', 'EGRESO', 'DEUDORA', 2, 48, FALSE);

-- Cuentas de Costo de Ventas (Nivel 3)
INSERT INTO plan_cuentas (codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
('5.1.01', 'COSTO DE MERCADERÍAS VENDIDAS', 'EGRESO', 'DEUDORA', 3, 49, TRUE),
('5.1.02', 'COMPRAS', 'EGRESO', 'DEUDORA', 3, 49, TRUE),
('5.1.03', 'FLETES SOBRE COMPRAS', 'EGRESO', 'DEUDORA', 3, 49, TRUE);

-- 5.2 GASTOS OPERACIONALES (Nivel 2)
INSERT INTO plan_cuentas (idcuenta, codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
(53, '5.2', 'GASTOS OPERACIONALES', 'EGRESO', 'DEUDORA', 2, 48, FALSE);

-- Cuentas de Gastos Operacionales (Nivel 3)
INSERT INTO plan_cuentas (codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
('5.2.01', 'SUELDOS Y JORNALES', 'EGRESO', 'DEUDORA', 3, 53, TRUE),
('5.2.02', 'CARGAS SOCIALES', 'EGRESO', 'DEUDORA', 3, 53, TRUE),
('5.2.03', 'HONORARIOS PROFESIONALES', 'EGRESO', 'DEUDORA', 3, 53, TRUE),
('5.2.04', 'ALQUILERES', 'EGRESO', 'DEUDORA', 3, 53, TRUE),
('5.2.05', 'SERVICIOS PÚBLICOS', 'EGRESO', 'DEUDORA', 3, 53, TRUE),
('5.2.06', 'COMBUSTIBLES Y LUBRICANTES', 'EGRESO', 'DEUDORA', 3, 53, TRUE),
('5.2.07', 'MANTENIMIENTO Y REPARACIONES', 'EGRESO', 'DEUDORA', 3, 53, TRUE),
('5.2.08', 'SEGUROS', 'EGRESO', 'DEUDORA', 3, 53, TRUE),
('5.2.09', 'PAPELERÍA Y ÚTILES', 'EGRESO', 'DEUDORA', 3, 53, TRUE),
('5.2.10', 'DEPRECIACIONES', 'EGRESO', 'DEUDORA', 3, 53, TRUE),
('5.2.11', 'GASTOS BANCARIOS', 'EGRESO', 'DEUDORA', 3, 53, TRUE),
('5.2.12', 'IMPUESTOS Y TASAS', 'EGRESO', 'DEUDORA', 3, 53, TRUE),
('5.2.13', 'GASTOS VARIOS', 'EGRESO', 'DEUDORA', 3, 53, TRUE);

-- 5.3 GASTOS FINANCIEROS (Nivel 2)
INSERT INTO plan_cuentas (idcuenta, codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
(67, '5.3', 'GASTOS FINANCIEROS', 'EGRESO', 'DEUDORA', 2, 48, FALSE);

-- Cuentas de Gastos Financieros (Nivel 3)
INSERT INTO plan_cuentas (codigo, nombre, tipo_cuenta, naturaleza, nivel, cuenta_padre, es_imputable) VALUES
('5.3.01', 'INTERESES PAGADOS', 'EGRESO', 'DEUDORA', 3, 67, TRUE),
('5.3.02', 'COMISIONES BANCARIAS', 'EGRESO', 'DEUDORA', 3, 67, TRUE),
('5.3.03', 'DIFERENCIAS DE CAMBIO NEGATIVAS', 'EGRESO', 'DEUDORA', 3, 67, TRUE);

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Verificar cantidad de cuentas insertadas
SELECT '✅ Plan de Cuentas Cargado Exitosamente' as resultado;
SELECT COUNT(*) as total_cuentas FROM plan_cuentas;
SELECT tipo_cuenta, COUNT(*) as cantidad FROM plan_cuentas GROUP BY tipo_cuenta;
