// src/controllers/ventaController.js
import Venta from '../../models/Venta/Ventas.js';
import DetalleVenta from '../../models/Venta/DetalleVenta.js';
import DetalleCompra from '../../models/Compra/DetalleCompra.js';
import Producto from '../../models/Producto/Producto.js';
import Ingreso from '../../models/Movimiento/Ingreso.js';
import DeudaVenta from '../../models/Venta/DeudaVenta.js';
import { createVenta } from './CrearVenta.js';
import Cliente from '../../models/Cliente.js';
import { ToWords } from 'to-words';
import DatosTransferenciaVenta from '../../models/DatosBancarios/DatosTransferenciaVenta.js';
import DetalleChequeVenta from '../../models/Venta/DetalleChequeVenta.js';
import DetalleTarjetaVenta from '../../models/Venta/DetalleTarjetaVenta.js';
import Facturador from '../../models/facturadorModel.js';
import { generarFacturaEmbebida } from '../../report/reportFactura.js';
import { generateReportListVenta } from '../../report/reportListVenta.js';
import { generateLibroVentas } from '../../report/libroVentas.js';
import { getUserId } from '../../utils/getUserId.js';
import Funcionario from '../../models/Funcionario.js';
import db from '../../db.js';
export { createVenta };

export const getVentasCajero = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const fecha_inicio = req.query.fecha_inicio || null;
  const fecha_fin = req.query.fecha_fin || null;

  const { idusuarios, idfuncionario } = getUserId(req);

  Venta.countFilteredByCajero(search, idusuarios, idfuncionario, fecha_inicio, fecha_fin, (err, total) => {
    if (err) return res.status(500).json({ error: err });

    Venta.findAllPaginatedFilteredByCajero(limit, offset, search, idusuarios, idfuncionario, fecha_inicio, fecha_fin, (err, ventas) => {
      if (err) return res.status(500).json({ error: err });
      
      const ids = ventas.map((c) => c.idventa);
      if (ids.length === 0) {
        return res.json({ data: [], totalItems: 0, totalPages: 0, currentPage: page });
      }
      
      DetalleVenta.findByVentaMultiple(ids, (err, detalles) => {
        if (err) return res.status(500).json({ error: err });
        
        const detallesMap = {};
        detalles.forEach((detalle) => {
          if (!detallesMap[detalle.idventa]) {
            detallesMap[detalle.idventa] = [];
          }
          detallesMap[detalle.idventa].push(detalle);
        });
        
        const ventasConDetalles = ventas.map((venta) => ({
          ...venta,
          detalles: detallesMap[venta.idventa] || []
        }));
        
        const totalPages = Math.ceil(total / limit);
        res.json({
          data: ventasConDetalles,
          totalItems: total,
          totalPages,
          currentPage: page
        });
      });
    });
  });
};

export const getVentas = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const fecha_inicio = req.query.fecha_inicio || null;
  const fecha_fin = req.query.fecha_fin || null;

  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  if (tipo === 'funcionario') {
    return Venta.countFilteredByCajero(search, null, idfuncionario, fecha_inicio, fecha_fin, (err, total) => {
      if (err) return res.status(500).json({ error: err });

      Venta.findAllPaginatedFilteredByCajero(limit, offset, search, null, idfuncionario, fecha_inicio, fecha_fin, (err, ventas) => {
        if (err) return res.status(500).json({ error: err });

        const ids = ventas.map((c) => c.idventa);
        if (ids.length === 0) {
          return res.json({ data: [], totalItems: 0, totalPages: 0, currentPage: page });
        }

        DetalleVenta.findByVentaMultiple(ids, (err, detalles) => {
          if (err) return res.status(500).json({ error: err });

          const detallesMap = {};
          detalles.forEach((detalle) => {
            if (!detallesMap[detalle.idventa]) {
              detallesMap[detalle.idventa] = [];
            }
            detallesMap[detalle.idventa].push(detalle);
          });

          const ventasConDetalles = ventas.map((venta) => ({
            ...venta,
            detalles: detallesMap[venta.idventa] || []
          }));

          const totalPages = Math.ceil(total / limit);
          res.json({
            data: ventasConDetalles,
            totalItems: total,
            totalPages,
            currentPage: page
          });
        });
      });
    });
  }

  Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
    if (err) return res.status(500).json({ error: err });

    const funcionariosIds = funcionarios.map(f => f.idfuncionario).join(',');

    return Venta.countFilteredByCajero(search, idusuarios, funcionariosIds, fecha_inicio, fecha_fin, (err, total) => {
      if (err) return res.status(500).json({ error: err });

      Venta.findAllPaginatedFilteredByCajero(limit, offset, search, idusuarios, funcionariosIds, fecha_inicio, fecha_fin, (err, ventas) => {
        if (err) return res.status(500).json({ error: err });

        const ids = ventas.map((c) => c.idventa);
        if (ids.length === 0) {
          return res.json({ data: [], totalItems: 0, totalPages: 0, currentPage: page });
        }

        DetalleVenta.findByVentaMultiple(ids, (err, detalles) => {
          if (err) return res.status(500).json({ error: err });

          const detallesMap = {};
          detalles.forEach((detalle) => {
            if (!detallesMap[detalle.idventa]) {
              detallesMap[detalle.idventa] = [];
            }
            detallesMap[detalle.idventa].push(detalle);
          });

          const ventasConDetalles = ventas.map((venta) => ({
            ...venta,
            detalles: detallesMap[venta.idventa] || []
          }));

          const totalPages = Math.ceil(total / limit);
          res.json({
            data: ventasConDetalles,
            totalItems: total,
            totalPages,
            currentPage: page
          });
        });
      });
    });
  });
};

