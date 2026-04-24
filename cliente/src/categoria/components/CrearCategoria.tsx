'use client';

import { useState } from 'react';
import ModalSuccess from '../../components/ModalSuccess';
import { createCategory } from '../../services/categorias';
import ModalError from '../../components/ModalSuccess';
import { styleButton } from '../../proveedor/utils/utils';
import { renderInput } from '../../clientes/utils/utils';

interface CrearCategoriaProps {
    onSuccess: () => void;
    onClose: () => void;
}

const CrearCategoria = ({ onClose, onSuccess }: CrearCategoriaProps) => {
    const initialForm = {
        categoria: '',
    };
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
            await createCategory(formData);
            setSuccessModalOpen(true);
            setFormData(initialForm);
            onSuccess();
        } catch (error: any) {
            console.error(error);
            setErrorMessage(' ' + error.response.data.error);
            setErrorModalOpen(true);
        }
    };

    const handleSuccessClose = () => {
        setSuccessModalOpen(false);
        onClose();
    };

    return (
        <div className="flex items-center justify-center px-4 border border-blue-300 dark:border-gray-600 rounded-lg shadow-lg">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full">
                <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-8">
                    Crear Categorias
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {renderInput('categoria', 'Nombre de categoría', formData.categoria, handleChange)}
                    <button
                        type="submit"
                        className={styleButton}
                    >
                        Guardar Categoria
                    </button>

                </form>
            </div>
            <ModalSuccess
                isOpen={successModalOpen}
                onClose={handleSuccessClose}
                message="Categoria creada con éxito"
            />
            <ModalError
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                message={errorMessage}
            />
        </div>

    );
};

export default CrearCategoria;
