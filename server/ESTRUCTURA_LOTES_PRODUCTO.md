# 📦 Sistema de Lotes de Productos - Arquitectura Normalizada

## 🎯 Principio de Diseño: Separación de Responsabilidades

### ❌ Problema Anterior
`detalle_compra` tenía **doble responsabilidad**:
1. Registrar la compra (histórico)
2. Controlar el inventario (mutable)

**Resultado:** El campo `stock_restante` modificaba el registro original de la compra.

### ✅ Solución Implementada

```
compras (1) ──→ (N) detalle_compra (INMUTABLE)
                          ↓
                     genera (1)
                          ↓
                (1) lotes_producto (MUTABLE) ←── ventas consultan aquí
```

---

## 📊 Estructura de Tablas

### **1. `detalle_compra` (INMUTABLE - Solo lectura después de crearse)**

**Responsabilidad:** Registro histórico de la compra

```sql
CREATE TABLE detalle_compra (
  iddetalle INT PRIMARY KEY,
  idcompra INT,
  idproducto INT,
  cantidad DECIMAL(10,2),      -- ✅ NUNCA cambia (registro fiel)
  precio DECIMAL(10,2),
  sub_total DECIMAL(10,2),
  fecha_vencimiento DATE,
  stock_restante DECIMAL(10,2) -- ⚠️ DEPRECATED (mantener por compatibilidad)
);
```

**Importante:**
- `cantidad`: Siempre refleja lo que se compró originalmente
- `stock_restante`: Ya no se usa (mantener para no romper código legacy)

---

### **2. `lotes_producto` (MUTABLE - Inventario en tiempo real)**

**Responsabilidad:** Control de inventario y trazabilidad

```sql
CREATE TABLE lotes_producto (
  idlote INT PRIMARY KEY AUTO_INCREMENT,

  -- Relaciones
  idproducto INT NOT NULL,
  iddetalle_compra INT NOT NULL,

  -- Identificación (REQUERIDO - Manual del proveedor)
  numero_lote VARCHAR(50) NOT NULL UNIQUE,
  referencia_proveedor VARCHAR(100),

  -- Cantidades
  cantidad_inicial DECIMAL(10,2) NOT NULL,  -- ✅ Inmutable
  stock_actual DECIMAL(10,2) NOT NULL,      -- ✅ Cambia con ventas

  -- Información del lote
  fecha_vencimiento DATE,
  fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
  precio_compra DECIMAL(10,2) NOT NULL,
  ubicacion_almacen VARCHAR(100) DEFAULT 'PRINCIPAL',

  -- Estado
  estado ENUM('disponible','parcial','agotado','vencido','bloqueado'),

  -- Auditoría
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

**Estados del Lote:**
- `disponible`: Stock completo
- `parcial`: Tiene stock pero menos que la cantidad inicial
- `agotado`: Stock = 0
- `vencido`: Fecha de vencimiento pasada
- `bloqueado`: Bloqueado manualmente (no se puede vender)

---

## 🔄 Flujos de Operación

### **COMPRA → Crear Lote**

```javascript
// 1. Usuario envía datos de compra (Frontend)
POST /compras/create
{
  compra: { fecha, proveedor, total },
  detalles: [
    {
      idproducto: 5,
      cantidad: 100,
      precio: 1000,
      fecha_vencimiento: '2026-06-01',
      numero_lote: 'PROV-LOT-2025-001',        // ✅ REQUERIDO
      referencia_proveedor: 'REF-ABC-123',      // Opcional
      ubicacion_almacen: 'ESTANTE-A3'           // Opcional
    }
  ]
}

// 2. Backend crea compra
Compra.create({ fecha, proveedor, total });

// 3. Backend crea detalle_compra (HISTÓRICO)
DetalleCompra.create({
  idcompra: 123,
  idproducto: 5,
  cantidad: 100,           // ✅ Permanece en 100 siempre
  precio: 1000,
  fecha_vencimiento: '2026-06-01'
});

// 4. Backend crea lote_producto (INVENTARIO)
LoteProducto.create({
  idproducto: 5,
  iddetalle_compra: 456,
  numero_lote: 'PROV-LOT-2025-001',
  cantidad_inicial: 100,   // ✅ Inmutable
  stock_actual: 100,       // ✅ Cambiará con ventas
  fecha_vencimiento: '2026-06-01',
  precio_compra: 1000,
  ubicacion_almacen: 'ESTANTE-A3',
  estado: 'disponible'
});
```

---

### **VENTA → Descontar de Lote**

```javascript
// 1. Frontend solicita lotes disponibles
GET /lotes/disponibles/:idproducto