export const getGanancias = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo: tipoUsuario } = req.user || {};

  // Validar autenticación
  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const tipo = req.query.tipo || 'dia'; // 'dia', 'mes', 'año'
  const fecha_inicio = req.query.fecha_inicio;
  const fecha_fin = req.query.fecha_fin;
  const limit = parseInt(req.query.limit) || null;

  // Validar tipo
  if (!['dia', 'mes', 'año'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo debe ser: dia, mes o año' });
  }

  // Función helper que ejecuta la búsqueda con los IDs apropiados
  function obtenerGanancias(idsusuarios, idfuncionariosIds) {
    Venta.getGananciasPorPeriodoByUser(tipo, fecha_inicio, fecha_fin, limit, idsusuarios, idfuncionariosIds, (err, ganancias) => {
      if (err) return res.status(500).json({ error: err });

      res.json({
        tipo: tipo,
        filtros: {
          fecha_inicio: fecha_inicio || 'Sin filtro',
          fecha_fin: fecha_fin || 'Sin filtro',
          limit: limit || 'Sin límite'
        },
        data: ganancias
      });
    });
  }

  // Lógica condicional según el tipo de usuario
  if (tipoUsuario === 'funcionario') {
    // Funcionario: solo ver sus propias ganancias
    obtenerGanancias(null, idfuncionario);
  } else {
    // Usuario administrador: ver sus ganancias + las de sus funcionarios
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: err });

      const funcionariosIds = funcionarios.length > 0
        ? funcionarios.map(f => f.idfuncionario).join(',')
        : null;

      obtenerGanancias(idusuarios, funcionariosIds);
    });
  }
};

export const getVentaById = (req, res) => {
  const id = req.params.id;
  Venta.findById(id, (err, venta) => {
    if (err) return res.status(500).json({ error: err });
    res.json(venta[0]);
  });
};

export const deleteVenta = (req, res) => {
  const id = req.params.id;

  // Buscar los detalles de la venta
  DetalleVenta.findByVentaId(id, (err, detalles) => {
    if (err) return res.status(500).json({ error: err });
    if (!detalles.length) return res.status(404).json({ error: '❌ No se encontraron detalles para esta venta' });

    let actualizados = 0;

    detalles.forEach((detalle) => {
      // 1. Reintegrar al stock del producto
      Producto.aumentarStock(detalle.idproducto, detalle.cantidad, (errProd) => {
        if (errProd) return res.status(500).json({ error: errProd });

        // 2. Reintegrar al lote si tiene iddetalle_compra
        if (detalle.iddetalle_compra) {
          DetalleCompra.aumentarStockLote(detalle.iddetalle_compra, detalle.cantidad, (errLote) => {
            if (errLote) return res.status(500).json({ error: errLote });

            actualizados++;
            if (actualizados === detalles.length) finalizarAnulacion();
          });
        } else {
          actualizados++;
          if (actualizados === detalles.length) finalizarAnulacion();
        }
      });
    });

    function finalizarAnulacion() {
      // 1. Anular la venta (soft delete)
      Venta.softDelete(id, (errVenta) => {
        if (errVenta) {
          console.error('❌ Error al anular venta:', errVenta);
          return res.status(500).json({ error: '❌ Error al anular venta' });
        }

        console.log(`✅ Venta ${id} anulada (soft delete)`);

        // 2. Anular detalles de venta
        DetalleVenta.softDeleteByVenta(id, (errDetalles) => {
          if (errDetalles) {
            console.error('❌ Error al anular detalles de venta:', errDetalles);
          } else {
            console.log(`✅ Detalles de venta ${id} anulados`);
          }

          // 3. Anular deuda de venta (si existe - para ventas a crédito)
          DeudaVenta.softDeleteByVenta(id, (errDeuda) => {
            if (errDeuda) {
              console.error('⚠️ Error al anular deuda de venta:', errDeuda);
            } else {
              console.log(`✅ Deuda de venta ${id} anulada (si existía)`);
            }

            // 4. Anular ingreso relacionado (si existe)
            Ingreso.softDeleteByVentaId(id, (errIngreso) => {
              if (errIngreso) {
                console.error('⚠️ Error al anular ingreso relacionado:', errIngreso);
              } else {
                console.log(`✅ Ingreso relacionado a venta ${id} anulado`);
              }

              // 5. Ejecutar anulaciones de registros asociados en paralelo
              let errores = [];
              let completed = 0;
              const totalOperaciones = 3;

              const checkCompletion = () => {
                completed++;
                if (completed === totalOperaciones) {
                  if (errores.length > 0) {
                    return res.status(200).json({
                      message: '✅ Venta anulada y stock restaurado, pero hubo errores al anular registros asociados',
                      errores
                    });
                  }
                  res.json({ message: '✅ Venta anulada, stock restaurado y registros asociados anulados' });
                }
              };

              DatosTransferenciaVenta.softDeleteByVenta(id, (errTransferencia) => {
                if (errTransferencia) {
                  console.error('⚠️ Error al anular datos de transferencia:', errTransferencia);
                  errores.push('transferencia');
                }
                checkCompletion();
              });

              DetalleChequeVenta.softDeleteByVenta(id, (errCheque) => {
                if (errCheque) {
                  console.error("⚠️ Error al anular el cheque:", errCheque);
                  errores.push('cheque');
                }
                checkCompletion();
              });

              DetalleTarjetaVenta.softDeleteByVenta(id, (errTarjeta) => {
                if (errTarjeta) {
                  console.error("⚠️ Error al anular datos de tarjeta:", errTarjeta);
                  errores.push('tarjeta');
                }
                checkCompletion();
              });
            });
          });
        });
      });
    }
  });
};

