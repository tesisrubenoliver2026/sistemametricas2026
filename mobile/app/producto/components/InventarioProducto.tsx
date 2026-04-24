import { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, FlatList } from "react-native";
import type { ReporteInventario } from "../../../types/reporte.types";
import SelectInput from "app/clientes/components/SelectInput";
import {
  Search,
  Filter,
  Package,
  TrendingUp,
  TrendingDown,
  Download,
  X,
} from "lucide-react-native";

interface InventarioProductoProps {
  reporte: ReporteInventario;
  onClose: () => void;
  onDownloadPDF: () => void;
}

type OrdenType = "nombre" | "stock" | "precio" | "categoria" | "valor";
type DireccionOrden = "asc" | "desc";

export const InventarioProducto = ({
  reporte,
  onClose,
  onDownloadPDF,
}: InventarioProductoProps) => {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");
  const [orden] = useState<OrdenType>("nombre");
  const [direccionOrden] = useState<DireccionOrden>("asc");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  const [modalEstadoOpen, setModalEstadoOpen] = useState(false);

  // Extraer categorías únicas
  const categorias = useMemo(() => {
    const cats = new Set(
      reporte.productos.map((p) => p.nombre_categoria)
    );
    return Array.from(cats).sort();
  }, [reporte.productos]);

  // Filtrar y ordenar productos
  const productosFiltrados = useMemo(() => {
    let productos = [...reporte.productos];

    // Filtro de búsqueda
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      productos = productos.filter(
        (p) =>
          p.nombre_producto.toLowerCase().includes(busquedaLower) ||
          p.cod_barra.toLowerCase().includes(busquedaLower) ||
          p.ubicacion.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtro de categoría
    if (categoriaFiltro !== "todas") {
      productos = productos.filter(
        (p) => p.nombre_categoria === categoriaFiltro
      );
    }

    // Filtro de estado
    if (estadoFiltro !== "todos") {
      productos = productos.filter((p) => p.estado === estadoFiltro);
    }

    // Ordenamiento
    productos.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (orden) {
        case "nombre":
          valorA = a.nombre_producto.toLowerCase();
          valorB = b.nombre_producto.toLowerCase();
          break;
        case "stock":
          valorA = a.stock;
          valorB = b.stock;
          break;
        case "precio":
          valorA = parseFloat(a.precio_venta.replace(/\./g, ""));
          valorB = parseFloat(b.precio_venta.replace(/\./g, ""));
          break;
        case "categoria":
          valorA = a.nombre_categoria.toLowerCase();
          valorB = b.nombre_categoria.toLowerCase();
          break;
        case "valor":
          valorA = parseFloat(a.valor_total.replace(/\./g, ""));
          valorB = parseFloat(b.valor_total.replace(/\./g, ""));
          break;
      }

      if (valorA < valorB) return direccionOrden === "asc" ? -1 : 1;
      if (valorA > valorB) return direccionOrden === "asc" ? 1 : -1;
      return 0;
    });

    return productos;
  }, [
    reporte.productos,
    busqueda,
    categoriaFiltro,
    estadoFiltro,
    orden,
    direccionOrden,
  ]);

  // Estadísticas de productos filtrados
  const estadisticasFiltradas = useMemo(() => {
    const totalProductos = productosFiltrados.length;
    const totalStock = productosFiltrados.reduce((acc, p) => acc + p.stock, 0);
    const totalValor = productosFiltrados.reduce(
      (acc, p) => acc + parseFloat(p.valor_total.replace(/\./g, "")),
      0
    );

    return {
      totalProductos,
      totalStock,
      totalValor: totalValor.toLocaleString("es-PY"),
    };
  }, [productosFiltrados]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoriaFiltro("todas");
    setEstadoFiltro("todos");
  };

  const estadosoptions = [
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo" },
  ];

  const renderProductoCard = ({ item: producto }: { item: any }) => (
    <View className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {producto.nombre_producto}
          </Text>
          <Text className="text-xs text-gray-500">ID: {producto.idproducto}</Text>
        </View>
        <View className={`px-2 py-1 rounded ${producto.estado === "activo"
          ? "bg-green-100"
          : "bg-gray-100"
          }`}>
          <Text className={`text-xs font-medium ${producto.estado === "activo"
            ? "text-green-800"
            : "text-gray-800"
            }`}>
            {producto.estado}
          </Text>
        </View>
      </View>

      <View className="border-t border-gray-100 pt-2 mt-2">
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs text-gray-500">Categoría:</Text>
          <View className="bg-purple-100 px-2 py-0.5 rounded">
            <Text className="text-xs font-medium text-purple-800">
              {producto.nombre_categoria}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-xs text-gray-500">Stock:</Text>
          <View className="flex-row items-center">
            {producto.stock <= 5 ? (
              <TrendingDown size={14} color="#EF4444" />
            ) : producto.stock >= 50 ? (
              <TrendingUp size={14} color="#10B981" />
            ) : null}
            <Text className={`text-sm font-medium ml-1 ${producto.stock <= 5
              ? "text-red-600"
              : producto.stock >= 50
                ? "text-green-600"
                : "text-gray-900"
              }`}>
              {producto.stock}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-1">
          <Text className="text-xs text-gray-500">Código:</Text>
          <Text className="text-xs text-gray-900">{producto.cod_barra}</Text>
        </View>
      </View>

      <View className="border-t border-gray-100 pt-2 mt-2">
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs text-gray-500">Precio:</Text>
          <Text className="text-sm font-medium text-gray-900">
            ₲ {producto.precio_venta}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs font-medium text-gray-700">Valor Total:</Text>
          <Text className="text-sm font-bold text-blue-600">
            ₲ {producto.valor_total}
          </Text>
        </View>
      </View>

      <View className="mt-2 pt-2 border-t border-gray-100">
        <Text className="text-xs text-gray-500">
          {producto.ubicacion}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-blue-600 pt-12 pb-6 px-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-white flex-1">
              {reporte.titulo}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 bg-white/20 rounded-lg"
            >
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Estadísticas */}
          <View className="flex-row flex-wrap gap-2">
            <View className="bg-white/10 rounded-lg p-3 flex-1 min-w-[45%]">
              <View className="flex-row items-center mb-1">
                <Package size={16} color="#DBEAFE" />
                <Text className="text-xs text-blue-100 ml-1">Productos</Text>
              </View>
              <Text className="text-xl font-bold text-white">
                {estadisticasFiltradas.totalProductos}
              </Text>
            </View>

            <View className="bg-white/10 rounded-lg p-3 flex-1 min-w-[45%]">
              <Text className="text-xs text-blue-100 mb-1">Stock Total</Text>
              <Text className="text-xl font-bold text-white">
                {estadisticasFiltradas.totalStock}
              </Text>
            </View>

            <View className="bg-white/10 rounded-lg p-3 flex-1 min-w-[45%]">
              <Text className="text-xs text-blue-100 mb-1">Valor Inventario</Text>
              <Text className="text-lg font-bold text-white">
                ₲ {estadisticasFiltradas.totalValor}
              </Text>
            </View>

            <View className="bg-white/10 rounded-lg p-3 flex-1 min-w-[45%]">
              <Text className="text-xs text-blue-100 mb-1">Stock en Cajas</Text>
              <Text className="text-xl font-bold text-white">
                {reporte.total_stock_cajas.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Barra de herramientas */}
        <View className="p-4 bg-white border-b border-gray-200">
          {/* Buscador */}
          <View className="relative mb-3">
         
            <TextInput
              placeholder="Buscar por nombre, código o ubicación..."
              value={busqueda}
              onChangeText={setBusqueda}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white"
            />
          </View>

          {/* Botones */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex-1 flex-row items-center justify-center gap-2 px-4 py-2 rounded-lg ${mostrarFiltros ? "bg-blue-600" : "bg-white border border-gray-300"
                }`}
            >
              <Filter size={16} color={mostrarFiltros ? "white" : "#374151"} />
              <Text className={mostrarFiltros ? "text-white" : "text-gray-700"}>
                Filtros
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onDownloadPDF}
              className="flex-row items-center gap-2 px-4 py-2 bg-green-600 rounded-lg"
            >
              <Download size={16} color="white" />
              <Text className="text-white font-medium">PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Panel de filtros */}
          {mostrarFiltros && (
            <View className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col gap-3">
              <View className="flex flex-row gap-2">
                <SelectInput
                  name="categoriaFiltro"
                  value={categoriaFiltro}
                  onChange={(name, value) => setCategoriaFiltro(value)}
                  placeholder="Seleccionar categoría"
                  options={[
                    { value: "todas", label: "Todas las categorías" },
                    ...categorias.map(cat => ({ value: cat, label: cat }))
                  ]}
                />
                <SelectInput
                  name="estadofiltro"
                  value={estadoFiltro}
                  onChange={(name, value) => setEstadoFiltro(value)}
                  placeholder="Seleccionar estado"
                  options={estadosoptions}
                />
              </View>
              <TouchableOpacity
                onPress={limpiarFiltros}
                className="p-2 bg-gray-300 rounded-lg w-[160px] rounded-full self-center"
              >
                <Text className="text-base font-bold text-gray-600 text-center">Limpiar filtros</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Lista de productos */}
        {productosFiltrados.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <Package size={64} color="#D1D5DB" />
            <Text className="text-lg font-medium text-gray-500 mt-4">
              No se encontraron productos
            </Text>
            <Text className="text-sm text-gray-400">
              Intenta ajustar los filtros de búsqueda
            </Text>
          </View>
        ) : (
          <FlatList
            data={productosFiltrados}
            renderItem={renderProductoCard}
            keyExtractor={(item) => item.idproducto.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          />
        )}

        {/* Footer */}
        <View className="p-4 border-t border-gray-200 bg-white">
          <Text className="text-sm text-gray-600 text-center">
            Mostrando <Text className="font-semibold">{productosFiltrados.length}</Text> de{" "}
            <Text className="font-semibold">{reporte.total_productos}</Text> productos
          </Text>
        </View>

        {/* Modal Categoría */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalCategoriaOpen}
          onRequestClose={() => setModalCategoriaOpen(false)}
        >
          <View className="flex-1 justify-end bg-black bg-opacity-50">
            <View className="bg-white rounded-t-2xl p-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold">Seleccionar Categoría</Text>
                <TouchableOpacity onPress={() => setModalCategoriaOpen(false)}>
                  <Text className="text-2xl font-bold">X</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 400 }}>
                <TouchableOpacity
                  className="p-4 border-b border-gray-200"
                  onPress={() => {
                    setCategoriaFiltro("todas");
                    setModalCategoriaOpen(false);
                  }}
                >
                  <Text className="text-lg">Todas las categorías</Text>
                </TouchableOpacity>





              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal Estado */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalEstadoOpen}
          onRequestClose={() => setModalEstadoOpen(false)}
        >
          <View className="flex-1 justify-end bg-black bg-opacity-50">
            <View className="bg-white rounded-t-2xl p-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold">Seleccionar Estado</Text>
                <TouchableOpacity onPress={() => setModalEstadoOpen(false)}>
                  <Text className="text-2xl font-bold">X</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                className="p-4 border-b border-gray-200"
                onPress={() => {
                  setEstadoFiltro("todos");
                  setModalEstadoOpen(false);
                }}
              >
                <Text className="text-lg">Todos los estados</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="p-4 border-b border-gray-200"
                onPress={() => {
                  setEstadoFiltro("activo");
                  setModalEstadoOpen(false);
                }}
              >
                <Text className="text-lg">Activo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="p-4"
                onPress={() => {
                  setEstadoFiltro("inactivo");
                  setModalEstadoOpen(false);
                }}
              >
                <Text className="text-lg">Inactivo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};
