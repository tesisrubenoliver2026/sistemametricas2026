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
import ModalCrearVenta from '../ModalsVenta/ModalCrearVenta';
import ModalDetalleVenta from '../ModalsVenta/ModalDetalleVenta';
import { deleteVenta, getVentasPaginated, getReporteVentasData, generateReporteVentasPDF } from 'services/ventas';
import { getCargoUsuario } from 'services/usuarios';
import ModalError from 'components/ModalError';
import { ReportListVentas } from 'components/ReportListVentas';
import { ReporteVentasResponse } from 'types/reporte.types';

interface Venta {
  idventa: number;
  nombre_cliente: string;
  documento_cliente: string;
  fecha: string;
  total: string;
  total_ganancia: string;
  tipo: string;
  estado: string;
}

const ListarVentas = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [search, setSearch] = useState("");
  const [modalCrearVentaOpen, setModalCrearVentaOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [datosReporte, setDatosReporte] = useState<ReporteVentasResponse | null>(null);
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cargo, setCargo] = useState("");
  const [loadingReporte, setLoadingReporte] = useState(false);

  const isAdmin = cargo === "Administrador";

  const fetchCargo = async () => {
    try {
      const { data } = await getCargoUsuario();
      setCargo(data.acceso);
    } catch (error) {
      console.error('Error al obtener cargo:', error);
    }
  };

  const fetchVentas = async () => {
    try {
      setLoading(true);
      const res = await getVentasPaginated({ page, limit, search });
      setVentas(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Error al obtener ventas:", error);
      setErrorMessage("Error al cargar las ventas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCargo();
  }, []);

  useEffect(() => {
    fetchVentas();
  }, [page, limit, search]);

  const handleDelete = async (id: number, cliente: string) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar la venta de ${cliente}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVenta(id);
              fetchVentas();
            } catch (error) {
              setErrorMessage('No se pudo eliminar la venta');
            }
          },
        },
      ]
    );
  };

  const handleGenerateReporteList = async () => {
    try {
      setLoadingReporte(true);
      const fechaInicio = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const fechaFin = new Date().toISOString().split('T')[0];
      console.log('Generando reporte con:', { search, fecha_inicio: fechaInicio, fecha_fin: fechaFin });
      const res = await getReporteVentasData({ 
        search, 
        fecha_inicio: fechaInicio, 
        fecha_fin: fechaFin, 
        tipo: '' 
      });
      
      const ventas = res.data.data || res.data;
      const filtros = res.data.filtros || {};
      const estadisticas = res.data.estadisticas || {};

      const totalVentas = estadisticas.total_ventas || ventas.length;
      const ventasContado = estadisticas.ventas_contado || ventas.filter((v: any) => v.tipo.toLowerCase() === 'contado').length;
      const ventasCredito = estadisticas.ventas_credito || ventas.filter((v: any) => v.tipo.toLowerCase() === 'credito').length;

      const reporteTransformado: ReporteVentasResponse = {
        message: '✅ Reporte de ventas generado correctamente',
        datosReporte: {
          empresa: {
            nombre_fantasia: '',
            ruc: '',
            timbrado_nro: '',
            fecha_inicio_vigente: '',
            fecha_fin_vigente: '',
            fecha_emision: new Date().toLocaleDateString('es-PY')
          },
          reporte: {
            titulo: 'Reporte de Ventas',
            fecha_inicio: filtros.fecha_inicio,
            fecha_fin: filtros.fecha_fin,
            total_ventas: totalVentas,
            ventas_contado: ventasContado,
            ventas_credito: ventasCredito,
            monto_total_ventas: estadisticas.monto_total_ventas || '0',
            monto_total_descuentos: estadisticas.monto_total_descuentos || '0',
            ganancia_total: estadisticas.ganancia_total || '0',
            cantidad_total_productos: estadisticas.cantidad_total_productos || 0,
            ventas: ventas
          }
        }
      };

      setDatosReporte(reporteTransformado);
      setMostrarReporte(true);
    } catch (error) {
      console.error("❌ Error al generar reporte de ventas:", error);
      setErrorMessage("Error al generar el reporte");
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleDownloadPDF = async (tipoFiltro: string) => {
    try {
      const fechaInicio = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const fechaFin = new Date().toISOString().split('T')[0];

      const res = await generateReporteVentasPDF({ 
        search, 
        fecha_inicio: fechaInicio, 
        fecha_fin: fechaFin, 
        tipo: tipoFiltro 
      });
      
      // Aquí necesitarías manejar la descarga del PDF en React Native
      // Esto podría requerir una implementación específica para RN
      console.log('PDF generado:', res.data);
      Alert.alert('Éxito', 'PDF generado correctamente');
    } catch (error) {
      console.error("❌ Error al generar PDF de ventas:", error);
      setErrorMessage("Error al generar el PDF");
    }
  };

  const formatCurrency = (amount: string) => {
    return `₲ ${parseInt(amount).toLocaleString("es-PY")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
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
          colors={['#3b82f6', '#2563eb']}
          className="px-5 pt-6 pb-8 rounded-b-3xl shadow-lg"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Ionicons name="cart" size={24} color="#fff" />
              </View>
              <Text className="text-2xl font-bold text-white">Ventas</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="relative mb-3">
            <TextInput
              placeholder="Buscar por cliente o documento..."
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
          <View className="flex-row gap-3">
            <Pressable
              onPress={handleGenerateReporteList}
              disabled={loadingReporte}
              className="flex-1 active:opacity-80"
            >
              <LinearGradient
                colors={loadingReporte ? ['#94a3b8', '#64748b'] : ['#a855f7', '#9333ea']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl p-3 flex-row items-center justify-center gap-2"
              >
                {loadingReporte ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="document-text" size={18} color="#fff" />
                )}
                <Text className="text-white font-semibold">
                  {loadingReporte ? 'Generando...' : 'Reporte'}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => setModalCrearVentaOpen(true)}
              className="flex-1 active:opacity-80"
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl p-3 flex-row items-center justify-center gap-2"
              >
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text className="text-white font-semibold">Crear Venta</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Selector de límite */}
        <View className="px-5 mt-4">
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

        {/* Lista de Ventas */}
        <View className="px-5 mt-4">
          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-500 mt-4">Cargando ventas...</Text>
            </View>
          ) : ventas.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
              <Ionicons name="cart-outline" size={64} color="#cbd5e1" />
              <Text className="text-gray-500 mt-4 text-center">
                {search ? 'No se encontraron ventas' : 'No hay ventas registradas'}
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {ventas.map((venta, idx) => (
                <View
                  key={venta.idventa}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  {/* Header con número y cliente */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <Text className="text-blue-600 font-bold text-xs">
                            {(page - 1) * limit + idx + 1}
                          </Text>
                        </View>
                        <Text className="text-gray-900 font-bold text-lg flex-1" numberOfLines={1}>
                          {venta.nombre_cliente}
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center gap-2 mt-2">
                        <Ionicons name="document" size={14} color="#64748b" />
                        <Text className="text-gray-600 text-sm">{venta.documento_cliente}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Información de la venta */}
                  <View className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="calendar" size={14} color="#64748b" />
                        <Text className="text-gray-600 text-sm">{formatDate(venta.fecha)}</Text>
                      </View>
                      <Text className="text-green-600 font-bold text-base">
                        {formatCurrency(venta.total)}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View className={`px-2 py-1 rounded-full ${
                        venta.tipo.toLowerCase() === 'contado' 
                          ? 'bg-green-100' 
                          : 'bg-blue-100'
                      }`}>
                        <Text className={`text-xs font-semibold ${
                          venta.tipo.toLowerCase() === 'contado' 
                            ? 'text-green-700' 
                            : 'text-blue-700'
                        }`}>
                          {venta.tipo.toUpperCase()}
                        </Text>
                      </View>
                      <Text className="text-blue-600 font-semibold text-sm">
                        Ganancia: {formatCurrency(venta.total_ganancia)}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                      <Ionicons name="flag" size={14} color="#64748b" />
                      <Text className="text-gray-600 text-sm capitalize">
                        Estado: {venta.estado}
                      </Text>
                    </View>
                  </View>

                  {/* Botones de acción */}
                  <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
                    <Pressable
                      onPress={() => setSelectedVenta(venta)}
                      className="flex-1 active:opacity-70"
                    >
                      <View className="bg-blue-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
                        <Ionicons name="eye" size={16} color="#fff" />
                        <Text className="text-white font-semibold text-xs">Ver Detalle</Text>
                      </View>
                    </Pressable>

                    {isAdmin && (
                      <Pressable
                        onPress={() => handleDelete(venta.idventa, venta.nombre_cliente)}
                        className="active:opacity-70"
                      >
                        <View className="bg-red-500 rounded-lg py-2.5 px-3 flex-row items-center justify-center">
                          <Ionicons name="trash" size={16} color="#fff" />
                        </View>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Paginación */}
          {!loading && ventas.length > 0 && (
            <View className="mt-6 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Pressable
                  onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="flex-1 mr-2"
                >
                  <View className={`rounded-xl py-3 flex-row items-center justify-center gap-2 ${page === 1 ? 'bg-gray-200' : 'bg-blue-500'}`}>
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
                  <View className={`rounded-xl py-3 flex-row items-center justify-center gap-2 ${page >= totalPages ? 'bg-gray-200' : 'bg-blue-500'}`}>
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
      <ModalCrearVenta
        isOpen={modalCrearVentaOpen}
        onClose={() => setModalCrearVentaOpen(false)}
        onSuccess={fetchVentas}
      />

      <ModalDetalleVenta
        isOpen={!!selectedVenta}
        venta={selectedVenta}
        onClose={() => setSelectedVenta(null)}
      />

      <ModalError 
        isOpen={!!errorMessage} 
        onClose={() => setErrorMessage("")} 
        message={errorMessage}
      />

      {mostrarReporte && datosReporte && (
        <ReportListVentas
          reporte={datosReporte.datosReporte.reporte}
          onClose={() => setMostrarReporte(false)}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </View>
  );
};

export default ListarVentas;