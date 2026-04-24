import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getCategoriaById, updateCategoria } from '../../../services/categoria';

interface EditarCategoriaProps {
    id: number | string;
    onSuccess?: () => void;
    onClose?: () => void;
}

const initialForm = {
    categoria: '',
    estado: 'activo',
};

export default function EditarCategoria({ id, onSuccess, onClose }: EditarCategoriaProps) {
    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (id) {
            const fetchCategoria = async () => {
                try {
                    setLoadingData(true);
                    const res = await getCategoriaById(id);
                    setFormData(res.data);
                } catch (error) {
                    console.error('Error al cargar datos de la categoría', error);
                    Alert.alert('Error', 'No se pudieron cargar los datos de la categoría');
                } finally {
                    setLoadingData(false);
                }
            };
            fetchCategoria();
        }
    }, [id]);

    const handleSubmit = async () => {
        if (!formData.categoria.trim()) {
            Alert.alert('Error', 'El nombre de la categoría es requerido');
            return;
        }

        try {
            setLoading(true);
            await updateCategoria(id, formData);
            Alert.alert('Éxito', 'Categoría actualizada correctamente');

            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error: any) {
            console.error('Error al actualizar categoría', error);
            const errorMessage = error.response?.data?.error || 'No se pudo actualizar la categoría';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-gray-500 mt-4">Cargando datos...</Text>
            </View>
        );
    }

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
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                            <Ionicons name="create" size={22} color="#f59e0b" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-800">Editar Categoría</Text>
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
                                placeholder="Nombre de categoría"
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
                            colors={loading ? ['#94a3b8', '#64748b'] : ['#f59e0b', '#d97706']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="rounded-xl py-3.5 flex-row items-center justify-center gap-2"
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Ionicons name="save" size={20} color="#fff" />
                            )}
                            <Text className="text-white font-bold">
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
