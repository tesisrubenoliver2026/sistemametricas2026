import Facturador from '../models/facturadorModel.js';
import DetalleActivEcon from '../models/detalleActivEconModel.js';
import db from '../db.js';
import { generateReportListFacturador } from '../report/reportListFacturador.js';
import { getUserId } from '../utils/getUserId.js';
import Funcionario from '../models/Funcionario.js';

export const createFacturador = (req, res) => {
    const { actividades_economicas, ...facturadorData } = req.body; // ✨ separás las actividades

    // Obtener usuario/funcionario del token
    const { idusuarios, idfuncionario } = getUserId(req);
    const { tipo } = req.user || {};

    // Agregar idusuarios o idfuncionario según el tipo
    facturadorData.idusuarios = tipo === 'funcionario' ? null : idusuarios;
    facturadorData.idfuncionario = tipo === 'funcionario' ? idfuncionario : null;

    // Primero insertamos el facturador
    Facturador.create(facturadorData, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: '❌ Error al crear facturador' });
        }

        const idfacturador = result.insertId;

        // Ahora insertamos las actividades asociadas
        if (Array.isArray(actividades_economicas) && actividades_economicas.length > 0) {
            let processed = 0;

            actividades_economicas.forEach((idactividad) => {
                DetalleActivEcon.create({ idfacturador, idactividad }, (errDetalle) => {
                    if (errDetalle) console.error('❌ Error al insertar detalle actividad:', errDetalle);

                    processed++;
                    if (processed === actividades_economicas.length) {
                        res.status(201).json({ success: true, message: '✅ Facturador y actividades asociadas correctamente' });
                    }
                });
            });
        } else {
            // Si no hay actividades seleccionadas
            res.status(201).json({ success: true, message: '✅ Facturador creado sin actividades' });
        }
    });
};

export const getAllFacturadores = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const { idusuarios, idfuncionario } = getUserId(req);
    const { tipo } = req.user || {};
    console.log(idusuarios, idfuncionario, tipo); 
    // Si es funcionario
    if (tipo === 'funcionario') {
        return Facturador.countFilteredByUser(search, null, idfuncionario, (err, total) => {
            if (err) return res.status(500).json({ error: err });

            Facturador.findAllPaginatedFilteredByUser(limit, offset, search, null, idfuncionario, async (err, data) => {
                if (err) return res.status(500).json({ error: err });

                // 🔥 Traer actividades para cada facturador
                const promises = data.map(facturador => {
                    return new Promise((resolve, reject) => {
                        const actividadesQuery = `
                          SELECT ae.idactividad, ae.descripcion
                          FROM detalle_actividades_economicas dae
                          INNER JOIN actividades_economicas ae ON dae.idactividad = ae.idactividad
                          WHERE dae.idfacturador = ?
                        `;
                        db.query(actividadesQuery, [facturador.idfacturador], (errActividades, actividades) => {
                            if (errActividades) {
                                reject(errActividades);
                            } else {
                                facturador.actividades_economicas = actividades || [];
                                resolve(facturador);
                            }
                        });
                    });
                });

                try {
                    const facturadoresConActividades = await Promise.all(promises);
                    const totalPages = Math.ceil(total / limit);
                    res.json({
                        data: facturadoresConActividades,
                        totalItems: total,
                        totalPages,
                        currentPage: page,
                    });
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: '❌ Error al traer actividades económicas' });
                }
            });
        });
    }

    // Si es usuario, buscar sus funcionarios
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
        if (err) return res.status(500).json({ error: err });

        const funcionariosIds = funcionarios.length > 0
            ? funcionarios.map(f => f.idfuncionario).join(',')
            : null;

        Facturador.countFilteredByUser(search, idusuarios, funcionariosIds, (err, total) => {
            if (err) return res.status(500).json({ error: err });

            Facturador.findAllPaginatedFilteredByUser(limit, offset, search, idusuarios, funcionariosIds, async (err, data) => {
                if (err) return res.status(500).json({ error: err });

            // 🔥 Ahora, por cada facturador traemos sus actividades
            const promises = data.map(facturador => {
                return new Promise((resolve, reject) => {
                    const actividadesQuery = `
              SELECT ae.idactividad, ae.descripcion
              FROM detalle_actividades_economicas dae
              INNER JOIN actividades_economicas ae ON dae.idactividad = ae.idactividad
              WHERE dae.idfacturador = ?
            `;
                    db.query(actividadesQuery, [facturador.idfacturador], (errActividades, actividades) => {
                        if (errActividades) {
                            reject(errActividades);
                        } else {
                            facturador.actividades_economicas = actividades || [];
                            resolve(facturador);
                        }
                    });
                });
            });

                try {
                    const facturadoresConActividades = await Promise.all(promises);

                    const totalPages = Math.ceil(total / limit);
                    res.json({
                        data: facturadoresConActividades,
                        totalItems: total,
                        totalPages,
                        currentPage: page,
                    });
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: '❌ Error al traer actividades económicas' });
                }
            });
        });
    });
};

