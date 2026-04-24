import type { FC } from "react";
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  onSeleccionarProducto: () => void;
  onCrearProducto: () => void;
}

const BotonesAcciones: FC<Props> = ({ onSeleccionarProducto }) => (
  <View className="flex-col justify-between items-center">
    <Text className="text-xl font-semibold text-blue-700">Detalles de Productos</Text>
    <View className="flex-row gap-2">
      <TouchableOpacity
        onPress={onSeleccionarProducto}
        className="bg-blue-600 px-4 py-2 rounded-lg shadow"
      >
        <Text className="text-white font-medium">Seleccionar producto</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default BotonesAcciones;
