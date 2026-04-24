import React, { type FC, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';

interface Props {
  onClose: () => void;
  datosTarjeta: any;
  setDatosTarjeta: (data: any) => void;
}

const FormTarjeta: FC<Props> = ({ onClose, datosTarjeta, setDatosTarjeta }) => {
  const [activeField, setActiveField] = useState<string | null>(null);
  const [showTipoModal, setShowTipoModal] = useState(false);
  
  const handleChange = (name: string, value: string) => {
    setDatosTarjeta((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const tiposTarjeta = [
    { value: 'debito', label: '💳 Débito' },
    { value: 'credito', label: '💳 Crédito' },
  ];

  const getTipoLabel = (value: string) => {
    const tipo = tiposTarjeta.find(t => t.value === value);
    return tipo ? tipo.label : '-- Seleccionar tipo --';
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView 
        className="flex-1 p-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="mb-6">
          <View className="flex-row items-center gap-3 mb-2">
            <View className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
              <Text className="text-white text-lg">💳</Text>
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800">Datos de Tarjeta</Text>
              <Text className="text-gray-600 text-sm mt-1">
                Complete la información del pago con tarjeta
              </Text>
            </View>
          </View>
        </View>

        {/* Formulario */}
        <View className="space-y-5">
          {/* Tipo de Tarjeta */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">
              Tipo de Tarjeta
            </Text>
            <TouchableOpacity
              onPress={() => setShowTipoModal(true)}
              className={`w-full border-2 ${
                activeField === 'tipo_tarjeta' ? 'border-blue-500' : 'border-gray-300'
              } px-4 py-3 rounded-xl bg-white`}
            >
              <Text className={`${datosTarjeta.tipo_tarjeta ? 'text-gray-900' : 'text-gray-500'}`}>
                {getTipoLabel(datosTarjeta.tipo_tarjeta)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Entidad / Banco */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">
              Entidad / Banco
            </Text>
            <TextInput
              value={datosTarjeta.entidad || ''}
              onChangeText={(value) => handleChange('entidad', value)}
              placeholder="Ej: Visión Banco, Itaú..."
              className={`w-full border-2 ${
                activeField === 'entidad' ? 'border-blue-500' : 'border-gray-300'
              } px-4 py-3 rounded-xl bg-white`}
              onFocus={() => setActiveField('entidad')}
              onBlur={() => setActiveField(null)}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Monto */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">
              Monto
            </Text>
            <View className="flex-row items-center">
              <TextInput
                value={datosTarjeta.monto || ''}
                onChangeText={(value) => handleChange('monto', value)}
                placeholder="0"
                keyboardType="numeric"
                className={`flex-1 border-2 ${
                  activeField === 'monto' ? 'border-blue-500' : 'border-gray-300'
                } px-4 py-3 rounded-xl bg-white text-right`}
                onFocus={() => setActiveField('monto')}
                onBlur={() => setActiveField(null)}
                placeholderTextColor="#9CA3AF"
              />
              <Text className="text-gray-600 font-medium ml-2">Gs.</Text>
            </View>
          </View>
        </View>

        {/* Información de tarjetas aceptadas */}
        <View className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
          <View className="flex-row items-start gap-2">
            <Text className="text-green-500 text-lg">✅</Text>
            <View className="flex-1">
              <Text className="text-green-800 font-medium text-sm">
                Tarjetas Aceptadas
              </Text>
              <Text className="text-green-600 text-xs mt-1">
                Aceptamos todas las tarjetas principales: Visa, Mastercard, American Express y más.
              </Text>
            </View>
          </View>
        </View>

        {/* Botones de acción */}
        <View className="flex-row gap-3 mt-8">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 bg-gray-100 active:bg-gray-200 px-6 py-4 rounded-xl"
          >
            <Text className="text-gray-700 font-semibold text-center text-base">
              Cancelar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 bg-blue-500 active:bg-blue-600 px-6 py-4 rounded-xl shadow-sm"
          >
            <Text className="text-white font-semibold text-center text-base">
              Confirmar Pago
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para seleccionar tipo de tarjeta */}
      <Modal
        visible={showTipoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTipoModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowTipoModal(false)}>
          <View className="flex-1 justify-end bg-black/50">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-3xl max-h-2/3">
                {/* Header del modal */}
                <View className="px-6 py-4 border-b border-gray-200">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-semibold text-gray-900">
                      Seleccionar Tipo de Tarjeta
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowTipoModal(false)}
                      className="p-2"
                    >
                      <Text className="text-gray-400 text-lg">✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Opciones */}
                <ScrollView className="p-4">
                  <View className="space-y-2">
                    {tiposTarjeta.map((tipo) => (
                      <TouchableOpacity
                        key={tipo.value}
                        onPress={() => {
                          handleChange('tipo_tarjeta', tipo.value);
                          setShowTipoModal(false);
                        }}
                        className={`p-4 rounded-xl border-2 ${
                          datosTarjeta.tipo_tarjeta === tipo.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white'
                        } active:bg-gray-50`}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text className={`font-medium ${
                            datosTarjeta.tipo_tarjeta === tipo.value
                              ? 'text-blue-700'
                              : 'text-gray-900'
                          }`}>
                            {tipo.label}
                          </Text>
                          {datosTarjeta.tipo_tarjeta === tipo.value && (
                            <View className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <Text className="text-white text-xs">✓</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* Botón de cerrar */}
                <View className="px-4 pb-6 pt-4 border-t border-gray-200">
                  <TouchableOpacity
                    onPress={() => setShowTipoModal(false)}
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
    </KeyboardAvoidingView>
  );
};

export default FormTarjeta;