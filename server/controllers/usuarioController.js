import Usuario from '../models/Usuario.js';
import Funcionario from '../models/Funcionario.js';
import Configuracion from '../models/Configuracion.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getUserId } from '../utils/getUserId.js';
import { ensureClienteUniversalForUser } from './Ventas/helpers/clienteUniversal.js';

export const getUsuarios = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  // Solo usuarios administradores pueden ver la lista completa (y solo su propio perfil)
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para ver usuarios'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  // El usuario solo puede ver su propio perfil
  Usuario.findById(idusuarios, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json([results[0]]); // Devolver como array para mantener compatibilidad
  });
};

export const getUsuarioById = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};
  const requestedId = req.params.id;

  // Solo usuarios administradores pueden acceder a esta ruta
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para ver usuarios'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  // Verificar que el usuario solo pueda ver su propio perfil
  if (parseInt(requestedId) !== parseInt(idusuarios)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para ver este usuario'
    });
  }

  Usuario.findById(requestedId, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(results[0]);
  });
};

export const getUsuariosPaginated = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  // Solo usuarios administradores pueden usar esta ruta
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para ver usuarios'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  console.log("📥 Parámetros recibidos:");
  console.log("🔑 Usuario ID:", idusuarios);
  console.log("📄 page:", page);
  console.log("📏 limit:", limit);

  // El usuario solo puede ver su propio perfil
  Usuario.findById(idusuarios, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener datos:", err);
      return res.status(500).json({ error: err });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log("📦 Datos devueltos:", results);

    // Devolver siempre solo 1 resultado (el usuario actual)
    res.json({
      data: [results[0]],
      totalItems: 1,
      totalPages: 1,
      currentPage: 1,
    });
  });
};


