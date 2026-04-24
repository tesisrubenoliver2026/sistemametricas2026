import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ModalSeleccionarCategoria from 'app/producto/components/ModalsProductos/ModalSeleccionarCategoria';

interface FormData {
    nombre_producto: string;
    precio_compra: string;
    precio_compra_caja: string;
    cod_barra: string;
    precio_venta: string;
    precio_venta_caja: string;
    unidad_medida: string;
    iva: string;
    idcategoria: string;
    cantidad: string;
    cant_p_caja: string;
    cant_cajas: string;
    fecha_vencimiento: string;
    ubicacion: string;
}

interface Props {
    optionSelectedByBox?: string;
    setOpcionSeleccionada: (value: string) => void;
    setModalShowOptionCostBuy: (value: string) => void;
    form: FormData;
    onFormChange: (form: FormData, campo?: string) => void;
    categoriaSeleccionada: any;
    onCategoriaSelect: (categoria: any) => void;
}

const FormularioProducto1 = ({ setOpcionSeleccionada, optionSelectedByBox, setModalShowOptionCostBuy, form, onFormChange, categoriaSeleccionada, onCategoriaSelect }: Props) => {
    const [showCategoriaModal, setShowCategoriaModal] = useState(false);

    const handleChange = (name: string, value: string) => {
        if (name === 'unidad_medida' && value === 'CAJA') {
            setModalShowOptionCostBuy("CAJA");
        } else if (name === 'unidad_medida' && value !== 'CAJA') {
            setModalShowOptionCostBuy("");
            setOpcionSeleccionada("");
        }

        let formActualizado = {
            ...form,
            [name]: value
        };

        // Limpiar campos específicos de cajas cuando no sea CAJA
        if (name === 'unidad_medida' && value !== 'CAJA') {
            formActualizado = {
                ...formActualizado,
                cant_cajas: '',
                cant_p_caja: '',
                precio_venta_caja: ''
            };
        }

        onFormChange(formActualizado);
    };

    const handleNumericChange = (field: keyof FormData, value: string) => {
        const formActualizado = {
            ...form,
            [field]: value
        };
        // ✅ IMPORTANTE: Pasar el campo modificado como segundo parámetro
        onFormChange(formActualizado, field);
    };

    // Helper function to format number
    const formatNumber = (value: string) => {
        if (!value) return '';
        const num = parseFloat(value);
        return isNaN(num) ? '' : num.toLocaleString('es-PY');
    };
    return (
        <>
            {/* Header */}
            <View className="mb-6 border-b border-gray-200 pb-4">
                <Text className="text-lg font-semibold text-gray-900">Agregar Nuevo Producto</Text>
                <Text className="text-sm text-gray-600 mt-1">Complete la información del producto a registrar</Text>
            </View>

            {/* Información Básica */}
            <View className="mb-6">
                <View className="flex-row items-center mb-4">
                    <View className="bg-blue-100 rounded-full w-6 h-6 items-center justify-center mr-2">
                        <Text className="text-blue-700 text-sm font-bold">1</Text>
                    </View>
                    <Text className="text-base font-medium text-gray-800">Información Básica</Text>
                </View>

                <View className="gap-4">
                    {/* Nombre del Producto */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Nombre del Producto <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            value={form.nombre_producto}
                            onChangeText={(text) => handleChange('nombre_producto', text)}
                            placeholder="Ej: Producto X"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Código de Barras */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Código de Barras</Text>
                        <TextInput
                            value={form.cod_barra}
                            onChangeText={(text) => handleChange('cod_barra', text)}
                            placeholder="7891000053508"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Categoría */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Categoría <Text className="text-red-500">*</Text>
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowCategoriaModal(true)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                        >
                            <Text className="text-gray-900">
                                {categoriaSeleccionada ? categoriaSeleccionada.categoria : 'Seleccionar Categoría'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Ubicación */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Ubicación</Text>
                        <TextInput
                            value={form.ubicacion}
                            onChangeText={(text) => handleChange('ubicacion', text)}
                            placeholder="Estante A1"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>
            </View>

            {/* Precios y Configuración */}
            <View className="mb-1">
                <View className="flex-row items-center mb-4">
                    <View className="bg-green-100 rounded-full w-6 h-6 items-center justify-center mr-2">
                        <Text className="text-green-700 text-sm font-bold">2</Text>
                    </View>
                    <Text className="text-base font-medium text-gray-800">Precios y Configuración</Text>
                </View>

                <View className="gap-4">
                    {/* Unidad de Medida */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Unidad de Medida <Text className="text-red-500">*</Text>
                        </Text>
                        <View className="border border-gray-300 rounded-lg bg-white">
                            <Picker
                                selectedValue={form.unidad_medida}
                                onValueChange={(value) => handleChange('unidad_medida', value)}
                            >
                                <Picker.Item label="Seleccionar" value="" />
                                <Picker.Item label="Kilogramo (KG)" value="KG" />
                                <Picker.Item label="Unidad" value="UNIDAD" />
                                <Picker.Item label="Paquete" value="PAQUETE" />
                                <Picker.Item label="Caja" value="CAJA" />
                                <Picker.Item label="Litro (L)" value="LITRO" />
                            </Picker>
                        </View>
                    </View>

                    {/* IVA */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            IVA <Text className="text-red-500">*</Text>
                        </Text>
                        <View className="border border-gray-300 rounded-lg bg-white">
                            <Picker
                                selectedValue={form.iva}
                                onValueChange={(value) => handleChange('iva', value)}
                            >
                                <Picker.Item label="Seleccionar" value="" />
                                <Picker.Item label="Exenta" value="0" />
                                <Picker.Item label="5%" value="5" />
                                <Picker.Item label="10%" value="10" />
                            </Picker>
                        </View>
                    </View>

                    {/* Precio de Compra */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            {optionSelectedByBox === "caja_total" ? "Precio Compra Caja*" : "Precio Compra und.*"}
                        </Text>
                        <TextInput
                            keyboardType="numeric"
                            value={formatNumber(optionSelectedByBox === "caja_total" ? form.precio_compra_caja : form.precio_compra)}
                            onChangeText={(text) => {
                                const cleanValue = text.replace(/\./g, '');
                                handleNumericChange(optionSelectedByBox === "caja_total" ? 'precio_compra_caja' : 'precio_compra', cleanValue);
                            }}
                            placeholder="0"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Precio de Venta Unitario */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            {form.unidad_medida === 'CAJA' ? 'Precio Venta und.*' : 'Precio Venta*'}
                        </Text>
                        <TextInput
                            keyboardType="numeric"
                            value={formatNumber(form.precio_venta)}
                            onChangeText={(text) => {
                                const cleanValue = text.replace(/\./g, '');
                                handleNumericChange('precio_venta', cleanValue);
                            }}
                            placeholder="0"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Precio de Venta por Caja - Solo visible cuando es CAJA */}
                    {form.unidad_medida === 'CAJA' && (
                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Precio Venta Caja
                            </Text>
                            <TextInput
                                keyboardType="numeric"
                                value={formatNumber(form.precio_venta_caja)}
                                onChangeText={(text) => {
                                    const cleanValue = text.replace(/\./g, '');
                                    handleNumericChange('precio_venta_caja', cleanValue);
                                }}
                                placeholder="0"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                                placeholderTextColor="#9CA3AF"
                            />
                            <Text className="text-xs text-gray-500 mt-1">Calc. automático</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Modal de Categoría */}
            <ModalSeleccionarCategoria
                isOpen={showCategoriaModal}
                onClose={() => setShowCategoriaModal(false)}
                onSelect={(categoria: any) => {
                    onCategoriaSelect(categoria);
                    setShowCategoriaModal(false);
                }}
            />
        </>
    );
};

export default FormularioProducto1;