import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createDatosBancarios } from '../../../services/datosBancarios';

interface CrearDatosBancariosProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const initialForm = {
  banco_origen: '',
  numero_cuenta: '',
  tipo_cuenta: '',
  titular_cuenta: '',
  observacion: ''
};

export default function CrearDatosBancarios({ onSuccess, onClose }: CrearDatosBancariosProps) {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.banco_origen.trim() || !formData.numero_cuenta.trim()) {
      Alert.alert('Error', 'El banco origen y número de cuenta son requeridos');
      return;
    }

    try {
      setLoading(true);
      await createDatosBancarios(formData);
      Alert.alert('Éxito', 'Datos bancarios creados correctamente');
      setFormData(initialForm);
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || 'No se pudo crear el dato bancario';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-green-100">
            <Ionicons name="card" size={22} color="#10b981" />
          </View>
          <Text className="text-2xl font-bold text-gray-800">Crear Datos Bancarios</Text>
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
        {/* Banco Origen */}
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">Banco Origen *</Text>
          <TextInput
            placeholder="Banco Origen"
            placeholderTextColor="#94a3b8"
            value={formData.banco_origen}
            onChangeText={(text) => setFormData({ ...formData, banco_origen: text })}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
          />
        </View>

        {/* Número de Cuenta */}
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">Número de Cuenta *</Text>
          <TextInput
            placeholder="Número de Cuenta"
            placeholderTextColor="#94a3b8"
            value={formData.numero_cuenta}
            onChangeText={(text) => setFormData({ ...formData, numero_cuenta: text })}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
          />
        </View>

        {/* Tipo de Cuenta */}
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">Tipo de Cuenta</Text>
          <TextInput
            placeholder="Tipo de Cuenta"
            placeholderTextColor="#94a3b8"
            value={formData.tipo_cuenta}
            onChangeText={(text) => setFormData({ ...formData, tipo_cuenta: text })}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
          />
        </View>

        {/* Titular de la Cuenta */}
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">Titular de la Cuenta</Text>
          <TextInput
            placeholder="Titular de la Cuenta"
            placeholderTextColor="#94a3b8"
            value={formData.titular_cuenta}
            onChangeText={(text) => setFormData({ ...formData, titular_cuenta: text })}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
          />
        </View>

        {/* Observación */}
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">Observación (opcional)</Text>
          <TextInput
            placeholder="Observación"
            placeholderTextColor="#94a3b8"
            value={formData.observacion}
            onChangeText={(text) => setFormData({ ...formData, observacion: text })}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
          />
        </View>
      </View>

      {/* Botones */}
      <View className="flex-row gap-3 mt-6 mb-4">
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
            colors={loading ? ['#94a3b8', '#64748b'] : ['#10b981', '#059669']}
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
    </View>
  );
}
