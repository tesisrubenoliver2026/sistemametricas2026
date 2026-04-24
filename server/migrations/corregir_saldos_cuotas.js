import db from '../db.js';

/**
 * Script de migración para corregir saldos incorrectos en detalle_cuotas_venta
 *
 * Problema: Los saldos se estaban guardando como "saldo restante del préstamo"
 * cuando deberían ser "saldo pendiente de esta cuota específica"
 */

const corregirSaldosCuotas = () => {
  console.log('🔧 Iniciando corrección de saldos de cuotas...');

  // Query para actualizar todas las cuotas pendientes que no han sido pagadas
  const query = `
    UPDATE detalle_cuotas_venta
    SET
      saldo_capital = monto_capital - IFNULL(monto_pagado_capital, 0),
      saldo_interes = monto_interes_normal - IFNULL(monto_pagado_interes, 0),
      saldo_punitorio = IFNULL(interes_punitorio_generado, 0) - IFNULL(monto_pagado_punitorio, 0),
      saldo_total =
        (monto_capital - IFNULL(monto_pagado_capital, 0)) +
        (monto_interes_normal - IFNULL(monto_pagado_interes, 0)) +
        (IFNULL(interes_punitorio_generado, 0) - IFNULL(monto_pagado_punitorio, 0))
    WHERE deleted_at IS NULL
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('❌ Error al corregir saldos:', err);
      process.exit(1);
    }

    console.log(`✅ Saldos corregidos exitosamente`);
    console.log(`📊 Cuotas actualizadas: ${result.affectedRows}`);
    console.log(`ℹ️  Información: ${result.info}`);

    // Mostrar algunas cuotas de ejemplo después de la corrección
    const verifyQuery = `
      SELECT
        iddetalle_cuota,
        numero_cuota,
        monto_cuota_total,
        monto_capital,
        monto_interes_normal,
        monto_pagado_capital,
        monto_pagado_interes,
        saldo_capital,
        saldo_interes,
        saldo_total,
        estado
      FROM detalle_cuotas_venta
      WHERE deleted_at IS NULL
      LIMIT 5
    `;

    db.query(verifyQuery, (errVerify, rows) => {
      if (errVerify) {
        console.error('❌ Error al verificar resultados:', errVerify);
        process.exit(1);
      }

      console.log('\n📋 Muestra de cuotas corregidas:');
      console.table(rows);

      db.end();
      console.log('\n✅ Migración completada exitosamente');
    });
  });
};

// Ejecutar migración
corregirSaldosCuotas();
