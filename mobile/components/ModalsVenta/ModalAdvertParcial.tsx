import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ModalAdvertParcialProps {
  isOpen: boolean;
  onClose: () => void;
  onReplace: () => void;
  onSum: () => void;
  nombreProducto: string;
  cantidadExistente: number;
  cantidadParcial: number;
}

const ModalAdvertParcial: React.FC<ModalAdvertParcialProps> = ({
  isOpen,
  onClose,
  onReplace,
  onSum,
  nombreProducto,
  cantidadExistente,
  cantidadParcial,
}) => {
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
            <Ionicons name="warning" size={24} color="#dc2626" />
            <Text className="text-xl font-bold text-red-600">Producto ya agregado</Text>
          </View>

          {/* Mensaje principal */}
          <Text className="mb-4 text-gray-700 text-base leading-6">
            El producto <Text className="font-bold text-gray-900">{nombreProducto}</Text> ya fue agregado con una cantidad de{' '}
            <Text className="font-bold text-gray-900">{cantidadExistente}</Text> unidades.
            Has ingresado una nueva cantidad parcial de{' '}
            <Text className="font-bold text-gray-900">{cantidadParcial}</Text> unidades.
          </Text>

          <Text className="mb-4 text-sm text-gray-600 font-medium">
            ¿Qué desea hacer con esta nueva cantidad parcial?
          </Text>

          {/* Botones de acción */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={onReplace}
              className="bg-amber-400 active:bg-amber-500 rounded-xl py-3.5 flex-row items-center justify-center gap-2"
            >
              <Ionicons name="refresh" size={20} color="#000" />
              <Text className="text-black font-semibold text-base">Reemplazar cantidad existente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSum}
              className="bg-blue-600 active:bg-blue-700 rounded-xl py-3.5 flex-row items-center justify-center gap-2"
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text className="text-white font-semibold text-base">Sumar a cantidad existente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-300 active:bg-gray-400 rounded-xl py-3.5 flex-row items-center justify-center gap-2"
            >
              <Ionicons name="close" size={20} color="#000" />
              <Text className="text-black font-semibold text-base">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalAdvertParcial;