import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TipoDescuentoProps {
  onSelectionChange: (tipo: 'sin_descuento' | 'descuento_producto' | 'descuento_total') => void;
  defaultValue?: 'sin_descuento' | 'descuento_producto' | 'descuento_total';
  className?: string;
  setMontoDescuentoTotal: (value: string) => void;
}

export const TipoDescuentoSelect: React.FC<TipoDescuentoProps> = ({ 
  onSelectionChange, 
  defaultValue = 'sin_descuento',
  className = '',
  setMontoDescuentoTotal
}) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>(defaultValue);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    setTipoSeleccionado(defaultValue);
  }, [defaultValue]);

  const handleSelection = (tipo: 'sin_descuento' | 'descuento_producto' | 'descuento_total') => {
    setTipoSeleccionado(tipo);
    onSelectionChange(tipo);
    setMontoDescuentoTotal("");
    setModalVisible(false);
  };

  const getOptionLabel = (tipo: string) => {
    switch (tipo) {
      case 'sin_descuento':
        return 'Sin Descuento';
      case 'descuento_producto':
        return 'Descuento por Producto';
      case 'descuento_total':
        return 'Descuento por Venta Total';
      default:
        return 'Seleccionar';
    }
  };

  const getOptionDescription = (tipo: string) => {
    switch (tipo) {
      case 'sin_descuento':
        return 'No aplicar descuentos';
      case 'descuento_producto':
        return 'Aplicar descuento a productos específicos';
      case 'descuento_total':
        return 'Aplicar descuento a toda la venta';
      default:
        return '';
    }
  };

  const options = [
    {
      value: 'sin_descuento' as const,
      label: 'Sin Descuento',
      description: 'No aplicar descuentos',
      icon: 'ban-outline' as keyof typeof Ionicons.glyphMap
    },
    {
      value: 'descuento_producto' as const,
      label: 'Descuento por Producto',
      description: 'Aplicar descuento a productos específicos',
      icon: 'pricetag-outline' as keyof typeof Ionicons.glyphMap
    },
    {
      value: 'descuento_total' as const,
      label: 'Descuento por Venta Total',
      description: 'Aplicar descuento a toda la venta',
      icon: 'receipt-outline' as keyof typeof Ionicons.glyphMap
    }
  ];

  return (
    <View className={`w-full ${className}`}>
      <Text className="text-sm font-medium text-gray-700 mb-2">
        Tipo de Descuento
      </Text>
      
      {/* Selector personalizado */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white active:bg-gray-50"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-base text-gray-900 font-medium">
              {getOptionLabel(tipoSeleccionado)}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              {getOptionDescription(tipoSeleccionado)}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#9ca3af" />
        </View>
      </TouchableOpacity>

      {/* Modal de selección */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View className="flex-1 justify-end bg-black/50">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-3xl max-h-[75%]">
                {/* Header del modal */}
                <View className="px-6 py-4 border-b border-gray-200">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-semibold text-gray-900">
                      Seleccionar Tipo de Descuento
                    </Text>
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      className="p-2"
                    >
                  <Ionicons name="close" size={24} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-gray-500 text-sm mt-1">
                    Elige cómo quieres aplicar los descuentos
                  </Text>
                </View>

                {/* Opciones */}
                <View style={{ flexShrink: 1 }}>
                  <ScrollView 
                    className="p-4"
                    showsVerticalScrollIndicator={false}
                  >
                    <View className="space-y-3">
                      {options.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => handleSelection(option.value)}
                          className={`p-4 rounded-xl border-2 ${
                            tipoSeleccionado === option.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white'
                          } active:bg-gray-50`}
                        >
                          <View className="flex-row items-start gap-3">
                            <View className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tipoSeleccionado === option.value
                                ? 'bg-blue-500'
                                : 'bg-gray-200'
                            }`}>
                              <Ionicons 
                                name={option.icon} 
                                size={16} 
                                color={tipoSeleccionado === option.value ? '#fff' : '#4b5563'} 
                              />
                            </View>
                            
                            <View className="flex-1">
                              <Text className={`text-base font-semibold ${
                                tipoSeleccionado === option.value
                                  ? 'text-blue-700'
                                  : 'text-gray-900'
                              }`}>
                                {option.label}
                              </Text>
                              <Text className={`text-sm mt-1 ${
                                tipoSeleccionado === option.value
                                  ? 'text-blue-600'
                                  : 'text-gray-500'
                              }`}>
                                {option.description}
                              </Text>
                            </View>

                            {tipoSeleccionado === option.value && (
                              <View className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                <Ionicons name="checkmark" size={14} color="#fff" />
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Botón de cerrar */}
                <View className="px-4 pb-6 pt-4 border-t border-gray-200">
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="w-full py-3 bg-gray-100 rounded-xl active:bg-gray-200"
                  >
                    <Text className="text-gray-700 text-center font-medium">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Indicador visual del estado actual */}
      <View className="flex-row items-center gap-2 mt-2">
        <View className={`w-2 h-2 rounded-full ${
          tipoSeleccionado === 'sin_descuento' ? 'bg-gray-400' :
          tipoSeleccionado === 'descuento_producto' ? 'bg-green-500' :
          tipoSeleccionado === 'descuento_total' ? 'bg-blue-500' : 'bg-gray-400'
        }`} />
        <Text className="text-xs text-gray-500">
          {tipoSeleccionado === 'sin_descuento' ? 'Sin descuentos aplicados' :
           tipoSeleccionado === 'descuento_producto' ? 'Descuento por producto activado' :
           tipoSeleccionado === 'descuento_total' ? 'Descuento total activado' : 'Seleccione un tipo'}
        </Text>
      </View>
    </View>
  );
};

export default TipoDescuentoSelect;