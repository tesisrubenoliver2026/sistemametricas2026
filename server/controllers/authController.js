import Usuario from '../models/Usuario.js';
import Funcionario from '../models/Funcionario.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ensureClienteUniversalForUser } from './Ventas/helpers/clienteUniversal.js';

export const login = (req, res) => {
  const { login, password } = req.body;

  // Primero intentar autenticar como Usuario (Administrador)
  Usuario.findByLogin(login, async (err, results) => {
    if (!err && results.length > 0) {
      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      // 🔐 Crear el token JWT para Usuario
      const token = jwt.sign(
        {
          idusuarios: user.idusuarios,
          idusuario: user.idusuarios,
          login: user.login,
          acceso: user.acceso,
          tipo: 'administrador'
        },
        'clave_secreta_segura',
        { expiresIn: '8h' }
      );

      // ✅ Setear la cookie para entornos con navegador
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 1000 * 60 * 60 * 8,
      });

      try {
        await ensureClienteUniversalForUser(user.idusuarios);
      } catch (error) {
        console.error('⚠️ No se pudo asegurar el cliente universal del usuario:', error.message);
      }

      // ✅ Enviar el token en el body para Electron
      return res.json({
        message: 'Login exitoso',
        acceso: user.acceso,
        tipo: 'administrador',
        nombre: user.nombre || user.login,
        apellido: user.apellido || '',
        token,
      });
    }

    // Si no se encontró como Usuario, intentar como Funcionario
    Funcionario.findByLogin(login, async (errFunc, resultsFunc) => {
      if (errFunc || resultsFunc.length === 0) {
        return res.status(401).json({ error: 'Credenciales incorrectas o usuario inactivo' });
      }

      const funcionario = resultsFunc[0];

      // Verificar que el funcionario esté activo
      if (funcionario.estado !== 'activo') {
        return res.status(401).json({ error: 'Funcionario inactivo' });
      }

      const isMatch = await bcrypt.compare(password, funcionario.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      // 🔐 Crear el token JWT para Funcionario
      const token = jwt.sign(
        {
          idfuncionario: funcionario.idfuncionario,
          idusuarios: funcionario.idusuarios || null,
          idusuario: funcionario.idusuarios || null,
          login: funcionario.login,
          acceso: funcionario.tipo_funcionario,
          tipo_funcionario: funcionario.tipo_funcionario,
          tipo: 'funcionario'
        },
        'clave_secreta_segura',
        { expiresIn: '8h' }
      );

      // ✅ Setear la cookie para entornos con navegador
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 1000 * 60 * 60 * 8,
      });

      try {
        await ensureClienteUniversalForUser(funcionario.idusuarios);
      } catch (error) {
        console.error('⚠️ No se pudo asegurar el cliente universal del funcionario:', error.message);
      }

      // ✅ Enviar el token en el body para Electron
      res.json({
        message: 'Login exitoso',
        acceso: funcionario.tipo_funcionario,
        tipo: 'funcionario',
        nombre: funcionario.nombre,
        apellido: funcionario.apellido,
        token,
      });
    });
  });
};

export const logout = (req, res) => {
  // ✅ Borrar cookie al hacer logout
  res.clearCookie('token');
  res.json({ message: 'Logout exitoso' });
};
