import MovimientoCaja from '../models/MovimientoCaja.js';
import libroDiarioController from './Movimiento/libroDiarioController.js';
import db from '../db.js';
import { getUserId } from '../utils/getUserId.js';
import Funcionario from '../models/Funcionario.js';
import { generateLibroCaja } from '../report/libroCaja.js';

export const getMovimientos = (req, res) => {
  MovimientoCaja.findAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

export const getMovimientoById = (req, res) => {
  MovimientoCaja.findById(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result[0]);
  });
};
//getMovimientosPaginated

export const getMovimientosPaginated = (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  /* ➜ Filtros de fecha */
  const filtrosFecha = {
    aperturaDesde: req.query.aperturaDesde,
    aperturaHasta: req.query.aperturaHasta,
    cierreDesde:   req.query.cierreDesde,
    cierreHasta:   req.query.cierreHasta,
  };

  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};
  console.log(idusuarios, idfuncionario, tipo);
  // Si es un funcionario, solo ve sus propios movimientos
  if (tipo === 'funcionario') {
    return MovimientoCaja.countFilteredByUser(search, filtrosFecha, null, idfuncionario, (err, total) => {
      if (err) return res.status(500).json({ error: err });

      MovimientoCaja.findAllPaginatedFilteredByUser(
        limit,
        offset,
        search,
        filtrosFecha,
        null,
        idfuncionario,
        (err, data) => {
          if (err) return res.status(500).json({ error: err });

          const totalPages = Math.ceil(total / limit);
          res.json({
            data,
            totalItems: total,
            totalPages,
            currentPage: page,
          });
        }
      );
    });
  }

  // Si es un usuario administrador, buscar sus funcionarios relacionados
  Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
    if (err) return res.status(500).json({ error: err });

    // Si no tiene funcionarios relacionados, solo buscar por idusuarios
    const funcionariosIds = funcionarios.length > 0
      ? funcionarios.map(f => f.idfuncionario).join(',')
      : null;

    MovimientoCaja.countFilteredByUser(search, filtrosFecha, idusuarios, funcionariosIds, (err, total) => {
      if (err) return res.status(500).json({ error: err });

      MovimientoCaja.findAllPaginatedFilteredByUser(
        limit,
        offset,
        search,
        filtrosFecha,
        idusuarios,
        funcionariosIds,
        (err, data) => {
          if (err) return res.status(500).json({ error: err });

          const totalPages = Math.ceil(total / limit);
          res.json({
            data,
            totalItems: total,
            totalPages,
            currentPage: page,
          });
        }
      );
    });
  });
};

export const hayCajaAbierta = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  const verificarCaja = (idsusuarios, idfuncionariosIds) => {
    MovimientoCaja.getMovimientoAbierto(idusuarios, idfuncionariosIds, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });

      if (result.length > 0) {
        // ✅ Hay al menos una caja abierta
        return res.json({ abierta: true, movimiento: result[0] });
      } else {
        // ❌ No hay caja abierta
        return res.json({ abierta: false });
      }
    });
  };

  if (tipo === 'funcionario') {
    verificarCaja(null, idfuncionario);
  } else {
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: err });
      // Si no tiene funcionarios relacionados, pasar null
      const funcionariosIds = funcionarios.length > 0
        ? funcionarios.map(f => f.idfuncionario).join(',')
        : null;
      verificarCaja(idusuarios, funcionariosIds);
    });
  }
};



export const crearMovimiento = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  // Construir datos del movimiento con el usuario/funcionario correcto
  const movimientoData = {
    ...req.body,
    idusuarios: tipo === 'funcionario' ? null : idusuarios,
    idfuncionario: tipo === 'funcionario' ? idfuncionario : null
  };

  MovimientoCaja.create(movimientoData, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: 'Movimiento de caja abierto', id: result.insertId });
  });
};

export const cerrarMovimiento = (req, res) => {
  MovimientoCaja.cerrarCaja(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Movimiento de caja cerrado correctamente' });
  });
};

