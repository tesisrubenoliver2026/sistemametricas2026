import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, FlatList, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Package, Download } from 'lucide-react-native';
import ModalEditarProducto from './ModalsProductos/ModalEditarProducto';
import ModalAdvert from '../../../components/ModalAdvert';
import ModalsCrearCompraRapida from '../../compras/components/Modals/ModalsCrearCompraRapida';
import { getProductosPaginated, deleteProducto } from '../../../services/productos';
import { getReportProducts } from '../../../services/productos';
import ModalError from '../../../components/ModalError';
import { InventarioProducto } from './InventarioProducto';
import type { ReporteResponse } from '../../../types/reporte.types';
import * as FileSystem from 'expo-file-system';
import SelectInput from 'app/clientes/components/SelectInput';
import * as Sharing from 'expo-sharing';

interface ListarProductosProps {
  onSelect?: (producto: any) => void;
  isBuy?: boolean;
  setCantidadProducto?: (cantidad: number) => void;
  cantidadProducto?: number;
  setCantidadMaximo?: (cantidad: number) => void;
  configVentaPorLote?: boolean;
  detalles?: any[];
  stockVerify?: boolean;
}

const ListarProductos = ({
  onSelect,
  isBuy,
  setCantidadProducto,
  cantidadProducto,
  setCantidadMaximo,
  configVentaPorLote = false,
  detalles = [],
  stockVerify = false,
}: ListarProductosProps) => {
  const [productos, setProductos] = useState<any[]>([]);
  const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
  const [isInputTouched, setIsInputTouched] = useState(false);
  const [modalEditarProductoOpen, setModalEditarProductoOpen] = useState(false);
  const [idProducto, setIdProducto] = useState<number | string>('');
  const [modalCrearCompraRapidaOpen, setModalCrearCompraRapidaOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [datosReporte, setDatosReporte] = useState<ReporteResponse | null>(null);
  const [mostrarInventario, setMostrarInventario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  const handleGenerateReporte = async () => {
    try {
      const res = await getReportProducts();
      setDatosReporte(res.data);
      setMostrarInventario(true);
    } catch (error) {
      console.error("❌ Error al generar reporte del cliente:", error);
      setErrorMessage("❌ Error al generar el reporte");
    }
  };

  const handleDownloadPDF = async () => {
    if (datosReporte?.reportePDFBase64) {
      try {
        const filename = FileSystem.documentDirectory + `Reporte-Inventario-${new Date().toLocaleDateString()}.pdf`;
        await FileSystem.writeAsStringAsync(filename, datosReporte.reportePDFBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (Platform.OS === "ios") {
          await Sharing.shareAsync(filename);
        } else {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, `Reporte-Inventario-${new Date().toLocaleDateString()}.pdf`, 'application/pdf')
              .then(async (uri) => {
                await FileSystem.writeAsStringAsync(uri, datosReporte.reportePDFBase64!, { encoding: FileSystem.EncodingType.Base64 });
                Alert.alert('Descarga Completa', `El reporte se ha guardado en tus descargas.`);
              })
              .catch((e) => {
                console.log(e);
                Alert.alert('Error', 'No se pudo guardar el archivo.');
              });
          } else {
            Alert.alert('Permiso denegado', 'No se puede guardar el archivo sin permiso.');
          }
        }
      } catch (err) {
        console.error('Error al descargar PDF:', err);
        Alert.alert('Error', 'Ocurrió un error al descargar el PDF.');
      }
    }
  };

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const res = await getProductosPaginated({ page, limit, search });
      setProductos(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProducto(id);
              fetchProductos();
            } catch (error) {
              console.error('Error al eliminar producto:', error);
              setErrorMessage('❌ No se pudo eliminar el producto');
            }
          }
        }
      ]
    );
  };

  const handleEdit = (id: number) => {
    setIdProducto(id);
    setModalEditarProductoOpen(true);
  };

  const renderCantidadInput = (prod: any) => {
    const isDecimal = prod.unidad_medida === 'KG' || prod.unidad_medida === 'L';
    const min = isDecimal ? 0.1 : 1;

    return (
      <TextInput
        editable={!configVentaPorLote}
        keyboardType="numeric"
        defaultValue={min.toString()}
        onBlur={(e) => {
          let valor = isDecimal ? parseFloat(e.nativeEvent.text) : parseInt(e.nativeEvent.text);
          if (isNaN(valor) || valor < min) valor = min;
          if (valor > parseFloat(prod.stock)) {
            setErrorMessage(`La cantidad no puede superar el stock disponible (${prod.stock})`);
            valor = parseFloat(prod.stock);
          }
          setCantidadProducto?.(valor);
          setCantidadMaximo?.(parseFloat(prod.stock));
          setIsInputTouched(true);
        }}
        className="w-20 border border-gray-300 rounded-md px-2 py-1"
      />
    );
  };

  const handleSeleccionar = (prod: any) => {
    const stock = parseFloat(prod.stock);
    const enDetalle = detalles.find((d) => d.idproducto === prod.idproducto)?.cantidad || 0;

    if (!isBuy && parseFloat(enDetalle) >= stock) {
      setErrorMessage(`Ya alcanzaste el stock máximo disponible (${stock}) para este producto.`);
      return;
    }

    if (stockVerify && !isBuy && prod.stock <= 0) {
      setModalAdvertOpen(true);
      return;
    }

    const isDecimal = prod.unidad_medida === 'KG' || prod.unidad_medida === 'L';
    const defaultCantidad = isDecimal ? 0.1 : 1;
    const cantidadFinal = isInputTouched ? cantidadProducto ?? defaultCantidad : defaultCantidad;

    setCantidadMaximo?.(stock);
    onSelect?.({ ...prod, cantidad: cantidadFinal, cantidadMaximo: stock });
  };

  useEffect(() => {
    fetchProductos();
  }, [page, limit, search]);

  const renderProductItem = ({ item: prod }: { item: any }) => (
    <View className="bg-white rounded-lg border border-gray-200 p-4 mb-3 mx-2 shadow-sm">
      {/* Header con nombre y estado */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 pr-2">
          <Text className="text-base font-bold text-gray-900 mb-1">{prod.nombre_producto}</Text>
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-500">ID: {prod.idproducto}</Text>
            <View className="w-1 h-1 rounded-full bg-gray-400 mx-2" />
            <Text className="text-xs text-gray-500">{prod.cod_barra || 'Sin código'}</Text>
          </View>
        </View>
        <View className={`px-3 py-1 rounded-full ${prod.estado === 'activo' ? 'bg-green-100' : 'bg-gray-100'}`}>
          <Text className={`text-xs font-semibold ${prod.estado === 'activo' ? 'text-green-700' : 'text-gray-600'}`}>
            {prod.estado.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Sección de Stock y Precios */}
      <View className="bg-blue-50 rounded-lg p-3 mb-3">
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">Stock Disponible</Text>
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-blue-700">{prod.stock}</Text>
              <Text className="text-xs text-gray-600 ml-1">{prod.unidad_medida || 'UN'}</Text>
            </View>
          </View>
          <View className="w-px h-10 bg-gray-300 mx-3" />
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">Precio Venta</Text>
            <Text className="text-base font-bold text-green-700">
              ₲ {prod.precio_venta ? parseFloat(prod.precio_venta).toLocaleString("es-PY") : '0'}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between">
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">Precio Compra</Text>
            <Text className="text-sm font-semibold text-gray-700">
              ₲ {prod.precio_compra ? parseFloat(prod.precio_compra).toLocaleString("es-PY") : '0'}
            </Text>
          </View>
          <View className="w-px h-10 bg-gray-300 mx-3" />
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">IVA</Text>
            <Text className="text-sm font-semibold text-gray-700">{prod.iva}%</Text>
          </View>
        </View>
      </View>

      {/* Información de Cajas */}
      {(prod.cant_cajas || prod.precio_compra_caja || prod.cant_p_caja) && (
        <View className="bg-amber-50 rounded-lg p-3 mb-3">
          <Text className="text-xs font-semibold text-amber-900 mb-2">📦 Información de Cajas</Text>
          <View className="flex-row flex-wrap gap-3">
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-600">Cant. Cajas: </Text>
              <Text className="text-xs font-bold text-gray-800">{prod.cant_cajas || 'N/A'}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-600">Precio/Caja: </Text>
              <Text className="text-xs font-bold text-gray-800">
                {prod.precio_compra_caja ? `₲ ${parseFloat(prod.precio_compra_caja).toLocaleString("es-PY")}` : 'N/A'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-600">Unidades x Caja: </Text>
              <Text className="text-xs font-bold text-gray-800">{prod.cant_p_caja || 'N/A'}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Ubicación */}
      <View className="flex-row items-center mb-3">
        <Text className="text-xs text-gray-500">📍 Ubicación: </Text>
        <Text className="text-xs font-medium text-gray-700">{prod.ubicacion || 'Sin ubicación'}</Text>
      </View>

      {/* Input de cantidad si es necesario */}
      {setCantidadProducto && (
        <View className="mb-3 bg-gray-50 p-3 rounded-lg">
          <Text className="text-xs font-semibold text-gray-700 mb-2">Cantidad a seleccionar:</Text>
          {renderCantidadInput(prod)}
        </View>
      )}

      {/* Botones de acción */}
      <View className="flex-row gap-2">
        {onSelect ? (
          <TouchableOpacity
            onPress={() => handleSeleccionar(prod)}
            className="flex-1 bg-blue-600 py-3 rounded-lg shadow-sm"
          >
            <Text className="text-white text-center text-sm font-semibold">Seleccionar</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => handleEdit(prod.idproducto)}
              className="flex-1 bg-amber-500 py-3 rounded-lg shadow-sm"
            >
              <Text className="text-white text-center text-sm font-semibold">Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(prod.idproducto)}
              className="flex-1 bg-red-500 py-3 rounded-lg shadow-sm"
            >
              <Text className="text-white text-center text-sm font-semibold">Eliminar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const optionsLimit = [5, 10, 20, 50, 100].map((num) => ({
    label: `${num} por página`,
    value: num.toString(),
  }));

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header con gradiente mejorado */}
      <View className="bg-blue-600 px-4 pt-16 pb-6 shadow-lg">
        {/* Título y selector */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="bg-white/20 p-2 rounded-xl">
              <Package size={28} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white">Productos</Text>
              <Text className="text-blue-100 text-sm">Gestiona tu inventario</Text>
            </View>
          </View>
          <View className="ml-2">
            <SelectInput
              name="estadofiltro"
              value={String(limit)}
              onChange={(name, value) => setLimit(Number(value))}
              placeholder="Límite"
              options={optionsLimit}
            />
          </View>
        </View>

        {/* Buscador mejorado */}
        <View className="relative mb-3">
          <View className="absolute left-3 top-3.5 z-10">
            <Ionicons name="search" size={20} color="#9CA3AF" />
          </View>
          <TextInput
            placeholder="Buscar por nombre o ubicación..."
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 border-2 border-white/30 rounded-xl bg-white shadow-md text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Botones de acción */}
        <View className="flex-row gap-2 mb-3">
          <TouchableOpacity
            onPress={() => setModalCrearCompraRapidaOpen(true)}
            className="flex-1 bg-white rounded-xl py-3 flex-row items-center justify-center gap-2 shadow-md"
          >
            <Ionicons name="add-circle" size={20} color="#10b981" />
            <Text className="text-green-600 font-semibold">Crear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleGenerateReporte}
            className="flex-1 bg-white rounded-xl py-3 flex-row items-center justify-center gap-2 shadow-md"
          >
            <Download size={18} color="#f59e0b" />
            <Text className="text-amber-600 font-semibold">Reporte</Text>
          </TouchableOpacity>
        </View>

        {/* Paginación compacta en el header */}
        <View className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="flex-1 mr-2"
            >
              <View className={`rounded-lg py-2 flex-row items-center justify-center gap-1 ${page === 1 ? 'bg-white/10' : 'bg-white'}`}>
                <Ionicons name="chevron-back" size={16} color={page === 1 ? '#9ca3af' : '#2563eb'} />
                <Text className={`text-xs font-semibold ${page === 1 ? 'text-gray-300' : 'text-blue-600'}`}>Anterior</Text>
              </View>
            </Pressable>

            <View className="px-3">
              <Text className="text-white font-bold text-sm">
                {page} / {totalPages}
              </Text>
            </View>

            <Pressable
              onPress={() => setPage((prev) => prev + 1)}
              disabled={page >= totalPages}
              className="flex-1 ml-2"
            >
              <View className={`rounded-lg py-2 flex-row items-center justify-center gap-1 ${page >= totalPages ? 'bg-white/10' : 'bg-white'}`}>
                <Text className={`text-xs font-semibold ${page >= totalPages ? 'text-gray-300' : 'text-blue-600'}`}>Siguiente</Text>
                <Ionicons name="chevron-forward" size={16} color={page >= totalPages ? '#9ca3af' : '#2563eb'} />
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Lista de productos */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={productos}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.idproducto.toString()}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center p-8">
              <Text className="text-gray-500">No se encontraron productos</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* Paginación */}




      {/* Modal para seleccionar límite */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={limitModalOpen}
        onRequestClose={() => setLimitModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-2xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Productos por página</Text>
              <TouchableOpacity onPress={() => setLimitModalOpen(false)}>
                <Text className="text-2xl font-bold">X</Text>
              </TouchableOpacity>
            </View>
            {[5, 10, 20].map((num) => (
              <TouchableOpacity
                key={num}
                onPress={() => {
                  setLimit(num);
                  setPage(1);
                  setLimitModalOpen(false);
                }}
                className="p-4 border-b border-gray-200"
              >
                <Text className="text-lg">{num} por página</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Modales */}
      <ModalsCrearCompraRapida isOpen={modalCrearCompraRapidaOpen} onClose={() => setModalCrearCompraRapidaOpen(false)} onSuccess={fetchProductos} />
      <ModalEditarProducto isOpen={modalEditarProductoOpen} onClose={() => setModalEditarProductoOpen(false)} onSuccess={fetchProductos} id={idProducto} />
      <ModalAdvert isOpen={modalAdvertOpen} onClose={() => setModalAdvertOpen(false)} message="Este producto no tiene stock disponible." />
      <ModalError isOpen={!!errorMessage} onClose={() => setErrorMessage("")} message={errorMessage} />

      {/* Modal de Inventario */}
      {mostrarInventario && datosReporte && (
        <InventarioProducto
          reporte={datosReporte.datosReporte.reporte}
          onClose={() => setMostrarInventario(false)}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </View>
  );
};

export default ListarProductos;
