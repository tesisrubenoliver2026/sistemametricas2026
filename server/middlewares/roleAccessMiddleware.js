// middlewares/roleAccessMiddleware.js
/**
 * Middleware para determinar el nivel de acceso a los datos según el rol del usuario
 *
 * - Administrador: Ve TODOS los registros
 * - Funcionarios (Cajero, Vendedor, Gerente, Supervisor, Almacenero): Ven solo SUS registros
 */

export const attachAccessLevel = (req, res, next) => {
  const { tipo, acceso, tipo_funcionario } = req.user || {};

  // Determinar el rol efectivo
  const userRole = tipo === 'administrador' ? acceso : tipo_funcionario;

  // Administrador puede ver todo
  if (userRole === 'Administrador') {
    req.canViewAll = true;
    req.userRole = 'Administrador';
  } else {
    // Todos los demás funcionarios solo ven sus propios registros
    req.canViewAll = false;
    req.userRole = userRole;
  }

  next();
};

/**
 * Middleware para requerir roles específicos en rutas
 * Soporta tanto usuarios administradores como funcionarios
 */
export const requireAnyRole = (roles = []) => {
  return (req, res, next) => {
    const { tipo, acceso, tipo_funcionario } = req.user || {};

    // Determinar el rol efectivo
    const userRole = tipo === 'administrador' ? acceso : tipo_funcionario;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        requiredRoles: roles,
        yourRole: userRole
      });
    }

    next();
  };
};
