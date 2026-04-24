import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserCircle, Search, Edit, Trash2, Lock, Unlock } from 'lucide-react-native';
import { getFuncionariosPaginated, deleteFuncionario, changeStatus } from 'services/funcionarios';
import CrearFuncionario from './CrearFuncionario';
import EditarFuncionario from './EditarFuncionario';
import ModalError from 'components/ModalError';
import SelectInput from 'app/clientes/components/SelectInput';

const ListarFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [idFuncionario, setIdFuncionario] = useState<number | string>('');
  const [errorMessage, setErrorMessage] = useState('');

  // Opciones para el SelectInput
  const limitOptions = [
    { value: '5', label: '5 por página' },
    { value: '10', label: '10 por página' },
    { value: '20', label: '20 por página' },
  ];

  const fetchFuncionarios = async () => {
    setLoading(true);
    try {
      const res = await getFuncionariosPaginated({ page, limit, search });
      setFuncionarios(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error al obtener funcionarios:', error);
      Alert.alert('Error', 'No se pudieron cargar los funcionarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este funcionario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFuncionario(id);
              fetchFuncionarios();
              Alert.alert('Éxito', 'Funcionario eliminado correctamente');
            } catch (error) {
              console.error('Error al eliminar funcionario:', error);
              setErrorMessage('❌ No se pudo eliminar el funcionario');
            }
          },
        },
      ]
    );
  };

  const handleChangeStatus = async (id: number, estado: string) => {
    const nuevoEstado = estado === 'activo' ? 'inactivo' : 'activo';
    
    Alert.alert(
      'Cambiar estado',
      `¿Deseas cambiar el estado a ${nuevoEstado}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await changeStatus(id, { estado: nuevoEstado });
              fetchFuncionarios();
              Alert.alert('Éxito', `Estado cambiado a ${nuevoEstado}`);
            } catch (error) {
              console.error('Error al cambiar estado:', error);
              setErrorMessage('❌ No se pudo cambiar el estado');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchFuncionarios();
  }, [page, limit, search]);

  const handleEdit = (id: number) => {
    setIdFuncionario(id);
    setModalEditarOpen(true);
  };

  const handleLimitChange = (name: string, value: string) => {
    setLimit(Number(value));
    setPage(1);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header con gradiente */}
      <View className="bg-blue-600 px-4 pt-16 pb-6 shadow-lg">
        {/* Título y descripción */}
        <View className="mb-4">
          <View className="flex-row items-center gap-3 mb-2">
            <View className="bg-white/20 p-2 rounded-xl">
              <UserCircle size={28} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white">Funcionarios</Text>
              <Text className="text-blue-100 text-sm mt-1">
                {funcionarios.length} funcionario{funcionarios.length !== 1 ? 's' : ''} registrado{funcionarios.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Selector de límite */}
        <View className="mb-4">
          <Text className="text-white text-xs font-medium mb-2">Registros por página</Text>
          <SelectInput
            name="limit"
            value={String(limit)}
            onChange={handleLimitChange}
            options={limitOptions}
            placeholder="Límite"
          />
        </View>

        {/* Buscador */}
        <View className="relative mb-4">
          <View className="absolute left-3 top-3.5 z-10">
            <Search size={20} color="#9CA3AF" />
          </View>
          <TextInput
            placeholder="Buscar por nombre, apellido o login..."
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 border-2 border-white/30 rounded-xl bg-white shadow-md text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch('')}
              className="absolute right-3 top-3.5 z-10"
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* Botón crear */}
        <TouchableOpacity
          onPress={() => setModalCrearOpen(true)}
          className="bg-white rounded-xl py-3 flex-row items-center justify-center gap-2 shadow-md"
        >
          <Ionicons name="add-circle" size={20} color="#10b981" />
          <Text className="text-green-600 font-semibold">Crear Funcionario</Text>
        </TouchableOpacity>

        {/* Paginación compacta en el header */}
        <View className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 mt-4">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="flex-1 mr-2"
            >
              <View className={`rounded-lg py-2 flex-row items-center justify-center gap-1 ${
                page === 1 ? 'bg-white/10' : 'bg-white'
              }`}>
                <Ionicons name="chevron-back" size={16} color={page === 1 ? '#9ca3af' : '#2563eb'} />
                <Text className={`text-xs font-semibold ${page === 1 ? 'text-gray-300' : 'text-blue-600'}`}>
                  Anterior
                </Text>
              </View>
            </Pressable>

            <View className="px-3">
              <Text className="text-white font-bold text-sm">
                {page} / {totalPages}
              </Text>
            </View>

            <Pressable
              onPress={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              className="flex-1 ml-2"
            >
              <View className={`rounded-lg py-2 flex-row items-center justify-center gap-1 ${
                page >= totalPages ? 'bg-white/10' : 'bg-white'
              }`}>
                <Text className={`text-xs font-semibold ${page >= totalPages ? 'text-gray-300' : 'text-blue-600'}`}>
                  Siguiente
                </Text>
                <Ionicons name="chevron-forward" size={16} color={page >= totalPages ? '#9ca3af' : '#2563eb'} />
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Contenido con ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      >
        {/* Lista de Cards */}
        {loading ? (
          <View className="py-16 items-center bg-white rounded-2xl">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-500 mt-3 font-medium">Cargando funcionarios...</Text>
          </View>
        ) : funcionarios.length === 0 ? (
          <View className="bg-white rounded-2xl p-12 items-center">
            <View className="bg-gray-100 p-4 rounded-full mb-4">
              <UserCircle size={48} color="#9ca3af" />
            </View>
            <Text className="text-gray-500 text-center text-base">
              No hay funcionarios registrados
            </Text>
            <Text className="text-gray-400 text-center text-sm mt-2">
              {search ? 'Intenta con otro término de búsqueda' : 'Crea un nuevo funcionario para comenzar'}
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {funcionarios.map((funcionario: any, idx: number) => (
              <View
                key={funcionario.idfuncionario}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Header del Card */}
                <View className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 flex-row justify-between items-center border-b border-blue-100">
                  <View className="flex-row items-center gap-2 flex-1">
                    <View className="bg-blue-600 px-2.5 py-1 rounded-full">
                      <Text className="text-white text-xs font-bold">
                        #{(page - 1) * limit + idx + 1}
                      </Text>
                    </View>
                    <Text className="text-lg font-bold text-blue-900 flex-1" numberOfLines={1}>
                      {funcionario.nombre} {funcionario.apellido}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${
                    funcionario.estado === 'activo' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      funcionario.estado === 'activo' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {funcionario.estado?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Contenido del Card */}
                <View className="p-4">
                  {/* Información del funcionario */}
                  <View className="gap-2 mb-4">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="briefcase-outline" size={16} color="#6b7280" />
                      <Text className="text-xs text-gray-500">Tipo:</Text>
                      <Text className="text-sm font-medium text-gray-700 flex-1">
                        {funcionario.tipo_funcionario || 'N/A'}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                      <Ionicons name="person-circle-outline" size={16} color="#6b7280" />
                      <Text className="text-xs text-gray-500">Login:</Text>
                      <Text className="text-sm font-medium text-gray-700 flex-1">
                        {funcionario.login || 'N/A'}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                      <Ionicons name="call-outline" size={16} color="#6b7280" />
                      <Text className="text-xs text-gray-500">Teléfono:</Text>
                      <Text className="text-sm font-medium text-gray-700 flex-1">
                        {funcionario.telefono || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Botones de acción */}
                  <View className="flex-row flex-wrap gap-2">
                    <TouchableOpacity
                      onPress={() => handleEdit(funcionario.idfuncionario)}
                      className="flex-1 min-w-[100px] bg-blue-500 active:bg-blue-600 px-4 py-2.5 rounded-lg flex-row items-center justify-center gap-2"
                    >
                      <Edit size={16} color="white" />
                      <Text className="text-white text-sm font-semibold">Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleChangeStatus(funcionario.idfuncionario, funcionario.estado)}
                      className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg flex-row items-center justify-center gap-2 ${
                        funcionario.estado === 'activo'
                          ? 'bg-yellow-500 active:bg-yellow-600'
                          : 'bg-green-500 active:bg-green-600'
                      }`}
                    >
                      {funcionario.estado === 'activo' ? (
                        <Lock size={16} color="white" />
                      ) : (
                        <Unlock size={16} color="white" />
                      )}
                      <Text className="text-white text-sm font-semibold">
                        {funcionario.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDelete(funcionario.idfuncionario)}
                      className="bg-red-500 active:bg-red-600 px-4 py-2.5 rounded-lg flex-row items-center justify-center gap-2"
                    >
                      <Trash2 size={16} color="white" />
                      <Text className="text-white text-sm font-semibold">Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modales */}
      {modalCrearOpen && (
        <CrearFuncionario
          onClose={() => setModalCrearOpen(false)}
          onSuccess={() => {
            setModalCrearOpen(false);
            fetchFuncionarios();
          }}
        />
      )}

      {modalEditarOpen && (
        <EditarFuncionario
          id={idFuncionario}
          onClose={() => setModalEditarOpen(false)}
          onSuccess={() => {
            setModalEditarOpen(false);
            fetchFuncionarios();
          }}
        />
      )}

      <ModalError
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage('')}
        message={errorMessage}
      />
    </View>
  );
};

export default ListarFuncionarios;