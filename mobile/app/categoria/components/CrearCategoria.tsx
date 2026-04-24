import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createCategoria } from '../../../services/categoria';

interface CrearCategoriaProps {
    onSuccess: () => void;
    onClose: () => void;
}

export default function CrearCategoria({ onClose, onSuccess }: CrearCategoriaProps) {
    const initialForm = {
        categoria: '',
    };

    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!formData.categoria.trim()) {
            Alert.alert('Error', 'El nombre de la categoría es requerido');
            return;
        }

        try {
            setLoading(true);
            await createCategoria(formData);
            Alert.alert('Éxito', 'Categoría creada correctamente');
            setFormData(initialForm);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.error || 'No se pudo crear la categoría';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center gap-3">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                            <Ionicons name="pricetags" size={22} color="#3b82f6" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-800">Crear Categoría</Text>
                    </View>
                    <Pressable
                        onPress={onClose}
                        className="h-10 w-10 items-center justify-center rounded-xl bg-gray-200 active:opacity-70"
                    >
                        <Ionicons name="close" size={20} color="#64748b" />
                    </Pressable>
                </View>

                {/* Form */}
                <View className="gap-4">
                    {/* Campo Categoría */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                            Nombre de la Categoría
                        </Text>
                        <View className="relative">
                            <View className="absolute left-3 top-3.5 z-10">
                                <Ionicons name="pricetag-outline" size={20} color="#64748b" />
                            </View>
                            <TextInput
                                placeholder="Ej: Electrónica, Alimentos, etc."
                                placeholderTextColor="#94a3b8"
                                value={formData.categoria}
                                onChangeText={(text) => setFormData({ ...formData, categoria: text })}
                                className="bg-gray-50 border border-gray-200 rounded-xl px-12 py-3.5 text-gray-800"
                            />
                        </View>
                    </View>
                </View>

                {/* Botones */}
                <View className="flex-row gap-3 mt-6">
                    <Pressable
                        onPress={onClose}
                        className="flex-1 active:opacity-70"
                        disabled={loading}
                    >
                        <View className="bg-gray-200 rounded-xl py-3.5 flex-row items-center justify-center gap-2">
                            <Ionicons name="close-circle" size={20} color="#64748b" />
                            <Text className="text-gray-700 font-bold">Cancelar</Text>
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={handleSubmit}
                        className="flex-1 active:opacity-70"
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={loading ? ['#94a3b8', '#64748b'] : ['#3b82f6', '#2563eb']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="rounded-xl py-3.5 flex-row items-center justify-center gap-2"
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            )}
                            <Text className="text-white font-bold">
                                {loading ? 'Guardando...' : 'Guardar'}
                            </Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
