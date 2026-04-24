import Producto from "../../models/Producto/Producto.js";
import { generarReporteProductos } from '../../report/reporteProducto.js';
import db from '../../db.js';
import Facturador from "../../models/facturadorModel.js";
import Funcionario from "../../models/Funcionario.js";
import { getUserId } from '../../utils/getUserId.js';

export const getAllProductos = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  // Función helper que ejecuta la búsqueda con los IDs apropiados
  function buscarProductos(idsusuarios, idfuncionariosIds) {
    // Si la búsqueda tiene 6 caracteres o más, intentamos buscar primero por código de barras exacto
    if (search.length >= 6) {
      Producto.findByBarcodeByUserV2(idsusuarios, idfuncionariosIds, search, (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.length > 0) {
          // Si encuentra por código de barras, devolvemos ese producto
          return res.json({
            data: result,
            totalItems: 1,
            totalPages: 1,
            currentPage: 1,
          });
        }

        // Si no encuentra, seguimos con la búsqueda normal
        continuarBusquedaGeneral();
      });
    } else {
      continuarBusquedaGeneral();
    }

    function continuarBusquedaGeneral() {
      Producto.countFilteredByUserV2(idsusuarios, idfuncionariosIds, search, (err, total) => {
        if (err) return res.status(500).json({ error: err });

        Producto.findAllPaginatedFilteredByUserV2(idsusuarios, idfuncionariosIds, limit, offset, search, (err, data) => {
          if (err) return res.status(500).json({ error: err });

          const totalPages = Math.ceil(total / limit);
          res.json({
            data,
            totalItems: total,
            totalPages,
            currentPage: page,
          });
        });
      });
    }
  }

  // Lógica condicional según el tipo de usuario
  if (tipo === 'funcionario') {
    // Funcionario: solo ver sus propios productos
    buscarProductos(null, idfuncionario);
  } else {
    // Usuario administrador: ver sus productos + los de sus funcionarios
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: err });

      const funcionariosIds = funcionarios.length > 0
        ? funcionarios.map(f => f.idfuncionario).join(',')
        : null;

      buscarProductos(idusuarios, funcionariosIds);
    });
  }
};

export const getProductosByUser = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  // Función helper que ejecuta la búsqueda con los IDs apropiados
  function buscarProductos(idsusuarios, idfuncionariosIds) {
    if (search.length >= 6) {
      Producto.findByBarcodeByUserV2(idsusuarios, idfuncionariosIds, search, (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.length > 0) {
          return res.json({
            data: result,
            totalItems: 1,
            totalPages: 1,
            currentPage: 1,
          });
        }

        continuarBusquedaGeneral();
      });
    } else {
      continuarBusquedaGeneral();
    }

    function continuarBusquedaGeneral() {
      Producto.countFilteredByUserV2(idsusuarios, idfuncionariosIds, search, (err, total) => {
        if (err) return res.status(500).json({ error: err });

        Producto.findAllPaginatedFilteredByUserV2(idsusuarios, idfuncionariosIds, limit, offset, search, (err, data) => {
          if (err) return res.status(500).json({ error: err });

          const totalPages = Math.ceil(total / limit);
          res.json({
            data,
            totalItems: total,
            totalPages,
            currentPage: page,
          });
        });
      });
    }
  }

  // Lógica condicional según el tipo de usuario
  if (tipo === 'funcionario') {
    // Funcionario: solo ver sus propios productos
    buscarProductos(null, idfuncionario);
  } else {
    // Usuario administrador: ver sus productos + los de sus funcionarios
    Funcionario.findByUsuario(idusuarios, (err, funcionarios) => {
      if (err) return res.status(500).json({ error: err });

      const funcionariosIds = funcionarios.length > 0
        ? funcionarios.map(f => f.idfuncionario).join(',')
        : null;

      buscarProductos(idusuarios, funcionariosIds);
    });
  }
};


export const getProductoById = (req, res) => {
  const id = req.params.id;
  Producto.findById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]);
  });
};

