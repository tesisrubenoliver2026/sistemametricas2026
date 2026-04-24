import { Modal, View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';

interface ModalConfirmarProductosProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productos: any[];
}

const ModalConfirmarProductos = ({ isOpen, onClose, onConfirm, productos }: ModalConfirmarProductosProps) => {
  const renderProductoItem = ({ item: p, index }: { item: any; index: number }) => (
    <View className={`flex-row border-b border-gray-200 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
      <Text className="flex-1 px-4 text-sm text-gray-800">{p.nombre_producto}</Text>
      <Text className="flex-1 px-4 text-sm text-gray-800 text-center">{p.unidad_medida}</Text>
      <Text className="flex-1 px-4 text-sm text-gray-800 text-center truncate">{p.cod_barra}</Text>
      <Text className="flex-1 px-4 text-sm text-gray-800 text-center">{p.cantidad}</Text>
    </View>
  );

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Confirmar carga de productos
          </Text>

          <View className="max-h-60 mb-4 border border-gray-200 rounded-lg">
            {/* Header de la tabla */}
            <View className="flex-row bg-gray-100 border-b border-gray-200 py-2">
              <Text className="flex-1 px-4 text-sm font-medium text-gray-700">Producto</Text>
              <Text className="flex-1 px-4 text-sm font-medium text-gray-700 text-center">Unidad</Text>
              <Text className="flex-1 px-4 text-sm font-medium text-gray-700 text-center">Cod_Barra</Text>
              <Text className="flex-1 px-4 text-sm font-medium text-gray-700 text-center">Cantidad</Text>
            </View>

            {/* Body de la tabla */}
            {productos.length === 0 ? (
              <View className="py-4">
                <Text className="text-center text-gray-500 text-sm">No hay productos</Text>
              </View>
            ) : (
              <FlatList
                data={productos}
                renderItem={renderProductoItem}
                keyExtractor={(_, index) => index.toString()}
                scrollEnabled={true}
                nestedScrollEnabled={true}
              />
            )}
          </View>

          <View className="flex-row justify-end gap-4 mt-6">
            <TouchableOpacity
              onPress={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg"
            >
              <Text className="text-gray-800 font-medium">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className="px-4 py-2 bg-green-600 rounded-lg"
            >
              <Text className="text-white font-medium">Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalConfirmarProductos;
