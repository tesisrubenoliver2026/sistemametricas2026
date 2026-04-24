import { useEffect, useState, type FC } from 'react';
import ModalAdvert from '../../../components/ModalAdvert';
import { NumericFormat } from 'react-number-format';
import { FaBox, FaBoxOpen, FaTrash, FaTag, FaHashtag, FaDollarSign, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import ModalSeleccionarAtributo from '../ModalsVenta/ModalSeleccionarAtributo';
import { getDetalles } from '../../../services/productoDetalle';
import type { DetalleProductoResponse } from '../../../services/productoDetalle';

interface Props {
  detalles: any[];
  setDetalles: (data: any[]) => void;
  setCantidadProducto?: (cantidad: number) => void;
  tipoDescuento: 'sin_descuento' | 'descuento_producto' | 'descuento_total';
}

const DetallesProductos: FC<Props> = ({ detalles, setDetalles, tipoDescuento }) => {
  const [advertMessage, setAdvertMessage] = useState<string>('');
  const [advertOpen, setAdvertOpen] = useState<boolean>(false);
  const [modalAtributoOpen, setModalAtributoOpen] = useState<boolean>(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [productosConDetalles, setProductosConDetalles] = useState<{ [key: number]: boolean }>({});

  const updateDetalle = (index: number, field: string, value: string | number) => {
    const updated = [...detalles];
    const detalleActual = updated[index];
    const cantidadMaxima = detalleActual.cantidadMaximo || Infinity;

    // Actualizar el campo
    updated[index][field] = value;

    //   Para productos CAJA: calcular total de unidades automáticamente
    if (updated[index].unidad_medida === 'CAJA') {
      const cajasVender = parseFloat(updated[index].cant_cajas_vender || '0');
      const unidadesSueltas = parseFloat(updated[index].cant_unidades_sueltas || '0');
      const cantPorCaja = parseFloat(updated[index].cant_p_caja || '0');

      // Calcular cantidad total de unidades
      const totalUnidades = (cajasVender * cantPorCaja) + unidadesSueltas;

      // Validar que no exceda el stock máximo disponible
      if (totalUnidades > cantidadMaxima && cantidadMaxima !== Infinity) {
        showAdvert(`  Stock insuficiente. Máximo disponible: ${cantidadMaxima} unidades (${Math.floor(cantidadMaxima / cantPorCaja)} cajas completas)`);

        // Revertir al valor anterior
        if (field === 'cant_cajas_vender') {
          const cajasMaximas = Math.floor(cantidadMaxima / cantPorCaja);
          updated[index].cant_cajas_vender = cajasMaximas;
          updated[index].cantidad = cajasMaximas * cantPorCaja;
        } else if (field === 'cant_unidades_sueltas') {
          updated[index].cant_unidades_sueltas = 0;
          updated[index].cantidad = cajasVender * cantPorCaja;
        }
        setDetalles(updated);
        return;
      }

      updated[index].cantidad = totalUnidades;
    } else {
      // Para productos NO CAJA: validar cantidad directamente
      if (field === 'cantidad') {
        const cantidadIngresada = parseFloat(value.toString());

        if (cantidadIngresada > cantidadMaxima && cantidadMaxima !== Infinity) {
          showAdvert(`  Stock insuficiente. Máximo disponible: ${cantidadMaxima} unidades`);
          updated[index].cantidad = cantidadMaxima;
          setDetalles(updated);
          return;
        }
      }
    }

    setDetalles(updated);
  };

  const handleSelectDetalle = (index: number, detalle: DetalleProductoResponse | null) => {
    const updated = [...detalles];
    updated[index].detalle_producto = detalle;
    setDetalles(updated);
  };

  const removeDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const openModalAtributo = (index: number) => {
    setSelectedProductIndex(index);
    setModalAtributoOpen(true);
  };

  const closeModalAtributo = () => {
    setModalAtributoOpen(false);
    setSelectedProductIndex(null);
  };

  // Verificar qué productos tienen detalles
  useEffect(() => {
    const checkDetalles = async () => {
      const detallesMap: { [key: number]: boolean } = {};

      for (const detalle of detalles) {
        if (detalle.idproducto && !detallesMap[detalle.idproducto]) {
          try {
            const response = await getDetalles(detalle.idproducto);
            detallesMap[detalle.idproducto] = response.detalles && response.detalles.length > 0;
          } catch (error) {
            detallesMap[detalle.idproducto] = false;
          }
        }
      }

      setProductosConDetalles(detallesMap);
    };

    if (detalles.length > 0) {
      checkDetalles();
    }
  }, [detalles.map(d => d.idproducto).join(',')]);

  useEffect(() => {
    if (tipoDescuento !== 'descuento_producto') {
      const detallesActualizados = detalles.map(detalle => ({
        ...detalle,
        descuento: 0
      }));
      setDetalles(detallesActualizados);
    }
  }, [tipoDescuento]);

  const showAdvert = (message: string) => {
    setAdvertMessage(message);
    setAdvertOpen(true);
  };

  //   Función para calcular el subtotal
  const calcularSubtotal = (d: any) => {
    if (d.unidad_medida === 'CAJA') {
      const cajasVender = parseFloat(d.cant_cajas_vender || '0');
      const unidadesSueltas = parseFloat(d.cant_unidades_sueltas || '0');
      const precioVentaCaja = parseFloat(d.precio_venta_caja || '0');
      const precioVentaUnitario = parseFloat(d.precio_venta || '0');
      const descuento = parseFloat(d.descuento || '0');

      const subtotal = (cajasVender * precioVentaCaja) + (unidadesSueltas * precioVentaUnitario) - descuento;
      return subtotal;
    } else {
      const cantidad = parseFloat(d.cantidad || '0');
      const precioVenta = parseFloat(d.precio_venta || '0');
      const descuento = parseFloat(d.descuento || '0');

      return (cantidad * precioVenta) - descuento;
    }
  };
  return (
    <div className="">
      {detalles.length === 0 ? (
        <div className="bg-blue-50 dark:bg-gray-800 rounded-2xl p-12 border-2 border-blue-200 dark:border-gray-700 shadow-md">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-blue-100 dark:bg-gray-700 p-6 rounded-full">
              <FaExclamationTriangle className="text-blue-500 dark:text-gray-400" size={48} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-700 dark:text-gray-200 mb-2">No hay productos agregados</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400">Utilizá el botón "Seleccionar producto" para agregar productos a la venta</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 dark:bg-gray-800 rounded-t-lg p-3 border-b-2 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 dark:bg-gray-700 p-2 rounded-lg">
                <FaBoxOpen className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Productos Seleccionados
                </h3>
                <div className="flex flex-row gap-3">
                  <p className="text-sm text-white/90 dark:text-gray-300 mt-1">
                    Productos en venta:
                  </p>
                  <span className="bg-white/30 dark:bg-gray-700 px-3 py-0.5 rounded-full text-sm font-bold text-white">
                    {detalles.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contenedor de productos */}
          <div className="bg-white dark:bg-gray-900 p-2">
            <div className="grid gap-4 w-full max-h-[400px] overflow-auto pr-2">
              {detalles.map((d, idx) => (
                <div
                  key={idx}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${d.unidad_medida === 'CAJA'
                    ? 'border-orange-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-gray-600'
                    : 'border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600'
                    }`}
                >
                  {/* Header */}
                  <div className={`p-4 ${d.unidad_medida === 'CAJA'
                    ? 'bg-orange-500 dark:bg-gray-700'
                    : 'bg-blue-500 dark:bg-gray-700'
                    } text-white`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-white/20 dark:bg-gray-600 p-2 rounded-lg flex-shrink-0">
                          {d.unidad_medida === 'CAJA' ? <FaBox size={20} /> : <FaBoxOpen size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-base truncate">
                            {d.nombre_producto}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-white/20 dark:bg-gray-600">
                              {d.unidad_medida === 'KG' ? 'Kg' : d.unidad_medida === 'L' ? 'L' : d.unidad_medida}
                            </span>
                            <span className={`text-xs font-mono ${d.idlote === -1 ? 'bg-green-500/30 dark:bg-gray-600 px-2 py-0.5 rounded font-semibold' : ''}`}>
                              Lote: {d.numero_lote || 'N/A'}
                              {d.idlote === -1 && <span className="ml-1 text-[10px]">(NUEVO)</span>}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeDetalle(idx)}
                        type='button'
                        className="bg-red-500 hover:bg-red-600 dark:bg-gray-600 dark:hover:bg-gray-500 p-2 rounded-lg transition-colors flex-shrink-0"
                        title="Eliminar producto"
                      >
                        <FaTrash className="text-white" size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Body del Card */}
                  <div className="p-4 w-full overflow-auto">
                    {/* Botón para Seleccionar Atributos */}
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={() => openModalAtributo(idx)}
                        disabled={!productosConDetalles[d.idproducto]}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border-2 rounded-lg transition-all font-semibold ${productosConDetalles[d.idproducto]
                          ? 'bg-purple-50 dark:bg-gray-700 border-purple-300 dark:border-gray-600 hover:bg-purple-100 dark:hover:bg-gray-600 hover:border-purple-400 dark:hover:border-gray-500 text-purple-900 dark:text-gray-200'
                          : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <FaTag size={14} className={productosConDetalles[d.idproducto] ? 'text-purple-600 dark:text-gray-400' : 'text-gray-400'} />
                          <span className="font-semibold">
                            Seleccionar Atributos
                            {d.detalle_producto && (
                              <span className="ml-2 font-bold text-purple-700 dark:text-gray-300">
                                ({d.detalle_producto.atributo}: {d.detalle_producto.valor})
                              </span>
                            )}
                          </span>
                        </div>
                        {productosConDetalles[d.idproducto] && d.detalle_producto && (
                          <span className="bg-purple-600 dark:bg-gray-600 text-white text-xs px-2.5 py-1 rounded-full">
                            ✓ Seleccionado
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Grid de campos - Layout diferente para CAJA vs otros productos */}
                    {d.unidad_medida === 'CAJA' ? (
                      // Layout para productos CAJA
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Cajas a Vender */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <FaBox size={12} className="text-orange-600 dark:text-gray-400" />
                            Cajas a Vender
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={d.cant_cajas_vender || 0}
                            onChange={(e) => updateDetalle(idx, "cant_cajas_vender", e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>

                        {/* Unidades Sueltas */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <FaHashtag size={12} className="text-blue-600 dark:text-gray-400" />
                            Unidades Sueltas
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            max={d.cant_p_caja - 1}
                            value={d.cant_unidades_sueltas || 0}
                            onChange={(e) => updateDetalle(idx, "cant_unidades_sueltas", e.target.value)}
                            onBlur={(e) => {
                              const valor = parseInt(e.target.value) || 0;
                              const maxSueltas = parseInt(d.cant_p_caja) - 1;

                              if (valor >= parseInt(d.cant_p_caja)) {
                                showAdvert(`Las unidades sueltas no pueden ser igual o mayor a ${d.cant_p_caja}. Si necesitas más, agrega otra caja completa.`);
                                updateDetalle(idx, "cant_unidades_sueltas", maxSueltas.toString());
                              }
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Unidades por Caja (info) */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Unid. x Caja
                          </label>
                          <div className="w-full px-3 py-2 text-sm bg-blue-50 dark:bg-gray-700 border-2 border-blue-200 dark:border-gray-600 rounded-lg font-bold text-blue-700 dark:text-gray-200 text-center">
                            {d.cant_p_caja}
                          </div>
                        </div>

                        {/* Total Unidades (calculado) */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Total Unidades
                          </label>
                          <div className="w-full px-3 py-2 text-sm bg-green-50 dark:bg-gray-700 border-2 border-green-200 dark:border-gray-600 rounded-lg font-bold text-green-700 dark:text-gray-200 text-center">
                            {d.cantidad || 0}
                          </div>
                        </div>

                        {/* Fecha Vencimiento */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <FaCalendarAlt size={12} className="text-gray-600 dark:text-gray-400" />
                            Fecha Vencimiento
                          </label>
                          <input
                            type="date"
                            value={d.fecha_vencimiento ? new Date(d.fecha_vencimiento).toISOString().split('T')[0] : ''}
                            onChange={e => updateDetalle(idx, 'fecha_vencimiento', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Precio Unitario */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <FaDollarSign size={12} className="text-green-600 dark:text-gray-400" />
                            Precio Unit.
                          </label>
                          <NumericFormat
                            value={d.precio_venta}
                            thousandSeparator="."
                            decimalSeparator=","
                            disabled={true}
                            decimalScale={0}
                            fixedDecimalScale={false}
                            allowNegative={false}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-300"
                            prefix="₲ "
                          />
                        </div>

                        {/* Precio por Caja */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <FaDollarSign size={12} className="text-orange-600 dark:text-gray-400" />
                            Precio x Caja
                          </label>
                          <NumericFormat
                            value={d.precio_venta_caja}
                            thousandSeparator="."
                            decimalSeparator=","
                            disabled={true}
                            decimalScale={0}
                            fixedDecimalScale={false}
                            allowNegative={false}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-300"
                            prefix="₲ "
                          />
                        </div>

                        {/* Descuento (condicional) */}
                        {tipoDescuento === "descuento_producto" && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Descuento
                            </label>
                            <NumericFormat
                              value={d.descuento}
                              thousandSeparator="."
                              decimalSeparator=","
                              decimalScale={0}
                              fixedDecimalScale={false}
                              allowNegative={false}
                              onValueChange={(values) => updateDetalle(idx, 'descuento', values.floatValue || 0)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              prefix="₲ "
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      // Layout para productos NO CAJA (UNIDAD, KG, L)
                      <div>
                        <div className="flex flex-row gap-3">
                          {/* Cantidad */}
                          <div>
                            <label className="block text-xs font-semibold text-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                              <FaHashtag size={12} className="text-blue-600 dark:text-gray-400" />
                              Cantidad
                            </label>
                            <input
                              type="number"
                              min={["KG", "L", "LITRO", "METROS", "M"].includes(d.unidad_medida?.toUpperCase?.()) || d.unidad_medida === "KG" || d.unidad_medida === "L" || d.unidad_medida === "LITRO" || d.unidad_medida === "METROS" || d.unidad_medida === "M" ? 0.1 : 1}
                              step={["KG", "L", "LITRO", "METROS", "M"].includes(d.unidad_medida?.toUpperCase?.()) || d.unidad_medida === "KG" || d.unidad_medida === "L" || d.unidad_medida === "LITRO" || d.unidad_medida === "METROS" || d.unidad_medida === "M" ? 0.1 : 1}
                              max={d.cantidadMaximo}
                              value={d.cantidad}
                              onChange={(e) => updateDetalle(idx, "cantidad", e.target.value)}
                              onBlur={(e) => {
                                const unidad = (d.unidad_medida || '').toString().toUpperCase();
                                const unidadEsDecimal = unidad === "KG" || unidad === "L" || unidad === "LITRO" || unidad === "METROS" || unidad === "M";
                                let valor = unidadEsDecimal ? parseFloat(e.target.value) : parseInt(e.target.value);
                                const min = unidadEsDecimal ? 0.1 : 1;
                                const max = parseFloat(d.cantidadMaximo);

                                if (isNaN(valor)) {
                                  showAdvert(`Debés ingresar una cantidad válida (mínimo ${min})`);
                                  valor = min;
                                }
                                if (valor < min) {
                                  showAdvert(`La cantidad mínima permitida es ${min}`);
                                  valor = min;
                                }
                                if (valor > max) {
                                  showAdvert(`La cantidad no puede superar el stock disponible (${max})`);
                                  valor = max;
                                }
                                updateDetalle(idx, "cantidad", valor);
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Fecha Vencimiento */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                              <FaCalendarAlt size={12} className="text-gray-600 dark:text-gray-400" />
                              Fecha Vencimiento
                            </label>
                            <input
                              type="date"
                              value={d.fecha_vencimiento ? new Date(d.fecha_vencimiento).toISOString().split('T')[0] : ''}
                              onChange={e => updateDetalle(idx, 'fecha_vencimiento', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Precio Venta */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                              <FaDollarSign size={12} className="text-green-600 dark:text-gray-400" />
                              Precio Venta
                            </label>
                            <NumericFormat
                              value={d.precio_venta}
                              thousandSeparator="."
                              decimalSeparator=","
                              disabled={true}
                              decimalScale={0}
                              fixedDecimalScale={false}
                              allowNegative={false}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-300 truncate"
                              prefix="₲ "
                            />
                          </div>


                        </div>
                        {/* Descuento (condicional) */}
                        {tipoDescuento === "descuento_producto" && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Descuento
                            </label>
                            <NumericFormat
                              value={d.descuento}
                              thousandSeparator="."
                              decimalSeparator=","
                              decimalScale={0}
                              fixedDecimalScale={false}
                              allowNegative={false}
                              onValueChange={(values) => updateDetalle(idx, 'descuento', values.floatValue || 0)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              prefix="₲ "
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer con Subtotal */}
                    <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Subtotal:</span>
                        <span className="text-xl font-bold text-green-600 dark:text-gray-200">
                          ₲ {calcularSubtotal(d).toLocaleString('es-PY')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ModalAdvert
        isOpen={advertOpen}
        onClose={() => setAdvertOpen(false)}
        message={advertMessage}
      />

      {/* Modal para Seleccionar Atributos */}
      {selectedProductIndex !== null && (
        <ModalSeleccionarAtributo
          isOpen={modalAtributoOpen}
          onClose={closeModalAtributo}
          idproducto={detalles[selectedProductIndex].idproducto}
          nombreProducto={detalles[selectedProductIndex].nombre_producto}
          detalleSeleccionado={detalles[selectedProductIndex].detalle_producto || null}
          onSelectDetalle={(detalle) => handleSelectDetalle(selectedProductIndex, detalle)}
        />
      )}
    </div>
  );
};

export default DetallesProductos;