export const comprobanteVenta = (req, res) => {
  const idventa = req.params.id;

  Venta.findById(idventa, (errVenta, ventaResult) => {
    if (errVenta || !ventaResult.length) {
      return res.status(404).json({ error: '❌ Venta no encontrada' });
    }

    const venta = ventaResult[0];

    Cliente.findById(venta.idcliente, (errCliente, clienteResult) => {
      if (errCliente || !clienteResult?.length) {
        return res.status(404).json({ error: '❌ Cliente no encontrado' });
      }

      const cliente = clienteResult[0];

      Facturador.findById(venta.idfacturador, (errFact, factResult) => {
        if (errFact || !factResult?.length) {
          return res.status(404).json({ error: '❌ Facturador no encontrado' });
        }

        const facturador = factResult[0];

        DetalleVenta.findByVentaId(idventa, (errDetalles, detallesVenta) => {
          if (errDetalles) {
            return res.status(500).json({ error: '❌ Error al obtener detalles de venta' });
          }

          Venta.getTotalesIVA(idventa, async (errIVA, totalesIVA) => {
            if (errIVA) {
              return res.status(500).json({ error: '❌ Error al obtener totales de IVA' });
            }

            const toWords = new ToWords({
              localeCode: 'es-ES',
              converterOptions: {
                currency: true,
                ignoreDecimal: false,
                ignoreZeroCurrency: false,
                doNotAddOnly: false,
                currencyOptions: {
                  name: 'guaraní',
                  plural: 'guaraníes',
                  symbol: '₲',
                  fractionalUnit: {
                    name: 'céntimo',
                    plural: 'céntimos',
                    symbol: '',
                  },
                },
              },
            });

            const formatDate = (date) => {
              const d = new Date(date);
              const day = String(d.getDate()).padStart(2, '0');
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const year = d.getFullYear();
              return `${day}-${month}-${year}`;
            };

            const datosFactura = {
              nombre_fantasia: facturador.nombre_fantasia,
              ruc: facturador.ruc,
              timbrado_nro: facturador.timbrado_nro,
              fecha_inicio_vigente: formatDate(facturador.fecha_inicio_vigente),
              fecha_fin_vigente: formatDate(facturador.fecha_fin_vigente),
              nro_factura: venta.nro_factura,
              nro_ticket: venta.nro_ticket,
              fecha: formatDate(venta.fecha),
              cliente: `${cliente.nombre} ${cliente.apellido}`,
              nro_documento: cliente.numDocumento,
              total: venta.total,
              totalletras: toWords.convert(venta.total || 0),
              subtotal_exento: venta.subtotal_exento || 0,
              subtotal_iva5: totalesIVA.iva5 || 0,
              subtotal_iva10: totalesIVA.iva10 || 0,
              total_iva: totalesIVA.totaliva || 0,
              total_descuento: venta.total_descuento || 0,
              total_original: venta.total,
              logo_base64: venta.logo_base64 || '',
              detalles: detallesVenta.map((item) => ({
                nombre_producto: item.nombre_producto,
                cantidad: item.cantidad,
                precio_venta: item.precio_venta,
                sub_total: item.sub_total,
                iva5: item.iva5 || 0,
                iva10: item.iva10 || 0,
              })),
            };

            const facturaPDFBase64 = await generarFacturaEmbebida(datosFactura);

            res.json({
              message: '✅ Comprobante generado correctamente',
              facturaPDFBase64,
            });
          });
        });
      });
    });
  });
};

