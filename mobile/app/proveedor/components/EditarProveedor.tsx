import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { getProveedorById, updateProveedor } from '../../../services/proveedor';
import ModalSuccess from '../../../components/ModalSuccess';
import { Ionicons } from '@expo/vector-icons';

interface EditarProveedorProps {
  id: number | string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const initialForm = {
  nombre: '',
  telefono: '',
  direccion: '',
  ruc: '',
  razon: '',
  estado: 'activo',
};

const EditarProveedor = ({ id, onSuccess, onClose }: EditarProveedorProps) => {
  const [formData, setFormData] = useState(initialForm);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      getProveedorById(id).then((res) => {
        setFormData(res.data);
      });
    }
  }, [id]);

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      await updateProveedor(id, formData);
      setSuccessModalOpen(true);

      setTimeout(() => {
        setSuccessModalOpen(false);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error('Error al actualizar proveedor', error);
    }
  };

  const renderInput = (name: keyof typeof initialForm, placeholder: string) => (
    <View key={name}>
      <Text className="text-sm font-semibold text-gray-700 mb-1">
        {placeholder}
      </Text>
      <TextInput
        placeholder={placeholder}
        value={formData[name]}
        onChangeText={(value) => handleChange(name, value)}
        className="w-full border border-gray-300 px-4 py-3 rounded-lg"
      />
    </View>
  );

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold text-center text-blue-800 mb-6">
        ✏️ Editar Proveedor
      </Text>
      
      <View className="gap-4">
        {renderInput('nombre', 'Nombre')}
        {renderInput('telefono', 'Teléfono')}
        {renderInput('direccion', 'Dirección')}
        {renderInput('ruc', 'RUC')}
        {renderInput('razon', 'Razón Social')}

        <Pressable
          onPress={handleSubmit}
          className="bg-blue-800 p-4 rounded-lg items-center flex-row justify-center gap-2"
        >
          <Ionicons name="save-outline" size={20} color="white" />
          <Text className="text-white font-bold text-base">
            Guardar Cambios
          </Text>
        </Pressable>
      </View>

      <ModalSuccess
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message="Proveedor actualizado con éxito ✅"
      />
    </View>
  );
};

export default EditarProveedor;