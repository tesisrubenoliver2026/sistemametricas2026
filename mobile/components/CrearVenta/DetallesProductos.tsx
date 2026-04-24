import React, { useState, type FC } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ModalAdvert from 'components/ModalAdvert';

interface Props {
  detalles: any[];
  setDetalles: (data: any[]) => void;
}

const DetallesProductos: FC<Props> = ({ detalles, setDetalles }) => {
  const [advertMessage, setAdvertMessage] = useState<string>('');
  const [advertOpen, setAdvertOpen] = useState<boolean>(false);

  const updateDetalle = (index: number, field: string, value: string | number) => {
    const updated = [...detalles];
    updated[index][field] = value;
    setDetalles(updated);
  };

  const removeDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  if (!detalles.length) return null;

  const showAdvert = (message: string) => {
    setAdvertMessage(message);
    setAdvertOpen(true);
  };

  const handleCantidadChange = (index: number, value: string) => {
    const detalle = detalles[index];
    const unidadEsDecimal = detalle.unidad_medida === "KG" || detalle.unidad_medida === "L";
    
    // Permitir entrada temporal
    updateDetalle(index, "cantidad", value);

    // Validar cuando pierde el foco
    const validateCantidad = () => {
      let valor = unidadEsDecimal ? parseFloat(value) : parseInt(value);
      const min = unidadEsDecimal ? 0.1 : 1;
      const max = parseFloat(detalle.cantidadMaximo);

      if (isNaN(valor) || value === '') {
        showAdvert(`Debés ingresar una cantidad válida (mínimo ${min})`);
        valor = min;
      }

      if (valor < min) {
        showAdvert(`La cantidad mínima permitida es ${min}`);
        valor = min;
      }

      if (valor > max) {
        showAdvert(`La cantidad no puede superar el stock disponible (${max})`);
        valor = max;
      }

      updateDetalle(index, "cantidad", valor);
    };

    // Programar validación para el próximo ciclo de eventos
    setTimeout(validateCantidad, 100);
  };

  console.log("Detalles productos", detalles);

  const renderDetalleItem = (d: any, idx: number) => {
    const subtotal = (parseFloat(d.precio_venta || '0') * parseFloat(d.cantidad || '0'));

    return (
      <View key={idx} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        {/* Header de la tarjeta */}
        <View className="flex-row justify-between items-start mb-4">
          <Text className="text-base font-bold text-gray-800 flex-1 pr-2" numberOfLines={2}>
            {d.nombre_producto}
          </Text>
          <TouchableOpacity
            onPress={() => removeDetalle(idx)}
            className="w-9 h-9 bg-red-100 rounded-full items-center justify-center active:bg-red-200"
          >
            <Ionicons name="close" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Campos editables */}
        <View className="gap-y-4">
          {/* Fila 1: Cantidad y Unidad */}
          <View className="flex-row gap-x-4">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1 font-medium">Cantidad</Text>
              <TextInput
                value={d.cantidad?.toString()}
                onChangeText={(value) => handleCantidadChange(idx, value)}
                keyboardType="decimal-pad"
                className="w-full text-base border-2 border-gray-300 rounded-lg px-3 py-2.5 text-center font-semibold"
                placeholder="0"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1 font-medium">Unidad</Text>
              <View className="w-full border-2 border-gray-200 bg-gray-100 rounded-lg px-3 py-2.5 items-center justify-center">
                <Text className="text-base text-gray-600 font-semibold">
                  {d.unidad_medida === 'KG' ? 'Kg' : d.unidad_medida === 'L' ? 'L' : d.unidad_medida}
                </Text>
              </View>
            </View>
          </View>

          {/* Fila 2: Precio y Fecha Vencimiento */}
          <View className="flex-row gap-x-4">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1 font-medium">Precio</Text>
              <TextInput
                value={d.precio_venta?.toString()}
                onChangeText={(value) => updateDetalle(idx, 'precio_venta', value)}
                keyboardType="decimal-pad"
                className="w-full text-base border-2 border-gray-300 rounded-lg px-3 py-2.5 text-center font-semibold"
                placeholder="0"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1 font-medium">Fec. Vencimiento</Text>
              <TextInput
                value={d.fecha_vencimiento ? new Date(d.fecha_vencimiento).toISOString().split('T')[0] : ''}
                onChangeText={(value) => updateDetalle(idx, 'fecha_vencimiento', value)}
                className="w-full text-base border-2 border-gray-300 rounded-lg px-3 py-2.5 text-center"
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
        </View>

        {/* Subtotal */}
        <View className="mt-4 pt-3 border-t border-gray-200">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium text-gray-600">Subtotal</Text>
            <Text className="text-lg font-bold text-blue-600">
              ₲ {subtotal.toLocaleString('es-PY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="mt-4 space-y-4">
      {detalles.map(renderDetalleItem)}
      <ModalAdvert
        isOpen={advertOpen}
        onClose={() => setAdvertOpen(false)}
        message={advertMessage}
      />
    </View>
  );
};

export default DetallesProductos;