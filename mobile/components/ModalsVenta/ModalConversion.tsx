import React, { type FC, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ModalAdvert from 'components/ModalAdvert';

interface ModalConversionProps {
    isOpen: boolean;
    unidadMedida: 'KG' | 'L';
    onClose: () => void;
    onConfirm: (valorConvertido: number) => void;
}

const ModalConversion: FC<ModalConversionProps> = ({ 
    isOpen, 
    unidadMedida, 
    onClose, 
    onConfirm 
}) => {
    const [advertMessage, setAdvertMessage] = useState("");
    const [valor, setValor] = useState<string>('');

    useEffect(() => { 
        console.log(valor) 
    }, [valor]);

    const handleConfirm = () => {
        const valorNumerico = parseFloat(valor);
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            setAdvertMessage('Ingrese un número válido mayor a 0');
            return;
        }

        const convertido = valorNumerico / 1000;
        console.log('Valor convertido:', convertido);
        onConfirm(Number(convertido.toFixed(3)));
        setValor('');
        onClose();
    };

    const getUnidadBase = () => {
        return unidadMedida === 'KG' ? 'gramos' : 'mililitros';
    };

    const getUnidadConvertida = () => {
        return unidadMedida === 'KG' ? 'KG' : 'L';
    };

    const getEjemplo = () => {
        return unidadMedida === 'KG' ? '1500 equivale a 1.5 KG' : '1500 equivale a 1.5 L';
    };

    return (
        <Modal
            visible={isOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black bg-opacity-40 items-center justify-center px-4">
                <View className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
                    {/* Header */}
                    <View className="flex-row items-center gap-2 mb-3">
                        <Ionicons name="calculator" size={24} color="#3b82f6" />
                        <Text className="text-xl font-bold text-gray-800">
                            Ingresar cantidad parcial
                        </Text>
                    </View>

                    {/* Descripción */}
                    <View className="mb-4">
                        <Text className="text-sm text-gray-700 mb-2 leading-5">
                            Este producto se vende por{' '}
                            <Text className="font-semibold text-gray-900">
                                {unidadMedida === 'KG' ? 'peso (KG)' : 'volumen (L)'}
                            </Text>.
                        </Text>
                        <Text className="text-sm text-gray-700 mb-2 leading-5">
                            Ingrese la cantidad en{' '}
                            <Text className="font-semibold text-gray-900">
                                {getUnidadBase()}
                            </Text>.
                        </Text>
                        <Text className="text-sm text-gray-600 italic">
                            Ejemplo: {getEjemplo()}
                        </Text>
                    </View>

                    {/* Input */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Cantidad en {getUnidadBase()}
                        </Text>
                        <TextInput
                            value={valor}
                            onChangeText={setValor}
                            placeholder={`Ej: 1500 ${getUnidadBase()}`}
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-white"
                        />
                    </View>

                    {/* Botones de acción */}
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={onClose}
                            className="flex-1 bg-gray-300 active:bg-gray-400 rounded-xl py-3.5 flex-row items-center justify-center"
                        >
                            <Text className="text-gray-800 font-semibold">Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleConfirm}
                            className="flex-1 bg-blue-600 active:bg-blue-700 rounded-xl py-3.5 flex-row items-center justify-center gap-2"
                        >
                            <Ionicons name="checkmark" size={18} color="#fff" />
                            <Text className="text-white font-semibold">Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Modal de advertencia */}
                <ModalAdvert 
                    isOpen={!!advertMessage} 
                    onClose={() => setAdvertMessage("")} 
                    message={advertMessage}
                />
            </View>
        </Modal>
    );
};

export default ModalConversion;