import { Modal, View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react-native';

interface ModalComprobanteProps {
  isOpen: boolean;
  onClose: () => void;
  datos: {
    nro_factura: string;
    fecha: string;
    cantidadProductos: number;
  };
  productos: any[];
  isVenta?: boolean;
  tipoDescuento?: string;
  montoTotalDescuento?: string;
}

const ModalComprobante = ({
  isOpen,
  onClose,
  datos,
  productos,
  isVenta = false,
  tipoDescuento,
  montoTotalDescuento
}: ModalComprobanteProps) => {

  useEffect(() => {
    console.log("Datos del producto", productos);
  }, [productos]);

  // Calcular total considerando descuentos
  const totalCompra = productos.reduce((acc, p) => {
    const precio = parseFloat(isVenta ? p.precio_venta : p.precio_compra) || 0;
    const cantidad = parseFloat(p.cantidad) || 0;
    const descuento = parseFloat(p.descuento) || 0;
    const subtotal = precio * cantidad;

    if (tipoDescuento === "descuento_producto") {
      return acc + (subtotal - descuento);
    }
    return acc + subtotal;
  }, 0);

  const renderProductoItem = ({ item: p, index }: { item: any; index: number }) => {
    const priceFinally = isVenta ? p.precio_venta : p.precio_compra;
    const precio = parseFloat(priceFinally) || 0;
    const cantidad = parseFloat(p.cantidad) || 0;
    const descuento = (parseFloat(p.descuento)) || 0;
    const totalSinDescuento = precio * cantidad;
    const totalConDescuento = totalSinDescuento - descuento;

    return (
      <View className={`border-b border-gray-200 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
        <View className="flex-row justify-between px-6">
          <View className="flex-1">
            <Text className="text-sm text-gray-800">{p.nombre_producto}</Text>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-sm text-gray-800">{cantidad}</Text>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-sm text-gray-800">{precio.toLocaleString("es-PY")} Gs</Text>
          </View>
        </View>

        {/* Mostrar descuento solo si es descuento por producto */}
        {tipoDescuento === "descuento_producto" && (
          <View className="flex-row justify-between px-6 mt-1">
            <View className="flex-1">
              <Text className="text-xs text-gray-600">Descuento:</Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-xs text-red-600">{descuento.toLocaleString("es-PY")} Gs</Text>
            </View>
          </View>
        )}

        {/* Total */}
        <View className="flex-row justify-between px-6 mt-1">
          <View className="flex-1">
            <Text className="text-xs font-semibold text-gray-700">
              {tipoDescuento === "descuento_producto" ? "Total con Desc:" : "Total:"}
            </Text>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-xs font-semibold text-gray-800">
              {(tipoDescuento === "descuento_producto" ? totalConDescuento : totalSinDescuento).toLocaleString("es-PY")} Gs
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="w-full max-w-4xl bg-white rounded-2xl p-6 shadow-xl max-h-[80%]">
          <ScrollView>
            {/* Header */}
            <View className="flex-row items-center gap-3 mb-6">
              <CheckCircle size={32} color="#059669" />
              <Text className="text-lg font-semibold text-gray-900">
                {`${isVenta ? "Venta realizada exitosamente" : "Compra registrada exitosamente"}`}
              </Text>
            </View>

            {/* Información general */}
            <View className="mb-6 space-y-2">
              <View className="flex-row">
                <Text className="font-semibold text-gray-700">Nro Factura: </Text>
                <Text className="text-gray-700">{datos.nro_factura}</Text>
              </View>
              <View className="flex-row">
                <Text className="font-semibold text-gray-700">Fecha: </Text>
                <Text className="text-gray-700">{datos.fecha}</Text>
              </View>
              <View className="flex-row">
                <Text className="font-semibold text-gray-700">Cantidad de Productos: </Text>
                <Text className="text-gray-700">{datos.cantidadProductos}</Text>
              </View>
            </View>

            {/* Tabla de Productos */}
            <View className="border border-gray-200 rounded-lg mb-6">
              {/* Header de la tabla */}
              <View className="flex-row bg-gray-100 border-b border-gray-200 py-3 px-6">
                <Text className="flex-1 font-semibold text-gray-700 text-sm">Producto</Text>
                <Text className="flex-1 font-semibold text-gray-700 text-sm text-right">Cantidad</Text>
                <Text className="flex-1 font-semibold text-gray-700 text-sm text-right">
                  {`${!isVenta ? "Precio Compra" : "Precio Venta"}`}
                </Text>
              </View>

              {/* Body de la tabla */}
              {productos.length === 0 ? (
                <View className="py-4">
                  <Text className="text-center text-gray-500 text-sm">No hay productos cargados</Text>
                </View>
              ) : (
                <FlatList
                  data={productos}
                  renderItem={renderProductoItem}
                  keyExtractor={(_, index) => index.toString()}
                  scrollEnabled={false}
                  nestedScrollEnabled={true}
                />
              )}
            </View>

            {/* Total General */}
            <View className="items-end pr-4 mb-6">
              {tipoDescuento === "descuento_total" && montoTotalDescuento ? (
                // Cuando hay descuento total
                <View className="space-y-2">
                  <Text className="text-lg font-semibold text-gray-800">
                    Total sin Descuento: {totalCompra.toLocaleString()} Gs
                  </Text>
                  <Text className="text-lg font-semibold text-red-600">
                    Monto Total de Descuento: {Number(montoTotalDescuento).toLocaleString()} Gs
                  </Text>
                  <View className="border-t border-gray-300 pt-2">
                    <Text className="text-xl font-bold text-green-600">
                      Total con Descuento: {(totalCompra - Number(montoTotalDescuento)).toLocaleString()} Gs
                    </Text>
                  </View>
                </View>
              ) : (
                // Cuando no hay descuento total
                <Text className="text-lg font-semibold text-gray-800">
                  Total {`${isVenta ? "Venta" : "Compra"}`}: {totalCompra.toLocaleString()} Gs
                </Text>
              )}
            </View>

            {/* Botón Cerrar */}
            <View className="items-end">
              <TouchableOpacity
                onPress={onClose}
                className="px-5 py-2 bg-green-600 rounded-lg"
              >
                <Text className="text-white font-medium">Cerrar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ModalComprobante;
