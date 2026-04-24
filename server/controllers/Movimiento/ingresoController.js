import Ingreso from "../../models/Movimiento/Ingreso.js";
import Egreso from "../../models/Movimiento/Egreso.js";
import MovimientoCaja from '../../models/MovimientoCaja.js';
import Facturador from '../../models/facturadorModel.js';
import { format } from "date-fns-tz";
import { generarReporteIngresos, generarReporteResumen } from "../../report/reportIngreso.js";
import { getUserId } from '../../utils/getUserId.js';
import Funcionario from '../../models/Funcionario.js';

const TZ = "America/Asuncion";
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const registrarIngreso = (req, res) => {
  const { fecha, hora, monto, concepto, idtipo_ingreso, observacion, creado_por } = req.body;

  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  if (!monto || !idtipo_ingreso || !fecha) {
    return res.status(400).json({ error: 'Campos obligatorios faltantes' });
  }

  const procesarIngreso = (idsusuarios, idfuncionariosIds) => {
    MovimientoCaja.getMovimientoAbierto(idusuarios, idfuncionariosIds, (errMov, movimientoResult) => {
      if (errMov) return res.status(500).json({ error: '❌ Error al buscar movimiento de caja' });
      if (!movimientoResult.length) return res.status(400).json({ error: '⚠️ No hay movimiento abierto' });

      const idmovimiento = movimientoResult[0].idmovimiento;

      const ingresoData = {
        fecha,
        hora,
        monto,
        concepto,
        idtipo_ingreso,
        observacion,
        idmovimiento,
        creado_por:  idusuarios,
        idfuncionario: idfuncionario,
      };

      Ingreso.create(ingresoData, (err, result) => {
        if (err) return res.status(500).json({ error: '❌ Error al registrar ingreso', err });
        res.status(200).json({ message: '✅ Ingreso registrado correctamente' });
      });
    });
  };

  if (tipo === 'funcionario') {
    procesarIngreso(null, idfuncionario);
  } else {
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: '❌ Error al buscar funcionarios' });
      const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');
      procesarIngreso(idusuarios, funcionariosIds);
    });
  }
};


export const listarIngresos = (req, res) => {
  Ingreso.getAll((err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener ingresos' });
    res.json(results);
  });
};

export const listarIngresosPorMovimiento = (req, res) => {
  const { idmovimiento } = req.params;
  if (!idmovimiento) return res.status(400).json({ error: "Falta idmovimiento" });

  MovimientoCaja.getById(idmovimiento, (errMov, mov) => {
    if (errMov) return res.status(500).json({ error: errMov });
    if (!mov) return res.status(404).json({ error: "Movimiento no encontrado" });
    Ingreso.findByMovimiento(idmovimiento, (errIng, ingresos) => {
      if (errIng) return res.status(500).json({ error: errIng });

      const totalMovimiento = ingresos.reduce(
        (acc, r) => acc + parseFloat(r.monto), 0
      ).toFixed(2);

      Facturador.findActivo((errFact, factRows) => {
        if (errFact) return res.status(500).json({ error: 'Error obteniendo empresa' });

        const fact = factRows?.[0] || {};

        const empresa = factRows?.length ? {
          nombre_fantasia: fact.nombre_fantasia,
          ruc: fact.ruc,
          timbrado_nro: fact.timbrado_nro,
          fecha_inicio_vigente: formatDate(fact.fecha_inicio_vigente),
          fecha_fin_vigente: formatDate(fact.fecha_fin_vigente)
        } : null;

        const datosComprobante = {
          empresa,
          movimiento: {
            idmovimiento: mov.idmovimiento,
            num_caja: mov.num_caja,
            fecha_apertura: formatDate(mov.fecha_apertura),
            fecha_cierre: formatDate(mov.fecha_cierre),
            estado: mov.estado
          },
          totalMovimiento,
          ingresos
        };

        generarReporteIngresos(datosComprobante)
          .then((comprobanteBase64) => {
            res.status(200).json({
              message: '✅ Pago de deuda registrado correctamente.',
              comprobanteBase64,
              ...datosComprobante
            });
          })
          .catch((error) => {
            console.error('❌ Error al generar el comprobante de pago:', error);
            res.status(500).json({
              error: '❌ Pago realizado, pero ocurrió un error al generar el comprobante.'
            });
          });

      });
    });
  });
};