export const getFacturadorById = (req, res) => {
    const { id } = req.params;

    // Traer facturador principal
    const facturadorQuery = `
      SELECT * FROM facturadores WHERE idfacturador = ?
    `;

    // Traer las actividades económicas asociadas
    const actividadesQuery = `
      SELECT ae.idactividad, ae.descripcion
      FROM detalle_actividades_economicas dae
      INNER JOIN actividades_economicas ae ON dae.idactividad = ae.idactividad
      WHERE dae.idfacturador = ?
    `;

    db.query(facturadorQuery, [id], (errFacturador, resultFacturador) => {
        if (errFacturador) {
            console.error(errFacturador);
            return res.status(500).json({ success: false, error: '❌ Error al obtener facturador' });
        }

        if (!resultFacturador.length) {
            return res.status(404).json({ success: false, error: '⚠️ Facturador no encontrado' });
        }

        const facturador = resultFacturador[0];

        // Ahora traemos las actividades económicas asociadas
        db.query(actividadesQuery, [id], (errActividades, resultActividades) => {
            if (errActividades) {
                console.error(errActividades);
                return res.status(500).json({ success: false, error: '❌ Error al obtener actividades económicas' });
            }

            // ✅ Si no hay actividades, igual devolvemos []
            facturador.actividades_economicas = resultActividades || [];

            res.json({ success: true, data: facturador });
        });
    });
};

export const updateFacturador = (req, res) => {
    const { id } = req.params;
    const data = req.body;
  
    Facturador.update(id, data, (err) => {
      if (err) return res.status(500).json({ success: false, error: '❌ Error al actualizar facturador' });
  
      // 🔥 Eliminar todas las actividades actuales
      Facturador.deleteActividadesByFacturadorId(id, (errDelete) => {
        if (errDelete) {
          console.error('Error al eliminar actividades antiguas', errDelete);
          return res.status(500).json({ success: false, error: '❌ Error al actualizar actividades económicas' });
        }
  
        // 🔥 Insertar nuevas actividades
        if (data.actividades_economicas && data.actividades_economicas.length > 0) {
          Facturador.addActividades(id, data.actividades_economicas, (errAdd) => {
            if (errAdd) {
              console.error('Error al agregar nuevas actividades', errAdd);
              return res.status(500).json({ success: false, error: '❌ Error al actualizar actividades económicas' });
            }
  
            res.json({ success: true, message: '✅ Facturador actualizado correctamente' });
          });
        } else {
          res.json({ success: true, message: '✅ Facturador actualizado sin actividades económicas' });
        }
      });
    });
  };

export const deleteFacturador = (req, res) => {
    const { id } = req.params;

    Facturador.delete(id, (err, result) => {
        if (err) return res.status(500).json({ success: false, error: '❌ Error al eliminar facturador' });
        res.json({ success: true, message: '✅ Facturador eliminado correctamente' });
    });
};


