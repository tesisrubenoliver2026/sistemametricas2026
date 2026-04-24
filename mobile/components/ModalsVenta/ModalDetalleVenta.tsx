import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { comprobanteVenta } from 'services/ventas';
import { formatPY } from 'utils/utils';
import ModalError from 'components/ModalError';

interface DetalleVenta {
  iddetalle: number;
  nombre_producto: string;
  cantidad: string;
  precio_venta: string;
  sub_total: string;
  ganancia: string;
  descuento: string;
  unidad_medida: string;
}

interface Venta {
  idventa: number;
  nombre_cliente: string;
  documento_cliente: string;
  tipo: string;
  total: string;
  fecha: string;
  tipo_descuento: string;
  total_descuento: string;
  total_ganancia: string;
  detalles: DetalleVenta[];
}

interface ModalDetalleVentaProps {
  venta: Venta | null;
  isOpen: boolean;
  onClose: () => void;
}

const ModalDetalleVenta: React.FC<ModalDetalleVentaProps> = ({ venta, isOpen, onClose }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleReimprimir = async (idventa: number) => {
    setLoadingPdf(true);
    try {
      const res = await comprobanteVenta(idventa);
      const base64Pdf = res.data?.facturaPDFBase64;

      if (base64Pdf) {
        const filename = `Venta-${venta?.idventa || 'N'}-${Date.now()}.pdf`;
        const fileUri = FileSystem.documentDirectory + filename;

        await FileSystem.writeAsStringAsync(fileUri, base64Pdf, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, { mimeType: 'application/pdf', dialogTitle: 'Compartir Comprobante' });
        } else {
          Alert.alert('No disponible', 'La función de compartir no está disponible en este dispositivo.');
        }
      } else {
        setErrorMessage('No se pudo generar el comprobante PDF.');
      }
    } catch (error) {
      console.error('❌ Error al generar comprobante:', error);
      setErrorMessage('Error al generar el comprobante');
    } finally {
      setLoadingPdf(false);
    }
  };

  useEffect(() => {
    if (venta) {
      console.log("Detalles de venta", venta);
    }
  }, [venta]);

  if (!isOpen || !venta) return null;

  const getTipoDescuentoText = (tipo: string) => {
    switch (tipo) {
      case "descuento_total":
        return "Descuento Total";
      case "descuento_producto":
        return "Descuento Producto";
      default:
        return "Sin Descuento";
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-gray-50 w-full rounded-t-3xl shadow-xl max-h-[90%]">
          {/* Header */}
          <View className="flex-row justify-between items-center p-5 border-b border-gray-200 bg-white rounded-t-3xl">
            <View className="flex-row items-center gap-3 flex-1">
              <Ionicons name="receipt-outline" size={24} color="#1d4ed8" />
              <Text className="text-xl font-bold text-gray-800 flex-1">
                Detalles de la venta #{venta.idventa}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1 bg-gray-100 rounded-full active:bg-gray-200">
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
            {/* Información general */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-200">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-medium text-gray-600">Cliente:</Text>
                <Text className="text-sm font-semibold text-gray-800 text-right" numberOfLines={1}>{venta.nombre_cliente}</Text>
              </View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-medium text-gray-600">Documento:</Text>
                <Text className="text-sm font-semibold text-gray-800">{venta.documento_cliente}</Text>
              </View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-medium text-gray-600">Fecha:</Text>
                <Text className="text-sm font-semibold text-gray-800">{new Date(venta.fecha).toLocaleDateString('es-PY')}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-600">Tipo:</Text>
                <Text className="text-sm font-semibold text-gray-800 capitalize">{venta.tipo}</Text>
              </View>
            </View>

            {/* Detalles de productos */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-gray-800 mb-3">Productos</Text>
              <View className="space-y-3">
                {venta.detalles.map((d) => (
                  <View key={d.iddetalle} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <Text className="text-base font-bold text-gray-800 mb-3">{d.nombre_producto}</Text>
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-sm text-gray-600">Cantidad:</Text>
                      <Text className="text-sm font-semibold text-gray-800">{d.cantidad} {d.unidad_medida}</Text>
                    </View>
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-sm text-gray-600">Precio Unit.:</Text>
                      <Text className="text-sm font-semibold text-gray-800">{formatPY(d.precio_venta)}</Text>
                    </View>
                    {parseFloat(d.descuento) > 0 && (
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-sm text-red-600">Descuento:</Text>
                        <Text className="text-sm font-semibold text-red-600">- {formatPY(d.descuento)}</Text>
                      </View>
                    )}
                    <View className="border-t border-gray-200 mt-2 pt-2">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm font-bold text-gray-800">Subtotal:</Text>
                        <Text className="text-base font-bold text-blue-600">{formatPY(d.sub_total)}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Resumen Final */}
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <Text className="text-lg font-bold text-gray-800 mb-3">Resumen</Text>
              <View className="space-y-2">
                {venta.tipo_descuento !== "sin_descuento" && (
                  <>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-600">Subtotal:</Text>
                      <Text className="text-sm font-semibold text-gray-800">{formatPY(venta.total)}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-red-600">{getTipoDescuentoText(venta.tipo_descuento)}:</Text>
                      <Text className="text-sm font-semibold text-red-600">- {formatPY(venta.total_descuento)}</Text>
                    </View>
                  </>
                )}
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">Ganancia:</Text>
                  <Text className="text-sm font-semibold text-green-700">{formatPY(venta.total_ganancia)}</Text>
                </View>
                <View className="border-t border-gray-200 mt-2 pt-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-base font-bold text-gray-800">Total Venta:</Text>
                    <Text className="text-xl font-extrabold text-blue-700">{formatPY(String(parseFloat(venta.total) - parseFloat(venta.total_descuento)))}</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer con botón de acción */}
          <View className="p-4 bg-white border-t border-gray-200">
            <TouchableOpacity
              onPress={() => handleReimprimir(venta.idventa)}
              disabled={loadingPdf}
              className={`px-5 py-3 rounded-xl shadow-sm ${loadingPdf ? 'bg-blue-300' : 'bg-blue-600 active:bg-blue-700'}`}
            >
              <View className="flex-row items-center justify-center gap-2">
                {loadingPdf ? (
                  <Text className="text-white font-bold text-base">Generando...</Text>
                ) : (
                  <>
                    <Ionicons name="print-outline" size={20} color="#fff" />
                    <Text className="text-white font-bold text-base">Re-imprimir Comprobante</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ModalError 
        isOpen={!!errorMessage} 
        onClose={() => setErrorMessage("")} 
        message={errorMessage}
      />
    </Modal>
  );
};

export default ModalDetalleVenta;