import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserPlus } from 'lucide-react-native';
import ModalSuccess from 'components/ModalSuccess';
import ModalError from 'components/ModalError';
import { createFuncionario } from 'services/funcionarios';

interface CrearFuncionarioProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const initialFormData = {
  nombre: '',
  apellido: '',
  telefono: '',
  tipo_funcionario: 'Cajero',
  login: '',
  password: ''
};

const CrearFuncionario = ({ onSuccess, onClose }: CrearFuncionarioProps) => {
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }
    if (!formData.apellido.trim()) {
      Alert.alert('Error', 'El apellido es requerido');
      return;
    }
    if (!formData.login.trim()) {
      Alert.alert('Error', 'El login es requerido');
      return;
    }
    if (!formData.password.trim()) {
      Alert.alert('Error', 'La contraseña es requerida');
      return;
    }
    if (formData.password.length < 4) {
      Alert.alert('Error', 'La contraseña debe tener al menos 4 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      await createFuncionario(formData);
      setSuccessModalOpen(true);
      setFormData(initialFormData);
      
      setTimeout(() => {
        setSuccessModalOpen(false);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error al crear funcionario:', error);
      setErrorMessage('❌ ' + (error.response?.data?.error || 'Error al crear funcionario'));
      setErrorModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-2xl w-full max-w-2xl max-h-[90%] overflow-hidden">
          {/* Header */}
          <View className="bg-blue-600 px-6 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 flex-1">
              <View className="bg-white/20 p-2 rounded-lg">
                <UserPlus size={24} color="#fff" />
              </View>
              <Text className="text-xl font-bold text-white flex-1">
                Crear Funcionario
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-white/20 active:bg-white/30"
            >
              <Ionicons name="close" size={24} color="#fff" />
            </Pressable>
          </View>

          {/* Contenido */}
          <ScrollView
            
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20 }}
          >
            <View className="gap-4">
              {/* Nombre */}
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Nombre <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={formData.nombre}
                  onChangeText={(text) => handleChange('nombre', text)}
                  placeholder="Ingrese el nombre"
                  placeholderTextColor="#9ca3af"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                />
              </View>

              {/* Apellido */}
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Apellido <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={formData.apellido}
                  onChangeText={(text) => handleChange('apellido', text)}
                  placeholder="Ingrese el apellido"
                  placeholderTextColor="#9ca3af"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                />
              </View>

              {/* Teléfono */}
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Teléfono
                </Text>
                <TextInput
                  value={formData.telefono}
                  onChangeText={(text) => handleChange('telefono', text)}
                  placeholder="Ingrese el teléfono"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                />
              </View>

              {/* Tipo de Funcionario (Bloqueado) */}
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Funcionario <Text className="text-red-500">*</Text>
                </Text>
                <View className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3">
                  <Text className="text-gray-600 font-medium">Cajero</Text>
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                  El tipo de funcionario está predefinido como "Cajero"
                </Text>
              </View>

              {/* Login */}
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Login <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={formData.login}
                  onChangeText={(text) => handleChange('login', text)}
                  placeholder="Nombre de usuario"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                />
              </View>

              {/* Contraseña */}
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Contraseña <Text className="text-red-500">*</Text>
                </Text>
                <View className="relative">
                  <TextInput
                    value={formData.password}
                    onChangeText={(text) => handleChange('password', text)}
                    placeholder="Ingrese una contraseña"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={24}
                      color="#6b7280"
                    />
                  </Pressable>
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                  La contraseña debe tener al menos 4 caracteres
                </Text>
              </View>

              {/* Nota de campos requeridos */}
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="information-circle" size={18} color="#2563eb" />
                  <Text className="text-xs text-blue-800 flex-1">
                    Los campos marcados con <Text className="font-bold">*</Text> son obligatorios
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer con botones */}
          <View className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                disabled={submitting}
                className="flex-1 bg-gray-200 active:bg-gray-300 py-3 rounded-xl"
              >
                <Text className="text-gray-700 text-center font-semibold">
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                className={`flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2 ${
                  submitting ? 'bg-blue-400' : 'bg-blue-600 active:bg-blue-700'
                }`}
              >
                {submitting ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="text-white font-semibold">Creando...</Text>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} color="#fff" />
                    <Text className="text-white font-semibold">Crear Funcionario</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Modales */}
      <ModalSuccess
        isOpen={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          if (onClose) onClose();
        }}
        message="Funcionario creado con éxito ✅"
      />
      <ModalError
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        message={errorMessage}
      />
    </Modal>
  );
};

export default CrearFuncionario;