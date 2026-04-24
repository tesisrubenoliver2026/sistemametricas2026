import Configuracion from '../models/Configuracion.js';
import { getUserId } from '../utils/getUserId.js';
import crypto from 'crypto';

// ========== CONTROLADORES V2 CON VALIDACIÓN DE USUARIO ==========

/**
 * Obtener todas las configuraciones del usuario autenticado
 */
export const getConfiguraciones = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};

  // Solo usuarios administradores pueden gestionar configuraciones
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para gestionar configuraciones'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  Configuracion.getAllByUser(idusuarios, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener configuraciones:', err);
      return res.status(500).json({ error: '❌ Error al obtener configuraciones' });
    }
    res.json(results);
  });
};

/**
 * Crear o actualizar una configuración
 */
export const setConfiguracion = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};
  const { clave, valor } = req.body;

  // Solo usuarios administradores pueden crear/modificar configuraciones
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para modificar configuraciones'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (!clave || valor === undefined) {
    return res.status(400).json({ error: '⚠️ Clave y valor son requeridos' });
  }

  // Guardamos el valor como string directamente
  const valorStr = String(valor);

  Configuracion.crearOActualizarByUser(clave, valorStr, idusuarios, (err) => {
    if (err) {
      console.error('❌ Error al guardar configuración:', err);
      return res.status(500).json({ error: '❌ Error al guardar configuración' });
    }

    res.json({
      success: true,
      message: '✅ Configuración actualizada',
      clave,
      valor: valorStr
    });
  });
};

export const updateConfiguration = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};
  const { clave, valor } = req.body;

  // Solo usuarios administradores pueden crear/modificar configuraciones
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para modificar configuraciones'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (!clave || valor === undefined) {
    return res.status(400).json({ error: '⚠️ Clave y valor son requeridos' });
  }

  // Guardamos el valor como string directamente
  const valorStr = String(valor);

  Configuracion.updateConfiguration(clave, valorStr, idusuarios, (err) => {
    if (err) {
      console.error('❌ Error al guardar configuración:', err);
      return res.status(500).json({ error: '❌ Error al guardar configuración' });
    }

    res.json({
      success: true,
      message: '✅ Configuración actualizada',
      clave,
      valor: valorStr
    });
  });
};

/**
 * Obtener una configuración específica (devuelve string)
 */
export const getConfiguracionByClave = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};
  const { clave } = req.params;

  // Solo usuarios administradores pueden consultar configuraciones
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para consultar configuraciones'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  Configuracion.getValorByUser(clave, idusuarios, (err, valor) => {
    if (err) {
      console.error('❌ Error al obtener configuración:', err);
      return res.status(500).json({ error: '❌ Error al obtener configuración' });
    }
    res.json({ clave, valor });
  });
};

/**
 * Obtener una configuración con valor por defecto (devuelve boolean o string según el default)
 */
export const getValorConDefault = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};
  const { clave } = req.params;

  // Solo usuarios administradores pueden consultar configuraciones
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para consultar configuraciones'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  // Valor por defecto es false (boolean)
  Configuracion.getValorConDefaultByUser(clave, idusuarios, false, (err, valor) => {
    if (err) {
      console.error('❌ Error al consultar configuración:', err);
      return res.status(500).json({ error: '❌ Error al consultar configuración' });
    }
    res.json({ clave, valor });
  });
};

/**
 * Eliminar una configuración específica
 */
export const deleteConfiguracion = (req, res) => {
  const { idusuarios, idfuncionario } = getUserId(req);
  const { tipo } = req.user || {};
  const { clave } = req.params;

  // Solo usuarios administradores pueden eliminar configuraciones
  if (tipo === 'funcionario') {
    return res.status(403).json({
      success: false,
      message: 'Los funcionarios no tienen permisos para eliminar configuraciones'
    });
  }

  if (!idusuarios) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  Configuracion.deleteByUser(clave, idusuarios, (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar configuración:', err);
      return res.status(500).json({ error: '❌ Error al eliminar configuración' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Configuración no encontrada' 
      });
    }

    console.log(`✅ Configuración eliminada: ${clave} (Usuario: ${idusuarios})`);
    res.json({ 
      success: true,
      message: '✅ Configuración eliminada correctamente' 
    });
  });
};
