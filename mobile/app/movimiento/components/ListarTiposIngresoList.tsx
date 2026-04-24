import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ModaCrearTipoIngreso from './ModalMovimiento/ModalCrearTipoIngreso';
import { getTiposIngresoPaginated, anularTipoIngreso } from '../../../services/ingreso';
import ModalAdvert from '../../../components/ModalAdvert';
import ModalSuccess from '../../../components/ModalSuccess';
import ModalError from '../../../components/ModalError';

interface TipoIngreso {
  idtipo_ingreso: number;
  descripcion: string;
  created_at: string;
}

interface ListarTiposIngresosProps {
  onSelect?: (tipo: TipoIngreso) => void;
}

const ListarTiposIngresos = ({ onSelect }: ListarTiposIngresosProps) => {
  const [ingresos, setIngresos] = useState<TipoIngreso[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showAdvert, setShowAdvert] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [idIngresoAAnular, setIdIngresoAAnular] = useState<number | null>(null);

  const fetchIngresos = async () => {
    try {
      setLoading(true);
      const res = await getTiposIngresoPaginated({ page, limit, search });
      setIngresos(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error al obtener tipos de ingresos:', error);
      setErrorMessage('Error al obtener los tipos de ingresos.');
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAnular = (id: number, descripcion: string) => {
    Alert.alert(
      'Confirmar anulación',
      `¿Estás seguro de que deseas anular el tipo de ingreso "${descripcion}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, anular',
          style: 'destructive',
          onPress: async () => {
            try {
              await anularTipoIngreso(id);
              setSuccessModalOpen(true);
              fetchIngresos();
            } catch (error) {
              console.error('Error al anular tipo de ingreso:', error);
              setErrorMessage('No se pudo anular el tipo de ingreso.');
              setErrorModalOpen(true);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchIngresos();
  }, [page, limit, search]);

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <LinearGradient
          colors={['#10b981', '#059669']}
          className="px-5 pt-6 pb-8 rounded-b-3xl shadow-lg"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Ionicons name="pricetag" size={24} color="#fff" />
              </View>
              <Text className="text-2xl font-bold text-white">Tipos de Ingresos</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="relative mb-3">
            <TextInput
              placeholder="Buscar por descripción..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                setPage(1);
              }}
              className="bg-white rounded-xl px-12 py-3 text-gray-800"
            />
            <View className="absolute left-4 top-3.5">
              <Ionicons name="search" size={20} color="#64748b" />
            </View>
            {search.length > 0 && (
              <Pressable
                onPress={() => setSearch('')}
                className="absolute right-4 top-3.5"
              >
                <Ionicons name="close-circle" size={20} color="#64748b" />
              </Pressable>
            )}
          </View>

          {/* Botones de Acción */}
          <View className="flex-row gap-3 ">
            <Pressable
              onPress={() => setIsOpen(true)}
              className='mt-1 bg-white rounded-full'
            >
              <View className=" rounded-full p-3 flex-row items-center justify-center gap-2 "
              >
                <Ionicons name="add-circle" size={18} color="#059669" />
                <Text className="text-green-700 font-semibold">Crear Nuevo</Text>
              </View>
            </Pressable>

            <View className="bg-white/20 rounded-xl p-3 flex-row items-center justify-center flex-1 gap-5">
              <Text className="text-white text-sm">Mostrar</Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  className="bg-white rounded-lg px-2 py-1 text-center text-gray-800 w-12"
                  value={limit.toString()}
                  onChangeText={(text) => {
                    const newLimit = parseInt(text) || 5;
                    setLimit(newLimit);
                    setPage(1);
                  }}
                  keyboardType="numeric"
                />
                
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Lista de Tipos de Ingresos */}
        <View className="px-5 mt-4">
          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#10b981" />
              <Text className="text-gray-500 mt-4">Cargando tipos de ingresos...</Text>
            </View>
          ) : ingresos.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
              <Ionicons name="pricetag-outline" size={64} color="#cbd5e1" />
              <Text className="text-gray-500 mt-4 text-center">
                {search ? 'No se encontraron tipos de ingresos' : 'No hay tipos de ingresos registrados'}
              </Text>
              {!search && (
                <Pressable
                  onPress={() => setIsOpen(true)}
                  className="mt-4 active:opacity-70"
                >
                  <View className="bg-green-500 rounded-lg px-4 py-2">
                    <Text className="text-white font-semibold">Crear primer tipo</Text>
                  </View>
                </Pressable>
              )}
            </View>
          ) : (
            <View className="gap-3">
              {ingresos.map((ingreso, idx) => (
                <View
                  key={ingreso.idtipo_ingreso}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  {/* Header con número y descripción */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-green-100">
                          <Text className="text-green-600 font-bold text-xs">
                            {(page - 1) * limit + idx + 1}
                          </Text>
                        </View>
                        <Text className="text-gray-900 font-bold text-lg flex-1" numberOfLines={2}>
                          {ingreso.descripcion}
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center gap-2 mt-2">
                        <Ionicons name="calendar" size={14} color="#64748b" />
                        <Text className="text-gray-600 text-sm">
                          Creado: {formatFecha(ingreso.created_at)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Botones de acción */}
                  <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
                    {onSelect ? (
                      <Pressable
                        onPress={() => onSelect(ingreso)}
                        className="flex-1 active:opacity-70"
                      >
                        <View className="bg-blue-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
                          <Ionicons name="checkmark-circle" size={16} color="#fff" />
                          <Text className="text-white font-semibold text-xs">Seleccionar</Text>
                        </View>
                      </Pressable>
                    ) : (
                      <>
                        <Pressable
                          onPress={() => handleAnular(ingreso.idtipo_ingreso, ingreso.descripcion)}
                          className="flex-1 active:opacity-70"
                        >
                          <View className="bg-red-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
                            <Ionicons name="trash" size={16} color="#fff" />
                            <Text className="text-white font-semibold text-xs">Anular</Text>
                          </View>
                        </Pressable>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Paginación */}
          {!loading && ingresos.length > 0 && (
            <View className="mt-6 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Pressable
                  onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="flex-1 mr-2"
                >
                  <View className={`rounded-xl py-3 flex-row items-center justify-center gap-2 ${page === 1 ? 'bg-gray-200' : 'bg-green-500'}`}>
                    <Ionicons name="chevron-back" size={18} color={page === 1 ? '#9ca3af' : '#fff'} />
                    <Text className={`font-semibold ${page === 1 ? 'text-gray-400' : 'text-white'}`}>Anterior</Text>
                  </View>
                </Pressable>

                <View className="px-4">
                  <Text className="text-gray-600 font-medium text-center">
                    Página {page} de {totalPages}
                  </Text>
                </View>

                <Pressable
                  onPress={() => setPage((prev) => prev + 1)}
                  disabled={page >= totalPages}
                  className="flex-1 ml-2"
                >
                  <View className={`rounded-xl py-3 flex-row items-center justify-center gap-2 ${page >= totalPages ? 'bg-gray-200' : 'bg-green-500'}`}>
                    <Text className={`font-semibold ${page >= totalPages ? 'text-gray-400' : 'text-white'}`}>Siguiente</Text>
                    <Ionicons name="chevron-forward" size={18} color={page >= totalPages ? '#9ca3af' : '#fff'} />
                  </View>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modales */}
      <ModaCrearTipoIngreso
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={fetchIngresos}
      />

      <ModalAdvert
        isOpen={showAdvert}
        onClose={() => setShowAdvert(false)}
        message="¿Estás seguro de que deseas anular este tipo de ingreso?"
        confirmButtonText="Sí, Anular"
      />

      <ModalSuccess
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message="Anulación procesada con éxito"
      />

      <ModalError
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        message={errorMessage}
      />
    </View>
  );
};

export default ListarTiposIngresos;