'use client';

import { useState } from 'react';
import ModalError from '../components/ModalError';
import ModalSuccess from '../components/ModalSuccess';
import { loginUsuario } from '../services/login';
import { useUserStore } from '../../store/useUserStore';
import { FaRegUser, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/useThemeStore';
import ModalRegistroUsuario from './components/ModalRegister';
import { getConfiguracionValorString } from '../services/configuracion';

const Login = () => {
  const router = useNavigate();
  const [login, setLogin] = useState('');
  const setUserRole = useUserStore((state) => state.setUserRole);
  const [password, setPassword] = useState('');
  const [showRegisterUser, setShowRegisterUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [errorOpen, setErrorOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  // Zustand theme store
  const setHeaderColor = useThemeStore((state) => state.setHeaderColor);
  const setBackgroundColor = useThemeStore((state) => state.setBackgroundColor);
  const setTextColor = useThemeStore((state) => state.setTextColor);


  const handleLogin = async () => {
    if (!login || !password) {
      setModalMessage('Usuario y contraseña son obligatorios');
      setErrorOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUsuario(login, password);
      const { acceso, login: username, token } = res.data;

      localStorage.setItem('usuario', JSON.stringify({ acceso, username }));
      localStorage.setItem('auth_token', token);
      setUserRole(acceso);

      await Promise.all([
        getConfiguracionValorString('headercolor_gral')
          .then((res: any) => setHeaderColor(res.data.valor || 'blue'))
          .catch(() => setHeaderColor('blue')),

        getConfiguracionValorString('backgroundcolor_gral')
          .then((res: any) => setBackgroundColor(res.data.valor || 'white'))
          .catch(() => setBackgroundColor('white')),

        getConfiguracionValorString('textcolor_gral')
          .then((res: any) => setTextColor(res.data.valor || 'black'))
          .catch(() => setTextColor('black')),
      ]);

      setModalMessage('Bienvenido al sistema');
      setSuccessOpen(true);

      setTimeout(() => {
        router('/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setModalMessage(err.response?.data?.error || 'Error al iniciar sesión');
      setErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <FaRegUser className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Bienvenido
            </h1>
            <p className="text-gray-500 mt-2">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Formulario */}
          <div className="space-y-5">
            {/* Campo Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaRegUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
                  placeholder="Ingresa tu usuario"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            {/* Botón Ingresar */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>

            {/* Separador */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">o</span>
              </div>
            </div>

            {/* Botón Registro */}
            <button
              onClick={() => setShowRegisterUser(true)}
              className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Crear una cuenta
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-400 text-sm mt-8">
            Sistema de Gestión Comercial
          </p>
        </div>

        {/* Texto inferior */}
        <p className="text-center text-white/60 text-sm mt-6">
          © {new Date().getFullYear()} Todos los derechos reservados
        </p>
      </div>

      {/* Modales */}
      <ModalSuccess
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        message={modalMessage}
      />
      <ModalError
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        message={modalMessage}
      />
      <ModalRegistroUsuario
        onClose={() => setShowRegisterUser(false)}
        onSuccess={() => setShowRegisterUser(false)}
        isOpen={showRegisterUser}
      />
    </div>
  );
};

export default Login;
