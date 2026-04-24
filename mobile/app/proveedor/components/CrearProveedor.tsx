import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { createProveedor } from '../../../services/proveedor';
import ModalSuccess from '../../../components/ModalSuccess';
import ModalError from '../../../components/ModalError';

interface CrearProveedorProps {
    onSuccess?: () => void;
    onClose?: () => void;
}

const initialForm = {
    nombre: '',
    telefono: '',
    direccion: '',
    ruc: '',
    razon: '',
};

const CrearProveedor = ({ onSuccess, onClose }: CrearProveedorProps) => {
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState(initialForm);

    const handleChange = (name: string, value: string) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async () => {
        try {
            await createProveedor(formData);
            onSuccess?.();
            onClose?.();
            setSuccessModalOpen(true);
            setFormData(initialForm);
        } catch (error: any) {
            console.error(error);
            setErrorMessage('❌' + error.response?.data?.error || 'Error al crear proveedor');
            setErrorModalOpen(true);
        }
    };

    const renderInput = (name: keyof typeof initialForm, placeholder: string) => (
        <TextInput
            key={name}
            placeholder={placeholder}
            value={formData[name]}
            onChangeText={(value) => handleChange(name, value)}
            className="w-full border border-gray-300 px-4 py-3 rounded-lg"
        />
    );

    return (
        <View className="flex-1 items-center justify-center p-4">
            <View className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-[500px]">
                <Text className="text-2xl font-bold text-center text-blue-800 mb-6">
                    🧾 Crear Proveedor
                </Text>

                <View className="gap-4">
                    {renderInput('nombre', 'Nombre')}
                    {renderInput('telefono', 'Teléfono')}
                    {renderInput('direccion', 'Dirección')}
                    {renderInput('ruc', 'RUC')}
                    {renderInput('razon', 'Razón Social')}

                    <Pressable
                        onPress={handleSubmit}
                        className="bg-blue-800 p-4 rounded-lg items-center"
                    >
                        <Text className="text-white font-bold text-base">
                            Guardar Proveedor
                        </Text>
                    </Pressable>
                </View>
            </View>

            <ModalSuccess
                isOpen={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                message="Proveedor creado con éxito"
            />
            <ModalError
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                message={errorMessage}
            />
        </View>
    );
};

export default CrearProveedor;