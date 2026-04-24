import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import ModalCobroDeuda from '../ModalsVenta/ModalCobroDeuda';
import { CurrencyDollarIcon, EyeIcon, BanknotesIcon } from 'react-native-heroicons/solid';
import ModalComprobantePago from '../ModalsVenta/ModalComprobantePago';
import ModalListarDetallesPagosDeuda from '../ModalsVenta/ModalListarDetallesPagosDeuda';
import { type ComprobantePago } from '../interface';
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { listarDeudasVenta } from 'services/ventas';
import { formatPY } from 'utils/utils';

const ListarDeudasVenta = () => {
  const [comprobante, setComprobante] = useState<ComprobantePago>();
  const [showComprobante, setShowComprobante] = useState(false);
  const [deudas, setDeudas] = useState<any[]>([]);
  const [montoMaximo, setMontoMaximo] = useState(0);
  const [idDeudaDetalle, setIdDeudaDetalle] = useState(0);
  const [showModalDetailPay, setShowModalDetailPay] = useState(false);
  const [showModalCobroDeuda, setShowModalCobroDeuda] = useState(false);
  const [iddeudaSeleccionada, setIddeudaSeleccionada] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDeudas = async () => {
    try {
      const res = await listarDeudasVenta({ page, limit, search });
      setDeudas(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error al obtener deudas:', error);
      Alert.alert("Error", "No se pudieron cargar las deudas");
    }
  };

  useEffect(() => {
    fetchDeudas();
  }, [page, limit, search]);

  const handleCobrar = (deuda: any) => {
    setIddeudaSeleccionada(deuda.iddeuda);
    setMontoMaximo(deuda.total_deuda - deuda.total_pagado);
    setShowModalCobroDeuda(true);
  };

  const showPayDetails = (idDeudaDetalle: number) => {
    setIdDeudaDetalle(idDeudaDetalle);
    setShowModalDetailPay(true);
  };

  // Componente para el selector de límite
  const LimitSelector = () => (
    <View className="border border-gray-300 rounded-md bg-white">
      <ScrollView className="max-h-40">
        {[5, 10, 20].map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => {
              setLimit(option);
              setPage(1);
            }}
            className={`px-4 py-2 border-b border-gray-200 ${
              limit === option ? 'bg-blue-100' : ''
            }`}
          >
            <Text className={`${limit === option ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
              {option} por página
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View className="flex-1 bg-white rounded-3xl p-6 mt-4 border border-gray-200 mx-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-row items-center gap-3">
          <CurrencyDollarIcon size={32} color="#16a34a" />
          <Text className="text-3xl font-bold text-gray-800">Deudas por Ventas</Text>
        </View>
        <View className="w-40">
          <LimitSelector />
        </View>
      </View>

      {/* Buscador */}
      <View className="relative mb-6">
        <View className="absolute left-3 top-3 z-10">
          <MagnifyingGlassIcon size={20} color="#9ca3af" />
        </View>
        <TextInput
          placeholder="Buscar por cliente o estado..."
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white"
        />
      </View>

      {/* Tabla de deudas */}
      <ScrollView horizontal className="border border-gray-200 rounded-lg mb-4">
        <View className="min-w-full">
          {/* Header de la tabla */}
          <View className="flex-row bg-green-100 border-b border-green-200">
            <View className="w-12 p-3">
              <Text className="text-green-800 font-semibold text-xs">#</Text>
            </View>
            <View className="w-40 p-3">
              <Text className="text-green-800 font-semibold text-xs">Cliente</Text>
            </View>
            <View className="w-28 p-3">
              <Text className="text-green-800 font-semibold text-xs">Total Deuda</Text>
            </View>
            <View className="w-28 p-3">
              <Text className="text-green-800 font-semibold text-xs">Total Pagado</Text>
            </View>
            <View className="w-24 p-3">
              <Text className="text-green-800 font-semibold text-xs">Saldo</Text>
            </View>
            <View className="w-24 p-3">
              <Text className="text-green-800 font-semibold text-xs">Estado</Text>
            </View>
            <View className="w-28 p-3">
              <Text className="text-green-800 font-semibold text-xs">Fecha</Text>
            </View>
            <View className="w-32 p-3">
              <Text className="text-green-800 font-semibold text-xs">Ult. Fecha Pago</Text>
            </View>
            <View className="w-48 p-3">
              <Text className="text-green-800 font-semibold text-xs text-center">Acciones</Text>
            </View>
          </View>

          {/* Filas de deudas */}
          {deudas.map((deuda, idx) => (
            <View key={deuda.iddeuda} className="flex-row border-b border-gray-200 bg-white">
              <View className="w-12 p-3 border-r border-gray-200 justify-center">
                <Text className="text-gray-700 text-sm">{(page - 1) * limit + idx + 1}</Text>
              </View>
              <View className="w-40 p-3 border-r border-gray-200 justify-center">
                <Text className="text-gray-700 text-sm font-medium">{deuda.nombre_cliente}</Text>
              </View>
              <View className="w-28 p-3 border-r border-gray-200 justify-center">
                <Text className="text-gray-700 text-sm">{formatPY(deuda.total_deuda)}</Text>
              </View>
              <View className="w-28 p-3 border-r border-gray-200 justify-center">
                <Text className="text-green-700 text-sm">{formatPY(deuda.total_pagado)}</Text>
              </View>
              <View className="w-24 p-3 border-r border-gray-200 justify-center">
                <Text className="text-red-600 text-sm font-semibold">{formatPY(deuda.saldo)}</Text>
              </View>
              <View className="w-24 p-3 border-r border-gray-200 justify-center">
                <Text className="text-gray-700 text-sm">{deuda.estado}</Text>
              </View>
              <View className="w-28 p-3 border-r border-gray-200 justify-center">
                <Text className="text-gray-700 text-sm">
                  {new Date(deuda.fecha_deuda).toLocaleDateString()}
                </Text>
              </View>
              <View className="w-32 p-3 border-r border-gray-200 justify-center">
                <Text className="text-gray-700 text-sm">
                  {new Date(deuda.ult_fecha_pago).toLocaleDateString()}
                </Text>
              </View>
              <View className="w-48 p-3 justify-center items-center flex-row gap-2">
                <TouchableOpacity
                  onPress={() => handleCobrar(deuda)}
                  className="flex-row items-center gap-1 bg-blue-600 active:bg-blue-700 px-3 py-2 rounded"
                >
                  <BanknotesIcon size={16} color="white" />
                  <Text className="text-white text-sm">Cobrar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => showPayDetails(deuda.iddeuda)}
                  className="flex-row items-center gap-1 bg-gray-500 active:bg-gray-600 px-3 py-2 rounded"
                >
                  <EyeIcon size={16} color="white" />
                  <Text className="text-white text-sm">Ver Pagos</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Paginación */}
      <View className="flex-row justify-between items-center mt-4">
        <TouchableOpacity
          onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className={`px-5 py-2 rounded ${
            page === 1 ? 'bg-gray-400' : 'bg-green-500 active:bg-green-600'
          }`}
        >
          <Text className="text-white">⬅ Anterior</Text>
        </TouchableOpacity>
        
        <Text className="text-sm text-gray-600">
          Página {page} de {totalPages}
        </Text>
        
        <TouchableOpacity
          onPress={() => setPage((prev) => prev + 1)}
          disabled={page >= totalPages}
          className={`px-5 py-2 rounded ${
            page >= totalPages ? 'bg-gray-400' : 'bg-green-500 active:bg-green-600'
          }`}
        >
          <Text className="text-white">Siguiente ➡</Text>
        </TouchableOpacity>
      </View>

      {/* Modales */}
      {showModalCobroDeuda && iddeudaSeleccionada && (
        <ModalCobroDeuda
          montoMaximo={montoMaximo}
          isOpen={showModalCobroDeuda}
          setComprobante={setComprobante}
          setShowComprobante={setShowComprobante}
          onClose={() => setShowModalCobroDeuda(false)}
          idDeuda={iddeudaSeleccionada}
          onSuccess={() => {
            fetchDeudas();
            setShowModalCobroDeuda(false);
          }}
        />
      )}
      
      {showComprobante && comprobante && (
        <ModalComprobantePago
          onClose={() => setShowComprobante(false)}
          comprobante={comprobante}
        />
      )}
      
      <ModalListarDetallesPagosDeuda
        iddeuda={idDeudaDetalle}
        isOpen={showModalDetailPay}
        onClose={() => setShowModalDetailPay(false)}
        onSuccess={() => {
          fetchDeudas();
        }}
      />
    </View>
  );
};

export default ListarDeudasVenta;