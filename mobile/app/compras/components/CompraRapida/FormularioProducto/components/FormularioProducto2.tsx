import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import ModalAdvert from 'components/ModalAdvert';
import ModalPrecioCompra from './ModalPrecioCompra';
import SelectInput from 'app/clientes/components/SelectInput';

interface FormData {
    nombre_producto: string;
    precio_compra: string;
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
    precio_compra_caja?: string;
}

interface Props {
    setModalShowOptionCostBuy: (value: string) => void;
    opcionSeleccionada?: string;
    setOpcionSeleccionada?: (value: string) => void;
    modalShowOptionCostBuy: string;
    form: FormData;
    setPrecioCompraTest: (value: string) => void;
    onFormChange: (form: FormData, campo?: string) => void; 
    onAgregar: (producto: any) => void;
}

const FormularioProducto2 = ({ setPrecioCompraTest, setOpcionSeleccionada, opcionSeleccionada, setModalShowOptionCostBuy, modalShowOptionCostBuy, form, onFormChange, onAgregar }: Props) => {
    const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
    const [modalConfirm, setModalConfirm] = useState("");
    const [precioVentaManual, setPrecioVentaManual] = useState<'unitario' | 'caja' | null>(null);

    // Función para calcular campos faltantes automáticamente
    const calcularCamposFaltantes = (formActualizado: any, campoModificado: string) => {
        if (formActualizado.unidad_medida !== 'CAJA') {
            return formActualizado;
        }

        const { cant_cajas, cant_p_caja, cantidad, precio_compra, precio_compra_caja, precio_venta, precio_venta_caja } = formActualizado;

        // Convertir a números
        const cajas = parseFloat(cant_cajas) || 0;
        const porCaja = parseFloat(cant_p_caja) || 0;
        const total = parseFloat(cantidad) || 0;
        const precioUnitario = parseFloat(precio_compra) || 0;
        const precioCaja = parseFloat(precio_compra_caja) || 0;
        const precioVentaUnitario = parseFloat(precio_venta) || 0;
        const precioVentaCaja = parseFloat(precio_venta_caja) || 0;

        let nuevoForm = { ...formActualizado };

        // Si modificó cantidad total y tiene unidades por caja → calcular cantidad de cajas
        if (campoModificado === 'cantidad' && porCaja > 0 && total > 0) {
            nuevoForm.cant_cajas = (total / porCaja).toFixed(2);
        }

        // Si modificó unidades por caja y tiene cantidad total → recalcular cantidad de cajas
        else if (campoModificado === 'cant_p_caja' && porCaja > 0 && total > 0) {
            nuevoForm.cant_cajas = (total / porCaja).toFixed(2);
        }

        // Si modificó cantidad de cajas y tiene unidades por caja → calcular total (caso menos común)
        else if (campoModificado === 'cant_cajas' && cajas > 0 && porCaja > 0) {
            nuevoForm.cantidad = (cajas * porCaja).toString();
        }

        // SOLUCIÓN: Solo calcular precio por caja automáticamente si NO estamos en modo "caja_total"
        if (opcionSeleccionada !== "caja_total") {
            // Calcular precio por caja automáticamente cuando tenemos precio unitario
            if (precioUnitario > 0 && porCaja > 0) {
                nuevoForm.precio_compra_caja = (precioUnitario * porCaja).toFixed(2);
            }
        } else {
            // Si estamos en modo "caja_total" y se modificaron las unidades, recalcular precio unitario
            if (precioCaja > 0 && porCaja > 0 && (campoModificado === 'cant_p_caja' || campoModificado === 'cantidad')) {
                const nuevoPrecioUnitario = (precioCaja / porCaja).toFixed(4);
                nuevoForm.precio_compra = nuevoPrecioUnitario;
                setPrecioCompraTest(nuevoPrecioUnitario);
            }
        }

        // ✅ CORREGIDO: Lógica de precio de venta basada en qué campo fue modificado manualmente

        if (campoModificado === 'precio_venta') {
            // Usuario modificó el precio unitario manualmente
            setPrecioVentaManual('unitario');
            if (precioVentaUnitario > 0 && porCaja > 0) {
                nuevoForm.precio_venta_caja = (precioVentaUnitario * porCaja).toFixed(2);
            }
        }
        else if (campoModificado === 'precio_venta_caja') {
            // Usuario modificó el precio por caja manualmente
            setPrecioVentaManual('caja');
            if (precioVentaCaja > 0 && porCaja > 0) {
                nuevoForm.precio_venta = (precioVentaCaja / porCaja).toFixed(4);
            }
        }
        else if (campoModificado === 'cant_p_caja' && porCaja > 0) {
            // Si cambió cant_p_caja, recalcular basado en cuál fue el último modificado manualmente
            if (precioVentaManual === 'caja' && precioVentaCaja > 0) {
                // Si el usuario había modificado el precio por caja, recalcular el unitario
                nuevoForm.precio_venta = (precioVentaCaja / porCaja).toFixed(4);
            } else if (precioVentaManual === 'unitario' && precioVentaUnitario > 0) {
                // Si el usuario había modificado el precio unitario, recalcular el precio por caja
                nuevoForm.precio_venta_caja = (precioVentaUnitario * porCaja).toFixed(2);
            } else if (!precioVentaManual) {
                // Si no hay ninguno manual, calcular precio_venta_caja a partir del unitario si existe
                if (precioVentaUnitario > 0) {
                    nuevoForm.precio_venta_caja = (precioVentaUnitario * porCaja).toFixed(2);
                }
            }
        }

        return nuevoForm;
    };
    
    const handleChange = (name: string, value: string) => {
        const formActualizado = {
            ...form,
            [name]: value
        };

        // ✅ Pasar el campo modificado
        const formConCalculos = calcularCamposFaltantes(formActualizado, name);
        onFormChange(formConCalculos, name);
    };

    // Helper function to format number
    const formatNumber = (value: string | number) => {
        if (!value) return '';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? '' : num.toLocaleString('es-PY');
    };

    // Validación específica para cajas
    const validarCajas = () => {
        if (form.unidad_medida !== 'CAJA') return { valido: true };

        const cajas = parseFloat(form.cant_cajas) || 0;
        const porCaja = parseFloat(form.cant_p_caja) || 0;
        const total = parseFloat(form.cantidad) || 0;

        // Debe tener al menos cantidad por caja
        if (porCaja <= 0) {
            return {
                valido: false,
                mensaje: "La cantidad por caja es obligatoria y debe ser mayor a 0"
            };
        }

        // Verificar coherencia matemática con la nueva lógica: cantidad ÷ unidades_por_caja = cajas
        if (cajas > 0 && porCaja > 0 && total > 0) {
            const cajasCalculadas = total / porCaja;
            const diferencia = Math.abs(cajasCalculadas - cajas);

            if (diferencia > 0.01) { // Tolerancia para decimales
                return {
                    valido: false,
                    mensaje: `Los números no coinciden: ${total} unidades ÷ ${porCaja} por caja = ${cajasCalculadas.toFixed(2)} cajas, pero indicaste ${cajas} cajas`
                };
            }
        }

        return { valido: true };
    };

    const handleAgregar = () => {
        // Validación básica con detalle de campos faltantes
        const camposFaltantes = [];

        if (!form.nombre_producto) camposFaltantes.push('Nombre del Producto');
        if (!form.precio_venta) camposFaltantes.push('Precio de Venta');
        if (!form.unidad_medida) camposFaltantes.push('Unidad de Medida');
        if (!form.iva) camposFaltantes.push('IVA');
        if (!form.idcategoria) camposFaltantes.push('Categoría');
        if (!form.cantidad) camposFaltantes.push('Cantidad en Stock');

        if (camposFaltantes.length > 0) {
            const mensaje = camposFaltantes.length === 1
                ? `Falta completar: ${camposFaltantes[0]}`
                : `Faltan completar los siguientes campos:\n• ${camposFaltantes.join('\n• ')}`;

            setModalConfirm(mensaje);
            setModalAdvertOpen(true);
            return;
        }

        // Validación específica para cajas
        const validacionCajas = validarCajas();
        if (!validacionCajas.valido) {
            setModalConfirm(validacionCajas.mensaje ?? "");
            setModalAdvertOpen(true);
            return;
        }

        onAgregar(form);
    };

    useEffect(() => {
        console.log("ASDfasdfdsaf", opcionSeleccionada)
    }, [opcionSeleccionada])

    return (
        <>
            {/* Configuración de Cajas (Condicional) */}
            {form.unidad_medida === "CAJA" && (
                <View className="mb-6">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-orange-100 rounded-full w-6 h-6 items-center justify-center mr-2">
                            <Text className="text-orange-700 text-sm font-bold">📦</Text>
                        </View>
                        <Text className="text-base font-medium text-gray-800">Configuración de Cajas</Text>
                    </View>
                    <View className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <Text className="text-sm text-orange-700 mb-4 font-medium">
                            💡 Ingrese unidades por caja (referencial) y cantidad comprada - las cajas se calculan automáticamente
                        </Text>

                        <View className="gap-4">
                            {/* Cantidad de Cajas */}
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-2">
                                    Cantidad de Cajas
                                    {parseFloat(form.cantidad || '0') > 0 && parseFloat(form.cant_p_caja || '0') > 0 && (
                                        <Text className="text-green-600 text-xs ml-1"> ✓ Cal. auto.</Text>
                                    )}
                                </Text>
                                <TextInput
                                    keyboardType="numeric"
                                    value={form.cant_cajas}
                                    onChangeText={(text) => handleChange('cant_cajas', text)}
                                    placeholder="Ej: 1.83"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                                    placeholderTextColor="#9CA3AF"
                                />
                                <Text className="text-xs text-gray-600 mt-1">Cantidad ÷ unidades por caja</Text>
                            </View>

                            {/* Unidades por Caja */}
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-2">
                                    Unid. por Caja <Text className="text-red-500">*</Text>
                                    {parseFloat(form.cantidad || '0') > 0 && parseFloat(form.cant_cajas || '0') > 0 && (
                                        <Text className="text-orange-600 text-xs ml-1"> ✓ Calculado</Text>
                                    )}
                                </Text>
                                <TextInput
                                    keyboardType="numeric"
                                    value={form.cant_p_caja}
                                    onChangeText={(text) => handleChange('cant_p_caja', text)}
                                    placeholder="Ej: 30"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                                    placeholderTextColor="#9CA3AF"
                                />
                                <Text className="text-xs text-gray-600 mt-1">Unidades que contiene cada caja</Text>
                            </View>

                            {/* Cantidad Comprada */}
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-2">
                                    Cant. Compr. <Text className="text-red-500">*</Text>
                                    {parseFloat(form.cant_cajas || '0') > 0 && parseFloat(form.cant_p_caja || '0') > 0 && (
                                        <Text className="text-orange-600 text-xs ml-1"> → Para calc. caj.</Text>
                                    )}
                                </Text>
                                <TextInput
                                    keyboardType="numeric"
                                    value={form.cantidad}
                                    onChangeText={(text) => handleChange('cantidad', text)}
                                    placeholder="Ej: 55"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                                    placeholderTextColor="#9CA3AF"
                                />
                                <Text className="text-xs text-gray-600 mt-1">Total de unidades compradas</Text>
                            </View>

                            {/* Precio por Caja (Calculado) */}
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-2">
                                    {opcionSeleccionada === "caja_total" ? "Prec. Comp. x unid*" : "Precio por caja*"}
                                    {parseFloat(form.precio_compra || '0') > 0 && parseFloat(form.cant_p_caja || '0') > 0 && opcionSeleccionada !== "caja_total" && (
                                        <Text className="text-green-600 text-xs ml-1"> ✓ Cal. auto.</Text>
                                    )}
                                </Text>

                                <TextInput
                                    value={formatNumber(
                                        opcionSeleccionada === "caja_total"
                                            ? (parseFloat(form.precio_compra_caja ?? '0') / parseFloat(form.cant_p_caja || '1')).toFixed(4)
                                            : (parseFloat(form.precio_compra) * parseFloat(form.cant_p_caja))
                                    )}
                                    editable={false}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-600"
                                />
                                <Text className="text-xs text-gray-600 mt-1">
                                    {opcionSeleccionada === "caja_total"
                                        ? "Precio por caja ÷ unidades por caja"
                                        : "Precio unitario × unidades por caja"
                                    }
                                </Text>
                            </View>
                        </View>

                        {/* Indicador visual de cálculo */}
                        {parseFloat(form.cant_cajas || '0') > 0 && parseFloat(form.cant_p_caja || '0') > 0 && parseFloat(form.cantidad || '0') > 0 && (
                            <View className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex flex-row gap-3">
                                <Text className="text-sm text-green-700">
                                    <Text className="font-bold">Resumen:</Text> {form.cantidad} unidades compradas ÷ {form.cant_p_caja} por caja = {form.cant_cajas} cajas
                                </Text>
                                {opcionSeleccionada === "por_unidad" && form.precio_compra_caja && (
                                    <Text className="text-sm text-green-700 ">
                                        <Text className="font-bold">Precio por caja:</Text> Gs. {parseFloat(form.precio_compra_caja).toLocaleString("es-PY")} ({parseFloat(form.precio_compra).toLocaleString("es-PY")} Gs. × {form.cant_p_caja} )
                                    </Text>
                                )}
                                {opcionSeleccionada === "caja_total" && form.precio_compra_caja && (
                                    <Text className="text-sm text-blue-700 ">
                                        <Text className="font-bold">Precio por caja:</Text> Gs. {parseFloat(form.precio_compra_caja).toLocaleString("es-PY")} (fijo)
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Stock y Fecha de Vencimiento para productos no CAJA */}
            {form.unidad_medida !== "CAJA" && (
                <View className="mb-6">
                    <View className="text-md font-medium text-gray-800 mb-4 flex flex-row">
                        <Text className="bg-purple-100 text-purple-700 text-center rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">3</Text>
                        <Text>Stock y Vencimiento</Text>
                    </View>
                    <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <View>
                            <View className="block text-sm font-medium text-gray-700 mb-2">
                                <Text>Cantidad en Stock </Text><Text className="text-red-500">*</Text>
                            </View>
                            <TextInput
                                keyboardType="numeric"
                                value={form.cantidad}
                                onChangeText={(text) => handleChange('cantidad', text)}
                                placeholder="100"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View>
                            <Text className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha de Vencimiento
                            </Text>
                            <TextInput
                                value={form.fecha_vencimiento}
                                onChangeText={(text) => handleChange('fecha_vencimiento', text)}
                                placeholder="YYYY-MM-DD"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>
                </View>
            )}

            {/* Fecha de Vencimiento y Botón para productos CAJA */}
            <View className='flex flex-row gap-9'>
                {form.unidad_medida === "CAJA" && (
                    <View className="mb-2">
                        <View className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <View>
                                <Text className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Vencimiento
                                </Text>
                               <TextInput
                            value={form.fecha_vencimiento}
                            onChangeText={(text) => handleChange('fecha_vencimiento', text)}
                            placeholder="YYYY-MM-DD"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                            placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                    </View>
                )}

                {/* Botón de Acción */}
                <View className="flex justify-end items-end">
                     <TouchableOpacity
                    onPress={handleAgregar}
                    className="bg-blue-600 px-6 py-3 rounded-full shadow-sm flex-row items-center"
                >
                    <Text className="text-white text-lg mr-2">➕</Text>
                    <Text className="text-white font-medium">Agregar Producto</Text>
                </TouchableOpacity>
                </View>
            </View>

            <ModalPrecioCompra
                isOpen={!!modalShowOptionCostBuy}
                onClose={() => setModalShowOptionCostBuy("")}
                onConfirm={() => setModalShowOptionCostBuy("")}
                setOpcionSeleccionada={setOpcionSeleccionada}
                opcionSeleccionada={opcionSeleccionada}
            />

            {/* Modal de Advertencia */}
            <ModalAdvert
                isOpen={modalAdvertOpen}
                onClose={() => setModalAdvertOpen(false)}
                message={modalConfirm}
                onConfirm={() => {
                    setModalAdvertOpen(false);
                }}
            />

        </>
    );
};

export default FormularioProducto2;