export const getVentasPorMes = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo: tipoUsuario } = req.user || {};

  // Validar autenticación
  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const year = parseInt(req.query.year) || new Date().getFullYear();

  // Función helper que ejecuta la búsqueda con los IDs apropiados
  function obtenerVentasPorMes(idsusuarios, idfuncionariosIds) {
    Venta.getVentasPorMesByUser(year, idsusuarios, idfuncionariosIds, (err, results) => {
      if (err) {
        console.error("❌ Error al obtener ventas por mes:", err);
        return res.status(500).json({ error: "Error al obtener ventas por mes" });
      }

      const ventasMensuales = Array(12).fill(0);

      results.forEach((row) => {
        ventasMensuales[row.mes - 1] = parseFloat(row.total);
      });

      res.json({
        year,
        data: ventasMensuales,
      });
    });
  }

  // Lógica condicional según el tipo de usuario
  if (tipoUsuario === 'funcionario') {
    // Funcionario: solo ver sus propias ventas
    obtenerVentasPorMes(null, idfuncionario);
  } else {
    // Usuario administrador: ver sus ventas + las de sus funcionarios
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: err });

      const funcionariosIds = funcionarios.length > 0
        ? funcionarios.map(f => f.idfuncionario).join(',')
        : null;

      obtenerVentasPorMes(idusuarios, funcionariosIds);
    });
  }
};

export const getProgresoMetaMensual = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo: tipoUsuario } = req.user || {};

  // Validar autenticación
  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // Nota: metaMensual debe estar definido en alguna parte del código o configuración
  const metaMensual = 100000; // Valor de ejemplo, ajustar según tu configuración

  // Función helper que ejecuta la búsqueda con los IDs apropiados
  function obtenerProgreso(idsusuarios, idfuncionariosIds) {
    Venta.getProgresoMetaMensualByUser(year, month, idsusuarios, idfuncionariosIds, (err, result) => {
      if (err) return res.status(500).json({ error: err });

      const { hoy = 0, acumulado = 0 } = result[0] || {};
      const porcentaje = metaMensual > 0 ? (acumulado / metaMensual) * 100 : 0;

      res.json({
        hoy,
        acumulado,
        meta: metaMensual,
        porcentaje: parseFloat(porcentaje.toFixed(2)),
      });
    });
  }

  // Lógica condicional según el tipo de usuario
  if (tipoUsuario === 'funcionario') {
    // Funcionario: solo ver su propio progreso
    obtenerProgreso(null, idfuncionario);
  } else {
    // Usuario administrador: ver su progreso + el de sus funcionarios
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: err });

      const funcionariosIds = funcionarios.length > 0
        ? funcionarios.map(f => f.idfuncionario).join(',')
        : null;

      obtenerProgreso(idusuarios, funcionariosIds);
    });
  }
};

export const getProductosMasVendidos = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo: tipoUsuario } = req.user || {};

  // Validar autenticación
  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const limit = parseInt(req.query.limit) || 5;

  // Función helper que ejecuta la búsqueda con los IDs apropiados
  function obtenerProductosMasVendidos(idsusuarios, idfuncionariosIds) {
    DetalleVenta.getProductosMasVendidosByUser(limit, idsusuarios, idfuncionariosIds, (err, results) => {
      if (err) {
        console.error("❌ Error al obtener productos más vendidos:", err);
        return res.status(500).json({ error: "Error al obtener productos más vendidos" });
      }

      res.json(results);
    });
  }

  // Lógica condicional según el tipo de usuario
  if (tipoUsuario === 'funcionario') {
    // Funcionario: solo ver sus propios productos más vendidos
    obtenerProductosMasVendidos(null, idfuncionario);
  } else {
    // Usuario administrador: ver sus productos + los de sus funcionarios
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: err });

      const funcionariosIds = funcionarios.length > 0
        ? funcionarios.map(f => f.idfuncionario).join(',')
        : null;

      obtenerProductosMasVendidos(idusuarios, funcionariosIds);
    });
  }
};

