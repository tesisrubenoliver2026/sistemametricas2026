import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createTipoIngreso } from '../../../services/ingreso';

interface CrearTiposIngresoProps {
  onSuccess?: () => void;
  onClose: () => void;
}

const CrearTiposIngreso = ({ onSuccess, onClose }: CrearTiposIngresoProps) => {
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCrear = async () => {
    setMensaje('');
    setError('');

    if (!descripcion.trim()) {
      setError('La descripción es obligatoria.');
      return;
    }

    setLoading(true);
    try {
      const res = await createTipoIngreso({ descripcion: descripcion.trim() });
      setMensaje(res.data.message || 'Tipo de ingreso creado correctamente.');
      // No limpiar inmediatamente, esperar a que el usuario vea el mensaje de éxito
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear tipo de ingreso.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setDescripcion('');
    setMensaje('');
    onSuccess?.();
    onClose?.();
  };

  const MessageAlert = ({ type, message }: { type: 'success' | 'error'; message: string }) => (
    <View className={`flex-row items-center gap-3 p-4 rounded-xl mb-4 ${
      type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
    }`}>
      <Ionicons 
        name={type === 'success' ? 'checkmark-circle' : 'alert-circle'} 
        size={22} 
        color={type === 'success' ? '#059669' : '#DC2626'} 
      />
      <Text className={`flex-1 text-sm ${type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
        {message}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Header */}
        <LinearGradient
          colors={['#10b981', '#059669']}
          className="px-5 pt-6 pb-6 rounded-b-3xl shadow-lg"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Ionicons name="pricetag" size={24} color="#fff" />
              </View>
              <View>
                <Text className="text-2xl font-bold text-white">Nuevo Tipo de Ingreso</Text>
                <Text className="text-white/80 text-sm">Agregar nueva categoría de ingresos</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Formulario */}
        <View className="px-5 mt-6">
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            {/* Mensajes de estado */}
            {mensaje && <MessageAlert type="success" message={mensaje} />}
            {error && <MessageAlert type="error" message={error} />}

            {/* Campo de descripción */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Descripción del Tipo de Ingreso
                <Text className="text-red-500"> *</Text>
              </Text>
              
              <View className="relative">
                <TextInput
                  value={descripcion}
                  onChangeText={setDescripcion}
                  placeholder="Ej: Venta contado, Cobro deuda, Servicios, etc."
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 rounded-xl px-4 py-4 text-gray-800 text-base border border-gray-200"
                  multiline
                  maxLength={100}
                />
                <View className="absolute right-3 top-3">
                  <Ionicons name="pricetag-outline" size={20} color="#64748b" />
                </View>
                
                {/* Contador de caracteres */}
                <View className="flex-row justify-end mt-2">
                  <Text className="text-xs text-gray-500">
                    {descripcion.length}/100 caracteres
                  </Text>
                </View>
              </View>

              {/* Ejemplos */}
              <View className="mt-3">
                <Text className="text-xs text-gray-500 mb-2">Ejemplos:</Text>
                <View className="flex-row flex-wrap gap-2">
                  {['Venta contado', 'Cobro deuda', 'Servicios', 'Alquileres', 'Inversiones'].map((ejemplo) => (
                    <Pressable
                      key={ejemplo}
                      onPress={() => setDescripcion(ejemplo)}
                      className="active:opacity-70"
                    >
                      <View className="bg-blue-50 rounded-lg px-3 py-1.5">
                        <Text className="text-blue-600 text-xs">{ejemplo}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {/* Botones de Acción */}
            <View className="flex-row gap-3 mt-2">
              <Pressable
                onPress={mensaje ? handleSuccessClose : onClose}
                className="flex-1 active:opacity-70"
              >
                <View className="bg-gray-200 rounded-xl py-3.5 flex-row items-center justify-center">
                  <Ionicons 
                    name={mensaje ? "checkmark" : "close"} 
                    size={18} 
                    color="#64748b" 
                  />
                  <Text className="text-gray-700 font-semibold ml-2">
                    {mensaje ? 'Continuar' : 'Cancelar'}
                  </Text>
                </View>
              </Pressable>

              {!mensaje && (
                <Pressable
                  onPress={handleCrear}
                  disabled={loading || !descripcion.trim()}
                  className="flex-1 active:opacity-70"
                >
                  <LinearGradient
                    colors={
                      loading || !descripcion.trim() 
                        ? ['#94a3b8', '#64748b'] 
                        : ['#10b981', '#059669']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-xl py-3.5 flex-row items-center justify-center"
                  >
                    {loading ? (
                      <Ionicons name="refresh" size={18} color="#fff" />
                    ) : (
                      <Ionicons name="add-circle" size={18} color="#fff" />
                    )}
                    <Text className="text-white font-semibold ml-2">
                      {loading ? 'Creando...' : 'Crear'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              )}
            </View>

            {/* Información adicional */}
            {!mensaje && (
              <View className="mt-6 p-4 bg-blue-50 rounded-xl">
                <View className="flex-row items-start gap-3">
                  <Ionicons name="information-circle" size={20} color="#3b82f6" />
                  <View className="flex-1">
                    <Text className="text-blue-800 font-semibold text-sm mb-1">
                      Tipos de Ingresos
                    </Text>
                    <Text className="text-blue-600 text-xs">
                      Los tipos de ingresos te ayudan a categorizar y organizar tus entradas de dinero. 
                      Usa nombres descriptivos que sean fáciles de identificar.
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CrearTiposIngreso;