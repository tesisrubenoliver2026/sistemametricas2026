import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { XCircle, PackageCheck } from 'lucide-react-native';

interface Lote {
  iddetalle: number;
  idproducto: number;
  cantidad: string;
  stock_restante: number;
  precio_compra: string;
  sub_total: string;
  fecha_vencimiento: string;
  nombre_producto: string;
  unidad_medida: string;
  iva: string;
  precio_venta?: string;
}

interface ModalSeleccionarLoteProps {
  isOpen: boolean;
  setCantidadMaximo?: (cantidad: number) => void;
  onClose: () => void;
  lotes: Lote[];
  onSelect: (lote: Lote) => void;
}

const ModalSeleccionarLote: React.FC<ModalSeleccionarLoteProps> = ({
  isOpen,
  setCantidadMaximo,
  onClose,
  lotes,
  onSelect,
}) => {
  if (!isOpen) return null;
  
  console.log('Lotes disponible en tabla', lotes);

  const handleSelectLote = (lote: Lote) => {
    onSelect(lote);
    setCantidadMaximo && setCantidadMaximo(lote.stock_restante);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-50 items-center justify-center px-4">
        <View className="bg-white w-full max-w-3xl rounded-2xl p-6 shadow-xl border border-gray-200">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-2">
              <PackageCheck className="text-blue-600" size={24} />
              <Text className="text-2xl font-bold text-gray-800">
                Seleccionar lote del producto
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <XCircle size={28} color="#ef4444" />
            </TouchableOpacity>
          </View>

          {lotes.length === 0 ? (
            <View className="py-10">
              <Text className="text-gray-600 text-center">
                No hay lotes disponibles con stock.
              </Text>
            </View>
          ) : (
            <ScrollView className="max-h-[340px] border rounded-lg">
              {/* Header de la tabla */}
              <View className="bg-gray-100 rounded-t-lg border-b border-gray-200">
                <View className="flex-row py-3 px-4">
                  <View className="w-12">
                    <Text className="text-gray-600 text-xs uppercase font-bold">#</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-600 text-xs uppercase font-bold">Vencimiento</Text>
                  </View>
                  <View className="w-16">
                    <Text className="text-gray-600 text-xs uppercase font-bold">Stock</Text>
                  </View>
                  <View className="w-24">
                    <Text className="text-gray-600 text-xs uppercase font-bold">P. Compra</Text>
                  </View>
                  <View className="w-24">
                    <Text className="text-gray-600 text-xs uppercase font-bold">P. Venta</Text>
                  </View>
                  <View className="w-20">
                    <Text className="text-gray-600 text-xs uppercase font-bold text-center">Acción</Text>
                  </View>
                </View>
              </View>

              {/* Filas de la tabla */}
              {lotes.map((lote, index) => (
                <View
                  key={lote.iddetalle}
                  className={`flex-row items-center py-2 px-4 border-b border-gray-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <View className="w-12">
                    <Text className="text-gray-700 text-sm">{lote.iddetalle}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-700 text-sm">
                      {new Date(lote.fecha_vencimiento).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="w-16">
                    <Text className="text-gray-700 text-sm">{lote.stock_restante}</Text>
                  </View>
                  <View className="w-24">
                    <Text className="text-blue-700 text-sm font-semibold">
                      ₲ {parseInt(lote.precio_compra).toLocaleString()}
                    </Text>
                  </View>
                  <View className="w-24">
                    <Text className="text-green-700 text-sm font-semibold">
                      ₲ {parseInt(lote.precio_venta || '0').toLocaleString()}
                    </Text>
                  </View>
                  <View className="w-20">
                    <TouchableOpacity
                      onPress={() => handleSelectLote(lote)}
                      className="bg-blue-600 active:bg-blue-700 px-3 py-1 rounded-md"
                    >
                      <Text className="text-white text-xs text-center font-medium">
                        Seleccionar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Botón cancelar */}
          <View className="mt-6 flex-row justify-end">
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-200 active:bg-gray-300 px-5 py-2 rounded-md"
            >
              <Text className="text-gray-700 font-medium">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalSeleccionarLote;