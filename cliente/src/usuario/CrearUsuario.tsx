'use client';

import { useState } from 'react';
import { crearUsuario } from '../services/usuarios';
import ModalError from '../components/ModalError';
import ModalSuccess from '../components/ModalSuccess';
import { renderInput} from '../clientes/utils/utils';
import { accesoOptions, estadoOptions } from '../utils/generateNavItems';
import SelectInput from '../clientes/components/SelectInput';

interface ModalCrearUsuarioProps {
  onSuccess: () => void;
}

const CrearUsuario = ({ onSuccess }: ModalCrearUsuarioProps) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [acceso, setAcceso] = useState('Cajero');
  const [estado, setEstado] = useState('activo');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleCrear = async () => {
    if (
      !login.trim() ||
      !password.trim() ||
      !acceso.trim() ||
      !nombre.trim() ||
      !apellido.trim()
    ) {
      setModalMessage('⚠️ Los campos Login, Contraseña, Nombre y Apellido son obligatorios');
      setErrorOpen(true);
      return;
    }

    try {
      await crearUsuario({
        login,
        password,
        acceso,
        estado,
        nombre,
        apellido,
        telefono: telefono.trim() || "",
      });

      setModalMessage('  Usuario creado correctamente');
      setSuccessOpen(true);

      setLogin('');
      setPassword('');
      setAcceso('Cajero');
      setEstado('activo');
      setNombre('');
      setApellido('');
      setTelefono('');

      onSuccess();
    } catch (err: any) {
      console.error(err);
      setModalMessage(err.response?.data?.error || '  Error al crear usuario');
      setErrorOpen(true);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 border border-blue-300 dark:border-gray-600 rounded-lg shadow-lg">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full">
        <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8">
          Crear Usuario
        </h2>

        <div className="flex flex-wrap -mx-2">
          {/* Nombre */}
          <div className="w-1/3 px-2 mb-4">
            {renderInput('nombre', 'Nombre', nombre, (e) => setNombre(e.target.value))}
          </div>

          {/* Apellido */}
          <div className="w-1/3 px-2 mb-4">
            {renderInput('apellido', 'Apellido', apellido, (e) => setApellido(e.target.value))}
          </div>

          {/* Teléfono */}
          <div className="w-1/3 px-2 mb-4">
            {renderInput('telefono', 'Telefono', telefono, (e) => setTelefono(e.target.value))}
          </div>

          {/* Login */}
          <div className="w-1/3 px-2 mb-4">
            {renderInput('login', 'Login', login, (e) => setLogin(e.target.value))}
          </div>

          {/* Password */}
          <div className="w-1/3 px-2 mb-4">
            {renderInput('password', 'Password', password, (e) => setPassword(e.target.value))}
          </div>

          {/* Acceso */}
          <div className="w-1/3 px-2 mb-4">
            <SelectInput
              name={"Rol / Acceso"}
              value={acceso}
              onChange={(e) => setAcceso(e.target.value)}
              placeholder={"Seleccione"}
              options={accesoOptions} />
          </div>

          {/* Estado */}
          <div className="w-1/3 px-2 mb-6">
            <SelectInput
              name={"Estado"}
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              placeholder={"Seleccione"}
              options={estadoOptions} />
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleCrear}
            className="w-[160px] bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold"
          >
            Crear Usuario
          </button>
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
      </div>
    </div>
  );
};

export default CrearUsuario;
