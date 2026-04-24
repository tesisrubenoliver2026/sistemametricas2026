import React, { useCallback, useEffect, useState } from 'react';
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
import ModalCrearEgresosVarios from '../ModalMovimiento/Egreso/ModalCrearEgresosVarios';
import ModalAdvert from '../../../../components/ModalAdvert';
import ModalError from '../../../../components/ModalError';
import ModalSuccess from '../../../../components/ModalSuccess';
import { getEgresosPaginated, deleteEgreso } from '../../../../services/egreso';
import { formatPY } from '../../../../utils/utils';

interface Egreso {
  idegreso: number;
  monto: number;
  concepto: string;
  fecha: string;
  tipo_egreso: string;
}

const ListarEgresosVarios = () => {
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [isOpenCrear, setIsOpenCrear] = useState(false);
  const [showAdvert, setShowAdvert] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [egresoAAnular, setEgresoAAnular] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchEgresos = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getEgresosPaginated({
        page,
        limit,
        search,
        fechaDesde,
        fechaHasta
      });
      setEgresos(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error al obtener egresos:', err);
      Alert.alert('Error', 'No se pudieron cargar los egresos');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, fechaDesde, fechaHasta]);

  useEffect(() => {
    fetchEgresos();
  }, [fetchEgresos]);

  const handleAnularEgreso = (id: number, concepto: string) => {
    Alert.alert(
      'Confirmar anulación',
      `¿Estás seguro de que deseas anular el egreso "${concepto}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, anular',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEgreso(id);
              setSuccessModalOpen(true);
              fetchEgresos();
            } catch (err: any) {
              const msg = err.response?.data?.error || 'Error al anular egreso';
              setErrorMessage(msg);
              setShowErrorModal(true);
            }
          },
        },
      ]
    );
  };

  const DateFilterInput = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void; 
  }) => (
    <View className="mb-3">
      <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      <View className="relative">
        <TextInput
          className="bg-white rounded-xl px-4 py-3 border border-gray-200 text-gray-800"
          value={value}
          onChangeText={(text) => { onChange(text); setPage(1); }}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9CA3AF"
        />
        {value ? (
          <Pressable
            onPress={() => { onChange(''); setPage(1); }}
            className="absolute right-3 top-3"
          >
            <Ionicons name="close-circle" size={20} color="#64748b" />
          </Pressable>
        ) : (
          <View className="absolute right-3 top-3">
            <Ionicons name="calendar" size={20} color="#64748b" />
          </View>
        )}
      </View>
    </View>
  );

  const getTipoEgresoColor = (tipo: string) => {
    const colors: { [key: string]: string } = {
      'compra': 'bg-red-100 text-red-700',
      'pago': 'bg-orange-100 text-orange-700',
      'servicio': 'bg-purple-100 text-purple-700',
      'gasto': 'bg-pink-100 text-pink-700',
      'otros': 'bg-gray-100 text-gray-700',
    };
    return colors[tipo.toLowerCase()] || 'bg-red-100 text-red-700';
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
          colors={['#dc2626', '#b91c1c']}
          className="px-5 pt-6 pb-8 rounded-b-3xl shadow-lg"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Ionicons name="trending-down" size={24} color="#fff" />
              </View>
              <Text className="text-2xl font-bold text-white">Egresos Varios</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="relative mb-3">
            <TextInput
              placeholder="Buscar por tipo de egreso o concepto..."
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

          {/* Botón Filtros */}
          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            className="bg-white/20 rounded-xl p-3 flex-row items-center justify-center gap-2"
          >
            <Ionicons name="filter" size={18} color="#fff" />
            <Text className="text-white font-semibold">
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Text>
          </Pressable>
        </LinearGradient>

        {/* Filtros */}
        {showFilters && (
          <View className="px-5 mt-4 bg-white mx-5 rounded-2xl p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">Filtros de Fecha</Text>
            <View className="gap-3">
              <DateFilterInput
                label="Fecha desde"
                value={fechaDesde}
                onChange={setFechaDesde}
              />
              <DateFilterInput
                label="Fecha hasta"
                value={fechaHasta}
                onChange={setFechaHasta}
              />
            </View>
          </View>
        )}

        {/* Botones de Acción */}
        <View className="px-5 mt-4 gap-3">
          <Pressable
            onPress={() => setIsOpenCrear(true)}
            className="active:opacity-80"
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-xl p-4 flex-row items-center justify-center gap-2 shadow-lg"
            >
              <Ionicons name="add-circle" size={22} color="#fff" />
              <Text className="text-white font-bold text-base">Crear Egreso Manual</Text>
            </LinearGradient>
          </Pressable>

          {/* Selector de límite */}
          <View className="bg-white rounded-xl p-4 flex-row items-center justify-between">
            <Text className="text-gray-700 font-medium">Mostrar</Text>
            <View className="flex-row items-center gap-2">
              <TextInput
                className="bg-gray-100 rounded-lg px-3 py-2 text-center text-gray-800 w-16"
                value={limit.toString()}
                onChangeText={(text) => {
                  const newLimit = parseInt(text) || 5;
                  setLimit(newLimit);
                  setPage(1);
                }}
                keyboardType="numeric"
              />
              <Text className="text-gray-600">por página</Text>
            </View>
          </View>
        </View>

        {/* Lista de Egresos */}
        <View className="px-5 mt-4">
          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#dc2626" />
              <Text className="text-gray-500 mt-4">Cargando egresos...</Text>
            </View>
          ) : egresos.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
              <Ionicons name="trending-down-outline" size={64} color="#cbd5e1" />
              <Text className="text-gray-500 mt-4 text-center">
                {search ? 'No se encontraron egresos' : 'No hay egresos registrados'}
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {egresos.map((egreso, idx) => (
                <View
                  key={egreso.idegreso}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  {/* Header con número y tipo */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                      <View className="h-8 w-8 items-center justify-center rounded-full bg-red-100">
                        <Text className="text-red-600 font-bold text-xs">
                          {(page - 1) * limit + idx + 1}
                        </Text>
                      </View>
                      <Text className="text-gray-900 font-bold text-base flex-1" numberOfLines={1}>
                        {egreso.concepto}
                      </Text>
                    </View>
                    <View className={`px-2 py-1 rounded-full ${getTipoEgresoColor(egreso.tipo_egreso)}`}>
                      <Text className="text-xs font-semibold capitalize">
                        {egreso.tipo_egreso}
                      </Text>
                    </View>
                  </View>

                  {/* Información del egreso */}
                  <View className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="calendar" size={16} color="#64748b" />
                        <Text className="text-gray-600 text-sm">
                          {new Date(egreso.fecha).toLocaleDateString('es-ES')}
                        </Text>
                      </View>
                      <Text className="text-red-600 font-bold text-lg">
                        {formatPY(egreso.monto)}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                      <Ionicons name="pricetag" size={16} color="#64748b" />
                      <Text className="text-gray-600 text-sm capitalize">
                        {egreso.tipo_egreso}
                      </Text>
                    </View>
                  </View>

                  {/* Botones de acción */}
                  <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
                    <Pressable
                      onPress={() => handleAnularEgreso(egreso.idegreso, egreso.concepto)}
                      className="flex-1 active:opacity-70"
                    >
                      <View className="bg-red-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
                        <Ionicons name="trash" size={16} color="#fff" />
                        <Text className="text-white font-semibold text-xs">Anular</Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Paginación */}
          {!loading && egresos.length > 0 && (
            <View className="mt-6 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Pressable
                  onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="flex-1 mr-2"
                >
                  <View className={`rounded-xl py-3 flex-row items-center justify-center gap-2 ${page === 1 ? 'bg-gray-200' : 'bg-red-500'}`}>
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
                  <View className={`rounded-xl py-3 flex-row items-center justify-center gap-2 ${page >= totalPages ? 'bg-gray-200' : 'bg-red-500'}`}>
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
      <ModalAdvert
        isOpen={showAdvert}
        onClose={() => setShowAdvert(false)}
        confirmButtonText="Sí, anular"
        message="¿Estás seguro de que deseas anular este egreso? Esta acción no se puede deshacer."
      />
      <ModalSuccess
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message="Anulación procesada con éxito"
      />
      <ModalError
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
      <ModalCrearEgresosVarios
        isOpen={isOpenCrear}
        onClose={() => setIsOpenCrear(false)}
        onSuccess={fetchEgresos}
      />
    </View>
  );
};

export default ListarEgresosVarios;