export const cerrarCaja = (req, res) => {
  const idmovimiento = req.params.id;

  MovimientoCaja.getEstadoById(idmovimiento, (errEstado, estadoResult) => {
    if (errEstado) return res.status(500).json({ error: 'Error al consultar el estado de la caja' });
    if (!estadoResult.length || estadoResult[0].estado !== 'abierto') {
      return res.status(400).json({ error: 'No hay una caja abierta con ese ID' });
    }

    // 🟡 Consultamos el movimiento para obtener monto_apertura
    MovimientoCaja.findById(idmovimiento, (errMov, movResult) => {
      if (errMov || !movResult.length) {
        return res.status(500).json({ error: 'No se pudo obtener el movimiento' });
      }

      const monto_apertura = parseFloat(movResult[0].monto_apertura || 0);

      // 🔄 Continuamos con las demás consultas
      const queryIngresos = `SELECT SUM(monto) AS total FROM ingresos WHERE idmovimiento = ? AND deleted_at IS NULL`;
      const queryEgresos = `SELECT SUM(monto) AS total FROM egresos WHERE idmovimiento = ? AND deleted_at IS NULL`;
      const queryContado = `SELECT SUM(monto) AS total FROM ingresos WHERE idmovimiento = ? AND concepto LIKE '%venta contado%' AND deleted_at IS NULL`;
      const queryCobrado = `SELECT SUM(monto) AS total FROM ingresos WHERE idmovimiento = ? AND concepto LIKE '%cobro de deuda%' AND deleted_at IS NULL`;
      const queryCompras = `SELECT SUM(monto) AS total FROM egresos WHERE idmovimiento = ? AND concepto LIKE '%compra%' AND deleted_at IS NULL`;
      const queryGastos = `SELECT SUM(monto) AS total FROM egresos WHERE idmovimiento = ? AND concepto LIKE '%ajuste%' AND deleted_at IS NULL`;
      const queryCredito = `SELECT SUM(total) AS total FROM ventas WHERE idmovimiento = ? AND tipo = 'credito' AND deleted_at IS NULL`;

      db.query(queryIngresos, [idmovimiento], (err1, res1) => {
        if (err1) return res.status(500).json({ error: 'Error al calcular ingresos' });
        db.query(queryEgresos, [idmovimiento], (err2, res2) => {
          if (err2) return res.status(500).json({ error: 'Error al calcular egresos' });
          db.query(queryContado, [idmovimiento], (err3, res3) => {
            if (err3) return res.status(500).json({ error: 'Error al calcular ventas contado' });
            db.query(queryCobrado, [idmovimiento], (err4, res4) => {
              if (err4) return res.status(500).json({ error: 'Error al calcular cobros de deuda' });
              db.query(queryCompras, [idmovimiento], (err5, res5) => {
                if (err5) return res.status(500).json({ error: 'Error al calcular compras' });
                db.query(queryGastos, [idmovimiento], (err6, res6) => {
                  if (err6) return res.status(500).json({ error: 'Error al calcular gastos' });
                  db.query(queryCredito, [idmovimiento], (err7, res7) => {
                    if (err7) return res.status(500).json({ error: 'Error al calcular créditos' });

                    const ingresos = parseFloat(res1[0].total || 0);
                    const egresos = parseFloat(res2[0].total || 0);
                    const contado = parseFloat(res3[0].total || 0);
                    const cobrado = parseFloat(res4[0].total || 0);
                    const compras = parseFloat(res5[0].total || 0);
                    const gastos = parseFloat(res6[0].total || 0);
                    const credito = parseFloat(res7[0].total || 0);

                    const monto_cierre = monto_apertura + ingresos + contado + cobrado - egresos;

                    const cierreData = {
                      fecha_cierre: new Date(),
                      monto_cierre,
                      credito,
                      gastos,
                      cobrado,
                      contado,
                      ingresos,
                      compras,
                      estado: 'cerrado'
                    };

                    MovimientoCaja.cerrarCaja(idmovimiento, cierreData, (errCierre) => {
                      if (errCierre) return res.status(500).json({ error: 'Error al cerrar la caja' });
                      res.status(200).json({
                        message: '✅ Caja cerrada correctamente',
                        resumen: {
                          ...cierreData,
                          monto_apertura
                        }
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

/**
 * 📚 Generar Libro de Caja
 * GET /api/movimiento-caja/libro-caja/pdf?fecha_inicio=2025-01-01&fecha_fin=2025-12-31
 */
export const generateLibroCajaPDF = async (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);

  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({ error: '❌ Usuario no autenticado' });
  }

  // Obtener fechas del query params o usar año actual
  const currentYear = new Date().getFullYear();
  const fechaInicio = req.query.fecha_inicio || `${currentYear}-01-01`;
  const fechaFin = req.query.fecha_fin || `${currentYear}-12-31`;

  console.log(`📚 Generando Libro de Caja - Usuario: ${idusuarios || idfuncionario}, Período: ${fechaInicio} a ${fechaFin}`);

  // Query para obtener datos de empresa
  const queryEmpresa = `
    SELECT
      f.nombre_fantasia, f.ruc, f.direccion, f.ciudad
    FROM facturadores f
    WHERE f.idusuarios = ? AND f.culminado = 0
    LIMIT 1
  `;

  db.query(queryEmpresa, [idusuarios], (errEmpresa, empresa) => {
    if (errEmpresa) {
      console.error('❌ Error al obtener datos de empresa:', errEmpresa);
      return res.status(500).json({ error: '❌ Error al obtener datos de empresa' });
    }

    if (!empresa || empresa.length === 0) {
      return res.status(404).json({ error: '⚠️ No se encontró facturador activo para este usuario' });
    }

    const empresaData = empresa[0];

    // Query para obtener movimientos de apertura de caja
    const queryApertura = `
      SELECT monto_apertura, fecha_apertura
      FROM movimiento_caja
      WHERE idusuarios = ?
        AND DATE(fecha_apertura) >= ?
        AND DATE(fecha_apertura) <= ?
        AND estado = 'cerrado'
      ORDER BY fecha_apertura ASC
      LIMIT 1
    `;

    db.query(queryApertura, [idusuarios, fechaInicio, fechaFin], (errApertura, apertura) => {
      if (errApertura) {
        console.error('❌ Error al obtener apertura:', errApertura);
        return res.status(500).json({ error: '❌ Error al obtener apertura de caja' });
      }

      const saldoInicial = apertura && apertura.length > 0 ? parseFloat(apertura[0].monto_apertura) || 0 : 0;

      // Construir condición dinámica para usuario/funcionario
      let userCondition = '';
      const paramsIngresos = [fechaInicio, fechaFin];
      const paramsEgresos = [fechaInicio, fechaFin];

      if (idusuarios && !idfuncionario) {
        userCondition = 'AND mc.idusuarios = ?';
        paramsIngresos.push(idusuarios);
        paramsEgresos.push(idusuarios);
      } else if (idfuncionario && !idusuarios) {
        userCondition = 'AND mc.idfuncionario = ?';
        paramsIngresos.push(idfuncionario);
        paramsEgresos.push(idfuncionario);
      } else if (idusuarios && idfuncionario) {
        userCondition = 'AND (mc.idusuarios = ? OR mc.idfuncionario = ?)';
        paramsIngresos.push(idusuarios, idfuncionario);
        paramsEgresos.push(idusuarios, idfuncionario);
      }

      // Construir condición para ventas/compras
      let userConditionVentas = '';
      let userConditionCompras = '';
      const paramsVentas = [fechaInicio, fechaFin];
      const paramsCompras = [fechaInicio, fechaFin];

      if (idusuarios && !idfuncionario) {
        userConditionVentas = 'AND v.idusuarios = ?';
        userConditionCompras = 'AND c.idusuarios = ?';
        paramsVentas.push(idusuarios);
        paramsCompras.push(idusuarios);
      } else if (idfuncionario && !idusuarios) {
        userConditionVentas = 'AND v.idfuncionario = ?';
        userConditionCompras = 'AND c.idfuncionario = ?';
        paramsVentas.push(idfuncionario);
        paramsCompras.push(idfuncionario);
      } else if (idusuarios && idfuncionario) {
        userConditionVentas = 'AND (v.idusuarios = ? OR v.idfuncionario = ?)';
        userConditionCompras = 'AND (c.idusuarios = ? OR c.idfuncionario = ?)';
        paramsVentas.push(idusuarios, idfuncionario);
        paramsCompras.push(idusuarios, idfuncionario);
      }

      // Query para VENTAS CONTADO
      const queryVentasContado = `
        SELECT
          v.fecha,
          TIME_FORMAT(v.hora, '%H:%i') as hora,
          CONCAT('Venta Fact. ', COALESCE(v.nro_factura, 'S/N'), ' - ', COALESCE(c.nombre, 'Cliente')) as concepto,
          v.total as monto,
          'Venta Contado' as tipo,
          'INGRESO' as tipo_movimiento
        FROM ventas v
        LEFT JOIN clientes c ON v.idcliente = c.idcliente
        WHERE v.fecha BETWEEN ? AND ?
          AND v.deleted_at IS NULL
          AND (v.tipo = 'CONTADO' OR v.tipo = 'contado')
          ${userConditionVentas}
        ORDER BY v.fecha ASC, v.hora ASC
      `;

      // Query para COMPRAS CONTADO
      const queryComprasContado = `
        SELECT
          DATE(c.fecha) as fecha,
          TIME_FORMAT(c.fecha, '%H:%i') as hora,
          CONCAT('Compra Fact. ', COALESCE(c.nro_factura, 'S/N'), ' - ', COALESCE(p.nombre, 'Proveedor')) as concepto,
          c.total as monto,
          'Compra Contado' as tipo,
          'EGRESO' as tipo_movimiento
        FROM compras c
        LEFT JOIN proveedor p ON c.idproveedor = p.idproveedor
        WHERE DATE(c.fecha) BETWEEN ? AND ?
          AND c.deleted_at IS NULL
          AND (c.tipo = 'CONTADO' OR c.tipo = 'contado')
          ${userConditionCompras}
        ORDER BY c.fecha ASC
      `;

      // Query para ingresos MANUALES
      // Excluir ingresos automáticos de ventas (idventa IS NOT NULL)
      const queryIngresos = `
        SELECT
          i.fecha,
          TIME_FORMAT(i.hora, '%H:%i') as hora,
          i.concepto,
          i.monto,
          COALESCE(ti.descripcion, 'Ingreso') as tipo,
          'INGRESO' as tipo_movimiento
        FROM ingresos i
        INNER JOIN movimiento_caja mc ON i.idmovimiento = mc.idmovimiento
        LEFT JOIN tipo_ingreso ti ON i.idtipo_ingreso = ti.idtipo_ingreso
        WHERE i.fecha BETWEEN ? AND ?
          AND i.deleted_at IS NULL
          AND i.idventa IS NULL
          ${userCondition}
        ORDER BY i.fecha ASC, i.hora ASC
      `;

      // Query para egresos MANUALES
      const queryEgresos = `
        SELECT
          e.fecha,
          TIME_FORMAT(e.hora, '%H:%i') as hora,
          e.concepto,
          e.monto,
          COALESCE(te.descripcion, 'Egreso') as tipo,
          'EGRESO' as tipo_movimiento
        FROM egresos e
        INNER JOIN movimiento_caja mc ON e.idmovimiento = mc.idmovimiento
        LEFT JOIN tipo_egreso te ON e.idtipo_egreso = te.idtipo_egreso
        WHERE e.fecha BETWEEN ? AND ?
          AND e.deleted_at IS NULL
          ${userCondition}
        ORDER BY e.fecha ASC, e.hora ASC
      `;

      // Ejecutar todas las queries
      db.query(queryVentasContado, paramsVentas, (errVentas, ventas) => {
        if (errVentas) {
          console.error('❌ Error al obtener ventas:', errVentas);
          return res.status(500).json({ error: '❌ Error al obtener ventas' });
        }

        db.query(queryComprasContado, paramsCompras, (errCompras, compras) => {
          if (errCompras) {
            console.error('❌ Error al obtener compras:', errCompras);
            return res.status(500).json({ error: '❌ Error al obtener compras' });
          }

          db.query(queryIngresos, paramsIngresos, (errIngresos, ingresos) => {
            if (errIngresos) {
              console.error('❌ Error al obtener ingresos:', errIngresos);
              return res.status(500).json({ error: '❌ Error al obtener ingresos' });
            }

            db.query(queryEgresos, paramsEgresos, (errEgresos, egresos) => {
              if (errEgresos) {
                console.error('❌ Error al obtener egresos:', errEgresos);
                return res.status(500).json({ error: '❌ Error al obtener egresos' });
              }

              // Combinar TODOS los movimientos y ordenar por fecha/hora
              const movimientos = [...ventas, ...compras, ...ingresos, ...egresos].sort((a, b) => {
                const fechaA = new Date(`${a.fecha} ${a.hora || '00:00'}`);
                const fechaB = new Date(`${b.fecha} ${b.hora || '00:00'}`);
                return fechaA - fechaB;
              });

          // Calcular saldos acumulados
          let saldoActual = saldoInicial;
          let totalIngresos = 0;
          let totalEgresos = 0;
          let ventasContado = 0;
          let comprasContado = 0;
          let otrosMovimientos = 0;

          const movimientosFormateados = movimientos.map(mov => {
            const monto = parseFloat(mov.monto) || 0;
            const esIngreso = mov.tipo_movimiento === 'INGRESO';

            if (esIngreso) {
              saldoActual += monto;
              totalIngresos += monto;
              if (mov.tipo && mov.tipo.toLowerCase().includes('venta')) {
                ventasContado++;
              } else {
                otrosMovimientos++;
              }
            } else {
              saldoActual -= monto;
              totalEgresos += monto;
              if (mov.tipo && mov.tipo.toLowerCase().includes('compra')) {
                comprasContado++;
              } else {
                otrosMovimientos++;
              }
            }

            // Formatear fecha
            const formatFecha = (fecha) => {
              const d = new Date(fecha);
              return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            };

            return {
              fecha: formatFecha(mov.fecha),
              concepto: `${mov.concepto} ${mov.hora ? '(' + mov.hora + ')' : ''}`,
              monto: monto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
              saldo: saldoActual.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
              es_ingreso: esIngreso
            };
          });

          // Formatear fechas del período
          const formatFechaString = (fechaStr) => {
            if (!fechaStr) return 'N/A';
            const [year, month, day] = fechaStr.split('-');
            return `${day}/${month}/${year}`;
          };

          // Preparar datos para el template
          const dataReport = {
            empresa: {
              nombre_fantasia: empresaData.nombre_fantasia || 'N/A',
              ruc: empresaData.ruc || 'N/A',
              direccion: `${empresaData.direccion || 'N/A'}, ${empresaData.ciudad || ''}`.trim(),
              fecha_emision: new Date().toLocaleDateString('es-PY')
            },
            reporte: {
              fecha_inicio: formatFechaString(fechaInicio),
              fecha_fin: formatFechaString(fechaFin),
              saldo_inicial: saldoInicial.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
              saldo_final: saldoActual.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
              movimientos: movimientosFormateados,
              totales: {
                total_ingresos: totalIngresos.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                total_egresos: totalEgresos.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
              },
              estadisticas: {
                total_movimientos: movimientos.length,
                ventas_contado: ventasContado,
                compras_contado: comprasContado,
                otros_movimientos: otrosMovimientos
              }
            }
          };

          console.log(`✅ Generando PDF con ${movimientos.length} movimientos`);

          // Generar PDF
          generateLibroCaja(dataReport)
            .then(pdfBase64 => {
              res.json({
                success: true,
                message: '✅ Libro de Caja generado exitosamente',
                reportePDFBase64: pdfBase64,
                estadisticas: dataReport.reporte.estadisticas
              });
            })
            .catch(error => {
              console.error('❌ Error al generar PDF:', error);
              res.status(500).json({
                error: '❌ Error al generar el Libro de Caja PDF',
                details: error.message
              });
            });
            });
          });
        });
      });
    });
  });
};


export const getResumenCaja = (req, res) => {
  const idmovimiento = req.params.id;

  MovimientoCaja.getEstadoById(idmovimiento, (errEstado, estadoResult) => {
    if (errEstado) return res.status(500).json({ error: 'Error al consultar estado de caja' });
    if (!estadoResult.length) return res.status(404).json({ error: 'Caja no encontrada' });

    // ⬇️ Consulta adicional para obtener monto_apertura
    MovimientoCaja.findById(idmovimiento, (errMov, movResult) => {
      if (errMov || !movResult.length) return res.status(500).json({ error: 'No se pudo obtener el movimiento de caja' });

      const monto_apertura = parseFloat(movResult[0].monto_apertura || 0);

      // Consultas para totales
      const queryIngresos = `SELECT SUM(monto) AS total FROM ingresos WHERE idmovimiento = ? AND deleted_at IS NULL`;
      const queryEgresos = `SELECT SUM(monto) AS total FROM egresos WHERE idmovimiento = ? AND deleted_at IS NULL`;
      const queryContado = `SELECT SUM(monto) AS total FROM ingresos WHERE idmovimiento = ? AND concepto LIKE '%venta contado%' AND deleted_at IS NULL`;
      const queryCobrado = `SELECT SUM(monto) AS total FROM ingresos WHERE idmovimiento = ? AND concepto LIKE '%cobro de deuda%' AND deleted_at IS NULL`;
      const queryCompras = `SELECT SUM(monto) AS total FROM egresos WHERE idmovimiento = ? AND concepto LIKE '%compra%' AND deleted_at IS NULL`;
      const queryGastos = `SELECT SUM(monto) AS total FROM egresos WHERE idmovimiento = ? AND concepto LIKE '%ajuste%' AND deleted_at IS NULL`;
      const queryCredito = `SELECT SUM(v.total) AS total FROM ventas v WHERE v.tipo = 'credito' AND v.idmovimiento = ? AND v.deleted_at IS NULL`;

      db.query(queryIngresos, [idmovimiento], (err1, res1) => {
        if (err1) return res.status(500).json({ error: 'Error al calcular ingresos' });
        db.query(queryEgresos, [idmovimiento], (err2, res2) => {
          if (err2) return res.status(500).json({ error: 'Error al calcular egresos' });
          db.query(queryContado, [idmovimiento], (err3, res3) => {
            if (err3) return res.status(500).json({ error: 'Error al calcular contado' });
            db.query(queryCobrado, [idmovimiento], (err4, res4) => {
              if (err4) return res.status(500).json({ error: 'Error al calcular cobrado' });
              db.query(queryCompras, [idmovimiento], (err5, res5) => {
                if (err5) return res.status(500).json({ error: 'Error al calcular compras' });
                db.query(queryGastos, [idmovimiento], (err6, res6) => {
                  if (err6) return res.status(500).json({ error: 'Error al calcular gastos' });
                  db.query(queryCredito, [idmovimiento], (err7, res7) => {
                    if (err7) return res.status(500).json({ error: 'Error al calcular ventas a crédito' });

                    const ingresos = parseFloat(res1[0].total || 0);
                    const egresos = parseFloat(res2[0].total || 0);
                    const contado = parseFloat(res3[0].total || 0);
                    const cobrado = parseFloat(res4[0].total || 0);
                    const compras = parseFloat(res5[0].total || 0);
                    const gastos = parseFloat(res6[0].total || 0);
                    const credito = parseFloat(res7[0].total || 0);

                    const monto_cierre = monto_apertura + (ingresos - egresos);

                    res.json({
                      ingresos,
                      egresos,
                      contado,
                      cobrado,
                      compras,
                      gastos,
                      credito,
                      monto_cierre,
                      monto_apertura,
                      estado: estadoResult[0].estado
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};