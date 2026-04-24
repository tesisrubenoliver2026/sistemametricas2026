import DetalleCuotasVenta from '../../../models/Venta/DetalleCuotasVenta.js';

/**
 * Genera un plan de cuotas usando el Sistema Francés
 * Las cuotas son FIJAS (mismo monto total cada mes)
 * La composición de capital e interés varía: al inicio más interés, al final más capital
 *
 * @param {Object} params - Parámetros del plan de cuotas
 * @param {number} params.iddeuda - ID de la deuda
 * @param {number} params.idventa - ID de la venta
 * @param {number} params.idcliente - ID del cliente
 * @param {number} params.monto_financiar - Monto total a financiar
 * @param {number} params.cant_cuota - Cantidad de cuotas
 * @param {number} params.tasa_interes_anual - Tasa de interés anual (TEA) en porcentaje (ej: 36 para 36%)
 * @param {number} params.dia_fecha_pago - Día del mes para vencimiento (1-31)
 * @param {Date} params.fecha_inicio - Fecha de inicio del plan (opcional, default: hoy)
 * @param {Function} callback - Callback (err, cuotas)
 */
const generarPlanCuotasFrances = (params, callback) => {
  try {
    const {
      iddeuda,
      idventa,
      idcliente,
      monto_financiar,
      cant_cuota,
      tasa_interes_anual,
      dia_fecha_pago,
      fecha_inicio
    } = params;

    // Validaciones
    if (!iddeuda || !idventa || !idcliente) {
      return callback(new Error('Faltan datos requeridos: iddeuda, idventa, idcliente'));
    }

    if (!monto_financiar || monto_financiar <= 0) {
      return callback(new Error('El monto a financiar debe ser mayor a 0'));
    }

    if (!cant_cuota || cant_cuota <= 0) {
      return callback(new Error('La cantidad de cuotas debe ser mayor a 0'));
    }

    if (tasa_interes_anual === undefined || tasa_interes_anual === null || tasa_interes_anual < 0) {
      return callback(new Error('La tasa de interés anual debe ser mayor o igual a 0'));
    }

    if (!dia_fecha_pago || dia_fecha_pago < 1 || dia_fecha_pago > 31) {
      return callback(new Error('El día de pago debe estar entre 1 y 31'));
    }

    // Convertir TEA (Tasa Efectiva Anual) a TEM (Tasa Efectiva Mensual)
    // Fórmula: TEM = (1 + TEA)^(1/12) - 1
    const TEA_decimal = tasa_interes_anual / 100; // 36% -> 0.36
    const TEM_decimal = Math.pow(1 + TEA_decimal, 1/12) - 1;
    const TEM_porcentaje = TEM_decimal * 100;

    // Calcular cuota fija mensual usando fórmula del Sistema Francés
    // Fórmula: C = P * [i * (1 + i)^n] / [(1 + i)^n - 1]
    // Donde:
    // C = Cuota fija
    // P = Principal (monto a financiar)
    // i = Tasa de interés mensual (TEM en decimal)
    // n = Número de cuotas
    let cuota_fija;

    if (TEM_decimal === 0) {
      // Sin intereses, cuota = monto / cantidad
      cuota_fija = monto_financiar / cant_cuota;
    } else {
      const factor = Math.pow(1 + TEM_decimal, cant_cuota);
      cuota_fija = monto_financiar * (TEM_decimal * factor) / (factor - 1);
    }

    // Redondear cuota a 2 decimales
    cuota_fija = Math.round(cuota_fija * 100) / 100;

    // Generar el plan de cuotas
    const cuotas = [];
    let saldo_capital = monto_financiar;
    const fecha_base = fecha_inicio ? new Date(fecha_inicio) : new Date();

    for (let i = 1; i <= cant_cuota; i++) {
      // Calcular interés sobre el saldo pendiente
      const interes = saldo_capital * TEM_decimal;
      const interes_redondeado = Math.round(interes * 100) / 100;

      // Capital amortizado = Cuota - Interés
      let capital = cuota_fija - interes_redondeado;

      // En la última cuota, ajustar para que cierre exacto
      if (i === cant_cuota) {
        capital = saldo_capital;
        cuota_fija = capital + interes_redondeado;
      }

      const capital_redondeado = Math.round(capital * 100) / 100;

      // Calcular fecha de vencimiento
      const fecha_vencimiento = new Date(fecha_base);
      fecha_vencimiento.setMonth(fecha_vencimiento.getMonth() + i);
      fecha_vencimiento.setDate(dia_fecha_pago);

      // Ajustar si el día no existe en ese mes (ej: 31 de febrero -> 28/29 de febrero)
      if (fecha_vencimiento.getDate() !== dia_fecha_pago) {
        fecha_vencimiento.setDate(0); // Último día del mes anterior
      }

      // Actualizar saldo de capital
      saldo_capital -= capital_redondeado;
      saldo_capital = Math.max(0, Math.round(saldo_capital * 100) / 100); // Evitar negativos por redondeo

      // Crear objeto de cuota
      const monto_cuota_redondeado = Math.round(cuota_fija * 100) / 100;

      const cuota = {
        iddeuda,
        idventa,
        idcliente,
        numero_cuota: i,
        fecha_vencimiento: fecha_vencimiento.toISOString().split('T')[0],
        monto_cuota_total: monto_cuota_redondeado,
        monto_capital: capital_redondeado,
        monto_interes_normal: interes_redondeado,
        // Los saldos representan lo que queda por pagar de ESTA cuota específica
        saldo_capital: capital_redondeado, // Al inicio, todo el capital está pendiente
        saldo_interes: interes_redondeado, // Al inicio, todo el interés está pendiente
        saldo_punitorio: 0, // Al inicio, no hay mora
        saldo_total: monto_cuota_redondeado, // Al inicio, toda la cuota está pendiente
        estado: 'pendiente'
      };

      cuotas.push(cuota);
    }

    // Insertar cuotas en la base de datos
    DetalleCuotasVenta.createBulk(cuotas, (err, result) => {
      if (err) {
        return callback(err);
      }

      // Retornar las cuotas creadas con metadata
      callback(null, {
        cuotas,
        metadata: {
          monto_financiar,
          cant_cuota,
          tasa_interes_anual,
          tasa_interes_mensual: TEM_porcentaje,
          cuota_fija,
          total_a_pagar: cuotas.reduce((sum, c) => sum + c.monto_cuota_total, 0),
          total_intereses: cuotas.reduce((sum, c) => sum + c.monto_interes_normal, 0),
          dia_pago: dia_fecha_pago,
          primera_cuota: cuotas[0].fecha_vencimiento,
          ultima_cuota: cuotas[cant_cuota - 1].fecha_vencimiento
        }
      });
    });

  } catch (error) {
    callback(error);
  }
};

