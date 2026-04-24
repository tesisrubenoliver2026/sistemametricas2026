import Cliente from '../models/Cliente.js';
import Funcionario from '../models/Funcionario.js';
import Facturador from "../models/facturadorModel.js"
import { generateReportListClient } from '../report/reportListClient.js';
import { getUserId } from '../utils/getUserId.js';

// ✅ Obtener clientes con paginación y búsqueda
export const getClientes = (req, res) => {
  
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  Cliente.findAllPaginatedFiltered(limit, offset, search, (err, clientes) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error al obtener clientes' });
    }

    Cliente.countFiltered(search, (err, total) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error al contar clientes' });
      }

      res.json({
        success: true,
        data: clientes,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    });
  });
};

export const getClientesByUser = (req, res) => {
  // Validar usuario autenticado
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  // Función helper que ejecuta la búsqueda con los IDs apropiados
  function buscarClientes(idsusuarios, idfuncionariosIds) {
    Cliente.findAllPaginatedFilteredByUserV2(idsusuarios, idfuncionariosIds, limit, offset, search, (err, clientes) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ 
          success: false, 
          message: 'Error al obtener clientes' 
        });
      }

      Cliente.countFilteredByUserV2(idsusuarios, idfuncionariosIds, search, (err, total) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ 
            success: false, 
            message: 'Error al contar clientes' 
          });
        }

        res.json({
          success: true,
          data: clientes,
          total,
          page,
          totalPages: Math.ceil(total / limit)
        });
      });
    });
  }

  // Lógica condicional según el tipo de usuario
  if (tipo === 'funcionario') {
    // Funcionario: solo ver sus propios clientes
    buscarClientes(null, idfuncionario);
  } else {
    // Usuario administrador: ver sus clientes + los de sus funcionarios
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: err });

      const funcionariosIds = funcionarios.length > 0
        ? funcionarios.map(f => f.idfuncionario).join(',')
        : null;

      buscarClientes(idusuarios, funcionariosIds);
    });
  }
};


// ✅ Obtener cliente por ID
export const getClienteById = (req, res) => {
  const { id } = req.params;

  Cliente.findById(id, (err, cliente) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error al obtener cliente' });
    }
    if (!cliente.length) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
    res.json({ success: true, data: cliente[0] });
  });
};

// ✅ Crear nuevo cliente
export const createCliente = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({
      success: false,
      error: 'Usuario no autenticado'
    });
  }
  const data = { ...req.body, idusuario: idusuarios, idfuncionario };
  Cliente.create(data, (err, result) => {
    console.log(data)
    if (err) {
      console.error('Error al crear cliente:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
          success: false, 
          error: 'El número de documento ya existe. Por favor ingrese uno diferente.' 
        });
      }
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
          success: false, 
          error: 'Usuario no válido' 
        });
      }
      return res.status(500).json({ 
        success: false, 
        error: 'Error al crear cliente' 
      });
    }
       
    res.json({ 
      success: true, 
      message: 'Cliente creado exitosamente', 
      id: result.insertId 
    });
  });
};

// ✅ Actualizar cliente
export const updateCliente = (req, res) => {
  const { id } = req.params;
  const data = req.body;

  Cliente.update(id, data, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error al actualizar cliente' });
    }
    res.json({ success: true, message: 'Cliente actualizado exitosamente' });
  });
};

// ✅ Eliminar (soft delete) cliente
export const deleteCliente = (req, res) => {
  const { id } = req.params;

  Cliente.delete(id, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error al eliminar cliente' });
    }
    res.json({ success: true, message: 'Cliente eliminado exitosamente (soft delete)' });
  });
};

