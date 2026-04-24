'use client';

import { useState } from 'react';
import ModalSuccess from '../../components/ModalSuccess';
import { createClient } from '../../services/cliente';
import ModalError from '../../components/ModalSuccess';
import { initialFormCliente, renderInput, selectFieldsConfig } from '../utils/utils';
import SelectInput from './SelectInput';

interface CrearClienteProps {
    onSuccess?: () => void;
    onClose?: () => void;
}

const CrearCliente = ({ onSuccess, onClose }: CrearClienteProps) => {
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState(initialFormCliente);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createClient(formData);
            setSuccessModalOpen(true);
            setFormData(initialFormCliente);
            onSuccess && onSuccess();
        } catch (error: any) {
            console.error(error);
            setErrorMessage('  ' + (error.response?.data?.error || 'Error desconocido'));
            setErrorModalOpen(true);
        }
    };

    const handleSuccessClose = () => {
        setSuccessModalOpen(false);
        onClose && onClose();
    };


    const styleButton = "w-[50%] bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition";

    return (
        <div className="flex items-center justify-center px-4 border border-blue-300 dark:border-gray-600 rounded-lg shadow-lg">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full">
                <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8">
                    Crear Cliente
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="flex flex-wrap gap-4">

                        <div className="w-full md:w-[48%]">
                            {renderInput('nombre', 'Nombre', formData.nombre, handleChange)}
                        </div>
                        <div className="w-full md:w-[48%]">
                            {renderInput('apellido', 'Apellido', formData.apellido, handleChange)}
                        </div>

                        <div className="w-full md:w-[48%]">
                            {renderInput('numDocumento', 'Nro. Documento', formData.numDocumento, handleChange)}
                        </div>
                        <div className="w-full md:w-[48%]">
                            {renderInput('telefono', 'Teléfono', formData.telefono, handleChange)}
                        </div>
                        <div className="w-full md:w-[48%]">
                            {renderInput('direccion', 'Dirección', formData.direccion, handleChange)}
                        </div>
                        <div className="w-full md:w-[48%]">
                            {renderInput('descripcion', 'Descripción', formData.descripcion, handleChange)}
                        </div>

                        {selectFieldsConfig.map((field, idx) => (
                            <div key={idx} className="w-full md:w-[48%]">
                                <SelectInput
                                    name={field.name}
                                    value={formData[field.name as keyof typeof formData]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    options={field.options}
                                />
                            </div>
                        ))}
                    </div>
                    <div className='flex justify-center'>
                        <button
                            type="submit"
                            className={styleButton}
                        >
                            Guardar Cliente
                        </button>
                    </div>
                </form>
            </div>

            <ModalSuccess
                isOpen={successModalOpen}
                onClose={handleSuccessClose}
                message="Cliente creado con éxito"
            />
            <ModalError
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                message={errorMessage}
            />
        </div>
    );
};

export default CrearCliente;