// Retorna:
[
  {
    idlote: 10,
    numero_lote: 'PROV-LOT-2025-001',
    stock_actual: 100,
    fecha_vencimiento: '2026-06-01',
    dias_hasta_vencimiento: 365,
    ubicacion_almacen: 'ESTANTE-A3'
  }
]

// 2. Usuario selecciona lote y crea venta
POST /ventas/create
{
  venta: { fecha, cliente, total },
  detalles: [
    {
      idproducto: 5,
      idlote: 10,              // ✅ Referencia al lote
      cantidad: 20,
      precio_venta: 1500
    }
  ]
}

// 3. Backend descuenta del lote
LoteProducto.restarStock(10, 20);
// stock_actual: 100 → 80
// estado: 'disponible' → 'parcial'

// 4. Backend crea detalle_venta
DetalleVenta.create({
  idventa: 789,
  idproducto: 5,
  idlote: 10,              // ✅ Trazabilidad
  cantidad: 20,
  precio_venta: 1500
});
```

---

## 📐 Beneficios de la Nueva Arquitectura

### **1. Trazabilidad Completa**

```sql
-- ¿De qué compra vino este lote?
SELECT c.*, dc.*
FROM lotes_producto l
JOIN detalle_compra dc ON l.iddetalle_compra = dc.iddetalle
JOIN compras c ON dc.idcompra = c.idcompra
WHERE l.idlote = 10;

-- ¿Cuánto compré originalmente?
SELECT cantidad FROM detalle_compra WHERE iddetalle = 456;
-- Resultado: 100 (NUNCA cambia)

-- ¿Cuánto queda ahora?
SELECT stock_actual FROM lotes_producto WHERE idlote = 10;
-- Resultado: 80 (cambia con ventas)

-- ¿Qué ventas usaron este lote?
SELECT v.*, dv.*
FROM detalle_venta dv
JOIN ventas v ON dv.idventa = v.idventa
WHERE dv.idlote = 10;
```

### **2. FIFO Correcto**

```sql
-- Obtener lotes en orden FIFO (por vencimiento)
SELECT *
FROM lotes_producto
WHERE idproducto = 5
  AND stock_actual > 0
  AND estado IN ('disponible', 'parcial')
  AND (fecha_vencimiento IS NULL OR fecha_vencimiento >= CURDATE())
ORDER BY fecha_vencimiento ASC;
```

### **3. Múltiples Lotes del Mismo Producto**

```sql
-- Ejemplo: 3 lotes de Aspirina con diferentes vencimientos
lotes_producto:
- idlote: 10, numero_lote: 'LOT-A', vencimiento: '2026-06-01', stock: 80
- idlote: 11, numero_lote: 'LOT-B', vencimiento: '2026-12-15', stock: 150
- idlote: 12, numero_lote: 'LOT-C', vencimiento: '2027-03-20', stock: 200

-- Total stock del producto:
SELECT SUM(stock_actual) as stock_total
FROM lotes_producto
WHERE idproducto = 5 AND estado IN ('disponible', 'parcial');
-- Resultado: 430
```

### **4. Alertas de Vencimiento**

```sql
-- Lotes que vencen en 30 días
SELECT
  l.numero_lote,
  p.nombre_producto,
  l.stock_actual,
  l.fecha_vencimiento,
  DATEDIFF(l.fecha_vencimiento, CURDATE()) as dias_restantes
FROM lotes_producto l
JOIN productos p ON l.idproducto = p.idproducto
WHERE l.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
  AND l.stock_actual > 0
ORDER BY l.fecha_vencimiento ASC;
```

---

## 🎨 Frontend: Cambios Requeridos

### **1. Formulario de Compra**

**Agregar campos:**
```tsx
<input
  type="text"
  name="numero_lote"
  placeholder="Número de lote *"
  required
/>

<input
  type="text"
  name="referencia_proveedor"
  placeholder="Referencia del proveedor (opcional)"
/>

<select name="ubicacion_almacen">
  <option value="PRINCIPAL">Principal</option>
  <option value="ESTANTE-A1">Estante A1</option>
  <option value="ESTANTE-A2">Estante A2</option>
  <option value="REFRIGERADOR">Refrigerador</option>
</select>
```

**Validación:**
```javascript
if (!detalle.numero_lote || detalle.numero_lote.trim() === '') {
  alert('⚠️ El número de lote es requerido');
  return;
}
```

---

### **2. Formulario de Venta**

**Modal de Selección de Lote:**
```tsx
<ModalSeleccionarLote
  idproducto={producto.id}
  cantidadRequerida={cantidad}
  onSeleccionar={(lote) => {
    setLoteSeleccionado(lote);
  }}