export const getEstadisticasVentas = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo: tipoUsuario } = req.user || {};

  // Validar autenticación
  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const year = parseInt(req.query.year) || new Date().getFullYear();

  // Función helper que ejecuta la búsqueda con los IDs apropiados
  function obtenerEstadisticas(idsusuarios, idfuncionariosIds) {
    Venta.getEstadisticasAnualesByUser(year, idsusuarios, idfuncionariosIds, (err, results) => {
      if (err) {
        console.error("❌ Error al obtener estadísticas:", err);
        return res.status(500).json({ error: "Error al obtener estadísticas de ventas" });
      }

      const ventas = Array(12).fill(0);
      const ganancias = Array(12).fill(0);

      results.forEach((row) => {
        ventas[row.mes - 1] = parseFloat(row.total_ventas);
        ganancias[row.mes - 1] = parseFloat(row.total_ganancias);
      });

      res.json({ ventas, ganancias });
    });
  }

  // Lógica condicional según el tipo de usuario
  if (tipoUsuario === 'funcionario') {
    // Funcionario: solo ver sus propias estadísticas
    obtenerEstadisticas(null, idfuncionario);
  } else {
    // Usuario administrador: ver sus estadísticas + las de sus funcionarios
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: err });

      const funcionariosIds = funcionarios.length > 0
        ? funcionarios.map(f => f.idfuncionario).join(',')
        : null;

      obtenerEstadisticas(idusuarios, funcionariosIds);
    });
  }
};

export const getResumenVentasDia = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo: tipoUsuario } = req.user || {};

  // Validar autenticación
  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  // Función helper que ejecuta la búsqueda con los IDs apropiados
  function obtenerResumen(idsusuarios, idfuncionariosIds) {
    Venta.getResumenVentasDelDiaByUser(idsusuarios, idfuncionariosIds, (err, result) => {
      if (err) {
        console.error("❌ Error en resumen de ventas:", err);
        return res.status(500).json({ error: "Error al obtener resumen de ventas" });
      }

      const { totalHoy = 0, totalAyer = 0 } = result[0] || {};
      const variacion = totalAyer === 0 ? 100 : ((totalHoy - totalAyer) / totalAyer) * 100;

      res.json({
        label: "Ventas del día",
        totalHoy: parseFloat(totalHoy),
        totalAyer: parseFloat(totalAyer),
        variacion: parseFloat(variacion.toFixed(2))
      });
    });
  }

  // Lógica condicional según el tipo de usuario
  if (tipoUsuario === 'funcionario') {
    // Funcionario: solo ver su propio resumen
    obtenerResumen(null, idfuncionario);
  } else {
    // Usuario administrador: ver su resumen + el de sus funcionarios
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: err });

      const funcionariosIds = funcionarios.length > 0
        ? funcionarios.map(f => f.idfuncionario).join(',')
        : null;

      obtenerResumen(idusuarios, funcionariosIds);
    });
  }
};

