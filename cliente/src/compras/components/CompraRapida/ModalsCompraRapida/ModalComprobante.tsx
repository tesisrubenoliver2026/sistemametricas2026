'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

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

  // Determinar número de columnas para colspan
  const getColSpan = () => {
    if (tipoDescuento === "descuento_producto") {
      return 6; // Producto, Cantidad, Precio, Descuento, Total sin Descuento, Total con Descuento
    }
    return 4; // Producto, Cantidad, Precio, Total
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-opacity-30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircleIcon className="h-8 w-8" />
              <Dialog.Title as="h3" className="text-lg font-semibold leading-6">
                {`${isVenta ? "Venta realizada exitosamente" : "Compra registrada exitosamente"}`}
              </Dialog.Title>
            </div>

            <div className="mt-6 text-gray-700 text-sm space-y-2">
              <p><strong>Nro Factura:</strong> {datos.nro_factura}</p>
              <p><strong>Fecha:</strong> {datos.fecha}</p>
              <p><strong>Cantidad de Productos:</strong> {datos.cantidadProductos}</p>
            </div>

            {/* Tabla de Productos */}
            <div className="mt-6 overflow-x-auto max-h-64 rounded-lg border border-gray-200">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-gray-700">Producto</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Cantidad</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">
                      {`${!isVenta ? "Precio Compra" : "Precio Venta"}`}
                    </th>

                    {/* Columnas condicionales para descuento por producto */}
                    {tipoDescuento === "descuento_producto" && (
                      <th className="px-6 py-3 font-semibold text-gray-700">Descuento</th>
                    )}

                    <th className="px-6 py-3 font-semibold text-gray-700">
                      {tipoDescuento === "descuento_producto" ? "Total sin Descuento" : "Total"}
                    </th>

                    {tipoDescuento === "descuento_producto" && (
                      <th className="px-6 py-3 font-semibold text-gray-700">Total con Descuento</th>
                    )}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {productos.length === 0 ? (
                    <tr>
                      <td colSpan={getColSpan()} className="px-6 py-4 text-center text-gray-500">
                        No hay productos cargados
                      </td>
                    </tr>
                  ) : (
                    productos.map((p, index) => {
                      const priceFinally = isVenta ? p.precio_venta : p.precio_compra;
                      const precio = parseFloat(priceFinally) || 0;
                      const cantidad = parseFloat(p.cantidad) || 0;
                      const descuento = (parseFloat(p.descuento)) || 0;
                      const totalSinDescuento = precio * cantidad;
                      const totalConDescuento = totalSinDescuento - descuento;

                      return (
                        <tr key={index}>
                          <td className="px-6 py-4">{p.nombre_producto}</td>
                          <td className="px-6 py-4">{cantidad}</td>
                          <td className="px-6 py-4">{precio.toLocaleString("es-PY")} Gs</td>

                          {/* Mostrar descuento solo si es descuento por producto */}
                          {tipoDescuento === "descuento_producto" && (
                            <td className="px-6 py-4">{descuento.toLocaleString("es-PY")} Gs</td>
                          )}

                          {/* Total sin descuento o total normal */}
                          <td className="px-6 py-4">{totalSinDescuento.toLocaleString("es-PY")} Gs</td>

                          {/* Total con descuento solo si es descuento por producto */}
                          {tipoDescuento === "descuento_producto" && (
                            <td className="px-6 py-4 font-semibold">{totalConDescuento.toLocaleString("es-PY")} Gs</td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Total General */}
            <div className="mt-4 text-right pr-4 space-y-2">
              {tipoDescuento === "descuento_total" && montoTotalDescuento ? (
                // Cuando hay descuento total
                <>
                  <div className="text-lg font-semibold text-gray-800">
                    Total sin Descuento: {totalCompra.toLocaleString()} Gs
                  </div>
                  <div className="text-lg font-semibold text-red-600">
                    Monto Total de Descuento: {Number(montoTotalDescuento).toLocaleString()} Gs
                  </div>
                  <div className="text-xl font-bold text-green-600 border-t pt-2">
                    Total con Descuento: {(totalCompra - Number(montoTotalDescuento)).toLocaleString()} Gs
                  </div>
                </>
              ) : (
                // Cuando no hay descuento total
                <div className="text-lg font-semibold text-gray-800">
                  Total {`${isVenta ? "Venta" : "Compra"}`}: {totalCompra.toLocaleString()} Gs
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModalComprobante;