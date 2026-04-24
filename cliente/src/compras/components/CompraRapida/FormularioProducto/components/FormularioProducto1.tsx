'use client';

import { useState } from 'react';
import { NumericFormat } from "react-number-format";
import ModalSeleccionarCategoria from '../../../../../productos/components/ModalsProductos/ModalSeleccionarCategoria';
import {  Package, Tag } from 'lucide-react';
import { styleforStep, styleforStepBox, styleTitleBox } from '../utils/style';

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
    numero_lote: string;
    referencia_proveedor: string;
    ubicacion_almacen: string;
}

interface Props {
    optionSelectedByBox?: string;
    setOpcionSeleccionada: (value: string) => void;
    setModalShowOptionCostBuy: (value: string) => void;
    form: FormData;
    onFormChange: (form: FormData, campo?: string) => void;
    categoriaSeleccionada: any;
    onCategoriaSelect: (categoria: any) => void;
    dataHeader?: {
        totalProductos: number;
        totalCantidad: number;
        totalValor: number;
    };
}

const FormularioProducto1 = ({ dataHeader, setOpcionSeleccionada, optionSelectedByBox, setModalShowOptionCostBuy, form, onFormChange, categoriaSeleccionada, onCategoriaSelect }: Props) => {
    const [showCategoriaModal, setShowCategoriaModal] = useState(false);
    const [porcentajeGanancia, setPorcentajeGanancia] = useState('');

    const handlePorcentajeChange = (value: string) => {
        setPorcentajeGanancia(value);
        const precioCompra = parseFloat(
            (optionSelectedByBox === 'caja_total' ? form.precio_compra_caja : form.precio_compra) || '0'
        );
        const pct = parseFloat(value || '0');
        if (precioCompra > 0 && pct > 0) {
            const precioVenta = precioCompra * (1 + pct / 100);
            onFormChange({ ...form, precio_venta: precioVenta.toFixed(2) }, 'precio_venta');
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;

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
        //   IMPORTANTE: Pasar el campo modificado como segundo parámetro
        onFormChange(formActualizado, field);
    };


    return (
        <>
            {/* Información Básica */}
            <div className=" bg-gradient-to-r from-blue-500 to-blue-600 dark:from-gray-800 dark:to-gray-900 rounded-t-lg">
                {/* Título Principal Centrado */}
                <div className="flex flex-col items-center justify-center text-center mb-4">
                    <h3 className="text-lg font-bold text-white uppercase pt-2">Carga Rápida de Productos</h3>
                    <p className="text-sm font-medium text-blue-100">Agregá productos al inventario de forma rápida y eficiente</p>
                </div>

                {/* Contenido Alineado a la Izquierda */}
                <div className="space-y-2">
                    <h3 className="text-base font-bold text-white text-center">Información del Producto</h3>

                    {dataHeader?.totalCantidad !== 0 && (
                        <div className="flex flex-wrap items-center gap-3 justify-between pr-3 pl-3">
                            <p className="text-sm font-medium text-blue-100">Complete los datos principales</p>

                            <div className="flex flex-wrap gap-2">
                                {/* Stock */}
                                <div className="flex items-center gap-1.5 bg-blue-600/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-400/20">
                                    <Package className="w-4 h-4 text-blue-200" strokeWidth={2.5} />
                                    <span className="text-xs font-semibold text-blue-100">{dataHeader?.totalCantidad}</span>
                                    <span className="text-xs text-blue-200">stock</span>
                                </div>

                                {/* Productos */}
                                <div className="flex items-center gap-1.5 bg-blue-600/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-400/20">
                                    <Tag className="w-4 h-4 text-blue-200" strokeWidth={2.5} />
                                    <span className="text-xs font-semibold text-blue-100">{dataHeader?.totalProductos}</span>
                                    <span className="text-xs text-blue-200">productos</span>
                                </div>

                                {/* Valor Total */}
                                <div className="flex items-center gap-1.5 bg-emerald-600/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-400/20">
                                    <span className="text-xs font-semibold text-emerald-100">
                                        ₲ {dataHeader?.totalValor?.toLocaleString('es-PY')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Sección 1: Datos Básicos */}
            <div className='flex flex-row gap-4 px-2'>
                <div className="w-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 border border-blue-100 dark:border-gray-700">
                    <div className={styleforStep}>
                        <div className="bg-blue-500 text-white rounded-lg px-3 py-1 text-sm font-bold shadow-md">
                            PASO 1
                        </div>
                        <h4 className={styleTitleBox}>Datos Básicos</h4>
                    </div>

                    <div className={styleforStepBox}>
                        <div className='flex flex-col gap-3'>
                            <div className="">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                    Nombre del Prod. <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nombre_producto"
                                    value={form.nombre_producto}
                                    onChange={handleChange}
                                    placeholder="Ej: Coca Cola 2L"
                                    className="w-full bg-white dark:bg-gray-700 border-2 border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                    Cód. de Barr.
                                </label>
                                <input
                                    type="text"
                                    name="cod_barra"
                                    value={form.cod_barra}
                                    onChange={handleChange}
                                    placeholder="7891000053508"
                                    className="w-full bg-white dark:bg-gray-700 border-2 border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                                />
                            </div>
                        </div>

                        <div className='flex flex-col gap-3'>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                    Categoría <span className="text-rose-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowCategoriaModal(true)}
                                    className="w-full bg-white dark:bg-gray-700 border-2 border-blue-300 dark:border-blue-600 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-600 hover:border-blue-400 text-left focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 truncate transition-all shadow-sm hover:shadow-md"
                                >
                                    {categoriaSeleccionada ? categoriaSeleccionada.categoria : 'Seleccionar Categoría'}
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                    Ubicación
                                </label>
                                <input
                                    type="text"
                                    name="ubicacion"
                                    value={form.ubicacion}
                                    onChange={handleChange}
                                    placeholder="Estante A1"
                                    className="w-full bg-white dark:bg-gray-700 border-2 border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección 2: Precios y Configuración */}
                <div className="w-full bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 border border-emerald-200 dark:border-gray-700">
                    <div className={styleforStep}>
                        <div className="bg-emerald-500 text-white rounded-lg px-3 py-1 text-sm font-bold shadow-md truncate">
                            PASO 2
                        </div>
                        <h4 className={styleTitleBox}>Precios y Configuración</h4>
                    </div>

                    <div className='flex flex-col gap-3'>
                        <div className={styleforStepBox}>
                            <div className='flex flex-col gap-3'>
                                {/* Unidad de Medida */}
                                <div className='w-full'>
                                    <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                        Unidad <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        name="unidad_medida"
                                        value={form.unidad_medida}
                                        onChange={handleChange}
                                        className="truncate mt-1 w-full bg-white dark:bg-gray-700 border-2 border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-gray-100 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 transition-all shadow-sm hover:shadow-md cursor-pointer"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="KG">Kilogramo</option>
                                        <option value="UNIDAD">Unidad</option>
                                        <option value="PAQUETE">Paquete</option>
                                        <option value="CAJA">Caja</option>
                                        <option value="LITRO">Litro</option>
                                    </select>
                                </div>

                                {/* IVA */}
                                <div className='w-full'>
                                    <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                        IVA <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        name="iva"
                                        value={form.iva}
                                        onChange={handleChange}
                                        className="truncate mt-2 w-full bg-white dark:bg-gray-700 border-2 border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-gray-100 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 transition-all shadow-sm hover:shadow-md cursor-pointer"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="0">Exenta (0%)</option>
                                        <option value="5">5%</option>
                                        <option value="10">10%</option>
                                    </select>
                                </div>
                            </div>
                            <div className='flex flex-col gap-3'>
                                {/* Precio de Compra */}
                                <div className='w-full'>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 truncate">
                                        {optionSelectedByBox === "caja_total" ? "P. Compra Caja*" : "P. Compra und.*"}
                                    </label>
                                    <NumericFormat
                                        value={optionSelectedByBox === "caja_total" ? form.precio_compra_caja : form.precio_compra}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        decimalScale={2}
                                        fixedDecimalScale={false}
                                        allowNegative={false}
                                        onValueChange={(values) => {
                                            handleNumericChange(optionSelectedByBox === "caja_total" ? 'precio_compra_caja' : 'precio_compra', values.value || '');
                                        }}
                                        placeholder="0,00"
                                        className="w-full bg-white dark:bg-gray-700 border-2 border-slate-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                                    />
                                </div>

                                {/* % Ganancia → calcula P. Venta */}
                                <div className='w-full'>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 truncate">
                                        % Ganancia
                                    </label>
                                    <NumericFormat
                                        value={porcentajeGanancia}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        decimalScale={2}
                                        fixedDecimalScale={false}
                                        allowNegative={false}
                                        onValueChange={(values) => handlePorcentajeChange(values.value || '')}
                                        placeholder="Ej: 30"
                                        suffix=" %"
                                        className="w-full bg-white dark:bg-gray-700 border-2 border-violet-300 dark:border-violet-600 rounded-xl px-4 py-3 text-sm font-bold text-violet-700 dark:text-violet-400 placeholder-slate-400 dark:placeholder-gray-400 focus:ring-4 focus:ring-violet-200 dark:focus:ring-violet-800 focus:border-violet-500 transition-all shadow-sm hover:shadow-md"
                                    />
                                </div>

                                {/* Precio de Venta Unitario */}
                                <div className='w-full'>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 truncate">
                                        {form.unidad_medida === 'CAJA' ? 'P. Venta und.*' : 'P. Venta*'}
                                    </label>
                                    <NumericFormat
                                        value={form.precio_venta}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        decimalScale={2}
                                        fixedDecimalScale={false}
                                        allowNegative={false}
                                        onValueChange={(values) => {
                                            handleNumericChange('precio_venta', values.value || '');
                                        }}
                                        placeholder="0,00"
                                        className="w-full bg-white dark:bg-gray-700 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-400 placeholder-slate-400 dark:placeholder-gray-400 focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Precio de Venta por Caja */}
                        {form.unidad_medida === 'CAJA' ? (
                            <div className=''>
                                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                    P. Venta Caja
                                </label>
                                <NumericFormat
                                    value={form.precio_venta_caja}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    decimalScale={2}
                                    fixedDecimalScale={false}
                                    allowNegative={false}
                                    onValueChange={(values) => {
                                        handleNumericChange('precio_venta_caja', values.value || '');
                                    }}
                                    placeholder="0,00"
                                    className="w-full mt-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-400 placeholder-slate-400 dark:placeholder-gray-400 focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-800 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md"
                                />
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1.5">Cálculo automático</p>
                            </div>
                        ) : (
                            <div className="hidden lg:block"></div>
                        )}
                    </div>
                </div>

            </div>

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