// ✅ Obtener datos para el reporte de ventas (sin generar PDF)
export const getReporteVentasData = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const userId = idfuncionario || idusuarios;
  const search = req.query.search || '';
  const fechaInicio = req.query.fecha_inicio || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const fechaFin = req.query.fecha_fin || new Date().toISOString().split('T')[0];
  const tipoFiltro = req.query.tipo || ''; // 'contado', 'credito' o '' (todos)

  // Validar usuario autenticado
  if (!userId) {
    return res.status(401).json({
      error: 'Usuario no autenticado'
    });
  }

  // Obtener ventas del usuario con estadísticas
  Venta.findAllForReportWithStats(userId, search, fechaInicio, fechaFin, (err, ventas) => {
    if (err) {
      console.error('❌ Error al obtener ventas:', err);
      return res.status(500).json({
        error: 'Error interno al obtener ventas'
      });
    }

    if (!ventas.length) {
      return res.status(404).json({
        error: '⚠️ No se encontraron ventas para generar el reporte'
      });
    }

    // Filtrar por tipo si se especificó (ignorar 'todos' o vacío)
    let ventasFiltradas = ventas;
    if (tipoFiltro && tipoFiltro.trim() !== '' && tipoFiltro.toLowerCase() !== 'todos') {
      ventasFiltradas = ventas.filter(venta =>
        venta.tipo.toLowerCase() === tipoFiltro.toLowerCase()
      );

      if (!ventasFiltradas.length) {
        return res.status(404).json({
          error: `⚠️ No se encontraron ventas del tipo "${tipoFiltro}"`
        });
      }
    }

    // Función helper para formatear fechas
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Función helper para formatear números con puntos de miles
    const formatNumber = (num) => {
      if (!num && num !== 0) return '0';
      return new Intl.NumberFormat('es-PY').format(Math.round(num));
    };

    // Calcular estadísticas generales
    let totalVentas = ventasFiltradas.length;
    let ventasContado = 0;
    let ventasCredito = 0;
    let montoTotalVentas = 0;
    let montoTotalDescuentos = 0;
    let gananciaTotal = 0;
    let cantidadTotalProductos = 0;

    ventasFiltradas.forEach((venta) => {
      // Contar por tipo
      if (venta.tipo === 'contado') {
        ventasContado++;
      } else {
        ventasCredito++;
      }

      // Sumar montos
      montoTotalVentas += parseFloat(venta.total) || 0;
      montoTotalDescuentos += parseFloat(venta.descuento_aplicado) || 0;
      gananciaTotal += parseFloat(venta.ganancia_total) || 0;
      cantidadTotalProductos += parseInt(venta.cantidad_total_productos) || 0;
    });

    // Formatear ventas con todos los datos necesarios
    const ventasFormateadas = ventasFiltradas.map((venta) => {
      return {
        idventa: venta.idventa,
        nro_factura: venta.nro_factura || 'Sin factura',
        fecha: formatDate(venta.fecha),
        cliente_nombre: venta.cliente_nombre || 'Cliente General',
        cliente_documento: venta.cliente_documento || 'Sin documento',
        cajero_nombre: venta.cajero_nombre || 'Sistema',
        tipo: venta.tipo.charAt(0).toUpperCase() + venta.tipo.slice(1),
        estado: venta.estado,
        estado_pago: venta.estado_pago || 'N/A',
        total: formatNumber(parseFloat(venta.total) || 0),
        total_raw: parseFloat(venta.total) || 0,
        descuento_aplicado: formatNumber(parseFloat(venta.descuento_aplicado) || 0),
        descuento_raw: parseFloat(venta.descuento_aplicado) || 0,
        ganancia_total: formatNumber(parseFloat(venta.ganancia_total) || 0),
        ganancia_raw: parseFloat(venta.ganancia_total) || 0,
        total_productos: parseInt(venta.total_productos) || 0,
        cantidad_total_productos: parseInt(venta.cantidad_total_productos) || 0,
        created_at: formatDate(venta.created_at)
      };
    });

    res.status(200).json({
      success: true,
      data: ventasFormateadas,
      filtros: {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        tipo: tipoFiltro || 'Todos'
      },
      estadisticas: {
        total_ventas: totalVentas,
        ventas_contado: ventasContado,
        ventas_credito: ventasCredito,
        monto_total_ventas: formatNumber(montoTotalVentas),
        monto_total_ventas_raw: montoTotalVentas,
        monto_total_descuentos: formatNumber(montoTotalDescuentos),
        monto_total_descuentos_raw: montoTotalDescuentos,
        ganancia_total: formatNumber(gananciaTotal),
        ganancia_total_raw: gananciaTotal,
        cantidad_total_productos: cantidadTotalProductos
      }
    });
  });
};

