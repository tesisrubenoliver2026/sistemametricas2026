import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Save } from 'lucide-react-native';
import ModalSuccess from '../../../components/ModalSuccess';
import ModalError from '../../../components/ModalError';
import ModalSeleccionarCategoria from './ModalsProductos/ModalSeleccionarCategoria';
import ModalConfirmUpdate from './ModalsProductos/ModalConfirmUpdate';
import { getProductoById, updateProducto } from '../../../services/productos';

const initialForm = {
  nombre_producto: '',
  precio_venta: '',
  idcategoria: '',
  ubicacion: '',
  cod_barra: '',
  iva: '',
  estado: 'activo',
  unidad_medida: ''
};

interface EditarProductoProps {
  id: number | string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const CustomSelect = ({ options, selectedValue, onValueChange, title }: any) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white flex-row justify-between items-center"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-base text-gray-700">
          {options.find((opt: any) => opt.value === selectedValue)?.label || 'Seleccionar'}
        </Text>
        <Text className="text-gray-400">▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-2xl p-4">
            <View className='flex-row justify-between items-center mb-4'>
              <Text className="text-xl font-bold">{title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-2xl font-bold">X</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {options.map((item: any) => (
                <TouchableOpacity
                  key={item.value}
                  className="p-4 border-b border-gray-200"
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text className="text-lg">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const EditarProducto = ({ id, onSuccess, onClose }: EditarProductoProps) => {
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  const [categoriaNombre, setCategoriaNombre] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      getProductoById(id).then((res) => {
        const data = res.data;
        setFormData({
          nombre_producto: data.nombre_producto || '',
          precio_venta: data.precio_venta ?? '',
          idcategoria: data.idcategoria ?? '',
          ubicacion: data.ubicacion || '',
          cod_barra: data.cod_barra || '',
          iva: data.iva || '',
          estado: data.estado || 'activo',
          unidad_medida: data.unidad_medida || '',
        });
        // Aquí podrías cargar el nombre de la categoría si lo necesitas
      });
    }
  }, [id]);

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    setConfirmModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      await updateProducto(id, formData);
      onSuccess && onSuccess();
      onClose && onClose();
      setConfirmModalOpen(false);
      setSuccessModalOpen(true);
    } catch (error: any) {
      console.error('Error al actualizar producto:', error.response?.data?.message);
      setErrorMessage(error.response?.data?.message || 'Error al actualizar el producto');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 py-6">
      <View className="bg-white p-6 rounded-xl shadow-lg">
        <Text className="text-3xl font-bold text-center text-blue-700 mb-6">✏️ Editar Producto</Text>

        {/* Nombre del producto */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Nombre del producto</Text>
          <TextInput
            value={formData.nombre_producto}
            onChangeText={(value) => handleChange('nombre_producto', value)}
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Nombre del producto"
          />
        </View>

        {/* Código de barra */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Código de Barra</Text>
          <TextInput
            value={formData.cod_barra}
            onChangeText={(value) => handleChange('cod_barra', value)}
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Código de barra"
          />
        </View>

        {/* Precio de venta */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Precio de venta</Text>
          <TextInput
            value={formData.precio_venta ? formData.precio_venta.toString() : ''}
            onChangeText={(value) => handleChange('precio_venta', value)}
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Precio de venta"
          />
        </View>

        {/* Seleccionar Categoría */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={() => setModalCategoriaOpen(true)}
            className="w-full bg-blue-100 py-3 px-4 rounded-md"
          >
            <Text className="text-blue-800 font-medium text-center">Seleccionar Categoría</Text>
          </TouchableOpacity>
          {categoriaNombre && (
            <Text className="text-sm text-green-700 mt-1">
              📦 Categoría seleccionada: <Text className="font-semibold">{categoriaNombre}</Text>
            </Text>
          )}
        </View>

        {/* Ubicación */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Ubicación</Text>
          <TextInput
            value={formData.ubicacion}
            onChangeText={(value) => handleChange('ubicacion', value)}
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Ubicación"
          />
        </View>

        {/* IVA */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">IVA</Text>
          <CustomSelect
            title="Seleccionar IVA"
            options={[
              { label: 'Seleccionar IVA', value: '' },
              { label: '5%', value: '5' },
              { label: '10%', value: '10' },
            ]}
            selectedValue={formData.iva}
            onValueChange={(value: string) => handleChange('iva', value)}
          />
        </View>

        {/* Unidad de medida */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Unidad de medida</Text>
          <TextInput
            value={formData.unidad_medida}
            onChangeText={(value) => handleChange('unidad_medida', value)}
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Unidad de medida"
          />
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="flex-row items-center justify-center gap-2 w-full bg-blue-600 py-4 rounded-lg mt-4"
        >
          <Save size={20} color="white" />
          <Text className="text-white text-lg font-semibold">Guardar Cambios</Text>
        </TouchableOpacity>
      </View>

      {/* Modales */}
      <ModalSuccess
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message="Producto actualizado con éxito ✅"
      />
      <ModalError
        isOpen={!!errorMessage}
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />
      <ModalConfirmUpdate
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmUpdate}
        data={formData}
      />
      <ModalSeleccionarCategoria
        isOpen={modalCategoriaOpen}
        onClose={() => setModalCategoriaOpen(false)}
        onSelect={(categoria) => {
          setFormData({ ...formData, idcategoria: categoria.idcategorias });
          setCategoriaNombre(categoria.categoria);
          setModalCategoriaOpen(false);
        }}
      />
    </ScrollView>
  );
};

export default EditarProducto;
