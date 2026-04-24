import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { FC } from 'react';

interface Props {
  onSeleccionarProducto: () => void;
  onCrearProducto: () => void;
}

const BotonesAcciones: FC<Props> = ({ onSeleccionarProducto, onCrearProducto }) => (
  <View className="flex-col justify-between items-center ">
    <Text className="text-xl font-semibold text-blue-700">Detalles de Productos</Text>
    <View className="flex-row gap-2">
      <TouchableOpacity
        onPress={onSeleccionarProducto}
        className="bg-blue-600 active:bg-blue-700 px-4 py-3 rounded-lg shadow"
      >
        <Text className="text-white font-medium">Seleccionar producto</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default BotonesAcciones;