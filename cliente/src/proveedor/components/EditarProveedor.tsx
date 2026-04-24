'use client';

import { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { getProveedorById, updateProveedor } from '../../services/proveedor';
import ModalSuccess from '../../components/ModalSuccess';


interface EditarProveedorProps {
  id: number | string; 
  onSuccess?: () => void; 
  onClose?: () => void;  
}


const initialForm = {
  nombre: '',
  telefono: '',
  direccion: '',
  ruc: '',
  razon: '',
  estado: 'activo',
};

const EditarProveedor = ({ id, onSuccess, onClose }: EditarProveedorProps) => {

  const [formData, setFormData] = useState(initialForm);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      getProveedorById(id).then((res) => {
        setFormData(res.data);
      });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProveedor(id, formData);
      setSuccessModalOpen(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error al actualizar proveedor', error);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    if (onClose) onClose();
  };

  return (
    <div className="flex items-center justify-center px-4 border border-blue-300 dark:border-gray-600 rounded-lg shadow-lg ">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full">
        <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8">Editar Proveedor</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Nombre', name: 'nombre' },
            { label: 'Teléfono', name: 'telefono' },
            { label: 'Dirección', name: 'direccion' },
            { label: 'RUC', name: 'ruc' },
            { label: 'Razón Social', name: 'razon' },
          ].map(({ label, name }) => (
            <div key={name} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input
                type="text"
                name={name}
                value={formData[name as keyof typeof formData]}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={label}
              />
            </div>
          ))}

          <div className="col-span-1 md:col-span-2 mt-4">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
            >
              <FiSave className="text-xl" />
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      <ModalSuccess
        isOpen={successModalOpen}
        onClose={handleSuccessClose}
        message="Proveedor actualizado con éxito"
      />
    </div>
  );
};

export default EditarProveedor;