// ✅ Generar PDF del reporte de ventas
export const generateReporteVentasPDF = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const userId = idfuncionario || idusuarios;
  const search = req.query.search || '';
  const fechaInicio = req.query.fecha_inicio || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const fechaFin = req.query.fecha_fin || new Date().toISOString().split('T')[0];
  const tipoFiltro = req.query.tipo || ''; // 'contado', 'credito' o '' (todos)

  // Validar usuario autenticado
  if (!userId) {
    return res.status(401).json({
      error: 'Usuario no autenticado'
    });
  }

  // Obtener ventas del usuario con estadísticas
  Venta.findAllForReportWithStats(userId, search, fechaInicio, fechaFin, (err, ventas) => {
    if (err) {
      console.error('❌ Error al obtener ventas:', err);
      return res.status(500).json({
        error: 'Error interno al obtener ventas'
      });
    }

    if (!ventas.length) {
      return res.status(404).json({
        error: '⚠️ No se encontraron ventas para generar el reporte'
      });
    }

    // Filtrar por tipo si se especificó (ignorar 'todos' o vacío)
    let ventasFiltradas = ventas;
    if (tipoFiltro && tipoFiltro.trim() !== '' && tipoFiltro.toLowerCase() !== 'todos') {
      ventasFiltradas = ventas.filter(venta =>
        venta.tipo.toLowerCase() === tipoFiltro.toLowerCase()
      );

      if (!ventasFiltradas.length) {
        return res.status(404).json({
          error: `⚠️ No se encontraron ventas del tipo "${tipoFiltro}"`
        });
      }
    }

    // Obtener datos del facturador activo
    Facturador.findActivo((errFact, facturadores) => {
      if (errFact || !facturadores.length) {
        console.error('❌ Error al obtener facturador:', errFact);
        return res.status(500).json({
          error: 'Error al obtener información del facturador'
        });
      }

      const facturador = facturadores[0];

      // Función helper para formatear fechas
      const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Función helper para formatear números con puntos de miles
      const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('es-PY').format(Math.round(num));
      };

      // Calcular estadísticas generales
      let totalVentas = ventasFiltradas.length;
      let ventasContado = 0;
      let ventasCredito = 0;
      let montoTotalVentas = 0;
      let montoTotalDescuentos = 0;
      let gananciaTotal = 0;
      let cantidadTotalProductos = 0;

      ventasFiltradas.forEach((venta) => {
        // Contar por tipo
        if (venta.tipo === 'contado') {
          ventasContado++;
        } else {
          ventasCredito++;
        }

        // Sumar montos
        montoTotalVentas += parseFloat(venta.total) || 0;
        montoTotalDescuentos += parseFloat(venta.descuento_aplicado) || 0;
        gananciaTotal += parseFloat(venta.ganancia_total) || 0;
        cantidadTotalProductos += parseInt(venta.cantidad_total_productos) || 0;
      });

      // Formatear ventas con todos los datos necesarios
      const ventasFormateadas = ventasFiltradas.map((venta) => {
        return {
          idventa: venta.idventa,
          nro_factura: venta.nro_factura || 'Sin factura',
          fecha: formatDate(venta.fecha),
          cliente_nombre: venta.cliente_nombre || 'Cliente General',
          cliente_documento: venta.cliente_documento || 'Sin documento',
          cajero_nombre: venta.cajero_nombre || 'Sistema',
          tipo: venta.tipo.charAt(0).toUpperCase() + venta.tipo.slice(1),
          estado: venta.estado,
          estado_pago: venta.estado_pago || 'N/A',
          total: formatNumber(parseFloat(venta.total) || 0),
          descuento_aplicado: formatNumber(parseFloat(venta.descuento_aplicado) || 0),
          ganancia_total: formatNumber(parseFloat(venta.ganancia_total) || 0),
          total_productos: parseInt(venta.total_productos) || 0,
          cantidad_total_productos: parseInt(venta.cantidad_total_productos) || 0
        };
      });

      // Preparar datos para el reporte
      const dataReport = {
        empresa: {
          nombre_fantasia: facturador.nombre_fantasia,
          ruc: facturador.ruc,
          timbrado_nro: facturador.timbrado_nro,
          fecha_inicio_vigente: formatDate(facturador.fecha_inicio_vigente),
          fecha_fin_vigente: formatDate(facturador.fecha_fin_vigente),
          fecha_emision: formatDate(new Date())
        },
        reporte: {
          titulo: 'Reporte de Ventas',
          fecha_inicio: formatDate(fechaInicio),
          fecha_fin: formatDate(fechaFin),
          total_ventas: totalVentas,
          ventas_contado: ventasContado,
          ventas_credito: ventasCredito,
          monto_total_ventas: formatNumber(montoTotalVentas),
          monto_total_descuentos: formatNumber(montoTotalDescuentos),
          ganancia_total: formatNumber(gananciaTotal),
          cantidad_total_productos: cantidadTotalProductos,
          ventas: ventasFormateadas
        }
      };

      // Generar PDF
      generateReportListVenta(dataReport)
        .then((pdfBase64) => {
          if (!pdfBase64) {
            return res.status(500).json({
              error: 'Error al generar el PDF del reporte'
            });
          }

          res.status(200).json({
            success: true,
            message: '✅ Reporte de ventas generado exitosamente',
            pdf: pdfBase64,
            metadata: {
              total_ventas: totalVentas,
              monto_total: formatNumber(montoTotalVentas),
              ganancia_total: formatNumber(gananciaTotal),
              fecha_generacion: formatDate(new Date())
            }
          });
        })
        .catch((errPDF) => {
          console.error('❌ Error al generar PDF:', errPDF);
          res.status(500).json({
            error: 'Error al generar el PDF del reporte'
          });
        });
    });
  });
};

