import React, { type FC, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TotalVentaProps {
  total: number;
  descuento_total: number;
}

const TotalVenta: FC<TotalVentaProps> = ({ total, descuento_total }) => {
  const [montoCliente, setMontoCliente] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  
  const totalConDescuento = total - descuento_total;
  const montoClienteNum = parseFloat(montoCliente.replace(/[^0-9]/g, '')) || 0;
  const vuelto = Math.max(0, montoClienteNum - totalConDescuento);
  const tieneDescuento = descuento_total > 0;

  // Función para formatear números
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Función para manejar el cambio en el input
  const handleMontoChange = (text: string) => {
    // Permitir solo números
    const cleaned = text.replace(/[^0-9]/g, '');
    setMontoCliente(cleaned);
  };

  // Función para limpiar el input
  const clearMonto = () => {
    setMontoCliente('');
  };

  return (
    <View className="w-full bg-white border border-gray-200 rounded-2xl p-4 mt-4 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className="bg-blue-100 rounded-lg w-10 h-10 flex items-center justify-center">
            <Ionicons name="cash-outline" size={24} color="#3b82f6" />
          </View>
          <Text className="text-lg font-semibold text-gray-800">Resumen de Venta</Text>
        </View>
      </View>

      <View className="space-y-3">
        {/* Total sin descuento */}
        <View className="flex-row justify-between items-center p-3 bg-gray-100 rounded-lg">
          <Text className="text-gray-600 font-medium">
            {tieneDescuento ? "Subtotal" : "Total"}
          </Text>
          <Text className="text-base font-bold text-gray-800">
            ₲ {formatNumber(total)}
          </Text>
        </View>

        {/* Descuento */}
        {tieneDescuento && (
          <View className="flex-row justify-between items-center p-3 bg-red-100 rounded-lg">
            <Text className="text-red-600 font-medium">Descuento</Text>
            <Text className="text-base font-bold text-red-600">
              - ₲ {formatNumber(descuento_total)}
            </Text>
          </View>
        )}

        {/* Total a Pagar */}
        <View className={`flex-row justify-between items-center p-4 rounded-lg ${tieneDescuento ? 'bg-green-100' : 'bg-blue-100'}`}>
          <Text className={`font-bold text-lg ${tieneDescuento ? 'text-green-700' : 'text-blue-700'}`}>
            Total a Pagar
          </Text>
          <Text className={`text-xl font-extrabold ${tieneDescuento ? 'text-green-700' : 'text-blue-700'}`}>
            ₲ {formatNumber(totalConDescuento)}
          </Text>
        </View>

        {/* Monto del cliente */}
        <View className="mt-4">
          <Text className="text-gray-700 font-semibold mb-2">Monto Recibido</Text>
          <View className="flex-row items-center bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
            <TextInput
              value={montoCliente ? formatNumber(montoClienteNum) : ''}
              onChangeText={handleMontoChange}
              placeholder="0"
              keyboardType="numeric"
              className={`flex-1 px-4 py-3 text-right text-2xl font-semibold border-0 ${
                isFocused ? 'bg-blue-50' : 'bg-white'
              }`}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholderTextColor="#9CA3AF"
            />
            <Text className="text-gray-500 font-medium pr-4">₲</Text>
            {montoCliente.length > 0 && (
              <TouchableOpacity 
                onPress={clearMonto}
                className="p-3 bg-gray-200 active:bg-gray-300"
              >
                <Text className="text-gray-600 text-lg font-bold">×</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Vuelto */}
        {montoClienteNum > 0 && (
          <View className={`p-4 rounded-lg mt-2 ${
            vuelto > 0 
              ? 'bg-yellow-100' 
              : montoClienteNum >= totalConDescuento 
                ? 'bg-green-100' 
                : 'bg-red-100'
          }`}>
            <View className="flex-row justify-between items-center">
              <Text className={`font-semibold text-lg ${
                vuelto > 0 
                  ? 'text-yellow-800' 
                  : montoClienteNum >= totalConDescuento 
                    ? 'text-green-800' 
                    : 'text-red-800'
              }`}>
                {vuelto > 0 ? 'Vuelto' : montoClienteNum >= totalConDescuento ? 'Pago Exacto' : 'Faltan'}
              </Text>
              <Text className={`text-xl font-extrabold ${
                vuelto > 0 
                  ? 'text-yellow-800' 
                  : montoClienteNum >= totalConDescuento 
                    ? 'text-green-800' 
                    : 'text-red-800'
              }`}>
                ₲ {vuelto > 0 
                  ? formatNumber(vuelto) 
                  : montoClienteNum >= totalConDescuento 
                    ? '0' 
                    : formatNumber(totalConDescuento - montoClienteNum)
                }
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default TotalVenta;