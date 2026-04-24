import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList
} from 'react-native';
import { ClipboardDocumentListIcon } from "react-native-heroicons/outline";
import ModalError from '../../../../components/ModalError';
import { listarArqueosPaginado } from '../../../../services/arqueo';

interface Arqueo {
  idarqueo: number;
  total: number;
  idmovimiento: number;
  num_caja: string;
  fecha_apertura: string;
  estado: string;
  login: string;
}

const ListarArqueosCaja = () => {
  const [arqueos, setArqueos] = useState<Arqueo[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchArqueos = async () => {
    try {
      const res = await listarArqueosPaginado({ page, limit, search });
      setArqueos(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setErrorMessage('❌ Error al obtener arqueos');
      setErrorOpen(true);
    }
  };

  useEffect(() => {
    fetchArqueos();
  }, [page, limit, search]);

  const renderArqueoItem = ({ item, index }: { item: Arqueo; index: number }) => (
    <View className="flex-row border-b border-gray-200 px-4 py-3 hover:bg-gray-50">
      <View className="w-8 justify-center">
        <Text className="text-sm text-gray-700">{(page - 1) * limit + index + 1}</Text>
      </View>
      <View className="w-16 justify-center">
        <Text className="text-sm text-gray-700">{item.num_caja}</Text>
      </View>
      <View className="w-24 justify-center">
        <Text className="text-sm text-gray-700">{item.login}</Text>
      </View>
      <View className="w-40 justify-center">
        <Text className="text-sm text-gray-700">
          {new Date(item.fecha_apertura).toLocaleString('es-ES')}
        </Text>
      </View>
      <View className="w-32 justify-center">
        <Text className="text-sm text-gray-700 text-right">{item.total.toLocaleString()} Gs</Text>
      </View>
      <View className="w-24 justify-center items-center">
        <View className={`px-2 py-1 rounded-full ${
          item.estado === 'cerrado' ? 'bg-red-100' : 'bg-green-100'
        }`}>
          <Text className={`text-xs font-semibold ${
            item.estado === 'cerrado' ? 'text-red-700' : 'text-green-700'
          }`}>
            {item.estado.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );

  const TableHeader = () => (
    <View className="bg-indigo-100 flex-row px-4 py-3">
      <View className="w-8">
        <Text className="text-xs font-semibold text-indigo-800 uppercase">#</Text>
      </View>
      <View className="w-16">
        <Text className="text-xs font-semibold text-indigo-800 uppercase">Caja</Text>
      </View>
      <View className="w-24">
        <Text className="text-xs font-semibold text-indigo-800 uppercase">Usuario</Text>
      </View>
      <View className="w-40">
        <Text className="text-xs font-semibold text-indigo-800 uppercase">Fecha Apertura</Text>
      </View>
      <View className="w-32">
        <Text className="text-xs font-semibold text-indigo-800 uppercase text-right">Total</Text>
      </View>
      <View className="w-24">
        <Text className="text-xs font-semibold text-indigo-800 uppercase text-center">Estado</Text>
      </View>
    </View>
  );

  return (
    <ScrollView className="bg-gradient-to-br from-gray-50 to-white flex-1 py-4">
      <View className="max-w-6xl mx-auto bg-white rounded-3xl shadow-lg p-8 border border-gray-200 my-4">
        <View className="flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <View className="flex-row items-center gap-3">
            <ClipboardDocumentListIcon size={32} color="#4F46E5" />
            <Text className="text-2xl sm:text-3xl font-bold text-gray-800">Arqueos de Caja</Text>
          </View>
          <View className="flex-col sm:flex-row gap-2 items-center">
            <TextInput
              className="w-full sm:w-72 px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="🔍 Buscar por número de caja, usuario, estado..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                setPage(1);
              }}
            />
            <View className="flex-row items-center gap-2">
              <TextInput
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-16 text-center"
                value={limit.toString()}
                onChangeText={(text) => {
                  const newLimit = parseInt(text) || 5;
                  setLimit(newLimit);
                  setPage(1);
                }}
                keyboardType="numeric"
              />
              <Text className="text-sm text-gray-600">por página</Text>
            </View>
          </View>
        </View>

        <View className="rounded-lg border border-gray-200">
          <TableHeader />
          <FlatList
            data={arqueos}
            renderItem={renderArqueoItem}
            keyExtractor={(item) => item.idarqueo.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Paginación */}
        <View className="flex-row justify-between items-center mt-6">
          <TouchableOpacity
            className="bg-indigo-500 px-5 py-2 rounded shadow"
            onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            <Text className="text-white font-medium">⬅ Anterior</Text>
          </TouchableOpacity>
          
          <Text className="text-sm text-gray-600">
            <Text>Página </Text>
            <Text className="font-bold">{page}</Text>
            <Text> de </Text>
            <Text className="font-bold">{totalPages}</Text>
          </Text>
          
          <TouchableOpacity
            className="bg-indigo-500 px-5 py-2 rounded shadow"
            onPress={() => setPage((prev) => prev + 1)}
            disabled={page >= totalPages}
          >
            <Text className="text-white font-medium">Siguiente ➡</Text>
          </TouchableOpacity>
        </View>

        <ModalError
          isOpen={errorOpen}
          onClose={() => setErrorOpen(false)}
          message={errorMessage}
        />
      </View>
    </ScrollView>
  );
};

export default ListarArqueosCaja;