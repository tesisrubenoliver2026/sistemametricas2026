import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  // 1. Intenta desde cookie
  let token = req.cookies?.token;

  // 2. Si no está en cookie, intenta desde Authorization
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.log('❌ authMiddleware: Token no proporcionado');
    console.log('   - Cookies:', req.cookies);
    console.log('   - Authorization header:', req.headers.authorization);
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, 'clave_secreta_segura');
    req.user = decoded;

    // Si el token ya tiene el campo 'tipo', usarlo directamente
    if (decoded.tipo) {
      req.user.tipo = decoded.tipo;
      if (decoded.tipo === 'funcionario') {
        req.user.id = decoded.idfuncionario;
      } else if (decoded.tipo === 'administrador') {
        req.user.id = decoded.idusuarios || decoded.idusuario;
      }
    }
    // Fallback: Determinar tipo de usuario basado en los campos presentes
    // Priorizar funcionario si tiene idfuncionario
    else if (decoded.idfuncionario) {
      req.user.tipo = 'funcionario';
      req.user.id = decoded.idfuncionario;
    }
    // Si solo tiene idusuarios/idusuario, es administrador
    else if (decoded.idusuarios || decoded.idusuario) {
      req.user.tipo = 'administrador';
      req.user.id = decoded.idusuarios || decoded.idusuario;
    }

    console.log('✅ authMiddleware: Usuario autenticado:', {
      tipo: req.user.tipo,
      id: req.user.id,
      idusuarios: req.user.idusuarios,
      idfuncionario: req.user.idfuncionario
    });
    next();
  } catch (error) {
    console.log('❌ authMiddleware: Token inválido', error.message);
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const requireRol = (roles = []) => {
  return (req, res, next) => {
    // Acepta tanto 'acceso' (usuarios) como 'tipo_funcionario' (funcionarios)
    const userRole = req.user.acceso || req.user.tipo_funcionario;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
};