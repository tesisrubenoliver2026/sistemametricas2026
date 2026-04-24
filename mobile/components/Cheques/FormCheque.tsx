import React, { type FC, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface Props {
    onClose: () => void;
    datosCheque: any;
    setDatosCheque: (data: any) => void;
}

const FormCheque: FC<Props> = ({ onClose, datosCheque, setDatosCheque }) => {
    const [activeField, setActiveField] = useState<string | null>(null);
    
    const handleChange = (name: string, value: string) => {
        setDatosCheque((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    const fields = [
        { label: 'Banco', name: 'banco', type: 'default' as const, placeholder: 'Ingrese el nombre del banco' },
        { label: 'Nro. Cheque', name: 'nro_cheque', type: 'default' as const, placeholder: 'Ingrese el número de cheque' },
        { label: 'Monto', name: 'monto', type: 'numeric' as const, placeholder: '0' },
        { label: 'Fecha Emisión', name: 'fecha_emision', type: 'default' as const, placeholder: 'YYYY-MM-DD' },
        { label: 'Fecha Vencimiento', name: 'fecha_vencimiento', type: 'default' as const, placeholder: 'YYYY-MM-DD' },
        { label: 'Titular', name: 'titular', type: 'default' as const, placeholder: 'Nombre del titular' },
    ];

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView 
                className="flex-1 p-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Header */}
                <View className="mb-6">
                    <View className="flex-row items-center gap-3 mb-2">
                        <View className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
                            <Text className="text-white text-lg">🏦</Text>
                        </View>
                        <Text className="text-2xl font-bold text-gray-800">Datos del Cheque</Text>
                    </View>
                    <Text className="text-gray-600 text-base">
                        Complete la información del cheque
                    </Text>
                </View>

                {/* Formulario */}
                <View className="space-y-5">
                    {fields.map(({ label, name, type, placeholder }) => (
                        <View key={name} className="space-y-2">
                            <Text className="text-sm font-medium text-gray-700">
                                {label}
                            </Text>
                            <TextInput
                                value={datosCheque[name] || ''}
                                onChangeText={(value) => handleChange(name, value)}
                                placeholder={placeholder}
                                keyboardType={type}
                                className={`w-full border-2 ${
                                    activeField === name ? 'border-blue-500' : 'border-gray-300'
                                } px-4 py-3 rounded-xl bg-white`}
                                onFocus={() => setActiveField(name)}
                                onBlur={() => setActiveField(null)}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    ))}
                </View>

                {/* Botones de acción */}
                <View className="flex-row gap-3 mt-8">
                    <TouchableOpacity
                        onPress={onClose}
                        className="flex-1 bg-gray-100 active:bg-gray-200 px-6 py-4 rounded-xl"
                    >
                        <Text className="text-gray-700 font-semibold text-center text-base">
                            Cancelar
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={onClose}
                        className="flex-1 bg-blue-500 active:bg-blue-600 px-6 py-4 rounded-xl shadow-sm"
                    >
                        <Text className="text-white font-semibold text-center text-base">
                            ✅ Confirmar
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Información adicional */}
                <View className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <View className="flex-row items-start gap-2">
                        <Text className="text-blue-500 text-lg">💡</Text>
                        <View className="flex-1">
                            <Text className="text-blue-800 font-medium text-sm">
                                Información importante
                            </Text>
                            <Text className="text-blue-600 text-xs mt-1">
                                Verifique que todos los datos del cheque sean correctos antes de confirmar.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default FormCheque;