/**
 * Recalcula el plan de cuotas cuando cambian parámetros
 * (Útil para refinanciamiento o modificación de términos)
 *
 * @param {number} iddeuda - ID de la deuda
 * @param {Object} nuevos_params - Nuevos parámetros del plan
 * @param {Function} callback - Callback (err, result)
 */
const recalcularPlanCuotas = (iddeuda, nuevos_params, callback) => {
  // Eliminar plan anterior (soft delete)
  DetalleCuotasVenta.softDeleteByDeuda(iddeuda, (err) => {
    if (err) {
      return callback(err);
    }

    // Generar nuevo plan
    const params = {
      iddeuda,
      ...nuevos_params
    };

    generarPlanCuotasFrances(params, callback);
  });
};

/**
 * Simula un plan de cuotas sin guardar en la base de datos
 * (Útil para mostrar al cliente antes de confirmar)
 *
 * @param {Object} params - Parámetros del plan de cuotas
 * @param {Function} callback - Callback (err, simulacion)
 */
const simularPlanCuotas = (params, callback) => {
  try {
    const {
      monto_financiar,
      cant_cuota,
      tasa_interes_anual,
      dia_fecha_pago,
      fecha_inicio
    } = params;

    // Validaciones
    if (!monto_financiar || monto_financiar <= 0) {
      return callback(new Error('El monto a financiar debe ser mayor a 0'));
    }

    if (!cant_cuota || cant_cuota <= 0) {
      return callback(new Error('La cantidad de cuotas debe ser mayor a 0'));
    }

    if (tasa_interes_anual < 0) {
      return callback(new Error('La tasa de interés anual no puede ser negativa'));
    }

    const dia_pago = dia_fecha_pago || 1;

    // Convertir TEA a TEM
    const TEA_decimal = tasa_interes_anual / 100;
    const TEM_decimal = Math.pow(1 + TEA_decimal, 1/12) - 1;
    const TEM_porcentaje = TEM_decimal * 100;

    // Calcular cuota fija
    let cuota_fija;
    if (TEM_decimal === 0) {
      cuota_fija = monto_financiar / cant_cuota;
    } else {
      const factor = Math.pow(1 + TEM_decimal, cant_cuota);
      cuota_fija = monto_financiar * (TEM_decimal * factor) / (factor - 1);
    }
    cuota_fija = Math.round(cuota_fija * 100) / 100;

    // Generar simulación de cuotas
    const cuotas = [];
    let saldo_capital = monto_financiar;
    const fecha_base = fecha_inicio ? new Date(fecha_inicio) : new Date();

    for (let i = 1; i <= cant_cuota; i++) {
      const interes = Math.round(saldo_capital * TEM_decimal * 100) / 100;
      let capital = cuota_fija - interes;

      if (i === cant_cuota) {
        capital = saldo_capital;
        cuota_fija = capital + interes;
      }

      const fecha_vencimiento = new Date(fecha_base);
      fecha_vencimiento.setMonth(fecha_vencimiento.getMonth() + i);
      fecha_vencimiento.setDate(dia_pago);

      if (fecha_vencimiento.getDate() !== dia_pago) {
        fecha_vencimiento.setDate(0);
      }

      saldo_capital -= capital;
      saldo_capital = Math.max(0, Math.round(saldo_capital * 100) / 100);

      cuotas.push({
        numero_cuota: i,
        fecha_vencimiento: fecha_vencimiento.toISOString().split('T')[0],
        monto_cuota_total: Math.round(cuota_fija * 100) / 100,
        monto_capital: Math.round(capital * 100) / 100,
        monto_interes: interes,
        saldo_pendiente: saldo_capital
      });
    }

    callback(null, {
      cuotas,
      resumen: {
        monto_financiar,
        cant_cuota,
        tasa_interes_anual,
        tasa_interes_mensual: TEM_porcentaje,
        cuota_fija: Math.round(cuota_fija * 100) / 100,
        total_a_pagar: cuotas.reduce((sum, c) => sum + c.monto_cuota_total, 0),
        total_intereses: cuotas.reduce((sum, c) => sum + c.monto_interes, 0),
        ahorro_vs_sin_interes: cuotas.reduce((sum, c) => sum + c.monto_interes, 0)
      }
    });

  } catch (error) {
    callback(error);
  }
};

export { generarPlanCuotasFrances, recalcularPlanCuotas, simularPlanCuotas };
export default generarPlanCuotasFrances;
