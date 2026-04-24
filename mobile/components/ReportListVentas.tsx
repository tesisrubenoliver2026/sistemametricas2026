import { useState, useMemo } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ScrollView, 
  Modal, 
  Pressable,
  ActivityIndicator,
  Alert 
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import type { ReporteVentas as ReporteVentasType } from "types/reporte.types";
import {
  Search,
  Filter,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  Wallet,
  Grid3x3,
  List,
  Download,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileText,
  User,
  Package,
} from "lucide-react-native";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ReporteVentasComponentProps {
  reporte: ReporteVentasType;
  onClose: () => void;
  onDownloadPDF?: (tipoFiltro: string) => void;
}

type VistaType = "tabla" | "tarjetas";
type OrdenType = "fecha" | "cliente" | "total" | "tipo" | "ganancia" | "cantidad";
type DireccionOrden = "asc" | "desc";

export const ReportListVentas = ({ reporte, onClose, onDownloadPDF }: ReporteVentasComponentProps) => {
  const [busqueda, setBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [clienteFiltro, setClienteFiltro] = useState<string>("todos");
  const [vista, setVista] = useState<VistaType>("tarjetas");
  const [orden, setOrden] = useState<OrdenType>("fecha");
  const [direccionOrden, setDireccionOrden] = useState<DireccionOrden>("desc");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const filtrosUnicos = useMemo(() => {
    const clientes = new Set(
      reporte.ventas.map((v) => v.cliente_nombre).filter((c) => c && c.trim() !== "")
    );
    return { clientes: Array.from(clientes).sort() };
  }, [reporte.ventas]);

  const ventasFiltradas = useMemo(() => {
    let ventas = [...reporte.ventas];

    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      ventas = ventas.filter(
        (v) =>
          (v.nro_factura || "").toLowerCase().includes(busquedaLower) ||
          (v.cliente_nombre || "").toLowerCase().includes(busquedaLower) ||
          (v.cliente_documento || "").toLowerCase().includes(busquedaLower) ||
          (v.cajero_nombre || "").toLowerCase().includes(busquedaLower)
      );
    }

    if (tipoFiltro !== "todos") ventas = ventas.filter((v) => v.tipo.toLowerCase() === tipoFiltro.toLowerCase());
    if (clienteFiltro !== "todos") ventas = ventas.filter((v) => v.cliente_nombre === clienteFiltro);

    ventas.sort((a, b) => {
      let valorA: any, valorB: any;
      switch (orden) {
        case "fecha":
          valorA = a.fecha ? new Date(a.fecha.split("/").reverse().join("-")).getTime() : 0;
          valorB = b.fecha ? new Date(b.fecha.split("/").reverse().join("-")).getTime() : 0;
          break;
        case "cliente":
          valorA = (a.cliente_nombre || "").toLowerCase();
          valorB = (b.cliente_nombre || "").toLowerCase();
          break;
        case "total":
          valorA = a.total_raw || 0;
          valorB = b.total_raw || 0;
          break;
        case "tipo":
          valorA = (a.tipo || "").toLowerCase();
          valorB = (b.tipo || "").toLowerCase();
          break;
        case "ganancia":
          valorA = a.ganancia_raw || 0;
          valorB = b.ganancia_raw || 0;
          break;
        case "cantidad":
          valorA = a.cantidad_total_productos || 0;
          valorB = b.cantidad_total_productos || 0;
          break;
      }
      if (valorA < valorB) return direccionOrden === "asc" ? -1 : 1;
      if (valorA > valorB) return direccionOrden === "asc" ? 1 : -1;
      return 0;
    });

    return ventas;
  }, [reporte.ventas, busqueda, tipoFiltro, clienteFiltro, orden, direccionOrden]);

  const estadisticasFiltradas = useMemo(() => {
    const totalVentas = ventasFiltradas.length;
    const contado = ventasFiltradas.filter((v) => v.tipo.toLowerCase() === "contado").length;
    const credito = ventasFiltradas.filter((v) => v.tipo.toLowerCase() === "credito").length;
    const montoTotal = ventasFiltradas.reduce((acc, v) => acc + (v.total_raw || 0), 0);
    const gananciaTotal = ventasFiltradas.reduce((acc, v) => acc + (v.ganancia_raw || 0), 0);
    return { 
      totalVentas, 
      contado, 
      credito, 
      montoTotal: montoTotal.toLocaleString("es-PY"), 
      gananciaTotal: gananciaTotal.toLocaleString("es-PY") 
    };
  }, [ventasFiltradas]);

  const cambiarOrden = (nuevoOrden: OrdenType) => {
    if (orden === nuevoOrden) setDireccionOrden(direccionOrden === "asc" ? "desc" : "asc");
    else { setOrden(nuevoOrden); setDireccionOrden("asc"); }
  };

  const limpiarFiltros = () => { 
    setBusqueda(""); 
    setTipoFiltro("todos"); 
    setClienteFiltro("todos"); 
  };

  const handleDownloadPDF = async () => {
    try {
      setLoadingPDF(true);
      if (onDownloadPDF) {
        onDownloadPDF(tipoFiltro);
      }
      // Aquí podrías implementar la lógica para descargar el PDF similar al ejemplo de clientes
    } catch (error: any) {
      console.error('Error al descargar PDF:', error);
      Alert.alert('Error', error.message || 'No se pudo generar el PDF');
    } finally {
      setLoadingPDF(false);
    }
  };

  const FilterButton = ({ active, onPress, label }: { active: boolean; onPress: () => void; label: string }) => (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-lg ${active ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-600'}`}>
        {label}
      </Text>
    </Pressable>
  );

  const SortButton = ({ field, label }: { field: OrdenType; label: string }) => (
    <Pressable
      onPress={() => cambiarOrden(field)}
      className={`px-3 py-2 rounded-lg flex-row items-center gap-1 ${orden === field ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <Text className={`text-sm font-semibold ${orden === field ? 'text-white' : 'text-gray-600'}`}>
        {label}
      </Text>
      {orden === field && (
        <Ionicons 
          name={direccionOrden === "asc" ? "arrow-up" : "arrow-down"} 
          size={14} 
          color={orden === field ? "#fff" : "#64748b"} 
        />
      )}
    </Pressable>
  );

  const renderVentaCard = ({ item: venta }: { item: any }) => (
    <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">Factura: {venta.nro_factura}</Text>
          <Text className="text-sm text-gray-500">ID: {venta.idventa}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${
          venta.tipo.toLowerCase() === 'contado' ? 'bg-green-100' : 'bg-yellow-100'
        }`}>
          <Text className={`text-xs font-semibold ${
            venta.tipo.toLowerCase() === 'contado' ? 'text-green-700' : 'text-yellow-700'
          }`}>
            {venta.tipo}
          </Text>
        </View>
      </View>

      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <User size={16} color="#64748b" />
          <Text className="text-sm text-gray-600">
            {venta.cliente_nombre} - Doc: {venta.cliente_documento}
          </Text>
        </View>
        
        <View className="flex-row items-center gap-2">
          <Calendar size={16} color="#64748b" />
          <Text className="text-sm text-gray-600">{venta.fecha}</Text>
        </View>
        
        <View className="flex-row items-center gap-2">
          <Package size={16} color="#64748b" />
          <Text className="text-sm text-gray-600">{venta.cantidad_total_productos} productos</Text>
        </View>
        
        <View className="flex-row items-center gap-2">
          <TrendingUp size={16} color="#64748b" />
          <Text className="text-sm font-semibold text-green-600">
            Ganancia: ₲ {venta.ganancia_total}
          </Text>
        </View>
        
        <View className="flex-row items-center gap-2">
          <FileText size={16} color="#64748b" />
          <Text className="text-lg font-bold text-blue-600">
            Total: ₲ {venta.total}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderVentaFila = ({ item: venta }: { item: any }) => (
    <View className="bg-white border-b border-gray-200 p-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="font-semibold text-gray-800">{venta.nro_factura}</Text>
          <Text className="text-sm text-gray-500">{venta.cliente_nombre}</Text>
        </View>
        <View className={`px-2 py-1 rounded ${
          venta.tipo.toLowerCase() === 'contado' ? 'bg-green-100' : 'bg-yellow-100'
        }`}>
          <Text className={`text-xs font-semibold ${
            venta.tipo.toLowerCase() === 'contado' ? 'text-green-700' : 'text-yellow-700'
          }`}>
            {venta.tipo}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-between mt-2">
        <Text className="text-sm text-gray-600">{venta.cantidad_total_productos} productos</Text>
        <Text className="text-sm font-semibold text-blue-600">₲ {venta.total}</Text>
      </View>
    </View>
  );

  return (
    <Modal animationType="slide" transparent={false} visible={true} onRequestClose={onClose}>
      <View className="flex-1 bg-gray-50 pt-10">
        {/* Header */}
        <View className="bg-blue-600 px-6 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
                <ShoppingBag size={22} color="#fff" />
              </View>
              <Text className="text-2xl font-bold text-white">{reporte.titulo}</Text>
            </View>
            <Pressable onPress={onClose} className="h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
              <X size={20} color="#fff" />
            </Pressable>
          </View>
          
          <Text className="text-blue-100 text-sm mb-4">
            {ventasFiltradas.length} de {reporte.total_ventas} ventas
            {reporte.fecha_inicio && reporte.fecha_fin && ` • ${reporte.fecha_inicio} - ${reporte.fecha_fin}`}
          </Text>

          {/* Estadísticas */}
          <View className="flex-row flex-wrap gap-3">
            <View className="flex-1 min-w-[45%] bg-blue-500/20 rounded-xl p-3">
              <View className="flex-row items-center gap-2 mb-1">
                <ShoppingBag size={16} color="#bfdbfe" />
                <Text className="text-sm text-blue-100">Total Ventas</Text>
              </View>
              <Text className="text-xl font-bold text-white">
                {estadisticasFiltradas.totalVentas}
              </Text>
              <Text className="text-xs text-blue-200">
                de {reporte.total_ventas} totales
              </Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-blue-500/20 rounded-xl p-3">
              <View className="flex-row items-center gap-2 mb-1">
                <Wallet size={16} color="#bfdbfe" />
                <Text className="text-sm text-blue-100">Contado</Text>
              </View>
              <Text className="text-xl font-bold text-white">
                {estadisticasFiltradas.contado}
              </Text>
              <Text className="text-xs text-blue-200">
                de {reporte.ventas_contado} totales
              </Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-blue-500/20 rounded-xl p-3">
              <View className="flex-row items-center gap-2 mb-1">
                <CreditCard size={16} color="#bfdbfe" />
                <Text className="text-sm text-blue-100">Crédito</Text>
              </View>
              <Text className="text-xl font-bold text-white">
                {estadisticasFiltradas.credito}
              </Text>
              <Text className="text-xs text-blue-200">
                de {reporte.ventas_credito} totales
              </Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-blue-500/20 rounded-xl p-3">
              <View className="flex-row items-center gap-2 mb-1">
                <TrendingUp size={16} color="#bfdbfe" />
                <Text className="text-sm text-blue-100">Monto Total</Text>
              </View>
              <Text className="text-xl font-bold text-white">
                ₲ {estadisticasFiltradas.montoTotal}
              </Text>
              <Text className="text-xs text-blue-200">
                Ganancia: ₲ {estadisticasFiltradas.gananciaTotal}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Búsqueda */}
          <View className="my-4">
            <View className="relative">
              <View className="absolute left-4 top-3.5 z-10">
                <Search size={20} color="#64748b" />
              </View>
              <TextInput
                placeholder="Buscar por factura, cliente, documento..."
                placeholderTextColor="#94a3b8"
                value={busqueda}
                onChangeText={setBusqueda}
                className="bg-white border border-gray-200 rounded-xl px-12 py-3.5 text-gray-800"
              />
            </View>
          </View>

          {/* Filtros */}
          <View className="mb-4 gap-4">
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() => setMostrarFiltros(!mostrarFiltros)}
                className={`flex-row items-center gap-2 px-4 py-2 rounded-lg ${mostrarFiltros ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <Filter size={16} color={mostrarFiltros ? "#fff" : "#64748b"} />
                <Text className={`text-sm font-semibold ${mostrarFiltros ? 'text-white' : 'text-gray-600'}`}>
                  Filtros
                </Text>
              </Pressable>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setVista("tarjetas")}
                  className={`p-2 rounded-lg ${vista === "tarjetas" ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <Grid3x3 size={16} color={vista === "tarjetas" ? "#fff" : "#64748b"} />
                </Pressable>
                <Pressable
                  onPress={() => setVista("tabla")}
                  className={`p-2 rounded-lg ${vista === "tabla" ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <List size={16} color={vista === "tabla" ? "#fff" : "#64748b"} />
                </Pressable>
              </View>
            </View>

            {mostrarFiltros && (
              <View className="bg-gray-50 rounded-xl p-4 gap-4">
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Tipo de Venta</Text>
                  <View className="flex-row gap-3">
                    <FilterButton active={tipoFiltro === 'todos'} onPress={() => setTipoFiltro('todos')} label="Todos" />
                    <FilterButton active={tipoFiltro === 'contado'} onPress={() => setTipoFiltro('contado')} label="Contado" />
                    <FilterButton active={tipoFiltro === 'credito'} onPress={() => setTipoFiltro('credito')} label="Crédito" />
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Cliente</Text>
                  <View className="flex-row flex-wrap gap-2">
                    <FilterButton active={clienteFiltro === 'todos'} onPress={() => setClienteFiltro('todos')} label="Todos" />
                    {filtrosUnicos.clientes.slice(0, 5).map(cliente => (
                      <FilterButton 
                        key={cliente} 
                        active={clienteFiltro === cliente} 
                        onPress={() => setClienteFiltro(cliente)} 
                        label={cliente.length > 15 ? cliente.substring(0, 15) + '...' : cliente} 
                      />
                    ))}
                  </View>
                </View>

                <Pressable onPress={limpiarFiltros} className="self-start px-4 py-2 bg-gray-300 rounded-lg">
                  <Text className="text-sm font-semibold text-gray-600">Limpiar filtros</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Ordenamiento */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Ordenar por</Text>
            <View className="flex-row flex-wrap gap-2">
              <SortButton field="fecha" label="Fecha" />
              <SortButton field="cliente" label="Cliente" />
              <SortButton field="total" label="Total" />
              <SortButton field="ganancia" label="Ganancia" />
              <SortButton field="cantidad" label="Cantidad" />
            </View>
          </View>

          {/* Lista de ventas */}
          {ventasFiltradas.length === 0 ? (
            <View className="py-8 items-center">
              <ShoppingBag size={48} color="#94a3b8" />
              <Text className="text-gray-500 mt-2">No se encontraron ventas</Text>
            </View>
          ) : vista === "tarjetas" ? (
            <View className="gap-3 mb-4">
              {ventasFiltradas.map((venta) => (
                <View key={venta.idventa} className="bg-white border border-gray-200 rounded-xl p-4">
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-800">Factura: {venta.nro_factura}</Text>
                      <Text className="text-sm text-gray-500">ID: {venta.idventa}</Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${
                      venta.tipo.toLowerCase() === 'contado' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <Text className={`text-xs font-semibold ${
                        venta.tipo.toLowerCase() === 'contado' ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {venta.tipo}
                      </Text>
                    </View>
                  </View>

                  <View className="gap-2">
                    <View className="flex-row items-center gap-2">
                      <User size={16} color="#64748b" />
                      <Text className="text-sm text-gray-600">
                        {venta.cliente_nombre} - Doc: {venta.cliente_documento}
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center gap-2">
                      <Calendar size={16} color="#64748b" />
                      <Text className="text-sm text-gray-600">{venta.fecha}</Text>
                    </View>
                    
                    <View className="flex-row items-center gap-2">
                      <Package size={16} color="#64748b" />
                      <Text className="text-sm text-gray-600">{venta.cantidad_total_productos} productos</Text>
                    </View>
                    
                    <View className="flex-row items-center gap-2">
                      <TrendingUp size={16} color="#64748b" />
                      <Text className="text-sm font-semibold text-green-600">
                        Ganancia: ₲ {venta.ganancia_total}
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center gap-2">
                      <FileText size={16} color="#64748b" />
                      <Text className="text-lg font-bold text-blue-600">
                        Total: ₲ {venta.total}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="mb-4 bg-white rounded-xl overflow-hidden">
              {ventasFiltradas.map((venta, idx) => (
                <View
                  key={venta.idventa}
                  className={`border-b border-gray-200 p-4 ${idx === 0 ? 'border-t' : ''} ${idx === ventasFiltradas.length - 1 ? 'border-b-0' : ''}`}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-800">{venta.nro_factura}</Text>
                      <Text className="text-sm text-gray-500">{venta.cliente_nombre}</Text>
                    </View>
                    <View className={`px-2 py-1 rounded ${
                      venta.tipo.toLowerCase() === 'contado' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <Text className={`text-xs font-semibold ${
                        venta.tipo.toLowerCase() === 'contado' ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {venta.tipo}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between mt-2">
                    <Text className="text-sm text-gray-600">{venta.cantidad_total_productos} productos</Text>
                    <Text className="text-sm font-semibold text-blue-600">₲ {venta.total}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Botón de descarga PDF */}
          <View className="pt-4 pb-8">
            <Pressable
              onPress={handleDownloadPDF}
              disabled={loadingPDF}
              className="active:opacity-70"
            >
              <View className="py-3.5 flex-row items-center justify-center gap-2 bg-blue-600 rounded-xl">
                {loadingPDF ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Download size={20} color="#fff" />
                )}
                <Text className="text-white font-bold">
                  {loadingPDF ? 'Generando PDF...' : 'Descargar PDF'}
                </Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};