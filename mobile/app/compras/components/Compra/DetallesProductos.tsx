import type { FC } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Trash2 } from 'lucide-react-native';

interface Props {
  detalles: any[];
  setDetalles: (data: any[]) => void;
}

const DetallesProductos: FC<Props> = ({ detalles, setDetalles }) => {
  const updateDetalle = (index: number, field: string, value: string) => {
    const updated = [...detalles];
    updated[index][field] = value;

    // Si es un producto con unidad_medida CAJA, calcular precio automáticamente
    if (updated[index].unidad_medida === 'CAJA') {
      const precioCaja = parseFloat(updated[index].precio_compra_caja || '0');
      const cantCajas = parseFloat(updated[index].cant_p_caja || '1');

      // Calcular precio unitario automáticamente
      if (cantCajas > 0) {
        updated[index].precio = (precioCaja / cantCajas).toString();
      }
    }

    setDetalles(updated);
  };

  const removeDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  if (!detalles.length) return null;

  const hayProductosCaja = detalles.some(p => p.unidad_medida === 'CAJA');

  const renderDetalleItem = ({ item: d, index: idx }: { item: any; index: number }) => {
    const subtotal = d.unidad_medida === 'CAJA'
      ? (parseFloat(d.precio_compra_caja || '0') * parseFloat(d.cantidad || '0'))
      : (parseFloat(d.precio || '0') * parseFloat(d.cantidad || '0'));

    const precioUnitario = d.unidad_medida === "CAJA"
      ? parseFloat(d.precio_compra_caja || '0') / parseFloat(d.cant_p_caja || '1')
      : parseFloat(d.precio || '0');

    return (
      <View className={`rounded-lg p-4 mb-3 border ${idx % 2 === 0 ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'}`}>
        {/* Header con nombre y botón eliminar */}
        <View className="flex-row justify-between items-start mb-3">
          <Text className="flex-1 font-semibold text-gray-800 text-base">{d.nombre_producto}</Text>
          <TouchableOpacity
            onPress={() => removeDetalle(idx)}
            className="ml-2 p-2 bg-red-100 rounded-lg"
          >
            <Trash2 size={18} color="#dc2626" />
          </TouchableOpacity>
        </View>

        {/* Grid de campos editables */}
        <View className="gap-3">
          {/* Fila 1: Cantidad y Cant por caja */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Cantidad</Text>
              <TextInput
                keyboardType="numeric"
                value={String(d.cantidad)}
                onChangeText={(text) => updateDetalle(idx, 'cantidad', text)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-center bg-white"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Cant x caja</Text>
              {d.unidad_medida === 'CAJA' ? (
                <TextInput
                  keyboardType="numeric"
                  value={String(d.cant_p_caja)}
                  onChangeText={(text) => updateDetalle(idx, 'cant_p_caja', text)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-center bg-white"
                />
              ) : (
                <View className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-100">
                  <Text className="text-center text-gray-400">N/A</Text>
                </View>
              )}
            </View>
          </View>

          {/* Fila 2: Fecha de vencimiento */}
          <View>
            <Text className="text-xs text-gray-500 mb-1">Fecha de Vencimiento</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={d.fecha_vencimiento || ''}
              onChangeText={(text) => updateDetalle(idx, 'fecha_vencimiento', text)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            />
          </View>

          {/* Fila 3: Precio Unitario */}
          <View>
            <Text className="text-xs text-gray-500 mb-1">
              {hayProductosCaja ? 'Precio Compra por Unidad' : 'Precio Compra'}
            </Text>
            <TextInput
              keyboardType="numeric"
              value={String(precioUnitario)}
              onChangeText={(text) => updateDetalle(idx, 'precio', text)}
              editable={d.unidad_medida !== 'CAJA'}
              className={`border rounded-lg px-3 py-2 ${
                d.unidad_medida === 'CAJA'
                  ? 'bg-gray-100 border-gray-200 text-gray-500'
                  : 'bg-white border-gray-300'
              }`}
              placeholder="Ej: 500000"
            />
          </View>

          {/* Fila 4: Precio Compra por Caja */}
          <View>
            <Text className="text-xs text-gray-500 mb-1">Precio Compra por Caja</Text>
            {d.unidad_medida === 'CAJA' ? (
              <TextInput
                keyboardType="numeric"
                value={String(d.precio_compra_caja || '')}
                onChangeText={(text) => updateDetalle(idx, 'precio_compra_caja', text)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                placeholder="Ej: 500000"
              />
            ) : (
              <View className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-100">
                <Text className="text-center text-gray-400">N/A</Text>
              </View>
            )}
          </View>

          {/* Subtotal */}
          <View className="border-t border-gray-300 pt-3 mt-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Subtotal:</Text>
              <Text className="text-lg font-bold text-blue-600">
                ₲ {subtotal.toLocaleString('es-PY')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="mt-4">
      <FlatList
        data={detalles}
        renderItem={renderDetalleItem}
        keyExtractor={(_, idx) => idx.toString()}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 8 }}
      />
    </View>
  );
};

export default DetallesProductos;
