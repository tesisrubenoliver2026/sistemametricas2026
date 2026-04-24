// utils/getUserId.js
// Helper para obtener el ID del usuario autenticado (administrador o funcionario)

/**
 * Obtiene el ID del usuario autenticado desde req.user
 * @param {Object} req - Request object de Express
 * @returns {Object} { idusuarios: number|null, idfuncionario: number|null, tipo: string }
 */
export const getUserId = (req) => {
  const user = req.user;

  if (!user) {
    return { idusuarios: null, idfuncionario: null, tipo: null };
  }

  // Si es administrador
  if (user.tipo === 'administrador' || user.idusuarios || user.idusuario) {
    return {
      idusuarios: user.idusuarios || user.idusuario,
      idfuncionario: null,
      tipo: 'administrador'
    };
  }

  // Si es funcionario
  if (user.tipo === 'funcionario' || user.idfuncionario) {
    return {
      idusuarios: user.idusuarios || null, // Los funcionarios también tienen idusuarios asociado
      idfuncionario: user.idfuncionario,
      tipo: 'funcionario'
    };
  }

  return { idusuarios: null, idfuncionario: null, tipo: null };
};

/**
 * Obtiene solo el idusuarios para mantener compatibilidad con código existente
 * @param {Object} req - Request object de Express
 * @returns {number|null}
 */
export const getUsuarioId = (req) => {
  const { idusuarios } = getUserId(req);
  return idusuarios;
};

/**
 * Prepara los datos para inserción en BD con ambos campos
 * @param {Object} req - Request object de Express
 * @param {Object} data - Datos adicionales a incluir
 * @returns {Object} Datos con idusuarios e idfuncionario
 */
export const prepareUserData = (req, data = {}) => {
  const { idusuarios, idfuncionario } = getUserId(req);

  return {
    ...data,
    idusuarios,
    idfuncionario,
    creado_por: idusuarios 
  };
};