// ✅ Marcar facturador como culminado
export const culminarFacturador = (req, res) => {
    const { id } = req.params;

    Facturador.culminar(id, (err, result) => {
      if (err) {
        console.error('❌ Error al culminar facturador:', err);
        return res.status(500).json({ success: false, error: 'Error al culminar facturador' });
      }

      res.json({ success: true, message: '✅ Facturador culminado correctamente' });
    });
  };

// ✅ Obtener datos para el reporte de facturadores (sin generar PDF)
export const getReporteFacturadoresData = (req, res) => {
  const search = req.query.search || '';
  const estadoFiltro = req.query.estado || ''; // 'activo', 'culminado' o '' (todos)

  // Obtener facturadores con estadísticas de ventas
  Facturador.findAllForReportWithSales(search, (err, facturadores) => {
    if (err) {
      console.error('❌ Error al obtener facturadores:', err);
      return res.status(500).json({
        error: 'Error interno al obtener facturadores'
      });
    }

    if (!facturadores.length) {
      return res.status(404).json({
        error: '⚠️ No se encontraron facturadores para generar el reporte'
      });
    }

    // Filtrar por estado (activo/culminado) si se especificó
    let facturadoresFiltrados = facturadores;
    if (estadoFiltro && estadoFiltro.trim() !== '') {
      facturadoresFiltrados = facturadores.filter(facturador => {
        if (estadoFiltro.toLowerCase() === 'activo') {
          return facturador.culminado === 0 || facturador.culminado === false;
        } else if (estadoFiltro.toLowerCase() === 'culminado') {
          return facturador.culminado === 1 || facturador.culminado === true;
        }
        return true;
      });

      if (!facturadoresFiltrados.length) {
        return res.status(404).json({
          error: `⚠️ No se encontraron facturadores con estado "${estadoFiltro}"`
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
    let totalFacturadores = facturadoresFiltrados.length;
    let facturadoresActivos = 0;
    let facturadoresCulminados = 0;
    let totalVentasGeneral = 0;
    let montoTotalFacturado = 0;
    let gananciaTotal = 0;
    let facturasUtilizadasTotal = 0;
    let facturasDisponiblesTotal = 0;
    let ventasPagadasTotal = 0;
    let ventasPendientesTotal = 0;
    let montoPagadoTotal = 0;
    let montoPendienteTotal = 0;

    facturadoresFiltrados.forEach((facturador) => {
      // Contar activos y culminados
      if (facturador.culminado === 0 || facturador.culminado === false) {
        facturadoresActivos++;
      } else {
        facturadoresCulminados++;
      }

      // Sumar ventas y montos
      totalVentasGeneral += parseInt(facturador.total_ventas) || 0;
      montoTotalFacturado += parseFloat(facturador.monto_total_facturado) || 0;
      gananciaTotal += parseFloat(facturador.ganancia_total) || 0;
      facturasUtilizadasTotal += parseInt(facturador.facturas_utilizadas) || 0;
      facturasDisponiblesTotal += parseInt(facturador.facturas_disponibles) || 0;
      ventasPagadasTotal += parseInt(facturador.ventas_pagadas) || 0;
      ventasPendientesTotal += parseInt(facturador.ventas_pendientes) || 0;
      montoPagadoTotal += parseFloat(facturador.monto_pagado) || 0;
      montoPendienteTotal += parseFloat(facturador.monto_pendiente) || 0;
    });

    // Formatear facturadores con todos los datos necesarios
    const facturadoresFormateados = facturadoresFiltrados.map((facturador) => {
      // Calcular porcentaje de uso
      const totalFacturasHabilitadas = parseInt(facturador.total_facturas_habilitadas) || 0;
      const facturasUtilizadas = parseInt(facturador.facturas_utilizadas) || 0;
      const porcentajeUso = totalFacturasHabilitadas > 0
        ? ((facturasUtilizadas / totalFacturasHabilitadas) * 100).toFixed(2)
        : '0.00';

      return {
        idfacturador: facturador.idfacturador,
        nombre_fantasia: facturador.nombre_fantasia,
        titular: facturador.titular,
        telefono: facturador.telefono || 'Sin teléfono',
        direccion: facturador.direccion || 'Sin dirección',
        ciudad: facturador.ciudad || 'Sin ciudad',
        ruc: facturador.ruc,
        timbrado_nro: facturador.timbrado_nro,
        fecha_inicio_vigente: formatDate(facturador.fecha_inicio_vigente),
        fecha_fin_vigente: formatDate(facturador.fecha_fin_vigente),
        nro_factura_inicial_habilitada: facturador.nro_factura_inicial_habilitada,
        nro_factura_final_habilitada: facturador.nro_factura_final_habilitada,
        nro_factura_disponible: facturador.nro_factura_disponible || facturador.nro_factura_inicial_habilitada,
        culminado: facturador.culminado ? 'Culminado' : 'Activo',
        created_at: formatDate(facturador.created_at),
        updated_at: formatDate(facturador.updated_at),
        // Estadísticas de ventas
        total_ventas: parseInt(facturador.total_ventas) || 0,
        monto_total_facturado: formatNumber(parseFloat(facturador.monto_total_facturado) || 0),
        monto_total_facturado_raw: parseFloat(facturador.monto_total_facturado) || 0,
        ganancia_total: formatNumber(parseFloat(facturador.ganancia_total) || 0),
        ganancia_total_raw: parseFloat(facturador.ganancia_total) || 0,
        primera_venta: formatDate(facturador.primera_venta) || 'Sin ventas',
        ultima_venta: formatDate(facturador.ultima_venta) || 'Sin ventas',
        ventas_pagadas: parseInt(facturador.ventas_pagadas) || 0,
        ventas_pendientes: parseInt(facturador.ventas_pendientes) || 0,
        monto_pagado: formatNumber(parseFloat(facturador.monto_pagado) || 0),
        monto_pagado_raw: parseFloat(facturador.monto_pagado) || 0,
        monto_pendiente: formatNumber(parseFloat(facturador.monto_pendiente) || 0),
        monto_pendiente_raw: parseFloat(facturador.monto_pendiente) || 0,
        // Estadísticas de facturas
        total_facturas_habilitadas: totalFacturasHabilitadas,
        facturas_utilizadas: facturasUtilizadas,
        facturas_disponibles: parseInt(facturador.facturas_disponibles) || 0,
        porcentaje_uso: porcentajeUso
      };
    });

    res.status(200).json({
      success: true,
      data: facturadoresFormateados,
      estadisticas: {
        total_facturadores: totalFacturadores,
        facturadores_activos: facturadoresActivos,
        facturadores_culminados: facturadoresCulminados,
        total_ventas_general: totalVentasGeneral,
        monto_total_facturado: formatNumber(montoTotalFacturado),
        monto_total_facturado_raw: montoTotalFacturado,
        ganancia_total: formatNumber(gananciaTotal),
        ganancia_total_raw: gananciaTotal,
        facturas_utilizadas_total: facturasUtilizadasTotal,
        facturas_disponibles_total: facturasDisponiblesTotal,
        ventas_pagadas_total: ventasPagadasTotal,
        ventas_pendientes_total: ventasPendientesTotal,
        monto_pagado_total: formatNumber(montoPagadoTotal),
        monto_pagado_total_raw: montoPagadoTotal,
        monto_pendiente_total: formatNumber(montoPendienteTotal),
        monto_pendiente_total_raw: montoPendienteTotal
      }
    });
  });
};

// ✅ Generar PDF del reporte de facturadores
export const generateReporteFacturadoresPDF = (req, res) => {
  const search = req.query.search || '';
  const estadoFiltro = req.query.estado || ''; // 'activo', 'culminado' o '' (todos)

  // Obtener facturadores con estadísticas de ventas
  Facturador.findAllForReportWithSales(search, (err, facturadores) => {
    if (err) {
      console.error('❌ Error al obtener facturadores:', err);
      return res.status(500).json({
        error: 'Error interno al obtener facturadores'
      });
    }

    if (!facturadores.length) {
      return res.status(404).json({
        error: '⚠️ No se encontraron facturadores para generar el reporte'
      });
    }

    // Filtrar por estado si se especificó
    let facturadoresFiltrados = facturadores;
    if (estadoFiltro && estadoFiltro.trim() !== '') {
      facturadoresFiltrados = facturadores.filter(facturador => {
        if (estadoFiltro.toLowerCase() === 'activo') {
          return facturador.culminado === 0 || facturador.culminado === false;
        } else if (estadoFiltro.toLowerCase() === 'culminado') {
          return facturador.culminado === 1 || facturador.culminado === true;
        }
        return true;
      });

      if (!facturadoresFiltrados.length) {
        return res.status(404).json({
          error: `⚠️ No se encontraron facturadores con estado "${estadoFiltro}"`
        });
      }
    }

    // Obtener datos del facturador activo para el encabezado
    Facturador.findActivo((errFact, factResult) => {
      // Si no hay facturador activo, usamos el primer facturador de la lista
      let facturadorEncabezado;
      if (errFact || !factResult.length) {
        console.warn('⚠️ No se encontró facturador activo, usando el primero de la lista');
        facturadorEncabezado = facturadoresFiltrados[0];
      } else {
        facturadorEncabezado = factResult[0];
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

      const fecha_emision = formatDate(new Date());

      // Calcular estadísticas generales
      let totalFacturadores = facturadoresFiltrados.length;
      let facturadoresActivos = 0;
      let facturadoresCulminados = 0;
      let totalVentasGeneral = 0;
      let montoTotalFacturado = 0;
      let gananciaTotal = 0;
      let facturasUtilizadasTotal = 0;
      let facturasDisponiblesTotal = 0;
      let ventasPagadasTotal = 0;
      let ventasPendientesTotal = 0;
      let montoPagadoTotal = 0;
      let montoPendienteTotal = 0;

      facturadoresFiltrados.forEach((facturador) => {
        // Contar activos y culminados
        if (facturador.culminado === 0 || facturador.culminado === false) {
          facturadoresActivos++;
        } else {
          facturadoresCulminados++;
        }

        // Sumar ventas y montos
        totalVentasGeneral += parseInt(facturador.total_ventas) || 0;
        montoTotalFacturado += parseFloat(facturador.monto_total_facturado) || 0;
        gananciaTotal += parseFloat(facturador.ganancia_total) || 0;
        facturasUtilizadasTotal += parseInt(facturador.facturas_utilizadas) || 0;
        facturasDisponiblesTotal += parseInt(facturador.facturas_disponibles) || 0;
        ventasPagadasTotal += parseInt(facturador.ventas_pagadas) || 0;
        ventasPendientesTotal += parseInt(facturador.ventas_pendientes) || 0;
        montoPagadoTotal += parseFloat(facturador.monto_pagado) || 0;
        montoPendienteTotal += parseFloat(facturador.monto_pendiente) || 0;
      });

      // Formatear facturadores con todos los datos necesarios
      const facturadoresFormateados = facturadoresFiltrados.map((facturador) => {
        // Calcular porcentaje de uso
        const totalFacturasHabilitadas = parseInt(facturador.total_facturas_habilitadas) || 0;
        const facturasUtilizadas = parseInt(facturador.facturas_utilizadas) || 0;
        const porcentajeUso = totalFacturasHabilitadas > 0
          ? ((facturasUtilizadas / totalFacturasHabilitadas) * 100).toFixed(2)
          : '0.00';

        return {
          idfacturador: facturador.idfacturador,
          nombre_fantasia: facturador.nombre_fantasia,
          titular: facturador.titular,
          telefono: facturador.telefono || 'Sin teléfono',
          direccion: facturador.direccion || 'Sin dirección',
          ciudad: facturador.ciudad || 'Sin ciudad',
          ruc: facturador.ruc,
          timbrado_nro: facturador.timbrado_nro,
          fecha_inicio_vigente: formatDate(facturador.fecha_inicio_vigente),
          fecha_fin_vigente: formatDate(facturador.fecha_fin_vigente),
          nro_factura_inicial_habilitada: facturador.nro_factura_inicial_habilitada,
          nro_factura_final_habilitada: facturador.nro_factura_final_habilitada,
          nro_factura_disponible: facturador.nro_factura_disponible || facturador.nro_factura_inicial_habilitada,
          culminado: facturador.culminado ? 'Culminado' : 'Activo',
          created_at: formatDate(facturador.created_at),
          updated_at: formatDate(facturador.updated_at),
          // Estadísticas de ventas
          total_ventas: parseInt(facturador.total_ventas) || 0,
          monto_total_facturado: formatNumber(parseFloat(facturador.monto_total_facturado) || 0),
          monto_total_facturado_raw: parseFloat(facturador.monto_total_facturado) || 0,
          ganancia_total: formatNumber(parseFloat(facturador.ganancia_total) || 0),
          ganancia_total_raw: parseFloat(facturador.ganancia_total) || 0,
          primera_venta: formatDate(facturador.primera_venta) || 'Sin ventas',
          ultima_venta: formatDate(facturador.ultima_venta) || 'Sin ventas',
          ventas_pagadas: parseInt(facturador.ventas_pagadas) || 0,
          ventas_pendientes: parseInt(facturador.ventas_pendientes) || 0,
          monto_pagado: formatNumber(parseFloat(facturador.monto_pagado) || 0),
          monto_pagado_raw: parseFloat(facturador.monto_pagado) || 0,
          monto_pendiente: formatNumber(parseFloat(facturador.monto_pendiente) || 0),
          monto_pendiente_raw: parseFloat(facturador.monto_pendiente) || 0,
          // Estadísticas de facturas
          total_facturas_habilitadas: totalFacturasHabilitadas,
          facturas_utilizadas: facturasUtilizadas,
          facturas_disponibles: parseInt(facturador.facturas_disponibles) || 0,
          porcentaje_uso: porcentajeUso
        };
      });

      // Determinar el título según el filtro
      let tituloReporte = 'Reporte de Facturadores';
      if (estadoFiltro && estadoFiltro.trim() !== '') {
        const estadoCapitalizado = estadoFiltro.charAt(0).toUpperCase() + estadoFiltro.slice(1).toLowerCase();
        tituloReporte = `Reporte de Facturadores - ${estadoCapitalizado}s`;
      }

      // Estructura de datos para el reporte
      const datosReporte = {
        empresa: {
          nombre_fantasia: facturadorEncabezado.nombre_fantasia,
          ruc: facturadorEncabezado.ruc,
          timbrado_nro: facturadorEncabezado.timbrado_nro,
          fecha_inicio_vigente: formatDate(facturadorEncabezado.fecha_inicio_vigente),
          fecha_fin_vigente: formatDate(facturadorEncabezado.fecha_fin_vigente),
          fecha_emision
        },
        reporte: {
          titulo: tituloReporte,
          total_facturadores: totalFacturadores,
          facturadores_activos: facturadoresActivos,
          facturadores_culminados: facturadoresCulminados,
          total_ventas_general: totalVentasGeneral,
          monto_total_facturado: formatNumber(montoTotalFacturado),
          ganancia_total: formatNumber(gananciaTotal),
          facturas_utilizadas_total: facturasUtilizadasTotal,
          facturas_disponibles_total: facturasDisponiblesTotal,
          ventas_pagadas_total: ventasPagadasTotal,
          ventas_pendientes_total: ventasPendientesTotal,
          monto_pagado_total: formatNumber(montoPagadoTotal),
          monto_pendiente_total: formatNumber(montoPendienteTotal),
          facturadores: facturadoresFormateados
        }
      };

      console.log(`📊 Generando reporte de facturadores (Filtro: ${estadoFiltro || 'Todos'})`);

      // Generar el PDF
      generateReportListFacturador(datosReporte)
        .then((reportePDFBase64) => {
          res.status(200).json({
            message: '✅ Reporte de facturadores generado correctamente',
            reportePDFBase64,
            datosReporte
          });
        })
        .catch((error) => {
          console.error('❌ Error al generar el reporte PDF:', error);
          res.status(500).json({
            error: '❌ Error al generar el reporte PDF',
            details: error.message
          });
        });
    });
  });
};