export const createProducto = (req, res) => {
  // Validar usuario autenticado
  const { idusuarios, idfuncionario } = getUserId(req);
  if (!idusuarios && !idfuncionario) {
    return res.status(401).json({
      success: false,
      error: 'Usuario no autenticado'
    });
  }

  const data = { ...req.body, idusuario: idusuarios, idfuncionario };

  Producto.create(data, (err, result) => {
    if (err) {
      console.error('Error al crear producto:', err);

      // Manejar errores específicos
      if (err.code === 'PRODUCT_EXISTS') {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Error al crear producto'
      });
    }

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      id: result.insertId
    });
  });
};
export const updateProducto = (req, res) => {
  const id = req.params.id;

  const updatedFields = {
    nombre_producto: req.body.nombre_producto,
    precio_venta: req.body.precio_venta,
    precio_venta_caja: req.body.precio_venta_caja || null, 
    cod_barra: req.body.cod_barra === '' ? null : req.body.cod_barra,
    idcategoria: req.body.idcategoria,
    ubicacion: req.body.ubicacion,
    iva: req.body.iva,
    estado: req.body.estado,
    unidad_medida: req.body.unidad_medida
  };

  Producto.update(id, updatedFields, (err) => {
    if (err) {
      // Estandarizar todos los errores bajo .message
      let errorMessage = 'Error interno del servidor';

      if (err.code === 'ER_DUP_ENTRY') {
        if (err.sqlMessage?.includes('unique_nombre_usuario')) {
          errorMessage = 'Ya tienes un producto registrado con este nombre.';
        } else if (err.sqlMessage?.includes('unique_codigo_usuario')) {
          errorMessage = 'Ya tienes un producto registrado con este código de barras.';
        } else {
          errorMessage = 'Ya existe un producto con estos datos.';
        }
      } else if (err.code === 'PRODUCT_EXISTS') {
        errorMessage = err.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      return res.status(400).json({
        message: errorMessage,
        details: err.code || 'UNKNOWN_ERROR'
      });
    }

    res.json({ message: "Producto actualizado correctamente" });
  });
};

export const getReporteProductos = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const userId = idfuncionario || idusuarios;
  const search = req.query.search || '';

  // Validar usuario autenticado
  if (!userId) {
    return res.status(401).json({
      error: 'Usuario no autenticado'
    });
  }

  // Obtener productos del usuario
  Producto.findAllByUserForReport(userId, search, (err, productos) => {
    if (err) {
      console.error('❌ Error al obtener productos:', err);
      return res.status(500).json({ 
        error: 'Error interno al obtener productos' 
      });
    }

    if (!productos.length) {
      return res.status(404).json({ 
        error: '⚠️ No se encontraron productos para generar el reporte' 
      });
    }

    // Obtener datos del facturador activo
    Facturador.findActivo((errFact, factResult) => {
      if (errFact || !factResult.length) {
        return res.status(400).json({ 
          error: '⚠️ No se encontró facturador activo' 
        });
      }

      const facturador = factResult[0];

      // Calcular totales
      let totalProductos = productos.length;
      let totalStockUnidades = 0;
      let totalStockCajas = 0;
      let totalValorInventario = 0;

      productos.forEach((producto) => {
        totalStockUnidades += parseFloat(producto.stock || 0);
        totalStockCajas += parseFloat(producto.cant_cajas || 0);
        totalValorInventario += parseFloat(producto.stock || 0) * parseFloat(producto.precio_compra || 0);
      });

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
        if (!num && num !== 0) return null;
        return new Intl.NumberFormat('es-PY').format(Math.round(num));
      };

      const fecha_emision = formatDate(new Date());

      // Formatear productos con todos los datos necesarios
      const productosFormateados = productos.map((producto) => {
        const valorTotal = parseFloat(producto.stock || 0) * parseFloat(producto.precio_compra || 0);
        
        return {
          idproducto: producto.idproducto,
          nombre_producto: producto.nombre_producto,
          cod_barra: producto.cod_barra || 'SIN CÓDIGO',
          precio_compra: formatNumber(parseFloat(producto.precio_compra || 0)),
          precio_venta: formatNumber(parseFloat(producto.precio_venta || 0)),
          precio_compra_caja: producto.precio_compra_caja ? formatNumber(parseFloat(producto.precio_compra_caja)) : null,
          precio_venta_caja: producto.precio_venta_caja ? formatNumber(parseFloat(producto.precio_venta_caja)) : null,
          stock: Number(parseFloat(producto.stock || 0).toFixed(2)),
          cant_cajas: producto.cant_cajas ? Number(parseFloat(producto.cant_cajas).toFixed(2)) : null,
          cant_p_caja: producto.cant_p_caja ? Number(parseFloat(producto.cant_p_caja).toFixed(2)) : null,
          idcategoria: producto.idcategoria,
          nombre_categoria: producto.nombre_categoria || 'Sin categoría',
          ubicacion: producto.ubicacion || 'Sin ubicación',
          iva: producto.iva,
          estado: producto.estado,
          unidad_medida: producto.unidad_medida,
          valor_total: formatNumber(valorTotal),
          created_at: formatDate(producto.created_at),
          updated_at: formatDate(producto.updated_at),
          deleted_at: formatDate(producto.deleted_at),
          ultima_fecha_vencimiento: formatDate(producto.ultima_fecha_vencimiento)
        };
      });

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
          titulo: 'Reporte de Productos',
          total_productos: totalProductos,
          total_stock_unidades: Number(totalStockUnidades.toFixed(2)),
          total_stock_cajas: Number(totalStockCajas.toFixed(2)),
          total_valor_inventario: formatNumber(totalValorInventario),
          productos: productosFormateados
        }
      };

      console.log('📊 Datos del reporte de productos:', JSON.stringify(datosReporte, null, 2));

      // Generar el PDF
      generarReporteProductos(datosReporte)
        .then((reportePDFBase64) => {
          res.status(200).json({
            message: '✅ Reporte de productos generado correctamente',
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

export const deleteProducto = (req, res) => {
  const id = req.params.id;

  Producto.softDelete(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Producto eliminado correctamente (soft delete)" });
  });
};

export const verificarProductosDuplicadosInterno = async (nombresProductos, idusuario = null, idfuncionario = null) => {
  if (!nombresProductos || !Array.isArray(nombresProductos) || nombresProductos.length === 0) {
    throw new Error('No se proporcionaron nombres de productos.');
  }

  const placeholders = nombresProductos.map(() => '?').join(', ');

  // Construir condición de usuario
  let userCondition = '';
  let params = [...nombresProductos];

  if (idusuario || idfuncionario) {
    const conditions = [];
    if (idusuario) {
      conditions.push('idusuario = ?');
      params.push(idusuario);
    }
    if (idfuncionario) {
      conditions.push('idfuncionario = ?');
      params.push(idfuncionario);
    }
    userCondition = ` AND (${conditions.join(' OR ')})`;
  }

  const sql = `
    SELECT nombre_producto
    FROM productos
    WHERE nombre_producto IN (${placeholders})${userCondition}
  `;

  const [rows] = await db.promise().query(sql, params);

  const productosDuplicados = rows.map(r => r.nombre_producto);

  return {
    duplicado: productosDuplicados.length > 0,
    productosDuplicados
  };
};
