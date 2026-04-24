import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { CheckCircleIcon, ExclamationCircleIcon } from 'react-native-heroicons/solid';
import { crearTipoEgreso } from '../../../../services/egreso';

interface CrearTiposEgresoProps {
  onSuccess?: () => void;
  onClose: () => void;
}

const CrearTiposEgreso = ({ onSuccess, onClose }: CrearTiposEgresoProps) => {
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleCrear = async () => {
    setMensaje('');
    setError('');

    if (!descripcion.trim()) {
      setError('La descripción es obligatoria.');
      return;
    }

    try {
      const res = await crearTipoEgreso(descripcion);

      setDescripcion('');
      setMensaje(res.data.message || 'Tipo de egreso creado correctamente.');
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear tipo de egreso.');
    }
  };

  return (
    <View className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 max-w-md mx-auto">
      <View className="flex-row items-center gap-2 mb-4">
        <Text className="text-2xl">💸</Text>
        <Text className="text-2xl font-semibold text-gray-800">Crear Tipo de Egreso</Text>
      </View>

      <View className="mb-4">
        <Text className="block text-sm font-medium text-gray-700 mb-1">
          <Text>Descripción </Text>
          <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Ej: Compra contado, Pago deuda, etc."
          placeholderTextColor="#9CA3AF"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 shadow-sm"
        />
      </View>

      <TouchableOpacity
        className="w-full bg-red-600 py-2 rounded-lg flex-row justify-center items-center"
        onPress={handleCrear}
      >
        <Text className="text-white font-medium">Crear</Text>
      </TouchableOpacity>

      {mensaje && (
        <View className="mt-4 flex-row items-center gap-2">
          <CheckCircleIcon size={20} color="#059669" />
          <Text className="text-green-600 text-sm">{mensaje}</Text>
        </View>
      )}

      {error && (
        <View className="mt-4 flex-row items-center gap-2">
          <ExclamationCircleIcon size={20} color="#DC2626" />
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      )}
    </View>
  );
};

export default CrearTiposEgreso;