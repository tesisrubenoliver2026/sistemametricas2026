import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Pressable,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ModalCobroDeuda from '../ModalsVenta/ModalCobroDeuda';
import ModalComprobantePago from '../ModalsVenta/ModalComprobantePago';
import ModalListarDetallesPagosDeuda from '../ModalsVenta/ModalListarDetallesPagosDeuda';
import { type ComprobantePago } from '../interface';
import ModalListarClienteDVenta from '../ModalsVenta/ModalListarClienteDVentas';
import { listarDeudasVentaAgrupadasPorCliente, listarDeudasVentaCompletoPorCliente } from 'services/ventas';
import { formatPY } from 'utils/utils';

const ListarDeudasVentaCliente = () => {
  const [comprobante, setComprobante] = useState<ComprobantePago>();
  const [showComprobante, setShowComprobante] = useState(false);
  const [deudas, setDeudas] = useState<any[]>([]);
  const [montoMaximo, setMontoMaximo] = useState(0);
  const [nombreCliente, setNombreCliente] = useState<string | null>(null);
  const [documentoCliente, setDocumentoCliente] = useState<string | null>(null);
  const [estadoCliente, setEstadoCliente] = useState<string | null>(null);
  const [disableSearch, setDisableSearch] = useState(false);
  const [showModalDetailPay, setShowModalDetailPay] = useState(false);
  const [showModalCobroDeuda, setShowModalCobroDeuda] = useState(false);
  const [iddeudaSeleccionada, setIddeudaSeleccionada] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchDeudasComplete = async () => {
    try {
      const response = await listarDeudasVentaCompletoPorCliente({
        numDocumento: documentoCliente ?? "",
        estado: estadoCliente ?? ""
      });

      if (response.data.reportePDFBase64) {
        // En React Native, manejamos el PDF de manera diferente
        console.log("PDF generado:", response.data.reportePDFBase64);
        Alert.alert(
          "PDF Generado",
          "El reporte de deudas se ha generado correctamente.",
          [{ text: "OK" }]
        );
        // Aquí podrías usar react-native-print o react-native-blob-util para manejar el PDF
      } else {
        console.warn("⚠️ No se encontró el PDF en la respuesta.");
      }
    } catch (error) {
      console.error("Error al obtener la deuda del cliente:", error);
      Alert.alert("Error", "No se pudo generar el reporte PDF");
    }
  };

  const fetchDeudas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listarDeudasVentaAgrupadasPorCliente({ page, limit, search });
      setDeudas(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error al obtener deudas:', error);
      Alert.alert("Error", "No se pudieron cargar las deudas de los clientes.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchDeudas();
  }, [fetchDeudas]);

  const handleCobrar = (deuda: any) => {
    setIddeudaSeleccionada(deuda.iddeuda);
    setMontoMaximo(deuda.total_deuda - deuda.total_pagado);
    setShowModalCobroDeuda(true);
  };

  const handleDataforModal = (deuda: any) => {
    setNombreCliente(deuda.nombre_cliente);
    handleCobrar(deuda);
    setDocumentoCliente(deuda.numDocumento);
    setEstadoCliente(deuda.estado);
    setDisableSearch(true);
  }

  const renderDeudaItem = ({ item: deuda, index }: { item: any, index: number }) => (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* Header con número y cliente */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <Text className="text-green-600 font-bold text-xs">
                {(page - 1) * limit + index + 1}
              </Text>
            </View>
            <Text className="text-gray-900 font-bold text-base flex-1" numberOfLines={1}>
              {deuda.nombre_cliente}
            </Text>
          </View>
          <View className="flex-row items-center gap-2 mt-1 ml-1">
            <Ionicons name="id-card-outline" size={14} color="#64748b" />
            <Text className="text-gray-600 text-sm">{deuda.numDocumento}</Text>
          </View>
        </View>
      </View>

      {/* Información financiera */}
      <View className="gap-2 my-2">
        <View className="flex-row justify-between items-center bg-gray-50 p-2 rounded-lg">
          <Text className="text-sm text-gray-600">Total Deuda:</Text>
          <Text className="text-sm font-semibold text-gray-800">{formatPY(deuda.total_deuda)}</Text>
        </View>
        <View className="flex-row justify-between items-center bg-gray-50 p-2 rounded-lg">
          <Text className="text-sm text-gray-600">Total Pagado:</Text>
          <Text className="text-sm font-semibold text-green-700">{formatPY(deuda.total_pagado)}</Text>
        </View>
        <View className="flex-row justify-between items-center bg-red-50 p-2 rounded-lg">
          <Text className="text-sm font-bold text-red-700">Saldo Pendiente:</Text>
          <Text className="text-sm font-bold text-red-700">{formatPY(deuda.saldo)}</Text>
        </View>
      </View>

      {/* Fecha */}
      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-xs text-gray-500">Fecha de la deuda:</Text>
        <Text className="text-xs font-medium text-gray-700">
          {new Date(deuda.fecha_deuda).toLocaleDateString('es-PY')}
        </Text>
      </View>

      {/* Botón de acción */}
      <View className="mt-4 pt-3 border-t border-gray-100">
        <Pressable
          onPress={() => handleDataforModal(deuda)}
          className="flex-1 active:opacity-70"
        >
          <View className="bg-blue-600 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
            <Ionicons name="eye-outline" size={16} color="#fff" />
            <Text className="text-white font-semibold text-xs">Ver Detalles de Deudas</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#16a34a', '#15803d']}
        className="px-5 pt-6 pb-8 rounded-b-3xl shadow-lg"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Ionicons name="cash-outline" size={24} color="#fff" />
            </View>
            <Text className="text-2xl font-bold text-white">Deudas por Venta</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="relative">
          <TextInput
            placeholder="Buscar por cliente o documento..."
            placeholderTextColor="#a3e635"
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              setPage(1);
            }}
            className="bg-white/20 rounded-xl px-12 py-3 text-white"
          />
          <View className="absolute left-4 top-3.5">
            <Ionicons name="search" size={20} color="#a3e635" />
          </View>
          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch('')}
              className="absolute right-4 top-3.5"
            >
              <Ionicons name="close-circle" size={20} color="#a3e635" />
            </Pressable>
          )}
        </View>
      </LinearGradient>

      {loading ? (
        <View className="py-20 items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="text-gray-500 mt-4">Cargando deudas...</Text>
        </View>
      ) : (
        <FlatList
          data={deudas}
          renderItem={renderDeudaItem}
          keyExtractor={(item) => item.iddeuda}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          ListEmptyComponent={
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm mt-4">
              <Ionicons name="sad-outline" size={64} color="#cbd5e1" />
              <Text className="text-gray-500 mt-4 text-center">
                {search ? 'No se encontraron deudas' : 'No hay deudas pendientes'}
              </Text>
            </View>
          }
          ListFooterComponent={() =>
            !loading && deudas.length > 0 ? (
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
            ) : null
        }
        />
      )}

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
        iddeuda={0}
        isOpen={showModalDetailPay}
        onClose={() => setShowModalDetailPay(false)}
        onSuccess={() => {
          fetchDeudas();
        }}
      />
      
      <ModalListarClienteDVenta
        key={nombreCliente ?? 'empty'}
        disableSearch={disableSearch}
        isOpen={!!nombreCliente}
        generateReport={fetchDeudasComplete}
        setEstadoCliente={setEstadoCliente}
        onClose={() => {
          setNombreCliente(null);
          setDisableSearch(false);
        }}
        nombreCliente={nombreCliente || ''}
      />
    </View>
  );
};

export default ListarDeudasVentaCliente;