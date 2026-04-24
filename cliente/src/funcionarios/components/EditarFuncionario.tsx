'use client';

import { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { getFuncionarioById, updateFuncionario } from '../../services/funcionarios';
import ModalAdvert from '../../components/ModalAdvert';
import ModalError from '../../components/ModalError';
import ModalSuccess from '../../components/ModalSuccess';
import { renderInput } from '../../clientes/utils/utils';
import SelectInput from '../../clientes/components/SelectInput';

interface EditarFuncionarioProps {
  id: number | string;
  onSuccess?: () => void;
  onClose?: () => void;
}

interface FormData {
  nombre: string;
  apellido: string;
  telefono: string;
  tipo_funcionario: string;
  login: string;
  estado: string;
  password?: string;
}

const initialForm: FormData = {
  nombre: '',
  apellido: '',
  telefono: '',
  tipo_funcionario: '',
  login: '',
  estado: 'activo',
};

// Opciones para los selects
const tipoFuncionarioOptions = [
  { value: 'Vendedor', label: 'Vendedor' },
  { value: 'Cajero', label: 'Cajero' },
  { value: 'Supervisor', label: 'Supervisor' },
  { value: 'Gerente', label: 'Gerente' },
  { value: 'Administrador', label: 'Administrador' },
  { value: 'Almacenero', label: 'Almacenero' },
  { value: 'Otro', label: 'Otro' }
];

const estadoOptions = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' }
];

const EditarFuncionario = ({ id, onSuccess, onClose }: EditarFuncionarioProps) => {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [cambiarPassword, setCambiarPassword] = useState(false);
  const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const fetchFuncionario = async () => {
      try {
        const res = await getFuncionarioById(id);
        const data = res.data;
        setFormData({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          telefono: data.telefono || '',
          tipo_funcionario: data.tipo_funcionario || '',
          login: data.login || '',
          estado: data.estado || 'activo',
        });
      } catch (error) {
        setModalMessage('Error al obtener datos del funcionario');
        setModalErrorOpen(true);
        console.error(error);
      }
    };

    if (id) fetchFuncionario();
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

      await updateFuncionario(id, payload);

      setModalAdvertOpen(false);
      setModalSuccessOpen(true);

      setTimeout(() => {
        setModalSuccessOpen(false);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      setModalMessage('Error al actualizar funcionario');
      setModalAdvertOpen(false);
      setModalErrorOpen(true);
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 border border-blue-300 dark:border-gray-600 rounded-lg shadow-lg">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full">
        <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8">
          Editar Funcionario
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
            {renderInput('nombre', 'Nombre', formData.nombre, handleInputChange)}
          </div>

          {/* Apellido */}
          <div className="flex flex-col">
            {renderInput('apellido', 'Apellido', formData.apellido, handleInputChange)}
          </div>

          {/* Teléfono */}
          <div className="flex flex-col">
            {renderInput('telefono', 'Teléfono', formData.telefono, handleInputChange)}
          </div>

          {/* Login */}
          <div className="flex flex-col">
            {renderInput('login', 'Login', formData.login, handleInputChange)}
          </div>

          {/* Tipo de Funcionario */}
          <div className="flex flex-col">
            <SelectInput
              name="tipo_funcionario"
              value={formData.tipo_funcionario}
              onChange={handleSelectChange}
              placeholder="Seleccionar tipo"
              options={tipoFuncionarioOptions}
            />
          </div>

          {/* Estado */}
          <div className="flex flex-col">
            <SelectInput
              name="estado"
              value={formData.estado}
              onChange={handleSelectChange}
              placeholder="Seleccione estado"
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
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="********"
              />
            </div>
          )}

          {/* Botón Guardar (col-span 3) */}
          <div className="col-span-1 md:col-span-3 mt-4 flex justify-center">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-[260px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg transition text-lg font-semibold shadow-md hover:shadow-lg"
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
        message="Funcionario actualizado con éxito"
      />
      <ModalError
        isOpen={modalErrorOpen}
        onClose={() => setModalErrorOpen(false)}
        message={modalMessage}
      />
      <ModalAdvert
        isOpen={modalAdvertOpen}
        message="Estás a punto de actualizar los datos del funcionario. ¿Deseas continuar?"
        onConfirm={handleSubmit}
        onClose={() => setModalAdvertOpen(false)}
      />
    </div>
  );
};

export default EditarFuncionario;