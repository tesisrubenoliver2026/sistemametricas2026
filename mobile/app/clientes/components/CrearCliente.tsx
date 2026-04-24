import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ModalSuccess from '../../../components/ModalSuccess';
import ModalError from '../../../components/ModalError';
import { initialFormCliente, selectFieldsConfig } from '../../../utils/utils';
import api from '../../../lib/axiosConfig';
import SelectInput from './SelectInput';

interface CrearClienteProps {
    onSuccess?: () => void;
    onClose?: () => void;
}

export default function CrearCliente({ onSuccess, onClose }: CrearClienteProps) {
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState(initialFormCliente);
    const [loading, setLoading] = useState(false);

    const handleChange = (name: string, value: string) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async () => {
        // Validación básica
        if (!formData.nombre || !formData.apellido || !formData.numDocumento || !formData.telefono) {
            Alert.alert('Error', 'Por favor complete todos los campos obligatorios');
            return;
        }

        try {
            setLoading(true);
            await api.post('/clientes', formData);
            setSuccessModalOpen(true);
            setFormData(initialFormCliente);
            setTimeout(() => {
                setSuccessModalOpen(false);
                onSuccess && onSuccess();
                onClose && onClose();
            }, 1500);
        } catch (error: any) {
            console.error(error);
            setErrorMessage(error.response?.data?.error || 'Error al crear cliente');
            setErrorModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (name: string, placeholder: string, icon: keyof typeof Ionicons.glyphMap) => (
        <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">{placeholder}</Text>
            <View className="relative">
                <View className="absolute left-4 top-3.5 z-10">
                    <Ionicons name={icon} size={20} color="#64748b" />
                </View>
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                    value={formData[name as keyof typeof formData] as string}
                    onChangeText={(value) => handleChange(name, value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-12 py-3.5 text-gray-800"
                />
            </View>
        </View>
    );

    return (
        <View className="flex-1 ">
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View className="mb-6">
                    <View className="flex-row items-center gap-3 mb-2">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                            <Ionicons name="person-add" size={22} color="#3b82f6" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-800">Crear Cliente</Text>
                    </View>
                    <Text className="text-gray-500 ml-1">Complete los datos del nuevo cliente</Text>
                </View>

                {/* Formulario */}
                <View className="gap-2">
                    {renderInput('nombre', 'Nombre', 'person-outline')}
                    {renderInput('apellido', 'Apellido', 'person-outline')}
                    {renderInput('numDocumento', 'Nro. Documento', 'card-outline')}
                    {renderInput('telefono', 'Teléfono', 'call-outline')}
                    {renderInput('direccion', 'Dirección', 'location-outline')}
                    {renderInput('descripcion', 'Descripción', 'document-text-outline')}

                    {/* Select Fields */}
                    {selectFieldsConfig.map((field, idx) => (
                        <View key={idx} className="mb-4">
                            <Text className="text-gray-700 font-semibold mb-2 ml-1">{field.placeholder}</Text>
                            <SelectInput
                                name={field.name}
                                value={formData[field.name as keyof typeof formData] as string}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                options={field.options}
                            />
                        </View>
                    ))}
                </View>

                {/* Botones */}
                <View className="flex-row gap-3 mt-6 mb-4">
                    {onClose && (
                        <Pressable
                            onPress={onClose}
                            className="flex-1 active:opacity-70"
                        >
                            <View className="bg-gray-200 rounded-xl py-3.5 flex-row items-center justify-center gap-2">
                                <Ionicons name="close" size={20} color="#64748b" />
                                <Text className="text-gray-700 font-bold">Cancelar</Text>
                            </View>
                        </Pressable>
                    )}
                    <Pressable
                        onPress={handleSubmit}
                        disabled={loading}
                        className="flex-1 active:opacity-70"
                    >
                        <LinearGradient
                            colors={loading ? ['#94a3b8', '#64748b'] : ['#3b82f6', '#2563eb']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="rounded-xl py-3.5 flex-row items-center justify-center gap-2"
                        >
                            <Ionicons name={loading ? "hourglass" : "checkmark-circle"} size={20} color="#fff" />
                            <Text className="text-white font-bold">
                                {loading ? 'Guardando...' : 'Guardar Cliente'}
                            </Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Modales */}
            <ModalSuccess
                isOpen={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                message="Cliente creado con éxito"
            />
            <ModalError
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                message={errorMessage}
            />
        </View>
    );
}
