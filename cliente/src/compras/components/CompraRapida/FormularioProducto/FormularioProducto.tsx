'use client';

import { useEffect, useState } from 'react';
import FormularioProducto1 from './components/FormularioProducto1';
import FormularioProducto2 from './components/FormularioProducto2';

interface Props {
    onAgregar: (producto: any) => void;
    onShowModalConfirm?: (value:boolean) => void;
    productosNuevos: any[];
    dataHeader?: {
        totalProductos: number;
        totalCantidad: number;
        totalValor: number;
    };
}

const FormularioProducto = ({ dataHeader, onAgregar, onShowModalConfirm, productosNuevos}: Props) => {
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
        cantidad: '0',
        cant_p_caja: '',
        cant_cajas: '',
        fecha_vencimiento: '',
        ubicacion: '',
        numero_lote: '01',
        referencia_proveedor: '',
        ubicacion_almacen: 'PRINCIPAL'
    });

    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<any>(null);
    const [opcionSeleccionada, setOpcionSeleccionada] = useState('');
    const [precioCompraTest, setPrecioCompraTest] = useState("");

    //   NUEVO: Estado para rastrear qué precio de venta fue modificado manualmente
    const [precioVentaManual, setPrecioVentaManual] = useState<'unitario' | 'caja' | null>(null);

    //   NUEVA: Función compartida para calcular precio_venta_caja automáticamente
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
        //   Si hay un campo modificado y es un precio de venta o cant_p_caja, calcular automáticamente
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
            cantidad: '0',
            cant_p_caja: '',
            cant_cajas: '',
            fecha_vencimiento: '',
            ubicacion: '',
            numero_lote: '01',
            referencia_proveedor: '',
            ubicacion_almacen: 'PRINCIPAL'
        });
        setCategoriaSeleccionada(null);
        setOpcionSeleccionada("");
        setPrecioVentaManual(null); //   Resetear también esto
    };

    useEffect(() => {
        console.log("precioCompraTest", precioCompraTest)
        if (opcionSeleccionada === "caja_total") setForm(prev => ({ ...prev, precio_compra: precioCompraTest }));
    }, [opcionSeleccionada, precioCompraTest])

    return (
        <div className="">
            {/* Contenedor Principal con diseño mejorado */}
            <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-gray-700 rounded-2xl overflow-auto pb-2">

                {/* Separador visual entre FormularioProducto1 y FormularioProducto2 */}
                <FormularioProducto1
                    dataHeader={dataHeader}
                    form={form}
                    optionSelectedByBox={opcionSeleccionada}
                    setOpcionSeleccionada={setOpcionSeleccionada}
                    setModalShowOptionCostBuy={setModalShowOptionCostBuy}
                    onFormChange={handleFormChange}
                    categoriaSeleccionada={categoriaSeleccionada}
                    onCategoriaSelect={handleCategoriaSelect}
                />

                <FormularioProducto2
                    productosNuevos={productosNuevos}
                    onProcesoCompraChange={onShowModalConfirm}    
                    opcionSeleccionada={opcionSeleccionada}
                    setOpcionSeleccionada={setOpcionSeleccionada}
                    setModalShowOptionCostBuy={setModalShowOptionCostBuy}
                    setPrecioCompraTest={setPrecioCompraTest}
                    form={form}
                    modalShowOptionCostBuy={modalShowOptionCostBuy}
                    onFormChange={handleFormChange}
                    onAgregar={handleAgregar}
                />

            </div>
        </div>
    );
};

export default FormularioProducto;
