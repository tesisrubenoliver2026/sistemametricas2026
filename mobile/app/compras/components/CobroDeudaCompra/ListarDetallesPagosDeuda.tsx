import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Trash2, Search, CreditCard } from 'lucide-react-native';
import ModalAdvert from 'components/ModalAdvert';
import ModalSuccess from 'components/ModalSuccess';
import { fetchDetallesPago, anularPagoDeudaCompra } from 'services/compras';
import { formatPY } from 'utils/utils';
import ModalError from 'components/ModalError';

interface Props {
  iddeuda: number;
  onSuccess?: () => void;
}

const ListarDetallesPagosDeuda: React.FC<Props> = ({ iddeuda, onSuccess }) => {
  const [detalles, setDetalles] = useState<any[]>([]);
  const [showAdvert, setShowAdvert] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [idPagoAAnular, setIdPagoAAnular] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDetalles = async () => {
    setLoading(true);
    try {
      const response = await fetchDetallesPago(iddeuda, page, search);
      setDetalles(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error al cargar detalles de pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnular = (idpago: number) => {
    setIdPagoAAnular(idpago);
    setShowAdvert(true);
  };

  const confirmarAnulacion = async () => {
    if (idPagoAAnular === null) return;

    try {
      await anularPagoDeudaCompra(idPagoAAnular);
      setSuccessModalOpen(true);
      fetchDetalles();
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Error al anular el pago:', error);
      setErrorMessage('❌ Error al anular el pago.');
    } finally {
      setShowAdvert(false);
      setIdPagoAAnular(null);
    }
  };

  useEffect(() => {
    fetchDetalles();
  }, [page, search]);

  const renderDetalleItem = ({ item, index: idx }: { item: any; index: number }) => (
    <View className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-xs text-gray-500 mb-1">#{(page - 1) * 5 + idx + 1}</Text>
          <Text className="font-semibold text-gray-800 text-lg">{formatPY(item.monto_pagado)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleAnular(item.idpago_deuda_compra)}
          className="p-2 bg-red-100 rounded-lg"
        >
          <Trash2 size={18} color="#dc2626" />
        </TouchableOpacity>
      </View>

      <View className="gap-2">
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">Fecha:</Text>
          <Text className="text-sm text-gray-800">
            {new Date(item.fecha_pago).toLocaleString('es-PY')}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">Método:</Text>
          <Text className="text-sm font-medium text-gray-800">{item.metodo_pago}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-600">Observación:</Text>
          <Text className="text-sm text-gray-700 flex-1 text-right">{item.observacion}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="mt-6 bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-6">
        <CreditCard size={24} color="#059669" />
        <Text className="text-2xl font-bold text-gray-800">Historial de Pagos</Text>
      </View>

      {/* Buscador */}
      <View className="relative mb-4">
        <View className="absolute left-3 top-3 z-10">
          <Search size={18} color="#9CA3AF" />
        </View>
        <TextInput
          placeholder="Buscar por observación, método o autor..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white"
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setPage(1);
          }}
        />
      </View>

      {/* Lista */}
      {loading ? (
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : detalles.length === 0 ? (
        <Text className="text-gray-500 text-center mt-4">No hay registros encontrados.</Text>
      ) : (
        <FlatList
          data={detalles}
          renderItem={renderDetalleItem}
          keyExtractor={(item) => item.idpago_deuda_compra.toString()}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        />
      )}

      {/* Paginación */}
      <View className="flex-row justify-between items-center mt-6">
        <TouchableOpacity
          onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className={`px-4 py-2 bg-gray-200 rounded ${page === 1 ? 'opacity-50' : ''}`}
        >
          <Text className="text-gray-700">⬅ Anterior</Text>
        </TouchableOpacity>
        <Text className="text-sm text-gray-700">
          Página <Text className="font-bold">{page}</Text> de <Text className="font-bold">{totalPages}</Text>
        </Text>
        <TouchableOpacity
          onPress={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className={`px-4 py-2 bg-gray-200 rounded ${page === totalPages ? 'opacity-50' : ''}`}
        >
          <Text className="text-gray-700">Siguiente ➡</Text>
        </TouchableOpacity>
      </View>

      {/* Modales */}
      <ModalAdvert
        isOpen={showAdvert}
        onClose={() => setShowAdvert(false)}
        onConfirm={confirmarAnulacion}
        message="¿Estás seguro de que deseas anular este pago? Esta acción actualizará la deuda."
        confirmButtonText="Sí, Anular"
      />
      <ModalSuccess
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message="Anulación procesada con éxito"
      />
      <ModalError
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage("")}
        message={errorMessage}
      />
    </View>
  );
};

export default ListarDetallesPagosDeuda;
