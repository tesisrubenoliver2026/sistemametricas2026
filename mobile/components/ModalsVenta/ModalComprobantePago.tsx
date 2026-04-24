import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ModalComprobantePagoProps {
  comprobante: {
    cliente: string;
    proveedor?: string;
    fecha_pago: string;
    monto_pagado: string;
    tipoPago?: string;
    saldo: string;
    detallesVenta: {
      idproducto: number;
      producto: string;
      cantidad: string;
      precio_venta?: string;
      precio?: string;
      sub_total: string;
    }[];
    detallesCompra?: {
      idproducto: number;
      producto: string;
      cantidad: string;
      precio?: string;
      precio_venta?: string;
      sub_total: string;
    }[];
  };
  onClose: () => void;
  isProviderPay?: boolean;
}

const titleSell = "Detalle de Venta la cual se está realizando el pago a crédito";
const titleBuy = "Detalle de Compra la cual se está realizando el pago a crédito";

const ModalComprobantePago: React.FC<ModalComprobantePagoProps> = ({ 
  comprobante, 
  onClose, 
  isProviderPay = false 
}) => {
  const detalles = isProviderPay 
    ? comprobante.detallesCompra ?? [] 
    : comprobante.detallesVenta;

  const formatCurrency = (amount: string) => {
    return `${amount} Gs`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-30 items-center justify-center px-4">
        <View className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 max-h-[90%]">
          {/* Header */}
          <View className="flex-row items-center justify-center gap-2 mb-4">
            <Ionicons name="receipt" size={24} color="#3b82f6" />
            <Text className="text-xl font-semibold text-gray-800 text-center">
              Comprobante de Pago
            </Text>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {/* Información del pago */}
            <View className="bg-blue-50 rounded-xl p-4 mb-4">
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-700 font-medium">
                    {isProviderPay ? "Proveedor:" : "Cliente:"}
                  </Text>
                  <Text className="text-gray-900 font-semibold flex-1 text-right">
                    {isProviderPay ? comprobante.proveedor : comprobante.cliente}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-700 font-medium">Fecha de Pago:</Text>
                  <Text className="text-gray-900">{formatDate(comprobante.fecha_pago)}</Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-700 font-medium">Monto Pagado:</Text>
                  <Text className="text-green-600 font-bold">
                    {formatCurrency(comprobante.monto_pagado)}
                  </Text>
                </View>

                {comprobante.tipoPago && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-700 font-medium">Tipo de Pago:</Text>
                    <Text className="text-gray-900 capitalize">{comprobante.tipoPago}</Text>
                  </View>
                )}

                <View className="flex-row justify-between">
                  <Text className="text-gray-700 font-medium">Saldo Pendiente:</Text>
                  <Text className="text-red-600 font-bold">
                    {formatCurrency(comprobante.saldo)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Detalles de productos */}
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                {isProviderPay ? titleBuy : titleSell}
              </Text>

              <View className="border border-gray-300 rounded-lg overflow-hidden">
                {/* Header de la tabla */}
                <View className="bg-gray-100 flex-row border-b border-gray-300">
                  <View className="flex-1 p-2 border-r border-gray-300">
                    <Text className="text-xs font-semibold text-gray-700">Producto</Text>
                  </View>
                  <View className="w-16 p-2 border-r border-gray-300">
                    <Text className="text-xs font-semibold text-gray-700 text-center">Cant.</Text>
                  </View>
                  <View className="w-20 p-2 border-r border-gray-300">
                    <Text className="text-xs font-semibold text-gray-700 text-center">Precio</Text>
                  </View>
                  <View className="w-24 p-2">
                    <Text className="text-xs font-semibold text-gray-700 text-center">Subtotal</Text>
                  </View>
                </View>

                {/* Filas de productos */}
                {detalles.map((item, index) => (
                  <View 
                    key={`${item.idproducto}-${index}`}
                    className={`flex-row border-b border-gray-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <View className="flex-1 p-2 border-r border-gray-200">
                      <Text className="text-sm text-gray-800" numberOfLines={2}>
                        {item.producto}
                      </Text>
                    </View>
                    <View className="w-16 p-2 border-r border-gray-200 items-center justify-center">
                      <Text className="text-sm text-gray-700">{item.cantidad}</Text>
                    </View>
                    <View className="w-20 p-2 border-r border-gray-200 items-center justify-center">
                      <Text className="text-sm text-gray-700">
                        {isProviderPay ? item.precio ?? '0' : item.precio_venta ?? '0'}
                      </Text>
                    </View>
                    <View className="w-24 p-2 items-center justify-center">
                      <Text className="text-sm font-semibold text-gray-800">
                        {item.sub_total}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Botón de cerrar */}
          <View className="mt-4">
            <TouchableOpacity
              onPress={onClose}
              className="bg-blue-600 active:bg-blue-700 rounded-xl py-3.5 flex-row items-center justify-center gap-2"
            >
              <Ionicons name="close" size={20} color="#fff" />
              <Text className="text-white font-semibold text-base">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalComprobantePago;