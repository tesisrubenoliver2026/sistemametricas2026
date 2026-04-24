/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: actividades_economicas
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `actividades_economicas` (
  `idactividad` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(255) NOT NULL,
  PRIMARY KEY (`idactividad`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: arqueo
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `arqueo` (
  `idarqueo` int(11) NOT NULL AUTO_INCREMENT,
  `a50` int(11) DEFAULT 0,
  `a100` int(11) DEFAULT 0,
  `a500` int(11) DEFAULT 0,
  `a1000` int(11) DEFAULT 0,
  `a2000` int(11) DEFAULT 0,
  `a5000` int(11) DEFAULT 0,
  `a10000` int(11) DEFAULT 0,
  `a20000` int(11) DEFAULT 0,
  `a50000` int(11) DEFAULT 0,
  `a100000` int(11) DEFAULT 0,
  `total` decimal(15, 2) NOT NULL DEFAULT 0.00,
  `detalle1` varchar(100) DEFAULT NULL,
  `monto1` decimal(15, 2) DEFAULT NULL,
  `detalle2` varchar(100) DEFAULT NULL,
  `monto2` decimal(15, 2) DEFAULT NULL,
  `detalle3` varchar(100) DEFAULT NULL,
  `monto3` decimal(15, 2) DEFAULT NULL,
  `detalle4` varchar(100) DEFAULT NULL,
  `monto4` decimal(15, 2) DEFAULT NULL,
  `detalle5` varchar(100) DEFAULT NULL,
  `monto5` decimal(15, 2) DEFAULT NULL,
  `idmovimiento` int(11) NOT NULL,
  PRIMARY KEY (`idarqueo`),
  KEY `idmovimiento` (`idmovimiento`),
  CONSTRAINT `arqueo_ibfk_1` FOREIGN KEY (`idmovimiento`) REFERENCES `movimiento_caja` (`idmovimiento`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: asientos_contables
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `asientos_contables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date DEFAULT NULL,
  `concepto` text DEFAULT NULL,
  `cuenta_debe` varchar(100) DEFAULT NULL,
  `cuenta_haber` varchar(100) DEFAULT NULL,
  `monto` decimal(15, 2) DEFAULT NULL,
  `referencia_origen` varchar(50) DEFAULT NULL,
  `tipo_origen` enum('ingreso', 'egreso', 'otro') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: categorias
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `categorias` (
  `idcategorias` int(11) NOT NULL AUTO_INCREMENT,
  `categoria` varchar(100) NOT NULL,
  `estado` varchar(20) DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idcategorias`)
) ENGINE = InnoDB AUTO_INCREMENT = 9 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: clientes
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `clientes` (
  `idcliente` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `numDocumento` varchar(50) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `genero` varchar(20) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'activo',
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `tipo_cliente` varchar(50) NOT NULL DEFAULT 'minorista',
  `idusuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`idcliente`),
  UNIQUE KEY `unique_documento_usuario` (`numDocumento`, `idusuario`),
  KEY `fk_clientes_usuarios` (`idusuario`),
  CONSTRAINT `fk_clientes_usuarios` FOREIGN KEY (`idusuario`) REFERENCES `usuarios` (`idusuarios`)
) ENGINE = InnoDB AUTO_INCREMENT = 10 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: compras
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `compras` (
  `idcompra` int(11) NOT NULL AUTO_INCREMENT,
  `idusuarios` int(11) DEFAULT NULL,
  `idproveedor` int(11) DEFAULT NULL,
  `idmovimiento` int(11) DEFAULT NULL,
  `iddetalle_transferencia_compra` int(11) DEFAULT NULL,
  `iddetalle_tarjeta_compra` int(11) DEFAULT NULL,
  `total` decimal(10, 2) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `nro_factura` varchar(50) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `descuento` decimal(10, 2) DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`idcompra`),
  KEY `idusuarios` (`idusuarios`),
  KEY `idproveedor` (`idproveedor`),
  KEY `idmovimiento` (`idmovimiento`),
  KEY `fk_compras_detalle_transferencia` (`iddetalle_transferencia_compra`),
  KEY `iddetalle_tarjeta_compra` (`iddetalle_tarjeta_compra`)
) ENGINE = InnoDB AUTO_INCREMENT = 97 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: configuracion
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `configuracion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(50) NOT NULL,
  `valor` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE = InnoDB AUTO_INCREMENT = 197 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: datos_bancarios
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `datos_bancarios` (
  `iddatos_bancarios` int(11) NOT NULL AUTO_INCREMENT,
  `banco_origen` varchar(100) NOT NULL,
  `numero_cuenta` varchar(50) NOT NULL,
  `tipo_cuenta` varchar(50) NOT NULL,
  `titular_cuenta` varchar(100) NOT NULL,
  `observacion` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`iddatos_bancarios`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: datos_transferencia_venta
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `datos_transferencia_venta` (
  `idtransferencia` int(11) NOT NULL AUTO_INCREMENT,
  `idventa` int(11) NOT NULL,
  `banco_origen` varchar(100) NOT NULL,
  `numero_cuenta` varchar(30) NOT NULL,
  `tipo_cuenta` varchar(100) DEFAULT NULL,
  `titular_cuenta` varchar(100) DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idtransferencia`),
  KEY `idventa` (`idventa`),
  CONSTRAINT `datos_transferencia_venta_ibfk_1` FOREIGN KEY (`idventa`) REFERENCES `ventas` (`idventa`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalle_actividades_economicas
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalle_actividades_economicas` (
  `iddetalle` int(11) NOT NULL AUTO_INCREMENT,
  `idfacturador` int(11) NOT NULL,
  `idactividad` int(11) NOT NULL,
  PRIMARY KEY (`iddetalle`),
  KEY `idx_fact_actividad` (`idfacturador`, `idactividad`),
  KEY `fk_detalle_actividad` (`idactividad`)
) ENGINE = InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalle_cheque_venta
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalle_cheque_venta` (
  `iddetalle_cheque_venta` int(11) NOT NULL AUTO_INCREMENT,
  `idventa` int(11) NOT NULL,
  `banco` varchar(100) NOT NULL,
  `nro_cheque` varchar(50) NOT NULL,
  `monto` decimal(10, 2) NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `titular` varchar(255) NOT NULL,
  `estado` varchar(20) DEFAULT 'pendiente' COMMENT 'pendiente, cobrado, anulado, rechazado',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`iddetalle_cheque_venta`),
  KEY `idx_idventa` (`idventa`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha_vencimiento` (`fecha_vencimiento`),
  CONSTRAINT `fk_detalle_cheque_venta_venta` FOREIGN KEY (`idventa`) REFERENCES `ventas` (`idventa`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalle_cheque_venta_cobro
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalle_cheque_venta_cobro` (
  `iddetalle_cheque_venta_cobro` int(11) NOT NULL AUTO_INCREMENT,
  `idingreso` int(11) NOT NULL,
  `banco` varchar(100) NOT NULL,
  `nro_cheque` varchar(50) NOT NULL,
  `monto` decimal(15, 2) NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `titular` varchar(100) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'pendiente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`iddetalle_cheque_venta_cobro`),
  KEY `idingreso` (`idingreso`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalle_compra
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalle_compra` (
  `iddetalle` int(11) NOT NULL AUTO_INCREMENT,
  `idproducto` int(11) DEFAULT NULL,
  `idcompra` int(11) DEFAULT NULL,
  `idproveedor` int(11) DEFAULT NULL,
  `cantidad` decimal(10, 2) DEFAULT NULL,
  `precio` decimal(10, 2) DEFAULT NULL,
  `sub_total` decimal(10, 2) DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `nombre_producto` varchar(255) DEFAULT NULL,
  `unidad_medida` varchar(50) DEFAULT NULL,
  `iva` decimal(5, 2) DEFAULT NULL,
  `stock_restante` decimal(10, 2) DEFAULT NULL,
  `cant_cajas` decimal(10, 2) DEFAULT NULL,
  `cant_cajas_restante` decimal(10, 2) DEFAULT NULL,
  `cant_p_caja` int(11) DEFAULT NULL,
  `cant_p_caja_restante` int(11) DEFAULT NULL,
  `precio_compra_caja` decimal(10, 2) DEFAULT NULL,
  PRIMARY KEY (`iddetalle`),
  KEY `idcompra` (`idcompra`),
  KEY `idproveedor` (`idproveedor`),
  KEY `fk_idproducto` (`idproducto`)
) ENGINE = InnoDB AUTO_INCREMENT = 101 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalle_pago_deuda_compra
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalle_pago_deuda_compra` (
  `idpago_deuda_compra` int(11) NOT NULL AUTO_INCREMENT,
  `iddeuda_compra` int(11) NOT NULL,
  `monto_pagado` decimal(15, 2) NOT NULL,
  `fecha_pago` datetime DEFAULT current_timestamp(),
  `observacion` text DEFAULT NULL,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `creado_por` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`idpago_deuda_compra`),
  KEY `iddeuda_compra` (`iddeuda_compra`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalle_pago_deuda_venta
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalle_pago_deuda_venta` (
  `idpago_deuda` int(11) NOT NULL AUTO_INCREMENT,
  `iddeuda` int(11) NOT NULL,
  `total_deuda` decimal(15, 2) NOT NULL DEFAULT 0.00,
  `total_pagado` decimal(15, 2) NOT NULL DEFAULT 0.00,
  `saldo` decimal(15, 2) NOT NULL DEFAULT 0.00,
  `monto_pagado` decimal(15, 2) NOT NULL,
  `fecha_pago` datetime DEFAULT current_timestamp(),
  `observacion` text DEFAULT NULL,
  `idformapago` int(11) DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `iddetalle_transferencia_cobro` int(11) DEFAULT NULL,
  `iddetalle_tarjeta_venta_cobro` int(11) DEFAULT NULL,
  `iddetalle_cheque_venta_cobro` int(11) DEFAULT NULL,
  PRIMARY KEY (`idpago_deuda`),
  KEY `fk_pago_deuda` (`iddeuda`),
  KEY `fk_transferencia_pago_deuda` (`iddetalle_transferencia_cobro`),
  KEY `fk_tarjeta_pago_deuda` (`iddetalle_tarjeta_venta_cobro`),
  KEY `fk_cheque_pago_deuda` (`iddetalle_cheque_venta_cobro`)
) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalle_producto
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalle_producto` (
  `iddetalle` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_detalle` varchar(100) NOT NULL,
  `idproducto` int(11) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'activo',
  PRIMARY KEY (`iddetalle`),
  KEY `idproducto` (`idproducto`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalle_tarjeta_venta
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalle_tarjeta_venta` (
  `idtarjeta_venta` int(11) NOT NULL AUTO_INCREMENT,
  `idventa` int(11) NOT NULL,
  `tipo_tarjeta` varchar(10) NOT NULL,
  `entidad` varchar(50) DEFAULT NULL,
  `monto` decimal(15, 2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idtarjeta_venta`),
  KEY `idventa` (`idventa`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalle_tarjeta_venta_cobro
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalle_tarjeta_venta_cobro` (
  `idtarjeta_venta_cobro` int(11) NOT NULL AUTO_INCREMENT,
  `idingreso` int(11) NOT NULL,
  `tipo_tarjeta` varchar(50) NOT NULL,
  `entidad` varchar(100) NOT NULL,
  `monto` decimal(15, 2) NOT NULL,
  `observacion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idtarjeta_venta_cobro`),
  KEY `idingreso` (`idingreso`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalle_transferencia_cobro
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalle_transferencia_cobro` (
  `idtransferencia_cobro` int(11) NOT NULL AUTO_INCREMENT,
  `idingreso` int(11) NOT NULL,
  `banco_origen` varchar(100) NOT NULL,
  `numero_cuenta` varchar(50) NOT NULL,
  `tipo_cuenta` varchar(50) NOT NULL,
  `titular_cuenta` varchar(100) NOT NULL,
  `observacion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idtransferencia_cobro`),
  KEY `idingreso` (`idingreso`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalle_transferencia_compra_pago
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalle_transferencia_compra_pago` (
  `idtransferencia_compra_pago` int(11) NOT NULL AUTO_INCREMENT,
  `idegreso` int(11) NOT NULL,
  `banco_origen` varchar(100) NOT NULL,
  `numero_cuenta` varchar(100) NOT NULL,
  `tipo_cuenta` varchar(50) NOT NULL,
  `titular_cuenta` varchar(100) NOT NULL,
  `observacion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idtransferencia_compra_pago`),
  KEY `idegreso` (`idegreso`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalle_venta
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalle_venta` (
  `iddetalle` int(11) NOT NULL AUTO_INCREMENT,
  `idventa` int(11) NOT NULL,
  `idproducto` int(11) DEFAULT NULL,
  `nombre_producto` varchar(255) DEFAULT NULL,
  `cantidad` decimal(10, 2) DEFAULT NULL,
  `precio_venta` decimal(15, 2) DEFAULT NULL,
  `precio_compra` decimal(15, 2) DEFAULT NULL,
  `ganancia` decimal(15, 2) DEFAULT 0.00,
  `sub_total` decimal(15, 2) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `iva5` decimal(15, 2) DEFAULT 0.00,
  `iva10` decimal(15, 2) DEFAULT 0.00,
  `iddetalle_compra` int(11) DEFAULT NULL,
  `descuento` decimal(15, 2) DEFAULT 0.00,
  `precio_venta_caja` decimal(10, 2) DEFAULT NULL,
  `cant_p_caja` int(11) DEFAULT NULL,
  `unidad_medida` varchar(20) DEFAULT NULL,
  `cant_cajas_vender` decimal(10, 2) DEFAULT NULL,
  `cant_unidades_sueltas` decimal(10, 2) DEFAULT NULL,
  PRIMARY KEY (`iddetalle`),
  KEY `idx_detalle_venta_idventa` (`idventa`),
  KEY `fk_detalle_compra` (`iddetalle_compra`)
) ENGINE = InnoDB AUTO_INCREMENT = 94 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalles_cheque_compra
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalles_cheque_compra` (
  `iddetalle_cheque_compra` int(11) NOT NULL AUTO_INCREMENT,
  `idcompra` int(11) NOT NULL,
  `banco` varchar(100) NOT NULL,
  `nro_cheque` varchar(50) NOT NULL,
  `monto` decimal(10, 2) NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `titular` varchar(100) NOT NULL,
  `estado` varchar(20) DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`iddetalle_cheque_compra`),
  KEY `idcompra` (`idcompra`),
  CONSTRAINT `detalles_cheque_compra_ibfk_1` FOREIGN KEY (`idcompra`) REFERENCES `compras` (`idcompra`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalles_cheques_compra_pago
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalles_cheques_compra_pago` (
  `iddetalle_cheque_compra_pago` int(11) NOT NULL AUTO_INCREMENT,
  `idegreso` int(11) NOT NULL,
  `banco` varchar(100) NOT NULL,
  `nro_cheque` varchar(50) NOT NULL,
  `monto` decimal(15, 2) NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `titular` varchar(100) NOT NULL,
  `estado` varchar(20) DEFAULT 'pendiente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`iddetalle_cheque_compra_pago`),
  KEY `idegreso` (`idegreso`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalles_tarjeta_compra
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalles_tarjeta_compra` (
  `iddetalle_tarjeta_compra` int(11) NOT NULL AUTO_INCREMENT,
  `idcompra` int(11) NOT NULL,
  `tipo_tarjeta` varchar(50) NOT NULL,
  `entidad` varchar(100) NOT NULL,
  `monto` decimal(10, 2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`iddetalle_tarjeta_compra`),
  KEY `idcompra` (`idcompra`),
  CONSTRAINT `detalles_tarjeta_compra_ibfk_1` FOREIGN KEY (`idcompra`) REFERENCES `compras` (`idcompra`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: detalles_transferencia_compra
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `detalles_transferencia_compra` (
  `iddetalle_transferencia_compra` int(11) NOT NULL AUTO_INCREMENT,
  `idcompra` int(11) NOT NULL,
  `banco_origen` varchar(100) NOT NULL,
  `numero_cuenta` varchar(50) NOT NULL,
  `tipo_cuenta` varchar(50) NOT NULL,
  `titular_cuenta` varchar(100) NOT NULL,
  `observacion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`iddetalle_transferencia_compra`),
  KEY `idcompra` (`idcompra`),
  CONSTRAINT `detalles_transferencia_compra_ibfk_1` FOREIGN KEY (`idcompra`) REFERENCES `compras` (`idcompra`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: deuda_compra
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `deuda_compra` (
  `iddeuda_compra` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `idcompra` int(11) NOT NULL,
  `idproveedor` int(11) NOT NULL,
  `total_deuda` decimal(14, 2) NOT NULL DEFAULT 0.00,
  `total_pagado` decimal(14, 2) NOT NULL DEFAULT 0.00,
  `saldo` decimal(14, 2) GENERATED ALWAYS AS (`total_deuda` - `total_pagado`) STORED,
  `estado` enum('pendiente', 'pagado') NOT NULL DEFAULT 'pendiente',
  `fecha_deuda` date NOT NULL,
  `fecha_pago` date DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`iddeuda_compra`),
  KEY `idx_compra` (`idcompra`),
  KEY `idx_proveedor` (`idproveedor`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha_deuda` (`fecha_deuda`),
  CONSTRAINT `fk_dc_compra` FOREIGN KEY (`idcompra`) REFERENCES `compras` (`idcompra`),
  CONSTRAINT `fk_dc_proveedor` FOREIGN KEY (`idproveedor`) REFERENCES `proveedor` (`idproveedor`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: deuda_venta
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `deuda_venta` (
  `iddeuda` int(11) NOT NULL AUTO_INCREMENT,
  `idventa` int(11) NOT NULL,
  `idcliente` int(11) NOT NULL,
  `total_deuda` decimal(15, 2) NOT NULL,
  `total_pagado` decimal(15, 2) DEFAULT 0.00,
  `saldo` decimal(15, 2) DEFAULT 0.00,
  `estado` varchar(20) DEFAULT 'PENDIENTE',
  `fecha_deuda` date NOT NULL,
  `ult_fecha_pago` datetime DEFAULT NULL,
  `costo_empresa` decimal(15, 2) NOT NULL,
  `ganancia_credito` decimal(15, 2) DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`iddeuda`),
  KEY `fk_deuda_venta_venta` (`idventa`),
  KEY `fk_deuda_venta_cliente` (`idcliente`)
) ENGINE = InnoDB AUTO_INCREMENT = 10 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: egresos
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `egresos` (
  `idegreso` int(11) NOT NULL AUTO_INCREMENT,
  `idtipo_egreso` int(11) NOT NULL,
  `idformapago` int(11) DEFAULT NULL,
  `idcompra` int(11) DEFAULT NULL,
  `idpago_deuda_compra` int(11) DEFAULT NULL,
  `iddetalle_transferencia_pago` int(11) DEFAULT NULL,
  `iddetalle_cheque_compra_pago` int(11) DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora` time DEFAULT NULL,
  `monto` decimal(15, 2) NOT NULL,
  `concepto` varchar(255) NOT NULL,
  `observacion` text DEFAULT NULL,
  `idmovimiento` int(11) NOT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `iddetalle_tarjeta_compra_pago` int(11) DEFAULT NULL,
  PRIMARY KEY (`idegreso`),
  KEY `idtipo_egreso` (`idtipo_egreso`),
  KEY `idcompra` (`idcompra`),
  KEY `idpago_deuda_compra` (`idpago_deuda_compra`),
  KEY `fk_egresos_transferencia_pago` (`iddetalle_transferencia_pago`),
  KEY `fk_iddetalle_tarjeta_compra_pago` (`iddetalle_tarjeta_compra_pago`),
  KEY `fk_egresos_detalle_cheque_compra_pago` (`iddetalle_cheque_compra_pago`),
  KEY `fk_egresos_creado_por` (`creado_por`),
  KEY `idx_egresos_idformapago` (`idformapago`),
  CONSTRAINT `fk_egresos_forma_pago` FOREIGN KEY (`idformapago`) REFERENCES `formas_pago` (`idformapago`) ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 102 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: facturadores
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `facturadores` (
  `idfacturador` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_fantasia` varchar(255) NOT NULL,
  `titular` varchar(255) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `ruc` varchar(20) NOT NULL,
  `timbrado_nro` varchar(20) NOT NULL,
  `fecha_inicio_vigente` date NOT NULL,
  `fecha_fin_vigente` date NOT NULL,
  `nro_factura_inicial_habilitada` varchar(20) DEFAULT NULL,
  `nro_factura_final_habilitada` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `culminado` tinyint(1) DEFAULT 0,
  `facturas_utilizadas` int(11) DEFAULT 0,
  `nro_factura_disponible` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`idfacturador`)
) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: formas_pago
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `formas_pago` (
  `idformapago` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(50) NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`idformapago`),
  UNIQUE KEY `descripcion` (`descripcion`)
) ENGINE = InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: ingresos
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `ingresos` (
  `idingreso` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `hora` time DEFAULT curtime(),
  `monto` decimal(15, 2) NOT NULL,
  `concepto` varchar(255) DEFAULT NULL,
  `idtipo_ingreso` int(11) DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `idmovimiento` int(11) DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `idventa` int(11) DEFAULT NULL,
  `idpago_deuda` int(11) DEFAULT NULL,
  `idformapago` int(11) DEFAULT NULL,
  `iddetalle_transferencia_cobro` int(11) DEFAULT NULL,
  `iddetalle_tarjeta_venta_cobro` int(11) DEFAULT NULL,
  `iddetalle_cheque_venta_cobro` int(11) DEFAULT NULL,
  PRIMARY KEY (`idingreso`),
  KEY `idtipo_ingreso` (`idtipo_ingreso`),
  KEY `fk_ingreso_venta` (`idventa`),
  KEY `fk_ingreso_pago_deuda` (`idpago_deuda`),
  KEY `fk_ingresos_formapago` (`idformapago`),
  KEY `fk_ingresos_transferencia` (`iddetalle_transferencia_cobro`),
  KEY `fk_ingresos_creado_por` (`creado_por`)
) ENGINE = InnoDB AUTO_INCREMENT = 74 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: libro_diario
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `libro_diario` (
  `id_diario` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `hora` time DEFAULT NULL,
  `concepto` varchar(255) NOT NULL,
  `cuenta_debe` varchar(50) NOT NULL,
  `cuenta_haber` varchar(50) NOT NULL,
  `monto` decimal(14, 2) NOT NULL,
  `idingreso` int(11) DEFAULT NULL,
  `idegreso` int(11) DEFAULT NULL,
  `idventa` int(11) DEFAULT NULL,
  `idcompra` int(11) DEFAULT NULL,
  `idcliente` int(11) DEFAULT NULL,
  `idproveedor` int(11) DEFAULT NULL,
  `idformapago` int(11) DEFAULT NULL,
  `idmovimiento` int(11) DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_diario`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: movimiento_caja
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `movimiento_caja` (
  `idmovimiento` int(11) NOT NULL AUTO_INCREMENT,
  `idusuarios` int(11) DEFAULT NULL,
  `num_caja` int(11) DEFAULT NULL,
  `fecha_apertura` datetime DEFAULT NULL,
  `fecha_cierre` datetime DEFAULT NULL,
  `monto_apertura` decimal(10, 2) DEFAULT NULL,
  `monto_cierre` decimal(10, 2) DEFAULT NULL,
  `credito` decimal(10, 2) DEFAULT NULL,
  `gastos` decimal(10, 2) DEFAULT NULL,
  `cobrado` decimal(10, 2) DEFAULT NULL,
  `contado` decimal(10, 2) DEFAULT NULL,
  `ingresos` decimal(10, 2) DEFAULT NULL,
  `compras` decimal(10, 2) DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`idmovimiento`),
  KEY `idusuarios` (`idusuarios`)
) ENGINE = InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: producto_proveedor
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `producto_proveedor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idproducto` int(11) NOT NULL,
  `idproveedor` int(11) NOT NULL,
  `precio_compra` decimal(10, 2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idproducto` (`idproducto`, `idproveedor`),
  UNIQUE KEY `unique_producto_proveedor` (`idproducto`, `idproveedor`),
  KEY `fk_proveedor` (`idproveedor`)
) ENGINE = InnoDB AUTO_INCREMENT = 57 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: productos
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `productos` (
  `idproducto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_producto` varchar(100) NOT NULL,
  `cod_barra` varchar(100) DEFAULT NULL,
  `precio_compra` decimal(10, 2) DEFAULT NULL,
  `stock` decimal(10, 2) DEFAULT NULL,
  `idcategoria` int(11) DEFAULT NULL,
  `idproveedor` int(11) DEFAULT NULL,
  `precio_venta` decimal(10, 2) DEFAULT 0.00,
  `ubicacion` varchar(100) DEFAULT NULL,
  `iva` decimal(5, 2) DEFAULT 0.00,
  `estado` varchar(20) DEFAULT 'activo',
  `unidad_medida` varchar(10) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `idusuario` int(11) DEFAULT NULL,
  `cant_p_caja` decimal(10, 2) DEFAULT NULL COMMENT 'Cantidad de productos por caja (solo cuando unidad_medida = "caja")',
  `cant_cajas` decimal(10, 2) DEFAULT NULL,
  `precio_compra_caja` decimal(10, 2) DEFAULT NULL COMMENT 'Precio total de compra por caja (solo cuando unidad_medida = "caja")',
  `precio_venta_caja` decimal(10, 2) DEFAULT NULL,
  PRIMARY KEY (`idproducto`),
  UNIQUE KEY `unique_nombre_usuario` (`nombre_producto`, `idusuario`),
  UNIQUE KEY `unique_codigo_usuario` (`cod_barra`, `idusuario`),
  KEY `idcategoria` (`idcategoria`),
  KEY `idproveedor` (`idproveedor`),
  KEY `fk_productos_usuarios` (`idusuario`),
  CONSTRAINT `fk_productos_usuarios` FOREIGN KEY (`idusuario`) REFERENCES `usuarios` (`idusuarios`)
) ENGINE = InnoDB AUTO_INCREMENT = 39 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: proveedor
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `proveedor` (
  `idproveedor` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `ruc` varchar(20) DEFAULT NULL,
  `razon` varchar(100) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `idusuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`idproveedor`),
  KEY `fk_proveedor_usuarios` (`idusuario`),
  CONSTRAINT `fk_proveedor_usuarios` FOREIGN KEY (`idusuario`) REFERENCES `usuarios` (`idusuarios`)
) ENGINE = InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: tipo_egreso
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `tipo_egreso` (
  `idtipo_egreso` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `idusuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`idtipo_egreso`),
  KEY `fk_tipo_egreso_usuario` (`idusuario`),
  CONSTRAINT `fk_tipo_egreso_usuario` FOREIGN KEY (`idusuario`) REFERENCES `usuarios` (`idusuarios`)
) ENGINE = InnoDB AUTO_INCREMENT = 16 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: tipo_ingreso
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `tipo_ingreso` (
  `idtipo_ingreso` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `idusuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`idtipo_ingreso`),
  KEY `fk_tipo_ingreso_usuario` (`idusuario`),
  CONSTRAINT `fk_tipo_ingreso_usuario` FOREIGN KEY (`idusuario`) REFERENCES `usuarios` (`idusuarios`)
) ENGINE = InnoDB AUTO_INCREMENT = 10 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: usuarios
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `usuarios` (
  `idusuarios` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `acceso` varchar(50) DEFAULT NULL,
  `login` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'activo',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`idusuarios`),
  UNIQUE KEY `login` (`login`)
) ENGINE = InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: ventas
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `ventas` (
  `idventa` int(11) NOT NULL AUTO_INCREMENT,
  `idusuarios` int(11) DEFAULT NULL,
  `idcliente` int(11) DEFAULT NULL,
  `total` decimal(15, 2) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `nro_factura` varchar(50) DEFAULT NULL,
  `nro_ticket` int(11) DEFAULT NULL,
  `tipo` enum('contado', 'credito') DEFAULT NULL,
  `estado` enum('activo', 'anulado') DEFAULT NULL,
  `idformapago` int(11) DEFAULT NULL,
  `iddato_transferencia_venta` int(11) DEFAULT NULL,
  `idmovimiento` int(11) DEFAULT NULL,
  `total_descuento` decimal(10, 2) DEFAULT 0.00,
  `tipo_descuento` enum(
  'sin_descuento',
  'descuento_total',
  'descuento_producto'
  ) DEFAULT 'sin_descuento' COMMENT 'Tipo de descuento aplicado',
  `total_original` decimal(10, 2) DEFAULT 0.00 COMMENT 'Total antes de aplicar descuentos',
  `saldo` decimal(15, 2) DEFAULT 0.00,
  `tipo_comprobante` enum('factura', 'ticket') DEFAULT NULL,
  `iva5` decimal(15, 2) DEFAULT 0.00,
  `iva10` decimal(15, 2) DEFAULT 0.00,
  `totaliva` decimal(15, 2) DEFAULT 0.00,
  `totalletras` text DEFAULT NULL,
  `estado_pago` enum('pagado', 'pendiente') DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `idfacturador` int(11) DEFAULT NULL,
  `nombre_fantasia_facturador` varchar(255) DEFAULT NULL,
  `ruc_facturador` varchar(20) DEFAULT NULL,
  `timbrado_nro_facturador` varchar(20) DEFAULT NULL,
  `fecha_inicio_vigente_facturador` date DEFAULT NULL,
  `fecha_fin_vigente_facturador` date DEFAULT NULL,
  `iddetalle_cheque_venta` int(11) DEFAULT NULL,
  `total_ganancia` decimal(15, 2) DEFAULT 0.00,
  `nombre_cliente` varchar(255) DEFAULT NULL,
  `documento_cliente` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idventa`),
  KEY `fk_venta_cliente` (`idcliente`),
  KEY `fk_ventas_usuarios` (`idusuarios`),
  KEY `fk_venta_formapago` (`idformapago`),
  KEY `fk_venta_transferencia` (`iddato_transferencia_venta`),
  KEY `fk_venta_cheque` (`iddetalle_cheque_venta`)
) ENGINE = InnoDB AUTO_INCREMENT = 80 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: ventas_programadas
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `ventas_programadas` (
  `idprogramacion` int(11) NOT NULL AUTO_INCREMENT,
  `idcliente` int(11) NOT NULL,
  `idproducto` int(11) NOT NULL,
  `cantidad` decimal(10, 2) NOT NULL DEFAULT 1.00,
  `fecha_inicio` date NOT NULL,
  `dia_programado` int(11) NOT NULL,
  `ultima_fecha_venta` date DEFAULT NULL,
  `estado` enum('activa', 'inactiva', 'cancelada') DEFAULT 'activa',
  `idusuario` int(11) NOT NULL,
  `observacion` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`idprogramacion`),
  KEY `idcliente` (`idcliente`),
  KEY `idproducto` (`idproducto`),
  KEY `idusuario` (`idusuario`)
) ENGINE = InnoDB AUTO_INCREMENT = 7 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: actividades_economicas
# ------------------------------------------------------------

INSERT INTO
  `actividades_economicas` (`idactividad`, `descripcion`)
VALUES
  (1, 'Test Activity Economy');
INSERT INTO
  `actividades_economicas` (`idactividad`, `descripcion`)
VALUES
  (2, 'TestActividad4');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: arqueo
# ------------------------------------------------------------

INSERT INTO
  `arqueo` (
    `idarqueo`,
    `a50`,
    `a100`,
    `a500`,
    `a1000`,
    `a2000`,
    `a5000`,
    `a10000`,
    `a20000`,
    `a50000`,
    `a100000`,
    `total`,
    `detalle1`,
    `monto1`,
    `detalle2`,
    `monto2`,
    `detalle3`,
    `monto3`,
    `detalle4`,
    `monto4`,
    `detalle5`,
    `monto5`,
    `idmovimiento`
  )
VALUES
  (
    1,
    0,
    6,
    0,
    1,
    0,
    1,
    2,
    0,
    0,
    4,
    426600.00,
    '',
    0.00,
    '',
    0.00,
    '',
    0.00,
    '',
    0.00,
    '',
    0.00,
    2
  );
INSERT INTO
  `arqueo` (
    `idarqueo`,
    `a50`,
    `a100`,
    `a500`,
    `a1000`,
    `a2000`,
    `a5000`,
    `a10000`,
    `a20000`,
    `a50000`,
    `a100000`,
    `total`,
    `detalle1`,
    `monto1`,
    `detalle2`,
    `monto2`,
    `detalle3`,
    `monto3`,
    `detalle4`,
    `monto4`,
    `detalle5`,
    `monto5`,
    `idmovimiento`
  )
VALUES
  (
    2,
    1,
    5,
    0,
    0,
    2,
    0,
    1,
    1,
    1,
    1,
    184550.00,
    '',
    0.00,
    '',
    0.00,
    '',
    0.00,
    '',
    0.00,
    '',
    0.00,
    3
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: asientos_contables
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: categorias
# ------------------------------------------------------------

INSERT INTO
  `categorias` (
    `idcategorias`,
    `categoria`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    1,
    'TestCategory2',
    'activo',
    '2025-08-11 15:26:20',
    '2025-08-22 21:35:00',
    NULL
  );
INSERT INTO
  `categorias` (
    `idcategorias`,
    `categoria`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    2,
    'Testcategory3',
    'activo',
    '2025-08-22 21:37:59',
    '2025-08-22 21:37:59',
    NULL
  );
INSERT INTO
  `categorias` (
    `idcategorias`,
    `categoria`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    3,
    'Testcategory4',
    'activo',
    '2025-08-22 21:38:33',
    '2025-08-22 21:38:33',
    NULL
  );
INSERT INTO
  `categorias` (
    `idcategorias`,
    `categoria`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    4,
    'Testcategory5',
    'activo',
    '2025-08-22 21:38:42',
    '2025-08-22 21:38:42',
    NULL
  );
INSERT INTO
  `categorias` (
    `idcategorias`,
    `categoria`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    5,
    'Testcategory6',
    'activo',
    '2025-08-22 21:38:49',
    '2025-08-22 21:38:49',
    NULL
  );
INSERT INTO
  `categorias` (
    `idcategorias`,
    `categoria`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    6,
    'testcategory7',
    'activo',
    '2025-08-22 21:38:56',
    '2025-08-22 21:38:56',
    NULL
  );
INSERT INTO
  `categorias` (
    `idcategorias`,
    `categoria`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    7,
    'testcategory8',
    'activo',
    '2025-08-23 00:40:50',
    '2025-08-23 00:40:58',
    NULL
  );
INSERT INTO
  `categorias` (
    `idcategorias`,
    `categoria`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    8,
    'testdsafasdf22',
    'activo',
    '2025-08-23 20:03:26',
    '2025-08-23 20:03:31',
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: clientes
# ------------------------------------------------------------

INSERT INTO
  `clientes` (
    `idcliente`,
    `nombre`,
    `apellido`,
    `tipo`,
    `numDocumento`,
    `telefono`,
    `direccion`,
    `genero`,
    `estado`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `tipo_cliente`,
    `idusuario`
  )
VALUES
  (
    1,
    'TESTCLIENT3',
    'TESTCLIENT',
    'FISICA',
    '2222222',
    '0991332119',
    'TESTDIRECTION',
    'M',
    'activo',
    'TESTDESCRIPTION',
    '2025-08-11 15:24:56',
    '2025-09-13 18:23:58',
    NULL,
    'MINORISTA',
    1
  );
INSERT INTO
  `clientes` (
    `idcliente`,
    `nombre`,
    `apellido`,
    `tipo`,
    `numDocumento`,
    `telefono`,
    `direccion`,
    `genero`,
    `estado`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `tipo_cliente`,
    `idusuario`
  )
VALUES
  (
    2,
    'TESTCLIENTE2',
    'TESTAPELLIDO',
    'FISICA',
    '123123',
    '12312312',
    'SDFSDFADSF',
    'M',
    'activo',
    'ADASDAS',
    '2025-08-28 20:39:42',
    '2025-09-13 18:24:04',
    NULL,
    'MINORISTA',
    1
  );
INSERT INTO
  `clientes` (
    `idcliente`,
    `nombre`,
    `apellido`,
    `tipo`,
    `numDocumento`,
    `telefono`,
    `direccion`,
    `genero`,
    `estado`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `tipo_cliente`,
    `idusuario`
  )
VALUES
  (
    5,
    'SDFASDF',
    'ASDFASDF',
    'FISICA',
    '444433332',
    '3123213',
    'SDASDAS',
    'M',
    'activo',
    'ASDASD',
    '2025-09-13 18:49:03',
    '2025-09-13 18:49:03',
    NULL,
    'MINORISTA',
    1
  );
INSERT INTO
  `clientes` (
    `idcliente`,
    `nombre`,
    `apellido`,
    `tipo`,
    `numDocumento`,
    `telefono`,
    `direccion`,
    `genero`,
    `estado`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `tipo_cliente`,
    `idusuario`
  )
VALUES
  (
    6,
    'TESTSDF',
    'TESTSDFSAGX',
    'FISICA',
    '223344',
    '0985454234',
    'TESTASDF',
    'M',
    'activo',
    'DFFASDF',
    '2025-09-13 18:50:07',
    '2025-09-13 18:50:07',
    NULL,
    'MINORISTA',
    2
  );
INSERT INTO
  `clientes` (
    `idcliente`,
    `nombre`,
    `apellido`,
    `tipo`,
    `numDocumento`,
    `telefono`,
    `direccion`,
    `genero`,
    `estado`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `tipo_cliente`,
    `idusuario`
  )
VALUES
  (
    8,
    'ASDFASDF',
    'EQWEQWE',
    'FISICA',
    '123123',
    '3123123',
    'ASDFASDF',
    'M',
    'activo',
    'TEST',
    '2025-09-13 18:57:33',
    '2025-09-13 18:57:33',
    NULL,
    'MINORISTA',
    2
  );
INSERT INTO
  `clientes` (
    `idcliente`,
    `nombre`,
    `apellido`,
    `tipo`,
    `numDocumento`,
    `telefono`,
    `direccion`,
    `genero`,
    `estado`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `tipo_cliente`,
    `idusuario`
  )
VALUES
  (
    9,
    'TESTNAME',
    'TESTAPELLIDO',
    'FISICA',
    'sdfasdf',
    '213123',
    'ASDFASDF',
    'M',
    'activo',
    'ASDFASFD',
    '2025-09-24 18:27:21',
    '2025-09-24 18:27:21',
    NULL,
    'MINORISTA',
    1
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: compras
# ------------------------------------------------------------

INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    1,
    1,
    1,
    2,
    NULL,
    NULL,
    50000.00,
    '2025-08-11 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-08-11 15:43:11',
    '2025-08-11 15:43:11',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    2,
    1,
    1,
    2,
    NULL,
    NULL,
    2500.00,
    '2025-08-11 00:00:00',
    '23213213',
    'credito',
    'pagado',
    0.00,
    'test',
    '2025-08-11 17:56:42',
    '2025-08-11 17:56:42',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    3,
    1,
    1,
    2,
    NULL,
    NULL,
    32000.00,
    '2025-08-23 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-08-23 20:19:22',
    '2025-08-23 20:19:22',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    4,
    1,
    2,
    3,
    NULL,
    NULL,
    3200.00,
    '2025-09-04 00:00:00',
    '3213123',
    'contado',
    'pagado',
    0.00,
    'test',
    '2025-09-04 14:24:14',
    '2025-09-04 14:24:14',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    5,
    1,
    2,
    3,
    NULL,
    NULL,
    3200.00,
    '2025-09-04 00:00:00',
    '565654',
    'contado',
    'pagado',
    0.00,
    'test',
    '2025-09-04 14:31:15',
    '2025-09-04 14:31:15',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    6,
    1,
    2,
    3,
    NULL,
    NULL,
    3200.00,
    '2025-09-04 00:00:00',
    '3342342',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-04 14:32:06',
    '2025-09-04 14:32:06',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    7,
    1,
    1,
    3,
    NULL,
    NULL,
    60000.00,
    '2025-09-06 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-09-06 15:22:49',
    '2025-09-06 15:22:49',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    8,
    1,
    1,
    3,
    NULL,
    NULL,
    90000.00,
    '2025-09-06 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-09-06 20:16:00',
    '2025-09-06 20:16:00',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    9,
    1,
    2,
    3,
    NULL,
    NULL,
    3000.00,
    '2025-09-06 00:00:00',
    '3213212',
    'contado',
    'pagado',
    0.00,
    'TEST',
    '2025-09-06 20:17:28',
    '2025-09-06 20:17:28',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    10,
    1,
    1,
    4,
    NULL,
    NULL,
    75000.00,
    '2025-09-07 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-09-07 08:32:53',
    '2025-09-07 08:32:53',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    11,
    1,
    1,
    4,
    NULL,
    NULL,
    105000.00,
    '2025-09-07 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-09-07 08:33:55',
    '2025-09-07 08:33:55',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    12,
    1,
    1,
    4,
    NULL,
    NULL,
    70400.00,
    '2025-09-07 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-09-07 08:34:22',
    '2025-09-07 08:34:22',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    13,
    2,
    2,
    4,
    NULL,
    NULL,
    3520.00,
    '2025-09-10 00:00:00',
    '465465',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-10 20:12:49',
    '2025-09-10 20:12:49',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    14,
    2,
    1,
    4,
    NULL,
    NULL,
    5082.00,
    '2025-09-13 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-09-13 19:56:20',
    '2025-09-13 19:56:20',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    15,
    2,
    1,
    4,
    NULL,
    NULL,
    191744.00,
    '2025-09-13 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-09-13 20:34:09',
    '2025-09-13 20:34:09',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    16,
    2,
    1,
    4,
    NULL,
    NULL,
    157500.00,
    '2025-09-13 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-09-13 20:37:07',
    '2025-09-13 20:37:07',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    17,
    2,
    1,
    4,
    NULL,
    NULL,
    65000.00,
    '2025-09-13 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-09-13 20:45:05',
    '2025-09-13 20:45:05',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    18,
    1,
    1,
    4,
    NULL,
    NULL,
    50000.00,
    '2025-09-24 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-09-24 18:27:56',
    '2025-09-24 18:27:56',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    19,
    1,
    1,
    4,
    NULL,
    NULL,
    40000.00,
    '2025-09-24 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-09-24 18:28:47',
    '2025-09-24 18:28:47',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    20,
    1,
    4,
    4,
    NULL,
    NULL,
    12000.00,
    '2025-09-24 00:00:00',
    '5132123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-24 18:29:17',
    '2025-09-24 18:29:17',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    21,
    1,
    1,
    4,
    NULL,
    NULL,
    700000.00,
    '2025-09-28 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-09-28 18:15:18',
    '2025-09-28 18:15:18',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    22,
    1,
    1,
    4,
    NULL,
    NULL,
    540000.00,
    '2025-09-29 00:00:00',
    '00001',
    'contado',
    'anulado',
    0.00,
    'Inventario inicial',
    '2025-09-28 21:32:20',
    '2025-09-29 18:31:09',
    '2025-09-29 18:31:09'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    23,
    1,
    1,
    4,
    NULL,
    NULL,
    60000.00,
    '2025-09-29 00:00:00',
    '00001',
    'contado',
    'anulado',
    0.00,
    'Inventario inicial',
    '2025-09-28 21:49:07',
    '2025-09-29 20:11:17',
    '2025-09-29 20:11:17'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    24,
    1,
    4,
    4,
    NULL,
    NULL,
    6000.00,
    '2025-09-29 00:00:00',
    'adasdasd',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 13:49:17',
    '2025-09-29 13:49:17',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    25,
    1,
    3,
    4,
    NULL,
    NULL,
    11666.67,
    '2025-09-29 00:00:00',
    '213123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 13:52:47',
    '2025-09-29 13:52:47',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    26,
    1,
    4,
    4,
    NULL,
    NULL,
    30000.00,
    '2025-09-29 00:00:00',
    '132123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 13:55:00',
    '2025-09-29 13:55:00',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    27,
    1,
    4,
    4,
    NULL,
    NULL,
    2333.33,
    '2025-09-29 00:00:00',
    '186465',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 14:08:12',
    '2025-09-29 14:08:12',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    28,
    1,
    3,
    4,
    NULL,
    NULL,
    11666.67,
    '2025-09-29 00:00:00',
    '23123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 14:28:13',
    '2025-09-29 14:28:13',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    29,
    1,
    4,
    4,
    NULL,
    NULL,
    6000.00,
    '2025-09-29 00:00:00',
    '213123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 14:33:56',
    '2025-09-29 14:33:56',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    30,
    1,
    4,
    4,
    NULL,
    NULL,
    3000.00,
    '2025-09-29 00:00:00',
    '21312312',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 14:35:00',
    '2025-09-29 14:35:00',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    31,
    1,
    4,
    4,
    NULL,
    NULL,
    3000.00,
    '2025-09-29 00:00:00',
    '23123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 15:07:48',
    '2025-09-29 15:07:48',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    32,
    1,
    4,
    4,
    NULL,
    NULL,
    12500.00,
    '2025-09-29 00:00:00',
    '3213123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 15:08:40',
    '2025-09-29 15:08:40',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    33,
    1,
    3,
    4,
    NULL,
    NULL,
    69230.77,
    '2025-09-29 00:00:00',
    '132132',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 15:10:00',
    '2025-09-29 15:10:00',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    34,
    1,
    4,
    4,
    NULL,
    NULL,
    15000.00,
    '2025-09-29 00:00:00',
    '2213123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 15:19:45',
    '2025-09-29 15:19:45',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    35,
    1,
    2,
    4,
    NULL,
    NULL,
    60000.00,
    '2025-09-29 00:00:00',
    '3322223',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 15:32:27',
    '2025-09-29 15:32:27',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    36,
    1,
    4,
    4,
    NULL,
    NULL,
    45000.00,
    '2025-09-29 00:00:00',
    '323123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 15:36:54',
    '2025-09-29 15:36:54',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    37,
    1,
    3,
    4,
    NULL,
    NULL,
    52500.00,
    '2025-09-29 00:00:00',
    '221212',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 15:43:23',
    '2025-09-29 15:43:23',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    38,
    1,
    4,
    4,
    NULL,
    NULL,
    35000.00,
    '2025-09-29 00:00:00',
    '25252',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 16:23:55',
    '2025-09-29 16:23:55',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    39,
    1,
    4,
    4,
    NULL,
    NULL,
    45000.00,
    '2025-09-29 00:00:00',
    '524254254',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 16:25:25',
    '2025-09-29 16:25:25',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    40,
    1,
    3,
    4,
    NULL,
    NULL,
    13636.36,
    '2025-09-29 00:00:00',
    '12321312',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 16:26:57',
    '2025-09-29 16:26:57',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    41,
    1,
    3,
    4,
    NULL,
    NULL,
    27272.73,
    '2025-09-29 00:00:00',
    '8555857',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 16:37:05',
    '2025-09-29 16:37:05',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    42,
    1,
    3,
    4,
    NULL,
    NULL,
    39130.43,
    '2025-09-29 00:00:00',
    '123123123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 16:43:18',
    '2025-09-29 16:43:18',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    43,
    1,
    3,
    4,
    NULL,
    NULL,
    39130.43,
    '2025-09-29 00:00:00',
    '5275275',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 16:50:20',
    '2025-09-29 16:50:20',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    44,
    1,
    3,
    4,
    NULL,
    NULL,
    27272.73,
    '2025-09-29 00:00:00',
    '132123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 17:11:50',
    '2025-09-29 17:11:50',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    45,
    1,
    3,
    4,
    NULL,
    NULL,
    26086.96,
    '2025-09-29 00:00:00',
    '51651651',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 17:13:59',
    '2025-09-29 17:13:59',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    46,
    1,
    4,
    4,
    NULL,
    NULL,
    15217.39,
    '2025-09-29 00:00:00',
    '32132123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 17:16:20',
    '2025-09-29 17:16:20',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    47,
    1,
    3,
    4,
    NULL,
    NULL,
    15000.00,
    '2025-09-29 00:00:00',
    '213123123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 17:20:17',
    '2025-09-29 17:20:17',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    48,
    1,
    3,
    4,
    NULL,
    NULL,
    28000.00,
    '2025-09-29 00:00:00',
    '321323123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 17:24:20',
    '2025-09-29 17:24:20',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    49,
    1,
    4,
    4,
    NULL,
    NULL,
    17500.00,
    '2025-09-29 00:00:00',
    '1531321',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 17:28:04',
    '2025-09-29 17:28:04',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    50,
    1,
    3,
    4,
    NULL,
    NULL,
    15000.00,
    '2025-09-29 00:00:00',
    '213123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 17:31:00',
    '2025-09-29 17:31:00',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    51,
    1,
    3,
    4,
    NULL,
    NULL,
    17500.00,
    '2025-09-29 00:00:00',
    '123123123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 17:31:52',
    '2025-09-29 17:31:52',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    52,
    1,
    1,
    4,
    NULL,
    NULL,
    105000.00,
    '2025-09-29 00:00:00',
    '00001',
    'contado',
    'anulado',
    0.00,
    'Inventario inicial',
    '2025-09-29 17:50:17',
    '2025-09-29 22:49:41',
    '2025-09-29 22:49:41'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    53,
    1,
    1,
    4,
    NULL,
    NULL,
    400000.00,
    '2025-09-29 00:00:00',
    '00001',
    'contado',
    'anulado',
    0.00,
    'Inventario inicial',
    '2025-09-29 17:56:32',
    '2025-09-29 20:11:31',
    '2025-09-29 20:11:31'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    54,
    1,
    1,
    4,
    NULL,
    NULL,
    400000.00,
    '2025-09-29 00:00:00',
    '00001',
    'contado',
    'anulado',
    0.00,
    'Inventario inicial',
    '2025-09-29 18:01:05',
    '2025-09-29 20:14:16',
    '2025-09-29 20:14:16'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    55,
    1,
    1,
    4,
    NULL,
    NULL,
    400000.00,
    '2025-09-29 00:00:00',
    '00001',
    'contado',
    'anulado',
    0.00,
    'Inventario inicial',
    '2025-09-29 18:04:09',
    '2025-09-29 20:14:40',
    '2025-09-29 20:14:40'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    56,
    1,
    1,
    4,
    NULL,
    NULL,
    400000.00,
    '2025-09-29 00:00:00',
    '00001',
    'contado',
    'anulado',
    0.00,
    'Inventario inicial',
    '2025-09-29 18:09:28',
    '2025-09-29 20:14:50',
    '2025-09-29 20:14:50'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    57,
    1,
    1,
    4,
    NULL,
    NULL,
    400000.00,
    '2025-09-29 00:00:00',
    '00001',
    'contado',
    'anulado',
    0.00,
    'Inventario inicial',
    '2025-09-29 18:12:34',
    '2025-09-29 23:10:51',
    '2025-09-29 23:10:51'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    58,
    1,
    1,
    4,
    NULL,
    NULL,
    180000.00,
    '2025-09-29 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-09-29 18:18:20',
    '2025-09-29 18:18:20',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    59,
    1,
    1,
    4,
    NULL,
    NULL,
    180000.00,
    '2025-09-29 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-09-29 18:21:23',
    '2025-09-29 18:21:23',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    60,
    1,
    4,
    4,
    NULL,
    NULL,
    6000.00,
    '2025-09-29 00:00:00',
    '651651',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 18:22:23',
    '2025-09-29 18:22:23',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    61,
    1,
    1,
    4,
    NULL,
    NULL,
    350000.00,
    '2025-09-29 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-09-29 18:30:14',
    '2025-09-29 18:30:14',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    62,
    1,
    3,
    4,
    NULL,
    NULL,
    3000.00,
    '2025-09-29 00:00:00',
    '12321312',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 20:00:27',
    '2025-09-29 20:00:27',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    63,
    1,
    3,
    4,
    NULL,
    NULL,
    6000.00,
    '2025-09-29 00:00:00',
    '323213',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 20:01:06',
    '2025-09-29 20:01:06',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    64,
    1,
    4,
    4,
    NULL,
    NULL,
    6000.00,
    '2025-09-29 00:00:00',
    '65121321',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 23:10:36',
    '2025-09-29 23:10:36',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    65,
    1,
    4,
    4,
    NULL,
    NULL,
    6000.00,
    '2025-09-29 00:00:00',
    '25523232',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-09-29 23:45:40',
    '2025-09-29 23:45:40',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    66,
    1,
    3,
    4,
    NULL,
    NULL,
    6000.00,
    '2025-09-29 00:00:00',
    '55532221',
    'contado',
    'anulado',
    0.00,
    NULL,
    '2025-09-29 23:47:04',
    '2025-09-29 23:47:28',
    '2025-09-29 23:47:28'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    67,
    1,
    4,
    4,
    NULL,
    NULL,
    30000.00,
    '2025-09-29 00:00:00',
    '222335',
    'contado',
    'anulado',
    0.00,
    NULL,
    '2025-09-29 23:56:29',
    '2025-09-29 23:57:23',
    '2025-09-29 23:57:23'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    68,
    1,
    1,
    4,
    NULL,
    NULL,
    90000.00,
    '2025-10-02 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-10-02 20:52:37',
    '2025-10-02 20:52:37',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    69,
    1,
    1,
    4,
    NULL,
    NULL,
    90000.00,
    '2025-10-03 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-10-02 21:00:49',
    '2025-10-02 21:00:49',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    70,
    1,
    1,
    4,
    NULL,
    NULL,
    90000.00,
    '2025-10-03 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-10-02 21:04:12',
    '2025-10-02 21:04:12',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    71,
    1,
    1,
    4,
    NULL,
    NULL,
    90000.00,
    '2025-10-03 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-10-02 21:07:48',
    '2025-10-02 21:07:48',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    72,
    1,
    1,
    4,
    NULL,
    NULL,
    90000.00,
    '2025-10-03 00:00:00',
    '00001',
    'contado',
    'anulado',
    0.00,
    'Inventario inicial',
    '2025-10-02 21:17:17',
    '2025-10-02 21:19:55',
    '2025-10-02 21:19:55'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    73,
    1,
    4,
    4,
    NULL,
    NULL,
    3000.00,
    '2025-10-02 00:00:00',
    '002',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-10-02 21:18:21',
    '2025-10-02 21:18:21',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    74,
    1,
    4,
    4,
    NULL,
    NULL,
    3000.00,
    '2025-10-03 00:00:00',
    '003',
    'contado',
    'anulado',
    0.00,
    NULL,
    '2025-10-03 09:41:22',
    '2025-10-03 09:42:26',
    '2025-10-03 09:42:26'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    75,
    1,
    4,
    4,
    NULL,
    NULL,
    90000.00,
    '2025-10-03 00:00:00',
    '003',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-10-03 10:03:04',
    '2025-10-03 10:03:04',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    76,
    1,
    4,
    4,
    NULL,
    NULL,
    90000.00,
    '2025-10-03 00:00:00',
    '004',
    'contado',
    'anulado',
    0.00,
    NULL,
    '2025-10-03 10:23:30',
    '2025-10-03 10:24:06',
    '2025-10-03 10:24:06'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    77,
    1,
    4,
    4,
    NULL,
    NULL,
    90000.00,
    '2025-10-03 00:00:00',
    '005',
    'contado',
    'anulado',
    0.00,
    NULL,
    '2025-10-03 10:25:01',
    '2025-10-03 10:25:20',
    '2025-10-03 10:25:20'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    78,
    1,
    4,
    4,
    NULL,
    NULL,
    90000.00,
    '2025-10-03 00:00:00',
    '004',
    'contado',
    'anulado',
    0.00,
    NULL,
    '2025-10-03 13:45:21',
    '2025-10-03 13:45:31',
    '2025-10-03 13:45:31'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    79,
    1,
    1,
    4,
    NULL,
    NULL,
    0.00,
    '2025-10-03 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-10-03 13:46:23',
    '2025-10-03 13:46:23',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    80,
    1,
    4,
    4,
    NULL,
    NULL,
    90000.00,
    '2025-10-03 00:00:00',
    '004',
    'contado',
    'anulado',
    0.00,
    NULL,
    '2025-10-03 13:47:03',
    '2025-10-03 13:52:06',
    '2025-10-03 13:52:06'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    81,
    1,
    4,
    4,
    NULL,
    NULL,
    92000.00,
    '2025-10-03 00:00:00',
    '006',
    'contado',
    'anulado',
    0.00,
    NULL,
    '2025-10-03 13:53:06',
    '2025-10-03 13:53:37',
    '2025-10-03 13:53:37'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    82,
    1,
    4,
    4,
    NULL,
    NULL,
    92000.00,
    '2025-10-03 00:00:00',
    '007',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-10-03 14:07:03',
    '2025-10-03 14:07:03',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    83,
    1,
    4,
    4,
    NULL,
    NULL,
    90000.00,
    '2025-10-03 00:00:00',
    '007',
    'contado',
    'anulado',
    0.00,
    NULL,
    '2025-10-03 14:07:34',
    '2025-10-03 14:08:56',
    '2025-10-03 14:08:56'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    84,
    1,
    1,
    4,
    NULL,
    NULL,
    0.00,
    '2025-10-13 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-10-13 10:35:17',
    '2025-10-13 10:35:17',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    85,
    1,
    1,
    4,
    NULL,
    NULL,
    0.00,
    '2025-10-13 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-10-13 12:32:40',
    '2025-10-13 12:32:40',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    86,
    1,
    4,
    4,
    NULL,
    NULL,
    10500.00,
    '2025-10-13 00:00:00',
    '123123123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-10-13 12:46:25',
    '2025-10-13 12:46:25',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    87,
    1,
    1,
    4,
    NULL,
    NULL,
    0.00,
    '2025-10-14 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-10-14 10:11:44',
    '2025-10-14 10:11:44',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    88,
    1,
    4,
    4,
    NULL,
    NULL,
    21000.00,
    '2025-10-14 00:00:00',
    '213123213',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-10-14 14:35:55',
    '2025-10-14 14:35:55',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    89,
    1,
    4,
    4,
    NULL,
    NULL,
    43000.00,
    '2025-10-14 00:00:00',
    '524245',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-10-14 14:39:33',
    '2025-10-14 14:39:33',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    90,
    1,
    4,
    4,
    NULL,
    NULL,
    40000.00,
    '2025-10-14 00:00:00',
    '2312343',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-10-14 14:40:10',
    '2025-10-14 14:40:10',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    91,
    1,
    1,
    4,
    NULL,
    NULL,
    27000.00,
    '2025-10-14 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-10-14 16:30:44',
    '2025-10-14 16:30:44',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    92,
    1,
    1,
    4,
    NULL,
    NULL,
    0.00,
    '2025-10-14 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-10-14 16:31:06',
    '2025-10-14 16:31:06',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    93,
    1,
    4,
    4,
    NULL,
    NULL,
    73000.00,
    '2025-10-14 00:00:00',
    '123323123',
    'contado',
    'pagado',
    0.00,
    NULL,
    '2025-10-14 16:31:30',
    '2025-10-14 16:31:30',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    94,
    1,
    1,
    4,
    NULL,
    NULL,
    0.00,
    '2025-10-14 00:00:00',
    '00001',
    'contado',
    'pagado',
    0.00,
    'Inventario inicial',
    '2025-10-14 16:34:16',
    '2025-10-14 16:34:16',
    NULL
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    95,
    1,
    4,
    4,
    NULL,
    NULL,
    18000.00,
    '2025-10-14 00:00:00',
    '56165132',
    'contado',
    'anulado',
    0.00,
    NULL,
    '2025-10-14 16:35:24',
    '2025-10-14 16:43:44',
    '2025-10-14 16:43:44'
  );
INSERT INTO
  `compras` (
    `idcompra`,
    `idusuarios`,
    `idproveedor`,
    `idmovimiento`,
    `iddetalle_transferencia_compra`,
    `iddetalle_tarjeta_compra`,
    `total`,
    `fecha`,
    `nro_factura`,
    `tipo`,
    `estado`,
    `descuento`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    96,
    1,
    4,
    4,
    NULL,
    NULL,
    35000.00,
    '2025-10-14 00:00:00',
    '23324234',
    'contado',
    'anulado',
    0.00,
    NULL,
    '2025-10-14 16:55:07',
    '2025-10-14 16:55:32',
    '2025-10-14 16:55:32'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: configuracion
# ------------------------------------------------------------

INSERT INTO
  `configuracion` (`id`, `clave`, `valor`)
VALUES
  (1, 'sistema_venta_por_lote', 'false');
INSERT INTO
  `configuracion` (`id`, `clave`, `valor`)
VALUES
  (12, 'venta_fecha_vencimiento', 'false');
INSERT INTO
  `configuracion` (`id`, `clave`, `valor`)
VALUES
  (89, 'selectedTemplate', 't4');
INSERT INTO
  `configuracion` (`id`, `clave`, `valor`)
VALUES
  (156, 'ventas_programadas', 'true');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: datos_bancarios
# ------------------------------------------------------------

INSERT INTO
  `datos_bancarios` (
    `iddatos_bancarios`,
    `banco_origen`,
    `numero_cuenta`,
    `tipo_cuenta`,
    `titular_cuenta`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    1,
    'banco',
    'tes',
    '13',
    'te',
    'o',
    '2025-08-31 19:30:35',
    '2025-08-31 19:30:35',
    NULL
  );
INSERT INTO
  `datos_bancarios` (
    `iddatos_bancarios`,
    `banco_origen`,
    `numero_cuenta`,
    `tipo_cuenta`,
    `titular_cuenta`,
    `observacion`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    2,
    'test',
    '123123',
    'CC',
    'Test Titular',
    'Test observacion2',
    '2025-08-31 19:43:31',
    '2025-08-31 19:54:24',
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: datos_transferencia_venta
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalle_actividades_economicas
# ------------------------------------------------------------

INSERT INTO
  `detalle_actividades_economicas` (`iddetalle`, `idfacturador`, `idactividad`)
VALUES
  (1, 1, 1);
INSERT INTO
  `detalle_actividades_economicas` (`iddetalle`, `idfacturador`, `idactividad`)
VALUES
  (3, 2, 1);
INSERT INTO
  `detalle_actividades_economicas` (`iddetalle`, `idfacturador`, `idactividad`)
VALUES
  (4, 3, 2);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalle_cheque_venta
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalle_cheque_venta_cobro
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalle_compra
# ------------------------------------------------------------

INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    1,
    1,
    1,
    1,
    20.00,
    2500.00,
    50000.00,
    '2025-08-23',
    '2025-08-11 15:43:11',
    '2025-09-18 00:00:00',
    NULL,
    'TESTPRODUCT',
    'UNIDAD',
    10.00,
    15.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    2,
    1,
    2,
    1,
    1.00,
    2500.00,
    2500.00,
    '2025-08-23',
    '2025-08-11 17:56:42',
    '2025-08-11 17:56:42',
    NULL,
    'TESTPRODUCT',
    'UNIDAD',
    10.00,
    1.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    3,
    2,
    3,
    1,
    10.00,
    3200.00,
    32000.00,
    '0000-00-00',
    '2025-08-23 20:19:22',
    '2025-09-21 17:43:33',
    NULL,
    'TEST1',
    'UNIDAD',
    10.00,
    1.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    4,
    2,
    4,
    2,
    1.00,
    3200.00,
    3200.00,
    '1899-11-30',
    '2025-09-04 14:24:14',
    '2025-09-04 14:24:14',
    NULL,
    'TEST1',
    'UNIDAD',
    10.00,
    1.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    5,
    2,
    5,
    2,
    1.00,
    3200.00,
    3200.00,
    '2026-11-30',
    '2025-09-04 14:31:15',
    '2025-09-04 14:31:15',
    NULL,
    'TEST1',
    'UNIDAD',
    10.00,
    1.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    6,
    2,
    6,
    2,
    1.00,
    3200.00,
    3200.00,
    '2027-11-30',
    '2025-09-04 14:32:06',
    '2025-09-04 14:32:06',
    NULL,
    'TEST1',
    'UNIDAD',
    10.00,
    1.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    7,
    3,
    7,
    1,
    20.00,
    3000.00,
    60000.00,
    '2025-10-25',
    '2025-09-06 15:22:49',
    '2025-09-06 15:26:59',
    NULL,
    'GALLETA',
    'KG',
    10.00,
    19.30,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    8,
    4,
    8,
    1,
    30.00,
    3000.00,
    90000.00,
    NULL,
    '2025-09-06 20:16:00',
    '2025-09-06 20:25:15',
    NULL,
    'REPUESTO1',
    'UNIDAD',
    10.00,
    28.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    9,
    4,
    9,
    2,
    1.00,
    3000.00,
    3000.00,
    NULL,
    '2025-09-06 20:17:28',
    '2025-09-06 20:17:28',
    NULL,
    'REPUESTO1',
    'UNIDAD',
    10.00,
    1.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    10,
    5,
    10,
    1,
    30.00,
    2500.00,
    75000.00,
    NULL,
    '2025-09-07 08:32:53',
    '2025-09-21 17:43:35',
    NULL,
    'REPUESTO2',
    'UNIDAD',
    10.00,
    16.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    11,
    7,
    11,
    1,
    30.00,
    3500.00,
    105000.00,
    NULL,
    '2025-09-07 08:33:55',
    '2025-09-07 20:33:30',
    NULL,
    'REPUESTO3',
    'UNIDAD',
    5.00,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    12,
    8,
    12,
    1,
    21.00,
    3520.00,
    70400.00,
    NULL,
    '2025-09-07 08:34:22',
    '2025-10-15 00:36:26',
    NULL,
    'REPUESTO4',
    'KG',
    10.00,
    15.80,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    13,
    8,
    13,
    2,
    1.00,
    3520.00,
    3520.00,
    NULL,
    '2025-09-10 20:12:49',
    '2025-09-10 20:12:49',
    NULL,
    'REPUESTO4',
    'KG',
    10.00,
    1.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    14,
    9,
    14,
    1,
    22.00,
    231.00,
    5082.00,
    NULL,
    '2025-09-13 19:56:20',
    '2025-09-13 19:56:20',
    NULL,
    'SDFDSF',
    'UNIDAD',
    10.00,
    22.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    15,
    10,
    15,
    1,
    56.00,
    3424.00,
    191744.00,
    NULL,
    '2025-09-13 20:34:09',
    '2025-09-16 18:38:45',
    NULL,
    'TEST',
    'UNIDAD',
    10.00,
    55.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    16,
    11,
    16,
    1,
    45.00,
    3500.00,
    157500.00,
    NULL,
    '2025-09-13 20:37:07',
    '2025-09-23 08:56:12',
    NULL,
    'DSAFASDF',
    'UNIDAD',
    10.00,
    44.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    17,
    12,
    17,
    1,
    20.00,
    3250.00,
    65000.00,
    NULL,
    '2025-09-13 20:45:05',
    '2025-09-13 20:45:05',
    NULL,
    'TESTIDUSE',
    'UNIDAD',
    10.00,
    20.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    18,
    13,
    18,
    1,
    20.00,
    2500.00,
    50000.00,
    NULL,
    '2025-09-24 18:27:56',
    '2025-09-26 21:59:11',
    NULL,
    'TESTPRODUCTO',
    'UNIDAD',
    10.00,
    19.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    19,
    14,
    19,
    1,
    20.00,
    2000.00,
    40000.00,
    NULL,
    '2025-09-24 18:28:47',
    '2025-09-24 18:34:30',
    NULL,
    'TESASDFASDF',
    'UNIDAD',
    10.00,
    14.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    20,
    14,
    20,
    4,
    6.00,
    2000.00,
    12000.00,
    NULL,
    '2025-09-24 18:29:17',
    '2025-09-24 18:29:17',
    NULL,
    'TESASDFASDF',
    'UNIDAD',
    10.00,
    6.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    21,
    15,
    21,
    1,
    60.00,
    11666.67,
    700000.00,
    NULL,
    '2025-09-28 18:15:18',
    '2025-09-28 18:15:18',
    NULL,
    'CDVVADASDV',
    'CAJA',
    10.00,
    60.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    22,
    16,
    22,
    1,
    36.00,
    15000.00,
    540000.00,
    NULL,
    '2025-09-28 21:32:20',
    '2025-09-29 18:31:09',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    23,
    17,
    23,
    1,
    20.00,
    3000.00,
    60000.00,
    NULL,
    '2025-09-28 21:49:07',
    '2025-09-29 20:11:17',
    NULL,
    '3LKJKLNM,BHJVJH5',
    'UNIDAD',
    10.00,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    24,
    17,
    24,
    4,
    1.00,
    3000.00,
    3000.00,
    NULL,
    '2025-09-29 13:49:17',
    '2025-09-29 13:49:17',
    NULL,
    '3LKJKLNM,BHJVJH5',
    'UNIDAD',
    10.00,
    1.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    25,
    16,
    24,
    4,
    2.00,
    1500.00,
    3000.00,
    NULL,
    '2025-09-29 13:49:17',
    '2025-09-29 13:49:17',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    2.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    26,
    15,
    25,
    3,
    1.00,
    11666.67,
    11666.67,
    NULL,
    '2025-09-29 13:52:47',
    '2025-09-29 13:52:47',
    NULL,
    'CDVVADASDV',
    'CAJA',
    10.00,
    1.00,
    NULL,
    NULL,
    30,
    30,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    27,
    16,
    26,
    4,
    2.00,
    15000.00,
    30000.00,
    NULL,
    '2025-09-29 13:55:00',
    '2025-09-29 13:55:00',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    2.00,
    NULL,
    NULL,
    20,
    20,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    28,
    15,
    27,
    4,
    2.00,
    1166.67,
    2333.33,
    NULL,
    '2025-09-29 14:08:12',
    '2025-09-29 14:08:12',
    NULL,
    'CDVVADASDV',
    'CAJA',
    10.00,
    2.00,
    NULL,
    NULL,
    30,
    30,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    29,
    15,
    28,
    3,
    1.00,
    11666.67,
    11666.67,
    NULL,
    '2025-09-29 14:28:13',
    '2025-09-29 14:28:13',
    NULL,
    'CDVVADASDV',
    'CAJA',
    10.00,
    1.00,
    NULL,
    NULL,
    30,
    30,
    350000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    30,
    17,
    29,
    4,
    2.00,
    3000.00,
    6000.00,
    NULL,
    '2025-09-29 14:33:56',
    '2025-09-29 14:33:56',
    NULL,
    '3LKJKLNM,BHJVJH5',
    'UNIDAD',
    10.00,
    2.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    31,
    17,
    30,
    4,
    1.00,
    3000.00,
    3000.00,
    NULL,
    '2025-09-29 14:35:00',
    '2025-09-29 14:35:00',
    NULL,
    '3LKJKLNM,BHJVJH5',
    'UNIDAD',
    10.00,
    1.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    32,
    17,
    31,
    4,
    1.00,
    3000.00,
    3000.00,
    NULL,
    '2025-09-29 15:07:48',
    '2025-09-29 15:07:48',
    NULL,
    '3LKJKLNM,BHJVJH5',
    'UNIDAD',
    10.00,
    1.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    33,
    16,
    32,
    4,
    1.00,
    12500.00,
    12500.00,
    NULL,
    '2025-09-29 15:08:40',
    '2025-09-29 15:08:40',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    1.00,
    NULL,
    NULL,
    24,
    24,
    300000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    34,
    16,
    33,
    3,
    6.00,
    11538.46,
    69230.77,
    NULL,
    '2025-09-29 15:10:00',
    '2025-09-29 15:10:00',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    6.00,
    NULL,
    NULL,
    26,
    26,
    300000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    35,
    16,
    34,
    4,
    1.00,
    15000.00,
    15000.00,
    NULL,
    '2025-09-29 15:19:45',
    '2025-09-29 15:19:45',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    1.00,
    1.00,
    1.00,
    20,
    20,
    300000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    36,
    16,
    35,
    2,
    4.00,
    15000.00,
    60000.00,
    NULL,
    '2025-09-29 15:32:27',
    '2025-09-29 15:32:27',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    4.00,
    4.00,
    4.00,
    20,
    20,
    300000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    37,
    16,
    36,
    4,
    3.00,
    15000.00,
    900000.00,
    NULL,
    '2025-09-29 15:36:54',
    '2025-09-29 15:36:54',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    3.00,
    3.00,
    3.00,
    20,
    20,
    300000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    38,
    16,
    37,
    3,
    3.00,
    17500.00,
    1050000.00,
    NULL,
    '2025-09-29 15:43:23',
    '2025-09-29 15:43:23',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    3.00,
    3.00,
    3.00,
    20,
    20,
    350000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    39,
    15,
    38,
    4,
    3.00,
    11666.67,
    1050000.00,
    NULL,
    '2025-09-29 16:23:55',
    '2025-09-29 16:23:55',
    NULL,
    'CDVVADASDV',
    'CAJA',
    10.00,
    3.00,
    3.00,
    3.00,
    30,
    30,
    350000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    40,
    16,
    39,
    4,
    3.00,
    15000.00,
    900000.00,
    NULL,
    '2025-09-29 16:25:25',
    '2025-09-29 16:25:25',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    3.00,
    3.00,
    3.00,
    20,
    20,
    300000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    41,
    16,
    40,
    3,
    1.00,
    13636.36,
    300000.00,
    NULL,
    '2025-09-29 16:26:57',
    '2025-09-29 16:26:57',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    1.00,
    1.00,
    1.00,
    22,
    22,
    300000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    42,
    16,
    41,
    3,
    2.00,
    13636.36,
    600000.00,
    NULL,
    '2025-09-29 16:37:05',
    '2025-09-29 16:37:05',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    2.00,
    2.00,
    2.00,
    22,
    22,
    300000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    43,
    16,
    42,
    3,
    3.00,
    13043.48,
    900000.00,
    NULL,
    '2025-09-29 16:43:18',
    '2025-09-29 16:43:18',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    3.00,
    3.00,
    3.00,
    23,
    23,
    300000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    44,
    16,
    43,
    3,
    3.00,
    13043.48,
    900000.00,
    NULL,
    '2025-09-29 16:50:20',
    '2025-09-29 16:50:20',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    3.00,
    3.00,
    3.00,
    23,
    23,
    300000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    45,
    16,
    44,
    3,
    2.00,
    13636.36,
    600000.00,
    NULL,
    '2025-09-29 17:11:50',
    '2025-09-29 17:11:50',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    2.00,
    2.00,
    2.00,
    22,
    22,
    300000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    46,
    16,
    45,
    3,
    2.00,
    13043.48,
    600000.00,
    NULL,
    '2025-09-29 17:13:59',
    '2025-09-29 17:13:59',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    2.00,
    2.00,
    2.00,
    23,
    23,
    300000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    47,
    16,
    46,
    4,
    1.00,
    15217.39,
    350000.00,
    NULL,
    '2025-09-29 17:16:20',
    '2025-09-29 17:16:20',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    1.00,
    1.00,
    1.00,
    23,
    23,
    350000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    48,
    16,
    47,
    3,
    1.00,
    15000.00,
    300000.00,
    NULL,
    '2025-09-29 17:20:17',
    '2025-09-29 17:20:17',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    1.00,
    1.00,
    1.00,
    23,
    23,
    300000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    49,
    16,
    48,
    3,
    2.00,
    14000.00,
    700000.00,
    NULL,
    '2025-09-29 17:24:20',
    '2025-09-29 17:24:20',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    2.00,
    2.00,
    2.00,
    25,
    25,
    350000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    50,
    16,
    49,
    4,
    1.00,
    17500.00,
    350000.00,
    NULL,
    '2025-09-29 17:28:04',
    '2025-09-29 17:28:04',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    1.00,
    1.00,
    1.00,
    20,
    20,
    350000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    51,
    16,
    50,
    3,
    1.00,
    15000.00,
    350000.00,
    NULL,
    '2025-09-29 17:31:00',
    '2025-09-29 17:31:00',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    1.00,
    1.00,
    1.00,
    20,
    20,
    350000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    52,
    16,
    51,
    3,
    1.00,
    17500.00,
    350000.00,
    NULL,
    '2025-09-29 17:31:52',
    '2025-09-29 17:31:52',
    NULL,
    'WEQWEDSD12',
    'CAJA',
    10.00,
    1.00,
    1.00,
    1.00,
    20,
    20,
    350000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    53,
    18,
    52,
    1,
    30.00,
    3500.00,
    0.00,
    NULL,
    '2025-09-29 17:50:17',
    '2025-09-29 22:49:41',
    NULL,
    'REPUESTO112138',
    'CAJA',
    10.00,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    54,
    19,
    53,
    1,
    60.00,
    6666.67,
    0.00,
    NULL,
    '2025-09-29 17:56:32',
    '2025-09-29 20:11:31',
    NULL,
    'REPUESTO223334',
    'CAJA',
    10.00,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    55,
    20,
    54,
    1,
    60.00,
    6666.67,
    0.00,
    NULL,
    '2025-09-29 18:01:05',
    '2025-09-29 20:14:16',
    NULL,
    'REPUESTO223335',
    'CAJA',
    10.00,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    56,
    21,
    55,
    1,
    60.00,
    6666.67,
    0.00,
    NULL,
    '2025-09-29 18:04:09',
    '2025-09-29 20:14:40',
    NULL,
    'REPUESTO223338',
    'CAJA',
    10.00,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    57,
    22,
    56,
    1,
    60.00,
    6666.67,
    0.00,
    NULL,
    '2025-09-29 18:09:28',
    '2025-09-29 20:14:50',
    NULL,
    'REPUESTO2235566',
    'CAJA',
    10.00,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    58,
    23,
    57,
    1,
    60.00,
    6666.67,
    0.00,
    NULL,
    '2025-09-29 18:12:34',
    '2025-09-29 23:10:51',
    '2025-09-29 23:10:51',
    'REPUESTO22523335566',
    'CAJA',
    10.00,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    59,
    24,
    58,
    1,
    60.00,
    3000.00,
    0.00,
    NULL,
    '2025-09-29 18:18:20',
    '2025-09-29 18:18:20',
    NULL,
    'UOIUOIUOIUOI',
    'CAJA',
    10.00,
    60.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    60,
    25,
    59,
    1,
    60.00,
    3000.00,
    0.00,
    NULL,
    '2025-09-29 18:21:23',
    '2025-09-29 18:21:23',
    NULL,
    'DFASDF23434',
    'CAJA',
    10.00,
    60.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    61,
    25,
    60,
    4,
    2.00,
    3000.00,
    180000.00,
    NULL,
    '2025-09-29 18:22:23',
    '2025-09-29 18:22:23',
    NULL,
    'DFASDF23434',
    'CAJA',
    10.00,
    2.00,
    2.00,
    2.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    62,
    26,
    61,
    1,
    100.00,
    3500.00,
    350000.00,
    NULL,
    '2025-09-29 18:30:14',
    '2025-09-29 18:30:14',
    NULL,
    'TESTNORMAL2',
    'UNIDAD',
    10.00,
    100.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    63,
    25,
    62,
    3,
    1.00,
    3000.00,
    90000.00,
    NULL,
    '2025-09-29 20:00:27',
    '2025-09-29 20:00:27',
    NULL,
    'DFASDF23434',
    'CAJA',
    10.00,
    1.00,
    1.00,
    1.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    64,
    25,
    63,
    3,
    2.00,
    3000.00,
    180000.00,
    NULL,
    '2025-09-29 20:01:06',
    '2025-09-29 20:01:06',
    NULL,
    'DFASDF23434',
    'CAJA',
    10.00,
    2.00,
    2.00,
    2.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    65,
    25,
    64,
    4,
    2.00,
    3000.00,
    180000.00,
    NULL,
    '2025-09-29 23:10:36',
    '2025-09-29 23:10:36',
    NULL,
    'DFASDF23434',
    'CAJA',
    10.00,
    2.00,
    2.00,
    2.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    66,
    25,
    65,
    4,
    2.00,
    3000.00,
    180000.00,
    NULL,
    '2025-09-29 23:45:40',
    '2025-09-29 23:45:40',
    NULL,
    'DFASDF23434',
    'CAJA',
    10.00,
    2.00,
    2.00,
    2.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    67,
    25,
    66,
    3,
    2.00,
    3000.00,
    180000.00,
    NULL,
    '2025-09-29 23:47:04',
    '2025-09-29 23:47:28',
    '2025-09-29 23:47:28',
    'DFASDF23434',
    'CAJA',
    10.00,
    0.00,
    2.00,
    2.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    68,
    25,
    67,
    4,
    3.00,
    10000.00,
    900000.00,
    NULL,
    '2025-09-29 23:56:29',
    '2025-09-29 23:57:23',
    '2025-09-29 23:57:23',
    'DFASDF23434',
    'CAJA',
    10.00,
    0.00,
    3.00,
    3.00,
    30,
    30,
    300000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    69,
    27,
    68,
    1,
    30.00,
    3000.00,
    0.00,
    NULL,
    '2025-10-02 20:52:38',
    '2025-10-02 20:52:38',
    NULL,
    'TESTCANTCAJA',
    'CAJA',
    10.00,
    30.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    70,
    28,
    69,
    1,
    30.00,
    3000.00,
    90000.00,
    NULL,
    '2025-10-02 21:00:49',
    '2025-10-02 21:00:49',
    NULL,
    'TESTCANTCAJA1',
    'CAJA',
    10.00,
    30.00,
    1.00,
    1.00,
    30,
    30,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    71,
    29,
    70,
    1,
    30.00,
    3000.00,
    90000.00,
    NULL,
    '2025-10-02 21:04:12',
    '2025-10-02 21:04:12',
    NULL,
    'TESTCANTCAJA2',
    'CAJA',
    10.00,
    30.00,
    1.00,
    1.00,
    30,
    30,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    72,
    30,
    71,
    1,
    30.00,
    3000.00,
    90000.00,
    NULL,
    '2025-10-02 21:07:48',
    '2025-10-02 21:07:48',
    NULL,
    'TESTCANTCAJA3',
    'CAJA',
    10.00,
    30.00,
    1.00,
    1.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    73,
    31,
    72,
    1,
    30.00,
    3000.00,
    90000.00,
    NULL,
    '2025-10-02 21:17:17',
    '2025-10-02 21:19:55',
    '2025-10-02 21:19:55',
    'TESTCANTCAJA4',
    'CAJA',
    10.00,
    0.00,
    1.00,
    1.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    74,
    31,
    73,
    4,
    1.00,
    3000.00,
    90000.00,
    NULL,
    '2025-10-02 21:18:21',
    '2025-10-02 21:18:21',
    NULL,
    'TESTCANTCAJA4',
    'CAJA',
    10.00,
    1.00,
    1.00,
    1.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    75,
    31,
    74,
    4,
    1.00,
    3000.00,
    90000.00,
    NULL,
    '2025-10-03 09:41:22',
    '2025-10-03 09:42:26',
    '2025-10-03 09:42:26',
    'TESTCANTCAJA4',
    'CAJA',
    10.00,
    0.00,
    1.00,
    1.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    76,
    31,
    75,
    4,
    1.00,
    3000.00,
    90000.00,
    NULL,
    '2025-10-03 10:03:04',
    '2025-10-03 10:03:04',
    NULL,
    'TESTCANTCAJA4',
    'CAJA',
    10.00,
    1.00,
    1.00,
    1.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    77,
    31,
    76,
    4,
    1.00,
    3000.00,
    90000.00,
    NULL,
    '2025-10-03 10:23:30',
    '2025-10-03 10:24:06',
    '2025-10-03 10:24:06',
    'TESTCANTCAJA4',
    'CAJA',
    10.00,
    0.00,
    1.00,
    1.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    78,
    31,
    77,
    4,
    1.00,
    3000.00,
    90000.00,
    NULL,
    '2025-10-03 10:25:01',
    '2025-10-03 10:25:20',
    '2025-10-03 10:25:20',
    'TESTCANTCAJA4',
    'CAJA',
    10.00,
    0.00,
    1.00,
    1.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    79,
    31,
    78,
    4,
    1.00,
    3000.00,
    90000.00,
    NULL,
    '2025-10-03 13:45:21',
    '2025-10-03 13:45:31',
    '2025-10-03 13:45:31',
    'TESTCANTCAJA4',
    'CAJA',
    10.00,
    0.00,
    1.00,
    1.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    80,
    32,
    79,
    1,
    30.00,
    3000.00,
    90000.00,
    NULL,
    '2025-10-03 13:46:23',
    '2025-10-03 13:46:23',
    NULL,
    'TESTCANTCAJA5',
    'CAJA',
    10.00,
    30.00,
    1.00,
    1.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    81,
    32,
    80,
    4,
    1.00,
    3000.00,
    90000.00,
    NULL,
    '2025-10-03 13:47:03',
    '2025-10-03 13:52:06',
    '2025-10-03 13:52:06',
    'TESTCANTCAJA5',
    'CAJA',
    10.00,
    0.00,
    1.00,
    1.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    82,
    32,
    81,
    4,
    1.00,
    3172.41,
    92000.00,
    NULL,
    '2025-10-03 13:53:06',
    '2025-10-03 13:53:37',
    '2025-10-03 13:53:37',
    'TESTCANTCAJA5',
    'CAJA',
    10.00,
    0.00,
    1.00,
    1.00,
    29,
    29,
    92000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    83,
    32,
    82,
    4,
    1.00,
    3172.41,
    92000.00,
    NULL,
    '2025-10-03 14:07:03',
    '2025-10-03 14:07:03',
    NULL,
    'TESTCANTCAJA5',
    'CAJA',
    10.00,
    1.00,
    1.00,
    1.00,
    29,
    29,
    92000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    84,
    32,
    83,
    4,
    1.00,
    3000.00,
    90000.00,
    NULL,
    '2025-10-03 14:07:34',
    '2025-10-03 14:08:56',
    '2025-10-03 14:08:56',
    'TESTCANTCAJA5',
    'CAJA',
    10.00,
    0.00,
    1.00,
    1.00,
    30,
    30,
    90000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    85,
    33,
    84,
    1,
    0.00,
    3500.00,
    0.00,
    NULL,
    '2025-10-13 10:35:17',
    '2025-10-13 10:35:17',
    NULL,
    'REPUESTO12',
    'UNIDAD',
    10.00,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    86,
    34,
    85,
    1,
    0.00,
    3500.00,
    0.00,
    NULL,
    '2025-10-13 12:32:40',
    '2025-10-13 12:32:40',
    NULL,
    'REPUESTO15',
    'UNIDAD',
    10.00,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    87,
    34,
    86,
    4,
    3.00,
    3500.00,
    10500.00,
    NULL,
    '2025-10-13 12:46:25',
    '2025-10-13 12:46:25',
    NULL,
    'REPUESTO15',
    'UNIDAD',
    10.00,
    3.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    88,
    35,
    87,
    1,
    20.00,
    3000.00,
    60060.00,
    NULL,
    '2025-10-14 10:11:44',
    '2025-10-14 22:58:06',
    NULL,
    'REPUESTO16',
    'CAJA',
    10.00,
    0.00,
    1.43,
    1.43,
    14,
    14,
    42000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    89,
    35,
    88,
    4,
    1.50,
    3000.00,
    21000.00,
    NULL,
    '2025-10-14 14:35:55',
    '2025-10-15 00:22:35',
    NULL,
    'REPUESTO16',
    'CAJA',
    10.00,
    1.00,
    0.14,
    0.11,
    14,
    2,
    42000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    90,
    35,
    89,
    4,
    2.00,
    3071.43,
    43000.00,
    NULL,
    '2025-10-14 14:39:33',
    '2025-10-15 00:22:35',
    NULL,
    'REPUESTO16',
    'CAJA',
    10.00,
    1.50,
    0.18,
    0.14,
    14,
    2,
    43000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    91,
    35,
    90,
    4,
    1.00,
    2857.14,
    40000.00,
    NULL,
    '2025-10-14 14:40:10',
    '2025-10-14 14:40:10',
    NULL,
    'REPUESTO16',
    'CAJA',
    10.00,
    1.00,
    1.00,
    1.00,
    14,
    14,
    40000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    92,
    36,
    91,
    1,
    9.00,
    3000.00,
    27000.00,
    NULL,
    '2025-10-14 16:30:44',
    '2025-10-14 16:30:44',
    NULL,
    'REPUESTO17',
    'UNIDAD',
    10.00,
    9.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    93,
    37,
    92,
    1,
    0.00,
    3000.00,
    0.00,
    NULL,
    '2025-10-14 16:31:06',
    '2025-10-14 16:31:06',
    NULL,
    'REPUESTO18',
    'UNIDAD',
    10.00,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    94,
    35,
    93,
    4,
    1.00,
    2857.14,
    40000.00,
    NULL,
    '2025-10-14 16:31:30',
    '2025-10-14 16:31:30',
    NULL,
    'REPUESTO16',
    'CAJA',
    10.00,
    1.00,
    1.00,
    1.00,
    14,
    14,
    40000.00
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    95,
    37,
    93,
    4,
    10.00,
    3000.00,
    30000.00,
    NULL,
    '2025-10-14 16:31:30',
    '2025-10-14 16:31:30',
    NULL,
    'REPUESTO18',
    'UNIDAD',
    10.00,
    10.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    96,
    36,
    93,
    4,
    1.00,
    3000.00,
    3000.00,
    NULL,
    '2025-10-14 16:31:30',
    '2025-10-14 16:31:30',
    NULL,
    'REPUESTO17',
    'UNIDAD',
    10.00,
    1.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    97,
    38,
    94,
    1,
    0.00,
    3000.00,
    0.00,
    NULL,
    '2025-10-14 16:34:16',
    '2025-10-14 16:34:16',
    NULL,
    'REPUESTO19',
    'UNIDAD',
    10.00,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    98,
    37,
    95,
    4,
    5.00,
    3000.00,
    15000.00,
    NULL,
    '2025-10-14 16:35:24',
    '2025-10-14 16:43:44',
    '2025-10-14 16:43:44',
    'REPUESTO18',
    'UNIDAD',
    10.00,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    99,
    38,
    95,
    4,
    1.00,
    3000.00,
    3000.00,
    NULL,
    '2025-10-14 16:35:24',
    '2025-10-14 16:43:44',
    '2025-10-14 16:43:44',
    'REPUESTO19',
    'UNIDAD',
    10.00,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_compra` (
    `iddetalle`,
    `idproducto`,
    `idcompra`,
    `idproveedor`,
    `cantidad`,
    `precio`,
    `sub_total`,
    `fecha_vencimiento`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `nombre_producto`,
    `unidad_medida`,
    `iva`,
    `stock_restante`,
    `cant_cajas`,
    `cant_cajas_restante`,
    `cant_p_caja`,
    `cant_p_caja_restante`,
    `precio_compra_caja`
  )
VALUES
  (
    100,
    35,
    96,
    4,
    1.00,
    2500.00,
    35000.00,
    NULL,
    '2025-10-14 16:55:07',
    '2025-10-14 16:55:32',
    '2025-10-14 16:55:32',
    'REPUESTO16',
    'CAJA',
    10.00,
    0.00,
    1.00,
    1.00,
    14,
    14,
    35000.00
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalle_pago_deuda_compra
# ------------------------------------------------------------

INSERT INTO
  `detalle_pago_deuda_compra` (
    `idpago_deuda_compra`,
    `iddeuda_compra`,
    `monto_pagado`,
    `fecha_pago`,
    `observacion`,
    `metodo_pago`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    1,
    1,
    1.00,
    '2025-09-04 15:56:50',
    '---',
    'Desconocido',
    'sistema',
    '2025-09-04 15:56:50',
    '2025-09-04 15:56:50',
    NULL
  );
INSERT INTO
  `detalle_pago_deuda_compra` (
    `idpago_deuda_compra`,
    `iddeuda_compra`,
    `monto_pagado`,
    `fecha_pago`,
    `observacion`,
    `metodo_pago`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    2,
    1,
    9.00,
    '2025-09-13 15:18:22',
    '---',
    'Desconocido',
    'sistema',
    '2025-09-13 15:18:22',
    '2025-09-13 15:18:22',
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalle_pago_deuda_venta
# ------------------------------------------------------------

INSERT INTO
  `detalle_pago_deuda_venta` (
    `idpago_deuda`,
    `iddeuda`,
    `total_deuda`,
    `total_pagado`,
    `saldo`,
    `monto_pagado`,
    `fecha_pago`,
    `observacion`,
    `idformapago`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    1,
    1,
    3500.00,
    2500.00,
    1000.00,
    2500.00,
    '2025-08-11 18:42:44',
    'test',
    1,
    1,
    '2025-08-11 18:42:44',
    '2025-08-11 18:42:44',
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_pago_deuda_venta` (
    `idpago_deuda`,
    `iddeuda`,
    `total_deuda`,
    `total_pagado`,
    `saldo`,
    `monto_pagado`,
    `fecha_pago`,
    `observacion`,
    `idformapago`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    2,
    2,
    3500.00,
    1.00,
    3499.00,
    1.00,
    '2025-09-02 03:35:00',
    'test',
    1,
    1,
    '2025-09-02 03:35:00',
    '2025-09-02 03:35:00',
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_pago_deuda_venta` (
    `idpago_deuda`,
    `iddeuda`,
    `total_deuda`,
    `total_pagado`,
    `saldo`,
    `monto_pagado`,
    `fecha_pago`,
    `observacion`,
    `idformapago`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    3,
    2,
    3500.00,
    1001.00,
    2499.00,
    1000.00,
    '2025-09-12 21:50:37',
    '---',
    1,
    1,
    '2025-09-12 21:50:37',
    '2025-09-12 21:50:37',
    NULL,
    NULL,
    NULL,
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalle_producto
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalle_tarjeta_venta
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalle_tarjeta_venta_cobro
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalle_transferencia_cobro
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalle_transferencia_compra_pago
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalle_venta
# ------------------------------------------------------------

INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    1,
    1,
    1,
    'TESTPRODUCT',
    1.00,
    3500.00,
    2500.00,
    1000.00,
    3500.00,
    '2025-08-11 17:50:14',
    '2025-08-11 17:50:14',
    NULL,
    0.00,
    318.18,
    1,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    2,
    2,
    1,
    'TESTPRODUCT',
    1.00,
    3500.00,
    2500.00,
    0.00,
    3500.00,
    '2025-08-11 17:57:12',
    '2025-08-11 17:57:12',
    NULL,
    0.00,
    318.18,
    1,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    3,
    3,
    1,
    'TESTPRODUCT',
    1.00,
    3500.00,
    2500.00,
    0.00,
    3500.00,
    '2025-08-18 20:35:30',
    '2025-08-18 20:35:30',
    NULL,
    0.00,
    318.18,
    1,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    4,
    4,
    2,
    'TEST1',
    1.00,
    4500.00,
    3200.00,
    1300.00,
    4500.00,
    '2025-09-03 08:01:40',
    '2025-09-03 08:01:40',
    NULL,
    0.00,
    409.09,
    3,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    5,
    5,
    2,
    'TEST1',
    1.00,
    4500.00,
    3200.00,
    1300.00,
    4500.00,
    '2025-09-03 08:12:46',
    '2025-09-03 08:12:46',
    NULL,
    0.00,
    409.09,
    3,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    6,
    6,
    2,
    'TEST1',
    1.00,
    4500.00,
    3200.00,
    1300.00,
    4500.00,
    '2025-09-03 09:14:55',
    '2025-09-03 09:14:55',
    NULL,
    0.00,
    409.09,
    3,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    7,
    7,
    2,
    'TEST1',
    1.00,
    4500.00,
    3200.00,
    1300.00,
    4500.00,
    '2025-09-03 09:30:01',
    '2025-09-03 09:30:01',
    NULL,
    0.00,
    409.09,
    3,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    8,
    8,
    2,
    'TEST1',
    1.00,
    4500.00,
    3200.00,
    1300.00,
    4500.00,
    '2025-09-03 09:52:52',
    '2025-09-03 09:52:52',
    NULL,
    0.00,
    409.09,
    3,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    9,
    9,
    2,
    'TEST1',
    1.00,
    4500.00,
    3200.00,
    1300.00,
    4500.00,
    '2025-09-03 10:11:16',
    '2025-09-03 10:11:16',
    NULL,
    0.00,
    409.09,
    3,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    10,
    9,
    1,
    'TESTPRODUCT2',
    1.00,
    3500.00,
    2500.00,
    1000.00,
    3500.00,
    '2025-09-03 10:11:16',
    '2025-09-03 10:11:16',
    NULL,
    0.00,
    318.18,
    1,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    11,
    10,
    2,
    'TEST1',
    1.00,
    4500.00,
    3200.00,
    1300.00,
    4500.00,
    '2025-09-06 15:22:59',
    '2025-09-06 15:22:59',
    NULL,
    0.00,
    409.09,
    3,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    12,
    10,
    3,
    'GALLETA',
    0.60,
    4500.00,
    3000.00,
    900.00,
    2700.00,
    '2025-09-06 15:22:59',
    '2025-09-06 15:22:59',
    NULL,
    0.00,
    245.45,
    7,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    13,
    11,
    3,
    'GALLETA',
    0.10,
    4500.00,
    3000.00,
    150.00,
    450.00,
    '2025-09-06 15:26:59',
    '2025-09-06 15:26:59',
    NULL,
    0.00,
    40.91,
    7,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    14,
    12,
    4,
    'REPUESTO1',
    1.00,
    4500.00,
    3000.00,
    1500.00,
    4500.00,
    '2025-09-06 20:21:48',
    '2025-09-06 20:21:48',
    NULL,
    0.00,
    409.09,
    8,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    15,
    13,
    4,
    'REPUESTO1',
    1.00,
    4500.00,
    3000.00,
    1500.00,
    4500.00,
    '2025-09-06 20:25:15',
    '2025-09-06 20:25:15',
    NULL,
    0.00,
    409.09,
    8,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    16,
    14,
    8,
    'REPUESTO4',
    0.20,
    4250.00,
    3520.00,
    146.00,
    850.00,
    '2025-09-07 08:34:54',
    '2025-09-07 08:34:54',
    NULL,
    0.00,
    77.27,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    17,
    15,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-07 08:55:10',
    '2025-09-07 08:55:10',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    18,
    15,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 08:55:10',
    '2025-09-07 08:55:10',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    19,
    16,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-07 09:08:16',
    '2025-09-07 09:08:16',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    20,
    16,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 09:08:16',
    '2025-09-07 09:08:16',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    21,
    17,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-07 09:54:02',
    '2025-09-07 09:54:02',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    22,
    18,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-07 11:42:18',
    '2025-09-07 11:42:18',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    23,
    19,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-07 11:42:44',
    '2025-09-07 11:42:44',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    24,
    20,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-07 11:43:03',
    '2025-09-07 11:43:03',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    25,
    21,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-07 11:43:16',
    '2025-09-07 11:43:16',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    26,
    22,
    8,
    'REPUESTO4',
    0.20,
    4250.00,
    3520.00,
    146.00,
    850.00,
    '2025-09-07 11:44:54',
    '2025-09-07 11:44:54',
    NULL,
    0.00,
    77.27,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    27,
    23,
    8,
    'REPUESTO4',
    0.20,
    4250.00,
    3520.00,
    146.00,
    850.00,
    '2025-09-07 11:46:16',
    '2025-09-07 11:46:16',
    NULL,
    0.00,
    77.27,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    28,
    23,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 11:46:16',
    '2025-09-07 11:46:16',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    29,
    24,
    7,
    'REPUESTO3',
    3.00,
    4500.00,
    3500.00,
    3000.00,
    13500.00,
    '2025-09-07 15:27:31',
    '2025-09-07 15:27:31',
    NULL,
    642.86,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    30,
    24,
    8,
    'REPUESTO4',
    0.20,
    4250.00,
    3520.00,
    146.00,
    850.00,
    '2025-09-07 15:27:31',
    '2025-09-07 15:27:31',
    NULL,
    0.00,
    77.27,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    31,
    25,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-07 15:29:03',
    '2025-09-07 15:29:03',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    32,
    26,
    7,
    'REPUESTO3',
    2.00,
    4500.00,
    3500.00,
    2000.00,
    9000.00,
    '2025-09-07 15:53:29',
    '2025-09-07 15:53:29',
    NULL,
    428.57,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    33,
    26,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-07 15:53:29',
    '2025-09-07 15:53:29',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    34,
    27,
    7,
    'REPUESTO3',
    2.00,
    4500.00,
    3500.00,
    2000.00,
    9000.00,
    '2025-09-07 15:54:21',
    '2025-09-07 15:54:21',
    NULL,
    428.57,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    35,
    28,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 15:59:53',
    '2025-09-07 15:59:53',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    36,
    29,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 16:09:55',
    '2025-09-07 16:09:55',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    37,
    29,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-07 16:09:55',
    '2025-09-07 16:09:55',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    38,
    30,
    7,
    'REPUESTO3',
    2.00,
    4500.00,
    3500.00,
    2000.00,
    9000.00,
    '2025-09-07 16:19:03',
    '2025-09-07 16:19:03',
    NULL,
    428.57,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    39,
    30,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-07 16:19:03',
    '2025-09-07 16:19:03',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    40,
    31,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 16:28:43',
    '2025-09-07 16:28:43',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    41,
    32,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 16:46:26',
    '2025-09-07 16:46:26',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    42,
    32,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-07 16:46:26',
    '2025-09-07 16:46:26',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    43,
    33,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 16:51:53',
    '2025-09-07 16:51:53',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    44,
    33,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-07 16:51:53',
    '2025-09-07 16:51:53',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    45,
    34,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 16:54:03',
    '2025-09-07 16:54:03',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    46,
    35,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 16:59:11',
    '2025-09-07 16:59:11',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    47,
    36,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-07 18:30:33',
    '2025-09-07 18:30:33',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    48,
    36,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 18:30:33',
    '2025-09-07 18:30:33',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    49,
    37,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 18:42:09',
    '2025-09-07 18:42:09',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    50,
    38,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 18:49:04',
    '2025-09-07 18:49:04',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    51,
    38,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-07 18:49:04',
    '2025-09-07 18:49:04',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    52,
    41,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 19:29:27',
    '2025-09-07 19:29:27',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    53,
    42,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 19:30:12',
    '2025-09-07 19:30:12',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    54,
    43,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 19:35:26',
    '2025-09-07 19:35:26',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    55,
    44,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 19:42:49',
    '2025-09-07 19:42:49',
    NULL,
    214.29,
    0.00,
    11,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    56,
    45,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-07 19:53:01',
    '2025-09-07 19:53:01',
    NULL,
    214.29,
    0.00,
    11,
    1000.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    57,
    46,
    7,
    'REPUESTO3',
    1.00,
    4500.00,
    3500.00,
    0.00,
    3500.00,
    '2025-09-07 20:33:30',
    '2025-09-07 20:33:30',
    NULL,
    166.67,
    0.00,
    11,
    1000.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    58,
    47,
    8,
    'REPUESTO4',
    0.20,
    4250.00,
    3520.00,
    134.00,
    838.00,
    '2025-09-07 20:37:15',
    '2025-09-07 20:37:15',
    NULL,
    0.00,
    76.18,
    12,
    12.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    59,
    47,
    5,
    'REPUESTO2',
    1.00,
    3500.00,
    2500.00,
    0.00,
    2500.00,
    '2025-09-07 20:37:15',
    '2025-09-07 20:37:15',
    NULL,
    0.00,
    227.27,
    10,
    1000.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    60,
    48,
    5,
    'REPUESTO2',
    1.00,
    3500.00,
    2500.00,
    500.00,
    3000.00,
    '2025-09-07 20:59:36',
    '2025-09-07 20:59:36',
    NULL,
    0.00,
    272.73,
    10,
    500.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    61,
    49,
    5,
    'REPUESTO2',
    1.00,
    3500.00,
    2500.00,
    -70.06,
    2429.94,
    '2025-09-07 21:13:22',
    '2025-09-07 21:13:22',
    NULL,
    0.00,
    220.90,
    10,
    1070.06,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    62,
    49,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    -56.94,
    295.06,
    '2025-09-07 21:13:22',
    '2025-09-07 21:13:22',
    NULL,
    0.00,
    26.82,
    12,
    129.94,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    63,
    50,
    5,
    'REPUESTO2',
    1.00,
    3500.00,
    2500.00,
    800.00,
    3300.00,
    '2025-09-07 23:44:02',
    '2025-09-07 23:44:02',
    NULL,
    0.00,
    300.00,
    10,
    200.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    64,
    51,
    5,
    'REPUESTO2',
    1.00,
    3500.00,
    2500.00,
    800.00,
    3300.00,
    '2025-09-07 23:44:26',
    '2025-09-07 23:44:26',
    NULL,
    0.00,
    300.00,
    10,
    200.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    65,
    52,
    5,
    'REPUESTO2',
    1.00,
    3500.00,
    2500.00,
    980.00,
    3480.00,
    '2025-09-07 23:44:54',
    '2025-09-07 23:44:54',
    NULL,
    0.00,
    316.36,
    10,
    20.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    66,
    53,
    5,
    'REPUESTO2',
    1.00,
    3500.00,
    2500.00,
    980.00,
    3480.00,
    '2025-09-07 23:45:47',
    '2025-09-07 23:45:47',
    NULL,
    0.00,
    316.36,
    10,
    20.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    67,
    54,
    5,
    'REPUESTO2',
    1.00,
    3500.00,
    2500.00,
    980.00,
    3480.00,
    '2025-09-07 23:55:53',
    '2025-09-07 23:55:53',
    NULL,
    0.00,
    316.36,
    10,
    20.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    68,
    55,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    63.00,
    415.00,
    '2025-09-08 21:18:51',
    '2025-09-08 21:18:51',
    NULL,
    0.00,
    37.73,
    12,
    10.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    69,
    56,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    63.00,
    415.00,
    '2025-09-08 22:17:45',
    '2025-09-08 22:17:45',
    NULL,
    0.00,
    37.73,
    12,
    10.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    70,
    57,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-08 22:24:45',
    '2025-09-08 22:24:45',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    71,
    58,
    5,
    'REPUESTO2',
    1.00,
    3500.00,
    2500.00,
    1000.00,
    3500.00,
    '2025-09-08 22:38:05',
    '2025-09-08 22:38:05',
    NULL,
    0.00,
    318.18,
    10,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    72,
    59,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-08 22:48:19',
    '2025-09-08 22:48:19',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    73,
    60,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    73.00,
    425.00,
    '2025-09-08 22:48:47',
    '2025-09-08 22:48:47',
    NULL,
    0.00,
    38.64,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    74,
    61,
    8,
    'REPUESTO4',
    0.10,
    4250.00,
    3520.00,
    63.00,
    415.00,
    '2025-09-08 22:50:18',
    '2025-09-08 22:50:18',
    NULL,
    0.00,
    37.73,
    12,
    10.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    75,
    62,
    5,
    'REPUESTO2',
    1.00,
    3500.00,
    2500.00,
    1000.00,
    3500.00,
    '2025-09-10 19:44:59',
    '2025-09-10 19:44:59',
    NULL,
    0.00,
    318.18,
    10,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    76,
    63,
    5,
    'REPUESTO2',
    2.00,
    3500.00,
    2500.00,
    1000.00,
    6000.00,
    '2025-09-13 10:34:09',
    '2025-09-13 10:34:09',
    NULL,
    0.00,
    545.45,
    10,
    1000.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    77,
    64,
    5,
    'REPUESTO2',
    1.00,
    3500.00,
    2500.00,
    0.00,
    2500.00,
    '2025-09-13 10:51:11',
    '2025-09-13 10:51:11',
    NULL,
    0.00,
    227.27,
    10,
    1000.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    78,
    65,
    8,
    'REPUESTO4',
    1.00,
    4250.00,
    3520.00,
    0.00,
    4250.00,
    '2025-09-15 00:00:00',
    '2025-09-15 00:00:00',
    NULL,
    0.00,
    386.36,
    12,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    79,
    66,
    10,
    'TEST',
    1.00,
    4500.00,
    3424.00,
    1076.00,
    4500.00,
    '2025-09-16 18:38:45',
    '2025-09-16 18:38:45',
    NULL,
    0.00,
    409.09,
    15,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    80,
    67,
    1,
    'TESTPRODUCT2',
    1.00,
    3500.00,
    2500.00,
    0.00,
    3500.00,
    '2025-09-18 00:00:00',
    '2025-09-18 00:00:00',
    NULL,
    0.00,
    318.18,
    1,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    81,
    68,
    2,
    'TEST1',
    1.00,
    4500.00,
    3200.00,
    0.00,
    4500.00,
    '2025-09-21 17:43:30',
    '2025-09-21 17:43:30',
    NULL,
    0.00,
    409.09,
    3,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    82,
    69,
    2,
    'TEST1',
    1.00,
    4500.00,
    3200.00,
    0.00,
    4500.00,
    '2025-09-21 17:43:33',
    '2025-09-21 17:43:33',
    NULL,
    0.00,
    409.09,
    3,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    83,
    70,
    5,
    'REPUESTO2',
    1.00,
    3500.00,
    2500.00,
    0.00,
    3500.00,
    '2025-09-21 17:43:35',
    '2025-09-21 17:43:35',
    NULL,
    0.00,
    318.18,
    10,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    84,
    71,
    11,
    'DSAFASDF',
    1.00,
    4500.00,
    3500.00,
    1000.00,
    4500.00,
    '2025-09-23 08:56:12',
    '2025-09-23 08:56:12',
    NULL,
    0.00,
    409.09,
    16,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    85,
    72,
    14,
    'TESASDFASDF',
    5.00,
    3000.00,
    2000.00,
    5000.00,
    15000.00,
    '2025-09-24 18:31:00',
    '2025-09-24 18:31:00',
    NULL,
    0.00,
    1363.64,
    19,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    86,
    73,
    14,
    'TESASDFASDF',
    1.00,
    3000.00,
    2000.00,
    0.00,
    3000.00,
    '2025-09-24 18:34:30',
    '2025-09-24 18:34:30',
    NULL,
    0.00,
    272.73,
    19,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    87,
    74,
    13,
    'TESTPRODUCTO2',
    1.00,
    5000.00,
    2500.00,
    2500.00,
    5000.00,
    '2025-09-26 21:59:11',
    '2025-09-26 21:59:11',
    NULL,
    0.00,
    454.55,
    18,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    88,
    75,
    35,
    'REPUESTO16',
    17.00,
    5000.00,
    2857.14,
    36428.62,
    85000.00,
    '2025-10-14 18:45:34',
    '2025-10-14 18:45:34',
    NULL,
    0.00,
    7727.27,
    88,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    89,
    76,
    35,
    'REPUESTO16',
    2.00,
    5000.00,
    2857.14,
    4285.72,
    10000.00,
    '2025-10-14 18:51:44',
    '2025-10-14 18:51:44',
    NULL,
    0.00,
    909.09,
    88,
    0.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    90,
    77,
    35,
    'REPUESTO16',
    1.00,
    5000.00,
    2857.14,
    2142.86,
    5000.00,
    '2025-10-14 22:58:06',
    '2025-10-14 22:58:06',
    NULL,
    0.00,
    454.55,
    88,
    0.00,
    70000.00,
    14,
    'CAJA',
    NULL,
    1.00
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    91,
    78,
    35,
    'REPUESTO16',
    0.50,
    5000.00,
    2857.14,
    1071.43,
    2500.00,
    '2025-10-14 23:00:16',
    '2025-10-14 23:00:16',
    NULL,
    0.00,
    227.27,
    89,
    0.00,
    70000.00,
    14,
    'CAJA',
    NULL,
    0.50
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    92,
    78,
    35,
    'REPUESTO16',
    0.50,
    5000.00,
    2857.14,
    1071.43,
    2500.00,
    '2025-10-14 23:00:16',
    '2025-10-14 23:00:16',
    NULL,
    0.00,
    227.27,
    90,
    0.00,
    70000.00,
    14,
    'CAJA',
    NULL,
    0.50
  );
INSERT INTO
  `detalle_venta` (
    `iddetalle`,
    `idventa`,
    `idproducto`,
    `nombre_producto`,
    `cantidad`,
    `precio_venta`,
    `precio_compra`,
    `ganancia`,
    `sub_total`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iva5`,
    `iva10`,
    `iddetalle_compra`,
    `descuento`,
    `precio_venta_caja`,
    `cant_p_caja`,
    `unidad_medida`,
    `cant_cajas_vender`,
    `cant_unidades_sueltas`
  )
VALUES
  (
    93,
    79,
    8,
    'REPUESTO4',
    1.00,
    4250.00,
    3520.00,
    0.00,
    4250.00,
    '2025-10-15 00:00:00',
    '2025-10-15 00:00:00',
    NULL,
    0.00,
    386.36,
    12,
    0.00,
    NULL,
    NULL,
    'KG',
    NULL,
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalles_cheque_compra
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalles_cheques_compra_pago
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalles_tarjeta_compra
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: detalles_transferencia_compra
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: deuda_compra
# ------------------------------------------------------------

INSERT INTO
  `deuda_compra` (
    `iddeuda_compra`,
    `idcompra`,
    `idproveedor`,
    `total_deuda`,
    `total_pagado`,
    `saldo`,
    `estado`,
    `fecha_deuda`,
    `fecha_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    1,
    2,
    1,
    2500.00,
    10.00,
    2490.00,
    'pendiente',
    '2025-08-11',
    NULL,
    '2025-08-11 17:56:42',
    '2025-09-13 15:18:22',
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: deuda_venta
# ------------------------------------------------------------

INSERT INTO
  `deuda_venta` (
    `iddeuda`,
    `idventa`,
    `idcliente`,
    `total_deuda`,
    `total_pagado`,
    `saldo`,
    `estado`,
    `fecha_deuda`,
    `ult_fecha_pago`,
    `costo_empresa`,
    `ganancia_credito`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    1,
    2,
    1,
    3500.00,
    2500.00,
    1000.00,
    'pendiente',
    '2025-08-11',
    '2025-08-11 18:42:44',
    2500.00,
    0.00,
    '2025-08-11 17:57:12',
    '2025-08-11 18:42:44',
    NULL
  );
INSERT INTO
  `deuda_venta` (
    `iddeuda`,
    `idventa`,
    `idcliente`,
    `total_deuda`,
    `total_pagado`,
    `saldo`,
    `estado`,
    `fecha_deuda`,
    `ult_fecha_pago`,
    `costo_empresa`,
    `ganancia_credito`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    2,
    3,
    1,
    3500.00,
    1001.00,
    2499.00,
    'pendiente',
    '2025-08-18',
    '2025-09-12 21:50:37',
    2500.00,
    -1499.00,
    '2025-08-18 20:35:30',
    '2025-09-12 21:50:37',
    NULL
  );
INSERT INTO
  `deuda_venta` (
    `iddeuda`,
    `idventa`,
    `idcliente`,
    `total_deuda`,
    `total_pagado`,
    `saldo`,
    `estado`,
    `fecha_deuda`,
    `ult_fecha_pago`,
    `costo_empresa`,
    `ganancia_credito`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    3,
    65,
    2,
    4250.00,
    0.00,
    4250.00,
    'pendiente',
    '2025-09-15',
    NULL,
    3520.00,
    -3520.00,
    '2025-09-15 00:00:00',
    '2025-09-15 00:00:00',
    NULL
  );
INSERT INTO
  `deuda_venta` (
    `iddeuda`,
    `idventa`,
    `idcliente`,
    `total_deuda`,
    `total_pagado`,
    `saldo`,
    `estado`,
    `fecha_deuda`,
    `ult_fecha_pago`,
    `costo_empresa`,
    `ganancia_credito`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    4,
    67,
    1,
    3500.00,
    0.00,
    3500.00,
    'pendiente',
    '2025-09-18',
    NULL,
    2500.00,
    -2500.00,
    '2025-09-18 00:00:00',
    '2025-09-18 00:00:00',
    NULL
  );
INSERT INTO
  `deuda_venta` (
    `iddeuda`,
    `idventa`,
    `idcliente`,
    `total_deuda`,
    `total_pagado`,
    `saldo`,
    `estado`,
    `fecha_deuda`,
    `ult_fecha_pago`,
    `costo_empresa`,
    `ganancia_credito`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    5,
    68,
    2,
    4500.00,
    0.00,
    4500.00,
    'pendiente',
    '2025-09-21',
    NULL,
    3200.00,
    -3200.00,
    '2025-09-21 17:43:30',
    '2025-09-21 17:43:30',
    NULL
  );
INSERT INTO
  `deuda_venta` (
    `iddeuda`,
    `idventa`,
    `idcliente`,
    `total_deuda`,
    `total_pagado`,
    `saldo`,
    `estado`,
    `fecha_deuda`,
    `ult_fecha_pago`,
    `costo_empresa`,
    `ganancia_credito`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    6,
    69,
    2,
    4500.00,
    0.00,
    4500.00,
    'pendiente',
    '2025-09-21',
    NULL,
    3200.00,
    -3200.00,
    '2025-09-21 17:43:33',
    '2025-09-21 17:43:33',
    NULL
  );
INSERT INTO
  `deuda_venta` (
    `iddeuda`,
    `idventa`,
    `idcliente`,
    `total_deuda`,
    `total_pagado`,
    `saldo`,
    `estado`,
    `fecha_deuda`,
    `ult_fecha_pago`,
    `costo_empresa`,
    `ganancia_credito`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    7,
    70,
    2,
    3500.00,
    0.00,
    3500.00,
    'pendiente',
    '2025-09-21',
    NULL,
    2500.00,
    -2500.00,
    '2025-09-21 17:43:35',
    '2025-09-21 17:43:35',
    NULL
  );
INSERT INTO
  `deuda_venta` (
    `iddeuda`,
    `idventa`,
    `idcliente`,
    `total_deuda`,
    `total_pagado`,
    `saldo`,
    `estado`,
    `fecha_deuda`,
    `ult_fecha_pago`,
    `costo_empresa`,
    `ganancia_credito`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    8,
    73,
    9,
    3000.00,
    0.00,
    3000.00,
    'pendiente',
    '2025-09-24',
    NULL,
    2000.00,
    -2000.00,
    '2025-09-24 18:34:30',
    '2025-09-24 18:34:30',
    NULL
  );
INSERT INTO
  `deuda_venta` (
    `iddeuda`,
    `idventa`,
    `idcliente`,
    `total_deuda`,
    `total_pagado`,
    `saldo`,
    `estado`,
    `fecha_deuda`,
    `ult_fecha_pago`,
    `costo_empresa`,
    `ganancia_credito`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    9,
    79,
    2,
    4250.00,
    0.00,
    4250.00,
    'anulada',
    '2025-10-15',
    NULL,
    3520.00,
    -3520.00,
    '2025-10-15 00:00:00',
    '2025-10-15 00:36:26',
    '2025-10-15 00:36:26'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: egresos
# ------------------------------------------------------------

INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    1,
    1,
    1,
    1,
    NULL,
    NULL,
    NULL,
    '2025-08-11',
    NULL,
    50000.00,
    'Egreso por compra ID 1',
    'Compra ID 1: TestProductx 20',
    2,
    1,
    '2025-08-11 15:43:11',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    2,
    1,
    1,
    3,
    NULL,
    NULL,
    NULL,
    '2025-08-23',
    NULL,
    32000.00,
    'Egreso por compra ID 3',
    'Compra ID 3: test1x 10',
    2,
    1,
    '2025-08-23 20:19:22',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    3,
    5,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2025-09-01',
    NULL,
    400.00,
    'test',
    'test',
    2,
    1,
    '2025-09-01 14:04:19',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    4,
    1,
    1,
    4,
    NULL,
    NULL,
    NULL,
    '2025-09-04',
    NULL,
    3200.00,
    'Egreso por compra ID 4',
    'Compra ID 4: TEST1x 1',
    3,
    1,
    '2025-09-04 14:24:14',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    5,
    1,
    1,
    5,
    NULL,
    NULL,
    NULL,
    '2025-09-04',
    NULL,
    3200.00,
    'Egreso por compra ID 5',
    'Compra ID 5: TEST1x 1',
    3,
    1,
    '2025-09-04 14:31:15',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    6,
    1,
    1,
    6,
    NULL,
    NULL,
    NULL,
    '2025-09-04',
    NULL,
    3200.00,
    'Egreso por compra ID 6',
    'Compra ID 6: TEST1x 1',
    3,
    1,
    '2025-09-04 14:32:06',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    7,
    2,
    NULL,
    2,
    1,
    NULL,
    NULL,
    '2025-09-04',
    NULL,
    1.00,
    'Egreso por pago de deuda de compra ID 1',
    '---',
    3,
    1,
    '2025-09-04 15:56:50',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    8,
    1,
    1,
    7,
    NULL,
    NULL,
    NULL,
    '2025-09-06',
    NULL,
    60000.00,
    'Egreso por compra ID 7',
    'Compra ID 7: GALLETAx 20',
    3,
    1,
    '2025-09-06 15:22:49',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    9,
    1,
    1,
    8,
    NULL,
    NULL,
    NULL,
    '2025-09-06',
    NULL,
    90000.00,
    'Egreso por compra ID 8',
    'Compra ID 8: REPUESTO1x 30',
    3,
    1,
    '2025-09-06 20:16:00',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    10,
    1,
    1,
    9,
    NULL,
    NULL,
    NULL,
    '2025-09-06',
    NULL,
    3000.00,
    'Egreso por compra ID 9',
    'Compra ID 9: REPUESTO1x 1',
    3,
    1,
    '2025-09-06 20:17:28',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    11,
    1,
    1,
    10,
    NULL,
    NULL,
    NULL,
    '2025-09-07',
    NULL,
    75000.00,
    'Egreso por compra ID 10',
    'Compra ID 10: REPUESTO2x 30',
    4,
    1,
    '2025-09-07 08:32:53',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    12,
    1,
    1,
    11,
    NULL,
    NULL,
    NULL,
    '2025-09-07',
    NULL,
    105000.00,
    'Egreso por compra ID 11',
    'Compra ID 11: REPUESTO3x 30',
    4,
    1,
    '2025-09-07 08:33:55',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    13,
    1,
    1,
    12,
    NULL,
    NULL,
    NULL,
    '2025-09-07',
    NULL,
    70400.00,
    'Egreso por compra ID 12',
    'Compra ID 12: REPUESTO4x 20',
    4,
    1,
    '2025-09-07 08:34:22',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    14,
    1,
    1,
    13,
    NULL,
    NULL,
    NULL,
    '2025-09-10',
    NULL,
    3520.00,
    'Egreso por compra ID 13',
    'Compra ID 13: REPUESTO4x 1',
    4,
    2,
    '2025-09-10 20:12:49',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    15,
    2,
    NULL,
    2,
    2,
    NULL,
    NULL,
    '2025-09-13',
    NULL,
    9.00,
    'Egreso por pago de deuda de compra ID 1',
    '---',
    4,
    1,
    '2025-09-13 15:18:22',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    16,
    1,
    1,
    14,
    NULL,
    NULL,
    NULL,
    '2025-09-13',
    NULL,
    5082.00,
    'Egreso por compra ID 14',
    'Compra ID 14: sdfdsfx 22',
    4,
    2,
    '2025-09-13 19:56:20',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    17,
    1,
    1,
    15,
    NULL,
    NULL,
    NULL,
    '2025-09-13',
    NULL,
    191744.00,
    'Egreso por compra ID 15',
    'Compra ID 15: testx 56',
    4,
    2,
    '2025-09-13 20:34:09',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    18,
    1,
    1,
    16,
    NULL,
    NULL,
    NULL,
    '2025-09-13',
    NULL,
    157500.00,
    'Egreso por compra ID 16',
    'Compra ID 16: dsafasdfx 45',
    4,
    2,
    '2025-09-13 20:37:07',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    19,
    1,
    1,
    17,
    NULL,
    NULL,
    NULL,
    '2025-09-13',
    NULL,
    65000.00,
    'Egreso por compra ID 17',
    'Compra ID 17: testidusex 20',
    4,
    2,
    '2025-09-13 20:45:05',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    20,
    14,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2025-09-21',
    NULL,
    2500.00,
    'test',
    'fsdfasdf',
    4,
    2,
    '2025-09-21 19:24:14',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    21,
    14,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2025-09-23',
    NULL,
    1500.00,
    'test',
    'test',
    4,
    1,
    '2025-09-23 08:18:31',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    22,
    15,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2025-09-23',
    NULL,
    12500.00,
    'fdsvcxv',
    'eqwewqe',
    4,
    1,
    '2025-09-23 08:30:00',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    23,
    1,
    1,
    18,
    NULL,
    NULL,
    NULL,
    '2025-09-24',
    NULL,
    50000.00,
    'Egreso por compra ID 18',
    'Compra ID 18: TestProductox 20',
    4,
    1,
    '2025-09-24 18:27:56',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    24,
    1,
    1,
    19,
    NULL,
    NULL,
    NULL,
    '2025-09-24',
    NULL,
    40000.00,
    'Egreso por compra ID 19',
    'Compra ID 19: tesasdfasdfx 20',
    4,
    1,
    '2025-09-24 18:28:47',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    25,
    1,
    1,
    20,
    NULL,
    NULL,
    NULL,
    '2025-09-24',
    NULL,
    12000.00,
    'Egreso por compra ID 20',
    'Compra ID 20: TESASDFASDFx 6',
    4,
    1,
    '2025-09-24 18:29:17',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    26,
    1,
    1,
    21,
    NULL,
    NULL,
    NULL,
    '2025-09-28',
    NULL,
    700000.00,
    'Egreso por compra ID 21',
    'Compra ID 21: cdvvadasdvx 60',
    4,
    1,
    '2025-09-28 18:15:18',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    27,
    1,
    1,
    22,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    540000.00,
    'Egreso por compra ID 22',
    'Compra ID 22: weqwedsd12x 36',
    4,
    1,
    '2025-09-28 21:32:20',
    '2025-09-29 18:31:09',
    '2025-09-29 18:31:09',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    28,
    1,
    1,
    23,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    60000.00,
    'Egreso por compra ID 23',
    'Compra ID 23: 3lkjklnm,bhjvjh5x 20',
    4,
    1,
    '2025-09-28 21:49:07',
    '2025-09-29 20:11:17',
    '2025-09-29 20:11:17',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    29,
    1,
    1,
    24,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    6000.00,
    'Egreso por compra ID 24',
    'Compra ID 24: 3LKJKLNM,BHJVJH5x 1, WEQWEDSD12x 2',
    4,
    1,
    '2025-09-29 13:49:17',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    30,
    1,
    1,
    25,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    11666.67,
    'Egreso por compra ID 25',
    'Compra ID 25: CDVVADASDVx 1',
    4,
    1,
    '2025-09-29 13:52:47',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    31,
    1,
    1,
    26,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    30000.00,
    'Egreso por compra ID 26',
    'Compra ID 26: WEQWEDSD12x 2',
    4,
    1,
    '2025-09-29 13:55:00',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    32,
    1,
    1,
    27,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    2333.33,
    'Egreso por compra ID 27',
    'Compra ID 27: CDVVADASDVx 2',
    4,
    1,
    '2025-09-29 14:08:12',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    33,
    1,
    1,
    28,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    11666.67,
    'Egreso por compra ID 28',
    'Compra ID 28: CDVVADASDVx 1',
    4,
    1,
    '2025-09-29 14:28:13',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    34,
    1,
    1,
    29,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    6000.00,
    'Egreso por compra ID 29',
    'Compra ID 29: 3LKJKLNM,BHJVJH5x 2',
    4,
    1,
    '2025-09-29 14:33:56',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    35,
    1,
    1,
    30,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    3000.00,
    'Egreso por compra ID 30',
    'Compra ID 30: 3LKJKLNM,BHJVJH5x 1',
    4,
    1,
    '2025-09-29 14:35:00',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    36,
    1,
    1,
    31,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    3000.00,
    'Egreso por compra ID 31',
    'Compra ID 31: 3LKJKLNM,BHJVJH5x 1',
    4,
    1,
    '2025-09-29 15:07:48',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    37,
    1,
    1,
    32,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    12500.00,
    'Egreso por compra ID 32',
    'Compra ID 32: WEQWEDSD12x 1',
    4,
    1,
    '2025-09-29 15:08:40',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    38,
    1,
    1,
    33,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    69230.77,
    'Egreso por compra ID 33',
    'Compra ID 33: WEQWEDSD12x 6',
    4,
    1,
    '2025-09-29 15:10:00',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    39,
    1,
    1,
    34,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    15000.00,
    'Egreso por compra ID 34',
    'Compra ID 34: WEQWEDSD12x 1',
    4,
    1,
    '2025-09-29 15:19:45',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    40,
    1,
    1,
    35,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    60000.00,
    'Egreso por compra ID 35',
    'Compra ID 35: WEQWEDSD12x 4',
    4,
    1,
    '2025-09-29 15:32:27',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    41,
    1,
    1,
    36,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    45000.00,
    'Egreso por compra ID 36',
    'Compra ID 36: WEQWEDSD12x 3',
    4,
    1,
    '2025-09-29 15:36:54',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    42,
    1,
    1,
    37,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    52500.00,
    'Egreso por compra ID 37',
    'Compra ID 37: WEQWEDSD12x 3',
    4,
    1,
    '2025-09-29 15:43:23',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    43,
    1,
    1,
    38,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    35000.00,
    'Egreso por compra ID 38',
    'Compra ID 38: CDVVADASDVx 3',
    4,
    1,
    '2025-09-29 16:23:55',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    44,
    1,
    1,
    39,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    45000.00,
    'Egreso por compra ID 39',
    'Compra ID 39: WEQWEDSD12x 3',
    4,
    1,
    '2025-09-29 16:25:25',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    45,
    1,
    1,
    40,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    13636.36,
    'Egreso por compra ID 40',
    'Compra ID 40: WEQWEDSD12x 1',
    4,
    1,
    '2025-09-29 16:26:57',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    46,
    1,
    1,
    41,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    27272.73,
    'Egreso por compra ID 41',
    'Compra ID 41: WEQWEDSD12x 2',
    4,
    1,
    '2025-09-29 16:37:05',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    47,
    1,
    1,
    42,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    39130.43,
    'Egreso por compra ID 42',
    'Compra ID 42: WEQWEDSD12x 3',
    4,
    1,
    '2025-09-29 16:43:18',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    48,
    1,
    1,
    43,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    39130.43,
    'Egreso por compra ID 43',
    'Compra ID 43: WEQWEDSD12x 3',
    4,
    1,
    '2025-09-29 16:50:20',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    49,
    1,
    1,
    44,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    27272.73,
    'Egreso por compra ID 44',
    'Compra ID 44: WEQWEDSD12x 2',
    4,
    1,
    '2025-09-29 17:11:50',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    50,
    1,
    1,
    45,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    26086.96,
    'Egreso por compra ID 45',
    'Compra ID 45: WEQWEDSD12x 2',
    4,
    1,
    '2025-09-29 17:13:59',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    51,
    1,
    1,
    46,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    15217.39,
    'Egreso por compra ID 46',
    'Compra ID 46: WEQWEDSD12x 1',
    4,
    1,
    '2025-09-29 17:16:20',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    52,
    1,
    1,
    47,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    15000.00,
    'Egreso por compra ID 47',
    'Compra ID 47: WEQWEDSD12x 1',
    4,
    1,
    '2025-09-29 17:20:17',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    53,
    1,
    1,
    48,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    28000.00,
    'Egreso por compra ID 48',
    'Compra ID 48: WEQWEDSD12x 2',
    4,
    1,
    '2025-09-29 17:24:20',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    54,
    1,
    1,
    49,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    17500.00,
    'Egreso por compra ID 49',
    'Compra ID 49: WEQWEDSD12x 1',
    4,
    1,
    '2025-09-29 17:28:04',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    55,
    1,
    1,
    50,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    15000.00,
    'Egreso por compra ID 50',
    'Compra ID 50: WEQWEDSD12x 1',
    4,
    1,
    '2025-09-29 17:31:00',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    56,
    1,
    1,
    51,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    17500.00,
    'Egreso por compra ID 51',
    'Compra ID 51: WEQWEDSD12x 1',
    4,
    1,
    '2025-09-29 17:31:52',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    57,
    1,
    1,
    52,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    105000.00,
    'Egreso por compra ID 52',
    'Compra ID 52: REPUESTO112138x 30',
    4,
    1,
    '2025-09-29 17:50:17',
    '2025-09-29 22:49:41',
    '2025-09-29 22:49:41',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    58,
    1,
    1,
    53,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    400000.00,
    'Egreso por compra ID 53',
    'Compra ID 53: REPUESTO223334x 60',
    4,
    1,
    '2025-09-29 17:56:32',
    '2025-09-29 20:11:31',
    '2025-09-29 20:11:31',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    59,
    1,
    1,
    54,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    400000.00,
    'Egreso por compra ID 54',
    'Compra ID 54: REPUESTO223335x 60',
    4,
    1,
    '2025-09-29 18:01:05',
    '2025-09-29 20:14:16',
    '2025-09-29 20:14:16',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    60,
    1,
    1,
    55,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    400000.00,
    'Egreso por compra ID 55',
    'Compra ID 55: REPUESTO223338x 60',
    4,
    1,
    '2025-09-29 18:04:09',
    '2025-09-29 20:14:40',
    '2025-09-29 20:14:40',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    61,
    1,
    1,
    56,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    400000.00,
    'Egreso por compra ID 56',
    'Compra ID 56: REPUESTO2235566x 60',
    4,
    1,
    '2025-09-29 18:09:28',
    '2025-09-29 20:14:50',
    '2025-09-29 20:14:50',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    62,
    1,
    1,
    57,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    400000.00,
    'Egreso por compra ID 57',
    'Compra ID 57: REPUESTO22523335566x 60',
    4,
    1,
    '2025-09-29 18:12:34',
    '2025-09-29 23:10:51',
    '2025-09-29 23:10:51',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    63,
    1,
    1,
    58,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    180000.00,
    'Egreso por compra ID 58',
    'Compra ID 58: uoiuoiuoiuoix 60',
    4,
    1,
    '2025-09-29 18:18:20',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    64,
    1,
    1,
    59,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    180000.00,
    'Egreso por compra ID 59',
    'Compra ID 59: dfasdf23434x 60',
    4,
    1,
    '2025-09-29 18:21:23',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    65,
    1,
    1,
    60,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    6000.00,
    'Egreso por compra ID 60',
    'Compra ID 60: DFASDF23434x 2',
    4,
    1,
    '2025-09-29 18:22:23',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    66,
    1,
    1,
    61,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    350000.00,
    'Egreso por compra ID 61',
    'Compra ID 61: TESTNORMAL2x 100',
    4,
    1,
    '2025-09-29 18:30:14',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    67,
    1,
    1,
    62,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    3000.00,
    'Egreso por compra ID 62',
    'Compra ID 62: DFASDF23434x 1',
    4,
    1,
    '2025-09-29 20:00:27',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    68,
    1,
    1,
    63,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    6000.00,
    'Egreso por compra ID 63',
    'Compra ID 63: DFASDF23434x 2',
    4,
    1,
    '2025-09-29 20:01:06',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    69,
    1,
    1,
    64,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    6000.00,
    'Egreso por compra ID 64',
    'Compra ID 64: DFASDF23434x 2',
    4,
    1,
    '2025-09-29 23:10:36',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    70,
    1,
    1,
    65,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    6000.00,
    'Egreso por compra ID 65',
    'Compra ID 65: DFASDF23434x 2',
    4,
    1,
    '2025-09-29 23:45:40',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    71,
    1,
    1,
    66,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    6000.00,
    'Egreso por compra ID 66',
    'Compra ID 66: DFASDF23434x 2',
    4,
    1,
    '2025-09-29 23:47:04',
    '2025-09-29 23:47:28',
    '2025-09-29 23:47:28',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    72,
    1,
    1,
    67,
    NULL,
    NULL,
    NULL,
    '2025-09-29',
    NULL,
    30000.00,
    'Egreso por compra ID 67',
    'Compra ID 67: DFASDF23434x 3',
    4,
    1,
    '2025-09-29 23:56:29',
    '2025-09-29 23:57:23',
    '2025-09-29 23:57:23',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    73,
    1,
    1,
    68,
    NULL,
    NULL,
    NULL,
    '2025-10-02',
    NULL,
    90000.00,
    'Egreso por compra ID 68',
    'Compra ID 68: testcantcajax 30',
    4,
    1,
    '2025-10-02 20:52:38',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    74,
    1,
    1,
    69,
    NULL,
    NULL,
    NULL,
    '2025-10-03',
    NULL,
    90000.00,
    'Egreso por compra ID 69',
    'Compra ID 69: TestCantCaja1x 30',
    4,
    1,
    '2025-10-02 21:00:49',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    75,
    1,
    1,
    70,
    NULL,
    NULL,
    NULL,
    '2025-10-03',
    NULL,
    90000.00,
    'Egreso por compra ID 70',
    'Compra ID 70: TestCantCaja2x 30',
    4,
    1,
    '2025-10-02 21:04:12',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    76,
    1,
    1,
    71,
    NULL,
    NULL,
    NULL,
    '2025-10-03',
    NULL,
    90000.00,
    'Egreso por compra ID 71',
    'Compra ID 71: TestCantCaja3x 30',
    4,
    1,
    '2025-10-02 21:07:48',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    77,
    1,
    1,
    72,
    NULL,
    NULL,
    NULL,
    '2025-10-03',
    NULL,
    90000.00,
    'Egreso por compra ID 72',
    'Compra ID 72: TestCantCaja4x 30',
    4,
    1,
    '2025-10-02 21:17:17',
    '2025-10-02 21:19:55',
    '2025-10-02 21:19:55',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    78,
    1,
    1,
    73,
    NULL,
    NULL,
    NULL,
    '2025-10-02',
    NULL,
    3000.00,
    'Egreso por compra ID 73',
    'Compra ID 73: TESTCANTCAJA4x 1',
    4,
    1,
    '2025-10-02 21:18:21',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    79,
    1,
    1,
    74,
    NULL,
    NULL,
    NULL,
    '2025-10-03',
    NULL,
    3000.00,
    'Egreso por compra ID 74',
    'Compra ID 74: TESTCANTCAJA4x 1',
    4,
    1,
    '2025-10-03 09:41:22',
    '2025-10-03 09:42:26',
    '2025-10-03 09:42:26',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    80,
    1,
    1,
    75,
    NULL,
    NULL,
    NULL,
    '2025-10-03',
    NULL,
    90000.00,
    'Egreso por compra ID 75',
    'Compra ID 75: TESTCANTCAJA4x 1',
    4,
    1,
    '2025-10-03 10:03:04',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    81,
    1,
    1,
    76,
    NULL,
    NULL,
    NULL,
    '2025-10-03',
    NULL,
    90000.00,
    'Egreso por compra ID 76',
    'Compra ID 76: TESTCANTCAJA4x 1',
    4,
    1,
    '2025-10-03 10:23:30',
    '2025-10-03 10:24:06',
    '2025-10-03 10:24:06',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    82,
    1,
    1,
    77,
    NULL,
    NULL,
    NULL,
    '2025-10-03',
    NULL,
    90000.00,
    'Egreso por compra ID 77',
    'Compra ID 77: TESTCANTCAJA4x 1',
    4,
    1,
    '2025-10-03 10:25:01',
    '2025-10-03 10:25:20',
    '2025-10-03 10:25:20',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    83,
    1,
    1,
    78,
    NULL,
    NULL,
    NULL,
    '2025-10-03',
    NULL,
    90000.00,
    'Egreso por compra ID 78',
    'Compra ID 78: TESTCANTCAJA4x 1',
    4,
    1,
    '2025-10-03 13:45:21',
    '2025-10-03 13:45:31',
    '2025-10-03 13:45:31',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    84,
    1,
    1,
    79,
    NULL,
    NULL,
    NULL,
    '2025-10-03',
    NULL,
    0.00,
    'Egreso por compra ID 79',
    'Compra ID 79: TESTCANTCAJA5x 30',
    4,
    1,
    '2025-10-03 13:46:23',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    85,
    1,
    1,
    80,
    NULL,
    NULL,
    NULL,
    '2025-10-03',
    NULL,
    90000.00,
    'Egreso por compra ID 80',
    'Compra ID 80: TESTCANTCAJA5x 1',
    4,
    1,
    '2025-10-03 13:47:03',
    '2025-10-03 13:52:06',
    '2025-10-03 13:52:06',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    86,
    1,
    1,
    81,
    NULL,
    NULL,
    NULL,
    '2025-10-03',
    NULL,
    92000.00,
    'Egreso por compra ID 81',
    'Compra ID 81: TESTCANTCAJA5x 1',
    4,
    1,
    '2025-10-03 13:53:06',
    '2025-10-03 13:53:37',
    '2025-10-03 13:53:37',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    87,
    1,
    1,
    82,
    NULL,
    NULL,
    NULL,
    '2025-10-03',
    NULL,
    92000.00,
    'Egreso por compra ID 82',
    'Compra ID 82: TESTCANTCAJA5x 1',
    4,
    1,
    '2025-10-03 14:07:03',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    88,
    1,
    1,
    83,
    NULL,
    NULL,
    NULL,
    '2025-10-03',
    NULL,
    90000.00,
    'Egreso por compra ID 83',
    'Compra ID 83: TESTCANTCAJA5x 1',
    4,
    1,
    '2025-10-03 14:07:34',
    '2025-10-03 14:08:56',
    '2025-10-03 14:08:56',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    89,
    1,
    1,
    84,
    NULL,
    NULL,
    NULL,
    '2025-10-13',
    NULL,
    0.00,
    'Egreso por compra ID 84',
    'Compra ID 84: REPUESTO12x 0',
    4,
    1,
    '2025-10-13 10:35:17',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    90,
    1,
    1,
    85,
    NULL,
    NULL,
    NULL,
    '2025-10-13',
    NULL,
    0.00,
    'Egreso por compra ID 85',
    'Compra ID 85: REPUESTO15x 0',
    4,
    1,
    '2025-10-13 12:32:40',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    91,
    1,
    1,
    86,
    NULL,
    NULL,
    NULL,
    '2025-10-13',
    NULL,
    10500.00,
    'Egreso por compra ID 86',
    'Compra ID 86: REPUESTO15x 3',
    4,
    1,
    '2025-10-13 12:46:25',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    92,
    1,
    1,
    87,
    NULL,
    NULL,
    NULL,
    '2025-10-14',
    NULL,
    0.00,
    'Egreso por compra ID 87',
    'Compra ID 87: REPUESTO16x 20',
    4,
    1,
    '2025-10-14 10:11:44',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    93,
    1,
    1,
    88,
    NULL,
    NULL,
    NULL,
    '2025-10-14',
    NULL,
    21000.00,
    'Egreso por compra ID 88',
    'Compra ID 88: REPUESTO16x 0.5',
    4,
    1,
    '2025-10-14 14:35:55',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    94,
    1,
    1,
    89,
    NULL,
    NULL,
    NULL,
    '2025-10-14',
    NULL,
    43000.00,
    'Egreso por compra ID 89',
    'Compra ID 89: REPUESTO16x 1',
    4,
    1,
    '2025-10-14 14:39:33',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    95,
    1,
    1,
    90,
    NULL,
    NULL,
    NULL,
    '2025-10-14',
    NULL,
    40000.00,
    'Egreso por compra ID 90',
    'Compra ID 90: REPUESTO16x 1',
    4,
    1,
    '2025-10-14 14:40:10',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    96,
    1,
    1,
    91,
    NULL,
    NULL,
    NULL,
    '2025-10-14',
    NULL,
    27000.00,
    'Egreso por compra ID 91',
    'Compra ID 91: REPUESTO17x 9',
    4,
    1,
    '2025-10-14 16:30:44',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    97,
    1,
    1,
    92,
    NULL,
    NULL,
    NULL,
    '2025-10-14',
    NULL,
    0.00,
    'Egreso por compra ID 92',
    'Compra ID 92: REPUESTO18x 0',
    4,
    1,
    '2025-10-14 16:31:06',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    98,
    1,
    1,
    93,
    NULL,
    NULL,
    NULL,
    '2025-10-14',
    NULL,
    73000.00,
    'Egreso por compra ID 93',
    'Compra ID 93: REPUESTO18x 10, REPUESTO17x 1, REPUESTO16x 1',
    4,
    1,
    '2025-10-14 16:31:30',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    99,
    1,
    1,
    94,
    NULL,
    NULL,
    NULL,
    '2025-10-14',
    NULL,
    0.00,
    'Egreso por compra ID 94',
    'Compra ID 94: REPUESTO19x 0',
    4,
    1,
    '2025-10-14 16:34:16',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    100,
    1,
    1,
    95,
    NULL,
    NULL,
    NULL,
    '2025-10-14',
    NULL,
    18000.00,
    'Egreso por compra ID 95',
    'Compra ID 95: REPUESTO19x 1, REPUESTO18x 5',
    4,
    1,
    '2025-10-14 16:35:24',
    '2025-10-14 16:43:44',
    '2025-10-14 16:43:44',
    NULL
  );
INSERT INTO
  `egresos` (
    `idegreso`,
    `idtipo_egreso`,
    `idformapago`,
    `idcompra`,
    `idpago_deuda_compra`,
    `iddetalle_transferencia_pago`,
    `iddetalle_cheque_compra_pago`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `iddetalle_tarjeta_compra_pago`
  )
VALUES
  (
    101,
    1,
    1,
    96,
    NULL,
    NULL,
    NULL,
    '2025-10-14',
    NULL,
    35000.00,
    'Egreso por compra ID 96',
    'Compra ID 96: REPUESTO16x 1',
    4,
    1,
    '2025-10-14 16:55:07',
    '2025-10-14 16:55:32',
    '2025-10-14 16:55:32',
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: facturadores
# ------------------------------------------------------------

INSERT INTO
  `facturadores` (
    `idfacturador`,
    `nombre_fantasia`,
    `titular`,
    `telefono`,
    `direccion`,
    `ciudad`,
    `ruc`,
    `timbrado_nro`,
    `fecha_inicio_vigente`,
    `fecha_fin_vigente`,
    `nro_factura_inicial_habilitada`,
    `nro_factura_final_habilitada`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `culminado`,
    `facturas_utilizadas`,
    `nro_factura_disponible`
  )
VALUES
  (
    1,
    'Test S.A',
    'TestFact',
    '0993333222',
    'TestDirection',
    'TestCity',
    '3333333-2',
    '5555555',
    '2025-08-11',
    '2026-08-11',
    '001-001-0001',
    '001-001-0030',
    '2025-08-11 15:45:11',
    '2025-08-11 15:45:11',
    NULL,
    0,
    0,
    NULL
  );
INSERT INTO
  `facturadores` (
    `idfacturador`,
    `nombre_fantasia`,
    `titular`,
    `telefono`,
    `direccion`,
    `ciudad`,
    `ruc`,
    `timbrado_nro`,
    `fecha_inicio_vigente`,
    `fecha_fin_vigente`,
    `nro_factura_inicial_habilitada`,
    `nro_factura_final_habilitada`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `culminado`,
    `facturas_utilizadas`,
    `nro_factura_disponible`
  )
VALUES
  (
    2,
    'test',
    'test',
    '234234',
    'test',
    'test',
    '564',
    '56565465',
    '2025-02-05',
    '2026-02-01',
    '001-001-00056',
    '001-001-00090',
    '2025-08-31 21:39:04',
    '2025-09-06 15:26:59',
    NULL,
    0,
    1,
    '001-001-0000057'
  );
INSERT INTO
  `facturadores` (
    `idfacturador`,
    `nombre_fantasia`,
    `titular`,
    `telefono`,
    `direccion`,
    `ciudad`,
    `ruc`,
    `timbrado_nro`,
    `fecha_inicio_vigente`,
    `fecha_fin_vigente`,
    `nro_factura_inicial_habilitada`,
    `nro_factura_final_habilitada`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `culminado`,
    `facturas_utilizadas`,
    `nro_factura_disponible`
  )
VALUES
  (
    3,
    'REPUESTOS S.A',
    'TITULAR PRUEBA',
    '65465465',
    'SAN JUAN',
    'SAN JUAN',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    '001-001-0001',
    '001-001-0030',
    '2025-09-06 20:24:29',
    '2025-09-07 11:43:16',
    NULL,
    0,
    4,
    '001-001-0000005'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: formas_pago
# ------------------------------------------------------------

INSERT INTO
  `formas_pago` (`idformapago`, `descripcion`, `deleted_at`)
VALUES
  (1, 'Efectivo', NULL);
INSERT INTO
  `formas_pago` (`idformapago`, `descripcion`, `deleted_at`)
VALUES
  (2, 'Transferencia Bancaria', NULL);
INSERT INTO
  `formas_pago` (`idformapago`, `descripcion`, `deleted_at`)
VALUES
  (3, 'Cheque', NULL);
INSERT INTO
  `formas_pago` (`idformapago`, `descripcion`, `deleted_at`)
VALUES
  (4, 'Tarjeta C/D', NULL);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: ingresos
# ------------------------------------------------------------

INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    1,
    '2025-08-11',
    NULL,
    3500.00,
    'Ingreso por venta contado ID 1',
    1,
    'Venta contado ID 1: 1x TESTPRODUCT',
    2,
    1,
    '2025-08-11 17:50:14',
    NULL,
    NULL,
    1,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    2,
    '2025-08-11',
    NULL,
    2500.00,
    'Cobro de deuda de venta ID 1',
    2,
    'test',
    2,
    1,
    '2025-08-11 18:42:44',
    NULL,
    NULL,
    NULL,
    1,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    3,
    '2025-09-01',
    NULL,
    3000.00,
    'test',
    4,
    'test',
    2,
    1,
    '2025-09-01 11:35:05',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    4,
    '2025-09-02',
    NULL,
    1.00,
    'Cobro de deuda de venta ID 2',
    2,
    'test',
    3,
    1,
    '2025-09-02 03:35:00',
    NULL,
    NULL,
    NULL,
    2,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    5,
    '2025-09-03',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 4',
    1,
    'Venta contado ID 4: 1x TEST1',
    3,
    1,
    '2025-09-03 08:01:40',
    NULL,
    NULL,
    4,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    6,
    '2025-09-03',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 5',
    1,
    'Venta contado ID 5: 1x TEST1',
    3,
    1,
    '2025-09-03 08:12:46',
    NULL,
    NULL,
    5,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    7,
    '2025-09-03',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 6',
    1,
    'Venta contado ID 6: 1x TEST1',
    3,
    1,
    '2025-09-03 09:14:55',
    NULL,
    NULL,
    6,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    8,
    '2025-09-03',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 7',
    1,
    'Venta contado ID 7: 1x TEST1',
    3,
    1,
    '2025-09-03 09:30:01',
    NULL,
    NULL,
    7,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    9,
    '2025-09-03',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 8',
    1,
    'Venta contado ID 8: 1x TEST1',
    3,
    1,
    '2025-09-03 09:52:52',
    NULL,
    NULL,
    8,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    10,
    '2025-09-03',
    NULL,
    8000.00,
    'Ingreso por venta contado ID 9',
    1,
    'Venta contado ID 9: 1x TEST1, 1x TESTPRODUCT2',
    3,
    1,
    '2025-09-03 10:11:16',
    NULL,
    NULL,
    9,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    11,
    '2025-09-06',
    NULL,
    7200.00,
    'Ingreso por venta contado ID 10',
    1,
    'Venta contado ID 10: 1x TEST1, 0.6x GALLETA',
    3,
    1,
    '2025-09-06 15:22:59',
    NULL,
    NULL,
    10,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    12,
    '2025-09-06',
    NULL,
    450.00,
    'Ingreso por venta contado ID 11',
    1,
    'Venta contado ID 11: 0.1x GALLETA',
    3,
    1,
    '2025-09-06 15:26:59',
    NULL,
    NULL,
    11,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    13,
    '2025-09-06',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 12',
    1,
    'Venta contado ID 12: 1x REPUESTO1',
    3,
    1,
    '2025-09-06 20:21:48',
    NULL,
    NULL,
    12,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    14,
    '2025-09-06',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 13',
    1,
    'Venta contado ID 13: 1x REPUESTO1',
    3,
    1,
    '2025-09-06 20:25:15',
    NULL,
    NULL,
    13,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    15,
    '2025-09-07',
    NULL,
    850.00,
    'Ingreso por venta contado ID 14',
    1,
    'Venta contado ID 14: 0.2x REPUESTO4',
    4,
    1,
    '2025-09-07 08:34:54',
    NULL,
    NULL,
    14,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    16,
    '2025-09-07',
    NULL,
    4925.00,
    'Ingreso por venta contado ID 15',
    1,
    'Venta contado ID 15: 0.1x REPUESTO4, 1x REPUESTO3',
    4,
    1,
    '2025-09-07 08:55:10',
    NULL,
    NULL,
    15,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    17,
    '2025-09-07',
    NULL,
    4925.00,
    'Ingreso por venta contado ID 16',
    1,
    'Venta contado ID 16: 0.1x REPUESTO4, 1x REPUESTO3',
    4,
    1,
    '2025-09-07 09:08:16',
    NULL,
    NULL,
    16,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    18,
    '2025-09-07',
    NULL,
    425.00,
    'Ingreso por venta contado ID 17',
    1,
    'Venta contado ID 17: 0.1x REPUESTO4',
    4,
    1,
    '2025-09-07 09:54:02',
    NULL,
    NULL,
    17,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    19,
    '2025-09-07',
    NULL,
    425.00,
    'Ingreso por venta contado ID 18',
    1,
    'Venta contado ID 18: 0.1x REPUESTO4',
    4,
    1,
    '2025-09-07 11:42:18',
    NULL,
    NULL,
    18,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    20,
    '2025-09-07',
    NULL,
    425.00,
    'Ingreso por venta contado ID 19',
    1,
    'Venta contado ID 19: 0.1x REPUESTO4',
    4,
    1,
    '2025-09-07 11:42:44',
    NULL,
    NULL,
    19,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    21,
    '2025-09-07',
    NULL,
    425.00,
    'Ingreso por venta contado ID 20',
    1,
    'Venta contado ID 20: 0.1x REPUESTO4',
    4,
    1,
    '2025-09-07 11:43:03',
    NULL,
    NULL,
    20,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    22,
    '2025-09-07',
    NULL,
    425.00,
    'Ingreso por venta contado ID 21',
    1,
    'Venta contado ID 21: 0.1x REPUESTO4',
    4,
    1,
    '2025-09-07 11:43:16',
    NULL,
    NULL,
    21,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    23,
    '2025-09-07',
    NULL,
    850.00,
    'Ingreso por venta contado ID 22',
    1,
    'Venta contado ID 22: 0.2x REPUESTO4',
    4,
    1,
    '2025-09-07 11:44:54',
    NULL,
    NULL,
    22,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    24,
    '2025-09-07',
    NULL,
    5350.00,
    'Ingreso por venta contado ID 23',
    1,
    'Venta contado ID 23: 0.2x REPUESTO4, 1x REPUESTO3',
    4,
    1,
    '2025-09-07 11:46:16',
    NULL,
    NULL,
    23,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    25,
    '2025-09-07',
    NULL,
    14350.00,
    'Ingreso por venta contado ID 24',
    1,
    'Venta contado ID 24: 3x REPUESTO3, 0.2x REPUESTO4',
    4,
    1,
    '2025-09-07 15:27:31',
    NULL,
    NULL,
    24,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    26,
    '2025-09-07',
    NULL,
    425.00,
    'Ingreso por venta contado ID 25',
    1,
    'Venta contado ID 25: 0.1x REPUESTO4',
    4,
    1,
    '2025-09-07 15:29:03',
    NULL,
    NULL,
    25,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    27,
    '2025-09-07',
    NULL,
    9425.00,
    'Ingreso por venta contado ID 26',
    1,
    'Venta contado ID 26: 2x REPUESTO3, 0.1x REPUESTO4',
    4,
    1,
    '2025-09-07 15:53:29',
    NULL,
    NULL,
    26,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    28,
    '2025-09-07',
    NULL,
    9000.00,
    'Ingreso por venta contado ID 27',
    1,
    'Venta contado ID 27: 2x REPUESTO3',
    4,
    1,
    '2025-09-07 15:54:21',
    NULL,
    NULL,
    27,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    29,
    '2025-09-07',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 28',
    1,
    'Venta contado ID 28: 1x REPUESTO3',
    4,
    1,
    '2025-09-07 15:59:53',
    NULL,
    NULL,
    28,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    30,
    '2025-09-07',
    NULL,
    4925.00,
    'Ingreso por venta contado ID 29',
    1,
    'Venta contado ID 29: 1x REPUESTO3, 0.1x REPUESTO4',
    4,
    1,
    '2025-09-07 16:09:55',
    NULL,
    NULL,
    29,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    31,
    '2025-09-07',
    NULL,
    9425.00,
    'Ingreso por venta contado ID 30',
    1,
    'Venta contado ID 30: 2x REPUESTO3, 0.1x REPUESTO4',
    4,
    1,
    '2025-09-07 16:19:03',
    NULL,
    NULL,
    30,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    32,
    '2025-09-07',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 31',
    1,
    'Venta contado ID 31: 1x REPUESTO3',
    4,
    1,
    '2025-09-07 16:28:43',
    NULL,
    NULL,
    31,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    33,
    '2025-09-07',
    NULL,
    4925.00,
    'Ingreso por venta contado ID 32',
    1,
    'Venta contado ID 32: 1x REPUESTO3, 0.1x REPUESTO4',
    4,
    1,
    '2025-09-07 16:46:26',
    NULL,
    NULL,
    32,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    34,
    '2025-09-07',
    NULL,
    4925.00,
    'Ingreso por venta contado ID 33',
    1,
    'Venta contado ID 33: 1x REPUESTO3, 0.1x REPUESTO4',
    4,
    1,
    '2025-09-07 16:51:53',
    NULL,
    NULL,
    33,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    35,
    '2025-09-07',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 34',
    1,
    'Venta contado ID 34: 1x REPUESTO3',
    4,
    1,
    '2025-09-07 16:54:03',
    NULL,
    NULL,
    34,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    36,
    '2025-09-07',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 35',
    1,
    'Venta contado ID 35: 1x REPUESTO3',
    4,
    1,
    '2025-09-07 16:59:11',
    NULL,
    NULL,
    35,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    37,
    '2025-09-07',
    NULL,
    4925.00,
    'Ingreso por venta contado ID 36',
    1,
    'Venta contado ID 36: 0.1x REPUESTO4, 1x REPUESTO3',
    4,
    1,
    '2025-09-07 18:30:33',
    NULL,
    NULL,
    36,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    38,
    '2025-09-07',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 37',
    1,
    'Venta contado ID 37: 1x REPUESTO3',
    4,
    1,
    '2025-09-07 18:42:09',
    NULL,
    NULL,
    37,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    39,
    '2025-09-07',
    NULL,
    4925.00,
    'Ingreso por venta contado ID 38',
    1,
    'Venta contado ID 38: 1x REPUESTO3, 0.1x REPUESTO4',
    4,
    1,
    '2025-09-07 18:49:04',
    NULL,
    NULL,
    38,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    40,
    '2025-09-07',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 41',
    1,
    'Venta contado ID 41: 1x REPUESTO3',
    4,
    1,
    '2025-09-07 19:29:27',
    NULL,
    NULL,
    41,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    41,
    '2025-09-07',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 42',
    1,
    'Venta contado ID 42: 1x REPUESTO3',
    4,
    1,
    '2025-09-07 19:30:12',
    NULL,
    NULL,
    42,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    42,
    '2025-09-07',
    NULL,
    2500.00,
    'Ingreso por venta contado ID 43',
    1,
    'Venta contado ID 43: 1x REPUESTO3 (Desc: 2000)',
    4,
    1,
    '2025-09-07 19:35:26',
    NULL,
    NULL,
    43,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    43,
    '2025-09-07',
    NULL,
    0.00,
    'Ingreso por venta contado ID 44',
    1,
    'Venta contado ID 44: 1x REPUESTO3',
    4,
    1,
    '2025-09-07 19:42:49',
    NULL,
    NULL,
    44,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    44,
    '2025-09-07',
    NULL,
    3500.00,
    'Ingreso por venta contado ID 45',
    1,
    'Venta contado ID 45: 1x REPUESTO3 (Desc. Productos: 1000)',
    4,
    1,
    '2025-09-07 19:53:01',
    NULL,
    NULL,
    45,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    45,
    '2025-09-07',
    NULL,
    3500.00,
    'Ingreso por venta contado ID 46',
    1,
    'Venta contado ID 46: 1x REPUESTO3 (Desc. Total: 1000)',
    4,
    1,
    '2025-09-07 20:33:30',
    NULL,
    NULL,
    46,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    46,
    '2025-09-07',
    NULL,
    3338.00,
    'Ingreso por venta contado ID 47',
    1,
    'Venta contado ID 47: 0.2x REPUESTO4, 1x REPUESTO2 (Desc. Productos: 1012)',
    4,
    1,
    '2025-09-07 20:37:15',
    NULL,
    NULL,
    47,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    47,
    '2025-09-07',
    NULL,
    3000.00,
    'Ingreso por venta contado ID 48',
    1,
    'Venta contado ID 48: 1x REPUESTO2 (Desc. Productos: 500)',
    4,
    1,
    '2025-09-07 20:59:36',
    NULL,
    NULL,
    48,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    48,
    '2025-09-07',
    NULL,
    2725.00,
    'Ingreso por venta contado ID 49',
    1,
    'Venta contado ID 49: 1x REPUESTO2, 0.1x REPUESTO4 (Desc. Total: 1200)',
    4,
    1,
    '2025-09-07 21:13:22',
    NULL,
    NULL,
    49,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    49,
    '2025-09-07',
    NULL,
    3300.00,
    'Ingreso por venta contado ID 50',
    1,
    'Venta contado ID 50: 1x REPUESTO2 (Desc. Productos: 200)',
    4,
    1,
    '2025-09-07 23:44:02',
    NULL,
    NULL,
    50,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    50,
    '2025-09-07',
    NULL,
    3300.00,
    'Ingreso por venta contado ID 51',
    1,
    'Venta contado ID 51: 1x REPUESTO2 (Desc. Productos: 200)',
    4,
    1,
    '2025-09-07 23:44:26',
    NULL,
    NULL,
    51,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    51,
    '2025-09-07',
    NULL,
    3480.00,
    'Ingreso por venta contado ID 52',
    1,
    'Venta contado ID 52: 1x REPUESTO2 (Desc. Total: 20)',
    4,
    1,
    '2025-09-07 23:44:54',
    NULL,
    NULL,
    52,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    52,
    '2025-09-07',
    NULL,
    3480.00,
    'Ingreso por venta contado ID 53',
    1,
    'Venta contado ID 53: 1x REPUESTO2 (Desc. Productos: 20)',
    4,
    1,
    '2025-09-07 23:45:47',
    NULL,
    NULL,
    53,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    53,
    '2025-09-07',
    NULL,
    3480.00,
    'Ingreso por venta contado ID 54',
    1,
    'Venta contado ID 54: 1x REPUESTO2 (Desc. Total: 20)',
    4,
    1,
    '2025-09-07 23:55:53',
    NULL,
    NULL,
    54,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    54,
    '2025-09-09',
    NULL,
    415.00,
    'Ingreso por venta contado ID 55',
    1,
    'Venta contado ID 55: 0.1x REPUESTO4 (Desc. Total: 10)',
    4,
    1,
    '2025-09-08 21:18:51',
    NULL,
    NULL,
    55,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    55,
    '2025-09-09',
    NULL,
    415.00,
    'Ingreso por venta contado ID 56',
    1,
    'Venta contado ID 56: 0.1x REPUESTO4 (Desc. Total: 10)',
    4,
    1,
    '2025-09-08 22:17:45',
    NULL,
    NULL,
    56,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    56,
    '2025-09-09',
    NULL,
    425.00,
    'Ingreso por venta contado ID 57',
    1,
    'Venta contado ID 57: 0.1x REPUESTO4',
    4,
    1,
    '2025-09-08 22:24:45',
    NULL,
    NULL,
    57,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    57,
    '2025-09-08',
    NULL,
    3500.00,
    'Ingreso por venta contado ID 58',
    1,
    'Venta contado ID 58: 1x REPUESTO2',
    4,
    1,
    '2025-09-08 22:38:05',
    NULL,
    NULL,
    58,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    58,
    '2025-09-09',
    NULL,
    425.00,
    'Ingreso por venta contado ID 59',
    1,
    'Venta contado ID 59: 0.1x REPUESTO4',
    4,
    1,
    '2025-09-08 22:48:19',
    NULL,
    NULL,
    59,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    59,
    '2025-09-09',
    NULL,
    425.00,
    'Ingreso por venta contado ID 60',
    1,
    'Venta contado ID 60: 0.1x REPUESTO4',
    4,
    1,
    '2025-09-08 22:48:47',
    NULL,
    NULL,
    60,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    60,
    '2025-09-09',
    NULL,
    415.00,
    'Ingreso por venta contado ID 61',
    1,
    'Venta contado ID 61: 0.1x REPUESTO4 (Desc. Total: 10)',
    4,
    1,
    '2025-09-08 22:50:18',
    NULL,
    NULL,
    61,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    61,
    '2025-09-10',
    NULL,
    3500.00,
    'Ingreso por venta contado ID 62',
    1,
    'Venta contado ID 62: 1x REPUESTO2',
    4,
    2,
    '2025-09-10 19:44:59',
    NULL,
    NULL,
    62,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    62,
    '2025-09-12',
    NULL,
    1000.00,
    'Cobro de deuda de venta ID 2',
    2,
    '---',
    4,
    1,
    '2025-09-12 21:50:37',
    NULL,
    NULL,
    NULL,
    3,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    63,
    '2025-09-13',
    NULL,
    6000.00,
    'Ingreso por venta contado ID 63',
    1,
    'Venta contado ID 63: 2x REPUESTO2 (Desc. Productos: 1000)',
    4,
    1,
    '2025-09-13 10:34:09',
    NULL,
    NULL,
    63,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    64,
    '2025-09-13',
    NULL,
    2500.00,
    'Ingreso por venta contado ID 64',
    1,
    'Venta contado ID 64: 1x REPUESTO2 (Desc. Productos: 1000)',
    4,
    1,
    '2025-09-13 10:51:11',
    NULL,
    NULL,
    64,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    65,
    '2025-09-16',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 66',
    1,
    'Venta contado ID 66: 1x TEST',
    4,
    1,
    '2025-09-16 18:38:45',
    NULL,
    NULL,
    66,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    66,
    '2025-09-21',
    NULL,
    323231.00,
    'etesdf',
    9,
    'dasfafd',
    4,
    2,
    '2025-09-21 19:44:13',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    67,
    '2025-09-23',
    NULL,
    4500.00,
    'Ingreso por venta contado ID 71',
    1,
    'Venta contado ID 71: 1x DSAFASDF',
    4,
    1,
    '2025-09-23 08:56:12',
    NULL,
    NULL,
    71,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    68,
    '2025-09-24',
    NULL,
    15000.00,
    'Ingreso por venta contado ID 72',
    1,
    'Venta contado ID 72: 5x TESASDFASDF',
    4,
    1,
    '2025-09-24 18:31:00',
    NULL,
    NULL,
    72,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    69,
    '2025-09-26',
    NULL,
    5000.00,
    'Ingreso por venta contado ID 74',
    1,
    'Venta contado ID 74: 1x TESTPRODUCTO2',
    4,
    1,
    '2025-09-26 21:59:11',
    NULL,
    NULL,
    74,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    70,
    '2025-10-14',
    NULL,
    85000.00,
    'Ingreso por venta contado ID 75',
    1,
    'Venta contado ID 75: 17x REPUESTO16',
    4,
    1,
    '2025-10-14 18:45:34',
    NULL,
    NULL,
    75,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    71,
    '2025-10-14',
    NULL,
    10000.00,
    'Ingreso por venta contado ID 76',
    1,
    'Venta contado ID 76: 2x REPUESTO16',
    4,
    1,
    '2025-10-14 18:51:44',
    NULL,
    NULL,
    76,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    72,
    '2025-10-14',
    NULL,
    5000.00,
    'Ingreso por venta contado ID 77',
    1,
    'Venta contado ID 77: 1x REPUESTO16',
    4,
    1,
    '2025-10-14 22:58:06',
    NULL,
    NULL,
    77,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `ingresos` (
    `idingreso`,
    `fecha`,
    `hora`,
    `monto`,
    `concepto`,
    `idtipo_ingreso`,
    `observacion`,
    `idmovimiento`,
    `creado_por`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idventa`,
    `idpago_deuda`,
    `idformapago`,
    `iddetalle_transferencia_cobro`,
    `iddetalle_tarjeta_venta_cobro`,
    `iddetalle_cheque_venta_cobro`
  )
VALUES
  (
    73,
    '2025-10-14',
    NULL,
    5000.00,
    'Ingreso por venta contado ID 78',
    1,
    'Venta contado ID 78: 1x REPUESTO16',
    4,
    1,
    '2025-10-14 23:00:16',
    NULL,
    '2025-10-14 23:04:19',
    78,
    NULL,
    1,
    NULL,
    NULL,
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: libro_diario
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: movimiento_caja
# ------------------------------------------------------------

INSERT INTO
  `movimiento_caja` (
    `idmovimiento`,
    `idusuarios`,
    `num_caja`,
    `fecha_apertura`,
    `fecha_cierre`,
    `monto_apertura`,
    `monto_cierre`,
    `credito`,
    `gastos`,
    `cobrado`,
    `contado`,
    `ingresos`,
    `compras`,
    `estado`
  )
VALUES
  (
    2,
    1,
    1,
    '2025-08-11 18:26:50',
    '2025-09-01 16:56:57',
    500000.00,
    432600.00,
    7000.00,
    0.00,
    2500.00,
    3500.00,
    9000.00,
    82000.00,
    'cerrado'
  );
INSERT INTO
  `movimiento_caja` (
    `idmovimiento`,
    `idusuarios`,
    `num_caja`,
    `fecha_apertura`,
    `fecha_cierre`,
    `monto_apertura`,
    `monto_cierre`,
    `credito`,
    `gastos`,
    `cobrado`,
    `contado`,
    `ingresos`,
    `compras`,
    `estado`
  )
VALUES
  (
    3,
    1,
    2,
    '2025-09-01 20:01:05',
    '2025-09-06 20:29:25',
    300000.00,
    231701.00,
    0.00,
    0.00,
    1.00,
    47150.00,
    47151.00,
    162601.00,
    'cerrado'
  );
INSERT INTO
  `movimiento_caja` (
    `idmovimiento`,
    `idusuarios`,
    `num_caja`,
    `fecha_apertura`,
    `fecha_cierre`,
    `monto_apertura`,
    `monto_cierre`,
    `credito`,
    `gastos`,
    `cobrado`,
    `contado`,
    `ingresos`,
    `compras`,
    `estado`
  )
VALUES
  (
    4,
    1,
    2,
    '2025-09-06 23:30:06',
    NULL,
    250000.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'abierto'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: producto_proveedor
# ------------------------------------------------------------

INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    1,
    1,
    2500.00,
    '2025-08-11 15:43:11',
    '2025-08-11 15:43:11'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    2,
    2,
    1,
    3200.00,
    '2025-08-23 20:19:22',
    '2025-08-23 20:19:22'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    3,
    2,
    2,
    3200.00,
    '2025-09-04 14:24:14',
    '2025-09-04 14:24:14'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    4,
    3,
    1,
    3000.00,
    '2025-09-06 15:22:49',
    '2025-09-06 15:22:49'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    5,
    4,
    1,
    3000.00,
    '2025-09-06 20:16:00',
    '2025-09-06 20:16:00'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    6,
    4,
    2,
    3000.00,
    '2025-09-06 20:17:28',
    '2025-09-06 20:17:28'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    7,
    5,
    1,
    2500.00,
    '2025-09-07 08:32:53',
    '2025-09-07 08:32:53'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    8,
    7,
    1,
    3500.00,
    '2025-09-07 08:33:55',
    '2025-09-07 08:33:55'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    9,
    8,
    1,
    3520.00,
    '2025-09-07 08:34:22',
    '2025-09-07 08:34:22'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    10,
    8,
    2,
    3520.00,
    '2025-09-10 20:12:49',
    '2025-09-10 20:12:49'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    11,
    9,
    1,
    231.00,
    '2025-09-13 19:56:20',
    '2025-09-13 19:56:20'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    12,
    10,
    1,
    3424.00,
    '2025-09-13 20:34:09',
    '2025-09-13 20:34:09'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    13,
    11,
    1,
    3500.00,
    '2025-09-13 20:37:07',
    '2025-09-13 20:37:07'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    14,
    12,
    1,
    3250.00,
    '2025-09-13 20:45:05',
    '2025-09-13 20:45:05'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    15,
    13,
    1,
    2500.00,
    '2025-09-24 18:27:56',
    '2025-09-24 18:27:56'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    16,
    14,
    1,
    2000.00,
    '2025-09-24 18:28:47',
    '2025-09-24 18:28:47'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    17,
    14,
    4,
    2000.00,
    '2025-09-24 18:29:17',
    '2025-09-24 18:29:17'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    18,
    15,
    1,
    11666.67,
    '2025-09-28 18:15:18',
    '2025-09-28 18:15:18'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    19,
    16,
    1,
    15000.00,
    '2025-09-28 21:32:20',
    '2025-09-28 21:32:20'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    20,
    17,
    1,
    3000.00,
    '2025-09-28 21:49:07',
    '2025-09-28 21:49:07'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    21,
    17,
    4,
    3000.00,
    '2025-09-29 13:49:17',
    '2025-09-29 13:49:17'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    22,
    16,
    4,
    1500.00,
    '2025-09-29 13:49:17',
    '2025-09-29 13:49:17'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    23,
    15,
    3,
    11666.67,
    '2025-09-29 13:52:47',
    '2025-09-29 13:52:47'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    24,
    15,
    4,
    1166.67,
    '2025-09-29 14:08:12',
    '2025-09-29 14:08:12'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    25,
    16,
    3,
    11538.46,
    '2025-09-29 15:10:00',
    '2025-09-29 15:10:00'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    26,
    16,
    2,
    15000.00,
    '2025-09-29 15:32:27',
    '2025-09-29 15:32:27'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    27,
    18,
    1,
    3500.00,
    '2025-09-29 17:50:17',
    '2025-09-29 17:50:17'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    28,
    19,
    1,
    6666.67,
    '2025-09-29 17:56:32',
    '2025-09-29 17:56:32'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    29,
    20,
    1,
    6666.67,
    '2025-09-29 18:01:05',
    '2025-09-29 18:01:05'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    30,
    21,
    1,
    6666.67,
    '2025-09-29 18:04:09',
    '2025-09-29 18:04:09'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    31,
    22,
    1,
    6666.67,
    '2025-09-29 18:09:28',
    '2025-09-29 18:09:28'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    32,
    23,
    1,
    6666.67,
    '2025-09-29 18:12:34',
    '2025-09-29 18:12:34'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    33,
    24,
    1,
    3000.00,
    '2025-09-29 18:18:20',
    '2025-09-29 18:18:20'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    34,
    25,
    1,
    3000.00,
    '2025-09-29 18:21:23',
    '2025-09-29 18:21:23'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    35,
    25,
    4,
    3000.00,
    '2025-09-29 18:22:23',
    '2025-09-29 18:22:23'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    36,
    26,
    1,
    3500.00,
    '2025-09-29 18:30:14',
    '2025-09-29 18:30:14'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    37,
    25,
    3,
    3000.00,
    '2025-09-29 20:00:27',
    '2025-09-29 20:00:27'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    38,
    27,
    1,
    3000.00,
    '2025-10-02 20:52:38',
    '2025-10-02 20:52:38'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    39,
    28,
    1,
    3000.00,
    '2025-10-02 21:00:49',
    '2025-10-02 21:00:49'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    40,
    29,
    1,
    3000.00,
    '2025-10-02 21:04:12',
    '2025-10-02 21:04:12'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    41,
    30,
    1,
    3000.00,
    '2025-10-02 21:07:48',
    '2025-10-02 21:07:48'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    42,
    31,
    1,
    3000.00,
    '2025-10-02 21:17:17',
    '2025-10-02 21:17:17'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    43,
    31,
    4,
    3000.00,
    '2025-10-02 21:18:21',
    '2025-10-02 21:18:21'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    44,
    32,
    1,
    3000.00,
    '2025-10-03 13:46:23',
    '2025-10-03 13:46:23'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    45,
    32,
    4,
    3000.00,
    '2025-10-03 13:47:03',
    '2025-10-03 13:47:03'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    46,
    33,
    1,
    3500.00,
    '2025-10-13 10:35:17',
    '2025-10-13 10:35:17'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    47,
    34,
    1,
    3500.00,
    '2025-10-13 12:32:40',
    '2025-10-13 12:32:40'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    48,
    34,
    4,
    3500.00,
    '2025-10-13 12:46:25',
    '2025-10-13 12:46:25'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    49,
    35,
    1,
    3000.00,
    '2025-10-14 10:11:44',
    '2025-10-14 10:11:44'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    50,
    35,
    4,
    3000.00,
    '2025-10-14 14:35:55',
    '2025-10-14 14:35:55'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    51,
    36,
    1,
    3000.00,
    '2025-10-14 16:30:44',
    '2025-10-14 16:30:44'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    52,
    37,
    1,
    3000.00,
    '2025-10-14 16:31:06',
    '2025-10-14 16:31:06'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    53,
    37,
    4,
    3000.00,
    '2025-10-14 16:31:30',
    '2025-10-14 16:31:30'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    54,
    36,
    4,
    3000.00,
    '2025-10-14 16:31:30',
    '2025-10-14 16:31:30'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    55,
    38,
    1,
    3000.00,
    '2025-10-14 16:34:16',
    '2025-10-14 16:34:16'
  );
INSERT INTO
  `producto_proveedor` (
    `id`,
    `idproducto`,
    `idproveedor`,
    `precio_compra`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    56,
    38,
    4,
    3000.00,
    '2025-10-14 16:35:24',
    '2025-10-14 16:35:24'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: productos
# ------------------------------------------------------------

INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    1,
    'TESTPRODUCT2',
    '1321321',
    2500.00,
    16.00,
    1,
    NULL,
    3500.00,
    'TestUbication',
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-08-11 15:43:11',
    '2025-09-18 00:00:00',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    2,
    'TEST1',
    '5615',
    3200.00,
    4.00,
    8,
    NULL,
    6000.00,
    'test',
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-08-23 20:19:22',
    '2025-09-26 20:47:04',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    3,
    'GALLETA',
    '23123213',
    3000.00,
    19.30,
    8,
    NULL,
    4500.00,
    'GONDOLA',
    10.00,
    'activo',
    'KG',
    NULL,
    '2025-09-06 15:22:49',
    '2025-09-13 19:23:45',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    4,
    'REPUESTO1',
    '34234234',
    3000.00,
    29.00,
    4,
    NULL,
    4500.00,
    'ADSFASD',
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-09-06 20:16:00',
    '2025-09-13 19:23:48',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    5,
    'REPUESTO2',
    '001',
    2500.00,
    16.00,
    8,
    NULL,
    3500.00,
    'TEST2',
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-09-07 08:32:53',
    '2025-09-26 20:46:40',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    7,
    'REPUESTO3',
    NULL,
    3500.00,
    0.00,
    8,
    NULL,
    4500.00,
    'TEST',
    5.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-09-07 08:33:55',
    '2025-09-13 19:23:53',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    8,
    'REPUESTO4',
    NULL,
    3520.00,
    16.80,
    8,
    NULL,
    4250.00,
    'TEST',
    10.00,
    'activo',
    'KG',
    NULL,
    '2025-09-07 08:34:22',
    '2025-10-15 00:36:26',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    9,
    'SDFDSF',
    '4123124',
    231.00,
    22.00,
    8,
    NULL,
    234234.00,
    'fsdf',
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-09-13 19:56:20',
    '2025-09-13 20:33:20',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    10,
    'TEST',
    '434234',
    3424.00,
    55.00,
    8,
    NULL,
    6000.00,
    'test',
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-09-13 20:34:09',
    '2025-09-27 08:48:39',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    11,
    'DSAFASDF',
    '434234',
    3500.00,
    44.00,
    8,
    NULL,
    4500.00,
    'dfasdf',
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-09-13 20:37:07',
    '2025-09-23 08:56:12',
    2,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    12,
    'TESTIDUSE',
    '5616531',
    3250.00,
    20.00,
    8,
    NULL,
    5500.00,
    'testubication',
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-09-13 20:45:05',
    '2025-09-27 08:48:49',
    2,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    13,
    'TESTPRODUCTO2',
    NULL,
    2500.00,
    19.00,
    8,
    NULL,
    5000.00,
    'gondola a',
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-09-24 18:27:56',
    '2025-09-26 21:59:11',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    14,
    'TESASDFASDF',
    NULL,
    2000.00,
    20.00,
    8,
    NULL,
    3000.00,
    'sdfsdaf',
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-09-24 18:28:47',
    '2025-09-24 18:34:30',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    15,
    'CDVVADASDV',
    NULL,
    11666.67,
    154.00,
    7,
    NULL,
    3500.00,
    'dfgfdg',
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-09-28 18:15:18',
    '2025-09-29 16:23:55',
    1,
    30.00,
    8.13,
    350000.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    16,
    'WEQWEDSD12',
    NULL,
    15000.00,
    568.00,
    8,
    NULL,
    20000.00,
    NULL,
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-09-28 21:32:20',
    '2025-09-29 18:31:09',
    1,
    0.00,
    28.40,
    0.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    17,
    '3LKJKLNM,BHJVJH5',
    NULL,
    3000.00,
    5.00,
    6,
    NULL,
    4000.00,
    NULL,
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-09-28 21:49:07',
    '2025-09-29 20:11:17',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    18,
    'REPUESTO1121389',
    NULL,
    3500.00,
    0.00,
    7,
    NULL,
    5000.00,
    NULL,
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-09-29 17:50:17',
    '2025-09-29 22:49:41',
    1,
    0.00,
    0.00,
    0.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    19,
    'REPUESTO223334',
    NULL,
    6666.67,
    0.00,
    8,
    NULL,
    7000.00,
    NULL,
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-09-29 17:56:32',
    '2025-09-29 20:11:31',
    1,
    0.00,
    0.00,
    0.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    20,
    'REPUESTO223335',
    NULL,
    6666.67,
    0.00,
    8,
    NULL,
    7000.00,
    NULL,
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-09-29 18:01:05',
    '2025-09-29 20:14:16',
    1,
    0.00,
    0.00,
    0.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    21,
    'REPUESTO223338',
    NULL,
    6666.67,
    0.00,
    8,
    NULL,
    7000.00,
    NULL,
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-09-29 18:04:09',
    '2025-09-29 20:14:40',
    1,
    0.00,
    0.00,
    0.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    22,
    'REPUESTO2235566',
    NULL,
    6666.67,
    0.00,
    8,
    NULL,
    7000.00,
    NULL,
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-09-29 18:09:28',
    '2025-09-29 20:14:50',
    1,
    0.00,
    0.00,
    0.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    23,
    'REPUESTO22523335566',
    NULL,
    6666.67,
    0.00,
    8,
    NULL,
    7000.00,
    NULL,
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-09-29 18:12:34',
    '2025-09-29 23:10:51',
    1,
    0.00,
    0.00,
    0.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    24,
    'UOIUOIUOIUOI',
    NULL,
    3000.00,
    0.00,
    8,
    NULL,
    4000.00,
    NULL,
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-09-29 18:18:20',
    '2025-09-29 18:18:20',
    1,
    30.00,
    0.00,
    90000.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    25,
    'DFASDF23434',
    NULL,
    10000.00,
    480.00,
    7,
    NULL,
    4500.00,
    NULL,
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-09-29 18:21:23',
    '2025-09-29 23:57:23',
    1,
    0.00,
    16.00,
    0.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    26,
    'TESTNORMAL2',
    NULL,
    3500.00,
    100.00,
    8,
    NULL,
    4500.00,
    NULL,
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-09-29 18:30:14',
    '2025-09-29 18:30:14',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    27,
    'TESTCANTCAJA',
    NULL,
    3000.00,
    30.00,
    8,
    NULL,
    4000.00,
    'TEST',
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-10-02 20:52:37',
    '2025-10-02 20:52:37',
    1,
    30.00,
    1.00,
    90000.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    28,
    'TESTCANTCAJA1',
    NULL,
    3000.00,
    30.00,
    8,
    NULL,
    4000.00,
    NULL,
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-10-02 21:00:49',
    '2025-10-02 21:00:49',
    1,
    30.00,
    1.00,
    90000.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    29,
    'TESTCANTCAJA2',
    NULL,
    3000.00,
    30.00,
    8,
    NULL,
    4000.00,
    NULL,
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-10-02 21:04:12',
    '2025-10-02 21:04:12',
    1,
    30.00,
    1.00,
    90000.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    30,
    'TESTCANTCAJA3',
    NULL,
    3000.00,
    30.00,
    7,
    NULL,
    4000.00,
    NULL,
    10.00,
    'activo',
    'CAJA',
    '2025-10-02 21:08:37',
    '2025-10-02 21:07:48',
    '2025-10-02 21:08:37',
    1,
    30.00,
    1.00,
    90000.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    31,
    'TESTCANTCAJA4',
    NULL,
    3000.00,
    180.00,
    8,
    NULL,
    4000.00,
    NULL,
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-10-02 21:17:17',
    '2025-10-03 13:45:31',
    1,
    30.00,
    6.00,
    90000.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    32,
    'TESTCANTCAJA5',
    NULL,
    3172.41,
    59.00,
    8,
    NULL,
    4000.00,
    NULL,
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-10-03 13:46:23',
    '2025-10-03 14:08:56',
    1,
    29.00,
    2.03,
    92000.00,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    33,
    'REPUESTO12',
    '3123123123',
    3500.00,
    0.00,
    8,
    NULL,
    4000.00,
    'test',
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-10-13 10:35:17',
    '2025-10-13 10:35:17',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    34,
    'REPUESTO15',
    '123123',
    3500.00,
    3.00,
    8,
    NULL,
    6000.00,
    NULL,
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-10-13 12:32:40',
    '2025-10-13 12:46:25',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    35,
    'REPUESTO16',
    NULL,
    2857.14,
    50.00,
    8,
    NULL,
    5000.00,
    NULL,
    10.00,
    'activo',
    'CAJA',
    NULL,
    '2025-10-14 10:11:44',
    '2025-10-15 00:22:35',
    1,
    14.00,
    3.57,
    40000.00,
    70000.00
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    36,
    'REPUESTO17',
    NULL,
    3000.00,
    10.00,
    8,
    NULL,
    4000.00,
    NULL,
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-10-14 16:30:44',
    '2025-10-14 16:31:30',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    37,
    'REPUESTO18',
    NULL,
    3000.00,
    10.00,
    8,
    NULL,
    4000.00,
    NULL,
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-10-14 16:31:06',
    '2025-10-14 16:43:44',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `productos` (
    `idproducto`,
    `nombre_producto`,
    `cod_barra`,
    `precio_compra`,
    `stock`,
    `idcategoria`,
    `idproveedor`,
    `precio_venta`,
    `ubicacion`,
    `iva`,
    `estado`,
    `unidad_medida`,
    `deleted_at`,
    `created_at`,
    `updated_at`,
    `idusuario`,
    `cant_p_caja`,
    `cant_cajas`,
    `precio_compra_caja`,
    `precio_venta_caja`
  )
VALUES
  (
    38,
    'REPUESTO19',
    NULL,
    3000.00,
    0.00,
    8,
    NULL,
    4500.00,
    NULL,
    10.00,
    'activo',
    'UNIDAD',
    NULL,
    '2025-10-14 16:34:16',
    '2025-10-14 16:43:44',
    1,
    NULL,
    0.00,
    NULL,
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: proveedor
# ------------------------------------------------------------

INSERT INTO
  `proveedor` (
    `idproveedor`,
    `nombre`,
    `telefono`,
    `direccion`,
    `ruc`,
    `razon`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    1,
    'TestProvider',
    '0981222333',
    'TestDirection',
    '45555-1',
    'TestReason',
    'activo',
    '2025-08-11 14:57:43',
    '2025-09-13 21:38:25',
    NULL,
    1
  );
INSERT INTO
  `proveedor` (
    `idproveedor`,
    `nombre`,
    `telefono`,
    `direccion`,
    `ruc`,
    `razon`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    2,
    'test5',
    '3432423',
    'asdasd',
    '12312',
    'sadas',
    'activo',
    '2025-08-26 22:32:22',
    '2025-09-13 21:38:32',
    NULL,
    1
  );
INSERT INTO
  `proveedor` (
    `idproveedor`,
    `nombre`,
    `telefono`,
    `direccion`,
    `ruc`,
    `razon`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    3,
    'testetwet',
    'tesfasdf',
    'asdfasdf',
    '3123132',
    'ttets',
    'activo',
    '2025-09-13 22:13:44',
    '2025-09-13 22:13:44',
    NULL,
    2
  );
INSERT INTO
  `proveedor` (
    `idproveedor`,
    `nombre`,
    `telefono`,
    `direccion`,
    `ruc`,
    `razon`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    4,
    'TestProvider1',
    '123123',
    'sanjuannepomuceno',
    '23123',
    'testrazon',
    'activo',
    '2025-09-24 18:26:49',
    '2025-09-24 18:26:49',
    NULL,
    1
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: tipo_egreso
# ------------------------------------------------------------

INSERT INTO
  `tipo_egreso` (
    `idtipo_egreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    1,
    'Egresos Varios',
    '2025-07-29 21:12:13',
    '2025-09-17 22:35:46',
    NULL,
    1
  );
INSERT INTO
  `tipo_egreso` (
    `idtipo_egreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    2,
    'Pago de compras',
    '2025-07-29 23:46:22',
    '2025-09-17 22:35:50',
    NULL,
    1
  );
INSERT INTO
  `tipo_egreso` (
    `idtipo_egreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    3,
    'Egreso por ajuste',
    '2025-07-29 23:46:22',
    '2025-09-17 22:35:54',
    NULL,
    1
  );
INSERT INTO
  `tipo_egreso` (
    `idtipo_egreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    4,
    'Egreso extra',
    '2025-07-29 23:46:22',
    '2025-09-17 22:35:57',
    NULL,
    1
  );
INSERT INTO
  `tipo_egreso` (
    `idtipo_egreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    5,
    'Donación',
    '2025-07-29 23:46:22',
    '2025-09-17 22:36:00',
    NULL,
    1
  );
INSERT INTO
  `tipo_egreso` (
    `idtipo_egreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    13,
    'test1',
    '2025-09-21 19:07:31',
    '2025-09-21 19:07:31',
    NULL,
    2
  );
INSERT INTO
  `tipo_egreso` (
    `idtipo_egreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    14,
    'test2',
    '2025-09-21 19:08:54',
    '2025-09-21 19:08:54',
    NULL,
    2
  );
INSERT INTO
  `tipo_egreso` (
    `idtipo_egreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    15,
    'asdfasdf',
    '2025-09-23 08:18:39',
    '2025-09-23 08:18:39',
    NULL,
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: tipo_ingreso
# ------------------------------------------------------------

INSERT INTO
  `tipo_ingreso` (
    `idtipo_ingreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    1,
    'Ingresos Varios',
    '2025-07-13 00:13:16',
    '2025-07-13 00:13:16',
    NULL,
    1
  );
INSERT INTO
  `tipo_ingreso` (
    `idtipo_ingreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    2,
    'Pago de deuda',
    '2025-07-26 16:18:01',
    NULL,
    NULL,
    1
  );
INSERT INTO
  `tipo_ingreso` (
    `idtipo_ingreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    3,
    'Ingreso por ajuste',
    '2025-07-26 16:18:01',
    NULL,
    NULL,
    1
  );
INSERT INTO
  `tipo_ingreso` (
    `idtipo_ingreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    4,
    'Ingreso extra',
    '2025-07-26 16:18:01',
    NULL,
    NULL,
    1
  );
INSERT INTO
  `tipo_ingreso` (
    `idtipo_ingreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (5, 'Donación', '2025-07-26 16:18:01', NULL, NULL, 1);
INSERT INTO
  `tipo_ingreso` (
    `idtipo_ingreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (6, 'TestType', '2025-07-26 16:18:01', NULL, NULL, 1);
INSERT INTO
  `tipo_ingreso` (
    `idtipo_ingreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (7, 'TestType2', '2025-07-26 16:18:01', NULL, NULL, 1);
INSERT INTO
  `tipo_ingreso` (
    `idtipo_ingreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (8, 'test1', '2025-07-26 16:18:01', NULL, NULL, 1);
INSERT INTO
  `tipo_ingreso` (
    `idtipo_ingreso`,
    `descripcion`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idusuario`
  )
VALUES
  (
    9,
    'TestIngreso2',
    '2025-09-01 12:19:45',
    '2025-09-01 12:19:45',
    NULL,
    1
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: usuarios
# ------------------------------------------------------------

INSERT INTO
  `usuarios` (
    `idusuarios`,
    `nombre`,
    `apellido`,
    `telefono`,
    `acceso`,
    `login`,
    `password`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    1,
    'Admin',
    'E',
    '9822222',
    'Administrador',
    'usuarioAdmin',
    '$2b$10$umv9ZWHw79d1SS21AhhJ0OqTKGPsWiUZ.ka5hqiCVJHtJHeAp99r6',
    'activo',
    '2025-07-31 17:49:10',
    '2025-08-11 14:59:32',
    NULL
  );
INSERT INTO
  `usuarios` (
    `idusuarios`,
    `nombre`,
    `apellido`,
    `telefono`,
    `acceso`,
    `login`,
    `password`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    2,
    'Test3',
    'Test3',
    '098333333',
    'Administrador',
    'test3',
    '$2b$10$5UlFssSaqkW7WZXvim.mBON6bJeQARbjDH3Qdq0HSRXbzFlnXilk6',
    'activo',
    '2025-09-10 19:37:59',
    '2025-09-10 19:37:59',
    NULL
  );
INSERT INTO
  `usuarios` (
    `idusuarios`,
    `nombre`,
    `apellido`,
    `telefono`,
    `acceso`,
    `login`,
    `password`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    3,
    'Juan',
    'Test',
    '0983312082',
    'Administrador',
    'usuarioAdmin4',
    '$2b$10$3nU6nmSNBfOtj3RgUwOmNuAf7WVGmA7fNmhYsGHBdnesJak/qg8NK',
    'activo',
    '2025-09-17 22:03:52',
    '2025-09-17 22:03:52',
    NULL
  );
INSERT INTO
  `usuarios` (
    `idusuarios`,
    `nombre`,
    `apellido`,
    `telefono`,
    `acceso`,
    `login`,
    `password`,
    `estado`,
    `created_at`,
    `updated_at`,
    `deleted_at`
  )
VALUES
  (
    4,
    'Cliente',
    'Test',
    '98789789',
    'Administrador',
    'usuarioTest1',
    '$2b$10$s22J24ITSDRyqsVP6DbHUe7l.AbH0QohWbjoqKxJymJYrUJaslsD2',
    'activo',
    '2025-09-24 18:25:58',
    '2025-09-24 18:25:58',
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: ventas
# ------------------------------------------------------------

INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    1,
    1,
    1,
    3500.00,
    '2025-08-11',
    '17:50:14',
    '',
    1,
    'contado',
    'activo',
    1,
    NULL,
    2,
    0.00,
    'sin_descuento',
    3500.00,
    0.00,
    'ticket',
    0.00,
    318.18,
    318.18,
    'Tres Mil Quinientos guaraníes',
    NULL,
    '2025-08-11 17:50:14',
    '2025-09-07 19:18:22',
    NULL,
    1,
    'Test S.A',
    '3333333-2',
    '5555555',
    '2025-08-11',
    '2026-08-11',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    2,
    1,
    1,
    3500.00,
    '2025-08-11',
    '17:57:12',
    '',
    2,
    'credito',
    'activo',
    NULL,
    NULL,
    2,
    0.00,
    'sin_descuento',
    3500.00,
    0.00,
    'ticket',
    0.00,
    318.18,
    318.18,
    'Tres Mil Quinientos guaraníes',
    NULL,
    '2025-08-11 17:57:12',
    '2025-09-07 19:18:22',
    NULL,
    1,
    'Test S.A',
    '3333333-2',
    '5555555',
    '2025-08-11',
    '2026-08-11',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    3,
    1,
    1,
    3500.00,
    '2025-08-18',
    '20:35:30',
    '',
    3,
    'credito',
    'activo',
    NULL,
    NULL,
    2,
    0.00,
    'sin_descuento',
    3500.00,
    0.00,
    'ticket',
    0.00,
    318.18,
    318.18,
    'Tres Mil Quinientos guaraníes',
    NULL,
    '2025-08-18 20:35:30',
    '2025-09-07 19:18:22',
    NULL,
    1,
    'Test S.A',
    '3333333-2',
    '5555555',
    '2025-08-11',
    '2026-08-11',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    4,
    1,
    2,
    4500.00,
    '2025-09-03',
    '08:01:40',
    '',
    4,
    'contado',
    'activo',
    1,
    NULL,
    3,
    0.00,
    'sin_descuento',
    4500.00,
    0.00,
    'ticket',
    0.00,
    409.09,
    409.09,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-03 08:01:40',
    '2025-09-07 19:18:22',
    NULL,
    2,
    'test',
    '564',
    '56565465',
    '2025-02-05',
    '2026-02-01',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    5,
    1,
    2,
    4500.00,
    '2025-09-03',
    '08:12:46',
    '',
    5,
    'contado',
    'activo',
    1,
    NULL,
    3,
    0.00,
    'sin_descuento',
    4500.00,
    0.00,
    'ticket',
    0.00,
    409.09,
    409.09,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-03 08:12:46',
    '2025-09-07 19:18:22',
    NULL,
    2,
    'test',
    '564',
    '56565465',
    '2025-02-05',
    '2026-02-01',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    6,
    1,
    2,
    4500.00,
    '2025-09-03',
    '09:14:55',
    '',
    6,
    'contado',
    'activo',
    1,
    NULL,
    3,
    0.00,
    'sin_descuento',
    4500.00,
    0.00,
    'ticket',
    0.00,
    409.09,
    409.09,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-03 09:14:55',
    '2025-09-07 19:18:22',
    NULL,
    2,
    'test',
    '564',
    '56565465',
    '2025-02-05',
    '2026-02-01',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    7,
    1,
    2,
    4500.00,
    '2025-09-03',
    '09:30:01',
    '',
    7,
    'contado',
    'activo',
    1,
    NULL,
    3,
    0.00,
    'sin_descuento',
    4500.00,
    0.00,
    'ticket',
    0.00,
    409.09,
    409.09,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-03 09:30:01',
    '2025-09-07 19:18:22',
    NULL,
    2,
    'test',
    '564',
    '56565465',
    '2025-02-05',
    '2026-02-01',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    8,
    1,
    2,
    4500.00,
    '2025-09-03',
    '09:52:52',
    '',
    8,
    'contado',
    'activo',
    NULL,
    NULL,
    3,
    0.00,
    'sin_descuento',
    4500.00,
    0.00,
    'ticket',
    0.00,
    409.09,
    409.09,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-03 09:52:52',
    '2025-09-07 19:18:22',
    NULL,
    2,
    'test',
    '564',
    '56565465',
    '2025-02-05',
    '2026-02-01',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    9,
    1,
    2,
    8000.00,
    '2025-09-03',
    '10:11:16',
    '',
    9,
    'contado',
    'activo',
    1,
    NULL,
    3,
    0.00,
    'sin_descuento',
    8000.00,
    0.00,
    'ticket',
    0.00,
    727.27,
    727.27,
    'Ocho Mil guaraníes',
    NULL,
    '2025-09-03 10:11:16',
    '2025-09-07 19:18:22',
    NULL,
    2,
    'test',
    '564',
    '56565465',
    '2025-02-05',
    '2026-02-01',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    10,
    1,
    2,
    7200.00,
    '2025-09-06',
    '15:22:59',
    '',
    10,
    'contado',
    'activo',
    1,
    NULL,
    3,
    0.00,
    'sin_descuento',
    7200.00,
    0.00,
    'ticket',
    0.00,
    654.54,
    654.54,
    'Siete Mil Doscientos guaraníes',
    NULL,
    '2025-09-06 15:22:59',
    '2025-09-07 19:18:22',
    NULL,
    2,
    'test',
    '564',
    '56565465',
    '2025-02-05',
    '2026-02-01',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    11,
    1,
    2,
    450.00,
    '2025-09-06',
    '15:26:59',
    '001-001-00056',
    11,
    'contado',
    'activo',
    1,
    NULL,
    3,
    0.00,
    'sin_descuento',
    450.00,
    0.00,
    'factura',
    0.00,
    40.91,
    40.91,
    'Cuatrocientos Cincuenta guaraníes',
    NULL,
    '2025-09-06 15:26:59',
    '2025-09-07 19:18:22',
    NULL,
    2,
    'test',
    '564',
    '56565465',
    '2025-02-05',
    '2026-02-01',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    12,
    1,
    2,
    4500.00,
    '2025-09-06',
    '20:21:48',
    '',
    12,
    'contado',
    'activo',
    1,
    NULL,
    3,
    0.00,
    'sin_descuento',
    4500.00,
    0.00,
    'ticket',
    0.00,
    409.09,
    409.09,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-06 20:21:48',
    '2025-09-07 19:18:22',
    NULL,
    2,
    'test',
    '564',
    '56565465',
    '2025-02-05',
    '2026-02-01',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    13,
    1,
    2,
    4500.00,
    '2025-09-06',
    '20:25:15',
    '001-001-0001',
    13,
    'contado',
    'activo',
    1,
    NULL,
    3,
    0.00,
    'sin_descuento',
    4500.00,
    0.00,
    'factura',
    0.00,
    409.09,
    409.09,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-06 20:25:15',
    '2025-09-07 19:18:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    14,
    1,
    2,
    850.00,
    '2025-09-07',
    '08:34:54',
    '',
    14,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    850.00,
    0.00,
    'ticket',
    0.00,
    77.27,
    77.27,
    'Ochocientos Cincuenta guaraníes',
    NULL,
    '2025-09-07 08:34:54',
    '2025-09-07 19:18:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    15,
    1,
    2,
    4925.00,
    '2025-09-07',
    '08:55:10',
    '',
    15,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    4925.00,
    0.00,
    'ticket',
    214.29,
    38.64,
    252.93,
    'Cuatro Mil Novecientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 08:55:10',
    '2025-09-07 19:18:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    16,
    1,
    1,
    4925.00,
    '2025-09-07',
    '09:08:16',
    '',
    16,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    4925.00,
    0.00,
    'ticket',
    214.29,
    38.64,
    252.93,
    'Cuatro Mil Novecientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 09:08:16',
    '2025-09-07 19:18:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1073.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    17,
    1,
    2,
    425.00,
    '2025-09-07',
    '09:54:02',
    '',
    17,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    425.00,
    0.00,
    'ticket',
    0.00,
    38.64,
    38.64,
    'Cuatrocientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 09:54:02',
    '2025-09-07 19:18:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    73.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    18,
    1,
    2,
    425.00,
    '2025-09-07',
    '11:42:18',
    '',
    18,
    'contado',
    'activo',
    1,
    NULL,
    4,
    NULL,
    'sin_descuento',
    425.00,
    0.00,
    'ticket',
    0.00,
    38.64,
    38.64,
    'Cuatrocientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 11:42:18',
    '2025-09-07 19:18:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    73.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    19,
    1,
    2,
    425.00,
    '2025-09-07',
    '11:42:43',
    '001-001-0000003',
    19,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    425.00,
    0.00,
    'factura',
    0.00,
    38.64,
    38.64,
    'Cuatrocientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 11:42:43',
    '2025-09-07 19:18:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    73.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    20,
    1,
    2,
    425.00,
    '2025-09-07',
    '11:43:03',
    '',
    20,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    425.00,
    0.00,
    'ticket',
    0.00,
    38.64,
    38.64,
    'Cuatrocientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 11:43:03',
    '2025-09-07 19:18:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    73.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    21,
    1,
    2,
    425.00,
    '2025-09-07',
    '11:43:16',
    '001-001-0000004',
    21,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    425.00,
    0.00,
    'factura',
    0.00,
    38.64,
    38.64,
    'Cuatrocientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 11:43:16',
    '2025-09-07 19:18:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    73.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    22,
    1,
    2,
    850.00,
    '2025-09-07',
    '11:44:54',
    '',
    22,
    'contado',
    'activo',
    1,
    NULL,
    4,
    NULL,
    'sin_descuento',
    850.00,
    0.00,
    'ticket',
    0.00,
    77.27,
    77.27,
    'Ochocientos Cincuenta guaraníes',
    NULL,
    '2025-09-07 11:44:54',
    '2025-09-07 19:18:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    146.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    23,
    1,
    2,
    5350.00,
    '2025-09-07',
    '11:46:16',
    '',
    23,
    'contado',
    'activo',
    1,
    NULL,
    4,
    NULL,
    'sin_descuento',
    5350.00,
    0.00,
    'ticket',
    214.29,
    77.27,
    291.56,
    'Cinco Mil Trescientos Cincuenta guaraníes',
    NULL,
    '2025-09-07 11:46:16',
    '2025-09-07 19:18:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1146.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    24,
    1,
    2,
    14350.00,
    '2025-09-07',
    '15:27:31',
    '',
    24,
    'contado',
    'activo',
    1,
    NULL,
    4,
    2500.00,
    'descuento_total',
    14350.00,
    0.00,
    'ticket',
    642.86,
    77.27,
    720.13,
    'Catorce Mil Trescientos Cincuenta guaraníes',
    NULL,
    '2025-09-07 15:27:31',
    '2025-09-07 19:18:23',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    3146.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    25,
    1,
    2,
    425.00,
    '2025-09-07',
    '15:29:03',
    '',
    25,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1.00,
    'descuento_total',
    425.00,
    0.00,
    'ticket',
    0.00,
    38.64,
    38.64,
    'Cuatrocientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 15:29:03',
    '2025-09-07 19:18:23',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    73.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    26,
    1,
    2,
    9425.00,
    '2025-09-07',
    '15:53:29',
    '',
    26,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    9425.00,
    0.00,
    'ticket',
    428.57,
    38.64,
    467.21,
    'Nueve Mil Cuatrocientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 15:53:29',
    '2025-09-07 19:18:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    2073.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    27,
    1,
    2,
    9000.00,
    '2025-09-07',
    '15:54:21',
    '',
    27,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    9000.00,
    0.00,
    'ticket',
    428.57,
    0.00,
    428.57,
    'Nueve Mil guaraníes',
    NULL,
    '2025-09-07 15:54:21',
    '2025-09-07 19:18:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    2000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    28,
    1,
    2,
    4500.00,
    '2025-09-07',
    '15:59:53',
    '',
    28,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    4500.00,
    0.00,
    'ticket',
    214.29,
    0.00,
    214.29,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-07 15:59:53',
    '2025-09-07 19:18:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    29,
    1,
    2,
    4925.00,
    '2025-09-07',
    '16:09:55',
    '',
    29,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    4925.00,
    0.00,
    'ticket',
    214.29,
    38.64,
    252.93,
    'Cuatro Mil Novecientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 16:09:55',
    '2025-09-07 19:18:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1073.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    30,
    1,
    2,
    9425.00,
    '2025-09-07',
    '16:19:03',
    '',
    30,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1242.00,
    'descuento_total',
    9425.00,
    0.00,
    'ticket',
    428.57,
    38.64,
    467.21,
    'Nueve Mil Cuatrocientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 16:19:03',
    '2025-09-07 19:18:23',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    2073.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    31,
    1,
    2,
    4500.00,
    '2025-09-07',
    '16:28:43',
    '',
    31,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1200.00,
    'descuento_total',
    4500.00,
    0.00,
    'ticket',
    214.29,
    0.00,
    214.29,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-07 16:28:43',
    '2025-09-07 19:18:23',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    32,
    1,
    2,
    4925.00,
    '2025-09-07',
    '16:46:26',
    '',
    32,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1240.00,
    'descuento_total',
    4925.00,
    0.00,
    'ticket',
    214.29,
    38.64,
    252.93,
    'Cuatro Mil Novecientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 16:46:26',
    '2025-09-07 19:18:23',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1073.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    33,
    1,
    2,
    4925.00,
    '2025-09-07',
    '16:51:53',
    '',
    33,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1200.00,
    'descuento_total',
    4925.00,
    0.00,
    'ticket',
    214.29,
    38.64,
    252.93,
    'Cuatro Mil Novecientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 16:51:53',
    '2025-09-07 19:18:23',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1073.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    34,
    1,
    2,
    4500.00,
    '2025-09-07',
    '16:54:03',
    '',
    34,
    'contado',
    'activo',
    1,
    NULL,
    4,
    23.00,
    'descuento_total',
    4500.00,
    0.00,
    'ticket',
    214.29,
    0.00,
    214.29,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-07 16:54:03',
    '2025-09-07 19:18:23',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    35,
    1,
    2,
    4500.00,
    '2025-09-07',
    '16:59:11',
    '',
    35,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1200.00,
    'descuento_total',
    4500.00,
    0.00,
    'ticket',
    214.29,
    0.00,
    214.29,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-07 16:59:11',
    '2025-09-07 19:18:23',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    36,
    1,
    2,
    4925.00,
    '2025-09-07',
    '18:30:33',
    '',
    36,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1200.00,
    'descuento_total',
    4925.00,
    0.00,
    'ticket',
    214.29,
    38.64,
    252.93,
    'Cuatro Mil Novecientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 18:30:33',
    '2025-09-07 19:18:23',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1073.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    37,
    1,
    2,
    4500.00,
    '2025-09-07',
    '18:42:09',
    '',
    37,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1200.00,
    'descuento_total',
    4500.00,
    0.00,
    'ticket',
    214.29,
    0.00,
    214.29,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-07 18:42:09',
    '2025-09-07 19:18:23',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    38,
    1,
    2,
    4925.00,
    '2025-09-07',
    '18:49:04',
    '',
    38,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1212.00,
    'descuento_total',
    4925.00,
    0.00,
    'ticket',
    214.29,
    38.64,
    252.93,
    'Cuatro Mil Novecientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 18:49:04',
    '2025-09-07 19:18:23',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1073.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    39,
    1,
    2,
    4500.00,
    '2025-09-07',
    '19:03:32',
    '',
    39,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1200.00,
    'descuento_total',
    4500.00,
    0.00,
    'ticket',
    0.00,
    0.00,
    0.00,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-07 19:03:32',
    '2025-09-07 19:18:23',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    40,
    1,
    2,
    4500.00,
    '2025-09-07',
    '19:26:49',
    '',
    40,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1200.00,
    'descuento_producto',
    4500.00,
    0.00,
    'ticket',
    0.00,
    0.00,
    0.00,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-07 19:26:49',
    '2025-09-07 19:26:49',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    41,
    1,
    2,
    4500.00,
    '2025-09-07',
    '19:29:27',
    '',
    41,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1200.00,
    'descuento_producto',
    4500.00,
    0.00,
    'ticket',
    214.29,
    0.00,
    214.29,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-07 19:29:27',
    '2025-09-07 19:29:27',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    42,
    1,
    2,
    4500.00,
    '2025-09-07',
    '19:30:12',
    '',
    42,
    'contado',
    'activo',
    1,
    NULL,
    4,
    2000.00,
    'descuento_producto',
    4500.00,
    0.00,
    'ticket',
    214.29,
    0.00,
    214.29,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-07 19:30:12',
    '2025-09-07 19:30:12',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    43,
    1,
    2,
    2500.00,
    '2025-09-07',
    '19:35:26',
    '',
    43,
    'contado',
    'activo',
    1,
    NULL,
    4,
    2000.00,
    'descuento_total',
    4500.00,
    0.00,
    'ticket',
    214.29,
    0.00,
    214.29,
    'Dos Mil Quinientos guaraníes',
    NULL,
    '2025-09-07 19:35:26',
    '2025-09-07 19:35:26',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    44,
    1,
    2,
    0.00,
    '2025-09-07',
    '19:42:49',
    '',
    44,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'descuento_producto',
    4500.00,
    0.00,
    'ticket',
    214.29,
    0.00,
    214.29,
    'Cero guaraníes',
    NULL,
    '2025-09-07 19:42:49',
    '2025-09-07 19:42:49',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    45,
    1,
    2,
    3500.00,
    '2025-09-07',
    '19:53:01',
    '',
    45,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1000.00,
    'descuento_producto',
    4500.00,
    0.00,
    'ticket',
    214.29,
    0.00,
    214.29,
    'Tres Mil Quinientos guaraníes',
    NULL,
    '2025-09-07 19:53:01',
    '2025-09-07 19:53:01',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    46,
    1,
    1,
    3500.00,
    '2025-09-07',
    '20:33:30',
    '',
    46,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1000.00,
    'descuento_total',
    4500.00,
    0.00,
    'ticket',
    166.67,
    0.00,
    166.67,
    'Tres Mil Quinientos guaraníes',
    NULL,
    '2025-09-07 20:33:30',
    '2025-09-07 20:33:30',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    47,
    1,
    2,
    3338.00,
    '2025-09-07',
    '20:37:15',
    '',
    47,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1012.00,
    'descuento_producto',
    4350.00,
    0.00,
    'ticket',
    0.00,
    303.45,
    303.45,
    'Tres Mil Trescientos Treinta Y Ocho guaraníes',
    NULL,
    '2025-09-07 20:37:15',
    '2025-09-07 20:37:15',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    134.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    48,
    1,
    2,
    3000.00,
    '2025-09-07',
    '20:59:36',
    '',
    48,
    'contado',
    'activo',
    1,
    NULL,
    4,
    500.00,
    'descuento_producto',
    3500.00,
    0.00,
    'ticket',
    0.00,
    272.73,
    272.73,
    'Tres Mil guaraníes',
    NULL,
    '2025-09-07 20:59:36',
    '2025-09-07 20:59:36',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    500.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    49,
    1,
    2,
    2725.00,
    '2025-09-07',
    '21:13:22',
    '',
    49,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1200.00,
    'descuento_total',
    3925.00,
    0.00,
    'ticket',
    0.00,
    247.72,
    247.72,
    'Dos Mil Setecientos Veinticinco guaraníes',
    NULL,
    '2025-09-07 21:13:22',
    '2025-09-07 21:13:22',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    -127.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    50,
    1,
    2,
    3300.00,
    '2025-09-07',
    '23:44:02',
    '',
    50,
    'contado',
    'activo',
    1,
    NULL,
    4,
    200.00,
    'descuento_producto',
    3500.00,
    0.00,
    'ticket',
    0.00,
    300.00,
    300.00,
    'Tres Mil Trescientos guaraníes',
    NULL,
    '2025-09-07 23:44:02',
    '2025-09-07 23:44:02',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    800.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    51,
    1,
    2,
    3300.00,
    '2025-09-07',
    '23:44:26',
    '',
    51,
    'contado',
    'activo',
    1,
    NULL,
    4,
    200.00,
    'descuento_producto',
    3500.00,
    0.00,
    'ticket',
    0.00,
    300.00,
    300.00,
    'Tres Mil Trescientos guaraníes',
    NULL,
    '2025-09-07 23:44:26',
    '2025-09-07 23:44:26',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    800.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    52,
    1,
    1,
    3480.00,
    '2025-09-07',
    '23:44:54',
    '',
    52,
    'contado',
    'activo',
    1,
    NULL,
    4,
    20.00,
    'descuento_total',
    3500.00,
    0.00,
    'ticket',
    0.00,
    316.36,
    316.36,
    'Tres Mil Cuatrocientos Ochenta guaraníes',
    NULL,
    '2025-09-07 23:44:54',
    '2025-09-07 23:44:54',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    980.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    53,
    1,
    1,
    3480.00,
    '2025-09-07',
    '23:45:47',
    '',
    53,
    'contado',
    'activo',
    1,
    NULL,
    4,
    20.00,
    'descuento_producto',
    3500.00,
    0.00,
    'ticket',
    0.00,
    316.36,
    316.36,
    'Tres Mil Cuatrocientos Ochenta guaraníes',
    NULL,
    '2025-09-07 23:45:47',
    '2025-09-07 23:45:47',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    980.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    54,
    1,
    1,
    3480.00,
    '2025-09-07',
    '23:55:53',
    '',
    54,
    'contado',
    'activo',
    1,
    NULL,
    4,
    20.00,
    'descuento_total',
    3500.00,
    0.00,
    'ticket',
    0.00,
    316.36,
    316.36,
    'Tres Mil Cuatrocientos Ochenta guaraníes',
    NULL,
    '2025-09-07 23:55:53',
    '2025-09-07 23:55:53',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    980.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    55,
    1,
    2,
    415.00,
    '2025-09-09',
    '21:18:51',
    '',
    55,
    'contado',
    'activo',
    1,
    NULL,
    4,
    10.00,
    'descuento_total',
    425.00,
    0.00,
    'ticket',
    0.00,
    37.73,
    37.73,
    'Cuatrocientos Quince guaraníes',
    NULL,
    '2025-09-08 21:18:51',
    '2025-09-08 21:18:51',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    63.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    56,
    1,
    2,
    415.00,
    '2025-09-09',
    '22:17:45',
    '',
    56,
    'contado',
    'activo',
    1,
    NULL,
    4,
    10.00,
    'descuento_total',
    425.00,
    0.00,
    'ticket',
    0.00,
    37.73,
    37.73,
    'Cuatrocientos Quince guaraníes',
    NULL,
    '2025-09-08 22:17:45',
    '2025-09-08 22:17:45',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    63.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    57,
    1,
    2,
    425.00,
    '2025-09-09',
    '22:24:45',
    '',
    57,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'descuento_total',
    425.00,
    0.00,
    'ticket',
    0.00,
    38.64,
    38.64,
    'Cuatrocientos Veinticinco guaraníes',
    NULL,
    '2025-09-08 22:24:45',
    '2025-09-08 22:24:45',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    73.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    58,
    1,
    2,
    3500.00,
    '2025-09-08',
    '22:38:05',
    '',
    58,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    3500.00,
    0.00,
    'ticket',
    0.00,
    318.18,
    318.18,
    'Tres Mil Quinientos guaraníes',
    NULL,
    '2025-09-08 22:38:05',
    '2025-09-08 22:38:05',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    59,
    1,
    2,
    425.00,
    '2025-09-09',
    '22:48:19',
    '',
    59,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    425.00,
    0.00,
    'ticket',
    0.00,
    38.64,
    38.64,
    'Cuatrocientos Veinticinco guaraníes',
    NULL,
    '2025-09-08 22:48:19',
    '2025-09-08 22:48:19',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    73.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    60,
    1,
    2,
    425.00,
    '2025-09-09',
    '22:48:47',
    '',
    60,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    425.00,
    0.00,
    'ticket',
    0.00,
    38.64,
    38.64,
    'Cuatrocientos Veinticinco guaraníes',
    NULL,
    '2025-09-08 22:48:47',
    '2025-09-08 22:48:47',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    73.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    61,
    1,
    2,
    415.00,
    '2025-09-09',
    '22:50:18',
    '',
    61,
    'contado',
    'activo',
    1,
    NULL,
    4,
    10.00,
    'descuento_total',
    425.00,
    0.00,
    'ticket',
    0.00,
    37.73,
    37.73,
    'Cuatrocientos Quince guaraníes',
    NULL,
    '2025-09-08 22:50:18',
    '2025-09-08 22:50:18',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    63.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    62,
    2,
    2,
    3500.00,
    '2025-09-10',
    '19:44:59',
    '',
    62,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    3500.00,
    0.00,
    'ticket',
    0.00,
    318.18,
    318.18,
    'Tres Mil Quinientos guaraníes',
    NULL,
    '2025-09-10 19:44:59',
    '2025-09-10 19:44:59',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    63,
    1,
    2,
    6000.00,
    '2025-09-13',
    '10:34:09',
    '',
    63,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1000.00,
    'descuento_producto',
    7000.00,
    0.00,
    'ticket',
    0.00,
    545.45,
    545.45,
    'Seis Mil guaraníes',
    NULL,
    '2025-09-13 10:34:09',
    '2025-09-13 10:34:09',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    64,
    1,
    2,
    2500.00,
    '2025-09-13',
    '10:51:11',
    '',
    64,
    'contado',
    'activo',
    1,
    NULL,
    4,
    1000.00,
    'descuento_producto',
    3500.00,
    0.00,
    'ticket',
    0.00,
    227.27,
    227.27,
    'Dos Mil Quinientos guaraníes',
    NULL,
    '2025-09-13 10:51:11',
    '2025-09-13 10:51:11',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    65,
    1,
    2,
    4250.00,
    '2025-09-15',
    '00:00:00',
    '',
    65,
    'credito',
    'activo',
    NULL,
    NULL,
    4,
    0.00,
    'sin_descuento',
    4250.00,
    0.00,
    'ticket',
    0.00,
    386.36,
    386.36,
    'Cuatro Mil Doscientos Cincuenta guaraníes',
    NULL,
    '2025-09-15 00:00:00',
    '2025-09-15 00:00:00',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    66,
    1,
    8,
    4500.00,
    '2025-09-16',
    '18:38:45',
    '',
    66,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    4500.00,
    0.00,
    'ticket',
    0.00,
    409.09,
    409.09,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-16 18:38:45',
    '2025-09-16 18:38:45',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1076.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    67,
    1,
    1,
    3500.00,
    '2025-09-18',
    '00:00:00',
    '',
    67,
    'credito',
    'activo',
    NULL,
    NULL,
    4,
    0.00,
    'sin_descuento',
    3500.00,
    0.00,
    'ticket',
    0.00,
    318.18,
    318.18,
    'Tres Mil Quinientos guaraníes',
    NULL,
    '2025-09-18 00:00:00',
    '2025-09-18 00:00:00',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    68,
    1,
    2,
    4500.00,
    '2025-09-21',
    '17:43:30',
    '',
    68,
    'credito',
    'activo',
    NULL,
    NULL,
    4,
    0.00,
    'sin_descuento',
    4500.00,
    0.00,
    'ticket',
    0.00,
    409.09,
    409.09,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-21 17:43:30',
    '2025-09-21 17:43:30',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    69,
    1,
    2,
    4500.00,
    '2025-09-21',
    '17:43:33',
    '',
    69,
    'credito',
    'activo',
    NULL,
    NULL,
    4,
    0.00,
    'sin_descuento',
    4500.00,
    0.00,
    'ticket',
    0.00,
    409.09,
    409.09,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-21 17:43:33',
    '2025-09-21 17:43:33',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    70,
    2,
    2,
    3500.00,
    '2025-09-21',
    '17:43:35',
    '',
    70,
    'credito',
    'activo',
    NULL,
    NULL,
    4,
    0.00,
    'sin_descuento',
    3500.00,
    0.00,
    'ticket',
    0.00,
    318.18,
    318.18,
    'Tres Mil Quinientos guaraníes',
    NULL,
    '2025-09-21 17:43:35',
    '2025-09-21 17:43:35',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    71,
    1,
    8,
    4500.00,
    '2025-09-23',
    '08:56:12',
    '',
    71,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    4500.00,
    0.00,
    'ticket',
    0.00,
    409.09,
    409.09,
    'Cuatro Mil Quinientos guaraníes',
    NULL,
    '2025-09-23 08:56:12',
    '2025-09-23 08:56:12',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    1000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    72,
    1,
    1,
    15000.00,
    '2025-09-24',
    '18:31:00',
    '',
    72,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    15000.00,
    0.00,
    'ticket',
    0.00,
    1363.64,
    1363.64,
    'Quince Mil guaraníes',
    NULL,
    '2025-09-24 18:31:00',
    '2025-09-24 18:31:00',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    5000.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    73,
    1,
    9,
    3000.00,
    '2025-09-24',
    '18:34:30',
    '',
    73,
    'credito',
    'activo',
    NULL,
    NULL,
    4,
    0.00,
    'sin_descuento',
    3000.00,
    0.00,
    'ticket',
    0.00,
    272.73,
    272.73,
    'Tres Mil guaraníes',
    NULL,
    '2025-09-24 18:34:30',
    '2025-09-24 18:34:30',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    74,
    1,
    9,
    5000.00,
    '2025-09-26',
    '21:59:11',
    '',
    74,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    5000.00,
    0.00,
    'ticket',
    0.00,
    454.55,
    454.55,
    'Cinco Mil guaraníes',
    NULL,
    '2025-09-26 21:59:11',
    '2025-09-26 21:59:11',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    2500.00,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    75,
    1,
    9,
    85000.00,
    '2025-10-14',
    '18:45:34',
    '',
    75,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'descuento_producto',
    85000.00,
    0.00,
    'ticket',
    0.00,
    7727.27,
    7727.27,
    'Ochenta Y Cinco Mil guaraníes',
    NULL,
    '2025-10-14 18:45:34',
    '2025-10-14 18:45:34',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    36428.62,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    76,
    1,
    9,
    10000.00,
    '2025-10-14',
    '18:51:44',
    '',
    76,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    10000.00,
    0.00,
    'ticket',
    0.00,
    909.09,
    909.09,
    'Diez Mil guaraníes',
    NULL,
    '2025-10-14 18:51:44',
    '2025-10-14 18:51:44',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    4285.72,
    NULL,
    NULL
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    77,
    1,
    9,
    5000.00,
    '2025-10-14',
    '22:58:06',
    '',
    77,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    5000.00,
    0.00,
    'ticket',
    0.00,
    454.55,
    454.55,
    'Cinco Mil guaraníes',
    NULL,
    '2025-10-14 22:58:06',
    '2025-10-14 22:58:06',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    2142.86,
    'TESTNAME TESTAPELLIDO',
    'sdfasdf'
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    78,
    1,
    9,
    5000.00,
    '2025-10-14',
    '23:00:16',
    '',
    78,
    'contado',
    'activo',
    1,
    NULL,
    4,
    0.00,
    'sin_descuento',
    5000.00,
    0.00,
    'ticket',
    0.00,
    454.54,
    454.54,
    'Cinco Mil guaraníes',
    NULL,
    '2025-10-14 23:00:16',
    '2025-10-14 23:00:16',
    NULL,
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    2142.86,
    'TESTNAME TESTAPELLIDO',
    'sdfasdf'
  );
INSERT INTO
  `ventas` (
    `idventa`,
    `idusuarios`,
    `idcliente`,
    `total`,
    `fecha`,
    `hora`,
    `nro_factura`,
    `nro_ticket`,
    `tipo`,
    `estado`,
    `idformapago`,
    `iddato_transferencia_venta`,
    `idmovimiento`,
    `total_descuento`,
    `tipo_descuento`,
    `total_original`,
    `saldo`,
    `tipo_comprobante`,
    `iva5`,
    `iva10`,
    `totaliva`,
    `totalletras`,
    `estado_pago`,
    `created_at`,
    `updated_at`,
    `deleted_at`,
    `idfacturador`,
    `nombre_fantasia_facturador`,
    `ruc_facturador`,
    `timbrado_nro_facturador`,
    `fecha_inicio_vigente_facturador`,
    `fecha_fin_vigente_facturador`,
    `iddetalle_cheque_venta`,
    `total_ganancia`,
    `nombre_cliente`,
    `documento_cliente`
  )
VALUES
  (
    79,
    1,
    2,
    4250.00,
    '2025-10-15',
    '00:00:00',
    '',
    79,
    'credito',
    'activo',
    NULL,
    NULL,
    4,
    0.00,
    'sin_descuento',
    4250.00,
    0.00,
    'ticket',
    0.00,
    386.36,
    386.36,
    'Cuatro Mil Doscientos Cincuenta guaraníes',
    NULL,
    '2025-10-15 00:00:00',
    '2025-10-15 00:36:26',
    '2025-10-15 00:36:26',
    3,
    'REPUESTOS S.A',
    '55555-5',
    '2132123',
    '2025-09-05',
    '2025-09-18',
    NULL,
    0.00,
    'TESTCLIENTE2 TESTAPELLIDO',
    '123123'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: ventas_programadas
# ------------------------------------------------------------

INSERT INTO
  `ventas_programadas` (
    `idprogramacion`,
    `idcliente`,
    `idproducto`,
    `cantidad`,
    `fecha_inicio`,
    `dia_programado`,
    `ultima_fecha_venta`,
    `estado`,
    `idusuario`,
    `observacion`,
    `created_at`,
    `deleted_at`,
    `updated_at`
  )
VALUES
  (
    1,
    1,
    1,
    1.00,
    '2025-08-11',
    18,
    '2025-09-18',
    'activa',
    1,
    'test',
    '2025-08-11 17:53:59',
    NULL,
    NULL
  );
INSERT INTO
  `ventas_programadas` (
    `idprogramacion`,
    `idcliente`,
    `idproducto`,
    `cantidad`,
    `fecha_inicio`,
    `dia_programado`,
    `ultima_fecha_venta`,
    `estado`,
    `idusuario`,
    `observacion`,
    `created_at`,
    `deleted_at`,
    `updated_at`
  )
VALUES
  (
    2,
    2,
    2,
    1.00,
    '2025-09-02',
    20,
    '2025-09-21',
    'activa',
    1,
    'test',
    '2025-09-02 11:28:48',
    NULL,
    NULL
  );
INSERT INTO
  `ventas_programadas` (
    `idprogramacion`,
    `idcliente`,
    `idproducto`,
    `cantidad`,
    `fecha_inicio`,
    `dia_programado`,
    `ultima_fecha_venta`,
    `estado`,
    `idusuario`,
    `observacion`,
    `created_at`,
    `deleted_at`,
    `updated_at`
  )
VALUES
  (
    3,
    2,
    2,
    1.00,
    '2025-09-02',
    20,
    '2025-09-21',
    'activa',
    1,
    'test',
    '2025-09-02 11:32:04',
    NULL,
    NULL
  );
INSERT INTO
  `ventas_programadas` (
    `idprogramacion`,
    `idcliente`,
    `idproducto`,
    `cantidad`,
    `fecha_inicio`,
    `dia_programado`,
    `ultima_fecha_venta`,
    `estado`,
    `idusuario`,
    `observacion`,
    `created_at`,
    `deleted_at`,
    `updated_at`
  )
VALUES
  (
    4,
    2,
    8,
    1.00,
    '2025-09-11',
    15,
    '2025-10-15',
    'activa',
    1,
    'test',
    '2025-09-10 21:45:29',
    NULL,
    NULL
  );
INSERT INTO
  `ventas_programadas` (
    `idprogramacion`,
    `idcliente`,
    `idproducto`,
    `cantidad`,
    `fecha_inicio`,
    `dia_programado`,
    `ultima_fecha_venta`,
    `estado`,
    `idusuario`,
    `observacion`,
    `created_at`,
    `deleted_at`,
    `updated_at`
  )
VALUES
  (
    5,
    2,
    5,
    1.00,
    '2025-09-11',
    20,
    '2025-09-21',
    'activa',
    2,
    '',
    '2025-09-10 21:49:22',
    NULL,
    NULL
  );
INSERT INTO
  `ventas_programadas` (
    `idprogramacion`,
    `idcliente`,
    `idproducto`,
    `cantidad`,
    `fecha_inicio`,
    `dia_programado`,
    `ultima_fecha_venta`,
    `estado`,
    `idusuario`,
    `observacion`,
    `created_at`,
    `deleted_at`,
    `updated_at`
  )
VALUES
  (
    6,
    9,
    14,
    1.00,
    '2025-09-24',
    24,
    '2025-09-24',
    'activa',
    1,
    'test',
    '2025-09-24 18:34:22',
    NULL,
    NULL
  );

# ------------------------------------------------------------
# TRIGGER DUMP FOR: before_insert_clientes
# ------------------------------------------------------------

DROP TRIGGER IF EXISTS before_insert_clientes;
DELIMITER ;;
CREATE TRIGGER `before_insert_clientes` BEFORE INSERT ON `clientes` FOR EACH ROW BEGIN
  SET NEW.nombre = UPPER(NEW.nombre);
  SET NEW.apellido = UPPER(NEW.apellido);
  SET NEW.direccion = UPPER(NEW.direccion);
  SET NEW.descripcion = UPPER(NEW.descripcion);
END;;
DELIMITER ;

# ------------------------------------------------------------
# TRIGGER DUMP FOR: before_update_clientes
# ------------------------------------------------------------

DROP TRIGGER IF EXISTS before_update_clientes;
DELIMITER ;;
CREATE TRIGGER `before_update_clientes` BEFORE UPDATE ON `clientes` FOR EACH ROW BEGIN
  SET NEW.nombre = UPPER(NEW.nombre);
  SET NEW.apellido = UPPER(NEW.apellido);
  SET NEW.direccion = UPPER(NEW.direccion);
  SET NEW.descripcion = UPPER(NEW.descripcion);
END;;
DELIMITER ;

# ------------------------------------------------------------
# TRIGGER DUMP FOR: trg_anular_deuda_compra_despues_update
# ------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_anular_deuda_compra_despues_update;
DELIMITER ;;
CREATE TRIGGER `trg_anular_deuda_compra_despues_update` AFTER UPDATE ON `compras` FOR EACH ROW BEGIN
  DECLARE v_iddeuda_compra INT;

  -- Solo si la compra fue marcada como eliminada y era de tipo crédito
  IF NEW.deleted_at IS NOT NULL AND OLD.tipo = 'credito' THEN

    -- Buscar la deuda relacionada
    SELECT iddeuda_compra INTO v_iddeuda_compra
    FROM deuda_compra
    WHERE idcompra = NEW.idcompra AND deleted_at IS NULL
    LIMIT 1;

    -- Si se encontró deuda, marcarla como eliminada y actualizar estado
    IF v_iddeuda_compra IS NOT NULL THEN
      UPDATE deuda_compra
      SET deleted_at = NOW(), estado = 'anulada'
      WHERE iddeuda_compra = v_iddeuda_compra;

      UPDATE detalle_pago_deuda_compra
      SET deleted_at = NOW()
      WHERE iddeuda_compra = v_iddeuda_compra AND deleted_at IS NULL;
    END IF;

  END IF;
END;;
DELIMITER ;

# ------------------------------------------------------------
# TRIGGER DUMP FOR: detalle_compra_nombre_mayuscula
# ------------------------------------------------------------

DROP TRIGGER IF EXISTS detalle_compra_nombre_mayuscula;
DELIMITER ;;
CREATE TRIGGER `detalle_compra_nombre_mayuscula` BEFORE INSERT ON `detalle_compra` FOR EACH ROW BEGIN
  SET NEW.nombre_producto = UPPER(NEW.nombre_producto);
END;;
DELIMITER ;

# ------------------------------------------------------------
# TRIGGER DUMP FOR: detalle_compra_nombre_mayuscula_update
# ------------------------------------------------------------

DROP TRIGGER IF EXISTS detalle_compra_nombre_mayuscula_update;
DELIMITER ;;
CREATE TRIGGER `detalle_compra_nombre_mayuscula_update` BEFORE UPDATE ON `detalle_compra` FOR EACH ROW BEGIN
  SET NEW.nombre_producto = UPPER(NEW.nombre_producto);
END;;
DELIMITER ;

# ------------------------------------------------------------
# TRIGGER DUMP FOR: calcular_iva_detalle
# ------------------------------------------------------------

DROP TRIGGER IF EXISTS calcular_iva_detalle;
DELIMITER ;;
CREATE TRIGGER `calcular_iva_detalle` BEFORE INSERT ON `detalle_venta` FOR EACH ROW BEGIN
  DECLARE tipo_iva INT;

  SELECT iva INTO tipo_iva
  FROM productos
  WHERE idproducto = NEW.idproducto;

  IF tipo_iva = 10 THEN
    SET NEW.iva10 = NEW.sub_total / 11;
    SET NEW.iva5 = 0;
  ELSEIF tipo_iva = 5 THEN
    SET NEW.iva5 = NEW.sub_total / 21;
    SET NEW.iva10 = 0;
  ELSE
    SET NEW.iva5 = 0;
    SET NEW.iva10 = 0;
  END IF;
END;;
DELIMITER ;

# ------------------------------------------------------------
# TRIGGER DUMP FOR: actualizar_totaliva_ventas
# ------------------------------------------------------------

DROP TRIGGER IF EXISTS actualizar_totaliva_ventas;
DELIMITER ;;
CREATE TRIGGER `actualizar_totaliva_ventas` AFTER INSERT ON `detalle_venta` FOR EACH ROW BEGIN
  UPDATE ventas
  SET iva5 = (SELECT IFNULL(SUM(iva5), 0)  FROM detalle_venta WHERE idventa = NEW.idventa),
      iva10 = (SELECT IFNULL(SUM(iva10), 0) FROM detalle_venta WHERE idventa = NEW.idventa),
      totaliva = (SELECT IFNULL(SUM(iva5 + iva10), 0) FROM detalle_venta WHERE idventa = NEW.idventa)
  WHERE idventa = NEW.idventa;
END;;
DELIMITER ;

# ------------------------------------------------------------
# TRIGGER DUMP FOR: actualizar_ganancia_insert
# ------------------------------------------------------------

DROP TRIGGER IF EXISTS actualizar_ganancia_insert;
DELIMITER ;;
CREATE TRIGGER actualizar_ganancia_insert
AFTER INSERT ON detalle_venta
FOR EACH ROW
BEGIN
  UPDATE ventas
  SET total_ganancia = (SELECT IFNULL(SUM(ganancia), 0) FROM detalle_venta WHERE idventa = NEW.idventa)
  WHERE idventa = NEW.idventa;
END;;
DELIMITER ;

# ------------------------------------------------------------
# TRIGGER DUMP FOR: actualizar_ganancia_update
# ------------------------------------------------------------

DROP TRIGGER IF EXISTS actualizar_ganancia_update;
DELIMITER ;;
CREATE TRIGGER actualizar_ganancia_update
AFTER UPDATE ON detalle_venta
FOR EACH ROW
BEGIN
  UPDATE ventas
  SET total_ganancia = (SELECT IFNULL(SUM(ganancia), 0) FROM detalle_venta WHERE idventa = NEW.idventa)
  WHERE idventa = NEW.idventa;
END;;
DELIMITER ;

# ------------------------------------------------------------
# TRIGGER DUMP FOR: actualizar_ganancia_delete
# ------------------------------------------------------------

DROP TRIGGER IF EXISTS actualizar_ganancia_delete;
DELIMITER ;;
CREATE TRIGGER actualizar_ganancia_delete
AFTER DELETE ON detalle_venta
FOR EACH ROW
BEGIN
  UPDATE ventas
  SET total_ganancia = (SELECT IFNULL(SUM(ganancia), 0) FROM detalle_venta WHERE idventa = OLD.idventa)
  WHERE idventa = OLD.idventa;
END;;
DELIMITER ;

# ------------------------------------------------------------
# TRIGGER DUMP FOR: productos_before_insert
# ------------------------------------------------------------

DROP TRIGGER IF EXISTS productos_before_insert;
DELIMITER ;;
CREATE TRIGGER `productos_before_insert` BEFORE INSERT ON `productos` FOR EACH ROW BEGIN
  SET NEW.nombre_producto = UPPER(NEW.nombre_producto);
END;;
DELIMITER ;

# ------------------------------------------------------------
# TRIGGER DUMP FOR: actualizar_cant_cajas_before_insert
# ------------------------------------------------------------

DROP TRIGGER IF EXISTS actualizar_cant_cajas_before_insert;
DELIMITER ;;
CREATE TRIGGER actualizar_cant_cajas_before_insert
BEFORE INSERT ON productos
FOR EACH ROW
BEGIN
    -- Solo calcular si la unidad de medida es CAJA y cant_p_caja es válido
    IF NEW.unidad_medida = 'CAJA' AND NEW.cant_p_caja IS NOT NULL AND NEW.cant_p_caja > 0 THEN
        SET NEW.cant_cajas = ROUND(NEW.stock / NEW.cant_p_caja, 2);
    END IF;
END;;
DELIMITER ;

# ------------------------------------------------------------
# TRIGGER DUMP FOR: productos_before_update
# ------------------------------------------------------------

DROP TRIGGER IF EXISTS productos_before_update;
DELIMITER ;;
CREATE TRIGGER `productos_before_update` BEFORE UPDATE ON `productos` FOR EACH ROW BEGIN
  SET NEW.nombre_producto = UPPER(NEW.nombre_producto);
END;;
DELIMITER ;

# ------------------------------------------------------------
# TRIGGER DUMP FOR: actualizar_cant_cajas_before_update
# ------------------------------------------------------------

DROP TRIGGER IF EXISTS actualizar_cant_cajas_before_update;
DELIMITER ;;
CREATE TRIGGER actualizar_cant_cajas_before_update
BEFORE UPDATE ON productos
FOR EACH ROW
BEGIN
    -- Solo calcular si la unidad de medida es CAJA y cant_p_caja es válido
    IF NEW.unidad_medida = 'CAJA' AND NEW.cant_p_caja IS NOT NULL AND NEW.cant_p_caja > 0 THEN
        SET NEW.cant_cajas = ROUND(NEW.stock / NEW.cant_p_caja, 2);
    END IF;
END;;
DELIMITER ;

# ------------------------------------------------------------
# TRIGGER DUMP FOR: set_hora_before_insert
# ------------------------------------------------------------

DROP TRIGGER IF EXISTS set_hora_before_insert;
DELIMITER ;;
CREATE TRIGGER `set_hora_before_insert` BEFORE INSERT ON `ventas` FOR EACH ROW BEGIN
  SET NEW.hora = TIME(NOW());
END;;
DELIMITER ;

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
