'use client';

import { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { getUsuarioId, updateUsuario } from '../services/usuarios';
import ModalAdvert from '../components/ModalAdvert';
import ModalError from '../components/ModalError';
import ModalSuccess from '../components/ModalSuccess';
import { renderInput } from '../clientes/utils/utils'; // Ajusta la ruta según necesites
import SelectInput from '../clientes/components/SelectInput'; // Ajusta la ruta
import { accesoOptions, estadoOptions } from '../utils/generateNavItems';

interface EditarUsuarioProps {
  id: number | string;
  onSuccess?: () => void;
  onClose?: () => void;
}

interface FormData {
  login: string;
  acceso: string;
  estado: string;
  nombre: string;
  apellido: string;
  telefono: string;
  password?: string;
}

const initialForm: FormData = {
  login: '',
  acceso: '',
  estado: 'activo',
  nombre: '',
  apellido: '',
  telefono: '',
};

const EditarUsuario = ({ id, onSuccess, onClose }: EditarUsuarioProps) => {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [cambiarPassword, setCambiarPassword] = useState(false);
  const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const res = await getUsuarioId(id);
        setFormData({
          login: res.data.login || '',
          acceso: res.data.acceso || '',
          estado: res.data.estado || 'activo',
          nombre: res.data.nombre || '',
          apellido: res.data.apellido || '',
          telefono: res.data.telefono || '',
        });
      } catch (error) {
        setModalMessage('  Error al obtener datos del usuario');
        setModalErrorOpen(true);
        console.error(error);
      }
    };

    if (id) fetchUsuario();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange(e);
  };

  const handleConfirmSubmit = () => {
    setModalAdvertOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload: FormData = { ...formData };
      if (!cambiarPassword || !formData.password?.trim()) {
        delete payload.password;
      }

      await updateUsuario(id, payload);

      setModalAdvertOpen(false);
      setModalSuccessOpen(true);

      setTimeout(() => {
        setModalSuccessOpen(false);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      setModalMessage('  Error al actualizar usuario');
      setModalAdvertOpen(false);
      setModalErrorOpen(true);
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 border border-blue-300 rounded-lg shadow-lg dark:border-gray-600">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full">
        <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8">
          Editar Usuario
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirmSubmit();
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Nombre */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre
            </label>
            {renderInput('nombre', 'Nombre', formData.nombre, handleInputChange)}
          </div>

          {/* Apellido */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Apellido
            </label>
            {renderInput('apellido', 'Apellido', formData.apellido, handleInputChange)}
          </div>

          {/* Teléfono */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Teléfono
            </label>
            {renderInput('telefono', 'Teléfono', formData.telefono, handleInputChange)}
          </div>

          {/* Login */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Usuario (Login)
            </label>
            {renderInput('login', 'Login', formData.login, handleInputChange)}
          </div>

          {/* Acceso */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol / Acceso
            </label>
            <SelectInput
              name="acceso"
              value={formData.acceso}
              onChange={handleSelectChange}
              placeholder="Seleccione"
              options={accesoOptions}
              
            />
          </div>

          {/* Estado */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <SelectInput
              name="estado"
              value={formData.estado}
              onChange={handleSelectChange}
              placeholder="Seleccione"
              options={estadoOptions}
              
            />
          </div>

          {/* Checkbox cambiar contraseña (col-span 3) */}
          <div className="flex items-center gap-2 col-span-1 md:col-span-3">
            <input
              type="checkbox"
              checked={cambiarPassword}
              onChange={(e) => setCambiarPassword(e.target.checked)}
              id="cambiarPassword"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="cambiarPassword" className="text-sm text-gray-700 dark:text-gray-300">
              ¿Desea cambiar la contraseña?
            </label>
          </div>

          {/* Nueva Contraseña (solo si cambiarPassword, col-span 3) */}
          {cambiarPassword && (
            <div className="flex flex-col col-span-1 md:col-span-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nueva Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password ?? ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="********"
              />
            </div>
          )}

          {/* Botón Guardar (col-span 3) */}
          <div className="col-span-1 md:col-span-3 mt-4 flex justify-center">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-[260px] bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
            >
              <FiSave className="text-xl" />
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      {/* Modales */}
      <ModalSuccess
        isOpen={modalSuccessOpen}
        onClose={() => setModalSuccessOpen(false)}
        message="Usuario actualizado con éxito  "
      />
      <ModalError
        isOpen={modalErrorOpen}
        onClose={() => setModalErrorOpen(false)}
        message={modalMessage}
      />
      <ModalAdvert
        isOpen={modalAdvertOpen}
        message="Estás a punto de actualizar los datos del usuario. ¿Deseas continuar?"
        onConfirm={handleSubmit}
        onClose={() => setModalAdvertOpen(false)}
      />
    </div>
  );
};

export default EditarUsuario;