export const listarIngresoyEgresoPorMovimiento = (req, res) => {
  const { idmovimiento } = req.params;
  if (!idmovimiento) return res.status(400).json({ error: "Falta idmovimiento" });

  MovimientoCaja.getById(idmovimiento, (errMov, mov) => {
    if (errMov) return res.status(500).json({ error: errMov });
    if (!mov) return res.status(404).json({ error: "Movimiento no encontrado" });

    // 1️⃣  Traer ingresos
    Ingreso.findByMovimiento(idmovimiento, (errIng, ingresos) => {
      if (errIng) return res.status(500).json({ error: errIng });

      // 2️⃣  Traer egresos (nuevo)
      Egreso.findByMovimiento(idmovimiento, (errEgr, egresos) => {
        if (errEgr) return res.status(500).json({ error: errEgr });

        // 3️⃣  Calcular totales
        const totalIngresos = ingresos.reduce((a, r) => a + parseFloat(r.monto), 0);
        const totalEgresos = egresos.reduce((a, r) => a + parseFloat(r.monto), 0);
        const totalMovimiento = (totalIngresos - totalEgresos).toFixed(2);

        // 4️⃣  Empresa (igual que antes)
        Facturador.findActivo((errFact, factRows) => {
          if (errFact) return res.status(500).json({ error: 'Error obteniendo empresa' });

          const fact = factRows?.[0] || {};
        
          const empresa = factRows?.length ? {
            nombre_fantasia: fact.nombre_fantasia,
            ruc: fact.ruc,
            timbrado_nro: fact.timbrado_nro,
            fecha_inicio_vigente: formatDate(fact.fecha_inicio_vigente),
            fecha_fin_vigente: formatDate(fact.fecha_fin_vigente)
          } : null;

          // 5️⃣  Objeto que se pasa al generador de PDF
          const datosComprobante = {
            empresa,
            movimiento: {
              idmovimiento: mov.idmovimiento,
              num_caja: mov.num_caja,
              fecha_apertura: formatDate(mov.fecha_apertura),
              fecha_cierre: formatDate(mov.fecha_cierre),
              estado: mov.estado
            },
            totalMovimiento,
            totalIngresos,
            totalEgresos,
            ingresos,
            egresos          // 👈  nuevo array
          };

          generarReporteResumen(datosComprobante)
            .then(comprobanteBase64 => {
              res.status(200).json({
                message: '✅ Resumen de movimiento generado correctamente.',
                comprobanteBase64,
                ...datosComprobante
              });
            })
            .catch(error => {
              console.error('❌ Error al generar el comprobante:', error);
              res.status(500).json({
                error: '❌ Se registró el movimiento, pero falló la generación del comprobante.'
              });
            });
        });
      });
    });
  });
};

export const listarCobrosMensuales = (req, res) => {
  // Si no vienen params, tomamos mes/año actuales (zona Asunción)
  const now = new Date();
  const anio = parseInt(req.query.anio) || now.getFullYear();
  const mes = parseInt(req.query.mes) || (now.getMonth() + 1);

  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  console.log('🔍 Filtrando cobros mensuales para:', { tipo, idusuarios, idfuncionario, anio, mes });

  // Si es un funcionario, solo ve sus propios cobros
  if (tipo === 'funcionario') {
    return Ingreso.findCobrosMensualesByUser(anio, mes, null, idfuncionario, (err, datos) => {
      if (err) return res.status(500).json({ error: err });

      res.json({
        anio,
        mes,
        totalMensual: datos.totalMensual,
        detalle: datos.detalle
      });
    });
  }

  // Si es un usuario administrador, buscar sus funcionarios relacionados
  Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
    if (err) return res.status(500).json({ error: err });

    const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');

    console.log('👥 Funcionarios relacionados:', funcionariosIds || 'ninguno');

    return Ingreso.findCobrosMensualesByUser(anio, mes, idusuarios, funcionariosIds, (err, datos) => {
      if (err) return res.status(500).json({ error: err });

      console.log('📊 Total mensual de cobros:', datos.totalMensual);

      res.json({
        anio,
        mes,
        totalMensual: datos.totalMensual,
        detalle: datos.detalle
      });
    });
  });
};

export const listarCobrosDelDia = (req, res) => {
  const hoyLocal = format(new Date(), "yyyy-MM-dd", { timeZone: TZ });
  const fecha = req.query.fecha || hoyLocal;

  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  console.log('🔍 Filtrando cobros del día para:', { tipo, idusuarios, idfuncionario, fecha });

  // Si es un funcionario, solo ve sus propios cobros del día
  if (tipo === 'funcionario') {
    return Ingreso.findCobrosDelDiaByUser(fecha, null, idfuncionario, (err, data) => {
      if (err) return res.status(500).json({ error: err });

      res.json({
        fecha,
        totalDia: data.totalDia,
        detalle: data.detalle,
      });
    });
  }

  // Si es un usuario administrador, buscar sus funcionarios relacionados
  Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
    if (err) return res.status(500).json({ error: err });

    const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');

    console.log('👥 Funcionarios relacionados:', funcionariosIds || 'ninguno');

    return Ingreso.findCobrosDelDiaByUser(fecha, idusuarios, funcionariosIds, (err, data) => {
      if (err) return res.status(500).json({ error: err });

      console.log('📊 Total del día:', data.totalDia);

      res.json({
        fecha,
        totalDia: data.totalDia,
        detalle: data.detalle,
      });
    });
  });
};

