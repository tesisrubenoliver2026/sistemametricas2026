import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Package, X, Calendar, FileText, User } from 'lucide-react-native';

interface Detalle {
  iddetalle: number;
  nombre_producto: string;
  cantidad: string;
  precio: string;
  sub_total: string;
  unidad_medida: string;
  iva?: string;
  stock_restante?: string;
}

interface Compra {
  idcompra: number;
  nombre: string;
  nro_factura: string;
  tipo: string;
  total: string;
  fecha: string;
  estado: string;
  observacion?: string;
  cajero_nombre?: string;
  descuento?: string;
  detalles: Detalle[];
}

interface ModalDetalleCompraProps {
  compra: Compra | null;
  isOpen: boolean;
  onClose: () => void;
}

const ModalDetalleCompra: React.FC<ModalDetalleCompraProps> = ({ compra, isOpen, onClose }) => {
  if (!isOpen || !compra) return null;

  const esInventarioInicial = compra.observacion?.toLowerCase() === 'inventario inicial';
  const esCompraVacia = parseFloat(compra.total || '0') === 0;

  const renderDetalleItem = ({ item: d, index }: { item: Detalle; index: number }) => (
    <View className={`rounded-lg p-4 mb-2 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
      <Text className="font-semibold text-gray-800 mb-3">{d.nombre_producto}</Text>
      <View className="flex-row flex-wrap gap-3">
        <View className="flex-1 min-w-[100px]">
          <Text className="text-xs text-gray-500 mb-1">Cantidad</Text>
          <Text className="font-semibold text-gray-800">
            {parseFloat(d.cantidad).toFixed(2)} {d.unidad_medida}
          </Text>
        </View>
        <View className="flex-1 min-w-[100px]">
          <Text className="text-xs text-gray-500 mb-1">Precio Unit.</Text>
          <Text className="font-semibold text-gray-700">
            ₲ {parseInt(d.precio).toLocaleString("es-PY")}
          </Text>
        </View>
        <View className="min-w-[60px]">
          <Text className="text-xs text-gray-500 mb-1">IVA</Text>
          <View className="bg-blue-100 px-2 py-1 rounded self-start">
            <Text className="text-xs text-blue-700 font-semibold">{d.iva || '0'}%</Text>
          </View>
        </View>
        <View className="flex-1 min-w-[100px]">
          <Text className="text-xs text-gray-500 mb-1">Subtotal</Text>
          <Text className="font-bold text-blue-600">
            ₲ {parseInt(d.sub_total).toLocaleString("es-PY")}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 bg-white rounded-t-3xl mt-16">
          {/* Header */}
          <View className="bg-blue-600 px-6 py-4 rounded-t-3xl flex-row justify-between items-center">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="bg-white/20 p-2 rounded-lg">
                <Package size={24} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-white">Detalle de Compra #{compra.idcompra}</Text>
                {esInventarioInicial && (
                  <View className="bg-yellow-400 px-2 py-0.5 rounded-full self-start mt-1">
                    <Text className="text-xs text-yellow-900 font-medium">Inventario Inicial</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 bg-white/20 rounded-lg"
            >
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 p-6">
            {/* Info Cards */}
            <View className="flex-row flex-wrap gap-3 mb-6">
              <View className="flex-1 min-w-[140px] bg-blue-50 rounded-xl p-4 border border-blue-200">
                <View className="flex-row items-center gap-2 mb-2">
                  <User size={18} color="#2563eb" />
                  <Text className="text-xs font-medium text-blue-600">Proveedor</Text>
                </View>
                <Text className="font-bold text-gray-800">{compra.nombre}</Text>
              </View>

              <View className="flex-1 min-w-[140px] bg-purple-50 rounded-xl p-4 border border-purple-200">
                <View className="flex-row items-center gap-2 mb-2">
                  <FileText size={18} color="#9333ea" />
                  <Text className="text-xs font-medium text-purple-600">Factura</Text>
                </View>
                <Text className="font-mono font-bold text-gray-800">{compra.nro_factura}</Text>
              </View>

              <View className="flex-1 min-w-[140px] bg-green-50 rounded-xl p-4 border border-green-200">
                <View className="flex-row items-center gap-2 mb-2">
                  <Calendar size={18} color="#16a34a" />
                  <Text className="text-xs font-medium text-green-600">Fecha</Text>
                </View>
                <Text className="font-semibold text-gray-800">
                  {new Date(compra.fecha).toLocaleDateString('es-PY')}
                </Text>
              </View>

              <View className="flex-1 min-w-[140px] bg-amber-50 rounded-xl p-4 border border-amber-200">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="person" size={18} color="#d97706" />
                  <Text className="text-xs font-medium text-amber-600">Cajero</Text>
                </View>
                <Text className="font-semibold text-gray-800 text-sm">
                  {compra.cajero_nombre || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Badges */}
            <View className="flex-row flex-wrap gap-2 mb-6">
              <View className={`px-3 py-1.5 rounded-full ${
                compra.tipo.toLowerCase() === 'contado' ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                <Text className={`text-sm font-medium ${
                  compra.tipo.toLowerCase() === 'contado' ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {compra.tipo === 'contado' ? 'Contado' : 'Crédito'}
                </Text>
              </View>
              <View className={`px-3 py-1.5 rounded-full ${
                compra.estado === 'pagado' ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                <Text className={`text-sm font-medium ${
                  compra.estado === 'pagado' ? 'text-emerald-800' : 'text-red-800'
                }`}>
                  {compra.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                </Text>
              </View>
              {esCompraVacia && (
                <View className="px-3 py-1.5 rounded-full bg-gray-100">
                  <Text className="text-sm font-medium text-gray-600">Sin movimiento</Text>
                </View>
              )}
            </View>

            {/* Observación */}
            {compra.observacion && (
              <View className={`mb-6 p-4 rounded-xl ${
                esInventarioInicial
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <Text className="text-sm">
                  <Text className="font-semibold text-gray-700">Observación: </Text>
                  <Text className="text-gray-600">{compra.observacion}</Text>
                </Text>
              </View>
            )}

            {/* Lista de productos */}
            <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <View className="flex-row items-center gap-2 mb-4">
                <Package size={20} color="#2563eb" />
                <Text className="font-semibold text-gray-800">
                  Productos ({compra.detalles.length})
                </Text>
              </View>

              <FlatList
                data={compra.detalles}
                renderItem={renderDetalleItem}
                keyExtractor={(item) => item.iddetalle.toString()}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>

          {/* Footer con total */}
          <View className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-sm text-gray-600">
                  {compra.detalles.length} producto{compra.detalles.length !== 1 ? 's' : ''} en total
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-sm text-gray-600 mb-1">Total de la compra</Text>
                <Text className={`text-2xl font-bold ${esCompraVacia ? 'text-gray-400' : 'text-gray-800'}`}>
                  ₲ {parseInt(compra.total).toLocaleString("es-PY")}
                </Text>
                {parseFloat(compra.descuento || '0') > 0 && (
                  <Text className="text-xs text-green-600">
                    Descuento: ₲ {parseInt(compra.descuento || '0').toLocaleString("es-PY")}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalDetalleCompra;
