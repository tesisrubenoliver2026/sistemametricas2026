import React, { useEffect, useState } from 'react';
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
import { Save } from 'lucide-react-native';
import ModalSuccess from 'components/ModalSuccess';
import ModalError from 'components/ModalError';
import { getFuncionarioById, updateFuncionario } from 'services/funcionarios';
import SelectInput from 'app/clientes/components/SelectInput';

interface EditarFuncionarioProps {
  id: number | string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const initialFormData = {
  nombre: '',
  apellido: '',
  telefono: '',
  tipo_funcionario: '',
  login: '',
  estado: 'activo',
};

const EditarFuncionario = ({ id, onSuccess, onClose }: EditarFuncionarioProps) => {
  const [formData, setFormData] = useState(initialFormData);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Opciones para los selects
  const tipoFuncionarioOptions = [
    { value: 'Vendedor', label: 'Vendedor' },
    { value: 'Cajero', label: 'Cajero' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Gerente', label: 'Gerente' },
    { value: 'Administrador', label: 'Administrador' },
    { value: 'Almacenero', label: 'Almacenero' },
    { value: 'Otro', label: 'Otro' },
  ];

  const estadoOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ];

  useEffect(() => {
    if (id) {
      setLoading(true);
      getFuncionarioById(id)
        .then((res) => {
          const data = res.data;
          setFormData({
            nombre: data.nombre || '',
            apellido: data.apellido || '',
            telefono: data.telefono || '',
            tipo_funcionario: data.tipo_funcionario || '',
            login: data.login || '',
            estado: data.estado || 'activo',
          });
        })
        .catch((error) => {
          console.error('Error al obtener funcionario:', error);
          setErrorMessage('❌ Error al cargar los datos del funcionario');
          setErrorModalOpen(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
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
    if (!formData.tipo_funcionario) {
      Alert.alert('Error', 'El tipo de funcionario es requerido');
      return;
    }
    if (!formData.login.trim()) {
      Alert.alert('Error', 'El login es requerido');
      return;
    }

    setSubmitting(true);
    try {
      await updateFuncionario(id, formData);
      setSuccessModalOpen(true);

      setTimeout(() => {
        setSuccessModalOpen(false);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error al actualizar funcionario:', error);
      setErrorMessage('❌ ' + (error.response?.data?.error || 'Error al actualizar funcionario'));
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
                <Ionicons name="create-outline" size={24} color="#fff" />
              </View>
              <Text className="text-xl font-bold text-white flex-1">
                Editar Funcionario
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
            {loading ? (
              <View className="py-20 items-center justify-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="text-gray-500 mt-4">Cargando datos...</Text>
              </View>
            ) : (
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

                {/* Tipo de Funcionario */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Funcionario <Text className="text-red-500">*</Text>
                  </Text>
                  <SelectInput
                    name="tipo_funcionario"
                    value={formData.tipo_funcionario}
                    onChange={handleChange}
                    options={tipoFuncionarioOptions}
                    placeholder="Seleccionar tipo"
                  />
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

                {/* Estado */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Estado <Text className="text-red-500">*</Text>
                  </Text>
                  <SelectInput
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    options={estadoOptions}
                    placeholder="Seleccionar estado"
                  />
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
            )}
          </ScrollView>

          {/* Footer con botones */}
          {!loading && (
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
                      <Text className="text-white font-semibold">Guardando...</Text>
                    </>
                  ) : (
                    <>
                      <Save size={18} color="#fff" />
                      <Text className="text-white font-semibold">Guardar Cambios</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Modales */}
      <ModalSuccess
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message="Funcionario actualizado con éxito ✅"
      />
      <ModalError
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        message={errorMessage}
      />
    </Modal>
  );
};

export default EditarFuncionario;