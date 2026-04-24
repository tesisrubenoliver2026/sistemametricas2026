import { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Search,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Wallet,
  Download,
  X,
  Calendar,
  FileText,
  Building2,
  Package,
} from "lucide-react-native";
import type { ReporteCompras as ReporteComprasType } from "../../../types/reporte.types";

interface ReporteComprasComponentProps {
  reporte: ReporteComprasType;
  onClose: () => void;
  onDownloadPDF?: (tipoFiltro: string) => void;
}

type OrdenType = "fecha" | "proveedor" | "total" | "tipo" | "cantidad";
type DireccionOrden = "asc" | "desc";

export const ReporteCompras = ({
  reporte,
  onClose,
  onDownloadPDF,
}: ReporteComprasComponentProps) => {
  const [busqueda, setBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [proveedorFiltro, setProveedorFiltro] = useState<string>("todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Extraer valores únicos para filtros
  const filtrosUnicos = useMemo(() => {
    const proveedores = new Set(
      reporte.compras
        .map((c) => c.proveedor_nombre)
        .filter((p) => p && p.trim() !== "")
    );

    return {
      proveedores: Array.from(proveedores).sort(),
    };
  }, [reporte.compras]);

  // Filtrar compras
  const comprasFiltradas = useMemo(() => {
    let compras = [...reporte.compras];

    // Filtro de búsqueda
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      compras = compras.filter(
        (c) =>
          (c.nro_factura || "").toLowerCase().includes(busquedaLower) ||
          (c.proveedor_nombre || "").toLowerCase().includes(busquedaLower) ||
          (c.proveedor_ruc || "").toLowerCase().includes(busquedaLower) ||
          (c.cajero_nombre || "").toLowerCase().includes(busquedaLower)
      );
    }

    // Filtro de tipo
    if (tipoFiltro !== "todos") {
      compras = compras.filter((c) => c.tipo.toLowerCase() === tipoFiltro.toLowerCase());
    }

    // Filtro de proveedor
    if (proveedorFiltro !== "todos") {
      compras = compras.filter((c) => c.proveedor_nombre === proveedorFiltro);
    }

    return compras;
  }, [reporte.compras, busqueda, tipoFiltro, proveedorFiltro]);

  // Estadísticas de compras filtradas
  const estadisticasFiltradas = useMemo(() => {
    const totalCompras = comprasFiltradas.length;
    const contado = comprasFiltradas.filter((c) => c.tipo.toLowerCase() === "contado").length;
    const credito = comprasFiltradas.filter((c) => c.tipo.toLowerCase() === "credito").length;
    const montoTotal = comprasFiltradas.reduce(
      (acc, c) => acc + (c.total_raw || 0),
      0
    );

    return {
      totalCompras,
      contado,
      credito,
      montoTotal: montoTotal.toLocaleString("es-PY"),
    };
  }, [comprasFiltradas]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setTipoFiltro("todos");
    setProveedorFiltro("todos");
  };

  const renderCompraItem = ({ item: compra }: { item: any }) => (
    <View className="bg-white border border-gray-200 rounded-lg p-4 mb-3 mx-2">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center">
              <ShoppingCart size={16} color="#059669" />
            </View>
            <Text className="text-xs font-medium text-gray-500">ID: {compra.idcompra}</Text>
          </View>
        </View>
        <View className={`px-2 py-1 rounded-full ${
          compra.tipo.toLowerCase() === "contado" ? "bg-green-100" : "bg-yellow-100"
        }`}>
          <Text className={`text-xs font-medium ${
            compra.tipo.toLowerCase() === "contado" ? "text-green-800" : "text-yellow-800"
          }`}>
            {compra.tipo}
          </Text>
        </View>
      </View>

      {/* Información */}
      <View className="space-y-2 mb-3">
        <View className="flex-row items-center gap-2">
          <FileText size={14} color="#9CA3AF" />
          <Text className="text-sm text-gray-600">Factura: {compra.nro_factura}</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Calendar size={14} color="#9CA3AF" />
          <Text className="text-sm text-gray-600">{compra.fecha}</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Building2 size={14} color="#9CA3AF" />
          <Text className="text-sm text-gray-600">{compra.proveedor_nombre}</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Package size={14} color="#9CA3AF" />
          <Text className="text-sm text-gray-600">{compra.cantidad_total_productos} productos</Text>
        </View>
      </View>

      {/* Total */}
      <View className="border-t border-gray-200 pt-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-gray-500">Total:</Text>
          <Text className="text-lg font-bold text-green-600">₲ {compra.total}</Text>
        </View>
      </View>

      {compra.observacion && (
        <View className="mt-2 pt-2 border-t border-gray-200">
          <Text className="text-xs text-gray-500">Obs: {compra.observacion}</Text>
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 bg-white rounded-t-3xl mt-16">
          {/* Header */}
          <View className="bg-green-600 p-6 rounded-t-3xl">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-3xl font-bold text-white mb-2">{reporte.titulo}</Text>
                <Text className="text-green-100 text-sm">
                  Reporte detallado de compras realizadas
                  {reporte.fecha_inicio && reporte.fecha_fin && (
                    <>
                      {"\n"}• {reporte.fecha_inicio} - {reporte.fecha_fin}
                    </>
                  )}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="p-2 bg-white/20 rounded-lg"
              >
                <X size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Estadísticas principales */}
            <View className="flex-row flex-wrap gap-2">
              <View className="flex-1 min-w-[140px] bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <ShoppingCart size={18} color="#d1fae5" />
                  <Text className="text-xs text-green-100">Total Compras</Text>
                </View>
                <Text className="text-2xl font-bold text-white">
                  {estadisticasFiltradas.totalCompras}
                </Text>
                <Text className="text-xs text-green-200">
                  de {reporte.total_compras} totales
                </Text>
              </View>

              <View className="flex-1 min-w-[140px] bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Wallet size={18} color="#d1fae5" />
                  <Text className="text-xs text-green-100">Contado</Text>
                </View>
                <Text className="text-2xl font-bold text-white">
                  {estadisticasFiltradas.contado}
                </Text>
                <Text className="text-xs text-green-200">
                  de {reporte.compras_contado} totales
                </Text>
              </View>

              <View className="flex-1 min-w-[140px] bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <CreditCard size={18} color="#d1fae5" />
                  <Text className="text-xs text-green-100">Crédito</Text>
                </View>
                <Text className="text-2xl font-bold text-white">
                  {estadisticasFiltradas.credito}
                </Text>
                <Text className="text-xs text-green-200">
                  de {reporte.compras_credito} totales
                </Text>
              </View>

              <View className="flex-1 min-w-[140px] bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <TrendingUp size={18} color="#d1fae5" />
                  <Text className="text-xs text-green-100">Monto Total</Text>
                </View>
                <Text className="text-xl font-bold text-white">
                  ₲ {estadisticasFiltradas.montoTotal}
                </Text>
                <Text className="text-xs text-green-200">compras realizadas</Text>
              </View>
            </View>
          </View>

          {/* Barra de herramientas */}
          <View className="p-4 border-b border-gray-200 bg-gray-50">
            <View className="flex-row items-center gap-3 mb-3">
              {/* Buscador */}
              <View className="flex-1 relative">
                <View className="absolute left-3 top-3 z-10">
                  <Search size={18} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="Buscar por factura, proveedor..."
                  value={busqueda}
                  onChangeText={setBusqueda}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Botón de filtros */}
              <TouchableOpacity
                onPress={() => setMostrarFiltros(!mostrarFiltros)}
                className={`p-2 rounded-lg ${
                  mostrarFiltros ? "bg-green-600" : "bg-white border border-gray-300"
                }`}
              >
                <Ionicons
                  name="filter"
                  size={20}
                  color={mostrarFiltros ? "#ffffff" : "#000000"}
                />
              </TouchableOpacity>

              {/* Botón de descarga */}
              {onDownloadPDF && (
                <TouchableOpacity
                  onPress={() => onDownloadPDF(tipoFiltro)}
                  className="p-2 bg-blue-600 rounded-lg"
                >
                  <Download size={20} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>

            {/* Panel de filtros expandible */}
            {mostrarFiltros && (
              <View className="bg-white rounded-lg border border-gray-200 p-3">
                <Text className="text-sm font-medium text-gray-700 mb-2">Tipo de Compra</Text>
                <View className="flex-row gap-2 mb-3">
                  <TouchableOpacity
                    onPress={() => setTipoFiltro("todos")}
                    className={`flex-1 px-3 py-2 rounded-lg ${
                      tipoFiltro === "todos" ? "bg-green-600" : "bg-gray-100"
                    }`}
                  >
                    <Text className={`text-center text-xs font-semibold ${
                      tipoFiltro === "todos" ? "text-white" : "text-gray-700"
                    }`}>
                      Todos
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setTipoFiltro("contado")}
                    className={`flex-1 px-3 py-2 rounded-lg ${
                      tipoFiltro === "contado" ? "bg-green-600" : "bg-gray-100"
                    }`}
                  >
                    <Text className={`text-center text-xs font-semibold ${
                      tipoFiltro === "contado" ? "text-white" : "text-gray-700"
                    }`}>
                      Contado
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setTipoFiltro("credito")}
                    className={`flex-1 px-3 py-2 rounded-lg ${
                      tipoFiltro === "credito" ? "bg-green-600" : "bg-gray-100"
                    }`}
                  >
                    <Text className={`text-center text-xs font-semibold ${
                      tipoFiltro === "credito" ? "text-white" : "text-gray-700"
                    }`}>
                      Crédito
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={limpiarFiltros}
                  className="mt-2 py-2 px-4 bg-gray-100 rounded-lg"
                >
                  <Text className="text-center text-sm text-gray-600">Limpiar filtros</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Contenido - Lista de compras */}
          {comprasFiltradas.length === 0 ? (
            <View className="flex-1 items-center justify-center p-8">
              <ShoppingCart size={64} color="#D1D5DB" />
              <Text className="text-lg font-medium text-gray-500 mt-4">No se encontraron compras</Text>
              <Text className="text-sm text-gray-400">Intenta ajustar los filtros de búsqueda</Text>
            </View>
          ) : (
            <FlatList
              data={comprasFiltradas}
              renderItem={renderCompraItem}
              keyExtractor={(item) => item.idcompra.toString()}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}

          {/* Footer */}
          <View className="p-4 border-t border-gray-200 bg-gray-50">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">
                Mostrando <Text className="font-semibold">{comprasFiltradas.length}</Text> de{" "}
                <Text className="font-semibold">{reporte.total_compras}</Text> compras
              </Text>
              <Text className="text-xs text-gray-500">
                {tipoFiltro !== "todos" || proveedorFiltro !== "todos" || busqueda
                  ? "Filtros activos"
                  : "Sin filtros"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
