'use client';

import { useState } from 'react';
import { initialForm, styleButton } from '../utils/utils';
import { createProveedor } from '../../services/proveedor';
import ModalSuccess from '../../components/ModalSuccess';
import ModalError from '../../components/ModalError';
import { renderInput } from '../../clientes/utils/utils';

interface CrearProveedorProps {
    onSuccess?: () => void;
    onClose?: () => void;
}

const CrearProveedor = ({ onSuccess, onClose }: CrearProveedorProps) => {
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState(initialForm);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createProveedor(formData);
            setSuccessModalOpen(true);
            setFormData(initialForm);
            onSuccess?.();
        } catch (error: any) {
            console.error(error);
            setErrorMessage(' ' + error.response?.data?.error || 'Error al crear proveedor');
            setErrorModalOpen(true);
        }
    };

    const handleSuccessClose = () => {
        setSuccessModalOpen(false);
        onClose?.();
    };



    return (
       <div className="flex items-center justify-center px-4 border border-blue-300 dark:border-gray-600 rounded-lg shadow-lg">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full">
                <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8">
                    Crear Proveedor
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {renderInput('nombre', 'Nombre', formData.nombre, handleChange)}
                    {renderInput('telefono', 'Teléfono', formData.telefono, handleChange)}
                    {renderInput('direccion', 'Dirección', formData.direccion, handleChange)}
                    {renderInput('ruc', 'RUC', formData.ruc, handleChange)}
                    {renderInput('razon', 'Razón Social', formData.razon, handleChange)}

                    <button
                        type="submit"
                        className={styleButton}
                    >
                        Guardar Proveedor
                    </button>
                </form>
            </div>
            <ModalSuccess
                isOpen={successModalOpen}
                onClose={handleSuccessClose}
                message="Proveedor creado con éxito"
            />
            <ModalError
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                message={errorMessage}
            />
        </div>

    );
};

export default CrearProveedor;
