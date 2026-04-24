'use client';

import { useEffect, useState } from 'react';
import ModalSuccess from '../../components/ModalSuccess';
import ModalError from '../../components/ModalError';
import ModalSeleccionarCategoria from '../components/ModalsProductos/ModalSeleccionarCategoria';
import ModalConfirmUpdate from './ModalsProductos/ModalConfirmUpdate';
import { FiSave } from 'react-icons/fi';
import { getProductoById, updateProducto } from '../../services/productos';
import { NumericFormat } from 'react-number-format';
import { Package } from 'lucide-react';
import { renderTitle } from '../../clientes/utils/utils';

const initialForm = {
  nombre_producto: '',
  precio_venta: '',
  precio_venta_caja: '',
  precio_compra: '',
  precio_compra_caja: '',
  idcategoria: '',
  ubicacion: '',
  cod_barra: '',
  iva: '',
  estado: 'activo',
  unidad_medida: '',
  cant_p_caja: '',
  cant_cajas: ''
};

interface EditarProductoProps {
  id: number | string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const EditarProducto = ({ id, onSuccess, onClose }: EditarProductoProps) => {
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  const [categoriaNombre, setCategoriaNombre] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [esInventarioInicial, setEsInventarioInicial] = useState(false);

  useEffect(() => {
    if (id) {
      getProductoById(id).then((res) => {
        const data = res.data;

        // Normalizar IVA: convertir "10.00" a "10", "5.00" a "5", etc.
        const normalizarIva = (iva: any): string => {
          if (iva === null || iva === undefined || iva === '') return '';
          const ivaNum = parseFloat(iva);
          if (isNaN(ivaNum)) return '';
          return String(Math.round(ivaNum));
        };

        setFormData({
          nombre_producto: data.nombre_producto || '',
          precio_venta: data.precio_venta ?? '',
          precio_venta_caja: data.precio_venta_caja ?? '',
          precio_compra: data.precio_compra ?? '',
          precio_compra_caja: data.precio_compra_caja ?? '',
          idcategoria: data.idcategoria ?? '',
          ubicacion: data.ubicacion || '',
          cod_barra: data.cod_barra || '',
          iva: normalizarIva(data.iva),
          estado: data.estado || 'activo',
          unidad_medida: data.unidad_medida || '',
          cant_p_caja: data.cant_p_caja ?? '',
          cant_cajas: data.cant_cajas ?? ''
        });
        setCategoriaNombre(data.nombre_categoria || '');

        // Detectar si es inventario inicial (tiene precio_compra establecido)
        setEsInventarioInicial(data.precio_compra !== null && data.precio_compra !== undefined && data.precio_compra !== '');
      });
    }
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    let formActualizado = { ...formData, [name]: value };

    // Limpiar campos específicos de cajas cuando no sea CAJA
    if (name === 'unidad_medida' && value !== 'CAJA') {
      formActualizado = {
        ...formActualizado,
        cant_cajas: '',
        cant_p_caja: '',
        precio_venta_caja: '',
        precio_compra_caja: ''
      };
    }

    setFormData(formActualizado);
  };

  const handleNumericChange = (field: string, value: string) => {
    const formActualizado = { ...formData, [field]: value };

    // Calcular precio_venta_caja automáticamente si es CAJA
    if (formData.unidad_medida === 'CAJA') {
      const porCaja = parseFloat(formActualizado.cant_p_caja) || 0;
      const precioVentaUnitario = parseFloat(formActualizado.precio_venta) || 0;

      if (field === 'precio_venta' && precioVentaUnitario > 0 && porCaja > 0) {
        formActualizado.precio_venta_caja = (precioVentaUnitario * porCaja).toFixed(2);
      } else if (field === 'precio_venta_caja') {
        const precioVentaCaja = parseFloat(value) || 0;
        if (precioVentaCaja > 0 && porCaja > 0) {
          formActualizado.precio_venta = (precioVentaCaja / porCaja).toFixed(4);
        }
      } else if (field === 'cant_p_caja' && porCaja > 0 && precioVentaUnitario > 0) {
        formActualizado.precio_venta_caja = (precioVentaUnitario * porCaja).toFixed(2);
      }
    }

    setFormData(formActualizado);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      await updateProducto(id, formData);
      setConfirmModalOpen(false);
      setSuccessModalOpen(true);
      onSuccess && onSuccess();
    } catch (error: any) {
      console.error('Error al actualizar producto:', error.response?.data?.message);
      setErrorMessage(error.response?.data?.message || 'Error al actualizar producto');
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    onClose && onClose();
  };

  // Estilos reutilizables con responsive
  const styleInput = `
  w-full
  bg-white dark:bg-slate-800
  border-2 border-slate-200 dark:border-slate-700
  rounded-xl
  px-3 py-2 sm:px-4 sm:py-3 md:px-4 md:py-3
  text-xs sm:text-sm md:text-sm font-medium
  text-slate-700 dark:text-slate-100
  placeholder-slate-400 dark:placeholder-slate-500
  focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800
  focus:border-blue-500 dark:focus:border-blue-400
  transition-all shadow-sm hover:shadow-md
`;

  const styleLabel = `
  block text-xs sm:text-sm md:text-sm
  font-semibold
  text-slate-700 dark:text-slate-200
  mb-1 sm:mb-2 md:mb-2
`;

  const styleSection = `
  bg-gradient-to-br
  from-slate-50 to-blue-50
  dark:from-slate-800 dark:to-slate-900
  rounded-xl
  p-3 sm:p-4 md:p-4
  border border-blue-100 dark:border-slate-700
`;

  const styleSectionGreen = `
  bg-gradient-to-br
  from-emerald-50 to-blue-50
  dark:from-slate-800 dark:to-slate-900
  rounded-xl
  p-3 sm:p-4 md:p-4
  border border-emerald-200 dark:border-emerald-700
`;

  const styleStepBadge = `
  bg-blue-500
  text-white
  rounded-lg
  px-2 py-0.5 sm:px-3 sm:py-1 md:px-3 md:py-1
  text-xs sm:text-sm md:text-sm
  font-bold shadow-md
`;

  const styleStepBadgeGreen = `
  bg-emerald-500
  text-white
  rounded-lg
  px-2 py-0.5 sm:px-3 sm:py-1 md:px-3 md:py-1
  text-xs sm:text-sm md:text-sm
  font-bold shadow-md
`;

  return (
    <div className="flex items-center justify-center px-1 sm:px-2 md:px-4 lg:px-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl w-full overflow-hidden border-2 border-blue-200 dark:border-slate-700 shadow-xl">
        {/* Header */}
        {renderTitle({
          title: "Editar Producto",
          subtitle: "Modifica los datos del producto",
          icon: <Package className="text-white text-3xl sm:text-4xl" />
        })}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-4 sm:space-y-5 md:space-y-6">

          {/* PASO 1: Datos Básicos */}
          <div className={styleSection}>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-4">
              <span className={styleStepBadge}>PASO 1</span>
              <h4 className="text-sm sm:text-base md:text-base font-bold text-slate-700">Datos Básicos</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-4">
              {/* Nombre del Producto */}
              <div>
                <label className={styleLabel}>
                  Nombre del Producto <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre_producto"
                  value={formData.nombre_producto}
                  onChange={handleChange}
                  placeholder="Ej: Coca Cola 2L"
                  className={styleInput}
                />
              </div>

              {/* Código de Barras */}
              <div>
                <label className={styleLabel}>Código de Barras</label>
                <input
                  type="text"
                  name="cod_barra"
                  value={formData.cod_barra}
                  onChange={handleChange}
                  placeholder="7891000053508"
                  className={styleInput}
                />
              </div>

              {/* Categoría */}
              <div>
                <label className={styleLabel}>
                  Categoría <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setModalCategoriaOpen(true)}
                  className="
                      w-full
                      bg-white dark:bg-slate-800
                      border-2 border-blue-300 dark:border-blue-700
                      rounded-xl
                      px-3 py-2 sm:px-4 sm:py-3 md:px-4 md:py-3
                      text-xs sm:text-sm md:text-sm font-medium
                      text-slate-700 dark:text-slate-100
                      hover:bg-blue-50 dark:hover:bg-slate-700
                      hover:border-blue-400
                      text-left
                      focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800
                      focus:border-blue-500 dark:focus:border-blue-400
                      truncate transition-all shadow-sm hover:shadow-md
                    "
                >
                  {categoriaNombre || 'Seleccionar Categoría'}
                </button>
              </div>

              {/* Ubicación */}
              <div>
                <label className={styleLabel}>Ubicación</label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  placeholder="Estante A1"
                  className={styleInput}
                />
              </div>
            </div>
          </div>

          {/* PASO 2: Precios y Configuración */}
          <div className={styleSectionGreen}>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-4">
              <span className={styleStepBadgeGreen}>PASO 2</span>
              <h4 className="text-sm sm:text-base md:text-base font-bold text-slate-700">Precios y Configuración</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-4">
              {/* Unidad de Medida */}
              <div>
                <label className={styleLabel}>
                  Unidad de Medida <span className="text-rose-500">*</span>
                </label>
                <select
                  name="unidad_medida"
                  value={formData.unidad_medida}
                  onChange={handleChange}
                  className={styleInput + " cursor-pointer"}
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
              <div>
                <label className={styleLabel}>
                  IVA <span className="text-rose-500">*</span>
                </label>
                <select
                  name="iva"
                  value={formData.iva}
                  onChange={handleChange}
                  className={styleInput + " cursor-pointer"}
                >
                  <option value="">Seleccionar IVA</option>
                  <option value="0">Exenta (0%)</option>
                  <option value="5">5%</option>
                  <option value="10">10%</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className={styleLabel}>Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className={styleInput + " cursor-pointer"}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              {/* Precio de Compra (solo si es inventario inicial) */}
              {esInventarioInicial && (
                <div>
                  <label className={styleLabel}>
                    Precio de Compra
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 sm:px-2 rounded">Inv. Inicial</span>
                  </label>
                  <NumericFormat
                    value={formData.precio_compra}
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale={false}
                    allowNegative={false}
                    onValueChange={(values) => handleNumericChange('precio_compra', values.value || '')}
                    placeholder="0,00"
                    className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2 sm:px-4 sm:py-3 md:px-4 md:py-3 text-xs sm:text-sm md:text-sm font-bold text-amber-700 placeholder-slate-400 focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all shadow-sm hover:shadow-md"
                  />
                </div>
              )}

              {/* Precio de Venta */}
              <div>
                <label className={styleLabel}>
                  {formData.unidad_medida === 'CAJA' ? 'P. Venta Unitario' : 'Precio de Venta'} <span className="text-rose-500">*</span>
                </label>
                <NumericFormat
                  value={formData.precio_venta}
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={2}
                  fixedDecimalScale={false}
                  allowNegative={false}
                  onValueChange={(values) => handleNumericChange('precio_venta', values.value || '')}
                  placeholder="0,00"
                  className="w-full bg-white border-2 border-emerald-300 rounded-xl px-3 py-2 sm:px-4 sm:py-3 md:px-4 md:py-3 text-xs sm:text-sm md:text-sm font-bold text-emerald-700 placeholder-slate-400 focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md"
                />
              </div>

              {/* Precio Venta Caja (solo si es CAJA) */}
              {formData.unidad_medida === 'CAJA' && (
                <div>
                  <label className={styleLabel}>P. Venta por Caja</label>
                  <NumericFormat
                    value={formData.precio_venta_caja}
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale={false}
                    allowNegative={false}
                    onValueChange={(values) => handleNumericChange('precio_venta_caja', values.value || '')}
                    placeholder="0,00"
                    className="w-full bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl px-3 py-2 sm:px-4 sm:py-3 md:px-4 md:py-3 text-xs sm:text-sm md:text-sm font-bold text-emerald-700 placeholder-slate-400 focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md"
                  />
                  <p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-1">Cálculo automático</p>
                </div>
              )}
            </div>
          </div>

          {/* PASO 3: Configuración de Caja (solo si es CAJA) */}
          {formData.unidad_medida === 'CAJA' && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 sm:p-4 md:p-4 border border-orange-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-4">
                <span className="bg-orange-500 text-white rounded-lg px-2 py-0.5 sm:px-3 sm:py-1 md:px-3 md:py-1 text-xs sm:text-sm md:text-sm font-bold shadow-md">PASO 3</span>
                <h4 className="text-sm sm:text-base md:text-base font-bold text-slate-700">Configuración de Caja</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-4">
                {/* Cantidad por Caja */}
                <div>
                  <label className={styleLabel}>Unidades por Caja</label>
                  <NumericFormat
                    value={formData.cant_p_caja}
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={0}
                    allowNegative={false}
                    onValueChange={(values) => handleNumericChange('cant_p_caja', values.value || '')}
                    placeholder="Ej: 24"
                    className="w-full bg-white border-2 border-orange-300 rounded-xl px-3 py-2 sm:px-4 sm:py-3 md:px-4 md:py-3 text-xs sm:text-sm md:text-sm font-bold text-orange-700 placeholder-slate-400 focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all shadow-sm hover:shadow-md"
                  />
                </div>

                {/* Precio Compra Caja (solo si es inventario inicial) */}
                {esInventarioInicial && (
                  <div>
                    <label className={styleLabel}>
                      P. Compra por Caja
                      <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 sm:px-2 rounded">Inv. Inicial</span>
                    </label>
                    <NumericFormat
                      value={formData.precio_compra_caja}
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale={false}
                      allowNegative={false}
                      onValueChange={(values) => handleNumericChange('precio_compra_caja', values.value || '')}
                      placeholder="0,00"
                      className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2 sm:px-4 sm:py-3 md:px-4 md:py-3 text-xs sm:text-sm md:text-sm font-bold text-amber-700 placeholder-slate-400 focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all shadow-sm hover:shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botón Guardar */}
          <div className="pt-2 sm:pt-3 md:pt-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 sm:py-3.5 md:py-4 rounded-xl transition-all text-sm sm:text-base md:text-lg font-bold shadow-lg hover:shadow-xl"
            >
              <FiSave className="text-lg sm:text-xl md:text-2xl" />
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      {/* Modales */}
      <ModalSuccess
        isOpen={successModalOpen}
        onClose={handleSuccessClose}
        message="Producto actualizado con éxito"
      />
      <ModalError
        isOpen={!!errorMessage}
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />
      <ModalConfirmUpdate
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmUpdate}
        data={formData}
      />
      <ModalSeleccionarCategoria
        isOpen={modalCategoriaOpen}
        onClose={() => setModalCategoriaOpen(false)}
        onSelect={(categoria) => {
          setFormData({ ...formData, idcategoria: categoria.idcategorias });
          setCategoriaNombre(categoria.categoria);
          setModalCategoriaOpen(false);
        }}
      />
    </div>
  );
};

export default EditarProducto;