export const createUsuario = async (req, res) => {
  try {
    const { login, password, acceso, estado, nombre, apellido, telefono } = req.body;

    const isTestUser = req.isTestUser === true;

    if (!login || !password || !acceso || !nombre || !apellido) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = {
      login,
      password: hashedPassword,
      acceso,
      estado: estado || 'activo',
      nombre,
      apellido,
      telefono: telefono || null,
      testUser: isTestUser,
    };

    Usuario.create(nuevoUsuario, (err, result) => {
      if (err) {
        console.error('❌ Error al crear usuario:', err);
        return res.status(500).json({ error: 'Error al crear usuario' });
      }

      const idusuarios = result.insertId;

      ensureClienteUniversalForUser(idusuarios).catch((error) => {
        console.error('⚠️ No se pudo asegurar el cliente universal del usuario nuevo:', error);
      });

      // Configuraciones por defecto
      const configuracionesDefault = [
        { clave: 'sistema_venta_por_lote', valor: 'false' },
        { clave: 'venta_fecha_vencimiento', valor: 'false' },
        { clave: 'selectedTemplate', valor: 't4' },
        { clave: 'ventas_programadas', valor: 'false' },
        { clave: 'tienda_activa', valor: 'false' },
        { clave: 'nombre_tienda', valor: '' },
        { clave: 'headercolor_gral', valor: 'blue' },
        { clave: 'backgroundcolor_gral', valor: 'white' },
        { clave: 'textcolor_gral', valor: 'black' },
        { clave: 'tipoMoneda', valor: "GS" }
      ];

      let pendientes = configuracionesDefault.length;
      let configuracionesCreadas = 0;
      let erroresConfiguracion = [];

      const crearConfiguracion = (config, callback) => {
        Configuracion.crearOActualizarByUser(config.clave, config.valor, idusuarios, (err) => {
          if (err) erroresConfiguracion.push(config.clave);
          else configuracionesCreadas++;
          callback();
        });
      };

      configuracionesDefault.forEach(config => {
        crearConfiguracion(config, () => {
          pendientes--;
          if (pendientes === 0) {
            if (erroresConfiguracion.length > 0) console.warn('⚠️ Configuraciones fallidas:', erroresConfiguracion);

            console.log(`✅ Usuario ${login} creado | testUser=${isTestUser}`);
            res.status(201).json({
              message: 'Usuario creado exitosamente',
              idusuarios,
              configuraciones_creadas: configuracionesCreadas,
              testUser: isTestUser
            });
          }
        });
      });
    });
  } catch (error) {
    console.error('❌ Error createUsuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateUsuario = async (req, res) => {
  try {
    const { idusuarios, idfuncionario } = getUserId(req);
    const { tipo } = req.user || {};
    const requestedId = req.params.id;

    // Solo usuarios administradores pueden actualizar
    if (tipo === 'funcionario') {
      return res.status(403).json({
        success: false,
        message: 'Los funcionarios no tienen permisos para modificar usuarios'
      });
    }

    if (!idusuarios) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Verificar que el usuario solo pueda modificar su propio perfil
    if (parseInt(requestedId) !== parseInt(idusuarios)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar este usuario'
      });
    }

    const { login, acceso, estado, nombre, apellido, telefono, password } = req.body;

    // Validar campos obligatorios
    if (!login || !acceso || !nombre || !apellido) {
      return res
        .status(400)
        .json({ error: 'Faltan campos obligatorios: login, acceso, nombre o apellido' });
    }

    // Construir objeto con los campos a actualizar
    const datosActualizar = {
      login,
      acceso,
      estado: estado || 'activo',
      nombre,
      apellido,
      telefono: telefono || null,
    };

    // Si viene contraseña nueva, la encriptamos
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      datosActualizar.password = hashedPassword;
    }

    Usuario.update(requestedId, datosActualizar, (err) => {
      if (err) {
        console.error('❌ Error en Usuario.update:', err);
        return res.status(500).json({ error: err });
      }
      res.json({ message: 'Usuario actualizado correctamente' });
    });
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getMiCargo = (req, res) => {
  console.log('📋 getMiCargo - req.user:', req.user);

  const { idusuario, idusuarios, idfuncionario, acceso, tipo_funcionario, tipo } = req.user || {};

  // Normalizar el ID de usuario (puede venir como idusuario o idusuarios)
  const userId = idusuarios || idusuario;

  // Si es funcionario, consultar la base de datos para obtener el nombre completo
  if (tipo === 'funcionario' && idfuncionario) {
    console.log('✅ getMiCargo: Buscando funcionario con ID:', idfuncionario);
    return Funcionario.findById(idfuncionario, (err, rows) => {
      if (err) {
        console.error('❌ Error al obtener funcionario:', err);
        return res.status(500).json({ error: 'Error al obtener datos del funcionario' });
      }
      if (!rows?.length) {
        console.error('❌ Funcionario no encontrado con ID:', idfuncionario);
        return res.status(404).json({ error: 'Funcionario no encontrado' });
      }

      const funcionario = rows[0];
      console.log('✅ Funcionario encontrado:', funcionario.nombre, funcionario.apellido);
      return res.json({
        acceso: funcionario.tipo_funcionario,
        nombreUsuario: `${funcionario.nombre} ${funcionario.apellido}`,
        tipo: 'funcionario'
      });
    });
  }

  // Si es usuario administrador
  if (tipo === 'administrador' && userId) {
    console.log('✅ getMiCargo: Buscando usuario con ID:', userId);
    return Usuario.findById(userId, (err, rows) => {
      if (err) {
        console.error('❌ Error al obtener usuario:', err);
        return res.status(500).json({ error: err });
      }
      if (!rows?.length) {
        console.error('❌ Usuario no encontrado con ID:', userId);
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const u = rows[0];
      console.log('✅ Usuario encontrado:', u.nombre, u.apellido);
      return res.json({
        acceso: u.acceso,
        nombreUsuario: `${u.nombre} ${u.apellido}`,
        tipo: 'administrador'
      });
    });
  }

  // Si no se pudo identificar el tipo de usuario
  console.error('❌ getMiCargo: No se pudo identificar el tipo de usuario');
  console.log('   - tipo:', tipo);
  console.log('   - idfuncionario:', idfuncionario);
  console.log('   - userId:', userId);
  return res.status(401).json({ error: 'No autenticado' });
};

export const deleteUsuario = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};
  const requestedId = req.params.id;

  // Los funcionarios no pueden eliminar usuarios
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para eliminar usuarios'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  // Un usuario no puede eliminarse a sí mismo (medida de seguridad)
  if (parseInt(requestedId) === parseInt(idusuarios)) {
    return res.status(403).json({
      success: false,
      message: 'No puedes eliminar tu propio usuario'
    });
  }

  // Verificar que el usuario solo pueda eliminar su propio perfil (si se permite)
  // Por seguridad, podríamos deshabilitar completamente esta funcionalidad
  return res.status(403).json({
    success: false,
    message: 'La eliminación de usuarios está deshabilitada por seguridad'
  });

  /* Si quieres permitir que un usuario se elimine a sí mismo (no recomendado):
  Usuario.delete(requestedId, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Usuario eliminado' });
  });
  */
};