export const listarCobrosMensualesPorAnio = (req, res) => {
  const anio = parseInt(req.query.anio) || new Date().getFullYear();
  Ingreso.findCobrosMensualesPorAnio(anio, (err, meses) => {
    if (err) return res.status(500).json({ error: err });

    const totalAnual = meses.reduce((sum, m) => sum + Number(m.total_cobrado), 0);

    res.json({
      anio,
      totalAnual,
      meses
    });
  });
};

export const listarIngresosPag = (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  const filtros = {
    fechaDesde: req.query.fechaDesde,   // YYYY-MM-DD
    fechaHasta: req.query.fechaHasta,   // YYYY-MM-DD
  };

  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};
  const creado_por = idusuarios;

  // Si es un funcionario, solo ve sus propios registros
  if (tipo === 'funcionario') {
    return Ingreso.countFilteredByUser(search, filtros, null, idfuncionario, (errCount, total) => {
      if (errCount) return res.status(500).json({ error: errCount });

      Ingreso.findAllPaginatedFilteredByUser(limit, offset, search, filtros, null, idfuncionario, (err, data) => {
        if (err) return res.status(500).json({ error: err });

        res.json({
          data,
          totalItems : total,
          totalPages : Math.ceil(total / limit),
          currentPage: page,
        });
      });
    });
  }

  // Si es un usuario administrador, buscar sus funcionarios relacionados
  Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
    if (err) return res.status(500).json({ error: err });

    const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');

    return Ingreso.countFilteredByUser(search, filtros, creado_por, funcionariosIds, (errCount, total) => {
      if (errCount) return res.status(500).json({ error: errCount });

      Ingreso.findAllPaginatedFilteredByUser(limit, offset, search, filtros, creado_por, funcionariosIds, (err, data) => {
        if (err) return res.status(500).json({ error: err });

        res.json({
          data,
          totalItems : total,
          totalPages : Math.ceil(total / limit),
          currentPage: page,
        });
      });
    });
  });
};

export const listarIngresosPagByUserId = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const userId = idfuncionario || idusuarios;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  
  const filtros = {
    fechaDesde: req.query.fechaDesde, // YYYY-MM-DD
    fechaHasta: req.query.fechaHasta, // YYYY-MM-DD
  };

  // Pasar userId a los métodos del modelo
  Ingreso.countFiltered(userId, search, filtros, (errCount, total) => {
    if (errCount) return res.status(500).json({ error: errCount });

    Ingreso.findAllPaginatedFiltered(userId, limit, offset, search, filtros, (err, data) => {
      if (err) return res.status(500).json({ error: err });

      res.json({
        data,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    });
  });
};

export const anularIngreso = (req, res) => {
  const { id } = req.params;

  Ingreso.checkIfIngresoRelacionado(id, (errCheck, relacionado) => {
    if (errCheck) return res.status(500).json({ error: 'Error al verificar ingreso' });

    if (relacionado === null) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }

    if (relacionado) {
      return res.status(400).json({ error: 'No se puede anular: ingreso relacionado a una venta o cobro de crédito' });
    }

    // Si no está relacionado, se puede anular (soft delete)
    Ingreso.softDelete(id, (errDelete) => {
      if (errDelete) return res.status(500).json({ error: 'Error al anular ingreso' });
      res.json({ message: '✅ Ingreso anulado correctamente' });
    });
  });
};

export const obtenerTotalIngresos = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  const procesarTotal = (creado_por, idfuncionariosIds) => {
    Ingreso.getTotalByUser(creado_por, idfuncionariosIds, (err, result) => {
      if (err) {
        console.error('Error al obtener total de ingresos:', err);
        return res.status(500).json({ error: 'Error al obtener total de ingresos' });
      }

      res.json({
        total_registros: result.total_registros,
        total_monto: parseFloat(result.total_monto),
      });
    });
  };

  if (tipo === 'funcionario') {
    procesarTotal(null, idfuncionario);
  } else {
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: 'Error al buscar funcionarios' });
      const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');
      procesarTotal(idusuarios, funcionariosIds);
    });
  }
};

