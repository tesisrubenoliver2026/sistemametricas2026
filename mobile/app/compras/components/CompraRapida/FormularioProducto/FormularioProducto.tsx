import { useEffect, useState } from 'react';
import { View } from 'react-native';
import FormularioProducto1 from './components/FormularioProducto1';
import FormularioProducto2 from './components/FormularioProducto2';

interface Props {
    onAgregar: (producto: any) => void;
}

const FormularioProducto = ({ onAgregar }: Props) => {
    const [modalShowOptionCostBuy, setModalShowOptionCostBuy] = useState('');
    const [form, setForm] = useState({
        nombre_producto: '',
        precio_compra: '',
        precio_compra_caja: '',
        cod_barra: '',
        precio_venta: '',
        precio_venta_caja: '',
        unidad_medida: '',
        iva: '',
        idcategoria: '',
        cantidad: '',
        cant_p_caja: '',
        cant_cajas: '',
        fecha_vencimiento: '',
        ubicacion: ''
    });

    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<any>(null);
    const [opcionSeleccionada, setOpcionSeleccionada] = useState('');
    const [precioCompraTest, setPrecioCompraTest] = useState("");

    // ✅ NUEVO: Estado para rastrear qué precio de venta fue modificado manualmente
    const [precioVentaManual, setPrecioVentaManual] = useState<'unitario' | 'caja' | null>(null);

    // ✅ NUEVA: Función compartida para calcular precio_venta_caja automáticamente
    const calcularPrecioVentaCaja = (formActualizado: any, campoModificado: string) => {
        if (formActualizado.unidad_medida !== 'CAJA') {
            return formActualizado;
        }

        const porCaja = parseFloat(formActualizado.cant_p_caja) || 0;
        const precioVentaUnitario = parseFloat(formActualizado.precio_venta) || 0;
        const precioVentaCaja = parseFloat(formActualizado.precio_venta_caja) || 0;

        let nuevoForm = { ...formActualizado };

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
                nuevoForm.precio_venta = (precioVentaCaja / porCaja).toFixed(4);
            } else if ((precioVentaManual === 'unitario' || !precioVentaManual) && precioVentaUnitario > 0) {
                nuevoForm.precio_venta_caja = (precioVentaUnitario * porCaja).toFixed(2);
            }
        }

        return nuevoForm;
    };

    const handleFormChange = (newForm: any, campoModificado?: string) => {
        // ✅ Si hay un campo modificado y es un precio de venta o cant_p_caja, calcular automáticamente
        if (campoModificado && ['precio_venta', 'precio_venta_caja', 'cant_p_caja'].includes(campoModificado)) {
            const formConCalculos = calcularPrecioVentaCaja(newForm, campoModificado);
            setForm(formConCalculos);
        } else {
            setForm(newForm);
        }
    };

    const handleCategoriaSelect = (categoria: any) => {
        setCategoriaSeleccionada(categoria);
        setForm(prev => ({ ...prev, idcategoria: categoria.idcategorias }));
    };

    const handleAgregar = (producto: any) => {
        onAgregar(producto);
        console.log("producto recibido", producto)

        // Resetear formulario
        setForm({
            nombre_producto: '',
            precio_compra: '',
            precio_compra_caja: '',
            cod_barra: '',
            precio_venta: '',
            precio_venta_caja: '',
            unidad_medida: '',
            iva: '',
            idcategoria: '',
            cantidad: '',
            cant_p_caja: '',
            cant_cajas: '',
            fecha_vencimiento: '',
            ubicacion: ''
        });
        setCategoriaSeleccionada(null);
        setOpcionSeleccionada("");
        setPrecioVentaManual(null); // ✅ Resetear también esto
    };

    useEffect(() => {
        console.log("precioCompraTest", precioCompraTest)
        if(opcionSeleccionada === "caja_total") setForm(prev => ({ ...prev, precio_compra: precioCompraTest }));
    }, [opcionSeleccionada, precioCompraTest])

    return (
        <View className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 mb-2">
            <FormularioProducto1
                form={form}
                optionSelectedByBox={opcionSeleccionada}
                setOpcionSeleccionada={setOpcionSeleccionada}
                setModalShowOptionCostBuy={setModalShowOptionCostBuy}
                onFormChange={handleFormChange}
                categoriaSeleccionada={categoriaSeleccionada}
                onCategoriaSelect={handleCategoriaSelect}
            />

            <FormularioProducto2
                opcionSeleccionada={opcionSeleccionada}
                setOpcionSeleccionada={setOpcionSeleccionada}
                setModalShowOptionCostBuy={setModalShowOptionCostBuy}
                setPrecioCompraTest={setPrecioCompraTest}
                form={form}
                modalShowOptionCostBuy={modalShowOptionCostBuy}
                onFormChange={handleFormChange}
                onAgregar={handleAgregar}
            />
        </View>
    );
};

export default FormularioProducto;