/**
 * ========== ENDPOINT PÚBLICO DE REGISTRO ==========
 * Este endpoint permite a nuevos usuarios registrarse sin autenticación.
 * Se usa para el sistema online donde usuarios nuevos pueden crear su cuenta.
 */
export const registerUsuario = async (req, res) => {
  try {
    const {
      login,
      password,
      nombre,
      apellido,
      telefono,
    } = req.body;

    // 👇 VIENE DEL MIDDLEWARE
    const isTestUser = req.isTestUser === true;

    // Validar campos obligatorios
    if (!login || !password || !nombre || !apellido) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos obligatorios: login, password, nombre y apellido son requeridos'
      });
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el login ya existe
    Usuario.findByLogin(login, async (err, existingUsers) => {
      if (err) {
        console.error('❌ Error al verificar login existente:', err);
        return res.status(500).json({
          success: false,
          error: 'Error al verificar disponibilidad del login'
        });
      }

      if (existingUsers && existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'El login ya está en uso. Por favor, elija otro correo electrónico'
        });
      }

      try {
        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // 🔥 OBJETO FINAL
        const nuevoUsuario = {
          login,
          password: hashedPassword,
          acceso: 'Administrador',
          estado: 'activo',
          nombre,
          apellido,
          telefono: telefono || null,
          testUser: isTestUser, // ✅ ACÁ
        };

        Usuario.create(nuevoUsuario, (err, result) => {
          if (err) {
            console.error('❌ Error al crear usuario:', err);
            return res.status(500).json({
              success: false,
              error: 'Error al registrar el usuario'
            });
          }

          const idusuarios = result.insertId;

          ensureClienteUniversalForUser(idusuarios).catch((error) => {
            console.error('⚠️ No se pudo asegurar el cliente universal del usuario registrado:', error);
          });

          // Configuraciones por defecto
          const configuracionesDefault = [
            { clave: 'sistema_venta_por_lote', valor: 'false' },
            { clave: 'venta_fecha_vencimiento', valor: 'false' },
            { clave: 'selectedTemplate', valor: 't4' },
            { clave: 'ventas_programadas', valor: 'false' },
            { clave: 'tienda_activa', valor: 'false' },
            { clave: 'nombre_tienda', valor: '' },
            { clave: 'headercolor_gral', valor: 'blue' },
            { clave: 'backgroundcolor_gral', valor: 'white' },
            { clave: 'textcolor_gral', valor: 'black' },
            { clave: 'tipoMoneda', valor: "GS" }
          ];

          let pendientes = configuracionesDefault.length;
          let configuracionesCreadas = 0;
          let erroresConfiguracion = [];

          const crearConfiguracion = (config, callback) => {
            Configuracion.crearOActualizarByUser(
              config.clave,
              config.valor,
              idusuarios,
              (err) => {
                if (err) {
                  console.error(`❌ Error config ${config.clave}:`, err);
                  erroresConfiguracion.push(config.clave);
                } else {
                  configuracionesCreadas++;
                }
                callback();
              }
            );
          };

          configuracionesDefault.forEach(config => {
            crearConfiguracion(config, () => {
              pendientes--;
              if (pendientes === 0) {
                if (erroresConfiguracion.length > 0) {
                  console.warn('⚠️ Configuraciones fallidas:', erroresConfiguracion);
                }

                console.log(
                  `✅ Usuario ${login} creado | testUser=${isTestUser}`
                );

                res.status(201).json({
                  success: true,
                  message: 'Usuario registrado exitosamente',
                  idusuarios,
                  configuraciones_creadas: configuracionesCreadas,
                  testUser: isTestUser
                });
              }
            });
          });
        });
      } catch (error) {
        console.error('❌ Error hashing password:', error);
        return res.status(500).json({
          success: false,
          error: 'Error interno al procesar el registro'
        });
      }
    });
  } catch (error) {
    console.error('❌ Error general en registerUsuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};