// ✅ Generar Libro de Ventas formato SET
export const generateLibroVentasSET = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const userId = idfuncionario || idusuarios;
  const fechaInicio = req.query.fecha_inicio || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const fechaFin = req.query.fecha_fin || new Date().toISOString().split('T')[0];

  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  console.log(`📚 Generando Libro de Ventas SET - Usuario: ${userId}, Período: ${fechaInicio} a ${fechaFin}`);

  const queryEmpresa = `
    SELECT
      f.nombre_fantasia, f.ruc, f.titular, f.timbrado_nro,
      f.fecha_inicio_vigente, f.fecha_fin_vigente,
      f.direccion, f.ciudad,
      GROUP_CONCAT(ae.descripcion SEPARATOR ', ') as actividad_economica
    FROM facturadores f
    LEFT JOIN detalle_actividades_economicas dae ON f.idfacturador = dae.idfacturador
    LEFT JOIN actividades_economicas ae ON dae.idactividad = ae.idactividad
    WHERE f.idusuarios = ? AND f.culminado = 0
    GROUP BY f.idfacturador
    LIMIT 1
  `;

  db.query(queryEmpresa, [userId], (errEmpresa, empresa) => {
    if (errEmpresa) {
      console.error('❌ Error al obtener datos de empresa:', errEmpresa);
      return res.status(500).json({ error: 'Error al obtener datos de la empresa' });
    }

    if (!empresa || empresa.length === 0) {
      return res.status(404).json({ error: 'No se encontró información de facturador activo' });
    }

    const datosEmpresa = empresa[0];

    Venta.findAllForReportWithStats(userId, '', fechaInicio, fechaFin, (err, ventas) => {
      if (err) {
        console.error('❌ Error al obtener ventas:', err);
        return res.status(500).json({ error: 'Error interno al obtener ventas' });
      }

      const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      };

      // Formatear fechas de string YYYY-MM-DD (evita problema de zona horaria)
      const formatDateString = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      };

      const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('es-PY').format(Math.round(num));
      };

      const calcularImpuestos = (total) => {
        const baseImponible = parseFloat(total) / 1.10;
        const iva10 = parseFloat(total) - baseImponible;
        return {
          gravada_10: Math.round(baseImponible),
          gravada_5: 0,
          exenta: 0,
          iva_10: Math.round(iva10),
          iva_5: 0
        };
      };

      let totalGravada10 = 0, totalGravada5 = 0, totalExenta = 0;
      let totalIva10 = 0, totalIva5 = 0, totalGeneral = 0;
      let ventasContado = 0, ventasCredito = 0;

      const ventasFormateadas = ventas.map((venta) => {
        const impuestos = calcularImpuestos(venta.total);
        const total = parseFloat(venta.total) || 0;

        totalGravada10 += impuestos.gravada_10;
        totalGravada5 += impuestos.gravada_5;
        totalExenta += impuestos.exenta;
        totalIva10 += impuestos.iva_10;
        totalIva5 += impuestos.iva_5;
        totalGeneral += total;

        if (venta.tipo === 'contado') ventasContado++;
        else ventasCredito++;

        return {
          fecha: formatDate(venta.fecha),
          nro_factura: venta.nro_factura || 'S/N',
          timbrado: datosEmpresa.timbrado_nro,
          cliente_documento: venta.cliente_documento || 'S/D',
          cliente_nombre: venta.cliente_nombre || 'Cliente General',
          condicion: venta.tipo === 'contado' ? 'Contado' : 'Crédito',
          gravada_10: formatNumber(impuestos.gravada_10),
          gravada_5: formatNumber(impuestos.gravada_5),
          exenta: formatNumber(impuestos.exenta),
          iva_10: formatNumber(impuestos.iva_10),
          iva_5: formatNumber(impuestos.iva_5),
          total: formatNumber(total)
        };
      });

      const dataReport = {
        empresa: {
          nombre_fantasia: datosEmpresa.nombre_fantasia || '',
          ruc: datosEmpresa.ruc || '',
          timbrado_nro: datosEmpresa.timbrado_nro || '',
          fecha_inicio_vigente: formatDate(datosEmpresa.fecha_inicio_vigente),
          fecha_fin_vigente: formatDate(datosEmpresa.fecha_fin_vigente),
          actividad_economica: datosEmpresa.actividad_economica || 'No especificada',
          direccion: datosEmpresa.direccion || 'No especificada',
          fecha_emision: formatDate(new Date())
        },
        reporte: {
          fecha_inicio: formatDateString(fechaInicio),
          fecha_fin: formatDateString(fechaFin),
          ventas: ventasFormateadas,
          totales: {
            gravada_10: formatNumber(totalGravada10),
            gravada_5: formatNumber(totalGravada5),
            exenta: formatNumber(totalExenta),
            iva_10: formatNumber(totalIva10),
            iva_5: formatNumber(totalIva5),
            total_iva: formatNumber(totalIva10 + totalIva5),
            total: formatNumber(totalGeneral)
          },
          estadisticas: {
            total_facturas: ventas.length,
            ventas_contado: ventasContado,
            ventas_credito: ventasCredito
          }
        }
      };

      generateLibroVentas(dataReport)
        .then((pdfBase64) => {
          if (!pdfBase64) {
            return res.status(500).json({ error: 'Error al generar el PDF del Libro de Ventas' });
          }

          res.status(200).json({
            success: true,
            message: '✅ Libro de Ventas generado exitosamente',
            reportePDFBase64: pdfBase64,
            metadata: {
              total_facturas: ventas.length,
              monto_total: formatNumber(totalGeneral),
              total_iva: formatNumber(totalIva10 + totalIva5),
              periodo: `${formatDate(fechaInicio)} - ${formatDate(fechaFin)}`,
              fecha_generacion: formatDate(new Date())
            }
          });
        })
        .catch((errPDF) => {
          console.error('❌ Error al generar PDF del Libro de Ventas:', errPDF);
          res.status(500).json({ error: 'Error al generar el PDF del Libro de Ventas' });
        });
    });
  });
};
