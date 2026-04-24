'use client';

import { useState } from 'react';
import { FaBoxOpen, FaTag, FaChevronRight, FaChevronLeft, FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
import { NumericFormat } from 'react-number-format';
import { getProductosPaginated } from '../../../services/productos';
import ModalAdvert from '../../../components/ModalAdvert';
import ModalSeleccionarCategoria from '../../../productos/components/ModalsProductos/ModalSeleccionarCategoria';

interface FormCrearProductoInlineProps {
  onAgregar: (detalle: any) => void;
  onCancelar: () => void;
}

const IVA_OPCIONES = ['5', '10', '0'];
const UNIDAD_OPCIONES = ['UNIDAD', 'KG', 'L', 'M', 'CAJA'];

const initialForm = {
  // Paso 1
  nombre_producto: '',
  idcategoria: '',
  cod_barra: '',
  ubicacion_almacen: 'PRINCIPAL',
  // Paso 2
  unidad_medida: 'UNIDAD',
  precio_compra: '',
  iva: '10',
  ganancia: '',
  precio_venta: '',
  precio_compra_caja: '',
  precio_venta_caja: '',
  cant_p_caja: '',
  // Paso 4
  cantidad: '1',
  fecha_vencimiento: '',
};

const PASOS = [
  { label: 'Datos básicos', num: 1 },
  { label: 'Precio y config', num: 2 },
  { label: 'Stock y venc.', num: 3 },
];

const FormCrearProductoInline = ({ onAgregar, onCancelar }: FormCrearProductoInlineProps) => {
  const [paso, setPaso] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<any>(null);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);

  // Validar duplicado
  const [validandoProducto, setValidandoProducto] = useState(false);
  const [modalDuplicadoOpen, setModalDuplicadoOpen] = useState(false);
  const [productoDuplicado, setProductoDuplicado] = useState<any>(null);

  // Errors
  const [errores, setErrores] = useState<Record<string, string>>({});

  const set = (field: string, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };

      // Auto-calcular precio venta desde ganancia
      if ((field === 'ganancia' || field === 'precio_compra') && next.unidad_medida !== 'CAJA') {
        const pc = parseFloat(next.precio_compra || '0');
        const g = parseFloat(next.ganancia || '0');
        if (pc > 0 && g > 0) {
          next.precio_venta = Math.round(pc * (1 + g / 100)).toString();
        }
      }
      if ((field === 'ganancia' || field === 'precio_compra_caja') && next.unidad_medida === 'CAJA') {
        const pc = parseFloat(next.precio_compra_caja || '0');
        const g = parseFloat(next.ganancia || '0');
        if (pc > 0 && g > 0) {
          next.precio_venta_caja = Math.round(pc * (1 + g / 100)).toString();
          // precio unitario
          const cpp = parseFloat(next.cant_p_caja || '1');
          if (cpp > 0) {
            next.precio_venta = Math.round((pc * (1 + g / 100)) / cpp).toString();
          }
        }
      }
      if (field === 'cant_p_caja' && next.unidad_medida === 'CAJA') {
        const pc = parseFloat(next.precio_compra_caja || '0');
        const cpp = parseFloat(value || '1');
        if (pc > 0 && cpp > 0) next.precio_compra = (pc / cpp).toString();
        const pvc = parseFloat(next.precio_venta_caja || '0');
        if (pvc > 0 && cpp > 0) next.precio_venta = Math.round(pvc / cpp).toString();
      }

      return next;
    });
    setErrores(prev => ({ ...prev, [field]: '' }));
  };

  const validarPaso1 = () => {
    const e: Record<string, string> = {};
    if (!form.nombre_producto.trim()) e.nombre_producto = 'El nombre es obligatorio.';
    if (!form.idcategoria) e.idcategoria = 'Seleccioná una categoría.';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const validarPaso2 = () => {
    const e: Record<string, string> = {};
    if (form.unidad_medida === 'CAJA') {
      if (!form.precio_compra_caja) e.precio_compra_caja = 'El precio de compra por caja es obligatorio.';
      if (!form.cant_p_caja) e.cant_p_caja = 'La cantidad por caja es obligatoria.';
      if (!form.precio_venta_caja) e.precio_venta_caja = 'El precio de venta por caja es obligatorio.';
    } else {
      if (!form.precio_compra) e.precio_compra = 'El precio de compra es obligatorio.';
      if (!form.precio_venta) e.precio_venta = 'El precio de venta es obligatorio.';
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const validarPaso3 = () => {
    const e: Record<string, string> = {};
    if (!form.cantidad || parseFloat(form.cantidad) <= 0) e.cantidad = 'La cantidad debe ser mayor a 0.';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleSiguiente = () => {
    if (paso === 1 && !validarPaso1()) return;
    if (paso === 2 && !validarPaso2()) return;
    setPaso(p => p + 1);
  };

  const handleValidarDuplicado = async () => {
    if (!form.nombre_producto.trim()) return;
    setValidandoProducto(true);
    try {
      const res = await getProductosPaginated({ page: 1, limit: 5, search: form.nombre_producto.trim() });
      const raw2 = res.data;
      const lista = Array.isArray(raw2)
        ? raw2
        : Array.isArray(raw2?.productos)
          ? raw2.productos
          : Array.isArray(raw2?.data)
            ? raw2.data
            : [];
      const encontrado = lista.find((p: any) =>
        p.nombre_producto?.toLowerCase() === form.nombre_producto.trim().toLowerCase()
      );
      if (encontrado) {
        setProductoDuplicado(encontrado);
        setModalDuplicadoOpen(true);
      } else {
        setErrores(prev => ({ ...prev, nombre_producto: '' }));
        // Visual feedback sin modal
        setProductoDuplicado(null);
        // Pequeño feedback temporal
        setErrores(prev => ({ ...prev, _validado: 'ok' }));
        setTimeout(() => setErrores(prev => { const n = { ...prev }; delete n._validado; return n; }), 2000);
      }
    } catch {
      // silenciar error
    } finally {
      setValidandoProducto(false);
    }
  };

  const handleAgregar = () => {
    if (!validarPaso3()) return;

    const idtemp = `temp-${Date.now()}`;
    const esCaja = form.unidad_medida === 'CAJA';

    const detalle: any = {
      idproducto: idtemp,
      nombre_producto: form.nombre_producto.trim(),
      cantidad: form.cantidad,
      precio: esCaja
        ? (parseFloat(form.precio_compra_caja || '0') / parseFloat(form.cant_p_caja || '1')).toString()
        : form.precio_compra,
      precio_compra: esCaja
        ? (parseFloat(form.precio_compra_caja || '0') / parseFloat(form.cant_p_caja || '1')).toString()
        : form.precio_compra,
      precio_venta: form.precio_venta,
      precio_venta_caja: esCaja ? form.precio_venta_caja : null,
      precio_compra_caja: esCaja ? form.precio_compra_caja : null,
      cant_p_caja: esCaja ? form.cant_p_caja : null,
      cant_cajas: esCaja ? form.cantidad : null,
      unidad_medida: form.unidad_medida,
      iva: form.iva,
      idcategoria: form.idcategoria,
      cod_barra: form.cod_barra,
      numero_lote: '01',
      referencia_proveedor: '',
      ubicacion_almacen: form.ubicacion_almacen || 'PRINCIPAL',
      fecha_vencimiento: form.fecha_vencimiento || '',
    };

    onAgregar(detalle);
    setForm(initialForm);
    setPaso(1);
  };


  return (
    <div className="flex flex-col h-[520px] bg-white dark:bg-gray-800 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-800 dark:to-emerald-900 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FaBoxOpen className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Crear nuevo producto</h2>
              <p className="text-xs text-green-100">Se agregará al inventario al registrar la compra</p>
            </div>
          </div>
          <button
            onClick={onCancelar}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            title="Cancelar"
          >
            <FaTimes className="text-white" size={14} />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 mt-3">
          {PASOS.map((p, i) => (
            <div key={p.num} className="flex items-center gap-1 flex-1">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold transition-all ${paso === p.num
                ? 'bg-white text-green-700'
                : paso > p.num
                  ? 'bg-green-400/40 text-white'
                  : 'bg-white/10 text-green-200'
                }`}>
                {paso > p.num ? <FaCheck size={10} /> : <span>{p.num}</span>}
                <span className="hidden sm:inline">{p.label}</span>
              </div>
              {i < PASOS.length - 1 && (
                <div className={`flex-1 h-0.5 rounded ${paso > p.num ? 'bg-green-400' : 'bg-white/20'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 overflow-y-auto">

        {/* ─── PASO 1: Datos básicos ─── */}
        {paso === 1 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Datos básicos</p>

            {/* Nombre */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del producto <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.nombre_producto}
                  onChange={e => set('nombre_producto', e.target.value)}
                  placeholder="Ej: Paracetamol 500mg"
                  className={`flex-1 px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent ${errores.nombre_producto ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
                />
                <button
                  type="button"
                  onClick={handleValidarDuplicado}
                  disabled={validandoProducto || !form.nombre_producto.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-md font-medium transition-colors whitespace-nowrap"
                  title="Verificar si el producto ya existe"
                >
                  {validandoProducto ? (
                    <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <FaSearch size={11} />
                  )}
                  Validar
                </button>
              </div>
              {errores.nombre_producto && <p className="text-xs text-red-500 mt-1">{errores.nombre_producto}</p>}
              {errores._validado === 'ok' && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <FaCheck size={10} /> Producto no encontrado, podés continuar.
                </p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCategoriaModal(true)}
                className={`w-full border px-4 py-2 rounded-lg text-left bg-gray-50 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-2 focus:ring-green-500 text-sm ${errores.idcategoria ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
              >
                {categoriaSeleccionada
                  ? <span className="flex items-center gap-1.5"><FaTag size={11} className="text-green-600" />{categoriaSeleccionada.categoria || categoriaSeleccionada.nombre_categoria || categoriaSeleccionada.nombre}</span>
                  : <span className="text-gray-400 dark:text-gray-400">Seleccionar categoría...</span>
                }
              </button>
              {errores.idcategoria && <p className="text-xs text-red-500 mt-1">{errores.idcategoria}</p>}
            </div>

            {/* Cod barra + Ubicación */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cód. de barra</label>
                <input
                  type="text"
                  value={form.cod_barra}
                  onChange={e => set('cod_barra', e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ubicación</label>
                <input
                  type="text"
                  value={form.ubicacion_almacen}
                  onChange={e => set('ubicacion_almacen', e.target.value)}
                  placeholder="PRINCIPAL"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── PASO 2: Precio y configuración ─── */}
        {paso === 2 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Precio y configuración</p>

            {/* Unidad y IVA */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Unidad de medida</label>
                <select
                  value={form.unidad_medida}
                  onChange={e => set('unidad_medida', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                >
                  {UNIDAD_OPCIONES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">IVA (%)</label>
                <select
                  value={form.iva}
                  onChange={e => set('iva', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                >
                  {IVA_OPCIONES.map(i => <option key={i} value={i}>{i}%</option>)}
                </select>
              </div>
            </div>

            {form.unidad_medida === 'CAJA' ? (
              <>
                {/* CAJA: cant_p_caja + precio_compra_caja */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unid. por caja <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.cant_p_caja}
                      onChange={e => set('cant_p_caja', e.target.value)}
                      placeholder="Ej: 12"
                      className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-green-500 ${errores.cant_p_caja ? 'border-red-400' : 'border-orange-300 dark:border-orange-600'}`}
                    />
                    {errores.cant_p_caja && <p className="text-xs text-red-500 mt-1">{errores.cant_p_caja}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      P. compra (caja) <span className="text-red-500">*</span>
                    </label>
                    <NumericFormat
                      value={form.precio_compra_caja}
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={0}
                      allowNegative={false}
                      onValueChange={v => set('precio_compra_caja', v.value)}
                      placeholder="₲ 0"
                      className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-green-500 ${errores.precio_compra_caja ? 'border-red-400' : 'border-orange-300 dark:border-orange-600'}`}
                      prefix="₲ "
                    />
                    {errores.precio_compra_caja && <p className="text-xs text-red-500 mt-1">{errores.precio_compra_caja}</p>}
                  </div>
                </div>
                {/* Precio unitario auto-calculado */}
                {form.precio_compra && form.cant_p_caja && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-md">
                    Precio unitario: ₲ {Math.round(parseFloat(form.precio_compra_caja || '0') / parseFloat(form.cant_p_caja || '1')).toLocaleString('es-PY')}
                  </p>
                )}
                {/* Ganancia */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">% Ganancia</label>
                    <input
                      type="number"
                      min="0"
                      value={form.ganancia}
                      onChange={e => set('ganancia', e.target.value)}
                      placeholder="Ej: 30"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      P. venta (caja) <span className="text-red-500">*</span>
                    </label>
                    <NumericFormat
                      value={form.precio_venta_caja}
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={0}
                      allowNegative={false}
                      onValueChange={v => set('precio_venta_caja', v.value)}
                      placeholder="₲ 0"
                      className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-green-500 ${errores.precio_venta_caja ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
                      prefix="₲ "
                    />
                    {errores.precio_venta_caja && <p className="text-xs text-red-500 mt-1">{errores.precio_venta_caja}</p>}
                  </div>
                </div>
                {form.precio_venta && form.cant_p_caja && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-md">
                    P. venta unitario: ₲ {parseFloat(form.precio_venta || '0').toLocaleString('es-PY')}
                  </p>
                )}
              </>
            ) : (
              <>
                {/* UNIDAD / KG / L */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      P. compra (unidad) <span className="text-red-500">*</span>
                    </label>
                    <NumericFormat
                      value={form.precio_compra}
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={0}
                      allowNegative={false}
                      onValueChange={v => set('precio_compra', v.value)}
                      placeholder="₲ 0"
                      className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-green-500 ${errores.precio_compra ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
                      prefix="₲ "
                    />
                    {errores.precio_compra && <p className="text-xs text-red-500 mt-1">{errores.precio_compra}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">% Ganancia</label>
                    <input
                      type="number"
                      min="0"
                      value={form.ganancia}
                      onChange={e => set('ganancia', e.target.value)}
                      placeholder="Ej: 30"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    P. venta (unidad) <span className="text-red-500">*</span>
                  </label>
                  <NumericFormat
                    value={form.precio_venta}
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={0}
                    allowNegative={false}
                    onValueChange={v => set('precio_venta', v.value)}
                    placeholder="₲ 0"
                    className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-green-500 ${errores.precio_venta ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
                    prefix="₲ "
                  />
                  {errores.precio_venta && <p className="text-xs text-red-500 mt-1">{errores.precio_venta}</p>}
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── PASO 3: Stock y vencimiento ─── */}
        {paso === 3 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Stock y vencimiento</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cantidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.cantidad}
                  onChange={e => set('cantidad', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-green-500 ${errores.cantidad ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {errores.cantidad && <p className="text-xs text-red-500 mt-1">{errores.cantidad}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de vencimiento</label>
                <input
                  type="date"
                  value={form.fecha_vencimiento}
                  onChange={e => set('fecha_vencimiento', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Resumen del nuevo producto */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 space-y-1">
              <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-2">Resumen del producto nuevo</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-gray-700 dark:text-gray-300">
                <span className="text-gray-500 dark:text-gray-400">Nombre:</span>
                <span className="font-medium truncate">{form.nombre_producto}</span>
                <span className="text-gray-500 dark:text-gray-400">Unidad:</span>
                <span>{form.unidad_medida}</span>
                <span className="text-gray-500 dark:text-gray-400">IVA:</span>
                <span>{form.iva}%</span>
                {form.unidad_medida === 'CAJA' ? (
                  <>
                    <span className="text-gray-500 dark:text-gray-400">P. compra caja:</span>
                    <span>₲ {parseFloat(form.precio_compra_caja || '0').toLocaleString('es-PY')}</span>
                    <span className="text-gray-500 dark:text-gray-400">P. venta caja:</span>
                    <span>₲ {parseFloat(form.precio_venta_caja || '0').toLocaleString('es-PY')}</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500 dark:text-gray-400">P. compra:</span>
                    <span>₲ {parseFloat(form.precio_compra || '0').toLocaleString('es-PY')}</span>
                    <span className="text-gray-500 dark:text-gray-400">P. venta:</span>
                    <span>₲ {parseFloat(form.precio_venta || '0').toLocaleString('es-PY')}</span>
                  </>
                )}
                <span className="text-gray-500 dark:text-gray-400">N° lote:</span>
                <span>01 (auto)</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer con botones de navegación */}
      <div className="px-4 pb-4 flex justify-between gap-2 shrink-0">
        {paso > 1 ? (
          <button
            type="button"
            onClick={() => setPaso(p => p - 1)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaChevronLeft size={12} /> Anterior
          </button>
        ) : (
          <button
            type="button"
            onClick={onCancelar}
            className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaTimes size={12} /> Cancelar
          </button>
        )}

        {paso < 3 ? (
          <button
            type="button"
            onClick={handleSiguiente}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Siguiente <FaChevronRight size={12} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAgregar}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <FaCheck size={12} /> Agregar producto
          </button>
        )}
      </div>

      {/* Modal seleccionar categoría */}
      <ModalSeleccionarCategoria
        isOpen={showCategoriaModal}
        onClose={() => setShowCategoriaModal(false)}
        onSelect={(cat) => {
          setCategoriaSeleccionada(cat);
          set('idcategoria', String(cat.idcategoria));
          setShowCategoriaModal(false);
          setErrores(prev => ({ ...prev, idcategoria: '' }));
        }}
      />

      {/* Modal producto duplicado */}
      <ModalAdvert
        isOpen={modalDuplicadoOpen}
        onClose={() => setModalDuplicadoOpen(false)}
        message={
          productoDuplicado
            ? `Producto ya existe:\n\n• Nombre: ${productoDuplicado.nombre_producto}\n• Stock: ${productoDuplicado.stock ?? '-'}\n• P. compra: ₲ ${parseFloat(productoDuplicado.precio_compra || '0').toLocaleString('es-PY')}\n• P. venta: ₲ ${parseFloat(productoDuplicado.precio_venta || '0').toLocaleString('es-PY')}\n\nFavor seleccionalo directamente en "Seleccionar producto".`
            : ''
        }
        confirmButtonText="Entendido"
        onConfirm={() => setModalDuplicadoOpen(false)}
      />
    </div>
  );
};

export default FormCrearProductoInline;