// ✅ Obtener datos para el reporte de clientes (sin generar PDF)
export const getReporteClientesData = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const userId = idfuncionario || idusuarios;
  const search = req.query.search || '';
  const tipoClienteFiltro = req.query.tipo_cliente || ''; // 'mayorista', 'minorista' o '' (todos)

  // Validar usuario autenticado
  if (!userId) {
    return res.status(401).json({
      error: 'Usuario no autenticado'
    });
  }

  // Obtener clientes del usuario con estadísticas de ventas
  Cliente.findAllByUserForReportWithSales(userId, search, (err, clientes) => {
    if (err) {
      console.error('❌ Error al obtener clientes:', err);
      return res.status(500).json({
        error: 'Error interno al obtener clientes'
      });
    }

    if (!clientes.length) {
      return res.status(404).json({
        error: '⚠️ No se encontraron clientes para generar el reporte'
      });
    }

    // Filtrar clientes por tipo si se especificó
    let clientesFiltrados = clientes;
    if (tipoClienteFiltro && tipoClienteFiltro.trim() !== '') {
      clientesFiltrados = clientes.filter(cliente => {
        const tipoCliente = (cliente.tipo_cliente || 'minorista').toLowerCase();
        return tipoCliente === tipoClienteFiltro.toLowerCase();
      });

      if (!clientesFiltrados.length) {
        return res.status(404).json({
          error: `⚠️ No se encontraron clientes del tipo "${tipoClienteFiltro}"`
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
    let totalClientes = clientesFiltrados.length;
    let clientesActivos = 0;
    let clientesInactivos = 0;
    let totalVentasGeneral = 0;
    let montoTotalVendido = 0;
    let tiposCliente = {};

    clientesFiltrados.forEach((cliente) => {
      // Contar activos e inactivos
      if (cliente.estado === 'activo') {
        clientesActivos++;
      } else {
        clientesInactivos++;
      }

      // Contar tipos de cliente
      const tipo = (cliente.tipo_cliente || 'Minorista');
      tiposCliente[tipo] = (tiposCliente[tipo] || 0) + 1;

      // Sumar ventas
      totalVentasGeneral += parseInt(cliente.total_compras) || 0;
      montoTotalVendido += parseFloat(cliente.monto_total_comprado) || 0;
    });

    // Determinar el tipo de filtro aplicado o mostrar el tipo mayoritario
    let tipoMostrar = '';
    if (tipoClienteFiltro && tipoClienteFiltro.trim() !== '') {
      tipoMostrar = tipoClienteFiltro.charAt(0).toUpperCase() + tipoClienteFiltro.slice(1).toLowerCase();
    } else {
      if (Object.keys(tiposCliente).length > 0) {
        tipoMostrar = Object.keys(tiposCliente).reduce((a, b) =>
          tiposCliente[a] > tiposCliente[b] ? a : b, 'Todos'
        );
      } else {
        tipoMostrar = 'Todos';
      }
    }

    // Formatear clientes con todos los datos necesarios incluidas estadísticas de ventas
    const clientesFormateados = clientesFiltrados.map((cliente) => {
      return {
        idcliente: cliente.idcliente,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        tipo: cliente.tipo,
        numDocumento: cliente.numDocumento,
        telefono: cliente.telefono || 'Sin teléfono',
        direccion: cliente.direccion || 'Sin dirección',
        genero: cliente.genero || 'O',
        estado: cliente.estado,
        descripcion: cliente.descripcion || '',
        created_at: formatDate(cliente.created_at),
        updated_at: formatDate(cliente.updated_at),
        deleted_at: formatDate(cliente.deleted_at),
        tipo_cliente: cliente.tipo_cliente || 'Minorista',
        tipo_documento: cliente.tipo_documento || '',
        idusuario: cliente.idusuario,
        // Datos de ventas
        total_compras: parseInt(cliente.total_compras) || 0,
        monto_total_comprado: formatNumber(parseFloat(cliente.monto_total_comprado) || 0),
        monto_total_comprado_raw: parseFloat(cliente.monto_total_comprado) || 0,
        ultima_compra: formatDate(cliente.ultima_compra) || 'Sin compras'
      };
    });

    res.status(200).json({
      success: true,
      data: clientesFormateados,
      estadisticas: {
        total_clientes: totalClientes,
        clientes_activos: clientesActivos,
        clientes_inactivos: clientesInactivos,
        tipo_mayoria: tipoMostrar,
        total_ventas_general: totalVentasGeneral,
        monto_total_vendido: formatNumber(montoTotalVendido),
        monto_total_vendido_raw: montoTotalVendido
      }
    });
  });
};

// ✅ Generar PDF del reporte de clientes con filtro por tipo
export const generateReporteClientesPDF = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const userId = idfuncionario || idusuarios;
  const search = req.query.search || '';
  const tipoClienteFiltro = req.query.tipo_cliente || ''; // 'mayorista', 'minorista' o '' (todos)

  // Validar usuario autenticado
  if (!userId) {
    return res.status(401).json({
      error: 'Usuario no autenticado'
    });
  }

  // Obtener clientes del usuario con estadísticas de ventas
  Cliente.findAllByUserForReportWithSales(userId, search, (err, clientes) => {
    if (err) {
      console.error('❌ Error al obtener clientes:', err);
      return res.status(500).json({
        error: 'Error interno al obtener clientes'
      });
    }

    if (!clientes.length) {
      return res.status(404).json({
        error: '⚠️ No se encontraron clientes para generar el reporte'
      });
    }

    // Filtrar clientes por tipo si se especificó
    let clientesFiltrados = clientes;
    if (tipoClienteFiltro && tipoClienteFiltro.trim() !== '') {
      clientesFiltrados = clientes.filter(cliente => {
        const tipoCliente = (cliente.tipo_cliente || 'minorista').toLowerCase();
        return tipoCliente === tipoClienteFiltro.toLowerCase();
      });

      if (!clientesFiltrados.length) {
        return res.status(404).json({
          error: `⚠️ No se encontraron clientes del tipo "${tipoClienteFiltro}"`
        });
      }
    }

    // Obtener datos del facturador activo
    Facturador.findActivo((errFact, factResult) => {
      if (errFact || !factResult.length) {
        return res.status(400).json({
          error: '⚠️ No se encontró facturador activo'
        });
      }

      const facturador = factResult[0];

      // Calcular totales con los clientes filtrados
      let totalClientes = clientesFiltrados.length;
      let clientesActivos = 0;
      let clientesInactivos = 0;
      let tiposCliente = {};

      clientesFiltrados.forEach((cliente) => {
        // Contar activos e inactivos
        if (cliente.estado === 'activo') {
          clientesActivos++;
        } else {
          clientesInactivos++;
        }

        // Contar tipos de cliente
        const tipo = (cliente.tipo_cliente || 'Minorista');
        tiposCliente[tipo] = (tiposCliente[tipo] || 0) + 1;
      });

      // Determinar el tipo de filtro aplicado o mostrar el tipo mayoritario
      let tipoMostrar = '';
      if (tipoClienteFiltro && tipoClienteFiltro.trim() !== '') {
        // Capitalizar la primera letra
        tipoMostrar = tipoClienteFiltro.charAt(0).toUpperCase() + tipoClienteFiltro.slice(1).toLowerCase();
      } else {
        // Si no hay filtro, mostrar el tipo con mayor cantidad
        if (Object.keys(tiposCliente).length > 0) {
          tipoMostrar = Object.keys(tiposCliente).reduce((a, b) =>
            tiposCliente[a] > tiposCliente[b] ? a : b, 'Todos'
          );
        } else {
          tipoMostrar = 'Todos';
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

      const fecha_emision = formatDate(new Date());

      // Calcular totales de ventas
      let totalVentasGeneral = 0;
      let montoTotalVendido = 0;

      clientesFiltrados.forEach((cliente) => {
        totalVentasGeneral += parseInt(cliente.total_compras) || 0;
        montoTotalVendido += parseFloat(cliente.monto_total_comprado) || 0;
      });

      // Formatear clientes con todos los datos necesarios incluidas estadísticas de ventas
      const clientesFormateados = clientesFiltrados.map((cliente) => {
        return {
          idcliente: cliente.idcliente,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          tipo: cliente.tipo,
          numDocumento: cliente.numDocumento,
          telefono: cliente.telefono || 'Sin teléfono',
          direccion: cliente.direccion || 'Sin dirección',
          genero: cliente.genero || 'O',
          estado: cliente.estado,
          descripcion: cliente.descripcion || '',
          created_at: formatDate(cliente.created_at),
          updated_at: formatDate(cliente.updated_at),
          deleted_at: formatDate(cliente.deleted_at),
          tipo_cliente: cliente.tipo_cliente || 'Minorista',
          tipo_documento: cliente.tipo_documento || '',
          idusuario: cliente.idusuario,
          // Datos de ventas
          total_compras: parseInt(cliente.total_compras) || 0,
          monto_total_comprado: formatNumber(parseFloat(cliente.monto_total_comprado) || 0),
          monto_total_comprado_raw: parseFloat(cliente.monto_total_comprado) || 0,
          ultima_compra: formatDate(cliente.ultima_compra) || 'Sin compras'
        };
      });

      // Determinar el título según el filtro
      let tituloReporte = 'Reporte de Clientes';
      if (tipoClienteFiltro && tipoClienteFiltro.trim() !== '') {
        tituloReporte = `Reporte de Clientes - ${tipoMostrar}`;
      }

      // Estructura de datos para el reporte
      const datosReporte = {
        empresa: {
          nombre_fantasia: facturador.nombre_fantasia,
          ruc: facturador.ruc,
          timbrado_nro: facturador.timbrado_nro,
          fecha_inicio_vigente: formatDate(facturador.fecha_inicio_vigente),
          fecha_fin_vigente: formatDate(facturador.fecha_fin_vigente),
          fecha_emision
        },
        reporte: {
          titulo: tituloReporte,
          total_clientes: totalClientes,
          clientes_activos: clientesActivos,
          clientes_inactivos: clientesInactivos,
          tipo_mayoria: tipoMostrar,
          // Estadísticas de ventas
          total_ventas_general: totalVentasGeneral,
          monto_total_vendido: formatNumber(montoTotalVendido),
          clientes: clientesFormateados
        }
      };

      console.log(`📊 Generando reporte de clientes (Filtro: ${tipoClienteFiltro || 'Todos'})`);

      // Generar el PDF
      generateReportListClient(datosReporte)
        .then((reportePDFBase64) => {
          res.status(200).json({
            message: '✅ Reporte de clientes generado correctamente',
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
