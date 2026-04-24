import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useEffect } from "react";
import { Trash2 } from 'lucide-react-native';

interface Props {
  productos: any[];
  onEditProducto: (index: number, field: string, value: string) => void;
  onDeleteProducto: (index: number) => void;
}

const TablaProductos = ({ productos, onEditProducto, onDeleteProducto }: Props) => {

  // Función para calcular campos automáticamente cuando se edita en la tabla
  const handleEditWithCalculation = (index: number, field: string, value: string) => {
    const producto = productos[index];

    // Si no es producto tipo CAJA, solo actualizar el campo
    if (producto.unidad_medida !== 'CAJA') {
      onEditProducto(index, field, value);
      return;
    }

    // Aplicar la lógica de cálculo para productos tipo CAJA
    const cant_cajas = parseFloat(field === 'cant_cajas' ? value : producto.cant_cajas || '0');
    const cant_p_caja = parseFloat(field === 'cant_p_caja' ? value : producto.cant_p_caja || '0');
    const cantidad = parseFloat(field === 'cantidad' ? value : producto.cantidad || '0');
    const precio_compra = parseFloat(field === 'precio_compra' ? value : producto.precio_compra || '0');
    const precio_compra_caja = parseFloat(field === 'precio_compra_caja' ? value : producto.precio_compra_caja || '0');
    const precio_venta = parseFloat(field === 'precio_venta' ? value : producto.precio_venta || '0');
    const precio_venta_caja = parseFloat(field === 'precio_venta_caja' ? value : producto.precio_venta_caja || '0');

    // Primero actualizar el campo que se editó
    onEditProducto(index, field, value);

    // Luego calcular y actualizar campos relacionados
    setTimeout(() => {
      // Calcular cantidad de cajas cuando se modifica cantidad total o unidades por caja
      if (field === 'cantidad' && cant_p_caja > 0 && cantidad > 0) {
        const nuevasCajas = (cantidad / cant_p_caja).toFixed(2);
        onEditProducto(index, 'cant_cajas', nuevasCajas);
      }
      else if (field === 'cant_p_caja' && cant_p_caja > 0 && cantidad > 0) {
        const nuevasCajas = (cantidad / cant_p_caja).toFixed(2);
        onEditProducto(index, 'cant_cajas', nuevasCajas);
      }
      // Calcular cantidad total cuando se modifica cantidad de cajas
      else if (field === 'cant_cajas' && cant_cajas > 0 && cant_p_caja > 0) {
        const nuevaCantidad = (cant_cajas * cant_p_caja).toString();
        onEditProducto(index, 'cantidad', nuevaCantidad);
      }

      // ✅ Calcular precios de COMPRA automáticamente
      if (field === 'precio_compra' && precio_compra > 0 && cant_p_caja > 0) {
        const nuevoPrecioCaja = (precio_compra * cant_p_caja).toFixed(2);
        onEditProducto(index, 'precio_compra_caja', nuevoPrecioCaja);
      }
      else if (field === 'precio_compra_caja' && precio_compra_caja > 0 && cant_p_caja > 0) {
        const nuevoPrecioUnitario = (precio_compra_caja / cant_p_caja).toFixed(4);
        onEditProducto(index, 'precio_compra', nuevoPrecioUnitario);
      }

      // ✅ NUEVO: Calcular precios de VENTA automáticamente
      if (field === 'precio_venta' && precio_venta > 0 && cant_p_caja > 0) {
        const nuevoPrecioVentaCaja = (precio_venta * cant_p_caja).toFixed(2);
        onEditProducto(index, 'precio_venta_caja', nuevoPrecioVentaCaja);
      }
      else if (field === 'precio_venta_caja' && precio_venta_caja > 0 && cant_p_caja > 0) {
        const nuevoPrecioVentaUnitario = (precio_venta_caja / cant_p_caja).toFixed(4);
        onEditProducto(index, 'precio_venta', nuevoPrecioVentaUnitario);
      }

      // ✅ NUEVO: Si cambia cant_p_caja, recalcular ambos precios por caja
      if (field === 'cant_p_caja' && cant_p_caja > 0) {
        if (precio_compra > 0) {
          const nuevoPrecioCaja = (precio_compra * cant_p_caja).toFixed(2);
          onEditProducto(index, 'precio_compra_caja', nuevoPrecioCaja);
        }
        if (precio_venta > 0) {
          const nuevoPrecioVentaCaja = (precio_venta * cant_p_caja).toFixed(2);
          onEditProducto(index, 'precio_venta_caja', nuevoPrecioVentaCaja);
        }
      }
    }, 0);
  };

  // Helper function to format number with thousands separator
  const formatNumber = (value: string | number) => {
    if (!value) return '';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '' : num.toLocaleString('es-PY');
  };

  useEffect(() => {
    console.log(productos)
  }, [productos])

  if (productos.length === 0) return null;

  // Determinar si hay productos tipo CAJA en la lista
  const hayProductosCaja = productos.some(p => p.unidad_medida === 'CAJA');

  const renderProductoItem = ({ item: prod, index: idx }: { item: any; index: number }) => {
    const isCaja = prod.unidad_medida === 'CAJA';

    return (
      <View className={`rounded-lg p-4 mb-3 border border-gray-200 ${isCaja ? 'bg-orange-50' : 'bg-white'}`}>
        {/* Nombre del Producto */}
        <View className="mb-3">
          <Text className="text-xs text-gray-600 mb-1">Producto</Text>
          <TextInput
            value={prod.nombre_producto}
            onChangeText={(text) => onEditProducto(idx, 'nombre_producto', text)}
            className="border border-gray-300 rounded px-3 py-2 bg-white"
          />
        </View>

        {/* Unidad y Código de Barra */}
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">Unidad</Text>
            <View className={`px-3 py-2 rounded ${isCaja ? 'bg-orange-100' : 'bg-gray-100'}`}>
              <Text className={`text-sm font-medium ${isCaja ? 'text-orange-700' : 'text-gray-700'}`}>
                {prod.unidad_medida}
              </Text>
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">Cod Barra</Text>
            <View className="px-3 py-2 bg-gray-50 rounded">
              <Text className="text-sm">{prod.cod_barra}</Text>
            </View>
          </View>
        </View>

        {/* Cantidades */}
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">Cantidad</Text>
            <TextInput
              keyboardType="numeric"
              value={String(prod.cantidad)}
              onChangeText={(text) => handleEditWithCalculation(idx, 'cantidad', text)}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-center"
            />
            {isCaja && <Text className="text-xs text-orange-600 mt-1">Comprada</Text>}
          </View>

          {hayProductosCaja && isCaja && (
            <>
              <View className="flex-1">
                <Text className="text-xs text-gray-600 mb-1">Cant de Cajas</Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(prod.cant_cajas)}
                  onChangeText={(text) => handleEditWithCalculation(idx, 'cant_cajas', text)}
                  className="border border-gray-300 rounded px-3 py-2 bg-green-50 text-center"
                />
                <Text className="text-xs text-green-600 mt-1">Auto calc.</Text>
              </View>

              <View className="flex-1">
                <Text className="text-xs text-gray-600 mb-1">Cant por Caja</Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(prod.cant_p_caja)}
                  onChangeText={(text) => handleEditWithCalculation(idx, 'cant_p_caja', text)}
                  className="border border-gray-300 rounded px-3 py-2 bg-white text-center"
                />
                <Text className="text-xs text-blue-600 mt-1">Referencial</Text>
              </View>
            </>
          )}
        </View>

        {/* Precios de Compra */}
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">Precio Compra</Text>
            <TextInput
              keyboardType="numeric"
              value={formatNumber(prod.precio_compra)}
              onChangeText={(text) => {
                const cleanValue = text.replace(/\./g, '');
                handleEditWithCalculation(idx, 'precio_compra', cleanValue);
              }}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-center"
            />
          </View>

          {hayProductosCaja && isCaja && (
            <View className="flex-1">
              <Text className="text-xs text-gray-600 mb-1">Precio Compra Caja</Text>
              <TextInput
                keyboardType="numeric"
                value={formatNumber(prod.precio_compra_caja)}
                onChangeText={(text) => {
                  const cleanValue = text.replace(/\./g, '');
                  handleEditWithCalculation(idx, 'precio_compra_caja', cleanValue);
                }}
                className="border border-gray-300 rounded px-3 py-2 bg-blue-50 text-center"
              />
              <Text className="text-xs text-blue-600 mt-1">Por caja</Text>
            </View>
          )}
        </View>

        {/* Precios de Venta */}
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">Precio Venta</Text>
            <TextInput
              keyboardType="numeric"
              value={formatNumber(prod.precio_venta)}
              onChangeText={(text) => {
                const cleanValue = text.replace(/\./g, '');
                handleEditWithCalculation(idx, 'precio_venta', cleanValue);
              }}
              className="border border-gray-300 rounded px-3 py-2 bg-white text-center"
            />
          </View>

          {hayProductosCaja && isCaja && (
            <View className="flex-1">
              <Text className="text-xs text-gray-600 mb-1">Precio Venta Caja</Text>
              <TextInput
                keyboardType="numeric"
                value={formatNumber(prod.precio_venta_caja)}
                onChangeText={(text) => {
                  const cleanValue = text.replace(/\./g, '');
                  handleEditWithCalculation(idx, 'precio_venta_caja', cleanValue);
                }}
                className="border border-gray-300 rounded px-3 py-2 bg-green-50 text-center"
              />
              <Text className="text-xs text-green-600 mt-1">Por caja</Text>
            </View>
          )}
        </View>

        {/* Ubicación, IVA, Categoría */}
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">Ubicación</Text>
            <View className="px-3 py-2 bg-gray-50 rounded">
              <Text className="text-sm">{prod.ubicacion}</Text>
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">IVA</Text>
            <View className="px-3 py-2 bg-gray-50 rounded">
              <Text className="text-sm">{prod.iva}%</Text>
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">Categoría</Text>
            <View className="px-3 py-2 bg-gray-50 rounded">
              <Text className="text-sm">{prod.idcategoria}</Text>
            </View>
          </View>
        </View>

        {/* Botón Eliminar */}
        <TouchableOpacity
          onPress={() => onDeleteProducto(idx)}
          className="flex-row items-center justify-center gap-2 bg-red-600 rounded-lg py-2 px-4"
        >
          <Trash2 size={16} color="white" />
          <Text className="text-white font-medium">Eliminar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="mt-6">
      <FlatList
        data={productos}
        renderItem={renderProductoItem}
        keyExtractor={(_, index) => index.toString()}
        scrollEnabled={false}
        nestedScrollEnabled={true}
      />
    </View>
  );
};

export default TablaProductos;