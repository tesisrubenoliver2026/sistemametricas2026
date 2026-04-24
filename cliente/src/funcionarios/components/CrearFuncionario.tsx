'use client';

import { useState } from 'react';
import { createFuncionario } from '../../services/funcionarios';
import ModalError from '../../components/ModalError';
import ModalSuccess from '../../components/ModalSuccess';
import { renderInput } from '../../clientes/utils/utils'; // Ajusta la ruta según tu estructura

interface CrearFuncionarioProps {
  onSuccess: () => void;
  onClose?: () => void;
}

const CrearFuncionario = ({ onSuccess, onClose }: CrearFuncionarioProps) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [tipoFuncionario] = useState('Cajero');

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleCrear = async () => {
    if (
      !nombre.trim() ||
      !apellido.trim() ||
      !login.trim() ||
      !password.trim()
    ) {
      setModalMessage('⚠️ Los campos Nombre, Apellido, Login y Contraseña son obligatorios');
      setErrorOpen(true);
      return;
    }

    try {
      await createFuncionario({
        nombre,
        apellido,
        telefono: telefono.trim() || '',
        tipo_funcionario: tipoFuncionario,
        login,
        password,
      });

      setModalMessage('  Funcionario creado correctamente');
      setSuccessOpen(true);

      // Limpiar campos
      setNombre('');
      setApellido('');
      setTelefono('');
      setLogin('');
      setPassword('');

      onSuccess();
      onClose && onClose();
    } catch (err: any) {
      console.error(err);
      setModalMessage(err.response?.data?.error || '  Error al crear funcionario');
      setErrorOpen(true);
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    onClose && onClose();
  };

  return (
    <div className="flex items-center justify-center px-4 border border-blue-300 dark:border-gray-600 rounded-lg shadow-lg">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full">
        <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8">
          Crear Funcionario
        </h2>

        <div className="flex flex-wrap -mx-2">
          <div className="w-1/3 px-2 mb-4">
            {renderInput('nombre', 'Nombre', nombre, (e) => setNombre(e.target.value))}
          </div>
          <div className="w-1/3 px-2 mb-4">
            {renderInput('apellido', 'Apellido', apellido, (e) => setApellido(e.target.value))}
          </div>
          <div className="w-1/3 px-2 mb-4">
            {renderInput('telefono', 'Ej: +595981234567', telefono, (e) => setTelefono(e.target.value))}
          </div>
          <div className="w-1/3 px-2 mb-4">
            {renderInput('login', 'Nombre Usuario', login, (e) => setLogin(e.target.value))}
          </div>
          <div className="w-1/3 px-2 mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Contraseña"
            />
          </div>

          {/* Tipo Funcionario (readonly) */}
          <div className="w-1/3 px-2 mb-4">
            <input
              type="text"
              value={tipoFuncionario}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleCrear}
            className="w-[180px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Crear Funcionario
          </button>
        </div>

        {/* Modales */}
        <ModalSuccess
          isOpen={successOpen}
          onClose={handleSuccessClose}
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

export default CrearFuncionario;