/>

// Dentro del modal:
const LoteCard = ({ lote }) => (
  <div className={`lote-card ${lote.dias_hasta_vencimiento < 30 ? 'warning' : ''}`}>
    <h4>{lote.numero_lote}</h4>
    <p>Stock: {lote.stock_actual}</p>
    <p>Vence: {lote.fecha_vencimiento}</p>
    {lote.dias_hasta_vencimiento < 30 && (
      <Badge color="warning">⚠️ Vence en {lote.dias_hasta_vencimiento} días</Badge>
    )}
  </div>
);
```

---

## 🔧 Migraciones Necesarias

### **Migración de Datos Existentes**

Si ya tienes datos en `detalle_compra` con `stock_restante`, necesitas migrarlos:

```sql
-- Crear lotes a partir de detalle_compra existente
INSERT INTO lotes_producto (
  idproducto,
  iddetalle_compra,
  numero_lote,
  cantidad_inicial,
  stock_actual,
  fecha_vencimiento,
  precio_compra,
  ubicacion_almacen,
  estado
)
SELECT
  dc.idproducto,
  dc.iddetalle,
  CONCAT('MIGRADO-', dc.iddetalle) as numero_lote,  -- Temporal
  dc.cantidad as cantidad_inicial,
  dc.stock_restante as stock_actual,
  dc.fecha_vencimiento,
  dc.precio as precio_compra,
  'PRINCIPAL' as ubicacion_almacen,
  CASE
    WHEN dc.stock_restante = 0 THEN 'agotado'
    WHEN dc.fecha_vencimiento < CURDATE() THEN 'vencido'
    WHEN dc.stock_restante < dc.cantidad THEN 'parcial'
    ELSE 'disponible'
  END as estado
FROM detalle_compra dc
WHERE dc.deleted_at IS NULL;
```

**⚠️ Importante:** Después de migrar, debes actualizar manualmente los `numero_lote` con los números reales.

---

## 📋 Checklist de Implementación

### Backend
- [x] Crear tabla `lotes_producto`
- [x] Crear modelo `LoteProducto.js`
- [x] Modificar `compraController.js` para crear lotes
- [ ] Modificar `ventaController.js` para descontar de lotes
- [ ] Actualizar `detalle_venta` para incluir `idlote`
- [ ] Crear endpoints de consulta de lotes

### Frontend
- [ ] Agregar campo `numero_lote` en formulario de compra
- [ ] Agregar campos opcionales (`referencia_proveedor`, `ubicacion_almacen`)
- [ ] Crear modal de selección de lote en ventas
- [ ] Mostrar advertencias de vencimiento
- [ ] Crear pantalla de consulta de lotes
- [ ] Dashboard de lotes próximos a vencer

### Testing
- [ ] Probar creación de compra con lote
- [ ] Verificar que `numero_lote` es único
- [ ] Probar venta descontando de lote
- [ ] Verificar FIFO (primero vence, primero sale)
- [ ] Probar con múltiples lotes del mismo producto

---

## 🚀 Ejemplo Completo

```javascript
// COMPRA
const compra = {
  fecha: '2025-12-14',
  proveedor: 10,
  total: 100000,
  detalles: [
    {
      idproducto: 5,
      cantidad: 100,
      precio: 1000,
      numero_lote: 'ASPIR-2025-LOT-A',  // ✅ Requerido
      fecha_vencimiento: '2026-06-01',
      ubicacion_almacen: 'ESTANTE-A3'
    }
  ]
};

// Se crea:
// - compras (id: 123)
// - detalle_compra (id: 456, cantidad: 100)
// - lotes_producto (id: 10, stock_actual: 100)

// VENTA 1
const venta1 = {
  fecha: '2025-12-15',
  cliente: 20,
  total: 30000,
  detalles: [
    {
      idproducto: 5,
      idlote: 10,  // ✅ Referencia al lote
      cantidad: 20,
      precio_venta: 1500
    }
  ]
};

// Resultado:
// - lotes_producto (id: 10, stock_actual: 80, estado: 'parcial')
// - detalle_venta (idlote: 10, cantidad: 20)

// CONSULTA
// ¿Cuánto compré?
SELECT cantidad FROM detalle_compra WHERE iddetalle = 456;
// → 100 ✅

// ¿Cuánto queda?
SELECT stock_actual FROM lotes_producto WHERE idlote = 10;
// → 80 ✅
```

---

**Documentado por:** Claude Sonnet 4.5
**Fecha:** 2025-12-14
**Versión:** 1.0
